"use client";

import { useState } from "react";
import { X, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { DEFAULT_SPAN_SETTINGS, type SpanSettings } from "@/components/exercises/memory/SpanNumerico";
import { EXERCISE_SUBDOMAIN, EXERCISE_SUBDOMAIN_ID } from "@/lib/domain-taxonomy";
import { ExerciseIcon } from "@/components/ExerciseIcon";
import { SubdomainTag } from "./ExerciseTags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CaminhosMetaConfig } from "@/components/therapist/CaminhosMetaConfig";
import type { PresentedExercise } from "@/lib/prescription/presentation";
import type { ProtocolName } from "@/lib/prescription/types";
import { ExercisePrescriptionMeta } from "./prescription/ExercisePrescriptionMeta";
import { PrescriptionSection } from "./prescription/PrescriptionSection";
import { ProtocolDoseSection } from "./prescription/ProtocolDoseSection";

interface ExerciseCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  prescription?: PresentedExercise;
  isSpan: boolean;
  // Preservados para não romper o caminho de dados do nível adaptativo.
  // A janela de prescrição não os exibe nem os persiste.
  level: number;
  onLevel: (id: string, value: number) => void;
  spanCfg?: Partial<SpanSettings>;
  onSpanCfg?: <K extends keyof SpanSettings>(id: string, key: K, value: SpanSettings[K]) => void;
  cfg?: Record<string, unknown>;
  onSetting?: (id: string, key: string, value: unknown) => void;
  onConvertLegacy: (id: string, protocol: ProtocolName) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}

/** Item do plano — card largo com reordenar, ajustes e remover. */
export function ExerciseCard({
  id, name, description, icon, prescription, isSpan, spanCfg, onSpanCfg, cfg,
  onSetting, onConvertLegacy, onRemove, onMove, isFirst, isLast,
}: ExerciseCardProps) {
  const [open, setOpen] = useState(false);
  const c: SpanSettings = { ...DEFAULT_SPAN_SETTINGS, ...(spanCfg ?? {}) };
  const isOrdemHistoria = id === "ordem-historia";
  const isFocus = id === "focus-agents" || id === "focus-agents-auditivo";
  const isCaminhos = id === "antes-depois";
  const hasModality = Boolean(prescription?.modalityLabel);
  const nCaminhosSel = isCaminhos && Array.isArray(cfg?.atividadesSelecionadas)
    ? (cfg.atividadesSelecionadas as unknown[]).length
    : 0;
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
          {prescription && (
            <ExercisePrescriptionMeta
              exercise={prescription}
              description={description}
              details={subLabel ? <SubdomainTag id={subId} label={subLabel} /> : undefined}
            />
          )}
        </div>

        {isCaminhos && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Configurar atividades"
                className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-xs font-medium border-white/15 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Configurar
                {nCaminhosSel > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">{nCaminhosSel}</span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-[#0D2547] text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Caminhos para a Meta — configurar atividades</DialogTitle>
              </DialogHeader>
              <CaminhosMetaConfig cfg={cfg} onSetting={onSetting ?? (() => {})} />
            </DialogContent>
          </Dialog>
        )}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
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
        <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-3">
          {prescription && (
            <ProtocolDoseSection
              exercise={prescription}
              onProtocol={(protocol) => onSetting?.(id, "protocol", protocol)}
              onConvertLegacy={(protocol) => onConvertLegacy(id, protocol)}
            />
          )}

          {(hasModality || isOrdemHistoria) && (
            <PrescriptionSection title="Modalidade e variantes">
              {hasModality && (
                <div>
                  <p className="mb-1.5 text-xs text-slate-300">Modalidade de apresentação</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      ["visual", "Visual"],
                      ["visual+audio", "Visual e áudio"],
                      ["audioOnly", "Somente áudio"],
                    ] as const).map(([mode, label]) => (
                      <Pill
                        key={mode}
                        on={(cfg?.presentationMode ?? "visual") === mode}
                        onClick={() => onSetting?.(id, "presentationMode", mode)}
                      >
                        {label}
                      </Pill>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">A modalidade pode recalcular a duração quando o catálogo define impacto temporal.</p>
                </div>
              )}

              {isOrdemHistoria && (
                <div className={hasModality ? "mt-3 border-t border-white/10 pt-3" : ""}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">🔍 Encontre o Intruso</span>
                      <div className="flex gap-1.5">
                        <Pill on={Boolean(cfg?.unlockIntruso)} onClick={() => onSetting?.(id, "unlockIntruso", true)}>Sim</Pill>
                        <Pill on={!cfg?.unlockIntruso} onClick={() => onSetting?.(id, "unlockIntruso", false)}>Não</Pill>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">🧩 Descubra o que falta</span>
                      <div className="flex gap-1.5">
                        <Pill on={Boolean(cfg?.unlockFalta)} onClick={() => onSetting?.(id, "unlockFalta", true)}>Sim</Pill>
                        <Pill on={!cfg?.unlockFalta} onClick={() => onSetting?.(id, "unlockFalta", false)}>Não</Pill>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                    Hoje estes atalhos ainda acrescentam etapas. A separação entre dose e variedade virá na reformulação da atividade.
                  </p>
                </div>
              )}
            </PrescriptionSection>
          )}

          {isSpan && (
            <PrescriptionSection title="Assistência">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Repetir áudio</span>
                <div className="flex gap-1.5">
                  <Pill on={c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", true)}>Sim</Pill>
                  <Pill on={!c.allowReplay} onClick={() => onSpanCfg?.(id, "allowReplay", false)}>Não</Pill>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Repetir o áudio reapresenta o conteúdo auditivo. Não altera a dose prescrita nem a estimativa atual.</p>
            </PrescriptionSection>
          )}

          {isFocus && (
            <PrescriptionSection title="Preferências de execução">
              <div>
                <p className="mb-1.5 text-xs text-slate-300">Feedback</p>
                <div className="flex gap-1.5">
                  {([["leve", "Leve"], ["normal", "Normal"], ["intenso", "Intenso"]] as const).map(([key, label]) => (
                    <Pill key={key} on={(cfg?.feedback ?? "normal") === key} onClick={() => onSetting?.(id, "feedback", key)}>{label}</Pill>
                  ))}
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300">Avanço automático de nível</span>
                <div className="flex gap-1.5">
                  <Pill on={cfg?.autoAdvance !== false} onClick={() => onSetting?.(id, "autoAdvance", true)}>Sim</Pill>
                  <Pill on={cfg?.autoAdvance === false} onClick={() => onSetting?.(id, "autoAdvance", false)}>Não</Pill>
                </div>
              </div>
            </PrescriptionSection>
          )}
        </div>
      )}
    </div>
  );
}
