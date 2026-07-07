"use client";

import { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { assignCarImages, ALL_CAR_IMAGES } from "@/lib/parking-cars";
import { LEVELS_BY_DIFFICULTY, DIFFICULTIES } from "@/lib/parking-levels";
import type { Level } from "@/types/parking";
import type { ExerciseResult, Theme } from "@/types";

// Só usamos fases com tabuleiro CHEIO (>= 5 movimentos ideais = 4+ carros). As
// fases de 2-3 carros ficavam com cara de "vazio/joguinho" — foram removidas do
// jogo (continuam no arquivo, mas nunca são sorteadas).
const PLAY_DIFFS = DIFFICULTIES.filter((d) => d >= 5);

// Dificuldades ordenadas por proximidade do alvo (empate → menor primeiro).
function orderedDiffs(target: number): number[] {
  return [...PLAY_DIFFS].sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b);
}
// Sorteia uma fase perto do alvo, NUNCA repetindo as fases recentes (`recent`).
// Se a dificuldade-alvo só tem fases já vistas, sobe/desce pra dificuldade
// vizinha com fase inédita — garante variedade mesmo nas dificuldades de 1 fase.
function pickLevel(targetDiff: number, recent: Level[] = []): { level: Level; diff: number } {
  for (const d of orderedDiffs(targetDiff)) {
    const pool = LEVELS_BY_DIFFICULTY[d].filter(l => !recent.includes(l));
    if (pool.length) return { level: pool[Math.floor(Math.random() * pool.length)], diff: d };
  }
  const d = orderedDiffs(targetDiff)[0];
  const arr = LEVELS_BY_DIFFICULTY[d];
  return { level: arr[Math.floor(Math.random() * arr.length)], diff: d };
}
function stepDiff(cur: number, dir: 1 | -1): number {
  const i = PLAY_DIFFS.indexOf(cur);
  const ni = Math.max(0, Math.min(PLAY_DIFFS.length - 1, (i < 0 ? 0 : i) + dir));
  return PLAY_DIFFS[ni];
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
  const { begin, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();

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
  // Começa já com tabuleiro cheio (mín. dificuldade 6 ≈ 5 carros) — nada de
  // tabuleiro quase vazio. Sobe conforme o desempenho.
  if (!initRef.current) initRef.current = pickLevel(Math.max(6, Math.round(difficulty) + 3));
  const curDiffRef  = useRef(initRef.current.diff);
  const streakRef   = useRef(0);
  const reachedRef  = useRef(initRef.current.diff);
  const statsRef    = useRef({ solved: 0, optimal: 0 });
  const levelSeqRef = useRef(0);
  const recentRef   = useRef<Level[]>([initRef.current.level]); // fases recentes (não repetir)

  const [currentLevel, setCurrentLevel] = useState<Level>(initRef.current.level);
  const [cars, setCars]         = useState<Car[]>(() => initRef.current!.level.cars.map(c => ({ ...c })));
  const carsRef = useRef(cars); carsRef.current = cars;         // estado atual p/ colisão no arraste
  const [moves, setMoves]       = useState(0);
  const [history, setHistory]   = useState<Car[][]>([]);
  const [won, setWon]           = useState(false);
  const [dragPrev, setDragPrev] = useState<{ id: string; pos: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef  = useRef<DragState | null>(null);
  const startedRef = useRef(false);

  useEffect(() => { if (!startedRef.current) { startedRef.current = true; begin(); } }, [begin]);

  const carImages = useMemo(
    () => assignCarImages(levelSeqRef.current, currentLevel.cars),
    [currentLevel],
  );

  const loadLevel = useCallback((level: Level) => {
    levelSeqRef.current++;
    recentRef.current = [level, ...recentRef.current.filter(l => l !== level)].slice(0, 6);
    setCurrentLevel(level);
    setCars(level.cars.map(c => ({ ...c })));
    setMoves(0); setHistory([]); setWon(false);
    setDragPrev(null); dragRef.current = null;
  }, []);

  const completeSession = useCallback(() => {
    finishTimer();
    const s = statsRef.current;
    const acc = s.solved > 0 ? s.optimal / s.solved : 0;
    const score = calculateExerciseScore("estacionamento-logico", acc, undefined, reachedRef.current);
    onComplete({
      exerciseId: "estacionamento-logico", domain: "executive",
      score, accuracy: acc, difficulty: reachedRef.current, duration: elapsedSec(),
      metadata: { solved: s.solved, optimal: s.optimal, reachedDifficulty: reachedRef.current },
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

  // ── Result screen ─────────────────────────────────────────────────────────
  if (won) {
    const ideal    = currentLevel.idealMoves;
    const optimal  = moves <= ideal;       // resolveu no nº ideal de movimentos?
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
              onClick={() => nextLevel(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
              style={{ background: "#2C3444" }}
            >
              Próxima fase
            </button>
          ) : (
            <>
              <p className="text-sm mb-5" style={{ color: "#6B7384" }}>
                Dá para resolver em <strong>{ideal}</strong> movimentos. Tente de novo!
              </p>
              <button
                onClick={() => loadLevel(currentLevel)}
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
        color: "#F1F3F8",
        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        textAlign: "center",
      }}>
        Libere o carro vermelho pela saída.
      </p>

      {/* Barra de progresso (pelo tempo, ~7 min, em saltos de 10%) */}
      <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14 }}>
        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
