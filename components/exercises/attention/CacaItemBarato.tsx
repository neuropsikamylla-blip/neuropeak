"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { fmt } from "@/lib/supermarket-data";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_TRIALS = 10;

interface ProductOption {
  id: string;
  name: string;
  emoji: string;
  quantity: string;
  price: number;
  unitPrice: number;
}

interface Trial {
  baseProduct: string;
  emoji: string;
  options: ProductOption[];
  correctId: string;
}

const PRODUCTS = [
  { name: "Arroz",        emoji: "🌾" },
  { name: "Feijão",       emoji: "🫘" },
  { name: "Macarrão",     emoji: "🍝" },
  { name: "Açúcar",       emoji: "🍬" },
  { name: "Farinha",      emoji: "🌾" },
  { name: "Leite",        emoji: "🥛" },
  { name: "Óleo",         emoji: "🫙" },
  { name: "Café",         emoji: "☕" },
  { name: "Sal",          emoji: "🧂" },
  { name: "Iogurte",      emoji: "🍶" },
  { name: "Shampoo",      emoji: "🚿" },
  { name: "Sabão em pó",  emoji: "🧴" },
];

type QuantityUnit = "g" | "ml" | "un" | "L" | "kg";

function makeOptions(d: number): { qty: number; unit: QuantityUnit }[] {
  const count = d <= 3 ? 3 : 4;
  const bases: { qty: number; unit: QuantityUnit }[] = [
    { qty: 500,  unit: "g"  },
    { qty: 1000, unit: "g"  },
    { qty: 1500, unit: "g"  },
    { qty: 2000, unit: "g"  },
    { qty: 250,  unit: "ml" },
    { qty: 500,  unit: "ml" },
    { qty: 1000, unit: "ml" },
    { qty: 1,    unit: "L"  },
    { qty: 1,    unit: "kg" },
    { qty: 2,    unit: "kg" },
  ];
  const shuffled = bases.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildTrial(d: number, usedProducts: Set<string>): Trial {
  const pool = PRODUCTS.filter(p => !usedProducts.has(p.name));
  const prod = pool[Math.floor(Math.random() * pool.length)] ?? PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

  const variants = makeOptions(d);

  const baseUnitPrice = 4 + Math.random() * 12;
  const noise = d <= 3 ? 0.3 : d <= 6 ? 0.15 : 0.07;

  const options: ProductOption[] = variants.map((v, idx) => {
    const totalGrams = v.unit === "kg" ? v.qty * 1000 : v.unit === "L" ? v.qty * 1000 : v.qty;
    const idealPrice = (baseUnitPrice * totalGrams) / 1000;
    const factor = 1 + (Math.random() - 0.5) * noise * 2;
    const rawPrice = Math.max(0.5, idealPrice * factor);
    const price = Math.round(rawPrice * 10) / 10;
    const unitPrice = price / (totalGrams / 100);

    const quantityLabel = v.unit === "kg" ? `${v.qty} kg` : v.unit === "L" ? `${v.qty} L` : `${v.qty} ${v.unit}`;
    return { id: `opt-${idx}`, name: prod.name, emoji: prod.emoji, quantity: quantityLabel, price, unitPrice };
  });

  const correctId = options.reduce((best, opt) => opt.unitPrice < best.unitPrice ? opt : best, options[0]).id;

  return { baseProduct: prod.name, emoji: prod.emoji, options, correctId };
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const opts: ProductOption[] = [
    { id: "a", name: "Arroz", emoji: "🌾", quantity: "500 g",  price: 3.90, unitPrice: 3.90 / 5 },
    { id: "b", name: "Arroz", emoji: "🌾", quantity: "1000 g", price: 6.50, unitPrice: 6.50 / 10 },
    { id: "c", name: "Arroz", emoji: "🌾", quantity: "2000 g", price: 9.80, unitPrice: 9.80 / 20 },
  ];
  const correct = "c";
  const [sel, setSel] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const doneRef = useRef(false);

  function pick(id: string) {
    if (sel !== null || doneRef.current) return;
    setSel(id);
    setRevealed(true);
    if (id === correct) {
      doneRef.current = true;
      setTimeout(onDone, 800);
    }
  }

  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="space-y-2">
      <p className={`text-xs text-center ${sub}`}>Qual embalagem tem o menor preço por 100 g?</p>
      {opts.map(opt => {
        const isCorrect = opt.id === correct;
        const isSelected = opt.id === sel;
        const showResult = revealed && isSelected;
        return (
          <button key={opt.id} onClick={() => pick(opt.id)}
            className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
              showResult
                ? isCorrect ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"
                : revealed && isCorrect ? "border-green-500 bg-green-50"
                : theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{opt.emoji}</span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>{opt.quantity}</p>
                <p className={`text-xs ${sub}`}>por {fmt(opt.price)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-emerald-700"}`}>
                {fmt(opt.unitPrice)}/100g
              </p>
              {revealed && isCorrect && <span className="text-xs text-green-600 font-bold">✓ Melhor!</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"picking" | "result">("picking");
  const [lastCorrect, setLastCorrect] = useState(false);

  const usedProducts = useRef(new Set<string>());
  const startTime = useRef(Date.now());
  const trialRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);

  const [currentTrial, setCurrentTrial] = useState<Trial>(() => buildTrial(difficulty, usedProducts.current));

  const nextTrial = useCallback(() => {
    usedProducts.current.add(currentTrial.baseProduct);
    if (usedProducts.current.size >= PRODUCTS.length - 2) usedProducts.current.clear();
    setCurrentTrial(buildTrial(difficulty, usedProducts.current));
    setSelected(null);
    setPhase("picking");
  }, [difficulty, currentTrial]);

  function pick(id: string) {
    if (phase !== "picking" || selected !== null) return;
    const isCorrect = id === currentTrial.correctId;
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setTrialResults(newResults);
    setSelected(id);
    setLastCorrect(isCorrect);
    setPhase("result");

    const nextT = trialRef.current + 1;
    reportProgress(Math.round((nextT / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextT >= MAX_TRIALS) {
        const accuracy = newResults.filter(Boolean).length / MAX_TRIALS;
        onComplete({
          exerciseId: "caca-item-barato",
          domain: "attention",
          score: calculateExerciseScore("caca-item-barato", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { trials: MAX_TRIALS, correct: newResults.filter(Boolean).length },
        });
      } else {
        trialRef.current = nextT;
        setTrial(nextT);
        nextTrial();
      }
    }, 2000);
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Caça ao Item Mais Barato"
      steps={[{ instruction: "Compare as embalagens e toque na que tem o MENOR PREÇO por 100g ou 100ml!", content: (done) => <TutStep theme={theme} onDone={done} /> }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-amber-50 to-yellow-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-amber-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    sel: theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-emerald-500 bg-emerald-50",
    wrong: "border-red-400 bg-red-50",
    correct: "border-green-500 bg-green-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white" : "bg-amber-600 text-white",
  };

  const correctOpt = currentTrial.options.find(o => o.id === currentTrial.correctId)!;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-4 px-3 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-4 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🏷️ Caça ao Item Mais Barato</h2>
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
          {phase === "picking" && (
            <motion.div key={`pick-${trial}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`rounded-xl p-3 mb-3 border text-center ${theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-amber-50 border-amber-200"}`}>
                <span className="text-3xl">{currentTrial.emoji}</span>
                <p className={`text-sm font-bold mt-1 ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                  Qual embalagem tem o menor preço por 100g?
                </p>
              </div>

              <div className="space-y-2">
                {currentTrial.options.map(opt => (
                  <button key={opt.id} onClick={() => pick(opt.id)} disabled={phase !== "picking"}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all active:scale-[0.98] ${pal.item}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{opt.emoji}</span>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>{opt.quantity}</p>
                        <p className={`text-xs ${pal.sub}`}>por {fmt(opt.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {difficulty >= 7 ? (
                        <p className={`text-xs ${pal.sub}`}>Calcule!</p>
                      ) : (
                        <p className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-emerald-700"}`}>
                          {fmt(opt.unitPrice)}/100g
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div key={`res-${trial}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center pt-4 pb-2">
                <p className="text-5xl mb-2">{lastCorrect ? "✅" : "❌"}</p>
                <p className={`font-bold text-lg ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                  {lastCorrect ? "Melhor preço encontrado!" : "Não era a melhor opção"}
                </p>
              </div>
              <div className="space-y-2 mt-3">
                {currentTrial.options.map(opt => {
                  const isCorrect = opt.id === currentTrial.correctId;
                  const isSelected = opt.id === selected;
                  return (
                    <div key={opt.id}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between ${
                        isCorrect ? pal.correct : isSelected ? pal.wrong : pal.item
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{opt.emoji}</span>
                        <div>
                          <p className={`text-sm font-semibold ${theme === "GAMIFIED" && !isCorrect && !isSelected ? "text-gray-100" : "text-gray-800"}`}>
                            {opt.quantity}
                          </p>
                          <p className="text-xs text-gray-500">{fmt(opt.price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isCorrect ? "text-green-700" : "text-gray-600"}`}>
                          {fmt(opt.unitPrice)}/100g
                        </p>
                        {isCorrect && <span className="text-xs text-green-600 font-bold">✓ Melhor!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className={`text-xs text-center mt-2 ${pal.sub}`}>
                Melhor opção: {correctOpt.quantity} por {fmt(correctOpt.price)} = {fmt(correctOpt.unitPrice)}/100g
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
