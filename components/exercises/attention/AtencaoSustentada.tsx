"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoSustentadaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── CPT-AX Config ──────────────────────────────────────────────────────────

const TOTAL_STIMULI = 110;
const TARGET_PREV = "A";
const TARGET_CUR  = "X";
const ALL_LETTERS = "BCDEFGHIJLMNOPRSTUVZ".split("");

function isiMs(d: number): number {
  if (d <= 3) return 1800;
  if (d <= 6) return 1300;
  if (d <= 8) return 900;
  return 700;
}

type StimulusType = "AX" | "BX" | "AY" | "BY";

interface Stimulus {
  letter: string;
  prevLetter: string | null;
  type: StimulusType;
  isTarget: boolean; // only AX should be tapped
}

function buildSequence(d: number): Stimulus[] {
  const seq: Stimulus[] = [];
  const targetCount = Math.round(TOTAL_STIMULI * 0.2);
  let targetsLeft = targetCount;

  // Build raw letter stream
  const letters: string[] = [];
  for (let i = 0; i < TOTAL_STIMULI; i++) {
    const remaining = TOTAL_STIMULI - i;
    const forceTarget = targetsLeft >= remaining;
    // We need to produce A→X patterns for targets
    if (forceTarget || (targetsLeft > 0 && Math.random() < 0.22)) {
      // Will be an A→X pair — mark current as 'A' placeholder and next as 'X'
      if (i + 1 < TOTAL_STIMULI && letters[i - 1] !== TARGET_PREV) {
        letters.push(TARGET_PREV);
        i++;
        letters.push(TARGET_CUR);
        targetsLeft--;
        continue;
      }
    }
    // Distractor: could be B→X or A→Y or any other
    const rand = Math.random();
    if (rand < 0.15 && d >= 4) {
      letters.push(TARGET_PREV); // A not followed by X
    } else if (rand < 0.25 && d >= 6) {
      // B→X distractor (confusing X not after A)
      letters.push(ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]);
      i++;
      letters.push(TARGET_CUR);
    } else {
      letters.push(ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]);
    }
  }

  // Ensure exactly TOTAL_STIMULI
  while (letters.length < TOTAL_STIMULI) {
    letters.push(ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)]);
  }
  letters.length = TOTAL_STIMULI;

  // Build Stimulus objects
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const prev = i > 0 ? letters[i - 1] : null;
    const isAX = letter === TARGET_CUR && prev === TARGET_PREV;
    const isBX = letter === TARGET_CUR && prev !== null && prev !== TARGET_PREV;
    const isAY = prev === TARGET_PREV && letter !== TARGET_CUR;
    let type: StimulusType;
    if (isAX) type = "AX";
    else if (isBX) type = "BX";
    else if (isAY) type = "AY";
    else type = "BY";

    seq.push({ letter, prevLetter: prev, type, isTarget: isAX });
  }

  return seq;
}

// ── Tutorial sub-steps ────────────────────────────────────────────────────

function TutShowAxStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [step, setStep] = useState(0); // 0=show A, 1=show X
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(onDone, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const box = theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-gray-100 border-2 border-gray-300";
  const letterCls = theme === "GAMIFIED" ? "text-white" : "text-gray-900";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${box}`}>
          <span className={`text-7xl font-black ${step === 0 ? "text-blue-500" : letterCls}`}>A</span>
        </div>
        <span className="text-2xl">→</span>
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${box}`}>
          <AnimatePresence>
            {step === 1 && (
              <motion.span key="x" initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="text-7xl font-black text-green-500">X</motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className={`text-xs text-center font-semibold ${sub}`}>
        Apenas A → X = toque! Qualquer outra sequência = ignore.
      </p>
    </div>
  );
}

function TutPracticeStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  // 6 trial sequence: A,X(target), B,X(FA), C, A(no X = no tap)
  const practiceLetters = ["A", "X", "B", "X", "C", "A"];
  const [idx, setIdx] = useState(0);
  const [showing, setShowing] = useState(true);
  const [tapped, setTapped] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  useEffect(() => {
    if (idx >= practiceLetters.length) { onDone(); return; }
    setShowing(true);
    setTapped(false);
    setFeedbackText(null);
    const hide = setTimeout(() => {
      setShowing(false);
      const next = setTimeout(() => setIdx(i => i + 1), 200);
      return () => clearTimeout(next);
    }, 1400);
    return () => clearTimeout(hide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function handleTap() {
    if (!showing || tapped) return;
    setTapped(true);
    const letter = practiceLetters[idx];
    const prev = idx > 0 ? practiceLetters[idx - 1] : null;
    const isAX = letter === "X" && prev === "A";
    setFeedbackText(isAX ? "✓ Correto!" : "✗ Não era A→X");
  }

  const box = theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-gray-100 border-2 border-gray-300";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const letter = idx < practiceLetters.length ? practiceLetters[idx] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-32 h-32 rounded-2xl flex items-center justify-center cursor-pointer ${box}`}
        onClick={handleTap}>
        <AnimatePresence mode="wait">
          {showing && letter && (
            <motion.span key={`${idx}-${letter}`} initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              className={`text-7xl font-black ${
                letter === "X" ? "text-green-500" : letter === "A" ? "text-blue-500" : (theme === "GAMIFIED" ? "text-white" : "text-gray-900")
              }`}>
              {letter}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {feedbackText && (
        <p className={`text-xs font-bold ${feedbackText.startsWith("✓") ? "text-green-500" : "text-red-500"}`}>
          {feedbackText}
        </p>
      )}
      <p className={`text-xs text-center ${sub}`}>Toque apenas em A → X</p>
    </div>
  );
}

function AtencaoSustentadaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Toque APENAS quando aparecer X imediatamente após A. Sequência A → X = tocar.",
      content: (done: () => void) => <TutShowAxStep theme={theme} onDone={done} />,
    },
    {
      instruction: "Pratique! Se o X aparecer após outra letra (não A), ignore.",
      content: (done: () => void) => <TutPracticeStep theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Sustentada (CPT-AX)" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function AtencaoSustentada({ difficulty, theme, onComplete }: AtencaoSustentadaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const interval = isiMs(difficulty);

  const [sequence] = useState<Stimulus[]>(() => buildSequence(difficulty));
  const [idx, setIdx] = useState(-1);
  const [letter, setLetter] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [tapFeedback, setTapFeedback] = useState<"hit" | "fa" | null>(null);

  // Metrics
  const hits = useRef(0);
  const misses = useRef(0);
  const falsePositives = useRef(0);
  const startTime = useRef(Date.now());
  const stimStart = useRef(0);
  const rts = useRef<number[]>([]);
  const respondedRef = useRef(false);
  const doneRef = useRef(false);

  // Third-based for fatigue
  const firstThirdAcc = useRef<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const lastThirdAcc = useRef<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const finishSession = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const totalTargets = sequence.filter(s => s.isTarget).length;
    const totalFA = falsePositives.current;
    const totalHits = hits.current;
    const totalMiss = misses.current;
    const accuracy = totalTargets > 0 ? totalHits / totalTargets : 0;
    const avgRT = rts.current.length > 0
      ? rts.current.reduce((a, b) => a + b, 0) / rts.current.length : interval;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-sustentada", accuracy, undefined, difficulty);
    const fatigueDrop = firstThirdAcc.current.total > 0 && lastThirdAcc.current.total > 0
      ? Math.round((firstThirdAcc.current.correct / firstThirdAcc.current.total -
          lastThirdAcc.current.correct / lastThirdAcc.current.total) * 100)
      : 0;
    onComplete({
      exerciseId: "atencao-sustentada",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { hits: totalHits, misses: totalMiss, falsePositives: totalFA, totalTargets, total: TOTAL_STIMULI, fatigueDrop },
    });
  }, [difficulty, onComplete, sequence, interval]);

  useEffect(() => {
    if (showTutorial) return;
    startTime.current = Date.now();
    let i = 0;
    let running = true;

    function showNext() {
      if (!running) return;
      if (i >= sequence.length) {
        setDone(true);
        setLetter(null);
        return;
      }
      const stim = sequence[i];
      setIdx(i);
      reportProgress(Math.round(((i + 1) / TOTAL_STIMULI) * 100));
      respondedRef.current = false;
      stimStart.current = Date.now();
      setLetter(stim.letter);
      setTapFeedback(null);

      const third = Math.floor(TOTAL_STIMULI / 3);
      const hideTimer = setTimeout(() => {
        if (!running) return;
        // Miss check
        if (stim.isTarget && !respondedRef.current) {
          misses.current++;
          if (i < third) firstThirdAcc.current.total++;
          if (i >= TOTAL_STIMULI - third) { lastThirdAcc.current.total++; }
        } else if (stim.isTarget && respondedRef.current) {
          if (i < third) { firstThirdAcc.current.correct++; firstThirdAcc.current.total++; }
          if (i >= TOTAL_STIMULI - third) { lastThirdAcc.current.correct++; lastThirdAcc.current.total++; }
        }
        setLetter(null);
        i++;
        setTimeout(showNext, 100);
      }, interval);
      return () => clearTimeout(hideTimer);
    }

    const t = setTimeout(showNext, 500);
    return () => {
      running = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (done) finishSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleTap() {
    if (done || idx < 0) return;
    const stim = sequence[idx];
    if (stim.isTarget && !respondedRef.current) {
      respondedRef.current = true;
      const rt = Date.now() - stimStart.current;
      rts.current.push(rt);
      hits.current++;
      setTapFeedback("hit");
    } else if (!stim.isTarget) {
      falsePositives.current++;
      setTapFeedback("fa");
    }
  }

  if (showTutorial) {
    return <AtencaoSustentadaTutorial theme={theme}
      onDone={() => { startTime.current = Date.now(); setShowTutorial(false); }} />;
  }

  const progress = idx >= 0 ? ((idx + 1) / TOTAL_STIMULI) * 100 : 0;
  const prevLetter = idx > 0 ? sequence[idx - 1]?.letter : null;

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";
  const bgStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 60%, #f0e6ff 100%)" }
    : { background: "linear-gradient(160deg, #eef3f8 0%, #e6edf5 60%, #dde6f0 100%)" };
  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20 }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
  const titleColor = isGamified ? "#fff" : "#1a2744";
  const subColor = isGamified ? "rgba(255,255,255,0.6)" : "#64748b";
  const stimSurface: React.CSSProperties =
    tapFeedback === "hit"
      ? { background: "rgba(34,197,94,0.16)", border: "3px solid #22c55e" }
      : tapFeedback === "fa"
      ? { background: "rgba(239,68,68,0.16)", border: "3px solid #ef4444" }
      : isGamified
      ? { background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.14)" }
      : { background: "#ffffff", border: "2px solid rgba(26,39,68,0.10)", boxShadow: "0 6px 26px rgba(26,39,68,0.10)" };

  return (
    <div className="min-h-screen overflow-y-auto" style={bgStyle}>
      <div className="max-w-md mx-auto px-3 py-4 flex flex-col items-center gap-3">

        {/* Header */}
        <div className="w-full p-3.5" style={cardStyle}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-sm" style={{ color: titleColor }}>🔔 Atenção Sustentada</h2>
            <span className="text-xs tabular-nums" style={{ color: subColor }}>{Math.max(0, idx + 1)}/{TOTAL_STIMULI}</span>
          </div>
          <div className="h-1.5 rounded-full mb-3" style={{ background: isGamified ? "rgba(255,255,255,0.1)" : "rgba(26,45,80,0.1)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: isGamified ? "#06b6d4" : "#4f46e5" }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-lg font-black tabular-nums" style={{ color: "#22c55e" }}>{hits.current}</p>
              <p className="text-[10px]" style={{ color: subColor }}>Acertos</p>
            </div>
            <div>
              <p className="text-lg font-black tabular-nums" style={{ color: "#ef4444" }}>{falsePositives.current}</p>
              <p className="text-[10px]" style={{ color: subColor }}>Toques errados</p>
            </div>
          </div>
        </div>

        {/* Rule reminder */}
        <div className="w-full flex items-center gap-3 px-4 py-3"
          style={{ background: isGamified ? "rgba(99,102,241,0.15)" : "#eef2ff", border: `1.5px solid ${isGamified ? "rgba(129,140,248,0.4)" : "#c7d2fe"}`, borderRadius: 14 }}>
          <div className="flex items-center gap-1.5 text-2xl font-black shrink-0">
            <span style={{ color: "#3b82f6" }}>A</span>
            <span style={{ color: subColor }}>→</span>
            <span style={{ color: "#22c55e" }}>X</span>
          </div>
          <p className="text-xs" style={{ color: isGamified ? "#a5b4fc" : "#3730a3" }}>
            Toque <strong>só</strong> quando o <strong>X</strong> vier logo depois do <strong>A</strong>
          </p>
        </div>

        {/* Previous letter hint */}
        <div className="h-6 flex items-center">
          {prevLetter && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: prevLetter === "A" ? "rgba(59,130,246,0.14)" : "transparent" }}>
              <span className="text-[11px]" style={{ color: subColor }}>Anterior:</span>
              <span className="text-base font-black" style={{ color: prevLetter === "A" ? "#3b82f6" : subColor }}>{prevLetter}</span>
              {prevLetter === "A" && <span className="text-[11px] font-bold" style={{ color: "#3b82f6" }}>← atenção ao próximo!</span>}
            </div>
          )}
        </div>

        {/* Stimulus — quadro grande */}
        <div
          onClick={handleTap}
          className="rounded-3xl flex items-center justify-center cursor-pointer select-none relative"
          style={{ width: "min(76vw, 300px)", height: "min(76vw, 300px)", touchAction: "none", transition: "background 0.15s, border 0.15s", ...stimSurface }}>
          <AnimatePresence mode="wait">
            {letter && (
              <motion.span key={`${idx}-${letter}`}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }} transition={{ duration: 0.09 }}
                className="font-black leading-none"
                style={{ fontSize: "min(34vw, 150px)", color: titleColor }}>
                {letter}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <p className="text-xs text-center" style={{ color: subColor }}>
          Toque no quadro grande só quando vir <strong style={{ color: "#22c55e" }}>X</strong> logo após <strong style={{ color: "#3b82f6" }}>A</strong>
        </p>
      </div>
    </div>
  );
}
