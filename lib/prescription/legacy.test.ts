import { describe, expect, it } from "vitest";
import { interpretPlan } from "./interpreter";
import { readLegacyPlan } from "./legacy";

describe("leitor tolerante de planos antigos", () => {
  it("lê strings, preserva trials e aplica PADRAO quando não há dose", () => {
    const legacy = readLegacyPlan([{ id: "span-numerico", settings: { trials: 8 } }, "tempo-reacao"]);
    expect(legacy.ignoredIds).toEqual([]);
    expect(legacy.plan.exercises[0].clinicalParameters).toEqual({ trials: 8 });
    expect(legacy.plan.exercises[0].dose).toBeUndefined();
    expect(interpretPlan(legacy.plan).durationRange).toEqual([11.5, 13.5]);
  });

  it("ignora ID desconhecido e não lança", () => {
    expect(() => readLegacyPlan(["nao-existe", "matriz-espacial"])).not.toThrow();
    const result = readLegacyPlan(["nao-existe", "matriz-espacial"]);
    expect(result.ignoredIds).toEqual(["nao-existe"]);
    expect(result.plan.exercises.map((exercise) => exercise.exerciseId)).toEqual(["matriz-espacial"]);
  });
});
