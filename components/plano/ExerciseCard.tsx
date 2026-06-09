"use client";

import { useState } from "react";
import { X, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { DEFAULT_SPAN_SETTINGS, type SpanSettings } from "@/components/exercises/memory/SpanNumerico";
import { EXERCISE_SUBDOMAIN, EXERCISE_SUBDOMAIN_ID } from "@/lib/domain-taxonomy";
import { ExerciseIcon } from "@/components/ExerciseIcon";
import { SubdomainTag } from "./ExerciseTags";

interface ExerciseCardProps {
  id: string;
  name: string;
  icon: string;
  minutes: number;
  color: string;
  isSpan: boolean;
  level: number;
  onLevel: (id: string, value: number) => void;
  spanCfg?: Partial<SpanSettings>;
  onSpanCfg?: <K extends keyof SpanSettings>(id: string, key: K, value: SpanSettings[K]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}

/** Item do plano — card largo com reordenar, ajustes e remover. */
export function ExerciseCard({
  id, name, icon, minutes, color, isSpan, level, onLevel, spanCfg, onSpanCfg, onRemove, onMove, isFirst, isLast,
}: ExerciseCardProps) {
  const [open, setOpen] = useState(false);
  const c: SpanSettings = { ...DEFAULT_SPAN_SETTINGS, ...(spanCfg ?? {}) };
  const subLabel = EXERCISE_SUBDOMAIN[id];
  const subId = EXERCISE_SUBDOMAIN_ID[id];

  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
        on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}>
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2 p-2.5">
        {/* Reordenar */}
        <div className="flex flex-col shrink-0">
          <button type="button" onClick={() => onMove(id, -1)} disabled={isFirst}
            aria-label="Mover para cima"
            className="text-gray-300 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onMove(id, 1)} disabled={isLast}
            aria-label="Mover para baixo"
            className="text-gray-300 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <ExerciseIcon id={id} emoji={icon} size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {subLabel && <SubdomainTag id={subId} label={subLabel} />}
            <span className="text-xs text-gray-400 shrink-0">~{minutes} min</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Ajustar"
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors ${
            open ? "border-blue-300 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Ajustar
        </button>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remover ${name}`}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100">
          {!isSpan ? (
            <div className="pt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Nível inicial</span>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>{level} <span className="text-gray-300 font-normal">/ 10</span></span>
              </div>
              <input
                type="range" min={1} max={10} step={1} value={level}
                onChange={(e) => onLevel(id, Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
              <p className="text-[11px] text-gray-400 pt-1.5">Começa neste nível e sobe/desce sozinho conforme o paciente acerta ou erra.</p>
            </div>
          ) : (
            <div className="pt-2.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Mostrar resposta ao errar</span>
                <div className="flex gap-1.5">
                  <Pill on={c.showAnswerOnError} onClick={() => onSpanCfg?.(id, "showAnswerOnError", true)}>Sim</Pill>
                  <Pill on={!c.showAnswerOnError} onClick={() => onSpanCfg?.(id, "showAnswerOnError", false)}>Não</Pill>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Tentativas</span>
                <div className="flex gap-1.5">
                  {[10, 15, 20, 30].map((t) => (
                    <Pill key={t} on={c.trials === t} onClick={() => onSpanCfg?.(id, "trials", t)}>{t}</Pill>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Repetir áudio</span>
                <div className="flex gap-1.5">
                  <Pill on={c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", true)}>Sim</Pill>
                  <Pill on={!c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", false)}>Não</Pill>
                </div>
              </div>
              <p className="text-[11px] text-gray-400">O nível é automático (o paciente retoma onde parou).</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
