"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Pointer } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface TrilhaVisualProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Cell {
  id: number;
  label: string;
  x: number; // % in play area
  y: number; // % in play area
}

const MIN_COUNT = 5;
const MAX_COUNT = 25;

function initialCount(difficulty: number) {
  return Math.min(Math.max(5, difficulty + 4), 14);
}

function playAreaHeightPct(count: number) {
  if (count <= 12) return 72;
  if (count <= 18) return 90;
  return 112;
}

function generateCells(count: number): Cell[] {
  const heightPct = playAreaHeightPct(count);
  // Adjusted cell size as % of each axis
  const CELL_W = 12;
  const CELL_H = CELL_W * (100 / heightPct);

  const cols = count <= 6 ? 3 : count <= 12 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const cw = 76 / cols;
  const ch = 76 / rows;

  // jitter contido → números bem distribuídos no painel, não "jogados"
  const maxJX = Math.max(0, (cw - CELL_W) / 2 * 0.45);
  const maxJY = Math.max(0, (ch - CELL_H) / 2 * 0.45);

  const allSlots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = 10 + c * cw + cw * 0.5;
      const cy = 10 + r * ch + ch * 0.5;
      allSlots.push({
        x: cx + (Math.random() - 0.5) * 2 * maxJX,
        y: cy + (Math.random() - 0.5) * 2 * maxJY,
      });
    }
  }

  return shuffle(allSlots).slice(0, count).map(({ x, y }, i) => ({
    id: i + 1,
    label: String(i + 1),
    x: Math.max(7, Math.min(91, x)),
    y: Math.max(7, Math.min(91, y)),
  }));
}

type RoundPhase = "playing" | "feedback";

// Fixed 4-cell tutorial positions (as % in play area)
const TUTORIAL_CELLS = [
  { id: 1, x: 20, y: 25 },
  { id: 2, x: 65, y: 20 },
  { id: 3, x: 50, y: 65 },
  { id: 4, x: 25, y: 70 },
];

function TrilhaTutorialStep({
  theme,
  startFrom,
  onDone,
}: {
  theme: Theme;
  startFrom: number; // first cell id the user should click
  onDone: () => void;
}) {
  const [nextExpected, setNextExpected] = useState(startFrom);
  const [path, setPath] = useState<{ x: number; y: number }[]>(() =>
    startFrom === 1 ? [] : TUTORIAL_CELLS.filter((c) => c.id < startFrom).map((c) => ({ x: c.x, y: c.y }))
  );
  const done = useRef(false);

  const lineColor = theme === "GAMIFIED" ? "#22d3ee" : theme === "COLORFUL" ? "#818cf8" : "#93c5fd";

  function cellStyle(cell: { id: number }) {
    const isCompleted = cell.id < nextExpected;
    const base = "absolute flex items-center justify-center font-black border-2 transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl text-sm select-none transition-all";
    if (isCompleted) return `${base} ${theme === "GAMIFIED" ? "bg-cyan-800/70 border-cyan-600/50 text-cyan-300 scale-90" : theme === "COLORFUL" ? "bg-indigo-400 border-indigo-500 text-white scale-90" : "bg-blue-300 border-blue-400 text-white scale-90"}`;
    return `${base} ${theme === "GAMIFIED" ? "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 shadow-md active:scale-90" : theme === "COLORFUL" ? "bg-white border-indigo-300 text-indigo-800 hover:bg-indigo-50 shadow-sm active:scale-90" : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 shadow-sm active:scale-90"}`;
  }

  function handleClick(cell: { id: number; x: number; y: number }) {
    if (done.current || cell.id !== nextExpected) return;
    const newPath = [...path, { x: cell.x, y: cell.y }];
    setPath(newPath);
    const newNext = nextExpected + 1;
    setNextExpected(newNext);
    if (newNext > 4) { done.current = true; setTimeout(onDone, 300); }
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-indigo-50/60" : "bg-gray-50"}`} style={{ paddingBottom: "60%", minHeight: 160 }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
        {path.length > 1 && path.slice(1).map((pt, i) => (
          <motion.line
            key={`l${i}`}
            x1={`${path[i].x}%`} y1={`${path[i].y}%`}
            x2={`${pt.x}%`} y2={`${pt.y}%`}
            stroke={lineColor} strokeWidth={2.5} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </svg>
      {TUTORIAL_CELLS.map((cell) => (
        <button
          key={cell.id}
          onClick={() => handleClick(cell)}
          disabled={done.current}
          className={cellStyle(cell)}
          style={{ left: `${cell.x}%`, top: `${cell.y}%` }}
        >
          {cell.id}
        </button>
      ))}
    </div>
  );
}

function TrilhaVisualTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Números estão espalhados na tela. Toque em ordem crescente!",
      content: (onStepDone: () => void) => (
        <TrilhaTutorialStep theme={theme} startFrom={1} onDone={onStepDone} />
      ),
    },
    {
      instruction: "Continue! Agora clique 2, 3, 4 para completar a trilha.",
      content: (onStepDone: () => void) => (
        <TrilhaTutorialStep theme={theme} startFrom={2} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Conecta Números" steps={steps} onDone={onDone} />;
}

export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [count, setCount] = useState(initialCount(difficulty));
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; count: number }[]>([]);

  const [cells, setCells] = useState<Cell[]>(() => generateCells(initialCount(difficulty)));
  const [nextExpected, setNextExpected] = useState(1);
  const [errors, setErrors] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("playing");
  const [roundCorrect, setRoundCorrect] = useState(false);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);

  const startTime = useRef<number>(Date.now());
  const firstClick = useRef(false);

  const startNewRound = useCallback((nextCount: number) => {
    setCells(generateCells(nextCount));
    setNextExpected(1);
    setErrors(0);
    setPath([]);
    setRoundPhase("playing");
    firstClick.current = false;
  }, []);

  const handleCellClick = useCallback((cellId: number) => {
    if (roundPhase !== "playing") return;
    if (!firstClick.current) firstClick.current = true;

    const clickedCell = cells.find((c) => c.id === cellId);
    if (!clickedCell) return;

    if (cellId === nextExpected) {
      setPath((prev) => [...prev, { x: clickedCell.x, y: clickedCell.y }]);

      if (nextExpected === count) {
        const isCorrect = errors <= 1;
        const newRoundResults = [...roundResults, { correct: isCorrect, count }];
        setRoundResults(newRoundResults);
        setRoundCorrect(isCorrect);
        setRoundPhase("feedback");

        const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
        let nextCount = count;
        let nextStreak = newStreak;
        if (newStreak >= 2) { nextCount = Math.min(count + 2, MAX_COUNT); nextStreak = 0; }
        if (newStreak <= -2) { nextCount = Math.max(count - 2, MIN_COUNT); nextStreak = 0; }

        const nextRound = round + 1;
        const timeUp = isTimeUp();

        setTimeout(() => {
          if (timeUp) {
            finish();
            const accuracy = newRoundResults.filter((r) => r.correct).length / Math.max(1, newRoundResults.length);
            const maxCount = Math.max(...newRoundResults.map((r) => r.count));
            const duration = elapsedSec();
            const score = calculateExerciseScore("trilha-visual", accuracy, undefined, difficulty);
            onComplete({
              exerciseId: "trilha-visual",
              domain: "attention",
              score, accuracy, difficulty, duration,
              metadata: { rounds: newRoundResults.length, maxCount, correct: newRoundResults.filter((r) => r.correct).length },
            });
          } else {
            setRound(nextRound);
            setStreak(nextStreak);
            setCount(nextCount);
            startNewRound(nextCount);
          }
        }, 1500);
      } else {
        setNextExpected((n) => n + 1);
      }
    } else {
      setErrors((e) => e + 1);
    }
  }, [roundPhase, nextExpected, count, errors, streak, round, roundResults, difficulty, cells, onComplete, isTimeUp, elapsedSec, finish, startNewRound]);

  if (showTutorial) {
    return <TrilhaVisualTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;
  }

  // ── Design system (visual premium clean — mockup da Kamylla) ───────
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const accent = isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
  const accentSoft = isG ? "rgba(34,211,238,0.16)" : isC ? "rgba(99,102,241,0.12)" : "rgba(59,130,246,0.10)";
  const rootStyle = isG
    ? { background: "linear-gradient(145deg,#0a1628 0%,#0d2244 60%,#081020 100%)" }
    : isC
    ? { background: "linear-gradient(160deg,#eef2ff 0%,#e0f2fe 100%)" }
    : { background: "linear-gradient(160deg,#fbfcff 0%,#eef4ff 48%,#f3effe 100%)" };  // branco · azul gelo · lavanda
  const cardStyle = isG
    ? { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1px solid rgba(148,163,184,0.28)", borderRadius: 24, boxShadow: "0 10px 44px rgba(99,118,160,0.13)" };
  const titleColor = isG ? "#ffffff" : isC ? "#4338ca" : "#1e293b";
  const labelColor = isG ? "rgba(255,255,255,0.7)" : "#64748b";
  const innerPanelBg = isG ? "rgba(255,255,255,0.03)" : isC ? "rgba(99,102,241,0.05)" : "rgba(59,130,246,0.045)";
  const innerBorder = isG ? "rgba(255,255,255,0.08)" : isC ? "rgba(99,102,241,0.13)" : "rgba(59,130,246,0.12)";
  const stripBg = isG ? "rgba(34,211,238,0.10)" : isC ? "rgba(99,102,241,0.08)" : "rgba(59,130,246,0.07)";
  const stripText = isG ? "rgba(255,255,255,0.82)" : isC ? "#4338ca" : "#475569";
  const lineColor = accent;

  // Estilo de cada número. O PRÓXIMO da sequência ganha borda azul + leve brilho.
  function cellStyleObj(cell: Cell): React.CSSProperties {
    const isCompleted = cell.id < nextExpected;
    const isNext = cell.id === nextExpected && roundPhase === "playing";
    const common: React.CSSProperties = {
      position: "absolute", left: `${cell.x}%`, top: `${cell.y}%`, transform: "translate(-50%,-50%)",
      width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: 20, userSelect: "none", transition: "background .15s, border-color .15s, box-shadow .15s",
    };
    if (isCompleted) {
      return { ...common, background: accent, border: `2px solid ${accent}`, color: "#ffffff", opacity: 0.5 };
    }
    if (isNext) {
      return {
        ...common, background: isG ? "#0f1729" : "#ffffff", border: `2.5px solid ${accent}`,
        color: isG ? "#67e8f9" : "#1e3a8a", boxShadow: `0 0 0 4px ${accentSoft}, 0 6px 18px ${accent}44`,
      };
    }
    return {
      ...common, background: isG ? "rgba(255,255,255,0.06)" : "#ffffff",
      border: isG ? "1.5px solid rgba(255,255,255,0.16)" : "1.5px solid rgba(148,163,184,0.36)",
      color: isG ? "#e2e8f0" : "#1e3a8a",
      boxShadow: isG ? "0 2px 6px rgba(0,0,0,0.35)" : "0 2px 10px rgba(99,118,160,0.12)",
    };
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={rootStyle}>
      <div className="w-full max-w-2xl p-5 sm:p-6" style={cardStyle}>

        {/* Topo: ícone de números + título + badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div style={{ width: 36, height: 36, borderRadius: 11, background: accentSoft, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Hash size={19} color={accent} strokeWidth={2.4} />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.02em", color: titleColor, whiteSpace: "nowrap" }}>Conecta Números</h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: accent, background: accentSoft, border: `1px solid ${accent}33`, padding: "5px 12px", borderRadius: 999, flexShrink: 0 }}>
            {count} números
          </span>
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* Faixa de instrução */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: stripBg, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
          <Pointer size={15} color={accent} strokeWidth={2.3} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: stripText, textAlign: "center" }}>
            {roundPhase === "playing" ? "Toque em ordem crescente: 1 → 2 → 3 → ..." : roundCorrect ? "Sequência completa!" : "Quase — observe de novo"}
          </span>
        </div>

        {/* Painel interno + área dos números */}
        <div style={{ background: innerPanelBg, border: `1px solid ${innerBorder}`, borderRadius: 18, overflow: "hidden" }}>
          <div className="relative w-full" style={{ paddingBottom: `${playAreaHeightPct(count)}%` }}>

          {/* SVG trail lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            {path.length > 1 && path.slice(1).map((pt, i) => (
              <motion.line
                key={`line-${i}`}
                x1={`${path[i].x}%`}
                y1={`${path[i].y}%`}
                x2={`${pt.x}%`}
                y2={`${pt.y}%`}
                stroke={lineColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            ))}
            {/* Dot on first clicked */}
            {path.length > 0 && (
              <circle
                cx={`${path[0].x}%`}
                cy={`${path[0].y}%`}
                r={4}
                fill={lineColor}
                opacity={0.6}
              />
            )}
          </svg>

          {/* Números */}
          {cells.map((cell) => {
            const isCompleted = cell.id < nextExpected;
            return (
              <motion.button
                key={cell.id}
                onClick={() => handleCellClick(cell.id)}
                disabled={roundPhase !== "playing" || isCompleted}
                style={cellStyleObj(cell)}
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.18 }}
              >
                {cell.label}
              </motion.button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
