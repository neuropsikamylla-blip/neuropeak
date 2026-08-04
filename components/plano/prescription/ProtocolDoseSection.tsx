"use client";

import { useState } from "react";
import {
  protocolOptions,
  type PresentedExercise,
} from "@/lib/prescription/presentation";
import type { ProtocolName } from "@/lib/prescription/types";
import { PrescriptionSection } from "./PrescriptionSection";

interface ProtocolDoseSectionProps {
  exercise: PresentedExercise;
  onProtocol: (protocol: ProtocolName) => void;
  onConvertLegacy: (protocol: ProtocolName) => void;
}

export function ProtocolDoseSection({ exercise, onProtocol, onConvertLegacy }: ProtocolDoseSectionProps) {
  const [pendingConversion, setPendingConversion] = useState<ProtocolName | null>(null);
  const options = protocolOptions(exercise.exerciseId);

  if (exercise.provisional) {
    return (
      <PrescriptionSection title="Dose do treino">
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-2.5">
          <p className="text-xs font-semibold text-amber-200">Configuração provisória</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Os parâmetros de dose serão reavaliados na reformulação desta atividade; nenhum protocolo é apresentado como definitivo agora.
          </p>
        </div>
      </PrescriptionSection>
    );
  }

  if (exercise.doseKind === "legacyCustom" && exercise.legacyDose) {
    const pending = options.find((option) => option.protocol === pendingConversion);
    return (
      <PrescriptionSection title="Dose do treino">
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-2.5">
          <p className="text-xs font-semibold text-amber-200">Configuração anterior de dose</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{exercise.legacyDose.valueLabel}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{exercise.legacyDose.durationLabel}</p>
          <p className="mt-2 text-[11px] text-slate-400">Este exercício utiliza uma configuração anterior de dose.</p>
        </div>

        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPendingConversion(null)}
            className="rounded-lg border border-white/15 px-2.5 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5"
          >
            Manter configuração atual
          </button>
          {options.map((option) => (
            <button
              key={option.protocol}
              type="button"
              onClick={() => setPendingConversion(option.protocol)}
              className="rounded-lg border border-white/15 px-2.5 py-2 text-left text-xs font-semibold text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/10"
            >
              Converter para {option.label}
            </button>
          ))}
        </div>

        {pending && (
          <div className="mt-2 rounded-lg border border-blue-400/30 bg-blue-500/10 p-2.5">
            <p className="text-xs font-semibold text-blue-200">Confirmar conversão</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
              De <strong>{exercise.legacyDose.valueLabel}</strong> para <strong>{pending.unitsLabel} · {pending.durationLabel.replace("Estimativa: ", "")}</strong>.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onConvertLegacy(pending.protocol);
                  setPendingConversion(null);
                }}
                className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirmar conversão
              </button>
              <button
                type="button"
                onClick={() => setPendingConversion(null)}
                className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </PrescriptionSection>
    );
  }

  return (
    <PrescriptionSection title="Dose do treino">
      <div className="grid gap-3">
        {options.map((option) => {
          const selected = exercise.selectedProtocol === option.protocol;
          return (
            <button
              key={option.protocol}
              type="button"
              aria-pressed={selected}
              onClick={() => onProtocol(option.protocol)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-blue-400/60 bg-blue-500/15"
                  : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-100">{option.label}</p>
                  <p className="mt-1.5 text-xs font-semibold text-slate-300">{option.unitsLabel}</p>
                </div>
                <p className="shrink-0 text-[11px] font-semibold text-blue-200">{option.durationLabel}</p>
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">{option.guidance}</p>
              {option.exposureNote && <p className="mt-3 text-[11px] font-medium text-slate-300">{option.exposureNote}</p>}
              {option.adaptiveValidityNote && (
                <p className="mt-3 rounded-md border border-slate-400/15 bg-slate-400/5 px-2.5 py-2 text-[11px] leading-relaxed text-slate-300">
                  {option.adaptiveValidityNote}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </PrescriptionSection>
  );
}
