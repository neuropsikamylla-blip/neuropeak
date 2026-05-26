"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface TrilhaVisualProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Cell {
  id: number;
  label: string;
  x: number; // % in play area
  y: number; // % in play area
}

const MAX_ROUNDS = 20;
const MIN_COUNT = 5;
const MAX_COUNT = 25;

function initialCount(difficulty: number) {
  return Math.min(Math.max(5, difficulty + 4), 14);
}

function playAreaHeightPct(count: number) {
  if (count <= 12) return 72;
  if (count <= 18) return 90;
  return 112;
}

function generateCells(count: number): Cell[] {
  const heightPct = playAreaHeightPct(count);
  // Adjusted cell size as % of each axis
  const CELL_W = 12;
  const CELL_H = CELL_W * (100 / heightPct);

  const cols = count <= 6 ? 3 : count <= 12 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const cw = 76 / cols;
  const ch = 76 / rows;

  const maxJX = Math.max(0, (cw - CELL_W) / 2 * 0.85);
  const maxJY = Math.max(0, (ch - CELL_H) / 2 * 0.85);

  const allSlots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 10 + c * cw + cw * 0.5;
      const cy = 10 + r * ch + ch * 0.5;
      allSlots.push({
        x: cx + (Math.random() - 0.5) * 2 * maxJX,
        y: cy + (Math.random() - 0.5) * 2 * maxJY,
      });
    }
  }

  return shuffle(allSlots).slice(0, count).map(({ x, y }, i) => ({
    id: i + 1,
    label: String(i + 1),
    x: Math.max(7, Math.min(91, x)),
    y: Math.max(7, Math.min(91, y)),
  }));
}

type RoundPhase = "playing" | "feedback";

// Fixed 4-cell tutorial positions (as % in play area)
const TUTORIAL_CELLS = [
  { id: 1, x: 20, y: 25 },
  { id: 2, x: 65, y: 20 },
  { id: 3, x: 50, y: 65 },
  { id: 4, x: 25, y: 70 },
];

function TrilhaTutorialStep({
  theme,
  startFrom,
  onDone,
}: {
  theme: Theme;
  startFrom: number; // first cell id the user should click
  onDone: () => void;
}) {
  const [nextExpected, setNextExpected] = useState(startFrom);
  const [path, setPath] = useState<{ x: number; y: number }[]>(() =>
    startFrom === 1 ? [] : TUTORIAL_CELLS.filter((c) => c.id < startFrom).map((c) => ({ x: c.x, y: c.y }))
  );
  const done = useRef(false);

  const lineColor = theme === "GAMIFIED" ? "#22d3ee" : theme === "COLORFUL" ? "#818cf8" : "#93c5fd";

  function cellStyle(cell: { id: number }) {
    const isCompleted = cell.id < nextExpected;
    const base = "absolute flex items-center justify-center font-black border-2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl text-sm select-none transition-all";
    if (isCompleted) return `${base} ${theme === "GAMIFIED" ? "bg-cyan-800/70 border-cyan-600/50 text-cyan-300 scale-90" : theme === "COLORFUL" ? "bg-indigo-400 border-indigo-500 text-white scale-90" : "bg-blue-300 border-blue-400 text-white scale-90"}`;
    return `${base} ${theme === "GAMIFIED" ? "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 shadow-md active:scale-90" : theme === "COLORFUL" ? "bg-white border-indigo-300 text-indigo-800 hover:bg-indigo-50 shadow-sm active:scale-90" : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 shadow-sm active:scale-90"}`;
  }

  function handleClick(cell: { id: number; x: number; y: number }) {
    if (done.current || cell.id !== nextExpected) return;
    const newPath = [...path, { x: cell.x, y: cell.y }];
    setPath(newPath);
    const newNext = nextExpected + 1;
    setNextExpected(newNext);
    if (newNext > 4) { done.current = true; setTimeout(onDone, 300); }
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-indigo-50/60" : "bg-gray-50"}`} style={{ paddingBottom: "60%", minHeight: 160 }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
        {path.length > 1 && path.slice(1).map((pt, i) => (
          <motion.line
            key={`l${i}`}
            x1={`${path[i].x}%`} y1={`${path[i].y}%`}
            x2={`${pt.x}%`} y2={`${pt.y}%`}
            stroke={lineColor} strokeWidth={2.5} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </svg>
      {TUTORIAL_CELLS.map((cell) => (
        <button
          key={cell.id}
          onClick={() => handleClick(cell)}
          disabled={done.current}
          className={cellStyle(cell)}
          style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
        >
          {cell.id}
        </button>
      ))}
    </div>
  );
}

function TrilhaVisualTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Números estão espalhados na tela. Toque em ordem crescente!",
      content: (onStepDone: () => void) => (
        <TrilhaTutorialStep theme={theme} startFrom={1} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Continue! Agora clique 2, 3, 4 para completar a trilha.",
      content: (onStepDone: () => void) => (
        <TrilhaTutorialStep theme={theme} startFrom={2} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Conecta Números" steps={steps} onDone={onDone} />;
}

export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [count, setCount] = useState(initialCount(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; count: number }[]>([]);

  const [cells, setCells] = useState<Cell[]>(() => generateCells(initialCount(difficulty)));
  const [nextExpected, setNextExpected] = useState(1);
  const [errors, setErrors] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("playing");
  const [roundCorrect, setRoundCorrect] = useState(false);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);

  const startTime = useRef<number>(Date.now());
  const firstClick = useRef(false);

  const startNewRound = useCallback((nextCount: number) => {
    setCells(generateCells(nextCount));
    setNextExpected(1);
    setErrors(0);
    setPath([]);
    setRoundPhase("playing");
    firstClick.current = false;
  }, []);

  const handleCellClick = useCallback((cellId: number) => {
    if (roundPhase !== "playing") return;
    if (!firstClick.current) firstClick.current = true;

    const clickedCell = cells.find((c) => c.id === cellId)!;

    if (cellId === nextExpected) {
      setPath((prev) => [...prev, { x: clickedCell.x, y: clickedCell.y }]);

      if (nextExpected === count) {
        const isCorrect = errors <= 1;
        const newRoundResults = [...roundResults, { correct: isCorrect, count }];
        setRoundResults(newRoundResults);
        setRoundCorrect(isCorrect);
        setRoundPhase("feedback");

        const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
        let nextCount = count;
        let nextStreak = newStreak;
        if (newStreak >= 2) { nextCount = Math.min(count + 2, MAX_COUNT); nextStreak = 0; }
        if (newStreak <= -2) { nextCount = Math.max(count - 2, MIN_COUNT); nextStreak = 0; }

        const nextRound = round + 1;
        reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

        setTimeout(() => {
          if (nextRound >= MAX_ROUNDS) {
            const accuracy = newRoundResults.filter((r) => r.correct).length / MAX_ROUNDS;
            const maxCount = Math.max(...newRoundResults.map((r) => r.count));
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            const score = calculateExerciseScore("trilha-visual", accuracy, undefined, difficulty);
            onComplete({
              exerciseId: "trilha-visual",
              domain: "attention",
              score, accuracy, difficulty, duration,
              metadata: { rounds: MAX_ROUNDS, maxCount, correct: newRoundResults.filter((r) => r.correct).length },
            });
          } else {
            setRound(nextRound);
            setStreak(nextStreak);
            setCount(nextCount);
            startNewRound(nextCount);
          }
        }, 1500);
      } else {
        setNextExpected((n) => n + 1);
      }
    } else {
      setErrors((e) => e + 1);
    }
  }, [roundPhase, nextExpected, count, errors, streak, round, roundResults, difficulty, cells, onComplete, reportProgress, startNewRound]);

  if (showTutorial) {
    return <TrilhaVisualTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  // ── Theme styles ──────────────────────────────────────────────────
  const bg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-indigo-50 to-sky-50" :
    "bg-gray-50";

  const card =
    theme === "GAMIFIED" ? "bg-gray-900 border border-cyan-500/20" :
    "bg-white shadow-lg";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-indigo-700" :
    "text-gray-900";

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  const playAreaBg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-indigo-50/60" :
    "bg-gray-50";

  const lineColor =
    theme === "GAMIFIED" ? "#22d3ee" :
    theme === "COLORFUL" ? "#818cf8" :
    "#93c5fd";

  function cellStyle(cell: Cell) {
    const isCompleted = cell.id < nextExpected;
    const base = "absolute flex items-center justify-center font-black border-2 transform -translate-x-1/2 -translate-y-1/2 select-none transition-all";
    const size = "w-11 h-11 rounded-xl text-sm";

    if (isCompleted) {
      return `${base} ${size} ${
        theme === "GAMIFIED"
          ? "bg-cyan-800/70 border-cyan-600/50 text-cyan-300 scale-90"
          : theme === "COLORFUL"
          ? "bg-indigo-400 border-indigo-500 text-white scale-90"
          : "bg-blue-300 border-blue-400 text-white scale-90"
      }`;
    }
    return `${base} ${size} ${
      theme === "GAMIFIED"
        ? "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:border-cyan-600 shadow-md active:scale-90"
        : theme === "COLORFUL"
        ? "bg-white border-indigo-300 text-indigo-800 hover:bg-indigo-50 hover:border-indigo-400 shadow-sm active:scale-90"
        : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 shadow-sm active:scale-90"
    }`;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${card}`}>

        {/* Header */}
        <div className={`flex justify-between items-center px-5 py-3 border-b ${
          theme === "GAMIFIED" ? "border-gray-800" : "border-gray-100"
        }`}>
          <div>
            <span className={`font-bold ${titleClass}`}>🔢 Conecta Números</span>
            <span className={`ml-2 text-xs ${subClass}`}>{count} números</span>
          </div>
          {roundPhase === "playing" && errors > 0 && (
            <span className="text-red-500 font-medium text-sm">{errors} {errors === 1 ? "erro" : "erros"}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 px-5 py-2">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < roundResults.length
                ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                : i === round ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-800" : "bg-gray-200"
            }`} />
          ))}
        </div>

        {/* Instruction */}
        <p className={`text-center text-xs py-1.5 px-5 ${subClass}`}>
          {roundPhase === "playing"
            ? "Toque em ordem crescente: 1 → 2 → 3 → ..."
            : roundCorrect ? "Correto! ✅" : "Incorreto ❌"}
        </p>

        {/* Play area */}
        <div className={`relative w-full ${playAreaBg}`} style={{ paddingBottom: `${playAreaHeightPct(count)}%` }}>

          {/* SVG trail lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {path.length > 1 && path.slice(1).map((pt, i) => (
              <motion.line
                key={`line-${i}`}
                x1={`${path[i].x}%`}
                y1={`${path[i].y}%`}
                x2={`${pt.x}%`}
                y2={`${pt.y}%`}
                stroke={lineColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            ))}
            {/* Dot on first clicked */}
            {path.length > 0 && (
              <circle
                cx={`${path[0].x}%`}
                cy={`${path[0].y}%`}
                r={4}
                fill={lineColor}
                opacity={0.6}
              />
            )}
          </svg>

          {/* Number tokens */}
          {cells.map((cell) => {
            const isCompleted = cell.id < nextExpected;
            return (
              <motion.button
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                disabled={roundPhase !== "playing" || isCompleted}
                className={cellStyle(cell)}
                style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
                whileTap={{ scale: 0.85 }}
                animate={isCompleted ? { scale: 0.88, opacity: 0.55 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {cell.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
