"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Headphones } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { ItemVisual } from "@/components/exercises/ItemVisual";
import type { ExerciseResult, Theme } from "@/types";

interface SequenciaItensProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Itens (figura + nome para áudio) ─────────────────────────────────────────
interface Item { e: string; n: string; g: "animal" | "objeto"; }
const ITEMS: Item[] = [
  { e: "🐱", n: "gato", g: "animal" }, { e: "🐶", n: "cachorro", g: "animal" },
  { e: "🐟", n: "peixe", g: "animal" }, { e: "🐦", n: "pássaro", g: "animal" },
  { e: "🐰", n: "coelho", g: "animal" }, { e: "🐸", n: "sapo", g: "animal" },
  { e: "⚽", n: "bola", g: "objeto" }, { e: "🔑", n: "chave", g: "objeto" },
  { e: "🌸", n: "flor", g: "objeto" }, { e: "🥤", n: "copo", g: "objeto" },
  { e: "📕", n: "livro", g: "objeto" }, { e: "🍎", n: "maçã", g: "objeto" },
  { e: "👟", n: "sapato", g: "objeto" }, { e: "🪑", n: "cadeira", g: "objeto" },
  { e: "🚗", n: "carro", g: "objeto" }, { e: "🔔", n: "sino", g: "objeto" },
];

interface SILevel { count: number; audio: boolean; similar: boolean; distractors: number; showMs: number; }
const SI_LEVELS: Record<number, SILevel> = {
  1:  { count: 3, audio: false, similar: false, distractors: 2, showMs: 1000 },
  2:  { count: 4, audio: false, similar: false, distractors: 2, showMs: 1000 },
  3:  { count: 5, audio: false, similar: false, distractors: 3, showMs: 950 },
  4:  { count: 5, audio: false, similar: true,  distractors: 3, showMs: 950 },
  5:  { count: 6, audio: false, similar: false, distractors: 4, showMs: 900 },
  6:  { count: 4, audio: true,  similar: false, distractors: 4, showMs: 900 },
  7:  { count: 5, audio: true,  similar: false, distractors: 5, showMs: 900 },
  8:  { count: 6, audio: true,  similar: false, distractors: 5, showMs: 850 },
  9:  { count: 6, audio: false, similar: true,  distractors: 5, showMs: 650 },
  10: { count: 7, audio: false, similar: true,  distractors: 6, showMs: 550 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 8;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setTimeout(resolve, 700); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR"; u.rate = 0.85;
      u.onend = () => resolve(); u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
      setTimeout(resolve, 1700);
    } catch { setTimeout(resolve, 700); }
  });
}

type Phase = "ready" | "show" | "input" | "feedback";

export function SequenciaItens({ difficulty, onComplete }: SequenciaItensProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = SI_LEVELS[startLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [sequence, setSequence] = useState<Item[]>([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [keys, setKeys] = useState<Item[]>([]);
  const [entered, setEntered] = useState<Item[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const enteredRef = useRef<Item[]>([]);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);

  const present = useCallback(async (seq: Item[], myRun: number) => {
    await new Promise((r) => setTimeout(r, 400));
    for (let i = 0; i < seq.length; i++) {
      if (runRef.current !== myRun) return;
      setShowIdx(i);
      if (spec.audio) await speak(seq[i].n);
      else await new Promise((r) => setTimeout(r, spec.showMs));
      if (runRef.current !== myRun) return;
      setShowIdx(-1);
      await new Promise((r) => setTimeout(r, spec.audio ? 360 : 480)); // mais tempo entre um item e o outro
    }
    if (runRef.current !== myRun) return;
    // teclado: itens da sequência + distratores
    const used = new Set(seq.map((s) => s.e));
    let pool = ITEMS.filter((x) => !used.has(x.e));
    if (spec.similar && seq[0]) pool = [...pool.filter((x) => x.g === seq[0].g), ...pool].filter((x, i, arr) => arr.findIndex((y) => y.e === x.e) === i);
    const distractors = shuffle(pool).slice(0, spec.distractors);
    setKeys(shuffle([...seq, ...distractors]));
    setEntered([]); enteredRef.current = [];
    inputAt.current = Date.now();
    setPhase("input");
  }, [spec]);

  const startRound = useCallback(() => {
    let pool = ITEMS;
    if (spec.similar) { const g = Math.random() < 0.5 ? "animal" : "objeto"; pool = ITEMS.filter((x) => x.g === g); }
    const seq = shuffle(pool).slice(0, spec.count);
    runRef.current++;
    setSequence(seq); setFeedback(null); setShowIdx(-1);
    setPhase("show");
    present(seq, runRef.current);
  }, [spec, present]);

  const finish = useCallback(() => {
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "sequencia-itens",
      domain: "memory",
      score: calculateExerciseScore("span-numerico", accTotal, meanRT ?? undefined, difficulty),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: startLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        level: startLevel,
        startedLevel: startLevel,
        items: spec.count,
        distractors: spec.distractors,
        presentation: spec.audio ? "auditiva" : "visual",
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec]);

  const validate = useCallback((entry: Item[]) => {
    const correct = entry.map((x) => x.e).join("·") === sequence.map((x) => x.e).join("·");
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, correct ? 1200 : 2200);
  }, [sequence, trial, reportProgress, startRound, finish]);

  function handleKey(it: Item) {
    if (phase !== "input" || enteredRef.current.length >= spec.count) return;
    const next = [...enteredRef.current, it];
    enteredRef.current = next; setEntered(next);
    if (next.length >= spec.count) validate(next);
  }

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  function begin() { correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0); startRound(); }

  if (phase === "ready") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
        <div className="w-full max-w-lg rounded-3xl p-6 text-center" style={CARD}>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.5), rgba(30,27,75,0.9))", border: "1px solid rgba(129,140,248,0.5)" }}>
            {spec.audio ? <Headphones size={40} color="#c7d2fe" /> : <Eye size={40} color="#c7d2fe" />}
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Sequência de Itens</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.85)" }}>
            {spec.audio ? "Ouça" : "Veja"} a sequência de figuras e depois selecione na mesma ordem.
          </p>
          <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.55)" }}>
            Você começa no nível {startLevel} ({spec.count} itens) — onde parou da última vez.
          </p>
          <button onClick={begin} className="w-full rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-lg rounded-3xl p-6 space-y-4" style={CARD}>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Sequência de Itens</p>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
            Nível {startLevel} · {spec.count} itens · {spec.audio ? "áudio" : "visual"}{spec.similar ? " · semelhantes" : ""}
          </p>
        </div>
        <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg,#6366f1,#818cf8)" }}
            animate={{ width: `${(trial / TRIALS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {phase === "show" && (
          <div className="flex flex-col items-center gap-4 py-6" style={{ minHeight: 200 }}>
            <p className="text-sm font-semibold" style={{ color: "#a5b4fc" }}>{spec.audio ? "🔊 Ouça com atenção" : "👀 Memorize a sequência"}</p>
            <div className="flex items-center justify-center" style={{ height: 110 }}>
              <AnimatePresence mode="wait">
                {showIdx >= 0 && !spec.audio && (
                  <motion.div key={showIdx} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl"
                    style={{ background: "linear-gradient(135deg,#312e81,#4c1d95)", boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}>
                    {sequence[showIdx] && <ItemVisual name={sequence[showIdx].n} emoji={sequence[showIdx].e} size={78} />}
                  </motion.div>
                )}
                {spec.audio && (
                  <motion.div animate={{ scale: showIdx >= 0 ? [1, 1.15, 1] : 1 }} transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), rgba(30,27,75,0.9))", border: "1px solid rgba(129,140,248,0.5)" }}>
                    <Headphones size={44} color="#c7d2fe" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5">{sequence.map((_, i) => (<div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === showIdx ? "#a5b4fc" : "rgba(148,163,184,0.25)" }} />))}</div>
          </div>
        )}

        {phase === "input" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-center text-white">Toque na MESMA ordem</p>
            <div className="flex gap-2 flex-wrap justify-center min-h-[44px]">
              {Array.from({ length: spec.count }).map((_, i) => (
                <div key={i} className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(99,102,241,0.3)" }}>{entered[i] && <ItemVisual name={entered[i].n} emoji={entered[i].e} size={34} />}</div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2.5 w-full mt-1">
              {keys.map((it, i) => {
                const used = entered.filter((e) => e.e === it.e).length >= 1;
                return (
                  <button key={`${it.e}-${i}`} onClick={() => handleKey(it)} disabled={used}
                    className="h-16 rounded-2xl text-3xl active:scale-95 transition-transform disabled:opacity-25 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(99,102,241,0.35)" }}><ItemVisual name={it.n} emoji={it.e} size={46} /></button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}>{feedback === "correct" ? "Correto" : "Incorreto"}</p>
            {feedback === "incorrect" && (
              <div className="flex flex-col items-center gap-2 mt-1">
                <div className="flex items-center gap-2">{sequence.map((x, i) => <ItemVisual key={i} name={x.n} emoji={x.e} size={44} />)}</div>
                <div className="flex items-center gap-2">
                  <span className="text-base" style={{ color: "rgba(148,163,184,0.6)" }}>Você:</span>
                  {entered.length ? entered.map((x, i) => <ItemVisual key={i} name={x.n} emoji={x.e} size={34} />) : <span style={{ color: "rgba(148,163,184,0.6)" }}>—</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end text-xs pt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
          <span>{correctRef.current} acertos</span>
        </div>
      </div>
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(10,16,34,0.9)",
  border: "1px solid rgba(148,163,184,0.12)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};
