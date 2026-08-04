import { describe, expect, it } from "vitest";
import { catalogExercise, EXERCISE_CATALOG } from "./catalog";
import { calculateDuration, durationState, doseMinutes, legacyDoseMinutes } from "./duration";
import { interpretPlan } from "./interpreter";
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

  it("produz durações diferentes para Breve, Padrão e Estendido", () => {
    const definition = catalogExercise("span-numerico")!;
    expect(["BREVE", "PADRAO", "ESTENDIDO"].map((protocol) =>
      doseMinutes(definition, { kind: "protocol", protocol: protocol as "BREVE" | "PADRAO" | "ESTENDIDO" })))
      .toEqual([[3, 3], [6, 6], [9, 9]]);
  });

  it.each([
    [10, 7.5],
    [15, 11.25],
    [20, 15],
    [30, 22.5],
  ])("estima %s tentativas do Span Direto como %s min", (unitCount, minutes) => {
    const definition = catalogExercise("span-numerico")!;
    const dose = { kind: "legacyCustom", unitCount, sourceKey: "trials" } as const;
    expect(legacyDoseMinutes(definition, dose)).toEqual({ minutes: [minutes, minutes], approximate: true });
    expect(doseMinutes(definition, dose)).toEqual([minutes, minutes]);
  });

  it("não estima dose legada quando a taxa por unidade varia entre protocolos", () => {
    const definition = catalogExercise("antes-depois")!;
    const dose = { kind: "legacyCustom", unitCount: 15, sourceKey: "trials" } as const;
    expect(legacyDoseMinutes(definition, dose)).toEqual({ approximate: false });
    expect(doseMinutes(definition, dose)).toEqual([0, 0]);
  });

  it("mantém a sessão numérica quando um exercício legado não tem faixa segura", () => {
    const definition = catalogExercise("antes-depois")!;
    const prescribedMinutes = doseMinutes(definition, { kind: "legacyCustom", unitCount: 15, sourceKey: "trials" });
    const duration = calculateDuration([{ definition, prescribedMinutes }]);
    expect(duration).toEqual([0, 3]);
    expect(duration.every(Number.isFinite)).toBe(true);
  });

  it("identifica taxa constante exatamente nos 19 exercícios catalogados", () => {
    const dose = { kind: "legacyCustom", unitCount: 1, sourceKey: "trials" } as const;
    expect(EXERCISE_CATALOG.filter((definition) => legacyDoseMinutes(definition, dose).minutes).length).toBe(19);
  });

  it("modalidade recalcula duração sem alterar carga basal", () => {
    const base = interpretPlan({
      targetMinutes: 20,
      exercises: [{ exerciseId: "restaurante-ordem", order: 1, dose: { kind: "protocol", protocol: "PADRAO" }, presentationMode: "visual" }],
    });
    const audio = interpretPlan({
      targetMinutes: 20,
      exercises: [{ exerciseId: "restaurante-ordem", order: 1, dose: { kind: "protocol", protocol: "PADRAO" }, presentationMode: "audioOnly" }],
    });
    expect(audio.durationRange).not.toEqual(base.durationRange);
    expect(audio.baselineLoad).toBe(base.baselineLoad);
  });

  it("allowReplay não altera duração, carga nem fadiga", () => {
    const plan = (allowReplay: boolean) => interpretPlan({
      targetMinutes: 20,
      exercises: [{
        exerciseId: "span-numerico",
        order: 1,
        dose: { kind: "protocol", protocol: "PADRAO" },
        clinicalParameters: { allowReplay },
      }],
    });
    const disabled = plan(false);
    const enabled = plan(true);
    expect(enabled.durationRange).toEqual(disabled.durationRange);
    expect(enabled.baselineLoad).toBe(disabled.baselineLoad);
    expect(enabled.fatigueSummary).toEqual(disabled.fatigueSummary);
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
