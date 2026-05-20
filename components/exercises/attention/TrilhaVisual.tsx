"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";

interface TrilhaVisualProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const COUNTS: Record<number, number> = {
  1: 10, 2: 15, 3: 20, 4: 25, 5: 25,
  6: 15, 7: 20, 8: 25, 9: 15, 10: 20,
};

interface Cell {
  id: number;
  label: string;
  x: number;
  y: number;
}

export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProps) {
  const count = COUNTS[difficulty] ?? 10;
  const [cells, setCells] = useState<Cell[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const positions = shuffle(
      Array.from({ length: count }, (_, i) => ({
        x: 5 + Math.random() * 85,
        y: 5 + Math.random() * 85,
      }))
    );
    const newCells: Cell[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      label: String(i + 1),
      x: positions[i].x,
      y: positions[i].y,
    }));
    setCells(newCells);
  }, [count]);

  useEffect(() => {
    if (completed || !startTime.current) return;
    const t = setInterval(() => {
      if (startTime.current) {
        setElapsed(Math.round((Date.now() - startTime.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [completed]);

  const handleCellClick = useCallback((cellId: number) => {
    if (!startTime.current) startTime.current = Date.now();

    if (cellId === nextExpected) {
      if (nextExpected === count) {
        setCompleted(true);
        const duration = Math.round((Date.now() - (startTime.current ?? Date.now())) / 1000);
        // Scoring: penalize errors and time
        const accuracy = Math.max(0, 1 - errors * 0.05);
        const score = calculateExerciseScore("trilha-visual", accuracy, duration * 100, difficulty);
        onComplete({
          exerciseId: "trilha-visual",
          domain: "attention",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { count, errors, timeSeconds: duration },
        });
      } else {
        setNextExpected((n) => n + 1);
      }
    } else {
      setErrors((e) => e + 1);
    }
  }, [nextExpected, count, errors, difficulty, onComplete]);

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-yellow-50 to-green-50" : "bg-gray-50";

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${theme === "GAMIFIED" ? "border-gray-700" : "border-gray-200"}`}>
          <div>
            <span className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
              Trilha Visual
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className={theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}>
              Próximo: <strong className={theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}>{nextExpected}</strong>
            </span>
            <span className={`${errors > 0 ? "text-red-500" : theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Erros: {errors}
            </span>
            <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>
              {elapsed}s
            </span>
          </div>
        </div>

        <p className={`text-center text-sm py-3 px-6 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-600"}`}>
          Toque nos números em ordem crescente: 1, 2, 3...
        </p>

        {/* Grid area */}
        <div className="relative w-full" style={{ paddingBottom: "80%" }}>
          {cells.map((cell) => {
            const isCompleted = cell.id < nextExpected;
            const isNext = cell.id === nextExpected;

            return (
              <motion.button
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-600 text-white opacity-40"
                    : isNext
                    ? theme === "GAMIFIED"
                      ? "bg-cyan-500 border-cyan-300 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      : "bg-blue-500 border-blue-600 text-white shadow-md ring-2 ring-blue-300"
                    : theme === "GAMIFIED"
                    ? "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600"
                    : "bg-white border-gray-400 text-gray-700 hover:bg-gray-100"
                }`}
                style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                animate={isNext ? { scale: [1, 1.1, 1] } : {}}
                transition={isNext ? { duration: 1.5, repeat: Infinity } : {}}
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
