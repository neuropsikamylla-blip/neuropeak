import { describe, expect, it } from "vitest";
import { validateComposition } from "./validation";
import type { ExerciseDefinition, ResolvedExercisePrescription } from "./types";

function definition(id: string, overrides: Partial<ExerciseDefinition> = {}): ExerciseDefinition {
  return {
    exerciseId: id, officialName: id, definitionVersion: "test", executionModel: "CONTINUOUS_TIMED",
    protocols: { BREVE: { unitCount: 1, durationMinutes: 1, durationText: "1 min" }, PADRAO: { unitCount: 1, durationMinutes: 1, durationText: "1 min" }, ESTENDIDO: { unitCount: 1, durationMinutes: 1, durationText: "1 min" } },
    baselineCognitiveLoad: 1, loadModifiers: [], fatigue: "BAIXA", interference: "BAIXA",
    mechanicalPrimary: id, associatedCognitiveProfiles: [], intrinsicChannels: ["visual"], supportedPresentationModes: [], modalities: {},
    sessionEligibility: { canOpen: true, canClose: true, preferredPositions: ["OPEN", "MIDDLE", "CLOSE"], preferredPositionNote: "qualquer posição", badCombinations: [] }, parameterSchema: {}, ...overrides,
  };
}
function resolved(def: ExerciseDefinition, index: number): ResolvedExercisePrescription {
  return { definition: def, prescription: { exerciseId: def.exerciseId, order: index + 1, dose: { kind: "protocol", protocol: "PADRAO" } }, prescribedMinutes: [1, 1] };
}
function codes(exercises: ExerciseDefinition[], range: readonly [number, number] = [20, 20], baseline = 0, target = 20) {
  return validateComposition({ targetMinutes: target, durationRange: range, baselineLoad: baseline, exercises: exercises.map(resolved) }).map((alert) => alert.code);
}

describe("18 alertas de composição", () => {
  const checks: { code: Parameters<typeof codes>[0] extends never ? never : string; yes: () => string[]; no: () => string[] }[] = [
    { code: "SESSION_BELOW_TARGET", yes: () => codes([], [17.9, 17.9]), no: () => codes([], [18, 18]) },
    { code: "SESSION_ABOVE_TARGET", yes: () => codes([], [22.1, 22.1]), no: () => codes([], [22, 22]) },
    { code: "SESSION_RANGE_PARTIAL", yes: () => codes([], [17.9, 18]), no: () => codes([], [18, 22]) },
    { code: "SESSION_SAFE_MAX_EXCEEDED", yes: () => codes([], [24.1, 24.1]), no: () => codes([], [24, 24]) },
    { code: "LOAD_AT_CAP", yes: () => codes([], [20, 20], 7), no: () => codes([], [20, 20], 6) },
    { code: "LOAD_OVER_CAP", yes: () => codes([], [20, 20], 8), no: () => codes([], [20, 20], 7) },
    { code: "HIGH_FATIGUE_COUNT", yes: () => codes([definition("a", { fatigue: "ALTA" }), definition("b", { fatigue: "ALTA" })]), no: () => codes([definition("a", { fatigue: "ALTA" })]) },
    { code: "HIGH_FATIGUE_POSITION", yes: () => codes([definition("a"), definition("b", { fatigue: "ALTA" })]), no: () => codes([definition("a", { fatigue: "ALTA" }), definition("b")]) },
    { code: "HIGH_FATIGUE_ADJACENT", yes: () => codes([definition("a", { fatigue: "ALTA" }), definition("b", { fatigue: "ALTA" })]), no: () => codes([definition("a", { fatigue: "ALTA" }), definition("b"), definition("c", { fatigue: "ALTA" })]) },
    { code: "HIGH_INTERFERENCE_ADJACENT", yes: () => codes([definition("a", { interference: "ALTA" }), definition("b", { interference: "ALTA" })]), no: () => codes([definition("a", { interference: "ALTA" }), definition("b"), definition("c", { interference: "ALTA" })]) },
    { code: "AUDITORY_ONLY_ADJACENT", yes: () => codes([definition("span-numerico"), definition("span-numerico-inverso")]), no: () => codes([definition("span-numerico"), definition("b")]) },
    { code: "COGNITIVE_CONCENTRATION", yes: () => codes([definition("a", { mechanicalPrimary: "x" }), definition("b", { mechanicalPrimary: "x" }), definition("c", { mechanicalPrimary: "x" })]), no: () => codes([definition("a"), definition("b"), definition("c")]) },
    { code: "PLANNING_WINDOW_COUNT", yes: () => codes([definition("a", { executionModel: "PLANNING_WINDOW" }), definition("b", { executionModel: "PLANNING_WINDOW" })]), no: () => codes([definition("a", { executionModel: "PLANNING_WINDOW" })]) },
    { code: "PLANNING_WINDOW_ADJACENT", yes: () => codes([definition("a", { executionModel: "PLANNING_WINDOW" }), definition("b", { executionModel: "PLANNING_WINDOW" })]), no: () => codes([definition("a", { executionModel: "PLANNING_WINDOW" }), definition("b"), definition("c", { executionModel: "PLANNING_WINDOW" })]) },
    { code: "OPEN_POSITION_NOT_ELIGIBLE", yes: () => codes([definition("a", { sessionEligibility: { canOpen: false, canClose: true, preferredPositions: ["OPEN"], preferredPositionNote: "início", badCombinations: [] } })]), no: () => codes([definition("a")]) },
    { code: "CLOSE_POSITION_NOT_ELIGIBLE", yes: () => codes([definition("a"), definition("b", { sessionEligibility: { canOpen: true, canClose: false, preferredPositions: ["CLOSE"], preferredPositionNote: "fim", badCombinations: [] } })]), no: () => codes([definition("a"), definition("b")]) },
    { code: "OUTSIDE_BEST_POSITION", yes: () => codes([definition("a", { sessionEligibility: { canOpen: true, canClose: true, preferredPositions: ["MIDDLE"], preferredPositionNote: "meio", badCombinations: [] } })]), no: () => codes([definition("a")]) },
    { code: "DECLARED_BAD_COMBINATION", yes: () => codes([definition("a", { sessionEligibility: { canOpen: true, canClose: true, preferredPositions: ["OPEN"], preferredPositionNote: "início", badCombinations: [{ exerciseId: "b", reason: "teste" }] } }), definition("b")]), no: () => codes([definition("a"), definition("b")]) },
  ];

  it.each(checks)("dispara e não dispara $code", ({ code, yes, no }) => {
    expect(yes()).toContain(code);
    expect(no()).not.toContain(code);
  });

  it("conta adjacências uma vez por par e nunca bloqueia salvar", () => {
    const alerts = validateComposition({ targetMinutes: 20, durationRange: [20, 20], baselineLoad: 0, exercises: ["a", "b", "c"].map((id, index) => resolved(definition(id, { interference: "ALTA" }), index)) });
    expect(alerts.filter((alert) => alert.code === "HIGH_INTERFERENCE_ADJACENT")).toHaveLength(2);
    expect(alerts.every((alert) => alert.blocksSave === false)).toBe(true);
  });

  it("omite somente os quatro alertas com tabela quando a duração não tem referência clínica", () => {
    const exercises = ["a", "b", "c"].map((id) => definition(id, {
      executionModel: "PLANNING_WINDOW",
      fatigue: "ALTA",
      interference: "ALTA",
    }));
    const result = codes(exercises, [31, 31], 100, 35);

    expect(result).not.toContain("LOAD_AT_CAP");
    expect(result).not.toContain("LOAD_OVER_CAP");
    expect(result).not.toContain("HIGH_FATIGUE_COUNT");
    expect(result).not.toContain("PLANNING_WINDOW_COUNT");
    expect(result).toEqual(expect.arrayContaining([
      "SESSION_BELOW_TARGET",
      "HIGH_FATIGUE_ADJACENT",
      "HIGH_FATIGUE_POSITION",
      "HIGH_INTERFERENCE_ADJACENT",
      "PLANNING_WINDOW_ADJACENT",
    ]));
  });

  it.each([
    [20, 7, 1],
    [30, 10, 2],
    [40, 13, 2],
  ])("mantém as referências discretas aprovadas para %s min", (target, loadReference, countCap) => {
    const overCount = Array.from({ length: countCap + 1 }, (_, index) => definition(`e${index}`, {
      executionModel: "PLANNING_WINDOW",
      fatigue: "ALTA",
    }));
    const atCount = overCount.slice(0, countCap);
    const atReference = codes(overCount, [target, target], loadReference, target);
    const overReference = codes(overCount, [target, target], loadReference + 1, target);
    const atCaps = codes(atCount, [target, target], 0, target);

    expect(atReference).toContain("LOAD_AT_CAP");
    expect(atReference).not.toContain("LOAD_OVER_CAP");
    expect(overReference).toContain("LOAD_OVER_CAP");
    expect(atReference).toEqual(expect.arrayContaining(["HIGH_FATIGUE_COUNT", "PLANNING_WINDOW_COUNT"]));
    expect(atCaps).not.toContain("HIGH_FATIGUE_COUNT");
    expect(atCaps).not.toContain("PLANNING_WINDOW_COUNT");
  });
});
