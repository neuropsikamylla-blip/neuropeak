export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { withApiHandler } from "@/lib/api-handler";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  birthDate: z.string().optional(),
  education: z.string().optional(),
  contact: z.string().optional(),
  guardian: z.string().optional(),
  cid: z.string().optional(),
  diagnosis: z.string().optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]).optional(),
  clinicalNotes: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  medications: z.string().optional(),
  trainingPlan: z.object({
    domains: z.array(z.string()),
    // Aceita id simples (string) ou { id, settings } com a config do terapeuta.
    exercises: z.array(z.union([
      z.string(),
      z.object({ id: z.string(), settings: z.record(z.unknown()).optional() }),
    ])),
    sessionDuration: z.number().min(5).max(120),
    frequency: z.number().min(1).max(7),
  }).optional(),
  // Níveis de dificuldade definidos pelo terapeuta (exerciseId -> 1..10) → upsert em ExerciseConfig.
  exerciseLevels: z.record(z.number().int().min(1).max(10)).optional(),
});

export const GET = withApiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { role?: string; id?: string; patientId?: string };
  const isTherapist = user.role === "THERAPIST";
  const isPatient = user.role === "PATIENT" && user.patientId === id;

  if (!isTherapist && !isPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const includeConfig = req.nextUrl.searchParams.get("config") === "true";

  // Paciente recebe apenas os campos que o app de treino consome —
  // nunca dados clínicos (diagnosis, clinicalNotes, medications...).
  if (isPatient) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        birthDate: true,
        theme: true,
        exerciseConfigs: includeConfig,
        // Só o plano ativo (config dos exercícios) — sem dados clínicos.
        trainingPlans: {
          where: { isActive: true },
          take: 1,
          select: { exercises: true },
        },
      },
    });
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Focus Agentes — nível salvo POR MODO (progressão automática): pega o nextLevel
    // da sessão mais recente de cada modo.
    const focusLevels: Record<string, number> = {};
    if (includeConfig) {
      const focusSessions = await prisma.session.findMany({
        where: { patientId: id, exerciseId: { in: ["focus-agents", "focus-agents-auditivo"] } },
        orderBy: { completedAt: "desc" }, take: 30, select: { metadata: true },
      });
      for (const s of focusSessions) {
        try {
          const m = JSON.parse(s.metadata || "{}") as { mode?: string; nextLevel?: number; endedLevel?: number };
          const nl = m.nextLevel ?? m.endedLevel;
          if (m.mode && typeof nl === "number" && focusLevels[m.mode] === undefined) focusLevels[m.mode] = nl;
        } catch { /* metadata antigo */ }
      }
    }
    return NextResponse.json({ patient, focusLevels });
  }

  // Terapeuta dono recebe o registro completo.
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      trainingPlans: {
        where: { isActive: true },
        take: 1,
      },
      sessions: {
        orderBy: { completedAt: "desc" },
        take: 50,
      },
      exerciseConfigs: includeConfig,
    },
  });

  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (patient.therapistId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ patient });
});

export const PATCH = withApiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const existing = await prisma.patient.findFirst({
    where: { id, therapistId },
    select: { id: true },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { trainingPlan, exerciseLevels, ...patientUpdates } = result.data;

  if (Object.keys(patientUpdates).length > 0) {
    const data: Record<string, unknown> = { ...patientUpdates };
    if (patientUpdates.birthDate) data.birthDate = new Date(patientUpdates.birthDate);
    await prisma.patient.update({ where: { id }, data });
  }

  if (trainingPlan) {
    // Transação: desativar planos antigos e criar o novo juntos — evita paciente sem plano ativo.
    await prisma.$transaction([
      prisma.trainingPlan.updateMany({
        where: { patientId: id },
        data: { isActive: false },
      }),
      prisma.trainingPlan.create({
        data: {
          patientId: id,
          domains: JSON.stringify(trainingPlan.domains),
          exercises: JSON.stringify(trainingPlan.exercises),
          sessionDuration: trainingPlan.sessionDuration,
          frequency: trainingPlan.frequency,
          isActive: true,
        },
      }),
    ]);
  }

  // Níveis escolhidos pelo terapeuta → grava como dificuldade atual de cada exercício.
  // A partir daí a progressão automática (lib/adaptive.ts) continua a ajustar sozinha.
  if (exerciseLevels && Object.keys(exerciseLevels).length > 0) {
    await prisma.$transaction(
      Object.entries(exerciseLevels).map(([exerciseId, level]) =>
        prisma.exerciseConfig.upsert({
          where: { patientId_exerciseId: { patientId: id, exerciseId } },
          update: { currentDifficulty: level },
          create: { patientId: id, exerciseId, currentDifficulty: level },
        })
      )
    );
  }

  return NextResponse.json({ success: true });
});

export const DELETE = withApiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  void req;
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  await prisma.patient.deleteMany({ where: { id, therapistId } });

  return NextResponse.json({ success: true });
});
