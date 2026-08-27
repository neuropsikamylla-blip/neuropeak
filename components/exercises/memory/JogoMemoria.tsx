"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import type { ExerciseResult, Theme } from "@/types";
import { MEMORY_ITEMS, MemorySymbol } from "./MemorySymbol";

interface JogoMemoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

export interface MemoryCard {
  id: number;
  symbol: string;
  matched: boolean;
}
const MIN_PAIRS = 4;
const MAX_PAIRS = 9;
const MEMORIZE_SECS = 5;
export const JOGO_MEMORIA_PAIR_SIZE = 2;

function initialPairs(difficulty: number) {
  return Math.min(Math.max(4, difficulty + 3), 8);
}

function errorBudget(pairs: number) {
  return Math.max(1, Math.floor(pairs / 2) - 1);
}

function buildCards(pairs: number): MemoryCard[] {
  const symbols = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5).slice(0, pairs).map(m => m.id);
  const doubled = [...symbols, ...symbols];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((symbol, id) => ({ id, symbol, matched: false }));
}

type GamePhase = "memorize" | "playing" | "feedback";

export const JOGO_MEMORIA_TUTORIAL_CARDS: MemoryCard[] = [
  { id: 0, symbol: MEMORY_ITEMS[0].id, matched: false },
  { id: 1, symbol: MEMORY_ITEMS[0].id, matched: false },
  { id: 2, symbol: MEMORY_ITEMS[1].id, matched: false },
  { id: 3, symbol: MEMORY_ITEMS[1].id, matched: false },
];

export function JogoMemoriaBoard({
  cards,
  theme,
  visibleCards,
  matchedCards = [],
  interactive,
  locked = false,
  onChoice,
  pressedChoice,
}: {
  cards: MemoryCard[];
  theme: Theme;
  visibleCards: number[];
  matchedCards?: number[];
  interactive: boolean;
  locked?: boolean;
  onChoice: (id: number) => void;
  pressedChoice?: number;
}) {
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const cardBackStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(135deg, #1a2d50, #2a4a8a)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 14 }
    : isColorful
    ? { background: "linear-gradient(135deg, #7c3aed, #9333ea)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 14 }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", border: "2px solid rgba(255,255,255,0.1)", borderRadius: 14 };

  const cardFrontStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "2px solid rgba(26,39,68,0.08)",
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(26,39,68,0.1)",
  };

  const cardMatchedStyle: React.CSSProperties = {
    background: "rgba(22,163,74,0.12)",
    border: "2px solid rgba(22,163,74,0.4)",
    borderRadius: 14,
    opacity: 0.6,
  };

  const cols = cards.length <= 8 ? 4 : 5;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {cards.map((card) => {
        const matched = matchedCards.includes(card.id) || card.matched;
        const visible = visibleCards.includes(card.id) || matched;
        const visualStyle = matched ? cardMatchedStyle : visible ? cardFrontStyle : cardBackStyle;
        return (
          <motion.button
            key={card.id}
            data-choice={card.id}
            onClick={() => onChoice(card.id)}
            disabled={!interactive || locked || matched || visibleCards.includes(card.id)}
            animate={{ scale: pressedChoice === card.id ? 0.95 : 1 }}
            style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", ...visualStyle }}
            whileTap={interactive ? { scale: 0.92 } : {}}
          >
            <AnimatePresence mode="wait">
              {visible ? (
                <motion.div key="front" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <MemorySymbol id={card.symbol} size={48} />
                </motion.div>
              ) : (
                <motion.span key="back" style={{ fontSize: 18, fontWeight: 700, color: isGamified ? "#22d3ee" : isColorful ? "#ffffff" : "#60a5fa" }}>?</motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const [pairCount, setPairCount] = useState(initialPairs(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; pairs: number }[]>([]);

  const [cards, setCards] = useState<MemoryCard[]>(() => buildCards(initialPairs(difficulty)));
  const [gamePhase, setGamePhase] = useState<GamePhase>("memorize");
  const [countdown, setCountdown] = useState(MEMORIZE_SECS);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(false);

  const doneRef = useRef(false);

  useEffect(() => { begin(); }, [begin]);

  // Countdown during memorize phase
  useEffect(() => {
    if (gamePhase !== "memorize") return;
    setCountdown(MEMORIZE_SECS);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setGamePhase("playing");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gamePhase, round]);

  function finishRound(isCorrect: boolean, currentErrors: number, newMatchedCount: number, currentPairCount: number) {
    setRoundCorrect(isCorrect);
    setGamePhase("feedback");

    const newRoundResults = [...roundResults, { correct: isCorrect, pairs: currentPairCount }];
    setRoundResults(newRoundResults);

    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextPairs = currentPairCount;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextPairs = Math.min(currentPairCount + 2, MAX_PAIRS); nextStreak = 0; }
    if (newStreak <= -2) { nextPairs = Math.max(currentPairCount - 2, MIN_PAIRS); nextStreak = 0; }

    const nextRound = round + 1;
    const timeUp = isTimeUp();

    setTimeout(() => {
      if (timeUp) {
        doneRef.current = true;
        finish();
        const correctCount = newRoundResults.filter((r) => r.correct).length;
        const accuracy = correctCount / Math.max(1, newRoundResults.length);
        const maxPairs = Math.max(...newRoundResults.map((r) => r.pairs));
        const score = calculateExerciseScore("jogo-memoria", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "jogo-memoria",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration: elapsedSec(),
          metadata: { rounds: newRoundResults.length, maxPairs, correct: correctCount },
        });
      } else {
        setRound(nextRound);
        setStreak(nextStreak);
        setPairCount(nextPairs);
        setCards(buildCards(nextPairs));
        setFlipped([]);
        setErrors(0);
        setMatchedCount(0);
        setLocked(false);
        setGamePhase("memorize");
      }
    }, 1800);
  }

  const handleFlip = useCallback((id: number) => {
    if (gamePhase !== "playing" || locked || doneRef.current) return;
    const card = cards[id];
    if (card.matched || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      const cardA = cards[a];
      const cardB = cards[b];

      if (cardA.symbol === cardB.symbol) {
        setTimeout(() => {
          const newCards = cards.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          );
          setCards(newCards);
          setFlipped([]);
          setLocked(false);
          const newMatchedCount = matchedCount + 1;
          setMatchedCount(newMatchedCount);
          if (newMatchedCount === pairCount) {
            finishRound(true, errors, newMatchedCount, pairCount);
          }
        }, 500);
      } else {
        const newErrors = errors + 1;
        setErrors(newErrors);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          if (newErrors > errorBudget(pairCount)) {
            finishRound(false, newErrors, matchedCount, pairCount);
          }
        }, 900);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, locked, cards, flipped, matchedCount, errors, pairCount]);

  // ─── Design system styles ────────────────────────────────────────────
  // Fundo da tela por TEMA — três gradientes distintos, não um branco só. O Codex apagou
  // isto na migração ao palco (27/ago/2026) e o Jogo da Memória perdia o tema do paciente.
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

  const budget = errorBudget(pairCount);

  return (
    <ExerciseStage width="medio" background={rootBg.background as string}>
      <div className="w-full p-5" style={cardStyle}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: titleColor }}>🃏 Jogo da Memória</h2>
            <p style={{ fontSize: 12, color: labelColor }}>{pairCount} pares</p>
          </div>
          {gamePhase === "playing" && (
            <span style={{ fontSize: 16, letterSpacing: 2 }} aria-label="vidas">
              <span style={{ color: "#ef4444" }}>{"♥".repeat(Math.max(0, budget - errors))}</span>
              <span style={{ color: isGamified ? "rgba(255,255,255,0.25)" : "rgba(148,163,184,0.4)" }}>{"♡".repeat(Math.min(budget, errors))}</span>
            </span>
          )}
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* Instrução */}
        <p style={{ fontSize: 13, textAlign: "center", marginBottom: 12, color: labelColor }}>
          {gamePhase === "memorize" && `Memorize as posições! (${countdown}s)`}
          {gamePhase === "playing" && `Encontre os ${pairCount} pares`}
          {gamePhase === "feedback" && (roundCorrect ? "Correto! ✅" : "Incorreto ❌")}
        </p>

        {/* Grid */}
        <JogoMemoriaBoard
          cards={cards}
          theme={theme}
          visibleCards={gamePhase === "memorize" ? cards.map((card) => card.id) : flipped}
          matchedCards={cards.filter((card) => card.matched).map((card) => card.id)}
          interactive={gamePhase === "playing"}
          locked={locked}
          onChoice={handleFlip}
        />

        {gamePhase === "playing" && (
          <p style={{ textAlign: "center", fontSize: 12, marginTop: 12, color: labelColor }}>
            {matchedCount}/{pairCount} pares encontrados
          </p>
        )}
      </div>
    </ExerciseStage>
  );
}
