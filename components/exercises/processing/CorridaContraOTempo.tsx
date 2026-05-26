"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import {
  SUPER_ITEMS, CAT_LABELS, CAT_EMOJIS, shuffleSM, itemsByCategory, ALL_CATEGORIES,
  type Category,
} from "@/lib/supermarket-data";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

interface GridItem { id: string; name: string; emoji: string; isTarget: boolean; collected: boolean; }

const MAX_ROUNDS = 8;

function gridCount(d: number) { return d <= 4 ? 12 : 16; }
function targetCount(d: number) { return d <= 3 ? 4 : d <= 6 ? 5 : 6; }
function timeSecs(d: number) { return d <= 3 ? 25 : d <= 6 ? 20 : 15; }

function buildGrid(cat: Category, d: number): GridItem[] {
  const nT = targetCount(d);
  const size = gridCount(d);
  const targets = shuffleSM(itemsByCategory(cat)).slice(0, nT);
  const dist = shuffleSM(SUPER_ITEMS.filter(i => i.cat !== cat)).slice(0, size - nT);
  return shuffleSM([
    ...targets.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, isTarget: true, collected: false })),
    ...dist.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, isTarget: false, collected: false })),
  ]);
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const ITEMS = [
    { id: "a", emoji: "🍌", name: "Banana", isTarget: true },
    { id: "b", emoji: "🧴", name: "Sabão",  isTarget: false },
    { id: "c", emoji: "🍎", name: "Maçã",   isTarget: true },
    { id: "d", emoji: "🥤", name: "Refri",  isTarget: false },
    { id: "e", emoji: "🥕", name: "Cenoura",isTarget: true },
    { id: "f", emoji: "☕", name: "Café",    isTarget: false },
  ];
  const [col, setCol] = useState(new Set<string>());
  const doneRef = useRef(false);

  function tap(id: string, isTarget: boolean) {
    if (!isTarget || col.has(id) || doneRef.current) return;
    const n = new Set([...col, id]);
    setCol(n);
    if (n.size === ITEMS.filter(i => i.isTarget).length) {
      doneRef.current = true;
      setTimeout(onDone, 500);
    }
  }

  return (
    <div>
      <div className={`flex items-center gap-2 justify-center mb-3 px-3 py-2 rounded-xl ${
        theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600" : "bg-amber-50 border border-amber-200"
      }`}>
        <span className="text-xl">🥦</span>
        <span className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>
          Colete: Hortifruti
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ITEMS.map(item => (
          <button key={item.id} onClick={() => tap(item.id, item.isTarget)}
            disabled={col.has(item.id)}
            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-90 ${
              col.has(item.id) ? "border-green-500 bg-green-50 opacity-50" :
              item.isTarget
                ? (theme === "GAMIFIED" ? "border-cyan-400 bg-gray-700 ring-2 ring-cyan-400/40" : "border-green-300 bg-green-50 ring-2 ring-green-200")
                : (theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white")
            }`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className={`text-xs text-center leading-none ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
              {item.name}
            </span>
            {col.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

type Phase = "ready" | "playing" | "feedback";

export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; hits: number; total: number }[]>([]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [target, setTarget] = useState<Category>("hortifruti");
  const [items, setItems] = useState<GridItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeSecs(difficulty));
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndedRef = useRef(false);
  const hitsRef = useRef(0);
  const totalRef = useRef(0);
  const roundRef = useRef(0);
  const resultsRef = useRef<{ correct: boolean; hits: number; total: number }[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function finishRound(hits: number) {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const total = totalRef.current;
    const isCorrect = total > 0 && hits / total >= 0.6;
    const newResults = [...resultsRef.current, { correct: isCorrect, hits, total }];
    resultsRef.current = newResults;
    setRoundResults(newResults);

    const nextRound = roundRef.current + 1;
    reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));
    setPhase("feedback");

    setTimeout(() => {
      if (nextRound >= MAX_ROUNDS) {
        const accuracy = newResults.filter(r => r.correct).length / MAX_ROUNDS;
        onComplete({
          exerciseId: "corrida-tempo",
          domain: "processing",
          score: calculateExerciseScore("corrida-tempo", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(r => r.correct).length },
        });
      } else {
        roundRef.current = nextRound;
        setRound(nextRound);
        startRound();
      }
    }, 1500);
  }

  function startRound() {
    const cat = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
    const newItems = buildGrid(cat, difficulty);
    roundEndedRef.current = false;
    hitsRef.current = 0;
    totalRef.current = newItems.filter(i => i.isTarget).length;
    setTarget(cat);
    setItems(newItems);
    setTimeLeft(timeSecs(difficulty));
    setPhase("playing");
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishRound(hitsRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, round]);

  function handleTap(item: GridItem) {
    if (phase !== "playing" || item.collected || roundEndedRef.current) return;
    if (item.isTarget) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, collected: true } : i));
      hitsRef.current++;
      if (hitsRef.current >= totalRef.current) finishRound(hitsRef.current);
    } else {
      setWrongFlash(prev => new Set([...prev, item.id]));
      setTimeout(() => setWrongFlash(prev => { const n = new Set(prev); n.delete(item.id); return n; }), 400);
    }
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Corrida contra o Tempo"
      steps={[{ instruction: "Toque APENAS nos itens da categoria indicada antes que o tempo acabe!", content: (done) => <TutStep theme={theme} onDone={done} /> }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const bg = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-gray-50";
  const card = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg";
  const titleClass = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-red-700" : "text-gray-900";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const tl = timeSecs(difficulty);
  const timerRatio = timeLeft / tl;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-3 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-4 ${card}`}>

        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-base ${titleClass}`}>⏱️ Corrida contra o Tempo</h2>
          <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 5 ? "text-red-500 animate-pulse" : subClass}`}>{timeLeft}s</span>
        </div>

        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < roundResults.length
                ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                : i === round ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-4">
              <p className={`text-sm ${subClass}`}>Localize e toque todos os itens da categoria indicada antes do tempo acabar!</p>
              <button onClick={startRound} className={`px-8 py-3 rounded-xl font-bold text-white ${
                theme === "GAMIFIED" ? "bg-cyan-600" : theme === "COLORFUL" ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-red-500"
              }`}>⏱️ Começar</button>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div key={`play-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl mb-2 ${
                theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600/40" : "bg-amber-50 border border-amber-200"
              }`}>
                <span className="text-2xl">{CAT_EMOJIS[target]}</span>
                <span className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>
                  Colete: {CAT_LABELS[target]}
                </span>
              </div>

              <div className={`h-2 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {items.map(item => (
                  <motion.button key={item.id} onPointerDown={() => handleTap(item)}
                    disabled={item.collected || roundEndedRef.current}
                    className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all ${
                      item.collected ? "border-green-500 bg-green-50 opacity-40" :
                      wrongFlash.has(item.id) ? "border-red-500 bg-red-100" :
                      theme === "GAMIFIED" ? "border-gray-600 bg-gray-700 active:scale-90" : "border-slate-200 bg-white active:scale-90 shadow-sm"
                    }`}
                    animate={wrongFlash.has(item.id) ? { x: [-3, 3, -3, 3, 0] } : {}}
                    transition={{ duration: 0.25 }}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className={`text-[10px] text-center leading-none font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600"}`}>
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className={`text-xs text-center mt-2 ${subClass}`}>
                {items.filter(i => i.isTarget && !i.collected).length} restantes de {totalRef.current}
              </p>
            </motion.div>
          )}

          {phase === "feedback" && (
            <motion.div key={`fb-${round}`} className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              {roundResults.length > 0 && (() => {
                const r = roundResults[roundResults.length - 1];
                return <>
                  <p className="text-5xl mb-2">{r.correct ? "✅" : "❌"}</p>
                  <p className={`font-bold text-lg ${r.correct ? "text-green-600" : "text-red-500"}`}>
                    {r.hits}/{r.total} coletados
                  </p>
                  <p className={`text-xs mt-1 ${subClass}`}>{r.correct ? "Bom trabalho!" : "Continue tentando!"}</p>
                </>;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
