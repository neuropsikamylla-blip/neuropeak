"use client";

import { useState, useRef, useCallback, useLayoutEffect, useMemo } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { assignCarImages } from "@/lib/parking-cars";
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

// ── Top-view vehicle (PNG transparente) ──────────────────────────
// Largura de pista FIXA para todos os carros (mesmo "calibre", estilo Parking
// Jam) — o comprimento sai da proporção nativa da imagem, sem distorcer. Assim
// nenhum carro fica maior/menor que os outros na largura. Horizontal: frente à
// direita. Vertical: a mesma imagem girada 90°. Alvo com brilho avermelhado.
const LANE = 0.84; // largura do veículo como fração da célula
function CarImage({
  src, orientation, isTarget, cellPx,
}: {
  src: string; orientation: "horizontal" | "vertical"; isTarget: boolean; cellPx: number;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "visible",
      filter: isTarget
        ? "drop-shadow(0 2px 2px rgba(0,0,0,0.35)) drop-shadow(0 0 5px rgba(255,60,50,0.5))"
        : "drop-shadow(0 2px 2px rgba(0,0,0,0.32))",
    }}>
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          position: "absolute", top: "50%", left: "50%",
          height: cellPx * LANE,   // pista fixa (largura do veículo) — igual p/ todos
          width: "auto",           // comprimento pela proporção nativa (sem distorção)
          maxWidth: "none",
          transform: `translate(-50%, -50%) rotate(${orientation === "vertical" ? 90 : 0}deg)`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
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
        {/* Asfalto: leve gradiente + granulado */}
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c4252" />
          <stop offset="1" stopColor="#2d323e" />
        </linearGradient>
        <radialGradient id="asphaltGlow" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <pattern id="grain" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="transparent" />
          <rect x="0" y="0" width="1.3" height="1.3" fill="rgba(255,255,255,0.028)" />
          <rect x="3.5" y="3.5" width="1" height="1" fill="rgba(255,255,255,0.022)" />
          <rect x="1.5" y="4.5" width="0.9" height="0.9" fill="rgba(0,0,0,0.05)" />
          <rect x="5" y="1" width="0.8" height="0.8" fill="rgba(0,0,0,0.04)" />
        </pattern>
        {/* Meio-fio com profundidade */}
        <linearGradient id="curb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a6178" />
          <stop offset="1" stopColor="#3e4458" />
        </linearGradient>
      </defs>

      {/* ── Piso de asfalto ────────────────────────────────────────────────── */}
      <rect x={B} y={B} width={S} height={S} fill="url(#asphalt)" />
      <rect x={B} y={B} width={S} height={S} fill="url(#asphaltGlow)" />
      <rect x={B} y={B} width={S} height={S} fill="url(#grain)" />

      {/* Corredor da saída */}
      <rect x={T-B} y={EY1} width={CORRIDOR+B} height={cellPx} fill="url(#asphalt)" />
      <rect x={T-B} y={EY1} width={CORRIDOR+B} height={cellPx} fill="url(#grain)" />

      {/* Faixa da saída — leve tom mais quente */}
      <rect x={B} y={EY1} width={S} height={cellPx} fill="rgba(255,214,150,0.045)" />

      {/* ── Linhas de vaga (grade do estacionamento) ───────────────────────── */}
      {[1,2,3,4,5].map(c => (
        <line key={`v${c}`}
          x1={B + c*cellPx} y1={B + 1} x2={B + c*cellPx} y2={T - B - 1}
          stroke="rgba(255,255,255,0.14)" strokeWidth={1.2}
        />
      ))}
      {[1,2,3,4,5].map(r => (
        <line key={`h${r}`}
          x1={B + 1} y1={B + r*cellPx} x2={T - B - 1} y2={B + r*cellPx}
          stroke="rgba(255,255,255,0.11)" strokeWidth={1.2}
        />
      ))}

      {/* ── Faixa de parada na saída ───────────────────────────────────────── */}
      <line
        x1={T - B - 3} y1={EY1 + 4}
        x2={T - B - 3} y2={EY2 - 4}
        stroke="rgba(255,255,255,0.4)" strokeWidth={3}
      />

      {/* ── Meio-fio / perímetro ───────────────────────────────────────────── */}
      <rect x={0} y={0} width={T} height={B} fill="url(#curb)" />
      <rect x={0} y={T-B} width={T} height={B} fill="url(#curb)" />
      <rect x={0} y={0} width={B} height={T} fill="url(#curb)" />
      <rect x={T-B} y={0} width={B} height={EY1} fill="url(#curb)" />
      <rect x={T-B} y={EY2} width={B} height={T-EY2} fill="url(#curb)" />
      <rect x={T-B} y={EY1-B} width={CORRIDOR+B} height={B} fill="url(#curb)" />
      <rect x={T-B} y={EY2}   width={CORRIDOR+B} height={B} fill="url(#curb)" />

      {/* Realces do meio-fio (luz no topo/esquerda, sombra na base/direita) */}
      <line x1={B} y1={B} x2={T-B} y2={B} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      <line x1={B} y1={B} x2={B} y2={T-B} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      <line x1={0} y1={T-1} x2={T} y2={T-1} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      <line x1={T-1} y1={0} x2={T-1} y2={EY1} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />

      {/* ── Zebrado + seta de saída no corredor ────────────────────────────── */}
      {[0,1,2].map(i => (
        <line key={`zb${i}`}
          x1={T - B + 2 + i*4} y1={EY1 + 5}
          x2={T - B + 2 + i*4} y2={EY2 - 5}
          stroke="rgba(255,255,255,0.18)" strokeWidth={2}
        />
      ))}
      <line
        x1={ax1 + 6} y1={AY} x2={ax2 - 8} y2={AY}
        stroke="rgba(140,220,150,0.85)" strokeWidth={3} strokeLinecap="round"
      />
      <polygon
        points={`${ax2-10},${AY-7} ${ax2+1},${AY} ${ax2-10},${AY+7}`}
        fill="rgba(140,220,150,0.9)"
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
  // Imagem (PNG) de cada carro do nível — determinístico, varia por nível.
  const carImages = useMemo(
    () => assignCarImages(puzzleIdx, currentLevel.cars),
    [puzzleIdx, currentLevel],
  );

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
                  <CarImage
                    src={carImages[car.id]}
                    orientation={car.orientation}
                    isTarget={car.id === "target"}
                    cellPx={cellPx}
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
