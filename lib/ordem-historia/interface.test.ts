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
});
