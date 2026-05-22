"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface MatrizEspacialProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  alwaysReverse?: boolean;
}

type Phase = "showing" | "recall" | "feedback";

const MAX_TRIALS = 20;
const MIN_SEQ = 2;
const MAX_SEQ = 9;
const GRID = 4; // 4×4 sempre

// Dificuldade 6-10: modo inverso (clica na ordem reversa)
const REVERSE_MODE = (difficulty: number) => difficulty >= 6;

// Ponto de partida: dificuldade 1 → 2 células, dificuldade 5 → 4, dificuldade 10 → 6
function initialSeq(difficulty: number) {
  return Math.min(Math.max(2, Math.floor(difficulty * 0.5) + 1), 5);
}

// Tutorial cells: indices in a 4x4 grid
const TSEQ_DIRECT = [4, 12]; // cells 5 and 13 (0-indexed: 4 and 12)
const TSEQ_INVERSE = [2, 9]; // cells 3 and 10 (0-indexed: 2 and 9)

function MatrizTutorialGrid({
  theme,
  seq,
  expectedOrder,
  onDone,
  showOnly,
}: {
  theme: Theme;
  seq: number[];
  expectedOrder: number[];
  onDone: () => void;
  showOnly?: boolean;
}) {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number[]>([]);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [showDone, setShowDone] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!showOnly) return;
    let cancelled = false;
    async function run() {
      for (const cell of seq) {
        if (cancelled) return;
        await new Promise<void>((r) => setTimeout(r, 400));
        if (cancelled) return;
        setActiveCell(cell);
        await new Promise<void>((r) => setTimeout(r, 600));
        if (cancelled) return;
        setActiveCell(null);
      }
      await new Promise<void>((r) => setTimeout(r, 300));
      if (!cancelled) { setShowDone(true); onDone(); }
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(idx: number) {
    if (done.current || showOnly) return;
    const next = clicked.length;
    if (idx === expectedOrder[next]) {
      const newClicked = [...clicked, idx];
      setClicked(newClicked);
      setFlash("green");
      setTimeout(() => setFlash(null), 300);
      if (newClicked.length === expectedOrder.length) {
        done.current = true;
        setTimeout(onDone, 400);
      }
    } else {
      setFlash("red");
      setTimeout(() => { setFlash(null); setClicked([]); }, 400);
    }
  }

  function cellStyle(idx: number) {
    const isActive = activeCell === idx;
    const isClicked = clicked.includes(idx);
    const isSeqCell = seq.includes(idx);

    if (isActive || (showOnly && isSeqCell && showDone)) {
      return theme === "GAMIFIED"
        ? "bg-cyan-500 border-cyan-300"
        : theme === "COLORFUL"
        ? "bg-purple-500 border-purple-300"
        : "bg-blue-500 border-blue-300";
    }
    if (isClicked && flash === "green") return "bg-green-400 border-green-600";
    if (isClicked) return theme === "GAMIFIED" ? "bg-cyan-700 border-cyan-500" : "bg-blue-300 border-blue-500";
    return theme === "GAMIFIED"
      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
      : theme === "COLORFUL"
      ? "bg-purple-50 border-purple-200 hover:bg-purple-100"
      : "bg-gray-100 border-gray-300 hover:bg-gray-200";
  }

  const ringClass = flash === "green" ? "ring-2 ring-green-400" : flash === "red" ? "ring-2 ring-red-400" : "";

  return (
    <div className={`grid gap-1.5 mx-auto rounded-xl ${ringClass}`} style={{ gridTemplateColumns: "repeat(4, 1fr)", maxWidth: "220px" }}>
      {Array.from({ length: 16 }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => handleClick(idx)}
          disabled={showOnly || done.current}
          className={`aspect-square rounded-lg border-2 transition-colors ${cellStyle(idx)}`}
        />
      ))}
    </div>
  );
}

function MatrizEspacialTutorial({ theme, reverse, onDone }: { theme: Theme; reverse: boolean; onDone: () => void }) {
  const seq = reverse ? TSEQ_INVERSE : TSEQ_DIRECT;
  const answerOrder = reverse ? [...seq].reverse() : seq;

  const steps = [
    {
      instruction: reverse
        ? "Células vão acender em sequência. Você vai responder em ORDEM INVERSA!"
        : "Células vão acender em sequência. Preste atenção na ordem!",
      content: (onStepDone: () => void) => (
        <MatrizTutorialGrid theme={theme} seq={seq} expectedOrder={answerOrder} onDone={onStepDone} showOnly />
      ),
    },
    {
      instruction: reverse
        ? "Acendeu posição 1 depois posição 2. Clique: posição 2, depois posição 1"
        : "Agora clique nas mesmas células na mesma ordem",
      content: (onStepDone: () => void) => (
        <MatrizTutorialGrid theme={theme} seq={seq} expectedOrder={answerOrder} onDone={onStepDone} />
      ),
    },
  ];

  return (
    <TutorialBase
      theme={theme}
      title={reverse ? "Matriz Espacial Inversa" : "Matriz Espacial"}
      steps={steps}
      onDone={onDone}
    />
  );
}

export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }: MatrizEspacialProps) {
  const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);
  const [showTutorial, setShowTutorial] = useState(true);
  const [seqLength, setSeqLength] = useState(initialSeq(difficulty));
  const [streak, setStreak] = useState(0); // positivo = acertos seguidos, negativo = erros
  const [phase, setPhase] = useState<Phase>("showing");
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [trial, setTrial] = useState(0);
  const [attempts, setAttempts] = useState<{ correct: boolean; seqLen: number }[]>([]);
  const [feedbackData, setFeedbackData] = useState<{ correct: boolean; userSeq: number[] } | null>(null);
  const startTime = useRef<number>(Date.now());
  const reportProgress = useExerciseProgress();

  const generateSeq = useCallback((len: number) => {
    const cells = new Set<number>();
    while (cells.size < len) cells.add(Math.floor(Math.random() * GRID * GRID));
    return Array.from(cells);
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setPhase("showing");
    setActiveCell(null);
    setUserSeq([]);

    for (const cell of seq) {
      await new Promise<void>((r) => setTimeout(r, 350));
      setActiveCell(cell);
      await new Promise<void>((r) => setTimeout(r, 750));
      setActiveCell(null);
    }

    await new Promise<void>((r) => setTimeout(r, 500));
    setPhase("recall");
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showTutorial) return;
    const seq = generateSeq(seqLength);
    setSequence(seq);
    showSequence(seq);
  }, [trial, showTutorial]);

  function handleCellClick(idx: number) {
    if (phase !== "recall" || userSeq.includes(idx)) return;

    const newSeq = [...userSeq, idx];
    setUserSeq(newSeq);

    if (newSeq.length < seqLength) return; // ainda esperando mais cliques

    // Avalia: na ordem direta ou inversa conforme modo
    const expected = reverse ? [...sequence].reverse() : sequence;
    const correct = newSeq.every((cell, i) => cell === expected[i]);

    setFeedbackData({ correct, userSeq: newSeq });
    setPhase("feedback");

    const newAttempts = [...attempts, { correct, seqLen: seqLength }];
    setAttempts(newAttempts);

    // Escada 2-cima / 2-baixo
    const newStreak = correct
      ? Math.max(streak, 0) + 1   // acerto: incrementa streak positivo
      : Math.min(streak, 0) - 1;  // erro: incrementa streak negativo

    let nextSeqLen = seqLength;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextSeqLen = Math.min(seqLength + 1, MAX_SEQ); nextStreak = 0; }
    if (newStreak <= -2) { nextSeqLen = Math.max(seqLength - 1, MIN_SEQ); nextStreak = 0; }

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const accuracy = newAttempts.filter((a) => a.correct).length / MAX_TRIALS;
        const maxSeq = Math.max(...newAttempts.map((a) => a.seqLen));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("matriz-espacial", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "matriz-espacial",
          domain: "memory",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { gridSize: GRID, seqLength: maxSeq, reverse, trials: MAX_TRIALS, correct: newAttempts.filter((a) => a.correct).length },
        });
      } else {
        setFeedbackData(null);
        setStreak(nextStreak);
        setSeqLength(nextSeqLen);
        setTrial(nextTrial);
      }
    }, 1800);
  }

  if (showTutorial) {
    return <MatrizEspacialTutorial theme={theme} reverse={reverse} onDone={() => setShowTutorial(false)} />;
  }

  // ─── Estilos por tema ────────────────────────────────────────────────
  const bg = { CLINICAL: "bg-gray-50", COLORFUL: "bg-gradient-to-br from-purple-50 to-pink-50", GAMIFIED: "bg-gray-950" }[theme];
  const card = { CLINICAL: "bg-white shadow-lg", COLORFUL: "bg-white shadow-lg", GAMIFIED: "bg-gray-800 border border-cyan-500/30" }[theme];
  const title = { CLINICAL: "text-gray-900", COLORFUL: "text-purple-700", GAMIFIED: "text-cyan-400" }[theme];
  const sub = { CLINICAL: "text-gray-500", COLORFUL: "text-purple-500", GAMIFIED: "text-gray-400" }[theme];

  function cellStyle(idx: number) {
    const isActive = activeCell === idx;
    const isUserSelected = userSeq.includes(idx);
    const isInSeq = sequence.includes(idx);

    if (phase === "feedback" && feedbackData) {
      const posInUser = feedbackData.userSeq.indexOf(idx);
      const posInSeq = sequence.indexOf(idx);
      if (posInUser !== -1 && posInSeq !== -1 && posInUser === posInSeq) {
        return "bg-green-400 border-green-600"; // posição correta
      }
      if (isInSeq) return "bg-amber-300 border-amber-500"; // célula certa, ordem errada
      if (isUserSelected) return "bg-red-300 border-red-500"; // célula errada
    }

    if (isActive) {
      return theme === "GAMIFIED"
        ? "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
        : theme === "COLORFUL"
        ? "bg-purple-500 border-purple-300"
        : "bg-blue-500 border-blue-300";
    }
    if (isUserSelected && phase === "recall") {
      return theme === "GAMIFIED"
        ? "bg-cyan-700 border-cyan-500"
        : theme === "COLORFUL"
        ? "bg-purple-300 border-purple-500"
        : "bg-blue-300 border-blue-500";
    }
    return theme === "GAMIFIED"
      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
      : theme === "COLORFUL"
      ? "bg-purple-50 border-purple-200 hover:bg-purple-100"
      : "bg-gray-100 border-gray-300 hover:bg-gray-200";
  }

  const nextSeqDisplay = feedbackData?.correct
    ? Math.min(seqLength + (streak + 1 >= 2 ? 1 : 0), MAX_SEQ)
    : Math.max(seqLength + (streak - 1 <= -2 ? -1 : 0), MIN_SEQ);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-sm rounded-2xl p-6 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className={`font-bold text-base ${title}`}>
              Matriz Espacial{reverse ? " — Inversa" : ""}
            </h2>
            <p className={`text-xs ${sub}`}>
              {seqLength} célula{seqLength > 1 ? "s" : ""}
              {reverse ? " · clique ao contrário" : ""}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < attempts.length
                  ? attempts[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Instrução */}
        <p className={`text-sm text-center mb-4 min-h-[20px] ${sub}`}>
          {phase === "showing" && (reverse ? "Observe a sequência... clique ao contrário!" : "Observe a sequência...")}
          {phase === "recall" && (reverse
            ? `Toque as ${seqLength} células em ORDEM INVERSA (última → primeira)`
            : `Toque as ${seqLength} células na mesma ordem`)}
          {phase === "feedback" && (feedbackData?.correct ? "Correto! ✅" : "Incorreto ❌")}
        </p>

        {/* Grid 4×4 */}
        <div
          className="grid gap-2 mx-auto mb-4"
          style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, maxWidth: "280px" }}
        >
          {Array.from({ length: GRID * GRID }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== "recall" || userSeq.includes(idx)}
              className={`aspect-square rounded-xl border-2 transition-colors ${cellStyle(idx)}`}
              whileTap={phase === "recall" ? { scale: 0.9 } : {}}
              animate={activeCell === idx ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        {/* Indicador de posição durante recall */}
        {phase === "recall" && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: seqLength }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < userSeq.length
                    ? theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-purple-500" : "bg-blue-500"
                    : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {phase === "feedback" && feedbackData && (
            <motion.div
              className="text-center mt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className={`text-sm font-semibold ${feedbackData.correct ? "text-green-600" : "text-red-500"}`}>
                {feedbackData.correct ? "Correto! ✅" : "Incorreto ❌"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
