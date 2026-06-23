"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Parâmetros ────────────────────────────────────────────────────────────────
const MAX_ROUNDS = 12;
const GAP_MS    = 300;  // pausa após flash de cada bloco
const ROTATE_MS = 380;  // duração da animação de rotação

const BS   = 72;        // tamanho do bloco (px)
const SP   = 14;        // espaço entre blocos
const UNIT = BS + SP;   // 86 px

// ── Posições [col, row, layer]: col=0|1 (esq/dir), row=0|1 (baixo/cima), layer=0|1 (frente/trás)
const BLOCK_POS: [number, number, number][] = [
  [0,0,0],[1,0,0],[0,1,0],[1,1,0],  // front face (layer 0)
  [0,0,1],[1,0,1],[0,1,1],[1,1,1],  // back face  (layer 1)
];

// Painter's algorithm: fundo → frente
const DRAW_ORDER = [6,7,4,5,2,3,0,1];

// ── Ângulos fixos de câmera ───────────────────────────────────────────────────
type Cam = { rx: number; ry: number };
const FRONT: Cam = { rx: -22, ry: -38 };  // frente + direita + topo
const BACK:  Cam = { rx: -22, ry:  142 }; // face traseira (giro ~180°)

function bestCam(blockIdx: number): Cam {
  return BLOCK_POS[blockIdx][2] === 0 ? FRONT : BACK;
}

// ── Sequência e timing ────────────────────────────────────────────────────────
function seqLen(d: number): number {
  if (d <= 1) return 2; if (d <= 3) return 3; if (d <= 5) return 4;
  if (d <= 6) return 5; if (d <= 7) return 6; if (d <= 8) return 7;
  if (d <= 9) return 8; return 9;
}
function flashMs(d: number): number {
  return d <= 3 ? 950 : d <= 6 ? 720 : 540;
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

// ── Áudio ─────────────────────────────────────────────────────────────────────
let _ac: AudioContext | null = null;
function beep(hz: number, ms = 150, type: OscillatorType = "sine", vol = 0.07) {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ac = _ac || new AC();
    if (_ac.state === "suspended") _ac.resume();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.type = type; o.frequency.value = hz;
    g.gain.setValueAtTime(vol, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, _ac.currentTime + ms / 1000);
    o.connect(g); g.connect(_ac.destination);
    o.start(); o.stop(_ac.currentTime + ms / 1000);
  } catch { /* silent */ }
}
const sndLight   = () => beep(440, 180);
const sndTap     = () => beep(660, 100);
const sndCorrect = () => { beep(660, 120); setTimeout(() => beep(880, 200), 130); };
const sndWrong   = () => beep(120, 300, "square", 0.05);

// ── Estado visual ─────────────────────────────────────────────────────────────
type BState = "idle" | "lit" | "ok" | "err";

interface Faces { front: string; top: string; right: string; dark: string; }

function faces(s: BState, t: Theme): Faces {
  if (s === "lit") {
    if (t === "GAMIFIED") return { front:"#06B6D4", top:"#67E8F9", right:"#0891B2", dark:"#083344" };
    if (t === "COLORFUL") return { front:"#F59E0B", top:"#FDE68A", right:"#D97706", dark:"#78350F" };
    return { front:"#3B82F6", top:"#BFDBFE", right:"#1D4ED8", dark:"#1E3A8A" };
  }
  if (s === "ok")  return { front:"#22C55E", top:"#86EFAC", right:"#16A34A", dark:"#14532D" };
  if (s === "err") return { front:"#EF4444", top:"#FCA5A5", right:"#DC2626", dark:"#7F1D1D" };
  if (t === "GAMIFIED") return { front:"#1E3A5F", top:"#274E7E", right:"#0F2840", dark:"#040C15" };
  if (t === "COLORFUL") return { front:"#A78BFA", top:"#C4B5FD", right:"#7C3AED", dark:"#4C1D95" };
  return { front:"#8898AA", top:"#B2BFCC", right:"#5A6978", dark:"#2C3A47" };
}

// ── Bloco 3D ──────────────────────────────────────────────────────────────────
function Block3D({ idx, state, theme, interactive, onClick }: {
  idx: number; state: BState; theme: Theme; interactive: boolean; onClick: () => void;
}) {
  const [col, row, layer] = BLOCK_POS[idx];
  const c = faces(state, theme);
  const H = BS / 2;
  const isLit = state === "lit";
  const isOk  = state === "ok";

  const glow = theme === "GAMIFIED" ? "rgba(6,182,212,0.75)"
    : theme === "COLORFUL" ? "rgba(245,158,11,0.75)" : "rgba(59,130,246,0.75)";

  const face: React.CSSProperties = {
    position: "absolute", width: BS, height: BS,
    backfaceVisibility: "hidden", borderRadius: 10,
  };

  return (
    <div
      style={{
        position: "absolute", width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: `translate3d(${col * UNIT}px, ${-row * UNIT}px, ${-layer * UNIT}px)`,
        cursor: interactive ? "pointer" : "default",
      }}
      onClick={interactive ? onClick : undefined}
    >
      {/* frente */}
      <div style={{
        ...face, backgroundColor: c.front,
        transform: `translateZ(${H}px)`,
        boxShadow: isLit
          ? `0 0 26px 9px ${glow}, inset 0 1.5px 0 rgba(255,255,255,0.55)`
          : isOk
          ? "0 0 14px 4px rgba(34,197,94,0.55)"
          : "inset 0 1.5px 0 rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.3)",
        border: isLit ? "2px solid rgba(255,255,255,0.6)" : "1.5px solid rgba(255,255,255,0.14)",
        transition: "box-shadow 0.12s, background-color 0.12s",
      }} />
      {/* topo */}
      <div style={{
        ...face, backgroundColor: c.top,
        transform: `rotateX(90deg) translateZ(${H}px)`,
        boxShadow: isLit ? `0 0 16px 4px ${glow}` : "none",
        border: "1px solid rgba(255,255,255,0.18)",
      }} />
      {/* direita */}
      <div style={{
        ...face, backgroundColor: c.right,
        transform: `rotateY(90deg) translateZ(${H}px)`,
        border: "1px solid rgba(0,0,0,0.14)",
      }} />
      {/* esquerda */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateY(-90deg) translateZ(${H}px)` }} />
      {/* baixo */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateX(-90deg) translateZ(${H}px)` }} />
      {/* trás */}
      <div style={{ ...face, backgroundColor: c.dark, transform: `rotateY(180deg) translateZ(${H}px)` }} />
    </div>
  );
}

// ── Cena do cubo ──────────────────────────────────────────────────────────────
function CubeScene({ states, theme, interactive, onBlock, cam }: {
  states: BState[]; theme: Theme; interactive: boolean;
  onBlock: (i: number) => void; cam: Cam;
}) {
  return (
    <div style={{ perspective: "900px", perspectiveOrigin: "50% 40%" }}>
      <div style={{
        width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: `rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`,
        transition: `transform ${ROTATE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
        margin: "110px auto 80px",
        position: "relative",
        translate: `${-(UNIT / 2)}px ${UNIT / 2}px`,
      }}>
        {DRAW_ORDER.map(i => (
          <Block3D key={i} idx={i} state={states[i]} theme={theme}
            interactive={interactive} onClick={() => onBlock(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Tutorial: passo "observe" ──────────────────────────────────────────────────
function TutorialWatch({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const [cam, setCam] = useState<Cam>(FRONT);
  const demo = [2, 7, 0, 5]; // frente, trás, frente, trás — demonstra rotação

  useEffect(() => {
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const sleep = (ms: number) => new Promise<void>((res, rej) => {
      if (cancelled) { rej(); return; }
      const t = setTimeout(() => cancelled ? rej() : res(), ms);
      timers.push(t);
    });

    async function run() {
      await sleep(500);
      let currentCam = FRONT;
      for (const idx of demo) {
        if (cancelled) return;
        const target = bestCam(idx);
        if (target.ry !== currentCam.ry) {
          setCam(target); currentCam = target;
          await sleep(ROTATE_MS + 120);
        }
        if (cancelled) return;
        setStates(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndLight();
        await sleep(850);
        if (cancelled) return;
        setStates(Array(8).fill("idle"));
        await sleep(300);
      }
      // voltar para frente
      setCam(FRONT);
      await sleep(ROTATE_MS + 100);
      if (!cancelled) onDone();
    }
    run().catch(() => {});
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className={`text-xs text-center font-semibold mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
        O cubo gira para revelar blocos ocultos — observe!
      </p>
      <CubeScene states={states} theme={theme} interactive={false} onBlock={() => {}} cam={cam} />
    </div>
  );
}

// ── Tutorial: passo "toque" ────────────────────────────────────────────────────
function TutorialClick({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const seq = [2, 7, 0, 5];
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const [cam, setCam] = useState<Cam>(FRONT);
  const [clicked, setClicked] = useState<number[]>([]);

  function handleClick(idx: number) {
    const next = clicked.length;
    if (next >= seq.length) return;
    if (idx === seq[next]) {
      sndTap();
      const nc = [...clicked, idx];
      setClicked(nc);
      setStates(prev => prev.map((s, j) => j === idx ? "ok" : s));
      if (nc.length < seq.length) {
        setCam(bestCam(seq[nc.length]));
      }
      if (nc.length === seq.length) setTimeout(onDone, 700);
    } else {
      sndWrong();
      setStates(prev => prev.map((s, j) => j === idx ? "err" : s));
      setTimeout(() => setStates(prev => prev.map((s, j) => j === idx ? "idle" : s)), 400);
    }
  }

  return (
    <div>
      <p className={`text-xs text-center font-semibold mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>
        Agora toque na mesma ordem! O cubo vai girar para ajudar.
      </p>
      <CubeScene states={states} theme={theme} interactive cam={cam} onBlock={handleClick} />
    </div>
  );
}

function CuboCorsiTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  return (
    <TutorialBase
      theme={theme}
      title="Cubo da Matriz"
      steps={[
        {
          instruction: "Blocos acenderão em sequência. O cubo rotaciona para revelar blocos em outras faces!",
          content: (done) => <TutorialWatch theme={theme} onDone={done} />,
        },
        {
          instruction: "Sua vez! Toque os blocos na mesma ordem. O cubo gira para te guiar.",
          content: (done) => <TutorialClick theme={theme} onDone={done} />,
        },
      ]}
      onDone={onDone}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface CuboCorsiProps {
  difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void;
}
type Phase = "tutorial" | "watch" | "input" | "feedback" | "between";

export function CuboCorsi({ difficulty, theme, onComplete }: CuboCorsiProps) {
  const markProgress = useExerciseProgress();

  const [phase, setPhase]           = useState<Phase>("tutorial");
  const [round, setRound]           = useState(0);
  const [sequence, setSequence]     = useState<number[]>([]);
  const [blockStates, setBS]        = useState<BState[]>(Array(8).fill("idle"));
  const [inputSoFar, setInput]      = useState<number[]>([]);
  const [feedbackOk, setFbOk]       = useState(false);
  const [correct, setCorrect]       = useState(0);
  const [errors, setErrors]         = useState(0);
  const [cam, setCam]               = useState<Cam>(FRONT);

  const startTsRef    = useRef(0);
  const rtRef         = useRef<number[]>([]);
  const inputStartRef = useRef(0);
  const cancelRef     = useRef(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAll() {
    cancelRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise((res, rej) => {
      if (cancelRef.current) { rej("cancelled"); return; }
      const t = setTimeout(() => {
        if (cancelRef.current) rej("cancelled"); else res();
      }, ms);
      timersRef.current.push(t);
    });
  }, []);

  const startRound = useCallback(async (r: number) => {
    cancelRef.current = false;
    const seq = randSeq(seqLen(difficulty));
    setSequence(seq);
    setInput([]);
    setBS(Array(8).fill("idle"));
    setRound(r);
    setCam(FRONT);
    setPhase("watch");

    let currentCam = FRONT;
    const FLASH = flashMs(difficulty);

    try {
      await sleep(500);

      for (const blockIdx of seq) {
        const target = bestCam(blockIdx);
        if (target.ry !== currentCam.ry) {
          setCam(target);
          currentCam = target;
          await sleep(ROTATE_MS + 120);
        }
        setBS(prev => prev.map((_, j) => j === blockIdx ? "lit" : "idle"));
        sndLight();
        await sleep(FLASH);
        setBS(Array(8).fill("idle"));
        await sleep(GAP_MS);
      }

      // Volta à vista frontal antes do input — referência espacial consistente
      if (currentCam.ry !== FRONT.ry) {
        setCam(FRONT);
        await sleep(ROTATE_MS + 80);
      }

      setPhase("input");
      inputStartRef.current = Date.now();
    } catch { /* cancelado */ }
  }, [difficulty, sleep]);

  const finish = useCallback((fc: number, fe: number) => {
    clearAll();
    const total = fc + fe;
    const accuracy = total > 0 ? fc / total : 0;
    const avgRT = rtRef.current.length > 0
      ? rtRef.current.reduce((a, b) => a + b, 0) / rtRef.current.length : 3000;
    const duration = Math.round((Date.now() - startTsRef.current) / 1000);
    const score = calculateExerciseScore("cubo-corsi", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "cubo-corsi", domain: "memory",
      score, accuracy, reactionTime: avgRT, difficulty, duration,
      metadata: { correct: fc, errors: fe, rounds: MAX_ROUNDS },
    });
  }, [difficulty, onComplete]);

  function handleBlock(idx: number) {
    if (phase !== "input") return;
    const pos = inputSoFar.length;
    if (pos >= sequence.length) return;

    if (idx === sequence[pos]) {
      sndTap();
      const newInput = [...inputSoFar, idx];
      rtRef.current.push(Date.now() - inputStartRef.current);
      setBS(prev => prev.map((s, j) => j === idx ? "ok" : s));

      if (newInput.length === sequence.length) {
        // Sequência completa — acerto
        const nc = correct + 1;
        setCorrect(nc); setFbOk(true); setPhase("feedback");
        sndCorrect();
        const nr = round + 1;
        markProgress(Math.round((nr / MAX_ROUNDS) * 100));
        const t = setTimeout(() => {
          setBS(Array(8).fill("idle"));
          if (nr >= MAX_ROUNDS) { finish(nc, errors); return; }
          setPhase("between");
          timersRef.current.push(setTimeout(() => startRound(nr), 500));
        }, 850);
        timersRef.current.push(t);
      } else {
        setInput(newInput);
        // Rotação assistida: gira para a vista do próximo bloco esperado
        const nextBlock = sequence[newInput.length];
        setCam(bestCam(nextBlock));
        const t = setTimeout(() => {
          setBS(prev => prev.map((s, j) => j === idx ? "idle" : s));
        }, 280);
        timersRef.current.push(t);
      }
    } else {
      // Erro — revela a sequência restante brevemente
      sndWrong();
      const ne = errors + 1;
      setErrors(ne); setFbOk(false); setPhase("feedback");
      setBS(prev => prev.map((s, j) => {
        if (j === idx) return "err";
        if (sequence.includes(j) && !inputSoFar.includes(j)) return "lit";
        return s;
      }));
      const nr = round + 1;
      markProgress(Math.round((nr / MAX_ROUNDS) * 100));
      const t = setTimeout(() => {
        setBS(Array(8).fill("idle"));
        if (nr >= MAX_ROUNDS) { finish(correct, ne); return; }
        setPhase("between");
        timersRef.current.push(setTimeout(() => startRound(nr), 500));
      }, 1200);
      timersRef.current.push(t);
    }
  }

  useEffect(() => () => clearAll(), []);

  // ── Estilos por tema ─────────────────────────────────────────────────────────
  const bg = theme === "GAMIFIED" ? "bg-gray-950 min-h-screen"
    : theme === "COLORFUL" ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 min-h-screen"
    : "bg-[#071322] min-h-screen";

  const accent = theme === "GAMIFIED" ? "bg-cyan-500"
    : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-500";
  const accentText = theme === "GAMIFIED" ? "text-cyan-400"
    : theme === "COLORFUL" ? "text-purple-700" : "text-blue-400";
  const track = theme === "GAMIFIED" ? "bg-gray-800"
    : theme === "COLORFUL" ? "bg-purple-200" : "bg-slate-800";
  const dotFull = theme === "GAMIFIED" ? "bg-cyan-400"
    : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-400";
  const dotEmpty = theme === "GAMIFIED" ? "bg-gray-700"
    : theme === "COLORFUL" ? "bg-purple-200" : "bg-slate-700";
  const sub = theme === "GAMIFIED" ? "text-gray-400"
    : theme === "COLORFUL" ? "text-gray-500" : "text-slate-400";

  function phaseLabel() {
    if (phase === "watch")    return "Observe a sequência...";
    if (phase === "input")    return `Toque os ${sequence.length} blocos na ordem`;
    if (phase === "feedback") return feedbackOk ? "Correto!" : "Ops — tente de novo!";
    return "Preparando próxima...";
  }

  if (phase === "tutorial") {
    return (
      <CuboCorsiTutorial
        theme={theme}
        onDone={() => { startTsRef.current = Date.now(); startRound(0); }}
      />
    );
  }

  return (
    <div className={bg}>
      <div className="max-w-sm mx-auto px-4 pt-4 pb-8">

        {/* Acertos / erros */}
        <div className="flex items-center justify-end mb-2">
          <span className={`text-xs font-semibold ${sub}`}>
            ✓ {correct} &nbsp; ✗ {errors}
          </span>
        </div>

        {/* Barra de progresso da sessão */}
        <div className={`h-1.5 rounded-full mb-4 ${track}`}>
          <motion.div
            className={`h-full rounded-full ${accent}`}
            style={{ width: `${(round / MAX_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Bolinhas de sequência */}
        <div className="flex gap-1.5 justify-center mb-3">
          {sequence.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < inputSoFar.length ? dotFull : dotEmpty
            }`} />
          ))}
        </div>

        {/* Label de fase */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase + String(feedbackOk)}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-bold text-center mb-1 ${
              phase === "feedback"
                ? feedbackOk ? "text-green-500" : "text-red-400"
                : accentText
            }`}
          >
            {phaseLabel()}
          </motion.p>
        </AnimatePresence>

        {/* Cubo 3D */}
        <CubeScene
          states={blockStates}
          theme={theme}
          interactive={phase === "input"}
          onBlock={handleBlock}
          cam={cam}
        />

        {/* Rodapé */}
        <p className={`text-xs text-center mt-2 ${sub}`}>
          Sequência de {sequence.length} bloco{sequence.length > 1 ? "s" : ""}
          {difficulty >= 6 ? " · avançado" : ""}
        </p>
      </div>
    </div>
  );
}
