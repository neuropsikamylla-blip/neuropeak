"use client";

import { useState, useRef, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface SequenciamentoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Step {
  id: string;
  label: string;
  correctIndex: number;
}

const SEQUENCES = [
  {
    name: "Fazer um bolo",
    steps: [
      "Reunir os ingredientes",
      "Misturar os ingredientes",
      "Untar a forma",
      "Colocar a massa na forma",
      "Assar no forno",
      "Deixar esfriar",
      "Decorar o bolo",
    ],
  },
  {
    name: "Plantar uma flor",
    steps: [
      "Escolher o vaso",
      "Colocar terra no vaso",
      "Fazer um buraco na terra",
      "Colocar a muda",
      "Cobrir as raízes com terra",
      "Regar a planta",
      "Colocar em lugar com luz",
    ],
  },
  {
    name: "Lavar o carro",
    steps: [
      "Juntar os materiais",
      "Molhar o carro com água",
      "Aplicar o sabão",
      "Esfregar com esponja",
      "Enxaguar com água",
      "Secar com pano macio",
      "Aplicar cera protetora",
    ],
  },
  {
    name: "Preparar um café",
    steps: [
      "Ferver a água",
      "Colocar o filtro",
      "Adicionar o pó de café",
      "Despejar a água quente",
      "Aguardar coar",
      "Adicionar açúcar a gosto",
      "Servir na xícara",
    ],
  },
  {
    name: "Escovar os dentes",
    steps: [
      "Pegar a escova",
      "Colocar pasta de dente",
      "Molhar a escova",
      "Escovar os dentes",
      "Enxaguar a boca",
      "Lavar a escova",
      "Guardar a escova",
    ],
  },
];

const MAX_TRIALS = 20;
const MIN_STEPS = 3;
const MAX_STEPS = 7;

function initialSteps(difficulty: number) {
  return Math.min(Math.max(3, Math.floor(difficulty * 0.4) + 2), 5);
}

function buildSequence(stepCount: number): { name: string; steps: Step[] } {
  const seq = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)];
  const steps = seq.steps.slice(0, stepCount);
  return {
    name: seq.name,
    steps: steps.map((label, i) => ({
      id: `step-${Math.random().toString(36).slice(2)}`,
      label,
      correctIndex: i,
    })),
  };
}

export function Sequenciamento({ difficulty, theme, onComplete }: SequenciamentoProps) {
  const reportProgress = useExerciseProgress();

  // Adaptive state
  const [stepCount, setStepCount] = useState(initialSteps(difficulty));
  const [streak, setStreak] = useState(0);
  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<{ correct: boolean; steps: number }[]>([]);

  // Round state
  const [sequence, setSequence] = useState(() => buildSequence(initialSteps(difficulty)));
  const [items, setItems] = useState<Step[]>(() => {
    const seq = buildSequence(initialSteps(difficulty));
    return shuffle([...seq.steps]);
  });
  const [submitted, setSubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  const startTime = useRef<number>(Date.now());

  const startNewTrial = useCallback((nextStepCount: number) => {
    const newSeq = buildSequence(nextStepCount);
    setSequence(newSeq);
    setItems(shuffle([...newSeq.steps]));
    setSubmitted(false);
    setAccuracy(0);
  }, []);

  function handleSubmit() {
    let correct = 0;
    items.forEach((item, idx) => {
      if (item.correctIndex === idx) correct++;
    });
    const acc = correct / stepCount;
    setAccuracy(acc);
    setSubmitted(true);

    const isCorrect = acc >= 0.8;
    const newTrialResults = [...trialResults, { correct: isCorrect, steps: stepCount }];
    setTrialResults(newTrialResults);

    // 2-up/2-down staircase on step count
    const newStreak = isCorrect
      ? Math.max(streak, 0) + 1
      : Math.min(streak, 0) - 1;
    let nextSteps = stepCount;
    let nextStreak = newStreak;
    if (newStreak >= 2) { nextSteps = Math.min(stepCount + 1, MAX_STEPS); nextStreak = 0; }
    if (newStreak <= -2) { nextSteps = Math.max(stepCount - 1, MIN_STEPS); nextStreak = 0; }

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const accuracy = newTrialResults.filter((r) => r.correct).length / MAX_TRIALS;
        const maxSteps = Math.max(...newTrialResults.map((r) => r.steps));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("sequenciamento", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "sequenciamento",
          domain: "executive",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { trials: MAX_TRIALS, maxSteps, correct: newTrialResults.filter((r) => r.correct).length },
        });
      } else {
        setTrial(nextTrial);
        setStreak(nextStreak);
        setStepCount(nextSteps);
        startNewTrial(nextSteps);
      }
    }, 1800);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gray-50";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`font-bold text-lg ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
              Sequenciamento
            </h2>
            <p className={`text-xs ${subClass}`}>{stepCount} passos</p>
          </div>
          <span className={`text-sm ${subClass}`}>{trial + 1}/{MAX_TRIALS}</span>
        </div>

        {/* Barra de progresso */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < trialResults.length
                  ? trialResults[i].correct ? "bg-green-500" : "bg-red-400"
                  : i === trial
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className={`text-sm mb-1 font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
          Tarefa: {sequence.name}
        </p>
        <p className={`text-xs mb-4 ${subClass}`}>
          Arraste os passos para a ordem correta:
        </p>

        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2 mb-6">
          {items.map((item, idx) => {
            let itemStyle = "";
            if (submitted) {
              itemStyle = item.correctIndex === idx
                ? "border-green-500 bg-green-50"
                : "border-red-400 bg-red-50";
            } else {
              itemStyle = theme === "GAMIFIED"
                ? "border-gray-600 bg-gray-700 cursor-grab active:cursor-grabbing"
                : "border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-blue-300 hover:bg-blue-50";
            }

            return (
              <Reorder.Item key={item.id} value={item} disabled={submitted}>
                <motion.div
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${itemStyle}`}
                  whileDrag={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${theme === "GAMIFIED" ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                    {idx + 1}
                  </span>
                  <span className={`text-sm ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                  {submitted && (
                    <span className="ml-auto text-lg">
                      {item.correctIndex === idx ? "✅" : "❌"}
                    </span>
                  )}
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {!submitted ? (
          <button
            className={`w-full h-12 rounded-xl font-bold text-white transition-colors ${theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={handleSubmit}
          >
            Verificar Sequência
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              className={`text-center p-4 rounded-xl ${accuracy >= 0.8 ? "bg-green-50 border border-green-300" : "bg-orange-50 border border-orange-300"}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <p className="font-bold text-lg">
                {accuracy >= 0.8 ? "Correto! ✅" : "Incorreto ❌"}
              </p>
              <p className="text-sm text-gray-600">
                {Math.round(accuracy * stepCount)}/{stepCount} passos na ordem certa
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
