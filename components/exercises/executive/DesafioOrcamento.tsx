"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import {
  shuffleFlex, itemsByFlexCat, pickRandomDomain, ALL_DOMAINS,
  type FlexDomain, type FlexCategory, type FlexItem,
} from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const ITEMS_PER_SESSION = 12;

function secsPerItem(d: number): number {
  return d >= 7 ? 4 : 5;
}

interface SessionItem {
  item: FlexItem;
  isTarget: boolean;
}

interface Session {
  domain: FlexDomain;
  targetCategory: FlexCategory;
  items: SessionItem[];
}

function buildSession(d: number): Session {
  const domain = pickRandomDomain();
  const catIdx = Math.floor(Math.random() * domain.categories.length);
  const targetCategory = domain.categories[catIdx];

  const targets = shuffleFlex(itemsByFlexCat(domain, targetCategory.id)).slice(0, 6);

  let distractorItems: FlexItem[];
  if (d <= 4) {
    // Distractors from a completely different domain
    const others = ALL_DOMAINS.filter(dom => dom.id !== domain.id);
    const otherDomain = others[Math.floor(Math.random() * others.length)];
    distractorItems = shuffleFlex(otherDomain.items).slice(0, 6);
  } else {
    // Distractors from same domain, different categories
    const sameButOther = domain.items.filter(i => i.cat !== targetCategory.id);
    distractorItems = shuffleFlex(sameButOther).slice(0, 6);
  }

  const sessionItems: SessionItem[] = shuffleFlex([
    ...targets.map(item => ({ item, isTarget: true })),
    ...distractorItems.map(item => ({ item, isTarget: false })),
  ]);

  return { domain, targetCategory, items: sessionItems };
}

// ── Tutorial ───────────────────────────────────────────────────────────────

function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const doneRef = useRef(false);

  function answer(a: "SIM" | "NÃO") {
    if (doneRef.current) return;
    if (a === "SIM") {
      doneRef.current = true;
      setTimeout(onDone, 400);
    }
  }

  const text = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-3 border text-center ${
        theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : "bg-amber-50 border-amber-200"
      }`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${sub}`}>Categoria</p>
        <p className={`text-base font-bold ${theme === "GAMIFIED" ? "text-cyan-300" : "text-amber-800"}`}>
          🐄 Fazenda (Animais)?
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        <ItemSvg id="an-vaca" size={80} />
        <p className={`font-bold text-xl ${text}`}>Vaca</p>
      </div>

      <p className={`text-center text-xs ${sub}`}>
        Toque SIM — Vaca é animal de fazenda!
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

export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [itemIdx, setItemIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [timer, setTimer] = useState(secsPerItem(difficulty));
  const [session, setSession] = useState<Session>(() => buildSession(difficulty));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);
  const startTime = useRef(Date.now());
  const itemIdxRef = useRef(0);
  const resultsRef = useRef<boolean[]>([]);
  const maxSecs = secsPerItem(difficulty);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const finishItem = useCallback((isCorrect: boolean) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const newResults = [...resultsRef.current, isCorrect];
    resultsRef.current = newResults;
    setResults([...newResults]);
    setLastCorrect(isCorrect);
    setPhase("feedback");

    const nextIdx = itemIdxRef.current + 1;
    reportProgress(Math.round((nextIdx / ITEMS_PER_SESSION) * 100));

    setTimeout(() => {
      if (nextIdx >= ITEMS_PER_SESSION) {
        const accuracy = newResults.filter(Boolean).length / ITEMS_PER_SESSION;
        onComplete({
          exerciseId: "desafio-orcamento",
          domain: "executive",
          score: calculateExerciseScore("desafio-orcamento", accuracy, undefined, difficulty),
          accuracy, difficulty,
          duration: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { trials: ITEMS_PER_SESSION, correct: newResults.filter(Boolean).length },
        });
      } else {
        itemIdxRef.current = nextIdx;
        answeredRef.current = false;
        setItemIdx(nextIdx);
        setPhase("question");
      }
    }, 1000);
  }, [itemIdx, difficulty, onComplete, reportProgress]);

  useEffect(() => {
    if (phase !== "question" || showTutorial) return;
    setTimer(maxSecs);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishItem(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, itemIdx, showTutorial]);

  function answer(response: "SIM" | "NÃO") {
    if (phase !== "question" || answeredRef.current) return;
    const currentItem = session.items[itemIdx];
    const isCorrect = (response === "SIM") === currentItem.isTarget;
    finishItem(isCorrect);
  }

  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Fluência Semântica"
        steps={[{
          instruction: "Um item aparece na tela. Toque SIM se ele pertence à categoria mostrada, NÃO se não pertencer. Seja rápido!",
          content: (done) => <TutStep theme={theme} onDone={done} />,
        }]}
        onDone={() => setShowTutorial(false)} />
    );
  }

  const currentItem = session.items[itemIdx];
  const timerRatio = timer / maxSecs;
  const timerColor = timerRatio > 0.6 ? "bg-green-400" : timerRatio > 0.3 ? "bg-amber-400" : "bg-red-500 animate-pulse";

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-fuchsia-50 to-pink-50" : "bg-gradient-to-br from-slate-50 to-rose-50/20",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : theme === "COLORFUL" ? "bg-white border-2 border-fuchsia-200 shadow-xl" : "bg-white border border-slate-200/70 shadow-md",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-fuchsia-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    catBg: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600" : theme === "COLORFUL" ? "bg-fuchsia-50 border-fuchsia-200" : "bg-slate-50 border-slate-200",
    catText: theme === "GAMIFIED" ? "text-cyan-300" : theme === "COLORFUL" ? "text-fuchsia-800" : "text-slate-800",
    dotActive: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-fuchsia-500" : "bg-fuchsia-500",
    dotInactive: theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200",
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pal.bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl p-5 sm:p-6 ${pal.card}`}>

        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${pal.title}`}>🗂️ Fluência Semântica</h2>
          <span className={`text-xs ${pal.sub}`}>{itemIdx + 1}/{ITEMS_PER_SESSION}</span>
        </div>

        {/* Progresso */}
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: ITEMS_PER_SESSION }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < results.length
                ? results[i] ? "bg-green-500" : "bg-red-400"
                : i === itemIdx ? `${pal.dotActive} animate-pulse` : pal.dotInactive
            }`} />
          ))}
        </div>

        {/* Timer bar */}
        <div className={`h-2 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
          <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerRatio * 100}%` }} />
        </div>

        {/* Categoria alvo */}
        <div className={`rounded-xl p-3 mb-4 border text-center ${pal.catBg}`}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${pal.sub}`}>Categoria</p>
          <p className={`text-base font-bold ${pal.catText}`}>
            {session.targetCategory.emoji} {session.targetCategory.label} ({session.domain.name})?
          </p>
        </div>

        <AnimatePresence mode="wait">
          {phase === "question" && (
            <motion.div key={`q-${itemIdx}`}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}>

              <div className="flex flex-col items-center gap-3 py-4">
                <ItemSvg id={currentItem.item.id} size={120} />
                <p className={`font-bold text-2xl text-center ${
                  theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"
                }`}>
                  {currentItem.item.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <button onClick={() => answer("SIM")}
                  className="h-16 rounded-2xl font-bold text-xl bg-green-500 hover:bg-green-600 text-white transition-all active:scale-95 shadow-md">
                  SIM ✓
                </button>
                <button onClick={() => answer("NÃO")}
                  className="h-16 rounded-2xl font-bold text-xl bg-red-400 hover:bg-red-500 text-white transition-all active:scale-95 shadow-md">
                  NÃO ✗
                </button>
              </div>
            </motion.div>
          )}

          {phase === "feedback" && (
            <motion.div key={`fb-${itemIdx}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 py-4">
              <ItemSvg id={currentItem.item.id} size={72} />
              <p className={`font-semibold text-lg ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                {currentItem.item.name}
              </p>
              <p className="text-3xl">{lastCorrect ? "✅" : "❌"}</p>
              <p className={`text-sm font-semibold ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
                {lastCorrect
                  ? "Correto!"
                  : currentItem.isTarget
                    ? `Sim! É ${session.targetCategory.label}`
                    : `Não é ${session.targetCategory.label}`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
