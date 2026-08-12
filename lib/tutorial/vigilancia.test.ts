import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { POSICOES } from "@/lib/vigilancia";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/vigilancia.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("Vigilância — tutorial com o exercício real", () => {
  it("usa o Fluxo 1 sem modo explicativo", () => {
    expect(definition()).not.toMatch(/modo:\s*"explicativo"/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*2\b/);
    expect(TUTORIAL_VERSIONS.vigilancia).toBe(2);
  });

  it("usa clique e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
    expect(definition()).not.toMatch(/teclado/i);
  });

  it("deriva uma resposta por tentativa das posições da mecânica", () => {
    expect(definition()).toMatch(
      /smallestValidUnit:\s*UMA_REGIAO_POR_TENTATIVA/,
    );
    expect(POSICOES.length / POSICOES.length).toBe(1);
    // O que a regra proíbe é o número SOLTO na definição, sem nome nem explicação.
    expect(definition()).not.toMatch(/smallestValidUnit:\s*\d/);
    // E proíbe também disfarçar o número numa conta que sempre dá o mesmo — foi o que a primeira
    // versão fez (`POSICOES.length / POSICOES.length`) para passar por este teste.
    expect(definition()).not.toMatch(/(\w+)\.length\s*\/\s*\1\.length/);
  });

  it("gera a cena somente depois do início de um componente", () => {
    const fonte = definition();
    const firstComponent = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const centersCall = fonte.indexOf("gerarCentros(");
    const randomCall = fonte.indexOf("Math.random(");

    expect(firstComponent).toBeGreaterThan(-1);
    expect(centersCall).toBeGreaterThan(firstComponent);
    expect(randomCall).toBeGreaterThan(firstComponent);
  });

  it("usa o motor e as imagens reais da Vigilância", () => {
    const fonte = definition();
    expect(fonte).toMatch(/from "@\/lib\/vigilancia"/);
    expect(fonte).toMatch(/from "@\/lib\/vigilancia-dados"/);
    for (const piece of [
      "gerarCentros",
      "classificarToque",
      "tempoDoDegrau",
      "imgPipa",
      "imgFundo",
    ]) {
      expect(fonte).toMatch(new RegExp(`\\b${piece}\\b`));
    }
  });

  it("não redesenha a pipa e remove o desenho antigo", () => {
    expect(definition()).toMatch(/<img\b/);
    expect(definition()).not.toMatch(/rotate-45|clipPath|function Pipa/);
    expect(source("lib/tutorial/definitions/estimulo-continuo.tsx"))
      .not.toMatch(/function Pipa/);
  });

  it("não mede a resposta nem pontua a tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de conclusão", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("classifica o clique com a mesma função do exercício", () => {
    expect(definition()).toMatch(/\bclassificarToque\s*\(/);
  });
});
