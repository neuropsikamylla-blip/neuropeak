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

const MAX_TRIALS = 20;

// Grid size by difficulty
function getGridSize(difficulty: number): number {
  if (difficulty <= 2) return 8;
  if (difficulty <= 4) return 12;
  if (difficulty <= 7) return 16;
  return 20;
}

interface WordGroup {
  target: string;
  distractors: string[];
}

const WORD_GROUPS: WordGroup[] = [
  { target: "MARIA", distractors: ["MARIO", "MARA", "MARINA", "MARISA", "MARCIA", "MARCO", "MARICA", "MARIANA"] },
  { target: "JOSE", distractors: ["JOAO", "JOEL", "JOSEFA", "JOSIAS", "JORGE", "JONAS", "JOSIANE", "JOSIANE"] },
  { target: "PEDRO", distractors: ["PAULO", "PETRA", "PEDROSA", "PIERRE", "PEDRA", "PEDER", "PADRÃO", "PEDRAS"] },
  { target: "ANA", distractors: ["ANO", "ANNA", "ANITA", "ANEL", "ANJO", "ANTES", "ANAL", "ANDAR"] },
  { target: "LUCAS", distractors: ["LUCA", "LUCIO", "LUCIANA", "LUIZ", "LUCIA", "LUCIANO", "LUCENA", "LUCCA"] },
  { target: "CARLOS", distractors: ["CARLA", "CAROL", "CARLSON", "CARLITO", "CAROLE", "CARMO", "CARLOTA", "CARLÃO"] },
  { target: "REMÉDIO", distractors: ["REMÉDIOS", "REMOTO", "MÉDICO", "MEMÓRIA", "REMESSA", "RETIRO", "REGIME", "RECADO"] },
  { target: "ÔNIBUS", distractors: ["ÓCULOS", "ÓPTICA", "ÂNCORA", "ÔNIX", "ÓBVIO", "ÚNICO", "ÍNDICE", "ÂMBITO"] },
  { target: "LARANJA", distractors: ["LARANJAL", "LARANJEIRA", "LARANJADA", "LORENA", "LARVA", "LARAN", "LARANJAS", "LARANJAI"] },
  { target: "SAPATO", distractors: ["SALATO", "SAPATA", "SAPATOS", "SABATO", "SAPÃO", "SAVATO", "SAPINO", "SAPATÃO"] },
  { target: "ESCOLA", distractors: ["ESCOVA", "ESCOLTA", "ESCORE", "ESCORA", "ESCOL", "ESCOLAR", "ESCOLHA", "ESCURO"] },
  { target: "LIVRO", distractors: ["LÍVIDO", "LIVROS", "LIVRE", "LIBRA", "LICRO", "LIVOR", "LUBRO", "LIBOR"] },
];

function buildGrid(group: WordGroup, gridSize: number): { words: string[]; targetIndex: number } {
  const targetIndex = Math.floor(Math.random() * gridSize);
  const words: string[] = [];
  const pool = [...group.distractors];

  for (let i = 0; i < gridSize; i++) {
    if (i === targetIndex) {
      words.push(group.target);
    } else {
      if (pool.length === 0) {
        // Re-shuffle distractors if we run out
        pool.push(...group.distractors);
      }
      const distIdx = Math.floor(Math.random() * pool.length);
      words.push(pool[distIdx]);
      pool.splice(distIdx, 1);
    }
  }

  return { words, targetIndex };
}

// ── Tutorial sub-components ────────────────────────────────────────────────

function SeletivaIntroStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  const targetBg = theme === "GAMIFIED" ? "bg-cyan-600" : "bg-blue-100 border-2 border-blue-400";
  const targetText = theme === "GAMIFIED" ? "text-white" : "text-blue-700";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`px-6 py-3 rounded-xl ${targetBg}`}>
        <p className={`text-xs font-semibold opacity-70 ${targetText}`}>Encontre esta palavra:</p>
        <p className={`text-3xl font-black tracking-widest text-center ${targetText}`}>MARIA</p>
      </div>
      <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>← Este é o alvo!</p>
    </div>
  );
}

function TutorialShowGrid({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const sampleGroup = WORD_GROUPS[0];
  const { words, targetIndex } = buildGrid(sampleGroup, 8);
  const [selected, setSelected] = useState<number | null>(null);

  function handleTap(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(onDone, 600);
  }

  const bg = theme === "GAMIFIED" ? "bg-gray-900" : "bg-gray-50";
  const targetBg = theme === "GAMIFIED" ? "bg-cyan-600" : "bg-blue-100 border-2 border-blue-400";
  const targetText = theme === "GAMIFIED" ? "text-white" : "text-blue-700";
  const wordBg = theme === "GAMIFIED" ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-300";
  const wordText = theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`px-4 py-2 rounded-xl ${targetBg}`}>
        <p className={`text-xs font-semibold mb-0.5 opacity-70 ${targetText}`}>Encontre:</p>
        <p className={`text-xl font-black tracking-widest ${targetText}`}>{sampleGroup.target}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {words.map((word, i) => {
          const isTarget = i === targetIndex;
          const isSelected = selected === i;
          const correct = isSelected && isTarget;
          const wrong = isSelected && !isTarget;
          return (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileTap={{ scale: 0.9 }}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-colors ${
                correct ? "bg-green-500 text-white" :
                wrong ? "bg-red-400 text-white" :
                isTarget && selected !== null ? "bg-green-300 text-green-900" :
                isSelected ? "bg-gray-400 text-white" :
                wordBg + " " + wordText
              }`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>
      <p className={`text-xs ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>Toque na palavra correta!</p>
    </div>
  );
}

function AtencaoSeletivaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Uma palavra ALVO aparece no topo. Você deve encontrá-la na grade abaixo.",
      content: (onStepDone: () => void) => <SeletivaIntroStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Toque a palavra alvo entre as distractoras. Seja rápido e preciso!",
      content: (onStepDone: () => void) => <TutorialShowGrid theme={theme} onDone={onStepDone} />,
    },
  ];
  return <TutorialBase theme={theme} title="Atenção Seletiva" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function AtencaoSeletiva({ difficulty, theme, onComplete }: AtencaoSeletivaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();
  const gridSize = getGridSize(difficulty);

  // Pre-generate all trials
  const [trials] = useState(() =>
    Array.from({ length: MAX_TRIALS }, (_, i) => {
      const group = WORD_GROUPS[i % WORD_GROUPS.length];
      return { group, ...buildGrid(group, gridSize) };
    })
  );

  const [trialIndex, setTrialIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  const startTime = useRef(Date.now());
  const reactionTimes = useRef<number[]>([]);
  const trialStart = useRef(Date.now());

  useEffect(() => {
    if (!showTutorial) {
      startTime.current = Date.now();
      trialStart.current = Date.now();
    }
  }, [showTutorial]);

  useEffect(() => {
    if (trialIndex > 0) {
      reportProgress(Math.round((trialIndex / MAX_TRIALS) * 100));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);

  useEffect(() => {
    if (!done) return;
    const correct = results.filter(Boolean).length;
    const accuracy = correct / MAX_TRIALS;
    const avgRT = reactionTimes.current.length > 0
      ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
      : 1500;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const score = calculateExerciseScore("atencao-seletiva", accuracy, avgRT, difficulty);
    onComplete({
      exerciseId: "atencao-seletiva",
      domain: "attention",
      score,
      accuracy,
      reactionTime: avgRT,
      difficulty,
      duration,
      metadata: { correct, total: MAX_TRIALS, gridSize },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleWordTap(wordIndex: number) {
    if (locked || done || trialIndex >= MAX_TRIALS) return;
    const trial = trials[trialIndex];
    const isCorrect = wordIndex === trial.targetIndex;
    const rt = Date.now() - trialStart.current;
    reactionTimes.current.push(rt);
    setFeedback({ index: wordIndex, correct: isCorrect });
    setLocked(true);

    const delay = isCorrect ? 600 : 1000;
    setTimeout(() => {
      const newResults = [...results, isCorrect];
      setResults(newResults);
      setFeedback(null);
      setLocked(false);
      if (trialIndex + 1 >= MAX_TRIALS) {
        setDone(true);
      } else {
        setTrialIndex((t) => t + 1);
        trialStart.current = Date.now();
      }
    }, delay);
  }

  if (showTutorial) {
    return <AtencaoSeletivaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  const trial = trials[Math.min(trialIndex, MAX_TRIALS - 1)];
  const progress = (trialIndex / MAX_TRIALS) * 100;
  const correct = results.filter(Boolean).length;

  const bgClass = theme === "GAMIFIED"
    ? "bg-gray-950"
    : theme === "COLORFUL"
    ? "bg-gradient-to-br from-violet-50 to-blue-50"
    : "bg-gray-50";

  const cardClass = theme === "GAMIFIED"
    ? "bg-gray-800 border border-cyan-500/30"
    : "bg-white shadow-lg";

  const targetBg = theme === "GAMIFIED"
    ? "bg-cyan-900/60 border border-cyan-500/50"
    : theme === "COLORFUL"
    ? "bg-violet-100 border-2 border-violet-400"
    : "bg-blue-50 border-2 border-blue-300";

  const targetText = theme === "GAMIFIED"
    ? "text-cyan-300"
    : theme === "COLORFUL"
    ? "text-violet-700"
    : "text-blue-700";

  const gridCols = gridSize > 16 ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-sm rounded-2xl p-5 ${cardClass}`}>
        {/* Header */}
        <div className="flex justify-between text-sm mb-3">
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-green-400" : "text-green-600"}`}>
            ✓ {correct}
          </span>
          <span className={theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}>
            {trialIndex}/{MAX_TRIALS}
          </span>
          <span className={`font-bold ${theme === "GAMIFIED" ? "text-red-400" : "text-red-500"}`}>
            ✗ {results.filter((r) => !r).length}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
          <motion.div
            className={`h-full rounded-full ${
              theme === "GAMIFIED" ? "bg-cyan-500" :
              theme === "COLORFUL" ? "bg-violet-500" : "bg-blue-500"
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress dots */}
        <div className="flex flex-wrap gap-1 mb-4">
          {results.map((r, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${r ? "bg-green-500" : "bg-red-400"}`}
            />
          ))}
          {Array.from({ length: MAX_TRIALS - results.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`w-3 h-3 rounded-full ${
                theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Target word */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trialIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-3 mb-4 text-center ${targetBg}`}
          >
            <p className={`text-xs font-semibold mb-1 opacity-70 ${targetText}`}>Encontre:</p>
            <p className={`text-2xl font-black tracking-widest ${targetText}`}>
              {trial.group.target}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Word grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trialIndex}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`grid ${gridCols} gap-2`}
          >
            {trial.words.map((word, i) => {
              const isSelected = feedback?.index === i;
              const isCorrect = isSelected && feedback?.correct;
              const isWrong = isSelected && !feedback?.correct;
              const isHighlightedCorrect = !feedback?.correct && feedback !== null && i === trial.targetIndex;

              let btnClass = "";
              if (isCorrect) {
                btnClass = "bg-green-500 text-white border-green-600";
              } else if (isWrong) {
                btnClass = "bg-red-400 text-white border-red-500";
              } else if (isHighlightedCorrect) {
                btnClass = "bg-green-300 text-green-900 border-green-400";
              } else if (theme === "GAMIFIED") {
                btnClass = "bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600";
              } else if (theme === "COLORFUL") {
                btnClass = "bg-violet-50 border border-violet-200 text-violet-900 hover:bg-violet-100";
              } else {
                btnClass = "bg-gray-50 border border-gray-300 text-gray-800 hover:bg-gray-100";
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleWordTap(i)}
                  whileTap={{ scale: 0.92 }}
                  disabled={locked}
                  className={`py-2.5 px-1 rounded-lg text-xs font-bold transition-colors ${btnClass}`}
                >
                  {word}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
