import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "./catalog";
import { interpretPlan } from "./interpreter";
import { presentCatalogExercise, presentPlan, type PlanPresentation, type PresentedAlert } from "./presentation";
import type { SessionPrescription } from "./types";

const allIds = EXERCISE_CATALOG.map((definition) => definition.exerciseId);
const orderDependentCodes = [
  "HIGH_FATIGUE_ADJACENT",
  "PLANNING_WINDOW_ADJACENT",
  "HIGH_INTERFERENCE_ADJACENT",
] as const;

function plan(ids: readonly string[], targetMinutes = 40): SessionPrescription {
  return {
    targetMinutes,
    exercises: ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })),
  };
}

function cards(presentation: PlanPresentation): readonly PresentedAlert[] {
  return Object.values(presentation.alertGroups).flat();
}

function visible(presentation: PlanPresentation): string {
  return cards(presentation).flatMap((alert) => [
    alert.titulo,
    alert.mensagem,
    alert.sugestao ?? "",
    ...alert.exercicios,
    ...(alert.ocorrencias ?? []).flatMap((item) => [item.mensagem, item.sugestao ?? "", ...item.exercicios]),
  ]).join(" ");
}

describe("aceite da Fase 1 — assistente clínico", () => {
  it("1. plano bem composto tem zero insights", () => {
    expect(cards(presentPlan(plan(["deductive-grid", "matriz-espacial", "certo-ou-errado"], 30)))).toHaveLength(0);
  });

  it("2. plano com 34 exercícios tem no máximo cinco insights", () => {
    expect(cards(presentPlan(plan(allIds))).length).toBeLessThanOrEqual(5);
  });

  it("3. plano com 34 exercícios não contém linguagem dependente da ordem", () => {
    expect(visible(presentPlan(plan(allIds))))
      .not.toMatch(/consecutiv|adjacen|encerramento|posição preferencial|carga basal/i);
  });

  it("4. nenhum código técnico fica visível", () => {
    expect(visible(presentPlan(plan(allIds)))).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
  });

  it("5. o núcleo continua devolvendo 66 ocorrências", () => {
    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(66);
  });

  it("6. a duração da sessão aparece uma vez, no cabeçalho", () => {
    const presentation = presentPlan(plan(allIds));
    expect(presentation.prescribedLabel).toBe("Sessão de 40 min");
    expect(presentation.alerts.some((alert) => alert.code.startsWith("SESSION_"))).toBe(false);
  });

  it("7. plano dentro da faixa não gera insight de duração", () => {
    const presentation = presentPlan(plan(["deductive-grid", "matriz-espacial", "certo-ou-errado"], 30));
    expect(presentation.state).toBe("DENTRO");
    expect(presentation.alerts).toHaveLength(0);
  });

  it("8. intensidade cita fadiga e demanda apenas com referência válida e excedida", () => {
    const intensity = presentPlan(plan(allIds)).alertGroups.revisao_plano[0];
    expect(intensity.mensagem).toMatch(/fatigantes/);
    expect(intensity.mensagem).toMatch(/demanda total.*acima do previsto/);
    expect(intensity.mensagem).not.toMatch(/69|13/);
  });

  it("9. duração sem referência não menciona demanda total", () => {
    const presentation = presentPlan(plan(allIds, 35));
    expect(presentation.alertGroups.revisao_plano[0].mensagem).toMatch(/fatigantes/);
    expect(visible(presentation)).not.toMatch(/demanda total/i);
  });

  it("10. salvar permanece permitido e nenhum insight bloqueia", () => {
    const presentation = presentPlan(plan(allIds));
    expect(presentation.canSave).toBe(true);
    expect(presentation.alerts.every((alert) => alert.blocksSave === false)).toBe(true);
  });

  // Verificação ESTÁTICA do fonte: a suíte roda em environment "node" e o tsconfig usa
  // jsx: "preserve" (padrão Next.js), então o Vite não transforma .tsx aqui. Importar o
  // componente quebra a coleta do arquivo inteiro. Lemos o fonte, como no save-button-guard.
  it("11. linha compacta não mostra duração individual nem carga", () => {
    const fonte = readFileSync(resolve(process.cwd(), "components/plano/prescription/CompactExerciseMeta.tsx"), "utf8");
    const linhaPrincipal = fonte.slice(0, fonte.indexOf("<details"));
    expect(linhaPrincipal).not.toContain("durationLabel");
    expect(linhaPrincipal).not.toContain("loadLabel");
    expect(linhaPrincipal).toContain("doseLabel");
    expect(linhaPrincipal).toContain("fatigueLabel");
  });

  it("12. Estacionamento Lógico e Jogo das Torres preservam o texto aprovado", () => {
    const text = visible(presentPlan(plan(["estacionamento-logico", "torre-hanoi"])));
    expect(text).toContain(
      "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.",
    );
  });

  it("13. mensagem principal da concentração não contém contagem", () => {
    const concentration = presentPlan(plan(allIds)).alertGroups.observacao_clinica.find((alert) =>
      alert.titulo.startsWith("Sobreposição"));
    expect(concentration?.mensagem).not.toMatch(/\d/);
  });

  // ── Proteções clínicas restauradas ──────────────────────────────────────────
  // Estes dois casos existiam antes da Fase 1 e foram removidos junto com os testes
  // que afirmavam a apresentação antiga. O comportamento que eles protegem NÃO mudou:
  // continuam sendo as duas garantias clínicas centrais do assistente.

  it("15. sessão focal em memória operacional não gera revisão", () => {
    // Caso clínico central: treinar o mesmo domínio de propósito é decisão legítima.
    // Span Direto + Inverso, Letras em Sequência, Matriz Espacial e Matriz Inversa.
    const focal = presentPlan(plan([
      "span-numerico", "span-numerico-inverso", "letras-sequencia",
      "matriz-espacial", "matriz-espacial-inversa",
    ], 40));
    expect(focal.alertGroups.revisao_plano).toHaveLength(0);
    expect(focal.canSave).toBe(true);
  });

  it("16. os reason crus do catálogo nunca chegam à tela", () => {
    // O catálogo usa "contaminação", "reduz a comparabilidade" e "reduz a validade"
    // nas justificativas dos 41 pares. O catálogo não muda; a apresentação traduz.
    const texto = visible(presentPlan(plan(allIds)));
    for (const proibido of ["contamina", "comparabilidade", "reduz a validade", "combinação desfavorável", "manter apenas uma"]) {
      expect(texto.toLocaleLowerCase("pt-BR")).not.toContain(proibido.toLocaleLowerCase("pt-BR"));
    }
  });

  it("14. regras ocultas continuam no núcleo e não chegam à apresentação", () => {
    const completePlan = plan(allIds);
    const coreCodes = interpretPlan(completePlan).alerts.map((alert) => alert.code);
    const presentedCodes = cards(presentPlan(completePlan)).map((alert) => alert.code);
    for (const code of orderDependentCodes) {
      expect(coreCodes).toContain(code);
      expect(presentedCodes).not.toContain(code);
    }
  });
});
