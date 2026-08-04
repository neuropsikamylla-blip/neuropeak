import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { addPlanExercise, buildPlanExercises, parsePlanExercises } from "../exercise-plan";

describe("nível fora da prescrição rotineira", () => {
  it("preserva level e startLevel ao abrir, editar outro campo e reconstruir", () => {
    const opened = parsePlanExercises([{
      id: "span-numerico",
      settings: { protocol: "PADRAO", level: 4, startLevel: 2, allowReplay: false },
    }]);
    const settingsById = Object.fromEntries(opened.map((entry) => [entry.id, entry.settings ?? {}]));

    settingsById["span-numerico"] = { ...settingsById["span-numerico"], allowReplay: true };

    expect(buildPlanExercises(opened.map((entry) => entry.id), settingsById)).toEqual([{
      id: "span-numerico",
      settings: { protocol: "PADRAO", level: 4, startLevel: 2, allowReplay: true },
    }]);
  });

  it("não inclui level nem startLevel ao montar um plano novo", () => {
    const selection = addPlanExercise([], {}, "span-numerico");
    const entry = buildPlanExercises(selection.ids, selection.settingsById)[0];

    expect(entry).toEqual({ id: "span-numerico", settings: { protocol: "PADRAO" } });
    expect(entry).not.toHaveProperty("settings.level");
    expect(entry).not.toHaveProperty("settings.startLevel");
  });

  it("não mantém o slider ou a seção de nível em ExerciseCard", () => {
    const source = readFileSync(resolve(process.cwd(), "components/plano/ExerciseCard.tsx"), "utf8");

    expect(source).not.toContain('type="range"');
    expect(source).not.toContain("Configurações de nível");
  });
});
