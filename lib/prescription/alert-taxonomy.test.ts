import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import { presentPlan, type PresentedAlert } from "./presentation";
import type { SessionPrescription } from "./types";

function plan(ids: readonly string[], targetMinutes: 20 | 30 | 40 = 40): SessionPrescription {
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

function declaredObservation(ids: readonly [string, string]): PresentedAlert {
  const presentation = presentPlan(plan(ids));
  const observation = presentation.alerts.find((alert) => alert.code === "DECLARED_BAD_COMBINATION");
  expect(observation).toBeDefined();
  return observation!;
}

describe("taxonomia consultiva e agrupamento dos alertas", () => {
  it.each([
    ["span-numerico", "span-numerico-inverso"],
    ["matriz-espacial", "matriz-espacial-inversa"],
    ["letras-sequencia", "span-numerico"],
  ] as const)("%s + %s não gera revisão do plano", (left, right) => {
    const presentation = presentPlan(plan([left, right]));
    expect(presentation.alertGroups.revisao_plano).toEqual([]);
    expect(presentation.alerts.find((alert) => alert.code === "DECLARED_BAD_COMBINATION")?.gravidadeVisual)
      .toBe("observacao_clinica");
  });

  it("mantém uma sessão focal em memória operacional salvável e com linguagem neutra", () => {
    const presentation = presentPlan(plan([
      "span-numerico",
      "letras-sequencia",
      "matriz-espacial",
    ]));
    expect(presentation.canSave).toBe(true);
    expect(presentation.alertGroups.revisao_plano).toEqual([]);
    expect(presentation.alerts.map(visibleText).join(" ")).not.toMatch(/combinação desfavorável/i);
  });

  it.each([
    [["span-numerico", "letras-sequencia"], "Concentração de treino verbal"],
    [["stroop-task", "task-switching"], "Sobreposição executiva"],
    [["stroop-task", "semaforo"], "Mapeamento cor–resposta semelhante"],
  ] as const)("deriva o título de %s a partir do conteúdo cognitivo real", (ids, expectedTitle) => {
    const observation = declaredObservation(ids);
    expect(observation.titulo).toBe(expectedTitle);
    expect(observation.gravidadeVisual).toBe("observacao_clinica");
    expect(observation.sugestao).toBe(
      "Essa concentração pode ser intencional em um plano focal. Caso o objetivo seja maior variedade, considere intercalar outro tipo de atividade.",
    );
  });

  it("suprime os reason crus e a linguagem proibida nos 41 pares do catálogo", () => {
    const allIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);
    const presentation = presentPlan(plan(allIds));
    const observations = presentation.alerts.filter((alert) => alert.code === "DECLARED_BAD_COMBINATION");
    expect(observations).toHaveLength(41);

    const prohibited = /combinação desfavorável|contaminação|reduz a comparabilidade|reduz a validade|manter apenas uma|separe obrigatoriamente|combinação que merece revisão/i;
    expect(observations.map(visibleText).join(" ")).not.toMatch(prohibited);
    expect(Object.values(presentation.alertGroups).flat().map(visibleText).join(" ")).not.toMatch(prohibited);
  });

  it("mantém duração excessiva em revisão do plano", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    expect(presentation.alertGroups.revisao_plano.map((alert) => alert.code)).toContain("SESSION_SAFE_MAX_EXCEEDED");
  });

  it("mantém carga elevada em revisão do plano", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    expect(presentation.alertGroups.revisao_plano.map((alert) => alert.code)).toContain("LOAD_OVER_CAP");
  });

  it("agrupa quatro sequências de fadiga alta sem perder seus pares", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    const grouped = presentation.alertGroups.revisao_plano.find((alert) => alert.code === "HIGH_FATIGUE_ADJACENT");
    expect(grouped).toMatchObject({ mensagem: "Há 4 sequências de atividades com fadiga alta." });
    expect(grouped?.ocorrencias).toHaveLength(4);
  });

  it("agrupa as sequências de interferência alta sem perder seus pares", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    const grouped = presentation.alertGroups.revisao_plano.find((alert) => alert.code === "HIGH_INTERFERENCE_ADJACENT");
    expect(grouped).toMatchObject({ mensagem: "Há 2 sequências de atividades com interferência alta." });
    expect(grouped?.ocorrencias).toHaveLength(2);
  });

  it("mantém planejamento consecutivo em revisão e agrupa suas sequências", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    const grouped = presentation.alertGroups.revisao_plano.find((alert) => alert.code === "PLANNING_WINDOW_ADJACENT");
    expect(grouped?.titulo).toBe("Planejamento consecutivo");
    expect(grouped?.ocorrencias).toHaveLength(2);
  });

  it("transforma as 13 ocorrências de posição preferencial em uma informação agrupada", () => {
    const presentation = presentPlan(plan(EXERCISE_CATALOG.map((definition) => definition.exerciseId)));
    const raw = presentation.alerts.filter((alert) => alert.code === "OUTSIDE_BEST_POSITION");
    const displayed = presentation.alertGroups.informacao.filter((alert) => alert.code === "OUTSIDE_BEST_POSITION");
    expect(raw).toHaveLength(13);
    expect(displayed).toHaveLength(1);
    expect(displayed[0]).toMatchObject({
      titulo: "Posição preferencial",
      mensagem: "13 atividades estão fora de sua posição preferencial.",
    });
    expect(displayed[0].ocorrencias).toHaveLength(13);
  });

  it("reduz 66 ocorrências a 21 cartões e preserva a rastreabilidade integral", () => {
    const allIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);
    const core = interpretPlan(plan(allIds));
    const presentation = presentPlan(plan(allIds));
    const cards = Object.values(presentation.alertGroups).flat();
    const representedOccurrences = cards.reduce((sum, alert) => sum + (alert.ocorrencias?.length ?? 1), 0);

    expect(core.alerts).toHaveLength(66);
    expect(presentation.alerts).toHaveLength(core.alerts.length);
    expect(cards).toHaveLength(21);
    expect(representedOccurrences).toBe(core.alerts.length);
    expect(core.alerts.filter((alert) => alert.code === "DECLARED_BAD_COMBINATION")).toHaveLength(41);
  });

  it("não expõe códigos técnicos e nunca bloqueia salvamento", () => {
    const allIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);
    const core = interpretPlan(plan(allIds));
    const presentation = presentPlan(plan(allIds));
    const visible = Object.values(presentation.alertGroups).flat().map(visibleText).join(" ");
    expect(visible).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
    expect(core.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
    expect(presentation.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
    expect(presentation.canSave).toBe(true);
  });
});
