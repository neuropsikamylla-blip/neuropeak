"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, AlertTriangle, Sparkles } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
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
//
// Silhuetas com os vértices arredondados por ARCO TANGENTE de raio 8 — o mesmo
// `rx=8` que o quadrado já usava, agora nas quatro formas. Em cada vértice V com
// vizinhos A e B: pontos de tangência a `r / tan(θ/2)` de V sobre cada aresta, e o
// canto vira `L T1` + `A r r 0 0 1 T2` (varredura 1 porque os vértices estão em
// ordem horária na tela). Como o arco RETRAI a ponta em `r/sen(θ/2) − r`, o polígono
// foi reexpandido até a silhueta MEDIDA bater na caixa alvo — por isso os números
// vêm resolvidos, e não recalculados em tempo de execução.
//
// PESO ÓTICO: medida a área preenchida, o triângulo tinha 54,4 de "tinta" contra
// 75,6 do quadrado — 39% de dispersão. Isso não é estética: dos níveis 8 a 10 o alvo
// alterna a cada bloco entre TRIÂNGULO VERDE e QUADRADO AZUL (`blockTarget`), então a
// saliência do alvo mudava justamente onde a regra alterna, e essa acurácia alimenta
// a engine adaptativa. Corrigido a 50% (dispersão de 12%): equalizar 100% pela área
// faz triângulo e losango PARECEREM maiores, porque tamanho percebido também depende
// da extensão da peça.
const SHAPE_PATH: Record<ShapeKind, string> = {
  circle:   "M 9.036 50 A 40.964 40.964 0 1 0 90.964 50 A 40.964 40.964 0 1 0 9.036 50 Z",
  square:   "M 13.211 21.211 A 8 8 0 0 1 21.211 13.211 L 78.789 13.211 A 8 8 0 0 1 86.789 21.211 L 86.789 78.789 A 8 8 0 0 1 78.789 86.789 L 21.211 86.789 A 8 8 0 0 1 13.211 78.789 Z",
  triangle: "M 42.995 13.649 A 8 8 0 0 1 57.005 13.649 L 92.852 78.621 A 8 8 0 0 1 85.847 90.486 L 14.153 90.486 A 8 8 0 0 1 7.148 78.621 Z",
  diamond:  "M 44.343 7.843 A 8 8 0 0 1 55.657 7.843 L 92.157 44.343 A 8 8 0 0 1 92.157 55.657 L 55.657 92.157 A 8 8 0 0 1 44.343 92.157 L 7.843 55.657 A 8 8 0 0 1 7.843 44.343 Z",
};

// Degradê de BAIXA amplitude: anda só no eixo L* do CIELAB (±3), com matiz e croma
// preservados (desvio de matiz medido < 0,2°). A tarefa é de discriminação por
// CONJUNÇÃO forma+cor, então a cor não pode escorregar: o desvio máximo em relação à
// cor canônica é ΔE₀₀ 3,02, contra ΔE₀₀ 19,7 do par de cores mais próximo do
// exercício (vermelho↔laranja) — 15% da distância, e num eixo que não é o eixo pelo
// qual se nomeia a cor. `edge` é o filete da própria família (−10 L*), que substitui
// o contorno preto translúcido de antes.
const SHAPE_SHADE: Record<ShapeColor, { top: string; bottom: string; edge: string }> = {
  green  : { top: "#25ab51", bottom: "#009b43", edge: "#008639" },
  red    : { top: "#f94d4b", bottom: "#e53a3d", edge: "#cf212d" },
  blue   : { top: "#356af4", bottom: "#0a5ce2", edge: "#004cc1" },
  yellow : { top: "#f3bb1a", bottom: "#e0ab00", edge: "#c99900" },
  orange : { top: "#ff7d29", bottom: "#ef6b09", edge: "#d45c00" },
};

function ShapeSvg({ color, kind, size = 90 }: { color: ShapeColor; kind: ShapeKind; size?: number | string }) {
  const d = SHAPE_PATH[kind];
  const s = SHAPE_SHADE[color];
  // A chave PRECISA ser cor+forma: o estímulo grande e o ícone de 18px podem coexistir
  // com a mesma cor e forma, e aí o id repete — inofensivo, porque a chave determina
  // integralmente o conteúdo das defs. Encurtar a chave faria duas cores dividirem o
  // mesmo degradê.
  const uid = `${color}-${kind}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.top} />
          <stop offset="1" stopColor={s.bottom} />
        </linearGradient>
        <filter id={`sf-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#0F172A" floodOpacity="0.18" />
        </filter>
        <clipPath id={`sc-${uid}`}><path d={d} /></clipPath>
      </defs>
      <path d={d} fill={`url(#sg-${uid})`} filter={`url(#sf-${uid})`} />
      <g clipPath={`url(#sc-${uid})`}>
        <path d={d} fill="none" stroke={s.edge} strokeWidth={2} opacity={0.5} />
      </g>
    </svg>
  );
}

// Texto da regra ativa (usado no bloco de instruções e no aviso de mudança).
function alvoLabel(spec: LevelSpec, idx: number): string {
  const t = targetOf(spec, idx);
  return `${KIND_LABEL[t.kind]} ${COLOR_LABEL[t.color]}`;
}
function bottomStrong(nback: 1 | 2): string {
  return nback === 1 ? "ANTERIOR" : "de DUAS posições atrás";
}

function InstrucaoBloco({ spec, idx, theme, alterada }: { spec: LevelSpec; idx: number; theme: Theme; alterada: boolean }) {
  const isG = theme === "GAMIFIED";
  const t = targetOf(spec, idx);
  const panel = isG ? "bg-[#0F1622] border-white/[0.08]" : "bg-[#F7F9FC] border-[#E5E9F0]";
  const text = isG ? "text-[#E5E7EB]" : "text-[#0F172A]";
  return (
    <div className={`rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 space-y-2 sm:space-y-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all ${panel} ${alterada ? "ring-1 ring-amber-300" : ""}`}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex-shrink-0 mt-0.5"><ShapeSvg color={t.color} kind={t.kind} size={18} /></span>
        <p className={`min-w-0 text-[13px] sm:text-sm leading-snug ${text}`}>
          Toque somente no <b style={{ color: COLOR_HEX[t.color] }}>{KIND_LABEL[t.kind].toLowerCase()} {COLOR_LABEL[t.color].toLowerCase()}</b>.
        </p>
      </div>
      <div className="flex items-start gap-3 min-w-0">
        <span className={`flex-shrink-0 mt-0.5 ${isG ? "text-blue-400" : "text-[#2563EB]"}`}><Hash size={18} strokeWidth={2.5} /></span>
        <p className={`min-w-0 text-[13px] sm:text-sm leading-snug ${text}`}>
          Toque em <b className={isG ? "text-blue-400" : "text-[#2563EB]"}>IGUAL</b> quando o número for igual ao <b>{bottomStrong(spec.nback).toLowerCase()}</b>.
        </p>
      </div>
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
  // Decisão dela em 31/ago/2026, vendo a tela: "nao precisa avisar e' treino".
  // A OMISSÃO (deixar o alvo passar) não recebe mais aviso nenhum — a arena
  // simplesmente esvazia. `shapeFeedback === "miss"` continua sendo marcado, e o
  // resultado da tentativa continua indo para `shapeResults` como sempre: o dado
  // clínico da omissão está intacto, só o carimbo na cara dela é que saiu. Os
  // feedbacks de acerto e de toque errado ficam, porque respondem a um gesto DELA.
  const displayState =
    shapeFeedback === "hit" ? "fb-hit" : shapeFeedback === "fa" ? "fb-fa" :
    (shapePhase === "show" && currentShape !== null) ? "shape" : "idle";

  const isG = theme === "GAMIFIED";
  const pal = {
    bg: isG ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-fuchsia-50 to-pink-50" : "bg-white",
    title: isG ? "text-[#E5E7EB]" : "text-[#0F172A]",
    sub: isG ? "text-[#9CA3AF]" : "text-[#64748B]",
    // Fundo do painel principal — o MESMO tom do bloco de instruções, para os dois
    // pousarem sobre o branco como blocos irmãos. Fundo e borda vivem em chaves
    // separadas de propósito: duas classes de background no mesmo elemento se
    // decidiriam pela ordem do CSS gerado, não pela ordem da string.
    arena: isG ? "bg-[#0F1622]" : "bg-[#F7F9FC]",
    border: isG ? "border-white/[0.08]" : "border-[#E5E9F0]",
    divider: isG ? "bg-white/[0.08]" : "bg-[#E9EDF3]",
    // Só borda e fundo; a COR DO TEXTO fica fora, senão o feedback a substitui e o
    // dígito some no tema escuro.
    digitBox: isG ? "bg-gray-900 border-white/[0.08]" : "bg-white border-[#E5E9F0]",
    digitText: isG ? "text-[#E5E7EB]" : "text-[#0F172A]",
    chip: isG
      ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
      : "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]",
    eqBtn: isG ? "bg-[#3B82F6] active:bg-blue-500" : "bg-[#2563EB] active:bg-blue-700",
  };

  return (
    <ExerciseStage width="medio" backgroundClassName={pal.bg} fill>
      <div className="h-full flex flex-col gap-3 sm:gap-4">
        <header className="shrink-0 flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className={`min-w-0 text-lg sm:text-xl font-bold tracking-tight ${pal.title}`}>Dupla Tarefa</h2>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pal.chip}`}>Nível {Math.round(difficulty)}</span>
          <div className="order-last flex w-full min-w-0 items-center gap-2 sm:order-none sm:ml-auto sm:w-auto sm:max-w-[360px] sm:flex-1">
            <p className={`shrink-0 whitespace-nowrap text-xs ${pal.sub}`}>Seu progresso</p>
            {/* A barra canônica traz `marginBottom: 14` embutido; compensado aqui para o
                cabeçalho ficar compacto, sem reescrever a peça compartilhada. */}
            <div style={{ marginBottom: -14 }} className="min-w-0 flex-1"><ExerciseProgressBar progressPct={progressPct} theme={theme} /></div>
          </div>
        </header>

        <div className="shrink-0"><InstrucaoBloco spec={spec} idx={shapeIdx >= 0 ? shapeIdx : 0} theme={theme} alterada={ruleAlert !== null} /></div>

        <main className={`relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${pal.border} ${pal.arena}`}>
          <div onPointerDown={handleShapeTap}
            className={`flex flex-1 min-h-[150px] sm:min-h-[220px] items-center justify-center px-4 py-5 sm:py-8 cursor-pointer transition-colors ${
              displayState === "fb-hit" ? "bg-[rgba(22,163,74,0.07)]" : displayState === "fb-fa" ? "bg-[rgba(239,68,68,0.07)]" : "bg-transparent"
            }`}>
            <AnimatePresence mode="wait">
              {displayState === "shape" && currentShape && (
                <motion.div key={`shape-${shapeIdx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={{ width: "min(52%, 190px)", height: "min(72%, 190px)" }}>
                  <ShapeSvg color={currentShape.color} kind={currentShape.kind} size="100%" />
                </motion.div>
              )}
              {displayState.startsWith("fb-") && (
                <motion.span key={displayState} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ fontSize: "clamp(38px, 9vh, 64px)" }}
                  className={`font-black ${displayState === "fb-hit" ? "text-green-500" : "text-red-500"}`}>
                  {displayState === "fb-hit" ? "✓" : "✕"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className={`mx-auto h-px w-[92%] ${pal.divider}`} />

          <section className="flex flex-col items-center gap-2 px-4 py-4 sm:gap-3 sm:py-6">
            <p className={`text-center text-[11px] sm:text-xs ${pal.sub}`}>Número atual</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <AnimatePresence mode="wait">
                <motion.div key={digitKey} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "clamp(30px, 7vw, 44px)" }}
                  className={`flex h-[clamp(64px,18vw,88px)] w-[clamp(64px,18vw,88px)] items-center justify-center rounded-2xl border font-black tabular-nums shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${pal.digitText} ${
                    digitFeedback === "hit" ? "border-[#16A34A] bg-[rgba(22,163,74,0.08)]" : digitFeedback === "fa" ? "border-[#EF4444] bg-[rgba(239,68,68,0.08)]" : pal.digitBox
                  }`}>
                  {currentDigit ?? "—"}
                </motion.div>
              </AnimatePresence>
              <button type="button" onPointerDown={handleEqualTap}
                className={`h-[clamp(64px,18vw,88px)] w-[clamp(120px,34vw,190px)] rounded-2xl font-black text-base sm:text-lg tracking-wide text-white transition-colors shadow-[0_1px_3px_rgba(37,99,235,0.25)] ${pal.eqBtn} ${equalPressed ? "opacity-50" : ""}`}
                style={{ touchAction: "none" }}>IGUAL</button>
            </div>
          </section>

          <AnimatePresence>
            {ruleAlert && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
                <AlertTriangle size={16} />
                <span>REGRA ALTERADA — agora toque no {ruleAlert}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <p className={`shrink-0 flex items-center justify-center gap-2 text-center text-[11px] sm:text-xs ${pal.sub}`}><Sparkles size={14} /> Mantenha o foco nas duas tarefas.</p>
      </div>
    </ExerciseStage>
  );
}
