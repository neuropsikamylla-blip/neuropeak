import type { ReactNode } from "react";
import type { PresentedExercise } from "@/lib/prescription/presentation";

export function ExercisePrescriptionMeta({ exercise, details }: { exercise: PresentedExercise; details?: ReactNode }) {
  return (
    <div className="mt-1 space-y-1">
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
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
          <span>{exercise.interferenceLabel}</span>
          {exercise.modalityLabel && <span>{exercise.modalityLabel}</span>}
        </div>
        {details && <div className="mt-1.5">{details}</div>}
      </details>
    </div>
  );
}
