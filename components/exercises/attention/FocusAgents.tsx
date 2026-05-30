"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { playTTS, cancelTTS } from "@/lib/tts";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { agents } from "@/data/agents";
import type { AgentConfig } from "@/data/agents";
import type { ExerciseResult, Theme } from "@/types";
import type { CommandRuleType } from "@/types/commands";
import { buildRound } from "@/utils/generateCommand";

// ── Types ──────────────────────────────────────────────────────────────────────

interface WaveParams { amp: number; dur: number; delay: number; }

interface GameAgent {
  uid:      string;
  agent:    AgentConfig;
  variant:  number;
  isTarget: boolean;
  wave:     WaveParams;
}

interface FallerData {
  uid:       string;
  xBase:     number; // posição base esquerda em % (posicionamento livre)
  y:         number;
  passCount: number;
  xAmp:      number;
  xFreq:     number;
  xPhase:    number;
}

type InstrMode  = "both" | "visual" | "audio";
type FailReason = "wrong-tap" | "timeout" | null;

const COLS      = 4;
const CHAR_SIZE = 74;
const TICK_MS   = 50;

function fallSpeedPx(consecutiveCorrectCount: number): number {
  const level = Math.floor(consecutiveCorrectCount / 3);
  return 4.2 + level * 0.9;
}

// Posição horizontal (em % da área) de um faller em função do seu Y atual.
// Fórmula única compartilhada entre o render (base) e o rAF (posição viva),
// para que o transform imperativo nunca divirja do que o React renderizou.
function fallerXPct(f: FallerData, y: number): number {
  const xRaw = f.xBase + f.xAmp * Math.sin((y / f.xFreq) * Math.PI * 2 + f.xPhase);
  return Math.max(1, Math.min(xRaw, 76));
}

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInstrMode(d: number): InstrMode {
  if (d <= 4) return "both"; if (d <= 7) return "visual"; return "audio";
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

function AgentCard({ gameAgent, onClick, state, size }: {
  gameAgent: GameAgent; onClick: () => void;
  state: "idle" | "correct" | "wrong" | "forbidden"; size: number;
}) {
  const src  = gameAgent.agent.images[gameAgent.variant]?.src ?? gameAgent.agent.images[0].src;
  const ring =
    state === "correct"   ? "ring-4 ring-green-400 bg-green-500/20 scale-105" :
    state === "wrong"     ? "ring-4 ring-red-400 bg-red-500/20 opacity-50" :
    state === "forbidden" ? "ring-4 ring-orange-400 bg-orange-500/20 opacity-40" :
    "ring-1 ring-white/20 active:scale-95 bg-white/5";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className={`relative rounded-xl cursor-pointer transition-all duration-150 ${ring}`}
      style={{ touchAction: "manipulation", width: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={gameAgent.agent.name}
        style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}
        draggable={false} />
    </motion.button>
  );
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

const DEMO_AGENTS = [
  { id: "d-neo",    src: "/exercises/agents/neo-1.png",    isTarget: true,  wave: { amp: 10, dur: 3.0, delay: 0.0 } },
  { id: "d-nexo",   src: "/exercises/agents/nexo-1.png",   isTarget: false, wave: { amp:  8, dur: 2.5, delay: 0.6 } },
  { id: "d-mindra", src: "/exercises/agents/mindra-2.png", isTarget: false, wave: { amp: 12, dur: 3.5, delay: 1.1 } },
  { id: "d-fokus",  src: "/exercises/agents/fokus-2.png",  isTarget: false, wave: { amp:  9, dur: 2.8, delay: 0.4 } },
  { id: "d-ignite", src: "/exercises/agents/ignite-1.png", isTarget: false, wave: { amp: 11, dur: 3.2, delay: 1.7 } },
  { id: "d-redex",  src: "/exercises/agents/redex-1.png",  isTarget: false, wave: { amp:  7, dur: 2.6, delay: 0.9 } },
];

function FocusTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const noun = NOUN[theme];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "rgba(6,14,48,0.98)" }}>

      <h2 className="text-white font-black text-xl mb-1 text-center">Como jogar</h2>
      <p className="text-white/60 text-sm mb-5 text-center">
        Encontre o {noun} certo entre vários em movimento
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
          <p className="text-white font-bold text-sm">Encontre o {noun} azul com fone</p>
        </div>
      </div>

      {/* Grade demo com animação de onda */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-6" style={{ minHeight: 160 }}>
        {DEMO_AGENTS.map(da => (
          <motion.div key={da.id}
            animate={{ y: [0, -da.wave.amp, 0, da.wave.amp, 0] }}
            transition={{ duration: da.wave.dur, repeat: Infinity, ease: "easeInOut", delay: da.wave.delay }}
            className="relative flex items-center justify-center">
            <div className={`rounded-xl overflow-hidden ${da.isTarget
              ? "ring-4 ring-green-400 bg-green-500/20"
              : "ring-1 ring-white/15 bg-white/5"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={da.src} alt="" style={{ width: 86, height: "auto", display: "block", userSelect: "none" }} draggable={false} />
            </div>
            {da.isTarget && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Instruções */}
      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-2"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-white/70 text-xs leading-relaxed">
          • Os {noun}s descem pela tela em <span className="text-white font-semibold">velocidades diferentes</span>
        </p>
        <p className="text-white/70 text-xs leading-relaxed">
          • O alvo passa <span className="text-white font-semibold">2 vezes</span> — toque antes de desaparecer!
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

const MAX_ROUNDS = 15;

export interface FocusAgentsProps {
  difficulty: number; theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  forceMode?: "visual" | "auditivo";
  exerciseId?: string;
}

export function FocusAgents({ difficulty, theme, onComplete, forceMode, exerciseId = "focus-agents" }: FocusAgentsProps) {
  const speakFn = useCallback((text: string) => {
    if (forceMode === "visual") return;
    playTTS(text);
  }, [forceMode]);

  const reportProgress = useExerciseProgress();

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
  const [roundResults, setRoundResults] = useState<{ correct:boolean; rt:number }[]>([]);
  const [displayLevel, setDisplayLevel] = useState(Math.max(1, Math.min(10, difficulty)));
  const [cmdCountdown, setCmdCountdown] = useState<number|null>(null);

  const rafRef              = useRef<number|null>(null);
  const fallersRef          = useRef<FallerData[]>([]);
  // PERF-01: durante a fase "playing" a física corre no `fallersRef` e o
  // movimento é aplicado direto via style.transform nos nós DOM (sem setState
  // a cada frame). `fallerNodesRef` referencia os elementos (callback ref) e
  // `fallerBaseRef` guarda a posição base renderizada (top px / left %) de cada
  // faller no instante em que o play começou — o transform anima o delta.
  const fallerNodesRef      = useRef<Map<string, HTMLDivElement>>(new Map());
  const fallerBaseRef       = useRef<Map<string, { y: number; xPct: number }>>(new Map());
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
  const adaptiveLevelRef    = useRef(Math.max(1, Math.min(10, difficulty)));
  const consecutiveCorrect  = useRef(0);
  const consecutiveWrong    = useRef(0);
  const cmdCountdownRef     = useRef<ReturnType<typeof setInterval>|null>(null);
  const autoStartFnRef      = useRef<(()=>void)|null>(null);
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
  const warmupCorrectRef        = useRef(0);
  roundResultsRef.current = roundResults;

  // Auto-start countdown durante fase de comando
  useEffect(() => {
    if (showTutorial || gamePhase !== "command" || doneRef.current) {
      setCmdCountdown(null);
      if (cmdCountdownRef.current) { clearInterval(cmdCountdownRef.current); cmdCountdownRef.current = null; }
      return;
    }
    const SECS = 3;
    setCmdCountdown(SECS);
    let count = SECS;
    cmdCountdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(cmdCountdownRef.current!);
        cmdCountdownRef.current = null;
        setCmdCountdown(null);
        autoStartFnRef.current?.();
      } else {
        setCmdCountdown(count);
      }
    }, 1000);
    return () => {
      if (cmdCountdownRef.current) { clearInterval(cmdCountdownRef.current); cmdCountdownRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, showTutorial]);

  const stopFallAnimation = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const prepareRound = useCallback((_r: number) => {
    roundRef.current = _r;
    const d = warmupCorrectRef.current < 3
      ? Math.min(2, adaptiveLevelRef.current)
      : adaptiveLevelRef.current;

    let built = buildRound(d, theme, recentVerbsRef.current);

    // Evita repetir o mesmo agente alvo nas últimas 3 rodadas
    for (let attempt = 0; attempt < 2; attempt++) {
      const ids = built.command.targets
        .map(tid => built.characters.find(c => c.id === tid)?.agentId)
        .filter(Boolean) as string[];
      if (ids.some(aid => recentTargetAgentIdsRef.current.slice(-3).includes(aid))) {
        built = buildRound(d, theme, recentVerbsRef.current);
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
      const agent = agents.find(a => a.id === attr.agentId);
      if (!agent) return null;
      const uid = `${attr.id}-${Date.now()}-${Math.random()}`;
      uidMap.set(attr.id, uid);
      return {
        uid,
        agent,
        variant:  attr.variantIndex,
        isTarget: built.command.targets.includes(attr.id),
        wave: {
          amp:   7 + Math.random() * 8,
          dur:   2.4 + Math.random() * 1.4,
          delay: Math.random() * 2.0,
        },
      };
    }).filter(Boolean) as GameAgent[];

    const newTargetUids = built.command.targets.map(id => uidMap.get(id)!).filter(Boolean);
    const newForbidden  = built.command.forbidden.map(id => uidMap.get(id)!).filter(Boolean);
    const newSequenced  = built.command.sequenced;
    const newRequired   = built.command.requiredTargets;
    const newType       = built.command.rule.type;
    const verbIdx       = built.command.verbIndex ?? 0;

    recentVerbsRef.current = [...recentVerbsRef.current.slice(-4), verbIdx];

    setGameAgents(newGameAgents);
    setCommand(built.command.text);
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

    // Inicializa fallers espalhados livremente pela tela (como na imagem de referência)
    const screenH = playAreaHRef.current || 600;
    const shuffled = shuffle([...newGameAgents]);
    const totalSpread = screenH + CHAR_SIZE * 2;
    const newFallers: FallerData[] = shuffled.map((ga, i) => ({
      uid:       ga.uid,
      xBase:     4 + Math.random() * 72,          // spread livre 4%–76%
      y:         -(CHAR_SIZE + (i / shuffled.length) * totalSpread + Math.random() * 40),
      passCount: 0,
      xAmp:      2.5 + Math.random() * 2,         // drift suave
      xFreq:     220 + Math.random() * 100,       // onda lenta
      xPhase:    Math.random() * Math.PI * 2,
    }));
    fallersRef.current = newFallers;
    setFallerPositions([...newFallers]);
    setRoundType(newType);
    roundTypeRef.current = newType;
    setGamePhase("command");
    resolvedIds.current = new Set();

    const instrMode: InstrMode =
      forceMode === "visual"   ? "visual" :
      forceMode === "auditivo" ? "audio"  :
      getInstrMode(d);

    if (instrMode !== "visual") speakFn(built.command.text);

    if (commandFadeTimerRef.current) clearTimeout(commandFadeTimerRef.current);
    if (d >= 7 && instrMode !== "audio") {
      commandFadeTimerRef.current = setTimeout(() => setCommandFaded(true), 4000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, forceMode, speakFn]);

  function startPlaying() {
    if (cmdCountdownRef.current) { clearInterval(cmdCountdownRef.current); cmdCountdownRef.current = null; }
    setCmdCountdown(null);
    stopFallAnimation();

    playAreaHRef.current = playAreaRef.current?.clientHeight ?? 600;
    playAreaWRef.current = playAreaRef.current?.clientWidth  ?? 0;
    setGamePhase("playing");
    roundStart.current = Date.now();

    // Base renderizada de cada faller (top px / left %) no instante em que o
    // play inicia — é exatamente o que o React renderiza em `fallerPositions`.
    // O transform imperativo no rAF anima o delta sobre esta base.
    fallerBaseRef.current = new Map(
      fallersRef.current.map(f => [f.uid, { y: f.y, xPct: fallerXPct(f, f.y) }]),
    );

    // PERF-01: a queda corre no rAF mutando `fallersRef` e aplicando o
    // transform direto no DOM. setState só é disparado em eventos discretos
    // (mudança de passagem do alvo via `setTargetPass`, e timeout/alvo perdido
    // via `setFailReason`/`handleResult`). A velocidade é normalizada por tempo
    // (dt/TICK_MS) para manter exatamente a mesma física do antigo setInterval
    // de ~TICK_MS, independente da taxa de frames do rAF.
    let prevTs: number | null = null;

    const animate = (ts: number) => {
      if (resolvedIds.current.has("timeout")) { stopFallAnimation(); return; }

      // dt em ms desde o frame anterior. Clampado a 100ms para que um eventual
      // pico de lag (ou retomada após a aba ficar em background, quando o rAF
      // pausa) não produza um salto gigante que pularia o wrap e provocaria um
      // timeout indevido. Em operação normal (~16ms) o clamp nunca ativa.
      const dt    = prevTs === null ? TICK_MS : Math.min(ts - prevTs, 100);
      prevTs      = ts;
      const ticks = dt / TICK_MS;

      const speed   = fallSpeedPx(consecutiveCorrect.current) * ticks;
      const screenH = playAreaHRef.current;
      const screenW = playAreaWRef.current;

      let targetLost = false;
      let newPassCount = 0;

      fallersRef.current = fallersRef.current.map(f => {
        let newY = f.y + speed;
        let newPass = f.passCount;

        if (newY > screenH) {
          const isTarget = targetUidsRef.current.includes(f.uid);
          newY = -(CHAR_SIZE + Math.random() * 40);
          if (isTarget) {
            newPass++;
            newPassCount = newPass;
            if (newPass >= 2) targetLost = true;
          }
        }
        return { ...f, y: newY, passCount: newPass };
      });

      // Aplica o movimento direto no DOM via transform (delta sobre a base).
      for (const f of fallersRef.current) {
        const node = fallerNodesRef.current.get(f.uid);
        const base = fallerBaseRef.current.get(f.uid);
        if (node && base) {
          const dyPx = f.y - base.y;
          const dxPx = ((fallerXPct(f, f.y) - base.xPct) / 100) * screenW;
          node.style.transform = `translate(${dxPx}px, ${dyPx}px)`;
        }
      }

      // Evento discreto: a passagem do alvo mudou (atualiza HUD "1ª/2ª vez").
      if (newPassCount > 0 && newPassCount - 1 !== targetPassRef.current) {
        targetPassRef.current = newPassCount - 1;
        setTargetPass(newPassCount - 1);
      }

      if (targetLost && !resolvedIds.current.has("timeout")) {
        resolvedIds.current.add("timeout");
        // Congela o render nas posições reais alcançadas pela física, para que
        // o feedback não "salte" os agentes de volta à base inicial.
        setFallerPositions([...fallersRef.current]);
        setFailReason("timeout");
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
    // Congela o render nas posições reais alcançadas pela física durante o
    // play (não na base inicial), para que a transição para o feedback não
    // "salte" os agentes. Cobre os três caminhos: acerto, toque errado e timeout.
    setFallerPositions([...fallersRef.current]);
    if (commandFadeTimerRef.current) { clearTimeout(commandFadeTimerRef.current); commandFadeTimerRef.current = null; }

    const rt         = Date.now() - roundStart.current;
    const newResults = [...roundResultsRef.current, { correct, rt }];
    setRoundResults(newResults);
    roundResultsRef.current = newResults;
    setGamePhase("feedback");

    const nextRound = r + 1;
    reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

    if (correct) {
      if (warmupCorrectRef.current < 3) warmupCorrectRef.current++;
      consecutiveWrong.current = 0;
      consecutiveCorrect.current++;
      if (consecutiveCorrect.current >= 2) {
        consecutiveCorrect.current = 0;
        adaptiveLevelRef.current = Math.min(10, adaptiveLevelRef.current + 2);
        setDisplayLevel(adaptiveLevelRef.current);
      }
    } else {
      consecutiveCorrect.current = 0;
      consecutiveWrong.current++;
      if (consecutiveWrong.current >= 2) {
        consecutiveWrong.current = 0;
        adaptiveLevelRef.current = Math.max(1, adaptiveLevelRef.current - 1);
        setDisplayLevel(adaptiveLevelRef.current);
      }
    }

    setTimeout(() => {
      if (nextRound >= MAX_ROUNDS) {
        doneRef.current = true;
        const correctCount = newResults.filter(x => x.correct).length;
        const accuracy     = correctCount / MAX_ROUNDS;
        const avgRt        = newResults.filter(x => x.correct).reduce((s, x) => s + x.rt, 0) / (correctCount || 1);
        onComplete({
          exerciseId, domain: "attention",
          score: calculateExerciseScore("focus-agents", accuracy, Math.round(avgRt), difficulty),
          accuracy, reactionTime: Math.round(avgRt), difficulty,
          duration: Math.round((Date.now() - sessionStart.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: correctCount },
        });
      } else {
        setRound(nextRound);
        prepareRound(nextRound);
      }
    }, 1100);
  }

  function handleCharTap(ga: GameAgent) {
    if (gamePhase !== "playing") return;
    if (resolvedIds.current.has(ga.uid)) return;
    resolvedIds.current.add(ga.uid);

    const isNeg = roundTypeRef.current === "negative";

    if (forbiddenRef.current.includes(ga.uid)) {
      resolvedIds.current.add("timeout");
      setWrongUid(ga.uid);
      setFailReason("wrong-tap");
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
          foundUidsRef.current = newFound;
          setFoundUids(newFound);
          if (newStep >= targetUidsRef.current.length) {
            resolvedIds.current.add("timeout");
            handleResult(true, round);
          }
        } else {
          resolvedIds.current.add("timeout");
          setWrongUid(ga.uid);
          setFailReason("wrong-tap");
          handleResult(false, round);
        }
      } else {
        if (!foundUidsRef.current.includes(ga.uid)) {
          const newFound = [...foundUidsRef.current, ga.uid];
          foundUidsRef.current = newFound;
          setFoundUids(newFound);
          if (newFound.length >= requiredTargetsRef.current) {
            resolvedIds.current.add("timeout");
            handleResult(true, round);
          }
        }
      }
    } else {
      resolvedIds.current.add("timeout");
      setWrongUid(ga.uid);
      setFailReason("wrong-tap");
      handleResult(false, round);
    }
  }

  useEffect(() => {
    if (showTutorial) return;
    sessionStart.current = Date.now();
    prepareRound(0);
    return () => {
      stopFallAnimation();
      if (commandFadeTimerRef.current) clearTimeout(commandFadeTimerRef.current);
      if (cmdCountdownRef.current) clearInterval(cmdCountdownRef.current);
      cancelTTS();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  if (showTutorial) return (
    <FocusTutorial theme={theme} onDone={() => setShowTutorial(false)} />
  );

  // ── Derived state ──────────────────────────────────────────────────────────

  const effectiveDiff  = adaptiveLevelRef.current;
  const instrMode: InstrMode =
    forceMode === "visual"   ? "visual" :
    forceMode === "auditivo" ? "audio"  :
    getInstrMode(effectiveDiff);

  const isNegMode     = roundType === "negative" || roundType === "advanced";
  const isSeqMode     = roundType === "sequence"  || roundType === "advanced";
  const isMultiTarget = roundType === "multiTarget";

  autoStartFnRef.current = startPlaying;

  const totalTargets   = targetUids.length;
  const foundCount     = foundUids.length;
  const isCorrect      = foundCount >= totalTargets && totalTargets > 0;
  const firstTargetAg  = gameAgents.find(ga => ga.uid === targetUids[0])?.agent;

  const gameTitle = theme === "COLORFUL" ? "🎯 Focus Personagens"
                  : theme === "GAMIFIED" ? "🎮 Focus Avatares" : "🔍 Focus Agentes";

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
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${dotColor(i)}`} />
            ))}
          </div>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">{round+1}/{MAX_ROUNDS}</span>
          {(isMultiTarget || isSeqMode) && gamePhase === "playing" && foundCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg bg-green-500/40 whitespace-nowrap">
              {foundCount}/{totalTargets} ✓
            </span>
          )}
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-black/20 whitespace-nowrap">
            N{displayLevel}
          </span>
          {gamePhase === "playing" && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap ${
              targetPass >= 1 ? "bg-orange-500 text-white" : "bg-black/20 text-white/70"}`}>
              {targetPass >= 1 ? "⚠️ 2ª vez" : "1ª vez"}
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
                  : isSeqMode && isNegMode ? "⚠️ Sequência + Proibido"
                  : isSeqMode ? "🔢 Sequência"
                  : isNegMode ? "⚠️ Modo Negativo"
                  : isMultiTarget ? "👥 Dois alvos"
                  : "👁 Leia o comando"}
              </div>

              <div className="px-5 py-5 space-y-4">

                {instrMode !== "audio" && (
                  <>
                    {!isMultiTarget && !isSeqMode && !isNegMode && firstTargetAg && (
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
                          className="text-center font-bold text-lg leading-snug text-white">
                          {command}
                        </motion.p>
                      ) : (
                        <motion.p key="faded"
                          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
                          className="text-center text-sm text-white/35 italic py-1">
                          Confie na memória — encontre o personagem!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {instrMode === "audio" && (
                  <div className="text-center space-y-3 py-2">
                    <div className="text-4xl animate-pulse">🔊</div>
                    <p className="font-bold text-base text-violet-300">Modo Auditivo</p>
                    <button onClick={() => speakFn(command)}
                      className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-violet-300 active:scale-95"
                      style={{ background:"rgba(139,92,246,0.15)", border:"1.5px solid rgba(139,92,246,0.4)" }}>
                      🔁 Ouvir novamente
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  {instrMode === "both" && (
                    <button onClick={() => speakFn(command)}
                      className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-violet-300 active:scale-95"
                      style={{ background:"rgba(139,92,246,0.15)", border:"1.5px solid rgba(139,92,246,0.4)" }}>
                      🔊 Ouvir
                    </button>
                  )}
                  <button onClick={startPlaying}
                    className="flex-1 h-12 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 active:scale-95"
                    style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow:"0 4px 20px rgba(124,58,237,0.5)" }}>
                    {cmdCountdown !== null && cmdCountdown > 0
                      ? <span className="text-xl font-black">{cmdCountdown}</span>
                      : isSeqMode ? "Começar sequência →"
                      : isNegMode ? "Começar — cuidado →"
                      : isMultiTarget ? "Encontrar os dois →"
                      : "Encontrar! →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de queda — fase de jogo e feedback */}
      {(gamePhase === "playing" || gamePhase === "feedback") && (
        <div className="relative z-10 flex flex-col flex-1 min-h-0">

          {/* Barra de comando — só no feedback para mostrar o que era o alvo */}
          {gamePhase === "feedback" && (
            <div className="flex-shrink-0 px-3 py-1.5">
              <div className="rounded-2xl px-3 py-2 flex items-center gap-2"
                style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)" }}>
                {!isNegMode && !isSeqMode && !isMultiTarget && firstTargetAg && (
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: PALETTE_HEX[firstTargetAg.color] }} />
                )}
                <p className="text-white/60 text-xs leading-tight flex-1 line-clamp-2">{command}</p>
              </div>
            </div>
          )}

          {/* Área de personagens caindo */}
          <div ref={playAreaRef} className="relative flex-1 overflow-hidden">
            {fallerPositions.map(f => {
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

              const xPct = fallerXPct(f, f.y);

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
                    left: `calc(${xPct}% - ${CHAR_SIZE / 2}px)`,
                    width: CHAR_SIZE,
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
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              {isNegMode && failReason === "wrong-tap" && (
                <p className="text-sm opacity-80 mt-1">Tocou no personagem proibido!</p>
              )}
              {(isMultiTarget || isSeqMode) && !isCorrect && foundCount > 0 && (
                <p className="text-sm opacity-80 mt-1">{foundCount} de {totalTargets} encontrado{foundCount>1?"s":""}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
