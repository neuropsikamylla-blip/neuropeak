"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";

interface AssociacaoPares {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const PAIRS_BY_DIFFICULTY: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 6, 5: 7,
  6: 8, 7: 9, 8: 10, 9: 12, 10: 12,
};

const WORD_PAIRS = [
  { word: "Sol", emoji: "☀️" }, { word: "Lua", emoji: "🌙" },
  { word: "Casa", emoji: "🏠" }, { word: "Árvore", emoji: "🌳" },
  { word: "Gato", emoji: "🐱" }, { word: "Cachorro", emoji: "🐶" },
  { word: "Carro", emoji: "🚗" }, { word: "Avião", emoji: "✈️" },
  { word: "Peixe", emoji: "🐟" }, { word: "Flor", emoji: "🌸" },
  { word: "Livro", emoji: "📚" }, { word: "Lápis", emoji: "✏️" },
  { word: "Coração", emoji: "❤️" }, { word: "Estrela", emoji: "⭐" },
  { word: "Barco", emoji: "⛵" },
];

type Phase = "study" | "recall" | "done";

export function AssociacaoPares({ difficulty, theme, onComplete }: AssociacaoPares) {
  const pairCount = PAIRS_BY_DIFFICULTY[difficulty] ?? 3;
  const maxTrials = 3;

  const [pairs] = useState(() => shuffle(WORD_PAIRS).slice(0, pairCount));
  const [phase, setPhase] = useState<Phase>("study");
  const [studyCountdown, setStudyCountdown] = useState(pairCount * 3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const startTime = useRef<number>(Date.now());

  // Study countdown
  useEffect(() => {
    if (phase !== "study") return;
    if (studyCountdown <= 0) {
      setPhase("recall");
      setCurrentQuestion(0);
      return;
    }
    const t = setTimeout(() => setStudyCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, studyCountdown]);

  // Prepare options for current question
  useEffect(() => {
    if (phase !== "recall") return;
    const correct = pairs[currentQuestion].emoji;
    const distractors = pairs
      .filter((_, i) => i !== currentQuestion)
      .map((p) => p.emoji);
    const options = shuffle([correct, ...distractors.slice(0, 3)]);
    setShuffledOptions(options);
    setSelected(null);
    setCorrect(null);
  }, [phase, currentQuestion, pairs]);

  function handleSelect(emoji: string) {
    if (selected) return;
    setSelected(emoji);
    const isCorrect = emoji === pairs[currentQuestion].emoji;
    setCorrect(isCorrect);
    const newResults = [...results, isCorrect];
    setResults(newResults);

    setTimeout(() => {
      if (currentQuestion + 1 >= pairCount) {
        const accuracy = newResults.filter(Boolean).length / pairCount;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("associacao-pares", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "associacao-pares",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { pairCount, correctCount: newResults.filter(Boolean).length },
        });
      } else {
        setCurrentQuestion((q) => q + 1);
      }
    }, 1000);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-pink-50 to-yellow-50" : "bg-gray-50";
  const cardClass = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30 rounded-2xl" : "bg-white shadow-lg rounded-2xl";
  const titleClass = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-pink-600" : "text-gray-900";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-lg p-6 ${cardClass}`}>
        {phase === "study" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-bold text-lg ${titleClass}`}>Estude os Pares</h2>
              <span className={`text-2xl font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
                {studyCountdown}s
              </span>
            </div>
            <p className={`text-sm mb-4 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Memorize as associações palavra-imagem
            </p>
            <div className="grid grid-cols-2 gap-3">
              {pairs.map((pair, i) => (
                <motion.div
                  key={i}
                  className={`p-4 rounded-xl flex items-center gap-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50 border border-gray-200"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-3xl">{pair.emoji}</span>
                  <span className={`font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
                    {pair.word}
                  </span>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {phase === "recall" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-bold text-lg ${titleClass}`}>Qual é a imagem?</h2>
              <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                {currentQuestion + 1}/{pairCount}
              </span>
            </div>

            <div className={`text-center p-6 rounded-2xl mb-6 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-3xl font-bold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                {pairs[currentQuestion].word}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shuffledOptions.map((emoji, i) => {
                const isSelected = selected === emoji;
                const isCorrectAnswer = emoji === pairs[currentQuestion].emoji;
                let cellStyle = "";

                if (selected) {
                  if (isCorrectAnswer) cellStyle = "bg-green-100 border-green-500 border-2";
                  else if (isSelected) cellStyle = "bg-red-100 border-red-500 border-2";
                  else cellStyle = theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200";
                } else {
                  cellStyle = theme === "GAMIFIED"
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(emoji)}
                    disabled={!!selected}
                    className={`p-6 rounded-xl border-2 text-4xl flex items-center justify-center transition-all ${cellStyle}`}
                    whileHover={!selected ? { scale: 1.03 } : {}}
                    whileTap={!selected ? { scale: 0.97 } : {}}
                  >
                    {emoji}
                  </motion.button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pairCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < results.length
                      ? results[i]
                        ? "bg-green-500"
                        : "bg-red-500"
                      : i === currentQuestion
                      ? "bg-blue-400"
                      : theme === "GAMIFIED"
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
