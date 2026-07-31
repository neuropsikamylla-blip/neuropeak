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

const BALL_RADIUS = 22;  // bolas um pouco menores → mais espaço LIVRE entre elas (não ficam "juntinhas")
const MAX_W = 1440;      // arena GRANDE no desktop; adapta ao espaço no tablet/celular
const ASPECT = 0.66;     // altura = largura × 0.66 (arena ampla — bolas se espalham em 2D)
const RESERVED_H = 150;  // altura reservada p/ header + rótulo + botão; o resto vira arena (era 240 — desperdiçava altura)
const PAD_X = 72;        // padding lateral acumulado (wrapper + container) descontado da largura da janela
const MAX_TARGETS = 6;
// A arena usa COORDENADAS REAIS em px (medidas da tela), sem escala CSS — assim o
// clamp da física é exatamente a borda visível e a bola nunca ultrapassa o quadro.

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

function randomBalls(level: number, round: number, W: number, H: number): Ball[] {
  const n = totalBalls(level);
  const k = targetsForLevel(level);
  const speed = ballSpeed(level);
  const R = BALL_RADIUS;
  const balls: Ball[] = [];
  const pos: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    let x = R, y = R, ok = false, tries = 0;
    do {
      x = R + Math.random() * (W - 2 * R);
      y = R + Math.random() * (H - 2 * R);
      ok = pos.every(p => Math.hypot(p.x - x, p.y - y) >= Math.max(R * 3, 78)); // nascem bem separadas, nunca coladas
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
function stepAll(balls: Ball[], W: number, H: number): Ball[] {
  const R = BALL_RADIUS;
  const bs = balls.map(b => {
    let x = b.x + b.vx, y = b.y + b.vy, vx = b.vx, vy = b.vy;
    if (x - R < 0)     { x = R;     vx = Math.abs(vx); }
    if (x + R > W)     { x = W - R; vx = -Math.abs(vx); }
    if (y - R < 0)     { y = R;     vy = Math.abs(vy); }
    if (y + R > H)     { y = H - R; vy = -Math.abs(vy); }
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
        a.x = Math.max(R, Math.min(W - R, a.x)); a.y = Math.max(R, Math.min(H - R, a.y));
        c.x = Math.max(R, Math.min(W - R, c.x)); c.y = Math.max(R, Math.min(H - R, c.y));
      }
    }
  }
  return bs;
}

// ── Tutorial (1 etapa: explica tudo numa tela só, com demo em loop) ─────────

const DEMO_BALLS = [
  { x: 46, y: 40, isTarget: true,  mx: 30, my: 22 },
  { x: 150, y: 58, isTarget: true,  mx: -26, my: 30 },
  { x: 96, y: 96, isTarget: false, mx: 34, my: -24 },
  { x: 178, y: 104, isTarget: false, mx: -30, my: -20 },
];

function MOTDemo({ onReady }: { onReady: () => void }) {
  const [pi, setPi] = useState(0); // 0 = memorize (dourado) · 1 = mover (cinza) · 2 = revelar (verde)
  useEffect(() => {
    onReady();  // libera o botão "COMEÇAR" logo
    const id = setInterval(() => setPi(p => (p + 1) % 3), 1700);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const moving = pi === 1;

  const steps = [
    { n: "1", icon: "⭐", txt: "Memorize as bolas douradas — são os alvos." },
    { n: "2", icon: "👁️", txt: "Todas ficam cinzas e se movem. Siga os alvos com os olhos." },
    { n: "3", icon: "🎯", txt: "Quando pararem, toque nas que eram douradas." },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mini-arena da demo */}
      <div className="relative w-[224px] h-[150px] rounded-xl overflow-hidden bg-slate-100 border border-gray-300">
        {DEMO_BALLS.map((b, i) => {
          const gold = pi === 0 && b.isTarget;
          const green = pi === 2 && b.isTarget;
          return (
            <motion.div key={i}
              animate={moving ? { x: [0, b.mx, 0], y: [0, b.my, 0] } : { x: 0, y: 0 }}
              transition={moving ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              style={{ position: "absolute", left: b.x - 17, top: b.y - 17, width: 34, height: 34 }}
              className={`rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                green ? "bg-green-400 border-green-600 text-white" :
                gold ? "bg-yellow-400 border-yellow-300 text-yellow-900 animate-pulse" :
                "bg-gray-300 border-gray-400"
              }`}>
              {gold ? "★" : green ? "✓" : ""}
            </motion.div>
          );
        })}
      </div>
      {/* 3 passos — o passo atual fica destacado */}
      <div className="w-full flex flex-col gap-1.5">
        {steps.map((s, i) => (
          <div key={s.n} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors ${
            i === pi ? "bg-blue-50" : ""
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
              i === pi ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>{s.n}</span>
            <span className="text-xs text-gray-700 leading-tight">{s.icon} {s.txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MOTTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Algumas bolas são alvos (douradas). Depois todas se misturam e se movem — sua missão é não perder os alvos de vista.",
      content: (done: () => void) => <MOTDemo onReady={done} />,
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

  // Arena responsiva: mede a largura disponível e usa esse valor como as dimensões
  // REAIS (px) da arena — a física roda nessas coordenadas, então o clamp coincide
  // com a borda visível e a bola nunca ultrapassa (nem no celular, nem no desktop).
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState(() => ({ w: 320, h: Math.round(320 * ASPECT) }));
  const dimsRef = useRef(dims);
  dimsRef.current = dims;
  useLayoutEffect(() => {
    // Mede o VIEWPORT direto (window.innerWidth/innerHeight) — robusto: não depende
    // do clientWidth de um wrapper que pode vir travado num valor pequeno.
    const compute = () => {
      const availW = Math.min(MAX_W, window.innerWidth - PAD_X);
      const availH = Math.max(360, window.innerHeight - RESERVED_H);
      // maior arena que cabe na LARGURA e na ALTURA da tela, mantendo a proporção;
      // piso generoso (não fica minúscula) sem nunca estourar a largura disponível
      let w = Math.min(availW, Math.floor(availH / ASPECT));
      w = Math.min(availW, Math.max(Math.min(availW, 560), w));
      setDims({ w, h: Math.round(w * ASPECT) });
    };
    compute();
    window.addEventListener("resize", compute);
    const t = setTimeout(compute, 120); // re-mede após o layout assentar
    return () => { window.removeEventListener("resize", compute); clearTimeout(t); };
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startRound = useCallback((r: number) => {
    const newBalls = randomBalls(levelRef.current, r, dimsRef.current.w, dimsRef.current.h);
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
        ballsRef.current = stepAll(ballsRef.current, dimsRef.current.w, dimsRef.current.h);
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
      <div className="max-w-[1480px] mx-auto px-4 py-5 flex flex-col items-center gap-4">

        {/* Header */}
        <div style={{ width: dims.w, maxWidth: "100%" }} className={`rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`font-bold text-sm ${pal.title}`}>👁️ Rastreamento de Objetos</h2>
          </div>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
        </div>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: dims.w, maxWidth: "100%" }}
            className={`text-center py-2 px-4 rounded-xl font-bold text-sm ${
              phase === "memorize" ? (theme === "GAMIFIED" ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-50 text-yellow-800") :
              phase === "track" ? (theme === "GAMIFIED" ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-800") :
              (theme === "GAMIFIED" ? "bg-green-900/40 text-green-300" : "bg-green-50 text-green-800")
            }`}>
            {phaseLabel}
          </motion.div>
        </AnimatePresence>

        {/* Ball area — coordenadas REAIS em px (sem escala CSS); a bola nunca passa da borda */}
        <div ref={stageWrapRef} className="w-full flex justify-center">
        <div className={`relative rounded-2xl overflow-hidden ${pal.area}`}
          style={{ width: dims.w, height: dims.h }}>
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
                  // clamp defensivo: mesmo se a arena mudar de tamanho, a base nunca sai do quadro
                  left: Math.min(Math.max(0, ball.x - BALL_RADIUS), dims.w - BALL_RADIUS * 2),
                  top: Math.min(Math.max(0, ball.y - BALL_RADIUS), dims.h - BALL_RADIUS * 2),
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

        {/* Confirm button */}
        {phase === "identify" && roundScore === null && (
          <button onClick={handleConfirm}
            style={{ width: dims.w, maxWidth: "100%" }}
            className={`py-3 rounded-xl font-bold text-sm ${pal.btn}`}
            disabled={selected.size !== k}>
            {selected.size < k ? `Selecione mais ${k - selected.size} bola(s)` : "Confirmar →"}
          </button>
        )}

        {roundScore !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: dims.w, maxWidth: "100%" }}
            className={`py-3 rounded-xl text-center font-bold text-sm ${
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
