"use client";

// ── FOCO · CHUVA DE AGENTES (mecânica de queda vertical) ────────────────────────
// Motor EXCLUSIVO do modo Foco (o guard mode==="foco" vive em FocusAgents.tsx).
// Os modos Inibição/Alternância/Desafio continuam na "arena flutuante" e NÃO
// tocam neste arquivo.
//
// Conceito (aprovado pela neuropsicóloga): agentes CAEM do topo em fluxo contínuo;
// o paciente toca só os que batem com a REGRA e DEIXA os outros caírem. Treina
// velocidade de processamento + atenção seletiva + inibição de resposta.
//
// Comportamento:
//  • SPAWN: surgem no topo em x aleatório (espalhados), POUCOS por vez.
//  • QUEDA = cronômetro: a posição vertical é a pressão de tempo (sem relógio numérico).
//  • ESCAPE + 2ª CHANCE: ALVO que chega embaixo sem ser tocado volta ao topo 1x e
//    cai MAIS RÁPIDO; se escapar de novo = OMISSÃO. DISTRATOR que cai = CORRETO
//    (era pra deixar), some sem penalidade e sem voltar.
//  • TOQUE: ALVO = captura (acerto). DISTRATOR = erro impulsivo (inibição).
//  • Sessão cronometrada (~7min) pelo useTimedProgress compartilhado.

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { playTTS, cancelTTS } from "@/lib/tts";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { allAgents } from "@/data/agents";
import type { AgentConfig } from "@/data/agents";
import type { ExerciseResult, Theme } from "@/types";
import type { FocusMode } from "@/types/commands";
import { buildModeRound } from "@/utils/generateCommand";
import type { PresMode } from "@/components/exercises/PresentationConfig";

const AGENT_BY_ID = new Map(allAgents.map(a => [a.id, a]));
const AGENT_V = "?v=6";   // cache-bust (imagens transparentes) — igual ao FocusAgents

// ── Tamanho / hitbox (idênticos ao Foco da arena) ───────────────────────────────
const CHAR_SIZE = 80;              // recalibração de elite — menores, clique preciso
const CHAR_H    = CHAR_SIZE * 1.5; // imagens 2:3 (512×768)
// Área CLICÁVEL = só o corpo visível (o resto do PNG é transparente); assim a
// margem transparente de um agente que passa por cima não rouba o toque.
const HIT_L = 0.24, HIT_R = 0.76;
const HIT_T = 0.00, HIT_B = 0.96;

// ── Feedback (sons + vibração) — mesma paleta sonora do FocusAgents ─────────────
let _actx: AudioContext | null = null;
function beep(freqs: number[], dur = 0.12, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _actx = _actx ?? new Ctx();
    const ctx = _actx;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      const t = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur);
    });
  } catch { /* áudio indisponível */ }
}
const soundCapture = () => beep([660, 880], 0.1, "sine");
const soundWrong   = () => beep([200, 150], 0.15, "square");
const soundMiss    = () => beep([300, 220], 0.12, "triangle");
function vibrate(ms: number | number[]) { try { navigator.vibrate?.(ms); } catch { /* sem vibração */ } }

const PALETTE_HEX: Record<string, string> = {
  blue: "#1E88E5", green: "#43A047", purple: "#8E24AA", orange: "#FB8C00",
  red: "#E53935", gray: "#78909C", yellow: "#FDD835",
};
function cleanForSpeech(text: string): string {
  return text.replace(/[✅🚫]/g, "").replace(/\n+/g, ". ").trim();
}

// ── Configuração de dificuldade por NÍVEL (ladder 1–7) ──────────────────────────
// TODOS os números abaixo são CALIBRÁVEIS após teste clínico.
//  • fallMs        — tempo-base p/ o agente cair do topo até embaixo (↓ = mais rápido).
//  • spawnMs       — intervalo entre spawns (↓ = mais caindo).
//  • maxConcurrent — máximo simultâneo na tela (vários caindo juntos, incluindo o alvo;
//    começa em 4 e CRESCE até 8 conforme o nível — busca visual + velocidade).
//  • secondChance  — multiplicador de velocidade da 2ª queda de um alvo que escapou.
interface RainCfg { fallMs: number; spawnMs: number; maxConcurrent: number; secondChance: number }
const RAIN_CFG: Record<number, RainCfg> = {
  1: { fallMs: 6200, spawnMs: 1000, maxConcurrent: 4, secondChance: 1.4 },
  2: { fallMs: 5600, spawnMs:  920, maxConcurrent: 4, secondChance: 1.45 },
  3: { fallMs: 5000, spawnMs:  850, maxConcurrent: 5, secondChance: 1.5 },
  4: { fallMs: 4500, spawnMs:  780, maxConcurrent: 6, secondChance: 1.55 },
  5: { fallMs: 4000, spawnMs:  710, maxConcurrent: 6, secondChance: 1.6 },
  6: { fallMs: 3600, spawnMs:  640, maxConcurrent: 7, secondChance: 1.65 },
  7: { fallMs: 3200, spawnMs:  560, maxConcurrent: 8, secondChance: 1.7 },
};

// Progressão adaptativa (mantém o ladder e o "errou = mesmo nível" do Foco):
//  • sobe +1 nível a cada LEVEL_UP_HITS capturas seguidas (sem erro/omissão no meio);
//  • um erro impulsivo OU uma omissão zera a sequência e MANTÉM o nível (não desce).
const LEVEL_UP_HITS = 4;   // capturas seguidas p/ subir de nível (fluxo contínuo → exige mais que a arena)
const MAX_LEVEL     = 7;

// px/ms de queda p/ um dado tempo de travessia e altura da arena.
const fallSpeed = (playH: number, fallMs: number) => (playH + CHAR_H) / fallMs;

type RainState = "falling" | "captured" | "wrong" | "missed";

interface RainAgent {
  uid: string;
  agent: AgentConfig;
  variant: number;
  isTarget: boolean;
  x: number;             // px (canto esquerdo)
  y: number;             // px (topo)
  vy: number;            // px/ms (velocidade de queda atual)
  passCount: number;     // quantas vezes o ALVO já escapou por baixo
  spawnAt: number;       // ts do spawn (p/ tempo de reação)
  state: RainState;
}

// Um "item" da fila de spawn (personagem do round + se é alvo).
interface QueueItem { agentId: string; variant: number; isTarget: boolean }

export interface FocusRainProps {
  level: number;
  theme: Theme;
  presentMode: PresMode;
  fbLevel: "leve" | "normal" | "intenso";
  exerciseId: string;
  settings?: { autoAdvance?: boolean };
  onComplete: (result: ExerciseResult) => void;
}

export function FocusRain({ level, theme, presentMode, fbLevel, exerciseId, settings, onComplete }: FocusRainProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
  const speakOn = presentMode === "visual_audio" || presentMode === "audio_only";
  const speak = useCallback((t: string) => { if (speakOn) playTTS(t); }, [speakOn]);

  const [command, setCommand]   = useState("");
  const [points, setPoints]     = useState(0);
  const [displayLevel, setDisplayLevel] = useState(Math.max(1, Math.min(MAX_LEVEL, Math.round(level))));
  // Feedback rápido de ERRO impulsivo (a única mensagem sobreposta; captura e
  // omissão usam só glow/som, sem texto — tela limpa).
  const [flash, setFlash]       = useState<null | { msg: string }>(null);
  // Estado de render dos agentes vivos (posição base + estado visual). O movimento
  // fino corre no rAF via transform imperativo; o setState é só p/ entradas/saídas.
  const [renderAgents, setRenderAgents] = useState<RainAgent[]>([]);

  // ── Refs de jogo (fonte da verdade do loop) ──
  const playRef      = useRef<HTMLDivElement>(null);
  const playWRef     = useRef(0);
  const playHRef     = useRef(600);
  const rafRef       = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentsRef    = useRef<RainAgent[]>([]);
  const nodesRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const queueRef     = useRef<QueueItem[]>([]);
  const levelRef     = useRef(Math.max(1, Math.min(MAX_LEVEL, Math.round(level))));
  const startLevelRef = useRef(levelRef.current);
  const reachedRef   = useRef(levelRef.current);
  const uidSeq       = useRef(0);
  const doneRef      = useRef(false);
  const recentSigsRef = useRef<string[]>([]);
  const lastSpawnXRef = useRef(-1);

  // Métricas (alimentam o onComplete/metadata compatível com focus-report.ts).
  const capturesRef   = useRef(0);
  const falsePosRef   = useRef(0);
  const omissionsRef  = useRef(0);
  const rtSumRef      = useRef(0);   // soma dos tempos de reação (captura) em ms
  const rtNRef        = useRef(0);
  const firstMsListRef = useRef<number[]>([]);   // spawn→toque de cada captura
  const consecHitsRef = useRef(0);
  const pointsRef     = useRef(0);
  // Registro por-evento (reaproveita a ideia do RoundMetric — 1 entrada por agente resolvido).
  const eventsRef     = useRef<Array<{ mode: FocusMode; level: number; correct: boolean; endedBy: "correct" | "wrong" | "timeout"; rtMs: number }>>([]);

  // ── Geração de ondas (waves) — reusa buildModeRound do Foco, SEM símbolos ──────
  // Cada onda vira uma FILA de spawn (alvos + confusáveis embaralhados). Quando a
  // fila esvazia, gera outra onda no nível atual (rule/complexidade acompanham o nível).
  const enqueueWave = useCallback(() => {
    const lv = levelRef.current;
    // Regras só com cor/acessório/objeto (símbolos removidos do roster em 2026-07).
    const round = buildModeRound("foco", lv, theme, [], recentSigsRef.current);
    recentSigsRef.current = [...recentSigsRef.current, round.command.text].slice(-6);
    const targetIds = new Set(round.command.targets);
    // Mostra a regra no topo (sempre visível). Fala se áudio ligado.
    setCommand(round.command.text);
    if (presentMode !== "visual") speak(cleanForSpeech(round.command.text));
    const items: QueueItem[] = round.characters.map(c => ({
      agentId: c.agentId,
      variant: c.variantIndex ?? 0,
      isTarget: targetIds.has(c.id),
    }));
    // Embaralha, mas garante que a onda comece com pelo menos 1 alvo cedo.
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    queueRef.current.push(...items);
  }, [theme, presentMode, speak]);

  const commitRender = useCallback(() => {
    setRenderAgents(agentsRef.current.map(a => ({ ...a })));
  }, []);

  // ── Spawn de um agente (do topo) ──
  const spawnOne = useCallback(() => {
    if (doneRef.current) return;
    const cfg = RAIN_CFG[levelRef.current];
    const alive = agentsRef.current.filter(a => a.state === "falling").length;
    if (alive >= cfg.maxConcurrent) return;
    if (queueRef.current.length === 0) enqueueWave();
    const item = queueRef.current.shift();
    if (!item) return;
    const agent = AGENT_BY_ID.get(item.agentId);
    if (!agent) return;
    const W = playWRef.current || 360;
    const H = playHRef.current || 600;
    // x aleatório espalhado; evita colar no x do spawn anterior (não sobrepor feio).
    const maxX = Math.max(4, W - CHAR_SIZE - 4);
    let x = 4 + Math.random() * maxX;
    if (lastSpawnXRef.current >= 0 && Math.abs(x - lastSpawnXRef.current) < CHAR_SIZE) {
      x = (lastSpawnXRef.current + W / 2) % maxX;   // desloca ~meia arena
    }
    lastSpawnXRef.current = x;
    const uid = `r${uidSeq.current++}`;
    const ra: RainAgent = {
      uid, agent, variant: item.variant, isTarget: item.isTarget,
      x, y: -CHAR_H, vy: fallSpeed(H, cfg.fallMs),
      passCount: 0, spawnAt: Date.now(), state: "falling",
    };
    agentsRef.current = [...agentsRef.current, ra];
    commitRender();
  }, [enqueueWave, commitRender]);

  // ── Progressão adaptativa (mesma filosofia do Foco: erro/omissão = mantém nível) ──
  const onGoodEvent = useCallback(() => {
    consecHitsRef.current++;
    if (consecHitsRef.current >= LEVEL_UP_HITS && levelRef.current < MAX_LEVEL) {
      levelRef.current++;
      consecHitsRef.current = 0;
      reachedRef.current = Math.max(reachedRef.current, levelRef.current);
      setDisplayLevel(levelRef.current);
      // NÃO limpamos a fila: os agentes já em queda/na fila terminam sob a regra
      // atual; a PRÓXIMA onda (quando a fila esvazia) já sai no nível novo, e a
      // regra no topo troca exatamente quando ela começa — sem regra "misturada".
    }
  }, []);
  const onBadEvent = useCallback(() => {
    consecHitsRef.current = 0;   // zera a sequência; NÃO desce de nível (rigor de treino)
  }, []);

  const showWrongFlash = useCallback((msg: string) => {
    setFlash({ msg });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 900);
  }, []);

  // ── Toque num agente ──
  const handleTap = useCallback((uid: string) => {
    const a = agentsRef.current.find(x => x.uid === uid);
    if (!a || a.state !== "falling" || doneRef.current) return;
    const rt = Date.now() - a.spawnAt;
    if (a.isTarget) {
      // Captura (acerto).
      a.state = "captured";
      capturesRef.current++;
      rtSumRef.current += rt; rtNRef.current++;
      firstMsListRef.current.push(rt);
      pointsRef.current += 10 + (rt < 2000 ? 5 : 0);
      setPoints(pointsRef.current);
      soundCapture(); if (fbLevel !== "leve") vibrate(40);
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: true, endedBy: "correct", rtMs: rt });
      onGoodEvent();
    } else {
      // Erro impulsivo (tocou distrator) — componente de INIBIÇÃO.
      a.state = "wrong";
      falsePosRef.current++;
      pointsRef.current = Math.max(0, pointsRef.current - 5);
      setPoints(pointsRef.current);
      soundWrong(); if (fbLevel !== "leve") vibrate(fbLevel === "intenso" ? [80, 50, 80] : [50, 40, 50]);
      showWrongFlash("Esse não era da regra");
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "wrong", rtMs: rt });
      onBadEvent();
    }
    commitRender();
    // Remove o agente resolvido após um curto glow.
    setTimeout(() => {
      agentsRef.current = agentsRef.current.filter(x => x.uid !== a.uid);
      nodesRef.current.delete(a.uid);
      commitRender();
    }, a.isTarget ? 220 : 320);
  }, [fbLevel, onGoodEvent, onBadEvent, showWrongFlash, commitRender]);

  // ── Fim da sessão ──
  const endSession = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
    cancelTTS();
    finish();
    const captures = capturesRef.current;
    const fp = falsePosRef.current;
    const om = omissionsRef.current;
    const resolved = captures + fp + om;
    // Acurácia de atenção seletiva: capturas / (capturas + erros + omissões).
    const accuracy = resolved > 0 ? captures / resolved : 0;
    const avgRt = rtNRef.current > 0 ? Math.round(rtSumRef.current / rtNRef.current) : 0;
    const firsts = firstMsListRef.current;
    const timeToFirstMs = firsts.length ? Math.round(firsts.reduce((s, x) => s + x, 0) / firsts.length) : null;
    onComplete({
      exerciseId, domain: "attention",
      score: calculateExerciseScore("focus-agents", accuracy, avgRt, reachedRef.current),
      accuracy, reactionTime: avgRt, difficulty: reachedRef.current,
      duration: elapsedSec(),
      metadata: {
        // Compatível com lib/focus-report.ts (mesmos campos-chave).
        mode: "foco", level: reachedRef.current, startedLevel: startLevelRef.current,
        mechanic: "rain",   // marca a mecânica de queda (novo; ignorado pelo relatório atual)
        autoAdvance: settings?.autoAdvance !== false,
        channel: presentMode !== "visual" ? "auditivo" : "visual",
        rounds: resolved, correct: captures,
        falsePositives: fp, omissions: om,
        timeToFirstMs,
        switchRounds: 0, errorsAfterSwitch: 0,
        rounds_detail: eventsRef.current,
      },
    });
  }, [exerciseId, elapsedSec, finish, onComplete, presentMode, settings]);

  // ── Loop de física (queda) ──
  useEffect(() => {
    begin();
    const measure = () => {
      playWRef.current = playRef.current?.clientWidth ?? 360;
      playHRef.current = playRef.current?.clientHeight ?? 600;
    };
    measure();
    window.addEventListener("resize", measure);

    // Primeira onda + primeiro spawn imediato. O INTERVALO de spawn é criado/
    // recriado pelo effect [displayLevel] abaixo (também dispara na montagem),
    // para não haver dois intervalos concorrentes.
    enqueueWave();
    spawnOne();

    let prev: number | null = null;
    const tick = (ts: number) => {
      if (doneRef.current) return;
      const dt = prev === null ? 16 : Math.min(ts - prev, 100);
      prev = ts;
      const H = playHRef.current;
      const bottom = H;   // agente "cai" quando o topo passa da base
      let changed = false;

      for (const a of agentsRef.current) {
        if (a.state !== "falling") continue;
        a.y += a.vy * dt;
        const node = nodesRef.current.get(a.uid);
        // Queda estritamente vertical: x fixo; o transform anima só o y (px).
        if (node) node.style.transform = `translate(0px, ${a.y}px)`;
        if (a.y >= bottom) {
          if (a.isTarget && a.passCount === 0) {
            // 2ª CHANCE: volta ao topo, cai mais rápido.
            a.passCount = 1;
            a.y = -CHAR_H;
            a.vy = fallSpeed(H, RAIN_CFG[levelRef.current].fallMs) * RAIN_CFG[levelRef.current].secondChance;
            if (node) node.style.transform = `translate(0px, ${a.y}px)`;
          } else if (a.isTarget) {
            // Escapou a 2ª vez → OMISSÃO.
            a.state = "missed";
            omissionsRef.current++;
            soundMiss(); if (fbLevel === "intenso") vibrate([30, 20, 30]);
            eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "timeout", rtMs: Date.now() - a.spawnAt });
            onBadEvent();
            changed = true;
          } else {
            // DISTRATOR que cai = CORRETO (era pra deixar) — some sem penalidade.
            a.state = "captured";   // reaproveita "captured" só p/ remoção; não pontua
            changed = true;
          }
        }
      }

      // Remove os resolvidos por queda (omissão / distrator correto).
      if (changed) {
        const before = agentsRef.current.length;
        agentsRef.current = agentsRef.current.filter(a => !(a.state !== "falling" && a.y >= bottom));
        for (const uid of nodesRef.current.keys()) {
          if (!agentsRef.current.some(a => a.uid === uid)) nodesRef.current.delete(uid);
        }
        if (agentsRef.current.length !== before) commitRender();
      }

      if (isTimeUp()) { endSession(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", measure);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      cancelTTS();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reajusta o intervalo de spawn quando o nível muda (mais denso nos níveis altos).
  useEffect(() => {
    if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); }
    spawnTimerRef.current = setInterval(() => spawnOne(), RAIN_CFG[levelRef.current].spawnMs);
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLevel]);

  // ── Render ──
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ zIndex: 40, background: "radial-gradient(ellipse at 50% 20%, #0a1340 0%, #02060f 100%)" }}>
      {/* HUD */}
      <div className="relative z-20 px-3 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 text-white"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">🎯 Foco · Chuva</span>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-black/20 whitespace-nowrap">Nível {displayLevel}</span>
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-amber-400/20 whitespace-nowrap" style={{ color: "#fbbf24" }}>⭐ {points}</span>
        </div>
      </div>

      {/* Regra — sempre visível no topo durante a queda */}
      <div className="relative z-20 flex-shrink-0 px-3 pb-1">
        <div className="rounded-2xl px-3 py-2 text-center" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
          <p className="text-white text-sm font-bold leading-tight" style={{ whiteSpace: "pre-line" }}>{command}</p>
        </div>
      </div>

      {/* Arena de queda */}
      <div ref={playRef} className="relative z-10 flex-1 overflow-hidden">
        {renderAgents.map(a => {
          const src = a.agent.images[a.variant]?.src ?? a.agent.images[0].src;
          const glow =
            a.state === "captured" ? " drop-shadow(0 0 10px rgba(74,222,128,0.95)) drop-shadow(0 0 20px rgba(74,222,128,0.7))" :
            a.state === "wrong"    ? " drop-shadow(0 0 10px rgba(248,113,113,0.95))" : "";
          const dim = a.state === "wrong";
          return (
            <div key={a.uid}
              ref={node => {
                if (node) {
                  nodesRef.current.set(a.uid, node);
                  // Posição inicial imperativa; a partir daí o rAF é o dono do
                  // transform (não passamos `transform` no style do React, senão
                  // cada re-render — spawn/remoção — jogaria o agente de volta à
                  // posição do snapshot, causando "pulo").
                  const cur = agentsRef.current.find(x => x.uid === a.uid);
                  if (cur) node.style.transform = `translate(0px, ${cur.y}px)`;
                } else { nodesRef.current.delete(a.uid); }
              }}
              style={{
                position: "absolute", left: a.x, top: 0, width: CHAR_SIZE,
                willChange: "transform", pointerEvents: "none", zIndex: 3,
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src + AGENT_V} alt={a.agent.name} decoding="async" loading="eager" draggable={false}
                style={{ width: "100%", height: "auto", display: "block", userSelect: "none",
                  opacity: dim ? 0.5 : 1,
                  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" + glow,
                  transition: "filter 150ms, opacity 150ms", pointerEvents: "none" }} />
              {/* Botão = só a silhueta do corpo (hitbox = corpo visível). */}
              <button onClick={() => handleTap(a.uid)} aria-label={a.agent.name}
                className="absolute cursor-pointer"
                style={{ left: `${HIT_L * 100}%`, width: `${(HIT_R - HIT_L) * 100}%`,
                  top: `${HIT_T * 100}%`, height: `${(HIT_B - HIT_T) * 100}%`,
                  background: "transparent", border: "none", padding: 0,
                  pointerEvents: a.state === "falling" ? "auto" : "none", touchAction: "manipulation" }} />
              {a.state === "captured" && a.isTarget && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✓</div>
              )}
              {a.state === "wrong" && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✕</div>
              )}
            </div>
          );
        })}

        {/* Feedback rápido (erro impulsivo) */}
        <AnimatePresence>
          {flash && (
            <motion.div className="absolute inset-x-0 bottom-6 z-30 flex justify-center pointer-events-none"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
                style={{ background: "rgba(220,38,38,0.92)", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
                ❌ {flash.msg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
