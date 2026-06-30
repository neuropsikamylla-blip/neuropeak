"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Headphones } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

interface LetrasSequenciaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Progressão (10 níveis) ───────────────────────────────────────────────────
interface LSLevel { count: number; reverse: boolean; audio: boolean; syllable: boolean; showMs: number; }
const LS_LEVELS: Record<number, LSLevel> = {
  1:  { count: 3, reverse: false, audio: false, syllable: false, showMs: 950 },
  2:  { count: 4, reverse: false, audio: false, syllable: false, showMs: 950 },
  3:  { count: 5, reverse: false, audio: false, syllable: false, showMs: 900 },
  4:  { count: 4, reverse: true,  audio: false, syllable: false, showMs: 950 },
  5:  { count: 5, reverse: true,  audio: false, syllable: false, showMs: 900 },
  6:  { count: 5, reverse: false, audio: true,  syllable: true,  showMs: 900 },
  7:  { count: 5, reverse: true,  audio: true,  syllable: true,  showMs: 900 },
  8:  { count: 6, reverse: true,  audio: true,  syllable: true,  showMs: 850 },
  9:  { count: 7, reverse: true,  audio: false, syllable: true,  showMs: 700 },
  10: { count: 8, reverse: true,  audio: false, syllable: true,  showMs: 600 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));

const LETTERS = ["B", "F", "M", "R", "T", "L", "P", "S", "C", "V", "G", "D"];
const SYLLABLES = ["BA", "ME", "TO", "LI", "PA", "RU", "CO", "FE", "NA", "DI", "SO", "VE"];

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function sample<T>(pool: T[], n: number): T[] { return shuffle(pool).slice(0, n); }

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setTimeout(resolve, 600); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR"; u.rate = 0.8;
      u.onend = () => resolve(); u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
      setTimeout(resolve, 1600); // fallback se o evento não disparar
    } catch { setTimeout(resolve, 600); }
  });
}

type Phase = "ready" | "show" | "input" | "feedback";

export function LetrasSequencia({ difficulty, onComplete }: LetrasSequenciaProps) {
  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
  const startLevel = levelOf(difficulty);
  const [level, setLevel] = useState(startLevel);
  const spec = LS_LEVELS[level];
  const streakRef = useRef(0);
  const reachedRef = useRef(startLevel);
  const totalRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("ready");
  const [sequence, setSequence] = useState<string[]>([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [keys, setKeys] = useState<string[]>([]);
  const [entered, setEntered] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputShownAt = useRef(0);
  const enteredRef = useRef<string[]>([]);
  const startTime = useRef(Date.now());
  const seqRunRef = useRef(0);

  const expected = spec.reverse ? [...sequence].reverse() : sequence;

  const present = useCallback(async (seq: string[], myRun: number) => {
    const pool = spec.syllable ? SYLLABLES : LETTERS;
    await new Promise((r) => setTimeout(r, 400));
    for (let i = 0; i < seq.length; i++) {
      if (seqRunRef.current !== myRun) return;
      setShowIdx(i);
      if (spec.audio) {
        await speak(seq[i]);
      } else {
        await new Promise((r) => setTimeout(r, spec.showMs));
      }
      if (seqRunRef.current !== myRun) return;
      setShowIdx(-1);
      await new Promise((r) => setTimeout(r, spec.audio ? 360 : 480)); // mais tempo entre um item e o outro
    }
    if (seqRunRef.current !== myRun) return;
    // monta o teclado: itens da sequência + distratores
    const distractors = sample(pool.filter((x) => !seq.includes(x)), Math.min(2, 4));
    setKeys(shuffle([...seq, ...distractors]));
    setEntered([]);
    enteredRef.current = [];
    inputShownAt.current = Date.now();
    setPhase("input");
  }, [spec]);

  const startRound = useCallback(() => {
    const pool = spec.syllable ? SYLLABLES : LETTERS;
    const seq = sample(pool, spec.count);
    seqRunRef.current++;
    setSequence(seq);
    setFeedback(null);
    setShowIdx(-1);
    setPhase("show");
    present(seq, seqRunRef.current);
  }, [spec, present]);

  const finish = useCallback(() => {
    finishTimer();
    const total = Math.max(1, totalRef.current);
    const accTotal = correctRef.current / total;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    onComplete({
      exerciseId: "letras-sequencia",
      domain: "memory",
      score: calculateExerciseScore("span-numerico", accTotal, meanRT ?? undefined, reachedRef.current),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: reachedRef.current,
      duration: elapsedSec(),
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        level: reachedRef.current,
        startedLevel: startLevel,
        items: spec.count,
        stimulus: spec.syllable ? "silaba" : "letra",
        modality: spec.reverse ? "inversa" : "direta",
        presentation: spec.audio ? "auditiva" : "visual",
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: total - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, startLevel, spec, finishTimer, elapsedSec]);

  const validate = useCallback((entry: string[]) => {
    const correct = entry.join("·") === expected.join("·");
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputShownAt.current);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    totalRef.current++;
    // "Musculação": 2 acertos seguidos → sobe o nível; 2 erros seguidos → desce.
    streakRef.current = correct ? Math.max(0, streakRef.current) + 1 : Math.min(0, streakRef.current) - 1;
    if (streakRef.current >= 2) { streakRef.current = 0; setLevel((l) => { const nl = Math.min(10, l + 1); reachedRef.current = Math.max(reachedRef.current, nl); return nl; }); }
    else if (streakRef.current <= -2) { streakRef.current = 0; setLevel((l) => Math.max(1, l - 1)); }
    const timeUp = isTimeUp();
    setTimeout(() => {
      if (timeUp) { finish(); }
      else { startRound(); }
    }, correct ? 1300 : 2400);
  }, [expected, startRound, finish, isTimeUp]);

  function handleKey(k: string) {
    if (phase !== "input" || enteredRef.current.length >= spec.count) return;
    const next = [...enteredRef.current, k];
    enteredRef.current = next;
    setEntered(next);
    if (next.length >= spec.count) validate(next);
  }

  useEffect(() => () => { seqRunRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  function begin() {
    correctRef.current = 0;
    totalRef.current = 0;
    rtsRef.current = [];
    startTime.current = Date.now();
    startTimer();
    startRound();
  }

  // ── Tela inicial ──────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
        <div className="w-full max-w-lg rounded-3xl p-6 text-center" style={CARD}>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.5), rgba(30,27,75,0.9))", border: "1px solid rgba(129,140,248,0.5)" }}>
            {spec.audio ? <Headphones size={40} color="#c7d2fe" /> : <Eye size={40} color="#c7d2fe" />}
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Letras em Sequência</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.85)" }}>
            {spec.audio ? "Ouça" : "Veja"} a sequência e repita na ordem {spec.reverse ? "INVERSA" : "apresentada"}.
          </p>
          <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.55)" }}>
            Você começa no nível {startLevel} ({spec.count} {spec.syllable ? "sílabas" : "letras"}) — onde parou da última vez.
          </p>
          <button onClick={begin}
            className="w-full rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
            Começar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-lg rounded-3xl p-6 space-y-5" style={CARD}>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Letras em Sequência</p>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
            Nível {startLevel} · {spec.count} {spec.syllable ? "sílabas" : "letras"} · {spec.reverse ? "inversa" : "direta"} · {spec.audio ? "áudio" : "visual"}
          </p>
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />

        {/* Apresentação */}
        {phase === "show" && (
          <div className="flex flex-col items-center gap-4 py-6" style={{ minHeight: 200 }}>
            <p className="text-sm font-semibold" style={{ color: "#a5b4fc" }}>
              {spec.audio ? "🔊 Ouça com atenção" : "👀 Memorize a sequência"}
            </p>
            <div className="flex items-center justify-center" style={{ height: 110 }}>
              <AnimatePresence mode="wait">
                {showIdx >= 0 && !spec.audio && (
                  <motion.div key={showIdx} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl text-white"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}>
                    {sequence[showIdx]}
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
            <div className="flex gap-1.5">
              {sequence.map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === showIdx ? "#a5b4fc" : "rgba(148,163,184,0.25)" }} />
              ))}
            </div>
          </div>
        )}

        {/* Resposta */}
        {phase === "input" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-center text-white">
              Toque {spec.reverse ? "na ordem INVERSA" : "na MESMA ordem"}
            </p>
            <div className="flex gap-2 flex-wrap justify-center min-h-[40px]">
              {Array.from({ length: spec.count }).map((_, i) => (
                <div key={i} className="w-10 h-12 rounded-xl flex items-center justify-center font-black text-xl border"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(99,102,241,0.3)", color: "#e0e7ff" }}>
                  {entered[i] ?? ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2.5 w-full mt-1">
              {keys.map((k, i) => {
                const used = entered.filter((e) => e === k).length >= keys.filter((x) => x === k).length;
                return (
                  <button key={`${k}-${i}`} onClick={() => handleKey(k)} disabled={used}
                    className="h-16 rounded-2xl font-black text-2xl active:scale-95 transition-transform disabled:opacity-30"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(99,102,241,0.35)", color: "#e0e7ff" }}>
                    {k}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">
              {feedback === "correct" ? "✅" : "❌"}
            </motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}>
              {feedback === "correct" ? "Correto" : "Incorreto"}
            </p>
            {feedback === "incorrect" && (
              <div className="text-center text-sm space-y-1 mt-1">
                <p style={{ color: "rgba(148,163,184,0.85)" }}>Correto: <span className="font-bold text-white">{expected.join(" — ")}</span></p>
                <p style={{ color: "rgba(148,163,184,0.6)" }}>Você: <span className="font-semibold">{entered.join(" — ") || "—"}</span></p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(10,16,34,0.9)",
  border: "1px solid rgba(148,163,184,0.12)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};
