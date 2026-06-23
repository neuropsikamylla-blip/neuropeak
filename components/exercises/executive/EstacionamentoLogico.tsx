"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ── Layout constants ──────────────────────────────────────────────────────────
const GRID     = 6;
const BORDER   = 7;    // curb thickness px
const EXIT_ROW = 2;    // target car row (0-indexed, from bottom)
const CORRIDOR = 26;   // exit corridor width px (outside board)

// ── Types ─────────────────────────────────────────────────────────────────────
interface Car {
  id: string; row: number; col: number; len: number;
  orientation: "horizontal" | "vertical"; color: string;
}
interface Level { id: number; idealMoves: number; cars: Car[] }
interface DragState {
  carId: string; axis: "horizontal" | "vertical";
  startPx: number; startPos: number; currentPos: number;
}

// ── Professional muted palette ────────────────────────────────────────────────
const VEH_HEX: Record<string, string> = {
  red:    "#BE2E2E",  // target — clean professional red
  teal:   "#3A6878",
  blue:   "#2C4868",
  purple: "#54497A",
  slate:  "#475462",
  yellow: "#5C511E",
  lime:   "#3A5824",
  indigo: "#2A3062",
  orange: "#664826",
  pink:   "#663652",
};

// ── Puzzle levels ─────────────────────────────────────────────────────────────
const ALL_LEVELS: Level[] = [
  { id:1,  idealMoves:2, cars:[
    { id:"target", row:2, col:3, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:1, col:5, len:2, orientation:"vertical",   color:"teal" },
  ]},
  { id:2,  idealMoves:3, cars:[
    { id:"target", row:2, col:1, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:3, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:1, col:4, len:2, orientation:"vertical",   color:"purple" },
  ]},
  { id:3,  idealMoves:4, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"blue" },
    { id:"B",      row:3, col:1, len:2, orientation:"horizontal", color:"slate" },
    { id:"C",      row:1, col:4, len:2, orientation:"vertical",   color:"teal" },
  ]},
  { id:4,  idealMoves:5, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"D",      row:3, col:3, len:2, orientation:"horizontal", color:"yellow" },
    { id:"E",      row:4, col:2, len:2, orientation:"horizontal", color:"slate" },
  ]},
  { id:5,  idealMoves:5, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"purple" },
    { id:"D",      row:3, col:2, len:2, orientation:"horizontal", color:"yellow" },
  ]},
  { id:6,  idealMoves:6, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
    { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
    { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"purple" },
  ]},
  { id:7,  idealMoves:7, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
    { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
    { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"purple" },
    { id:"H",      row:4, col:3, len:2, orientation:"horizontal", color:"lime" },
  ]},
  { id:8,  idealMoves:7, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
    { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
    { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
    { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
  ]},
  { id:9,  idealMoves:8, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
    { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
    { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
    { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
    { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
  ]},
  { id:10, idealMoves:9, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
    { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
    { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"blue" },
    { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"slate" },
    { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
    { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"purple" },
    { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"lime" },
    { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
    { id:"H",      row:3, col:0, len:2, orientation:"vertical",   color:"orange" },
  ]},
];
const TOTAL_PHASES = ALL_LEVELS.length;

// ── Move validation ───────────────────────────────────────────────────────────
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

// ── Top-view vehicle SVG — 4 types, consistent design system ─────────────────
// Design rules:
//   • Horizontal cars: front = right, rear = left
//   • Vertical cars:   front = bottom, rear = top
//   • All: body > windshield + rear-window + roof panel + 4 wheels
//   • Windshield: larger glass, more translucent blue-white
//   • Wheels: small, at corners, slightly outside body, dark rounded rects
//   • Shadow: soft drop-shadow filter on the body
function VehicleSVG({
  color, len, orientation, isTarget,
}: {
  color: string; len: number; orientation: "horizontal" | "vertical"; isTarget: boolean;
}) {
  const base = VEH_HEX[color] ?? VEH_HEX.slate;
  const uid  = `car_${color}_${len}_${orientation[0]}`;
  const shadowStrength = isTarget ? 0.55 : 0.38;
  const shadowSpread   = isTarget ? 8 : 5;

  if (orientation === "horizontal") {
    const VW = len * 100, VH = 100;
    // Body: 6px padding sides, 9px top/bottom
    const bx = 5, by = 9, bw = VW - 10, bh = 82;
    // Section widths (hood, cabin, trunk)
    const hoodW  = 50,                 trunkW = 46;
    const cabinX = bx + trunkW,        cabinW = bw - hoodW - trunkW;
    const hoodX  = bx + bw - hoodW;
    // Windshield (front=right)
    const wsX = hoodX + 8,  wsY = by + 14, wsW = 30, wsH = 54;
    // Rear window
    const rwX = bx + 12,    rwY = by + 18, rwW = 24, rwH = 46;
    // Wheels (w=20, h=12, rx=4)
    const ww = 20, wh = 12;
    const wx1 = bx + 12, wx2 = bx + bw - 12 - ww;
    const wy1 = 1, wy2 = VH - 1 - wh;

    return (
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
        <defs>
          <filter id={uid} x="-18%" y="-28%" width="145%" height="165%">
            <feDropShadow dx="0" dy={shadowSpread * 0.5} stdDeviation={shadowSpread}
              floodColor={`rgba(0,0,0,${shadowStrength})`} />
          </filter>
        </defs>

        {/* Wheels (drawn first = below body) */}
        <rect x={wx1} y={wy1} width={ww} height={wh} rx={3} fill="#171820" />
        <rect x={wx1} y={wy2} width={ww} height={wh} rx={3} fill="#171820" />
        <rect x={wx2} y={wy1} width={ww} height={wh} rx={3} fill="#171820" />
        <rect x={wx2} y={wy2} width={ww} height={wh} rx={3} fill="#171820" />

        {/* Main body */}
        <rect x={bx} y={by} width={bw} height={bh} rx={10} fill={base} filter={`url(#${uid})`} />

        {/* Trunk section (rear=left, slightly darker) */}
        <rect x={bx} y={by} width={trunkW} height={bh} rx={10} fill="rgba(0,0,0,0.09)" />
        {/* Hood section (front=right, slightly darker) */}
        <rect x={hoodX} y={by} width={hoodW} height={bh} rx={10} fill="rgba(0,0,0,0.07)" />

        {/* Cabin/roof divider lines */}
        <line x1={cabinX} y1={by+2} x2={cabinX} y2={by+bh-2}
          stroke="rgba(0,0,0,0.13)" strokeWidth={1.5} />
        <line x1={cabinX+cabinW} y1={by+2} x2={cabinX+cabinW} y2={by+bh-2}
          stroke="rgba(0,0,0,0.10)" strokeWidth={1.5} />

        {/* Roof / cabin panel */}
        <rect x={cabinX+2} y={by+12} width={cabinW-4} height={bh-24} rx={7}
          fill="rgba(255,255,255,0.07)" />

        {/* Windshield (front glass) */}
        <rect x={wsX} y={wsY} width={wsW} height={wsH} rx={5}
          fill="rgba(185,222,248,0.58)" />
        {/* Windshield glare */}
        <rect x={wsX+2} y={wsY+2} width={wsW-4} height={8} rx={2}
          fill="rgba(255,255,255,0.22)" />

        {/* Rear window */}
        <rect x={rwX} y={rwY} width={rwW} height={rwH} rx={4}
          fill="rgba(185,222,248,0.36)" />

        {/* Body highlight (top specular edge) */}
        <rect x={bx+16} y={by+3} width={bw-32} height={3} rx={1.5}
          fill="rgba(255,255,255,0.18)" />

        {/* Target rim */}
        {isTarget && (
          <rect x={bx+1} y={by+1} width={bw-2} height={bh-2} rx={9}
            fill="none" stroke="rgba(255,140,120,0.35)" strokeWidth={2.5} />
        )}
      </svg>
    );
  }

  // ── Vertical car (front = bottom) ─────────────────────────────────────────
  const VW = 100, VH = len * 100;
  const bx = 9, by2 = 5, bw = 82, bh2 = VH - 10;
  const hoodH  = 50, trunkH = 46;
  const cabinY = by2 + trunkH, cabinH = bh2 - hoodH - trunkH;
  const hoodY  = by2 + bh2 - hoodH;
  // Windshield (front=bottom)
  const wsX2 = bx + 14, wsY2 = hoodY + 8, wsW2 = 54, wsH2 = 30;
  // Rear window (top)
  const rwX2 = bx + 18, rwY2 = by2 + 12, rwW2 = 46, rwH2 = 24;
  // Wheels (w=12, h=20, rx=3)
  const ww2 = 12, wh2 = 20;
  const wx1b = 1, wx2b = VW - 1 - ww2;
  const wy1b = by2 + 12, wy2b = by2 + bh2 - 12 - wh2;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="100%" overflow="visible">
      <defs>
        <filter id={uid} x="-28%" y="-18%" width="165%" height="145%">
          <feDropShadow dx={shadowSpread * 0.5} dy={0} stdDeviation={shadowSpread}
            floodColor={`rgba(0,0,0,${shadowStrength})`} />
        </filter>
      </defs>

      {/* Wheels */}
      <rect x={wx1b} y={wy1b} width={ww2} height={wh2} rx={3} fill="#171820" />
      <rect x={wx2b} y={wy1b} width={ww2} height={wh2} rx={3} fill="#171820" />
      <rect x={wx1b} y={wy2b} width={ww2} height={wh2} rx={3} fill="#171820" />
      <rect x={wx2b} y={wy2b} width={ww2} height={wh2} rx={3} fill="#171820" />

      {/* Main body */}
      <rect x={bx} y={by2} width={bw} height={bh2} rx={10} fill={base} filter={`url(#${uid})`} />

      {/* Trunk section (rear=top) */}
      <rect x={bx} y={by2} width={bw} height={trunkH} rx={10} fill="rgba(0,0,0,0.09)" />
      {/* Hood section (front=bottom) */}
      <rect x={bx} y={hoodY} width={bw} height={hoodH} rx={10} fill="rgba(0,0,0,0.07)" />

      {/* Cabin divider lines */}
      <line x1={bx+2} y1={cabinY} x2={bx+bw-2} y2={cabinY}
        stroke="rgba(0,0,0,0.13)" strokeWidth={1.5} />
      <line x1={bx+2} y1={cabinY+cabinH} x2={bx+bw-2} y2={cabinY+cabinH}
        stroke="rgba(0,0,0,0.10)" strokeWidth={1.5} />

      {/* Roof panel */}
      <rect x={bx+12} y={cabinY+2} width={bw-24} height={cabinH-4} rx={7}
        fill="rgba(255,255,255,0.07)" />

      {/* Windshield (front = bottom) */}
      <rect x={wsX2} y={wsY2} width={wsW2} height={wsH2} rx={5}
        fill="rgba(185,222,248,0.58)" />
      <rect x={wsX2+2} y={wsY2+2} width={8} height={wsH2-4} rx={2}
        fill="rgba(255,255,255,0.22)" />

      {/* Rear window */}
      <rect x={rwX2} y={rwY2} width={rwW2} height={rwH2} rx={4}
        fill="rgba(185,222,248,0.36)" />

      {/* Body highlight */}
      <rect x={bx+3} y={by2+16} width={3} height={bh2-32} rx={1.5}
        fill="rgba(255,255,255,0.18)" />

      {/* Target rim */}
      {isTarget && (
        <rect x={bx+1} y={by2+1} width={bw-2} height={bh2-2} rx={9}
          fill="none" stroke="rgba(255,140,120,0.35)" strokeWidth={2.5} />
      )}
    </svg>
  );
}

// ── Parking lot SVG board ─────────────────────────────────────────────────────
function BoardSVG({ cellPx }: { cellPx: number }) {
  const S   = GRID * cellPx;
  const B   = BORDER;
  const T   = S + B * 2;
  const TW  = T + CORRIDOR;     // total SVG width (board + exit corridor)

  // Exit opening
  const EY1 = B + EXIT_ROW * cellPx;
  const EY2 = B + (EXIT_ROW + 1) * cellPx;

  // Arrow in corridor
  const AY  = (EY1 + EY2) / 2;
  const ax1 = T + 5, ax2 = T + CORRIDOR - 7;

  return (
    <svg
      width={TW} height={T}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "block" }}
    >
      <defs>
        {/* Subtle asphalt grain texture */}
        <pattern id="grain" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="transparent" />
          <rect x="0" y="0" width="1.2" height="1.2" fill="rgba(255,255,255,0.025)" />
          <rect x="3" y="3" width="1" height="1"   fill="rgba(255,255,255,0.020)" />
          <rect x="1" y="4" width="0.8" height="0.8" fill="rgba(0,0,0,0.03)" />
        </pattern>
      </defs>

      {/* ── Asphalt floor ──────────────────────────────────────────────────── */}
      <rect x={B} y={B} width={S} height={S} fill="#343848" />
      <rect x={B} y={B} width={S} height={S} fill="url(#grain)" />

      {/* Exit corridor asphalt */}
      <rect x={T-B} y={EY1} width={CORRIDOR+B} height={cellPx} fill="#343848" />
      <rect x={T-B} y={EY1} width={CORRIDOR+B} height={cellPx} fill="url(#grain)" />

      {/* ── Exit row — very faint warmer tint on the exit path ─────────────── */}
      <rect x={B} y={EY1} width={S} height={cellPx} fill="rgba(255,220,180,0.030)" />

      {/* ── Parking space lines ────────────────────────────────────────────── */}
      {/* Vertical separators (space dividers) — solid, crisp */}
      {[1,2,3,4,5].map(c => (
        <line key={`v${c}`}
          x1={B + c*cellPx} y1={B + 1}
          x2={B + c*cellPx} y2={T - B - 1}
          stroke="rgba(255,255,255,0.155)" strokeWidth={1}
        />
      ))}
      {/* Horizontal separators (row dividers) — slightly more subtle */}
      {[1,2,3,4,5].map(r => (
        <line key={`h${r}`}
          x1={B + 1} y1={B + r*cellPx}
          x2={T - B - 1} y2={B + r*cellPx}
          stroke="rgba(255,255,255,0.10)" strokeWidth={1}
        />
      ))}

      {/* ── Stop line at exit (painted on asphalt at right edge of row 2) ─── */}
      <line
        x1={T - B - 3} y1={EY1 + 4}
        x2={T - B - 3} y2={EY2 - 4}
        stroke="rgba(255,255,255,0.32)" strokeWidth={2.5}
      />

      {/* ── Curb / perimeter ───────────────────────────────────────────────── */}
      {/* Top */}
      <rect x={0} y={0} width={T} height={B} fill="#4C5268" />
      {/* Bottom */}
      <rect x={0} y={T-B} width={T} height={B} fill="#4C5268" />
      {/* Left */}
      <rect x={0} y={0} width={B} height={T} fill="#4C5268" />
      {/* Right — above exit */}
      <rect x={T-B} y={0} width={B} height={EY1} fill="#4C5268" />
      {/* Right — below exit */}
      <rect x={T-B} y={EY2} width={B} height={T-EY2} fill="#4C5268" />

      {/* Corridor top/bottom boundaries */}
      <rect x={T-B} y={EY1-B} width={CORRIDOR+B} height={B} fill="#4C5268" />
      <rect x={T-B} y={EY2}   width={CORRIDOR+B} height={B} fill="#4C5268" />

      {/* Curb inner highlights (lighter top/left edge = ambient light) */}
      <line x1={B} y1={B} x2={T-B} y2={B} stroke="rgba(255,255,255,0.11)" strokeWidth={1} />
      <line x1={B} y1={B} x2={B} y2={T-B} stroke="rgba(255,255,255,0.11)" strokeWidth={1} />
      {/* Curb outer shadow (bottom/right edge darker) */}
      <line x1={0} y1={T-1} x2={T} y2={T-1} stroke="rgba(0,0,0,0.22)" strokeWidth={1} />
      <line x1={T-1} y1={0} x2={T-1} y2={EY1} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />

      {/* ── Exit arrow (painted on corridor asphalt) ───────────────────────── */}
      {/* Arrow line */}
      <line
        x1={ax1} y1={AY}
        x2={ax2 - 8} y2={AY}
        stroke="rgba(255,255,255,0.58)" strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon
        points={`${ax2-10},${AY-6} ${ax2},${AY} ${ax2-10},${AY+6}`}
        fill="rgba(255,255,255,0.58)"
      />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  difficulty: number; theme: Theme; onComplete: (r: ExerciseResult) => void;
}

export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }: Props) {
  const markProgress = useExerciseProgress();

  const [cellPx, setCellPx] = useState(52);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function compute() {
      const w = wrapRef.current?.offsetWidth ?? window.innerWidth;
      // Reserve: 2×12px side padding + 2×BORDER + CORRIDOR
      const available = w - 24 - BORDER * 2 - CORRIDOR;
      setCellPx(Math.min(Math.max(Math.floor(available / GRID), 44), 70));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const boardInner = GRID * cellPx;
  const boardTotal = boardInner + BORDER * 2;

  const [puzzleIdx, setPuzzleIdx]   = useState(0);
  const [cars, setCars]             = useState<Car[]>(() => ALL_LEVELS[0].cars.map(c => ({ ...c })));
  const [moves, setMoves]           = useState(0);
  const [history, setHistory]       = useState<Car[][]>([]);
  const [won, setWon]               = useState(false);
  const [resultsLog, setResultsLog] = useState<{ moves: number; ideal: number }[]>([]);
  const [dragPrev, setDragPrev]     = useState<{ id: string; pos: number } | null>(null);

  const boardRef   = useRef<HTMLDivElement>(null);
  const dragRef    = useRef<DragState | null>(null);
  const startTs    = useRef(Date.now());
  const resultsRef = useRef<{ moves: number; ideal: number }[]>([]);

  const currentLevel = ALL_LEVELS[puzzleIdx];

  const loadPuzzle = useCallback((idx: number) => {
    setCars(ALL_LEVELS[idx].cars.map(c => ({ ...c })));
    setMoves(0); setHistory([]); setWon(false);
    setDragPrev(null); dragRef.current = null;
  }, []);

  const restart = () => loadPuzzle(puzzleIdx);

  const finish = useCallback(() => {
    const allRes = resultsRef.current;
    const totalMoves = allRes.reduce((s, r) => s + r.moves, 0);
    const totalIdeal = allRes.reduce((s, r) => s + r.ideal, 0);
    const acc = Math.min(1, totalIdeal / Math.max(1, totalMoves));
    const dur = Math.round((Date.now() - startTs.current) / 1000);
    const score = calculateExerciseScore("estacionamento-logico", acc, dur * 100, difficulty);
    onComplete({
      exerciseId: "estacionamento-logico", domain: "executive",
      score, accuracy: acc, reactionTime: dur * 100, difficulty, duration: dur,
      metadata: { puzzlesSolved: allRes.length, totalMoves, totalIdeal },
    });
  }, [difficulty, onComplete]);

  const nextPuzzle = () => {
    const ni = puzzleIdx + 1;
    if (ni >= TOTAL_PHASES) { finish(); }
    else { setPuzzleIdx(ni); loadPuzzle(ni); }
  };

  const commitMove = useCallback((carId: string, newPos: number) => {
    setCars(prev => {
      if (!canMove(prev, carId, newPos)) return prev;
      const next = prev.map(c =>
        c.id === carId ? { ...c, [c.orientation === "horizontal" ? "col" : "row"]: newPos } : c
      );
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
    dragRef.current = null; setDragPrev(null);
    if (d.currentPos !== orig) commitMove(car.id, d.currentPos);
  }, [commitMove]);

  // ── Result screen ─────────────────────────────────────────────────────────
  if (won) {
    const last   = resultsLog[resultsLog.length - 1];
    const isLast = puzzleIdx + 1 >= TOTAL_PHASES;
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#ECEAE4" }}>
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light mb-10" style={{ color: "#3A4050" }}>Concluído</p>
          <div className="flex justify-center gap-14 mb-10">
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: "#3A4050" }}>{last?.moves ?? moves}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Movimentos</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: "#B0BAC8" }}>{currentLevel.idealMoves}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Melhor solução</p>
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

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#ECEAE4" }}
    >
      {/* Instruction — centered, above the board */}
      <p style={{
        marginTop: 22, marginBottom: 12,
        fontSize: 13, fontWeight: 500, letterSpacing: "0.01em",
        color: "#3D4456",
        textAlign: "center",
      }}>
        Libere o carro vermelho pela saída.
      </p>

      {/* Board — fills available width */}
      <div style={{ display: "flex", justifyContent: "center", paddingLeft: 12, paddingRight: 12 }}>
        <div style={{ position: "relative", width: boardTotal + CORRIDOR, height: boardTotal, flexShrink: 0 }}>
          <BoardSVG cellPx={cellPx} />

          {/* Vehicle grid */}
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
                    transition: isDragging ? "none" : "left 0.10s ease, top 0.10s ease",
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

      {/* Restart button — close to board, discrete */}
      <div style={{ marginTop: 14 }}>
        <button
          onClick={restart}
          style={{
            padding: "8px 28px",
            borderRadius: 10,
            border: "1.5px solid #C8CDD8",
            background: "white",
            color: "#5A6270",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onPointerEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F4F4F0"; }}
          onPointerLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
