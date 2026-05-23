"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoSustentadaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MAX_STIMULI = 40; // Longer task for sustained attention
const TARGET_RATIO = 0.28;

// CPT paradigm: target is the letter A
const TARGET_LETTER = "A";
const LETTERS = ["B","C","D","E","F","G","H","I","J","L","M","N","O","P","R","S","T","U","V","Z"];
// Visually similar lures used at high difficulty to challenge inhibition
const LURE_LETTERS = ["Á", "Â", "Ã", "À", "H", "R"];

function getStimulusInterval(difficulty: number): number {
  if (difficulty <= 2) return 1800;
  if (difficulty <= 4) return 1400;
  if (difficulty <= 7) return 1000;
  return 700;
}

function buildSequence(difficulty: number): string[] {
  const seq: string[] = [];
  let targetCount = 0;
  const targetTotal = Math.round(MAX_STIMULI * TARGET_RATIO);
  const includeLures = difficulty > 5;
  const lureRatio = Math.min(0.25, 0.12 + (difficulty - 5) * 0.025);

  for (let i = 0; i < MAX_STIMULI; i++) {
    const remaining = MAX_STIMULI - i;
    const targetsLeft = targetTotal - targetCount;
    const forcedTarget = targetsLeft >= remaining;
    const shouldBeTarget = forcedTarget || (targetsLeft > 0 && Math.random() < TARGET_RATIO);

    if (shouldBeTarget) {
      seq.push(TARGET_LETTER);
      targetCount++;
    } else if (includeLures && Math.random() < lureRatio) {
      seq.push(LURE_LETTERS[Math.floor(Math.random() * LURE_LETTERS.length)]);
    } else {
      seq.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    }
  }

  return seq;
}

// ── Tutorial sub-components ────────────────────────────────────────────────

function TutorialShowTarget({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className={`text-xs font-medium ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
        Toque na tela APENAS quando aparecer a letra:
      </p>
      <div className={`w-28 h-28 rounded-2xl flex items-center justify-center ${
        theme === "GAMIFIED" ? "bg-gray-700 ring-2 ring-cyan-500/50" : "bg-gray-100 border-2 border-blue-300"
      }`}>
        <span className={`text-8xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
          {TARGET_LETTER}
        </span>
      </div>
      <p className={`text-xs font-bold animate-pulse ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
        Memorize — apenas a letra {TARGET_LETTER}!
      </p>
    </div>
  );
}

function TutorialPracticeStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [stimuli] = useState(() => {
    // 5 practice stimuli: 2 targets + 3 distractors
    const arr = [TARGET_LETTER, TARGET_LETTER, ...LETTERS.slice(0, 3)];
    return arr.sort(() => Math.random() - 0.5);
  });

  const [current, setCurrent] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    if (current >= stimuli.length) {
      onDone();
      return;
    }
    setShowing(true);
    setTapped(false);
    const showTimer = setTimeout(() => {
      setShowing(false);
      const nextTimer = setTimeout(() => {
        setCurrent((c) => c + 1);
      }, 200);
      return () => clearTimeout(nextTimer);
    }, 1800);
    return () => clearTimeout(showTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function handleTap() {
    if (!showing || tapped) return;
    setTapped(true);
  }

  const isTarget = stimuli[current] === TARGET_LETTER;
  const stimulusToShow = current < stimuli.length ? stimuli[current] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100"
      }`}>
        <span className={`text-lg font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{TARGET_LETTER}</span>
        <span className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>= alvo</span>
      </div>
      <motion.div
        onClick={handleTap}
        className={`w-32 h-32 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-colors ${
          tapped && isTarget ? "bg-green-500/30 border-2 border-green-500" :
          tapped && !isTarget ? "bg-red-400/20 border-2 border-red-400" :
          theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-gray-100 border-2 border-gray-300"
        }`}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          {stimulusToShow && showing && (
            <motion.span
              key={current}
              className={`text-7xl font-black ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {stimulusToShow}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <p className={`text-xs text-center ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
        Toque na área quando aparecer a letra {TARGET_LETTER}
      </p>
    </div>
  );
}

function AtencaoSustentadaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: `Letras vão aparecer uma por vez. Toque a tela APENAS quando aparecer a letra "${TARGET_LETTER}".`,
      content: (onStepDone: () => void) => <TutorialShowTarget theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: `Pratique! Toque só no "${TARGET_LETTER}". Ignore todas as outras letras.`,
      content: (onStepDone: () => void) => <TutorialPracticeStep theme={theme} onDone={onStepDone} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Sustentada" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function AtencaoSustentada({ difficulty, theme, onComplete }: AtencaoSustentadaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const stimulusInterval = getStimulusInterval(difficulty);

  const [sequence] = useState(() => buildSequence(difficulty));

  const [current, setCurrent] = useState(-1);
  const [displayedEmoji, setDisplayedEmoji] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"hit" | "false" | "miss" | null>(null);

  // Scoring
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [correctRejections, setCorrectRejections] = useState(0);

  const responded = useRef(false);
  const startTime = useRef(Date.now());
  const reactionTimes = useRef<number[]>([]);
  const stimulusStart = useRef(0);

  useEffect(() => {
    if (current >= 0) {
      reportProgress(Math.round(((current + 1) / MAX_STIMULI) * 100));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (showTutorial) return;

    startTime.current = Date.now();
    let idx = 0;

    function showNext() {
      if (idx >= MAX_STIMULI) {
        setDone(true);
        setDisplayedEmoji(null);
        return;
      }

      setCurrent(idx);
      responded.current = false;
      stimulusStart.current = Date.now();
      setDisplayedEmoji(sequence[idx]);
      setFeedback(null);

      setTimeout(() => {
        const emoji = sequence[idx];
        const isTarget = emoji === TARGET_LETTER;

        if (isTarget && !responded.current) {
          // Miss: target shown, no response
          setMisses((m) => m + 1);
          setFeedback("miss");
        } else if (!isTarget && !responded.current) {
          // Correct rejection: non-target, no response (good!)
          setCorrectRejections((c) => c + 1);
        }

        setDisplayedEmoji(null);
        idx++;
        setTimeout(showNext, 200);
      }, stimulusInterval);
    }

    const t = setTimeout(showNext, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (!done) return;
    const totalTargets = sequence.filter((e) => e === TARGET_LETTER).length;
    // d' accuracy: (hits) / (hits + misses + falseAlarms)
    const accuracy = hits + misses + falseAlarms > 0 ? hits / (hits + misses + falseAlarms) : 0;
    const avgRT = reactionTimes.current.length > 0
      ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
      : stimulusInterval;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-sustentada", accuracy, undefined, difficulty);
    onComplete({
      exerciseId: "atencao-sustentada",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { hits, misses, falseAlarms, correctRejections, totalTargets, total: MAX_STIMULI },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleTap() {
    if (done || current < 0) return;
    const letter = sequence[current];
    const isTarget = letter === TARGET_LETTER;

    if (isTarget && !responded.current) {
      responded.current = true;
      const rt = Date.now() - stimulusStart.current;
      reactionTimes.current.push(rt);
      setHits((h) => h + 1);
      setFeedback("hit");
    } else if (!isTarget) {
      setFalseAlarms((f) => f + 1);
      setFeedback("false");
    }
  }

  if (showTutorial) {
    return <AtencaoSustentadaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const progress = current >= 0 ? ((current + 1) / MAX_STIMULI) * 100 : 0;
  const totalErrors = misses + falseAlarms;

  const bgClass = theme === "GAMIFIED"
    ? "bg-gray-950"
    : theme === "COLORFUL"
    ? "bg-gradient-to-br from-amber-50 to-orange-50"
    : "bg-gray-50";

  const cardClass = theme === "GAMIFIED"
    ? "bg-gray-800 border border-cyan-500/30"
    : "bg-white shadow-lg";

  const targetBoxClass = theme === "GAMIFIED"
    ? "bg-gray-700"
    : theme === "COLORFUL"
    ? "bg-amber-100 border border-amber-300"
    : "bg-gray-50 border border-gray-200";

  const stimulusBoxClass = theme === "GAMIFIED"
    ? "bg-gray-700 border border-gray-600"
    : theme === "COLORFUL"
    ? "bg-white border-2 border-orange-200"
    : "bg-gray-100 border-2 border-gray-300";

  const progressBarColor = theme === "GAMIFIED"
    ? "bg-cyan-500"
    : theme === "COLORFUL"
    ? "bg-amber-500"
    : "bg-blue-500";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${cardClass}`}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-4">
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>
            ✓ {hits}
          </span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>
            {Math.round(progress)}%
          </span>
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>
            ✗ {totalErrors}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-6 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${progressBarColor}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Target reminder */}
        <div className={`p-3 rounded-xl mb-4 flex items-center gap-3 ${targetBoxClass}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            theme === "GAMIFIED" ? "bg-gray-900/60" : "bg-white border border-gray-200"
          }`}>
            <span className={`text-3xl font-black ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{TARGET_LETTER}</span>
          </div>
          <div>
            <p className={`text-xs font-semibold ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              Toque quando aparecer:
            </p>
            <p className={`text-sm font-black ${theme === "GAMIFIED" ? "text-white" : "text-gray-800"}`}>
              A letra "{TARGET_LETTER}" — ignore as demais!
            </p>
          </div>
        </div>

        {/* Stimulus display */}
        <div
          className={`relative w-44 h-44 mx-auto rounded-3xl flex items-center justify-center mb-6 cursor-pointer select-none ${stimulusBoxClass}`}
          onClick={handleTap}
        >
          <AnimatePresence mode="wait">
            {displayedEmoji && (
              <motion.span
                key={displayedEmoji + current}
                className={`text-8xl font-black ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ duration: 0.09 }}
              >
                {displayedEmoji}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`absolute inset-0 rounded-3xl ${
                  feedback === "hit" ? "bg-green-500/30" :
                  feedback === "false" ? "bg-red-500/30" :
                  "bg-orange-500/20"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Instruction */}
        <p className={`text-center text-sm ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
          Toque na área acima quando aparecer a letra <strong>{TARGET_LETTER}</strong>
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>Acertos</p>
            <p className={`text-lg font-black ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>{hits}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>Falhas</p>
            <p className={`text-lg font-black ${theme === "GAMIFIED" ? "text-orange-400" : "text-orange-500"}`}>{misses}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>Falsos</p>
            <p className={`text-lg font-black ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>{falseAlarms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
