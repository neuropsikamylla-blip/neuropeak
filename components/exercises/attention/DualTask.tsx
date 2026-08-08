"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Hash, AlertTriangle } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

interface DualTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Regras da tarefa superior ────────────────────────────────────────────────
// ALVO = conjunção FORMA + COR. Só o TRIÂNGULO VERDE conta; qualquer outra
// combinação é distratora (verde não-triângulo, triângulo não-verde, ou ambos).
// "block-alt" (níveis altos) MUDA a regra a cada bloco → aviso "REGRA ALTERADA".
type TopRule = "green-triangle" | "block-alt";
type ShapeKind = "circle" | "square" | "triangle" | "diamond";

interface LevelSpec {
  topRule: TopRule;
  nback: 1 | 2;
  shapeMs: number;   // tempo que a forma fica na tela
  digitMs: number;   // ritmo dos dígitos
  speedLabel: "lento" | "moderado" | "rápido";
}

// Ritmo lento com aumento progressivo. Nível 1 é a porta de entrada (bem lento).
const LEVELS: Record<number, LevelSpec> = {
  1:  { topRule: "green-triangle", nback: 1, shapeMs: 2600, digitMs: 2600, speedLabel: "lento" },
  2:  { topRule: "green-triangle", nback: 1, shapeMs: 2200, digitMs: 2300, speedLabel: "moderado" },
  3:  { topRule: "green-triangle", nback: 1, shapeMs: 1950, digitMs: 2050, speedLabel: "moderado" },
  4:  { topRule: "green-triangle", nback: 1, shapeMs: 1700, digitMs: 1850, speedLabel: "rápido" },
  5:  { topRule: "green-triangle", nback: 2, shapeMs: 2400, digitMs: 2400, speedLabel: "lento" },
  6:  { topRule: "green-triangle", nback: 2, shapeMs: 2050, digitMs: 2150, speedLabel: "moderado" },
  7:  { topRule: "green-triangle", nback: 2, shapeMs: 1750, digitMs: 1900, speedLabel: "rápido" },
  8:  { topRule: "block-alt",      nback: 2, shapeMs: 2100, digitMs: 2200, speedLabel: "moderado" },
  9:  { topRule: "block-alt",      nback: 2, shapeMs: 1800, digitMs: 1900, speedLabel: "rápido" },
  10: { topRule: "block-alt",      nback: 2, shapeMs: 1600, digitMs: 1750, speedLabel: "rápido" },
};
const levelOf = (d: number): LevelSpec => LEVELS[Math.min(10, Math.max(1, Math.round(d)))];

const TOTAL_SHAPES = 320;  // longo o bastante p/ durar ~7 min em qualquer nível
const BLOCK_SIZE = 12;     // formas por bloco na regra alternante (block-alt)
const ALL_KINDS: ShapeKind[] = ["circle", "square", "triangle", "diamond"];
const COLORS = ["green", "red", "blue", "yellow", "orange"] as const;
type ShapeColor = (typeof COLORS)[number];

const COLOR_HEX: Record<ShapeColor, string> = {
  green: "#16a34a", red: "#ef4444", blue: "#2563eb", yellow: "#eab308", orange: "#f97316",
};
const KIND_LABEL: Record<ShapeKind, string> = {
  circle: "CÍRCULO", square: "QUADRADO", triangle: "TRIÂNGULO", diamond: "LOSANGO",
};
const COLOR_LABEL: Record<ShapeColor, string> = {
  green: "VERDE", red: "VERMELHO", blue: "AZUL", yellow: "AMARELO", orange: "LARANJA",
};

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

interface ShapeTrial { color: ShapeColor; kind: ShapeKind; isTarget: boolean; }
interface ShapeResult { isTarget: boolean; tapped: boolean; rt: number | null; }
interface DigitResult { isMatch: boolean; tapped: boolean; rt: number | null; }

// Alvo do bloco (regra alternante): bloco par = triângulo verde; ímpar = quadrado azul.
function blockTarget(idx: number): { color: ShapeColor; kind: ShapeKind } {
  const even = Math.floor(idx / BLOCK_SIZE) % 2 === 0;
  return even ? { color: "green", kind: "triangle" } : { color: "blue", kind: "square" };
}

function targetOf(spec: LevelSpec, idx: number): { color: ShapeColor; kind: ShapeKind } {
  if (spec.topRule === "green-triangle") return { color: "green", kind: "triangle" };
  return blockTarget(idx);
}

function isTargetFor(spec: LevelSpec, idx: number, color: ShapeColor, kind: ShapeKind): boolean {
  const t = targetOf(spec, idx);
  return color === t.color && kind === t.kind;   // conjunção estrita FORMA + COR
}

// Distrator que testa as DUAS dimensões da regra (cor certa/forma errada;
// forma certa/cor errada; ambas erradas) e NUNCA coincide com o alvo do índice.
function makeDistractor(spec: LevelSpec, idx: number): { color: ShapeColor; kind: ShapeKind } {
  const t = targetOf(spec, idx);
  const nonTargetColor = COLORS.filter((c) => c !== t.color);
  const nonTargetKind = ALL_KINDS.filter((k) => k !== t.kind);
  let color: ShapeColor, kind: ShapeKind, tries = 0;
  do {
    const r = Math.random();
    if (r < 0.35) { color = t.color; kind = pick(nonTargetKind); }        // cor certa, forma errada
    else if (r < 0.70) { color = pick(nonTargetColor); kind = t.kind; }   // forma certa, cor errada
    else { color = pick(nonTargetColor); kind = pick(nonTargetKind); }    // ambas erradas
  } while (color === t.color && kind === t.kind && tries++ < 8);
  return { color, kind };
}

function buildShapeSequence(spec: LevelSpec, length: number): ShapeTrial[] {
  const result: ShapeTrial[] = [];
  let consecutiveNonTarget = 0;
  for (let i = 0; i < length; i++) {
    const forceTarget = consecutiveNonTarget >= 5;
    const makeTarget = forceTarget || Math.random() < 0.26;
    const { color, kind } = makeTarget ? targetOf(spec, i) : makeDistractor(spec, i);
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
    const force = canMatch && sinceMatch >= 3;
    if (canMatch && (force || Math.random() < 0.40)) {
      digits.push(digits[i - nback]);
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

// ── Render de forma (círculo / quadrado / triângulo / losango) ───────────────
function ShapeSvg({ color, kind, size = 90 }: { color: ShapeColor; kind: ShapeKind; size?: number }) {
  const fill = COLOR_HEX[color];
  const c = size / 2, r = size * 0.42;
  const stroke = "rgba(0,0,0,0.12)";
  if (kind === "circle")
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={c} cy={c} r={r} fill={fill} stroke={stroke} strokeWidth={2} /></svg>;
  if (kind === "square")
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><rect x={size * 0.12} y={size * 0.12} width={size * 0.76} height={size * 0.76} rx={size * 0.08} fill={fill} stroke={stroke} strokeWidth={2} /></svg>;
  if (kind === "diamond")
    return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><polygon points={`${c},${size * 0.08} ${size * 0.92},${c} ${c},${size * 0.92} ${size * 0.08},${c}`} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" /></svg>;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><polygon points={`${c},${size * 0.12} ${size * 0.9},${size * 0.86} ${size * 0.1},${size * 0.86}`} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" /></svg>;
}

// Texto da regra ativa (usado no bloco de instruções e no aviso de mudança).
function alvoLabel(spec: LevelSpec, idx: number): string {
  const t = targetOf(spec, idx);
  return `${KIND_LABEL[t.kind]} ${COLOR_LABEL[t.color]}`;
}
function bottomStrong(nback: 1 | 2): string {
  return nback === 1 ? "ANTERIOR" : "de DUAS posições atrás";
}

// ── Bloco de instruções "Em cima / Embaixo" ──────────────────────────────────
function InstrucaoBloco({ spec, idx, theme, alterada }: { spec: LevelSpec; idx: number; theme: Theme; alterada: boolean }) {
  const isG = theme === "GAMIFIED";
  const t = targetOf(spec, idx);
  const box = isG ? "bg-gray-800/80 border-gray-700" : "bg-slate-100 border-slate-200";
  const label = isG ? "text-gray-400" : "text-slate-500";
  const txt = isG ? "text-gray-100" : "text-slate-700";
  return (
    <div className={`rounded-2xl border px-5 py-4 transition-all ${box} ${alterada ? "ring-2 ring-amber-400" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 mt-0.5"><ShapeSvg color={t.color} kind={t.kind} size={26} /></span>
        <p className={`text-sm sm:text-[15px] leading-snug ${txt}`}>
          <span className={`font-bold ${label}`}>Em cima:</span>{" "}
          toque somente no <b style={{ color: COLOR_HEX[t.color] }}>{KIND_LABEL[t.kind]} {COLOR_LABEL[t.color]}</b>.
        </p>
      </div>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 mt-0.5 ${isG ? "text-blue-300" : "text-blue-500"}`}><Hash size={22} strokeWidth={2.5} /></span>
        <p className={`text-sm sm:text-[15px] leading-snug ${txt}`}>
          <span className={`font-bold ${label}`}>Embaixo:</span>{" "}
          toque em <b style={{ color: isG ? "#93c5fd" : "#2563eb" }}>IGUAL</b>{" "}
          quando o número for igual ao <b className={txt}>{bottomStrong(spec.nback)}</b>.
        </p>
      </div>
      <p className={`text-[11px] mt-3 ${label}`}>Ritmo: <b>{spec.speedLabel}</b> — fica mais rápido conforme você evolui.</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
  const spec = levelOf(difficulty);
  const nback = spec.nback;
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [shapes] = useState<ShapeTrial[]>(() => buildShapeSequence(spec, TOTAL_SHAPES));
  const [digitSeq] = useState<number[]>(() => buildDigitSequence(900, nback));

  const [shapeIdx, setShapeIdx] = useState(-1);
  const [shapeFeedback, setShapeFeedback] = useState<"hit" | "fa" | "miss" | null>(null);
  const [shapePhase, setShapePhase] = useState<"isi" | "show">("isi");
  const [ruleAlert, setRuleAlert] = useState<string | null>(null); // aviso "REGRA ALTERADA"

  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
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
  const ruleAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allDoneRef = useRef(false);

  const shapePhaseRef = useRef<"isi" | "show">("isi");
  const shapeIdxRef = useRef(0);
  const lastBlockRef = useRef(0);
  const advanceShapeRef = useRef<(() => void) | null>(null);
  const digitIdxRef = useRef(0);
  const digitWindowRef = useRef<number[]>([]);

  useEffect(() => {
    startTime.current = Date.now();
    begin();
  }, [begin]);

  const finishSession = useCallback(() => {
    if (allDoneRef.current) return;
    allDoneRef.current = true;
    finish();
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
    if (digitTimerRef.current) clearTimeout(digitTimerRef.current);
    if (ruleAlertTimerRef.current) clearTimeout(ruleAlertTimerRef.current);

    const sRes = shapeResults.current;
    const dRes = digitResults.current;

    const topTargets = sRes.filter((r) => r.isTarget);
    const hitsTop = topTargets.filter((r) => r.tapped).length;
    const fpTop = sRes.filter((r) => !r.isTarget && r.tapped).length;
    const omTop = topTargets.filter((r) => !r.tapped).length;
    const accTop = topTargets.length > 0 ? hitsTop / topTargets.length : 0;

    const botMatches = dRes.filter((r) => r.isMatch);
    const hitsBot = botMatches.filter((r) => r.tapped).length;
    const fpBot = dRes.filter((r) => !r.isMatch && r.tapped).length;
    const omBot = botMatches.filter((r) => !r.tapped).length;
    const accBot = botMatches.length > 0 ? hitsBot / botMatches.length : 0;

    const accTotal = (accTop + accBot) / 2;
    const rts = [...sRes, ...dRes].map((r) => r.rt).filter((v): v is number => v != null && v > 0);
    const meanRT = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
    const score = calculateExerciseScore("dual-task", accTotal, meanRT ?? undefined, difficulty);

    onComplete({
      exerciseId: "dual-task",
      domain: "attention",
      score,
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty,
      duration: elapsedSec(),
      metadata: {
        level: Math.round(difficulty),
        startedLevel: Math.round(difficulty),
        nback,
        accTop: Number(accTop.toFixed(3)),
        accBottom: Number(accBot.toFixed(3)),
        accTotal: Number(accTotal.toFixed(3)),
        hitsTop, fpTop, omTop,
        hitsBottom: hitsBot, fpBottom: fpBot, omBottom: omBot,
        meanReactionTimeMs: meanRT,
        acc_A: Math.round(accTop * 100), acc_B: Math.round(accBot * 100),
      },
    });
  }, [difficulty, nback, onComplete, finish, elapsedSec]);

  // Loop da tarefa visual
  useEffect(() => {
    function scheduleNextShape() {
      if (allDoneRef.current) return;
      const idx = shapeIdxRef.current;
      if (isTimeUp() || idx >= TOTAL_SHAPES) { finishSession(); return; }

      // Mudança de regra (block-alt): ao entrar num novo bloco, avisa "REGRA ALTERADA".
      if (spec.topRule === "block-alt") {
        const blk = Math.floor(idx / BLOCK_SIZE);
        if (blk !== lastBlockRef.current && idx > 0) {
          lastBlockRef.current = blk;
          setRuleAlert(alvoLabel(spec, idx));
          if (ruleAlertTimerRef.current) clearTimeout(ruleAlertTimerRef.current);
          ruleAlertTimerRef.current = setTimeout(() => setRuleAlert(null), 3000);
        }
      }

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
        shapeTimerRef.current = setTimeout(scheduleNextShape, 320);
      }, spec.shapeMs);
    }
    advanceShapeRef.current = scheduleNextShape;
    shapeTimerRef.current = setTimeout(scheduleNextShape, 500);
    return () => { if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loop da tarefa numérica (n-back)
  useEffect(() => {
    function scheduleNextDigit() {
      if (allDoneRef.current) return;
      const idx = digitIdxRef.current;
      if (idx >= digitSeq.length) return;
      const d = digitSeq[idx];
      const ref = idx >= nback ? digitSeq[idx - nback] : null;
      digitWindowRef.current.push(d);
      setCurrentDigit(d);
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
        digitTimerRef.current = setTimeout(scheduleNextDigit, 160);
      }, spec.digitMs);
    }
    const t = setTimeout(scheduleNextDigit, 700);
    return () => { clearTimeout(t); if (digitTimerRef.current) clearTimeout(digitTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      shapeTimerRef.current = setTimeout(() => { if (advanceShapeRef.current) advanceShapeRef.current(); }, 320);
    }, 420);
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
    setTimeout(() => setDigitFeedback(null), 420);
  }

  const currentShape = shapeIdx >= 0 && shapeIdx < TOTAL_SHAPES ? shapes[shapeIdx] : null;
  const displayState =
    shapeFeedback === "hit" ? "fb-hit" : shapeFeedback === "fa" ? "fb-fa" : shapeFeedback === "miss" ? "fb-miss" :
    (shapePhase === "show" && currentShape !== null) ? "shape" : "idle";

  const isG = theme === "GAMIFIED";
  const pal = {
    bg: isG ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-fuchsia-50 to-pink-50" : "bg-slate-50",
    title: isG ? "text-white" : "text-slate-900",
    sub: isG ? "text-gray-400" : "text-slate-500",
    panel: isG ? "bg-gray-900 border border-gray-800" : "bg-white border border-slate-200",
    panelLabel: isG ? "text-gray-400" : "text-slate-400",
    arena: isG ? "bg-gray-800/60 border-gray-700" : "bg-slate-50 border-slate-200",
    digitBox: isG ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-slate-200 text-slate-900",
    eqBtn: isG ? "bg-blue-600 active:bg-blue-500" : "bg-blue-600 active:bg-blue-700",
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-[760px] mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h2 className={`font-black text-xl ${pal.title}`}>Dupla Tarefa</h2>
            <span className={`text-sm font-semibold ${pal.sub}`}>Nível {Math.round(difficulty)}</span>
          </div>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
        </div>

        {/* Bloco de instruções */}
        <InstrucaoBloco spec={spec} idx={shapeIdx >= 0 ? shapeIdx : 0} theme={theme} alterada={ruleAlert !== null} />

        {/* Painel SUPERIOR — tarefa visual */}
        <div className={`rounded-2xl p-4 relative ${pal.panel}`}>
          <p className={`text-[11px] font-bold tracking-widest ${pal.panelLabel}`}>SUPERIOR</p>
          <div
            className={`mt-2 w-full flex items-center justify-center rounded-2xl border-2 cursor-pointer transition-colors ${
              displayState === "fb-hit" ? "border-green-500 bg-green-500/10" :
              displayState === "fb-fa" ? "border-red-500 bg-red-500/10" :
              displayState === "fb-miss" ? "border-amber-500 bg-amber-500/10" : pal.arena
            }`}
            style={{ height: 300 }} onPointerDown={handleShapeTap}>
            <AnimatePresence mode="wait">
              {displayState === "shape" && currentShape && (
                <motion.div key={`shape-${shapeIdx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                  <ShapeSvg color={currentShape.color} kind={currentShape.kind} size={140} />
                </motion.div>
              )}
              {displayState.startsWith("fb-") && (
                <motion.span key={displayState} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className={`text-6xl font-black ${displayState === "fb-hit" ? "text-green-500" : displayState === "fb-fa" ? "text-red-500" : "text-amber-500"}`}>
                  {displayState === "fb-hit" ? "✓" : displayState === "fb-fa" ? "✕" : "⏱"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Aviso de MUDANÇA DE REGRA (block-alt) — texto + ícone, sem piscar */}
          <AnimatePresence>
            {ruleAlert && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 top-2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg"
                style={{ background: "#f59e0b", color: "#1f2937", border: "2px solid #d97706" }}>
                <AlertTriangle size={20} strokeWidth={2.5} />
                <span className="text-sm font-black">REGRA ALTERADA — agora toque no {ruleAlert}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Painel INFERIOR — tarefa numérica n-back */}
        <div className={`rounded-2xl p-4 ${pal.panel}`}>
          <p className={`text-[11px] font-bold tracking-widest ${pal.panelLabel}`}>INFERIOR — N-back {nback}</p>
          <div className="mt-2 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[11px] ${pal.sub}`}>Atual</p>
              <AnimatePresence mode="wait">
                <motion.div key={digitKey} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center font-black text-5xl border-2 ${
                    digitFeedback === "hit" ? "border-green-500 bg-green-500/15" :
                    digitFeedback === "fa" ? "border-red-500 bg-red-500/15" : pal.digitBox
                  }`}>
                  {currentDigit ?? "—"}
                </motion.div>
              </AnimatePresence>
            </div>
            <button onPointerDown={handleEqualTap}
              className={`px-8 py-6 rounded-2xl font-black text-lg text-white transition-colors ${pal.eqBtn} ${equalPressed ? "opacity-50" : ""}`}
              style={{ touchAction: "none" }}>IGUAL</button>
          </div>
        </div>

        <p className={`text-sm text-center flex items-center justify-center gap-2 ${pal.sub}`}>
          <Brain size={16} /> Divida sua atenção entre as duas tarefas!
        </p>
      </div>
    </div>
  );
}
