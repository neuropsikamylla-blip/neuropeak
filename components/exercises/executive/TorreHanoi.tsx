"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface TorreHanoiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MIN_DISCS = 2;
const MAX_DISCS = 6;
const MAX_PUZZLES = 10;

function initialDiscs(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.4) + 2), 4);
}

const DISC_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899",
];

type Peg = number[];
type State = [Peg, Peg, Peg];

function optimalMoves(n: number): number {
  return Math.pow(2, n) - 1;
}

function initialPegs(discCount: number): State {
  return [
    Array.from({ length: discCount }, (_, i) => discCount - i),
    [],
    [],
  ];
}

function HanoiPegsDisplay({
  pegs,
  theme,
  selected,
  discCount,
  onPegClick,
}: {
  pegs: [number[], number[], number[]];
  theme: Theme;
  selected: number | null;
  discCount: number;
  onPegClick?: (i: number) => void;
}) {
  const maxW = 120;
  return (
    <div className="flex justify-around items-end" style={{ height: 140 }}>
      {pegs.map((peg, pegIdx) => (
        <div
          key={pegIdx}
          className="flex flex-col items-center cursor-pointer relative"
          style={{ width: maxW + 16 }}
          onClick={() => onPegClick?.(pegIdx)}
        >
          <div
            className={`absolute bottom-0 rounded-lg ${selected === pegIdx ? "bg-yellow-400" : theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-400"}`}
            style={{ width: maxW + 16, height: 7 }}
          />
          <div
            className={`absolute rounded-full ${theme === "GAMIFIED" ? "bg-gray-500" : "bg-gray-400"}`}
            style={{ width: 6, height: 125, bottom: 7 }}
          />
          <div className="absolute bottom-2 flex flex-col-reverse items-center gap-0.5">
            {peg.map((disc, di) => {
              const w = (disc / discCount) * maxW + 16;
              const isTop = di === peg.length - 1;
              return (
                <div
                  key={disc}
                  className="rounded-md flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    width: w, height: 18,
                    backgroundColor: DISC_COLORS[disc - 1] ?? "#666",
                    opacity: selected === pegIdx && isTop ? 0.6 : 1,
                  }}
                >
                  {disc}
                </div>
              );
            })}
          </div>
          <div className={`text-xs absolute -bottom-5 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {pegIdx === 0 ? "Origem" : pegIdx === 1 ? "Aux" : "Destino"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TorreHanoiTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Mova todos os discos do pino esquerdo para o direito!",
      content: (onStepDone: () => void) => <HanoiMoveStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Regra: disco MAIOR nunca pode ficar sobre disco MENOR.",
      content: (onStepDone: () => void) => <HanoiRuleStep theme={theme} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Torre de Hanói" steps={steps} onDone={onDone} />;
}

function HanoiMoveStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [pegs, setPegs] = useState<[number[], number[], number[]]>([[1], [], []]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setPegs([[], [], [1]]);
        setTimeout(onDone, 500);
      }, 600);
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <HanoiPegsDisplay pegs={pegs} theme={theme} selected={null} discCount={1} />
      <p className={`text-xs mt-6 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
        {animating ? "→ movendo disco para o destino..." : "Observe o movimento..."}
      </p>
    </div>
  );
}

function HanoiRuleStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [autoAdvanced, setAutoAdvanced] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setAutoAdvanced(true); }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validPegs: [number[], number[], number[]] = [[2, 1], [], []]; // big on bottom, small on top
  const invalidPegs: [number[], number[], number[]] = [[1, 2], [], []]; // invalid: big on top of small

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 border-2 border-green-400 ${theme === "GAMIFIED" ? "bg-gray-700/50" : "bg-green-50"}`}>
          <p className="text-xs text-green-600 font-bold mb-2 text-center">✅ Válido</p>
          <HanoiPegsDisplay pegs={validPegs} theme={theme} selected={null} discCount={2} />
        </div>
        <div className={`rounded-xl p-3 border-2 border-red-400 ${theme === "GAMIFIED" ? "bg-gray-700/50" : "bg-red-50"}`}>
          <p className="text-xs text-red-500 font-bold mb-2 text-center">❌ Inválido</p>
          <HanoiPegsDisplay pegs={invalidPegs} theme={theme} selected={null} discCount={2} />
        </div>
      </div>
      <p className={`text-xs text-center ${subClass}`}>Disco maior nunca sobre disco menor!</p>
      {autoAdvanced ? (
        <button
          onClick={onDone}
          className={`w-full py-2 rounded-xl font-bold text-sm ${theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-blue-600 text-white"}`}
        >
          Entendi!
        </button>
      ) : null}
    </div>
  );
}

export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [discCount, setDiscCount] = useState(initialDiscs(difficulty));
  const [streak, setStreak] = useState(0);
  const [puzzle, setPuzzle] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<{ correct: boolean; discs: number }[]>([]);

  // Puzzle state
  const [pegs, setPegs] = useState<State>(() => initialPegs(initialDiscs(difficulty)));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const startTime = useRef<number>(Date.now());
  const puzzleStart = useRef<number>(Date.now());

  const optimal = optimalMoves(discCount);

  function startNewPuzzle(nextDiscs: number) {
    setPegs(initialPegs(nextDiscs));
    setSelected(null);
    setMoves(0);
    setWon(false);
    puzzleStart.current = Date.now();
  }

  function handlePegClick(pegIdx: number) {
    if (won) return;

    if (selected === null) {
      if (pegs[pegIdx].length === 0) return;
      setSelected(pegIdx);
    } else {
      if (selected === pegIdx) {
        setSelected(null);
        return;
      }

      const fromPeg = pegs[selected];
      const toPeg = pegs[pegIdx];
      const disc = fromPeg[fromPeg.length - 1];

      if (toPeg.length > 0 && toPeg[toPeg.length - 1] < disc) {
        setSelected(null);
        return;
      }

      const newPegs: State = pegs.map((p) => [...p]) as State;
      newPegs[selected].pop();
      newPegs[pegIdx].push(disc);
      setPegs(newPegs);
      const newMoves = moves + 1;
      setMoves(newMoves);
      setSelected(null);

      if (newPegs[2].length === discCount) {
        setWon(true);
        const isCorrect = newMoves <= 2 * optimal;

        const newPuzzleResults = [...puzzleResults, { correct: isCorrect, discs: discCount }];
        setPuzzleResults(newPuzzleResults);

        const newStreak = isCorrect
          ? Math.max(streak, 0) + 1
          : Math.min(streak, 0) - 1;
        let nextDiscs = discCount;
        let nextStreak = newStreak;
        if (newStreak >= 2) { nextDiscs = Math.min(discCount + 1, MAX_DISCS); nextStreak = 0; }
        if (newStreak <= -2) { nextDiscs = Math.max(discCount - 1, MIN_DISCS); nextStreak = 0; }

        const nextPuzzle = puzzle + 1;
        reportProgress(Math.round((nextPuzzle / MAX_PUZZLES) * 100));

        setTimeout(() => {
          if (nextPuzzle >= MAX_PUZZLES) {
            const accuracy = newPuzzleResults.filter((r) => r.correct).length / MAX_PUZZLES;
            const maxDiscs = Math.max(...newPuzzleResults.map((r) => r.discs));
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, difficulty);
            onComplete({
              exerciseId: "torre-hanoi",
              domain: "executive",
              score,
              accuracy,
              difficulty,
              duration,
              metadata: { puzzles: MAX_PUZZLES, maxDiscs, correct: newPuzzleResults.filter((r) => r.correct).length },
            });
          } else {
            setPuzzle(nextPuzzle);
            setStreak(nextStreak);
            setDiscCount(nextDiscs);
            startNewPuzzle(nextDiscs);
          }
        }, 2000);
      }
    }
  }

  if (showTutorial) {
    return <TorreHanoiTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-gray-50";
  const maxDiscWidth = 160;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-xl rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
              Torre de Hanói ({discCount} discos)
            </h2>
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Movimentos: {moves} · Ótimo: {optimal}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: MAX_PUZZLES }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < puzzleResults.length
                  ? puzzleResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === puzzle
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Instructions */}
        <p className={`text-xs mb-4 text-center ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
          Mova todos os discos para o pino da direita. Clique para selecionar e mover.
          {selected !== null && <strong className="ml-1 text-blue-500"> Pino {selected + 1} selecionado</strong>}
        </p>

        {/* Pegs area */}
        <div className="flex justify-around items-end mb-4" style={{ height: "200px" }}>
          {pegs.map((peg, pegIdx) => (
            <div
              key={pegIdx}
              className="flex flex-col items-center cursor-pointer relative"
              style={{ width: `${maxDiscWidth + 20}px` }}
              onClick={() => handlePegClick(pegIdx)}
            >
              <div
                className={`absolute bottom-0 rounded-lg ${selected === pegIdx ? "bg-yellow-400" : theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-400"}`}
                style={{ width: `${maxDiscWidth + 20}px`, height: "8px" }}
              />
              <div
                className={`absolute rounded-full ${theme === "GAMIFIED" ? "bg-gray-500" : "bg-gray-400"}`}
                style={{ width: "8px", height: "180px", bottom: "8px" }}
              />
              <div className="absolute bottom-2 flex flex-col-reverse items-center gap-0.5">
                {peg.map((disc, discIdx) => {
                  const width = (disc / discCount) * maxDiscWidth + 20;
                  const isTop = discIdx === peg.length - 1;
                  return (
                    <motion.div
                      key={disc}
                      className="rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        width: `${width}px`,
                        height: "22px",
                        backgroundColor: DISC_COLORS[disc - 1] ?? "#666",
                        opacity: selected === pegIdx && isTop ? 0.6 : 1,
                        boxShadow: isTop && selected === pegIdx ? "0 0 12px rgba(250,204,21,0.8)" : undefined,
                      }}
                      layoutId={`disc-${disc}-${puzzle}`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {disc}
                    </motion.div>
                  );
                })}
              </div>
              <div className={`mt-2 text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"} absolute -bottom-6`}>
                {pegIdx === 0 ? "Origem" : pegIdx === 1 ? "Auxiliar" : "Destino"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8" />

        <AnimatePresence>
          {won && (
            <motion.div
              className={`text-center p-4 rounded-xl mt-4 ${
                puzzleResults[puzzle]?.correct
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-orange-50 border-2 border-orange-400"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-4xl mb-2">
                {puzzleResults[puzzle]?.correct ? "🏆" : "✅"}
              </div>
              <p className={`font-bold text-lg ${puzzleResults[puzzle]?.correct ? "text-green-700" : "text-orange-700"}`}>
                {puzzleResults[puzzle]?.correct ? "Excelente!" : "Resolvido!"}
              </p>
              <p className={`text-sm ${puzzleResults[puzzle]?.correct ? "text-green-600" : "text-orange-600"}`}>
                {moves} movimentos (ótimo: {optimal})
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
