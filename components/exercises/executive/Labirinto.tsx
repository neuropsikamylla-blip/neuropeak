"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
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

const SIZES: Record<number, number> = { 1: 7, 2: 9, 3: 11, 4: 13, 5: 15 };

export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
  const size = SIZES[difficulty] ?? 7;
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    setMaze(generateMaze(size));
    setPlayer({ r: 0, c: 0 });
    setMoves(0);
    setDone(false);
    startTime.current = Date.now();
  }, [size]);

  const move = useCallback((dir: "N" | "S" | "E" | "W") => {
    if (!maze.length || done) return;
    const { r, c } = player;
    if (maze[r][c][dir]) return;
    const [dr, dc] = ({ N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] })[dir];
    const nr = r + dr, nc = c + dc;
    setPlayer({ r: nr, c: nc });
    const newMoves = moves + 1;
    setMoves(newMoves);
    if (nr === size - 1 && nc === size - 1) {
      setDone(true);
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const score = calculateExerciseScore("labirinto", 1, undefined, difficulty);
      setTimeout(() => onComplete({
        exerciseId: "labirinto",
        domain: "executive",
        score,
        accuracy: 1,
        difficulty,
        duration,
        metadata: { moves: newMoves, size },
      }), 1800);
    }
  }, [maze, player, done, size, moves, difficulty, onComplete]);

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

  const cellPx = Math.min(40, Math.floor(Math.min(320, window?.innerWidth - 80 || 320) / size));
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

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50"
    }`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold text-lg ${
            theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"
          }`}>🌀 Labirinto</h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {moves} movimentos
          </span>
        </div>

        <div className="flex justify-center mb-6">
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
              {/* Goal */}
              <text x={(size-1)*cellPx + cellPx/2} y={(size-1)*cellPx + cellPx/2 + cellPx*0.22} textAnchor="middle" fontSize={cellPx * 0.55}>🏁</text>
              {/* Player */}
              <circle
                cx={player.c * cellPx + cellPx / 2}
                cy={player.r * cellPx + cellPx / 2}
                r={cellPx * 0.28}
                fill={colors.player}
              />
            </svg>
          )}
        </div>

        {!done ? (
          <div className="grid grid-cols-3 gap-2 w-36 mx-auto">
            <div />
            <button onPointerDown={() => move("N")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>↑</button>
            <div />
            <button onPointerDown={() => move("W")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>←</button>
            <button onPointerDown={() => move("S")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>↓</button>
            <button onPointerDown={() => move("E")} className={`py-3 rounded-xl font-bold text-xl ${btnClass}`}>→</button>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <p className="text-4xl">🎉</p>
            <p className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : "text-green-600"}`}>Saída encontrada!</p>
            <p className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>{moves} movimentos</p>
          </div>
        )}
      </div>
    </div>
  );
}
