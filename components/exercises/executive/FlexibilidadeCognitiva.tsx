"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
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
const COLOR_HEX: Record<Card["color"], string> = {
  vermelho: "#ef4444",
  azul: "#3b82f6",
  verde: "#22c55e",
  amarelo: "#eab308",
};

const TOTAL_TRIALS = 20;
const SWITCH_EVERY = 5;

function generateCard(): Card {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function ShapeIcon({ shape, fill, size = 40 }: { shape: Card["shape"]; fill: string; size?: number }) {
  const s = size;
  switch (shape) {
    case "círculo":
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={s/2} cy={s/2} r={s/2 - 2} fill={fill} /></svg>;
    case "quadrado":
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x="3" y="3" width={s-6} height={s-6} rx="3" fill={fill} /></svg>;
    case "triângulo":
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${s/2},3 ${s-3},${s-3} 3,${s-3}`} fill={fill} /></svg>;
    case "estrela":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={fill} />
        </svg>
      );
  }
}

function FlexTutorialColorStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = "azul";

  function handleClick(c: string) {
    if (selected) return;
    setSelected(c);
    if (c === correct) setTimeout(onDone, 600);
  }

  const colorOptions = COLORS.map((c) => ({ key: c, hex: COLOR_HEX[c] }));
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-center">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          theme === "GAMIFIED" ? "bg-rose-900/40 text-rose-300 border-rose-700/50" : "bg-rose-50 text-rose-700 border-rose-300"
        }`}>🎨 COR</span>
      </div>
      <div className={`flex items-center justify-center rounded-2xl border-4 border-gray-200`} style={{ height: 100 }}>
        <ShapeIcon shape="círculo" fill={COLOR_HEX["azul"]} size={70} />
      </div>
      <p className={`text-xs text-center ${subClass}`}>Qual é a COR? Toque no azul!</p>
      <div className="grid grid-cols-4 gap-2 w-full">
        {colorOptions.map((opt) => {
          const isCorrect = opt.key === correct;
          const isSelected = selected === opt.key;
          return (
            <motion.button
              key={opt.key}
              onClick={() => handleClick(opt.key)}
              disabled={!!selected}
              whileTap={{ scale: 0.88 }}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 ${
                isSelected && isCorrect ? "border-green-500 bg-green-50" :
                isSelected ? "border-red-400 bg-red-50" :
                "border-gray-200 bg-gray-50"
              }`}
              style={{ borderColor: (!selected) ? opt.hex : undefined, background: (!selected) ? `${opt.hex}18` : undefined }}
            >
              <div className="w-7 h-7 rounded-full" style={{ backgroundColor: opt.hex }} />
              <span className="text-[10px] font-bold" style={{ color: opt.hex }}>
                {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
              </span>
            </motion.button>
          );
        })}
      </div>
      {selected && selected !== correct && (
        <p className="text-xs text-orange-600">O círculo é azul! Toque em Azul.</p>
      )}
    </div>
  );
}

function FlexTutorialShapeStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = "quadrado";

  function handleClick(s: string) {
    if (selected) return;
    setSelected(s);
    if (s === correct) setTimeout(onDone, 600);
  }

  const shapeOptions = SHAPES.map((s) => ({ key: s }));
  const shapeColor = theme === "GAMIFIED" ? "#94a3b8" : "#64748b";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-center">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          theme === "GAMIFIED" ? "bg-blue-900/40 text-blue-300 border-blue-700/50" : "bg-blue-50 text-blue-700 border-blue-300"
        }`}>🔷 FORMA</span>
      </div>
      <div className={`flex items-center justify-center rounded-2xl border-4 border-gray-200`} style={{ height: 100 }}>
        <ShapeIcon shape="quadrado" fill={COLOR_HEX["vermelho"]} size={70} />
      </div>
      <p className={`text-xs text-center ${subClass}`}>Qual é a FORMA? Toque no quadrado!</p>
      <div className="grid grid-cols-4 gap-2 w-full">
        {shapeOptions.map((opt) => {
          const isCorrect = opt.key === correct;
          const isSelected = selected === opt.key;
          return (
            <motion.button
              key={opt.key}
              onClick={() => handleClick(opt.key)}
              disabled={!!selected}
              whileTap={{ scale: 0.88 }}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 ${
                isSelected && isCorrect ? "border-green-500 bg-green-50" :
                isSelected ? "border-red-400 bg-red-50" :
                theme === "GAMIFIED" ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <ShapeIcon shape={opt.key as Card["shape"]} fill={shapeColor} size={24} />
              <span className={`text-[10px] font-bold ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
              </span>
            </motion.button>
          );
        })}
      </div>
      {selected && selected !== correct && (
        <p className="text-xs text-orange-600">A figura é um quadrado! Toque em Quadrado.</p>
      )}
    </div>
  );
}

function FlexibilidadeTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Veja a regra no topo. Se for 🎨 COR, escolha a COR da figura.",
      content: (onStepDone: () => void) => <FlexTutorialColorStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Se a regra mudar para 🔷 FORMA, escolha a FORMA da figura.",
      content: (onStepDone: () => void) => <FlexTutorialShapeStep theme={theme} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Flexibilidade Cognitiva" steps={steps} onDone={onDone} />;
}

export function FlexibilidadeCognitiva({ difficulty, theme, onComplete }: FlexibilidadeCognitivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const [trial, setTrial] = useState(0);
  const [cards] = useState<Card[]>(() => Array.from({ length: TOTAL_TRIALS }, generateCard));
  const [responses, setResponses] = useState<{ correct: boolean; rt: number; isSwitchTrial: boolean }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  const isSwitchTrial = trial > 0 && trial % SWITCH_EVERY === 0;
  const activeRule: Rule = Math.floor(trial / SWITCH_EVERY) % 2 === 0 ? "cor" : "forma";

  const handleAnswer = useCallback((value: string) => {
    if (feedback) return;
    const rt = Date.now() - trialStart.current;
    const currentCard = cards[trial];
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
          score, accuracy,
          reactionTime: avgRT,
          difficulty, duration,
          metadata: { total: TOTAL_TRIALS, switchErrors, accuracy },
        });
      } else {
        setTrial(nextTrial);
        trialStart.current = Date.now();
      }
    }, 420);
  }, [feedback, trial, cards, activeRule, isSwitchTrial, responses, difficulty, onComplete, reportProgress]);

  if (showTutorial) {
    return <FlexibilidadeTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const currentCard = cards[trial];

  const bg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-emerald-50" :
    "bg-gray-50";

  const card =
    theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" :
    "bg-white shadow-lg";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-teal-700" :
    "text-gray-900";

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  // Rule badge
  const ruleLabel = activeRule === "cor" ? "COR" : "FORMA";
  const ruleIcon = activeRule === "cor" ? "🎨" : "🔷";
  const ruleBadgeBg =
    activeRule === "cor"
      ? theme === "GAMIFIED" ? "bg-rose-900/40 text-rose-300 border-rose-700/50" : "bg-rose-50 text-rose-700 border-rose-300"
      : theme === "GAMIFIED" ? "bg-blue-900/40 text-blue-300 border-blue-700/50" : "bg-blue-50 text-blue-700 border-blue-300";

  // Card feedback border
  const cardBorder =
    feedback === "correct" ? "border-green-500 shadow-green-200" :
    feedback === "incorrect" ? "border-red-400 shadow-red-200" :
    theme === "GAMIFIED" ? "border-gray-600" : "border-gray-200";

  // Answer options
  const colorOptions = COLORS.map((c) => ({ key: c, hex: COLOR_HEX[c] }));
  const shapeOptions = SHAPES.map((s) => ({ key: s }));

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-bold text-base ${titleClass}`}>🔀 Flexibilidade</h2>
          {/* Rule badge — transitions silently when rule changes */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeRule}
              className={`text-xs font-bold px-3 py-1 rounded-full border ${ruleBadgeBg}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {ruleIcon} {ruleLabel}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < responses.length
                ? responses[i].correct ? "bg-green-500" : "bg-red-400"
                : i === trial ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        {/* Shape card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trial}
            className={`flex items-center justify-center rounded-2xl mb-5 border-4 transition-colors shadow-lg ${cardBorder}`}
            style={{ height: 160 }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <ShapeIcon
              shape={currentCard.shape}
              fill={COLOR_HEX[currentCard.color]}
              size={88}
            />
          </motion.div>
        </AnimatePresence>

        {/* Answer buttons */}
        {activeRule === "cor" ? (
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((opt) => (
              <motion.button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={!!feedback}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 active:scale-90 transition-all"
                style={{
                  borderColor: opt.hex,
                  background: feedback ? "transparent" : `${opt.hex}18`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full shadow"
                  style={{ backgroundColor: opt.hex }}
                />
                <span className="text-[10px] font-bold" style={{ color: opt.hex }}>
                  {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {shapeOptions.map((opt) => {
              const shapeColor = theme === "GAMIFIED" ? "#94a3b8" : "#64748b";
              return (
                <motion.button
                  key={opt.key}
                  onClick={() => handleAnswer(opt.key)}
                  disabled={!!feedback}
                  whileTap={{ scale: 0.88 }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    theme === "GAMIFIED"
                      ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <ShapeIcon shape={opt.key as Card["shape"]} fill={shapeColor} size={28} />
                  <span className={`text-[10px] font-bold ${subClass}`}>
                    {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
