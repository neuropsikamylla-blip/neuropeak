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

// Exercícios fundidos/aposentados → id atual. Planos antigos são convertidos
// na leitura (sem migração de banco). "desafio-orcamento" foi fundido na
// "compra-multifuncional" (que já cobre orçamento + categoria + quantidade + tempo).
const EXERCISE_ALIASES: Record<string, string> = {
  "desafio-orcamento": "compra-multifuncional",
  // Modos visual/auditivo unificados: o -auditivo virou um MODO interno (tela
  // "Configurar atividade"). Planos antigos abrem o exercício único na leitura.
  "restaurante-ordem-auditivo": "restaurante-ordem",
  "desafio-supermercado-auditivo": "desafio-supermercado",
  "focus-agents-auditivo": "focus-agents",
};

/** Aceita string JSON ou array já parseado; devolve a lista normalizada
 *  (aliases de exercícios fundidos aplicados + deduplicada, preservando a ordem). */
export function parsePlanExercises(raw: unknown): NormalizedPlanExercise[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) return [];

  const seen = new Set<string>();
  const out: NormalizedPlanExercise[] = [];
  for (const e of arr) {
    let entry: NormalizedPlanExercise;
    if (typeof e === "string") entry = { id: e };
    else if (e && typeof e === "object" && typeof (e as { id?: unknown }).id === "string") {
      const obj = e as { id: string; settings?: Record<string, unknown> };
      entry = obj.settings ? { id: obj.id, settings: obj.settings } : { id: obj.id };
    } else entry = { id: String(e) };

    const id = EXERCISE_ALIASES[entry.id] ?? entry.id;
    if (seen.has(id)) continue; // dedupe (ex.: plano que tinha os dois antes da fusão)
    seen.add(id);
    out.push(entry.settings ? { id, settings: entry.settings } : { id });
  }
  return out;
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
