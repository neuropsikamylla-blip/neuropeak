export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { calculateNewDifficulty, checkAchievements } from "@/lib/adaptive";
import type { SessionData } from "@/types";

const sessionSchema = z.object({
  patientId: z.string(),
  exerciseId: z.string(),
  domain: z.string(),
  score: z.number(),
  accuracy: z.number().min(0).max(1),
  reactionTime: z.number().optional(),
  difficulty: z.number().min(1).max(10),
  duration: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { role?: string; patientId?: string };

  const body = await req.json();
  const result = sessionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const data = result.data;

  // Verify the patient belongs to this session
  if (user.role === "PATIENT" && user.patientId !== data.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create session
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
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });

  // Fetch recent sessions for adaptive difficulty
  const recentSessions = await prisma.session.findMany({
    where: { patientId: data.patientId },
    orderBy: { completedAt: "desc" },
    take: 20,
    select: {
      exerciseId: true,
      domain: true,
      score: true,
      accuracy: true,
      reactionTime: true,
      difficulty: true,
      duration: true,
      completedAt: true,
    },
  });

  // Update adaptive difficulty
  const adaptiveResult = calculateNewDifficulty(
    data.difficulty,
    recentSessions as SessionData[],
    data.exerciseId
  );

  await prisma.exerciseConfig.upsert({
    where: {
      patientId_exerciseId: { patientId: data.patientId, exerciseId: data.exerciseId },
    },
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

  // Check for new achievements
  const existingAchievements = await prisma.achievement.findMany({
    where: { patientId: data.patientId },
    select: { type: true },
  });

  const newAchievements = checkAchievements(
    recentSessions as SessionData[],
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

  // Check alerts
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = recentSessions.filter(
    (s) => new Date(s.completedAt) >= lastWeek
  ).length;

  if (recentCount === 0) {
    // First session after a week - remove MISSED_SESSION alerts for this exercise
    await prisma.alert.deleteMany({
      where: {
        patientId: data.patientId,
        type: "MISSED_SESSION",
        isRead: false,
      },
    });
  }

  // Check performance drop
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

  return NextResponse.json({
    session: newSession,
    adaptive: adaptiveResult,
    newAchievements,
  }, { status: 201 });
}
