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

type Phase = "ready" | "listen" | "flip" | "input" | "feedback";

// ── Constantes ────────────────────────────────────────────────────────────────

const MAX_LEVEL = 7;                          // Nível 7 = 8 dígitos
const digitsForLevel = (lv: number) => lv + 1; // N1=2, N2=3 … N7=8
const clampLevel = (lv: number) => Math.max(1, Math.min(MAX_LEVEL, lv));

// Nível inicial automático a partir do progresso salvo do paciente (difficulty 1–10).
const levelFromDifficulty = (d: number) => clampLevel(Math.ceil(Math.max(1, d) * 0.7));


// ── Fundo (estética adulta/limpa) ───────────────────────────────────────────────

function GlassBg() {
  // Tema CLARO (pedido da terapeuta): azul do app em tons claros, sem escuro.
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FDFEFF 0%, #EFF7FC 55%, #E2EFF8 100%)" }} />
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "#EAF2F9",
  border: "1px solid rgba(158,190,221,0.5)",
  boxShadow: "0 24px 60px rgba(100,140,180,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
};

// ── Painel de números 3×3 (1-9, sem 0) — estilo referência, paleta clara ─────────
// flashKey: tecla ACESA enquanto a voz fala o número (apresentação audiovisual).
function NumberPad({ interactive, flashKey, onKey }: {
  interactive: boolean; flashKey: number; onKey: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-[380px] rounded-3xl p-5"
      style={{ background: "#E3EDF6", border: "1px solid rgba(158,190,221,0.45)",
        boxShadow: "inset 0 2px 6px rgba(130,169,207,0.18)" }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
        const lit = flashKey === n;
        return (
          <button key={n} onClick={interactive ? () => onKey(n) : undefined}
            className="h-20 sm:h-24 rounded-2xl font-medium text-4xl transition-all duration-150 active:scale-95"
            style={{
              background: lit ? "#4F8FEA" : "#FFFFFF",
              color: lit ? "#FFFFFF" : "#93B2CB",
              boxShadow: lit
                ? "0 0 24px rgba(79,143,234,0.55), 0 6px 14px rgba(100,140,180,0.25)"
                : "0 6px 14px rgba(100,140,180,0.20), inset 0 1px 0 rgba(255,255,255,0.9)",
              cursor: interactive ? "pointer" : "default",
              transform: lit ? "scale(1.04)" : undefined,
            }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ── Ícone central: cérebro ouvindo + ondas sonoras ──────────────────────────────

function BrainListening({ pulsing }: { pulsing: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 168, height: 168 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 104 + i * 26, height: 104 + i * 26, border: "1.5px solid rgba(79,143,234,0.4)" }}
          animate={pulsing
            ? { scale: [1, 1.12, 1], opacity: [0.55, 0.12, 0.55] }
            : { scale: 1, opacity: 0.18 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }} />
      ))}
      <div className="relative rounded-full flex items-center justify-center"
        style={{
          width: 100, height: 100,
          background: "radial-gradient(circle at 38% 32%, #7FB1F2, #4F8FEA)",
          border: "1px solid rgba(59,121,217,0.55)",
          boxShadow: pulsing ? "0 0 44px rgba(79,143,234,0.5)" : "0 0 22px rgba(79,143,234,0.25)",
          transition: "box-shadow 0.3s",
        }}>
        <Headphones size={46} strokeWidth={1.75} color="#FFFFFF" />
      </div>
    </div>
  );
}

// ── Bolinhas (quantidade de itens) ──────────────────────────────────────────────

function Beads({ total, filled, active, flipped = false, flipping = false }: {
  total: number; filled: number; active: number;
  flipped?: boolean;   // inverso (pós-virada): a fileira fica girada (início vira fim)
  flipping?: boolean;  // anima a virada agora (dica sutil, sem números)
}) {
  return (
    <motion.div className="flex flex-wrap items-center justify-center gap-3"
      animate={flipping ? { rotate: 180 } : { rotate: flipped ? 180 : 0 }}
      transition={{ duration: 0.9, ease: [0.45, 0, 0.55, 1] }}>
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < filled;
        const isActive = i === active;
        return (
          <motion.div key={i} className="rounded-full"
            style={{
              width: 18, height: 18,
              background: isActive ? "#7FB1F2" : isFilled ? "#4F8FEA" : "rgba(79,143,234,0.18)",
              boxShadow: isActive ? "0 0 14px rgba(79,143,234,0.8)" : undefined,
              // anel marca o INÍCIO da sequência — quando a fileira vira (inverso),
              // ele passa a apontar o novo ponto de partida (dica visual sutil).
              outline: i === 0 ? "2px solid rgba(59,121,217,0.75)" : undefined,
              outlineOffset: 2,
            }}
            animate={isActive ? { scale: [1, 1.5, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }} />
        );
      })}
    </motion.div>
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
  const [flashKey, setFlashKey]     = useState(-1);   // tecla acesa durante a fala
  const [spokenCount, setSpokenCount] = useState(0);  // bolinhas preenchidas na escuta
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
  const reverseRef  = useRef(reverse); reverseRef.current = reverse;
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
      setFlashKey(seq[i]);          // a TECLA do número falado ACENDE no painel
      await new Promise<void>((resolve) => {
        const a = new Audio(`/exercises/audio/numeros/${seq[i]}.m4a`);
        audioRef.current = a;
        a.onended = () => resolve();
        a.onerror = () => resolve();
        a.play().catch(() => resolve());
      });
      if (seqIdRef.current !== myId) return;
      setActiveBead(-1);
      setFlashKey(-1);
      setSpokenCount(i + 1);        // bolinha preenche conforme fala
      await new Promise<void>(r => setTimeout(r, gap));
    }
    if (seqIdRef.current !== myId) return;
    setActiveBead(-1);
    setFlashKey(-1);
    if (reverseRef.current) {
      // INVERSO: dica sutil — as bolinhas VIRAM (sem números) antes de responder.
      setPhase("flip");
      await new Promise<void>(r => setTimeout(r, 1400));
      if (seqIdRef.current !== myId) return;
    }
    setPhase("input");
  }, []);

  // ── Inicia uma rodada ────────────────────────────────────────────────────────
  const startRound = useCallback((lv: number) => {
    const n = digitsForLevel(lv);
    const seq: number[] = [];
    for (let i = 0; i < n; i++) seq.push(1 + Math.floor(Math.random() * 9)); // 1–9 (painel não tem 0)
    seqIdRef.current++;
    const myId = seqIdRef.current;
    setSequence(seq);
    setEntered([]);
    enteredRef.current = [];
    setFeedback(null);
    setReplayed(false);
    setActiveBead(-1);
    setFlashKey(-1);
    setSpokenCount(0);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ background: "#F4F9FD" }}>
      <GlassBg />

      <div className="w-full max-w-lg rounded-3xl p-6 space-y-5" style={CARD_STYLE}>

        {/* Header */}
        <div className="min-w-0 pr-10">
          <p className="text-sm font-bold leading-tight" style={{ color: "#3B5A75" }}>{title}</p>
          <p className="text-xs mt-1" style={{ color: "#8FA9C0" }}>
            Nível {level} · {digits} dígitos · {points} pts
          </p>
        </div>

        {/* Progresso da sessão */}
        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />

        {/* ── FASE: ouvir (painel visível; a tecla falada PISCA) ─────────── */}
        {(phase === "listen" || phase === "flip") && (
          <div className="flex flex-col items-center gap-5 py-3">
            <p className="text-sm font-semibold tracking-wide" style={{ color: "#4F8FEA" }}>Ouça com atenção</p>
            <Beads total={digits} filled={spokenCount} active={activeBead}
              flipping={phase === "flip"} />
            <NumberPad interactive={false} flashKey={flashKey} onKey={() => {}} />
          </div>
        )}

        {/* ── FASE: responder (sem dica de texto — só as bolinhas) ───────── */}
        {phase === "input" && (
          <div className="flex flex-col items-center gap-4 py-1">
            <Beads total={digits} filled={entered.length} active={-1} flipped={reverse} />
            <NumberPad interactive flashKey={-1} onKey={handleKey} />
          </div>
        )}

        {/* ── FASE: feedback ────────────────────────────────────────────── */}
        {phase === "feedback" && (
          <div className="flex flex-col items-center gap-3 py-5">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-5xl">{feedback === "correct" ? "✅" : "❌"}</motion.div>
            <p className="text-2xl font-black" style={{ color: feedback === "correct" ? "#16A34A" : "#DC2626" }}>
              {feedback === "correct" ? "Correto" : "Incorreto"}
            </p>
            {feedback === "incorrect" && cfg.showAnswerOnError && (
              <div className="text-center text-sm space-y-1 mt-1">
                <p style={{ color: "#5C7A94" }}>
                  Sequência correta: <span className="font-bold" style={{ color: "#3B5A75" }}>{expected.join(" — ")}</span>
                </p>
                <p style={{ color: "#8FA9C0" }}>
                  Sua resposta: <span className="font-semibold">{entered.join(" — ") || "—"}</span>
                </p>
              </div>
            )}
          </div>
        )}

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={{ background: "#F4F9FD" }}>
      <GlassBg />
      <div className="w-full max-w-lg rounded-3xl p-6 text-center" style={CARD_STYLE}>
        <div className="mx-auto mb-4"><BrainListening pulsing={false} /></div>
        <h2 className="text-lg font-bold mb-1" style={{ color: "#3B5A75" }}>{title}</h2>
        <p className="text-sm mb-1" style={{ color: "#5C7A94" }}>
          {reverse ? "Ouça os números e toque na ordem INVERSA." : "Ouça os números e toque na MESMA ordem."}
        </p>
        <p className="text-xs mb-5" style={{ color: "#8FA9C0" }}>
          Você começa no nível {level} ({digitsForLevel(level)} dígitos) — onde parou da última vez.
        </p>

        <button onClick={() => setFullscreen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-3 active:scale-[0.98]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(158,190,221,0.5)", boxShadow: "0 4px 10px rgba(100,140,180,0.12)" }}>
          <span className="text-sm" style={{ color: "#3B5A75" }}>⛶ Iniciar em tela cheia</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: fullscreen ? "linear-gradient(135deg,#4F8FEA,#3B79D9)" : "rgba(79,143,234,0.12)",
              color: fullscreen ? "#fff" : "#5C7A94" }}>
            {fullscreen ? "SIM" : "NÃO"}
          </span>
        </button>

        <button onClick={() => onStart(fullscreen)}
          className="w-full rounded-2xl font-bold text-white text-sm flex items-center justify-center py-3.5 active:scale-95"
          style={{ background: "linear-gradient(135deg,#4F8FEA,#3B79D9)", boxShadow: "0 4px 20px rgba(79,143,234,0.45)" }}>
          Começar →
        </button>
      </div>
    </div>
  );
}
