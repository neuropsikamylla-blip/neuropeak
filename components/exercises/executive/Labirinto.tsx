"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface LabirintoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Cell {
  N: boolean; S: boolean; E: boolean; W: boolean;
  visited: boolean;
}

function generateMaze(size: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      N: true, S: true, E: true, W: true, visited: false,
    }))
  );

  function dfs(r: number, c: number) {
    grid[r][c].visited = true;
    const dirs = [
      { dr: -1, dc: 0, wall: "N" as const, opp: "S" as const },
      { dr: 1,  dc: 0, wall: "S" as const, opp: "N" as const },
      { dr: 0,  dc: 1, wall: "E" as const, opp: "W" as const },
      { dr: 0,  dc: -1, wall: "W" as const, opp: "E" as const },
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const { dr, dc, wall, opp } of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].visited) {
        grid[r][c][wall] = false;
        grid[nr][nc][opp] = false;
        dfs(nr, nc);
      }
    }
  }

  dfs(0, 0);
  return grid;
}

// Time limits per size (seconds) — correct if completed within limit
const SIZE_STEPS = [5, 7, 9, 11, 13, 15];
const TIME_LIMITS: Record<number, number> = { 5: 35, 7: 50, 9: 70, 11: 100, 13: 130, 15: 160 };

const MAX_MAZES = 10;
const MIN_SIZE_IDX = 0;
const MAX_SIZE_IDX = SIZE_STEPS.length - 1;

function initialSizeIdx(difficulty: number) {
  return Math.min(Math.max(0, Math.floor((difficulty - 1) / 2)), MAX_SIZE_IDX);
}

export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [sizeIdx, setSizeIdx] = useState(initialSizeIdx(difficulty));
  const [streak, setStreak] = useState(0);
  const [mazeNum, setMazeNum] = useState(0);
  const [mazeResults, setMazeResults] = useState<{ correct: boolean; size: number }[]>([]);

  const size = SIZE_STEPS[sizeIdx];
  const timeLimit = TIME_LIMITS[size];

  // Maze state
  const [maze, setMaze] = useState<Cell[][]>(() => generateMaze(SIZE_STEPS[initialSizeIdx(difficulty)]));
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const startTime = useRef(Date.now());
  const mazeStartTime = useRef(Date.now());
  const allDoneRef = useRef(false);

  // Elapsed timer
  useEffect(() => {
    if (done || timedOut) return;
    const t = setInterval(() => {
      setElapsed(Math.round((Date.now() - mazeStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [done, timedOut, mazeNum]);

  // Auto-fail on timeout
  useEffect(() => {
    if (done || timedOut || elapsed < timeLimit) return;
    setTimedOut(true);
    finishMaze(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  function finishMaze(isCorrect: boolean) {
    if (allDoneRef.current) return;

    const newResults = [...mazeResults, { correct: isCorrect, size }];
    setMazeResults(newResults);

    const newStreak = isCorrect
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextIdx = sizeIdx;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextIdx = Math.min(sizeIdx + 1, MAX_SIZE_IDX); nextStreak = 0; }
    if (newStreak <= -2) { nextIdx = Math.max(sizeIdx - 1, MIN_SIZE_IDX); nextStreak = 0; }

    const nextMaze = mazeNum + 1;
    reportProgress(Math.round((nextMaze / MAX_MAZES) * 100));

    setTimeout(() => {
      if (nextMaze >= MAX_MAZES) {
        allDoneRef.current = true;
        const accuracy = newResults.filter((r) => r.correct).length / MAX_MAZES;
        const maxSize = Math.max(...newResults.map((r) => r.size));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("labirinto", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "labirinto",
          domain: "executive",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { mazes: MAX_MAZES, maxSize, correct: newResults.filter((r) => r.correct).length },
        });
      } else {
        const nextSize = SIZE_STEPS[nextIdx];
        setMazeNum(nextMaze);
        setStreak(nextStreak);
        setSizeIdx(nextIdx);
        setMaze(generateMaze(nextSize));
        setPlayer({ r: 0, c: 0 });
        setMoves(0);
        setElapsed(0);
        setDone(false);
        setTimedOut(false);
        mazeStartTime.current = Date.now();
      }
    }, 1800);
  }

  const move = useCallback((dir: "N" | "S" | "E" | "W") => {
    if (!maze.length || done || timedOut) return;
    const { r, c } = player;
    if (maze[r][c][dir]) return;
    const [dr, dc] = ({ N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] })[dir];
    const nr = r + dr, nc = c + dc;
    setPlayer({ r: nr, c: nc });
    setMoves((m) => m + 1);
    if (nr === size - 1 && nc === size - 1) {
      setDone(true);
      const isCorrect = elapsed <= timeLimit;
      finishMaze(isCorrect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maze, player, done, timedOut, size, elapsed, timeLimit]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "N"|"S"|"E"|"W"> = {
        ArrowUp: "N", ArrowDown: "S", ArrowRight: "E", ArrowLeft: "W",
      };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const cellPx = Math.min(36, Math.floor(Math.min(280, (typeof window !== "undefined" ? window.innerWidth : 400) - 100) / size));
  const svgSize = size * cellPx;
  const sw = 2;

  const colors = {
    CLINICAL: { bg: "#f9fafb", wall: "#374151", player: "#2563eb", goal: "#16a34a" },
    COLORFUL: { bg: "#fdf4ff", wall: "#7c3aed", player: "#ec4899", goal: "#f59e0b" },
    GAMIFIED: { bg: "#0f172a", wall: "#06b6d4", player: "#a855f7", goal: "#fbbf24" },
  }[theme];

  const btnClass = {
    CLINICAL: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95",
    COLORFUL: "bg-purple-100 text-purple-700 hover:bg-purple-200 active:scale-95",
    GAMIFIED: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/20 active:scale-95",
  }[theme];

  const timeColor = elapsed > timeLimit * 0.75 ? "text-red-500" : theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50"
    }`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold text-lg ${
              theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"
            }`}>🌀 Labirinto</h2>
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Grade {size}×{size}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${timeColor}`}>
              {elapsed}s / {timeLimit}s
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_MAZES }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < mazeResults.length
                  ? mazeResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === mazeNum
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center mb-4">
          {maze.length > 0 && (
            <svg width={svgSize} height={svgSize} style={{ background: colors.bg, borderRadius: 8 }}>
              {maze.map((row, r) => row.map((cell, c) => {
                const x = c * cellPx, y = r * cellPx;
                return (
                  <g key={`${r}-${c}`}>
                    {cell.N && <line x1={x} y1={y} x2={x + cellPx} y2={y} stroke={colors.wall} strokeWidth={sw} />}
                    {cell.S && <line x1={x} y1={y + cellPx} x2={x + cellPx} y2={y + cellPx} stroke={colors.wall} strokeWidth={sw} />}
                    {cell.W && <line x1={x} y1={y} x2={x} y2={y + cellPx} stroke={colors.wall} strokeWidth={sw} />}
                    {cell.E && <line x1={x + cellPx} y1={y} x2={x + cellPx} y2={y + cellPx} stroke={colors.wall} strokeWidth={sw} />}
                  </g>
                );
              }))}
              <text x={(size-1)*cellPx + cellPx/2} y={(size-1)*cellPx + cellPx/2 + cellPx*0.22} textAnchor="middle" fontSize={cellPx * 0.55}>🏁</text>
              <circle
                cx={player.c * cellPx + cellPx / 2}
                cy={player.r * cellPx + cellPx / 2}
                r={cellPx * 0.28}
                fill={colors.player}
              />
            </svg>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!done && !timedOut ? (
            <motion.div
              key="controls"
              className="grid grid-cols-3 gap-2 w-36 mx-auto"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div />
              <button onPointerDown={() => move("N")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>↑</button>
              <div />
              <button onPointerDown={() => move("W")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>←</button>
              <button onPointerDown={() => move("S")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>↓</button>
              <button onPointerDown={() => move("E")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>→</button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className="text-center space-y-1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <p className="text-4xl">{done && elapsed <= timeLimit ? "🎉" : timedOut ? "⏰" : "✅"}</p>
              <p className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : done && elapsed <= timeLimit ? "text-green-600" : "text-orange-500"}`}>
                {timedOut ? "Tempo esgotado!" : elapsed <= timeLimit ? "Excelente!" : "Saída encontrada!"}
              </p>
              <p className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                {moves} movimentos em {elapsed}s
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
