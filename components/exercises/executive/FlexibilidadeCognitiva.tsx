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
  isAnimal: boolean;
  isFood: boolean;
  fitsBackpack: boolean;
}

const OBJECTS: GameObj[] = [
  { emoji: "🐕", label: "Cachorro",  isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "🍎", label: "Maçã",      isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🚌", label: "Ônibus",    isAnimal: false, isFood: false, fitsBackpack: false },
  { emoji: "🐦", label: "Pássaro",   isAnimal: true,  isFood: false, fitsBackpack: true  },
  { emoji: "💻", label: "Notebook",  isAnimal: false, isFood: false, fitsBackpack: true  },
  { emoji: "🍌", label: "Banana",    isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🏠", label: "Casa",      isAnimal: false, isFood: false, fitsBackpack: false },
  { emoji: "🐟", label: "Peixe",     isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "🥕", label: "Cenoura",   isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🐘", label: "Elefante",  isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "📱", label: "Celular",   isAnimal: false, isFood: false, fitsBackpack: true  },
  { emoji: "🍕", label: "Pizza",     isAnimal: false, isFood: true,  fitsBackpack: false },
  { emoji: "🐈", label: "Gato",      isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "✈️", label: "Avião",     isAnimal: false, isFood: false, fitsBackpack: false },
  { emoji: "🥦", label: "Brócolis",  isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🦁", label: "Leão",      isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "⚽",  label: "Bola",      isAnimal: false, isFood: false, fitsBackpack: true  },
  { emoji: "🍓", label: "Morango",   isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🐇", label: "Coelho",    isAnimal: true,  isFood: false, fitsBackpack: true  },
  { emoji: "📚", label: "Livros",    isAnimal: false, isFood: false, fitsBackpack: true  },
  { emoji: "🐮", label: "Vaca",      isAnimal: true,  isFood: false, fitsBackpack: false },
  { emoji: "🍊", label: "Laranja",   isAnimal: false, isFood: true,  fitsBackpack: true  },
  { emoji: "🚗", label: "Carro",     isAnimal: false, isFood: false, fitsBackpack: false },
  { emoji: "🦋", label: "Borboleta", isAnimal: true,  isFood: false, fitsBackpack: true  },
];

const TOTAL_TRIALS = 24;
const SWITCH_EVERY = 8;

type RuleName = "animal" | "comida" | "mochila";

const RULE_NAMES: RuleName[] = ["animal", "comida", "mochila"];
const RULE_LABELS: Record<RuleName, string> = {
  animal:  "É UM ANIMAL?",
  comida:  "É COMIDA?",
  mochila: "CABE NA MOCHILA?",
};
const RULE_ICONS: Record<RuleName, string> = {
  animal:  "🐾",
  comida:  "🍽️",
  mochila: "🎒",
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
  return [
    ...shuffle(OBJECTS).slice(0, SWITCH_EVERY),
    ...shuffle(OBJECTS).slice(0, SWITCH_EVERY),
    ...shuffle(OBJECTS).slice(0, SWITCH_EVERY),
  ];
}

function getCorrectAnswer(obj: GameObj, rule: RuleName): boolean {
  if (rule === "animal") return obj.isAnimal;
  if (rule === "comida") return obj.isFood;
  return obj.fitsBackpack;
}

function getRuleName(trial: number): RuleName {
  return RULE_NAMES[Math.floor(trial / SWITCH_EVERY) % 3];
}

function getTrialMs(difficulty: number): number {
  if (difficulty <= 2) return 5000;
  if (difficulty <= 4) return 4000;
  if (difficulty <= 6) return 3000;
  if (difficulty <= 8) return 2200;
  return 1500;
}

// ── Shared button primitives ──────────────────────────────────────────────────

function BtnSIM({ theme, onClick, disabled }: { theme: Theme; onClick: () => void; disabled?: boolean }) {
  const cls =
    theme === "GAMIFIED"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-green-500 bg-green-900/40 text-green-300 active:scale-95 transition-all disabled:opacity-30"
      : "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-green-500 bg-green-50 text-green-700 active:scale-95 transition-all disabled:opacity-30";
  return (
    <button className={cls} disabled={disabled} onPointerDown={(e) => { e.preventDefault(); onClick(); }}>
      ✅ SIM
    </button>
  );
}

function BtnNAO({ theme, onClick, disabled }: { theme: Theme; onClick: () => void; disabled?: boolean }) {
  const cls =
    theme === "GAMIFIED"
      ? "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-red-500 bg-red-900/30 text-red-300 active:scale-95 transition-all disabled:opacity-30"
      : "flex-1 h-16 rounded-2xl font-bold text-xl border-2 border-red-400 bg-red-50 text-red-600 active:scale-95 transition-all disabled:opacity-30";
  return (
    <button className={cls} disabled={disabled} onPointerDown={(e) => { e.preventDefault(); onClick(); }}>
      ❌ NÃO
    </button>
  );
}

// ── Tutorial steps ────────────────────────────────────────────────────────────

function TutorialAnimalStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [answered, setAnswered] = useState(false);
  const done = useRef(false);

  function handleSIM() {
    if (done.current) return;
    done.current = true;
    setAnswered(true);
    setTimeout(onDone, 500);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full flex justify-center items-center rounded-2xl py-6 border-2 ${
        theme === "GAMIFIED" ? "border-gray-600 bg-gray-700/40" : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 72 }}>🐕</span>
          <span className={`font-bold text-base ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
            Cachorro
          </span>
        </div>
      </div>
      <p className={`text-sm text-center font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
        Regra: <strong>É UM ANIMAL?</strong> — Cachorro é um animal. Toque em ✅ SIM!
      </p>
      <div className="flex gap-3 w-full">
        <BtnSIM theme={theme} onClick={handleSIM} />
        <BtnNAO theme={theme} onClick={() => {}} />
      </div>
      {answered && <p className="text-green-600 text-sm font-bold text-center">Correto!</p>}
    </div>
  );
}

function TutorialBackpackStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [answered, setAnswered] = useState(false);
  const done = useRef(false);

  function handleNAO() {
    if (done.current) return;
    done.current = true;
    setAnswered(true);
    setTimeout(onDone, 500);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full flex justify-center items-center rounded-2xl py-6 border-2 ${
        theme === "GAMIFIED" ? "border-gray-600 bg-gray-700/40" : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 72 }}>🚌</span>
          <span className={`font-bold text-base ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
            Ônibus
          </span>
        </div>
      </div>
      <p className={`text-sm text-center font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
        Regra mudou: <strong>CABE NA MOCHILA?</strong> — Ônibus não cabe. Toque em ❌ NÃO!
      </p>
      <div className="flex gap-3 w-full">
        <BtnSIM theme={theme} onClick={() => {}} />
        <BtnNAO theme={theme} onClick={handleNAO} />
      </div>
      {answered && <p className="text-green-600 text-sm font-bold text-center">Correto!</p>}
    </div>
  );
}

function FlexibilidadeTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Veja a regra em destaque. Se 🐾 É UM ANIMAL?, responda SIM ou NÃO.",
      content: (onStepDone: () => void) => <TutorialAnimalStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "A regra pode mudar! Leia com atenção e responda o mais rápido possível.",
      content: (onStepDone: () => void) => <TutorialBackpackStep theme={theme} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Triagem Rápida" steps={steps} onDone={onDone} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function FlexibilidadeCognitiva({ difficulty, theme, onComplete }: FlexibilidadeCognitivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [sequence] = useState<GameObj[]>(() => buildSequence());
  const [trial, setTrial] = useState(0);
  const [responses, setResponses] = useState<{ correct: boolean; rt: number; isSwitchTrial: boolean }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "timeout" | null>(null);
  const [showRuleSwitch, setShowRuleSwitch] = useState(false);
  const [timerProgress, setTimerProgress] = useState(1);

  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());
  const answeredRef = useRef(false);
  const feedbackRef = useRef<"correct" | "incorrect" | "timeout" | null>(null);
  const showRuleSwitchRef = useRef(false);
  const trialRef = useRef(0);
  const responsesRef = useRef(responses);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  feedbackRef.current = feedback;
  showRuleSwitchRef.current = showRuleSwitch;
  trialRef.current = trial;
  responsesRef.current = responses;

  const trialMs = getTrialMs(difficulty);
  const currentRule = getRuleName(trial);
  const isSwitchTrial = trial > 0 && trial % SWITCH_EVERY === 0;

  const handleAnswer = useCallback(
    (answer: boolean | null) => {
      if (answeredRef.current) return;
      if (feedbackRef.current || showRuleSwitchRef.current) return;
      answeredRef.current = true;

      const rt = Date.now() - trialStart.current;
      const curTrial = trialRef.current;
      const obj = sequence[curTrial];
      const curRule = getRuleName(curTrial);
      const curIsSwitchTrial = curTrial > 0 && curTrial % SWITCH_EVERY === 0;

      const isCorrect = answer !== null && getCorrectAnswer(obj, curRule) === answer;
      const fbType = answer === null ? "timeout" : isCorrect ? "correct" : "incorrect";

      setFeedback(fbType);
      feedbackRef.current = fbType;

      const newResponses = [
        ...responsesRef.current,
        { correct: isCorrect, rt: answer === null ? trialMs : rt, isSwitchTrial: curIsSwitchTrial },
      ];

      const delay = isCorrect ? 280 : 420;

      setTimeout(() => {
        setFeedback(null);
        feedbackRef.current = null;

        const nextTrial = curTrial + 1;
        reportProgress(Math.round((nextTrial / TOTAL_TRIALS) * 100));
        setResponses(newResponses);

        if (nextTrial >= TOTAL_TRIALS) {
          const accuracy = newResponses.filter((r) => r.correct).length / TOTAL_TRIALS;
          const avgRT = newResponses.reduce((s, r) => s + r.rt, 0) / newResponses.length;
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
          return;
        }

        const nextIsSwitch = nextTrial % SWITCH_EVERY === 0;
        const showSwitchOverlay = difficulty <= 8;

        if (nextIsSwitch && showSwitchOverlay) {
          setShowRuleSwitch(true);
          showRuleSwitchRef.current = true;
          setTrial(nextTrial);
          trialRef.current = nextTrial;
          setTimeout(() => {
            setShowRuleSwitch(false);
            showRuleSwitchRef.current = false;
            trialStart.current = Date.now();
            answeredRef.current = false;
            setTimerProgress(1);
          }, 1100);
        } else {
          setTrial(nextTrial);
          trialRef.current = nextTrial;
          trialStart.current = Date.now();
          answeredRef.current = false;
          setTimerProgress(1);
        }
      }, delay);
    },
    [difficulty, onComplete, reportProgress, sequence, trialMs]
  );

  // Per-trial countdown timer
  useEffect(() => {
    if (showTutorial) return;
    answeredRef.current = false;
    trialStart.current = Date.now();
    setTimerProgress(1);

    const startMs = Date.now();
    const tick = setInterval(() => {
      setTimerProgress(Math.max(0, 1 - (Date.now() - startMs) / trialMs));
    }, 60);
    const timeout = setTimeout(() => {
      handleAnswer(null);
    }, trialMs);

    return () => {
      clearInterval(tick);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, showTutorial, showRuleSwitch]);

  useEffect(() => {
    if (!showTutorial) startTime.current = Date.now();
  }, [showTutorial]);

  // Swipe support on card
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
    handleAnswer(dx > 0); // swipe right = SIM, swipe left = NÃO
  }

  if (showTutorial) {
    return <FlexibilidadeTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const obj = sequence[Math.min(trial, TOTAL_TRIALS - 1)];
  const nextRule = getRuleName(trial);

  const bg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-emerald-50" :
    "bg-gray-50";

  const cardBase =
    theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" :
    theme === "COLORFUL" ? "bg-white shadow-xl border-2 border-teal-200" :
    "bg-white shadow-lg border border-gray-100";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-teal-700" :
    "text-gray-900";

  const ruleBadgeBg =
    theme === "GAMIFIED" ? "bg-cyan-900/50 text-cyan-200 border-cyan-600/50" :
    theme === "COLORFUL" ? "bg-teal-100 text-teal-800 border-teal-300" :
    "bg-blue-50 text-blue-800 border-blue-200";

  const cardBorder =
    feedback === "correct" ? "border-green-500 shadow-green-200 shadow-md" :
    feedback === "incorrect" || feedback === "timeout" ? "border-red-400 shadow-red-200 shadow-md" :
    theme === "GAMIFIED" ? "border-gray-600" : "border-gray-200";

  const timerColor =
    timerProgress > 0.5 ? "#22c55e" :
    timerProgress > 0.25 ? "#f97316" :
    "#ef4444";

  const progressEmpty = theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200";

  const blocked = !!feedback || showRuleSwitch;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${cardBase}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-bold text-base ${titleClass}`}>🔄 Triagem Rápida</h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            theme === "GAMIFIED" ? "text-gray-400 border-gray-600" : "text-gray-500 border-gray-200"
          }`}>
            {trial + 1}/{TOTAL_TRIALS}
          </span>
        </div>

        {/* Rule badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRule}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 mb-3 font-black text-lg tracking-wide ${ruleBadgeBg}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {RULE_ICONS[currentRule]} {RULE_LABELS[currentRule]}
          </motion.div>
        </AnimatePresence>

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

        {/* Object card with swipe support */}
        <div
          className="relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={trial}
              className={`flex flex-col items-center justify-center rounded-2xl mb-3 border-4 transition-colors select-none ${cardBorder}`}
              style={{ minHeight: 180 }}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span style={{ fontSize: 96, lineHeight: 1.1 }}>{obj.emoji}</span>
              <span className={`mt-2 font-bold text-lg ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                {obj.label}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Rule switch overlay */}
          <AnimatePresence>
            {showRuleSwitch && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-20"
                style={{
                  background: theme === "GAMIFIED" ? "rgba(6,18,40,0.95)" : "rgba(255,255,255,0.97)",
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl mb-3"
                >
                  🔄
                </motion.div>
                <p className={`font-black text-xs uppercase tracking-widest mb-1 ${
                  theme === "GAMIFIED" ? "text-cyan-400" : "text-teal-600"
                }`}>
                  REGRA MUDOU!
                </p>
                <p className={`font-black text-xl ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                  {RULE_ICONS[nextRule]} {RULE_LABELS[nextRule]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback flash */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center rounded-2xl z-10 ${
                  feedback === "correct"
                    ? "bg-green-500/20"
                    : "bg-red-500/20"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <span className="text-5xl">
                  {feedback === "correct" ? "✓" : feedback === "timeout" ? "⏱" : "✗"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer bar */}
        <div className={`h-2 rounded-full mb-3 overflow-hidden ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timerColor, width: `${timerProgress * 100}%` }}
            transition={{ duration: 0.06 }}
          />
        </div>

        {/* Answer buttons */}
        <div className="flex gap-3">
          <BtnNAO theme={theme} disabled={blocked} onClick={() => handleAnswer(false)} />
          <BtnSIM theme={theme} disabled={blocked} onClick={() => handleAnswer(true)} />
        </div>

        <p className={`text-center text-xs mt-2 ${theme === "GAMIFIED" ? "text-gray-600" : "text-gray-400"}`}>
          deslize ← NÃO · SIM →
        </p>
      </div>
    </div>
  );
}
