"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, UtensilsCrossed } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface RestauranteOrdemProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Item { n: string; e: string; art: "o" | "a"; }
const ITEMS: Item[] = [
  { n: "água", e: "💧", art: "a" }, { n: "suco", e: "🧃", art: "o" },
  { n: "café", e: "☕", art: "o" }, { n: "chá", e: "🍵", art: "o" },
  { n: "sanduíche", e: "🥪", art: "o" }, { n: "salada", e: "🥗", art: "a" },
  { n: "sopa", e: "🍲", art: "a" }, { n: "bolo", e: "🍰", art: "o" },
  { n: "maçã", e: "🍎", art: "a" }, { n: "pão", e: "🍞", art: "o" },
  { n: "queijo", e: "🧀", art: "o" }, { n: "garfo", e: "🍴", art: "o" },
  { n: "colher", e: "🥄", art: "a" }, { n: "prato", e: "🍽️", art: "o" },
  { n: "copo", e: "🥤", art: "o" },
];

type Mode = "direta" | "inversa" | "exclusao";
interface RLevel { count: number; mode: Mode; audio: boolean; distractors: number; }
const R_LEVELS: Record<number, RLevel> = {
  1:  { count: 2, mode: "direta",   audio: false, distractors: 2 },
  2:  { count: 3, mode: "direta",   audio: false, distractors: 2 },
  3:  { count: 4, mode: "direta",   audio: false, distractors: 3 },
  4:  { count: 3, mode: "direta",   audio: true,  distractors: 3 },
  5:  { count: 4, mode: "direta",   audio: true,  distractors: 4 },
  6:  { count: 3, mode: "inversa",  audio: false, distractors: 3 },
  7:  { count: 4, mode: "inversa",  audio: true,  distractors: 4 },
  8:  { count: 4, mode: "exclusao", audio: false, distractors: 4 },
  9:  { count: 5, mode: "exclusao", audio: true,  distractors: 5 },
  10: { count: 5, mode: "inversa",  audio: true,  distractors: 6 },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 6;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function listText(items: Item[]): string {
  const p = items.map((it) => `${it.art} ${it.n}`);
  return p.length === 1 ? p[0] : p.slice(0, -1).join(", ") + " e " + p[p.length - 1];
}
function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setTimeout(resolve, 1200); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR"; u.rate = 0.92;
      u.onend = () => resolve(); u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
      setTimeout(resolve, Math.max(2500, text.length * 90));
    } catch { setTimeout(resolve, 1200); }
  });
}

type Phase = "ready" | "order" | "input" | "feedback";

export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = R_LEVELS[startLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [order, setOrder] = useState<Item[]>([]);      // itens citados no pedido
  const [excluded, setExcluded] = useState<Item | null>(null);
  const [expected, setExpected] = useState<Item[]>([]); // resposta correta (ordem aplicada)
  const [sentence, setSentence] = useState("");
  const [keys, setKeys] = useState<Item[]>([]);
  const [tray, setTray] = useState<Item[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const trayRef = useRef<Item[]>([]);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);

  const modeHint = spec.mode === "inversa" ? "Monte começando pelo ÚLTIMO item (ordem inversa)."
    : spec.mode === "exclusao" ? "NÃO coloque o item que o pedido mandou ignorar."
    : "Monte na ordem do pedido.";

  const startRound = useCallback(async () => {
    runRef.current++; const myRun = runRef.current;
    const picks = shuffle(ITEMS).slice(0, spec.count);
    let exc: Item | null = null;
    let exp: Item[];
    if (spec.mode === "exclusao") {
      exc = picks[1 + Math.floor(Math.random() * (picks.length - 1))]; // não o primeiro
      exp = picks.filter((x) => x.n !== exc!.n);
    } else if (spec.mode === "inversa") {
      exp = [...picks].reverse();
    } else exp = picks;
    const sent = spec.mode === "exclusao"
      ? `Pegue ${listText(picks)}, mas NÃO coloque ${exc!.art} ${exc!.n}.`
      : `Pegue ${listText(picks)}.`;
    const distract = shuffle(ITEMS.filter((x) => !picks.some((p) => p.n === x.n))).slice(0, spec.distractors);

    setOrder(picks); setExcluded(exc); setExpected(exp); setSentence(sent);
    setKeys(shuffle([...picks, ...distract]));
    setTray([]); trayRef.current = [];
    setFeedback(null);
    setPhase("order");

    if (spec.audio) {
      setSpeaking(true);
      await speak(sent);
      if (runRef.current !== myRun) return;
      setSpeaking(false);
    }
  }, [spec]);

  const finish = useCallback(() => {
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "restaurante-ordem",
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
        rule: spec.mode,
        presentation: spec.audio ? "auditiva" : "visual",
        distractors: spec.distractors,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec]);

  const validate = useCallback((picks: Item[]) => {
    const correct = picks.map((x) => x.n).join("·") === expected.map((x) => x.n).join("·");
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, correct ? 1400 : 2600);
  }, [expected, trial, reportProgress, startRound, finish]);

  function place(it: Item) {
    if (phase !== "input" || trayRef.current.some((x) => x.n === it.n)) return;
    const next = [...trayRef.current, it];
    trayRef.current = next; setTray(next);
    if (next.length >= expected.length) setTimeout(() => validate(next), 250);
  }
  function undo() {
    if (phase !== "input") return;
    const next = trayRef.current.slice(0, -1);
    trayRef.current = next; setTray(next);
  }
  function goInput() { inputAt.current = Date.now(); setPhase("input"); }

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);
  function begin() { correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0); startRound(); }

  if (phase === "ready") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#1a0f08" }}>
        <div className="w-full max-w-md rounded-3xl p-6 text-center" style={CARD}>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "radial-gradient(circle at 38% 32%, rgba(251,146,60,0.5), rgba(60,30,10,0.9))", border: "1px solid rgba(251,146,60,0.5)" }}>
            <UtensilsCrossed size={40} color="#fed7aa" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Restaurante — Ordem de Instruções</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(214,211,209,0.85)" }}>
            Ouça ou leia o pedido do cliente e prepare a bandeja na ordem correta.
          </p>
          <p className="text-xs mb-5" style={{ color: "rgba(214,211,209,0.55)" }}>
            Você começa no nível {startLevel} ({spec.count} itens · {spec.mode}) — onde parou da última vez.
          </p>
          <button onClick={begin} className="w-full rounded-2xl font-bold text-white text-sm py-3.5 active:scale-95"
            style={{ background: "linear-gradient(135deg,#ea580c,#d97706)", boxShadow: "0 4px 20px rgba(234,88,12,0.5)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#1a0f08" }}>
      <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={CARD}>
        <div>
          <p className="text-sm font-bold text-white leading-tight">🍽️ Restaurante</p>
          <p className="text-xs mt-1" style={{ color: "rgba(214,211,209,0.7)" }}>
            Nível {startLevel} · {spec.count} itens · {spec.mode} · {spec.audio ? "áudio" : "texto"}
          </p>
        </div>
        <div className="relative h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg,#f97316,#fb923c)" }}
            animate={{ width: `${(trial / TRIALS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Pedido */}
        {phase === "order" && (
          <div className="flex flex-col items-center gap-4 py-3">
            <p className="text-sm font-semibold" style={{ color: "#fdba74" }}>📋 Pedido do cliente</p>
            {spec.audio ? (
              <div className="flex flex-col items-center gap-3">
                <motion.div animate={{ scale: speaking ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "radial-gradient(circle, rgba(251,146,60,0.4), rgba(60,30,10,0.9))", border: "1px solid rgba(251,146,60,0.5)" }}>
                  <Volume2 size={40} color="#fed7aa" />
                </motion.div>
                <button onClick={() => speak(sentence)} className="text-xs font-semibold px-4 py-2 rounded-xl active:scale-95"
                  style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.4)", color: "#fed7aa" }}>
                  🔊 Ouvir de novo
                </button>
              </div>
            ) : (
              <p className="text-center text-lg font-semibold text-white px-2 py-3 rounded-2xl"
                style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)" }}>
                {sentence}
              </p>
            )}
            <p className="text-xs text-center" style={{ color: "rgba(214,211,209,0.6)" }}>{modeHint}</p>
            <button onClick={goInput} className="w-full rounded-2xl font-bold text-white text-sm py-3 active:scale-95"
              style={{ background: "linear-gradient(135deg,#ea580c,#d97706)" }}>Montar bandeja →</button>
          </div>
        )}

        {/* Montar bandeja */}
        {phase === "input" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-center text-white">{modeHint}</p>
            {/* bandeja */}
            <div className="w-full rounded-2xl p-3 flex items-center gap-2 flex-wrap min-h-[60px] justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1.5px dashed rgba(251,146,60,0.4)" }}>
              {tray.length === 0 && <span className="text-xs" style={{ color: "rgba(214,211,209,0.4)" }}>bandeja vazia</span>}
              {tray.map((it, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-2xl"
                  style={{ background: "rgba(251,146,60,0.18)", border: "1px solid rgba(251,146,60,0.4)" }}>
                  <span className="text-[10px] font-bold" style={{ color: "#fed7aa" }}>{i + 1}</span>{it.e}
                </span>
              ))}
            </div>
            {tray.length > 0 && (
              <button onClick={undo} className="text-xs px-3 py-1 rounded-lg" style={{ color: "rgba(214,211,209,0.7)", background: "rgba(255,255,255,0.05)" }}>↩ desfazer</button>
            )}
            <div className="grid grid-cols-4 gap-2.5 w-full mt-1">
              {keys.map((it, i) => {
                const used = tray.some((x) => x.n === it.n);
                return (
                  <button key={`${it.n}-${i}`} onClick={() => place(it)} disabled={used}
                    className="h-16 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-25"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(251,146,60,0.35)" }}>
                    <span className="text-2xl leading-none">{it.e}</span>
                    <span className="text-[9px] mt-0.5" style={{ color: "rgba(214,211,209,0.7)" }}>{it.n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}>{feedback === "correct" ? "Pedido certo!" : "Pedido errado"}</p>
            {feedback === "incorrect" && (
              <div className="text-center text-2xl space-y-1 mt-1">
                <p>{expected.map((x) => x.e).join(" ")}</p>
                <p className="text-base" style={{ color: "rgba(214,211,209,0.6)" }}>Você: {tray.map((x) => x.e).join(" ") || "—"}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between text-xs pt-1" style={{ color: "rgba(214,211,209,0.5)" }}>
          <span>Pedido {Math.min(trial + 1, TRIALS)}/{TRIALS}</span>
          <span>{correctRef.current} certos</span>
        </div>
      </div>
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: "rgba(28,18,10,0.92)",
  border: "1px solid rgba(251,191,36,0.14)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};
