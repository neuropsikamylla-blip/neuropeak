import { catalogExercise } from "./catalog";
import { calculateDuration, doseMinutes, legacyDoseMinutes, targetDurationBounds } from "./duration";
import { interpretPlan } from "./interpreter";
import { isTarget, readLegacyPlan } from "./legacy";
import { HIGH_FATIGUE_CAP } from "./load";
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

export type VisualSeverity = "revisao_plano" | "observacao_clinica" | "informacao";

export const EXECUTION_MODEL_LABELS: Readonly<Record<ExecutionModel, string>> = {
  CONTINUOUS_TIMED: "Por tempo",
  CLOSED_PROTOCOL: "Por protocolo",
  PLANNING_WINDOW: "Planejamento prolongado",
  FIXED_HIGH_FATIGUE: "Duração fixa",
};

export const SESSION_STATE_LABELS: Readonly<Record<SessionDurationState, string>> = {
  ABAIXO: "Abaixo do esperado",
  DENTRO: "Dentro do esperado",
  ACIMA: "Acima do esperado",
  EXCESSO_IMPORTANTE: "Excesso importante",
};

export const PRESENTATION_TEXTS = {
  alertsTooltip: "Pontos para considerar antes de salvar. Não impedem o salvamento.",
  legacyMarker: "Este plano usa uma configuração anterior.",
  legacyTooltip: "Os dados salvos não foram alterados.",
  emptyGuidance: "Adicione exercícios para ver o tempo previsto do plano.",
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

export const REVISION_CODES: ReadonlySet<AlertCode> = new Set<AlertCode>([
  "LOAD_AT_CAP",
  "LOAD_OVER_CAP",
  "HIGH_FATIGUE_COUNT",
]);

export const CLINICAL_OBSERVATION_CODES: ReadonlySet<AlertCode> = new Set<AlertCode>([
  "COGNITIVE_CONCENTRATION",
  "DECLARED_BAD_COMBINATION",
  "AUDITORY_ONLY_ADJACENT",
  "PLANNING_WINDOW_COUNT",
]);

export const INFORMATION_CODES: ReadonlySet<AlertCode> = new Set<AlertCode>([
  "SESSION_BELOW_TARGET",
  "SESSION_ABOVE_TARGET",
  "SESSION_RANGE_PARTIAL",
  "SESSION_SAFE_MAX_EXCEEDED",
  "OUTSIDE_BEST_POSITION",
  "OPEN_POSITION_NOT_ELIGIBLE",
  "CLOSE_POSITION_NOT_ELIGIBLE",
  "HIGH_FATIGUE_POSITION",
  "HIGH_FATIGUE_ADJACENT",
  "HIGH_INTERFERENCE_ADJACENT",
  "PLANNING_WINDOW_ADJACENT",
]);

export function visualSeverity(alert: Pick<PrescriptionAlert, "code" | "severity">): VisualSeverity {
  if (REVISION_CODES.has(alert.code)) return "revisao_plano";
  if (CLINICAL_OBSERVATION_CODES.has(alert.code)) return "observacao_clinica";
  return "informacao";
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
  loadReference?: number;
  exercises: readonly ResolvedExercisePrescription[];
}

interface AlertCopyContext extends AlertContext {
  alert: PrescriptionAlert;
  exerciseNames: readonly string[];
}

interface AlertCopy {
  titulo: string | ((context: AlertCopyContext) => string);
  mensagem: (context: AlertCopyContext) => string;
  sugestao?: (context: AlertCopyContext) => string;
}

const namesText = (names: readonly string[]) => names.length > 0 ? names.join(" e ") : "Os exercícios selecionados";
const expectedRange = (target: TargetMinutes) => {
  const bounds = targetDurationBounds(target);
  return formatMinutesRange([bounds.floor, bounds.ceiling]);
};
const highCount = (context: AlertCopyContext, key: "fatigue" | "interference") =>
  context.exercises.filter((exercise) => exercise.definition[key] === "ALTA").length;

const FOCAL_PLAN_TEXT = "Essa concentração pode ser intencional em um plano focal.";
const OVERLAP_SUGGESTION = "O terapeuta pode manter essa concentração conforme o objetivo clínico.";

function definitionsForAlert(context: AlertCopyContext): readonly ExerciseDefinition[] {
  if (context.alert.code === "COGNITIVE_CONCENTRATION" && context.alert.exerciseIds.length === 0) {
    return context.exercises.map((exercise) => exercise.definition);
  }
  return context.alert.exerciseIds.flatMap((id) => {
    const definition = context.exercises.find((exercise) => exercise.definition.exerciseId === id)?.definition;
    return definition ? [definition] : [];
  });
}

function cognitiveSignatures(definition: ExerciseDefinition): readonly string[] {
  return [definition.mechanicalPrimary, ...definition.associatedCognitiveProfiles];
}

function sharedCognitiveProcesses(definitions: readonly ExerciseDefinition[]): readonly string[] {
  if (definitions.length < 2) return [];
  const remaining = definitions.slice(1).map((definition) => new Set(
    cognitiveSignatures(definition).map((value) => value.toLocaleLowerCase("pt-BR")),
  ));
  return cognitiveSignatures(definitions[0]).filter((process) =>
    remaining.every((signature) => signature.has(process.toLocaleLowerCase("pt-BR"))),
  );
}

interface OverlapCopy {
  titulo: string;
  mensagem: string;
}

const APPROVED_OVERLAP_COPY: Readonly<Record<string, OverlapCopy>> = {
  "estacionamento-logico|torre-hanoi": {
    titulo: "Sobreposição em planejamento",
    mensagem: `Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. ${FOCAL_PLAN_TEXT}`,
  },
  "semaforo|stroop-task": {
    titulo: "Sobreposição em controle inibitório",
    mensagem: `Cores e Palavras e Semáforo recrutam controle inibitório e associações entre estímulo e resposta semelhantes. ${FOCAL_PLAN_TEXT}`,
  },
  "letras-sequencia|span-numerico": {
    titulo: "Sobreposição de processos cognitivos",
    mensagem: `Span Numérico Auditivo Direto e Letras em Sequência recrutam processos verbais e de memória operacional semelhantes. ${FOCAL_PLAN_TEXT}`,
  },
};

function overlapCopy(definitions: readonly ExerciseDefinition[]): OverlapCopy {
  const approved = APPROVED_OVERLAP_COPY[definitions.map(({ exerciseId }) => exerciseId).sort().join("|")];
  if (approved) return approved;

  const shared = sharedCognitiveProcesses(definitions);
  const primaryProcess = shared[0]?.toLocaleLowerCase("pt-BR");
  const subject = definitions.length <= 2
    ? namesText(definitions.map(({ officialName }) => officialName))
    : "Os exercícios listados nos detalhes";
  const processes = primaryProcess ? `processos de ${primaryProcess}` : "processos cognitivos";
  return {
    titulo: primaryProcess ? `Sobreposição em ${primaryProcess}` : "Sobreposição de processos cognitivos",
    mensagem: `${subject} recrutam ${processes} semelhantes. ${FOCAL_PLAN_TEXT}`,
  };
}

function declaredObservation(context: AlertCopyContext): OverlapCopy {
  const definitions = definitionsForAlert(context);
  return overlapCopy(definitions);
}

/** Configuração exaustiva: o `satisfies` faz um novo AlertCode falhar no typecheck até receber texto. */
export const ALERT_PRESENTATION_CONFIG = {
  SESSION_BELOW_TARGET: {
    titulo: "Duração abaixo da faixa esperada",
    mensagem: (c) => `A estimativa de ${formatMinutesRange(c.durationRange)} fica abaixo da faixa esperada de ${expectedRange(c.targetMinutes)}.`,
    sugestao: () => "Considere incluir outra atividade ou revisar a dose prescrita.",
  },
  SESSION_ABOVE_TARGET: {
    titulo: "Duração acima da faixa prescrita",
    mensagem: (c) => `A duração estimada de ${formatMinutesRange(c.durationRange)} fica acima da faixa prescrita de ${expectedRange(c.targetMinutes)}.`,
    sugestao: () => "Considere revisar a quantidade de atividades ou suas doses.",
  },
  SESSION_RANGE_PARTIAL: {
    titulo: "Estimativa atravessa a faixa esperada",
    mensagem: (c) => `A faixa de ${formatMinutesRange(c.durationRange)} pode terminar dentro ou fora do esperado de ${expectedRange(c.targetMinutes)}.`,
  },
  SESSION_SAFE_MAX_EXCEEDED: {
    titulo: "Duração estimada acima da sessão prescrita",
    mensagem: (c) => `A duração estimada ultrapassa ${targetDurationBounds(c.targetMinutes).maximum} min para a sessão prescrita.`,
    sugestao: () => "Considere revisar as atividades ou as doses do plano.",
  },
  LOAD_AT_CAP: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  LOAD_OVER_CAP: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  HIGH_FATIGUE_COUNT: {
    titulo: "Muitas atividades de fadiga alta",
    mensagem: (c) => `Há ${highCount(c, "fatigue")} atividades de fadiga alta; a referência para esta duração é até ${HIGH_FATIGUE_CAP[c.targetMinutes]}.`,
    sugestao: () => "Considere reduzir a quantidade ou intercalar atividades menos fatigantes.",
  },
  HIGH_FATIGUE_POSITION: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  HIGH_FATIGUE_ADJACENT: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  HIGH_INTERFERENCE_ADJACENT: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  AUDITORY_ONLY_ADJACENT: {
    titulo: "Concentração no canal auditivo",
    mensagem: (c) => `${namesText(c.exerciseNames)} concentram atividades no canal auditivo.`,
    sugestao: () => "Considere intercalar uma atividade com outro canal de apresentação.",
  },
  COGNITIVE_CONCENTRATION: {
    titulo: (c) => declaredObservation(c).titulo,
    mensagem: (c) => declaredObservation(c).mensagem,
    sugestao: () => OVERLAP_SUGGESTION,
  },
  PLANNING_WINDOW_COUNT: {
    titulo: "Planejamento prolongado",
    mensagem: (c) => `${c.exercises.filter((exercise) => exercise.definition.executionModel === "PLANNING_WINDOW").length} exercícios do plano exigem raciocínio sustentado até a solução.`,
  },
  PLANNING_WINDOW_ADJACENT: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  OPEN_POSITION_NOT_ELIGIBLE: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  CLOSE_POSITION_NOT_ELIGIBLE: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  OUTSIDE_BEST_POSITION: {
    titulo: "Informação não exibida",
    mensagem: () => "Esta ocorrência não é exibida na revisão do plano.",
  },
  DECLARED_BAD_COMBINATION: {
    titulo: (c) => declaredObservation(c).titulo,
    mensagem: (c) => declaredObservation(c).mensagem,
    sugestao: () => OVERLAP_SUGGESTION,
  },
} satisfies Record<AlertCode, AlertCopy>;

export interface PresentedAlert {
  /** Mantido para chaves e rastreio interno; nunca deve ser renderizado como texto. */
  code: AlertCode;
  titulo: string;
  mensagem: string;
  sugestao?: string;
  /** Dado já produzido pelo núcleo e promovido para o resumo visual do alerta. */
  dadoPrincipal?: string;
  /** Quantidade de alertas individuais representados por este cartão. */
  occurrenceCount: number;
  expansionLabel: "Ver detalhes" | "Ver exercícios";
  gravidadeVisual: VisualSeverity;
  exercicios: readonly string[];
  ocorrencias?: readonly PresentedAlertOccurrence[];
  blocksSave: false;
}

export interface PresentedAlertOccurrence {
  mensagem: string;
  exercicios: readonly string[];
  sugestao?: string;
}

function countText(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function alertMainDatum(alert: PrescriptionAlert, context: AlertContext): string | undefined {
  switch (alert.code) {
    case "SESSION_BELOW_TARGET":
    case "SESSION_ABOVE_TARGET":
    case "SESSION_RANGE_PARTIAL":
    case "SESSION_SAFE_MAX_EXCEEDED":
      return formatMinutesRange(context.durationRange);
    case "LOAD_AT_CAP":
    case "LOAD_OVER_CAP":
      return undefined;
    case "HIGH_FATIGUE_COUNT":
      return countText(alert.exerciseIds.length, "atividade", "atividades");
    case "HIGH_FATIGUE_ADJACENT":
    case "HIGH_INTERFERENCE_ADJACENT":
    case "PLANNING_WINDOW_ADJACENT":
    case "AUDITORY_ONLY_ADJACENT":
      return undefined;
    case "PLANNING_WINDOW_COUNT":
      return countText(alert.exerciseIds.length, "janela", "janelas");
    case "HIGH_FATIGUE_POSITION":
    case "OPEN_POSITION_NOT_ELIGIBLE":
    case "CLOSE_POSITION_NOT_ELIGIBLE":
    case "OUTSIDE_BEST_POSITION":
      return countText(alert.exerciseIds.length, "atividade", "atividades");
    case "DECLARED_BAD_COMBINATION":
      return undefined;
    case "COGNITIVE_CONCENTRATION":
      return undefined;
  }
}

function alertExpansionLabel(alert: PrescriptionAlert): PresentedAlert["expansionLabel"] {
  return alert.exerciseIds.length > 0 ? "Ver exercícios" : "Ver detalhes";
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
  const dadoPrincipal = alertMainDatum(alert, context);
  return {
    code: alert.code,
    titulo: typeof copy.titulo === "function" ? copy.titulo(copyContext) : copy.titulo,
    mensagem: copy.mensagem(copyContext),
    ...(copy.sugestao ? { sugestao: copy.sugestao(copyContext) } : {}),
    ...(dadoPrincipal ? { dadoPrincipal } : {}),
    occurrenceCount: 1,
    expansionLabel: alertExpansionLabel(alert),
    gravidadeVisual: visualSeverity(alert),
    exercicios: exerciseNames,
    blocksSave: false,
  };
}

export type AlertGroups = Readonly<Record<VisualSeverity, readonly PresentedAlert[]>>;

export function groupAlerts(alerts: readonly PresentedAlert[]): AlertGroups {
  return {
    revisao_plano: alerts.filter((alert) => alert.gravidadeVisual === "revisao_plano"),
    observacao_clinica: alerts.filter((alert) => alert.gravidadeVisual === "observacao_clinica"),
    informacao: alerts.filter((alert) => alert.gravidadeVisual === "informacao"),
  };
}

function exerciseNames(ids: readonly string[], context: AlertContext): readonly string[] {
  return ids.map((id) => context.exercises.find((exercise) =>
    exercise.definition.exerciseId === id)?.definition.officialName,
  ).filter((name): name is string => Boolean(name));
}

function intensityInsight(alerts: readonly PrescriptionAlert[], context: AlertContext): PresentedAlert | undefined {
  const fatigueAlert = alerts.find((alert) => alert.code === "HIGH_FATIGUE_COUNT");
  const loadOver = alerts.find((alert) => alert.code === "LOAD_OVER_CAP");
  const highFatigueCount = context.exercises.filter((exercise) => exercise.definition.fatigue === "ALTA").length;
  // Fora das durações validadas pela tabela, a apresentação pode descrever uma concentração
  // inequívoca (acima do maior limite existente) sem atribuir significado à carga numérica.
  const highFatigueWithoutLoadReference = context.loadReference === undefined && highFatigueCount > 2;
  if (!fatigueAlert && !loadOver && !highFatigueWithoutLoadReference) return undefined;

  const exerciseCount = context.exercises.length;
  const fatigueText = highFatigueCount === 1
    ? `1 dos ${exerciseCount} exercícios é potencialmente fatigante`
    : `${highFatigueCount} dos ${exerciseCount} exercícios são potencialmente fatigantes`;
  const mentionsLoad = Boolean(
    loadOver
    && context.loadReference !== undefined
    && context.baselineLoad > context.loadReference,
  );
  const represented = alerts.filter((alert) => ["HIGH_FATIGUE_COUNT", "LOAD_AT_CAP", "LOAD_OVER_CAP"].includes(alert.code));
  const ids = context.exercises
    .filter((exercise) => exercise.definition.fatigue === "ALTA")
    .map((exercise) => exercise.definition.exerciseId);

  return {
    code: fatigueAlert?.code ?? loadOver?.code ?? "HIGH_FATIGUE_COUNT",
    titulo: "Plano de demanda elevada",
    mensagem: `${fatigueText}${mentionsLoad
      ? `, e a demanda total está acima do previsto para uma sessão de ${numberText(context.targetMinutes)} minutos.`
      : "."}`,
    occurrenceCount: Math.max(1, represented.length),
    expansionLabel: ids.length > 0 ? "Ver exercícios" : "Ver detalhes",
    gravidadeVisual: "revisao_plano",
    exercicios: exerciseNames(ids, context),
    blocksSave: false,
  };
}

function concentrationOccurrence(alert: PrescriptionAlert, context: AlertContext): PresentedAlertOccurrence {
  const ids = alert.code === "COGNITIVE_CONCENTRATION" && alert.exerciseIds.length === 0
    ? context.exercises.map((exercise) => exercise.definition.exerciseId)
    : alert.exerciseIds;
  const names = exerciseNames(ids, context);
  const observation = declaredObservation({ ...context, alert, exerciseNames: names });
  return { mensagem: observation.mensagem, exercicios: names };
}

function concentrationInsight(alerts: readonly PrescriptionAlert[], context: AlertContext): PresentedAlert | undefined {
  const matching = alerts.filter((alert) => [
    "COGNITIVE_CONCENTRATION",
    "DECLARED_BAD_COMBINATION",
    "AUDITORY_ONLY_ADJACENT",
  ].includes(alert.code));
  if (matching.length === 0) return undefined;

  const ids = [...new Set(matching.flatMap((alert) =>
    alert.code === "COGNITIVE_CONCENTRATION" && alert.exerciseIds.length === 0
      ? context.exercises.map((exercise) => exercise.definition.exerciseId)
      : alert.exerciseIds,
  ))];
  const occurrences = matching.map((alert) => concentrationOccurrence(alert, context));
  const definitions = matching.some((alert) => alert.code === "COGNITIVE_CONCENTRATION" && alert.exerciseIds.length === 0)
    ? context.exercises.map((exercise) => exercise.definition)
    : ids.flatMap((id) => {
      const definition = context.exercises.find((exercise) => exercise.definition.exerciseId === id)?.definition;
      return definition ? [definition] : [];
    });
  const copy = overlapCopy(definitions);

  return {
    code: matching[0].code,
    titulo: copy.titulo,
    mensagem: copy.mensagem,
    sugestao: OVERLAP_SUGGESTION,
    occurrenceCount: matching.length,
    expansionLabel: "Ver detalhes",
    gravidadeVisual: "observacao_clinica",
    exercicios: exerciseNames(ids, context),
    ...(occurrences.length > 0 ? { ocorrencias: occurrences } : {}),
    blocksSave: false,
  };
}

function planningInsight(alerts: readonly PrescriptionAlert[], context: AlertContext): PresentedAlert | undefined {
  const planningAlert = alerts.find((alert) => alert.code === "PLANNING_WINDOW_COUNT");
  if (!planningAlert) return undefined;
  const planning = context.exercises.filter((exercise) => exercise.definition.executionModel === "PLANNING_WINDOW");
  return {
    code: planningAlert.code,
    titulo: "Planejamento prolongado",
    mensagem: `${planning.length} exercícios do plano exigem raciocínio sustentado até a solução.`,
    occurrenceCount: 1,
    expansionLabel: "Ver exercícios",
    gravidadeVisual: "observacao_clinica",
    exercicios: exerciseNames(planning.map((exercise) => exercise.definition.exerciseId), context),
    blocksSave: false,
  };
}

function presentInsights(alerts: readonly PrescriptionAlert[], context: AlertContext): readonly PresentedAlert[] {
  // TODO: cobertura cognitiva depende de um objetivo clínico prioritário registrado no modelo.
  // Sem esse dado, a ausência de um domínio pode ser intencional e não deve gerar insight.
  return [
    intensityInsight(alerts, context),
    concentrationInsight(alerts, context),
    planningInsight(alerts, context),
  ].filter((alert): alert is PresentedAlert => Boolean(alert));
}

export const INITIAL_ALERT_LIMITS = {
  revisao_plano: 4,
  observacao_clinica: 3,
} as const;

export interface LimitedAlertGroup {
  initial: readonly PresentedAlert[];
  hidden: readonly PresentedAlert[];
  hiddenCount: number;
}

/** Limites puramente visuais; os arrays integrais de `PlanPresentation` permanecem intactos. */
export function limitAlertGroup(
  alerts: readonly PresentedAlert[],
  severity: keyof typeof INITIAL_ALERT_LIMITS,
): LimitedAlertGroup {
  const limit = INITIAL_ALERT_LIMITS[severity];
  const initial = alerts.slice(0, limit);
  const hidden = alerts.slice(limit);
  return { initial, hidden, hiddenCount: hidden.length };
}

export function firstLevelAlertCardCounts(groups: AlertGroups) {
  return {
    revisao_plano: Math.min(groups.revisao_plano.length, INITIAL_ALERT_LIMITS.revisao_plano),
    observacao_clinica: Math.min(groups.observacao_clinica.length, INITIAL_ALERT_LIMITS.observacao_clinica),
    informacao: groups.informacao.length > 0 ? 1 : 0,
  } as const;
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
  /** Escala interna mantida somente por compatibilidade com consumidores legados. */
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
    .slice(0, 2)
    .map(readableCognitiveProfile)
    .map((label) => `${label[0].toLocaleLowerCase("pt-BR")}${label.slice(1)}`)
    // Separador " · " e não vírgula: os próprios nomes de perfil contêm vírgula
    // ("Linguagem, Leitura e Processamento Auditivo"), o que tornaria a lista ambígua.
    .join(" · ");
  return `${primary} · também: ${associated}`;
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
  /** Rótulo da meta, ex.: "40 minutos". */
  targetLabel: string;
  /** Tempo previsto e faixa esperada — só para "Ver tempo detalhado". */
  estimateDetail: string;
  durationEstimateIncomplete: boolean;
  state: SessionDurationState;
  stateLabel: string;
  fatigueText: string;
  interferenceText: string;
  /** Insights consultivos visíveis; ocorrências integrais permanecem no resultado do núcleo. */
  alerts: readonly PresentedAlert[];
  /** Os mesmos insights, organizados por finalidade visual. */
  alertGroups: AlertGroups;
  exercises: readonly PresentedExercise[];
  empty: boolean;
  emptyGuidance?: string;
  legacyMarker?: { label: string; tooltip: string };
  canSave: true;
}

function approximateSessionDuration(range: MinutesRange): string {
  return numberText(Math.round((range[0] + range[1]) / 2));
}

/**
 * Estado sem número. A estimativa do motor é uma FAIXA; reduzi-la a um ponto na tela
 * principal produzia falsa precisão e chegou a contradizer o próprio estado — um plano
 * de [30, 40] exibia "aproximadamente 35 min" ao lado de "dentro de 36–44". A faixa
 * previsto continua disponível em `estimateDetail`, para "Ver tempo detalhado".
 */
function sessionStateLabel(state: SessionDurationState): string {
  if (state === "ABAIXO") return "Abaixo da faixa esperada";
  if (state === "DENTRO") return "Dentro da faixa esperada";
  return "Acima da faixa esperada";
}

/** Detalhe sob demanda: o tempo previsto e a faixa esperada para a meta. */
function sessionEstimateDetail(range: MinutesRange, targetMinutes: TargetMinutes, incomplete: boolean): string {
  const calculada = incomplete
    ? "Estimativa incompleta — parte dos exercícios não tem base para cálculo."
    : `Tempo previsto para este plano: ${formatMinutesRange(range)}.`;
  return `${calculada} Faixa esperada para esta meta: ${expectedRange(targetMinutes)}.`;
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
  const alerts = empty ? [] : presentInsights(interpreted.alerts, context);
  const state: SessionDurationState = empty ? "ABAIXO" : interpreted.durationState;
  return {
    prescribedMinutes,
    prescribedLabel: `Sessão de ${numberText(prescribedMinutes)} min`,
    targetLabel: `${numberText(prescribedMinutes)} minutos`,
    durationRange: interpreted.durationRange,
    estimateDetail: empty
      ? "Nenhum exercício selecionado."
      : sessionEstimateDetail(interpreted.durationRange, plan.targetMinutes, durationEstimateIncomplete),
    durationEstimateIncomplete,
    state,
    stateLabel: sessionStateLabel(state),
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
  const legacy = readLegacyPlan(rawPlan, requestedMinutes);
  const displayedMinutes = prescribedMinutes === undefined
    ? legacy.plan.targetMinutes
    : isTarget(prescribedMinutes) ? prescribedMinutes : legacy.plan.targetMinutes;
  const plan = displayedMinutes === legacy.plan.targetMinutes
    ? legacy.plan
    : { ...legacy.plan, targetMinutes: displayedMinutes };
  return planPresentation(
    plan,
    displayedMinutes,
    legacy.ignoredIds.length > 0 || hasUnresolvedLegacyParameter(rawPlan),
  );
}
