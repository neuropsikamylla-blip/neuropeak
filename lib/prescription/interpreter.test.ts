import { describe, expect, it } from "vitest";
import { interpretPlan } from "./interpreter";

describe("interpretador", () => {
  it("soma carga e contagens, mantendo canSave literal verdadeiro", () => {
    const result = interpretPlan({ targetMinutes: 20, exercises: [
      { exerciseId: "matriz-espacial", order: 1 },
      { exerciseId: "tempo-reacao", order: 2 },
      { exerciseId: "certo-ou-errado", order: 3 },
    ] });
    expect(result.baselineLoad).toBe(3);
    expect(result.loadReference).toBe(7);
    expect(result.fatigueSummary).toEqual({ BAIXA: 2, MODERADA: 1, ALTA: 0 });
    expect(result.canSave).toBe(true);
    expect(result.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
  });

  it("cobre os três exemplos de sessão do contrato", () => {
    const examples = [
      { targetMinutes: 20 as const, ids: ["tempo-reacao", "letras-sequencia", "certo-ou-errado"], duration: [19, 22], load: 4, fatigue: { BAIXA: 1, MODERADA: 2, ALTA: 0 } },
      { targetMinutes: 30 as const, ids: ["deductive-grid", "matriz-espacial", "certo-ou-errado"], duration: [27, 32.5], load: 4, fatigue: { BAIXA: 2, MODERADA: 0, ALTA: 1 } },
      { targetMinutes: 40 as const, ids: ["task-switching", "semaforo", "ordem-historia", "identificacao-simbolos", "certo-ou-errado"], duration: [36, 43.5], load: 9, fatigue: { BAIXA: 1, MODERADA: 3, ALTA: 1 } },
    ];
    for (const example of examples) {
      const result = interpretPlan({ targetMinutes: example.targetMinutes, exercises: example.ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })) });
      expect(result.durationRange).toEqual(example.duration);
      expect(result.baselineLoad).toBe(example.load);
      expect(result.fatigueSummary).toEqual(example.fatigue);
      expect(result.durationState).toBe("DENTRO");
      expect(result.alerts).toEqual([]);
    }
  });

  it("mantém os dados calculados e canSave sem inventar referência para duração contínua", () => {
    const result = interpretPlan({
      targetMinutes: 35,
      exercises: ["deductive-grid", "matriz-espacial", "certo-ou-errado"]
        .map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
    });
    const tableDependentCodes = new Set([
      "LOAD_AT_CAP",
      "LOAD_OVER_CAP",
      "HIGH_FATIGUE_COUNT",
      "PLANNING_WINDOW_COUNT",
    ]);

    expect(result.durationRange).toEqual([27, 32.5]);
    expect(result.baselineLoad).toBe(4);
    // Catálogo: matriz-espacial e certo-ou-errado são BAIXA nos dois eixos; deductive-grid é
    // ALTA em fadiga mas MODERADA em interferência — os resumos não são iguais entre si.
    expect(result.fatigueSummary).toEqual({ BAIXA: 2, MODERADA: 0, ALTA: 1 });
    expect(result.interferenceSummary).toEqual({ BAIXA: 2, MODERADA: 1, ALTA: 0 });
    expect(result).not.toHaveProperty("loadReference");
    expect(result.loadReference).toBeUndefined();
    expect(result.alerts.every((alert) => !tableDependentCodes.has(alert.code))).toBe(true);
    expect(result.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
    expect(result.canSave).toBe(true);
  });
});
