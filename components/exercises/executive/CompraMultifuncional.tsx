"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import {
  buildRound, checkRound, ruleStatus, buildInstruction, buildHint, roundScore,
  levelMeta, MAX_LEVEL, fmt, type Round, type Item, type RuleStatus,
} from "@/data/compra-multifuncional";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const START_LEVEL = (d: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round((d / 10) * 4) + 1));
// Modo memória entra sozinho nos níveis difíceis (regras somem após alguns segundos).
const MEMORY_FROM_LEVEL = 4;

export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();

  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";

  // ── Estado do jogo ──
  const [level, setLevel] = useState(() => START_LEVEL(difficulty));
  const [round, setRound] = useState<Round>(() => buildRound(START_LEVEL(difficulty)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [timeLeft, setTimeLeft] = useState(round.timeSecs);
  const [rulesVisible, setRulesVisible] = useState(true);
  const [hintText, setHintText] = useState<string | null>(null);

  const memoryActive = level >= MEMORY_FROM_LEVEL;

  const [feedback, setFeedback] = useState<null | {
    correct: boolean; timeUp: boolean;
    passed: { label: string; value: string }[]; failed: { label: string; value: string }[];
    seconds: number; swaps: number; gained: number; total: number;
    levelMsg: string | null; streakAfter: number; levelName: string;
  }>(null);

  // refs
  const levelRef = useRef(level);
  const reachedRef = useRef(level);
  const correctStreakRef = useRef(0);
  const wrongStreakRef = useRef(0);
  const swapsRef = useRef(0);
  const errorsRef = useRef(0);
  const hintUsedRef = useRef(false);
  const startTsRef = useRef(0);
  const swapHistRef = useRef<number[]>([]);
  const resultsRef = useRef<boolean[]>([]);
  const pointsRef = useRef(0);
  const roundConcludedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const memTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (memTimerRef.current) clearTimeout(memTimerRef.current);
  }, []);

  // Cronômetro por rodada
  useEffect(() => {
    if (phase !== "shopping" || showTutorial) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); onTimeUp(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showTutorial, round]);

  // Modo memória (níveis difíceis): esconde regras após 5s
  useEffect(() => {
    if (memTimerRef.current) clearTimeout(memTimerRef.current);
    const active = level >= MEMORY_FROM_LEVEL;
    if (phase === "shopping" && !showTutorial && active) {
      setRulesVisible(true);
      memTimerRef.current = setTimeout(() => setRulesVisible(false), 5000);
    } else {
      setRulesVisible(true);
    }
    return () => { if (memTimerRef.current) clearTimeout(memTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showTutorial, level, round]);

  const selItems = useCallback((s: Set<string>): Item[] => round.items.filter(i => s.has(i.id)), [round]);

  function startNewRound(atLevel: number) {
    roundConcludedRef.current = false;
    swapsRef.current = 0; errorsRef.current = 0; hintUsedRef.current = false;
    const r = buildRound(atLevel);
    setRound(r);
    setSelected(new Set());
    setTimeLeft(r.timeSecs);
    setHintText(null);
    setRulesVisible(true);
    startTsRef.current = Date.now();
    setPhase("shopping");
  }

  function toggle(id: string) {
    if (phase !== "shopping") return;
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); swapsRef.current += 1; }
      else n.add(id);
      return n;
    });
  }

  function useHint() {
    if (phase !== "shopping") return;
    hintUsedRef.current = true;
    pointsRef.current = Math.max(0, pointsRef.current - 30);
    setHintText(buildHint(round, selItems(selected)));
  }

  function revealRules() {
    setRulesVisible(true);
    pointsRef.current = Math.max(0, pointsRef.current - 15);
    if (memTimerRef.current) clearTimeout(memTimerRef.current);
    memTimerRef.current = setTimeout(() => setRulesVisible(false), 4000);
  }

  function advance() {
    if (isTimeUp()) {
      finish();
      const results = resultsRef.current;
      const accuracy = results.length ? results.filter(Boolean).length / results.length : 0;
      onComplete({
        exerciseId: "compra-multifuncional",
        domain: "executive",
        score: calculateExerciseScore("compra-multifuncional", accuracy, undefined, reachedRef.current),
        accuracy, difficulty: reachedRef.current, duration: elapsedSec(),
        metadata: { rounds: results.length, correct: results.filter(Boolean).length, points: pointsRef.current, reachedLevel: reachedRef.current },
      });
      return;
    }
    setLevel(levelRef.current);
    startNewRound(levelRef.current);
  }

  function onTimeUp() {
    if (roundConcludedRef.current) return;
    roundConcludedRef.current = true;
    concludeRound(false, true);
  }

  function confirmPurchase() {
    if (phase !== "shopping" || selected.size === 0) return;
    const sel = selItems(selected);
    const { perRule, allOk } = checkRound(sel, round);
    if (allOk) { roundConcludedRef.current = true; concludeRound(true, false); return; }
    errorsRef.current += 1;
    wrongStreakRef.current += 1;
    correctStreakRef.current = 0;
    pointsRef.current = Math.max(0, pointsRef.current - 25);
    let levelMsg: string | null = null;
    if (wrongStreakRef.current >= 2) {
      wrongStreakRef.current = 0;
      if (levelRef.current > 1) { levelRef.current -= 1; levelMsg = "Vamos reduzir um pouco a dificuldade para consolidar."; }
    }
    const { passed, failed } = splitRules(perRule);
    const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
    setFeedback({
      correct: false, timeUp: false, passed, failed,
      seconds: Math.round((Date.now() - startTsRef.current) / 1000),
      swaps: swapsRef.current, gained: -25, total, levelMsg, streakAfter: 0, levelName: levelMeta(levelRef.current).name,
    });
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("result");
  }

  function concludeRound(correct: boolean, timeUp: boolean) {
    if (timerRef.current) clearInterval(timerRef.current);
    const sel = selItems(selected);
    const { perRule } = checkRound(sel, round);
    const { passed, failed } = splitRules(perRule);
    const seconds = Math.round((Date.now() - startTsRef.current) / 1000);
    const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
    resultsRef.current = [...resultsRef.current, correct];

    let gained = 0;
    let levelMsg: string | null = null;
    let streakAfter = correctStreakRef.current;

    if (correct) {
      correctStreakRef.current += 1;
      wrongStreakRef.current = 0;
      streakAfter = correctStreakRef.current;
      const reached3 = correctStreakRef.current >= 3;
      const rs = roundScore({
        level: levelRef.current, correct: true, swaps: swapsRef.current,
        hintUsed: hintUsedRef.current, seconds, reachedStreak3: reached3,
      });
      gained = rs.points;
      pointsRef.current += rs.points;
      swapHistRef.current = [...swapHistRef.current, swapsRef.current].slice(-3);
      const avgSwaps = swapHistRef.current.reduce((a, b) => a + b, 0) / swapHistRef.current.length;
      if (correctStreakRef.current >= 3) {
        if (avgSwaps <= 3 && levelRef.current < MAX_LEVEL) {
          levelRef.current += 1;
          reachedRef.current = Math.max(reachedRef.current, levelRef.current);
          levelMsg = `Você subiu para o Nível ${levelRef.current} — ${levelMeta(levelRef.current).name}!`;
        } else if (avgSwaps > 3) {
          levelMsg = "Ótimo! Tente acertar com menos trocas para subir de nível.";
        }
        correctStreakRef.current = 0;
        streakAfter = 0;
      }
    } else {
      wrongStreakRef.current += 1;
      correctStreakRef.current = 0;
      streakAfter = 0;
      if (wrongStreakRef.current >= 2) {
        wrongStreakRef.current = 0;
        if (levelRef.current > 1) { levelRef.current -= 1; levelMsg = "Vamos reduzir um pouco a dificuldade para consolidar."; }
      }
    }

    setFeedback({ correct, timeUp, passed, failed, seconds, swaps: swapsRef.current, gained, total, levelMsg, streakAfter, levelName: levelMeta(levelRef.current).name });
    setPhase("result");
  }

  function splitRules(perRule: boolean[]): { passed: { label: string; value: string }[]; failed: { label: string; value: string }[] } {
    const sel = selItems(selected);
    const passed: { label: string; value: string }[] = [];
    const failed: { label: string; value: string }[] = [];
    round.rules.forEach((r, i) => {
      const st = ruleStatus(r, sel, round.scenario.categories);
      (perRule[i] ? passed : failed).push({ label: st.label, value: st.value });
    });
    return { passed, failed };
  }

  // ── Estilos por tema ──
  const rootBg: React.CSSProperties = isG
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isC ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };
  const cardStyle: React.CSSProperties = isG
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
  const btnStyle: React.CSSProperties = isG
    ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
    : isC ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };
  const pal = {
    title: isG ? "text-white" : "text-[#1a2744]",
    sub: isG ? "text-white/70" : "text-[#8a7a6a]",
    box: isG ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" },
    item: isG ? "border-white/20 bg-white/10 text-white/90" : "border-slate-200 bg-white text-gray-700 shadow-sm",
    itemSel: "border-emerald-500 bg-emerald-50 text-gray-800",
  };

  // ── Tutorial ──
  if (showTutorial) {
    return (
      <TutorialBase theme={theme} title="Compra Multifuncional"
        steps={[{
          instruction:
            "Monte a compra respeitando VÁRIAS regras ao mesmo tempo: quantidade, orçamento, categorias obrigatórias e proibidas. O painel mostra em tempo real o que já foi cumprido (✓), o que falta (○) e o que foi violado (✕). Leia tudo antes de clicar e planeje! A cada 3 acertos seguidos, o nível sobe.",
          content: (done) => (
            <div className="space-y-3">
              <div className="rounded-xl p-3 text-sm" style={pal.box}>
                <p className={`font-bold mb-1 ${pal.title}`}>Exemplo de rodada</p>
                <p className={pal.sub}>Escolha exatamente 2 itens · máximo R$ 18,00 · inclua 1 🥦 Hortifruti.</p>
              </div>
              <button onClick={done} className="w-full h-11 font-bold" style={btnStyle}>Começar</button>
            </div>
          ),
        }]}
        onDone={() => { begin(); startTsRef.current = Date.now(); setShowTutorial(false); }} />
    );
  }

  const meta = levelMeta(level);
  const sel = selItems(selected);
  const timerRatio = timeLeft / round.timeSecs;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";
  const statuses: RuleStatus[] = round.rules.map(r => ruleStatus(r, sel, round.scenario.categories));
  const ins = buildInstruction(round);

  const statusColor = (s: RuleStatus["state"]) =>
    s === "ok" ? "text-green-500" : s === "violated" ? "text-red-500" : (isG ? "text-white/45" : "text-gray-400");
  const statusIcon = (s: RuleStatus["state"]) => s === "ok" ? "✓" : s === "violated" ? "✕" : "○";

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="p-5" style={cardStyle}>

          {/* Cabeçalho compacto: nome · nível · cronômetro */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className={`font-bold text-base leading-none ${pal.title}`}>🛒 Compra Multifuncional</h2>
              <p className={`text-xs font-semibold mt-1 ${pal.sub}`}>Nível {level} — {meta.name}</p>
            </div>
            <span className={`text-lg font-mono font-bold tabular-nums ${timeLeft <= 8 ? "text-red-500 animate-pulse" : pal.title}`}>{timeLeft}s</span>
          </div>

          {/* Barra do cronômetro */}
          <div className={`h-1.5 rounded-full mb-3 ${isG ? "bg-white/10" : "bg-gray-200"}`}>
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {phase === "shopping" && (
              <motion.div key={`shop-${resultsRef.current.length}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                {/* Situação */}
                <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                  <p className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${pal.sub}`}>📖 Situação</p>
                  <p className={`text-sm font-medium leading-snug ${pal.title}`}>{ins.situation}</p>
                </div>

                {/* Painel de regras (ao vivo) */}
                <div className="rounded-xl p-3 border mb-3 space-y-1.5" style={pal.box}>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${pal.sub}`}>Regras — cumpra todas</p>
                    {memoryActive && !rulesVisible && (
                      <button onClick={revealRules} className={`text-[11px] font-semibold underline ${pal.sub}`}>👁 Rever regras (−15)</button>
                    )}
                  </div>
                  {rulesVisible ? statuses.map((st, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs font-semibold ${statusColor(st.state)}`}>
                      <span className="text-sm font-black leading-none mt-[1px]">{statusIcon(st.state)}</span>
                      <span className="leading-snug">{st.label}{st.value ? ` — ${st.value}` : ""}</span>
                    </div>
                  )) : (
                    <p className={`text-xs italic ${pal.sub}`}>Regras ocultas (modo memória). Toque em &ldquo;Rever regras&rdquo; se precisar.</p>
                  )}
                </div>

                {/* Itens */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {round.items.map(item => {
                    const on = selected.has(item.id);
                    const cat = round.scenario.categories.find(c => c.id === item.cat);
                    return (
                      <button key={item.id} onClick={() => toggle(item.id)}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${on ? pal.itemSel : pal.item}`}>
                        <span style={{ fontSize: 34, lineHeight: 1 }}>{item.emoji}</span>
                        <span className="text-xs text-center leading-tight font-medium">{item.name}</span>
                        <span className={`text-xs font-bold tabular-nums ${isG ? "text-cyan-300" : "text-emerald-600"}`}>{fmt(item.price)}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isG ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-500"}`}>{cat?.emoji} {cat?.label}</span>
                        {on && <span className="text-xs text-green-600 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {hintText && (
                  <div className="rounded-xl p-2.5 border mb-2 text-xs font-semibold flex items-start gap-2" style={{ background: isG ? "rgba(250,204,21,0.12)" : "#fffbeb", border: "1.5px solid rgba(250,204,21,0.4)", color: isG ? "#fde68a" : "#b45309" }}>
                    <span>💡</span><span>{hintText}</span>
                  </div>
                )}

                {/* Botão principal + dica secundária */}
                <button onClick={confirmPurchase} disabled={selected.size === 0}
                  className="w-full h-12 font-bold transition-all disabled:opacity-40" style={btnStyle}>
                  {selected.size === 0 ? "Selecione itens" : "Confirmar compra"}
                </button>
                <button onClick={useHint} disabled={hintUsedRef.current}
                  className={`w-full mt-2 h-8 rounded-full font-semibold text-xs disabled:opacity-40 ${isG ? "text-white/55" : "text-slate-400"}`}>
                  💡 Preciso de uma dica
                </button>
              </motion.div>
            )}

            {phase === "result" && feedback && (
              <motion.div key={`res-${resultsRef.current.length}`} className="py-2"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-5xl text-center mb-2">{feedback.correct ? "✅" : feedback.timeUp ? "⏱️" : "❌"}</p>
                <p className={`font-bold text-lg text-center mb-1 ${feedback.correct ? "text-green-600" : "text-red-500"}`}>
                  {feedback.correct ? "Compra correta!" : feedback.timeUp ? "Tempo esgotado" : "Ainda não cumpriu todas as regras"}
                </p>
                <p className={`text-xs text-center mb-3 ${pal.sub}`}>
                  {feedback.correct ? "Você cumpriu todas as regras."
                    : feedback.timeUp ? "A compra foi confirmada como estava."
                    : "Revise os pontos abaixo e tente de novo — corrija só o necessário."}
                </p>

                {feedback.passed.length > 0 && (
                  <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                    <p className="text-[11px] font-bold text-green-600 mb-1">Você cumpriu:</p>
                    {feedback.passed.map((t, i) => <div key={i} className="flex items-start gap-2 text-xs text-green-600 font-semibold"><span>✓</span><span>{t.label}{t.value ? ` — ${t.value}` : ""}</span></div>)}
                  </div>
                )}
                {feedback.failed.length > 0 && (
                  <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                    <p className="text-[11px] font-bold text-red-500 mb-1">Você não cumpriu:</p>
                    {feedback.failed.map((t, i) => <div key={i} className="flex items-start gap-2 text-xs text-red-500 font-semibold"><span>✕</span><span>{t.label}{t.value ? ` — ${t.value}` : ""}</span></div>)}
                  </div>
                )}

                {/* Desempenho — só aqui, depois de confirmar */}
                <div className="rounded-xl p-3 border mb-3 text-xs space-y-0.5" style={pal.box}>
                  <p className={`text-[11px] font-bold mb-1 ${pal.sub}`}>Desempenho</p>
                  <p className={pal.sub}>Tempo: <b className={pal.title}>{feedback.seconds}s</b> · Trocas: <b className={pal.title}>{feedback.swaps}</b> · Pontuação: <b className={feedback.gained >= 0 ? "text-emerald-500" : "text-red-500"}>{feedback.gained >= 0 ? "+" : ""}{feedback.gained}</b></p>
                  <p className={pal.sub}>Acertos seguidos: <b className={pal.title}>{feedback.streakAfter}/3</b> · Nível: <b className={pal.title}>{feedback.levelName}</b></p>
                  {feedback.total > 0 && <p className={pal.sub}>Total da compra: <b className={pal.title}>{fmt(feedback.total)}</b></p>}
                  {feedback.levelMsg
                    ? <p className="text-xs font-bold text-emerald-500 mt-1">{feedback.levelMsg}</p>
                    : (feedback.correct && level < MAX_LEVEL && feedback.streakAfter > 0 &&
                        <p className={`text-xs font-semibold mt-1 ${pal.sub}`}>Faltam {3 - feedback.streakAfter} acerto{3 - feedback.streakAfter !== 1 ? "s" : ""} seguido{3 - feedback.streakAfter !== 1 ? "s" : ""} para subir de nível.</p>)}
                </div>

                {feedback.correct || feedback.timeUp ? (
                  <button onClick={advance} className="w-full h-11 font-bold" style={btnStyle}>→ Próxima rodada</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setPhase("shopping")} className="flex-1 h-11 font-bold" style={btnStyle}>↩ Tentar novamente</button>
                    <button onClick={advance} className={`h-11 px-4 rounded-full font-bold text-sm border-2 ${isG ? "border-white/25 text-white/80" : "border-slate-300 text-slate-600"}`}>Pular</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
