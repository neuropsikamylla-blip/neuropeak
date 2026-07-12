"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { playTTS, cancelTTS } from "@/lib/tts";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { agents, allAgents } from "@/data/agents";
import type { AgentConfig } from "@/data/agents";

// Lookup O(1) de qualquer AgentConfig (42 base + símbolo + objeto = 225) por id.
const AGENT_BY_ID = new Map(allAgents.map(a => [a.id, a]));
import type { ExerciseResult, Theme } from "@/types";
import type { CommandRuleType, FocusMode } from "@/types/commands";
import { buildModeRound, roundSignature } from "@/utils/generateCommand";
import { PresentationConfig, type PresMode } from "@/components/exercises/PresentationConfig";
import { FocusRain } from "@/components/exercises/attention/FocusRain";

// ── Types ──────────────────────────────────────────────────────────────────────

interface GameAgent {
  uid:      string;
  agent:    AgentConfig;
  variant:  number;
  isTarget: boolean;
}

// Estado vivo de cada personagem na arena. Movimento livre por (x,y) em px,
// com direção própria (angle), velocidade individual (speed) e leve curvatura
// (turn) — alguns vão reto, outros descrevem trajetórias curvas.
interface FallerData {
  uid:       string;
  x:         number; // px — canto esquerdo
  y:         number; // px — topo
  angle:     number; // rad — direção do movimento
  speed:     number; // multiplicador individual de velocidade
  turn:      number; // rad/tick — curvatura suave da trajetória
  passCount: number; // quantas vezes o alvo escapou por uma borda
  zone?:     "top" | "bottom" | "left" | "right"; // Fase B: quica preso nesta zona
}

type InstrMode  = "both" | "visual" | "audio";
type FailReason = "wrong-tap" | "timeout" | null;

// Fase D — registro detalhado de cada rodada (vai no metadata; usado no relatório).
interface RoundMetric {
  mode: FocusMode; level: number; channel: "visual" | "auditivo";
  phased: boolean; totalTargets: number; captured: number; correct: boolean;
  falsePositive: number; omissions: number; timeToFirstMs: number | null;
  rtMs: number; afterSwitch: boolean; endedBy: "correct" | "wrong" | "timeout";
  // Tipo do erro (Foco): detalhe (tocou num QUASE-certo) · impulsividade (muito
  // diferente do alvo) · omissao (não capturou a tempo). null quando acertou.
  errorType?: "detalhe" | "impulsividade" | "omissao" | null;
}

// Tamanho do personagem. Mutável e definido pelo MODO no início da sessão:
// os 3 modos clássicos mantêm 112 (grandes/legíveis); o Foco (recalibração de
// elite) usa 80 — arena mais densa e clique mais preciso. Só um FocusAgents roda
// por vez (tela cheia), então esta configuração por sessão é segura.
const CHAR_SIZE_DEFAULT = 112;     // 3 modos clássicos — personagens grandes e legíveis
const CHAR_SIZE_FOCO    = 80;      // Foco — menores → mais densa, clique mais preciso
let CHAR_SIZE = CHAR_SIZE_DEFAULT;
let CHAR_H    = CHAR_SIZE * 1.5;   // imagens são 2:3 (512×768)
function applyCharSizeForMode(mode: FocusMode) {
  CHAR_SIZE = mode === "foco" ? CHAR_SIZE_FOCO : CHAR_SIZE_DEFAULT;
  CHAR_H    = CHAR_SIZE * 1.5;
}
const TICK_MS   = 50;
const ARENA_MARGIN = 8;            // margem de segurança: agentes nunca cortam na borda

// Área CLICÁVEL de cada agente = só o corpo visível (o boneco ocupa ~31%–68% da
// largura e ~2%–95% da altura do PNG; o resto é transparente). Sem isto, o
// retângulo transparente de um agente sobreposto "rouba" o toque destinado a
// outro — a pessoa clica no certo e conta errado.
const HIT_L = 0.24, HIT_R = 0.76;  // faixa horizontal do corpo (+ folga p/ toque)
const HIT_T = 0.00, HIT_B = 0.96;  // faixa vertical do corpo

// Velocidade-base da arena (px/tick). A velocidade efetiva = base × fator do nível.
const BASE_ARENA_SPEED = 2.4;

// Multiplicador de velocidade por nível: lento → rápido. 5 degraus para os modos
// clássicos (1–5); o Foco usa o ladder 1–7 e aproveita os 2 degraus extras.
// Calibrado para os níveis altos continuarem desafiadores sem ficarem frenéticos.
const LEVEL_SPEED = [0.7, 0.88, 1.05, 1.22, 1.4, 1.55, 1.7];
// PILOTO Foco (recalibração de elite): movimento BEM mais rápido, teto de elite.
// Só o modo Foco usa esta tabela; os 3 clássicos seguem no LEVEL_SPEED acima.
const LEVEL_SPEED_FOCO = [1.0, 1.25, 1.5, 1.8, 2.1, 2.4, 2.7];

// Dificuldade progressiva DENTRO do nível, ligada aos ACERTOS do paciente: a cada
// 2 acertos seguidos sobe um "degrau" de intensidade (mais velocidade); errar
// desce um degrau. Vai até um teto um pouco acima do próximo nível — preparando o
// paciente para o nível seguinte sem mudar o nível em si.
const INTRA_STEP_PCT = 0.2;       // +20% de velocidade por degrau
const HITS_PER_STEP  = 2;         // acertos seguidos para subir um degrau de velocidade
const MAX_INTRA_STEP = 5;
const LEVEL_UP_HITS   = 3;        // acertos seguidos para SUBIR de nível (3 modos clássicos)
const LEVEL_UP_HITS_FOCO = 2;    // Foco (recalibração de elite): sobe mais rápido — chega logo no difícil
const LEVEL_DOWN_ERRS = 2;        // erros seguidos para DESCER de nível (nunca abaixo do inicial)
// maxTier === 7 ⇒ modo Foco: usa a tabela de velocidade de elite (LEVEL_SPEED_FOCO).
function levelSpeed(level: number, step: number, maxTier = 5): number {
  const table   = maxTier === 7 ? LEVEL_SPEED_FOCO : LEVEL_SPEED;
  const lv      = Math.max(1, Math.min(maxTier, level));
  const base    = table[lv - 1];
  const ceiling = lv < maxTier ? table[lv] * 1.15 : base * 1.3;
  return Math.min(base * (1 + step * INTRA_STEP_PCT), ceiling);
}

// Metadados dos 4 modos cognitivos (rótulo, ícone, descrição e flag de avançado).
const MODE_META: Record<FocusMode, { label: string; icon: string; desc: string; advanced?: boolean }> = {
  foco:        { label: "Foco",              icon: "🎯", desc: "Atenção seletiva — toque por cor e atributos" },
  inibicao:    { label: "Inibição",          icon: "🚫", desc: "Controle inibitório — toque nos certos, evite os proibidos" },
  alternancia: { label: "Alternância",       icon: "🔄", desc: "Flexibilidade — a regra muda durante a rodada" },
  desafio:     { label: "Desafio Executivo", icon: "🧠", desc: "Combinação dos três — o mais difícil", advanced: true },
};
const MODE_ORDER: FocusMode[] = ["foco", "inibicao", "alternancia", "desafio"];

// ── Vocabulário ────────────────────────────────────────────────────────────────

const NOUN: Record<Theme, string> = {
  CLINICAL: "agente", COLORFUL: "personagem", GAMIFIED: "avatar",
};

const PALETTE_HEX: Record<string, string> = {
  blue: "#1E88E5",   green:    "#43A047", purple:   "#8E24AA",
  orange: "#FB8C00", red:      "#E53935", gray:     "#78909C",
  yellow: "#FDD835", azul:     "#1E88E5", verde:    "#43A047",
  roxo:   "#8E24AA", laranja:  "#FB8C00", vermelho: "#E53935",
  cinza:  "#78909C", amarelo:  "#FDD835", rosa:     "#E91E63",
};

function noop(_: string) {}
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// Fase B — caixa (em px) onde um agente "preso" numa zona pode andar/quicar.
function zoneBox(zone: "top" | "bottom" | "left" | "right", W: number, H: number) {
  const maxX = Math.max(ARENA_MARGIN, W - CHAR_SIZE - ARENA_MARGIN);
  const maxY = Math.max(ARENA_MARGIN, H - CHAR_H - ARENA_MARGIN);
  const midX = (ARENA_MARGIN + maxX) / 2, midY = (ARENA_MARGIN + maxY) / 2;
  if (zone === "top")    return { x0: ARENA_MARGIN, y0: ARENA_MARGIN, x1: maxX, y1: midY };
  if (zone === "bottom") return { x0: ARENA_MARGIN, y0: midY,         x1: maxX, y1: maxY };
  if (zone === "left")   return { x0: ARENA_MARGIN, y0: ARENA_MARGIN, x1: midX, y1: maxY };
  return                        { x0: midX,         y0: ARENA_MARGIN, x1: maxX, y1: maxY };
}

// Remove emojis/quebras do comando antes de enviar ao TTS (vozes leem "✅"/"🚫").
function cleanForSpeech(text: string): string {
  return text.replace(/[✅🚫]/g, "").replace(/\n+/g, ". ").trim();
}

// ── Fase G: feedback (sons gerados + vibração) ──────────────────────────────────
let _actx: AudioContext | null = null;
function beep(freqs: number[], dur = 0.12, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _actx = _actx ?? new Ctx();
    const ctx = _actx;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      const t = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur);
    });
  } catch { /* áudio indisponível */ }
}
const soundCorrect = () => beep([660, 880], 0.1, "sine");
const soundWrong   = () => beep([200, 150], 0.15, "square");
const soundCapture = () => beep([720], 0.05, "triangle");
function vibrate(ms: number | number[]) { try { navigator.vibrate?.(ms); } catch { /* sem vibração */ } }

// Relógio por rodada (segundos) — níveis altos + desbloqueios (6-9). 0 = sem relógio.
// ── Anti-repetição POR DIA ──────────────────────────────────────────────────
// Regra: NUNCA repetir o mesmo comando no mesmo dia de treino. Guarda no
// localStorage as assinaturas (texto) já usadas hoje, por modo. Vira um novo
// ciclo só quando o repertório do nível se esgota (nº de comandos é finito).
function focusTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function loadFocusDaySigs(mode: string): string[] {
  try {
    const o = JSON.parse(localStorage.getItem("np-focus-day") || "{}");
    if (o.date !== focusTodayKey()) return [];
    return (o.sigs && o.sigs[mode]) || [];
  } catch { return []; }
}
function saveFocusDaySigs(mode: string, sigs: string[]): void {
  try {
    let o = JSON.parse(localStorage.getItem("np-focus-day") || "{}");
    if (o.date !== focusTodayKey()) o = { date: focusTodayKey(), sigs: {} };
    if (!o.sigs) o.sigs = {};
    o.sigs[mode] = sigs;
    localStorage.setItem("np-focus-day", JSON.stringify(o));
  } catch { /* localStorage indisponível */ }
}

// Tempo por rodada (s) — agora TODOS os níveis têm relógio: generoso nos fáceis,
// apertado nos difíceis, pra exigir agilidade na busca sem frustrar.
// Usado pelos modos Inibição/Alternância/Desafio.
const LEVEL_CLOCK = [20, 18, 16, 15, 13, 12, 11, 10, 9];

// PILOTO Foco — relógio APERTADO que escala com o nº de alvos exigidos, para
// treinar VELOCIDADE DE PROCESSAMENTO (pressão de tempo real). Orçamento =
// reserva fixa do nível + segundos por alvo × nº de alvos. Só se aplica ao
// modo Foco; os demais modos seguem no LEVEL_CLOCK acima.
// Recalibração de elite: ~6s/rodada em vez de 9 (bem mais apertado).
// reserve/perTarget são CALIBRÁVEIS após teste clínico (índices = nível 1..7).
const FOCO_CLOCK_RESERVE   = [3,   2.5, 2.5, 2,   2,   1.5, 1.5];
const FOCO_CLOCK_PER_TARGET = [1.7, 1.5, 1.4, 1.2, 1.1, 1.0, 0.9];
function focoClockSecs(level: number, nTargets: number): number {
  const lv = Math.max(1, Math.min(7, level)) - 1;
  return Math.max(4, Math.round(FOCO_CLOCK_RESERVE[lv] + FOCO_CLOCK_PER_TARGET[lv] * nTargets));
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

function AgentCard({ gameAgent, onClick, state, size, flashy }: {
  gameAgent: GameAgent; onClick: () => void;
  state: "idle" | "correct" | "wrong" | "forbidden"; size: number; flashy?: boolean;
}) {
  const src = gameAgent.agent.images[gameAgent.variant]?.src ?? gameAgent.agent.images[0].src;

  // Sem card: o personagem fica solto no ambiente. Uma sombra base garante
  // legibilidade contra o fundo escuro; os estados acrescentam um brilho (glow)
  // colorido em vez da antiga caixa/anel.
  const baseShadow = "drop-shadow(0 3px 6px rgba(0,0,0,0.6))";
  const glow =
    state === "correct"   ? " drop-shadow(0 0 10px rgba(74,222,128,0.95)) drop-shadow(0 0 20px rgba(74,222,128,0.7))" :
    state === "wrong"     ? " drop-shadow(0 0 10px rgba(248,113,113,0.95))" :
    state === "forbidden" ? " drop-shadow(0 0 10px rgba(251,146,60,0.95))"  : "";
  const dim   = state === "wrong" || state === "forbidden";
  const scale = state === "correct" ? 1.08 : 1;

  const flash = flashy && state === "idle";
  return (
    <motion.div
      animate={flash ? { scale: [1, 1.16, 1] } : { scale }}
      whileTap={{ scale: scale * 0.9 }}
      transition={flash ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
      className="relative"
      style={{ width: size, pointerEvents: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src + AGENT_V} alt={gameAgent.agent.name}
        decoding="async" loading="eager"
        style={{
          width: "100%", height: "auto", display: "block", userSelect: "none",
          opacity: dim ? 0.5 : 1,
          filter: baseShadow + glow,
          transition: "filter 150ms, opacity 150ms",
          pointerEvents: "none",
        }}
        draggable={false} />
      {/* Botão = só a silhueta do corpo. Assim, a margem transparente de um agente
          que passa por cima não intercepta o toque destinado ao agente de baixo. */}
      <button
        onClick={onClick}
        aria-label={gameAgent.agent.name}
        className="absolute cursor-pointer"
        style={{
          left: `${HIT_L * 100}%`, width: `${(HIT_R - HIT_L) * 100}%`,
          top:  `${HIT_T * 100}%`, height: `${(HIT_B - HIT_T) * 100}%`,
          background: "transparent", border: "none", padding: 0,
          pointerEvents: "auto", touchAction: "manipulation",
        }}
      />
      {state === "correct" && (
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✓</div>
      )}
      {state === "wrong" && (
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✕</div>
      )}
    </motion.div>
  );
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

// cache-bust: força o navegador a buscar as imagens novas (transparentes),
// mesmo que tenha a versão antiga (com fundo) guardada em cache. Subir este
// número sempre que reprocessar as imagens dos agentes.
const AGENT_V = "?v=8";
const DEMO_AGENTS = [
  { id: "d-1", src: "/exercises/agentes-personagens/azul_fone.png",         isTarget: true,  wave: { amp: 10, dur: 3.0, delay: 0.0 } },
  { id: "d-2", src: "/exercises/agentes-personagens/vermelho_base.png",     isTarget: false, wave: { amp:  8, dur: 2.5, delay: 0.6 } },
  { id: "d-3", src: "/exercises/agentes-personagens/verde_oculos.png",      isTarget: false, wave: { amp: 12, dur: 3.5, delay: 1.1 } },
  { id: "d-4", src: "/exercises/agentes-personagens/roxo_bone.png",         isTarget: false, wave: { amp:  9, dur: 2.8, delay: 0.4 } },
  { id: "d-5", src: "/exercises/agentes-personagens/laranja_fone_bone.png", isTarget: false, wave: { amp: 11, dur: 3.2, delay: 1.7 } },
  { id: "d-6", src: "/exercises/agentes-personagens/amarelo_oculos.png",    isTarget: false, wave: { amp:  7, dur: 2.6, delay: 0.9 } },
];

// ── Tela de seleção de modo + nível ─────────────────────────────────────────────

const LEVEL_LABELS = ["Muito fácil", "Fácil", "Médio", "Difícil", "Muito difícil"];

function ModeSelect({ onConfirm }: { onConfirm: (mode: FocusMode, level: number) => void }) {
  const [selMode, setSelMode]   = useState<FocusMode | null>(null);
  const [selLevel, setSelLevel] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center px-4 py-7 overflow-y-auto"
      style={{ background: "rgba(6,14,48,0.98)" }}>

      <h2 className="text-white font-black text-xl mb-1 text-center">🎯 Focus Agentes</h2>
      <p className="text-white/60 text-sm mb-5 text-center">Escolha o modo e o nível</p>

      {/* Modos */}
      <div className="w-full max-w-sm space-y-2 mb-5">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Modo</p>
        {MODE_ORDER.map(m => {
          const meta = MODE_META[m];
          const active = selMode === m;
          return (
            <button key={m} onClick={() => setSelMode(m)}
              className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{
                background: active ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${active ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.12)"}`,
              }}>
              <span className="text-2xl flex-shrink-0">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">{meta.label}</span>
                  {meta.advanced && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/30 text-orange-200 border border-orange-400/40">
                      ⚠️ avançado
                    </span>
                  )}
                </div>
                <p className="text-white/55 text-xs leading-tight mt-0.5">{meta.desc}</p>
                {meta.advanced && active && (
                  <p className="text-orange-200/80 text-[11px] leading-tight mt-1">
                    Recomendado dominar os modos 1–3 antes.
                  </p>
                )}
              </div>
              {active && <span className="text-violet-300 text-lg flex-shrink-0">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Níveis */}
      <div className="w-full max-w-sm mb-6">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
          Nível <span className="text-white/70 normal-case font-semibold">— {LEVEL_LABELS[selLevel - 1]}</span>
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(lv => {
            const active = selLevel === lv;
            return (
              <button key={lv} onClick={() => setSelLevel(lv)}
                className="flex-1 h-12 rounded-xl font-black text-lg transition-all active:scale-95"
                style={{
                  background: active ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${active ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.12)"}`,
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                }}>
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => selMode && onConfirm(selMode, selLevel)}
        disabled={!selMode}
        className="w-full max-w-sm h-13 rounded-2xl font-bold text-white text-sm flex items-center justify-center py-3.5 active:scale-95 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
        {selMode ? `Começar — ${MODE_META[selMode].label} · Nível ${selLevel} →` : "Escolha um modo"}
      </button>
    </div>
  );
}

function FocusTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const noun = NOUN[theme];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "rgba(6,14,48,0.98)" }}>

      <h2 className="text-white font-black text-xl mb-1 text-center">Como jogar</h2>
      <p className="text-white/60 text-sm mb-5 text-center">
        Toque no {noun} certo se movendo pela arena
      </p>

      {/* Exemplo de comando */}
      <div className="w-full max-w-xs rounded-2xl mb-5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.09)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
        <div className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-white/50"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          👁 Comando da rodada
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white/30"
            style={{ background: "#1E88E5" }} />
          <p className="text-white font-bold text-sm">Toque nos {noun}s azuis com fone</p>
        </div>
      </div>

      {/* Grade demo com animação de onda */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-6" style={{ minHeight: 160 }}>
        {DEMO_AGENTS.map(da => (
          <motion.div key={da.id}
            animate={{ y: [0, -da.wave.amp, 0, da.wave.amp, 0] }}
            transition={{ duration: da.wave.dur, repeat: Infinity, ease: "easeInOut", delay: da.wave.delay }}
            className="relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={da.src + AGENT_V} alt="" draggable={false} decoding="async" loading="eager"
              style={{ width: 86, height: "auto", display: "block", userSelect: "none",
                filter: da.isTarget
                  ? "drop-shadow(0 3px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(74,222,128,0.95)) drop-shadow(0 0 20px rgba(74,222,128,0.7))"
                  : "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }} />
            {da.isTarget && (
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Instruções */}
      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-2"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-white/70 text-xs leading-relaxed">
          • Os {noun}s se movem pela arena em <span className="text-white font-semibold">direções e velocidades diferentes</span>
        </p>
        <p className="text-white/70 text-xs leading-relaxed">
          • <span className="text-white font-semibold">Capture o alvo</span> antes que ele escape <span className="text-white font-semibold">2 vezes</span> pelas bordas!
        </p>
        <p className="text-white/70 text-xs leading-relaxed">
          • A cada 3 acertos seguidos, velocidade e comandos ficam <span className="text-white font-semibold">mais difíceis</span>
        </p>
      </div>

      <button onClick={onDone}
        className="w-full max-w-xs h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center active:scale-95"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
        Começar! 🚀
      </button>
    </div>
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
            left:`${(i*41+7)%100}%`, top:`${(i*29+3)%100}%` }} />
      ))}
      <div className="absolute" style={{ top:"30%", left:"50%", transform:"translate(-50%,-50%)" }}>
        {palette.r.map((color, i) => {
          const w = 60+i*48, hh = 38+i*30;
          return (
            <motion.div key={i} className="absolute rounded-full border-2"
              style={{ width:w, height:hh, marginLeft:-w/2, marginTop:-hh/2, borderColor:color }}
              animate={{ rotate: i%2===0 ? 360 : -360 }}
              transition={{ duration:8+i*2, repeat:Infinity, ease:"linear" }} />
          );
        })}
        <div className="absolute w-16 h-10 rounded-full"
          style={{ marginLeft:-32, marginTop:-20,
            background:`radial-gradient(ellipse, rgba(255,255,255,.85) 0%, ${palette.glow} 50%, transparent 75%)` }} />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────


export interface FocusAgentsProps {
  difficulty: number; theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  exerciseId?: string;
  // Config do terapeuta (Fase E): modo + nível inicial vêm do plano.
  settings?: { mode?: FocusMode; startLevel?: number; freeChoice?: boolean; feedback?: "leve" | "normal" | "intenso"; autoAdvance?: boolean };
}

// Rótulo do nível (1-5) ou do desbloqueio (6-9).
const UNLOCK_LABELS: Record<number, string> = { 6: "🔓 Exceção", 7: "🔓 Na ordem", 8: "🔓 Duas regras", 9: "🔓 Sem distração" };
const levelLabel = (lv: number) => (lv >= 6 ? UNLOCK_LABELS[lv] ?? `Nível ${lv}` : LEVEL_LABELS[lv - 1]);

// ── Treino terapêutico — confirmação read-only (o paciente não escolhe; D6) ──────
function TherapeuticIntro({ mode, level, onStart }: { mode: FocusMode; level: number; onStart: () => void }) {
  const meta = MODE_META[mode];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-7" style={{ background: "rgba(6,14,48,0.98)" }}>
      <h2 className="text-white font-black text-xl mb-1 text-center">🎯 Focus Agentes</h2>
      <p className="text-white/60 text-sm mb-6 text-center">Treino de hoje</p>
      <div className="w-full max-w-sm rounded-2xl px-5 py-5 mb-6 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
        <div className="text-4xl mb-2">{meta.icon}</div>
        <div className="text-white font-bold text-lg">{meta.label}</div>
        <div className="text-white/55 text-sm mt-1">{meta.desc}</div>
        <div className="mt-3 inline-block text-xs font-bold px-3 py-1 rounded-full bg-violet-500/30 text-violet-200">{level >= 6 ? levelLabel(level) : `Nível ${level} — ${levelLabel(level)}`}</div>
      </div>
      <button onClick={onStart} className="w-full max-w-sm h-13 rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
        style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>Começar →</button>
    </div>
  );
}

export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents", settings }: FocusAgentsProps) {
  // Focus é SEMPRE configurado pelo terapeuta — o paciente nunca escolhe modo/nível.
  // Sem modo definido no plano, usa "foco" como padrão. (freeChoice descontinuado)
  const presMode: FocusMode = settings?.mode ?? "foco";
  // Nível inicial: se o terapeuta definiu startLevel, respeita (inclusive 1);
  // senão, deriva da DIFICULDADE do paciente com piso 2 (nível 1 nunca é o padrão).
  const presLevel = settings?.startLevel != null
    ? Math.max(1, Math.min(9, Math.round(settings.startLevel)))
    : Math.max(2, Math.min(9, Math.round(difficulty)));
  const prescribed = true;
  const fbLevel = settings?.feedback ?? "normal";   // intensidade do feedback (Fase G/H)
  // Modo de apresentação (Configurar atividade): visual / visual+áudio / só áudio.
  const [presentMode, setPresentMode] = useState<PresMode | null>(null);
  const speakOn = presentMode === "visual_audio" || presentMode === "audio_only";
  const speakFn = useCallback((text: string) => {
    if (!speakOn) return;
    playTTS(text);
  }, [speakOn]);

  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [showModeSelect, setShowModeSelect] = useState(!prescribed);
  const [entryDone, setEntryDone]       = useState(false);
  const [mode, setMode]                 = useState<FocusMode>(presMode ?? "foco");
  const [showTutorial, setShowTutorial] = useState(true);

  const [gamePhase, setGamePhase]       = useState<"command"|"playing"|"feedback">("command");
  const [round, setRound]               = useState(0);
  const [gameAgents, setGameAgents]     = useState<GameAgent[]>([]);
  const [command, setCommand]           = useState("");
  const [targetUids, setTargetUids]     = useState<string[]>([]);
  const [foundUids, setFoundUids]       = useState<string[]>([]);
  const [forbidden, setForbidden]       = useState<string[]>([]);
  const [sequenced, setSequenced]       = useState(false);
  const [requiredTargets, setRequiredTargets] = useState(1);
  const [sequenceStep, setSequenceStep] = useState(0);
  const [failReason, setFailReason]     = useState<FailReason>(null);
  const [wrongUid, setWrongUid]         = useState<string|null>(null);
  const [roundType, setRoundType]       = useState<CommandRuleType>("single");
  const [fallerPositions, setFallerPositions] = useState<FallerData[]>([]);
  const [targetPass, setTargetPass]     = useState(0);
  const [commandFaded, setCommandFaded] = useState(false);
  const [phaseHint, setPhaseHint]       = useState<string|null>(null);
  const [intensity, setIntensity]       = useState(0);   // degrau de dificuldade (HUD)
  const [roundResults, setRoundResults] = useState<{ correct:boolean; rt:number }[]>([]);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [lastCorrect, setLastCorrect]   = useState(false);
  const [memoryRound, setMemoryRound]   = useState(false); // Foco D7 — comando some durante o jogo
  const [nextDir, setNextDir]           = useState<"harder"|"same"|"easier">("same"); // rumo da próxima rodada (feedback)
  const [lastRt, setLastRt]             = useState(0);   // tempo da última rodada (ms)
  const wrongAgentRef                   = useRef<AgentConfig | null>(null);            // agente tocado por engano (tipo de erro)
  const [points, setPoints]             = useState(0);   // placar (Fase G)
  const [combo, setCombo]               = useState(0);   // rodadas certas em sequência (micro-recompensa)
  const [blitz, setBlitz]               = useState(false); // rodada relâmpago (ritmo)
  const [clockLeft, setClockLeft]       = useState(0);   // relógio por rodada (níveis altos)
  const [barColor, setBarColor]         = useState<string | null>(null);   // barra condicional (Fase H)
  const [flashyUids, setFlashyUids]     = useState<string[]>([]);          // distratores que piscam (Fase H)
  const pointsRef                       = useRef(0);
  const comboRef                        = useRef(0);
  const blitzRef                        = useRef(false);
  const clockIntRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const rafRef              = useRef<number|null>(null);
  const fallersRef          = useRef<FallerData[]>([]);
  // PERF-01: durante a fase "playing" a física corre no `fallersRef` e o
  // movimento é aplicado direto via style.transform nos nós DOM (sem setState
  // a cada frame). `fallerNodesRef` referencia os elementos (callback ref) e
  // `fallerBaseRef` guarda a posição base renderizada (top/left em px) de cada
  // faller no instante em que o play começou — o transform anima o delta.
  const fallerNodesRef      = useRef<Map<string, HTMLDivElement>>(new Map());
  const fallerBaseRef       = useRef<Map<string, { x: number; y: number }>>(new Map());
  const playAreaRef         = useRef<HTMLDivElement>(null);
  const playAreaHRef        = useRef(600);
  const playAreaWRef        = useRef(0);
  const roundRef            = useRef(0);
  const commandFadeTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const roundStart          = useRef(Date.now());
  const sessionStart        = useRef(Date.now());
  const roundResultsRef     = useRef(roundResults);
  const resolvedIds         = useRef(new Set<string>());
  const doneRef             = useRef(false);
  const targetUidsRef       = useRef<string[]>([]);
  const foundUidsRef        = useRef<string[]>([]);
  const forbiddenRef        = useRef<string[]>([]);
  const sequencedRef        = useRef(false);
  const requiredTargetsRef  = useRef(1);
  const sequenceStepRef     = useRef(0);
  const roundTypeRef        = useRef<CommandRuleType>("single");
  const targetPassRef       = useRef(0);
  const recentVerbsRef          = useRef<number[]>([]);
  const recentTargetAgentIdsRef = useRef<string[]>([]);
  const recentSigsRef           = useRef<string[]>([]);   // regras (texto) recentes p/ não repetir na sessão
  const modeRef                 = useRef<FocusMode>("foco");
  const levelRef                = useRef(1);
  // Fases (modos Alternância e Desafio): troca de regra durante a rodada.
  const phasesRef               = useRef<{ text: string; uids: string[]; barColor?: string }[]>([]);
  const isConditionalRef        = useRef(false);
  const movementDirRef          = useRef<"right" | "left" | "up" | "down" | null>(null);
  const currentPhaseRef         = useRef(0);
  const phaseLockRef            = useRef(false);
  const isPhasedRef             = useRef(false);
  // Dificuldade progressiva: velocidade (intraStep) + NÍVEL (por acertos/erros seguidos).
  const intraStepRef            = useRef(0);
  const consecCorrectRef        = useRef(0);
  const consecErrorRef          = useRef(0);
  const startLevelRef           = useRef(presLevel);   // piso — não desce abaixo do inicial
  const reachedLevelRef         = useRef(presLevel);   // maior nível alcançado (vai no onComplete)
  // Fase D — métricas detalhadas por rodada.
  const metricsRef              = useRef<RoundMetric[]>([]);
  const roundFirstTapRef        = useRef<number | null>(null);
  const capturedTotalRef        = useRef(0);
  const failReasonRef           = useRef<FailReason>(null);
  roundResultsRef.current = roundResults;

  // Pré-carrega E decodifica as imagens dos personagens (durante a seleção/tutorial)
  // para que apareçam todas juntas ao iniciar o jogo, sem o efeito de "surgir 1s depois".
  // Mantém as referências vivas em um ref para o navegador não descartar o cache.
  const preloadWarmRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const warm: HTMLImageElement[] = [];
    agents.forEach(a => a.images.forEach(img => {
      const im = new window.Image();
      im.decoding = "async";
      im.src = img.src + AGENT_V;
      im.decode?.().catch(() => {});   // decodifica adiantado (ignora falhas)
      warm.push(im);
    }));
    preloadWarmRef.current = warm;
  }, []);

  const stopFallAnimation = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const prepareRound = useCallback((_r: number) => {
    roundRef.current = _r;
    // Rodada relâmpago: a cada 5 rodadas (nível ≥ 2) a arena acelera — quebra a
    // cadência e vale pontos extras. Quebra a monotonia do ritmo.
    blitzRef.current = _r > 0 && _r % 5 === 0 && levelRef.current >= 2;
    setBlitz(blitzRef.current);
    if (_r === 0) {
      intraStepRef.current = 0;
      consecCorrectRef.current = 0;
      setIntensity(0);
      recentSigsRef.current = loadFocusDaySigs(modeRef.current); // herda os comandos já usados HOJE
      recentVerbsRef.current = [];
      recentTargetAgentIdsRef.current = [];
    }

    // Modo + nível são fixos na sessão (escolhidos na tela de seleção). A
    // adaptação automática entra na Fase 2 (config clínica).
    let built = buildModeRound(modeRef.current, levelRef.current, theme, recentVerbsRef.current, recentSigsRef.current);

    // Evita repetir o mesmo agente alvo nas últimas 3 rodadas
    for (let attempt = 0; attempt < 2; attempt++) {
      const ids = built.command.targets
        .map(tid => built.characters.find(c => c.id === tid)?.agentId)
        .filter(Boolean) as string[];
      if (ids.some(aid => recentTargetAgentIdsRef.current.slice(-3).includes(aid))) {
        built = buildModeRound(modeRef.current, levelRef.current, theme, recentVerbsRef.current, recentSigsRef.current);
      } else break;
    }

    const builtTargetIds = built.command.targets
      .map(tid => built.characters.find(c => c.id === tid)?.agentId)
      .filter(Boolean) as string[];
    recentTargetAgentIdsRef.current = [...recentTargetAgentIdsRef.current.slice(-4), ...builtTargetIds];

    const displayChars = built.characters;

    // Mapeia CharacterAttributes → GameAgent
    const uidMap = new Map<string, string>();
    const newGameAgents: GameAgent[] = displayChars.map(attr => {
      const agent = AGENT_BY_ID.get(attr.agentId);
      if (!agent) return null;
      const uid = `${attr.id}-${Date.now()}-${Math.random()}`;
      uidMap.set(attr.id, uid);
      return {
        uid,
        agent,
        variant:  attr.variantIndex,
        isTarget: built.command.targets.includes(attr.id),
      };
    }).filter(Boolean) as GameAgent[];

    // Fase B — posição: id do char → uid → zona.
    const zonesByUid: Record<string, "top" | "bottom" | "left" | "right"> = {};
    if (built.command.zones) {
      for (const [cid, z] of Object.entries(built.command.zones)) {
        const u = uidMap.get(cid); if (u) zonesByUid[u] = z;
      }
    }

    const newTargetUids = built.command.targets.map(id => uidMap.get(id)!).filter(Boolean);
    const newForbidden  = built.command.forbidden.map(id => uidMap.get(id)!).filter(Boolean);
    const newSequenced  = built.command.sequenced;
    const newRequired   = built.command.requiredTargets;
    const newType       = built.command.rule.type;
    const verbIdx       = built.command.verbIndex ?? 0;

    // Fases (Alternância/Desafio): mapeia os alvos de cada fase para uids.
    const builtPhases = built.command.phases ?? [];
    phasesRef.current = builtPhases.map(p => ({
      text: p.text,
      uids: p.targetIds.map(id => uidMap.get(id)!).filter(Boolean),
      barColor: p.barColor,
    }));
    currentPhaseRef.current = 0;
    phaseLockRef.current = false;
    isPhasedRef.current = builtPhases.length > 0;
    isConditionalRef.current = !!built.command.conditional;
    movementDirRef.current = built.command.movement ?? null;
    setBarColor(phasesRef.current[0]?.barColor ?? null);
    setPhaseHint(null);

    recentVerbsRef.current = [...recentVerbsRef.current.slice(-4), verbIdx];
    const _sig = roundSignature(built);
    // Esgotou o repertório do nível (não achou comando inédito) → começa novo ciclo no dia.
    if (recentSigsRef.current.includes(_sig)) recentSigsRef.current = [];
    recentSigsRef.current = [...recentSigsRef.current, _sig];   // NUNCA repete no dia (até esgotar)
    saveFocusDaySigs(modeRef.current, recentSigsRef.current);

    setGameAgents(newGameAgents);
    // Fase H — distratores fortes (piscam) na Inibição N4/N5: mistura alvos e não-alvos
    // para que "piscar" não seja pista; o paciente precisa inibir seguindo a regra.
    setFlashyUids(((modeRef.current === "inibicao" && levelRef.current >= 4) || levelRef.current === 9)
      ? shuffle(newGameAgents.map(g => g.uid)).slice(0, 3) : []);
    setCommand(built.command.text);
    setMemoryRound(built.command.memory ?? false);   // Foco D7 — comando some no jogo
    setTargetUids(newTargetUids);
    targetUidsRef.current = newTargetUids;
    setForbidden(newForbidden);
    forbiddenRef.current = newForbidden;
    setSequenced(newSequenced);
    sequencedRef.current = newSequenced;
    setRequiredTargets(newRequired);
    requiredTargetsRef.current = newRequired;
    setSequenceStep(0);
    sequenceStepRef.current = 0;
    setFoundUids([]);
    foundUidsRef.current = [];
    setWrongUid(null);
    setFailReason(null);
    setTargetPass(0);
    targetPassRef.current = 0;
    setCommandFaded(false);

    // Cada personagem ganha direção, velocidade e curvatura próprias. As
    // posições (x,y) em px são definidas em startPlaying, quando a arena já
    // foi medida (largura/altura reais).
    const newFallers: FallerData[] = newGameAgents.map(ga => ({
      uid:       ga.uid,
      x:         0,
      y:         0,
      angle:     Math.random() * Math.PI * 2,
      speed:     0.7 + Math.random() * 0.7,                       // 0.7–1.4
      turn:      Math.random() < 0.5 ? (Math.random() - 0.5) * 0.012 : 0,
      passCount: 0,
      zone:      zonesByUid[ga.uid],
    }));
    fallersRef.current = newFallers;
    setFallerPositions([...newFallers]);
    setRoundType(newType);
    roundTypeRef.current = newType;
    setGamePhase("command");
    resolvedIds.current = new Set();

    // Parte 1: o comando fica sempre visível (a opção "some após iniciar" /
    // "botão ver comando" entra na Fase 2). Só o canal muda pelo modo escolhido.
    const instrMode: InstrMode =
      presentMode === "audio_only"   ? "audio" :
      presentMode === "visual_audio" ? "both"  : "visual";

    // Fala o comando sem os emojis/quebras (que algumas vozes leem em voz alta).
    if (instrMode !== "visual") speakFn(cleanForSpeech(built.command.text));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, presentMode, speakFn]);

  function startPlaying() {
    stopFallAnimation();

    const W = playAreaRef.current?.clientWidth  ?? 0;
    const H = playAreaRef.current?.clientHeight ?? 600;
    playAreaWRef.current = W;
    playAreaHRef.current = H;

    // Posiciona os personagens espalhados pela arena. Uma grade com jitter
    // evita que tudo se amontoe num canto; o movimento livre + tamanho grande
    // cuidam da sobreposição parcial natural ao longo da rodada.
    const list  = fallersRef.current;
    const n     = list.length;
    const cols  = Math.max(1, Math.round(Math.sqrt(n * (W / Math.max(H, 1)))));
    const rows  = Math.max(1, Math.ceil(n / cols));
    const order = shuffle(list.map((_, i) => i));
    const cellW = W / cols;
    const cellH = H / rows;
    const DIR_ANGLE = { right: 0, left: Math.PI, up: -Math.PI / 2, down: Math.PI / 2 };
    const placed = list.map((f, idx) => {
      let x: number, y: number;
      if (f.zone) {   // Fase B — posiciona dentro da zona designada
        const b = zoneBox(f.zone, W, H);
        x = b.x0 + Math.random() * Math.max(1, b.x1 - b.x0);
        y = b.y0 + Math.random() * Math.max(1, b.y1 - b.y0);
      } else {
        const slot = order.indexOf(idx);
        x = (slot % cols) * cellW + Math.random() * Math.max(1, cellW - CHAR_SIZE);
        y = Math.floor(slot / cols) * cellH + Math.random() * Math.max(1, cellH - CHAR_H);
      }
      // Fase H — movimento: alvos vão na direção da regra; outros em outra direção.
      let angle = f.angle, turn = f.turn;
      if (movementDirRef.current) {
        const dir = movementDirRef.current;
        if (targetUidsRef.current.includes(f.uid)) angle = DIR_ANGLE[dir];
        else { const others = (["right", "left", "up", "down"] as const).filter(d => d !== dir); angle = DIR_ANGLE[others[Math.floor(Math.random() * others.length)]]; }
        turn = 0;
      }
      return { ...f, x, y, angle, turn };
    });
    fallersRef.current = placed;
    setFallerPositions([...placed]);

    // Base renderizada (top/left px) no instante do play — o transform
    // imperativo no rAF anima o delta sobre esta base (PERF-01).
    fallerBaseRef.current = new Map(placed.map(f => [f.uid, { x: f.x, y: f.y }]));

    setGamePhase("playing");
    roundStart.current = Date.now();
    roundFirstTapRef.current = null;
    capturedTotalRef.current = 0;
    failReasonRef.current = null;

    // Relógio por rodada. Foco (PILOTO): orçamento apertado que escala com o nº
    // de alvos do round (pressão de tempo → velocidade de processamento). Demais
    // modos: tabela LEVEL_CLOCK por nível.
    const clockSecs = modeRef.current === "foco"
      ? focoClockSecs(levelRef.current, requiredTargetsRef.current)
      : LEVEL_CLOCK[Math.max(1, Math.min(9, levelRef.current)) - 1];
    if (clockIntRef.current) { clearInterval(clockIntRef.current); clockIntRef.current = null; }
    if (clockSecs > 0) {
      setClockLeft(clockSecs);
      clockIntRef.current = setInterval(() => {
        setClockLeft(t => {
          if (t <= 1) {
            if (clockIntRef.current) { clearInterval(clockIntRef.current); clockIntRef.current = null; }
            failReasonRef.current = "timeout"; setFailReason("timeout");
            handleResult(false, roundRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else setClockLeft(0);

    // O movimento corre no rAF mutando `fallersRef` e aplicando o transform
    // direto no DOM (sem setState por frame). setState só em eventos discretos
    // (passagem do alvo, alvo perdido). A velocidade é normalizada por tempo
    // (dt/TICK_MS) para a física não depender da taxa de frames.
    let prevTs: number | null = null;

    const animate = (ts: number) => {
      if (resolvedIds.current.has("timeout")) { stopFallAnimation(); return; }

      // dt clampado a 100ms para que um pico de lag (ou retomada após a aba
      // ficar em background) não produza um salto gigante.
      const dt    = prevTs === null ? TICK_MS : Math.min(ts - prevTs, 100);
      prevTs      = ts;
      const ticks = dt / TICK_MS;

      const lvSpeed = levelSpeed(levelRef.current, intraStepRef.current, modeRef.current === "foco" ? 7 : 5) * (blitzRef.current ? 1.5 : 1);
      const mult = BASE_ARENA_SPEED * lvSpeed * ticks;
      const W2   = playAreaWRef.current;
      const H2   = playAreaHRef.current;

      let targetLost = false;
      let newPassCount = 0;

      fallersRef.current = fallersRef.current.map(f => {
        const angle = f.angle + f.turn * ticks;
        let x = f.x + Math.cos(angle) * f.speed * mult;
        let y = f.y + Math.sin(angle) * f.speed * mult;
        let na = angle;

        // Arena delimitada: o agente QUICA nas paredes e nunca sai/corta na borda
        // (margem de segurança). Tira a pressão motora — a dificuldade vem da regra
        // cognitiva e dos distratores, não da velocidade de fuga dos alvos.
        // Fase H — movimento: anda reto e DÁ A VOLTA (wrap), direção constante.
        if (movementDirRef.current) {
          if (x > W2)            x = -CHAR_SIZE;
          else if (x < -CHAR_SIZE) x = W2;
          if (y > H2)            y = -CHAR_H;
          else if (y < -CHAR_H)  y = H2;
          return { ...f, x, y, angle, passCount: f.passCount };
        }
        // Fase B — preso na zona: quica dentro da caixa da zona; senão na arena toda.
        const b = f.zone ? zoneBox(f.zone, W2, H2) : { x0: ARENA_MARGIN, y0: ARENA_MARGIN, x1: Math.max(ARENA_MARGIN, W2 - CHAR_SIZE - ARENA_MARGIN), y1: Math.max(ARENA_MARGIN, H2 - CHAR_H - ARENA_MARGIN) };
        if (x < b.x0)      { x = b.x0; na = Math.PI - na; }
        else if (x > b.x1) { x = b.x1; na = Math.PI - na; }
        if (y < b.y0)      { y = b.y0; na = -na; }
        else if (y > b.y1) { y = b.y1; na = -na; }
        return { ...f, x, y, angle: na, passCount: f.passCount };
      });

      // Separação suave: impede o EMPILHAMENTO total (vários no mesmo ponto), que
      // é o que faz parecer "tudo amontoado num lugar só". Mantém a sobreposição
      // PARCIAL — passar à frente/atrás continua sendo o desafio. Não roda no modo
      // direcional (Fase H), onde o movimento em faixas paralelas já organiza.
      if (!movementDirRef.current) {
        const arr = fallersRef.current;
        const SEP = CHAR_SIZE * 0.5;          // distância mínima entre centros (~56px)
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            let dx = arr[j].x - arr[i].x;
            let dy = arr[j].y - arr[i].y;
            let d  = Math.sqrt(dx * dx + dy * dy);
            if (d < SEP) {
              if (d < 0.5) { dx = (i - j) || 1; dy = 1; d = Math.sqrt(dx * dx + dy * dy); }
              const m  = (SEP - d) * 0.25;     // metade do overlap p/ cada, amortecido
              const ux = dx / d, uy = dy / d;
              arr[i].x -= ux * m; arr[i].y -= uy * m;
              arr[j].x += ux * m; arr[j].y += uy * m;
            }
          }
        }
        // Reclampa dentro da caixa (zona ou arena) após empurrar.
        for (const f of arr) {
          const b = f.zone ? zoneBox(f.zone, W2, H2)
            : { x0: ARENA_MARGIN, y0: ARENA_MARGIN,
                x1: Math.max(ARENA_MARGIN, W2 - CHAR_SIZE - ARENA_MARGIN),
                y1: Math.max(ARENA_MARGIN, H2 - CHAR_H - ARENA_MARGIN) };
          if (f.x < b.x0) f.x = b.x0; else if (f.x > b.x1) f.x = b.x1;
          if (f.y < b.y0) f.y = b.y0; else if (f.y > b.y1) f.y = b.y1;
        }
      }

      // Aplica o movimento direto no DOM via transform (delta sobre a base).
      // O z-index segue o Y (quem está mais embaixo fica À FRENTE): a sobreposição
      // vira profundidade real e o toque cai em quem a pessoa vê na frente. Mantido
      // abaixo de z-30 para não cobrir os overlays de comando/feedback.
      for (const f of fallersRef.current) {
        const node = fallerNodesRef.current.get(f.uid);
        const base = fallerBaseRef.current.get(f.uid);
        if (node && base) {
          node.style.transform = `translate(${f.x - base.x}px, ${f.y - base.y}px)`;
          node.style.zIndex = String(3 + Math.round((f.y / Math.max(H2, 1)) * 22));
        }
      }

      // Evento discreto: a escapada do alvo mudou (atualiza HUD "1ª/2ª vez").
      if (newPassCount > 0 && newPassCount - 1 !== targetPassRef.current) {
        targetPassRef.current = newPassCount - 1;
        setTargetPass(newPassCount - 1);
      }

      if (targetLost && !resolvedIds.current.has("timeout")) {
        resolvedIds.current.add("timeout");
        // Congela o render nas posições reais alcançadas pela física, para que
        // o feedback não "salte" os agentes de volta à base inicial.
        setFallerPositions([...fallersRef.current]);
        setFailReason("timeout"); failReasonRef.current = "timeout";
        stopFallAnimation();
        setTimeout(() => handleResult(false, roundRef.current), 100);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }

  function handleResult(correct: boolean, r: number) {
    if (doneRef.current) return;
    stopFallAnimation();
    if (clockIntRef.current) { clearInterval(clockIntRef.current); clockIntRef.current = null; }
    // Congela o render nas posições reais alcançadas pela física durante o
    // play (não na base inicial), para que a transição para o feedback não
    // "salte" os agentes. Cobre os três caminhos: acerto, toque errado e timeout.
    setFallerPositions([...fallersRef.current]);
    if (commandFadeTimerRef.current) { clearTimeout(commandFadeTimerRef.current); commandFadeTimerRef.current = null; }

    const rt         = Date.now() - roundStart.current;
    // Fase G/H — som, vibração e placar (intensidade configurável: leve/normal/intenso).
    // + combo (rodadas certas em sequência) e bônus da rodada relâmpago.
    if (correct) {
      soundCorrect(); if (fbLevel !== "leve") vibrate(fbLevel === "intenso" ? [40, 25, 40] : 40);
      comboRef.current++;
      const comboBonus = comboRef.current >= 2 ? (comboRef.current - 1) * 5 : 0;   // +5, +10, +15…
      const blitzBonus = blitzRef.current ? 10 : 0;                                 // relâmpago vale mais
      pointsRef.current += 10 + (rt < 5000 ? 5 : 0) + comboBonus + blitzBonus;
      setPoints(pointsRef.current); setCombo(comboRef.current);
    } else {
      soundWrong(); if (fbLevel !== "leve") vibrate(fbLevel === "intenso" ? [80, 50, 80, 50, 80] : [50, 40, 50]);
      comboRef.current = 0; setCombo(0);
    }
    const newResults = [...roundResultsRef.current, { correct, rt }];
    setRoundResults(newResults);
    roundResultsRef.current = newResults;
    setLastCorrect(correct);   // resultado real da jogada (usado no overlay de feedback)
    setGamePhase("feedback");

    // Fase D — registra a métrica detalhada desta rodada.
    const phased = isPhasedRef.current;
    const totalTargets = phased
      ? phasesRef.current.reduce((s, p) => s + p.uids.length, 0)
      : targetUidsRef.current.length;
    const endedBy: "correct" | "wrong" | "timeout" = correct ? "correct" : (failReasonRef.current === "timeout" ? "timeout" : "wrong");
    setLastRt(rt);

    // Tipo de erro (para relatório): omissão (timeout), detalhe (tocou num QUASE-certo
    // — compartilha cor OU acessório com o alvo) ou impulsividade (muito diferente).
    let errorType: "detalhe" | "impulsividade" | "omissao" | null = null;
    if (!correct) {
      if (endedBy === "timeout") errorType = "omissao";
      else {
        const wa = wrongAgentRef.current;
        const tAg = gameAgents.find(g => g.isTarget)?.agent;
        if (wa && tAg) {
          const wt = new Set(wa.images[0]?.tags ?? []);
          const sharesAcc = (tAg.images[0]?.tags ?? []).some(x => wt.has(x));
          errorType = (wa.color === tAg.color || sharesAcc) ? "detalhe" : "impulsividade";
        } else errorType = "impulsividade";
      }
    }

    metricsRef.current.push({
      mode: modeRef.current, level: levelRef.current, channel: presentMode !== "visual" ? "auditivo" : "visual",
      phased, totalTargets, captured: capturedTotalRef.current, correct,
      falsePositive: endedBy === "wrong" ? 1 : 0,
      omissions: correct ? 0 : Math.max(0, totalTargets - capturedTotalRef.current),
      timeToFirstMs: roundFirstTapRef.current, rtMs: rt,
      afterSwitch: phased && currentPhaseRef.current > 0, endedBy, errorType,
    });

    const nextRound = r + 1;
    const lvBefore = levelRef.current;

    // Progressão ligada ao desempenho:
    //  • micro-ramp de velocidade a cada HITS_PER_STEP acertos;
    //  • SOBE de NÍVEL a cada LEVEL_UP_HITS acertos seguidos (comandos/agentes mais difíceis);
    //  • DESCE de NÍVEL a cada LEVEL_DOWN_ERRS erros seguidos (nunca abaixo do inicial).
    if (correct) {
      consecErrorRef.current = 0;
      consecCorrectRef.current++;
      if (consecCorrectRef.current % HITS_PER_STEP === 0) {
        intraStepRef.current = Math.min(MAX_INTRA_STEP, intraStepRef.current + 1);
      }
      const maxLv = modeRef.current === "foco" ? 7 : 9;   // Foco = ladder 1–7
      const upHits = modeRef.current === "foco" ? LEVEL_UP_HITS_FOCO : LEVEL_UP_HITS;
      if (consecCorrectRef.current >= upHits && levelRef.current < maxLv) {
        levelRef.current++;
        consecCorrectRef.current = 0;
        intraStepRef.current = 0;
        reachedLevelRef.current = Math.max(reachedLevelRef.current, levelRef.current);
        setDisplayLevel(levelRef.current);
      }
    } else if (modeRef.current === "foco") {
      // PILOTO Foco — RIGOR DE TREINO: errar (toque impulsivo) ou estourar o tempo
      // (omissão) NÃO desce de nível — REPETE o MESMO nível na próxima rodada, com
      // novo arranjo (mesma dificuldade, sem virar memorização de posição). Só zera
      // a sequência de acertos e recua um degrau de velocidade (intra-step).
      consecCorrectRef.current = 0;
      intraStepRef.current = Math.max(0, intraStepRef.current - 1);
      consecErrorRef.current = 0;   // sem contagem de erros p/ descida — nível fixo
    } else {
      consecCorrectRef.current = 0;
      intraStepRef.current = Math.max(0, intraStepRef.current - 1);
      consecErrorRef.current++;
      if (consecErrorRef.current >= LEVEL_DOWN_ERRS && levelRef.current > startLevelRef.current) {
        levelRef.current--;
        consecErrorRef.current = 0;
        intraStepRef.current = MAX_INTRA_STEP;
        setDisplayLevel(levelRef.current);
      }
    }
    setIntensity(intraStepRef.current);
    // Rumo da PRÓXIMA rodada (mensagem simples no feedback — sem contador de sequência).
    setNextDir(levelRef.current > lvBefore ? "harder" : levelRef.current < lvBefore ? "easier" : "same");

    setTimeout(() => {
      if (isTimeUp()) {
        doneRef.current = true;
        finish();
        const correctCount = newResults.filter(x => x.correct).length;
        const accuracy     = correctCount / Math.max(1, newResults.length);
        const avgRt        = newResults.filter(x => x.correct).reduce((s, x) => s + x.rt, 0) / (correctCount || 1);
        // Fase D — agregados da sessão a partir das métricas por rodada.
        const M = metricsRef.current;
        const sum = (f: (m: RoundMetric) => number) => M.reduce((s, m) => s + f(m), 0);
        const firsts = M.map(m => m.timeToFirstMs).filter((x): x is number => typeof x === "number");
        const switchRounds = M.filter(m => m.phased);
        const afterSwitchErr = switchRounds.filter(m => !m.correct && m.afterSwitch).length;
        onComplete({
          exerciseId, domain: "attention",
          score: calculateExerciseScore("focus-agents", accuracy, Math.round(avgRt), reachedLevelRef.current),
          accuracy, reactionTime: Math.round(avgRt), difficulty: reachedLevelRef.current,
          duration: elapsedSec(),
          metadata: {
            rounds: newResults.length, correct: correctCount,
            mode: modeRef.current, level: reachedLevelRef.current, startedLevel: startLevelRef.current,
            autoAdvance: settings?.autoAdvance !== false,
            channel: presentMode !== "visual" ? "auditivo" : "visual",
            falsePositives: sum(m => m.falsePositive),
            omissions: sum(m => m.omissions),
            timeToFirstMs: firsts.length ? Math.round(firsts.reduce((a, b) => a + b, 0) / firsts.length) : null,
            switchRounds: switchRounds.length,
            errorsAfterSwitch: afterSwitchErr,
            rounds_detail: M,
          },
        });
      } else {
        setRound(nextRound);
        prepareRound(nextRound);
      }
    }, 1100);
  }

  // Avança para a próxima fase (troca de regra): mostra o aviso, e após uma
  // breve pausa aplica a nova regra (novos alvos). Bloqueia toques durante o aviso.
  function advancePhase(next: number) {
    phaseLockRef.current = true;
    currentPhaseRef.current = next;
    const phase = phasesRef.current[next];
    setPhaseHint(isConditionalRef.current ? "🎨 A barra mudou de cor!" : phase.text);
    setBarColor(phase.barColor ?? null);
    setTimeout(() => {
      targetUidsRef.current = phase.uids;
      setTargetUids(phase.uids);
      requiredTargetsRef.current = phase.uids.length;
      setRequiredTargets(phase.uids.length);
      foundUidsRef.current = [];
      setFoundUids([]);
      setCommand(phase.text);
      setPhaseHint(null);
      phaseLockRef.current = false;
    }, 1500);
  }

  function handleCharTap(ga: GameAgent) {
    if (gamePhase !== "playing") return;
    if (roundFirstTapRef.current === null) roundFirstTapRef.current = Date.now() - roundStart.current;
    if (phaseLockRef.current) return;
    if (resolvedIds.current.has(ga.uid)) return;

    // ── Modos com troca de regra (Alternância / Desafio) ──
    if (isPhasedRef.current) {
      resolvedIds.current.add(ga.uid);
      // Proibido constante (Desafio) → erro
      if (forbiddenRef.current.includes(ga.uid)) {
        resolvedIds.current.add("timeout");
        setWrongUid(ga.uid); wrongAgentRef.current = ga.agent; setFailReason("wrong-tap"); failReasonRef.current = "wrong-tap";
        handleResult(false, round); return;
      }
      // Alvo da regra ATUAL → captura
      if (targetUidsRef.current.includes(ga.uid)) {
        const newFound = [...foundUidsRef.current, ga.uid];
        foundUidsRef.current = newFound; capturedTotalRef.current++; soundCapture(); setFoundUids(newFound);
        if (newFound.length >= targetUidsRef.current.length) {
          const next = currentPhaseRef.current + 1;
          if (next < phasesRef.current.length) advancePhase(next);
          else { resolvedIds.current.add("timeout"); handleResult(true, round); }
        }
        return;
      }
      // Tocou fora da regra atual (perseveração ou neutro) → erro
      resolvedIds.current.add("timeout");
      setWrongUid(ga.uid); wrongAgentRef.current = ga.agent; setFailReason("wrong-tap"); failReasonRef.current = "wrong-tap";
      handleResult(false, round); return;
    }

    resolvedIds.current.add(ga.uid);

    const isNeg = roundTypeRef.current === "negative";

    if (forbiddenRef.current.includes(ga.uid)) {
      resolvedIds.current.add("timeout");
      setWrongUid(ga.uid); wrongAgentRef.current = ga.agent;
      setFailReason("wrong-tap"); failReasonRef.current = "wrong-tap";
      handleResult(false, round);
      return;
    }

    if (isNeg) {
      resolvedIds.current.add("timeout");
      handleResult(true, round);
      return;
    }

    if (ga.isTarget) {
      if (sequencedRef.current) {
        const expectedUid = targetUidsRef.current[sequenceStepRef.current];
        if (ga.uid === expectedUid) {
          const newStep  = sequenceStepRef.current + 1;
          sequenceStepRef.current = newStep;
          setSequenceStep(newStep);
          const newFound = [...foundUidsRef.current, ga.uid];
          foundUidsRef.current = newFound; capturedTotalRef.current++; soundCapture();
          setFoundUids(newFound);
          if (newStep >= targetUidsRef.current.length) {
            resolvedIds.current.add("timeout");
            handleResult(true, round);
          }
        } else {
          resolvedIds.current.add("timeout");
          setWrongUid(ga.uid); wrongAgentRef.current = ga.agent;
          setFailReason("wrong-tap"); failReasonRef.current = "wrong-tap";
          handleResult(false, round);
        }
      } else {
        if (!foundUidsRef.current.includes(ga.uid)) {
          const newFound = [...foundUidsRef.current, ga.uid];
          foundUidsRef.current = newFound; capturedTotalRef.current++; soundCapture();
          setFoundUids(newFound);
          if (newFound.length >= requiredTargetsRef.current) {
            resolvedIds.current.add("timeout");
            handleResult(true, round);
          }
        }
      }
    } else {
      resolvedIds.current.add("timeout");
      setWrongUid(ga.uid); wrongAgentRef.current = ga.agent;
      setFailReason("wrong-tap"); failReasonRef.current = "wrong-tap";
      handleResult(false, round);
    }
  }

  useEffect(() => {
    if (showTutorial) return;
    // Foco usa o motor de CHUVA (FocusRain, componente próprio) — não inicia o
    // motor da arena aqui. Só os 3 modos clássicos preparam a rodada da arena.
    if (modeRef.current === "foco") return;
    sessionStart.current = Date.now();
    begin();
    metricsRef.current = []; pointsRef.current = 0; setPoints(0);
    comboRef.current = 0; setCombo(0); blitzRef.current = false; setBlitz(false);
    prepareRound(0);
    return () => {
      stopFallAnimation();
      if (commandFadeTimerRef.current) clearTimeout(commandFadeTimerRef.current);
      if (clockIntRef.current) { clearInterval(clockIntRef.current); clockIntRef.current = null; }
      cancelTTS();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  // Configurar atividade (modo de apresentação) — antes de tudo, nunca toca áudio aqui.
  if (presentMode === null) return (
    <PresentationConfig
      title="Focus Agentes" icon="🎯" accent="#6d28d9"
      subtitle={<>Nível {presLevel} · toque nos agentes que o comando pedir.</>}
      onChoose={(m) => setPresentMode(m)}
    />
  );

  if (prescribed && !entryDone) return (
    <TherapeuticIntro mode={presMode!} level={presLevel} onStart={() => {
      setMode(presMode!); modeRef.current = presMode!;
      applyCharSizeForMode(presMode!);   // Foco = 80px; clássicos = 112px
      const lv0 = presMode === "foco" ? Math.min(7, presLevel) : presLevel;   // Foco = ladder 1–7
      levelRef.current = lv0; startLevelRef.current = lv0; reachedLevelRef.current = lv0;
      setDisplayLevel(lv0);
      setEntryDone(true);
    }} />
  );

  if (showModeSelect) return (
    <ModeSelect onConfirm={(m, lv) => {
      setMode(m);  modeRef.current  = m;
      applyCharSizeForMode(m);   // Foco = 80px; clássicos = 112px
      const lv0 = m === "foco" ? Math.min(7, lv) : lv;   // Foco = ladder 1–7
      levelRef.current = lv0; startLevelRef.current = lv0; reachedLevelRef.current = lv0;
      setDisplayLevel(lv0);
      setShowModeSelect(false);
    }} />
  );

  if (showTutorial) return (
    <FocusTutorial theme={theme} onDone={() => setShowTutorial(false)} />
  );

  // ── RAMIFICAÇÃO FOCO-ONLY: mecânica de CHUVA DE AGENTES (queda vertical) ──────
  // Só o modo Foco usa o motor de queda. Inibição/Alternância/Desafio seguem no
  // motor de "arena flutuante" abaixo (este guard `mode === "foco"` os isola por
  // completo — eles nunca chegam ao FocusRain). presentMode já é não-nulo aqui
  // (passou pelo gate de PresentationConfig).
  if (mode === "foco" && presentMode) return (
    <FocusRain
      level={levelRef.current}
      theme={theme}
      presentMode={presentMode}
      fbLevel={fbLevel}
      exerciseId={exerciseId}
      settings={{ autoAdvance: settings?.autoAdvance }}
      onComplete={onComplete}
    />
  );

  // ── Derived state ──────────────────────────────────────────────────────────

  const instrMode: InstrMode =
    presentMode === "audio_only"   ? "audio" :
    presentMode === "visual_audio" ? "both"  : "visual";

  // Parte 2: Foco e Inibição usam "capturar todos da regra".
  const isCaptureAll  = mode === "foco" || mode === "inibicao";
  const isInhibition  = mode === "inibicao";
  const isPhased      = mode === "alternancia" || mode === "desafio";
  const isNegMode     = !isCaptureAll && (roundType === "negative" || roundType === "advanced");
  const isSeqMode     = !isCaptureAll && (roundType === "sequence"  || roundType === "advanced");
  const isMultiTarget = !isCaptureAll && roundType === "multiTarget";

  const totalTargets   = targetUids.length;
  const foundCount     = foundUids.length;
  // Usa o resultado real da última jogada (corrige o feedback do modo Inibição,
  // onde os alvos não são contados por foundCount).
  const isCorrect      = lastCorrect;
  const firstTargetAg  = gameAgents.find(ga => ga.uid === targetUids[0])?.agent;

  const gameTitle = `${MODE_META[mode].icon} ${MODE_META[mode].label}`;

  const dotColor = (i: number) => {
    if (i < roundResults.length) return roundResults[i].correct ? "bg-green-400" : "bg-red-400";
    if (i === round) return "bg-violet-400 animate-pulse";
    return "bg-white/15";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ zIndex: 40 }}>
      <SceneBg theme={theme} />

      {/* HUD */}
      <div className="relative z-20 px-3 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 text-white"
          style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(12px)",
            border:"1.5px solid rgba(255,255,255,0.15)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">{gameTitle}</span>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
          {/* Contador "X/Y capturados" — escondido no Foco (spec: tela limpa, sem
              "2/3 acertos"). Mantido nos outros modos, onde orienta a captura. */}
          {mode !== "foco" && (isMultiTarget || isSeqMode || isCaptureAll || isPhased) && gamePhase === "playing" && totalTargets > 1 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg bg-green-500/40 whitespace-nowrap">
              {foundCount}/{totalTargets} ✓
            </span>
          )}
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-black/20 whitespace-nowrap">
            Nível {displayLevel}
          </span>
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-amber-400/20 whitespace-nowrap" style={{ color: "#fbbf24" }}>
            ⭐ {points}
          </span>
          {/* 🔥 sequência de acertos — escondido no Foco (spec: sem contador de sequência). */}
          {mode !== "foco" && combo >= 2 && (
            <span className="text-xs font-black tabular-nums px-1.5 py-0.5 rounded-lg bg-orange-500/30 whitespace-nowrap animate-pulse" style={{ color: "#fb923c" }}>
              🔥 {combo}
            </span>
          )}
          {gamePhase === "playing" && blitz && (
            <span className="text-xs font-black px-1.5 py-0.5 rounded-lg bg-cyan-400/30 whitespace-nowrap animate-pulse" style={{ color: "#22d3ee" }}>
              ⚡ Relâmpago
            </span>
          )}
          {gamePhase === "playing" && clockLeft > 0 && (
            <span className={`text-xs font-black tabular-nums px-1.5 py-0.5 rounded-lg whitespace-nowrap ${clockLeft <= 4 ? "bg-red-500/40 text-red-100 animate-pulse" : "bg-black/20"}`}>
              ⏱ {clockLeft}s
            </span>
          )}
          {gamePhase === "playing" && clockLeft === 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg bg-black/20 whitespace-nowrap tracking-tight"
              title="Ritmo (sobe a cada 2 acertos seguidos)" style={{ color:"#fbbf24" }}>
              ⚡{"▰".repeat(intensity)}{"▱".repeat(MAX_INTRA_STEP - intensity)}
            </span>
          )}
        </div>
      </div>

      {/* Fase de comando — card centralizado */}
      <AnimatePresence>
        {gamePhase === "command" && (
          <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.95 }}
            transition={{ duration:0.22 }}>

            <div className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(24px)",
                border:"1.5px solid rgba(255,255,255,0.18)", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>

              <div className="px-4 py-2 text-center text-xs font-bold uppercase tracking-widest"
                style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)" }}>
                {instrMode === "audio" ? "👂 Ouça com atenção"
                  : isInhibition ? "🚫 Capture os certos · evite os proibidos"
                  : isCaptureAll ? "🎯 Capture todos os certos"
                  : isPhased ? "🔄 Atenção: a regra muda durante o jogo"
                  : isSeqMode && isNegMode ? "⚠️ Sequência + Proibido"
                  : isSeqMode ? "🔢 Sequência"
                  : isNegMode ? "⚠️ Modo Negativo"
                  : isMultiTarget ? "👥 Dois alvos"
                  : "👁 Leia o comando"}
              </div>

              <div className="px-5 py-5 space-y-4">

                {instrMode !== "audio" && (
                  <>
                    {!isMultiTarget && !isSeqMode && !isNegMode && !isCaptureAll && !isPhased && firstTargetAg && (
                      <div className="flex justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-white/40"
                          style={{ background: PALETTE_HEX[firstTargetAg.color] }} />
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {!commandFaded ? (
                        <motion.p key="cmd"
                          initial={{ opacity:1 }} animate={{ opacity:1 }} exit={{ opacity:0, y:-4 }}
                          transition={{ duration:0.5 }}
                          className="text-center font-bold text-lg leading-snug text-white"
                          style={{ whiteSpace: "pre-line" }}>
                          {command}
                        </motion.p>
                      ) : (
                        <motion.p key="faded"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
                          className="text-center text-sm text-white/35 italic py-1">
                          Confie na memória — capture o alvo!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {instrMode === "audio" && (
                  <div className="text-center space-y-3 py-2">
                    <div className="text-4xl animate-pulse">🔊</div>
                    <p className="font-bold text-base text-violet-300">Modo Auditivo</p>
                    <button onClick={() => speakFn(cleanForSpeech(command))}
                      className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-violet-300 active:scale-95"
                      style={{ background:"rgba(139,92,246,0.15)", border:"1.5px solid rgba(139,92,246,0.4)" }}>
                      🔁 Ouvir novamente
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  {instrMode === "both" && (
                    <button onClick={() => speakFn(cleanForSpeech(command))}
                      className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-violet-300 active:scale-95"
                      style={{ background:"rgba(139,92,246,0.15)", border:"1.5px solid rgba(139,92,246,0.4)" }}>
                      🔊 Ouvir
                    </button>
                  )}
                  <button onClick={startPlaying}
                    className="flex-1 h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 active:scale-95"
                    style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 4px 20px rgba(124,58,237,0.5)" }}>
                    {isSeqMode ? "OK, capturar em sequência →"
                      : isNegMode ? "OK, capturar — cuidado →"
                      : isMultiTarget ? "OK, capturar os dois →"
                      : "OK, capturar! →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arena — sempre montada para que largura/altura possam ser medidas em
          startPlaying. Os personagens só são renderizados em jogo/feedback;
          durante a fase de comando o card de comando (z-30) cobre a arena. */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">

        {/* Barra de comando — só no feedback para mostrar o que era o alvo */}
        {gamePhase === "feedback" && (
          <div className="flex-shrink-0 px-3 py-1.5">
            <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
              style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)" }}>
              {!isNegMode && !isSeqMode && !isMultiTarget && !isCaptureAll && !isPhased && firstTargetAg && (
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: PALETTE_HEX[firstTargetAg.color] }} />
              )}
              <p className="text-white/60 text-xs leading-tight flex-1 line-clamp-2" style={{ whiteSpace:"pre-line" }}>{command}</p>
            </div>
          </div>
        )}

        {/* Regra atual (modos com fases) — lembrete durante o jogo */}
        {isPhased && gamePhase === "playing" && (
          <div className="flex-shrink-0 px-3 py-1.5">
            <div className="rounded-2xl px-3 py-2 text-center"
              style={{ background:"rgba(124,58,237,0.2)", border:"1px solid rgba(167,139,250,0.4)" }}>
              <p className="text-white text-sm font-bold leading-tight" style={{ whiteSpace:"pre-line" }}>{command}</p>
            </div>
          </div>
        )}

        {/* Foco — comando SEMPRE VISÍVEL durante o jogo (spec), exceto no D7 (memória
            curta), onde some para exigir memória operacional leve. */}
        {mode === "foco" && gamePhase === "playing" && !memoryRound && (
          <div className="flex-shrink-0 px-3 py-1.5">
            <div className="rounded-2xl px-3 py-2 text-center"
              style={{ background:"rgba(124,58,237,0.2)", border:"1px solid rgba(167,139,250,0.4)" }}>
              <p className="text-white text-sm font-bold leading-tight" style={{ whiteSpace:"pre-line" }}>{command}</p>
            </div>
          </div>
        )}

        {/* Área da arena */}
        <div ref={playAreaRef} className="relative flex-1 overflow-hidden">
          {/* Fase H — barra condicional: a cor indica a regra ativa */}
          {barColor && gamePhase === "playing" && (
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center gap-2 py-1.5 font-black text-white text-xs"
              style={{ background: PALETTE_HEX[barColor] ?? "#666", textShadow: "0 1px 3px rgba(0,0,0,0.55)", boxShadow: "0 3px 12px rgba(0,0,0,0.4)" }}>
              🎨 BARRA {barColor.toUpperCase()} — siga a regra desta cor
            </div>
          )}
          {(gamePhase === "playing" || gamePhase === "feedback") && fallerPositions.map(f => {
            const ga = gameAgents.find(g => g.uid === f.uid);
            if (!ga) return null;
            const isFound    = foundUids.includes(ga.uid);
            const isWrong    = wrongUid === ga.uid;
            const isForbid   = forbidden.includes(ga.uid);
            const isRevealed = failReason !== null && ga.isTarget && !isFound;
            const state: "idle"|"correct"|"wrong"|"forbidden" =
              isFound    ? "correct" :
              isRevealed ? "correct" :
              isForbid && failReason !== null ? "forbidden" :
              isWrong    ? "wrong" : "idle";

            return (
              <div
                key={ga.uid}
                ref={node => {
                  if (node) fallerNodesRef.current.set(ga.uid, node);
                  else fallerNodesRef.current.delete(ga.uid);
                }}
                style={{
                  position: "absolute",
                  top: f.y,
                  left: f.x,
                  width: CHAR_SIZE,
                  zIndex: 3 + Math.round(((f.y || 0) / (playAreaHRef.current || 600)) * 22),
                  // Só o corpo (botão interno, pointer-events:auto) recebe o toque; a
                  // margem transparente do wrapper deixa o clique atravessar p/ quem
                  // está atrás. Essencial p/ a correção da sobreposição.
                  pointerEvents: "none",
                  willChange: "transform",
                  // Durante "playing" o transform é controlado pelo rAF (omitido
                  // aqui para o React não sobrescrever o valor imperativo). No
                  // feedback a base top/left já é a posição real congelada, então
                  // zeramos o transform.
                  ...(gamePhase === "playing" ? {} : { transform: "translate(0px, 0px)" }),
                }}>
                <AgentCard
                  gameAgent={ga}
                  onClick={() => handleCharTap(ga)}
                  state={state}
                  size={CHAR_SIZE}
                  flashy={gamePhase === "playing" && flashyUids.includes(ga.uid)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Aviso de troca de regra (Alternância/Desafio) */}
      <AnimatePresence>
        {phaseHint && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-6"
            initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}>
            <div className="px-8 py-6 rounded-3xl text-center text-white"
              style={{ background:"rgba(124,58,237,0.95)", backdropFilter:"blur(16px)",
                border:"1.5px solid rgba(255,255,255,0.3)", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>
              <p className="text-4xl mb-2">🔄</p>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">A regra mudou!</p>
              <p className="text-xl font-black" style={{ whiteSpace:"pre-line" }}>{phaseHint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de feedback */}
      <AnimatePresence>
        {gamePhase === "feedback" && (
          <motion.div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.18 }}>
            <div className="px-10 py-7 rounded-3xl text-center text-white"
              style={{
                background: isCorrect
                  ? "rgba(22,163,74,0.92)"
                  : failReason === "timeout"
                  ? "rgba(234,88,12,0.92)"
                  : "rgba(220,38,38,0.92)",
                backdropFilter:"blur(20px)",
                border:"1.5px solid rgba(255,255,255,0.25)",
                boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
              }}>
              <p className="text-5xl mb-2">
                {isCorrect ? "✅" : failReason === "timeout" ? "⏱" : "❌"}
              </p>
              <p className="font-bold text-2xl">
                {isCorrect ? "Correto!" : failReason === "timeout" ? "Tempo esgotado" : "Errou!"}
              </p>
              {isSeqMode && isCorrect && (
                <p className="text-sm opacity-80 mt-1">Sequência completa!</p>
              )}
              {isCaptureAll && isCorrect && totalTargets > 1 && (
                <p className="text-sm opacity-80 mt-1">Capturou todos os {totalTargets}!</p>
              )}
              {isPhased && isCorrect && (
                <p className="text-sm opacity-80 mt-1">Todas as regras concluídas! 🔄</p>
              )}
              {isPhased && failReason === "wrong-tap" && wrongUid !== null && !forbidden.includes(wrongUid) && (
                <p className="text-sm opacity-80 mt-1">Atenção: essa não era a regra atual!</p>
              )}
              {failReason === "wrong-tap" && wrongUid !== null && forbidden.includes(wrongUid) && (
                <p className="text-sm opacity-80 mt-1">Esse era proibido! 🚫</p>
              )}
              {isInhibition && failReason === "wrong-tap" && wrongUid !== null && !forbidden.includes(wrongUid) && (
                <p className="text-sm opacity-80 mt-1">Esse não era para capturar.</p>
              )}
              {isNegMode && failReason === "wrong-tap" && (
                <p className="text-sm opacity-80 mt-1">Tocou no personagem proibido!</p>
              )}
              {mode !== "foco" && (isMultiTarget || isSeqMode || isCaptureAll) && !isCorrect && foundCount > 0 && (
                <p className="text-sm opacity-80 mt-1">{foundCount} de {totalTargets} capturado{foundCount>1?"s":""}</p>
              )}

              {/* Foco — painel de desempenho da rodada (cara de ferramenta cognitiva). */}
              {mode === "foco" && (() => {
                const erros = failReason === "wrong-tap" ? 1 : 0;
                const omiss = isCorrect ? 0 : Math.max(0, totalTargets - foundCount);
                // PILOTO Foco — feedback de ERRO explícito e instrutivo (rigor de
                // treino). Toque impulsivo: diz por que errou (se foi num confusável,
                // que compartilha SÓ um atributo com a regra). Timeout: quantos
                // faltaram. Em ambos: repete o MESMO nível (não facilita).
                const wa = wrongAgentRef.current;
                const wasConfusable = !!wa && !!firstTargetAg &&
                  (wa.color === firstTargetAg.color ||
                   (wa.images[0]?.tags ?? []).some(t => (firstTargetAg.images[0]?.tags ?? []).includes(t)));
                const errorMsg =
                  isCorrect ? null
                  : failReason === "timeout"
                    ? `Faltou capturar ${omiss} — vamos repetir.`
                    : wasConfusable
                      ? "Esse parecia, mas não batia com a regra. Confira todos os atributos."
                      : "Esse não batia com a regra.";
                return (
                  <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.28)" }}>
                    <div className="flex justify-center gap-5 text-sm tabular-nums">
                      <span><b>{foundCount}</b> acerto{foundCount !== 1 ? "s" : ""}</span>
                      <span><b>{erros}</b> erro{erros !== 1 ? "s" : ""}</span>
                      <span><b>{omiss}</b> omiss{omiss !== 1 ? "ões" : "ão"}</span>
                    </div>
                    <div className="flex justify-center gap-5 text-xs opacity-90 tabular-nums">
                      <span>Tempo {(lastRt / 1000).toFixed(1).replace(".", ",")}s</span>
                      <span>Dificuldade {displayLevel}</span>
                    </div>
                    {errorMsg && (
                      <p className="text-sm font-semibold opacity-95 pt-1">{errorMsg}</p>
                    )}
                    <p className="text-xs opacity-95 pt-1">
                      {isCorrect
                        ? (nextDir === "harder" ? "A próxima rodada será um pouco mais difícil."
                          : "Dificuldade mantida na próxima rodada.")
                        : "Mesmo nível na próxima — novo arranjo."}
                    </p>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
