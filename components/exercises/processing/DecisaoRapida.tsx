"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";

interface DecisaoRapidaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Item {
  label: string;
  category: string;
  emoji: string;
}

const ITEMS: Item[] = [
  { label: "Gato", category: "Animal", emoji: "🐱" },
  { label: "Cadeira", category: "Objeto", emoji: "🪑" },
  { label: "Cachorro", category: "Animal", emoji: "🐶" },
  { label: "Mesa", category: "Objeto", emoji: "🪑" },
  { label: "Peixe", category: "Animal", emoji: "🐟" },
  { label: "Livro", category: "Objeto", emoji: "📚" },
  { label: "Pássaro", category: "Animal", emoji: "🐦" },
  { label: "Caneta", category: "Objeto", emoji: "🖊️" },
  { label: "Coelho", category: "Animal", emoji: "🐰" },
  { label: "Óculos", category: "Objeto", emoji: "👓" },
  { label: "Leão", category: "Animal", emoji: "🦁" },
  { label: "Telefone", category: "Objeto", emoji: "📱" },
  { label: "Elefante", category: "Animal", emoji: "🐘" },
  { label: "Relógio", category: "Objeto", emoji: "⌚" },
  { label: "Borboleta", category: "Animal", emoji: "🦋" },
  { label: "Sapato", category: "Objeto", emoji: "👟" },
  { label: "Tartaruga", category: "Animal", emoji: "🐢" },
  { label: "Mochila", category: "Objeto", emoji: "🎒" },
  { label: "Girafa", category: "Animal", emoji: "🦒" },
  { label: "Guarda-chuva", category: "Objeto", emoji: "☂️" },
];

const COUNTS: Record<number, number> = {
  1: 10, 2: 15, 3: 20, 4: 15, 5: 20,
  6: 20, 7: 20, 8: 25, 9: 25, 10: 30,
};

export function DecisaoRapida({ difficulty, theme, onComplete }: DecisaoRapidaProps) {
  const count = COUNTS[difficulty] ?? 10;
  const [sequence] = useState(() => {
    const shuffled = shuffle(ITEMS);
    const seq: Item[] = [];
    for (let i = 0; i < count; i++) {
      seq.push(shuffled[i % shuffled.length]);
    }
    return seq;
  });

  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [done, setDone] = useState(false);
  const itemStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    itemStart.current = Date.now();
  }, [current]);

  const finishExercise = useCallback((finalResults: { correct: boolean; rt: number }[]) => {
    if (done) return;
    setDone(true);
    const accuracy = finalResults.filter((r) => r.correct).length / finalResults.length;
    const avgRT = finalResults.reduce((s, r) => s + r.rt, 0) / finalResults.length;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("decisao-rapida", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "decisao-rapida",
      domain: "processing",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { total: count, correct: finalResults.filter((r) => r.correct).length },
    });
  }, [done, count, difficulty, onComplete]);

  function handleAnswer(category: string) {
    if (done || feedback) return;
    const rt = Date.now() - itemStart.current;
    const isCorrect = category === sequence[current].category;
    setFeedback(isCorrect ? "correct" : "incorrect");
    const newResults = [...results, { correct: isCorrect, rt }];
    setResults(newResults);

    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= count) {
        finishExercise(newResults);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 500);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-cyan-50" : "bg-gray-50";
  const categories = ["Animal", "Objeto"];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>Decisão Rápida</h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>{current + 1}/{count}</span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-6 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${theme === "GAMIFIED" ? "bg-cyan-500" : "bg-blue-500"}`}
            animate={{ width: `${(current / count) * 100}%` }}
          />
        </div>

        <p className={`text-center text-sm mb-4 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-600"}`}>
          Classifique rapidamente:
        </p>

        {/* Stimulus */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className={`text-center py-10 rounded-2xl mb-8 border-4 ${
              feedback === "correct"
                ? "border-green-500 bg-green-50"
                : feedback === "incorrect"
                ? "border-red-500 bg-red-50"
                : theme === "GAMIFIED"
                ? "border-gray-600 bg-gray-700"
                : "border-gray-200 bg-gray-50"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-6xl mb-3">{sequence[current]?.emoji}</div>
            <p className={`text-2xl font-bold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
              {sequence[current]?.label}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Category buttons */}
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => handleAnswer(cat)}
              disabled={!!feedback}
              className={`py-5 rounded-xl font-bold text-lg border-2 ${
                theme === "GAMIFIED"
                  ? "bg-gray-700 border-cyan-500 text-cyan-400 hover:bg-gray-600"
                  : theme === "COLORFUL"
                  ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 text-purple-700 hover:from-purple-200"
                  : "bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Score tally */}
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <span className="text-green-500">✓ {results.filter((r) => r.correct).length}</span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-400"}>|</span>
          <span className="text-red-500">✗ {results.filter((r) => !r.correct).length}</span>
        </div>
      </div>
    </div>
  );
}
