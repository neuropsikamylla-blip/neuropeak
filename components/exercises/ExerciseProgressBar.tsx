"use client";

import type { Theme } from "@/types";

/**
 * Barra de progresso PADRÃO dos exercícios — uma só, igual em todas as telas.
 * Fina e discreta (não compete com o exercício). A cor segue o tema do paciente
 * (clínico = azul, colorido = índigo, gamificado = ciano), mantendo o mesmo formato.
 * Use sempre com o `progressPct` vindo do useTimedProgress (tempo ativo).
 */
export function ExerciseProgressBar({ progressPct, theme }: { progressPct: number; theme?: Theme }) {
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const accent = isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
  const track = isG ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.22)";
  const label = isG ? "rgba(255,255,255,0.65)" : "#64748b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginBottom: 14 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 9999, background: track, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: accent, transition: "width 0.45s linear" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: label, minWidth: 30, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {progressPct}%
      </span>
    </div>
  );
}
