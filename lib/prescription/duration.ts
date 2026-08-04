import type { ExecutionModel, MinutesRange, PrescribedDose, ResolvedExercisePrescription, SessionDurationState, TargetMinutes } from "./types";

type LegacyCustomDose = Extract<PrescribedDose, { kind: "legacyCustom" }>;

export interface LegacyDoseMinutesResult {
  minutes?: MinutesRange;
  approximate: boolean;
}

const LEGACY_RATE_TOLERANCE = 1e-9;
const DURATION_BOUNDARY_TOLERANCE = 1e-9;

export const CLOSING_MARGIN_MAX: Readonly<Record<ExecutionModel, number>> = {
  CONTINUOUS_TIMED: 0.5,
  CLOSED_PROTOCOL: 1,
  PLANNING_WINDOW: 3,
  FIXED_HIGH_FATIGUE: 0,
};

export interface TargetDurationBounds {
  floor: number;
  ceiling: number;
  maximum: number;
}

/** Faixa derivada diretamente da duração prescrita, sem arredondamento. */
export function targetDurationBounds(targetMinutes: TargetMinutes): TargetDurationBounds {
  return {
    floor: targetMinutes * 0.9,
    ceiling: targetMinutes * 1.1,
    maximum: targetMinutes * 1.2,
  };
}

export function isBelowDurationBoundary(value: number, boundary: number): boolean {
  return value < boundary - DURATION_BOUNDARY_TOLERANCE;
}

export function isAboveDurationBoundary(value: number, boundary: number): boolean {
  return value > boundary + DURATION_BOUNDARY_TOLERANCE;
}

function applyModality(
  definition: ResolvedExercisePrescription["definition"],
  minutes: MinutesRange,
  presentationMode?: ResolvedExercisePrescription["prescription"]["presentationMode"],
): MinutesRange {
  const modality = presentationMode && definition.modalities[presentationMode];
  if (!modality) return minutes;
  return [minutes[0] * modality.durationMultiplier[0], minutes[1] * modality.durationMultiplier[1]];
}

/**
 * Só estima uma dose legada quando os três protocolos demonstram a mesma taxa por unidade.
 * A tolerância existe apenas para ruído de ponto flutuante; não aproxima taxas clinicamente
 * diferentes.
 */
export function legacyDoseMinutes(
  definition: ResolvedExercisePrescription["definition"],
  dose: LegacyCustomDose,
  presentationMode?: ResolvedExercisePrescription["prescription"]["presentationMode"],
): LegacyDoseMinutesResult {
  if (!Number.isFinite(dose.unitCount) || dose.unitCount <= 0) return { approximate: false };
  const rates = Object.values(definition.protocols).map((protocol) =>
    protocol.unitCount > 0 ? protocol.durationMinutes / protocol.unitCount : Number.NaN);
  const referenceRate = rates[0];
  const hasConstantRate = Number.isFinite(referenceRate) && rates.every((rate) =>
    Number.isFinite(rate)
    && Math.abs(rate - referenceRate) <= LEGACY_RATE_TOLERANCE * Math.max(1, Math.abs(rate), Math.abs(referenceRate)));
  if (!hasConstantRate) return { approximate: false };
  const minutes = dose.unitCount * referenceRate;
  return { minutes: applyModality(definition, [minutes, minutes], presentationMode), approximate: true };
}

export function doseMinutes(definition: ResolvedExercisePrescription["definition"], dose?: PrescribedDose, presentationMode?: ResolvedExercisePrescription["prescription"]["presentationMode"]): MinutesRange {
  let base: MinutesRange;
  if (!dose || dose.kind === "protocol") base = (() => {
    const protocol = dose?.kind === "protocol" ? dose.protocol : "PADRAO";
    const minutes = definition.protocols[protocol].durationMinutes;
    return [minutes, minutes] as const;
  })();
  else if (dose.kind === "legacyCustom") return legacyDoseMinutes(definition, dose, presentationMode).minutes ?? [0, 0];
  else if (dose.kind === "timed") base = [dose.prescribedMinutes, dose.prescribedMinutes];
  else if (dose.kind === "planningWindow") base = [dose.maximumMinutes, dose.maximumMinutes];
  else base = [dose.minutes, dose.minutes];

  return applyModality(definition, base, presentationMode);
}

export function resolveDuration(exercise: ResolvedExercisePrescription): ResolvedExercisePrescription {
  return { ...exercise, prescribedMinutes: doseMinutes(exercise.definition, exercise.prescription.dose, exercise.prescription.presentationMode) };
}

/**
 * Doses legadas sem taxa segura chegam como `[0, 0]`: contribuem com zero na parcela prescrita,
 * sem gerar NaN, enquanto transições e margens de encerramento da composição continuam contando.
 * A apresentação sinaliza separadamente que a estimativa da sessão está incompleta.
 */
export function calculateDuration(exercises: readonly Pick<ResolvedExercisePrescription, "definition" | "prescribedMinutes">[]): MinutesRange {
  const transitions = Math.max(0, exercises.length - 1);
  const prescribedMin = exercises.reduce((total, exercise) => total + exercise.prescribedMinutes[0], 0);
  const prescribedMax = exercises.reduce((total, exercise) => total + exercise.prescribedMinutes[1], 0);
  const closingMax = exercises.reduce((total, exercise) => total + CLOSING_MARGIN_MAX[exercise.definition.executionModel], 0);
  return [prescribedMin + 0.5 * transitions, prescribedMax + transitions + closingMax];
}

/** Estado conservador pelo extremo superior; cruzamentos são descritos pelo alerta parcial. */
export function durationState(durationRange: MinutesRange, targetMinutes: TargetMinutes): SessionDurationState {
  const bounds = targetDurationBounds(targetMinutes);
  const upper = durationRange[1];
  if (isBelowDurationBoundary(upper, bounds.floor)) return "ABAIXO";
  if (isAboveDurationBoundary(upper, bounds.maximum)) return "EXCESSO_IMPORTANTE";
  if (isAboveDurationBoundary(upper, bounds.ceiling)) return "ACIMA";
  return "DENTRO";
}
