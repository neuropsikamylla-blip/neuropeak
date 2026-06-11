"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface PadroesRotacaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Progressão (10 níveis) — multifatorial ──────────────────────────────────────
interface MLevel { grid: number; kMin: number; kMax: number; rots: number[]; showMs: number; delayMs: number; }
const LEVELS: Record<number, MLevel> = {
  1:  { grid: 3, kMin: 2, kMax: 2, rots: [90],          showMs: 2800, delayMs: 0 },
  2:  { grid: 3, kMin: 3, kMax: 3, rots: [90],          showMs: 2600, delayMs: 0 },
  3:  { grid: 4, kMin: 3, kMax: 3, rots: [90],          showMs: 2500, delayMs: 0 },
  4:  { grid: 4, kMin: 4, kMax: 4, rots: [90, 180],     showMs: 2400, delayMs: 0 },
  5:  { grid: 4, kMin: 4, kMax: 5, rots: [180],         showMs: 2200, delayMs: 0 },
  6:  { grid: 5, kMin: 4, kMax: 4, rots: [90, 180, 270],showMs: 2200, delayMs: 0 },
  7:  { grid: 5, kMin: 5, kMax: 5, rots: [90, 180, 270],showMs: 2000, delayMs: 0 },
  8:  { grid: 5, kMin: 5, kMax: 6, rots: [90, 180, 270],showMs: 1900, delayMs: 600 },
  9:  { grid: 6, kMin: 6, kMax: 6, rots: [90, 180, 270],showMs: 1700, delayMs: 700 },
  10: { grid: 6, kMin: 6, kMax: 7, rots: [90, 180, 270],showMs: 1500, delayMs: 900 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 6;

// Rotação horária de (linha, coluna) numa matriz N×N — índice 0.
function rotatePos(r: number, c: number, N: number, deg: number): [number, number] {
  if (deg === 90) return [c, N - 1 - r];          // 90° horário
  if (deg === 180) return [N - 1 - r, N - 1 - c]; // 180°
  return [N - 1 - c, r];                           // 270° horário
}
// Borda onde fica o marcador de orientação após girar `deg` (começa no TOPO).
function markerEdge(deg: number): "top" | "right" | "bottom" | "left" {
  if (deg === 90) return "right";
  if (deg === 180) return "bottom";
  if (deg === 270) return "left";
  return "top";
}
function rotLabel(deg: number): string { return `${deg}° ↻`; }
const cellKey = (r: number, c: number) => `${r},${c}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Som (Web Audio) — bipes curtos, igual à Matriz Espacial ──────────────────────
let audioCtx: AudioContext | null = null;
function beep(freq: number, durMs = 180, type: OscillatorType = "sine", gain = 0.08) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const ctx = audioCtx;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durMs / 1000);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + durMs / 1000);
  } catch { /* áudio indisponível */ }
}
const soundLight   = () => beep(523, 200, "sine", 0.08);   // célula pisca (apresentação)
const soundTap     = () => beep(659, 110, "sine", 0.06);   // toque do paciente
const soundCorrect = () => { beep(659, 120, "sine", 0.08); setTimeout(() => beep(988, 220, "sine", 0.08), 120); };
const soundWrong   = () => beep(160, 260, "square", 0.06);

type Phase = "tutorial" | "ready" | "show" | "rotating" | "delay" | "input" | "feedback";

const TEAL = "#22d3c5";

// ── Marcador de orientação (barra numa borda da matriz) ──────────────────────────
function EdgeMarker({ edge }: { edge: "top" | "right" | "bottom" | "left" }) {
  const horiz = edge === "top" || edge === "bottom";
  const s: React.CSSProperties = {
    position: "absolute", background: "linear-gradient(90deg,#22d3c5,#0d9488)", borderRadius: 6,
    boxShadow: "0 0 10px rgba(34,211,197,0.7)",
    ...(horiz ? { left: "18%", right: "18%", height: 7 } : { top: "18%", bottom: "18%", width: 7 }),
    ...(edge === "top" ? { top: 2 } : edge === "bottom" ? { bottom: 2 } : edge === "left" ? { left: 2 } : { right: 2 }),
  };
  return <div style={s} />;
}

// ── Matriz ───────────────────────────────────────────────────────────────────────
function Matrix({
  N, cellPx, lit, picked, expected, phase, edge, onTap,
}: {
  N: number; cellPx: number; lit: Set<string>; picked: Set<string>; expected: Set<string>;
  phase: Phase; edge: "top" | "right" | "bottom" | "left"; onTap: (r: number, c: number) => void;
}) {
  return (
    <div style={{ position: "relative", padding: 12 }}>
      <EdgeMarker edge={edge} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, ${cellPx}px)`, gap: 6, padding: 6,
        background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(148,163,184,0.16)" }}>
        {Array.from({ length: N * N }).map((_, i) => {
          const r = Math.floor(i / N), c = i % N, key = cellKey(r, c);
          const isLit = phase === "show" && lit.has(key);
          const isPicked = (phase === "input" || phase === "feedback") && picked.has(key);
          const isExpected = phase === "feedback" && expected.has(key);
          let bg = "rgba(255,255,255,0.05)", border = "rgba(148,163,184,0.18)";
          if (isLit) { bg = TEAL; border = TEAL; }
          else if (phase === "feedback" && isExpected && isPicked) { bg = "rgba(74,222,128,0.55)"; border = "#4ade80"; }
          else if (phase === "feedback" && isExpected) { bg = "rgba(74,222,128,0.2)"; border = "#4ade80"; }
          else if (phase === "feedback" && isPicked) { bg = "rgba(248,113,113,0.45)"; border = "#f87171"; }
          else if (isPicked) { bg = "rgba(34,211,197,0.5)"; border = TEAL; }
          return (
            <button key={key} onClick={() => onTap(r, c)} disabled={phase !== "input"}
              style={{ width: cellPx, height: cellPx, background: bg, border: `1.5px solid ${border}`, borderRadius: 10,
                transition: "background .15s, border-color .15s", cursor: phase === "input" ? "pointer" : "default" }} />
          );
        })}
      </div>
    </div>
  );
}

// ── Tutorial (demonstração animada) ──────────────────────────────────────────────
function TutorialDemo({ onDone }: { onDone: () => void }) {
  const N = 3;
  const demoOrig = new Set(["0,0", "1,2"]);
  const demoRot = new Set(["0,2", "2,1"]); // rotação 90° horário de (0,0)->(0,2) e (1,2)->(2,1)
  const [step, setStep] = useState(0); // 0 mostra, 1 gira, 2 resultado
  const runRef = useRef(0);

  const play = useCallback(async () => {
    const my = ++runRef.current;
    setStep(0); await sleep(1500); if (runRef.current !== my) return;
    setStep(1); await sleep(1500); if (runRef.current !== my) return;
    setStep(2);
  }, []);
  useEffect(() => { play(); return () => { runRef.current++; }; }, [play]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-md rounded-3xl p-6" style={CARD}>
        <h2 className="text-lg font-bold text-white text-center mb-1">Como jogar: Matriz com Rotações</h2>
        <ol className="text-xs space-y-1 mb-4 mx-auto max-w-xs" style={{ color: "rgba(148,163,184,0.85)" }}>
          <li>1. Observe as posições acesas na matriz.</li>
          <li>2. Memorize o padrão.</li>
          <li>3. A matriz vai girar como um tabuleiro.</li>
          <li>4. Marque onde os pontos ficam depois da rotação.</li>
        </ol>
        <div className="flex justify-center my-3" style={{ minHeight: 150 }}>
          {step === 1 ? (
            <motion.div key="d-rot" initial={{ rotate: 0 }} animate={{ rotate: 90 }} transition={{ duration: 1.2, ease: [0.45, 0, 0.2, 1] }}>
              <Matrix N={N} cellPx={42} lit={new Set()} picked={new Set()} expected={new Set()} phase="rotating" edge="top" onTap={() => {}} />
            </motion.div>
          ) : step === 2 ? (
            <Matrix N={N} cellPx={42} lit={new Set()} picked={demoRot} expected={demoRot} phase="feedback" edge="right" onTap={() => {}} />
          ) : (
            <Matrix N={N} cellPx={42} lit={demoOrig} picked={new Set()} expected={new Set()} phase="show" edge="top" onTap={() => {}} />
          )}
        </div>
        <p className="text-center text-sm font-semibold mb-4" style={{ color: TEAL, minHeight: 20 }}>
          {step === 0 ? "👀 Memorize as posições" : step === 1 ? "🔄 O tabuleiro gira 90° ↻" : "✅ Os pontos ficam aqui"}
        </p>
        <div className="flex gap-2">
          <button onClick={play} className="flex-1 rounded-2xl font-bold text-sm py-3 active:scale-95"
            style={{ background: "rgba(34,211,197,0.12)", border: "1px solid rgba(34,211,197,0.4)", color: TEAL }}>↻ Repetir</button>
          <button onClick={onDone} className="flex-1 rounded-2xl font-bold text-white text-sm py-3 active:scale-95"
            style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 4px 20px rgba(13,148,136,0.5)" }}>Começar →</button>
        </div>
      </div>
    </div>
  );
}

export function PadroesRotacao({ difficulty, onComplete }: PadroesRotacaoProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = LEVELS[startLevel];
  const N = spec.grid;

  const [phase, setPhase] = useState<Phase>("tutorial");
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [deg, setDeg] = useState<number>(90);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const expectedRef = useRef<Set<string>>(new Set());
  const kRef = useRef(spec.kMin);
  const correctRef = useRef(0);
  const hitRef = useRef(0);
  const wrongRef = useRef(0);
  const omRef = useRef(0);
  const expTotalRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);

  // Apresentação: pisca UMA célula por vez (com bipe), igual à Matriz Espacial.
  const present = useCallback(async (origArr: string[], rotDeg: number, myRun: number) => {
    setPhase("show"); setLit(new Set());
    const onMs = startLevel <= 5 ? 600 : startLevel <= 8 ? 480 : 380;
    await sleep(450); if (runRef.current !== myRun) return;
    for (const cell of origArr) {
      if (runRef.current !== myRun) return;
      setLit(new Set([cell])); soundLight();
      await sleep(onMs); if (runRef.current !== myRun) return;
      setLit(new Set());
      await sleep(170); if (runRef.current !== myRun) return;
    }
    setPhase("rotating");                            // o tabuleiro inteiro gira
    await sleep(1500); if (runRef.current !== myRun) return;
    if (spec.delayMs > 0) { setPhase("delay"); await sleep(spec.delayMs); if (runRef.current !== myRun) return; }
    setPicked(new Set()); inputAt.current = Date.now(); setPhase("input");
  }, [spec, startLevel]);

  const startRound = useCallback(() => {
    const k = spec.kMin + Math.floor(Math.random() * (spec.kMax - spec.kMin + 1));
    kRef.current = k;
    const all: string[] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) all.push(cellKey(r, c));
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    const origArr = all.slice(0, k);
    const orig = new Set(origArr);
    const rotDeg = spec.rots[Math.floor(Math.random() * spec.rots.length)];
    const expected = new Set<string>();
    orig.forEach((key) => { const [r, c] = key.split(",").map(Number); const [nr, nc] = rotatePos(r, c, N, rotDeg); expected.add(cellKey(nr, nc)); });
    expectedRef.current = expected;
    runRef.current++;
    setDeg(rotDeg); setFeedback(null);
    present(origArr, rotDeg, runRef.current);
  }, [N, spec, present]);

  const finish = useCallback(() => {
    const accTotal = expTotalRef.current ? hitRef.current / expTotalRef.current : 0;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "padroes-rotacao",
      domain: "memory",
      score: calculateExerciseScore("matriz-espacial", accTotal, meanRT ?? undefined, difficulty),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: startLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        impulsive: wrongRef.current > TRIALS,
        level: startLevel,
        startedLevel: startLevel,
        gridSize: N,
        positions: spec.kMax,
        rotation: spec.rots.length > 1 ? "variavel" : `${spec.rots[0]}`,
        direction: "horario",
        exposureMs: spec.showMs,
        positionsCorrect: hitRef.current,
        positionsWrong: wrongRef.current,
        omissions: omRef.current,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec, N]);

  const submit = useCallback((picks: Set<string>) => {
    const expected = expectedRef.current;
    let hits = 0; expected.forEach((k) => { if (picks.has(k)) hits++; });
    const wrong = picks.size - hits;
    const om = expected.size - hits;
    const exact = hits === expected.size && picks.size === expected.size;
    if (exact) correctRef.current++;
    hitRef.current += hits; wrongRef.current += wrong; omRef.current += om; expTotalRef.current += expected.size;
    rtsRef.current.push(Date.now() - inputAt.current);
    if (exact) soundCorrect(); else soundWrong();
    setFeedback(exact ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, exact ? 1300 : 2300);
  }, [trial, reportProgress, startRound, finish]);

  function toggle(r: number, c: number) {
    if (phase !== "input") return;
    const key = cellKey(r, c);
    const next = new Set(picked);
    if (next.has(key)) next.delete(key); else { next.add(key); soundTap(); }
    setPicked(next);
  }
  function confirmInput() { if (phase === "input" && picked.size > 0) submit(picked); }

  useEffect(() => () => { runRef.current++; }, []);

  function begin() {
    correctRef.current = 0; hitRef.current = 0; wrongRef.current = 0; omRef.current = 0; expTotalRef.current = 0;
    rtsRef.current = []; startTime.current = Date.now(); setTrial(0); startRound();
  }

  if (phase === "tutorial") return <TutorialDemo onDone={begin} />;

  const cellPx = N <= 3 ? 72 : N === 4 ? 60 : N === 5 ? 50 : 42;
  const edge: "top" | "right" | "bottom" | "left" =
    phase === "show" ? "top" : markerEdge(deg);
  const instruction =
    phase === "show" ? "Memorize as posições"
    : phase === "rotating" ? "Observe a rotação"
    : phase === "delay" ? "Prepare-se…"
    : phase === "input" ? `Marque as posições corretas (${picked.size}/${kRef.current})`
    : feedback === "correct" ? "Correto!" : "Quase lá";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={CARD}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white leading-tight">Matriz com Rotações</p>
            <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
              Nível {startLevel} · {N}×{N} · {kRef.current} posições · {spec.rots.length > 1 ? "rotação variável" : `${spec.rots[0]}°`}
            </p>
          </div>
          {(phase === "rotating" || phase === "delay" || phase === "input") && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(34,211,197,0.14)", border: "1px solid rgba(34,211,197,0.4)", color: TEAL }}>
              <RotateCw size={13} /> {rotLabel(deg)}
            </span>
          )}
        </div>

        <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg,#14b8a6,#22d3c5)" }}
            animate={{ width: `${(trial / TRIALS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        <p className="text-sm font-semibold text-center" style={{ color: TEAL, minHeight: 22 }}>
          {phase === "show" ? "👀 " : phase === "rotating" ? "🔄 " : ""}{instruction}
        </p>

        <div className="flex justify-center py-1">
          {phase === "rotating" ? (
            // tabuleiro INTEIRO girando (vazio) — o marcador torna a rotação visível
            <motion.div key="rot" initial={{ rotate: 0 }} animate={{ rotate: deg }} transition={{ duration: 1.4, ease: [0.45, 0, 0.2, 1] }}>
              <Matrix N={N} cellPx={cellPx} lit={new Set()} picked={new Set()} expected={new Set()}
                phase="rotating" edge="top" onTap={() => {}} />
            </motion.div>
          ) : (
            // tabuleiro estático (upright) — marcador já na nova borda após a rotação
            <Matrix N={N} cellPx={cellPx} lit={lit} picked={picked} expected={expectedRef.current}
              phase={phase} edge={edge} onTap={toggle} />
          )}
        </div>

        {phase === "input" && (
          <button onClick={confirmInput} disabled={picked.size === 0}
            className="w-full rounded-2xl font-bold text-white text-sm py-3 active:scale-95 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 4px 16px rgba(13,148,136,0.4)" }}>
            Confirmar
          </button>
        )}

        <div className="flex justify-between text-xs pt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
          <span>Tentativa {Math.min(trial + 1, TRIALS)}/{TRIALS}</span>
          <span>{correctRef.current} acertos</span>
        </div>
      </div>
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(10,16,34,0.9)",
  border: "1px solid rgba(148,163,184,0.12)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};
