import type { DosagemBloco } from "@/lib/exercise-dosage";

export const BLOCO_IDLE_MS = 15_000;

export interface EstadoBloco {
  activeMs: number;
  lastActivityAt: number;
  lastTickAt: number;
  started: boolean;
  finished: boolean;
  startedAt: number | null;
}

export function criarEstadoBloco(restoredMs = 0): EstadoBloco {
  return {
    activeMs: Math.max(0, restoredMs),
    lastActivityAt: 0,
    lastTickAt: 0,
    started: false,
    finished: false,
    startedAt: null,
  };
}

export function comecarBloco(state: EstadoBloco, now: number): EstadoBloco {
  if (state.started) return state;
  return {
    ...state,
    started: true,
    lastActivityAt: now,
    lastTickAt: now,
    // Após recarregar, aproxima o início pelo tempo ativo restaurado sem criar outra chave.
    startedAt: now - state.activeMs,
  };
}

export function registrarAtividadeBloco(state: EstadoBloco, now: number): EstadoBloco {
  return { ...state, lastActivityAt: now };
}

export function avancarTempoAtivo(
  state: EstadoBloco,
  now: number,
  maxDurationMs: number,
  idleMs = BLOCO_IDLE_MS,
): EstadoBloco {
  if (!state.started || state.finished) return state;
  const dt = Math.max(0, now - state.lastTickAt);
  const activeMs = now - state.lastActivityAt < idleMs
    ? Math.min(maxDurationMs, state.activeMs + dt)
    : state.activeMs;
  return { ...state, activeMs, lastTickAt: now };
}

export function progressoTemporalPct(activeMs: number, targetDurationMs: number): number {
  const raw = Math.round(((activeMs / targetDurationMs) * 100) / 10) * 10;
  return Math.max(0, Math.min(100, raw));
}

export function blocoEmTolerancia(activeMs: number, dosage: DosagemBloco): boolean {
  return activeMs >= dosage.targetDurationSec * 1000 && activeMs < dosage.maxDurationSec * 1000;
}

export function blocoAtingiuTeto(activeMs: number, dosage: DosagemBloco): boolean {
  return activeMs >= dosage.maxDurationSec * 1000;
}

export function blocoPodeIniciarNovoDesafio(activeMs: number, dosage: DosagemBloco): boolean {
  return activeMs < dosage.targetDurationSec * 1000;
}

export interface RegistroBloco {
  exerciseId: string;
  iniciadoEm: string;
  targetDurationSec: number;
  maxDurationSec: number;
  duracaoRealSec: number;
  encerradoNoAlvo: boolean;
  encerradoNaTolerancia: boolean;
  encerradoNoTeto: boolean;
  desafioInterrompidoId: string | null;
}

export function criarRegistroBloco(
  exerciseId: string,
  state: Pick<EstadoBloco, "activeMs" | "startedAt">,
  dosage: DosagemBloco,
  desafioInterrompidoId: string | null = null,
): RegistroBloco {
  const duracaoRealSec = Math.round(state.activeMs / 1000);
  const noTeto = blocoAtingiuTeto(state.activeMs, dosage);
  const naTolerancia = blocoEmTolerancia(state.activeMs, dosage)
    && state.activeMs > dosage.targetDurationSec * 1000;
  return {
    exerciseId,
    iniciadoEm: new Date(state.startedAt ?? 0).toISOString(),
    targetDurationSec: dosage.targetDurationSec,
    maxDurationSec: dosage.maxDurationSec,
    duracaoRealSec,
    encerradoNoAlvo: !noTeto && !naTolerancia && state.activeMs >= dosage.targetDurationSec * 1000,
    encerradoNaTolerancia: naTolerancia,
    encerradoNoTeto: noTeto,
    desafioInterrompidoId,
  };
}

/** Mantém o desafio aberto como dado, sem convertê-lo em erro, fracasso ou abandono. */
export function registrarDesafioInterrompido<T extends Record<string, unknown>>(id: string, dados: T) {
  return { id, interrompidoPeloFimDoBloco: true as const, dados };
}
