"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AntesDepoisProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

type Direction = "antes" | "depois";

interface AntesDepoisItem {
  category: string;
  item: string;
  emoji: string;
  before: string;
  after: string;
  wrongOptions: string[];
  /** Lower minDifficulty = appears earlier; higher = needs higher difficulty */
  minDifficulty: number;
}

// ─── Content ─────────────────────────────────────────────────────────────────

// DIAS_SHORT is the display name; the array index maps directly to position in the week
const DIAS_SHORT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const NUMEROS = Array.from({ length: 20 }, (_, i) => String(i + 1));
const LETRAS_SEL = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i)); // A–O

// Build items programmatically to avoid repetition

function buildDiasSemana(): AntesDepoisItem[] {
  return DIAS_SHORT.map((dia, i) => {
    const beforeIdx = (i - 1 + 7) % 7;
    const afterIdx = (i + 1) % 7;
    const wrongs = DIAS_SHORT.filter((_, j) => j !== i && j !== beforeIdx && j !== afterIdx);
    return {
      category: "Dias da semana",
      item: dia,
      emoji: "📅",
      before: DIAS_SHORT[beforeIdx],
      after: DIAS_SHORT[afterIdx],
      wrongOptions: wrongs,
      minDifficulty: 1,
    };
  });
}

function buildMeses(): AntesDepoisItem[] {
  return MESES.map((mes, i) => {
    const beforeIdx = (i - 1 + 12) % 12;
    const afterIdx = (i + 1) % 12;
    const wrongs = MESES.filter((_, j) => j !== i && j !== beforeIdx && j !== afterIdx);
    return {
      category: "Meses do ano",
      item: mes,
      emoji: "🗓️",
      before: MESES[beforeIdx],
      after: MESES[afterIdx],
      wrongOptions: wrongs,
      minDifficulty: 4,
    };
  });
}

function buildNumeros(): AntesDepoisItem[] {
  return NUMEROS.map((num, i) => {
    const val = i + 1;
    const beforeVal = val === 1 ? 20 : val - 1;
    const afterVal = val === 20 ? 1 : val + 1;
    const wrongs = NUMEROS.filter((n) => {
      const v = parseInt(n);
      return v !== val && v !== beforeVal && v !== afterVal;
    });
    return {
      category: "Números",
      item: num,
      emoji: "🔢",
      before: String(beforeVal),
      after: String(afterVal),
      wrongOptions: wrongs,
      minDifficulty: 1,
    };
  });
}

function buildLetras(): AntesDepoisItem[] {
  // Select 15 letters: A–O (indices 0–14)
  const letters = LETRAS_SEL; // already 15
  return letters.map((letter, i) => {
    const beforeIdx = (i - 1 + letters.length) % letters.length;
    const afterIdx = (i + 1) % letters.length;
    const wrongs = letters.filter((_, j) => j !== i && j !== beforeIdx && j !== afterIdx);
    return {
      category: "Letras",
      item: letter,
      emoji: "🔤",
      before: letters[beforeIdx],
      after: letters[afterIdx],
      wrongOptions: wrongs,
      minDifficulty: 5,
    };
  });
}

const ROTINAS: Array<{ item: string; emoji: string; before: string; after: string }> = [
  { item: "Acordar",         emoji: "⏰", before: "Dormir",          after: "Escovar os dentes" },
  { item: "Escovar os dentes", emoji: "🪥", before: "Acordar",       after: "Tomar café" },
  { item: "Tomar café",      emoji: "☕", before: "Escovar os dentes", after: "Almoço" },
  { item: "Almoço",          emoji: "🍽️", before: "Tomar café",      after: "Jantar" },
  { item: "Jantar",          emoji: "🌙", before: "Almoço",          after: "Dormir" },
  { item: "Dormir",          emoji: "😴", before: "Jantar",          after: "Acordar" },
];

function buildRotinas(): AntesDepoisItem[] {
  const allItems = ROTINAS.map((r) => r.item);
  return ROTINAS.map((r) => {
    const wrongs = allItems.filter((it) => it !== r.item && it !== r.before && it !== r.after);
    return {
      category: "Rotina do dia",
      item: r.item,
      emoji: r.emoji,
      before: r.before,
      after: r.after,
      wrongOptions: wrongs,
      minDifficulty: 4,
    };
  });
}

const ESTACOES = ["Verão", "Outono", "Inverno", "Primavera"];
const ESTACAO_EMOJIS: Record<string, string> = {
  Verão: "☀️", Outono: "🍂", Inverno: "❄️", Primavera: "🌸",
};

function buildEstacoes(): AntesDepoisItem[] {
  return ESTACOES.map((est, i) => {
    const beforeIdx = (i - 1 + 4) % 4;
    const afterIdx = (i + 1) % 4;
    const wrongs = ESTACOES.filter((_, j) => j !== i && j !== beforeIdx && j !== afterIdx);
    return {
      category: "Estações do ano",
      item: est,
      emoji: ESTACAO_EMOJIS[est],
      before: ESTACOES[beforeIdx],
      after: ESTACOES[afterIdx],
      wrongOptions: wrongs,
      minDifficulty: 3,
    };
  });
}

const REFEICOES = ["Café da manhã", "Almoço", "Lanche", "Jantar"];
const REFEICAO_EMOJIS: Record<string, string> = {
  "Café da manhã": "🥐", Almoço: "🍛", Lanche: "🍎", Jantar: "🍽️",
};

function buildRefeicoes(): AntesDepoisItem[] {
  return REFEICOES.map((ref, i) => {
    const beforeIdx = (i - 1 + 4) % 4;
    const afterIdx = (i + 1) % 4;
    const wrongs = REFEICOES.filter((_, j) => j !== i && j !== beforeIdx && j !== afterIdx);
    return {
      category: "Refeições",
      item: ref,
      emoji: REFEICAO_EMOJIS[ref],
      before: REFEICOES[beforeIdx],
      after: REFEICOES[afterIdx],
      wrongOptions: wrongs,
      minDifficulty: 2,
    };
  });
}

const CHURRASCO_SEQUENCIA: AntesDepoisItem[] = [
  {
    category: "Churrasco",
    item: "Acender o carvão",
    emoji: "🔥",
    before: "Comprar a carne",
    after: "Colocar a carne na grelha",
    wrongOptions: ["Servir a carne", "Lavar a grelha", "Ir ao mercado"],
    minDifficulty: 3,
  },
  {
    category: "Churrasco",
    item: "Colocar a carne na grelha",
    emoji: "🥩",
    before: "Acender o carvão",
    after: "Servir a carne",
    wrongOptions: ["Comprar a carne", "Lavar a grelha", "Fazer a lista"],
    minDifficulty: 3,
  },
  {
    category: "Churrasco",
    item: "Servir a carne",
    emoji: "🍖",
    before: "Colocar a carne na grelha",
    after: "Lavar a grelha",
    wrongOptions: ["Acender o carvão", "Comprar a carne", "Fazer a lista"],
    minDifficulty: 3,
  },
  {
    category: "Churrasco",
    item: "Comprar a carne",
    emoji: "🛒",
    before: "Fazer a lista de compras",
    after: "Temperar a carne",
    wrongOptions: ["Acender o carvão", "Servir a carne", "Lavar a grelha"],
    minDifficulty: 4,
  },
];

// Merge all items
const ALL_ITEMS: AntesDepoisItem[] = [
  ...buildNumeros(),
  ...buildDiasSemana(),
  ...buildRefeicoes(),
  ...buildEstacoes(),
  ...buildRotinas(),
  ...buildMeses(),
  ...buildLetras(),
  ...CHURRASCO_SEQUENCIA,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_TRIALS = 20;

/**
 * Filter items by difficulty, then pick a random one.
 * At difficulty 1-3 → only easy items; higher → progressively unlock harder ones.
 */
function pickItem(difficulty: number): AntesDepoisItem {
  const maxMin = Math.min(1 + Math.floor(difficulty * 0.8), 5);
  const pool = ALL_ITEMS.filter((item) => item.minDifficulty <= maxMin);
  const candidates = pool.length > 0 ? pool : ALL_ITEMS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickDirection(): Direction {
  return Math.random() < 0.5 ? "antes" : "depois";
}

/**
 * Build 4 options: 1 correct + 3 wrong from the item's wrongOptions pool.
 * Wrong options come from the same category (passed in wrongOptions array).
 */
function buildOptions(item: AntesDepoisItem, direction: Direction): string[] {
  const correct = direction === "antes" ? item.before : item.after;
  // wrongOptions always excludes correct answer and the item itself.
  // Take up to 3; all categories have at least 3 wrong options available.
  const wrongs = shuffle([...item.wrongOptions]).slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

// ─── SVG Icon helpers ─────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="8" width="40" height="36" rx="3" />
      <rect x="4" y="8" width="40" height="12" rx="3" fill="currentColor" fillOpacity="0.12" />
      <line x1="12" y1="4" x2="12" y2="14" strokeWidth="2.5" />
      <line x1="36" y1="4" x2="36" y2="14" strokeWidth="2.5" />
      <line x1="4" y1="24" x2="44" y2="24" strokeWidth="1" />
      <circle cx="14" cy="33" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="33" r="2" fill="currentColor" stroke="none" />
      <circle cx="34" cy="33" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="40" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="40" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GrillIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {/* grill top */}
      <rect x="6" y="14" width="36" height="8" rx="2" />
      {/* grill bars */}
      <line x1="14" y1="14" x2="14" y2="22" strokeWidth="2.5" />
      <line x1="20" y1="14" x2="20" y2="22" strokeWidth="2.5" />
      <line x1="26" y1="14" x2="26" y2="22" strokeWidth="2.5" />
      <line x1="32" y1="14" x2="32" y2="22" strokeWidth="2.5" />
      {/* legs */}
      <line x1="14" y1="22" x2="10" y2="42" />
      <line x1="34" y1="22" x2="38" y2="42" />
      <line x1="24" y1="22" x2="24" y2="38" />
      {/* fire */}
      <path d="M18 12 Q20 8 22 10 Q24 6 26 10 Q28 8 30 12" strokeWidth="1.5" />
      {/* meat */}
      <path d="M10 18 Q16 15 24 18 Q32 21 38 18" strokeWidth="1.5" />
    </svg>
  );
}

function ItemIcon({ item }: { item: AntesDepoisItem }) {
  if (item.category === "Dias da semana" || item.category === "Meses do ano") {
    return <CalendarIcon />;
  }
  if (item.category === "Churrasco") {
    return <GrillIcon />;
  }
  return <span className="text-5xl">{item.emoji}</span>;
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────

const TUTORIAL_ITEM: AntesDepoisItem = {
  category: "Dias da semana",
  item: "Terça-feira",
  emoji: "📅",
  before: "Segunda-feira",
  after: "Quarta-feira",
  wrongOptions: ["Quinta-feira", "Sexta-feira", "Sábado"],
  minDifficulty: 1,
};
const TUTORIAL_OPTIONS = shuffle([
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]);

function TutorialStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = TUTORIAL_ITEM.after;

  function handleSelect(opt: string) {
    if (selected) return;
    setSelected(opt);
    if (opt === correct) {
      setTimeout(onDone, 700);
    }
  }

  const cardBg = theme === "GAMIFIED" ? "bg-gray-700" : theme === "COLORFUL" ? "bg-purple-50" : "bg-gray-50";
  const itemTextColor = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-blue-700";
  const questionColor = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700";
  const labelColor = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  function optionStyle(opt: string) {
    if (!selected) {
      return theme === "GAMIFIED"
        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-cyan-400 cursor-pointer"
        : theme === "COLORFUL"
        ? "bg-white border-purple-200 text-purple-900 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
        : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
    }
    if (opt === correct) return "bg-green-100 border-green-500 text-green-700";
    if (opt === selected) return "bg-red-100 border-red-400 text-red-700";
    return theme === "GAMIFIED"
      ? "bg-gray-700 border-gray-600 text-gray-500 opacity-60"
      : "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Center card */}
      <div className={`rounded-xl p-4 text-center ${cardBg}`}>
        <p className={`text-xs mb-1 ${labelColor}`}>O que vem DEPOIS de...</p>
        <div className="flex justify-center mb-1">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="4" y="8" width="40" height="36" rx="3" />
            <rect x="4" y="8" width="40" height="12" rx="3" fill="currentColor" fillOpacity="0.15" />
            <line x1="12" y1="4" x2="12" y2="14" strokeWidth="2.5" />
            <line x1="36" y1="4" x2="36" y2="14" strokeWidth="2.5" />
            <text x="14" y="32" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">SEG</text>
            <text x="28" y="32" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">TER</text>
            <text x="14" y="40" fontSize="7" fill="currentColor" stroke="none">QUA</text>
            <text x="28" y="40" fontSize="7" fill="currentColor" stroke="none">QUI</text>
          </svg>
        </div>
        <p className={`text-xl font-bold ${itemTextColor}`}>{TUTORIAL_ITEM.item}</p>
      </div>

      <p className={`text-sm text-center font-medium ${questionColor}`}>
        Escolha a resposta correta:
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {TUTORIAL_OPTIONS.map((opt) => (
          <motion.button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            className={`rounded-xl border-2 py-3 px-2 text-sm font-semibold text-center transition-colors ${optionStyle(opt)}`}
            whileHover={!selected ? { scale: 1.04 } : {}}
            whileTap={!selected ? { scale: 0.96 } : {}}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {selected && selected !== correct && (
        <p className="text-xs text-orange-600 text-center">
          Não era essa! Depois de Terça-feira vem <strong>Quarta-feira</strong>.
        </p>
      )}
    </div>
  );
}

function AntesDepoisTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction:
        "Uma carta aparece no centro. Leia a pergunta: o que vem ANTES ou DEPOIS? Escolha a resposta certa entre as 4 opções.",
      content: (onStepDone: () => void) => (
        <TutorialStep theme={theme} onDone={onStepDone} />
      ),
    },
  ];

  return (
    <TutorialBase
      theme={theme}
      title="Antes e Depois"
      steps={steps}
      onDone={onDone}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TrialResult {
  correct: boolean;
  rt: number;
  category: string;
  direction: Direction;
}

export function AntesDepois({ difficulty, theme, onComplete }: AntesDepoisProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const firstItem = pickItem(difficulty);
  const firstDirection = pickDirection();

  const [trial, setTrial] = useState(0);
  const [currentItem, setCurrentItem] = useState<AntesDepoisItem>(firstItem);
  const [direction, setDirection] = useState<Direction>(firstDirection);
  const [options, setOptions] = useState<string[]>(() => buildOptions(firstItem, firstDirection));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [results, setResults] = useState<TrialResult[]>([]);

  const trialStart = useRef<number>(Date.now());
  const startTime = useRef<number>(Date.now());

  function advance(newTrial: number) {
    const nextItem = pickItem(difficulty);
    const nextDir = pickDirection();
    setCurrentItem(nextItem);
    setDirection(nextDir);
    setOptions(buildOptions(nextItem, nextDir));
    setSelected(null);
    setFeedback(null);
    setTrial(newTrial);
    trialStart.current = Date.now();
  }

  function handleSelect(opt: string) {
    if (feedback) return;
    const rt = Date.now() - trialStart.current;
    const correct = direction === "antes" ? currentItem.before : currentItem.after;
    const isCorrect = opt === correct;

    setSelected(opt);
    setFeedback(isCorrect ? "correct" : "incorrect");

    const newResults: TrialResult[] = [
      ...results,
      { correct: isCorrect, rt, category: currentItem.category, direction },
    ];
    setResults(newResults);

    const nextTrialNum = trial + 1;
    reportProgress(Math.round((nextTrialNum / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrialNum >= MAX_TRIALS) {
        const accuracy = newResults.filter((r) => r.correct).length / MAX_TRIALS;
        const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / MAX_TRIALS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("antes-depois", accuracy, avgRT, difficulty);
        const correctCount = newResults.filter((r) => r.correct).length;
        onComplete({
          exerciseId: "antes-depois",
          domain: "attention",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration,
          metadata: {
            trials: MAX_TRIALS,
            correct: correctCount,
            categoriesUsed: [...new Set(newResults.map((r) => r.category))],
            antesCount: newResults.filter((r) => r.direction === "antes").length,
            depoisCount: newResults.filter((r) => r.direction === "depois").length,
          },
        });
      } else {
        advance(nextTrialNum);
      }
    }, 800);
  }

  if (showTutorial) {
    return (
      <AntesDepoisTutorial theme={theme} onDone={() => {
        setShowTutorial(false);
        trialStart.current = Date.now();
        startTime.current = Date.now();
      }} />
    );
  }

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const bgStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const titleColor = isGamified ? "#ffffff" : "#1a2744";
  const labelColor = isGamified ? "rgba(255,255,255,0.6)" : "#8a7a6a";
  const categoryColor = isGamified ? "rgba(255,255,255,0.4)" : "#8a7a6a";

  const centerCardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }
    : { background: "#f8f7f5", border: "1px solid rgba(26,39,68,0.1)", borderRadius: 16 };

  const itemTextColor = isGamified ? "#67e8f9" : isColorful ? "#7c3aed" : "#1a4fa0";

  const questionStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }
    : { background: isColorful ? "#f3e8ff" : "#eff6ff", border: isColorful ? "1px solid #d8b4fe" : "1px solid #bfdbfe", borderRadius: 12 };

  const questionTextColor = isGamified ? "rgba(255,255,255,0.9)" : isColorful ? "#6b21a8" : "#1e40af";

  const directionColor = isGamified
    ? (direction === "antes" ? "#fbbf24" : "#34d399")
    : (direction === "antes" ? "#d97706" : "#059669");

  const correct = direction === "antes" ? currentItem.before : currentItem.after;

  function optionStyle(opt: string): React.CSSProperties {
    if (!feedback) {
      if (isGamified) return { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 16, color: "#ffffff", cursor: "pointer" };
      if (isColorful) return { background: "#ffffff", border: "1.5px solid #e9d5ff", borderRadius: 16, color: "#581c87", cursor: "pointer" };
      return { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.12)", borderRadius: 16, color: "#1a2744", cursor: "pointer" };
    }
    if (opt === correct) return { background: "#dcfce7", border: "1.5px solid #22c55e", borderRadius: 16, color: "#166534" };
    if (opt === selected) return { background: "#fee2e2", border: "1.5px solid #ef4444", borderRadius: 16, color: "#991b1b" };
    return { background: isGamified ? "rgba(255,255,255,0.04)" : "#f9f9f9", border: "1.5px solid rgba(128,128,128,0.2)", borderRadius: 16, color: isGamified ? "rgba(255,255,255,0.3)" : "#9ca3af", opacity: 0.5 };
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={bgStyle}>
      <div className="w-full max-w-md p-6" style={cardStyle}>

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-bold text-base" style={{ color: titleColor }}>Antes e Depois</h2>
            <p className="text-xs" style={{ color: categoryColor }}>{currentItem.category}</p>
          </div>
          <span className="text-xs font-mono" style={{ color: labelColor }}>
            {trial + 1}/{MAX_TRIALS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                background: i < results.length
                  ? results[i].correct ? "#22c55e" : "#ef4444"
                  : i === trial
                  ? "#8b5cf6"
                  : isGamified ? "rgba(255,255,255,0.15)" : "rgba(26,45,80,0.12)",
                animation: i === trial ? "pulse 2s infinite" : undefined,
              }}
            />
          ))}
        </div>

        {/* Center card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${trial}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="p-5 text-center mb-4"
            style={centerCardStyle}
          >
            <div className="flex justify-center mb-2" style={{ color: itemTextColor }}>
              <ItemIcon item={currentItem} />
            </div>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: itemTextColor }}>
              {currentItem.item}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Question */}
        <div className="px-4 py-3 mb-4 text-center" style={questionStyle}>
          <p className="text-sm font-medium" style={{ color: questionTextColor }}>
            O que vem{" "}
            <span className="font-black text-base" style={{ color: directionColor }}>
              {direction.toUpperCase()}
            </span>{" "}
            de{" "}
            <span className="font-bold">{currentItem.item}</span>?
          </p>
        </div>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`opts-${trial}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="grid grid-cols-2 gap-3"
          >
            {options.map((opt, i) => (
              <motion.button
                key={`${trial}-${i}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!feedback}
                className="py-4 px-3 text-sm font-semibold text-center transition-all"
                style={optionStyle(opt)}
                whileHover={!feedback ? { scale: 1.04 } : {}}
                whileTap={!feedback ? { scale: 0.94 } : {}}
              >
                {opt}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Feedback */}
        <div className="h-8 flex items-center justify-center mt-3">
          <AnimatePresence>
            {feedback && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold"
                style={{ color: feedback === "correct" ? "#22c55e" : "#ef4444" }}
              >
                {feedback === "correct"
                  ? "Correto! ✅"
                  : `Incorreto — era ${correct} ❌`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
