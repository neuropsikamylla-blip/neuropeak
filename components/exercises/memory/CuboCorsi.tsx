"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

// ── Geometria isométrica 2D ────────────────────────────────────────────────────
// Cubo 2×2×2 desenhado como SVG isométrico clássico. SOMENTE as 3 faces visíveis
// são renderizadas: TOPO + lateral ESQUERDA + lateral DIREITA (12 tiles no total).
// Não existem tiles de baixo, de trás ou escondidos — logo é impossível acender
// uma peça que o paciente não consiga ver ou clicar.

const S  = 70;                       // unidade do cubo (px no viewBox)
const OX = 160;                      // origem x (vértice frontal superior)
const OY = 150;                      // origem y
const HX = S * Math.sqrt(3) / 2;     // meia-largura isométrica horizontal
const HY = S / 2;                    // meia-altura isométrica vertical
// viewBox: "0 0 320 300"

// Projeções das três faces. Cada uma recebe coordenadas locais 0..2 × 0..2.
const top   = (u: number, v: number) => ({ x: OX + HX * (v - u), y: OY - HY * (u + v) });
const left  = (d: number, h: number) => ({ x: OX - HX * d,        y: OY - HY * d + S * h });
const right = (d: number, h: number) => ({ x: OX + HX * d,        y: OY - HY * d + S * h });

type Face = "top" | "left" | "right";
interface TileDef { pts: { x: number; y: number }[]; face: Face }

// Gera as 4 células 2×2 de uma face a partir da sua função de projeção.
function faceTiles(proj: (a: number, b: number) => { x: number; y: number }, face: Face): TileDef[] {
  const out: TileDef[] = [];
  for (let b = 0; b < 2; b++) {
    for (let a = 0; a < 2; a++) {
      out.push({
        face,
        pts: [proj(a, b), proj(a + 1, b), proj(a + 1, b + 1), proj(a, b + 1)],
      });
    }
  }
  return out;
}

// Índices: TOPO 0-3 · ESQUERDA 4-7 · DIREITA 8-11
const TILES: TileDef[] = [
  ...faceTiles(top,   "top"),
  ...faceTiles(left,  "left"),
  ...faceTiles(right, "right"),
];

// Silhueta hexagonal (corpo do cubo, atrás dos tiles → vira a grade clara)
const HEX = [top(2, 2), right(2, 0), right(2, 2), right(0, 2), left(2, 2), left(2, 0)]
  .map(p => `${p.x},${p.y}`).join(" ");

// ── Path com cantos arredondados + inset (cria a grade entre tiles) ─────────────
function roundedPath(rawPts: { x: number; y: number }[], r = 13, insetFactor = 0.92): string {
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

// ── Cores — cubo CLARO, sem lateral escura pesada ───────────────────────────────
type BState = "idle" | "lit" | "tapped" | "correct" | "wrong";

// Faces ociosas: quase brancas (modelo). Sombreamento mínimo só para dar volume;
// a profundidade 3D vem das sombras suaves (drop-shadow) sob cada tile.
const IDLE: Record<Face, string> = {
  top:   "#FDFEFF",   // topo — branco
  left:  "#E8F2FA",   // lateral esquerda — branco-azulado bem claro
  right: "#DAE9F5",   // lateral direita — levemente mais sombreada
};
// Estado ativo: AZUL CIANO vibrante (igual ao modelo)
const ACTIVE: Record<Exclude<BState, "idle">, string> = {
  lit:     "#46BEEA",  // azul ciano vibrante
  tapped:  "#B7E4F5",  // ciano claro (feedback de toque)
  correct: "#46C66A",
  wrong:   "#F26257",
};
function tileColor(st: BState, face: Face) {
  return st === "idle" ? IDLE[face] : ACTIVE[st];
}
function tileStroke(st: BState): string {
  if (st === "lit")     return "#1F97C9";
  if (st === "correct") return "#2E9E4F";
  if (st === "wrong")   return "#C73B30";
  return "#CBDBEA";          // contorno bem sutil entre tiles ociosos
}
function strokeW(st: BState): number {
  if (st === "lit" || st === "correct" || st === "wrong") return 2.5;
  return 0.8;                // linha fina de grade nos tiles ociosos
}

// Inclinação que FAVORECE a peça ativa: o cubo se vira de leve para apresentar a
// face que está acesa. Aplicada só na apresentação (um tile "lit" por vez);
// na reprodução fica neutro/estável para o paciente clicar com precisão.
// (a perspectiva vem do wrapper; aqui só as rotações)
function tiltFor(face: Face | null): string {
  if (face === "top")   return "rotateX(-10deg)";   // apresenta o topo
  if (face === "left")  return "rotateY(13deg)";    // destaca a esquerda
  if (face === "right") return "rotateY(-13deg)";   // destaca a direita
  return "none";
}

// ── Cubo SVG isométrico ────────────────────────────────────────────────────────
function IsoCube({
  states,
  interactive,
  onTile,
  size = 500,
}: {
  states: BState[];
  interactive: boolean;
  onTile: (i: number) => void;
  size?: number;
}) {
  const vW = 320, vH = 300;
  const litIdx = states.findIndex(s => s === "lit");
  const tiltFace: Face | null = litIdx >= 0 ? TILES[litIdx].face : null;

  return (
    <div style={{ perspective: 1100, width: size, maxWidth: "100%", margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${vW} ${vH}`}
        width="100%"
        style={{
          display: "block",
          touchAction: "manipulation",
          transform: tiltFor(tiltFace),
          transformOrigin: "50% 52%",
          transition: "transform 0.45s cubic-bezier(.22,.61,.36,1)",
        }}
      >
        <defs>
          {/* Sombra suave sob cada tile → efeito de peças flutuantes (modelo) */}
          <filter id="tile-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="3" floodColor="#2A4A70" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Corpo do cubo (grade clara nas junções entre tiles) */}
        <polygon points={HEX} fill="#D2E0EE" stroke="#B6C8DC" strokeWidth={1.5} strokeLinejoin="round" />

        {/* 12 tiles — todos em faces visíveis; sombra no grupo dá profundidade */}
        <g filter="url(#tile-shadow)">
          {TILES.map((tile, i) => {
            const st = states[i] ?? "idle";
            return (
              <path
                key={i}
                d={roundedPath(tile.pts)}
                fill={tileColor(st, tile.face)}
                stroke={tileStroke(st)}
                strokeWidth={strokeW(st)}
                strokeLinejoin="round"
                style={{
                  cursor: interactive ? "pointer" : "default",
                  transition: "fill 0.15s ease",
                }}
                onPointerDown={interactive ? (e) => { e.preventDefault(); onTile(i); } : undefined}
              />
            );
          })}
        </g>
      </svg>
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
// Demo: uma peça de cada face (topo, esquerda, direita) + uma extra do topo.
const DEMO_SEQ = [0, 4, 8, 3]; // topo · esquerda · direita · topo

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
          await sleep(950);
          setStates(Array(N_TILES).fill("idle"));
          await sleep(320);
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
      <IsoCube states={states} interactive={false} onTile={() => {}} size={300} />
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
        await sleep(300);   // pausa entre flashes (cubo volta ao neutro)
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
      return inputSoFar[i] === sequence[i] ? "#46C66A" : "#F26257";
    return i < inputSoFar.length ? "#4AAED9" : "#D6EAF8";
  };

  return (
    <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "12px 14px 32px" }}>

        {/* Placar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: "0.03em" }}>
            ✓ {correct} &nbsp;&nbsp; ✗ {errors}
          </span>
        </div>

        {/* Barra de rodadas */}
        <div style={{ height: 5, borderRadius: 99, background: "#CBD5E1", marginBottom: 14, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: "#3B82F6",
            width: `${(round / MAX_ROUNDS) * 100}%`,
            transition: "width 0.5s ease",
          }} />
        </div>

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

        {/* Cubo — claro, maior e com inclinação que favorece a peça ativa */}
        <IsoCube
          states={tileStates}
          interactive={phase === "input"}
          onTile={handleTileTap}
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
          {difficulty >= 6 ? " · nível avançado" : ""}
        </p>

      </div>
    </div>
  );
}
