// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — normalização das settings da prescrição (spec §7/§12).
//
// A config chega do JSON do plano como Record<string, unknown> (via
// planExerciseSettings). Normalizamos com defaults e validação de tipo, no mesmo
// padrão do SpanNumerico (normalizeSettings).
// ─────────────────────────────────────────────────────────────────────────────

import type { CaminhosSettings } from "@/types/caminhos-meta";

/** Defaults seguros — treino domiciliar: dicas/áudio/desfazer ligados, feedback imediato. */
export const DEFAULT_CAMINHOS_SETTINGS: CaminhosSettings = {
  atividadesSelecionadas: [],
  rodadas: 1,
  dicasHabilitadas: true,
  audioHabilitado: true,
  maxTentativas: 2,
  permitirDesfazer: true,
  feedbackImediato: true,
  ordemFixa: true,
};

function asStringArray(v: unknown): string[] | null {
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v as string[];
  return null;
}

/** Normaliza a config vinda do JSON do plano com padrões (prescrição do terapeuta). */
export function normalizeCaminhosSettings(s?: Record<string, unknown>): CaminhosSettings {
  const d = DEFAULT_CAMINHOS_SETTINGS;
  // aceita tanto `atividadesSelecionadas` quanto `atividades` (apelido comum no plano)
  const ativ =
    asStringArray(s?.atividadesSelecionadas) ??
    asStringArray(s?.atividades) ??
    d.atividadesSelecionadas;
  return {
    atividadesSelecionadas: ativ,
    rodadas: typeof s?.rodadas === "number" && s.rodadas > 0 ? Math.floor(s.rodadas) : d.rodadas,
    dicasHabilitadas: typeof s?.dicasHabilitadas === "boolean" ? s.dicasHabilitadas : d.dicasHabilitadas,
    audioHabilitado: typeof s?.audioHabilitado === "boolean" ? s.audioHabilitado : d.audioHabilitado,
    maxTentativas:
      typeof s?.maxTentativas === "number" && s.maxTentativas >= 1
        ? Math.floor(s.maxTentativas)
        : d.maxTentativas,
    permitirDesfazer: typeof s?.permitirDesfazer === "boolean" ? s.permitirDesfazer : d.permitirDesfazer,
    feedbackImediato: typeof s?.feedbackImediato === "boolean" ? s.feedbackImediato : d.feedbackImediato,
    ordemFixa: typeof s?.ordemFixa === "boolean" ? s.ordemFixa : d.ordemFixa,
  };
}

/** Nº de prioridades a selecionar no modo `prioridade`. */
export function limitePrioridade(s?: Record<string, unknown>, fallback = 3): number {
  const v = s?.limiteEscolhas ?? s?.limitePrioridade;
  return typeof v === "number" && v >= 1 ? Math.floor(v) : fallback;
}
