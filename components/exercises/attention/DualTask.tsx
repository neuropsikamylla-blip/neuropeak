"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface DualTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Timing ────────────────────────────────────────────────────────────────

function shapeIntervalMs(d: number): number {
  return d <= 3 ? 1800 : d <= 6 ? 1400 : d <= 8 ? 1100 : 900;
}

function digitIntervalMs(d: number): number {
  return d <= 3 ? 2000 : d <= 6 ? 1700 : d <= 8 ? 1400 : 1200;
}

const TOTAL_SHAPES = 30;
const COLORS = ["green", "red", "blue", "yellow", "orange"] as const;
type ShapeColor = (typeof COLORS)[number];

const COLOR_HEX: Record<ShapeColor, string> = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  orange: "#f97316",
};

interface ShapeTrial {
  color: ShapeColor;
  isTarget: boolean; // green = target
}

interface ShapeResult {
  isTarget: boolean;
  tapped: boolean;
}

interface DigitResult {
  isMatch: boolean; // current === prev
  tapped: boolean;
}

function buildShapeSequence(): ShapeTrial[] {
  return Array.from({ length: TOTAL_SHAPES }, () => {
    const idx = Math.floor(Math.random() * COLORS.length);
    const color = COLORS[idx];
    return { color, isTarget: color === "green" };
  });
}

// ── Tutorial ──────────────────────────────────────────────────────────────

function TutStep1({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-green-500 border-2 border-white shadow" />
          <span className={`text-xs font-bold text-green-600`}>← TOQUE</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-red-500 border-2 border-white shadow" />
          <span className={`text-xs ${sub}`}>Ignore</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-blue-500 border-2 border-white shadow" />
          <span className={`text-xs ${sub}`}>Ignore</span>
        </div>
      </div>
      <p className={`text-xs text-center ${sub}`}>Tarefa superior: toque somente no verde!</p>
    </div>
  );
}

function TutStep2({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-2xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"}`}>
          <span className={theme === "GAMIFIED" ? "text-white" : "text-gray-900"}>4</span>
        </div>
        <span className={sub}>→</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-2xl border-2 border-blue-500 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-blue-50"}`}>
          <span className="text-blue-500">4</span>
        </div>
        <span className="text-xs font-bold text-blue-500">= IGUAL!</span>
      </div>
      <p className={`text-xs text-center ${sub}`}>Tarefa inferior: toque IGUAL se o número atual = anterior.</p>
    </div>
  );
}

function DualTaskTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "SUPERIOR: Toque quando aparecer uma forma VERDE. Ignore outras cores.",
      content: (done: () => void) => <TutStep1 theme={theme} onDone={done} />,
    },
    {
      instruction: "INFERIOR: Toque IGUAL quando o número for igual ao anterior.",
      content: (done: () => void) => <TutStep2 theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Dupla Tarefa" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [shapes] = useState<ShapeTrial[]>(() => buildShapeSequence());
  const [shapeIdx, setShapeIdx] = useState(-1);
  const [shapeFeedback, setShapeFeedback] = useState<"hit" | "fa" | "miss" | null>(null);
  const [shapePhase, setShapePhase] = useState<"isi" | "show">("isi");

  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [prevDigit, setPrevDigit] = useState<number | null>(null);
  const [digitFeedback, setDigitFeedback] = useState<"hit" | "fa" | null>(null);
  const [equalPressed, setEqualPressed] = useState(false);

  const shapeResults = useRef<ShapeResult[]>([]);
  const digitResults = useRef<DigitResult[]>([]);
  const shapeRespondedRef = useRef(false);
  const digitRespondedRef = useRef(false);
  const startTime = useRef(Date.now());
  const shapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const digitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allDoneRef = useRef(false);

  const shapeInterval = shapeIntervalMs(difficulty);
  const digitInterval = digitIntervalMs(difficulty);

  const finishSession = useCallback(() => {
    if (allDoneRef.current) return;
    allDoneRef.current = true;
    const sRes = shapeResults.current;
    const dRes = digitResults.current;

    const shapeTargets = sRes.filter(r => r.isTarget);
    const hitsA = shapeTargets.filter(r => r.tapped).length;
    const faA = sRes.filter(r => !r.isTarget && r.tapped).length;
    const accA = shapeTargets.length > 0 ? hitsA / shapeTargets.length : 0;

    const digitTargets = dRes.filter(r => r.isMatch);
    const hitsB = digitTargets.filter(r => r.tapped).length;
    const accB = digitTargets.length > 0 ? hitsB / digitTargets.length : 0;

    const combinedAcc = (accA + accB) / 2;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("dual-task", combinedAcc, undefined, difficulty);

    onComplete({
      exerciseId: "dual-task",
      domain: "attention",
      score,
      accuracy: combinedAcc,
      difficulty,
      duration,
      metadata: { hits_A: hitsA, fa_A: faA, acc_A: Math.round(accA * 100), hits_B: hitsB, acc_B: Math.round(accB * 100) },
    });
  }, [difficulty, onComplete]);

  // Shape task loop
  useEffect(() => {
    if (showTutorial) return;
    let idx = 0;

    function nextShape() {
      if (allDoneRef.current) return;
      if (idx >= TOTAL_SHAPES) { finishSession(); return; }
      setShapeIdx(idx);
      setShapePhase("show");
      shapeRespondedRef.current = false;
      setShapeFeedback(null);
      reportProgress(Math.round(((idx + 1) / TOTAL_SHAPES) * 100));

      shapeTimerRef.current = setTimeout(() => {
        const trial = shapes[idx];
        if (trial.isTarget && !shapeRespondedRef.current) {
          shapeResults.current.push({ isTarget: true, tapped: false });
          setShapeFeedback("miss");
        } else if (!shapeRespondedRef.current) {
          shapeResults.current.push({ isTarget: false, tapped: false });
        }
        setShapePhase("isi");
        idx++;
        shapeTimerRef.current = setTimeout(nextShape, 300);
      }, shapeInterval);
    }

    shapeTimerRef.current = setTimeout(nextShape, 500);
    return () => { if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  // Digit task loop
  useEffect(() => {
    if (showTutorial) return;
    let prev: number | null = null;

    function nextDigit() {
      if (allDoneRef.current) return;
      const d = Math.floor(Math.random() * 9) + 1;
      setPrevDigit(prev);
      setCurrentDigit(d);
      digitRespondedRef.current = false;
      setEqualPressed(false);
      setDigitFeedback(null);

      const isMatch = prev !== null && d === prev;
      digitTimerRef.current = setTimeout(() => {
        if (isMatch && !digitRespondedRef.current) {
          digitResults.current.push({ isMatch: true, tapped: false });
        } else if (!isMatch && !digitRespondedRef.current) {
          digitResults.current.push({ isMatch: false, tapped: false });
        }
        prev = d;
        digitTimerRef.current = setTimeout(nextDigit, 150);
      }, digitInterval);
    }

    const t = setTimeout(nextDigit, 700);
    return () => {
      clearTimeout(t);
      if (digitTimerRef.current) clearTimeout(digitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  function handleShapeTap() {
    if (shapePhase !== "show" || shapeRespondedRef.current || allDoneRef.current) return;
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    shapeRespondedRef.current = true;
    const trial = shapes[shapeIdx];
    const isHit = trial.isTarget;
    shapeResults.current.push({ isTarget: trial.isTarget, tapped: true });
    setShapeFeedback(isHit ? "hit" : "fa");
    if (!isHit) {
      // False alarm — continue after brief delay
      shapeTimerRef.current = setTimeout(() => {
        setShapePhase("isi");
        const nextIdx = shapeIdx + 1;
        reportProgress(Math.round(((nextIdx + 1) / TOTAL_SHAPES) * 100));
        if (nextIdx >= TOTAL_SHAPES) { finishSession(); return; }
        setShapeIdx(nextIdx);
        setShapePhase("show");
        shapeRespondedRef.current = false;
        setShapeFeedback(null);
      }, 400);
    }
  }

  function handleEqualTap() {
    if (equalPressed || allDoneRef.current) return;
    const isMatch = prevDigit !== null && currentDigit === prevDigit;
    setEqualPressed(true);
    digitRespondedRef.current = true;
    digitResults.current.push({ isMatch, tapped: true });
    setDigitFeedback(isMatch ? "hit" : "fa");
    setTimeout(() => setDigitFeedback(null), 400);
  }

  if (showTutorial) {
    return <DualTaskTutorial theme={theme}
      onDone={() => { startTime.current = Date.now(); setShowTutorial(false); }} />;
  }

  const currentShape = shapeIdx >= 0 && shapeIdx < TOTAL_SHAPES ? shapes[shapeIdx] : null;

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-fuchsia-50 to-pink-50" : "bg-slate-50",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-fuchsia-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    panelA: theme === "GAMIFIED" ? "bg-gray-800 border border-gray-700" : "bg-white border border-slate-200 shadow",
    panelB: theme === "GAMIFIED" ? "bg-gray-850 border border-gray-700" : "bg-slate-50 border border-slate-200 shadow",
    hit: theme === "GAMIFIED" ? "text-green-400" : "text-green-600",
    fa: theme === "GAMIFIED" ? "text-red-400" : "text-red-500",
    digitBox: theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-white border-2 border-gray-200",
    digitText: theme === "GAMIFIED" ? "text-white" : "text-gray-900",
    eqBtn: theme === "GAMIFIED" ? "bg-blue-700 text-white active:bg-blue-600" : "bg-blue-500 text-white active:bg-blue-600",
  };

  const shapeHits = shapeResults.current.filter(r => r.isTarget && r.tapped).length;
  const digitHits = digitResults.current.filter(r => r.isMatch && r.tapped).length;

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-sm mx-auto px-4 py-4 flex flex-col gap-3">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className={`font-bold text-sm ${pal.title}`}>🧠 Dupla Tarefa</h2>
          <div className={`text-xs ${pal.sub}`}>{shapeIdx + 1}/{TOTAL_SHAPES}</div>
        </div>

        {/* Panel A — Visual */}
        <div className={`rounded-2xl p-4 ${pal.panelA}`} style={{ minHeight: 200 }}>
          <div className="flex justify-between items-center mb-2">
            <p className={`text-xs font-bold ${pal.title}`}>SUPERIOR — Forme Verde</p>
            <div className="flex gap-3 text-xs">
              <span className={pal.hit}>✓ {shapeHits}</span>
              <span className={pal.fa}>✗ {shapeResults.current.filter(r => !r.isTarget && r.tapped).length}</span>
            </div>
          </div>

          <div
            className={`w-full flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-all ${
              shapeFeedback === "hit" ? "border-green-500 bg-green-500/10" :
              shapeFeedback === "fa" ? "border-red-500 bg-red-500/10" :
              shapeFeedback === "miss" ? "border-amber-500 bg-amber-500/10" :
              theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-slate-50"
            }`}
            style={{ height: 140 }}
            onPointerDown={handleShapeTap}>
            <AnimatePresence mode="wait">
              {shapePhase === "show" && currentShape && (
                <motion.div key={`shape-${shapeIdx}`}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}>
                  <svg width={90} height={90} viewBox="0 0 90 90">
                    <circle cx={45} cy={45} r={38}
                      fill={COLOR_HEX[currentShape.color]}
                      stroke="white" strokeWidth={3} />
                  </svg>
                </motion.div>
              )}
              {shapeFeedback && (
                <motion.span key={`fb-${shapeFeedback}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-5xl">
                  {shapeFeedback === "hit" ? "✅" : shapeFeedback === "fa" ? "❌" : "⏱️"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel B — Digit monitoring */}
        <div className={`rounded-2xl p-4 ${pal.panelB}`}>
          <div className="flex justify-between items-center mb-3">
            <p className={`text-xs font-bold ${pal.title}`}>INFERIOR — N-back 1 (Igual?)</p>
            <span className={`text-xs ${pal.hit}`}>✓ {digitHits}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Prev digit */}
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[10px] ${pal.sub}`}>Anterior</p>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl ${pal.digitBox}`}>
                <span className={pal.sub}>{prevDigit ?? "—"}</span>
              </div>
            </div>

            {/* Current digit */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className={`text-[10px] ${pal.sub}`}>Atual</p>
              <AnimatePresence mode="wait">
                <motion.div key={`dig-${currentDigit}`}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-3xl border-2 ${
                    digitFeedback === "hit" ? "border-green-500 bg-green-500/20" :
                    digitFeedback === "fa" ? "border-red-500 bg-red-500/20" :
                    `${pal.digitBox} border-transparent`
                  }`}>
                  <span className={pal.digitText}>{currentDigit ?? "—"}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Equal button */}
            <button
              onPointerDown={handleEqualTap}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${pal.eqBtn} ${
                equalPressed ? "opacity-50" : ""
              }`}
              style={{ touchAction: "none" }}>
              IGUAL
            </button>
          </div>
        </div>

        <p className={`text-xs text-center ${pal.sub}`}>
          Divida sua atenção entre as duas tarefas!
        </p>
      </div>
    </div>
  );
}
