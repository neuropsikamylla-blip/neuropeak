"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Geometria isométrica 2D ────────────────────────────────────────────────────
// Cubo 2×2×2 em SVG — 12 tiles visíveis: topo (T), frente/esquerda (F), direita (R).
// U aumentado para 78 (+20% em relação ao original 65), cubo exibido maior.

const U  = 78;    // unidade isométrica px
const OX = 195;   // origem x
const OY = 185;   // origem y
// viewBox: "0 0 400 375"

function iso(x: number, y: number, z: number) {
  return { x: OX + (x - z) * U, y: OY - y * U + (x + z) * U / 2 };
}

type Face = "front" | "right" | "top";
interface TileDef { pts: { x: number; y: number }[]; face: Face }

const TILES: TileDef[] = [
  // FRENTE (z=0) — índices 0-3
  { pts: [iso(0,0,0), iso(1,0,0), iso(1,1,0), iso(0,1,0)], face: "front" },
  { pts: [iso(1,0,0), iso(2,0,0), iso(2,1,0), iso(1,1,0)], face: "front" },
  { pts: [iso(0,1,0), iso(1,1,0), iso(1,2,0), iso(0,2,0)], face: "front" },
  { pts: [iso(1,1,0), iso(2,1,0), iso(2,2,0), iso(1,2,0)], face: "front" },
  // DIREITA (x=2) — índices 4-7
  { pts: [iso(2,0,0), iso(2,0,1), iso(2,1,1), iso(2,1,0)], face: "right" },
  { pts: [iso(2,1,0), iso(2,1,1), iso(2,2,1), iso(2,2,0)], face: "right" },
  { pts: [iso(2,0,1), iso(2,0,2), iso(2,1,2), iso(2,1,1)], face: "right" },
  { pts: [iso(2,1,1), iso(2,1,2), iso(2,2,2), iso(2,2,1)], face: "right" },
  // TOPO (y=2) — índices 8-11
  { pts: [iso(0,2,0), iso(1,2,0), iso(1,2,1), iso(0,2,1)], face: "top" },
  { pts: [iso(1,2,0), iso(2,2,0), iso(2,2,1), iso(1,2,1)], face: "top" },
  { pts: [iso(0,2,1), iso(1,2,1), iso(1,2,2), iso(0,2,2)], face: "top" },
  { pts: [iso(1,2,1), iso(2,2,1), iso(2,2,2), iso(1,2,2)], face: "top" },
];

// Hexágono externo = corpo escuro (grade entre tiles)
const HEX = [iso(0,2,0), iso(2,2,0), iso(2,0,0), iso(2,0,2), iso(0,0,2), iso(0,2,2)]
  .map(p => `${p.x},${p.y}`).join(" ");

// ── Path com cantos arredondados ──────────────────────────────────────────────
function roundedPath(rawPts: { x: number; y: number }[], r = 11, insetFactor = 0.89): string {
  const cx = rawPts.reduce((s, p) => s + p.x, 0) / rawPts.length;
  const cy = rawPts.reduce((s, p) => s + p.y, 0) / rawPts.length;
  const pts = rawPts.map(p => ({
    x: cx + (p.x - cx) * insetFactor,
    y: cy + (p.y - cy) * insetFactor,
  }));
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const c = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const lp = Math.hypot(prev.x - c.x, prev.y - c.y);
    const ln = Math.hypot(next.x - c.x, next.y - c.y);
    const cap = Math.min(r, lp / 2.1, ln / 2.1);
    const sp = { x: c.x + (prev.x - c.x) / lp * cap, y: c.y + (prev.y - c.y) / lp * cap };
    const sn = { x: c.x + (next.x - c.x) / ln * cap, y: c.y + (next.y - c.y) / ln * cap };
    d += i === 0 ? `M${sp.x},${sp.y} ` : `L${sp.x},${sp.y} `;
    d += `Q${c.x},${c.y} ${sn.x},${sn.y} `;
  }
  return d + "Z";
}

// ── Cores — alto contraste ────────────────────────────────────────────────────
type BState = "idle" | "lit" | "tapped" | "correct" | "wrong";

// Tiles ociosos: faces claramente distintas
const IDLE: Record<Face, string> = {
  top:   "#D9EEF9",   // quase branco-azulado — face mais iluminada
  front: "#93C2DF",   // azul médio
  right: "#5E9DC0",   // azul mais escuro — face lateral mais profunda
};
// Estado ativo: DOURADO para máximo contraste contra qualquer azul
const ACTIVE: Record<Exclude<BState, "idle">, string> = {
  lit:     "#FFD600",  // amarelo-ouro vibrante
  tapped:  "#FFF59D",  // amarelo pálido (feedback de toque)
  correct: "#4CAF50",
  wrong:   "#EF5350",
};
function tileColor(st: BState, face: Face) {
  return st === "idle" ? IDLE[face] : ACTIVE[st];
}
function tileStroke(st: BState): string {
  if (st === "lit")     return "#E65100";
  if (st === "correct") return "#2E7D32";
  if (st === "wrong")   return "#C62828";
  return "none";
}
function strokeW(st: BState): number {
  return st === "idle" || st === "tapped" ? 0 : 2.5;
}

// ── Cubo SVG isométrico ────────────────────────────────────────────────────────
function IsoCube({
  states,
  interactive,
  onTile,
  size = 370,
}: {
  states: BState[];
  interactive: boolean;
  onTile: (i: number) => void;
  size?: number;
}) {
  // viewBox calibrado para U=78, OX=195, OY=185
  // cubo span: x 39-351, y 25-342  → viewBox "0 0 400 375"
  const vW = 400, vH = 375;
  const h = Math.round(size * vH / vW);
  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      width={size}
      height={h}
      style={{ display: "block", margin: "0 auto", touchAction: "manipulation" }}
    >
      <defs>
        {/* Glow dourado para tile aceso */}
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Corpo escuro do cubo (grade entre tiles) */}
      <polygon points={HEX} fill="#152236" />

      {/* 12 tiles */}
      {TILES.map((tile, i) => {
        const st = states[i] ?? "idle";
        const lit = st === "lit";
        return (
          <path
            key={i}
            d={roundedPath(tile.pts)}
            fill={tileColor(st, tile.face)}
            stroke={tileStroke(st)}
            strokeWidth={strokeW(st)}
            filter={lit ? "url(#glow-gold)" : undefined}
            style={{
              cursor: interactive ? "pointer" : "default",
              transition: "fill 0.15s ease",
            }}
            onPointerDown={interactive ? (e) => { e.preventDefault(); onTile(i); } : undefined}
          />
        );
      })}
    </svg>
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
const MAX_ROUNDS = 12;
const N_TILES    = 12;

function seqLen(d: number): number {
  if (d <= 1) return 2; if (d <= 3) return 3; if (d <= 5) return 4;
  if (d <= 6) return 5; if (d <= 7) return 6; if (d <= 8) return 7;
  if (d <= 9) return 8; return 9;
}
function flashMs(d: number): number { return d <= 3 ? 900 : d <= 6 ? 680 : 500; }

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
// Demo: um tile de cada face + um extra da frente
const DEMO_SEQ = [0, 5, 9, 3]; // frente-BL, direita-AF, topo-FR, frente-DR

function TutorialDemoWatch({ onDone }: { onDone: () => void }) {
  const [states, setStates] = useState<BState[]>(Array(N_TILES).fill("idle"));
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
        for (const idx of DEMO_SEQ) {
          if (cancelRef.current) return;
          setStates(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
          sndFlash();
          await sleep(900);
          setStates(Array(N_TILES).fill("idle"));
          await sleep(280);
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
      <IsoCube states={states} interactive={false} onTile={() => {}} size={270} />
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
        <span style={{ color: "#4CAF50", fontWeight: 600 }}>verde = certo</span>
        &nbsp;/&nbsp;
        <span style={{ color: "#EF5350", fontWeight: 600 }}>vermelho = errado</span>
      </p>
      <IsoCube states={states} interactive={!finished} onTile={handleTap} size={270} />
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
          instruction: "Um quadrado dourado acende de cada vez — no topo, na lateral esquerda ou na lateral direita do cubo. Memorize a sequência!",
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
  const markProgress = useExerciseProgress();

  const [phase, setPhase]      = useState<Phase>("tutorial");
  const [round, setRound]      = useState(0);
  const [sequence, setSeq]     = useState<number[]>([]);
  const [tileStates, setTS]    = useState<BState[]>(Array(N_TILES).fill("idle"));
  const [inputSoFar, setInput] = useState<number[]>([]);

  const correctRef = useRef(0);
  const errorsRef  = useRef(0);
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

  const startRound = useCallback(async (r: number) => {
    cancelRef.current = false;
    const seq = randSeq(seqLen(difficulty));
    setSeq(seq);
    setInput([]);
    setTS(Array(N_TILES).fill("idle"));
    setRound(r);
    setPhase("watch");

    const FLASH = flashMs(difficulty);

    try {
      await sleep(600);
      for (const idx of seq) {
        setTS(prev => prev.map((_, j) => j === idx ? "lit" : "idle"));
        sndFlash();
        await sleep(FLASH);
        setTS(Array(N_TILES).fill("idle"));
        await sleep(260);
      }
      setPhase("input");
      inputStartRef.current = Date.now();
    } catch { /* cancelado */ }
  }, [difficulty, sleep]);

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

    if (allOk) { correctRef.current++; setCorrect(correctRef.current); sndCorrect(); }
    else        { errorsRef.current++;  setErrors(errorsRef.current);   sndWrong(); }

    markProgress(Math.round((nr / MAX_ROUNDS) * 100));

    const t = setTimeout(() => {
      setTS(Array(N_TILES).fill("idle"));
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
      timersRef.current.push(setTimeout(() => startRound(nr), 500));
    }, 1800);
    timersRef.current.push(t);
  }, [difficulty, markProgress, onComplete, startRound]);

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
    return <CuboCorsiTutorial onDone={() => { startTsRef.current = Date.now(); startRound(0); }} />;
  }

  const resultOk = phase === "result" && inputSoFar.every((t, i) => t === sequence[i]);
  const label = phase === "watch"  ? "Observe a sequência..."
    : phase === "input"  ? `Toque os ${sequence.length} quadrados na ordem`
    : phase === "result" ? (resultOk ? "Correto! ✓" : "Veja onde errou")
    : "";
  const labelColor = phase === "result" ? (resultOk ? "#22C55E" : "#EF4444") : "#1D4ED8";

  const dotColor = (i: number) => {
    if (phase === "result" && i < inputSoFar.length)
      return inputSoFar[i] === sequence[i] ? "#4CAF50" : "#EF5350";
    return i < inputSoFar.length ? "#4AAED9" : "#D6EAF8";
  };

  return (
    <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "12px 16px 32px" }}>

        {/* Placar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: "0.03em" }}>
            ✓ {correct} &nbsp;&nbsp; ✗ {errors}
          </span>
        </div>

        {/* Barra de rodadas */}
        <div style={{ height: 5, borderRadius: 99, background: "#CBD5E1", marginBottom: 16, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: "#3B82F6",
            width: `${(round / MAX_ROUNDS) * 100}%`,
            transition: "width 0.5s ease",
          }} />
        </div>

        {/* Label */}
        <p style={{
          textAlign: "center", fontSize: 15, fontWeight: 700,
          color: labelColor, marginBottom: 10, minHeight: 22,
          transition: "color 0.25s",
        }}>{label}</p>

        {/* Legenda do resultado incorreto */}
        {phase === "result" && !resultOk && (
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, backgroundColor: "#4CAF50" }} />
              certo
            </span>
            <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, backgroundColor: "#EF5350" }} />
              errado
            </span>
          </div>
        )}

        {/* Cubo — 30% maior que o original */}
        <IsoCube
          states={tileStates}
          interactive={phase === "input"}
          onTile={handleTileTap}
          size={370}
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
          {difficulty >= 6 ? " · nível avançado" : ""}
        </p>

      </div>
    </div>
  );
}
