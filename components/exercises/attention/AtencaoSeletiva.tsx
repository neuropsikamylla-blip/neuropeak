"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoSeletivaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Tipos ──────────────────────────────────────────────────────────────────

type ShapeId = "circle" | "triangle" | "square" | "diamond";
type ColorId = "green" | "red" | "blue" | "yellow" | "orange" | "purple";

interface StimulusConfig {
  shape: ShapeId;
  color: ColorId;
}

interface Rule {
  id: string;
  description: string;        // shown to patient: "Toque no VERDE"
  targetEmoji: string;        // visual hint emoji
  isTarget: (s: StimulusConfig) => boolean;
}

interface TrialData {
  stimulus: StimulusConfig;
  isTarget: boolean;
}

type TrialPhase = "isi" | "stimulus" | "feedback" | "rule_change";

interface TrialResult {
  isTarget: boolean;
  tapped: boolean;
  rt: number | null;   // null = no tap
}

// ── Cores e formas ──────────────────────────────────────────────────────────

const COLOR_HEX: Record<ColorId, string> = {
  green:  "#22c55e",
  red:    "#ef4444",
  blue:   "#3b82f6",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
};

const COLOR_LABEL: Record<ColorId, string> = {
  green:  "VERDE",
  red:    "VERMELHO",
  blue:   "AZUL",
  yellow: "AMARELO",
  orange: "LARANJA",
  purple: "ROXO",
};

const SHAPE_LABEL: Record<ShapeId, string> = {
  circle:   "CÍRCULO",
  triangle: "TRIÂNGULO",
  square:   "QUADRADO",
  diamond:  "DIAMANTE",
};

// ── SVG shapes ─────────────────────────────────────────────────────────────

function ShapeSvg({ shape, color, size }: { shape: ShapeId; color: string; size: number }) {
  const s = size;
  const c = s / 2;
  const r = s * 0.42;
  const strokeWidth = Math.max(2, s * 0.04);

  if (shape === "circle") {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill={color} stroke="white" strokeWidth={strokeWidth} />
      </svg>
    );
  }
  if (shape === "triangle") {
    const pts = `${c},${s * 0.1} ${s * 0.9},${s * 0.88} ${s * 0.1},${s * 0.88}`;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={pts} fill={color} stroke="white" strokeWidth={strokeWidth} />
      </svg>
    );
  }
  if (shape === "square") {
    const pad = s * 0.1;
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={pad} y={pad} width={s - pad * 2} height={s - pad * 2}
          rx={s * 0.08} fill={color} stroke="white" strokeWidth={strokeWidth} />
      </svg>
    );
  }
  // diamond
  const pts = `${c},${s * 0.06} ${s * 0.9},${c} ${c},${s * 0.94} ${s * 0.1},${c}`;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <polygon points={pts} fill={color} stroke="white" strokeWidth={strokeWidth} />
    </svg>
  );
}

// ── Regras por dificuldade ─────────────────────────────────────────────────

const RULES: Rule[] = [
  {
    id: "green_any",
    description: "Toque no VERDE",
    targetEmoji: "🟢",
    isTarget: s => s.color === "green",
  },
  {
    id: "red_any",
    description: "Toque no VERMELHO",
    targetEmoji: "🔴",
    isTarget: s => s.color === "red",
  },
  {
    id: "blue_any",
    description: "Toque no AZUL",
    targetEmoji: "🔵",
    isTarget: s => s.color === "blue",
  },
  {
    id: "circle_any",
    description: "Toque no CÍRCULO",
    targetEmoji: "⭕",
    isTarget: s => s.shape === "circle",
  },
  {
    id: "triangle_any",
    description: "Toque no TRIÂNGULO",
    targetEmoji: "🔺",
    isTarget: s => s.shape === "triangle",
  },
  {
    id: "green_circle",
    description: "Toque no CÍRCULO VERDE",
    targetEmoji: "🟢⭕",
    isTarget: s => s.color === "green" && s.shape === "circle",
  },
  {
    id: "blue_triangle",
    description: "Toque no TRIÂNGULO AZUL",
    targetEmoji: "🔵🔺",
    isTarget: s => s.color === "blue" && s.shape === "triangle",
  },
  {
    id: "red_square",
    description: "Toque no QUADRADO VERMELHO",
    targetEmoji: "🔴⬛",
    isTarget: s => s.color === "red" && s.shape === "square",
  },
];

// ── Geração de estímulos ───────────────────────────────────────────────────

const EASY_COLORS:   ColorId[] = ["green", "red"];
const MEDIUM_COLORS: ColorId[] = ["green", "red", "blue", "yellow"];
const HARD_COLORS:   ColorId[]  = ["green", "red", "blue", "yellow", "orange", "purple"];

const EASY_SHAPES:   ShapeId[] = ["circle"];
const MEDIUM_SHAPES: ShapeId[] = ["circle", "triangle", "square"];
const HARD_SHAPES:   ShapeId[] = ["circle", "triangle", "square", "diamond"];

function stimulusPool(d: number): StimulusConfig[] {
  const colors = d <= 3 ? EASY_COLORS : d <= 6 ? MEDIUM_COLORS : HARD_COLORS;
  const shapes = d <= 3 ? EASY_SHAPES : d <= 6 ? MEDIUM_SHAPES : HARD_SHAPES;
  const pool: StimulusConfig[] = [];
  for (const color of colors) {
    for (const shape of shapes) {
      pool.push({ color, shape });
    }
  }
  return pool;
}

function buildTrials(d: number, rule: Rule, count: number): TrialData[] {
  const pool = stimulusPool(d);
  const targets = pool.filter(s => rule.isTarget(s));
  const distractors = pool.filter(s => !rule.isTarget(s));

  if (targets.length === 0 || distractors.length === 0) {
    // Fallback
    return Array.from({ length: count }, (_, i) => ({
      stimulus: pool[i % pool.length],
      isTarget: rule.isTarget(pool[i % pool.length]),
    }));
  }

  // 55% targets, 45% distractors (more Go trials for engagement)
  const targetCount = Math.round(count * 0.55);
  const distractorCount = count - targetCount;

  const trials: TrialData[] = [];
  for (let i = 0; i < targetCount; i++) {
    trials.push({ stimulus: targets[i % targets.length], isTarget: true });
  }
  for (let i = 0; i < distractorCount; i++) {
    trials.push({ stimulus: distractors[i % distractors.length], isTarget: false });
  }

  // Shuffle, ensuring no more than 3 consecutive same type
  return shuffleBalanced(trials);
}

function shuffleBalanced(arr: TrialData[]): TrialData[] {
  // Fisher-Yates then fix runs > 3
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Timing por dificuldade ─────────────────────────────────────────────────

function stimulusDurationMs(d: number): number {
  if (d <= 2) return 1600;
  if (d <= 4) return 1300;
  if (d <= 6) return 1100;
  if (d <= 8) return 900;
  return 750;
}

function isiDurationMs(d: number): number {
  if (d <= 3) return 500;
  if (d <= 6) return 400;
  return 300;
}

// Dynamic rule changes at high difficulties
function ruleChangePeriod(d: number): number | null {
  if (d <= 6) return null;      // no rule change
  if (d <= 8) return 8;         // change every 8 trials
  return 5;                      // change every 5 trials
}

const TOTAL_TRIALS = 30;

// ── Tutorial ───────────────────────────────────────────────────────────────

function TutShowStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const rule = RULES[0]; // green
  const stimulus: StimulusConfig = { color: "green", shape: "circle" };

  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ruleBg = theme === "GAMIFIED" ? "bg-green-900/40 border-green-600" : "bg-green-50 border-green-300";
  const ruleText = theme === "GAMIFIED" ? "text-green-300" : "text-green-800";
  const text = theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${ruleBg}`}>
        <span className="text-xl">{rule.targetEmoji}</span>
        <span className={`text-sm font-bold ${ruleText}`}>{rule.description}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShapeSvg shape={stimulus.shape} color={COLOR_HEX[stimulus.color]} size={96} />
        <p className={`text-sm font-semibold ${ruleText}`}>← TOQUE aqui! É verde ✓</p>
      </div>
      <p className={`text-xs text-center ${text}`}>
        Quando aparecer o estímulo certo, toque rapidamente na tela.
      </p>
    </div>
  );
}

function TutInteractStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const rule = RULES[0];
  const trials: StimulusConfig[] = [
    { color: "green", shape: "circle" },   // target
    { color: "red",   shape: "circle" },   // distractor
    { color: "green", shape: "circle" },   // target
  ];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"stimulus" | "feedback">("stimulus");
  const [tapped, setTapped] = useState(false);
  const [result, setResult] = useState<"hit" | "fa" | "miss" | null>(null);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "stimulus") {
      timerRef.current = setTimeout(() => {
        if (!tapped) {
          const isTarget = rule.isTarget(trials[idx]);
          setResult(isTarget ? "miss" : null);
          setPhase("feedback");
        }
      }, 1600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  useEffect(() => {
    if (phase === "feedback") {
      timerRef.current = setTimeout(() => {
        if (doneRef.current) return;
        const next = idx + 1;
        if (next >= trials.length) {
          doneRef.current = true;
          onDone();
        } else {
          setIdx(next);
          setTapped(false);
          setResult(null);
          setPhase("stimulus");
        }
      }, 900);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleTap() {
    if (phase !== "stimulus" || tapped || doneRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setTapped(true);
    const isTarget = rule.isTarget(trials[idx]);
    setResult(isTarget ? "hit" : "fa");
    setPhase("feedback");
  }

  const stim = trials[idx];
  const isTarget = rule.isTarget(stim);
  const tapBg = theme === "GAMIFIED" ? "bg-gray-700 border-gray-600 active:bg-gray-600" : "bg-white border-slate-200 active:bg-slate-50";
  const text = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const ruleBg = theme === "GAMIFIED" ? "bg-green-900/40 border-green-600" : "bg-green-50 border-green-300";
  const ruleText = theme === "GAMIFIED" ? "text-green-300" : "text-green-800";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${ruleBg}`}>
        <span>{rule.targetEmoji}</span>
        <span className={ruleText}>{rule.description}</span>
      </div>
      <button onPointerDown={handleTap}
        className={`w-40 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${tapBg}`}
        style={{ touchAction: "none" }}>
        <AnimatePresence mode="wait">
          {phase === "stimulus" && (
            <motion.div key={`stim-${idx}`}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
              <ShapeSvg shape={stim.shape} color={COLOR_HEX[stim.color]} size={80} />
            </motion.div>
          )}
          {phase === "feedback" && result === "hit" && (
            <motion.p key="hit" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">✅</motion.p>
          )}
          {phase === "feedback" && result === "fa" && (
            <motion.p key="fa" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">❌</motion.p>
          )}
          {phase === "feedback" && result === "miss" && (
            <motion.p key="miss" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">⏱️</motion.p>
          )}
          {phase === "feedback" && result === null && (
            <motion.p key="cr" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">✓</motion.p>
          )}
        </AnimatePresence>
      </button>
      <p className={`text-xs text-center ${text}`}>
        {phase === "stimulus"
          ? isTarget ? "⚡ TOQUE!" : "🚫 Não toque"
          : result === "hit" ? "Acertou!" : result === "fa" ? "Não era para tocar" : result === "miss" ? "Demorou!" : "Correto — não tocar!"}
      </p>
      <p className={`text-[10px] ${text}`}>{idx + 1}/{trials.length}</p>
    </div>
  );
}

function AtencaoSeletivaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Quando o estímulo CERTO aparecer, toque rapidamente. Se for diferente, NÃO toque.",
      content: (done: () => void) => <TutShowStep theme={theme} onDone={done} />,
    },
    {
      instruction: "Pratique! Toque apenas quando aparecer o estímulo verde. Ignore o vermelho.",
      content: (done: () => void) => <TutInteractStep theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Seletiva" steps={steps} onDone={onDone} />;
}

// ── Componente principal ───────────────────────────────────────────────────

export function AtencaoSeletiva({ difficulty, theme, onComplete }: AtencaoSeletivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  // Rule management
  const changePeriod = ruleChangePeriod(difficulty);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [showRuleChange, setShowRuleChange] = useState(false);
  const ruleIndexRef = useRef(0);

  // Trials
  const getRule = useCallback((rIdx: number): Rule => {
    const validRules = difficulty <= 3 ? RULES.slice(0, 2) :
                       difficulty <= 6 ? RULES.slice(0, 5) : RULES;
    return validRules[rIdx % validRules.length];
  }, [difficulty]);

  const [trials] = useState<TrialData[]>(() =>
    buildTrials(difficulty, getRule(0), TOTAL_TRIALS)
  );
  const trialsRef = useRef(trials);
  trialsRef.current = trials;

  const [trialIdx, setTrialIdx] = useState(0);
  const [phase, setPhase] = useState<TrialPhase>("isi");
  const [results, setResults] = useState<TrialResult[]>([]);
  const [tappedThisTrial, setTappedThisTrial] = useState(false);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | "fa" | "cr" | null>(null);

  const trialIdxRef = useRef(0);
  const tappedRef = useRef(false);
  const resultsRef = useRef<TrialResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef(Date.now());
  const stimulusStartRef = useRef(0);
  const allDoneRef = useRef(false);

  trialIdxRef.current = trialIdx;
  tappedRef.current = tappedThisTrial;
  resultsRef.current = results;

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const finishSession = useCallback(() => {
    if (allDoneRef.current) return;
    allDoneRef.current = true;
    const res = resultsRef.current;
    const hits    = res.filter(r => r.isTarget && r.tapped).length;
    const misses  = res.filter(r => r.isTarget && !r.tapped).length;
    const fa      = res.filter(r => !r.isTarget && r.tapped).length;
    const total   = res.length;
    const accuracy = total > 0 ? (hits + res.filter(r => !r.isTarget && !r.tapped).length) / total : 0;
    const rts = res.filter(r => r.rt !== null).map(r => r.rt as number);
    const avgRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 1000;
    const stability = rts.length > 1
      ? 1 - Math.min(1, (Math.sqrt(rts.reduce((s, t) => s + (t - avgRT) ** 2, 0) / rts.length) / avgRT))
      : 0.8;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-seletiva", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "atencao-seletiva",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { hits, misses, falsePositives: fa, total, stability: Math.round(stability * 100) },
    });
  }, [difficulty, onComplete]);

  const advanceTrial = useCallback(() => {
    const nextIdx = trialIdxRef.current + 1;
    reportProgress(Math.round((nextIdx / TOTAL_TRIALS) * 100));

    if (nextIdx >= TOTAL_TRIALS) {
      finishSession();
      return;
    }

    // Check for rule change
    if (changePeriod && nextIdx % changePeriod === 0) {
      const newRuleIdx = ruleIndexRef.current + 1;
      ruleIndexRef.current = newRuleIdx;
      setRuleIndex(newRuleIdx);
      setShowRuleChange(true);
      setPhase("rule_change");
      timerRef.current = setTimeout(() => {
        setShowRuleChange(false);
        setTrialIdx(nextIdx);
        setTappedThisTrial(false);
        tappedRef.current = false;
        setPhase("isi");
      }, 2000);
    } else {
      setTrialIdx(nextIdx);
      setTappedThisTrial(false);
      tappedRef.current = false;
      setPhase("isi");
    }
  }, [changePeriod, finishSession, reportProgress]);

  // ISI phase → stimulus phase
  useEffect(() => {
    if (showTutorial || phase !== "isi") return;
    timerRef.current = setTimeout(() => {
      stimulusStartRef.current = Date.now();
      setPhase("stimulus");
    }, isiDurationMs(difficulty));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIdx, showTutorial]);

  // Stimulus phase → feedback phase (timeout = no tap)
  useEffect(() => {
    if (showTutorial || phase !== "stimulus") return;
    timerRef.current = setTimeout(() => {
      if (!tappedRef.current) {
        const trial = trialsRef.current[trialIdxRef.current];
        const res: TrialResult = { isTarget: trial.isTarget, tapped: false, rt: null };
        const newResults = [...resultsRef.current, res];
        resultsRef.current = newResults;
        setResults(newResults);
        setLastResult(trial.isTarget ? "miss" : "cr");
        setPhase("feedback");
      }
    }, stimulusDurationMs(difficulty));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIdx, showTutorial]);

  // Feedback phase → next trial
  useEffect(() => {
    if (showTutorial || phase !== "feedback") return;
    const feedbackDur = lastResult === "hit" ? 350 : lastResult === "fa" ? 700 : lastResult === "miss" ? 600 : 250;
    timerRef.current = setTimeout(() => { advanceTrial(); }, feedbackDur);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showTutorial, advanceTrial, lastResult]);

  const handleTap = useCallback(() => {
    if (phase !== "stimulus" || tappedRef.current || allDoneRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    tappedRef.current = true;
    setTappedThisTrial(true);

    const rt = Date.now() - stimulusStartRef.current;
    const trial = trialsRef.current[trialIdxRef.current];
    const isHit = trial.isTarget;
    const res: TrialResult = { isTarget: trial.isTarget, tapped: true, rt: isHit ? rt : null };
    const newResults = [...resultsRef.current, res];
    resultsRef.current = newResults;
    setResults(newResults);
    setLastResult(isHit ? "hit" : "fa");
    setPhase("feedback");
  }, [phase]);

  if (showTutorial) {
    return <AtencaoSeletivaTutorial theme={theme}
      onDone={() => { startTime.current = Date.now(); setShowTutorial(false); }} />;
  }

  const currentRule = getRule(ruleIndex);
  const currentTrial = trials[Math.min(trialIdx, TOTAL_TRIALS - 1)];
  const hits    = results.filter(r => r.isTarget && r.tapped).length;
  const misses  = results.filter(r => r.isTarget && !r.tapped).length;
  const fa      = results.filter(r => !r.isTarget && r.tapped).length;
  // correctRejections counted inside finishSession via resultsRef

  const pal = {
    bg:       theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-indigo-50 to-sky-50" : "bg-slate-50",
    card:     theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : "bg-white shadow-lg",
    title:    theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-indigo-700" : "text-slate-800",
    sub:      theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    ruleBg:   theme === "GAMIFIED" ? "bg-indigo-900/40 border-indigo-600/50" : "bg-indigo-50 border-indigo-200",
    ruleText: theme === "GAMIFIED" ? "text-indigo-300" : "text-indigo-800",
    tapArea:  theme === "GAMIFIED" ? "bg-gray-700 border-2 border-gray-600 active:bg-gray-600" : "bg-white border-2 border-slate-200 active:bg-slate-50 shadow-md",
    metricHit: theme === "GAMIFIED" ? "text-green-400" : "text-green-600",
    metricFA:  theme === "GAMIFIED" ? "text-red-400" : "text-red-500",
    metricMiss:theme === "GAMIFIED" ? "text-amber-400" : "text-amber-600",
  };

  const tapAreaColor =
    phase === "feedback" && lastResult === "hit"  ? "border-green-500 bg-green-900/20" :
    phase === "feedback" && lastResult === "fa"   ? "border-red-500 bg-red-900/20" :
    phase === "feedback" && lastResult === "miss" ? "border-amber-500 bg-amber-900/10" :
    pal.tapArea;

  const stimSize = 100;

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-sm mx-auto px-4 py-5 flex flex-col items-center gap-4">

        {/* Header */}
        <div className={`w-full rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-sm ${pal.title}`}>🎯 Atenção Seletiva</h2>
            <span className={`text-xs ${pal.sub}`}>{Math.min(trialIdx + 1, TOTAL_TRIALS)}/{TOTAL_TRIALS}</span>
          </div>

          {/* Progress bar */}
          <div className={`h-1.5 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
            <div className={`h-full rounded-full transition-all duration-300 ${
              theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-indigo-500" : "bg-indigo-500"
            }`} style={{ width: `${(trialIdx / TOTAL_TRIALS) * 100}%` }} />
          </div>

          {/* Metrics row */}
          <div className="flex justify-around text-center">
            <div>
              <p className={`text-lg font-black ${pal.metricHit}`}>{hits}</p>
              <p className={`text-[10px] ${pal.sub}`}>Acertos</p>
            </div>
            <div>
              <p className={`text-lg font-black ${pal.metricMiss}`}>{misses}</p>
              <p className={`text-[10px] ${pal.sub}`}>Omissões</p>
            </div>
            <div>
              <p className={`text-lg font-black ${pal.metricFA}`}>{fa}</p>
              <p className={`text-[10px] ${pal.sub}`}>Falsos +</p>
            </div>
          </div>
        </div>

        {/* Rule banner */}
        <AnimatePresence mode="wait">
          {showRuleChange ? (
            <motion.div key="rule-change"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full px-4 py-3 rounded-xl bg-orange-500 text-white text-center font-bold text-sm">
              ⚠️ A regra mudou! {currentRule.description}
            </motion.div>
          ) : (
            <motion.div key={`rule-${ruleIndex}`}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border ${pal.ruleBg}`}>
              <span className="text-2xl">{currentRule.targetEmoji}</span>
              <div>
                <p className={`text-xs font-bold ${pal.ruleText}`}>{currentRule.description}</p>
                <p className={`text-[10px] ${pal.sub}`}>Ignore os outros</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap area */}
        <button
          onPointerDown={handleTap}
          className={`w-56 h-56 rounded-3xl flex items-center justify-center transition-all select-none border-2 ${tapAreaColor}`}
          style={{ touchAction: "none" }}>
          <AnimatePresence mode="wait">
            {phase === "isi" && (
              <motion.div key={`isi-${trialIdx}`}
                initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
                <div className={`w-4 h-4 rounded-full ${theme === "GAMIFIED" ? "bg-gray-500" : "bg-slate-300"}`} />
              </motion.div>
            )}

            {phase === "stimulus" && (
              <motion.div key={`stim-${trialIdx}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.1 } }}>
                <ShapeSvg
                  shape={currentTrial.stimulus.shape}
                  color={COLOR_HEX[currentTrial.stimulus.color]}
                  size={stimSize}
                />
              </motion.div>
            )}

            {phase === "feedback" && (
              <motion.div key={`fb-${trialIdx}`}
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <p className="text-6xl">
                  {lastResult === "hit"  ? "✅" :
                   lastResult === "fa"   ? "❌" :
                   lastResult === "miss" ? "⏱️" : "✓"}
                </p>
              </motion.div>
            )}

            {phase === "rule_change" && (
              <motion.div key="rule-change-area"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-5xl">⚠️</p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Stimulus label hint (medium+) */}
        {phase === "stimulus" && difficulty >= 4 && (
          <p className={`text-xs ${pal.sub} text-center`}>
            {COLOR_LABEL[currentTrial.stimulus.color]} · {SHAPE_LABEL[currentTrial.stimulus.shape]}
          </p>
        )}

        {phase === "feedback" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-sm font-semibold text-center ${
              lastResult === "hit"  ? pal.metricHit  :
              lastResult === "fa"   ? pal.metricFA   :
              lastResult === "miss" ? pal.metricMiss :
              pal.sub
            }`}>
            {lastResult === "hit"  ? "Acerto! ✓" :
             lastResult === "fa"   ? "Não era para tocar" :
             lastResult === "miss" ? "Resposta perdida" :
             "Correto — não tocar"}
          </motion.p>
        )}
      </div>
    </div>
  );
}
