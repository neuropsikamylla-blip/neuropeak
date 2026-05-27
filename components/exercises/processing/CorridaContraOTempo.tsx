"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import {
  shuffleFlex, itemsByFlexCat, pickRandomDomain,
  type FlexDomain, type FlexItem, type FlexCategory,
} from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

interface GridItem extends FlexItem { isTarget: boolean; collected: boolean; }

const MAX_ROUNDS = 8;

function gridCount(d: number) { return d <= 4 ? 12 : 16; }
function targetCount(d: number) { return d <= 3 ? 4 : d <= 6 ? 5 : 6; }
function timeSecs(d: number) { return d <= 3 ? 25 : d <= 6 ? 20 : 15; }

function buildGrid(domain: FlexDomain, cat: FlexCategory, d: number): GridItem[] {
  const nT = targetCount(d);
  const size = gridCount(d);
  const targets = shuffleFlex(itemsByFlexCat(domain, cat.id)).slice(0, nT);
  const dist = shuffleFlex(domain.items.filter(i => i.cat !== cat.id)).slice(0, size - nT);
  return shuffleFlex([
    ...targets.map(t => ({ ...t, isTarget: true, collected: false })),
    ...dist.map(t => ({ ...t, isTarget: false, collected: false })),
  ]);
}

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const ITEMS: GridItem[] = [
    { id: "banana",  name: "Banana",  cat: "hortifruti", price: 3.90, isTarget: true,  collected: false },
    { id: "sabao",   name: "Sabão",   cat: "higiene",    price: 18.90, isTarget: false, collected: false },
    { id: "maca",    name: "Maçã",    cat: "hortifruti", price: 6.90, isTarget: true,  collected: false },
    { id: "refri",   name: "Refri",   cat: "bebidas",    price: 8.90, isTarget: false, collected: false },
    { id: "cenoura", name: "Cenoura", cat: "hortifruti", price: 4.90, isTarget: true,  collected: false },
    { id: "cafe",    name: "Café",    cat: "mercearia",  price: 11.90, isTarget: false, collected: false },
  ];
  const catLabel = "Hortifruti";
  const catEmoji = "🥦";
  const [col, setCol] = useState(new Set<string>());
  const doneRef = useRef(false);

  function tap(id: string, isTarget: boolean) {
    if (!isTarget || col.has(id) || doneRef.current) return;
    const n = new Set([...col, id]);
    setCol(n);
    if (n.size === ITEMS.filter(i => i.isTarget).length) {
      doneRef.current = true;
      setTimeout(onDone, 500);
    }
  }

  return (
    <div>
      <div className={`flex items-center gap-2 justify-center mb-3 px-3 py-2 rounded-xl ${
        theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600" : "bg-amber-50 border border-amber-200"
      }`}>
        <span className="text-xl">{catEmoji}</span>
        <span className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>
          Colete: {catLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ITEMS.map(item => (
          <button key={item.id} onClick={() => tap(item.id, item.isTarget)}
            disabled={col.has(item.id)}
            className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-90 ${
              col.has(item.id) ? "border-green-500 bg-green-50 opacity-50" :
              item.isTarget
                ? (theme === "GAMIFIED" ? "border-cyan-400 bg-gray-700 ring-2 ring-cyan-400/40" : "border-green-300 bg-green-50 ring-2 ring-green-200")
                : (theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-white")
            }`}
          >
            <ItemSvg id={item.id} size={32} />
            <span className={`text-xs text-center leading-none ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
              {item.name}
            </span>
            {col.has(item.id) && <span className="text-xs text-green-600 font-bold">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

type Phase = "ready" | "playing" | "feedback";

export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const domainRef = useRef<FlexDomain>(pickRandomDomain());
  const [round, setRound] = useState(0);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; hits: number; total: number }[]>([]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [targetCat, setTargetCat] = useState<FlexCategory>(domainRef.current.categories[0]);
  const [items, setItems] = useState<GridItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeSecs(difficulty));
  const [wrongFlash, setWrongFlash] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndedRef = useRef(false);
  const hitsRef = useRef(0);
  const totalRef = useRef(0);
  const roundRef = useRef(0);
  const resultsRef = useRef<{ correct: boolean; hits: number; total: number }[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function finishRound(hits: number) {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const total = totalRef.current;
    const isCorrect = total > 0 && hits / total >= 0.6;
    const newResults = [...resultsRef.current, { correct: isCorrect, hits, total }];
    resultsRef.current = newResults;
    setRoundResults(newResults);

    const nextRound = roundRef.current + 1;
    reportProgress(Math.round((nextRound / MAX_ROUNDS) * 100));
    setPhase("feedback");

    setTimeout(() => {
      if (nextRound >= MAX_ROUNDS) {
        const accuracy = newResults.filter(r => r.correct).length / MAX_ROUNDS;
        onComplete({
          exerciseId: "corrida-tempo",
          domain: "processing",
          score: calculateExerciseScore("corrida-tempo", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { rounds: MAX_ROUNDS, correct: newResults.filter(r => r.correct).length },
        });
      } else {
        roundRef.current = nextRound;
        setRound(nextRound);
        startRound();
      }
    }, 1500);
  }

  function startRound() {
    if (roundRef.current % 3 === 0 && roundRef.current > 0) {
      domainRef.current = pickRandomDomain();
    }
    const domain = domainRef.current;
    const cats = domain.categories;
    const cat = cats[Math.floor(Math.random() * cats.length)];
    const newItems = buildGrid(domain, cat, difficulty);
    roundEndedRef.current = false;
    hitsRef.current = 0;
    totalRef.current = newItems.filter(i => i.isTarget).length;
    setTargetCat(cat);
    setItems(newItems);
    setTimeLeft(timeSecs(difficulty));
    setPhase("playing");
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishRound(hitsRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, round]);

  function handleTap(item: GridItem) {
    if (phase !== "playing" || item.collected || roundEndedRef.current) return;
    if (item.isTarget) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, collected: true } : i));
      hitsRef.current++;
      if (hitsRef.current >= totalRef.current) finishRound(hitsRef.current);
    } else {
      setWrongFlash(prev => new Set([...prev, item.id]));
      setTimeout(() => setWrongFlash(prev => { const n = new Set(prev); n.delete(item.id); return n; }), 400);
    }
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Corrida contra o Tempo"
      steps={[{ instruction: "Toque APENAS nos itens da categoria indicada antes que o tempo acabe!", content: (done) => <TutStep theme={theme} onDone={done} /> }]}
      onDone={() => setShowTutorial(false)} />;
  }

  const bg = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-gray-50";
  const card = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg";
  const titleClass = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-red-700" : "text-gray-900";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const tl = timeSecs(difficulty);
  const timerRatio = timeLeft / tl;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";
  const domain = domainRef.current;

  return (
    <div className={`min-h-screen flex flex-col items-center p-3 pt-5 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-4 ${card}`}>

        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-base ${titleClass}`}>⏱️ Corrida contra o Tempo</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
                <path d="M3 3 L7 3 L10 18 L26 18 L29 8 L10 8" stroke={theme === "GAMIFIED" ? "#22d3ee" : "#ef4444"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="22" r="2.5" fill={theme === "GAMIFIED" ? "#22d3ee" : "#ef4444"}/>
                <circle cx="23" cy="22" r="2.5" fill={theme === "GAMIFIED" ? "#22d3ee" : "#ef4444"}/>
              </svg>
              {phase === "playing" && hitsRef.current > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {hitsRef.current}
                </span>
              )}
            </div>
            <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 5 ? "text-red-500 animate-pulse" : subClass}`}>{timeLeft}s</span>
          </div>
        </div>

        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < roundResults.length
                ? roundResults[i].correct ? "bg-green-500" : "bg-red-400"
                : i === round ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-4">
              <p className={`text-sm ${subClass}`}>Localize e toque todos os itens da categoria indicada antes do tempo acabar!</p>
              <button onClick={startRound} className={`px-8 py-3 rounded-xl font-bold text-white ${
                theme === "GAMIFIED" ? "bg-cyan-600" : theme === "COLORFUL" ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-red-500"
              }`}>⏱️ Começar</button>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div key={`play-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl mb-2 ${
                theme === "GAMIFIED" ? "bg-cyan-900/40 border border-cyan-600/40" : "bg-amber-50 border border-amber-200"
              }`}>
                <span className="text-2xl">{targetCat.emoji}</span>
                <span className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>
                  {domain.collectVerb}: {targetCat.label}
                </span>
              </div>

              <div className={`h-2 rounded-full mb-3 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {items.map(item => (
                  <motion.button key={item.id} onPointerDown={() => handleTap(item)}
                    disabled={item.collected || roundEndedRef.current}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      item.collected ? "border-green-500 bg-green-50 opacity-40" :
                      wrongFlash.has(item.id) ? "border-red-500 bg-red-100" :
                      theme === "GAMIFIED" ? "border-gray-600 bg-gray-700 active:scale-90" : "border-slate-200 bg-white active:scale-90 shadow-sm"
                    }`}
                    animate={wrongFlash.has(item.id) ? { x: [-3, 3, -3, 3, 0] } : item.collected ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.25 }}
                  >
                    <ItemSvg id={item.id} size={32} />
                    <span className={`text-xs text-center leading-tight font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                    {item.collected && <span className="text-sm text-green-600 font-bold">🛒</span>}
                  </motion.button>
                ))}
              </div>
              <p className={`text-sm text-center mt-2 font-medium ${subClass}`}>
                🛒 {hitsRef.current}/{totalRef.current} coletados
              </p>
            </motion.div>
          )}

          {phase === "feedback" && (
            <motion.div key={`fb-${round}`} className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              {roundResults.length > 0 && (() => {
                const r = roundResults[roundResults.length - 1];
                return <>
                  <p className="text-5xl mb-2">{r.correct ? "✅" : "❌"}</p>
                  <p className={`font-bold text-lg ${r.correct ? "text-green-600" : "text-red-500"}`}>
                    {r.hits}/{r.total} coletados
                  </p>
                  <p className={`text-xs mt-1 ${subClass}`}>{r.correct ? "Bom trabalho!" : "Continue tentando!"}</p>
                </>;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
