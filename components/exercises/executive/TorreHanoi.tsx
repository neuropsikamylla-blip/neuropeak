"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface TorreHanoiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MIN_DISCS = 2;
const MAX_DISCS = 6;
const MAX_PUZZLES = 10;

function initialDiscs(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.4) + 2), 4);
}

const DISC_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899",
];

type Peg = number[];
type State = [Peg, Peg, Peg];

function optimalMoves(n: number): number {
  return Math.pow(2, n) - 1;
}

function initialPegs(discCount: number): State {
  return [
    Array.from({ length: discCount }, (_, i) => discCount - i),
    [],
    [],
  ];
}

export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [discCount, setDiscCount] = useState(initialDiscs(difficulty));
  const [streak, setStreak] = useState(0);
  const [puzzle, setPuzzle] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<{ correct: boolean; discs: number }[]>([]);

  // Puzzle state
  const [pegs, setPegs] = useState<State>(() => initialPegs(initialDiscs(difficulty)));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const startTime = useRef<number>(Date.now());
  const puzzleStart = useRef<number>(Date.now());

  const optimal = optimalMoves(discCount);

  function startNewPuzzle(nextDiscs: number) {
    setPegs(initialPegs(nextDiscs));
    setSelected(null);
    setMoves(0);
    setWon(false);
    puzzleStart.current = Date.now();
  }

  function handlePegClick(pegIdx: number) {
    if (won) return;

    if (selected === null) {
      if (pegs[pegIdx].length === 0) return;
      setSelected(pegIdx);
    } else {
      if (selected === pegIdx) {
        setSelected(null);
        return;
      }

      const fromPeg = pegs[selected];
      const toPeg = pegs[pegIdx];
      const disc = fromPeg[fromPeg.length - 1];

      if (toPeg.length > 0 && toPeg[toPeg.length - 1] < disc) {
        setSelected(null);
        return;
      }

      const newPegs: State = pegs.map((p) => [...p]) as State;
      newPegs[selected].pop();
      newPegs[pegIdx].push(disc);
      setPegs(newPegs);
      const newMoves = moves + 1;
      setMoves(newMoves);
      setSelected(null);

      if (newPegs[2].length === discCount) {
        setWon(true);
        const isCorrect = newMoves <= 2 * optimal;

        const newPuzzleResults = [...puzzleResults, { correct: isCorrect, discs: discCount }];
        setPuzzleResults(newPuzzleResults);

        const newStreak = isCorrect
          ? Math.max(streak, 0) + 1
          : Math.min(streak, 0) - 1;
        let nextDiscs = discCount;
        let nextStreak = newStreak;
        if (newStreak >= 2) { nextDiscs = Math.min(discCount + 1, MAX_DISCS); nextStreak = 0; }
        if (newStreak <= -2) { nextDiscs = Math.max(discCount - 1, MIN_DISCS); nextStreak = 0; }

        const nextPuzzle = puzzle + 1;
        reportProgress(Math.round((nextPuzzle / MAX_PUZZLES) * 100));

        setTimeout(() => {
          if (nextPuzzle >= MAX_PUZZLES) {
            const accuracy = newPuzzleResults.filter((r) => r.correct).length / MAX_PUZZLES;
            const maxDiscs = Math.max(...newPuzzleResults.map((r) => r.discs));
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, difficulty);
            onComplete({
              exerciseId: "torre-hanoi",
              domain: "executive",
              score,
              accuracy,
              difficulty,
              duration,
              metadata: { puzzles: MAX_PUZZLES, maxDiscs, correct: newPuzzleResults.filter((r) => r.correct).length },
            });
          } else {
            setPuzzle(nextPuzzle);
            setStreak(nextStreak);
            setDiscCount(nextDiscs);
            startNewPuzzle(nextDiscs);
          }
        }, 2000);
      }
    }
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-gray-50";
  const maxDiscWidth = 160;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-xl rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
              Torre de Hanói ({discCount} discos)
            </h2>
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Movimentos: {moves} · Ótimo: {optimal}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: MAX_PUZZLES }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < puzzleResults.length
                  ? puzzleResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === puzzle
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Instructions */}
        <p className={`text-xs mb-4 text-center ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
          Mova todos os discos para o pino da direita. Clique para selecionar e mover.
          {selected !== null && <strong className="ml-1 text-blue-500"> Pino {selected + 1} selecionado</strong>}
        </p>

        {/* Pegs area */}
        <div className="flex justify-around items-end mb-4" style={{ height: "200px" }}>
          {pegs.map((peg, pegIdx) => (
            <div
              key={pegIdx}
              className="flex flex-col items-center cursor-pointer relative"
              style={{ width: `${maxDiscWidth + 20}px` }}
              onClick={() => handlePegClick(pegIdx)}
            >
              <div
                className={`absolute bottom-0 rounded-lg ${selected === pegIdx ? "bg-yellow-400" : theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-400"}`}
                style={{ width: `${maxDiscWidth + 20}px`, height: "8px" }}
              />
              <div
                className={`absolute rounded-full ${theme === "GAMIFIED" ? "bg-gray-500" : "bg-gray-400"}`}
                style={{ width: "8px", height: "180px", bottom: "8px" }}
              />
              <div className="absolute bottom-2 flex flex-col-reverse items-center gap-0.5">
                {peg.map((disc, discIdx) => {
                  const width = (disc / discCount) * maxDiscWidth + 20;
                  const isTop = discIdx === peg.length - 1;
                  return (
                    <motion.div
                      key={disc}
                      className="rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${width}px`,
                        height: "22px",
                        backgroundColor: DISC_COLORS[disc - 1] ?? "#666",
                        opacity: selected === pegIdx && isTop ? 0.6 : 1,
                        boxShadow: isTop && selected === pegIdx ? "0 0 12px rgba(250,204,21,0.8)" : undefined,
                      }}
                      layoutId={`disc-${disc}-${puzzle}`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {disc}
                    </motion.div>
                  );
                })}
              </div>
              <div className={`mt-2 text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"} absolute -bottom-6`}>
                {pegIdx === 0 ? "Origem" : pegIdx === 1 ? "Auxiliar" : "Destino"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8" />

        <AnimatePresence>
          {won && (
            <motion.div
              className={`text-center p-4 rounded-xl mt-4 ${
                puzzleResults[puzzle]?.correct
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-orange-50 border-2 border-orange-400"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-4xl mb-2">
                {puzzleResults[puzzle]?.correct ? "🏆" : "✅"}
              </div>
              <p className={`font-bold text-lg ${puzzleResults[puzzle]?.correct ? "text-green-700" : "text-orange-700"}`}>
                {puzzleResults[puzzle]?.correct ? "Excelente!" : "Resolvido!"}
              </p>
              <p className={`text-sm ${puzzleResults[puzzle]?.correct ? "text-green-600" : "text-orange-600"}`}>
                {moves} movimentos (ótimo: {optimal})
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
