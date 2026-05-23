"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface CertoOuErradoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Scenario {
  text: string;
  emoji: string;
  answer: "certo" | "errado";
  explanation: string;
  /** Higher = harder / less obvious. Used for difficulty-weighted selection. */
  hardness: number;
}

const MAX_TRIALS = 20;
const ADVANCE_DELAY_MS = 1400;

// ─── Scenario bank (36 scenarios) ────────────────────────────────────────────
const ALL_SCENARIOS: Scenario[] = [
  // Medication safety
  {
    text: "Tomar o dobro da dose do remédio para melhorar mais rápido",
    emoji: "💊",
    answer: "errado",
    explanation: "Doses extras podem causar intoxicação grave.",
    hardness: 2,
  },
  {
    text: "Guardar medicamentos em local fresco e seco, longe da luz",
    emoji: "🧊",
    answer: "certo",
    explanation: "Conservação correta preserva a eficácia do remédio.",
    hardness: 2,
  },
  {
    text: "Compartilhar o antibiótico com um familiar com os mesmos sintomas",
    emoji: "🤝",
    answer: "errado",
    explanation: "Cada prescrição é individual; o uso errado gera resistência.",
    hardness: 5,
  },
  {
    text: "Parar de tomar o antibiótico ao se sentir melhor, antes de terminar o tratamento",
    emoji: "🛑",
    answer: "errado",
    explanation: "Interromper cedo pode não eliminar a infecção completamente.",
    hardness: 6,
  },
  {
    text: "Verificar a data de validade do remédio antes de tomar",
    emoji: "📅",
    answer: "certo",
    explanation: "Remédios vencidos podem ser ineficazes ou perigosos.",
    hardness: 1,
  },
  {
    text: "Guardar remédios no banheiro por ser um local acessível",
    emoji: "🚿",
    answer: "errado",
    explanation: "Umidade e calor do banheiro degradam os medicamentos.",
    hardness: 7,
  },

  // Traffic safety
  {
    text: "Atravessar a rua olhando para o celular",
    emoji: "📱",
    answer: "errado",
    explanation: "Distração no trânsito é perigosa para pedestres.",
    hardness: 1,
  },
  {
    text: "Usar o cinto de segurança mesmo em viagens curtas",
    emoji: "🚗",
    answer: "certo",
    explanation: "A maioria dos acidentes graves ocorre perto de casa.",
    hardness: 2,
  },
  {
    text: "Atravessar no sinal vermelho porque não há carros visíveis",
    emoji: "🚦",
    answer: "errado",
    explanation: "Veículos podem surgir rapidamente de pontos cegos.",
    hardness: 4,
  },
  {
    text: "Esperar o ônibus parar completamente antes de descer",
    emoji: "🚌",
    answer: "certo",
    explanation: "Descer com o veículo em movimento causa quedas graves.",
    hardness: 2,
  },
  {
    text: "Ligar o pisca-alerta e parar no acostamento em caso de emergência",
    emoji: "⚠️",
    answer: "certo",
    explanation: "Sinalizar a parada protege motorista e outros veículos.",
    hardness: 3,
  },
  {
    text: "Colocar o bebê no colo do adulto em vez de na cadeirinha",
    emoji: "👶",
    answer: "errado",
    explanation: "Em uma freada, o bebê pode ser projetado com força fatal.",
    hardness: 3,
  },

  // Hygiene
  {
    text: "Lavar as mãos antes de preparar comida",
    emoji: "🤲",
    answer: "certo",
    explanation: "Higiene essencial para evitar contaminação alimentar.",
    hardness: 1,
  },
  {
    text: "Usar o mesmo pano para limpar o banheiro e a cozinha",
    emoji: "🧹",
    answer: "errado",
    explanation: "Contaminação cruzada pode causar intoxicação alimentar.",
    hardness: 4,
  },
  {
    text: "Lavar frutas e verduras antes de consumir",
    emoji: "🍎",
    answer: "certo",
    explanation: "Remove agrotóxicos e microrganismos prejudiciais.",
    hardness: 1,
  },
  {
    text: "Reutilizar o óleo de fritura várias vezes para economizar",
    emoji: "🫙",
    answer: "errado",
    explanation: "Óleo reaquecido repetidamente produz substâncias cancerígenas.",
    hardness: 6,
  },
  {
    text: "Descongelar carne deixando-a sobre a pia em temperatura ambiente",
    emoji: "🥩",
    answer: "errado",
    explanation: "Bactérias se multiplicam rapidamente entre 5 °C e 60 °C.",
    hardness: 7,
  },

  // Fire safety
  {
    text: "Sair de um ambiente com fumaça rastejando rente ao chão",
    emoji: "🔥",
    answer: "certo",
    explanation: "O ar mais limpo fica próximo ao chão durante incêndios.",
    hardness: 5,
  },
  {
    text: "Usar álcool 70% para acender churrasqueira",
    emoji: "⛽",
    answer: "errado",
    explanation: "Álcool 70% é altamente inflamável e pode causar explosão.",
    hardness: 4,
  },
  {
    text: "Deixar velas acesas e sem supervisão antes de dormir",
    emoji: "🕯️",
    answer: "errado",
    explanation: "Velas sem supervisão são uma das principais causas de incêndio.",
    hardness: 2,
  },
  {
    text: "Verificar se o fogão está desligado antes de sair de casa",
    emoji: "🍳",
    answer: "certo",
    explanation: "Previne vazamentos de gás e riscos de incêndio.",
    hardness: 1,
  },

  // Nutrition
  {
    text: "Beber água regularmente ao longo do dia",
    emoji: "💧",
    answer: "certo",
    explanation: "Hidratação adequada é fundamental para o funcionamento do corpo.",
    hardness: 1,
  },
  {
    text: "Consumir alimentos depois de expirar a data de validade se parecerem bem",
    emoji: "🗑️",
    answer: "errado",
    explanation: "Contaminação bacteriana não é visível nem tem cheiro detectável.",
    hardness: 5,
  },
  {
    text: "Incluir frutas e vegetais variados nas refeições diárias",
    emoji: "🥦",
    answer: "certo",
    explanation: "Variedade garante vitaminas e minerais essenciais.",
    hardness: 1,
  },
  {
    text: "Substituir o jantar por balas e biscoitos recheados para economizar tempo",
    emoji: "🍬",
    answer: "errado",
    explanation: "Ultraprocessados não fornecem nutrientes necessários para o corpo.",
    hardness: 3,
  },

  // Social situations
  {
    text: "Fornecer dados bancários a alguém que ligou dizendo ser do banco",
    emoji: "📞",
    answer: "errado",
    explanation: "Bancos nunca pedem senhas ou dados completos por telefone.",
    hardness: 4,
  },
  {
    text: "Confirmar a identidade de um técnico antes de permitir entrada em casa",
    emoji: "🔧",
    answer: "certo",
    explanation: "Verificar credenciais protege contra golpes e invasões.",
    hardness: 4,
  },
  {
    text: "Colocar objetos de valor perto da janela aberta",
    emoji: "💍",
    answer: "errado",
    explanation: "Facilita furtos e atrai a atenção de pessoas mal-intencionadas.",
    hardness: 3,
  },
  {
    text: "Clicar em link recebido por SMS prometendo prêmio inesperado",
    emoji: "🎁",
    answer: "errado",
    explanation: "Links suspeitos geralmente são golpes de phishing.",
    hardness: 5,
  },
  {
    text: "Avisar um familiar ao sair sozinho à noite",
    emoji: "🌙",
    answer: "certo",
    explanation: "Comunicar paradeiro aumenta a segurança pessoal.",
    hardness: 2,
  },

  // Common errors / home safety
  {
    text: "Misturar produtos de limpeza para potencializar o efeito",
    emoji: "🧴",
    answer: "errado",
    explanation: "Combinações como cloro e amônia produzem gases tóxicos.",
    hardness: 6,
  },
  {
    text: "Usar escada segura e pedir ajuda para alcançar objetos em altura",
    emoji: "🪜",
    answer: "certo",
    explanation: "Previne quedas, uma das principais causas de lesão doméstica.",
    hardness: 2,
  },
  {
    text: "Carregar objetos pesados curvando a coluna para baixo",
    emoji: "📦",
    answer: "errado",
    explanation: "Dobrar a coluna ao carregar peso causa lesões lomabares.",
    hardness: 5,
  },
  {
    text: "Verificar se aparelhos elétricos estão desligados antes de limpá-los",
    emoji: "🔌",
    answer: "certo",
    explanation: "Evita choque elétrico durante a limpeza de eletrodomésticos.",
    hardness: 3,
  },
  {
    text: "Deixar medicamentos ao alcance de crianças em local fácil de pegar",
    emoji: "👶",
    answer: "errado",
    explanation: "Crianças podem ingerir remédios acidentalmente — risco de vida.",
    hardness: 2,
  },
  {
    text: "Checar a temperatura da água antes de colocar o bebê no banho",
    emoji: "🛁",
    answer: "certo",
    explanation: "A pele do bebê é sensível — água quente demais causa queimaduras.",
    hardness: 3,
  },
];

// ─── Difficulty helpers ───────────────────────────────────────────────────────

/**
 * At higher difficulty levels weight selection toward harder scenarios.
 * difficulty 1-3 → flat; 4-6 → slight bias; 7-10 → strong bias toward hardness.
 */
function weightedPickIndex(
  pool: number[],
  scenarios: Scenario[],
  difficulty: number
): number {
  if (pool.length === 0) return -1;
  if (difficulty <= 3) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // Build cumulative weights
  const bias = (difficulty - 3) / 7; // 0 → 1 as difficulty goes 3 → 10
  const weights = pool.map((idx) => {
    const h = scenarios[idx].hardness; // 1-7
    return 1 + bias * (h - 1);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ─── Tutorial sub-component ───────────────────────────────────────────────────

const TUTORIAL_SCENARIO: Scenario = {
  text: "Lavar as mãos antes de comer",
  emoji: "🤲",
  answer: "certo",
  explanation: "Higiene básica que previne doenças.",
  hardness: 1,
};

function TutorialInteractiveStep({
  theme,
  onDone,
}: {
  theme: Theme;
  onDone: () => void;
}) {
  const [picked, setPicked] = useState<"certo" | "errado" | null>(null);

  const isCorrect = picked === TUTORIAL_SCENARIO.answer;

  function handlePick(choice: "certo" | "errado") {
    if (picked !== null) return;
    setPicked(choice);
    setTimeout(onDone, 1600);
  }

  const scenarioBg = {
    CLINICAL: "bg-gray-50 border border-gray-200",
    COLORFUL: "bg-purple-50 border border-purple-200",
    GAMIFIED: "bg-gray-700/60 border border-cyan-500/20",
  }[theme];

  const scenarioText = {
    CLINICAL: "text-gray-800",
    COLORFUL: "text-purple-900",
    GAMIFIED: "text-gray-100",
  }[theme];

  const explanationBg = isCorrect
    ? "bg-green-50 border border-green-200"
    : "bg-red-50 border border-red-200";

  const explanationText = isCorrect ? "text-green-800" : "text-red-800";

  return (
    <div className="flex flex-col gap-3">
      {/* Scenario card */}
      <div className={`rounded-xl p-4 text-center ${scenarioBg}`}>
        <div className="text-4xl mb-2">{TUTORIAL_SCENARIO.emoji}</div>
        <p className={`text-sm font-medium leading-snug ${scenarioText}`}>
          {TUTORIAL_SCENARIO.text}
        </p>
      </div>

      {/* Buttons */}
      {picked === null && (
        <div className="flex gap-3">
          <button
            onClick={() => handlePick("certo")}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 active:scale-95 transition-transform text-sm"
          >
            ✅ CERTO
          </button>
          <button
            onClick={() => handlePick("errado")}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 active:scale-95 transition-transform text-sm"
          >
            ❌ ERRADO
          </button>
        </div>
      )}

      {/* Feedback */}
      {picked !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-3 ${explanationBg}`}
        >
          <p className={`text-xs font-bold mb-0.5 ${explanationText}`}>
            {isCorrect ? "Correto! ✓" : "Incorreto ✗"}
          </p>
          <p className={`text-xs ${explanationText}`}>
            {TUTORIAL_SCENARIO.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function CertoOuErradoTutorial({
  theme,
  onDone,
}: {
  theme: Theme;
  onDone: () => void;
}) {
  const steps = [
    {
      instruction:
        "Uma situação do dia a dia será mostrada. Você decide: é CERTO ou ERRADO?",
      content: (onStepDone: () => void) => {
        // Auto-advance after 2.5 s for the explanation slide
        setTimeout(onStepDone, 2500);
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">🤔</div>
            <div className="flex gap-3 w-full">
              <div className="flex-1 rounded-xl py-3 text-center font-bold text-white bg-green-500 text-sm opacity-90">
                ✅ CERTO
              </div>
              <div className="flex-1 rounded-xl py-3 text-center font-bold text-white bg-red-500 text-sm opacity-90">
                ❌ ERRADO
              </div>
            </div>
            <p
              className={`text-xs text-center ${
                theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Toque no botão correto o mais rápido possível!
            </p>
          </div>
        );
      },
    },
    {
      instruction: "Experimente! Toque na resposta que você acha correta.",
      content: (onStepDone: () => void) => (
        <TutorialInteractiveStep theme={theme} onDone={onStepDone} />
      ),
    },
  ];

  return (
    <TutorialBase
      theme={theme}
      title="Certo ou Errado"
      steps={steps}
      onDone={onDone}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CertoOuErrado({
  difficulty,
  theme,
  onComplete,
}: CertoOuErradoProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  // Game state
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<{
    choice: "certo" | "errado";
    correct: boolean;
  } | null>(null);
  const [results, setResults] = useState<{ correct: boolean; rt: number }[]>([]);
  const [started, setStarted] = useState(false);

  // Refs (stable across renders)
  const usedIndices = useRef<Set<number>>(new Set());
  const resultsRef = useRef<{ correct: boolean; rt: number }[]>([]);
  const doneRef = useRef(false);
  const trialStartTime = useRef<number>(0);
  const startTime = useRef<number>(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Pick next scenario ──────────────────────────────────────────────────────
  const pickNextScenario = useCallback(() => {
    const available = ALL_SCENARIOS.map((_, i) => i).filter(
      (i) => !usedIndices.current.has(i)
    );

    if (available.length === 0) {
      // All used — reset pool (rare edge case for very long sessions)
      usedIndices.current.clear();
      return pickNextScenario();
    }

    const idx = weightedPickIndex(available, ALL_SCENARIOS, difficulty);
    usedIndices.current.add(idx);
    setCurrentScenario(ALL_SCENARIOS[idx]);
    setFeedback(null);
    trialStartTime.current = Date.now();
  }, [difficulty]);

  // ── Record a trial result ───────────────────────────────────────────────────
  const recordResult = useCallback(
    (correct: boolean, rt: number) => {
      if (doneRef.current) return;

      const newResults = [...resultsRef.current, { correct, rt }];
      resultsRef.current = newResults;
      setResults(newResults);
      reportProgress(Math.round((newResults.length / MAX_TRIALS) * 100));

      if (newResults.length >= MAX_TRIALS) {
        doneRef.current = true;

        const correctCount = newResults.filter((r) => r.correct).length;
        const accuracy = correctCount / MAX_TRIALS;
        const avgRT =
          newResults.reduce((s, r) => s + r.rt, 0) / newResults.length;
        const dur = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore(
          "certo-ou-errado",
          accuracy,
          avgRT,
          difficulty
        );

        setTimeout(() => {
          onComplete({
            exerciseId: "certo-ou-errado",
            domain: "processing",
            score,
            accuracy,
            reactionTime: avgRT,
            difficulty,
            duration: dur,
            metadata: {
              trials: MAX_TRIALS,
              correctCount,
              avgRT,
            },
          });
        }, 1600);
      }
    },
    [difficulty, onComplete, reportProgress]
  );

  // ── Handle patient's answer ─────────────────────────────────────────────────
  function handleAnswer(choice: "certo" | "errado") {
    if (!currentScenario || feedback !== null || doneRef.current) return;

    const rt = Date.now() - trialStartTime.current;
    const correct = choice === currentScenario.answer;

    setFeedback({ choice, correct });
    recordResult(correct, rt);

    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      if (!doneRef.current) pickNextScenario();
    }, ADVANCE_DELAY_MS);
  }

  // ── Start exercise ──────────────────────────────────────────────────────────
  function handleStart() {
    setStarted(true);
    startTime.current = Date.now();
    pickNextScenario();
  }

  // ── Tutorial gate ───────────────────────────────────────────────────────────
  if (showTutorial) {
    return (
      <CertoOuErradoTutorial
        theme={theme}
        onDone={() => setShowTutorial(false)}
      />
    );
  }

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg =
    theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-b from-purple-50 to-pink-100"
      : "bg-gray-100";

  const cardClass =
    theme === "GAMIFIED"
      ? "bg-gray-800 border border-cyan-500/30"
      : "bg-white shadow-md";

  const titleClass =
    theme === "GAMIFIED"
      ? "text-cyan-400"
      : theme === "COLORFUL"
      ? "text-purple-700"
      : "text-gray-900";

  const subClass =
    theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  const scenarioBg =
    theme === "GAMIFIED"
      ? "bg-gray-900 border border-gray-700"
      : theme === "COLORFUL"
      ? "bg-white border-2 border-purple-200 shadow-lg"
      : "bg-white border border-gray-200 shadow-sm";

  const scenarioText =
    theme === "GAMIFIED"
      ? "text-gray-100"
      : theme === "COLORFUL"
      ? "text-purple-900"
      : "text-gray-800";

  const btnCerto =
    theme === "GAMIFIED"
      ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_16px_rgba(22,163,74,0.4)]"
      : theme === "COLORFUL"
      ? "bg-green-500 text-white shadow-xl"
      : "bg-green-500 text-white shadow-md";

  const btnErrado =
    theme === "GAMIFIED"
      ? "bg-red-700 hover:bg-red-600 text-white shadow-[0_0_16px_rgba(220,38,38,0.4)]"
      : theme === "COLORFUL"
      ? "bg-red-500 text-white shadow-xl"
      : "bg-red-500 text-white shadow-md";

  // Feedback flash overlay
  const flashOverlay =
    feedback !== null
      ? feedback.correct
        ? "ring-4 ring-green-400"
        : "ring-4 ring-red-400"
      : "";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col p-3 transition-colors ${bg}`}>
      {/* ── Header / progress ── */}
      <div className={`rounded-2xl p-3 mb-3 ${cardClass}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`font-bold text-base ${titleClass}`}>
              ✅ Certo ou Errado
            </h2>
            <p className={`text-xs ${subClass}`}>
              Julgue cada situação do dia a dia
            </p>
          </div>
          <span
            className={`text-xs font-bold tabular-nums px-2 py-1 rounded-lg ${
              theme === "GAMIFIED"
                ? "bg-gray-700 text-cyan-400"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {results.length}/{MAX_TRIALS}
          </span>
        </div>

        {/* Progress bar dots */}
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < results.length
                  ? results[i].correct
                    ? "bg-green-500"
                    : "bg-red-400"
                  : i === results.length
                  ? "bg-blue-400 animate-pulse"
                  : theme === "GAMIFIED"
                  ? "bg-gray-700"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Main play area ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-1">
        {!started ? (
          // Start screen
          <div className="flex flex-col items-center gap-4 px-4">
            <div className="text-5xl">🧠</div>
            <p className={`text-sm text-center leading-relaxed ${subClass}`}>
              Uma situação do dia a dia vai aparecer.{"\n"}
              Decida:{" "}
              <strong className="text-green-600">CERTO</strong> ou{" "}
              <strong className="text-red-500">ERRADO</strong>?
            </p>
            <button
              onClick={handleStart}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform ${
                theme === "GAMIFIED"
                  ? "bg-cyan-500 text-gray-900"
                  : theme === "COLORFUL"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              Começar
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentScenario && (
              <motion.div
                key={currentScenario.text}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ duration: 0.22 }}
                className="w-full flex flex-col gap-4"
              >
                {/* Scenario card */}
                <div
                  className={`rounded-2xl p-6 text-center transition-all ${scenarioBg} ${flashOverlay}`}
                >
                  <div className="text-6xl mb-4 leading-none">
                    {currentScenario.emoji}
                  </div>
                  <p
                    className={`text-base font-semibold leading-snug ${scenarioText}`}
                  >
                    {currentScenario.text}
                  </p>

                  {/* Explanation (shown after answer) */}
                  <AnimatePresence>
                    {feedback !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: 12,
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl px-3 py-2 text-xs font-medium leading-snug ${
                          feedback.correct
                            ? theme === "GAMIFIED"
                              ? "bg-green-900/60 text-green-300"
                              : "bg-green-100 text-green-800"
                            : theme === "GAMIFIED"
                            ? "bg-red-900/60 text-red-300"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span className="font-bold">
                          {feedback.correct
                            ? "✓ Correto! "
                            : `✗ Errado — a resposta era ${currentScenario.answer === "certo" ? "CERTO" : "ERRADO"}. `}
                        </span>
                        {currentScenario.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Answer buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAnswer("certo")}
                    disabled={feedback !== null}
                    className={`flex-1 py-5 rounded-2xl font-black text-lg transition-opacity ${btnCerto} ${
                      feedback !== null ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    ✅ CERTO
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleAnswer("errado")}
                    disabled={feedback !== null}
                    className={`flex-1 py-5 rounded-2xl font-black text-lg transition-opacity ${btnErrado} ${
                      feedback !== null ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    ❌ ERRADO
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
