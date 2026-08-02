export const FOCUS_MODES = ["foco", "inibicao", "alternancia", "desafio"] as const;

export type FocusMode = (typeof FOCUS_MODES)[number];

const LAST_FOCUS_STEP = 12;

function clampStep(step: number): number {
  return Math.max(0, Math.min(LAST_FOCUS_STEP, Math.round(step)));
}

export function resolveFocusMode(mode: unknown): FocusMode {
  return FOCUS_MODES.includes(mode as FocusMode) ? (mode as FocusMode) : "foco";
}

/** Converte o índice interno (0–12) para o nível persistido (1–13). */
export function focusLevelFromStep(step: number): number {
  return clampStep(step) + 1;
}

/**
 * Restaura diretamente o nível persistido. A conversão por difficulty permanece
 * apenas para sessões antigas, que ainda não possuíam settings.startLevel.
 */
export function resolveFocusStartStep(startLevel: unknown, difficulty: number): number {
  if (typeof startLevel === "number" && Number.isFinite(startLevel)) {
    return clampStep(startLevel - 1);
  }
  return clampStep((difficulty - 1) * 0.4);
}

interface FocusCompletionMetadataInput {
  trials: number;
  correct: number;
  omissions: number;
  avgRT: number;
  step: number;
  mode: unknown;
}

export function buildFocusCompletionMetadata(input: FocusCompletionMetadataInput) {
  return {
    trials: input.trials,
    correct: input.correct,
    omissoes: input.omissions,
    avgRT: input.avgRT,
    level: focusLevelFromStep(input.step),
    mode: resolveFocusMode(input.mode),
  };
}
