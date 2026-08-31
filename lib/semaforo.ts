export type SemaforoResponse = "advance" | "stop" | "none";

export interface SemaforoJudgement {
  correct: boolean;
  omitted: boolean;
}

/**
 * Julga UMA rodada do Semáforo.
 *
 * `targetIsGreen` é o sinal de seguir (verde). Vermelho e amarelo pedem PARAR.
 * `response` "none" é a ausência de resposta — que NUNCA é acerto: o exercício tem dois
 * botões, e não tocar não é uma das opções. Antes de 31/ago/2026 a omissão percorria o mesmo
 * caminho do botão PARAR e virava acerto em 55% das rodadas.
 */
export function judgeSemaforo(
  targetIsGreen: boolean,
  response: SemaforoResponse
): SemaforoJudgement {
  const omitted = response === "none";

  if (omitted) return { correct: false, omitted: true };

  return {
    correct: targetIsGreen ? response === "advance" : response === "stop",
    omitted: false,
  };
}
