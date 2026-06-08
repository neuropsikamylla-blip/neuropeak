"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from "@/components/gamification/ScoreDisplay";
import { formatDuration, formatReactionTime } from "@/lib/utils";
import { EXERCISE_FUNCTIONAL } from "@/lib/exercise-functional";
import type { ExerciseResult, Theme } from "@/types";
import { CheckCircle2, XCircle, Clock, Target, Zap, Lightbulb, Maximize2, Minimize2 } from "lucide-react";

type Phase = "instructions" | "exercise" | "results";

const ProgressContext = createContext<(pct: number) => void>(() => {});
export const useExerciseProgress = () => useContext(ProgressContext);

interface ExerciseWrapperProps {
  title: string;
  instructions: string[];
  theme: Theme;
  difficulty?: number;
  exerciseId?: string;
  children: (onComplete: (result: ExerciseResult) => void) => React.ReactNode;
  onFinish: (result: ExerciseResult) => void;
}

export function ExerciseWrapper({
  title,
  instructions,
  theme,
  difficulty,
  exerciseId,
  children,
  onFinish,
}: ExerciseWrapperProps) {
  const [phase, setPhase] = useState<Phase>(instructions.length === 0 ? "exercise" : "instructions");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const functional = exerciseId ? EXERCISE_FUNCTIONAL[exerciseId] : undefined;

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
      bg: "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen",
      card: "bg-white rounded-2xl shadow-md border border-slate-200/70 p-8 max-w-2xl mx-auto",
      title: "text-slate-800 text-2xl font-bold tracking-tight",
      text: "text-slate-600",
      btn: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-teal-50 via-white to-cyan-50 min-h-screen",
      card: "bg-white rounded-3xl shadow-xl border-2 border-teal-300 p-8 max-w-2xl mx-auto",
      title: "text-teal-800 text-3xl font-bold",
      text: "text-gray-800",
      btn: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full text-lg font-bold",
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
    <div className={`${s.bg} p-4 flex items-center justify-center relative overflow-hidden`}>
      {/* Cérebro discreto de fundo (decorativo) */}
      <div aria-hidden className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: "min(80vw, 540px)", lineHeight: 1, opacity: 0.045, filter: "blur(0.5px)" }}>🧠</span>
      </div>
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
            <p className={`${s.text} text-sm mb-4 opacity-70`}>Leia as instruções antes de começar</p>

            {functional && (
              <div className={`rounded-xl p-4 mb-5 ${theme === "GAMIFIED" ? "bg-cyan-900/30 border border-cyan-500/20" : theme === "COLORFUL" ? "bg-teal-50 border border-teal-200" : "bg-indigo-50/60 border border-indigo-100"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-teal-600" : "text-indigo-600"}`}>
                  Para que serve no dia a dia
                </p>
                <p className={`text-sm leading-relaxed ${s.text}`}>{functional.scenario}</p>
              </div>
            )}

            <div className="space-y-3 mb-5">
              {instructions.map((inst, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${theme === "GAMIFIED" ? "bg-cyan-500 text-gray-900" : theme === "COLORFUL" ? "bg-teal-500 text-white" : "bg-indigo-500 text-white"}`}>
                    {i + 1}
                  </span>
                  <p className={`${s.text} text-sm leading-relaxed`}>{inst}</p>
                </div>
              ))}
            </div>

            {functional && (
              <div className={`rounded-xl p-4 mb-5 ${theme === "GAMIFIED" ? "bg-gray-700/50" : theme === "COLORFUL" ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-100"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${theme === "GAMIFIED" ? "text-yellow-400" : theme === "COLORFUL" ? "text-yellow-700" : "text-gray-600"}`}>
                  Estratégias
                </p>
                <ul className="space-y-1.5">
                  {functional.strategies.map((s_item, i) => (
                    <li key={i} className={`text-xs leading-relaxed flex gap-2 ${s.text}`}>
                      <span className="mt-0.5 shrink-0">•</span>
                      {s_item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              className={`w-full h-12 text-base ${s.btn}`}
              onClick={() => setPhase("exercise")}
            >
              {theme === "GAMIFIED" ? "INICIAR MISSÃO" : theme === "COLORFUL" ? "Vamos lá! 🚀" : "Iniciar"}
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

            {/* Fullscreen toggle button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              className="fixed top-4 right-4 z-[60] p-2.5 rounded-xl transition-opacity"
              style={{
                background: theme === "GAMIFIED"
                  ? "rgba(17,24,39,0.85)"
                  : "rgba(255,255,255,0.85)",
                border: theme === "GAMIFIED"
                  ? "1px solid rgba(6,182,212,0.35)"
                  : "1px solid rgba(0,0,0,0.12)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              }}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen
                ? <Minimize2 className={`w-4 h-4 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-600"}`} />
                : <Maximize2 className={`w-4 h-4 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-600"}`} />
              }
            </button>

            {difficulty !== undefined && (
              <div className={`fixed bottom-6 left-4 z-50 pointer-events-none rounded-2xl px-4 py-3 min-w-[150px] shadow-lg ${
                theme === "GAMIFIED"
                  ? "bg-gray-800/95 border border-cyan-500/40 backdrop-blur-sm"
                  : theme === "COLORFUL"
                  ? "bg-white/95 border-2 border-teal-300 backdrop-blur-sm"
                  : "bg-white/95 border border-gray-200 backdrop-blur-sm shadow-md"
              }`}>
                <p className={`text-xs font-bold mb-1 flex items-center justify-between gap-2 ${
                  theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-teal-700" : "text-gray-800"
                }`}>
                  <span>Progresso da sessão</span>
                  <span className="tabular-nums">{Math.round(sessionProgress)}%</span>
                </p>
                <div className={`h-1.5 rounded-full ${theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-200"}`}>
                  <motion.div
                    className={`h-full rounded-full ${
                      theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-teal-500" : "bg-blue-500"
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
              <div className={`flex items-center justify-center gap-2 mb-4 p-3 rounded-lg ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-blue-50"}`}>
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className={`${s.text} text-sm`}>
                  Tempo de reação médio: <strong>{formatReactionTime(result.reactionTime)}</strong>
                </span>
              </div>
            )}

            {functional && (
              <div className={`rounded-xl p-4 mb-6 ${theme === "GAMIFIED" ? "bg-cyan-900/30 border border-cyan-500/20" : theme === "COLORFUL" ? "bg-green-50 border border-green-200" : "bg-green-50 border border-green-100"}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-green-600"}`} />
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-green-700"}`}>
                      Leve para o seu dia
                    </p>
                    <p className={`text-sm leading-relaxed ${s.text}`}>{functional.dailyTip}</p>
                  </div>
                </div>
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
