"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface TrilhaVisualProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Cell {
  id: number;
  label: string;
  x: number;
  y: number;
}

const MAX_ROUNDS = 20;
const MIN_COUNT = 5;
const MAX_COUNT = 25;

function initialCount(difficulty: number) {
  return Math.min(Math.max(5, difficulty + 4), 14);
}

function generateCells(count: number): Cell[] {
  const positions = shuffle(
    Array.from({ length: count }, () => ({
      x: 6 + Math.random() * 82,
      y: 6 + Math.random() * 82,
    }))
  );
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: String(i + 1),
    x: positions[i].x,
    y: positions[i].y,
  }));
}

type RoundPhase = "playing" | "feedback";

export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProps) {
  const reportProgress = useExerciseProgress();

  const [count, setCount] = useState(initialCount(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; count: number }[]>([]);

  const [cells, setCells] = useState<Cell[]>(() => generateCells(initialCount(difficulty)));
  const [nextExpected, setNextExpected] = useState(1);
  const [errors, setErrors] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("playing");
  const [roundCorrect, setRoundCorrect] = useState(false);

  const startTime = useRef<number>(Date.now());
  const roundStart = useRef<number>(Date.now());
  const firstClick = useRef(false);

  const startNewRound = useCallback((nextCount: number) => {
    setCells(generateCells(nextCount));
    setNextExpected(1);
    setErrors(0);
    setRoundPhase("playing");
    firstClick.current = false;
    roundStart.current = Date.now();
  }, []);

  const handleCellClick = useCallback((cellId: number) => {
    if (roundPhase !== "playing") return;
    if (!firstClick.current) {
      firstClick.current = true;
      roundStart.current = Date.now();
    }

    if (cellId === nextExpected) {
      if (nextExpected === count) {
        const isCorrect = errors <= 1;
        const newRoundResults = [...roundResults, { correct: isCorrect, count }];
        setRoundResults(newRoundResults);
        setRoundCorrect(isCorrect);
        setRoundPhase("feedback");

        const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
        let nextCount = count;
        let nextStreak = newStreak;
        if (newStreak >= 2) { nextCount = Math.min(count + 2, MAX_COUNT); nextStreak = 0; }
        if (newStreak <= -2) { nextCount = Math.max(count - 2, MIN_COUNT); nextStreak = 0; }

        const nextRound = round + 1;
        reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

        setTimeout(() => {
          if (nextRound >= MAX_ROUNDS) {
            const accuracy = newRoundResults.filter((r) => r.correct).length / MAX_ROUNDS;
            const maxCount = Math.max(...newRoundResults.map((r) => r.count));
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            const score = calculateExerciseScore("trilha-visual", accuracy, undefined, difficulty);
            onComplete({
              exerciseId: "trilha-visual",
              domain: "attention",
              score,
              accuracy,
              difficulty,
              duration,
              metadata: { rounds: MAX_ROUNDS, maxCount, correct: newRoundResults.filter((r) => r.correct).length },
            });
          } else {
            setRound(nextRound);
            setStreak(nextStreak);
            setCount(nextCount);
            startNewRound(nextCount);
          }
        }, 1500);
      } else {
        setNextExpected((n) => n + 1);
      }
    } else {
      setErrors((e) => e + 1);
    }
  }, [roundPhase, nextExpected, count, errors, streak, round, roundResults, difficulty, onComplete, reportProgress, startNewRound]);

  const bgClass =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-yellow-50 to-green-50" :
    "bg-gray-50";

  const headerClass =
    theme === "GAMIFIED" ? "border-gray-700" : "border-gray-200";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-green-700" :
    "text-gray-900";

  const subClass =
    theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${headerClass}`}>
          <div>
            <span className={`font-bold ${titleClass}`}>Conecta Números</span>
            <span className={`ml-2 text-xs ${subClass}`}>{count} números</span>
          </div>
          <div className="flex gap-4 text-sm items-center">
            {roundPhase === "playing" && errors > 0 && (
              <span className="text-red-500 font-medium">
                {errors} {errors === 1 ? "erro" : "erros"}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-6 py-2">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < roundResults.length
                  ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === round ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className={`text-center text-sm py-2 px-6 ${subClass}`}>
          {roundPhase === "playing"
            ? "Toque os números do menor para o maior: 1, 2, 3..."
            : roundCorrect ? "Correto! ✅" : "Incorreto ❌"}
        </p>

        {/* Grid area */}
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          {cells.map((cell) => {
            const isCompleted = cell.id < nextExpected;

            return (
              <motion.button
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                disabled={roundPhase !== "playing" || isCompleted}
                className={`absolute w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all select-none ${
                  isCompleted
                    ? theme === "GAMIFIED"
                      ? "bg-cyan-800 border-cyan-700 text-cyan-300 opacity-50"
                      : "bg-green-400 border-green-500 text-white opacity-50"
                    : theme === "GAMIFIED"
                    ? "bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600 active:scale-90"
                    : theme === "COLORFUL"
                    ? "bg-white border-green-300 text-green-800 hover:bg-green-50 shadow-sm active:scale-90"
                    : "bg-white border-gray-400 text-gray-700 hover:bg-gray-100 shadow-sm active:scale-90"
                }`}
                style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
                whileTap={{ scale: 0.88 }}
              >
                {cell.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
