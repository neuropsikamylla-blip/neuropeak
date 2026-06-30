"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface TaskSwitchingProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────

type CardColor = "VERMELHO" | "AZUL";
type CardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CardShape = "CÍRCULO" | "TRIÂNGULO";
type RuleType = "COR" | "NÚMERO" | "FORMA";

interface Card {
  color: CardColor;
  number: CardNumber;
  shape: CardShape;
}

interface Trial {
  card: Card;
  rule: RuleType;
  isFirstAfterSwitch: boolean;
  correctSide: "left" | "right";
}

interface TrialResult {
  correct: boolean;
  rt: number;
  isFirstAfterSwitch: boolean;
}

// ── Rules ──────────────────────────────────────────────────────────────────

const RULES: RuleType[] = ["COR", "NÚMERO", "FORMA"];

function getLabels(rule: RuleType): [string, string] {
  switch (rule) {
    case "COR": return ["VERMELHO", "AZUL"];
    case "NÚMERO": return ["ÍMPAR", "PAR"];
    case "FORMA": return ["CÍRCULO", "TRIÂNGULO"];
  }
}

function getCorrectSide(card: Card, rule: RuleType): "left" | "right" {
  switch (rule) {
    case "COR": return card.color === "VERMELHO" ? "left" : "right";
    case "NÚMERO": return card.number % 2 !== 0 ? "left" : "right";
    case "FORMA": return card.shape === "CÍRCULO" ? "left" : "right";
  }
}

// ── Card SVG ──────────────────────────────────────────────────────────────

function CardSvg({ card, size = 80 }: { card: Card; size?: number }) {
  const colorHex = card.color === "VERMELHO" ? "#ef4444" : "#3b82f6";
  const c = size / 2;
  const r = size * 0.38;
  const sw = Math.max(2, size * 0.04);

  return (
    <div className="flex flex-col items-center gap-1">
      {card.shape === "CÍRCULO" ? (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={c} cy={c} r={r} fill={colorHex} stroke="white" strokeWidth={sw} />
          <text x={c} y={c + size * 0.12} textAnchor="middle"
            fill="white" fontSize={size * 0.38} fontWeight="900" fontFamily="sans-serif">
            {card.number}
          </text>
        </svg>
      ) : (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon
            points={`${c},${size * 0.08} ${size * 0.9},${size * 0.88} ${size * 0.1},${size * 0.88}`}
            fill={colorHex} stroke="white" strokeWidth={sw}
          />
          <text x={c} y={size * 0.7} textAnchor="middle"
            fill="white" fontSize={size * 0.32} fontWeight="900" fontFamily="sans-serif">
            {card.number}
          </text>
        </svg>
      )}
    </div>
  );
}

// ── Sequence generation ────────────────────────────────────────────────────

function randomCard(): Card {
  const colors: CardColor[] = ["VERMELHO", "AZUL"];
  const shapes: CardShape[] = ["CÍRCULO", "TRIÂNGULO"];
  return {
    color: colors[Math.floor(Math.random() * 2)],
    number: (Math.floor(Math.random() * 9) + 1) as CardNumber,
    shape: shapes[Math.floor(Math.random() * 2)],
  };
}

function buildTrials(difficulty: number): Trial[] {
  const BLOCKS = 10;
  const trials: Trial[] = [];
  let currentRule: RuleType = RULES[Math.floor(Math.random() * RULES.length)];

  for (let block = 0; block < BLOCKS; block++) {
    const blockSize = 4 + Math.floor(Math.random() * 3); // 4-6
    // switch rule between blocks
    if (block > 0) {
      const otherRules = RULES.filter(r => r !== currentRule);
      currentRule = otherRules[Math.floor(Math.random() * otherRules.length)];
    }
    for (let t = 0; t < blockSize; t++) {
      const card = randomCard();
      trials.push({
        card,
        rule: currentRule,
        isFirstAfterSwitch: t === 0 && block > 0,
        correctSide: getCorrectSide(card, currentRule),
      });
    }
  }
  return trials;
}

// ── Tutorial ──────────────────────────────────────────────────────────────

function TutStep1({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card: Card = { color: "VERMELHO", number: 3, shape: "CÍRCULO" };
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
        theme === "GAMIFIED" ? "bg-teal-900/50 text-teal-300 border border-teal-600" : "bg-teal-50 text-teal-800 border border-teal-300"
      }`}>
        Regra: COR — Vermelho → Esq &nbsp;|&nbsp; Azul → Dir
      </div>
      <CardSvg card={card} size={90} />
      <p className={`text-xs text-center ${sub}`}>Esta carta é VERMELHA → resposta: ESQUERDA</p>
    </div>
  );
}

function TutStep2({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const card: Card = { color: "AZUL", number: 4, shape: "TRIÂNGULO" };
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<"ok" | "err" | null>(null);

  function handleClick(side: "left" | "right") {
    if (answered) return;
    setAnswered(true);
    // Regra NÚMERO: 4 é par → direita
    setResult(side === "right" ? "ok" : "err");
    setTimeout(onDone, 800);
  }

  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const ruleBg = theme === "GAMIFIED" ? "bg-indigo-900/40 text-indigo-300 border-indigo-600" : "bg-indigo-50 text-indigo-800 border-indigo-300";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`px-4 py-2 rounded-xl font-bold text-xs border ${ruleBg}`}>
        Regra: NÚMERO — Ímpar → Esq &nbsp;|&nbsp; Par → Dir
      </div>
      <CardSvg card={card} size={80} />
      <p className={`text-xs ${sub}`}>O número é 4 — par ou ímpar?</p>
      <div className="flex gap-4">
        {(["left", "right"] as const).map(side => (
          <button key={side} onClick={() => handleClick(side)}
            className={`px-6 py-2 rounded-xl font-bold text-sm ${
              theme === "GAMIFIED" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
            } ${result && answered ? (
              side === "right" ? "ring-2 ring-green-500" : side === "left" && result === "err" ? "ring-2 ring-red-500" : ""
            ) : ""}`}>
            {side === "left" ? "← ÍMPAR" : "PAR →"}
          </button>
        ))}
      </div>
      {result && (
        <p className={`text-xs font-bold ${result === "ok" ? "text-green-500" : "text-red-500"}`}>
          {result === "ok" ? "✓ Correto!" : "✗ 4 é par → direita"}
        </p>
      )}
    </div>
  );
}

function TaskSwitchingTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Uma carta aparece na tela. Classifique-a seguindo a REGRA mostrada no topo.",
      content: (done: () => void) => <TutStep1 theme={theme} onDone={done} />,
    },
    {
      instruction: "Pratique! A regra pode mudar entre rodadas — fique atento!",
      content: (done: () => void) => <TutStep2 theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Task Switching" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function TaskSwitching({ difficulty, theme, onComplete }: TaskSwitchingProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [trials] = useState<Trial[]>(() => buildTrials(difficulty));
  const [trialIdx, setTrialIdx] = useState(0);
  const [phase, setPhase] = useState<"stimulus" | "feedback" | "switchBanner">("stimulus");
  const [results, setResults] = useState<TrialResult[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);

  const stimulusStart = useRef(Date.now());
  const startTime = useRef(Date.now());
  const allDoneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOTAL = trials.length;
  const announced = difficulty <= 5; // announce rule change at lower difficulties

  const finishSession = useCallback((finalResults: TrialResult[]) => {
    if (allDoneRef.current) return;
    allDoneRef.current = true;
    const hits = finalResults.filter(r => r.correct).length;
    finish();
    const tot = finalResults.length;
    const accuracy = tot > 0 ? hits / tot : 0;
    const rts = finalResults.map(r => r.rt);
    const avgRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 1000;

    // Switch cost: accuracy switch vs non-switch
    const switchTrials = finalResults.filter(r => r.isFirstAfterSwitch);
    const nonSwitchTrials = finalResults.filter(r => !r.isFirstAfterSwitch);
    const accSwitch = switchTrials.length > 0 ? switchTrials.filter(r => r.correct).length / switchTrials.length : accuracy;
    const accNonSwitch = nonSwitchTrials.length > 0 ? nonSwitchTrials.filter(r => r.correct).length / nonSwitchTrials.length : accuracy;
    const switchCost = Math.round((accNonSwitch - accSwitch) * 100);

    const duration = elapsedSec();
    const score = calculateExerciseScore("task-switching", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "task-switching",
      domain: "executive",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { hits, errors: tot - hits, switchCost, total: tot },
    });
  }, [difficulty, onComplete, finish, elapsedSec]);

  const advance = useCallback((res: TrialResult[]) => {
    const next = trialIdx + 1;
    if (isTimeUp()) {
      finishSession(res);
      return;
    }
    const nextTrial = trials[next % TOTAL];
    if (nextTrial.isFirstAfterSwitch && announced) {
      setShowSwitch(true);
      setPhase("switchBanner");
      timerRef.current = setTimeout(() => {
        setShowSwitch(false);
        setTrialIdx(next);
        setPhase("stimulus");
        stimulusStart.current = Date.now();
      }, 2000);
    } else {
      setTrialIdx(next);
      setPhase("stimulus");
      stimulusStart.current = Date.now();
    }
  }, [trialIdx, TOTAL, trials, announced, isTimeUp, finishSession]);

  function handleAnswer(side: "left" | "right") {
    if (phase !== "stimulus" || allDoneRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const rt = Date.now() - stimulusStart.current;
    const trial = trials[trialIdx % TOTAL];
    const correct = side === trial.correctSide;
    setLastCorrect(correct);
    const res: TrialResult = { correct, rt, isFirstAfterSwitch: trial.isFirstAfterSwitch };
    const newResults = [...results, res];
    setResults(newResults);
    setPhase("feedback");
    timerRef.current = setTimeout(() => {
      advance(newResults);
    }, 500);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (!showTutorial) {
      startTime.current = Date.now();
      stimulusStart.current = Date.now();
    }
  }, [showTutorial]);

  if (showTutorial) {
    return <TaskSwitchingTutorial theme={theme}
      onDone={() => { startTime.current = Date.now(); begin(); setShowTutorial(false); }} />;
  }

  const trial = trials[trialIdx % TOTAL];
  const [leftLabel, rightLabel] = getLabels(trial.rule);
  const hits = results.filter(r => r.correct).length;
  const errors = results.filter(r => !r.correct).length;

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-teal-50 to-cyan-50" : "bg-slate-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-teal-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    ruleBg: theme === "GAMIFIED" ? "bg-teal-900/40 border-teal-600/50" : "bg-teal-50 border-teal-200",
    ruleText: theme === "GAMIFIED" ? "text-teal-300" : "text-teal-800",
    btn: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600 text-white active:bg-gray-600" : "bg-white border-slate-300 text-slate-800 active:bg-slate-50 shadow",
    hit: theme === "GAMIFIED" ? "text-green-400" : "text-green-600",
    err: theme === "GAMIFIED" ? "text-red-400" : "text-red-500",
  };

  const ruleColor =
    trial.rule === "COR" ? (theme === "GAMIFIED" ? "text-red-400" : "text-red-600") :
    trial.rule === "NÚMERO" ? (theme === "GAMIFIED" ? "text-blue-400" : "text-blue-600") :
    (theme === "GAMIFIED" ? "text-purple-400" : "text-purple-600");

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-md mx-auto px-4 py-5 flex flex-col items-center gap-4">

        {/* Header */}
        <div className={`w-full rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-sm ${pal.title}`}>🔄 Task Switching</h2>
          </div>
          <div className="mb-3"><ExerciseProgressBar progressPct={progressPct} theme={theme} /></div>
          <div className="flex justify-around text-center">
            <div><p className={`text-lg font-black ${pal.hit}`}>{hits}</p><p className={`text-[10px] ${pal.sub}`}>Acertos</p></div>
            <div><p className={`text-lg font-black ${pal.err}`}>{errors}</p><p className={`text-[10px] ${pal.sub}`}>Erros</p></div>
          </div>
        </div>

        {/* Rule banner */}
        <AnimatePresence mode="wait">
          {showSwitch ? (
            <motion.div key="switch"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full px-4 py-3 rounded-xl bg-orange-500 text-white text-center font-bold text-sm">
              ⚠️ Regra mudou: {trial.rule}
            </motion.div>
          ) : (
            <motion.div key={`rule-${trial.rule}`}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border ${pal.ruleBg}`}>
              <div>
                <p className={`text-xs font-bold ${pal.ruleText}`}>
                  Regra: <span className={`font-black ${ruleColor}`}>{trial.rule}</span>
                </p>
                <p className={`text-[10px] ${pal.sub}`}>{leftLabel} → Esq &nbsp;|&nbsp; {rightLabel} → Dir</p>
              </div>
              {trial.isFirstAfterSwitch && !announced && (
                <span className="ml-auto text-xs font-bold text-orange-500">NOVA REGRA</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card display */}
        <AnimatePresence mode="wait">
          {phase !== "switchBanner" && (
            <motion.div key={`card-${trialIdx}`}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className={`w-40 h-40 rounded-3xl flex items-center justify-center border-2 ${
                phase === "feedback"
                  ? lastCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                  : theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-white border-slate-200 shadow-md"
              }`}>
              {phase === "feedback" ? (
                <span className="text-6xl">{lastCorrect ? "✅" : "❌"}</span>
              ) : (
                <CardSvg card={trial.card} size={100} />
              )}
            </motion.div>
          )}
          {phase === "switchBanner" && (
            <motion.div key="switch-area" className="w-40 h-40 rounded-3xl flex items-center justify-center">
              <span className="text-6xl">⚠️</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer buttons */}
        {phase === "stimulus" && (
          <div className="flex gap-4 w-full">
            <button
              onPointerDown={() => handleAnswer("left")}
              className={`flex-1 py-4 rounded-2xl border-2 font-bold text-sm transition-all ${pal.btn}`}
              style={{ touchAction: "none" }}>
              ← {leftLabel}
            </button>
            <button
              onPointerDown={() => handleAnswer("right")}
              className={`flex-1 py-4 rounded-2xl border-2 font-bold text-sm transition-all ${pal.btn}`}
              style={{ touchAction: "none" }}>
              {rightLabel} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
