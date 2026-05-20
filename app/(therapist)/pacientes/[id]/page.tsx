import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvolutionChart } from "@/components/charts/EvolutionChart";
import { DomainRadarChart } from "@/components/charts/DomainRadarChart";
import { calculateDomainScore, calculateAdherence } from "@/lib/scoring";
import { formatDate, formatDateTime, calculateAge, formatDuration } from "@/lib/utils";
import { ArrowLeft, FileText, Edit, Target, Calendar } from "lucide-react";
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

  const { data: patientBase } = await supabase
    .from('Patient')
    .select('*')
    .eq('id', id)
    .eq('therapistId', therapistId)
    .single();

  if (!patientBase) notFound();

  const [
    { data: sessionRows },
    { data: trainingPlans },
    { data: achievements },
    { data: alerts },
  ] = await Promise.all([
    supabase
      .from('Session')
      .select('*')
      .eq('patientId', id)
      .order('completedAt', { ascending: false })
      .limit(50),
    supabase
      .from('TrainingPlan')
      .select('*')
      .eq('patientId', id)
      .eq('isActive', true)
      .limit(1),
    supabase
      .from('Achievement')
      .select('*')
      .eq('patientId', id)
      .order('unlockedAt', { ascending: false }),
    supabase
      .from('Alert')
      .select('*')
      .eq('patientId', id)
      .order('createdAt', { ascending: false })
      .limit(5),
  ]);

  const patient = {
    ...patientBase,
    sessions: sessionRows ?? [],
    trainingPlans: trainingPlans ?? [],
    achievements: achievements ?? [],
    alerts: alerts ?? [],
  };

  const sessions = patient.sessions as SessionData[];
  const typedAchievements = patient.achievements as Array<{ id: string; icon: string; title: string; unlockedAt: string }>;
  const domainScores = calculateDomainScore(sessions);
  const age = calculateAge(patient.birthDate);
  const activePlan = patient.trainingPlans[0];
  const adherence = activePlan
    ? calculateAdherence(sessions, activePlan.frequency, new Date(patient.createdAt))
    : 0;

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
            <Link href="/pacientes"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{age} anos</Badge>
              {patient.diagnosis && <Badge variant="outline">{patient.diagnosis}</Badge>}
              <Badge variant="info">{patient.theme}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${patient.id}/plano`}>
              <Target className="w-4 h-4 mr-2" />
              Plano de Treino
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/relatorios?patientId=${patient.id}`}>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Link>
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Data de Nascimento</p>
          <p className="font-semibold text-gray-900">{formatDate(patient.birthDate)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total de Sessões</p>
          <p className="font-semibold text-gray-900">{sessions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Adesão</p>
          <p className={`font-semibold ${adherence >= 70 ? "text-green-600" : "text-orange-600"}`}>{adherence}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">PIN de Acesso</p>
          <p className="font-mono font-bold text-blue-600 tracking-widest">{patient.pin}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-gray-100">
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
                    <div key={ds.domain} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{DOMAIN_LABELS[ds.domain]}</span>
                      <span className={`font-bold text-sm ${ds.score >= 70 ? "text-green-600" : ds.score >= 50 ? "text-yellow-600" : "text-red-500"}`}>
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
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Sem dados suficientes ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {patient.therapeuticGoals && (
            <Card>
              <CardHeader><CardTitle className="text-base">Objetivos Terapêuticos</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">{patient.therapeuticGoals}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de Sessões</CardTitle></CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Nenhuma sessão realizada ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
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
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 text-gray-600">{formatDateTime(s.completedAt)}</td>
                          <td className="py-2 font-medium text-gray-800">{s.exerciseId}</td>
                          <td className="py-2">
                            <Badge variant="secondary" className="text-xs">{DOMAIN_LABELS[s.domain as Domain]}</Badge>
                          </td>
                          <td className="py-2 text-right font-bold text-blue-600">{Math.round(s.score)}</td>
                          <td className="py-2 text-right">{Math.round(s.accuracy * 100)}%</td>
                          <td className="py-2 text-right text-gray-500">{formatDuration(s.duration)}</td>
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
              { label: "Diagnóstico", value: patient.diagnosis },
              { label: "Escolaridade", value: patient.education },
              { label: "Contato", value: patient.contact },
              { label: "Responsável", value: patient.guardian },
            ].map(({ label, value }) => value && (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-gray-800 font-medium">{value}</p>
                </CardContent>
              </Card>
            ))}

            {patient.medications && (
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Medicamentos</p>
                  <p className="text-gray-800 whitespace-pre-line">{patient.medications}</p>
                </CardContent>
              </Card>
            )}

            {patient.clinicalNotes && (
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Notas Clínicas</p>
                  <p className="text-gray-800 whitespace-pre-line">{patient.clinicalNotes}</p>
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
                <p className="text-gray-500 text-sm text-center py-8">Nenhuma conquista ainda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {typedAchievements.map((a) => (
                    <div key={a.id} className="flex flex-col items-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                      <span className="text-3xl mb-2">{a.icon}</span>
                      <p className="font-semibold text-sm text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(a.unlockedAt)}</p>
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
