// Estilos compartilhados dos componentes sociais — mesma linguagem visual dos
// demais exercícios (paleta por tema CLINICAL/COLORFUL/GAMIFIED).
import type React from "react";
import type { Theme } from "@/types";

export interface SocialStyles {
  isG: boolean; isC: boolean;
  rootBg: React.CSSProperties;
  card: React.CSSProperties;
  btn: React.CSSProperties;
  box: React.CSSProperties;
  chip: React.CSSProperties;
  pal: { title: string; sub: string; accent: string };
}

export function socialStyles(theme: Theme): SocialStyles {
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  return {
    isG, isC,
    rootBg: isG
      ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
      : isC ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
      : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" },
    card: isG
      ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
      : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" },
    btn: isG
      ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
      : isC ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
      : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" },
    box: isG
      ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }
      : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" },
    chip: isG
      ? { background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#e0f2fe" }
      : { background: "#eef6ff", border: "1.5px solid rgba(8,145,178,0.25)", color: "#0e7490" },
    pal: {
      title: isG ? "text-white" : "text-[#1a2744]",
      sub: isG ? "text-white/70" : "text-[#8a7a6a]",
      accent: isG ? "text-cyan-300" : "text-emerald-600",
    },
  };
}
