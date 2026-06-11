"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { cancelTTS } from "@/lib/tts";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { ProductSvg } from "./ProductSvg";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DesafioSupermercadoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  mode?: "leitura" | "auditivo";
}

interface Product { id: string; name: string; }

// ── Banco de produtos (agrupado por categoria) ─────────────────────────────────
// As categorias servem a dois propósitos clínicos:
//  1. gerar listas VARIADAS (um item de categorias diferentes) → evita a sensação
//     de "sequência sempre igual" das listas fixas antigas;
//  2. nos níveis altos, escolher distratores da MESMA categoria dos itens da lista
//     (ex.: lista tem "leite" → distrator "iogurte") aumentando a interferência
//     semântica — mais exigente para a memória operacional.

const CATEGORIES: Record<string, Product[]> = {
  basicos: [
    { id: "arroz",    name: "Arroz" },
    { id: "feijao",   name: "Feijão" },
    { id: "macarrao", name: "Macarrão" },
    { id: "farinha",  name: "Farinha" },
    { id: "acucar",   name: "Açúcar" },
    { id: "sal",      name: "Sal" },
    { id: "oleo",     name: "Óleo de cozinha" },
    { id: "vinagre",  name: "Vinagre" },
    { id: "cafe",     name: "Café" },
  ],
  laticinios: [
    { id: "leite",    name: "Leite" },
    { id: "manteiga", name: "Manteiga" },
    { id: "queijo",   name: "Queijo" },
    { id: "iogurte",  name: "Iogurte" },
    { id: "ovos",     name: "Ovos" },
  ],
  padaria: [
    { id: "pao",      name: "Pão" },
  ],
  carnes: [
    { id: "frango",   name: "Frango" },
    { id: "carne",    name: "Carne" },
  ],
  limpeza: [
    { id: "sabao",     name: "Sabão" },
    { id: "detergente",name: "Detergente" },
    { id: "agua-san",  name: "Água sanitária" },
    { id: "esponja",   name: "Esponja" },
    { id: "saco-lixo", name: "Saco de lixo" },
  ],
  higiene: [
    { id: "papel",    name: "Papel higiênico" },
    { id: "shampoo",  name: "Shampoo" },
    { id: "pasta",    name: "Pasta de dente" },
    { id: "sabonete", name: "Sabonete" },
  ],
  bebidas: [
    { id: "agua",        name: "Água" },
    { id: "suco",        name: "Suco" },
    { id: "refrigerante",name: "Refrigerante" },
  ],
  hortifruti: [
    { id: "banana",  name: "Banana" },
    { id: "maca",    name: "Maçã" },
    { id: "tomate",  name: "Tomate" },
    { id: "alface",  name: "Alface" },
    { id: "batata",  name: "Batata" },
    { id: "cenoura", name: "Cenoura" },
  ],
};

const PRODUCTS: Product[] = Object.values(CATEGORIES).flat();
const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.id, p]));
const CAT_OF = new Map<string, string>();
for (const [cat, items] of Object.entries(CATEGORIES)) {
  for (const p of items) CAT_OF.set(p.id, cat);
}
const CATEGORY_KEYS = Object.keys(CATEGORIES);

// ── Tabela de níveis (1–10) — dificuldade multifatorial ─────────────────────────
// Cada nível combina: nº de itens a memorizar, nº de distratores na prateleira,
// tempo de memorização e se os distratores são semanticamente semelhantes.
interface LevelConfig { count: number; extra: number; memSec: number; similar: boolean; }

const LEVELS: LevelConfig[] = [
  /*  1 */ { count: 3, extra: 3,  memSec: 9, similar: false },
  /*  2 */ { count: 3, extra: 5,  memSec: 8, similar: false },
  /*  3 */ { count: 4, extra: 5,  memSec: 8, similar: false },
  /*  4 */ { count: 4, extra: 7,  memSec: 7, similar: false },
  /*  5 */ { count: 5, extra: 7,  memSec: 7, similar: true  },
  /*  6 */ { count: 5, extra: 9,  memSec: 6, similar: true  },
  /*  7 */ { count: 6, extra: 10, memSec: 6, similar: true  },
  /*  8 */ { count: 6, extra: 12, memSec: 5, similar: true  },
  /*  9 */ { count: 7, extra: 13, memSec: 5, similar: true  },
  /* 10 */ { count: 8, extra: 15, memSec: 4, similar: true  },
];

function clampLevel(difficulty: number): number {
  return Math.min(10, Math.max(1, Math.round(difficulty)));
}

function levelConfig(level: number): LevelConfig {
  return LEVELS[level - 1] ?? LEVELS[0];
}

function memorizeSeconds(level: number, mode: "leitura" | "auditivo"): number {
  const base = levelConfig(level).memSec;
  return mode === "auditivo" ? base + 2 : base;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Gera uma lista VARIADA: percorre categorias embaralhadas pegando 1 item de cada,
// evitando itens recém-usados (recentIds). Cai para qualquer item se faltar.
function buildList(count: number, recentIds: Set<string>): Product[] {
  const picked: Product[] = [];
  const pickedIds = new Set<string>();
  const cats = shuffle(CATEGORY_KEYS);

  for (let round = 0; round < 4 && picked.length < count; round++) {
    for (const cat of cats) {
      if (picked.length >= count) break;
      const candidates = CATEGORIES[cat].filter(
        p => !pickedIds.has(p.id) && (round > 0 || !recentIds.has(p.id)),
      );
      if (candidates.length) {
        const chosen = pickOne(candidates);
        picked.push(chosen);
        pickedIds.add(chosen.id);
      }
    }
  }
  // Preenchimento de segurança (ignora recentes) caso ainda falte.
  if (picked.length < count) {
    for (const p of shuffle(PRODUCTS)) {
      if (picked.length >= count) break;
      if (!pickedIds.has(p.id)) { picked.push(p); pickedIds.add(p.id); }
    }
  }
  return picked;
}

// Monta a prateleira: itens da lista + distratores. Se `similar`, prioriza
// distratores da MESMA categoria dos itens da lista (mais confundíveis).
function buildShelf(list: Product[], extra: number, similar: boolean): Product[] {
  const listIds = new Set(list.map(p => p.id));
  const pool = PRODUCTS.filter(p => !listIds.has(p.id));
  let distractors: Product[];

  if (similar) {
    const listCats = new Set(list.map(p => CAT_OF.get(p.id)));
    const sameCat = pool.filter(p => listCats.has(CAT_OF.get(p.id)));
    const others  = pool.filter(p => !listCats.has(CAT_OF.get(p.id)));
    distractors = [...shuffle(sameCat), ...shuffle(others)].slice(0, extra);
  } else {
    distractors = shuffle(pool).slice(0, extra);
  }

  return shuffle([...list, ...distractors]);
}

function buildTrial(level: number, recentIds: Set<string>): { list: Product[]; shelf: Product[] } {
  const cfg  = levelConfig(level);
  const list = buildList(cfg.count, recentIds);
  const shelf = buildShelf(list, cfg.extra, cfg.similar);
  return { list, shelf };
}

// ── Web Speech ────────────────────────────────────────────────────────────────

// NOTA (DUP-02): esta função locuciona a lista em SEQUÊNCIA (intro + cada item,
// enfileirados em `speechSynthesis`) e usa o callback `onDone` (disparado no
// `onend` da última fala) para desligar o indicador "Reproduzindo lista...".
function speakList(items: Product[], onDone?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) { onDone?.(); return; }
  window.speechSynthesis.cancel();
  const intro = new SpeechSynthesisUtterance("Sua lista de compras:");
  intro.lang = "pt-BR"; intro.rate = 0.88; intro.pitch = 1.05;
  const utterances = items.map(item => {
    const u = new SpeechSynthesisUtterance(item.name);
    u.lang = "pt-BR"; u.rate = 0.82; u.pitch = 1.0;
    return u;
  });
  const last = utterances[utterances.length - 1];
  if (last) last.onend = () => onDone?.();
  window.speechSynthesis.speak(intro);
  utterances.forEach(u => window.speechSynthesis.speak(u));
}

// ── Prateleira (tema claro) ─────────────────────────────────────────────────────

const SHELF_COLS = 3;  // prateleira fica ao lado do carrinho — 3 colunas cabem melhor

function FullShelf({
  products, cartIds, onToggle, showLabels,
}: {
  products: Product[];
  cartIds: string[];
  onToggle: (id: string) => void;
  showLabels: boolean;
}) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += SHELF_COLS) rows.push(products.slice(i, i + SHELF_COLS));

  const Plank = () => (
    <div style={{
      height: 13,
      background: "linear-gradient(to bottom,#f0dcbb 0%,#e0bd8a 55%,#c79a5e 100%)",
      boxShadow: "0 3px 7px rgba(140,100,50,0.28), inset 0 1px 0 rgba(255,255,255,0.6)",
    }} />
  );

  return (
    <div style={{ background: "#f6efe3" }}>
      <Plank />
      {rows.map((row, ri) => (
        <div key={ri}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${SHELF_COLS}, 1fr)`,
            gap: 6, padding: "9px 6px",
          }}>
            {row.map(p => {
              const inCart = cartIds.includes(p.id);
              return (
                <motion.button
                  key={p.id}
                  onClick={() => onToggle(p.id)}
                  whileTap={{ scale: 0.86 }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    padding: "9px 3px 7px",
                    borderRadius: 12,
                    border: inCart ? "2.5px solid #16a34a" : "1.5px solid #e6dcc8",
                    background: inCart ? "#e9f9ee" : "#ffffff",
                    boxShadow: inCart
                      ? "0 2px 8px rgba(22,163,74,0.18)"
                      : "0 2px 6px rgba(120,90,50,0.10)",
                    position: "relative", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <ProductSvg id={p.id} size={62} />
                  {showLabels && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.2,
                      color: inCart ? "#15803d" : "#4b5563",
                      maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.name}
                    </span>
                  )}
                  {inCart && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                      position: "absolute", top: 3, right: 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#16a34a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: "bold", color: "#ffffff",
                    }}>
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          <Plank />
        </div>
      ))}
    </div>
  );
}

// ── Tutorial (compact shelf for TutorialBase) ─────────────────────────────────

const TUT_LIST: Product[]  = [{ id: "pao", name: "Pão" }, { id: "leite", name: "Leite" }];
const TUT_SHELF: Product[] = [
  { id: "arroz", name: "Arroz" }, { id: "pao", name: "Pão" },
  { id: "cafe",  name: "Café"  }, { id: "leite", name: "Leite" },
  { id: "ovos",  name: "Ovos"  }, { id: "acucar", name: "Açúcar" },
  { id: "maca",  name: "Maçã"  }, { id: "sal",    name: "Sal" },
];

function TutMemorizeStep({ mode, onDone }: { mode: "leitura" | "auditivo"; onDone: () => void }) {
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (mode === "auditivo") speakList(TUT_LIST);
    const iv = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(iv); onDone(); return 0; } return p - 1; });
    }, 1000);
    return () => { clearInterval(iv); cancelTTS(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl p-4 space-y-3 bg-emerald-50 border border-emerald-200">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-gray-800">
          {mode === "auditivo" ? "🔊 Ouça os itens:" : "📋 Memorize a lista:"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-600 font-mono">{countdown}s</span>
          <button onClick={onDone} className="text-xs px-2 py-0.5 rounded-lg font-bold bg-emerald-500 text-white">
            Pronto →
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TUT_LIST.map(p => (
          <div key={p.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 bg-white">
            <ProductSvg id={p.id} size={72} />
            {mode === "leitura" && <span className="text-sm font-bold text-center text-gray-800">{p.name}</span>}
            {mode === "auditivo" && <span className="text-xl">🔊</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TutShelfStep({ mode, onDone }: { mode: "leitura" | "auditivo"; onDone: () => void }) {
  const [cart, setCart] = useState<string[]>([]);
  const doneRef = useRef(false);

  function tap(id: string) {
    if (doneRef.current) return;
    setCart(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (next.includes("pao") && next.includes("leite") && !doneRef.current) {
        doneRef.current = true;
        setTimeout(onDone, 700);
      }
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-700">
        {mode === "auditivo" ? "Toque nos produtos que você ouviu." : "Toque nos produtos que estavam na lista."}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {TUT_SHELF.map(p => {
          const inCart = cart.includes(p.id);
          return (
            <button key={p.id} onClick={() => tap(p.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all active:scale-95 relative ${
                inCart ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white"
              }`}>
              <ProductSvg id={p.id} size={52} />
              {mode === "leitura" && (
                <span className={`text-[9px] text-center font-semibold leading-tight ${inCart ? "text-emerald-700" : "text-gray-700"}`}>
                  {p.name}
                </span>
              )}
              {inCart && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">✓</div>
              )}
            </button>
          );
        })}
      </div>
      {/* mini cart display */}
      {cart.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-sm">🛒</span>
          <div className="flex gap-1">
            {cart.map(id => <ProductSvg key={id} id={id} size={32} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function SupermercadoTutorial({ theme, mode, onDone }: { theme: Theme; mode: "leitura" | "auditivo"; onDone: () => void }) {
  const steps = [
    {
      instruction: mode === "auditivo"
        ? "Você vai OUVIR uma lista de compras. Memorize os itens pelo som!"
        : "Uma lista de compras vai aparecer. Memorize bem os produtos!",
      content: (done: () => void) => <TutMemorizeStep mode={mode} onDone={done} />,
    },
    {
      instruction: "Toque nos produtos da prateleira para colocá-los no carrinho. Depois confirme!",
      content: (done: () => void) => <TutShelfStep mode={mode} onDone={done} />,
    },
  ];
  return (
    <TutorialBase
      theme={theme}
      title={`Desafio do Supermercado${mode === "auditivo" ? " — Auditivo" : ""}`}
      steps={steps}
      onDone={onDone}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const MAX_TRIALS = 8;

export function DesafioSupermercado({ difficulty, theme, onComplete, mode = "leitura" }: DesafioSupermercadoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  // Nível FIXO na sessão = nível salvo do paciente (vem de ExerciseConfig.currentDifficulty).
  // A progressão (subir/manter/descer) é decidida no servidor após a sessão (progressionV2).
  const level   = useMemo(() => clampLevel(difficulty), [difficulty]);
  const cfg      = useMemo(() => levelConfig(level), [level]);
  const itemCount = cfg.count;

  const [trial, setTrial]               = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [phase, setPhase]               = useState<"memorizing" | "shopping" | "result">("memorizing");
  const [countdown, setCountdown]       = useState(0);
  const [cartIds, setCartIds]           = useState<string[]>([]); // insertion-ordered IDs
  const selected                        = useMemo(() => new Set(cartIds), [cartIds]);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const recentRef  = useRef<string[]>([]);   // ids das últimas listas — evita repetição imediata
  const gradedRef  = useRef<number[]>([]);    // acerto graduado por rodada (0–1) → accTotal
  const wrongRef   = useRef(0);               // total de itens errados marcados (sinal de impulsividade)
  const startTime  = useRef(Date.now());
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentList, setCurrentList]     = useState<Product[]>([]);
  const [shelfProducts, setShelfProducts] = useState<Product[]>([]);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const initTrial = useCallback(() => {
    const { list, shelf } = buildTrial(level, new Set(recentRef.current));
    // mantém uma janela das ~2 últimas listas para a randomização controlada
    recentRef.current = [...list.map(p => p.id), ...recentRef.current].slice(0, itemCount * 2);
    setCurrentList(list);
    setShelfProducts(shelf);
    setCartIds([]);
    setPhase("memorizing");
  }, [level, itemCount]);

  useEffect(() => {
    if (!showTutorial) initTrial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (phase !== "memorizing" || showTutorial || currentList.length === 0) return;
    const total = memorizeSeconds(level, mode);
    setCountdown(total);
    if (mode === "auditivo") { setAudioPlaying(true); speakList(currentList, () => setAudioPlaying(false)); }
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearTimer(); setPhase("shopping"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { clearTimer(); cancelTTS(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial, showTutorial]);

  function toggleProduct(id: string) {
    if (phase !== "shopping") return;
    setCartIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleConfirm() {
    const correctIds      = new Set(currentList.map(p => p.id));
    const correctSelected = cartIds.filter(id => correctIds.has(id)).length;
    const wrongSelected   = cartIds.filter(id => !correctIds.has(id)).length;
    const isCorrect       = correctSelected === correctIds.size && wrongSelected === 0;

    // acerto graduado: recompensa itens certos, penaliza marcações erradas
    const graded = Math.max(0, (correctSelected - wrongSelected) / correctIds.size);
    gradedRef.current.push(graded);
    wrongRef.current += wrongSelected;

    const newResults = [...trialResults, isCorrect];
    setTrialResults(newResults);
    setPhase("result");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const correct   = newResults.filter(Boolean).length;
        const accTotal  = gradedRef.current.reduce((a, b) => a + b, 0) / MAX_TRIALS;
        const impulsive = wrongRef.current > MAX_TRIALS; // > 1 erro/rodada em média
        onComplete({
          exerciseId: mode === "auditivo" ? "desafio-supermercado-auditivo" : "desafio-supermercado",
          domain: "memory",
          score: calculateExerciseScore("desafio-supermercado", accTotal, undefined, level),
          accuracy: accTotal, difficulty: level,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: {
            trials: MAX_TRIALS, correct, mode, level,
            progressionV2: true, accTotal, impulsive,
          },
        });
      } else {
        setTrial(nextTrial);
        initTrial();
      }
    }, 1800);
  }

  if (showTutorial) {
    return <SupermercadoTutorial theme={theme} mode={mode} onDone={() => setShowTutorial(false)} />;
  }

  const memorizeTotal = memorizeSeconds(level, mode);
  const ratio = memorizeTotal > 0 ? countdown / memorizeTotal : 0;
  const isRoundCorrect = phase === "result"
    && currentList.every(p => selected.has(p.id))
    && cartIds.every(id => currentList.find(p => p.id === id));

  const listCols = Math.min(currentList.length, 4);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#eef2f6",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* ── HUD ── */}
      <div style={{
        background: "linear-gradient(90deg,#15803d,#22c55e)",
        padding: "7px 14px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(21,128,61,0.35)",
      }}>
        <span style={{ color: "white", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>
          🛒 SUPERMERCADO · N{level}
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} style={{
              height: 5, width: 20, borderRadius: 3,
              background: i < trialResults.length
                ? (trialResults[i] ? "#bbf7d0" : "#fecaca")
                : i === trial ? "#fde68a" : "rgba(255,255,255,0.28)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>{trial + 1}/{MAX_TRIALS}</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── MEMORIZING ── */}
        {phase === "memorizing" && (
          <motion.div key="mem"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{
              flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "16px",
            }}>
              <div style={{
                width: "100%", maxWidth: 440,
                background: "#ffffff",
                border: "1px solid #e6dcc8",
                borderRadius: 22, padding: "18px 16px",
                boxShadow: "0 8px 28px rgba(120,90,40,0.12)",
              }}>
                {/* Header + timer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "#1f2937", fontWeight: 800, fontSize: 15 }}>
                    {mode === "auditivo" ? "🎧 Ouça a lista!" : "📋 Memorize a lista!"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 72, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${ratio * 100}%`, background: "#16a34a", borderRadius: 3, transition: "width 1s linear" }} />
                    </div>
                    <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 800, minWidth: 26, textAlign: "right" }}>{countdown}s</span>
                  </div>
                </div>

                {mode === "auditivo" && audioPlaying && (
                  <p style={{ color: "#16a34a", fontSize: 12, textAlign: "center", marginBottom: 12, animationName: "pulse", animationDuration: "2s", animationIterationCount: "infinite" }}>
                    🔊 Reproduzindo lista...
                  </p>
                )}

                <div style={{ display: "grid", gridTemplateColumns: `repeat(${listCols}, 1fr)`, gap: 10 }}>
                  {currentList.map((p, idx) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.06 }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        padding: "12px 6px",
                        background: "#f6efe3",
                        border: "1.5px solid #e6dcc8",
                        borderRadius: 14,
                      }}
                    >
                      <ProductSvg id={p.id} size={72} />
                      {mode === "leitura" && (
                        <span style={{ color: "#374151", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                          {p.name}
                        </span>
                      )}
                      {mode === "auditivo" && <span style={{ fontSize: 20 }}>🔊</span>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "8px 16px 14px", flexShrink: 0 }}>
              <button
                onClick={() => { clearTimer(); cancelTTS(); setPhase("shopping"); }}
                style={{
                  width: "100%", height: 50, borderRadius: 100,
                  background: "linear-gradient(135deg,#16a34a,#15803d)",
                  border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(21,128,61,0.32)",
                }}
              >
                Já memorizei → ir às prateleiras
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SHOPPING ── */}
        {phase === "shopping" && (
          <motion.div key="shop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden" }}
          >
            {/* Prateleira à ESQUERDA (scrollable) */}
            <div style={{ flex: 1, minWidth: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
              <FullShelf
                products={shelfProducts}
                cartIds={cartIds}
                onToggle={toggleProduct}
                showLabels={mode === "leitura"}
              />
            </div>

            {/* ── CARRINHO à DIREITA (painel limpo) ── */}
            <div style={{
              flexShrink: 0, width: "40%", maxWidth: 280, minWidth: 150,
              background: "#ffffff",
              borderLeft: "3px solid #16a34a",
              padding: "12px 10px",
              display: "flex", flexDirection: "column", gap: 10, overflowY: "auto",
              boxShadow: "-6px 0 16px rgba(120,90,40,0.08)",
            }}>

              {/* Cabeçalho: 🛒 No carrinho + progresso X/Y */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ color: "#1f2937", fontWeight: 800, fontSize: 13 }}>🛒 No carrinho</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: "1px 9px", borderRadius: 100,
                  background: cartIds.length === itemCount ? "#dcfce7" : "#f1f5f9",
                  color: cartIds.length === itemCount ? "#15803d" : "#64748b",
                  border: `1px solid ${cartIds.length === itemCount ? "#86efac" : "#e2e8f0"}`,
                }}>
                  {cartIds.length}/{itemCount}
                </span>
              </div>

              {/* Itens no carrinho (toque para remover) */}
              <div style={{
                flex: 1,
                display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
                alignContent: "flex-start", minHeight: 50,
              }}>
                <AnimatePresence mode="popLayout">
                  {cartIds.length === 0 ? (
                    <motion.span key="hint"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic", alignSelf: "center" }}>
                      Toque nos produtos...
                    </motion.span>
                  ) : cartIds.map(id => {
                    const p = PRODUCT_MAP.get(id);
                    if (!p) return null;
                    return (
                      <motion.button
                        key={id} layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 480, damping: 28 }}
                        onClick={() => toggleProduct(id)}
                        title={`Remover ${p.name}`}
                        style={{
                          flexShrink: 0, cursor: "pointer",
                          background: "#f0fdf4",
                          border: "1.5px solid #bbf7d0",
                          borderRadius: 10, padding: "5px",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                          position: "relative",
                        }}
                      >
                        <ProductSvg id={id} size={46} />
                        {mode === "leitura" && (
                          <span style={{ fontSize: 8, color: "#15803d", fontWeight: 700, maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </span>
                        )}
                        {/* ícone de remover */}
                        <div style={{
                          position: "absolute", top: -5, right: -5,
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#ef4444",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: "white", fontWeight: 900, lineHeight: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}>×</div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Botão confirmar */}
              <button
                onClick={handleConfirm}
                disabled={cartIds.length === 0}
                style={{
                  width: "100%", height: 48, borderRadius: 100, border: "none",
                  flexShrink: 0,
                  background: cartIds.length > 0
                    ? "linear-gradient(135deg,#16a34a,#15803d)"
                    : "#e5e7eb",
                  color: cartIds.length > 0 ? "white" : "#9ca3af",
                  fontWeight: 800, fontSize: 13,
                  cursor: cartIds.length > 0 ? "pointer" : "default",
                  boxShadow: cartIds.length > 0 ? "0 4px 16px rgba(21,128,61,0.32)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Confirmar ({cartIds.length}/{itemCount})
              </button>

            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <motion.div key="res"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 20, overflowY: "auto",
            }}
          >
            <div style={{
              width: "100%", maxWidth: 420,
              background: "#ffffff",
              border: `2px solid ${isRoundCorrect ? "#86efac" : "#fca5a5"}`,
              borderRadius: 20, padding: "18px 16px",
              boxShadow: "0 8px 28px rgba(120,90,40,0.12)",
            }}>
              <p style={{ color: isRoundCorrect ? "#15803d" : "#b91c1c", fontWeight: 800, fontSize: 16, textAlign: "center", marginBottom: 14 }}>
                {isRoundCorrect ? "✅ Lista correta!" : "❌ Resultado da rodada"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${listCols}, 1fr)`, gap: 8 }}>
                {currentList.map(p => {
                  const hit = selected.has(p.id);
                  return (
                    <div key={p.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 4px",
                      background: hit ? "#f0fdf4" : "#fef2f2",
                      border: `1.5px solid ${hit ? "#bbf7d0" : "#fecaca"}`,
                      borderRadius: 12,
                    }}>
                      <ProductSvg id={p.id} size={54} />
                      <span style={{ fontSize: 9, fontWeight: 700, textAlign: "center", color: hit ? "#15803d" : "#b91c1c" }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 16 }}>{hit ? "✅" : "❌"}</span>
                    </div>
                  );
                })}
              </div>
              {cartIds.some(id => !currentList.find(p => p.id === id)) && (
                <p style={{ color: "#b91c1c", fontSize: 11, textAlign: "center", marginTop: 10 }}>
                  ⚠️ Alguns itens não estavam na lista.
                </p>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
