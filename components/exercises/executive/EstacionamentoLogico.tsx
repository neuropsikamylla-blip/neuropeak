"use client";

import { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { assignCarImages, ALL_CAR_IMAGES } from "@/lib/parking-cars";
import type { ExerciseResult, Theme } from "@/types";

// ── Layout constants ──────────────────────────────────────────────────────────
const GRID     = 6;
const BORDER   = 11;   // curb thickness px (meio-fio amarelo/preto)
const PARKING_BG = "/exercises/Carros/parking-bg.jpg"; // foto do estacionamento (fundo)
const EXIT_ROW = 2;    // target car row (0-indexed, from bottom)
const CORRIDOR = 26;   // exit corridor width px (outside board)

// ── Types ─────────────────────────────────────────────────────────────────────
interface Car {
  id: string; row: number; col: number; len: number;
  orientation: "horizontal" | "vertical"; color?: string;
}
interface Level { id: number; idealMoves: number; cars: Car[] }
interface DragState {
  carId: string; axis: "horizontal" | "vertical";
  startPx: number; startPos: number; currentPos: number;
}

// ── Puzzle levels ─────────────────────────────────────────────────────────────
const ALL_LEVELS: Level[] = [
  { id:1,  idealMoves:2, cars:[
    { id:"target", row:2, col:3, len:2, orientation:"horizontal" },
    { id:"A", row:1, col:5, len:2, orientation:"vertical" },
  ]},
  { id:2,  idealMoves:3, cars:[
    { id:"target", row:2, col:1, len:2, orientation:"horizontal" },
    { id:"A", row:0, col:3, len:3, orientation:"vertical" },
    { id:"B", row:1, col:4, len:2, orientation:"vertical" },
  ]},
  { id:3,  idealMoves:4, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal" },
    { id:"A", row:0, col:2, len:3, orientation:"vertical" },
    { id:"B", row:3, col:1, len:2, orientation:"horizontal" },
    { id:"C", row:1, col:4, len:2, orientation:"vertical" },
  ]},
  { id:4, idealMoves:6, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal" },
    { id:"A", row:5, col:1, len:3, orientation:"horizontal" },
    { id:"B", row:4, col:0, len:3, orientation:"horizontal" },
    { id:"C", row:1, col:1, len:2, orientation:"horizontal" },
    { id:"D", row:3, col:2, len:2, orientation:"horizontal" },
    { id:"E", row:0, col:1, len:2, orientation:"horizontal" },
    { id:"F", row:1, col:4, len:2, orientation:"vertical" },
    { id:"G", row:0, col:3, len:3, orientation:"vertical" },
    { id:"H", row:1, col:5, len:2, orientation:"vertical" },
  ]},
  { id:5, idealMoves:7, cars:[
    { id:"target", row:2, col:1, len:2, orientation:"horizontal" },
    { id:"A", row:3, col:1, len:2, orientation:"horizontal" },
    { id:"B", row:1, col:4, len:3, orientation:"vertical" },
    { id:"C", row:1, col:1, len:3, orientation:"horizontal" },
    { id:"D", row:3, col:3, len:3, orientation:"vertical" },
    { id:"E", row:1, col:5, len:2, orientation:"vertical" },
    { id:"F", row:4, col:4, len:2, orientation:"horizontal" },
    { id:"G", row:0, col:2, len:3, orientation:"horizontal" },
    { id:"H", row:5, col:0, len:2, orientation:"horizontal" },
  ]},
  { id:6, idealMoves:8, cars:[
    { id:"target", row:2, col:2, len:2, orientation:"horizontal" },
    { id:"A", row:0, col:1, len:2, orientation:"vertical" },
    { id:"B", row:0, col:3, len:2, orientation:"vertical" },
    { id:"C", row:5, col:3, len:3, orientation:"horizontal" },
    { id:"D", row:4, col:2, len:2, orientation:"vertical" },
    { id:"E", row:3, col:1, len:3, orientation:"horizontal" },
    { id:"F", row:3, col:0, len:3, orientation:"vertical" },
    { id:"G", row:1, col:5, len:3, orientation:"vertical" },
    { id:"H", row:4, col:3, len:2, orientation:"horizontal" },
  ]},
  { id:7, idealMoves:9, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal" },
    { id:"A", row:3, col:1, len:3, orientation:"horizontal" },
    { id:"B", row:3, col:0, len:3, orientation:"vertical" },
    { id:"C", row:1, col:4, len:3, orientation:"vertical" },
    { id:"D", row:5, col:4, len:2, orientation:"horizontal" },
    { id:"E", row:1, col:5, len:2, orientation:"vertical" },
    { id:"F", row:4, col:1, len:2, orientation:"horizontal" },
    { id:"G", row:1, col:2, len:2, orientation:"vertical" },
    { id:"H", row:4, col:3, len:2, orientation:"horizontal" },
  ]},
  { id:8, idealMoves:10, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal" },
    { id:"A", row:1, col:3, len:3, orientation:"vertical" },
    { id:"B", row:0, col:5, len:3, orientation:"vertical" },
    { id:"C", row:3, col:1, len:2, orientation:"vertical" },
    { id:"D", row:0, col:1, len:2, orientation:"horizontal" },
    { id:"E", row:4, col:4, len:2, orientation:"horizontal" },
  ]},
  { id:9, idealMoves:13, cars:[
    { id:"target", row:2, col:0, len:2, orientation:"horizontal" },
    { id:"A", row:2, col:2, len:3, orientation:"vertical" },
    { id:"B", row:0, col:3, len:3, orientation:"vertical" },
    { id:"C", row:0, col:5, len:2, orientation:"vertical" },
    { id:"D", row:4, col:1, len:2, orientation:"vertical" },
    { id:"E", row:4, col:3, len:2, orientation:"horizontal" },
    { id:"F", row:1, col:4, len:3, orientation:"vertical" },
  ]},
  { id:10, idealMoves:14, cars:[
    { id:"target", row:2, col:1, len:2, orientation:"horizontal" },
    { id:"A", row:0, col:5, len:2, orientation:"vertical" },
    { id:"B", row:3, col:0, len:3, orientation:"vertical" },
    { id:"C", row:2, col:3, len:3, orientation:"vertical" },
    { id:"D", row:3, col:2, len:2, orientation:"vertical" },
    { id:"E", row:1, col:0, len:3, orientation:"horizontal" },
    { id:"F", row:2, col:5, len:2, orientation:"vertical" },
    { id:"G", row:4, col:4, len:2, orientation:"horizontal" },
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
        {/* Sombra de contato do painel no asfalto */}
        <filter id="boardShadow" x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#05070c" floodOpacity="0.55" />
        </filter>
        {/* Glow suave da seta de saída */}
        <filter id="exitGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Corredor/rampa de saída (continua para fora, escuro) ───────────── */}
      <rect x={T-B-4} y={EY1} width={CORRIDOR+B+4} height={cellPx} rx={5}
        fill="#10151f" filter="url(#boardShadow)" />
      <rect x={T-B-2} y={EY1+3} width={CORRIDOR+B} height={cellPx-6} rx={3}
        fill="rgba(36,44,66,0.9)" />

      {/* ── Moldura fina elevada + sombra de contato ───────────────────────── */}
      <rect x={0} y={0} width={T} height={T} rx={13}
        fill="#10151f" filter="url(#boardShadow)" />

      {/* ── Piso do tabuleiro: painel translúcido (área demarcada) ─────────── */}
      <rect x={B} y={B} width={S} height={S} rx={7} fill="rgba(33,41,62,0.82)" />

      {/* Grade do exercício — linhas bem sutis */}
      {Array.from({ length: GRID - 1 }).map((_, i) => (
        <line key={`v${i}`}
          x1={B + (i+1)*cellPx} y1={B + 2} x2={B + (i+1)*cellPx} y2={T - B - 2}
          stroke="rgba(255,255,255,0.10)" strokeWidth={1.2}
        />
      ))}
      {Array.from({ length: GRID - 1 }).map((_, i) => (
        <line key={`h${i}`}
          x1={B + 2} y1={B + (i+1)*cellPx} x2={T - B - 2} y2={B + (i+1)*cellPx}
          stroke="rgba(255,255,255,0.08)" strokeWidth={1.2}
        />
      ))}

      {/* Realce de elevação (luz no topo/esquerda) + abertura da saída */}
      <rect x={0.75} y={0.75} width={T-1.5} height={T-1.5} rx={12.5}
        fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={1.5} />
      {/* "apaga" a moldura na saída → abertura real para a rampa */}
      <rect x={T-B-1} y={EY1+3} width={B+2} height={cellPx-6} fill="rgba(36,44,66,0.9)" />

      {/* ── Seta de saída (luminosa, no chão da rampa) ─────────────────────── */}
      <g filter="url(#exitGlow)">
        <line x1={ax1 + 10} y1={AY} x2={ax2 - 7} y2={AY}
          stroke="#9CF0A6" strokeWidth={4} strokeLinecap="round" />
        <polygon points={`${ax2-9},${AY-8} ${ax2+2},${AY} ${ax2-9},${AY+8}`} fill="#9CF0A6" />
      </g>
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

  // Pré-carrega todas as imagens dos carros no mount (evita atraso/piscar ao
  // trocar de fase). 38 PNGs leves (~74KB) → cache do navegador.
  useEffect(() => {
    ALL_CAR_IMAGES.forEach((src) => { const im = new window.Image(); im.src = src; });
  }, []);

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

  // Avança de fase APENAS quando o paciente resolveu no nº ideal de movimentos.
  // Caso contrário, repete a mesma fase (igual à Torre) — registra e adianta a barra
  // só aqui, na passagem de fase.
  const advance = () => {
    const res = { moves, ideal: currentLevel.idealMoves };
    const newLog = [...resultsRef.current, res];
    resultsRef.current = newLog;
    setResultsLog(newLog);
    const done = puzzleIdx + 1;
    markProgress(Math.round((done / TOTAL_PHASES) * 100));
    if (done >= TOTAL_PHASES) { finish(); }
    else { setPuzzleIdx(done); loadPuzzle(done); }
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
        if (isWin(next)) setWon(true);
        return nm;
      });
      return next;
    });
  }, []);

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
    const ideal    = currentLevel.idealMoves;
    const optimal  = moves <= ideal;       // resolveu no nº ideal de movimentos?
    const isLast   = puzzleIdx + 1 >= TOTAL_PHASES;
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#ECEAE4" }}>
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light mb-8" style={{ color: optimal ? "#2E9E4F" : "#3A4050" }}>
            {optimal ? "Perfeito!" : "Quase lá"}
          </p>
          <div className="flex justify-center gap-14 mb-8">
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: optimal ? "#2E9E4F" : "#3A4050" }}>{moves}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Movimentos</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: "#B0BAC8" }}>{ideal}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Melhor solução</p>
            </div>
          </div>
          {optimal ? (
            <button
              onClick={advance}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
              style={{ background: "#2C3444" }}
            >
              {isLast ? "Finalizar" : "Próxima fase"}
            </button>
          ) : (
            <>
              <p className="text-sm mb-5" style={{ color: "#6B7384" }}>
                Dá para resolver em <strong>{ideal}</strong> movimentos. Tente outra vez!
              </p>
              <button
                onClick={restart}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
                style={{ background: "#2C3444" }}
              >
                Tentar de novo
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="min-h-screen flex flex-col items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(8,10,16,0.28), rgba(8,10,16,0.4)), url(${PARKING_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#23262e",
      }}
    >
      {/* Instruction — centered, above the board */}
      <p style={{
        marginTop: 22, marginBottom: 12,
        fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
        color: "#F1F3F8",
        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        textAlign: "center",
      }}>
        Libere o carro vermelho pela saída.
      </p>

      {/* Barra de progresso das fases (avança por fase concluída) */}
      <div style={{ width: "100%", maxWidth: 320, margin: "0 auto 12px", display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: "#9CF0A6",
            width: `${Math.round((puzzleIdx / TOTAL_PHASES) * 100)}%`,
            transition: "width 0.5s ease",
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#E8ECF2", minWidth: 30, textAlign: "right" }}>
          {Math.round((puzzleIdx / TOTAL_PHASES) * 100)}%
        </span>
      </div>

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
                    left: 0, top: 0, width: w, height: h,
                    cursor: "grab",
                    touchAction: "none",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "transform 0.10s ease",
                    // Movimento via transform (GPU/composited) → sem re-layout nem
                    // re-raster da sombra a cada frame (corrige o "piscar" no arraste).
                    transform: `translate3d(${left}px, ${top}px, 0)${isDragging ? " scale(1.04)" : ""}`,
                    willChange: "transform",
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
