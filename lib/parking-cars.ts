// Carros top-view (PNG transparente) do Estacionamento Lógico.
// Gerados pela Kamylla e recortados (fundo removido) — ver public/exercises/Carros.
// Atribuição: o carro-alvo é sempre o vermelho; os demais saem de pools por
// comprimento (curtos = 2 células, longos = 3 células) de forma determinística
// por nível — varia entre níveis, sem repetir dentro do mesmo nível.

const BASE = "/exercises/Carros";

/** Carro-alvo (vermelho, comprimento 2) — o que precisa sair pela saída. */
export const TARGET_CAR = `${BASE}/car-34.png`;

/** Carros longos (vans, food trucks, ambulância, polícia) — comprimento 3. */
const LONG = ["car-07", "car-15", "car-16", "car-17", "car-18", "car-19"]
  .map((n) => `${BASE}/${n}.png`);

/** Sedans/SUVs — comprimento 2. */
const SHORT = [
  "car-01", "car-02", "car-03", "car-04", "car-05", "car-06", "car-08", "car-09",
  "car-10", "car-11", "car-12", "car-13", "car-14", "car-20", "car-21", "car-22",
  "car-23", "car-24", "car-25", "car-26", "car-27", "car-28", "car-29", "car-30",
  "car-31", "car-32", "car-33", "car-35", "car-36", "car-37", "car-38",
].map((n) => `${BASE}/${n}.png`);

/**
 * Atribui uma imagem a cada carro do nível. Determinístico (mesma entrada →
 * mesma saída), variado entre níveis e sem repetição dentro do nível.
 */
export function assignCarImages(
  levelId: number,
  cars: { id: string; len: number }[],
): Record<string, string> {
  const res: Record<string, string> = {};
  let li = levelId % LONG.length;
  let si = (levelId * 3) % SHORT.length;
  for (const c of cars) {
    if (c.id === "target") { res[c.id] = TARGET_CAR; continue; }
    if (c.len >= 3) { res[c.id] = LONG[li % LONG.length]; li++; }
    else { res[c.id] = SHORT[si % SHORT.length]; si++; }
  }
  return res;
}
