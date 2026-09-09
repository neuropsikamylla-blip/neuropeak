import { statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { avaliarEstrutura } from "./estrutura";
import {
  emitirCodigoTypeScript,
  gerarProblemasNivel2,
  gerarProblemasNivel3,
  gerarProblemasNivel4,
  gerarProblemasNivel5,
} from "./gerador";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
import { PROBLEMAS_NIVEL_3 } from "./problemas/nivel3";
import { PROBLEMAS_NIVEL_4 } from "./problemas/nivel4";
import { PROBLEMAS_NIVEL_5 } from "./problemas/nivel5";
import { temSolucaoUnica, validarPuzzle } from "./solver";

export const SEED_BANCO = "grade-12-20260909";

const bancos = [
  { nivel: 2, caminho: fileURLToPath(new URL("./problemas/nivel2.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_2, gerar: gerarProblemasNivel2 },
  { nivel: 3, caminho: fileURLToPath(new URL("./problemas/nivel3.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_3, gerar: gerarProblemasNivel3 },
  { nivel: 4, caminho: fileURLToPath(new URL("./problemas/nivel4.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_4, gerar: gerarProblemasNivel4 },
  { nivel: 5, caminho: fileURLToPath(new URL("./problemas/nivel5.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_5, gerar: gerarProblemasNivel5 },
] as const;

describe("bancos emitidos dos níveis 2 a 5", () => {
  it("gera somente quando GERAR_BANCO=1; caso contrário, não escreve", () => {
    const mtimesAntes = bancos.map(({ caminho }) => statSync(caminho).mtimeMs);

    if (process.env.GERAR_BANCO === "1") {
      for (const { nivel, caminho, gerar } of bancos) {
        const resultado = gerar(SEED_BANCO);
        writeFileSync(caminho, emitirCodigoTypeScript(resultado.puzzles, `PROBLEMAS_NIVEL_${nivel}`), "utf8");
        expect(resultado.puzzles).toHaveLength(4);
      }
      return;
    }

    const todos = bancos.flatMap(({ puzzles }) => [...puzzles]);
    expect(todos).toHaveLength(16);
    for (const puzzle of todos) {
      expect(temSolucaoUnica(puzzle), puzzle.id).toBe(true);
      expect(validarPuzzle(puzzle), puzzle.id).toBeNull();
      const relatorio = avaliarEstrutura(puzzle);
      expect(relatorio.motivos, `${puzzle.id}: ${relatorio.motivos.join("; ")}`).toEqual([]);
      expect(relatorio.aprovado, puzzle.id).toBe(true);
    }
    expect(todos.some((puzzle) =>
      puzzle.pistas.some((pista) => pista.restricoes.length >= 2)
    )).toBe(true);
    expect(bancos.map(({ caminho }) => statSync(caminho).mtimeMs)).toEqual(mtimesAntes);
  });
});
