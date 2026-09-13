export const CELL_IDEAL = 76;
export const CELL_MIN = 34;
export const BORDER = 11;
export const CORRIDOR = 26;
/** Respiro abaixo do tabuleiro, para ele nunca encostar na dobra da tela. */
export const RESPIRO_VERTICAL = 8;

export interface EspacoDisponivel {
  largura: number;
  altura: number;
}

export interface MedidasDoTabuleiro {
  interno: number;
  total: number;
  larguraComCorredor: number;
}

/**
 * Define o tamanho físico de cada célula. O tabuleiro cresce com o grid, mas
 * os carros mantêm o tamanho de conforto enquanto houver espaço suficiente.
 */
export function tamanhoDaCelula(grid: number, espaco: EspacoDisponivel): number {
  const porLargura = (espaco.largura - BORDER * 2 - CORRIDOR) / grid;
  const porAltura = (espaco.altura - BORDER * 2) / grid;
  const maiorQueCabe = Math.floor(Math.min(porLargura, porAltura));

  return Math.min(CELL_IDEAL, Math.max(CELL_MIN, maiorQueCabe));
}

/** Medidas reais do tabuleiro, sem escalar o conjunto por transform. */
export function medidasDoTabuleiro(grid: number, cellPx: number): MedidasDoTabuleiro {
  const interno = grid * cellPx;
  const total = interno + BORDER * 2;
  return { interno, total, larguraComCorredor: total + CORRIDOR };
}

export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 18;

export type PeriodoDoDia = "dia" | "noite";

/** Período determinado a partir da hora local do dispositivo (0–23). */
export function periodoDoDia(hora: number): PeriodoDoDia {
  return hora >= DAY_START_HOUR && hora < NIGHT_START_HOUR ? "dia" : "noite";
}

export const FUNDO_POR_PERIODO: Record<PeriodoDoDia, string> = {
  dia: "/exercises/Carros/fundo-dia.webp",
  noite: "/exercises/Carros/fundo-noite.webp",
};

export const VEU_POR_PERIODO: Record<PeriodoDoDia, [string, string]> = {
  dia: ["rgba(8,10,16,0.28)", "rgba(8,10,16,0.40)"],
  noite: ["rgba(8,10,16,0.10)", "rgba(8,10,16,0.18)"],
};
