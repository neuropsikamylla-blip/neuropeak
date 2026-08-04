import { describe, expect, it } from "vitest";
import {
  addPlanExercise,
  buildPlanExercises,
  parsePlanExercises,
} from "../exercise-plan";
import { convertLegacyDose } from "./dose-settings";
import { interpretPlan } from "./interpreter";
import { readLegacyPlan } from "./legacy";

describe("operações puras da interface de dose", () => {
  it("grava PADRAO explicitamente para cada exercício adicionado a um plano novo", () => {
    let selection = addPlanExercise([], {}, "span-numerico");
    selection = addPlanExercise(selection.ids, selection.settingsById, "tempo-reacao");

    expect(buildPlanExercises(selection.ids, selection.settingsById)).toEqual([
      { id: "span-numerico", settings: { protocol: "PADRAO" } },
      { id: "tempo-reacao", settings: { protocol: "PADRAO" } },
    ]);
  });

  it("buildPlanExercises preserva protocol já existente", () => {
    const settings = { "span-numerico": { protocol: "ESTENDIDO", allowReplay: true } };
    expect(buildPlanExercises(["span-numerico"], settings)).toEqual([
      { id: "span-numerico", settings: { protocol: "ESTENDIDO", allowReplay: true } },
    ]);
  });

  it("abrir e reconstruir plano legado não injeta protocol nem remove trials", () => {
    const raw = [{ id: "span-numerico", settings: { trials: 15, allowReplay: true } }];
    const parsed = parsePlanExercises(raw);
    const rebuilt = buildPlanExercises(
      parsed.map((entry) => entry.id),
      Object.fromEntries(parsed.map((entry) => [entry.id, entry.settings])),
    );

    expect(rebuilt).toEqual(raw);
    expect(readLegacyPlan(rebuilt).plan.exercises[0].dose).toEqual({
      kind: "legacyCustom", unitCount: 15, sourceKey: "trials",
    });
  });

  it("só a conversão pedida grava protocol e remove trials", () => {
    const settings = { trials: 15, allowReplay: true };
    expect(buildPlanExercises(["span-numerico"], { "span-numerico": settings })).toEqual([
      { id: "span-numerico", settings },
    ]);
    expect(convertLegacyDose(settings, "BREVE")).toEqual({ protocol: "BREVE", allowReplay: true });
    expect(settings).toEqual({ trials: 15, allowReplay: true });
  });

  it("Breve, Padrão e Estendido produzem durações de sessão diferentes", () => {
    const duration = (protocol: "BREVE" | "PADRAO" | "ESTENDIDO") => interpretPlan({
      targetMinutes: 20,
      exercises: [{ exerciseId: "span-numerico", order: 1, dose: { kind: "protocol", protocol } }],
    }).durationRange;
    expect([duration("BREVE"), duration("PADRAO"), duration("ESTENDIDO")]).toEqual([
      [3, 4], [6, 7], [9, 10],
    ]);
  });

  it("allowReplay continua sem alterar duração, carga ou fadiga", () => {
    const result = (allowReplay: boolean) => interpretPlan(readLegacyPlan([{
      id: "span-numerico",
      settings: { protocol: "PADRAO", allowReplay },
    }]).plan);
    const disabled = result(false);
    const enabled = result(true);
    expect(enabled.durationRange).toEqual(disabled.durationRange);
    expect(enabled.baselineLoad).toBe(disabled.baselineLoad);
    expect(enabled.fatigueSummary).toEqual(disabled.fatigueSummary);
  });

  it("modalidade continua recalculando a duração", () => {
    const duration = (presentationMode: "visual" | "audioOnly") => interpretPlan(readLegacyPlan([{
      id: "restaurante-ordem",
      settings: { protocol: "PADRAO", presentationMode },
    }]).plan).durationRange;
    expect(duration("audioOnly")).not.toEqual(duration("visual"));
  });

  it("level e startLevel sobrevivem intactos a adição, reconstrução e conversão", () => {
    const legacySettings = { trials: 15, level: 4, startLevel: 2, allowReplay: false };
    const selection = addPlanExercise([], { "span-numerico": legacySettings }, "span-numerico");
    expect(selection.settingsById["span-numerico"]).toEqual(legacySettings);

    const converted = convertLegacyDose(selection.settingsById["span-numerico"], "ESTENDIDO");
    expect(converted).toMatchObject({ level: 4, startLevel: 2, protocol: "ESTENDIDO" });
    expect(buildPlanExercises(selection.ids, { "span-numerico": converted })[0]).toEqual({
      id: "span-numerico",
      settings: converted,
    });
  });
});
