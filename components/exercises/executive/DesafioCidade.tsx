"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface DesafioCidadeProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Tipos internos ────────────────────────────────────────────────────────
type CityPhase = "hub" | "mission" | "imprevisto" | "result";
type EnvId = "mercado" | "cinema" | "banco" | "restaurante";

interface MissionResult {
  env: EnvId;
  correct: boolean;
}

// ── Produto (mercado) ─────────────────────────────────────────────────────
interface CityProduct {
  id: string;
  name: string;
  emoji: string;
}

const CITY_PRODUCTS: CityProduct[] = [
  { id: "arroz", name: "Arroz", emoji: "🌾" },
  { id: "feijao", name: "Feijão", emoji: "🫘" },
  { id: "macarrao", name: "Macarrão", emoji: "🍝" },
  { id: "oleo", name: "Óleo", emoji: "🫙" },
  { id: "sal", name: "Sal", emoji: "🧂" },
  { id: "acucar", name: "Açúcar", emoji: "🍬" },
  { id: "cafe", name: "Café", emoji: "☕" },
  { id: "leite", name: "Leite", emoji: "🥛" },
  { id: "manteiga", name: "Manteiga", emoji: "🧈" },
  { id: "pao", name: "Pão", emoji: "🍞" },
  { id: "ovos", name: "Ovos", emoji: "🥚" },
  { id: "queijo", name: "Queijo", emoji: "🧀" },
  { id: "sabao", name: "Sabão em pó", emoji: "🧴" },
  { id: "papel", name: "Papel higiênico", emoji: "🧻" },
  { id: "detergente", name: "Detergente", emoji: "🧽" },
  { id: "agua", name: "Água mineral", emoji: "💧" },
  { id: "suco", name: "Suco", emoji: "🧃" },
  { id: "refrigerante", name: "Refrigerante", emoji: "🥤" },
  { id: "banana", name: "Banana", emoji: "🍌" },
  { id: "tomate", name: "Tomate", emoji: "🍅" },
  { id: "alface", name: "Alface", emoji: "🥬" },
  { id: "cenoura", name: "Cenoura", emoji: "🥕" },
  { id: "frango", name: "Frango", emoji: "🍗" },
  { id: "maca", name: "Maçã", emoji: "🍎" },
  { id: "batata", name: "Batata", emoji: "🥔" },
  { id: "iogurte", name: "Iogurte", emoji: "🍼" },
  { id: "carne", name: "Carne", emoji: "🥩" },
  { id: "sabonete", name: "Sabonete", emoji: "🫧" },
];

const CITY_PRODUCT_MAP = new Map(CITY_PRODUCTS.map((p) => [p.id, p]));

// Listas de compras por dificuldade (nível 1=fácil, 2=médio, 3=difícil)
const MARKET_LISTS: Record<number, string[][]> = {
  1: [
    ["arroz", "feijao", "sal"],
    ["pao", "leite", "manteiga"],
    ["ovos", "queijo", "cafe"],
    ["banana", "maca", "suco"],
    ["sabao", "papel", "detergente"],
    ["frango", "tomate", "alface"],
  ],
  2: [
    ["arroz", "feijao", "oleo", "sal"],
    ["pao", "leite", "manteiga", "ovos"],
    ["cafe", "acucar", "macarrao", "queijo"],
    ["banana", "tomate", "alface", "cenoura"],
    ["sabao", "papel", "detergente", "sabonete"],
    ["frango", "batata", "cenoura", "oleo"],
  ],
  3: [
    ["arroz", "feijao", "oleo", "sal", "macarrao"],
    ["pao", "leite", "manteiga", "ovos", "queijo"],
    ["cafe", "acucar", "frango", "tomate", "alface"],
    ["banana", "maca", "suco", "iogurte", "cenoura"],
    ["sabao", "papel", "detergente", "sabonete", "agua"],
    ["carne", "batata", "cenoura", "oleo", "sal"],
  ],
};

// ── Cinema ────────────────────────────────────────────────────────────────
interface CinemaItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

interface CinemaMission {
  scenario: string;
  budget: number;
  items: CinemaItem[];
  correctIds: string[]; // uma combinação válida dentro do orçamento
  imprevisto?: { text: string; changedItem: string; newPrice: number };
}

const CINEMA_MISSIONS: Record<number, CinemaMission[]> = {
  1: [
    {
      scenario: "Você tem R$40 para a sessão de hoje.",
      budget: 40,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 20 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 10 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 16 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 8 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
      ],
      correctIds: ["ingresso", "pipoca-p", "refrigerante"], // R$38
    },
    {
      scenario: "Você tem R$35 e quer ir ao cinema.",
      budget: 35,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 22 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 5 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "chocolate", name: "Chocolate", emoji: "🍫", price: 8 },
      ],
      correctIds: ["ingresso", "bala", "agua"], // R$32
    },
  ],
  2: [
    {
      scenario: "Você tem R$55. Compre ingresso + pelo menos 2 itens.",
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
      correctIds: ["ingresso", "pipoca-p", "refrigerante"], // R$46 ≤ 55
    },
    {
      scenario: "Você tem R$50. Compre ingresso + exatamente 2 acompanhamentos.",
      budget: 50,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "combo", name: "Combo pipoca+refri", emoji: "🍿", price: 28 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 9 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "chocolate", name: "Chocolate", emoji: "🍫", price: 9 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 6 },
      ],
      correctIds: ["ingresso", "agua", "bala"], // R$36 ≤ 50
    },
  ],
  3: [
    {
      scenario: "Você tem R$60. Compre ingresso + 2 acompanhamentos.",
      budget: 60,
      items: [
        { id: "ingresso-vip", name: "Ingresso VIP", emoji: "🎟️", price: 38 },
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "suco", name: "Suco natural", emoji: "🧃", price: 14 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 6 },
      ],
      correctIds: ["ingresso", "pipoca-g", "refrigerante"], // R$53
      imprevisto: {
        text: "A pipoca G acabou! Você precisa trocar por outro item.",
        changedItem: "pipoca-g",
        newPrice: 999, // fora de estoque — preço impossível sinaliza indisponibilidade
      },
    },
    {
      scenario: "Você tem R$45. Compre ingresso + no máximo 2 itens.",
      budget: 45,
      items: [
        { id: "ingresso", name: "Ingresso adulto", emoji: "🎟️", price: 25 },
        { id: "pipoca-p", name: "Pipoca P", emoji: "🍿", price: 12 },
        { id: "pipoca-g", name: "Pipoca G", emoji: "🍿", price: 18 },
        { id: "refrigerante", name: "Refrigerante", emoji: "🥤", price: 10 },
        { id: "agua", name: "Água", emoji: "💧", price: 5 },
        { id: "bala", name: "Bala", emoji: "🍬", price: 7 },
        { id: "chocolate", name: "Chocolate", emoji: "🍫", price: 10 },
      ],
      correctIds: ["ingresso", "agua", "bala"], // R$37
      imprevisto: {
        text: "Promoção! Pipoca P subiu para R$15. Reveja seu carrinho!",
        changedItem: "pipoca-p",
        newPrice: 15,
      },
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
function missionLevel(difficulty: number): number {
  if (difficulty <= 3) return 1;
  if (difficulty <= 6) return 2;
  return 3;
}

function memorizeSecs(itemCount: number): number {
  return Math.max(5, 12 - itemCount);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMarketTrial(level: number, usedKeys: Set<string>) {
  const lists = MARKET_LISTS[level] ?? MARKET_LISTS[1];
  const available = lists.filter((l) => !usedKeys.has(l.join(",")));
  const pool = available.length > 0 ? available : lists;
  const chosen = pickRandom(pool);
  usedKeys.add(chosen.join(","));
  const products = chosen.map((id) => CITY_PRODUCT_MAP.get(id)!).filter(Boolean);
  const listIds = new Set(chosen);
  const fillers = CITY_PRODUCTS.filter((p) => !listIds.has(p.id));
  const shuffled = [...fillers].sort(() => Math.random() - 0.5);
  const shelfSize = Math.min(CITY_PRODUCTS.length, chosen.length * 3 + 2);
  const shelf = [...products, ...shuffled.slice(0, shelfSize - chosen.length)].sort(() => Math.random() - 0.5);
  return { list: products, shelf };
}

function buildCinemaTrial(level: number, usedKeys: Set<string>) {
  const missions = CINEMA_MISSIONS[level] ?? CINEMA_MISSIONS[1];
  const available = missions.filter((m) => !usedKeys.has(m.scenario));
  const pool = available.length > 0 ? available : missions;
  const mission = pickRandom(pool);
  usedKeys.add(mission.scenario);
  return mission;
}

// ── Ambientes ─────────────────────────────────────────────────────────────
const ENVIRONMENTS: { id: EnvId; name: string; emoji: string; description: string; available: boolean }[] = [
  { id: "mercado", name: "Mercado", emoji: "🏪", description: "Memorize a lista e encontre os produtos", available: true },
  { id: "cinema", name: "Cinema", emoji: "🎬", description: "Planeje sua compra dentro do orçamento", available: true },
  { id: "banco", name: "Banco", emoji: "🏦", description: "Em breve", available: false },
  { id: "restaurante", name: "Restaurante", emoji: "🍽️", description: "Em breve", available: false },
];

// ── Componente principal ───────────────────────────────────────────────────
const MAX_MISSIONS = 8;

export function DesafioCidade({ difficulty, theme, onComplete }: DesafioCidadeProps) {
  const reportProgress = useExerciseProgress();

  const [cityPhase, setCityPhase] = useState<CityPhase>("hub");
  const [currentEnv, setCurrentEnv] = useState<EnvId>("mercado");
  const [missionNum, setMissionNum] = useState(0);
  const [missionResults, setMissionResults] = useState<MissionResult[]>([]);

  // Mercado state
  const [marketPhase, setMarketPhase] = useState<"memorizing" | "shopping" | "done">("memorizing");
  const [marketList, setMarketList] = useState<CityProduct[]>([]);
  const [marketShelf, setMarketShelf] = useState<CityProduct[]>([]);
  const [marketSelected, setMarketSelected] = useState<Set<string>>(new Set());
  const [marketCountdown, setMarketCountdown] = useState(0);
  const usedMarket = useRef(new Set<string>());

  // Cinema state
  const [cinemaMission, setCinemaMission] = useState<CinemaMission | null>(null);
  const [cinemaCart, setCinemaCart] = useState<Set<string>>(new Set());
  const [cinemaPhase, setCinemaPhase] = useState<"selecting" | "imprevisto" | "done">("selecting");
  const [cinemaItems, setCinemaItems] = useState<CinemaItem[]>([]);
  const usedCinema = useRef(new Set<string>());

  const [lastCorrect, setLastCorrect] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const level = missionLevel(difficulty);

  // ── Paleta de temas ────────────────────────────────────────────────────
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
      ? "bg-gray-800 border border-gray-600 hover:border-cyan-400"
      : theme === "COLORFUL"
      ? "bg-white border-2 border-violet-100 hover:border-violet-400 shadow-sm"
      : "bg-white border border-slate-200/70 hover:border-sky-300 shadow-sm hover:shadow-md",
    envDisabled: theme === "GAMIFIED"
      ? "bg-gray-900 border border-gray-700 opacity-40"
      : "bg-slate-50 border border-slate-200/50 opacity-50",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : theme === "COLORFUL" ? "text-violet-400" : "text-slate-500",
    accent: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-600" : "text-sky-600",
    listBg: theme === "GAMIFIED"
      ? "bg-gray-700"
      : theme === "COLORFUL"
      ? "bg-violet-50 border border-violet-100"
      : "bg-sky-50/60 border border-sky-100",
    btn: theme === "GAMIFIED"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
      : theme === "COLORFUL"
      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
      : "bg-sky-600 hover:bg-sky-700 text-white",
    selectedItem: theme === "GAMIFIED"
      ? "border-cyan-400 bg-cyan-900/30"
      : "border-sky-400 bg-sky-50",
    itemCard: theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700"
      : theme === "COLORFUL"
      ? "border-violet-200 bg-white"
      : "border-slate-200 bg-white shadow-sm",
    dotActive: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-violet-500" : "bg-sky-500",
    dotInactive: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200",
  };

  // ── Iniciar missão ────────────────────────────────────────────────────
  const startMission = useCallback((env: EnvId) => {
    setCurrentEnv(env);
    setCityPhase("mission");

    if (env === "mercado") {
      const { list, shelf } = buildMarketTrial(level, usedMarket.current);
      setMarketList(list);
      setMarketShelf(shelf);
      setMarketSelected(new Set());
      setMarketPhase("memorizing");
    } else if (env === "cinema") {
      const mission = buildCinemaTrial(level, usedCinema.current);
      setCinemaMission(mission);
      setCinemaItems(mission.items);
      setCinemaCart(new Set());
      setCinemaPhase("selecting");
    }
  }, [level]);

  // Selecionar ambiente automaticamente para fluir sem sempre voltar ao hub
  const autoPickEnv = useCallback((): EnvId => {
    const available: EnvId[] = ["mercado", "cinema"];
    const countMercado = missionResults.filter((r) => r.env === "mercado").length;
    const countCinema = missionResults.filter((r) => r.env === "cinema").length;
    // Alternar entre ambientes
    return countMercado <= countCinema ? "mercado" : "cinema";
  }, [missionResults]);

  // ── Timer mercado ─────────────────────────────────────────────────────
  useEffect(() => {
    if (cityPhase !== "mission" || currentEnv !== "mercado" || marketPhase !== "memorizing") return;
    const total = memorizeSecs(marketList.length);
    setMarketCountdown(total);

    timerRef.current = setInterval(() => {
      setMarketCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setMarketPhase("shopping");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityPhase, currentEnv, marketPhase]);

  // ── Finalizar missão ─────────────────────────────────────────────────
  function finishMission(correct: boolean) {
    setLastCorrect(correct);
    const newResults = [...missionResults, { env: currentEnv, correct }];
    setMissionResults(newResults);
    setCityPhase("result");

    const next = missionNum + 1;
    reportProgress(Math.round((next / MAX_MISSIONS) * 100));

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
        const nextEnv = autoPickEnv();
        startMission(nextEnv);
      }
    }, 2000);
  }

  // ── Submit mercado ────────────────────────────────────────────────────
  function submitMarket() {
    const correctIds = new Set(marketList.map((p) => p.id));
    const correct =
      marketSelected.size === correctIds.size &&
      [...marketSelected].every((id) => correctIds.has(id));
    setMarketPhase("done");
    finishMission(correct);
  }

  // ── Cinema: verificar orçamento ────────────────────────────────────────
  function cinemaTotalCost(cart: Set<string>, items: CinemaItem[]) {
    return [...cart].reduce((sum, id) => {
      const item = items.find((i) => i.id === id);
      return sum + (item?.price ?? 0);
    }, 0);
  }

  function submitCinema() {
    if (!cinemaMission) return;
    const items = cinemaItems;
    const total = cinemaTotalCost(cinemaCart, items);
    const withinBudget = total <= cinemaMission.budget;
    const hasTicket = cinemaCart.has("ingresso") || cinemaCart.has("ingresso-vip");

    // Verificar se tem imprevisto e ainda está no resultado inválido
    if (cinemaMission.imprevisto && cinemaPhase === "selecting") {
      const badItem = cinemaMission.imprevisto.changedItem;
      const inCart = cinemaCart.has(badItem);
      if (inCart || Math.random() < 0.6) {
        // Disparar imprevisto
        if (cinemaMission.imprevisto.newPrice === 999) {
          // Item esgotado — remover dos itens disponíveis
          setCinemaItems((prev) => prev.filter((i) => i.id !== badItem));
          setCinemaCart((prev) => { const n = new Set(prev); n.delete(badItem); return n; });
        } else {
          setCinemaItems((prev) =>
            prev.map((i) => i.id === badItem ? { ...i, price: cinemaMission.imprevisto!.newPrice } : i)
          );
        }
        setCinemaPhase("imprevisto");
        return;
      }
    }

    // Avaliação final
    const correct = withinBudget && hasTicket && cinemaCart.size >= 2;
    setCinemaPhase("done");
    finishMission(correct);
  }

  function submitCinemaAfterImprevisto() {
    if (!cinemaMission) return;
    const total = cinemaTotalCost(cinemaCart, cinemaItems);
    const withinBudget = total <= cinemaMission.budget;
    const hasTicket = cinemaCart.has("ingresso") || cinemaCart.has("ingresso-vip");
    const correct = withinBudget && hasTicket && cinemaCart.size >= 2;
    setCinemaPhase("done");
    finishMission(correct);
  }

  // ── HUB ───────────────────────────────────────────────────────────────
  if (cityPhase === "hub") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
        <div className={`w-full max-w-md rounded-2xl p-5 ${pal.card}`}>
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🏙️</div>
            <h2 className={`font-bold text-xl ${pal.title}`}>
              {theme === "GAMIFIED" ? "MISSÃO: CIDADE" : "Desafio da Cidade"}
            </h2>
            <p className={`text-sm mt-1 ${pal.sub}`}>
              {theme === "COLORFUL" ? "Escolha onde quer ir! 🗺️" : "Escolha um ambiente para começar"}
            </p>
          </div>

          {/* Progresso */}
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

          <div className="grid grid-cols-2 gap-3">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env.id}
                onClick={() => env.available && startMission(env.id)}
                disabled={!env.available}
                className={`p-4 rounded-2xl text-left transition-all active:scale-95 ${
                  env.available ? `${pal.envCard} cursor-pointer` : pal.envDisabled
                }`}
              >
                <div className="text-3xl mb-2">{env.emoji}</div>
                <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                  {env.name}
                </p>
                <p className={`text-xs mt-0.5 ${pal.sub}`}>{env.description}</p>
                {!env.available && (
                  <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
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
    const env = ENVIRONMENTS.find((e) => e.id === currentEnv);
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
            {env?.emoji} {env?.name} · {lastCorrect ? "Acertou!" : "Tente na próxima"}
          </p>
          <p className={`text-xs mt-3 ${pal.sub}`}>Preparando próxima missão…</p>
        </motion.div>
      </div>
    );
  }

  // ── MISSÃO ────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${pal.card}`}>

        {/* Header da missão */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{ENVIRONMENTS.find((e) => e.id === currentEnv)?.emoji}</span>
            <h2 className={`font-bold text-base ${pal.title}`}>
              {ENVIRONMENTS.find((e) => e.id === currentEnv)?.name}
            </h2>
          </div>
          <span className={`text-xs ${pal.sub}`}>{missionNum + 1}/{MAX_MISSIONS}</span>
        </div>

        {/* Progress dots */}
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

          {/* ── MERCADO ── */}
          {currentEnv === "mercado" && (
            <motion.div key={`mercado-${marketPhase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {marketPhase === "memorizing" && (
                <>
                  <div className="text-center mb-3">
                    <p className={`font-bold text-sm ${pal.title}`}>Memorize a lista de compras!</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className={`h-1.5 w-28 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                          style={{ width: `${(marketCountdown / memorizeSecs(marketList.length)) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs tabular-nums ${pal.sub}`}>{marketCountdown}s</span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 space-y-2.5 ${pal.listBg}`}>
                    {marketList.map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
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
                </>
              )}

              {marketPhase === "shopping" && (
                <>
                  <p className={`font-bold text-sm mb-1 ${pal.title}`}>Encontre os itens da lista!</p>
                  <p className={`text-xs mb-3 ${pal.sub}`}>
                    {marketSelected.size} de {marketList.length} selecionado{marketSelected.size !== 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {marketShelf.map((p) => {
                      const active = marketSelected.has(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setMarketSelected((prev) => {
                              const n = new Set(prev);
                              n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                              return n;
                            });
                          }}
                          className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                            active ? pal.selectedItem : pal.itemCard
                          }`}
                        >
                          <span className="text-2xl">{p.emoji}</span>
                          <span className={`text-xs text-center leading-tight ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                            {p.name}
                          </span>
                          {active && <span className="text-xs text-green-600 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={submitMarket}
                    disabled={marketSelected.size === 0}
                    className={`w-full h-11 rounded-xl font-bold ${pal.btn} disabled:opacity-40`}
                  >
                    Confirmar ({marketSelected.size}/{marketList.length})
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* ── CINEMA ── */}
          {currentEnv === "cinema" && cinemaMission && (
            <motion.div key={`cinema-${cinemaPhase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Imprevisto banner */}
              {cinemaPhase === "imprevisto" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-300"
                >
                  <p className="text-sm font-bold text-amber-700">⚠️ Imprevisto!</p>
                  <p className="text-xs text-amber-600 mt-0.5">{cinemaMission.imprevisto?.text}</p>
                </motion.div>
              )}

              <div className={`rounded-xl p-3 mb-3 ${pal.listBg}`}>
                <p className={`text-xs font-bold ${pal.accent}`}>{cinemaMission.scenario}</p>
                <p className={`text-sm font-bold mt-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600"}`}>
                  Orçamento: R${cinemaMission.budget},00
                </p>
                <p className={`text-xs mt-0.5 ${pal.sub}`}>
                  Total no carrinho: R${cinemaTotalCost(cinemaCart, cinemaItems).toFixed(0)},00
                  {cinemaTotalCost(cinemaCart, cinemaItems) > cinemaMission.budget && (
                    <span className="text-red-500 ml-1">· Acima do orçamento!</span>
                  )}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {cinemaItems.map((item) => {
                  const inCart = cinemaCart.has(item.id);
                  const outOfStock = item.price === 999;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (outOfStock) return;
                        setCinemaCart((prev) => {
                          const n = new Set(prev);
                          n.has(item.id) ? n.delete(item.id) : n.add(item.id);
                          return n;
                        });
                      }}
                      disabled={outOfStock}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        outOfStock
                          ? "border-slate-200 bg-slate-50 opacity-40"
                          : inCart
                          ? pal.selectedItem
                          : pal.itemCard
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
                          {item.name}
                        </p>
                        {outOfStock
                          ? <p className="text-xs text-red-400">Esgotado</p>
                          : <p className={`text-xs ${pal.sub}`}>R${item.price},00</p>
                        }
                      </div>
                      {inCart && !outOfStock && <span className="text-green-500 text-lg">✓</span>}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={cinemaPhase === "imprevisto" ? submitCinemaAfterImprevisto : submitCinema}
                disabled={cinemaCart.size < 2}
                className={`w-full h-11 rounded-xl font-bold ${pal.btn} disabled:opacity-40`}
              >
                {cinemaPhase === "imprevisto" ? "Confirmar novo carrinho" : "Confirmar compra"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
