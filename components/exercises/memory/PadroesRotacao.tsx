"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, RotateCcw } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface PadroesRotacaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Progressão (10 níveis) ───────────────────────────────────────────────────
type Rot = 90 | -90 | 180 | "var";
interface PRLevel { grid: number; k: number; rot: Rot; showMs: number; }
const PR_LEVELS: Record<number, PRLevel> = {
  1:  { grid: 3, k: 2, rot: 90,    showMs: 2600 },
  2:  { grid: 3, k: 3, rot: 90,    showMs: 2600 },
  3:  { grid: 4, k: 3, rot: 90,    showMs: 2500 },
  4:  { grid: 4, k: 4, rot: 90,    showMs: 2500 },
  5:  { grid: 4, k: 4, rot: 180,   showMs: 2500 },
  6:  { grid: 5, k: 4, rot: "var", showMs: 2400 },
  7:  { grid: 5, k: 5, rot: "var", showMs: 2400 },
  8:  { grid: 5, k: 5, rot: "var", showMs: 2200 },
  9:  { grid: 6, k: 6, rot: "var", showMs: 1900 },
  10: { grid: 6, k: 7, rot: "var", showMs: 1500 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 6;

// Rotação de uma posição (r,c) numa grade N×N.
function rotatePos(r: number, c: number, N: number, deg: 90 | -90 | 180): [number, number] {
  if (deg === 90) return [c, N - 1 - r];        // 90° horário
  if (deg === -90) return [N - 1 - c, r];       // 90° anti-horário
  return [N - 1 - r, N - 1 - c];                // 180°
}
function rotLabel(deg: 90 | -90 | 180): string {
  return deg === 90 ? "90° para a DIREITA" : deg === -90 ? "90° para a ESQUERDA" : "180°";
}

type Phase = "ready" | "show" | "rotate" | "input" | "feedback";
const cellKey = (r: number, c: number) => `${r},${c}`;

export function PadroesRotacao({ difficulty, onComplete }: PadroesRotacaoProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = PR_LEVELS[startLevel];
  const N = spec.grid;

  const [phase, setPhase] = useState<Phase>("ready");
  const [lit, setLit] = useState<Set<string>>(new Set());       // posições originais (memorizar)
  const [picked, setPicked] = useState<Set<string>>(new Set()); // cliques do usuário
  const [deg, setDeg] = useState<90 | -90 | 180>(90);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const expectedRef = useRef<Set<string>>(new Set()); // posições corretas após rotação
  const correctRef = useRef(0);
  const cellHitRef = useRef(0);   // acertos de célula (para acurácia parcial)
  const cellTotalRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);

  const present = useCallback(async (orig: Set<string>, rotDeg: 90 | -90 | 180, myRun: number) => {
    setLit(orig);
    setPhase("show");
    await new Promise((r) => setTimeout(r, spec.showMs));
    if (runRef.current !== myRun) return;
    setLit(new Set());
    setPhase("rotate");
    await new Promise((r) => setTimeout(r, 1700)); // mostra a info da rotação
    if (runRef.current !== myRun) return;
    setPicked(new Set());
    inputAt.current = Date.now();
    setPhase("input");
  }, [spec]);

  const startRound = useCallback(() => {
    // sorteia K posições distintas
    const all: string[] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) all.push(cellKey(r, c));
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    const orig = new Set(all.slice(0, spec.k));
    const rotDeg: 90 | -90 | 180 = spec.rot === "var"
      ? ([90, -90, 180] as const)[Math.floor(Math.random() * 3)]
      : spec.rot;
    // calcula posições esperadas (após rotação)
    const expected = new Set<string>();
    orig.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const [nr, nc] = rotatePos(r, c, N, rotDeg);
      expected.add(cellKey(nr, nc));
    });
    expectedRef.current = expected;
    runRef.current++;
    setDeg(rotDeg);
    setFeedback(null);
    present(orig, rotDeg, runRef.current);
  }, [N, spec, present]);

  const finish = useCallback(() => {
    const accTotal = cellTotalRef.current ? cellHitRef.current / cellTotalRef.current : 0;
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
        level: startLevel,
        startedLevel: startLevel,
        gridSize: N,
        positions: spec.k,
        rotation: spec.rot === "var" ? "variavel" : `${spec.rot}`,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec, N]);

  const submit = useCallback((picks: Set<string>) => {
    const expected = expectedRef.current;
    let hits = 0;
    expected.forEach((k) => { if (picks.has(k)) hits++; });
    const exact = hits === expected.size && picks.size === expected.size;
    if (exact) correctRef.current++;
    cellHitRef.current += hits;
    cellTotalRef.current += expected.size;
    rtsRef.current.push(Date.now() - inputAt.current);
    setFeedback(exact ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => {
      if (nextTrial >= TRIALS) finish();
      else { setTrial(nextTrial); startRound(); }
    }, exact ? 1300 : 2200);
  }, [trial, reportProgress, startRound, finish]);

  function toggle(r: number, c: number) {
    if (phase !== "input") return;
    const key = cellKey(r, c);
    const next = new Set(picked);
    if (next.has(key)) next.delete(key); else next.add(key);
    setPicked(next);
    if (next.size === spec.k) setTimeout(() => submit(next), 250);
  }

  useEffect(() => () => { runRef.current++; }, []);

  function begin() {
    correctRef.current = 0; cellHitRef.current = 0; cellTotalRef.current = 0;
    rtsRef.current = []; startTime.current = Date.now();
    setTrial(0);
    startRound();
  }

  // ── Tela inicial ──────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
        <div className="w-full max-w-md rounded-3xl p-6 text-center" style={CARD}>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 38% 32%, rgba(34,211,197,0.4), rgba(15,40,60,0.9))", border: "1px solid rgba(34,211,197,0.5)" }}>
            <RotateCw size={40} color="#5eead4" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Padrões com Rotação</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.85)" }}>
            Memorize as posições. A grade gira — marque onde elas ficam depois da rotação.
          </p>
          <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.55)" }}>
            Você começa no nível {startLevel} (grade {N}×{N}, {spec.k} posições) — onde parou da última vez.
          </p>
          <button onClick={begin}
            className="w-full rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
            style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 4px 20px rgba(13,148,136,0.5)" }}>
            Começar →
          </button>
        </div>
      </div>
    );
  }

  const cellPx = N <= 3 ? 76 : N === 4 ? 62 : N === 5 ? 52 : 44;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={CARD}>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Padrões com Rotação</p>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
            Nível {startLevel} · grade {N}×{N} · {spec.k} posições · {spec.rot === "var" ? "rotação variável" : `${spec.rot}°`}
          </p>
        </div>

        <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg,#14b8a6,#22d3c5)" }}
            animate={{ width: `${(trial / TRIALS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        <p className="text-sm font-semibold text-center" style={{ color: "#5eead4", minHeight: 22 }}>
          {phase === "show" ? "👀 Memorize as posições"
            : phase === "rotate" ? "🔄 A grade girou…"
            : phase === "input" ? `Marque as ${spec.k} posições após a rotação`
            : phase === "feedback" ? (feedback === "correct" ? "Correto!" : "Quase lá") : ""}
        </p>

        {/* Aviso de rotação */}
        {phase === "rotate" && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-2">
            <motion.div animate={{ rotate: deg === -90 ? -360 : 360 }} transition={{ duration: 1.2 }}>
              {deg === -90 ? <RotateCcw size={56} color="#5eead4" /> : <RotateCw size={56} color="#5eead4" />}
            </motion.div>
            <p className="text-base font-bold text-white">A grade girou {rotLabel(deg)}</p>
          </motion.div>
        )}

        {/* Grade */}
        {phase !== "rotate" && (
          <div className="flex justify-center py-2">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${N}, ${cellPx}px)` }}>
              {Array.from({ length: N * N }).map((_, i) => {
                const r = Math.floor(i / N), c = i % N;
                const key = cellKey(r, c);
                const isLit = phase === "show" && lit.has(key);
                const isPicked = (phase === "input" || phase === "feedback") && picked.has(key);
                const isExpected = phase === "feedback" && expectedRef.current.has(key);
                let bg = "rgba(255,255,255,0.05)", border = "rgba(148,163,184,0.18)";
                if (isLit) { bg = "#22d3c5"; border = "#22d3c5"; }
                else if (phase === "feedback" && isExpected && isPicked) { bg = "rgba(74,222,128,0.5)"; border = "#4ade80"; }
                else if (phase === "feedback" && isExpected) { bg = "rgba(74,222,128,0.18)"; border = "#4ade80"; }
                else if (phase === "feedback" && isPicked) { bg = "rgba(248,113,113,0.4)"; border = "#f87171"; }
                else if (isPicked) { bg = "rgba(34,211,197,0.45)"; border = "#22d3c5"; }
                return (
                  <button key={key} onClick={() => toggle(r, c)} disabled={phase !== "input"}
                    style={{ width: cellPx, height: cellPx, background: bg, border: `1.5px solid ${border}`, borderRadius: 12 }}
                    className="transition-colors active:scale-95" />
                );
              })}
            </div>
          </div>
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
