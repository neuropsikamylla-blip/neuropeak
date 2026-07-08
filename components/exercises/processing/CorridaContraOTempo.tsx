"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Target, Ban, Check, Zap, Crosshair, MousePointerClick, Eye } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ItemSvg } from "@/components/exercises/ItemSvg";
import type { ExerciseResult, Theme } from "@/types";
import {
  shuffleFlex, itemsByFlexCat, pickRandomDomain, ALL_DOMAINS,
  type FlexDomain, type FlexItem, type FlexCategory,
} from "@/lib/item-domains";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }
interface GridItem extends FlexItem { isTarget: boolean; collected: boolean; }
type Mode = "direct" | "exclusion";

// ── Progressão de dificuldade (5 níveis) ─────────────────────────────────────
// Mais itens, mais alvos, menos tempo e distratores mais próximos conforme sobe.
function levelSpec(lvl: number) {
  const tier = lvl <= 2 ? 1 : lvl <= 4 ? 2 : lvl <= 6 ? 3 : lvl <= 8 ? 4 : 5;
  const S = {
    1: { items: 6,  targets: 2, time: 20, close: 0.2, cols: 3 },
    2: { items: 9,  targets: 3, time: 16, close: 0.45, cols: 3 },
    3: { items: 12, targets: 4, time: 13, close: 0.6, cols: 4 },
    4: { items: 12, targets: 5, time: 11, close: 0.75, cols: 4 },
    5: { items: 16, targets: 6, time: 10, close: 0.85, cols: 4 },
  }[tier]!;
  return { tier, ...S };
}
// Exclusão (inibição) entra a partir do nível 3, alternando com o modo direto.
function modeFor(lvl: number, round: number): Mode {
  return lvl >= 5 && round % 2 === 1 ? "exclusion" : "direct";
}

function buildGrid(domain: FlexDomain, cat: FlexCategory, lvl: number, mode: Mode): GridItem[] {
  const spec = levelSpec(lvl);
  const size = spec.items;
  const mk = (x: FlexItem, isTarget: boolean): GridItem => ({ ...x, isTarget, collected: false });

  if (mode === "exclusion") {
    // Evitar a categoria saliente; tocar em todo o resto.
    const nAvoid = Math.min(3 + (spec.tier >= 4 ? 1 : 0), itemsByFlexCat(domain, cat.id).length);
    const avoid = shuffleFlex(itemsByFlexCat(domain, cat.id)).slice(0, nAvoid);
    const rest = shuffleFlex(domain.items.filter(i => i.cat !== cat.id)).slice(0, size - avoid.length);
    return shuffleFlex([...avoid.map(x => mk(x, false)), ...rest.map(x => mk(x, true))]);
  }

  // Direto: alvos da categoria + distratores (próximos = mesmo cenário; fáceis = outro cenário).
  const targets = shuffleFlex(itemsByFlexCat(domain, cat.id)).slice(0, spec.targets);
  const nDist = size - targets.length;
  const nClose = Math.round(nDist * spec.close);
  const closePool = shuffleFlex(domain.items.filter(i => i.cat !== cat.id));
  const farPool = shuffleFlex(ALL_DOMAINS.filter(d => d.id !== domain.id).flatMap(d => d.items));
  const close = closePool.slice(0, nClose);
  const far = farPool.slice(0, nDist - close.length);
  return shuffleFlex([...targets.map(x => mk(x, true)), ...close.map(x => mk(x, false)), ...far.map(x => mk(x, false))]);
}

// ── Tutorial ─────────────────────────────────────────────────────────────────
function TutStep({ onDone }: { theme: Theme; onDone: () => void }) {
  const ITEMS: GridItem[] = [
    { id: "banana",  name: "Banana",  cat: "hortifruti", price: 3.9, isTarget: true,  collected: false },
    { id: "sabao",   name: "Sabão",   cat: "higiene",    price: 18.9, isTarget: false, collected: false },
    { id: "maca",    name: "Maçã",    cat: "hortifruti", price: 6.9, isTarget: true,  collected: false },
    { id: "refri",   name: "Refri",   cat: "bebidas",    price: 8.9, isTarget: false, collected: false },
    { id: "cenoura", name: "Cenoura", cat: "hortifruti", price: 4.9, isTarget: true,  collected: false },
    { id: "cafe",    name: "Café",    cat: "mercearia",  price: 11.9, isTarget: false, collected: false },
  ];
  const [col, setCol] = useState(new Set<string>());
  const doneRef = useRef(false);
  function tap(id: string, isTarget: boolean) {
    if (!isTarget || col.has(id) || doneRef.current) return;
    const n = new Set([...col, id]); setCol(n);
    if (n.size === ITEMS.filter(i => i.isTarget).length) { doneRef.current = true; setTimeout(onDone, 500); }
  }
  return (
    <div>
      <div className="flex items-center gap-2 justify-center mb-1 text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">
        <Target size={13} /> Toque apenas em
      </div>
      <p className="text-center font-black text-lg text-[#0F172A] mb-3">Frutas e verduras</p>
      <div className="grid grid-cols-3 gap-2">
        {ITEMS.map(item => (
          <button key={item.id} onClick={() => tap(item.id, item.isTarget)} disabled={col.has(item.id)}
            className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition active:scale-95 ${
              col.has(item.id) ? "border-green-500 bg-green-50" : "border-[#E2E8F0] bg-white"}`}>
            <ItemSvg id={item.id} size={34} />
            <span className="text-xs text-center leading-none text-[#334155]">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Perfis cognitivos (feedback final) ───────────────────────────────────────
function profileOf(avgCorrect: number, precision: number) {
  const fast = avgCorrect > 0 && avgCorrect <= 1.6;
  const accurate = precision >= 0.8;
  if (fast && accurate) return { label: "Rápido e preciso", tip: "Excelente velocidade com ótimo controle de resposta. Continue nesse ritmo!" };
  if (fast && !accurate) return { label: "Rápido e impreciso", tip: "Há impulsividade. Antes de tocar, confirme se o item realmente segue a regra." };
  if (!fast && accurate) return { label: "Lento e preciso", tip: "Boa discriminação! Faça uma varredura da esquerda para a direita para ganhar velocidade." };
  return { label: "Lento e impreciso", tip: "Leia a regra com calma e processe a categoria antes de começar a busca." };
}

type Phase = "ready" | "playing" | "roundfb" | "summary";

export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();

  const domainRef = useRef<FlexDomain>(pickRandomDomain());
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<Mode>("direct");
  const [targetCat, setTargetCat] = useState<FlexCategory>(domainRef.current.categories[0]);
  const [items, setItems] = useState<GridItem[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [penalty, setPenalty] = useState(0);            // mostra "-1,5s" rápido
  const [lastRound, setLastRound] = useState<{ hits: number; total: number; errors: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false);
  const hitsRef = useRef(0);
  const errRef = useRef(0);
  const totalRef = useRef(0);
  const startRef = useRef(0);
  const firstTapRef = useRef(0);
  const correctTimesRef = useRef<number[]>([]);
  const roundRef = useRef(0);
  const lastCatRef = useRef<string | null>(null);
  const curLevelRef = useRef(difficulty);
  const streakRef = useRef(0);
  const reachedRef = useRef(difficulty);
  // agregados da sessão
  const agg = useRef({ hits: 0, errors: 0, omitted: 0, targets: 0, correct: [] as number[], firsts: [] as number[], rounds: 0, roundsOk: 0 });

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startRound() {
    begin();
    if (roundRef.current % 3 === 0 && roundRef.current > 0) domainRef.current = pickRandomDomain();
    const domain = domainRef.current;
    const lvl = curLevelRef.current;
    const m = modeFor(lvl, roundRef.current);
    const cats = domain.categories;
    const pool = cats.length > 1 ? cats.filter(c => c.id !== lastCatRef.current) : cats;
    const cat = pool[Math.floor(Math.random() * pool.length)];
    lastCatRef.current = cat.id;
    const newItems = buildGrid(domain, cat, lvl, m);
    endedRef.current = false;
    hitsRef.current = 0; errRef.current = 0;
    totalRef.current = newItems.filter(i => i.isTarget).length;
    startRef.current = performance.now();
    firstTapRef.current = 0;
    correctTimesRef.current = [];
    setMode(m); setTargetCat(cat); setItems(newItems);
    setTimeLeft(levelSpec(lvl).time);
    setPhase("playing");
  }

  function endRound() {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const hits = hitsRef.current, errors = errRef.current, total = totalRef.current;
    const omitted = Math.max(0, total - hits);
    const coverage = total > 0 ? hits / total : 0;
    const good = coverage >= 0.75 && errors <= 1;
    const bad = coverage < 0.5 || errors >= 3;

    // Adaptativa por precisão × impulsividade.
    streakRef.current = good ? Math.max(0, streakRef.current) + 1 : bad ? Math.min(0, streakRef.current) - 1 : streakRef.current;
    if (streakRef.current >= 2) { streakRef.current = 0; curLevelRef.current = Math.min(10, curLevelRef.current + 1); reachedRef.current = Math.max(reachedRef.current, curLevelRef.current); }
    else if (streakRef.current <= -2) { streakRef.current = 0; curLevelRef.current = Math.max(1, curLevelRef.current - 1); }

    // Agrega.
    const a = agg.current;
    a.hits += hits; a.errors += errors; a.omitted += omitted; a.targets += total;
    a.correct.push(...correctTimesRef.current); if (firstTapRef.current) a.firsts.push(firstTapRef.current);
    a.rounds++; if (good) a.roundsOk++;

    setLastRound({ hits, total, errors });
    setPhase("roundfb");
    const timeUp = isTimeUp();
    setTimeout(() => {
      if (timeUp) { setPhase("summary"); }
      else { roundRef.current++; setRound(roundRef.current); startRound(); }
    }, 1100);
  }

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const nt = t - 1;
        if (nt <= 0) { clearInterval(timerRef.current!); endRound(); return 0; }
        return nt;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  function handleTap(item: GridItem) {
    if (phase !== "playing" || item.collected || endedRef.current) return;
    const now = (performance.now() - startRef.current) / 1000;
    if (!firstTapRef.current) firstTapRef.current = now;
    if (item.isTarget) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, collected: true } : i));
      hitsRef.current++;
      correctTimesRef.current.push(now);
      setFlash({ id: item.id, ok: true });
      setTimeout(() => setFlash(f => f?.id === item.id ? null : f), 260);
      if (hitsRef.current >= totalRef.current) endRound();
    } else {
      // Penalidade cognitiva: erro impulsivo tira tempo.
      errRef.current++;
      setFlash({ id: item.id, ok: false });
      setTimeout(() => setFlash(f => f?.id === item.id ? null : f), 380);
      setPenalty(p => p + 1); setTimeout(() => setPenalty(p => Math.max(0, p - 1)), 700);
      setTimeLeft(t => {
        const nt = t - 2;
        if (nt <= 0) { if (timerRef.current) clearInterval(timerRef.current); endRound(); return 0; }
        return nt;
      });
    }
  }

  if (showTutorial) {
    return <TutorialBase theme={theme} title="Busca Rápida"
      steps={[
        { instruction: "Toque rapidamente APENAS nos itens que seguem a regra da rodada. Cuidado com os distratores!", content: (done) => <TutStep theme={theme} onDone={done} /> },
      ]}
      onDone={() => setShowTutorial(false)} />;
  }

  const spec = levelSpec(curLevelRef.current);
  const timerRatio = Math.max(0, timeLeft / spec.time);
  const barColor = timerRatio > 0.5 ? "#22C55E" : timerRatio > 0.25 ? "#F59E0B" : "#EF4444";
  const collected = hitsRef.current;
  const ruleVerb = mode === "exclusion" ? "Toque em tudo que NÃO é" : "Toque apenas em";

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={{ background: "#F3F4F6" }}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6" style={{ boxShadow: "0 12px 40px rgba(15,23,42,.10)", border: "1px solid #EEF0F4" }}>

        {/* Topo: título + timer + acertos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair size={18} color="#1D4ED8" />
            <h2 className="font-bold" style={{ color: "#0F172A", fontSize: 17 }}>Busca Rápida</h2>
          </div>
          {phase === "playing" && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-bold tabular-nums" style={{ color: timeLeft <= 4 ? "#EF4444" : "#334155", fontSize: 15 }}>
                <Timer size={16} /> {Math.ceil(timeLeft)}s
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold tabular-nums px-2.5 py-1 rounded-xl" style={{ background: "#EEF6FF", color: "#1D4ED8", fontSize: 14 }}>
                <Target size={14} /> {collected}/{totalRef.current}
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 space-y-5">
              <div className="mx-auto flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: "#EEF6FF" }}>
                <Crosshair size={28} color="#1D4ED8" />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: "#0F172A" }}>Encontre os itens da regra</p>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>Toque rápido e evite os distratores. Cada erro tira tempo.</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "#94A3B8" }}>
                <span className="inline-flex items-center gap-1"><Zap size={13} /> Velocidade</span>
                <span className="inline-flex items-center gap-1"><Eye size={13} /> Atenção</span>
                <span className="inline-flex items-center gap-1"><Ban size={13} /> Controle</span>
              </div>
              <button onClick={startRound} className="px-8 py-3 rounded-2xl font-bold text-white" style={{ background: "linear-gradient(135deg,#173B78,#1D4ED8)" }}>Começar</button>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div key={`play-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              {/* Regra dominante */}
              <div className="rounded-2xl px-4 py-3 mb-2 text-center" style={{ background: mode === "exclusion" ? "#FEF2F2" : "#EEF6FF", border: `1px solid ${mode === "exclusion" ? "#FECACA" : "#DBEAFE"}` }}>
                <div className="flex items-center gap-1.5 justify-center text-[11px] font-bold uppercase tracking-wide" style={{ color: mode === "exclusion" ? "#B91C1C" : "#1D4ED8" }}>
                  {mode === "exclusion" ? <Ban size={13} /> : <Target size={13} />} {ruleVerb}
                </div>
                <p className="font-black mt-0.5" style={{ color: "#0F172A", fontSize: 19 }}>{targetCat.label}</p>
              </div>

              {/* Barra de tempo */}
              <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: "#EEF2F7" }}>
                <div className="h-full rounded-full" style={{ width: `${timerRatio * 100}%`, background: barColor, transition: "width .3s linear" }} />
              </div>

              {/* Grid */}
              <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${spec.cols}, minmax(0,1fr))` }}>
                {items.map(item => {
                  const isFlash = flash?.id === item.id;
                  const border = item.collected ? "#22C55E" : isFlash ? (flash!.ok ? "#22C55E" : "#EF4444") : "#E2E8F0";
                  const bgc = item.collected ? "#F0FDF4" : isFlash && !flash!.ok ? "#FEF2F2" : "#fff";
                  return (
                    <motion.button key={item.id} onPointerDown={() => handleTap(item)} disabled={item.collected || endedRef.current}
                      className="rounded-2xl flex flex-col items-center gap-1.5 p-2.5"
                      style={{ border: `2px solid ${border}`, background: bgc, opacity: item.collected ? 0.55 : 1, cursor: "pointer" }}
                      animate={isFlash && !flash!.ok ? { x: [-3, 3, -3, 3, 0] } : item.collected ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.25 }}>
                      <ItemSvg id={item.id} size={46} />
                      <span className="text-xs text-center leading-tight font-semibold" style={{ color: "#334155" }}>{item.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* penalidade flutuante */}
              <AnimatePresence>
                {penalty > 0 && (
                  <motion.p key="pen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center font-bold mt-2" style={{ color: "#EF4444", fontSize: 13 }}>−2s · toque impulsivo</motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "roundfb" && lastRound && (
            <motion.div key={`fb-${round}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="mx-auto mb-2 flex items-center justify-center rounded-full" style={{ width: 46, height: 46, background: lastRound.hits >= lastRound.total * 0.75 ? "#DDF7EF" : "#FEF3C7" }}>
                {lastRound.hits >= lastRound.total * 0.75 ? <Check size={24} color="#047857" strokeWidth={3} /> : <MousePointerClick size={22} color="#B45309" />}
              </div>
              <p className="font-bold text-lg" style={{ color: "#0F172A" }}>{lastRound.hits}/{lastRound.total} encontrados</p>
              <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>{lastRound.errors === 0 ? "Sem erros!" : `${lastRound.errors} toque${lastRound.errors > 1 ? "s" : ""} impulsivo${lastRound.errors > 1 ? "s" : ""}`}</p>
            </motion.div>
          )}

          {phase === "summary" && (() => {
            const a = agg.current;
            const avgCorrect = a.correct.length ? a.correct.reduce((s, x) => s + x, 0) / a.correct.length : 0;
            const firstTap = a.firsts.length ? a.firsts.reduce((s, x) => s + x, 0) / a.firsts.length : 0;
            const precision = a.hits + a.errors > 0 ? a.hits / (a.hits + a.errors) : 0;
            const prof = profileOf(avgCorrect, precision);
            const acc = a.hits / Math.max(1, a.hits + a.errors + a.omitted);
            const metrics = [
              { l: "Acertos", v: `${a.hits}/${a.targets}` },
              { l: "Erros impulsivos", v: `${a.errors}` },
              { l: "Tempo médio/acerto", v: avgCorrect ? `${avgCorrect.toFixed(1)}s` : "—" },
              { l: "Primeiro toque", v: firstTap ? `${firstTap.toFixed(1)}s` : "—" },
              { l: "Itens omitidos", v: `${a.omitted}` },
              { l: "Dificuldade", v: `Nível ${reachedRef.current}` },
            ];
            function done() {
              finish();
              onComplete({
                exerciseId: "corrida-tempo", domain: "processing",
                score: calculateExerciseScore("corrida-tempo", acc, undefined, reachedRef.current),
                accuracy: acc, difficulty: reachedRef.current, duration: elapsedSec(),
                metadata: { rounds: a.rounds, roundsOk: a.roundsOk, hits: a.hits, errors: a.errors, omitted: a.omitted, avgCorrect: Number(avgCorrect.toFixed(2)), firstTap: Number(firstTap.toFixed(2)), profile: prof.label, reachedDifficulty: reachedRef.current },
              });
            }
            return (
              <motion.div key="sum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
                <p className="text-center font-bold text-lg" style={{ color: "#0F172A" }}>Resultado da sessão</p>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  {metrics.map(m => (
                    <div key={m.l} className="rounded-2xl px-3 py-2.5" style={{ background: "#F8FAFC", border: "1px solid #EEF0F4" }}>
                      <div className="font-bold tabular-nums" style={{ color: "#0F172A", fontSize: 18 }}>{m.v}</div>
                      <div className="uppercase" style={{ color: "#94A3B8", fontSize: 10, fontWeight: 700, letterSpacing: ".03em", marginTop: 2 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl mt-3 p-4" style={{ background: "#EEF6FF", border: "1px solid #DBEAFE" }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#1D4ED8" }}>Perfil da rodada</p>
                  <p className="font-black text-lg mt-0.5" style={{ color: "#173B78" }}>{prof.label}</p>
                  <p className="text-sm mt-1" style={{ color: "#475569" }}>{prof.tip}</p>
                </div>
                <button onClick={done} className="w-full mt-4 py-3 rounded-2xl font-bold text-white" style={{ background: "linear-gradient(135deg,#173B78,#1D4ED8)" }}>Concluir</button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
