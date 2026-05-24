"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface DesafioSupermercadoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Product {
  id: string;
  name: string;
  emoji: string;
}

// ── Catálogo de produtos ───────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: "arroz", name: "Arroz", emoji: "🌾" },
  { id: "feijao", name: "Feijão", emoji: "🫘" },
  { id: "macarrao", name: "Macarrão", emoji: "🍝" },
  { id: "oleo", name: "Óleo de cozinha", emoji: "🫙" },
  { id: "sal", name: "Sal", emoji: "🧂" },
  { id: "acucar", name: "Açúcar", emoji: "🍬" },
  { id: "cafe", name: "Café", emoji: "☕" },
  { id: "leite", name: "Leite", emoji: "🥛" },
  { id: "manteiga", name: "Manteiga", emoji: "🧈" },
  { id: "pao", name: "Pão", emoji: "🍞" },
  { id: "ovos", name: "Ovos", emoji: "🥚" },
  { id: "queijo", name: "Queijo", emoji: "🧀" },
  { id: "iogurte", name: "Iogurte", emoji: "🍼" },
  { id: "frango", name: "Frango", emoji: "🍗" },
  { id: "carne", name: "Carne moída", emoji: "🥩" },
  { id: "sabao", name: "Sabão em pó", emoji: "🧴" },
  { id: "papel", name: "Papel higiênico", emoji: "🧻" },
  { id: "shampoo", name: "Shampoo", emoji: "🧖" },
  { id: "pasta", name: "Pasta de dente", emoji: "🦷" },
  { id: "sabonete", name: "Sabonete", emoji: "🫧" },
  { id: "detergente", name: "Detergente", emoji: "🧽" },
  { id: "agua-san", name: "Água sanitária", emoji: "🪣" },
  { id: "esponja", name: "Esponja", emoji: "🟩" },
  { id: "saco-lixo", name: "Saco de lixo", emoji: "🗑️" },
  { id: "agua", name: "Água mineral", emoji: "💧" },
  { id: "suco", name: "Suco de caixa", emoji: "🧃" },
  { id: "refrigerante", name: "Refrigerante", emoji: "🥤" },
  { id: "banana", name: "Banana", emoji: "🍌" },
  { id: "maca", name: "Maçã", emoji: "🍎" },
  { id: "tomate", name: "Tomate", emoji: "🍅" },
  { id: "alface", name: "Alface", emoji: "🥬" },
  { id: "batata", name: "Batata", emoji: "🥔" },
  { id: "cenoura", name: "Cenoura", emoji: "🥕" },
  { id: "farinha", name: "Farinha de trigo", emoji: "🌾" },
  { id: "vinagre", name: "Vinagre", emoji: "🍶" },
];

// ── Listas de compras por quantidade ─────────────────────────────────────
const SHOPPING_LISTS: Record<number, string[][]> = {
  3: [
    ["arroz", "feijao", "sal"],
    ["sabao", "papel", "sabonete"],
    ["pao", "manteiga", "cafe"],
    ["banana", "maca", "suco"],
    ["frango", "tomate", "alface"],
    ["pasta", "shampoo", "detergente"],
    ["leite", "ovos", "queijo"],
    ["refrigerante", "batata", "cenoura"],
    ["oleo", "acucar", "farinha"],
    ["agua", "iogurte", "manteiga"],
  ],
  4: [
    ["arroz", "feijao", "oleo", "sal"],
    ["sabao", "papel", "sabonete", "detergente"],
    ["pao", "manteiga", "cafe", "leite"],
    ["banana", "maca", "tomate", "alface"],
    ["frango", "ovos", "queijo", "iogurte"],
    ["macarrao", "oleo", "acucar", "cafe"],
    ["shampoo", "pasta", "agua-san", "esponja"],
    ["refrigerante", "suco", "batata", "cenoura"],
    ["carne", "arroz", "feijao", "tomate"],
    ["agua", "frango", "alface", "sal"],
  ],
  5: [
    ["arroz", "feijao", "oleo", "sal", "macarrao"],
    ["sabao", "papel", "sabonete", "detergente", "esponja"],
    ["pao", "manteiga", "cafe", "leite", "ovos"],
    ["banana", "maca", "tomate", "alface", "cenoura"],
    ["frango", "ovos", "queijo", "iogurte", "leite"],
    ["shampoo", "pasta", "agua-san", "esponja", "saco-lixo"],
    ["refrigerante", "suco", "agua", "batata", "cenoura"],
    ["carne", "arroz", "feijao", "tomate", "oleo"],
  ],
  6: [
    ["arroz", "feijao", "oleo", "sal", "macarrao", "acucar"],
    ["sabao", "papel", "sabonete", "detergente", "esponja", "saco-lixo"],
    ["pao", "manteiga", "cafe", "leite", "ovos", "queijo"],
    ["banana", "maca", "tomate", "alface", "cenoura", "batata"],
    ["frango", "carne", "ovos", "queijo", "iogurte", "leite"],
    ["shampoo", "pasta", "agua-san", "esponja", "saco-lixo", "sabonete"],
  ],
  7: [
    ["arroz", "feijao", "oleo", "sal", "macarrao", "acucar", "cafe"],
    ["sabao", "papel", "sabonete", "detergente", "esponja", "saco-lixo", "agua-san"],
    ["pao", "manteiga", "cafe", "leite", "ovos", "queijo", "iogurte"],
    ["banana", "maca", "tomate", "alface", "cenoura", "batata", "frango"],
  ],
};

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

function initialItemCount(difficulty: number): number {
  if (difficulty <= 2) return 3;
  if (difficulty <= 4) return 4;
  if (difficulty <= 6) return 5;
  if (difficulty <= 8) return 6;
  return 7;
}

function memorizeSeconds(count: number): number {
  return Math.max(5, 13 - count);
}

function buildTrial(count: number, usedLists: Set<string>): { list: Product[]; shelf: Product[] } {
  const lists = SHOPPING_LISTS[count] ?? SHOPPING_LISTS[3];
  const available = lists.filter((l) => !usedLists.has(l.join(",")));
  const listsPool = available.length > 0 ? available : lists;

  const chosen = listsPool[Math.floor(Math.random() * listsPool.length)];
  usedLists.add(chosen.join(","));

  const listProducts = chosen.map((id) => PRODUCT_MAP.get(id)!).filter(Boolean);
  const listIds = new Set(chosen);

  const fillers = PRODUCTS.filter((p) => !listIds.has(p.id));
  const shuffledFillers = [...fillers].sort(() => Math.random() - 0.5);
  const shelfSize = Math.min(PRODUCTS.length, count * 3 + 3);
  const shelf = [...listProducts, ...shuffledFillers.slice(0, shelfSize - count)].sort(
    () => Math.random() - 0.5
  );

  return { list: listProducts, shelf };
}

// ── Tutorial ──────────────────────────────────────────────────────────────
function SupermercadoTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const tutorialList: Product[] = [
    { id: "pao", name: "Pão", emoji: "🍞" },
    { id: "leite", name: "Leite", emoji: "🥛" },
  ];
  const tutorialShelf: Product[] = [
    { id: "arroz", name: "Arroz", emoji: "🌾" },
    { id: "pao", name: "Pão", emoji: "🍞" },
    { id: "cafe", name: "Café", emoji: "☕" },
    { id: "leite", name: "Leite", emoji: "🥛" },
    { id: "ovos", name: "Ovos", emoji: "🥚" },
    { id: "acucar", name: "Açúcar", emoji: "🍬" },
  ];

  const [tutPhase, setTutPhase] = useState<"list" | "shelf">("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const pal = theme === "GAMIFIED"
    ? { bg: "bg-gray-700", text: "text-gray-200", badge: "bg-cyan-600 text-white" }
    : theme === "COLORFUL"
    ? { bg: "bg-violet-50", text: "text-gray-700", badge: "bg-violet-500 text-white" }
    : { bg: "bg-slate-50", text: "text-slate-700", badge: "bg-indigo-500 text-white" };

  useEffect(() => {
    if (tutPhase === "list") {
      const t = setTimeout(() => setTutPhase("shelf"), 3000);
      return () => clearTimeout(t);
    }
  }, [tutPhase]);

  function toggleSelect(id: string) {
    if (done) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);

    if (next.has("pao") && next.has("leite") && next.size === 2) {
      setDone(true);
    }
  }

  const steps = [
    {
      instruction: "Memorize os itens da lista — ela vai desaparecer em breve!",
      content: (onStepDone: () => void) => {
        useEffect(() => { const t = setTimeout(onStepDone, 3200); return () => clearTimeout(t); }, []);
        return (
          <div className={`rounded-xl p-4 space-y-2 ${pal.bg}`}>
            <p className={`text-sm font-bold ${pal.text}`}>Sua lista:</p>
            {tutorialList.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className={`text-sm ${pal.text}`}>{p.name}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      instruction: "Agora selecione na prateleira os itens que você memorizou.",
      content: (onStepDone: () => void) => {
        const [sel, setSel] = useState(new Set<string>());
        const doneRef = useRef(false);

        function tap(id: string) {
          if (doneRef.current) return;
          const next = new Set(sel);
          next.has(id) ? next.delete(id) : next.add(id);
          setSel(next);
          if (next.has("pao") && next.has("leite") && !doneRef.current) {
            doneRef.current = true;
            setTimeout(onStepDone, 600);
          }
        }

        return (
          <div className="grid grid-cols-3 gap-2">
            {tutorialShelf.map((p) => {
              const active = sel.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => tap(p.id)}
                  className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    active
                      ? "border-green-500 bg-green-50"
                      : theme === "GAMIFIED"
                      ? "border-gray-600 bg-gray-700"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className={`text-xs text-center leading-tight ${pal.text}`}>{p.name}</span>
                </button>
              );
            })}
          </div>
        );
      },
    },
  ];

  return <TutorialBase theme={theme} title="Desafio do Supermercado" steps={steps} onDone={onDone} />;
}

// ── Componente principal ───────────────────────────────────────────────────
const MAX_TRIALS = 8;

export function DesafioSupermercado({ difficulty, theme, onComplete }: DesafioSupermercadoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"memorizing" | "shopping" | "result">("memorizing");
  const [countdown, setCountdown] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [itemCount, setItemCount] = useState(() => initialItemCount(difficulty));
  const [streak, setStreak] = useState(0);

  const usedLists = useRef(new Set<string>());
  const startTime = useRef(Date.now());

  const [currentList, setCurrentList] = useState<Product[]>([]);
  const [shelfProducts, setShelfProducts] = useState<Product[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextItemCountRef = useRef(itemCount);

  const initTrial = useCallback((count: number) => {
    const { list, shelf } = buildTrial(count, usedLists.current);
    setCurrentList(list);
    setShelfProducts(shelf);
    setSelected(new Set());
    setPhase("memorizing");
  }, []);

  // Inicializar primeiro trial após tutorial
  useEffect(() => {
    if (!showTutorial) {
      initTrial(itemCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  // Countdown de memorização
  useEffect(() => {
    if (phase !== "memorizing") return;
    const total = memorizeSeconds(itemCount);
    setCountdown(total);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPhase("shopping");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial]);

  function toggleProduct(id: string) {
    if (phase !== "shopping") return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const correctIds = new Set(currentList.map((p) => p.id));
    const correctSelected = [...selected].filter((id) => correctIds.has(id)).length;
    const wrongSelected = [...selected].filter((id) => !correctIds.has(id)).length;
    const isCorrect = correctSelected === correctIds.size && wrongSelected === 0;

    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextCount = itemCount;
    let resetStreak = false;

    if (newStreak >= 2) {
      nextCount = Math.min(itemCount + 1, 7);
      resetStreak = true;
    } else if (newStreak <= -2) {
      nextCount = Math.max(itemCount - 1, 3);
      resetStreak = true;
    }

    nextItemCountRef.current = nextCount;
    setStreak(resetStreak ? 0 : newStreak);
    setItemCount(nextCount);

    const newResults = [...trialResults, isCorrect];
    setTrialResults(newResults);
    setPhase("result");

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const correct = newResults.filter(Boolean).length;
        const accuracy = correct / MAX_TRIALS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        onComplete({
          exerciseId: "desafio-supermercado",
          domain: "memory",
          score: calculateExerciseScore("desafio-supermercado", accuracy, undefined, difficulty),
          accuracy,
          difficulty,
          duration,
          metadata: { trials: MAX_TRIALS, correct },
        });
      } else {
        setTrial(nextTrial);
        initTrial(nextItemCountRef.current);
      }
    }, 1600);
  }

  if (showTutorial) {
    return <SupermercadoTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  // ── Paleta de temas ────────────────────────────────────────────────────
  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-slate-50 via-white to-emerald-50/30",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : theme === "COLORFUL" ? "bg-white border-2 border-emerald-200 shadow-xl" : "bg-white border border-slate-200/70 shadow-md",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-emerald-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : theme === "COLORFUL" ? "text-emerald-600" : "text-slate-500",
    accent: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-emerald-600" : "text-emerald-600",
    listBg: theme === "GAMIFIED" ? "bg-gray-700" : theme === "COLORFUL" ? "bg-emerald-50 border border-emerald-200" : "bg-emerald-50/60 border border-emerald-100",
    productCard: theme === "GAMIFIED" ? "border-gray-600 bg-gray-700 hover:border-cyan-400" : theme === "COLORFUL" ? "border-emerald-200 bg-white hover:border-emerald-400" : "border-slate-200 bg-white hover:border-emerald-300 shadow-sm",
    selectedCard: theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-emerald-500 bg-emerald-50",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : theme === "COLORFUL" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white",
    dotActive: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-emerald-500" : "bg-emerald-500",
    dotInactive: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200",
  };

  const memorizeTotal = memorizeSeconds(itemCount);
  const countdownRatio = countdown / memorizeTotal;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${pal.card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🛒 Desafio do Supermercado</h2>
          <span className={`text-xs ${pal.sub}`}>{trial + 1}/{MAX_TRIALS}</span>
        </div>

        {/* Barra de progresso de trials */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < trialResults.length
                  ? trialResults[i] ? "bg-green-500" : "bg-red-400"
                  : i === trial ? `${pal.dotActive} animate-pulse` : pal.dotInactive
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* FASE: Memorização */}
          {phase === "memorizing" && (
            <motion.div
              key="memorizing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-center mb-3">
                <p className={`font-bold text-sm ${pal.title}`}>Memorize os itens da lista!</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`h-1.5 w-32 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                      style={{ width: `${countdownRatio * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums font-mono ${pal.sub}`}>{countdown}s</span>
                </div>
              </div>

              <div className={`rounded-xl p-4 space-y-2.5 ${pal.listBg}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${pal.accent}`}>
                  Sua lista de compras ({itemCount} itens)
                </p>
                {currentList.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
                      {p.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* FASE: Compras */}
          {phase === "shopping" && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-3">
                <p className={`font-bold text-sm ${pal.title}`}>Encontre os itens da sua lista!</p>
                <p className={`text-xs mt-0.5 ${pal.sub}`}>
                  Selecione {itemCount} {itemCount === 1 ? "item" : "itens"} · {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {shelfProducts.map((p) => {
                  const isSelected = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                        isSelected ? pal.selectedCard : pal.productCard
                      }`}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className={`text-xs text-center leading-tight ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-green-600 font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleConfirm}
                disabled={selected.size === 0}
                className={`w-full h-11 rounded-xl font-bold transition-all ${pal.btn} disabled:opacity-40`}
              >
                Confirmar seleção ({selected.size}/{itemCount})
              </button>
            </motion.div>
          )}

          {/* FASE: Resultado */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-2"
            >
              <p className={`font-bold text-sm text-center mb-3 ${pal.title}`}>
                Resultado desta rodada
              </p>
              <div className="grid grid-cols-3 gap-2">
                {currentList.map((p) => {
                  const wasSelected = selected.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${
                        wasSelected ? "border-green-500 bg-green-50" : "border-red-300 bg-red-50"
                      }`}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-xs text-center leading-tight text-gray-700">{p.name}</span>
                      <span>{wasSelected ? "✅" : "❌"}</span>
                    </div>
                  );
                })}
              </div>
              {/* Itens selecionados incorretamente */}
              {[...selected].some((id) => !currentList.find((p) => p.id === id)) && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Alguns itens selecionados não estavam na lista.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak indicator */}
        {streak !== 0 && phase !== "result" && (
          <p className={`text-xs text-center mt-2 ${pal.sub}`}>
            {streak > 0 ? `🔥 ${streak} acerto${streak > 1 ? "s" : ""} seguido${streak > 1 ? "s" : ""}` : `${Math.abs(streak)} erro${Math.abs(streak) > 1 ? "s" : ""} seguido${Math.abs(streak) > 1 ? "s" : ""}`}
          </p>
        )}
      </div>
    </div>
  );
}
