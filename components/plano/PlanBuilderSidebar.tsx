"use client";

import { Loader2, Save, Eye, ClipboardList } from "lucide-react";
import { EXERCISE_DEFINITIONS, DOMAIN_COLORS, DOMAIN_LABELS } from "@/types";
import { ALL_DOMAINS, EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
import type { SpanSettings } from "@/components/exercises/memory/SpanNumerico";
import { ExerciseCard } from "./ExerciseCard";

const SPAN_IDS = ["span-numerico", "span-numerico-inverso"];
const exDef = (id: string) => EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS];

interface PlanBuilderSidebarProps {
  selectedExercises: string[];
  exerciseLevels: Record<string, number>;
  exerciseSettings: Record<string, Record<string, unknown>>;
  onLevel: (id: string, value: number) => void;
  onSpanCfg: <K extends keyof SpanSettings>(id: string, key: K, value: SpanSettings[K]) => void;
  onSetting: (id: string, key: string, value: unknown) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  sessionDuration: number;
  frequency: number;
  onSessionDuration: (v: number) => void;
  onFrequency: (v: number) => void;
  onSave: () => void;
  onVisualize: () => void;
  saving: boolean;
}

/** Coluna direita — "Plano em construção", exercícios agrupados por domínio. */
export function PlanBuilderSidebar(props: PlanBuilderSidebarProps) {
  const {
    selectedExercises, exerciseLevels, exerciseSettings, onLevel, onSpanCfg, onSetting, onRemove, onMove,
    sessionDuration, frequency, onSessionDuration, onFrequency, onSave, onVisualize, saving,
  } = props;

  const items = selectedExercises.map(exDef).filter(Boolean);
  const totalMinutes = items.reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0);

  // Agrupa os exercícios escolhidos por domínio (mesma estrutura da biblioteca).
  const grouped = ALL_DOMAINS
    .map((d) => ({ domain: d, items: selectedExercises.filter((id) => EXERCISE_DOMAIN[id] === d).map(exDef).filter(Boolean) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="rounded-[20px] border border-white/10 bg-[#0D2547] p-5 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-slate-400" />
        <h3 className="text-base font-bold text-slate-100">Plano em construção</h3>
      </div>

      {/* Configurações de sessão */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-400">Duração da sessão (min)</span>
          <input type="number" min={10} max={90} value={sessionDuration}
            onChange={(e) => onSessionDuration(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-400">Frequência (×/sem)</span>
          <input type="number" min={1} max={7} value={frequency}
            onChange={(e) => onFrequency(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </label>
      </div>

      {/* Lista de exercícios agrupada por domínio */}
      <div className="space-y-3 max-h-[58vh] overflow-y-auto -mr-1 pr-1">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">Nenhum exercício ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Toque em <span className="font-semibold">+</span> na tabela para adicionar.</p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.domain} className="space-y-1.5">
              <div className="flex items-center gap-2 px-0.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DOMAIN_COLORS[group.domain] }} />
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: DOMAIN_COLORS[group.domain] }}>
                  {DOMAIN_LABELS[group.domain]}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">· {group.items.length}</span>
              </div>
              {group.items.map((ex, i) => (
                <ExerciseCard
                  key={ex.id}
                  id={ex.id}
                  name={ex.name}
                  icon={ex.icon}
                  minutes={ex.estimatedMinutes}
                  color={DOMAIN_COLORS[group.domain]}
                  isSpan={SPAN_IDS.includes(ex.id)}
                  level={exerciseLevels[ex.id] ?? 1}
                  onLevel={onLevel}
                  spanCfg={exerciseSettings[ex.id] as unknown as Partial<SpanSettings> | undefined}
                  onSpanCfg={onSpanCfg}
                  cfg={exerciseSettings[ex.id]}
                  onSetting={onSetting}
                  onRemove={onRemove}
                  onMove={onMove}
                  isFirst={i === 0}
                  isLast={i === group.items.length - 1}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5">
        <div>
          <p className="text-xs text-slate-400">Total de exercícios</p>
          <p className="text-lg font-bold text-slate-100 tabular-nums">{items.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Tempo total estimado</p>
          <p className="text-lg font-bold text-slate-100 tabular-nums">{totalMinutes} min</p>
        </div>
      </div>

      {/* Botões */}
      <div className="space-y-2">
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
