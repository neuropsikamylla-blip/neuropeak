"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
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
function generateMaze(size: number, loops: number = 0): Cell[][] {
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

  // Add extra openings to create misleading loops / false routes
  if (loops > 0) {
    const wallDirs = [
      { dr: 0, dc: 1, w: "E" as const, o: "W" as const },
      { dr: 1, dc: 0, w: "S" as const, o: "N" as const },
    ];
    let added = 0;
    const attempts = loops * 30;
    for (let t = 0; t < attempts && added < loops; t++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const { dr, dc, w, o } = wallDirs[Math.floor(Math.random() * wallDirs.length)];
      const nr = r + dr;
      const nc = c + dc;
      if (nr < size && nc < size && grid[r][c][w]) {
        grid[r][c][w] = false;
        grid[nr][nc][o] = false;
        added++;
      }
    }
  }

  return grid;
}

function mazeLoops(difficulty: number, size: number): number {
  // Mais loops = mais corredores/becos sem saída = mais difícil achar a saída certa.
  // Reforçado (estava fácil demais): mais rotas falsas em todos os níveis.
  const base = Math.max(5, Math.floor((size * size) / 10));
  if (difficulty <= 2) return Math.round(base * 1.5);
  if (difficulty <= 4) return Math.round(base * 2.5);
  if (difficulty <= 6) return base * 4;
  if (difficulty <= 8) return base * 5;
  return base * 7;
}

function decoyCount(difficulty: number): number {
  // Saídas-isca (caminhos que parecem a saída mas não são). Reforçado.
  if (difficulty <= 3) return 6;
  if (difficulty <= 6) return 9;
  return 13;
}

// BFS para encontrar o caminho mais curto; retorna o conjunto de células no caminho
function findSolutionPath(
  maze: Cell[][],
  from: { r: number; c: number },
  to: { r: number; c: number }
): Set<string> {
  const size = maze.length;
  const queue: Array<{ r: number; c: number; path: string[] }> = [
    { r: from.r, c: from.c, path: [cellKey(from.r, from.c)] },
  ];
  const visited = new Set([cellKey(from.r, from.c)]);
  const dirMap = [
    { dr: -1, dc: 0, w: "N" as const },
    { dr:  1, dc: 0, w: "S" as const },
    { dr:  0, dc: 1, w: "E" as const },
    { dr:  0, dc:-1, w: "W" as const },
  ];
  while (queue.length > 0) {
    const { r, c, path } = queue.shift()!;
    if (r === to.r && c === to.c) return new Set(path);
    for (const { dr, dc, w } of dirMap) {
      const nr = r + dr;
      const nc = c + dc;
      const k = cellKey(nr, nc);
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited.has(k) && !maze[r][c][w]) {
        visited.add(k);
        queue.push({ r: nr, c: nc, path: [...path, k] });
      }
    }
  }
  return new Set();
}

// Place the single true exit on the border, then add internal dead-end corridors
// near the border to confuse — these look promising but never reach the exit.
function generateBorderExits(
  maze: Cell[][],
  size: number,
  decoyCount: number
): { trueExit: { r: number; c: number } } {
  // All bottom-row and right-column border cells (excluding start 0,0)
  const pool: { r: number; c: number }[] = [];
  for (let c = 0; c < size; c++) pool.push({ r: size - 1, c });
  for (let r = 0; r < size - 1; r++) pool.push({ r, c: size - 1 });
  const filtered = pool.filter((p) => !(p.r === 0 && p.c === 0));
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }
  const trueExit = filtered[0];

  // Add decoy dead-end corridors: open walls in the second-to-last row/col
  // so long corridors run alongside the border but never reach the exit cell.
  const decoyDirs: { dr: number; dc: number; w: "N" | "S" | "E" | "W"; o: "N" | "S" | "E" | "W" }[] = [
    { dr: 0, dc: 1, w: "E", o: "W" },
    { dr: 1, dc: 0, w: "S", o: "N" },
    { dr: 0, dc: -1, w: "W", o: "E" },
  ];
  let added = 0;
  for (let attempt = 0; attempt < decoyCount * 20 && added < decoyCount; attempt++) {
    // Pick a cell near (but not on) the border, not adjacent to the true exit
    const r = 1 + Math.floor(Math.random() * (size - 3));
    const c = 1 + Math.floor(Math.random() * (size - 3));
    const distToExit = Math.abs(r - trueExit.r) + Math.abs(c - trueExit.c);
    if (distToExit < 3) continue;
    const { dr, dc, w, o } = decoyDirs[Math.floor(Math.random() * decoyDirs.length)];
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && maze[r][c][w]) {
      maze[r][c][w] = false;
      maze[nr][nc][o] = false;
      added++;
    }
  }

  return { trueExit };
}

// ── Planejamento: menor caminho, perfis e métricas ──────────────────────────
type Tier = "facil" | "medio" | "dificil" | "avancado";
function tierOf(d: number): Tier {
  return d <= 2 ? "facil" : d <= 5 ? "medio" : d <= 8 ? "dificil" : "avancado";
}
// Limite de movimentos = menorCaminho × multiplicador do perfil.
const MOVE_MULT: Record<Tier, number> = { facil: 2.5, medio: 1.8, dificil: 1.35, avancado: 1.15 };
const TIER_LABEL: Record<Tier, string> = { facil: "Fácil", medio: "Médio", dificil: "Difícil", avancado: "Avançado" };

// nº de MOVIMENTOS no menor caminho (células-1); -1 se inalcançável.
function bfsMoves(maze: Cell[][], from: { r: number; c: number }, to: { r: number; c: number }): number {
  const size = maze.length;
  const dist = new Map<string, number>([[cellKey(from.r, from.c), 0]]);
  const queue = [from];
  const dirMap = [
    { dr: -1, dc: 0, w: "N" as const }, { dr: 1, dc: 0, w: "S" as const },
    { dr: 0, dc: 1, w: "E" as const }, { dr: 0, dc: -1, w: "W" as const },
  ];
  while (queue.length) {
    const { r, c } = queue.shift()!;
    const d = dist.get(cellKey(r, c))!;
    if (r === to.r && c === to.c) return d;
    for (const { dr, dc, w } of dirMap) {
      const nr = r + dr, nc = c + dc, k = cellKey(nr, nc);
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !dist.has(k) && !maze[r][c][w]) {
        dist.set(k, d + 1); queue.push({ r: nr, c: nc });
      }
    }
  }
  return -1;
}

// Beco sem saída = célula com 1 só passagem aberta (3 paredes).
function openPassages(cell: Cell): number {
  return (cell.N ? 0 : 1) + (cell.S ? 0 : 1) + (cell.E ? 0 : 1) + (cell.W ? 0 : 1);
}

interface MazeMetrics {
  moves: number; shortest: number; extraMoves: number; efficiency: number;
  deadEnds: number; returns: number; repeated: number; wallHits: number;
  overLimit: boolean; solved: boolean; seconds: number;
}
function effLabel(eff: number): { txt: string; color: string } {
  if (eff >= 0.9) return { txt: "Excelente planejamento", color: "#22c55e" };
  if (eff >= 0.7) return { txt: "Bom", color: "#84cc16" };
  if (eff >= 0.5) return { txt: "Regular", color: "#f59e0b" };
  return { txt: "Muita tentativa e erro", color: "#ef4444" };
}
function mazeScore(m: MazeMetrics): number {
  let s = 1000;
  s -= m.extraMoves * 3;
  s -= m.deadEnds * 50;
  s -= m.returns * 20;
  s -= m.repeated * 10;
  s -= m.wallHits * 25;
  if (m.efficiency >= 0.9) s += 200; else if (m.efficiency >= 0.7) s += 100;
  if (m.deadEnds === 0 && m.returns === 0 && m.solved) s += 150;  // bônus sem erro
  if (!m.solved) s = Math.round(s * 0.4);                          // não chegou: corta forte
  return Math.max(0, Math.round(s));
}

// ── Configuration ──────────────────────────────────────────────────────────
const SIZE_STEPS = [15, 19, 23, 27, 31, 35];
const TIME_LIMITS: Record<number, number> = {
  15: 150,
  19: 210,
  23: 270,
  27: 330,
  31: 420,
  35: 520,
};
const MIN_IDX = 0;
const MAX_IDX = SIZE_STEPS.length - 1;

function initialIdx(difficulty: number) {
  // Começa um passo maior (estava fácil demais): nível 1 já é 19×19, não 15×15.
  return Math.min(Math.max(0, Math.floor((difficulty - 1) * MAX_IDX / 9) + 1), MAX_IDX);
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
  trueExit: { r: number; c: number };
}

function MazeGrid({
  maze,
  player,
  explored,
  flashCell,
  theme,
  containerPx,
  onCellClick,
  trueExit,
}: MazeGridProps) {
  const pal = PALETTES[theme];
  const size = maze.length;
  const cellPx = Math.floor(containerPx / size);
  const wallPx = 1;

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
          const isGoalCell = r === trueExit.r && c === trueExit.c;
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

  const containerPx = 260;
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
        trueExit={{ r: 4, c: 4 }}
      />
      <p
        className="text-sm text-center leading-snug"
        style={{
          color: theme === "GAMIFIED" ? "#9ca3af" : "#4b5563",
          maxWidth: 240,
        }}
      >
        Existe apenas UMA saída 🏁. Muitos caminhos parecem levar lá, mas são becos sem saída — analise o labirinto antes de sair correndo!
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

  const containerPx = 260;
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
        trueExit={{ r: 4, c: 4 }}
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
        "Existe apenas UMA saída 🏁. Muitos corredores parecem prometer saída mas são becos sem saída. Pare, analise e pense antes de avançar!",
      content: (onStepDone: () => void) => (
        <TutorialShowStep theme={theme} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Toque nas células ao lado do jogador para se mover. Experimente!",
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
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
  const pal = PALETTES[theme];

  const [sizeIdx, setSizeIdx] = useState(() => initialIdx(difficulty));
  const [mazeNum, setMazeNum] = useState(0);
  const [mazeResults, setMazeResults] = useState<{ correct: boolean; size: number }[]>(
    []
  );

  const size = SIZE_STEPS[sizeIdx];
  const timeLimit = TIME_LIMITS[size] ?? 120;

  const tier = tierOf(difficulty);
  const [mazeInitState] = useState(() => {
    const idx = initialIdx(difficulty);
    const sz = SIZE_STEPS[idx];
    const grid = generateMaze(sz, mazeLoops(difficulty, sz));
    const exits = generateBorderExits(grid, sz, decoyCount(difficulty));
    const shortest = Math.max(1, bfsMoves(grid, { r: 0, c: 0 }, exits.trueExit));
    return { maze: grid, trueExit: exits.trueExit, shortest, moveLimit: Math.ceil(shortest * MOVE_MULT[tier]) };
  });
  const [maze, setMaze] = useState<Cell[][]>(mazeInitState.maze);
  const [trueExit, setTrueExit] = useState<{ r: number; c: number }>(mazeInitState.trueExit);
  const [moveLimit, setMoveLimit] = useState(mazeInitState.moveLimit);
  const [report, setReport] = useState<MazeMetrics | null>(null);   // relatório do labirinto atual
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
  const trueExitRef = useRef(trueExit);
  const doneRef = useRef(false);
  const timedOutRef = useRef(false);
  // Keep refs for closure access in finishMaze
  const mazeResultsRef = useRef(mazeResults);
  const mazeNumRef = useRef(mazeNum);
  const sizeIdxRef = useRef(sizeIdx);
  const sizeRef = useRef(size);
  const elapsedRef = useRef(elapsed);
  const timeLimitRef = useRef(timeLimit);
  // Planejamento: menor caminho, limite e métricas de tentativa-e-erro do labirinto atual.
  const shortestRef = useRef(mazeInitState.shortest);
  const moveLimitRef = useRef(mazeInitState.moveLimit);
  const wallHitsRef = useRef(0);
  const repeatedRef = useRef(0);
  const returnsRef = useRef(0);
  const deadEndsRef = useRef<Set<string>>(new Set());
  const visitedRef = useRef<Set<string>>(new Set([cellKey(0, 0)]));
  const prevCellRef = useRef<string | null>(null);
  const movesRef = useRef(0);
  const reportShownRef = useRef(false);               // evita gerar relatório 2x (saída + tempo)
  const mazeMetricsRef = useRef<MazeMetrics[]>([]);   // métricas de todos os labirintos da sessão

  moveLimitRef.current = moveLimit;
  mazeRef.current = maze;
  trueExitRef.current = trueExit;
  playerRef.current = player;
  doneRef.current = done;
  timedOutRef.current = timedOut;
  mazeResultsRef.current = mazeResults;
  mazeNumRef.current = mazeNum;
  sizeIdxRef.current = sizeIdx;
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
  const containerPx = Math.min(windowWidth - 24, 600); // teto ampliado (era 480) — maior no tablet/desktop

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (showTutorial || done || timedOut) return;
    const t = setInterval(() => {
      setElapsed(Math.round((Date.now() - mazeStartTime.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [showTutorial, done, timedOut, mazeNum]);

  // ── finishMaze: gera o RELATÓRIO do labirinto (não avança sozinho) ──────────
  const finishMaze = useCallback(
    (isCorrect: boolean) => {
      if (allDoneRef.current || reportShownRef.current) return;
      reportShownRef.current = true;

      const shortest = shortestRef.current;
      const mv = movesRef.current;
      const eff = mv > 0 ? Math.min(1, shortest / mv) : 0;
      const m: MazeMetrics = {
        moves: mv, shortest, extraMoves: Math.max(0, mv - shortest), efficiency: eff,
        deadEnds: deadEndsRef.current.size, returns: returnsRef.current,
        repeated: repeatedRef.current, wallHits: wallHitsRef.current,
        overLimit: mv > moveLimitRef.current, solved: isCorrect, seconds: elapsedRef.current,
      };
      mazeMetricsRef.current = [...mazeMetricsRef.current, m];
      setMazeResults((prev) => [...prev, { correct: isCorrect, size: sizeRef.current }]);
      if (!isCorrect) { setTimedOut(true); timedOutRef.current = true; }
      setReport(m);
    },
    []
  );

  // ── advanceMaze: adaptação por DESEMPENHO + próximo labirinto (ou fim) ──────
  const advanceMaze = useCallback(() => {
    const all = mazeMetricsRef.current;
    const m = all[all.length - 1];
    const curSizeIdx = sizeIdxRef.current;
    const curMazeNum = mazeNumRef.current;
    // Sobe se planejou bem; desce se muito erro; senão mantém (spec).
    let nextIdx = curSizeIdx;
    if (m && m.solved && m.efficiency >= 0.85 && m.deadEnds <= 1 && m.extraMoves <= 0.1 * m.shortest) {
      nextIdx = Math.min(curSizeIdx + 1, MAX_IDX);
    } else if (!m || !m.solved || m.efficiency < 0.55 || m.deadEnds >= 4) {
      nextIdx = Math.max(curSizeIdx - 1, MIN_IDX);
    }
    const nextMaze = curMazeNum + 1;

    if (isTimeUp()) {
      allDoneRef.current = true;
      finish();
      const solvedCount = all.filter((x) => x.solved).length;
      const accuracy = all.length ? solvedCount / all.length : 0;
      const avgEff = all.length ? all.reduce((a, x) => a + x.efficiency, 0) / all.length : 0;
      const avgScore = all.length ? Math.round(all.reduce((a, x) => a + mazeScore(x), 0) / all.length) : 0;
      const duration = elapsedSec();
      onComplete({
        exerciseId: "labirinto", domain: "executive",
        score: Math.round(Math.min(100, avgScore / 10)), accuracy, difficulty, duration,
        metadata: {
          mazes: all.length, solved: solvedCount, progressionV2: true,
          accTotal: Number(accuracy.toFixed(3)), level: difficulty,
          avgEfficiency: Number((avgEff * 100).toFixed(1)), avgScore,
          totalDeadEnds: all.reduce((a, x) => a + x.deadEnds, 0),
          totalReturns: all.reduce((a, x) => a + x.returns, 0),
          totalWallHits: all.reduce((a, x) => a + x.wallHits, 0),
          totalExtraMoves: all.reduce((a, x) => a + x.extraMoves, 0),
        },
      });
      return;
    }

    const nextSize = SIZE_STEPS[nextIdx];
    const grid = generateMaze(nextSize, mazeLoops(difficulty, nextSize));
    const exits = generateBorderExits(grid, nextSize, decoyCount(difficulty));
    const shortest = Math.max(1, bfsMoves(grid, { r: 0, c: 0 }, exits.trueExit));
    const limit = Math.ceil(shortest * MOVE_MULT[tier]);
    setMazeNum(nextMaze); setSizeIdx(nextIdx);
    setMaze(grid); setTrueExit(exits.trueExit); setMoveLimit(limit);
    shortestRef.current = shortest; moveLimitRef.current = limit;
    setPlayer({ r: 0, c: 0 }); playerRef.current = { r: 0, c: 0 };
    setExplored(new Set([cellKey(0, 0)]));
    setMoves(0); setElapsed(0); setDone(false); setTimedOut(false);
    doneRef.current = false; timedOutRef.current = false; reportShownRef.current = false;
    wallHitsRef.current = 0; repeatedRef.current = 0; returnsRef.current = 0;
    deadEndsRef.current = new Set(); visitedRef.current = new Set([cellKey(0, 0)]);
    prevCellRef.current = null; movesRef.current = 0;
    setReport(null);
    mazeStartTime.current = Date.now();
  }, [difficulty, onComplete, tier]);

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
        // Parede — pisca a célula alvo + conta colisão (tentativa-e-erro).
        const k = cellKey(targetR, targetC);
        wallHitsRef.current++;
        setFlashCell(k);
        setTimeout(() => setFlashCell(null), 200);
        return;
      }

      const curKey = cellKey(r, c);
      const newKey = cellKey(targetR, targetC);
      // Métricas de planejamento:
      if (prevCellRef.current === newKey) returnsRef.current++;          // voltou de onde veio
      if (visitedRef.current.has(newKey)) repeatedRef.current++;         // célula já visitada
      const te = trueExitRef.current;
      if (openPassages(g[targetR][targetC]) <= 1 && !(targetR === te.r && targetC === te.c)) {
        deadEndsRef.current.add(newKey);                                 // entrou num beco sem saída
      }
      prevCellRef.current = curKey;
      visitedRef.current.add(newKey);
      movesRef.current++;

      const newPos = { r: targetR, c: targetC };
      setPlayer(newPos);
      playerRef.current = newPos;
      setMoves((m) => m + 1);
      setExplored((prev) => new Set([...prev, newKey]));

      if (targetR === te.r && targetC === te.c) {
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
    return <LabirintoTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;
  }

  const timeRatio = elapsed / timeLimit;
  const timeColor =
    timeRatio > 0.8 ? "#ef4444" : timeRatio > 0.6 ? "#f97316" : theme === "GAMIFIED" ? "#9ca3af" : "#6b7280";
  const moveRatio = moveLimit > 0 ? moves / moveLimit : 0;
  const moveColor = moves > moveLimit ? "#ef4444" : moveRatio >= 0.85 ? "#f97316" : "#34d399";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 pt-4"
      style={{ background: pal.pageBg }}
    >
      {/* Header */}
      <div
        className="w-full max-w-[600px] rounded-2xl px-4 py-3 mb-4"
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
              Labirinto · {size}×{size}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums" style={{ color: moveColor }}>
              {moves}/{moveLimit} mov.
            </p>
            <p className="text-[11px] tabular-nums" style={{ color: timeColor }}>{elapsed}s / {timeLimit}s</p>
          </div>
        </div>
        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
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
          trueExit={trueExit}
        />

        {/* Relatório do labirinto */}
        {report && (() => {
          const el = effLabel(report.efficiency);
          const sc = mazeScore(report);
          const rec = !report.solved ? "Tente planejar a rota antes de andar — observe o caminho inteiro."
            : report.efficiency >= 0.85 ? "Ótimo planejamento! O próximo será mais difícil."
            : report.deadEnds >= 3 ? "Evite os becos: trace o caminho com o olho antes de mover."
            : report.efficiency < 0.6 ? "Muitos movimentos extras — planeje a rota mais curta."
            : "Bom! Tente usar ainda menos movimentos.";
          const last = isTimeUp();
          const Row = ({ k, v, warn }: { k: string; v: string | number; warn?: boolean }) => (
            <div className="flex justify-between" style={{ fontSize: 12.5 }}>
              <span style={{ color: "#9ca3af" }}>{k}</span>
              <span className="font-bold tabular-nums" style={{ color: warn ? "#fca5a5" : "#e5e7eb" }}>{v}</span>
            </div>
          );
          return (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl p-3" style={{ background: "rgba(8,12,24,0.92)", overflowY: "auto" }}>
              <div className="w-full max-w-[300px] text-left">
                <p className="text-2xl font-black text-center" style={{ color: report.solved ? "#4ade80" : "#f87171" }}>
                  {report.solved ? "🎉 Saída!" : "⏰ Tempo!"}
                </p>
                <div className="text-center my-2">
                  <div className="text-4xl font-black tabular-nums" style={{ color: el.color }}>{Math.round(report.efficiency * 100)}%</div>
                  <div className="text-xs font-bold" style={{ color: el.color }}>{el.txt}</div>
                </div>
                <div className="space-y-1 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Row k="Movimentos" v={`${report.moves} (mínimo ${report.shortest})`} warn={report.overLimit} />
                  <Row k="Movimentos extras" v={report.extraMoves} warn={report.extraMoves > report.shortest} />
                  <Row k="Becos sem saída" v={report.deadEnds} warn={report.deadEnds >= 3} />
                  <Row k="Retornos" v={report.returns} />
                  <Row k="Células repetidas" v={report.repeated} />
                  <Row k="Colisões na parede" v={report.wallHits} />
                  {report.overLimit && <Row k="⚠️ Passou do limite" v={`${moveLimit} mov.`} warn />}
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs" style={{ color: "#9ca3af" }}>Pontuação</span>
                  <span className="text-xl font-black tabular-nums" style={{ color: "#fbbf24" }}>{sc}</span>
                </div>
                <p className="text-[11px] text-center mt-2 mb-3" style={{ color: "#cbd5e1", lineHeight: 1.35 }}>{rec}</p>
                <button onClick={advanceMaze}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff" }}>
                  {last ? "Ver resultado →" : "Próximo labirinto →"}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* D-pad controls */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <button
          onPointerDown={() => moveByDir("N")}
          className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: pal.headerBg, border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
        >▲</button>
        <div className="flex gap-1">
          <button
            onPointerDown={() => moveByDir("W")}
            className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: pal.headerBg, border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
          >◀</button>
          <div className="w-14 h-14" />
          <button
            onPointerDown={() => moveByDir("E")}
            className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: pal.headerBg, border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
          >▶</button>
        </div>
        <button
          onPointerDown={() => moveByDir("S")}
          className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: pal.headerBg, border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
        >▼</button>
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
