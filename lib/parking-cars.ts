// Carros top-view (PNG transparente) do Estacionamento Lógico.
// Gerados pela Kamylla e recortados com rembg — ver public/exercises/Carros.
//
// Regras de atribuição:
//  • O carro-alvo é o ÚNICO vermelho da rodada (vermelho = "o que precisa sair").
//    Nenhum outro carro vermelho entra em cena, para não confundir o paciente.
//  • Preferência por carros COLORIDOS: esgota os coloridos antes de usar neutros.
//  • Carros ESPECIAIS (polícia, ambulância, pizza, sanduíches) ficam RESERVADOS
//    para os níveis avançados (futuro): obstáculos que saem antes do alvo.

const BASE = "/exercises/Carros";

/** Carro-alvo (vermelho, comprimento 2) — o único vermelho em cena. */
export const TARGET_CAR = `${BASE}/car-34.png`;

/** Especiais — RESERVADOS para níveis grandes (não usar na atribuição atual). */
export const SPECIAL_CARS = ["car-06", "car-07", "car-08", "car-09"]
  .map((n) => `${BASE}/${n}.png`);

const url = (n: string) => `${BASE}/${n}.png`;

// Sedans (comprimento 2): coloridos (amarelo/azul) primeiro, depois neutros.
const COLORED_SHORT = ["car-31", "car-35", "car-37", "car-25", "car-29", "car-33", "car-13", "car-04", "car-23"].map(url);
const NEUTRAL_SHORT = ["car-28", "car-27", "car-20", "car-24", "car-11", "car-12", "car-21", "car-03", "car-02", "car-10", "car-26", "car-32", "car-36", "car-01"].map(url);
// Vans/SUVs (comprimento 3): só um colorido disponível; resto neutro.
const COLORED_LONG = ["car-18"].map(url);
const NEUTRAL_LONG = ["car-16", "car-17", "car-15"].map(url);

function rotate(arr: string[], n: number): string[] {
  if (arr.length === 0) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/**
 * Atribui uma imagem a cada carro do nível. Determinístico, varia entre níveis
 * (rotação) e esgota os coloridos antes dos neutros. O alvo é sempre o carro
 * vermelho; os demais nunca são vermelhos.
 */
export function assignCarImages(
  levelId: number,
  cars: { id: string; len: number }[],
): Record<string, string> {
  const shortSeq = [...rotate(COLORED_SHORT, levelId), ...rotate(NEUTRAL_SHORT, levelId)];
  const longSeq = [...rotate(COLORED_LONG, levelId), ...rotate(NEUTRAL_LONG, levelId)];
  const res: Record<string, string> = {};
  let si = 0, li = 0;
  for (const c of cars) {
    if (c.id === "target") { res[c.id] = TARGET_CAR; continue; }
    if (c.len >= 3) { res[c.id] = longSeq[li % longSeq.length]; li++; }
    else { res[c.id] = shortSeq[si % shortSeq.length]; si++; }
  }
  return res;
}
