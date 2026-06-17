"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface VigilanciaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const TARGETS = ["A", "X"];
const ALL_STIMULI = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "X", "P", "Q", "R", "S", "T", "1", "2", "3", "4", "5"];
const INTERVALS: Record<number, number> = {
  1: 1200, 2: 900, 3: 700, 4: 1200, 5: 900,
  6: 700, 7: 900, 8: 700, 9: 700, 10: 600,
};
const TOTAL_ITEMS = 60;

function VigilanciaTutorial({ theme, target, onDone }: { theme: Theme; target: string; onDone: () => void }) {
  const steps = [
    {
      instruction: "Um estímulo alvo vai aparecer. Quando aparecer, toque RÁPIDO!",
      content: (onStepDone: () => void) => <VigilanciaShowTarget theme={theme} target={target} onDone={onStepDone} />,
    },
    {
      instruction: "Tente agora! Toque quando aparecer o alvo.",
      content: (onStepDone: () => void) => <VigilanciaReactStep theme={theme} target={target} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Vigilância" steps={steps} onDone={onDone} />;
}

function VigilanciaShowTarget({ theme, target, onDone }: { theme: Theme; target: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>Este é o alvo:</p>
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100 border-2 border-gray-300"}`}>
        <span className={`text-6xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{target}</span>
      </div>
      <p className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>← Memorize!</p>
    </div>
  );
}

function VigilanciaReactStep({ theme, target, onDone }: { theme: Theme; target: string; onDone: () => void }) {
  const [tapped, setTapped] = useState(false);

  function handleTap() {
    if (tapped) return;
    setTapped(true);
    setTimeout(onDone, 400);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className={`text-xs font-bold animate-pulse ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>TOQUE!</p>
      <motion.button
        onClick={handleTap}
        className={`w-28 h-28 rounded-2xl flex items-center justify-center ${
          tapped
            ? "bg-green-500/30"
            : theme === "GAMIFIED" ? "bg-gray-700 border border-cyan-500/40" : "bg-gray-100 border-2 border-gray-300"
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <span className={`text-6xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{target}</span>
      </motion.button>
    </div>
  );
}

export function Vigilancia({ difficulty, theme, onComplete }: VigilanciaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const tutorialTarget = TARGETS[0]; // Always show "A" as tutorial target
  const reportProgress = useExerciseProgress();
  const interval = INTERVALS[difficulty] ?? 1000;
  const targetCount = difficulty >= 4 ? 2 : 1;
  const targets = TARGETS.slice(0, targetCount);

  const [sequence] = useState(() => {
    const seq: string[] = [];
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      if (Math.random() < 0.3) {
        seq.push(targets[Math.floor(Math.random() * targets.length)]);
      } else {
        const nonTargets = ALL_STIMULI.filter((s) => !targets.includes(s));
        seq.push(nonTargets[Math.floor(Math.random() * nonTargets.length)]);
      }
    }
    return seq;
  });

  const [current, setCurrent] = useState<number>(-1);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"hit" | "miss" | "false" | null>(null);
  const [displayedStimulus, setDisplayedStimulus] = useState<string | null>(null);
  const responded = useRef(false);
  const startTime = useRef<number>(Date.now());
  const reactionTimes = useRef<number[]>([]);
  const stimulusStart = useRef<number>(0);

  // Report progress as items advance
  useEffect(() => {
    if (current >= 0) {
      reportProgress(Math.round(((current + 1) / TOTAL_ITEMS) * 100));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (showTutorial) return;
    let idx = 0;
    startTime.current = Date.now();

    function showNext() {
      if (idx >= TOTAL_ITEMS) {
        setDone(true);
        setDisplayedStimulus(null);
        return;
      }

      setCurrent(idx);
      responded.current = false;
      stimulusStart.current = Date.now();
      setDisplayedStimulus(sequence[idx]);
      setFeedback(null);

      setTimeout(() => {
        if (!responded.current && targets.includes(sequence[idx])) {
          setMisses((m) => m + 1);
          setFeedback("miss");
        }
        setDisplayedStimulus(null);
        idx++;
        setTimeout(showNext, 200);
      }, interval);
    }

    const t = setTimeout(showNext, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (!done) return;
    const accuracy = hits > 0 ? hits / (hits + misses + falseAlarms) : 0;
    const avgRT = reactionTimes.current.length > 0
      ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
      : interval;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("vigilancia", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "vigilancia",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { hits, misses, falseAlarms, targets, total: TOTAL_ITEMS },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleTap() {
    if (done || current < 0) return;
    const rt = Date.now() - stimulusStart.current;
    const stimulus = sequence[current];
    const isTarget = targets.includes(stimulus);

    if (isTarget && !responded.current) {
      responded.current = true;
      reactionTimes.current.push(rt);
      setHits((h) => h + 1);
      setFeedback("hit");
    } else if (!isTarget) {
      setFalseAlarms((f) => f + 1);
      setFeedback("false");
    }
  }

  if (showTutorial) {
    return <VigilanciaTutorial theme={theme} target={tutorialTarget} onDone={() => setShowTutorial(false)} />;
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-green-50 to-blue-50" : "bg-gray-50";
  const progress = current >= 0 ? ((current + 1) / TOTAL_ITEMS) * 100 : 0;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-4">
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>✓ {hits}</span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>{Math.round(progress)}%</span>
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>✗ {misses + falseAlarms}</span>
        </div>

        {/* Progress */}
        <div className={`h-2 rounded-full mb-8 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${theme === "GAMIFIED" ? "bg-cyan-500" : "bg-blue-500"}`}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Target instruction */}
        <div className={`p-3 rounded-xl mb-6 text-center ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
          <p className={`text-xs mb-1 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            Toque quando ver:
          </p>
          <span className={`text-2xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
            {targets.join(" ou ")}
          </span>
        </div>

        {/* Stimulus display */}
        <div
          className={`relative w-40 h-40 mx-auto rounded-2xl flex items-center justify-center mb-8 cursor-pointer select-none ${
            theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100 border-2 border-gray-300"
          }`}
          onClick={handleTap}
        >
          <AnimatePresence mode="wait">
            {displayedStimulus && (
              <motion.span
                key={displayedStimulus + current}
                className={`text-7xl font-black ${
                  targets.includes(displayedStimulus)
                    ? theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"
                    : theme === "GAMIFIED" ? "text-gray-300" : "text-gray-800"
                }`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {displayedStimulus}
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`absolute inset-0 rounded-2xl ${
                  feedback === "hit" ? "bg-green-500/30" : "bg-red-500/30"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        <p className={`text-center text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
          Toque na área acima ao ver o alvo
        </p>
      </div>
    </div>
  );
}
