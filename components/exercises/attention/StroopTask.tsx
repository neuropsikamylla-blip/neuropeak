"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
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

const COUNTS: Record<number, number> = {
  1: 10, 2: 10, 3: 10, 4: 15, 5: 20,
  6: 20, 7: 25, 8: 25, 9: 30, 10: 30,
};
const TIME_LIMITS: Record<number, number> = {
  1: 0, 2: 0, 3: 30, 4: 30, 5: 30,
  6: 25, 7: 25, 8: 20, 9: 20, 10: 15,
};

export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
  const count = COUNTS[difficulty] ?? 10;
  const timeLimit = TIME_LIMITS[difficulty] ?? 0;

  const [items] = useState(() => {
    return Array.from({ length: count }, () => {
      const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      let inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (difficulty >= 2) {
        // Force incongruent
        while (inkColor.name === wordColor.name) {
          inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
      }
      return { word: wordColor.name, inkColor: inkColor };
    });
  });

  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 999);
  const [done, setDone] = useState(false);
  const itemStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    itemStart.current = Date.now();
  }, [current]);

  useEffect(() => {
    if (timeLimit === 0 || done) return;
    if (timeLeft <= 0) {
      finishExercise([...results]);
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, timeLimit, done]);

  const finishExercise = useCallback((finalResults: { correct: boolean; rt: number }[]) => {
    if (done) return;
    setDone(true);
    const accuracy = finalResults.length > 0
      ? finalResults.filter((r) => r.correct).length / finalResults.length
      : 0;
    const avgRT = finalResults.length > 0
      ? finalResults.reduce((sum, r) => sum + r.rt, 0) / finalResults.length
      : 1000;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("stroop-task", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "stroop-task",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { total: finalResults.length, correct: finalResults.filter((r) => r.correct).length },
    });
  }, [done, difficulty, onComplete]);

  function handleAnswer(colorName: string) {
    if (done) return;
    const rt = Date.now() - itemStart.current;
    const isCorrect = colorName === items[current].inkColor.name;
    const newResults = [...results, { correct: isCorrect, rt }];
    setResults(newResults);

    if (current + 1 >= count) {
      finishExercise(newResults);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-blue-50 to-purple-50" : "bg-gray-50";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              {current + 1}/{count}
            </span>
          </div>
          {timeLimit > 0 && (
            <div className={`font-bold text-xl ${timeLeft <= 5 ? "text-red-500" : theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
              {timeLeft}s
            </div>
          )}
          <div className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            ✓ {results.filter((r) => r.correct).length}
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-8 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${theme === "GAMIFIED" ? "bg-cyan-500" : "bg-blue-500"}`}
            animate={{ width: `${(current / count) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Instruction */}
        <p className={`text-center text-sm mb-6 font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
          Selecione a COR DA TINTA (não leia a palavra!)
        </p>

        {/* Stroop word */}
        {current < items.length && (
          <div className="text-center mb-10">
            <motion.span
              key={current}
              className="text-5xl font-black tracking-wide"
              style={{ color: items[current].inkColor.hex }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {items[current].word}
            </motion.span>
          </div>
        )}

        {/* Color buttons */}
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
