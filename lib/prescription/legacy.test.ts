import { describe, expect, it } from "vitest";
import { interpretPlan } from "./interpreter";
import { readLegacyPlan } from "./legacy";

describe("leitor tolerante de planos antigos", () => {
  it("lê strings, preserva trials e mantém a duração original", () => {
    const legacy = readLegacyPlan([{ id: "span-numerico", settings: { trials: 8 } }, "tempo-reacao"]);
    expect(legacy.ignoredIds).toEqual([]);
    expect(legacy.plan.exercises[0].clinicalParameters).toEqual({ trials: 8 });
    expect(legacy.plan.exercises[0].dose).toEqual({ kind: "legacyCustom", unitCount: 8, sourceKey: "trials" });
    expect(interpretPlan(legacy.plan).durationRange).toEqual([11.5, 13.5]);
  });

  it.each([10, 15, 20, 30])("preserva exatamente trials=%s como dose legada", (trials) => {
    const legacy = readLegacyPlan([{ id: "span-numerico", settings: { trials } }]);
    expect(legacy.plan.exercises[0]).toMatchObject({
      dose: { kind: "legacyCustom", unitCount: trials, sourceKey: "trials" },
      clinicalParameters: { trials },
    });
  });

  it("prioriza settings.protocol sobre settings.trials", () => {
    const legacy = readLegacyPlan([{
      id: "span-numerico",
      settings: { protocol: "BREVE", trials: 30 },
    }]);
    expect(legacy.plan.exercises[0].dose).toEqual({ kind: "protocol", protocol: "BREVE" });
    expect(legacy.plan.exercises[0].clinicalParameters).toEqual({ protocol: "BREVE", trials: 30 });
  });

  it("prioriza dose explícita sobre settings.protocol", () => {
    const legacy = readLegacyPlan([{
      id: "span-numerico",
      dose: { kind: "protocol", protocol: "ESTENDIDO" },
      settings: { protocol: "BREVE", trials: 10 },
    }]);
    expect(legacy.plan.exercises[0].dose).toEqual({ kind: "protocol", protocol: "ESTENDIDO" });
  });

  it("não altera nível, progresso, histórico nem parâmetros clínicos durante a leitura", () => {
    const raw = [{
      id: "span-numerico",
      startLevel: 4,
      progress: { completed: 7, score: 0.8 },
      history: [{ level: 3, score: 0.7 }],
      settings: { trials: 15, level: 4, allowReplay: true, nested: { value: 2 } },
    }];
    const before = JSON.parse(JSON.stringify(raw));
    const legacy = readLegacyPlan(raw);

    expect(raw).toEqual(before);
    expect(legacy.plan.exercises[0]).toMatchObject({
      startLevel: 4,
      clinicalParameters: { trials: 15, level: 4, allowReplay: true, nested: { value: 2 } },
    });
  });

  it("preserva atividadesSelecionadas sem transformá-las em dose e sinaliza o perfil provisório", () => {
    const atividadesSelecionadas = ["rotina", "imprevisto"];
    const legacy = readLegacyPlan([{
      id: "antes-depois",
      settings: { atividadesSelecionadas },
    }]);
    expect(legacy.plan.exercises[0].clinicalParameters).toEqual({ atividadesSelecionadas });
    expect(legacy.plan.exercises[0].dose).toBeUndefined();
    expect(legacy.provisionalExerciseIds).toEqual(["antes-depois"]);
  });

  it("ignora ID desconhecido e não lança", () => {
    expect(() => readLegacyPlan(["nao-existe", "matriz-espacial"])).not.toThrow();
    const result = readLegacyPlan(["nao-existe", "matriz-espacial"]);
    expect(result.ignoredIds).toEqual(["nao-existe"]);
    expect(result.plan.exercises.map((exercise) => exercise.exerciseId)).toEqual(["matriz-espacial"]);
    expect(result.provisionalExerciseIds).toEqual([]);
  });
});
