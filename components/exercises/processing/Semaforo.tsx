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

const TOTAL_TRIALS = 20;
const BLINK_COUNT = 3;
const BLINK_INTERVAL = 150; // ms on/off

function lightOnMs(difficulty: number): number {
  if (difficulty <= 3) return 3000;
  if (difficulty <= 6) return 2000;
  return 1200;
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

// ─── TrafficLight SVG component ──────────────────────────────────────────────

function TrafficLight({ activeColor, isTarget, isBlinking }: TrafficLightProps) {
  const lights: { color: LightColor; fill: string; glow: string }[] = [
    { color: "red",    fill: "#ef4444", glow: "0 0 18px 6px #ef4444" },
    { color: "yellow", fill: "#eab308", glow: "0 0 18px 6px #eab308" },
    { color: "green",  fill: "#22c55e", glow: "0 0 18px 6px #22c55e" },
  ];

  return (
    <motion.div
      animate={isBlinking ? { opacity: [1, 0.15, 1] } : { opacity: 1 }}
      transition={
        isBlinking
          ? { duration: BLINK_INTERVAL / 500, repeat: BLINK_COUNT * 2, repeatType: "mirror" }
          : { duration: 0.1 }
      }
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
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
          border: isTarget
            ? "2.5px solid #facc15"
            : "2px solid #374151",
          boxShadow: isTarget
            ? "0 0 14px 3px rgba(250,204,21,0.45)"
            : "none",
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
      {/* Pole */}
      <div
        style={{
          width: 8,
          height: 28,
          backgroundColor: "#374151",
          borderRadius: "0 0 4px 4px",
        }}
      />
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

  function handleAdvance() {
    if (tapped) return;
    setTapped(true);
    setTimeout(onDone, 500);
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

  function handleStop() {
    if (tapped) return;
    setTapped(true);
    setTimeout(onDone, 500);
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
  distractors: [LightColor, LightColor]; // colors for the two non-target slots
  showLight: boolean; // toggled during blinking phase
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
  const startTime = useRef<number>(Date.now());
  const respondedRef = useRef(false);

  const onMs = lightOnMs(difficulty);
  const distractorsAlsoBlink = difficulty > 5;

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => () => {
    [blinkTimer, activeTimer, feedbackTimer].forEach((r) => {
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

      setTimeout(() => {
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

    const positions: Position[] = [0, 1, 2];
    const targetPos = positions[Math.floor(Math.random() * 3)] as Position;
    const targetColor = randomLightColor();

    // Build distractor colors (indices that are NOT targetPos)
    const distColors: LightColor[] = [randomDistractorColor(), randomDistractorColor()];

    const newRound: RoundState = {
      targetPos,
      targetColor,
      distractors: [distColors[0], distColors[1]],
      showLight: false,
    };

    setRound(newRound);
    setPhase("blinking");
    respondedRef.current = false;

    // Blink the target light BLINK_COUNT times
    let blinksDone = 0;
    const totalBlinks = BLINK_COUNT * 2; // on + off per blink

    function doBlink() {
      blinksDone++;
      setRound((prev) =>
        prev ? { ...prev, showLight: blinksDone % 2 === 1 } : prev
      );

      if (blinksDone < totalBlinks) {
        blinkTimer.current = setTimeout(doBlink, BLINK_INTERVAL);
      } else {
        // All blinks done — light stays on
        setRound((prev) => (prev ? { ...prev, showLight: true } : prev));
        setPhase("active");
        roundActiveAt.current = Date.now();

        // Auto-timeout: treat as miss
        activeTimer.current = setTimeout(() => {
          if (!respondedRef.current && !doneRef.current) {
            respondedRef.current = true;
            handleResponse(false, newRound);
          }
        }, onMs);
      }
    }

    blinkTimer.current = setTimeout(doBlink, BLINK_INTERVAL);
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
  // slots: index 0 = left, 1 = center, 2 = right
  // For each slot, compute (activeColor, isTarget, isBlinking)
  const slots: { activeColor: LightColor | null; isTarget: boolean; isBlinking: boolean }[] =
    [0, 1, 2].map((idx) => {
      if (!round || !started) {
        return { activeColor: null, isTarget: false, isBlinking: false };
      }

      const isTarget = idx === round.targetPos;

      if (isTarget) {
        const showColor = round.showLight ? round.targetColor : null;
        return { activeColor: showColor, isTarget: true, isBlinking: false };
      }

      // Distractor
      const distIdx = idx < round.targetPos ? idx : idx - 1;
      const distColor = round.distractors[distIdx] ?? "red";

      const distIsBlinking = distractorsAlsoBlink && phase === "blinking";
      const showDistColor =
        phase === "active" || (phase === "blinking" && round.showLight)
          ? distColor
          : null;

      return {
        activeColor: distIsBlinking ? (round.showLight ? distColor : null) : showDistColor,
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
