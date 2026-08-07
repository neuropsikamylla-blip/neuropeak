/**
 * Comparações de resposta das famílias de tutorial — funções PURAS, sem JSX.
 *
 * Vivem num `.ts` e não junto das definições `.tsx` por um motivo prático: o Vitest deste projeto
 * roda em `environment: node` com `jsx: "preserve"`, e um teste que importe `.tsx` derruba a coleta
 * do arquivo inteiro. Regra de comparação é garantia clínica — precisa ser testada executando, não
 * lendo o fonte. É o mesmo princípio que levou `completionRecordFor` para `state.ts`.
 */

/**
 * Comparação POSICIONAL — o padrão das Famílias 1 e 2.
 *
 * A resposta certa é a mesma sequência, na mesma ordem: reproduzir dígitos, letras, itens ou
 * posições exige que a ordem seja respeitada, porque é justamente ela que está sendo treinada.
 */
export function compararPosicional<T>(esperada: T[], dada: T[]): boolean {
  return esperada.every((valor, indice) => valor === dada[indice]);
}

/**
 * Comparação por CONJUNTO — Família 3, quando a resposta não tem ordem.
 *
 * O paciente seleciona itens; acerta se escolheu exatamente os certos, em qualquer ordem. Compara
 * também o tamanho, senão um subconjunto passaria como correto.
 */
export function compararConjunto<T>(esperada: T[], dada: T[]): boolean {
  return esperada.length === dada.length && esperada.every((item) => dada.includes(item));
}

/**
 * Comparação por PAR — caso particular do Jogo da Memória.
 *
 * Aqui a unidade de resposta não é "os itens certos", e sim **duas cartas que casam entre si**. Por
 * isso a resposta esperada é ignorada: o que se verifica é a relação entre as duas escolhas. É a
 * comparação menos óbvia da família, e a razão de `compararResposta` receber ambos os lados.
 */
export function compararPar<T>(
  cartas: ReadonlyArray<{ id: number; symbol: T }>,
  tamanhoDoPar: number,
) {
  return function comparar(_esperada: number[], dada: number[]): boolean {
    if (dada.length !== tamanhoDoPar) return false;
    // Clicar duas vezes na mesma carta não forma par.
    if (new Set(dada).size !== dada.length) return false;

    const escolhidas = dada.map((id) => cartas.find((carta) => carta.id === id));
    if (escolhidas.some((carta) => carta === undefined)) return false;

    const simbolos = escolhidas.map((carta) => carta!.symbol);
    return simbolos.every((simbolo) => simbolo === simbolos[0]);
  };
}

/**
 * Decide qual comparação a família usa: a informada na configuração, ou a posicional por padrão.
 *
 * O padrão preserva o comportamento das Famílias 1 e 2 — quem não declara nada continua exigindo a
 * ordem. Famílias sem ordem fornecem a sua.
 */
export function compararRespostaDaFamilia<T>(
  config: { compararResposta?: (esperada: T[], dada: T[]) => boolean },
  esperada: T[],
  dada: T[],
): boolean {
  return (config.compararResposta ?? compararPosicional)(esperada, dada);
}
