import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";
import {
  PRESENTATION_TEXTS,
  presentCatalogExercise,
  presentPlan,
  type PlanPresentation,
} from "./presentation";
import type { SessionPrescription } from "./types";

const summarySource = readFileSync(
  resolve(process.cwd(), "components/plano/prescription/PrescriptionSummary.tsx"),
  "utf8",
);
const compactMetaSource = readFileSync(
  resolve(process.cwd(), "components/plano/prescription/CompactExerciseMeta.tsx"),
  "utf8",
);
const exerciseMetaSource = readFileSync(
  resolve(process.cwd(), "components/plano/prescription/ExercisePrescriptionMeta.tsx"),
  "utf8",
);

function plan(ids: readonly string[], targetMinutes = 40): SessionPrescription {
  return {
    targetMinutes,
    exercises: ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
  };
}

function visibleText(presentation: PlanPresentation): string {
  return [
    presentation.targetLabel,
    presentation.stateLabel,
    presentation.estimateDetail,
    presentation.emptyGuidance ?? "",
    presentation.legacyMarker?.label ?? "",
    presentation.legacyMarker?.tooltip ?? "",
    ...Object.values(presentation.alertGroups).flatMap((group) => group.flatMap((alert) => [
      alert.titulo,
      alert.mensagem,
      alert.sugestao ?? "",
      ...alert.exercicios,
      ...(alert.ocorrencias ?? []).flatMap((occurrence) => [
        occurrence.mensagem,
        occurrence.sugestao ?? "",
        ...occurrence.exercicios,
      ]),
    ])),
    ...presentation.exercises.flatMap((exercise) => [
      exercise.doseLabel,
      exercise.durationLabel,
      exercise.fatigueLabel,
      exercise.protocolLabel,
      exercise.cognitiveProfileLabel,
      exercise.modalityLabel ?? "",
    ]),
    ...Object.values(PRESENTATION_TEXTS),
  ].join(" ");
}

describe("aceite da Fase 1 — linguagem clínica e UX", () => {
  it("substitui os textos aprovados e remove estimateTooltip", () => {
    const presentation = presentPlan(plan(["torre-hanoi", "labirinto", "estacionamento-logico"]));

    expect(presentation.estimateDetail).toBe(
      "Tempo previsto para este plano: 30–40 min. Faixa esperada para esta meta: 36–44 min.",
    );
    expect(presentPlan(plan(EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId))).alertGroups.revisao_plano[0].mensagem)
      .toContain("A demanda total está acima do previsto para esta duração.");
    expect(PRESENTATION_TEXTS).toEqual({
      alertsTooltip: "Pontos para considerar antes de salvar. Não impedem o salvamento.",
      legacyMarker: "Este plano usa uma configuração anterior.",
      legacyTooltip: "Os dados salvos não foram alterados.",
      emptyGuidance: "Adicione exercícios para ver o tempo previsto do plano.",
    });
    expect(PRESENTATION_TEXTS).not.toHaveProperty("estimateTooltip");
  });

  it("não deixa termos substituídos ou escalas internas no texto visível", () => {
    const visible = `${visibleText(presentPlan(plan(EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId))))} ${summarySource}`;

    expect(visible).not.toMatch(/faixa calculada|referência clínica|janela de planejamento|parâmetros|composição|apontamento|heurística|algoritmo/i);
    expect(visible).not.toMatch(/carga\s+\d|interferência/i);
  });

  it("limita o perfil cognitivo ao primário e a dois secundários", () => {
    for (const definition of EXERCISE_CATALOG) {
      const label = presentCatalogExercise(definition.exerciseId)?.cognitiveProfileLabel ?? "";
      const secondary = label.split(" · também: ")[1];
      // " · " e não vírgula: nomes de perfil contêm vírgula e tornariam a contagem ambígua.
      expect(secondary?.split(" · ").filter(Boolean).length ?? 0).toBeLessThanOrEqual(2);
    }
  });

  it("mostra a confirmação apenas quando não há insight", () => {
    const withoutInsight = presentPlan(plan(["deductive-grid", "matriz-espacial", "certo-ou-errado"], 30));
    const withInsight = presentPlan(plan(EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId)));

    expect(withoutInsight.alerts).toEqual([]);
    expect(withInsight.alerts.length).toBeGreaterThan(0);
    expect(summarySource).toContain("Nada a revisar neste plano.");
    expect(summarySource).toContain("presentation.alerts.length === 0 && !presentation.empty");
  });

  it("coloca o estado antes da meta e mantém apenas Resumo da sessão", () => {
    expect(summarySource.indexOf("Tempo previsto")).toBeLessThan(summarySource.indexOf("Meta da sessão"));
    expect(summarySource).toContain("Resumo da sessão");
    expect(summarySource).not.toContain("Informações do plano");
    expect(summarySource).toContain("Ver tempo detalhado");
  });

  it("mantém os campos internos no objeto sem renderizá-los nos metadados", () => {
    const exercise = presentCatalogExercise("tempo-reacao");
    expect(exercise).toMatchObject({
      loadLabel: expect.any(String),
      interferenceLabel: expect.any(String),
      modelLabel: expect.any(String),
    });

    for (const source of [compactMetaSource, exerciseMetaSource]) {
      // Só a CARGA sai da interface: é escala numérica interna sem unidade clínica.
      // Interferência e forma de execução são conceitos clínicos e permanecem nos detalhes.
      expect(source).not.toMatch(/exercise\.loadLabel/);
    }
  });

  it("preserva o texto focal aprovado e Planejamento prolongado", () => {
    const focal = presentPlan(plan(["estacionamento-logico", "torre-hanoi"]));
    const complete = presentPlan(plan(EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId)));

    expect(focal.alerts.map((alert) => alert.mensagem).join(" ")).toContain(
      "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.",
    );
    expect(complete.alerts).toContainEqual(expect.objectContaining({
      titulo: "Planejamento prolongado",
      mensagem: "6 exercícios exigem planejamento prolongado.",
    }));
  });
});
