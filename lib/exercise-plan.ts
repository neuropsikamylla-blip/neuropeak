// Normalização do campo `exercises` do TrainingPlan.
//
// Formato retrocompatível: cada item pode ser
//   - uma string (id do exercício, SEM config), ou
//   - um objeto { id, settings } (COM config do terapeuta).
// Planos antigos (lista de strings) continuam funcionando sem migração de banco.

export type PlanExerciseEntry = string | { id: string; settings?: Record<string, unknown> };

export interface NormalizedPlanExercise {
  id: string;
  settings?: Record<string, unknown>;
}

/** Aceita string JSON ou array já parseado; devolve a lista normalizada. */
export function parsePlanExercises(raw: unknown): NormalizedPlanExercise[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((e): NormalizedPlanExercise => {
    if (typeof e === "string") return { id: e };
    if (e && typeof e === "object" && typeof (e as { id?: unknown }).id === "string") {
      const obj = e as { id: string; settings?: Record<string, unknown> };
      return obj.settings ? { id: obj.id, settings: obj.settings } : { id: obj.id };
    }
    return { id: String(e) };
  });
}

/** Só os ids (para listas, checkboxes, validação). */
export function planExerciseIds(raw: unknown): string[] {
  return parsePlanExercises(raw).map(e => e.id);
}

/** Config do terapeuta para um exercício específico (se houver). */
export function planExerciseSettings(raw: unknown, id: string): Record<string, unknown> | undefined {
  return parsePlanExercises(raw).find(e => e.id === id)?.settings;
}

/** Monta o array para salvar: usa string quando não há config, objeto quando há. */
export function buildPlanExercises(
  ids: string[],
  settingsById: Record<string, Record<string, unknown> | undefined>,
): PlanExerciseEntry[] {
  return ids.map(id => {
    const s = settingsById[id];
    return s && Object.keys(s).length > 0 ? { id, settings: s } : id;
  });
}
