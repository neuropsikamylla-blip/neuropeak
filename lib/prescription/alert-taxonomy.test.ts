import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import { firstLevelAlertCardCounts, presentCatalogExercise, presentPlan, type PresentedAlert } from "./presentation";
import type { SessionPrescription } from "./types";

const allIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);

function plan(ids: readonly string[], targetMinutes = 40): SessionPrescription {
  return {
    targetMinutes,
    exercises: ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
  };
}

function visibleText(alert: PresentedAlert): string {
  return [
    alert.titulo,
    alert.mensagem,
    alert.sugestao ?? "",
    ...alert.exercicios,
    ...(alert.ocorrencias ?? []).flatMap((item) => [
      item.mensagem,
      item.sugestao ?? "",
      ...item.exercicios,
    ]),
  ].join(" ");
}

function allVisibleText(presentation: ReturnType<typeof presentPlan>): string {
  return Object.values(presentation.alertGroups).flat().map(visibleText).join(" ");
}

describe("assistente clínico da revisão do plano", () => {
  it("mostra zero insights em um plano variado e compatível", () => {
    const presentation = presentPlan(plan([
      "deductive-grid",
      "matriz-espacial",
      "certo-ou-errado",
    ], 30));

    expect(presentation.durationRange).toEqual([27, 32.5]);
    expect(presentation.alerts).toEqual([]);
    expect(Object.values(presentation.alertGroups).flat()).toEqual([]);
  });

  it("reduz o plano de 34 exercícios a no máximo cinco insights e mantém 66 ocorrências no núcleo", () => {
    const completePlan = plan(allIds);
    const core = interpretPlan(completePlan);
    const presentation = presentPlan(completePlan);
    const insights = Object.values(presentation.alertGroups).flat();

    expect(core.alerts).toHaveLength(66);
    expect(presentation.exercises).toHaveLength(34);
    expect(insights).toHaveLength(3);
    expect(insights.length).toBeLessThanOrEqual(5);
    expect(firstLevelAlertCardCounts(presentation.alertGroups)).toEqual({
      revisao_plano: 1,
      observacao_clinica: 2,
      informacao: 0,
    });
  });

  it("não mostra linguagem dependente da ordem, escala interna nem códigos técnicos", () => {
    const visible = allVisibleText(presentPlan(plan(allIds)));
    expect(visible).not.toMatch(/sequência|consecutiv|adjacen|encerramento|posição preferencial|carga basal/i);
    expect(visible).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
  });

  it("mantém a duração somente no cabeçalho, sem cartão de alerta", () => {
    const presentation = presentPlan(plan(allIds));
    expect(presentation.prescribedLabel).toBe("Sessão de 40 min");
    expect(presentation.estimateLabel).toMatch(/^Estimativa: aproximadamente \d+ min$/);
    expect(presentation.stateLabel).toBe("Acima da faixa esperada (36–44 min)");
    expect(presentation.alerts.some((alert) => alert.code.startsWith("SESSION_"))).toBe(false);
  });

  it("não cria insight de duração quando a estimativa está dentro da faixa", () => {
    const presentation = presentPlan(plan([
      "deductive-grid",
      "matriz-espacial",
      "certo-ou-errado",
    ], 30));
    expect(presentation.state).toBe("DENTRO");
    expect(presentation.stateLabel).toBe("Dentro da faixa esperada (27–33 min)");
    expect(presentation.alerts).toEqual([]);
  });

  it("funde fadiga e carga em um único insight qualitativo de intensidade", () => {
    const presentation = presentPlan(plan(allIds));
    const intensity = presentation.alertGroups.revisao_plano[0];
    expect(intensity).toMatchObject({
      titulo: "Plano de demanda elevada",
      mensagem: "12 dos 34 exercícios são potencialmente fatigantes para a duração escolhida. A carga do plano está acima da referência clínica para esta duração.",
      blocksSave: false,
    });
    expect(intensity.mensagem).not.toMatch(/69|13|carga basal/i);
  });

  it("não menciona carga quando a duração não tem referência clínica", () => {
    const presentation = presentPlan(plan(allIds, 35));
    expect(presentation.alertGroups.revisao_plano[0].mensagem).toMatch(/12 dos 34 exercícios.*fatigantes/);
    expect(allVisibleText(presentation)).not.toMatch(/carga|referência clínica/i);
  });

  it("mantém salvamento consultivo e não bloqueante", () => {
    const presentation = presentPlan(plan(allIds));
    expect(presentation.canSave).toBe(true);
    expect(presentation.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
  });

  // Verificação ESTÁTICA — ver a nota em assistant-clinical.test.ts.
  it("retira duração e carga da linha principal do exercício e conserva duração nos detalhes", () => {
    const fonte = readFileSync(resolve(process.cwd(), "components/plano/prescription/CompactExerciseMeta.tsx"), "utf8");
    const corte = fonte.indexOf("<details");
    expect(corte).toBeGreaterThan(0);
    const linhaPrincipal = fonte.slice(0, corte);
    const detalhes = fonte.slice(corte);

    expect(linhaPrincipal).toContain("doseLabel");
    expect(linhaPrincipal).toContain("fatigueLabel");
    expect(linhaPrincipal).not.toContain("durationLabel");
    expect(linhaPrincipal).not.toContain("loadLabel");
    expect(detalhes).toContain("durationLabel");
  });

  it("preserva o texto aprovado para Estacionamento Lógico e Jogo das Torres", () => {
    const presentation = presentPlan(plan(["estacionamento-logico", "torre-hanoi"]));
    const concentration = presentation.alertGroups.observacao_clinica.find((alert) =>
      alert.titulo === "Concentração de planejamento");
    expect(concentration?.mensagem).toBe(
      "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.",
    );
  });

  it("não promove contagem à mensagem principal da concentração", () => {
    const concentration = presentPlan(plan(allIds)).alertGroups.observacao_clinica.find((alert) =>
      alert.titulo === "Concentração cognitiva do plano");
    expect(concentration).toBeDefined();
    expect(`${concentration?.titulo} ${concentration?.mensagem}`).not.toMatch(/\d/);
    expect(concentration?.mensagem).toBe("Vários exercícios recrutam processos semelhantes.");
  });

  it("oculta regras de ordem da apresentação sem removê-las do núcleo", () => {
    const completePlan = plan(allIds);
    const coreCodes = interpretPlan(completePlan).alerts.map((alert) => alert.code);
    const visibleCodes = Object.values(presentPlan(completePlan).alertGroups).flat().map((alert) => alert.code);
    const hiddenCodes = [
      "HIGH_FATIGUE_ADJACENT",
      "PLANNING_WINDOW_ADJACENT",
      "HIGH_INTERFERENCE_ADJACENT",
    ] as const;

    for (const code of hiddenCodes) {
      expect(coreCodes).toContain(code);
      expect(visibleCodes).not.toContain(code);
    }
  });
});
