import { TARGET_DURATION_BOUNDS } from "./duration";
import { HIGH_FATIGUE_CAP, LOAD_REFERENCE, PLANNING_WINDOW_CAP } from "./load";
import type { AlertCode, PrescriptionAlert, ResolvedExercisePrescription, TargetMinutes } from "./types";

export interface ValidationInput {
  targetMinutes: TargetMinutes;
  durationRange: readonly [number, number];
  baselineLoad: number;
  exercises: readonly ResolvedExercisePrescription[];
}

const text = (value: number) => Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
const rangeText = ([min, max]: readonly [number, number]) => `${text(min)}–${text(max)} min`;

export function validateComposition(input: ValidationInput): PrescriptionAlert[] {
  const { exercises, targetMinutes, durationRange } = input;
  const bounds = TARGET_DURATION_BOUNDS[targetMinutes];
  const collected: { position: number; alert: PrescriptionAlert }[] = [];
  const alert = (code: AlertCode, severity: PrescriptionAlert["severity"], message: string, exerciseIds: readonly string[] = [], position = 0) => {
    collected.push({ position, alert: { code, severity, message, exerciseIds, blocksSave: false } });
  };
  const names = (exercise: ResolvedExercisePrescription) => exercise.definition.officialName;

  if (durationRange[1] < bounds.floor) alert("SESSION_BELOW_TARGET", "atencao", `Sessão ${rangeText(durationRange)}, abaixo do esperado ${bounds.floor}–${bounds.ceiling} min.`);
  if (durationRange[1] > bounds.ceiling && durationRange[1] <= bounds.maximum) alert("SESSION_ABOVE_TARGET", "atencao", `Estimativa em atenção acima de ${bounds.ceiling} min; máximo ${bounds.maximum} min.`);
  if (durationRange[0] <= bounds.ceiling && durationRange[1] >= bounds.floor && (durationRange[0] < bounds.floor || durationRange[1] > bounds.ceiling)) {
    alert("SESSION_RANGE_PARTIAL", "informativa", `Alcança o esperado, mas pode terminar fora de ${bounds.floor}–${bounds.ceiling} min.`);
  }
  if (durationRange[1] > bounds.maximum) alert("SESSION_SAFE_MAX_EXCEEDED", "atencao", `Extremo superior em excesso importante acima de ${bounds.maximum} min.`);

  const loadReference = LOAD_REFERENCE[targetMinutes];
  if (input.baselineLoad === loadReference) alert("LOAD_AT_CAP", "informativa", `Carga basal ${input.baselineLoad} na referência ${loadReference}; revise os eixos.`);
  if (input.baselineLoad > loadReference) alert("LOAD_OVER_CAP", "atencao", `Carga basal ${input.baselineLoad} acima da referência ${loadReference}; revise os eixos.`);

  const highFatigue = exercises.filter((exercise) => exercise.definition.fatigue === "ALTA");
  const fatigueCap = HIGH_FATIGUE_CAP[targetMinutes];
  if (highFatigue.length > fatigueCap) alert("HIGH_FATIGUE_COUNT", "atencao", `Há ${highFatigue.length} altas; máximo recomendado ${fatigueCap}.`, highFatigue.map((exercise) => exercise.definition.exerciseId), exercises.indexOf(highFatigue[0]));
  const last = exercises.at(-1);
  if (last?.definition.fatigue === "ALTA") alert("HIGH_FATIGUE_POSITION", "atencao", `${names(last)} fecha apesar de fadiga alta.`, [last.definition.exerciseId], exercises.length - 1);

  for (let index = 0; index < exercises.length - 1; index += 1) {
    const [left, right] = [exercises[index], exercises[index + 1]];
    const ids = [left.definition.exerciseId, right.definition.exerciseId];
    if (left.definition.fatigue === "ALTA" && right.definition.fatigue === "ALTA") alert("HIGH_FATIGUE_ADJACENT", "atencao", `${names(left)} e ${names(right)} sem atividade intermediária.`, ids, index);
    if (left.definition.interference === "ALTA" && right.definition.interference === "ALTA") alert("HIGH_INTERFERENCE_ADJACENT", "atencao", `${names(left)} e ${names(right)} têm interferência alta em sequência.`, ids, index);
    if (isAuditorySequenceExercise(left) && isAuditorySequenceExercise(right)) alert("AUDITORY_ONLY_ADJACENT", "atencao", `${names(left)} e ${names(right)} formam sequência auditiva sem outro canal.`, ids, index);
    if (left.definition.executionModel === "PLANNING_WINDOW" && right.definition.executionModel === "PLANNING_WINDOW") alert("PLANNING_WINDOW_ADJACENT", "atencao", `${names(left)} e ${names(right)} consecutivos; considere CONTINUOUS_TIMED ou CLOSED_PROTOCOL.`, ids, index);
  }

  if (exercises.length >= 3) {
    const primaryCounts = new Map<string, number>();
    for (const exercise of exercises) primaryCounts.set(exercise.definition.mechanicalPrimary, (primaryCounts.get(exercise.definition.mechanicalPrimary) ?? 0) + 1);
    const primary = [...primaryCounts.entries()].find(([, count]) => count >= Math.ceil((2 * exercises.length) / 3));
    const signatures = exercises.map((exercise) => new Set([exercise.definition.mechanicalPrimary, ...exercise.definition.associatedCognitiveProfiles]));
    const common = [...signatures[0]].find((process) => signatures.every((signature) => signature.has(process)));
    if (primary || common) {
      const process = primary?.[0] ?? common!;
      const evidence = primary ? `${primary[1]} de ${exercises.length} exercícios têm este processo como principal` : `presente na assinatura dos ${exercises.length} exercícios`;
      alert("COGNITIVE_CONCENTRATION", "atencao", `Composição concentrada em ${process}: ${evidence}.`);
    }
  }

  const planning = exercises.filter((exercise) => exercise.definition.executionModel === "PLANNING_WINDOW");
  const planningCap = PLANNING_WINDOW_CAP[targetMinutes];
  if (planning.length > planningCap) alert("PLANNING_WINDOW_COUNT", "atencao", `Há ${planning.length} janelas; teto ${planningCap}.`, planning.map((exercise) => exercise.definition.exerciseId), exercises.indexOf(planning[0]));

  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index];
    const position = index === 0 ? "OPEN" : index === exercises.length - 1 ? "CLOSE" : "MIDDLE";
    const eligibility = exercise.definition.sessionEligibility;
    if (position === "OPEN" && !eligibility.canOpen) alert("OPEN_POSITION_NOT_ELIGIBLE", "atencao", `${names(exercise)} está na abertura não elegível.`, [exercise.definition.exerciseId], index);
    if (position === "CLOSE" && !eligibility.canClose) alert("CLOSE_POSITION_NOT_ELIGIBLE", "atencao", `${names(exercise)} está no fechamento não elegível.`, [exercise.definition.exerciseId], index);
    const closeByBrief = position === "CLOSE" && eligibility.preferredCloseProtocol === "BREVE" && exercise.prescription.dose?.kind === "protocol" && exercise.prescription.dose.protocol === "BREVE";
    if (!eligibility.preferredPositions.includes(position) && !closeByBrief) alert("OUTSIDE_BEST_POSITION", "informativa", `${names(exercise)} pode ocupar a posição, mas prefere ${eligibility.preferredPositionNote}.`, [exercise.definition.exerciseId], index);
  }

  const seenBadPairs = new Set<string>();
  const idsInPlan = new Set(exercises.map((exercise) => exercise.definition.exerciseId));
  for (let index = 0; index < exercises.length; index += 1) {
    const exercise = exercises[index];
    for (const combination of exercise.definition.sessionEligibility.badCombinations) {
      if (!idsInPlan.has(combination.exerciseId)) continue;
      const pair = [exercise.definition.exerciseId, combination.exerciseId].sort();
      const key = pair.join("|");
      if (seenBadPairs.has(key)) continue;
      seenBadPairs.add(key);
      const other = exercises.find((candidate) => candidate.definition.exerciseId === combination.exerciseId);
      alert("DECLARED_BAD_COMBINATION", "atencao", `${names(exercise)} e ${other ? names(other) : combination.exerciseId}: ${combination.reason}`, pair, index);
    }
  }
  return collected.sort((left, right) => left.position - right.position || left.alert.code.localeCompare(right.alert.code)).map(({ alert: result }) => result);
}

function isAuditorySequenceExercise(exercise: ResolvedExercisePrescription): boolean {
  return exercise.prescription.presentationMode === "audioOnly" || exercise.definition.exerciseId === "span-numerico" || exercise.definition.exerciseId === "span-numerico-inverso";
}
