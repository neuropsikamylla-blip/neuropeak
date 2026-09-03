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

interface PistaBase {
  id: string;
  tipo: TipoPista;
  texto: string;
}

export interface PistaT1 extends PistaBase {
  tipo: "T1";
  itemA: Item;
  itemB: Item;
}

export interface PistaT2 extends PistaBase {
  tipo: "T2";
  itemA: Item;
  itemB: Item;
}

export interface PistaT3 extends PistaBase {
  tipo: "T3";
  item: Item;
  /** Posição apresentada ao paciente, portanto 1-based. */
  posicao: number;
}

export interface PistaT4 extends PistaBase {
  tipo: "T4";
  itemA: Item;
  itemB: Item;
}

export interface PistaT5 extends PistaBase {
  tipo: "T5";
  itemA: Item;
  itemB: Item;
}

export interface PistaT6 extends PistaBase {
  tipo: "T6";
  itemA: Item;
  itemB: Item;
}

export interface PistaT7 extends PistaBase {
  tipo: "T7";
  /** A semântica é, nesta ordem, pos(A) < pos(C) < pos(B). */
  itemA: Item;
  itemC: Item;
  itemB: Item;
}

export interface PistaT8 extends PistaBase {
  tipo: "T8";
  itemA: Item;
  itemB: Item;
}

export interface PistaT9 extends PistaBase {
  tipo: "T9";
  itemA: Item;
  itemB: Item;
  itemC: Item;
  itemD: Item;
}

export interface PistaT10 extends PistaBase {
  tipo: "T10";
  /** Primeira associação do XOR: A ocupa a mesma posição que B. */
  itemA: Item;
  itemB: Item;
  /** Segunda associação do XOR: C ocupa a mesma posição que D. */
  itemC: Item;
  itemD: Item;
}

export interface PistaT11 extends PistaBase {
  tipo: "T11";
  itemA: Item;
  itemB: Item;
}

export type Pista =
  | PistaT1
  | PistaT2
  | PistaT3
  | PistaT4
  | PistaT5
  | PistaT6
  | PistaT7
  | PistaT8
  | PistaT9
  | PistaT10
  | PistaT11;

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
