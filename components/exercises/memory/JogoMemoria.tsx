"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface JogoMemoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ["🐶","🐱","🐰","🦊","🐻","🐼","🐨","🦁","🐸","🦋","🦄","🐬","🦜","🐙","🦕","🐳","🦒","🐘"];

const MAX_ROUNDS = 10;
const MIN_PAIRS = 2;
const MAX_PAIRS = 9; // EMOJIS.length / 2

function initialPairs(difficulty: number) {
  return Math.min(Math.max(2, difficulty + 1), 6);
}

function buildCards(pairs: number): Card[] {
  const emojis = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const doubled = [...emojis, ...emojis];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [pairCount, setPairCount] = useState(initialPairs(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; pairs: number }[]>([]);

  // Game state
  const [cards, setCards] = useState<Card[]>(() => buildCards(initialPairs(difficulty)));
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [locked, setLocked] = useState(false);

  const startTime = useRef(Date.now());
  const roundStartTime = useRef(Date.now());
  const doneRef = useRef(false);

  function startNextRound(nextPairCount: number, nextRound: number) {
    setCards(buildCards(nextPairCount));
    setSelected([]);
    setAttempts(0);
    setMatchedCount(0);
    setLocked(false);
    roundStartTime.current = Date.now();
  }

  const handleFlip = useCallback((id: number) => {
    if (locked || doneRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched || selected.includes(id)) return;

    const newSelected = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const [a, b] = newSelected;
      const cardA = cards[a], cardB = cards[b];

      if (cardA.emoji === cardB.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          ));
          setSelected([]);
          setLocked(false);
          const newMatch = matchedCount + 1;
          setMatchedCount(newMatch);

          if (newMatch === pairCount && !doneRef.current) {
            // Round completed — evaluate efficiency
            const efficiency = pairCount / newAttempts; // 1.0 = perfect, lower = worse
            const isCorrect = efficiency >= 0.5; // completed with < 2× optimal attempts

            const newRoundResults = [...roundResults, { correct: isCorrect, pairs: pairCount }];
            setRoundResults(newRoundResults);

            const newStreak = isCorrect
              ? Math.max(streak, 0) + 1
              : Math.min(streak, 0) - 1;
            let nextPairs = pairCount;
            let nextStreak = newStreak;
            if (newStreak >= 2) { nextPairs = Math.min(pairCount + 1, MAX_PAIRS); nextStreak = 0; }
            if (newStreak <= -2) { nextPairs = Math.max(pairCount - 1, MIN_PAIRS); nextStreak = 0; }

            const nextRound = round + 1;
            reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

            setTimeout(() => {
              if (nextRound >= MAX_ROUNDS) {
                doneRef.current = true;
                const accuracy = newRoundResults.filter((r) => r.correct).length / MAX_ROUNDS;
                const maxPairs = Math.max(...newRoundResults.map((r) => r.pairs));
                const duration = Math.round((Date.now() - startTime.current) / 1000);
                const score = calculateExerciseScore("jogo-memoria", accuracy, undefined, difficulty);
                onComplete({
                  exerciseId: "jogo-memoria",
                  domain: "memory",
                  score,
                  accuracy,
                  difficulty,
                  duration,
                  metadata: { rounds: MAX_ROUNDS, maxPairs, correct: newRoundResults.filter((r) => r.correct).length },
                });
              } else {
                setRound(nextRound);
                setStreak(nextStreak);
                setPairCount(nextPairs);
                startNextRound(nextPairs, nextRound);
              }
            }, 1200);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLocked(false);
        }, 1000);
      }
    }
  }, [locked, cards, selected, matchedCount, pairCount, attempts, streak, round, roundResults, difficulty, onComplete, reportProgress]);

  const cols = pairCount <= 4 ? 4 : pairCount <= 6 ? 4 : 5;

  const cardBg = {
    CLINICAL: { back: "bg-blue-100 border-blue-300", front: "bg-white border-blue-200", matched: "bg-green-50 border-green-300" },
    COLORFUL: { back: "bg-gradient-to-br from-purple-400 to-pink-400", front: "bg-white border-purple-200", matched: "bg-yellow-50 border-yellow-300" },
    GAMIFIED: { back: "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-500", front: "bg-gray-700 border-cyan-500/40", matched: "bg-gray-600/50 border-cyan-500/20" },
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50"
    }`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold text-lg ${
              theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"
            }`}>🃏 Jogo da Memória</h2>
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              {pairCount} par{pairCount > 1 ? "es" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-400"}`}>Rodada</p>
            <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{round + 1}/{MAX_ROUNDS}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < roundResults.length
                  ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === round
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Pares encontrados nesta rodada */}
        <div className={`text-center text-xs mb-3 ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
          {matchedCount}/{pairCount} pares • {attempts} tentativas
        </div>

        <div
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              disabled={card.matched || card.flipped || locked}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all
                ${card.matched
                  ? cardBg.matched
                  : card.flipped
                  ? cardBg.front
                  : cardBg.back
                }`}
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait">
                {(card.flipped || card.matched) ? (
                  <motion.span
                    key="front"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <motion.span key="back" className={`text-lg font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : theme === "COLORFUL" ? "text-white" : "text-blue-400"}`}>
                    ?
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
