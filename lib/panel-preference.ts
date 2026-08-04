export type PanelId = "library" | "plan";

export interface PanelPreference {
  libraryOpen: boolean;
  planOpen: boolean;
}

export const DEFAULT_PANEL_PREFERENCE: PanelPreference = {
  libraryOpen: true,
  planOpen: true,
};

function isPanelPreference(value: unknown): value is PanelPreference {
  return (
    typeof value === "object" &&
    value !== null &&
    "libraryOpen" in value &&
    "planOpen" in value &&
    typeof value.libraryOpen === "boolean" &&
    typeof value.planOpen === "boolean" &&
    (value.libraryOpen || value.planOpen)
  );
}

/**
 * Normaliza somente os três estados visuais aceitos para os painéis do plano.
 * A leitura é deliberadamente pura para poder ser validada sem DOM.
 */
export function normalizePanelPreference(value: string | null): PanelPreference {
  if (!value) return DEFAULT_PANEL_PREFERENCE;

  try {
    const parsed: unknown = JSON.parse(value);
    if (isPanelPreference(parsed)) {
      return {
        libraryOpen: parsed.libraryOpen,
        planOpen: parsed.planOpen,
      };
    }
  } catch {
    // Valor corrompido ou storage indisponível: usa o estado seguro padrão.
  }

  return DEFAULT_PANEL_PREFERENCE;
}

/** Alterna um painel sem nunca permitir que ambos fiquem recolhidos. */
export function togglePanelPreference(current: PanelPreference, panel: PanelId): PanelPreference {
  const normalized = isPanelPreference(current) ? current : DEFAULT_PANEL_PREFERENCE;

  if (panel === "library") {
    return normalized.libraryOpen
      ? { libraryOpen: false, planOpen: true }
      : { ...normalized, libraryOpen: true };
  }

  return normalized.planOpen
    ? { libraryOpen: true, planOpen: false }
    : { ...normalized, planOpen: true };
}

/** Mantém somente um cartão de ajustes expandido por vez. */
export function toggleOpenExercise(current: string | null, exerciseId: string): string | null {
  return current === exerciseId ? null : exerciseId;
}
