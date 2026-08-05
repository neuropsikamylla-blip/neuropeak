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
