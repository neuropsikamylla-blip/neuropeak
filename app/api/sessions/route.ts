export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { calculateNewDifficulty, calculateDualTaskProgression, calculateProgression, checkAchievements } from "@/lib/adaptive";
import type { SessionData } from "@/types";
import { withApiHandler } from "@/lib/api-handler";

const sessionSchema = z.object({
  patientId: z.string(),
  exerciseId: z.string(),
  domain: z.string(),
  score: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(1),
  reactionTime: z.number().optional(),
  difficulty: z.number().min(1).max(10),
  duration: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id?: string; role?: string; patientId?: string };

  const body = await req.json();
  const result = sessionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const data = result.data;

  if (user.role === "PATIENT" && user.patientId !== data.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Isolamento multi-tenant: terapeuta só grava sessões de pacientes seus.
  if (user.role === "THERAPIST") {
    const owns = await prisma.patient.findFirst({
      where: { id: data.patientId, therapistId: user.id },
      select: { id: true },
    });
    if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Dupla Tarefa: progressão clínica própria (exige as duas tarefas boas para subir,
  // mantém "nível consolidado"). Calculada antes de gravar para enriquecer o metadata.
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  let dualProg: ReturnType<typeof calculateDualTaskProgression> | null = null;
  let genericProg: ReturnType<typeof calculateProgression> | null = null;
  if (
    data.exerciseId === "dual-task" &&
    typeof meta.accTop === "number" && typeof meta.accBottom === "number" && typeof meta.accTotal === "number"
  ) {
    const lastDual = await prisma.session.findFirst({
      where: { patientId: data.patientId, exerciseId: "dual-task" },
      orderBy: { completedAt: "desc" },
      select: { metadata: true },
    });
    let prevConsolidated = 1;
    try {
      const pm = lastDual?.metadata ? JSON.parse(lastDual.metadata) : null;
      if (pm && typeof pm.consolidatedLevel === "number") prevConsolidated = pm.consolidatedLevel;
    } catch { /* metadata antigo sem consolidado */ }
    dualProg = calculateDualTaskProgression(
      data.difficulty,
      {
        accTop: meta.accTop as number, accBottom: meta.accBottom as number, accTotal: meta.accTotal as number,
        fpTop: Number(meta.fpTop ?? 0), fpBottom: Number(meta.fpBottom ?? 0),
        omTop: Number(meta.omTop ?? 0), omBottom: Number(meta.omBottom ?? 0),
      },
      prevConsolidated,
    );
    meta.endedLevel = dualProg.nextLevel;
    meta.consolidatedLevel = dualProg.consolidatedLevel;
    meta.progressionAction = dualProg.action;
    meta.progressionReason = dualProg.reason;
  } else if (meta.progressionV2 === true && typeof meta.accTotal === "number") {
    // Exercícios novos: engine de progressão clínica genérica + nível consolidado.
    const lastSess = await prisma.session.findFirst({
      where: { patientId: data.patientId, exerciseId: data.exerciseId },
      orderBy: { completedAt: "desc" },
      select: { metadata: true },
    });
    let prevConsolidated = 1;
    try {
      const pm = lastSess?.metadata ? JSON.parse(lastSess.metadata) : null;
      if (pm && typeof pm.consolidatedLevel === "number") prevConsolidated = pm.consolidatedLevel;
    } catch { /* metadata antigo */ }
    genericProg = calculateProgression(
      data.difficulty,
      {
        accTotal: meta.accTotal as number,
        dims: Array.isArray(meta.dims) ? (meta.dims as number[]) : undefined,
        impulsive: meta.impulsive === true,
      },
      prevConsolidated,
    );
    meta.endedLevel = genericProg.nextLevel;
    meta.consolidatedLevel = genericProg.consolidatedLevel;
    meta.progressionAction = genericProg.action;
    meta.progressionReason = genericProg.reason;
  }

  const newSession = await prisma.session.create({
    data: {
      patientId: data.patientId,
      exerciseId: data.exerciseId,
      domain: data.domain,
      score: data.score,
      accuracy: data.accuracy,
      reactionTime: data.reactionTime ?? null,
      difficulty: data.difficulty,
      duration: data.duration,
      metadata: Object.keys(meta).length ? JSON.stringify(meta) : null,
    },
  });

  const recentSessions = await prisma.session.findMany({
    where: { patientId: data.patientId },
    orderBy: { completedAt: "desc" },
    take: 20,
    select: { exerciseId: true, domain: true, score: true, accuracy: true, reactionTime: true, difficulty: true, duration: true, completedAt: true },
  });

  const adaptiveResult = dualProg
    ? { newDifficulty: dualProg.nextLevel, action: dualProg.action, reason: dualProg.reason }
    : genericProg
    ? { newDifficulty: genericProg.nextLevel, action: genericProg.action, reason: genericProg.reason }
    : calculateNewDifficulty(
        data.difficulty,
        recentSessions as unknown as SessionData[],
        data.exerciseId,
      );

  await prisma.exerciseConfig.upsert({
    where: { patientId_exerciseId: { patientId: data.patientId, exerciseId: data.exerciseId } },
    create: {
      patientId: data.patientId,
      exerciseId: data.exerciseId,
      currentDifficulty: adaptiveResult.newDifficulty,
      totalAttempts: 1,
      lastAttemptAt: new Date(),
    },
    update: {
      currentDifficulty: adaptiveResult.newDifficulty,
      totalAttempts: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });

  const existingAchievements = await prisma.achievement.findMany({
    where: { patientId: data.patientId },
    select: { type: true },
  });

  const newAchievements = checkAchievements(
    recentSessions as unknown as SessionData[],
    existingAchievements.map((a) => a.type)
  );

  if (newAchievements.length > 0) {
    await prisma.achievement.createMany({
      data: newAchievements.map((a) => ({
        patientId: data.patientId,
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.icon,
      })),
    });
  }

  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = recentSessions.filter((s) => new Date(s.completedAt) >= lastWeek).length;

  if (recentCount === 0) {
    await prisma.alert.deleteMany({
      where: { patientId: data.patientId, type: "MISSED_SESSION", isRead: false },
    });
  }

  if (recentSessions.length >= 5) {
    const last5 = recentSessions.slice(0, 5);
    const prev5 = recentSessions.slice(5, 10);
    if (prev5.length >= 5) {
      const avgLast = last5.reduce((s, r) => s + r.score, 0) / 5;
      const avgPrev = prev5.reduce((s, r) => s + r.score, 0) / 5;
      if (avgPrev - avgLast > 15) {
        await prisma.alert.create({
          data: {
            patientId: data.patientId,
            type: "PERFORMANCE_DROP",
            message: `Queda de desempenho detectada no exercício ${data.exerciseId} (−${Math.round(avgPrev - avgLast)} pontos)`,
          },
        });
      }
    }
  }

  const activePlan = await prisma.trainingPlan.findFirst({
    where: { patientId: data.patientId, isActive: true },
    select: { id: true, frequency: true, createdAt: true },
  });

  if (activePlan) {
    const cycleTarget = activePlan.frequency * 4;
    const sessionCount = await prisma.session.count({
      where: { patientId: data.patientId, completedAt: { gte: activePlan.createdAt } },
    });

    if (sessionCount >= cycleTarget) {
      const existingCycleAlert = await prisma.alert.findFirst({
        where: {
          patientId: data.patientId,
          type: "CYCLE_COMPLETE",
          createdAt: { gte: activePlan.createdAt },
        },
      });

      if (!existingCycleAlert) {
        const patientInfo = await prisma.patient.findUnique({
          where: { id: data.patientId },
          select: { name: true },
        });
        await prisma.alert.create({
          data: {
            patientId: data.patientId,
            type: "CYCLE_COMPLETE",
            message: `Ciclo de ${cycleTarget} sessões concluído por ${patientInfo?.name ?? "paciente"}! Revise o desempenho e configure um novo ciclo de treino.`,
          },
        });
      }
    }
  }

  return NextResponse.json({ session: newSession, adaptive: adaptiveResult, newAchievements }, { status: 201 });
});
