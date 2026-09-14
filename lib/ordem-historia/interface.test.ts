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
});
