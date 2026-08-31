export interface TorreHanoiPuzzle {
  moves: number;
  optimal: number;
  restarts: number;
}

export interface TorreHanoiJudgement {
  optimal: boolean;
}

/**
 * Julga UM puzzle da Torre de Hanói.
 *
 * Reiniciar zera os movimentos do tabuleiro, mas não torna uma tentativa ótima:
 * o reinício é registrado como monitoramento e impede a progressão de discos.
 */
export function julgarPuzzle({ moves, optimal, restarts }: TorreHanoiPuzzle): TorreHanoiJudgement {
  return { optimal: moves <= optimal && restarts === 0 };
}
