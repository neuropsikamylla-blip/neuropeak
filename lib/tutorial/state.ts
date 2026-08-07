export interface TutorialState {
  completedAt: Date | null;
  completedVersion: number | null;
}

export function tutorialRequired(
  state: TutorialState,
  requiredVersion: number,
): boolean {
  if (state.completedAt === null || state.completedVersion === null) return true;
  return state.completedVersion < requiredVersion;
}

/** O que deve ser gravado ao encerrar o tutorial. `null` significa: não gravar nada. */
export interface TutorialCompletionRecord {
  tutorialVersion: number;
  tutorialSource: "PATIENT";
}

/**
 * Regra 8 da T1, em forma testável: só a PRIMEIRA conclusão registra.
 *
 * Rever o tutorial é consulta, não conclusão — e por isso não pode tocar em `tutorialCompletedAt`,
 * `tutorialVersion` nem `tutorialSource`. Devolver `null` na revisão é o que garante isso na
 * origem: sem registro, não há requisição, e sem requisição não há escrita.
 *
 * Esta função existe separada do componente de propósito. A decisão embutida num `if` dentro de
 * um `.tsx` não é testável neste projeto (Vitest roda em `environment: node` e não importa JSX),
 * e uma garantia clínica que não se testa é uma garantia que se perde na próxima edição.
 */
export function completionRecordFor(
  isReview: boolean,
  requiredVersion: number,
): TutorialCompletionRecord | null {
  if (isReview) return null;
  return { tutorialVersion: requiredVersion, tutorialSource: "PATIENT" };
}

export interface BackfillCandidate {
  totalAttempts: number;
  tutorialCompletedAt: Date | null;
  lastAttemptAt: Date | null;
  createdAt: Date;
}

export interface BackfillResult {
  tutorialCompletedAt: Date;
  tutorialVersion: number;
  tutorialSource: "BACKFILL";
}

/** Devolve null quando a linha NÃO deve ser tocada. */
export function backfillDecision(row: BackfillCandidate): BackfillResult | null {
  if (row.totalAttempts <= 0 || row.tutorialCompletedAt !== null) return null;

  return {
    tutorialCompletedAt: row.lastAttemptAt ?? row.createdAt,
    tutorialVersion: 1,
    tutorialSource: "BACKFILL",
  };
}
