import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvolutionChart } from "@/components/charts/EvolutionChart";
import { DomainRadarChart } from "@/components/charts/DomainRadarChart";
import { calculateDomainScore, calculateAdherence } from "@/lib/scoring";
import { DistributionChart } from "@/components/plano/DistributionChart";
import { parsePlanExercises } from "@/lib/exercise-plan";
import { summarizeStoryTrail } from "@/lib/story-trail-report";
import { ALL_DOMAINS, EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
import { formatDate, formatDateTime, calculateAge, formatDuration } from "@/lib/utils";
import { ArrowLeft, FileText, Target, Globe, Pencil } from "lucide-react";
import { PatientCredentials } from "@/components/patient/PatientCredentials";
import { DeletePatientButton } from "@/components/patient/DeletePatientButton";
import type { SessionData, Domain } from "@/types";
import { DOMAIN_LABELS } from "@/types";
import { format, subDays } from "date-fns";

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const patientBase = await prisma.patient.findFirst({ where: { id, therapistId } });

  if (!patientBase) notFound();

  const [sessionRows, trainingPlans, achievements, alerts] = await Promise.all([
    prisma.session.findMany({ where: { patientId: id }, orderBy: { completedAt: "desc" }, take: 50 }),
    prisma.trainingPlan.findMany({ where: { patientId: id, isActive: true }, take: 1 }),
    prisma.achievement.findMany({ where: { patientId: id }, orderBy: { unlockedAt: "desc" } }),
    prisma.alert.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const patient = {
    ...patientBase,
    sessions: sessionRows,
    trainingPlans,
    achievements,
    alerts,
  };

  // Sessões abandonadas (incompletas) não entram nas métricas globais.
  const isAbandoned = (s: { metadata?: string | null }) => {
    try { return (JSON.parse(s.metadata || "{}") as { abandoned?: boolean }).abandoned === true; } catch { return false; }
  };
  const sessions = sessionRows.filter((s) => !isAbandoned(s)) as unknown as SessionData[];
  const trail = summarizeStoryTrail(sessionRows);   // resumo da trilha (separa as incompletas)
  const typedAchievements = patient.achievements as unknown as Array<{ id: string; icon: string; title: string; unlockedAt: string }>;
  const domainScores = calculateDomainScore(sessions);
  const age = calculateAge(patient.birthDate);
  const activePlan = patient.trainingPlans[0];
  const adherence = activePlan
    ? calculateAdherence(sessions, activePlan.frequency, new Date(patient.createdAt))
    : 0;

  // Distribuição dos exercícios prescritos por domínio (do plano ativo).
  const planExerciseIds = activePlan ? parsePlanExercises(activePlan.exercises).map((e) => e.id) : [];
  const planDistribution = Object.fromEntries(ALL_DOMAINS.map((d) => [d, 0])) as Record<Domain, number>;
  planExerciseIds.forEach((id) => { const d = EXERCISE_DOMAIN[id]; if (d) planDistribution[d] += 1; });

  // Build evolution chart data (last 30 days)
  const last30 = sessions.filter(
    (s) => new Date(s.completedAt) >= subDays(new Date(), 30)
  );
  const byDay: Record<string, Record<string, number[]>> = {};
  for (const s of last30) {
    const day = format(new Date(s.completedAt), "yyyy-MM-dd");
    if (!byDay[day]) byDay[day] = {};
    if (!byDay[day][s.domain]) byDay[day][s.domain] = [];
    byDay[day][s.domain].push(s.score);
  }
  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, domains]) => ({
      date,
      ...Object.fromEntries(
        Object.entries(domains).map(([d, scores]) => [d, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)])
      ),
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pacientes" aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{patient.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{age} anos</Badge>
              <Badge variant="info">{patient.theme}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pacientes/${patient.id}/editar`}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pacientes/${patient.id}/plano`}>
              <Target className="w-4 h-4 mr-2" />
              Plano de Treino
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/relatorios?patientId=${patient.id}`}>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/pacientes/${patient.id}/mundo-interior`}>
              <Globe className="w-4 h-4 mr-2" />
              Mundo Interior
            </Link>
          </Button>
          <DeletePatientButton patientId={patient.id} patientName={patient.name} />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-400">Data de Nascimento</p>
          <p className="font-semibold text-slate-100">{formatDate(patient.birthDate)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-400">Total de Sessões</p>
          <p className="font-semibold text-slate-100">{sessions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-slate-400">Adesão</p>
          <p className={`font-semibold ${adherence >= 70 ? "text-green-400" : "text-orange-300"}`}>{adherence}%</p>
        </CardContent></Card>
        <PatientCredentials patientId={patient.id} patientCode={patient.patientCode} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="clinical">Dados Clínicos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Desempenho por Domínio</CardTitle></CardHeader>
              <CardContent>
                <DomainRadarChart scores={domainScores} height={260} />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {domainScores.map((ds) => (
                    <div key={ds.domain} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-slate-300">{DOMAIN_LABELS[ds.domain]}</span>
                      <span className={`font-bold text-sm ${ds.score >= 70 ? "text-green-400" : ds.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {ds.score}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Evolução (últimos 30 dias)</CardTitle></CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <EvolutionChart data={chartData} height={300} />
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    Sem dados suficientes ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {trail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  📖 Ordem da História — Trilha
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    trail.trend === "subiu" ? "bg-green-500/15 text-green-400"
                    : trail.trend === "regrediu" ? "bg-red-500/15 text-red-400"
                    : "bg-slate-500/15 text-slate-300"}`}>
                    {trail.trend === "subiu" ? "▲ avançou" : trail.trend === "regrediu" ? "▼ regrediu" : "■ manteve"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-white/5 rounded-lg">
                    <p className="text-[11px] text-slate-400">Estágio atual</p>
                    <p className="text-sm font-bold text-slate-100">{trail.stageLabel}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg">
                    <p className="text-[11px] text-slate-400">Acerto (recente)</p>
                    <p className={`text-sm font-bold ${trail.recentAccuracy >= 0.8 ? "text-green-400" : trail.recentAccuracy >= 0.6 ? "text-yellow-400" : "text-red-400"}`}>
                      {Math.round(trail.recentAccuracy * 100)}%
                    </p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg">
                    <p className="text-[11px] text-slate-400">Tempo médio</p>
                    <p className="text-sm font-bold text-slate-100">{trail.meanTimeS}s</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg">
                    <p className="text-[11px] text-slate-400">Dicas / tentativas</p>
                    <p className="text-sm font-bold text-slate-100">{trail.hintsTotal} / {trail.retriesTotal}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {trail.totalSessions} sessões concluídas{trail.abandoned > 0 && <span className="text-amber-400"> · {trail.abandoned} incompletas</span>}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  {(["ordem", "intruso", "falta"] as const).map((m) => trail.byMode[m].n > 0 && (
                    <span key={m} className="px-2 py-1 rounded-md bg-white/5 text-slate-300">
                      {m === "ordem" ? "Ordenar" : m === "intruso" ? "Intruso" : "Descubra"}: {Math.round(trail.byMode[m].acc * 100)}% ({trail.byMode[m].n})
                    </span>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-400/20">
                  <p className="text-[11px] font-bold text-blue-300 mb-0.5">Próximo desafio recomendado</p>
                  <p className="text-xs text-slate-200">{trail.nextChallenge}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-1">Observações automáticas</p>
                  <ul className="space-y-1">
                    {trail.observations.map((o, i) => (
                      <li key={i} className="text-xs text-slate-200 flex gap-1.5"><span className="text-slate-500">•</span>{o}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {planExerciseIds.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Distribuição do Plano de Treino</CardTitle></CardHeader>
              <CardContent>
                <DistributionChart counts={planDistribution} />
                <p className="text-xs text-slate-400 mt-3">
                  {planExerciseIds.length} exercício{planExerciseIds.length !== 1 ? "s" : ""} no plano ativo.
                </p>
              </CardContent>
            </Card>
          )}

          {patient.therapeuticGoals && (
            <Card>
              <CardHeader><CardTitle className="text-base">Objetivos do Programa</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm">{patient.therapeuticGoals}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de Sessões</CardTitle></CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhuma sessão realizada ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-slate-400">
                        <th className="text-left pb-2">Data</th>
                        <th className="text-left pb-2">Exercício</th>
                        <th className="text-left pb-2">Domínio</th>
                        <th className="text-right pb-2">Pontuação</th>
                        <th className="text-right pb-2">Precisão</th>
                        <th className="text-right pb-2">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 20).map((s, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 text-slate-300">{formatDateTime(s.completedAt)}</td>
                          <td className="py-2 font-medium text-slate-100">{s.exerciseId}</td>
                          <td className="py-2">
                            <Badge variant="secondary" className="text-xs">{DOMAIN_LABELS[s.domain as Domain]}</Badge>
                          </td>
                          <td className="py-2 text-right font-bold text-blue-300">{Math.round(s.score)}</td>
                          <td className="py-2 text-right">{Math.round(s.accuracy * 100)}%</td>
                          <td className="py-2 text-right text-slate-400">{formatDuration(s.duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "CID", value: patient.cid },
              { label: "Hipótese de trabalho", value: patient.diagnosis },
              { label: "Escolaridade", value: patient.education },
              { label: "Contato", value: patient.contact },
              { label: "Responsável", value: patient.guardian },
            ].map(({ label, value }) => value && (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-slate-100 font-medium">{value}</p>
                </CardContent>
              </Card>
            ))}

            {patient.medications && (
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 mb-1">Medicamentos</p>
                  <p className="text-slate-100 whitespace-pre-line">{patient.medications}</p>
                </CardContent>
              </Card>
            )}

            {patient.clinicalNotes && (
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 mb-1">Notas Clínicas</p>
                  <p className="text-slate-100 whitespace-pre-line">{patient.clinicalNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Conquistas Desbloqueadas</CardTitle></CardHeader>
            <CardContent>
              {typedAchievements.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhuma conquista ainda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {typedAchievements.map((a) => (
                    <div key={a.id} className="flex flex-col items-center p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl text-center">
                      <span className="text-3xl mb-2">{a.icon}</span>
                      <p className="font-semibold text-sm text-slate-100">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(a.unlockedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
