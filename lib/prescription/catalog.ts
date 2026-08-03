import rawParameters from "@/docs/prescription-architecture/prescription-parameters.json";
import associatedProfiles from "@/docs/clinical-architecture/associated-profiles.json";
import type {
  ExerciseDefinition, MinutesRange, PresentationMode, ProtocolName, SessionEligibility,
} from "./types";

type RawParameter = {
  exerciseId: string; officialName: string;
  executionModel: { value: ExerciseDefinition["executionModel"] };
  protocols: Record<"BRIEF" | "STANDARD" | "EXTENDED", { unitCount: number; estimatedDuration: string }>;
  baselineCognitiveLoad: { value: 1 | 2 | 3 };
  loadModifiers: { dimension: string; effect: string }[];
  fatigue: { level: ExerciseDefinition["fatigue"] };
  interference: { level: ExerciseDefinition["interference"] };
  sessionEligibility: { canOpen: boolean; canClose: boolean; bestPosition: string; badCombinations: { exercise: string; reason: string }[] };
  modality: "não se aplica" | { applies: true; modes: Record<PresentationMode, { durationImpact: string; loadImpact: string }> };
  [key: string]: unknown;
};
type AssociatedProfile = { exerciseId: string; mechanicalPrimary: string; associatedCognitiveProfiles: string[] };

const protocolNames: Record<ProtocolName, "BRIEF" | "STANDARD" | "EXTENDED"> = {
  BREVE: "BRIEF", PADRAO: "STANDARD", ESTENDIDO: "EXTENDED",
};

/** Converte `~2,5 min` / `3 min` do JSON em minutos, preservando o literal em durationText. */
export function minutesFromText(text: string): number {
  const value = text.replace("~", "").replace("min", "").trim().replace(",", ".");
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) throw new Error(`Duração não numérica no catálogo: ${text}`);
  return minutes;
}

/** Conversão literal dos impactos percentuais aprovados no JSON para multiplicadores min–max. */
export function modalityMultiplier(durationImpactText: string): MinutesRange {
  if (durationImpactText === "referência") return [1, 1];
  if (durationImpactText.includes("até ~10% menor")) return [0.9, 1];
  const match = durationImpactText.match(/~(\d+)(?:–(\d+))?% maior/);
  if (match) return [1 + Number(match[1]) / 100, 1 + Number(match[2] ?? match[1]) / 100];
  // "neutro a ~10% maior; pode diminuir" não quantifica redução: conserva 1 como mínimo.
  if (durationImpactText.includes("~10% maior")) return [1, 1.1];
  throw new Error(`Impacto de modalidade não normalizado: ${durationImpactText}`);
}

function preferredPosition(bestPosition: string): Pick<SessionEligibility, "preferredPositions" | "preferredCloseProtocol"> {
  const normalized = bestPosition.toLocaleLowerCase("pt-BR");
  const positions = new Set<SessionEligibility["preferredPositions"][number]>();
  if (normalized.includes("início")) positions.add("OPEN");
  if (normalized.includes("meio")) positions.add("MIDDLE");
  if (normalized.includes("fim") && !normalized.includes("apenas em breve") && !normalized.includes("pode fechar")) positions.add("CLOSE");
  return {
    preferredPositions: [...positions],
    ...(normalized.includes("apenas em breve") || normalized.includes("pode fechar") ? { preferredCloseProtocol: "BREVE" as const } : {}),
  };
}

const raw = rawParameters as RawParameter[];
const profiles = new Map((associatedProfiles as AssociatedProfile[]).map((profile) => [profile.exerciseId, profile]));
const idsByOfficialName = new Map(raw.map((entry) => [entry.officialName, entry.exerciseId]));

export const EXERCISE_CATALOG: readonly ExerciseDefinition[] = raw.map((entry) => {
  const profile = profiles.get(entry.exerciseId);
  if (!profile) throw new Error(`Perfil cognitivo ausente para ${entry.exerciseId}`);
  const preferred = preferredPosition(entry.sessionEligibility.bestPosition);
  const modalities = typeof entry.modality === "string" ? {} : Object.fromEntries(
    Object.entries(entry.modality.modes).map(([mode, definition]) => [mode, {
      durationImpactText: definition.durationImpact,
      durationMultiplier: modalityMultiplier(definition.durationImpact),
      loadImpact: definition.loadImpact,
    }]),
  );
  return {
    exerciseId: entry.exerciseId,
    officialName: entry.officialName,
    definitionVersion: "prescription-parameters-2026-08-03",
    executionModel: entry.executionModel.value,
    protocols: Object.fromEntries((Object.keys(protocolNames) as ProtocolName[]).map((protocol) => {
      const source = entry.protocols[protocolNames[protocol]];
      return [protocol, { unitCount: source.unitCount, durationMinutes: minutesFromText(source.estimatedDuration), durationText: source.estimatedDuration }];
    })) as ExerciseDefinition["protocols"],
    baselineCognitiveLoad: entry.baselineCognitiveLoad.value,
    loadModifiers: entry.loadModifiers,
    fatigue: entry.fatigue.level,
    interference: entry.interference.level,
    mechanicalPrimary: profile.mechanicalPrimary,
    associatedCognitiveProfiles: profile.associatedCognitiveProfiles,
    intrinsicChannels: entry.exerciseId === "span-numerico" || entry.exerciseId === "span-numerico-inverso" ? ["auditory"] : ["visual"],
    supportedPresentationModes: typeof entry.modality === "string" ? [] : ["visual", "visual+audio", "audioOnly"],
    modalities,
    sessionEligibility: {
      canOpen: entry.sessionEligibility.canOpen,
      canClose: entry.sessionEligibility.canClose,
      ...preferred,
      preferredPositionNote: entry.sessionEligibility.bestPosition,
      badCombinations: entry.sessionEligibility.badCombinations.map((combination) => ({
        exerciseId: idsByOfficialName.get(combination.exercise) ?? combination.exercise,
        reason: combination.reason,
      })),
    },
    parameterSchema: entry,
  } satisfies ExerciseDefinition;
});

export const CATALOG_BY_ID: ReadonlyMap<string, ExerciseDefinition> = new Map(
  EXERCISE_CATALOG.map((definition) => [definition.exerciseId, definition]),
);

export function catalogExercise(id: string): ExerciseDefinition | undefined {
  return CATALOG_BY_ID.get(id);
}
