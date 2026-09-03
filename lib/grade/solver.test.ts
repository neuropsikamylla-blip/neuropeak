import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";
import {
  admiteSolucao,
  chaveCelula,
  contarSolucoes,
  derivar,
  encontrarSolucoes,
  pistasEmConflito,
  temSolucaoUnica,
  validarPuzzle,
  type Categoria,
  type MarcacaoParcial,
  type Pista,
  type Puzzle,
  type PuzzleMetadata,
  type Solucao,
} from "./index";

const CATEGORIAS_BASE: Categoria[] = [
  { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bia", "Caio", "Davi"] },
  { id: "projeto", label: "Projeto", valores: ["Atlas", "Brisa", "Cosmos", "Delta"] },
  { id: "bebida", label: "Bebida", valores: ["Água", "Chá", "Café", "Suco"] },
];

const SOLUCAO_BASE: Solucao = {
  pessoa: ["Ana", "Bia", "Caio", "Davi"],
  projeto: ["Atlas", "Brisa", "Cosmos", "Delta"],
  bebida: ["Água", "Chá", "Café", "Suco"],
};

function metadata(): PuzzleMetadata {
  return {
    complexity: 1,
    inferenceDepthDistribution: {},
    skillWeights: {},
    dominantOperations: [],
    clueTypeDistribution: {},
    expectedDifficulty: 1,
    validatedUniqueSolution: false,
  };
}

function puzzleBase(id: string, pistas: Pista[], solucao: Solucao = SOLUCAO_BASE): Puzzle {
  return {
    id,
    titulo: `Puzzle ${id}`,
    contexto: "Contexto de teste",
    nivel: 1,
    posicoes: 4,
    categorias: CATEGORIAS_BASE.map((categoria) => ({
      ...categoria,
      valores: [...categoria.valores],
    })),
    pistas,
    solucao: Object.fromEntries(Object.entries(solucao).map(([idCategoria, valores]) => [idCategoria, [...valores]])),
    metadata: metadata(),
  };
}

function marca(
  categoria: string,
  valor: string,
  posicao: number,
  estado: "impossivel" | "hipotese" | "confirmado" = "confirmado"
): MarcacaoParcial[number] {
  return { categoria, valor, posicao, estado };
}

function pistaT3(id: string, categoria: string, valor: string, posicao: number): Pista {
  return { id, tipo: "T3", texto: `${valor} está na posição ${posicao}.`, item: { categoria, valor }, posicao };
}

function puzzleSemSolucao(): Puzzle {
  return puzzleBase("zero", [
    pistaT3("z1", "pessoa", "Ana", 1),
    pistaT3("z2", "pessoa", "Bia", 1),
  ]);
}

function puzzleAmbiguo(): Puzzle {
  return puzzleBase("ambiguo", []);
}

function puzzleUnico(): Puzzle {
  const pistas: Pista[] = [];
  for (const categoria of CATEGORIAS_BASE) {
    categoria.valores.slice(0, 3).forEach((valor, indice) => {
      pistas.push(pistaT3(`u-${categoria.id}-${indice + 1}`, categoria.id, valor, indice + 1));
    });
  }
  return puzzleBase("unico", pistas);
}

interface CasoOperador {
  nome: string;
  pista: Pista;
  permitida: MarcacaoParcial;
  proibida: MarcacaoParcial;
}

const CASOS_OPERADORES: CasoOperador[] = [
  {
    nome: "T1 associação direta",
    pista: { id: "t1", tipo: "T1", texto: "Ana está com Atlas.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } },
    permitida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1)],
    proibida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2)],
  },
  {
    nome: "T2 exclusão",
    pista: { id: "t2", tipo: "T2", texto: "Ana não está com Atlas.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } },
    permitida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2)],
    proibida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1)],
  },
  {
    nome: "T3 posição absoluta",
    pista: pistaT3("t3", "pessoa", "Ana", 2),
    permitida: [marca("pessoa", "Ana", 2)],
    proibida: [marca("pessoa", "Ana", 3)],
  },
  {
    nome: "T4 ordem relativa com distância",
    pista: { id: "t4", tipo: "T4", texto: "Ana está à esquerda de Davi.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "pessoa", valor: "Davi" } },
    permitida: [marca("pessoa", "Ana", 1), marca("pessoa", "Davi", 4)],
    proibida: [marca("pessoa", "Ana", 4), marca("pessoa", "Davi", 1)],
  },
  {
    nome: "T5 adjacência",
    pista: { id: "t5", tipo: "T5", texto: "Ana está ao lado de Atlas.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } },
    permitida: [marca("pessoa", "Ana", 2), marca("projeto", "Atlas", 3)],
    proibida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 3)],
  },
  {
    nome: "T6 direção e adjacência",
    pista: { id: "t6", tipo: "T6", texto: "Ana está exatamente à esquerda de Atlas.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } },
    permitida: [marca("pessoa", "Ana", 2), marca("projeto", "Atlas", 3)],
    proibida: [marca("pessoa", "Ana", 3), marca("projeto", "Atlas", 2)],
  },
  {
    nome: "T7 entre na ordem A-C-B",
    pista: { id: "t7", tipo: "T7", texto: "Bia está entre Ana e Davi, nessa ordem.", itemA: { categoria: "pessoa", valor: "Ana" }, itemC: { categoria: "pessoa", valor: "Bia" }, itemB: { categoria: "pessoa", valor: "Davi" } },
    permitida: [marca("pessoa", "Ana", 1), marca("pessoa", "Bia", 2), marca("pessoa", "Davi", 4)],
    proibida: [marca("pessoa", "Ana", 1), marca("pessoa", "Bia", 4), marca("pessoa", "Davi", 3)],
  },
  {
    nome: "T8 associação cruzada",
    pista: { id: "t8", tipo: "T8", texto: "Atlas é servido com Água.", itemA: { categoria: "projeto", valor: "Atlas" }, itemB: { categoria: "bebida", valor: "Água" } },
    permitida: [marca("projeto", "Atlas", 4), marca("bebida", "Água", 4)],
    proibida: [marca("projeto", "Atlas", 4), marca("bebida", "Água", 3)],
  },
  {
    nome: "T9 condicional",
    pista: { id: "t9", tipo: "T9", texto: "Se Ana está com Atlas, então Bia toma Chá.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" }, itemC: { categoria: "pessoa", valor: "Bia" }, itemD: { categoria: "bebida", valor: "Chá" } },
    permitida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 4)],
    proibida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 4)],
  },
  {
    nome: "T10 alternativa exclusiva",
    pista: { id: "t10", tipo: "T10", texto: "Exatamente uma das associações é verdadeira.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" }, itemC: { categoria: "pessoa", valor: "Bia" }, itemD: { categoria: "bebida", valor: "Chá" } },
    permitida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 4)],
    proibida: [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1), marca("pessoa", "Bia", 2), marca("bebida", "Chá", 2)],
  },
  {
    nome: "T11 relação composta com distância",
    pista: { id: "t11", tipo: "T11", texto: "Ana vem antes do Café.", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "bebida", valor: "Café" } },
    permitida: [marca("pessoa", "Ana", 1), marca("bebida", "Café", 4)],
    proibida: [marca("pessoa", "Ana", 4), marca("bebida", "Café", 1)],
  },
];

function caso(tipo: Pista["tipo"]): CasoOperador {
  const encontrado = CASOS_OPERADORES.find((candidato) => candidato.pista.tipo === tipo);
  if (encontrado === undefined) throw new Error(`Caso ausente para ${tipo}.`);
  return encontrado;
}

function puzzleDesempenho(): Puzzle {
  const ids = ["a", "b", "c", "d", "e"];
  const categorias = ids.map((id) => ({
    id,
    label: id.toUpperCase(),
    valores: [1, 2, 3, 4, 5].map((numero) => `${id}${numero}`),
  }));
  const pistas: Pista[] = [];
  for (const id of ids) {
    pistas.push({
      id: `${id}-ordem-1`, tipo: "T7", texto: `${id}1, ${id}2 e ${id}3 estão nessa ordem.`,
      itemA: { categoria: id, valor: `${id}1` }, itemC: { categoria: id, valor: `${id}2` }, itemB: { categoria: id, valor: `${id}3` },
    });
    pistas.push({
      id: `${id}-ordem-2`, tipo: "T7", texto: `${id}3, ${id}4 e ${id}5 estão nessa ordem.`,
      itemA: { categoria: id, valor: `${id}3` }, itemC: { categoria: id, valor: `${id}4` }, itemB: { categoria: id, valor: `${id}5` },
    });
  }
  for (let indice = 0; indice < 4; indice += 1) {
    pistas.push({
      id: `cruzada-${indice + 1}`, tipo: "T8", texto: "Os primeiros valores coincidem.",
      itemA: { categoria: ids[indice], valor: `${ids[indice]}1` },
      itemB: { categoria: ids[indice + 1], valor: `${ids[indice + 1]}1` },
    });
  }
  pistas.push({
    id: "composta-final", tipo: "T11", texto: "a1 vem antes de e5.",
    itemA: { categoria: "a", valor: "a1" }, itemB: { categoria: "e", valor: "e5" },
  });

  return {
    id: "desempenho-5x5",
    titulo: "Desempenho 5×5",
    contexto: "Puzzle determinístico para prova de desempenho.",
    nivel: 5,
    posicoes: 5,
    categorias,
    pistas,
    solucao: Object.fromEntries(categorias.map((categoria) => [categoria.id, [...categoria.valores]])),
    metadata: metadata(),
  };
}

function puzzleTraco(): Puzzle {
  const categorias: Categoria[] = [
    { id: "p", label: "Pessoa", valores: ["p1", "p2", "p3", "p4"] },
    { id: "x", label: "Projeto", valores: ["x1", "x2", "x3", "x4"] },
    { id: "d", label: "Bebida", valores: ["d1", "d2", "d3", "d4"] },
  ];
  const pistas: Pista[] = [
    { id: "tr-1", tipo: "T1", texto: "p1 está com x1.", itemA: { categoria: "p", valor: "p1" }, itemB: { categoria: "x", valor: "x1" } },
    pistaT3("tr-2", "x", "x1", 1),
    { id: "tr-3", tipo: "T6", texto: "p2 vem antes de p3.", itemA: { categoria: "p", valor: "p2" }, itemB: { categoria: "p", valor: "p3" } },
    { id: "tr-4", tipo: "T6", texto: "p3 vem antes de p4.", itemA: { categoria: "p", valor: "p3" }, itemB: { categoria: "p", valor: "p4" } },
    { id: "tr-5", tipo: "T6", texto: "x2 vem antes de x3.", itemA: { categoria: "x", valor: "x2" }, itemB: { categoria: "x", valor: "x3" } },
    { id: "tr-6", tipo: "T6", texto: "x3 vem antes de x4.", itemA: { categoria: "x", valor: "x3" }, itemB: { categoria: "x", valor: "x4" } },
    { id: "tr-7", tipo: "T6", texto: "d1 vem antes de d2.", itemA: { categoria: "d", valor: "d1" }, itemB: { categoria: "d", valor: "d2" } },
    { id: "tr-8", tipo: "T6", texto: "d2 vem antes de d3.", itemA: { categoria: "d", valor: "d2" }, itemB: { categoria: "d", valor: "d3" } },
    { id: "tr-9", tipo: "T6", texto: "d3 vem antes de d4.", itemA: { categoria: "d", valor: "d3" }, itemB: { categoria: "d", valor: "d4" } },
    { id: "tr-10", tipo: "T11", texto: "d1 vem antes de d4.", itemA: { categoria: "d", valor: "d1" }, itemB: { categoria: "d", valor: "d4" } },
  ];
  return {
    id: "traco-duas-pistas",
    titulo: "Traço",
    contexto: "Conclusão encadeada.",
    nivel: 2,
    posicoes: 4,
    categorias,
    pistas,
    solucao: Object.fromEntries(categorias.map((categoria) => [categoria.id, [...categoria.valores]])),
    metadata: metadata(),
  };
}

describe("solver da Grade Dedutiva — testes 1–17 da seção 95", () => {
  it("1. rejeita puzzle com zero soluções", () => {
    expect(contarSolucoes(puzzleSemSolucao(), 2)).toBe(0);
    expect(validarPuzzle(puzzleSemSolucao())).toMatch(/não possui solução/);
  });

  it("2. identifica puzzle com duas ou mais soluções", () => {
    expect(contarSolucoes(puzzleAmbiguo(), 2)).toBe(2);
    expect(temSolucaoUnica(puzzleAmbiguo())).toBe(false);
    expect(validarPuzzle(puzzleAmbiguo())).toMatch(/mais de uma solução/);
  });

  it("3. aceita puzzle de solução única e confere o gabarito", () => {
    expect(temSolucaoUnica(puzzleUnico())).toBe(true);
    expect(validarPuzzle(puzzleUnico())).toBeNull();
    expect(encontrarSolucoes(puzzleUnico())).toEqual([SOLUCAO_BASE]);
  });

  it("4. executa T1 como associação direta", () => {
    const c = caso("T1"); const puzzle = puzzleBase("regra-t1", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("5. executa T2 como exclusão", () => {
    const c = caso("T2"); const puzzle = puzzleBase("regra-t2", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("6. executa T3 com posição absoluta 1-based", () => {
    const c = caso("T3"); const puzzle = puzzleBase("regra-t3", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("7. executa T4 como ordem relativa, sem exigir adjacência", () => {
    const c = caso("T4"); const puzzle = puzzleBase("regra-t4", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("8. distingue esquerda de direita em T4", () => {
    const c = caso("T4"); const puzzle = puzzleBase("direcao-t4", [c.pista]);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 2), marca("pessoa", "Davi", 3)])).toBe(true);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 3), marca("pessoa", "Davi", 2)])).toBe(false);
  });

  it("9. executa T5 como adjacência sem direção", () => {
    const c = caso("T5"); const puzzle = puzzleBase("regra-t5", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 3), marca("projeto", "Atlas", 2)])).toBe(true);
  });

  it("10. restringe corretamente T5 nas duas pontas", () => {
    const c = caso("T5"); const puzzle = puzzleBase("pontas-t5", [c.pista]);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2)])).toBe(true);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 4), marca("projeto", "Atlas", 3)])).toBe(true);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 4)])).toBe(false);
  });

  it("11. executa T6 como adjacência dirigida", () => {
    const c = caso("T6"); const puzzle = puzzleBase("regra-t6", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 3)])).toBe(false);
  });

  it("12. executa T7 com C entre A e B", () => {
    const c = caso("T7"); const puzzle = puzzleBase("regra-t7", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("13. T7 exige especificamente a ordem A-C-B", () => {
    const c = caso("T7"); const puzzle = puzzleBase("ordem-t7", [c.pista]);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Davi", 1), marca("pessoa", "Bia", 2), marca("pessoa", "Ana", 4)])).toBe(false);
  });

  it("14. executa T8 entre categorias diferentes", () => {
    const c = caso("T8"); const puzzle = puzzleBase("regra-t8", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("15. executa T9 como implicação, não bicondicional", () => {
    const c = caso("T9"); const puzzle = puzzleBase("regra-t9", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 3)])).toBe(true);
  });

  it("16. executa T10 como XOR", () => {
    const c = caso("T10"); const puzzle = puzzleBase("regra-t10", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 4)])).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 2), marca("pessoa", "Bia", 3), marca("bebida", "Chá", 3)])).toBe(true);
  });

  it("17. aplica exclusividade 1:1 implicitamente", () => {
    const puzzle = puzzleAmbiguo();
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("pessoa", "Bia", 1)])).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1), marca("pessoa", "Bia", 2)])).toBe(true);
  });
});

describe("provas adicionais da Fase 2", () => {
  it("executa T11 como ordem ampla e não como adjacência", () => {
    const c = caso("T11"); const puzzle = puzzleBase("regra-t11", [c.pista]);
    expect(admiteSolucao(puzzle, c.permitida)).toBe(true);
    expect(admiteSolucao(puzzle, c.proibida)).toBe(false);
  });

  it("ignora hipótese e restringe confirmação na mesma célula", () => {
    const puzzle = puzzleBase("hipotese", [pistaT3("h1", "pessoa", "Ana", 1)]);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 2, "hipotese")])).toBe(true);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 2, "confirmado")])).toBe(false);
    expect(admiteSolucao(puzzle, [marca("pessoa", "Ana", 1, "impossivel")])).toBe(false);
  });

  it("calcula profundidade 2 quando a conclusão exige duas pistas", () => {
    const puzzle = puzzleTraco();
    expect(validarPuzzle(puzzle)).toBeNull();
    const traco = derivar(puzzle);
    expect(traco.porCelula[chaveCelula("p", "p1", 1)]).toEqual({
      profundidade: 2,
      pistas: ["tr-1", "tr-2"],
    });
    expect(traco.distribuicaoProfundidade["2"]).toBeGreaterThan(0);
    expect(traco.poderRestritivo["tr-2"]).toBeGreaterThan(0);
    expect(traco.classificacao["tr-1"]).toBe("essencial");
    expect(traco.classificacao["tr-10"]).toBe("redundante");
  });

  it("devolve pistas relevantes, explicitamente sem prometer conjunto mínimo", () => {
    const conflito = pistasEmConflito(puzzleTraco(), [marca("p", "p1", 4)]);
    expect(conflito).toContain("tr-1");
    expect(conflito).toContain("tr-2");
  });

  it("resolve puzzle 5×5 com 15 pistas em menos de 200 ms", () => {
    const puzzle = puzzleDesempenho();
    expect(puzzle.categorias).toHaveLength(5);
    expect(puzzle.pistas).toHaveLength(15);
    const inicio = performance.now();
    const solucoes = encontrarSolucoes(puzzle, 2);
    const tempoMs = performance.now() - inicio;
    console.info(`[grade] puzzle 5×5/15: ${tempoMs.toFixed(3)} ms`);
    expect(solucoes).toHaveLength(1);
    expect(tempoMs).toBeLessThan(200);
  });

  it("prova os critérios por contagem sobre listas de puzzles e operadores", () => {
    const puzzles = [puzzleSemSolucao(), puzzleAmbiguo(), puzzleUnico(), puzzleDesempenho()];
    const contagens = puzzles.map((puzzle) => contarSolucoes(puzzle, 2));
    expect(contagens.filter((quantidade) => quantidade === 0)).toHaveLength(1);
    expect(contagens.filter((quantidade) => quantidade === 1)).toHaveLength(2);
    expect(contagens.filter((quantidade) => quantidade >= 2)).toHaveLength(1);

    const resultados = CASOS_OPERADORES.map((c) => ({
      permitida: admiteSolucao(puzzleBase(`lista-${c.pista.tipo}`, [c.pista]), c.permitida),
      proibida: admiteSolucao(puzzleBase(`lista-${c.pista.tipo}`, [c.pista]), c.proibida),
    }));
    expect(resultados.filter((resultado) => resultado.permitida)).toHaveLength(CASOS_OPERADORES.length);
    expect(resultados.filter((resultado) => !resultado.proibida)).toHaveLength(CASOS_OPERADORES.length);
  });
});
