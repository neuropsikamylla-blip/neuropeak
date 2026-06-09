"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS, type Domain } from "@/types";
import { ALL_DOMAINS, DOMAIN_EXERCISES, DOMAIN_COUNTS, EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
import { metaOf } from "@/lib/exercise-meta";
import { DomainSelector, DOMAIN_ICONS } from "@/components/plano/DomainSelector";
import { DomainSidebar } from "@/components/plano/DomainSidebar";
import { ExerciseFilters, type TypeFilter } from "@/components/plano/ExerciseFilters";
import { ExerciseTable } from "@/components/plano/ExerciseTable";
import { PlanBuilderSidebar } from "@/components/plano/PlanBuilderSidebar";
import type { ExerciseInfo } from "@/components/plano/ExerciseRow";
import { parsePlanExercises, buildPlanExercises } from "@/lib/exercise-plan";
import { DEFAULT_SPAN_SETTINGS, type SpanSettings } from "@/components/exercises/memory/SpanNumerico";

const SPAN_IDS = ["span-numerico", "span-numerico-inverso"];
const exDef = (id: string) => EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS];

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

  // Fluxo de 2 etapas + estado da etapa de exercícios.
  const [step, setStep] = useState<"domains" | "exercises">("domains");
  const [activeDomain, setActiveDomain] = useState<Domain>("memory");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [query, setQuery] = useState("");

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
          setSelectedExercises([]);
        }
        // Níveis atuais de dificuldade de cada exercício (definidos pelo terapeuta ou pela progressão).
        const cfgs: { exerciseId: string; currentDifficulty: number }[] = data.patient?.exerciseConfigs ?? [];
        const levels: Record<string, number> = {};
        cfgs.forEach(c => { levels[c.exerciseId] = c.currentDifficulty; });
        setExerciseLevels(levels);
      })
      .catch(() => {
        setSelectedDomains(["memory", "attention"]);
        setSelectedExercises([]);
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
      }
      return [...prev, domain];
    });
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((e) => e !== exerciseId) : [...prev, exerciseId]
    );
  }

  function setSpanCfg<K extends keyof SpanSettings>(exId: string, key: K, value: SpanSettings[K]) {
    setExerciseSettings((prev) => ({
      ...prev,
      [exId]: { ...DEFAULT_SPAN_SETTINGS, ...(prev[exId] ?? {}), [key]: value },
    }));
  }

  function setLevel(exId: string, value: number) {
    setExerciseLevels((prev) => ({ ...prev, [exId]: value }));
  }

  function goToExercises() {
    const first = ALL_DOMAINS.find((d) => selectedDomains.includes(d)) ?? "memory";
    setActiveDomain(first);
    setStep("exercises");
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

  // Domínio em foco garantidamente válido (entre os selecionados).
  const activeSafe: Domain = selectedDomains.includes(activeDomain) ? activeDomain : (selectedDomains[0] ?? "memory");

  // Exercícios visíveis na tabela (do domínio em foco, filtrados por tipo + busca).
  const visibleExercises = useMemo<ExerciseInfo[]>(() => {
    const q = query.trim().toLowerCase();
    return (DOMAIN_EXERCISES[activeSafe] ?? [])
      .map((id) => exDef(id))
      .filter(Boolean)
      .filter((ex) => typeFilter === "todos" || metaOf(ex.id).type === typeFilter)
      .filter((ex) => !q || ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q))
      .map((ex) => ({ id: ex.id, name: ex.name, description: ex.description, estimatedMinutes: ex.estimatedMinutes, icon: ex.icon }));
  }, [activeSafe, typeFilter, query]);

  const addedIds = useMemo(() => new Set(selectedExercises), [selectedExercises]);
  const addedCounts = useMemo(() => {
    const m = Object.fromEntries(ALL_DOMAINS.map((d) => [d, 0])) as Record<Domain, number>;
    selectedExercises.forEach((id) => { const d = EXERCISE_DOMAIN[id]; if (d) m[d] += 1; });
    return m;
  }, [selectedExercises]);

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  // ── ETAPA 1 — seleção de domínios ──────────────────────────────────────────
  if (step === "domains") {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 max-w-3xl mx-auto w-full">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/pacientes/${patientId}`} aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plano de Treinamento</h1>
            <p className="text-sm text-gray-500">Etapa 1 de 2 — escolha os domínios</p>
          </div>
        </div>

        <DomainSelector selected={selectedDomains} onToggle={toggleDomain} counts={DOMAIN_COUNTS} />

        <div className="flex justify-end max-w-7xl mx-auto w-full">
          <Button onClick={goToExercises} disabled={selectedDomains.length === 0} className="gap-2">
            Avançar para exercícios <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── ETAPA 2 — seleção de exercícios (3 colunas) ────────────────────────────
  const Icon = DOMAIN_ICONS[activeSafe];
  const color = DOMAIN_COLORS[activeSafe];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setStep("domains")} aria-label="Voltar aos domínios">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plano de Treinamento</h1>
          <p className="text-sm text-gray-500">Etapa 2 de 2 — escolha os exercícios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 items-start">
        {/* Coluna 1 — domínios */}
        <DomainSidebar selected={selectedDomains} active={activeSafe} onFocus={setActiveDomain} addedCounts={addedCounts} />

        {/* Coluna 2 — área principal */}
        <div className="space-y-4 min-w-0">
          {/* Cabeçalho do domínio */}
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: `${color}14` }}>
              <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.9} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold" style={{ color }}>{DOMAIN_LABELS[activeSafe]}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color, backgroundColor: `${color}14` }}>
                  {DOMAIN_COUNTS[activeSafe]} exercícios
                </span>
              </div>
              <p className="text-sm text-gray-500">{DOMAIN_DESCRIPTIONS[activeSafe]}</p>
            </div>
          </div>

          <ExerciseFilters active={typeFilter} onChange={setTypeFilter} query={query} onQuery={setQuery} />
          <ExerciseTable exercises={visibleExercises} addedIds={addedIds} onToggle={toggleExercise} />
        </div>

        {/* Coluna 3 — plano em construção */}
        <div className="lg:sticky lg:top-6">
          <PlanBuilderSidebar
            selectedExercises={selectedExercises}
            exerciseLevels={exerciseLevels}
            exerciseSettings={exerciseSettings}
            onLevel={setLevel}
            onSpanCfg={setSpanCfg}
            onRemove={toggleExercise}
            sessionDuration={sessionDuration}
            frequency={frequency}
            onSessionDuration={setSessionDuration}
            onFrequency={setFrequency}
            onSave={handleSave}
            onVisualize={() => router.push(`/pacientes/${patientId}`)}
            saving={loading}
          />
        </div>
      </div>
    </div>
  );
}
