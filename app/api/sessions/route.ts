export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { randomUUID } from "crypto";
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
  const { data: newSession, error: sessionError } = await supabase
    .from('Session')
    .insert({
      id: randomUUID(),
      patientId: data.patientId,
      exerciseId: data.exerciseId,
      domain: data.domain,
      score: data.score,
      accuracy: data.accuracy,
      reactionTime: data.reactionTime ?? null,
      difficulty: data.difficulty,
      duration: data.duration,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .select()
    .single();

  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 });

  // Fetch recent sessions for adaptive difficulty
  const { data: recentSessions } = await supabase
    .from('Session')
    .select('exerciseId, domain, score, accuracy, reactionTime, difficulty, duration, completedAt')
    .eq('patientId', data.patientId)
    .order('completedAt', { ascending: false })
    .limit(20);

  // Update adaptive difficulty
  const adaptiveResult = calculateNewDifficulty(
    data.difficulty,
    (recentSessions ?? []) as SessionData[],
    data.exerciseId
  );

  // Upsert exercise config (check if exists first)
  const { data: existingConfig } = await supabase
    .from('ExerciseConfig')
    .select('id, totalAttempts')
    .eq('patientId', data.patientId)
    .eq('exerciseId', data.exerciseId)
    .single();

  if (existingConfig) {
    await supabase
      .from('ExerciseConfig')
      .update({
        currentDifficulty: adaptiveResult.newDifficulty,
        totalAttempts: (existingConfig.totalAttempts ?? 0) + 1,
        lastAttemptAt: new Date().toISOString(),
      })
      .eq('patientId', data.patientId)
      .eq('exerciseId', data.exerciseId);
  } else {
    await supabase
      .from('ExerciseConfig')
      .insert({
        id: randomUUID(),
        patientId: data.patientId,
        exerciseId: data.exerciseId,
        currentDifficulty: adaptiveResult.newDifficulty,
        totalAttempts: 1,
        lastAttemptAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  }

  // Check for new achievements
  const { data: existingAchievements } = await supabase
    .from('Achievement')
    .select('type')
    .eq('patientId', data.patientId);

  const newAchievements = checkAchievements(
    (recentSessions ?? []) as SessionData[],
    (existingAchievements ?? []).map((a) => a.type)
  );

  if (newAchievements.length > 0) {
    await supabase
      .from('Achievement')
      .insert(
        newAchievements.map((a) => ({
          id: randomUUID(),
          patientId: data.patientId,
          type: a.type,
          title: a.title,
          description: a.description,
          icon: a.icon,
        }))
      );
  }

  // Check alerts
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = (recentSessions ?? []).filter(
    (s) => new Date(s.completedAt) >= lastWeek
  ).length;

  if (recentCount === 0) {
    // First session after a week - remove MISSED_SESSION alerts for this exercise
    await supabase
      .from('Alert')
      .delete()
      .eq('patientId', data.patientId)
      .eq('type', 'MISSED_SESSION')
      .eq('isRead', false);
  }

  // Check performance drop
  const sessionList = recentSessions ?? [];
  if (sessionList.length >= 5) {
    const last5 = sessionList.slice(0, 5);
    const prev5 = sessionList.slice(5, 10);
    if (prev5.length >= 5) {
      const avgLast = last5.reduce((s, r) => s + r.score, 0) / 5;
      const avgPrev = prev5.reduce((s, r) => s + r.score, 0) / 5;
      if (avgPrev - avgLast > 15) {
        await supabase
          .from('Alert')
          .insert({
            id: randomUUID(),
            patientId: data.patientId,
            type: "PERFORMANCE_DROP",
            message: `Queda de desempenho detectada no exercício ${data.exerciseId} (−${Math.round(avgPrev - avgLast)} pontos)`,
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
