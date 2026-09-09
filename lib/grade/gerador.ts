import { avaliarEstrutura } from "./estrutura";
import {
  textoDaPistaComposta,
  textoDaRestricao,
  verificarTextoPista,
  type GramaticaTema,
} from "./gramatica";
import { contarSolucoes } from "./solver";
import type {
  Categoria,
  Item,
  Pista,
  Puzzle,
  PuzzleMetadata,
  Restricao,
  Solucao,
  TipoPista,
} from "./tipos";

export interface TemaGrade {
  id: string;
  titulo: string;
  contexto: string;
  rotulosPosicao: readonly string[];
  categorias: readonly Categoria[];
  gramatica: GramaticaTema;
}

export interface ResultadoGeracao {
  seed: string;
  puzzles: Puzzle[];
  tentativas: Record<string, number>;
}

interface Candidata {
  texto: string;
  restricoes: Restricao[];
  peso: number;
}

type RestricaoSemId<T extends Restricao = Restricao> = T extends unknown
  ? Omit<T, "id">
  : never;

type Aleatorio = () => number;

const gramaticaPessoa = {
  sujeito: (valor: string) => valor,
  predicado: (valor: string) => `é ${valor}`,
  referencia: (valor: string) => valor,
};

export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
  {
    id: "consultas-manha",
    titulo: "Consultas da manhã",
    contexto: "Quatro pacientes foram atendidos pela manhã. Organize pacientes, especialidades e salas.",
    rotulosPosicao: ["8h", "9h", "10h", "11h"],
    categorias: [
      { id: "paciente", label: "Paciente", valores: ["Alice", "Décio", "Íris", "Rafa"] },
      { id: "especialidade", label: "Especialidade", valores: ["Cardiologia", "Nutrição", "Ortopedia", "Psicologia"] },
      { id: "sala", label: "Sala", valores: ["Âmbar", "Coral", "Jade", "Névoa"] },
    ],
    gramatica: {
      categorias: {
        paciente: gramaticaPessoa,
        especialidade: {
          sujeito: (valor) => `Quem foi à ${valor}`,
          predicado: (valor) => `foi à ${valor}`,
          referencia: (valor) => `quem foi à ${valor}`,
        },
        sala: {
          sujeito: (valor) => `Quem usou a sala ${valor}`,
          predicado: (valor) => `usou a sala ${valor}`,
          referencia: (valor) => `quem usou a sala ${valor}`,
        },
      },
      ordem: {
        antesDe: "foi atendido antes de",
        imediatamenteAntesDe: "foi atendido imediatamente antes de",
        vizinhas: "foram atendidos em horários vizinhos",
        entre: "foi atendido entre",
      },
    },
  },
  {
    id: "turnos-cafeteria",
    titulo: "Turnos na cafeteria",
    contexto: "Quatro baristas trabalharam em dias diferentes. Organize baristas, preparos e postos.",
    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta"],
    categorias: [
      { id: "barista", label: "Barista", valores: ["Bruno", "Ester", "Nara", "Tulio"] },
      { id: "preparo", label: "Preparo", valores: ["Espresso", "Filtrado", "Gelado", "Prensa"] },
      { id: "posto", label: "Posto", valores: ["Balcão", "Caixa", "Forno", "Salão"] },
    ],
    gramatica: {
      categorias: {
        barista: gramaticaPessoa,
        preparo: {
          sujeito: (valor) => `Quem preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
          predicado: (valor) => `preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
          referencia: (valor) => `quem preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
        },
        posto: {
          sujeito: (valor) => `Quem ficou no ${valor}`,
          predicado: (valor) => `ficou no ${valor}`,
          referencia: (valor) => `quem ficou no ${valor}`,
        },
      },
      ordem: {
        antesDe: "trabalhou antes de",
        imediatamenteAntesDe: "trabalhou imediatamente antes de",
        vizinhas: "trabalharam em dias vizinhos",
        entre: "trabalhou entre",
      },
    },
  },
  {
    id: "sessoes-cineclube",
    titulo: "Sessões do cineclube",
    contexto: "Quatro filmes foram exibidos em sessões diferentes. Organize filmes, curadores e gêneros.",
    rotulosPosicao: ["18h", "19h30", "21h", "22h30"],
    categorias: [
      { id: "filme", label: "Filme", valores: ["Correnteza", "Estuário", "Miragem", "Vertigem"] },
      { id: "curador", label: "Curador", valores: ["Ciro", "Lena", "Otto", "Vera"] },
      { id: "genero", label: "Gênero", valores: ["Documentário", "Drama", "Policial", "Suspense"] },
    ],
    gramatica: {
      categorias: {
        filme: gramaticaPessoa,
        curador: {
          // "Quem foi apresentado por Ciro" trataria um FILME como pessoa.
          sujeito: (valor) => `O filme apresentado por ${valor}`,
          predicado: (valor) => `foi apresentado por ${valor}`,
          referencia: (valor) => `o filme apresentado por ${valor}`,
        },
        genero: {
          sujeito: (valor) => `O ${valor}`,
          predicado: (valor) => `é um ${valor}`,
          referencia: (valor) => `o ${valor}`,
        },
      },
      ordem: {
        antesDe: "foi exibido antes de",
        imediatamenteAntesDe: "foi exibido imediatamente antes de",
        vizinhas: "foram exibidos em horários vizinhos",
        entre: "foi exibido entre",
      },
    },
  },
  {
    id: "oficinas-centro-cultural",
    titulo: "Oficinas no centro cultural",
    contexto: "Quatro oficinas aconteceram em horários diferentes. Organize oficinas, mediadores e espaços.",
    rotulosPosicao: ["14h", "15h", "16h", "17h"],
    categorias: [
      { id: "oficina", label: "Oficina", valores: ["Cerâmica", "Fotografia", "Marcenaria", "Tecelagem"] },
      { id: "mediador", label: "Mediador", valores: ["Alma", "Iuri", "Sol", "Zeca"] },
      { id: "espaco", label: "Espaço", valores: ["Ateliê", "Galpão", "Mezanino", "Pátio"] },
    ],
    gramatica: {
      categorias: {
        oficina: {
          sujeito: (valor) => `A oficina de ${valor}`,
          predicado: (valor) => `é a oficina de ${valor}`,
          referencia: (valor) => `a oficina de ${valor}`,
        },
        mediador: {
          // "a oficina de Sol" colidia com "a oficina de Marcenaria": mesma forma para o
          // mediador e para o nome da oficina. O paciente não tem como saber qual é qual.
          sujeito: (valor) => `A oficina mediada por ${valor}`,
          predicado: (valor) => `foi mediada por ${valor}`,
          referencia: (valor) => `a oficina mediada por ${valor}`,
        },
        espaco: {
          sujeito: (valor) => `A oficina que ocupou o ${valor}`,
          predicado: (valor) => `ocupou o ${valor}`,
          referencia: (valor) => `a oficina que ocupou o ${valor}`,
        },
      },
      ordem: {
        antesDe: "aconteceu antes de",
        imediatamenteAntesDe: "aconteceu imediatamente antes de",
        vizinhas: "aconteceram em horários vizinhos",
        entre: "aconteceu entre",
      },
    },
  },
];

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let indice = 0; indice < seed.length; indice += 1) {
    hash ^= seed.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function criarAleatorio(seed: string): Aleatorio {
  let estado = hashSeed(seed);
  return () => {
    estado += 0x6d2b79f5;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar<T>(itens: readonly T[], aleatorio: Aleatorio): T[] {
  const resultado = [...itens];
  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const outro = Math.floor(aleatorio() * (indice + 1));
    [resultado[indice], resultado[outro]] = [resultado[outro], resultado[indice]];
  }
  return resultado;
}

function iguais(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((valor, indice) => valor === b[indice]);
}

function montarCategoriasESolucao(
  tema: TemaGrade,
  aleatorio: Aleatorio
): { categorias: Categoria[]; solucao: Solucao } {
  const solucao: Solucao = {};
  const categorias = tema.categorias.map((categoria) => {
    const ordemSolucao = embaralhar(categoria.valores, aleatorio);
    let ordemDeclarada = embaralhar(categoria.valores, aleatorio);
    solucao[categoria.id] = ordemSolucao;
    return { categoria, ordemSolucao, ordemDeclarada };
  });

  let coincidencias = 0;
  for (const entrada of categorias) {
    if (!iguais(entrada.ordemSolucao, entrada.ordemDeclarada)) continue;
    coincidencias += 1;
    if (coincidencias > 1) {
      entrada.ordemDeclarada = [
        ...entrada.ordemDeclarada.slice(1),
        entrada.ordemDeclarada[0],
      ];
    }
  }

  return {
    categorias: categorias.map(({ categoria, ordemDeclarada }) => ({
      ...categoria,
      valores: ordemDeclarada,
    })),
    solucao,
  };
}

function chaveItem(item: Item): string {
  return JSON.stringify([item.categoria, item.valor]);
}

function categoriasDaRestricao(restricao: Restricao): Set<string> {
  const itens: Item[] = [];
  if ("item" in restricao) itens.push(restricao.item);
  if ("itemA" in restricao) itens.push(restricao.itemA);
  if ("itemB" in restricao) itens.push(restricao.itemB);
  if ("itemC" in restricao) itens.push(restricao.itemC);
  if ("itemD" in restricao) itens.push(restricao.itemD);
  return new Set(itens.map((item) => item.categoria));
}

function candidataSimples(
  restricao: Restricao,
  tema: TemaGrade
): Candidata {
  const cross = categoriasDaRestricao(restricao).size > 1;
  return {
    texto: textoDaRestricao(restricao, tema.gramatica, tema.rotulosPosicao),
    restricoes: [restricao],
    peso: cross ? 12 : 1,
  };
}

function criarPool(tema: TemaGrade, puzzle: Puzzle): Candidata[] {
  let proximoId = 1;
  const restricao = (valor: RestricaoSemId): Restricao => ({
    ...valor,
    id: `candidata-${proximoId++}`,
  } as Restricao);
  const candidatas: Candidata[] = [];
  const posicaoPorItem = new Map<string, number>();
  const itens: Item[] = [];

  for (const categoria of puzzle.categorias) {
    for (const valor of categoria.valores) {
      const item = { categoria: categoria.id, valor };
      itens.push(item);
      posicaoPorItem.set(chaveItem(item), puzzle.solucao[categoria.id].indexOf(valor));
    }
  }
  const posicao = (item: Item): number => posicaoPorItem.get(chaveItem(item)) ?? -1;

  for (const item of itens) {
    candidatas.push(candidataSimples(restricao({ tipo: "T3", item, posicao: posicao(item) + 1 }), tema));
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = 0; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (itemA.categoria === itemB.categoria) continue;
      if (posicao(itemA) === posicao(itemB)) {
        candidatas.push(candidataSimples(restricao({ tipo: "T1", itemA, itemB }), tema));
        candidatas.push(candidataSimples(restricao({ tipo: "T8", itemA, itemB }), tema));
      } else {
        candidatas.push(candidataSimples(restricao({ tipo: "T2", itemA, itemB }), tema));
      }
    }
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = 0; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (a === b || posicao(itemA) >= posicao(itemB)) continue;
      candidatas.push(candidataSimples(restricao({ tipo: "T4", itemA, itemB }), tema));
      candidatas.push(candidataSimples(restricao({ tipo: "T11", itemA, itemB }), tema));
      if (posicao(itemB) - posicao(itemA) === 1) {
        candidatas.push(candidataSimples(restricao({ tipo: "T6", itemA, itemB }), tema));
      }
    }
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = a + 1; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (Math.abs(posicao(itemA) - posicao(itemB)) !== 1) continue;
      candidatas.push(candidataSimples(restricao({ tipo: "T5", itemA, itemB }), tema));
    }
  }

  for (const itemA of itens) {
    for (const itemC of itens) {
      for (const itemB of itens) {
        if (
          new Set([chaveItem(itemA), chaveItem(itemC), chaveItem(itemB)]).size < 3
          || !(posicao(itemA) < posicao(itemC) && posicao(itemC) < posicao(itemB))
        ) continue;
        candidatas.push(candidataSimples(restricao({ tipo: "T7", itemA, itemC, itemB }), tema));
      }
    }
  }

  for (const itemA of itens) {
    const alvos = itens.filter((item) =>
      item.categoria !== itemA.categoria && posicao(item) !== posicao(itemA)
    );
    for (let b = 0; b < alvos.length; b += 1) {
      for (let c = b + 1; c < alvos.length; c += 1) {
        const primeira = restricao({ tipo: "T2", itemA, itemB: alvos[b] });
        const segunda = restricao({ tipo: "T2", itemA, itemB: alvos[c] });
        candidatas.push({
          texto: textoDaPistaComposta(primeira, segunda, tema.gramatica),
          restricoes: [primeira, segunda],
          peso: 18,
        });
      }
    }
  }

  return candidatas;
}

function materializarPistas(candidatas: readonly Candidata[], prefixo: string): Pista[] {
  return candidatas.map((candidata, indice) => {
    const id = `${prefixo}-${indice + 1}`;
    return {
      id,
      texto: verificarTextoPista(candidata.texto),
      restricoes: candidata.restricoes.map((restricao, indiceRestricao) => ({
        ...restricao,
        id: `${id}#${indiceRestricao + 1}`,
      })),
    };
  });
}

function metadataInicial(): PuzzleMetadata {
  return {
    complexity: 2,
    inferenceDepthDistribution: {},
    skillWeights: {},
    dominantOperations: [],
    clueTypeDistribution: {},
    expectedDifficulty: 2,
    validatedUniqueSolution: true,
  };
}

function completarMetadata(puzzle: Puzzle): PuzzleMetadata {
  const relatorio = avaliarEstrutura(puzzle);
  const distribuicao: Partial<Record<TipoPista, number>> = {};
  for (const pista of puzzle.pistas) {
    for (const restricao of pista.restricoes) {
      distribuicao[restricao.tipo] = (distribuicao[restricao.tipo] ?? 0) + 1;
    }
  }
  const dominantes = (Object.entries(distribuicao) as [TipoPista, number][])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tipo]) => tipo);
  return {
    complexity: puzzle.pistas.length,
    inferenceDepthDistribution: relatorio.profundidadeInferencial.distribuicao,
    skillWeights: {
      exclusion: distribuicao.T2 ?? 0,
      relativeOrder: (distribuicao.T4 ?? 0) + (distribuicao.T7 ?? 0) + (distribuicao.T11 ?? 0),
      adjacency: (distribuicao.T5 ?? 0) + (distribuicao.T6 ?? 0),
      crossCategory: relatorio.restricoesCrossCategory,
      integrationDepth: relatorio.profundidadeInferencial.maxima,
      uncertaintyTolerance: 2,
    },
    dominantOperations: dominantes,
    clueTypeDistribution: distribuicao,
    expectedDifficulty: 2,
    validatedUniqueSolution: true,
  };
}

function gerarTentativa(tema: TemaGrade, seed: string): Puzzle {
  const aleatorio = criarAleatorio(seed);
  const { categorias, solucao } = montarCategoriasESolucao(tema, aleatorio);
  const base: Puzzle = {
    id: tema.id,
    titulo: tema.titulo,
    contexto: tema.contexto,
    nivel: 2,
    posicoes: 4,
    rotulosPosicao: [...tema.rotulosPosicao],
    categorias,
    pistas: [],
    solucao,
    metadata: metadataInicial(),
  };
  const ordenadas = criarPool(tema, base)
    .map((candidata) => ({
      candidata,
      prioridade: -Math.log(Math.max(aleatorio(), Number.EPSILON)) / candidata.peso,
    }))
    .sort((a, b) => a.prioridade - b.prioridade)
    .map(({ candidata }) => candidata);

  let selecionadas: Candidata[] = [];
  for (const candidata of ordenadas) {
    selecionadas.push(candidata);
    base.pistas = materializarPistas(selecionadas, tema.id);
    if (contarSolucoes(base, 2) === 1) break;
  }
  if (contarSolucoes(base, 2) !== 1) {
    throw new Error(`O pool do tema ${tema.id} não produziu solução única.`);
  }

  for (const candidata of embaralhar(selecionadas, aleatorio)) {
    const semCandidata = selecionadas.filter((item) => item !== candidata);
    base.pistas = materializarPistas(semCandidata, tema.id);
    if (contarSolucoes(base, 2) === 1) selecionadas = semCandidata;
  }
  base.pistas = materializarPistas(selecionadas, tema.id);
  base.metadata = completarMetadata(base);
  return base;
}

export function gerarPuzzles(
  temas: readonly TemaGrade[],
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  if (!Number.isInteger(limiteTentativas) || limiteTentativas < 1) {
    throw new Error("O limite de tentativas deve ser um inteiro positivo.");
  }
  const seedNormalizada = String(seed);
  const puzzles: Puzzle[] = [];
  const tentativas: Record<string, number> = {};

  for (let indiceTema = 0; indiceTema < temas.length; indiceTema += 1) {
    const tema = temas[indiceTema];
    let ultimoMotivo = "nenhuma tentativa executada";
    let encontrado: Puzzle | null = null;
    for (let tentativa = 1; tentativa <= limiteTentativas; tentativa += 1) {
      let puzzle: Puzzle;
      try {
        puzzle = gerarTentativa(tema, `${seedNormalizada}:${tema.id}:${tentativa}`);
      } catch (erro) {
        ultimoMotivo = erro instanceof Error ? erro.message : String(erro);
        continue;
      }
      const relatorio = avaliarEstrutura(puzzle);
      const exigeComposta = indiceTema === 0;
      const temComposta = puzzle.pistas.some((pista) => pista.restricoes.length >= 2);
      if (relatorio.aprovado && (!exigeComposta || temComposta)) {
        encontrado = puzzle;
        tentativas[tema.id] = tentativa;
        break;
      }
      ultimoMotivo = [
        ...relatorio.motivos,
        ...(exigeComposta && !temComposta ? ["o primeiro tema precisa conter uma pista composta"] : []),
      ].join("; ");
    }
    if (encontrado === null) {
      throw new Error(
        `Falha ao gerar ${tema.id} após ${limiteTentativas} tentativas: ${ultimoMotivo}.`
      );
    }
    puzzles.push(encontrado);
  }
  return { seed: seedNormalizada, puzzles, tentativas };
}

export function gerarProblemasNivel2(
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  return gerarPuzzles(TEMAS_NIVEL_2, seed, limiteTentativas);
}

/** Serialização pura: o resultado é dado TypeScript legível e não executa geração em produção. */
export function emitirCodigoTypeScript(puzzles: readonly Puzzle[]): string {
  return [
    'import type { Puzzle } from "../tipos";',
    "",
    "/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */",
    `export const PROBLEMAS_NIVEL_2: Puzzle[] = ${JSON.stringify(puzzles, null, 2)};`,
    "",
  ].join("\n");
}
