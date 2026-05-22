"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
}

// ── Maze generation (recursive DFS, perfect maze) ─────────────────────
function generateMaze(size: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ N: true, S: true, E: true, W: true }))
  );
  const vis = Array.from({ length: size }, () => new Array(size).fill(false));

  function dfs(r: number, c: number) {
    vis[r][c] = true;
    const dirs = [
      { dr: -1, dc: 0, w: "N" as const, o: "S" as const },
      { dr:  1, dc: 0, w: "S" as const, o: "N" as const },
      { dr:  0, dc: 1, w: "E" as const, o: "W" as const },
      { dr:  0, dc:-1, w: "W" as const, o: "E" as const },
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const { dr, dc, w, o } of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !vis[nr][nc]) {
        grid[r][c][w] = false;
        grid[nr][nc][o] = false;
        dfs(nr, nc);
      }
    }
  }
  dfs(0, 0);
  return grid;
}

// ── Configuration ──────────────────────────────────────────────────────
// Maze sizes: larger = harder to navigate without seeing full picture
const SIZE_STEPS = [10, 12, 14, 17, 20, 24];
const TIME_LIMITS: Record<number, number> = {
  10: 70, 12: 90, 14: 115, 17: 150, 20: 190, 24: 250,
};
const MAX_MAZES = 10;
const MIN_IDX = 0;
const MAX_IDX = SIZE_STEPS.length - 1;

function initialIdx(difficulty: number) {
  return Math.min(Math.max(0, Math.floor((difficulty - 1) / 2)), MAX_IDX);
}

// ── Viewport constants ─────────────────────────────────────────────────
// Player always centered; only 9×9 cells visible at a time
const VIEWPORT = 9;
const C_PX = 36;    // px per cell
const WT = 4;       // wall thickness (passage = C_PX - 2*WT = 28px)
const VP_PX = VIEWPORT * C_PX; // 324px

function key(r: number, c: number) { return `${r},${c}`; }

// ── Theme palettes ─────────────────────────────────────────────────────
const PALETTES = {
  CLINICAL: {
    bg: "#374151",        // outer page bg
    wall: "#374151",      // carved stone wall
    floor: "#f3f4f6",     // lit corridor
    trail: "#bfdbfe",     // visited corridor tint (light blue)
    player: "#3b82f6",    // player dot
    playerGlow: "rgba(59,130,246,0.35)",
    goal: "#16a34a",      // goal color
    svgBg: "#374151",
  },
  COLORFUL: {
    bg: "#1e1b4b",
    wall: "#312e81",
    floor: "#fdf4ff",
    trail: "#e9d5ff",
    player: "#ec4899",
    playerGlow: "rgba(236,72,153,0.4)",
    goal: "#f59e0b",
    svgBg: "#312e81",
  },
  GAMIFIED: {
    bg: "#020617",
    wall: "#0d1117",
    floor: "#1e293b",
    trail: "#0f4c75",
    player: "#22d3ee",
    playerGlow: "rgba(34,211,238,0.5)",
    goal: "#fbbf24",
    svgBg: "#0d1117",
  },
};

export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
  const reportProgress = useExerciseProgress();
  const pal = PALETTES[theme];

  const [sizeIdx, setSizeIdx] = useState(initialIdx(difficulty));
  const [streak, setStreak] = useState(0);
  const [mazeNum, setMazeNum] = useState(0);
  const [mazeResults, setMazeResults] = useState<{ correct: boolean; size: number }[]>([]);

  const size = SIZE_STEPS[sizeIdx];
  const timeLimit = TIME_LIMITS[size];

  const [maze, setMaze] = useState<Cell[][]>(() => generateMaze(SIZE_STEPS[initialIdx(difficulty)]));
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [explored, setExplored] = useState<Set<string>>(() => new Set([key(0, 0)]));
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const startTime = useRef(Date.now());
  const mazeStartTime = useRef(Date.now());
  const allDoneRef = useRef(false);
  const playerRef = useRef({ r: 0, c: 0 });
  const mazeRef = useRef(maze);
  mazeRef.current = maze;
  playerRef.current = player;

  // ── Timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (done || timedOut) return;
    const t = setInterval(() => {
      setElapsed(Math.round((Date.now() - mazeStartTime.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [done, timedOut, mazeNum]);

  useEffect(() => {
    if (!done && !timedOut && elapsed >= timeLimit) {
      setTimedOut(true);
      finishMaze(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // ── Finish maze ───────────────────────────────────────────────────────
  function finishMaze(isCorrect: boolean) {
    if (allDoneRef.current) return;
    setFeedbackMsg(isCorrect ? "Saída encontrada! ✅" : elapsed >= timeLimit ? "Tempo esgotado ⏰" : "Saída encontrada!");

    const newResults = [...mazeResults, { correct: isCorrect, size }];
    setMazeResults(newResults);

    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextIdx = sizeIdx;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextIdx = Math.min(sizeIdx + 1, MAX_IDX); nextStreak = 0; }
    if (newStreak <= -2) { nextIdx = Math.max(sizeIdx - 1, MIN_IDX); nextStreak = 0; }

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
          score, accuracy, difficulty, duration,
          metadata: { mazes: MAX_MAZES, maxSize, correct: newResults.filter((r) => r.correct).length },
        });
      } else {
        const nextSize = SIZE_STEPS[nextIdx];
        const nextMazeGrid = generateMaze(nextSize);
        setMazeNum(nextMaze);
        setStreak(nextStreak);
        setSizeIdx(nextIdx);
        setMaze(nextMazeGrid);
        setPlayer({ r: 0, c: 0 });
        setExplored(new Set([key(0, 0)]));
        setMoves(0);
        setElapsed(0);
        setDone(false);
        setTimedOut(false);
        setFeedbackMsg("");
        mazeStartTime.current = Date.now();
      }
    }, 2000);
  }

  // ── Movement ─────────────────────────────────────────────────────────
  const move = useCallback((dir: "N" | "S" | "E" | "W") => {
    if (done || timedOut) return;
    const { r, c } = playerRef.current;
    const g = mazeRef.current;
    if (!g.length || g[r][c][dir]) return;

    const [dr, dc] = ({ N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] })[dir];
    const nr = r + dr, nc = c + dc;
    const curSize = SIZE_STEPS[sizeIdx];

    setPlayer({ r: nr, c: nc });
    setMoves((m) => m + 1);
    setExplored((prev) => new Set([...prev, key(nr, nc)]));

    if (nr === curSize - 1 && nc === curSize - 1) {
      setDone(true);
      finishMaze(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, timedOut, sizeIdx]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "N"|"S"|"E"|"W"> = {
        ArrowUp: "N", ArrowDown: "S", ArrowRight: "E", ArrowLeft: "W",
        w: "N", s: "S", d: "E", a: "W",
      };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  // ── SVG rendering ────────────────────────────────────────────────────
  // World origin shift so player is always centered in viewport
  const worldOffX = VP_PX / 2 - (player.c * C_PX + C_PX / 2);
  const worldOffY = VP_PX / 2 - (player.r * C_PX + C_PX / 2);

  // Only render cells in viewport + 1 buffer
  const halfV = Math.ceil(VIEWPORT / 2) + 1;
  const rMin = Math.max(0, player.r - halfV);
  const rMax = Math.min(size - 1, player.r + halfV);
  const cMin = Math.max(0, player.c - halfV);
  const cMax = Math.min(size - 1, player.c + halfV);

  const mazeElements: React.ReactNode[] = [];
  if (maze.length) {
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const cell = maze[r][c];
        const wx = c * C_PX, wy = r * C_PX;
        const isExplored = explored.has(key(r, c));
        const fillColor = isExplored ? pal.trail : pal.floor;

        // Cell interior
        mazeElements.push(
          <rect key={`f${r},${c}`} x={wx + WT} y={wy + WT} width={C_PX - WT * 2} height={C_PX - WT * 2} fill={fillColor} />
        );
        // Open passages (fill the wall gap)
        if (!cell.N && r > 0)
          mazeElements.push(<rect key={`n${r},${c}`} x={wx + WT} y={wy} width={C_PX - WT * 2} height={WT}
            fill={isExplored || explored.has(key(r-1, c)) ? (isExplored && explored.has(key(r-1,c)) ? pal.trail : pal.floor) : pal.floor} />);
        if (!cell.W && c > 0)
          mazeElements.push(<rect key={`w${r},${c}`} x={wx} y={wy + WT} width={WT} height={C_PX - WT * 2}
            fill={isExplored || explored.has(key(r, c-1)) ? (isExplored && explored.has(key(r,c-1)) ? pal.trail : pal.floor) : pal.floor} />);
      }
    }
  }

  // Player (always at viewport center)
  const px = VP_PX / 2, py = VP_PX / 2;

  // Goal position in viewport coords
  const gx = (size - 1) * C_PX + C_PX / 2 + worldOffX;
  const gy = (size - 1) * C_PX + C_PX / 2 + worldOffY;
  const goalVisible = gx >= 0 && gx <= VP_PX && gy >= 0 && gy <= VP_PX;

  // Time color warning
  const timeRatio = elapsed / timeLimit;
  const timeColor = timeRatio > 0.8 ? "#ef4444" : timeRatio > 0.6 ? "#f97316" : theme === "GAMIFIED" ? "#9ca3af" : "#6b7280";

  // D-pad button style
  const btnBase = `flex items-center justify-center rounded-xl font-black text-2xl select-none active:scale-90 transition-transform touch-none ${
    theme === "GAMIFIED"
      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 active:bg-cyan-500/30"
      : theme === "COLORFUL"
      ? "bg-purple-100 text-purple-700 active:bg-purple-200"
      : "bg-gray-100 text-gray-700 active:bg-gray-200"
  }`;

  // Mini-map size
  const mmSize = 56;
  const mmDot = Math.max(2, mmSize / size);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-3`}
      style={{ background: theme === "GAMIFIED" ? "#030712" : theme === "COLORFUL" ? "#1e1b4b" : "#1f2937" }}>

      {/* Header */}
      <div className={`w-full max-w-sm rounded-2xl px-4 py-3 mb-3 ${
        theme === "GAMIFIED" ? "bg-gray-900 border border-cyan-500/20" : "bg-black/30"
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`font-bold text-base ${
              theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-300" : "text-white"
            }`}>🌀 Labirinto</h2>
            <p className="text-xs text-gray-400">{size}×{size} · {moves} mov.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: timeColor }}>{elapsed}s / {timeLimit}s</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_MAZES }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < mazeResults.length
                ? mazeResults[i].correct ? "bg-green-500" : "bg-red-400"
                : i === mazeNum ? "bg-blue-400 animate-pulse"
                : "bg-white/10"
            }`} />
          ))}
        </div>
      </div>

      {/* Maze viewport */}
      <div className="relative mb-4" style={{ width: VP_PX, height: VP_PX }}>
        <svg
          width={VP_PX}
          height={VP_PX}
          style={{
            borderRadius: 12,
            border: `2px solid ${theme === "GAMIFIED" ? "rgba(34,211,238,0.25)" : "rgba(255,255,255,0.15)"}`,
            overflow: "hidden",
            display: "block",
          }}
        >
          <defs>
            <clipPath id="vp">
              <rect x={0} y={0} width={VP_PX} height={VP_PX} />
            </clipPath>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Wall background */}
          <rect x={0} y={0} width={VP_PX} height={VP_PX} fill={pal.svgBg} />

          {/* Maze cells */}
          <motion.g
            clipPath="url(#vp)"
            animate={{ x: worldOffX, y: worldOffY }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {mazeElements}

            {/* Goal square */}
            <rect
              x={(size - 1) * C_PX + WT + 2}
              y={(size - 1) * C_PX + WT + 2}
              width={C_PX - WT * 2 - 4}
              height={C_PX - WT * 2 - 4}
              fill={pal.goal}
              rx={3}
              opacity={0.85}
            />
            <text
              x={(size - 1) * C_PX + C_PX / 2}
              y={(size - 1) * C_PX + C_PX / 2 + 5}
              textAnchor="middle"
              fontSize={16}
            >🏁</text>
          </motion.g>

          {/* Player — always at center */}
          <circle cx={px} cy={py} r={C_PX * 0.32} fill={pal.playerGlow} />
          <circle cx={px} cy={py} r={C_PX * 0.22} fill={pal.player} />
        </svg>

        {/* Mini-map (top-right corner overlay) */}
        <div
          style={{
            position: "absolute",
            top: 8, right: 8,
            width: mmSize, height: mmSize,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          {/* Player dot */}
          <div style={{
            position: "absolute",
            left: player.c / size * mmSize - mmDot / 2,
            top: player.r / size * mmSize - mmDot / 2,
            width: mmDot + 2, height: mmDot + 2,
            borderRadius: "50%",
            background: pal.player,
          }} />
          {/* Goal dot */}
          <div style={{
            position: "absolute",
            right: 1, bottom: 1,
            width: 5, height: 5,
            background: pal.goal,
          }} />
        </div>

        {/* Feedback overlay */}
        {(done || timedOut) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className="text-center">
              <p className={`text-2xl font-black ${done ? "text-green-400" : "text-red-400"}`}>
                {done ? "🎉 Saída!" : "⏰ Tempo!"}
              </p>
              <p className="text-sm text-gray-300 mt-1">{moves} movimentos · {elapsed}s</p>
            </div>
          </div>
        )}
      </div>

      {/* D-pad */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 56px)", gridTemplateRows: "repeat(3, 56px)" }}>
        <div />
        <button className={btnBase} style={{ height: 56 }} onPointerDown={(e) => { e.preventDefault(); move("N"); }}>↑</button>
        <div />
        <button className={btnBase} style={{ height: 56 }} onPointerDown={(e) => { e.preventDefault(); move("W"); }}>←</button>
        <div className={`rounded-xl ${theme === "GAMIFIED" ? "bg-gray-800" : "bg-black/20"}`} />
        <button className={btnBase} style={{ height: 56 }} onPointerDown={(e) => { e.preventDefault(); move("E"); }}>→</button>
        <div />
        <button className={btnBase} style={{ height: 56 }} onPointerDown={(e) => { e.preventDefault(); move("S"); }}>↓</button>
        <div />
      </div>

      <p className="text-xs text-white/30 mt-3">↑↓←→ ou WASD</p>
    </div>
  );
}
