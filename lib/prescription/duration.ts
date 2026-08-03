import type { ExecutionModel, MinutesRange, PrescribedDose, ResolvedExercisePrescription, SessionDurationState, TargetMinutes } from "./types";

export const CLOSING_MARGIN_MAX: Readonly<Record<ExecutionModel, number>> = {
  CONTINUOUS_TIMED: 0.5,
  CLOSED_PROTOCOL: 1,
  PLANNING_WINDOW: 3,
  FIXED_HIGH_FATIGUE: 0,
};

export const TARGET_DURATION_BOUNDS: Readonly<Record<TargetMinutes, { floor: number; ceiling: number; maximum: number }>> = {
  20: { floor: 18, ceiling: 22, maximum: 24 },
  30: { floor: 27, ceiling: 33, maximum: 36 },
  40: { floor: 36, ceiling: 44, maximum: 48 },
};

export function doseMinutes(definition: ResolvedExercisePrescription["definition"], dose?: PrescribedDose, presentationMode?: ResolvedExercisePrescription["prescription"]["presentationMode"]): MinutesRange {
  let base: MinutesRange;
  if (!dose || dose.kind === "protocol") base = (() => {
    const protocol = dose?.kind === "protocol" ? dose.protocol : "PADRAO";
    const minutes = definition.protocols[protocol].durationMinutes;
    return [minutes, minutes] as const;
  })();
  else if (dose.kind === "timed") base = [dose.prescribedMinutes, dose.prescribedMinutes];
  else if (dose.kind === "planningWindow") base = [dose.maximumMinutes, dose.maximumMinutes];
  else base = [dose.minutes, dose.minutes];

  const modality = presentationMode && definition.modalities[presentationMode];
  if (!modality) return base;
  return [base[0] * modality.durationMultiplier[0], base[1] * modality.durationMultiplier[1]];
}

export function resolveDuration(exercise: ResolvedExercisePrescription): ResolvedExercisePrescription {
  return { ...exercise, prescribedMinutes: doseMinutes(exercise.definition, exercise.prescription.dose, exercise.prescription.presentationMode) };
}

export function calculateDuration(exercises: readonly Pick<ResolvedExercisePrescription, "definition" | "prescribedMinutes">[]): MinutesRange {
  const transitions = Math.max(0, exercises.length - 1);
  const prescribedMin = exercises.reduce((total, exercise) => total + exercise.prescribedMinutes[0], 0);
  const prescribedMax = exercises.reduce((total, exercise) => total + exercise.prescribedMinutes[1], 0);
  const closingMax = exercises.reduce((total, exercise) => total + CLOSING_MARGIN_MAX[exercise.definition.executionModel], 0);
  return [prescribedMin + 0.5 * transitions, prescribedMax + transitions + closingMax];
}

/** Estado conservador pelo extremo superior; cruzamentos são descritos pelo alerta parcial. */
export function durationState(durationRange: MinutesRange, targetMinutes: TargetMinutes): SessionDurationState {
  const bounds = TARGET_DURATION_BOUNDS[targetMinutes];
  const upper = durationRange[1];
  if (upper < bounds.floor) return "ABAIXO";
  if (upper > bounds.maximum) return "EXCESSO_IMPORTANTE";
  if (upper > bounds.ceiling) return "ACIMA";
  return "DENTRO";
}
