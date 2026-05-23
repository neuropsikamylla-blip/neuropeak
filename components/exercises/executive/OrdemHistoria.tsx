"use client";

import { useState, useRef, useCallback } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface OrdemHistoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Panel {
  id: string;
  emoji: string;
  label: string;
  correctIndex: number;
}

// ---------------------------------------------------------------------------
// Story data — 12 stories, each with exactly 4 panels in correct order
// ---------------------------------------------------------------------------
const STORIES: { name: string; emoji: string; panels: { emoji: string; label: string }[] }[] = [
  {
    name: "Manhã em casa",
    emoji: "🌅",
    panels: [
      { emoji: "⏰", label: "O despertador toca" },
      { emoji: "🚿", label: "Tomar banho" },
      { emoji: "☕", label: "Tomar café da manhã" },
      { emoji: "🚪", label: "Sair de casa" },
    ],
  },
  {
    name: "Ir à farmácia",
    emoji: "💊",
    panels: [
      { emoji: "📋", label: "Pegar a receita médica" },
      { emoji: "🚶", label: "Caminhar até a farmácia" },
      { emoji: "🧾", label: "Entregar a receita e pagar" },
      { emoji: "💊", label: "Guardar o remédio em casa" },
    ],
  },
  {
    name: "Cozinhar arroz",
    emoji: "🍚",
    panels: [
      { emoji: "🚿", label: "Lavar o arroz na peneira" },
      { emoji: "🍳", label: "Refogar o alho na panela" },
      { emoji: "💧", label: "Adicionar água e tampa" },
      { emoji: "🍚", label: "Servir o arroz cozido" },
    ],
  },
  {
    name: "Lavar a roupa",
    emoji: "👕",
    panels: [
      { emoji: "🧺", label: "Separar as roupas sujas" },
      { emoji: "🫧", label: "Colocar na máquina com sabão" },
      { emoji: "👕", label: "Estender no varal" },
      { emoji: "🗄️", label: "Dobrar e guardar no armário" },
    ],
  },
  {
    name: "Fazer compras no mercado",
    emoji: "🛒",
    panels: [
      { emoji: "📝", label: "Fazer a lista de compras" },
      { emoji: "🛒", label: "Pegar os produtos nas prateleiras" },
      { emoji: "💳", label: "Pagar no caixa" },
      { emoji: "🛍️", label: "Guardar as compras em casa" },
    ],
  },
  {
    name: "Visita ao médico",
    emoji: "🏥",
    panels: [
      { emoji: "📅", label: "Agendar a consulta" },
      { emoji: "🚌", label: "Ir até a clínica" },
      { emoji: "🩺", label: "Ser atendido pelo médico" },
      { emoji: "💊", label: "Buscar o remédio indicado" },
    ],
  },
  {
    name: "Trocar um pneu",
    emoji: "🔧",
    panels: [
      { emoji: "🚗", label: "Parar o carro em lugar seguro" },
      { emoji: "🔧", label: "Remover os parafusos com chave" },
      { emoji: "🛞", label: "Colocar o pneu reserva" },
      { emoji: "✅", label: "Apertar os parafusos e guardar" },
    ],
  },
  {
    name: "Fazer uma videochamada",
    emoji: "📹",
    panels: [
      { emoji: "📱", label: "Pegar o celular e abrir o app" },
      { emoji: "📡", label: "Verificar a conexão com a internet" },
      { emoji: "📹", label: "Iniciar a chamada de vídeo" },
      { emoji: "👋", label: "Encerrar a chamada ao terminar" },
    ],
  },
  {
    name: "Plantar uma semente",
    emoji: "🌱",
    panels: [
      { emoji: "🪴", label: "Preparar o vaso com terra" },
      { emoji: "☝️", label: "Fazer um buraco na terra" },
      { emoji: "🌰", label: "Depositar a semente" },
      { emoji: "💧", label: "Regar com pouca água" },
    ],
  },
  {
    name: "Pagar uma conta online",
    emoji: "💻",
    panels: [
      { emoji: "💻", label: "Abrir o banco pelo computador" },
      { emoji: "🔑", label: "Digitar a senha de acesso" },
      { emoji: "📄", label: "Selecionar a conta e informar o código" },
      { emoji: "✅", label: "Confirmar o pagamento" },
    ],
  },
  {
    name: "Rotina de dormir",
    emoji: "🌙",
    panels: [
      { emoji: "📵", label: "Guardar o celular longe da cama" },
      { emoji: "🪥", label: "Escovar os dentes" },
      { emoji: "🛏️", label: "Deitar e apagar a luz" },
      { emoji: "😴", label: "Adormecer" },
    ],
  },
  {
    name: "Enviar uma encomenda",
    emoji: "📦",
    panels: [
      { emoji: "🗃️", label: "Empacotar o produto na caixa" },
      { emoji: "🏷️", label: "Colar a etiqueta com o endereço" },
      { emoji: "🚶", label: "Levar até a agência dos Correios" },
      { emoji: "🧾", label: "Receber o comprovante de envio" },
    ],
  },
];

const MAX_TRIALS = 15;

// Guarantees the shuffled order is never already correct
function shuffleAway<T extends { correctIndex: number }>(arr: T[]): T[] {
  if (arr.length <= 1) return [...arr];
  let result: T[];
  let attempts = 0;
  do {
    result = [...arr].sort(() => Math.random() - 0.5);
    attempts++;
  } while (result.every((v, i) => v.correctIndex === i) && attempts < 30);
  return result;
}

function buildTrial(usedIndices: Set<number>) {
  const available = STORIES.map((_, i) => i).filter((i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : Array.from({ length: STORIES.length }, (_, i) => i);
  const storyIdx = pool[Math.floor(Math.random() * pool.length)];
  usedIndices.add(storyIdx);

  const story = STORIES[storyIdx];
  const panels: Panel[] = story.panels.map((p, i) => ({
    id: `panel-${Math.random().toString(36).slice(2)}`,
    emoji: p.emoji,
    label: p.label,
    correctIndex: i,
  }));

  return {
    name: story.name,
    taskEmoji: story.emoji,
    panels,
  };
}

// ---------------------------------------------------------------------------
// Tutorial
// ---------------------------------------------------------------------------
const TUTORIAL_PANELS_INITIAL: Panel[] = [
  { id: "tp3", emoji: "🍽️", label: "Servir na mesa", correctIndex: 2 },
  { id: "tp1", emoji: "🛒", label: "Comprar os ingredientes", correctIndex: 0 },
  { id: "tp2", emoji: "🍳", label: "Cozinhar a refeição", correctIndex: 1 },
];

function OrdemHistoriaDragStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [items, setItems] = useState(TUTORIAL_PANELS_INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const done = useRef(false);

  function handleReorder(newItems: Panel[]) {
    setItems(newItems);
    const isCorrect = newItems.every((item, idx) => item.correctIndex === idx);
    if (isCorrect && !done.current) {
      done.current = true;
      setSubmitted(true);
      setTimeout(onDone, 700);
    }
  }

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-2">
      <p className={`text-xs text-center ${subClass}`}>
        Arraste os painéis para colocá-los na ordem certa:
      </p>
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-1.5">
        {items.map((item, idx) => {
          const isCorrect = submitted && item.correctIndex === idx;
          return (
            <Reorder.Item key={item.id} value={item} disabled={submitted}>
              <motion.div
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 ${
                  isCorrect
                    ? "border-green-500 bg-green-50"
                    : theme === "GAMIFIED"
                    ? "border-gray-600 bg-gray-700 cursor-grab active:cursor-grabbing"
                    : "border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-blue-300"
                }`}
                whileDrag={{ scale: 1.03, zIndex: 50 }}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    theme === "GAMIFIED" ? "bg-gray-600 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xl">{item.emoji}</span>
                <span
                  className={`text-sm flex-1 ${
                    theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
                {isCorrect && <span>✅</span>}
              </motion.div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <p className={`text-xs text-center ${subClass}`}>
        Ordem correta: Comprar → Cozinhar → Servir
      </p>
    </div>
  );
}

function OrdemHistoriaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction:
        "Você verá 4 cenas de uma situação do dia a dia. Arraste-as para colocá-las na ordem em que acontecem!",
      content: (onStepDone: () => void) => (
        <OrdemHistoriaDragStep theme={theme} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Ordem da História" steps={steps} onDone={onDone} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function OrdemHistoria({ difficulty, theme, onComplete }: OrdemHistoriaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const usedStoryIndices = useRef(new Set<number>());
  const startTime = useRef<number>(Date.now());

  const [trialData, setTrialData] = useState(() => {
    const t = buildTrial(usedStoryIndices.current);
    return { ...t, items: shuffleAway([...t.panels]) };
  });

  const items = trialData.items;

  function setItems(newItems: Panel[]) {
    setTrialData((prev) => ({ ...prev, items: newItems }));
  }

  const startNewTrial = useCallback(() => {
    const t = buildTrial(usedStoryIndices.current);
    setTrialData({ ...t, items: shuffleAway([...t.panels]) });
    setSubmitted(false);
  }, []);

  function handleSubmit() {
    const isCorrect = items.every((item, idx) => item.correctIndex === idx);
    const newTrialResults = [...trialResults, isCorrect];
    setTrialResults(newTrialResults);
    setSubmitted(true);

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const correctCount = newTrialResults.filter(Boolean).length;
        const accuracy = correctCount / MAX_TRIALS;
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("ordem-historia", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "ordem-historia",
          domain: "executive",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: {
            trials: MAX_TRIALS,
            correct: correctCount,
          },
        });
      } else {
        setTrial(nextTrial);
        startNewTrial();
      }
    }, 1800);
  }

  if (showTutorial) {
    return <OrdemHistoriaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  // ---------------------------------------------------------------------------
  // Theme tokens
  // ---------------------------------------------------------------------------
  const bg =
    theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-violet-50 to-fuchsia-50"
      : "bg-gray-50";

  const card =
    theme === "GAMIFIED"
      ? "bg-gray-800 border border-cyan-500/30"
      : theme === "COLORFUL"
      ? "bg-white shadow-xl border-2 border-violet-200"
      : "bg-white shadow-lg";

  const titleClass =
    theme === "GAMIFIED"
      ? "text-cyan-400"
      : theme === "COLORFUL"
      ? "text-violet-700"
      : "text-gray-900";

  const subClass =
    theme === "GAMIFIED" ? "text-gray-400" : theme === "COLORFUL" ? "text-violet-400" : "text-gray-500";

  const taskBg =
    theme === "GAMIFIED"
      ? "bg-gray-700/50"
      : theme === "COLORFUL"
      ? "bg-violet-50 border border-violet-100"
      : "bg-gray-50 border border-gray-100";

  const itemBase =
    theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700 cursor-grab active:cursor-grabbing"
      : theme === "COLORFUL"
      ? "border-violet-200 bg-white cursor-grab active:cursor-grabbing hover:border-violet-400"
      : "border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-blue-300";

  const badgeBase =
    theme === "GAMIFIED"
      ? "bg-gray-600 text-gray-300"
      : theme === "COLORFUL"
      ? "bg-violet-100 text-violet-700"
      : "bg-gray-100 text-gray-600";

  const labelClass =
    theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-gray-800" : "text-gray-700";

  const btnClass =
    theme === "GAMIFIED"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
      : theme === "COLORFUL"
      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  // Progress bar active color
  const dotActive =
    theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-violet-500" : "bg-blue-500";
  const dotInactive =
    theme === "GAMIFIED" ? "bg-gray-700" : theme === "COLORFUL" ? "bg-violet-100" : "bg-gray-200";

  const lastResult = trialResults[trialResults.length - 1];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-5 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-base ${titleClass}`}>📖 Ordem da História</h2>
          <span className={`text-xs ${subClass}`}>
            {trial + 1}/{MAX_TRIALS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < trialResults.length
                  ? trialResults[i]
                    ? "bg-green-500"
                    : "bg-red-400"
                  : i === trial
                  ? `${dotActive} animate-pulse`
                  : dotInactive
              }`}
            />
          ))}
        </div>

        {/* Story title */}
        <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${taskBg}`}>
          <span className="text-2xl">{trialData.taskEmoji}</span>
          <div>
            <p
              className={`font-bold text-sm ${
                theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {trialData.name}
            </p>
            <p className={`text-xs ${subClass}`}>
              Arraste os painéis do 1º ao 4º momento
            </p>
          </div>
        </div>

        {/* Draggable panels */}
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="space-y-2 my-3"
        >
          {items.map((item, idx) => {
            const isCorrect = submitted && item.correctIndex === idx;
            const isWrong = submitted && item.correctIndex !== idx;

            return (
              <Reorder.Item key={item.id} value={item} disabled={submitted}>
                <motion.div
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-colors ${
                    isCorrect
                      ? "border-green-500 bg-green-50"
                      : isWrong
                      ? "border-red-400 bg-red-50"
                      : itemBase
                  }`}
                  whileDrag={{
                    scale: 1.03,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    zIndex: 50,
                  }}
                >
                  {/* Position badge */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : isWrong
                        ? "bg-red-400 text-white"
                        : badgeBase
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Emoji scene */}
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>

                  {/* Label */}
                  <span className={`text-sm flex-1 leading-tight ${labelClass}`}>
                    {item.label}
                  </span>

                  {/* Result icon */}
                  {submitted && (
                    <span className="text-base ml-auto flex-shrink-0">
                      {isCorrect ? "✅" : "❌"}
                    </span>
                  )}
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {/* Action area */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            className={`w-full h-11 rounded-xl font-bold transition-colors ${btnClass}`}
          >
            Verificar
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              className={`text-center p-3 rounded-xl border ${
                lastResult
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className={`font-bold text-sm ${
                  lastResult ? "text-green-700" : "text-red-600"
                }`}
              >
                {lastResult ? "Ordem correta! ✅" : "Ordem incorreta ❌"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {lastResult
                  ? "Muito bem! Você acertou a sequência."
                  : "Veja os destaques e tente memorizar a ordem."}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
