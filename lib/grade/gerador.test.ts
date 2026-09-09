import { describe, expect, it } from "vitest";
import {
  emitirCodigoTypeScript,
  fundirExclusoes,
  gerarPuzzles,
  TODOS_OS_TEMAS,
  TEMAS_NIVEL_2,
  verificarAmbiguidadeDeReferencia,
  verificarUsoDeQuem,
} from "./gerador";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
import { contarSolucoes } from "./solver";
import type { TemaGrade } from "./gerador";

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

  it("rejeita referência com o mesmo molde em duas categorias e aprova os 16 temas", () => {
    const ambiguo: TemaGrade = {
      id: "ambiguo",
      titulo: "Ambíguo",
      contexto: "Tema usado apenas como contraprova.",
      rotulosPosicao: ["1", "2"],
      categorias: [
        { id: "oficina", label: "Oficina", valores: ["Cerâmica", "Marcenaria"] },
        { id: "mediador", label: "Mediador", valores: ["Sol", "Zeca"] },
      ],
      gramatica: {
        categorias: {
          oficina: { animado: false, sujeito: (v) => `A oficina de ${v}`, predicado: (v) => `é a oficina de ${v}`, referencia: (v) => `a oficina de ${v}` },
          mediador: { animado: true, sujeito: (v) => `A oficina de ${v}`, predicado: (v) => `foi mediada por ${v}`, referencia: (v) => `a oficina de ${v}` },
        },
      },
    };
    expect(verificarAmbiguidadeDeReferencia(ambiguo)).toMatch(/oficina.*mediador/);
    for (const tema of TODOS_OS_TEMAS) {
      expect(verificarAmbiguidadeDeReferencia(tema), tema.id).toBeNull();
    }
  });

  it.each(["sujeito", "referencia"] as const)(
    "rejeita Quem em %s de categoria inanimada",
    (campo) => {
      const tema: TemaGrade = {
        ...TEMAS_NIVEL_2[0],
        categorias: [{ id: "filme", label: "Filme", valores: ["Aurora", "Bruma"] }],
        gramatica: {
          categorias: {
            filme: {
              animado: false,
              sujeito: (valor) => campo === "sujeito" ? `Quem exibiu ${valor}` : `O filme ${valor}`,
              predicado: (valor) => `é ${valor}`,
              referencia: (valor) => campo === "referencia" ? `quem exibiu ${valor}` : `o filme ${valor}`,
            },
          },
        },
      };
      expect(verificarUsoDeQuem(tema)).toContain("inanimada");
    }
  );

  it("a fusão pós-minimização preserva a quantidade de soluções", () => {
    const base = PROBLEMAS_NIVEL_2.find((puzzle) =>
      puzzle.pistas.some((pista) => pista.restricoes.length > 1)
    );
    expect(base).toBeDefined();
    if (base === undefined) return;
    const separadas = base.pistas.flatMap((pista) => pista.restricoes.map((restricao, indice) => ({
      id: `${pista.id}-separada-${indice + 1}`,
      texto: pista.texto,
      restricoes: [{ ...restricao, id: `${pista.id}-separada-${indice + 1}#1` }],
    })));
    const tema = TEMAS_NIVEL_2.find(({ id }) => id === base.id);
    expect(tema).toBeDefined();
    if (tema === undefined) return;
    const fundidas = fundirExclusoes(separadas, tema.gramatica);
    expect(fundidas.length).toBeLessThan(separadas.length);
    expect(contarSolucoes({ ...base, pistas: separadas }, 2)).toBe(
      contarSolucoes({ ...base, pistas: fundidas }, 2)
    );
  });
});
