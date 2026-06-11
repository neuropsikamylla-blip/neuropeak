"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Reorder } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface OrdemHistoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Step { e: string; t: string; }
interface Story { id: string; name: string; emoji: string; steps: Step[]; distractors?: Step[]; }

// ── Banco de histórias funcionais (20), em ORDEM correta ─────────────────────────
const STORIES: Story[] = [
  // 3 etapas
  { id: "lavar-maos", name: "Lavar as mãos", emoji: "🧼", steps: [
    { e: "🚰", t: "Abrir a torneira" }, { e: "🧼", t: "Passar sabonete" }, { e: "💦", t: "Enxaguar as mãos" } ] },
  { id: "escovar-dentes", name: "Escovar os dentes", emoji: "🪥", steps: [
    { e: "🧴", t: "Colocar pasta na escova" }, { e: "🪥", t: "Escovar os dentes" }, { e: "💦", t: "Enxaguar a boca" } ] },
  { id: "calcar-sapato", name: "Calçar o sapato", emoji: "👟", steps: [
    { e: "👟", t: "Pegar o sapato" }, { e: "🦶", t: "Colocar o pé no sapato" }, { e: "🪢", t: "Amarrar o cadarço" } ] },
  { id: "beber-agua", name: "Beber água", emoji: "🥤", steps: [
    { e: "🥛", t: "Pegar um copo" }, { e: "🚰", t: "Colocar água" }, { e: "😋", t: "Beber" } ] },
  { id: "fazer-cafe", name: "Fazer café", emoji: "☕", steps: [
    { e: "💧", t: "Colocar água" }, { e: "☕", t: "Colocar café" }, { e: "🍵", t: "Servir na xícara" } ] },
  { id: "arrumar-cama", name: "Arrumar a cama", emoji: "🛏️", steps: [
    { e: "🛏️", t: "Esticar o lençol" }, { e: "🪶", t: "Arrumar o travesseiro" }, { e: "🧣", t: "Dobrar a coberta" } ] },
  // 4 etapas
  { id: "tomar-banho", name: "Tomar banho", emoji: "🚿", steps: [
    { e: "🚪", t: "Entrar no banheiro" }, { e: "🚿", t: "Ligar o chuveiro" }, { e: "🧴", t: "Ensaboar o corpo" }, { e: "💦", t: "Se enxaguar" } ] },
  { id: "sanduiche", name: "Fazer um sanduíche", emoji: "🥪", steps: [
    { e: "🍞", t: "Pegar o pão" }, { e: "🧀", t: "Colocar o recheio" }, { e: "🥪", t: "Fechar o sanduíche" }, { e: "🍽️", t: "Servir" } ] },
  { id: "mandar-mensagem", name: "Mandar uma mensagem", emoji: "💬", steps: [
    { e: "📱", t: "Abrir o aplicativo" }, { e: "👤", t: "Escolher o contato" }, { e: "⌨️", t: "Digitar a mensagem" }, { e: "📤", t: "Enviar" } ] },
  { id: "preparar-lanche", name: "Preparar um lanche", emoji: "🥗", steps: [
    { e: "🚰", t: "Lavar os ingredientes" }, { e: "🔪", t: "Cortar os ingredientes" }, { e: "🥪", t: "Montar o lanche" }, { e: "🍽️", t: "Servir o lanche" } ] },
  { id: "guardar-compras", name: "Guardar compras", emoji: "🛍️", steps: [
    { e: "🛍️", t: "Tirar os itens da sacola" }, { e: "🗂️", t: "Separar por tipo" }, { e: "🚪", t: "Guardar nos armários" }, { e: "🧊", t: "Guardar frios na geladeira" } ] },
  { id: "preparar-mochila", name: "Preparar a mochila", emoji: "🎒", steps: [
    { e: "📋", t: "Verificar o que levar" }, { e: "📚", t: "Separar os materiais" }, { e: "🎒", t: "Colocar tudo na mochila" }, { e: "🔒", t: "Fechar a mochila" } ] },
  // 5 etapas
  { id: "pagar-conta", name: "Pagar uma conta", emoji: "🧾", steps: [
    { e: "🧾", t: "Verificar o valor da conta" }, { e: "🏦", t: "Abrir o app do banco" }, { e: "🔍", t: "Conferir os dados" }, { e: "✅", t: "Confirmar o pagamento" }, { e: "📄", t: "Guardar o comprovante" } ] },
  { id: "marcar-consulta", name: "Marcar uma consulta", emoji: "🩺", steps: [
    { e: "🩺", t: "Escolher a especialidade" }, { e: "📅", t: "Verificar horários" }, { e: "✅", t: "Confirmar data e horário" }, { e: "📝", t: "Anotar o compromisso" }, { e: "📄", t: "Separar documentos" } ] },
  { id: "pegar-onibus", name: "Pegar ônibus", emoji: "🚌", steps: [
    { e: "🗺️", t: "Conferir o trajeto" }, { e: "🚏", t: "Ir até o ponto" }, { e: "⏳", t: "Esperar o ônibus certo" }, { e: "🚌", t: "Entrar no ônibus" }, { e: "📍", t: "Descer no ponto certo" } ] },
  { id: "organizar-documentos", name: "Organizar documentos", emoji: "🗂️", steps: [
    { e: "📄", t: "Separar os papéis" }, { e: "🔖", t: "Identificar o tipo" }, { e: "📁", t: "Colocar em pastas" }, { e: "🏷️", t: "Etiquetar as pastas" }, { e: "🗄️", t: "Guardar no local certo" } ] },
  // 6 etapas (com distrator)
  { id: "enviar-email", name: "Enviar documento por e-mail", emoji: "📧", steps: [
    { e: "📎", t: "Localizar o arquivo" }, { e: "📧", t: "Abrir o e-mail" }, { e: "👤", t: "Escrever o destinatário" }, { e: "📌", t: "Anexar o arquivo" }, { e: "🔍", t: "Conferir a mensagem" }, { e: "📤", t: "Enviar" } ],
    distractors: [{ e: "🖨️", t: "Imprimir uma foto" }] },
  { id: "organizar-remedios", name: "Organizar remédios", emoji: "💊", steps: [
    { e: "📋", t: "Conferir a prescrição" }, { e: "💊", t: "Separar os remédios" }, { e: "⏰", t: "Verificar os horários" }, { e: "🗓️", t: "Colocar no organizador" }, { e: "🔒", t: "Guardar em local seguro" }, { e: "🔔", t: "Marcar lembrete" } ],
    distractors: [{ e: "👕", t: "Escolher uma roupa" }] },
  { id: "compra-online", name: "Fazer compra online", emoji: "🛒", steps: [
    { e: "🔍", t: "Pesquisar o produto" }, { e: "⚖️", t: "Comparar as opções" }, { e: "🛒", t: "Colocar no carrinho" }, { e: "📍", t: "Conferir endereço" }, { e: "💳", t: "Escolher pagamento" }, { e: "✅", t: "Confirmar compra" } ],
    distractors: [{ e: "🗑️", t: "Apagar uma mensagem" }] },
  // 7 etapas
  { id: "preparar-consulta", name: "Preparar-se para a consulta", emoji: "🩺", steps: [
    { e: "📅", t: "Conferir data e horário" }, { e: "📄", t: "Separar documentos" }, { e: "🩻", t: "Separar exames anteriores" }, { e: "📍", t: "Confirmar endereço" }, { e: "⏱️", t: "Calcular o deslocamento" }, { e: "🚪", t: "Sair com antecedência" }, { e: "🛎️", t: "Fazer check-in na recepção" } ],
    distractors: [{ e: "🍰", t: "Comprar sobremesa" }, { e: "🔑", t: "Trocar senha do celular" }] },
];

const GLOBAL_DISTRACTORS: Step[] = [
  { e: "📸", t: "Tirar uma foto" }, { e: "📺", t: "Ligar a televisão" }, { e: "🪴", t: "Regar as plantas" },
  { e: "🎵", t: "Ouvir uma música" }, { e: "🛋️", t: "Sentar no sofá" }, { e: "🧹", t: "Varrer a sala" },
  { e: "☎️", t: "Atender o telefone" },
];

// ── Progressão (10 níveis) ───────────────────────────────────────────────────────
type Fb = "full" | "moderate" | "minimal";
interface SLevel { steps: number; distractors: number; feedback: Fb; }
const S_LEVELS: Record<number, SLevel> = {
  1:  { steps: 3, distractors: 0, feedback: "full" },
  2:  { steps: 3, distractors: 0, feedback: "full" },
  3:  { steps: 4, distractors: 0, feedback: "moderate" },
  4:  { steps: 4, distractors: 0, feedback: "moderate" },
  5:  { steps: 5, distractors: 0, feedback: "minimal" },
  6:  { steps: 5, distractors: 1, feedback: "minimal" },
  7:  { steps: 6, distractors: 1, feedback: "minimal" },
  8:  { steps: 6, distractors: 1, feedback: "minimal" },
  9:  { steps: 6, distractors: 2, feedback: "minimal" },
  10: { steps: 7, distractors: 2, feedback: "minimal" },
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 5;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

interface Card { id: string; e: string; t: string; order: number; } // order: índice correto; -1 = distrator

function buildRound(spec: SLevel, recent: Set<string>): { story: Story; cards: Card[]; correctN: number; distractorCount: number } {
  const pool = STORIES.filter((s) => s.steps.length === spec.steps);
  const avail = pool.filter((s) => !recent.has(s.id));
  const list = avail.length ? avail : pool;
  const story = list[Math.floor(Math.random() * list.length)];

  const correct: Card[] = story.steps.map((s, i) => ({ id: `s${i}`, e: s.e, t: s.t, order: i }));

  let distr: Step[] = [];
  if (spec.distractors > 0) {
    const own = story.distractors ? [...story.distractors] : [];
    const extra = shuffle(GLOBAL_DISTRACTORS.filter((g) => !story.steps.some((s) => s.t === g.t)));
    distr = [...own, ...extra].slice(0, spec.distractors);
  }
  const distractorCards: Card[] = distr.map((s, i) => ({ id: `d${i}`, e: s.e, t: s.t, order: -1 }));

  // embaralhar evitando que o 1º card seja a etapa correta nº 1 (anti-previsibilidade)
  let cards = shuffle([...correct, ...distractorCards]);
  let guard = 0;
  while (cards[0].order === 0 && guard++ < 12) cards = shuffle(cards);

  return { story, cards, correctN: correct.length, distractorCount: distractorCards.length };
}

type Phase = "ready" | "playing" | "feedback";
const VIOLET = "#7c5cf0";

export function OrdemHistoria({ difficulty, onComplete }: OrdemHistoriaProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = S_LEVELS[startLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [story, setStory] = useState<Story | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [discarded, setDiscarded] = useState<Card[]>([]);
  const [trial, setTrial] = useState(0);
  const [result, setResult] = useState<{ exact: boolean } | null>(null);

  const recentRef = useRef<string[]>([]);
  const correctNRef = useRef(spec.steps);
  const distractorCountRef = useRef(spec.distractors);
  const gradedRef = useRef<number[]>([]);
  const posCorrectRef = useRef(0);
  const posWrongRef = useRef(0);
  const distractorErrRef = useRef(0);
  const swapsRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const startRoundAt = useRef(0);
  const startTime = useRef(Date.now());

  const startRound = useCallback(() => {
    const r = buildRound(spec, new Set(recentRef.current));
    recentRef.current = [r.story.id, ...recentRef.current].slice(0, 3);
    correctNRef.current = r.correctN;
    distractorCountRef.current = r.distractorCount;
    setStory(r.story); setCards(r.cards); setDiscarded([]); setResult(null);
    startRoundAt.current = Date.now();
    setPhase("playing");
  }, [spec]);

  function begin() {
    gradedRef.current = []; posCorrectRef.current = 0; posWrongRef.current = 0; distractorErrRef.current = 0;
    swapsRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    startRound();
  }

  function onReorder(next: Card[]) { swapsRef.current++; setCards(next); }
  function discard(card: Card) {
    if (phase !== "playing") return;
    setCards((cs) => cs.filter((c) => c.id !== card.id));
    setDiscarded((d) => [...d, card]);
  }
  function restore(card: Card) {
    if (phase !== "playing") return;
    setDiscarded((d) => d.filter((c) => c.id !== card.id));
    setCards((cs) => [...cs, card]);
  }

  const finish = useCallback(() => {
    const accTotal = gradedRef.current.length ? gradedRef.current.reduce((a, b) => a + b, 0) / gradedRef.current.length : 0;
    const exactCount = gradedRef.current.filter((g) => g >= 0.999).length;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "ordem-historia",
      domain: "executive",
      score: calculateExerciseScore("ordem-historia", accTotal, meanRT ?? undefined, difficulty),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: startLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        impulsive: distractorErrRef.current > TRIALS,
        level: startLevel,
        startedLevel: startLevel,
        steps: spec.steps,
        distractors: spec.distractors,
        feedbackLevel: spec.feedback,
        positionsCorrect: posCorrectRef.current,
        positionsWrong: posWrongRef.current,
        distractorErrors: distractorErrRef.current,
        swaps: swapsRef.current,
        sequencesCorrect: exactCount,
        sequencesIncorrect: TRIALS - exactCount,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec]);

  function confirmOrder() {
    if (phase !== "playing") return;
    const N = correctNRef.current;
    const posCorrect = cards.filter((c, i) => c.order === i && c.order >= 0).length;
    const distrInActive = cards.filter((c) => c.order < 0).length;
    const realDiscarded = discarded.filter((c) => c.order >= 0).length;
    const distractorErrors = distrInActive + realDiscarded;
    const exact = posCorrect === N && distractorErrors === 0 && cards.length === N;
    const graded = Math.max(0, (posCorrect - distractorErrors) / N);

    gradedRef.current.push(graded);
    posCorrectRef.current += posCorrect;
    posWrongRef.current += (cards.length - posCorrect);
    distractorErrRef.current += distractorErrors;
    rtsRef.current.push(Date.now() - startRoundAt.current);

    setResult({ exact });
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, exact ? 1600 : 2800);
  }

  useEffect(() => () => {}, []);

  const pct = Math.round((trial / TRIALS) * 100);

  // ── READY ──
  if (phase === "ready" || !story) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 26, padding: "26px 22px", textAlign: "center",
          boxShadow: "0 22px 60px rgba(80,60,140,0.18)" }}>
          <div style={{ margin: "0 auto 14px", width: 70, height: 70, borderRadius: "50%", background: "rgba(124,92,240,0.12)",
            border: "1px solid rgba(124,92,240,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>📖</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2a2440", marginBottom: 8 }}>Ordem da História</h2>
          <div style={{ textAlign: "left", fontSize: 13, color: "#5b5470", margin: "0 auto 8px", maxWidth: 320, lineHeight: 1.7 }}>
            <div>1. Leia a situação do dia a dia.</div>
            <div>2. Arraste os cartões para a ordem correta.</div>
            <div>3. Pense no que precisa acontecer primeiro.</div>
            {spec.distractors > 0 && <div>4. Descarte as etapas que não fazem parte.</div>}
            <div>{spec.distractors > 0 ? "5." : "4."} Toque em <b>Confirmar Ordem</b>.</div>
          </div>
          <p style={{ fontSize: 11.5, color: "#9a93b0", marginBottom: 18 }}>
            Começa no nível {startLevel} ({spec.steps} etapas{spec.distractors ? ` · ${spec.distractors} distrator(es)` : ""}) — onde parou.
          </p>
          <button onClick={begin} style={{ width: "100%", height: 52, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
            cursor: "pointer", background: "linear-gradient(135deg,#7c5cf0,#6d4fd6)", boxShadow: "0 6px 18px rgba(109,79,214,0.4)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  const showCorrectOrder = phase === "feedback" && !result?.exact && spec.feedback === "full";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden",
      background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#2a2440" }}>Ordem da História</div>
            <div style={{ fontSize: 11.5, color: "#9a93b0" }}>Nível {startLevel} · {spec.steps} etapas{spec.distractors ? ` · descarte ${spec.distractors}` : ""}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: VIOLET }}>{Math.min(trial + 1, TRIALS)}/{TRIALS}</div>
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#e2dcf3", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c5cf0,#a78bfa)", borderRadius: 4, transition: "width .4s" }} />
        </div>
      </div>

      {/* Situação */}
      <div style={{ flexShrink: 0, textAlign: "center", padding: "4px 18px 10px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 16px", borderRadius: 100, background: "#fff",
          boxShadow: "0 4px 14px rgba(80,60,140,0.12)" }}>
          <span style={{ fontSize: 22 }}>{story.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#2a2440" }}>{story.name}</span>
        </div>
        <p style={{ fontSize: 12.5, color: "#7c7596", marginTop: 8 }}>
          {phase === "feedback"
            ? (result?.exact ? "✅ Sequência correta!" : "Quase lá — veja abaixo")
            : "Coloque as etapas na ordem certa, do primeiro ao último."}
        </p>
      </div>

      {/* Lista arrastável */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 8px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <Reorder.Group axis="y" values={cards} onReorder={onReorder} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {cards.map((card, i) => {
              const fbCorrect = phase === "feedback" && card.order === i && card.order >= 0;
              const fbWrong = phase === "feedback" && card.order !== i;
              const border = fbCorrect ? "#34d399" : fbWrong ? "#f59e0b" : "rgba(124,92,240,0.18)";
              const numBg = fbCorrect ? "#34d399" : fbWrong ? "#f59e0b" : VIOLET;
              return (
                <Reorder.Item key={card.id} value={card} drag={phase === "playing" ? "y" : false}
                  whileDrag={{ scale: 1.04, boxShadow: "0 14px 30px rgba(80,60,140,0.3)", zIndex: 5 }}
                  style={{ listStyle: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", background: "#fff", borderRadius: 16,
                    border: `2px solid ${border}`, boxShadow: "0 3px 10px rgba(80,60,140,0.1)", cursor: phase === "playing" ? "grab" : "default" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: numBg, color: "#fff", fontWeight: 900, fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                    <span style={{ fontSize: 30, flexShrink: 0 }}>{card.e}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: "#322c4a" }}>{card.t}</span>
                    {phase === "feedback" && <span style={{ fontSize: 18 }}>{fbCorrect ? "✅" : "⚠️"}</span>}
                    {phase === "playing" && distractorCountRef.current > 0 && (
                      <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => discard(card)} title="Descartar etapa"
                        style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer",
                          background: "#fdecec", color: "#e05757", fontWeight: 900, fontSize: 14, lineHeight: 1 }}>×</button>
                    )}
                    {phase === "playing" && <span style={{ flexShrink: 0, color: "#c4bce0", fontSize: 18, paddingRight: 2 }}>⠿</span>}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* Descartados */}
          {(discarded.length > 0 || (phase === "playing" && distractorCountRef.current > 0)) && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#9a93b0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                🗑️ Descartados {phase === "playing" ? "(toque para devolver)" : ""}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 40 }}>
                {discarded.length === 0 ? (
                  <span style={{ fontSize: 12, color: "#b3acc8", fontStyle: "italic" }}>Use o × para descartar etapas que não fazem parte.</span>
                ) : discarded.map((card) => {
                  const wrongDiscard = phase === "feedback" && card.order >= 0;
                  return (
                    <button key={card.id} onClick={() => restore(card)} disabled={phase !== "playing"}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 12, cursor: phase === "playing" ? "pointer" : "default",
                        background: "#fff", border: `1.5px solid ${wrongDiscard ? "#f59e0b" : "#e2dcf3"}`, opacity: 0.92 }}>
                      <span style={{ fontSize: 18 }}>{card.e}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#7c7596", textDecoration: "line-through" }}>{card.t}</span>
                      {phase === "feedback" && <span style={{ fontSize: 13 }}>{card.order < 0 ? "✅" : "⚠️"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ordem correta (só feedback completo + erro) */}
          {showCorrectOrder && (
            <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 14, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0f9d6e", marginBottom: 6 }}>Ordem correta:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {story.steps.map((s, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#2a2440", fontWeight: 600 }}>
                    <b style={{ color: "#0f9d6e" }}>{i + 1}.</b> {s.e} {s.t}{i < story.steps.length - 1 ? " →" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmar */}
      {phase === "playing" && (
        <div style={{ flexShrink: 0, padding: "8px 16px 16px" }}>
          <button onClick={confirmOrder} disabled={cards.length === 0}
            style={{ width: "100%", maxWidth: 480, margin: "0 auto", display: "block", height: 52, borderRadius: 16, border: "none", color: "#fff",
              fontWeight: 800, fontSize: 15, cursor: "pointer", background: "linear-gradient(135deg,#7c5cf0,#6d4fd6)", boxShadow: "0 6px 18px rgba(109,79,214,0.4)" }}>
            Confirmar Ordem
          </button>
        </div>
      )}
    </div>
  );
}
