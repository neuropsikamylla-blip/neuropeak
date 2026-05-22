"use client";

import { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from "@/components/gamification/ScoreDisplay";
import { formatDuration, formatReactionTime } from "@/lib/utils";
import type { ExerciseResult, Theme } from "@/types";
import { CheckCircle2, XCircle, Clock, Target, Zap } from "lucide-react";

type Phase = "instructions" | "exercise" | "results";

const ProgressContext = createContext<(pct: number) => void>(() => {});
export const useExerciseProgress = () => useContext(ProgressContext);

interface ExerciseWrapperProps {
  title: string;
  instructions: string[];
  theme: Theme;
  difficulty?: number;
  children: (onComplete: (result: ExerciseResult) => void) => React.ReactNode;
  onFinish: (result: ExerciseResult) => void;
}

export function ExerciseWrapper({
  title,
  instructions,
  theme,
  difficulty,
  children,
  onFinish,
}: ExerciseWrapperProps) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);

  function handleComplete(r: ExerciseResult) {
    setSessionProgress(100);
    setResult(r);
    setPhase("results");
  }

  function handleFinish() {
    if (result) onFinish(result);
  }

  const themeStyles = {
    CLINICAL: {
      bg: "bg-gray-50 min-h-screen",
      card: "bg-white rounded-xl shadow-md border border-gray-100 p-8 max-w-2xl mx-auto",
      title: "text-gray-900 text-2xl font-semibold",
      text: "text-gray-700",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 min-h-screen",
      card: "bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 max-w-2xl mx-auto",
      title: "text-purple-700 text-3xl font-bold",
      text: "text-purple-900",
      btn: "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-bold",
    },
    GAMIFIED: {
      bg: "bg-gray-950 min-h-screen",
      card: "bg-gray-800 rounded-2xl border border-cyan-500/30 p-8 max-w-2xl mx-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]",
      title: "text-cyan-400 text-2xl font-black tracking-wider uppercase",
      text: "text-gray-200",
      btn: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold tracking-wide",
    },
  };

  const s = themeStyles[theme];

  return (
    <div className={`${s.bg} p-4 flex items-center justify-center`}>
      <AnimatePresence mode="wait">
        {phase === "instructions" && (
          <motion.div
            key="instructions"
            className={s.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <h1 className={`${s.title} mb-2`}>{title}</h1>
            <p className={`${s.text} text-sm mb-6 opacity-70`}>Leia as instruções antes de começar</p>

            <div className="space-y-3 mb-8">
              {instructions.map((inst, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${theme === "GAMIFIED" ? "bg-cyan-500 text-gray-900" : theme === "COLORFUL" ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}`}>
                    {i + 1}
                  </span>
                  <p className={`${s.text} text-sm leading-relaxed`}>{inst}</p>
                </div>
              ))}
            </div>

            <Button
              className={`w-full h-12 text-base ${s.btn}`}
              onClick={() => setPhase("exercise")}
            >
              {theme === "GAMIFIED" ? "INICIAR MISSÃO" : theme === "COLORFUL" ? "Vamos lá! 🚀" : "Iniciar Exercício"}
            </Button>
          </motion.div>
        )}

        {phase === "exercise" && (
          <motion.div
            key="exercise"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProgressContext.Provider value={setSessionProgress}>
              {children(handleComplete)}
            </ProgressContext.Provider>

            {difficulty !== undefined && (
              <div className={`fixed bottom-6 right-4 z-50 rounded-2xl px-4 py-3 min-w-[150px] shadow-lg ${
                theme === "GAMIFIED"
                  ? "bg-gray-800/95 border border-cyan-500/40 backdrop-blur-sm"
                  : theme === "COLORFUL"
                  ? "bg-white/95 border-2 border-purple-300 backdrop-blur-sm"
                  : "bg-white/95 border border-gray-200 backdrop-blur-sm shadow-md"
              }`}>
                <p className={`text-xs font-bold mb-0.5 ${
                  theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-800"
                }`}>
                  Nível {difficulty}
                </p>
                <p className={`text-xs mb-1.5 ${
                  theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Progresso {Math.round(sessionProgress)}%
                </p>
                <div className={`h-1.5 rounded-full ${theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-200"}`}>
                  <motion.div
                    className={`h-full rounded-full ${
                      theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-500"
                    }`}
                    animate={{ width: `${sessionProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {phase === "results" && result && (
          <motion.div
            key="results"
            className={s.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {result.accuracy >= 0.8 ? (
                  <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-3" />
                ) : result.accuracy >= 0.5 ? (
                  <Target className="w-16 h-16 mx-auto text-yellow-500 mb-3" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto text-red-500 mb-3" />
                )}
              </motion.div>

              <h2 className={`${s.title} mb-1`}>
                {result.accuracy >= 0.8
                  ? theme === "COLORFUL" ? "Incrível! 🎉" : "Excelente!"
                  : result.accuracy >= 0.5
                  ? theme === "COLORFUL" ? "Bom trabalho! 👍" : "Bom trabalho!"
                  : theme === "COLORFUL" ? "Continue tentando! 💪" : "Continue praticando!"}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className={`text-center p-4 rounded-xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
                <ScoreDisplay
                  score={result.score}
                  theme={theme === "CLINICAL" ? "clinical" : theme === "COLORFUL" ? "colorful" : "gamified"}
                  size="sm"
                />
                <p className={`${s.text} text-xs mt-1 opacity-70`}>Pontuação</p>
              </div>

              <div className={`text-center p-4 rounded-xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`text-2xl font-bold ${result.accuracy >= 0.8 ? "text-green-500" : result.accuracy >= 0.5 ? "text-yellow-500" : "text-red-500"}`}>
                  {Math.round(result.accuracy * 100)}%
                </div>
                <p className={`${s.text} text-xs mt-1 opacity-70`}>Precisão</p>
              </div>

              <div className={`text-center p-4 rounded-xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`text-2xl font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
                  <Clock className="w-5 h-5 inline mr-1" />
                  {formatDuration(result.duration)}
                </div>
                <p className={`${s.text} text-xs mt-1 opacity-70`}>Duração</p>
              </div>
            </div>

            {result.reactionTime && (
              <div className={`flex items-center justify-center gap-2 mb-6 p-3 rounded-lg ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-blue-50"}`}>
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className={`${s.text} text-sm`}>
                  Tempo de reação médio: <strong>{formatReactionTime(result.reactionTime)}</strong>
                </span>
              </div>
            )}

            <Button
              className={`w-full h-12 text-base ${s.btn}`}
              onClick={handleFinish}
            >
              {theme === "GAMIFIED" ? "SALVAR E CONTINUAR" : "Salvar e Continuar"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
