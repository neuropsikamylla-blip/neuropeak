"use client";

import { useState } from "react";
import { Loader2, Save, Eye, ClipboardList, GripVertical } from "lucide-react";
import { EXERCISE_DEFINITIONS, DOMAIN_COLORS } from "@/types";
import { EXERCISE_DOMAIN } from "@/lib/domain-taxonomy";
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
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  sessionDuration: number;
  frequency: number;
  onSessionDuration: (v: number) => void;
  onFrequency: (v: number) => void;
  onSave: () => void;
  onVisualize: () => void;
  saving: boolean;
}

/** Coluna direita — painel "Plano em construção" com drag-and-drop e donut. */
export function PlanBuilderSidebar(props: PlanBuilderSidebarProps) {
  const {
    selectedExercises, exerciseLevels, exerciseSettings, onLevel, onSpanCfg, onRemove, onReorder,
    sessionDuration, frequency, onSessionDuration, onFrequency, onSave, onVisualize, saving,
  } = props;

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const items = selectedExercises.map(exDef).filter(Boolean);
  const totalMinutes = items.reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0);

  return (
    <aside className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-gray-500" />
        <h3 className="text-base font-bold text-gray-900">Plano em construção</h3>
      </div>

      {/* Configurações de sessão */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500">Duração total (min)</span>
          <input type="number" min={10} max={90} value={sessionDuration}
            onChange={(e) => onSessionDuration(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-500">Frequência (×/sem)</span>
          <input type="number" min={1} max={7} value={frequency}
            onChange={(e) => onFrequency(Number(e.target.value))}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
        </label>
      </div>

      {/* Lista de exercícios — arrastar para reordenar */}
      <div className="space-y-2 max-h-[38vh] overflow-y-auto -mr-1 pr-1">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">Nenhum exercício ainda.</p>
            <p className="text-xs text-gray-300 mt-1">Toque em <span className="font-semibold">+</span> na tabela para adicionar.</p>
          </div>
        ) : (
          items.map((ex, i) => (
            <div
              key={ex.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i); setDragIndex(null); }}
              onDragEnd={() => setDragIndex(null)}
              className={`flex items-stretch gap-1 transition-opacity ${dragIndex === i ? "opacity-40" : ""}`}
            >
              <span className="flex items-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0" aria-hidden>
                <GripVertical className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <ExerciseCard
                  id={ex.id}
                  name={ex.name}
                  icon={ex.icon}
                  minutes={ex.estimatedMinutes}
                  color={DOMAIN_COLORS[EXERCISE_DOMAIN[ex.id] ?? "memory"]}
                  isSpan={SPAN_IDS.includes(ex.id)}
                  level={exerciseLevels[ex.id] ?? 1}
                  onLevel={onLevel}
                  spanCfg={exerciseSettings[ex.id] as unknown as Partial<SpanSettings> | undefined}
                  onSpanCfg={onSpanCfg}
                  onRemove={onRemove}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5">
        <div>
          <p className="text-xs text-gray-500">Total de exercícios</p>
          <p className="text-lg font-bold text-gray-900 tabular-nums">{items.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Tempo total estimado</p>
          <p className="text-lg font-bold text-gray-900 tabular-nums">{totalMinutes} min</p>
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
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Visualizar plano
        </button>
      </div>
    </aside>
  );
}
