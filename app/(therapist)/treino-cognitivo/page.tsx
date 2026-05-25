import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, Target, TrendingUp, TrendingDown, Minus, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAdherence } from "@/lib/scoring";
import { DOMAIN_LABELS } from "@/types";
import type { SessionData, Domain } from "@/types";

export const dynamic = "force-dynamic";

export default async function TreinoCognitivoPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const { data: patientRows } = await supabase
    .from("Patient")
    .select("id, name, theme, createdAt")
    .eq("therapistId", therapistId)
    .order("name");

  const patientList = patientRows ?? [];
  const patientIds = patientList.map((p) => p.id);

  if (patientIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treino Cognitivo</h1>
            <p className="text-sm text-gray-500">Planos de treino para prática em casa</p>
          </div>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum paciente cadastrado ainda.</p>
          <Button asChild className="mt-4">
            <Link href="/pacientes/novo">Cadastrar paciente</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [{ data: allSessions }, { data: allPlans }] = await Promise.all([
    supabase
      .from("Session")
      .select("patientId, completedAt, score, domain, accuracy, duration")
      .in("patientId", patientIds)
      .order("completedAt", { ascending: false }),
    supabase
      .from("TrainingPlan")
      .select("*")
      .in("patientId", patientIds)
      .eq("isActive", true),
  ]);

  const rows = patientList.map((p) => {
    const sessions = ((allSessions ?? []).filter((s) => s.patientId === p.id) as unknown as SessionData[]);
    const plan = (allPlans ?? []).find((t) => t.patientId === p.id);
    const adherence = plan
      ? calculateAdherence(sessions, plan.frequency, new Date(p.createdAt))
      : null;
    const lastSession = sessions[0] ?? null;

    const recentSessions = sessions.slice(0, 20);
    const olderSessions = sessions.slice(20, 40);
    const recentAvg = recentSessions.length
      ? recentSessions.reduce((a, s) => a + s.score, 0) / recentSessions.length
      : null;
    const olderAvg = olderSessions.length
      ? olderSessions.reduce((a, s) => a + s.score, 0) / olderSessions.length
      : null;
    const trend =
      recentAvg !== null && olderAvg !== null
        ? recentAvg - olderAvg > 3 ? "up" : recentAvg - olderAvg < -3 ? "down" : "stable"
        : "stable";

    const domains: string[] = plan?.domains ? JSON.parse(plan.domains) : [];

    return { p, plan, adherence, lastSession, trend, sessions: sessions.length, domains };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treino Cognitivo</h1>
            <p className="text-sm text-gray-500">Planos de treino para prática em casa — {patientList.length} paciente{patientList.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(({ p, plan, adherence, lastSession, trend, sessions, domains }) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between gap-4">
              {/* Patient info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  {plan ? (
                    <Badge variant="secondary" className="text-xs">Plano ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">Sem plano</Badge>
                  )}
                </div>

                {/* Domains */}
                {domains.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {domains.map((d) => (
                      <span key={d} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {DOMAIN_LABELS[d as Domain] ?? d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {plan && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {plan.sessionDuration} min · {plan.frequency}×/sem
                    </span>
                  )}
                  <span>{sessions} sessão{sessions !== 1 ? "ões" : ""}</span>
                  {lastSession && (
                    <span>
                      Último treino: {new Date(lastSession.completedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {/* Adherence + trend */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {adherence !== null && (
                  <div className="text-right">
                    <p className={`text-lg font-bold ${adherence >= 70 ? "text-green-600" : adherence >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                      {adherence}%
                    </p>
                    <p className="text-xs text-gray-400">aderência</p>
                  </div>
                )}
                {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                {trend === "stable" && sessions > 0 && <Minus className="w-4 h-4 text-gray-400" />}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/pacientes/${p.id}/plano`}>
                    {plan ? <><Target className="w-3.5 h-3.5 mr-1" />Editar plano</> : <><Plus className="w-3.5 h-3.5 mr-1" />Criar plano</>}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
