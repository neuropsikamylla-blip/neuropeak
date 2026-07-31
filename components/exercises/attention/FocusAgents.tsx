"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Focus Agentes — REFORMULADO (atenção/busca visual, sem emoções). Ver
// FOCUS-AGENTES-REFORMULACAO-SPEC.md. Fundação em lib/focus/*.
//  • comando SEMPRE visível no topo (§4)  • personagens grandes que NÃO escapam (§2,§3)
//  • etapas 1–5 (§6) por escada de 1 variável/passo (§8)  • auto-avanço + feedback
//    específico (§10)  • adaptativo por BLOCO de 8 (§9)  • resultado do bloco (§13)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { playTTS, cancelTTS } from "@/lib/tts";
import type { ExerciseResult, Theme } from "@/types";
import { gerarRodada, matches, atributoFaltante, type FocusRound, type Etapa } from "@/lib/focus/commands";
import { charById, COR_HEX, type Acessorio, type Objeto } from "@/lib/focus/roster";

export interface FocusAgentsProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  exerciseId?: string;
  settings?: unknown;
}

const IMG_BASE = "/exercises/agentes-personagens";
const IMG_V = "?v=1";
const CHAR = 116;          // tamanho do personagem (px) — ~35% maior que os 86 antigos (§2)
const TOUCH_PAD = 10;      // área de toque um pouco maior que a imagem (§11)
const BLOCO = 8;           // tentativas por bloco (§9)

// Escada de dificuldade — cada passo muda UMA variável (§8). vel: 0 parado ·
// 1 muito lento · 2 lento · 3 moderado (§7).
type Step = { etapa: Etapa; n: number; vel: number };
const STEPS: Step[] = [
  { etapa: 1, n: 4, vel: 0 }, { etapa: 1, n: 5, vel: 0 }, { etapa: 1, n: 6, vel: 0 },
  { etapa: 1, n: 6, vel: 1 }, { etapa: 2, n: 6, vel: 1 }, { etapa: 2, n: 7, vel: 1 },
  { etapa: 2, n: 7, vel: 2 }, { etapa: 2, n: 8, vel: 2 }, { etapa: 3, n: 8, vel: 2 },
  { etapa: 4, n: 8, vel: 2 }, { etapa: 4, n: 9, vel: 2 }, { etapa: 4, n: 9, vel: 3 },
  { etapa: 5, n: 9, vel: 3 }, { etapa: 5, n: 10, vel: 3 },
];
const VEL_PX = [0, 0.28, 0.55, 0.95]; // px/frame por nível

const ACC_EMOJI: Record<Acessorio, string> = {
  bone: "🧢", fone: "🎧", oculos: "👓", oculos_escuro: "🕶️", chapeu: "🎩",
  gorro: "🧶", coroa: "👑", luva: "🧤",
};
const OBJ_EMOJI: Record<Objeto, string> = {
  balao: "🎈", guarda_chuva: "☂️", pipa: "🪁", skate: "🛹",
  bola_basquete: "🏀", bola_futebol: "⚽",
};

interface LiveChar { uid: string; id: string; isTarget: boolean; bx: number; by: number; x: number; y: number; vx: number; vy: number; }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// Posições seguras (§12): grade jittered que não sobrepõe, com margem.
function posicoesSeguras(n: number, W: number, H: number): { x: number; y: number }[] {
  const cell = CHAR + 24;
  const cols = Math.max(2, Math.floor(W / cell));
  const rows = Math.max(2, Math.ceil(n / cols));
  const cellW = W / cols, cellH = H / rows;
  const idxs = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
  const out: { x: number; y: number }[] = [];
  for (let k = 0; k < n; k++) {
    const c = idxs[k] % cols, r = Math.floor(idxs[k] / cols);
    const jx = rnd(4, Math.max(6, cellW - CHAR - 4));
    const jy = rnd(4, Math.max(6, cellH - CHAR - 4));
    out.push({ x: Math.min(W - CHAR, c * cellW + jx), y: Math.min(H - CHAR, r * cellH + jy) });
  }
  return out;
}

// ── Sprite do personagem ─────────────────────────────────────────────────────
function CharView({ lc, big, dim, onTap, refNode }: {
  lc: LiveChar; big: boolean; dim: boolean; onTap: () => void; refNode: (n: HTMLButtonElement | null) => void;
}) {
  const src = `${IMG_BASE}/${lc.id}.png${IMG_V}`;
  return (
    <button ref={refNode} onPointerDown={onTap} aria-label="personagem"
      style={{ position: "absolute", left: lc.bx - TOUCH_PAD, top: lc.by - TOUCH_PAD,
        width: CHAR + TOUCH_PAD * 2, height: CHAR + TOUCH_PAD * 2, padding: TOUCH_PAD,
        background: "transparent", border: "none", cursor: "pointer", touchAction: "manipulation",
        zIndex: big ? 30 : 10, opacity: dim ? 0.22 : 1, transition: "opacity .25s" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} decoding="async"
        style={{ width: CHAR, height: CHAR, display: "block", userSelect: "none", pointerEvents: "none",
          filter: big
            ? "drop-shadow(0 0 10px rgba(74,222,128,.95)) drop-shadow(0 0 20px rgba(74,222,128,.8))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }} />
    </button>
  );
}

// ── Barra de comando (SEMPRE visível) ────────────────────────────────────────
function CommandBar({ round, onAudio }: { round: FocusRound; onAudio: () => void }) {
  const partes = round.texto.split("**"); // ímpares = trecho destacado ("NÃO")
  return (
    <div className="w-full rounded-2xl px-3 py-2.5 flex items-center gap-3"
      style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/45 flex-shrink-0">Alvo</span>
      {round.amostraCor && (
        <span className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/40" style={{ background: COR_HEX[round.amostraCor] }} />
      )}
      {round.acessorioIcone && <span className="text-xl flex-shrink-0">{ACC_EMOJI[round.acessorioIcone]}</span>}
      {round.objetoIcone && <span className="text-xl flex-shrink-0">{OBJ_EMOJI[round.objetoIcone]}</span>}
      <p className="text-white font-bold text-sm sm:text-base leading-tight flex-1">
        {partes.map((p, i) => i % 2 === 1
          ? <span key={i} className="text-red-400 font-black">{p}</span>
          : <span key={i}>{p}</span>)}
      </p>
      <button onClick={onAudio} aria-label="Ouvir o comando"
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-90 transition-transform"
        style={{ background: "rgba(255,255,255,0.14)" }}>🔊</button>
    </div>
  );
}

// ── Tela de instruções (§5) ──────────────────────────────────────────────────
function Instrucoes({ onStart }: { onStart: () => void }) {
  const bullets = [
    "Observe a cor e o acessório indicados.",
    "Toque apenas no personagem que corresponde ao comando.",
    "Primeiro procure acertar. A velocidade aumenta aos poucos.",
    "O comando fica visível no topo da tela.",
    "Use o botão 🔊 para ouvir o comando de novo.",
  ];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
      style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2244 55%,#081020 100%)" }}>
      <div className="w-full max-w-md rounded-3xl p-6"
        style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.14)" }}>
        <h2 className="text-white font-black text-2xl text-center">Como jogar</h2>
        <p className="text-white/60 text-sm text-center mt-1 mb-4">Encontre o personagem indicado.</p>
        <div className="rounded-2xl px-3 py-2.5 flex items-center gap-3 mb-4"
          style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
          <span className="w-6 h-6 rounded-full border-2 border-white/40" style={{ background: COR_HEX.azul }} />
          <span className="text-xl">🎧</span>
          <p className="text-white font-bold text-sm">Toque no personagem azul com fone.</p>
        </div>
        <ul className="space-y-2 mb-6">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80 text-sm leading-snug">
              <span className="text-cyan-300 font-black">•</span><span>{b}</span>
            </li>
          ))}
        </ul>
        <button onClick={onStart}
          className="w-full h-12 rounded-full font-bold text-white text-base active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Começar</button>
      </div>
    </div>
  );
}

// ── Resultado do bloco (§13) ─────────────────────────────────────────────────
type BlocoRes = { acertos: number; erros: number; precisao: number; medianaSeg: number; melhorSeq: number; nivel: number; ajuste: string };
function ResultadoBloco({ r, onNext }: { r: BlocoRes; onNext: () => void }) {
  const linha = (k: string, v: string) => (
    <div className="flex justify-between py-1.5 border-b border-white/10 text-sm">
      <span className="text-white/60">{k}</span><span className="text-white font-bold">{v}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: "linear-gradient(160deg,#0a1628,#0d2244,#081020)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.16)" }}>
        <h2 className="text-white font-black text-xl text-center mb-4">Resultado do bloco</h2>
        {linha("Acertos", `${r.acertos} de ${r.acertos + r.erros}`)}
        {linha("Precisão", `${r.precisao}%`)}
        {linha("Tempo mediano", `${r.medianaSeg.toFixed(1)} s`)}
        {linha("Melhor sequência", `${r.melhorSeq}`)}
        {linha("Nível", `${r.nivel}`)}
        <p className="text-center text-cyan-300 text-sm font-semibold mt-4">{r.ajuste}</p>
        <button onClick={onNext}
          className="w-full h-12 rounded-full font-bold text-white text-base mt-5 active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Continuar</button>
      </motion.div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents" }: FocusAgentsProps) {
  const auditivo = exerciseId === "focus-agents-auditivo";
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  type Fase = "instrucoes" | "jogando" | "feedback" | "bloco";
  const [fase, setFase] = useState<Fase>("instrucoes");
  const [round, setRound] = useState<FocusRound | null>(null);
  const [chars, setChars] = useState<LiveChar[]>([]);
  const [fb, setFb] = useState<{ ok: boolean; msg: string; alvoUid: string | null } | null>(null);
  const [blocoRes, setBlocoRes] = useState<BlocoRes | null>(null);

  const stepRef = useRef(Math.max(0, Math.min(STEPS.length - 1, Math.round((difficulty - 1) * 0.4))));
  const bloco = useRef({ tentativas: 0, acertos: 0, errosSeguidos: 0, maxErros: 0, seq: 0, melhorSeq: 0, tempos: [] as number[] });
  const totais = useRef({ acertos: 0, total: 0, tempos: [] as number[] });
  const rodadaAbertaEm = useRef(0);
  const respondidoRef = useRef(false);
  const arenaRef = useRef<HTMLDivElement>(null);
  const dims = useRef({ w: 360, h: 480 });
  const charsRef = useRef<LiveChar[]>([]);
  const nodes = useRef<Map<string, HTMLButtonElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const doneRef = useRef(false);
  const uidSeq = useRef(0);
  const iniciouRef = useRef(false);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const stopRaf = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  useEffect(() => () => { stopRaf(); clearTimers(); cancelTTS(); }, []);

  const falar = useCallback((r: FocusRound) => { playTTS(r.texto.replace(/\*\*/g, "")); }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      const W = dims.current.w, H = dims.current.h;
      for (const c of charsRef.current) {
        if (c.vx === 0 && c.vy === 0) continue;
        c.x += c.vx; c.y += c.vy;
        if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx); }
        if (c.x + CHAR > W) { c.x = W - CHAR; c.vx = -Math.abs(c.vx); }
        if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy); }
        if (c.y + CHAR > H) { c.y = H - CHAR; c.vy = -Math.abs(c.vy); }
        const node = nodes.current.get(c.uid);
        if (node) node.style.transform = `translate(${c.x - c.bx}px, ${c.y - c.by}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const encerrar = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true; stopRaf(); clearTimers(); finish();
    const t = totais.current;
    const acc = t.total ? t.acertos / t.total : 0;
    const avgRt = t.tempos.length ? (t.tempos.reduce((s, x) => s + x, 0) / t.tempos.length) * 1000 : 1500;
    const score = calculateExerciseScore("focus-agents", acc, avgRt, difficulty);
    onComplete({
      exerciseId: "focus-agents", domain: "attention", score, accuracy: acc,
      reactionTime: avgRt, difficulty: stepRef.current + 1, duration: elapsedSec(),
      metadata: { trials: t.total, correct: t.acertos, avgRT: avgRt, nivel: stepRef.current + 1 },
    });
  }, [difficulty, elapsedSec, finish, onComplete]);

  const novaRodada = useCallback(() => {
    if (doneRef.current || isTimeUp()) { encerrar(); return; }
    const step = STEPS[stepRef.current];
    const W = dims.current.w, H = dims.current.h;
    const r = gerarRodada(step.etapa, step.n);
    const pos = posicoesSeguras(step.n, W, H);
    const alvoIdx = r.personagensIds.indexOf(r.alvoId);
    const live: LiveChar[] = r.personagensIds.map((id, i) => {
      const p = pos[i] ?? { x: rnd(0, Math.max(1, W - CHAR)), y: rnd(0, Math.max(1, H - CHAR)) };
      const ang = Math.random() * Math.PI * 2;
      const v = VEL_PX[step.vel] * rnd(0.7, 1.2);
      return { uid: `c${uidSeq.current++}`, id, isTarget: i === alvoIdx,
        bx: p.x, by: p.y, x: p.x, y: p.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v };
    });
    charsRef.current = live;
    setChars(live);
    setRound(r);
    setFb(null);
    respondidoRef.current = false;
    rodadaAbertaEm.current = Date.now();
    setFase("jogando");
    if (auditivo) falar(r);
    startRaf();
  }, [auditivo, falar, isTimeUp, encerrar, startRaf]);

  // mede a arena e inicia a 1ª rodada só DEPOIS de medir (senão nasce na área errada)
  useLayoutEffect(() => {
    const el = arenaRef.current;
    if (!el) return;
    const measure = () => { dims.current = { w: el.clientWidth, h: el.clientHeight }; };
    measure();
    if (fase === "jogando" && !iniciouRef.current && !doneRef.current) { iniciouRef.current = true; novaRodada(); }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fase, novaRodada]);

  const fecharBloco = useCallback(() => {
    const b = bloco.current;
    const prec = Math.round((b.acertos / Math.max(1, b.tentativas)) * 100);
    const med = b.tempos.length ? [...b.tempos].sort((x, y) => x - y)[Math.floor(b.tempos.length / 2)] : 0;
    let ajuste = "Mesmo nível no próximo bloco.";
    if (prec >= 80 && b.maxErros <= 2 && stepRef.current < STEPS.length - 1) {
      stepRef.current++; ajuste = "Dificuldade aumentada levemente.";
    } else if ((prec < 60 || b.maxErros >= 3) && stepRef.current > 0) {
      stepRef.current--; ajuste = "Dificuldade reduzida para ajudar.";
    }
    setBlocoRes({ acertos: b.acertos, erros: b.tentativas - b.acertos, precisao: prec,
      medianaSeg: med, melhorSeq: b.melhorSeq, nivel: stepRef.current + 1, ajuste });
    bloco.current = { tentativas: 0, acertos: 0, errosSeguidos: 0, maxErros: 0, seq: 0, melhorSeq: 0, tempos: [] };
    setFase("bloco");
  }, []);

  const responder = useCallback((tocado: LiveChar) => {
    if (fase !== "jogando" || respondidoRef.current || doneRef.current || !round) return;
    respondidoRef.current = true;
    stopRaf();
    const rt = (Date.now() - rodadaAbertaEm.current) / 1000;
    const escolhido = charById(tocado.id)!;
    const acertou = matches(escolhido, round.criterio) && tocado.id === round.alvoId;

    const b = bloco.current, t = totais.current;
    b.tentativas++; t.total++;
    if (acertou) {
      b.acertos++; t.acertos++; b.tempos.push(rt); t.tempos.push(rt);
      b.errosSeguidos = 0; b.seq++; b.melhorSeq = Math.max(b.melhorSeq, b.seq);
    } else {
      b.errosSeguidos++; b.maxErros = Math.max(b.maxErros, b.errosSeguidos); b.seq = 0;
    }
    const msg = acertou
      ? (round.criterio.cor && (round.criterio.acessorios || round.criterio.objeto) ? "Acertou a cor e o acessório!" : "Correto!")
      : atributoFaltante(round.criterio, escolhido);
    setFb({ ok: acertou, msg, alvoUid: acertou ? null : charsRef.current.find((c) => c.id === round.alvoId)?.uid ?? null });
    setFase("feedback");

    const espera = acertou ? 950 : 1400;
    timers.current.push(setTimeout(() => {
      if (bloco.current.tentativas >= BLOCO) fecharBloco();
      else novaRodada();
    }, espera));
  }, [fase, round, novaRodada, fecharBloco]);

  // ── render ─────────────────────────────────────────────────────────────────
  if (fase === "instrucoes") {
    return <Instrucoes onStart={() => { begin(); setFase("jogando"); }} />;
  }
  if (fase === "bloco" && blocoRes) {
    return <ResultadoBloco r={blocoRes} onNext={() => { setBlocoRes(null); novaRodada(); }} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2244 55%,#081020 100%)" }}>
      <div className="flex-shrink-0 px-3 pt-3 pb-2 space-y-2" style={{ zIndex: 40 }}>
        {round && <CommandBar round={round} onAudio={() => round && falar(round)} />}
        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
      </div>

      <div ref={arenaRef} className="relative flex-1 overflow-hidden mx-2 mb-2 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {chars.map((lc) => (
          <CharView key={lc.uid} lc={lc}
            big={fase === "feedback" && fb?.alvoUid === lc.uid}
            dim={fase === "feedback" && !!fb && !fb.ok && fb.alvoUid !== lc.uid}
            onTap={() => responder(lc)}
            refNode={(n) => { if (n) nodes.current.set(lc.uid, n); else nodes.current.delete(lc.uid); }} />
        ))}

        <AnimatePresence>
          {fase === "feedback" && fb && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute left-1/2 bottom-4 -translate-x-1/2 px-4 py-2 rounded-xl font-bold text-sm text-center max-w-[90%]"
              style={{ background: fb.ok ? "rgba(22,163,74,0.94)" : "rgba(220,38,38,0.94)", color: "#fff", zIndex: 45 }}>
              {fb.ok ? "✓ " : "✗ "}{fb.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
