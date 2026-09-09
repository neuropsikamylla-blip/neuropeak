"use client";

import { useRef } from "react";
import type { Theme } from "@/types";

/**
 * Barra de progresso PADRÃO dos exercícios — uma só, igual em todas as telas.
 * Fina e discreta (não compete com o exercício). A cor segue o tema do paciente
 * (clínico = azul, colorido = índigo, gamificado = ciano), mantendo o mesmo formato.
 * Use sempre com `progressPct` temporal (tempo ativo).
 */
export function ExerciseProgressBar({ progressPct, theme, emTolerancia = false }: { progressPct: number; theme?: Theme; emTolerancia?: boolean }) {
  const greatestPct = useRef(0);
  greatestPct.current = Math.max(greatestPct.current, Math.max(0, Math.min(100, progressPct)));
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const accent = emTolerancia
    ? isG ? "rgba(34,211,238,0.55)" : isC ? "rgba(99,102,241,0.55)" : "rgba(59,130,246,0.55)"
    : isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
  const track = isG ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.22)";
  return (
    <div style={{ width: "100%", marginBottom: 14 }}>
      <div style={{ width: "100%", height: 6, borderRadius: 9999, background: track, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${emTolerancia ? 100 : greatestPct.current}%`, background: accent, transition: "width 0.45s linear" }} />
      </div>
    </div>
  );
}
