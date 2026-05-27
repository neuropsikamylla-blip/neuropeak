"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

type AgeMode = "child" | "teen" | "adult";

interface CharAttrs {
  colorId: string;
  colorHex: string;
  colorLabel: string;
  hatId: string | null;
  hatLabel: string | null;
  extraId: string | null;   // child: óculos/mochila/gravata | teen: mochila/máscara/luvas | adult: crachá-X
  extraLabel: string | null;
  symbolId: string | null;
  symbolLabel: string | null;
}

interface AgentChar {
  id: string;
  attrs: CharAttrs;
  isTarget: boolean;
}

// ── Palettes ─────────────────────────────────────────────────────────────────

type Def = { id: string; label: string };
type ColorDef = Def & { hex: string };

const COLORS: Record<AgeMode, ColorDef[]> = {
  child: [
    { id: "amarelo",   hex: "#FFD600", label: "amarelo" },
    { id: "azul",      hex: "#1E88E5", label: "azul" },
    { id: "verde",     hex: "#43A047", label: "verde" },
    { id: "vermelho",  hex: "#E53935", label: "vermelho" },
    { id: "roxo",      hex: "#8E24AA", label: "roxo" },
    { id: "laranja",   hex: "#FB8C00", label: "laranja" },
    { id: "rosa",      hex: "#E91E63", label: "rosa" },
    { id: "cinza",     hex: "#78909C", label: "cinza" },
  ],
  teen: [
    { id: "preto",     hex: "#1e1e2e", label: "preto" },
    { id: "neon-azul", hex: "#00B4D8", label: "azul" },
    { id: "neon-verde",hex: "#06D6A0", label: "verde" },
    { id: "vermelho",  hex: "#EF233C", label: "vermelho" },
    { id: "roxo",      hex: "#7B2FBE", label: "roxo" },
    { id: "branco",    hex: "#DDE1F0", label: "branco" },
    { id: "laranja",   hex: "#F97316", label: "laranja" },
    { id: "cinza",     hex: "#475569", label: "cinza" },
  ],
  adult: [
    { id: "azul",      hex: "#1565C0", label: "azul" },
    { id: "cinza",     hex: "#546E7A", label: "cinza" },
    { id: "preto",     hex: "#37474F", label: "preto" },
    { id: "verde",     hex: "#2E7D32", label: "verde" },
    { id: "branco",    hex: "#CFD8DC", label: "branco" },
    { id: "marrom",    hex: "#5D4037", label: "marrom" },
  ],
};

const HATS: Record<AgeMode, Def[]> = {
  child: [
    { id: "chapeu",   label: "chapéu" },
    { id: "bone",     label: "boné" },
    { id: "coroa",    label: "coroa" },
    { id: "antena",   label: "antena" },
  ],
  teen: [
    { id: "capuz",    label: "capuz" },
    { id: "headset",  label: "headset" },
    { id: "bone",     label: "boné" },
    { id: "visor",    label: "óculos escuros" },
  ],
  adult: [
    { id: "headset",  label: "headset" },
    { id: "bone",     label: "boné" },
    { id: "oculos",   label: "óculos" },
    { id: "chapeu",   label: "chapéu" },
  ],
};

const EXTRAS: Record<AgeMode, Def[]> = {
  child: [
    { id: "mochila",  label: "mochila" },
    { id: "gravata",  label: "gravata-borboleta" },
    { id: "oculos",   label: "óculos" },
  ],
  teen: [
    { id: "mochila",  label: "mochila" },
    { id: "mascara",  label: "máscara" },
    { id: "luvas",    label: "luvas" },
  ],
  adult: [
    { id: "badge-azul",     label: "crachá azul" },
    { id: "badge-verde",    label: "crachá verde" },
    { id: "badge-vermelho", label: "crachá vermelho" },
    { id: "badge-amarelo",  label: "crachá amarelo" },
  ],
};

const SYMBOLS: Record<AgeMode, Def[]> = {
  child: [
    { id: "estrela",  label: "estrela" },
    { id: "coracao",  label: "coração" },
    { id: "raio",     label: "raio" },
  ],
  teen: [
    { id: "raio",     label: "raio" },
    { id: "x-mark",   label: "X" },
    { id: "diamante", label: "diamante" },
    { id: "caveira",  label: "caveira" },
  ],
  adult: [
    { id: "triangulo",label: "triângulo" },
    { id: "circulo",  label: "círculo" },
    { id: "quadrado", label: "quadrado" },
    { id: "estrela",  label: "estrela" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickExcl<T extends { id: string }>(arr: T[], excl: string | null): T {
  const f = excl ? arr.filter(x => x.id !== excl) : arr;
  return pick(f.length ? f : arr);
}
function getMode(theme: Theme): AgeMode {
  if (theme === "COLORFUL") return "child";
  if (theme === "GAMIFIED") return "teen";
  return "adult";
}
function numChars(d: number): number {
  if (d <= 2) return 6; if (d <= 4) return 8; if (d <= 6) return 10; if (d <= 8) return 12; return 15;
}
function numAttrs(d: number): number {
  if (d <= 2) return 1; if (d <= 5) return 2; if (d <= 8) return 3; return 4;
}
function timerSec(d: number): number | null {
  if (d <= 3) return null; if (d <= 4) return 25; if (d <= 5) return 22; if (d <= 6) return 20;
  if (d <= 7) return 17; if (d <= 8) return 15; if (d <= 9) return 12; return 10;
}

// ── Character generation ──────────────────────────────────────────────────────

function makeTargetAttrs(mode: AgeMode, n: number): CharAttrs {
  const c = pick(COLORS[mode]);
  const h = n >= 2 ? pick(HATS[mode]) : null;
  const e = n >= 3 ? pick(EXTRAS[mode]) : null;
  const s = n >= 4 ? pick(SYMBOLS[mode]) : null;
  return {
    colorId: c.id, colorHex: c.hex, colorLabel: c.label,
    hatId: h?.id ?? null, hatLabel: h?.label ?? null,
    extraId: e?.id ?? null, extraLabel: e?.label ?? null,
    symbolId: s?.id ?? null, symbolLabel: s?.label ?? null,
  };
}

function makeDistractorAttrs(target: CharAttrs, mode: AgeMode, n: number, smart: boolean): CharAttrs {
  if (smart && n >= 2) {
    // Mutate exactly 1 attribute to create a "near miss"
    const slot = Math.floor(Math.random() * n);
    const c = slot === 0 ? pickExcl(COLORS[mode], target.colorId) : COLORS[mode].find(x => x.id === target.colorId)!;
    const h = n >= 2 ? (slot === 1 ? pickExcl(HATS[mode], target.hatId) : HATS[mode].find(x => x.id === target.hatId)) : null;
    const e = n >= 3 ? (slot === 2 ? pickExcl(EXTRAS[mode], target.extraId) : EXTRAS[mode].find(x => x.id === target.extraId)) : null;
    const s = n >= 4 ? (slot === 3 ? pickExcl(SYMBOLS[mode], target.symbolId) : SYMBOLS[mode].find(x => x.id === target.symbolId)) : null;
    const safeC = c ?? pick(COLORS[mode]);
    return {
      colorId: safeC.id, colorHex: safeC.hex, colorLabel: safeC.label,
      hatId: h?.id ?? null, hatLabel: h?.label ?? null,
      extraId: e?.id ?? null, extraLabel: e?.label ?? null,
      symbolId: s?.id ?? null, symbolLabel: s?.label ?? null,
    };
  }
  // Random: ensure at least color is different
  const c = pickExcl(COLORS[mode], target.colorId);
  const h = n >= 2 ? pick(HATS[mode]) : null;
  const e = n >= 3 ? pick(EXTRAS[mode]) : null;
  const s = n >= 4 ? pick(SYMBOLS[mode]) : null;
  return {
    colorId: c.id, colorHex: c.hex, colorLabel: c.label,
    hatId: h?.id ?? null, hatLabel: h?.label ?? null,
    extraId: e?.id ?? null, extraLabel: e?.label ?? null,
    symbolId: s?.id ?? null, symbolLabel: s?.label ?? null,
  };
}

function buildCommand(mode: AgeMode, a: CharAttrs, n: number): string {
  if (mode === "child") {
    let s = `Clique na criaturinha ${a.colorLabel}`;
    if (n >= 2 && a.hatLabel) s += ` com ${a.hatLabel}`;
    if (n >= 3 && a.extraLabel) {
      if (a.extraId === "oculos") s += ` e óculos`;
      else s += ` e ${a.extraLabel}`;
    }
    if (n >= 4 && a.symbolLabel) s += ` e ${a.symbolLabel} no corpo`;
    return s;
  }
  if (mode === "teen") {
    let s = `Clique no avatar ${a.colorLabel}`;
    if (n >= 2 && a.hatLabel) s += ` com ${a.hatLabel}`;
    if (n >= 3 && a.extraLabel) s += ` e ${a.extraLabel}`;
    if (n >= 4 && a.symbolLabel) s += ` e símbolo ${a.symbolLabel}`;
    return s;
  }
  let s = `Selecione o agente com uniforme ${a.colorLabel}`;
  if (n >= 2 && a.extraLabel) s += ` e ${a.extraLabel}`;
  if (n >= 3 && a.hatLabel) s += ` e ${a.hatLabel}`;
  if (n >= 4 && a.symbolLabel) s += ` com símbolo ${a.symbolLabel}`;
  return s;
}

function generateRound(mode: AgeMode, d: number): { chars: AgentChar[]; command: string; targetId: string } {
  const n = numChars(d);
  const na = numAttrs(d);
  const target = makeTargetAttrs(mode, na);
  const smart = d >= 6;
  const smartCount = smart ? Math.min(3, Math.floor(n * 0.35)) : 0;

  const distractors: CharAttrs[] = [];
  for (let i = 0; i < smartCount; i++) distractors.push(makeDistractorAttrs(target, mode, na, true));
  while (distractors.length < n - 1) distractors.push(makeDistractorAttrs(target, mode, na, false));

  const chars: AgentChar[] = [
    { id: "target", attrs: target, isTarget: true },
    ...distractors.slice(0, n - 1).map((attrs, i) => ({ id: `d${i}`, attrs, isTarget: false })),
  ].sort(() => Math.random() - 0.5);

  return { chars, command: buildCommand(mode, target, na), targetId: "target" };
}

// ── Speech ────────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR"; u.rate = 0.88; u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

// ── Child Creature SVG ────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  "badge-azul": "#1565C0", "badge-verde": "#2E7D32",
  "badge-vermelho": "#C62828", "badge-amarelo": "#F9A825",
};

function ChildSvg({ a, size = 80 }: { a: CharAttrs; size?: number }) {
  const c = a.colorHex;
  const dark = "rgba(0,0,0,0.22)";
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="overflow-visible">
      {/* Mochila (backpack behind body) */}
      {a.extraId === "mochila" && (
        <g>
          <rect x="5" y="36" width="13" height="18" rx="3" fill="#8B6914"/>
          <rect x="6" y="38" width="11" height="14" rx="2" fill="#A07820"/>
          <rect x="8" y="41" width="7" height="2" rx="1" fill="#8B6914"/>
          <rect x="8" y="45" width="7" height="2" rx="1" fill="#8B6914"/>
        </g>
      )}
      {/* Body */}
      <ellipse cx="40" cy="53" rx="31" ry="26" fill={c}/>
      <ellipse cx="40" cy="53" rx="31" ry="26" fill="none" stroke={dark} strokeWidth="1.5"/>
      {/* Body highlight */}
      <ellipse cx="29" cy="42" rx="10" ry="6" fill="rgba(255,255,255,0.18)"/>
      {/* Bow tie */}
      {a.extraId === "gravata" && (
        <g transform="translate(40,71)">
          <polygon points="-9,-4 0,0 -9,4" fill="#E53935"/>
          <polygon points="9,-4 0,0 9,4" fill="#C62828"/>
          <circle cx="0" cy="0" r="3" fill="#B71C1C"/>
        </g>
      )}
      {/* Symbol on body */}
      {a.symbolId === "estrela" && (
        <polygon points="40,56 42.4,63.4 50.2,63.4 44,68 46.4,75.4 40,71 33.6,75.4 36,68 29.8,63.4 37.6,63.4"
          fill="#FFD600" opacity="0.9" transform="scale(0.55) translate(33,38)"/>
      )}
      {a.symbolId === "coracao" && (
        <path d="M40 67 C40 67 32 61 32 56 C32 53 36 51 40 56 C44 51 48 53 48 56 C48 61 40 67 40 67Z"
          fill="#E91E63" opacity="0.9"/>
      )}
      {a.symbolId === "raio" && (
        <polygon points="43,53 38,61 41.5,59 37,68 45,58 41,60" fill="#FFD600" opacity="0.95"/>
      )}
      {/* Left eye */}
      <circle cx="28" cy="48" r="8" fill="white"/>
      <circle cx="29.5" cy="48.5" r="4.5" fill="#1a1a1a"/>
      <circle cx="31" cy="46.5" r="1.8" fill="white"/>
      {/* Right eye */}
      <circle cx="52" cy="48" r="8" fill="white"/>
      <circle cx="53.5" cy="48.5" r="4.5" fill="#1a1a1a"/>
      <circle cx="55" cy="46.5" r="1.8" fill="white"/>
      {/* Nose */}
      <circle cx="40" cy="56" r="2.2" fill={dark}/>
      {/* Smile */}
      <path d="M 31 63 Q 40 72 49 63" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.8" strokeLinecap="round"/>
      {/* Glasses (extra=oculos) */}
      {a.extraId === "oculos" && (
        <g>
          <circle cx="28" cy="48" r="10.5" fill="none" stroke="#222" strokeWidth="2.2"/>
          <circle cx="52" cy="48" r="10.5" fill="none" stroke="#222" strokeWidth="2.2"/>
          <line x1="38.5" y1="48" x2="41.5" y2="48" stroke="#222" strokeWidth="2.2"/>
          <line x1="17.5" y1="45" x2="22" y2="43.5" stroke="#222" strokeWidth="1.8"/>
          <line x1="58" y1="43.5" x2="62.5" y2="45" stroke="#222" strokeWidth="1.8"/>
        </g>
      )}
      {/* HAT: chapéu */}
      {a.hatId === "chapeu" && (
        <g>
          <ellipse cx="40" cy="24" rx="20" ry="5" fill="#1a1a1a"/>
          <polygon points="40,2 27,24 53,24" fill="#2a2a2a"/>
          <ellipse cx="40" cy="24" rx="15" ry="3.5" fill="#333"/>
        </g>
      )}
      {/* HAT: boné */}
      {a.hatId === "bone" && (
        <g>
          <path d="M20 22 Q20 8 40 8 Q60 8 60 22" fill="#333"/>
          <rect x="20" y="18" width="40" height="9" rx="5" fill="#444"/>
          <rect x="12" y="20" width="16" height="6" rx="3" fill="#555"/>
          <circle cx="40" cy="11" r="3" fill="#555"/>
        </g>
      )}
      {/* HAT: coroa */}
      {a.hatId === "coroa" && (
        <g>
          <rect x="22" y="18" width="36" height="9" rx="1" fill="#FFD700"/>
          <polygon points="22,18 22,7 31,16 40,7 49,16 58,7 58,18" fill="#FFD700"/>
          <rect x="22" y="22" width="36" height="5" rx="1" fill="#FFC107"/>
          <circle cx="40" cy="14" r="2.5" fill="#E53935"/>
          <circle cx="28" cy="18" r="2" fill="#2196F3"/>
          <circle cx="52" cy="18" r="2" fill="#2196F3"/>
        </g>
      )}
      {/* HAT: antena */}
      {a.hatId === "antena" && (
        <g>
          <line x1="40" y1="22" x2="40" y2="5" stroke="#777" strokeWidth="2.5"/>
          <circle cx="40" cy="3.5" r="4.5" fill="#E53935"/>
          <circle cx="40" cy="3.5" r="2" fill="#FF8A80"/>
        </g>
      )}
    </svg>
  );
}

// ── Teen Avatar SVG ───────────────────────────────────────────────────────────

function TeenSvg({ a, size = 80 }: { a: CharAttrs; size?: number }) {
  const c = a.colorHex;
  const isLight = c === "#DDE1F0";
  const textOnBg = isLight ? "#1a1a2e" : "rgba(255,255,255,0.8)";
  const skinTone = "#FFDCC0";
  return (
    <svg width={size} height={size} viewBox="0 0 80 90" className="overflow-visible">
      {/* Mochila */}
      {a.extraId === "mochila" && (
        <rect x="55" y="42" width="12" height="20" rx="3" fill={isLight ? "#555" : "#222"} opacity="0.85"/>
      )}
      {/* Body/hoodie */}
      <path d="M18 50 Q14 58 16 80 L64 80 Q66 58 62 50 Q55 41 40 39 Q25 41 18 50Z" fill={c}/>
      {/* Hoodie front panel (darker center strip) */}
      <path d="M35 39 L35 80 L45 80 L45 39Z" fill="rgba(0,0,0,0.12)"/>
      {/* Pocket */}
      <rect x="30" y="62" width="20" height="12" rx="2" fill="rgba(0,0,0,0.15)"/>
      {/* Capuz raised (when capuz) */}
      {a.hatId === "capuz" && (
        <path d="M22 45 Q22 28 40 26 Q58 28 58 45 Q55 40 40 38 Q25 40 22 45Z" fill={c} opacity="0.75"/>
      )}
      {/* Neck/collar */}
      <path d="M32 39 Q40 36 48 39 L47 44 Q40 42 33 44Z" fill="rgba(0,0,0,0.2)"/>
      {/* HEAD */}
      <circle cx="40" cy="26" r="17" fill={skinTone}/>
      {/* Hair */}
      <path d="M23 26 Q23 9 40 9 Q57 9 57 26 Q53 17 40 17 Q27 17 23 26Z" fill="#2d1b00"/>
      {/* Eyes */}
      <ellipse cx="33" cy="26" rx="3" ry="3.5" fill="#1a1a1a"/>
      <ellipse cx="47" cy="26" rx="3" ry="3.5" fill="#1a1a1a"/>
      <circle cx="34.5" cy="24.5" r="1.2" fill="white"/>
      <circle cx="48.5" cy="24.5" r="1.2" fill="white"/>
      {/* Eyebrows */}
      <path d="M29 21 Q33 19.5 37 21" fill="none" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M43 21 Q47 19.5 51 21" fill="none" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Nose */}
      <path d="M38 30 Q40 33 42 30" fill="none" stroke="#C49A7A" strokeWidth="1.3"/>
      {/* Mouth */}
      <path d="M35 36 Q40 40 45 36" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Visor/sunglasses */}
      {a.hatId === "visor" && (
        <g>
          <rect x="25" y="21" width="13" height="9" rx="3.5" fill="#111" opacity="0.92"/>
          <rect x="42" y="21" width="13" height="9" rx="3.5" fill="#111" opacity="0.92"/>
          <line x1="38" y1="25" x2="42" y2="25" stroke="#333" strokeWidth="2"/>
          <line x1="22" y1="24" x2="25" y2="24" stroke="#555" strokeWidth="1.5"/>
          <line x1="55" y1="24" x2="58" y2="24" stroke="#555" strokeWidth="1.5"/>
          {/* Lens sheen */}
          <rect x="26" y="22" width="5" height="2" rx="1" fill="rgba(255,255,255,0.12)"/>
          <rect x="43" y="22" width="5" height="2" rx="1" fill="rgba(255,255,255,0.12)"/>
        </g>
      )}
      {/* Headset */}
      {a.hatId === "headset" && (
        <g>
          <path d="M21 24 Q21 9 40 9 Q59 9 59 24" fill="none" stroke="#333" strokeWidth="3.5"/>
          <rect x="17" y="20" width="9" height="14" rx="3.5" fill="#555"/>
          <rect x="54" y="20" width="9" height="14" rx="3.5" fill="#555"/>
          <line x1="17" y1="30" x2="11" y2="36" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="11" cy="37" r="2.5" fill="#333"/>
        </g>
      )}
      {/* Boné */}
      {a.hatId === "bone" && (
        <g>
          <path d="M22 22 Q22 9 40 9 Q58 9 58 22" fill={isLight ? "#555" : "#1a1a2e"}/>
          <rect x="22" y="19" width="36" height="8" rx="4" fill={isLight ? "#666" : "#2a2a3e"}/>
          <rect x="16" y="21" width="18" height="5" rx="2.5" fill={isLight ? "#777" : "#333"}/>
          <circle cx="40" cy="12" r="2.5" fill={isLight ? "#888" : "#444"}/>
        </g>
      )}
      {/* Máscara */}
      {a.extraId === "mascara" && (
        <g>
          <rect x="27" y="30" width="26" height="16" rx="5" fill="#00B4D8" opacity="0.88"/>
          <line x1="29" y1="37" x2="51" y2="37" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
          <path d="M33 34 Q40 32 47 34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
        </g>
      )}
      {/* Luvas */}
      {a.extraId === "luvas" && (
        <g>
          <ellipse cx="14" cy="64" rx="7" ry="9" fill="#7B2FBE" opacity="0.9"/>
          <ellipse cx="66" cy="64" rx="7" ry="9" fill="#7B2FBE" opacity="0.9"/>
        </g>
      )}
      {/* Chest symbol */}
      {a.symbolId === "raio" && (
        <polygon points="43,51 38,62 42,59 38,72 46,59 41.5,62" fill="#FFD600" opacity="0.9"/>
      )}
      {a.symbolId === "x-mark" && (
        <g stroke={textOnBg} strokeWidth="3" strokeLinecap="round">
          <line x1="33" y1="51" x2="47" y2="65"/><line x1="47" y1="51" x2="33" y2="65"/>
        </g>
      )}
      {a.symbolId === "diamante" && (
        <polygon points="40,50 49,60 40,70 31,60" fill={textOnBg} opacity="0.85"/>
      )}
      {a.symbolId === "caveira" && (
        <text x="40" y="67" textAnchor="middle" fontSize="18" fill={textOnBg} opacity="0.8">☠</text>
      )}
    </svg>
  );
}

// ── Adult Agent SVG ───────────────────────────────────────────────────────────

function AdultSvg({ a, size = 80 }: { a: CharAttrs; size?: number }) {
  const c = a.colorHex;
  const isLight = c === "#CFD8DC";
  const badgeHex = a.extraId ? BADGE_COLORS[a.extraId] : null;
  const skinTone = "#FFDCC0";
  return (
    <svg width={size} height={size} viewBox="0 0 80 90" className="overflow-visible">
      {/* Suit body */}
      <path d="M17 50 Q13 60 15 82 L65 82 Q67 60 63 50 Q56 40 40 38 Q24 40 17 50Z" fill={c}/>
      {/* Shirt/tie center */}
      <path d="M34 38 L34 82 L46 82 L46 38Z" fill={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)"}/>
      {/* Tie */}
      <polygon points="40,42 37,52 40,58 43,52" fill={isLight ? "#37474F" : "rgba(0,0,0,0.3)"}/>
      {/* Suit lapels */}
      <path d="M34 38 L22 52" fill="none" stroke={isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5"/>
      <path d="M46 38 L58 52" fill="none" stroke={isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5"/>
      {/* Badge on left chest */}
      {badgeHex && (
        <g>
          <rect x="18" y="54" width="16" height="11" rx="2.5" fill={badgeHex}/>
          <rect x="19" y="55" width="14" height="4" rx="1" fill="rgba(255,255,255,0.25)"/>
          <rect x="19" y="60" width="9" height="2.5" rx="1" fill="rgba(255,255,255,0.4)"/>
          {/* Symbol on badge */}
          {a.symbolId === "triangulo" && <polygon points="26,57 30,62 22,62" fill="rgba(255,255,255,0.9)"/>}
          {a.symbolId === "circulo"   && <circle cx="26" cy="59.5" r="3" fill="rgba(255,255,255,0.9)"/>}
          {a.symbolId === "quadrado"  && <rect x="23" y="57" width="6" height="6" fill="rgba(255,255,255,0.9)"/>}
          {a.symbolId === "estrela"   && <polygon points="26,56.5 27.4,59.8 31,59.8 28.3,61.8 29.3,65 26,63 22.7,65 23.7,61.8 21,59.8 24.6,59.8" fill="rgba(255,255,255,0.9)"/>}
        </g>
      )}
      {/* Symbol without badge (on arm/chest) */}
      {!badgeHex && a.symbolId && (
        <g>
          {a.symbolId === "triangulo" && <polygon points="40,52 47,62 33,62" fill={isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)"}/>}
          {a.symbolId === "circulo"   && <circle cx="40" cy="57" r="6" fill={isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}/>}
          {a.symbolId === "quadrado"  && <rect x="34" y="51" width="12" height="12" fill={isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}/>}
          {a.symbolId === "estrela"   && <polygon points="40,51 42.4,58.4 50.2,58.4 44,62.8 46.4,70.2 40,66 33.6,70.2 36,62.8 29.8,58.4 37.6,58.4" fill={isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.55)"} transform="scale(0.5) translate(40,50)"/>}
        </g>
      )}
      {/* Head */}
      <circle cx="40" cy="25" r="16" fill={skinTone}/>
      {/* Professional hair */}
      <path d="M24 25 Q24 9 40 9 Q56 9 56 25 Q52 17 40 17 Q28 17 24 25Z" fill="#5D4037"/>
      {/* Eyes */}
      <ellipse cx="33.5" cy="25" rx="2.8" ry="2.8" fill="#1a1a1a"/>
      <ellipse cx="46.5" cy="25" rx="2.8" ry="2.8" fill="#1a1a1a"/>
      <circle cx="35" cy="23.5" r="1.1" fill="white"/>
      <circle cx="48" cy="23.5" r="1.1" fill="white"/>
      {/* Nose */}
      <path d="M38 29 Q40 32 42 29" fill="none" stroke="#C49A7A" strokeWidth="1.2"/>
      {/* Neutral/professional mouth */}
      <line x1="35" y1="34.5" x2="45" y2="34.5" stroke="#C49A7A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* HAT: headset */}
      {a.hatId === "headset" && (
        <g>
          <path d="M23 22 Q23 9 40 9 Q57 9 57 22" fill="none" stroke="#37474F" strokeWidth="3.5"/>
          <rect x="18" y="19" width="8" height="12" rx="3" fill="#546E7A"/>
          <rect x="54" y="19" width="8" height="12" rx="3" fill="#546E7A"/>
          <line x1="18" y1="28" x2="12" y2="34" stroke="#546E7A" strokeWidth="2"/>
          <circle cx="12" cy="35" r="2.5" fill="#455A64"/>
        </g>
      )}
      {/* HAT: boné */}
      {a.hatId === "bone" && (
        <g>
          <path d="M23 20 Q23 8 40 8 Q57 8 57 20" fill="#37474F"/>
          <rect x="23" y="18" width="34" height="7" rx="3.5" fill="#455A64"/>
          <rect x="16" y="20" width="18" height="5" rx="2.5" fill="#546E7A"/>
          <circle cx="40" cy="11" r="2.5" fill="#546E7A"/>
        </g>
      )}
      {/* HAT: óculos */}
      {a.hatId === "oculos" && (
        <g>
          <path d="M26 25 Q33.5 20 41 25 Q41 30 33.5 30 Q26 30 26 25Z" fill="none" stroke="#333" strokeWidth="1.8"/>
          <path d="M41 25 Q48.5 20 56 25 Q56 30 48.5 30 Q41 30 41 25Z" fill="none" stroke="#333" strokeWidth="1.8"/>
          <line x1="22" y1="25" x2="26" y2="25" stroke="#333" strokeWidth="1.8"/>
          <line x1="56" y1="25" x2="60" y2="25" stroke="#333" strokeWidth="1.8"/>
        </g>
      )}
      {/* HAT: chapéu */}
      {a.hatId === "chapeu" && (
        <g>
          <ellipse cx="40" cy="11" rx="20" ry="4.5" fill="#2a2a2a"/>
          <rect x="23" y="4" width="34" height="9" rx="2" fill="#333"/>
          <ellipse cx="40" cy="4.5" rx="17" ry="3" fill="#2a2a2a"/>
        </g>
      )}
    </svg>
  );
}

// ── CharacterCard ─────────────────────────────────────────────────────────────

function AgentCard({
  char, mode, onClick, state, size,
}: {
  char: AgentChar; mode: AgeMode; onClick: () => void;
  state: "idle" | "correct" | "wrong"; size: number;
}) {
  const ring = state === "correct" ? "ring-4 ring-green-400 bg-green-50 scale-110" :
               state === "wrong"   ? "ring-4 ring-red-400 bg-red-50 scale-90 opacity-60" :
               "ring-2 ring-transparent hover:ring-blue-300 active:scale-95 bg-white/90 hover:bg-white";
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={`relative rounded-2xl p-1.5 cursor-pointer transition-all duration-150 shadow-sm ${ring}`}
    >
      {mode === "child" && <ChildSvg a={char.attrs} size={size} />}
      {mode === "teen"  && <TeenSvg  a={char.attrs} size={size} />}
      {mode === "adult" && <AdultSvg a={char.attrs} size={size} />}
    </motion.button>
  );
}

// ── Command display ───────────────────────────────────────────────────────────

type InstrMode = "both" | "visual" | "audio";

function getInstrMode(d: number): InstrMode {
  if (d <= 4) return "both";
  if (d <= 7) return "visual";
  return "audio";
}

function CommandPanel({ command, colorHex, colorLabel, theme, onSpeak, instrMode }: {
  command: string; colorHex: string; colorLabel: string; theme: Theme; onSpeak: () => void; instrMode: InstrMode;
}) {
  const bg = theme === "GAMIFIED" ? "bg-slate-800 border-cyan-500/30" :
             theme === "COLORFUL" ? "bg-white border-purple-300" : "bg-white border-blue-200";
  const txt = theme === "GAMIFIED" ? "text-cyan-100" : "text-gray-800";
  const subTxt = theme === "GAMIFIED" ? "text-slate-400" : "text-slate-500";
  const showText = instrMode !== "audio";
  const showSpeaker = instrMode !== "visual";

  return (
    <div className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${bg}`}>
      {/* Color swatch */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-black/10 shadow"
           style={{ background: colorHex }} />
      {showText ? (
        <p className={`text-sm font-bold flex-1 leading-snug ${txt}`}>{command}</p>
      ) : (
        <div className="flex-1">
          <p className={`text-sm font-bold ${txt}`}>👂 Modo Auditivo</p>
          <p className={`text-xs ${subTxt}`}>Ouça o comando e encontre o personagem</p>
        </div>
      )}
      {showSpeaker && (
        <button
          onClick={onSpeak}
          className={`text-xl flex-shrink-0 transition-transform active:scale-90`}
          title="Ouvir comando"
        >🔊</button>
      )}
    </div>
  );
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

function FocusTutorial({ theme, mode, onDone }: { theme: Theme; mode: AgeMode; onDone: () => void }) {
  const tutChars: AgentChar[] = [
    {
      id: "t0", isTarget: true,
      attrs: {
        colorId: "azul", colorHex: mode === "adult" ? "#1565C0" : mode === "teen" ? "#00B4D8" : "#1E88E5",
        colorLabel: "azul",
        hatId: "bone", hatLabel: "boné",
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
    {
      id: "t1", isTarget: false,
      attrs: {
        colorId: "vermelho", colorHex: mode === "teen" ? "#EF233C" : "#E53935",
        colorLabel: "vermelho",
        hatId: "bone", hatLabel: "boné",
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
    {
      id: "t2", isTarget: false,
      attrs: {
        colorId: "azul", colorHex: mode === "adult" ? "#1565C0" : "#1E88E5",
        colorLabel: "azul",
        hatId: "chapeu", hatLabel: "chapéu",
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
    {
      id: "t3", isTarget: false,
      attrs: {
        colorId: "verde", colorHex: mode === "adult" ? "#2E7D32" : "#43A047",
        colorLabel: "verde",
        hatId: null, hatLabel: null,
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
    {
      id: "t4", isTarget: false,
      attrs: {
        colorId: mode === "child" ? "laranja" : "roxo",
        colorHex: mode === "child" ? "#FB8C00" : "#8E24AA",
        colorLabel: mode === "child" ? "laranja" : "roxo",
        hatId: null, hatLabel: null,
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
    {
      id: "t5", isTarget: false,
      attrs: {
        colorId: mode === "child" ? "rosa" : "cinza",
        colorHex: mode === "child" ? "#E91E63" : "#546E7A",
        colorLabel: mode === "child" ? "rosa" : "cinza",
        hatId: null, hatLabel: null,
        extraId: null, extraLabel: null,
        symbolId: null, symbolLabel: null,
      },
    },
  ].sort(() => Math.random() - 0.5);

  const cmd = mode === "child" ? "Clique na criaturinha azul com boné" :
              mode === "teen"  ? "Clique no avatar azul com boné" :
                                 "Selecione o agente com uniforme azul e boné";

  const modeLabel = mode === "child" ? "criaturas fofas" : mode === "teen" ? "avatares" : "agentes";

  function TutStep({ onStepDone }: { onStepDone: () => void }) {
    const [picked, setPicked] = useState<string | null>(null);
    function tap(id: string, isTarget: boolean) {
      if (picked) return;
      setPicked(id);
      if (isTarget) setTimeout(onStepDone, 700);
    }
    return (
      <div className="space-y-3">
        <CommandPanel command={cmd} colorHex="#1E88E5" colorLabel="azul" theme={theme} onSpeak={() => speak(cmd)} instrMode="both" />
        <div className="grid grid-cols-3 gap-2">
          {tutChars.map(ch => (
            <AgentCard
              key={ch.id} char={ch} mode={mode}
              onClick={() => tap(ch.id, ch.isTarget)}
              state={picked === ch.id ? (ch.isTarget ? "correct" : "wrong") : "idle"}
              size={60}
            />
          ))}
        </div>
      </div>
    );
  }

  const title = mode === "child" ? "Focus Criaturas" : mode === "teen" ? "Focus Avatares" : "Focus Agentes";
  const steps = [
    {
      instruction: `Você verá vários ${modeLabel} na tela. Leia o comando e clique no correto!`,
      content: (done: () => void) => <TutStep onStepDone={done} />,
    },
  ];

  return <TutorialBase theme={theme} title={title} steps={steps} onDone={onDone} />;
}

// ── Scene Background ──────────────────────────────────────────────────────────

function SceneBg({ theme }: { theme: Theme }) {
  if (theme === "GAMIFIED") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #1a1040 55%, #2d1060 100%)" }} />
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, opacity: 0.4 + (i % 5) * 0.1,
              left: `${(i * 37 + 13) % 100}%`, top: `${(i * 23 + 7) % 60}%` }} />
        ))}
        {/* Ground */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
          <path d="M0 80 L0 45 Q30 35 60 42 Q90 50 120 38 Q150 26 180 40 Q210 52 240 36 Q270 22 300 40 Q330 55 360 38 Q390 25 400 38 L400 80Z" fill="#1e0a40"/>
          <path d="M0 80 L0 55 Q40 45 80 52 Q120 58 160 48 Q200 38 240 52 Q280 64 320 50 Q360 36 400 50 L400 80Z" fill="#2d1060"/>
        </svg>
      </div>
    );
  }
  if (theme === "COLORFUL") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #b8e4f9 45%, #d4f0b8 70%, #8BC34A 100%)" }} />
        {/* Clouds */}
        <div className="absolute top-[8%] left-[10%] opacity-80">
          <div className="w-20 h-8 rounded-full bg-white/90 shadow" />
          <div className="w-14 h-7 rounded-full bg-white/90 shadow -mt-4 ml-4" />
        </div>
        <div className="absolute top-[12%] right-[15%] opacity-70">
          <div className="w-16 h-6 rounded-full bg-white/90 shadow" />
          <div className="w-10 h-5 rounded-full bg-white/90 shadow -mt-3 ml-3" />
        </div>
        {/* Ground hills */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 400 70" preserveAspectRatio="none">
          <path d="M0 70 L0 40 Q50 20 100 35 Q150 50 200 30 Q250 10 300 32 Q350 52 400 35 L400 70Z" fill="#5a9e2f"/>
          <path d="M0 70 L0 55 Q60 42 120 52 Q180 60 240 48 Q300 36 360 50 Q385 56 400 52 L400 70Z" fill="#6dbf3d"/>
        </svg>
      </div>
    );
  }
  // CLINICAL
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #e8f4fd 0%, #cce7f5 50%, #dce8f0 80%, #b8d4e8 100%)" }} />
      {/* Subtle clouds */}
      <div className="absolute top-[10%] left-[8%] opacity-40">
        <div className="w-24 h-8 rounded-full bg-white shadow-sm" />
        <div className="w-16 h-6 rounded-full bg-white shadow-sm -mt-4 ml-5" />
      </div>
      <div className="absolute top-[6%] right-[12%] opacity-30">
        <div className="w-20 h-7 rounded-full bg-white" />
        <div className="w-12 h-5 rounded-full bg-white -mt-3 ml-4" />
      </div>
      {/* Ground */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 60" preserveAspectRatio="none">
        <path d="M0 60 L0 38 Q80 22 160 35 Q240 48 320 28 Q370 16 400 30 L400 60Z" fill="#8ab4cc"/>
        <path d="M0 60 L0 48 Q80 36 160 46 Q240 56 320 42 Q370 34 400 44 L400 60Z" fill="#9dc4d8"/>
      </svg>
    </div>
  );
}

// ── Floating character positions ──────────────────────────────────────────────

interface CharPos { id: string; x: number; y: number; floatDur: number; floatAmp: number; floatDelay: number; }

function generatePositions(chars: AgentChar[]): CharPos[] {
  const positions: CharPos[] = [];
  const minDist = 18; // minimum % distance between centers
  for (const ch of chars) {
    let x = 0, y = 0, attempts = 0;
    do {
      x = 5 + Math.random() * 82;
      y = 8 + Math.random() * 62;
      attempts++;
    } while (attempts < 50 && positions.some(p => Math.hypot(p.x - x, p.y - y) < minDist));
    positions.push({ id: ch.id, x, y, floatDur: 2.5 + Math.random() * 2, floatAmp: 8 + Math.random() * 10, floatDelay: Math.random() * 2 });
  }
  return positions;
}

// ── Main component ────────────────────────────────────────────────────────────

const MAX_ROUNDS = 10;

export interface FocusAgentsProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  forceMode?: "visual" | "auditivo";
}

export function FocusAgents({ difficulty, theme, onComplete, forceMode }: FocusAgentsProps) {
  const mode = getMode(theme);
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [gamePhase, setGamePhase] = useState<"command" | "playing" | "feedback">("command");
  const [round, setRound] = useState(0);
  const [chars, setChars] = useState<AgentChar[]>([]);
  const [charPositions, setCharPositions] = useState<CharPos[]>([]);
  const [command, setCommand] = useState("");
  const [targetId, setTargetId] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; rt: number }[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStart = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const currentTargetId = useRef(targetId);
  const roundResultsRef = useRef(roundResults);
  currentTargetId.current = targetId;
  roundResultsRef.current = roundResults;

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const prepareRound = useCallback((r: number) => {
    const d = Math.max(1, Math.min(10, difficulty + Math.floor(r / 3)));
    const gen = generateRound(mode, d);
    setChars(gen.chars);
    setCharPositions(generatePositions(gen.chars));
    setCommand(gen.command);
    setTargetId(gen.targetId);
    setPicked(null);
    setTimedOut(false);
    setTimerLeft(timerSec(d));
    setGamePhase("command");

    // Auto-speak in audio/both mode
    const instrMode = forceMode === "visual" ? "visual" : forceMode === "auditivo" ? "audio" : getInstrMode(d);
    if (instrMode !== "visual") speak(gen.command);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, forceMode]);

  function startPlaying() {
    setGamePhase("playing");
    roundStart.current = Date.now();
    clearTimer();
    const t = timerLeft;
    if (t !== null && t > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev === null || prev <= 1) {
            clearTimer();
            handleResult(false, currentTargetId.current, round);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handleResult(correct: boolean, _tId: string, r: number) {
    clearTimer();
    const rt = Date.now() - roundStart.current;
    const newResults = [...roundResultsRef.current, { correct, rt }];
    setRoundResults(newResults);
    roundResultsRef.current = newResults;
    if (!correct) setTimedOut(true);
    setGamePhase("feedback");

    const nextRound = r + 1;
    reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

    setTimeout(() => {
      if (nextRound >= MAX_ROUNDS) {
        const correctCount = newResults.filter(x => x.correct).length;
        const accuracy = correctCount / MAX_ROUNDS;
        const avgRt = newResults.filter(x => x.correct).reduce((s, x) => s + x.rt, 0) / (correctCount || 1);
        onComplete({
          exerciseId: "focus-agents",
          domain: "attention",
          score: calculateExerciseScore("focus-agents", accuracy, Math.round(avgRt), difficulty),
          accuracy,
          reactionTime: Math.round(avgRt),
          difficulty,
          duration: Math.round((Date.now() - sessionStart.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: correctCount, mode },
        });
      } else {
        setRound(nextRound);
        prepareRound(nextRound);
      }
    }, 1400);
  }

  function handleTap(char: AgentChar) {
    if (gamePhase !== "playing" || picked) return;
    setPicked(char.id);
    handleResult(char.isTarget, targetId, round);
  }

  useEffect(() => {
    if (!showTutorial) prepareRound(0);
    return () => { clearTimer(); if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  if (showTutorial) return <FocusTutorial theme={theme} mode={mode} onDone={() => setShowTutorial(false)} />;

  // ── Paleta HUD ──────────────────────────────────────────────────────────────
  const hudBg = theme === "GAMIFIED" ? "bg-black/60 border-purple-500/40 text-white"
    : theme === "COLORFUL" ? "bg-white/80 border-white/60 text-gray-800"
    : "bg-white/80 border-white/50 text-slate-800";
  const dotColor = (i: number) => {
    if (i < roundResults.length) return roundResults[i].correct ? "bg-green-400" : "bg-red-400";
    if (i === round) return (theme === "GAMIFIED" ? "bg-cyan-400" : "bg-blue-500") + " animate-pulse";
    return theme === "GAMIFIED" ? "bg-white/20" : "bg-black/15";
  };

  const effectiveDiff = Math.max(1, Math.min(10, difficulty + Math.floor(round / 3)));
  const instrMode: InstrMode = forceMode === "visual" ? "visual" : forceMode === "auditivo" ? "audio" : getInstrMode(effectiveDiff);
  const targetAttrs = chars.find(c => c.id === targetId)?.attrs;
  const cardSize = chars.length <= 8 ? 72 : chars.length <= 12 ? 62 : 54;

  const gameTitle = mode === "child" ? "🎯 Focus Criaturas" : mode === "teen" ? "🎮 Focus Avatares" : "🔍 Focus Agentes";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 40 }}>
      {/* Fundo cenográfico */}
      <SceneBg theme={theme} />

      {/* HUD topo */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-2 pb-1">
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 border backdrop-blur-sm ${hudBg}`}>
          <span className="text-xs font-bold opacity-70">{gameTitle}</span>
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${dotColor(i)}`} />
            ))}
          </div>
          <span className="text-xs font-bold opacity-70">{round + 1}/{MAX_ROUNDS}</span>
          {timerLeft !== null && gamePhase === "playing" && (
            <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg ml-1 ${
              timerLeft <= 5 ? "bg-red-500 text-white animate-pulse" : "bg-black/20 text-inherit"
            }`}>⏱{timerLeft}s</span>
          )}
        </div>
      </div>

      {/* Personagens flutuando */}
      <div className="absolute inset-0 z-10" style={{ paddingTop: 56, paddingBottom: 16 }}>
        {chars.map(ch => {
          const pos = charPositions.find(p => p.id === ch.id);
          if (!pos) return null;
          const state: "idle" | "correct" | "wrong" =
            picked === ch.id ? (ch.isTarget ? "correct" : "wrong") :
            (picked !== null && ch.isTarget ? "correct" : "idle");
          const visible = gamePhase !== "command";
          return (
            <motion.div
              key={ch.id}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={visible ? {
                opacity: 1, scale: 1,
                y: [0, -pos.floatAmp, 0, pos.floatAmp * 0.5, 0],
                x: [0, pos.floatAmp * 0.4, 0, -pos.floatAmp * 0.3, 0],
              } : { opacity: 0, scale: 0.5 }}
              transition={visible ? {
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: { duration: pos.floatDur, repeat: Infinity, ease: "easeInOut", delay: pos.floatDelay },
                x: { duration: pos.floatDur * 1.3, repeat: Infinity, ease: "easeInOut", delay: pos.floatDelay + 0.5 },
              } : { duration: 0.2 }}
            >
              <AgentCard char={ch} mode={mode} onClick={() => handleTap(ch)} state={state} size={cardSize} />
            </motion.div>
          );
        })}
      </div>

      {/* Cartão de comando (fase command) */}
      <AnimatePresence>
        {gamePhase === "command" && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`w-full max-w-sm rounded-3xl shadow-2xl border-2 overflow-hidden ${
              theme === "GAMIFIED" ? "bg-slate-900/95 border-cyan-500/50"
              : theme === "COLORFUL" ? "bg-white/95 border-purple-300"
              : "bg-white/95 border-blue-200"
            }`}>
              {/* Header do cartão */}
              <div className={`px-4 py-2 text-center text-xs font-bold uppercase tracking-widest ${
                theme === "GAMIFIED" ? "bg-cyan-500/20 text-cyan-300"
                : theme === "COLORFUL" ? "bg-purple-100 text-purple-600"
                : "bg-blue-50 text-blue-600"
              }`}>
                {instrMode === "audio" ? "👂 Ouça o comando" : instrMode === "visual" ? "👁 Leia o comando" : "👁 Leia o comando"}
              </div>

              {/* Corpo do cartão */}
              <div className="px-5 py-5 space-y-4">
                {/* Swatch de cor */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full shadow-lg border-4 border-white/50"
                    style={{ background: targetAttrs?.colorHex ?? "#999" }} />
                </div>

                {/* Texto do comando */}
                {instrMode !== "audio" ? (
                  <p className={`text-center font-bold text-lg leading-snug ${
                    theme === "GAMIFIED" ? "text-white" : "text-gray-800"
                  }`}>{command}</p>
                ) : (
                  <div className="text-center space-y-1">
                    <p className={`font-bold text-base ${theme === "GAMIFIED" ? "text-cyan-300" : "text-indigo-600"}`}>
                      👂 Modo Auditivo
                    </p>
                    <p className={`text-sm ${theme === "GAMIFIED" ? "text-slate-400" : "text-gray-500"}`}>
                      Ouça o comando e encontre o personagem
                    </p>
                  </div>
                )}

                {/* Botão de ouvir + OK */}
                <div className="flex gap-3">
                  {instrMode !== "visual" && (
                    <button
                      onClick={() => speak(command)}
                      className={`flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                        theme === "GAMIFIED" ? "border-cyan-500 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20"
                        : theme === "COLORFUL" ? "border-purple-300 text-purple-600 bg-purple-50 hover:bg-purple-100"
                        : "border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100"
                      }`}
                    >
                      🔊 Ouvir
                    </button>
                  )}
                  <button
                    onClick={startPlaying}
                    className={`flex-1 h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                      theme === "GAMIFIED" ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : theme === "COLORFUL" ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                    }`}
                  >
                    Encontrar! →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback overlay (fase feedback) */}
      <AnimatePresence>
        {gamePhase === "feedback" && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`px-8 py-6 rounded-3xl shadow-2xl text-center border-2 ${
              picked && chars.find(c => c.id === picked)?.isTarget
                ? "bg-green-500/95 border-green-300 text-white"
                : timedOut
                  ? "bg-orange-500/95 border-orange-300 text-white"
                  : "bg-red-500/95 border-red-300 text-white"
            }`}>
              <p className="text-5xl mb-2">
                {picked && chars.find(c => c.id === picked)?.isTarget ? "✅" : timedOut ? "⏱" : "❌"}
              </p>
              <p className="font-bold text-xl">
                {picked && chars.find(c => c.id === picked)?.isTarget
                  ? "Correto!"
                  : timedOut ? "Tempo esgotado!" : "Errado!"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
