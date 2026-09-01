/**
 * Formato usado pelo componente: exatamente três pilhas, da base para o topo.
 * Assim, `[4, 2]` representa o disco 4 na base e o disco 2 no topo.
 */
export type Estado = [number[], number[], number[]];

export interface Movimento {
  disco: number;
  de: number;
  para: number;
}

/**
 * Formato compacto usado pela busca: o índice é `disco - 1` e o valor é a
 * haste (0, 1 ou 2) em que o disco está.
 */
export type Posicoes = readonly number[];

const TOTAL_HASTES = 3;

/** Retorna `null` quando a configuração é válida, ou uma descrição do erro. */
export function validarConfiguracao(
  estado: readonly (readonly number[])[],
  nDiscos: number
): string | null {
  if (!Number.isInteger(nDiscos) || nDiscos < 1) {
    return `A quantidade de discos deve ser um inteiro positivo; recebido: ${nDiscos}.`;
  }

  if (!Array.isArray(estado) || estado.length !== TOTAL_HASTES) {
    return `A configuração deve ter exatamente 3 hastes; recebidas: ${estado?.length ?? 0}.`;
  }

  const vistos = new Set<number>();

  for (let haste = 0; haste < estado.length; haste += 1) {
    const pilha = estado[haste];
    if (!Array.isArray(pilha)) {
      return `A haste ${haste} não é uma pilha válida.`;
    }

    for (let indice = 0; indice < pilha.length; indice += 1) {
      const disco = pilha[indice];
      if (!Number.isInteger(disco) || disco < 1 || disco > nDiscos) {
        return `Disco inválido na haste ${haste}: ${disco}; esperado um inteiro entre 1 e ${nDiscos}.`;
      }

      if (indice > 0 && pilha[indice - 1] <= disco) {
        return `Ordem inválida na haste ${haste}: o disco ${pilha[indice - 1]} está sob o disco ${disco}.`;
      }

      if (vistos.has(disco)) {
        return `O disco ${disco} aparece mais de uma vez.`;
      }
      vistos.add(disco);
    }
  }

  const ausentes: number[] = [];
  for (let disco = 1; disco <= nDiscos; disco += 1) {
    if (!vistos.has(disco)) ausentes.push(disco);
  }

  if (ausentes.length > 0) {
    return `Discos ausentes: ${ausentes.join(", ")}.`;
  }

  return null;
}

function validarParaOperacao(estado: readonly (readonly number[])[]): void {
  const nDiscos = estado.reduce((total, pilha) => total + (Array.isArray(pilha) ? pilha.length : 0), 0);
  const erro = validarConfiguracao(estado, nDiscos);
  if (erro !== null) throw new Error(`Configuração inválida: ${erro}`);
}

/**
 * Lista movimentos em ordem estável: haste de origem crescente e, dentro
 * dela, haste de destino crescente.
 */
export function movimentosPossiveis(estado: readonly (readonly number[])[]): Movimento[] {
  validarParaOperacao(estado);
  const movimentos: Movimento[] = [];

  for (let de = 0; de < TOTAL_HASTES; de += 1) {
    const origem = estado[de];
    if (origem.length === 0) continue;
    const disco = origem[origem.length - 1];

    for (let para = 0; para < TOTAL_HASTES; para += 1) {
      if (de === para) continue;
      const destino = estado[para];
      const topoDestino = destino[destino.length - 1];
      if (topoDestino === undefined || topoDestino > disco) {
        movimentos.push({ disco, de, para });
      }
    }
  }

  return movimentos;
}

/** Aplica um movimento legal e devolve uma cópia, sem alterar o estado dado. */
export function aplicarMovimento(
  estado: readonly (readonly number[])[],
  de: number,
  para: number
): Estado {
  validarParaOperacao(estado);

  if (!Number.isInteger(de) || de < 0 || de >= TOTAL_HASTES) {
    throw new Error(`Haste de origem inválida: ${de}.`);
  }
  if (!Number.isInteger(para) || para < 0 || para >= TOTAL_HASTES) {
    throw new Error(`Haste de destino inválida: ${para}.`);
  }
  if (de === para) {
    throw new Error("As hastes de origem e destino devem ser diferentes.");
  }

  const disco = estado[de][estado[de].length - 1];
  if (disco === undefined) {
    throw new Error(`A haste de origem ${de} está vazia.`);
  }

  const topoDestino = estado[para][estado[para].length - 1];
  if (topoDestino !== undefined && topoDestino < disco) {
    throw new Error(`Movimento inválido: o disco ${disco} não pode ficar sobre o disco ${topoDestino}.`);
  }

  const copia: Estado = [
    [...estado[0]],
    [...estado[1]],
    [...estado[2]],
  ];
  copia[de].pop();
  copia[para].push(disco);
  return copia;
}

/** Converte as três pilhas do componente para o vetor compacto da BFS. */
export function estadoParaPosicoes(
  estado: readonly (readonly number[])[],
  nDiscos: number
): number[] {
  const erro = validarConfiguracao(estado, nDiscos);
  if (erro !== null) throw new Error(`Configuração inválida: ${erro}`);

  const posicoes = Array<number>(nDiscos);
  for (let haste = 0; haste < TOTAL_HASTES; haste += 1) {
    for (const disco of estado[haste]) posicoes[disco - 1] = haste;
  }
  return posicoes;
}

/** Converte o vetor compacto da BFS para as pilhas consumidas pelo componente. */
export function posicoesParaEstado(posicoes: Posicoes): Estado {
  if (posicoes.length < 1) {
    throw new Error("O vetor de posições deve conter ao menos um disco.");
  }

  for (let indice = 0; indice < posicoes.length; indice += 1) {
    const haste = posicoes[indice];
    if (!Number.isInteger(haste) || haste < 0 || haste >= TOTAL_HASTES) {
      throw new Error(`Haste inválida para o disco ${indice + 1}: ${haste}.`);
    }
  }

  const estado: Estado = [[], [], []];
  for (let disco = posicoes.length; disco >= 1; disco -= 1) {
    estado[posicoes[disco - 1]].push(disco);
  }
  return estado;
}
