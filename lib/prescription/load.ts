import type { FatigueLevel, InterferenceLevel, ResolvedExercisePrescription, TargetMinutes } from "./types";

export const LOAD_REFERENCE: Readonly<Partial<Record<TargetMinutes, number>>> = { 20: 7, 30: 10, 40: 13 };

export function baselineLoad(exercises: readonly Pick<ResolvedExercisePrescription, "definition">[]): number {
  return exercises.reduce((total, exercise) => total + exercise.definition.baselineCognitiveLoad, 0);
}

export function levelSummary<T extends FatigueLevel | InterferenceLevel>(
  exercises: readonly Pick<ResolvedExercisePrescription, "definition">[], key: "fatigue" | "interference",
): Record<T, number> {
  const summary: Record<string, number> = { BAIXA: 0, MODERADA: 0, ALTA: 0 };
  for (const exercise of exercises) summary[exercise.definition[key]] += 1;
  return summary as Record<T, number>;
}

export const HIGH_FATIGUE_CAP: Readonly<Partial<Record<TargetMinutes, number>>> = { 20: 1, 30: 2, 40: 2 };
export const PLANNING_WINDOW_CAP: Readonly<Partial<Record<TargetMinutes, number>>> = { 20: 1, 30: 2, 40: 2 };
