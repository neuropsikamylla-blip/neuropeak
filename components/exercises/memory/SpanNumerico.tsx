"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
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

// Dificuldade 6-10: modo inverso (memória operacional)
const REVERSE_MODE = (difficulty: number) => difficulty >= 6;

// Ponto de partida do span conforme dificuldade
function initialSpan(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.5) + 1), 5);
}

const NUMPAD: (number | "⌫" | "✓")[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["⌫", 0, "✓"],
];

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

export function SpanNumerico({ difficulty, theme, onComplete, alwaysReverse }: SpanNumericoProps) {
  const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);

  const [spanLength, setSpanLength] = useState(initialSpan(difficulty));
  const [streak, setStreak] = useState(0); // positivo = acertos, negativo = erros
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
    const seq = generateSeq(spanLength);
    setSequence(seq);
    showSequence(seq);
  }, [trial]);

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
    // Resposta esperada: inversa se reverse, direta se não
    const expected = reverse ? [...sequence].reverse() : sequence;
    const correct = entered.join("") === expected.join("");

    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, span: spanLength }];
    setAttempts(newAttempts);

    // Escada 2-cima / 2-baixo
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

  // ─── Estilos por tema ────────────────────────────────────────────────
  const bg = { CLINICAL: "bg-gray-50", COLORFUL: "bg-gradient-to-br from-purple-50 to-pink-50", GAMIFIED: "bg-gray-950" }[theme];
  const card = { CLINICAL: "bg-white shadow-lg", COLORFUL: "bg-white shadow-lg", GAMIFIED: "bg-gray-800 border border-cyan-500/30" }[theme];
  const title = { CLINICAL: "text-gray-900", COLORFUL: "text-purple-700", GAMIFIED: "text-cyan-400" }[theme];
  const sub = { CLINICAL: "text-gray-500", COLORFUL: "text-purple-500", GAMIFIED: "text-gray-400" }[theme];
  const displayBox = {
    CLINICAL: "bg-gray-100 text-gray-900 border-2 border-gray-300",
    COLORFUL: "bg-purple-100 text-purple-900 border-4 border-purple-400",
    GAMIFIED: "bg-gray-700 text-cyan-400 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
  }[theme];

  const numBtnBase = "h-14 flex items-center justify-center rounded-2xl text-2xl font-bold select-none active:scale-95 transition-transform duration-75 cursor-pointer";
  const numBtn = {
    CLINICAL: `${numBtnBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-400 shadow-sm`,
    COLORFUL: `${numBtnBase} bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md`,
    GAMIFIED: `${numBtnBase} bg-gray-700 border border-cyan-500/40 text-cyan-300 hover:bg-gray-600`,
  }[theme];

  function digitTileClass(filled: boolean) {
    return {
      CLINICAL: `w-10 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${filled ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-gray-100 border-gray-300"}`,
      COLORFUL: `w-10 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${filled ? "bg-purple-50 border-purple-400 text-purple-700" : "bg-purple-50/50 border-purple-200"}`,
      GAMIFIED: `w-10 h-12 rounded-xl border flex items-center justify-center text-2xl font-bold ${filled ? "bg-gray-700 border-cyan-500 text-cyan-400" : "bg-gray-800 border-gray-600"}`,
    }[theme];
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`font-bold text-base ${title}`}>
              Span Numérico{reverse ? " — Inverso" : ""}
            </h2>
            <p className={`text-xs ${sub}`}>
              {spanLength} dígito{spanLength > 1 ? "s" : ""}
              {reverse ? " · responda ao contrário" : ""}
            </p>
          </div>
          <span className={`text-sm font-medium ${sub}`}>{trial + 1}/{MAX_TRIALS}</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < attempts.length
                  ? attempts[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* FASE: mostrando */}
        {phase === "showing" && (
          <div className="text-center">
            <p className={`text-sm mb-6 ${sub}`}>
              {reverse
                ? "Ouça os números... e depois repita ao contrário"
                : "Memorize a sequência..."}
            </p>
            <AnimatePresence mode="wait">
              {currentDisplay !== null ? (
                <motion.div
                  key={`${trial}-${currentDisplay}-${Date.now()}`}
                  className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-black mx-auto ${displayBox}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {currentDisplay}
                </motion.div>
              ) : (
                <div className={`w-32 h-32 rounded-2xl mx-auto ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"}`} />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* FASE: input — tiles + numpad */}
        {phase === "input" && (
          <div>
            <p className={`text-sm text-center mb-1 font-medium ${sub}`}>
              {reverse
                ? "Toque os números em ORDEM INVERSA (último → primeiro):"
                : "Toque os números na mesma ordem:"}
            </p>

            {/* Animação de seta inversa */}
            {reverse && (
              <p className={`text-xs text-center mb-3 ${theme === "GAMIFIED" ? "text-cyan-500" : "text-blue-500"}`}>
                ← da direita para a esquerda
              </p>
            )}

            {/* Tiles de dígitos */}
            <div className="flex justify-center gap-2 mb-5 flex-wrap">
              {Array.from({ length: spanLength }).map((_, i) => (
                <div key={i} className={digitTileClass(i < digits.length)}>
                  {i < digits.length ? digits[i] : "·"}
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {NUMPAD.flat().map((key, idx) => {
                const isBack = key === "⌫";
                const isConfirm = key === "✓";
                const disabled = isConfirm && digits.length === 0;

                let extra = "";
                if (isBack) {
                  extra = {
                    CLINICAL: "bg-orange-50 border-2 border-orange-300 text-orange-600 hover:bg-orange-100",
                    COLORFUL: "bg-orange-400 text-white",
                    GAMIFIED: "bg-gray-700 border border-orange-500/40 text-orange-400",
                  }[theme];
                } else if (isConfirm) {
                  extra = {
                    CLINICAL: `bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`,
                    COLORFUL: `bg-gradient-to-br from-green-400 to-teal-400 text-white ${disabled ? "opacity-40" : ""}`,
                    GAMIFIED: `bg-cyan-600 border border-cyan-600/60 text-white ${disabled ? "opacity-40" : ""}`,
                  }[theme];
                }

                return (
                  <button
                    key={idx}
                    onPointerDown={(e) => { e.preventDefault(); if (!disabled) handleKey(key); }}
                    disabled={disabled}
                    className={`${isBack || isConfirm ? `h-14 flex items-center justify-center rounded-2xl text-2xl font-bold select-none active:scale-95 transition-transform duration-75 ${extra}` : numBtn}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FASE: feedback */}
        {phase === "feedback" && (
          <AnimatePresence>
            <motion.div
              className="text-center py-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-5xl mb-3">{feedback === "correct" ? "✅" : "❌"}</div>
              <p className={`text-base font-bold mb-1 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}>
                {feedback === "correct" ? "Correto!" : "Incorreto"}
              </p>
              <p className={`text-sm ${sub}`}>
                {reverse ? "Resposta correta: " : "Sequência: "}
                <span className="font-mono font-bold">
                  {(reverse ? [...sequence].reverse() : sequence).join(" ")}
                </span>
              </p>
              {reverse && (
                <p className={`text-xs mt-1 ${sub}`}>
                  (apresentado: {sequence.join(" ")})
                </p>
              )}
              {trial + 1 < MAX_TRIALS && (
                <p className={`text-xs mt-2 font-medium ${feedback === "correct" && streak + 1 >= 2 ? (theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600") : sub}`}>
                  {feedback === "correct" && streak + 1 >= 2
                    ? `Próxima: ${Math.min(spanLength + 1, MAX_SPAN)} dígitos ↑`
                    : feedback !== "correct" && streak - 1 <= -2 && spanLength > MIN_SPAN
                    ? `Próxima: ${Math.max(spanLength - 1, MIN_SPAN)} dígitos ↓`
                    : ""}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </div>
  );
}
