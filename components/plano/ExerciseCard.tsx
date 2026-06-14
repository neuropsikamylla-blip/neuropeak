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
  cfg?: Record<string, unknown>;
  onSetting?: (id: string, key: string, value: unknown) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}

/** Item do plano — card largo com reordenar, ajustes e remover. */
export function ExerciseCard({
  id, name, icon, minutes, color, isSpan, level, onLevel, spanCfg, onSpanCfg, cfg, onSetting, onRemove, onMove, isFirst, isLast,
}: ExerciseCardProps) {
  const [open, setOpen] = useState(false);
  const c: SpanSettings = { ...DEFAULT_SPAN_SETTINGS, ...(spanCfg ?? {}) };
  const isOrdemHistoria = id === "ordem-historia";
  const subLabel = EXERCISE_SUBDOMAIN[id];
  const subId = EXERCISE_SUBDOMAIN_ID[id];

  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
        on ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 text-slate-300 border-white/20 hover:border-white/40"}`}>
      {children}
    </button>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-[#07162D] hover:border-white/20 transition-colors">
      <div className="flex items-center gap-2 p-2.5">
        {/* Reordenar */}
        <div className="flex flex-col shrink-0">
          <button type="button" onClick={() => onMove(id, -1)} disabled={isFirst}
            aria-label="Mover para cima"
            className="text-slate-500 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onMove(id, 1)} disabled={isLast}
            aria-label="Mover para baixo"
            className="text-slate-500 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <ExerciseIcon id={id} emoji={icon} size={38} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 truncate">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {subLabel && <SubdomainTag id={subId} label={subLabel} />}
            <span className="text-xs text-slate-400 shrink-0">~{minutes} min</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Ajustar"
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium transition-colors ${
            open ? "border-blue-400/50 text-blue-300 bg-blue-500/15" : "border-white/15 text-slate-400 hover:text-slate-200 hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Ajustar
        </button>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remover ${name}`}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/15 text-slate-400 hover:text-red-400 hover:border-red-400/40 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-white/10">
          {!isSpan ? (
            <div className="pt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Nível inicial</span>
                <span className="text-sm font-bold tabular-nums" style={{ color }}>{level} <span className="text-slate-500 font-normal">/ 10</span></span>
              </div>
              <input
                type="range" min={1} max={10} step={1} value={level}
                onChange={(e) => onLevel(id, Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
              <p className="text-[11px] text-slate-400 pt-1.5">Começa neste nível e sobe/desce sozinho conforme o paciente acerta ou erra.</p>

              {isOrdemHistoria && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Liberar desafios</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-300">🔍 Encontre o Intruso</span>
                    <div className="flex gap-1.5">
                      <Pill on={!!cfg?.unlockIntruso} onClick={() => onSetting?.(id, "unlockIntruso", true)}>Sim</Pill>
                      <Pill on={!cfg?.unlockIntruso} onClick={() => onSetting?.(id, "unlockIntruso", false)}>Não</Pill>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-300">🧩 Descubra o que falta</span>
                    <div className="flex gap-1.5">
                      <Pill on={!!cfg?.unlockFalta} onClick={() => onSetting?.(id, "unlockFalta", true)}>Sim</Pill>
                      <Pill on={!cfg?.unlockFalta} onClick={() => onSetting?.(id, "unlockFalta", false)}>Não</Pill>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Quando ligado, o paciente já faz o desafio. No nível 10 eles liberam sozinhos.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Mostrar resposta ao errar</span>
                <div className="flex gap-1.5">
                  <Pill on={c.showAnswerOnError} onClick={() => onSpanCfg?.(id, "showAnswerOnError", true)}>Sim</Pill>
                  <Pill on={!c.showAnswerOnError} onClick={() => onSpanCfg?.(id, "showAnswerOnError", false)}>Não</Pill>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Tentativas</span>
                <div className="flex gap-1.5">
                  {[10, 15, 20, 30].map((t) => (
                    <Pill key={t} on={c.trials === t} onClick={() => onSpanCfg?.(id, "trials", t)}>{t}</Pill>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Repetir áudio</span>
                <div className="flex gap-1.5">
                  <Pill on={c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", true)}>Sim</Pill>
                  <Pill on={!c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", false)}>Não</Pill>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">O nível é automático (o paciente retoma onde parou).</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
