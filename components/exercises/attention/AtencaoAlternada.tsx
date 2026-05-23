"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoAlternadaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MAX_TRIALS = 20;

type Rule = "animal-objeto" | "grande-pequeno";

interface Item {
  name: string;
  isAnimal: boolean;  // true = ANIMAL, false = OBJETO
  isLarge: boolean;   // true = GRANDE, false = PEQUENO
  emoji: string;
}

const ITEMS: Item[] = [
  { name: "ELEFANTE", isAnimal: true,  isLarge: true,  emoji: "🐘" },
  { name: "FORMIGA",  isAnimal: true,  isLarge: false, emoji: "🐜" },
  { name: "AVIÃO",    isAnimal: false, isLarge: true,  emoji: "✈️" },
  { name: "BOTÃO",    isAnimal: false, isLarge: false, emoji: "🔘" },
  { name: "BALEIA",   isAnimal: true,  isLarge: true,  emoji: "🐋" },
  { name: "ABELHA",   isAnimal: true,  isLarge: false, emoji: "🐝" },
  { name: "NAVIO",    isAnimal: false, isLarge: true,  emoji: "🚢" },
  { name: "MOEDA",    isAnimal: false, isLarge: false, emoji: "🪙" },
  { name: "LEÃO",     isAnimal: true,  isLarge: true,  emoji: "🦁" },
  { name: "CARACOL",  isAnimal: true,  isLarge: false, emoji: "🐌" },
  { name: "ÔNIBUS",   isAnimal: false, isLarge: true,  emoji: "🚌" },
  { name: "CLIPE",    isAnimal: false, isLarge: false, emoji: "📎" },
  { name: "URSO",     isAnimal: true,  isLarge: true,  emoji: "🐻" },
  { name: "MOSQUITO", isAnimal: true,  isLarge: false, emoji: "🦟" },
  { name: "SOFÁ",     isAnimal: false, isLarge: true,  emoji: "🛋️" },
  { name: "PREGO",    isAnimal: false, isLarge: false, emoji: "🔩" },
  { name: "GIRAFA",   isAnimal: true,  isLarge: true,  emoji: "🦒" },
  { name: "MOSCA",    isAnimal: true,  isLarge: false, emoji: "🪰" },
  { name: "GELADEIRA",isAnimal: false, isLarge: true,  emoji: "🧊" },
  { name: "ANEL",     isAnimal: false, isLarge: false, emoji: "💍" },
  { name: "HIPOPÓTAMO",isAnimal: true, isLarge: true,  emoji: "🦛" },
  { name: "PULGA",    isAnimal: true,  isLarge: false, emoji: "🦠" },
  { name: "PRÉDIO",   isAnimal: false, isLarge: true,  emoji: "🏢" },
  { name: "BOTÃO",    isAnimal: false, isLarge: false, emoji: "🔘" },
];

function getRuleBlockSize(difficulty: number): number {
  if (difficulty <= 3) return 5;
  if (difficulty <= 6) return 4;
  return 3;
}

function buildTrialSequence(total: number, blockSize: number): { item: Item; rule: Rule }[] {
  const seq: { item: Item; rule: Rule }[] = [];
  let ruleToggle: Rule = "animal-objeto";
  let countInBlock = 0;

  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < total; i++) {
    if (countInBlock >= blockSize) {
      ruleToggle = ruleToggle === "animal-objeto" ? "grande-pequeno" : "animal-objeto";
      countInBlock = 0;
    }
    seq.push({ item: shuffled[i % shuffled.length], rule: ruleToggle });
    countInBlock++;
  }
  return seq;
}

// ── Tutorial sub-components ────────────────────────────────────────────────

function TutorialRuleDemo({
  theme,
  rule,
  onDone,
}: {
  theme: Theme;
  rule: Rule;
  onDone: () => void;
}) {
  const item = rule === "animal-objeto" ? ITEMS[0] : ITEMS[1]; // ELEFANTE or FORMIGA
  const [answered, setAnswered] = useState(false);

  const optionA = rule === "animal-objeto" ? "ANIMAL" : "GRANDE";
  const optionB = rule === "animal-objeto" ? "OBJETO" : "PEQUENO";
  const correctAnswer = rule === "animal-objeto"
    ? (item.isAnimal ? "ANIMAL" : "OBJETO")
    : (item.isLarge ? "GRANDE" : "PEQUENO");

  function handleAnswer(answer: string) {
    if (answered) return;
    setAnswered(true);
    setTimeout(onDone, 600);
  }

  const ruleBg = rule === "animal-objeto"
    ? theme === "GAMIFIED" ? "bg-amber-900/50 border border-amber-500/50" : "bg-amber-50 border border-amber-300"
    : theme === "GAMIFIED" ? "bg-teal-900/50 border border-teal-500/50" : "bg-teal-50 border border-teal-300";

  const ruleText = rule === "animal-objeto"
    ? theme === "GAMIFIED" ? "text-amber-300" : "text-amber-700"
    : theme === "GAMIFIED" ? "text-teal-300" : "text-teal-700";

  const btnBase = "flex-1 py-3 rounded-xl font-bold text-sm transition-colors";
  const btnGreen = "bg-green-500 text-white";
  const btnNeutral = theme === "GAMIFIED"
    ? "bg-gray-700 border border-gray-600 text-gray-200"
    : "bg-gray-100 border border-gray-300 text-gray-700";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-full rounded-xl p-3 text-center ${ruleBg}`}>
        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${ruleText}`}>Regra atual</p>
        <p className={`text-base font-black ${ruleText}`}>
          {rule === "animal-objeto" ? "É animal ou objeto?" : "É grande ou pequeno?"}
        </p>
      </div>
      <div className={`flex flex-col items-center gap-1 p-4 rounded-xl ${
        theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"
      }`}>
        <span className="text-5xl">{item.emoji}</span>
        <p className={`text-lg font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>
          {item.name}
        </p>
      </div>
      <div className="flex gap-2 w-full">
        <motion.button
          onClick={() => handleAnswer(optionA)}
          whileTap={{ scale: 0.95 }}
          disabled={answered}
          className={`${btnBase} ${answered && optionA === correctAnswer ? btnGreen : btnNeutral}`}
        >
          {optionA}
        </motion.button>
        <motion.button
          onClick={() => handleAnswer(optionB)}
          whileTap={{ scale: 0.95 }}
          disabled={answered}
          className={`${btnBase} ${answered && optionB === correctAnswer ? btnGreen : btnNeutral}`}
        >
          {optionB}
        </motion.button>
      </div>
    </div>
  );
}

function AtencaoAlternadaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Você vai classificar figuras seguindo uma REGRA. A regra muda durante o exercício!",
      content: (onStepDone: () => void) => {
        useEffect(() => { const t = setTimeout(onStepDone, 2500); return () => clearTimeout(t); }, []);
        return (
          <div className="flex flex-col gap-2">
            {[
              { label: "Regra A", text: "É animal ou objeto?", color: theme === "GAMIFIED" ? "border-amber-500/60 bg-amber-900/30 text-amber-300" : "border-amber-400 bg-amber-50 text-amber-700" },
              { label: "Regra B", text: "É grande ou pequeno?", color: theme === "GAMIFIED" ? "border-teal-500/60 bg-teal-900/30 text-teal-300" : "border-teal-400 bg-teal-50 text-teal-700" },
            ].map((r) => (
              <div key={r.label} className={`p-3 rounded-xl border text-center ${r.color}`}>
                <p className="text-xs font-semibold opacity-70">{r.label}</p>
                <p className="font-black">{r.text}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      instruction: "Pratique a Regra A: é ANIMAL ou OBJETO? Toque a resposta certa.",
      content: (onStepDone: () => void) => <TutorialRuleDemo theme={theme} rule="animal-objeto" onDone={onStepDone} />,
    },
    {
      instruction: "Agora a Regra B: é GRANDE ou PEQUENO? A regra mudou — fique atento!",
      content: (onStepDone: () => void) => <TutorialRuleDemo theme={theme} rule="grande-pequeno" onDone={onStepDone} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Alternada" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function AtencaoAlternada({ difficulty, theme, onComplete }: AtencaoAlternadaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const blockSize = getRuleBlockSize(difficulty);

  const [trials] = useState(() => buildTrialSequence(MAX_TRIALS, blockSize));

  const [trialIndex, setTrialIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lastRule, setLastRule] = useState<Rule | null>(null);
  const [ruleJustChanged, setRuleJustChanged] = useState(false);

  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!showTutorial) startTime.current = Date.now();
  }, [showTutorial]);

  useEffect(() => {
    if (trialIndex > 0) {
      reportProgress(Math.round((trialIndex / MAX_TRIALS) * 100));
    }
    // Detect rule change
    if (trialIndex > 0 && trials[trialIndex]) {
      const currentRule = trials[trialIndex].rule;
      const prevRule = trials[trialIndex - 1].rule;
      if (currentRule !== prevRule) {
        setRuleJustChanged(true);
        const t = setTimeout(() => setRuleJustChanged(false), 1000);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);

  useEffect(() => {
    if (!done) return;
    const correct = results.filter(Boolean).length;
    const accuracy = correct / MAX_TRIALS;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-alternada", accuracy, undefined, difficulty);
    onComplete({
      exerciseId: "atencao-alternada",
      domain: "attention",
      score,
      accuracy,
      difficulty,
      duration,
      metadata: { correct, total: MAX_TRIALS, blockSize },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleAnswer(answer: string) {
    if (locked || done || trialIndex >= MAX_TRIALS) return;
    const trial = trials[trialIndex];
    const { item, rule } = trial;
    const correctAnswer = rule === "animal-objeto"
      ? (item.isAnimal ? "ANIMAL" : "OBJETO")
      : (item.isLarge ? "GRANDE" : "PEQUENO");

    const isCorrect = answer === correctAnswer;
    setLocked(true);

    setTimeout(() => {
      const newResults = [...results, isCorrect];
      setResults(newResults);
      setLastRule(rule);
      setLocked(false);
      if (trialIndex + 1 >= MAX_TRIALS) {
        setDone(true);
      } else {
        setTrialIndex((t) => t + 1);
      }
    }, 400);
  }

  if (showTutorial) {
    return <AtencaoAlternadaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const trial = trials[Math.min(trialIndex, MAX_TRIALS - 1)];
  const { item, rule } = trial;
  const progress = (trialIndex / MAX_TRIALS) * 100;
  const correct = results.filter(Boolean).length;

  const isAnimalRule = rule === "animal-objeto";

  const bgClass = theme === "GAMIFIED"
    ? "bg-gray-950"
    : theme === "COLORFUL"
    ? "bg-gradient-to-br from-amber-50 to-teal-50"
    : "bg-gray-50";

  const cardClass = theme === "GAMIFIED"
    ? "bg-gray-800 border border-cyan-500/30"
    : "bg-white shadow-lg";

  const ruleBg = isAnimalRule
    ? theme === "GAMIFIED" ? "bg-amber-900/50 border border-amber-500/40" : "bg-amber-50 border border-amber-300"
    : theme === "GAMIFIED" ? "bg-teal-900/50 border border-teal-500/40" : "bg-teal-50 border border-teal-300";

  const ruleText = isAnimalRule
    ? theme === "GAMIFIED" ? "text-amber-300" : "text-amber-700"
    : theme === "GAMIFIED" ? "text-teal-300" : "text-teal-700";

  const btnA = isAnimalRule
    ? theme === "GAMIFIED" ? "bg-amber-600 text-white" : theme === "COLORFUL" ? "bg-amber-500 text-white" : "bg-amber-500 text-white"
    : theme === "GAMIFIED" ? "bg-teal-600 text-white" : theme === "COLORFUL" ? "bg-teal-500 text-white" : "bg-teal-500 text-white";

  const btnB = theme === "GAMIFIED"
    ? "bg-gray-600 text-white"
    : "bg-gray-200 text-gray-800";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${cardClass}`}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-3">
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>
            ✓ {correct}
          </span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>
            {trialIndex}/{MAX_TRIALS}
          </span>
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>
            ✗ {results.filter((r) => !r).length}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${isAnimalRule ? "bg-amber-500" : "bg-teal-500"}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress dots */}
        <div className="flex flex-wrap gap-1 mb-4">
          {results.map((r, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${r ? "bg-green-500" : "bg-red-400"}`} />
          ))}
          {Array.from({ length: MAX_TRIALS - results.length }).map((_, i) => (
            <div key={`e-${i}`} className={`w-3 h-3 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Current rule badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={rule}
            initial={{ scale: ruleJustChanged ? 1.1 : 1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full rounded-xl p-3 mb-4 text-center ${ruleBg} ${ruleJustChanged ? "ring-2 ring-offset-1 ring-yellow-400" : ""}`}
          >
            {ruleJustChanged && (
              <p className="text-xs font-bold text-yellow-500 mb-1 animate-pulse">⚡ REGRA MUDOU!</p>
            )}
            <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${ruleText}`}>Regra atual</p>
            <p className={`text-lg font-black ${ruleText}`}>
              {isAnimalRule ? "É animal ou objeto?" : "É grande ou pequeno?"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Item display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trialIndex}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className={`flex flex-col items-center gap-2 py-6 mb-6 rounded-2xl ${
              theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50 border border-gray-200"
            }`}
          >
            <span className="text-7xl">{item.emoji}</span>
            <p className={`text-2xl font-black tracking-wider ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>
              {item.name}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer buttons */}
        <div className="flex gap-3">
          {isAnimalRule ? (
            <>
              <motion.button
                onClick={() => handleAnswer("ANIMAL")}
                disabled={locked}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-4 rounded-xl font-black text-lg ${btnA}`}
              >
                ANIMAL
              </motion.button>
              <motion.button
                onClick={() => handleAnswer("OBJETO")}
                disabled={locked}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-4 rounded-xl font-black text-lg ${btnB}`}
              >
                OBJETO
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => handleAnswer("GRANDE")}
                disabled={locked}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-4 rounded-xl font-black text-lg ${btnA}`}
              >
                GRANDE
              </motion.button>
              <motion.button
                onClick={() => handleAnswer("PEQUENO")}
                disabled={locked}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-4 rounded-xl font-black text-lg ${btnB}`}
              >
                PEQUENO
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
