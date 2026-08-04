"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PANEL_PREFERENCE,
  normalizePanelPreference,
  togglePanelPreference,
  type PanelId,
  type PanelPreference,
} from "@/lib/panel-preference";

const STORAGE_KEY = "np-plano-paineis";

/**
 * Persiste a preferência visual depois da hidratação. O estado inicial é fixo
 * para coincidir entre servidor e cliente.
 */
export function usePanelPreference() {
  const [panels, setPanels] = useState<PanelPreference>(DEFAULT_PANEL_PREFERENCE);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    try {
      setPanels(normalizePanelPreference(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setPanels(DEFAULT_PANEL_PREFERENCE);
    }
    setPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferenceLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
    } catch {
      // Modo restrito: a tela continua funcional sem persistência local.
    }
  }, [panels, preferenceLoaded]);

  const togglePanel = useCallback((panel: PanelId) => {
    setPanels((current) => togglePanelPreference(current, panel));
  }, []);

  return { panels, togglePanel };
}
