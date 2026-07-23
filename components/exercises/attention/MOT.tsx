"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface MOTProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Config (progressão DENTRO da sessão) ────────────────────────────────────
// A cada 3 rodadas PERFEITAS seguidas sobe 1 nível. Alterna: +1 alvo, +velocidade,
// +1 alvo, +velocidade... (começa com 2 alvos). Velocidade sobe suave (nada absurdo).

const BALL_RADIUS = 27;
const AREA_W = 660;   // arena lógica maior (mais espaço p/ as bolas não lotarem)
const AREA_H = 620;
const MAX_TARGETS = 6;

function targetsForLevel(level: number): number {
  return Math.min(MAX_TARGETS, 2 + Math.ceil(level / 2)); // +1 alvo nos níveis ímpares
}
function speedStepForLevel(level: number): number {
  return Math.floor(level / 2);                             // +velocidade nos níveis pares
}
function ballSpeed(level: number): number {
  return Math.min(3.0, 1.25 + speedStepForLevel(level) * 0.28); // px/frame, incremento gentil
}
function totalBalls(level: number): number {
  const k = targetsForLevel(level);
  return k + Math.min(6, k + 2); // distratores moderados (não lota o quadro)
}
function trackDuration(level: number): number {
  return 3500 + Math.min(1800, level * 140); // acompanha um pouco mais a cada nível
}

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
}

type Phase = "memorize" | "track" | "identify";

function randomBalls(level: number, round: number): Ball[] {
  const n = totalBalls(level);
  const k = targetsForLevel(level);
  const speed = ballSpeed(level);
  const R = BALL_RADIUS;
  const balls: Ball[] = [];
  const pos: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    let x = R, y = R, ok = false, tries = 0;
    do {
      x = R + Math.random() * (AREA_W - 2 * R);
      y = R + Math.random() * (AREA_H - 2 * R);
      ok = pos.every(p => Math.hypot(p.x - x, p.y - y) >= R * 2.4); // nunca começam coladas
      tries++;
    } while (!ok && tries < 300);
    pos.push({ x, y });

    const angle = Math.random() * Math.PI * 2;
    const s = (0.8 + Math.random() * 0.4) * speed;
    void round;
    balls.push({ id: i, x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, isTarget: i < k });
  }
  return balls;
}

// Um passo da física para TODAS as bolas: rebate nas paredes (nunca cortam a
// borda) E colide entre si (nunca param uma atrás/em cima da outra).
function stepAll(balls: Ball[]): Ball[] {
  const R = BALL_RADIUS;
  const bs = balls.map(b => {
    let x = b.x + b.vx, y = b.y + b.vy, vx = b.vx, vy = b.vy;
    if (x - R < 0)         { x = R;          vx = Math.abs(vx); }
    if (x + R > AREA_W)    { x = AREA_W - R; vx = -Math.abs(vx); }
    if (y - R < 0)         { y = R;          vy = Math.abs(vy); }
    if (y + R > AREA_H)    { y = AREA_H - R; vy = -Math.abs(vy); }
    return { ...b, x, y, vx, vy };
  });
  // colisão bola-a-bola (separa + troca elástica de velocidade, massas iguais)
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], c = bs[j];
      const dx = c.x - a.x, dy = c.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minD = 2 * R;
      if (dist < minD) {
        const nx = dx / dist, ny = dy / dist;
        const push = (minD - dist) / 2 + 0.5;
        a.x -= nx * push; a.y -= ny * push;
        c.x += nx * push; c.y += ny * push;
        const va = a.vx * nx + a.vy * ny, vc = c.vx * nx + c.vy * ny;
        const dv = vc - va;
        a.vx += dv * nx; a.vy += dv * ny;
        c.vx -= dv * nx; c.vy -= dv * ny;
        a.x = Math.max(R, Math.min(AREA_W - R, a.x)); a.y = Math.max(R, Math.min(AREA_H - R, a.y));
        c.x = Math.max(R, Math.min(AREA_W - R, c.x)); c.y = Math.max(R, Math.min(AREA_H - R, c.y));
      }
    }
  }
  return bs;
}

// ── Tutorial ──────────────────────────────────────────────────────────────

function TutStep1({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-gray-900/20 border border-gray-300">
        {[
          { x: 60, y: 80, isTarget: true },
          { x: 140, y: 50, isTarget: true },
          { x: 100, y: 110, isTarget: false },
          { x: 180, y: 90, isTarget: false },
        ].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: b.x - 16, top: b.y - 16, width: 32, height: 32 }}
            className={`rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
              b.isTarget ? "bg-yellow-400 animate-pulse" : "bg-gray-400"
            }`}>
            {b.isTarget ? "★" : ""}
          </div>
        ))}
      </div>
      <p className={`text-xs text-center ${sub}`}>Bolas douradas piscam — memorize quais são os alvos!</p>
    </div>
  );
}

function TutStep2({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-gray-900/20 border border-gray-300">
        {[
          { x: 80, y: 60 }, { x: 160, y: 90 }, { x: 110, y: 120 }, { x: 50, y: 100 },
        ].map((b, i) => (
          <motion.div key={i}
            style={{ position: "absolute", left: b.x - 16, top: b.y - 16, width: 32, height: 32 }}
            animate={{ x: [0, 15 * (i % 2 ? 1 : -1), 0], y: [0, 10 * (i < 2 ? 1 : -1), 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="rounded-full border-2 border-white bg-gray-300 absolute" />
        ))}
      </div>
      <p className={`text-xs text-center ${sub}`}>Todas ficam cinzas e se movem — acompanhe com os olhos!</p>
    </div>
  );
}

function MOTTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Algumas bolas vão piscar em dourado — memorize quais são!",
      content: (done: () => void) => <TutStep1 theme={theme} onDone={done} />,
    },
    {
      instruction: "Todas as bolas se movem. Acompanhe os alvos com os olhos, depois toque neles.",
      content: (done: () => void) => <TutStep2 theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Rastreamento de Objetos" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function MOT({ difficulty, theme, onComplete }: MOTProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  // Nível ADAPTATIVO dentro da sessão. Começa a partir da dificuldade salva do
  // paciente (modesto) e sobe a cada 3 rodadas perfeitas seguidas.
  const initialLevel = Math.max(0, Math.min(8, Math.round(difficulty) - 2));

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("memorize");
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [level, setLevel] = useState(initialLevel);

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef(Date.now());
  // levelRef espelha o nível atual p/ o startRound (chamado dentro de setTimeout)
  // sempre ler o valor mais recente sem depender do fechamento do useCallback.
  const levelRef = useRef(initialLevel);
  levelRef.current = level;
  const streakRef = useRef(0);          // rodadas perfeitas seguidas
  const reachedLevelRef = useRef(initialLevel); // maior nível alcançado (p/ relatório)

  // k = nº de alvos da RODADA ATUAL (deriva das bolas em jogo; cai no nível se vazio).
  const k = balls.filter(b => b.isTarget).length || targetsForLevel(level);

  // PERF-03: durante a fase "track" a fisica corre num ref e o movimento e
  // aplicado direto via style.transform nos nos DOM (sem setState a ~60fps).
  // O estado React (`balls`) so e reconciliado ao trocar de fase. `ballsRef`
  // guarda a fisica viva; `ballNodes` referencia os elementos para animar.
  const ballsRef = useRef<Ball[]>([]);
  const ballNodes = useRef<Map<number, HTMLDivElement>>(new Map());

  // Arena responsiva: o palco tem tamanho lógico fixo (AREA_W×AREA_H) e é
  // escalado por CSS p/ caber na largura disponível (grande no tablet/desktop,
  // ocupa a tela toda no celular sem vazar). A física e o rAF não mudam.
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);
  useLayoutEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const compute = () => setStageScale(Math.min(1, el.clientWidth / AREA_W));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startRound = useCallback((r: number) => {
    const newBalls = randomBalls(levelRef.current, r);
    // A base renderizada (left/top) e `newBalls`; a fisica viva parte da mesma
    // referencia. Durante o track o transform e aplicado como delta sobre ela.
    ballsRef.current = newBalls;
    setBalls(newBalls);
    setSelected(new Set());
    setRoundScore(null);
    setPhase("memorize");

    timerRef.current = setTimeout(() => {
      setPhase("track");
      // Posicao base de cada bola no momento em que o track inicia (igual ao
      // que o React renderizou em left/top). O transform anima o delta ate ela.
      const base = new Map(ballsRef.current.map(b => [b.id, { x: b.x, y: b.y }]));
      const startTrack = Date.now();
      const dur = trackDuration(levelRef.current);

      function animate() {
        // Avanca a fisica no ref (paredes + colisao entre bolas) sem render.
        ballsRef.current = stepAll(ballsRef.current);
        for (const ball of ballsRef.current) {
          const node = ballNodes.current.get(ball.id);
          const b0 = base.get(ball.id);
          if (node && b0) {
            node.style.transform = `translate(${ball.x - b0.x}px, ${ball.y - b0.y}px)`;
          }
        }
        if (Date.now() - startTrack < dur) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          stopRaf();
          // Reconcilia: as posicoes finais da fisica viram a nova base do
          // estado e o transform e zerado no render de "identify" (sem salto).
          setBalls(ballsRef.current);
          setPhase("identify");
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    }, 2000);
  }, [stopRaf]);

  useEffect(() => {
    if (!showTutorial) {
      startTime.current = Date.now();
      startRound(0);
    }
    return () => { stopRaf(); stopTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial]);

  function handleBallTap(id: number) {
    if (phase !== "identify") return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (phase !== "identify") return;
    const targets = balls.filter(b => b.isTarget).map(b => b.id);
    const correct = [...selected].filter(id => targets.includes(id)).length;
    const perfect = k > 0 && correct === k;
    setRoundScore(correct);
    setTotalCorrect(tc => tc + correct);
    setTotalTargets(tt => tt + k);

    // Progressão: 3 rodadas PERFEITAS seguidas → sobe 1 nível.
    // Alterna +1 alvo (níveis ímpares) e +velocidade (níveis pares); erro zera a série.
    if (perfect) {
      streakRef.current += 1;
      if (streakRef.current >= 3) {
        streakRef.current = 0;
        const nl = levelRef.current + 1;
        levelRef.current = nl;
        reachedLevelRef.current = Math.max(reachedLevelRef.current, nl);
        setLevel(nl);
      }
    } else {
      streakRef.current = 0;
    }

    const nextRound = round + 1;
    const reachedDifficulty = Math.max(1, Math.min(10, 2 + reachedLevelRef.current));

    if (isTimeUp()) {
      finish();
      const accuracy = (totalCorrect + correct) / Math.max(1, totalTargets + k);
      const duration = elapsedSec();
      const sc = calculateExerciseScore("mot", accuracy, undefined, reachedDifficulty);
      onComplete({
        exerciseId: "mot",
        domain: "attention",
        score: sc,
        accuracy,
        difficulty: reachedDifficulty,
        duration,
        metadata: {
          totalCorrect: totalCorrect + correct,
          totalTargets: totalTargets + k,
          rounds: nextRound,
          reachedLevel: reachedLevelRef.current,
          finalTargets: targetsForLevel(reachedLevelRef.current),
        },
      });
      return;
    }

    timerRef.current = setTimeout(() => {
      setRound(nextRound);
      startRound(nextRound);
    }, 1500);
  }

  if (showTutorial) {
    return <MOTTutorial theme={theme} onDone={() => { startTime.current = Date.now(); begin(); setShowTutorial(false); }} />;
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-blue-50" : "bg-slate-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    area: theme === "GAMIFIED" ? "bg-gray-900 border border-gray-700" : "bg-gray-50 border-2 border-gray-200",
    bar: theme === "GAMIFIED" ? "bg-cyan-500" : theme === "COLORFUL" ? "bg-violet-500" : "bg-blue-500",
    btn: theme === "GAMIFIED" ? "bg-cyan-600 hover:bg-cyan-700 text-white" : theme === "COLORFUL" ? "bg-violet-600 text-white" : "bg-blue-600 text-white",
  };

  const phaseLabel =
    phase === "memorize" ? "⭐ Memorize os alvos dourados!" :
    phase === "track" ? "👁️ Acompanhe com os olhos..." :
    "🎯 Toque nos alvos e confirme!";

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-[600px] mx-auto px-4 py-5 flex flex-col items-center gap-4">

        {/* Header */}
        <div className={`w-full rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-sm ${pal.title}`}>👁️ Rastreamento de Objetos</h2>
          </div>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
        </div>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className={`w-full text-center py-2 px-4 rounded-xl font-bold text-sm ${
              phase === "memorize" ? (theme === "GAMIFIED" ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-50 text-yellow-800") :
              phase === "track" ? (theme === "GAMIFIED" ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-800") :
              (theme === "GAMIFIED" ? "bg-green-900/40 text-green-300" : "bg-green-50 text-green-800")
            }`}>
            {phaseLabel}
          </motion.div>
        </AnimatePresence>

        {/* Ball area (responsiva: palco lógico escalado p/ caber) */}
        <div ref={stageWrapRef} className="w-full flex justify-center">
        <div className={`relative rounded-2xl overflow-hidden ${pal.area}`}
          style={{ width: Math.round(AREA_W * stageScale), height: Math.round(AREA_H * stageScale) }}>
        <div style={{ width: AREA_W, height: AREA_H, transform: `scale(${stageScale})`, transformOrigin: "top left", position: "relative" }}>
          {balls.map(ball => {
            const isSelected = selected.has(ball.id);
            const showGold = phase === "memorize" && ball.isTarget;
            const showReveal = phase === "identify" && roundScore !== null && ball.isTarget;

            return (
              <div key={ball.id}
                ref={node => {
                  if (node) ballNodes.current.set(ball.id, node);
                  else ballNodes.current.delete(ball.id);
                }}
                style={{
                  position: "absolute",
                  left: ball.x - BALL_RADIUS,
                  top: ball.y - BALL_RADIUS,
                  width: BALL_RADIUS * 2,
                  height: BALL_RADIUS * 2,
                  // Durante "track" o transform e controlado pelo rAF (omitido
                  // aqui para o React nao sobrescrever). Nas demais fases a base
                  // left/top ja e a posicao real, entao zeramos o transform.
                  ...(phase === "track" ? {} : { transform: "translate(0px, 0px)" }),
                  transition: phase === "identify" ? "none" : undefined,
                }}
                className={`rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer select-none ${
                  showReveal ? "bg-green-400 border-green-600" :
                  showGold ? "bg-yellow-400 border-yellow-300 animate-pulse" :
                  isSelected ? "bg-blue-400 border-blue-600" :
                  theme === "GAMIFIED" ? "bg-gray-400 border-gray-500" : "bg-gray-300 border-gray-400"
                }`}
                onClick={() => handleBallTap(ball.id)}>
                {isSelected && phase === "identify" ? "✓" : ""}
              </div>
            );
          })}
        </div>
        </div>
        </div>

        {/* Confirm button */}
        {phase === "identify" && roundScore === null && (
          <button onClick={handleConfirm}
            className={`w-full py-3 rounded-xl font-bold text-sm ${pal.btn}`}
            disabled={selected.size !== k}>
            {selected.size < k ? `Selecione mais ${k - selected.size} bola(s)` : "Confirmar →"}
          </button>
        )}

        {roundScore !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full py-3 rounded-xl text-center font-bold text-sm ${
              roundScore === k ? (theme === "GAMIFIED" ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800") :
              roundScore > 0 ? (theme === "GAMIFIED" ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800") :
              (theme === "GAMIFIED" ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800")
            }`}>
            {roundScore === k ? `✅ Perfeito! ${roundScore}/${k} alvos` :
             roundScore > 0 ? `👍 ${roundScore}/${k} alvos corretos` :
             `❌ 0/${k} — continue praticando!`}
          </motion.div>
        )}

        <p className={`text-xs text-center ${pal.sub}`}>
          Selecione exatamente {k} bola{k > 1 ? "s" : ""} alvo
        </p>
      </div>
    </div>
  );
}
