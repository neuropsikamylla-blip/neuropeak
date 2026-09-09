export interface DosagemBloco {
  targetDurationSec: number;
  maxDurationSec: number;
}

/** Fixa, ou calculada a partir da dificuldade — decisão 2 dela. */
export type ConfiguracaoDosagem = DosagemBloco | ((difficulty: number) => DosagemBloco);

export function dosagemProblemaEstruturado(targetDurationSec: number): DosagemBloco {
  return { targetDurationSec, maxDurationSec: targetDurationSec + 120 };
}

export function dosagemPorTentativas(targetDurationSec: number): DosagemBloco {
  return { targetDurationSec, maxDurationSec: targetDurationSec + 60 };
}

export const DOSAGEM_PADRAO: DosagemBloco = dosagemProblemaEstruturado(480);

export function stroopDosage(difficulty: number): DosagemBloco {
  const targetDurationSec = difficulty <= 2 ? 240 : difficulty <= 5 ? 300 : difficulty <= 8 ? 360 : 420;
  return dosagemPorTentativas(targetDurationSec);
}

const DOSAGENS: Record<string, ConfiguracaoDosagem> = {
  "tempo-reacao": dosagemPorTentativas(300), // tarefa curta deliberada (já era 5 min)
  semaforo: dosagemPorTentativas(300), // tarefa curta deliberada (já era 5 min)
  "informacao-em-foco": dosagemPorTentativas(360), // dose curta deliberada (já era 6 min)
  "stroop-task": stroopDosage, // o par alvo/teto varia com a dificuldade
};

export function resolveExerciseDosage(exerciseId: string, difficulty = 1): DosagemBloco {
  const configured = DOSAGENS[exerciseId] ?? DOSAGEM_PADRAO;
  // Decisão explícita de 09/set/2026: Torre e Estacionamento deixaram de usar 11 min;
  // ambos caem no padrão 480/600. Não restaurar a duração anterior aqui.
  return typeof configured === "function" ? configured(difficulty) : configured;
}
