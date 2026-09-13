export const CELL_IDEAL = 76;
export const CELL_MIN = 34;
export const BORDER = 11;
export const CORRIDOR = 26;
/**
 * Quanto o tabuleiro deixa o chão do cenário aparecer.
 *
 * Escolha dela em 13/set/2026 (opção **C** de cinco variantes montadas com a arte dela, os carros
 * reais e a fase `n5-01`): o asfalto aparece de verdade e o tabuleiro deixa de parecer uma placa
 * apoiada sobre o chão, mas a **moldura continua delimitando** a área de jogo — e essa borda é
 * informação, não enfeite: é ela que diz até onde o carro pode ir e onde fica a saída.
 *
 * Medido antes de propor: o asfalto da arte de noite e o azul do tabuleiro têm luminância
 * praticamente igual (0,0197 contra 0,0193), então **o contraste dos carros não muda** em nenhum
 * nível de opacidade — de 1,01:1 opaco a 1,02:1 a 22%. A decisão foi estética porque a medida
 * mostrou que podia ser.
 *
 * São dois números, e mudá-los é a única coisa necessária para rever a escolha.
 */
export const OPACIDADE_TABULEIRO = {
  /** Moldura externa e corredor de saída — o que delimita a área. */
  moldura: 0.5,
  /** Piso interno, onde os carros andam. */
  interior: 0.42,
} as const;

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

/**
 * Véu escuro sobre o cenário, para o tabuleiro se destacar do fundo.
 *
 * Leve de propósito: a arte dela já vem tratada — a de dia é clara e quente, a de noite já é escura
 * e tem os postes acesos. O véu antigo (0,28→0,40) foi calibrado contra uma FOTO que na prática nunca
 * apareceu na tela (ver `fundoDoPalco`), e sobre a arte dela apagaria o dourado do fim de tarde.
 * É uma linha para ajustar quando ela vir com os olhos.
 */
export const VEU_POR_PERIODO: Record<PeriodoDoDia, [string, string]> = {
  dia: ["rgba(8,10,16,0.12)", "rgba(8,10,16,0.20)"],
  noite: ["rgba(8,10,16,0.05)", "rgba(8,10,16,0.10)"],
};

/** Cor sob o cenário, enquanto a imagem não carrega. */
export const COR_DE_BASE = "#23262e";

/**
 * A string do atalho `background` do palco — e a razão de existir uma função para isto.
 *
 * ⚠️ REGRESSÃO REAL, corrigida em 13/set/2026: de 27/ago (v2.94.0, a migração ao palco) até aqui, o
 * cenário do Estacionamento **não apareceu na tela**. O valor era
 * `#23262e linear-gradient(…), url(…) center / cover`, com a **cor na PRIMEIRA camada** — e no atalho
 * `background` a cor só é aceita na ÚLTIMA. Declaração inválida é descartada INTEIRA pelo navegador,
 * então não vinha nem a foto, nem o véu, nem sequer o cinza: aparecia o fundo do app por baixo.
 * Ninguém viu porque ninguém abriu a tela com os olhos desde a migração. Em 25/jun o mesmo desenho
 * funcionava porque usava `backgroundImage`, que não aceita cor e por isso não tinha como errar.
 *
 * A ordem aqui — imagens primeiro, cor por último — é o que torna a declaração válida, e
 * `parking-layout.test.ts` prova isso pela estrutura, para a regressão não voltar em silêncio.
 */
export function fundoDoPalco(periodo: PeriodoDoDia): string {
  const [inicio, fim] = VEU_POR_PERIODO[periodo];
  return `linear-gradient(${inicio}, ${fim}), `
    + `url(${FUNDO_POR_PERIODO[periodo]}) center / cover no-repeat ${COR_DE_BASE}`;
}
