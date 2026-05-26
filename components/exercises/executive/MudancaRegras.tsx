"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import {
  shuffleFlex, fmt, pickRandomDomain,
  type FlexDomain, type FlexItem,
} from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_TRIALS = 12;

type RuleType = "category" | "price-below" | "price-above" | "not-category";

interface Rule {
  type: RuleType;
  category?: string;
  categoryLabel?: string;
  categoryEmoji?: string;
  priceThreshold?: number;
  label: string;
  emoji: string;
}

interface TrialItem extends FlexItem { /* already has id, name, cat, price */ }

interface Trial {
  domain: FlexDomain;
  items: TrialItem[];
  rule: Rule;
  correctIds: Set<string>;
  changed: boolean;
}

function makeRule(d: number, domain: FlexDomain, excludeRule?: Rule): Rule {
  const cats = domain.categories;
  const types: RuleType[] = d <= 4 ? ["category"] : d <= 7 ? ["category", "price-below", "price-above"] : ["category", "price-below", "price-above", "not-category"];
  let type: RuleType;
  do { type = types[Math.floor(Math.random() * types.length)]; } while (excludeRule?.type === type && excludeRule?.category && type === "category" && Math.random() > 0.5);

  if (type === "category" || type === "not-category") {
    let cat = cats[Math.floor(Math.random() * cats.length)];
    let attempts = 0;
    while (excludeRule?.category === cat.id && attempts++ < 10) {
      cat = cats[Math.floor(Math.random() * cats.length)];
    }
    return type === "category"
      ? { type, category: cat.id, categoryLabel: cat.label, categoryEmoji: cat.emoji, label: `Selecione apenas ${cat.label}`, emoji: cat.emoji }
      : { type, category: cat.id, categoryLabel: cat.label, categoryEmoji: cat.emoji, label: `Não selecione ${cat.label}`, emoji: "🚫" };
  }
  const prices = domain.id === "vestuario" ? [40, 60, 80, 100] : [5, 7, 10, 12];
  const threshold = prices[Math.floor(Math.random() * prices.length)];
  return type === "price-below"
    ? { type, priceThreshold: threshold, label: `Apenas itens até ${fmt(threshold)}`, emoji: "⬇️" }
    : { type, priceThreshold: threshold, label: `Apenas itens acima de ${fmt(threshold)}`, emoji: "⬆️" };
}

function matchesRule(item: TrialItem, rule: Rule): boolean {
  if (rule.type === "category") return item.cat === rule.category;
  if (rule.type === "not-category") return item.cat !== rule.category;
  if (rule.type === "price-below") return item.price <= (rule.priceThreshold ?? 10);
  if (rule.type === "price-above") return item.price > (rule.priceThreshold ?? 10);
  return false;
}

function buildTrial(d: number, trialIdx: number, domain: FlexDomain, prevRule?: Rule): Trial {
  const count = d <= 3 ? 8 : d <= 6 ? 10 : 12;
  const rule = makeRule(d, domain, prevRule);
  const items: TrialItem[] = shuffleFlex(domain.items).slice(0, count).map(i => ({
    id: i.id, name: i.name, price: i.price, cat: i.cat,
  }));
  const correctIds = new Set(items.filter(i => matchesRule(i, rule)).map(i => i.id));
  const changed = trialIdx > 0 && prevRule !== undefined;
  return { domain, items, rule, correctIds, changed };
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const items: TrialItem[] = [
    { id: "banana",  name: "Banana",  price: 3.90, cat: "hortifruti" },
    { id: "leite",   name: "Leite",   price: 5.90, cat: "laticinios" },
    { id: "maca",    name: "Maçã",    price: 6.90, cat: "hortifruti" },
    { id: "cafe",    name: "Café",    price: 11.90, cat: "mercearia" },
    { id: "cenoura", name: "Cenoura", price: 4.90, cat: "hortifruti" },
    { id: "sabao",   name: "Sabão",   price: 18.90, cat: "higiene" },
  ];
  const rule: Rule = { type: "category", category: "hortifruti", categoryLabel: "Hortifruti", label: "Selecione apenas Hortifruti", emoji: "🥦" };
  const correct = new Set(["banana", "maca", "cenoura"]);
  const [sel, setSel] = useState(new Set<string>());
  const [confirmed, setConfirmed] = useState(false);
  const doneRef = useRef(false);

  function toggle(id: string) { if (confirmed) return; setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function confirm() {
    if (doneRef.current) return;
    setConfirmed(true);
    const ok = [...correct].every(id => sel.has(id)) && [...sel].every(id => correct.has(id));
    if (ok) { doneRef.current = true; setTimeout(onDone, 800); }
    else setTimeout(() => { setSel(new Set()); setConfirmed(false); }, 1000);
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 p-2 rounded-xl ${theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600" : "bg-amber-50 border border-amber-200"}`}>
        <span className="text-xl">{rule.emoji}</span>
        <span className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>{rule.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => {
          const isSelected = sel.has(item.id);
          const isCorrect = correct.has(item.id);
          const showWrong = confirmed && isSelected && !isCorrect;
          const showMissed = confirmed && !isSelected && isCorrect;
          return (
            <button key={item.id} onClick={() => toggle(item.id)}
              className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                showWrong ? "border-red-400 bg-red-50" :
                showMissed ? "border-amber-400 bg-amber-50" :
                isSelected ? "border-emerald-500 bg-emerald-50" :
                theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
              }`}
            >
              <ItemSvg id={item.id} size={36} />
              <span className={`text-xs text-center leading-none ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>{item.name}</span>
              {isSelected && <span className="text-xs text-green-500 font-bold">✓</span>}
            </button>
          );
        })}
      </div>
      <button onClick={confirm} disabled={sel.size === 0}
        className={`w-full h-10 rounded-xl font-bold disabled:opacity-40 ${theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-emerald-600 text-white"}`}
      >Confirmar</button>
    </div>
  );
}

export function MudancaRegras({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const domainRef = useRef<FlexDomain>(pickRandomDomain());
  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [showChangeAlert, setShowChangeAlert] = useState(false);

  const startTime = useRef(Date.now());
  const trialRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);
  const prevRule = useRef<Rule | undefined>(undefined);

  const [currentTrial, setCurrentTrial] = useState<Trial>(() =>
    buildTrial(difficulty, 0, domainRef.current, undefined)
  );

  const nextTrial = useCallback((nextIdx: number) => {
    if (nextIdx % 4 === 0 && nextIdx > 0) {
      domainRef.current = pickRandomDomain();
      prevRule.current = undefined;
    }
    const newTrial = buildTrial(difficulty, nextIdx, domainRef.current, prevRule.current);
    prevRule.current = newTrial.rule;
    setCurrentTrial(newTrial);
    setSelected(new Set());
    setPhase("shopping");
    if (newTrial.changed) {
      setShowChangeAlert(true);
      setTimeout(() => setShowChangeAlert(false), 2000);
    }
  }, [difficulty]);

  function toggle(id: string) {
    if (phase !== "shopping") return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    if (phase !== "shopping") return;
    const correct = currentTrial.correctIds;
    const isCorrect = [...correct].every(id => selected.has(id)) && [...selected].every(id => correct.has(id));
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setTrialResults(newResults);
    setLastCorrect(isCorrect);
    setPhase("result");
    prevRule.current = currentTrial.rule;

    const nextT = trialRef.current + 1;
    reportProgress(Math.round((nextT / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextT >= MAX_TRIALS) {
        const accuracy = newResults.filter(Boolean).length / MAX_TRIALS;
        onComplete({
          exerciseId: "mudanca-regras",
          domain: "executive",
          score: calculateExerciseScore("mudanca-regras", accuracy, undefined, difficulty),
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
    return <TutorialBase theme={theme} title="Mudança de Regras"
      steps={[{
        instruction: "Selecione TODOS os itens que seguem a regra indicada. Atenção: a regra pode mudar entre as rodadas!",
        content: (done) => <TutStep theme={theme} onDone={done} />,
      }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-purple-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    rule: theme === "GAMIFIED" ? "bg-cyan-900/40 border-cyan-600" : "bg-violet-50 border-violet-200",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    sel: theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-emerald-500 bg-emerald-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white" : "bg-violet-600 text-white",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-4 px-3 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-4 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🔀 Mudança de Regras</h2>
          <span className={`text-xs ${pal.sub}`}>{trial + 1}/{MAX_TRIALS} · {currentTrial.domain.name}</span>
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

        <AnimatePresence>
          {showChangeAlert && (
            <motion.div key="alert"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-2 rounded-xl bg-orange-500 text-white text-center text-sm font-bold"
            >
              ⚠️ A regra mudou!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "shopping" && (
            <motion.div key={`shop-${trial}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`rounded-xl p-3 mb-3 border flex items-center gap-2 ${pal.rule}`}>
                <span className="text-2xl">{currentTrial.rule.emoji}</span>
                <p className={`text-sm font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-violet-800"}`}>
                  {currentTrial.rule.label}
                </p>
              </div>

              <div className={`flex justify-between items-center mb-2 text-xs ${pal.sub}`}>
                <span>{selected.size} selecionado{selected.size !== 1 ? "s" : ""}</span>
                <span>Selecione TODOS que se encaixam</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {currentTrial.items.map(item => (
                  <button key={item.id} onClick={() => toggle(item.id)}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                      selected.has(item.id) ? pal.sel : pal.item
                    }`}
                  >
                    <ItemSvg id={item.id} size={36} />
                    <span className={`text-[11px] text-center leading-none font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    {(currentTrial.rule.type === "price-below" || currentTrial.rule.type === "price-above") && (
                      <span className={`text-[10px] font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                        {fmt(item.price)}
                      </span>
                    )}
                    {selected.has(item.id) && <span className="text-xs text-green-500 font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <button onClick={confirm}
                className={`w-full h-11 rounded-xl font-bold transition-all ${pal.btn}`}
              >
                Confirmar seleção ({selected.size})
              </button>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div key={`res-${trial}`} className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-5xl mb-2">{lastCorrect ? "✅" : "❌"}</p>
              <p className={`font-bold text-lg ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                {lastCorrect ? "Regra seguida!" : "Seleção incorreta"}
              </p>
              <p className={`text-sm mt-1 ${pal.sub}`}>
                {lastCorrect ? `${currentTrial.correctIds.size} item(ns) correto(s)` : `Esperado: ${currentTrial.correctIds.size} item(ns)`}
              </p>
              <p className={`text-xs mt-0.5 ${pal.sub}`}>{currentTrial.rule.label}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
