"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface LabirintoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Cell {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
}

// ── Maze generation (recursive DFS, perfect maze) ──────────────────────────
function generateMaze(size: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ N: true, S: true, E: true, W: true }))
  );
  const vis = Array.from({ length: size }, () => new Array(size).fill(false));

  function dfs(r: number, c: number) {
    vis[r][c] = true;
    const dirs = [
      { dr: -1, dc: 0, w: "N" as const, o: "S" as const },
      { dr: 1, dc: 0, w: "S" as const, o: "N" as const },
      { dr: 0, dc: 1, w: "E" as const, o: "W" as const },
      { dr: 0, dc: -1, w: "W" as const, o: "E" as const },
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const { dr, dc, w, o } of dirs) {
      const nr = r + dr;
      const nc = c + dc;
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

// ── Configuration ──────────────────────────────────────────────────────────
const SIZE_STEPS = [6, 7, 8, 9, 10, 11];
const TIME_LIMITS: Record<number, number> = {
  6: 60,
  7: 75,
  8: 95,
  9: 120,
  10: 150,
  11: 185,
};
const MAX_MAZES = 10;
const MIN_IDX = 0;
const MAX_IDX = SIZE_STEPS.length - 1;

function initialIdx(difficulty: number) {
  return Math.min(Math.max(0, Math.floor((difficulty - 1) / 2)), MAX_IDX);
}

function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

// ── Theme palettes ─────────────────────────────────────────────────────────
const PALETTES = {
  CLINICAL: {
    bg: "#f3f4f6",
    wall: "#374151",
    floor: "#ffffff",
    trail: "#dbeafe",
    player: "#3b82f6",
    goal: "#dcfce7",
    goalText: "#166534",
    pageBg: "#1f2937",
    headerBg: "rgba(0,0,0,0.3)",
    flashRed: "#fca5a5",
  },
  COLORFUL: {
    bg: "#faf5ff",
    wall: "#4c1d95",
    floor: "#fdf4ff",
    trail: "#ede9fe",
    player: "#ec4899",
    goal: "#fef3c7",
    goalText: "#92400e",
    pageBg: "#1e1b4b",
    headerBg: "rgba(0,0,0,0.25)",
    flashRed: "#fca5a5",
  },
  GAMIFIED: {
    bg: "#0f172a",
    wall: "#94a3b8",
    floor: "#1e293b",
    trail: "#1e3a5f",
    player: "#22d3ee",
    goal: "#064e3b",
    goalText: "#34d399",
    pageBg: "#030712",
    headerBg: "rgba(0,0,0,0.5)",
    flashRed: "#7f1d1d",
  },
};

// ── Tutorial maze (5x5 with a clear path) ─────────────────────────────────
function makeTutorialMaze(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ N: true, S: true, E: true, W: true }))
  );
  const passages: [number, number, "N" | "S" | "E" | "W", "N" | "S" | "E" | "W"][] = [
    [0, 0, "E", "W"], [0, 1, "E", "W"], [0, 2, "E", "W"], [0, 3, "E", "W"],
    [0, 4, "S", "N"], [1, 4, "S", "N"], [2, 4, "S", "N"], [3, 4, "S", "N"],
    [3, 3, "W", "E"], [3, 2, "W", "E"], [3, 2, "S", "N"],
    [4, 2, "E", "W"], [4, 3, "E", "W"],
    [3, 0, "S", "N"], [2, 0, "S", "N"], [1, 0, "S", "N"],
    [1, 0, "E", "W"], [1, 1, "E", "W"], [1, 2, "E", "W"], [1, 2, "S", "N"],
    [2, 2, "E", "W"], [2, 3, "S", "N"],
    [4, 4, "N", "S"],
  ];
  for (const [r, c, w, o] of passages) {
    const dr = w === "N" ? -1 : w === "S" ? 1 : 0;
    const dc = w === "E" ? 1 : w === "W" ? -1 : 0;
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      grid[r][c][w] = false;
      grid[nr][nc][o] = false;
    }
  }
  return grid;
}

const TUTORIAL_MAZE = makeTutorialMaze();

// ── Maze grid rendered with CSS divs ──────────────────────────────────────
interface MazeGridProps {
  maze: Cell[][];
  player: { r: number; c: number };
  explored: Set<string>;
  flashCell: string | null;
  theme: Theme;
  containerPx: number;
  onCellClick: (r: number, c: number) => void;
  isGoal?: (r: number, c: number) => boolean;
}

function MazeGrid({
  maze,
  player,
  explored,
  flashCell,
  theme,
  containerPx,
  onCellClick,
  isGoal,
}: MazeGridProps) {
  const pal = PALETTES[theme];
  const size = maze.length;
  const cellPx = Math.floor(containerPx / size);
  const wallPx = 2;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${size}, ${cellPx}px)`,
        width: cellPx * size,
        height: cellPx * size,
        background: pal.wall,
        borderRadius: 8,
        overflow: "hidden",
        border: `${wallPx}px solid ${pal.wall}`,
        boxSizing: "border-box",
      }}
    >
      {maze.map((row, r) =>
        row.map((cell, c) => {
          const isPlayer = player.r === r && player.c === c;
          const isGoalCell = isGoal ? isGoal(r, c) : r === size - 1 && c === size - 1;
          const isExplored = explored.has(cellKey(r, c));
          const isFlashing = flashCell === cellKey(r, c);

          let bg = pal.floor;
          if (isFlashing) {
            bg = pal.flashRed;
          } else if (isGoalCell) {
            bg = pal.goal;
          } else if (isExplored) {
            bg = pal.trail;
          }

          return (
            <div
              key={cellKey(r, c)}
              onClick={() => onCellClick(r, c)}
              style={{
                width: cellPx,
                height: cellPx,
                background: bg,
                boxSizing: "border-box",
                borderTop: cell.N ? `${wallPx}px solid ${pal.wall}` : "none",
                borderRight: cell.E ? `${wallPx}px solid ${pal.wall}` : "none",
                borderBottom: cell.S ? `${wallPx}px solid ${pal.wall}` : "none",
                borderLeft: cell.W ? `${wallPx}px solid ${pal.wall}` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
            >
              {isGoalCell && !isPlayer && (
                <span
                  style={{
                    fontSize: Math.max(10, cellPx * 0.5),
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  🏁
                </span>
              )}
              {isPlayer && (
                <div
                  style={{
                    width: cellPx * 0.55,
                    height: cellPx * 0.55,
                    borderRadius: "50%",
                    background: pal.player,
                    boxShadow: `0 0 ${cellPx * 0.3}px ${pal.player}88`,
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Tutorial step 1: static display ───────────────────────────────────────
function TutorialShowStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerPx = 200;
  const playerPos = { r: 0, c: 0 };
  const explored = new Set([cellKey(0, 0)]);

  return (
    <div className="flex flex-col items-center gap-3">
      <MazeGrid
        maze={TUTORIAL_MAZE}
        player={playerPos}
        explored={explored}
        flashCell={null}
        theme={theme}
        containerPx={containerPx}
        onCellClick={() => undefined}
        isGoal={(r, c) => r === 4 && c === 4}
      />
      <p
        className="text-sm text-center leading-snug"
        style={{
          color: theme === "GAMIFIED" ? "#9ca3af" : "#4b5563",
          maxWidth: 220,
        }}
      >
        O labirinto inteiro aparece na tela. Toque nas células ao lado do jogador para se mover.
      </p>
    </div>
  );
}

// ── Tutorial step 2: interactive practice ─────────────────────────────────
function TutorialInteractStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [explored, setExplored] = useState<Set<string>>(() => new Set([cellKey(0, 0)]));
  const [flashCell, setFlashCell] = useState<string | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const doneRef = useRef(false);
  const playerRef = useRef({ r: 0, c: 0 });
  playerRef.current = player;

  const containerPx = 200;
  const size = 5;

  const tryMove = useCallback(
    (targetR: number, targetC: number) => {
      if (doneRef.current) return;
      const { r, c } = playerRef.current;
      const dr = targetR - r;
      const dc = targetC - c;

      const isAdjacent =
        (Math.abs(dr) === 1 && dc === 0) || (Math.abs(dc) === 1 && dr === 0);
      if (!isAdjacent) return;

      const dir: "N" | "S" | "E" | "W" =
        dr === -1 ? "N" : dr === 1 ? "S" : dc === 1 ? "E" : "W";

      if (TUTORIAL_MAZE[r][c][dir]) {
        // Wall — flash red
        const k = cellKey(targetR, targetC);
        setFlashCell(k);
        setTimeout(() => setFlashCell(null), 200);
        return;
      }

      const newPos = { r: targetR, c: targetC };
      setPlayer(newPos);
      playerRef.current = newPos;
      setExplored((prev) => new Set([...prev, cellKey(targetR, targetC)]));

      const newCount = moveCount + 1;
      setMoveCount(newCount);

      if ((targetR === size - 1 && targetC === size - 1) || newCount >= 3) {
        doneRef.current = true;
        setTimeout(onDone, 500);
      }
    },
    [moveCount, onDone]
  );

  const moveByDir = useCallback(
    (dir: "N" | "S" | "E" | "W") => {
      const { r, c } = playerRef.current;
      const dr = dir === "N" ? -1 : dir === "S" ? 1 : 0;
      const dc = dir === "E" ? 1 : dir === "W" ? -1 : 0;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        tryMove(nr, nc);
      }
    },
    [tryMove]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "N" | "S" | "E" | "W"> = {
        ArrowUp: "N",
        ArrowDown: "S",
        ArrowRight: "E",
        ArrowLeft: "W",
        w: "N",
        s: "S",
        d: "E",
        a: "W",
      };
      if (map[e.key]) {
        e.preventDefault();
        moveByDir(map[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveByDir]);

  return (
    <div className="flex flex-col items-center gap-3">
      <MazeGrid
        maze={TUTORIAL_MAZE}
        player={player}
        explored={explored}
        flashCell={flashCell}
        theme={theme}
        containerPx={containerPx}
        onCellClick={tryMove}
        isGoal={(r, c) => r === 4 && c === 4}
      />
      <p
        className="text-xs text-center"
        style={{ color: theme === "GAMIFIED" ? "#9ca3af" : "#6b7280" }}
      >
        Toque nas células ao lado do jogador para se mover
      </p>
    </div>
  );
}

// ── Tutorial wrapper ───────────────────────────────────────────────────────
function LabirintoTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction:
        "O labirinto inteiro aparece na tela. Toque nas células ao lado do jogador para se mover.",
      content: (onStepDone: () => void) => (
        <TutorialShowStep theme={theme} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Experimente! Mova ao menos 3 células para continuar.",
      content: (onStepDone: () => void) => (
        <TutorialInteractStep theme={theme} onDone={onStepDone} />
      ),
    },
  ];

  return (
    <TutorialBase theme={theme} title="Labirinto" steps={steps} onDone={onDone} />
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const pal = PALETTES[theme];

  const [sizeIdx, setSizeIdx] = useState(() => initialIdx(difficulty));
  const [streak, setStreak] = useState(0);
  const [mazeNum, setMazeNum] = useState(0);
  const [mazeResults, setMazeResults] = useState<{ correct: boolean; size: number }[]>(
    []
  );

  const size = SIZE_STEPS[sizeIdx];
  const timeLimit = TIME_LIMITS[size] ?? 120;

  const [maze, setMaze] = useState<Cell[][]>(() =>
    generateMaze(SIZE_STEPS[initialIdx(difficulty)])
  );
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [explored, setExplored] = useState<Set<string>>(
    () => new Set([cellKey(0, 0)])
  );
  const [flashCell, setFlashCell] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const startTime = useRef(Date.now());
  const mazeStartTime = useRef(Date.now());
  const allDoneRef = useRef(false);
  const playerRef = useRef({ r: 0, c: 0 });
  const mazeRef = useRef(maze);
  const doneRef = useRef(false);
  const timedOutRef = useRef(false);
  // Keep refs for closure access in finishMaze
  const mazeResultsRef = useRef(mazeResults);
  const mazeNumRef = useRef(mazeNum);
  const sizeIdxRef = useRef(sizeIdx);
  const streakRef = useRef(streak);
  const sizeRef = useRef(size);
  const elapsedRef = useRef(elapsed);
  const timeLimitRef = useRef(timeLimit);

  mazeRef.current = maze;
  playerRef.current = player;
  doneRef.current = done;
  timedOutRef.current = timedOut;
  mazeResultsRef.current = mazeResults;
  mazeNumRef.current = mazeNum;
  sizeIdxRef.current = sizeIdx;
  streakRef.current = streak;
  sizeRef.current = size;
  elapsedRef.current = elapsed;
  timeLimitRef.current = timeLimit;

  // ── Container size ──────────────────────────────────────────────────────
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 375
  );
  useEffect(() => {
    function onResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const containerPx = Math.min(320, windowWidth - 32);

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (showTutorial || done || timedOut) return;
    const t = setInterval(() => {
      setElapsed(Math.round((Date.now() - mazeStartTime.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [showTutorial, done, timedOut, mazeNum]);

  // ── finishMaze ──────────────────────────────────────────────────────────
  const finishMaze = useCallback(
    (isCorrect: boolean) => {
      if (allDoneRef.current) return;

      const curMazeResults = mazeResultsRef.current;
      const curMazeNum = mazeNumRef.current;
      const curSizeIdx = sizeIdxRef.current;
      const curStreak = streakRef.current;
      const curSize = sizeRef.current;
      const curElapsed = elapsedRef.current;
      const curTimeLimit = timeLimitRef.current;

      const newResults = [...curMazeResults, { correct: isCorrect, size: curSize }];
      setMazeResults(newResults);

      const newStreak = isCorrect
        ? Math.max(curStreak, 0) + 1
        : Math.min(curStreak, 0) - 1;

      let nextIdx = curSizeIdx;
      let nextStreak = newStreak;
      if (newStreak >= 2) {
        nextIdx = Math.min(curSizeIdx + 1, MAX_IDX);
        nextStreak = 0;
      }
      if (newStreak <= -2) {
        nextIdx = Math.max(curSizeIdx - 1, MIN_IDX);
        nextStreak = 0;
      }

      const nextMaze = curMazeNum + 1;
      reportProgress(Math.round((nextMaze / MAX_MAZES) * 100));

      if (!isCorrect && curElapsed < curTimeLimit) {
        // timed out
        setTimedOut(true);
        timedOutRef.current = true;
      }

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
            metadata: {
              mazes: MAX_MAZES,
              maxSize,
              correct: newResults.filter((r) => r.correct).length,
            },
          });
        } else {
          const nextSize = SIZE_STEPS[nextIdx];
          const nextMazeGrid = generateMaze(nextSize);
          setMazeNum(nextMaze);
          setStreak(nextStreak);
          setSizeIdx(nextIdx);
          setMaze(nextMazeGrid);
          setPlayer({ r: 0, c: 0 });
          playerRef.current = { r: 0, c: 0 };
          setExplored(new Set([cellKey(0, 0)]));
          setMoves(0);
          setElapsed(0);
          setDone(false);
          setTimedOut(false);
          doneRef.current = false;
          timedOutRef.current = false;
          mazeStartTime.current = Date.now();
        }
      }, 1800);
    },
    [difficulty, onComplete, reportProgress]
  );

  // ── Timeout check ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!done && !timedOut && elapsed > 0 && elapsed >= timeLimit) {
      finishMaze(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // ── Try move to adjacent cell ───────────────────────────────────────────
  const tryMove = useCallback(
    (targetR: number, targetC: number) => {
      if (doneRef.current || timedOutRef.current) return;
      const { r, c } = playerRef.current;
      const dr = targetR - r;
      const dc = targetC - c;

      const isAdjacent =
        (Math.abs(dr) === 1 && dc === 0) || (Math.abs(dc) === 1 && dr === 0);
      if (!isAdjacent) return;

      const dir: "N" | "S" | "E" | "W" =
        dr === -1 ? "N" : dr === 1 ? "S" : dc === 1 ? "E" : "W";

      const g = mazeRef.current;
      if (!g.length) return;

      if (g[r][c][dir]) {
        // Wall — flash the target cell red
        const k = cellKey(targetR, targetC);
        setFlashCell(k);
        setTimeout(() => setFlashCell(null), 200);
        return;
      }

      const newPos = { r: targetR, c: targetC };
      setPlayer(newPos);
      playerRef.current = newPos;
      setMoves((m) => m + 1);
      setExplored((prev) => new Set([...prev, cellKey(targetR, targetC)]));

      const curSize = sizeRef.current;
      if (targetR === curSize - 1 && targetC === curSize - 1) {
        setDone(true);
        doneRef.current = true;
        finishMaze(true);
      }
    },
    [finishMaze]
  );

  const moveByDir = useCallback(
    (dir: "N" | "S" | "E" | "W") => {
      const { r, c } = playerRef.current;
      const dr = dir === "N" ? -1 : dir === "S" ? 1 : 0;
      const dc = dir === "E" ? 1 : dir === "W" ? -1 : 0;
      const curSize = sizeRef.current;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < curSize && nc >= 0 && nc < curSize) {
        tryMove(nr, nc);
      }
    },
    [tryMove]
  );

  // ── Keyboard support ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "N" | "S" | "E" | "W"> = {
        ArrowUp: "N",
        ArrowDown: "S",
        ArrowRight: "E",
        ArrowLeft: "W",
        w: "N",
        s: "S",
        d: "E",
        a: "W",
      };
      if (map[e.key]) {
        e.preventDefault();
        moveByDir(map[e.key]);
      }
    }
    if (!showTutorial) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [moveByDir, showTutorial]);

  // ── Swipe support ───────────────────────────────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipe = 20;
    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveByDir(dx > 0 ? "E" : "W");
    } else {
      moveByDir(dy > 0 ? "S" : "N");
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  if (showTutorial) {
    return <LabirintoTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const timeRatio = elapsed / timeLimit;
  const timeColor =
    timeRatio > 0.8 ? "#ef4444" : timeRatio > 0.6 ? "#f97316" : theme === "GAMIFIED" ? "#9ca3af" : "#6b7280";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: pal.pageBg }}
    >
      {/* Header */}
      <div
        className="w-full max-w-sm rounded-2xl px-4 py-3 mb-4"
        style={{
          background: pal.headerBg,
          border:
            theme === "GAMIFIED"
              ? "1px solid rgba(34,211,238,0.2)"
              : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2
              className="font-bold text-base"
              style={{
                color:
                  theme === "GAMIFIED"
                    ? "#22d3ee"
                    : theme === "COLORFUL"
                    ? "#c4b5fd"
                    : "#ffffff",
              }}
            >
              🌀 Labirinto
            </h2>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              {size}×{size} · {moves} mov.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums" style={{ color: timeColor }}>
              {elapsed}s / {timeLimit}s
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_MAZES }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background:
                  i < mazeResults.length
                    ? mazeResults[i].correct
                      ? "#22c55e"
                      : "#f87171"
                    : i === mazeNum
                    ? "#60a5fa"
                    : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Maze */}
      <div
        className="relative"
        style={{ touchAction: "none" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <MazeGrid
          maze={maze}
          player={player}
          explored={explored}
          flashCell={flashCell}
          theme={theme}
          containerPx={containerPx}
          onCellClick={tryMove}
        />

        {/* Result overlay */}
        {(done || timedOut) && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            <div className="text-center">
              <p
                className="text-3xl font-black"
                style={{ color: done ? "#4ade80" : "#f87171" }}
              >
                {done ? "🎉 Saída!" : "⏰ Tempo!"}
              </p>
              <p className="text-sm mt-1" style={{ color: "#d1d5db" }}>
                {moves} movimentos · {elapsed}s
              </p>
            </div>
          </div>
        )}
      </div>

      <p
        className="text-xs mt-4"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Toque na célula ao lado · swipe · ↑↓←→ · WASD
      </p>
    </div>
  );
}
