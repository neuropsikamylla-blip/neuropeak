"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import { MOTBall } from "@/components/exercises/attention/MOTBall";
import {
  ASPECT,
  arenaScaleForLevel,
  randomBalls,
  stepAll,
  targetsForLevel,
  trackDuration,
  type Ball,
} from "@/lib/mot/scene";
import type { ExerciseResult, Theme } from "@/types";

interface MOTProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Config (progressão DENTRO da sessão) ────────────────────────────────────
// A cada 3 rodadas PERFEITAS seguidas sobe 1 nível. Alterna: +1 alvo, +velocidade,
// +1 alvo, +velocidade... (começa com 2 alvos). Velocidade sobe suave (nada absurdo).

const MAX_W = 1440;      // arena GRANDE no desktop; adapta ao espaço no tablet/celular
const RESERVED_H = 150;  // altura reservada p/ header + rótulo + botão; o resto vira arena (era 240 — desperdiçava altura)
const PAD_X = 72;        // padding lateral acumulado (wrapper + container) descontado da largura da janela
// A arena usa COORDENADAS REAIS em px (medidas da tela), sem escala CSS — assim o
// clamp da física é exatamente a borda visível e a bola nunca ultrapassa o quadro.

type Phase = "memorize" | "track" | "identify";

// ── Main component ─────────────────────────────────────────────────────────

export function MOT({ difficulty, theme, onComplete }: MOTProps) {
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState(() => ({ w: 320, h: Math.round(320 * ASPECT) }));
  const [hasMeasured, setHasMeasured] = useState(false);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  // A ARENA EFETIVA da rodada: o quadro não é sempre o maior que cabe na tela. Ele começa menor e
  // cresce com o nível, junto com a quantidade de bolas (pedido dela, 12/ago/2026). `dims` continua
  // sendo o teto — o que cabe no aparelho —, e isto é a fatia dele que o nível usa.
  //
  // A física precisa correr NESTAS medidas, não nas do teto: é o clamp de `stepAll` que mantém a
  // bola dentro do quadro visível, e usar o teto faria a bola sumir na área que não está desenhada.
  const escala = arenaScaleForLevel(level);
  const arena = { w: Math.round(dims.w * escala), h: Math.round(dims.h * escala) };
  const arenaRef = useRef(arena);
  arenaRef.current = arena;
  useLayoutEffect(() => {
    // Mede a largura real do conteúdo do palco. A altura continua vindo da janela para
    // garantir que a arena caiba na tela.
    const compute = () => {
      const availW = Math.min(MAX_W, contentRef.current?.clientWidth ?? window.innerWidth - PAD_X);

      // Quanto a tela gasta com o que NÃO é arena: cabeçalho, rótulo da fase, botão de confirmar,
      // textos e espaçamentos. Isto era um número fixo (RESERVED_H) e estava MENOR que a realidade
      // — daí o botão de confirmar cair abaixo da dobra e o paciente precisar rolar a página para
      // responder (ela relatou em 11/ago/2026). Medir em vez de supor também protege contra a
      // próxima mudança de layout: se um elemento entrar ou sair, a conta se ajusta sozinha.
      const conteudo = contentRef.current;
      const arena = stageWrapRef.current;
      const cromo = conteudo && arena
        ? conteudo.getBoundingClientRect().height - arena.getBoundingClientRect().height
        : RESERVED_H;

      const availH = Math.max(240, window.innerHeight - cromo);
      // A ALTURA manda: a arena precisa caber na tela inteira, sem rolagem. Não há piso de largura
      // aqui de propósito — um piso faria a arena estourar de novo em tela baixa, que é justamente
      // o defeito que estamos corrigindo.
      const w = Math.max(320, Math.min(availW, Math.floor(availH / ASPECT)));
      setDims({ w, h: Math.round(w * ASPECT) });
    };
    compute();
    window.addEventListener("resize", compute);
    // A rodada 0 só nasce na medição ASSENTADA. A primeira passada acontece antes de as
    // fontes estabilizarem a altura do cabeçalho, e uma arena que muda DEPOIS do sorteio
    // devolve o mesmo defeito das bolas amontoadas — só que em escala menor, difícil de ver.
    const t = setTimeout(() => { compute(); setHasMeasured(true); }, 120);
    return () => { window.removeEventListener("resize", compute); clearTimeout(t); };
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startRound = useCallback((r: number) => {
    const newBalls = randomBalls(levelRef.current, r, arenaRef.current.w, arenaRef.current.h);
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
        ballsRef.current = stepAll(ballsRef.current, arenaRef.current.w, arenaRef.current.h);
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
    startTime.current = Date.now();
    begin();
    return () => { stopRaf(); stopTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasMeasured) return;
    startRound(0);
  }, [hasMeasured, startRound]);

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
    <ExerciseStage width="amplo" backgroundClassName={pal.bg}>
      <div ref={contentRef} className="flex flex-col items-center gap-4">

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
          style={{ width: arena.w, height: arena.h }}>
          {balls.map(ball => (
              <MOTBall key={ball.id}
                ref={node => {
                  if (node) ballNodes.current.set(ball.id, node);
                  else ballNodes.current.delete(ball.id);
                }}
                ball={ball}
                phase={phase}
                selected={selected.has(ball.id)}
                revealTarget={phase === "identify" && roundScore !== null && ball.isTarget}
                gamified={theme === "GAMIFIED"}
                arenaWidth={arena.w}
                arenaHeight={arena.h}
                onClick={() => handleBallTap(ball.id)}
              />
          ))}
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
    </ExerciseStage>
  );
}
