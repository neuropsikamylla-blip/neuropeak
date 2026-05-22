"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface IdentificacaoSimbolosProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const SYMBOLS = ["★", "●", "▲", "■", "♦", "⬟", "⬡", "⬢", "✦", "✿", "⊕", "⊗", "Ψ", "Ω", "Σ", "Δ", "Λ", "Π", "Φ", "Ξ"];

const MAX_TRIALS = 20;
const MIN_DISTRACTORS = 2;
const MAX_DISTRACTORS = 18;

function initialDistractors(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 1.5) + 1), 12);
}

function makeOptions(targetSymbol: string, dCount: number) {
  const distractors = shuffle(SYMBOLS.filter((s) => s !== targetSymbol)).slice(0, dCount);
  return shuffle([targetSymbol, ...distractors]);
}

export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: IdentificacaoSimbolosProps) {
  const reportProgress = useExerciseProgress();

  const [distractorCount, setDistractorCount] = useState(initialDistractors(difficulty));
  const [streak, setStreak] = useState(0);
  const [trial, setTrial] = useState(0);
  const [target, setTarget] = useState(() => SYMBOLS[Math.floor(Math.random() * 5)]);
  const [options, setOptions] = useState(() => {
    const t = SYMBOLS[Math.floor(Math.random() * 5)];
    return makeOptions(t, initialDistractors(difficulty));
  });
  const [results, setResults] = useState<{ correct: boolean; rt: number; distractors: number }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  function advanceTrial(newTarget: string, dCount: number) {
    setTarget(newTarget);
    setOptions(makeOptions(newTarget, dCount));
    setFeedback(null);
    trialStart.current = Date.now();
  }

  function handleSelect(symbol: string) {
    if (feedback) return;
    const rt = Date.now() - trialStart.current;
    const isCorrect = symbol === target;
    setFeedback(isCorrect ? "correct" : "incorrect");
    const newResults = [...results, { correct: isCorrect, rt, distractors: distractorCount }];
    setResults(newResults);

    // 2-up/2-down staircase on distractor count
    const newStreak = isCorrect
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextDistr = distractorCount;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextDistr = Math.min(distractorCount + 2, MAX_DISTRACTORS); nextStreak = 0; }
    if (newStreak <= -2) { nextDistr = Math.max(distractorCount - 2, MIN_DISTRACTORS); nextStreak = 0; }

    const nextTrialNum = trial + 1;
    reportProgress(Math.round((nextTrialNum / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrialNum >= MAX_TRIALS) {
        const accuracy = newResults.filter((r) => r.correct).length / MAX_TRIALS;
        const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / MAX_TRIALS;
        const maxDistr = Math.max(...newResults.map((r) => r.distractors));
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
          metadata: { trials: MAX_TRIALS, maxDistractors: maxDistr, correct: newResults.filter((r) => r.correct).length },
        });
      } else {
        setStreak(nextStreak);
        setDistractorCount(nextDistr);
        setTrial(nextTrialNum);
        const newTarget = SYMBOLS[Math.floor(Math.random() * 5)];
        advanceTrial(newTarget, nextDistr);
      }
    }, 600);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-indigo-50 to-violet-50" : "bg-gray-50";
  const cols = Math.min(Math.ceil(Math.sqrt(options.length + 1)), 6);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-lg rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
              Identificação de Símbolos
            </h2>
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              {distractorCount + 1} símbolos
            </p>
          </div>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {trial + 1}/{MAX_TRIALS}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
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

        {/* Target */}
        <div className={`text-center p-4 rounded-xl mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
          <p className={`text-xs mb-1 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>Encontre este símbolo:</p>
          <span className={`text-5xl font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{target}</span>
        </div>

        {/* Options grid */}
        <div
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {options.map((sym, i) => {
            const isTargetSym = sym === target;
            let cellStyle = "";
            if (feedback) {
              if (isTargetSym) cellStyle = "bg-green-100 border-green-500 text-green-700";
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

        {feedback && (
          <p className={`text-center text-sm font-medium ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}>
            {feedback === "correct" ? "Correto! ✅" : "Incorreto ❌"}
          </p>
        )}
      </div>
    </div>
  );
}
