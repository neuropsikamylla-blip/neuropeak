"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
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
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const cardBackStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(135deg, #1a2d50, #2a4a8a)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 12 }
    : isColorful
    ? { background: "linear-gradient(135deg, #7c3aed, #9333ea)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 12 }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 12 };

  const cardFrontStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "2px solid rgba(26,39,68,0.08)",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(26,39,68,0.1)",
  };

  const steps = [
    {
      instruction: "Memorize onde estão os pares! Você tem 3 segundos.",
      content: (onStepDone: () => void) => (
        <JogoMemoriaShowStep theme={theme} cardFrontStyle={cardFrontStyle} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Agora encontre os pares! Toque duas cartas iguais.",
      content: (onStepDone: () => void) => (
        <JogoMemoriaPlayStep theme={theme} cardBackStyle={cardBackStyle} cardFrontStyle={cardFrontStyle} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Jogo da Memória" steps={steps} onDone={onDone} />;
}

function JogoMemoriaShowStep({ theme, cardFrontStyle, onDone }: { theme: Theme; cardFrontStyle: React.CSSProperties; onDone: () => void }) {
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
      <p style={{ fontSize: 13, marginBottom: 12, fontWeight: 500, color: theme === "GAMIFIED" ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
        Memorize ({countdown}s)
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-[180px] mx-auto">
        {TUTORIAL_CARDS.map((c) => (
          <div key={c.id} style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", ...cardFrontStyle }}>
            <MemorySymbol id={c.symbol} size={48} />
          </div>
        ))}
      </div>
    </div>
  );
}

function JogoMemoriaPlayStep({ theme, cardBackStyle, cardFrontStyle, onDone }: { theme: Theme; cardBackStyle: React.CSSProperties; cardFrontStyle: React.CSSProperties; onDone: () => void }) {
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

  function cardStyleFor(id: number): React.CSSProperties {
    if (matched.includes(id)) return { background: "rgba(22,163,74,0.15)", border: "2px solid #16a34a", borderRadius: 12 };
    if (flipped.includes(id)) return cardFrontStyle;
    return cardBackStyle;
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
            style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", ...cardStyleFor(c.id) }}
            whileTap={{ scale: 0.92 }}
          >
            {visible ? <MemorySymbol id={c.symbol} size={36} /> : (
              <span style={{ fontSize: 18, fontWeight: 700, color: theme === "GAMIFIED" ? "#22d3ee" : theme === "COLORFUL" ? "#ffffff" : "#60a5fa" }}>?</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

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

  if (showTutorial) {
    return <JogoMemoriaTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;
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
  const progressEmptyColor = isGamified ? "rgba(255,255,255,0.12)" : "rgba(26,39,68,0.12)";

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

  const budget = errorBudget(pairCount);
  const cols = pairCount * 2 <= 8 ? 4 : 5;

  function cardStyleFor(c: Card): React.CSSProperties {
    if (c.matched) return cardMatchedStyle;
    if (flipped.includes(c.id) || gamePhase === "memorize") return cardFrontStyle;
    return cardBackStyle;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={rootBg}>
      <div className="w-full max-w-2xl p-5" style={cardStyle}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: titleColor }}>🃏 Jogo da Memória</h2>
            <p style={{ fontSize: 12, color: labelColor }}>{pairCount} pares · {budget} erro{budget !== 1 ? "s" : ""} permitido{budget !== 1 ? "s" : ""}</p>
          </div>
          {gamePhase === "playing" && errors > 0 && (
            <span style={{ color: "#ef4444", fontWeight: 500, fontSize: 13 }}>{errors}/{budget} erros</span>
          )}
        </div>

        {/* Barra de progresso (pelo tempo, ~7 min, em saltos de 10%) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: progressEmptyColor }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: isGamified ? "#22d3ee" : isColorful ? "#14b8a6" : "#3b82f6", transition: "width 0.45s linear" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: labelColor, minWidth: 30, textAlign: "right" }}>{progressPct}%</span>
        </div>

        {/* Instrução */}
        <p style={{ fontSize: 13, textAlign: "center", marginBottom: 12, color: labelColor }}>
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
                style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", ...cardStyleFor(c) }}
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
                      <MemorySymbol id={c.symbol} size={48} />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="back"
                      style={{ fontSize: 18, fontWeight: 700, color: isGamified ? "#22d3ee" : isColorful ? "#ffffff" : "#60a5fa" }}
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
          <p style={{ textAlign: "center", fontSize: 12, marginTop: 12, color: labelColor }}>
            {matchedCount}/{pairCount} pares encontrados
          </p>
        )}
      </div>
    </div>
  );
}
