"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Save, Eye, ClipboardList } from "lucide-react";
import { EXERCISE_DEFINITIONS, DOMAIN_COLORS, DOMAIN_LABELS } from "@/types";
import { ALL_DOMAINS, EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
import type { SpanSettings } from "@/components/exercises/memory/SpanNumerico";
import type { PlanPresentation } from "@/lib/prescription/presentation";
import type { ProtocolName } from "@/lib/prescription/types";
import { ExerciseCard } from "./ExerciseCard";
import { PrescriptionSummary } from "./prescription/PrescriptionSummary";
import { toggleOpenExercise } from "@/lib/panel-preference";

const SPAN_IDS = ["span-numerico", "span-numerico-inverso"];
const exDef = (id: string) => EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS];

interface PlanBuilderSidebarProps {
  selectedExercises: string[];
  // Mantidos no contrato para preservar o caminho de dados do nível adaptativo;
  // a prescrição rotineira não o exibe nem o persiste.
  exerciseLevels: Record<string, number>;
  exerciseSettings: Record<string, Record<string, unknown>>;
  onLevel: (id: string, value: number) => void;
  onSpanCfg: <K extends keyof SpanSettings>(id: string, key: K, value: SpanSettings[K]) => void;
  onSetting: (id: string, key: string, value: unknown) => void;
  onConvertLegacy: (id: string, protocol: ProtocolName) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  sessionDuration: number;
  frequency: number;
  onSessionDuration: (v: number) => void;
  onFrequency: (v: number) => void;
  onSave: () => void;
  onVisualize: () => void;
  saving: boolean;
  presentation: PlanPresentation;
  headerAction?: ReactNode;
}

/** Coluna direita — "Plano em construção", exercícios agrupados por domínio. */
export function PlanBuilderSidebar(props: PlanBuilderSidebarProps) {
  const {
    selectedExercises, exerciseLevels, exerciseSettings, onLevel, onSpanCfg, onSetting, onConvertLegacy, onRemove, onMove,
    sessionDuration, frequency, onSessionDuration, onFrequency, onSave, onVisualize, saving,
    presentation, headerAction,
  } = props;
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);

  const items = selectedExercises.map(exDef).filter(Boolean);

  // Agrupa os exercícios escolhidos por domínio (mesma estrutura da biblioteca).
  const grouped = ALL_DOMAINS
    .map((d) => ({ domain: d, items: selectedExercises.filter((id) => EXERCISE_DOMAIN[id] === d).map(exDef).filter(Boolean) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="flex flex-col gap-5 rounded-[20px] border border-white/10 bg-[#0D2547] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-base font-bold text-slate-100">Plano em construção</h3>
        </div>
        {headerAction}
      </div>

      {/* Configurações de sessão */}
      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-5">
        <label className="block">
          <span className="text-xs font-semibold text-slate-300">Duração da sessão (min)</span>
          <input type="number" min={10} max={90} value={sessionDuration}
            onChange={(e) => onSessionDuration(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-300">Frequência (×/sem)</span>
          <input type="number" min={1} max={7} value={frequency}
            onChange={(e) => onFrequency(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </label>
      </div>

      <PrescriptionSummary presentation={presentation} />

      {/* Lista de exercícios agrupada por domínio */}
      <section className="space-y-3 border-t border-white/10 pt-5" aria-labelledby="selected-exercises-title">
        <div className="flex items-baseline justify-between gap-3">
          <h4 id="selected-exercises-title" className="text-sm font-bold uppercase tracking-wide text-slate-300">
            Exercícios selecionados
          </h4>
          <p className="text-xs text-slate-400">
            Total: <span className="font-semibold text-slate-200">{items.length}</span>
          </p>
        </div>
        <div className="-mr-1 max-h-[58vh] space-y-3 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">Nenhum exercício ainda.</p>
              <p className="mt-1 text-xs text-slate-400">Toque em <span className="font-semibold">+</span> na tabela para adicionar.</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.domain} className="space-y-2">
                <div className="flex items-center gap-2 px-0.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[group.domain] }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: DOMAIN_COLORS[group.domain] }}>
                    {DOMAIN_LABELS[group.domain]}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">· {group.items.length}</span>
                </div>
                {group.items.map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    id={ex.id}
                    name={ex.name}
                    description={ex.description}
                    icon={ex.icon}
                    prescription={presentation.exercises.find((exercise) => exercise.exerciseId === ex.id)}
                    isSpan={SPAN_IDS.includes(ex.id)}
                    level={exerciseLevels[ex.id] ?? 1}
                    onLevel={onLevel}
                    spanCfg={exerciseSettings[ex.id] as unknown as Partial<SpanSettings> | undefined}
                    onSpanCfg={onSpanCfg}
                    cfg={exerciseSettings[ex.id]}
                    onSetting={onSetting}
                    onConvertLegacy={onConvertLegacy}
                    onMove={onMove}
                    isFirst={i === 0}
                    isLast={i === group.items.length - 1}
                    open={openExerciseId === ex.id}
                    onToggleOpen={(id) => setOpenExerciseId((current) => toggleOpenExercise(current, id))}
                    onRemove={(id) => {
                      if (openExerciseId === id) setOpenExerciseId(null);
                      onRemove(id);
                    }}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Botões */}
      <div className="space-y-2 border-t border-white/10 pt-5" aria-label="Ações finais do plano">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || items.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar plano
        </button>
        <button
          type="button"
          onClick={onVisualize}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Visualizar plano
        </button>
      </div>
    </aside>
  );
}
