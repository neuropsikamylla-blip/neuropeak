"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
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

// ── Célula de número (COMPARTILHADA: jogo e tutorial — réplica exata) ────────────
// FIX do "anda pra frente": o posicionamento (translate -50%) fica num WRAPPER
// estático; o whileTap (scale) fica no botão interno. Antes, o framer-motion
// SOBRESCREVIA o transform de posicionamento ao pressionar → o número pulava do
// lugar e o clique não registrava (tinha que clicar 2x).
function TrilhaCell({ x, y, label, completed, disabled, accent, isG, onTap }: {
  x: number; y: number; label: string | number; completed: boolean; disabled: boolean;
  accent: string; isG: boolean; onTap: () => void;
}) {
  const inner: React.CSSProperties = completed
    ? { background: accent, border: `2px solid ${accent}`, color: "#ffffff", opacity: 0.5 }
    : {
        background: isG ? "rgba(255,255,255,0.06)" : "#ffffff",
        border: isG ? "1.5px solid rgba(255,255,255,0.16)" : "1.5px solid rgba(148,163,184,0.36)",
        color: isG ? "#e2e8f0" : "#1e3a8a",
        boxShadow: isG ? "0 2px 6px rgba(0,0,0,0.35)" : "0 2px 10px rgba(99,118,160,0.12)",
      };
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", width: 54, height: 54 }}>
      <motion.button
        onClick={onTap}
        disabled={disabled}
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.15 }}
        style={{
          width: "100%", height: "100%", borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 20, userSelect: "none",
          transition: "background .15s, border-color .15s, box-shadow .15s",
          ...inner,
        }}>
        {label}
      </motion.button>
    </div>
  );
}

function TrilhaTutorialStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [nextExpected, setNextExpected] = useState(1);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const done = useRef(false);

  // MESMO design system do jogo (réplica exata — pedido da Kamylla).
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const accent = isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
  const innerPanelBg = isG ? "rgba(255,255,255,0.03)" : isC ? "rgba(99,102,241,0.05)" : "rgba(59,130,246,0.045)";
  const innerBorder = isG ? "rgba(255,255,255,0.08)" : isC ? "rgba(99,102,241,0.13)" : "rgba(59,130,246,0.12)";

  function handleTap(cell: { id: number; x: number; y: number }) {
    if (done.current || cell.id !== nextExpected) return;
    setPath((p) => [...p, { x: cell.x, y: cell.y }]);
    const newNext = nextExpected + 1;
    setNextExpected(newNext);
    if (newNext > TUTORIAL_CELLS.length) { done.current = true; setTimeout(onDone, 400); }
  }

  return (
    <div style={{ background: innerPanelBg, border: `1px solid ${innerBorder}`, borderRadius: 18, overflow: "hidden" }}>
      <div className="relative w-full" style={{ paddingBottom: "62%", minHeight: 180 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {path.length > 1 && path.slice(1).map((pt, i) => (
            <motion.line
              key={`l${i}`}
              x1={`${path[i].x}%`} y1={`${path[i].y}%`}
              x2={`${pt.x}%`} y2={`${pt.y}%`}
              stroke={accent} strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          ))}
          {path.length > 0 && (
            <circle cx={`${path[0].x}%`} cy={`${path[0].y}%`} r={4} fill={accent} opacity={0.6} />
          )}
        </svg>
        {TUTORIAL_CELLS.map((cell) => (
          <TrilhaCell
            key={cell.id}
            x={cell.x} y={cell.y} label={cell.id}
            completed={cell.id < nextExpected}
            disabled={done.current || cell.id < nextExpected}
            accent={accent} isG={isG}
            onTap={() => handleTap(cell)}
          />
        ))}
      </div>
    </div>
  );
}

function TrilhaVisualTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  // UMA etapa só (antes eram 2 quase iguais — a Kamylla fazia o tutorial "2x").
  const steps = [
    {
      instruction: "Toque nos números em ordem crescente: 1 → 2 → 3 → 4.",
      content: (onStepDone: () => void) => (
        <TrilhaTutorialStep theme={theme} onDone={onStepDone} />
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
  const innerPanelBg = isG ? "rgba(255,255,255,0.03)" : isC ? "rgba(99,102,241,0.05)" : "rgba(59,130,246,0.045)";
  const innerBorder = isG ? "rgba(255,255,255,0.08)" : isC ? "rgba(99,102,241,0.13)" : "rgba(59,130,246,0.12)";
  const stripBg = isG ? "rgba(34,211,238,0.10)" : isC ? "rgba(99,102,241,0.08)" : "rgba(59,130,246,0.07)";
  const stripText = isG ? "rgba(255,255,255,0.82)" : isC ? "#4338ca" : "#475569";
  const lineColor = accent;


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

          {/* Números — TrilhaCell compartilhada (o próximo NÃO é destacado, p/ não
              entregar a resposta; tocados ficam preenchidos) */}
          {cells.map((cell) => (
            <TrilhaCell
              key={cell.id}
              x={cell.x} y={cell.y} label={cell.label}
              completed={cell.id < nextExpected}
              disabled={roundPhase !== "playing" || cell.id < nextExpected}
              accent={accent} isG={isG}
              onTap={() => handleCellClick(cell.id)}
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
