"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Lightbulb, Check, RotateCcw, Volume2 } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import type { ExerciseResult, Theme } from "@/types";

interface AntesDepoisProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ─── Áudio (Web Speech) — voz pt-BR mais natural. Só toca quando chamado. ─────────
let ptVoice: SpeechSynthesisVoice | null | undefined;
function pickPtVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.filter((v) => /pt[-_]?br/i.test(v.lang) || /portugu/i.test(v.name) || /^pt/i.test(v.lang));
  const prefer = ["luciana", "google português do brasil", "google portugues do brasil",
    "microsoft francisca", "francisca", "microsoft thalita", "thalita", "maria", "fernanda", "felipe", "natural", "google"];
  for (const name of prefer) { const v = pt.find((vc) => vc.name.toLowerCase().includes(name)); if (v) return v; }
  return pt[0] ?? null;
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { ptVoice = pickPtVoice(); };
}
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    if (ptVoice === undefined) ptVoice = pickPtVoice();
    if (ptVoice) u.voice = ptVoice;
    u.rate = 0.96; u.pitch = 1.02; u.volume = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* sem áudio — segue visual */ }
}
function stopSpeak() { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }

// ─── Tipos do banco ───────────────────────────────────────────────────────────────
type Diff = "easy" | "medium" | "hard";
type Domain = "daily_routine" | "cause_effect" | "symbolic_sequence" | "functional_planning";
type QMode = "before_after" | "missing_step" | "order_sequence" | "find_error";

interface Question {
  id: string;
  diff: Diff;
  domain: Domain;
  mode: QMode;
  prompt: string;
  options?: string[];   // [correta, ...distratores] — embaralhadas no jogo
  sequence?: string[];  // ordem correta (mode = order_sequence)
  explanation: string;
}

// Emoji por ação (pistas visuais p/ quem não lê — usado no fácil/médio, não no difícil)
const EMOJI: Record<string, string> = {
  "Escovar os dentes": "🪥", "Dormir": "😴", "Ir dormir": "😴", "Acordar": "⏰", "Levantar da cama": "🛏️",
  "Dormir de novo": "😴", "Guardar o carro": "🚗", "Tomar banho": "🚿", "Entrar no banho": "🛁",
  "Se secar": "🧖", "Se secar com a toalha": "🧖", "Secar as mãos": "🧻", "Sujar as mãos": "🖐️",
  "Lavar as mãos": "🧼", "Comer": "🍽️", "Tomar café": "☕", "Colocar a meia": "🧦", "Correr na rua": "🏃",
  "Tomar sorvete": "🍦", "Colocar café na xícara": "☕", "Trocar de roupa": "👕", "Vestir a roupa": "👕",
  "Vestir um casaco": "🧥", "Tirar a roupa": "🧺", "Tirar o casaco": "🧥", "Calçar o sapato": "👟",
  "Colocar o sapato": "👟", "Sair": "🚪", "Sair de casa": "🚪", "Sair para trabalhar": "💼",
  "Trancar a porta": "🔒", "Abrir o guarda-chuva": "☂️", "Limpar o chão": "🧽", "Preparar a comida": "🍳",
  "Preparar um lanche": "🥪", "Lavar a louça": "🧽", "Lavar a louça depois": "🧽", "Lavar a panela": "🫕",
  "Servir o almoço": "🍽️", "Guardar a panela": "🍲", "Chegar na escola": "🏫", "Jantar": "🍲",
  "Almoçar": "🍽️", "Guardar o prato": "🍽️", "Sujar a roupa": "👕", "Tirar os sapatos": "👟",
  "Abrir a janela": "🪟", "Escovar o cabelo": "💇", "Escovar o cabelo depois": "💇", "Sentar no banco": "🪑",
  "Regar as plantas": "🪴", "Encher o copo de novo": "🥤", "Colocar o pijama": "🌙", "Colocar o uniforme": "👕",
  "Guardar o sapato": "👟", "Apontar o lápis": "✏️", "Guardar o lápis": "✏️", "Apagar o caderno": "📓",
  "Fechar o estojo": "🖊️", "Pegar o pão": "🍞", "Passar manteiga": "🧈", "Colocar o queijo": "🧀",
  "Colocar o recheio": "🥪", "Guardar o pão": "🍞", "Ensaboar o corpo": "🧼", "Vestir roupa": "👕",
  "Vestir a roupa de novo": "👕",
};
const emo = (t: string) => EMOJI[t] ?? "";

// ─── Banco de questões ──────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // ════ FÁCIL — sequência direta, rotinas muito conhecidas, 3 alternativas ════
  { id: "e1", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece depois de acordar?", options: ["Escovar os dentes", "Dormir", "Guardar o carro"],
    explanation: "Depois de acordar, a gente começa o dia — por exemplo, escovando os dentes." },
  { id: "e2", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece antes de calçar o sapato?", options: ["Colocar a meia", "Correr na rua", "Tomar sorvete"],
    explanation: "A meia vem antes do sapato." },
  { id: "e3", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece depois de lavar as mãos?", options: ["Secar as mãos", "Sujar as mãos", "Ir dormir"],
    explanation: "Depois de lavar, a gente seca as mãos." },
  { id: "e4", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece depois de tomar banho?", options: ["Se secar", "Entrar no banho", "Sujar a roupa"],
    explanation: "Depois do banho, a gente se seca com a toalha." },
  { id: "e5", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece antes de comer?", options: ["Preparar a comida", "Lavar a louça", "Dormir"],
    explanation: "Primeiro a comida é preparada, depois a gente come." },
  { id: "e6", diff: "easy", domain: "cause_effect", mode: "before_after",
    prompt: "Está com frio. O que faz sentido fazer?", options: ["Vestir um casaco", "Tirar a roupa", "Tomar sorvete"],
    explanation: "Quando sentimos frio, vestimos um casaco para esquentar." },
  { id: "e7", diff: "easy", domain: "cause_effect", mode: "before_after",
    prompt: "A pessoa suou muito. O que faz sentido depois?", options: ["Tomar banho", "Suar mais", "Vestir um casaco"],
    explanation: "Primeiro a pessoa fica suada, depois pode tomar banho." },
  { id: "e8", diff: "easy", domain: "cause_effect", mode: "before_after",
    prompt: "Começou a chover. O que faz sentido fazer?", options: ["Abrir o guarda-chuva", "Tirar o casaco", "Regar as plantas"],
    explanation: "Quando chove, abrimos o guarda-chuva para não molhar." },
  { id: "e9", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece antes de dormir?", options: ["Colocar o pijama", "Acordar", "Almoçar"],
    explanation: "Antes de dormir, a gente coloca o pijama." },
  { id: "e10", diff: "easy", domain: "cause_effect", mode: "before_after",
    prompt: "A pessoa está com fome. O que faz sentido?", options: ["Preparar a comida", "Dormir", "Tomar banho"],
    explanation: "Com fome, a gente prepara ou pega algo para comer." },
  { id: "e11", diff: "easy", domain: "daily_routine", mode: "before_after",
    prompt: "O que acontece depois de acordar de manhã?", options: ["Levantar da cama", "Dormir de novo", "Jantar"],
    explanation: "Depois de acordar, a gente levanta da cama." },
  { id: "e12", diff: "easy", domain: "cause_effect", mode: "before_after",
    prompt: "Derrubou água no chão. O que faz sentido depois?", options: ["Limpar o chão", "Encher o copo de novo", "Ir dormir"],
    explanation: "Depois de derrubar, a gente limpa o chão." },

  // ════ MÉDIO — mini-história + raciocínio temporal, 4 alternativas ════
  { id: "m1", diff: "medium", domain: "daily_routine", mode: "before_after",
    prompt: "Antes de sair para a escola, Ana ainda está de pijama. O que ela precisa fazer antes de sair?",
    options: ["Trocar de roupa", "Chegar na escola", "Jantar", "Dormir"],
    explanation: "De pijama não dá para sair — primeiro ela troca de roupa." },
  { id: "m2", diff: "medium", domain: "cause_effect", mode: "before_after",
    prompt: "Pedro quer tomar café, mas a xícara ainda está vazia. O que precisa acontecer antes de beber?",
    options: ["Colocar café na xícara", "Lavar a louça depois", "Sair para trabalhar", "Guardar o sapato"],
    explanation: "Antes de beber, é preciso colocar o café na xícara." },
  { id: "m3", diff: "medium", domain: "daily_routine", mode: "before_after",
    prompt: "Marina terminou de tomar banho. O que faz mais sentido acontecer depois?",
    options: ["Se secar com a toalha", "Entrar no banho", "Colocar comida no forno", "Abrir o guarda-chuva"],
    explanation: "Depois do banho, ela se seca com a toalha." },
  { id: "m4", diff: "medium", domain: "cause_effect", mode: "before_after",
    prompt: "João derrubou um copo de água no chão. O que faz sentido ele fazer depois?",
    options: ["Limpar o chão", "Encher o copo de novo", "Ir dormir", "Vestir um casaco"],
    explanation: "Depois de derrubar a água, ele limpa o chão." },
  { id: "m5", diff: "medium", domain: "cause_effect", mode: "before_after",
    prompt: "Está fazendo muito frio na rua. Antes de sair, o que Lia deve fazer?",
    options: ["Vestir um casaco", "Tirar os sapatos", "Tomar sorvete", "Abrir a janela"],
    explanation: "Com frio, antes de sair ela veste um casaco." },
  { id: "m6", diff: "medium", domain: "functional_planning", mode: "before_after",
    prompt: "A mãe vai fazer o almoço, mas a panela está suja. O que precisa acontecer antes?",
    options: ["Lavar a panela", "Servir o almoço", "Comer", "Guardar a panela"],
    explanation: "Antes de cozinhar, é preciso lavar a panela suja." },
  { id: "m7", diff: "medium", domain: "daily_routine", mode: "before_after",
    prompt: "Tomás chegou da rua com as mãos sujas. Antes de comer, o que ele deve fazer?",
    options: ["Lavar as mãos", "Escovar o cabelo", "Calçar o sapato", "Abrir a porta"],
    explanation: "Antes de comer, com as mãos sujas, ele lava as mãos." },
  { id: "m8", diff: "medium", domain: "functional_planning", mode: "before_after",
    prompt: "Carla quer escrever, mas o lápis está sem ponta. O que precisa acontecer antes?",
    options: ["Apontar o lápis", "Guardar o lápis", "Apagar o caderno", "Fechar o estojo"],
    explanation: "Sem ponta não dá para escrever — antes ela aponta o lápis." },
  { id: "m9", diff: "medium", domain: "cause_effect", mode: "before_after",
    prompt: "Bruno sentiu fome no fim da tarde. O que faz sentido acontecer depois?",
    options: ["Preparar um lanche", "Escovar os dentes", "Guardar a comida", "Dormir"],
    explanation: "Com fome, ele prepara um lanche." },
  { id: "m10", diff: "medium", domain: "daily_routine", mode: "before_after",
    prompt: "Rita acabou de jantar. O que faz mais sentido acontecer depois?",
    options: ["Lavar a louça", "Servir o jantar", "Cozinhar o jantar", "Pôr a mesa"],
    explanation: "Depois de jantar, a louça suja é lavada." },
  { id: "m11", diff: "medium", domain: "functional_planning", mode: "missing_step",
    prompt: "Sequência: tirar a roupa → entrar no banho → ___ → se secar. O que falta?",
    options: ["Ensaboar o corpo", "Vestir a roupa", "Sair de casa", "Escovar os dentes"],
    explanation: "Dentro do banho, antes de se secar, a gente se ensaboa." },
  { id: "m12", diff: "medium", domain: "daily_routine", mode: "missing_step",
    prompt: "Sequência: acordar → ___ → tomar café → ir trabalhar. O que falta?",
    options: ["Escovar os dentes", "Voltar pra casa", "Dormir", "Almoçar"],
    explanation: "Entre acordar e o café, normalmente escovamos os dentes." },

  // ════ DIFÍCIL — memória operacional, planejamento, múltiplas etapas ════
  // A) imediatamente anterior/posterior
  { id: "h1", diff: "hard", domain: "functional_planning", mode: "before_after",
    prompt: "Lucas vai sair de casa. Ele já tomou banho, vestiu a roupa e pegou a mochila. O que deve acontecer imediatamente depois?",
    options: ["Trancar a porta ao sair", "Acordar", "Tomar banho", "Colocar a roupa"],
    explanation: "Tudo já foi feito — o último passo antes de sair é trancar a porta." },
  { id: "h2", diff: "hard", domain: "daily_routine", mode: "before_after",
    prompt: "Júlia já encheu a banheira e tirou a roupa. O que vem logo depois?",
    options: ["Entrar na banheira", "Esvaziar a banheira", "Se vestir", "Dormir"],
    explanation: "Com a banheira cheia e a roupa tirada, o próximo passo é entrar na banheira." },
  // B) etapa que falta
  { id: "h3", diff: "hard", domain: "daily_routine", mode: "missing_step",
    prompt: "Sequência: acordar → escovar os dentes → ___ → ir para a escola. O que falta?",
    options: ["Colocar o uniforme", "Voltar da escola", "Dormir", "Lavar a louça"],
    explanation: "Antes de ir à escola, falta colocar o uniforme." },
  { id: "h4", diff: "hard", domain: "functional_planning", mode: "missing_step",
    prompt: "Sequência: pegar o pão → passar manteiga → ___ → comer. O que falta?",
    options: ["Colocar o recheio", "Guardar o pão", "Lavar a louça depois", "Dormir"],
    explanation: "Depois da manteiga, falta colocar o recheio antes de comer." },
  // C) ordenar ações
  { id: "h5", diff: "hard", domain: "functional_planning", mode: "order_sequence",
    prompt: "Coloque em ordem para preparar um sanduíche:",
    sequence: ["Pegar o pão", "Passar manteiga", "Colocar o queijo", "Comer"],
    explanation: "Primeiro o pão, depois a manteiga, o queijo e, por fim, comer." },
  { id: "h6", diff: "hard", domain: "daily_routine", mode: "order_sequence",
    prompt: "Coloque em ordem para sair de casa de manhã:",
    sequence: ["Acordar", "Tomar banho", "Vestir a roupa", "Sair"],
    explanation: "Acordar, tomar banho, vestir a roupa e então sair." },
  { id: "h7", diff: "hard", domain: "daily_routine", mode: "order_sequence",
    prompt: "Coloque em ordem para se calçar:",
    sequence: ["Pegar a meia", "Colocar a meia", "Colocar o sapato"],
    explanation: "Pegar a meia, calçar a meia e depois o sapato." },
  // D) identificar o erro
  { id: "h8", diff: "hard", domain: "daily_routine", mode: "find_error",
    prompt: "Veja a sequência: colocar o sapato → colocar a meia → sair de casa. O que está errado?",
    options: ["A meia deve vir antes do sapato", "O sapato deve vir antes da meia", "Sair de casa deve acontecer primeiro", "Nada está errado"],
    explanation: "A meia sempre vem antes do sapato." },
  { id: "h9", diff: "hard", domain: "functional_planning", mode: "find_error",
    prompt: "Veja a sequência: comer → preparar a comida → lavar a louça. O que está errado?",
    options: ["Preparar a comida deve vir antes de comer", "Lavar a louça deve vir primeiro", "Comer deve vir por último", "Nada está errado"],
    explanation: "Primeiro preparamos a comida, depois comemos e por fim lavamos a louça." },
  { id: "h10", diff: "hard", domain: "daily_routine", mode: "find_error",
    prompt: "Veja a sequência: se secar → entrar no banho → tomar banho. O que está errado?",
    options: ["Tomar banho vem antes de se secar", "Se secar deve vir primeiro", "Nada está errado", "Entrar no banho deve vir por último"],
    explanation: "Entra-se no banho, toma-se banho e só depois a pessoa se seca." },
  // Sequências simbólicas (rodadas só de símbolos — não misturam com ações)
  { id: "h11", diff: "hard", domain: "symbolic_sequence", mode: "missing_step",
    prompt: "Qual número completa a sequência?  1 → 2 → ___ → 4", options: ["3", "5", "1", "6"],
    explanation: "Depois do 2 vem o 3." },
  { id: "h12", diff: "hard", domain: "symbolic_sequence", mode: "before_after",
    prompt: "Qual dia vem antes de quarta-feira?", options: ["Terça-feira", "Quinta-feira", "Segunda-feira", "Sexta-feira"],
    explanation: "Na semana, terça vem antes de quarta." },
  { id: "h13", diff: "hard", domain: "symbolic_sequence", mode: "before_after",
    prompt: "Qual mês vem depois de março?", options: ["Abril", "Fevereiro", "Maio", "Janeiro"],
    explanation: "Depois de março vem abril." },
  { id: "h14", diff: "hard", domain: "symbolic_sequence", mode: "missing_step",
    prompt: "Qual letra completa a sequência?  A → B → ___ → D", options: ["C", "E", "A", "F"],
    explanation: "Depois do B vem o C." },
];

// ─── Sessão / progressão ─────────────────────────────────────────────────────────────
const TOTAL = 8;
const bandOf = (d: number): Diff => { const lv = Math.min(10, Math.max(1, Math.round(d))); return lv <= 3 ? "easy" : lv <= 7 ? "medium" : "hard"; };
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// Monta a sessão: questões do nível, sem repetir; no difícil garante variedade de modos.
function buildSession(band: Diff): Question[] {
  const pool = QUESTIONS.filter((q) => q.diff === band);
  const picked = shuffle(pool).slice(0, Math.min(TOTAL, pool.length));
  if (band === "hard" && !picked.some((q) => q.mode !== "before_after")) {
    const alt = shuffle(pool.filter((q) => q.mode !== "before_after"))[0];
    if (alt) picked[picked.length - 1] = alt;
  }
  // completa até TOTAL repetindo o pool embaralhado, se faltar
  while (picked.length < TOTAL && pool.length) picked.push(shuffle(pool)[0]);
  return picked;
}

// Opções embaralhadas com a correta marcada (para MC).
function mcOptions(q: Question): { text: string; correct: boolean }[] {
  const opts = q.options ?? [];
  return shuffle(opts.map((t, i) => ({ text: t, correct: i === 0 })));
}

// ─── Componente ──────────────────────────────────────────────────────────────────────
// Modo de apresentação (arquitetura unificada): a terapeuta escolhe antes de iniciar.
// visual = sem áudio · visual_audio = texto + áudio · audio_only = só áudio (esconde o texto).
type PresMode = "visual" | "visual_audio" | "audio_only" | null;

export function AntesDepois({ difficulty, onComplete }: AntesDepoisProps) {
  const { begin, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
  const band = bandOf(difficulty);
  const startLevel = Math.min(10, Math.max(1, Math.round(difficulty)));

  const [mode, setMode] = useState<PresMode>(null);
  const sessionRef = useRef<Question[]>([]);
  if (sessionRef.current.length === 0) sessionRef.current = buildSession(band);

  const [idx, setIdx] = useState(0);
  const q = sessionRef.current[idx % sessionRef.current.length];

  // MC
  const [opts, setOpts] = useState<{ text: string; correct: boolean }[]>(() => mcOptions(q));
  const [picked, setPicked] = useState<string | null>(null);
  // ordenação
  const [order, setOrder] = useState<string[]>([]);
  const [orderPool, setOrderPool] = useState<string[]>(() => (q.mode === "order_sequence" ? shuffle(q.sequence ?? []) : []));
  const [result, setResult] = useState<null | boolean>(null);

  const hits = useRef(0);
  const totalRef = useRef(0);
  const rts = useRef<number[]>([]);
  const domains = useRef<Set<string>>(new Set());
  const modes = useRef<Set<string>>(new Set());
  const replays = useRef(0);
  const trialAt = useRef(Date.now());

  const audioAuto = mode === "visual_audio" || mode === "audio_only";   // toca/permite áudio
  const hidePrompt = mode === "audio_only";                              // esconde o texto da pergunta

  // Carrega cada questão: reseta estado + (se o modo tem áudio) fala automaticamente.
  useEffect(() => {
    if (mode === null) return;
    begin();
    trialAt.current = Date.now();
    setPicked(null); setResult(null); setOrder([]);
    const nq = sessionRef.current[idx % sessionRef.current.length];
    setOpts(nq.mode === "order_sequence" ? [] : mcOptions(nq));
    setOrderPool(nq.mode === "order_sequence" ? shuffle(nq.sequence ?? []) : []);
    if (audioAuto) speak(nq.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, mode]);
  useEffect(() => () => stopSpeak(), []);

  const finish = useCallback((finalHits: number) => {
    finishTimer();
    const total = Math.max(1, totalRef.current);
    const acc = finalHits / total;
    const meanRT = rts.current.length ? Math.round(rts.current.reduce((a, b) => a + b, 0) / rts.current.length) : null;
    onComplete({
      exerciseId: "antes-depois", domain: "attention",
      score: calculateExerciseScore("antes-depois", acc, meanRT ?? undefined, difficulty),
      accuracy: acc, reactionTime: meanRT ?? undefined, difficulty: startLevel,
      duration: elapsedSec(),
      metadata: {
        progressionV2: true, accTotal: Number(acc.toFixed(3)), level: startLevel, band,
        trials: total, hits: finalHits, meanReactionTimeMs: meanRT,
        domains: Array.from(domains.current), modes: Array.from(modes.current),
        presentationMode: mode, audioReplays: replays.current,
      },
    });
  }, [difficulty, onComplete, startLevel, band, mode, finishTimer, elapsedSec]);

  function advance(correct: boolean) {
    const newHits = hits.current + (correct ? 1 : 0);
    hits.current = newHits;
    const n = idx + 1;
    totalRef.current = n;
    const timeUp = isTimeUp();
    const delay = correct ? 1700 : 2700;   // erro: tempo p/ ler a explicação
    setTimeout(() => { if (timeUp) finish(newHits); else setIdx(n); }, delay);
  }

  function recordTrial(correct: boolean) {
    rts.current.push(Date.now() - trialAt.current);
    domains.current.add(q.domain); modes.current.add(q.mode);
    setResult(correct);
    advance(correct);
  }

  function pickMC(o: { text: string; correct: boolean }) {
    if (picked || result !== null) return;
    setPicked(o.text);
    if (audioAuto) speak(o.text);
    recordTrial(o.correct);
  }

  function tapOrder(item: string) {
    if (result !== null || order.includes(item)) return;
    const next = [...order, item];
    setOrder(next);
    if (next.length === (q.sequence?.length ?? 0)) {
      const correct = next.every((t, i) => t === q.sequence![i]);
      recordTrial(correct);
    }
  }
  function undoOrder() { if (result === null) setOrder((o) => o.slice(0, -1)); }
  function repeatAudio() { replays.current++; speak(q.prompt); }

  const showEmoji = false;   // visual adulto/clínico — sem emojis nas opções
  const BG = "linear-gradient(160deg,#fbfcff 0%,#eef4ff 48%,#f3effe 100%)";   // branco · azul gelo · lavanda

  // ─── Tela "Configurar atividade" (3 modos; nunca toca som aqui) ──────────────────
  if (mode === null) {
    const ModeBtn = ({ m, icon, label, sub }: { m: Exclude<PresMode, null>; icon: string; label: string; sub: string }) => (
      <button onClick={() => setMode(m)}
        style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: "2px solid #cdd9ea", background: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span><span style={{ display: "block", fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{label}</span>
          <span style={{ fontSize: 12.5, color: "#7c8794" }}>{sub}</span></span>
      </button>
    );
    return (
      <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 22 }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 26, padding: "30px 22px", textAlign: "center", boxShadow: "0 20px 56px rgba(40,60,110,0.18)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,0.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <GitBranch size={28} color="#3b82f6" strokeWidth={2.2} />
          </div>
          <h1 style={{ color: "#1e293b", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Sequência Temporal</h1>
          <p style={{ color: "#5b6677", fontSize: 14, marginBottom: 20, fontWeight: 600 }}>Identifique relações de ordem, causa e consequência</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ModeBtn m="visual" icon="👁️" label="Visual" sub="Só texto na tela, sem som." />
            <ModeBtn m="visual_audio" icon="👁️🔊" label="Visual + áudio" sub="Texto na tela e a pergunta falada." />
            <ModeBtn m="audio_only" icon="🎧" label="Somente áudio" sub="A pergunta é falada; o texto aparece só no fim." />
          </div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 14, lineHeight: 1.4 }}>
            Nos modos com áudio, você pode repetir a pergunta pelo botão de som.
          </p>
        </div>
      </div>
    );
  }

  const pct = progressPct;

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 18px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(59,130,246,0.10)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitBranch size={18} color="#3b82f6" strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1e293b", lineHeight: 1.1 }}>Sequência Temporal</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Identifique relações de ordem, causa e consequência</div>
            </div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.22)", padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
            Raciocínio sequencial
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#dbe4f0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#3b82f6", borderRadius: 4, transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", minWidth: 30, textAlign: "right" }}>{pct}%</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 16px 18px", gap: 16 }}>
        {/* Pergunta (estímulo principal). No modo "Somente áudio" o texto fica oculto até responder. */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: 540 }}>
          <p style={{ color: hidePrompt && result === null ? "#64748b" : "#1e293b", fontSize: 19, fontWeight: 800, textAlign: "center", flex: 1, lineHeight: 1.3 }}>
            {hidePrompt && result === null ? "Ouça a instrução e responda" : q.prompt}
          </p>
          {audioAuto && (
            <button onClick={repeatAudio} title="Ouvir de novo"
              style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", border: "1px solid #cdd9ea", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(40,60,110,0.1)" }}>
              <Volume2 size={18} color="#3b82f6" strokeWidth={2.2} />
            </button>
          )}
        </div>
        {/* Instrução discreta */}
        {result === null && (
          <p style={{ fontSize: 12.5, color: "#94a3b8", textAlign: "center", marginTop: -8, maxWidth: 460 }}>
            {q.mode === "order_sequence" ? "Toque nos eventos na ordem em que acontecem." : "Escolha a alternativa que melhor completa a sequência."}
          </p>
        )}

        {/* Feedback (ícone + explicação curta) */}
        <div style={{ minHeight: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <AnimatePresence mode="wait">
            {result !== null && (
              <motion.div key={`fb-${idx}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                  {result ? <Check size={26} color="#16a34a" strokeWidth={3} /> : <RotateCcw size={24} color="#d97706" strokeWidth={2.6} />}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: result ? "#15803d" : "#b45309", maxWidth: 480, lineHeight: 1.3, marginTop: 2 }}>
                  {result ? "Correto. " : "Não foi dessa vez. "}{q.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Modo ORDENAR ── */}
        {q.mode === "order_sequence" ? (
          <div style={{ width: "100%", maxWidth: 540, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {orderPool.map((item) => {
                const pos = order.indexOf(item);
                const placed = pos >= 0;
                const correctOrder = result !== null && q.sequence![pos] === item;
                return (
                  <motion.button key={item} onClick={() => tapOrder(item)} disabled={placed || result !== null} whileTap={{ scale: 0.95 }}
                    style={{ position: "relative", background: placed ? (result !== null ? (correctOrder ? "#dcfce7" : "#fee2e2") : "#e0e7ff") : "#fff",
                      border: `3px solid ${placed ? (result !== null ? (correctOrder ? "#16a34a" : "#dc2626") : "#6366f1") : "#dbe4f0"}`,
                      borderRadius: 16, padding: "12px 16px", minWidth: 120, fontSize: 15.5, fontWeight: 800, color: "#26324a",
                      cursor: placed || result !== null ? "default" : "pointer", boxShadow: "0 3px 10px rgba(40,60,110,0.08)" }}>
                    {showEmoji && emo(item) && <span style={{ marginRight: 6 }}>{emo(item)}</span>}{item}
                    {placed && <span style={{ position: "absolute", top: -10, left: -10, width: 26, height: 26, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>{pos + 1}</span>}
                  </motion.button>
                );
              })}
            </div>
            {order.length > 0 && result === null && (
              <button onClick={undoOrder} style={{ fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 12, border: "1px solid #cdd9ea", background: "#fff", color: "#64748b", cursor: "pointer" }}>↩ Desfazer</button>
            )}
            {result !== null && (
              <div style={{ fontSize: 12.5, color: "#64748b" }}>Ordem certa: {q.sequence!.join(" → ")}</div>
            )}
          </div>
        ) : (
          /* ── Modos de MÚLTIPLA ESCOLHA (antes/depois, etapa que falta, achar erro) ── */
          <div style={{ display: "grid", width: "100%", maxWidth: 540, gap: 12,
            gridTemplateColumns: opts.length <= 3 ? `repeat(${opts.length},1fr)` : "1fr 1fr" }}>
            {opts.map((o) => {
              const isPicked = picked === o.text;
              const correctPick = isPicked && o.correct;
              const wrongPick = isPicked && !o.correct;
              const revealCorrect = result !== null && o.correct;
              const border = correctPick || revealCorrect ? "#16a34a" : wrongPick ? "#dc2626" : "#dbe4f0";
              const bg = correctPick || revealCorrect ? "#dcfce7" : wrongPick ? "#fee2e2" : "#fff";
              return (
                <motion.button key={o.text} onClick={() => pickMC(o)} disabled={picked !== null || result !== null}
                  whileTap={{ scale: 0.96 }} animate={revealCorrect && !isPicked ? { scale: [1, 1.04, 1] } : {}} transition={{ duration: 0.5 }}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: 18, padding: "16px 12px", minHeight: 78,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center",
                    cursor: picked !== null || result !== null ? "default" : "pointer", boxShadow: "0 4px 14px rgba(99,118,160,0.10)" }}>
                  {showEmoji && emo(o.text) && <span style={{ fontSize: 26, lineHeight: 1 }}>{emo(o.text)}</span>}
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#26324a", lineHeight: 1.2 }}>{o.text}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Dica discreta (rodapé) */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: 500, marginTop: 2, padding: "9px 14px", borderRadius: 12, background: "rgba(59,130,246,0.06)" }}>
          <Lightbulb size={14} color="#3b82f6" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.35, textAlign: "center" }}>
            Pense na sequência natural dos acontecimentos, não apenas em ações relacionadas.
          </span>
        </div>
      </div>
    </div>
  );
}
