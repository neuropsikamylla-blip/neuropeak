"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import {
  buildRound, checkRound, ruleStatus, buildInstruction, buildHint, roundScore,
  levelMeta, MAX_LEVEL, fmt, type Round, type Item, type RuleStatus,
} from "@/data/compra-multifuncional";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const START_LEVEL = (d: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round((d / 10) * 4) + 1));

export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [memoryMode, setMemoryMode] = useState(false);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";

  // ── Estado do jogo ──
  const [level, setLevel] = useState(() => START_LEVEL(difficulty));
  const [round, setRound] = useState<Round>(() => buildRound(START_LEVEL(difficulty)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"shopping" | "result">("shopping");
  const [timeLeft, setTimeLeft] = useState(round.timeSecs);
  const [points, setPoints] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [rulesVisible, setRulesVisible] = useState(true);
  const [hintText, setHintText] = useState<string | null>(null);

  // resultado da rodada (para feedback)
  const [feedback, setFeedback] = useState<null | {
    correct: boolean; timeUp: boolean;
    passed: string[]; failed: string[];
    seconds: number; swaps: number; gained: number;
    levelMsg: string | null; streakAfter: number;
  }>(null);

  // refs de controle
  const levelRef = useRef(level);
  const reachedRef = useRef(level);
  const correctStreakRef = useRef(0);
  const wrongStreakRef = useRef(0);
  const swapsRef = useRef(0);              // trocas (deseleções) na rodada
  const errorsRef = useRef(0);             // confirmações erradas na rodada
  const hintUsedRef = useRef(false);
  const startTsRef = useRef(0);
  const swapHistRef = useRef<number[]>([]);
  const resultsRef = useRef<boolean[]>([]);
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

  // Modo memória: esconde regras após 5s
  useEffect(() => {
    if (memTimerRef.current) clearTimeout(memTimerRef.current);
    if (phase === "shopping" && !showTutorial && memoryMode) {
      setRulesVisible(true);
      memTimerRef.current = setTimeout(() => setRulesVisible(false), 5000);
    } else if (!memoryMode) {
      setRulesVisible(true);
    }
    return () => { if (memTimerRef.current) clearTimeout(memTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showTutorial, memoryMode, round]);

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
      if (n.has(id)) { n.delete(id); swapsRef.current += 1; }  // deseleção = troca
      else n.add(id);
      return n;
    });
  }

  function useHint() {
    if (phase !== "shopping") return;
    hintUsedRef.current = true;
    setPoints(p => Math.max(0, p - 30));
    setHintText(buildHint(round, selItems(selected)));
  }

  function revealRules() {
    setRulesVisible(true);
    setPoints(p => Math.max(0, p - 15));
    if (memTimerRef.current) clearTimeout(memTimerRef.current);
    memTimerRef.current = setTimeout(() => setRulesVisible(false), 4000);
  }

  // Avança para a próxima rodada aplicando progressão
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
        metadata: { rounds: results.length, correct: results.filter(Boolean).length, points, reachedLevel: reachedRef.current },
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

  // Confirmar compra
  function confirmPurchase() {
    if (phase !== "shopping" || selected.size === 0) return;
    const sel = selItems(selected);
    const { perRule, allOk } = checkRound(sel, round);
    if (allOk) { roundConcludedRef.current = true; concludeRound(true, false); return; }
    // Erro: penaliza, mostra o que faltou, permite tentar de novo (mesma rodada)
    errorsRef.current += 1;
    wrongStreakRef.current += 1;
    correctStreakRef.current = 0;
    setCorrectStreak(0);
    setPoints(p => Math.max(0, p - 25));
    let levelMsg: string | null = null;
    if (wrongStreakRef.current >= 2) {
      wrongStreakRef.current = 0;
      if (levelRef.current > 1) {
        levelRef.current -= 1;
        levelMsg = "Vamos reduzir um pouco a dificuldade para consolidar.";
      }
    }
    const { passed, failed } = splitRules(perRule);
    setFeedback({
      correct: false, timeUp: false, passed, failed,
      seconds: Math.round((Date.now() - startTsRef.current) / 1000),
      swaps: swapsRef.current, gained: -25, levelMsg, streakAfter: 0,
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
      setPoints(p => p + rs.points);
      swapHistRef.current = [...swapHistRef.current, swapsRef.current].slice(-3);
      const avgSwaps = swapHistRef.current.reduce((a, b) => a + b, 0) / swapHistRef.current.length;
      if (correctStreakRef.current >= 3) {
        if (avgSwaps <= 3 && levelRef.current < MAX_LEVEL) {
          levelRef.current += 1;
          reachedRef.current = Math.max(reachedRef.current, levelRef.current);
          levelMsg = `Nível aumentado! Você subiu para o Nível ${levelRef.current} — ${levelMeta(levelRef.current).name}.`;
        } else if (avgSwaps > 3) {
          levelMsg = "Ótimo! Tente acertar com menos trocas para subir de nível.";
        }
        correctStreakRef.current = 0;
        streakAfter = 0;
      }
      setCorrectStreak(correctStreakRef.current);
    } else {
      // rodada perdida (tempo esgotado)
      wrongStreakRef.current += 1;
      correctStreakRef.current = 0;
      streakAfter = 0;
      setCorrectStreak(0);
      if (wrongStreakRef.current >= 2) {
        wrongStreakRef.current = 0;
        if (levelRef.current > 1) { levelRef.current -= 1; levelMsg = "Vamos reduzir um pouco a dificuldade para consolidar."; }
      }
    }

    setFeedback({ correct, timeUp, passed, failed, seconds, swaps: swapsRef.current, gained, levelMsg, streakAfter });
    setPhase("result");
  }

  function splitRules(perRule: boolean[]): { passed: string[]; failed: string[] } {
    const sel = selItems(selected);
    const passed: string[] = []; const failed: string[] = [];
    round.rules.forEach((r, i) => {
      const st = ruleStatus(r, sel, round.scenario.categories);
      (perRule[i] ? passed : failed).push(st.label);
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
            "Monte a compra respeitando VÁRIAS regras ao mesmo tempo: quantidade, orçamento, categorias obrigatórias e proibidas. O painel mostra em tempo real o que já foi cumprido (✓), o que falta (○) e o que foi violado (✗). Leia tudo antes de clicar e planeje! A cada 3 acertos seguidos, o nível sobe.",
          content: (done) => (
            <div className="space-y-3">
              <div className="rounded-xl p-3 text-sm" style={pal.box}>
                <p className={`font-bold mb-1 ${pal.title}`}>Exemplo de rodada</p>
                <p className={pal.sub}>Escolha exatamente 2 itens · máximo R$ 18,00 · inclua 1 🥦 Hortifruti.</p>
              </div>
              <label className={`flex items-center gap-2 text-sm font-semibold cursor-pointer ${pal.title}`}>
                <input type="checkbox" checked={memoryMode} onChange={e => setMemoryMode(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                🧠 Modo memória — as regras somem após 5s (mais desafiador)
              </label>
              <button onClick={done} className="w-full h-11 font-bold" style={btnStyle}>Começar</button>
            </div>
          ),
        }]}
        onDone={() => { begin(); startTsRef.current = Date.now(); setShowTutorial(false); }} />
    );
  }

  const meta = levelMeta(level);
  const sel = selItems(selected);
  const selTotal = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
  const targetN = (round.rules[0] as { kind: "count"; n: number }).n;
  const timerRatio = timeLeft / round.timeSecs;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";
  const statuses: RuleStatus[] = round.rules.map(r => ruleStatus(r, sel, round.scenario.categories));
  const allOk = statuses.every(s => s.state === "ok");
  const ins = buildInstruction(round);

  // chips de resumo (categorias obrigatórias / exatas)
  const catChips = round.rules
    .filter(r => r.kind === "catAtLeast" || r.kind === "catExactly")
    .map(r => {
      const cr = r as { cat: string; n: number };
      const c = round.scenario.categories.find(x => x.id === cr.cat);
      const cur = sel.filter(i => i.cat === cr.cat).length;
      return { key: cr.cat, label: c ? `${c.emoji} ${c.label}` : cr.cat, cur, target: cr.n };
    });

  const statusColor = (s: RuleStatus["state"]) =>
    s === "ok" ? "text-green-500" : s === "violated" ? "text-red-500" : (isG ? "text-white/45" : "text-gray-400");
  const statusIcon = (s: RuleStatus["state"]) => s === "ok" ? "✓" : s === "violated" ? "✗" : "○";

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="p-5" style={cardStyle}>

          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-1.5">
            <div>
              <h2 className={`font-bold text-base leading-none ${pal.title}`}>🛒 Compra Multifuncional</h2>
              <p className={`text-[11px] font-semibold mt-1 ${pal.sub}`}>Nível {level} — {meta.name} · {round.scenario.emoji} {round.scenario.name}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 8 ? "text-red-500 animate-pulse" : pal.sub}`}>{timeLeft}s</span>
              <p className={`text-[11px] font-bold ${isG ? "text-cyan-300" : "text-emerald-600"}`}>{points} pts</p>
            </div>
          </div>

          <ExerciseProgressBar progressPct={progressPct} theme={theme} />

          {/* Streak + progresso de nível */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < correctStreak ? "bg-emerald-500" : (isG ? "bg-white/20" : "bg-gray-300")}`} />
              ))}
              <span className={`text-[11px] font-semibold ml-1 ${pal.sub}`}>
                {level < MAX_LEVEL ? `${correctStreak}/3 acertos para subir` : "Nível máximo"}
              </span>
            </div>
            <button onClick={() => setMemoryMode(m => !m)} className={`text-[11px] font-semibold ${memoryMode ? "text-emerald-500" : pal.sub}`}>
              🧠 Memória {memoryMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* Barra do cronômetro */}
          <div className={`h-1.5 rounded-full mb-3 ${isG ? "bg-white/10" : "bg-gray-200"}`}>
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {phase === "shopping" && (
              <motion.div key={`shop-${round.scenario.id}-${resultsRef.current.length}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                {/* Situação */}
                <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                  <p className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${pal.sub}`}>📖 Situação</p>
                  <p className={`text-sm font-medium leading-snug ${pal.title}`}>{ins.situation}</p>
                </div>

                {/* Painel de regras (ao vivo) */}
                <div className="rounded-xl p-3 border mb-2 space-y-1.5" style={pal.box}>
                  <div className="flex items-center justify-between">
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${pal.sub}`}>Regras — cumpra todas</p>
                    {memoryMode && !rulesVisible && (
                      <button onClick={revealRules} className={`text-[11px] font-semibold underline ${pal.sub}`}>👁 Rever regras (−15)</button>
                    )}
                  </div>
                  {rulesVisible ? statuses.map((st, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs font-semibold ${statusColor(st.state)}`}>
                      <span className="text-sm font-black leading-none mt-[1px]">{statusIcon(st.state)}</span>
                      <span className="leading-snug">{st.label}</span>
                    </div>
                  )) : (
                    <p className={`text-xs italic ${pal.sub}`}>Regras ocultas (modo memória). Toque em &ldquo;Rever regras&rdquo; se precisar.</p>
                  )}
                </div>

                {/* Resumo */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Chip isG={isG} label="Total" value={`${fmt(selTotal)}`} />
                  <Chip isG={isG} label="Itens" value={`${sel.length}/${targetN}`} ok={sel.length === targetN} />
                  {catChips.map(c => <Chip key={c.key} isG={isG} label={c.label} value={`${c.cur}/${c.target}`} ok={c.cur === c.target} />)}
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
                        {on && <span className="text-xs text-green-600 font-bold">✓ selecionado</span>}
                      </button>
                    );
                  })}
                </div>

                {hintText && (
                  <div className="rounded-xl p-2.5 border mb-2 text-xs font-semibold flex items-start gap-2" style={{ background: isG ? "rgba(250,204,21,0.12)" : "#fffbeb", border: "1.5px solid rgba(250,204,21,0.4)", color: isG ? "#fde68a" : "#b45309" }}>
                    <span>💡</span><span>{hintText}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={useHint} disabled={hintUsedRef.current}
                    className={`h-11 px-4 rounded-full font-bold text-sm border-2 disabled:opacity-40 ${isG ? "border-white/25 text-white/80" : "border-slate-300 text-slate-600"}`}>
                    💡 Dica
                  </button>
                  <button onClick={confirmPurchase} disabled={selected.size === 0}
                    className="flex-1 h-11 font-bold transition-all disabled:opacity-40" style={btnStyle}>
                    {selected.size === 0 ? "Selecione itens" : allOk ? "✓ Confirmar compra" : "Confirmar compra"}
                  </button>
                </div>
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
                  {feedback.correct ? "Você respeitou todas as regras da rodada."
                    : feedback.timeUp ? "A compra foi confirmada como estava."
                    : "Revise os pontos abaixo e tente de novo — corrija só o necessário."}
                </p>

                {feedback.passed.length > 0 && (
                  <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                    <p className="text-[11px] font-bold text-green-600 mb-1">Você cumpriu:</p>
                    {feedback.passed.map((t, i) => <div key={i} className="flex items-start gap-2 text-xs text-green-600 font-semibold"><span>✓</span><span>{t}</span></div>)}
                  </div>
                )}
                {feedback.failed.length > 0 && (
                  <div className="rounded-xl p-3 border mb-2" style={pal.box}>
                    <p className="text-[11px] font-bold text-red-500 mb-1">Você não cumpriu:</p>
                    {feedback.failed.map((t, i) => <div key={i} className="flex items-start gap-2 text-xs text-red-500 font-semibold"><span>✗</span><span>{t}</span></div>)}
                  </div>
                )}

                <div className="rounded-xl p-3 border mb-3 text-xs space-y-0.5" style={pal.box}>
                  <p className={pal.sub}>Tempo: <b className={pal.title}>{feedback.seconds}s</b> · Trocas: <b className={pal.title}>{feedback.swaps}</b> · Pontos: <b className={feedback.gained >= 0 ? "text-emerald-500" : "text-red-500"}>{feedback.gained >= 0 ? "+" : ""}{feedback.gained}</b></p>
                  <p className={pal.sub}>Acertos seguidos: <b className={pal.title}>{feedback.streakAfter}/3</b> · Nível: <b className={pal.title}>{levelMeta(levelRef.current).name}</b></p>
                  {feedback.levelMsg && <p className="text-xs font-bold text-emerald-500 mt-1">{feedback.levelMsg}</p>}
                </div>

                {feedback.correct || feedback.timeUp ? (
                  <button onClick={advance} className="w-full h-11 font-bold" style={btnStyle}>→ Próxima rodada</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setPhase("shopping"); }} className="flex-1 h-11 font-bold" style={btnStyle}>↩ Tentar novamente</button>
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

function Chip({ isG, label, value, ok }: { isG: boolean; label: string; value: string; ok?: boolean }) {
  const base = ok ? (isG ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-700")
    : (isG ? "bg-white/10 text-white/75" : "bg-slate-100 text-slate-600");
  return (
    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${base}`}>
      {label}: {value}{ok ? " ✓" : ""}
    </span>
  );
}
