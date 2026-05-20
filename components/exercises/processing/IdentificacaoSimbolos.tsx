"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";

interface IdentificacaoSimbolosProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const SYMBOLS = ["★", "●", "▲", "■", "♦", "⬟", "⬡", "⬢", "✦", "✿", "⊕", "⊗", "Ψ", "Ω", "Σ", "Δ", "Λ", "Π", "Φ", "Ξ"];

const DISTRACTOR_COUNTS: Record<number, number> = {
  1: 3, 2: 5, 3: 8, 4: 10, 5: 12,
  6: 15, 7: 15, 8: 20, 9: 20, 10: 25,
};

const TRIALS = 6;

export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: IdentificacaoSimbolosProps) {
  const distractorCount = DISTRACTOR_COUNTS[difficulty] ?? 5;

  const [trial, setTrial] = useState(0);
  const [target, setTarget] = useState(() => SYMBOLS[Math.floor(Math.random() * 5)]);
  const [options, setOptions] = useState(() => {
    const t = SYMBOLS[Math.floor(Math.random() * 5)];
    const distractors = shuffle(SYMBOLS.filter((s) => s !== t)).slice(0, distractorCount);
    return shuffle([t, ...distractors]);
  });
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  function nextTrial() {
    const newTarget = SYMBOLS[Math.floor(Math.random() * 5)];
    const distractors = shuffle(SYMBOLS.filter((s) => s !== newTarget)).slice(0, distractorCount);
    setTarget(newTarget);
    setOptions(shuffle([newTarget, ...distractors]));
    setFeedback(null);
    trialStart.current = Date.now();
  }

  function handleSelect(symbol: string) {
    if (feedback) return;
    const rt = Date.now() - trialStart.current;
    const isCorrect = symbol === target;
    setFeedback(isCorrect ? "correct" : "incorrect");
    const newResults = [...results, { correct: isCorrect, rt }];
    setResults(newResults);

    setTimeout(() => {
      if (trial + 1 >= TRIALS) {
        const accuracy = newResults.filter((r) => r.correct).length / TRIALS;
        const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / TRIALS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("identificacao-simbolos", accuracy, avgRT, difficulty);
        onComplete({
          exerciseId: "identificacao-simbolos",
          domain: "processing",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration,
          metadata: { trials: TRIALS, distractorCount },
        });
      } else {
        setTrial((t) => t + 1);
        nextTrial();
      }
    }, 600);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-indigo-50 to-violet-50" : "bg-gray-50";
  const cols = Math.ceil(Math.sqrt(options.length + 1));

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-lg rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
            Identificação de Símbolos
          </h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {trial + 1}/{TRIALS}
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {results.map((r, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${r.correct ? "bg-green-500" : "bg-red-500"}`} />
          ))}
          {Array.from({ length: TRIALS - results.length }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Target */}
        <div className={`text-center p-4 rounded-xl mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
          <p className={`text-xs mb-1 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>Encontre este símbolo:</p>
          <span className={`text-5xl font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{target}</span>
        </div>

        {/* Options grid */}
        <div
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)` }}
        >
          {options.map((sym, i) => {
            const isTarget = sym === target;
            let cellStyle = "";
            if (feedback) {
              if (isTarget) cellStyle = "bg-green-100 border-green-500 text-green-700";
              else cellStyle = theme === "GAMIFIED" ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500";
            } else {
              cellStyle = theme === "GAMIFIED"
                ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 cursor-pointer"
                : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
            }

            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(sym)}
                disabled={!!feedback}
                className={`aspect-square rounded-lg border-2 text-2xl flex items-center justify-center ${cellStyle}`}
                whileHover={!feedback ? { scale: 1.08 } : {}}
                whileTap={!feedback ? { scale: 0.92 } : {}}
              >
                {sym}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
