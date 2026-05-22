"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface NBackProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "P", "R"];
const SHOW_MS = 3500;
const BLANK_MS = 400;
const TARGET_RATIO = 0.32;

const MIN_N = 1;
const MAX_N = 4;
const TOTAL_TRIALS = 20;

function initialN(difficulty: number) {
  return Math.min(Math.max(1, Math.floor(difficulty * 0.35)), 3);
}

function nextLetter(history: string[], nLevel: number, makeTarget: boolean): string {
  if (makeTarget && history.length >= nLevel) {
    return history[history.length - nLevel];
  }
  let l: string;
  do {
    l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (history.length >= nLevel && l === history[history.length - nLevel]);
  return l;
}

type Phase = "priming" | "active" | "blank" | "result";

export function NBack({ difficulty, theme, onComplete }: NBackProps) {
  const reportProgress = useExerciseProgress();

  const [nLevel, setNLevel] = useState(initialN(difficulty));
  const [streak, setStreak] = useState(0);

  const [phase, setPhase] = useState<Phase>("priming");
  const [primingLeft, setPrimingLeft] = useState(initialN(difficulty));
  const [trial, setTrial] = useState(0);
  const [currentLetter, setCurrentLetter] = useState("");
  const [isTarget, setIsTarget] = useState(false);
  const isTargetRef = useRef(false);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ correct: boolean; nLevel: number }[]>([]);

  const historyRef = useRef<string[]>([]);
  const startTime = useRef(Date.now());
  const nLevelRef = useRef(nLevel);
  nLevelRef.current = nLevel;

  const phaseRef = useRef<Phase>("priming");
  phaseRef.current = phase;

  const answeredRef = useRef(false);
  answeredRef.current = answered;

  const trialRef = useRef(0);
  trialRef.current = trial;

  // Present one stimulus (priming or active)
  const presentStimulus = useCallback((isPriming: boolean, targetBool: boolean, letter: string) => {
    setCurrentLetter(letter);
    setIsTarget(targetBool);
    isTargetRef.current = targetBool;
    setAnswered(false);
    setLastCorrect(null);
    setPhase(isPriming ? "priming" : "active");
    historyRef.current = [...historyRef.current, letter].slice(-MAX_N);
  }, []);

  // Bootstrap first stimulus
  useEffect(() => {
    const n = initialN(difficulty);
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    historyRef.current = [letter];
    presentStimulus(true, false, letter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance after SHOW_MS
  useEffect(() => {
    if (phase !== "priming" && phase !== "active") return;

    const myTrial = trial;
    const myPhase = phase;
    const myPrimingLeft = primingLeft;

    const timer = setTimeout(() => {
      if (phaseRef.current !== myPhase || trialRef.current !== myTrial) return;

      if (myPhase === "active" && !answeredRef.current) {
        // Timeout → NÃO (missed target or correct non-target)
        const missed = isTargetRef.current; // use ref to avoid stale closure
        processAnswer(!missed, myTrial);
        return;
      }

      // Priming or answered active → go to blank
      setPhase("blank");
      setTimeout(() => {
        advanceStep(myPhase === "priming" ? myPrimingLeft - 1 : 0, myTrial);
      }, BLANK_MS);
    }, SHOW_MS);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial]);

  function processAnswer(correct: boolean, currentTrial: number) {
    setLastCorrect(correct);
    setAnswered(true);
    setPhase("result");

    const newResults = [...results, { correct, nLevel: nLevelRef.current }];
    setResults(newResults);

    const newStreak = correct
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextN = nLevelRef.current;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextN = Math.min(nLevelRef.current + 1, MAX_N); nextStreak = 0; }
    if (newStreak <= -2) { nextN = Math.max(nLevelRef.current - 1, MIN_N); nextStreak = 0; }

    const nextTrial = currentTrial + 1;
    reportProgress(Math.round((nextTrial / TOTAL_TRIALS) * 100));

    if (nextTrial >= TOTAL_TRIALS) {
      const accuracy = newResults.filter((r) => r.correct).length / TOTAL_TRIALS;
      const maxN = Math.max(...newResults.map((r) => r.nLevel));
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const score = calculateExerciseScore("nback", accuracy, undefined, difficulty);
      setTimeout(() => {
        onComplete({
          exerciseId: "nback",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { trials: TOTAL_TRIALS, maxN, correct: newResults.filter((r) => r.correct).length },
        });
      }, 1200);
      return;
    }

    setTimeout(() => {
      setStreak(nextStreak);
      setNLevel(nextN);
      nLevelRef.current = nextN;
      setTrial(nextTrial);
      trialRef.current = nextTrial;

      // Priming needed if nLevel changed and history too short
      const needsPriming = nextN > historyRef.current.length;
      if (needsPriming) {
        const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        historyRef.current = [...historyRef.current, letter].slice(-MAX_N);
        setPrimingLeft(nextN - historyRef.current.length + 1);
        presentStimulus(true, false, letter);
      } else {
        advanceStep(0, nextTrial);
      }
    }, 800);
  }

  function advanceStep(remainingPriming: number, currentTrial: number) {
    if (remainingPriming > 0) {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      historyRef.current = [...historyRef.current, letter].slice(-MAX_N);
      setPrimingLeft(remainingPriming - 1);
      presentStimulus(true, false, letter);
    } else {
      const makeTarget = Math.random() < TARGET_RATIO && historyRef.current.length >= nLevelRef.current;
      const letter = nextLetter(historyRef.current, nLevelRef.current, makeTarget);
      const actualTarget = historyRef.current.length >= nLevelRef.current &&
        letter === historyRef.current[historyRef.current.length - nLevelRef.current];
      historyRef.current = [...historyRef.current, letter].slice(-MAX_N);
      presentStimulus(false, actualTarget, letter);
    }
  }

  function handleAnswer(yes: boolean) {
    if (phase !== "active" || answered) return;
    const correct = yes === isTarget;
    processAnswer(correct, trial);
  }

  const bg = { CLINICAL: "bg-gray-50", COLORFUL: "bg-gradient-to-br from-violet-50 to-indigo-50", GAMIFIED: "bg-gray-950" }[theme];
  const card = { CLINICAL: "bg-white shadow-lg", COLORFUL: "bg-white shadow-lg", GAMIFIED: "bg-gray-800 border border-cyan-500/30" }[theme];
  const titleClass = { CLINICAL: "text-gray-900", COLORFUL: "text-violet-700", GAMIFIED: "text-cyan-400" }[theme];
  const subClass = { CLINICAL: "text-gray-500", COLORFUL: "text-violet-400", GAMIFIED: "text-gray-400" }[theme];
  const letterBox = {
    CLINICAL: "bg-blue-50 border-4 border-blue-400 text-blue-700",
    COLORFUL: "bg-violet-100 border-4 border-violet-400 text-violet-800",
    GAMIFIED: "bg-gray-700 border-4 border-cyan-500 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.3)]",
  }[theme];

  const btnYes = {
    CLINICAL: "bg-green-500 hover:bg-green-600 text-white",
    COLORFUL: "bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-md",
    GAMIFIED: "bg-green-600 border border-green-500 text-white",
  }[theme];
  const btnNo = {
    CLINICAL: "bg-red-400 hover:bg-red-500 text-white",
    COLORFUL: "bg-gradient-to-br from-red-400 to-rose-400 text-white shadow-md",
    GAMIFIED: "bg-red-700 border border-red-600 text-white",
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${card}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold text-base ${titleClass}`}>N-Back — {nLevel}-back</h2>
            <p className={`text-xs ${subClass}`}>A letra de agora é igual à de {nLevel} atrás?</p>
          </div>
          <span className={`text-sm font-medium ${subClass}`}>{nLevel}-back</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Priming indicator */}
        {phase === "priming" && (
          <p className={`text-xs text-center mb-3 ${subClass}`}>
            Memorize... ({nLevel}-back)
          </p>
        )}

        {/* Letter display */}
        <div className="flex justify-center mb-6">
          <AnimatePresence mode="wait">
            {currentLetter ? (
              <motion.div
                key={`${trial}-${currentLetter}-${phase}`}
                className={`w-36 h-36 rounded-3xl flex items-center justify-center text-7xl font-black ${letterBox}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {currentLetter}
              </motion.div>
            ) : (
              <div className={`w-36 h-36 rounded-3xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"}`} />
            )}
          </AnimatePresence>
        </div>

        {/* Buttons or result */}
        {phase === "active" && !answered && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onPointerDown={(e) => { e.preventDefault(); handleAnswer(false); }}
              className={`py-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform ${btnNo}`}
            >
              NÃO ✗
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleAnswer(true); }}
              className={`py-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform ${btnYes}`}
            >
              SIM ✓
            </button>
          </div>
        )}

        {(phase === "result" || (phase === "active" && answered)) && lastCorrect !== null && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className={`text-2xl font-bold ${lastCorrect ? "text-green-500" : "text-red-500"}`}>
              {lastCorrect ? "Correto! ✅" : "Incorreto ❌"}
            </p>
            {!lastCorrect && (
              <p className={`text-xs mt-1 ${subClass}`}>
                {isTarget ? "Era igual — deveria ter dito SIM" : "Era diferente — deveria ter dito NÃO"}
              </p>
            )}
          </motion.div>
        )}

        {phase === "priming" && (
          <div className={`text-center py-3 text-sm font-medium ${subClass}`}>
            Observe e memorize...
          </div>
        )}

        {phase === "blank" && (
          <div className="h-16" />
        )}

        {/* N-Level indicator */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: MAX_N }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < nLevel
                  ? theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-violet-500" : "bg-blue-500"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
