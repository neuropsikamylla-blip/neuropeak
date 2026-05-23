"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoDivididaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// 12 number stimuli + 12 letter stimuli = 24 total
const MAX_STIMULI = 24;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const VOWELS = ["A", "E", "I", "O", "U"];
const CONSONANTS = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "X", "Z"];

function isOdd(digit: string): boolean {
  return parseInt(digit, 10) % 2 !== 0;
}

function isVowel(letter: string): boolean {
  return VOWELS.includes(letter.toUpperCase());
}

// Timing per difficulty level (ms between stimulus switches)
function getStimulusInterval(difficulty: number): number {
  if (difficulty <= 2) return 2800;
  if (difficulty <= 4) return 2400;
  if (difficulty <= 7) return 2000;
  return 1600;
}

interface Stimulus {
  side: "left" | "right";
  value: string;
  shouldRespond: boolean; // true = patient MUST tap the button for this side
}

function buildStimulusSequence(): Stimulus[] {
  const seq: Stimulus[] = [];
  // 12 number stimuli (left) and 12 letter stimuli (right), interleaved
  const numbers: Stimulus[] = [];
  const letters: Stimulus[] = [];

  for (let i = 0; i < 12; i++) {
    // ~50% are odd (should respond)
    const shouldBeOdd = i % 2 === 0;
    if (shouldBeOdd) {
      const oddDigits = DIGITS.filter(isOdd);
      numbers.push({
        side: "left",
        value: oddDigits[Math.floor(Math.random() * oddDigits.length)],
        shouldRespond: true,
      });
    } else {
      const evenDigits = DIGITS.filter((d) => !isOdd(d));
      numbers.push({
        side: "left",
        value: evenDigits[Math.floor(Math.random() * evenDigits.length)],
        shouldRespond: false,
      });
    }
  }

  for (let i = 0; i < 12; i++) {
    // ~50% are vowels (should respond)
    const shouldBeVowel = i % 2 === 0;
    if (shouldBeVowel) {
      letters.push({
        side: "right",
        value: VOWELS[Math.floor(Math.random() * VOWELS.length)],
        shouldRespond: true,
      });
    } else {
      letters.push({
        side: "right",
        value: CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)],
        shouldRespond: false,
      });
    }
  }

  // Interleave: alternate between number and letter stimuli
  for (let i = 0; i < 12; i++) {
    seq.push(numbers[i]);
    seq.push(letters[i]);
  }

  return seq;
}

// ── Tutorial sub-components ────────────────────────────────────────────────

function TutorialNumberDemo({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [digit] = useState(() => {
    const oddDigits = DIGITS.filter(isOdd);
    return oddDigits[Math.floor(Math.random() * oddDigits.length)];
  });
  const [answered, setAnswered] = useState(false);

  function handleTap() {
    if (answered) return;
    setAnswered(true);
    setTimeout(onDone, 500);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`px-4 py-3 rounded-xl text-center ${
        theme === "GAMIFIED" ? "bg-blue-900/50 border border-blue-500/40" : "bg-blue-50 border border-blue-300"
      }`}>
        <p className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-blue-300" : "text-blue-700"}`}>NÚMEROS → toque se for ÍMPAR</p>
      </div>
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
        theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100 border-2 border-gray-300"
      }`}>
        <span className={`text-6xl font-black ${theme === "GAMIFIED" ? "text-blue-400" : "text-blue-600"}`}>{digit}</span>
      </div>
      <p className={`text-xs font-semibold ${theme === "GAMIFIED" ? "text-amber-300" : "text-amber-600"}`}>
        {digit} é ímpar — toque ÍMPAR!
      </p>
      <motion.button
        onClick={handleTap}
        disabled={answered}
        whileTap={{ scale: 0.93 }}
        className={`w-full py-3 rounded-xl font-black text-lg transition-colors ${
          answered ? "bg-green-500 text-white" :
          theme === "GAMIFIED" ? "bg-blue-600 text-white" :
          theme === "COLORFUL" ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
        }`}
      >
        ÍMPAR
      </motion.button>
    </div>
  );
}

function TutorialLetterDemo({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [letter] = useState(() => VOWELS[Math.floor(Math.random() * VOWELS.length)]);
  const [answered, setAnswered] = useState(false);

  function handleTap() {
    if (answered) return;
    setAnswered(true);
    setTimeout(onDone, 500);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`px-4 py-3 rounded-xl text-center ${
        theme === "GAMIFIED" ? "bg-rose-900/50 border border-rose-500/40" : "bg-rose-50 border border-rose-300"
      }`}>
        <p className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-rose-300" : "text-rose-700"}`}>LETRAS → toque se for VOGAL</p>
      </div>
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
        theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-100 border-2 border-gray-300"
      }`}>
        <span className={`text-6xl font-black ${theme === "GAMIFIED" ? "text-rose-400" : "text-rose-600"}`}>{letter}</span>
      </div>
      <p className={`text-xs font-semibold ${theme === "GAMIFIED" ? "text-amber-300" : "text-amber-600"}`}>
        {letter} é vogal — toque VOGAL!
      </p>
      <motion.button
        onClick={handleTap}
        disabled={answered}
        whileTap={{ scale: 0.93 }}
        className={`w-full py-3 rounded-xl font-black text-lg transition-colors ${
          answered ? "bg-green-500 text-white" :
          theme === "GAMIFIED" ? "bg-rose-600 text-white" :
          theme === "COLORFUL" ? "bg-rose-500 text-white" : "bg-rose-600 text-white"
        }`}
      >
        VOGAL
      </motion.button>
    </div>
  );
}

function AtencaoDivididaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "A tela fica dividida: NÚMEROS à esquerda, LETRAS à direita. Você precisa prestar atenção nos DOIS!",
      content: (onStepDone: () => void) => {
        useEffect(() => { const t = setTimeout(onStepDone, 3000); return () => clearTimeout(t); }, []);
        return (
          <div className="flex gap-2">
            {[
              { side: "NÚMEROS", sub: "toque se for ÍMPAR", color: theme === "GAMIFIED" ? "bg-blue-900/40 border-blue-500/40 text-blue-300" : "bg-blue-50 border-blue-300 text-blue-700" },
              { side: "LETRAS", sub: "toque se for VOGAL", color: theme === "GAMIFIED" ? "bg-rose-900/40 border-rose-500/40 text-rose-300" : "bg-rose-50 border-rose-300 text-rose-700" },
            ].map((s) => (
              <div key={s.side} className={`flex-1 p-3 rounded-xl border text-center ${s.color}`}>
                <p className="text-base font-black">{s.side}</p>
                <p className="text-xs mt-1 opacity-80">{s.sub}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      instruction: "Números: toque ÍMPAR quando aparecer um número ímpar (1, 3, 5, 7, 9).",
      content: (onStepDone: () => void) => <TutorialNumberDemo theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Letras: toque VOGAL quando aparecer uma vogal (A, E, I, O, U).",
      content: (onStepDone: () => void) => <TutorialLetterDemo theme={theme} onDone={onStepDone} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Dividida" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

type FeedbackType = "hit" | "false" | null;

export function AtencaoDividida({ difficulty, theme, onComplete }: AtencaoDivididaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const stimulusInterval = getStimulusInterval(difficulty);

  const [sequence] = useState(() => buildStimulusSequence());

  // Display state: what's currently shown on each side
  const [leftDisplay, setLeftDisplay] = useState<string | null>(null);
  const [rightDisplay, setRightDisplay] = useState<string | null>(null);
  const [currentStimulusIndex, setCurrentStimulusIndex] = useState(-1);
  const [done, setDone] = useState(false);

  // Feedback flashes per button
  const [leftFeedback, setLeftFeedback] = useState<FeedbackType>(null);
  const [rightFeedback, setRightFeedback] = useState<FeedbackType>(null);

  // Scoring
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [totalShouldRespond, setTotalShouldRespond] = useState(0);

  const respondedLeft = useRef(false);
  const respondedRight = useRef(false);
  const startTime = useRef(Date.now());
  const currentStimRef = useRef<Stimulus | null>(null);

  useEffect(() => {
    if (currentStimulusIndex >= 0) {
      reportProgress(Math.round(((currentStimulusIndex + 1) / MAX_STIMULI) * 100));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStimulusIndex]);

  useEffect(() => {
    if (showTutorial) return;

    startTime.current = Date.now();
    let idx = 0;

    function showNextStimulus() {
      if (idx >= MAX_STIMULI) {
        setLeftDisplay(null);
        setRightDisplay(null);
        setDone(true);
        return;
      }

      const stim = sequence[idx];
      currentStimRef.current = stim;
      setCurrentStimulusIndex(idx);

      if (stim.side === "left") {
        respondedLeft.current = false;
        setLeftDisplay(stim.value);
        setRightDisplay(null);
      } else {
        respondedRight.current = false;
        setRightDisplay(stim.value);
        setLeftDisplay(null);
      }

      if (stim.shouldRespond) {
        setTotalShouldRespond((n) => n + 1);
      }

      setTimeout(() => {
        // Check for miss
        const s = currentStimRef.current;
        if (s?.shouldRespond) {
          if (s.side === "left" && !respondedLeft.current) {
            setMisses((m) => m + 1);
          } else if (s.side === "right" && !respondedRight.current) {
            setMisses((m) => m + 1);
          }
        }
        setLeftDisplay(null);
        setRightDisplay(null);
        idx++;
        setTimeout(showNextStimulus, 200);
      }, stimulusInterval);
    }

    const t = setTimeout(showNextStimulus, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (!done) return;
    const totalResponses = hits + misses + falseAlarms;
    const accuracy = totalResponses > 0 ? hits / (hits + misses + falseAlarms) : 0;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-dividida", accuracy, undefined, difficulty);
    onComplete({
      exerciseId: "atencao-dividida",
      domain: "attention",
      score,
      accuracy,
      difficulty,
      duration,
      metadata: { hits, misses, falseAlarms, totalShouldRespond, total: MAX_STIMULI },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleLeftTap() {
    if (done) return;
    const stim = currentStimRef.current;
    if (!stim || stim.side !== "left") {
      // No left stimulus active — false alarm
      setFalseAlarms((f) => f + 1);
      setLeftFeedback("false");
      setTimeout(() => setLeftFeedback(null), 300);
      return;
    }
    if (stim.shouldRespond && !respondedLeft.current) {
      respondedLeft.current = true;
      setHits((h) => h + 1);
      setLeftFeedback("hit");
      setTimeout(() => setLeftFeedback(null), 300);
    } else if (!stim.shouldRespond) {
      setFalseAlarms((f) => f + 1);
      setLeftFeedback("false");
      setTimeout(() => setLeftFeedback(null), 300);
    }
  }

  function handleRightTap() {
    if (done) return;
    const stim = currentStimRef.current;
    if (!stim || stim.side !== "right") {
      // No right stimulus active — false alarm
      setFalseAlarms((f) => f + 1);
      setRightFeedback("false");
      setTimeout(() => setRightFeedback(null), 300);
      return;
    }
    if (stim.shouldRespond && !respondedRight.current) {
      respondedRight.current = true;
      setHits((h) => h + 1);
      setRightFeedback("hit");
      setTimeout(() => setRightFeedback(null), 300);
    } else if (!stim.shouldRespond) {
      setFalseAlarms((f) => f + 1);
      setRightFeedback("false");
      setTimeout(() => setRightFeedback(null), 300);
    }
  }

  if (showTutorial) {
    return <AtencaoDivididaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const progress = currentStimulusIndex >= 0 ? ((currentStimulusIndex + 1) / MAX_STIMULI) * 100 : 0;
  const totalErrors = misses + falseAlarms;

  const bgClass = theme === "GAMIFIED"
    ? "bg-gray-950"
    : theme === "COLORFUL"
    ? "bg-gradient-to-br from-blue-50 to-rose-50"
    : "bg-gray-50";

  const cardClass = theme === "GAMIFIED"
    ? "bg-gray-800 border border-cyan-500/30"
    : "bg-white shadow-lg";

  const panelLeft = theme === "GAMIFIED"
    ? "bg-blue-950/60 border border-blue-700/50"
    : theme === "COLORFUL"
    ? "bg-blue-100 border-2 border-blue-300"
    : "bg-blue-50 border-2 border-blue-200";

  const panelRight = theme === "GAMIFIED"
    ? "bg-rose-950/60 border border-rose-700/50"
    : theme === "COLORFUL"
    ? "bg-rose-100 border-2 border-rose-300"
    : "bg-rose-50 border-2 border-rose-200";

  const leftTextColor = theme === "GAMIFIED" ? "text-blue-300" : "text-blue-600";
  const rightTextColor = theme === "GAMIFIED" ? "text-rose-300" : "text-rose-600";

  const btnLeft = theme === "GAMIFIED"
    ? "bg-blue-600 text-white active:bg-blue-500"
    : theme === "COLORFUL"
    ? "bg-blue-500 text-white"
    : "bg-blue-600 text-white";

  const btnRight = theme === "GAMIFIED"
    ? "bg-rose-600 text-white active:bg-rose-500"
    : theme === "COLORFUL"
    ? "bg-rose-500 text-white"
    : "bg-rose-600 text-white";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${cardClass}`}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-3">
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>✓ {hits}</span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>
            {Math.max(0, currentStimulusIndex + 1)}/{MAX_STIMULI}
          </span>
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>✗ {totalErrors}</span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${theme === "GAMIFIED" ? "bg-cyan-500" : "bg-indigo-500"}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Dual panels */}
        <div className="flex gap-3 mb-5">
          {/* Left – Numbers */}
          <div className={`flex-1 rounded-xl p-3 flex flex-col items-center gap-2 ${panelLeft}`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${leftTextColor}`}>Números</p>
            <div className={`w-full h-20 rounded-lg flex items-center justify-center ${
              theme === "GAMIFIED" ? "bg-gray-900/60" : "bg-white/70"
            }`}>
              <AnimatePresence mode="wait">
                {leftDisplay !== null && (
                  <motion.span
                    key={leftDisplay + currentStimulusIndex}
                    className={`text-5xl font-black ${leftTextColor}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {leftDisplay}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className={`text-xs opacity-70 ${leftTextColor}`}>toque se ÍMPAR</p>
          </div>

          {/* Right – Letters */}
          <div className={`flex-1 rounded-xl p-3 flex flex-col items-center gap-2 ${panelRight}`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${rightTextColor}`}>Letras</p>
            <div className={`w-full h-20 rounded-lg flex items-center justify-center ${
              theme === "GAMIFIED" ? "bg-gray-900/60" : "bg-white/70"
            }`}>
              <AnimatePresence mode="wait">
                {rightDisplay !== null && (
                  <motion.span
                    key={rightDisplay + currentStimulusIndex}
                    className={`text-5xl font-black ${rightTextColor}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {rightDisplay}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className={`text-xs opacity-70 ${rightTextColor}`}>toque se VOGAL</p>
          </div>
        </div>

        {/* Response buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleLeftTap}
            whileTap={{ scale: 0.94 }}
            className={`flex-1 py-5 rounded-2xl font-black text-xl relative overflow-hidden ${btnLeft}`}
          >
            ÍMPAR
            <AnimatePresence>
              {leftFeedback && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${leftFeedback === "hit" ? "bg-green-400/40" : "bg-red-400/40"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            onClick={handleRightTap}
            whileTap={{ scale: 0.94 }}
            className={`flex-1 py-5 rounded-2xl font-black text-xl relative overflow-hidden ${btnRight}`}
          >
            VOGAL
            <AnimatePresence>
              {rightFeedback && (
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${rightFeedback === "hit" ? "bg-green-400/40" : "bg-red-400/40"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
