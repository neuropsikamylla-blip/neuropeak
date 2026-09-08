import { derivar } from "./derivacao";
import {
  contarBits,
  criarContexto,
  dominiosIniciais,
  itensDaRestricao,
  propagarDominios,
} from "./motor";
import type { Categoria, Pista, Puzzle, Restricao, TracoDerivacao } from "./tipos";

/** Quantidade máxima de categorias cuja solução pode repetir a ordem declarada dos valores. */
export const LIMIAR_ORDEM_DECLARADA = 1;

/**
 * Heurística lexical de sequências conhecidas. Estes padrões pegam os casos
 * conhecidos; não provam a ausência de uma categoria redundante ao eixo.
 */
export const PADROES_SEQUENCIA_EIXO = {
  hora: /^\s*(\d{1,2})h(?:(\d{2}))?\s*$/i,
  numero: /^\s*(\d+)\s*$/,
  ordinal: /^\s*(\d+)\s*[ºª]\s*$/,
  prefixoNumerado: /^\s*(.+?\D)\s+(\d+)\s*$/,
} as const;

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
  /** Contagem por pista visual: descreve o que a pessoa lê. */
  pistasIntracategoria: number;
  /** Contagem por pista visual: descreve o que a pessoa lê. */
  pistasCrossCategory: number;
  /** T3 é intracategoria, mas aparece também como âncora para não ser confundida com uma restrição interna comum. */
  pistasAncora: number;
  restricoesIntracategoria: number;
  restricoesCrossCategory: number;
  profundidadeInferencial: ProfundidadeInferencial;
  categoriasNasConclusoes: number;
  redundancia: number;
  conectividade: number;
  paresPossiveis: number;
  componentes: string[][];
  arestas: ArestaCategorias[];
  grauPorCategoria: Record<string, number>;
  pontes: number;
  categoriasNaOrdemDeclarada: number;
  categoriasIsomorfasAoEixo: string[];
  categoriasResolviveisSozinhas: string[];
  categoriasSemPistaEssencial: string[];
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

function contarPontes(
  categorias: readonly string[],
  arestas: readonly ArestaCategorias[]
): number {
  const componentesOriginais = componentesDoGrafo(categorias, arestas).length;
  // Há no máximo 6 categorias e 15 arestas. Remover uma aresta por vez e
  // testar conectividade é trivialmente barato neste tamanho e deixa a
  // definição de ponte evidente, sem a complexidade desnecessária de Tarjan.
  return arestas.filter((_, indiceRemovido) =>
    componentesDoGrafo(
      categorias,
      arestas.filter((_, indice) => indice !== indiceRemovido)
    ).length > componentesOriginais
  ).length;
}

function ordemSequencialConhecida(valores: readonly string[]): number[] | null {
  const horas = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.hora));
  if (horas.every((resultado) => resultado !== null)) {
    return horas.map((resultado) => Number(resultado?.[1]) * 60 + Number(resultado?.[2] ?? 0));
  }

  const numeros = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.numero));
  if (numeros.every((resultado) => resultado !== null)) {
    return numeros.map((resultado) => Number(resultado?.[1]));
  }

  const ordinais = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.ordinal));
  if (ordinais.every((resultado) => resultado !== null)) {
    return ordinais.map((resultado) => Number(resultado?.[1]));
  }

  const prefixados = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.prefixoNumerado));
  if (prefixados.every((resultado) => resultado !== null)) {
    const prefixos = new Set(prefixados.map((resultado) => resultado?.[1].trim().toLocaleLowerCase("pt-BR")));
    if (prefixos.size === 1) return prefixados.map((resultado) => Number(resultado?.[2]));
  }

  return null;
}

function categoriaIsomorfaAoEixo(categoria: Categoria, puzzle: Puzzle): boolean {
  const ordem = ordemSequencialConhecida(puzzle.solucao[categoria.id] ?? []);
  return ordem !== null && ordem.every((valor, indice) => indice === 0 || ordem[indice - 1] < valor);
}

function categoriasDaRestricao(restricao: Restricao): string[] {
  return [...new Set(itensDaRestricao(restricao).map((item) => item.categoria))];
}

function pistaSomenteComRestricoes(pista: Pista, restricoes: readonly Restricao[]): Pista {
  return { ...pista, restricoes };
}

function categoriaResolveSozinha(categoriaId: string, puzzle: Puzzle): boolean {
  const pistasIntracategoria = puzzle.pistas.flatMap((pista) => {
    const restricoes = pista.restricoes.filter((restricao) => {
      const categorias = categoriasDaRestricao(restricao);
      return categorias.length === 1 && categorias[0] === categoriaId;
    });
    return restricoes.length === 0 ? [] : [pistaSomenteComRestricoes(pista, restricoes)];
  });
  const contexto = criarContexto(puzzle, pistasIntracategoria);
  const dominios = dominiosIniciais(contexto);
  const propagacao = propagarDominios(dominios, contexto);
  const indiceCategoria = puzzle.categorias.findIndex((categoria) => categoria.id === categoriaId);
  return propagacao.consistente
    && indiceCategoria >= 0
    && contexto.variaveisPorCategoria[indiceCategoria].every(
      (indiceVariavel) => contarBits(dominios[indiceVariavel]) === 1
    );
}

function listarCategorias(ids: readonly string[], puzzle: Puzzle): string {
  return ids.map((id) => puzzle.categorias.find((categoria) => categoria.id === id)?.label ?? id).join(", ");
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
  let restricoesIntracategoria = 0;
  let restricoesCrossCategory = 0;

  for (const pista of puzzle.pistas) {
    let pistaTemRestricaoCross = false;
    if (pista.restricoes.some((restricao) => restricao.tipo === "T3")) pistasAncora += 1;

    for (const restricao of pista.restricoes) {
      const categorias = categoriasDaRestricao(restricao)
        .sort((a, b) => (ordemCategorias.get(a) ?? 0) - (ordemCategorias.get(b) ?? 0));
      if (categorias.length <= 1) {
        restricoesIntracategoria += 1;
        continue;
      }

      restricoesCrossCategory += 1;
      pistaTemRestricaoCross = true;
      for (let a = 0; a < categorias.length; a += 1) {
        for (let b = a + 1; b < categorias.length; b += 1) {
          const aresta = { categoriaA: categorias[a], categoriaB: categorias[b] };
          arestasPorChave.set(chaveAresta(aresta.categoriaA, aresta.categoriaB), aresta);
        }
      }
    }

    if (pistaTemRestricaoCross) pistasCrossCategory += 1;
    else pistasIntracategoria += 1;
  }

  const arestas = [...arestasPorChave.values()];
  const idsCategorias = puzzle.categorias.map((categoria) => categoria.id);
  const componentes = componentesDoGrafo(idsCategorias, arestas);
  const paresPossiveis = idsCategorias.length * (idsCategorias.length - 1) / 2;
  const conectividade = paresPossiveis === 0 ? 0 : arestas.length / paresPossiveis;
  const grauPorCategoria = Object.fromEntries(idsCategorias.map((categoria) => [categoria, 0]));
  for (const { categoriaA, categoriaB } of arestas) {
    grauPorCategoria[categoriaA] += 1;
    grauPorCategoria[categoriaB] += 1;
  }
  const pontes = contarPontes(idsCategorias, arestas);

  // Solução única é necessária, mas não suficiente: `derivar` lança quando
  // ela falta, enquanto os demais critérios abaixo ainda medem a estrutura.
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
  const categoriasComPistaEssencial = new Set(
    puzzle.pistas
      .filter((pista) => pistasEssenciais.has(pista.id))
      .flatMap((pista) => pista.restricoes)
      .flatMap((restricao) => categoriasDaRestricao(restricao))
  );
  const categoriasSemPistaEssencial = traco === null
    ? []
    : idsCategorias.filter((categoria) => !categoriasComPistaEssencial.has(categoria));
  const categoriasNasConclusoes = categoriasComPistaEssencial.size;
  const redundancia = Object.values(traco?.classificacao ?? {})
    .filter((classificacao) => classificacao === "redundante").length;
  const categoriasNaOrdemDeclarada = puzzle.categorias.filter((categoria) =>
    categoria.valores.every((valor, indice) => puzzle.solucao[categoria.id]?.[indice] === valor)
  ).length;
  const categoriasIsomorfasAoEixo = puzzle.categorias
    .filter((categoria) => categoriaIsomorfaAoEixo(categoria, puzzle))
    .map((categoria) => categoria.id);
  const categoriasResolviveisSozinhas = idsCategorias.filter((categoria) =>
    categoriaResolveSozinha(categoria, puzzle)
  );

  const motivos: string[] = [];
  if (erroDerivacao !== null) {
    // Vale inclusive para o tutorial: sem solução única não há problema, e sim um defeito.
    motivos.push(`Não foi possível derivar o puzzle: ${erroDerivacao}`);
  }
  if (!ehTutorial && componentes.length > 1) {
    motivos.push(`O grafo de categorias possui ${componentes.length} componentes independentes.`);
  }
  const categoriasComGrauInsuficiente = idsCategorias.filter((categoria) => grauPorCategoria[categoria] < 2);
  if (!ehTutorial && categoriasComGrauInsuficiente.length > 0) {
    motivos.push(`Categorias com grau menor que 2: ${listarCategorias(categoriasComGrauInsuficiente, puzzle)}.`);
  }
  if (!ehTutorial && pontes > 0) {
    motivos.push(`O grafo de categorias possui ${pontes} ${pontes === 1 ? "ponte" : "pontes"}.`);
  }
  if (!ehTutorial && restricoesCrossCategory <= restricoesIntracategoria) {
    motivos.push(`As restrições cross-category (${restricoesCrossCategory}) não predominam sobre as intracategoria (${restricoesIntracategoria}).`);
  }
  if (!ehTutorial && categoriasIsomorfasAoEixo.length > 0) {
    motivos.push(`Categorias isomorfas ao eixo de posições: ${listarCategorias(categoriasIsomorfasAoEixo, puzzle)}.`);
  }
  if (!ehTutorial && categoriasResolviveisSozinhas.length > 0) {
    motivos.push(`Categorias resolvíveis apenas com restrições próprias: ${listarCategorias(categoriasResolviveisSozinhas, puzzle)}.`);
  }
  if (!ehTutorial && categoriasSemPistaEssencial.length > 0) {
    motivos.push(`Categorias sem cobertura por pista essencial: ${listarCategorias(categoriasSemPistaEssencial, puzzle)}.`);
  }
  if (!ehTutorial && categoriasNaOrdemDeclarada > LIMIAR_ORDEM_DECLARADA) {
    motivos.push(`${categoriasNaOrdemDeclarada} categorias seguem a ordem declarada; o máximo permitido é ${LIMIAR_ORDEM_DECLARADA}.`);
  }

  return {
    aprovado: motivos.length === 0,
    motivos,
    pistasIntracategoria,
    pistasCrossCategory,
    pistasAncora,
    restricoesIntracategoria,
    restricoesCrossCategory,
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
    grauPorCategoria,
    pontes,
    categoriasNaOrdemDeclarada,
    categoriasIsomorfasAoEixo,
    categoriasResolviveisSozinhas,
    categoriasSemPistaEssencial,
  };
}
