"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Geometria ─────────────────────────────────────────────────────────────────
const MAX_ROUNDS = 12;
const BS   = 93;        // bloco px — ~16% maior que o original (80)
const SP   = 8;         // espaço entre blocos
const UNIT = BS + SP;   // 101px por célula

// [col, row, layer]  — col 0|1 (esq/dir)  row 0|1 (baixo/cima)  layer 0|1 (frente/trás)
const BLOCK_POS: [number, number, number][] = [
  [0,0,0],[1,0,0],[0,1,0],[1,1,0],  // face frontal
  [0,0,1],[1,0,1],[0,1,1],[1,1,1],  // face traseira
];

// ── 4 poses seguras — cada uma traz um quadrante ao primeiro plano ─────────────
// Blocos FRONTAIS (layer=0): giro suave, face frontal encarando a câmera.
// Blocos TRASEIROS (layer=1): cubo girado ~155° para que a face traseira do bloco
//   vire e fique encarando a câmera — brilho visível em qualquer ângulo.
type Pose = { rx: number; ry: number };

const POSE_FL: Pose = { rx: -14, ry: -22 }; // frontal-esquerda  (idx 0, 2)
const POSE_FR: Pose = { rx: -14, ry:  22 }; // frontal-direita   (idx 1, 3)
const POSE_BL: Pose = { rx: -14, ry: 155 }; // traseiro-esquerda (idx 4, 6) — cubo virado
const POSE_BR: Pose = { rx: -14, ry:-155 }; // traseiro-direita  (idx 5, 7)

// Pose padrão usada na fase de input (estável, frontal)
const POSE_A = POSE_FL;
const ROTATE_MS = 400;

// Pose garantidamente segura por bloco
function posePorBloco(idx: number): Pose {
  const [col, , layer] = BLOCK_POS[idx];
  if (layer === 0) return col === 0 ? POSE_FL : POSE_FR;
  return col === 0 ? POSE_BL : POSE_BR;
}

function poseSame(a: Pose, b: Pose) { return a.rx === b.rx && a.ry === b.ry; }

// Ordem de pintura (painter's algorithm): quando |ry| > 90° o cubo está "virado",
// então os blocos traseiros estão à frente — desenhá-los por último (= mais alto).
function calcDrawOrder(pose: Pose): number[] {
  return Math.abs(pose.ry) > 90
    ? [3, 1, 2, 0, 7, 5, 6, 4]   // vista traseira: back-blocks por último
    : [6, 7, 4, 5, 2, 3, 0, 1];  // vista frontal:  front-blocks por último
}

// ── Sequência / timing ────────────────────────────────────────────────────────
function seqLen(d: number): number {
  if (d <= 1) return 2; if (d <= 3) return 3; if (d <= 5) return 4;
  if (d <= 6) return 5; if (d <= 7) return 6; if (d <= 8) return 7;
  if (d <= 9) return 8; return 9;
}
function flashMs(d: number): number { return d <= 3 ? 950 : d <= 6 ? 700 : 520; }

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

// ── Paleta visual ─────────────────────────────────────────────────────────────
// IMPORTANTE: `dark` (usado no verso e lados escuros) é igualado à face frontal
// nos estados ativos (lit/correct/wrong/missed).  Isso garante que, quando o cubo
// está girado e o verso do bloco fica visível, o bloco continue brilhando
// claramente na cor certa — sem escurecer ou sumir.
type BState = "idle" | "lit" | "tapped" | "correct" | "wrong" | "missed";

const PAL: Record<BState, { front: string; top: string; right: string; dark: string }> = {
  idle:    { front:"#EDF5FD", top:"#FFFFFF",  right:"#CCE4F7", dark:"#9EC5E8" },
  lit:     { front:"#4A90D9", top:"#6AAEDE",  right:"#3275C1", dark:"#4A90D9" }, // dark=front → verso azul
  tapped:  { front:"#B8D9F5", top:"#D6ECFB",  right:"#8BBCE8", dark:"#8BBCE8" },
  correct: { front:"#4CAF50", top:"#80CB81",  right:"#388E3C", dark:"#4CAF50" }, // dark=front
  wrong:   { front:"#EF5350", top:"#EF9A9A",  right:"#C62828", dark:"#EF5350" }, // dark=front
  missed:  { front:"#FFA726", top:"#FFD54F",  right:"#EF6C00", dark:"#FFA726" }, // dark=front
};

// Sombra/brilho aplicada em TODAS as faces — visível de qualquer ângulo
function faceGlow(state: BState): string | undefined {
  if (state === "lit")     return "0 0 28px 10px rgba(74,144,217,0.60), inset 0 1px 0 rgba(255,255,255,0.45)";
  if (state === "correct") return "0 0 16px 5px rgba(76,175,80,0.45)";
  if (state === "wrong")   return "0 0 16px 5px rgba(239,83,80,0.45)";
  if (state === "missed")  return "0 0 14px 4px rgba(255,167,38,0.45)";
  return undefined;
}

// ── Bloco 3D ──────────────────────────────────────────────────────────────────
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
        position: "absolute", width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: `translate3d(${col * UNIT}px, ${-row * UNIT}px, ${-layer * UNIT}px)`,
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
      {/* verso — cor=dark (=front para estados ativos) → visível e brilhante ao girar */}
      <div style={{ ...face, backgroundColor: c.dark,  transform: `rotateY(180deg) translateZ(${H}px)`,
        boxShadow: glow }} />
    </div>
  );
}

// ── Cena do cubo ──────────────────────────────────────────────────────────────
function CubeScene({ states, pose, interactive, onBlock }: {
  states: BState[]; pose: Pose; interactive: boolean; onBlock: (i: number) => void;
}) {
  const order = calcDrawOrder(pose);

  return (
    // Perspectiva maior (1500px) = menos distorção, leitura mais clara das faces
    <div style={{ perspective: "1500px", perspectiveOrigin: "50% 45%" }}>
      <div style={{
        width: BS, height: BS,
        transformStyle: "preserve-3d",
        transform: `rotateX(${pose.rx}deg) rotateY(${pose.ry}deg)`,
        transition: `transform ${ROTATE_MS}ms cubic-bezier(0.42,0,0.58,1)`,
        margin: "56px auto 44px",
        position: "relative",
        translate: `${-(UNIT / 2)}px ${UNIT / 2}px`,
      }}>
        {order.map(i => (
          <Block3D key={i} idx={i} state={states[i]}
            interactive={interactive} onClick={() => onBlock(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Tutorial interno ──────────────────────────────────────────────────────────
function TutorialDemoWatch({ onDone }: { onDone: () => void }) {
  const DEMO_SEQ = [2, 5, 0, 7];
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
        await sleep(280);
      }
      setPose(POSE_A);
      await sleep(ROTATE_MS + 100);
      if (!cancelRef.current) onDone();
    })().catch(() => {});
    return () => { cancelRef.current = true; timers.current.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className="text-xs text-center font-semibold text-blue-500 mb-1">
        O cubo muda de ângulo antes de acender cada bloco
      </p>
      <CubeScene states={states} pose={pose} interactive={false} onBlock={() => {}} />
    </div>
  );
}

function TutorialDemoInput({ onDone }: { onDone: () => void }) {
  const DEMO_SEQ = [2, 5, 0, 7];
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
        else { if (rs[exp] !== "correct") rs[exp] = "missed"; if (rs[tap] !== "correct") rs[tap] = "wrong"; }
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
      <p className="text-xs text-center font-semibold text-blue-500 mb-1">
        Toque na mesma ordem — verde ✓ / laranja = deveria tocar / vermelho ✗
      </p>
      <CubeScene states={states} pose={POSE_A} interactive onBlock={handleTap} />
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
          instruction: "Blocos acendem em azul-ciano, um de cada vez. O cubo muda de ângulo para revelar cada bloco com clareza.",
          content: (next) => <TutorialDemoWatch key="w" onDone={next} />,
        },
        {
          instruction: "Sua vez! Toque os blocos na mesma ordem. O resultado (verde/vermelho) aparece só ao terminar.",
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

  const [phase, setPhase]     = useState<Phase>("tutorial");
  const [round, setRound]     = useState(0);
  const [sequence, setSeq]    = useState<number[]>([]);
  const [blockStates, setBS]  = useState<BState[]>(Array(8).fill("idle"));
  const [inputSoFar, setInput]= useState<number[]>([]);
  const [pose, setPose]       = useState<Pose>(POSE_A);

  const correctRef  = useRef(0);
  const errorsRef   = useRef(0);
  const [correct, setCorrect] = useState(0);
  const [errors,  setErrors ] = useState(0);

  const cancelRef  = useRef(false);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTsRef = useRef(0);
  const rtsRef     = useRef<number[]>([]);
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

  // ── Iniciar rodada ────────────────────────────────────────────────────────
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
        // 1. Girar para a pose segura do bloco (se diferente da atual)
        const target = posePorBloco(idx);
        if (!poseSame(target, curPose)) {
          setPose(target);
          curPose = target;
          await sleep(ROTATE_MS + 130); // cubo chega antes de acender
        }
        // 2. Acender bloco — sempre visível na pose atual
        setBS(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndFlash();
        await sleep(FLASH);
        // 3. Apagar bloco
        setBS(Array(8).fill("idle"));
        await sleep(280);
      }

      // 4. Voltar à pose frontal estável para input
      if (!poseSame(curPose, POSE_A)) {
        setPose(POSE_A);
        await sleep(ROTATE_MS + 80);
      }
      setPhase("input");
      inputStartRef.current = Date.now();
    } catch { /* cancelado */ }
  }, [difficulty, sleep]);

  // ── Avaliar sequência ─────────────────────────────────────────────────────
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
        if (rs[exp] !== "correct") rs[exp] = "missed";
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

  // ── Input do usuário ──────────────────────────────────────────────────────
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

  // ── Labels e dots ─────────────────────────────────────────────────────────
  const resultOk = phase === "result" && inputSoFar.every((t, i) => t === sequence[i]);

  const label = phase === "watch"  ? "Observe a sequência..."
    : phase === "input"   ? `Toque os ${sequence.length} blocos na ordem`
    : phase === "result"  ? (resultOk ? "✓ Correto!" : "Veja onde errou ↓")
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

        {/* Acertos / erros */}
        <div className="flex justify-end mb-2">
          <span className="text-xs font-semibold text-slate-500">✓ {correct} &nbsp; ✗ {errors}</span>
        </div>

        {/* Barra de progresso da sessão */}
        <div className="h-1.5 rounded-full bg-slate-200 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(round / MAX_ROUNDS) * 100}%` }}
          />
        </div>

        {/* Pontos da sequência */}
        <div className="flex gap-1.5 justify-center mb-3" style={{ minHeight: 14 }}>
          {sequence.map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              backgroundColor: dotColor(i),
              transition: "background-color 0.2s",
            }} />
          ))}
        </div>

        {/* Label da fase */}
        <p style={{
          textAlign: "center", fontSize: 14, fontWeight: 700,
          marginBottom: 4, color: labelColor,
          minHeight: 20, transition: "color 0.25s",
        }}>{label}</p>

        {/* Legenda do resultado (erro) */}
        {phase === "result" && !resultOk && (
          <div className="flex gap-3 justify-center mb-1">
            {[
              { color:"#4CAF50", text:"correto" },
              { color:"#FFA726", text:"deveria tocar" },
              { color:"#EF5350", text:"tocou por engano" },
            ].map(({ color, text }) => (
              <span key={text} style={{ fontSize: 10, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ display:"inline-block", width:8, height:8, borderRadius:2, backgroundColor: color }} />
                {text}
              </span>
            ))}
          </div>
        )}

        {/* Cubo 3D */}
        <CubeScene
          states={blockStates}
          pose={pose}
          interactive={phase === "input"}
          onBlock={handleBlockTap}
        />

        {/* Rodapé */}
        <p className="text-xs text-center text-slate-400 mt-2">
          Sequência de {sequence.length || "—"} bloco{sequence.length !== 1 ? "s" : ""}
          {difficulty >= 6 ? " · avançado" : ""}
        </p>

      </div>
    </div>
  );
}
