import { describe, expect, it } from "vitest";
import { toggleOpenExercise } from "../panel-preference";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import {
  firstLevelAlertCardCounts,
  formatMinutesRange,
  limitAlertGroup,
  presentPlan,
} from "./presentation";
import type { SessionPrescription } from "./types";

const allExerciseIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);

function completePlan(): SessionPrescription {
  return {
    targetMinutes: 40,
    exercises: allExerciseIds.map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
  };
}

describe("divulgação progressiva dos alertas", () => {
  it("expõe contagem e dado principal corretos nos alertas agrupados", () => {
    const plan = completePlan();
    const core = interpretPlan(plan);
    const presentation = presentPlan(plan);
    const cards = Object.values(presentation.alertGroups).flat();

    for (const card of cards.filter((alert) => alert.ocorrencias)) {
      expect(card.occurrenceCount).toBe(card.ocorrencias?.length);
    }

    expect(presentation.alertGroups.revisao_plano.find((alert) => alert.code === "LOAD_OVER_CAP"))
      .toMatchObject({ dadoPrincipal: `${core.baselineLoad} / referência ${core.loadReference}`, expansionLabel: "Ver detalhes" });
    expect(presentation.alertGroups.revisao_plano.find((alert) => alert.code === "HIGH_FATIGUE_COUNT"))
      .toMatchObject({ dadoPrincipal: `${core.fatigueSummary.ALTA} atividades`, expansionLabel: "Ver exercícios" });
    expect(presentation.alertGroups.revisao_plano.find((alert) => alert.code === "HIGH_FATIGUE_ADJACENT"))
      .toMatchObject({ dadoPrincipal: "4 sequências", occurrenceCount: 4, expansionLabel: "Ver sequências" });
    expect(presentation.alertGroups.revisao_plano.find((alert) => alert.code === "SESSION_SAFE_MAX_EXCEEDED")?.dadoPrincipal)
      .toBe(formatMinutesRange(core.durationRange));
  });

  it("faz a contagem de Ver mais coincidir com cada item oculto", () => {
    const groups = presentPlan(completePlan()).alertGroups;
    const revisions = limitAlertGroup(groups.revisao_plano, "revisao_plano");
    const observations = limitAlertGroup(groups.observacao_clinica, "observacao_clinica");

    expect(revisions.hiddenCount).toBe(groups.revisao_plano.length - revisions.initial.length);
    expect(revisions.hidden).toHaveLength(revisions.hiddenCount);
    expect(observations.hiddenCount).toBe(groups.observacao_clinica.length - observations.initial.length);
    expect(observations.hidden).toHaveLength(observations.hiddenCount);
  });

  it("limita somente a exibição sem reduzir o retorno do núcleo", () => {
    const plan = completePlan();
    const core = interpretPlan(plan);
    const presentation = presentPlan(plan);
    const revisions = limitAlertGroup(presentation.alertGroups.revisao_plano, "revisao_plano");
    const observations = limitAlertGroup(presentation.alertGroups.observacao_clinica, "observacao_clinica");

    expect(presentation.alerts).toHaveLength(core.alerts.length);
    expect(revisions.initial.length + revisions.hidden.length).toBe(presentation.alertGroups.revisao_plano.length);
    expect(observations.initial.length + observations.hidden.length).toBe(presentation.alertGroups.observacao_clinica.length);
  });

  it("mantém 4 revisões, 3 observações e 1 bloco de informações no primeiro nível com 34 exercícios", () => {
    const presentation = presentPlan(completePlan());

    expect(presentation.exercises).toHaveLength(34);
    expect(firstLevelAlertCardCounts(presentation.alertGroups)).toEqual({
      revisao_plano: 4,
      observacao_clinica: 3,
      informacao: 1,
    });
  });

  it("mantém ocorrências individuais e posição preferencial acessíveis no objeto apresentado", () => {
    const presentation = presentPlan(completePlan());
    const preferredPosition = presentation.alertGroups.informacao.find((alert) => alert.code === "OUTSIDE_BEST_POSITION");
    const representedOccurrences = Object.values(presentation.alertGroups).flat()
      .reduce((total, alert) => total + (alert.ocorrencias?.length ?? 1), 0);

    expect(preferredPosition?.ocorrencias).toHaveLength(13);
    expect(preferredPosition?.occurrenceCount).toBe(13);
    expect(representedOccurrences).toBe(presentation.alerts.length);
  });

  it("abrir Ajustar troca apenas o id visual aberto e não altera a dose", () => {
    const dose = { kind: "protocol", protocol: "PADRAO" } as const;
    const prescription = { exerciseId: "span-numerico", order: 1, dose } as const;

    expect(toggleOpenExercise(null, prescription.exerciseId)).toBe(prescription.exerciseId);
    expect(prescription.dose).toBe(dose);
    expect(prescription.dose).toEqual({ kind: "protocol", protocol: "PADRAO" });
  });
});
