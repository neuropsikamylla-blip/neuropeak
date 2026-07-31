"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Focus Agentes — REFORMULADO (atenção/busca visual, sem emoções). Ver
// FOCUS-AGENTES-REFORMULACAO-SPEC.md. Fundação em lib/focus/*.
//  • personagens CAEM de cima (sempre), velocidade sobe com a progressão
//  • comando é ANUNCIADO antes de cada rodada E fica visível no topo
//  • etapas 1–5 por escada de 1 variável/passo · adaptativo por BLOCO de 8
//  • imagens em proporção 2:3 (não amassam) · tutorial demonstrativo
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
// imagens são 360×540 (2:3). Mantemos a proporção — largura menor, altura maior.
const CHAR_W = 112;                       // ~30% maior que os 86 de antes (§2)
const CHAR_H = Math.round(CHAR_W / 0.667); // ≈168 — proporção da arte, não amassa
const TOUCH_PAD = 10;                     // área de toque um pouco maior (§11)
const BLOCO = 8;                          // tentativas por bloco (§9)

// Escada de dificuldade — cada passo muda UMA variável (§8). vel = velocidade de QUEDA.
type Step = { etapa: Etapa; n: number; vel: number };
const STEPS: Step[] = [
  { etapa: 1, n: 4, vel: 0 }, { etapa: 1, n: 5, vel: 0 }, { etapa: 1, n: 6, vel: 1 },
  { etapa: 2, n: 6, vel: 1 }, { etapa: 2, n: 7, vel: 1 }, { etapa: 2, n: 7, vel: 2 },
  { etapa: 2, n: 8, vel: 2 }, { etapa: 3, n: 8, vel: 2 }, { etapa: 3, n: 8, vel: 3 },
  { etapa: 4, n: 8, vel: 2 }, { etapa: 4, n: 9, vel: 3 }, { etapa: 5, n: 9, vel: 3 },
  { etapa: 5, n: 10, vel: 3 },
];
const VEL_PX = [2.0, 2.8, 3.7, 4.8];  // px/frame de queda — SEMPRE cai; sobe com a progressão

const ACC_EMOJI: Record<Acessorio, string> = {
  bone: "🧢", fone: "🎧", oculos: "👓", oculos_escuro: "🕶️", chapeu: "🎩",
  gorro: "🧶", coroa: "👑", luva: "🧤",
};
const OBJ_EMOJI: Record<Objeto, string> = {
  balao: "🎈", guarda_chuva: "☂️", pipa: "🪁", skate: "🛹",
  bola_basquete: "🏀", bola_futebol: "⚽",
};

interface LiveChar { uid: string; id: string; isTarget: boolean; bx: number; by: number; y: number; vy: number; }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ── Sprite do personagem (proporção 2:3, cai) ────────────────────────────────
function CharView({ lc, big, dim, onTap, refNode }: {
  lc: LiveChar; big: boolean; dim: boolean; onTap: () => void; refNode: (n: HTMLButtonElement | null) => void;
}) {
  const src = `${IMG_BASE}/${lc.id}.png${IMG_V}`;
  return (
    <button ref={refNode} onPointerDown={onTap} aria-label="personagem"
      style={{ position: "absolute", left: lc.bx - TOUCH_PAD, top: lc.by - TOUCH_PAD,
        width: CHAR_W + TOUCH_PAD * 2, height: CHAR_H + TOUCH_PAD * 2, padding: TOUCH_PAD,
        background: "transparent", border: "none", cursor: "pointer", touchAction: "manipulation",
        zIndex: big ? 30 : 10, opacity: dim ? 0.2 : 1, transition: "opacity .25s" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} decoding="async"
        style={{ width: CHAR_W, height: CHAR_H, display: "block", userSelect: "none", pointerEvents: "none",
          filter: big
            ? "drop-shadow(0 0 10px rgba(74,222,128,.95)) drop-shadow(0 0 20px rgba(74,222,128,.8))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }} />
    </button>
  );
}

// ── Barra de comando (SEMPRE visível) ────────────────────────────────────────
function CommandBar({ round, onAudio }: { round: FocusRound; onAudio: () => void }) {
  const partes = round.texto.split("**");
  return (
    <div className="w-full rounded-2xl px-3 py-2.5 flex items-center gap-3"
      style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/45 flex-shrink-0">Alvo</span>
      {round.amostraCor && <span className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/40" style={{ background: COR_HEX[round.amostraCor] }} />}
      {round.acessorioIcone && <span className="text-xl flex-shrink-0">{ACC_EMOJI[round.acessorioIcone]}</span>}
      {round.objetoIcone && <span className="text-xl flex-shrink-0">{OBJ_EMOJI[round.objetoIcone]}</span>}
      <p className="text-white font-bold text-sm sm:text-base leading-tight flex-1">
        {partes.map((p, i) => i % 2 === 1 ? <span key={i} className="text-red-400 font-black">{p}</span> : <span key={i}>{p}</span>)}
      </p>
      <button onClick={onAudio} aria-label="Ouvir o comando"
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-90 transition-transform"
        style={{ background: "rgba(255,255,255,0.14)" }}>🔊</button>
    </div>
  );
}

// ── Anúncio do comando ANTES da rodada (§ "mandar antes") ────────────────────
function AnuncioComando({ round }: { round: FocusRound }) {
  const partes = round.texto.split("**");
  return (
    <motion.div key={round.alvoId + round.texto} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center z-40 px-6">
      <div className="rounded-3xl px-6 py-5 text-center max-w-sm"
        style={{ background: "rgba(10,22,48,0.92)", border: "1.5px solid rgba(255,255,255,0.22)", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">👁 Encontre</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          {round.amostraCor && <span className="w-8 h-8 rounded-full border-2 border-white/40" style={{ background: COR_HEX[round.amostraCor] }} />}
          {round.acessorioIcone && <span className="text-2xl">{ACC_EMOJI[round.acessorioIcone]}</span>}
          {round.objetoIcone && <span className="text-2xl">{OBJ_EMOJI[round.objetoIcone]}</span>}
        </div>
        <p className="text-white font-black text-lg leading-snug">
          {partes.map((p, i) => i % 2 === 1 ? <span key={i} className="text-red-400">{p}</span> : <span key={i}>{p}</span>)}
        </p>
      </div>
    </motion.div>
  );
}

// ── Tutorial demonstrativo (grade com o ALVO destacado — como antes) ─────────
const DEMO = [
  { id: "azul_fone", alvo: true }, { id: "vermelho_base", alvo: false }, { id: "verde_oculos", alvo: false },
  { id: "roxo_bone", alvo: false }, { id: "amarelo_coroa", alvo: false }, { id: "laranja_base", alvo: false },
];
function Tutorial({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
      style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2244 55%,#081020 100%)" }}>
      <h2 className="text-white font-black text-2xl mb-1 text-center">Como jogar</h2>
      <p className="text-white/60 text-sm mb-4 text-center">Encontre o personagem indicado.</p>

      {/* Comando de exemplo */}
      <div className="w-full max-w-xs rounded-2xl px-3 py-2.5 flex items-center gap-3 mb-4"
        style={{ background: "rgba(255,255,255,0.09)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
        <span className="w-6 h-6 rounded-full border-2 border-white/40" style={{ background: COR_HEX.azul }} />
        <span className="text-xl">🎧</span>
        <p className="text-white font-bold text-sm">Toque no azul com fone</p>
      </div>

      {/* Grade demo — o ALVO fica destacado com ✓ verde */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-5">
        {DEMO.map((d) => (
          <div key={d.id} className="relative flex items-end justify-center" style={{ height: 116 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG_BASE}/${d.id}.png${IMG_V}`} alt="" draggable={false}
              style={{ width: 68, height: 102, objectFit: "contain",
                filter: d.alvo ? "drop-shadow(0 0 8px rgba(74,222,128,.95)) drop-shadow(0 0 16px rgba(74,222,128,.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,.5))" }} />
            {d.alvo && <div className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>}
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-1.5"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {[
          "Leia o comando (cor + acessório) que aparece antes e fica no topo.",
          "Os personagens caem pela tela — toque só no que corresponde.",
          "Primeiro procure acertar; a velocidade aumenta aos poucos.",
          "Use o 🔊 para ouvir o comando de novo.",
        ].map((b, i) => (
          <p key={i} className="text-white/75 text-xs leading-relaxed">• {b}</p>
        ))}
      </div>

      <button onClick={onStart}
        className="w-full max-w-xs h-12 rounded-full font-bold text-white text-base active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Começar! 🚀</button>
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

  type Fase = "instrucoes" | "comando" | "jogando" | "feedback" | "bloco";
  const [fase, setFase] = useState<Fase>("instrucoes");
  const [round, setRound] = useState<FocusRound | null>(null);
  const [chars, setChars] = useState<LiveChar[]>([]);
  const [fb, setFb] = useState<{ ok: boolean; msg: string; alvoUid: string | null } | null>(null);
  const [blocoRes, setBlocoRes] = useState<BlocoRes | null>(null);

  const stepRef = useRef(Math.max(0, Math.min(STEPS.length - 1, Math.round((difficulty - 1) * 0.4))));
  const bloco = useRef({ tentativas: 0, acertos: 0, errosSeguidos: 0, maxErros: 0, seq: 0, melhorSeq: 0, tempos: [] as number[] });
  const totais = useRef({ acertos: 0, total: 0, omissoes: 0, tempos: [] as number[] });
  const rodadaAbertaEm = useRef(0);
  const respondidoRef = useRef(false);
  const arenaRef = useRef<HTMLDivElement>(null);
  const dims = useRef({ w: 360, h: 480 });
  const charsRef = useRef<LiveChar[]>([]);
  const roundRef = useRef<FocusRound | null>(null);
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
      metadata: { trials: t.total, correct: t.acertos, omissoes: t.omissoes, avgRT: avgRt, nivel: stepRef.current + 1 },
    });
  }, [difficulty, elapsedSec, finish, onComplete]);

  // loop de QUEDA — personagens sempre descem; sair por baixo NÃO é erro (§3)
  const startRaf = useCallback((onOmissao: () => void) => {
    stopRaf();
    const tick = () => {
      const H = dims.current.h;
      let saiu = false;
      for (const c of charsRef.current) {
        c.y += c.vy;
        const node = nodes.current.get(c.uid);
        if (node) node.style.transform = `translateY(${c.y - c.by}px)`;
        if (c.y > H + 10) saiu = true;
      }
      if (saiu) {
        charsRef.current = charsRef.current.filter((c) => c.y <= H + 10);
        setChars([...charsRef.current]);
        if (charsRef.current.length === 0 && !respondidoRef.current) { onOmissao(); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // encadeamento das rodadas via refs (evita ciclos de useCallback)
  const proximaRef = useRef<() => void>(() => {});
  const iniciarQuedaRef = useRef<(r: FocusRound) => void>(() => {});

  const iniciarQueda = useCallback((r: FocusRound) => {
    const step = STEPS[stepRef.current];
    const W = dims.current.w, H = dims.current.h;
    const alvoIdx = r.personagensIds.indexOf(r.alvoId);
    const v = VEL_PX[step.vel];
    // colunas: um por coluna quando cabe; os que dividem coluna são escalonados no y
    const nCols = Math.max(2, Math.floor(W / (CHAR_W + 12)));
    const colW = W / nCols;
    const colOrder = shuffle(r.personagensIds.map((_, i) => i % nCols));
    const stackByCol: Record<number, number> = {};
    const live: LiveChar[] = r.personagensIds.map((id, i) => {
      const col = colOrder[i];
      const stack = (stackByCol[col] = (stackByCol[col] ?? 0) + 1) - 1;
      const x = Math.max(6, Math.min(W - CHAR_W - 6, col * colW + rnd(6, Math.max(8, colW - CHAR_W - 6))));
      const y = -CHAR_H - stack * (CHAR_H * 0.9) - rnd(0, 30);
      return { uid: `c${uidSeq.current++}`, id, isTarget: i === alvoIdx, bx: x, by: y, y, vy: v * rnd(0.92, 1.12) };
    });
    charsRef.current = live;
    setChars(live);
    respondidoRef.current = false;
    rodadaAbertaEm.current = Date.now();
    setFase("jogando");
    startRaf(() => { registra(false, null, true); proximaRef.current(); });
  }, [startRaf]);
  iniciarQuedaRef.current = iniciarQueda;

  // registra o resultado de uma tentativa (acerto / erro / omissão)
  const registra = useCallback((acertou: boolean, rt: number | null, omissao: boolean) => {
    const b = bloco.current, t = totais.current;
    b.tentativas++; t.total++;
    if (omissao) t.omissoes++;
    if (acertou) {
      b.acertos++; t.acertos++; if (rt != null) { b.tempos.push(rt); t.tempos.push(rt); }
      b.errosSeguidos = 0; b.seq++; b.melhorSeq = Math.max(b.melhorSeq, b.seq);
    } else {
      b.errosSeguidos++; b.maxErros = Math.max(b.maxErros, b.errosSeguidos); b.seq = 0;
    }
  }, []);

  const fecharBloco = useCallback(() => {
    const b = bloco.current;
    const prec = Math.round((b.acertos / Math.max(1, b.tentativas)) * 100);
    const med = b.tempos.length ? [...b.tempos].sort((x, y) => x - y)[Math.floor(b.tempos.length / 2)] : 0;
    let ajuste = "Mesmo nível no próximo bloco.";
    if (prec >= 80 && b.maxErros <= 2 && stepRef.current < STEPS.length - 1) { stepRef.current++; ajuste = "Dificuldade aumentada levemente."; }
    else if ((prec < 60 || b.maxErros >= 3) && stepRef.current > 0) { stepRef.current--; ajuste = "Dificuldade reduzida para ajudar."; }
    setBlocoRes({ acertos: b.acertos, erros: b.tentativas - b.acertos, precisao: prec, medianaSeg: med, melhorSeq: b.melhorSeq, nivel: stepRef.current + 1, ajuste });
    bloco.current = { tentativas: 0, acertos: 0, errosSeguidos: 0, maxErros: 0, seq: 0, melhorSeq: 0, tempos: [] };
    setFase("bloco");
  }, []);

  // ANUNCIA o comando, depois solta a queda (§ "mandar antes" + sempre visível)
  const novaRodada = useCallback(() => {
    if (doneRef.current || isTimeUp()) { encerrar(); return; }
    const step = STEPS[stepRef.current];
    const r = gerarRodada(step.etapa, step.n);
    roundRef.current = r;
    setRound(r);
    setChars([]); charsRef.current = [];
    setFb(null);
    setFase("comando");
    if (auditivo) falar(r);
    timers.current.push(setTimeout(() => iniciarQuedaRef.current(r), auditivo ? 1500 : 1150));
  }, [auditivo, falar, isTimeUp, encerrar]);

  const proxima = useCallback(() => {
    if (bloco.current.tentativas >= BLOCO) fecharBloco();
    else novaRodada();
  }, [fecharBloco, novaRodada]);
  proximaRef.current = proxima;

  const responder = useCallback((tocado: LiveChar) => {
    if (fase !== "jogando" || respondidoRef.current || doneRef.current) return;
    const r = roundRef.current; if (!r) return;
    respondidoRef.current = true;
    stopRaf();
    const rt = (Date.now() - rodadaAbertaEm.current) / 1000;
    const escolhido = charById(tocado.id)!;
    const acertou = matches(escolhido, r.criterio) && tocado.id === r.alvoId;
    registra(acertou, acertou ? rt : null, false);
    const msg = acertou
      ? (r.criterio.cor && (r.criterio.acessorios || r.criterio.objeto) ? "Acertou a cor e o acessório!" : "Correto!")
      : atributoFaltante(r.criterio, escolhido);
    setFb({ ok: acertou, msg, alvoUid: acertou ? null : charsRef.current.find((c) => c.id === r.alvoId)?.uid ?? null });
    setFase("feedback");
    timers.current.push(setTimeout(proximaRef.current, acertou ? 950 : 1450));
  }, [fase, registra]);

  // mede a arena e inicia a 1ª rodada só DEPOIS de medir
  useLayoutEffect(() => {
    const el = arenaRef.current;
    if (!el) return;
    const measure = () => { dims.current = { w: el.clientWidth, h: el.clientHeight }; };
    measure();
    if ((fase === "comando" || fase === "jogando") && !iniciouRef.current && !doneRef.current) {
      iniciouRef.current = true; novaRodada();
    }
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [fase, novaRodada]);

  // ── render ─────────────────────────────────────────────────────────────────
  if (fase === "instrucoes") {
    return <Tutorial onStart={() => { begin(); setFase("comando"); }} />;
  }
  if (fase === "bloco" && blocoRes) {
    return <ResultadoBloco r={blocoRes} onNext={() => { setBlocoRes(null); novaRodada(); }} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d2244 55%,#081020 100%)" }}>
      <div className="flex-shrink-0 px-3 pt-3 pb-2 space-y-2" style={{ zIndex: 50 }}>
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

        <AnimatePresence>{fase === "comando" && round && <AnuncioComando round={round} />}</AnimatePresence>

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
