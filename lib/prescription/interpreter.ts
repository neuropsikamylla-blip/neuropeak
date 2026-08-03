import { catalogExercise } from "./catalog";
import { calculateDuration, doseMinutes, durationState } from "./duration";
import { baselineLoad, levelSummary, LOAD_REFERENCE } from "./load";
import { validateComposition } from "./validation";
import type { ExercisePrescription, ResolvedExercisePrescription, SessionPrescription } from "./types";

/** Interpreta somente definições conhecidas; IDs legados desconhecidos são responsabilidade do leitor tolerante. */
export function interpretPlan(plan: SessionPrescription) {
  const exercises: ResolvedExercisePrescription[] = plan.exercises.flatMap((prescription) => {
    const definition = catalogExercise(prescription.exerciseId);
    if (!definition) return [];
    return [{ definition, prescription, prescribedMinutes: doseMinutes(definition, prescription.dose, prescription.presentationMode) }];
  });
  const durationRange = calculateDuration(exercises);
  const baseline = baselineLoad(exercises);
  return {
    durationRange,
    durationState: durationState(durationRange, plan.targetMinutes),
    baselineLoad: baseline,
    loadReference: LOAD_REFERENCE[plan.targetMinutes],
    fatigueSummary: levelSummary(exercises, "fatigue"),
    interferenceSummary: levelSummary(exercises, "interference"),
    alerts: validateComposition({ targetMinutes: plan.targetMinutes, durationRange, baselineLoad: baseline, exercises }),
    canSave: true as const,
  };
}

export function prescription(exerciseId: string, order: number, overrides: Omit<ExercisePrescription, "exerciseId" | "order"> = {}): ExercisePrescription {
  return { exerciseId, order, ...overrides };
}
