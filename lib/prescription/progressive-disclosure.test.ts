import { describe, expect, it } from "vitest";
import { toggleOpenExercise } from "../panel-preference";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import {
  firstLevelAlertCardCounts,
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

describe("divulgação progressiva dos insights", () => {
  it("mantém os pares cognitivos apenas nos detalhes", () => {
    const presentation = presentPlan(completePlan());
    const concentration = presentation.alertGroups.observacao_clinica.find((alert) =>
      alert.titulo.startsWith("Sobreposição"));

    expect(concentration?.dadoPrincipal).toBeUndefined();
    expect(concentration?.mensagem).not.toMatch(/\d/);
    expect(concentration?.ocorrencias).toHaveLength(41);
    expect(concentration?.occurrenceCount).toBe(41);
    expect(concentration?.expansionLabel).toBe("Ver detalhes");
  });

  it("mantém os limites visuais sem esconder insights no plano completo", () => {
    const groups = presentPlan(completePlan()).alertGroups;
    const revisions = limitAlertGroup(groups.revisao_plano, "revisao_plano");
    const observations = limitAlertGroup(groups.observacao_clinica, "observacao_clinica");

    expect(revisions.hiddenCount).toBe(0);
    expect(observations.hiddenCount).toBe(0);
    expect(revisions.initial).toHaveLength(1);
    expect(observations.initial).toHaveLength(2);
  });

  it("mantém três cartões de primeiro nível e 66 ocorrências no núcleo", () => {
    const plan = completePlan();
    const core = interpretPlan(plan);
    const presentation = presentPlan(plan);

    expect(core.alerts).toHaveLength(66);
    expect(firstLevelAlertCardCounts(presentation.alertGroups)).toEqual({
      revisao_plano: 1,
      observacao_clinica: 2,
      informacao: 0,
    });
  });

  it("expande a intensidade pelos exercícios de fadiga alta, sem expor a escala", () => {
    const intensity = presentPlan(completePlan()).alertGroups.revisao_plano[0];
    expect(intensity.expansionLabel).toBe("Ver exercícios");
    expect(intensity.exercicios).toHaveLength(12);
    expect(intensity).not.toHaveProperty("dadoPrincipal");
  });

  it("expande o planejamento pelos seis exercícios envolvidos", () => {
    const planning = presentPlan(completePlan()).alertGroups.observacao_clinica.find((alert) =>
      alert.titulo === "Planejamento prolongado");
    expect(planning?.expansionLabel).toBe("Ver exercícios");
    expect(planning?.exercicios).toHaveLength(6);
  });

  it("abrir Ajustar troca apenas o id visual aberto e não altera a dose", () => {
    const dose = { kind: "protocol", protocol: "PADRAO" } as const;
    const prescription = { exerciseId: "span-numerico", order: 1, dose } as const;

    expect(toggleOpenExercise(null, prescription.exerciseId)).toBe(prescription.exerciseId);
    expect(prescription.dose).toBe(dose);
    expect(prescription.dose).toEqual({ kind: "protocol", protocol: "PADRAO" });
  });
});
