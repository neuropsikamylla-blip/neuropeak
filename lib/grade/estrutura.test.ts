import { describe, expect, it } from "vitest";
import { PROBLEMA_TUTORIAL, PROBLEMAS_GRADE } from "./banco";
import { avaliarEstrutura } from "./estrutura";
import { contarBits, criarContexto, dominiosIniciais, propagarDominios } from "./motor";
import { pistaSimples, type Categoria, type Pista, type Puzzle, type Solucao } from "./tipos";

function metadata(): Puzzle["metadata"] {
  return {
    complexity: 1,
    inferenceDepthDistribution: {},
    skillWeights: {},
    dominantOperations: [],
    clueTypeDistribution: {},
    expectedDifficulty: 1,
    validatedUniqueSolution: true,
  };
}

function puzzleMedicao(
  categorias: Categoria[],
  pistas: Pista[],
  solucao: Solucao
): Puzzle {
  return {
    id: "sintetico-medicao",
    titulo: "Puzzle sintético",
    contexto: "Construído exclusivamente para testar a ferramenta estrutural.",
    nivel: 2,
    posicoes: categorias[0].valores.length,
    categorias,
    pistas,
    solucao,
    metadata: metadata(),
  };
}

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
  return puzzleMedicao(
    categorias,
    [...ancoras, ...pistasExtras],
    Object.fromEntries(categoriasIds.map((id) => [id, [`${id}1`, `${id}2`, `${id}3`]]))
  );
}

function associacao(id: string, categoriaA: string, categoriaB: string): Pista {
  return pistaSimples(id, `${categoriaA}1 está com ${categoriaB}1.`, { tipo: "T1",
    itemA: { categoria: categoriaA, valor: `${categoriaA}1` },
    itemB: { categoria: categoriaB, valor: `${categoriaB}1` },
  });
}

describe("grafo estrutural da Grade Dedutiva", () => {
  it("mede grafo conectado e grafo com dois componentes", () => {
    const conectado = criarPuzzle(["a", "b", "c"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
    ]);
    const desconectado = criarPuzzle(["a", "b", "c", "d"], [
      associacao("ab", "a", "b"),
      associacao("cd", "c", "d"),
    ]);

    expect(avaliarEstrutura(conectado).componentes).toHaveLength(1);
    const relatorioDesconectado = avaliarEstrutura(desconectado);
    expect(relatorioDesconectado.aprovado).toBe(false);
    expect(relatorioDesconectado.componentes).toHaveLength(2);
  });

  it("prova a correção: dois triângulos ligados por uma aresta têm grau mínimo 2, mas uma ponte", () => {
    // Triângulo a-b-c, triângulo d-e-f e somente c-d ligando os dois blocos.
    const duasTriades = criarPuzzle(["a", "b", "c", "d", "e", "f"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
      associacao("ac", "a", "c"),
      associacao("de", "d", "e"),
      associacao("ef", "e", "f"),
      associacao("df", "d", "f"),
      associacao("cd-ponte", "c", "d"),
    ]);

    const relatorio = avaliarEstrutura(duasTriades);
    expect(relatorio.componentes).toHaveLength(1);
    expect(Object.values(relatorio.grauPorCategoria).every((grau) => grau >= 2)).toBe(true);
    expect(relatorio.pontes).toBe(1);
    expect(relatorio.motivos).toContain("O grafo de categorias possui 1 ponte.");
    expect(relatorio.aprovado).toBe(false);
  });

  it("não encontra pontes em um ciclo de quatro categorias", () => {
    const ciclo = criarPuzzle(["a", "b", "c", "d"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
      associacao("cd", "c", "d"),
      associacao("ad", "a", "d"),
    ]);

    const relatorio = avaliarEstrutura(ciclo);
    expect(relatorio.componentes).toHaveLength(1);
    expect(relatorio.grauPorCategoria).toEqual({ a: 2, b: 2, c: 2, d: 2 });
    expect(relatorio.pontes).toBe(0);
    expect(relatorio.motivos.some((motivo) => motivo.includes("ponte"))).toBe(false);
  });

  it("aprova integralmente uma estrutura sintética que cumpre a régua", () => {
    const puzzle = puzzleMedicao(
      [
        { id: "pessoa", label: "Pessoa", valores: ["Beto", "Ana", "Caio"] },
        { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
        { id: "fruta", label: "Fruta", valores: ["Pera", "Uva", "Maçã"] },
      ],
      [
        pistaSimples("ana-verde", "Ana escolheu verde.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "cor", valor: "Verde" } }),
        pistaSimples("beto-azul", "Beto escolheu azul.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "cor", valor: "Azul" } }),
        pistaSimples("ana-uva", "Ana escolheu uva.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "fruta", valor: "Uva" } }),
        pistaSimples("beto-pera", "Beto escolheu pera.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "fruta", valor: "Pera" } }),
        pistaSimples("verde-uva", "Verde está com uva.", { tipo: "T1", itemA: { categoria: "cor", valor: "Verde" }, itemB: { categoria: "fruta", valor: "Uva" } }),
        pistaSimples("ana-antes-azul", "Ana vem antes de azul.", { tipo: "T11", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "cor", valor: "Azul" } }),
        pistaSimples("beto-antes-maca", "Beto vem antes de maçã.", { tipo: "T11", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "fruta", valor: "Maçã" } }),
      ],
      {
        pessoa: ["Ana", "Beto", "Caio"],
        cor: ["Verde", "Azul", "Rosa"],
        fruta: ["Uva", "Pera", "Maçã"],
      }
    );

    const relatorio = avaliarEstrutura(puzzle);
    expect(relatorio.aprovado).toBe(true);
    expect(relatorio.motivos).toEqual([]);
    expect(relatorio.grauPorCategoria).toEqual({ pessoa: 2, cor: 2, fruta: 2 });
    expect(relatorio.pontes).toBe(0);
  });

  it("não cria aresta para restrição intra e cria três para restrição de três categorias", () => {
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
    expect(relatorio.restricoesIntracategoria).toBe(7);
    expect(relatorio.restricoesCrossCategory).toBe(1);
    expect(relatorio.arestas).toEqual([
      { categoriaA: "a", categoriaB: "b" },
      { categoriaA: "a", categoriaB: "c" },
      { categoriaA: "b", categoriaB: "c" },
    ]);
  });
});

describe("contagens por pista e por restrição", () => {
  it("uma pista composta pode somar 1 intra + 1 cross, mas continua sendo 1 pista cross", () => {
    const composta: Pista = {
      id: "composta",
      texto: "a1 vem antes de a2, e b1 está com c1.",
      restricoes: [
        { id: "composta#1", tipo: "T4", itemA: { categoria: "a", valor: "a1" }, itemB: { categoria: "a", valor: "a2" } },
        { id: "composta#2", tipo: "T1", itemA: { categoria: "b", valor: "b1" }, itemB: { categoria: "c", valor: "c1" } },
      ],
    };
    const relatorio = avaliarEstrutura(puzzleMedicao(
      [
        { id: "a", label: "A", valores: ["a1", "a2", "a3"] },
        { id: "b", label: "B", valores: ["b1", "b2", "b3"] },
        { id: "c", label: "C", valores: ["c1", "c2", "c3"] },
      ],
      [composta],
      { a: ["a1", "a2", "a3"], b: ["b1", "b2", "b3"], c: ["c1", "c2", "c3"] }
    ));

    expect(relatorio.restricoesIntracategoria).toBe(1);
    expect(relatorio.restricoesCrossCategory).toBe(1);
    expect(relatorio.pistasIntracategoria).toBe(0);
    expect(relatorio.pistasCrossCategory).toBe(1);
  });

  it("reprova quando restrições cross não predominam sobre as intra", () => {
    const relatorio = avaliarEstrutura(criarPuzzle(["a", "b", "c"], [
      associacao("ab", "a", "b"),
      associacao("bc", "b", "c"),
    ]));

    expect(relatorio.restricoesCrossCategory).toBe(2);
    expect(relatorio.restricoesIntracategoria).toBe(6);
    expect(relatorio.motivos).toContain(
      "As restrições cross-category (2) não predominam sobre as intracategoria (6)."
    );
  });
});

describe("categorias redundantes ao eixo de posições", () => {
  function comCategoriaTestada(valores: string[], solucaoTestada: string[]): Puzzle {
    return puzzleMedicao(
      [
        { id: "testada", label: "Testada", valores },
        { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bia", "Caio", "Davi"] },
        { id: "cor", label: "Cor", valores: ["Azul", "Rosa", "Verde", "Lilás"] },
      ],
      [],
      {
        testada: solucaoTestada,
        pessoa: ["Ana", "Bia", "Caio", "Davi"],
        cor: ["Azul", "Rosa", "Verde", "Lilás"],
      }
    );
  }

  it("reprova horários em ordem crescente", () => {
    const relatorio = avaliarEstrutura(comCategoriaTestada(
      ["14h", "15h", "16h", "17h"],
      ["14h", "15h", "16h", "17h"]
    ));

    expect(relatorio.categoriasIsomorfasAoEixo).toEqual(["testada"]);
    expect(relatorio.motivos).toContain("Categorias isomorfas ao eixo de posições: Testada.");
  });

  it("não dispara para os mesmos horários fora de ordem", () => {
    const relatorio = avaliarEstrutura(comCategoriaTestada(
      ["14h", "15h", "16h", "17h"],
      ["15h", "14h", "17h", "16h"]
    ));

    expect(relatorio.categoriasIsomorfasAoEixo).toEqual([]);
  });

  it("nunca interpreta nomes não sequenciais como eixo", () => {
    const relatorio = avaliarEstrutura(comCategoriaTestada(
      ["Ana", "Bia", "Caio", "Davi"],
      ["Ana", "Bia", "Caio", "Davi"]
    ));

    expect(relatorio.categoriasIsomorfasAoEixo).toEqual([]);
  });
});

describe("categoria resolvível de forma independente", () => {
  const categorias: Categoria[] = [
    { id: "a", label: "A", valores: ["a1", "a2", "a3"] },
    { id: "b", label: "B", valores: ["b1", "b2", "b3"] },
    { id: "c", label: "C", valores: ["c1", "c2", "c3"] },
  ];
  const solucao = { a: ["a1", "a2", "a3"], b: ["b1", "b2", "b3"], c: ["c1", "c2", "c3"] };

  it("reprova categoria inteiramente forçada por restrições intra", () => {
    const relatorio = avaliarEstrutura(puzzleMedicao(categorias, [
      pistaSimples("a-1", "a1 está na primeira posição.", { tipo: "T3", item: { categoria: "a", valor: "a1" }, posicao: 1 }),
      pistaSimples("a-2", "a2 está na segunda posição.", { tipo: "T3", item: { categoria: "a", valor: "a2" }, posicao: 2 }),
    ], solucao));

    expect(relatorio.categoriasResolviveisSozinhas).toEqual(["a"]);
    expect(relatorio.motivos).toContain("Categorias resolvíveis apenas com restrições próprias: A.");
  });

  it("não marca a categoria que depende de uma restrição cross para fechar", () => {
    const puzzle = puzzleMedicao(categorias, [
      pistaSimples("a-1", "a1 está na primeira posição.", { tipo: "T3", item: { categoria: "a", valor: "a1" }, posicao: 1 }),
      pistaSimples("b-2", "b2 está na segunda posição.", { tipo: "T3", item: { categoria: "b", valor: "b2" }, posicao: 2 }),
      pistaSimples("a2-b2", "a2 está com b2.", { tipo: "T1", itemA: { categoria: "a", valor: "a2" }, itemB: { categoria: "b", valor: "b2" } }),
    ], solucao);
    const contextoCompleto = criarContexto(puzzle);
    const dominiosCompletos = dominiosIniciais(contextoCompleto);
    propagarDominios(dominiosCompletos, contextoCompleto);
    const relatorio = avaliarEstrutura(puzzle);

    expect(contextoCompleto.variaveisPorCategoria[0].every(
      (indice) => contarBits(dominiosCompletos[indice]) === 1
    )).toBe(true);
    expect(relatorio.categoriasResolviveisSozinhas).not.toContain("a");
  });
});

describe("cobertura essencial e ordem declarada", () => {
  it("exige pista essencial em todas as categorias", () => {
    const base = criarPuzzle(["a", "b", "c"], []);
    const duplicadas = base.pistas.map((pista, indice): Pista => ({
      ...pista,
      id: `duplicada-${indice}`,
      restricoes: pista.restricoes.map((restricao) => ({
        ...restricao,
        id: `duplicada-${indice}#1`,
      })),
    }));
    const relatorio = avaliarEstrutura({ ...base, pistas: [...base.pistas, ...duplicadas] });

    expect(relatorio.categoriasSemPistaEssencial).toEqual(["a", "b", "c"]);
    expect(relatorio.motivos).toContain("Categorias sem cobertura por pista essencial: A, B, C.");
  });

  it("aceita no máximo uma categoria e reprova a partir de duas na ordem declarada", () => {
    const uma = criarPuzzle(["a", "b", "c"], []);
    uma.categorias[0].valores = ["a1", "a2", "a3"];
    const duas = criarPuzzle(["a", "b", "c"], []);
    duas.categorias[0].valores = ["a1", "a2", "a3"];
    duas.categorias[1].valores = ["b1", "b2", "b3"];

    expect(avaliarEstrutura(uma).categoriasNaOrdemDeclarada).toBe(1);
    const relatorioDuas = avaliarEstrutura(duas);
    expect(relatorioDuas.categoriasNaOrdemDeclarada).toBe(2);
    expect(relatorioDuas.motivos).toContain(
      "2 categorias seguem a ordem declarada; o máximo permitido é 1."
    );
  });
});

describe("banco atual", () => {


  it("tutorial passa por isenção, mas todas as medidas continuam calculadas", () => {
    const relatorio = avaliarEstrutura(PROBLEMA_TUTORIAL, true);

    expect(relatorio.aprovado).toBe(true);
    expect(relatorio.motivos).toEqual([]);
    expect(relatorio.componentes).toHaveLength(3);
    expect(relatorio.grauPorCategoria).toEqual({ apresentador: 0, projeto: 0, horario: 0 });
    expect(relatorio.pontes).toBe(0);
    expect(relatorio.restricoesIntracategoria).toBe(4);
    expect(relatorio.restricoesCrossCategory).toBe(0);
    expect(relatorio.categoriasIsomorfasAoEixo).toEqual(["horario"]);
    expect(relatorio.categoriasResolviveisSozinhas).toEqual(["apresentador", "projeto", "horario"]);
    expect(relatorio.categoriasNaOrdemDeclarada).toBe(3);
    expect(Object.keys(relatorio.profundidadeInferencial.porCelula)).toHaveLength(9);
  });
});

describe("solução única é necessária, mas não suficiente", () => {
  it("puzzle sem solução única é reprovado, e não lança", () => {
    const ambiguo = puzzleMedicao(
      [
        { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bruno", "Carla"] },
        { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
        { id: "fruta", label: "Fruta", valores: ["Maçã", "Uva", "Pera"] },
      ],
      [],
      {
        pessoa: ["Ana", "Bruno", "Carla"],
        cor: ["Azul", "Verde", "Rosa"],
        fruta: ["Maçã", "Uva", "Pera"],
      }
    );

    const relatorio = avaliarEstrutura(ambiguo);
    expect(relatorio.aprovado).toBe(false);
    expect(relatorio.motivos.join(" ")).toMatch(/derivar/i);
    expect(relatorio.profundidadeInferencial.maxima).toBe(0);
  });
});
