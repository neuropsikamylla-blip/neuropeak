"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface SemaforoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type LightColor = "red" | "yellow" | "green";
type Position = 0 | 1 | 2; // left, center, right

interface TrafficLightProps {
  activeColor: LightColor | null; // null = all off
  isTarget: boolean;
  isBlinking: boolean;
}

const TOTAL_TRIALS = 60;
// All lights blink for this duration before the target reveals its color
const BLINK_DURATION = 1500; // ms

function lightOnMs(difficulty: number): number {
  if (difficulty <= 2) return 3500;
  if (difficulty <= 5) return 2200;
  if (difficulty <= 8) return 1400;
  return 900;
}

function randomLightColor(): LightColor {
  const r = Math.random();
  if (r < 0.45) return "green";
  if (r < 0.9) return "red";
  return "yellow";
}

function randomDistractorColor(): LightColor {
  const colors: LightColor[] = ["red", "yellow", "green"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function isGoSignal(color: LightColor): boolean {
  return color === "green";
}

// ─── TrafficLight component ───────────────────────────────────────────────────

function TrafficLight({ activeColor, isTarget, isBlinking }: TrafficLightProps) {
  const lights: { color: LightColor; fill: string; glow: string }[] = [
    { color: "red",    fill: "#ef4444", glow: "0 0 18px 6px #ef4444" },
    { color: "yellow", fill: "#eab308", glow: "0 0 18px 6px #eab308" },
    { color: "green",  fill: "#22c55e", glow: "0 0 18px 6px #22c55e" },
  ];

  return (
    <motion.div
      animate={isBlinking ? { opacity: [1, 0.1, 1] } : { opacity: 1 }}
      transition={isBlinking ? { duration: 0.25, repeat: 5, repeatType: "mirror" } : { duration: 0.1 }}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: 72,
          height: 190,
          backgroundColor: "#111827",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: "10px 0",
          border: isTarget ? "2.5px solid #facc15" : "2px solid #374151",
          boxShadow: isTarget ? "0 0 14px 3px rgba(250,204,21,0.45)" : "none",
        }}
      >
        {lights.map(({ color, fill, glow }) => {
          const isOn = activeColor === color;
          return (
            <div
              key={color}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: isOn ? fill : "#1f2937",
                opacity: isOn ? 1 : 0.18,
                boxShadow: isOn ? glow : "none",
                transition: "background-color 0.08s, box-shadow 0.08s, opacity 0.08s",
              }}
            />
          );
        })}
      </div>
      <div style={{ width: 8, height: 28, backgroundColor: "#374151", borderRadius: "0 0 4px 4px" }} />
    </motion.div>
  );
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────

function SemaforoTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Quando o semáforo piscar e acender VERDE → toque AVANÇAR!",
      content: (onStepDone: () => void) => (
        <TutorialStepGreen onDone={onStepDone} />
      ),
    },
    {
      instruction: "Quando acender VERMELHO (ou amarelo) → toque PARAR!",
      content: (onStepDone: () => void) => (
        <TutorialStepRed onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Semáforo" steps={steps} onDone={onDone} />;
}

function TutorialStepGreen({ onDone }: { onDone: () => void }) {
  const [tapped, setTapped] = useState(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  function handleAdvance() {
    if (tapped) return;
    setTapped(true);
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(onDone, 500);
  }

  function handleStop() {
    // wrong button — do nothing, let user try again
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center">
        <TrafficLight activeColor="green" isTarget={true} isBlinking={false} />
      </div>
      {!tapped ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={handleAdvance}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-green-500 text-white active:scale-95 transition-transform"
          >
            🟢 AVANÇAR
          </button>
          <button
            onClick={handleStop}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-blue-900 text-white active:scale-95 transition-transform opacity-50"
          >
            🔴 PARAR
          </button>
        </div>
      ) : (
        <p className="text-green-500 font-bold text-base">Perfeito! ✓</p>
      )}
    </div>
  );
}

function TutorialStepRed({ onDone }: { onDone: () => void }) {
  const [tapped, setTapped] = useState(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  function handleStop() {
    if (tapped) return;
    setTapped(true);
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(onDone, 500);
  }

  function handleAdvance() {
    // wrong button — ignore
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center">
        <TrafficLight activeColor="red" isTarget={true} isBlinking={false} />
      </div>
      {!tapped ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={handleAdvance}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-green-500 text-white active:scale-95 transition-transform opacity-50"
          >
            🟢 AVANÇAR
          </button>
          <button
            onClick={handleStop}
            className="flex-1 py-3 rounded-2xl font-bold text-base bg-blue-900 text-white active:scale-95 transition-transform"
          >
            🔴 PARAR
          </button>
        </div>
      ) : (
        <p className="text-green-500 font-bold text-base">Ótimo! ✓</p>
      )}
    </div>
  );
}

// ─── Main exercise ─────────────────────────────────────────────────────────────

type Phase = "idle" | "blinking" | "active" | "feedback";

interface RoundState {
  targetPos: Position;
  targetColor: LightColor;
  distractors: [LightColor, LightColor];
}

export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<RoundState | null>(null);
  const [results, setResults] = useState<{ correct: boolean; rt: number | null }[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const resultsRef = useRef<{ correct: boolean; rt: number | null }[]>([]);
  const doneRef = useRef(false);
  const roundActiveAt = useRef<number>(0);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(Date.now());
  const respondedRef = useRef(false);

  const onMs = lightOnMs(difficulty);
  const distractorsAlsoBlink = difficulty > 5;

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => () => {
    [blinkTimer, activeTimer, feedbackTimer, finishTimer].forEach((r) => {
      if (r.current) clearTimeout(r.current);
    });
  }, []);

  // ─── Finish game ──────────────────────────────────────────────────────────
  const finishGame = useCallback(
    (finalResults: { correct: boolean; rt: number | null }[]) => {
      if (doneRef.current) return;
      doneRef.current = true;

      const hits = finalResults.filter((r) => r.correct && r.rt !== null);
      const avgRT =
        hits.length > 0
          ? hits.reduce((s, r) => s + (r.rt ?? 0), 0) / hits.length
          : 1500;
      const accuracy = finalResults.filter((r) => r.correct).length / TOTAL_TRIALS;
      const dur = Math.round((Date.now() - startTime.current) / 1000);
      const score = calculateExerciseScore("semaforo", accuracy, avgRT, difficulty);

      finishTimer.current = setTimeout(() => {
        onComplete({
          exerciseId: "semaforo",
          domain: "processing",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration: dur,
          metadata: { trials: TOTAL_TRIALS, avgRT, correct: hits.length },
        });
      }, 1200);
    },
    [difficulty, onComplete]
  );

  // ─── Start a new round ────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    if (doneRef.current) return;

    const targetPos = ([0, 1, 2] as Position[])[Math.floor(Math.random() * 3)];
    const targetColor = randomLightColor();
    const distColors: [LightColor, LightColor] = [randomDistractorColor(), randomDistractorColor()];
    const newRound: RoundState = { targetPos, targetColor, distractors: distColors };

    setRound(newRound);
    setPhase("blinking"); // all 3 lights blink yellow — target unknown
    respondedRef.current = false;

    // After BLINK_DURATION, reveal target color (Framer Motion handles the visual blink)
    if (blinkTimer.current) clearTimeout(blinkTimer.current);
    blinkTimer.current = setTimeout(() => {
      setPhase("active");
      roundActiveAt.current = Date.now();

      if (activeTimer.current) clearTimeout(activeTimer.current);
      activeTimer.current = setTimeout(() => {
        if (!respondedRef.current && !doneRef.current) {
          respondedRef.current = true;
          handleResponse(false, newRound);
        }
      }, onMs);
    }, BLINK_DURATION + 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMs]);

  // ─── Handle a button press ────────────────────────────────────────────────
  const handleResponse = useCallback(
    (pressedAdvance: boolean, currentRound: RoundState) => {
      if (activeTimer.current) clearTimeout(activeTimer.current);

      const rt = roundActiveAt.current ? Date.now() - roundActiveAt.current : null;
      const shouldAdvance = isGoSignal(currentRound.targetColor);
      const correct = pressedAdvance === shouldAdvance;

      const newResults = [...resultsRef.current, { correct, rt: correct ? rt : null }];
      resultsRef.current = newResults;
      setResults(newResults);
      reportProgress(Math.round((newResults.length / TOTAL_TRIALS) * 100));

      setFeedback(correct ? "correct" : "wrong");
      setPhase("feedback");

      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        if (newResults.length >= TOTAL_TRIALS) {
          finishGame(newResults);
        } else {
          startRound();
        }
      }, 500);
    },
    [finishGame, reportProgress, startRound]
  );

  function onPressAdvance() {
    if (phase !== "active" || respondedRef.current || !round) return;
    respondedRef.current = true;
    handleResponse(true, round);
  }

  function onPressStop() {
    if (phase !== "active" || respondedRef.current || !round) return;
    respondedRef.current = true;
    handleResponse(false, round);
  }

  function start() {
    setStarted(true);
    startTime.current = Date.now();
    startRound();
  }

  // ─── Tutorial gate ────────────────────────────────────────────────────────
  if (showTutorial) {
    return <SemaforoTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  // ─── Build per-slot data ──────────────────────────────────────────────────
  const slots: { activeColor: LightColor | null; isTarget: boolean; isBlinking: boolean }[] =
    [0, 1, 2].map((idx) => {
      if (!round || !started) return { activeColor: null, isTarget: false, isBlinking: false };

      if (phase === "blinking") {
        // All 3 blink yellow — no hint which is the target
        return { activeColor: "yellow", isTarget: false, isBlinking: true };
      }

      const isTarget = idx === round.targetPos;
      if (isTarget) {
        return { activeColor: round.targetColor, isTarget: true, isBlinking: false };
      }

      // Distractors: at high difficulty show their colors too (harder to spot the target)
      const distIdx = idx < round.targetPos ? idx : idx - 1;
      const distColor = round.distractors[distIdx] ?? "red";
      return {
        activeColor: distractorsAlsoBlink ? distColor : null,
        isTarget: false,
        isBlinking: false,
      };
    });

  // ─── Feedback flash color ─────────────────────────────────────────────────
  const flashClass =
    feedback === "correct"
      ? "!bg-green-900"
      : feedback === "wrong"
      ? "!bg-red-900"
      : "";

  return (
    <div
      className={`min-h-screen flex flex-col bg-gray-900 transition-colors duration-150 ${flashClass}`}
    >
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 pt-4 pb-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="font-bold text-base text-yellow-400">🚦 Semáforo</h2>
            <p className="text-xs text-gray-400">
              Verde →{" "}
              <span className="font-bold text-green-400">AVANÇAR</span>
              {"  •  "}
              Vermelho →{" "}
              <span className="font-bold text-red-400">PARAR</span>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {results.length}/{TOTAL_TRIALS}
          </p>
        </div>
        {/* Progress bar */}
        <div className="flex gap-0.5">
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct
                    ? "bg-green-500"
                    : "bg-red-500"
                  : i === results.length
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Play area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-10">
        {!started ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-gray-300 text-sm text-center px-4">
              Um semáforo vai piscar e acender. Toque{" "}
              <span className="text-green-400 font-bold">AVANÇAR</span> no verde e{" "}
              <span className="text-red-400 font-bold">PARAR</span> no vermelho ou amarelo.
            </p>
            <button
              onClick={start}
              className="px-10 py-4 rounded-2xl font-bold text-lg bg-yellow-400 text-gray-900 shadow-lg active:scale-95 transition-transform"
            >
              🚦 Começar
            </button>
          </div>
        ) : (
          <>
            {/* Three traffic lights */}
            <div className="flex gap-6 items-end justify-center">
              {slots.map((slot, idx) => (
                <TrafficLight
                  key={idx}
                  activeColor={slot.activeColor}
                  isTarget={slot.isTarget}
                  isBlinking={slot.isBlinking}
                />
              ))}
            </div>

            {/* Feedback label */}
            <div className="h-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.p
                    key={feedback}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`font-bold text-lg ${
                      feedback === "correct" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {feedback === "correct" ? "✓ Certo!" : "✗ Errado!"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 w-full max-w-xs">
              <button
                onPointerDown={onPressAdvance}
                className={`flex-1 py-5 rounded-2xl font-bold text-base transition-transform active:scale-95 select-none ${
                  phase === "active"
                    ? "bg-green-500 text-white shadow-lg shadow-green-900/50"
                    : "bg-green-900 text-green-700 cursor-not-allowed"
                }`}
              >
                🟢{"\n"}AVANÇAR
              </button>
              <button
                onPointerDown={onPressStop}
                className={`flex-1 py-5 rounded-2xl font-bold text-base transition-transform active:scale-95 select-none ${
                  phase === "active"
                    ? "bg-blue-900 text-white shadow-lg shadow-blue-950/60"
                    : "bg-blue-950 text-blue-800 cursor-not-allowed"
                }`}
              >
                🔴{"\n"}PARAR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
