import { describe, expect, it } from "vitest";
import {
  ALERT_PRESENTATION_CONFIG,
  ADAPTIVE_VALIDITY_NOTE,
  EXECUTION_MODEL_LABELS,
  PRESENTATION_TEXTS,
  PROTOCOL_EXPOSURE_TEXTS,
  PROTOCOL_GUIDANCE_TEXTS,
  REVISION_CODES,
  CLINICAL_OBSERVATION_CODES,
  INFORMATION_CODES,
  SESSION_STATE_LABELS,
  formatFatigueSummary,
  formatInterferenceSummary,
  formatMinutesRange,
  groupAlerts,
  presentAlert,
  presentCatalogExercise,
  presentExercise,
  presentLegacyPlan,
  presentPlan,
  protocolOptions,
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
    expect(presentAlert(alert("HIGH_FATIGUE_ADJACENT"), context).mensagem)
      .toBe("Esta ocorrência não é exibida na revisão do plano.");
  });

  it("deriva e agrupa as três gravidades consultivas", () => {
    const informative = presentAlert(alert("SESSION_RANGE_PARTIAL", "informativa"), context);
    const attention = presentAlert(alert("SESSION_ABOVE_TARGET"), context);
    const revision = presentAlert(alert("LOAD_OVER_CAP"), context);
    expect(visualSeverity(alert("OUTSIDE_BEST_POSITION", "informativa"))).toBe("informacao");
    expect(groupAlerts([informative, attention, revision])).toEqual({
      revisao_plano: [revision],
      observacao_clinica: [],
      informacao: [informative, attention],
    });
  });

  it("distribui os 18 códigos entre os três níveis visuais", () => {
    expect([...REVISION_CODES]).toEqual([
      "LOAD_AT_CAP", "LOAD_OVER_CAP", "HIGH_FATIGUE_COUNT",
    ]);
    expect([...CLINICAL_OBSERVATION_CODES]).toEqual([
      "COGNITIVE_CONCENTRATION", "DECLARED_BAD_COMBINATION", "AUDITORY_ONLY_ADJACENT",
      "PLANNING_WINDOW_COUNT",
    ]);
    expect([...INFORMATION_CODES]).toEqual([
      "SESSION_BELOW_TARGET", "SESSION_ABOVE_TARGET", "SESSION_RANGE_PARTIAL",
      "SESSION_SAFE_MAX_EXCEEDED", "OUTSIDE_BEST_POSITION", "OPEN_POSITION_NOT_ELIGIBLE",
      "CLOSE_POSITION_NOT_ELIGIBLE", "HIGH_FATIGUE_POSITION", "HIGH_FATIGUE_ADJACENT",
      "HIGH_INTERFERENCE_ADJACENT", "PLANNING_WINDOW_ADJACENT",
    ]);
    expect(new Set([...REVISION_CODES, ...CLINICAL_OBSERVATION_CODES, ...INFORMATION_CODES]).size).toBe(18);
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

  it.each([
    [26, "23,4–28,6 min", ["27–33 min"]],
    [35, "31,5–38,5 min", ["27–33 min", "36–44 min"]],
    [37, "33,3–40,7 min", ["36–44 min"]],
    [45, "40,5–49,5 min", ["36–44 min"]],
  ] as const)("apresenta a faixa derivada de %s min sem arredondar o alvo", (targetMinutes, expected, roundedRanges) => {
    // A estimativa precisa ser distinta das faixas proibidas: o `context` padrão usa [27, 33],
    // que apareceria na mensagem como estimativa e daria falso positivo na checagem abaixo.
    const translated = presentAlert(alert("SESSION_BELOW_TARGET"), { ...context, targetMinutes, durationRange: [11, 12] });
    expect(translated.mensagem).toContain(expected);
    for (const roundedRange of roundedRanges) expect(translated.mensagem).not.toContain(roundedRange);
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
    expect(plan.estimateDetail).toBe("Nenhum exercício selecionado.");
    expect(plan.stateLabel).toBe("Abaixo da faixa esperada");
    expect(plan.alerts).toEqual([]);
    expect(plan.emptyGuidance).toBe(PRESENTATION_TEXTS.emptyGuidance);
  });

  it("interpreta plano legado sem marcar parâmetros que têm padrão determinável", () => {
    const plan = presentLegacyPlan(["tempo-reacao"], 30);
    expect(plan.exercises).toHaveLength(1);
    expect(plan.exercises[0].doseLabel).toBe("Protocolo padrão");
    expect(plan.legacyMarker).toBeUndefined();
  });

  it.each([26, 35, 37, 45])("não marca %s min como legado nem arredonda a duração prescrita", (targetMinutes) => {
    const plan = presentLegacyPlan(["tempo-reacao"], targetMinutes);
    expect(plan.prescribedMinutes).toBe(targetMinutes);
    expect(plan.prescribedLabel).toBe(`Sessão de ${targetMinutes} min`);
    expect(plan.legacyMarker).toBeUndefined();
  });

  it("não expõe a escala interna quando a duração não tem referência", () => {
    const plan = presentLegacyPlan(["tempo-reacao"], 26);
    expect(plan).not.toHaveProperty("loadText");
    expect(plan).not.toHaveProperty("loadHelper");
    // tempo-reacao é MODERADA em fadiga e em interferência no catálogo.
    expect(plan.fatigueText).toBe("1 moderada");
    expect(plan.interferenceText).toBe("1 moderada");
    expect(plan.canSave).toBe(true);
  });

  it("não expõe a escala interna mesmo quando existe referência clínica", () => {
    const plan = presentLegacyPlan(["tempo-reacao", "letras-sequencia", "certo-ou-errado"], 20);
    expect(plan).not.toHaveProperty("loadText");
    expect(plan).not.toHaveProperty("loadHelper");
    expect(JSON.stringify(PRESENTATION_TEXTS)).not.toMatch(/carga basal/i);
  });

  it("resume a duração como meta e estado, sem número de estimativa", () => {
    const plan = presentLegacyPlan(["tempo-reacao", "letras-sequencia", "certo-ou-errado"], 20);
    expect([plan.targetLabel, plan.stateLabel]).toEqual(["20 minutos", "Dentro da faixa esperada"]);
    // Nenhum número de estimativa no que o cabeçalho exibe.
    expect(plan.stateLabel).not.toMatch(/\d/);
    // O tempo previsto existe, mas só sob demanda.
    expect(plan.estimateDetail).toMatch(/Tempo previsto para este plano: .+ min\./);
  });

  it("o estado nunca contradiz a faixa, porque não há ponto único no cabeçalho", () => {
    // Caso que motivou a correção: faixa [30, 40] com meta 40 exibia "aproximadamente 35 min"
    // ao lado de "dentro de 36–44".
    const plan = presentPlan({
      targetMinutes: 40,
      exercises: ["torre-hanoi", "labirinto", "estacionamento-logico"].map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
    });
    expect(plan.stateLabel).toBe("Dentro da faixa esperada");
    expect(plan.stateLabel).not.toMatch(/\d/);
    expect(plan.estimateDetail).toContain("Tempo previsto para este plano: 30–40 min");
  });

  it("abre envelope antigo com duração contínua salva sem converter o formato", () => {
    const raw = { targetMinutes: 45, exercises: ["tempo-reacao"] };
    const before = structuredClone(raw);
    const plan = presentLegacyPlan(raw);
    const currentDuration = presentLegacyPlan({ ...raw, targetMinutes: 30 }, 45);

    expect(plan.prescribedMinutes).toBe(45);
    expect(plan.legacyMarker).toBeUndefined();
    // A faixa esperada migrou do rótulo de estado para os detalhes.
    expect(currentDuration.estimateDetail).toContain("40,5–49,5 min");
    expect(raw).toEqual(before);
  });

  it("distingue protocolo atual, legado estimado e legado sem estimativa", () => {
    const current = presentLegacyPlan([{ id: "span-numerico", settings: { protocol: "PADRAO" } }], 30).exercises[0];
    expect(current).toMatchObject({
      doseLabel: "Protocolo padrão",
      durationLabel: "6 min",
      durationApproximate: false,
      durationEstimateAvailable: true,
    });

    const estimated = presentLegacyPlan([{ id: "span-numerico", settings: { trials: 15 } }], 30);
    expect(estimated.exercises[0]).toMatchObject({
      doseLabel: "15 tentativas",
      durationLabel: "11,25 min · aproximado",
      durationApproximate: true,
      durationEstimateAvailable: true,
    });
    expect(estimated.durationEstimateIncomplete).toBe(false);

    // Jogo da Memória: taxas por unidade 3,0 / 3,5 / 3,67 — não colineares, logo sem base segura
    // para estimar a dose legada. Não usar aqui um exercício PROVISIONAL_, cuja marca de
    // "Configuração provisória" substitui o rótulo da dose por outra regra.
    const unavailable = presentLegacyPlan([{ id: "jogo-memoria", settings: { trials: 15 } }], 30);
    expect(unavailable.exercises[0]).toMatchObject({
      doseLabel: "15 tentativas",
      durationLabel: "Duração aproximada — configuração anterior.",
      durationApproximate: false,
      durationEstimateAvailable: false,
    });
    expect(unavailable.durationEstimateIncomplete).toBe(true);

    // Exercício provisório: a marca substitui o rótulo da dose, e a janela de ajuste mostra o
    // bloco de configuração provisória em vez de protocolo ou conversão.
    const provisional = presentLegacyPlan([{ id: "antes-depois", settings: { trials: 15 } }], 30);
    expect(provisional.exercises[0]).toMatchObject({
      doseLabel: "Configuração provisória",
      provisional: true,
    });
  });

  it("marca discretamente parâmetro legado que não pôde ser determinado", () => {
    const plan = presentLegacyPlan(["tempo-reacao", "id-desconhecido"], 30);
    expect(plan.legacyMarker).toEqual({
      label: "Este plano usa uma configuração anterior.",
      tooltip: PRESENTATION_TEXTS.legacyTooltip,
    });
    expect(plan.exercises).toHaveLength(1);
    expect(presentLegacyPlan([{ id: "tempo-reacao", settings: { protocol: "desconhecido" } }], 30).legacyMarker).toBeDefined();
  });

  it("apresenta o protocolo padrão de todos os 34 exercícios em texto legível", () => {
    const labels = EXERCISE_CATALOG.map((definition) => presentCatalogExercise(definition.exerciseId)?.protocolLabel);
    expect(labels).toHaveLength(34);
    expect(labels.filter((label) => label?.startsWith("Protocolo padrão: "))).toHaveLength(33);
    expect(presentCatalogExercise("antes-depois")?.protocolLabel).toBe("Configuração provisória");
    expect(presentCatalogExercise("span-numerico")?.protocolLabel).toBe("Protocolo padrão: 8 séries · ~6 min");
    expect(presentCatalogExercise("restaurante-ordem")?.protocolLabel).toBe("Protocolo padrão: 5 rodadas · ~10 min");
    expect(presentCatalogExercise("informacao-em-foco")?.protocolLabel).toBe("Protocolo padrão: 5 tentativas · ~10 min");
    expect(presentCatalogExercise("desafio-supermercado")?.protocolLabel).toBe("Protocolo padrão: 5 rodadas · ~12 min");
    expect(presentCatalogExercise("torre-hanoi")?.protocolLabel).toBe("Protocolo padrão: 2 desafios completos · ~9 min");
  });

  it("expõe literalmente os três textos orientativos aprovados", () => {
    expect(PROTOCOL_GUIDANCE_TEXTS).toEqual({
      BREVE: "Dose reduzida. Pode ser útil para introdução à atividade, menor tolerância à fadiga, retorno após pausa ou sessões com maior variedade de exercícios.",
      PADRAO: "Dose habitual recomendada para a maioria dos treinos, equilibrando duração, repetição e adaptação.",
      ESTENDIDO: "Dose ampliada para treino focal, maior familiaridade com a tarefa ou sessões com menor número de exercícios. Pode aumentar a fadiga.",
    });
  });

  it("apresenta as três opções com unidade do catálogo e faixa estimada", () => {
    const options = protocolOptions("span-numerico");
    expect(options).toHaveLength(3);
    expect(options[1]).toMatchObject({
      protocol: "PADRAO",
      label: "Padrão",
      unitsLabel: "8 séries",
      durationRange: [6, 7],
      durationLabel: "Estimativa: 6–7 min",
      guidance: PROTOCOL_GUIDANCE_TEXTS.PADRAO,
    });
    expect(options[0].exposureNote).toBe(PROTOCOL_EXPOSURE_TEXTS.BREVE);
    expect(options[2].exposureNote).toBe(PROTOCOL_EXPOSURE_TEXTS.ESTENDIDO);
    expect(options[1].exposureNote).toBeUndefined();
  });

  it("deriva a observação adaptativa do clinicalValidity do protocolo BRIEF", () => {
    const allOptions = EXERCISE_CATALOG.flatMap((definition) => protocolOptions(definition.exerciseId));
    for (const option of allOptions) {
      expect(Boolean(option.adaptiveValidityNote)).toBe(option.protocol === "BREVE");
      if (option.adaptiveValidityNote) expect(option.adaptiveValidityNote).toBe(ADAPTIVE_VALIDITY_NOTE);
    }
    expect(protocolOptions("antes-depois")[0].adaptiveValidityNote).toBe(ADAPTIVE_VALIDITY_NOTE);
    expect(protocolOptions("span-numerico")[0].adaptiveValidityNote).toBe(ADAPTIVE_VALIDITY_NOTE);
    expect(ADAPTIVE_VALIDITY_NOTE).not.toContain("insuficiente para progressão");
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
      for (const option of protocolOptions(definition.exerciseId)) {
        visibleTexts.push(
          option.label,
          option.guidance,
          option.unitsLabel,
          option.durationLabel,
          option.adaptiveValidityNote ?? "",
          option.exposureNote ?? "",
        );
      }
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
