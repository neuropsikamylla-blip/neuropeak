import { statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { avaliarEstrutura } from "./estrutura";
import { emitirCodigoTypeScript, gerarProblemasNivel2 } from "./gerador";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
import { temSolucaoUnica, validarPuzzle } from "./solver";

export const SEED_BANCO_NIVEL_2 = "nivel2-20260908";

const caminhoBanco = fileURLToPath(new URL("./problemas/nivel2.ts", import.meta.url));

describe("banco emitido de nível 2", () => {
  it("gera somente quando GERAR_BANCO=1; caso contrário, não escreve", () => {
    const mtimeAntes = statSync(caminhoBanco).mtimeMs;

    if (process.env.GERAR_BANCO === "1") {
      const resultado = gerarProblemasNivel2(SEED_BANCO_NIVEL_2);
      writeFileSync(caminhoBanco, emitirCodigoTypeScript(resultado.puzzles), "utf8");
      expect(resultado.puzzles).toHaveLength(4);
      return;
    }

    expect(PROBLEMAS_NIVEL_2).toHaveLength(4);
    for (const puzzle of PROBLEMAS_NIVEL_2) {
      expect(temSolucaoUnica(puzzle), puzzle.id).toBe(true);
      expect(validarPuzzle(puzzle), puzzle.id).toBeNull();
      const relatorio = avaliarEstrutura(puzzle);
      expect(relatorio.motivos, `${puzzle.id}: ${relatorio.motivos.join("; ")}`).toEqual([]);
      expect(relatorio.aprovado, puzzle.id).toBe(true);
    }
    expect(PROBLEMAS_NIVEL_2.some((puzzle) =>
      puzzle.pistas.some((pista) => pista.restricoes.length >= 2)
    )).toBe(true);
    expect(statSync(caminhoBanco).mtimeMs).toBe(mtimeAntes);
  });
});
