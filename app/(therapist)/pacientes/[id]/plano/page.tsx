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

// ── Modalidade de cada exercício (padrão: visual) ────────────────────────────
type Modality = "visual" | "auditivo" | "ambos";
const MODALITY: Record<string, Modality> = {
  "span-numerico": "auditivo",
  "span-numerico-inverso": "auditivo",
  "desafio-supermercado-auditivo": "auditivo",
  "focus-agents-auditivo": "auditivo",
  "antes-depois": "ambos",
};
const modOf = (id: string): Modality => MODALITY[id] ?? "visual";
const MOD_LABEL: Record<Modality, string> = { visual: "👁️ Visual", auditivo: "🎧 Auditivo", ambos: "👁️🎧 Visual + Auditivo" };
const MOD_BADGE: Record<Modality, string> = { visual: "👁️", auditivo: "🎧", ambos: "👁️🎧" };

// ── Hierarquia: Domínio → Subárea → Exercícios ───────────────────────────────
const DOMAIN_SUBAREAS: Record<Domain, { subarea: string; exercises: string[] }[]> = {
  memory: [
    { subarea: "Memória de trabalho", exercises: ["span-numerico", "span-numerico-inverso"] },
    { subarea: "Memória visuoespacial", exercises: ["matriz-espacial", "matriz-espacial-inversa"] },
    { subarea: "Memória do cotidiano", exercises: ["jogo-memoria", "desafio-supermercado", "desafio-supermercado-auditivo"] },
  ],
  attention: [
    { subarea: "Atenção seletiva", exercises: ["trilha-visual", "caca-item-barato", "atencao-seletiva"] },
    { subarea: "Atenção sustentada", exercises: ["atencao-sustentada"] },
    { subarea: "Atenção alternada / dividida", exercises: ["dual-task"] },
    { subarea: "Rastreamento atencional", exercises: ["mot", "focus-agents", "focus-agents-auditivo"] },
    { subarea: "Sequência temporal", exercises: ["antes-depois"] },
  ],
  processing: [
    { subarea: "Tempo de reação", exercises: ["tempo-reacao", "semaforo"] },
    { subarea: "Decisão rápida", exercises: ["certo-ou-errado", "corrida-tempo"] },
  ],
  executive: [
    { subarea: "Planejamento", exercises: ["torre-hanoi", "labirinto"] },
    { subarea: "Controle inibitório", exercises: ["stroop-task"] },
    { subarea: "Flexibilidade cognitiva", exercises: ["mudanca-regras", "task-switching"] },
    { subarea: "Raciocínio lógico", exercises: ["deductive-grid", "ordem-historia"] },
    { subarea: "Cognição funcional", exercises: ["desafio-orcamento", "compra-multifuncional"] },
  ],
};
const DOMAIN_EXERCISES: Record<Domain, string[]> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d, DOMAIN_SUBAREAS[d].flatMap((s) => s.exercises)])
) as Record<Domain, string[]>;

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
  const [modalityFilter, setModalityFilter] = useState<"todos" | Modality>("todos");
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
          // Desafio da Cidade saiu dos exercícios (vai para o Mundo Interior).
          setSelectedExercises(parsed.map(e => e.id).filter((id) => id !== "desafio-cidade"));
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

  // Config do terapeuta para os exercícios de Span (mostrar resposta, áudio, tentativas).
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

  // Renderiza um exercício (checkbox + nível + config Span). É uma FUNÇÃO (não um
  // componente aninhado) para o slider de nível não remontar/perder foco ao arrastar.
  const renderExerciseRow = (exId: string) => {
    const ex = EXERCISE_DEFINITIONS[exId as keyof typeof EXERCISE_DEFINITIONS];
    if (!ex) return null;
    const mod = modOf(exId);
    const selected = selectedExercises.includes(exId);
    return (
      <div key={exId}>
        <label
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            selected ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleExercise(exId)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-xl">{ex.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-medium text-sm text-gray-800">{ex.name}</p>
              <span
                title={MOD_LABEL[mod]}
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  mod === "auditivo" ? "bg-amber-100 text-amber-700"
                  : mod === "ambos" ? "bg-violet-100 text-violet-700"
                  : "bg-sky-100 text-sky-700"
                }`}
              >
                {MOD_BADGE[mod]}
              </span>
            </div>
            <p className="text-xs text-gray-500">{ex.description} · ~{ex.estimatedMinutes}min</p>
          </div>
        </label>
        <ExerciseScienceCard exerciseId={exId} />

        {/* Nível de dificuldade inicial — escolhido pelo terapeuta (1 a 10) */}
        {selected && !SPAN_IDS.includes(exId) && (
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
        {SPAN_IDS.includes(exId) && selected && (() => {
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
              <CfgRow label="Mostrar resposta ao errar">
                <Pill on={c.showAnswerOnError} onClick={() => setSpanCfg(exId, "showAnswerOnError", true)}>Sim</Pill>
                <Pill on={!c.showAnswerOnError} onClick={() => setSpanCfg(exId, "showAnswerOnError", false)}>Não</Pill>
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
            <Input type="number" min={10} max={90} value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Frequência (sessões/semana)</Label>
            <Input type="number" min={1} max={7} value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Filtro por modalidade */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 mr-1">Modalidade:</span>
            {([["todos", "Todos"], ["visual", "👁️ Visual"], ["auditivo", "🎧 Auditivo"], ["ambos", "👁️🎧 Ambos"]] as const).map(([val, lab]) => (
              <button key={val} type="button" onClick={() => setModalityFilter(val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  modalityFilter === val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
                }`}>
                {lab}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domínios → Subáreas → Exercícios */}
      {ALL_DOMAINS.map((domain) => {
        const subareas = DOMAIN_SUBAREAS[domain]
          .map((sa) => ({ ...sa, exercises: sa.exercises.filter((id) => modalityFilter === "todos" || modOf(id) === modalityFilter) }))
          .filter((sa) => sa.exercises.length > 0);
        return (
          <Card key={domain}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id={domain}
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                  className="w-4 h-4 text-blue-600 rounded" />
                <CardTitle className="text-base">
                  <label htmlFor={domain} className="cursor-pointer">{DOMAIN_LABELS[domain]}</label>
                </CardTitle>
              </div>
            </CardHeader>
            {selectedDomains.includes(domain) && (
              <CardContent className="space-y-4">
                {subareas.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum exercício desta modalidade neste domínio.</p>
                ) : (
                  subareas.map((sa) => (
                    <div key={sa.subarea}>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 pl-1">{sa.subarea}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {sa.exercises.map((exId) => renderExerciseRow(exId))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Desafio da Cidade — reservado para a área do Mundo Interior (a desenvolver). */}

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
