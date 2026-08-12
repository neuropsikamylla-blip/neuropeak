import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";

describe("catálogo de prescrição", () => {
  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
  it("porta os 33 IDs canônicos", () => {
    const canonical = readFileSync("docs/architecture/CANONICAL_EXERCISES.md", "utf8");
    const ids = [...canonical.matchAll(/\| \d+ \| `([^`]+)`/g)].map((match) => match[1]);
    expect(EXERCISE_CATALOG).toHaveLength(33);
    expect(EXERCISE_CATALOG.map((exercise) => exercise.exerciseId)).toEqual(ids);
  });

  it("preserva texto e converte duração decimal para minutos", () => {
    const cuboCorsi = EXERCISE_CATALOG.find((exercise) => exercise.exerciseId === "cubo-corsi")!;
    expect(cuboCorsi.protocols.PADRAO).toMatchObject({ durationText: "~8 min", durationMinutes: 8 });
  });
});
