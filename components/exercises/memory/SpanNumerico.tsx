"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";

interface SpanNumericoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type Phase = "showing" | "input" | "feedback";

const SPAN_LENGTHS: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 6, 5: 7,
  6: 8, 7: 9, 8: 9, 9: 10, 10: 10,
};

const IS_REVERSE: Record<number, boolean> = {
  1: false, 2: false, 3: false, 4: false, 5: false,
  6: false, 7: false, 8: true, 9: false, 10: true,
};

export function SpanNumerico({ difficulty, theme, onComplete }: SpanNumericoProps) {
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [attempts, setAttempts] = useState<{ correct: boolean; response: string }[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const startTime = useRef<number>(Date.now());
  const maxTrials = 5;
  const spanLength = SPAN_LENGTHS[difficulty] ?? 3;
  const reverse = IS_REVERSE[difficulty] ?? false;

  const generateSequence = useCallback(() => {
    const seq: number[] = [];
    for (let i = 0; i < spanLength; i++) {
      seq.push(Math.floor(Math.random() * 9) + 1);
    }
    return seq;
  }, [spanLength]);

  const showSequence = useCallback(async (seq: number[]) => {
    setPhase("showing");
    setCurrentDisplay(null);

    for (let i = 0; i < seq.length; i++) {
      await new Promise<void>((res) => setTimeout(res, 200));
      setCurrentDisplay(seq[i]);
      await new Promise<void>((res) => setTimeout(res, 700));
      setCurrentDisplay(null);
    }

    await new Promise<void>((res) => setTimeout(res, 400));
    setPhase("input");
    setUserInput("");
  }, []);

  useEffect(() => {
    const seq = generateSequence();
    setSequence(seq);
    startTime.current = Date.now();
    showSequence(seq);
  }, [trial, generateSequence, showSequence]);

  function handleSubmit() {
    const expected = reverse ? [...sequence].reverse() : sequence;
    const expectedStr = expected.join("");
    const userStr = userInput.replace(/\s/g, "");
    const correct = userStr === expectedStr;

    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, response: userStr }];
    setAttempts(newAttempts);

    setTimeout(() => {
      if (trial + 1 >= maxTrials) {
        const accuracy = newAttempts.filter((a) => a.correct).length / maxTrials;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("span-numerico", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "span-numerico",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { spanLength, reverse, trials: maxTrials, correct: newAttempts.filter((a) => a.correct).length },
        });
      } else {
        setTrial((t) => t + 1);
        const seq = generateSequence();
        setSequence(seq);
        setFeedback(null);
        showSequence(seq);
      }
    }, 1200);
  }

  const themeBtn = {
    CLINICAL: "bg-blue-600 hover:bg-blue-700 text-white rounded-md",
    COLORFUL: "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold",
    GAMIFIED: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold",
  };

  const themeDisplay = {
    CLINICAL: "bg-gray-100 text-gray-900 border-2 border-gray-300",
    COLORFUL: "bg-purple-100 text-purple-900 border-4 border-purple-400",
    GAMIFIED: "bg-gray-700 text-cyan-400 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md rounded-2xl p-8 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900"}`}>
            Span Numérico {reverse ? "(Inverso)" : ""}
          </h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {trial + 1}/{maxTrials}
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: maxTrials }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < attempts.length
                  ? attempts[i].correct
                    ? "bg-green-500"
                    : "bg-red-500"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED"
                  ? "bg-gray-700"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {phase === "showing" && (
          <div className="text-center">
            <p className={`text-sm mb-6 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Memorize a sequência...
            </p>
            <AnimatePresence mode="wait">
              {currentDisplay !== null ? (
                <motion.div
                  key={currentDisplay + Math.random()}
                  className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-black mx-auto ${themeDisplay[theme]}`}
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

        {phase === "input" && (
          <div className="text-center">
            <p className={`text-sm mb-2 font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
              {reverse
                ? "Digite a sequência em ORDEM INVERSA:"
                : "Digite a sequência que você viu:"}
            </p>
            <p className={`text-xs mb-4 ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
              (sem espaços, ex: 4827)
            </p>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && userInput.length > 0 && handleSubmit()}
              maxLength={spanLength}
              autoFocus
              className={`w-full text-center text-3xl font-bold py-4 rounded-xl border-2 mb-4 outline-none focus:ring-2 ${
                theme === "GAMIFIED"
                  ? "bg-gray-700 border-cyan-500 text-cyan-400 focus:ring-cyan-500"
                  : theme === "COLORFUL"
                  ? "bg-white border-purple-400 text-purple-900 focus:ring-purple-500"
                  : "bg-white border-blue-300 text-gray-900 focus:ring-blue-500"
              }`}
              placeholder={("_ ".repeat(spanLength)).trim()}
            />
            <Button
              className={`w-full h-12 text-base ${themeBtn[theme]}`}
              onClick={handleSubmit}
              disabled={userInput.length === 0}
            >
              Confirmar
            </Button>
          </div>
        )}

        {phase === "feedback" && (
          <AnimatePresence>
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className={`text-6xl mb-4`}>{feedback === "correct" ? "✅" : "❌"}</div>
              <p className={`text-lg font-bold mb-2 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}>
                {feedback === "correct" ? "Correto!" : "Incorreto"}
              </p>
              <p className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                Sequência correta: {(reverse ? [...sequence].reverse() : sequence).join(" ")}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
