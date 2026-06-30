"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import type { ExerciseResult, Theme } from "@/types";

interface StroopTaskProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const COLORS = [
  { name: "VERMELHO", hex: "#F43F5E" },
  { name: "AZUL",     hex: "#2563EB" },
  { name: "VERDE",    hex: "#22C55E" },
  { name: "AMARELO",  hex: "#F59E0B" },
  { name: "ROXO",     hex: "#A855F7" },
];

type Rule = "COR" | "PALAVRA";
type Phase = "tutorial" | "active";

interface TrialItem {
  word: (typeof COLORS)[number];
  inkColor: (typeof COLORS)[number];
  rule: Rule;
}

const MIN_TIME_MS = 550;
const MAX_TIME_MS = 5000;

const TUTORIAL_EXAMPLES: TrialItem[] = [
  { word: COLORS[0], inkColor: COLORS[1], rule: "COR" },
  { word: COLORS[2], inkColor: COLORS[0], rule: "PALAVRA" },
  { word: COLORS[4], inkColor: COLORS[3], rule: "COR" },
];

function getOtherColors(excluded: (typeof COLORS)[number]) {
  return COLORS.filter((c) => c !== excluded);
}

// Progressão por degraus DENTRO da sessão: a dificuldade efetiva = base (progresso
// do paciente) + degrau (sobe a cada 2 acertos seguidos, desce ao errar). Tudo —
// pegadinhas (incongruência), troca de regra COR↔PALAVRA e tempo — deriva dela.
const MAX_INTRA_STEP = 5;
const HITS_PER_STEP  = 2;
const effLevel = (base: number, step: number) => Math.max(1, Math.min(10, base + step));

function generateTrial(eff: number): TrialItem {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  // Quanto maior a dificuldade efetiva, mais "pegadinhas" (palavra ≠ cor).
  const congruentChance = eff <= 2 ? 0.25 : eff <= 4 ? 0.12 : eff <= 6 ? 0.06 : 0.02;
  const congruent = Math.random() < congruentChance;
  const others = getOtherColors(word);
  const inkColor = congruent ? word : others[Math.floor(Math.random() * others.length)];
  // E mais troca de regra (PALAVRA aparece com mais frequência → mais alternância).
  const palavraChance = eff <= 2 ? 0.3 : eff <= 4 ? 0.4 : eff <= 6 ? 0.48 : 0.55;
  const rule: Rule = Math.random() < palavraChance ? "PALAVRA" : "COR";
  return { word, inkColor, rule };
}

function initialTimeMs(eff: number): number {
  // Começa generoso no nível 1 (~4,5s) e acelera com a dificuldade (~0,9s no 10).
  return Math.max(MIN_TIME_MS, Math.round(4500 - (eff - 1) * 400));
}

function correctAnswer(item: TrialItem): string {
  return item.rule === "COR" ? item.inkColor.name : item.word.name;
}

// ── Shared visual primitives ──────────────────────────────────────────────────

function GlassBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #020617 0%, #0f172a 35%, #1e1b4b 65%, #0c1220 100%)",
        }}
      />
      <div
        className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-[15%] right-[10%] w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute top-[25%] right-[20%] w-[280px] h-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
      {/* subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(10,16,34,0.82)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(148,163,184,0.1)",
  boxShadow:
    "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)",
};

function RuleBadge({ rule }: { rule: Rule }) {
  const isCor = rule === "COR";
  const accent = isCor ? "#60a5fa" : "#c084fc";
  const bgRgba = isCor ? "rgba(37,99,235,0.12)" : "rgba(139,92,246,0.12)";
  const borderRgba = isCor
    ? "rgba(96,165,250,0.35)"
    : "rgba(196,129,252,0.35)";
  const glowRgba = isCor
    ? "rgba(37,99,235,0.18)"
    : "rgba(139,92,246,0.22)";

  return (
    <motion.div
      key={rule}
      initial={{ scale: 0.84, opacity: 0, y: -6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 480, damping: 26 }}
      className="flex justify-center"
    >
      <div
        className="flex items-center gap-3 px-8 py-3 rounded-2xl"
        style={{
          background: bgRgba,
          border: `1.5px solid ${borderRgba}`,
          backdropFilter: "blur(12px)",
          boxShadow: `0 0 28px ${glowRgba}, inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          className="font-black tracking-[0.18em] text-lg"
          style={{ color: accent }}
        >
          {isCor ? "COR DA TINTA" : "PALAVRA ESCRITA"}
        </span>
      </div>
    </motion.div>
  );
}

function ColorButton({
  color,
  onClick,
  disabled = false,
  glow = false,
}: {
  color: (typeof COLORS)[number];
  onClick: () => void;
  disabled?: boolean;
  glow?: boolean;
}) {
  return (
    <motion.button
      onPointerDown={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-[0.12em] flex items-center justify-center gap-3 select-none touch-none"
      style={{
        background: glow
          ? `rgba(255,255,255,0.1)`
          : "rgba(255,255,255,0.055)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1.5px solid ${glow ? color.hex + "66" : color.hex + "28"}`,
        boxShadow: glow
          ? `0 0 22px ${color.hex}44, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 10px rgba(0,0,0,0.35)`,
        color: color.hex,
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: color.hex,
          boxShadow: `0 0 8px ${color.hex}99`,
          flexShrink: 0,
        }}
      />
      {color.name}
    </motion.button>
  );
}

// ── Tutorial step ─────────────────────────────────────────────────────────────

function TutorialStep({
  step,
  item,
  onNext,
}: {
  step: number;
  item: TrialItem;
  theme: Theme;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const expected = correctAnswer(item);
  const isCorrect = selected === expected;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GlassBg />

      <div className="w-full max-w-xl rounded-3xl p-6 space-y-5" style={CARD_STYLE}>
        {/* Header */}
        <div className="text-center space-y-1">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.2em]"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(203,213,225,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            EXEMPLO {step + 1} / {TUTORIAL_EXAMPLES.length}
          </span>
          <p className="text-sm text-slate-400 mt-2">
            Veja como funciona e tente responder
          </p>
        </div>

        {/* Rule badge */}
        <RuleBadge rule={item.rule} />

        {/* Explanation */}
        <div
          className="text-center text-xs px-4 py-3 rounded-xl text-slate-400 leading-relaxed"
          style={{
            background: "rgba(0,0,0,0.28)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {item.rule === "COR" ? (
            <>
              Quando aparecer{" "}
              <strong className="text-blue-300 tracking-wide">COR DA TINTA</strong>
              : clique na{" "}
              <strong className="text-white">cor usada para pintar</strong> a
              palavra.
            </>
          ) : (
            <>
              Quando aparecer{" "}
              <strong className="text-purple-300 tracking-wide">PALAVRA ESCRITA</strong>
              : clique na{" "}
              <strong className="text-white">palavra que está escrita</strong>,
              ignore a cor da tinta.
            </>
          )}
        </div>

        {/* The word */}
        <div
          className="text-center py-10 rounded-2xl relative"
          style={{
            background: "rgba(0,0,0,0.32)",
            border: `1.5px solid ${item.inkColor.hex}28`,
            boxShadow: `0 0 28px ${item.inkColor.hex}1a, inset 0 1px 0 rgba(255,255,255,0.04)`,
            overflow: "hidden",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <span
            className="relative font-black tracking-wide whitespace-nowrap"
            style={{
              fontSize: "clamp(36px, 10vw, 72px)",
              color: item.inkColor.hex,
              textShadow: `0 0 40px ${item.inkColor.hex}55, 0 2px 6px rgba(0,0,0,0.6)`,
            }}
          >
            {item.word.name}
          </span>
        </div>

        {/* Answer buttons or feedback */}
        {!selected ? (
          <div className="grid grid-cols-2 gap-2.5">
            {COLORS.map((color) => (
              <ColorButton
                key={color.name}
                color={color}
                onClick={() => setSelected(color.name)}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div
                className={`p-4 rounded-2xl text-center`}
                style={{
                  background: isCorrect
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(244,63,94,0.1)",
                  border: `1.5px solid ${isCorrect ? "rgba(74,222,128,0.3)" : "rgba(251,113,133,0.3)"}`,
                }}
              >
                <p
                  className="font-bold text-base tracking-wide"
                  style={{ color: isCorrect ? "#4ade80" : "#fb7185" }}
                >
                  {isCorrect ? "✓ Correto" : "✗ Quase lá"}
                </p>
                <p className="text-sm mt-1 text-slate-300">
                  {item.rule === "COR" ? (
                    isCorrect ? (
                      <>
                        A cor da tinta era{" "}
                        <strong style={{ color: item.inkColor.hex }}>
                          {item.inkColor.name}
                        </strong>
                        . Perfeito!
                      </>
                    ) : (
                      <>
                        A cor da tinta era{" "}
                        <strong style={{ color: item.inkColor.hex }}>
                          {item.inkColor.name}
                        </strong>
                        , não &quot;{selected}&quot;.
                      </>
                    )
                  ) : isCorrect ? (
                    <>
                      A palavra escrita era{" "}
                      <strong className="text-white">{item.word.name}</strong>.
                      Perfeito!
                    </>
                  ) : (
                    <>
                      A palavra escrita era{" "}
                      <strong className="text-white">{item.word.name}</strong>,
                      não &quot;{selected}&quot;.
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={onNext}
                className="w-full py-4 rounded-2xl font-black text-sm tracking-[0.12em] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))",
                  boxShadow:
                    "0 4px 24px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                  border: "1px solid rgba(165,180,252,0.25)",
                }}
              >
                {step < TUTORIAL_EXAMPLES.length - 1
                  ? "PRÓXIMO EXEMPLO →"
                  : "ENTENDI — COMEÇAR →"}
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Duração por nível do paciente (CASO ESPECIAL do Cores e Palavras) ──────────
// A duração da sessão cresce conforme o paciente evolui entre sessões (o difficulty
// reflete esse progresso). beginner 4 → standard 5 → intermediate 6 → advanced 7 min.
function stroopDurationMin(difficulty: number): number {
  if (difficulty <= 2) return 4;  // beginner
  if (difficulty <= 5) return 5;  // standard
  if (difficulty <= 8) return 6;  // intermediate
  return 7;                       // advanced
}

// ── Main exercise ─────────────────────────────────────────────────────────────

export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(stroopDurationMin(difficulty) * 60 * 1000);

  const [phase, setPhase] = useState<Phase>("tutorial");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [timeMs, setTimeMs] = useState(initialTimeMs(difficulty));
  const [intraStep, setIntraStep] = useState(0);
  const [trial, setTrial] = useState(0);
  const [item, setItem] = useState<TrialItem>(() => generateTrial(difficulty));
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [itemProgress, setItemProgress] = useState(100);
  const [done, setDone] = useState(false);

  const doneRef = useRef(false);
  const trialRef = useRef(0);
  const answeredRef = useRef(false);
  const itemStartRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());
  const intraStepRef = useRef(0);   // degrau de dificuldade dentro da sessão
  const consecRef = useRef(0);      // acertos seguidos para subir degrau

  trialRef.current = trial;

  function nextTutorialStep() {
    if (tutorialStep < TUTORIAL_EXAMPLES.length - 1) {
      setTutorialStep((s) => s + 1);
    } else {
      sessionStartRef.current = Date.now();
      begin();
      setPhase("active");
    }
  }

  function advanceTrial(correct: boolean, rt: number, currentTimeMs: number) {
    if (doneRef.current || answeredRef.current) return;
    answeredRef.current = true;

    const newResults = [...results, { correct, rt }];
    setResults(newResults);

    // Degraus: 2 acertos seguidos sobem 1; errar desce 1. A dificuldade efetiva
    // (base + degrau) determina pegadinhas, troca de regra e tempo.
    if (correct) {
      consecRef.current++;
      if (consecRef.current >= HITS_PER_STEP) {
        consecRef.current = 0;
        intraStepRef.current = Math.min(MAX_INTRA_STEP, intraStepRef.current + 1);
      }
    } else {
      consecRef.current = 0;
      intraStepRef.current = Math.max(0, intraStepRef.current - 1);
    }
    const eff = effLevel(difficulty, intraStepRef.current);
    const nextTime = initialTimeMs(eff);
    setIntraStep(intraStepRef.current);

    const nextTrial = trialRef.current + 1;

    if (isTimeUp()) {
      doneRef.current = true;
      setDone(true);
      finish();
      const accuracy = newResults.filter((r) => r.correct).length / Math.max(1, newResults.length);
      const avgRT = newResults.reduce((s, r) => s + r.rt, 0) / Math.max(1, newResults.length);
      const duration = elapsedSec();
      const score = calculateExerciseScore("stroop-task", accuracy, avgRT, difficulty);
      onComplete({
        exerciseId: "stroop-task", domain: "executive", score, accuracy,
        reactionTime: avgRT, difficulty, duration,
        metadata: { total: newResults.length, correct: newResults.filter((r) => r.correct).length, finalTimeMs: nextTime },
      });
    } else {
      setTimeMs(nextTime);
      setTrial(nextTrial);
      setItem(generateTrial(eff));
    }
  }

  useEffect(() => {
    if (phase !== "active" || doneRef.current) return;
    const myTrial = trial;
    const myTimeMs = timeMs;
    itemStartRef.current = Date.now();
    answeredRef.current = false;
    setItemProgress(100);

    const interval = setInterval(() => {
      if (doneRef.current || trialRef.current !== myTrial) { clearInterval(interval); return; }
      const elapsed = Date.now() - itemStartRef.current;
      const pct = Math.max(0, (1 - elapsed / myTimeMs) * 100);
      setItemProgress(pct);
      if (elapsed >= myTimeMs) {
        clearInterval(interval);
        if (trialRef.current === myTrial) advanceTrial(false, myTimeMs, myTimeMs);
      }
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, phase, done]);

  function handleAnswer(colorName: string) {
    if (doneRef.current || answeredRef.current || phase !== "active") return;
    const rt = Date.now() - itemStartRef.current;
    advanceTrial(colorName === correctAnswer(item), rt, timeMs);
  }

  if (phase === "tutorial") {
    return (
      <TutorialStep
        key={tutorialStep}
        step={tutorialStep}
        item={TUTORIAL_EXAMPLES[tutorialStep]}
        theme={theme}
        onNext={nextTutorialStep}
      />
    );
  }

  const timerIsLow = itemProgress < 25;
  const timerColor = timerIsLow ? "#F43F5E" : "#6366f1";
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GlassBg />

      <div className="w-full max-w-xl rounded-3xl p-6 space-y-5" style={CARD_STYLE}>

        {/* Score + ritmo + speed */}
        <div className="flex justify-between items-center gap-2">
          <span
            className="text-[11px] font-semibold tracking-widest"
            style={{ color: "rgba(148,163,184,0.55)" }}
          >
            {(Math.round(timeMs / 100) / 10).toFixed(1)}s / ITEM
          </span>
          <span
            className="text-xs font-bold tracking-tight"
            title="Ritmo (sobe a cada 2 acertos seguidos)"
            style={{ color: "#fbbf24" }}
          >
            ⚡{"▰".repeat(intraStep)}{"▱".repeat(MAX_INTRA_STEP - intraStep)}
          </span>
        </div>

        <ExerciseProgressBar progressPct={progressPct} theme={theme} />

        {/* Timer bar */}
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${itemProgress}%`,
              background: timerIsLow
                ? "linear-gradient(90deg, #f43f5e, #fb7185)"
                : "linear-gradient(90deg, #6366f1, #818cf8)",
              boxShadow: timerIsLow
                ? "0 0 8px rgba(244,63,94,0.6)"
                : "0 0 6px rgba(99,102,241,0.5)",
              transition: "width 0.05s linear, background 0.3s",
            }}
          />
        </div>

        {/* Rule badge */}
        <RuleBadge key={`rule-${trial}`} rule={item.rule} />

        {/* Sub-hint */}
        <p
          className="text-center text-[11px] tracking-[0.1em] font-medium"
          style={{ color: "rgba(148,163,184,0.45)" }}
        >
          {item.rule === "COR"
            ? "CLIQUE NA COR DA TINTA"
            : "CLIQUE NA PALAVRA ESCRITA"}
        </p>

        {/* Stroop word */}
        <motion.div
          key={`word-${trial}`}
          className="text-center py-10 rounded-2xl relative"
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.1, type: "spring", stiffness: 420, damping: 26 }}
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1.5px solid ${item.inkColor.hex}25`,
            boxShadow: `0 0 32px ${item.inkColor.hex}18, inset 0 1px 0 rgba(255,255,255,0.04)`,
            overflow: "hidden",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <span
            className="relative font-black tracking-wide select-none whitespace-nowrap"
            style={{
              fontSize: "clamp(40px, 9vw, 80px)",
              color: item.inkColor.hex,
              textShadow: `0 0 48px ${item.inkColor.hex}55, 0 2px 8px rgba(0,0,0,0.7)`,
              letterSpacing: "0.06em",
            }}
          >
            {item.word.name}
          </span>
        </motion.div>

        {/* Color buttons — 2×2 + 1 centered */}
        <div className="grid grid-cols-2 gap-2.5">
          {COLORS.slice(0, 4).map((color) => (
            <ColorButton
              key={color.name}
              color={color}
              onClick={() => handleAnswer(color.name)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-[calc(50%-5px)]">
            <ColorButton
              color={COLORS[4]}
              onClick={() => handleAnswer(COLORS[4].name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
