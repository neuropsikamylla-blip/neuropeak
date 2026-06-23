"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ── Tipos ─────────────────────────────────────────────────────────────────────
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
  difficulty: "Fácil" | "Médio" | "Difícil";
  maxMoves: number;
  idealMoves: number;
  cars: Car[];
}
interface PuzzleResult {
  moves: number;
  idealMoves: number;
  timeSec: number;
}

// ── Constantes ────────────────────────────────────────────────────────────────
const GRID = 6;
const PUZZLES_PER_SESSION = 5;

// ── Cores dos veículos (inline para evitar purge do Tailwind) ─────────────────
const CAR_PALETTE: Record<string, { bg: string; border: string }> = {
  red:    { bg: "#EF4444", border: "#B91C1C" },
  teal:   { bg: "#14B8A6", border: "#0D9488" },
  purple: { bg: "#A855F7", border: "#7C3AED" },
  blue:   { bg: "#3B82F6", border: "#1D4ED8" },
  yellow: { bg: "#EAB308", border: "#A16207" },
  orange: { bg: "#F97316", border: "#C2410C" },
  pink:   { bg: "#EC4899", border: "#BE185D" },
  indigo: { bg: "#6366F1", border: "#4338CA" },
  lime:   { bg: "#84CC16", border: "#4D7C0F" },
  slate:  { bg: "#64748B", border: "#334155" },
};

// ── Fases / Puzzles ───────────────────────────────────────────────────────────
// Convenção: target sempre horizontal na linha 2; saída à direita (col≥GRID).
// Validação: nenhum par de carros ocupa a mesma célula no estado inicial.
const ALL_LEVELS: Level[] = [
  {
    id: 1, difficulty: "Fácil", maxMoves: 6, idealMoves: 2,
    cars: [
      { id:"target", row:2, col:3, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:1, col:5, len:2, orientation:"vertical",   color:"teal" },
    ],
    // A=(1,5)(2,5) bloqueia (2,5). Mover A para cima → target sai.
  },
  {
    id: 2, difficulty: "Fácil", maxMoves: 8, idealMoves: 3,
    cars: [
      { id:"target", row:2, col:1, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:3, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:1, col:4, len:2, orientation:"vertical",   color:"purple" },
    ],
    // A bloqueia (2,3); B bloqueia (2,4). B↑, A↓, target sai.
  },
  {
    id: 3, difficulty: "Fácil", maxMoves: 10, idealMoves: 4,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:3, col:1, len:2, orientation:"horizontal", color:"blue" },
      { id:"C",      row:1, col:4, len:2, orientation:"vertical",   color:"purple" },
    ],
    // B bloqueia A de descer; C bloqueia (2,4). B←, A↓, C↑, target sai.
  },
  {
    id: 4, difficulty: "Médio", maxMoves: 12, idealMoves: 5,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"D",      row:3, col:3, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:4, col:2, len:2, orientation:"horizontal", color:"orange" },
    ],
    // D bloqueia B (linha 3 col 3-4); E bloqueia A (linha 4 col 2).
    // D←, E←(col 0), A↓, B↓, target sai.
  },
  {
    id: 5, difficulty: "Médio", maxMoves: 12, idealMoves: 5,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:2, len:2, orientation:"horizontal", color:"yellow" },
    ],
    // D bloqueia A de descer; C bloqueia (2,5). D←, A↓, B↓, C↑, target sai.
  },
  {
    id: 6, difficulty: "Médio", maxMoves: 14, idealMoves: 6,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"orange" },
    ],
    // F bloqueia (2,3); D bloqueia A. D←, A↓, F↑, B↓, C↑, target sai.
  },
  {
    id: 7, difficulty: "Médio", maxMoves: 16, idealMoves: 7,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"F",      row:1, col:3, len:2, orientation:"vertical",   color:"orange" },
      { id:"H",      row:4, col:3, len:2, orientation:"horizontal", color:"pink" },
    ],
    // H bloqueia F de descer para row 4. H←(col 0), D←, A↓, F↓, B↓, C↑, target sai.
  },
  {
    id: 8, difficulty: "Difícil", maxMoves: 18, idealMoves: 7,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"orange" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"pink" },
    ],
    // E bloqueia (2,3); F bloqueia B de descer para row 4. D←, A↓, E↓, F←(col 0), B↓, C↑, target sai.
  },
  {
    id: 9, difficulty: "Difícil", maxMoves: 20, idealMoves: 8,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"orange" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"pink" },
      { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
    ],
    // G bloqueia A de descer para row 5. G→(col 3), D←, A↓, E↓, F←, B↓, C↑, target sai.
  },
  {
    id: 10, difficulty: "Difícil", maxMoves: 22, idealMoves: 9,
    cars: [
      { id:"target", row:2, col:0, len:2, orientation:"horizontal", color:"red" },
      { id:"A",      row:0, col:2, len:3, orientation:"vertical",   color:"teal" },
      { id:"B",      row:0, col:4, len:3, orientation:"vertical",   color:"purple" },
      { id:"C",      row:1, col:5, len:2, orientation:"vertical",   color:"blue" },
      { id:"D",      row:3, col:1, len:2, orientation:"horizontal", color:"yellow" },
      { id:"E",      row:0, col:3, len:3, orientation:"vertical",   color:"orange" },
      { id:"F",      row:4, col:4, len:2, orientation:"horizontal", color:"pink" },
      { id:"G",      row:5, col:1, len:2, orientation:"horizontal", color:"indigo" },
      { id:"H",      row:3, col:0, len:2, orientation:"vertical",   color:"slate" },
    ],
    // H=(3,0)(4,0) bloqueia D de ir para col 0. H↓, G→, D←, A↓, E↓, F←, B↓, C↑, target sai.
  },
];

// ── Lógica de jogo ────────────────────────────────────────────────────────────
function occupiedCells(car: Car): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < car.len; i++) {
    cells.push(car.orientation === "horizontal"
      ? [car.row, car.col + i]
      : [car.row + i, car.col]);
  }
  return cells;
}

function buildGrid(cars: Car[]): boolean[][] {
  const grid: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  for (const car of cars) {
    for (const [r, c] of occupiedCells(car)) {
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) grid[r][c] = true;
    }
  }
  return grid;
}

function canMove(cars: Car[], carId: string, newPos: number): boolean {
  const car = cars.find(c => c.id === carId)!;
  const isTarget = car.id === "target";

  if (car.orientation === "horizontal") {
    const maxC = isTarget ? GRID - car.len + 1 : GRID - car.len;
    if (newPos < 0 || newPos > maxC) return false;
    // Para target na posição de saída: não checar colisão (já saiu)
    if (isTarget && newPos >= GRID - car.len + 1) return true;
    const grid = buildGrid(cars.filter(c => c.id !== carId));
    for (let i = 0; i < car.len; i++) {
      const c = newPos + i;
      if (c < GRID && grid[car.row][c]) return false;
    }
  } else {
    if (newPos < 0 || newPos > GRID - car.len) return false;
    const grid = buildGrid(cars.filter(c => c.id !== carId));
    for (let i = 0; i < car.len; i++) {
      const r = newPos + i;
      if (r < GRID && grid[r][car.col]) return false;
    }
  }
  return true;
}

function isWin(cars: Car[]): boolean {
  const t = cars.find(c => c.id === "target");
  return !!t && t.col + t.len >= GRID;
}

// ── Componente principal ───────────────────────────────────────────────────────
interface Props {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
  const markProgress = useExerciseProgress();

  // Selecionar subconjunto de níveis baseado na dificuldade
  const startIdx = difficulty <= 3 ? 0 : difficulty <= 6 ? 2 : 5;
  const sessionLevels = ALL_LEVELS.slice(startIdx, startIdx + PUZZLES_PER_SESSION);

  const [puzzleIdx, setPuzzleIdx]       = useState(0);
  const [cars, setCars]                 = useState<Car[]>(() => sessionLevels[0].cars.map(c => ({ ...c })));
  const [moves, setMoves]               = useState(0);
  const [history, setHistory]           = useState<Car[][]>([]);
  const [won, setWon]                   = useState(false);
  const [puzzleResults, setPuzzleResults] = useState<PuzzleResult[]>([]);
  const [exerciseDone, setExerciseDone] = useState(false);

  const [elapsed, setElapsed]           = useState(0);
  const timerRef                        = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef                    = useRef(Date.now());

  const [hintId, setHintId]             = useState<string | null>(null);

  // Drag state
  const gridRef     = useRef<HTMLDivElement>(null);
  const dragRef     = useRef<{
    carId: string;
    axis: "horizontal" | "vertical";
    startPx: number;
    startPos: number;
    currentPos: number;
  } | null>(null);
  const [dragPreview, setDragPreview]   = useState<{ id: string; pos: number } | null>(null);

  const currentLevel = sessionLevels[puzzleIdx];

  // Timer
  useEffect(() => {
    if (won || exerciseDone) { if (timerRef.current) clearInterval(timerRef.current); return; }
    startTimeRef.current = Date.now() - elapsed * 1000;
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleIdx, won, exerciseDone]);

  // Init puzzle
  const initPuzzle = useCallback((idx: number) => {
    const lvl = sessionLevels[idx];
    setCars(lvl.cars.map(c => ({ ...c })));
    setMoves(0);
    setHistory([]);
    setWon(false);
    setElapsed(0);
    setDragPreview(null);
    setHintId(null);
    startTimeRef.current = Date.now();
  }, [sessionLevels]);

  // Checar vitória
  const checkWin = useCallback((newCars: Car[]) => {
    if (isWin(newCars)) {
      setWon(true);
      const timeSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const result: PuzzleResult = { moves: moves + 1, idealMoves: currentLevel.idealMoves, timeSec };
      const allResults = [...puzzleResults, result];
      setPuzzleResults(allResults);
      markProgress(Math.round(((puzzleIdx + 1) / PUZZLES_PER_SESSION) * 100));

      if (puzzleIdx + 1 >= PUZZLES_PER_SESSION) {
        setExerciseDone(true);
      }
    }
  }, [moves, currentLevel.idealMoves, puzzleResults, puzzleIdx, markProgress]);

  // Executar movimento
  const applyMove = useCallback((carId: string, newPos: number) => {
    if (!canMove(cars, carId, newPos)) return;
    setHistory(h => [...h, cars.map(c => ({ ...c }))]);
    const newCars = cars.map(c => c.id === carId
      ? { ...c, [c.orientation === "horizontal" ? "col" : "row"]: newPos }
      : c);
    setCars(newCars);
    setMoves(m => m + 1);
    checkWin(newCars);
  }, [cars, checkWin]);

  // Desfazer
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCars(prev);
    setHistory(h => h.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setWon(false);
  }, [history]);

  // Reiniciar puzzle
  const restart = useCallback(() => initPuzzle(puzzleIdx), [initPuzzle, puzzleIdx]);

  // Dica: piscar carro com movimento disponível
  const hint = useCallback(() => {
    const movable = cars.find(car => {
      const pos = car.orientation === "horizontal" ? car.col : car.row;
      return canMove(cars, car.id, pos - 1) || canMove(cars, car.id, pos + 1);
    });
    if (!movable) return;
    setHintId(movable.id);
    setTimeout(() => setHintId(null), 1800);
  }, [cars]);

  // ── Drag / Pointer events ────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent, car: Car) => {
    if (won) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      carId: car.id,
      axis: car.orientation,
      startPx: car.orientation === "horizontal" ? e.clientX : e.clientY,
      startPos: car.orientation === "horizontal" ? car.col : car.row,
      currentPos: car.orientation === "horizontal" ? car.col : car.row,
    };
    setDragPreview({ id: car.id, pos: car.orientation === "horizontal" ? car.col : car.row });
  }, [won]);

  const onPointerMove = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const cellPx = rect.width / GRID;
    const px = d.axis === "horizontal" ? e.clientX : e.clientY;
    const delta = Math.round((px - d.startPx) / cellPx);
    const target = d.startPos + delta;
    const clamped = Math.max(0, Math.min(
      car.id === "target" ? GRID - car.len + 1 : GRID - car.len,
      target
    ));
    d.currentPos = clamped;
    setDragPreview({ id: car.id, pos: clamped });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id) return;
    dragRef.current = null;
    setDragPreview(null);
    const origPos = car.orientation === "horizontal" ? car.col : car.row;
    if (d.currentPos !== origPos) {
      applyMove(car.id, d.currentPos);
    }
  }, [applyMove]);

  // ── Avançar puzzle ───────────────────────────────────────────────────────────
  const nextPuzzle = () => {
    const ni = puzzleIdx + 1;
    if (ni >= PUZZLES_PER_SESSION) {
      finishExercise();
    } else {
      setPuzzleIdx(ni);
      initPuzzle(ni);
    }
  };

  const finishExercise = () => {
    const allResults = puzzleResults.length > 0 ? puzzleResults : [{ moves: moves + 1, idealMoves: currentLevel.idealMoves, timeSec: elapsed }];
    const avgEfficiency = allResults.reduce((s, r) => s + Math.min(1, r.idealMoves / Math.max(1, r.moves)), 0) / allResults.length;
    const totalTime = allResults.reduce((s, r) => s + r.timeSec, 0);
    const score = Math.round(avgEfficiency * 100);
    onComplete({
      exerciseId: "estacionamento-logico",
      domain: "executive",
      score,
      accuracy: avgEfficiency,
      reactionTime: (totalTime / allResults.length) * 1000,
      difficulty,
      duration: totalTime,
      metadata: { puzzlesSolved: allResults.length, avgEfficiency: Math.round(avgEfficiency * 100) },
    });
  };

  // ── Layout helpers ───────────────────────────────────────────────────────────
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const efficiency = Math.min(100, moves > 0 ? Math.round((currentLevel.idealMoves / moves) * 100) : 100);
  const focusLabel = efficiency >= 80 ? "Alto" : efficiency >= 50 ? "Médio" : "Baixo";
  const focusColor = efficiency >= 80 ? "text-green-600" : efficiency >= 50 ? "text-yellow-600" : "text-red-500";

  // Cores do tema
  const isLight = theme === "CLINICAL" || theme === "COLORFUL";
  const pageBg  = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-indigo-50" : "bg-slate-50";
  const cardBg  = theme === "GAMIFIED" ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200";
  const textPrimary = theme === "GAMIFIED" ? "text-white" : "text-slate-800";
  const textSub     = theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500";
  const accentCls   = theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-indigo-500" : "bg-blue-600";
  const accentTxt   = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-indigo-600" : "text-blue-700";
  const gridBg      = theme === "GAMIFIED" ? "#111827" : "#F8FAFC";
  const gridBorder  = theme === "GAMIFIED" ? "#374151" : "#CBD5E1";
  const cellBg      = theme === "GAMIFIED" ? "#1F2937" : "#F1F5F9";

  // ── Tela de conclusão do exercício ───────────────────────────────────────────
  if (exerciseDone) {
    const totalMoves = puzzleResults.reduce((s, r) => s + r.moves, 0);
    const totalIdeal = puzzleResults.reduce((s, r) => s + r.idealMoves, 0);
    const totalTime  = puzzleResults.reduce((s, r) => s + r.timeSec, 0);
    const avg        = Math.round((totalIdeal / Math.max(1, totalMoves)) * 100);
    return (
      <div className={`${pageBg} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${cardBg} border rounded-2xl p-6 max-w-sm w-full shadow-lg`}>
          <div className="text-4xl text-center mb-2">🎯</div>
          <h2 className={`text-xl font-bold text-center mb-1 ${textPrimary}`}>Sessão Concluída!</h2>
          <p className={`text-sm text-center mb-5 ${textSub}`}>Estacionamento Lógico</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Stat label="Puzzles resolvidos" value={`${puzzleResults.length}`}     sub="de 5" />
            <Stat label="Eficiência média"   value={`${avg}%`}                      sub="movimentos" />
            <Stat label="Tempo total"         value={fmtTime(totalTime)}             sub="minutos" />
            <Stat label="Movimentos"          value={`${totalMoves}`}               sub={`ideal: ${totalIdeal}`} />
          </div>

          <div className={`rounded-xl p-4 mb-5 ${theme === "GAMIFIED" ? "bg-gray-800" : "bg-slate-50 border border-slate-200"}`}>
            <p className={`text-xs font-semibold mb-1 ${accentTxt}`}>Habilidade principal treinada</p>
            <p className={`text-sm font-bold mb-2 ${textPrimary}`}>Planejamento & Funções Executivas</p>
            <p className={`text-xs ${textSub}`}>
              {avg >= 80
                ? "Excelente antecipação! Você conseguiu planejar sequências de movimentos antes de executá-los."
                : avg >= 60
                ? "Bom trabalho! Tente antecipar 2 movimentos antes de mover o primeiro veículo."
                : "Continue praticando! Faça uma pausa antes de mover — visualize o caminho completo primeiro."}
            </p>
          </div>

          <button
            onClick={finishExercise}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm ${accentCls}`}
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  // ── Tela de puzzle resolvido (entre puzzles) ─────────────────────────────────
  if (won && !exerciseDone) {
    const last = puzzleResults[puzzleResults.length - 1];
    const eff  = last ? Math.min(100, Math.round((last.idealMoves / Math.max(1, last.moves)) * 100)) : 100;
    return (
      <div className={`${pageBg} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${cardBg} border rounded-2xl p-6 max-w-sm w-full shadow-lg text-center`}>
          <div className="text-5xl mb-3">✅</div>
          <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>Caminho liberado!</h2>
          <p className={`text-sm mb-5 ${textSub}`}>Nível {currentLevel.id} · {currentLevel.difficulty}</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <Stat label="Movimentos"    value={`${last?.moves ?? moves}`} sub={`ideal: ${currentLevel.idealMoves}`} />
            <Stat label="Eficiência"    value={`${eff}%`}                 sub="precisão" />
            <Stat label="Tempo"         value={fmtTime(last?.timeSec ?? elapsed)} sub="segundos" />
          </div>

          <p className={`text-xs mb-5 ${textSub}`}>
            {eff >= 90 ? "Planejamento impecável — mínimo de movimentos!" :
             eff >= 70 ? "Bom planejamento! Tente antecipar o próximo passo antes de agir." :
                         "Dica: observe todo o tabuleiro antes de começar a mover."}
          </p>

          <button
            onClick={nextPuzzle}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm ${accentCls}`}
          >
            {puzzleIdx + 1 < PUZZLES_PER_SESSION ? "Próximo puzzle" : "Ver resultado"}
          </button>
        </div>
      </div>
    );
  }

  // ── Tabuleiro principal ───────────────────────────────────────────────────────
  const pct = (n: number) => `${(n / GRID) * 100}%`;
  const GAP = 3; // px entre células

  return (
    <div className={`${pageBg} min-h-screen pb-8`}>
      <div className="max-w-sm mx-auto px-4 pt-4">

        {/* Cabeçalho */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-0.5">
            <div>
              <h1 className={`text-base font-bold leading-none ${textPrimary}`}>Estacionamento Lógico</h1>
              <p className={`text-xs ${textSub}`}>Planejamento Espacial</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              currentLevel.difficulty === "Fácil"  ? "bg-green-100 text-green-700" :
              currentLevel.difficulty === "Médio"  ? "bg-yellow-100 text-yellow-700" :
                                                     "bg-red-100 text-red-600"
            }`}>
              Nível {currentLevel.id} · {currentLevel.difficulty}
            </span>
          </div>
        </div>

        {/* Objetivo + habilidades */}
        <div className={`rounded-xl p-3 mb-3 border ${cardBg}`}>
          <p className={`text-xs font-semibold mb-1.5 ${textPrimary}`}>
            🎯 Libere o carro vermelho pela saída à direita
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Atenção", "Planejamento", "Raciocínio lógico", "Memória operacional"].map(s => (
              <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                theme === "GAMIFIED" ? "border-gray-700 text-gray-400 bg-gray-800" : "border-slate-200 text-slate-500 bg-slate-50"
              }`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className={`grid grid-cols-4 gap-2 mb-3 rounded-xl p-3 border ${cardBg}`}>
          <MetricCell label="Movimentos"   value={`${moves}`}           sub={`meta: ${currentLevel.idealMoves}`} theme={theme} />
          <MetricCell label="Tempo"        value={fmtTime(elapsed)}     sub="cronômetro"                          theme={theme} />
          <MetricCell label="Eficiência"   value={`${efficiency}%`}     sub="precisão"                            theme={theme} />
          <div className="text-center">
            <p className={`text-[10px] mb-0.5 ${textSub}`}>Foco</p>
            <p className={`text-sm font-bold ${focusColor}`}>{focusLabel}</p>
          </div>
        </div>

        {/* Tabuleiro */}
        <div className="relative mb-3">
          {/* Seta de saída */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 flex flex-col items-center">
            <div className={`w-4 h-4 ${accentTxt}`} style={{ fontSize: 16 }}>→</div>
          </div>

          <div
            ref={gridRef}
            className="relative rounded-xl overflow-hidden select-none"
            style={{
              width: "100%",
              aspectRatio: "1",
              background: gridBg,
              border: `2px solid ${gridBorder}`,
            }}
          >
            {/* Células de fundo */}
            {Array.from({ length: GRID }, (_, r) =>
              Array.from({ length: GRID }, (_, c) => (
                <div key={`${r}-${c}`} style={{
                  position: "absolute",
                  left: `calc(${pct(c)} + ${GAP / 2}px)`,
                  top:  `calc(${pct(r)} + ${GAP / 2}px)`,
                  width:  `calc(${pct(1)} - ${GAP}px)`,
                  height: `calc(${pct(1)} - ${GAP}px)`,
                  background: cellBg,
                  borderRadius: 4,
                }} />
              ))
            )}

            {/* Veículos */}
            {cars.map(car => {
              const isTarget    = car.id === "target";
              const isHint      = car.id === hintId;
              const isBeingDrag = dragPreview?.id === car.id;
              const pos         = isBeingDrag ? dragPreview!.pos
                : (car.orientation === "horizontal" ? car.col : car.row);
              const palette     = CAR_PALETTE[car.color] ?? CAR_PALETTE.slate;

              const style: React.CSSProperties = {
                position: "absolute",
                borderRadius: 8,
                cursor: won ? "default" : "grab",
                touchAction: "none",
                zIndex: isBeingDrag ? 20 : 10,
                transition: isBeingDrag ? "none" : "left 0.15s, top 0.15s, box-shadow 0.15s",
                background: isHint
                  ? `repeating-linear-gradient(45deg, ${palette.bg}, ${palette.bg} 6px, ${palette.border} 6px, ${palette.border} 12px)`
                  : palette.bg,
                border: `2px solid ${palette.border}`,
                boxShadow: isBeingDrag
                  ? `0 8px 20px rgba(0,0,0,0.35)`
                  : isTarget
                  ? `0 3px 10px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.25)`
                  : `0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)`,
                transform: isBeingDrag ? "scale(1.04)" : "scale(1)",
                willChange: "left, top",
              };

              if (car.orientation === "horizontal") {
                style.left   = `calc(${pct(pos)} + ${GAP / 2}px)`;
                style.top    = `calc(${pct(car.row)} + ${GAP / 2}px)`;
                style.width  = `calc(${pct(car.len)} - ${GAP}px)`;
                style.height = `calc(${pct(1)} - ${GAP}px)`;
              } else {
                style.left   = `calc(${pct(car.col)} + ${GAP / 2}px)`;
                style.top    = `calc(${pct(pos)} + ${GAP / 2}px)`;
                style.width  = `calc(${pct(1)} - ${GAP}px)`;
                style.height = `calc(${pct(car.len)} - ${GAP}px)`;
              }

              return (
                <div
                  key={car.id}
                  style={style}
                  onPointerDown={e => onPointerDown(e, car)}
                  onPointerMove={e => onPointerMove(e, car)}
                  onPointerUp={e => onPointerUp(e, car)}
                >
                  {/* Ícone no centro */}
                  <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: isTarget ? 16 : 12, userSelect: "none",
                  }}>
                    {isTarget ? "🚗" : "🚙"}
                  </div>
                  {/* Indicador de direção */}
                  {car.orientation === "horizontal" && (
                    <div style={{
                      position: "absolute", right: 4, top: "50%",
                      transform: "translateY(-50%)", fontSize: 10,
                      color: "rgba(255,255,255,0.6)",
                    }}>↔</div>
                  )}
                  {car.orientation === "vertical" && (
                    <div style={{
                      position: "absolute", bottom: 2, left: "50%",
                      transform: "translateX(-50%)", fontSize: 10,
                      color: "rgba(255,255,255,0.6)",
                    }}>↕</div>
                  )}
                </div>
              );
            })}

            {/* Indicador de saída (linha direita) */}
            <div style={{
              position: "absolute",
              right: -2, top: `calc(${pct(2)} + ${GAP / 2}px)`,
              width: 4,
              height: `calc(${pct(1)} - ${GAP}px)`,
              background: theme === "GAMIFIED" ? "#06B6D4" : "#2563EB",
              borderRadius: 2,
            }} />
          </div>
        </div>

        {/* Controles */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-opacity
              ${history.length === 0 ? "opacity-40 cursor-not-allowed" : ""}
              ${cardBg} ${textPrimary}`}
          >
            ↩ Desfazer
          </button>
          <button
            onClick={hint}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-opacity ${cardBg} ${textPrimary}`}
          >
            💡 Dica
          </button>
          <button
            onClick={restart}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-opacity ${cardBg} ${textPrimary}`}
          >
            🔄 Reiniciar
          </button>
        </div>

        {/* Progresso dos puzzles */}
        <div className="flex gap-1.5 justify-center">
          {sessionLevels.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
              i < puzzleIdx
                ? (theme === "GAMIFIED" ? "bg-cyan-400" : "bg-blue-500")
                : i === puzzleIdx
                ? (theme === "GAMIFIED" ? "bg-cyan-300" : "bg-blue-300")
                : (theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200")
            }`} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Sub-componentes utilitários ───────────────────────────────────────────────
function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MetricCell({ label, value, sub, theme }: { label: string; value: string; sub?: string; theme: Theme }) {
  const textSub = theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500";
  const textMain = theme === "GAMIFIED" ? "text-white" : "text-slate-800";
  return (
    <div className="text-center">
      <p className={`text-[10px] mb-0.5 ${textSub}`}>{label}</p>
      <p className={`text-sm font-bold leading-none ${textMain}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${textSub}`}>{sub}</p>}
    </div>
  );
}
