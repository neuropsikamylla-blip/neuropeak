"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface MatrizEspacialProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  alwaysReverse?: boolean;
}

type Phase = "showing" | "recall" | "feedback";

const MAX_TRIALS = 30;
const MIN_SEQ = 2;
const MAX_SEQ = 9;
// Grade cresce com a dificuldade: mais blocos pra brilhar nos níveis altos.
// Fácil 4×4 · Médio 5×5 · Difícil 6×6.
function gridSizeFor(d: number): number {
  if (d <= 4) return 4;
  if (d <= 7) return 5;
  return 6;
}

// Dificuldade 6-10: modo inverso (clica na ordem reversa)
const REVERSE_MODE = (difficulty: number) => difficulty >= 6;

// Ponto de partida: dificuldade 1 → 2 células, dificuldade 5 → 4, dificuldade 10 → 6
function initialSeq(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.5) + 1), 5);
}

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
const soundWrong   = () => beep(160, 260, "square", 0.06);        // erro

// Tutorial cells: indices in a 4x4 grid
const TSEQ_DIRECT = [4, 12]; // cells 5 and 13 (0-indexed: 4 and 12)
const TSEQ_INVERSE = [2, 9]; // cells 3 and 10 (0-indexed: 2 and 9)

function MatrizTutorialGrid({
  theme,
  seq,
  expectedOrder,
  onDone,
  showOnly,
}: {
  theme: Theme;
  seq: number[];
  expectedOrder: number[];
  onDone: () => void;
  showOnly?: boolean;
}) {
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number[]>([]);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [showDone, setShowDone] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!showOnly) return;
    let cancelled = false;
    async function run() {
      for (const cell of seq) {
        if (cancelled) return;
        await new Promise<void>((r) => setTimeout(r, 400));
        if (cancelled) return;
        setActiveCell(cell);
        soundLight();
        await new Promise<void>((r) => setTimeout(r, 600));
        if (cancelled) return;
        setActiveCell(null);
      }
      await new Promise<void>((r) => setTimeout(r, 300));
      if (!cancelled) { setShowDone(true); onDone(); }
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(idx: number) {
    if (done.current || showOnly) return;
    const next = clicked.length;
    if (idx === expectedOrder[next]) {
      const newClicked = [...clicked, idx];
      setClicked(newClicked);
      setFlash("green");
      setTimeout(() => setFlash(null), 300);
      if (newClicked.length === expectedOrder.length) {
        done.current = true;
        setTimeout(onDone, 400);
      }
    } else {
      setFlash("red");
      setTimeout(() => { setFlash(null); setClicked([]); }, 400);
    }
  }

  function cellStyleFor(idx: number): React.CSSProperties {
    const isActive = activeCell === idx;
    const isClicked = clicked.includes(idx);
    const isSeqCell = seq.includes(idx);

    if (isActive || (showOnly && isSeqCell && showDone)) {
      return isGamified
        ? { background: "#06b6d4", border: "2px solid #67e8f9", borderRadius: 10 }
        : isColorful
        ? { background: "#14b8a6", border: "2px solid #5eead4", borderRadius: 10 }
        : { background: "#3b82f6", border: "2px solid #93c5fd", borderRadius: 10 };
    }
    if (isClicked && flash === "green") return { background: "#4ade80", border: "2px solid #16a34a", borderRadius: 10 };
    if (isClicked) return isGamified
      ? { background: "#0e7490", border: "2px solid #06b6d4", borderRadius: 10 }
      : { background: "#93c5fd", border: "2px solid #3b82f6", borderRadius: 10 };
    return isGamified
      ? { background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 10 }
      : isColorful
      ? { background: "#d4f7f0", border: "2px solid #7fe0d2", borderRadius: 10 }
      : { background: "#e7ecf3", border: "2px solid #aebfd5", borderRadius: 10 };
  }

  const ringStyle: React.CSSProperties = flash === "green"
    ? { outline: "3px solid #4ade80", outlineOffset: 2 }
    : flash === "red"
    ? { outline: "3px solid #f87171", outlineOffset: 2 }
    : {};

  return (
    <div
      className="grid gap-2 mx-auto rounded-xl w-full"
      style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: "300px", ...ringStyle }}
    >
      {Array.from({ length: 16 }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => handleClick(idx)}
          disabled={showOnly || done.current}
          className="aspect-square transition-colors"
          style={cellStyleFor(idx)}
        />
      ))}
    </div>
  );
}

function MatrizEspacialTutorial({ theme, reverse, onDone }: { theme: Theme; reverse: boolean; onDone: () => void }) {
  const seq = reverse ? TSEQ_INVERSE : TSEQ_DIRECT;
  const answerOrder = reverse ? [...seq].reverse() : seq;

  const steps = [
    {
      instruction: reverse
        ? "1) Observe com atenção: as células vão ACENDER uma de cada vez, com um som. Guarde a ORDEM em que acendem."
        : "1) Observe com atenção: as células vão ACENDER uma de cada vez, com um som. Guarde a ORDEM em que acendem.",
      content: (onStepDone: () => void) => (
        <MatrizTutorialGrid theme={theme} seq={seq} expectedOrder={answerOrder} onDone={onStepDone} showOnly />
      ),
    },
    {
      instruction: reverse
        ? "2) Agora repita na ORDEM CONTRÁRIA: toque da ÚLTIMA célula que acendeu para a PRIMEIRA."
        : "2) Agora é a sua vez: TOQUE as mesmas células, na MESMA ordem em que acenderam.",
      content: (onStepDone: () => void) => (
        <MatrizTutorialGrid theme={theme} seq={seq} expectedOrder={answerOrder} onDone={onStepDone} />
      ),
    },
  ];

  return (
    <TutorialBase
      theme={theme}
      title={reverse ? "Matriz Espacial Inversa" : "Matriz Espacial"}
      steps={steps}
      onDone={onDone}
    />
  );
}

export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }: MatrizEspacialProps) {
  const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);
  const [showTutorial, setShowTutorial] = useState(true);
  const [seqLength, setSeqLength] = useState(initialSeq(difficulty));
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [trial, setTrial] = useState(0);
  const [attempts, setAttempts] = useState<{ correct: boolean; seqLen: number }[]>([]);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; userSeq: number[] } | null>(null);
  const startTime = useRef<number>(Date.now());
  const reportProgress = useExerciseProgress();

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";
  const grid = gridSizeFor(difficulty);

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
    if (showTutorial) return;
    const seq = generateSeq(seqLength);
    setSequence(seq);
    showSequence(seq);
  }, [trial, showTutorial]);

  function handleCellClick(idx: number) {
    if (phase !== "recall" || userSeq.includes(idx)) return;

    const newSeq = [...userSeq, idx];
    setUserSeq(newSeq);
    soundTap();

    if (newSeq.length < seqLength) return;

    const expected = reverse ? [...sequence].reverse() : sequence;
    const correct = newSeq.every((cell, i) => cell === expected[i]);
    if (correct) soundCorrect(); else soundWrong();

    setFeedbackData({ correct, userSeq: newSeq });
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, seqLen: seqLength }];
    setAttempts(newAttempts);

    const newStreak = correct
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;

    let nextSeqLen = seqLength;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextSeqLen = Math.min(seqLength + 1, MAX_SEQ); nextStreak = 0; }
    if (newStreak <= -2) { nextSeqLen = Math.max(seqLength - 1, MIN_SEQ); nextStreak = 0; }

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const accuracy = newAttempts.filter((a) => a.correct).length / MAX_TRIALS;
        const maxSeq = Math.max(...newAttempts.map((a) => a.seqLen));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("matriz-espacial", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "matriz-espacial",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { gridSize: grid, seqLength: maxSeq, reverse, trials: MAX_TRIALS, correct: newAttempts.filter((a) => a.correct).length },
        });
      } else {
        setFeedbackData(null);
        setStreak(nextStreak);
        setSeqLength(nextSeqLen);
        setTrial(nextTrial);
      }
    }, 1800);
  }

  if (showTutorial) {
    return <MatrizEspacialTutorial theme={theme} reverse={reverse} onDone={() => setShowTutorial(false)} />;
  }

  // ─── Design system styles ────────────────────────────────────────────
  const rootBg: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #e6fffb 0%, #d7f7f4 55%, #e0f7ff 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const titleColor = isGamified ? "#ffffff" : "#1a2744";
  const labelColor = isGamified ? "rgba(255,255,255,0.7)" : "#5a4a3a";
  const progressEmptyColor = isGamified ? "rgba(255,255,255,0.12)" : "rgba(26,39,68,0.12)";

  const activeIndicatorColor = isGamified ? "#22d3ee" : isColorful ? "#14b8a6" : "#3b82f6";
  const inactiveIndicatorColor = isGamified ? "rgba(255,255,255,0.12)" : "rgba(26,39,68,0.12)";

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
      if (isUserSelected) return { background: "linear-gradient(150deg,#fca5a5,#ef4444)", border: "2px solid #dc2626", borderRadius: R };
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
      background: "linear-gradient(150deg, #ffffff, #f1ece1)",
      border: "1.5px solid rgba(26,39,68,0.12)", borderRadius: R,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 7px rgba(26,39,68,0.1)",
    };
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={rootBg}>
      <div className="w-full max-w-lg p-6" style={cardStyle}>

        {/* Header */}
        <div className="flex justify-between items-center gap-2 mb-4">
          <h2 style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", color: titleColor }}>
            Matriz Espacial{reverse ? " Inversa" : ""}
          </h2>
          <span style={{
            fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            color: activeIndicatorColor,
            background: isGamified ? "rgba(34,211,238,0.12)" : isColorful ? "rgba(20,184,166,0.1)" : "rgba(59,130,246,0.08)",
            border: `1px solid ${activeIndicatorColor}33`,
            padding: "4px 11px", borderRadius: 999,
          }}>
            {seqLength} {seqLength > 1 ? "células" : "célula"}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 6,
                flex: 1,
                borderRadius: 9999,
                transition: "background 0.2s",
                background: i < attempts.length
                  ? attempts[i].correct ? "#16a34a" : "#ef4444"
                  : i === trial ? "#60a5fa"
                  : progressEmptyColor,
              }}
            />
          ))}
        </div>

        {/* Instrução */}
        <p style={{ fontSize: 13, textAlign: "center", marginBottom: 16, minHeight: 20, color: labelColor }}>
          {phase === "showing" && (reverse ? "Observe a sequência... clique ao contrário!" : "Observe a sequência...")}
          {phase === "recall" && (reverse
            ? `Toque as ${seqLength} células em ORDEM INVERSA (última → primeira)`
            : `Toque as ${seqLength} células na mesma ordem`)}
          {phase === "feedback" && (feedbackData?.correct ? "Correto! ✅" : "Incorreto ❌")}
        </p>

        {/* Grade (cresce com a dificuldade) */}
        <div
          className="grid gap-2.5 mx-auto mb-4 w-full"
          style={{ gridTemplateColumns: `repeat(${grid}, 1fr)`, maxWidth: "480px" }}
        >
          {Array.from({ length: grid * grid }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== "recall" || userSeq.includes(idx)}
              className="aspect-square transition-colors"
              style={cellStyleFor(idx)}
              whileTap={phase === "recall" ? { scale: 0.9 } : {}}
              animate={activeCell === idx ? { scale: [1, 1.22, 1] } : {}}
              transition={{ duration: 0.28, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* Indicador de posição durante recall */}
        {phase === "recall" && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: seqLength }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  transition: "background 0.2s",
                  background: i < userSeq.length ? activeIndicatorColor : inactiveIndicatorColor,
                }}
              />
            ))}
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {phase === "feedback" && feedbackData && (
            <motion.div
              className="text-center mt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: feedbackData.correct ? "#16a34a" : "#ef4444" }}>
                {feedbackData.correct ? "Correto! ✅" : "Incorreto ❌"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
