"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { average } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";

interface TempoReacaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type Phase = "waiting" | "ready" | "stimulus" | "tooEarly" | "result";

const TRIALS = 8;

export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastRT, setLastRT] = useState<number | null>(null);
  const [trial, setTrial] = useState(0);
  const stimulusTime = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(Date.now());

  const startTrial = useCallback(() => {
    setPhase("ready");
    // Random delay 1.5-4s
    const delay = 1500 + Math.random() * 2500;
    timeoutRef.current = setTimeout(() => {
      setPhase("stimulus");
      stimulusTime.current = Date.now();
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handlePress() {
    if (phase === "ready") {
      // Too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("tooEarly");
      return;
    }
    if (phase !== "stimulus") return;

    const rt = Date.now() - stimulusTime.current;
    setLastRT(rt);
    const newRTs = [...reactionTimes, rt];
    setReactionTimes(newRTs);
    setPhase("result");

    setTimeout(() => {
      if (trial + 1 >= TRIALS) {
        const avgRT = average(newRTs);
        const accuracy = 1 - Math.min(1, (avgRT - 150) / 1000);
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("tempo-reacao", Math.max(0, accuracy), avgRT, difficulty);
        onComplete({
          exerciseId: "tempo-reacao",
          domain: "processing",
          score,
          accuracy: Math.max(0, accuracy),
          reactionTime: avgRT,
          difficulty,
          duration,
          metadata: { trials: TRIALS, allRTs: newRTs, avgRT },
        });
      } else {
        setTrial((t) => t + 1);
        startTrial();
      }
    }, 800);
  }

  function handleTooEarlyNext() {
    setTrial((t) => t + 1);
    startTrial();
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-orange-50 to-red-50" : "bg-gray-50";

  const stimulusColors = {
    waiting: theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200",
    ready: theme === "GAMIFIED" ? "bg-yellow-900/50 border-yellow-500" : "bg-yellow-100 border-yellow-400",
    stimulus: theme === "GAMIFIED" ? "bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]" : "bg-green-400",
    tooEarly: theme === "GAMIFIED" ? "bg-red-900/50" : "bg-red-100",
    result: theme === "GAMIFIED" ? "bg-blue-900/50" : "bg-blue-50",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-8 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
            Tempo de Reação
          </h2>
          <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {trial + 1}/{TRIALS}
          </span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {reactionTimes.map((rt, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${rt < 300 ? "bg-green-500" : rt < 500 ? "bg-blue-500" : "bg-orange-400"}`} />
          ))}
          {Array.from({ length: TRIALS - reactionTimes.length }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`} />
          ))}
        </div>

        {phase === "waiting" && (
          <div className="text-center">
            <p className={`mb-6 text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-600"}`}>
              Toque no círculo quando ele ficar VERDE
            </p>
            <div
              className={`w-48 h-48 rounded-full mx-auto flex items-center justify-center cursor-pointer transition-all ${stimulusColors.waiting}`}
              onClick={startTrial}
            >
              <p className={`font-bold ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                Toque para começar
              </p>
            </div>
          </div>
        )}

        {(phase === "ready" || phase === "stimulus" || phase === "tooEarly" || phase === "result") && (
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                className={`w-48 h-48 rounded-full mx-auto flex items-center justify-center cursor-pointer border-4 transition-colors select-none ${stimulusColors[phase]}`}
                onClick={handlePress}
                whileTap={{ scale: 0.95 }}
                animate={phase === "stimulus" ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {phase === "ready" && (
                  <motion.p
                    className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-yellow-400" : "text-yellow-700"}`}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    Aguarde...
                  </motion.p>
                )}
                {phase === "stimulus" && (
                  <p className="font-black text-2xl text-white">AGORA!</p>
                )}
                {phase === "tooEarly" && (
                  <p className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-600"}`}>
                    Cedo demais!
                  </p>
                )}
                {phase === "result" && lastRT && (
                  <div>
                    <p className={`text-3xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
                      {lastRT}ms
                    </p>
                    <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                      {lastRT < 250 ? "Incrível!" : lastRT < 350 ? "Muito bom!" : lastRT < 500 ? "Bom!" : "Continue!"}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {phase === "tooEarly" && (
              <button
                className={`mt-4 text-sm underline ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}
                onClick={handleTooEarlyNext}
              >
                Tentar novamente
              </button>
            )}

            {reactionTimes.length > 0 && (
              <p className={`mt-4 text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
                Média: {Math.round(average(reactionTimes))}ms
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
