"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface AtencaoSeletivaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Tipos ──────────────────────────────────────────────────────────────────

type ShapeId = "circle" | "triangle" | "square" | "diamond";
type ColorId = "green" | "red" | "blue" | "yellow" | "orange" | "purple";
type RuleKind = "color" | "shape" | "conjunction";

interface Cell {
  id: number;
  shape: ShapeId;
  color: ColorId;
  isTarget: boolean;
  state: "idle" | "found" | "wrong";
}

interface Rule {
  kind: RuleKind;
  color?: ColorId;
  shape?: ShapeId;
  text: string;
  match: (shape: ShapeId, color: ColorId) => boolean;
}

// ── Cores e formas ──────────────────────────────────────────────────────────

const COLOR_HEX: Record<ColorId, string> = {
  green: "#22c55e", red: "#ef4444", blue: "#3b82f6",
  yellow: "#eab308", orange: "#f97316", purple: "#a855f7",
};
const COLOR_LABEL: Record<ColorId, string> = {
  green: "VERDE", red: "VERMELHO", blue: "AZUL",
  yellow: "AMARELO", orange: "LARANJA", purple: "ROXO",
};
const COLOR_PLURAL: Record<ColorId, string> = {
  green: "VERDES", red: "VERMELHOS", blue: "AZUIS",
  yellow: "AMARELOS", orange: "LARANJAS", purple: "ROXOS",
};
const SHAPE_PLURAL: Record<ShapeId, string> = {
  circle: "CÍRCULOS", triangle: "TRIÂNGULOS", square: "QUADRADOS", diamond: "LOSANGOS",
};

// ── Forma em SVG (escala 100% do contêiner) ─────────────────────────────────

function ShapeGlyph({ shape, color }: { shape: ShapeId; color: string }) {
  const stroke = "rgba(255,255,255,0.92)";
  const sw = 5;
  let el;
  if (shape === "circle") {
    el = <circle cx={50} cy={50} r={40} fill={color} stroke={stroke} strokeWidth={sw} />;
  } else if (shape === "triangle") {
    el = <polygon points="50,8 90,86 10,86" fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
  } else if (shape === "square") {
    el = <rect x={12} y={12} width={76} height={76} rx={12} fill={color} stroke={stroke} strokeWidth={sw} />;
  } else {
    el = <polygon points="50,6 90,50 50,94 10,50" fill={color} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block" }}>
      {el}
    </svg>
  );
}

// ── Níveis ───────────────────────────────────────────────────────────────────

interface LevelCfg {
  cols: number; rows: number;
  colors: ColorId[]; shapes: ShapeId[];
  rule: RuleKind; targetRatio: number;
}
const LEVELS: LevelCfg[] = [
  { cols: 4, rows: 4, colors: ["green", "red"], shapes: ["circle"], rule: "color", targetRatio: 0.42 },
  { cols: 4, rows: 4, colors: ["green", "red", "blue"], shapes: ["circle"], rule: "color", targetRatio: 0.40 },
  { cols: 5, rows: 4, colors: ["green", "red", "blue"], shapes: ["circle", "square"], rule: "color", targetRatio: 0.36 },
  { cols: 5, rows: 5, colors: ["green", "red", "blue", "yellow"], shapes: ["circle", "square"], rule: "shape", targetRatio: 0.34 },
  { cols: 5, rows: 5, colors: ["green", "red", "blue", "yellow"], shapes: ["circle", "square", "triangle"], rule: "color", targetRatio: 0.32 },
  { cols: 6, rows: 5, colors: ["green", "red", "blue", "yellow"], shapes: ["circle", "square", "triangle"], rule: "shape", targetRatio: 0.30 },
  { cols: 6, rows: 6, colors: ["green", "red", "blue", "yellow", "orange"], shapes: ["circle", "square", "triangle"], rule: "conjunction", targetRatio: 0.26 },
  { cols: 6, rows: 6, colors: ["green", "red", "blue", "yellow", "orange"], shapes: ["circle", "square", "triangle", "diamond"], rule: "conjunction", targetRatio: 0.24 },
  { cols: 7, rows: 6, colors: ["green", "red", "blue", "yellow", "orange", "purple"], shapes: ["circle", "square", "triangle", "diamond"], rule: "conjunction", targetRatio: 0.22 },
  { cols: 7, rows: 7, colors: ["green", "red", "blue", "yellow", "orange", "purple"], shapes: ["circle", "square", "triangle", "diamond"], rule: "conjunction", targetRatio: 0.20 },
];

const ROUNDS = 12;
const BOARD_CAP_MS = 75000; // tempo máximo por quadro (segurança); o quadro termina antes ao achar tudo

function clampLevel(d: number): number {
  return Math.max(1, Math.min(LEVELS.length, Math.round(d)));
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRule(cfg: LevelCfg): Rule {
  if (cfg.rule === "color") {
    const color = pick(cfg.colors);
    return { kind: "color", color, text: `Toque em tudo que for ${COLOR_LABEL[color]}`, match: (_s, c) => c === color };
  }
  if (cfg.rule === "shape") {
    const shape = pick(cfg.shapes);
    return { kind: "shape", shape, text: `Toque em todos os ${SHAPE_PLURAL[shape]}`, match: (s) => s === shape };
  }
  const color = pick(cfg.colors);
  const shape = pick(cfg.shapes);
  return {
    kind: "conjunction", color, shape,
    text: `Toque nos ${SHAPE_PLURAL[shape]} ${COLOR_PLURAL[color]}`,
    match: (s, c) => s === shape && c === color,
  };
}

function buildBoard(cfg: LevelCfg, rule: Rule): Cell[] {
  const total = cfg.cols * cfg.rows;
  // todas as combinações possíveis
  const pool: { shape: ShapeId; color: ColorId }[] = [];
  for (const c of cfg.colors) for (const s of cfg.shapes) pool.push({ shape: s, color: c });

  const targetCombos = pool.filter((p) => rule.match(p.shape, p.color));
  const distractorCombos = pool.filter((p) => !rule.match(p.shape, p.color));

  let targetCount = Math.round(total * cfg.targetRatio);
  targetCount = Math.max(3, Math.min(total - 3, targetCount));
  if (distractorCombos.length === 0) targetCount = Math.min(targetCount, total - 1);

  const cells: Cell[] = [];
  // alvos
  for (let i = 0; i < targetCount; i++) {
    const t = pick(targetCombos);
    cells.push({ id: 0, shape: t.shape, color: t.color, isTarget: true, state: "idle" });
  }
  // distratores — na conjunção, viés p/ "iscas" que compartilham 1 atributo com o alvo
  const lures = rule.kind === "conjunction"
    ? distractorCombos.filter((p) => p.color === rule.color || p.shape === rule.shape)
    : [];
  for (let i = cells.length; i < total; i++) {
    let d;
    if (lures.length > 0 && Math.random() < 0.6) d = pick(lures);
    else d = pick(distractorCombos.length ? distractorCombos : pool);
    cells.push({ id: 0, shape: d.shape, color: d.color, isTarget: false, state: "idle" });
  }
  return shuffle(cells).map((c, i) => ({ ...c, id: i }));
}

// ── Tutorial ───────────────────────────────────────────────────────────────

function TutBoard({ cells, onTap }: { cells: Cell[]; onTap?: (i: number) => void }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 200 }}>
      {cells.map((c, i) => (
        <button key={i} onPointerDown={() => onTap?.(i)} disabled={c.state !== "idle"}
          className="relative w-full rounded-lg flex items-center justify-center"
          style={{ aspectRatio: "1 / 1", background: "rgba(0,0,0,0.04)", touchAction: "none" }}>
          <div style={{ width: "74%", height: "74%", opacity: c.state === "found" ? 0.35 : 1 }}>
            <ShapeGlyph shape={c.shape} color={COLOR_HEX[c.color]} />
          </div>
          {c.state === "found" && <span className="absolute text-lg">✓</span>}
          {c.state === "wrong" && <span className="absolute text-lg">✗</span>}
        </button>
      ))}
    </div>
  );
}

function TutInteract({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const build = (): Cell[] => {
    const base: Cell[] = [
      { id: 0, shape: "circle", color: "green", isTarget: true, state: "idle" },
      { id: 1, shape: "circle", color: "red", isTarget: false, state: "idle" },
      { id: 2, shape: "circle", color: "green", isTarget: true, state: "idle" },
      { id: 3, shape: "circle", color: "blue", isTarget: false, state: "idle" },
      { id: 4, shape: "circle", color: "green", isTarget: true, state: "idle" },
      { id: 5, shape: "circle", color: "red", isTarget: false, state: "idle" },
      { id: 6, shape: "circle", color: "blue", isTarget: false, state: "idle" },
      { id: 7, shape: "circle", color: "green", isTarget: true, state: "idle" },
      { id: 8, shape: "circle", color: "red", isTarget: false, state: "idle" },
    ];
    return base;
  };
  const [cells, setCells] = useState<Cell[]>(build);
  const doneRef = useRef(false);
  const text = theme === "GAMIFIED" ? "text-gray-300" : "text-gray-600";

  function tap(i: number) {
    setCells((prev) => {
      const cell = prev[i];
      if (!cell || cell.state !== "idle") return prev;
      const next = prev.map((c, j) => j === i ? { ...c, state: (c.isTarget ? "found" : "wrong") as Cell["state"] } : c);
      const remaining = next.filter((c) => c.isTarget && c.state !== "found").length;
      if (remaining === 0 && !doneRef.current) {
        doneRef.current = true;
        setTimeout(onDone, 600);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
        style={{ background: "#eef2ff", borderColor: "#c7d2fe", color: "#3730a3" }}>
        <span style={{ width: 16, height: 16, display: "inline-block" }}><ShapeGlyph shape="circle" color={COLOR_HEX.green} /></span>
        Toque em todos os VERDES
      </div>
      <TutBoard cells={cells} onTap={tap} />
      <p className={`text-xs text-center ${text}`}>Ache e toque cada bolinha verde. Ignore as outras cores.</p>
    </div>
  );
}

function AtencaoSeletivaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Vai aparecer um QUADRO cheio de figuras. Toque em TODAS as figuras que combinam com a regra do topo.",
      content: (done: () => void) => (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
            style={{ background: "#eef2ff", borderColor: "#c7d2fe", color: "#3730a3" }}>
            <span style={{ width: 16, height: 16, display: "inline-block" }}><ShapeGlyph shape="circle" color={COLOR_HEX.green} /></span>
            Toque em todos os VERDES
          </div>
          <TutBoard cells={[
            { id: 0, shape: "circle", color: "green", isTarget: true, state: "found" },
            { id: 1, shape: "circle", color: "red", isTarget: false, state: "idle" },
            { id: 2, shape: "circle", color: "green", isTarget: true, state: "found" },
            { id: 3, shape: "circle", color: "blue", isTarget: false, state: "idle" },
            { id: 4, shape: "circle", color: "green", isTarget: true, state: "found" },
            { id: 5, shape: "circle", color: "red", isTarget: false, state: "idle" },
          ]} />
          <TutAdvance onDone={done} />
        </div>
      ),
    },
    {
      instruction: "Agora você! Toque em todas as bolinhas verdes do quadro.",
      content: (done: () => void) => <TutInteract theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Seletiva" steps={steps} onDone={onDone} />;
}

function TutAdvance({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <p className="text-xs text-gray-500">As verdes marcadas com ✓ são as certas.</p>;
}

// ── Componente principal ───────────────────────────────────────────────────

export function AtencaoSeletiva({ difficulty, theme, onComplete }: AtencaoSeletivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const cfg = LEVELS[clampLevel(difficulty) - 1];

  // 1º quadro: regra e tabuleiro nascem da MESMA regra (consistentes).
  const initRef = useRef<{ rule: Rule; cells: Cell[] } | null>(null);
  if (!initRef.current) { const r = buildRule(cfg); initRef.current = { rule: r, cells: buildBoard(cfg, r) }; }

  const [roundIdx, setRoundIdx] = useState(0);
  const [rule, setRule] = useState<Rule>(initRef.current.rule);
  const [cells, setCells] = useState<Cell[]>(initRef.current.cells);
  const [boardDone, setBoardDone] = useState(false);
  const [elapsed, setElapsed] = useState(0); // segundos no quadro atual

  // métricas acumuladas
  const hitsRef = useRef(0);
  const omissionsRef = useRef(0);
  const fpRef = useRef(0);
  const targetsRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]); // intervalos entre toques certos (ms)
  const boardStartRef = useRef(Date.now());
  const lastTapRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const doneRef = useRef(false);
  const advancingRef = useRef(false); // trava p/ não avançar 2 quadros de uma vez
  const roundIdxRef = useRef(0);
  roundIdxRef.current = roundIdx;

  // conta os alvos do quadro atual quando ele muda
  const targetsThisBoard = cells.filter((c) => c.isTarget).length;
  const foundThisBoard = cells.filter((c) => c.isTarget && c.state === "found").length;

  const startBoardTimers = useCallback(() => {
    boardStartRef.current = Date.now();
    lastTapRef.current = Date.now();
    setElapsed(0);
  }, []);

  // cronômetro do quadro
  useEffect(() => {
    if (showTutorial || boardDone) return;
    startBoardTimers();
    const iv = setInterval(() => {
      const sec = Math.floor((Date.now() - boardStartRef.current) / 1000);
      setElapsed(sec);
      if (Date.now() - boardStartRef.current >= BOARD_CAP_MS) endBoard();
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, showTutorial]);

  const finishSession = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const hits = hitsRef.current;
    const omissions = omissionsRef.current;
    const fp = fpRef.current;
    const totalTargets = targetsRef.current;
    const denom = hits + omissions + fp;
    const accuracy = denom > 0 ? hits / denom : 0;
    const gaps = tapTimesRef.current;
    const avgGap = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const score = calculateExerciseScore("atencao-seletiva", accuracy, undefined, difficulty);
    onComplete({
      exerciseId: "atencao-seletiva",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgGap ?? undefined,
      difficulty,
      duration,
      metadata: {
        hits, omissions, falsePositives: fp, totalTargets,
        boards: ROUNDS, avgTapGapMs: avgGap,
      },
    });
  }, [difficulty, onComplete]);

  const goNextBoard = useCallback(() => {
    const next = roundIdxRef.current + 1;
    reportProgress(Math.round((next / ROUNDS) * 100));
    if (next >= ROUNDS) { finishSession(); return; }
    const r = buildRule(cfg);
    setRule(r);
    setCells(buildBoard(cfg, r));
    setBoardDone(false);
    setRoundIdx(next);
    advancingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, finishSession, reportProgress]);

  const endBoard = useCallback(() => {
    if (boardDone || doneRef.current || advancingRef.current) return;
    advancingRef.current = true;
    // computa omissões do quadro (alvos não achados)
    setCells((prev) => {
      const tgt = prev.filter((c) => c.isTarget).length;
      const found = prev.filter((c) => c.isTarget && c.state === "found").length;
      targetsRef.current += tgt;
      omissionsRef.current += tgt - found;
      return prev.map((c) => c.isTarget && c.state !== "found" ? { ...c, state: "idle" } : c);
    });
    setBoardDone(true);
    setTimeout(goNextBoard, 1200);
  }, [boardDone, goNextBoard]);

  const handleTap = useCallback((i: number) => {
    if (boardDone || doneRef.current) return;
    setCells((prev) => {
      const cell = prev[i];
      if (!cell || cell.state !== "idle") return prev;
      const now = Date.now();
      if (cell.isTarget) {
        hitsRef.current += 1;
        tapTimesRef.current.push(now - lastTapRef.current);
        lastTapRef.current = now;
      } else {
        fpRef.current += 1;
      }
      const next = prev.map((c, j) => j === i
        ? { ...c, state: (cell.isTarget ? "found" : "wrong") as Cell["state"] } : c);
      // quadro completo?
      const remaining = next.filter((c) => c.isTarget && c.state !== "found").length;
      if (cell.isTarget && remaining === 0 && !advancingRef.current) {
        advancingRef.current = true;
        const tgt = next.filter((c) => c.isTarget).length;
        targetsRef.current += tgt; // omissões = 0 aqui
        setBoardDone(true);
        setTimeout(goNextBoard, 1000);
      }
      return next;
    });
  }, [boardDone, goNextBoard]);

  if (showTutorial) {
    return <AtencaoSeletivaTutorial theme={theme}
      onDone={() => { sessionStartRef.current = Date.now(); setShowTutorial(false); setRoundIdx(0); }} />;
  }

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";
  const bgStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 60%, #f0e6ff 100%)" }
    : { background: "linear-gradient(160deg, #eef3f8 0%, #e6edf5 60%, #dde6f0 100%)" };
  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20 }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
  const titleColor = isGamified ? "#fff" : "#1a2744";
  const subColor = isGamified ? "rgba(255,255,255,0.6)" : "#64748b";
  const cellBg = isGamified ? "rgba(255,255,255,0.05)" : "#f1f5f9";

  const ruleSwatchShape: ShapeId = rule.shape ?? "circle";
  const ruleSwatchHex = rule.color ? COLOR_HEX[rule.color] : "#94a3b8"; // neutro qd a regra é só forma
  const mm = String(Math.floor(elapsed / 60)).padStart(1, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="min-h-screen overflow-y-auto" style={bgStyle}>
      <div className="max-w-md mx-auto px-3 py-4 flex flex-col items-center gap-3">

        {/* Header */}
        <div className="w-full p-3.5" style={cardStyle}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-sm" style={{ color: titleColor }}>🎯 Atenção Seletiva</h2>
            <span className="text-xs tabular-nums" style={{ color: subColor }}>Quadro {Math.min(roundIdx + 1, ROUNDS)}/{ROUNDS} · {mm}:{ss}</span>
          </div>
          <div className="h-1.5 rounded-full mb-3" style={{ background: isGamified ? "rgba(255,255,255,0.1)" : "rgba(26,45,80,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(roundIdx / ROUNDS) * 100}%`, background: isGamified ? "#06b6d4" : "#4f46e5" }} />
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-lg font-black tabular-nums" style={{ color: "#22c55e" }}>{foundThisBoard}<span className="text-sm font-bold" style={{ color: subColor }}>/{targetsThisBoard}</span></p>
              <p className="text-[10px]" style={{ color: subColor }}>Achou</p>
            </div>
            <div>
              <p className="text-lg font-black tabular-nums" style={{ color: "#ef4444" }}>{fpRef.current}</p>
              <p className="text-[10px]" style={{ color: subColor }}>Toques errados</p>
            </div>
          </div>
        </div>

        {/* Rule banner */}
        <div className="w-full flex items-center gap-3 px-4 py-3"
          style={{ background: isGamified ? "rgba(99,102,241,0.15)" : "#eef2ff", border: `1.5px solid ${isGamified ? "rgba(129,140,248,0.4)" : "#c7d2fe"}`, borderRadius: 14 }}>
          <span style={{ width: 30, height: 30, display: "inline-block", flexShrink: 0 }}>
            <ShapeGlyph shape={ruleSwatchShape} color={ruleSwatchHex} />
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: isGamified ? "#a5b4fc" : "#3730a3" }}>{rule.text}</p>
            <p className="text-[10px]" style={{ color: subColor }}>Toque em TODOS antes de seguir · ignore os outros</p>
          </div>
        </div>

        {/* Board */}
        <div className="w-full relative">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}>
            {cells.map((c, i) => (
              <button key={c.id} onPointerDown={() => handleTap(i)} disabled={c.state !== "idle" || boardDone}
                className="relative w-full rounded-xl flex items-center justify-center select-none"
                style={{
                  aspectRatio: "1 / 1", touchAction: "none",
                  background: c.state === "found" ? "rgba(34,197,94,0.15)" : c.state === "wrong" ? "rgba(239,68,68,0.15)" : cellBg,
                  border: c.state === "found" ? "2px solid #22c55e" : c.state === "wrong" ? "2px solid #ef4444" : `1.5px solid ${isGamified ? "rgba(255,255,255,0.08)" : "rgba(26,39,68,0.06)"}`,
                  transition: "background 0.15s, border 0.15s",
                }}>
                <motion.div
                  initial={false}
                  animate={{ scale: c.state === "wrong" ? [1, 0.85, 1] : 1, opacity: c.state === "found" ? 0.4 : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: "72%", height: "72%" }}>
                  <ShapeGlyph shape={c.shape} color={COLOR_HEX[c.color]} />
                </motion.div>
                {c.state === "found" && <span className="absolute font-black" style={{ color: "#16a34a", fontSize: "min(5vw,1.4rem)" }}>✓</span>}
                {c.state === "wrong" && <span className="absolute font-black" style={{ color: "#dc2626", fontSize: "min(5vw,1.4rem)" }}>✗</span>}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {boardDone && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ background: isGamified ? "rgba(8,16,32,0.7)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}>
                <div className="text-center">
                  <p className="text-4xl mb-1">{foundThisBoard >= targetsThisBoard ? "🎉" : "👍"}</p>
                  <p className="text-sm font-bold" style={{ color: titleColor }}>
                    {foundThisBoard >= targetsThisBoard ? "Quadro completo!" : `Achou ${foundThisBoard} de ${targetsThisBoard}`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botão Pronto */}
        {!boardDone && (
          <button onPointerDown={endBoard}
            className="mt-1 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ background: isGamified ? "rgba(255,255,255,0.1)" : "#fff", color: isGamified ? "#cbd5e1" : "#475569", border: `1.5px solid ${isGamified ? "rgba(255,255,255,0.15)" : "rgba(26,39,68,0.12)"}`, touchAction: "none" }}>
            ✓ Terminei este quadro
          </button>
        )}
      </div>
    </div>
  );
}
