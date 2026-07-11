"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

interface ListaDistracaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Progressão (10 níveis) ───────────────────────────────────────────────────
interface LDLevel { count: number; order: boolean; tasks: number; distractors: number; memMs: number; }
const LD_LEVELS: Record<number, LDLevel> = {
  1:  { count: 3, order: false, tasks: 1, distractors: 2, memMs: 3200 },
  2:  { count: 4, order: false, tasks: 1, distractors: 3, memMs: 3400 },
  3:  { count: 4, order: true,  tasks: 1, distractors: 3, memMs: 3400 },
  4:  { count: 5, order: true,  tasks: 2, distractors: 4, memMs: 3800 },
  5:  { count: 5, order: false, tasks: 3, distractors: 5, memMs: 3800 },
  6:  { count: 6, order: true,  tasks: 2, distractors: 5, memMs: 4200 },
  7:  { count: 6, order: false, tasks: 3, distractors: 6, memMs: 4200 },
  8:  { count: 7, order: true,  tasks: 2, distractors: 6, memMs: 4600 },
  9:  { count: 7, order: true,  tasks: 3, distractors: 6, memMs: 4400 },
  10: { count: 8, order: true,  tasks: 3, distractors: 7, memMs: 4800 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));

const WORDS = ["maçã", "pão", "leite", "chave", "copo", "flor", "bola", "livro", "sapato", "cadeira", "caneta", "peixe", "queijo", "meia"];

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// ── Mini-tarefa distratora ───────────────────────────────────────────────────
type Distract =
  | { kind: "maior"; a: number; b: number; answer: number }
  | { kind: "contar"; n: number; options: number[] }
  | { kind: "cor"; target: string; colors: { name: string; hex: string }[] };

const COLORS = [
  { name: "azul", hex: "#3b82f6" }, { name: "verde", hex: "#22c55e" },
  { name: "vermelho", hex: "#ef4444" }, { name: "amarelo", hex: "#eab308" },
];

function makeDistract(): Distract {
  const k = Math.floor(Math.random() * 3);
  if (k === 0) {
    let a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9);
    while (a === b) b = 1 + Math.floor(Math.random() * 9);
    return { kind: "maior", a, b, answer: Math.max(a, b) };
  }
  if (k === 1) {
    const n = 2 + Math.floor(Math.random() * 5);
    const opts = shuffle([n, n + 1, n - 1 < 1 ? n + 2 : n - 1]);
    return { kind: "contar", n, options: opts };
  }
  const cols = shuffle(COLORS);
  return { kind: "cor", target: cols[0].name, colors: shuffle(cols) };
}

type Phase = "ready" | "memorize" | "distract" | "recall" | "feedback";

export function ListaDistracao({ difficulty, onComplete }: ListaDistracaoProps) {
  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
  const startLevel = levelOf(difficulty);
  const [level, setLevel] = useState(startLevel);
  const spec = LD_LEVELS[level];
  const levelRef = useRef(startLevel); // nível atual p/ a próxima rodada (evita closure antigo)
  const streakRef = useRef(0);
  const reachedRef = useRef(startLevel);
  const totalRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("ready");
  const [list, setList] = useState<string[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [distract, setDistract] = useState<Distract | null>(null);
  const [taskNo, setTaskNo] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const recallAt = useRef(0);
  const pickedRef = useRef<string[]>([]);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);
  const memTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goRecall = useCallback((l: string[], myRun: number, s: typeof spec) => {
    if (runRef.current !== myRun) return;
    const pool = WORDS.filter((w) => !l.includes(w));
    const distractors = shuffle(pool).slice(0, s.distractors);
    setKeys(shuffle([...l, ...distractors]));
    setPicked([]); pickedRef.current = [];
    recallAt.current = Date.now();
    setPhase("recall");
  }, []);

  const runDistract = useCallback((l: string[], idx: number, myRun: number, s: typeof spec) => {
    if (runRef.current !== myRun) return;
    if (idx >= s.tasks) { goRecall(l, myRun, s); return; }
    setTaskNo(idx);
    setDistract(makeDistract());
    setPhase("distract");
  }, [goRecall]);

  const startRound = useCallback(() => {
    const s = LD_LEVELS[levelRef.current]; // nível atual, não o do closure
    const l = shuffle(WORDS).slice(0, s.count);
    runRef.current++;
    const myRun = runRef.current;
    setList(l); setFeedback(null);
    setPhase("memorize");
    memTimer.current = setTimeout(() => runDistract(l, 0, myRun, s), s.memMs);
  }, [runDistract]);

  const finish = useCallback(() => {
    finishTimer();
    const total = Math.max(1, totalRef.current);
    const accTotal = correctRef.current / total;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    onComplete({
      exerciseId: "lista-distracao",
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
        order: spec.order,
        distractionTasks: spec.tasks,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: total - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, startLevel, spec, finishTimer, elapsedSec]);

  const submit = useCallback((picks: string[]) => {
    const correct = spec.order
      ? picks.join("·") === list.join("·")
      : picks.length === list.length && list.every((w) => picks.includes(w));
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - recallAt.current);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    totalRef.current++;
    // "Musculação": 2 acertos seguidos → sobe o nível; 2 erros seguidos → desce.
    streakRef.current = correct ? Math.max(0, streakRef.current) + 1 : Math.min(0, streakRef.current) - 1;
    if (streakRef.current >= 2) { streakRef.current = 0; setLevel((l) => { const nl = Math.min(10, l + 1); reachedRef.current = Math.max(reachedRef.current, nl); return nl; }); }
    else if (streakRef.current <= -2) { streakRef.current = 0; setLevel((l) => Math.max(1, l - 1)); }
    const timeUp = isTimeUp();
    setTimeout(() => { if (timeUp) finish(); else startRound(); }, correct ? 1300 : 2400);
  }, [spec, list, startRound, finish, isTimeUp]);

  function pickWord(w: string) {
    if (phase !== "recall" || pickedRef.current.includes(w) || pickedRef.current.length >= spec.count) return;
    const next = [...pickedRef.current, w];
    pickedRef.current = next; setPicked(next);
    if (next.length >= spec.count) setTimeout(() => submit(next), 200);
  }

  function answerDistract() {
    // qualquer resposta avança (a distração serve para interferir, não para pontuar).
    // Dentro da rodada o nível não muda, então a spec do nível atual é a da rodada.
    const myRun = runRef.current;
    runDistract(list, taskNo + 1, myRun, LD_LEVELS[levelRef.current]);
  }

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => () => { runRef.current++; if (memTimer.current) clearTimeout(memTimer.current); }, []);

  function begin() { correctRef.current = 0; totalRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); startTimer(); startRound(); }

  if (phase === "ready") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
        <div className="w-full max-w-lg rounded-3xl p-6 text-center" style={CARD}>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 38% 32%, rgba(34,211,197,0.4), rgba(15,40,60,0.9))", border: "1px solid rgba(34,211,197,0.5)" }}>
            <ListChecks size={40} color="#5eead4" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Lista com Distração</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.85)" }}>
            Memorize a lista, faça uma tarefinha rápida e depois recupere os itens.
          </p>
          <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.55)" }}>
            Você começa no nível {startLevel} ({spec.count} itens{spec.order ? ", em ordem" : ""}) — onde parou da última vez.
          </p>
          <button onClick={begin} className="w-full rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
            style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", boxShadow: "0 4px 20px rgba(13,148,136,0.5)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#020617" }}>
      <div className="w-full max-w-lg rounded-3xl p-6 space-y-4" style={CARD}>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Lista com Distração</p>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
            Nível {level} · {spec.count} itens · {spec.order ? "em ordem" : "reconhecer"}
          </p>
        </div>
        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />

        {/* Etapa 1 — memorizar */}
        {phase === "memorize" && (
          <div className="flex flex-col items-center gap-4 py-4" style={{ minHeight: 200 }}>
            <p className="text-sm font-semibold" style={{ color: "#5eead4" }}>1️⃣ Memorize a lista</p>
            <div className="flex flex-col items-center gap-2">
              {list.map((w, i) => (
                <motion.div key={w} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                  className="px-5 py-2 rounded-xl font-bold text-xl text-white" style={{ background: "rgba(34,211,197,0.14)", border: "1px solid rgba(34,211,197,0.3)" }}>
                  {w}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 2 — distração */}
        {phase === "distract" && distract && (
          <div className="flex flex-col items-center gap-4 py-4" style={{ minHeight: 200 }}>
            <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>2️⃣ Tarefinha rápida ({taskNo + 1}/{spec.tasks})</p>
            {distract.kind === "maior" && (
              <>
                <p className="text-white text-sm">Toque no número MAIOR</p>
                <div className="flex gap-4">
                  {[distract.a, distract.b].map((n, i) => (
                    <button key={i} onClick={answerDistract} className="w-20 h-20 rounded-2xl font-black text-4xl text-white active:scale-95"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(251,191,36,0.4)" }}>{n}</button>
                  ))}
                </div>
              </>
            )}
            {distract.kind === "contar" && (
              <>
                <p className="text-white text-sm">Quantas estrelas?</p>
                <div className="text-3xl">{"⭐".repeat(distract.n)}</div>
                <div className="flex gap-3">
                  {distract.options.map((o, i) => (
                    <button key={i} onClick={answerDistract} className="w-16 h-16 rounded-2xl font-black text-2xl text-white active:scale-95"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(251,191,36,0.4)" }}>{o}</button>
                  ))}
                </div>
              </>
            )}
            {distract.kind === "cor" && (
              <>
                <p className="text-white text-sm">Toque na cor <b style={{ textTransform: "uppercase" }}>{distract.target}</b></p>
                <div className="flex gap-3">
                  {distract.colors.map((c, i) => (
                    <button key={i} onClick={answerDistract} className="w-16 h-16 rounded-full active:scale-95"
                      style={{ background: c.hex, border: "2px solid rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Etapa 3 — recuperar */}
        {phase === "recall" && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-center text-white">
              3️⃣ {spec.order ? "Toque os itens NA ORDEM da lista" : "Toque os itens que estavam na lista"}
            </p>
            <div className="flex gap-2 flex-wrap justify-center min-h-[36px]">
              {picked.map((w, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-bold text-white" style={{ background: "rgba(34,211,197,0.2)", border: "1px solid rgba(34,211,197,0.4)" }}>{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              {keys.map((w, i) => {
                const used = picked.includes(w);
                return (
                  <button key={`${w}-${i}`} onClick={() => pickWord(w)} disabled={used}
                    className="py-3 rounded-xl text-sm font-bold text-white active:scale-95 disabled:opacity-25"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(34,211,197,0.3)" }}>{w}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}>{feedback === "correct" ? "Correto" : "Incorreto"}</p>
            {feedback === "incorrect" && (
              <div className="text-center text-sm space-y-1 mt-1">
                <p style={{ color: "rgba(148,163,184,0.85)" }}>Lista: <span className="font-bold text-white">{list.join(" — ")}</span></p>
                <p style={{ color: "rgba(148,163,184,0.6)" }}>Você: <span className="font-semibold">{picked.join(" — ") || "—"}</span></p>
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
