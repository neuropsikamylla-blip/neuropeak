/**
 * Cores dos discos da Torre — FONTE ÚNICA.
 *
 * Existe por um defeito real: até 12/set/2026 o `TorreHanoi.tsx` declarava a paleta localmente e a
 * miniatura do OBJETIVO **não a usava** — pintava os oito discos num azul único (`#93C5FD`). O
 * objetivo era a única peça da tela sem a cor dos discos, justamente a peça que o paciente precisa
 * casar com o tabuleiro. Enquanto a paleta viver em dois lugares, essa divergência pode voltar sem
 * ninguém notar; por isso quem desenha disco importa daqui.
 */

/** Cor de base do disco (a mais escura do gradiente). Índice 0 = disco 1, o mais estreito. */
export const DISCO_CORES = [
  "#F43F5E", // 1 rosa/vermelho
  "#FB923C", // 2 laranja
  "#FACC15", // 3 amarelo
  "#34D399", // 4 verde
  "#22D3EE", // 5 turquesa
  "#3B82F6", // 6 azul
  "#6366F1", // 7 índigo
  "#A855F7", // 8 violeta
] as const;

/** Tom claro do topo do gradiente — o volume do disco. */
export const DISCO_CORES_CLARAS = [
  "#FB7185", "#FDBA74", "#FDE047", "#6EE7B7",
  "#67E8F9", "#93C5FD", "#A5B4FC", "#D8B4FE",
] as const;

/**
 * Contorno de 1 px, na PRÓPRIA família de cor do disco.
 *
 * Necessário porque na miniatura do objetivo o disco tem 4–5 px de altura contra um fundo quase
 * branco: o amarelo `#FACC15` tem 1,46:1 de contraste contra `#F8FAFC` e simplesmente desaparece.
 *
 * Calibração, em **LCh** (CIELAB polar): o **matiz h fica travado** — é ele que nomeia a cor — e o
 * L\* desce só até o mínimo que alcança **3:1** contra `FUNDO_CAIXA_OBJETIVO`, o piso de contraste
 * de objeto gráfico. Quatro cores (rosa, azul, índigo, violeta) já passam sozinhas e aqui repetem a
 * própria cor: contorno invisível, de propósito.
 *
 * ⚠️ O croma **cede o que o gamut do sRGB obriga**, e isso é medido, não escolhido: escurecer um
 * amarelo saturado não tem para onde ir sem dessaturar. Uma primeira calibração andou só em L\* com
 * a\*b\* fixos e **estourou o gamut** — o clamp do sRGB girava o matiz do turquesa em 4,6° e
 * comprimia o croma do amarelo em 22% pelas costas. Em LCh o giro de matiz máximo é **0,29°** e a
 * perda de croma fica explícita: ΔL\* de 0 / −11 / −24 / −16 / −18 / 0 / 0 / 0 e ΔC\* de
 * 0 / 0 / −18,2 / −5,8 / −7,0 / 0 / 0 / 0.
 *
 * `discos.test.ts` **recalcula** contraste, matiz e croma a partir destes valores — não confere
 * hexadecimal decorado. Trocar uma cor de disco sem recalibrar o contorno quebra a suíte.
 */
export const DISCO_CONTORNOS = [
  "#F43F5E", "#D8751E", "#AD8C01", "#01A473",
  "#069FB4", "#3B82F6", "#6366F1", "#A855F7",
] as const;

/** Fundo da caixa do OBJETIVO (abertura e canto da execução) — o mais escuro dos dois fundos em que
 *  a miniatura aparece, e por isso o pior caso na calibração do contorno. */
export const FUNDO_CAIXA_OBJETIVO = "#F8FAFC";

/** Fallback dos três getters quando o número do disco sai da faixa 1..8 — cinza neutro, nunca uma
 *  das cores da paleta, para que um índice errado apareça como erro em vez de virar outro disco. */
const NEUTRO = "#94A3B8";

function indice(disco: number): number | null {
  const i = disco - 1;
  return Number.isInteger(i) && i >= 0 && i < DISCO_CORES.length ? i : null;
}

/** Cor de base do disco. */
export function corDoDisco(disco: number): string {
  const i = indice(disco);
  return i === null ? NEUTRO : DISCO_CORES[i];
}

/** Gradiente do disco — idêntico em toda parte: claro no topo, base embaixo. */
export function gradienteDoDisco(disco: number): string {
  const i = indice(disco);
  if (i === null) return NEUTRO;
  return `linear-gradient(180deg, ${DISCO_CORES_CLARAS[i]}, ${DISCO_CORES[i]})`;
}

/** Contorno de 1 px do disco (ver `DISCO_CONTORNOS`). */
export function contornoDoDisco(disco: number): string {
  const i = indice(disco);
  return i === null ? NEUTRO : DISCO_CONTORNOS[i];
}

/**
 * Largura do disco, interpolada linearmente entre a `minima` (disco 1) e a `maxima` (disco N).
 *
 * Uma fórmula só para qualquer escala: quem chama decide o par mínimo/máximo da sua tela. Com um
 * disco só devolve a máxima (não há faixa a interpolar).
 */
export function larguraDoDisco(
  disco: number,
  totalDeDiscos: number,
  minima: number,
  maxima: number,
): number {
  if (totalDeDiscos <= 1) return maxima;
  const t = (disco - 1) / (totalDeDiscos - 1);
  return minima + Math.min(1, Math.max(0, t)) * (maxima - minima);
}
