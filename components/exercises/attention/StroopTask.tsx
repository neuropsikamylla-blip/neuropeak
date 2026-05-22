"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface StroopTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const COLORS = [
  { name: "VERMELHO", hex: "#EF4444" },
  { name: "AZUL", hex: "#3B82F6" },
  { name: "VERDE", hex: "#22C55E" },
  { name: "AMARELO", hex: "#EAB308" },
];

const MAX_TRIALS = 20;
const MIN_TIME_MS = 800;
const MAX_TIME_MS = 6000;

// Initial time limit based on difficulty
function initialTimeMs(difficulty: number) {
  return Math.max(800, Math.round(6000 - (difficulty - 1) * 580));
}

function generateItem(difficulty: number) {
  const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const congruent = difficulty <= 2 && Math.random() < 0.35;
  const inkColor = congruent
    ? wordColor
    : COLORS.filter((c) => c.name !== wordColor.name)[Math.floor(Math.random() * 3)];
  return { word: wordColor.name, inkColor };
}

export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [timeMs, setTimeMs] = useState(initialTimeMs(difficulty));
  const [streak, setStreak] = useState(0);

  const [trial, setTrial] = useState(0);
  const [item, setItem] = useState(() => generateItem(difficulty));
  const [results, setResults] = useState<{ correct: boolean; rt: number; timeMs: number }[]>([]);
  const [itemProgress, setItemProgress] = useState(100);
  const [done, setDone] = useState(false);

  const doneRef = useRef(false);
  const trialRef = useRef(0);
  const answeredRef = useRef(false);
  const itemStartRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  trialRef.current = trial;

  function advanceTrial(correct: boolean, rt: number, currentTimeMs: number) {
    if (doneRef.current || answeredRef.current) return;
    answeredRef.current = true;

    const newResults = [...results, { correct, rt, timeMs: currentTimeMs }];
    setResults(newResults);

    // 2-up/2-down staircase on timeMs (lower = harder)
    const newStreak = correct
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextTime = currentTimeMs;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextTime = Math.max(currentTimeMs - 400, MIN_TIME_MS); nextStreak = 0; }
    if (newStreak <= -2) { nextTime = Math.min(currentTimeMs + 600, MAX_TIME_MS); nextStreak = 0; }

    const nextTrial = trialRef.current + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    if (nextTrial >= MAX_TRIALS) {
      doneRef.current = true;
      setDone(true);
      const accuracy = newResults.filter((r) => r.correct).length / MAX_TRIALS;
      const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / MAX_TRIALS;
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const score = calculateExerciseScore("stroop-task", accuracy, avgRT, difficulty);
      onComplete({
        exerciseId: "stroop-task",
        domain: "attention",
        score,
        accuracy,
        reactionTime: avgRT,
        difficulty,
        duration,
        metadata: { total: MAX_TRIALS, correct: newResults.filter((r) => r.correct).length, minTimeMs: Math.min(...newResults.map((r) => r.timeMs)) },
      });
    } else {
      setStreak(nextStreak);
      setTimeMs(nextTime);
      setTrial(nextTrial);
      setItem(generateItem(difficulty));
    }
  }

  // Timer per item
  useEffect(() => {
    if (doneRef.current) return;
    const myTrial = trial;
    const myTimeMs = timeMs;
    itemStartRef.current = Date.now();
    answeredRef.current = false;
    setItemProgress(100);

    const interval = setInterval(() => {
      if (doneRef.current || trialRef.current !== myTrial) {
        clearInterval(interval);
        return;
      }
      const elapsed = Date.now() - itemStartRef.current;
      const pct = Math.max(0, (1 - elapsed / myTimeMs) * 100);
      setItemProgress(pct);

      if (elapsed >= myTimeMs) {
        clearInterval(interval);
        if (trialRef.current === myTrial) {
          advanceTrial(false, myTimeMs, myTimeMs);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, done]);

  function handleAnswer(colorName: string) {
    if (doneRef.current || answeredRef.current) return;
    const rt = Date.now() - itemStartRef.current;
    advanceTrial(colorName === item.inkColor.name, rt, timeMs);
  }

  const bgClass =
    theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-blue-50 to-purple-50"
      : "bg-gray-50";

  const timerColor =
    itemProgress < 25
      ? "#EF4444"
      : theme === "GAMIFIED"
      ? "#06b6d4"
      : theme === "COLORFUL"
      ? "#a855f7"
      : "#3B82F6";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div
        className={`w-full max-w-md rounded-2xl p-8 ${
          theme === "GAMIFIED"
            ? "bg-gray-800 border border-cyan-500/30"
            : "bg-white shadow-lg"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
              Stroop
            </span>
            <span className={`ml-2 text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
              {Math.round(timeMs / 1000 * 10) / 10}s/item
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>
              ✓ {results.filter((r) => r.correct).length}
            </span>
            <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              {trial + 1}/{MAX_TRIALS}
            </span>
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
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

        {/* Barra de tempo por item */}
        <div className={`h-1.5 rounded-full mb-6 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"}`}>
          <motion.div
            className="h-full rounded-full transition-colors duration-300"
            style={{ width: `${itemProgress}%`, backgroundColor: timerColor }}
          />
        </div>

        {/* Instrução */}
        <p className={`text-center text-sm mb-6 font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
          Selecione a COR DA TINTA (não leia a palavra!)
        </p>

        {/* Palavra Stroop */}
        <div className="text-center mb-10">
          <motion.span
            key={trial}
            className="text-5xl font-black tracking-wide"
            style={{ color: item.inkColor.hex }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {item.word}
          </motion.span>
        </div>

        {/* Botões de cor */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color) => (
            <motion.button
              key={color.name}
              onClick={() => handleAnswer(color.name)}
              className="py-4 px-6 rounded-xl font-bold text-white text-sm shadow-md"
              style={{ backgroundColor: color.hex }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {color.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
