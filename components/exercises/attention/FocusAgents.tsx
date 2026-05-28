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
// viewBox 0 0 60 112  —  chibi: cabeça grande (rx22), corpo pequeno (w24)

function AgentSvg({ a, mode, size = 80 }: { a: CharAttrs; mode: AgeMode; size?: number }) {
  const c = a.colorHex;
  const skin = "#FFD9B8";
  const ol = "#1a1a1a";
  const isLight = ["#CFD8DC", "#DDE1F0", "#FFD600", "#FB8C00"].includes(c);
  const hair = mode === "child" ? "#5D3317" : mode === "teen" ? "#0d0d0d" : "#3E2723";
  const badgeColor = a.extraId ? BADGE_COLORS[a.extraId] : null;
  const h = Math.round(size * 112 / 60);

  return (
    <svg width={size} height={h} viewBox="0 0 60 112"
      style={{ overflow: "visible", filter: "drop-shadow(0px 6px 14px rgba(0,0,0,0.6))" }}>

      {/* ═══ BACKPACK (behind body) ═══ */}
      {a.extraId === "mochila" && (
        <g>
          <rect x="2" y="51" width="14" height="20" rx="4" fill={isLight ? "#9E9E9E" : "#6D4C41"} stroke={ol} strokeWidth="1.3"/>
          <rect x="3.5" y="53" width="11" height="16" rx="3" fill={isLight ? "#BDBDBD" : "#8D6E63"} opacity="0.9"/>
          <line x1="6" y1="58" x2="12" y2="58" stroke="rgba(0,0,0,0.3)" strokeWidth="1.1"/>
          <line x1="6" y1="63" x2="12" y2="63" stroke="rgba(0,0,0,0.3)" strokeWidth="1.1"/>
          <path d="M15 53 Q19 58 18 68" fill="none" stroke={isLight ? "#888" : "#5D4037"} strokeWidth="1.4" strokeLinecap="round"/>
        </g>
      )}

      {/* ═══ HAIR (behind head, not drawn if capuz) ═══ */}
      {a.hatId !== "capuz" && (
        <>
          {mode === "child" && (
            <>
              {/* Fluffy blob + top knob + side puffs */}
              <ellipse cx="30" cy="12" rx="24" ry="16" fill={hair}/>
              <circle cx="30" cy="1" r="8" fill={hair}/>
              <path d="M6 23 Q3 9 8 2" fill="none" stroke={hair} strokeWidth="9" strokeLinecap="round"/>
              <path d="M54 23 Q57 9 52 2" fill="none" stroke={hair} strokeWidth="9" strokeLinecap="round"/>
            </>
          )}
          {mode === "teen" && (
            <>
              {/* Swept asymmetric + spiky top */}
              <path d="M8 23 Q9 1 26 0 Q41 0 53 11 Q57 18 53 23 Q49 7 33 7 Q16 7 8 23Z" fill={hair}/>
              <path d="M53 23 Q59 9 57 1" fill="none" stroke={hair} strokeWidth="7" strokeLinecap="round"/>
            </>
          )}
          {mode === "adult" && (
            /* Neat professional cap */
            <path d="M10 23 Q13 4 30 3 Q47 4 50 23 Q46 11 30 11 Q14 11 10 23Z" fill={hair}/>
          )}
        </>
      )}

      {/* ═══ CAPUZ BACK ═══ */}
      {a.hatId === "capuz" && (
        <ellipse cx="30" cy="14" rx="25" ry="22" fill={c} stroke={ol} strokeWidth="1.6" opacity="0.96"/>
      )}

      {/* ═══ HEAD ═══ */}
      <ellipse cx="30" cy="25" rx="22" ry="22" fill={skin} stroke={ol} strokeWidth="2"/>
      {/* Head shine */}
      <ellipse cx="22" cy="13" rx="9" ry="5.5" fill="rgba(255,255,255,0.28)" transform="rotate(-22 22 13)"/>

      {/* ═══ CHEEKS (child only) ═══ */}
      {mode === "child" && (
        <>
          <ellipse cx="13" cy="33" rx="5.5" ry="3.5" fill="#FFB3B3" opacity="0.65"/>
          <ellipse cx="47" cy="33" rx="5.5" ry="3.5" fill="#FFB3B3" opacity="0.65"/>
        </>
      )}

      {/* ═══ MASK (behind face) ═══ */}
      {a.extraId === "mascara" && (
        <rect x="14" y="24" width="32" height="15" rx="6" fill="#00B4D8" stroke={ol} strokeWidth="1.2" opacity="0.94"/>
      )}

      {/* ═══ EYEBROWS ═══ */}
      {mode === "child" ? (
        <>
          <path d="M14 18 Q19.5 15 24.5 18" fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round"/>
          <path d="M35.5 18 Q40.5 15 46 18" fill="none" stroke={hair} strokeWidth="2.6" strokeLinecap="round"/>
        </>
      ) : mode === "teen" ? (
        <>
          <path d="M14.5 18.5 Q19.5 16 25 18" fill="none" stroke={hair} strokeWidth="2.3" strokeLinecap="round"/>
          <path d="M35 18.5 Q40.5 16 46 17.5" fill="none" stroke={hair} strokeWidth="2.3" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M15 18.5 Q20 16.5 25.5 18.5" fill="none" stroke={hair} strokeWidth="2.1" strokeLinecap="round"/>
          <path d="M34.5 18.5 Q40 16.5 45 18.5" fill="none" stroke={hair} strokeWidth="2.1" strokeLinecap="round"/>
        </>
      )}

      {/* ═══ EYES (big chibi ovals) ═══ */}
      {/* Left */}
      <ellipse cx="21" cy="28" rx="7" ry="8" fill="white" stroke={ol} strokeWidth="1.5"/>
      <ellipse cx="22" cy="29.5" rx="4.8" ry="5.5" fill="#111"/>
      <circle cx="25" cy="26" r="2.2" fill="white" opacity="0.95"/>
      <circle cx="20" cy="32.5" r="1.3" fill="white" opacity="0.45"/>
      {/* Right */}
      <ellipse cx="39" cy="28" rx="7" ry="8" fill="white" stroke={ol} strokeWidth="1.5"/>
      <ellipse cx="40" cy="29.5" rx="4.8" ry="5.5" fill="#111"/>
      <circle cx="43" cy="26" r="2.2" fill="white" opacity="0.95"/>
      <circle cx="38" cy="32.5" r="1.3" fill="white" opacity="0.45"/>

      {/* ═══ GLASSES ═══ */}
      {(a.extraId === "oculos" || a.hatId === "oculos") && (
        <g stroke={ol} strokeWidth="1.8" fill="none">
          <ellipse cx="21" cy="28" rx="8.5" ry="9.5"/>
          <ellipse cx="39" cy="28" rx="8.5" ry="9.5"/>
          <line x1="29.5" y1="28" x2="30.5" y2="28"/>
          <line x1="6" y1="22.5" x2="12.5" y2="26"/>
          <line x1="47.5" y1="26" x2="54" y2="22.5"/>
        </g>
      )}

      {/* ═══ VISOR ═══ */}
      {a.hatId === "visor" && (
        <g>
          <ellipse cx="21" cy="28" rx="8.5" ry="9.5" fill="#020a14" opacity="0.97"/>
          <ellipse cx="39" cy="28" rx="8.5" ry="9.5" fill="#020a14" opacity="0.97"/>
          <line x1="29.5" y1="28" x2="30.5" y2="28" stroke="#1a3a5c" strokeWidth="2.5"/>
          <ellipse cx="21" cy="24" rx="5.5" ry="3" fill="rgba(100,180,255,0.13)"/>
          <ellipse cx="39" cy="24" rx="5.5" ry="3" fill="rgba(100,180,255,0.13)"/>
          <line x1="6" y1="22.5" x2="12.5" y2="26" stroke={ol} strokeWidth="1.8"/>
          <line x1="47.5" y1="26" x2="54" y2="22.5" stroke={ol} strokeWidth="1.8"/>
        </g>
      )}

      {/* ═══ NOSE ═══ */}
      <circle cx="30" cy="36.5" r="2" fill="#C4927A" opacity="0.65"/>

      {/* ═══ MOUTH ═══ */}
      {mode === "child"
        ? <path d="M20 41.5 Q30 48 40 41.5" fill="none" stroke="#9A5244" strokeWidth="2.6" strokeLinecap="round"/>
        : mode === "teen"
        ? <path d="M23 41 Q30 45 37 41" fill="none" stroke="#9A5244" strokeWidth="2.1" strokeLinecap="round"/>
        : <path d="M24 40.5 Q30 44 36 40.5" fill="none" stroke="#9A5244" strokeWidth="1.9" strokeLinecap="round"/>
      }

      {/* ═══ CAPUZ FRONT RIM ═══ */}
      {a.hatId === "capuz" && (
        <path d="M8 30 Q8 6 30 5 Q52 6 52 30 Q46 17 30 17 Q14 17 8 30Z"
          fill={c} stroke={ol} strokeWidth="1.5" opacity="0.96"/>
      )}

      {/* ═══ BONE (baseball cap) ═══ */}
      {a.hatId === "bone" && (
        <g>
          {/* Dome — cobre o topo da cabeça */}
          <path d="M10 23 Q10 3 30 2 Q50 3 50 23"
            fill="#2d2d2d" stroke={ol} strokeWidth="1.6"/>
          {/* Faixa da testa */}
          <rect x="10" y="19" width="40" height="6.5" rx="3"
            fill="#383838" stroke={ol} strokeWidth="1.4"/>
          {/* Aba frontal — sai para a esquerda como boné de lado */}
          <path d="M10 21.5 L-5 21 Q-7 24.5 -5 27 L10 25.5Z"
            fill="#2d2d2d" stroke={ol} strokeWidth="1.3"/>
          {/* Sombra embaixo da aba */}
          <line x1="10" y1="25.5" x2="-4" y2="26.5"
            stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Brilho da aba */}
          <line x1="10" y1="22.5" x2="-4" y2="22"
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
          {/* Botão no topo */}
          <circle cx="30" cy="3.5" r="3.5" fill="#383838"/>
          {/* Costuras do dome */}
          <path d="M30 3.5 Q26 13 22 23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round"/>
          <path d="M30 3.5 Q34 13 38 23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round"/>
        </g>
      )}

      {/* ═══ CHAPEU (top hat / cowboy) ═══ */}
      {a.hatId === "chapeu" && (
        <g>
          {/* Aba larga em volta */}
          <ellipse cx="30" cy="7" rx="28" ry="7" fill="#111" stroke={ol} strokeWidth="1.8"/>
          {/* Copa alta */}
          <rect x="15" y="-10" width="30" height="19" rx="3" fill="#1a1a1a" stroke={ol} strokeWidth="1.8"/>
          {/* Faixa colorida */}
          <rect x="15" y="5.5" width="30" height="4.5" rx="1.5" fill={c} opacity="0.92"/>
          {/* Brilho no topo da copa */}
          <ellipse cx="25" cy="-8" rx="7" ry="2.5" fill="rgba(255,255,255,0.1)" transform="rotate(-12 25 -8)"/>
          {/* Sombra da aba */}
          <ellipse cx="30" cy="9.5" rx="28" ry="3" fill="rgba(0,0,0,0.2)" stroke="none"/>
        </g>
      )}

      {/* ═══ COROA ═══ */}
      {a.hatId === "coroa" && (
        <g>
          <polygon points="8,11 8,0 19,7 30,-0.5 41,7 52,0 52,11" fill="#FFD700" stroke={ol} strokeWidth="1.9"/>
          <rect x="8" y="7.5" width="44" height="9" rx="2.5" fill="#FFC107" stroke={ol} strokeWidth="1.5"/>
          <circle cx="30" cy="1.5" r="4.5" fill="#E53935"/>
          <circle cx="17.5" cy="9" r="3.5" fill="#2196F3"/>
          <circle cx="42.5" cy="9" r="3.5" fill="#2196F3"/>
          <path d="M10 9 Q30 5 50 9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        </g>
      )}

      {/* ═══ ANTENA ═══ */}
      {a.hatId === "antena" && (
        <g>
          <line x1="30" y1="4" x2="30" y2="-9" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="30" cy="-13" r="8" fill="#F44336" stroke={ol} strokeWidth="1.5"/>
          <circle cx="30" cy="-13" r="4.5" fill="#FF8A80"/>
          <circle cx="33" cy="-16" r="2" fill="rgba(255,255,255,0.5)"/>
        </g>
      )}

      {/* ═══ HEADSET ═══ */}
      {a.hatId === "headset" && (
        <g>
          <path d="M8 24 Q8 2 30 2 Q52 2 52 24" fill="none" stroke="#1a1a1a" strokeWidth="4.5"/>
          <rect x="4" y="16" width="11" height="16" rx="5.5" fill="#2d2d2d" stroke={ol} strokeWidth="1.5"/>
          <rect x="45" y="16" width="11" height="16" rx="5.5" fill="#2d2d2d" stroke={ol} strokeWidth="1.5"/>
          <ellipse cx="9.5" cy="23" rx="4" ry="5" fill="#3d3d3d"/>
          <ellipse cx="50.5" cy="23" rx="4" ry="5" fill="#3d3d3d"/>
          <line x1="5" y1="30" x2="-1" y2="41" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="-1.5" cy="43" r="4.5" fill="#1a1a1a" stroke={ol} strokeWidth="1"/>
        </g>
      )}

      {/* ═══ NECK ═══ */}
      <rect x="26" y="45" width="8" height="7" rx="4" fill={skin} stroke={ol} strokeWidth="1.5"/>

      {/* ═══ BODY ═══ */}
      <rect x="18" y="49" width="24" height="21" rx="9" fill={c} stroke={ol} strokeWidth="2"/>
      <ellipse cx="24" cy="54" rx="6.5" ry="4" fill="rgba(255,255,255,0.28)" transform="rotate(-20 24 54)"/>
      <rect x="35" y="51" width="7" height="17" rx="4" fill="rgba(0,0,0,0.12)" opacity="0.9"/>
      <line x1="30" y1="50" x2="30" y2="69" stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)"} strokeWidth="1.5"/>

      {/* ═══ BADGE ═══ */}
      {badgeColor && (
        <g>
          <rect x="19" y="54" width="11" height="9.5" rx="2" fill={badgeColor} stroke={ol} strokeWidth="1.2"/>
          <rect x="19.5" y="54.5" width="10" height="3.5" rx="1.5" fill="rgba(255,255,255,0.3)"/>
          <rect x="19.5" y="59" width="6" height="2" rx="1" fill="rgba(255,255,255,0.5)"/>
        </g>
      )}

      {/* ═══ GRAVATA BORBOLETA ═══ */}
      {a.extraId === "gravata" && (
        <g transform="translate(30,51.5)">
          <polygon points="-6,-3.5 0,0 -6,3.5" fill="#E53935" stroke={ol} strokeWidth="1"/>
          <polygon points="6,-3.5 0,0 6,3.5" fill="#C62828" stroke={ol} strokeWidth="1"/>
          <circle cx="0" cy="0" r="2.5" fill="#B71C1C" stroke={ol} strokeWidth="0.8"/>
        </g>
      )}

      {/* ═══ BODY SYMBOLS ═══ */}
      {a.symbolId === "estrela" && (
        <polygon points="30,53 31.8,58.5 37.8,58.5 33,62 34.8,67.5 30,64 25.2,67.5 27,62 22.2,58.5 28.2,58.5"
          fill="#FFD600" stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "coracao" && (
        <path d="M30 67 C30 67 22 61 22 56 C22 53 25.5 51 30 56 C34.5 51 38 53 38 56 C38 61 30 67 30 67Z"
          fill="#F06292" stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "raio" && (
        <polygon points="33,50 27,61 32,58.5 26.5,71 37.5,59.5 32,62"
          fill="#FFD600" stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "triangulo" && (
        <polygon points="30,52 39,67 21,67"
          fill={isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.65)"} stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "circulo" && (
        <circle cx="30" cy="60" r="7.5"
          fill={isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "quadrado" && (
        <rect x="22.5" y="52" width="15" height="15"
          fill={isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "x-mark" && (
        <g stroke={isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)"} strokeWidth="3.2" strokeLinecap="round">
          <line x1="23" y1="52" x2="37" y2="66"/>
          <line x1="37" y1="52" x2="23" y2="66"/>
        </g>
      )}
      {a.symbolId === "diamante" && (
        <polygon points="30,52 38.5,60 30,68 21.5,60"
          fill={isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)"} stroke={ol} strokeWidth="1"/>
      )}
      {a.symbolId === "caveira" && (
        <text x="30" y="67.5" textAnchor="middle" fontSize="15"
          fill={isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.8)"}>☠</text>
      )}

      {/* ═══ ARMS ═══ */}
      <path d="M18 52 Q7 57 6 68 L12 69 Q12 60 20 55Z"
        fill={c} stroke={ol} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M42 52 Q53 57 54 68 L48 69 Q48 60 40 55Z"
        fill={c} stroke={ol} strokeWidth="1.8" strokeLinejoin="round"/>

      {/* ═══ HANDS / LUVAS ═══ */}
      {a.extraId === "luvas" ? (
        <>
          <ellipse cx="9" cy="70" rx="5.5" ry="5" fill="#7B2FBE" stroke={ol} strokeWidth="1.8"/>
          <ellipse cx="51" cy="70" rx="5.5" ry="5" fill="#7B2FBE" stroke={ol} strokeWidth="1.8"/>
        </>
      ) : (
        <>
          <ellipse cx="9" cy="70" rx="5.5" ry="5" fill={skin} stroke={ol} strokeWidth="1.8"/>
          <ellipse cx="51" cy="70" rx="5.5" ry="5" fill={skin} stroke={ol} strokeWidth="1.8"/>
        </>
      )}

      {/* ═══ BELT ═══ */}
      <rect x="18" y="68.5" width="24" height="5.5" rx="2.8"
        fill={isLight ? "#37474F" : "#0d0d0d"} stroke={ol} strokeWidth="1.3"/>
      <rect x="27" y="68.5" width="6" height="5.5" rx="2"
        fill={isLight ? "#546E7A" : "rgba(255,255,255,0.35)"}/>

      {/* ═══ LEGS ═══ */}
      <rect x="19" y="72" width="10" height="14" rx="5" fill={c} stroke={ol} strokeWidth="1.8"/>
      <rect x="31" y="72" width="10" height="14" rx="5" fill={c} stroke={ol} strokeWidth="1.8"/>

      {/* ═══ BOOTS ═══ */}
      <ellipse cx="24" cy="87" rx="10.5" ry="6" fill="#111" stroke={ol} strokeWidth="1.8"/>
      <ellipse cx="36" cy="87" rx="10.5" ry="6" fill="#111" stroke={ol} strokeWidth="1.8"/>
      <ellipse cx="21.5" cy="84.5" rx="5.5" ry="2.5" fill="rgba(255,255,255,0.18)"/>
      <ellipse cx="33.5" cy="84.5" rx="5.5" ry="2.5" fill="rgba(255,255,255,0.18)"/>

    </svg>
  );
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

function AgentCard({ char, mode, onClick, state, size }: {
  char: AgentChar; mode: AgeMode; onClick: () => void;
  state: "idle" | "correct" | "wrong"; size: number;
}) {
  const ring =
    state === "correct" ? "ring-4 ring-green-400 bg-green-500/20 scale-110" :
    state === "wrong"   ? "ring-4 ring-red-400 bg-red-500/20 scale-90 opacity-50" :
    "ring-1 ring-white/30 hover:ring-white/60 active:scale-95 bg-white/10 hover:bg-white/20";
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`relative rounded-2xl p-1 cursor-pointer transition-all duration-150 backdrop-blur-sm shadow-xl ${ring}`}
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
  const isColorful = theme === "COLORFUL";
  const isGamified = theme === "GAMIFIED";
  const palette = isColorful
    ? { r: ["rgba(236,72,153,.55)","rgba(168,85,247,.45)","rgba(99,102,241,.35)","rgba(59,130,246,.25)","rgba(16,185,129,.2)"],
        glow: "rgba(236,72,153,.45)", bg0: "#1a0045", bg1: "#080018" }
    : isGamified
    ? { r: ["rgba(147,51,234,.6)","rgba(99,102,241,.5)","rgba(167,139,250,.4)","rgba(192,132,252,.3)","rgba(216,180,254,.2)"],
        glow: "rgba(147,51,234,.5)", bg0: "#0d0320", bg1: "#020008" }
    : { r: ["rgba(59,130,246,.5)","rgba(99,102,241,.4)","rgba(139,92,246,.3)","rgba(147,197,253,.25)","rgba(196,181,253,.2)"],
        glow: "rgba(59,130,246,.45)", bg0: "#060e30", bg1: "#010510" };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 25%, ${palette.bg0} 0%, ${palette.bg1} 100%)` }} />
      {[...Array(55)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: i%6===0?2:1, height: i%6===0?2:1, opacity: 0.1+(i%9)*0.06,
            left: `${(i*41+7)%100}%`, top: `${(i*29+3)%100}%` }} />
      ))}
      <div className="absolute" style={{ top: "30%", left: "50%", transform: "translate(-50%,-50%)" }}>
        {palette.r.map((color, i) => {
          const w = 60 + i * 48, h = 38 + i * 30;
          return (
            <motion.div key={i} className="absolute rounded-full border-2"
              style={{ width: w, height: h, marginLeft: -w/2, marginTop: -h/2, borderColor: color }}
              animate={{ rotate: i%2===0 ? 360 : -360 }}
              transition={{ duration: 8+i*2, repeat: Infinity, ease: "linear" }} />
          );
        })}
        <div className="absolute w-16 h-10 rounded-full"
          style={{ marginLeft: -32, marginTop: -20,
            background: `radial-gradient(ellipse, rgba(255,255,255,.85) 0%, ${palette.glow} 50%, transparent 75%)` }} />
      </div>
      <div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${palette.glow.replace(/[\d.]+\)$/, "0.1)")} 0%, transparent 55%)` }} />
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
  const dotColor = (i: number) => {
    if (i < roundResults.length) return roundResults[i].correct ? "bg-green-400" : "bg-red-400";
    if (i === round) return "bg-violet-400 animate-pulse";
    return "bg-white/15";
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
        <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 text-white"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
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
            <div className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", border: "1.5px solid rgba(255,255,255,0.18)", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
              <div className="px-4 py-2 text-center text-xs font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                {instrMode === "audio" ? "👂 Ouça o comando" : "👁 Leia o comando"}
              </div>
              <div className="px-5 py-5 space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full shadow-lg border-4 border-white/60"
                    style={{ background: targetAttrs?.colorHex ?? "#999" }} />
                </div>
                {instrMode !== "audio" ? (
                  <p className="text-center font-bold text-lg leading-snug text-white">
                    {command}
                  </p>
                ) : (
                  <div className="text-center space-y-1">
                    <p className="font-bold text-base text-violet-300">👂 Modo Auditivo</p>
                    <p className="text-sm text-white/60">Ouça e encontre o personagem</p>
                  </div>
                )}
                <div className="flex gap-3">
                  {instrMode !== "visual" && (
                    <button onClick={() => speak(command)}
                      className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 text-violet-300"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1.5px solid rgba(139,92,246,0.4)" }}>
                      🔊 Ouvir
                    </button>
                  )}
                  <button onClick={startPlaying}
                    className="flex-1 h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
                    Encontrar! →
                  </button>
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
            <div className="px-10 py-7 rounded-3xl text-center text-white"
              style={{
                background: picked && chars.find(c => c.id === picked)?.isTarget
                  ? "rgba(22,163,74,0.92)" : timedOut
                  ? "rgba(234,88,12,0.92)" : "rgba(220,38,38,0.92)",
                backdropFilter: "blur(20px)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}>
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
