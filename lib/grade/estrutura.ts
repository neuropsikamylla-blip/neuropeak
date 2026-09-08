import { derivar } from "./derivacao";
import { itensDaPista } from "./motor";
import type { Puzzle, TracoDerivacao } from "./tipos";

/** Proporção que representa todas as categorias na ordem declarada. */
export const LIMIAR_ORDEM_DECLARADA = 1;

export interface ArestaCategorias {
  categoriaA: string;
  categoriaB: string;
}

export interface ProfundidadeInferencial {
  porCelula: TracoDerivacao["porCelula"];
  maxima: number;
  distribuicao: TracoDerivacao["distribuicaoProfundidade"];
}

export interface RelatorioEstrutural {
  aprovado: boolean;
  motivos: string[];
  pistasIntracategoria: number;
  pistasCrossCategory: number;
  /** T3 é intracategoria, mas aparece também como âncora para não ser confundida com uma restrição interna comum. */
  pistasAncora: number;
  profundidadeInferencial: ProfundidadeInferencial;
  categoriasNasConclusoes: number;
  redundancia: number;
  conectividade: number;
  paresPossiveis: number;
  componentes: string[][];
  arestas: ArestaCategorias[];
  categoriasNaOrdemDeclarada: number;
}

function chaveAresta(categoriaA: string, categoriaB: string): string {
  return JSON.stringify([categoriaA, categoriaB]);
}

function componentesDoGrafo(
  categorias: readonly string[],
  arestas: readonly ArestaCategorias[]
): string[][] {
  const vizinhas = new Map(categorias.map((categoria) => [categoria, new Set<string>()]));
  for (const { categoriaA, categoriaB } of arestas) {
    vizinhas.get(categoriaA)?.add(categoriaB);
    vizinhas.get(categoriaB)?.add(categoriaA);
  }

  const visitadas = new Set<string>();
  const componentes: string[][] = [];
  for (const categoria of categorias) {
    if (visitadas.has(categoria)) continue;
    const componente: string[] = [];
    const pendentes = [categoria];
    visitadas.add(categoria);
    while (pendentes.length > 0) {
      const atual = pendentes.shift();
      if (atual === undefined) continue;
      componente.push(atual);
      for (const vizinha of vizinhas.get(atual) ?? []) {
        if (visitadas.has(vizinha)) continue;
        visitadas.add(vizinha);
        pendentes.push(vizinha);
      }
    }
    componentes.push(componente);
  }
  return componentes;
}

/**
 * Estas medidas descrevem propriedades do problema; não são números clínicos
 * nem autorizam interpretação sobre a pessoa que o resolve.
 */
export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioEstrutural {
  const ordemCategorias = new Map(
    puzzle.categorias.map((categoria, indice) => [categoria.id, indice])
  );
  const arestasPorChave = new Map<string, ArestaCategorias>();
  let pistasIntracategoria = 0;
  let pistasCrossCategory = 0;
  let pistasAncora = 0;

  for (const pista of puzzle.pistas) {
    const categorias = [...new Set(itensDaPista(pista).map((item) => item.categoria))]
      .sort((a, b) => (ordemCategorias.get(a) ?? 0) - (ordemCategorias.get(b) ?? 0));
    if (categorias.length <= 1) {
      pistasIntracategoria += 1;
      if (pista.restricoes.some((restricao) => restricao.tipo === "T3")) pistasAncora += 1;
      continue;
    }

    pistasCrossCategory += 1;
    for (let a = 0; a < categorias.length; a += 1) {
      for (let b = a + 1; b < categorias.length; b += 1) {
        const aresta = { categoriaA: categorias[a], categoriaB: categorias[b] };
        arestasPorChave.set(chaveAresta(aresta.categoriaA, aresta.categoriaB), aresta);
      }
    }
  }

  const arestas = [...arestasPorChave.values()];
  const idsCategorias = puzzle.categorias.map((categoria) => categoria.id);
  const componentes = componentesDoGrafo(idsCategorias, arestas);
  const paresPossiveis = idsCategorias.length * (idsCategorias.length - 1) / 2;
  const conectividade = paresPossiveis === 0 ? 0 : arestas.length / paresPossiveis;

  // `derivar` LANÇA quando o puzzle não tem solução única — e esta ferramenta existe justamente
  // para julgar candidatos, que é onde puzzles inválidos aparecem. Uma ferramenta de triagem que
  // explode no caso ruim não serve: aqui o caso ruim é REPROVAÇÃO, com o motivo dito.
  let traco: TracoDerivacao | null = null;
  let erroDerivacao: string | null = null;
  try {
    traco = derivar(puzzle);
  } catch (erro) {
    erroDerivacao = erro instanceof Error ? erro.message : String(erro);
  }
  const pistasEssenciais = new Set(
    Object.entries(traco?.classificacao ?? {})
      .filter(([, classificacao]) => classificacao === "essencial")
      .map(([pistaId]) => pistaId)
  );
  const categoriasNasConclusoes = new Set(
    puzzle.pistas
      .filter((pista) => pistasEssenciais.has(pista.id))
      .flatMap((pista) => itensDaPista(pista).map((item) => item.categoria))
  ).size;
  const redundancia = Object.values(traco?.classificacao ?? {})
    .filter((classificacao) => classificacao === "redundante").length;
  const categoriasNaOrdemDeclarada = puzzle.categorias.filter((categoria) =>
    categoria.valores.every((valor, indice) => puzzle.solucao[categoria.id]?.[indice] === valor)
  ).length;

  const motivos: string[] = [];
  if (erroDerivacao !== null) {
    // Vale inclusive para o tutorial: sem solução única não há problema, e sim um defeito.
    motivos.push(`Não foi possível derivar o puzzle: ${erroDerivacao}`);
  }
  if (!ehTutorial && componentes.length > 1) {
    motivos.push(`O grafo de categorias possui ${componentes.length} componentes independentes.`);
  }
  const proporcaoNaOrdem = idsCategorias.length === 0
    ? 0
    : categoriasNaOrdemDeclarada / idsCategorias.length;
  if (!ehTutorial && proporcaoNaOrdem >= LIMIAR_ORDEM_DECLARADA) {
    motivos.push("Todas as categorias seguem a ordem em que seus valores foram declarados.");
  }

  return {
    aprovado: motivos.length === 0,
    motivos,
    pistasIntracategoria,
    pistasCrossCategory,
    pistasAncora,
    profundidadeInferencial: {
      porCelula: traco?.porCelula ?? {},
      maxima: traco?.profundidadeMaxima ?? 0,
      distribuicao: traco?.distribuicaoProfundidade ?? {},
    },
    categoriasNasConclusoes,
    redundancia,
    conectividade,
    paresPossiveis,
    componentes,
    arestas,
    categoriasNaOrdemDeclarada,
  };
}
