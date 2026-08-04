import { catalogExercise } from "./catalog";
import type { ExercisePrescription, LegacyReadResult, PresentationMode, PrescribedDose, SessionPrescription, TargetMinutes, WeeklyFrequency } from "./types";

const ALIASES: Readonly<Record<string, string>> = {
  "desafio-orcamento": "compra-multifuncional",
  "caca-item-barato": "informacao-em-foco",
  "mudanca-regras": "informacao-em-foco",
  "restaurante-ordem-auditivo": "restaurante-ordem",
  "desafio-supermercado-auditivo": "desafio-supermercado",
  "focus-agents-auditivo": "focus-agents",
};

function parseRaw(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

function isTarget(value: unknown): value is TargetMinutes {
  return value === 20 || value === 30 || value === 40;
}
function isFrequency(value: unknown): value is WeeklyFrequency {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}
function presentationMode(value: unknown): PresentationMode | undefined {
  return value === "visual" || value === "visual+audio" || value === "audioOnly" ? value : undefined;
}

function normalizeDose(value: unknown): PrescribedDose | undefined {
  if (value === "BRIEF" || value === "BREVE") return { kind: "protocol", protocol: "BREVE" };
  if (value === "STANDARD" || value === "PADRAO" || value === "PADRÃO") return { kind: "protocol", protocol: "PADRAO" };
  if (value === "EXTENDED" || value === "ESTENDIDO") return { kind: "protocol", protocol: "ESTENDIDO" };
  if (!value || typeof value !== "object") return undefined;
  const dose = value as { kind?: unknown; protocol?: unknown; unitCount?: unknown; sourceKey?: unknown; prescribedMinutes?: unknown; maximumMinutes?: unknown; minutes?: unknown };
  if (dose.kind === "protocol") return normalizeDose(dose.protocol);
  if (dose.kind === "legacyCustom" && typeof dose.unitCount === "number" && Number.isFinite(dose.unitCount) && dose.unitCount > 0 && typeof dose.sourceKey === "string") {
    return { kind: "legacyCustom", unitCount: dose.unitCount, sourceKey: dose.sourceKey };
  }
  if (dose.kind === "timed" && typeof dose.prescribedMinutes === "number") return { kind: "timed", prescribedMinutes: dose.prescribedMinutes };
  if (dose.kind === "planningWindow" && typeof dose.maximumMinutes === "number") return { kind: "planningWindow", maximumMinutes: dose.maximumMinutes };
  if (dose.kind === "fixedExposure" && typeof dose.minutes === "number") return { kind: "fixedExposure", minutes: dose.minutes };
  return undefined;
}

function legacyTrialsDose(value: unknown): PrescribedDose | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? { kind: "legacyCustom", unitCount: value, sourceKey: "trials" }
    : undefined;
}

/**
 * Leitor tolerante do array atual (`string` ou `{ id, settings }`) e do envelope novo.
 * `settings`, inclusive `trials` dos spans, é preservado em clinicalParameters. A precedência de
 * leitura é dose explícita, protocolo e, por último, trials legado; ausência de todos resolve para
 * PADRAO no interpretador. IDs desconhecidos nunca lançam e ficam registrados.
 */
export function readLegacyPlan(rawPlan: unknown, fallbackTargetMinutes: TargetMinutes = 20): LegacyReadResult {
  const raw = parseRaw(rawPlan);
  const envelope = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : undefined;
  const entries = Array.isArray(raw) ? raw : Array.isArray(envelope?.exercises) ? envelope.exercises : [];
  const ignoredIds: string[] = [];
  const provisionalExerciseIds: string[] = [];
  const exercises: ExercisePrescription[] = [];
  for (const [index, entry] of entries.entries()) {
    const object = entry && typeof entry === "object" ? entry as Record<string, unknown> : undefined;
    const rawId = typeof entry === "string" ? entry : typeof object?.id === "string" ? object.id : typeof object?.exerciseId === "string" ? object.exerciseId : undefined;
    if (!rawId) { ignoredIds.push(String(entry)); continue; }
    const exerciseId = ALIASES[rawId] ?? rawId;
    const definition = catalogExercise(exerciseId);
    if (!definition) { ignoredIds.push(rawId); continue; }
    const settings = object?.settings && typeof object.settings === "object" ? object.settings as Record<string, unknown> : undefined;
    const explicitClinical = object?.clinicalParameters && typeof object.clinicalParameters === "object"
      ? object.clinicalParameters as Record<string, unknown>
      : undefined;
    const clinical = explicitClinical ?? settings;
    if (String(definition.parameterSchema.prescriptionParameterStatus).startsWith("PROVISIONAL_")) {
      provisionalExerciseIds.push(exerciseId);
    }
    exercises.push({
      exerciseId,
      order: typeof object?.order === "number" ? object.order : index + 1,
      dose: normalizeDose(object?.dose) ?? normalizeDose(settings?.protocol) ?? legacyTrialsDose(settings?.trials),
      startLevel: typeof object?.startLevel === "number" ? object.startLevel : undefined,
      presentationMode: presentationMode(object?.presentationMode ?? settings?.presentationMode),
      clinicalParameters: clinical,
    });
  }
  const plan: SessionPrescription = {
    schemaVersion: envelope?.schemaVersion === 1 ? 1 : undefined,
    patientId: typeof envelope?.patientId === "string" ? envelope.patientId : undefined,
    targetMinutes: isTarget(envelope?.targetMinutes) ? envelope.targetMinutes : fallbackTargetMinutes,
    weeklyFrequency: isFrequency(envelope?.weeklyFrequency) ? envelope.weeklyFrequency : undefined,
    exercises,
  };
  return { plan, ignoredIds, provisionalExerciseIds };
}
