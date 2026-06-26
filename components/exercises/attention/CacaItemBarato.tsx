"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

// ── Product database ──────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  bg: string;         // header background color
  priceCents: number; // price in cents
  weight: number;
  unit: "g" | "ml" | "L" | "kg" | "un";
  validity: string;
  extra?: string;     // extra label info (flavor, type, etc.)
}

const PRODUCTS: Product[] = [
  // ARROZ
  { id: "ar1", name: "Arroz Tipo 1", brand: "Grão Fino", emoji: "🌾", bg: "#1565C0", priceCents: 599, weight: 1000, unit: "g", validity: "10/2026", extra: "Tipo 1 Longo Fino" },
  { id: "ar2", name: "Arroz Tipo 1", brand: "Campo Verde", emoji: "🌾", bg: "#0D47A1", priceCents: 1090, weight: 2000, unit: "g", validity: "08/2026", extra: "Pacote Econômico" },
  { id: "ar3", name: "Arroz Integral", brand: "Vida Saudável", emoji: "🌾", bg: "#2E7D32", priceCents: 729, weight: 1000, unit: "g", validity: "06/2026", extra: "Alto teor de fibras" },
  { id: "ar4", name: "Arroz Premium", brand: "Sol do Cerrado", emoji: "🌾", bg: "#F57F17", priceCents: 879, weight: 1000, unit: "g", validity: "12/2026", extra: "Grão Japonês" },
  // FEIJÃO
  { id: "fe1", name: "Feijão Carioca", brand: "Grão Fino", emoji: "🫘", bg: "#6D4C41", priceCents: 429, weight: 500, unit: "g", validity: "05/2026", extra: "Carioca Tipo 1" },
  { id: "fe2", name: "Feijão Carioca", brand: "Campo Verde", emoji: "🫘", bg: "#5D4037", priceCents: 790, weight: 1000, unit: "g", validity: "09/2026", extra: "Pacote Grande" },
  { id: "fe3", name: "Feijão Preto", brand: "Terra Boa", emoji: "🫘", bg: "#37474F", priceCents: 499, weight: 500, unit: "g", validity: "07/2026", extra: "Origem Gaúcha" },
  // CAFÉ
  { id: "ca1", name: "Café Torrado", brand: "Café do Sul", emoji: "☕", bg: "#4E342E", priceCents: 890, weight: 250, unit: "g", validity: "04/2027", extra: "Intensidade 8" },
  { id: "ca2", name: "Café Torrado", brand: "Café do Sul", emoji: "☕", bg: "#3E2723", priceCents: 1690, weight: 500, unit: "g", validity: "04/2027", extra: "Intensidade 8" },
  { id: "ca3", name: "Café Premium", brand: "Montanha Alta", emoji: "☕", bg: "#6D4C41", priceCents: 1290, weight: 250, unit: "g", validity: "02/2027", extra: "Grão especial" },
  // LEITE
  { id: "le1", name: "Leite Integral", brand: "Fazenda Boa", emoji: "🥛", bg: "#1565C0", priceCents: 499, weight: 1, unit: "L", validity: "03/2026", extra: "Longa vida UHT" },
  { id: "le2", name: "Leite Desnatado", brand: "Fazenda Boa", emoji: "🥛", bg: "#0288D1", priceCents: 529, weight: 1, unit: "L", validity: "03/2026", extra: "0% gordura" },
  { id: "le3", name: "Leite Integral", brand: "Campos do Sul", emoji: "🥛", bg: "#01579B", priceCents: 479, weight: 1, unit: "L", validity: "01/2026", extra: "Longa vida" },
  // ÓLEO
  { id: "ol1", name: "Óleo de Soja", brand: "Gota de Ouro", emoji: "🫙", bg: "#F9A825", priceCents: 549, weight: 900, unit: "ml", validity: "11/2026", extra: "0% colesterol" },
  { id: "ol2", name: "Óleo de Soja", brand: "Gota de Ouro", emoji: "🫙", bg: "#F57F17", priceCents: 990, weight: 1800, unit: "ml", validity: "11/2026", extra: "Embalagem familiar" },
  { id: "ol3", name: "Óleo de Girassol", brand: "Sol Puro", emoji: "🫙", bg: "#E65100", priceCents: 799, weight: 900, unit: "ml", validity: "07/2026", extra: "Sabor suave" },
  // SHAMPOO
  { id: "sh1", name: "Shampoo Hidratante", brand: "Cabelos & Saúde", emoji: "🧴", bg: "#7B1FA2", priceCents: 990, weight: 300, unit: "ml", validity: "06/2028", extra: "Argan + Queratina" },
  { id: "sh2", name: "Shampoo Hidratante", brand: "Cabelos & Saúde", emoji: "🧴", bg: "#6A1B9A", priceCents: 1290, weight: 400, unit: "ml", validity: "06/2028", extra: "Argan + Queratina" },
  { id: "sh3", name: "Shampoo Premium", brand: "Belle Luxe", emoji: "🧴", bg: "#4A148C", priceCents: 1590, weight: 200, unit: "ml", validity: "12/2028", extra: "Fórmula profissional" },
  // DETERGENTE
  { id: "de1", name: "Detergente Limão", brand: "Brilha Fácil", emoji: "🧽", bg: "#2E7D32", priceCents: 249, weight: 500, unit: "ml", validity: "12/2027", extra: "Anti-gordura" },
  { id: "de2", name: "Detergente Neutro", brand: "Brilha Fácil", emoji: "🧽", bg: "#1B5E20", priceCents: 199, weight: 500, unit: "ml", validity: "12/2027", extra: "Suave para as mãos" },
  { id: "de3", name: "Detergente Concentrado", brand: "LimpaMax", emoji: "🧽", bg: "#33691E", priceCents: 329, weight: 1000, unit: "ml", validity: "08/2027", extra: "Rende mais" },
  // SUCO
  { id: "su1", name: "Suco de Laranja", brand: "Del Frutas", emoji: "🧃", bg: "#E65100", priceCents: 249, weight: 200, unit: "ml", validity: "09/2025", extra: "Nectar 25%" },
  { id: "su2", name: "Suco de Uva", brand: "Del Frutas", emoji: "🧃", bg: "#6A1B9A", priceCents: 790, weight: 1000, unit: "ml", validity: "11/2025", extra: "Integral 100%" },
  { id: "su3", name: "Suco de Maracujá", brand: "Del Frutas", emoji: "🧃", bg: "#F57F17", priceCents: 329, weight: 500, unit: "ml", validity: "10/2025", extra: "Nectar 30%" },
  // BISCOITO
  { id: "bi1", name: "Biscoito Cream Cracker", brand: "Pão Dourado", emoji: "🍪", bg: "#795548", priceCents: 319, weight: 200, unit: "g", validity: "07/2025", extra: "Crocante e salgado" },
  { id: "bi2", name: "Biscoito Maria", brand: "Pão Dourado", emoji: "🍪", bg: "#6D4C41", priceCents: 249, weight: 200, unit: "g", validity: "07/2025", extra: "Tradicional" },
  { id: "bi3", name: "Biscoito Recheado", brand: "Delícia Fácil", emoji: "🍪", bg: "#3E2723", priceCents: 469, weight: 140, unit: "g", validity: "05/2025", extra: "Recheio Chocolate" },
  // FARINHA
  { id: "fa1", name: "Farinha de Trigo", brand: "Moinho Bom", emoji: "🌾", bg: "#D7CCC8", bg2: "#795548", priceCents: 399, weight: 1, unit: "kg", validity: "01/2027", extra: "Tipo 1 Premium" } as Product & { bg2?: string },
  { id: "fa2", name: "Farinha de Trigo", brand: "Moinho Bom", emoji: "🌾", bg: "#BCAAA4", bg2: "#5D4037", priceCents: 699, weight: 2, unit: "kg", validity: "01/2027", extra: "Embalagem família" } as Product & { bg2?: string },
];

function fmtP(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function weightStr(w: number, u: Product["unit"]): string {
  return `${w} ${u}`;
}

function perHundredStr(cents: number, weight: number, unit: Product["unit"]): string {
  // Convert all to base unit (g or ml)
  let base = weight;
  if (unit === "kg") base = weight * 1000;
  if (unit === "L") base = weight * 1000;
  const per100 = (cents / base) * 100;
  return `R$ ${per100.toFixed(2).replace(".", ",")} /100${unit === "kg" || unit === "g" ? "g" : "ml"}`;
}

// ── Question types ────────────────────────────────────────────────────────────

type QType = "find-price" | "find-weight" | "cheapest" | "most-content" | "best-value" | "expensive";

interface Round {
  qtype: QType;
  question: string;
  tip: string;
  products: Product[];
  correctId: string;
  options?: string[];        // for find-price / find-weight
  correctOption?: string;
  showPerUnit: boolean;
}

function pickTwo(arr: Product[], cat1?: string, cat2?: string): [Product, Product] {
  const filtered = arr.filter(p => p.id.slice(0, 2) === (cat1 ?? p.id.slice(0, 2)));
  const p1 = filtered[Math.floor(Math.random() * filtered.length)];
  let pool = arr.filter(p => p.id !== p1.id);
  if (cat2) pool = arr.filter(p => p.id.slice(0, 2) === cat2 && p.id !== p1.id);
  if (pool.length === 0) pool = arr.filter(p => p.id !== p1.id);
  const p2 = pool[Math.floor(Math.random() * pool.length)];
  return [p1, p2];
}

function pickThree(arr: Product[]): [Product, Product, Product] {
  const s = [...arr].sort(() => Math.random() - 0.5).slice(0, 3);
  return [s[0], s[1], s[2]];
}

function wrongPrices(correct: number, count: number): string[] {
  const result = new Set<string>();
  const base = correct;
  const variants = [base - 200, base - 100, base + 100, base + 150, base + 250, base + 300, Math.round(base * 1.3)];
  for (const v of variants.filter(x => x > 0)) {
    result.add(fmtP(v));
    if (result.size >= count) break;
  }
  while (result.size < count) {
    const r = base + Math.round((Math.random() - 0.5) * base * 0.5);
    result.add(fmtP(r));
  }
  return [...result];
}

function wrongWeights(correct: number, unit: Product["unit"], count: number): string[] {
  const variants = [correct - 200, correct - 100, correct + 100, correct + 250, correct * 2]
    .filter(v => v > 0)
    .map(v => `${v} ${unit}`);
  return variants.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const CATS = ["ar", "fe", "ca", "le", "ol", "sh", "de", "su", "bi", "fa"];

function buildRound(d: number): Round {
  const sameCat = PRODUCTS.filter(p => p.id.slice(0, 2) === CATS[Math.floor(Math.random() * CATS.length)]);
  const allProd = PRODUCTS;

  if (d <= 3) {
    // L1: Find specific info on 1 product
    const product = sameCat[Math.floor(Math.random() * sameCat.length)] ?? PRODUCTS[0];
    if (Math.random() < 0.55) {
      // Find price
      const correct = fmtP(product.priceCents);
      const options = shuffle([correct, ...wrongPrices(product.priceCents, 3)]);
      return {
        qtype: "find-price",
        question: `Qual é o preço do ${product.name.toLowerCase()}?`,
        tip: "Leia o preço na etiqueta do produto",
        products: [product],
        correctId: product.id,
        options,
        correctOption: correct,
        showPerUnit: false,
      };
    } else {
      // Find weight/quantity
      const correct = weightStr(product.weight, product.unit);
      const wrongs = wrongWeights(product.weight, product.unit, 3);
      const options = shuffle([correct, ...wrongs]);
      return {
        qtype: "find-weight",
        question: `Qual é o conteúdo (peso/volume) deste produto?`,
        tip: "Procure a quantidade ou peso na embalagem",
        products: [product],
        correctId: product.id,
        options,
        correctOption: correct,
        showPerUnit: false,
      };
    }
  }

  if (d <= 5) {
    // L2: Compare 2 products, direct comparison
    const cat = CATS[Math.floor(Math.random() * CATS.length)];
    const catProducts = PRODUCTS.filter(p => p.id.startsWith(cat));
    const two = catProducts.length >= 2
      ? (shuffle(catProducts).slice(0, 2) as [Product, Product])
      : (shuffle(PRODUCTS).slice(0, 2) as [Product, Product]);

    if (Math.random() < 0.5) {
      const cheaper = two[0].priceCents <= two[1].priceCents ? two[0] : two[1];
      return {
        qtype: "cheapest",
        question: "Qual produto é mais barato?",
        tip: "Compare os preços e toque no mais barato",
        products: two,
        correctId: cheaper.id,
        showPerUnit: false,
      };
    } else {
      // Most content — pick same product different sizes
      const heavier = two[0].weight >= two[1].weight ? two[0] : two[1];
      return {
        qtype: "most-content",
        question: "Qual produto tem mais conteúdo?",
        tip: "Compare o peso ou volume dos produtos",
        products: two,
        correctId: heavier.id,
        showPerUnit: false,
      };
    }
  }

  if (d <= 7) {
    // L3: Best value per 100g/ml
    const cat = CATS[Math.floor(Math.random() * CATS.length)];
    const catP = PRODUCTS.filter(p => p.id.startsWith(cat));
    const two = catP.length >= 2
      ? (shuffle(catP).slice(0, 2) as [Product, Product])
      : (shuffle(PRODUCTS).slice(0, 2) as [Product, Product]);

    function perUnit(p: Product): number {
      let base = p.weight;
      if (p.unit === "kg") base = p.weight * 1000;
      if (p.unit === "L") base = p.weight * 1000;
      return p.priceCents / base;
    }

    const best = perUnit(two[0]) <= perUnit(two[1]) ? two[0] : two[1];
    return {
      qtype: "best-value",
      question: "Qual produto oferece o melhor custo-benefício?",
      tip: "",
      products: two,
      correctId: best.id,
      showPerUnit: false,
    };
  }

  // L4: 3 products, find best value
  const three = shuffle(PRODUCTS).slice(0, 3) as [Product, Product, Product];

  function perU(p: Product): number {
    let base = p.weight;
    if (p.unit === "kg") base = p.weight * 1000;
    if (p.unit === "L") base = p.weight * 1000;
    return p.priceCents / base;
  }

  const best = three.reduce((a, b) => perU(a) <= perU(b) ? a : b);
  return {
    qtype: "best-value",
    question: "Qual produto vale mais a pena comprar?",
    tip: "",
    products: three,
    correctId: best.id,
    showPerUnit: true,
  };
}

// ── Product Label Card ────────────────────────────────────────────────────────

function ProductLabelCard({
  product, selected, onClick, showPerUnit, highlighted, theme,
}: {
  product: Product; selected: boolean; onClick?: () => void;
  showPerUnit: boolean; highlighted?: boolean; theme: Theme;
}) {
  const border = selected
    ? "ring-4 ring-blue-500 scale-[1.03]"
    : highlighted
    ? "ring-3 ring-green-400"
    : "ring-1 ring-gray-200";

  let base = product.weight;
  if (product.unit === "kg") base = product.weight * 1000;
  if (product.unit === "L") base = product.weight * 1000;
  const per100 = (product.priceCents / base) * 100;
  const per100Unit = product.unit === "kg" || product.unit === "g" ? "g" : "ml";

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl overflow-hidden shadow-md transition-all w-full ${border} ${onClick ? "cursor-pointer active:scale-95" : "cursor-default"}`}
    >
      {/* Colored header */}
      <div
        className="p-3 flex flex-col items-center gap-0.5"
        style={{ background: product.bg }}
      >
        <span className="text-5xl leading-tight">{product.emoji}</span>
        <p className="text-white font-bold text-xs uppercase tracking-wide mt-1">{product.brand}</p>
        <p className="text-white/80 text-[11px] text-center leading-tight">{product.name}</p>
        {product.extra && (
          <p className="text-white/60 text-[10px] italic text-center">{product.extra}</p>
        )}
      </div>
      {/* Info section */}
      <div className="bg-white p-3 space-y-1.5">
        {/* Price — large and prominent */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Preço</p>
          <p className="text-2xl font-black text-gray-900 leading-tight">{fmtP(product.priceCents)}</p>
        </div>
        <div className="border-t border-dashed border-gray-200 pt-1.5 space-y-0.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Conteúdo</span>
            <span className="text-xs font-bold text-gray-700">{weightStr(product.weight, product.unit)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Validade</span>
            <span className="text-xs font-bold text-gray-700">{product.validity}</span>
          </div>
          {showPerUnit && (
            <div className="flex justify-between items-center bg-blue-50 rounded-lg px-1.5 py-1 mt-1">
              <span className="text-[10px] text-blue-600 font-bold">Por 100{per100Unit}</span>
              <span className="text-xs font-black text-blue-700">R$ {per100.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

const TUT_PRODUCT: Product = {
  id: "tut1", name: "Arroz Tipo 1", brand: "Grão Fino", emoji: "🌾",
  bg: "#1565C0", priceCents: 599, weight: 1000, unit: "g", validity: "10/2026", extra: "Tipo 1 Longo Fino",
};
const TUT_P2: Product = {
  id: "tut2", name: "Arroz Premium", brand: "Sol do Cerrado", emoji: "🌾",
  bg: "#F57F17", priceCents: 879, weight: 1000, unit: "g", validity: "12/2026", extra: "Grão Japonês",
};

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const done = useRef(false);
  const txt = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  function tap(id: string) {
    if (done.current) return;
    setPicked(id);
    if (id === "tut1") { done.current = true; setTimeout(onDone, 700); }
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-xl px-3 py-2 text-center border ${
        theme === "GAMIFIED" ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"
      }`}>
        <p className={`text-sm font-bold ${txt}`}>Qual produto é mais barato?</p>
        <p className={`text-xs mt-0.5 ${sub}`}>Toque no produto correto</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[TUT_PRODUCT, TUT_P2].map(p => (
          <ProductLabelCard key={p.id} product={p} selected={picked === p.id}
            onClick={() => tap(p.id)} showPerUnit={false} highlighted={picked === "tut1" && p.id === "tut1"}
            theme={theme}
          />
        ))}
      </div>
      {picked && picked !== "tut1" && (
        <p className="text-xs text-red-500 text-center">Atenção: compare os preços! R$ 5,99 é mais barato que R$ 8,79</p>
      )}
    </div>
  );
}

function CacaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Você verá etiquetas de produtos com preço, conteúdo e validade. Leia as informações e responda a pergunta corretamente!",
      content: (d: () => void) => <TutStep theme={theme} onDone={d} />,
    },
  ];
  return <TutorialBase theme={theme} title="Caça Informação" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────────


export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [currentRound, setCurrentRound] = useState<Round>(() => buildRound(difficulty));
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedOption, setPickedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<"question" | "result">("question");

  const startTime = useRef(Date.now());
  const curLevelRef = useRef(difficulty);
  const streakRef = useRef(0);
  const reachedRef = useRef(difficulty);

  const nextRound = useCallback((results: boolean[]) => {
    if (isTimeUp()) {
      finish();
      const accuracy = results.filter(Boolean).length / Math.max(1, results.length);
      onComplete({
        exerciseId: "caca-item-barato",
        domain: "attention",
        score: calculateExerciseScore("caca-item-barato", accuracy, undefined, reachedRef.current),
        accuracy, difficulty: reachedRef.current,
        duration: elapsedSec(),
        metadata: { rounds: results.length, correct: results.filter(Boolean).length },
      });
    } else {
      // "Musculação": 2 acertos seguidos → sobe o nível; 2 erros seguidos → desce.
      const lastCorrect = results[results.length - 1];
      streakRef.current = lastCorrect ? Math.max(0, streakRef.current) + 1 : Math.min(0, streakRef.current) - 1;
      if (streakRef.current >= 2) { streakRef.current = 0; curLevelRef.current = Math.min(10, curLevelRef.current + 1); reachedRef.current = Math.max(reachedRef.current, curLevelRef.current); }
      else if (streakRef.current <= -2) { streakRef.current = 0; curLevelRef.current = Math.max(1, curLevelRef.current - 1); }
      setCurrentRound(buildRound(curLevelRef.current));
      setPicked(null);
      setPickedOption(null);
      setRound(results.length);
      setPhase("question");
    }
  }, [isTimeUp, finish, elapsedSec, onComplete]);

  function handleProductTap(id: string) {
    if (phase !== "question" || picked !== null) return;
    const correct = id === currentRound.correctId;
    setPicked(id);
    setPhase("result");
    const newResults = [...roundResults, correct];
    setRoundResults(newResults);
    setTimeout(() => nextRound(newResults), 1500);
  }

  function handleOptionTap(opt: string) {
    if (phase !== "question" || pickedOption !== null) return;
    const correct = opt === currentRound.correctOption;
    setPickedOption(opt);
    setPhase("result");
    const newResults = [...roundResults, correct];
    setRoundResults(newResults);
    setTimeout(() => nextRound(newResults), 1500);
  }

  if (showTutorial) return <CacaTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-slate-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-blue-50 to-indigo-50" : "bg-gradient-to-br from-slate-50 via-white to-blue-50/30",
    card: theme === "GAMIFIED" ? "bg-slate-800 border border-slate-600/40" : "bg-white border border-slate-200 shadow-md",
    title: theme === "GAMIFIED" ? "text-cyan-400" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-slate-400" : "text-slate-500",
    qBg: theme === "GAMIFIED" ? "bg-blue-900/30 border-blue-700/50" : "bg-blue-50 border-blue-200",
    qTxt: theme === "GAMIFIED" ? "text-blue-200" : "text-blue-800",
    tipTxt: theme === "GAMIFIED" ? "text-slate-400" : "text-slate-500",
    optNormal: theme === "GAMIFIED" ? "bg-slate-700 border-slate-600 text-gray-200 hover:border-cyan-400" : "bg-white border-slate-300 text-gray-800 hover:border-blue-400",
    optCorrect: "bg-green-50 border-green-500 text-green-800",
    optWrong: "bg-red-50 border-red-400 text-red-700 opacity-60",
    dot: (i: number) => {
      if (i < roundResults.length) return roundResults[i] ? "bg-green-500" : "bg-red-400";
      if (i === roundResults.length) return (theme === "GAMIFIED" ? "bg-cyan-500" : "bg-blue-500") + " animate-pulse";
      return theme === "GAMIFIED" ? "bg-slate-700" : "bg-slate-200";
    },
  };

  const cols = currentRound.products.length === 1 ? "grid-cols-1" : currentRound.products.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 pt-6 ${pal.bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl p-4 ${pal.card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-sm ${pal.title}`}>🔍 Caça Informação</h2>
          <span className={`text-xs font-bold tabular-nums ${pal.sub}`}>{progressPct}%</span>
        </div>

        {/* Progress (pelo tempo, ~7 min) */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex-1 rounded-full overflow-hidden ${theme === "GAMIFIED" ? "bg-slate-700" : "bg-slate-200"}`} style={{ height: 6 }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: theme === "GAMIFIED" ? "#22d3ee" : "#3b82f6", transition: "width 0.45s linear" }} />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={round} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`rounded-xl px-3 py-3 border ${pal.qBg}`}>
              <p className={`text-base font-bold text-center ${pal.qTxt}`}>{currentRound.question}</p>
              {currentRound.tip && (
                <p className={`text-xs text-center mt-0.5 ${pal.tipTxt}`}>💡 {currentRound.tip}</p>
              )}
            </div>

            {/* Product cards */}
            <div className={`grid ${cols} gap-3`}>
              {currentRound.products.map(p => {
                const isTapped = picked === p.id;
                const isCorrect = p.id === currentRound.correctId;
                const showGreen = phase === "result" && isCorrect;
                const showRed = phase === "result" && isTapped && !isCorrect;
                return (
                  <div key={p.id} className={`relative ${showGreen ? "ring-4 ring-green-400 rounded-2xl" : showRed ? "ring-4 ring-red-400 rounded-2xl opacity-60" : ""}`}>
                    <ProductLabelCard
                      product={p}
                      selected={isTapped}
                      onClick={currentRound.options ? undefined : () => handleProductTap(p.id)}
                      showPerUnit={currentRound.showPerUnit}
                      theme={theme}
                    />
                    {phase === "result" && showGreen && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Multiple choice options (for find-price / find-weight) */}
            {currentRound.options && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {currentRound.options.map(opt => {
                  const isCorrect = opt === currentRound.correctOption;
                  const isTapped = pickedOption === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionTap(opt)}
                      disabled={phase === "result"}
                      className={`h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                        phase === "result"
                          ? isCorrect ? pal.optCorrect : (isTapped ? pal.optWrong : (theme === "GAMIFIED" ? "bg-slate-700/50 border-slate-600 text-gray-500" : "bg-gray-50 border-slate-200 text-gray-400"))
                          : isTapped ? pal.optCorrect : pal.optNormal
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
            {phase === "result" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-center py-1.5 rounded-xl font-bold text-sm ${
                  roundResults[roundResults.length - 1]
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {roundResults[roundResults.length - 1] ? "✅ Correto!" : "❌ Resposta incorreta"}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
