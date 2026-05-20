"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
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

const PAIRS: Record<number, number> = { 1: 4, 2: 6, 3: 8, 4: 10, 5: 12 };

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
  const pairs = PAIRS[difficulty] ?? 4;
  const [cards, setCards] = useState<Card[]>(() => buildCards(pairs));
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const startTime = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    setCards(buildCards(pairs));
    setSelected([]);
    setAttempts(0);
    setMatchedCount(0);
    setLocked(false);
    doneRef.current = false;
    startTime.current = Date.now();
  }, [pairs]);

  const handleFlip = useCallback((id: number) => {
    if (locked || doneRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched || selected.includes(id)) return;

    const newSelected = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      setAttempts(a => a + 1);
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
          if (newMatch === pairs && !doneRef.current) {
            doneRef.current = true;
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            const efficiency = Math.min(1, pairs / (attempts + 1));
            const score = calculateExerciseScore("jogo-memoria", efficiency, undefined, difficulty);
            setTimeout(() => onComplete({
              exerciseId: "jogo-memoria",
              domain: "memory",
              score,
              accuracy: efficiency,
              difficulty,
              duration,
              metadata: { pairs, attempts: attempts + 1 },
            }), 800);
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
  }, [locked, cards, selected, matchedCount, pairs, attempts, difficulty, onComplete]);

  const cols = pairs <= 4 ? 4 : pairs <= 6 ? 4 : pairs <= 8 ? 4 : 5;

  const cardBg = {
    CLINICAL: { back: "bg-blue-100 border-blue-300", front: "bg-white border-blue-200", text: "text-gray-700", matched: "bg-green-50 border-green-300" },
    COLORFUL: { back: "bg-gradient-to-br from-purple-400 to-pink-400", front: "bg-white border-purple-200", text: "text-purple-700", matched: "bg-yellow-50 border-yellow-300" },
    GAMIFIED: { back: "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-500", front: "bg-gray-700 border-cyan-500/40", text: "text-cyan-400", matched: "bg-gray-600/50 border-cyan-500/20" },
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50"
    }`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold text-lg ${
            theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"
          }`}>🃏 Jogo da Memória</h2>
          <div className="text-right">
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-400"}`}>Pares encontrados</p>
            <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{matchedCount}/{pairs}</p>
          </div>
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
              animate={{ rotateY: card.flipped || card.matched ? 0 : 180 }}
              transition={{ duration: 0.25 }}
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

        <div className={`text-center text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
          {attempts} tentativas
        </div>
      </div>
    </div>
  );
}
