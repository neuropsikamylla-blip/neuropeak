import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import { PRESENTATION_TEXTS, presentPlan, type PlanPresentation, type PresentedAlert } from "./presentation";
import type { SessionPrescription } from "./types";

const allIds = EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId);
const summarySource = readFileSync(
  resolve(process.cwd(), "components/plano/prescription/PrescriptionSummary.tsx"),
  "utf8",
);

function plan(ids: readonly string[], targetMinutes = 40): SessionPrescription {
  return {
    targetMinutes,
    exercises: ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
  };
}

function overlapAlerts(presentation: PlanPresentation): readonly PresentedAlert[] {
  return presentation.alertGroups.observacao_clinica.filter((alert) => [
    "COGNITIVE_CONCENTRATION",
    "DECLARED_BAD_COMBINATION",
    "AUDITORY_ONLY_ADJACENT",
  ].includes(alert.code));
}

function pairPresentations(): readonly PlanPresentation[] {
  const presentations: PlanPresentation[] = [];
  for (let left = 0; left < allIds.length; left += 1) {
    for (let right = left + 1; right < allIds.length; right += 1) {
      presentations.push(presentPlan(plan([allIds[left], allIds[right]])));
    }
  }
  return presentations;
}

function visibleText(presentation: PlanPresentation): string {
  return [
    presentation.targetLabel,
    presentation.stateLabel,
    presentation.estimateDetail,
    presentation.emptyGuidance ?? "",
    presentation.legacyMarker?.label ?? "",
    presentation.legacyMarker?.tooltip ?? "",
    ...presentation.alerts.flatMap((alert) => [
      alert.titulo,
      alert.mensagem,
      alert.sugestao ?? "",
      ...alert.exercicios,
      ...(alert.ocorrencias ?? []).flatMap((occurrence) => [
        occurrence.mensagem,
        occurrence.sugestao ?? "",
        ...occurrence.exercicios,
      ]),
    ]),
    ...presentation.exercises.flatMap((exercise) => [
      exercise.name,
      exercise.modelLabel,
      exercise.doseLabel,
      exercise.durationLabel,
      exercise.protocolLabel,
      exercise.cognitiveProfileLabel,
      exercise.fatigueLabel,
      exercise.interferenceLabel,
      exercise.modalityLabel ?? "",
    ]),
    ...Object.values(PRESENTATION_TEXTS),
  ].join(" ");
}

describe("aceite da Fase 1 — ajustes finais", () => {
  it("1. não repete Planejamento prolongado na mensagem", () => {
    const insight = presentPlan(plan(allIds)).alerts.find((alert) => alert.code === "PLANNING_WINDOW_COUNT");
    expect(insight?.titulo).toBe("Planejamento prolongado");
    expect(insight?.mensagem).not.toMatch(/planejamento prolongado/i);
  });

  it("2. informa dinamicamente quantos exercícios exigem raciocínio sustentado", () => {
    const planningIds = EXERCISE_CATALOG
      .filter(({ executionModel }) => executionModel === "PLANNING_WINDOW")
      .map(({ exerciseId }) => exerciseId);
    const complete = presentPlan(plan(planningIds));
    const partial = presentPlan(plan(planningIds.slice(0, 3), 30));

    expect(complete.alerts.find((alert) => alert.code === "PLANNING_WINDOW_COUNT")?.mensagem)
      .toBe("6 exercícios do plano exigem raciocínio sustentado até a solução.");
    expect(partial.alerts.find((alert) => alert.code === "PLANNING_WINDOW_COUNT")?.mensagem)
      .toBe("3 exercícios do plano exigem raciocínio sustentado até a solução.");
  });

  it("3. apresenta demanda elevada em uma frase, com a meta real uma única vez", () => {
    const message = presentPlan(plan(allIds, 30)).alertGroups.revisao_plano[0].mensagem;
    expect(message).toBe(
      "12 dos 34 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 30 minutos.",
    );
    expect(message.match(/30 minutos/g)).toHaveLength(1);
    expect(message.match(/\./g)).toHaveLength(1);
  });

  it("4. omite demanda total sem referência válida", () => {
    const message = presentPlan(plan(allIds, 35)).alertGroups.revisao_plano[0].mensagem;
    expect(message).toBe("12 dos 34 exercícios são potencialmente fatigantes.");
    expect(message).not.toMatch(/demanda total/i);
  });

  it("5. restringe os títulos de sobreposição às duas formas aprovadas", () => {
    const overlaps = [
      ...pairPresentations().flatMap(overlapAlerts),
      ...overlapAlerts(presentPlan(plan(allIds))),
    ];
    expect(overlaps.length).toBeGreaterThan(0);
    for (const overlap of overlaps) {
      expect(overlap.titulo).toMatch(/^Sobreposição em .+|^Sobreposição de processos cognitivos$/);
    }
  });

  it("6. reproduz exatamente os três títulos e textos aprovados", () => {
    const approved = [
      {
        ids: ["estacionamento-logico", "torre-hanoi"],
        titulo: "Sobreposição em planejamento",
        mensagem: "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.",
      },
      {
        ids: ["stroop-task", "semaforo"],
        titulo: "Sobreposição em controle inibitório",
        mensagem: "Cores e Palavras e Semáforo recrutam controle inibitório e associações entre estímulo e resposta semelhantes. Essa concentração pode ser intencional em um plano focal.",
      },
      {
        ids: ["span-numerico", "letras-sequencia"],
        titulo: "Sobreposição de processos cognitivos",
        mensagem: "Span Numérico Auditivo Direto e Letras em Sequência recrutam processos verbais e de memória operacional semelhantes. Essa concentração pode ser intencional em um plano focal.",
      },
    ] as const;

    for (const expected of approved) {
      const [overlap] = overlapAlerts(presentPlan(plan(expected.ids)));
      expect(overlap).toMatchObject({ titulo: expected.titulo, mensagem: expected.mensagem });
      expect(overlap.sugestao).toBe("O terapeuta pode manter essa concentração conforme o objetivo clínico.");
    }
  });

  it("7. elimina todos os títulos antigos de sobreposição", () => {
    const titles = pairPresentations().flatMap(overlapAlerts).map(({ titulo }) => titulo).join(" ");
    expect(titles).not.toMatch(/Mapeamento cor–resposta|Concentração de treino verbal|Concentração de busca visual|Sobreposição executiva|Concentração cognitiva|Processos cognitivos semelhantes/i);
  });

  it("8. faz todo título da varredura dos 34 combinados dois a dois começar com Sobreposição", () => {
    const titles = pairPresentations().flatMap(overlapAlerts).map(({ titulo }) => titulo);
    expect(allIds).toHaveLength(34);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((title) => title.startsWith("Sobreposição"))).toBe(true);
  });

  it("9. remove o texto morto de grupo vazio", () => {
    expect(summarySource).not.toContain("Nada a revisar aqui.");
    expect(summarySource).not.toContain("function EmptyGroup");
  });

  it("10. mantém a confirmação única condicionada a zero insights", () => {
    expect(summarySource.match(/Nada a revisar neste plano\./g)).toHaveLength(1);
    expect(summarySource).toContain("presentation.alerts.length === 0 && !presentation.empty");
    expect(presentPlan(plan(["deductive-grid", "matriz-espacial", "certo-ou-errado"], 30)).alerts).toEqual([]);
    expect(presentPlan(plan(allIds)).alerts.length).toBeGreaterThan(0);
  });

  it("11. não expõe termos internos nos cenários visíveis", () => {
    const scenarios = [
      presentPlan(plan(allIds, 20)),
      presentPlan(plan(allIds, 30)),
      presentPlan(plan(allIds, 40)),
      presentPlan(plan(allIds, 35)),
      presentPlan(plan(["estacionamento-logico", "torre-hanoi"])),
      presentPlan(plan(["stroop-task", "semaforo"])),
      presentPlan(plan(["span-numerico", "letras-sequencia"])),
    ];
    const visible = `${scenarios.map(visibleText).join(" ")} ${summarySource}`;
    expect(visible).not.toMatch(/carga basal|referência interna|janela de planejamento|parâmetros|heurística|regra interna|indicador interno/i);
  });

  it("12. preserva as 66 ocorrências produzidas pelo núcleo", () => {
    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(66);
  });

  it("13. mantém canSave verdadeiro", () => {
    for (const targetMinutes of [20, 30, 35, 40]) {
      expect(presentPlan(plan(allIds, targetMinutes)).canSave).toBe(true);
    }
  });
});
