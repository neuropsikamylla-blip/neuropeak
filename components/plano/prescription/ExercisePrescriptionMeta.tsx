import type { ReactNode } from "react";
import type { PresentedExercise } from "@/lib/prescription/presentation";

export function ExercisePrescriptionMeta({
  exercise,
  description,
  details,
}: {
  exercise: PresentedExercise;
  description: string;
  details?: ReactNode;
}) {
  return (
    <div className="mt-1 space-y-1">
      <p className="line-clamp-1 text-xs leading-snug text-slate-400" title={description}>{description}</p>
      <p className="text-xs text-slate-300">
        <span className="font-medium">{exercise.modelLabel}</span>
        <span className="text-slate-500"> · </span>
        {exercise.doseLabel}
        <span className="text-slate-500"> · </span>
        {exercise.durationLabel}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
        <span className="rounded-md bg-white/5 px-1.5 py-0.5">{exercise.loadLabel}</span>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5">{exercise.fatigueLabel}</span>
      </div>
      <details className="text-[11px] text-slate-400">
        <summary className="w-fit cursor-pointer select-none text-blue-300 hover:text-blue-200">Ver detalhes</summary>
        <div className="mt-1.5 space-y-1">
          <p><span className="font-medium text-slate-300">Descrição:</span> {description}</p>
          <p><span className="font-medium text-slate-300">Perfil cognitivo:</span> {exercise.cognitiveProfileLabel}</p>
          <p><span className="font-medium text-slate-300">Modelo de execução:</span> {exercise.modelLabel}</p>
          <p>{exercise.protocolLabel}</p>
          <p>
            <span className="font-medium text-slate-300">Carga e demanda:</span>{" "}
            {exercise.loadLabel} · {exercise.fatigueLabel} · {exercise.interferenceLabel}
          </p>
          {exercise.modalityLabel && <p>{exercise.modalityLabel}</p>}
        </div>
        {details && <div className="mt-1.5">{details}</div>}
      </details>
    </div>
  );
}
