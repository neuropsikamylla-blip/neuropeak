import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PatientCard } from "@/components/dashboard/PatientCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { calculateAdherence, calculateTrend, calculateDomainScore } from "@/lib/scoring";
import { UserPlus } from "lucide-react";
import { startOfWeek } from "date-fns";
import type { PatientSummary, SessionData, Theme } from "@/types";

// PERF-02: o dashboard consome apenas as 20 sessões mais recentes de cada paciente
// (ver `.slice(0, 20)` abaixo). Esta linha de tipo descreve o retorno da query que
// já traz só esse top-20 POR paciente (window function), em vez do histórico inteiro
// de todos os pacientes — o volume transferido deixa de crescer sem limite.
type DashboardSession = {
  id: string;
  patientId: string;
  exerciseId: string;
  domain: string;
  score: number;
  accuracy: number;
  reactionTime: number | null;
  difficulty: number;
  duration: number;
  completedAt: Date;
  metadata: string | null;
};

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
    // PERF-02: top-20 sessões por paciente via window function — evita trazer o
    // histórico completo (que cresce sem limite). Equivale ao `.slice(0, 20)` usado
    // abaixo. patientIds vem do banco (ownership já filtrado) e é parametrizado.
    patientIds.length > 0
      ? prisma.$queryRaw<DashboardSession[]>`
          SELECT id, "patientId", "exerciseId", domain, score, accuracy, "reactionTime", difficulty, duration, "completedAt", metadata
          FROM (
            SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s."patientId" ORDER BY s."completedAt" DESC) AS rn
            FROM "Session" s
            WHERE s."patientId" IN (${Prisma.join(patientIds)})
          ) ranked
          WHERE rn <= 20
          ORDER BY "patientId", "completedAt" DESC
        `
      : ([] as DashboardSession[]),
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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#F4F7FB", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <p style={{ color: "#A8B3C7", fontSize: "0.875rem", marginTop: 2, fontWeight: 400 }}>
            Visão geral dos seus pacientes
          </p>
        </div>
        <DashboardActions />
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
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F4F7FB" }}>
              Pacientes
            </h2>
            <Link
              href="/pacientes"
              style={{ fontSize: "0.875rem", color: "#60A5FA", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
              className="hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {patientSummaries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1.5rem",
                  background: "#0D2547",
                  border: "1px solid rgba(148,163,184,0.14)",
                  borderRadius: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                <p style={{ color: "#A8B3C7", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
                  Nenhum paciente cadastrado ainda.
                </p>
                <Link
                  href="/pacientes/novo"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: "#2563EB", color: "white", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
                >
                  <UserPlus style={{ width: 16, height: 16 }} />
                  Adicionar Primeiro Paciente
                </Link>
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
