/** Mínimo de trocas para levar `perm` à identidade. perm[i] = índice correto do cartão na posição i. */
export function minimoDeTrocas(perm: number[]): number {
  const visitado = Array.from({ length: perm.length }, () => false);
  let ciclos = 0;

  for (let inicio = 0; inicio < perm.length; inicio++) {
    if (visitado[inicio]) continue;
    ciclos++;
    let atual = inicio;
    while (!visitado[atual]) {
      visitado[atual] = true;
      atual = perm[atual];
    }
  }

  return perm.length - ciclos;
}

function mesmaPermutacao(a: number[], b?: number[]): boolean {
  return !!b && a.length === b.length && a.every((valor, i) => valor === b[i]);
}

function fisherYates(n: number, rng: () => number): number[] {
  const resultado = Array.from({ length: n }, (_, i) => i);
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

/** Embaralha 0..n-1 garantindo minimoDeTrocas >= 2 e diferença da permutação anterior.
 *  `rng` injetável para o teste ser determinístico (default: Math.random). */
export function embaralharCenas(n: number, anterior?: number[], rng: () => number = Math.random): number[] {
  let ultimaSorteada = Array.from({ length: n }, (_, i) => i);
  let ultimaComMinimo: number[] | undefined;

  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const candidata = fisherYates(n, rng);
    ultimaSorteada = candidata;
    if (minimoDeTrocas(candidata) < 2) continue;

    ultimaComMinimo = candidata;
    if (!mesmaPermutacao(candidata, anterior)) return candidata;
  }

  return ultimaComMinimo ?? ultimaSorteada;
}
