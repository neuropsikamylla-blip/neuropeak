"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

interface GameObj {
  emoji: string;
  label: string;
  isFood: boolean;
  portable: boolean;
  warmColor: boolean;
}

const OBJECTS: GameObj[] = [
  { emoji: "🍎", label: "Maçã",       isFood: true,  portable: true,  warmColor: true  },
  { emoji: "🚌", label: "Ônibus",     isFood: false, portable: false, warmColor: false },
  { emoji: "💊", label: "Comprimido", isFood: false, portable: true,  warmColor: false },
  { emoji: "🥑", label: "Abacate",    isFood: true,  portable: true,  warmColor: false },
  { emoji: "🧴", label: "Loção",      isFood: false, portable: true,  warmColor: false },
  { emoji: "🍌", label: "Banana",     isFood: true,  portable: true,  warmColor: true  },
  { emoji: "🛒", label: "Carrinho",   isFood: false, portable: false, warmColor: false },
  { emoji: "🍞", label: "Pão",        isFood: true,  portable: true,  warmColor: true  },
  { emoji: "📺", label: "Televisão",  isFood: false, portable: false, warmColor: false },
  { emoji: "🥕", label: "Cenoura",    isFood: true,  portable: true,  warmColor: true  },
  { emoji: "🔑", label: "Chave",      isFood: false, portable: true,  warmColor: true  },
  { emoji: "🍊", label: "Laranja",    isFood: true,  portable: true,  warmColor: true  },
  { emoji: "🪑", label: "Cadeira",    isFood: false, portable: false, warmColor: false },
  { emoji: "🍇", label: "Uva",        isFood: true,  portable: true,  warmColor: false },
  { emoji: "👓", label: "Óculos",     isFood: false, portable: true,  warmColor: false },
  { emoji: "🍋", label: "Limão",      isFood: true,  portable: true,  warmColor: true  },
  { emoji: "🏠", label: "Casa",       isFood: false, portable: false, warmColor: false },
  { emoji: "🍒", label: "Cereja",     isFood: true,  portable: true,  warmColor: true  },
  { emoji: "💼", label: "Maleta",     isFood: false, portable: true,  warmColor: false },
  { emoji: "🍉", label: "Melancia",   isFood: true,  portable: false, warmColor: true  },
  { emoji: "🚪", label: "Porta",      isFood: false, portable: false, warmColor: false },
  { emoji: "🫐", label: "Mirtilo",    isFood: true,  portable: true,  warmColor: false },
  { emoji: "🧲", label: "Ímã",        isFood: false, portable: true,  warmColor: false },
  { emoji: "🍓", label: "Morango",    isFood: true,  portable: true,  warmColor: true  },
];

const TOTAL_TRIALS = 24;
const SWITCH_EVERY = 8;

type RuleName = "alimento" | "portátil" | "cor quente";

const RULE_NAMES: RuleName[] = ["alimento", "portátil", "cor quente"];
const RULE_LABELS: Record<RuleName, string> = {
  alimento: "É ALIMENTO?",
  "portátil": "CABE NO BOLSO?",
  "cor quente": "COR QUENTE?",
};
const RULE_ICONS: Record<RuleName, string> = {
  alimento: "🍽️",
  "portátil": "👝",
  "cor quente": "🔆",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSequence(): GameObj[] {
  const block0 = shuffle(OBJECTS).slice(0, SWITCH_EVERY);
  const block1 = shuffle(OBJECTS).slice(0, SWITCH_EVERY);
  const block2 = shuffle(OBJECTS).slice(0, SWITCH_EVERY);
  return [...block0, ...block1, ...block2];
}

function getCorrectAnswer(obj: GameObj, rule: RuleName): boolean {
  if (rule === "alimento") return obj.isFood;
  if (rule === "portátil") return obj.portable;
  return obj.warmColor;
}

function getRuleIndex(trial: number): number {
  return Math.floor(trial / SWITCH_EVERY) % 3;
}

function getRuleName(trial: number): RuleName {
  return RULE_NAMES[getRuleIndex(trial)];
}

function TutorialFoodStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [answered, setAnswered] = useState(false);

  function handleClick(answer: boolean) {
    if (answered) return;
    if (answer === true) {
      setAnswered(true);
      setTimeout(onDone, 500);
    }
  }

  const btnBase = "flex-1 h-14 rounded-2xl font-bold text-lg border-2 transition-all";
  const simBtnClass =
    theme === "GAMIFIED"
      ? `${btnBase} border-green-500 bg-green-900/40 text-green-300`
      : `${btnBase} border-green-500 bg-green-50 text-green-700`;
  const naoBtnClass =
    theme === "GAMIFIED"
      ? `${btnBase} border-red-500 bg-red-900/30 text-red-300`
      : `${btnBase} border-red-400 bg-red-50 text-red-600`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full flex justify-center items-center rounded-2xl py-6 border-2 ${
        theme === "GAMIFIED" ? "border-gray-600 bg-gray-700/40" : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 72 }}>🍎</span>
          <span className={`font-bold text-base ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>Maçã</span>
        </div>
      </div>
      <p className={`text-sm text-center font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
        Regra: <strong>É ALIMENTO?</strong> — Maçã é alimento. Toque em ✅ SIM!
      </p>
      <div className="flex gap-3 w-full">
        <motion.button whileTap={{ scale: 0.92 }} className={simBtnClass} onClick={() => handleClick(true)}>
          ✅ SIM
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} className={naoBtnClass} onClick={() => handleClick(false)}>
          ❌ NÃO
        </motion.button>
      </div>
      {answered && (
        <p className="text-green-600 text-sm font-bold">Correto!</p>
      )}
    </div>
  );
}

function TutorialPortableStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [answered, setAnswered] = useState(false);

  function handleClick(answer: boolean) {
    if (answered) return;
    if (answer === false) {
      setAnswered(true);
      setTimeout(onDone, 500);
    }
  }

  const btnBase = "flex-1 h-14 rounded-2xl font-bold text-lg border-2 transition-all";
  const simBtnClass =
    theme === "GAMIFIED"
      ? `${btnBase} border-green-500 bg-green-900/40 text-green-300`
      : `${btnBase} border-green-500 bg-green-50 text-green-700`;
  const naoBtnClass =
    theme === "GAMIFIED"
      ? `${btnBase} border-red-500 bg-red-900/30 text-red-300`
      : `${btnBase} border-red-400 bg-red-50 text-red-600`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full flex justify-center items-center rounded-2xl py-6 border-2 ${
        theme === "GAMIFIED" ? "border-gray-600 bg-gray-700/40" : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 72 }}>📺</span>
          <span className={`font-bold text-base ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>Televisão</span>
        </div>
      </div>
      <p className={`text-sm text-center font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
        Regra mudou: <strong>CABE NO BOLSO?</strong> — Televisão não cabe no bolso. Toque em ❌ NÃO!
      </p>
      <div className="flex gap-3 w-full">
        <motion.button whileTap={{ scale: 0.92 }} className={simBtnClass} onClick={() => handleClick(true)}>
          ✅ SIM
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} className={naoBtnClass} onClick={() => handleClick(false)}>
          ❌ NÃO
        </motion.button>
      </div>
      {answered && (
        <p className="text-green-600 text-sm font-bold">Correto!</p>
      )}
    </div>
  );
}

function FlexibilidadeTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Veja a regra no topo do card. Se for 🍽️ É ALIMENTO?, responda SIM ou NÃO.",
      content: (onStepDone: () => void) => <TutorialFoodStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "A regra pode mudar! Preste atenção no badge no topo e adapte suas respostas.",
      content: (onStepDone: () => void) => <TutorialPortableStep theme={theme} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Triagem" steps={steps} onDone={onDone} />;
}

export function FlexibilidadeCognitiva({ difficulty, theme, onComplete }: FlexibilidadeCognitivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [sequence] = useState<GameObj[]>(() => buildSequence());
  const [trial, setTrial] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; rt: number; isSwitchTrial: boolean }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showRuleSwitch, setShowRuleSwitch] = useState(false);

  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  const currentRule = getRuleName(trial);
  const isSwitchTrial = trial > 0 && trial % SWITCH_EVERY === 0;
  const showSwitchOverlay = difficulty <= 5;

  useEffect(() => {
    if (showTutorial) return;
    trialStart.current = Date.now();
  }, [trial, showTutorial]);

  useEffect(() => {
    if (!showTutorial) {
      startTime.current = Date.now();
      trialStart.current = Date.now();
    }
  }, [showTutorial]);

  const handleAnswer = useCallback((answer: boolean) => {
    if (feedback || showRuleSwitch) return;
    const rt = Date.now() - trialStart.current;
    const obj = sequence[trial];
    const isCorrect = getCorrectAnswer(obj, currentRule) === answer;

    setFeedback(isCorrect ? "correct" : "incorrect");

    const newResponses = isCorrect
      ? [...responses, { correct: isCorrect, rt, isSwitchTrial }]
      : [...responses, { correct: false, rt, isSwitchTrial }];

    const delay = isCorrect ? 300 : 400;

    setTimeout(() => {
      setFeedback(null);

      if (!isCorrect) {
        trialStart.current = Date.now();
        setResponses(newResponses);
        return;
      }

      const nextTrial = trial + 1;
      reportProgress(Math.round((nextTrial / TOTAL_TRIALS) * 100));

      if (nextTrial >= TOTAL_TRIALS) {
        const accuracy = newResponses.filter((r) => r.correct).length / TOTAL_TRIALS;
        const avgRT = newResponses.reduce((s, r) => s + r.rt, 0) / newResponses.length;
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
        return;
      }

      const nextIsSwitch = nextTrial > 0 && nextTrial % SWITCH_EVERY === 0;

      if (nextIsSwitch && showSwitchOverlay) {
        setResponses(newResponses);
        setTrial(nextTrial);
        setShowRuleSwitch(true);
        setTimeout(() => {
          setShowRuleSwitch(false);
          trialStart.current = Date.now();
        }, 800);
      } else {
        setResponses(newResponses);
        setTrial(nextTrial);
        trialStart.current = Date.now();
      }
    }, delay);
  }, [feedback, showRuleSwitch, trial, sequence, currentRule, isSwitchTrial, responses, difficulty, showSwitchOverlay, onComplete, reportProgress]);

  if (showTutorial) {
    return <FlexibilidadeTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const obj = sequence[trial];
  const nextRule = trial % SWITCH_EVERY === 0 && trial > 0 ? getRuleName(trial) : currentRule;

  const bg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-emerald-50" :
    "bg-gray-50";

  const cardClass =
    theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)]" :
    theme === "COLORFUL" ? "bg-white shadow-xl border-2 border-teal-200" :
    "bg-white shadow-lg border border-gray-100";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-teal-700" :
    "text-gray-900";

  const ruleBadgeClass =
    theme === "GAMIFIED"
      ? "bg-cyan-900/40 text-cyan-300 border-cyan-700/50"
      : theme === "COLORFUL"
      ? "bg-teal-50 text-teal-700 border-teal-300"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const cardBorder =
    feedback === "correct" ? "border-green-500 shadow-green-200" :
    feedback === "incorrect" ? "border-red-400 shadow-red-200" :
    theme === "GAMIFIED" ? "border-gray-600" : "border-gray-200";

  const simBtnClass =
    theme === "GAMIFIED"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-green-500 bg-green-900/40 text-green-300 active:scale-95 transition-all disabled:opacity-40"
      : theme === "COLORFUL"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-green-500 bg-green-50 text-green-700 active:scale-95 transition-all disabled:opacity-40"
      : "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-green-500 bg-green-50 text-green-700 active:scale-95 transition-all disabled:opacity-40";

  const naoBtnClass =
    theme === "GAMIFIED"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-red-500 bg-red-900/30 text-red-300 active:scale-95 transition-all disabled:opacity-40"
      : theme === "COLORFUL"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-red-400 bg-red-50 text-red-600 active:scale-95 transition-all disabled:opacity-40"
      : "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-red-400 bg-red-50 text-red-600 active:scale-95 transition-all disabled:opacity-40";

  const progressEmpty =
    theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${cardClass}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-bold text-base ${titleClass}`}>🔄 Triagem</h2>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentRule}
              className={`text-xs font-bold px-3 py-1 rounded-full border ${ruleBadgeClass}`}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {RULE_ICONS[currentRule]} {RULE_LABELS[currentRule]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < responses.length
                  ? responses[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial ? "bg-blue-400 animate-pulse"
                  : progressEmpty
              }`}
            />
          ))}
        </div>

        {/* Object card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={trial}
              className={`flex flex-col items-center justify-center rounded-2xl mb-5 border-4 transition-colors shadow-md ${cardBorder}`}
              style={{ minHeight: 180 }}
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span style={{ fontSize: 96, lineHeight: 1.1 }}>{obj.emoji}</span>
              <span className={`mt-2 font-bold text-lg ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                {obj.label}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Rule switch overlay (difficulty ≤ 5 only) */}
          <AnimatePresence>
            {showRuleSwitch && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-20"
                style={{
                  background:
                    theme === "GAMIFIED"
                      ? "rgba(6,18,40,0.93)"
                      : "rgba(255,255,255,0.95)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="text-4xl mb-2"
                >
                  🔄
                </motion.div>
                <p className={`font-black text-sm uppercase tracking-widest ${theme === "GAMIFIED" ? "text-cyan-400" : "text-teal-700"}`}>
                  NOVA REGRA
                </p>
                <p className={`font-bold text-base mt-1 ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
                  {RULE_ICONS[nextRule]} {RULE_LABELS[nextRule]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feedback indicator */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              className={`text-center text-2xl font-black mb-2 ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {feedback === "correct" ? "✓" : "✗"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback || showRuleSwitch}
            className={simBtnClass}
            onClick={() => handleAnswer(true)}
          >
            ✅ SIM
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback || showRuleSwitch}
            className={naoBtnClass}
            onClick={() => handleAnswer(false)}
          >
            ❌ NÃO
          </motion.button>
        </div>
      </div>
    </div>
  );
}
