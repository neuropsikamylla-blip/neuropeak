"use client";

import { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { assignCarImages, ALL_CAR_IMAGES } from "@/lib/parking-cars";
import { PARKING_LEVELS, PLAY_LEVELS } from "@/lib/parking-levels";
import type { Level } from "@/types/parking";
import type { ExerciseResult, Theme } from "@/types";

// Escada de níveis 1–10 (ESTACIONAMENTO-PROGRESSAO-SPEC.md): cada nível tem
// dezenas de fases geradas e validadas por BFS. O sorteio evita repetir fases
// já jogadas — inclusive de sessões ANTERIORES (localStorage np-parking-recent).
const RECENT_KEY = "np-parking-recent";
const RECENT_MAX = 40;

function loadRecentIds(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; } // SSR / modo privado
}

// Níveis ordenados por proximidade do alvo (empate → menor primeiro).
function orderedLevels(target: number): number[] {
  return [...PLAY_LEVELS].sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b);
}
// Sorteia uma fase do nível-alvo, NUNCA repetindo as recentes (`recent`, ids
// mais novos primeiro). Se o nível só tem fases já vistas, tenta o nível
// vizinho com fase inédita; em último caso repete a vista há mais tempo.
function pickLevel(targetLevel: number, recent: string[] = []): { level: Level; diff: number } {
  for (const l of orderedLevels(targetLevel)) {
    const pool = PARKING_LEVELS[l].filter((lev) => !recent.includes(lev.id ?? ""));
    if (pool.length) return { level: pool[Math.floor(Math.random() * pool.length)], diff: l };
  }
  const l = orderedLevels(targetLevel)[0];
  const arr = PARKING_LEVELS[l];
  const oldestFirst = [...arr].sort((a, b) => recent.indexOf(b.id ?? "") - recent.indexOf(a.id ?? ""));
  return { level: oldestFirst[0], diff: l };
}
function stepDiff(cur: number, dir: 1 | -1): number {
  const i = PLAY_LEVELS.indexOf(cur);
  const ni = Math.max(0, Math.min(PLAY_LEVELS.length - 1, (i < 0 ? 0 : i) + dir));
  return PLAY_LEVELS[ni];
}

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
interface DragState {
  carId: string; axis: "horizontal" | "vertical";
  startPx: number; startPos: number; currentPos: number;
  min: number; max: number;   // até onde pode deslizar sem bater (trava como parede)
}


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

// Intervalo contíguo [min,max] de posições que o carro alcança deslizando na
// sua pista SEM sobrepor outro carro. É o que faz o carro "bater na parede":
// ele para exatamente antes do próximo carro, dos dois lados.
function reachRange(cars: Car[], carId: string): { min: number; max: number } {
  const car = cars.find(c => c.id === carId)!;
  const g = buildGrid(cars.filter(c => c.id !== carId));
  if (car.orientation === "horizontal") {
    const r = car.row;
    let min = 0, max = GRID - car.len;
    for (let col = car.col - 1; col >= 0; col--) { if (g[r][col]) { min = col + 1; break; } }
    for (let col = car.col + car.len; col < GRID; col++) { if (g[r][col]) { max = col - car.len; break; } }
    // Carro-alvo: se a pista está livre até a borda, deixa deslizar pra fora (saída).
    if (car.id === "target" && max === GRID - car.len) max = GRID - car.len + 1;
    return { min, max };
  }
  const c = car.col;
  let min = 0, max = GRID - car.len;
  for (let row = car.row - 1; row >= 0; row--) { if (g[row][c]) { min = row + 1; break; } }
  for (let row = car.row + car.len; row < GRID; row++) { if (g[row][c]) { max = row - car.len; break; } }
  return { min, max };
}

// Mínimo de QUADRADINHOS (casas) para resolver a fase: BFS onde cada aresta é
// deslizar um carro UMA casa. Como o jogo passou a contar cada quadradinho como um
// movimento, este é o "melhor" a exibir/comparar. Tabuleiro 6×6 → rápido.
function solveMinCells(cars: Car[]): number {
  const posKey = (cs: Car[]) => cs.map((c) => (c.orientation === "horizontal" ? c.col : c.row)).join(",");
  const start = cars.map((c) => ({ ...c }));
  if (isWin(start)) return 0;
  const seen = new Set<string>([posKey(start)]);
  let frontier: Car[][] = [start];
  for (let dist = 1; dist <= 120 && frontier.length; dist++) {
    const next: Car[][] = [];
    for (const state of frontier) {
      for (let i = 0; i < state.length; i++) {
        const car = state[i];
        const pos = car.orientation === "horizontal" ? car.col : car.row;
        for (const np of [pos - 1, pos + 1]) {
          if (!canMove(state, car.id, np)) continue;
          const ns = state.map((c, j) =>
            j !== i ? c : (c.orientation === "horizontal" ? { ...c, col: np } : { ...c, row: np })
          );
          if (isWin(ns)) return dist;
          const k = posKey(ns);
          if (!seen.has(k)) { seen.add(k); next.push(ns); }
        }
      }
      if (seen.size > 300000) return dist; // segurança (fases reais nunca chegam perto)
    }
    frontier = next;
  }
  return 99;
}

// Mínimo de MOVIMENTOS (regra clássica: mover um carro = 1 movimento, qualquer
// distância). BFS onde cada aresta é levar um carro a QUALQUER posição alcançável.
function solveMinMoves(cars: Car[]): number {
  const posKey = (cs: Car[]) => cs.map((c) => (c.orientation === "horizontal" ? c.col : c.row)).join(",");
  const start = cars.map((c) => ({ ...c }));
  if (isWin(start)) return 0;
  const seen = new Set<string>([posKey(start)]);
  let frontier: Car[][] = [start];
  for (let dist = 1; dist <= 60 && frontier.length; dist++) {
    const next: Car[][] = [];
    for (const state of frontier) {
      for (let i = 0; i < state.length; i++) {
        const car = state[i];
        const pos = car.orientation === "horizontal" ? car.col : car.row;
        // todas as posições alcançáveis em cada direção (deslize contínuo)
        for (const dir of [-1, 1]) {
          for (let np = pos + dir; canMove(state, car.id, np); np += dir) {
            const ns = state.map((c, j) =>
              j !== i ? c : (c.orientation === "horizontal" ? { ...c, col: np } : { ...c, row: np })
            );
            if (isWin(ns)) return dist;
            const k = posKey(ns);
            if (!seen.has(k)) { seen.add(k); next.push(ns); }
          }
        }
      }
      if (seen.size > 300000) return dist;
    }
    frontier = next;
  }
  return 99;
}

// PRÓXIMO movimento ótimo a partir do estado atual: mesma BFS de solveMinMoves,
// mas propagando o PRIMEIRO movimento de cada ramo. Devolve o carro a mover, a
// direção (-1/+1) e a distância mínima até resolver. Usado na DICA quando o
// paciente trava (4 movimentos seguidos sem se aproximar da solução).
type NextMove = { carId: string; dir: -1 | 1; toPos: number; dist: number };
function solveNext(cars: Car[]): NextMove | null {
  const posKey = (cs: Car[]) => cs.map((c) => (c.orientation === "horizontal" ? c.col : c.row)).join(",");
  const start = cars.map((c) => ({ ...c }));
  if (isWin(start)) return { carId: "", dir: 1, toPos: 0, dist: 0 };
  const seen = new Set<string>([posKey(start)]);
  let frontier: { s: Car[]; fm: { carId: string; dir: -1 | 1; toPos: number } | null }[] = [{ s: start, fm: null }];
  for (let dist = 1; dist <= 60 && frontier.length; dist++) {
    const next: typeof frontier = [];
    for (const { s: state, fm } of frontier) {
      for (let i = 0; i < state.length; i++) {
        const car = state[i];
        const pos = car.orientation === "horizontal" ? car.col : car.row;
        for (const dir of [-1, 1] as const) {
          for (let np = pos + dir; canMove(state, car.id, np); np += dir) {
            const ns = state.map((c, j) =>
              j !== i ? c : (c.orientation === "horizontal" ? { ...c, col: np } : { ...c, row: np })
            );
            const first = fm ?? { carId: car.id, dir, toPos: np };
            if (isWin(ns)) return { ...first, dist };
            const k = posKey(ns);
            if (!seen.has(k)) { seen.add(k); next.push({ s: ns, fm: first }); }
          }
        }
      }
      if (seen.size > 300000) return null;
    }
    frontier = next;
  }
  return null;
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

// Fase-tutorial: só 2 carros. O carro "A" (vertical, à direita) bloqueia a saída do
// vermelho; o paciente aprende movendo A para cima e deslizando o vermelho para fora.
const TUTORIAL_LEVEL: Level = {
  idealMoves: 2,
  cars: [
    { id: "target", row: 2, col: 3, len: 2, orientation: "horizontal" },
    { id: "A", row: 1, col: 5, len: 2, orientation: "vertical" },
  ],
};

export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }: Props) {
  const { begin, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress(11 * 60 * 1000); // 11 min — tarefa de planejamento (pedido da Kamylla)

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

  // Dificuldade adaptativa: começa perto do nível do paciente e sobe/desce na sessão.
  const initRef = useRef<{ level: Level; diff: number } | null>(null);
  // Abre no tutorial; o jogo real começa no nível salvo do paciente (1–10) e
  // sobe/desce conforme o desempenho na sessão.
  if (!initRef.current) initRef.current = { level: TUTORIAL_LEVEL, diff: 2 }; // começa no tutorial
  const curDiffRef  = useRef(initRef.current.diff);
  const streakRef   = useRef(0);
  const reachedRef  = useRef(initRef.current.diff);
  const statsRef    = useRef({ solved: 0, optimal: 0 });
  const levelSeqRef = useRef(0);
  const recentRef   = useRef<string[]>(loadRecentIds()); // ids de fases já jogadas (inclui sessões anteriores)

  const [currentLevel, setCurrentLevel] = useState<Level>(initRef.current.level);
  const [cars, setCars]         = useState<Car[]>(() => initRef.current!.level.cars.map(c => ({ ...c })));
  const carsRef = useRef(cars); carsRef.current = cars;         // estado atual p/ colisão no arraste
  const [moves, setMoves]       = useState(0);
  const [history, setHistory]   = useState<Car[][]>([]);
  const [won, setWon]           = useState(false);
  const [tutorial, setTutorial] = useState(true); // 1ª fase é o tutorial guiado
  const [dragPrev, setDragPrev] = useState<{ id: string; pos: number } | null>(null);
  const [hint, setHint]         = useState<{ carId: string; dir: -1 | 1 } | null>(null);
  const [guided, setGuided]     = useState(false);            // fase em modo guiado (após "Ver dica")
  const guidedRef = useRef(false); guidedRef.current = guided;
  const [wrongStreak, setWrongStreak] = useState(0);          // solves não-perfeitos SEGUIDOS (erros)
  const wonProcessedRef = useRef(false);
  const hintsRef = useRef(0);   // quantas dicas o paciente pediu na sessão (autonomia)

  const boardRef = useRef<HTMLDivElement>(null);
  const cellRuleRef = useRef(false);
  const lastMovedRef = useRef<string | null>(null); // último carro movido (p/ emendar empurrões seguidos)
  const dragRef  = useRef<DragState | null>(null);
  const startedRef = useRef(false);

  useEffect(() => { if (!startedRef.current) { startedRef.current = true; begin(); } }, [begin]);

  // Erros SEGUIDOS = solves não-perfeitos em sequência. Após 4, o resultado oferece "Ver dica".
  useEffect(() => {
    if (won && !tutorial && !wonProcessedRef.current) {
      wonProcessedRef.current = true;
      const ideal = cellRuleRef.current ? minCells : minMoves;
      setWrongStreak((s) => (moves - ideal > 0 ? s + 1 : 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const carImages = useMemo(
    () => assignCarImages(levelSeqRef.current, currentLevel.cars),
    [currentLevel],
  );

  // REGRA (decisão clínica da Kamylla, 15/jul): nos níveis normais, mover um carro
  // = 1 MOVIMENTO (qualquer distância — não pune quem "pensa com a mão"). A regra
  // avançada (cada quadradinho conta) é o TOPO da escada — nível 15, que só passa a
  // existir nas Etapas 2–4 do épico; até lá fica efetivamente desligada.
  const cellRule = curDiffRef.current >= 15;
  cellRuleRef.current = cellRule;
  // "Melhor solução" na régua da regra vigente.
  const minCells = useMemo(() => solveMinCells(currentLevel.cars), [currentLevel]);
  const minMoves = useMemo(() => solveMinMoves(currentLevel.cars), [currentLevel]);

  const loadLevel = useCallback((level: Level) => {
    levelSeqRef.current++;
    if (level.id) {
      recentRef.current = [level.id, ...recentRef.current.filter((x) => x !== level.id)].slice(0, RECENT_MAX);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentRef.current)); } catch { /* modo privado */ }
    }
    setCurrentLevel(level);
    setCars(level.cars.map(c => ({ ...c })));
    setMoves(0); setHistory([]); setWon(false);
    setDragPrev(null); dragRef.current = null; lastMovedRef.current = null;
    setHint(null); setGuided(false); wonProcessedRef.current = false;
  }, []);

  const completeSession = useCallback(() => {
    finishTimer();
    const s = statsRef.current;
    const acc = s.solved > 0 ? s.optimal / s.solved : 0;
    const score = calculateExerciseScore("estacionamento-logico", acc, undefined, reachedRef.current);
    onComplete({
      exerciseId: "estacionamento-logico", domain: "executive",
      score, accuracy: acc, difficulty: reachedRef.current, duration: elapsedSec(),
      metadata: { solved: s.solved, optimal: s.optimal, reachedDifficulty: reachedRef.current, hintsUsed: hintsRef.current },
    });
  }, [finishTimer, elapsedSec, onComplete]);

  // Resolveu a fase. optimal = no nº ideal de movimentos. Progressão clara:
  // cada acerto ÓTIMO sobe 1 dificuldade; 2 não-ótimas seguidas descem 1. Sempre
  // carrega uma fase INÉDITA (nunca uma das recentes). Roda até ~7 min.
  const nextLevel = useCallback((optimal: boolean) => {
    statsRef.current.solved++;
    if (optimal) {
      statsRef.current.optimal++;
      streakRef.current = 0;
      curDiffRef.current = stepDiff(curDiffRef.current, 1);
    } else {
      streakRef.current -= 1;
      if (streakRef.current <= -2) { streakRef.current = 0; curDiffRef.current = stepDiff(curDiffRef.current, -1); }
    }
    if (isTimeUp()) { completeSession(); return; }
    const picked = pickLevel(curDiffRef.current, recentRef.current);
    curDiffRef.current = picked.diff;
    reachedRef.current = Math.max(reachedRef.current, picked.diff);
    loadLevel(picked.level);
  }, [isTimeUp, completeSession, loadLevel]);

  // Fim do tutorial → começa o jogo de verdade (não conta nas estatísticas).
  const startRealGame = useCallback(() => {
    setTutorial(false);
    // Começa no nível salvo do paciente (1–10) — a escada nova substitui o
    // antigo mapeamento "+3" para a escala de movimentos mínimos.
    const start = Math.max(1, Math.min(10, Math.round(difficulty)));
    const picked = pickLevel(start, recentRef.current);
    curDiffRef.current = picked.diff;
    reachedRef.current = picked.diff;
    loadLevel(picked.level);
  }, [difficulty, loadLevel]);

  // "Ver dica" (só aparece após 4 erros seguidos, no resultado): recomeça a fase em
  // MODO GUIADO — destaca o próximo carro certo a cada movimento até resolver.
  const verDica = () => {
    loadLevel(currentLevel);
    setGuided(true);
    const sol = solveNext(currentLevel.cars);
    if (sol && sol.dist > 0) { hintsRef.current += 1; setHint({ carId: sol.carId, dir: sol.dir }); }
  };

  const commitMove = useCallback((carId: string, newPos: number) => {
    const prev = carsRef.current;
    if (!canMove(prev, carId, newPos)) return;
    const car = prev.find(c => c.id === carId)!;
    const oldPos = car.orientation === "horizontal" ? car.col : car.row;
    const next = prev.map(c =>
      c.id === carId ? (c.orientation === "horizontal" ? { ...c, col: newPos } : { ...c, row: newPos }) : c
    );
    const winning = isWin(next);
    // Regra normal: mover um carro = 1 movimento (independe da distância), e
    // empurrões SEGUIDOS no mesmo carro emendam num movimento só — decisão
    // clínica da Kamylla (15/jul): planejamento se mede por alternar de carro,
    // não pela quantidade de toques. Vai-e-volta seguido também conta 1 (sem
    // estorno: voltar é erro de planejamento ou necessidade real).
    // Regra avançada (níveis difíceis): cada quadradinho conta; no movimento
    // vitorioso do alvo, conta só até a casa de saída.
    let delta: number;
    if (cellRuleRef.current) {
      delta = Math.abs(newPos - oldPos);
      if (carId === "target" && winning) delta = Math.abs((GRID - car.len) - oldPos);
    } else {
      delta = lastMovedRef.current === carId ? 0 : 1;
    }
    lastMovedRef.current = carId;
    setHistory(h => [...h, prev]);
    setMoves(m => m + delta);
    if (winning) { setWon(true); setHint(null); }
    else if (guidedRef.current) {
      const sol = solveNext(next);   // modo guiado: destaca o próximo carro a cada movimento
      setHint(sol && sol.dist > 0 ? { carId: sol.carId, dir: sol.dir } : null);
    } else setHint(null);
    setCars(next);
  }, []);

  const onPtrDown = useCallback((e: React.PointerEvent, car: Car) => {
    if (won) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = car.orientation === "horizontal" ? car.col : car.row;
    const { min, max } = reachRange(carsRef.current, car.id);   // trava nos carros vizinhos
    dragRef.current = {
      carId: car.id, axis: car.orientation,
      startPx: car.orientation === "horizontal" ? e.clientX : e.clientY,
      startPos: pos, currentPos: pos, min, max,
    };
    setDragPrev({ id: car.id, pos });
  }, [won]);

  // Arraste CONTÍNUO: o carro segue o dedo (posição fracionária, sem pulos) e
  // trava exatamente antes do próximo carro (min/max) — bate como parede, dos
  // dois lados. Vai pra frente e pra trás livremente dentro do espaço livre.
  const onPtrMove = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id || !boardRef.current) return;
    const cpx = boardRef.current.getBoundingClientRect().width / GRID;
    const px  = d.axis === "horizontal" ? e.clientX : e.clientY;
    const raw = d.startPos + (px - d.startPx) / cpx;
    d.currentPos = Math.max(d.min, Math.min(d.max, raw));
    setDragPrev({ id: car.id, pos: d.currentPos });
  }, []);

  const onPtrUp = useCallback((e: React.PointerEvent, car: Car) => {
    const d = dragRef.current;
    if (!d || d.carId !== car.id) return;
    const orig = car.orientation === "horizontal" ? car.col : car.row;
    const snapped = Math.max(d.min, Math.min(d.max, Math.round(d.currentPos)));
    dragRef.current = null; setDragPrev(null);
    if (snapped !== orig) commitMove(car.id, snapped);       // encaixa na vaga mais próxima
  }, [commitMove]);

  // ── Tutorial concluído ────────────────────────────────────────────────────
  if (won && tutorial) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#ECEAE4" }}>
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light mb-3" style={{ color: "#2E9E4F" }}>Muito bem! 🎉</p>
          <p className="text-sm mb-8" style={{ color: "#6B7384" }}>
            Você liberou o carro vermelho! É sempre assim: mova os outros carros para abrir o caminho e leve o vermelho até a saída.
          </p>
          <button
            onClick={startRealGame}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
            style={{ background: "#2C3444" }}
          >
            Começar
          </button>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (won) {
    const ideal   = cellRule ? minCells : minMoves;  // régua da regra vigente
    const extra   = moves - ideal;         // a mais que o mínimo (movimentos ou quadradinhos)
    const perfect = extra <= 0;            // resolveu no mínimo
    const oneOver = extra === 1;           // 1 a mais → pode seguir ou refazer
    // 2+ a mais → treino rígido: tem que refazer.
    const headColor = perfect ? "#2E9E4F" : oneOver ? "#B45309" : "#3A4050";
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "#ECEAE4" }}>
        <div className="w-full max-w-xs text-center">
          <p className="text-2xl font-light mb-8" style={{ color: headColor }}>
            {perfect ? "Perfeito!" : oneOver ? "Quase perfeito!" : "Quase lá"}
          </p>
          <div className="flex justify-center gap-14 mb-8">
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: headColor }}>{moves}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Movimentos</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tabular-nums" style={{ color: "#B0BAC8" }}>{ideal}</p>
              <p className="text-xs mt-1.5 tracking-wide uppercase" style={{ color: "#94A0B0" }}>Melhor solução</p>
            </div>
          </div>
          {perfect ? (
            <button
              onClick={() => nextLevel(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
              style={{ background: "#2C3444" }}
            >
              Próxima fase
            </button>
          ) : oneOver ? (
            <>
              <p className="text-sm mb-5" style={{ color: "#6B7384" }}>
                Você fez <strong>1 movimento a mais</strong> que o mínimo. Pode seguir ou tentar de novo.
              </p>
              <button
                onClick={() => nextLevel(false)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
                style={{ background: "#2C3444" }}
              >
                Seguir assim mesmo
              </button>
              <button
                onClick={() => loadLevel(currentLevel)}
                className="w-full mt-3 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "transparent", color: "#6B7384", border: "1px solid #C9CDD6" }}
              >
                Tentar de novo
              </button>
              {wrongStreak >= 4 && (
                <button onClick={verDica} className="w-full mt-3 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: "rgba(252,211,77,0.95)", color: "#7A4B00", border: "1px solid rgba(180,140,0,0.35)" }}>
                  💡 Ver a dica
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm mb-5" style={{ color: "#6B7384" }}>
                Você fez <strong>{extra} movimentos a mais</strong>. Dá para resolver em <strong>{ideal}</strong> — tente de novo!
              </p>
              <button
                onClick={() => loadLevel(currentLevel)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
                style={{ background: "#2C3444" }}
              >
                Tentar de novo
              </button>
              {wrongStreak >= 4 && (
                <button onClick={verDica} className="w-full mt-3 py-3 rounded-2xl text-sm font-semibold"
                  style={{ background: "rgba(252,211,77,0.95)", color: "#7A4B00", border: "1px solid rgba(180,140,0,0.35)" }}>
                  💡 Ver a dica
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Dica guiada do tutorial: enquanto o carro "A" bloqueia a saída (linha 2), pede para
  // tirá-lo do caminho; depois, pede para deslizar o vermelho até a saída.
  const aRow = cars.find((c) => c.id === "A")?.row ?? 1;
  const tutorialHint = (aRow === 0 || aRow >= 3)
    ? "Agora arraste o carro VERMELHO para a direita, até a saída! →"
    : "Passo 1: arraste o carro à direita (que bloqueia a saída) para CIMA.";

  // Texto da DICA (modo guiado): destaca o próximo carro certo e a direção.
  const hintCar = hint ? cars.find((c) => c.id === hint.carId) : null;
  const hintMsg = hintCar
    ? `Tente mover ${hintCar.id === "target" ? "o carro vermelho" : "o carro em destaque"} ${
        hintCar.orientation === "horizontal"
          ? (hint!.dir < 0 ? "para a esquerda ←" : "para a direita →")
          : (hint!.dir < 0 ? "para cima ↑" : "para baixo ↓")
      }.`
    : "";

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
        // Sem seleção de texto/realce ao arrastar (evita o tabuleiro "ficar azul").
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Instruction — centered, above the board */}
      <p style={{
        marginTop: 22, marginBottom: 12,
        fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        textAlign: "center",
        color: tutorial ? "#FCD34D" : "#F1F3F8",
      }}>
        {tutorial ? tutorialHint : "Libere o carro vermelho pela saída."}
      </p>

      {/* Barra de progresso (pelo tempo, ~11 min, em saltos de 10%) */}
      <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14 }}>
        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
      </div>

      {/* Banner da DICA no MODO GUIADO (ativado pelo "Ver dica" após 4 erros seguidos) */}
      {!tutorial && hint && (
        <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#7A4B00",
          background: "rgba(252,211,77,0.92)", borderRadius: 10, padding: "7px 14px",
          margin: "10px auto 0", maxWidth: 340, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
          💡 {hintMsg}
        </p>
      )}

      {/* Regra avançada (níveis difíceis): cada quadradinho conta */}
      {cellRule && !won && (
        <p style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#B45309",
          background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.25)",
          borderRadius: 10, padding: "7px 12px", margin: "0 auto", maxWidth: 340 }}>
          Nível avançado: cada quadradinho percorrido conta como um movimento.
        </p>
      )}

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
                    cursor: isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                    // Sem NENHUM destaque de seleção (nem o quadro do tap-highlight
                    // do navegador, nem realce): o carro só desliza com o dedo.
                    WebkitTapHighlightColor: "transparent",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    WebkitTouchCallout: "none",
                    zIndex: isDragging ? 30 : 10,
                    // Sem transição durante o arraste (segue o dedo); ao soltar,
                    // encaixa suave na vaga. Movimento via transform (GPU).
                    transition: isDragging ? "none" : "transform 0.14s cubic-bezier(.2,.8,.3,1)",
                    transform: `translate3d(${left}px, ${top}px, 0)`,
                    willChange: "transform",
                  }}
                  onPointerDown={e => onPtrDown(e, car)}
                  onPointerMove={e => onPtrMove(e, car)}
                  onPointerUp={e => onPtrUp(e, car)}
                  onPointerCancel={e => onPtrUp(e, car)}
                >
                  <CarImage
                    src={carImages[car.id]}
                    orientation={car.orientation}
                    isTarget={car.id === "target"}
                    cellPx={cellPx}
                  />
                  {!tutorial && hint?.carId === car.id && (
                    <div className="animate-pulse" style={{
                      position: "absolute", inset: -2, borderRadius: 12,
                      boxShadow: "0 0 0 3px #FCD34D, 0 0 16px 5px rgba(252,211,77,0.85)",
                      pointerEvents: "none", zIndex: 25,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
