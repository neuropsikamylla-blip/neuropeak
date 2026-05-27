"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import { shuffleFlex, fmt, pickRandomDomain, type FlexDomain, type FlexItem } from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_ROUNDS = 8;

type GoalType = "max" | "range" | "min";

interface Goal {
  type: GoalType;
  min?: number;
  max: number;
  label: string;
}

interface Round {
  domain: FlexDomain;
  items: FlexItem[];
  goal: Goal;
  story: string;
  storyIcon: string;
}

// ── Histórias por domínio ──────────────────────────────────────────────────

const STORIES: Record<string, { icon: string; lines: string[] }> = {
  supermercado: {
    icon: "🛒",
    lines: [
      "Sua mãe pediu para você fazer as compras da semana enquanto ela está no trabalho.",
      "Você quer preparar um jantar especial para a família. Precisa escolher os ingredientes.",
      "O vizinho está doente e pediu para você buscar algumas coisas no mercado pra ele.",
      "Hoje é dia das compras do mês! Veja o que está faltando em casa.",
      "Você vai receber amigos para o almoço de domingo e precisa organizar o cardápio.",
      "Sua avó deixou uma lista de compras. Você vai ao mercado no lugar dela.",
      "Saiu mais cedo do trabalho e decidiu aproveitar para abastecer a despensa.",
      "É quarta-feira, dia de promoção no mercado! Hora de comprar com inteligência.",
    ],
  },
  brinquedos: {
    icon: "🎁",
    lines: [
      "O aniversário do seu sobrinho é semana que vem. Você quer comprar um presente especial.",
      "Chegou o Natal! Você separou uma verba para comprar presentes para as crianças da família.",
      "A escola promoveu um brechó de brinquedos. Você levou dinheiro para comprar.",
      "Você ganhou um vale-presente em uma loja de brinquedos. Hora de escolher!",
      "É o Dia das Crianças e você quer surpreender as crianças com um presente dentro do orçamento.",
      "Você vai a uma festa de aniversário e precisa levar um presente sem gastar muito.",
      "Seu amigo vai ser pai e você quer dar um presente de chá de bebê.",
      "Promoção de fim de ano na loja de brinquedos! Compre com sabedoria.",
    ],
  },
  vestuario: {
    icon: "👕",
    lines: [
      "Você ganhou um vale-presente e quer renovar o guarda-roupa. Confira as opções.",
      "Está chegando o inverno e você precisa comprar algumas peças mais quentes.",
      "Tem uma festa importante no fim de semana e você quer se arrumar dentro do orçamento.",
      "Você foi promovido no trabalho e precisa de roupas mais formais. Veja o que cabe no bolso.",
      "Liquidação de verão! Bons produtos, mas você precisa controlar os gastos.",
      "Vai viajar para um lugar frio e precisa de roupas adequadas. Orçamento limitado.",
      "A academia começou amanhã! Você precisa comprar roupas de treino.",
      "Você vai presentear um amigo com roupas no aniversário dele.",
    ],
  },
};

function getStory(domainId: string, roundIdx: number): { icon: string; line: string } {
  const bank = STORIES[domainId] ?? STORIES["supermercado"];
  const idx = roundIdx % bank.lines.length;
  return { icon: bank.icon, line: bank.lines[idx] };
}

function itemCount(d: number): number { return d <= 3 ? 8 : d <= 6 ? 10 : 12; }

function buildRound(d: number, roundIdx: number): Round {
  const domain = pickRandomDomain();
  const count = itemCount(d);
  const items = shuffleFlex(domain.items).slice(0, count);
  const allPrices = items.map(i => i.price);
  const total = allPrices.reduce((s, p) => s + p, 0);
  const avgPrice = total / count;

  let goal: Goal;
  if (d <= 3) {
    const budget = Math.round((avgPrice * (2 + Math.random())) * 10) / 10;
    goal = { type: "max", max: budget, label: `Gaste no máximo ${fmt(budget)}` };
  } else if (d <= 6) {
    const mid = avgPrice * (1.5 + Math.random() * 1.5);
    const range = avgPrice * 0.4;
    const min = Math.round((mid - range) * 10) / 10;
    const max = Math.round((mid + range) * 10) / 10;
    goal = { type: "range", min, max, label: `Gaste entre ${fmt(min)} e ${fmt(max)}` };
  } else {
    const minBudget = Math.round((avgPrice * 1.5) * 10) / 10;
    const maxBudget = Math.round((avgPrice * 3) * 10) / 10;
    goal = { type: "range", min: minBudget, max: maxBudget, label: `Gaste entre ${fmt(minBudget)} e ${fmt(maxBudget)}` };
  }

  const { icon, line } = getStory(domain.id, roundIdx);
  return { domain, items, goal, story: line, storyIcon: icon };
}

function isGoalMet(total: number, goal: Goal): boolean {
  if (goal.type === "max") return total > 0 && total <= goal.max;
  if (goal.type === "range") return total >= (goal.min ?? 0) && total <= goal.max;
  if (goal.type === "min") return total >= (goal.min ?? 0);
  return false;
}

// ── Tutorial ───────────────────────────────────────────────────────────────

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const items: FlexItem[] = [
    { id: "banana", name: "Banana", cat: "hortifruti", price: 3.90 },
    { id: "leite",  name: "Leite",  cat: "laticinios", price: 5.90 },
    { id: "cafe",   name: "Café",   cat: "mercearia",  price: 11.90 },
    { id: "sabao",  name: "Sabão",  cat: "higiene",    price: 18.90 },
  ];
  const goal: Goal = { type: "max", max: 15.00, label: `Gaste no máximo ${fmt(15.00)}` };
  const [sel, setSel] = useState(new Set<string>());
  const [confirmed, setConfirmed] = useState(false);
  const [ok, setOk] = useState(false);
  const doneRef = useRef(false);

  const total = items.filter(i => sel.has(i.id)).reduce((s, i) => s + i.price, 0);
  const totalRounded = Math.round(total * 100) / 100;
  const met = isGoalMet(totalRounded, goal);

  function toggle(id: string) {
    if (confirmed) return;
    setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirm() {
    if (doneRef.current || sel.size === 0) return;
    setConfirmed(true);
    setOk(met);
    if (met) { doneRef.current = true; setTimeout(onDone, 900); }
    else setTimeout(() => { setSel(new Set()); setConfirmed(false); }, 1000);
  }

  const goalBg = theme === "GAMIFIED" ? "bg-amber-900/40 border-amber-600" : "bg-amber-50 border-amber-300";
  const goalTxt = theme === "GAMIFIED" ? "text-amber-300" : "text-amber-800";
  const text = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const storyBg = theme === "GAMIFIED" ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200";
  const storyTxt = theme === "GAMIFIED" ? "text-blue-300" : "text-blue-700";

  return (
    <div className="space-y-3">
      <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${storyBg}`}>
        <span className="text-lg shrink-0">🛒</span>
        <p className={`text-xs leading-snug ${storyTxt}`}>
          Sua mãe pediu para você fazer as compras da semana. Ela deixou R$15,00 para gastar.
        </p>
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${goalBg}`}>
        <span className="text-lg">💰</span>
        <p className={`text-sm font-bold ${goalTxt}`}>{goal.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
              sel.has(item.id) ? "border-green-500 bg-green-50" :
              theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white"
            }`}>
            <ItemSvg id={item.id} size={56} />
            <span className={`text-xs font-semibold ${text}`}>{item.name}</span>
            <span className={`text-xs font-bold ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>{fmt(item.price)}</span>
            {sel.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
          </button>
        ))}
      </div>
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-100"}`}>
        <span className={`text-xs ${sub}`}>{sel.size} item(s) selecionado(s)</span>
        <span className={`text-xs ${sub}`}>💡 Calcule mentalmente</span>
      </div>
      {confirmed && !ok && <p className="text-xs text-center text-red-500 font-semibold">Orçamento não respeitado! Tente de novo.</p>}
      <button onClick={confirm} disabled={sel.size === 0}
        className={`w-full h-11 rounded-xl font-bold text-white transition-all disabled:opacity-40 ${
          theme === "GAMIFIED" ? "bg-cyan-600" : "bg-indigo-600"
        }`}>
        Confirmar compra
      </button>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [currentRound, setCurrentRound] = useState<Round>(() => buildRound(difficulty, 0));

  const startTime = useRef(Date.now());
  const roundRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);

  function toggle(id: string) {
    if (phase !== "shopping") return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const total = currentRound.items.filter(i => selected.has(i.id)).reduce((s, i) => s + i.price, 0);
  const totalRounded = Math.round(total * 100) / 100;
  const met = isGoalMet(totalRounded, currentRound.goal);

  function confirm() {
    if (phase !== "shopping" || selected.size === 0) return;
    const isCorrect = met;
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
          exerciseId: "desafio-orcamento",
          domain: "executive",
          score: calculateExerciseScore("desafio-orcamento", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(Boolean).length },
        });
      } else {
        roundRef.current = nextR;
        setRound(nextR);
        setSelected(new Set());
        setCurrentRound(buildRound(difficulty, nextR));
        setPhase("shopping");
      }
    }, 1800);
  }

  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Desafio do Orçamento"
        steps={[{
          instruction: "Você terá uma situação do dia a dia e um orçamento para respeitar. Escolha os itens, faça as contas de cabeça e confirme a compra!",
          content: (done) => <TutStep theme={theme} onDone={done} />,
        }]}
        onDone={() => setShowTutorial(false)} />
    );
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gray-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-emerald-700" : "text-gray-900",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    storyBg: theme === "GAMIFIED" ? "bg-blue-900/30 border-blue-700/50" : theme === "COLORFUL" ? "bg-sky-50 border-sky-300" : "bg-blue-50 border-blue-200",
    storyTxt: theme === "GAMIFIED" ? "text-blue-300" : "text-blue-700",
    goalBg: theme === "GAMIFIED" ? "bg-amber-900/30 border-amber-600/50" : theme === "COLORFUL" ? "bg-amber-50 border-amber-300" : "bg-amber-50 border-amber-200",
    goalTxt: theme === "GAMIFIED" ? "text-amber-300" : "text-amber-800",
    item: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white shadow-sm",
    itemSel: "border-green-500 bg-green-50",
    totalBg: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-100",
    btnConfirm: theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-md mx-auto px-3 py-4">
        <div className={`rounded-2xl p-4 ${pal.card}`}>

          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-base ${pal.title}`}>💰 Desafio do Orçamento</h2>
            <span className={`text-xs ${pal.sub}`}>{round + 1}/{MAX_ROUNDS} · {currentRound.domain.name}</span>
          </div>

          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < roundResults.length ? (roundResults[i] ? "bg-green-500" : "bg-red-400")
                : i === round ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {phase === "shopping" && (
              <motion.div key={`shop-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                {/* Historinha */}
                <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border mb-2 ${pal.storyBg}`}>
                  <span className="text-base shrink-0">{currentRound.storyIcon}</span>
                  <p className={`text-xs leading-snug ${pal.storyTxt}`}>{currentRound.story}</p>
                </div>

                {/* Orçamento */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-3 ${pal.goalBg}`}>
                  <span className="text-lg">💰</span>
                  <p className={`text-sm font-bold ${pal.goalTxt}`}>{currentRound.goal.label}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {currentRound.items.map(item => (
                    <button key={item.id} onClick={() => toggle(item.id)}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                        selected.has(item.id) ? pal.itemSel : pal.item
                      }`}>
                      <ItemSvg id={item.id} size={52} />
                      <span className={`text-[11px] text-center leading-none font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                        {item.name}
                      </span>
                      <span className={`text-[11px] font-bold tabular-nums ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                        {fmt(item.price)}
                      </span>
                      {selected.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${pal.totalBg}`}>
                  <span className={`text-xs ${pal.sub}`}>{selected.size} item(ns) selecionado(s)</span>
                  <span className={`text-xs ${pal.sub}`}>💡 Calcule o total mentalmente</span>
                </div>

                <button onClick={confirm} disabled={selected.size === 0}
                  className={`w-full h-11 rounded-xl font-bold transition-all disabled:opacity-40 ${pal.btnConfirm}`}>
                  {selected.size === 0 ? "Selecione itens" : "Confirmar compra"}
                </button>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div key={`res-${round}`} className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-5xl mb-2">{lastCorrect ? "✅" : "❌"}</p>
                <p className={`font-bold text-lg ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                  {lastCorrect ? "Orçamento respeitado!" : "Tente de novo na próxima"}
                </p>
                <p className={`text-sm mt-1 ${pal.sub}`}>
                  Você gastou: <strong>{fmt(totalRounded)}</strong> · {currentRound.goal.label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
