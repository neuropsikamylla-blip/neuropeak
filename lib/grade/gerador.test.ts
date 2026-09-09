import { describe, expect, it } from "vitest";
import {
  emitirCodigoTypeScript,
  gerarPuzzles,
  TEMAS_NIVEL_2,
} from "./gerador";

describe("gerador de problemas da grade", () => {
  it("é determinístico para a mesma semente", () => {
    const primeira = gerarPuzzles([TEMAS_NIVEL_2[1]], "prova-determinismo");
    const segunda = gerarPuzzles([TEMAS_NIVEL_2[1]], "prova-determinismo");

    expect(JSON.stringify(primeira.puzzles)).toBe(JSON.stringify(segunda.puzzles));
    expect(primeira.tentativas).toEqual(segunda.tentativas);
  });

  it("emite código TypeScript de forma pura e estável", () => {
    const puzzles = gerarPuzzles([TEMAS_NIVEL_2[2]], "prova-emissao").puzzles;
    const primeira = emitirCodigoTypeScript(puzzles);
    const segunda = emitirCodigoTypeScript(puzzles);

    expect(primeira).toBe(segunda);
    expect(primeira).toContain("export const PROBLEMAS_NIVEL_2: Puzzle[]");
  });
});
