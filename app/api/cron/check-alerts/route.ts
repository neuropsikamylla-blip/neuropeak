export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withApiHandler } from "@/lib/api-handler";

export const GET = withApiHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.trainingPlan.findMany({
    where: { isActive: true },
    select: { patientId: true, frequency: true },
  });

  if (plans.length === 0) return NextResponse.json({ checked: 0 });

  const patientIds = plans.map((p) => p.patientId);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentSessions = await prisma.session.findMany({
    where: { patientId: { in: patientIds }, completedAt: { gte: sevenDaysAgo } },
    select: { patientId: true, completedAt: true },
  });

  const sessionsByPatient: Record<string, number> = {};
  for (const s of recentSessions) {
    sessionsByPatient[s.patientId] = (sessionsByPatient[s.patientId] ?? 0) + 1;
  }

  const existingAlerts = await prisma.alert.findMany({
    where: { patientId: { in: patientIds }, type: "MISSED_SESSION", isRead: false },
    select: { patientId: true },
  });

  const alreadyAlerted = new Set(existingAlerts.map((a) => a.patientId));

  const toInsert: Array<{ patientId: string; type: string; message: string }> = [];

  for (const plan of plans) {
    const sessionsThisWeek = sessionsByPatient[plan.patientId] ?? 0;
    const expected = plan.frequency ?? 3;

    if (sessionsThisWeek === 0 && !alreadyAlerted.has(plan.patientId)) {
      toInsert.push({
        patientId: plan.patientId,
        type: "MISSED_SESSION",
        message: `Nenhuma sessão realizada nos últimos 7 dias (esperado: ${expected}x/semana).`,
      });
    }
  }

  if (toInsert.length > 0) {
    await prisma.alert.createMany({ data: toInsert });
  }

  return NextResponse.json({ checked: plans.length, inserted: toInsert.length });
});
