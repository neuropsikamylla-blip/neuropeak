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
  { name: "ROXO",     hex: "#A855F7" },
];

type Rule = "COR" | "PALAVRA";
type Phase = "tutorial" | "active";

interface TrialItem {
  word: (typeof COLORS)[number];
  inkColor: (typeof COLORS)[number];
  rule: Rule;
}

const MAX_TRIALS = 20;
const MIN_TIME_MS = 550;
const MAX_TIME_MS = 4000;

const TUTORIAL_EXAMPLES: TrialItem[] = [
  { word: COLORS[0], inkColor: COLORS[1], rule: "COR" },
  { word: COLORS[2], inkColor: COLORS[0], rule: "PALAVRA" },
  { word: COLORS[4], inkColor: COLORS[3], rule: "COR" },
];

function getOtherColors(excluded: (typeof COLORS)[number]) {
  return COLORS.filter((c) => c !== excluded);
}

function generateTrial(difficulty: number): TrialItem {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const congruentChance = difficulty <= 2 ? 0.2 : difficulty <= 4 ? 0.1 : 0.03;
  const congruent = Math.random() < congruentChance;
  const others = getOtherColors(word);
  const inkColor = congruent ? word : others[Math.floor(Math.random() * others.length)];
  let rule: Rule;
  if (difficulty >= 7)      rule = Math.random() < 0.5  ? "PALAVRA" : "COR";
  else if (difficulty >= 5) rule = Math.random() < 0.45 ? "PALAVRA" : "COR";
  else if (difficulty >= 3) rule = Math.random() < 0.4  ? "PALAVRA" : "COR";
  else                      rule = Math.random() < 0.35 ? "PALAVRA" : "COR";
  return { word, inkColor, rule };
}

function initialTimeMs(difficulty: number): number {
  return Math.max(MIN_TIME_MS, Math.round(2800 - (difficulty - 1) * 300));
}

function correctAnswer(item: TrialItem): string {
  return item.rule === "COR" ? item.inkColor.name : item.word.name;
}

// ── Shared visual primitives ──────────────────────────────────────────────────

function GlassBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
      {/* bokeh circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl" />
    </div>
  );
}

function RuleBadge({ rule }: { rule: Rule }) {
  const isCor = rule === "COR";
  return (
    <motion.div
      key={rule}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="flex justify-center"
    >
      <div
        className="px-7 py-3 rounded-2xl font-black text-2xl flex items-center gap-2 shadow-lg"
        style={{
          background: isCor
            ? "linear-gradient(135deg, rgba(96,165,250,0.25), rgba(139,92,246,0.25))"
            : "linear-gradient(135deg, #1a0030, #2d0050)",
          border: `2px solid ${isCor ? "rgba(147,197,253,0.5)" : "rgba(216,180,254,0.6)"}`,
          color: isCor ? "#93c5fd" : "#e9d5ff",
          backdropFilter: "blur(8px)",
          boxShadow: isCor
            ? "0 0 20px rgba(96,165,250,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 0 24px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {isCor ? "🎨" : "📝"}
        <span>{isCor ? "COR" : "PALAVRA"}</span>
      </div>
    </motion.div>
  );
}

function ColorButton({
  color,
  onClick,
  disabled = false,
  glow = false,
}: {
  color: (typeof COLORS)[number];
  onClick: () => void;
  disabled?: boolean;
  glow?: boolean;
}) {
  return (
    <motion.button
      onPointerDown={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.93 }}
      className="w-full py-4 rounded-full font-black text-white text-base tracking-wide flex items-center justify-center gap-2 select-none touch-none"
      style={{
        background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex}99)`,
        boxShadow: glow
          ? `0 0 28px ${color.hex}88, 0 4px 16px ${color.hex}55`
          : `0 4px 16px ${color.hex}55`,
        border: `1.5px solid ${color.hex}88`,
      }}
    >
      🎨 {color.name}
    </motion.button>
  );
}

// ── Tutorial step ─────────────────────────────────────────────────────────────

function TutorialStep({
  step,
  item,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GlassBg />

      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white/60 tracking-wider">
            EXEMPLO {step + 1} de {TUTORIAL_EXAMPLES.length}
          </span>
          <p className="mt-2 text-sm text-white/70">
            Veja como funciona e tente responder!
          </p>
        </div>

        {/* Rule badge */}
        <RuleBadge rule={item.rule} />

        {/* Explanation */}
        <div
          className="text-center text-xs px-4 py-3 rounded-xl text-white/60"
          style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {item.rule === "COR" ? (
            <>Quando aparece <strong className="text-blue-300">🎨 COR</strong>: clique na <strong className="text-white">cor da tinta</strong> usada para pintar a palavra.</>
          ) : (
            <>Quando aparece <strong className="text-purple-300">📝 PALAVRA</strong>: clique na <strong className="text-white">palavra que está escrita</strong>, ignore a tinta.</>
          )}
        </div>

        {/* The word */}
        <div
          className="text-center py-6 rounded-2xl"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            className="text-6xl font-black tracking-wide drop-shadow-lg"
            style={{
              color: item.inkColor.hex,
              textShadow: `0 0 30px ${item.inkColor.hex}88`,
            }}
          >
            {item.word.name}
          </span>
        </div>

        {/* Answer buttons or feedback */}
        {!selected ? (
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((color) => (
              <ColorButton key={color.name} color={color} onClick={() => setSelected(color.name)} />
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
              <div
                className={`p-4 rounded-2xl text-center border ${
                  isCorrect
                    ? "border-green-400/40 bg-green-500/15"
                    : "border-orange-400/40 bg-orange-500/15"
                }`}
              >
                <p className={`font-bold text-lg ${isCorrect ? "text-green-300" : "text-orange-300"}`}>
                  {isCorrect ? "✓ Correto!" : "✗ Quase!"}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? "text-green-200" : "text-orange-200"}`}>
                  {item.rule === "COR" ? (
                    isCorrect ? (
                      <>A cor da tinta era <strong style={{ color: item.inkColor.hex }}>{item.inkColor.name}</strong>. Correto!</>
                    ) : (
                      <>A cor da tinta era <strong style={{ color: item.inkColor.hex }}>{item.inkColor.name}</strong>, não &quot;{selected}&quot;.</>
                    )
                  ) : (
                    isCorrect ? (
                      <>A palavra escrita era <strong>{item.word.name}</strong>. Correto!</>
                    ) : (
                      <>A palavra escrita era <strong>{item.word.name}</strong>, não &quot;{selected}&quot;.</>
                    )
                  )}
                </p>
              </div>

              <button
                onClick={onNext}
                className="w-full py-3.5 rounded-full font-black text-base text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
                }}
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

// ── Main exercise ─────────────────────────────────────────────────────────────

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
    if (newStreak >= 2)  { nextTime = Math.max(currentTimeMs - 500, MIN_TIME_MS); nextStreak = 0; }
    if (newStreak <= -2) { nextTime = Math.min(currentTimeMs + 350, MAX_TIME_MS); nextStreak = 0; }

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
        exerciseId: "stroop-task", domain: "executive", score, accuracy,
        reactionTime: avgRT, difficulty, duration,
        metadata: { total: MAX_TRIALS, correct: newResults.filter((r) => r.correct).length, finalTimeMs: nextTime },
      });
    } else {
      setStreak(nextStreak);
      setTimeMs(nextTime);
      setTrial(nextTrial);
      setItem(generateTrial(difficulty));
    }
  }

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

  const timerColor = itemProgress < 25 ? "#EF4444" : "#6366f1";
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GlassBg />

      <div
        className="w-full max-w-md rounded-3xl p-6 space-y-4"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Score + time */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/40 font-mono">
            {(Math.round(timeMs / 100) / 10).toFixed(1)}s/item
          </span>
          <span className="text-sm font-bold text-green-400">
            ✓ {correctCount} / {MAX_TRIALS}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct ? "bg-green-400" : "bg-red-400"
                  : i === trial ? "bg-indigo-400 animate-pulse"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Timer bar */}
        <div className="h-1.5 rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ width: `${itemProgress}%`, backgroundColor: timerColor, transition: "width 0.05s linear" }}
          />
        </div>

        {/* Rule badge */}
        <RuleBadge key={`rule-${trial}`} rule={item.rule} />

        {/* Sub-hint */}
        <p className="text-center text-xs text-white/40">
          {item.rule === "COR" ? "↓ clique na cor da tinta" : "↓ clique na palavra escrita"}
        </p>

        {/* Stroop word */}
        <motion.div
          key={`word-${trial}`}
          className="text-center py-6 rounded-2xl"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            className="text-6xl font-black tracking-wide"
            style={{
              color: item.inkColor.hex,
              textShadow: `0 0 40px ${item.inkColor.hex}99`,
            }}
          >
            {item.word.name}
          </span>
        </motion.div>

        {/* Color buttons — 2×2 + 1 centered */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.slice(0, 4).map((color) => (
            <ColorButton
              key={color.name}
              color={color}
              onClick={() => handleAnswer(color.name)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-[calc(50%-6px)]">
            <ColorButton
              color={COLORS[4]}
              onClick={() => handleAnswer(COLORS[4].name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
