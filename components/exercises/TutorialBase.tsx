"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@/types";

interface TutorialStep {
  instruction: string;
  content: (onStepDone: () => void) => React.ReactNode;
}

interface TutorialBaseProps {
  theme: Theme;
  title: string;
  steps: TutorialStep[];
  onDone: () => void;
}

export function TutorialBase({ theme, title, steps, onDone }: TutorialBaseProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [stepDone, setStepDone] = useState(false);

  function handleStepDone() {
    setStepDone(true);
  }

  function advance() {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
      setStepDone(false);
    } else {
      onDone();
    }
  }

  const step = steps[stepIdx];
  const isLastStep = stepIdx === steps.length - 1;

  const bg = {
    CLINICAL: "bg-gray-50 min-h-screen",
    COLORFUL: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 min-h-screen",
    GAMIFIED: "bg-gray-950 min-h-screen",
  }[theme];

  const card = {
    CLINICAL: "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md w-full",
    COLORFUL: "bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-6 max-w-md w-full",
    GAMIFIED: "bg-gray-800 rounded-2xl border border-cyan-500/30 p-6 max-w-md w-full shadow-[0_0_30px_rgba(6,182,212,0.1)]",
  }[theme];

  const titleClass = {
    CLINICAL: "text-gray-900 text-lg font-bold",
    COLORFUL: "text-purple-700 text-xl font-bold",
    GAMIFIED: "text-cyan-400 text-lg font-black tracking-wide uppercase",
  }[theme];

  const instructionClass = {
    CLINICAL: "text-gray-700 text-sm",
    COLORFUL: "text-purple-900 text-sm",
    GAMIFIED: "text-gray-200 text-sm",
  }[theme];

  const subClass = {
    CLINICAL: "text-gray-400",
    COLORFUL: "text-purple-400",
    GAMIFIED: "text-gray-500",
  }[theme];

  const btn = {
    CLINICAL: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 w-full font-bold text-base transition-colors",
    COLORFUL: "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-11 w-full font-bold text-base",
    GAMIFIED: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl h-11 w-full font-bold tracking-wide",
  }[theme];

  const dotActive = {
    CLINICAL: "bg-blue-500",
    COLORFUL: "bg-purple-500",
    GAMIFIED: "bg-cyan-500",
  }[theme];

  return (
    <div className={`${bg} flex items-center justify-center p-4`}>
      <div className={card}>
        {/* Title */}
        <div className="mb-4">
          <p className={`text-xs mb-1 ${subClass}`}>Tutorial</p>
          <h2 className={titleClass}>Como jogar: {title}</h2>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= stepIdx
                  ? dotActive
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step instruction */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`rounded-xl p-3 mb-4 ${
              theme === "GAMIFIED" ? "bg-gray-700/60" : "bg-gray-50"
            }`}>
              <p className={`${instructionClass} font-medium`}>{step.instruction}</p>
            </div>

            {/* Step content */}
            <div className="mb-5">
              {step.content(handleStepDone)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Advance button */}
        <AnimatePresence>
          {stepDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <button onClick={advance} className={btn}>
                {isLastStep ? "Começar! 🚀" : "Próximo →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
