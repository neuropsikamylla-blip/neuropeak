"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Story {
  name: string;
  emoji: string;
  panels: { emoji: string; label: string }[];
}

// ── Banco de histórias: 3 painéis (fácil) ──────────────────────────────────
const STORIES_3: Story[] = [
  { name: "Lavar as mãos", emoji: "🤲", panels: [
    { emoji: "🚰", label: "Abrir a torneira" },
    { emoji: "🫧", label: "Passar sabão nas mãos" },
    { emoji: "🧻", label: "Secar com toalha" },
  ]},
  { name: "Fazer uma ligação", emoji: "📞", panels: [
    { emoji: "📱", label: "Pegar o celular" },
    { emoji: "🔢", label: "Discar o número" },
    { emoji: "🗣️", label: "Falar e encerrar" },
  ]},
  { name: "Tomar um comprimido", emoji: "💊", panels: [
    { emoji: "💊", label: "Pegar o comprimido" },
    { emoji: "💧", label: "Beber água" },
    { emoji: "✅", label: "Guardar o remédio" },
  ]},
  { name: "Fazer café", emoji: "☕", panels: [
    { emoji: "🥄", label: "Medir e colocar o pó" },
    { emoji: "💧", label: "Despejar água quente" },
    { emoji: "☕", label: "Servir na xícara" },
  ]},
  { name: "Mandar uma mensagem", emoji: "📲", panels: [
    { emoji: "📱", label: "Abrir o aplicativo" },
    { emoji: "✍️", label: "Digitar a mensagem" },
    { emoji: "📤", label: "Enviar" },
  ]},
  { name: "Pagar com cartão", emoji: "💳", panels: [
    { emoji: "💳", label: "Passar o cartão na maquininha" },
    { emoji: "🔢", label: "Digitar a senha" },
    { emoji: "🧾", label: "Pegar o comprovante" },
  ]},
  { name: "Acender a televisão", emoji: "📺", panels: [
    { emoji: "🎮", label: "Pegar o controle remoto" },
    { emoji: "🔘", label: "Apertar o botão ligar" },
    { emoji: "📺", label: "Escolher o canal" },
  ]},
  { name: "Abrir uma janela", emoji: "🪟", panels: [
    { emoji: "🔓", label: "Destravar a janela" },
    { emoji: "🪟", label: "Empurrar para abrir" },
    { emoji: "🌬️", label: "Deixar o ar entrar" },
  ]},
  { name: "Varrer o chão", emoji: "🧹", panels: [
    { emoji: "🧹", label: "Pegar a vassoura" },
    { emoji: "🌀", label: "Varrer em direção à sujeira" },
    { emoji: "🗑️", label: "Recolher no lixo" },
  ]},
];

// ── Banco de histórias: 4 painéis (médio) ──────────────────────────────────
const STORIES_4: Story[] = [
  { name: "Manhã em casa", emoji: "🌅", panels: [
    { emoji: "⏰", label: "O despertador toca" },
    { emoji: "🚿", label: "Tomar banho" },
    { emoji: "☕", label: "Tomar café da manhã" },
    { emoji: "🚪", label: "Sair de casa" },
  ]},
  { name: "Ir à farmácia", emoji: "💊", panels: [
    { emoji: "📋", label: "Pegar a receita médica" },
    { emoji: "🚶", label: "Caminhar até a farmácia" },
    { emoji: "🧾", label: "Entregar a receita e pagar" },
    { emoji: "💊", label: "Guardar o remédio em casa" },
  ]},
  { name: "Cozinhar arroz", emoji: "🍚", panels: [
    { emoji: "🚿", label: "Lavar o arroz na peneira" },
    { emoji: "🍳", label: "Refogar o alho na panela" },
    { emoji: "💧", label: "Adicionar água e tampa" },
    { emoji: "🍚", label: "Servir o arroz cozido" },
  ]},
  { name: "Lavar a roupa", emoji: "👕", panels: [
    { emoji: "🧺", label: "Separar as roupas sujas" },
    { emoji: "🫧", label: "Colocar na máquina com sabão" },
    { emoji: "👕", label: "Estender no varal" },
    { emoji: "🗄️", label: "Dobrar e guardar no armário" },
  ]},
  { name: "Fazer compras no mercado", emoji: "🛒", panels: [
    { emoji: "📝", label: "Fazer a lista de compras" },
    { emoji: "🛒", label: "Pegar os produtos nas prateleiras" },
    { emoji: "💳", label: "Pagar no caixa" },
    { emoji: "🛍️", label: "Guardar as compras em casa" },
  ]},
  { name: "Visita ao médico", emoji: "🏥", panels: [
    { emoji: "📅", label: "Agendar a consulta" },
    { emoji: "🚌", label: "Ir até a clínica" },
    { emoji: "🩺", label: "Ser atendido pelo médico" },
    { emoji: "💊", label: "Buscar o remédio indicado" },
  ]},
  { name: "Trocar um pneu", emoji: "🔧", panels: [
    { emoji: "🚗", label: "Parar o carro em lugar seguro" },
    { emoji: "🔧", label: "Remover os parafusos com chave" },
    { emoji: "🛞", label: "Colocar o pneu reserva" },
    { emoji: "✅", label: "Apertar os parafusos e guardar" },
  ]},
  { name: "Fazer uma videochamada", emoji: "📹", panels: [
    { emoji: "📱", label: "Pegar o celular e abrir o app" },
    { emoji: "📡", label: "Verificar a conexão com a internet" },
    { emoji: "📹", label: "Iniciar a chamada de vídeo" },
    { emoji: "👋", label: "Encerrar a chamada ao terminar" },
  ]},
  { name: "Plantar uma semente", emoji: "🌱", panels: [
    { emoji: "🪴", label: "Preparar o vaso com terra" },
    { emoji: "👇", label: "Fazer um buraco na terra" },
    { emoji: "🌰", label: "Depositar a semente" },
    { emoji: "💧", label: "Regar com pouca água" },
  ]},
  { name: "Pagar uma conta online", emoji: "💻", panels: [
    { emoji: "💻", label: "Abrir o banco pelo computador" },
    { emoji: "🔑", label: "Digitar a senha de acesso" },
    { emoji: "📄", label: "Selecionar a conta e o código" },
    { emoji: "✅", label: "Confirmar o pagamento" },
  ]},
  { name: "Rotina de dormir", emoji: "🌙", panels: [
    { emoji: "📵", label: "Guardar o celular longe da cama" },
    { emoji: "🪥", label: "Escovar os dentes" },
    { emoji: "🛏️", label: "Deitar e apagar a luz" },
    { emoji: "😴", label: "Adormecer" },
  ]},
  { name: "Enviar uma encomenda", emoji: "📦", panels: [
    { emoji: "📦", label: "Colocar na caixa para enviar" },
    { emoji: "🏷️", label: "Colar a etiqueta com o endereço" },
    { emoji: "🚶", label: "Levar até a agência dos Correios" },
    { emoji: "🧾", label: "Receber o comprovante de envio" },
  ]},
  { name: "Trocar uma lâmpada", emoji: "💡", panels: [
    { emoji: "🪜", label: "Posicionar a escada com segurança" },
    { emoji: "🔌", label: "Desligar o interruptor" },
    { emoji: "💡", label: "Trocar a lâmpada queimada" },
    { emoji: "✅", label: "Ligar e testar" },
  ]},
  { name: "Alugar um filme", emoji: "🎬", panels: [
    { emoji: "📱", label: "Abrir o aplicativo de streaming" },
    { emoji: "🔍", label: "Buscar o filme desejado" },
    { emoji: "💳", label: "Confirmar o aluguel e pagar" },
    { emoji: "▶️", label: "Assistir ao filme" },
  ]},
  { name: "Preparar um sanduíche", emoji: "🥪", panels: [
    { emoji: "🍞", label: "Pegar duas fatias de pão" },
    { emoji: "🧀", label: "Colocar o recheio escolhido" },
    { emoji: "🥪", label: "Montar e pressionar levemente" },
    { emoji: "🍽️", label: "Servir no prato" },
  ]},
  { name: "Fazer uma transferência PIX", emoji: "🏦", panels: [
    { emoji: "📱", label: "Abrir o aplicativo do banco" },
    { emoji: "🔑", label: "Acessar a área PIX" },
    { emoji: "📝", label: "Informar a chave e o valor" },
    { emoji: "✅", label: "Confirmar e salvar o comprovante" },
  ]},
  { name: "O Cachorro Azul", emoji: "🐕", panels: [
    { emoji: "🔍", label: "No parque, procurando o cachorro" },
    { emoji: "😔", label: "Sentado triste na calçada" },
    { emoji: "🏃", label: "Correndo pedir ajuda às crianças" },
    { emoji: "🎈", label: "Cachorro voltou! Balão sobe no céu" },
  ]},
];

// ── Banco de histórias: 5 painéis (difícil) ────────────────────────────────
const STORIES_5: Story[] = [
  { name: "Preparar uma mala de viagem", emoji: "🧳", panels: [
    { emoji: "📝", label: "Fazer lista do que levar" },
    { emoji: "👕", label: "Separar as roupas necessárias" },
    { emoji: "🧴", label: "Pegar os itens de higiene" },
    { emoji: "🧳", label: "Organizar tudo na mala" },
    { emoji: "🔒", label: "Fechar e verificar o peso" },
  ]},
  { name: "Fazer um bolo", emoji: "🎂", panels: [
    { emoji: "📖", label: "Ler a receita completa" },
    { emoji: "🥚", label: "Separar e medir os ingredientes" },
    { emoji: "🍜", label: "Misturar a massa" },
    { emoji: "🔥", label: "Assar no forno pelo tempo certo" },
    { emoji: "🎂", label: "Decorar depois de esfriar" },
  ]},
  { name: "Ir ao banco presencialmente", emoji: "🏦", panels: [
    { emoji: "📋", label: "Separar os documentos necessários" },
    { emoji: "🚌", label: "Ir até o banco" },
    { emoji: "🔢", label: "Pegar a senha de atendimento" },
    { emoji: "🪑", label: "Aguardar ser chamado" },
    { emoji: "💼", label: "Realizar o atendimento" },
  ]},
  { name: "Montar um móvel", emoji: "🪑", panels: [
    { emoji: "📄", label: "Ler o manual de montagem" },
    { emoji: "🔩", label: "Identificar e separar as peças" },
    { emoji: "🔧", label: "Montar a estrutura principal" },
    { emoji: "✅", label: "Apertar todos os parafusos" },
    { emoji: "🧹", label: "Limpar e posicionar o móvel" },
  ]},
  { name: "Organizar a geladeira", emoji: "❄️", panels: [
    { emoji: "🛍️", label: "Chegar com as compras" },
    { emoji: "🗑️", label: "Retirar o que está vencido" },
    { emoji: "🧹", label: "Limpar as prateleiras" },
    { emoji: "📍", label: "Organizar os itens por categoria" },
    { emoji: "✅", label: "Guardar os novos produtos" },
  ]},
  { name: "Planejar um passeio", emoji: "🗺️", panels: [
    { emoji: "📍", label: "Escolher o destino" },
    { emoji: "🌐", label: "Verificar horário de funcionamento" },
    { emoji: "🗺️", label: "Traçar o melhor caminho" },
    { emoji: "🎒", label: "Preparar o que levar" },
    { emoji: "🚶", label: "Sair para o passeio" },
  ]},
  { name: "Fazer uma consulta médica completa", emoji: "👨‍⚕️", panels: [
    { emoji: "📅", label: "Agendar a consulta" },
    { emoji: "📋", label: "Separar os exames anteriores" },
    { emoji: "🚌", label: "Ir até o consultório" },
    { emoji: "🩺", label: "Ser atendido pelo médico" },
    { emoji: "💊", label: "Buscar o remédio indicado" },
  ]},
  { name: "Renovar a carteira de motorista", emoji: "🪪", panels: [
    { emoji: "🌐", label: "Agendar online no Detran" },
    { emoji: "📋", label: "Reunir os documentos necessários" },
    { emoji: "🚌", label: "Ir até o Detran no dia marcado" },
    { emoji: "📸", label: "Tirar a foto biométrica" },
    { emoji: "🪪", label: "Receber o protocolo de entrega" },
  ]},
  { name: "Pintar um cômodo", emoji: "🎨", panels: [
    { emoji: "🛒", label: "Comprar tinta e materiais" },
    { emoji: "🪑", label: "Retirar e cobrir os móveis" },
    { emoji: "🧹", label: "Lixar e limpar a parede" },
    { emoji: "🎨", label: "Aplicar a tinta em camadas" },
    { emoji: "✅", label: "Aguardar secar e recolocar os móveis" },
  ]},
];

function getStoryPool(panelLevel: number): Story[] {
  if (panelLevel === 1) return STORIES_3;
  if (panelLevel === 2) return STORIES_4;
  return STORIES_5;
}

function initialPanelLevel(difficulty: number): number {
  if (difficulty <= 3) return 1;
  if (difficulty <= 6) return 2;
  return 3;
}

const MAX_TRIALS = 15;

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

const SCENE_PALETTE = [
  "from-sky-100 to-cyan-50",
  "from-amber-100 to-yellow-50",
  "from-violet-100 to-purple-50",
  "from-emerald-100 to-teal-50",
  "from-rose-100 to-pink-50",
  "from-orange-100 to-amber-50",
  "from-indigo-100 to-blue-50",
  "from-teal-100 to-cyan-50",
];

function sceneBg(emoji: string): string {
  const code = emoji.codePointAt(0) ?? 0;
  return SCENE_PALETTE[code % SCENE_PALETTE.length];
}

function pickFromPool(pool: Story[], used: Set<number>): { story: Story; idx: number } {
  const available = pool.map((_, i) => i).filter((i) => !used.has(i));

  if (available.length === 0) {
    // Exauriu o pool: reinicia, preservando apenas os 2 últimos para evitar repetição imediata
    const recent = [...used].slice(-2);
    used.clear();
    recent.forEach((i) => used.add(i));
    return pickFromPool(pool, used);
  }

  const idx = available[Math.floor(Math.random() * available.length)];
  used.add(idx);
  return { story: pool[idx], idx };
}

function buildTrialData(panelLevel: number, used3: Set<number>, used4: Set<number>, used5: Set<number>) {
  const pool = getStoryPool(panelLevel);
  const usedSet = panelLevel === 1 ? used3 : panelLevel === 2 ? used4 : used5;
  const { story } = pickFromPool(pool, usedSet);

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
    panelCount: panels.length,
  };
}

// ── Tutorial ──────────────────────────────────────────────────────────────
const TUTORIAL_PANELS_INITIAL: Panel[] = [
  { id: "tp3", emoji: "🍽️", label: "Servir na mesa", correctIndex: 2 },
  { id: "tp1", emoji: "🛒", label: "Comprar os ingredientes", correctIndex: 0 },
  { id: "tp2", emoji: "🍳", label: "Cozinhar a refeição", correctIndex: 1 },
];

function OrdemHistoriaTapStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [tappedIds, setTappedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const done = useRef(false);

  const panels = TUTORIAL_PANELS_INITIAL;

  function tapPanel(id: string) {
    if (submitted || tappedIds.includes(id)) return;
    const next = [...tappedIds, id];
    setTappedIds(next);
    if (next.length === panels.length && !done.current) {
      const correctOrder = [...panels]
        .sort((a, b) => a.correctIndex - b.correctIndex)
        .map((p) => p.id);
      const isCorrect = next.every((pid, i) => pid === correctOrder[i]);
      if (isCorrect) {
        done.current = true;
        setSubmitted(true);
        setTimeout(onDone, 700);
      } else {
        // ordem errada: resetar após breve feedback
        setTimeout(() => setTappedIds([]), 600);
      }
    }
  }

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  const normalCard =
    theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700"
      : "border-gray-200 bg-white hover:border-blue-300";
  const selectedCard =
    theme === "GAMIFIED"
      ? "border-cyan-400 bg-gray-600"
      : "border-blue-400 bg-blue-50";
  const correctCard = "border-green-500 bg-green-50";
  const badgeClass =
    theme === "GAMIFIED" ? "bg-cyan-500 text-white" : "bg-blue-500 text-white";

  return (
    <div className="space-y-2">
      <p className={`text-xs text-center ${subClass}`}>
        Toque os painéis na ordem correta da história: 1.º, 2.º, 3.º...
      </p>
      <div className="grid grid-cols-3 gap-2">
        {panels.map((panel) => {
          const tapIdx = tappedIds.indexOf(panel.id);
          const isTapped = tapIdx !== -1;
          const borderCls = submitted ? correctCard : isTapped ? selectedCard : normalCard;
          const sceneAreaCls = theme === "GAMIFIED"
            ? "bg-gradient-to-br from-gray-700 to-gray-800"
            : `bg-gradient-to-br ${sceneBg(panel.emoji)}`;
          const labelAreaCls = theme === "GAMIFIED" ? "bg-gray-700" : "bg-white";
          return (
            <button
              key={panel.id}
              onClick={() => tapPanel(panel.id)}
              disabled={submitted}
              className={`relative rounded-xl border-2 overflow-hidden flex flex-col transition-all active:scale-95 ${borderCls}`}
            >
              <div className={`relative flex items-center justify-center h-20 ${sceneAreaCls}`}>
                <span className="text-5xl leading-none">{panel.emoji}</span>
                {isTapped && !submitted && (
                  <span className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow ${badgeClass}`}>
                    {tapIdx + 1}
                  </span>
                )}
              </div>
              <div className={`px-2 py-1.5 ${labelAreaCls}`}>
                <p className={`text-xs text-center leading-tight font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-700"}`}>
                  {panel.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
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
        "Você verá painéis de uma situação do dia a dia em ordem embaralhada. Toque os painéis na ordem correta da história: 1.º, 2.º, 3.º...",
      content: (onStepDone: () => void) => (
        <OrdemHistoriaTapStep theme={theme} onDone={onStepDone} />
      ),
    },
  ];

  return <TutorialBase theme={theme} title="Ordem da História" steps={steps} onDone={onDone} />;
}

// ── Componente principal ───────────────────────────────────────────────────
export function OrdemHistoria({ difficulty, theme, onComplete }: OrdemHistoriaProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const [trial, setTrial] = useState(0);
  const [trialResults, setTrialResults] = useState<boolean[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [panelLevel, setPanelLevel] = useState(() => initialPanelLevel(difficulty));
  const [tappedIds, setTappedIds] = useState<string[]>([]);

  const used3 = useRef(new Set<number>());
  const used4 = useRef(new Set<number>());
  const used5 = useRef(new Set<number>());
  const startTime = useRef<number>(Date.now());

  const [trialData, setTrialData] = useState(() => {
    const initLevel = initialPanelLevel(difficulty);
    const data = buildTrialData(initLevel, used3.current, used4.current, used5.current);
    return { ...data, shuffled: shuffleAway([...data.panels]) };
  });

  const startNewTrial = useCallback(
    (nextLevel: number) => {
      const data = buildTrialData(nextLevel, used3.current, used4.current, used5.current);
      setTrialData({ ...data, shuffled: shuffleAway([...data.panels]) });
      setTappedIds([]);
      setSubmitted(false);
    },
    []
  );

  function tapPanel(id: string) {
    if (submitted || tappedIds.includes(id)) return;
    setTappedIds((prev) => [...prev, id]);
  }

  function undoLast() {
    if (submitted) return;
    setTappedIds((prev) => prev.slice(0, -1));
  }

  function handleSubmit() {
    const correctOrder = [...trialData.panels]
      .sort((a, b) => a.correctIndex - b.correctIndex)
      .map((p) => p.id);
    const isCorrect = tappedIds.every((id, i) => id === correctOrder[i]);

    const newResults = [...trialResults, isCorrect];
    setTrialResults(newResults);
    setSubmitted(true);

    // Adaptive difficulty: streak-based
    const newStreak = isCorrect ? Math.max(streak, 0) + 1 : Math.min(streak, 0) - 1;
    let nextLevel = panelLevel;
    let resetStreak = false;

    if (newStreak >= 2) {
      nextLevel = Math.min(panelLevel + 1, 3);
      resetStreak = true;
    } else if (newStreak <= -2) {
      nextLevel = Math.max(panelLevel - 1, 1);
      resetStreak = true;
    }

    const nextStreak = resetStreak ? 0 : newStreak;
    setStreak(nextStreak);
    setPanelLevel(nextLevel);

    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / MAX_TRIALS) * 100));

    setTimeout(() => {
      if (nextTrial >= MAX_TRIALS) {
        const correctCount = newResults.filter(Boolean).length;
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
          metadata: { trials: MAX_TRIALS, correct: correctCount },
        });
      } else {
        setTrial(nextTrial);
        startNewTrial(nextLevel);
      }
    }, 1800);
  }

  if (showTutorial) {
    return <OrdemHistoriaTutorial theme={theme} onDone={() => setShowTutorial(false)} />;
  }

  // ── Tokens de tema ────────────────────────────────────────────────────────
  const bg =
    theme === "GAMIFIED"
      ? "bg-gray-950"
      : theme === "COLORFUL"
      ? "bg-gradient-to-br from-blue-50 via-white to-rose-50"
      : "bg-gradient-to-br from-slate-50 to-indigo-50/30";

  const card =
    theme === "GAMIFIED"
      ? "bg-gray-800 border border-cyan-500/30"
      : theme === "COLORFUL"
      ? "bg-white shadow-xl border-2 border-blue-300"
      : "bg-white shadow-md border border-slate-200/60";

  const titleClass =
    theme === "GAMIFIED"
      ? "text-cyan-400"
      : theme === "COLORFUL"
      ? "text-blue-800"
      : "text-slate-800";

  const subClass =
    theme === "GAMIFIED" ? "text-gray-400" : theme === "COLORFUL" ? "text-blue-400" : "text-slate-500";

  const taskBg =
    theme === "GAMIFIED"
      ? "bg-gray-700/50"
      : theme === "COLORFUL"
      ? "bg-blue-50 border border-blue-100"
      : "bg-indigo-50/50 border border-indigo-100/60";

  const normalCardClass =
    theme === "GAMIFIED"
      ? "border-gray-600 bg-gray-700 active:scale-95"
      : theme === "COLORFUL"
      ? "border-blue-200 bg-white hover:border-blue-400 active:scale-95"
      : "border-slate-200 bg-white hover:border-indigo-300 shadow-sm active:scale-95";

  const selectedCardClass =
    theme === "GAMIFIED"
      ? "border-cyan-400 bg-gray-600"
      : theme === "COLORFUL"
      ? "border-blue-500 bg-blue-50"
      : "border-indigo-500 bg-indigo-50";

  const correctCardClass = "border-green-500 bg-green-50";
  const wrongCardClass = "border-red-400 bg-red-50";

  const badgeClass =
    theme === "GAMIFIED"
      ? "bg-cyan-500 text-white"
      : theme === "COLORFUL"
      ? "bg-blue-100 text-blue-800"
      : "bg-indigo-500 text-white";

  const labelClass =
    theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-gray-800" : "text-slate-700";

  const btnClass =
    theme === "GAMIFIED"
      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
      : theme === "COLORFUL"
      ? "bg-gradient-to-r from-rose-700 to-blue-700 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 text-white";

  const undoBtnClass =
    theme === "GAMIFIED"
      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
      : theme === "COLORFUL"
      ? "bg-white hover:bg-gray-50 text-gray-600 border border-gray-300"
      : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-300";

  const dotActive =
    theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-blue-500" : "bg-indigo-500";
  const dotInactive =
    theme === "GAMIFIED" ? "bg-gray-700" : theme === "COLORFUL" ? "bg-blue-100" : "bg-slate-200";

  // Rótulo de nível
  const levelLabel =
    panelLevel === 1 ? "3 etapas" : panelLevel === 2 ? "4 etapas" : "5 etapas";
  const levelColor =
    theme === "GAMIFIED"
      ? "text-cyan-400"
      : theme === "COLORFUL"
      ? "text-blue-500"
      : "text-indigo-500";

  const lastResult = trialResults[trialResults.length - 1];
  const allTapped = tappedIds.length === trialData.panelCount;

  // Para feedback após submit: determinar se cada painel está certo ou errado
  const correctOrder = [...trialData.panels]
    .sort((a, b) => a.correctIndex - b.correctIndex)
    .map((p) => p.id);

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 pt-5 ${bg}`}>
      <div className={`w-full max-w-2xl rounded-2xl p-5 ${card}`}>

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className={`font-bold text-base ${titleClass}`}>📖 Ordem da História</h2>
          <span className={`text-xs ${subClass}`}>
            {trial + 1}/{MAX_TRIALS}
          </span>
        </div>

        {/* Nível atual */}
        <p className={`text-xs mb-2 font-medium ${levelColor}`}>
          Nível: {levelLabel}
          {streak >= 1 && " · 🔥 " + streak + " seguidos"}
          {streak <= -1 && " · " + Math.abs(streak) + " erros seguidos"}
        </p>

        {/* Barra de progresso */}
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

        {/* Título da história */}
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
              Toque os painéis na ordem correta: 1.º ao {trialData.panelCount}.º
            </p>
          </div>
        </div>

        {/* Grade de painéis */}
        {(() => {
          const gridCols = trialData.panelCount === 4 ? "grid-cols-2" : "grid-cols-3";
          return (
            <div className={`grid ${gridCols} gap-3 my-4`}>
              {trialData.shuffled.map((panel) => {
                const tapIdx = tappedIds.indexOf(panel.id);
                const isTapped = tapIdx !== -1;
                const wasCorrect = submitted && tappedIds[panel.correctIndex] === panel.id;

                let borderCls = normalCardClass;
                if (submitted) {
                  borderCls = wasCorrect ? correctCardClass : wrongCardClass;
                } else if (isTapped) {
                  borderCls = selectedCardClass;
                }

                const sceneAreaCls = theme === "GAMIFIED"
                  ? "bg-gradient-to-br from-gray-700 to-gray-800"
                  : `bg-gradient-to-br ${sceneBg(panel.emoji)}`;
                const labelAreaCls = theme === "GAMIFIED" ? "bg-gray-800" : "bg-white";

                return (
                  <button
                    key={panel.id}
                    onClick={() => tapPanel(panel.id)}
                    disabled={submitted}
                    className={`relative rounded-2xl border-2 overflow-hidden flex flex-col transition-all active:scale-95 ${borderCls}`}
                  >
                    {/* Área da cena */}
                    <div className={`relative flex items-center justify-center h-28 ${sceneAreaCls}`}>
                      {/* Emoji de contexto da história (fundo) */}
                      <span className="absolute text-7xl opacity-10 select-none pointer-events-none">
                        {trialData.taskEmoji}
                      </span>
                      {/* Emoji da ação (primeiro plano) */}
                      <span className="text-6xl leading-none relative z-10">{panel.emoji}</span>
                      {/* Overlay de estado */}
                      {!submitted && isTapped && (
                        <div className="absolute inset-0 bg-blue-400/15 pointer-events-none" />
                      )}
                      {submitted && (
                        <div className={`absolute inset-0 pointer-events-none ${wasCorrect ? "bg-green-400/15" : "bg-red-400/15"}`} />
                      )}
                      {/* Badge de ordem */}
                      {!submitted && isTapped && (
                        <span className={`absolute top-2 right-2 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center shadow-md ${badgeClass}`}>
                          {tapIdx + 1}
                        </span>
                      )}
                      {submitted && (
                        <span className={`absolute top-2 right-2 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center shadow-md ${wasCorrect ? "bg-green-500 text-white" : "bg-red-400 text-white"}`}>
                          {panel.correctIndex + 1}
                        </span>
                      )}
                    </div>
                    {/* Rótulo */}
                    <div className={`px-2 py-2 ${labelAreaCls}`}>
                      <p className={`text-xs text-center leading-tight font-semibold ${labelClass}`}>
                        {panel.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Área de ação */}
        {!submitted ? (
          <div className="flex gap-2">
            {tappedIds.length > 0 && (
              <button
                onClick={undoLast}
                className={`flex-1 h-11 rounded-xl font-bold transition-colors text-sm ${undoBtnClass}`}
              >
                Desfazer
              </button>
            )}
            {allTapped && (
              <button
                onClick={handleSubmit}
                className={`flex-1 h-11 rounded-xl font-bold transition-colors ${btnClass}`}
              >
                Confirmar
              </button>
            )}
          </div>
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
                  ? "Muito bem! Próxima história em instantes."
                  : "Observe os destaques e tente memorizar a sequência."}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
