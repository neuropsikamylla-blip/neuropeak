"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Geometria ─────────────────────────────────────────────────────────────────
const MAX_ROUNDS = 12;
const BS   = 90;          // lado do bloco px
const SP   = 8;           // espaço entre blocos
const UNIT = BS + SP;     // 98px por célula
// Container CSS que contém a face frontal 2×2:
//   col 0: x=[0, BS-1], col 1: x=[UNIT, UNIT+BS-1]
//   row 1 (topo): y=[0, BS-1], row 0 (base): y=[UNIT, UNIT+BS-1]
const CUBE_W = UNIT + BS;  // 188px
const CUBE_H = UNIT + BS;  // 188px

// [col, row, layer]  col: 0=esq, 1=dir | row: 0=baixo, 1=cima | layer: 0=frente, 1=trás
const BLOCK_POS: [number, number, number][] = [
  [0,0,0],[1,0,0],[0,1,0],[1,1,0],   // camada frontal  — idx 0..3
  [0,0,1],[1,0,1],[0,1,1],[1,1,1],   // camada traseira — idx 4..7
];

// ── 3 poses fixas e previsíveis ───────────────────────────────────────────────
// POSE_L : câmera à esquerda  → revela face esquerda + frente
// POSE_R : câmera à direita   → revela face direita + frente
// POSE_T : inclinada p/ cima  → revela face superior claramente
type Pose = { rx: number; ry: number };

// ry negativo → cubo gira para a esquerda → col=0 fica mais perto da câmera
// ry positivo → cubo gira para a direita  → col=1 fica mais perto
// rx negativo → topo do cubo inclina para a câmera
const POSE_L: Pose = { rx: -16, ry: -30 };  // coluna esquerda em destaque
const POSE_R: Pose = { rx: -16, ry:  30 };  // coluna direita em destaque
const POSE_T: Pose = { rx: -40, ry:   0 };  // topo em destaque

const POSE_A  = POSE_L;   // pose estável de input
const ROTATE_MS = 380;

// ── Bloco → pose canônica ─────────────────────────────────────────────────────
// top (row=1): POSE_T  |  baixo-esq (col=0): POSE_L  |  baixo-dir (col=1): POSE_R
function posePorBloco(idx: number): Pose {
  const [col, row] = BLOCK_POS[idx];
  if (row === 1) return POSE_T;
  return col === 0 ? POSE_L : POSE_R;
}
function poseSame(a: Pose, b: Pose) { return a.rx === b.rx && a.ry === b.ry; }

// Painter's algorithm — ordem de renderização por profundidade (z_world maior = mais perto = DOM mais alto)
// Cálculo com container centrado em (CUBE_W/2, CUBE_H/2):
//   POSE_L (ry<0): col=0 (center_x=-94) fica à frente → 0,2 últimos
//   POSE_R (ry>0): col=1 (center_x=+4)  fica à frente → 1,3 últimos
//   POSE_T (rx<-30): row=1 (center_y=-94) fica à frente → 2,3 últimos
function calcDrawOrder(pose: Pose): number[] {
  if (pose.rx < -30) {
    // POSE_T: topo vem pra frente
    return [4, 5, 6, 7, 0, 1, 2, 3];
  }
  if (pose.ry < 0) {
    // POSE_L (ry negativo): coluna esquerda (col=0) mais próxima
    return [5, 7, 4, 6, 1, 3, 0, 2];
  }
  // POSE_R (ry positivo): coluna direita (col=1) mais próxima
  return [4, 6, 5, 7, 0, 2, 1, 3];
}

// ── Sequência / timing ────────────────────────────────────────────────────────
function seqLen(d: number): number {
  if (d <= 1) return 2; if (d <= 3) return 3; if (d <= 5) return 4;
  if (d <= 6) return 5; if (d <= 7) return 6; if (d <= 8) return 7;
  if (d <= 9) return 8; return 9;
}
function flashMs(d: number): number { return d <= 3 ? 950 : d <= 6 ? 700 : 520; }

// Apenas os 4 blocos da face frontal (layer=0) — sempre visíveis, nunca ocultos.
// Blocos traseiros (4-7) fazem parte da estética 3D mas NUNCA são acesos.
const VISIBLE_BLOCKS = [0, 1, 2, 3];

function randSeq(len: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    let n: number;
    do { n = VISIBLE_BLOCKS[Math.floor(Math.random() * VISIBLE_BLOCKS.length)]; }
    while (arr.length > 0 && n === arr[arr.length - 1]);
    arr.push(n);
  }
  return arr;
}

// ── Áudio ─────────────────────────────────────────────────────────────────────
let _ac: AudioContext | null = null;
function beep(hz: number, ms = 150, vol = 0.07) {
  if (typeof window === "undefined") return;
  try {
    const AC = (window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
    _ac = _ac || new AC();
    if (_ac.state === "suspended") _ac.resume();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.type = "sine"; o.frequency.value = hz;
    g.gain.setValueAtTime(vol, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, _ac.currentTime + ms / 1000);
    o.connect(g); g.connect(_ac.destination);
    o.start(); o.stop(_ac.currentTime + ms / 1000);
  } catch { /* silencioso */ }
}
const sndFlash   = () => beep(440, 160);
const sndTap     = () => beep(520, 70, 0.04);
const sndCorrect = () => { beep(660, 120); setTimeout(() => beep(880, 200), 140); };
const sndWrong   = () => beep(180, 300, 0.05);

// ── Paleta (sem "missed" / laranja) ──────────────────────────────────────────
// dark = igualado à front em estados ativos → brilha de qualquer ângulo
type BState = "idle" | "lit" | "tapped" | "correct" | "wrong";

const PAL: Record<BState, { front: string; top: string; right: string; dark: string }> = {
  idle:    { front:"#EDF5FD", top:"#FFFFFF",  right:"#CCE4F7", dark:"#9EC5E8" },
  lit:     { front:"#4A90D9", top:"#6AAEDE",  right:"#3275C1", dark:"#4A90D9" },
  tapped:  { front:"#B8D9F5", top:"#D6ECFB",  right:"#8BBCE8", dark:"#8BBCE8" },
  correct: { front:"#4CAF50", top:"#80CB81",  right:"#388E3C", dark:"#4CAF50" },
  wrong:   { front:"#EF5350", top:"#EF9A9A",  right:"#C62828", dark:"#EF5350" },
};

function faceGlow(state: BState): string | undefined {
  if (state === "lit")     return "0 0 28px 10px rgba(74,144,217,0.60), inset 0 1px 0 rgba(255,255,255,0.45)";
  if (state === "correct") return "0 0 16px 5px rgba(76,175,80,0.45)";
  if (state === "wrong")   return "0 0 16px 5px rgba(239,83,80,0.45)";
  return undefined;
}

// ── Bloco 3D ──────────────────────────────────────────────────────────────────
// POSICIONAMENTO: dentro do container CUBE_W × CUBE_H
//   col=0 → x=0,     col=1 → x=UNIT
//   row=1 → y=0,     row=0 → y=UNIT   (row=1 fica no TOPO = y menor)
//   layer=0 → z=0,   layer=1 → z=-UNIT (trás)
function Block3D({ idx, state, interactive, onClick }: {
  idx: number; state: BState; interactive: boolean; onClick: () => void;
}) {
  const [col, row, layer] = BLOCK_POS[idx];
  const c = PAL[state];
  const H = BS / 2;
  const glow = faceGlow(state);
  const idleShadow = "inset 0 1.5px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(100,140,180,0.1)";

  const face: React.CSSProperties = {
    position: "absolute", width: BS, height: BS,
    backfaceVisibility: "hidden",
    borderRadius: 14,
    border: "1.5px solid rgba(90,130,170,0.14)",
    transition: "background-color 0.18s ease, box-shadow 0.18s ease",
  };

  return (
    <div
      style={{
        position: "absolute",
        width: BS, height: BS,
        transformStyle: "preserve-3d",
        // row=1 (topo) → y=0 ; row=0 (base) → y=UNIT
        transform: `translate3d(${col * UNIT}px, ${(1 - row) * UNIT}px, ${-layer * UNIT}px)`,
        cursor: interactive ? "pointer" : "default",
      }}
      onClick={interactive ? onClick : undefined}
    >
      {/* frente */}
      <div style={{ ...face, backgroundColor: c.front, transform: `translateZ(${H}px)`,
        boxShadow: glow ?? idleShadow }} />
      {/* topo */}
      <div style={{ ...face, backgroundColor: c.top,   transform: `rotateX(90deg) translateZ(${H}px)`,
        boxShadow: glow }} />
      {/* direita */}
      <div style={{ ...face, backgroundColor: c.right, transform: `rotateY(90deg) translateZ(${H}px)`,
        boxShadow: glow }} />
      {/* esquerda */}
      <div style={{ ...face, backgroundColor: c.dark,  transform: `rotateY(-90deg) translateZ(${H}px)`,
        boxShadow: glow }} />
      {/* baixo */}
      <div style={{ ...face, backgroundColor: c.dark,  transform: `rotateX(-90deg) translateZ(${H}px)`,
        boxShadow: glow }} />
      {/* verso */}
      <div style={{ ...face, backgroundColor: c.dark,  transform: `rotateY(180deg) translateZ(${H}px)`,
        boxShadow: glow }} />
    </div>
  );
}

// ── Cena do cubo ──────────────────────────────────────────────────────────────
// CubeScene: container CUBE_W × CUBE_H contém a grade 2×2 corretamente.
// paddingTop absorve o overflow visual 3D (evita o cubo cobrir textos acima).
// compact=true: margens menores para caber no card do tutorial.
function CubeScene({ states, pose, interactive, onBlock, compact = false }: {
  states: BState[]; pose: Pose; interactive: boolean; onBlock: (i: number) => void; compact?: boolean;
}) {
  const order = calcDrawOrder(pose);
  // paddingTop reserva espaço para o overflow 3D upward (≈ sin(40°) × CUBE_H/2 ≈ 60px)
  const pt = compact ? 22 : 58;
  const mb = compact ? 12 : 28;

  return (
    <div style={{
      perspective: "1200px",
      perspectiveOrigin: "50% 50%",
      paddingTop: pt,
      paddingBottom: 4,
    }}>
      <div style={{
        width: CUBE_W,
        height: CUBE_H,
        transformStyle: "preserve-3d",
        transform: `rotateX(${pose.rx}deg) rotateY(${pose.ry}deg)`,
        transition: `transform ${ROTATE_MS}ms cubic-bezier(0.42,0,0.58,1)`,
        margin: `0 auto ${mb}px`,
        position: "relative",
      }}>
        {order.map(i => (
          <Block3D key={i} idx={i} state={states[i]}
            interactive={interactive} onClick={() => onBlock(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Tutorial — demo "observar" ─────────────────────────────────────────────────
function TutorialDemoWatch({ onDone }: { onDone: () => void }) {
  // Sequência usa as 3 poses: 6→POSE_T, 1→POSE_R, 2→POSE_T, 0→POSE_L
  const DEMO_SEQ = [6, 1, 2, 0];
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const [pose, setPose] = useState<Pose>(POSE_A);
  const cancelRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    (async () => {
      const sleep = (ms: number) => new Promise<void>((res, rej) => {
        if (cancelRef.current) { rej(); return; }
        const t = setTimeout(() => cancelRef.current ? rej() : res(), ms);
        timers.current.push(t);
      });
      await sleep(400);
      let cur = POSE_A;
      for (const idx of DEMO_SEQ) {
        if (cancelRef.current) return;
        const target = posePorBloco(idx);
        if (!poseSame(target, cur)) {
          setPose(target); cur = target;
          await sleep(ROTATE_MS + 120);
        }
        setStates(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndFlash();
        await sleep(820);
        setStates(Array(8).fill("idle"));
        await sleep(260);
      }
      setPose(POSE_A);
      await sleep(ROTATE_MS + 80);
      if (!cancelRef.current) onDone();
    })().catch(() => {});
    return () => { cancelRef.current = true; timers.current.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className="text-xs text-center font-semibold text-blue-500 mb-0.5">
        O cubo gira para revelar cada bloco com clareza
      </p>
      <CubeScene states={states} pose={pose} interactive={false} onBlock={() => {}} compact />
    </div>
  );
}

// ── Tutorial — demo "responder" ───────────────────────────────────────────────
function TutorialDemoInput({ onDone }: { onDone: () => void }) {
  const DEMO_SEQ = [6, 1, 2, 0];
  const [states, setStates] = useState<BState[]>(Array(8).fill("idle"));
  const [input, setInput] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleTap = (idx: number) => {
    if (finished) return;
    sndTap();
    setStates(prev => prev.map((s, j) => j === idx ? "tapped" : s));
    const t = setTimeout(() => setStates(prev => prev.map((s, j) => j === idx && s === "tapped" ? "idle" : s)), 180);
    timers.current.push(t);
    const ni = [...input, idx];
    setInput(ni);
    if (ni.length === DEMO_SEQ.length) {
      setFinished(true);
      const rs: BState[] = Array(8).fill("idle");
      ni.forEach((tap, i) => {
        const exp = DEMO_SEQ[i];
        if (tap === exp) { rs[exp] = "correct"; }
        else {
          if (rs[exp] !== "correct") rs[exp] = "wrong";
          if (rs[tap] !== "correct") rs[tap] = "wrong";
        }
      });
      ni.every((tap, i) => tap === DEMO_SEQ[i]) ? sndCorrect() : sndWrong();
      setStates(rs);
      const t2 = setTimeout(onDone, 1800);
      timers.current.push(t2);
    }
  };

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  return (
    <div>
      <p className="text-xs text-center mb-0.5" style={{ color: "#475569" }}>
        Toque na mesma ordem&ensp;
        <span style={{ color:"#4CAF50", fontWeight:600 }}>verde = certo</span>
        &ensp;/&ensp;
        <span style={{ color:"#EF5350", fontWeight:600 }}>vermelho = errado</span>
      </p>
      <CubeScene states={states} pose={POSE_A} interactive onBlock={handleTap} compact />
      <div className="flex gap-1.5 justify-center">
        {DEMO_SEQ.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: i < input.length ? "#4A90D9" : "#D6EAF8",
            transition: "background-color 0.2s",
          }} />
        ))}
      </div>
    </div>
  );
}

function CuboCorsiTutorial({ onDone }: { onDone: () => void }) {
  return (
    <TutorialBase
      theme="CLINICAL"
      title="Cubos"
      steps={[
        {
          instruction: "Blocos acendem em azul, um de cada vez. O cubo gira antes de acender cada bloco para que fique bem visível.",
          content: (next) => <TutorialDemoWatch key="w" onDone={next} />,
        },
        {
          instruction: "Agora é com você! Toque os blocos na mesma ordem. Verde = certo, Vermelho = errado.",
          content: (next) => <TutorialDemoInput key="i" onDone={next} />,
        },
      ]}
      onDone={onDone}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
interface Props { difficulty: number; theme: Theme; onComplete: (r: ExerciseResult) => void; }
type Phase = "tutorial" | "watch" | "input" | "result" | "between";

export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
  const markProgress = useExerciseProgress();

  const [phase, setPhase]      = useState<Phase>("tutorial");
  const [round, setRound]      = useState(0);
  const [sequence, setSeq]     = useState<number[]>([]);
  const [blockStates, setBS]   = useState<BState[]>(Array(8).fill("idle"));
  const [inputSoFar, setInput] = useState<number[]>([]);
  const [pose, setPose]        = useState<Pose>(POSE_A);

  const correctRef  = useRef(0);
  const errorsRef   = useRef(0);
  const [correct, setCorrect] = useState(0);
  const [errors,  setErrors ] = useState(0);

  const cancelRef     = useRef(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTsRef    = useRef(0);
  const rtsRef        = useRef<number[]>([]);
  const inputStartRef = useRef(0);

  function clearAll() {
    cancelRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  const sleep = useCallback((ms: number) => new Promise<void>((res, rej) => {
    if (cancelRef.current) { rej("c"); return; }
    const t = setTimeout(() => cancelRef.current ? rej("c") : res(), ms);
    timersRef.current.push(t);
  }), []);

  // ── Iniciar rodada ─────────────────────────────────────────────────────────
  const startRound = useCallback(async (r: number) => {
    cancelRef.current = false;
    const seq = randSeq(seqLen(difficulty));
    setSeq(seq);
    setInput([]);
    setBS(Array(8).fill("idle"));
    setRound(r);
    setPose(POSE_A);
    setPhase("watch");

    const FLASH = flashMs(difficulty);
    let curPose = POSE_A;

    try {
      await sleep(600);

      for (const idx of seq) {
        const target = posePorBloco(idx);
        if (!poseSame(target, curPose)) {
          setPose(target);
          curPose = target;
          await sleep(ROTATE_MS + 130);
        }
        setBS(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndFlash();
        await sleep(FLASH);
        setBS(Array(8).fill("idle"));
        await sleep(260);
      }

      if (!poseSame(curPose, POSE_A)) {
        setPose(POSE_A);
        await sleep(ROTATE_MS + 80);
      }
      setPhase("input");
      inputStartRef.current = Date.now();
    } catch { /* cancelado */ }
  }, [difficulty, sleep]);

  // ── Avaliar sequência ──────────────────────────────────────────────────────
  const evaluateSequence = useCallback((userInput: number[], seq: number[], r: number) => {
    const allOk = userInput.every((tap, i) => tap === seq[i]);
    const nr = r + 1;

    const rs: BState[] = Array(8).fill("idle");
    for (let i = 0; i < seq.length; i++) {
      const exp = seq[i];
      const act = userInput[i];
      if (act === exp) {
        rs[exp] = "correct";
      } else {
        if (rs[exp] !== "correct") rs[exp] = "wrong";
        if (rs[act] !== "correct") rs[act] = "wrong";
      }
    }
    setBS(rs);
    setPhase("result");
    rtsRef.current.push((Date.now() - inputStartRef.current) / seq.length);

    if (allOk) {
      correctRef.current++;
      setCorrect(correctRef.current);
      sndCorrect();
    } else {
      errorsRef.current++;
      setErrors(errorsRef.current);
      sndWrong();
    }

    markProgress(Math.round((nr / MAX_ROUNDS) * 100));

    const t = setTimeout(() => {
      setBS(Array(8).fill("idle"));
      if (nr >= MAX_ROUNDS) {
        const avgRt = rtsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, rtsRef.current.length);
        const fc = correctRef.current, fe = errorsRef.current;
        const acc = fc / Math.max(1, fc + fe);
        const dur = Math.round((Date.now() - startTsRef.current) / 1000);
        const score = calculateExerciseScore("cubo-corsi", acc, avgRt, difficulty);
        onComplete({
          exerciseId: "cubo-corsi", domain: "memory",
          score, accuracy: acc, reactionTime: avgRt, difficulty, duration: dur,
          metadata: { correct: fc, errors: fe, rounds: MAX_ROUNDS },
        });
        return;
      }
      setPhase("between");
      timersRef.current.push(setTimeout(() => startRound(nr), 550));
    }, 2000);
    timersRef.current.push(t);
  }, [difficulty, markProgress, onComplete, startRound]);

  // ── Input do usuário ───────────────────────────────────────────────────────
  const handleBlockTap = useCallback((idx: number) => {
    if (phase !== "input") return;
    const pos = inputSoFar.length;
    if (pos >= sequence.length) return;

    sndTap();
    setBS(prev => prev.map((s, j) => j === idx ? "tapped" : s));
    const t = setTimeout(() => setBS(prev => prev.map((s, j) => j === idx && s === "tapped" ? "idle" : s)), 200);
    timersRef.current.push(t);

    const newInput = [...inputSoFar, idx];
    setInput(newInput);

    if (newInput.length === sequence.length) {
      const t2 = setTimeout(() => evaluateSequence(newInput, sequence, round), 280);
      timersRef.current.push(t2);
    }
  }, [phase, inputSoFar, sequence, round, evaluateSequence]);

  useEffect(() => () => clearAll(), []);

  // ── Labels ─────────────────────────────────────────────────────────────────
  const resultOk = phase === "result" && inputSoFar.every((t, i) => t === sequence[i]);

  const label = phase === "watch"  ? "Observe a sequência..."
    : phase === "input"  ? `Toque os ${sequence.length} blocos na ordem`
    : phase === "result" ? (resultOk ? "Correto!" : "Veja onde errou")
    : "";

  const labelColor = phase === "result" ? (resultOk ? "#22C55E" : "#EF4444") : "#3B82F6";

  const dotColor = (i: number) => {
    if (phase === "result" && i < inputSoFar.length)
      return inputSoFar[i] === sequence[i] ? "#4CAF50" : "#EF5350";
    return i < inputSoFar.length ? "#4A90D9" : "#D6EAF8";
  };

  if (phase === "tutorial") {
    return (
      <CuboCorsiTutorial onDone={() => { startTsRef.current = Date.now(); startRound(0); }} />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-sm mx-auto px-4 pt-4 pb-8">

        <div className="flex justify-end mb-2">
          <span className="text-xs font-semibold text-slate-500">✓ {correct} &nbsp; ✗ {errors}</span>
        </div>

        <div className="h-1.5 rounded-full bg-slate-200 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(round / MAX_ROUNDS) * 100}%` }}
          />
        </div>

        <div className="flex gap-1.5 justify-center mb-3" style={{ minHeight: 14 }}>
          {sequence.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              backgroundColor: dotColor(i),
              transition: "background-color 0.2s",
            }} />
          ))}
        </div>

        <p style={{
          textAlign: "center", fontSize: 14, fontWeight: 700,
          marginBottom: 4, color: labelColor,
          minHeight: 20, transition: "color 0.25s",
        }}>{label}</p>

        {phase === "result" && !resultOk && (
          <div className="flex gap-4 justify-center mb-1">
            <span style={{ fontSize: 10, color:"#64748B", display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ display:"inline-block", width:8, height:8, borderRadius:2, backgroundColor:"#4CAF50" }} />
              certo
            </span>
            <span style={{ fontSize: 10, color:"#64748B", display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ display:"inline-block", width:8, height:8, borderRadius:2, backgroundColor:"#EF5350" }} />
              errado
            </span>
          </div>
        )}

        <CubeScene
          states={blockStates}
          pose={pose}
          interactive={phase === "input"}
          onBlock={handleBlockTap}
        />

        <p className="text-xs text-center text-slate-400 mt-2">
          Sequência de {sequence.length || "—"} bloco{sequence.length !== 1 ? "s" : ""}
          {difficulty >= 6 ? " · avançado" : ""}
        </p>

      </div>
    </div>
  );
}
