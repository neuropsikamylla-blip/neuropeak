// ─────────────────────────────────────────────────────────────────────────────
// Vigilância — dados dos ESTÍMULOS (espelha os manifestos em
// /exercises/vigilancia/{pipas,fundos}/*.json). Os papéis alvo/distrator são
// NEUTROS (A/B): quem é alvo é decidido por bloco (contrabalanceamento §7).
// ─────────────────────────────────────────────────────────────────────────────
import type { Arranjo } from "./vigilancia";

export interface Variante { id: string; arquivo: string; descricao: string }
export interface Par {
  pairId: string; nome: string; categoria: string; atributoDiferencial: string;
  dificuldadeVisual: number; permiteModoSemCor: boolean; A: Variante; B: Variante;
  /** false = fora do jogo (a Kamylla tirou por achar fácil demais); imagens ficam no repo. */
  ativo?: boolean;
}
export interface Fundo { id: string; arquivo: string; complexidade: number }

export const PARES: Par[] = [
  { pairId: "P01", nome: "Ameixa suave", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 2, permiteModoSemCor: false, ativo: false,
    A: { id: "P01_A", arquivo: "P01_A.png", descricao: "ameixa suave clara" }, B: { id: "P01_B", arquivo: "P01_B.png", descricao: "ameixa suave escura" } },
  { pairId: "P02", nome: "Azul ardósia", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 5, permiteModoSemCor: false,
    A: { id: "P02_A", arquivo: "P02_A.png", descricao: "azul ardósia claro" }, B: { id: "P02_B", arquivo: "P02_B.png", descricao: "azul ardósia escuro" } },
  { pairId: "P03", nome: "Terracota", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 3, permiteModoSemCor: false,
    A: { id: "P03_A", arquivo: "P03_A.png", descricao: "terracota claro" }, B: { id: "P03_B", arquivo: "P03_B.png", descricao: "terracota escuro" } },
  { pairId: "P04", nome: "Verde sálvia", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 1, permiteModoSemCor: false,
    A: { id: "P04_A", arquivo: "P04_A.png", descricao: "verde sálvia claro" }, B: { id: "P04_B", arquivo: "P04_B.png", descricao: "verde sálvia escuro" } },
  { pairId: "P07", nome: "Verde musgo", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 4, permiteModoSemCor: false,
    A: { id: "P07_A", arquivo: "P07_A.png", descricao: "verde musgo claro" }, B: { id: "P07_B", arquivo: "P07_B.png", descricao: "verde musgo escuro" } },
  { pairId: "P08", nome: "Vinho", categoria: "tom", atributoDiferencial: "corCorpo", dificuldadeVisual: 6, permiteModoSemCor: false,
    A: { id: "P08_A", arquivo: "P08_A.png", descricao: "vinho claro" }, B: { id: "P08_B", arquivo: "P08_B.png", descricao: "vinho escuro" } },
  { pairId: "P05", nome: "Verde — laços", categoria: "quantidade de laços", atributoDiferencial: "qtdLacos", dificuldadeVisual: 4, permiteModoSemCor: true,
    A: { id: "P05_A", arquivo: "P05_A.png", descricao: "verde com 2 laços" }, B: { id: "P05_B", arquivo: "P05_B.png", descricao: "verde com 3 laços" } },
  { pairId: "P06", nome: "Faixa diagonal", categoria: "orientação", atributoDiferencial: "orientacaoFaixa", dificuldadeVisual: 4, permiteModoSemCor: true,
    A: { id: "P06_A", arquivo: "P06_A.png", descricao: "faixa diagonal para a esquerda" }, B: { id: "P06_B", arquivo: "P06_B.png", descricao: "faixa diagonal para a direita" } },
];

export const FUNDOS: Fundo[] = [
  { id: "BG01", arquivo: "BG01.webp", complexidade: 1 },
  { id: "BG02", arquivo: "BG02.webp", complexidade: 2 },
  { id: "BG03", arquivo: "BG03.webp", complexidade: 3 },
  { id: "BG04", arquivo: "BG04.webp", complexidade: 4 },
];

// §16 Níveis visuais — 8 pipas SEMPRE; muda par (semelhança), arranjo (distância) e fundo.
export interface NivelVisual { nivel: number; pairId: string; arranjo: Arranjo; fundo: string }
export const NIVEIS: NivelVisual[] = [
  // ordem pelo ΔE Lab medido: P04 22,8 · P03 14,3 · P07 13,8 · P02 13,0 · P08 11,3.
  // Do nível 7 em diante o PAR já está no mais difícil (vinho) e quem endurece é o
  // arranjo (irregular) e o fundo — a semelhança das pipas nunca retrocede.
  // (P01 ameixa saiu em 02/ago — ela achou fácil demais)
  { nivel: 1,  pairId: "P04", arranjo: "compacto",  fundo: "BG01" },
  { nivel: 2,  pairId: "P04", arranjo: "expandido", fundo: "BG01" },
  { nivel: 3,  pairId: "P03", arranjo: "expandido", fundo: "BG02" },
  { nivel: 4,  pairId: "P07", arranjo: "expandido", fundo: "BG02" },
  { nivel: 5,  pairId: "P02", arranjo: "expandido", fundo: "BG02" },
  { nivel: 6,  pairId: "P08", arranjo: "expandido", fundo: "BG03" },
  { nivel: 7,  pairId: "P08", arranjo: "irregular", fundo: "BG03" },
  { nivel: 8,  pairId: "P08", arranjo: "irregular", fundo: "BG04" },
  { nivel: 9,  pairId: "P05", arranjo: "compacto",  fundo: "BG04" },
  { nivel: 10, pairId: "P06", arranjo: "irregular", fundo: "BG04" },
];

/** Pares realmente em uso (respeita o que ela desativou). */
export const PARES_ATIVOS = PARES.filter((p) => p.ativo !== false);

export const parById = (id: string) => PARES.find((p) => p.pairId === id) ?? PARES[0];
export const fundoById = (id: string) => FUNDOS.find((f) => f.id === id) ?? FUNDOS[0];
// Sobe a cada troca de imagem que MANTÉM o nome do arquivo (senão o navegador serve a antiga).
// v3 = 02/ago/2026: alvos de P01/P02/P03/P04 regerados + pares novos P07 (verde musgo) e P08 (vinho).
export const PIPA_V = 3;
export const imgPipa = (arquivo: string) => `/exercises/vigilancia/pipas/${arquivo}?v=${PIPA_V}`;
export const imgFundo = (arquivo: string) => `/exercises/vigilancia/fundos/${arquivo}`;
export const TODAS_IMAGENS = [
  ...PARES.flatMap((p) => [imgPipa(p.A.arquivo), imgPipa(p.B.arquivo)]),
  ...FUNDOS.map((f) => imgFundo(f.arquivo)),
];
