"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange";
type ItemShape = "circle" | "square" | "triangle" | "diamond" | "star";
type ItemSize = "small" | "large";
type RuleType = "color" | "shape" | "size" | "parity" | "combined" | "exception" | "inverse";

interface Item {
  id: string;
  color: ItemColor;
  shape: ItemShape;
  size: ItemSize;
  number: number;
}

interface Rule {
  id: string;
  type: RuleType;
  label: string;
  highlight: string;
  highlightColor?: string;
  isCorrect: (item: Item) => boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_HEX: Record<ItemColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#f59e0b",
  purple: "#a855f7",
  orange: "#f97316",
};

const COLOR_PT: Record<ItemColor, string> = {
  red: "VERMELHOS",
  blue: "AZUIS",
  green: "VERDES",
  yellow: "AMARELOS",
  purple: "ROXOS",
  orange: "LARANJAS",
};

const COLOR_PT_SING: Record<ItemColor, string> = {
  red: "VERMELHO",
  blue: "AZUL",
  green: "VERDE",
  yellow: "AMARELO",
  purple: "ROXO",
  orange: "LARANJA",
};

const SHAPE_PT: Record<ItemShape, string> = {
  circle: "CÍRCULOS",
  square: "QUADRADOS",
  triangle: "TRIÂNGULOS",
  diamond: "LOSANGOS",
  star: "ESTRELAS",
};

const ALL_COLORS: ItemColor[] = ["red", "blue", "green", "yellow", "purple", "orange"];
const ALL_SHAPES: ItemShape[] = ["circle", "square", "triangle", "diamond", "star"];

const CHARACTERS = [
  { emoji: "🤖", name: "Robô" },
  { emoji: "👽", name: "Alien" },
  { emoji: "🦊", name: "Raposa" },
  { emoji: "🧙", name: "Mago" },
  { emoji: "🐉", name: "Dragão" },
  { emoji: "🐱", name: "Gato" },
];

const MAX_ROUNDS = 28;

// ─── Item helpers ─────────────────────────────────────────────────────────────

let _uid = 0;
function uid() { return String(++_uid); }

function rndColor(exclude?: ItemColor): ItemColor {
  const pool = ALL_COLORS.filter(c => c !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function rndShape(exclude?: ItemShape): ItemShape {
  const pool = ALL_SHAPES.filter(s => s !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function rndSize(): ItemSize { return Math.random() > 0.5 ? "large" : "small"; }
function rndNum(): number { return 1 + Math.floor(Math.random() * 9); }

// ─── Rule factory ─────────────────────────────────────────────────────────────

function colorRule(c: ItemColor): Rule {
  return {
    id: `c_${c}`,
    type: "color",
    label: `Quero objetos ${COLOR_PT[c]}`,
    highlight: COLOR_PT[c],
    highlightColor: COLOR_HEX[c],
    isCorrect: item => item.color === c,
  };
}

function shapeRule(s: ItemShape): Rule {
  return {
    id: `s_${s}`,
    type: "shape",
    label: `Quero objetos ${SHAPE_PT[s]}`,
    highlight: SHAPE_PT[s],
    isCorrect: item => item.shape === s,
  };
}

function sizeRule(sz: ItemSize): Rule {
  const name = sz === "large" ? "GRANDES" : "PEQUENOS";
  return {
    id: `sz_${sz}`,
    type: "size",
    label: `Quero objetos ${name}`,
    highlight: name,
    isCorrect: item => item.size === sz,
  };
}

function parityRule(even: boolean): Rule {
  const name = even ? "NÚMEROS PARES" : "NÚMEROS ÍMPARES";
  return {
    id: `p_${even}`,
    type: "parity",
    label: `Quero ${name}`,
    highlight: name,
    isCorrect: item => even ? item.number % 2 === 0 : item.number % 2 !== 0,
  };
}

function combinedRule(c: ItemColor, s: ItemShape): Rule {
  return {
    id: `cs_${c}_${s}`,
    type: "combined",
    label: `${COLOR_PT[c]} + ${SHAPE_PT[s]}`,
    highlight: `${COLOR_PT_SING[c]} e ${SHAPE_PT[s].slice(0, -1)}`,
    highlightColor: COLOR_HEX[c],
    isCorrect: item => item.color === c && item.shape === s,
  };
}

function exceptionRule(c: ItemColor): Rule {
  return {
    id: `ex_${c}`,
    type: "exception",
    label: `TUDO, exceto ${COLOR_PT[c]}`,
    highlight: `exceto ${COLOR_PT[c]}`,
    highlightColor: COLOR_HEX[c],
    isCorrect: item => item.color !== c,
  };
}

function inverseRule(base: Rule): Rule {
  return {
    id: `inv_${base.id}`,
    type: "inverse",
    label: `⚠️ INVERSO! ${base.label}`,
    highlight: "INVERSO",
    isCorrect: item => !base.isCorrect(item),
  };
}

// ─── Rule pool by game level ──────────────────────────────────────────────────

function buildRulePool(gameLevel: number): Rule[] {
  const colors = ALL_COLORS.map(colorRule);
  const shapes = ALL_SHAPES.map(shapeRule);
  const sizes = [sizeRule("large"), sizeRule("small")];
  const parities = [parityRule(true), parityRule(false)];
  const combined: Rule[] = [];
  for (const c of ALL_COLORS.slice(0, 4)) {
    for (const s of ALL_SHAPES.slice(0, 4)) {
      combined.push(combinedRule(c, s));
    }
  }
  const exceptions = ALL_COLORS.map(exceptionRule);

  if (gameLevel <= 1) return colors;
  if (gameLevel <= 2) return [...colors, ...shapes];
  if (gameLevel <= 3) return [...colors, ...shapes, ...sizes];
  if (gameLevel <= 4) return [...colors, ...shapes, ...combined.slice(0, 8)];
  if (gameLevel <= 5) return [...colors, ...shapes, ...exceptions];
  return [...colors, ...shapes, ...exceptions, ...parities];
}

function pickRule(gameLevel: number, lastRule?: Rule): Rule {
  const pool = buildRulePool(gameLevel).filter(r => !lastRule || r.id !== lastRule.id);
  const base = pool[Math.floor(Math.random() * pool.length)];
  if (gameLevel >= 6 && Math.random() > 0.5) return inverseRule(base);
  return base;
}

// ─── Item set generation ──────────────────────────────────────────────────────

function makeCorrectItem(rule: Rule): Item {
  switch (rule.type) {
    case "color": {
      const c = rule.id.split("_")[1] as ItemColor;
      return { id: uid(), color: c, shape: rndShape(), size: rndSize(), number: rndNum() };
    }
    case "shape": {
      const s = rule.id.split("_")[1] as ItemShape;
      return { id: uid(), color: rndColor(), shape: s, size: rndSize(), number: rndNum() };
    }
    case "size": {
      const sz = rule.id.split("_")[1] as ItemSize;
      return { id: uid(), color: rndColor(), shape: rndShape(), size: sz, number: rndNum() };
    }
    case "parity": {
      const even = rule.id.includes("true");
      let n = rndNum();
      while (even ? n % 2 !== 0 : n % 2 === 0) n = rndNum();
      return { id: uid(), color: rndColor(), shape: rndShape(), size: rndSize(), number: n };
    }
    case "combined": {
      const parts = rule.id.split("_");
      return { id: uid(), color: parts[1] as ItemColor, shape: parts[2] as ItemShape, size: rndSize(), number: rndNum() };
    }
    case "exception": {
      const excl = rule.id.split("_")[1] as ItemColor;
      return { id: uid(), color: rndColor(excl), shape: rndShape(), size: rndSize(), number: rndNum() };
    }
    case "inverse": {
      // Generate items until one passes the inverse isCorrect
      let item: Item = { id: uid(), color: rndColor(), shape: rndShape(), size: rndSize(), number: rndNum() };
      let tries = 0;
      while (!rule.isCorrect(item) && tries++ < 50) {
        item = { id: uid(), color: rndColor(), shape: rndShape(), size: rndSize(), number: rndNum() };
      }
      return item;
    }
    default:
      return { id: uid(), color: "red", shape: "circle", size: "large", number: 5 };
  }
}

function makeWrongItem(rule: Rule): Item {
  let item: Item;
  let tries = 0;
  do {
    item = { id: uid(), color: rndColor(), shape: rndShape(), size: rndSize(), number: rndNum() };
    tries++;
  } while (rule.isCorrect(item) && tries < 80);
  return item;
}

function generateItemSet(rule: Rule, count: number): { items: Item[]; correctIdx: number } {
  const correctIdx = Math.floor(Math.random() * count);
  const correct = makeCorrectItem(rule);
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    items.push(i === correctIdx ? correct : makeWrongItem(rule));
  }
  return { items, correctIdx };
}

// ─── Difficulty config ────────────────────────────────────────────────────────

interface DifficultyConfig {
  itemCount: 3 | 4;
  timeSecs: number; // 0 = unlimited
  ruleChangeMin: number;
  ruleChangeMax: number;
}

function getDifficultyConfig(gameLevel: number): DifficultyConfig {
  if (gameLevel <= 1) return { itemCount: 3, timeSecs: 0, ruleChangeMin: 6, ruleChangeMax: 9 };
  if (gameLevel <= 2) return { itemCount: 3, timeSecs: 0, ruleChangeMin: 5, ruleChangeMax: 8 };
  if (gameLevel <= 3) return { itemCount: 3, timeSecs: 7, ruleChangeMin: 4, ruleChangeMax: 7 };
  if (gameLevel <= 4) return { itemCount: 4, timeSecs: 6, ruleChangeMin: 3, ruleChangeMax: 6 };
  if (gameLevel <= 5) return { itemCount: 4, timeSecs: 5, ruleChangeMin: 3, ruleChangeMax: 5 };
  return { itemCount: 4, timeSecs: 4, ruleChangeMin: 2, ruleChangeMax: 4 };
}

function initialGameLevel(difficulty: number): number {
  if (difficulty <= 2) return 1;
  if (difficulty <= 4) return 2;
  if (difficulty <= 6) return 3;
  if (difficulty <= 8) return 4;
  return 5;
}

// ─── SVG Shape renderer ───────────────────────────────────────────────────────

function ShapeIcon({ shape, color, sizeProp }: { shape: ItemShape; color: string; sizeProp: ItemSize }) {
  const dim = sizeProp === "large" ? 62 : 40;
  const glow = `drop-shadow(0 3px 6px ${color}88)`;
  const commonProps = { fill: color, stroke: "white", strokeWidth: 2 };
  return (
    <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ filter: glow, flexShrink: 0 }}>
      {shape === "circle"   && <circle cx="50" cy="50" r="44" {...commonProps} />}
      {shape === "square"   && <rect x="7" y="7" width="86" height="86" rx="10" {...commonProps} />}
      {shape === "triangle" && <polygon points="50,8 93,90 7,90" {...commonProps} />}
      {shape === "diamond"  && <polygon points="50,6 94,50 50,94 6,50" {...commonProps} />}
      {shape === "star"     && <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" {...commonProps} />}
    </svg>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────

function pal(theme: Theme) {
  if (theme === "GAMIFIED") return {
    bg: "bg-gray-950",
    wrap: "bg-gray-900 border border-gray-800",
    card: "bg-gray-800 border-gray-700",
    cardSel: "border-cyan-400 bg-cyan-900/30",
    cardWrong: "border-red-500 bg-red-900/30",
    cardCorrect: "border-green-500 bg-green-900/30",
    title: "text-cyan-400",
    sub: "text-gray-400",
    text: "text-gray-100",
    badge: "bg-cyan-900 text-cyan-300",
    btn: "bg-cyan-600 hover:bg-cyan-700 text-white",
    bar: "bg-gray-800",
    rule: "bg-gray-800 border border-cyan-500/30 text-gray-100",
    ruleChange: "bg-gray-900 border border-yellow-500/50",
  };
  if (theme === "COLORFUL") return {
    bg: "bg-gradient-to-br from-violet-50 via-white to-indigo-50",
    wrap: "bg-white border-2 border-violet-200 shadow-xl",
    card: "bg-white border-violet-200",
    cardSel: "border-violet-500 bg-violet-50",
    cardWrong: "border-red-400 bg-red-50",
    cardCorrect: "border-green-400 bg-green-50",
    title: "text-violet-700",
    sub: "text-violet-500",
    text: "text-gray-800",
    badge: "bg-violet-100 text-violet-700",
    btn: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white",
    bar: "bg-violet-100",
    rule: "bg-violet-50 border-2 border-violet-200 text-violet-900",
    ruleChange: "bg-white border-2 border-yellow-400",
  };
  return {
    bg: "bg-slate-50",
    wrap: "bg-white border border-slate-200 shadow-md",
    card: "bg-white border-slate-200",
    cardSel: "border-indigo-400 bg-indigo-50",
    cardWrong: "border-red-400 bg-red-50",
    cardCorrect: "border-green-400 bg-green-50",
    title: "text-slate-800",
    sub: "text-slate-500",
    text: "text-gray-800",
    badge: "bg-slate-100 text-slate-600",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    bar: "bg-slate-200",
    rule: "bg-slate-50 border border-slate-200 text-gray-800",
    ruleChange: "bg-white border border-yellow-400",
  };
}

// ─── Item Card ────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: Item;
  feedback: "correct" | "wrong" | "show" | null;
  showNumber: boolean;
  onTap: () => void;
  theme: Theme;
}

function ItemCard({ item, feedback, showNumber, onTap, theme }: ItemCardProps) {
  const p = pal(theme);
  const cardClass =
    feedback === "correct" ? p.cardCorrect :
    feedback === "wrong"   ? p.cardWrong :
    feedback === "show"    ? p.cardCorrect :
    p.card;

  return (
    <motion.button
      onPointerDown={onTap}
      whileTap={{ scale: 0.92 }}
      className={`rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-colors ${cardClass}`}
      style={{ width: 128, height: 128 }}
    >
      <ShapeIcon shape={item.shape} color={COLOR_HEX[item.color]} sizeProp={item.size} />
      {showNumber && (
        <span className={`text-lg font-black ${p.text}`}>{item.number}</span>
      )}
    </motion.button>
  );
}

// ─── Rule Announcement ────────────────────────────────────────────────────────

function RuleAnnouncement({ rule, isNew, theme, characterEmoji }: {
  rule: Rule; isNew: boolean; theme: Theme; characterEmoji: string;
}) {
  const p = pal(theme);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-3xl p-6 text-center space-y-4 ${p.ruleChange}`}
    >
      <p className="text-5xl">{characterEmoji}</p>
      {isNew && (
        <div className="inline-block px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-black tracking-wider">
          ⚡ NOVA REGRA!
        </div>
      )}
      <div>
        <p className={`text-xs uppercase tracking-widest mb-1 ${p.sub}`}>
          {isNew ? "A regra mudou!" : "Regra desta rodada"}
        </p>
        <p className={`text-xl font-black ${p.title}`}>
          {rule.highlightColor ? (
            <>
              <span>{rule.label.split(rule.highlight)[0]}</span>
              <span style={{ color: rule.highlightColor }}>{rule.highlight}</span>
              <span>{rule.label.split(rule.highlight)[1]}</span>
            </>
          ) : (
            <span>{rule.label}</span>
          )}
        </p>
      </div>
      <p className={`text-xs ${p.sub}`}>Prepare-se...</p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FlexibilidadeCognitivaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type GamePhase = "start" | "announcing" | "playing" | "feedback";

export function FlexibilidadeCognitiva({ difficulty, theme, onComplete }: FlexibilidadeCognitivaProps) {
  const reportProgress = useExerciseProgress();
  const p = pal(theme);

  // ── Session state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>("start");
  const [roundNum, setRoundNum] = useState(0);
  const [gameLevel, setGameLevel] = useState(initialGameLevel(difficulty));
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);

  // Current round
  const [rule, setRule] = useState<Rule>(() => pickRule(initialGameLevel(difficulty)));
  const [items, setItems] = useState<Item[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [feedback, setFeedback] = useState<("correct" | "wrong" | "show" | null)[]>([]);
  const [lastFeedback, setLastFeedback] = useState<"correct" | "wrong" | null>(null);
  const [isRuleNew, setIsRuleNew] = useState(true);
  const [characterIdx, setCharacterIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Metrics refs
  const startTime = useRef(Date.now());
  const roundStartTime = useRef(Date.now());
  const reactionTimes = useRef<number[]>([]);
  const results = useRef<boolean[]>([]);
  const correctCount = useRef(0);
  const perseverations = useRef(0);
  const ruleChangeCount = useRef(0);
  const nextRuleChangeAt = useRef(0);
  const prevRule = useRef<Rule | null>(null);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = getDifficultyConfig(gameLevel);
  const showNumber = rule.type === "parity";

  // ── Initialize first round ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "start") return;
    const { ruleChangeMin, ruleChangeMax } = getDifficultyConfig(initialGameLevel(difficulty));
    nextRuleChangeAt.current = ruleChangeMin + Math.floor(Math.random() * (ruleChangeMax - ruleChangeMin));
  }, [difficulty, phase]);

  // ── Per-round timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || config.timeSecs === 0) return;
    setTimeLeft(config.timeSecs);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundNum]);

  function handleTimeout() {
    if (doneRef.current) return;
    const fbs: ("correct" | "wrong" | "show" | null)[] = items.map((_, i) =>
      i === correctIdx ? "show" : null
    );
    setFeedback(fbs);
    setLastFeedback("wrong");
    advanceRound(false);
  }

  // ── Start round ────────────────────────────────────────────────────────────
  function startRound(nextRule: Rule, newRule: boolean) {
    const cfg = getDifficultyConfig(gameLevel);
    const { items: newItems, correctIdx: ci } = generateItemSet(nextRule, cfg.itemCount);
    setRule(nextRule);
    setItems(newItems);
    setCorrectIdx(ci);
    setFeedback(newItems.map(() => null));
    setIsRuleNew(newRule);
    roundStartTime.current = Date.now();
    doneRef.current = false;

    if (newRule) {
      setPhase("announcing");
      setTimeout(() => setPhase("playing"), 1800);
    } else {
      setPhase("playing");
    }
  }

  // ── Begin game ─────────────────────────────────────────────────────────────
  function begin() {
    const firstRule = pickRule(gameLevel);
    setCharacterIdx(Math.floor(Math.random() * CHARACTERS.length));
    startRound(firstRule, true);
  }

  // ── Tap item ───────────────────────────────────────────────────────────────
  function handleTap(idx: number) {
    if (phase !== "playing" || doneRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    doneRef.current = true;

    const rt = Date.now() - roundStartTime.current;
    reactionTimes.current.push(rt);

    const isCorrect = idx === correctIdx;
    const tapItem = items[idx];

    // Perseveration: was this item correct under the previous rule?
    if (!isCorrect && prevRule.current && prevRule.current.isCorrect(tapItem)) {
      perseverations.current++;
    }

    const fbs: ("correct" | "wrong" | "show" | null)[] = items.map((_, i) => {
      if (i === idx) return isCorrect ? "correct" : "wrong";
      if (!isCorrect && i === correctIdx) return "show";
      return null;
    });
    setFeedback(fbs);
    setLastFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) correctCount.current++;

    advanceRound(isCorrect);
  }

  // ── Advance to next round ──────────────────────────────────────────────────
  const advanceRound = useCallback((correct: boolean) => {
    const newStreak = correct ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextGameLevel = gameLevel;
    let resetStreak = false;
    if (newStreak >= 3 && gameLevel < 6) { nextGameLevel = gameLevel + 1; resetStreak = true; }
    if (newStreak <= -2 && gameLevel > 1) { nextGameLevel = gameLevel - 1; resetStreak = true; }

    setStreak(resetStreak ? 0 : newStreak);
    setGameLevel(nextGameLevel);
    setCombo(correct ? combo + 1 : 0);

    const next = roundNum + 1;
    reportProgress(Math.round((next / MAX_ROUNDS) * 100));
    setPhase("feedback");

    setTimeout(() => {
      results.current = [...results.current, correct];

      if (next >= MAX_ROUNDS) {
        doneRef.current = true;
        const rts = reactionTimes.current;
        const avgRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 1000;
        const accuracy = correctCount.current / MAX_ROUNDS;
        const score = calculateExerciseScore("flexibilidade-cognitiva", accuracy, avgRT, difficulty);
        onComplete({
          exerciseId: "flexibilidade-cognitiva",
          domain: "executive",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: {
            rounds: MAX_ROUNDS,
            correct: correctCount.current,
            perseverations: perseverations.current,
            ruleChanges: ruleChangeCount.current,
            finalLevel: nextGameLevel,
            avgRT: Math.round(avgRT),
          },
        });
        return;
      }

      setRoundNum(next);

      // Decide if rule changes
      const willChange = next >= nextRuleChangeAt.current;
      let nextRule = rule;
      if (willChange) {
        prevRule.current = rule;
        nextRule = pickRule(nextGameLevel, rule);
        ruleChangeCount.current++;
        const cfg = getDifficultyConfig(nextGameLevel);
        nextRuleChangeAt.current = next + cfg.ruleChangeMin + Math.floor(Math.random() * (cfg.ruleChangeMax - cfg.ruleChangeMin));
        if (CHARACTERS.length > 1) setCharacterIdx(prev => (prev + 1) % CHARACTERS.length);
      }

      startRound(nextRule, willChange);
    }, 550);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNum, streak, gameLevel, combo, rule, difficulty, onComplete, reportProgress]);

  // ── Progress bar ───────────────────────────────────────────────────────────
  const ProgressBar = () => (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
          i < results.current.length
            ? (results.current[i] ? "bg-green-500" : "bg-red-400")
            : i === roundNum ? "bg-blue-400 animate-pulse" : p.bar
        }`} />
      ))}
    </div>
  );

  // ── Start screen ───────────────────────────────────────────────────────────
  if (phase === "start") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${p.bg}`}>
        <div className={`w-full max-w-sm rounded-3xl p-6 text-center space-y-5 ${p.wrap}`}>
          <p className="text-5xl">🧠</p>
          <div>
            <h2 className={`text-2xl font-black ${p.title}`}>Entregador</h2>
            <p className={`text-sm mt-2 ${p.sub}`}>
              Personagens fazem pedidos. Entregue o item certo!
            </p>
            <p className={`text-xs mt-2 ${p.sub}`}>
              As regras mudam — preste atenção!
            </p>
          </div>
          <button onClick={begin} className={`w-full h-12 rounded-2xl font-bold ${p.btn}`}>
            Começar →
          </button>
        </div>
      </div>
    );
  }

  const character = CHARACTERS[characterIdx];
  const comboStr = combo >= 3 ? `🔥 ${combo}x` : null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start pt-4 p-3 ${p.bg}`}>
      <div className={`w-full max-w-sm rounded-3xl p-4 ${p.wrap}`}>
        <ProgressBar />

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{character.emoji}</span>
            <span className={`text-xs font-semibold ${p.sub}`}>{character.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {comboStr && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.badge}`}>{comboStr}</span>
            )}
            {config.timeSecs > 0 && phase === "playing" && (
              <span className={`text-sm font-black tabular-nums ${timeLeft <= 2 ? "text-red-500" : p.sub}`}>
                {timeLeft}s
              </span>
            )}
            <span className={`text-xs ${p.sub}`}>{roundNum + 1}/{MAX_ROUNDS}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(phase === "announcing") && (
            <motion.div key={`ann_${roundNum}`}>
              <RuleAnnouncement rule={rule} isNew={isRuleNew} theme={theme} characterEmoji={character.emoji} />
            </motion.div>
          )}

          {(phase === "playing" || phase === "feedback") && (
            <motion.div
              key={`play_${roundNum}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Rule display */}
              <div className={`rounded-2xl px-4 py-3 text-center ${p.rule}`}>
                <p className="text-xs uppercase tracking-widest mb-0.5 opacity-60">
                  {rule.type === "inverse" ? "⚠️ REGRA INVERTIDA" : "Regra ativa"}
                </p>
                {rule.highlightColor ? (
                  <p className="text-base font-black leading-tight">
                    {rule.label.split(rule.highlight)[0]}
                    <span style={{ color: rule.highlightColor }}>{rule.highlight}</span>
                    {rule.label.split(rule.highlight)[1]}
                  </p>
                ) : (
                  <p className="text-base font-black">{rule.label}</p>
                )}
              </div>

              {/* Timer bar */}
              {config.timeSecs > 0 && phase === "playing" && (
                <div className={`w-full h-2 rounded-full overflow-hidden ${p.bar}`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: timeLeft <= 2 ? "#ef4444" : "#3b82f6" }}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / config.timeSecs) * 100}%` }}
                    transition={{ duration: 0.9, ease: "linear" }}
                  />
                </div>
              )}

              {/* Items grid */}
              <div className={`grid gap-3 justify-center ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {items.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    feedback={feedback[i] ?? null}
                    showNumber={showNumber}
                    onTap={() => handleTap(i)}
                    theme={theme}
                  />
                ))}
              </div>

              {/* Feedback message */}
              <AnimatePresence>
                {phase === "feedback" && lastFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p className={`text-sm font-bold ${lastFeedback === "correct" ? "text-green-600" : "text-red-500"}`}>
                      {lastFeedback === "correct" ? "✓ Correto!" : "✗ Errou!"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
