"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface DualTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Progressão de níveis (1-10) ──────────────────────────────────────────────
// Cada nível define: regra da tarefa superior, N-back da inferior, velocidades,
// e se há distratores de outras formas/cores verdes.
type TopRule = "any-green" | "green-circle" | "block-alt";
type ShapeKind = "circle" | "square" | "triangle";

interface LevelSpec {
  topRule: TopRule;
  nback: 1 | 2;
  shapeMs: number;   // tempo que a forma fica na tela
  digitMs: number;   // ritmo dos dígitos
  shapes: boolean;   // usa formas variadas (não só círculo)
  greenLures: boolean; // gera formas verdes NÃO-alvo (distratores fortes)
  speedLabel: "lenta" | "moderada" | "rápida";
}

// Tempos generosos: a forma fica visível tempo suficiente para reagir mesmo
// na dupla tarefa (lenta ~2,6s · moderada ~2,1s · rápida ~1,7s).
const LEVELS: Record<number, LevelSpec> = {
  1:  { topRule: "any-green",    nback: 1, shapeMs: 2600, digitMs: 2600, shapes: false, greenLures: false, speedLabel: "lenta" },
  2:  { topRule: "any-green",    nback: 1, shapeMs: 2100, digitMs: 2200, shapes: false, greenLures: false, speedLabel: "moderada" },
  3:  { topRule: "any-green",    nback: 1, shapeMs: 1700, digitMs: 1900, shapes: false, greenLures: false, speedLabel: "rápida" },
  4:  { topRule: "green-circle", nback: 1, shapeMs: 2100, digitMs: 2200, shapes: true,  greenLures: true,  speedLabel: "moderada" },
  5:  { topRule: "green-circle", nback: 1, shapeMs: 1700, digitMs: 1900, shapes: true,  greenLures: true,  speedLabel: "rápida" },
  6:  { topRule: "green-circle", nback: 2, shapeMs: 2600, digitMs: 2600, shapes: true,  greenLures: true,  speedLabel: "lenta" },
  7:  { topRule: "green-circle", nback: 2, shapeMs: 2100, digitMs: 2200, shapes: true,  greenLures: true,  speedLabel: "moderada" },
  8:  { topRule: "block-alt",    nback: 2, shapeMs: 2100, digitMs: 2200, shapes: true,  greenLures: true,  speedLabel: "moderada" },
  9:  { topRule: "block-alt",    nback: 2, shapeMs: 1700, digitMs: 1900, shapes: true,  greenLures: true,  speedLabel: "rápida" },
  10: { topRule: "block-alt",    nback: 2, shapeMs: 1550, digitMs: 1750, shapes: true,  greenLures: true,  speedLabel: "rápida" },
};
const levelOf = (d: number): LevelSpec => LEVELS[Math.min(10, Math.max(1, Math.round(d)))];

const TOTAL_SHAPES = 320;  // longo o bastante p/ durar ~7 min em qualquer nível
const BLOCK_SIZE = 10; // para a regra alternante (block-alt)
const COLORS = ["green", "red", "blue", "yellow", "orange"] as const;
type ShapeColor = (typeof COLORS)[number];

const COLOR_HEX: Record<ShapeColor, string> = {
  green: "#22c55e", red: "#ef4444", blue: "#3b82f6", yellow: "#eab308", orange: "#f97316",
};

interface ShapeTrial {
  color: ShapeColor;
  kind: ShapeKind;
  isTarget: boolean;
}
interface ShapeResult { isTarget: boolean; tapped: boolean; rt: number | null; }
interface DigitResult { isMatch: boolean; tapped: boolean; rt: number | null; }

// Alvo do "bloco" para a regra alternante: bloco par = círculo verde; ímpar = quadrado azul.
function blockTarget(idx: number): { color: ShapeColor; kind: ShapeKind } {
  const even = Math.floor(idx / BLOCK_SIZE) % 2 === 0;
  return even ? { color: "green", kind: "circle" } : { color: "blue", kind: "square" };
}

function isTargetFor(spec: LevelSpec, idx: number, color: ShapeColor, kind: ShapeKind): boolean {
  if (spec.topRule === "any-green") return color === "green";
  if (spec.topRule === "green-circle") return color === "green" && kind === "circle";
  const bt = blockTarget(idx);
  return color === bt.color && kind === bt.kind;
}

function buildShapeSequence(spec: LevelSpec, length: number): ShapeTrial[] {
  const kinds: ShapeKind[] = spec.shapes ? ["circle", "square", "triangle"] : ["circle"];
  const nonGreen = COLORS.filter((c) => c !== "green");
  const result: ShapeTrial[] = [];
  let consecutiveNonTarget = 0;

  for (let i = 0; i < length; i++) {
    const forceTarget = consecutiveNonTarget >= 3;
    const makeTarget = forceTarget || Math.random() < 0.34;

    let color: ShapeColor, kind: ShapeKind;
    if (makeTarget) {
      if (spec.topRule === "any-green") { color = "green"; kind = kinds[Math.floor(Math.random() * kinds.length)]; }
      else if (spec.topRule === "green-circle") { color = "green"; kind = "circle"; }
      else { const bt = blockTarget(i); color = bt.color; kind = bt.kind; }
    } else {
      // distrator que NÃO é alvo no índice i
      let tries = 0;
      do {
        if (spec.greenLures && Math.random() < 0.35) {
          // forma verde não-alvo (ex.: quadrado/triângulo verde) — distrator forte
          color = "green";
          kind = kinds.filter((k) => k !== "circle")[Math.floor(Math.random() * Math.max(1, kinds.length - 1))] ?? "square";
        } else {
          color = nonGreen[Math.floor(Math.random() * nonGreen.length)];
          kind = kinds[Math.floor(Math.random() * kinds.length)];
        }
      } while (isTargetFor(spec, i, color, kind) && tries++ < 8);
    }
    const isTarget = isTargetFor(spec, i, color, kind);
    result.push({ color, kind, isTarget });
    consecutiveNonTarget = isTarget ? 0 : consecutiveNonTarget + 1;
  }
  return result;
}

function buildDigitSequence(length: number, nback: 1 | 2): number[] {
  const digits: number[] = [];
  let sinceMatch = 0;
  for (let i = 0; i < length; i++) {
    const canMatch = i >= nback;
    const force = canMatch && sinceMatch >= 3; // evita trechos longos sem nenhum "igual"
    if (canMatch && (force || Math.random() < 0.40)) {
      digits.push(digits[i - nback]); // cria um IGUAL no n-back atual
      sinceMatch = 0;
    } else {
      let d: number;
      do { d = Math.floor(Math.random() * 9) + 1; } while (canMatch && d === digits[i - nback]);
      digits.push(d);
      if (canMatch) sinceMatch++;
    }
  }
  return digits;
}

function ruleText(spec: LevelSpec, idx: number): { top: string; bottom: string } {
  let top: string;
  if (spec.topRule === "any-green") top = "Toque nas formas VERDES.";
  else if (spec.topRule === "green-circle") top = "Toque apenas no CÍRCULO verde (ignore outras formas/cores).";
  else {
    const bt = blockTarget(idx);
    top = bt.color === "green" ? "Bloco atual: toque no CÍRCULO VERDE." : "Bloco atual: toque no QUADRADO AZUL.";
  }
  const bottom = spec.nback === 1
    ? "Toque IGUAL quando o número for igual ao ANTERIOR."
    : "Toque IGUAL quando o número for igual ao de DUAS posições atrás.";
  return { top, bottom };
}

// ── Render de forma (círculo / quadrado / triângulo) ─────────────────────────
function ShapeSvg({ color, kind, size = 90 }: { color: ShapeColor; kind: ShapeKind; size?: number }) {
  const fill = COLOR_HEX[color];
  const c = size / 2, r = size * 0.42;
  if (kind === "circle")
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={c} cy={c} r={r} fill={fill} stroke="white" strokeWidth={3} /></svg>;
  if (kind === "square")
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><rect x={size*0.12} y={size*0.12} width={size*0.76} height={size*0.76} rx={size*0.1} fill={fill} stroke="white" strokeWidth={3} /></svg>;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><polygon points={`${c},${size*0.1} ${size*0.9},${size*0.88} ${size*0.1},${size*0.88}`} fill={fill} stroke="white" strokeWidth={3} strokeLinejoin="round" /></svg>;
}

// ── Tutorial ──────────────────────────────────────────────────────────────
function DualTaskTutorial({ theme, spec, onDone }: { theme: Theme; spec: LevelSpec; onDone: () => void }) {
  const rules = ruleText(spec, 0);
  const steps = [
    { instruction: `SUPERIOR: ${rules.top}`, content: (done: () => void) => <TutShape theme={theme} spec={spec} onDone={done} /> },
    { instruction: `INFERIOR: ${rules.bottom}`, content: (done: () => void) => <TutDigit theme={theme} spec={spec} onDone={done} /> },
  ];
  return <TutorialBase theme={theme} title="Dupla Tarefa" steps={steps} onDone={onDone} />;
}
function TutShape({ theme, spec, onDone }: { theme: Theme; spec: LevelSpec; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const targetKind: ShapeKind = spec.topRule === "any-green" ? "circle" : spec.topRule === "block-alt" ? "circle" : "circle";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-center gap-1"><ShapeSvg color="green" kind={targetKind} size={56} /><span className="text-xs font-bold text-green-600">← TOQUE</span></div>
        {spec.greenLures && <div className="flex flex-col items-center gap-1"><ShapeSvg color="green" kind="square" size={56} /><span className={`text-xs ${sub}`}>Ignore</span></div>}
        <div className="flex flex-col items-center gap-1"><ShapeSvg color="red" kind={spec.shapes ? "triangle" : "circle"} size={56} /><span className={`text-xs ${sub}`}>Ignore</span></div>
      </div>
      <p className={`text-xs text-center ${sub}`}>{ruleText(spec, 0).top}</p>
    </div>
  );
}
function TutDigit({ theme, spec, onDone }: { theme: Theme; spec: LevelSpec; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-3">
      <p className={`text-xs text-center font-semibold ${theme === "GAMIFIED" ? "text-white" : "text-gray-800"}`}>
        {spec.nback === 1 ? "N-back 1" : "N-back 2"}
      </p>
      <p className={`text-xs text-center ${sub}`}>{ruleText(spec, 0).bottom}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
  const spec = levelOf(difficulty);
  const nback = spec.nback;
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [shapes] = useState<ShapeTrial[]>(() => buildShapeSequence(spec, TOTAL_SHAPES));
  const [digitSeq] = useState<number[]>(() => buildDigitSequence(900, nback));

  const [shapeIdx, setShapeIdx] = useState(-1);
  const [shapeFeedback, setShapeFeedback] = useState<"hit" | "fa" | "miss" | null>(null);
  const [shapePhase, setShapePhase] = useState<"isi" | "show">("isi");

  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [refDigit, setRefDigit] = useState<number | null>(null); // dígito de referência (n atrás)
  const [digitFeedback, setDigitFeedback] = useState<"hit" | "fa" | null>(null);
  const [equalPressed, setEqualPressed] = useState(false);
  const [digitKey, setDigitKey] = useState(0);

  const shapeResults = useRef<ShapeResult[]>([]);
  const digitResults = useRef<DigitResult[]>([]);
  const shapeRespondedRef = useRef(false);
  const digitRespondedRef = useRef(false);
  const startTime = useRef(Date.now());
  const shapeShownAt = useRef(0);
  const digitShownAt = useRef(0);
  const shapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const digitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allDoneRef = useRef(false);

  const shapeIdxRef = useRef(0);
  const shapePhaseRef = useRef<"isi" | "show">("isi");
  const advanceShapeRef = useRef<(() => void) | null>(null);
  const digitIdxRef = useRef(0);
  const digitWindowRef = useRef<number[]>([]); // últimos dígitos (para n-back)

  const finishSession = useCallback(() => {
    if (allDoneRef.current) return;
    allDoneRef.current = true;
    finish();
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    if (digitTimerRef.current) clearTimeout(digitTimerRef.current);

    const sRes = shapeResults.current;
    const dRes = digitResults.current;

    // Tarefa superior
    const topTargets = sRes.filter((r) => r.isTarget);
    const hitsTop = topTargets.filter((r) => r.tapped).length;
    const fpTop = sRes.filter((r) => !r.isTarget && r.tapped).length;     // falsos positivos
    const omTop = topTargets.filter((r) => !r.tapped).length;             // omissões
    const accTop = topTargets.length > 0 ? hitsTop / topTargets.length : 0;

    // Tarefa inferior
    const botMatches = dRes.filter((r) => r.isMatch);
    const hitsBot = botMatches.filter((r) => r.tapped).length;
    const fpBot = dRes.filter((r) => !r.isMatch && r.tapped).length;
    const omBot = botMatches.filter((r) => !r.tapped).length;
    const accBot = botMatches.length > 0 ? hitsBot / botMatches.length : 0;

    const accTotal = (accTop + accBot) / 2;
    const rts = [...sRes, ...dRes].map((r) => r.rt).filter((v): v is number => v != null && v > 0);
    const meanRT = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
    const duration = elapsedSec();
    const score = calculateExerciseScore("dual-task", accTotal, meanRT ?? undefined, difficulty);

    onComplete({
      exerciseId: "dual-task",
      domain: "attention",
      score,
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty,
      duration,
      metadata: {
        level: spec === LEVELS[difficulty] ? difficulty : Math.round(difficulty),
        startedLevel: Math.round(difficulty),
        nback,
        // métricas para a progressão clínica (lidas no servidor)
        accTop: Number(accTop.toFixed(3)),
        accBottom: Number(accBot.toFixed(3)),
        accTotal: Number(accTotal.toFixed(3)),
        hitsTop, fpTop, omTop,
        hitsBottom: hitsBot, fpBottom: fpBot, omBottom: omBot,
        meanReactionTimeMs: meanRT,
        // resumo legível
        acc_A: Math.round(accTop * 100), acc_B: Math.round(accBot * 100),
      },
    });
  }, [difficulty, nback, spec, onComplete, finish, elapsedSec]);

  // Loop da tarefa visual
  useEffect(() => {
    if (showTutorial) return;
    function scheduleNextShape() {
      if (allDoneRef.current) return;
      const idx = shapeIdxRef.current;
      if (isTimeUp() || idx >= TOTAL_SHAPES) { finishSession(); return; }
      shapePhaseRef.current = "show";
      setShapeIdx(idx);
      setShapePhase("show");
      shapeRespondedRef.current = false;
      setShapeFeedback(null);
      shapeShownAt.current = Date.now();

      shapeTimerRef.current = setTimeout(() => {
        if (allDoneRef.current) return;
        const trial = shapes[idx];
        if (!shapeRespondedRef.current) {
          shapeResults.current.push({ isTarget: trial.isTarget, tapped: false, rt: null });
          if (trial.isTarget) setShapeFeedback("miss");
        }
        shapeIdxRef.current++;
        shapePhaseRef.current = "isi";
        setShapePhase("isi");
        shapeTimerRef.current = setTimeout(scheduleNextShape, 300);
      }, spec.shapeMs);
    }
    advanceShapeRef.current = scheduleNextShape;
    shapeTimerRef.current = setTimeout(scheduleNextShape, 500);
    return () => { if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  // Loop da tarefa numérica (n-back)
  useEffect(() => {
    if (showTutorial) return;
    function scheduleNextDigit() {
      if (allDoneRef.current) return;
      const idx = digitIdxRef.current;
      if (idx >= digitSeq.length) return;

      const d = digitSeq[idx];
      const ref = idx >= nback ? digitSeq[idx - nback] : null;
      digitWindowRef.current.push(d);
      setCurrentDigit(d);
      setRefDigit(ref);
      setDigitKey((k) => k + 1);
      digitRespondedRef.current = false;
      setEqualPressed(false);
      setDigitFeedback(null);
      digitShownAt.current = Date.now();
      digitIdxRef.current++;

      const isMatch = ref !== null && d === ref;
      digitTimerRef.current = setTimeout(() => {
        if (allDoneRef.current) return;
        if (!digitRespondedRef.current) digitResults.current.push({ isMatch, tapped: false, rt: null });
        digitTimerRef.current = setTimeout(scheduleNextDigit, 150);
      }, spec.digitMs);
    }
    const t = setTimeout(scheduleNextDigit, 700);
    return () => { clearTimeout(t); if (digitTimerRef.current) clearTimeout(digitTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  function handleShapeTap() {
    if (shapePhaseRef.current !== "show" || shapeRespondedRef.current || allDoneRef.current) return;
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    shapeRespondedRef.current = true;
    const idx = shapeIdxRef.current;
    const trial = shapes[idx];
    if (!trial) return;
    const isHit = trial.isTarget;
    shapeResults.current.push({ isTarget: trial.isTarget, tapped: true, rt: Date.now() - shapeShownAt.current });
    setShapeFeedback(isHit ? "hit" : "fa");
    shapeTimerRef.current = setTimeout(() => {
      shapeIdxRef.current++;
      shapePhaseRef.current = "isi";
      setShapePhase("isi");
      shapeTimerRef.current = setTimeout(() => { if (advanceShapeRef.current) advanceShapeRef.current(); }, 300);
    }, 400);
  }

  function handleEqualTap() {
    if (equalPressed || allDoneRef.current) return;
    const win = digitWindowRef.current;
    const cur = win[win.length - 1];
    const ref = win.length > nback ? win[win.length - 1 - nback] : undefined;
    const isMatch = ref !== undefined && cur === ref;
    setEqualPressed(true);
    digitRespondedRef.current = true;
    digitResults.current.push({ isMatch, tapped: true, rt: Date.now() - digitShownAt.current });
    setDigitFeedback(isMatch ? "hit" : "fa");
    setTimeout(() => setDigitFeedback(null), 400);
  }

  if (showTutorial) {
    return <DualTaskTutorial theme={theme} spec={spec}
      onDone={() => { startTime.current = Date.now(); begin(); setShowTutorial(false); }} />;
  }

  const currentShape = shapeIdx >= 0 && shapeIdx < TOTAL_SHAPES ? shapes[shapeIdx] : null;
  const rules = ruleText(spec, shapeIdx >= 0 ? shapeIdx : 0);
  const displayState =
    shapeFeedback === "hit" ? "fb-hit" : shapeFeedback === "fa" ? "fb-fa" : shapeFeedback === "miss" ? "fb-miss" :
    (shapePhase === "show" && currentShape !== null) ? "shape" : "idle";

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-fuchsia-50 to-pink-50" : "bg-slate-50",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-fuchsia-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    rule: theme === "GAMIFIED" ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-slate-200 text-slate-700 shadow-sm",
    panelA: theme === "GAMIFIED" ? "bg-gray-800 border border-gray-700" : "bg-white border border-slate-200 shadow",
    panelB: theme === "GAMIFIED" ? "bg-gray-800 border border-gray-700" : "bg-slate-50 border border-slate-200 shadow",
    hit: theme === "GAMIFIED" ? "text-green-400" : "text-green-600",
    fa: theme === "GAMIFIED" ? "text-red-400" : "text-red-500",
    digitBox: theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-white border-2 border-gray-200",
    digitText: theme === "GAMIFIED" ? "text-white" : "text-gray-900",
    eqBtn: theme === "GAMIFIED" ? "bg-blue-700 text-white active:bg-blue-600" : "bg-blue-500 text-white active:bg-blue-600",
  };

  const shapeHits = shapeResults.current.filter((r) => r.isTarget && r.tapped).length;
  const digitHits = digitResults.current.filter((r) => r.isMatch && r.tapped).length;

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className={`font-bold text-sm ${pal.title}`}>🧠 Dupla Tarefa</h2>
          <div className={`text-xs ${pal.sub}`}>Nível {Math.round(difficulty)}</div>
        </div>
        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* Regra ativa — sempre visível */}
        <div className={`rounded-xl px-3 py-2 text-[11px] leading-snug ${pal.rule}`}>
          <p>🔼 <b>Em cima:</b> {rules.top}</p>
          <p className="mt-0.5">🔽 <b>Embaixo:</b> {rules.bottom} <span className="opacity-60">(velocidade {spec.speedLabel})</span></p>
        </div>

        {/* Panel A — tarefa visual */}
        <div className={`rounded-2xl p-4 ${pal.panelA}`} style={{ minHeight: 250 }}>
          <div className="flex justify-between items-center mb-2">
            <p className={`text-xs font-bold ${pal.title}`}>SUPERIOR</p>
            <div className="flex gap-3 text-xs">
              <span className={pal.hit}>✓ {shapeHits}</span>
              <span className={pal.fa}>✗ {shapeResults.current.filter((r) => !r.isTarget && r.tapped).length}</span>
            </div>
          </div>
          <div
            className={`w-full flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-all ${
              displayState === "fb-hit" ? "border-green-500 bg-green-500/10" :
              displayState === "fb-fa" ? "border-red-500 bg-red-500/10" :
              displayState === "fb-miss" ? "border-amber-500 bg-amber-500/10" :
              theme === "GAMIFIED" ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-slate-50"
            }`}
            style={{ height: 190 }} onPointerDown={handleShapeTap}>
            <AnimatePresence mode="wait">
              {displayState === "shape" && currentShape && (
                <motion.div key={`shape-${shapeIdx}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                  <ShapeSvg color={currentShape.color} kind={currentShape.kind} size={128} />
                </motion.div>
              )}
              {displayState.startsWith("fb-") && (
                <motion.span key={displayState} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-5xl">
                  {displayState === "fb-hit" ? "✅" : displayState === "fb-fa" ? "❌" : "⏱️"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel B — tarefa numérica n-back */}
        <div className={`rounded-2xl p-4 ${pal.panelB}`}>
          <div className="flex justify-between items-center mb-3">
            <p className={`text-xs font-bold ${pal.title}`}>INFERIOR — N-back {nback} (Igual?)</p>
            <span className={`text-xs ${pal.hit}`}>✓ {digitHits}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[10px] ${pal.sub}`}>{nback === 1 ? "Anterior" : "2 atrás"}</p>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-3xl ${pal.digitBox}`}>
                <span className={pal.sub}>{refDigit ?? "—"}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className={`text-[10px] ${pal.sub}`}>Atual</p>
              <AnimatePresence mode="wait">
                <motion.div key={digitKey} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className={`w-20 h-20 rounded-xl flex items-center justify-center font-black text-4xl border-2 ${
                    digitFeedback === "hit" ? "border-green-500 bg-green-500/20" :
                    digitFeedback === "fa" ? "border-red-500 bg-red-500/20" : `${pal.digitBox} border-transparent`
                  }`}>
                  <span className={pal.digitText}>{currentDigit ?? "—"}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <button onPointerDown={handleEqualTap}
              className={`px-5 py-4 rounded-xl font-bold text-base transition-all ${pal.eqBtn} ${equalPressed ? "opacity-50" : ""}`}
              style={{ touchAction: "none" }}>IGUAL</button>
          </div>
        </div>

        <p className={`text-xs text-center ${pal.sub}`}>Divida sua atenção entre as duas tarefas!</p>
      </div>
    </div>
  );
}
