import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PatientCard } from "@/components/dashboard/PatientCard";
import { calculateAdherence, calculateTrend, calculateDomainScore } from "@/lib/scoring";
import { UserPlus, Search } from "lucide-react";
import type { PatientSummary, SessionData, Theme } from "@/types";

export default async function PacientesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const patients = await prisma.patient.findMany({
    where: { therapistId },
    include: {
      sessions: { orderBy: { completedAt: "desc" }, take: 30 },
      alerts: { where: { isRead: false } },
      trainingPlans: { where: { isActive: true }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm">{patients.length} paciente{patients.length !== 1 ? "s" : ""} cadastrado{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      {patientSummaries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-2">Nenhum paciente cadastrado</h3>
          <p className="text-gray-500 text-sm mb-4">Adicione seu primeiro paciente para começar.</p>
          <Button asChild>
            <Link href="/pacientes/novo">Adicionar Paciente</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {patientSummaries.map((p, i) => (
            <PatientCard key={p.id} patient={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
