"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface TempoReacaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Balloon {
  id: number;
  isTarget: boolean;
  color: string;
  x: number;       // % from left
  size: number;    // px diameter
  duration: number; // ms to cross the play area
  spawnedAt: number;
}

const GREEN = "#16a34a";
const DISTRACTOR_COLORS = ["#dc2626", "#2563eb", "#9333ea", "#ea580c", "#0891b2"];

const MAX_TRIALS = 20;

function speedMs(difficulty: number) {
  // 5000ms (easiest) → 2200ms (hardest)
  return Math.round(5000 - ((difficulty - 1) / 9) * 2800);
}

function distractorCount(difficulty: number) {
  // 0 at diff 1-2 → 4 at diff 9-10
  return Math.min(4, Math.floor((difficulty - 1) / 2));
}

let _uid = 0;
function makeBalloon(isTarget: boolean, ms: number): Balloon {
  return {
    id: ++_uid,
    isTarget,
    color: isTarget ? GREEN : DISTRACTOR_COLORS[Math.floor(Math.random() * DISTRACTOR_COLORS.length)],
    x: 4 + Math.random() * 78,
    size: 62 + Math.random() * 22,
    duration: ms * (0.85 + Math.random() * 0.3),
    spawnedAt: Date.now(),
  };
}

export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps) {
  const reportProgress = useExerciseProgress();

  const [started, setStarted] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [results, setResults] = useState<{ correct: boolean; rt: number | null }[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null); // balloon id that was wrong-clicked
  const [missFlash, setMissFlash] = useState(false);

  const resolvedIds = useRef(new Set<number>());
  const resultsRef = useRef<{ correct: boolean; rt: number | null }[]>([]);
  const doneRef = useRef(false);
  const startTime = useRef(Date.now());
  const nextSpawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ms = speedMs(difficulty);
  const nd = distractorCount(difficulty);

  const recordResult = useCallback((correct: boolean, rt: number | null) => {
    if (doneRef.current) return;

    const newResults = [...resultsRef.current, { correct, rt }];
    resultsRef.current = newResults;
    setResults(newResults);
    reportProgress(Math.round((newResults.length / MAX_TRIALS) * 100));

    if (newResults.length >= MAX_TRIALS) {
      doneRef.current = true;
      if (nextSpawnTimer.current) clearTimeout(nextSpawnTimer.current);

      const hits = newResults.filter((r) => r.correct && r.rt !== null);
      const avgRT = hits.length > 0 ? hits.reduce((s, r) => s + (r.rt ?? 0), 0) / hits.length : 1000;
      const accuracy = newResults.filter((r) => r.correct).length / MAX_TRIALS;
      const dur = Math.round((Date.now() - startTime.current) / 1000);
      const score = calculateExerciseScore("tempo-reacao", accuracy, avgRT, difficulty);

      setTimeout(() => {
        onComplete({
          exerciseId: "tempo-reacao",
          domain: "processing",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration: dur,
          metadata: { trials: MAX_TRIALS, avgRT, correct: hits.length },
        });
      }, 1500);
    }
  }, [difficulty, onComplete, reportProgress]);

  const spawnBatch = useCallback(() => {
    if (doneRef.current) return;
    if (resultsRef.current.length >= MAX_TRIALS) return;

    const batch: Balloon[] = [makeBalloon(true, ms)];
    for (let i = 0; i < nd; i++) batch.push(makeBalloon(false, ms));
    setBalloons((prev) => [...prev, ...batch]);
  }, [ms, nd]);

  function start() {
    setStarted(true);
    startTime.current = Date.now();
    spawnBatch();
  }

  useEffect(() => () => {
    if (nextSpawnTimer.current) clearTimeout(nextSpawnTimer.current);
  }, []);

  function handleBalloonClick(balloon: Balloon) {
    if (!started || doneRef.current) return;
    if (resolvedIds.current.has(balloon.id)) return;
    if (resultsRef.current.length >= MAX_TRIALS) return;

    resolvedIds.current.add(balloon.id);
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.isTarget) {
      const rt = Date.now() - balloon.spawnedAt;
      recordResult(true, rt);
      // Spawn next batch after short delay
      nextSpawnTimer.current = setTimeout(spawnBatch, 700);
    } else {
      setWrongId(balloon.id);
      setTimeout(() => setWrongId(null), 500);
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 350);
      recordResult(false, null);
    }
  }

  function handleBalloonExit(balloon: Balloon) {
    if (resolvedIds.current.has(balloon.id)) return;
    resolvedIds.current.add(balloon.id);
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.isTarget && started && !doneRef.current) {
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 350);
      recordResult(false, null);
      nextSpawnTimer.current = setTimeout(spawnBatch, 700);
    }
  }

  const bg =
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-b from-sky-100 to-blue-200" :
    "bg-gray-100";

  const cardClass =
    theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-md";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-sky-700" :
    "text-gray-900";

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col p-3 transition-colors ${bg} ${missFlash ? "!bg-red-200" : ""}`}>
      {/* Header card */}
      <div className={`rounded-2xl p-3 mb-3 ${cardClass}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`font-bold text-base ${titleClass}`}>🎈 Balões</h2>
            <p className={`text-xs ${subClass}`}>Toque apenas nos balões <span className="font-bold text-green-600">VERDES</span></p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === results.length ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Play area */}
      <div
        className={`relative flex-1 rounded-2xl overflow-hidden ${
          theme === "GAMIFIED" ? "bg-gray-900" : "bg-white/40"
        }`}
        style={{ minHeight: "65vh" }}
      >
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className={`text-sm text-center px-6 ${subClass}`}>
              Balões coloridos vão cair. Toque <strong className="text-green-600">só nos verdes</strong>!
            </p>
            <button
              onClick={start}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform ${
                theme === "GAMIFIED"
                  ? "bg-cyan-500 text-gray-900"
                  : "bg-green-500 text-white"
              }`}
            >
              🎈 Começar
            </button>
          </div>
        )}

        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: -balloon.size * 1.4 }}
              animate={{ y: "110vh" }}
              transition={{ duration: balloon.duration / 1000, ease: "linear" }}
              onAnimationComplete={() => handleBalloonExit(balloon)}
              style={{
                position: "absolute",
                left: `${balloon.x}%`,
                top: 0,
                width: balloon.size,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                touchAction: "none",
              }}
              onClick={() => handleBalloonClick(balloon)}
            >
              {/* Balloon body */}
              <div
                style={{
                  width: balloon.size,
                  height: balloon.size,
                  backgroundColor: balloon.color,
                  borderRadius: "50% 50% 48% 52% / 55% 55% 45% 45%",
                  boxShadow: `inset -6px -6px 14px rgba(0,0,0,0.22), inset 6px 6px 10px rgba(255,255,255,0.35)`,
                  position: "relative",
                }}
              >
                {/* Highlight spot */}
                <div
                  style={{
                    position: "absolute",
                    top: "18%",
                    left: "20%",
                    width: "28%",
                    height: "18%",
                    backgroundColor: "rgba(255,255,255,0.45)",
                    borderRadius: "50%",
                    transform: "rotate(-30deg)",
                  }}
                />
              </div>
              {/* Knot */}
              <div
                style={{
                  width: 8,
                  height: 6,
                  backgroundColor: balloon.color,
                  borderRadius: "0 0 4px 4px",
                  marginTop: -1,
                }}
              />
              {/* String */}
              <div
                style={{
                  width: 1.5,
                  height: 18,
                  backgroundColor: "#6b7280",
                  opacity: 0.7,
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
