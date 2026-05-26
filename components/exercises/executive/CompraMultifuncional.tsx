"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { SUPER_ITEMS, shuffleSM, fmt, type Category } from "@/lib/supermarket-data";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_ROUNDS = 8;

function timeSecs(d: number) { return d <= 3 ? 35 : d <= 6 ? 28 : 20; }
function itemCount(d: number) { return d <= 3 ? 8 : d <= 6 ? 10 : 12; }

type Constraint = "budget" | "category" | "min-items" | "max-items";

interface Round {
  items: { id: string; name: string; emoji: string; price: number; cat: Category }[];
  budget: number;
  requiredCategory?: Category;
  minItems?: number;
  maxItems?: number;
  constraints: Constraint[];
  goalLabel: string;
}

const CAT_LABELS: Record<Category, string> = {
  hortifruti: "Hortifruti", laticinios: "Laticínios", mercearia: "Mercearia",
  higiene: "Higiene", bebidas: "Bebidas",
};

function buildRound(d: number): Round {
  const count = itemCount(d);
  const items = shuffleSM(SUPER_ITEMS).slice(0, count).map(i => ({
    id: i.id, name: i.name, emoji: i.emoji, price: i.price, cat: i.cat as Category,
  }));

  const totalMax = items.reduce((s, i) => s + i.price, 0);
  const budget = Math.round((totalMax * (0.55 + Math.random() * 0.25)) / 5) * 5;

  const constraints: Constraint[] = ["budget"];
  const goalParts: string[] = [`Orçamento: até ${fmt(budget)}`];

  let requiredCategory: Category | undefined;
  let minItems: number | undefined;
  let maxItems: number | undefined;

  if (d >= 4) {
    const cats: Category[] = ["hortifruti", "laticinios", "mercearia", "higiene", "bebidas"];
    requiredCategory = cats[Math.floor(Math.random() * cats.length)];
    constraints.push("category");
    goalParts.push(`Inclua ao menos 1 item de ${CAT_LABELS[requiredCategory]}`);
  }

  if (d >= 6) {
    minItems = 3 + Math.floor(Math.random() * 2);
    constraints.push("min-items");
    goalParts.push(`Mínimo ${minItems} itens`);
  }

  if (d >= 8) {
    maxItems = count - 2 - Math.floor(Math.random() * 2);
    constraints.push("max-items");
    goalParts.push(`Máximo ${maxItems} itens`);
  }

  return { items, budget, requiredCategory, minItems, maxItems, constraints, goalLabel: goalParts.join(" · ") };
}

function checkRound(round: Round, selected: Set<string>, items: Round["items"]): { pass: boolean; reasons: string[]; total: number } {
  const sel = items.filter(i => selected.has(i.id));
  const total = sel.reduce((s, i) => s + i.price, 0);
  const reasons: string[] = [];

  if (sel.length === 0) reasons.push("Selecione ao menos 1 item");
  if (total > round.budget) reasons.push(`Orçamento excedido (${fmt(total)} > ${fmt(round.budget)})`);
  if (round.requiredCategory && !sel.some(i => i.cat === round.requiredCategory))
    reasons.push(`Falta item de ${CAT_LABELS[round.requiredCategory]}`);
  if (round.minItems !== undefined && sel.length < round.minItems)
    reasons.push(`Mínimo ${round.minItems} itens (selecionou ${sel.length})`);
  if (round.maxItems !== undefined && sel.length > round.maxItems)
    reasons.push(`Máximo ${round.maxItems} itens (selecionou ${sel.length})`);

  return { pass: reasons.length === 0, reasons, total };
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const items = [
    { id: "a", emoji: "🍌", name: "Banana",  price: 3.90, cat: "hortifruti" as Category },
    { id: "b", emoji: "🥛", name: "Leite",   price: 5.90, cat: "laticinios" as Category },
    { id: "c", emoji: "☕", name: "Café",    price: 11.90, cat: "mercearia"  as Category },
    { id: "d", emoji: "🍎", name: "Maçã",   price: 6.90, cat: "hortifruti" as Category },
    { id: "e", emoji: "🧴", name: "Sabão",  price: 18.90, cat: "higiene"    as Category },
    { id: "f", emoji: "🥤", name: "Refri",  price: 8.90, cat: "bebidas"    as Category },
  ];
  const budget = 20;
  const requiredCategory: Category = "hortifruti";
  const [sel, setSel] = useState(new Set<string>());
  const doneRef = useRef(false);

  const total = [...sel].reduce((s, id) => s + (items.find(i => i.id === id)?.price ?? 0), 0);
  const hasHorti = [...sel].some(id => items.find(i => i.id === id)?.cat === requiredCategory);
  const ok = total <= budget && hasHorti && sel.size > 0;

  function toggle(id: string) { setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function confirm() {
    if (!ok || doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="space-y-2">
      <div className={`p-2 rounded-xl text-xs space-y-0.5 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-amber-50 border border-amber-200"}`}>
        <p className={`font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>Regras simultâneas:</p>
        <p className={sub}>• Orçamento: até {fmt(budget)}</p>
        <p className={sub}>• Inclua ao menos 1 Hortifruti</p>
      </div>
      <div className={`flex justify-between text-xs px-1 ${sub}`}>
        <span>Total: <strong className={total > budget ? "text-red-500" : "text-green-600"}>{fmt(total)}</strong></span>
        <span>Hortifruti: <strong className={hasHorti ? "text-green-600" : "text-red-500"}>{hasHorti ? "✓" : "✗"}</strong></span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all ${
              sel.has(item.id) ? "border-emerald-500 bg-emerald-50" :
              theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className={`text-[10px] text-center leading-none ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-600"}`}>{item.name}</span>
            <span className={`text-[10px] font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>{fmt(item.price)}</span>
          </button>
        ))}
      </div>
      <button onClick={confirm} disabled={!ok}
        className={`w-full h-10 rounded-xl font-bold disabled:opacity-40 ${theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-emerald-600 text-white"}`}
      >Confirmar</button>
    </div>
  );
}

export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ pass: boolean; reasons: string[]; total: number }[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [timeLeft, setTimeLeft] = useState(timeSecs(difficulty));
  const [lastResult, setLastResult] = useState<{ pass: boolean; reasons: string[]; total: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndedRef = useRef(false);
  const startTime = useRef(Date.now());
  const roundRef = useRef(0);
  const resultsRef = useRef<{ pass: boolean; reasons: string[]; total: number }[]>([]);

  const [currentRound, setCurrentRound] = useState<Round>(() => buildRound(difficulty));

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const finishRound = useCallback((sel: Set<string>) => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const result = checkRound(currentRound, sel, currentRound.items);
    const newResults = [...resultsRef.current, result];
    resultsRef.current = newResults;
    setRoundResults(newResults);
    setLastResult(result);
    setPhase("result");

    const nextR = roundRef.current + 1;
    reportProgress(Math.round((nextR / MAX_ROUNDS) * 100));

    setTimeout(() => {
      if (nextR >= MAX_ROUNDS) {
        const accuracy = newResults.filter(r => r.pass).length / MAX_ROUNDS;
        onComplete({
          exerciseId: "compra-multifuncional",
          domain: "executive",
          score: calculateExerciseScore("compra-multifuncional", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(r => r.pass).length },
        });
      } else {
        roundRef.current = nextR;
        setRound(nextR);
        roundEndedRef.current = false;
        const newRound = buildRound(difficulty);
        setCurrentRound(newRound);
        setSelected(new Set());
        setTimeLeft(timeSecs(difficulty));
        setPhase("shopping");
      }
    }, 2200);
  }, [currentRound, difficulty, onComplete, reportProgress]);

  useEffect(() => {
    if (phase !== "shopping" || showTutorial) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishRound(selected);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, showTutorial]);

  function toggle(id: string) {
    if (phase !== "shopping" || roundEndedRef.current) return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    if (phase !== "shopping" || roundEndedRef.current) return;
    finishRound(selected);
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Compra Multifuncional"
      steps={[{
        instruction: "Respeite TODAS as regras ao mesmo tempo: orçamento, categorias e quantidade de itens — dentro do tempo limite!",
        content: (done) => <TutStep theme={theme} onDone={done} />,
      }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-cyan-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-teal-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    sel: theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-emerald-500 bg-emerald-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : "bg-teal-600 text-white",
  };

  const tl = timeSecs(difficulty);
  const timerRatio = timeLeft / tl;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";
  const hasRequired = !currentRound.requiredCategory || [...selected].some(id => currentRound.items.find(i => i.id === id)?.cat === currentRound.requiredCategory);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-4 px-3 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-4 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🛒 Compra Multifuncional</h2>
          <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 7 ? "text-red-500 animate-pulse" : pal.sub}`}>{timeLeft}s</span>
        </div>

        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < roundResults.length ? roundResults[i].pass ? "bg-green-500" : "bg-red-400"
              : i === round ? "bg-blue-400 animate-pulse"
              : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        <div className={`h-1.5 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          {phase === "shopping" && (
            <motion.div key={`shop-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Constraints panel */}
              <div className={`rounded-xl p-2.5 mb-3 border text-xs space-y-1 ${theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-teal-50 border-teal-200"}`}>
                <p className={`font-bold text-xs uppercase tracking-wide ${pal.sub}`}>Regras simultâneas</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className={`font-medium ${pal.sub}`}>
                    💰 Orçamento: até {fmt(currentRound.budget)}
                  </span>
                  {currentRound.requiredCategory && (
                    <span className={hasRequired ? "text-green-600 font-medium" : `font-medium ${pal.sub}`}>
                      {hasRequired ? "✓" : "○"} {CAT_LABELS[currentRound.requiredCategory]}
                    </span>
                  )}
                  {currentRound.minItems !== undefined && (
                    <span className={selected.size >= currentRound.minItems ? "text-green-600 font-medium" : `font-medium ${pal.sub}`}>
                      {selected.size >= currentRound.minItems ? "✓" : "○"} Min {currentRound.minItems} itens
                    </span>
                  )}
                  {currentRound.maxItems !== undefined && (
                    <span className={selected.size <= currentRound.maxItems ? "text-green-600 font-medium" : "text-red-500 font-bold"}>
                      {selected.size <= currentRound.maxItems ? "✓" : "✗"} Max {currentRound.maxItems} itens
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {currentRound.items.map(item => (
                  <button key={item.id} onClick={() => toggle(item.id)}
                    className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
                      selected.has(item.id) ? pal.sel : pal.item
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`text-[10px] text-center leading-none font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    <span className={`text-[10px] font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                      {fmt(item.price)}
                    </span>
                    {selected.has(item.id) && <span className="text-[10px] text-green-500 font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <button onClick={confirm} disabled={selected.size === 0}
                className={`w-full h-11 rounded-xl font-bold transition-all disabled:opacity-40 ${pal.btn}`}
              >
                Confirmar seleção ({selected.size} item{selected.size !== 1 ? "s" : ""})
              </button>
            </motion.div>
          )}

          {phase === "result" && lastResult && (
            <motion.div key={`res-${round}`} className="text-center py-6"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-5xl mb-2">{lastResult.pass ? "✅" : "❌"}</p>
              <p className={`font-bold text-lg ${lastResult.pass ? "text-green-600" : "text-red-500"}`}>
                {lastResult.pass ? "Todas as regras cumpridas!" : "Regras não cumpridas"}
              </p>
              <p className={`text-sm font-medium mt-1 ${pal.sub}`}>
                Total gasto: <strong>{fmt(lastResult.total)}</strong> de {fmt(currentRound.budget)}
              </p>
              {lastResult.reasons.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {lastResult.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-red-500">{r}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
