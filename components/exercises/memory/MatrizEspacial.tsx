"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Pointer } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
import type { ExerciseResult, Theme } from "@/types";

interface MatrizEspacialProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  alwaysReverse?: boolean;
}

type Phase = "showing" | "recall" | "feedback";

export const MATRIZ_ESPACIAL_MIN_DIFFICULTY = 1;
// Grade cresce com a dificuldade: mais blocos pra brilhar nos níveis altos.
// Fácil 4×4 · Médio 5×5 · Difícil 6×6.
export function matrizEspacialGridSizeFor(d: number): number {
  if (d <= 4) return 4;
  if (d <= 7) return 5;
  return 6;
}

// Dificuldade 6-10: modo inverso (clica na ordem reversa)
const REVERSE_MODE = (difficulty: number) => difficulty >= 6;

// Ponto de partida: dificuldade 1 → 2 células, dificuldade 5 → 4, dificuldade 10 → 6
export function matrizEspacialSequenceLengthFor(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.5) + 1), 5);
}
const MIN_SEQ = matrizEspacialSequenceLengthFor(MATRIZ_ESPACIAL_MIN_DIFFICULTY);
const MAX_SEQ = 9;

// ── Som de feedback (Web Audio, sem arquivos) ──────────────────────────────────
// Tons FIXOS (não variam por posição) para preservar a natureza visuoespacial
// (Corsi) — o som é só um feedback satisfatório, não uma pista de "onde".
let audioCtx: AudioContext | null = null;
function beep(freq: number, durMs = 180, type: OscillatorType = "sine", gain = 0.08) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durMs / 1000);
    osc.connect(g); g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durMs / 1000);
  } catch { /* áudio indisponível — silencioso */ }
}
const soundLight   = () => beep(523, 200, "sine", 0.08);          // célula acende (apresentação)
const soundTap     = () => beep(659, 110, "sine", 0.06);          // toque do paciente
const soundCorrect = () => { beep(659, 120, "sine", 0.08); setTimeout(() => beep(988, 220, "sine", 0.08), 120); }; // acerto

export function MatrizEspacialGrid({
  theme,
  gridSize,
  activeCell,
  selectedCells,
  interactive,
  onCellClick,
  pressedCell,
  cellStyleFor,
}: {
  theme?: Theme;
  gridSize: number;
  activeCell: number | null;
  selectedCells: number[];
  interactive: boolean;
  onCellClick: (idx: number) => void;
  /** Célula exibida como pressionada por código; ausente não altera o treino. */
  pressedCell?: number;
  cellStyleFor?: (idx: number) => React.CSSProperties;
}) {
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  function defaultCellStyle(idx: number): React.CSSProperties {
    if (activeCell === idx) {
      return isGamified
        ? { background: "#06b6d4", border: "2px solid #67e8f9", borderRadius: 10 }
        : isColorful
          ? { background: "#14b8a6", border: "2px solid #5eead4", borderRadius: 10 }
          : { background: "#3b82f6", border: "2px solid #93c5fd", borderRadius: 10 };
    }
    if (selectedCells.includes(idx)) {
      return isGamified
        ? { background: "#0e7490", border: "2px solid #06b6d4", borderRadius: 10 }
        : { background: "#93c5fd", border: "2px solid #3b82f6", borderRadius: 10 };
    }
    return isGamified
      ? { background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 10 }
      : isColorful
        ? { background: "#d4f7f0", border: "2px solid #7fe0d2", borderRadius: 10 }
        : { background: "#e7ecf3", border: "2px solid #aebfd5", borderRadius: 10 };
  }

  return (
    <div
      className="grid gap-2.5 mx-auto rounded-xl w-full"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: 400 }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, idx) => (
        <motion.button
          key={idx}
          data-cell={idx}
          onClick={() => onCellClick(idx)}
          disabled={!interactive || selectedCells.includes(idx)}
          className="aspect-square transition-colors"
          style={cellStyleFor ? cellStyleFor(idx) : defaultCellStyle(idx)}
          whileTap={interactive ? { scale: 0.9 } : {}}
          animate={pressedCell === idx
            ? { scale: 0.9 }
            : activeCell === idx
              ? { scale: [1, 1.22, 1] }
              : { scale: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }: MatrizEspacialProps) {
  const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);
  const [seqLength, setSeqLength] = useState(matrizEspacialSequenceLengthFor(difficulty));
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [trial, setTrial] = useState(0);
  const [attempts, setAttempts] = useState<{ correct: boolean; seqLen: number }[]>([]);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; userSeq: number[] } | null>(null);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  useEffect(() => { begin(); }, [begin]);

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";
  const grid = matrizEspacialGridSizeFor(difficulty);

  const generateSeq = useCallback((len: number) => {
    const cells = new Set<number>();
    while (cells.size < len) cells.add(Math.floor(Math.random() * grid * grid));
    return Array.from(cells);
  }, [grid]);

  const showSequence = useCallback(async (seq: number[]) => {
    setPhase("showing");
    setActiveCell(null);
    setUserSeq([]);

    for (const cell of seq) {
      // Mais tempo entre um flash e o outro (não "pisca tudo rápido").
      await new Promise<void>((r) => setTimeout(r, 560));
      setActiveCell(cell);
      soundLight();
      await new Promise<void>((r) => setTimeout(r, 760));
      setActiveCell(null);
    }

    await new Promise<void>((r) => setTimeout(r, 500));
    setPhase("recall");
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const seq = generateSeq(seqLength);
    setSequence(seq);
    showSequence(seq);
  }, [trial]);

  function handleCellClick(idx: number) {
    if (phase !== "recall" || userSeq.includes(idx)) return;

    const newSeq = [...userSeq, idx];
    setUserSeq(newSeq);
    soundTap();

    if (newSeq.length < seqLength) return;

    const expected = reverse ? [...sequence].reverse() : sequence;
    // Motor POR TENTATIVA (épico Cogmed): correta → sequência +1 já na próxima;
    // erro LEVE (1 célula errada ou troca de duas vizinhas) → mantém; erro
    // GRAVE → −1. Treina na borda da capacidade.
    const verdict = classifyTrial(expected, newSeq);
    const correct = verdict === "correta";
    if (correct) soundCorrect();

    setFeedbackData({ correct, userSeq: newSeq });
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, seqLen: seqLength }];
    setAttempts(newAttempts);

    const nextSeqLen = nextLevelPerTrial(seqLength, verdict, MIN_SEQ, MAX_SEQ);

    const nextTrial = trial + 1;
    const timeUp = isTimeUp();

    setTimeout(() => {
      if (timeUp) {
        finish();
        const correctCount = newAttempts.filter((a) => a.correct).length;
        const accuracy = correctCount / Math.max(1, newAttempts.length);
        const maxSeq = Math.max(...newAttempts.map((a) => a.seqLen));
        const score = calculateExerciseScore("matriz-espacial", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "matriz-espacial",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration: elapsedSec(),
          metadata: { gridSize: grid, seqLength: maxSeq, reverse, trials: newAttempts.length, correct: correctCount },
        });
      } else {
        setFeedbackData(null);
        setSeqLength(nextSeqLen);
        setTrial(nextTrial);
      }
    }, 1800);
  }

  // ─── Design system (visual premium clean — mockup da Kamylla) ─────────
  const accent = isGamified ? "#22d3ee" : isColorful ? "#14b8a6" : "#3b82f6";
  const accentSoft = isGamified ? "rgba(34,211,238,0.16)" : isColorful ? "rgba(20,184,166,0.12)" : "rgba(59,130,246,0.10)";

  const rootBg: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #e6fffb 0%, #d7f7f4 55%, #e0f7ff 100%)" }
    : { background: "linear-gradient(160deg, #fbfcff 0%, #eef4ff 48%, #f3effe 100%)" };  // branco · azul gelo · lavanda

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1px solid rgba(148,163,184,0.28)", borderRadius: 24, boxShadow: "0 10px 44px rgba(99,118,160,0.13)" };

  const titleColor = isGamified ? "#ffffff" : isColorful ? "#0f766e" : "#1e293b";
  const innerPanel = isGamified ? "rgba(255,255,255,0.04)" : isColorful ? "rgba(20,184,166,0.05)" : "rgba(59,130,246,0.045)";
  const innerBorder = isGamified ? "rgba(255,255,255,0.08)" : isColorful ? "rgba(20,184,166,0.14)" : "rgba(59,130,246,0.12)";
  const stripBg = isGamified ? "rgba(34,211,238,0.10)" : isColorful ? "rgba(20,184,166,0.08)" : "rgba(59,130,246,0.07)";
  const stripText = isGamified ? "rgba(255,255,255,0.82)" : isColorful ? "#0f766e" : "#475569";

  const inactiveIndicatorColor = isGamified ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.3)";

  function cellStyleFor(idx: number): React.CSSProperties {
    const R = 16;
    const isActive = activeCell === idx;
    const isUserSelected = userSeq.includes(idx);
    const isInSeq = sequence.includes(idx);

    if (phase === "feedback" && feedbackData) {
      const posInUser = feedbackData.userSeq.indexOf(idx);
      const posInSeq = sequence.indexOf(idx);
      if (posInUser !== -1 && posInSeq !== -1 && posInUser === posInSeq) {
        return { background: "linear-gradient(150deg,#86efac,#22c55e)", border: "2px solid #16a34a", borderRadius: R, boxShadow: "0 0 16px rgba(34,197,94,0.5)" };
      }
      if (isInSeq) return { background: "linear-gradient(150deg,#fcd34d,#f59e0b)", border: "2px solid #d97706", borderRadius: R };
      if (isUserSelected) return { background: "rgba(169,183,198,0.45)", border: "2px solid #A9B7C6", borderRadius: R };
    }

    if (isActive) {
      // Brilho vibrante (glow) ao acender, em todos os temas.
      if (isGamified) return { background: "linear-gradient(150deg,#67e8f9,#22d3ee)", border: "2px solid #a5f3fc", borderRadius: R, boxShadow: "0 0 26px 6px rgba(34,211,238,0.85)" };
      if (isColorful) return { background: "linear-gradient(150deg,#5eead4,#2dd4bf)", border: "2px solid #99f6e4", borderRadius: R, boxShadow: "0 0 26px 6px rgba(45,212,191,0.8)" };
      return { background: "linear-gradient(150deg,#93c5fd,#60a5fa)", border: "2px solid #bfdbfe", borderRadius: R, boxShadow: "0 0 26px 6px rgba(96,165,250,0.75)" };
    }
    if (isUserSelected && phase === "recall") {
      if (isGamified) return { background: "linear-gradient(150deg,#22d3ee,#0e7490)", border: "2px solid #06b6d4", borderRadius: R, boxShadow: "0 0 14px rgba(34,211,238,0.45)" };
      if (isColorful) return { background: "linear-gradient(150deg,#2dd4bf,#0d9488)", border: "2px solid #14b8a6", borderRadius: R, boxShadow: "0 0 14px rgba(20,184,166,0.4)" };
      return { background: "linear-gradient(150deg,#93c5fd,#3b82f6)", border: "2px solid #3b82f6", borderRadius: R, boxShadow: "0 0 14px rgba(59,130,246,0.35)" };
    }
    // Célula inativa — "botão" tátil com profundidade (gradiente + brilho interno + sombra).
    if (isGamified) return {
      background: "linear-gradient(150deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04))",
      border: "1.5px solid rgba(255,255,255,0.16)", borderRadius: R,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 6px rgba(0,0,0,0.35)",
    };
    if (isColorful) return {
      background: "linear-gradient(150deg, #ffffff, #ccfbf1)",
      border: "1.5px solid rgba(20,184,166,0.22)", borderRadius: R,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 2px 7px rgba(20,184,166,0.13)",
    };
    return {
      background: "#ffffff",
      border: "1.5px solid rgba(148,163,184,0.32)", borderRadius: R,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 2px 8px rgba(99,118,160,0.10)",
    };
  }

  const instruction =
    phase === "showing" ? (reverse ? "Observe a sequência — depois toque ao contrário" : "Observe a sequência...")
    : phase === "recall" ? (reverse ? `Toque as ${seqLength} células em ORDEM INVERSA` : `Toque as ${seqLength} células na mesma ordem`)
    : (feedbackData?.correct ? "Correto!" : "Eram estas as posições");
  const instructionColor = phase === "feedback" && !feedbackData?.correct ? "#2C6B84" : stripText;

  return (
    <ExerciseStage width="medio" background={rootBg.background as string}>

      {/* Card do exercício */}
      <div className="w-full p-6" style={cardStyle}>

        {/* Topo: ícone de grade + título + badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div style={{ width: 36, height: 36, borderRadius: 11, background: accentSoft, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutGrid size={19} color={accent} strokeWidth={2.2} />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.02em", color: titleColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Matriz Espacial{reverse ? " Inversa" : ""}
            </h2>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: accent,
            background: accentSoft, border: `1px solid ${accent}33`,
            padding: "5px 12px", borderRadius: 999, flexShrink: 0,
          }}>
            {seqLength} {seqLength > 1 ? "células" : "célula"}
          </span>
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* Faixa de instrução */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: stripBg, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
          <Pointer size={15} color={accent} strokeWidth={2.3} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: instructionColor, textAlign: "center" }}>{instruction}</span>
        </div>

        {/* Painel interno + grade (cresce com a dificuldade) */}
        <div style={{ background: innerPanel, border: `1px solid ${innerBorder}`, borderRadius: 18, padding: 16 }}>
          <MatrizEspacialGrid
            theme={theme}
            gridSize={grid}
            activeCell={activeCell}
            selectedCells={userSeq}
            interactive={phase === "recall"}
            onCellClick={handleCellClick}
            cellStyleFor={cellStyleFor}
          />
        </div>

        {/* Indicador discreto de quantas células já foram tocadas (durante a recuperação) */}
        {phase === "recall" && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: seqLength }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 9, height: 9, borderRadius: 9999, transition: "background 0.2s",
                  background: i < userSeq.length ? accent : inactiveIndicatorColor,
                }}
              />
            ))}
          </div>
        )}

      </div>
    </ExerciseStage>
  );
}
