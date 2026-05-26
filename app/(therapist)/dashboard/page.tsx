import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PatientCard } from "@/components/dashboard/PatientCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { calculateAdherence, calculateTrend, calculateDomainScore } from "@/lib/scoring";
import { UserPlus, FileText } from "lucide-react";
import { startOfWeek } from "date-fns";
import type { PatientSummary, SessionData, Theme } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const patientList = await prisma.patient.findMany({
    where: { therapistId },
    orderBy: { createdAt: "desc" },
  });

  const patientIds = patientList.map((p) => p.id);

  const [allSessions, allAlertRows, allTrainingPlans] = await Promise.all([
    patientIds.length > 0
      ? prisma.session.findMany({ where: { patientId: { in: patientIds } }, orderBy: { completedAt: "desc" } })
      : [],
    patientIds.length > 0
      ? prisma.alert.findMany({ where: { patientId: { in: patientIds }, isRead: false } })
      : [],
    patientIds.length > 0
      ? prisma.trainingPlan.findMany({ where: { patientId: { in: patientIds }, isActive: true } })
      : [],
  ]);

  const patients = patientList.map((p) => ({
    ...p,
    sessions: allSessions.filter((s) => s.patientId === p.id).slice(0, 20),
    alerts: allAlertRows.filter((a) => a.patientId === p.id),
    trainingPlans: allTrainingPlans.filter((t) => t.patientId === p.id).slice(0, 1),
  }));

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const sessionsThisWeek = patientIds.length > 0
    ? await prisma.session.count({ where: { patientId: { in: patientIds }, completedAt: { gte: weekStart } } })
    : 0;

  const alertRows = allAlertRows;
  const allAlerts = alertRows.map((a) => ({
    ...a,
    patient: patientList.find((p) => p.id === a.patientId) ?? { name: '' },
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  const patientSummaries: PatientSummary[] = patients.map((p) => {
    const sessions = p.sessions as SessionData[];
    const lastSession = sessions.length > 0 ? new Date(sessions[0].completedAt) : null;
    const activePlan = p.trainingPlans[0];
    const adherence = activePlan
      ? calculateAdherence(sessions, activePlan.frequency, new Date(p.createdAt))
      : 0;
    const trend = calculateTrend(sessions);
    const domainScores = calculateDomainScore(sessions);

    return {
      id: p.id,
      name: p.name,
      lastSession,
      adherence,
      trend,
      alertCount: p.alerts.length,
      domainScores,
      theme: p.theme as Theme,
    };
  });

  const avgAdherence =
    patientSummaries.length > 0
      ? Math.round(patientSummaries.reduce((s, p) => s + p.adherence, 0) / patientSummaries.length)
      : 0;

  const alertsForPanel = allAlerts.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    patientName: a.patient.name,
    type: a.type as "MISSED_SESSION" | "PERFORMANCE_DROP" | "GOAL_REACHED",
    message: a.message,
    isRead: a.isRead,
    createdAt: new Date(a.createdAt),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Visão geral dos seus pacientes
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/relatorios">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pacientes/novo">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsOverview
        totalPatients={patients.length}
        sessionsThisWeek={sessionsThisWeek}
        pendingAlerts={allAlerts.length}
        avgAdherence={avgAdherence}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pacientes</h2>
            <Link href="/pacientes" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {patientSummaries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 mb-3">Nenhum paciente cadastrado ainda.</p>
                <Button asChild>
                  <Link href="/pacientes/novo">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Paciente
                  </Link>
                </Button>
              </div>
            ) : (
              patientSummaries.slice(0, 8).map((p, i) => (
                <PatientCard key={p.id} patient={p} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <AlertsPanel alerts={alertsForPanel} />
        </div>
      </div>
    </div>
  );
}
