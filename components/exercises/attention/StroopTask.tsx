"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface StroopTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const COLORS = [
  { name: "VERMELHO", hex: "#EF4444" },
  { name: "AZUL",     hex: "#3B82F6" },
  { name: "VERDE",    hex: "#22C55E" },
  { name: "AMARELO",  hex: "#EAB308" },
];

type Rule = "COR" | "PALAVRA";
type Phase = "tutorial" | "active";

interface TrialItem {
  word: (typeof COLORS)[number];
  inkColor: (typeof COLORS)[number];
  rule: Rule;
}

const MAX_TRIALS = 20;
const MIN_TIME_MS = 800;
const MAX_TIME_MS = 5000;

// Fixed tutorial examples — three examples with variety
const TUTORIAL_EXAMPLES: TrialItem[] = [
  { word: COLORS[0], inkColor: COLORS[1], rule: "COR" },     // "VERMELHO" em AZUL → AZUL
  { word: COLORS[2], inkColor: COLORS[0], rule: "PALAVRA" }, // "VERDE" em VERMELHO → VERDE
  { word: COLORS[3], inkColor: COLORS[2], rule: "COR" },     // "AMARELO" em VERDE → VERDE
];

function getOtherColors(excluded: (typeof COLORS)[number]) {
  return COLORS.filter((c) => c !== excluded);
}

function generateTrial(difficulty: number): TrialItem {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  // Higher difficulty = more incongruent (word ≠ ink color)
  const congruentChance = difficulty <= 2 ? 0.5 : difficulty <= 4 ? 0.3 : 0.1;
  const congruent = Math.random() < congruentChance;
  const others = getOtherColors(word);
  const inkColor = congruent ? word : others[Math.floor(Math.random() * others.length)];
  // Balanced rule distribution — PALAVRA appears from the start
  let rule: Rule;
  if (difficulty >= 7) {
    rule = Math.random() < 0.5 ? "PALAVRA" : "COR";
  } else if (difficulty >= 5) {
    rule = Math.random() < 0.45 ? "PALAVRA" : "COR";
  } else if (difficulty >= 3) {
    rule = Math.random() < 0.4 ? "PALAVRA" : "COR";
  } else {
    rule = Math.random() < 0.35 ? "PALAVRA" : "COR";
  }
  return { word, inkColor, rule };
}

function initialTimeMs(difficulty: number): number {
  return Math.max(MIN_TIME_MS, Math.round(4000 - (difficulty - 1) * 400));
}

function correctAnswer(item: TrialItem): string {
  return item.rule === "COR" ? item.inkColor.name : item.word.name;
}

// ─── Tutorial step ──────────────────────────────────────────────────────────
function TutorialStep({
  step,
  item,
  theme,
  onNext,
}: {
  step: number;
  item: TrialItem;
  theme: Theme;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const expected = correctAnswer(item);
  const isCorrect = selected === expected;

  const bgClass =
    theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-blue-50 to-purple-50"
      : "bg-gray-50";

  const cardClass =
    theme === "GAMIFIED"
      ? "bg-gray-800 border border-cyan-500/30"
      : "bg-white shadow-lg";

  const ruleBadgeClass =
    item.rule === "COR"
      ? theme === "GAMIFIED"
        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
        : "bg-blue-100 text-blue-700 border-2 border-blue-300"
      : theme === "GAMIFIED"
      ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
      : "bg-purple-100 text-purple-700 border-2 border-purple-300";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${cardClass}`}>

        {/* Header */}
        <div className="text-center mb-5">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            theme === "GAMIFIED" ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-100 text-blue-700"
          }`}>
            EXEMPLO {step + 1} de {TUTORIAL_EXAMPLES.length}
          </span>
          <p className={`mt-2 text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
            Veja como funciona e tente responder!
          </p>
        </div>

        {/* Rule badge */}
        <div className="flex justify-center mb-3">
          <div className={`px-5 py-2 rounded-xl font-black text-xl ${ruleBadgeClass}`}>
            {item.rule === "COR" ? "🎨 COR" : "📝 PALAVRA"}
          </div>
        </div>

        {/* Rule explanation */}
        <div className={`text-center text-xs px-3 py-2 rounded-lg mb-5 ${
          theme === "GAMIFIED" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
        }`}>
          {item.rule === "COR" ? (
            <>Quando aparece <strong>🎨 COR</strong>: clique na <strong>cor da tinta</strong> usada para pintar a palavra.</>
          ) : (
            <>Quando aparece <strong>📝 PALAVRA</strong>: clique na <strong>palavra que está escrita</strong>, ignore a tinta.</>
          )}
        </div>

        {/* The word */}
        <div className="text-center py-4 mb-5">
          <span className="text-6xl font-black" style={{ color: item.inkColor.hex }}>
            {item.word.name}
          </span>
        </div>

        {/* Answer buttons */}
        {!selected ? (
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((color) => (
              <motion.button
                key={color.name}
                onClick={() => setSelected(color.name)}
                className="py-4 rounded-xl font-bold text-white text-sm shadow-md"
                style={{ backgroundColor: color.hex }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {color.name}
              </motion.button>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Feedback banner */}
              <div className={`p-4 rounded-xl text-center border-2 ${
                isCorrect ? "bg-green-50 border-green-300" : "bg-orange-50 border-orange-300"
              }`}>
                <p className={`font-bold text-lg ${isCorrect ? "text-green-700" : "text-orange-700"}`}>
                  {isCorrect ? "✓ Correto!" : "✗ Quase!"}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? "text-green-600" : "text-orange-600"}`}>
                  {item.rule === "COR" ? (
                    isCorrect ? (
                      <>
                        A cor da tinta era{" "}
                        <strong style={{ color: item.inkColor.hex }}>{item.inkColor.name}</strong>. Correto!
                      </>
                    ) : (
                      <>
                        A cor da tinta era{" "}
                        <strong style={{ color: item.inkColor.hex }}>{item.inkColor.name}</strong>
                        , não &quot;{selected}&quot;.
                      </>
                    )
                  ) : (
                    isCorrect ? (
                      <>
                        A palavra escrita era <strong>{item.word.name}</strong>. Correto!
                      </>
                    ) : (
                      <>
                        A palavra escrita era <strong>{item.word.name}</strong>
                        , não &quot;{selected}&quot;.
                      </>
                    )
                  )}
                </p>
              </div>

              {/* Visual breakdown */}
              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                theme === "GAMIFIED" ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"
              }`}>
                {item.rule === "COR" ? (
                  <>
                    <p>🎨 Regra <strong>COR</strong> → olhe para a <strong>cor da tinta</strong></p>
                    <p>
                      A palavra <strong>&quot;{item.word.name}&quot;</strong> está pintada de{" "}
                      <strong style={{ color: item.inkColor.hex }}>{item.inkColor.name}</strong>
                      {" "}→ resposta: <strong>{item.inkColor.name}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <p>📝 Regra <strong>PALAVRA</strong> → leia o que <strong>está escrito</strong></p>
                    <p>
                      Está escrito{" "}
                      <strong style={{ color: item.inkColor.hex }}>&quot;{item.word.name}&quot;</strong>
                      {" "}(tinta {item.inkColor.name}) → resposta: <strong>{item.word.name}</strong>
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={onNext}
                className={`w-full py-3 rounded-xl font-bold text-base transition-colors ${
                  theme === "GAMIFIED"
                    ? "bg-cyan-500 hover:bg-cyan-400 text-gray-900"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {step < TUTORIAL_EXAMPLES.length - 1 ? "Próximo exemplo →" : "Entendi! Começar →"}
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Main exercise ────────────────────────────────────────────────────────────
export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
  const reportProgress = useExerciseProgress();

  const [phase, setPhase] = useState<Phase>("tutorial");
  const [tutorialStep, setTutorialStep] = useState(0);

  const [timeMs, setTimeMs] = useState(initialTimeMs(difficulty));
  const [streak, setStreak] = useState(0);
  const [trial, setTrial] = useState(0);
  const [item, setItem] = useState<TrialItem>(() => generateTrial(difficulty));
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [itemProgress, setItemProgress] = useState(100);
  const [done, setDone] = useState(false);

  const doneRef = useRef(false);
  const trialRef = useRef(0);
  const answeredRef = useRef(false);
  const itemStartRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  trialRef.current = trial;

  function nextTutorialStep() {
    if (tutorialStep < TUTORIAL_EXAMPLES.length - 1) {
      setTutorialStep((s) => s + 1);
    } else {
      sessionStartRef.current = Date.now();
      setPhase("active");
    }
  }

  function advanceTrial(correct: boolean, rt: number, currentTimeMs: number) {
    if (doneRef.current || answeredRef.current) return;
    answeredRef.current = true;

    const newResults = [...results, { correct, rt }];
    setResults(newResults);

    const newStreak = correct ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextTime = currentTimeMs;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextTime = Math.max(currentTimeMs - 350, MIN_TIME_MS); nextStreak = 0; }
    if (newStreak <= -2) { nextTime = Math.min(currentTimeMs + 500, MAX_TIME_MS); nextStreak = 0; }

    const nextTrial = trialRef.current + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    if (nextTrial >= MAX_TRIALS) {
      doneRef.current = true;
      setDone(true);
      const accuracy = newResults.filter((r) => r.correct).length / MAX_TRIALS;
      const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / MAX_TRIALS;
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const score = calculateExerciseScore("stroop-task", accuracy, avgRT, difficulty);
      onComplete({
        exerciseId: "stroop-task",
        domain: "attention",
        score,
        accuracy,
        reactionTime: avgRT,
        difficulty,
        duration,
        metadata: {
          total: MAX_TRIALS,
          correct: newResults.filter((r) => r.correct).length,
          finalTimeMs: nextTime,
        },
      });
    } else {
      setStreak(nextStreak);
      setTimeMs(nextTime);
      setTrial(nextTrial);
      setItem(generateTrial(difficulty));
    }
  }

  // Timer per item
  useEffect(() => {
    if (phase !== "active" || doneRef.current) return;
    const myTrial = trial;
    const myTimeMs = timeMs;
    itemStartRef.current = Date.now();
    answeredRef.current = false;
    setItemProgress(100);

    const interval = setInterval(() => {
      if (doneRef.current || trialRef.current !== myTrial) { clearInterval(interval); return; }
      const elapsed = Date.now() - itemStartRef.current;
      const pct = Math.max(0, (1 - elapsed / myTimeMs) * 100);
      setItemProgress(pct);
      if (elapsed >= myTimeMs) {
        clearInterval(interval);
        if (trialRef.current === myTrial) advanceTrial(false, myTimeMs, myTimeMs);
      }
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, phase, done]);

  function handleAnswer(colorName: string) {
    if (doneRef.current || answeredRef.current || phase !== "active") return;
    const rt = Date.now() - itemStartRef.current;
    advanceTrial(colorName === correctAnswer(item), rt, timeMs);
  }

  // Tutorial phase
  if (phase === "tutorial") {
    return (
      <TutorialStep
        key={tutorialStep}
        step={tutorialStep}
        item={TUTORIAL_EXAMPLES[tutorialStep]}
        theme={theme}
        onNext={nextTutorialStep}
      />
    );
  }

  // Active phase
  const bgClass =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-br from-blue-50 to-purple-50" :
    "bg-gray-50";

  const timerColor =
    itemProgress < 25 ? "#EF4444" :
    theme === "GAMIFIED" ? "#06b6d4" :
    theme === "COLORFUL" ? "#a855f7" :
    "#3B82F6";

  const ruleBadgeClass =
    item.rule === "COR"
      ? theme === "GAMIFIED"
        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
        : "bg-blue-100 text-blue-700 border-2 border-blue-300"
      : theme === "GAMIFIED"
      ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
      : "bg-purple-100 text-purple-700 border-2 border-purple-300";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${
        theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
            {(Math.round(timeMs / 100) / 10).toFixed(1)}s/item
          </span>
          <span className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>
            ✓ {results.filter((r) => r.correct).length}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Timer bar */}
        <div className={`h-1.5 rounded-full mb-5 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"}`}>
          <motion.div
            className="h-full rounded-full"
            style={{ width: `${itemProgress}%`, backgroundColor: timerColor }}
            transition={{ duration: 0.05 }}
          />
        </div>

        {/* Rule badge — most important UI element */}
        <div className="flex justify-center mb-2">
          <motion.div
            key={`rule-${trial}`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`px-6 py-2.5 rounded-xl font-black text-2xl ${ruleBadgeClass}`}
          >
            {item.rule === "COR" ? "🎨 COR" : "📝 PALAVRA"}
          </motion.div>
        </div>

        {/* Sub-hint */}
        <p className={`text-center text-xs mb-5 ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
          {item.rule === "COR" ? "↓ clique na cor da tinta" : "↓ clique na palavra escrita"}
        </p>

        {/* Stroop word */}
        <div className="text-center mb-8 py-2">
          <motion.span
            key={`word-${trial}`}
            className="text-5xl font-black tracking-wide"
            style={{ color: item.inkColor.hex }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.12 }}
          >
            {item.word.name}
          </motion.span>
        </div>

        {/* Color buttons */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color) => (
            <motion.button
              key={color.name}
              onPointerDown={() => handleAnswer(color.name)}
              className="py-4 rounded-xl font-bold text-white text-sm shadow-md select-none touch-none"
              style={{ backgroundColor: color.hex }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
            >
              {color.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
