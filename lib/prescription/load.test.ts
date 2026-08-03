import { describe, expect, it } from "vitest";
import { catalogExercise } from "./catalog";
import { doseMinutes } from "./duration";
import { baselineLoad, levelSummary } from "./load";
import type { ResolvedExercisePrescription } from "./types";

const resolved = (id: string): ResolvedExercisePrescription => {
  const definition = catalogExercise(id)!;
  return { definition, prescription: { exerciseId: id, order: 1 }, prescribedMinutes: doseMinutes(definition) };
};

describe("carga basal", () => {
  it("soma somente a carga basal e conta os níveis", () => {
    const exercises = [resolved("matriz-espacial"), resolved("tempo-reacao"), resolved("stroop-task")];
    expect(baselineLoad(exercises)).toBe(5);
    expect(levelSummary(exercises, "fatigue")).toEqual({ BAIXA: 1, MODERADA: 1, ALTA: 1 });
    expect(levelSummary(exercises, "interference")).toEqual({ BAIXA: 1, MODERADA: 1, ALTA: 1 });
  });
});
