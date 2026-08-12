import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { targetsForLevel } from "@/lib/mot/scene";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/mot.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("MOT — tutorial com o exercício real", () => {
  it("usa o Fluxo 1 sem declarar modo", () => {
    expect(definition()).not.toMatch(/\bmodo\s*:/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*1\b/);
    expect(TUTORIAL_VERSIONS.mot).toBe(1);
  });

  it("usa clique e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
    expect(definition()).not.toMatch(/teclado/i);
  });

  it("deriva a menor unidade do nível mínimo", () => {
    expect(definition()).toMatch(
      /smallestValidUnit:\s*targetsForLevel\(MIN_LEVEL\)/,
    );
    expect(targetsForLevel(0)).toBe(2);
    expect(definition()).not.toMatch(/smallestValidUnit:\s*2\b/);
  });

  it("gera a cena somente depois do início de um componente", () => {
    const fonte = definition();
    const firstComponent = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const sceneCall = fonte.indexOf("randomBalls(");

    expect(firstComponent).toBeGreaterThan(-1);
    expect(sceneCall).toBeGreaterThan(firstComponent);
  });

  it("usa a geração, a duração e a física reais", () => {
    const fonte = definition();
    expect(fonte).toMatch(/from "@\/lib\/mot\/scene"/);
    for (const piece of ["randomBalls", "stepAll", "trackDuration", "targetsForLevel"]) {
      expect(fonte).toMatch(new RegExp(`\\b${piece}\\b`));
    }
    expect(fonte).toMatch(/requestAnimationFrame/);
  });

  it("reutiliza a bola do exercício e remove o board desenhado à mão", () => {
    expect(definition()).toMatch(/<MOTBall\b/);
    expect(definition()).not.toMatch(/rounded-full|borderRadius|clipPath/);
    expect(source("lib/tutorial/definitions/estimulo-continuo.tsx"))
      .not.toMatch(/function MotBoard/);
  });

  it("não mede a resposta nem pontua a tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de conclusão", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("acompanha os alvos e move todas as bolas com a física real", () => {
    expect(definition()).toMatch(/\btrackTarget\b/);
    expect(definition()).toMatch(/\bstepAll\s*\(/);
  });
});
