"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface CuboCorsiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MAX_ROUNDS = 12;
const GAP_MS = 350; // pausa entre blocos na sequência

function seqLen(d: number): number {
  if (d <= 1) return 2;
  if (d <= 3) return 3;
  if (d <= 5) return 4;
  if (d <= 6) return 5;
  if (d <= 7) return 6;
  if (d <= 8) return 7;
  if (d <= 9) return 8;
  return 9;
}

function flashMs(d: number): number {
  if (d <= 3) return 900;
  if (d <= 6) return 700;
  return 500;
}

function randSeq(len: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    let n: number;
    do { n = Math.floor(Math.random() * 8); }
    while (arr.length > 0 && n === arr[arr.length - 1]);
    arr.push(n);
  }
  return arr;
}

// ── Audio (Web Audio API) ────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function beep(freq: number, dur = 150, type: OscillatorType = "sine", gain = 0.07) {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _audioCtx = _audioCtx || new Ctx();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    const ctx = _audioCtx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur / 1000);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur / 1000);
  } catch { /* silencioso */ }
}
const sndLight   = () => beep(440, 180);
const sndTap     = () => beep(660, 100);
const sndCorrect = () => { beep(660, 120); setTimeout(() => beep(880, 200), 130); };
const sndWrong   = () => beep(120, 300, "square", 0.05);

// ── 3D Cube ──────────────────────────────────────────────────────────────────

// 8 posições [col, row, layer]: col=0|1 (esq/dir), row=0|1 (baixo/cima), layer=0|1 (front/back)
const BLOCK_POS: [number, number, number][] = [
  [0,0,0],[1,0,0],[0,1,0],[1,1,0],
  [0,0,1],[1,0,1],[0,1,1],[1,1,1],
];

// Orden de pintura (painter's algorithm): fundo primeiro, frente por último
const DRAW_ORDER = [6,7,4,5,2,3,0,1];

const BS = 58;   // tamanho do bloco em px
const SP = 10;   // espaço entre blocos
const UNIT = BS + SP;

type BState = "idle" | "lit" | "ok" | "err";

interface FaceColors { front: string; top: string; right: string; dark: string; }

function faceColors(s: BState, t: Theme): FaceColors {
  if (s === "lit") {
    if (t === "GAMIFIED") return { front:"#06B6D4", top:"#67E8F9", right:"#0891B2", dark:"#083344" };
    if (t === "COLORFUL") return { front:"#F59E0B", top:"#FDE68A", right:"#D97706", dark:"#78350F" };
    return { front:"#3B82F6", top:"#93C5FD", right:"#1D4ED8", dark:"#172554" };
  }
  if (s === "ok")  return { front:"#22C55E", top:"#86EFAC", right:"#16A34A", dark:"#14532D" };
  if (s === "err") return { front:"#EF4444", top:"#FCA5A5", right:"#DC2626", dark:"#7F1D1D" };
  if (t === "GAMIFIED") return { front:"#1E3A5F", top:"#275080", right:"#0F2840", dark:"#060F1A" };
  if (t === "COLORFUL") return { front:"#C4B5FD", top:"#EDE9FE", right:"#7C3AED", dark:"#4C1D95" };
  return { front:"#CBD5E1", top:"#E2E8F0", right:"#94A3B8", dark:"#475569" };
}

function MiniBlock({
  idx, state, theme, interactive, onClick,
}: {
  idx: number; state: BState; theme: Theme; interactive: boolean; onClick: () => void;
}) {
  const [col, row, layer] = BLOCK_POS[idx];
  const c = faceColors(state, theme);
  const H = BS / 2;
  const face: React.CSSProperties = { position: "absolute", width: BS, height: BS, backfaceVisibility: "hidden" };

  return (
    <div
      style={{
        position: "absolute",
        width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: `translate3d(${col * UNIT}px,${-row * UNIT}px,${-layer * UNIT}px)`,
        cursor: interactive ? "pointer" : "default",
      }}
      onClick={interactive ? onClick : undefined}
    >
      {/* front */}
      <div style={{ ...face, backgroundColor: c.front, transform: `translateZ(${H}px)`,
        borderRadius: 4, boxShadow: state === "lit" ? "0 0 12px 4px rgba(255,255,255,0.35)" : "none",
        border: "1px solid rgba(255,255,255,0.12)" }} />
      {/* top */}
      <div style={{ ...face, backgroundColor: c.top, transform: `rotateX(90deg) translateZ(${H}px)`,
        borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)" }} />
      {/* right */}
      <div style={{ ...face, backgroundColor: c.right, transform: `rotateY(90deg) translateZ(${H}px)`,
        borderRadius: 4, border: "1px solid rgba(0,0,0,0.12)" }} />
      {/* left */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateY(-90deg) translateZ(${H}px)` }} />
      {/* bottom */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateX(-90deg) translateZ(${H}px)` }} />
      {/* back */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateY(180deg) translateZ(${H}px)` }} />
    </div>
  );
}

function CubeScene({
  states, theme, interactive, onBlock,
}: {
  states: BState[]; theme: Theme; interactive: boolean; onBlock: (i: number) => void;
}) {
  // Offset para centralizar os 8 blocos no contêiner
  const cx = -(UNIT / 2);
  const cy = (UNIT / 2);

  return (
    <div style={{ perspective: "700px", perspectiveOrigin: "50% 45%" }}>
      <div style={{
        width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: "rotateX(-25deg) rotateY(-40deg)",
        margin: "90px auto 60px",
        position: "relative",
        translate: `${cx}px ${cy}px`,
      }}>
        {DRAW_ORDER.map(i => (
          <MiniBlock
            key={i} idx={i}
            state={states[i]} theme={theme}
            interactive={interactive}
            onClick={() => onBlock(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Tutorial ─────────────────────────────────────────────────────────────────

function TutorialWatchStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const seq = [2, 5, 0, 7]; // sequência demo

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await new Promise(r => setTimeout(r, 600));
      for (const idx of seq) {
        if (cancelled) return;
        setStates(prev => prev.map((s, j) => j === idx ? "lit" : s));
        sndLight();
        await new Promise(r => setTimeout(r, 800));
        if (cancelled) return;
        setStates(prev => prev.map((s, j) => j === idx ? "idle" : s));
        await new Promise(r => setTimeout(r, 350));
      }
      if (!cancelled) onDone();
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className={`text-xs text-center font-semibold mb-2 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
        Observe a sequência...
      </p>
      <CubeScene states={states} theme={theme} interactive={false} onBlock={() => {}} />
    </div>
  );
}

function TutorialClickStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const seq = [2, 5, 0, 7];
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const [clicked, setClicked] = useState<number[]>([]);

  function handleClick(idx: number) {
    const next = clicked.length;
    if (next >= seq.length) return;
    if (idx === seq[next]) {
      sndTap();
      const newClicked = [...clicked, idx];
      setClicked(newClicked);
      setStates(prev => prev.map((s, j) => j === idx ? "ok" : s));
      if (newClicked.length === seq.length) setTimeout(onDone, 600);
    } else {
      sndWrong();
      setStates(prev => prev.map((s, j) => j === idx ? "err" : s));
      setTimeout(() => setStates(prev => prev.map((s, j) => j === idx ? "idle" : s)), 400);
    }
  }

  return (
    <div>
      <p className={`text-xs text-center font-semibold mb-2 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
        Agora toque na mesma ordem!
      </p>
      <CubeScene states={states} theme={theme} interactive={true} onBlock={handleClick} />
    </div>
  );
}

function CuboCorsiTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Blocos do cubo vão acender em sequência. Observe bem!",
      content: (onStepDone: () => void) => <TutorialWatchStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Agora é sua vez! Toque os blocos na mesma ordem em que acenderam.",
      content: (onStepDone: () => void) => <TutorialClickStep theme={theme} onDone={onStepDone} />,
    },
  ];
  return <TutorialBase theme={theme} title="Cubo de Corsi" steps={steps} onDone={onDone} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

type Phase = "tutorial" | "watch" | "input" | "feedback" | "between";

export function CuboCorsi({ difficulty, theme, onComplete }: CuboCorsiProps) {
  const markProgress = useExerciseProgress();
  const [phase, setPhase] = useState<Phase>("tutorial");
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [blockStates, setBlockStates] = useState<BState[]>(Array(8).fill("idle"));
  const [inputSoFar, setInputSoFar] = useState<number[]>([]);
  const [feedbackOk, setFeedbackOk] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const startTsRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const inputStartRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAllTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  const startRound = useCallback((r: number) => {
    clearAllTimers();
    const seq = randSeq(seqLen(difficulty));
    setSequence(seq);
    setInputSoFar([]);
    setBlockStates(Array(8).fill("idle"));
    setRound(r);
    setPhase("watch");

    const FLASH = flashMs(difficulty);
    const STEP = FLASH + GAP_MS;

    seq.forEach((blockIdx, i) => {
      timersRef.current.push(setTimeout(() => {
        setBlockStates(prev => prev.map((_, j) => j === blockIdx ? "lit" : "idle"));
        sndLight();
      }, i * STEP));
      timersRef.current.push(setTimeout(() => {
        setBlockStates(Array(8).fill("idle"));
      }, i * STEP + FLASH));
    });

    timersRef.current.push(setTimeout(() => {
      setBlockStates(Array(8).fill("idle"));
      setPhase("input");
      inputStartRef.current = Date.now();
    }, seq.length * STEP + 200));
  }, [difficulty]);

  const finish = useCallback((finalCorrect: number, finalErrors: number) => {
    clearAllTimers();
    const total = finalCorrect + finalErrors;
    const accuracy = total > 0 ? finalCorrect / total : 0;
    const avgRT = reactionTimesRef.current.length > 0
      ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
      : 3000;
    const duration = Math.round((Date.now() - startTsRef.current) / 1000);
    const score = calculateExerciseScore("cubo-corsi", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "cubo-corsi",
      domain: "memory",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { correct: finalCorrect, errors: finalErrors, rounds: MAX_ROUNDS },
    });
  }, [difficulty, onComplete]);

  function handleBlockClick(idx: number) {
    if (phase !== "input") return;
    const pos = inputSoFar.length;
    const expected = sequence[pos];

    if (idx === expected) {
      sndTap();
      const newInput = [...inputSoFar, idx];
      const rt = Date.now() - inputStartRef.current;
      reactionTimesRef.current.push(rt);

      setBlockStates(prev => prev.map((s, j) => j === idx ? "ok" : s));

      if (newInput.length === sequence.length) {
        // Sequência completa — acerto
        const newCorrect = correct + 1;
        setCorrect(newCorrect);
        setFeedbackOk(true);
        setPhase("feedback");
        sndCorrect();

        const nextRound = round + 1;
        markProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

        if (nextRound >= MAX_ROUNDS) {
          timersRef.current.push(setTimeout(() => finish(newCorrect, errors), 900));
        } else {
          timersRef.current.push(setTimeout(() => {
            setBlockStates(Array(8).fill("idle"));
            setPhase("between");
            timersRef.current.push(setTimeout(() => startRound(nextRound), 600));
          }, 900));
        }
      } else {
        setInputSoFar(newInput);
        timersRef.current.push(setTimeout(() => {
          setBlockStates(prev => prev.map((s, j) => j === idx ? "idle" : s));
        }, 300));
      }
    } else {
      // Erro — encerra a tentativa desta rodada
      sndWrong();
      const newErrors = errors + 1;
      setErrors(newErrors);
      setFeedbackOk(false);
      setPhase("feedback");

      setBlockStates(prev => prev.map((s, j) => {
        if (j === idx) return "err";
        if (sequence.includes(j) && !inputSoFar.includes(j)) return "lit"; // mostra o restante
        return s;
      }));

      const nextRound = round + 1;
      markProgress(Math.round((nextRound / MAX_ROUNDS) * 100));

      if (nextRound >= MAX_ROUNDS) {
        timersRef.current.push(setTimeout(() => finish(correct, newErrors), 1200));
      } else {
        timersRef.current.push(setTimeout(() => {
          setBlockStates(Array(8).fill("idle"));
          setPhase("between");
          timersRef.current.push(setTimeout(() => startRound(nextRound), 600));
        }, 1200));
      }
    }
  }

  function handleStart() {
    startTsRef.current = Date.now();
    startRound(0);
  }

  useEffect(() => () => clearAllTimers(), []);

  // ── Estilos por tema ─────────────────────────────────────────────────────
  const bg = theme === "GAMIFIED"
    ? "bg-gray-950 min-h-screen"
    : theme === "COLORFUL"
    ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 min-h-screen"
    : "bg-gray-50 min-h-screen";

  const labelColor = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-purple-700" : "text-blue-700";
  const subColor = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  function phaseLabel(): string {
    if (phase === "watch") return "Observe a sequência...";
    if (phase === "input") return `Toque os ${sequence.length} blocos na ordem`;
    if (phase === "feedback") return feedbackOk ? "Correto!" : "Ops — tente de novo!";
    if (phase === "between") return "Preparando próxima...";
    return "";
  }

  if (phase === "tutorial") {
    return <CuboCorsiTutorial theme={theme} onDone={handleStart} />;
  }

  return (
    <div className={bg}>
      <div className="max-w-sm mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${subColor}`}>
            Rodada {round + 1} / {MAX_ROUNDS}
          </span>
          <span className={`text-xs font-semibold ${subColor}`}>
            ✓ {correct} &nbsp; ✗ {errors}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-1.5 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-800" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-500"}`}
            style={{ width: `${((round) / MAX_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Sequence indicators */}
        <div className="flex gap-1.5 justify-center mb-3">
          {sequence.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
              i < inputSoFar.length
                ? (theme === "GAMIFIED" ? "bg-cyan-400" : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-500")
                : (theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-300")
            }`} />
          ))}
        </div>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase + feedbackOk}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-bold text-center mb-1 ${
              phase === "feedback"
                ? feedbackOk
                  ? "text-green-500"
                  : "text-red-500"
                : labelColor
            }`}
          >
            {phaseLabel()}
          </motion.p>
        </AnimatePresence>

        {/* Cube */}
        <CubeScene
          states={blockStates}
          theme={theme}
          interactive={phase === "input"}
          onBlock={handleBlockClick}
        />

        {/* Dificuldade */}
        <p className={`text-xs text-center mt-2 ${subColor}`}>
          Sequência de {sequence.length} bloco{sequence.length > 1 ? "s" : ""}
          {difficulty >= 6 ? " · avançado" : ""}
        </p>
      </div>
    </div>
  );
}
