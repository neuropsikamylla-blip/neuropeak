import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const COMPONENTE = resolve(process.cwd(), "components/exercises/executive/OrdemHistoria.tsx");

describe("interface da Ordem da História", () => {
  it.each([
    "Nível ",
    " cenas · ",
    "Começa no nível",
    "DIFF_LABEL[tier]",
  ])("não exibe o literal técnico %j", (literal) => {
    const fonte = readFileSync(COMPONENTE, "utf8");
    expect(fonte.split(literal).length - 1).toBe(0);
  });

  it("mantém os listeners no mesmo container que recebe setNodeRef", () => {
    const fonte = readFileSync(COMPONENTE, "utf8");
    const inicioContainer = fonte.indexOf("<div ref={setNodeRef}");
    const fimDaTag = fonte.indexOf(">", inicioContainer);
    const tagDoContainer = fonte.slice(inicioContainer, fimDaTag + 1);

    expect(inicioContainer).toBeGreaterThan(-1);
    expect(tagDoContainer).toContain("listeners");
    expect(tagDoContainer).toContain("{...(movable ? listeners : {})}");
  });

  it("não volta a sugerir que só um ícone serve para arrastar", () => {
    const fonte = readFileSync(COMPONENTE, "utf8");
    expect(fonte).not.toContain("⠿");
  });

  it("monta cada rodada de ordem com o nível atual da sessão", () => {
    const fonte = readFileSync(COMPONENTE, "utf8");
    const inicio = fonte.indexOf("function makeRound()");
    const fim = fonte.indexOf("function markFirst()", inicio);
    const montagemDaRodada = fonte.slice(inicio, fim);

    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    expect(fonte).not.toContain("const tier = tierForLevel(startLevel)");
    expect(montagemDaRodada).toContain("tierForLevel(curLevelRef.current)");
  });

  it("descarta a rodada pré-carregada quando o veredito troca a faixa", () => {
    const fonte = readFileSync(COMPONENTE, "utf8");
    const inicio = fonte.indexOf("function closeOrderStory(");
    const fim = fonte.indexOf("function processSubmit()", inicio);
    const fechamentoDaHistoria = fonte.slice(inicio, fim);

    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    expect(fechamentoDaHistoria).toContain("tierForLevel(previousLevel) !== tierForLevel(nextLevel)");
    expect(fechamentoDaHistoria).toContain("pendingRef.current = null");
  });
});
