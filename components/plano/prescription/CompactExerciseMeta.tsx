import type { ReactNode } from "react";
import type { PresentedExercise } from "@/lib/prescription/presentation";

export function CompactExerciseMeta({
  exercise,
  description,
  details,
}: {
  exercise: PresentedExercise;
  description: string;
  details?: ReactNode;
}) {
  return (
    <div className="mt-1.5 space-y-2">
      <p className="text-sm leading-snug text-slate-300">
        <span className="font-medium text-slate-200">{exercise.doseLabel}</span>
        <span className="text-slate-500"> · </span>
        {exercise.fatigueLabel}
      </p>
      <details className="text-sm text-slate-300">
        <summary className="w-fit cursor-pointer select-none font-semibold text-blue-300 hover:text-blue-200">
          Ver detalhes
        </summary>
        <div className="mt-2 space-y-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-3 leading-relaxed">
          <p><span className="font-medium text-slate-100">Descrição:</span> {description}</p>
          <p><span className="font-medium text-slate-100">Perfil cognitivo:</span> {exercise.cognitiveProfileLabel}</p>
          <p><span className="font-medium text-slate-100">Duração estimada:</span> {exercise.durationLabel}</p>
          <p>{exercise.protocolLabel}</p>
          <p><span className="font-medium text-slate-100">Fadiga:</span> {exercise.fatigueLabel}</p>
          {exercise.modalityLabel && <p>{exercise.modalityLabel}</p>}
          {details && <div className="pt-1">{details}</div>}
        </div>
      </details>
    </div>
  );
}
