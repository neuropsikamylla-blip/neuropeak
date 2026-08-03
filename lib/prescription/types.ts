export type ExecutionModel = "CONTINUOUS_TIMED" | "CLOSED_PROTOCOL" | "PLANNING_WINDOW" | "FIXED_HIGH_FATIGUE";
export type ProtocolName = "BREVE" | "PADRAO" | "ESTENDIDO";
export type FatigueLevel = "BAIXA" | "MODERADA" | "ALTA";
export type InterferenceLevel = "BAIXA" | "MODERADA" | "ALTA";
export type SessionDurationState = "ABAIXO" | "DENTRO" | "ACIMA" | "EXCESSO_IMPORTANTE";
export type AlertSeverity = "informativa" | "atencao";
export type TargetMinutes = 20 | 30 | 40;
export type WeeklyFrequency = 1 | 2 | 3 | 4 | 5;
export type PresentationMode = "visual" | "visual+audio" | "audioOnly";
export type EffectiveChannel = "visual" | "auditory";
export type SessionPosition = "OPEN" | "MIDDLE" | "CLOSE";

export type MinutesRange = readonly [minimum: number, maximum: number];

export type AlertCode =
  | "SESSION_BELOW_TARGET" | "SESSION_ABOVE_TARGET" | "SESSION_RANGE_PARTIAL"
  | "SESSION_SAFE_MAX_EXCEEDED" | "LOAD_AT_CAP" | "LOAD_OVER_CAP"
  | "HIGH_FATIGUE_COUNT" | "HIGH_FATIGUE_POSITION" | "HIGH_FATIGUE_ADJACENT"
  | "HIGH_INTERFERENCE_ADJACENT" | "AUDITORY_ONLY_ADJACENT" | "COGNITIVE_CONCENTRATION"
  | "PLANNING_WINDOW_COUNT" | "PLANNING_WINDOW_ADJACENT" | "OPEN_POSITION_NOT_ELIGIBLE"
  | "CLOSE_POSITION_NOT_ELIGIBLE" | "OUTSIDE_BEST_POSITION" | "DECLARED_BAD_COMBINATION";

export interface PrescriptionAlert {
  code: AlertCode;
  severity: AlertSeverity;
  message: string;
  exerciseIds: readonly string[];
  /** Alertas de composição são estritamente consultivos. */
  blocksSave: false;
}

export interface ProtocolDefinition {
  unitCount: number;
  durationMinutes: number;
  /** Texto literal de origem, por exemplo `~3 min`. */
  durationText: string;
}

export interface ModalityDefinition {
  durationImpactText: string;
  durationMultiplier: MinutesRange;
  loadImpact: string;
}

export interface SessionEligibility {
  canOpen: boolean;
  canClose: boolean;
  preferredPositions: readonly SessionPosition[];
  preferredPositionNote: string;
  /** Fechamento preferido somente para esta dose, sem alterar `canClose`. */
  preferredCloseProtocol?: ProtocolName;
  badCombinations: readonly { exerciseId: string; reason: string }[];
}

export interface ExerciseDefinition {
  exerciseId: string;
  officialName: string;
  definitionVersion: string;
  executionModel: ExecutionModel;
  protocols: Readonly<Record<ProtocolName, ProtocolDefinition>>;
  baselineCognitiveLoad: 1 | 2 | 3;
  loadModifiers: readonly { dimension: string; effect: string }[];
  fatigue: FatigueLevel;
  interference: InterferenceLevel;
  mechanicalPrimary: string;
  associatedCognitiveProfiles: readonly string[];
  intrinsicChannels: readonly EffectiveChannel[];
  supportedPresentationModes: readonly PresentationMode[];
  modalities: Readonly<Partial<Record<PresentationMode, ModalityDefinition>>>;
  sessionEligibility: SessionEligibility;
  /** JSON integral de parâmetros, preservado como esquema informativo. */
  parameterSchema: Readonly<Record<string, unknown>>;
}

export type PrescribedDose =
  | { kind: "protocol"; protocol: ProtocolName }
  | { kind: "timed"; prescribedMinutes: number }
  | { kind: "planningWindow"; maximumMinutes: number }
  | { kind: "fixedExposure"; minutes: number };

export interface ExercisePrescription {
  exerciseId: string;
  order: number;
  dose?: PrescribedDose;
  startLevel?: number;
  presentationMode?: PresentationMode;
  clinicalParameters?: Readonly<Record<string, unknown>>;
}

export interface SessionPrescription {
  schemaVersion?: 1;
  patientId?: string;
  targetMinutes: TargetMinutes;
  weeklyFrequency?: WeeklyFrequency;
  exercises: readonly ExercisePrescription[];
}

export interface ResolvedExercisePrescription {
  definition: ExerciseDefinition;
  prescription: ExercisePrescription;
  prescribedMinutes: MinutesRange;
}

export interface LegacyReadResult {
  plan: SessionPrescription;
  ignoredIds: readonly string[];
}
