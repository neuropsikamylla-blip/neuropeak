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
  emoji: string;
  correctIndex: number;
}

// Sequences with ONE unambiguous correct order (no debatable steps)
const SEQUENCES: { name: string; emoji: string; steps: { label: string; emoji: string }[] }[] = [
  {
    name: "Enviar um e-mail",
    emoji: "📧",
    steps: [
      { label: "Abrir o computador", emoji: "💻" },
      { label: "Acessar o programa de e-mail", emoji: "📬" },
      { label: "Clicar em 'Novo e-mail'", emoji: "✉️" },
      { label: "Digitar o endereço do destinatário", emoji: "🖊️" },
      { label: "Escrever o assunto", emoji: "📝" },
      { label: "Escrever a mensagem", emoji: "💬" },
      { label: "Clicar em 'Enviar'", emoji: "🚀" },
    ],
  },
  {
    name: "Fazer suco de laranja",
    emoji: "🍊",
    steps: [
      { label: "Pegar as laranjas", emoji: "🍊" },
      { label: "Lavar as laranjas em água corrente", emoji: "🚿" },
      { label: "Cortar as laranjas ao meio", emoji: "🔪" },
      { label: "Espremer as laranjas", emoji: "🤏" },
      { label: "Coar o suco", emoji: "🧃" },
      { label: "Adicionar açúcar ao gosto", emoji: "🍬" },
      { label: "Servir no copo com gelo", emoji: "🥤" },
    ],
  },
  {
    name: "Cozinhar ovo mexido",
    emoji: "🍳",
    steps: [
      { label: "Pegar a frigideira", emoji: "🍳" },
      { label: "Ligar o fogão em fogo baixo", emoji: "🔥" },
      { label: "Derreter a manteiga na frigideira", emoji: "🧈" },
      { label: "Quebrar o ovo e despejar", emoji: "🥚" },
      { label: "Mexer o ovo com espátula", emoji: "🥄" },
      { label: "Desligar o fogão", emoji: "⛔" },
      { label: "Servir o ovo no prato", emoji: "🍽️" },
    ],
  },
  {
    name: "Abastecer o carro",
    emoji: "⛽",
    steps: [
      { label: "Parar o carro no posto", emoji: "🚗" },
      { label: "Desligar o motor", emoji: "🔑" },
      { label: "Abrir a tampa do tanque", emoji: "🔓" },
      { label: "Inserir a mangueira no tanque", emoji: "⛽" },
      { label: "Selecionar o combustível e abastecer", emoji: "💧" },
      { label: "Retirar a mangueira", emoji: "✅" },
      { label: "Fechar e travar a tampa do tanque", emoji: "🔒" },
    ],
  },
  {
    name: "Fazer uma ligação pelo celular",
    emoji: "📱",
    steps: [
      { label: "Pegar o celular", emoji: "📱" },
      { label: "Desbloquear a tela", emoji: "🔓" },
      { label: "Abrir o aplicativo de telefone", emoji: "📞" },
      { label: "Digitar ou procurar o número", emoji: "🔢" },
      { label: "Pressionar o botão de ligar", emoji: "📳" },
      { label: "Aguardar a pessoa atender", emoji: "⏳" },
      { label: "Falar e encerrar a chamada", emoji: "👋" },
    ],
  },
  {
    name: "Fritar batatas",
    emoji: "🍟",
    steps: [
      { label: "Descascar as batatas", emoji: "🥔" },
      { label: "Cortar em tiras finas", emoji: "🔪" },
      { label: "Aquecer o óleo na frigideira", emoji: "🫙" },
      { label: "Colocar as batatas no óleo quente", emoji: "🍟" },
      { label: "Aguardar dourar dos dois lados", emoji: "⏱️" },
      { label: "Retirar com escumadeira", emoji: "🥄" },
      { label: "Salgar as batatas", emoji: "🧂" },
    ],
  },
  {
    name: "Plantar uma semente",
    emoji: "🌱",
    steps: [
      { label: "Escolher o vaso adequado", emoji: "🪴" },
      { label: "Colocar pedras no fundo do vaso", emoji: "🪨" },
      { label: "Adicionar terra ao vaso", emoji: "🌍" },
      { label: "Fazer um buraco pequeno na terra", emoji: "☝️" },
      { label: "Depositar a semente no buraco", emoji: "🌰" },
      { label: "Cobrir a semente com terra", emoji: "🤲" },
      { label: "Regar com pouca água", emoji: "💧" },
    ],
  },
  {
    name: "Preparar um café coado",
    emoji: "☕",
    steps: [
      { label: "Ferver a água na chaleira", emoji: "🫖" },
      { label: "Encaixar o filtro no coador", emoji: "🔽" },
      { label: "Medir e colocar o pó de café", emoji: "☕" },
      { label: "Despejar a água quente aos poucos", emoji: "💧" },
      { label: "Aguardar coar completamente", emoji: "⏳" },
      { label: "Retirar o filtro com o pó usado", emoji: "🗑️" },
      { label: "Servir o café na xícara", emoji: "🍵" },
    ],
  },
  {
    name: "Trocar uma lâmpada",
    emoji: "💡",
    steps: [
      { label: "Desligar o interruptor da luz", emoji: "🔌" },
      { label: "Aguardar a lâmpada esfriar", emoji: "❄️" },
      { label: "Pegar a escada ou banquinho", emoji: "🪜" },
      { label: "Girar a lâmpada velha para retirar", emoji: "🔄" },
      { label: "Encaixar a lâmpada nova", emoji: "💡" },
      { label: "Descer da escada", emoji: "⬇️" },
      { label: "Ligar o interruptor para testar", emoji: "✅" },
    ],
  },
  {
    name: "Lavar a louça",
    emoji: "🍽️",
    steps: [
      { label: "Retirar restos de comida dos pratos", emoji: "🗑️" },
      { label: "Encher a pia com água e detergente", emoji: "🧴" },
      { label: "Deixar a louça de molho por 2 minutos", emoji: "⏳" },
      { label: "Esfregar cada peça com esponja", emoji: "🧽" },
      { label: "Enxaguar em água corrente", emoji: "🚿" },
      { label: "Secar com pano limpo", emoji: "🧣" },
      { label: "Guardar a louça no lugar certo", emoji: "🗄️" },
    ],
  },
];

const MAX_TRIALS = 20;
const MIN_STEPS = 3;
const MAX_STEPS = 7;

function initialSteps(difficulty: number) {
  return Math.min(Math.max(3, Math.floor(difficulty * 0.4) + 2), 5);
}

function buildTrial(stepCount: number) {
  const seq = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)];
  const steps = seq.steps.slice(0, stepCount);
  return {
    name: seq.name,
    taskEmoji: seq.emoji,
    steps: steps.map((s, i) => ({
      id: `step-${Math.random().toString(36).slice(2)}`,
      label: s.label,
      emoji: s.emoji,
      correctIndex: i,
    })),
  };
}

export function Sequenciamento({ difficulty, theme, onComplete }: SequenciamentoProps) {
  const reportProgress = useExerciseProgress();

  const [stepCount, setStepCount] = useState(initialSteps(difficulty));
  const [streak, setStreak] = useState(0);
  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<{ correct: boolean; steps: number }[]>([]);

  // Single state init — avoids name/steps mismatch from two separate buildTrial calls
  const [trialData, setTrialData] = useState(() => {
    const t = buildTrial(initialSteps(difficulty));
    return { ...t, items: shuffle([...t.steps]) };
  });
  const currentTrial = trialData;
  const items = trialData.items;
  function setItems(fn: (prev: Step[]) => Step[]) {
    setTrialData((prev) => ({ ...prev, items: fn(prev.items) }));
  }
  const [submitted, setSubmitted] = useState(false);
  const [resultAcc, setResultAcc] = useState(0);

  const startTime = useRef<number>(Date.now());

  // Fix: always use one buildTrial call, set both name+steps from it
  const startNewTrial = useCallback((nextStepCount: number) => {
    const t = buildTrial(nextStepCount);
    setTrialData({ ...t, items: shuffle([...t.steps]) });
    setSubmitted(false);
    setResultAcc(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    let correct = 0;
    trialData.items.forEach((item, idx) => {
      if (item.correctIndex === idx) correct++;
    });
    const acc = correct / stepCount;
    setResultAcc(acc);
    setSubmitted(true);

    const isCorrect = acc >= 0.8;
    const newTrialResults = [...trialResults, { correct: isCorrect, steps: stepCount }];
    setTrialResults(newTrialResults);

    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
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
          score, accuracy, difficulty, duration,
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

  const bg = theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-amber-50 to-orange-50" : "bg-gray-50";
  const card = theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg";
  const titleClass = theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-amber-700" : "text-gray-900";
  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-base ${titleClass}`}>📋 Sequenciamento</h2>
          <span className={`text-xs ${subClass}`}>{stepCount} passos</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < trialResults.length
                ? trialResults[i].correct ? "bg-green-500" : "bg-red-400"
                : i === trial ? "bg-blue-400 animate-pulse"
                : theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"
            }`} />
          ))}
        </div>

        {/* Task title */}
        <div className={`flex items-center gap-2 mb-1 px-3 py-2 rounded-xl ${
          theme === "GAMIFIED" ? "bg-gray-700/50" : "bg-gray-50 border border-gray-100"
        }`}>
          <span className="text-2xl">{currentTrial.taskEmoji}</span>
          <div>
            <p className={`font-bold text-sm ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
              {currentTrial.name}
            </p>
            <p className={`text-xs ${subClass}`}>Arraste para ordenar do 1º ao último passo</p>
          </div>
        </div>

        {/* Draggable steps */}
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-1.5 my-3">
          {items.map((item, idx) => {
            const isCorrect = submitted && item.correctIndex === idx;
            const isWrong = submitted && item.correctIndex !== idx;
            return (
              <Reorder.Item key={item.id} value={item} disabled={submitted}>
                <motion.div
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-colors ${
                    isCorrect ? "border-green-500 bg-green-50" :
                    isWrong   ? "border-red-400 bg-red-50" :
                    theme === "GAMIFIED"
                      ? "border-gray-600 bg-gray-700 cursor-grab active:cursor-grabbing"
                      : "border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-blue-300"
                  }`}
                  whileDrag={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 50 }}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    isCorrect ? "bg-green-500 text-white" :
                    isWrong ? "bg-red-400 text-white" :
                    theme === "GAMIFIED" ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>{idx + 1}</span>
                  <span className="text-lg flex-shrink-0">{item.emoji}</span>
                  <span className={`text-sm flex-1 ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                  {submitted && (
                    <span className="text-base ml-auto">{isCorrect ? "✅" : "❌"}</span>
                  )}
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className={`w-full h-11 rounded-xl font-bold text-white transition-colors ${
              theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Verificar sequência
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              className={`text-center p-3 rounded-xl border ${
                resultAcc >= 0.8 ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <p className={`font-bold ${resultAcc >= 0.8 ? "text-green-700" : "text-red-600"}`}>
                {resultAcc >= 0.8 ? "Correto! ✅" : "Incorreto ❌"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {Math.round(resultAcc * stepCount)}/{stepCount} na ordem certa
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
