"use client";

import { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
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
];

const STEP_COUNTS: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 4, 5: 5,
  6: 6, 7: 7, 8: 6, 9: 7, 10: 7,
};

export function Sequenciamento({ difficulty, theme, onComplete }: SequenciamentoProps) {
  const stepCount = STEP_COUNTS[difficulty] ?? 3;
  const [sequence] = useState(() => {
    const seq = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)];
    const steps = seq.steps.slice(0, stepCount);
    return {
      name: seq.name,
      steps: steps.map((label, i) => ({
        id: `step-${i}`,
        label,
        correctIndex: i,
      })),
    };
  });

  const [items, setItems] = useState<Step[]>(() => shuffle([...sequence.steps]));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const startTime = useRef<number>(Date.now());

  function handleSubmit() {
    let correct = 0;
    items.forEach((item, idx) => {
      if (item.correctIndex === idx) correct++;
    });
    const acc = correct / stepCount;
    setAccuracy(acc);
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const s = calculateExerciseScore("sequenciamento", acc, undefined, difficulty);
    setScore(s);
    setSubmitted(true);

    setTimeout(() => {
      onComplete({
        exerciseId: "sequenciamento",
        domain: "executive",
        score: s,
        accuracy: acc,
        difficulty,
        duration,
        metadata: { stepCount, correct },
      });
    }, 2000);
  }

  const bgClass = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gray-50";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bgClass}`}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg"}`}>
        <h2 className={`font-bold text-lg mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-gray-900"}`}>
          Sequenciamento
        </h2>
        <p className={`text-sm mb-2 font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
          Tarefa: {sequence.name}
        </p>
        <p className={`text-xs mb-6 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
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
          <Button
            className={`w-full h-12 font-bold ${theme === "GAMIFIED" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            onClick={handleSubmit}
          >
            Verificar Sequência
          </Button>
        ) : (
          <motion.div
            className={`text-center p-4 rounded-xl ${accuracy >= 0.8 ? "bg-green-50 border border-green-300" : "bg-orange-50 border border-orange-300"}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="font-bold text-lg">
              {Math.round(accuracy * 100)}% correto
            </p>
            <p className="text-sm text-gray-600">
              {Math.round(accuracy * stepCount)}/{stepCount} passos na ordem certa
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
