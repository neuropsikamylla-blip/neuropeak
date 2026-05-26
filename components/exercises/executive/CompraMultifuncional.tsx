"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import {
  shuffleFlex, fmt, pickRandomDomain,
  type FlexDomain, type FlexItem,
} from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_ROUNDS = 8;

type QType = "yn-total" | "mc-item" | "mc-total";
type Phase = "showing" | "answering" | "feedback";

interface Round {
  domain: FlexDomain;
  items: FlexItem[];
  showSecs: number;
  question: string;
  qType: QType;
  correctAnswer: string;
  choices?: string[];
}

function itemCount(d: number): number {
  return d <= 3 ? 3 : d <= 6 ? 4 : 5;
}

function showSecs(d: number): number {
  return d <= 3 ? 9 : d <= 6 ? 7 : 5;
}

function generateWrongTotals(total: number): string[] {
  const scale = Math.max(4, total * 0.12);
  const candidates = [
    total + scale,
    total - scale * 0.8,
    total + scale * 1.8,
    total - scale * 1.4,
    total + scale * 0.5,
  ].map(v => Math.round(v * 100) / 100).filter(v => v > 0);

  const seen = new Set([total]);
  const result: string[] = [];
  for (const v of shuffleFlex(candidates)) {
    if (!seen.has(v)) {
      seen.add(v);
      result.push(fmt(v));
      if (result.length === 3) break;
    }
  }
  return result;
}

function buildRound(d: number): Round {
  const domain = pickRandomDomain();
  const count = itemCount(d);
  const secs = showSecs(d);
  const items = shuffleFlex(domain.items).slice(0, count);
  const total = Math.round(items.reduce((s, i) => s + i.price, 0) * 100) / 100;

  let question: string;
  let qType: QType;
  let correctAnswer: string;
  let choices: string[] | undefined;

  if (d <= 4) {
    qType = "yn-total";
    const makeTrue = Math.random() < 0.5;
    const scale = Math.max(3, total * 0.15);
    const threshold = makeTrue
      ? Math.round((total - scale * (0.8 + Math.random() * 0.4)) * 10) / 10
      : Math.round((total + scale * (0.8 + Math.random() * 0.4)) * 10) / 10;
    question = `O total de todos os itens passa de ${fmt(threshold)}?`;
    correctAnswer = makeTrue ? "SIM" : "NÃO";
  } else if (d <= 7) {
    qType = "mc-item";
    const mostExpensive = items.reduce((a, b) => (a.price > b.price ? a : b));
    question = "Qual item custa mais?";
    choices = shuffleFlex(items.map(i => i.name));
    correctAnswer = mostExpensive.name;
  } else {
    qType = "mc-total";
    question = "Qual é o total de todos os itens?";
    const correctFmt = fmt(total);
    choices = shuffleFlex([correctFmt, ...generateWrongTotals(total)]);
    correctAnswer = correctFmt;
  }

  return { domain, items, showSecs: secs, question, qType, correctAnswer, choices };
}

// ── Tutorial ───────────────────────────────────────────────────────────────

const TUT_ITEMS: FlexItem[] = [
  { id: "leite",  name: "Leite",  cat: "laticinios", price: 5.90 },
  { id: "cafe",   name: "Café",   cat: "mercearia",  price: 11.90 },
  { id: "banana", name: "Banana", cat: "hortifruti", price: 3.90 },
];

function TutShowStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(iv); onDone(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onDone]);

  const text = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const accent = theme === "GAMIFIED" ? "text-cyan-400" : "text-emerald-600";
  const cardBg = theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-white border-slate-200";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className={`text-sm font-bold ${text}`}>Memorize os preços!</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs tabular-nums ${accent}`}>{countdown}s</span>
          <button onClick={onDone}
            className={`text-xs px-2 py-0.5 rounded font-bold ${theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-amber-500 text-white"}`}>
            Pronto →
          </button>
        </div>
      </div>
      {TUT_ITEMS.map(item => (
        <div key={item.id} className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${cardBg}`}>
          <div className="flex items-center gap-3">
            <ItemSvg id={item.id} size={44} />
            <span className={`font-semibold ${text}`}>{item.name}</span>
          </div>
          <span className={`font-bold text-lg ${accent}`}>{fmt(item.price)}</span>
        </div>
      ))}
    </div>
  );
}

function TutAnswerStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const doneRef = useRef(false);
  const total = TUT_ITEMS.reduce((s, i) => s + i.price, 0); // 21.70
  const threshold = 18.00;

  function answer(a: string) {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  const text = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-3 border text-center ${
        theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-violet-50 border-violet-200"
      }`}>
        <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-300" : "text-violet-800"}`}>
          O total de todos os itens passa de {fmt(threshold)}?
        </p>
      </div>
      <p className={`text-center text-xs ${sub}`}>
        Leite {fmt(5.90)} + Café {fmt(11.90)} + Banana {fmt(3.90)} = {fmt(total)} → SIM
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => answer("SIM")}
          className="h-14 rounded-2xl font-bold text-xl bg-green-500 hover:bg-green-600 text-white transition-all active:scale-95">
          SIM ✓
        </button>
        <button onClick={() => answer("NÃO")}
          className="h-14 rounded-2xl font-bold text-xl bg-red-400 hover:bg-red-500 text-white transition-all active:scale-95">
          NÃO ✗
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<Phase>("showing");
  const [countdown, setCountdown] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<Round>(() => buildRound(difficulty));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const startTime = useRef(Date.now());
  const roundRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Showing phase countdown
  useEffect(() => {
    if (phase !== "showing" || showTutorial) return;
    setCountdown(currentRound.showSecs);
    timerRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) {
          clearInterval(timerRef.current!);
          setPhase("answering");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, showTutorial]);

  function skipToAnswering() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("answering");
  }

  function handleAnswer(answer: string) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelectedAnswer(answer);

    const isCorrect = answer === currentRound.correctAnswer;
    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setRoundResults(newResults);
    setPhase("feedback");

    const nextR = roundRef.current + 1;
    reportProgress(Math.round((nextR / MAX_ROUNDS) * 100));

    setTimeout(() => {
      if (nextR >= MAX_ROUNDS) {
        const accuracy = newResults.filter(Boolean).length / MAX_ROUNDS;
        onComplete({
          exerciseId: "compra-multifuncional",
          domain: "executive",
          score: calculateExerciseScore("compra-multifuncional", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(Boolean).length },
        });
      } else {
        roundRef.current = nextR;
        setRound(nextR);
        answeredRef.current = false;
        setSelectedAnswer(null);
        setCurrentRound(buildRound(difficulty));
        setPhase("showing");
      }
    }, 2000);
  }

  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Conta Mental"
        steps={[
          {
            instruction: "Os itens aparecem com seus preços. Memorize bem — eles vão sumir!",
            content: (done) => <TutShowStep theme={theme} onDone={done} />,
          },
          {
            instruction: "Os preços sumiram! Responda a pergunta sobre os valores.",
            content: (done) => <TutAnswerStep theme={theme} onDone={done} />,
          },
        ]}
        onDone={() => setShowTutorial(false)} />
    );
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-purple-50" : "bg-gradient-to-br from-slate-50 to-blue-50/20",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : theme === "COLORFUL" ? "bg-white border-2 border-violet-200 shadow-xl" : "bg-white border border-slate-200/70 shadow-md",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    accent: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-600" : "text-violet-600",
    itemCard: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-white border-slate-200 shadow-sm",
    qBox: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : theme === "COLORFUL" ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-200",
    choiceBtn: theme === "GAMIFIED" ? "bg-gray-700 border border-gray-500 text-gray-100 hover:border-cyan-400" : "bg-white border-2 border-slate-200 text-gray-800 hover:border-violet-400 shadow-sm",
    dotActive: theme === "GAMIFIED" ? "bg-cyan-500" : "bg-violet-500",
    dotInactive: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200",
  };

  const showRatio = currentRound.showSecs > 0 ? countdown / currentRound.showSecs : 0;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl p-5 sm:p-6 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🧮 Conta Mental</h2>
          <span className={`text-xs ${pal.sub}`}>{round + 1}/{MAX_ROUNDS}</span>
        </div>

        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < roundResults.length
                ? roundResults[i] ? "bg-green-500" : "bg-red-400"
                : i === round ? `${pal.dotActive} animate-pulse` : pal.dotInactive
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* FASE: Mostrar itens com preços */}
          {phase === "showing" && (
            <motion.div key={`show-${round}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className={`text-sm font-bold ${pal.title}`}>Memorize os preços!</p>
                  <p className={`text-xs ${pal.sub}`}>{currentRound.domain.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm tabular-nums font-mono font-bold ${pal.accent}`}>{countdown}s</span>
                  <button onClick={skipToAnswering}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                      theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-amber-500 text-white"
                    }`}>
                    Pronto →
                  </button>
                </div>
              </div>

              <div className={`h-1.5 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
                <div className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                  style={{ width: `${showRatio * 100}%` }} />
              </div>

              <div className="space-y-2">
                {currentRound.items.map((item, idx) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${pal.itemCard}`}>
                    <div className="flex items-center gap-3">
                      <ItemSvg id={item.id} size={52} />
                      <span className={`font-semibold text-sm ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`font-bold text-lg tabular-nums ${pal.accent}`}>
                      {fmt(item.price)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* FASE: Responder */}
          {phase === "answering" && (
            <motion.div key={`ans-${round}`}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

              {/* Items sem preço */}
              <div className="space-y-2 mb-5">
                {currentRound.items.map(item => (
                  <div key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${pal.itemCard}`}>
                    <div className="flex items-center gap-3">
                      <ItemSvg id={item.id} size={52} />
                      <span className={`font-semibold text-sm ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-gray-600" : "text-gray-300"}`}>
                      ???
                    </span>
                  </div>
                ))}
              </div>

              {/* Pergunta */}
              <div className={`rounded-xl p-4 mb-4 border text-center ${pal.qBox}`}>
                <p className={`font-bold text-base ${theme === "GAMIFIED" ? "text-cyan-300" : "text-slate-800"}`}>
                  {currentRound.question}
                </p>
              </div>

              {/* Botões SIM/NÃO */}
              {currentRound.qType === "yn-total" && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleAnswer("SIM")}
                    className="h-16 rounded-2xl font-bold text-xl bg-green-500 hover:bg-green-600 text-white transition-all active:scale-95 shadow-md">
                    SIM ✓
                  </button>
                  <button onClick={() => handleAnswer("NÃO")}
                    className="h-16 rounded-2xl font-bold text-xl bg-red-400 hover:bg-red-500 text-white transition-all active:scale-95 shadow-md">
                    NÃO ✗
                  </button>
                </div>
              )}

              {/* Múltipla escolha */}
              {(currentRound.qType === "mc-item" || currentRound.qType === "mc-total") && currentRound.choices && (
                <div className="grid grid-cols-2 gap-2">
                  {currentRound.choices.map(choice => (
                    <button key={choice} onClick={() => handleAnswer(choice)}
                      className={`h-14 rounded-xl font-bold text-sm transition-all active:scale-95 ${pal.choiceBtn}`}>
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* FASE: Feedback */}
          {phase === "feedback" && (
            <motion.div key={`fb-${round}`}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

              <div className="text-center mb-4">
                <p className="text-4xl mb-1">
                  {selectedAnswer === currentRound.correctAnswer ? "✅" : "❌"}
                </p>
                <p className={`font-bold text-lg ${
                  selectedAnswer === currentRound.correctAnswer ? "text-green-600" : "text-red-500"
                }`}>
                  {selectedAnswer === currentRound.correctAnswer ? "Correto!" : "Errado!"}
                </p>
                {selectedAnswer !== currentRound.correctAnswer && (
                  <p className={`text-sm mt-1 ${pal.sub}`}>
                    Resposta: <strong className={pal.accent}>{currentRound.correctAnswer}</strong>
                  </p>
                )}
              </div>

              {/* Preços revelados */}
              <div className="space-y-2">
                {currentRound.items.map(item => (
                  <div key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${pal.itemCard}`}>
                    <div className="flex items-center gap-3">
                      <ItemSvg id={item.id} size={40} />
                      <span className={`font-semibold text-sm ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`font-bold tabular-nums ${pal.accent}`}>
                      {fmt(item.price)}
                    </span>
                  </div>
                ))}
                <div className={`flex justify-between items-center p-2.5 rounded-xl font-bold text-sm ${
                  theme === "GAMIFIED" ? "bg-gray-700 text-gray-100" : "bg-violet-50 text-violet-800 border border-violet-200"
                }`}>
                  <span>Total:</span>
                  <span className="tabular-nums">
                    {fmt(currentRound.items.reduce((s, i) => s + i.price, 0))}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
