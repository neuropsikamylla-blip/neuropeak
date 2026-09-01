import {
  estadoParaPosicoes,
  movimentosPossiveis,
  posicoesParaEstado,
  validarConfiguracao,
  type Estado,
  type Movimento,
} from "./estado";

export interface ResultadoMenorCaminho {
  minimo: number;
  caminho: Movimento[];
}

interface PassoAnterior {
  chaveAnterior: string;
  movimento: Movimento;
}

function chave(posicoes: readonly number[]): string {
  return posicoes.join("");
}

function reconstruirCaminho(
  inicio: string,
  fim: string,
  anteriores: ReadonlyMap<string, PassoAnterior>
): Movimento[] | null {
  const inverso: Movimento[] = [];
  let atual = fim;

  while (atual !== inicio) {
    const passo = anteriores.get(atual);
    if (passo === undefined) return null;
    inverso.push(passo.movimento);
    atual = passo.chaveAnterior;
  }

  return inverso.reverse();
}

/**
 * Busca em largura exata no grafo dos `3^n` estados. A ordem fixa dos
 * movimentos (`de`, depois `para`) torna também determinístico o caminho
 * escolhido quando há mais de uma solução ótima.
 */
export function menorCaminho(
  inicial: Estado,
  alvo: Estado,
  nDiscos: number
): ResultadoMenorCaminho | null {
  const erroInicial = validarConfiguracao(inicial, nDiscos);
  if (erroInicial !== null) {
    throw new Error(`Configuração inicial inválida: ${erroInicial}`);
  }

  const erroAlvo = validarConfiguracao(alvo, nDiscos);
  if (erroAlvo !== null) {
    throw new Error(`Configuração alvo inválida: ${erroAlvo}`);
  }

  const posicoesIniciais = estadoParaPosicoes(inicial, nDiscos);
  const posicoesAlvo = estadoParaPosicoes(alvo, nDiscos);
  const chaveInicial = chave(posicoesIniciais);
  const chaveAlvo = chave(posicoesAlvo);

  if (chaveInicial === chaveAlvo) return { minimo: 0, caminho: [] };

  const fila: number[][] = [posicoesIniciais];
  let inicioFila = 0;
  const visitados = new Set<string>([chaveInicial]);
  const anteriores = new Map<string, PassoAnterior>();

  while (inicioFila < fila.length) {
    const posicoesAtuais = fila[inicioFila];
    inicioFila += 1;
    const chaveAtual = chave(posicoesAtuais);
    const estadoAtual = posicoesParaEstado(posicoesAtuais);
    const movimentos = movimentosPossiveis(estadoAtual).sort(
      (a, b) => a.de - b.de || a.para - b.para
    );

    for (const movimento of movimentos) {
      const proximasPosicoes = [...posicoesAtuais];
      proximasPosicoes[movimento.disco - 1] = movimento.para;
      const proximaChave = chave(proximasPosicoes);
      if (visitados.has(proximaChave)) continue;

      visitados.add(proximaChave);
      anteriores.set(proximaChave, {
        chaveAnterior: chaveAtual,
        movimento,
      });

      if (proximaChave === chaveAlvo) {
        const caminho = reconstruirCaminho(chaveInicial, chaveAlvo, anteriores);
        return caminho === null ? null : { minimo: caminho.length, caminho };
      }

      fila.push(proximasPosicoes);
    }
  }

  return null;
}
