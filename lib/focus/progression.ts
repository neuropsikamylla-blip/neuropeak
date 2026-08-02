export const FOCUS_MODES = ["foco", "inibicao", "alternancia", "desafio"] as const;

export type FocusMode = (typeof FOCUS_MODES)[number];

import type { Etapa, FuncaoCognitiva } from "./commands";

export type ContagemFuncao = { tentativas: number; acertos: number };
export type PorFuncao = Partial<Record<FuncaoCognitiva, ContagemFuncao>>;

const LAST_FOCUS_STEP = 12;
export const FOCUS_MAX_LEVEL = LAST_FOCUS_STEP + 1;

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

/** Comandos de 2 alvos: "achou 1 de 2" é desempenho diferente de "achou os dois". */
export interface MultiAlvoResumo { rodadas: number; completos: number; parciais: number }

interface FocusCompletionMetadataInput {
  trials: number;
  correct: number;
  omissions: number;
  avgRT: number;
  step: number;
  multiAlvo?: MultiAlvoResumo;
  porFuncao: PorFuncao;
}

export function buildFocusCompletionMetadata(input: FocusCompletionMetadataInput) {
  return {
    trials: input.trials,
    correct: input.correct,
    omissoes: input.omissions,
    avgRT: input.avgRT,
    level: focusLevelFromStep(input.step),
    porFuncao: input.porFuncao,
    multiAlvo: input.multiAlvo,
  };
}

// ── Escada do MODO ÚNICO (13 passos) ─────────────────────────────────────────
// Regra de desenho: entre dois passos consecutivos muda UMA variável só, e toda
// troca de ETAPA acontece com a cena PARADA (mesmo n, mesma velocidade, mesma
// semelhança) — o paciente encara o comando novo em terreno conhecido.
export type Step = { etapa: Etapa; n: number; vel: number; semelhantes: boolean };

export const STEPS: Step[] = [
  { etapa: "cor",          n: 7,  vel: 0, semelhantes: false },
  { etapa: "cor",          n: 8,  vel: 0, semelhantes: false },  // n
  { etapa: "acessorio",    n: 8,  vel: 0, semelhantes: false },  // etapa (cena parada)
  { etapa: "corAcessorio", n: 8,  vel: 0, semelhantes: false },  // etapa (cena parada)
  { etapa: "corAcessorio", n: 9,  vel: 0, semelhantes: false },  // n
  { etapa: "corAcessorio", n: 9,  vel: 1, semelhantes: false },  // velocidade
  { etapa: "corAcessorio", n: 9,  vel: 1, semelhantes: true  },  // distratores semelhantes
  { etapa: "doisAlvos",    n: 9,  vel: 1, semelhantes: true  },  // etapa (cena parada)
  { etapa: "doisAlvos",    n: 10, vel: 1, semelhantes: true  },  // n
  { etapa: "mudancaRegra", n: 10, vel: 1, semelhantes: true  },  // etapa (cena parada)
  { etapa: "mudancaRegra", n: 10, vel: 2, semelhantes: true  },  // velocidade
  { etapa: "inibicao",     n: 10, vel: 2, semelhantes: true  },  // etapa (cena parada)
  { etapa: "inibicao",     n: 11, vel: 2, semelhantes: true  },  // n
];
