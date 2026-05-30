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

const TOTAL_STIMULI = 55;
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

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-amber-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    stimBox: theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : theme === "COLORFUL" ? "bg-white border-2 border-orange-200" : "bg-gray-100 border-2 border-gray-300",
    letterCls: theme === "GAMIFIED" ? "text-white" : "text-gray-900",
    hit: theme === "GAMIFIED" ? "text-green-400" : "text-green-600",
    fa: theme === "GAMIFIED" ? "text-red-400" : "text-red-500",
    bar: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-amber-500" : "bg-blue-500",
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-sm mx-auto px-4 py-5 flex flex-col items-center gap-4">

        {/* Header */}
        <div className={`w-full rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-sm ${pal.title}`}>🔔 Atenção Sustentada</h2>
            <span className={`text-xs ${pal.sub}`}>{Math.max(0, idx + 1)}/{TOTAL_STIMULI}</span>
          </div>
          <div className={`h-1.5 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
            <motion.div className={`h-full rounded-full ${pal.bar}`}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <p className={`text-lg font-black ${pal.hit}`}>{hits.current}</p>
              <p className={`text-[10px] ${pal.sub}`}>Acertos</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-black ${pal.fa}`}>{falsePositives.current}</p>
              <p className={`text-[10px] ${pal.sub}`}>Falsos +</p>
            </div>
          </div>
        </div>

        {/* Rule reminder */}
        <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
          theme === "GAMIFIED" ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
        }`}>
          <div className="flex items-center gap-1 text-lg font-black">
            <span className="text-blue-500">A</span>
            <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-400"}>→</span>
            <span className="text-green-500">X</span>
          </div>
          <p className={`text-xs ${pal.sub}`}>Toque apenas quando X aparecer após A</p>
        </div>

        {/* Previous letter hint */}
        {prevLetter && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${pal.sub}`}>Anterior:</span>
            <span className={`text-xl font-black ${
              prevLetter === "A" ? "text-blue-500" : (theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400")
            }`}>{prevLetter}</span>
            {prevLetter === "A" && <span className="text-xs text-blue-500 font-bold animate-pulse">← preste atenção!</span>}
          </div>
        )}

        {/* Stimulus */}
        <div
          className={`w-44 h-44 rounded-3xl flex items-center justify-center cursor-pointer select-none relative ${pal.stimBox}`}
          onClick={handleTap}
          style={{ touchAction: "none" }}>
          <AnimatePresence mode="wait">
            {letter && (
              <motion.span key={`${idx}-${letter}`}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }} transition={{ duration: 0.09 }}
                className={`text-8xl font-black ${pal.letterCls}`}>
                {letter}
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {tapFeedback && (
              <motion.div
                className={`absolute inset-0 rounded-3xl ${tapFeedback === "hit" ? "bg-green-500/30" : "bg-red-500/30"}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }} />
            )}
          </AnimatePresence>
        </div>

        <p className={`text-xs text-center ${pal.sub}`}>
          Toque na área acima apenas quando vir <strong className="text-green-500">X</strong> após <strong className="text-blue-500">A</strong>
        </p>
      </div>
    </div>
  );
}
