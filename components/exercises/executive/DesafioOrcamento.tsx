"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { SUPER_ITEMS, shuffleSM, fmt } from "@/lib/supermarket-data";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_TRIALS = 10;

type GoalMode = "max" | "range" | "exact";

interface Trial {
  items: { id: string; name: string; emoji: string; price: number }[];
  budget: number;
  goal: GoalMode;
  targetMin: number;
  targetMax: number;
  goalLabel: string;
}

function buildTrial(d: number, used: Set<string>): Trial {
  const count = d <= 3 ? 8 : d <= 6 ? 10 : 12;
  const pool = shuffleSM(SUPER_ITEMS.filter(i => !used.has(i.id))).slice(0, count);
  const items = pool.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price }));

  const totalMax = items.reduce((s, i) => s + i.price, 0);
  const budget = Math.round((totalMax * (0.5 + Math.random() * 0.3)) / 5) * 5;

  let goal: GoalMode, targetMin: number, targetMax: number, goalLabel: string;
  if (d <= 3) {
    goal = "max";
    targetMin = 0;
    targetMax = budget;
    goalLabel = `Gaste até ${fmt(budget)}`;
  } else if (d <= 6) {
    const mid = Math.round(budget * 0.75);
    targetMin = mid - 5;
    targetMax = budget;
    goal = "range";
    goalLabel = `Gaste entre ${fmt(targetMin)} e ${fmt(budget)}`;
  } else {
    const exact = Math.round((budget * (0.6 + Math.random() * 0.3)) / 0.1) * 0.1;
    const tolerance = d <= 8 ? 2 : 1;
    targetMin = exact - tolerance;
    targetMax = exact + tolerance;
    goal = "exact";
    goalLabel = `Gaste exatamente ${fmt(exact)} (±${fmt(tolerance)})`;
  }

  return { items, budget, goal, targetMin, targetMax, goalLabel };
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const items = [
    { id: "a", emoji: "🍌", name: "Banana", price: 3.90 },
    { id: "b", emoji: "🥛", name: "Leite",  price: 5.90 },
    { id: "c", emoji: "☕", name: "Café",   price: 11.90 },
    { id: "d", emoji: "🧴", name: "Sabão",  price: 18.90 },
  ];
  const [sel, setSel] = useState(new Set<string>());
  const budget = 15;
  const total = [...sel].reduce((s, id) => s + (items.find(i => i.id === id)?.price ?? 0), 0);
  const ok = total <= budget && sel.size > 0;
  const doneRef = useRef(false);

  function toggle(id: string) {
    setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    if (!ok || doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-xl border flex justify-between ${theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
        <span className={`text-sm font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>Orçamento: {fmt(budget)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
              sel.has(item.id)
                ? "border-emerald-500 bg-emerald-50"
                : theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
            }`}
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className={`text-xs font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>{item.name}</span>
            <span className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>{fmt(item.price)}</span>
          </button>
        ))}
      </div>
      <button onClick={confirm} disabled={!ok}
        className={`w-full h-10 rounded-xl font-bold transition-all disabled:opacity-40 ${
          theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-emerald-600 text-white"
        }`}
      >Confirmar seleção</button>
    </div>
  );
}

export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [lastCorrect, setLastCorrect] = useState(false);

  const usedIds = useRef(new Set<string>());
  const startTime = useRef(Date.now());
  const trialRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);

  const [currentTrial, setCurrentTrial] = useState<Trial>(() => buildTrial(difficulty, usedIds.current));

  const nextTrial = useCallback((nextIdx: number) => {
    currentTrial.items.forEach(i => usedIds.current.add(i.id));
    if (usedIds.current.size > SUPER_ITEMS.length - 5) usedIds.current.clear();
    setCurrentTrial(buildTrial(difficulty, usedIds.current));
    setSelected(new Set());
    setPhase("shopping");
  }, [difficulty, currentTrial]);

  function toggle(id: string) {
    if (phase !== "shopping") return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    const total = [...selected].reduce((s, id) => s + (currentTrial.items.find(i => i.id === id)?.price ?? 0), 0);
    const isCorrect = total >= currentTrial.targetMin && total <= currentTrial.targetMax;
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setTrialResults(newResults);
    setLastCorrect(isCorrect);
    setPhase("result");

    const nextT = trialRef.current + 1;
    reportProgress(Math.round((nextT / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextT >= MAX_TRIALS) {
        const accuracy = newResults.filter(Boolean).length / MAX_TRIALS;
        onComplete({
          exerciseId: "desafio-orcamento",
          domain: "executive",
          score: calculateExerciseScore("desafio-orcamento", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { trials: MAX_TRIALS, correct: newResults.filter(Boolean).length },
        });
      } else {
        trialRef.current = nextT;
        setTrial(nextT);
        nextTrial(nextT);
      }
    }, 1800);
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Desafio do Orçamento"
      steps={[{ instruction: "Selecione produtos sem ultrapassar o orçamento disponível. Observe os preços com atenção!", content: (done) => <TutStep theme={theme} onDone={done} /> }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const total = [...selected].reduce((s, id) => s + (currentTrial.items.find(i => i.id === id)?.price ?? 0), 0);
  const overBudget = total > currentTrial.budget;
  const inGoal = total >= currentTrial.targetMin && total <= currentTrial.targetMax;

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-emerald-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    goal: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-emerald-50 border-emerald-200",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    sel: theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-emerald-500 bg-emerald-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-emerald-600 text-white",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-4 px-3 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-4 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>💰 Desafio do Orçamento</h2>
          <span className={`text-xs ${pal.sub}`}>{trial + 1}/{MAX_TRIALS}</span>
        </div>

        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < trialResults.length ? trialResults[i] ? "bg-green-500" : "bg-red-400"
              : i === trial ? "bg-blue-400 animate-pulse"
              : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === "shopping" && (
            <motion.div key={`shop-${trial}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Goal card */}
              <div className={`rounded-xl p-3 mb-3 border ${pal.goal}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${pal.sub}`}>Objetivo</p>
                <p className={`text-sm font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                  {currentTrial.goalLabel}
                </p>
              </div>

              {/* Selected count */}
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs ${pal.sub}`}>{selected.size} produto{selected.size !== 1 ? "s" : ""} selecionado{selected.size !== 1 ? "s" : ""}</span>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {currentTrial.items.map(item => (
                  <button key={item.id} onClick={() => toggle(item.id)}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                      selected.has(item.id) ? pal.sel : pal.item
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className={`text-xs text-center leading-none font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    <span className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                      {fmt(item.price)}
                    </span>
                    {selected.has(item.id) && <span className="text-xs text-green-500 font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <button onClick={confirm} disabled={selected.size === 0}
                className={`w-full h-11 rounded-xl font-bold transition-all disabled:opacity-40 ${pal.btn}`}
              >
                Confirmar seleção
              </button>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div key={`res-${trial}`} className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-5xl mb-2">{lastCorrect ? "✅" : "❌"}</p>
              <p className={`font-bold text-lg ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                {lastCorrect ? "Orçamento cumprido!" : "Fora do objetivo"}
              </p>
              <p className={`text-sm mt-1 ${pal.sub}`}>Total gasto: {fmt(total)}</p>
              <p className={`text-xs mt-0.5 ${pal.sub}`}>{currentTrial.goalLabel}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
