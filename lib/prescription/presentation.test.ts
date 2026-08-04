import { describe, expect, it } from "vitest";
import {
  ALERT_PRESENTATION_CONFIG,
  EXECUTION_MODEL_LABELS,
  PRESENTATION_TEXTS,
  SESSION_STATE_LABELS,
  formatFatigueSummary,
  formatInterferenceSummary,
  formatLoad,
  formatMinutesRange,
  groupAlerts,
  presentAlert,
  presentCatalogExercise,
  presentExercise,
  presentLegacyPlan,
  presentPlan,
  visualSeverity,
} from "./presentation";
import { EXERCISE_CATALOG } from "./catalog";
import type { AlertCode, PrescriptionAlert } from "./types";

const alertCodes = Object.keys(ALERT_PRESENTATION_CONFIG) as AlertCode[];
const context = {
  targetMinutes: 30 as const,
  durationRange: [27, 33] as const,
  baselineLoad: 8,
  loadReference: 10,
  exercises: [],
};

function alert(code: AlertCode, severity: PrescriptionAlert["severity"] = "atencao"): PrescriptionAlert {
  return { code, severity, message: "texto interno", exerciseIds: [], blocksSave: false };
}

describe("apresentação consultiva da prescrição", () => {
  it.each(alertCodes)("traduz o alerta %s com título e mensagem visíveis", (code) => {
    const translated = presentAlert(alert(code), context);
    expect(translated.titulo.length).toBeGreaterThan(0);
    expect(translated.mensagem.length).toBeGreaterThan(0);
  });

  it("usa títulos e mensagens em português", () => {
    expect(presentAlert(alert("SESSION_BELOW_TARGET"), context)).toMatchObject({
      titulo: "Duração abaixo da faixa esperada",
      mensagem: "A estimativa de 27–33 min fica abaixo da faixa esperada de 27–33 min.",
    });
    expect(presentAlert(alert("HIGH_FATIGUE_ADJACENT"), context).sugestao).toContain("Considere");
  });

  it("deriva e agrupa as três gravidades consultivas", () => {
    const informative = presentAlert(alert("SESSION_RANGE_PARTIAL", "informativa"), context);
    const attention = presentAlert(alert("SESSION_ABOVE_TARGET"), context);
    const revision = presentAlert(alert("LOAD_OVER_CAP"), context);
    expect(visualSeverity(alert("OUTSIDE_BEST_POSITION", "informativa"))).toBe("informativo");
    expect(groupAlerts([informative, attention, revision])).toEqual({
      revisao_recomendada: [revision],
      atencao: [attention],
      informativo: [informative],
    });
  });

  it("rotula os quatro modelos sem expor o código", () => {
    expect(EXECUTION_MODEL_LABELS).toEqual({
      CONTINUOUS_TIMED: "Por tempo",
      CLOSED_PROTOCOL: "Por protocolo",
      PLANNING_WINDOW: "Janela de planejamento",
      FIXED_HIGH_FATIGUE: "Duração fixa",
    });
  });

  it("rotula os quatro estados", () => {
    expect(SESSION_STATE_LABELS).toEqual({
      ABAIXO: "Abaixo do esperado",
      DENTRO: "Dentro do esperado",
      ACIMA: "Acima do esperado",
      EXCESSO_IMPORTANTE: "Excesso importante",
    });
  });

  it("formata faixas com travessão e decimais em português", () => {
    expect(formatMinutesRange([27, 33])).toBe("27–33 min");
    expect(formatMinutesRange([27.5, 32.5])).toBe("27,5–32,5 min");
    expect(formatMinutesRange([27, 33])).not.toContain("27-33");
  });

  it("formata carga, referência e aviso consultivo", () => {
    expect(formatLoad(8, 10)).toEqual({
      text: "Carga basal: 8 / referência 10",
      helper: "Referência consultiva; não determina se o plano é válido.",
    });
  });

  it("resume fadiga e interferência omitindo níveis zerados", () => {
    const summary = { BAIXA: 0, MODERADA: 2, ALTA: 1 } as const;
    expect(formatFatigueSummary(summary)).toBe("2 moderadas · 1 alta");
    expect(formatInterferenceSummary(summary)).toBe("2 moderadas · 1 alta");
    expect(formatFatigueSummary({ BAIXA: 0, MODERADA: 0, ALTA: 0 })).toBe("Nenhuma");
  });

  it("apresenta plano vazio como abaixo, sem alertas confusos", () => {
    const plan = presentPlan({ targetMinutes: 30, exercises: [] });
    expect(plan.durationRange).toEqual([0, 0]);
    expect(plan.estimateLabel).toBe("Estimativa: 0 min");
    expect(plan.stateLabel).toBe("Abaixo do esperado");
    expect(plan.alerts).toEqual([]);
    expect(plan.emptyGuidance).toBe(PRESENTATION_TEXTS.emptyGuidance);
  });

  it("interpreta plano legado sem marcar parâmetros que têm padrão determinável", () => {
    const plan = presentLegacyPlan(["tempo-reacao"], 30);
    expect(plan.exercises).toHaveLength(1);
    expect(plan.exercises[0].doseLabel).toBe("Protocolo padrão");
    expect(plan.legacyMarker).toBeUndefined();
  });

  it("marca discretamente parâmetro legado que não pôde ser determinado", () => {
    const plan = presentLegacyPlan(["tempo-reacao", "id-desconhecido"], 30);
    expect(plan.legacyMarker).toEqual({
      label: "Alguns parâmetros não puderam ser determinados.",
      tooltip: PRESENTATION_TEXTS.legacyTooltip,
    });
    expect(plan.exercises).toHaveLength(1);
    expect(presentLegacyPlan([{ id: "tempo-reacao", settings: { protocol: "desconhecido" } }], 30).legacyMarker).toBeDefined();
  });

  it("apresenta o protocolo padrão de todos os 34 exercícios em texto legível", () => {
    const labels = EXERCISE_CATALOG.map((definition) => presentCatalogExercise(definition.exerciseId)?.protocolLabel);
    expect(labels).toHaveLength(34);
    expect(labels.every((label) => label?.startsWith("Protocolo padrão: "))).toBe(true);
    expect(labels.every((label) => /\d+ blocos? · .+ min$/.test(label ?? ""))).toBe(true);
  });

  it("apresenta o perfil cognitivo de todos os 34 exercícios em texto legível", () => {
    const labels = EXERCISE_CATALOG.map((definition) => presentCatalogExercise(definition.exerciseId)?.cognitiveProfileLabel);
    expect(labels).toHaveLength(34);
    expect(labels.every((label) => Boolean(label?.trim()))).toBe(true);
    expect(labels.join(" ")).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
  });

  // O catálogo entrega os perfis já redigidos em português ("Atenção Sustentada"); a apresentação
  // só normaliza a caixa. Este teste usa o formato real, não um identificador técnico inventado.
  it("mostra apenas o perfil primário quando não há perfis associados", () => {
    const definition = {
      ...EXERCISE_CATALOG[0],
      mechanicalPrimary: "Atenção Sustentada",
      associatedCognitiveProfiles: [],
    };
    const exercise = presentExercise({
      definition,
      prescription: { exerciseId: definition.exerciseId, order: 1 },
      prescribedMinutes: [6, 6],
    });
    expect(exercise.cognitiveProfileLabel).toBe("Atenção sustentada");
    expect(exercise.cognitiveProfileLabel).not.toMatch(/[·,:]$/);
  });

  it("não deixa códigos técnicos chegarem aos textos visíveis", () => {
    const visibleTexts = alertCodes.flatMap((code) => {
      const item = presentAlert(alert(code), context);
      return [item.titulo, item.mensagem, item.sugestao ?? "", ...item.exercicios];
    });
    for (const definition of EXERCISE_CATALOG) {
      const exercise = presentCatalogExercise(definition.exerciseId);
      if (exercise) visibleTexts.push(exercise.protocolLabel, exercise.cognitiveProfileLabel);
    }
    expect(visibleTexts.join(" ")).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
  });

  it("mantém configuração exaustiva para o tipo dos 18 códigos", () => {
    type MissingCode = Exclude<AlertCode, keyof typeof ALERT_PRESENTATION_CONFIG>;
    type ExtraCode = Exclude<keyof typeof ALERT_PRESENTATION_CONFIG, AlertCode>;
    const typeIsExhaustive: MissingCode extends never ? (ExtraCode extends never ? true : false) : false = true;
    expect(typeIsExhaustive).toBe(true);
    expect(alertCodes).toHaveLength(18);
  });

  it("não introduz comportamento bloqueante em nenhum alerta", () => {
    const translated = alertCodes.map((code) => presentAlert(alert(code), context));
    expect(translated.every((item) => item.blocksSave === false)).toBe(true);
    expect(presentLegacyPlan(["tempo-reacao"], 30).canSave).toBe(true);
  });
});
