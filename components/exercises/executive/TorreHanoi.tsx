"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";

interface TorreHanoiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const DISC_COUNTS: Record<number, number> = {
  1: 2, 2: 3, 3: 3, 4: 4, 5: 4,
  6: 5, 7: 5, 8: 6, 9: 6, 10: 7,
};

const DISC_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899",
];

type Peg = number[];
type State = [Peg, Peg, Peg];

function optimalMoves(n: number): number {
  return Math.pow(2, n) - 1;
}

export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
  const discCount = DISC_COUNTS[difficulty] ?? 3;
  const optimal = optimalMoves(discCount);

  const [pegs, setPegs] = useState<State>(() => {
    const initial: State = [
      Array.from({ length: discCount }, (_, i) => discCount - i),
      [],
      [],
    ];
    return initial;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (won || !startTime.current) return;
    const t = setInterval(() => {
      if (startTime.current) setElapsed(Math.round((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [won]);

  function handlePegClick(pegIdx: number) {
    if (won) return;
    if (!startTime.current) startTime.current = Date.now();

    if (selected === null) {
      // Select top disc from this peg
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

      // Validate move
      if (toPeg.length > 0 && toPeg[toPeg.length - 1] < disc) {
        setSelected(null);
        return;
      }

      // Make move
      const newPegs: State = pegs.map((p) => [...p]) as State;
      newPegs[selected].pop();
      newPegs[pegIdx].push(disc);
      setPegs(newPegs);
      setMoves((m) => m + 1);
      setSelected(null);

      // Check win
      if (newPegs[2].length === discCount) {
        setWon(true);
        const duration = Math.round((Date.now() - (startTime.current ?? Date.now())) / 1000);
        const moveRatio = optimal / Math.max(moves + 1, optimal);
        const accuracy = Math.min(1, moveRatio);
        const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, difficulty);
        setTimeout(() => {
          onComplete({
            exerciseId: "torre-hanoi",
            domain: "executive",
            score,
            accuracy,
            difficulty,
            duration,
            metadata: { discCount, moves: moves + 1, optimalMoves: optimal, moveRatio },
          });
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
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
            Torre de Hanói ({discCount} discos)
          </h2>
          <div className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            <span>Movimentos: <strong>{moves}</strong></span>
            <span className="ml-3">Ótimo: {optimal}</span>
          </div>
        </div>

        {/* Instructions */}
        <p className={`text-xs mb-6 text-center ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
          Mova todos os discos para o pino da direita. Clique em um pino para selecionar e clique em outro para mover.
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
              {/* Base */}
              <div
                className={`absolute bottom-0 rounded-lg ${selected === pegIdx ? "bg-yellow-400" : theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-400"}`}
                style={{ width: `${maxDiscWidth + 20}px`, height: "8px" }}
              />

              {/* Pole */}
              <div
                className={`absolute rounded-full ${theme === "GAMIFIED" ? "bg-gray-500" : "bg-gray-400"}`}
                style={{ width: "8px", height: "180px", bottom: "8px" }}
              />

              {/* Discs */}
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
                      layoutId={`disc-${disc}`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {disc}
                    </motion.div>
                  );
                })}
              </div>

              {/* Peg label */}
              <div className={`mt-2 text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"} absolute -bottom-6`}>
                {pegIdx === 0 ? "Origem" : pegIdx === 1 ? "Auxiliar" : "Destino"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8" />

        {won && (
          <motion.div
            className="text-center p-4 rounded-xl bg-green-50 border-2 border-green-500 mt-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-bold text-green-700 text-lg">Parabéns! Puzzle resolvido!</p>
            <p className="text-green-600 text-sm">{moves} movimentos (ótimo: {optimal})</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
