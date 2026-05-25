"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface AssociacaoPares {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MAX_QUESTIONS = 20;
const MIN_PAIRS = 2;
const MAX_PAIRS = 10;

function initialPairs(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.7) + 1), 6);
}

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

type Phase = "study" | "recall";

export function AssociacaoPares({ difficulty, theme, onComplete }: AssociacaoPares) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [pairCount, setPairCount] = useState(initialPairs(difficulty));
  const [streak, setStreak] = useState(0);

  // Session tracking
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);

  // Round state
  const [pairs, setPairs] = useState(() => shuffle(WORD_PAIRS).slice(0, initialPairs(difficulty)));
  const [phase, setPhase] = useState<Phase>("study");
  const [studyCountdown, setStudyCountdown] = useState(initialPairs(difficulty) * 3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

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
    const correctEmoji = pairs[currentQuestion]?.emoji;
    if (!correctEmoji) return;
    const distractors = pairs
      .filter((_, i) => i !== currentQuestion)
      .map((p) => p.emoji);
    const opts = shuffle([correctEmoji, ...distractors.slice(0, 3)]);
    setShuffledOptions(opts);
    setSelected(null);
  }, [phase, currentQuestion, pairs]);

  function startNewRound(nextPairCount: number) {
    const newPairs = shuffle(WORD_PAIRS).slice(0, nextPairCount);
    setPairs(newPairs);
    setPhase("study");
    setStudyCountdown(nextPairCount * 3);
    setCurrentQuestion(0);
    setSelected(null);
  }

  function handleSelect(emoji: string) {
    if (selected) return;
    setSelected(emoji);
    const isCorrect = emoji === pairs[currentQuestion].emoji;
    const newSessionResults = [...sessionResults, isCorrect];
    const newTotal = totalAnswered + 1;

    setSessionResults(newSessionResults);
    setTotalAnswered(newTotal);

    // 2-up/2-down staircase on pair count
    const newStreak = isCorrect
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextPairCount = pairCount;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextPairCount = Math.min(pairCount + 1, MAX_PAIRS); nextStreak = 0; }
    if (newStreak <= -2) { nextPairCount = Math.max(pairCount - 1, MIN_PAIRS); nextStreak = 0; }

    reportProgress(Math.round((newTotal / MAX_QUESTIONS) * 100));

    setTimeout(() => {
      if (newTotal >= MAX_QUESTIONS) {
        const accuracy = newSessionResults.filter(Boolean).length / MAX_QUESTIONS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("associacao-pares", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "associacao-pares",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: {
            questions: MAX_QUESTIONS,
            correctCount: newSessionResults.filter(Boolean).length,
            maxPairs: pairCount,
          },
        });
      } else if (currentQuestion + 1 >= pairCount) {
        // End of round → staircase → new study round
        setStreak(nextStreak);
        setPairCount(nextPairCount);
        startNewRound(nextPairCount);
      } else {
        setStreak(nextStreak);
        setPairCount(nextPairCount);
        setCurrentQuestion((q) => q + 1);
      }
    }, 1000);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-pink-50 to-yellow-50" : "bg-gray-50";
  const cardClass = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30 rounded-2xl" : "bg-white shadow-lg rounded-2xl";
  const titleClass = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-pink-600" : "text-gray-900";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-lg p-6 ${cardClass}`}>

        {/* Barra de progresso global */}
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs ${subClass}`}>
            {phase === "study" ? `Estude ${pairCount} par${pairCount > 1 ? "es" : ""}` : "Qual é a imagem?"}
          </span>
          <span className={`text-xs font-medium ${subClass}`}>{totalAnswered}/{MAX_QUESTIONS}</span>
        </div>
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < sessionResults.length
                  ? sessionResults[i] ? "bg-green-500" : "bg-red-400"
                  : i === totalAnswered && phase === "recall"
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {phase === "study" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-bold text-lg ${titleClass}`}>Estude os Pares</h2>
              <span className={`text-2xl font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
                {studyCountdown}s
              </span>
            </div>
            <p className={`text-sm mb-4 ${subClass}`}>
              Memorize as associações palavra-imagem
            </p>
            <div className="grid grid-cols-2 gap-3">
              {pairs.map((pair, i) => (
                <motion.div
                  key={i}
                  className={`p-4 rounded-xl flex items-center gap-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50 border border-gray-200"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
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
              <span className={`text-sm ${subClass}`}>
                {currentQuestion + 1}/{pairCount}
              </span>
            </div>

            <div className={`text-center p-6 rounded-2xl mb-6 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-3xl font-bold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                {pairs[currentQuestion]?.word}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shuffledOptions.map((emoji, i) => {
                const isSelected = selected === emoji;
                const isCorrectAnswer = emoji === pairs[currentQuestion]?.emoji;
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
          </>
        )}
      </div>
    </div>
  );
}
