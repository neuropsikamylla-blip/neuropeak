export const TUTORIAL_VERSIONS: Readonly<Record<string, number>> = Object.freeze({
  "span-numerico": 1,
  "stroop-task": 1,
  "focus-agents": 2,
  "span-numerico-inverso": 1,
  "matriz-espacial": 1,
  "matriz-espacial-inversa": 1,
  "jogo-memoria": 1,
  "trilha-visual": 1,
  "antes-depois": 1,
  "informacao-em-foco": 2,
  mot: 1,
  "dual-task": 1,
  "tempo-reacao": 1,
  "certo-ou-errado": 1,
  semaforo: 1,
  "corrida-tempo": 1,
  "torre-hanoi": 1,
  labirinto: 1,
  "ordem-historia": 1,
  "compra-multifuncional": 1,
  "task-switching": 1,
  "deductive-grid": 1,
  "letras-sequencia": 1,
  "sequencia-itens": 1,
  "padroes-rotacao": 1,
  "lista-distracao": 1,
  "restaurante-ordem": 1,
  "desafio-supermercado": 1,
  "cubo-corsi": 1,
  vigilancia: 2,
  "identificacao-simbolos": 1,
  "estacionamento-logico": 1,
  "investigadores-sociais": 1,
});

export function tutorialVersionFor(exerciseId: string): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(TUTORIAL_VERSIONS, exerciseId)) {
    return undefined;
  }
  return TUTORIAL_VERSIONS[exerciseId];
}
