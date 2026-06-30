"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoDivididaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// 24 number stimuli + 24 letter stimuli = 48 total
const MAX_STIMULI = 48;
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

function DivididaIntroStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
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
}

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
      content: (onStepDone: () => void) => <DivididaIntroStep theme={theme} onDone={onStepDone} />,
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
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
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
    if (showTutorial) return;

    startTime.current = Date.now();
    begin();
    let idx = 0;

    function showNextStimulus() {
      if (isTimeUp()) {
        setLeftDisplay(null);
        setRightDisplay(null);
        setDone(true);
        return;
      }

      const stim = sequence[idx % sequence.length];
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
    finish();
    const duration = elapsedSec();
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

  const progress = progressPct;
  const totalErrors = misses + falseAlarms;
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const bgStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const panelLeftStyle: React.CSSProperties = isGamified
    ? { background: "rgba(37,99,235,0.15)", border: "1.5px solid rgba(59,130,246,0.4)", borderRadius: 14 }
    : { background: isColorful ? "#dbeafe" : "#eff6ff", border: isColorful ? "1.5px solid #93c5fd" : "1.5px solid #bfdbfe", borderRadius: 14 };

  const panelRightStyle: React.CSSProperties = isGamified
    ? { background: "rgba(190,18,60,0.15)", border: "1.5px solid rgba(244,63,94,0.4)", borderRadius: 14 }
    : { background: isColorful ? "#ffe4e6" : "#fff1f2", border: isColorful ? "1.5px solid #fda4af" : "1.5px solid #fecdd3", borderRadius: 14 };

  const stimBoxStyle: React.CSSProperties = isGamified
    ? { background: "rgba(0,0,0,0.3)", borderRadius: 10 }
    : { background: "rgba(255,255,255,0.7)", borderRadius: 10 };

  const leftColor = isGamified ? "#93c5fd" : "#2563eb";
  const rightColor = isGamified ? "#fda4af" : "#e11d48";

  const btnLeftStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
    borderRadius: 9999, color: "white",
    boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
  };

  const btnRightStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #be123c, #9f1239)",
    borderRadius: 9999, color: "white",
    boxShadow: "0 4px 16px rgba(190,18,60,0.4)",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={bgStyle}>
      <div className="w-full max-w-md p-5" style={cardStyle}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-3">
          <span className="font-bold" style={{ color: "#22c55e" }}>✓ {hits}</span>
          <span style={{ color: isGamified ? "rgba(255,255,255,0.6)" : "#8a7a6a" }}>
            {Math.max(0, currentStimulusIndex + 1)}/{MAX_STIMULI}
          </span>
          <span className="font-bold" style={{ color: "#ef4444" }}>✗ {totalErrors}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-4" style={{ background: isGamified ? "rgba(255,255,255,0.1)" : "rgba(26,45,80,0.1)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: isGamified ? "#06b6d4" : "#6366f1" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Dual panels */}
        <div className="flex gap-3 mb-5">
          {/* Left – Numbers */}
          <div className="flex-1 p-3 flex flex-col items-center gap-2" style={panelLeftStyle}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: leftColor }}>Números</p>
            <div className="w-full h-20 flex items-center justify-center" style={stimBoxStyle}>
              <AnimatePresence mode="wait">
                {leftDisplay !== null && (
                  <motion.span
                    key={leftDisplay + currentStimulusIndex}
                    className="text-5xl font-black"
                    style={{ color: leftColor }}
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
            <p className="text-xs" style={{ color: leftColor, opacity: 0.8 }}>toque se ÍMPAR</p>
          </div>

          {/* Right – Letters */}
          <div className="flex-1 p-3 flex flex-col items-center gap-2" style={panelRightStyle}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: rightColor }}>Letras</p>
            <div className="w-full h-20 flex items-center justify-center" style={stimBoxStyle}>
              <AnimatePresence mode="wait">
                {rightDisplay !== null && (
                  <motion.span
                    key={rightDisplay + currentStimulusIndex}
                    className="text-5xl font-black"
                    style={{ color: rightColor }}
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
            <p className="text-xs" style={{ color: rightColor, opacity: 0.8 }}>toque se VOGAL</p>
          </div>
        </div>

        {/* Response buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleLeftTap}
            whileTap={{ scale: 0.94 }}
            className="flex-1 py-5 font-black text-xl relative overflow-hidden"
            style={{ ...btnLeftStyle, borderRadius: 16 }}
          >
            ÍMPAR
            <AnimatePresence>
              {leftFeedback && (
                <motion.div
                  className="absolute inset-0"
                  style={{ borderRadius: 16, background: leftFeedback === "hit" ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)" }}
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
            className="flex-1 py-5 font-black text-xl relative overflow-hidden"
            style={{ ...btnRightStyle, borderRadius: 16 }}
          >
            VOGAL
            <AnimatePresence>
              {rightFeedback && (
                <motion.div
                  className="absolute inset-0"
                  style={{ borderRadius: 16, background: rightFeedback === "hit" ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)" }}
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
