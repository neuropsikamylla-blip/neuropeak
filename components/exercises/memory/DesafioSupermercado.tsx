"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { cancelTTS } from "@/lib/tts";
import { resolveVoice, ensureVoices } from "@/lib/voicePrefs";
import { VoicePicker } from "@/components/exercises/VoicePicker";
import { PresentationConfig, type PresMode } from "@/components/exercises/PresentationConfig";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DesafioSupermercadoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Product { id: string; name: string; }

// ── Catálogo realista (fotos em /public/exercises/produtos) ─────────────────────
// Agrupado por categoria: gera listas VARIADAS (1 item de categorias diferentes) e,
// nos níveis altos, distratores da MESMA categoria (interferência semântica).

const CATEGORIES: Record<string, Product[]> = {
  hortifruti: [
    { id: "banana", name: "Banana" }, { id: "maca", name: "Maçã" },
    { id: "laranja", name: "Laranja" }, { id: "morango", name: "Morango" },
    { id: "uva", name: "Uva" }, { id: "pera", name: "Pera" },
    { id: "manga", name: "Manga" }, { id: "abacaxi", name: "Abacaxi" },
    { id: "melancia", name: "Melancia" }, { id: "limao", name: "Limão" },
    { id: "tomate", name: "Tomate" }, { id: "cebola", name: "Cebola" },
    { id: "batata", name: "Batata" }, { id: "cenoura", name: "Cenoura" },
    { id: "alface", name: "Alface" }, { id: "brocolis", name: "Brócolis" },
    { id: "abobrinha", name: "Abobrinha" }, { id: "pepino", name: "Pepino" },
    { id: "alho", name: "Alho" }, { id: "couve", name: "Couve" },
    { id: "pimentao", name: "Pimentão" }, { id: "mandioca", name: "Mandioca" },
    { id: "batata-doce", name: "Batata-doce" }, { id: "kiwi", name: "Kiwi" },
    { id: "abacate", name: "Abacate" }, { id: "beterraba", name: "Beterraba" },
    { id: "mamao", name: "Mamão" }, { id: "melao", name: "Melão" },
  ],
  graos: [
    { id: "arroz", name: "Arroz" }, { id: "feijao", name: "Feijão" },
    { id: "lentilha", name: "Lentilha" },
  ],
  massas: [
    { id: "espaguete", name: "Espaguete" }, { id: "parafuso", name: "Macarrão parafuso" },
    { id: "miojo", name: "Macarrão instantâneo" },
  ],
  farinhas: [
    { id: "farinha-trigo", name: "Farinha de trigo" }, { id: "fuba", name: "Fubá" },
    { id: "farinha-mandioca", name: "Farinha de mandioca" }, { id: "amido", name: "Amido de milho" },
  ],
  oleos: [
    { id: "oleo", name: "Óleo" }, { id: "azeite", name: "Azeite" }, { id: "vinagre", name: "Vinagre" },
  ],
  mercearia: [
    { id: "aveia", name: "Aveia" }, { id: "granola", name: "Granola" },
    { id: "cereal", name: "Cereal" }, { id: "fermento", name: "Fermento em pó" },
    { id: "batata-frita", name: "Batata frita" }, { id: "biscoito", name: "Biscoito recheado" },
    { id: "achocolatado", name: "Achocolatado" }, { id: "acucar", name: "Açúcar" },
    { id: "sal", name: "Sal" }, { id: "cafe", name: "Café" },
    { id: "pipoca", name: "Pipoca de micro-ondas" }, { id: "mel", name: "Mel" },
    { id: "geleia-morango", name: "Geleia de morango" }, { id: "leite-po", name: "Leite em pó" },
    { id: "cream-cracker", name: "Biscoito água e sal" }, { id: "caldo-carne", name: "Caldo de carne" },
    { id: "pirulito", name: "Pirulito" }, { id: "amendoim", name: "Amendoim" },
    { id: "batata-chips", name: "Batata chips" }, { id: "chocolate", name: "Chocolate" },
  ],
  enlatados: [
    { id: "milho", name: "Milho em lata" }, { id: "ervilha", name: "Ervilha em lata" },
    { id: "atum", name: "Atum" }, { id: "sardinha", name: "Sardinha" },
  ],
  molhos: [
    { id: "extrato", name: "Extrato de tomate" }, { id: "maionese", name: "Maionese" },
    { id: "ketchup", name: "Ketchup" }, { id: "mostarda", name: "Mostarda" },
    { id: "shoyu", name: "Molho shoyu" },
  ],
  frios: [
    { id: "presunto", name: "Presunto" }, { id: "requeijao", name: "Requeijão" },
    { id: "creme-leite", name: "Creme de leite" }, { id: "leite-condensado", name: "Leite condensado" },
    { id: "leite", name: "Leite" }, { id: "queijo", name: "Queijo" },
    { id: "iogurte", name: "Iogurte" }, { id: "manteiga", name: "Manteiga" },
    { id: "peito-peru", name: "Peito de peru" }, { id: "margarina", name: "Margarina" },
    { id: "mussarela", name: "Mussarela fatiada" }, { id: "ovos", name: "Ovos" },
  ],
  carnes: [
    { id: "peixe", name: "Peixe" }, { id: "linguica", name: "Linguiça" },
    { id: "salsicha", name: "Salsicha" }, { id: "hamburguer", name: "Hambúrguer" },
    { id: "frango-assado", name: "Frango assado" },
  ],
  congelados: [
    { id: "nuggets", name: "Nuggets" }, { id: "pizza", name: "Pizza congelada" },
    { id: "sorvete", name: "Sorvete" }, { id: "acai", name: "Açaí" },
    { id: "pao-queijo", name: "Pão de queijo" }, { id: "ervilha-congelada", name: "Ervilha congelada" },
    { id: "lasanha", name: "Lasanha congelada" },
  ],
  padaria: [
    { id: "bolo", name: "Bolo" }, { id: "cookies", name: "Cookies" },
    { id: "pao", name: "Pão" }, { id: "croissant", name: "Croissant" },
    { id: "donut", name: "Donut" }, { id: "baguete", name: "Baguete" },
    { id: "rosquinha", name: "Rosquinha" }, { id: "pao-forma", name: "Pão de forma" },
    { id: "torta-morango", name: "Torta de morango" },
  ],
  bebidas: [
    { id: "energetico", name: "Energético" }, { id: "agua-coco", name: "Água de coco" },
    { id: "suco-laranja", name: "Suco de laranja" }, { id: "suco-uva", name: "Suco de uva" },
    { id: "cha", name: "Chá" }, { id: "agua-mineral", name: "Água mineral" },
    { id: "refrigerante-cola", name: "Refrigerante" }, { id: "isotonico", name: "Isotônico" },
    { id: "suco-caixinha", name: "Suco de caixinha" }, { id: "guarana", name: "Guaraná" },
  ],
  limpeza: [
    { id: "detergente", name: "Detergente" }, { id: "detergente-limao", name: "Detergente limão" },
    { id: "limpador-multiuso", name: "Limpador multiuso" }, { id: "limpa-vidros", name: "Limpa-vidros" },
    { id: "desengordurante", name: "Desengordurante" }, { id: "limpador-sanitario", name: "Limpador sanitário" },
    { id: "desinfetante", name: "Desinfetante" }, { id: "agua-sanitaria", name: "Água sanitária" },
    { id: "alcool", name: "Álcool" }, { id: "alcool-gel", name: "Álcool em gel" },
    { id: "sabao-liquido", name: "Sabão líquido" }, { id: "esponja", name: "Esponja" },
    { id: "saco-lixo", name: "Saco de lixo" }, { id: "pano", name: "Pano de limpeza" },
    { id: "papel-toalha", name: "Papel toalha" },
  ],
  lavanderia: [
    { id: "sabao-po", name: "Sabão em pó" }, { id: "detergente-po", name: "Detergente em pó" },
    { id: "sabao-barra", name: "Sabão em barra" }, { id: "amaciante", name: "Amaciante" },
  ],
  higiene: [
    { id: "sabonete", name: "Sabonete" }, { id: "sabonete-laranja", name: "Sabonete laranja" },
    { id: "sabonete-liquido", name: "Sabonete líquido" }, { id: "escova", name: "Escova de dente" },
    { id: "pasta-dente", name: "Pasta de dente" }, { id: "creme-dental", name: "Creme dental" },
    { id: "fio-dental", name: "Fio dental" }, { id: "enxaguante", name: "Enxaguante bucal" },
    { id: "shampoo", name: "Shampoo" }, { id: "condicionador", name: "Condicionador" },
    { id: "desodorante", name: "Desodorante" }, { id: "protetor-solar", name: "Protetor solar" },
    { id: "creme-maos", name: "Creme para as mãos" }, { id: "lencos-umedecidos", name: "Lenços umedecidos" },
    { id: "cotonete", name: "Cotonete" }, { id: "fralda", name: "Fralda" },
  ],
};

const PRODUCTS: Product[] = Object.values(CATEGORIES).flat();
const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.id, p]));
const CAT_OF = new Map<string, string>();
for (const [cat, items] of Object.entries(CATEGORIES)) {
  for (const p of items) CAT_OF.set(p.id, cat);
}
const CATEGORY_KEYS = Object.keys(CATEGORIES);

// Renderiza a foto realista do produto
function ProductImg({ id, size }: { id: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/exercises/produtos/${id}.png`} alt="" draggable={false}
      width={size} height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }} />
  );
}

// ── Tabela de níveis (1–12) — progressão da Kamylla ──────────────────────────────
// lists: 1 ou 2 listas (mãe/avó); order: livre / ordem direta / de trás para frente.
type OrderKind = "none" | "direct" | "reverse";
interface LevelConfig { lists: 1 | 2; count: number; order: OrderKind; extra: number; memSec: number; similar: boolean; }

const LEVELS: LevelConfig[] = [
  /*  1 */ { lists: 1, count: 2, order: "none",    extra: 8,  memSec: 6,  similar: false },
  /*  2 */ { lists: 1, count: 3, order: "none",    extra: 10, memSec: 7,  similar: false },
  /*  3 */ { lists: 1, count: 4, order: "none",    extra: 12, memSec: 8,  similar: false },
  /*  4 */ { lists: 1, count: 4, order: "direct",  extra: 12, memSec: 9,  similar: true  },
  /*  5 */ { lists: 1, count: 5, order: "direct",  extra: 14, memSec: 10, similar: true  },
  /*  6 */ { lists: 2, count: 2, order: "none",    extra: 10, memSec: 9,  similar: false },
  /*  7 */ { lists: 2, count: 3, order: "none",    extra: 12, memSec: 11, similar: true  },
  /*  8 */ { lists: 2, count: 4, order: "none",    extra: 14, memSec: 13, similar: true  },
  /*  9 */ { lists: 1, count: 4, order: "reverse", extra: 14, memSec: 9,  similar: true  },
  /* 10 */ { lists: 1, count: 5, order: "reverse", extra: 16, memSec: 10, similar: true  },
  /* 11 */ { lists: 2, count: 3, order: "reverse", extra: 14, memSec: 12, similar: true  },
  /* 12 */ { lists: 2, count: 4, order: "reverse", extra: 16, memSec: 14, similar: true  },
];
const MAX_LEVEL = 12;

function clampLevel(difficulty: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.round(difficulty)));
}
function levelConfig(level: number): LevelConfig {
  return LEVELS[level - 1] ?? LEVELS[0];
}
function memorizeSeconds(level: number, mode: "leitura" | "auditivo"): number {
  const base = levelConfig(level).memSec;
  return mode === "auditivo" ? base + 2 : base;
}
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
function pickOne<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Escolhe uma lista VARIADA (1 item por categoria), excluindo ids já usados.
function pickList(count: number, exclude: Set<string>): Product[] {
  const picked: Product[] = [];
  const pickedIds = new Set<string>();
  const cats = shuffle(CATEGORY_KEYS);
  for (let round = 0; round < 6 && picked.length < count; round++) {
    for (const cat of cats) {
      if (picked.length >= count) break;
      const cands = CATEGORIES[cat].filter(p => !pickedIds.has(p.id) && !exclude.has(p.id));
      if (cands.length) { const c = pickOne(cands); picked.push(c); pickedIds.add(c.id); }
    }
  }
  if (picked.length < count) {
    for (const p of shuffle(PRODUCTS)) {
      if (picked.length >= count) break;
      if (!pickedIds.has(p.id) && !exclude.has(p.id)) { picked.push(p); pickedIds.add(p.id); }
    }
  }
  return picked;
}

// Prateleira = itens das listas + distratores (mesma categoria se `similar`) — bem cheia.
function buildShelf(listItems: Product[], extra: number, similar: boolean): Product[] {
  const ids = new Set(listItems.map(p => p.id));
  const pool = PRODUCTS.filter(p => !ids.has(p.id));
  let distractors: Product[];
  if (similar) {
    const cats = new Set(listItems.map(p => CAT_OF.get(p.id)));
    const sameCat = pool.filter(p => cats.has(CAT_OF.get(p.id)));
    const others  = pool.filter(p => !cats.has(CAT_OF.get(p.id)));
    distractors = [...shuffle(sameCat), ...shuffle(others)].slice(0, extra);
  } else {
    distractors = shuffle(pool).slice(0, extra);
  }
  return shuffle([...listItems, ...distractors]);
}

interface Trial { lists: Product[][]; labels: string[]; target: number; order: OrderKind; shelf: Product[]; }

function buildTrial(level: number, recentIds: Set<string>): Trial {
  const cfg = levelConfig(level);
  const exclude = new Set(recentIds);
  const lists: Product[][] = [];
  for (let i = 0; i < cfg.lists; i++) {
    const l = pickList(cfg.count, exclude);
    l.forEach(p => exclude.add(p.id));
    lists.push(l);
  }
  const labels = cfg.lists === 2 ? ["mãe", "avó"] : [""];
  const target = cfg.lists === 2 ? Math.floor(Math.random() * 2) : 0;
  const shelf = buildShelf(lists.flat(), cfg.extra, cfg.similar);
  return { lists, labels, target, order: cfg.order, shelf };
}

// Texto falado (auditivo) das listas a memorizar.
function memoSpeechText(lists: Product[][], labels: string[]): string {
  if (lists.length > 1) {
    return lists.map((l, i) => `A ${labels[i]} pediu: ${l.map(p => p.name).join(", ")}.`).join(" ");
  }
  return "Sua lista de compras: " + lists[0].map(p => p.name).join(", ") + ".";
}
// Instrução exibida nas prateleiras (qual lista + ordem).
function shopInstruction(t: Trial): string {
  const who = t.lists.length > 1 ? `a lista da ${t.labels[t.target]}` : "a lista";
  const ord = t.order === "direct" ? ", na mesma ordem" : t.order === "reverse" ? ", de trás para frente" : "";
  return `Compre ${who}${ord}.`;
}

// ── Web Speech (voz escolhida pela terapeuta — ver lib/voicePrefs) ───────────────

function speakMemo(lists: Product[][], labels: string[], onDone?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) { onDone?.(); return; }
  const synth = window.speechSynthesis;
  const run = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(memoSpeechText(lists, labels));
    u.lang = "pt-BR"; u.rate = 0.92; u.pitch = 1.0; u.volume = 1;
    const v = resolveVoice(); if (v) u.voice = v;
    u.onend = () => onDone?.();
    u.onerror = () => onDone?.();
    synth.speak(u);
  };
  ensureVoices(run);
}

// ── Fundo de mercado (recriado via CSS) ──────────────────────────────────────────

function StoreBg() {
  // prateleiras desfocadas ao fundo sugeridas por blocos coloridos
  const shelfRow = (top: string, colors: string[]) => (
    <div style={{
      position: "absolute", left: "-4%", right: "-4%", top, height: "12%",
      display: "flex", gap: 10, padding: "0 12px", filter: "blur(11px)", opacity: 0.45,
    }}>
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 6, background: c }} />
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(180deg,#d2dded 0%,#e4ebf3 24%,#f0ead9 56%,#ebe0cb 100%)" }} />
      {shelfRow("6%",  ["#f0c266", "#e0876b", "#7eb0dd", "#92c294", "#e2b766", "#c4a3cc"])}
      {shelfRow("21%", ["#92c294", "#e6a173", "#84bdd6", "#ecce6b", "#d68585", "#85aede"])}
      {/* letreiro de corredor */}
      <div style={{ position: "absolute", left: "5%", top: "3.5%", padding: "3px 12px", borderRadius: 4,
        background: "rgba(40,68,118,0.4)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 800,
        letterSpacing: 2, filter: "blur(0.4px)" }}>LATICÍNIOS</div>
      {/* leve profundidade + chão claro */}
      <div style={{ position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.25), transparent 55%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "26%",
        background: "linear-gradient(180deg, transparent, rgba(200,165,115,0.22))" }} />
    </div>
  );
}


// ── Prateleira de madeira ────────────────────────────────────────────────────────

// Prateleira que SE AJUSTA À ÁREA: escolhe colunas + tamanho de célula que
// fazem TODOS os produtos caberem sem rolar (muitos pacientes não entendem que
// precisam descer a tela). Mede o contêiner e calcula a melhor grade.
function WoodShelf({
  products, cartIds, onToggle, showLabels,
}: {
  products: Product[]; cartIds: string[]; onToggle: (id: string) => void; showLabels: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const compute = () => setBox({ w: el.clientWidth - 16, h: el.clientHeight - 16 }); // -padding
    compute();
    const ro = new ResizeObserver(compute); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = products.length || 1;
  const gap = 8;            // espaço horizontal entre produtos
  const gapV = 8;           // espaço vertical entre prateleiras
  // proporção da tábua em relação à célula (somada ao calcular o que cabe sem rolar)
  const PLANK_R = 0.2;
  let cols = 3, cell = 0, rows = 1;
  if (box.w > 0 && box.h > 0) {
    for (let c = 3; c <= 6; c++) {
      const r = Math.ceil(n / c);
      const cw = (box.w - gap * (c - 1)) / c;
      // r bandas, cada banda = célula + tábua(≈cell*PLANK_R); descontando os gaps verticais
      const ch = (box.h - gapV * (r - 1)) / (r * (1 + PLANK_R));
      const sz = Math.min(cw, ch);
      if (sz > cell) { cell = sz; cols = c; rows = r; }
    }
  }
  cell = Math.max(cell, 40);
  const plankH = Math.min(Math.max(Math.round(cell * PLANK_R), 11), 24);
  const showLbl = showLabels && cell >= 66;
  const imgSize = Math.max(26, Math.floor(cell * (showLbl ? 0.64 : 0.8)));

  // divide os produtos em linhas (uma tábua por linha)
  const rowsArr: Product[][] = [];
  for (let i = 0; i < products.length; i += cols) rowsArr.push(products.slice(i, i + cols));
  while (rowsArr.length < rows) rowsArr.push([]);

  return (
    <div ref={wrapRef} style={{
      width: "100%", height: "100%", borderRadius: 18, padding: 10, overflow: "hidden",
      // moldura da gôndola
      background: "linear-gradient(135deg,#cda876 0%,#bb945f 55%,#a87f4c 100%)",
      boxShadow: "0 12px 30px rgba(70,45,15,0.32), inset 0 2px 3px rgba(255,255,255,0.45)",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 12, overflow: "hidden",
        // parede de loja (clara, com painéis verticais sutis + luz de cima)
        backgroundImage: "repeating-linear-gradient(90deg, rgba(150,120,80,0.05) 0 1px, transparent 1px 46px), linear-gradient(180deg,#fcf5e6 0%,#f1e3c8 100%)",
        boxShadow: "inset 0 3px 12px rgba(120,90,50,0.2)",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: gapV,
        padding: "6px 8px",
      }}>
        {rowsArr.map((rowItems, ri) => (
          <div key={ri} style={{ flexShrink: 0 }}>
            {/* produtos em pé sobre a tábua */}
            <div style={{
              height: cell, display: "flex", flexDirection: "row",
              alignItems: "flex-end", justifyContent: "center", gap,
            }}>
              {rowItems.map(p => {
                const inCart = cartIds.includes(p.id);
                return (
                  <motion.button key={p.id} onClick={() => onToggle(p.id)} whileTap={{ scale: 0.9 }}
                    style={{
                      position: "relative", cursor: "pointer", background: "transparent", border: "none",
                      padding: 0, width: cell, height: cell, flexShrink: 0,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                      gap: 1, paddingBottom: 2,
                    }}>
                    {/* destaque ao selecionar */}
                    {inCart && (
                      <div style={{
                        position: "absolute", left: 3, right: 3, top: 2, bottom: 2, borderRadius: 13,
                        background: "rgba(47,158,143,0.14)", border: "2.5px solid #2f9e8f",
                        boxShadow: "0 0 0 4px rgba(47,158,143,0.12)",
                      }} />
                    )}
                    {/* sombra de contato no chão da prateleira */}
                    <div style={{
                      position: "absolute", bottom: 1, left: "14%", width: "72%", height: Math.max(6, cell * 0.09),
                      borderRadius: "50%", filter: "blur(1.5px)", zIndex: 0,
                      background: "radial-gradient(ellipse at center, rgba(70,48,18,0.30) 0%, rgba(70,48,18,0) 70%)",
                    }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                      <div style={{ filter: "drop-shadow(0 3px 3px rgba(60,40,15,0.28))" }}>
                        <ProductImg id={p.id} size={imgSize} />
                      </div>
                      {showLbl && (
                        <span style={{
                          fontSize: 11, fontWeight: 800, textAlign: "center", lineHeight: 1.05,
                          color: inCart ? "#116b60" : "#4a3d24", maxWidth: cell * 0.98,
                          textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{p.name}</span>
                      )}
                    </div>
                    {/* selo de selecionado */}
                    {inCart && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                        position: "absolute", top: 1, right: 4, width: 20, height: 20, borderRadius: "50%",
                        background: "#2f9e8f", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: "bold", color: "#fff", zIndex: 2,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>✓</motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {/* tábua da prateleira (gôndola): madeira + trilho de preço branco */}
            <div style={{ position: "relative", marginTop: 2 }}>
              {/* sombra que a prateleira projeta na parede abaixo */}
              <div style={{ position: "absolute", left: "3%", right: "3%", top: plankH - 1, height: 9, borderRadius: "50%",
                background: "radial-gradient(ellipse at center top, rgba(70,45,15,0.22) 0%, rgba(70,45,15,0) 75%)" }} />
              <div style={{ position: "relative", height: plankH, borderRadius: 3, overflow: "hidden",
                background: "linear-gradient(180deg,#f1dcb4 0%,#e6c98f 38%,#caa362 57%,#a8854a 59%, #f7f9fb 59%, #e8ecf0 100%)",
                boxShadow: "0 5px 9px rgba(60,38,12,0.32), inset 0 1px 1px rgba(255,255,255,0.6)" }}>
                {/* trilho de preço — tracinhos tipo etiqueta */}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "41%",
                  backgroundImage: "repeating-linear-gradient(90deg, rgba(120,130,140,0.22) 0 1px, transparent 1px 16px)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HUD (barra azul-marinho) ─────────────────────────────────────────────────────

function Hud({ level, mode, progressPct }: {
  level: number; mode: "leitura" | "auditivo"; progressPct: number;
}) {
  return (
    <div style={{
      flexShrink: 0, display: "flex", alignItems: "center", gap: 14,
      padding: "9px 16px", background: "linear-gradient(90deg,#0c1c3c,#13294f)",
      borderBottom: "1px solid rgba(120,150,200,0.18)", boxShadow: "0 2px 14px rgba(5,12,35,0.5)",
    }}>
      {/* esquerda: ícone + título + nível */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg,#f0b94a,#d98f2a)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20, boxShadow: "0 3px 9px rgba(180,120,20,0.5)" }}>🛒</div>
        <div style={{ lineHeight: 1.1 }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: 0.5 }}>SUPERMERCADO</span>
          <span style={{ color: "#f3bf57", fontWeight: 800, fontSize: 14, marginLeft: 8 }}>NÍVEL {level}</span>
        </div>
      </div>

      <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />

      {/* direita: Treino de Memória */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }} className="np-hud-right">
        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: "rgba(120,160,220,0.16)", border: "1px solid rgba(140,175,225,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧠</div>
        <div style={{ lineHeight: 1.15, textAlign: "right" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Treino de Memória</div>
          <div style={{ color: "rgba(190,205,230,0.75)", fontSize: 11 }}>
            {mode === "auditivo" ? "Selecione os itens que você ouviu." : "Selecione os itens que estavam na lista."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tutorial ─────────────────────────────────────────────────────────────────────

const TUT_LIST: Product[]  = [{ id: "pao", name: "Pão" }, { id: "leite", name: "Leite" }];
const TUT_SHELF: Product[] = [
  { id: "pao", name: "Pão" }, { id: "leite", name: "Leite" }, { id: "cookies", name: "Cookies" },
  { id: "morango", name: "Morango" }, { id: "donut", name: "Donut" }, { id: "sabonete", name: "Sabonete" },
  { id: "melancia", name: "Melancia" }, { id: "shampoo", name: "Shampoo" },
];

function TutMemorizeStep({ mode, onDone }: { mode: "leitura" | "auditivo"; onDone: () => void }) {
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (mode === "auditivo") speakMemo([TUT_LIST], [""]);
    const iv = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(iv); onDone(); return 0; } return p - 1; });
    }, 1000);
    return () => { clearInterval(iv); cancelTTS(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="rounded-xl p-4 space-y-3 bg-emerald-50 border border-emerald-200">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-gray-800">{mode === "auditivo" ? "🔊 Ouça os itens:" : "📋 Memorize a lista:"}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-600 font-mono">{countdown}s</span>
          <button onClick={onDone} className="text-xs px-2 py-0.5 rounded-lg font-bold bg-emerald-500 text-white">Pronto →</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TUT_LIST.map(p => (
          <div key={p.id} className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-emerald-200 bg-white">
            <ProductImg id={p.id} size={70} />
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
      if (next.includes("pao") && next.includes("leite") && !doneRef.current) { doneRef.current = true; setTimeout(onDone, 700); }
      return next;
    });
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-700">{mode === "auditivo" ? "Toque nos produtos que você ouviu." : "Toque nos produtos que estavam na lista."}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {TUT_SHELF.map(p => {
          const inCart = cart.includes(p.id);
          return (
            <button key={p.id} onClick={() => tap(p.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all active:scale-95 relative ${inCart ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white"}`}>
              <ProductImg id={p.id} size={50} />
              {mode === "leitura" && <span className={`text-[9px] text-center font-semibold leading-tight ${inCart ? "text-emerald-700" : "text-gray-700"}`}>{p.name}</span>}
              {inCart && <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">✓</div>}
            </button>
          );
        })}
      </div>
      {cart.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-sm">🛒</span>
          <div className="flex gap-1">{cart.map(id => <ProductImg key={id} id={id} size={30} />)}</div>
        </div>
      )}
    </div>
  );
}

function TutVariationsStep({ onDone }: { onDone: () => void }) {
  const Row = ({ emoji, title, text }: { emoji: string; title: string; text: string }) => (
    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-emerald-100">
      <span className="text-2xl leading-none">{emoji}</span>
      <div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 leading-snug">{text}</p>
      </div>
    </div>
  );
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-gray-600">Conforme você acerta, o jogo evolui. Fique atento à instrução de cada rodada:</p>
      <Row emoji="👩👵" title="Duas listas (mãe e avó)" text="Memorize as DUAS, mas compre só a lista que for pedida." />
      <Row emoji="➡️" title="Na ordem da lista" text="Em alguns níveis, pegue os itens na MESMA ordem da lista." />
      <Row emoji="↩️" title="De trás para frente" text="Em outros, compre na ordem INVERSA — do último ao primeiro." />
      <button onClick={onDone} className="w-full mt-1 h-10 rounded-xl font-bold bg-emerald-500 text-white">Entendi →</button>
    </div>
  );
}

function SupermercadoTutorial({ theme, mode, onDone }: { theme: Theme; mode: "leitura" | "auditivo"; onDone: () => void }) {
  const steps = [
    { instruction: mode === "auditivo" ? "Você vai OUVIR uma lista de compras. Memorize os itens pelo som!" : "Uma lista de compras vai aparecer. Memorize bem os produtos!",
      content: (done: () => void) => <TutMemorizeStep mode={mode} onDone={done} /> },
    { instruction: "Toque nos produtos da prateleira para colocá-los no carrinho. Depois confirme!",
      content: (done: () => void) => <TutShelfStep mode={mode} onDone={done} /> },
    { instruction: "Por último, as variações que vão aparecer conforme você avança:",
      content: (done: () => void) => <TutVariationsStep onDone={done} /> },
  ];
  return <TutorialBase theme={theme} title="Supermercado" steps={steps} onDone={onDone} />;
}

// ── Main component ────────────────────────────────────────────────────────────────


export function DesafioSupermercado({ difficulty, theme, onComplete }: DesafioSupermercadoProps) {
  // Modo de apresentação (escolhido na tela "Configurar atividade", antes de iniciar).
  const [presMode, setPresMode] = useState<PresMode | null>(null);
  const displayMode: "leitura" | "auditivo" = presMode === "audio_only" ? "auditivo" : "leitura";
  const mode = displayMode;                                  // controla esconder/mostrar texto
  const speakOn = presMode === "visual_audio" || presMode === "audio_only";  // controla a fala
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const startLevel = useMemo(() => clampLevel(difficulty), [difficulty]);
  const [sessionLevel, setSessionLevel] = useState(startLevel);
  const itemCount = levelConfig(sessionLevel).count;

  const [trial, setTrial]               = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [phase, setPhase]               = useState<"memorizing" | "shopping" | "result">("memorizing");
  const [countdown, setCountdown]       = useState(0);
  const [cartIds, setCartIds]           = useState<string[]>([]);
  const selected                        = useMemo(() => new Set(cartIds), [cartIds]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showVoice, setShowVoice]       = useState(false);
  const showVoiceRef = useRef(false);
  useEffect(() => { showVoiceRef.current = showVoice; }, [showVoice]);

  // pré-carrega TODAS as fotos de produto (corrige o travamento ao abrir as prateleiras)
  useEffect(() => {
    if (typeof window === "undefined") return;
    PRODUCTS.forEach(p => { const im = new window.Image(); im.src = `/exercises/produtos/${p.id}.png`; });
  }, []);

  const recentRef  = useRef<string[]>([]);
  const gradedRef  = useRef<number[]>([]);
  const wrongRef   = useRef(0);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const histRef    = useRef<boolean[]>([]);   // histórico p/ desbloqueio (3 seguidas ou 3 de 5)

  const [memoLists, setMemoLists]         = useState<Product[][]>([]);
  const [labels, setLabels]               = useState<string[]>([""]);
  const [targetIdx, setTargetIdx]         = useState(0);
  const [order, setOrder]                 = useState<OrderKind>("none");
  const [currentList, setCurrentList]     = useState<Product[]>([]);   // lista-alvo (a que deve comprar)
  const [shelfProducts, setShelfProducts] = useState<Product[]>([]);
  const [lastCorrect, setLastCorrect]     = useState(false);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const initTrial = useCallback((lvl: number) => {
    const t = buildTrial(lvl, new Set(recentRef.current));
    recentRef.current = [...t.lists.flat().map(p => p.id), ...recentRef.current].slice(0, 18);
    setMemoLists(t.lists);
    setLabels(t.labels);
    setTargetIdx(t.target);
    setOrder(t.order);
    setCurrentList(t.lists[t.target]);
    setShelfProducts(t.shelf);
    setCartIds([]);
    setPhase("memorizing");
  }, []);

  useEffect(() => { setSessionLevel(startLevel); histRef.current = []; }, [startLevel]);

  useEffect(() => {
    if (!showTutorial) { begin(); initTrial(startLevel); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  useEffect(() => {
    if (phase !== "memorizing" || showTutorial || memoLists.length === 0) return;
    const total = memorizeSeconds(sessionLevel, speakOn ? "auditivo" : "leitura");
    setCountdown(total);
    if (speakOn) { setAudioPlaying(true); speakMemo(memoLists, labels, () => setAudioPlaying(false)); }
    timerRef.current = setInterval(() => {
      if (showVoiceRef.current) return;   // pausa a contagem enquanto escolhe a voz
      setCountdown(prev => { if (prev <= 1) { clearTimer(); setPhase("shopping"); return 0; } return prev - 1; });
    }, 1000);
    return () => { clearTimer(); cancelTTS(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trial, showTutorial]);

  function toggleProduct(id: string) {
    if (phase !== "shopping") return;
    setCartIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleConfirm() {
    const targetIds  = currentList.map(p => p.id);
    const targetSet  = new Set(targetIds);
    const expectSeq  = order === "reverse" ? [...targetIds].reverse() : targetIds;
    const wrongSel   = cartIds.filter(id => !targetSet.has(id)).length;

    let isCorrect: boolean, graded: number;
    if (order === "none") {
      const correctSel = cartIds.filter(id => targetSet.has(id)).length;
      isCorrect = correctSel === targetSet.size && wrongSel === 0;
      graded = Math.max(0, (correctSel - wrongSel) / targetSet.size);
    } else {
      isCorrect = cartIds.length === expectSeq.length && cartIds.every((id, i) => id === expectSeq[i]);
      const posOk = cartIds.filter((id, i) => expectSeq[i] === id).length;
      graded = Math.max(0, (posOk - wrongSel) / expectSeq.length);
    }
    gradedRef.current.push(graded);
    wrongRef.current += wrongSel;
    setLastCorrect(isCorrect);

    // desbloqueio (regra da Kamylla): sobe 1 nível com 3 acertos seguidos OU 3 de 5; desce com 2 erros seguidos
    histRef.current = [...histRef.current, isCorrect].slice(-5);
    const h = histRef.current;
    const last3 = h.slice(-3);
    const up   = (last3.length === 3 && last3.every(Boolean)) || (h.length >= 5 && h.filter(Boolean).length >= 3);
    const down = h.slice(-2).length === 2 && h.slice(-2).every(x => !x);
    let nextLevel = sessionLevel;
    if (up && sessionLevel < MAX_LEVEL)  { nextLevel = sessionLevel + 1; histRef.current = []; }
    else if (down && sessionLevel > 1)   { nextLevel = sessionLevel - 1; histRef.current = []; }
    setSessionLevel(nextLevel);

    const newResults = [...trialResults, isCorrect];
    setTrialResults(newResults);
    setPhase("result");
    const nextTrial = trial + 1;
    const timeUp = isTimeUp();

    setTimeout(() => {
      if (timeUp) {
        finish();
        const total = Math.max(1, gradedRef.current.length);
        const correct   = newResults.filter(Boolean).length;
        const accTotal  = gradedRef.current.reduce((a, b) => a + b, 0) / total;
        const impulsive = wrongRef.current > total;
        onComplete({
          exerciseId: "desafio-supermercado",
          domain: "memory",
          score: calculateExerciseScore("desafio-supermercado", accTotal, undefined, nextLevel),
          accuracy: accTotal, difficulty: nextLevel,
          duration: elapsedSec(),
          metadata: { trials: total, correct, presentationMode: presMode, startLevel, level: nextLevel, progressionV2: true, accTotal, impulsive },
        });
      } else {
        setTrial(nextTrial);
        initTrial(nextLevel);
      }
    }, 1800);
  }

  // ── CONFIGURAR ATIVIDADE (escolha do modo) — antes de tudo, nunca toca áudio aqui ──
  if (presMode === null) {
    return (
      <PresentationConfig
        title="Supermercado" icon="🛒" accent="#1d7a6e"
        subtitle={<>Nível {startLevel} · memorize a lista e ache os produtos.</>}
        onChoose={(m) => setPresMode(m)}
      />
    );
  }

  if (showTutorial) {
    return <SupermercadoTutorial theme={theme} mode={mode} onDone={() => setShowTutorial(false)} />;
  }

  const memorizeTotal = memorizeSeconds(sessionLevel, speakOn ? "auditivo" : "leitura");
  const ratio = memorizeTotal > 0 ? countdown / memorizeTotal : 0;
  const isRoundCorrect = lastCorrect;
  const listCols = Math.min(currentList.length, 4);
  const ordered = order !== "none";
  const targetSeq = order === "reverse" ? [...currentList].reverse() : currentList;
  const instruction = `Compre ${memoLists.length > 1 ? `a lista da ${labels[targetIdx]}` : "a lista"}${order === "direct" ? ", na mesma ordem" : order === "reverse" ? ", de trás para frente" : ""}.`;

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#e8e0d0" }}>
      <StoreBg />
      {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Hud level={sessionLevel} mode={mode} progressPct={progressPct} />

        <AnimatePresence mode="wait">

          {/* ── MEMORIZING ── */}
          {phase === "memorizing" && (
            <motion.div key="mem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ width: "100%", maxWidth: 460, background: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(200,180,140,0.5)", borderRadius: 22, padding: "18px 16px",
                  boxShadow: "0 18px 44px rgba(40,30,15,0.28)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ color: "#1f2937", fontWeight: 800, fontSize: 15 }}>
                      {mode === "auditivo" ? "🎧 Ouça" : "📋 Memorize"} {memoLists.length > 1 ? "as listas!" : "a lista!"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 72, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${ratio * 100}%`, background: "#2f9e8f", borderRadius: 3, transition: "width 1s linear" }} />
                      </div>
                      <span style={{ color: "#1d7a6e", fontSize: 14, fontWeight: 800, minWidth: 26, textAlign: "right" }}>{countdown}s</span>
                    </div>
                  </div>
                  {speakOn && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
                      <button onClick={() => { setAudioPlaying(true); speakMemo(memoLists, labels, () => setAudioPlaying(false)); }}
                        style={{ fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 100, cursor: "pointer",
                          background: "rgba(47,158,143,0.12)", border: "1px solid rgba(47,158,143,0.35)", color: "#1d7a6e" }}>
                        {audioPlaying ? "🔊 Reproduzindo..." : "🔊 Ouvir de novo"}
                      </button>
                      <button onClick={() => setShowVoice(true)}
                        style={{ fontSize: 12.5, fontWeight: 700, padding: "7px 14px", borderRadius: 100, cursor: "pointer",
                          background: "#fff", border: "1px solid #e2d8c2", color: "#8a7c63" }}>
                        🎚️ Trocar voz
                      </button>
                    </div>
                  )}
                  {ordered && (
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#b06a1a", textAlign: "center", marginBottom: 10 }}>
                      🔢 Preste atenção na ORDEM dos itens.
                    </p>
                  )}
                  {memoLists.map((lst, li) => (
                    <div key={li} style={{ marginBottom: li < memoLists.length - 1 ? 16 : 0 }}>
                      {memoLists.length > 1 && (
                        <div style={{ fontSize: 13.5, fontWeight: 900, color: "#1d6e62", marginBottom: 8 }}>
                          {li === 0 ? "👩 A mãe pediu:" : "👵 A avó pediu:"}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(lst.length, 4)}, 1fr)`, gap: 10 }}>
                        {lst.map((p, idx) => (
                          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.06 }}
                            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px",
                              background: "#f4ecdc", border: "1px solid #e6dcc8", borderRadius: 14 }}>
                            {ordered && (
                              <span style={{ position: "absolute", top: -8, left: -8, width: 22, height: 22, borderRadius: "50%", zIndex: 2,
                                background: "#2f9e8f", color: "#fff", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                            )}
                            <ProductImg id={p.id} size={66} />
                            {mode === "leitura" && <span style={{ color: "#374151", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{p.name}</span>}
                            {mode === "auditivo" && <span style={{ fontSize: 20 }}>🔊</span>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "8px 16px 14px", flexShrink: 0 }}>
                <button onClick={() => { clearTimer(); cancelTTS(); setPhase("shopping"); }}
                  style={{ width: "100%", height: 50, borderRadius: 100, background: "linear-gradient(135deg,#2f9e8f,#1d7a6e)",
                    border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(29,122,110,0.4)" }}>
                  Já memorizei → ir às prateleiras
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SHOPPING ── */}
          {phase === "shopping" && (
            <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 12, gap: 10 }}>
              {/* instrução: qual lista comprar + ordem */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14,
                background: ordered ? "rgba(217,143,42,0.16)" : "rgba(47,158,143,0.12)",
                border: `1px solid ${ordered ? "rgba(217,143,42,0.45)" : "rgba(47,158,143,0.35)"}` }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{memoLists.length > 1 ? (targetIdx === 0 ? "👩" : "👵") : "🛒"}</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "#3a2f1c", lineHeight: 1.25 }}>{instruction}</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", gap: 12, minHeight: 0 }}>
              {/* prateleira — cabe tudo sem rolar */}
              <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden", display: "flex" }}>
                <WoodShelf products={shelfProducts} cartIds={cartIds} onToggle={toggleProduct} showLabels={mode === "leitura"} />
              </div>

              {/* painel do carrinho */}
              <div style={{ flexShrink: 0, width: "33%", maxWidth: 300, minWidth: 156,
                background: "rgba(247,242,232,0.97)", borderRadius: 20, border: "1px solid rgba(200,180,140,0.5)",
                boxShadow: "0 14px 36px rgba(40,30,15,0.28)", padding: 12,
                display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>

                <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: "rgba(47,158,143,0.14)",
                    border: "1px solid rgba(47,158,143,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧺</div>
                  <div style={{ lineHeight: 1.15, flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ color: "#26303a", fontWeight: 800, fontSize: 15 }}>No carrinho</span>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: "1px 9px", borderRadius: 100,
                        background: cartIds.length === itemCount ? "#d3f3ec" : "#eef1f4",
                        color: cartIds.length === itemCount ? "#1d7a6e" : "#7b8794",
                        border: `1px solid ${cartIds.length === itemCount ? "#9ad9cc" : "#e2e8f0"}` }}>{cartIds.length}/{itemCount}</span>
                    </div>
                    <div style={{ color: "#8a94a0", fontSize: 11 }}>Estes são os itens que você selecionou.</div>
                  </div>
                </div>

                {/* linhas de itens */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7, minHeight: 0 }}>
                  <AnimatePresence mode="popLayout">
                    {cartIds.length === 0 ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ color: "#a3acb8", fontSize: 12, fontStyle: "italic", textAlign: "center", padding: "18px 6px" }}>
                        Toque nos produtos da prateleira...
                      </motion.div>
                    ) : cartIds.map((id, idx) => {
                      const p = PRODUCT_MAP.get(id); if (!p) return null;
                      return (
                        <motion.div key={id} layout initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 460, damping: 30 }}
                          style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px", background: "#fff",
                            borderRadius: 12, border: "1px solid #ece3d1", boxShadow: "0 2px 6px rgba(120,90,50,0.08)" }}>
                          {ordered && <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", background: "#2f9e8f",
                            color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>}
                          <ProductImg id={id} size={34} />
                          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: "#37424d",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                          <button onClick={() => toggleProduct(id)} title={`Remover ${p.name}`}
                            style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, cursor: "pointer", border: "none",
                              background: "#fbe3cf", color: "#e07a3a", fontWeight: 900, fontSize: 14, lineHeight: 1,
                              display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* confirmar */}
                <button onClick={handleConfirm} disabled={cartIds.length === 0}
                  style={{ width: "100%", height: 50, borderRadius: 14, border: "none", flexShrink: 0,
                    background: cartIds.length > 0 ? "linear-gradient(135deg,#2f9e8f,#1d6e62)" : "#dfe3e8",
                    color: cartIds.length > 0 ? "#fff" : "#9aa3ad", fontWeight: 800, fontSize: 14,
                    cursor: cartIds.length > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: cartIds.length > 0 ? "0 5px 16px rgba(29,110,98,0.4)" : "none", transition: "all .2s" }}>
                  🛒 Confirmar ({cartIds.length}/{itemCount})
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === "result" && (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
              <div style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.97)",
                border: `2px solid ${isRoundCorrect ? "#86d9cb" : "#f3b0a8"}`, borderRadius: 20, padding: "18px 16px",
                boxShadow: "0 18px 44px rgba(40,30,15,0.28)" }}>
                <p style={{ color: isRoundCorrect ? "#1d7a6e" : "#c2463a", fontWeight: 800, fontSize: 16, textAlign: "center", marginBottom: 4 }}>
                  {isRoundCorrect ? "✅ Compra correta!" : "❌ Resultado da rodada"}
                </p>
                <p style={{ color: "#8a7c63", fontSize: 12, textAlign: "center", marginBottom: 14 }}>
                  {ordered ? `Ordem certa (${order === "reverse" ? "de trás para frente" : "da lista"}):`
                    : memoLists.length > 1 ? `Lista da ${labels[targetIdx]}:` : "Sua lista era:"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${listCols}, 1fr)`, gap: 8 }}>
                  {targetSeq.map((p, idx) => {
                    const hit = ordered ? (cartIds[idx] === p.id) : selected.has(p.id);
                    return (
                      <div key={p.id} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px",
                        background: hit ? "#eafaf6" : "#fdeeec", border: `1.5px solid ${hit ? "#a7e3d7" : "#f6c4bd"}`, borderRadius: 12 }}>
                        {ordered && <span style={{ position: "absolute", top: -7, left: -7, width: 20, height: 20, borderRadius: "50%",
                          background: "#2f9e8f", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>}
                        <ProductImg id={p.id} size={52} />
                        <span style={{ fontSize: 9.5, fontWeight: 700, textAlign: "center", color: hit ? "#1d7a6e" : "#c2463a" }}>{p.name}</span>
                        <span style={{ fontSize: 16 }}>{hit ? "✅" : "❌"}</span>
                      </div>
                    );
                  })}
                </div>
                {cartIds.some(id => !currentList.find(p => p.id === id)) && (
                  <p style={{ color: "#c2463a", fontSize: 11, textAlign: "center", marginTop: 10 }}>⚠️ Você pegou itens que não estavam na lista certa.</p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
