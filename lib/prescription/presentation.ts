import { catalogExercise } from "./catalog";
import { calculateDuration, doseMinutes, legacyDoseMinutes, TARGET_DURATION_BOUNDS } from "./duration";
import { interpretPlan } from "./interpreter";
import { readLegacyPlan } from "./legacy";
import { HIGH_FATIGUE_CAP, PLANNING_WINDOW_CAP } from "./load";
import type {
  AlertCode,
  ExecutionModel,
  ExerciseDefinition,
  ExercisePrescription,
  FatigueLevel,
  InterferenceLevel,
  MinutesRange,
  PrescriptionAlert,
  PresentationMode,
  ProtocolName,
  ResolvedExercisePrescription,
  SessionDurationState,
  SessionPrescription,
  TargetMinutes,
} from "./types";

export type VisualSeverity = "informativo" | "atencao" | "revisao_recomendada";

export const EXECUTION_MODEL_LABELS: Readonly<Record<ExecutionModel, string>> = {
  CONTINUOUS_TIMED: "Por tempo",
  CLOSED_PROTOCOL: "Por protocolo",
  PLANNING_WINDOW: "Janela de planejamento",
  FIXED_HIGH_FATIGUE: "Duração fixa",
};

export const SESSION_STATE_LABELS: Readonly<Record<SessionDurationState, string>> = {
  ABAIXO: "Abaixo do esperado",
  DENTRO: "Dentro do esperado",
  ACIMA: "Acima do esperado",
  EXCESSO_IMPORTANTE: "Excesso importante",
};

export const PRESENTATION_TEXTS = {
  estimateTooltip: "Faixa estimada a partir da dose, modalidade e transições entre exercícios.",
  loadHelper: "Referência consultiva; não determina se o plano é válido.",
  loadTooltip: "Soma da carga cognitiva basal dos exercícios, comparada à referência da duração prescrita.",
  alertsTooltip: "Observações consultivas para apoiar a revisão da composição. Não impedem salvar.",
  legacyMarker: "Alguns parâmetros não puderam ser determinados.",
  legacyTooltip: "O plano foi interpretado sem alterar os dados salvos. Confira os parâmetros indicados.",
  emptyGuidance: "Adicione exercícios para consultar a estimativa e a composição do plano.",
} as const;

export const PROTOCOL_GUIDANCE_TEXTS: Readonly<Record<ProtocolName, string>> = {
  BREVE: "Dose reduzida. Pode ser útil para introdução à atividade, menor tolerância à fadiga, retorno após pausa ou sessões com maior variedade de exercícios.",
  PADRAO: "Dose habitual recomendada para a maioria dos treinos, equilibrando duração, repetição e adaptação.",
  ESTENDIDO: "Dose ampliada para treino focal, maior familiaridade com a tarefa ou sessões com menor número de exercícios. Pode aumentar a fadiga.",
};

export const PROTOCOL_EXPOSURE_TEXTS = {
  BREVE: "Menor exposição.",
  ESTENDIDO: "Maior exposição; pode aumentar a fadiga.",
} as const;

export const ADAPTIVE_VALIDITY_NOTE = "Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente, para atualizar o nível adaptativo.";

const PROTOCOL_LABELS = { BREVE: "breve", PADRAO: "padrão", ESTENDIDO: "estendido" } as const;
const PROTOCOL_TITLES: Readonly<Record<ProtocolName, string>> = {
  BREVE: "Breve",
  PADRAO: "Padrão",
  ESTENDIDO: "Estendido",
};
const PRESENTATION_MODE_LABELS: Readonly<Record<PresentationMode, string>> = {
  visual: "visual",
  "visual+audio": "visual e áudio",
  audioOnly: "somente áudio",
};

const REVISION_CODES = new Set<AlertCode>([
  "SESSION_SAFE_MAX_EXCEEDED",
  "LOAD_OVER_CAP",
  "HIGH_FATIGUE_COUNT",
  "HIGH_FATIGUE_ADJACENT",
  "HIGH_INTERFERENCE_ADJACENT",
  "DECLARED_BAD_COMBINATION",
]);

export function visualSeverity(alert: Pick<PrescriptionAlert, "code" | "severity">): VisualSeverity {
  if (alert.severity === "informativa") return "informativo";
  return REVISION_CODES.has(alert.code) ? "revisao_recomendada" : "atencao";
}

const numberText = (value: number) => Number.isInteger(value)
  ? String(value)
  : String(Number(value.toFixed(2))).replace(".", ",");

export function formatMinutesRange(range: MinutesRange): string {
  return `${numberText(range[0])}–${numberText(range[1])} min`;
}

function formatExerciseDuration(range: MinutesRange): string {
  return range[0] === range[1] ? `${numberText(range[0])} min` : formatMinutesRange(range);
}

const UNIT_PLURALS: Readonly<Record<string, string>> = {
  bloco: "blocos",
  "desafio completo": "desafios completos",
  fase: "fases",
  rodada: "rodadas",
  série: "séries",
  tentativa: "tentativas",
};

function minimumValidUnit(definition: ExerciseDefinition): string {
  const value = definition.parameterSchema.minimumValidUnit;
  if (!value || typeof value !== "object") return "unidade";
  const unit = (value as Record<string, unknown>).value;
  return typeof unit === "string" && unit.trim() ? unit.trim() : "unidade";
}

function unitsLabel(unitCount: number, unit: string): string {
  return `${numberText(unitCount)} ${unitCount === 1 ? unit : UNIT_PLURALS[unit] ?? `${unit}s`}`;
}

function briefDeclaresInsufficientProgression(definition: ExerciseDefinition): boolean {
  const protocols = definition.parameterSchema.protocols;
  if (!protocols || typeof protocols !== "object") return false;
  const brief = (protocols as Record<string, unknown>).BRIEF;
  if (!brief || typeof brief !== "object") return false;
  const clinicalValidity = (brief as Record<string, unknown>).clinicalValidity;
  return typeof clinicalValidity === "string"
    && clinicalValidity.toLocaleLowerCase("pt-BR").includes("insuficiente para progressão");
}

export interface ProtocolOptionPresentation {
  protocol: ProtocolName;
  label: string;
  guidance: string;
  unitCount: number;
  unitName: string;
  unitsLabel: string;
  durationRange: MinutesRange;
  durationLabel: string;
  adaptiveValidityNote?: string;
  exposureNote?: string;
}

export function protocolOptions(exerciseId: string): readonly ProtocolOptionPresentation[] {
  const definition = catalogExercise(exerciseId);
  if (!definition) return [];
  const unitName = minimumValidUnit(definition);
  return (["BREVE", "PADRAO", "ESTENDIDO"] as const).map((protocol) => {
    const protocolDefinition = definition.protocols[protocol];
    const durationRange = calculateDuration([{
      definition,
      prescribedMinutes: doseMinutes(definition, { kind: "protocol", protocol }),
    }]);
    return {
      protocol,
      label: PROTOCOL_TITLES[protocol],
      guidance: PROTOCOL_GUIDANCE_TEXTS[protocol],
      unitCount: protocolDefinition.unitCount,
      unitName,
      unitsLabel: unitsLabel(protocolDefinition.unitCount, unitName),
      durationRange,
      durationLabel: `Estimativa: ${formatMinutesRange(durationRange)}`,
      ...(protocol === "BREVE" && briefDeclaresInsufficientProgression(definition)
        ? { adaptiveValidityNote: ADAPTIVE_VALIDITY_NOTE }
        : {}),
      ...(protocol === "BREVE" || protocol === "ESTENDIDO"
        ? { exposureNote: PROTOCOL_EXPOSURE_TEXTS[protocol] }
        : {}),
    };
  });
}

export function formatLoad(baselineLoad: number, loadReference: number) {
  return {
    text: `Carga basal: ${baselineLoad} / referência ${loadReference}`,
    helper: PRESENTATION_TEXTS.loadHelper,
  } as const;
}

type LevelSummary = Readonly<Record<"BAIXA" | "MODERADA" | "ALTA", number>>;

function formatLevelSummary(summary: LevelSummary): string {
  return ([
    ["BAIXA", "baixa", "baixas"],
    ["MODERADA", "moderada", "moderadas"],
    ["ALTA", "alta", "altas"],
  ] as const)
    .filter(([level]) => summary[level] > 0)
    .map(([level, singular, plural]) => `${summary[level]} ${summary[level] === 1 ? singular : plural}`)
    .join(" · ") || "Nenhuma";
}

export function formatFatigueSummary(summary: Readonly<Record<FatigueLevel, number>>): string {
  return formatLevelSummary(summary);
}

export function formatInterferenceSummary(summary: Readonly<Record<InterferenceLevel, number>>): string {
  return formatLevelSummary(summary);
}

interface AlertContext {
  targetMinutes: TargetMinutes;
  durationRange: MinutesRange;
  baselineLoad: number;
  loadReference: number;
  exercises: readonly ResolvedExercisePrescription[];
}

interface AlertCopyContext extends AlertContext {
  alert: PrescriptionAlert;
  exerciseNames: readonly string[];
}

interface AlertCopy {
  titulo: string;
  mensagem: (context: AlertCopyContext) => string;
  sugestao?: (context: AlertCopyContext) => string;
}

const namesText = (names: readonly string[]) => names.length > 0 ? names.join(" e ") : "Os exercícios selecionados";
const expectedRange = (target: TargetMinutes) => {
  const bounds = TARGET_DURATION_BOUNDS[target];
  return `${bounds.floor}–${bounds.ceiling} min`;
};
const highCount = (context: AlertCopyContext, key: "fatigue" | "interference") =>
  context.exercises.filter((exercise) => exercise.definition[key] === "ALTA").length;

function concentrationText(exercises: readonly ResolvedExercisePrescription[]): string {
  if (exercises.length < 3) return "há repetição de um mesmo processo cognitivo";
  const counts = new Map<string, number>();
  for (const exercise of exercises) {
    const primary = exercise.definition.mechanicalPrimary;
    counts.set(primary, (counts.get(primary) ?? 0) + 1);
  }
  const concentrated = [...counts.entries()].find(([, count]) => count >= Math.ceil((2 * exercises.length) / 3));
  if (concentrated) return `${concentrated[1]} de ${exercises.length} exercícios priorizam ${concentrated[0]}`;

  const signatures = exercises.map((exercise) => new Set([
    exercise.definition.mechanicalPrimary,
    ...exercise.definition.associatedCognitiveProfiles,
  ]));
  const common = [...signatures[0]].find((process) => signatures.every((signature) => signature.has(process)));
  return common ? `${common} aparece nos ${exercises.length} exercícios` : "há repetição de um mesmo processo cognitivo";
}

function badCombinationReason(context: AlertCopyContext): string | undefined {
  for (const exercise of context.exercises) {
    const match = exercise.definition.sessionEligibility.badCombinations.find((combination) =>
      context.alert.exerciseIds.includes(combination.exerciseId));
    if (match) return match.reason
      .replace(/^PROVISÓRIO:\s*/i, "")
      .replace(/[A-Z]{3,}_[A-Z_]+/g, "parâmetro técnico");
  }
  return undefined;
}

/** Configuração exaustiva: o `satisfies` faz um novo AlertCode falhar no typecheck até receber texto. */
export const ALERT_PRESENTATION_CONFIG = {
  SESSION_BELOW_TARGET: {
    titulo: "Duração abaixo da faixa esperada",
    mensagem: (c) => `A estimativa de ${formatMinutesRange(c.durationRange)} fica abaixo da faixa esperada de ${expectedRange(c.targetMinutes)}.`,
    sugestao: () => "Considere incluir outra atividade ou revisar a dose prescrita.",
  },
  SESSION_ABOVE_TARGET: {
    titulo: "Duração acima da faixa esperada",
    mensagem: (c) => `A estimativa de ${formatMinutesRange(c.durationRange)} fica acima da faixa esperada de ${expectedRange(c.targetMinutes)}.`,
    sugestao: () => "Considere revisar a quantidade de atividades ou suas doses.",
  },
  SESSION_RANGE_PARTIAL: {
    titulo: "Estimativa atravessa a faixa esperada",
    mensagem: (c) => `A faixa de ${formatMinutesRange(c.durationRange)} pode terminar dentro ou fora do esperado de ${expectedRange(c.targetMinutes)}.`,
  },
  SESSION_SAFE_MAX_EXCEEDED: {
    titulo: "Duração com excesso importante",
    mensagem: (c) => `O extremo superior da estimativa ultrapassa ${TARGET_DURATION_BOUNDS[c.targetMinutes].maximum} min.`,
    sugestao: () => "Revise a composição e as doses antes de aplicar o plano.",
  },
  LOAD_AT_CAP: {
    titulo: "Carga basal na referência",
    mensagem: (c) => `A carga basal ${c.baselineLoad} alcança a referência ${c.loadReference} para esta duração.`,
    sugestao: () => "Observe também fadiga, interferência e características do paciente.",
  },
  LOAD_OVER_CAP: {
    titulo: "Carga basal acima da referência",
    mensagem: (c) => `A carga basal ${c.baselineLoad} está acima da referência ${c.loadReference} para esta duração.`,
    sugestao: () => "Revise a distribuição da carga entre os exercícios.",
  },
  HIGH_FATIGUE_COUNT: {
    titulo: "Muitas atividades de fadiga alta",
    mensagem: (c) => `Há ${highCount(c, "fatigue")} atividades de fadiga alta; a referência para esta duração é até ${HIGH_FATIGUE_CAP[c.targetMinutes]}.`,
    sugestao: () => "Considere reduzir a quantidade ou intercalar atividades menos fatigantes.",
  },
  HIGH_FATIGUE_POSITION: {
    titulo: "Fadiga alta no encerramento",
    mensagem: (c) => `${namesText(c.exerciseNames)} encerra o plano com fadiga alta.`,
    sugestao: () => "Considere terminar com uma atividade de menor fadiga.",
  },
  HIGH_FATIGUE_ADJACENT: {
    titulo: "Fadiga alta em sequência",
    mensagem: (c) => `${namesText(c.exerciseNames)} aparecem em sequência e têm fadiga alta.`,
    sugestao: () => "Considere intercalar uma atividade menos fatigante.",
  },
  HIGH_INTERFERENCE_ADJACENT: {
    titulo: "Interferência alta em sequência",
    mensagem: (c) => `${namesText(c.exerciseNames)} aparecem em sequência e têm interferência alta.`,
    sugestao: () => "Considere separar as atividades na ordem do plano.",
  },
  AUDITORY_ONLY_ADJACENT: {
    titulo: "Atividades auditivas em sequência",
    mensagem: (c) => `${namesText(c.exerciseNames)} formam uma sequência concentrada no canal auditivo.`,
    sugestao: () => "Considere intercalar uma atividade com outro canal de apresentação.",
  },
  COGNITIVE_CONCENTRATION: {
    titulo: "Concentração em um processo cognitivo",
    mensagem: (c) => `A composição tem pouca variedade: ${concentrationText(c.exercises)}.`,
    sugestao: () => "Considere ampliar a variedade de processos trabalhados.",
  },
  PLANNING_WINDOW_COUNT: {
    titulo: "Muitas janelas de planejamento",
    mensagem: (c) => `Há ${c.exercises.filter((exercise) => exercise.definition.executionModel === "PLANNING_WINDOW").length} janelas de planejamento; a referência para esta duração é até ${PLANNING_WINDOW_CAP[c.targetMinutes]}.`,
    sugestao: () => "Considere combinar com atividades por tempo ou por protocolo.",
  },
  PLANNING_WINDOW_ADJACENT: {
    titulo: "Janelas de planejamento consecutivas",
    mensagem: (c) => `${namesText(c.exerciseNames)} aparecem consecutivamente.`,
    sugestao: () => "Considere intercalar uma atividade por tempo ou por protocolo.",
  },
  OPEN_POSITION_NOT_ELIGIBLE: {
    titulo: "Atividade pouco indicada para a abertura",
    mensagem: (c) => `${namesText(c.exerciseNames)} está na abertura, embora essa posição não seja indicada para a atividade.`,
    sugestao: () => "Considere mover a atividade para outra posição.",
  },
  CLOSE_POSITION_NOT_ELIGIBLE: {
    titulo: "Atividade pouco indicada para o encerramento",
    mensagem: (c) => `${namesText(c.exerciseNames)} está no encerramento, embora essa posição não seja indicada para a atividade.`,
    sugestao: () => "Considere mover a atividade para outra posição.",
  },
  OUTSIDE_BEST_POSITION: {
    titulo: "Atividade fora da posição preferencial",
    mensagem: (c) => {
      const exercise = c.exercises.find((item) => c.alert.exerciseIds.includes(item.definition.exerciseId));
      const preference = exercise?.definition.sessionEligibility.preferredPositionNote
        .replace(/\bBREVE\b/g, "protocolo breve");
      return `${namesText(c.exerciseNames)} pode permanecer nessa posição${preference ? `; a preferência é ${preference}` : ""}.`;
    },
  },
  DECLARED_BAD_COMBINATION: {
    titulo: "Combinação que merece revisão",
    mensagem: (c) => `${namesText(c.exerciseNames)} têm uma combinação desfavorável${badCombinationReason(c) ? `: ${badCombinationReason(c)}` : "."}`,
    sugestao: () => "Considere manter apenas uma das atividades ou separá-las conforme o raciocínio clínico.",
  },
} satisfies Record<AlertCode, AlertCopy>;

export interface PresentedAlert {
  /** Mantido para chaves e rastreio interno; nunca deve ser renderizado como texto. */
  code: AlertCode;
  titulo: string;
  mensagem: string;
  sugestao?: string;
  gravidadeVisual: VisualSeverity;
  exercicios: readonly string[];
  blocksSave: false;
}

export function presentAlert(alert: PrescriptionAlert, context: AlertContext): PresentedAlert {
  // `satisfies` preserva o tipo literal de cada entrada (bom: força cobertura exaustiva),
  // mas a união resultante não expõe `sugestao`, que é opcional. A anotação recupera o acesso
  // sem perder a checagem de exaustividade acima.
  const copy: AlertCopy = ALERT_PRESENTATION_CONFIG[alert.code];
  const exerciseNames = alert.exerciseIds.map((id) =>
    context.exercises.find((exercise) => exercise.definition.exerciseId === id)?.definition.officialName,
  ).filter((name): name is string => Boolean(name));
  const copyContext = { ...context, alert, exerciseNames };
  return {
    code: alert.code,
    titulo: copy.titulo,
    mensagem: copy.mensagem(copyContext),
    ...(copy.sugestao ? { sugestao: copy.sugestao(copyContext) } : {}),
    gravidadeVisual: visualSeverity(alert),
    exercicios: exerciseNames,
    blocksSave: false,
  };
}

export type AlertGroups = Readonly<Record<VisualSeverity, readonly PresentedAlert[]>>;

export function groupAlerts(alerts: readonly PresentedAlert[]): AlertGroups {
  return {
    revisao_recomendada: alerts.filter((alert) => alert.gravidadeVisual === "revisao_recomendada"),
    atencao: alerts.filter((alert) => alert.gravidadeVisual === "atencao"),
    informativo: alerts.filter((alert) => alert.gravidadeVisual === "informativo"),
  };
}

export interface PresentedExercise {
  exerciseId: string;
  name: string;
  modelLabel: string;
  doseLabel: string;
  durationLabel: string;
  durationApproximate: boolean;
  durationEstimateAvailable: boolean;
  protocolLabel: string;
  cognitiveProfileLabel: string;
  loadLabel: string;
  fatigueLabel: string;
  interferenceLabel: string;
  modalityLabel?: string;
  doseKind: "protocol" | "legacyCustom" | "other";
  selectedProtocol?: ProtocolName;
  legacyDose?: {
    valueLabel: string;
    durationLabel: string;
  };
  provisional: boolean;
}

/**
 * Os perfis do catálogo já vêm redigidos em português ("Atenção Seletiva"). Aqui só normalizamos a
 * caixa, para que virem frase corrida em vez de Título Com Todas As Iniciais Maiúsculas.
 */
function readableCognitiveProfile(value: string): string {
  const label = value.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  return label ? `${label[0].toLocaleUpperCase("pt-BR")}${label.slice(1)}` : "Perfil não informado";
}

function standardProtocolLabel(definition: ExerciseDefinition): string {
  const protocol = definition.protocols.PADRAO;
  const units = unitsLabel(protocol.unitCount, minimumValidUnit(definition));
  const duration = protocol.durationText.trim() || `${numberText(protocol.durationMinutes)} min`;
  return `Protocolo padrão: ${units} · ${duration}`;
}

function provisionalParameters(definition: ExerciseDefinition): boolean {
  return String(definition.parameterSchema.prescriptionParameterStatus).startsWith("PROVISIONAL_");
}

function cognitiveProfileLabel(definition: ExerciseDefinition): string {
  const primary = readableCognitiveProfile(definition.mechanicalPrimary);
  if (definition.associatedCognitiveProfiles.length === 0) return primary;
  const associated = definition.associatedCognitiveProfiles
    .map(readableCognitiveProfile)
    .map((label) => `${label[0].toLocaleLowerCase("pt-BR")}${label.slice(1)}`)
    .join(", ");
  return `${primary} · também recruta: ${associated}`;
}

function resolvedExercise(definition: ExerciseDefinition, prescription: ExercisePrescription): ResolvedExercisePrescription {
  return {
    definition,
    prescription,
    prescribedMinutes: doseMinutes(definition, prescription.dose, prescription.presentationMode),
  };
}

function legacyDoseLabel(definition: ExerciseDefinition, unitCount: number, sourceKey: string): string {
  const unit = sourceKey === "trials" ? "tentativa" : minimumValidUnit(definition);
  return unitsLabel(unitCount, unit);
}

function resolveExercises(plan: SessionPrescription): ResolvedExercisePrescription[] {
  return plan.exercises.flatMap((prescription) => {
    const definition = catalogExercise(prescription.exerciseId);
    return definition ? [resolvedExercise(definition, prescription)] : [];
  });
}

export function presentExercise(exercise: ResolvedExercisePrescription): PresentedExercise {
  const { definition, prescription } = exercise;
  const dose = prescription.dose;
  const provisional = provisionalParameters(definition);
  const legacyDuration = dose?.kind === "legacyCustom"
    ? legacyDoseMinutes(definition, dose, prescription.presentationMode)
    : undefined;
  const doseLabel = provisional
    ? "Configuração provisória"
    : !dose || dose.kind === "protocol"
    ? `Protocolo ${PROTOCOL_LABELS[dose?.kind === "protocol" ? dose.protocol : "PADRAO"]}`
    : dose.kind === "legacyCustom"
      ? legacyDoseLabel(definition, dose.unitCount, dose.sourceKey)
      : dose.kind === "planningWindow"
        ? `Até ${numberText(dose.maximumMinutes)} min`
        : `${numberText(dose.kind === "timed" ? dose.prescribedMinutes : dose.minutes)} min`;
  const durationLabel = dose?.kind !== "legacyCustom"
    ? formatExerciseDuration(exercise.prescribedMinutes)
    : legacyDuration?.minutes
      ? `${formatExerciseDuration(legacyDuration.minutes)} · aproximado`
      : "Duração aproximada — configuração anterior.";
  const modalityApplies = definition.supportedPresentationModes.length > 0;
  return {
    exerciseId: definition.exerciseId,
    name: definition.officialName,
    modelLabel: EXECUTION_MODEL_LABELS[definition.executionModel],
    doseLabel,
    durationLabel,
    durationApproximate: legacyDuration?.approximate ?? false,
    durationEstimateAvailable: dose?.kind !== "legacyCustom" || Boolean(legacyDuration?.minutes),
    protocolLabel: provisional ? "Configuração provisória" : standardProtocolLabel(definition),
    cognitiveProfileLabel: cognitiveProfileLabel(definition),
    loadLabel: `Carga ${definition.baselineCognitiveLoad}`,
    fatigueLabel: `Fadiga ${definition.fatigue.toLocaleLowerCase("pt-BR")}`,
    interferenceLabel: `Interferência ${definition.interference.toLocaleLowerCase("pt-BR")}`,
    ...(modalityApplies ? {
      modalityLabel: `Modalidade: ${prescription.presentationMode ? PRESENTATION_MODE_LABELS[prescription.presentationMode] : "padrão do exercício"}`,
    } : {}),
    doseKind: !dose || dose.kind === "protocol"
      ? "protocol"
      : dose.kind === "legacyCustom" ? "legacyCustom" : "other",
    ...(!dose || dose.kind === "protocol"
      ? { selectedProtocol: dose?.kind === "protocol" ? dose.protocol : "PADRAO" as const }
      : {}),
    ...(dose?.kind === "legacyCustom" ? {
      legacyDose: { valueLabel: doseLabel, durationLabel },
    } : {}),
    provisional,
  };
}

export function presentCatalogExercise(exerciseId: string): PresentedExercise | undefined {
  const definition = catalogExercise(exerciseId);
  if (!definition) return undefined;
  return presentExercise(resolvedExercise(definition, { exerciseId, order: 1 }));
}

export interface PlanPresentation {
  prescribedMinutes: number;
  prescribedLabel: string;
  durationRange: MinutesRange;
  estimateLabel: string;
  durationEstimateIncomplete: boolean;
  state: SessionDurationState;
  stateLabel: string;
  loadText: string;
  loadHelper: string;
  fatigueText: string;
  interferenceText: string;
  alerts: readonly PresentedAlert[];
  alertGroups: AlertGroups;
  exercises: readonly PresentedExercise[];
  empty: boolean;
  emptyGuidance?: string;
  legacyMarker?: { label: string; tooltip: string };
  canSave: true;
}

function planPresentation(plan: SessionPrescription, prescribedMinutes: number, hasUndefinedParameter: boolean): PlanPresentation {
  const interpreted = interpretPlan(plan);
  const exercises = resolveExercises(plan);
  const presentedExercises = exercises.map(presentExercise);
  const durationEstimateIncomplete = presentedExercises.some((exercise) => !exercise.durationEstimateAvailable);
  const context: AlertContext = {
    targetMinutes: plan.targetMinutes,
    durationRange: interpreted.durationRange,
    baselineLoad: interpreted.baselineLoad,
    loadReference: interpreted.loadReference,
    exercises,
  };
  const empty = exercises.length === 0;
  const alerts = empty ? [] : interpreted.alerts.map((alert) => presentAlert(alert, context));
  const load = formatLoad(interpreted.baselineLoad, interpreted.loadReference);
  const state: SessionDurationState = empty ? "ABAIXO" : interpreted.durationState;
  return {
    prescribedMinutes,
    prescribedLabel: `Duração prescrita: ${numberText(prescribedMinutes)} min`,
    durationRange: interpreted.durationRange,
    estimateLabel: empty
      ? "Estimativa: 0 min"
      : durationEstimateIncomplete
        ? `Estimativa incompleta: ${formatMinutesRange(interpreted.durationRange)}`
        : `Estimativa: ${formatMinutesRange(interpreted.durationRange)}`,
    durationEstimateIncomplete,
    state,
    stateLabel: SESSION_STATE_LABELS[state],
    loadText: load.text,
    loadHelper: load.helper,
    fatigueText: formatFatigueSummary(interpreted.fatigueSummary),
    interferenceText: formatInterferenceSummary(interpreted.interferenceSummary),
    alerts,
    alertGroups: groupAlerts(alerts),
    exercises: presentedExercises,
    empty,
    ...(empty ? { emptyGuidance: PRESENTATION_TEXTS.emptyGuidance } : {}),
    ...(hasUndefinedParameter ? { legacyMarker: { label: PRESENTATION_TEXTS.legacyMarker, tooltip: PRESENTATION_TEXTS.legacyTooltip } } : {}),
    canSave: true,
  };
}

function nearestTarget(minutes: number): TargetMinutes {
  if (minutes <= 25) return 20;
  if (minutes <= 35) return 30;
  return 40;
}

function parsedLegacyValue(rawPlan: unknown): unknown {
  if (typeof rawPlan !== "string") return rawPlan;
  try { return JSON.parse(rawPlan); } catch { return []; }
}

function recognizedDose(value: unknown): boolean {
  if (["BRIEF", "BREVE", "STANDARD", "PADRAO", "PADRÃO", "EXTENDED", "ESTENDIDO"].includes(String(value))) return true;
  if (!value || typeof value !== "object") return false;
  const dose = value as Record<string, unknown>;
  if (dose.kind === "protocol") return recognizedDose(dose.protocol);
  if (dose.kind === "legacyCustom") return typeof dose.unitCount === "number" && Number.isFinite(dose.unitCount) && dose.unitCount > 0 && typeof dose.sourceKey === "string";
  if (dose.kind === "timed") return typeof dose.prescribedMinutes === "number" && Number.isFinite(dose.prescribedMinutes);
  if (dose.kind === "planningWindow") return typeof dose.maximumMinutes === "number" && Number.isFinite(dose.maximumMinutes);
  if (dose.kind === "fixedExposure") return typeof dose.minutes === "number" && Number.isFinite(dose.minutes);
  return false;
}

function hasUnresolvedLegacyParameter(rawPlan: unknown): boolean {
  const raw = parsedLegacyValue(rawPlan);
  const envelope = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : undefined;
  const entries = Array.isArray(raw) ? raw : Array.isArray(envelope?.exercises) ? envelope.exercises : [];
  return entries.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const object = entry as Record<string, unknown>;
    const settings = object.settings && typeof object.settings === "object" ? object.settings as Record<string, unknown> : undefined;
    const explicitDose = object.dose ?? settings?.protocol;
    const explicitMode = object.presentationMode ?? settings?.presentationMode;
    const doseIsUnknown = explicitDose !== undefined && !recognizedDose(explicitDose);
    const modeIsUnknown = explicitMode !== undefined && explicitMode !== "visual" && explicitMode !== "visual+audio" && explicitMode !== "audioOnly";
    return doseIsUnknown || modeIsUnknown;
  });
}

export function presentPlan(plan: SessionPrescription): PlanPresentation {
  return planPresentation(plan, plan.targetMinutes, false);
}

/** Lê o formato salvo atual sem convertê-lo ou produzir qualquer mutação. */
export function presentLegacyPlan(rawPlan: unknown, prescribedMinutes?: number): PlanPresentation {
  const requestedMinutes = prescribedMinutes ?? 30;
  const target = nearestTarget(requestedMinutes);
  const legacy = readLegacyPlan(rawPlan, target);
  const displayedMinutes = prescribedMinutes ?? legacy.plan.targetMinutes;
  const exactTarget = displayedMinutes === 20 || displayedMinutes === 30 || displayedMinutes === 40;
  return planPresentation(
    legacy.plan,
    displayedMinutes,
    !exactTarget || legacy.ignoredIds.length > 0 || hasUnresolvedLegacyParameter(rawPlan),
  );
}
