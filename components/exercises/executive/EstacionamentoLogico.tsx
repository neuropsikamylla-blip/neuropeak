"use client";

import { useState, useRef, useCallback } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ── Layout constants ──────────────────────────────────────────────────────────
const GRID = 6;
const CELL = 50;           // px per grid cell
const BORDER = 6;          // border/curb thickness px
const BOARD_PX = GRID * CELL; // 300px interior
const EXIT_ROW = 2;        // target car row (0-indexed)
const LANE_W = 30;         // exit lane extension in SVG

// ── Types ─────────────────────────────────────────────────────────────────────
interface Car {
  id: string;
  row: number;
  col: number;
  len: number;
  orientation: "horizontal" | "vertical";
  color: string;
}
interface Level {
  id: number;
  idealMoves: number;
  cars: Car[];
}
interface DragState {
  carId: string;
  axis: "horizontal" | "vertical";
  startPx: number;
  startPos: number;
  currentPos: number;
}

// ── Muted professional vehicle color palette ──────────────────────────────────
const VEH_HEX: Record<string, string> = {
  red:    "#C03030",
  teal:   "#3E6D7E",
  purple: "#5C5282",
  blue:   "#345A7C",
  yellow: "#6E6022",
  orange: "#7A5530",
  pink:   "#7A3D5C",
  indigo: "#363A6C",
  lime:   "#476230",
  slate:  "#525E6C",
};

// ── Puzzle levels (logic unchanged) ───────────────────────────────────────────
const ALL_LEVELS: Level[] = [
  {
    id: 1, idealMoves: 2,
    cars: [
      { id:"target", row:2, col:3, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:1, col:5, len:2, orientation:"vertical",   color:"teal" },
    ],
  },
  {
    id: 2, idealMoves: 3,
    cars: [
      { id:"target", row:2, col:1, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:3, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:1, col:4, len:2, orientation:"vertical",   color:"purple" },
    ],
  },
  {
    id: 3, idealMoves: 4,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"blue" },
      { id:"B",      row:3, col:1, len:2, orientation:"horizontal", color:"slate" },
      { id:"C",      row:1, col:4, len:2, orientation:"vertical",   color:"teal" },
    ],
  },
  {
    id: 4, idealMoves: 5,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:3, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:4, col:2, len:2, orientation:"horizontal", color:"slate" },
    ],
  },
  {
    id: 5, idealMoves: 5,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"purple" },
      { id:"D",      row:3, col:2, len:2, orientation:"horizontal", color:"yellow" },
    ],
  },
  {
    id: 6, idealMoves: 6,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"purple" },
    ],
  },
  {
    id: 7, idealMoves: 7,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"purple" },
      { id:"H",      row:4, col:3, len:2, orientation:"horizontal", color:"lime" },
    ],
  },
  {
    id: 8, idealMoves: 7,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
    ],
  },
  {
    id: 9, idealMoves: 8,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
      { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
    ],
  },
  {
    id: 10, idealMoves: 9,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
      { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
      { id:"H",      row:3, col:0, len:2, orientation:"vertical",   color:"orange" },
    ],
  },
];

const TOTAL_PHASES = ALL_LEVELS.length; // 10

// ── Move validation ────────────────────────────────────────────────────────────
function buildGrid(cars: Car[]): boolean[][] {
  const g: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  for (const c of cars) {
    for (let i = 0; i < c.len; i++) {
      const r   = c.orientation === "vertical"   ? c.row + i : c.row;
      const col = c.orientation === "horizontal" ? c.col + i : c.col;
      if (r >= 0 && r < GRID && col >= 0 && col < GRID) g[r][col] = true;
    }
  }
  return g;
}

function canMove(cars: Car[], carId: string, newPos: number): boolean {
  const car = cars.find(c => c.id === carId)!;
  if (car.orientation === "horizontal") {
    const maxC = car.id === "target" ? GRID - car.len + 1 : GRID - car.len;
    if (newPos < 0 || newPos > maxC) return false;
    if (car.id === "target" && newPos >= GRID - car.len + 1) return true; // exit
    const g = buildGrid(cars.filter(c => c.id !== carId));
    for (let i = 0; i < car.len; i++) {
      const col = newPos + i;
      if (col < GRID && g[car.row][col]) return false;
    }
  } else {
    if (newPos < 0 || newPos > GRID - car.len) return false;
    const g = buildGrid(cars.filter(c => c.id !== carId));
    for (let i = 0; i < car.len; i++) {
      const r = newPos + i;
      if (r < GRID && g[r][car.col]) return false;
    }
  }
  return true;
}

function isWin(cars: Car[]): boolean {
  const t = cars.find(c => c.id === "target");
  return !!t && t.col + t.len >= GRID;
}

// ── SVG top-view vehicle ──────────────────────────────────────────────────────
// Windshield: right (horizontal) / bottom (vertical). Wheels at corners.
function VehicleSVG({
  color, len, orientation, isTarget,
}: {
  color: string; len: number; orientation: "horizontal" | "vertical"; isTarget: boolean;
}) {
  const base = VEH_HEX[color] ?? VEH_HEX.slate;
  const uid  = `v${color[0]}${len}${orientation[0]}`;

  if (orientation === "horizontal") {
    const VW = len * 100, VH = 100;
    const PX = 5, PY = 8;
    const BW = VW - PX * 2, BH = VH - PY * 2;
    const WW = 24, WH = 13;
    const WXR = PX + 20, WXF = VW - PX - WW - 20;
    const WYT = PY - WH + 2, WYB = PY + BH - 2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
        <defs>
          <filter id={uid}>
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.4)" />
          </filter>
        </defs>
        {/* shadow */}
        <rect x={PX+3} y={PY+7} width={BW} height={BH} rx={12} fill="rgba(0,0,0,0.2)" />
        {/* body */}
        <rect x={PX} y={PY} width={BW} height={BH} rx={12} fill={base} filter={`url(#${uid})`} />
        {/* roof */}
        <rect x={PX+50} y={PY+13} width={VW-PX*2-108} height={BH-26} rx={7} fill="rgba(255,255,255,0.1)" />
        {/* windshield (right = front) */}
        <rect x={VW-PX-48} y={PY+11} width={34} height={BH-22} rx={6} fill="rgba(160,215,245,0.52)" />
        {/* rear window */}
        <rect x={PX+14} y={PY+13} width={28} height={BH-26} rx={5} fill="rgba(160,215,245,0.34)" />
        {/* highlight strip */}
        <rect x={PX+12} y={PY+3} width={BW-24} height={3} rx={1} fill="rgba(255,255,255,0.22)" />
        {/* wheels */}
        <rect x={WXR} y={WYT} width={WW} height={WH} rx={4} fill="#18181C" />
        <rect x={WXR} y={WYB} width={WW} height={WH} rx={4} fill="#18181C" />
        <rect x={WXF} y={WYT} width={WW} height={WH} rx={4} fill="#18181C" />
        <rect x={WXF} y={WYB} width={WW} height={WH} rx={4} fill="#18181C" />
        {isTarget && (
          <rect x={PX+1} y={PY+1} width={BW-2} height={BH-2} rx={11}
            fill="none" stroke="rgba(255,200,180,0.4)" strokeWidth={2.5} />
        )}
      </svg>
    );
  }

  // Vertical — front = bottom
  const VW = 100, VH = len * 100;
  const PX = 8, PY = 5;
  const BW = VW - PX * 2, BH = VH - PY * 2;
  const WW = 13, WH = 24;
  const WXL = PX - WW + 2, WXR2 = PX + BW - 2;
  const WYT = PY + 20, WYB = VH - PY - WH - 20;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
      <defs>
        <filter id={uid}>
          <feDropShadow dx="4" dy="0" stdDeviation="5" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>
      <rect x={PX+6} y={PY+2} width={BW} height={BH} rx={12} fill="rgba(0,0,0,0.2)" />
      <rect x={PX} y={PY} width={BW} height={BH} rx={12} fill={base} filter={`url(#${uid})`} />
      {/* roof */}
      <rect x={PX+13} y={PY+50} width={BW-26} height={VH-PY*2-108} rx={7} fill="rgba(255,255,255,0.1)" />
      {/* windshield (bottom) */}
      <rect x={PX+11} y={VH-PY-48} width={BW-22} height={34} rx={6} fill="rgba(160,215,245,0.52)" />
      {/* rear window (top) */}
      <rect x={PX+13} y={PY+14} width={BW-26} height={28} rx={5} fill="rgba(160,215,245,0.34)" />
      {/* highlight */}
      <rect x={PX+3} y={PY+12} width={3} height={BH-24} rx={1} fill="rgba(255,255,255,0.22)" />
      {/* wheels */}
      <rect x={WXL} y={WYT} width={WW} height={WH} rx={4} fill="#18181C" />
      <rect x={WXR2} y={WYT} width={WW} height={WH} rx={4} fill="#18181C" />
      <rect x={WXL} y={WYB} width={WW} height={WH} rx={4} fill="#18181C" />
      <rect x={WXR2} y={WYB} width={WW} height={WH} rx={4} fill="#18181C" />
      {isTarget && (
        <rect x={PX+1} y={PY+1} width={BW-2} height={BH-2} rx={11}
          fill="none" stroke="rgba(255,200,180,0.4)" strokeWidth={2.5} />
      )}
    </svg>
  );
}

// ── Parking lot board SVG overlay ─────────────────────────────────────────────
function BoardOverlay() {
  const S   = BOARD_PX;
  const B   = BORDER;
  const T   = S + B * 2;
  const EY1 = B + EXIT_ROW * CELL;
  const EY2 = B + (EXIT_ROW + 1) * CELL;
  const EX  = T - B;
  const AX  = EX + 8;

  return (
    <svg
      width={T + LANE_W}
      height={T}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", display: "block" }}
    >
      {/* Exit lane asphalt */}
      <rect x={EX} y={EY1} width={B + LANE_W} height={CELL} fill="#373E4B" />
      {/* Main asphalt */}
      <rect x={B} y={B} width={S} height={S} fill="#373E4B" />

      {/* Concrete curb */}
      <rect x={0} y={0} width={T} height={B} rx={2} fill="#5C6470" />
      <rect x={0} y={T-B} width={T} height={B} rx={2} fill="#5C6470" />
      <rect x={0} y={0} width={B} height={T} rx={2} fill="#5C6470" />
      <rect x={EX} y={0} width={B} height={EY1} rx={1} fill="#5C6470" />
      <rect x={EX} y={EY2} width={B} height={T-EY2} rx={1} fill="#5C6470" />

      {/* Parking lines */}
      {[1,2,3,4,5].map(r => (
        <line key={`h${r}`}
          x1={B} y1={B + r*CELL} x2={B+S} y2={B + r*CELL}
          stroke="rgba(255,255,255,0.18)" strokeWidth={1.5}
        />
      ))}
      {[1,2,3,4,5].map(c => (
        <line key={`v${c}`}
          x1={B + c*CELL} y1={B} x2={B + c*CELL} y2={B+S}
          stroke="rgba(255,255,255,0.18)" strokeWidth={1.5}
        />
      ))}

      {/* Guide dashes in exit lane */}
      <line
        x1={B + 4*CELL} y1={EY1 + CELL/2}
        x2={EX}          y2={EY1 + CELL/2}
        stroke="rgba(255,210,0,0.25)" strokeWidth={2} strokeDasharray="8 5"
      />

      {/* Exit arrow painted on asphalt */}
      <polygon
        points={`${AX},${EY1+CELL/2-9} ${AX+17},${EY1+CELL/2} ${AX},${EY1+CELL/2+9}`}
        fill="rgba(255,255,255,0.36)"
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  difficulty: number;
  theme: Theme;
  onComplete: (r: ExerciseResult) => void;
}

export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }: Props) {
  const markProgress = useExerciseProgress();

  const [puzzleIdx, setPuzzleIdx]   = useState(0);
  const [cars, setCars]             = useState<Car[]>(() => ALL_LEVELS[0].cars.map(c => ({ ...c })));
  const [moves, setMoves]           = useState(0);
  const [history, setHistory]       = useState<Car[][]>([]);
  const [won, setWon]               = useState(false);
  const [resultsLog, setResultsLog] = useState<{ moves: number; ideal: number }[]>([]);
  const [dragPrev, setDragPrev]     = useState<{ id: string; pos: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef  = useRef<DragState | null>(null);
  const startTs  = useRef(Date.now());
  // Ref keeps latest resultsLog for finishExercise without stale closure
  const resultsRef = useRef<{ moves: number; ideal: number }[]>([]);

  const currentLevel = ALL_LEVELS[puzzleIdx];

  // ── Puzzle init ────────────────────────────────────────────────────────────
  const loadPuzzle = useCallback((idx: number) => {
    setCars(ALL_LEVELS[idx].cars.map(c => ({ ...c })));
    setMoves(0);
    setHistory([]);
    setWon(false);
    setDragPrev(null);
    dragRef.current = null;
  }, []);

  const restart = () => loadPuzzle(puzzleIdx);

  // ── Finish exercise ────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    const allRes = resultsRef.current;
    const totalMoves = allRes.reduce((s, r) => s + r.moves, 0);
    const totalIdeal = allRes.reduce((s, r) => s + r.ideal, 0);
    const acc   = Math.min(1, totalIdeal / Math.max(1, totalMoves));
    const dur   = Math.round((Date.now() - startTs.current) / 1000);
    const score = calculateExerciseScore("estacionamento-logico", acc, dur * 100, difficulty);
    onComplete({
      exerciseId: "estacionamento-logico", domain: "executive",
      score, accuracy: acc, reactionTime: dur * 100, difficulty, duration: dur,
      metadata: { puzzlesSolved: allRes.length, totalMoves, totalIdeal },
    });
  }, [difficulty, onComplete]);

  // ── Next puzzle / finish ───────────────────────────────────────────────────
  const nextPuzzle = () => {
    const ni = puzzleIdx + 1;
    if (ni >= TOTAL_PHASES) {
      finish();
    } else {
      setPuzzleIdx(ni);
      loadPuzzle(ni);
    }
  };

  // ── Commit a car move ──────────────────────────────────────────────────────
  const commitMove = useCallback((carId: string, newPos: number) => {
    setCars(prev => {
      if (!canMove(prev, carId, newPos)) return prev;
      const next = prev.map(c => c.id === carId
        ? { ...c, [c.orientation === "horizontal" ? "col" : "row"]: newPos }
        : c);
      setHistory(h => [...h, prev]);
      setMoves(m => {
        const nm = m + 1;
        if (isWin(next)) {
          setWon(true);
          const res = { moves: nm, ideal: ALL_LEVELS[puzzleIdx].idealMoves };
          const newLog = [...resultsRef.current, res];
          resultsRef.current = newLog;
          setResultsLog(newLog);
          markProgress(Math.round((puzzleIdx + 1) / TOTAL_PHASES * 100));
        }
        return nm;
      });
      return next;
    });
  }, [puzzleIdx, markProgress]);

  // ── Pointer / drag ────────────────────────────────────────────────────────
  const onPtrDown = useCallback((e: React.PointerEvent, car: Car) => {
    if (won) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = car.orientation === "horizontal" ? car.col : car.row;
    dragRef.current = {
      carId: car.id, axis: car.orientation,
      startPx: car.orientation === "horizontal" ? e.clientX : e.clientY,
      startPos: pos, currentPos: pos,
    };
    setDragPrev({ id: car.id, pos });
  }, [won]);

  const onPtrMove = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const cellPx = rect.width / GRID;
    const px = d.axis === "horizontal" ? e.clientX : e.clientY;
    const delta = Math.round((px - d.startPx) / cellPx);
    const maxPos = car.id === "target" ? GRID - car.len + 1 : GRID - car.len;
    d.currentPos = Math.max(0, Math.min(maxPos, d.startPos + delta));
    setDragPrev({ id: car.id, pos: d.currentPos });
  }, []);

  const onPtrUp = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id) return;
    const orig = car.orientation === "horizontal" ? car.col : car.row;
    dragRef.current = null;
    setDragPrev(null);
    if (d.currentPos !== orig) commitMove(car.id, d.currentPos);
  }, [commitMove]);

  // ── Result screen ─────────────────────────────────────────────────────────
  if (won) {
    const last   = resultsLog[resultsLog.length - 1];
    const isLast = puzzleIdx + 1 >= TOTAL_PHASES;
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light text-slate-800 mb-1">Concluído</p>
          <p className="text-xs text-slate-400 mb-10">Fase {puzzleIdx + 1} / {TOTAL_PHASES}</p>
          <div className="flex justify-center gap-12 mb-10">
            <div>
              <p className="text-3xl font-semibold text-slate-800">{last?.moves ?? moves}</p>
              <p className="text-xs text-slate-400 mt-1">Movimentos</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-slate-300">{currentLevel.idealMoves}</p>
              <p className="text-xs text-slate-400 mt-1">Melhor solução</p>
            </div>
          </div>
          <button
            onClick={nextPuzzle}
            className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-medium tracking-wide"
          >
            {isLast ? "Finalizar" : "Próxima fase"}
          </button>
        </div>
      </div>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  const T = BOARD_PX + BORDER * 2; // 312px

  return (
    <div className="bg-white min-h-screen">
      <div
        className="mx-auto pt-4 px-3 pb-8"
        style={{ maxWidth: T + LANE_W + 24 }}
      >
        {/* Minimal header */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-sm font-semibold text-slate-700 tracking-tight">
            Estacionamento Lógico
          </h1>
          <span className="text-xs text-slate-400 tabular-nums">
            {puzzleIdx + 1} / {TOTAL_PHASES}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Libere o carro vermelho pela saída.
        </p>

        {/* Board */}
        <div style={{ position: "relative", width: T + LANE_W, height: T }}>
          <BoardOverlay />

          {/* Vehicle container (inner 300×300) */}
          <div
            ref={boardRef}
            style={{
              position: "absolute",
              left: BORDER, top: BORDER,
              width: BOARD_PX, height: BOARD_PX,
            }}
          >
            {cars.map(car => {
              const isDragging = dragPrev?.id === car.id;
              const pos  = isDragging ? dragPrev!.pos : (car.orientation === "horizontal" ? car.col : car.row);
              const left = car.orientation === "horizontal" ? pos * CELL : car.col * CELL;
              const top  = car.orientation === "vertical"   ? pos * CELL : car.row * CELL;
              const w    = car.orientation === "horizontal" ? car.len * CELL : CELL;
              const h    = car.orientation === "vertical"   ? car.len * CELL : CELL;

              return (
                <div
                  key={car.id}
                  style={{
                    position: "absolute",
                    left, top, width: w, height: h,
                    cursor: "grab",
                    touchAction: "none",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.1s ease, top 0.1s ease",
                    transform: isDragging ? "scale(1.03)" : "scale(1)",
                    willChange: "left, top",
                  }}
                  onPointerDown={e => onPtrDown(e, car)}
                  onPointerMove={e => onPtrMove(e, car)}
                  onPointerUp={e => onPtrUp(e, car)}
                >
                  <VehicleSVG
                    color={car.color}
                    len={car.len}
                    orientation={car.orientation}
                    isTarget={car.id === "target"}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Single action button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={restart}
            className="text-sm text-slate-500 border border-slate-200 rounded-lg px-6 py-2"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
