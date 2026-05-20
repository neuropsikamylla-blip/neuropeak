"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";

interface MatrizEspacialProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const GRID_SIZES: Record<number, number> = {
  1: 4, 2: 4, 3: 4, 4: 4, 5: 4,
  6: 5, 7: 5, 8: 5, 9: 5, 10: 5,
};
const SEQ_LENGTHS: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 6, 5: 7,
  6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
};

type Phase = "showing" | "recall" | "feedback";

export function MatrizEspacial({ difficulty, theme, onComplete }: MatrizEspacialProps) {
  const gridSize = GRID_SIZES[difficulty] ?? 4;
  const seqLength = SEQ_LENGTHS[difficulty] ?? 3;
  const maxTrials = 4;

  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [trial, setTrial] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<number>>(new Set());
  const startTime = useRef<number>(Date.now());

  const generateSequence = useCallback(() => {
    const cells = new Set<number>();
    const total = gridSize * gridSize;
    while (cells.size < seqLength) {
      cells.add(Math.floor(Math.random() * total));
    }
    return Array.from(cells);
  }, [gridSize, seqLength]);

  const showSequence = useCallback(async (seq: number[]) => {
    setPhase("showing");
    setHighlightedCells(new Set());

    for (const cell of seq) {
      await new Promise<void>((res) => setTimeout(res, 300));
      setActiveCell(cell);
      await new Promise<void>((res) => setTimeout(res, 700));
      setActiveCell(null);
    }

    await new Promise<void>((res) => setTimeout(res, 400));
    setPhase("recall");
    setUserSequence([]);
    setHighlightedCells(new Set());
  }, []);

  useEffect(() => {
    const seq = generateSequence();
    setSequence(seq);
    if (trial === 0) startTime.current = Date.now();
    showSequence(seq);
  }, [trial, generateSequence, showSequence]);

  function handleCellClick(idx: number) {
    if (phase !== "recall") return;
    if (userSequence.includes(idx)) return;

    const newSeq = [...userSequence, idx];
    setUserSequence(newSeq);
    setHighlightedCells(new Set(newSeq));

    if (newSeq.length === seqLength) {
      // Check accuracy
      let correct = 0;
      for (let i = 0; i < seqLength; i++) {
        if (newSeq[i] === sequence[i]) correct++;
      }
      const trialAccuracy = correct / seqLength;
      const newScores = [...scores, trialAccuracy];
      setScores(newScores);
      setPhase("feedback");

      setTimeout(() => {
        if (trial + 1 >= maxTrials) {
          const accuracy = newScores.reduce((a, b) => a + b, 0) / maxTrials;
          const duration = Math.round((Date.now() - startTime.current) / 1000);
          const score = calculateExerciseScore("matriz-espacial", accuracy, undefined, difficulty);
          onComplete({
            exerciseId: "matriz-espacial",
            domain: "memory",
            score,
            accuracy,
            difficulty,
            duration,
            metadata: { gridSize, seqLength, trials: maxTrials },
          });
        } else {
          setTrial((t) => t + 1);
          setScores(newScores);
        }
      }, 1500);
    }
  }

  const cellCount = gridSize * gridSize;

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50";
  const cardClass = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30 rounded-2xl" : "bg-white shadow-lg rounded-2xl";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md p-6 ${cardClass}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"}`}>
            Matriz Espacial
          </h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {trial + 1}/{maxTrials}
          </span>
        </div>

        <p className={`text-sm mb-4 text-center ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
          {phase === "showing"
            ? "Observe as células iluminadas..."
            : phase === "recall"
            ? `Clique nas ${seqLength} células na ordem correta`
            : "Verificando..."}
        </p>

        {/* Grid */}
        <div
          className="grid gap-2 mx-auto mb-6"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: gridSize === 4 ? "280px" : "320px",
          }}
        >
          {Array.from({ length: cellCount }).map((_, idx) => {
            const isActive = activeCell === idx;
            const isHighlighted = highlightedCells.has(idx);
            const isInSequence = sequence.includes(idx);
            const isCorrect = phase === "feedback" && isInSequence;

            return (
              <motion.button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={phase !== "recall" || userSequence.includes(idx)}
                className={`aspect-square rounded-lg border-2 cursor-pointer transition-all ${
                  isActive
                    ? theme === "GAMIFIED"
                      ? "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      : theme === "COLORFUL"
                      ? "bg-purple-500 border-purple-300"
                      : "bg-blue-500 border-blue-300"
                    : isHighlighted && phase === "recall"
                    ? theme === "GAMIFIED"
                      ? "bg-cyan-700 border-cyan-500"
                      : "bg-blue-300 border-blue-500"
                    : isCorrect
                    ? "bg-green-400 border-green-600"
                    : theme === "GAMIFIED"
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
                whileHover={phase === "recall" ? { scale: 1.05 } : {}}
                whileTap={phase === "recall" ? { scale: 0.95 } : {}}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              />
            );
          })}
        </div>

        {/* User progress */}
        {phase === "recall" && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: seqLength }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < userSequence.length
                    ? theme === "GAMIFIED"
                      ? "bg-cyan-500"
                      : "bg-blue-500"
                    : theme === "GAMIFIED"
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
