"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import { shuffleFlex, fmt, pickRandomDomain, type FlexDomain, type FlexItem, type FlexCategory } from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_ROUNDS = 8;

interface Rules {
  budget: number;          // must not exceed this total
  category: FlexCategory;  // must include at least 1 item from this category
  quantity: number;        // must select exactly this many items
}

interface Round {
  domain: FlexDomain;
  items: FlexItem[];
  rules: Rules;
  timeSecs: number;
}

function buildRound(d: number): Round {
  const domain = pickRandomDomain();
  const count = d <= 3 ? 9 : d <= 6 ? 12 : 15;
  const items = shuffleFlex(domain.items).slice(0, count);
  const timeSecs = d <= 3 ? 45 : d <= 6 ? 35 : 25;

  const cat = domain.categories[Math.floor(Math.random() * domain.categories.length)];
  const quantity = d <= 3 ? 2 : d <= 6 ? 3 : 4;

  // Budget: needs to be enough to buy 'quantity' items from the category
  const catItems = items.filter(i => i.cat === cat.id);
  const sorted = [...catItems].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const basePrice = cheapest?.price ?? (d <= 3 ? 10 : 20);
  const avgAllItems = items.reduce((s, i) => s + i.price, 0) / items.length;
  const budget = Math.round((basePrice * 1.5 + avgAllItems * (quantity - 1) * 0.8) * 10) / 10;

  return { domain, items, rules: { budget, category: cat, quantity }, timeSecs };
}

function checkRules(selected: Set<string>, items: FlexItem[], rules: Rules) {
  const sel = items.filter(i => selected.has(i.id));
  const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
  const hasCat = sel.some(i => i.cat === rules.category.id);
  const qtyOk = sel.length === rules.quantity;
  const budgetOk = total <= rules.budget;
  return { total, hasCat, qtyOk, budgetOk, allOk: hasCat && qtyOk && budgetOk };
}

// ── Tutorial ───────────────────────────────────────────────────────────────

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const items: FlexItem[] = [
    { id: "banana",  name: "Banana",  cat: "hortifruti", price: 3.90 },
    { id: "leite",   name: "Leite",   cat: "laticinios", price: 5.90 },
    { id: "maca",    name: "Maçã",    cat: "hortifruti", price: 6.90 },
    { id: "cafe",    name: "Café",    cat: "mercearia",  price: 11.90 },
    { id: "cenoura", name: "Cenoura", cat: "hortifruti", price: 4.90 },
    { id: "sabao",   name: "Sabão",   cat: "higiene",    price: 18.90 },
  ];
  const rules: Rules = {
    budget: 15.00,
    category: { id: "hortifruti", label: "Hortifruti", emoji: "🥦" },
    quantity: 2,
  };
  const [sel, setSel] = useState(new Set<string>());
  const doneRef = useRef(false);

  const { total, hasCat, qtyOk, budgetOk, allOk } = checkRules(sel, items, rules);

  function toggle(id: string) {
    setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    if (!allOk || doneRef.current) return;
    doneRef.current = true;
    setTimeout(onDone, 500);
  }

  const ruleItem = (ok: boolean, label: string) => (
    <div className={`flex items-center gap-2 text-xs font-semibold ${ok ? "text-green-500" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "○"}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className={`rounded-xl p-3 border space-y-1 ${theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>Regras simultâneas:</p>
        {ruleItem(budgetOk && sel.size > 0, `Máximo ${fmt(rules.budget)}`)}
        {ruleItem(hasCat, `Incluir ${rules.category.emoji} ${rules.category.label}`)}
        {ruleItem(qtyOk, `Exatamente ${rules.quantity} itens`)}
        {sel.size > 0 && <div className={`text-xs font-bold mt-1 ${budgetOk ? "text-green-500" : "text-red-500"}`}>Total: {fmt(total)}</div>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
              sel.has(item.id) ? "border-emerald-500 bg-emerald-50" :
              theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
            }`}>
            <ItemSvg id={item.id} size={32} />
            <span className={`text-[10px] text-center leading-none ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>{item.name}</span>
            <span className={`text-[10px] font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>{fmt(item.price)}</span>
          </button>
        ))}
      </div>
      <button onClick={confirm} disabled={!allOk}
        className={`w-full h-10 rounded-xl font-bold text-white transition-all disabled:opacity-40 ${
          theme === "GAMIFIED" ? "bg-cyan-600" : "bg-emerald-600"
        }`}>
        {allOk ? "✓ Confirmar" : "Atenda todas as regras"}
      </button>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState<Round>(() => buildRound(difficulty));

  const startTime = useRef(Date.now());
  const roundRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmedRef = useRef(false);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (phase !== "shopping" || showTutorial) return;
    setTimeLeft(currentRound.timeSecs);
    confirmedRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishRound(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, showTutorial]);

  function finishRound(isCorrect: boolean) {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setRoundResults(newResults);
    setLastCorrect(isCorrect);
    setPhase("result");

    const nextR = roundRef.current + 1;
    reportProgress(Math.round((nextR / MAX_ROUNDS) * 100));

    setTimeout(() => {
      if (nextR >= MAX_ROUNDS) {
        const accuracy = newResults.filter(Boolean).length / MAX_ROUNDS;
        onComplete({
          exerciseId: "compra-multifuncional",
          domain: "executive",
          score: calculateExerciseScore("compra-multifuncional", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(Boolean).length },
        });
      } else {
        roundRef.current = nextR;
        setRound(nextR);
        setSelected(new Set());
        setCurrentRound(buildRound(difficulty));
        setPhase("shopping");
      }
    }, 1800);
  }

  function toggle(id: string) {
    if (phase !== "shopping") return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Compra Multifuncional"
        steps={[{
          instruction: "Selecione itens respeitando TODAS as 3 regras ao mesmo tempo: orçamento, categoria obrigatória e quantidade exata. O painel mostra quais regras já foram cumpridas!",
          content: (done) => <TutStep theme={theme} onDone={done} />,
        }]}
        onDone={() => setShowTutorial(false)} />
    );
  }

  const rules = currentRound.rules;
  const { total, hasCat, qtyOk, budgetOk, allOk } = checkRules(selected, currentRound.items, rules);
  const timerRatio = timeLeft / currentRound.timeSecs;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 to-pink-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    ruleBox: theme === "GAMIFIED" ? "bg-gray-700/60 border-gray-600" : "bg-slate-50 border-slate-200",
    ruleOk: "text-green-500",
    rulePending: theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    itemSel: "border-emerald-500 bg-emerald-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white",
  };

  function ruleRow(ok: boolean, label: string) {
    return (
      <div className={`flex items-center gap-2 text-xs font-semibold ${ok ? pal.ruleOk : pal.rulePending}`}>
        <span className={`text-sm font-black ${ok ? "text-green-500" : ""}`}>{ok ? "✓" : "○"}</span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className={`rounded-2xl p-5 ${pal.card}`}>

          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-base ${pal.title}`}>🛒 Compra Multifuncional</h2>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 8 ? "text-red-500 animate-pulse" : pal.sub}`}>{timeLeft}s</span>
            </div>
          </div>

          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < roundResults.length ? (roundResults[i] ? "bg-green-500" : "bg-red-400")
                : i === round ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`} />
            ))}
          </div>

          {/* Timer bar */}
          <div className={`h-1.5 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {phase === "shopping" && (
              <motion.div key={`shop-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {/* Rules checklist */}
                <div className={`rounded-xl p-3 border mb-3 space-y-1.5 ${pal.ruleBox}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${pal.sub}`}>Atenda todas as regras · {currentRound.domain.name}</p>
                  {ruleRow(budgetOk && selected.size > 0, `Máximo ${fmt(rules.budget)} (total: ${fmt(total)})`)}
                  {ruleRow(hasCat, `Incluir ${rules.category.emoji} ${rules.category.label}`)}
                  {ruleRow(qtyOk, `Exatamente ${rules.quantity} item${rules.quantity !== 1 ? "s" : ""} (${selected.size} selecionado${selected.size !== 1 ? "s" : ""})`)}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {currentRound.items.map(item => (
                    <button key={item.id} onClick={() => toggle(item.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                        selected.has(item.id) ? pal.itemSel : pal.item
                      }`}>
                      <ItemSvg id={item.id} size={48} />
                      <span className={`text-xs text-center leading-tight font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-bold tabular-nums ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                        {fmt(item.price)}
                      </span>
                      {selected.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                <button onClick={() => finishRound(allOk)} disabled={selected.size === 0}
                  className={`w-full h-11 rounded-xl font-bold transition-all disabled:opacity-40 ${pal.btn}`}>
                  {selected.size === 0 ? "Selecione itens" : "→ Confirmar seleção"}
                </button>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div key={`res-${round}`} className="py-6"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-5xl text-center mb-3">{lastCorrect ? "✅" : "❌"}</p>
                <p className={`font-bold text-lg text-center mb-4 ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                  {lastCorrect ? "Todas as regras cumpridas!" : "Nem todas as regras foram atendidas"}
                </p>
                {!lastCorrect && (
                  <div className={`rounded-xl p-3 border space-y-1.5 ${pal.ruleBox}`}>
                    <p className={`text-xs font-bold mb-1 ${pal.sub}`}>O que ficou faltando:</p>
                    {!budgetOk && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-semibold">
                        <span>✗</span><span>Orçamento ultrapassado — total {fmt(total)} de máx {fmt(rules.budget)}</span>
                      </div>
                    )}
                    {!hasCat && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-semibold">
                        <span>✗</span><span>Faltou incluir {rules.category.emoji} {rules.category.label}</span>
                      </div>
                    )}
                    {!qtyOk && (
                      <div className="flex items-center gap-2 text-xs text-red-500 font-semibold">
                        <span>✗</span><span>Quantidade errada — {selected.size} selecionado{selected.size !== 1 ? "s" : ""}, precisava de {rules.quantity}</span>
                      </div>
                    )}
                  </div>
                )}
                {lastCorrect && (
                  <p className={`text-xs text-center ${pal.sub}`}>Total: {fmt(total)} · {selected.size} itens</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
