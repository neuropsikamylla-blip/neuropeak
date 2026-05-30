"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface SpanNumericoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  alwaysReverse?: boolean;
}

type Phase = "showing" | "input" | "feedback";

const MAX_TRIALS = 20;
const MIN_SPAN = 2;
const MAX_SPAN = 9;

const REVERSE_MODE = (difficulty: number) => difficulty >= 6;

function initialSpan(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.5) + 1), 5);
}

const NUM_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.78;
    u.pitch = 1.0;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ── Shared visuals ────────────────────────────────────────────────────────────

function GlassBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #020617 0%, #0f172a 35%, #1a1040 65%, #0c1220 100%)",
        }}
      />
      <div
        className="absolute top-[8%] left-[5%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          filter: "blur(64px)",
        }}
      />
      <div
        className="absolute bottom-[10%] right-[8%] w-[440px] h-[440px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
      />
      <div
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          filter: "blur(52px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(10,16,34,0.82)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(148,163,184,0.1)",
  boxShadow:
    "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)",
};

// ── Tutorial sub-components ────────────────────────────────────────────────────

function SpanShowStep({ seq, onDone }: { theme: Theme; seq: number[]; onDone: () => void }) {
  const [display, setDisplay] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const n of seq) {
        if (cancelled) return;
        await new Promise<void>((r) => setTimeout(r, 400));
        if (cancelled) return;
        setDisplay(n);
        await new Promise<void>((r) => setTimeout(r, 700));
        if (cancelled) return;
        setDisplay(null);
      }
      await new Promise<void>((r) => setTimeout(r, 400));
      if (!cancelled) { setDone(true); onDone(); }
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-black mx-auto"
        style={{
          background: display !== null ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
          border: `2px solid ${display !== null ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
          color: "#818cf8",
          boxShadow: display !== null ? "0 0 28px rgba(99,102,241,0.3)" : undefined,
          transition: "all 0.15s",
        }}
      >
        {display ?? ""}
      </div>
      {done && (
        <p className="text-xs text-center text-slate-400">Sequência exibida!</p>
      )}
    </div>
  );
}

function SpanInputStep({ answer, onDone }: { theme: Theme; answer: number[]; onDone: () => void }) {
  const [clicked, setClicked] = useState<number[]>([]);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const done = useRef(false);

  function handleClick(n: number) {
    if (done.current) return;
    const next = clicked.length;
    if (n === answer[next]) {
      const newClicked = [...clicked, n];
      setClicked(newClicked);
      setFlash("green");
      setTimeout(() => setFlash(null), 300);
      if (newClicked.length === answer.length) {
        done.current = true;
        setTimeout(onDone, 400);
      }
    } else {
      setFlash("red");
      setTimeout(() => { setFlash(null); setClicked([]); }, 400);
    }
  }

  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        outline: flash === "green" ? "3px solid rgba(34,197,94,0.6)" : flash === "red" ? "3px solid rgba(244,63,94,0.6)" : "none",
      }}
    >
      <div className="flex gap-2 justify-center mb-3">
        {answer.map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{
              background: i < clicked.length ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: `2px solid ${i < clicked.length ? "rgba(129,140,248,0.6)" : "rgba(255,255,255,0.1)"}`,
              color: i < clicked.length ? "#818cf8" : "rgba(148,163,184,0.4)",
            }}
          >
            {i < clicked.length ? clicked[i] : "·"}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1,2,3,4,5,6,7,8,9,0].map((n) => (
          <button
            key={n}
            onClick={() => handleClick(n)}
            className="h-11 rounded-xl font-bold text-lg"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#c7d2fe",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpanNumericoTutorial({ theme, reverse, onDone }: { theme: Theme; reverse: boolean; onDone: () => void }) {
  const seq = reverse ? [5, 9] : [3, 7, 2];
  const answer = reverse ? [9, 5] : [3, 7, 2];

  const steps = [
    {
      instruction: reverse
        ? "Números vão aparecer um por vez. Desta vez, responda em ORDEM INVERSA!"
        : "Números vão aparecer um por vez. Memorize a sequência!",
      content: (onStepDone: () => void) => <SpanShowStep theme={theme} seq={seq} onDone={onStepDone} />,
    },
    {
      instruction: reverse
        ? `Apareceu ${seq.join(" → ")}. Responda ao contrário: ${answer.join(", ")}`
        : `Agora clique nos números na ordem em que apareceram: ${seq.join(" → ")}`,
      content: (onStepDone: () => void) => (
        <SpanInputStep theme={theme} answer={answer} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title={reverse ? "Span Numérico Inverso" : "Span Numérico"} steps={steps} onDone={onDone} />;
}

// ── Main exercise ─────────────────────────────────────────────────────────────

export function SpanNumerico({ difficulty, theme, onComplete, alwaysReverse }: SpanNumericoProps) {
  const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);
  const [showTutorial, setShowTutorial] = useState(true);
  const [spanLength, setSpanLength] = useState(initialSpan(difficulty));
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<number | null>(null);
  const [digits, setDigits] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<{ correct: boolean; span: number }[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const startTime = useRef<number>(Date.now());
  const seqIdRef = useRef<number>(0);
  const reportProgress = useExerciseProgress();

  const generateSeq = useCallback((len: number) => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 9) + 1);
    return seq;
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    window.speechSynthesis?.cancel();
    const myId = ++seqIdRef.current;
    setPhase("showing");
    setCurrentDisplay(null);
    setDigits([]);

    for (let i = 0; i < seq.length; i++) {
      if (seqIdRef.current !== myId) return;
      await new Promise<void>((r) => setTimeout(r, 400));
      if (seqIdRef.current !== myId) return;
      setCurrentDisplay(seq[i]);
      await speak(seq[i].toString());
      if (seqIdRef.current !== myId) return;
      await new Promise<void>((r) => setTimeout(r, 300));
      if (seqIdRef.current !== myId) return;
      setCurrentDisplay(null);
    }

    if (seqIdRef.current !== myId) return;
    await new Promise<void>((r) => setTimeout(r, 600));
    if (seqIdRef.current === myId) setPhase("input");
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showTutorial) return;
    const seq = generateSeq(spanLength);
    setSequence(seq);
    showSequence(seq);
  }, [trial, showTutorial]);

  function handleKey(key: number | "⌫" | "✓") {
    if (phase !== "input") return;
    if (key === "⌫") {
      setDigits((d) => d.slice(0, -1));
    } else if (key === "✓") {
      if (digits.length > 0) submit(digits);
    } else {
      if (digits.length < spanLength) setDigits((d) => [...d, key as number]);
    }
  }

  function submit(entered: number[]) {
    const expected = reverse ? [...sequence].reverse() : sequence;
    const correct = entered.join("") === expected.join("");

    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, span: spanLength }];
    setAttempts(newAttempts);

    const newStreak = correct
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;

    let nextSpan = spanLength;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextSpan = Math.min(spanLength + 1, MAX_SPAN); nextStreak = 0; }
    if (newStreak <= -2) { nextSpan = Math.max(spanLength - 1, MIN_SPAN); nextStreak = 0; }

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const accuracy = newAttempts.filter((a) => a.correct).length / MAX_TRIALS;
        const maxSpan = Math.max(...newAttempts.map((a) => a.span));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("span-numerico", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "span-numerico",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { spanLength: maxSpan, reverse, trials: MAX_TRIALS, correct: newAttempts.filter((a) => a.correct).length },
        });
      } else {
        setFeedback(null);
        setStreak(nextStreak);
        setSpanLength(nextSpan);
        setTrial(nextTrial);
      }
    }, 1600);
  }

  if (showTutorial) {
    return <SpanNumericoTutorial theme={theme} reverse={reverse} onDone={() => setShowTutorial(false)} />;
  }

  const correctCount = attempts.filter((a) => a.correct).length;
  const progressPct = (trial / MAX_TRIALS) * 100;

  // tile size: grande para poucos dígitos, menor para muitos
  const tileSize = Math.min(96, Math.max(48, Math.floor(520 / spanLength) - 12));
  const tileFontSize = Math.round(tileSize * 0.48);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GlassBg />

      <div className="w-full max-w-xl rounded-3xl p-7 space-y-5" style={CARD_STYLE}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: "rgba(148,163,184,0.45)" }}
            >
              {reverse ? "Span Numérico Inverso" : "Span Numérico"}
            </p>
            <p className="text-2xl font-bold text-white">
              {spanLength} dígito{spanLength > 1 ? "s" : ""}
              {reverse ? <span className="text-base font-normal ml-2" style={{ color: "#818cf8" }}>· inverso</span> : null}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>ACERTOS</p>
            <p className="text-xl font-black" style={{ color: "#4ade80" }}>
              {correctCount}<span className="text-sm font-normal text-slate-600 ml-1">/ {MAX_TRIALS}</span>
            </p>
          </div>
        </div>

        {/* Barra de progresso — linha única */}
        <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, #6366f1, #818cf8)" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* ── FASE: mostrando número ────────────────────────────────────── */}
        {phase === "showing" && (
          <div className="flex flex-col items-center gap-5 py-2">
            <p
              className="text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "rgba(148,163,184,0.4)" }}
            >
              {reverse ? "memorize · responda ao contrário" : "memorize a sequência"}
            </p>

            <AnimatePresence mode="wait">
              {currentDisplay !== null ? (
                <motion.div
                  key={`num-${trial}-${currentDisplay}`}
                  className="flex items-center justify-center rounded-3xl select-none"
                  style={{
                    width: "100%",
                    height: 200,
                    background: "rgba(99,102,241,0.1)",
                    border: "2px solid rgba(99,102,241,0.38)",
                    boxShadow: "0 0 56px rgba(99,102,241,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  initial={{ scale: 0.65, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.72, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 28 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <span
                    className="relative font-black select-none"
                    style={{
                      fontSize: "clamp(100px, 20vw, 144px)",
                      color: "#a5b4fc",
                      textShadow: "0 0 56px rgba(99,102,241,0.65), 0 0 100px rgba(99,102,241,0.25)",
                      lineHeight: 1,
                    }}
                  >
                    {currentDisplay}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="rounded-3xl"
                  style={{
                    width: "100%",
                    height: 200,
                    background: "rgba(255,255,255,0.025)",
                    border: "2px solid rgba(255,255,255,0.055)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── FASE: input ───────────────────────────────────────────────── */}
        {phase === "input" && (
          <div className="space-y-5">
            {/* Instrução */}
            <p
              className="text-center text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: "rgba(148,163,184,0.45)" }}
            >
              {reverse ? "toque na ordem inversa · último → primeiro" : "toque na mesma ordem"}
            </p>

            {/* Tiles da sequência */}
            <div className="flex justify-center items-center gap-3 flex-wrap">
              {Array.from({ length: spanLength }).map((_, i) => {
                const filled = i < digits.length;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center justify-center rounded-2xl font-black select-none"
                    style={{
                      width: tileSize,
                      height: tileSize,
                      fontSize: filled ? tileFontSize : Math.round(tileSize * 0.2),
                      background: filled ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${filled ? "rgba(129,140,248,0.55)" : "rgba(255,255,255,0.1)"}`,
                      color: filled ? "#a5b4fc" : "rgba(148,163,184,0.22)",
                      boxShadow: filled ? "0 0 20px rgba(99,102,241,0.2)" : undefined,
                      transition: "background 0.12s, border-color 0.12s, box-shadow 0.12s",
                    }}
                    animate={filled ? { scale: [1, 1.07, 1] } : {}}
                    transition={{ duration: 0.14 }}
                  >
                    {filled ? digits[i] : "·"}
                  </motion.div>
                );
              })}
            </div>

            {/* Numpad: 2 linhas de 5 */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <NumKey key={n} value={n} onPress={() => handleKey(n)} />
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {[6, 7, 8, 9, 0].map((n) => (
                  <NumKey key={n} value={n} onPress={() => handleKey(n)} />
                ))}
              </div>
              {/* Apagar + Confirmar */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  onPointerDown={(e) => { e.preventDefault(); handleKey("⌫"); }}
                  className="h-12 rounded-2xl font-semibold text-sm select-none active:scale-95 transition-transform duration-75 flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(251,113,133,0.07)",
                    border: "1.5px solid rgba(251,113,133,0.22)",
                    color: "#fb7185",
                  }}
                >
                  ⌫ Apagar
                </button>
                <button
                  onPointerDown={(e) => { e.preventDefault(); if (digits.length > 0) handleKey("✓"); }}
                  disabled={digits.length === 0}
                  className="h-12 rounded-2xl font-semibold text-sm select-none active:scale-95 transition-transform duration-75 flex items-center justify-center gap-2"
                  style={{
                    background: digits.length === 0 ? "rgba(255,255,255,0.03)" : "rgba(34,197,94,0.1)",
                    border: `1.5px solid ${digits.length === 0 ? "rgba(255,255,255,0.05)" : "rgba(74,222,128,0.28)"}`,
                    color: digits.length === 0 ? "rgba(148,163,184,0.2)" : "#4ade80",
                    cursor: digits.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FASE: feedback ───────────────────────────────────────────── */}
        {phase === "feedback" && (
          <AnimatePresence>
            <motion.div
              className="flex flex-col items-center py-4 gap-4"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black"
                style={{
                  background: feedback === "correct" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)",
                  border: `2px solid ${feedback === "correct" ? "rgba(74,222,128,0.38)" : "rgba(251,113,133,0.38)"}`,
                  boxShadow: `0 0 32px ${feedback === "correct" ? "rgba(34,197,94,0.18)" : "rgba(244,63,94,0.18)"}`,
                  color: feedback === "correct" ? "#4ade80" : "#fb7185",
                }}
              >
                {feedback === "correct" ? "✓" : "✗"}
              </div>

              <p
                className="text-xl font-black tracking-wide"
                style={{ color: feedback === "correct" ? "#4ade80" : "#fb7185" }}
              >
                {feedback === "correct" ? "Correto!" : "Incorreto"}
              </p>

              <div
                className="px-6 py-4 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-[11px] text-slate-500 mb-2 tracking-widest uppercase">
                  {reverse ? "resposta correta" : "sequência"}
                </p>
                <p className="font-mono font-black text-3xl tracking-[0.25em]" style={{ color: "#a5b4fc" }}>
                  {(reverse ? [...sequence].reverse() : sequence).join(" ")}
                </p>
                {reverse && (
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    apresentado: {sequence.join(" ")}
                  </p>
                )}
              </div>

              {trial + 1 < MAX_TRIALS && feedback === "correct" && streak + 1 >= 2 && (
                <p className="text-sm font-semibold" style={{ color: "#818cf8" }}>
                  Próximo: {Math.min(spanLength + 1, MAX_SPAN)} dígitos ↑
                </p>
              )}
              {trial + 1 < MAX_TRIALS && feedback !== "correct" && streak - 1 <= -2 && spanLength > MIN_SPAN && (
                <p className="text-sm font-semibold" style={{ color: "#f97316" }}>
                  Próximo: {Math.max(spanLength - 1, MIN_SPAN)} dígitos ↓
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}

function NumKey({ value, onPress }: { value: number; onPress: () => void }) {
  return (
    <motion.button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      whileTap={{ scale: 0.91 }}
      className="h-16 rounded-2xl font-black text-2xl select-none flex items-center justify-center"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1.5px solid rgba(99,102,241,0.2)",
        color: "#c7d2fe",
        backdropFilter: "blur(8px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      {value}
    </motion.button>
  );
}
