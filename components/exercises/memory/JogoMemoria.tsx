"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { MEMORY_ITEMS, MemorySymbol } from "./MemorySymbol";

interface JogoMemoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Card {
  id: number;
  symbol: string;
  matched: boolean;
}
const MAX_ROUNDS = 10;
const MIN_PAIRS = 4;
const MAX_PAIRS = 9;
const MEMORIZE_SECS = 5;

function initialPairs(difficulty: number) {
  return Math.min(Math.max(4, difficulty + 3), 8);
}

function errorBudget(pairs: number) {
  return Math.max(1, Math.floor(pairs / 2) - 1);
}

function buildCards(pairs: number): Card[] {
  const symbols = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5).slice(0, pairs).map(m => m.id);
  const doubled = [...symbols, ...symbols];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((symbol, id) => ({ id, symbol, matched: false }));
}

type GamePhase = "memorize" | "playing" | "feedback";

const TUTORIAL_CARDS = [
  { id: 0, symbol: MEMORY_ITEMS[0].id, matched: false },
  { id: 1, symbol: MEMORY_ITEMS[1].id, matched: false },
  { id: 2, symbol: MEMORY_ITEMS[0].id, matched: false },
  { id: 3, symbol: MEMORY_ITEMS[1].id, matched: false },
];

function JogoMemoriaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const cardBack = {
    CLINICAL: "bg-blue-100 border-blue-300",
    COLORFUL: "bg-gradient-to-br from-purple-400 to-pink-400",
    GAMIFIED: "bg-gradient-to-br from-cyan-700 to-blue-800 border-cyan-600",
  }[theme];

  const cardFront = {
    CLINICAL: "bg-white border-blue-200",
    COLORFUL: "bg-white border-purple-200",
    GAMIFIED: "bg-gray-700 border-cyan-500/40",
  }[theme];

  const steps = [
    {
      instruction: "Memorize onde estão os pares! Você tem 3 segundos.",
      content: (onStepDone: () => void) => (
        <JogoMemoriaShowStep theme={theme} cardFront={cardFront} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Agora encontre os pares! Toque duas cartas iguais.",
      content: (onStepDone: () => void) => (
        <JogoMemoriaPlayStep theme={theme} cardBack={cardBack} cardFront={cardFront} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Jogo da Memória" steps={steps} onDone={onDone} />;
}

function JogoMemoriaShowStep({ theme, cardFront, onDone }: { theme: Theme; cardFront: string; onDone: () => void }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); onDone(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center">
      <p className={`text-sm mb-3 font-medium ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
        Memorize ({countdown}s)
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-[180px] mx-auto">
        {TUTORIAL_CARDS.map((c) => (
          <div key={c.id} className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${cardFront}`}>
            <MemorySymbol id={c.symbol} size={36} />
          </div>
        ))}
      </div>
    </div>
  );
}

function JogoMemoriaPlayStep({ theme, cardBack, cardFront, onDone }: { theme: Theme; cardBack: string; cardFront: string; onDone: () => void }) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const done = useRef(false);

  function handleFlip(id: number) {
    if (locked || done.current || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      if (TUTORIAL_CARDS[a].symbol === TUTORIAL_CARDS[b].symbol) {
        setTimeout(() => {
          const newMatched = [...matched, a, b];
          setMatched(newMatched);
          setFlipped([]);
          setLocked(false);
          if (newMatched.length === 4) { done.current = true; onDone(); }
        }, 500);
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 800);
      }
    }
  }

  function cardClass(id: number) {
    if (matched.includes(id)) return `bg-green-100 border-green-300`;
    if (flipped.includes(id)) return cardFront;
    return cardBack;
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-w-[180px] mx-auto">
      {TUTORIAL_CARDS.map((c) => {
        const visible = flipped.includes(c.id) || matched.includes(c.id);
        return (
          <motion.button
            key={c.id}
            onClick={() => handleFlip(c.id)}
            disabled={locked || matched.includes(c.id)}
            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${cardClass(c.id)}`}
            whileTap={{ scale: 0.92 }}
          >
            {visible ? <MemorySymbol id={c.symbol} size={36} /> : (
              <span className={`text-lg font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : theme === "COLORFUL" ? "text-white" : "text-blue-400"}`}>?</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [pairCount, setPairCount] = useState(initialPairs(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; pairs: number }[]>([]);

  const [cards, setCards] = useState<Card[]>(() => buildCards(initialPairs(difficulty)));
  const [gamePhase, setGamePhase] = useState<GamePhase>("memorize");
  const [countdown, setCountdown] = useState(MEMORIZE_SECS);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(false);

  const startTime = useRef(Date.now());
  const doneRef = useRef(false);

  // Countdown during memorize phase
  useEffect(() => {
    if (showTutorial || gamePhase !== "memorize") return;
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
  }, [gamePhase, round, showTutorial]);

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

  if (showTutorial) {
    return <JogoMemoriaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const cols = pairCount * 2 <= 8 ? 4 : 5;

  const bg = { CLINICAL: "bg-gray-50", COLORFUL: "bg-gradient-to-br from-purple-50 to-pink-50", GAMIFIED: "bg-gray-950" }[theme];
  const card = { CLINICAL: "bg-white shadow-lg", COLORFUL: "bg-white shadow-lg", GAMIFIED: "bg-gray-800 border border-cyan-500/30" }[theme];
  const titleClass = { CLINICAL: "text-gray-900", COLORFUL: "text-purple-700", GAMIFIED: "text-cyan-400" }[theme];
  const subClass = { CLINICAL: "text-gray-500", COLORFUL: "text-purple-500", GAMIFIED: "text-gray-400" }[theme];
  const cardBack = {
    CLINICAL: "bg-blue-100 border-blue-300",
    COLORFUL: "bg-gradient-to-br from-purple-400 to-pink-400",
    GAMIFIED: "bg-gradient-to-br from-cyan-700 to-blue-800 border-cyan-600",
  }[theme];
  const cardFront = {
    CLINICAL: "bg-white border-blue-200",
    COLORFUL: "bg-white border-purple-200",
    GAMIFIED: "bg-gray-700 border-cyan-500/40",
  }[theme];
  const cardMatched = {
    CLINICAL: "bg-green-50 border-green-300 opacity-60",
    COLORFUL: "bg-yellow-50 border-yellow-300 opacity-60",
    GAMIFIED: "bg-gray-600/50 border-cyan-500/20 opacity-50",
  }[theme];

  const budget = errorBudget(pairCount);

  function cardClass(c: Card) {
    if (c.matched) return cardMatched;
    if (flipped.includes(c.id) || gamePhase === "memorize") return cardFront;
    return cardBack;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${card}`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold text-base ${titleClass}`}>🃏 Jogo da Memória</h2>
            <p className={`text-xs ${subClass}`}>{pairCount} pares · {budget} erro{budget !== 1 ? "s" : ""} permitido{budget !== 1 ? "s" : ""}</p>
          </div>
          {gamePhase === "playing" && errors > 0 && (
            <span className="text-red-500 font-medium text-sm">{errors}/{budget} erros</span>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < roundResults.length
                  ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === round ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Instrução */}
        <p className={`text-sm text-center mb-3 ${subClass}`}>
          {gamePhase === "memorize" && `Memorize as posições! (${countdown}s)`}
          {gamePhase === "playing" && `Encontre os ${pairCount} pares`}
          {gamePhase === "feedback" && (roundCorrect ? "Correto! ✅" : "Incorreto ❌")}
        </p>

        {/* Grid */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cards.map((c) => {
            const isVisible = c.matched || flipped.includes(c.id) || gamePhase === "memorize";
            return (
              <motion.button
                key={c.id}
                onClick={() => handleFlip(c.id)}
                disabled={gamePhase !== "playing" || c.matched || flipped.includes(c.id) || locked}
                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${cardClass(c)}`}
                whileTap={gamePhase === "playing" ? { scale: 0.92 } : {}}
              >
                <AnimatePresence mode="wait">
                  {isVisible ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <MemorySymbol id={c.symbol} size={36} />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="back"
                      className={`text-lg font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : theme === "COLORFUL" ? "text-white" : "text-blue-400"}`}
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {gamePhase === "playing" && (
          <p className={`text-center text-xs mt-3 ${subClass}`}>
            {matchedCount}/{pairCount} pares encontrados
          </p>
        )}
      </div>
    </div>
  );
}
