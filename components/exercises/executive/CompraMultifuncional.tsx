"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import { shuffleFlex, fmt, pickRandomDomain, type FlexDomain, type FlexItem, type FlexCategory } from "@/lib/item-domains";
import { buildCtxRound, checkCtx, type CtxRound } from "@/data/compra-contextual";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_ROUNDS = 8;

interface Rules {
  budget: number;          // must not exceed this total
  category: FlexCategory;  // must include at least 1 item from this category
  quantity: number;        // must select exactly this many items
}

interface RulesRound {
  domain: FlexDomain;
  items: FlexItem[];
  rules: Rules;
  timeSecs: number;
}

// Uma rodada pode ser por REGRAS (clássica) ou CONTEXTUAL (historinha, sem entregar a categoria).
type AnyRound = ({ mode: "rules" } & RulesRound) | ({ mode: "context" } & CtxRound);

// Decide o tipo da rodada: ímpares = contextual (rotação de histórias começando pela neve).
function makeRound(d: number, i: number): AnyRound {
  if (i % 2 === 1) return { mode: "context", ...buildCtxRound(d, Math.floor(i / 2)) };
  return { mode: "rules", ...buildRound(d) };
}

function buildRound(d: number): RulesRound {
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
  const [currentRound, setCurrentRound] = useState<AnyRound>(() => makeRound(difficulty, 0));
  const [storyOpen, setStoryOpen] = useState(true);   // história contextual visível (recolhe no difícil)

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

  // Difícil contextual: a história aparece por alguns segundos e depois recolhe.
  useEffect(() => {
    if (phase !== "shopping" || showTutorial) return;
    if (currentRound.mode === "context" && currentRound.collapseStory) {
      const t = setTimeout(() => setStoryOpen(false), 6000);
      return () => clearTimeout(t);
    }
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
        setCurrentRound(makeRound(difficulty, nextR));
        setStoryOpen(true);
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

  const isCtx = currentRound.mode === "context";
  const rulesC = currentRound.mode === "rules" ? checkRules(selected, currentRound.items, currentRound.rules) : null;
  const ctxC = currentRound.mode === "context" ? checkCtx(selected, currentRound) : null;
  const allOk = isCtx ? !!ctxC?.allOk : !!rulesC?.allOk;
  const timerRatio = timeLeft / currentRound.timeSecs;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const rootBg: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const btnStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };

  const pal = {
    title: isGamified ? "text-white" : "text-[#1a2744]",
    sub: isGamified ? "text-white/70" : "text-[#8a7a6a]",
    ruleBox: isGamified ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-200",
    ruleOk: "text-green-500",
    rulePending: isGamified ? "text-white/40" : "text-gray-400",
    item: isGamified ? "border-white/20 bg-white/10" : "border-slate-200 bg-white shadow-sm",
    itemSel: "border-emerald-500 bg-emerald-50",
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
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="p-5" style={cardStyle}>

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
                : isGamified ? "bg-white/10" : "bg-gray-200"
              }`} />
            ))}
          </div>

          {/* Timer bar */}
          <div className={`h-1.5 rounded-full mb-3 ${isGamified ? "bg-white/10" : "bg-gray-200"}`}>
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {phase === "shopping" && (
              <motion.div key={`shop-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {currentRound.mode === "rules" && (
                  <>
                    {/* Rules checklist */}
                    <div className="rounded-xl p-3 border mb-3 space-y-1.5" style={isGamified ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }}>
                      <p className={`text-[11px] font-bold uppercase tracking-wide mb-2 ${pal.sub}`}>Atenda todas as regras · {currentRound.domain.name}</p>
                      {ruleRow(rulesC!.budgetOk && selected.size > 0, `Máximo ${fmt(currentRound.rules.budget)} (total: ${fmt(rulesC!.total)})`)}
                      {ruleRow(rulesC!.hasCat, `Incluir ${currentRound.rules.category.emoji} ${currentRound.rules.category.label}`)}
                      {ruleRow(rulesC!.qtyOk, `Exatamente ${currentRound.rules.quantity} item${currentRound.rules.quantity !== 1 ? "s" : ""} (${selected.size} selecionado${selected.size !== 1 ? "s" : ""})`)}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {currentRound.items.map(item => (
                        <button key={item.id} onClick={() => toggle(item.id)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${selected.has(item.id) ? pal.itemSel : pal.item}`}>
                          <ItemSvg id={item.id} size={48} />
                          <span className={`text-xs text-center leading-tight font-medium ${isGamified ? "text-white/90" : "text-gray-700"}`}>{item.name}</span>
                          <span className={`text-xs font-bold tabular-nums ${isGamified ? "text-cyan-300" : "text-emerald-600"}`}>{fmt(item.price)}</span>
                          {selected.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {currentRound.mode === "context" && (
                  <>
                    {/* Situação (história) */}
                    <div className="rounded-xl p-3 border mb-3" style={isGamified ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-[11px] font-bold uppercase tracking-wide ${pal.sub}`}>📖 Entenda a situação</p>
                        {currentRound.collapseStory && (
                          <button onClick={() => setStoryOpen(o => !o)} className={`text-[11px] font-semibold underline ${pal.sub}`}>{storyOpen ? "ocultar" : "👁 ver situação"}</button>
                        )}
                      </div>
                      {storyOpen
                        ? <p className={`text-sm font-medium leading-snug ${pal.title}`}>{currentRound.text}</p>
                        : <p className={`text-xs italic ${pal.sub}`}>Toque em &ldquo;ver situação&rdquo; se precisar reler.</p>}
                    </div>
                    {/* Regras neutras */}
                    <div className="rounded-xl p-3 border mb-3 space-y-1.5" style={isGamified ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }}>
                      {ruleRow(ctxC!.qtyOk, `Escolha exatamente ${currentRound.quantity} itens (${selected.size} selecionado${selected.size !== 1 ? "s" : ""})`)}
                      {ruleRow(ctxC!.budgetOk && selected.size > 0, currentRound.hideTotal ? `Total máximo: ${fmt(currentRound.budget)}` : `Total máximo: ${fmt(currentRound.budget)} (atual: ${fmt(ctxC!.total)})`)}
                      <p className={`text-xs font-semibold ${pal.sub}`}>Escolha os itens mais adequados para a situação.</p>
                    </div>
                    {/* Itens (emoji, sem revelar a classificação) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {currentRound.items.map(item => (
                        <button key={item.id} onClick={() => toggle(item.id)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${selected.has(item.id) ? pal.itemSel : pal.item}`}>
                          <span style={{ fontSize: 40, lineHeight: 1 }}>{item.emoji}</span>
                          <span className={`text-xs text-center leading-tight font-medium ${isGamified ? "text-white/90" : "text-gray-700"}`}>{item.name}</span>
                          <span className={`text-xs font-bold tabular-nums ${isGamified ? "text-cyan-300" : "text-emerald-600"}`}>{fmt(item.price)}</span>
                          {selected.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button onClick={() => finishRound(allOk)} disabled={selected.size === 0}
                  className="w-full h-11 font-bold transition-all disabled:opacity-40"
                  style={btnStyle}>
                  {selected.size === 0 ? "Selecione itens" : "→ Confirmar seleção"}
                </button>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div key={`res-${round}`} className="py-6"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-5xl text-center mb-3">{lastCorrect ? "✅" : "❌"}</p>
                <p className={`font-bold text-lg text-center mb-4 ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                  {lastCorrect
                    ? (isCtx ? "Escolha adequada para a situação!" : "Todas as regras cumpridas!")
                    : (isCtx ? "Quase! Pense melhor na situação" : "Nem todas as regras foram atendidas")}
                </p>

                {currentRound.mode === "rules" && !lastCorrect && (
                  <div className="rounded-xl p-3 border space-y-1.5" style={isGamified ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }}>
                    <p className={`text-xs font-bold mb-1 ${pal.sub}`}>O que ficou faltando:</p>
                    {!rulesC!.budgetOk && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Orçamento ultrapassado — total {fmt(rulesC!.total)} de máx {fmt(currentRound.rules.budget)}</span></div>}
                    {!rulesC!.hasCat && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Faltou incluir {currentRound.rules.category.emoji} {currentRound.rules.category.label}</span></div>}
                    {!rulesC!.qtyOk && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Quantidade errada — {selected.size} selecionado{selected.size !== 1 ? "s" : ""}, precisava de {currentRound.rules.quantity}</span></div>}
                  </div>
                )}
                {currentRound.mode === "rules" && lastCorrect && (
                  <p className={`text-xs text-center ${pal.sub}`}>Total: {fmt(rulesC!.total)} · {selected.size} itens</p>
                )}

                {currentRound.mode === "context" && !lastCorrect && (
                  <div className="rounded-xl p-3 border space-y-1.5" style={isGamified ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }}>
                    <p className={`text-xs font-bold mb-1 ${pal.sub}`}>Por que não encaixou:</p>
                    {!ctxC!.qtyOk && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Escolha exatamente {currentRound.quantity} itens — você escolheu {selected.size}.</span></div>}
                    {!ctxC!.budgetOk && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Passou do orçamento — {fmt(ctxC!.total)} de máx {fmt(currentRound.budget)}.</span></div>}
                    {currentRound.noInappropriate && ctxC!.inapCount > 0 && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Havia item que não combina com a situação.</span></div>}
                    {ctxC!.qtyOk && ctxC!.budgetOk && !ctxC!.scoreOk && <div className="flex items-center gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>Alguns itens não eram os mais adequados para essa situação.</span></div>}
                  </div>
                )}
                {currentRound.mode === "context" && lastCorrect && (
                  <p className={`text-xs text-center ${pal.sub}`}>{ctxC!.essCount} item{ctxC!.essCount !== 1 ? "s" : ""} bem adequado{ctxC!.essCount !== 1 ? "s" : ""} · total {fmt(ctxC!.total)}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
