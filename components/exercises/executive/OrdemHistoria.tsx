"use client";

import { useState, useRef, useCallback } from "react";
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
import { HISTORIAS, histPanelSrc, type HistDiff } from "@/data/historias";
import type { ExerciseResult, Theme } from "@/types";

interface OrdemHistoriaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const VIOLET = "#7c5cf0";
const TRIALS = 5;
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));

// nível (1-10) → dificuldade das histórias (nº de cenas)
function tierForLevel(lvl: number): HistDiff {
  if (lvl <= 2) return "faceis";          // 4 cenas
  if (lvl <= 5) return "media";           // 5
  if (lvl <= 8) return "dificil";         // 6
  return "muito-dificil";                 // 8
}
const DIFF_LABEL: Record<HistDiff, string> = { faceis: "fácil", media: "média", dificil: "difícil", "muito-dificil": "muito difícil" };
const PANELS: Record<HistDiff, number> = { faceis: 4, media: 5, dificil: 6, "muito-dificil": 8 };

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

interface Card { id: string; order: number; } // order = índice correto (0-based); imagem = histPanelSrc(story.id, order+1)

function buildRound(tier: HistDiff, recent: Set<string>): { storyId: string; n: number; a: number; cards: Card[] } {
  const pool = HISTORIAS.filter((h) => h.diff === tier);
  const avail = pool.filter((h) => !recent.has(h.id));
  const list = avail.length ? avail : pool;
  const story = list[Math.floor(Math.random() * list.length)];
  const correct: Card[] = Array.from({ length: story.n }, (_, i) => ({ id: `c${i}`, order: i }));
  let cards = shuffle(correct);
  let guard = 0;
  while (cards[0].order === 0 && guard++ < 12) cards = shuffle(cards);   // anti-previsibilidade
  return { storyId: story.id, n: story.n, a: story.a, cards };
}

type Phase = "ready" | "playing" | "feedback";

// ── Card arrastável (grade) ──
function SortableScene({
  card, index, storyId, storyA, aspect, phase, exact,
}: {
  card: Card; index: number; storyId: string; storyA: number; aspect: number;
  phase: Phase; exact: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled: phase !== "playing" });

  const fb = phase === "feedback";
  const correctPos = card.order === index;
  const border = fb ? (correctPos ? "#34d399" : "#f59e0b") : "rgba(124,92,240,0.35)";
  // cor do número da posição
  const numBg = fb ? (correctPos ? "#34d399" : "#f59e0b") : VIOLET;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    touchAction: "manipulation",         // deslizar rola a tela; segurar+mover arrasta o card
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.92 : 1,
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
        {/* cena (inteira, sem cortar) */}
        <div style={{ width: "100%", aspectRatio: String(aspect), background: "#f4f1fb" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={histPanelSrc(storyId, card.order + 1)} alt="" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", pointerEvents: "none" }} />
        </div>

        {/* número da POSIÇÃO atual (sempre visível) */}
        <span style={{
          position: "absolute", top: 6, left: 6, minWidth: 26, height: 26, padding: "0 6px", borderRadius: 13,
          background: numBg, color: "#fff", fontWeight: 900, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.28)",
        }}>{fb ? (correctPos ? "✓" : index + 1) : index + 1}</span>

        {/* alça discreta de arrastar */}
        {phase === "playing" && (
          <span aria-hidden style={{
            position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 7,
            background: "rgba(44,36,64,0.45)", color: "#fff", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}>⠿</span>
        )}
      </div>
    </div>
  );
}

export function OrdemHistoria({ difficulty, onComplete }: OrdemHistoriaProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const tier = tierForLevel(startLevel);
  const nPanels = PANELS[tier];

  const [phase, setPhase] = useState<Phase>("ready");
  const [storyId, setStoryId] = useState("");
  const [storyA, setStoryA] = useState(1.5);
  const [cards, setCards] = useState<Card[]>([]);
  const [trial, setTrial] = useState(0);
  const [result, setResult] = useState<{ exact: boolean } | null>(null);

  const recentRef = useRef<string[]>([]);
  const gradedRef = useRef<number[]>([]);
  const posCorrectRef = useRef(0);
  const posWrongRef = useRef(0);
  const swapsRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const startRoundAt = useRef(0);
  const startTime = useRef(Date.now());

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startRound = useCallback(() => {
    const r = buildRound(tier, new Set(recentRef.current));
    recentRef.current = [r.storyId, ...recentRef.current].slice(0, 5);
    setStoryId(r.storyId); setStoryA(r.a); setCards(r.cards); setResult(null);
    startRoundAt.current = Date.now();
    setPhase("playing");
  }, [tier]);

  function begin() {
    gradedRef.current = []; posCorrectRef.current = 0; posWrongRef.current = 0;
    swapsRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    startRound();
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
        level: startLevel,
        startedLevel: startLevel,
        tier,
        scenes: nPanels,
        positionsCorrect: posCorrectRef.current,
        positionsWrong: posWrongRef.current,
        swaps: swapsRef.current,
        sequencesCorrect: exactCount,
        sequencesIncorrect: TRIALS - exactCount,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, tier, nPanels]);

  function confirmOrder() {
    if (phase !== "playing") return;
    const n = cards.length;
    const posCorrect = cards.filter((c, i) => c.order === i).length;
    const exact = posCorrect === n;
    gradedRef.current.push(n ? posCorrect / n : 0);
    posCorrectRef.current += posCorrect;
    posWrongRef.current += (n - posCorrect);
    rtsRef.current.push(Date.now() - startRoundAt.current);
    setResult({ exact });
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, exact ? 1900 : 3000);
  }

  const pct = Math.round((trial / TRIALS) * 100);
  // grade: até 4 cenas = 2 colunas; 5+ = responsivo (4 col no desktop, 2 no celular)
  const gridCols = nPanels <= 4 ? "repeat(2, minmax(0,1fr))" : "repeat(auto-fill, minmax(150px, 1fr))";
  const gridMax = nPanels <= 4 ? 420 : 700;

  // ── READY ──
  if (phase === "ready" || !storyId) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 26, padding: "26px 22px", textAlign: "center",
          boxShadow: "0 22px 60px rgba(80,60,140,0.18)" }}>
          <div style={{ margin: "0 auto 14px", width: 70, height: 70, borderRadius: "50%", background: "rgba(124,92,240,0.12)",
            border: "1px solid rgba(124,92,240,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>📖</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2a2440", marginBottom: 8 }}>Ordem da História</h2>
          <div style={{ textAlign: "left", fontSize: 13, color: "#5b5470", margin: "0 auto 10px", maxWidth: 320, lineHeight: 1.7 }}>
            <div>1. Veja as cenas da história — estão fora de ordem.</div>
            <div>2. Arraste os cartões para montar a sequência certa.</div>
            <div>3. O número no canto mostra a posição de cada cena.</div>
            <div>4. Toque em <b>Confirmar Ordem</b>.</div>
          </div>
          <p style={{ fontSize: 11.5, color: "#9a93b0", marginBottom: 18 }}>
            Começa no nível {startLevel} ({nPanels} cenas · {DIFF_LABEL[tier]}) — onde parou.
          </p>
          <button onClick={begin} style={{ width: "100%", height: 52, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
            cursor: "pointer", background: "linear-gradient(135deg,#7c5cf0,#6d4fd6)", boxShadow: "0 6px 18px rgba(109,79,214,0.4)" }}>Começar →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden",
      background: "linear-gradient(180deg,#f3f0fb 0%,#eaeefb 55%,#eef0f8 100%)" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#2a2440" }}>Ordem da História</div>
            <div style={{ fontSize: 11.5, color: "#9a93b0" }}>Nível {startLevel} · {nPanels} cenas · {DIFF_LABEL[tier]}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: VIOLET }}>{Math.min(trial + 1, TRIALS)}/{TRIALS}</div>
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#e2dcf3", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c5cf0,#a78bfa)", borderRadius: 4, transition: "width .4s" }} />
        </div>
      </div>

      {/* Instrução */}
      <div style={{ flexShrink: 0, textAlign: "center", padding: "2px 18px 8px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#5b5470" }}>
          {phase === "feedback"
            ? (result?.exact ? "✅ Ordem correta!" : "Quase! Veja os números marcados")
            : "Arraste as cenas para a ordem certa — do começo ao fim."}
        </p>
      </div>

      {/* Grade arrastável de cenas */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 16px 8px" }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10, maxWidth: gridMax, margin: "0 auto" }}>
              {cards.map((card, i) => (
                <SortableScene key={card.id} card={card} index={i} storyId={storyId} storyA={storyA}
                  aspect={storyA} phase={phase} exact={!!result?.exact} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Confirmar */}
      <div style={{ flexShrink: 0, padding: "8px 16px 16px" }}>
        <button onClick={confirmOrder} disabled={phase !== "playing"}
          style={{ width: "100%", height: 52, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
            cursor: phase === "playing" ? "pointer" : "default",
            background: phase === "playing" ? "linear-gradient(135deg,#7c5cf0,#6d4fd6)" : "#cfc7e6",
            boxShadow: phase === "playing" ? "0 6px 18px rgba(109,79,214,0.4)" : "none", maxWidth: 460, margin: "0 auto", display: "block" }}>
          ✓ Confirmar Ordem
        </button>
      </div>
    </div>
  );
}
