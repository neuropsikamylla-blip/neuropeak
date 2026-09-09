import { describe, expect, it } from "vitest";
import { BANCO_GRADE, PROBLEMAS_GRADE } from "./banco";
import { avaliarEstrutura } from "./estrutura";
import { pistaSimples, type Pista, type Puzzle } from "./tipos";

// Prova INDEPENDENTE do VP, com grafos que a suíte do Codex não usou. Detecção de ponte é o
// tipo de coisa que passa num caso e falha no seguinte; um único contraexemplo não basta.
const META = {
  complexity: 1, inferenceDepthDistribution: {}, skillWeights: {},
  dominantOperations: [], clueTypeDistribution: {}, expectedDifficulty: 1,
  validatedUniqueSolution: false,
} as Puzzle["metadata"];

/** Monta um puzzle cujo GRAFO é o pedido; a lógica não importa, só a topologia. */
function comGrafo(arestas: [string, string][], nos: string[]): Puzzle {
  const categorias = nos.map((id) => ({
    id, label: id, valores: [`${id}1`, `${id}2`, `${id}3`],
  }));
  const pistas: Pista[] = arestas.map(([a, b], i) =>
    pistaSimples(`p${i}`, `p${i}`, {
      tipo: "T1",
      itemA: { categoria: a, valor: `${a}1` },
      itemB: { categoria: b, valor: `${b}1` },
    })
  );
  return {
    id: "topologia", titulo: "t", contexto: "c", nivel: 3, posicoes: 3,
    categorias, pistas,
    solucao: Object.fromEntries(categorias.map((c) => [c.id, c.valores])),
    metadata: META,
  };
}

const pontes = (arestas: [string, string][], nos: string[]): number =>
  avaliarEstrutura(comGrafo(arestas, nos)).pontes;

describe("prova independente — detecção de pontes", () => {
  it("caminho a-b-c-d: TODAS as três arestas são pontes", () => {
    expect(pontes([["a", "b"], ["b", "c"], ["c", "d"]], ["a", "b", "c", "d"])).toBe(3);
  });

  it("triângulo puro: nenhuma aresta é ponte", () => {
    expect(pontes([["a", "b"], ["b", "c"], ["c", "a"]], ["a", "b", "c"])).toBe(0);
  });

  it("DUAS pontes: triângulo + cauda de dois nós", () => {
    // a-b-c triângulo, depois c—d—e em linha: as arestas c-d e d-e são pontes.
    expect(pontes(
      [["a", "b"], ["b", "c"], ["c", "a"], ["c", "d"], ["d", "e"]],
      ["a", "b", "c", "d", "e"]
    )).toBe(2);
  });

  it("grafo DESCONECTADO não inventa pontes onde não há caminho", () => {
    // Dois triângulos separados, sem nenhuma ligação: 0 pontes, 2 componentes.
    const r = avaliarEstrutura(comGrafo(
      [["a", "b"], ["b", "c"], ["c", "a"], ["d", "e"], ["e", "f"], ["f", "d"]],
      ["a", "b", "c", "d", "e", "f"]
    ));
    expect(r.pontes).toBe(0);
    expect(r.componentes).toHaveLength(2);
  });

  it("aresta paralela (duas pistas ligando o mesmo par) NÃO é ponte", () => {
    // Duas frases distintas ligando a e b não criam redundância topológica: o grafo é
    // simples, e a aresta a—b continua sendo a única ligação. Fixa o comportamento
    // esperado para que ninguém o mude por acidente.
    expect(pontes([["a", "b"], ["a", "b"]], ["a", "b"])).toBe(1);
  });
});

describe("prova independente — o banco vivo passa inteiro", () => {
  it("todos os problemas servidos ao paciente são aprovados pela régua", () => {
    // Substitui os dois testes que afirmavam o defeito de `biblioteca-encontros` e
    // `museu-mostra-noturna`: eles foram REMOVIDOS do banco em 09/set, por decisão dela.
    // A prova de cada critério continua viva, sintética, em `estrutura.test.ts`.
    expect(PROBLEMAS_GRADE.length).toBeGreaterThanOrEqual(16);
    for (const puzzle of PROBLEMAS_GRADE) {
      const relatorio = avaliarEstrutura(puzzle);
      expect(relatorio.aprovado, `${puzzle.id}: ${relatorio.motivos.join(" | ")}`).toBe(true);
    }
  });

  it("os problemas aposentados não voltam pela porta dos fundos", () => {
    const ids = BANCO_GRADE.map((puzzle) => puzzle.id);
    expect(ids).not.toContain("biblioteca-encontros");
    expect(ids).not.toContain("museu-mostra-noturna");
  });
});
