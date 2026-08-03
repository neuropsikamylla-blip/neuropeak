import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";

describe("catálogo de prescrição", () => {
  it("porta os 34 IDs canônicos", () => {
    const canonical = readFileSync("docs/architecture/CANONICAL_EXERCISES.md", "utf8");
    const ids = [...canonical.matchAll(/\| \d+ \| `([^`]+)`/g)].map((match) => match[1]);
    expect(EXERCISE_CATALOG).toHaveLength(34);
    expect(EXERCISE_CATALOG.map((exercise) => exercise.exerciseId)).toEqual(ids);
  });

  it("preserva texto e converte duração decimal para minutos", () => {
    const nback = EXERCISE_CATALOG.find((exercise) => exercise.exerciseId === "nback")!;
    expect(nback.protocols.PADRAO).toMatchObject({ durationText: "~7,5 min", durationMinutes: 7.5 });
  });
});
