"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Cubo 2×2×2 em CSS 3D real ──────────────────────────────
// 3 faces ativas (TOPO, ESQUERDA, DIREITA) com 4 células cada = 12 células
// visíveis e clicáveis. Quando uma peça acende, o cubo GIRA de forma fluida para
// trazer aquela face de frente. Na reprodução fica na vista isométrica estável.

type Face = "top" | "left" | "right";
type BState = "idle" | "lit" | "tapped" | "correct" | "wrong";

// Índices 0-11 → face do jogo (TOPO 0-3 · ESQUERDA 4-7 · DIREITA 8-11)
const FACE_OF: Face[] = ["top","top","top","top","left","left","left","left","right","right","right","right"];

const IDLE: Record<Face, string> = {
  top:   "#FCFEFF",   // topo — placa quase branca (paleta da Kamylla: placas #F7FBFF)
  left:  "#F7FBFF",   // esquerda — placa
  right: "#F2F8FD",   // direita — placa levemente sombreada (leitura 3D)
};
const ACTIVE: Record<Exclude<BState, "idle">, string> = {
  lit:     "#4F8FEA",   // luz ativa (paleta da Kamylla)
  tapped:  "#BBD4F7",
  correct: "#46C66A",
  wrong:   "#F26257",
};
function cellColor(st: BState, face: Face) { return st === "idle" ? IDLE[face] : ACTIVE[st]; }
function cellStroke(st: BState): string {
  if (st === "lit")     return "#3B79D9";
  if (st === "correct") return "#2E9E4F";
  if (st === "wrong")   return "#C73B30";
  return "#82A9CF";     // bordas mais escuras (paleta da Kamylla)
}

// Duração da virada — rápida e fluida (sem truncar). CALIBRÁVEL.
const TURN_MS = 1100;

// Pose do cubo: traz a face acesa INTEIRAMENTE de frente para a tela (0° — o paciente
// vê a face acesa "chapada", de cara). ISO quando nada aceso.
// Geometria: ESQUERDA do jogo = face "front" (normal +Z → 0°); DIREITA = face "right"
// (normal +X → rotateY(-90°)); TOPO = face "top" (normal -Y → rotateX(-90°)).
function cubePose(face: Face | null): string {
  switch (face) {
    case "top":   return "rotateX(-90deg) rotateY(0deg)";
    case "left":  return "rotateX(0deg) rotateY(0deg)";
    case "right": return "rotateX(0deg) rotateY(-90deg)";
    default:      return "rotateX(-26deg) rotateY(-38deg)";
  }
}
// Posição 3D de cada face do cubo (lado S). 'front' = ESQUERDA do jogo.
function faceCss(name: string, h: number): string {
  switch (name) {
    case "top":    return `rotateX(90deg) translateZ(${h}px)`;
    case "front":  return `translateZ(${h}px)`;
    case "right":  return `rotateY(90deg) translateZ(${h}px)`;
    case "leftbk": return `rotateY(-90deg) translateZ(${h}px)`;
    case "bottom": return `rotateX(-90deg) translateZ(${h}px)`;
    case "back":   return `rotateY(180deg) translateZ(${h}px)`;
  }
  return "";
}

const FACE_BASE: Record<string, number | null> = { top: 0, front: 4, right: 8, leftbk: null, bottom: null, back: null };
const FACE_COLOR: Record<string, Face> = { top: "top", front: "left", right: "right" };

function IsoCube({
  states, interactive, onTile, size = 360, poseFace,
}: {
  states: BState[]; interactive: boolean; onTile: (i: number) => void; size?: number;
  poseFace?: Face | null;
}) {
  const litIdx = states.findIndex(s => s === "lit");
  const derivedFace: Face | null = litIdx >= 0 ? FACE_OF[litIdx] : null;
  const litFace: Face | null = poseFace !== undefined ? poseFace : derivedFace;
  const S = Math.round(size * 0.46);
  const gap = Math.max(4, Math.round(S * 0.05));
  const r = Math.round(S * 0.08);

  const renderFace = (name: string) => {
    const base = FACE_BASE[name];
    const active = base !== null;
    return (
      <div key={name} style={{
        position: "absolute", width: S, height: S, transform: faceCss(name, S / 2),
        display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
        gap, padding: gap, boxSizing: "border-box", borderRadius: Math.round(S * 0.1),
        background: "#9EBEDD", backfaceVisibility: "hidden",   // estrutura (paleta da Kamylla)
      }}>
        {[0,1,2,3].map(i => {
          if (!active) return <div key={i} style={{ borderRadius: r, background: "#EAF2FA" }} />;
          const idx = (base as number) + i;
          const st = states[idx] ?? "idle";
          const fc = FACE_COLOR[name];
          return (
            <div key={i}
              onPointerDown={interactive ? (e) => { e.preventDefault(); onTile(idx); } : undefined}
              style={{
                borderRadius: r,
                background: cellColor(st, fc),
                border: `1.5px solid ${cellStroke(st)}`,
                boxShadow: st === "lit"
                  ? "0 0 16px rgba(79,143,234,0.55)"
                  : "inset 0 1px 2px rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.10)",
                cursor: interactive ? "pointer" : "default",
                transition: "background 0.15s ease, box-shadow 0.2s ease",
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      width: size, height: size, maxWidth: "100%", margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: size * 1.9, touchAction: "manipulation",
    }}>
      <div style={{
        width: S, height: S, position: "relative", transformStyle: "preserve-3d",
        transform: cubePose(litFace),
        filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.10))",   // sombra suave (paleta: preto ~10%)
        // Virada fluida (TURN_MS), ease-in-out simétrico (sem overshoot/quique):
        // acelera progressivamente no início e desacelera no final (estilo smoothstep).
        transition: `transform ${TURN_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
      }}>
        {["back","bottom","leftbk","right","front","top"].map(renderFace)}
      </div>
    </div>
  );
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

// ── Sequência / timing ────────────────────────────────────────────────────────
// Engine padrão: a sessão dura ~7 min (faixa 6-8) e a barra avança pelo TEMPO
// decorrido (0→100%). A dificuldade sobe +1 a cada 2 acertos SEGUIDOS.
const TARGET_MS  = 7 * 60 * 1000;  // duração-alvo da sessão
const MAX_ROUNDS = 80;             // trava de segurança (normalmente não atingida)
const N_TILES    = 12;

function seqLen(d: number): number {
  if (d <= 1) return 2; if (d <= 3) return 3; if (d <= 5) return 4;
  if (d <= 6) return 5; if (d <= 7) return 6; if (d <= 8) return 7;
  if (d <= 9) return 8; return 9;
}

function randSeq(len: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    let n: number;
    do { n = Math.floor(Math.random() * N_TILES); }
    while (arr.length > 0 && n === arr[arr.length - 1]);
    arr.push(n);
  }
  return arr;
}

// ── Tutorial ──────────────────────────────────────────────────────────────────
// Demo: uma peça de cada face (topo, esquerda, direita) + uma extra do topo.
const DEMO_SEQ = [0, 4, 8, 3]; // topo · esquerda · direita · topo

function TutorialDemoWatch({ onDone }: { onDone: () => void }) {
  const [states, setStates] = useState<BState[]>(Array(N_TILES).fill("idle"));
  const [pose, setPose] = useState<Face | null>(null);
  const cancelRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    (async () => {
      const sleep = (ms: number) => new Promise<void>((res, rej) => {
        if (cancelRef.current) { rej(); return; }
        const t = setTimeout(() => cancelRef.current ? rej() : res(), ms);
        timers.current.push(t);
      });
      try {
        await sleep(400);
        // Mesmo ciclo do jogo: VIRA primeiro → peça PISCA de frente → volta.
        for (const idx of DEMO_SEQ) {
          if (cancelRef.current) return;
          setPose(FACE_OF[idx]);
          await sleep(TURN_MS + 120);
          setStates(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
          sndFlash();
          await sleep(850);
          setStates(Array(N_TILES).fill("idle"));
          setPose(null);
          await sleep(TURN_MS + 200);
        }
        if (!cancelRef.current) onDone();
      } catch { /* cancelado */ }
    })();
    return () => { cancelRef.current = true; timers.current.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p className="text-xs text-center font-semibold mb-2" style={{ color: "#1D4ED8" }}>
        O quadrado dourado acende — memorize a ordem!
      </p>
      <IsoCube states={states} interactive={false} onTile={() => {}} size={380} poseFace={pose} />
    </div>
  );
}

function TutorialDemoInput({ onDone }: { onDone: () => void }) {
  const [states, setStates] = useState<BState[]>(Array(N_TILES).fill("idle"));
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
      const rs: BState[] = Array(N_TILES).fill("idle");
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
      <p className="text-xs text-center mb-2" style={{ color: "#475569" }}>
        Toque na mesma ordem &nbsp;
        <span style={{ color: "#46C66A", fontWeight: 600 }}>verde = certo</span>
        &nbsp;/&nbsp;
        <span style={{ color: "#F26257", fontWeight: 600 }}>vermelho = errado</span>
      </p>
      <IsoCube states={states} interactive={!finished} onTile={handleTap} size={300} />
      <div className="flex gap-1.5 justify-center mt-2">
        {DEMO_SEQ.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: i < input.length ? "#4AAED9" : "#D6EAF8",
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
          instruction: "Um quadrado dourado acende de cada vez — no topo, na lateral esquerda ou na lateral direita do cubo. O cubo se inclina de leve para mostrar melhor a peça que acendeu. Memorize a sequência!",
          content: (next) => <TutorialDemoWatch key="w" onDone={next} />,
        },
        {
          instruction: "Toque os quadrados na mesma ordem em que acenderam. Verde = acertou, Vermelho = errou.",
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
  // Barra por TEMPO ATIVO (pausa quando o paciente não interage) — hook padrão.
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(TARGET_MS);

  const [phase, setPhase]      = useState<Phase>("tutorial");
  const [round, setRound]      = useState(0);
  const [sequence, setSeq]     = useState<number[]>([]);
  const [tileStates, setTS]    = useState<BState[]>(Array(N_TILES).fill("idle"));
  const [inputSoFar, setInput] = useState<number[]>([]);

  const correctRef = useRef(0);
  const errorsRef  = useRef(0);
  const [poseFace, setPoseFace] = useState<Face | null>(null);  // face que o cubo apresenta

  const cancelRef     = useRef(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rtsRef        = useRef<number[]>([]);
  const inputStartRef = useRef(0);

  // Dificuldade adaptativa intra-sessão (+1 a cada 2 acertos seguidos)
  const curDiffRef  = useRef(difficulty);
  const streakRef   = useRef(0);
  const maxDiffRef  = useRef(difficulty);

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

  const startRound = useCallback(async (r: number) => {
    cancelRef.current = false;
    const d = curDiffRef.current;       // dificuldade ATUAL (sobe durante a sessão)
    const seq = randSeq(seqLen(d));
    setSeq(seq);
    setInput([]);
    setTS(Array(N_TILES).fill("idle"));
    setPoseFace(null);                  // começa na vista isométrica
    setRound(r);
    setPhase("watch");

    try {
      await sleep(600);
      // TODA peça acesa faz a virada COMPLETA (mesmo que repita a face):
      // acende na vista de canto → 1s → vira p/ frente (2,75s, luz acesa a
      // trajetória toda) → 1s de frente → apaga → volta suave à vista de canto.
      // Ordem correta: VIRA primeiro → com a face de frente, a peça PISCA → volta.
      for (const idx of seq) {
        const face = FACE_OF[idx];
        setPoseFace(face);              // vira p/ a face (TURN_MS, fluida, sem corte)
        await sleep(TURN_MS + 120);     // espera a virada completar
        setTS(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndFlash();                     // pisca DE FRENTE p/ o paciente
        await sleep(850);
        setTS(Array(N_TILES).fill("idle"));
        setPoseFace(null);              // volta suave à vista de canto
        await sleep(TURN_MS + 200);     // espera a volta + respiro
      }
      setPhase("input");
      inputStartRef.current = Date.now();
    } catch { /* cancelado */ }
  }, [sleep]);

  const evaluateSequence = useCallback((userInput: number[], seq: number[], r: number) => {
    const allOk = userInput.every((tap, i) => tap === seq[i]);
    const nr = r + 1;

    const rs: BState[] = Array(N_TILES).fill("idle");
    for (let i = 0; i < seq.length; i++) {
      const exp = seq[i], act = userInput[i];
      if (act === exp) { rs[exp] = "correct"; }
      else {
        if (rs[exp] !== "correct") rs[exp] = "wrong";
        if (act !== undefined && rs[act] !== "correct") rs[act] = "wrong";
      }
    }
    setTS(rs);
    setPhase("result");
    rtsRef.current.push((Date.now() - inputStartRef.current) / seq.length);

    // "Musculação": 2 acertos seguidos → sobe; 2 erros seguidos → desce um pouco.
    if (allOk) {
      correctRef.current++; sndCorrect();
      streakRef.current = Math.max(0, streakRef.current) + 1;
      if (streakRef.current >= 2) {
        streakRef.current = 0;
        curDiffRef.current = Math.min(10, curDiffRef.current + 1);
        maxDiffRef.current = Math.max(maxDiffRef.current, curDiffRef.current);
      }
    } else {
      errorsRef.current++; sndWrong();
      streakRef.current = Math.min(0, streakRef.current) - 1;
      if (streakRef.current <= -2) {
        streakRef.current = 0;
        curDiffRef.current = Math.max(1, curDiffRef.current - 1);
      }
    }

    const t = setTimeout(() => {
      setTS(Array(N_TILES).fill("idle"));
      // Termina quando atinge a duração-alvo de TEMPO ATIVO (~7 min) — não por nº fixo de rodadas.
      if (isTimeUp() || nr >= MAX_ROUNDS) {
        finish();
        const avgRt = rtsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, rtsRef.current.length);
        const fc = correctRef.current, fe = errorsRef.current;
        const acc = fc / Math.max(1, fc + fe);
        const dur = elapsedSec();
        const reached = maxDiffRef.current;
        const score = calculateExerciseScore("cubo-corsi", acc, avgRt, reached);
        onComplete({
          exerciseId: "cubo-corsi", domain: "memory",
          score, accuracy: acc, reactionTime: avgRt, difficulty: reached, duration: dur,
          metadata: { correct: fc, errors: fe, rounds: nr, reachedDifficulty: reached },
        });
        return;
      }
      setPhase("between");
      timersRef.current.push(setTimeout(() => startRound(nr), 500));
    }, 1800);
    timersRef.current.push(t);
  }, [isTimeUp, finish, elapsedSec, onComplete, startRound]);

  const handleTileTap = useCallback((idx: number) => {
    if (phase !== "input") return;
    const pos = inputSoFar.length;
    if (pos >= sequence.length) return;

    sndTap();
    setTS(prev => prev.map((s, j) => j === idx ? "tapped" : s));
    const t = setTimeout(() => setTS(prev => prev.map((s, j) => j === idx && s === "tapped" ? "idle" : s)), 200);
    timersRef.current.push(t);

    const newInput = [...inputSoFar, idx];
    setInput(newInput);
    if (newInput.length === sequence.length) {
      const t2 = setTimeout(() => evaluateSequence(newInput, sequence, round), 280);
      timersRef.current.push(t2);
    }
  }, [phase, inputSoFar, sequence, round, evaluateSequence]);

  useEffect(() => () => clearAll(), []);

  if (phase === "tutorial") {
    return <CuboCorsiTutorial onDone={() => { begin(); startRound(0); }} />;
  }

  const resultOk = phase === "result" && inputSoFar.every((t, i) => t === sequence[i]);
  const label = phase === "watch"  ? "Observe a sequência..."
    : phase === "input"  ? `Toque os ${sequence.length} quadrados na ordem`
    : phase === "result" ? (resultOk ? "Correto! ✓" : "Veja onde errou")
    : "";
  const labelColor = phase === "result" ? (resultOk ? "#22C55E" : "#EF4444") : "#1D4ED8";

  const dotColor = (i: number) => {
    if (phase === "result" && i < inputSoFar.length)
      return inputSoFar[i] === sequence[i] ? "#46C66A" : "#F26257";
    return i < inputSoFar.length ? "#4AAED9" : "#D6EAF8";
  };

  return (
    <div style={{ background: "#F4F7FB", minHeight: "100vh" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "18px 14px 32px" }}>

        {/* Barra de progresso (tempo ativo) */}
        <ExerciseProgressBar progressPct={progressPct} />

        {/* Label */}
        <p style={{
          textAlign: "center", fontSize: 15, fontWeight: 700,
          color: labelColor, marginBottom: 8, minHeight: 22,
          transition: "color 0.25s",
        }}>{label}</p>

        {/* Legenda do resultado incorreto */}
        {phase === "result" && !resultOk && (
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, backgroundColor: "#46C66A" }} />
              certo
            </span>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, backgroundColor: "#F26257" }} />
              errado
            </span>
          </div>
        )}

        {/* Cubo 3D — gira para apresentar de frente a face da peça que acende */}
        <IsoCube
          states={tileStates}
          interactive={phase === "input"}
          onTile={handleTileTap}
          poseFace={poseFace}
          size={500}
        />

        {/* Dots de sequência */}
        <div style={{ display: "flex", gap: 7, justifyContent: "center", marginTop: 10, minHeight: 14 }}>
          {sequence.map((_, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: "50%",
              backgroundColor: dotColor(i),
              transition: "background-color 0.2s",
            }} />
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
          Sequência de {sequence.length || "—"} quadrado{sequence.length !== 1 ? "s" : ""}
          {sequence.length >= 6 ? " · nível avançado" : ""}
        </p>

      </div>
    </div>
  );
}
