"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  DndContext, closestCenter, MouseSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { HISTORIAS, HISTORIAS_INTRUSO, HISTORIAS_DESCUBRA, histPanelSrc, descubraScene, descubraOption, type HistDiff } from "@/data/historias";
import type { ExerciseResult, Theme } from "@/types";

interface OrdemHistoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  // Liberação dos desafios pelo terapeuta (config do plano). Sem isso, só desbloqueia sozinho no nível 10.
  settings?: { unlockIntruso?: boolean; unlockFalta?: boolean };
}

const VIOLET = "#7c5cf0";
const TRIALS = 5;
const INTRUDER_ORDER = 7;                 // intruso: a cena com order===7 é a que NÃO pertence

type RoundMode = "ordem" | "intruso" | "falta";

// nível (1-10) → dificuldade das histórias (nº de cenas)
function tierForLevel(lvl: number): HistDiff {
  if (lvl <= 2) return "faceis";          // 4 cenas
  if (lvl <= 5) return "media";           // 5
  if (lvl <= 8) return "dificil";         // 6
  return "muito-dificil";                 // 8
}
const DIFF_LABEL: Record<HistDiff, string> = { faceis: "fácil", media: "média", dificil: "difícil", "muito-dificil": "muito difícil" };
const PANELS: Record<HistDiff, number> = { faceis: 4, media: 5, dificil: 6, "muito-dificil": 8 };

const MAX_ATTEMPTS = 3;   // tentativas por rodada nos desafios antes de revelar a resposta
// Dicas progressivas (textos da Kamylla). Usar dica reduz a pontuação da rodada.
const HINTS: Record<"intruso" | "falta", string[]> = {
  intruso: [
    "Todas as imagens devem combinar com a mesma história.",
    "Procure a imagem que mostra uma ação diferente das outras.",
    "A imagem intrusa não ajuda a contar essa história.",
  ],
  falta: [
    "Pense no que deveria acontecer entre as imagens.",
    "Veja o que falta para a história fazer sentido.",
    "Escolha a imagem que conecta melhor o antes e o depois.",
  ],
};
// Pontuação: cada dica e cada tentativa extra reduzem o acerto da rodada.
function penalize(raw: number, hints: number, tries: number): number {
  const hintF = Math.max(0.4, 1 - 0.18 * hints);
  const tryF = Math.max(0.3, 1 - 0.25 * (tries - 1));
  return raw * hintF * tryF;
}

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function pickFrom<T extends { id: string }>(pool: T[], recent: Set<string>): T {
  const avail = pool.filter((h) => !recent.has(h.id));
  const list = avail.length ? avail : pool;
  return list[Math.floor(Math.random() * list.length)];
}

interface Card { id: string; order: number; } // order = índice correto (0-based); imagem = histPanelSrc(story.id, order+1)
interface Option { id: string; src: string; a: number; correct: boolean; }

function buildOrdem(intruso: boolean, tier: HistDiff, recent: Set<string>): { storyId: string; a: number; cards: Card[] } {
  const story = intruso
    ? pickFrom(HISTORIAS_INTRUSO, recent)
    : pickFrom(HISTORIAS.filter((h) => h.diff === tier), recent);
  const correct: Card[] = Array.from({ length: story.n }, (_, i) => ({ id: `c${i}`, order: i })); // intruso: order 7 = intrusa
  let cards = shuffle(correct);
  let guard = 0;
  while (cards[0].order === 0 && guard++ < 12) cards = shuffle(cards);   // anti-previsibilidade
  return { storyId: story.id, a: story.a, cards };
}

// "Descubra o que falta": base DEDICADA — 7 cenas (em ordem) + 3 opções da própria prancha.
// A opção certa (story.correct) é embaralhada entre A/B/C a cada partida.
function buildFalta(recent: Set<string>): { storyId: string; a: number; cards: Card[]; options: Option[] } {
  const story = pickFrom(HISTORIAS_DESCUBRA, recent);
  const cards: Card[] = Array.from({ length: 7 }, (_, i) => ({ id: `c${i}`, order: i }));   // cena1..7 em ordem
  const opts: Option[] = [1, 2, 3].map((n) => ({
    id: `op${n}`, src: descubraOption(story.id, n), a: story.oa, correct: (n - 1) === story.correct,
  }));
  return { storyId: story.id, a: story.a, cards, options: shuffle(opts) };
}

type Phase = "ready" | "playing" | "feedback";

// ── Card arrastável (modos ordem/intruso) ──
function SortableScene({
  card, posNum, isMarked, intruso, storyId, aspect, phase, onMark,
}: {
  card: Card; posNum?: number; isMarked: boolean; intruso: boolean;
  storyId: string; aspect: number; phase: Phase; onMark: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled: phase !== "playing" });

  const fb = phase === "feedback";
  const correctPos = posNum != null && card.order === posNum - 1;
  const intruderRight = card.order === INTRUDER_ORDER;

  let border: string;
  if (intruso && isMarked) border = fb ? (intruderRight ? "#34d399" : "#ef4444") : "#ef4444";
  else border = fb ? (correctPos ? "#34d399" : "#f59e0b") : "rgba(124,92,240,0.35)";

  const numBg = fb ? (correctPos ? "#34d399" : "#f59e0b") : VIOLET;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    touchAction: "manipulation",
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.92 : isMarked && !fb ? 0.62 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(phase === "playing" ? listeners : {})}>
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden", background: "#fff",
        border: `3px solid ${border}`,
        boxShadow: isDragging ? "0 14px 30px rgba(80,60,140,0.35)" : "0 3px 10px rgba(80,60,140,0.14)",
        cursor: phase === "playing" ? "grab" : "default",
        transform: isDragging ? "scale(1.04)" : "none", transition: "box-shadow .15s, transform .12s",
      }}>
        <div style={{ width: "100%", aspectRatio: String(aspect), background: "#f4f1fb" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={histPanelSrc(storyId, card.order + 1)} alt="" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", pointerEvents: "none" }} />
        </div>

        {intruso && isMarked && (
          <div style={{ position: "absolute", inset: 0, background: fb && intruderRight ? "rgba(52,211,153,0.32)" : "rgba(239,68,68,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.45)" }}>
              {fb ? (intruderRight ? "✓" : "✗") : "✗"}
            </span>
          </div>
        )}

        {posNum != null && (
          <span style={{ position: "absolute", top: 6, left: 6, minWidth: 26, height: 26, padding: "0 6px", borderRadius: 13,
            background: numBg, color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }}>{fb ? (correctPos ? "✓" : posNum) : posNum}</span>
        )}

        {intruso && phase === "playing" && (
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onMark(card.id); }}
            aria-label={isMarked ? "desfazer intrusa" : "marcar como intrusa"}
            style={{ position: "absolute", top: 6, right: 6, height: 26, padding: "0 9px", borderRadius: 13, border: "none",
              background: isMarked ? "#ef4444" : "rgba(44,36,64,0.6)", color: "#fff", fontSize: 11.5, fontWeight: 900,
              display: "flex", alignItems: "center", gap: 3, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.28)" }}>{isMarked ? "↩ tirar" : "✗ não é"}</button>
        )}

        {!intruso && phase === "playing" && (
          <span aria-hidden style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 7,
            background: "rgba(44,36,64,0.45)", color: "#fff", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>⠿</span>
        )}
      </div>
    </div>
  );
}

export function OrdemHistoria({ difficulty, onComplete, settings }: OrdemHistoriaProps) {
  const reportProgress = useExerciseProgress();
  // Trilha (estágio salvo em currentDifficulty): 1-10 = ordenar; 11 = Encontre o Intruso; 12 = Descubra o que falta.
  const stage = Math.min(12, Math.max(1, Math.round(difficulty)));
  // Atalho do terapeuta: ligar um desafio sobe o estágio efetivo da sessão.
  const sIntruso = settings?.unlockIntruso === true;
  const sFalta = settings?.unlockFalta === true;
  let effStage = stage;
  if (sFalta) effStage = Math.max(effStage, 12);
  else if (sIntruso) effStage = Math.max(effStage, 11);
  const sessionMode: RoundMode = effStage >= 12 ? "falta" : effStage === 11 ? "intruso" : "ordem";
  const unlocked = sessionMode !== "ordem";
  const startLevel = Math.min(10, effStage);   // nível de ordenação (1-10) p/ tier e rótulos
  const reportLevel = effStage;                // estágio salvo na progressão (1-12)
  const tier = tierForLevel(startLevel);

  const [phase, setPhase] = useState<Phase>("ready");
  const [roundMode, setRoundMode] = useState<RoundMode>("ordem");
  const [storyId, setStoryId] = useState("");
  const [storyA, setStoryA] = useState(1.5);
  const [cards, setCards] = useState<Card[]>([]);
  const [marked, setMarked] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [trial, setTrial] = useState(0);
  const [result, setResult] = useState<{ exact: boolean } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);          // dicas reveladas nesta rodada (0-3)
  const [attempts, setAttempts] = useState(1);            // tentativa atual nesta rodada
  const [wrongOpts, setWrongOpts] = useState<string[]>([]); // opções já erradas (falta)
  const [flash, setFlash] = useState("");                 // mensagem transitória ("tente outra")
  const [wide, setWide] = useState(false);   // tela larga (computador) → cards maiores

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 760);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Pré-carrega a 1ª rodada já na tela de abertura (some o delay de imagem ao começar).
  useEffect(() => {
    if (!pendingRef.current) pendingRef.current = makeRound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentRef = useRef<string[]>([]);
  const gradedRef = useRef<number[]>([]);
  const posCorrectRef = useRef(0);
  const posWrongRef = useRef(0);
  const swapsRef = useRef(0);
  const intruderHitsRef = useRef(0);
  const faltaHitsRef = useRef(0);
  const hintsUsedRef = useRef(0);   // total de dicas usadas na sessão
  const retriesRef = useRef(0);     // total de tentativas extras (erros antes do acerto)
  const pendingRef = useRef<{ mode: RoundMode; storyId: string; a: number; cards: Card[]; options: Option[] } | null>(null);
  const firstRespRef = useRef<number[]>([]);   // tempo até a 1ª resposta por rodada (ms)
  const roundFirstAt = useRef<number | null>(null);
  const rtsRef = useRef<number[]>([]);
  const startRoundAt = useRef(0);
  const startTime = useRef(Date.now());

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // pré-carrega imagens no navegador (warming do cache) — troca de rodada sem delay.
  function preloadUrls(urls: string[]) {
    if (typeof window === "undefined") return;
    for (const u of urls) { const im = new window.Image(); im.src = u; }
  }
  // monta a próxima rodada (dedup + pré-carrega as imagens dela).
  function makeRound(): { mode: RoundMode; storyId: string; a: number; cards: Card[]; options: Option[] } {
    if (sessionMode === "falta") {
      const r = buildFalta(new Set(recentRef.current));
      recentRef.current = [r.storyId, ...recentRef.current].slice(0, 6);
      preloadUrls([...Array.from({ length: 7 }, (_, i) => descubraScene(r.storyId, i + 1)), ...r.options.map((o) => o.src)]);
      return { mode: "falta", storyId: r.storyId, a: r.a, cards: r.cards, options: r.options };
    }
    const r = buildOrdem(sessionMode === "intruso", tier, new Set(recentRef.current));
    recentRef.current = [r.storyId, ...recentRef.current].slice(0, 6);
    preloadUrls(Array.from({ length: r.cards.length }, (_, i) => histPanelSrc(r.storyId, i + 1)));
    return { mode: sessionMode, storyId: r.storyId, a: r.a, cards: r.cards, options: [] };
  }
  function markFirst() { if (roundFirstAt.current === null) roundFirstAt.current = Date.now(); }
  function startRound() {
    const data = pendingRef.current ?? makeRound();   // usa a rodada já pré-carregada, se houver
    pendingRef.current = null;
    roundFirstAt.current = null;
    setRoundMode(data.mode); setMarked(null); setPicked(null); setResult(null);
    setHintLevel(0); setAttempts(1); setWrongOpts([]); setFlash("");
    setStoryId(data.storyId); setStoryA(data.a); setCards(data.cards); setOptions(data.options);
    startRoundAt.current = Date.now();
    setPhase("playing");
    pendingRef.current = makeRound();                 // já adianta a PRÓXIMA rodada em background
  }

  function begin() {
    gradedRef.current = []; posCorrectRef.current = 0; posWrongRef.current = 0;
    swapsRef.current = 0; intruderHitsRef.current = 0; faltaHitsRef.current = 0;
    hintsUsedRef.current = 0; retriesRef.current = 0;
    firstRespRef.current = []; roundFirstAt.current = null;
    rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    startRound();   // usa a 1ª rodada já pré-carregada na abertura (pendingRef)
  }

  function useHint() {
    if (phase !== "playing" || roundMode === "ordem") return;
    markFirst();
    setHintLevel((h) => {
      const max = HINTS[roundMode].length;
      const n = Math.min(max, h + 1);
      if (n > h) { hintsUsedRef.current++; setFlash(""); }
      return n;
    });
  }

  function onDragEnd(e: DragEndEvent) {
    if (phase !== "playing") return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === active.id);
      const to = prev.findIndex((c) => c.id === over.id);
      if (from < 0 || to < 0) return prev;
      swapsRef.current++;
      return arrayMove(prev, from, to);
    });
    markFirst();
  }

  function toggleMark(id: string) { if (phase === "playing") { markFirst(); setMarked((prev) => (prev === id ? null : id)); } }

  const finish = useCallback(() => {
    const accTotal = gradedRef.current.length ? gradedRef.current.reduce((a, b) => a + b, 0) / gradedRef.current.length : 0;
    const exactCount = gradedRef.current.filter((g) => g >= 0.999).length;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const meanFirst = firstRespRef.current.length ? Math.round(firstRespRef.current.reduce((a, b) => a + b, 0) / firstRespRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "ordem-historia",
      domain: "executive",
      score: calculateExerciseScore("ordem-historia", accTotal, meanRT ?? undefined, Math.min(10, difficulty)),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: reportLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        level: reportLevel,
        startedLevel: reportLevel,
        mode: sessionMode,
        tier,
        positionsCorrect: posCorrectRef.current,
        positionsWrong: posWrongRef.current,
        swaps: swapsRef.current,
        intruderHits: intruderHitsRef.current,
        faltaHits: faltaHitsRef.current,
        hintsUsed: hintsUsedRef.current,
        retries: retriesRef.current,
        sequencesCorrect: exactCount,
        sequencesIncorrect: TRIALS - exactCount,
        meanReactionTimeMs: meanRT,
        timeToFirstMs: meanFirst,
      },
    });
  }, [onComplete, difficulty, reportLevel, tier, sessionMode]);

  function advance(wasExact: boolean) {
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, wasExact ? 1900 : 3200);
  }

  function record(acc: number, exact: boolean) {
    gradedRef.current.push(acc);
    rtsRef.current.push(Date.now() - startRoundAt.current);
    firstRespRef.current.push((roundFirstAt.current ?? Date.now()) - startRoundAt.current);
    setResult({ exact });
    setPhase("feedback");
    advance(exact);
  }

  function submit() {
    if (phase !== "playing") return;

    // ── Descubra o que falta: escolha A/B/C, com tentativas ──
    if (roundMode === "falta") {
      if (!picked) return;
      const opt = options.find((o) => o.id === picked);
      if (!opt) return;
      if (!opt.correct) {
        retriesRef.current++;
        const nextAttempt = attempts + 1;
        if (nextAttempt > MAX_ATTEMPTS) {
          record(0, false);                 // acabou as tentativas → revela a certa
        } else {
          setWrongOpts((w) => [...w, picked]);
          setAttempts(nextAttempt);
          setPicked(null);
          setFlash("Não é essa. Pense de novo e tente outra opção.");
        }
        return;
      }
      faltaHitsRef.current++;
      record(penalize(1, hintLevel, attempts), true);
      return;
    }

    // ── Encontre o Intruso: marca a intrusa + ordena (envio único) ──
    if (roundMode === "intruso") {
      if (!marked) return;
      const markedCard = cards.find((c) => c.id === marked);
      const intruderRight = !!markedCard && markedCard.order === INTRUDER_ORDER;
      const seq = cards.filter((c) => c.id !== marked);
      const posCorrect = seq.filter((c, i) => c.order === i).length;
      const exact = intruderRight && posCorrect === seq.length;
      posCorrectRef.current += posCorrect; posWrongRef.current += (seq.length - posCorrect);
      if (intruderRight) intruderHitsRef.current++;
      record(penalize(((intruderRight ? 1 : 0) + posCorrect) / 8, hintLevel, 1), exact);
      return;
    }

    // ── Ordenar a história ──
    const n = cards.length;
    const posCorrect = cards.filter((c, i) => c.order === i).length;
    posCorrectRef.current += posCorrect; posWrongRef.current += (n - posCorrect);
    record(n ? posCorrect / n : 0, posCorrect === n);
  }

  const pct = Math.round((trial / TRIALS) * 100);
  const intruso = roundMode === "intruso";
  const falta = roundMode === "falta";

  // grade dos modos ordem/intruso — no computador (wide) os cards crescem; no celular mantém 2 colunas
  const nPanels = falta ? 7 : (intruso ? 8 : PANELS[tier]);
  const cols = !wide ? 2 : nPanels <= 4 ? 2 : nPanels <= 6 ? 3 : 4;
  const cardTarget = nPanels <= 4 ? 300 : nPanels <= 6 ? 250 : 210;   // largura-alvo do card no desktop
  const gridCols = `repeat(${cols}, minmax(0,1fr))`;
  const gridMax = wide ? cols * cardTarget : 460;
  const faltaMax = wide ? 760 : 520;

  // numeração (intruso pula a marcada)
  const posOf: Record<string, number> = {};
  let pcount = 0;
  for (const c of cards) { if (intruso && c.id === marked) continue; pcount++; posOf[c.id] = pcount; }

  // ── READY ──
  if (phase === "ready" || !storyId) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 26, padding: "26px 22px", textAlign: "center",
          boxShadow: "0 22px 60px rgba(80,60,140,0.18)" }}>
          <div style={{ margin: "0 auto 14px", width: 70, height: 70, borderRadius: "50%", background: unlocked ? "rgba(239,68,68,0.12)" : "rgba(124,92,240,0.12)",
            border: `1px solid ${unlocked ? "rgba(239,68,68,0.3)" : "rgba(124,92,240,0.28)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>{sessionMode === "intruso" ? "🔍" : sessionMode === "falta" ? "🧩" : "📖"}</div>
          {unlocked && <div style={{ fontSize: 12, fontWeight: 900, color: "#ef4444", letterSpacing: 0.5, marginBottom: 4 }}>🔓 DESAFIO DESBLOQUEADO</div>}
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2a2440", marginBottom: 8 }}>{sessionMode === "intruso" ? "Encontre o Intruso" : sessionMode === "falta" ? "Descubra o que falta" : "Ordem da História"}</h2>
          <div style={{ textAlign: "left", fontSize: 13, color: "#5b5470", margin: "0 auto 10px", maxWidth: 320, lineHeight: 1.7 }}>
            {unlocked ? (
              sessionMode === "intruso" ? (
                <div><b>🔍 Encontre o Intruso:</b> uma das cenas não faz parte da história. Toque na intrusa (✗) e ordene as outras.</div>
              ) : (
                <div><b>🧩 Descubra o que falta:</b> veja a história e escolha (A, B ou C) a cena que a completa.</div>
              )
            ) : (
              <>
                <div>1. Veja as cenas da história — estão fora de ordem.</div>
                <div>2. Arraste os cartões para montar a sequência certa.</div>
                <div>3. O número no canto mostra a posição de cada cena.</div>
                <div>4. Toque em <b>Confirmar Ordem</b>.</div>
              </>
            )}
          </div>
          <p style={{ fontSize: 11.5, color: "#9a93b0", marginBottom: 18 }}>
            {unlocked ? "Você dominou a Ordem da História! Hora dos desafios." : `Começa no nível ${startLevel} (${PANELS[tier]} cenas · ${DIFF_LABEL[tier]}) — onde parou.`}
          </p>
          <button onClick={begin} style={{ width: "100%", height: 52, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
            cursor: "pointer", background: unlocked ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#7c5cf0,#6d4fd6)", boxShadow: "0 6px 18px rgba(109,79,214,0.4)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  const canSubmit = phase === "playing" && (falta ? !!picked : intruso ? !!marked : true);
  const headerTitle = falta ? "🧩 Descubra o que falta" : intruso ? "🔍 Encontre o Intruso" : "Ordem da História";
  const headerSub = falta ? "Escolha a cena que completa a história"
    : intruso ? "Ache a cena errada e ordene as outras"
    : `Nível ${startLevel} · ${nPanels} cenas · ${DIFF_LABEL[tier]}`;
  const instruction = phase === "feedback"
    ? (result?.exact ? (falta ? "✅ Isso! Cena certa." : intruso ? "✅ Mandou bem!" : "✅ Ordem correta!") : (falta ? "Não era essa. Veja a certa (verde)." : "Quase! Veja as marcações"))
    : (falta ? "Veja a história e toque na opção (A, B ou C) que completa."
      : intruso ? "Marque a cena intrusa (✗) e arraste as outras na ordem."
      : "Arraste as cenas para a ordem certa — do começo ao fim.");

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden",
      background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#2a2440" }}>{headerTitle}</div>
            <div style={{ fontSize: 11.5, color: "#9a93b0" }}>{headerSub}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: VIOLET }}>{Math.min(trial + 1, TRIALS)}/{TRIALS}</div>
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#e2dcf3", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c5cf0,#a78bfa)", borderRadius: 4, transition: "width .4s" }} />
        </div>
      </div>

      {/* Instrução + dicas */}
      <div style={{ flexShrink: 0, textAlign: "center", padding: "2px 18px 8px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#5b5470" }}>{instruction}</p>
        {phase === "playing" && flash && (
          <p style={{ fontSize: 12.5, fontWeight: 800, color: "#ef4444", margin: "4px 0 0" }}>{flash}</p>
        )}
        {(intruso || falta) && hintLevel > 0 && (
          <div style={{ maxWidth: 460, margin: "8px auto 0", display: "flex", flexDirection: "column", gap: 4 }}>
            {HINTS[falta ? "falta" : "intruso"].slice(0, hintLevel).map((h, i) => (
              <div key={i} style={{ fontSize: 12, fontWeight: 600, color: "#6d4fd6", background: "rgba(124,92,240,0.1)",
                border: "1px solid rgba(124,92,240,0.25)", borderRadius: 10, padding: "6px 10px", textAlign: "left" }}>💡 {h}</div>
            ))}
          </div>
        )}
      </div>

      {/* Corpo */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 16px 8px" }}>
        {falta ? (
          <div style={{ maxWidth: faltaMax, margin: "0 auto" }}>
            {/* história (7 cenas, em ordem, só leitura) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
              {cards.map((c, i) => (
                <div key={c.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#fff", border: "2px solid #e2dcf3" }}>
                  <div style={{ width: "100%", aspectRatio: String(storyA), background: "#f4f1fb" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={descubraScene(storyId, i + 1)} alt="" draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <span style={{ position: "absolute", top: 4, left: 4, width: 20, height: 20, borderRadius: 10, background: VIOLET,
                    color: "#fff", fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                </div>
              ))}
              {/* lacuna "?" da cena que falta */}
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#efeaff", border: "2px dashed #b5a6f0",
                display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: String(storyA) }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "#8b7bdc" }}>?</span>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: 13.5, fontWeight: 800, color: "#2a2440", margin: "0 0 10px" }}>Qual cena completa a história?</p>

            {/* opções A/B/C */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {options.map((o, i) => {
                const letter = ["A", "B", "C"][i];
                const fb = phase === "feedback";
                const isPicked = picked === o.id;
                const tried = wrongOpts.includes(o.id);          // já errada nesta rodada
                const locked = phase !== "playing" || tried;
                let bd = isPicked ? VIOLET : tried ? "#ef4444" : "transparent";
                if (fb) bd = o.correct ? "#34d399" : isPicked ? "#ef4444" : "transparent";
                const labelBg = fb && o.correct ? "#15803d" : (fb && isPicked) || (tried && !fb) ? "#b91c1c" : "#2a2440";
                return (
                  <button key={o.id} onClick={() => { if (phase === "playing" && !tried) { markFirst(); setPicked(o.id); setFlash(""); } }} disabled={locked}
                    style={{ padding: 0, border: `4px solid ${bd}`, borderRadius: 16, overflow: "hidden", background: "#fff",
                      cursor: locked ? "default" : "pointer", boxShadow: "0 3px 10px rgba(80,60,140,0.14)", display: "block",
                      opacity: tried && !fb ? 0.5 : 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", padding: "6px 0", background: labelBg }}>{letter}</div>
                    <div style={{ width: "100%", aspectRatio: String(o.a), background: "#f4f1fb" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.src} alt={`Opção ${letter}`} draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10, maxWidth: gridMax, margin: "0 auto" }}>
                {cards.map((card) => (
                  <SortableScene key={card.id} card={card} posNum={posOf[card.id]} isMarked={intruso && marked === card.id}
                    intruso={intruso} storyId={storyId} aspect={storyA} phase={phase} onMark={toggleMark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Confirmar */}
      <div style={{ flexShrink: 0, padding: "8px 16px 16px" }}>
        {intruso && phase === "playing" && !marked && (
          <p style={{ textAlign: "center", fontSize: 11.5, color: "#ef4444", fontWeight: 700, margin: "0 0 6px" }}>Toque na cena que não pertence para liberar o Confirmar.</p>
        )}
        {falta && phase === "playing" && !picked && !flash && (
          <p style={{ textAlign: "center", fontSize: 11.5, color: "#7c5cf0", fontWeight: 700, margin: "0 0 6px" }}>Toque em A, B ou C para escolher.</p>
        )}
        <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", gap: 8 }}>
          {(intruso || falta) && (
            <button onClick={useHint} disabled={phase !== "playing" || hintLevel >= HINTS[falta ? "falta" : "intruso"].length}
              style={{ flexShrink: 0, height: 52, padding: "0 16px", borderRadius: 16, border: "2px solid #b5a6f0",
                background: "#fff", color: "#6d4fd6", fontWeight: 800, fontSize: 13.5,
                cursor: phase === "playing" && hintLevel < 3 ? "pointer" : "default", opacity: phase === "playing" && hintLevel < 3 ? 1 : 0.5 }}>
              💡 Dica {hintLevel}/3
            </button>
          )}
          <button onClick={submit} disabled={!canSubmit}
            style={{ flex: 1, height: 52, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
              cursor: canSubmit ? "pointer" : "default",
              background: canSubmit ? "linear-gradient(135deg,#7c5cf0,#6d4fd6)" : "#cfc7e6",
              boxShadow: canSubmit ? "0 6px 18px rgba(109,79,214,0.4)" : "none", display: "block" }}>
            ✓ {falta || intruso ? "Confirmar" : "Confirmar Ordem"}
          </button>
        </div>
      </div>
    </div>
  );
}
