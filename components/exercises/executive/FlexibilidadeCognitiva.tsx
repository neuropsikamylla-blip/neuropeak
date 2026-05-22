"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface FlexibilidadeCognitivaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type Rule = "cor" | "forma";

interface Card {
  shape: "círculo" | "quadrado" | "triângulo" | "estrela";
  color: "vermelho" | "azul" | "verde" | "amarelo";
}

const SHAPES: Card["shape"][] = ["círculo", "quadrado", "triângulo", "estrela"];
const COLORS: Card["color"][] = ["vermelho", "azul", "verde", "amarelo"];
const COLOR_MAP: Record<Card["color"], string> = {
  vermelho: "#EF4444",
  azul: "#3B82F6",
  verde: "#22C55E",
  amarelo: "#EAB308",
};

const TOTAL_TRIALS = 20;
const SWITCH_EVERY = 5; // switch rule every 5 trials → 4 switches total

function generateCard(): Card {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function ShapeIcon({ shape, color, size = 40 }: { shape: Card["shape"]; color: string; size?: number }) {
  const s = size;
  const fill = color;
  switch (shape) {
    case "círculo":
      return <svg width={s} height={s}><circle cx={s/2} cy={s/2} r={s/2 - 2} fill={fill} /></svg>;
    case "quadrado":
      return <svg width={s} height={s}><rect x="2" y="2" width={s-4} height={s-4} fill={fill} /></svg>;
    case "triângulo":
      return <svg width={s} height={s}><polygon points={`${s/2},2 ${s-2},${s-2} 2,${s-2}`} fill={fill} /></svg>;
    case "estrela":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={fill} />
        </svg>
      );
  }
}

export function FlexibilidadeCognitiva({ difficulty, theme, onComplete }: FlexibilidadeCognitivaProps) {
  const reportProgress = useExerciseProgress();
  const [trial, setTrial] = useState(0);
  const [card] = useState<Card[]>(() => Array.from({ length: TOTAL_TRIALS }, generateCard));
  const [responses, setResponses] = useState<{ correct: boolean; rt: number; isSwitchTrial: boolean }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  const isSwitchTrial = trial > 0 && trial % SWITCH_EVERY === 0;
  const activeRule: Rule = Math.floor(trial / SWITCH_EVERY) % 2 === 0 ? "cor" : "forma";

  const handleAnswer = useCallback((value: string) => {
    if (feedback) return;
    const rt = Date.now() - trialStart.current;
    const currentCard = card[trial];
    const isCorrect = activeRule === "cor"
      ? value === currentCard.color
      : value === currentCard.shape;

    setFeedback(isCorrect ? "correct" : "incorrect");
    const newResponses = [...responses, { correct: isCorrect, rt, isSwitchTrial }];
    setResponses(newResponses);

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TOTAL_TRIALS) * 100));

    setTimeout(() => {
      setFeedback(null);
      if (nextTrial >= TOTAL_TRIALS) {
        const accuracy = newResponses.filter((r) => r.correct).length / TOTAL_TRIALS;
        const avgRT = newResponses.reduce((s, r) => s + r.rt, 0) / TOTAL_TRIALS;
        const switchErrors = newResponses.filter((r) => r.isSwitchTrial && !r.correct).length;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("flexibilidade-cognitiva", accuracy, avgRT, difficulty);
        onComplete({
          exerciseId: "flexibilidade-cognitiva",
          domain: "executive",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration,
          metadata: { total: TOTAL_TRIALS, switchErrors, accuracy },
        });
      } else {
        setTrial(nextTrial);
        trialStart.current = Date.now();
      }
    }, 500);
  }, [feedback, trial, card, activeRule, isSwitchTrial, responses, difficulty, onComplete, reportProgress]);

  const currentCard = card[trial];
  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-green-50 to-teal-50" : "bg-gray-50";

  const options = activeRule === "cor"
    ? COLORS.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1), color: COLOR_MAP[c] }))
    : SHAPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), shape: s }));

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>Flexibilidade Cognitiva</h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>{trial + 1}/{TOTAL_TRIALS}</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < responses.length
                  ? responses[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Rule display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRule}
            className={`text-center p-3 rounded-xl mb-4 border-2 ${
              isSwitchTrial
                ? "border-orange-500 bg-orange-50 animate-pulse"
                : theme === "GAMIFIED"
                ? "border-cyan-500/50 bg-gray-700"
                : "border-blue-200 bg-blue-50"
            }`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {isSwitchTrial && (
              <p className="text-orange-600 font-bold text-xs mb-1">MUDANÇA DE REGRA!</p>
            )}
            <p className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-700"}`}>
              Classifique por: <span className="uppercase">{activeRule}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Card display */}
        <div className={`flex items-center justify-center p-8 rounded-2xl mb-6 border-4 ${
          feedback === "correct" ? "border-green-500 bg-green-50"
          : feedback === "incorrect" ? "border-red-500 bg-red-50"
          : theme === "GAMIFIED" ? "border-gray-600 bg-gray-700"
          : "border-gray-200 bg-gray-50"
        }`}>
          <ShapeIcon
            shape={currentCard.shape}
            color={COLOR_MAP[currentCard.color]}
            size={80}
          />
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              disabled={!!feedback}
              className={`py-4 px-3 rounded-xl font-bold text-sm border-2 ${
                theme === "GAMIFIED"
                  ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
              style={activeRule === "cor" && "color" in opt ? { borderColor: opt.color, color: opt.color } : {}}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {"shape" in opt ? (
                <div className="flex items-center justify-center gap-2">
                  <ShapeIcon shape={opt.shape as Card["shape"]} color="#6B7280" size={20} />
                  {opt.label}
                </div>
              ) : opt.label}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4 text-sm">
          <span className="text-green-500">✓ {responses.filter((r) => r.correct).length}</span>
          <span className="text-red-500">✗ {responses.filter((r) => !r.correct).length}</span>
        </div>
      </div>
    </div>
  );
}
