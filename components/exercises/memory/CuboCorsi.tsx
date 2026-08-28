"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
import type { ExerciseResult, Theme } from "@/types";

// ── Cubo 2×2×2 em CSS 3D real ──────────────────────────────
// 3 faces ativas (TOPO, ESQUERDA, DIREITA) com 4 células cada = 12 células
// visíveis e clicáveis. Quando uma peça acende, o cubo GIRA de forma fluida para
// trazer aquela face de frente. Na reprodução fica na vista isométrica estável.

type Face = "top" | "left" | "right";
type BState = "idle" | "lit" | "tapped" | "correct" | "review";

// Índices 0-11 → face do jogo (TOPO 0-3 · ESQUERDA 4-7 · DIREITA 8-11)
const FACE_OF: Face[] = ["top","top","top","top","left","left","left","left","right","right","right","right"];

// Três tons, como luz vindo de cima: o topo recebe, a frente fica no meio, a lateral
// direita fica na sombra. Antes os três eram quase o mesmo branco (#FCFEFF/#F7FBFF/#F2F8FD)
// e o cubo parecia chapado — ela comparou com o Cogmed em 28/ago/2026, onde a lateral é
// nitidamente mais azulada, e é isso que dá volume. Paleta clara dela, só com o degrau
// aprofundado; a peça acesa (#4F8FEA) segue contrastando com as três.
const IDLE: Record<Face, string> = {
  top:   "#FFFFFF",   // topo — recebe a luz
  left:  "#EDF4FC",   // frente — meia-luz
  right: "#D8E7F6",   // lateral — sombra (é ela que faz o cubo ter volume)
};
const ACTIVE: Record<Exclude<BState, "idle">, string> = {
  lit:     "#4F8FEA",   // luz ativa (paleta da Kamylla)
  tapped:  "#BBD4F7",
  correct: "#46C66A",
  // "era aqui" — a sequência certa mostrada depois de um erro. NÃO é vermelho de propósito
  // (pedido dela, 28/ago/2026, com o Cogmed como referência): errar não recebe carimbo, o
  // paciente só vê onde era e segue. Azul-petróleo, da mesma família do aceso, mais fundo.
  review:  "#2C6B84",
};
function cellColor(st: BState, face: Face) { return st === "idle" ? IDLE[face] : ACTIVE[st]; }
function cellStroke(st: BState): string {
  if (st === "lit")     return "#3B79D9";
  if (st === "correct") return "#2E9E4F";
  if (st === "review")  return "#1F5266";
  return "#82A9CF";     // bordas mais escuras (paleta da Kamylla)
}

// Duração da virada — rápida e fluida (sem truncar). CALIBRÁVEL.
const TURN_MS = 1100;

// Pose do cubo: traz a face acesa INTEIRAMENTE de frente para a tela (0° — o paciente
// vê a face acesa "chapada", de cara). ISO quando nada aceso.
// Geometria: ESQUERDA do jogo = face "front" (normal +Z → 0°); DIREITA = face "right"
// (normal +X → rotateY(-90°)); TOPO = face "top" (normal -Y → rotateX(-90°)).
// Virada de 55% do caminho até a frente. pose = ISO + 0.55·(frente − ISO).
//
// ERA 80% (escolha dela em julho) e ela mesma pediu a revisão em 28/ago/2026, vendo o
// resultado: a 80° o cubo ACHATA — vira uma placa fina, e o paciente perde a noção de
// proporção e de onde a peça está no espaço. Foi a comparação com o Cogmed que fechou a
// questão: lá o cubo nunca perde as três faces. A 55% a face acesa ainda fica em destaque,
// e o cubo continua legível como cubo. NÃO subir de volta sem falar com ela.
function cubePose(face: Face | null): string {
  switch (face) {
    case "top":   return "rotateX(-61deg) rotateY(-17deg)";
    case "left":  return "rotateX(-12deg) rotateY(-17deg)";
    case "right": return "rotateX(-12deg) rotateY(-67deg)";
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

export function IsoCube({
  states, interactive, onTile, size = 360, poseFace, pressedCell,
}: {
  states: BState[]; interactive: boolean; onTile: (i: number) => void; size?: number;
  poseFace?: Face | null;
  /** Célula exibida como pressionada por código; ausente não altera o treino. */
  pressedCell?: number;
}) {
  const litIdx = states.findIndex(s => s === "lit");
  const derivedFace: Face | null = litIdx >= 0 ? FACE_OF[litIdx] : null;
  const litFace: Face | null = poseFace !== undefined ? poseFace : derivedFace;
  const S = Math.round(size * 0.52);                 // cubo maior no mesmo espaço
  const gap = Math.max(3, Math.round(S * 0.032));    // bordas/estrutura mais finas
  const r = Math.round(S * 0.08);

  const renderFace = (name: string) => {
    const base = FACE_BASE[name];
    const active = base !== null;
    return (
      <div key={name} style={{
        position: "absolute", width: S, height: S, transform: faceCss(name, S / 2),
        display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
        gap, padding: gap, boxSizing: "border-box",
        // SEM borderRadius na face — de propósito (28/ago/2026). Com a face arredondada,
        // cada quina do cubo ficava com um vão, e por ele se via o vazio de dentro: o cubo
        // "ficava transparente" na virada (relato dela, com capturas). O arredondamento
        // vive nas CÉLULAS, que é onde ele sempre foi visual e nunca abriu buraco.
        background: "#9EBEDD", backfaceVisibility: "hidden",   // estrutura (paleta da Kamylla)
      }}>
        {[0,1,2,3].map(i => {
          if (!active) return <div key={i} style={{ borderRadius: r, background: "#EAF2FA" }} />;
          const idx = (base as number) + i;
          const st = pressedCell === idx ? "tapped" : (states[idx] ?? "idle");
          const fc = FACE_COLOR[name];
          return (
            <div key={i}
              data-cell={idx}
              onPointerDown={interactive ? (e) => { e.preventDefault(); onTile(idx); } : undefined}
              style={{
                borderRadius: r,
                background: cellColor(st, fc),
                border: `1px solid ${cellStroke(st)}`,
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
      width: size, height: size, maxWidth: "100%", margin: "0 auto", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: size * 1.9, touchAction: "manipulation",
    }}>
      {/* Sombra no CHÃO (elemento separado — NUNCA usar filter/drop-shadow no elemento
          3D: filter ACHATA o preserve-3d e o cubo vira uma placa). */}
      <div aria-hidden style={{
        position: "absolute", left: "50%", bottom: Math.round(size * 0.05), transform: "translateX(-50%)",
        width: S * 1.6, height: S * 0.3, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.0) 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        width: S, height: S, position: "relative", transformStyle: "preserve-3d",
        transform: cubePose(litFace),
        // Virada fluida (TURN_MS), ease-in-out simétrico (sem overshoot/quique):
        // acelera progressivamente no início e desacelera no final (estilo smoothstep).
        transition: `transform ${TURN_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
      }}>
        {["back","bottom","leftbk","right","front","top"].map(renderFace)}
      </div>
    </div>
  );
}

export const CUBO_CORSI_CELL_COUNT = 12;

export function CuboCorsiBoard({
  activeCell,
  selectedCells,
  pressedCell,
  interactive,
  onCellClick,
}: {
  activeCell?: number;
  selectedCells: number[];
  /** Célula exibida como pressionada por código; ausente não altera o treino. */
  pressedCell?: number;
  interactive: boolean;
  onCellClick: (idx: number) => void;
}) {
  const states: BState[] = Array(CUBO_CORSI_CELL_COUNT).fill("idle");
  selectedCells.forEach((idx) => { states[idx] = "tapped"; });
  if (activeCell !== undefined) states[activeCell] = "lit";

  return (
    <IsoCube
      states={states}
      interactive={interactive}
      onTile={onCellClick}
      pressedCell={pressedCell}
      size={420}
    />
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
const N_TILES    = CUBO_CORSI_CELL_COUNT;

export const CUBO_CORSI_MIN_DIFFICULTY = 1;
export function cuboCorsiSequenceLength(d: number): number {
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

// ── Componente principal ──────────────────────────────────────────────────────
interface Props { difficulty: number; theme: Theme; onComplete: (r: ExerciseResult) => void; }
type Phase = "watch" | "input" | "result" | "between";

export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
  // Barra por TEMPO ATIVO (pausa quando o paciente não interage) — hook padrão.
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(TARGET_MS);

  const [phase, setPhase]      = useState<Phase>("watch");
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

  // Dificuldade adaptativa intra-sessão — motor POR TENTATIVA (épico Cogmed):
  // correta → +1 já na próxima; erro leve (só o último toque errado ou troca de
  // dois vizinhos) → mantém; erro grave → −1. Treina na borda da capacidade.
  const curDiffRef  = useRef(difficulty);
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
    const seq = randSeq(cuboCorsiSequenceLength(d));
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
    const verdict = classifyTrial(seq, userInput);
    const allOk = verdict === "correta";
    const nr = r + 1;

    // COMO O ERRO APARECE (regra dela, 28/ago/2026): sem carimbo no que o paciente errou.
    // Acertou tudo → a sequência inteira em verde. Errou → a sequência CERTA aparece em
    // "review" ("era aqui"), e o toque errado não é marcado de forma nenhuma. O paciente vê
    // onde era e segue para a próxima — que é como o Cogmed faz.
    const rs: BState[] = Array(N_TILES).fill("idle");
    for (const exp of seq) rs[exp] = allOk ? "correct" : "review";
    setTS(rs);
    setPhase("result");
    rtsRef.current.push((Date.now() - inputStartRef.current) / seq.length);

    // Motor por tentativa: correta sobe 1; erro leve mantém; erro grave desce 1.
    if (allOk) { correctRef.current++; sndCorrect(); } else { errorsRef.current++; sndWrong(); }
    curDiffRef.current = nextLevelPerTrial(curDiffRef.current, verdict, 1, 10);
    maxDiffRef.current = Math.max(maxDiffRef.current, curDiffRef.current);

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

  useEffect(() => {
    begin();
    void startRound(0);
    return () => clearAll();
  // O treino começa ao ser montado pelo ExerciseWrapper, após o tutorial compartilhado.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultOk = phase === "result" && inputSoFar.every((t, i) => t === sequence[i]);
  const label = phase === "watch"  ? "Observe a sequência..."
    : phase === "input"  ? `Toque os ${sequence.length} quadrados na ordem`
    // Errar não recebe anúncio (regra dela, 28/ago/2026): o paciente vê a sequência certa
    // reaparecer e segue. "Veja onde errou" e o vermelho saíram daqui de propósito.
    : phase === "result" ? (resultOk ? "Correto! ✓" : "Era esta a sequência")
    : "";
  const labelColor = phase === "result" ? (resultOk ? "#22C55E" : "#2C6B84") : "#1D4ED8";

  // Os pontinhos também não carimbam erro: acertou tudo → verde; errou → o tom de revisão,
  // o mesmo do cubo. Nunca vermelho posição a posição.
  const dotColor = (i: number) => {
    if (phase === "result") return resultOk ? "#46C66A" : "#2C6B84";
    return i < inputSoFar.length ? "#4AAED9" : "#D6EAF8";
  };

  return (
    <ExerciseStage width="medio" background="#F4F7FB">
      <div style={{ padding: "18px 14px 32px" }}>

        {/* Barra de progresso (tempo ativo) */}
        <ExerciseProgressBar progressPct={progressPct} />

        {/* Label */}
        <p style={{
          textAlign: "center", fontSize: 15, fontWeight: 700,
          color: labelColor, marginBottom: 8, minHeight: 22,
          transition: "color 0.25s",
        }}>{label}</p>

        {/* Cubo 3D — gira para apresentar de frente a face da peça que acende */}
        <IsoCube
          states={tileStates}
          interactive={phase === "input"}
          onTile={handleTileTap}
          poseFace={poseFace}
          size={540}
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
    </ExerciseStage>
  );
}
