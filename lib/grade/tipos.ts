/** Uma referência inequívoca a um valor de uma categoria. */
export interface Item {
  categoria: string;
  valor: string;
}

export interface Categoria {
  id: string;
  label: string;
  valores: string[];
}

/** A posição é o índice do vetor (0-based); o conteúdo é o valor naquela posição. */
export type Solucao = Record<string, string[]>;

export const TIPOS_PISTA = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
] as const;

export type TipoPista = (typeof TIPOS_PISTA)[number];

interface RestricaoBase {
  id: string;
  tipo: TipoPista;
}

export interface RestricaoT1 extends RestricaoBase {
  tipo: "T1";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT2 extends RestricaoBase {
  tipo: "T2";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT3 extends RestricaoBase {
  tipo: "T3";
  item: Item;
  /** Posição apresentada ao paciente, portanto 1-based. */
  posicao: number;
}

export interface RestricaoT4 extends RestricaoBase {
  tipo: "T4";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT5 extends RestricaoBase {
  tipo: "T5";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT6 extends RestricaoBase {
  tipo: "T6";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT7 extends RestricaoBase {
  tipo: "T7";
  /** A semântica é, nesta ordem, pos(A) < pos(C) < pos(B). */
  itemA: Item;
  itemC: Item;
  itemB: Item;
}

export interface RestricaoT8 extends RestricaoBase {
  tipo: "T8";
  itemA: Item;
  itemB: Item;
}

export interface RestricaoT9 extends RestricaoBase {
  tipo: "T9";
  itemA: Item;
  itemB: Item;
  itemC: Item;
  itemD: Item;
}

export interface RestricaoT10 extends RestricaoBase {
  tipo: "T10";
  /** Primeira associação do XOR: A ocupa a mesma posição que B. */
  itemA: Item;
  itemB: Item;
  /** Segunda associação do XOR: C ocupa a mesma posição que D. */
  itemC: Item;
  itemD: Item;
}

export interface RestricaoT11 extends RestricaoBase {
  tipo: "T11";
  itemA: Item;
  itemB: Item;
}

/** Uma restrição atômica: o que o solver avalia. */
export type Restricao =
  | RestricaoT1
  | RestricaoT2
  | RestricaoT3
  | RestricaoT4
  | RestricaoT5
  | RestricaoT6
  | RestricaoT7
  | RestricaoT8
  | RestricaoT9
  | RestricaoT10
  | RestricaoT11;

/** O que o paciente lê: uma pista pode agrupar uma ou mais restrições. */
export interface Pista {
  id: string;
  texto: string;
  restricoes: readonly Restricao[];
}

/** Cria a forma comum de uma pista que contém somente uma restrição. */
type RestricaoSemId<T extends Restricao = Restricao> = T extends unknown ? Omit<T, "id"> : never;

export function pistaSimples(id: string, texto: string, restricao: RestricaoSemId): Pista {
  return { id, texto, restricoes: [{ ...restricao, id: `${id}#1` } as Restricao] };
}

/** Metadados de autoria previstos na seção 25 da especificação-fonte. */
export interface PuzzleMetadata {
  complexity: number;
  inferenceDepthDistribution: Record<string, number>;
  skillWeights: Record<string, number>;
  dominantOperations: TipoPista[];
  clueTypeDistribution: Partial<Record<TipoPista, number>>;
  expectedDifficulty: number;
  validatedUniqueSolution: boolean;
}

export interface Puzzle {
  id: string;
  titulo: string;
  contexto: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  posicoes: number;
  /** Rótulos das colunas. Ausente = "Posição 1", "Posição 2"… A engine só conhece 0..N-1. */
  rotulosPosicao?: readonly string[];
  categorias: Categoria[];
  pistas: Pista[];
  solucao: Solucao;
  metadata: PuzzleMetadata;
}

export type EstadoMarcacao = "impossivel" | "hipotese" | "confirmado";

export interface MarcacaoCelula {
  categoria: string;
  valor: string;
  /** Posição apresentada ao paciente, portanto 1-based. */
  posicao: number;
  estado: EstadoMarcacao;
}

/**
 * Estado esparso da grade: células ausentes estão vazias. A forma em lista
 * evita depender de delimitadores nos ids/valores e é diretamente serializável.
 */
export type MarcacaoParcial = readonly MarcacaoCelula[];

export interface TracoDerivacao {
  porCelula: Record<string, { profundidade: number; pistas: string[] }>;
  poderRestritivo: Record<string, number>;
  classificacao: Record<string, "essencial" | "util" | "redundante">;
  profundidadeMaxima: number;
  distribuicaoProfundidade: Record<string, number>;
}

/** Chave estável usada por `TracoDerivacao.porCelula`. */
export function chaveCelula(categoria: string, valor: string, posicao: number): string {
  return JSON.stringify([categoria, valor, posicao]);
}
