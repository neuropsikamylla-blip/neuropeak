"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react";
import Link from "next/link";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS, type Domain } from "@/types";
import { DOMAIN_SUBDOMAINS, DOMAIN_EXERCISES, DOMAIN_COUNTS, EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
import { metaOf } from "@/lib/exercise-meta";
import { DOMAIN_ICONS } from "@/components/plano/DomainSelector";
import { DomainTabs } from "@/components/plano/DomainTabs";
import { SubdomainTabs } from "@/components/plano/SubdomainTabs";
import { ExerciseSearch, type DifficultyFilter } from "@/components/plano/ExerciseSearch";
import { ExerciseTable } from "@/components/plano/ExerciseTable";
import { PlanBuilderSidebar } from "@/components/plano/PlanBuilderSidebar";
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
  const [patientName, setPatientName] = useState("");
  const [hasPlan, setHasPlan] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseSettings, setExerciseSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [exerciseLevels, setExerciseLevels] = useState<Record<string, number>>({});
  const [sessionDuration, setSessionDuration] = useState(30);
  const [frequency, setFrequency] = useState(3);

  const [activeDomain, setActiveDomain] = useState<Domain>("memory");
  const [activeSubdomain, setActiveSubdomain] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("todas");

  useEffect(() => {
    fetch(`/api/patients/${patientId}?config=true`)
      .then(r => r.json())
      .then(data => {
        setPatientName(data.patient?.name ?? "");
        const plan = data.patient?.trainingPlans?.[0];
        if (plan) {
          setHasPlan(true);
          const parsed = parsePlanExercises(plan.exercises);
          setSelectedExercises(parsed.map(e => e.id).filter((id) => id !== "desafio-cidade"));
          const settings: Record<string, Record<string, unknown>> = {};
          parsed.forEach(e => { if (e.settings) settings[e.id] = e.settings; });
          setExerciseSettings(settings);
          setSessionDuration(plan.sessionDuration ?? 30);
          setFrequency(plan.frequency ?? 3);
        }
        const cfgs: { exerciseId: string; currentDifficulty: number }[] = data.patient?.exerciseConfigs ?? [];
        const levels: Record<string, number> = {};
        cfgs.forEach(c => { levels[c.exerciseId] = c.currentDifficulty; });
        setExerciseLevels(levels);
      })
      .catch(() => {})
      .finally(() => setLoadingPlan(false));
  }, [patientId]);

  function toggleExercise(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((e) => e !== exerciseId) : [...prev, exerciseId]
    );
  }

  // Reordena um exercício dentro do seu domínio (setas ↑↓ no painel).
  function moveExercise(id: string, dir: -1 | 1) {
    setSelectedExercises((prev) => {
      const dom = EXERCISE_DOMAIN[id];
      const same = prev.filter((x) => EXERCISE_DOMAIN[x] === dom);
      const idx = same.indexOf(id);
      const swap = idx + dir;
      if (swap < 0 || swap >= same.length) return prev;
      [same[idx], same[swap]] = [same[swap], same[idx]];
      let k = 0;
      return prev.map((x) => (EXERCISE_DOMAIN[x] === dom ? same[k++] : x));
    });
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

  function selectDomain(domain: Domain) {
    setActiveDomain(domain);
    setActiveSubdomain(null);
  }

  async function handleSave() {
    if (selectedExercises.length === 0) {
      toast({ title: "Adicione ao menos um exercício", variant: "destructive" });
      return;
    }
    // Domínios são inferidos dos exercícios escolhidos.
    const domains = Array.from(new Set(selectedExercises.map((id) => EXERCISE_DOMAIN[id]).filter(Boolean)));
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingPlan: {
            domains,
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

  const addedIds = useMemo(() => new Set(selectedExercises), [selectedExercises]);

  const visibleExercises = useMemo(() => {
    const subs = DOMAIN_SUBDOMAINS[activeDomain];
    const ids = activeSubdomain
      ? (subs.find((s) => s.id === activeSubdomain)?.exercises ?? [])
      : DOMAIN_EXERCISES[activeDomain];
    const q = query.trim().toLowerCase();
    return ids
      .map((id) => exDef(id))
      .filter(Boolean)
      .filter((ex) => difficulty === "todas" || metaOf(ex.id).difficulty === difficulty)
      .filter((ex) => !q || ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q))
      .map((ex) => ({ id: ex.id, name: ex.name, description: ex.description, estimatedMinutes: ex.estimatedMinutes, icon: ex.icon }));
  }, [activeDomain, activeSubdomain, query, difficulty]);

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
      </div>
    );
  }

  const Icon = DOMAIN_ICONS[activeDomain];
  const color = DOMAIN_COLORS[activeDomain];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/pacientes/${patientId}`} aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Montar plano de treino</h1>
            <p className="text-sm text-slate-400">
              {patientName || "Paciente"}{hasPlan && <span className="text-emerald-400"> · Plano ativo</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/pacientes/${patientId}`)} className="gap-2">
            <Eye className="w-4 h-4" /> Ver plano completo
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar plano
          </Button>
        </div>
      </div>

      {/* Abas de domínio */}
      <DomainTabs active={activeDomain} onSelect={selectDomain} counts={DOMAIN_COUNTS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Área central */}
        <div className="space-y-4 min-w-0">
          {/* Cabeçalho do domínio */}
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: `${color}14` }}>
              <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold" style={{ color }}>{DOMAIN_LABELS[activeDomain]}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color, backgroundColor: `${color}14` }}>
                  {DOMAIN_COUNTS[activeDomain]} exercícios
                </span>
              </div>
              <p className="text-sm text-slate-400">{DOMAIN_DESCRIPTIONS[activeDomain]}</p>
            </div>
          </div>

          {/* Subdomínios + busca */}
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Subdomínios</p>
              <SubdomainTabs subdomains={DOMAIN_SUBDOMAINS[activeDomain]} active={activeSubdomain} onSelect={setActiveSubdomain} />
            </div>
            <ExerciseSearch query={query} onQuery={setQuery} difficulty={difficulty} onDifficulty={setDifficulty} />
          </div>

          <ExerciseTable exercises={visibleExercises} addedIds={addedIds} onToggle={toggleExercise} />
        </div>

        {/* Painel direito */}
        <div className="lg:sticky lg:top-6">
          <PlanBuilderSidebar
            selectedExercises={selectedExercises}
            exerciseLevels={exerciseLevels}
            exerciseSettings={exerciseSettings}
            onLevel={setLevel}
            onSpanCfg={setSpanCfg}
            onRemove={toggleExercise}
            onMove={moveExercise}
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
