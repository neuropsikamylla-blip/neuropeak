"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, type Domain } from "@/types";
import { ExerciseScienceCard } from "@/components/exercises/ExerciseScienceCard";
import { parsePlanExercises, buildPlanExercises } from "@/lib/exercise-plan";
import { DEFAULT_SPAN_SETTINGS, type SpanSettings } from "@/components/exercises/memory/SpanNumerico";

const SPAN_IDS = ["span-numerico", "span-numerico-inverso"];

const ALL_DOMAINS: Domain[] = ["memory", "attention", "processing", "executive"];

const DOMAIN_EXERCISES: Record<Domain, string[]> = {
  memory: ["span-numerico", "span-numerico-inverso", "matriz-espacial", "matriz-espacial-inversa", "jogo-memoria", "desafio-supermercado", "desafio-supermercado-auditivo"],
  attention: ["trilha-visual", "antes-depois", "caca-item-barato", "atencao-seletiva", "atencao-sustentada", "mot", "dual-task", "focus-agents", "focus-agents-auditivo"],
  processing: ["tempo-reacao", "certo-ou-errado", "semaforo", "corrida-tempo"],
  executive: ["torre-hanoi", "labirinto", "stroop-task", "ordem-historia", "desafio-orcamento", "mudanca-regras", "compra-multifuncional", "task-switching", "deductive-grid"],
};

export default function PlanoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseSettings, setExerciseSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [exerciseLevels, setExerciseLevels] = useState<Record<string, number>>({});
  const [sessionDuration, setSessionDuration] = useState(30);
  const [frequency, setFrequency] = useState(3);

  useEffect(() => {
    fetch(`/api/patients/${patientId}?config=true`)
      .then(r => r.json())
      .then(data => {
        const plan = data.patient?.trainingPlans?.[0];
        if (plan) {
          const domains: Domain[] = typeof plan.domains === "string" ? JSON.parse(plan.domains) : plan.domains ?? [];
          const parsed = parsePlanExercises(plan.exercises);
          setSelectedDomains(domains);
          setSelectedExercises(parsed.map(e => e.id));
          const settings: Record<string, Record<string, unknown>> = {};
          parsed.forEach(e => { if (e.settings) settings[e.id] = e.settings; });
          setExerciseSettings(settings);
          setSessionDuration(plan.sessionDuration ?? 30);
          setFrequency(plan.frequency ?? 3);
        } else {
          setSelectedDomains(["memory", "attention"]);
          setSelectedExercises(["span-numerico", "stroop-task"]);
        }
        // Níveis atuais de dificuldade de cada exercício (definidos pelo terapeuta ou pela progressão).
        const cfgs: { exerciseId: string; currentDifficulty: number }[] = data.patient?.exerciseConfigs ?? [];
        const levels: Record<string, number> = {};
        cfgs.forEach(c => { levels[c.exerciseId] = c.currentDifficulty; });
        setExerciseLevels(levels);
      })
      .catch(() => {
        setSelectedDomains(["memory", "attention"]);
        setSelectedExercises(["span-numerico", "stroop-task"]);
      })
      .finally(() => setLoadingPlan(false));
  }, [patientId]);

  function toggleDomain(domain: Domain) {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        const next = prev.filter((d) => d !== domain);
        // Also remove exercises from this domain
        const domainExs = DOMAIN_EXERCISES[domain];
        setSelectedExercises((exs) => exs.filter((e) => !domainExs.includes(e)));
        return next;
      } else {
        return [...prev, domain];
      }
    });
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((e) => e !== exerciseId) : [...prev, exerciseId]
    );
  }

  // Config do terapeuta para os exercícios de Span (treino/avaliação, áudio, tentativas).
  const spanCfg = (exId: string): SpanSettings =>
    ({ ...DEFAULT_SPAN_SETTINGS, ...(exerciseSettings[exId] as Partial<SpanSettings> ?? {}) });
  function setSpanCfg<K extends keyof SpanSettings>(exId: string, key: K, value: SpanSettings[K]) {
    setExerciseSettings((prev) => ({
      ...prev,
      [exId]: { ...DEFAULT_SPAN_SETTINGS, ...(prev[exId] ?? {}), [key]: value },
    }));
  }

  async function handleSave() {
    if (selectedExercises.length === 0) {
      toast({ title: "Selecione ao menos um exercício", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingPlan: {
            domains: selectedDomains,
            exercises: buildPlanExercises(selectedExercises, exerciseSettings),
            sessionDuration,
            frequency,
          },
          // Nível inicial de cada exercício escolhido pelo terapeuta (Span gerencia o seu próprio nível).
          exerciseLevels: Object.fromEntries(
            selectedExercises
              .filter((exId) => !SPAN_IDS.includes(exId))
              .map((exId) => [exId, exerciseLevels[exId] ?? 1])
          ),
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar plano");

      toast({ title: "Plano salvo com sucesso!" });
      router.push(`/pacientes/${patientId}`);
    } catch {
      toast({ title: "Erro ao salvar plano", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${patientId}`} aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plano de Treinamento</h1>
          <p className="text-sm text-gray-500">Configure os exercícios do paciente</p>
        </div>
      </div>

      {/* Session settings */}
      <Card>
        <CardHeader><CardTitle className="text-base">Configurações de Sessão</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duração da sessão (min)</Label>
            <Input
              type="number"
              min={10}
              max={90}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Frequência (sessões/semana)</Label>
            <Input
              type="number"
              min={1}
              max={7}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Domains and exercises */}
      {ALL_DOMAINS.map((domain) => (
        <Card key={domain}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={domain}
                checked={selectedDomains.includes(domain)}
                onChange={() => toggleDomain(domain)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <CardTitle className="text-base">
                <label htmlFor={domain} className="cursor-pointer">
                  {DOMAIN_LABELS[domain]}
                </label>
              </CardTitle>
            </div>
          </CardHeader>
          {selectedDomains.includes(domain) && (
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {DOMAIN_EXERCISES[domain].map((exId) => {
                  const ex = EXERCISE_DEFINITIONS[exId as keyof typeof EXERCISE_DEFINITIONS];
                  if (!ex) return null;
                  return (
                    <div key={exId}>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedExercises.includes(exId)
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExercises.includes(exId)}
                          onChange={() => toggleExercise(exId)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-xl">{ex.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{ex.name}</p>
                          <p className="text-xs text-gray-500">{ex.description} · ~{ex.estimatedMinutes}min</p>
                        </div>
                      </label>
                      <ExerciseScienceCard exerciseId={exId} />

                      {/* Nível de dificuldade inicial — escolhido pelo terapeuta (1 a 10) */}
                      {selectedExercises.includes(exId) && !SPAN_IDS.includes(exId) && (
                        <div className="mt-2 ml-7 mr-1 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">🎚️ Nível inicial</span>
                            <span className="text-sm font-bold text-emerald-800 tabular-nums">
                              {exerciseLevels[exId] ?? 1} <span className="text-emerald-500/70 font-normal">/ 10</span>
                            </span>
                          </div>
                          <input
                            type="range" min={1} max={10} step={1}
                            value={exerciseLevels[exId] ?? 1}
                            onChange={(e) => setExerciseLevels((prev) => ({ ...prev, [exId]: Number(e.target.value) }))}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <p className="text-[10px] text-emerald-600/80 pt-1">
                            Começa neste nível e sobe/desce sozinho conforme o paciente acerta ou erra.
                          </p>
                        </div>
                      )}

                      {/* Config do terapeuta (Span) — fixa para o paciente */}
                      {SPAN_IDS.includes(exId) && selectedExercises.includes(exId) && (() => {
                        const c = spanCfg(exId);
                        const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
                          <button type="button" onClick={onClick}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              on ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300"}`}>
                            {children}
                          </button>
                        );
                        const CfgRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600">{label}</span>
                            <div className="flex gap-1.5">{children}</div>
                          </div>
                        );
                        return (
                          <div className="mt-2 ml-7 mr-1 p-3 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
                            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">⚙️ Configuração (fixa para o paciente)</p>
                            <CfgRow label="Modo">
                              <Pill on={c.showAnswerOnError} onClick={() => setSpanCfg(exId, "showAnswerOnError", true)}>Treino</Pill>
                              <Pill on={!c.showAnswerOnError} onClick={() => setSpanCfg(exId, "showAnswerOnError", false)}>Avaliação</Pill>
                            </CfgRow>
                            <CfgRow label="Tentativas">
                              {[10, 15, 20, 30].map(t => (
                                <Pill key={t} on={c.trials === t} onClick={() => setSpanCfg(exId, "trials", t)}>{t}</Pill>
                              ))}
                            </CfgRow>
                            <CfgRow label="Repetir áudio">
                              <Pill on={c.allowReplay} onClick={() => setSpanCfg(exId, "allowReplay", true)}>Sim</Pill>
                              <Pill on={!c.allowReplay} onClick={() => setSpanCfg(exId, "allowReplay", false)}>Não</Pill>
                            </CfgRow>
                            {c.allowReplay && (
                              <CfgRow label="Repetir custa pontos">
                                <Pill on={c.replayPenalty} onClick={() => setSpanCfg(exId, "replayPenalty", true)}>Sim</Pill>
                                <Pill on={!c.replayPenalty} onClick={() => setSpanCfg(exId, "replayPenalty", false)}>Não</Pill>
                              </CfgRow>
                            )}
                            <p className="text-[10px] text-indigo-500/80 pt-0.5">O nível é automático (o paciente retoma onde parou).</p>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {/* ── Desafio da Cidade — Ecossistema ────────────────────────────────── */}
      <div className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {/* Faixa decorativa lateral */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-400" />

        <div className="pl-5 pr-4 pt-4 pb-0">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="desafio-cidade-check"
              checked={selectedExercises.includes("desafio-cidade")}
              onChange={() => toggleExercise("desafio-cidade")}
              className="w-4 h-4 mt-0.5 text-amber-600 rounded accent-amber-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="desafio-cidade-check" className="cursor-pointer font-bold text-base text-amber-900">
                  🏙️ Desafio da Cidade
                </label>
                <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                  Ecossistema Urbano
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Ambiente urbano interativo com personagens, missões reais e imprevistos. Treina planejamento, memória de trabalho, flexibilidade cognitiva e tomada de decisão dentro de um único ecossistema.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                {["Planejamento", "Memória", "Flexibilidade", "Tomada de decisão", "Controle inibitório"].map(tag => (
                  <span key={tag} className="text-[10px] bg-white/70 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedExercises.includes("desafio-cidade") && (
          <div className="px-4 pb-4">
            <ExerciseScienceCard exerciseId="desafio-cidade" />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/pacientes/${patientId}`}>Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Plano
        </Button>
      </div>
    </div>
  );
}
