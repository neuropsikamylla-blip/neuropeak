import { describe, expect, it } from "vitest";
import { catalogExercise } from "./catalog";
import { calculateDuration, durationState, doseMinutes } from "./duration";
import type { ResolvedExercisePrescription } from "./types";

const exercise = (id: string): ResolvedExercisePrescription => {
  const definition = catalogExercise(id)!;
  return { definition, prescription: { exerciseId: id, order: 1 }, prescribedMinutes: doseMinutes(definition) };
};

describe("duração da composição", () => {
  it("aplica fórmula a 1, 2 e 5 exercícios e todas as margens de fechamento", () => {
    const continuous = exercise("tempo-reacao"); // 5 + 0,5
    const closed = exercise("letras-sequencia"); // 6 + 1
    const planning = exercise("ordem-historia"); // 9 + 3
    const fixed = exercise("nback"); // 7,5 + 0
    expect(calculateDuration([continuous])).toEqual([5, 5.5]);
    expect(calculateDuration([continuous, closed])).toEqual([11.5, 13.5]);
    expect(calculateDuration([continuous, closed, planning, fixed, continuous])).toEqual([34.5, 41.5]);
  });

  it("aplica modalidade antes das margens", () => {
    const definition = catalogExercise("restaurante-ordem")!;
    expect(doseMinutes(definition, { kind: "protocol", protocol: "PADRAO" }, "audioOnly")).toEqual([11, 12]);
  });
});

describe("estados conservadores de duração", () => {
  const cases: [20 | 30 | 40, number, string][] = [
    [20, 17.9, "ABAIXO"], [20, 18, "DENTRO"], [20, 22, "DENTRO"], [20, 22.1, "ACIMA"], [20, 24, "ACIMA"], [20, 24.1, "EXCESSO_IMPORTANTE"],
    [30, 26.9, "ABAIXO"], [30, 27, "DENTRO"], [30, 33, "DENTRO"], [30, 33.1, "ACIMA"], [30, 36, "ACIMA"], [30, 36.1, "EXCESSO_IMPORTANTE"],
    [40, 35.9, "ABAIXO"], [40, 36, "DENTRO"], [40, 44, "DENTRO"], [40, 44.1, "ACIMA"], [40, 48, "ACIMA"], [40, 48.1, "EXCESSO_IMPORTANTE"],
  ];
  it.each(cases)("%s min: %s fica %s", (target, value, expected) => {
    expect(durationState([value, value], target)).toBe(expected);
  });
});
