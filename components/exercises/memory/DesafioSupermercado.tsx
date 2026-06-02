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

// ── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: "arroz",       name: "Arroz" },
  { id: "feijao",      name: "Feijão" },
  { id: "macarrao",    name: "Macarrão" },
  { id: "oleo",        name: "Óleo de cozinha" },
  { id: "sal",         name: "Sal" },
  { id: "acucar",      name: "Açúcar" },
  { id: "cafe",        name: "Café" },
  { id: "leite",       name: "Leite" },
  { id: "manteiga",    name: "Manteiga" },
  { id: "pao",         name: "Pão" },
  { id: "ovos",        name: "Ovos" },
  { id: "queijo",      name: "Queijo" },
  { id: "iogurte",     name: "Iogurte" },
  { id: "frango",      name: "Frango" },
  { id: "carne",       name: "Carne" },
  { id: "sabao",       name: "Sabão" },
  { id: "papel",       name: "Papel higiênico" },
  { id: "shampoo",     name: "Shampoo" },
  { id: "pasta",       name: "Pasta de dente" },
  { id: "sabonete",    name: "Sabonete" },
  { id: "detergente",  name: "Detergente" },
  { id: "agua-san",    name: "Água sanitária" },
  { id: "esponja",     name: "Esponja" },
  { id: "saco-lixo",   name: "Saco de lixo" },
  { id: "agua",        name: "Água" },
  { id: "suco",        name: "Suco" },
  { id: "refrigerante",name: "Refrigerante" },
  { id: "banana",      name: "Banana" },
  { id: "maca",        name: "Maçã" },
  { id: "tomate",      name: "Tomate" },
  { id: "alface",      name: "Alface" },
  { id: "batata",      name: "Batata" },
  { id: "cenoura",     name: "Cenoura" },
  { id: "farinha",     name: "Farinha" },
  { id: "vinagre",     name: "Vinagre" },
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

const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.id, p]));

function initialItemCount(difficulty: number): number {
  if (difficulty <= 2) return 3;
  if (difficulty <= 4) return 4;
  if (difficulty <= 6) return 5;
  if (difficulty <= 8) return 6;
  return 7;
}

function memorizeSeconds(count: number, mode: "leitura" | "auditivo"): number {
  const base = Math.max(5, 13 - count);
  return mode === "auditivo" ? base + 2 : base;
}

function buildTrial(count: number, usedLists: Set<string>): { list: Product[]; shelf: Product[] } {
  const lists    = SHOPPING_LISTS[count] ?? SHOPPING_LISTS[3];
  const available = lists.filter(l => !usedLists.has(l.join(",")));
  const pool     = available.length > 0 ? available : lists;
  const chosen   = pool[Math.floor(Math.random() * pool.length)];
  usedLists.add(chosen.join(","));

  const listProducts = chosen.map(id => PRODUCT_MAP.get(id)!).filter(Boolean);
  const listIds      = new Set(chosen);
  const fillers      = PRODUCTS.filter(p => !listIds.has(p.id)).sort(() => Math.random() - 0.5);
  const shelfSize    = Math.min(PRODUCTS.length, count * 2 + 4);
  const shelf        = [...listProducts, ...fillers.slice(0, shelfSize - count)].sort(() => Math.random() - 0.5);
  return { list: listProducts, shelf };
}

// ── Web Speech ────────────────────────────────────────────────────────────────

// NOTA (DUP-02): esta função locuciona a lista em SEQUÊNCIA (intro + cada item,
// enfileirados em `speechSynthesis`) e usa o callback `onDone` (disparado no
// `onend` da última fala) para desligar o indicador "Reproduzindo lista...".
// `playTTS` de `@/lib/tts` é fire-and-forget e CANCELA a fala anterior a cada
// chamada (`cancelTTS` interno) — chamá-lo em loop deixaria só o último item
// audível e não oferece callback de término. Por isso a locução permanece local.
// O cancelamento, esse sim, passou a usar `cancelTTS` (helper canônico, que
// também aborta um eventual áudio MP3 do manifesto além do speechSynthesis).
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

// ── Cart SVG (VISTA LATERAL) ────────────────────────────────────────────────────
// Carrinho visto de lado: alça à esquerda, cesta à direita, 2 rodas. Preenche a
// largura do container (width 100%). Itens aparecem dentro da cesta (CART_INTERIOR, %).

function CartSvg() {
  return (
    <svg width="100%" viewBox="0 0 200 170" preserveAspectRatio="xMidYMid meet"
      fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {/* alça */}
      <path d="M8 38 Q12 38 48 38" stroke="#d97706" strokeWidth="8" strokeLinecap="round"/>
      {/* cesta */}
      <path d="M44 18 L192 18 L180 120 L56 120 Z" fill="rgba(217,119,6,0.15)" stroke="#d97706" strokeWidth="5" strokeLinejoin="round"/>
      {/* arames horizontais */}
      <line x1="47" y1="52"  x2="189" y2="52"  stroke="#d97706" strokeWidth="2.5" opacity="0.4"/>
      <line x1="50" y1="86"  x2="184" y2="86"  stroke="#d97706" strokeWidth="2.5" opacity="0.4"/>
      {/* arames verticais */}
      <line x1="83"  y1="18" x2="74"  y2="120" stroke="#d97706" strokeWidth="2.5" opacity="0.4"/>
      <line x1="118" y1="18" x2="118" y2="120" stroke="#d97706" strokeWidth="2.5" opacity="0.4"/>
      <line x1="152" y1="18" x2="158" y2="120" stroke="#d97706" strokeWidth="2.5" opacity="0.4"/>
      {/* barra inferior */}
      <path d="M56 120 L180 120" stroke="#d97706" strokeWidth="6" strokeLinecap="round"/>
      {/* hastes das rodas */}
      <line x1="82"  y1="120" x2="74"  y2="142" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="162" y1="120" x2="170" y2="142" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round"/>
      {/* rodas */}
      <circle cx="74"  cy="153" r="13" fill="#1a0a00" stroke="#92400e" strokeWidth="2.5"/>
      <circle cx="74"  cy="153" r="5"  fill="#6b4f1a"/>
      <circle cx="170" cy="153" r="13" fill="#1a0a00" stroke="#92400e" strokeWidth="2.5"/>
      <circle cx="170" cy="153" r="5"  fill="#6b4f1a"/>
    </svg>
  );
}

// Área interna da cesta (lateral) onde os itens aparecem — em % do container.
const CART_INTERIOR = { left: "24%", top: "12%", width: "68%", height: "55%" };

// ── Full-screen Shelf ─────────────────────────────────────────────────────────

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
      height: 15,
      background: "linear-gradient(to bottom, #e8c07a 0%, #c8974a 50%, #8b6320 100%)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.28)",
    }} />
  );

  return (
    <div style={{ background: "#2a1103" }}>
      <Plank />
      {rows.map((row, ri) => (
        <div key={ri}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${SHELF_COLS}, 1fr)`,
            gap: 5, padding: "7px 5px",
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
                    padding: "8px 3px 6px",
                    borderRadius: 10,
                    border: inCart ? "2.5px solid #facc15" : "1.5px solid rgba(255,200,120,0.12)",
                    background: inCart ? "rgba(250,204,21,0.13)" : "rgba(255,245,220,0.07)",
                    position: "relative", cursor: "pointer",
                    opacity: inCart ? 0.65 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  <ProductSvg id={p.id} size={62} />
                  {showLabels && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.2,
                      color: inCart ? "#facc15" : "#f5e6c8",
                      maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.name}
                    </span>
                  )}
                  {inCart && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                      position: "absolute", top: 3, right: 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#facc15",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: "bold", color: "#1a0e05",
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
    <div className="rounded-xl p-4 space-y-3 bg-amber-50 border border-amber-200">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-gray-800">
          {mode === "auditivo" ? "🔊 Ouça os itens:" : "📋 Memorize a lista:"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600 font-mono">{countdown}s</span>
          <button onClick={onDone} className="text-xs px-2 py-0.5 rounded-lg font-bold bg-amber-500 text-white">
            Pronto →
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TUT_LIST.map(p => (
          <div key={p.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-amber-300 bg-white">
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
                inCart ? "border-yellow-400 bg-yellow-50" : "border-amber-200/50 bg-amber-50/80"
              }`}>
              <ProductSvg id={p.id} size={52} />
              {mode === "leitura" && (
                <span className={`text-[9px] text-center font-semibold leading-tight ${inCart ? "text-amber-700" : "text-gray-700"}`}>
                  {p.name}
                </span>
              )}
              {inCart && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[9px] font-bold text-yellow-900">✓</div>
              )}
            </button>
          );
        })}
      </div>
      {/* mini cart display */}
      {cart.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
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

  const [trial, setTrial]             = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [phase, setPhase]             = useState<"memorizing" | "shopping" | "result">("memorizing");
  const [countdown, setCountdown]     = useState(0);
  const [cartIds, setCartIds]         = useState<string[]>([]); // insertion-ordered IDs
  const selected                      = useMemo(() => new Set(cartIds), [cartIds]);
  const [itemCount, setItemCount]     = useState(() => initialItemCount(difficulty));
  const [streak, setStreak]           = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const usedLists    = useRef(new Set<string>());
  const startTime    = useRef(Date.now());
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextCountRef = useRef(itemCount);

  const [currentList, setCurrentList]     = useState<Product[]>([]);
  const [shelfProducts, setShelfProducts] = useState<Product[]>([]);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const initTrial = useCallback((count: number) => {
    const { list, shelf } = buildTrial(count, usedLists.current);
    setCurrentList(list);
    setShelfProducts(shelf);
    setCartIds([]);
    setPhase("memorizing");
  }, []);

  useEffect(() => {
    if (!showTutorial) initTrial(itemCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (phase !== "memorizing" || showTutorial || currentList.length === 0) return;
    const total = memorizeSeconds(itemCount, mode);
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
    const correctIds     = new Set(currentList.map(p => p.id));
    const correctSelected = cartIds.filter(id => correctIds.has(id)).length;
    const wrongSelected  = cartIds.filter(id => !correctIds.has(id)).length;
    const isCorrect      = correctSelected === correctIds.size && wrongSelected === 0;

    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextCount = itemCount;
    let resetStreak = false;
    if (newStreak >= 2)  { nextCount = Math.min(itemCount + 1, 7); resetStreak = true; }
    if (newStreak <= -2) { nextCount = Math.max(itemCount - 1, 3); resetStreak = true; }
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
        const correct  = newResults.filter(Boolean).length;
        const accuracy = correct / MAX_TRIALS;
        onComplete({
          exerciseId: mode === "auditivo" ? "desafio-supermercado-auditivo" : "desafio-supermercado",
          domain: "memory",
          score: calculateExerciseScore("desafio-supermercado", accuracy, undefined, difficulty),
          accuracy, difficulty,
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

  const memorizeTotal = memorizeSeconds(itemCount, mode);
  const ratio = memorizeTotal > 0 ? countdown / memorizeTotal : 0;
  const isRoundCorrect = phase === "result"
    && currentList.every(p => selected.has(p.id))
    && cartIds.every(id => currentList.find(p => p.id === id));

  const listCols = Math.min(currentList.length, 4);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#140a02",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* ── HUD ── */}
      <div style={{
        background: "linear-gradient(90deg,#7c2d12,#92400e)",
        padding: "7px 14px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}>
        <span style={{ color: "white", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>
          🛒 SUPERMERCADO
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} style={{
              height: 5, width: 20, borderRadius: 3,
              background: i < trialResults.length
                ? (trialResults[i] ? "#22c55e" : "#ef4444")
                : i === trial ? "#facc15" : "rgba(255,255,255,0.2)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{trial + 1}/{MAX_TRIALS}</span>
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
                background: "rgba(255,240,200,0.07)",
                border: "1.5px solid rgba(255,200,100,0.2)",
                borderRadius: 20, padding: "16px 14px",
              }}>
                {/* Header + timer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ color: "#f5e6c8", fontWeight: 700, fontSize: 14 }}>
                    {mode === "auditivo" ? "🎧 Ouça a lista!" : "📋 Memorize a lista!"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 72, height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${ratio * 100}%`, background: "#f59e0b", borderRadius: 3, transition: "width 1s linear" }} />
                    </div>
                    <span style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, minWidth: 26, textAlign: "right" }}>{countdown}s</span>
                  </div>
                </div>

                {mode === "auditivo" && audioPlaying && (
                  <p style={{ color: "#f59e0b", fontSize: 11, textAlign: "center", marginBottom: 10, animationName: "pulse", animationDuration: "2s", animationIterationCount: "infinite" }}>
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
                        background: "rgba(255,240,210,0.1)",
                        border: "1.5px solid rgba(255,200,100,0.25)",
                        borderRadius: 14,
                      }}
                    >
                      <ProductSvg id={p.id} size={72} />
                      {mode === "leitura" && (
                        <span style={{ color: "#f5e6c8", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
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
                  background: "linear-gradient(135deg,#b45309,#92400e)",
                  border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(180,83,9,0.4)",
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

            {/* ── CARRINHO à DIREITA (coluna maior) ── */}
            {(() => {
              const ITEM_PX = 24;
              return (
                <div style={{
                  flexShrink: 0, width: "40%", maxWidth: 280, minWidth: 150,
                  background: "linear-gradient(to bottom,#1a0e05,#0f0600)",
                  borderLeft: "3px solid #b45309",
                  padding: "12px 10px",
                  display: "flex", flexDirection: "column", gap: 10, overflowY: "auto",
                }}>

                  {/* Carrinho (cima) + itens selecionados (baixo) — column-reverse */}
                  <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 10, width: "100%" }}>

                    {/* Itens no carrinho (toque para remover) */}
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span style={{ color: "#f5e6c8", fontWeight: 700, fontSize: 12 }}>No carrinho</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 100,
                          background: cartIds.length === itemCount ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.08)",
                          color: cartIds.length === itemCount ? "#4ade80" : "#94a3b8",
                          border: `1px solid ${cartIds.length === itemCount ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.1)"}`,
                        }}>
                          {cartIds.length}/{itemCount}
                        </span>
                      </div>

                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center",
                        minHeight: 50, alignContent: "flex-start",
                      }}>
                        <AnimatePresence mode="popLayout">
                          {cartIds.length === 0 ? (
                            <motion.span key="hint"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontStyle: "italic", alignSelf: "center" }}>
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
                                  background: "rgba(250,204,21,0.1)",
                                  border: "1.5px solid rgba(250,204,21,0.3)",
                                  borderRadius: 8, padding: "3px",
                                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                                  position: "relative",
                                }}
                              >
                                <ProductSvg id={id} size={42} />
                                {mode === "leitura" && (
                                  <span style={{ fontSize: 7, color: "#facc15", fontWeight: 600, maxWidth: 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {p.name}
                                  </span>
                                )}
                                {/* ícone de remover */}
                                <div style={{
                                  position: "absolute", top: -4, right: -4,
                                  width: 14, height: 14, borderRadius: "50%",
                                  background: "rgba(239,68,68,0.85)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 9, color: "white", fontWeight: 900, lineHeight: 1,
                                }}>×</div>
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Carrinho (vista de cima) preenchendo a largura, com itens dentro da cesta */}
                    <div style={{ width: "100%", position: "relative" }}>
                      <CartSvg />

                      {/* Itens caindo dentro da cesta (área em % do carrinho) */}
                      <div style={{
                        position: "absolute",
                        left:   CART_INTERIOR.left,
                        top:    CART_INTERIOR.top,
                        width:  CART_INTERIOR.width,
                        height: CART_INTERIOR.height,
                        display: "flex", flexWrap: "wrap",
                        gap: 3, alignContent: "flex-end", justifyContent: "center",
                        overflow: "hidden", pointerEvents: "none",
                      }}>
                        <AnimatePresence>
                          {cartIds.slice(0, 8).map((id, idx) => (
                            <motion.div key={id}
                              initial={{ scale: 0, opacity: 0, y: -50 }}
                              animate={{ scale: 1, opacity: 0.97, y: 0 }}
                              exit={{ scale: 0, opacity: 0, y: -20 }}
                              transition={{ type: "spring", stiffness: 360, damping: 22, delay: idx * 0.02 }}
                            >
                              <ProductSvg id={id} size={ITEM_PX} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {/* badge de overflow */}
                        {cartIds.length > 8 && (
                          <div style={{
                            position: "absolute", bottom: 2, right: 2,
                            background: "#d97706", borderRadius: "50%",
                            width: 18, height: 18, fontSize: 9, fontWeight: 800,
                            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>+{cartIds.length - 8}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão confirmar */}
                  <button
                    onClick={handleConfirm}
                    disabled={cartIds.length === 0}
                    style={{
                      width: "100%", height: 48, borderRadius: 100, border: "none",
                      marginTop: "auto", flexShrink: 0,
                      background: cartIds.length > 0
                        ? "linear-gradient(135deg,#b45309,#92400e)"
                        : "rgba(255,255,255,0.07)",
                      color: "white", fontWeight: 700, fontSize: 13,
                      cursor: cartIds.length > 0 ? "pointer" : "default",
                      opacity: cartIds.length === 0 ? 0.35 : 1,
                      boxShadow: cartIds.length > 0 ? "0 4px 16px rgba(180,83,9,0.4)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    Confirmar ({cartIds.length}/{itemCount})
                  </button>

                </div>
              );
            })()}
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
              background: "rgba(255,240,200,0.07)",
              border: `2px solid ${isRoundCorrect ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)"}`,
              borderRadius: 20, padding: "16px 14px",
            }}>
              <p style={{ color: "#f5e6c8", fontWeight: 700, fontSize: 15, textAlign: "center", marginBottom: 14 }}>
                {isRoundCorrect ? "✅ Lista correta!" : "❌ Resultado da rodada"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${listCols}, 1fr)`, gap: 8 }}>
                {currentList.map(p => {
                  const hit = selected.has(p.id);
                  return (
                    <div key={p.id} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 4px",
                      background: hit ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      border: `1.5px solid ${hit ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                      borderRadius: 12,
                    }}>
                      <ProductSvg id={p.id} size={54} />
                      <span style={{ fontSize: 9, fontWeight: 600, textAlign: "center", color: hit ? "#4ade80" : "#f87171" }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 16 }}>{hit ? "✅" : "❌"}</span>
                    </div>
                  );
                })}
              </div>
              {cartIds.some(id => !currentList.find(p => p.id === id)) && (
                <p style={{ color: "#f87171", fontSize: 11, textAlign: "center", marginTop: 10 }}>
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
