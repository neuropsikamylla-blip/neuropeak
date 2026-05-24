"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reorder } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface DesafioCidadeProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type CityPhase = "hub" | "mission" | "result";
type EnvId = "cinema" | "farmacia" | "banco" | "restaurante";

// ── Cinema ────────────────────────────────────────────────────────────────
interface CinemaItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  outOfStock?: boolean;
}

interface CinemaMission {
  scenario: string;
  rule: string;
  budget: number;
  items: CinemaItem[];
  imprevisto?: { text: string; itemId: string; change: "remove" | "price"; newPrice?: number };
}

const CINEMA_MISSIONS: Record<number, CinemaMission[]> = {
  1: [
    {
      scenario: "Você tem R$40 para curtir o cinema.",
      rule: "Compre o ingresso e pelo menos 1 acompanhamento.",
      budget: 40,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 22 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 10 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 16 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 8 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
      ],
    },
    {
      scenario: "Você tem R$35 — ingresso + algo para comer.",
      rule: "Compre o ingresso e fique dentro do orçamento.",
      budget: 35,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 20 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 5 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 11 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "chocolate", name: "Chocolate", emoji: "🍫", price: 8 },
      ],
    },
    {
      scenario: "Você tem R$45. Sessão da tarde.",
      rule: "Compre o ingresso e fique dentro do orçamento.",
      budget: 45,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 22 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "combo", name: "Combo pipoca+refri", emoji: "🍿", price: 26 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 6 },
      ],
    },
  ],
  2: [
    {
      scenario: "Você tem R$55. Compre ingresso + 2 acompanhamentos.",
      rule: "Exatamente: 1 ingresso + 2 itens dentro do orçamento.",
      budget: 55,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 9 },
        { id: "suco", name: "Suco", emoji: "🧃", price: 11 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 6 },
      ],
    },
    {
      scenario: "Você tem R$50. Ingresso + no máximo 2 itens.",
      rule: "Ingresso obrigatório. Total não pode ultrapassar R$50.",
      budget: 50,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "chocolate", name: "Chocolate", emoji: "🍫", price: 10 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 7 },
        { id: "suco", name: "Suco natural", emoji: "🧃", price: 12 },
      ],
    },
    {
      scenario: "Você tem R$60. Sessão VIP ou adulto — decida!",
      rule: "Fique dentro do orçamento. Ingresso obrigatório.",
      budget: 60,
      items: [
        { id: "ingresso-vip", name: "Ingresso VIP", emoji: "🎟️", price: 38 },
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "suco", name: "Suco natural", emoji: "🧃", price: 14 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
      ],
    },
  ],
  3: [
    {
      scenario: "Você tem R$45. Ingresso + 1 item — sem extrapolar!",
      rule: "Ingresso obrigatório. Você só pode levar 1 acompanhamento.",
      budget: 45,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 28 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 13 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 7 },
      ],
      imprevisto: {
        text: "A pipoca P esgotou! Reveja sua escolha.",
        itemId: "pipoca-p",
        change: "remove",
      },
    },
    {
      scenario: "Você tem R$50. Ingresso + 2 acompanhamentos.",
      rule: "Ingresso obrigatório. Máximo 2 acompanhamentos.",
      budget: 50,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 7 },
        { id: "suco", name: "Suco", emoji: "🧃", price: 12 },
      ],
      imprevisto: {
        text: "Promoção encerrou! A pipoca G voltou ao preço de R$22.",
        itemId: "pipoca-g",
        change: "price",
        newPrice: 22,
      },
    },
    {
      scenario: "Você tem R$55. VIP ou adulto — e 1 acompanhamento.",
      rule: "Obrigatório: 1 ingresso (qualquer) + exatamente 1 acompanhamento.",
      budget: 55,
      items: [
        { id: "ingresso-vip", name: "Ingresso VIP", emoji: "🎟️", price: 40 },
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "combo", name: "Combo pipoca+refri", emoji: "🎁", price: 26 },
      ],
      imprevisto: {
        text: "O ingresso VIP subiu para R$45! Precisa repensar?",
        itemId: "ingresso-vip",
        change: "price",
        newPrice: 45,
      },
    },
  ],
};

// ── Farmácia ──────────────────────────────────────────────────────────────
interface FarmaciaStep {
  id: string;
  emoji: string;
  label: string;
  correctIndex: number;
}

interface FarmaciaMission {
  scenario: string;
  steps: { emoji: string; label: string }[];
}

const FARMACIA_MISSIONS: Record<number, FarmaciaMission[]> = {
  1: [
    { scenario: "Você precisa comprar um remédio para dor de cabeça.", steps: [
      { emoji: "🚶", label: "Ir até a farmácia" },
      { emoji: "💬", label: "Pedir o remédio ao atendente" },
      { emoji: "💳", label: "Pagar na caixa" },
    ]},
    { scenario: "Precisa de um antialérgico para o filho.", steps: [
      { emoji: "🩺", label: "Obter receita médica" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "💊", label: "Comprar e guardar o remédio" },
    ]},
    { scenario: "Sua pressão está alta. Precisa verificar.", steps: [
      { emoji: "🏥", label: "Ir ao posto de saúde" },
      { emoji: "🩺", label: "Medir a pressão" },
      { emoji: "💊", label: "Pegar a medicação se necessário" },
    ]},
    { scenario: "Acabou o protetor solar.", steps: [
      { emoji: "🔍", label: "Procurar a farmácia mais próxima" },
      { emoji: "🧴", label: "Escolher o produto certo" },
      { emoji: "💰", label: "Pagar e guardar a nota" },
    ]},
  ],
  2: [
    { scenario: "Você precisa buscar um remédio com receita.", steps: [
      { emoji: "📋", label: "Pegar a receita médica" },
      { emoji: "🚶", label: "Ir até a farmácia" },
      { emoji: "📄", label: "Entregar a receita ao farmacêutico" },
      { emoji: "💊", label: "Pagar e guardar o remédio" },
    ]},
    { scenario: "Comprar vitaminas e protetor solar.", steps: [
      { emoji: "📝", label: "Anotar o que precisa comprar" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "🛒", label: "Pegar os produtos na prateleira" },
      { emoji: "💳", label: "Pagar no caixa" },
    ]},
    { scenario: "Renovar a medicação mensal.", steps: [
      { emoji: "📅", label: "Verificar se a receita está válida" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "📋", label: "Apresentar a receita" },
      { emoji: "✅", label: "Conferir os remédios antes de pagar" },
    ]},
    { scenario: "Comprar curativo e antisséptico.", steps: [
      { emoji: "🔍", label: "Identificar o que precisa" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "🛒", label: "Localizar os itens" },
      { emoji: "💰", label: "Pagar e guardar o troco" },
    ]},
  ],
  3: [
    { scenario: "Você tem receita para 3 remédios diferentes.", steps: [
      { emoji: "📋", label: "Verificar os 3 remédios na receita" },
      { emoji: "🚶", label: "Ir à farmácia com a receita" },
      { emoji: "📄", label: "Entregar a receita ao farmacêutico" },
      { emoji: "✅", label: "Confirmar cada remédio entregue" },
      { emoji: "💳", label: "Pagar e guardar o comprovante" },
    ]},
    { scenario: "Buscar remédio contínuo e checar validade.", steps: [
      { emoji: "📅", label: "Verificar o vencimento da receita" },
      { emoji: "🏥", label: "Renovar receita se necessário" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "📋", label: "Entregar a receita" },
      { emoji: "🔍", label: "Conferir validade e quantidade" },
    ]},
    { scenario: "Primeiro atendimento em farmácia desconhecida.", steps: [
      { emoji: "📱", label: "Localizar a farmácia mais próxima" },
      { emoji: "📋", label: "Separar a receita e documentos" },
      { emoji: "🚶", label: "Ir até a farmácia" },
      { emoji: "💬", label: "Explicar a necessidade ao atendente" },
      { emoji: "💊", label: "Conferir e pagar os remédios" },
    ]},
    { scenario: "Solicitar genérico mais barato.", steps: [
      { emoji: "📋", label: "Ler o nome do remédio na receita" },
      { emoji: "🚶", label: "Ir à farmácia" },
      { emoji: "💬", label: "Pedir o genérico equivalente" },
      { emoji: "🔍", label: "Verificar se é o mesmo princípio ativo" },
      { emoji: "💳", label: "Confirmar e pagar" },
    ]},
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
function missionLevel(difficulty: number): number {
  if (difficulty <= 3) return 1;
  if (difficulty <= 6) return 2;
  return 3;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickAvoid<T>(arr: T[], used: Set<number>): { item: T; idx: number } {
  const available = arr.map((_, i) => i).filter((i) => !used.has(i));
  if (available.length === 0) {
    const recent = [...used].slice(-2);
    used.clear();
    recent.forEach((i) => used.add(i));
    return pickAvoid(arr, used);
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  used.add(idx);
  return { item: arr[idx], idx };
}

function cartTotal(cart: Set<string>, items: CinemaItem[]) {
  return [...cart].reduce((sum, id) => {
    const item = items.find((i) => i.id === id);
    return sum + (item && !item.outOfStock ? item.price : 0);
  }, 0);
}

function hasTicket(cart: Set<string>) {
  return cart.has("ingresso") || cart.has("ingresso-vip");
}

// ── Ambientes ──────────────────────────────────────────────────────────────
const ENVIRONMENTS: { id: EnvId; name: string; emoji: string; description: string; available: boolean }[] = [
  { id: "cinema", name: "Cinema", emoji: "🎬", description: "Planeje sua compra dentro do orçamento", available: true },
  { id: "farmacia", name: "Farmácia", emoji: "💊", description: "Organize as etapas para comprar remédios", available: true },
  { id: "banco", name: "Banco", emoji: "🏦", description: "Em breve", available: false },
  { id: "restaurante", name: "Restaurante", emoji: "🍽️", description: "Em breve", available: false },
];

// ── Farmácia: componente de missão ────────────────────────────────────────
function FarmaciaMissionView({
  mission,
  theme,
  onFinish,
}: {
  mission: FarmaciaMission;
  theme: Theme;
  onFinish: (correct: boolean) => void;
}) {
  const [items, setItems] = useState<FarmaciaStep[]>(() =>
    shuffle(
      mission.steps.map((s, i) => ({
        id: `fs-${i}-${Math.random().toString(36).slice(2)}`,
        emoji: s.emoji,
        label: s.label,
        correctIndex: i,
      }))
    )
  );
  const [submitted, setSubmitted] = useState(false);

  const textClass = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500";
  const itemBase =
    theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700 cursor-grab active:cursor-grabbing"
      : theme === "COLORFUL"
      ? "border-violet-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-400"
      : "border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-indigo-300 shadow-sm";
  const badgeBase =
    theme === "GAMIFIED"
      ? "bg-gray-600 text-gray-300"
      : theme === "COLORFUL"
      ? "bg-violet-100 text-violet-700"
      : "bg-indigo-100 text-indigo-700";
  const btnClass =
    theme === "GAMIFIED"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
      : theme === "COLORFUL"
      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 text-white";

  function submit() {
    setSubmitted(true);
    const correct = items.every((item, idx) => item.correctIndex === idx);
    setTimeout(() => onFinish(correct), 1600);
  }

  return (
    <div className="space-y-3">
      <p className={`text-xs ${subClass}`}>Arraste as etapas para a ordem correta:</p>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item, idx) => {
          const isCorrect = submitted && item.correctIndex === idx;
          const isWrong = submitted && item.correctIndex !== idx;
          return (
            <Reorder.Item key={item.id} value={item} disabled={submitted}>
              <motion.div
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-colors ${
                  isCorrect ? "border-green-500 bg-green-50"
                  : isWrong ? "border-red-400 bg-red-50"
                  : itemBase
                }`}
                whileDrag={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 50 }}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    isCorrect ? "bg-green-500 text-white"
                    : isWrong ? "bg-red-400 text-white"
                    : badgeBase
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className={`text-sm flex-1 leading-tight ${textClass}`}>{item.label}</span>
                {submitted && <span className="text-base ml-auto flex-shrink-0">{isCorrect ? "✅" : "❌"}</span>}
              </motion.div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      {!submitted && (
        <button onClick={submit} className={`w-full h-11 rounded-xl font-bold transition-colors ${btnClass}`}>
          Confirmar ordem
        </button>
      )}
    </div>
  );
}

// ── Cinema: componente de missão ──────────────────────────────────────────
function CinemaMissionView({
  mission: initialMission,
  theme,
  onFinish,
}: {
  mission: CinemaMission;
  theme: Theme;
  onFinish: (correct: boolean) => void;
}) {
  const [items, setItems] = useState<CinemaItem[]>(initialMission.items);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"selecting" | "imprevisto" | "done">("selecting");
  const submittedRef = useRef(false);

  const total = cartTotal(cart, items);
  const overBudget = total > initialMission.budget;
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500";
  const accentGreen = theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600";
  const accentRed = "text-red-500";
  const btnClass =
    theme === "GAMIFIED"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
      : theme === "COLORFUL"
      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
      : "bg-sky-600 hover:bg-sky-700 text-white";
  const itemBase =
    theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700"
      : "border-slate-200 bg-white shadow-sm";
  const selectedItem = theme === "GAMIFIED" ? "border-cyan-400 bg-cyan-900/30" : "border-sky-400 bg-sky-50";
  const listBg =
    theme === "GAMIFIED"
      ? "bg-gray-700/60"
      : theme === "COLORFUL"
      ? "bg-violet-50 border border-violet-100"
      : "bg-sky-50/60 border border-sky-100";

  function toggleItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.outOfStock) return;
    setCart((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function evaluate(currentCart: Set<string>, currentItems: CinemaItem[]): boolean {
    const t = cartTotal(currentCart, currentItems);
    return hasTicket(currentCart) && t <= initialMission.budget && currentCart.size >= 2;
  }

  function handleConfirm() {
    if (submittedRef.current) return;

    const imp = initialMission.imprevisto;
    if (imp && phase === "selecting") {
      if (imp.change === "remove") {
        setItems((prev) => prev.map((i) => i.id === imp.itemId ? { ...i, outOfStock: true } : i));
        setCart((prev) => { const n = new Set(prev); n.delete(imp.itemId); return n; });
      } else if (imp.change === "price" && imp.newPrice !== undefined) {
        setItems((prev) => prev.map((i) => i.id === imp.itemId ? { ...i, price: imp.newPrice! } : i));
      }
      setPhase("imprevisto");
      return;
    }

    submittedRef.current = true;
    const correct = evaluate(cart, items);
    setPhase("done");
    setTimeout(() => onFinish(correct), 1400);
  }

  return (
    <div className="space-y-3">
      {phase === "imprevisto" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-amber-50 border border-amber-300"
        >
          <p className="text-sm font-bold text-amber-700">⚠️ Imprevisto!</p>
          <p className="text-xs text-amber-600 mt-0.5">{initialMission.imprevisto?.text}</p>
        </motion.div>
      )}

      <div className={`rounded-xl p-3 ${listBg}`}>
        <p className={`text-xs font-medium ${subClass}`}>{initialMission.scenario}</p>
        <p className={`text-xs mt-0.5 font-semibold ${subClass}`}>{initialMission.rule}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-sm font-bold ${accentGreen}`}>Orçamento: R${initialMission.budget}</span>
          <span className={`text-sm font-bold ${overBudget ? accentRed : accentGreen}`}>
            · Total: R${total}
          </span>
          {overBudget && <span className="text-xs text-red-500">⚠ excede!</span>}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const inCart = cart.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => !item.outOfStock && toggleItem(item.id)}
              disabled={!!item.outOfStock || phase === "done"}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                item.outOfStock ? "opacity-40 border-slate-200 bg-slate-50"
                : inCart ? selectedItem
                : itemBase
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
                  {item.name}
                </p>
                {item.outOfStock
                  ? <p className="text-xs text-red-400">Esgotado</p>
                  : <p className={`text-xs ${subClass}`}>R${item.price},00</p>
                }
              </div>
              {inCart && !item.outOfStock && <span className="text-green-500">✓</span>}
            </button>
          );
        })}
      </div>

      {phase !== "done" && (
        <button
          onClick={handleConfirm}
          disabled={cart.size < 1}
          className={`w-full h-11 rounded-xl font-bold ${btnClass} disabled:opacity-40`}
        >
          {phase === "imprevisto" ? "Confirmar novo carrinho" : "Confirmar compra"}
        </button>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
const MAX_MISSIONS = 8;

export function DesafioCidade({ difficulty, theme, onComplete }: DesafioCidadeProps) {
  const reportProgress = useExerciseProgress();

  const [cityPhase, setCityPhase] = useState<CityPhase>("hub");
  const [currentEnv, setCurrentEnv] = useState<EnvId | null>(null);
  const [missionNum, setMissionNum] = useState(0);
  const [missionResults, setMissionResults] = useState<{ env: EnvId; correct: boolean }[]>([]);
  const [lastCorrect, setLastCorrect] = useState(false);

  // missão atual (dados)
  const [cinemaMission, setCinemaMission] = useState<CinemaMission | null>(null);
  const [farmaciaMission, setFarmaciaMission] = useState<FarmaciaMission | null>(null);

  const usedCinema = useRef(new Set<number>());
  const usedFarmacia = useRef(new Set<number>());
  const startTime = useRef(Date.now());
  const level = missionLevel(difficulty);

  // ── Paleta ────────────────────────────────────────────────────────────
  const pal = {
    bg: theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-violet-50 via-pink-50 to-yellow-50"
      : "bg-gradient-to-br from-slate-50 via-white to-sky-50/30",
    card: theme === "GAMIFIED"
      ? "bg-gray-800 border border-cyan-500/20"
      : theme === "COLORFUL"
      ? "bg-white border-2 border-violet-200 shadow-xl"
      : "bg-white border border-slate-200/70 shadow-md",
    envCard: theme === "GAMIFIED"
      ? "bg-gray-800 border border-gray-600 hover:border-cyan-400 cursor-pointer"
      : theme === "COLORFUL"
      ? "bg-white border-2 border-violet-100 hover:border-violet-400 shadow-sm cursor-pointer"
      : "bg-white border border-slate-200/70 hover:border-sky-300 shadow-sm hover:shadow-md cursor-pointer",
    envDisabled: theme === "GAMIFIED"
      ? "bg-gray-900 border border-gray-700 opacity-40"
      : "bg-slate-50 border border-slate-200/50 opacity-50",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : theme === "COLORFUL" ? "text-violet-400" : "text-slate-500",
    dotActive: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-violet-500" : "bg-sky-500",
    dotInactive: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200",
  };

  // ── Iniciar missão ─────────────────────────────────────────────────────
  const startMission = useCallback((env: EnvId) => {
    const lvl = level;
    if (env === "cinema") {
      const missions = CINEMA_MISSIONS[lvl] ?? CINEMA_MISSIONS[1];
      const { item } = pickAvoid(missions, usedCinema.current);
      setCinemaMission(item);
      setFarmaciaMission(null);
    } else if (env === "farmacia") {
      const missions = FARMACIA_MISSIONS[lvl] ?? FARMACIA_MISSIONS[1];
      const { item } = pickAvoid(missions, usedFarmacia.current);
      setFarmaciaMission(item);
      setCinemaMission(null);
    }
    setCurrentEnv(env);
    setCityPhase("mission");
  }, [level]);

  // ── Finalizar missão — sempre volta ao hub ────────────────────────────
  function finishMission(correct: boolean) {
    setLastCorrect(correct);
    const newResults = [...missionResults, { env: currentEnv!, correct }];
    setMissionResults(newResults);

    const next = missionNum + 1;
    reportProgress(Math.round((next / MAX_MISSIONS) * 100));

    setCityPhase("result");

    setTimeout(() => {
      if (next >= MAX_MISSIONS) {
        const correctCount = newResults.filter((r) => r.correct).length;
        const accuracy = correctCount / MAX_MISSIONS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        onComplete({
          exerciseId: "desafio-cidade",
          domain: "executive",
          score: calculateExerciseScore("desafio-cidade", accuracy, undefined, difficulty),
          accuracy,
          difficulty,
          duration,
          metadata: { missions: MAX_MISSIONS, correct: correctCount },
        });
      } else {
        setMissionNum(next);
        setCurrentEnv(null);
        setCityPhase("hub");
      }
    }, 2000);
  }

  const env = currentEnv ? ENVIRONMENTS.find((e) => e.id === currentEnv) : null;

  // ── HUB ───────────────────────────────────────────────────────────────
  if (cityPhase === "hub") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
        <div className={`w-full max-w-md rounded-2xl p-5 ${pal.card}`}>
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🏙️</div>
            <h2 className={`font-bold text-xl ${pal.title}`}>Desafio da Cidade</h2>
            <p className={`text-sm mt-1 ${pal.sub}`}>Escolha um ambiente para a próxima missão</p>
          </div>

          <div className="flex gap-0.5 mb-5">
            {Array.from({ length: MAX_MISSIONS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < missionResults.length
                    ? missionResults[i].correct ? "bg-green-500" : "bg-red-400"
                    : i === missionNum ? `${pal.dotActive} animate-pulse` : pal.dotInactive
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ENVIRONMENTS.map((e) => (
              <button
                key={e.id}
                onClick={() => e.available && startMission(e.id)}
                disabled={!e.available}
                className={`p-4 rounded-2xl text-left transition-all active:scale-95 ${
                  e.available ? pal.envCard : pal.envDisabled
                }`}
              >
                <div className="text-3xl mb-2">{e.emoji}</div>
                <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                  {e.name}
                </p>
                <p className={`text-xs mt-0.5 ${pal.sub}`}>{e.description}</p>
                {!e.available && (
                  <span className="text-xs mt-1.5 inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                    Em breve
                  </span>
                )}
              </button>
            ))}
          </div>

          <p className={`text-xs text-center mt-4 ${pal.sub}`}>
            Missão {missionNum + 1} de {MAX_MISSIONS}
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTADO ─────────────────────────────────────────────────────────
  if (cityPhase === "result") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${pal.bg}`}>
        <motion.div
          className={`w-full max-w-md rounded-2xl p-6 text-center ${pal.card}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-5xl mb-3">{lastCorrect ? "🎉" : "😅"}</div>
          <h2 className={`font-bold text-lg ${pal.title}`}>
            {lastCorrect ? "Missão concluída!" : "Quase lá!"}
          </h2>
          <p className={`text-sm mt-1 ${pal.sub}`}>
            {env?.emoji} {env?.name} · {lastCorrect ? "Acertou!" : "Continue tentando"}
          </p>
          <p className={`text-xs mt-3 ${pal.sub}`}>Voltando à cidade…</p>
        </motion.div>
      </div>
    );
  }

  // ── MISSÃO ────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${pal.card}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{env?.emoji}</span>
            <h2 className={`font-bold text-base ${pal.title}`}>{env?.name}</h2>
          </div>
          <span className={`text-xs ${pal.sub}`}>{missionNum + 1}/{MAX_MISSIONS}</span>
        </div>

        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_MISSIONS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < missionResults.length
                  ? missionResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === missionNum ? `${pal.dotActive} animate-pulse` : pal.dotInactive
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentEnv === "cinema" && cinemaMission && (
            <motion.div key={`cinema-${cinemaMission.scenario}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CinemaMissionView
                mission={cinemaMission}
                theme={theme}
                onFinish={finishMission}
              />
            </motion.div>
          )}

          {currentEnv === "farmacia" && farmaciaMission && (
            <motion.div key={`farmacia-${farmaciaMission.scenario}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className={`text-sm font-medium mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : "text-slate-700"}`}>
                {farmaciaMission.scenario}
              </p>
              <FarmaciaMissionView
                mission={farmaciaMission}
                theme={theme}
                onFinish={finishMission}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
