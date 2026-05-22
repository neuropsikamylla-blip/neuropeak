export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

// Vercel Cron: runs daily at 8h UTC — see vercel.json
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: plans } = await supabase
    .from('TrainingPlan')
    .select('patientId, frequency')
    .eq('isActive', true);

  if (!plans || plans.length === 0) return NextResponse.json({ checked: 0 });

  const patientIds = plans.map((p) => p.patientId);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentSessions } = await supabase
    .from('Session')
    .select('patientId, completedAt')
    .in('patientId', patientIds)
    .gte('completedAt', sevenDaysAgo);

  const sessionsByPatient: Record<string, number> = {};
  for (const s of recentSessions ?? []) {
    sessionsByPatient[s.patientId] = (sessionsByPatient[s.patientId] ?? 0) + 1;
  }

  // Existing unread missed-session alerts (avoid duplicates)
  const { data: existingAlerts } = await supabase
    .from('Alert')
    .select('patientId')
    .in('patientId', patientIds)
    .eq('type', 'MISSED_SESSION')
    .eq('isRead', false);

  const alreadyAlerted = new Set((existingAlerts ?? []).map((a) => a.patientId));

  const toInsert: Array<{
    id: string; patientId: string; type: string; message: string;
  }> = [];

  for (const plan of plans) {
    const sessionsThisWeek = sessionsByPatient[plan.patientId] ?? 0;
    const expected = plan.frequency ?? 3;

    if (sessionsThisWeek === 0 && !alreadyAlerted.has(plan.patientId)) {
      toInsert.push({
        id: randomUUID(),
        patientId: plan.patientId,
        type: "MISSED_SESSION",
        message: `Nenhuma sessão realizada nos últimos 7 dias (esperado: ${expected}x/semana).`,
      });
    }
  }

  if (toInsert.length > 0) {
    await supabase.from('Alert').insert(toInsert);
  }

  return NextResponse.json({ checked: plans.length, inserted: toInsert.length });
}
