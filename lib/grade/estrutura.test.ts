import { describe, expect, it } from "vitest";
import { pistaSimples, type Pista, type Puzzle } from "./tipos";
import { avaliarEstrutura } from "./estrutura";

function criarPuzzle(
  categoriasIds: readonly string[],
  pistasExtras: readonly Pista[],
  naOrdemDeclarada = false
): Puzzle {
  const categorias = categoriasIds.map((id) => ({
    id,
    label: id.toUpperCase(),
    valores: naOrdemDeclarada ? [`${id}1`, `${id}2`, `${id}3`] : [`${id}2`, `${id}1`, `${id}3`],
  }));
  const ancoras: Pista[] = categoriasIds.flatMap((categoria) => [
    pistaSimples(`${categoria}-1`, `${categoria}1 está na primeira posição.`, { tipo: "T3",
      item: { categoria, valor: `${categoria}1` },
      posicao: 1,
    }),
    pistaSimples(`${categoria}-2`, `${categoria}2 está na segunda posição.`, { tipo: "T3",
      item: { categoria, valor: `${categoria}2` },
      posicao: 2,
    }),
  ]);
  return {
    id: `sintetico-${categoriasIds.join("-")}`,
    titulo: "Puzzle sintético",
    contexto: "Construído exclusivamente para testar a ferramenta estrutural.",
    nivel: 2,
    posicoes: 3,
    categorias,
    pistas: [...ancoras, ...pistasExtras],
    solucao: Object.fromEntries(
      categoriasIds.map((id) => [id, [`${id}1`, `${id}2`, `${id}3`]])
    ),
    metadata: {
      complexity: 1,
      inferenceDepthDistribution: {},
      skillWeights: {},
      dominantOperations: [],
      clueTypeDistribution: {},
      expectedDifficulty: 1,
      validatedUniqueSolution: true,
    },
  };
}

function associacao(id: string, categoriaA: string, categoriaB: string): Pista {
  return pistaSimples(id, `${categoriaA}1 está com ${categoriaB}1.`, { tipo: "T1",
    itemA: { categoria: categoriaA, valor: `${categoriaA}1` },
    itemB: { categoria: categoriaB, valor: `${categoriaB}1` },
  });
}

describe("validação estrutural da Grade Dedutiva", () => {
  it("aprova grafo conectado e reprova grafo com dois componentes", () => {
    const conectado = criarPuzzle(["a", "b", "c"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
    ]);
    const desconectado = criarPuzzle(["a", "b", "c", "d"], [
      associacao("ab", "a", "b"),
      associacao("cd", "c", "d"),
    ]);

    expect(avaliarEstrutura(conectado).aprovado).toBe(true);
    const relatorioDesconectado = avaliarEstrutura(desconectado);
    expect(relatorioDesconectado.aprovado).toBe(false);
    expect(relatorioDesconectado.componentes).toHaveLength(2);
  });

  it("não cria aresta para pista intracategoria e cria três para pista de três categorias", () => {
    const pistaInterna = pistaSimples("interna", "a1 vem antes de a2.", { tipo: "T4",
      itemA: { categoria: "a", valor: "a1" },
      itemB: { categoria: "a", valor: "a2" },
    });
    const pistaTripla = pistaSimples("tripla", "b2 fica entre a1 e c3.", { tipo: "T7",
      itemA: { categoria: "a", valor: "a1" },
      itemC: { categoria: "b", valor: "b2" },
      itemB: { categoria: "c", valor: "c3" },
    });
    const relatorio = avaliarEstrutura(criarPuzzle(["a", "b", "c"], [pistaInterna, pistaTripla]));

    expect(relatorio.pistasIntracategoria).toBe(7);
    expect(relatorio.pistasAncora).toBe(6);
    expect(relatorio.pistasCrossCategory).toBe(1);
    expect(relatorio.arestas).toEqual([
      { categoriaA: "a", categoriaB: "b" },
      { categoriaA: "a", categoriaB: "c" },
      { categoriaA: "b", categoriaB: "c" },
    ]);
  });

  it("reprova quando todas as categorias seguem a ordem declarada", () => {
    const puzzle = criarPuzzle(["a", "b", "c"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
    ], true);
    const relatorio = avaliarEstrutura(puzzle);

    expect(relatorio.categoriasNaOrdemDeclarada).toBe(3);
    expect(relatorio.aprovado).toBe(false);
  });

  it("isenta o tutorial das reprovações sem deixar de calcular as medidas", () => {
    const tutorial = criarPuzzle(["a", "b", "c", "d"], [
      associacao("ab", "a", "b"),
      associacao("cd", "c", "d"),
    ], true);
    const relatorio = avaliarEstrutura(tutorial, true);

    expect(relatorio.aprovado).toBe(true);
    expect(relatorio.motivos).toEqual([]);
    expect(relatorio.componentes).toHaveLength(2);
    expect(relatorio.categoriasNaOrdemDeclarada).toBe(4);
    expect(Object.keys(relatorio.profundidadeInferencial.porCelula)).toHaveLength(12);
  });
});

describe("conserto do VP — a triagem não pode explodir no caso ruim", () => {
  it("puzzle SEM solução única é REPROVADO, e não lança", () => {
    // A ferramenta existe para julgar candidatos, e é entre candidatos que mora o puzzle inválido.
    // `derivar` lança nesse caso; se `avaliarEstrutura` propagasse, a triagem da fase 5 morreria
    // no primeiro problema mal formado em vez de rejeitá-lo.
    const ambiguo: Puzzle = {
      id: "ambiguo", titulo: "a", contexto: "a", nivel: 2, posicoes: 3,
      categorias: [
        { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bruno", "Carla"] },
        { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
      ],
      pistas: [],
      solucao: { pessoa: ["Ana", "Bruno", "Carla"], cor: ["Azul", "Verde", "Rosa"] },
      metadata: {
        complexity: 1, inferenceDepthDistribution: {}, skillWeights: {},
        dominantOperations: [], clueTypeDistribution: {}, expectedDifficulty: 1,
        validatedUniqueSolution: false,
      },
    };
    const relatorio = avaliarEstrutura(ambiguo);
    expect(relatorio.aprovado).toBe(false);
    expect(relatorio.motivos.join(" ")).toMatch(/derivar/i);
    expect(relatorio.profundidadeInferencial.maxima).toBe(0);
  });
});
