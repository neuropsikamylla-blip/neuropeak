"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type AgeMode = "child" | "teen" | "adult";

interface CharAttrs {
  colorId: string; colorHex: string; colorLabel: string;
  hatId: string | null; hatLabel: string | null;
  extraId: string | null; extraLabel: string | null;
  symbolId: string | null; symbolLabel: string | null;
}

interface AgentChar { id: string; attrs: CharAttrs; isTarget: boolean; }

interface FallingChar {
  uid: string; char: AgentChar;
  x: number; size: number; fallDur: number;
}

// ── Palettes ──────────────────────────────────────────────────────────────────

type Def = { id: string; label: string };
type ColorDef = Def & { hex: string };

const BADGE_COLORS: Record<string, string> = {
  "badge-azul": "#1565C0", "badge-verde": "#2E7D32",
  "badge-vermelho": "#C62828", "badge-amarelo": "#F9A825",
};

const COLORS: Record<AgeMode, ColorDef[]> = {
  child: [
    { id: "amarelo",  hex: "#FFD600", label: "amarelo" },
    { id: "azul",     hex: "#1E88E5", label: "azul" },
    { id: "verde",    hex: "#43A047", label: "verde" },
    { id: "vermelho", hex: "#E53935", label: "vermelho" },
    { id: "roxo",     hex: "#8E24AA", label: "roxo" },
    { id: "laranja",  hex: "#FB8C00", label: "laranja" },
    { id: "rosa",     hex: "#E91E63", label: "rosa" },
    { id: "cinza",    hex: "#78909C", label: "cinza" },
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
    { id: "azul",   hex: "#1565C0", label: "azul" },
    { id: "cinza",  hex: "#546E7A", label: "cinza" },
    { id: "preto",  hex: "#37474F", label: "preto" },
    { id: "verde",  hex: "#2E7D32", label: "verde" },
    { id: "branco", hex: "#CFD8DC", label: "branco" },
    { id: "marrom", hex: "#5D4037", label: "marrom" },
  ],
};

const HATS: Record<AgeMode, Def[]> = {
  child: [
    { id: "chapeu", label: "chapéu" }, { id: "bone", label: "boné" },
    { id: "coroa",  label: "coroa"  }, { id: "antena", label: "antena" },
  ],
  teen: [
    { id: "capuz",   label: "capuz" },  { id: "headset", label: "headset" },
    { id: "bone",    label: "boné"  },  { id: "visor",   label: "óculos escuros" },
  ],
  adult: [
    { id: "headset", label: "headset" }, { id: "bone",   label: "boné" },
    { id: "oculos",  label: "óculos"  }, { id: "chapeu", label: "chapéu" },
  ],
};

const EXTRAS: Record<AgeMode, Def[]> = {
  child: [
    { id: "mochila", label: "mochila" }, { id: "gravata", label: "gravata-borboleta" }, { id: "oculos", label: "óculos" },
  ],
  teen: [
    { id: "mochila", label: "mochila" }, { id: "mascara", label: "máscara" }, { id: "luvas", label: "luvas" },
  ],
  adult: [
    { id: "badge-azul", label: "crachá azul" }, { id: "badge-verde", label: "crachá verde" },
    { id: "badge-vermelho", label: "crachá vermelho" }, { id: "badge-amarelo", label: "crachá amarelo" },
  ],
};

const SYMBOLS: Record<AgeMode, Def[]> = {
  child: [{ id: "estrela", label: "estrela" }, { id: "coracao", label: "coração" }, { id: "raio", label: "raio" }],
  teen:  [{ id: "raio", label: "raio" }, { id: "x-mark", label: "X" }, { id: "diamante", label: "diamante" }, { id: "caveira", label: "caveira" }],
  adult: [{ id: "triangulo", label: "triângulo" }, { id: "circulo", label: "círculo" }, { id: "quadrado", label: "quadrado" }, { id: "estrela", label: "estrela" }],
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
  if (d <= 2) return 5; if (d <= 4) return 7; if (d <= 6) return 9; if (d <= 8) return 11; return 13;
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
  return { colorId: c.id, colorHex: c.hex, colorLabel: c.label, hatId: h?.id ?? null, hatLabel: h?.label ?? null, extraId: e?.id ?? null, extraLabel: e?.label ?? null, symbolId: s?.id ?? null, symbolLabel: s?.label ?? null };
}

function makeDistractorAttrs(target: CharAttrs, mode: AgeMode, n: number, smart: boolean): CharAttrs {
  if (smart && n >= 2) {
    const slot = Math.floor(Math.random() * n);
    const c = slot === 0 ? pickExcl(COLORS[mode], target.colorId) : COLORS[mode].find(x => x.id === target.colorId)!;
    const h = n >= 2 ? (slot === 1 ? pickExcl(HATS[mode], target.hatId) : HATS[mode].find(x => x.id === target.hatId)) : null;
    const e = n >= 3 ? (slot === 2 ? pickExcl(EXTRAS[mode], target.extraId) : EXTRAS[mode].find(x => x.id === target.extraId)) : null;
    const s = n >= 4 ? (slot === 3 ? pickExcl(SYMBOLS[mode], target.symbolId) : SYMBOLS[mode].find(x => x.id === target.symbolId)) : null;
    const safeC = c ?? pick(COLORS[mode]);
    return { colorId: safeC.id, colorHex: safeC.hex, colorLabel: safeC.label, hatId: h?.id ?? null, hatLabel: h?.label ?? null, extraId: e?.id ?? null, extraLabel: e?.label ?? null, symbolId: s?.id ?? null, symbolLabel: s?.label ?? null };
  }
  const c = pickExcl(COLORS[mode], target.colorId);
  const h = n >= 2 ? pick(HATS[mode]) : null;
  const e = n >= 3 ? pick(EXTRAS[mode]) : null;
  const s = n >= 4 ? pick(SYMBOLS[mode]) : null;
  return { colorId: c.id, colorHex: c.hex, colorLabel: c.label, hatId: h?.id ?? null, hatLabel: h?.label ?? null, extraId: e?.id ?? null, extraLabel: e?.label ?? null, symbolId: s?.id ?? null, symbolLabel: s?.label ?? null };
}

function buildCommand(mode: AgeMode, a: CharAttrs, n: number): string {
  if (mode === "child") {
    let s = `Clique na criaturinha ${a.colorLabel}`;
    if (n >= 2 && a.hatLabel) s += ` com ${a.hatLabel}`;
    if (n >= 3 && a.extraLabel) s += ` e ${a.extraLabel}`;
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
  const n = numChars(d); const na = numAttrs(d);
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

// ── Full-body Agent SVG ───────────────────────────────────────────────────────
// viewBox 0 0 60 112 — head-to-boots full character, comic-book style

function AgentSvg({ a, mode, size = 80 }: { a: CharAttrs; mode: AgeMode; size?: number }) {
  const c = a.colorHex;
  const skin = "#FFDCC0";
  const ol = "#111";  // outline color
  const sw = 2;       // stroke width
  const isLight = ["#CFD8DC", "#DDE1F0", "#FFD600"].includes(c);
  const hairFill = mode === "child" ? "#6D4C41" : mode === "teen" ? "#1a1a1a" : "#5D4037";
  const legShade = "rgba(0,0,0,0.22)";
  const bodyHighlight = "rgba(255,255,255,0.22)";
  const bodyShade = "rgba(0,0,0,0.14)";
  const stripeCol = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.16)";
  const badgeColor = a.extraId ? BADGE_COLORS[a.extraId] : null;
  const eyeR = mode === "child" ? 3.5 : 3;
  const h = Math.round(size * 112 / 60);

  return (
    <svg width={size} height={h} viewBox="0 0 60 112"
      style={{ overflow: "visible", filter: "drop-shadow(2px 5px 9px rgba(0,0,0,0.45))" }}>

      {/* ── BOOTS ── */}
      <rect x="13" y="101" width="14" height="7" rx="3.5" fill="#1a1a1a" stroke={ol} strokeWidth={sw} />
      <rect x="33" y="101" width="14" height="7" rx="3.5" fill="#1a1a1a" stroke={ol} strokeWidth={sw} />
      <ellipse cx="20" cy="107" rx="9.5" ry="3.5" fill="#222" stroke={ol} strokeWidth="1.5" />
      <ellipse cx="40" cy="107" rx="9.5" ry="3.5" fill="#222" stroke={ol} strokeWidth="1.5" />

      {/* ── LEGS ── */}
      <path d="M20 72 Q18 87 18 102 L27 102 L30 83 L33 102 L42 102 Q42 87 40 72Z"
        fill={c} stroke={ol} strokeWidth={sw} strokeLinejoin="round" />
      {/* Leg inner shade */}
      <path d="M20 72 Q18 87 18 102 L27 102 L30 83 L33 102 L42 102 Q42 87 40 72 Q35 76 30 76 Q25 76 20 72Z"
        fill={legShade} />

      {/* ── TORSO ── */}
      <path d="M11 38 Q8 55 9 72 L51 72 Q52 55 49 38 Q44 27 30 26 Q16 27 11 38Z"
        fill={c} stroke={ol} strokeWidth={sw} strokeLinejoin="round" />
      {/* Torso center seam */}
      <line x1="30" y1="26" x2="30" y2="72" stroke={stripeCol} strokeWidth="2" />
      {/* Torso highlight (left shoulder) */}
      <ellipse cx="21" cy="40" rx="7" ry="4" fill={bodyHighlight} transform="rotate(-25 21 40)" />
      {/* Torso right shade */}
      <path d="M42 38 Q49 55 49 72 L51 72 Q52 55 49 38Z" fill={bodyShade} />

      {/* ── ARMS ── */}
      <path d="M11 38 Q4 48 3 64 L9 66 Q8 53 16 44Z"
        fill={c} stroke={ol} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M49 38 Q56 48 57 64 L51 66 Q52 53 44 44Z"
        fill={c} stroke={ol} strokeWidth={sw} strokeLinejoin="round" />

      {/* ── HANDS ── */}
      <ellipse cx="6" cy="67" rx="5.5" ry="5" fill={skin} stroke={ol} strokeWidth={sw} />
      <ellipse cx="54" cy="67" rx="5.5" ry="5" fill={skin} stroke={ol} strokeWidth={sw} />
      {/* Knuckle lines */}
      <line x1="3.5" y1="65.5" x2="4.5" y2="69.5" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <line x1="6.5" y1="64.5" x2="6.5" y2="69.5" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />

      {/* ── BELT ── */}
      <rect x="9" y="69" width="42" height="6" rx="3"
        fill={isLight ? "#546E7A" : "#212121"} stroke={ol} strokeWidth="1.5" />
      <rect x="27" y="69" width="6" height="6" rx="2.5"
        fill={isLight ? "#78909C" : "rgba(255,255,255,0.4)"} />

      {/* ── BADGE ── */}
      {badgeColor && (
        <g>
          <rect x="17" y="48" width="14" height="11" rx="2.5" fill={badgeColor} stroke={ol} strokeWidth="1.5" />
          <rect x="18" y="49" width="12" height="4" rx="1.5" fill="rgba(255,255,255,0.3)" />
          <rect x="18" y="54" width="8" height="2.5" rx="1" fill="rgba(255,255,255,0.5)" />
        </g>
      )}

      {/* ── BACKPACK ── */}
      {a.extraId === "mochila" && (
        <g>
          <rect x="4" y="40" width="11" height="22" rx="3" fill={isLight ? "#9E9E9E" : "#8D6E26"} stroke={ol} strokeWidth="1.5" />
          <rect x="5.5" y="42" width="8" height="18" rx="2" fill={isLight ? "#BDBDBD" : "#A07D2E"} />
          <line x1="7.5" y1="46" x2="11.5" y2="46" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" />
          <line x1="7.5" y1="51" x2="11.5" y2="51" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" />
        </g>
      )}

      {/* ── GRAVATA BORBOLETA ── */}
      {a.extraId === "gravata" && (
        <g transform="translate(30,36)">
          <polygon points="-8,-3.5 0,0 -8,3.5" fill="#E53935" stroke={ol} strokeWidth="1" />
          <polygon points="8,-3.5 0,0 8,3.5" fill="#C62828" stroke={ol} strokeWidth="1" />
          <circle cx="0" cy="0" r="2.5" fill="#B71C1C" stroke={ol} strokeWidth="1" />
        </g>
      )}

      {/* ── LUVAS ── */}
      {a.extraId === "luvas" && (
        <g>
          <ellipse cx="6" cy="67" rx="5.5" ry="5" fill="#7B2FBE" stroke={ol} strokeWidth={sw} />
          <ellipse cx="54" cy="67" rx="5.5" ry="5" fill="#7B2FBE" stroke={ol} strokeWidth={sw} />
        </g>
      )}

      {/* ── SYMBOLS ON BODY ── */}
      {a.symbolId === "estrela" && (
        <polygon points="30,43 32.4,50.5 40.5,50.5 34,55.2 36.4,62.7 30,58 23.6,62.7 26,55.2 19.5,50.5 27.6,50.5"
          fill="#FFD600" stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "coracao" && (
        <path d="M30 59 C30 59 21 52 21 46.5 C21 43 24.5 41 30 46.5 C35.5 41 39 43 39 46.5 C39 52 30 59 30 59Z"
          fill="#F06292" stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "raio" && (
        <polygon points="34,42 27,54 32,51.5 27,65 38,51 32.5,53.5"
          fill="#FFD600" stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "triangulo" && (
        <polygon points="30,43 39,57 21,57"
          fill={isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.7)"} stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "circulo" && (
        <circle cx="30" cy="51" r="8"
          fill={isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.55)"} stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "quadrado" && (
        <rect x="23" y="44" width="14" height="14"
          fill={isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.55)"} stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "x-mark" && (
        <g stroke={isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)"} strokeWidth="3.5" strokeLinecap="round">
          <line x1="23" y1="43" x2="37" y2="57" /><line x1="37" y1="43" x2="23" y2="57" />
        </g>
      )}
      {a.symbolId === "diamante" && (
        <polygon points="30,43 39.5,51 30,59 20.5,51"
          fill={isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.65)"} stroke={ol} strokeWidth="1.2" />
      )}
      {a.symbolId === "caveira" && (
        <text x="30" y="60" textAnchor="middle" fontSize="18"
          fill={isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)"}>☠</text>
      )}

      {/* ── HEAD ── */}
      <circle cx="30" cy="21" r="13" fill={skin} stroke={ol} strokeWidth={sw} />

      {/* MÁSCARA (behind other face features) */}
      {a.extraId === "mascara" && (
        <rect x="21" y="25" width="18" height="12" rx="4.5" fill="#00B4D8" stroke={ol} strokeWidth="1.5" opacity="0.9" />
      )}

      {/* HAIR */}
      <path d="M17 21 Q17 8 30 8 Q43 8 43 21 Q39 13 30 13 Q21 13 17 21Z" fill={hairFill} />
      {/* Hair side bits */}
      {mode === "child" && (
        <>
          <path d="M17 21 Q15 17 16 14 Q17 12 19 13 Q17 17 17 21Z" fill={hairFill} />
          <path d="M43 21 Q45 17 44 14 Q43 12 41 13 Q43 17 43 21Z" fill={hairFill} />
        </>
      )}

      {/* EYEBROWS */}
      <path d="M19.5 16 Q23.5 14 27.5 16" fill="none" stroke={hairFill} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32.5 16 Q36.5 14 40.5 16" fill="none" stroke={hairFill} strokeWidth="2.2" strokeLinecap="round" />

      {/* EYES */}
      <circle cx="25" cy="21" r={eyeR} fill="#1a1a1a" />
      <circle cx="35" cy="21" r={eyeR} fill="#1a1a1a" />
      <circle cx={25 + eyeR * 0.4} cy={21 - eyeR * 0.5} r={eyeR * 0.4} fill="white" />
      <circle cx={35 + eyeR * 0.4} cy={21 - eyeR * 0.5} r={eyeR * 0.4} fill="white" />

      {/* GLASSES (oculos extra OR adult hat oculos) */}
      {(a.extraId === "oculos" || a.hatId === "oculos") && (
        <g stroke="#1a1a1a" strokeWidth="2" fill="none">
          <circle cx="25" cy="21" r="5.5" />
          <circle cx="35" cy="21" r="5.5" />
          <line x1="29.5" y1="21" x2="30.5" y2="21" />
          <line x1="14.5" y1="19" x2="19.5" y2="20.5" />
          <line x1="40.5" y1="20.5" x2="45.5" y2="19" />
        </g>
      )}

      {/* NOSE */}
      <path d="M27.5 25.5 Q30 29 32.5 25.5" fill="none" stroke="#C4927A" strokeWidth="1.6" strokeLinecap="round" />

      {/* MOUTH */}
      {mode === "child"
        ? <path d="M23.5 30 Q30 35.5 36.5 30" fill="none" stroke="#9A5244" strokeWidth="2.4" strokeLinecap="round" />
        : <path d="M25 29.5 Q30 33 35 29.5" fill="none" stroke="#9A5244" strokeWidth="2" strokeLinecap="round" />
      }

      {/* VISOR */}
      {a.hatId === "visor" && (
        <g>
          <rect x="18.5" y="16.5" width="11.5" height="8" rx="3.5" fill="#050505" opacity="0.93" />
          <rect x="30" y="16.5" width="11.5" height="8" rx="3.5" fill="#050505" opacity="0.93" />
          <line x1="29.5" y1="20" x2="30" y2="20" stroke="#444" strokeWidth="2" />
          <line x1="15" y1="18.5" x2="18.5" y2="19.5" stroke="#555" strokeWidth="1.5" />
          <line x1="41.5" y1="19.5" x2="45" y2="18.5" stroke="#555" strokeWidth="1.5" />
          <rect x="19.5" y="17.5" width="5" height="2.5" rx="1" fill="rgba(255,255,255,0.1)" />
          <rect x="31" y="17.5" width="5" height="2.5" rx="1" fill="rgba(255,255,255,0.1)" />
        </g>
      )}

      {/* HEADSET */}
      {a.hatId === "headset" && (
        <g>
          <path d="M16 19 Q16 6 30 6 Q44 6 44 19" fill="none" stroke="#2d2d2d" strokeWidth="3.5" />
          <rect x="11.5" y="14" width="8" height="13" rx="4" fill="#444" stroke={ol} strokeWidth="1.5" />
          <rect x="40.5" y="14" width="8" height="13" rx="4" fill="#444" stroke={ol} strokeWidth="1.5" />
          <line x1="11.5" y1="25" x2="6" y2="32" stroke="#3d3d3d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="5" cy="33.5" r="3.5" fill="#333" stroke={ol} strokeWidth="1" />
        </g>
      )}

      {/* BONE */}
      {a.hatId === "bone" && (
        <g>
          <path d="M17 17 Q17 7 30 7 Q43 7 43 17" fill="#2a2a2a" stroke={ol} strokeWidth="1.5" />
          <rect x="17" y="13.5" width="26" height="8.5" rx="4.5" fill="#333" stroke={ol} strokeWidth="1.5" />
          <rect x="11" y="16" width="20" height="5.5" rx="2.5" fill="#444" stroke={ol} strokeWidth="1" />
          <circle cx="30" cy="9.5" r="3" fill="#555" />
        </g>
      )}

      {/* CHAPEU */}
      {a.hatId === "chapeu" && (
        <g>
          <ellipse cx="30" cy="8" rx="20" ry="5.5" fill="#1a1a1a" stroke={ol} strokeWidth={sw} />
          <rect x="17" y="0.5" width="26" height="10" rx="2.5" fill="#252525" stroke={ol} strokeWidth={sw} />
          {/* Band */}
          <rect x="17" y="7.5" width="26" height="3.5" rx="1.5" fill={c} opacity="0.85" />
        </g>
      )}

      {/* COROA */}
      {a.hatId === "coroa" && (
        <g>
          <polygon points="15,8 15,0 22.5,6 30,0 37.5,6 45,0 45,8"
            fill="#FFD700" stroke={ol} strokeWidth="2" />
          <rect x="15" y="5.5" width="30" height="7.5" rx="1.5" fill="#FFC107" stroke={ol} strokeWidth="1.5" />
          <circle cx="30" cy="3" r="3" fill="#E53935" />
          <circle cx="20" cy="7.5" r="2.2" fill="#2196F3" />
          <circle cx="40" cy="7.5" r="2.2" fill="#2196F3" />
        </g>
      )}

      {/* ANTENA */}
      {a.hatId === "antena" && (
        <g>
          <line x1="30" y1="8.5" x2="30" y2="-5" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="-7.5" r="5.5" fill="#F44336" stroke={ol} strokeWidth="1.5" />
          <circle cx="30" cy="-7.5" r="2.5" fill="#FF8A80" />
        </g>
      )}

      {/* CAPUZ */}
      {a.hatId === "capuz" && (
        <path d="M17 19 Q16 6 30 6 Q44 6 43 19 Q39 12 30 12 Q21 12 17 19Z"
          fill={c} opacity="0.85" stroke={ol} strokeWidth="1.5" />
      )}

    </svg>
  );
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

function AgentCard({ char, mode, onClick, state, size }: {
  char: AgentChar; mode: AgeMode; onClick: () => void;
  state: "idle" | "correct" | "wrong"; size: number;
}) {
  const ring =
    state === "correct" ? "ring-4 ring-green-400 bg-green-100/80 scale-110" :
    state === "wrong"   ? "ring-4 ring-red-400 bg-red-100/80 scale-90 opacity-50" :
    "ring-2 ring-white/60 hover:ring-white active:scale-95 bg-white/20 hover:bg-white/30";
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`relative rounded-2xl p-1 cursor-pointer transition-all duration-150 backdrop-blur-[2px] shadow-xl ${ring}`}
      style={{ touchAction: "manipulation" }}
    >
      <AgentSvg a={char.attrs} mode={mode} size={size} />
    </motion.button>
  );
}

// ── Command display ───────────────────────────────────────────────────────────

type InstrMode = "both" | "visual" | "audio";
function getInstrMode(d: number): InstrMode {
  if (d <= 4) return "both"; if (d <= 7) return "visual"; return "audio";
}

function CommandPanel({ command, colorHex, theme, onSpeak, instrMode }: {
  command: string; colorHex: string; theme: Theme; onSpeak: () => void; instrMode: InstrMode;
}) {
  const bg = theme === "GAMIFIED" ? "bg-slate-800 border-cyan-500/30" :
             theme === "COLORFUL" ? "bg-white border-purple-300" : "bg-white border-blue-200";
  const txt = theme === "GAMIFIED" ? "text-cyan-100" : "text-gray-800";
  const subTxt = theme === "GAMIFIED" ? "text-slate-400" : "text-slate-500";
  const showText = instrMode !== "audio";
  const showSpeaker = instrMode !== "visual";
  return (
    <div className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${bg}`}>
      <div className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-black/10 shadow" style={{ background: colorHex }} />
      {showText ? (
        <p className={`text-sm font-bold flex-1 leading-snug ${txt}`}>{command}</p>
      ) : (
        <div className="flex-1">
          <p className={`text-sm font-bold ${txt}`}>👂 Modo Auditivo</p>
          <p className={`text-xs ${subTxt}`}>Ouça e encontre o personagem</p>
        </div>
      )}
      {showSpeaker && (
        <button onClick={onSpeak} className="text-xl flex-shrink-0 active:scale-90 transition-transform" title="Ouvir">🔊</button>
      )}
    </div>
  );
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

function FocusTutorial({ theme, mode, onDone }: { theme: Theme; mode: AgeMode; onDone: () => void }) {
  const tutChars: AgentChar[] = [
    { id: "t0", isTarget: true,  attrs: { colorId: "azul", colorHex: mode === "adult" ? "#1565C0" : "#1E88E5", colorLabel: "azul", hatId: "bone", hatLabel: "boné", extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
    { id: "t1", isTarget: false, attrs: { colorId: "vermelho", colorHex: "#E53935", colorLabel: "vermelho", hatId: "bone", hatLabel: "boné", extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
    { id: "t2", isTarget: false, attrs: { colorId: "azul", colorHex: "#1E88E5", colorLabel: "azul", hatId: "chapeu", hatLabel: "chapéu", extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
    { id: "t3", isTarget: false, attrs: { colorId: "verde", colorHex: "#43A047", colorLabel: "verde", hatId: null, hatLabel: null, extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
    { id: "t4", isTarget: false, attrs: { colorId: "laranja", colorHex: "#FB8C00", colorLabel: "laranja", hatId: null, hatLabel: null, extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
    { id: "t5", isTarget: false, attrs: { colorId: "roxo", colorHex: "#8E24AA", colorLabel: "roxo", hatId: null, hatLabel: null, extraId: null, extraLabel: null, symbolId: null, symbolLabel: null } },
  ].sort(() => Math.random() - 0.5);

  const cmd = mode === "child" ? "Clique na criaturinha azul com boné" :
              mode === "teen"  ? "Clique no avatar azul com boné" :
                                 "Selecione o agente com uniforme azul e boné";

  function TutStep({ onStepDone }: { onStepDone: () => void }) {
    const [picked, setPicked] = useState<string | null>(null);
    function tap(id: string, isTarget: boolean) {
      if (picked) return;
      setPicked(id);
      if (isTarget) setTimeout(onStepDone, 700);
    }
    return (
      <div className="space-y-3">
        <CommandPanel command={cmd} colorHex="#1E88E5" theme={theme} onSpeak={() => speak(cmd)} instrMode="both" />
        <div className="grid grid-cols-3 gap-2">
          {tutChars.map(ch => (
            <AgentCard key={ch.id} char={ch} mode={mode}
              onClick={() => tap(ch.id, ch.isTarget)}
              state={picked === ch.id ? (ch.isTarget ? "correct" : "wrong") : "idle"}
              size={60} />
          ))}
        </div>
      </div>
    );
  }

  const title = mode === "child" ? "Focus Criaturas" : mode === "teen" ? "Focus Avatares" : "Focus Agentes";
  return (
    <TutorialBase theme={theme} title={title}
      steps={[{ instruction: "Leia o comando e clique no personagem correto!", content: (done) => <TutStep onStepDone={done} /> }]}
      onDone={onDone} />
  );
}

// ── Scene Background ──────────────────────────────────────────────────────────

function SceneBg({ theme }: { theme: Theme }) {
  if (theme === "GAMIFIED") return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#04040f 0%,#0d0825 45%,#1a0840 70%,#260a55 100%)" }} />
      {[...Array(40)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
            opacity: 0.3 + (i % 6) * 0.1,
            left: `${(i * 37 + 11) % 100}%`, top: `${(i * 23 + 5) % 72}%` }} />
      ))}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 90" preserveAspectRatio="none">
        <path d="M0 90 L0 48 Q30 36 60 44 Q90 52 120 38 Q150 24 180 42 Q210 58 240 38 Q270 20 300 44 Q330 62 360 40 Q390 22 400 40 L400 90Z" fill="#180540" />
        <path d="M0 90 L0 62 Q40 50 80 58 Q120 64 160 52 Q200 40 240 56 Q280 70 320 54 Q360 38 400 56 L400 90Z" fill="#2a0a68" />
      </svg>
    </div>
  );
  if (theme === "COLORFUL") return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#87CEEB 0%,#a8dcf5 40%,#c8edb8 70%,#7AC143 100%)" }} />
      <div className="absolute top-[7%] left-[8%] opacity-85">
        <div className="w-24 h-9 rounded-full bg-white/95 shadow-md" />
        <div className="w-16 h-7 rounded-full bg-white/95 shadow-md -mt-4 ml-5" />
      </div>
      <div className="absolute top-[10%] right-[14%] opacity-75">
        <div className="w-18 h-8 rounded-full bg-white/90 shadow" style={{ width: 72 }} />
        <div className="w-12 h-6 rounded-full bg-white/90 shadow -mt-3 ml-4" />
      </div>
      <div className="absolute top-[18%] left-[55%] opacity-60">
        <div className="w-14 h-6 rounded-full bg-white/90" />
        <div className="w-9 h-5 rounded-full bg-white/90 -mt-3 ml-2" />
      </div>
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 75" preserveAspectRatio="none">
        <path d="M0 75 L0 42 Q50 22 100 37 Q150 54 200 30 Q250 8 300 34 Q350 56 400 36 L400 75Z" fill="#4a8f22" />
        <path d="M0 75 L0 56 Q60 44 120 54 Q180 62 240 50 Q300 38 360 52 Q385 58 400 54 L400 75Z" fill="#5cb82e" />
      </svg>
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#dff0fa 0%,#c5e1f5 45%,#d4eaf5 75%,#a8cde0 100%)" }} />
      <div className="absolute top-[9%] left-[7%] opacity-45">
        <div className="w-28 h-9 rounded-full bg-white shadow-sm" />
        <div className="w-18 h-7 rounded-full bg-white shadow-sm -mt-4 ml-6" style={{ width: 72 }} />
      </div>
      <div className="absolute top-[5%] right-[11%] opacity-32">
        <div className="w-22 h-8 rounded-full bg-white" style={{ width: 88 }} />
        <div className="w-13 h-6 rounded-full bg-white -mt-3 ml-5" style={{ width: 52 }} />
      </div>
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 65" preserveAspectRatio="none">
        <path d="M0 65 L0 38 Q80 22 160 36 Q240 50 320 28 Q370 14 400 30 L400 65Z" fill="#7aafc8" />
        <path d="M0 65 L0 50 Q80 38 160 48 Q240 58 320 44 Q370 36 400 46 L400 65Z" fill="#8cbfd5" />
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const MAX_ROUNDS = 10;

export interface FocusAgentsProps {
  difficulty: number; theme: Theme;
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
  const [fallers, setFallers] = useState<FallingChar[]>([]);
  const [command, setCommand] = useState("");
  const [targetId, setTargetId] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; rt: number }[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStart = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const roundResultsRef = useRef(roundResults);
  const resolvedIds = useRef(new Set<string>());
  const doneRef = useRef(false);
  roundResultsRef.current = roundResults;

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const prepareRound = useCallback((r: number) => {
    const d = Math.max(1, Math.min(10, difficulty + Math.floor(r / 3)));
    const gen = generateRound(mode, d);
    setChars(gen.chars);
    setFallers([]);
    setCommand(gen.command);
    setTargetId(gen.targetId);
    setPicked(null);
    setTimedOut(false);
    setTimerLeft(timerSec(d));
    setGamePhase("command");
    resolvedIds.current = new Set();
    const instrMode = forceMode === "visual" ? "visual" : forceMode === "auditivo" ? "audio" : getInstrMode(d);
    if (instrMode !== "visual") speak(gen.command);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, forceMode]);

  function startPlaying() {
    const effectiveDiff = Math.max(1, Math.min(10, difficulty + Math.floor(round / 3)));
    const n = chars.length;
    const charSize = n <= 5 ? 78 : n <= 7 ? 70 : n <= 9 ? 62 : n <= 11 ? 55 : 50;
    const t = timerSec(effectiveDiff);
    const baseFallDur = t !== null ? t + 2.5 : 13;

    // Spread characters across 10%-90% of width
    const slotW = 80 / n;
    const newFallers: FallingChar[] = chars.map((ch, i) => {
      const slotCenter = 10 + i * slotW + slotW / 2;
      const jitter = (Math.random() - 0.5) * slotW * 0.55;
      const x = Math.max(8, Math.min(92, slotCenter + jitter));
      return {
        uid: `${ch.id}-${round}`,
        char: ch,
        x,
        size: charSize,
        fallDur: baseFallDur * (0.85 + Math.random() * 0.3),
      };
    });

    setFallers(newFallers);
    setGamePhase("playing");
    roundStart.current = Date.now();
    clearTimer();

    if (t !== null && t > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev === null || prev <= 1) {
            clearTimer();
            if (!resolvedIds.current.has("timeout")) {
              resolvedIds.current.add("timeout");
              handleResult(false, round);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }

  function handleResult(correct: boolean, r: number) {
    if (doneRef.current) return;
    clearTimer();
    setFallers([]);
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
        doneRef.current = true;
        const correctCount = newResults.filter(x => x.correct).length;
        const accuracy = correctCount / MAX_ROUNDS;
        const avgRt = newResults.filter(x => x.correct).reduce((s, x) => s + x.rt, 0) / (correctCount || 1);
        onComplete({
          exerciseId: "focus-agents", domain: "attention",
          score: calculateExerciseScore("focus-agents", accuracy, Math.round(avgRt), difficulty),
          accuracy, reactionTime: Math.round(avgRt), difficulty,
          duration: Math.round((Date.now() - sessionStart.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: correctCount, mode },
        });
      } else {
        setRound(nextRound);
        prepareRound(nextRound);
      }
    }, 1300);
  }

  function handleFallerClick(faller: FallingChar) {
    if (gamePhase !== "playing") return;
    if (resolvedIds.current.has(faller.uid)) return;
    resolvedIds.current.add(faller.uid);
    resolvedIds.current.add("timeout");
    setPicked(faller.char.id);
    handleResult(faller.char.isTarget, round);
  }

  function handleFallerExit(faller: FallingChar) {
    if (resolvedIds.current.has(faller.uid)) return;
    resolvedIds.current.add(faller.uid);
    if (faller.char.isTarget && !resolvedIds.current.has("timeout")) {
      resolvedIds.current.add("timeout");
      handleResult(false, round);
    }
  }

  useEffect(() => {
    if (!showTutorial) { sessionStart.current = Date.now(); prepareRound(0); }
    return () => { clearTimer(); if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  if (showTutorial) return <FocusTutorial theme={theme} mode={mode} onDone={() => setShowTutorial(false)} />;

  // HUD palette
  const hudBg = theme === "GAMIFIED" ? "bg-black/65 border-purple-500/40 text-white"
    : theme === "COLORFUL" ? "bg-white/85 border-white/70 text-gray-800"
    : "bg-white/85 border-white/60 text-slate-800";
  const dotColor = (i: number) => {
    if (i < roundResults.length) return roundResults[i].correct ? "bg-green-400" : "bg-red-400";
    if (i === round) return (theme === "GAMIFIED" ? "bg-cyan-400" : "bg-blue-500") + " animate-pulse";
    return theme === "GAMIFIED" ? "bg-white/20" : "bg-black/15";
  };

  const effectiveDiff = Math.max(1, Math.min(10, difficulty + Math.floor(round / 3)));
  const instrMode: InstrMode = forceMode === "visual" ? "visual" : forceMode === "auditivo" ? "audio" : getInstrMode(effectiveDiff);
  const targetAttrs = chars.find(c => c.id === targetId)?.attrs;
  const gameTitle = mode === "child" ? "🎯 Focus Criaturas" : mode === "teen" ? "🎮 Focus Avatares" : "🔍 Focus Agentes";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 40 }}>
      <SceneBg theme={theme} />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-2 pb-1">
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 border backdrop-blur-sm ${hudBg}`}>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">{gameTitle}</span>
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${dotColor(i)}`} />
            ))}
          </div>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">{round + 1}/{MAX_ROUNDS}</span>
          {timerLeft !== null && gamePhase === "playing" && (
            <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg ml-1 ${
              timerLeft <= 5 ? "bg-red-500 text-white animate-pulse" : "bg-black/20"
            }`}>⏱{timerLeft}s</span>
          )}
        </div>
      </div>

      {/* Falling characters */}
      <div className="absolute inset-0 z-10" style={{ paddingTop: 56 }}>
        <AnimatePresence>
          {fallers.map(faller => {
            const state: "idle" | "correct" | "wrong" =
              picked === faller.char.id ? (faller.char.isTarget ? "correct" : "wrong") :
              (picked !== null && faller.char.isTarget ? "correct" : "idle");
            return (
              <motion.div
                key={faller.uid}
                className="absolute"
                style={{ left: `${faller.x}%`, top: 0, transform: "translateX(-50%)", touchAction: "manipulation" }}
                initial={{ y: -160 }}
                animate={{ y: 1600 }}
                transition={{ duration: faller.fallDur, ease: "linear" }}
                onAnimationComplete={() => handleFallerExit(faller)}
                onPointerDown={(e) => { e.stopPropagation(); handleFallerClick(faller); }}
              >
                <AgentCard char={faller.char} mode={mode} onClick={() => handleFallerClick(faller)} state={state} size={faller.size} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Command card */}
      <AnimatePresence>
        {gamePhase === "command" && (
          <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}>
            <div className={`w-full max-w-sm rounded-3xl shadow-2xl border-2 overflow-hidden ${
              theme === "GAMIFIED" ? "bg-slate-900/96 border-cyan-500/50"
              : theme === "COLORFUL" ? "bg-white/96 border-purple-300"
              : "bg-white/96 border-blue-200"
            }`}>
              <div className={`px-4 py-2 text-center text-xs font-bold uppercase tracking-widest ${
                theme === "GAMIFIED" ? "bg-cyan-500/20 text-cyan-300"
                : theme === "COLORFUL" ? "bg-purple-100 text-purple-600"
                : "bg-blue-50 text-blue-600"
              }`}>
                {instrMode === "audio" ? "👂 Ouça o comando" : "👁 Leia o comando"}
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full shadow-lg border-4 border-white/60"
                    style={{ background: targetAttrs?.colorHex ?? "#999" }} />
                </div>
                {instrMode !== "audio" ? (
                  <p className={`text-center font-bold text-lg leading-snug ${theme === "GAMIFIED" ? "text-white" : "text-gray-800"}`}>
                    {command}
                  </p>
                ) : (
                  <div className="text-center space-y-1">
                    <p className={`font-bold text-base ${theme === "GAMIFIED" ? "text-cyan-300" : "text-indigo-600"}`}>👂 Modo Auditivo</p>
                    <p className={`text-sm ${theme === "GAMIFIED" ? "text-slate-400" : "text-gray-500"}`}>Ouça e encontre o personagem</p>
                  </div>
                )}
                <div className="flex gap-3">
                  {instrMode !== "visual" && (
                    <button onClick={() => speak(command)}
                      className={`flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                        theme === "GAMIFIED" ? "border-cyan-500 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20"
                        : theme === "COLORFUL" ? "border-purple-300 text-purple-600 bg-purple-50 hover:bg-purple-100"
                        : "border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100"
                      }`}>🔊 Ouvir</button>
                  )}
                  <button onClick={startPlaying}
                    className={`flex-1 h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                      theme === "GAMIFIED" ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : theme === "COLORFUL" ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                    }`}>Encontrar! →</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback overlay */}
      <AnimatePresence>
        {gamePhase === "feedback" && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>
            <div className={`px-10 py-7 rounded-3xl shadow-2xl text-center border-2 ${
              picked && chars.find(c => c.id === picked)?.isTarget
                ? "bg-green-500/96 border-green-300 text-white"
                : timedOut
                  ? "bg-orange-500/96 border-orange-300 text-white"
                  : "bg-red-500/96 border-red-300 text-white"
            }`}>
              <p className="text-5xl mb-2">
                {picked && chars.find(c => c.id === picked)?.isTarget ? "✅" : timedOut ? "⏱" : "❌"}
              </p>
              <p className="font-bold text-2xl">
                {picked && chars.find(c => c.id === picked)?.isTarget ? "Correto!" : timedOut ? "Tempo!" : "Errado!"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
