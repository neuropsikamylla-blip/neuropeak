"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

// ── Tipos ───────────────────────────────────────────────────────────────────────

/** Configuração definida pelo TERAPEUTA na prescrição (fixa para o paciente). */
export interface SpanSettings {
  trials: number;              // nº de tentativas da sessão
  allowReplay: boolean;        // permitir repetir o áudio
  replayPenalty: boolean;      // repetir custa pontos
  showAnswerOnError: boolean;  // treino (mostra a sequência) × avaliação (não mostra)
}

export const DEFAULT_SPAN_SETTINGS: SpanSettings = {
  trials: 15,
  allowReplay: true,
  replayPenalty: false,
  showAnswerOnError: true,
};

interface SpanNumericoProps {
  difficulty: number;   // 1–10 (progresso do paciente; vira o nível inicial)
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  /** true = ordem inversa (Span Numérico Auditivo Inverso) */
  reverse?: boolean;
  /** Config do terapeuta (prescrição, vinda do JSON do plano). Ausente = padrões. */
  settings?: Record<string, unknown>;
}

/** Normaliza a config (que vem do JSON do plano) com validação de tipo + padrões. */
function normalizeSettings(s?: Record<string, unknown>): SpanSettings {
  return {
    trials:            typeof s?.trials === "number" ? s.trials : DEFAULT_SPAN_SETTINGS.trials,
    allowReplay:       typeof s?.allowReplay === "boolean" ? s.allowReplay : DEFAULT_SPAN_SETTINGS.allowReplay,
    replayPenalty:     typeof s?.replayPenalty === "boolean" ? s.replayPenalty : DEFAULT_SPAN_SETTINGS.replayPenalty,
    showAnswerOnError: typeof s?.showAnswerOnError === "boolean" ? s.showAnswerOnError : DEFAULT_SPAN_SETTINGS.showAnswerOnError,
  };
}

type Phase = "ready" | "listen" | "input" | "feedback";

// ── Constantes ────────────────────────────────────────────────────────────────

const MAX_LEVEL = 7;                          // Nível 7 = 8 dígitos
const digitsForLevel = (lv: number) => lv + 1; // N1=2, N2=3 … N7=8
const clampLevel = (lv: number) => Math.max(1, Math.min(MAX_LEVEL, lv));

// Nível inicial automático a partir do progresso salvo do paciente (difficulty 1–10).
const levelFromDifficulty = (d: number) => clampLevel(Math.ceil(Math.max(1, d) * 0.7));

const KEYPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ── Fundo (estética adulta/limpa) ───────────────────────────────────────────────

function GlassBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(145deg, #020617 0%, #0f172a 35%, #1a1040 65%, #0c1220 100%)" }} />
      <div className="absolute top-[8%] left-[5%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", filter: "blur(64px)" }} />
      <div className="absolute bottom-[10%] right-[8%] w-[440px] h-[440px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter: "blur(72px)" }} />
      <div className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(10,16,34,0.82)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(148,163,184,0.1)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
};

// ── Ícone central: cérebro ouvindo + ondas sonoras ──────────────────────────────

function BrainListening({ pulsing }: { pulsing: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 168, height: 168 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 104 + i * 26, height: 104 + i * 26, border: "1.5px solid rgba(129,140,248,0.4)" }}
          animate={pulsing
            ? { scale: [1, 1.12, 1], opacity: [0.55, 0.12, 0.55] }
            : { scale: 1, opacity: 0.18 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }} />
      ))}
      <div className="relative rounded-full flex items-center justify-center"
        style={{
          width: 100, height: 100,
          background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.55), rgba(30,27,75,0.92))",
          border: "1px solid rgba(129,140,248,0.55)",
          boxShadow: pulsing ? "0 0 44px rgba(99,102,241,0.5)" : "0 0 22px rgba(99,102,241,0.25)",
          transition: "box-shadow 0.3s",
        }}>
        <Headphones size={46} strokeWidth={1.75} color="#c7d2fe" />
      </div>
    </div>
  );
}

// ── Bolinhas (quantidade de itens) ──────────────────────────────────────────────

function Beads({ total, filled, active }: { total: number; filled: number; active: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < filled;
        const isActive = i === active;
        return (
          <motion.div key={i} className="rounded-full"
            style={{
              width: 20, height: 20,
              background: isActive ? "#a5b4fc" : isFilled ? "#6366f1" : "rgba(148,163,184,0.22)",
              boxShadow: isActive ? "0 0 16px rgba(165,180,252,0.9)" : undefined,
            }}
            animate={isActive ? { scale: [1, 1.5, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }} />
        );
      })}
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────────

export function SpanNumerico({ difficulty, onComplete, reverse = false, settings }: SpanNumericoProps) {
  const exerciseId = reverse ? "span-numerico-inverso" : "span-numerico";
  const title = reverse ? "Span Numérico Auditivo Inverso" : "Span Numérico Auditivo Direto";
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  // Config do TERAPEUTA (prescrição) — fixa para o paciente. Ausente = padrões.
  const cfg: SpanSettings = normalizeSettings(settings);
  // Nível inicial AUTOMÁTICO a partir do progresso salvo do paciente.
  const initialLevel = levelFromDifficulty(difficulty);

  const [phase, setPhase]       = useState<Phase>("ready");
  const [level, setLevel]       = useState(initialLevel);
  const [sequence, setSequence] = useState<number[]>([]);
  const [entered, setEntered]   = useState<number[]>([]);
  const [activeBead, setActiveBead] = useState(-1);
  const [trial, setTrial]       = useState(0);
  const [attempts, setAttempts] = useState<{ correct: boolean; digits: number }[]>([]);
  const [points, setPoints]     = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [replayed, setReplayed] = useState(false);

  const streakRef   = useRef(0);
  const levelRef    = useRef(initialLevel);
  const maxLevelRef = useRef(initialLevel);
  const seqIdRef    = useRef(0);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const startTime   = useRef(Date.now());
  const enteredRef  = useRef<number[]>([]);
  const digits = digitsForLevel(level);

  // ── Áudio ──────────────────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, []);

  const playSequence = useCallback(async (seq: number[], myId: number) => {
    // Mais tempo entre os números — e NUNCA mais rápido nos spans longos (6,7,8 dígitos).
    const gap = seq.length >= 6 ? 1000 : 850; // intervalo entre números (ms)
    // pequena pausa antes de começar
    await new Promise<void>(r => setTimeout(r, 500));
    for (let i = 0; i < seq.length; i++) {
      if (seqIdRef.current !== myId) return;
      setActiveBead(i);
      await new Promise<void>((resolve) => {
        const a = new Audio(`/exercises/audio/numeros/${seq[i]}.m4a`);
        audioRef.current = a;
        a.onended = () => resolve();
        a.onerror = () => resolve();
        a.play().catch(() => resolve());
      });
      if (seqIdRef.current !== myId) return;
      setActiveBead(-1);
      await new Promise<void>(r => setTimeout(r, gap));
    }
    if (seqIdRef.current !== myId) return;
    setActiveBead(-1);
    setPhase("input");
  }, []);

  // ── Inicia uma rodada ────────────────────────────────────────────────────────
  const startRound = useCallback((lv: number) => {
    const n = digitsForLevel(lv);
    const seq: number[] = [];
    for (let i = 0; i < n; i++) seq.push(Math.floor(Math.random() * 10)); // 0–9
    seqIdRef.current++;
    const myId = seqIdRef.current;
    setSequence(seq);
    setEntered([]);
    enteredRef.current = [];
    setFeedback(null);
    setReplayed(false);
    setActiveBead(-1);
    setPhase("listen");
    playSequence(seq, myId);
  }, [playSequence]);

  // ── Validação ─────────────────────────────────────────────────────────────────
  const validate = useCallback((entry: number[]) => {
    const expected = reverse ? [...sequence].reverse() : sequence;
    const correct = entry.join("") === expected.join("");
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, digits }];
    setAttempts(newAttempts);

    if (correct) {
      const gain = digits * 10 * (replayed && cfg.replayPenalty ? 0.5 : 1);
      setPoints(p => p + Math.round(gain));
    }

    // Nível automático: 2 acertos seguidos sobem 1 dígito; 2 erros descem 1.
    let nextLevel = levelRef.current;
    const s = correct ? Math.max(streakRef.current, 0) + 1 : Math.min(streakRef.current, 0) - 1;
    if (s >= 2)  { nextLevel = clampLevel(levelRef.current + 1); streakRef.current = 0; }
    else if (s <= -2) { nextLevel = clampLevel(levelRef.current - 1); streakRef.current = 0; }
    else streakRef.current = s;
    maxLevelRef.current = Math.max(maxLevelRef.current, nextLevel);

    const nextTrial = trial + 1;
    const timeUp = isTimeUp();

    setTimeout(() => {
      if (timeUp) {
        finish();
        const total = Math.max(1, newAttempts.length);
        const correctCount = newAttempts.filter(a => a.correct).length;
        const accuracy = correctCount / total;
        const maxDigits = Math.max(...newAttempts.map(a => a.digits));
        const duration = elapsedSec();
        // Reporta a dificuldade (1–10) correspondente ao nível alcançado, para o
        // sistema salvar o progresso e o paciente retomar nesse ponto.
        const reachedDifficulty = clampLevel(maxLevelRef.current) * 10 / MAX_LEVEL;
        onComplete({
          exerciseId,
          domain: "memory",
          score: calculateExerciseScore("span-numerico", accuracy, undefined, difficulty),
          accuracy,
          difficulty: Math.round(reachedDifficulty),
          duration,
          metadata: { spanLength: maxDigits, reverse, trials: total, correct: correctCount },
        });
      } else {
        levelRef.current = nextLevel;
        setLevel(nextLevel);
        setTrial(nextTrial);
        startRound(nextLevel);
      }
    }, cfg.showAnswerOnError && !correct ? 2600 : 1400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence, attempts, digits, trial, cfg, replayed, reverse, exerciseId, difficulty, isTimeUp, elapsedSec, finish]);

  // ── Toque no teclado ────────────────────────────────────────────────────────
  function handleKey(n: number) {
    if (phase !== "input") return;
    if (enteredRef.current.length >= digits) return;
    const next = [...enteredRef.current, n];
    enteredRef.current = next;
    setEntered(next);
    if (next.length >= digits) validate(next);
  }

  useEffect(() => () => { stopAudio(); seqIdRef.current++; }, [stopAudio]);

  // ── Início da sessão (a partir da tela inicial do paciente) ──────────────────
  function beginSession(fullscreen: boolean) {
    levelRef.current = initialLevel;
    maxLevelRef.current = initialLevel;
    streakRef.current = 0;
    startTime.current = Date.now();
    begin();
    setLevel(initialLevel);
    setTrial(0);
    setAttempts([]);
    setPoints(0);
    if (fullscreen && typeof document !== "undefined" && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    startRound(initialLevel);
  }

  // ── Tela inicial do paciente (nível é automático; só decide tela cheia) ──────
  if (phase === "ready") {
    return <ReadyScreen title={title} reverse={reverse} level={initialLevel} onStart={beginSession} />;
  }

  const correctCount = attempts.filter(a => a.correct).length;
  const expected = reverse ? [...sequence].reverse() : sequence;

  // ── Render do jogo ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ background: "#020617" }}>
      <GlassBg />

      <div className="w-full max-w-lg rounded-3xl p-6 space-y-5" style={CARD_STYLE}>

        {/* Header */}
        <div className="min-w-0 pr-10">
          <p className="text-sm font-bold text-white leading-tight">{title}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>
            Nível {level} · {digits} dígitos · {points} pts
          </p>
        </div>

        {/* Progresso da sessão */}
        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />

        {/* ── FASE: ouvir ───────────────────────────────────────────────── */}
        {phase === "listen" && (
          <div className="flex flex-col items-center gap-5 py-3">
            <p className="text-sm font-semibold tracking-wide" style={{ color: "#a5b4fc" }}>Ouça com atenção</p>
            <BrainListening pulsing={activeBead >= 0} />
            <Beads total={digits} filled={0} active={activeBead} />
          </div>
        )}

        {/* ── FASE: responder ───────────────────────────────────────────── */}
        {phase === "input" && (
          <div className="flex flex-col items-center gap-4 py-1">
            <p className="text-sm font-semibold text-center text-white">
              {reverse ? "Toque nos números na ordem inversa." : "Toque nos números na mesma ordem."}
            </p>
            <Beads total={digits} filled={entered.length} active={-1} />

            <div className="grid grid-cols-3 gap-3 w-full max-w-[360px] mt-1">
              {KEYPAD.map(n => (
                <button key={n} onClick={() => handleKey(n)}
                  className="h-20 rounded-2xl font-black text-3xl active:scale-95 transition-transform"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(99,102,241,0.3)", color: "#e0e7ff" }}>
                  {n}
                </button>
              ))}
              <div />
              <button onClick={() => handleKey(0)}
                className="h-20 rounded-2xl font-black text-3xl active:scale-95 transition-transform"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(99,102,241,0.3)", color: "#e0e7ff" }}>
                0
              </button>
              <div />
            </div>
          </div>
        )}

        {/* ── FASE: feedback ────────────────────────────────────────────── */}
        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}>
              {feedback === "correct" ? "Correto" : "Incorreto"}
            </p>
            {feedback === "incorrect" && cfg.showAnswerOnError && (
              <div className="text-center text-sm space-y-1 mt-1">
                <p style={{ color: "rgba(148,163,184,0.85)" }}>
                  Sequência correta: <span className="font-bold text-white">{expected.join(" — ")}</span>
                </p>
                <p style={{ color: "rgba(148,163,184,0.6)" }}>
                  Sua resposta: <span className="font-semibold">{entered.join(" — ") || "—"}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* rodapé acertos */}
        <div className="flex justify-end text-xs pt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
          <span>{correctCount} acertos</span>
        </div>
      </div>
    </div>
  );
}

// ── Tela inicial do paciente (nível automático; decide só tela cheia) ────────────

function ReadyScreen({ title, reverse, level, onStart }: {
  title: string; reverse: boolean; level: number; onStart: (fullscreen: boolean) => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ background: "#020617" }}>
      <GlassBg />
      <div className="w-full max-w-lg rounded-3xl p-6 text-center" style={CARD_STYLE}>
        <div className="mx-auto mb-4"><BrainListening pulsing={false} /></div>
        <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
        <p className="text-sm mb-1" style={{ color: "rgba(148,163,184,0.85)" }}>
          {reverse ? "Ouça os números e toque na ordem INVERSA." : "Ouça os números e toque na MESMA ordem."}
        </p>
        <p className="text-xs mb-5" style={{ color: "rgba(148,163,184,0.55)" }}>
          Você começa no nível {level} ({digitsForLevel(level)} dígitos) — onde parou da última vez.
        </p>

        <button onClick={() => setFullscreen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-3 active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.2)" }}>
          <span className="text-sm text-white/85">⛶ Iniciar em tela cheia</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: fullscreen ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.08)",
              color: fullscreen ? "#fff" : "rgba(199,210,254,0.7)" }}>
            {fullscreen ? "SIM" : "NÃO"}
          </span>
        </button>

        <button onClick={() => onStart(fullscreen)}
          className="w-full rounded-2xl font-bold text-white text-sm flex items-center justify-center py-3.5 active:scale-95"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
          Começar →
        </button>
      </div>
    </div>
  );
}
