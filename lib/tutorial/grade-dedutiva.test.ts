import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { completionRecordFor, tutorialRequired } from "./state";
import { TUTORIAL_VERSIONS } from "./versions";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const definition = () => source("lib/tutorial/definitions/grade-dedutiva.tsx");
const exercise = () => source("components/exercises/executive/DeductiveGrid.tsx");
const page = () => source("app/(patient)/treino/[exercicio]/page.tsx");

describe("tutorial T1 da Grade Dedutiva", () => {
  it("reapresenta a versão 2 uma vez para quem concluiu a 1", () => {
    const completedAt = new Date("2026-09-03T12:00:00.000Z");

    expect(tutorialRequired({ completedAt, completedVersion: 1 }, 2)).toBe(true);
    expect(tutorialRequired({ completedAt, completedVersion: 2 }, 2)).toBe(false);
  });

  it("rever a versão 2 não produz registro", () => {
    expect(completionRecordFor(true, 2)).toBeNull();
  });

  it("registra a definição e mantém sua versão alinhada ao catálogo", () => {
    const match = definition().match(/export const gradeDedutivaTutorial[\s\S]*?version:\s*(\d+)/);

    expect(page()).toMatch(/"deductive-grid":\s*gradeDedutivaTutorial/);
    expect(Number(match?.[1])).toBe(TUTORIAL_VERSIONS["deductive-grid"]);
  });

  it("usa as peças reais para demonstrar a tarefa inteira", () => {
    const src = definition();

    expect(src).toContain("GradeDedutivaBoard");
    expect(src).toContain("PROBLEMA_TUTORIAL");
    expect(src).toContain("DemoPointer");
    expect(src).toMatch(/data-grade-clue/);
    expect(src).toMatch(/data-grade-cell/);
    expect(src).toMatch(/data-grade-option/);
    expect(src).toMatch(/data-grade-conclude/);
    expect(src).toMatch(/gradeEstaCorreta\(PROBLEMA_TUTORIAL/);
  });

  it("instrui com o gesto real de célula e lista", () => {
    expect(definition()).toMatch(
      /guidedInstruction:\s*"[^"]*(?:Toque|clique)[^"]*célula[^"]*escolha[^"]*lista/i,
    );
  });

  it("não contém emoji", () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
    expect(definition()).not.toMatch(emoji);
  });

  it("o treino começa em problema real e não mantém fase própria de tutorial", () => {
    const src = exercise();

    expect(src).toMatch(/useState<Puzzle>\(\(\) => selecionarProblema\(difficulty\)\)/);
    expect(src).not.toMatch(/useState\s*\(true\)/);
    expect(src).not.toMatch(/useState<Puzzle>\(PROBLEMA_TUTORIAL\)/);
    expect(src).not.toMatch(/criarGradeVazia\(PROBLEMA_TUTORIAL\)/);
    expect(src).not.toMatch(/if\s*\(tutorial\)/);
  });

  it("inicia o relógio ao montar o primeiro problema real", () => {
    expect(exercise()).toMatch(/useEffect\(\(\) => \{\s*begin\(\);\s*\}, \[begin\]\)/);
  });
});
