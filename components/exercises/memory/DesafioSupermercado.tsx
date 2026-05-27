"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { ProductSvg } from "./ProductSvg";

export interface DesafioSupermercadoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  mode?: "leitura" | "auditivo";
}

interface Product {
  id: string;
  name: string;
}

const PRODUCTS: Product[] = [
  { id: "arroz", name: "Arroz" },
  { id: "feijao", name: "Feijão" },
  { id: "macarrao", name: "Macarrão" },
  { id: "oleo", name: "Óleo" },
  { id: "sal", name: "Sal" },
  { id: "acucar", name: "Açúcar" },
  { id: "cafe", name: "Café" },
  { id: "leite", name: "Leite" },
  { id: "manteiga", name: "Manteiga" },
  { id: "pao", name: "Pão" },
  { id: "ovos", name: "Ovos" },
  { id: "queijo", name: "Queijo" },
  { id: "iogurte", name: "Iogurte" },
  { id: "frango", name: "Frango" },
  { id: "carne", name: "Carne" },
  { id: "sabao", name: "Sabão" },
  { id: "papel", name: "Papel higiênico" },
  { id: "shampoo", name: "Shampoo" },
  { id: "pasta", name: "Pasta de dente" },
  { id: "sabonete", name: "Sabonete" },
  { id: "detergente", name: "Detergente" },
  { id: "agua-san", name: "Água sanitária" },
  { id: "esponja", name: "Esponja" },
  { id: "saco-lixo", name: "Saco de lixo" },
  { id: "agua", name: "Água" },
  { id: "suco", name: "Suco" },
  { id: "refrigerante", name: "Refrigerante" },
  { id: "banana", name: "Banana" },
  { id: "maca", name: "Maçã" },
  { id: "tomate", name: "Tomate" },
  { id: "alface", name: "Alface" },
  { id: "batata", name: "Batata" },
  { id: "cenoura", name: "Cenoura" },
  { id: "farinha", name: "Farinha" },
  { id: "vinagre", name: "Vinagre" },
];

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

function memorizeSeconds(count: number, mode: "leitura" | "auditivo"): number {
  // auditivo gets a bit longer to allow audio to finish
  const base = Math.max(5, 13 - count);
  return mode === "auditivo" ? base + 2 : base;
}

function buildTrial(count: number, usedLists: Set<string>): { list: Product[]; shelf: Product[] } {
  const lists = SHOPPING_LISTS[count] ?? SHOPPING_LISTS[3];
  const available = lists.filter((l) => !usedLists.has(l.join(",")));
  const pool = available.length > 0 ? available : lists;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  usedLists.add(chosen.join(","));

  const listProducts = chosen.map((id) => PRODUCT_MAP.get(id)!).filter(Boolean);
  const listIds = new Set(chosen);
  const fillers = PRODUCTS.filter((p) => !listIds.has(p.id)).sort(() => Math.random() - 0.5);
  const shelfSize = Math.min(PRODUCTS.length, count * 2 + 4);
  const shelf = [...listProducts, ...fillers.slice(0, shelfSize - count)].sort(() => Math.random() - 0.5);
  return { list: listProducts, shelf };
}

// ── Web Speech ──────────────────────────────────────────────────────────────
function speakList(items: Product[], onDone?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onDone?.();
    return;
  }
  window.speechSynthesis.cancel();

  // Intro utterance
  const intro = new SpeechSynthesisUtterance("Sua lista de compras:");
  intro.lang = "pt-BR";
  intro.rate = 0.88;
  intro.pitch = 1.05;

  // Item utterances with slight pauses via rate
  const utterances = items.map((item) => {
    const u = new SpeechSynthesisUtterance(item.name);
    u.lang = "pt-BR";
    u.rate = 0.82;
    u.pitch = 1.0;
    return u;
  });

  const last = utterances[utterances.length - 1];
  if (last) last.onend = () => onDone?.();

  window.speechSynthesis.speak(intro);
  utterances.forEach((u) => window.speechSynthesis.speak(u));
}

// ── Shelf component ──────────────────────────────────────────────────────────
const COLS = 4;

function Shelf({
  products,
  selected,
  onToggle,
  showLabels,
  theme,
}: {
  products: Product[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  showLabels: boolean;
  theme: Theme;
}) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += COLS) {
    rows.push(products.slice(i, i + COLS));
  }

  const woodLight = "#c8974a";
  const woodDark = "#a0722a";
  const wallColor = theme === "GAMIFIED" ? "#1e293b" : "#6b4c2a";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: wallColor,
        boxShadow: "inset 0 3px 12px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      {/* Store sign strip */}
      <div
        className="text-center py-1.5 text-xs font-bold tracking-widest uppercase text-white"
        style={{
          background: theme === "GAMIFIED"
            ? "linear-gradient(90deg,#0e7490,#0891b2)"
            : "linear-gradient(90deg,#92400e,#b45309)",
          letterSpacing: "0.18em",
        }}
      >
        🛒 SUPERMERCADO
      </div>

      <div className="p-2 space-y-0">
        {rows.map((row, ri) => (
          <div key={ri}>
            {/* Product row */}
            <div className={`grid gap-1.5 py-1.5 px-1`} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {row.map((p) => {
                const isSel = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => onToggle(p.id)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all active:scale-95 ${
                      isSel
                        ? "border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-200/50 scale-[1.04]"
                        : theme === "GAMIFIED"
                        ? "border-slate-600/50 bg-slate-800/70 hover:border-cyan-400/60"
                        : "border-amber-200/40 bg-amber-50/90 hover:border-amber-400"
                    }`}
                  >
                    <ProductSvg id={p.id} size={60} />
                    {showLabels && (
                      <span className={`text-[10px] text-center leading-tight font-semibold w-full ${
                        isSel
                          ? "text-amber-700"
                          : theme === "GAMIFIED"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}>
                        {p.name}
                      </span>
                    )}
                    {isSel && (
                      <span className="text-xs font-bold text-yellow-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Wood plank divider */}
            <div
              className="h-3 rounded-sm mx-0.5"
              style={{
                background: `linear-gradient(to bottom, ${woodLight} 0%, ${woodDark} 60%, rgba(0,0,0,0.3) 100%)`,
                boxShadow: "0 3px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tutorial ─────────────────────────────────────────────────────────────────
const TUT_LIST: Product[] = [
  { id: "pao", name: "Pão" },
  { id: "leite", name: "Leite" },
];
const TUT_SHELF: Product[] = [
  { id: "arroz", name: "Arroz" },
  { id: "pao", name: "Pão" },
  { id: "cafe", name: "Café" },
  { id: "leite", name: "Leite" },
  { id: "ovos", name: "Ovos" },
  { id: "acucar", name: "Açúcar" },
  { id: "maca", name: "Maçã" },
  { id: "sal", name: "Sal" },
];

function TutMemorizeStep({ theme, mode, onDone }: { theme: Theme; mode: "leitura" | "auditivo"; onDone: () => void }) {
  const [countdown, setCountdown] = useState(5);
  const bg = theme === "GAMIFIED" ? "bg-slate-700" : "bg-amber-50 border border-amber-200";
  const txt = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";

  useEffect(() => {
    if (mode === "auditivo") speakList(TUT_LIST);
    const iv = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { clearInterval(iv); onDone(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => { clearInterval(iv); if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`rounded-xl p-4 space-y-3 ${bg}`}>
      <div className="flex justify-between items-center mb-2">
        <p className={`text-sm font-bold ${txt}`}>
          {mode === "auditivo" ? "🔊 Ouça os itens da lista:" : "📋 Memorize a lista:"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600 font-mono">{countdown}s</span>
          <button onClick={onDone} className="text-xs px-2 py-0.5 rounded-lg font-bold bg-amber-500 text-white">Pronto →</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TUT_LIST.map((p) => (
          <div key={p.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${
            theme === "GAMIFIED" ? "border-slate-500 bg-slate-800" : "border-amber-300 bg-white"
          }`}>
            <ProductSvg id={p.id} size={72} />
            {mode === "leitura" && (
              <span className={`text-sm font-bold text-center ${txt}`}>{p.name}</span>
            )}
            {mode === "auditivo" && (
              <span className="text-xl">🔊</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TutShelfStep({ theme, mode, onDone }: { theme: Theme; mode: "leitura" | "auditivo"; onDone: () => void }) {
  const [sel, setSel] = useState(new Set<string>());
  const doneRef = useRef(false);
  const txt = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700";

  function tap(id: string) {
    if (doneRef.current) return;
    setSel((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.has("pao") && next.has("leite") && !doneRef.current) {
        doneRef.current = true;
        setTimeout(onDone, 600);
      }
      return next;
    });
  }

  return (
    <div>
      <p className={`text-xs mb-2 ${txt}`}>
        {mode === "auditivo"
          ? "Toque nos produtos que você OUVIU na lista."
          : "Toque nos produtos que estavam na lista."}
      </p>
      <Shelf products={TUT_SHELF} selected={sel} onToggle={tap} showLabels={mode === "leitura"} theme={theme} />
    </div>
  );
}

function SupermercadoTutorial({ theme, mode, onDone }: { theme: Theme; mode: "leitura" | "auditivo"; onDone: () => void }) {
  const modeLabel = mode === "auditivo" ? "Auditivo" : "Leitura";
  const steps = [
    {
      instruction: mode === "auditivo"
        ? "Você vai OUVIR uma lista de compras. Memorize os itens pelo som!"
        : "Uma lista de compras vai aparecer. Memorize os produtos!",
      content: (done: () => void) => <TutMemorizeStep theme={theme} mode={mode} onDone={done} />,
    },
    {
      instruction: mode === "auditivo"
        ? "Agora encontre na prateleira os produtos que você ouviu — reconheça pelo desenho!"
        : "Agora encontre na prateleira os itens que você memorizou.",
      content: (done: () => void) => <TutShelfStep theme={theme} mode={mode} onDone={done} />,
    },
  ];
  return (
    <TutorialBase
      theme={theme}
      title={`Desafio do Supermercado — ${modeLabel}`}
      steps={steps}
      onDone={onDone}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const MAX_TRIALS = 8;

export function DesafioSupermercado({ difficulty, theme, onComplete, mode = "leitura" }: DesafioSupermercadoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"memorizing" | "shopping" | "result">("memorizing");
  const [countdown, setCountdown] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [itemCount, setItemCount] = useState(() => initialItemCount(difficulty));
  const [streak, setStreak] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const usedLists = useRef(new Set<string>());
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextCountRef = useRef(itemCount);

  const [currentList, setCurrentList] = useState<Product[]>([]);
  const [shelfProducts, setShelfProducts] = useState<Product[]>([]);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const initTrial = useCallback((count: number) => {
    const { list, shelf } = buildTrial(count, usedLists.current);
    setCurrentList(list);
    setShelfProducts(shelf);
    setSelected(new Set());
    setPhase("memorizing");
  }, []);

  useEffect(() => {
    if (!showTutorial) initTrial(itemCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  // Memorization countdown + audio
  useEffect(() => {
    if (phase !== "memorizing" || showTutorial || currentList.length === 0) return;

    const total = memorizeSeconds(itemCount, mode);
    setCountdown(total);

    if (mode === "auditivo") {
      setAudioPlaying(true);
      speakList(currentList, () => setAudioPlaying(false));
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          setPhase("shopping");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimer();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial, showTutorial]);

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
    if (newStreak >= 2) { nextCount = Math.min(itemCount + 1, 7); resetStreak = true; }
    else if (newStreak <= -2) { nextCount = Math.max(itemCount - 1, 3); resetStreak = true; }
    nextCountRef.current = nextCount;
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
        onComplete({
          exerciseId: mode === "auditivo" ? "desafio-supermercado-auditivo" : "desafio-supermercado",
          domain: "memory",
          score: calculateExerciseScore("desafio-supermercado", accuracy, undefined, difficulty),
          accuracy,
          difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { trials: MAX_TRIALS, correct, mode },
        });
      } else {
        setTrial(nextTrial);
        initTrial(nextCountRef.current);
      }
    }, 1800);
  }

  if (showTutorial) {
    return <SupermercadoTutorial theme={theme} mode={mode} onDone={() => setShowTutorial(false)} />;
  }

  // ── Paleta ─────────────────────────────────────────────────────────────────
  const pal = {
    bg: theme === "GAMIFIED"
      ? "bg-slate-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-amber-50 to-orange-50"
      : "bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30",
    card: theme === "GAMIFIED"
      ? "bg-slate-800 border border-slate-600/40"
      : "bg-white border border-amber-200 shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : "text-amber-800",
    sub: theme === "GAMIFIED" ? "text-slate-400" : "text-amber-600",
    accent: theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700" : "bg-amber-500 hover:bg-amber-600",
    listCard: theme === "GAMIFIED"
      ? "border-slate-600 bg-slate-700"
      : "border-amber-300 bg-amber-50",
    dot: (i: number, results: boolean[]) => {
      if (i < results.length) return results[i] ? "bg-green-500" : "bg-red-400";
      if (i === results.length) return (theme === "GAMIFIED" ? "bg-cyan-500" : "bg-amber-500") + " animate-pulse";
      return theme === "GAMIFIED" ? "bg-slate-700" : "bg-amber-100";
    },
  };

  const memorizeTotal = memorizeSeconds(itemCount, mode);
  const ratio = memorizeTotal > 0 ? countdown / memorizeTotal : 0;

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 pt-6 ${pal.bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl p-5 ${pal.card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-sm ${pal.title}`}>
            {mode === "auditivo" ? "🔊 Supermercado Auditivo" : "📋 Supermercado — Leitura"}
          </h2>
          <span className={`text-xs ${pal.sub}`}>{trial + 1}/{MAX_TRIALS}</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${pal.dot(i, trialResults)}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* FASE: Memorização */}
          {phase === "memorizing" && (
            <motion.div key="mem" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="text-center mb-3">
                <p className={`font-bold text-sm ${pal.title}`}>
                  {mode === "auditivo" ? "🎧 Ouça a lista de compras!" : "👀 Memorize a lista!"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <div className={`h-1.5 w-36 rounded-full ${theme === "GAMIFIED" ? "bg-slate-700" : "bg-amber-100"}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${theme === "GAMIFIED" ? "bg-cyan-400" : "bg-amber-400"}`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums font-mono ${pal.sub}`}>{countdown}s</span>
                </div>
                {mode === "auditivo" && audioPlaying && (
                  <p className="text-xs text-amber-500 mt-1 animate-pulse">🔊 Reproduzindo lista...</p>
                )}
              </div>

              {/* Lista */}
              <div className={`rounded-xl p-3 ${theme === "GAMIFIED" ? "bg-slate-900/60" : "bg-amber-50 border border-amber-200"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${pal.sub}`}>
                  🛒 Lista ({itemCount} {itemCount === 1 ? "item" : "itens"})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {currentList.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.07 }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 ${pal.listCard}`}
                    >
                      <ProductSvg id={p.id} size={68} />
                      {mode === "leitura" && (
                        <span className={`text-xs font-bold text-center leading-tight ${
                          theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"
                        }`}>{p.name}</span>
                      )}
                      {mode === "auditivo" && (
                        <span className="text-base">🔊</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  clearTimer();
                  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
                  setPhase("shopping");
                }}
                className={`w-full mt-3 h-10 rounded-xl font-bold text-sm text-white transition-all ${pal.accent}`}
              >
                Já memorizei → ir para a prateleira
              </button>
            </motion.div>
          )}

          {/* FASE: Compras */}
          {phase === "shopping" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex justify-between items-center mb-2">
                <p className={`font-bold text-sm ${pal.title}`}>Encontre os itens na prateleira!</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  selected.size === itemCount
                    ? "bg-green-100 text-green-700"
                    : theme === "GAMIFIED" ? "bg-slate-700 text-slate-300" : "bg-amber-100 text-amber-600"
                }`}>
                  {selected.size}/{itemCount}
                </span>
              </div>

              {mode === "auditivo" && (
                <p className={`text-xs mb-2 text-center italic ${pal.sub}`}>
                  Reconheça os produtos pelos desenhos — sem nomes!
                </p>
              )}

              <Shelf
                products={shelfProducts}
                selected={selected}
                onToggle={toggleProduct}
                showLabels={mode === "leitura"}
                theme={theme}
              />

              <button
                onClick={handleConfirm}
                disabled={selected.size === 0}
                className={`w-full mt-3 h-12 rounded-xl font-bold text-base text-white transition-all disabled:opacity-40 ${pal.accent}`}
              >
                Confirmar ({selected.size}/{itemCount})
              </button>
            </motion.div>
          )}

          {/* FASE: Resultado */}
          {phase === "result" && (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-1">
              <p className={`font-bold text-sm text-center mb-3 ${pal.title}`}>Resultado desta rodada</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {currentList.map((p) => {
                  const hit = selected.has(p.id);
                  return (
                    <div key={p.id} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${
                      hit ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
                    }`}>
                      <ProductSvg id={p.id} size={52} />
                      <span className="text-[10px] text-center leading-tight text-gray-700">{p.name}</span>
                      <span className="text-sm">{hit ? "✅" : "❌"}</span>
                    </div>
                  );
                })}
              </div>
              {[...selected].some((id) => !currentList.find((p) => p.id === id)) && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Alguns itens selecionados não estavam na lista.
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {streak !== 0 && phase !== "result" && (
          <p className={`text-xs text-center mt-2 ${pal.sub}`}>
            {streak > 0
              ? `🔥 ${streak} acerto${streak > 1 ? "s" : ""} seguido${streak > 1 ? "s" : ""}`
              : `${Math.abs(streak)} erro${Math.abs(streak) > 1 ? "s" : ""} seguido${Math.abs(streak) > 1 ? "s" : ""}`}
          </p>
        )}
      </div>
    </div>
  );
}
