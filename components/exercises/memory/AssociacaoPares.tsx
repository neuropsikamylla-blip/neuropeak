"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { ItemVisual } from "@/components/exercises/ItemVisual";
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

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

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

  // ─── Design system styles ────────────────────────────────────────────
  const rootBg: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const titleColor = isGamified ? "#ffffff" : "#1a2744";
  const labelColor = isGamified ? "rgba(255,255,255,0.7)" : "#5a4a3a";
  const countdownColor = isGamified ? "#22d3ee" : isColorful ? "#7c3aed" : "#2a4a8a";

  const studyItemStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12 }
    : { background: "rgba(26,39,68,0.04)", border: "1px solid rgba(26,39,68,0.1)", borderRadius: 12 };

  const studyItemTextColor = isGamified ? "rgba(255,255,255,0.9)" : "#1a2744";

  const wordBoxStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 16 }
    : { background: "rgba(26,39,68,0.04)", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 16 };

  const wordBoxColor = isGamified ? "#ffffff" : "#1a2744";

  function optionStyle(emoji: string): React.CSSProperties {
    const isSelected = selected === emoji;
    const isCorrectAnswer = emoji === pairs[currentQuestion]?.emoji;

    if (selected) {
      if (isCorrectAnswer) return { background: "rgba(22,163,74,0.15)", border: "2px solid #16a34a", borderRadius: 16, cursor: "default" };
      if (isSelected) return { background: "rgba(220,38,38,0.15)", border: "2px solid #dc2626", borderRadius: 16, cursor: "default" };
      return isGamified
        ? { background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)", borderRadius: 16, opacity: 0.5, cursor: "default" }
        : { background: "rgba(26,39,68,0.03)", border: "2px solid rgba(26,39,68,0.08)", borderRadius: 16, opacity: 0.5, cursor: "default" };
    }
    return isGamified
      ? { background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 16, cursor: "pointer" }
      : { background: "#ffffff", border: "2px solid rgba(26,39,68,0.12)", borderRadius: 16, boxShadow: "0 2px 8px rgba(26,39,68,0.06)", cursor: "pointer" };
  }

  const progressEmptyColor = isGamified ? "rgba(255,255,255,0.12)" : "rgba(26,39,68,0.12)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={rootBg}>
      <div className="w-full max-w-lg p-6" style={cardStyle}>

        {/* Barra de progresso global */}
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 12, color: labelColor }}>
            {phase === "study" ? `Estude ${pairCount} par${pairCount > 1 ? "es" : ""}` : "Qual é a imagem?"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: labelColor }}>{totalAnswered}/{MAX_QUESTIONS}</span>
        </div>
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 6,
                flex: 1,
                borderRadius: 9999,
                transition: "background 0.2s",
                background: i < sessionResults.length
                  ? sessionResults[i] ? "#16a34a" : "#ef4444"
                  : i === totalAnswered && phase === "recall"
                  ? "#60a5fa"
                  : progressEmptyColor,
              }}
            />
          ))}
        </div>

        {phase === "study" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontWeight: 700, fontSize: 18, color: titleColor }}>Estude os Pares</h2>
              <span style={{ fontSize: 24, fontWeight: 700, color: countdownColor }}>
                {studyCountdown}s
              </span>
            </div>
            <p style={{ fontSize: 13, marginBottom: 16, color: labelColor }}>
              Memorize as associações palavra-imagem
            </p>
            <div className="grid grid-cols-2 gap-3">
              {pairs.map((pair, i) => (
                <motion.div
                  key={i}
                  style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, ...studyItemStyle }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ItemVisual name={pair.word} emoji={pair.emoji} size={36} />
                  <span style={{ fontWeight: 600, color: studyItemTextColor }}>{pair.word}</span>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {phase === "recall" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontWeight: 700, fontSize: 18, color: titleColor }}>Qual é a imagem?</h2>
              <span style={{ fontSize: 13, color: labelColor }}>
                {currentQuestion + 1}/{pairCount}
              </span>
            </div>

            <div className="text-center p-6 mb-6" style={wordBoxStyle}>
              <p style={{ fontSize: 28, fontWeight: 700, color: wordBoxColor }}>
                {pairs[currentQuestion]?.word}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shuffledOptions.map((emoji, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(emoji)}
                  disabled={!!selected}
                  style={{ padding: "16px 0", fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", ...optionStyle(emoji) }}
                  whileHover={!selected ? { scale: 1.03 } : {}}
                  whileTap={!selected ? { scale: 0.97 } : {}}
                >
                  <ItemVisual name={pairs.find((p) => p.emoji === emoji)?.word ?? ""} emoji={emoji} size={48} />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
