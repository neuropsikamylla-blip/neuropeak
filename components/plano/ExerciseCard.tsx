"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { DEFAULT_SPAN_SETTINGS, type SpanSettings } from "@/components/exercises/memory/SpanNumerico";

interface ExerciseCardProps {
  id: string;
  name: string;
  icon: string;
  minutes: number;
  color: string;
  isSpan: boolean;
  /** Nível inicial 1-10 (exercícios não-Span). */
  level: number;
  onLevel: (id: string, value: number) => void;
  /** Config do terapeuta (apenas Span) — pode vir parcial do banco. */
  spanCfg?: Partial<SpanSettings>;
  onSpanCfg?: <K extends keyof SpanSettings>(id: string, key: K, value: SpanSettings[K]) => void;
  onRemove: (id: string) => void;
}

/** Item do painel "Plano em construção" — nome, duração, remover e ajustes. */
export function ExerciseCard({
  id, name, icon, minutes, color, isSpan, level, onLevel, spanCfg, onSpanCfg, onRemove,
}: ExerciseCardProps) {
  const [open, setOpen] = useState(false);
  const c: SpanSettings = { ...DEFAULT_SPAN_SETTINGS, ...(spanCfg ?? {}) };

  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors ${
        on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2.5 p-2.5">
        <span className="text-lg leading-none shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
          <p className="text-xs text-gray-400">{minutes} min</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Ajustar"
          className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
            open ? "border-blue-300 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-400 hover:text-gray-600"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remover ${name}`}
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="px-2.5 pb-2.5 pt-0.5 border-t border-gray-100">
          {!isSpan ? (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Nível inicial</span>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>{level} <span className="text-gray-300 font-normal">/ 10</span></span>
              </div>
              <input
                type="range" min={1} max={10} step={1} value={level}
                onChange={(e) => onLevel(id, Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
              <p className="text-[10px] text-gray-400 pt-1">Sobe/desce sozinho conforme o paciente acerta ou erra.</p>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
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
              <p className="text-[10px] text-gray-400">O nível é automático (o paciente retoma onde parou).</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
