"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────
const GRID   = 6;
const BORDER = 5;          // concrete curb thickness px
const EXIT_ROW = 2;        // target car row (0-indexed)
// CELL_PX is computed dynamically — see useLayoutEffect below

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

// ── Muted professional vehicle colors ─────────────────────────────────────────
const VEH_HEX: Record<string, string> = {
  red:    "#BE3030",
  teal:   "#3A6D7E",
  purple: "#5A4F80",
  blue:   "#304E72",
  yellow: "#6A5C20",
  orange: "#72502A",
  pink:   "#723A58",
  indigo: "#303468",
  lime:   "#426028",
  slate:  "#4E5A68",
};

// ── Puzzle levels ──────────────────────────────────────────────────────────────
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

const TOTAL_PHASES = ALL_LEVELS.length;

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
    if (car.id === "target" && newPos >= GRID - car.len + 1) return true;
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

// ── SVG top-view vehicle (scales to container via viewBox) ────────────────────
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
    const WW = 24, WH = 12;
    const WXR = PX + 18, WXF = VW - PX - WW - 18;
    const WYT = PY - WH + 2, WYB = PY + BH - 2;
    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
        <defs>
          <filter id={uid} x="-10%" y="-30%" width="125%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="rgba(0,0,0,0.45)" />
          </filter>
        </defs>
        {/* body */}
        <rect x={PX} y={PY} width={BW} height={BH} rx={11} fill={base} filter={`url(#${uid})`} />
        {/* hood (front=right, slightly darker) */}
        <rect x={VW-PX-46} y={PY} width={46} height={BH} rx={11} fill="rgba(0,0,0,0.1)" />
        {/* trunk (left, slightly darker) */}
        <rect x={PX} y={PY} width={38} height={BH} rx={11} fill="rgba(0,0,0,0.07)" />
        {/* roof */}
        <rect x={PX+44} y={PY+11} width={VW-PX*2-100} height={BH-22} rx={7} fill="rgba(255,255,255,0.1)" />
        {/* windshield */}
        <rect x={VW-PX-44} y={PY+10} width={30} height={BH-20} rx={5} fill="rgba(155,210,245,0.55)" />
        {/* rear window */}
        <rect x={PX+12} y={PY+12} width={22} height={BH-24} rx={4} fill="rgba(155,210,245,0.38)" />
        {/* top highlight */}
        <rect x={PX+14} y={PY+3} width={BW-28} height={2.5} rx={1} fill="rgba(255,255,255,0.26)" />
        {/* wheels — 4 corners */}
        <rect x={WXR}  y={WYT} width={WW} height={WH} rx={3} fill="#141418" />
        <rect x={WXR}  y={WYB} width={WW} height={WH} rx={3} fill="#141418" />
        <rect x={WXF}  y={WYT} width={WW} height={WH} rx={3} fill="#141418" />
        <rect x={WXF}  y={WYB} width={WW} height={WH} rx={3} fill="#141418" />
        {isTarget && (
          <rect x={PX+1} y={PY+1} width={BW-2} height={BH-2} rx={10}
            fill="none" stroke="rgba(255,190,160,0.45)" strokeWidth={3} />
        )}
      </svg>
    );
  }

  // Vertical (front = bottom)
  const VW = 100, VH = len * 100;
  const PX = 8, PY = 5;
  const BW = VW - PX * 2, BH = VH - PY * 2;
  const WW = 12, WH = 24;
  const WXL = PX - WW + 2, WXR2 = PX + BW - 2;
  const WYT = PY + 18, WYB = VH - PY - WH - 18;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
      <defs>
        <filter id={uid} x="-30%" y="-10%" width="170%" height="125%">
          <feDropShadow dx="5" dy="0" stdDeviation="6" floodColor="rgba(0,0,0,0.45)" />
        </filter>
      </defs>
      <rect x={PX} y={PY} width={BW} height={BH} rx={11} fill={base} filter={`url(#${uid})`} />
      {/* hood (bottom) */}
      <rect x={PX} y={VH-PY-46} width={BW} height={46} rx={11} fill="rgba(0,0,0,0.1)" />
      {/* trunk (top) */}
      <rect x={PX} y={PY} width={BW} height={38} rx={11} fill="rgba(0,0,0,0.07)" />
      {/* roof */}
      <rect x={PX+11} y={PY+44} width={BW-22} height={VH-PY*2-100} rx={7} fill="rgba(255,255,255,0.1)" />
      {/* windshield (bottom) */}
      <rect x={PX+10} y={VH-PY-44} width={BW-20} height={30} rx={5} fill="rgba(155,210,245,0.55)" />
      {/* rear window (top) */}
      <rect x={PX+12} y={PY+12} width={BW-24} height={22} rx={4} fill="rgba(155,210,245,0.38)" />
      {/* highlight */}
      <rect x={PX+3} y={PY+14} width={2.5} height={BH-28} rx={1} fill="rgba(255,255,255,0.26)" />
      {/* wheels */}
      <rect x={WXL}  y={WYT} width={WW} height={WH} rx={3} fill="#141418" />
      <rect x={WXR2} y={WYT} width={WW} height={WH} rx={3} fill="#141418" />
      <rect x={WXL}  y={WYB} width={WW} height={WH} rx={3} fill="#141418" />
      <rect x={WXR2} y={WYB} width={WW} height={WH} rx={3} fill="#141418" />
      {isTarget && (
        <rect x={PX+1} y={PY+1} width={BW-2} height={BH-2} rx={10}
          fill="none" stroke="rgba(255,190,160,0.45)" strokeWidth={3} />
      )}
    </svg>
  );
}

// ── Parking lot SVG overlay ────────────────────────────────────────────────────
// Receives cellPx so it scales correctly at any size.
function BoardSVG({ cellPx }: { cellPx: number }) {
  const S   = GRID * cellPx;         // interior side
  const B   = BORDER;
  const T   = S + B * 2;             // total board px
  const EY1 = B + EXIT_ROW * cellPx;
  const EY2 = B + (EXIT_ROW + 1) * cellPx;
  const EX  = T - B;

  // Arrow at right side of exit row, inside the board
  const AX = EX - 22;
  const AY = EY1 + cellPx / 2;

  return (
    <svg
      width={T} height={T}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "block" }}
    >
      {/* Asphalt floor */}
      <rect x={B} y={B} width={S} height={S} fill="#3C424F" />

      {/* Subtle asphalt texture (faint diagonal hatching) */}
      <pattern id="asphalt" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="transparent" />
        <line x1="0" y1="40" x2="40" y2="0" stroke="rgba(255,255,255,0.015)" strokeWidth="2" />
      </pattern>
      <rect x={B} y={B} width={S} height={S} fill="url(#asphalt)" />

      {/* Exit row — very slight highlight to suggest the path */}
      <rect x={B} y={EY1} width={S} height={cellPx} fill="rgba(255,255,255,0.025)" />

      {/* Concrete curb — top */}
      <rect x={0} y={0} width={T} height={B} fill="#5A6170" />
      {/* Concrete curb — bottom */}
      <rect x={0} y={T-B} width={T} height={B} fill="#5A6170" />
      {/* Concrete curb — left */}
      <rect x={0} y={0} width={B} height={T} fill="#5A6170" />
      {/* Concrete curb — right (above exit) */}
      <rect x={EX} y={0} width={B} height={EY1} fill="#5A6170" />
      {/* Concrete curb — right (below exit) */}
      <rect x={EX} y={EY2} width={B} height={T-EY2} fill="#5A6170" />

      {/* Inner curb edge highlight (top/left) */}
      <line x1={B} y1={B} x2={S+B} y2={B} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={B} y1={B} x2={B} y2={S+B} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Parking space dividers — horizontal */}
      {[1,2,3,4,5].map(r => (
        <line key={`h${r}`}
          x1={B} y1={B + r*cellPx} x2={B+S} y2={B + r*cellPx}
          stroke="rgba(255,255,255,0.17)" strokeWidth={1.5} strokeDasharray="6 4"
        />
      ))}
      {/* Parking space dividers — vertical */}
      {[1,2,3,4,5].map(c => (
        <line key={`v${c}`}
          x1={B + c*cellPx} y1={B} x2={B + c*cellPx} y2={B+S}
          stroke="rgba(255,255,255,0.17)" strokeWidth={1.5} strokeDasharray="6 4"
        />
      ))}

      {/* Exit guide dashes on row 2 */}
      <line
        x1={B + 3*cellPx} y1={AY} x2={AX - 4} y2={AY}
        stroke="rgba(255,205,0,0.28)" strokeWidth={2} strokeDasharray="7 5"
      />

      {/* Exit arrow (painted on asphalt, inside board) */}
      <polygon
        points={`${AX-14},${AY-9} ${AX},${AY} ${AX-14},${AY+9}`}
        fill="rgba(255,255,255,0.42)"
      />

      {/* Corner marks for parking spaces */}
      {[0,1,2,3,4,5].map(r => [0,1,2,3,4,5].map(c => (
        <rect key={`${r}${c}`}
          x={B + c*cellPx + 1} y={B + r*cellPx + 1}
          width={4} height={4}
          fill="rgba(255,255,255,0.06)"
        />
      )))}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  difficulty: number;
  theme: Theme;
  onComplete: (r: ExerciseResult) => void;
}

export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }: Props) {
  const markProgress = useExerciseProgress();

  // Responsive cell size — computed once on mount from available width
  const [cellPx, setCellPx] = useState(52);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function compute() {
      const w = wrapRef.current ? wrapRef.current.offsetWidth : window.innerWidth - 32;
      const c = Math.floor((w - BORDER * 2) / GRID);
      setCellPx(Math.min(Math.max(c, 46), 72)); // clamp 46-72px
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const boardInner = GRID * cellPx;            // e.g. 6*56 = 336px
  const boardTotal = boardInner + BORDER * 2;  // + border each side

  // ── State ────────────────────────────────────────────────────────────────
  const [puzzleIdx, setPuzzleIdx]   = useState(0);
  const [cars, setCars]             = useState<Car[]>(() => ALL_LEVELS[0].cars.map(c => ({ ...c })));
  const [moves, setMoves]           = useState(0);
  const [history, setHistory]       = useState<Car[][]>([]);
  const [won, setWon]               = useState(false);
  const [resultsLog, setResultsLog] = useState<{ moves: number; ideal: number }[]>([]);
  const [dragPrev, setDragPrev]     = useState<{ id: string; pos: number } | null>(null);

  const boardRef  = useRef<HTMLDivElement>(null);
  const dragRef   = useRef<DragState | null>(null);
  const startTs   = useRef(Date.now());
  const resultsRef = useRef<{ moves: number; ideal: number }[]>([]);

  const currentLevel = ALL_LEVELS[puzzleIdx];

  // ── Load puzzle ───────────────────────────────────────────────────────────
  const loadPuzzle = useCallback((idx: number) => {
    setCars(ALL_LEVELS[idx].cars.map(c => ({ ...c })));
    setMoves(0);
    setHistory([]);
    setWon(false);
    setDragPrev(null);
    dragRef.current = null;
  }, []);

  const restart = () => loadPuzzle(puzzleIdx);

  // ── Finish ────────────────────────────────────────────────────────────────
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

  const nextPuzzle = () => {
    const ni = puzzleIdx + 1;
    if (ni >= TOTAL_PHASES) {
      finish();
    } else {
      setPuzzleIdx(ni);
      loadPuzzle(ni);
    }
  };

  // ── Commit move ───────────────────────────────────────────────────────────
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

  // ── Drag ──────────────────────────────────────────────────────────────────
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
    const cpx  = rect.width / GRID;
    const px   = d.axis === "horizontal" ? e.clientX : e.clientY;
    const delta = Math.round((px - d.startPx) / cpx);
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

  // ── Result screen (between puzzles) ───────────────────────────────────────
  if (won) {
    const last   = resultsLog[resultsLog.length - 1];
    const isLast = puzzleIdx + 1 >= TOTAL_PHASES;
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#F2F2EE" }}>
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light text-slate-800 mb-10">Concluído</p>

          <div className="flex justify-center gap-14 mb-10">
            <div>
              <p className="text-4xl font-semibold text-slate-800 tabular-nums">{last?.moves ?? moves}</p>
              <p className="text-xs text-slate-400 mt-1.5 tracking-wide uppercase">Movimentos</p>
            </div>
            <div>
              <p className="text-4xl font-semibold text-slate-300 tabular-nums">{currentLevel.idealMoves}</p>
              <p className="text-xs text-slate-400 mt-1.5 tracking-wide uppercase">Melhor solução</p>
            </div>
          </div>

          <button
            onClick={nextPuzzle}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
            style={{ background: "#2C3444" }}
          >
            {isLast ? "Finalizar" : "Próxima fase"}
          </button>
        </div>
      </div>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="min-h-screen flex flex-col"
      style={{ background: "#F2F2EE" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0.5">
        <h1 className="text-sm font-semibold tracking-tight" style={{ color: "#3A4050" }}>
          Estacionamento Lógico
        </h1>
        <span className="text-xs tabular-nums" style={{ color: "#94A0B0" }}>
          {puzzleIdx + 1} / {TOTAL_PHASES}
        </span>
      </div>
      <p className="px-4 pt-1 pb-4 text-xs" style={{ color: "#94A0B0" }}>
        Libere o carro vermelho pela saída.
      </p>

      {/* ── Board — fills available width ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-3">
        <div style={{ position: "relative", width: boardTotal, height: boardTotal, flexShrink: 0 }}>
          {/* SVG background (asphalt + curb + lines) */}
          <BoardSVG cellPx={cellPx} />

          {/* Vehicle container (6×6 inner grid) */}
          <div
            ref={boardRef}
            style={{
              position: "absolute",
              left: BORDER, top: BORDER,
              width: boardInner, height: boardInner,
            }}
          >
            {cars.map(car => {
              const isDragging = dragPrev?.id === car.id;
              const pos  = isDragging ? dragPrev!.pos : (car.orientation === "horizontal" ? car.col : car.row);
              const left = car.orientation === "horizontal" ? pos * cellPx : car.col * cellPx;
              const top  = car.orientation === "vertical"   ? pos * cellPx : car.row * cellPx;
              const w    = car.orientation === "horizontal" ? car.len * cellPx : cellPx;
              const h    = car.orientation === "vertical"   ? car.len * cellPx : cellPx;

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
                    transform: isDragging ? "scale(1.04)" : "scale(1)",
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
      </div>

      {/* ── Restart button ────────────────────────────────────────────── */}
      <div className="flex justify-center py-5">
        <button
          onClick={restart}
          className="px-8 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            color: "#5A6070",
            border: "1.5px solid #CDD0D8",
            background: "white",
          }}
          onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F2"; }}
          onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
