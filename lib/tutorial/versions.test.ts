import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "@/lib/prescription/catalog";
import { TUTORIAL_VERSIONS, tutorialVersionFor } from "./versions";

describe("catálogo de versões de tutorial", () => {
  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
  it("cobre exatamente os 33 exercícios canônicos", () => {
    const canonicalIds = EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId).sort();
    const versionedIds = Object.keys(TUTORIAL_VERSIONS).sort();

    expect(canonicalIds).toHaveLength(33);
    expect(versionedIds).toEqual(canonicalIds);
  });

  it("mantém os três reformulados em 2 e todos os demais em 1", () => {
    const reformulated = new Set(["vigilancia", "focus-agents", "informacao-em-foco"]);

    for (const [exerciseId, version] of Object.entries(TUTORIAL_VERSIONS)) {
      expect(version, exerciseId).toBe(reformulated.has(exerciseId) ? 2 : 1);
    }
  });

  it("usa somente inteiros positivos", () => {
    for (const version of Object.values(TUTORIAL_VERSIONS)) {
      expect(Number.isInteger(version)).toBe(true);
      expect(version).toBeGreaterThanOrEqual(1);
    }
  });

  it("devolve undefined para id desconhecido sem lançar", () => {
    expect(() => tutorialVersionFor("exercicio-inexistente")).not.toThrow();
    expect(tutorialVersionFor("exercicio-inexistente")).toBeUndefined();
    expect(tutorialVersionFor("toString")).toBeUndefined();
  });
});
