import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/estimulo-continuo.tsx");
const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");

describe("Regra 11 — três modos oficiais", () => {
  it("mantém modo opcional, com completa como padrão", () => {
    const types = source("lib/tutorial/types.ts");
    expect(types).toMatch(/modo\?:\s*"completa" \| "continua" \| "explicativo"/);
    expect(runner()).toMatch(/const modo = definition\.modo \?\? "completa"/);

    for (const approvedFamily of [
      "span-numerico.tsx",
      "letras-sequencia.tsx",
      "sequencia-itens.tsx",
      "sequencia-espacial.tsx",
      "conjunto-selecao.tsx",
    ]) {
      expect(source(`lib/tutorial/definitions/${approvedFamily}`)).not.toMatch(/\bmodo\s*:/);
    }
  });

  it("no explicativo exibe a explicação e não monta Demonstration", () => {
    const explanatoryBranch = runner().slice(
      runner().indexOf('modo === "explicativo"'),
      runner().indexOf('phase === "handoff"'),
    );
    const beforeElse = explanatoryBranch.slice(0, explanatoryBranch.indexOf(") : ("));

    expect(beforeElse).toMatch(/\{definition\.explicacao\}/);
    expect(beforeElse).not.toMatch(/definition\.Demonstration/);
    expect(explanatoryBranch).toMatch(/onClick=\{\(\) => setPhase\("handoff"\)\}/);
  });

  it("o explicativo conserva handoff, guided e feedback obrigatórios", () => {
    expect(runner()).toMatch(/onClick=\{\(\) => setPhase\("handoff"\)\}/);
    expect(runner()).toMatch(/phase === "handoff"[\s\S]*setPhase\("guided"\)/);
    expect(runner()).toMatch(/phase === "guided"[\s\S]*definition\.GuidedAttempt/);
    expect(runner()).toMatch(/setPhase\("feedback"\)/);
  });
});

describe("Família 4 — estímulo contínuo", () => {
  const continuousDemos = [
    "semaforoDemo",
    "vigilanciaDemo",
    "tempoReacaoDemo",
    "nbackDemo",
    "dualTaskDemo",
    "motDemo",
  ];

  it.each(continuousDemos)("%s contém alvo e não-alvo", (name) => {
    const start = definition().indexOf(`const ${name}`);
    const block = definition().slice(start, definition().indexOf("];", start) + 2);
    expect(block).toContain("isTarget: true");
    expect(block).toContain("isTarget: false");
  });

  it("a fábrica recusa demonstração contínua incompleta", () => {
    expect(definition()).toMatch(/hasTarget[\s\S]*hasNonTarget/);
    expect(definition()).toMatch(/if \(!hasTarget \|\| !hasNonTarget\)/);
  });

  it("mostra espera deliberada, sem esconder nem deslocar o cursor", () => {
    expect(definition()).toMatch(/const WAIT_LABEL = "agora não"/);
    expect(definition()).toMatch(/data-wait-label/);
    expect(definition()).toMatch(/O seletor não muda:[\s\S]*setWaiting\(true\)/);
    expect(definition()).toMatch(/<DemoPointer/);
  });

  it("não contém emoji", () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
    expect(definition()).not.toMatch(emoji);
  });

  it("reusa o ritmo calibrado e acrescenta somente o tempo de espera", () => {
    expect(definition()).toMatch(/import \{ RITMO_TUTORIAL_APROVADO \}/);
    expect(definition().match(/const [A-Z][A-Z_]*_MS\s*=/g) ?? []).toEqual([
      "const DELIBERATE_WAIT_MS =",
    ]);
  });

  it("a guiada não possui timeout para o alvo", () => {
    const guided = definition().slice(
      definition().indexOf("function criarGuidedAttempt"),
      definition().indexOf("function criarTutorialEstimuloContinuo"),
    );
    expect(guided).toMatch(/if \(!stimulus \|\| stimulus\.isTarget\) return/);
    expect(guided).toMatch(/Um alvo não possui timeout/);
  });

  it("usa os sete textos aprovados e não menciona teclado nem toque", () => {
    const instructions = [
      "Clique em avançar somente quando o sinal abrir.",
      "Clique quando a pipa alvo aparecer.",
      "Clique assim que o sinal aparecer.",
      "Clique quando a letra for igual à de duas posições atrás.",
      "Responda às duas tarefas conforme elas aparecerem.",
      "Clique nos alvos que você seguiu.",
      "Clique em certo ou errado conforme a operação.",
    ];
    for (const instruction of instructions) expect(definition()).toContain(instruction);
    expect(definition()).not.toMatch(/teclado|toque/i);
  });

  it("classifica seis como contínuos e certo-ou-errado como completo", () => {
    expect(definition().match(/modo: "continua"/g) ?? []).toHaveLength(6);
    const certoOuErrado = definition().slice(
      definition().indexOf("export const certoOuErradoTutorial"),
    );
    expect(certoOuErrado).toMatch(/modo: "completa"/);
  });

  it("registra os sete e chega aos 19 convertidos", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const register = page.slice(
      page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
      page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
    );
    const converted = register.match(/(?:"[a-z-]+"|[a-z]+):\s*[a-zA-Z]+Tutorial/g) ?? [];
    expect(converted).toHaveLength(19);
    for (const exerciseId of [
      "semaforo",
      "vigilancia",
      "tempo-reacao",
      "nback",
      "dual-task",
      "mot",
      "certo-ou-errado",
    ]) {
      expect(register).toContain(exerciseId);
    }
  });

  it("remove os tutoriais legados dos sete exercícios convertidos", () => {
    const exercises = [
      "components/exercises/processing/Semaforo.tsx",
      "components/exercises/attention/Vigilancia.tsx",
      "components/exercises/processing/TempoReacao.tsx",
      "components/exercises/memory/NBack.tsx",
      "components/exercises/attention/DualTask.tsx",
      "components/exercises/attention/MOT.tsx",
      "components/exercises/processing/CertoOuErrado.tsx",
    ];
    for (const exercise of exercises) {
      expect(source(exercise)).not.toMatch(/TutorialBase|showTutorial|function \w*Tutorial/);
    }
  });
});
