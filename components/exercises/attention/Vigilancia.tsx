"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Vigilância — "Encontre onde estava a pipa diferente".
// 8 pipas (7 idênticas + 1 diferente) piscam juntas; o paciente clica na REGIÃO
// onde estava a diferente. O modelo NÃO é reapresentado a cada rodada — ele deve
// PERCEBER sozinho qual destoa (discriminação). Só o tutorial mostra o alvo 1×.
// Fluxo contínuo (bloco de 12, sem pausa). Motor puro em lib/vigilancia.ts.
// Treino de velocidade de processamento e localização — NÃO é avaliação.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";
import {
  tempoDoDegrau, gerarCentros, classificarToque, gerarSequenciaPosicoes,
  adaptar, estadoInicial, avaliarBloco, BLOCO_TENTATIVAS, POSICOES,
  DEGRAU_CONFORTAVEL,
  type AdaptState, type Arranjo, type Tolerancia, type Ponto, type Classificacao,
} from "@/lib/vigilancia";
import { NIVEIS, parById, fundoById, imgPipa, imgFundo, TODAS_IMAGENS, type Par } from "@/lib/vigilancia-dados";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const nivelDe = (d: number) => Math.max(1, Math.min(NIVEIS.length, Math.round(d)));
type Fase = "fixacao" | "exposicao" | "resposta" | "feedback";
interface Kite { pos: number; isAlvo: boolean }

export function Vigilancia({ difficulty, theme, onComplete }: Props) {
  const isG = theme === "GAMIFIED";
  // Sessão por TEMPO (~8 min), como Estacionamento e Torre — não por nº de blocos.
  const { begin, finish: finishTimer, progressPct } = useTimedProgress(8 * 60 * 1000);
  const tempoAcabouRef = useRef(false);
  const [fase, setFase] = useState<Fase>("fixacao");

  const nivelRef = useRef(nivelDe(difficulty));
  const estadoRef = useRef<AdaptState>(estadoInicial(DEGRAU_CONFORTAVEL));
  const alvoVarRef = useRef<"A" | "B">("A");
  const posSeqRef = useRef<number[]>([]);
  const blocoNumRef = useRef(0);

  const nv0 = NIVEIS[nivelRef.current - 1];
  const [par, setPar] = useState<Par>(parById(nv0.pairId));
  const [fundoArq, setFundoArq] = useState(fundoById(nv0.fundo).arquivo);
  const arranjoRef = useRef<Arranjo>(nv0.arranjo);
  const tolRef = useRef<Tolerancia>("padrao");

  const tentativaRef = useRef(1);
  const [tentativa, setTentativa] = useState(1);
  const [kites, setKites] = useState<Kite[]>([]);
  const [fb, setFb] = useState<{ correto: boolean; corretaPos: number; tocadaPos: number; classe: Classificacao } | null>(null);
  const [cursor, setCursor] = useState<Ponto | null>(null); // linha-guia na resposta

  const bloco = useRef({ acertos: 0, historico: [] as boolean[], temposResp: [] as number[], seq: 0, melhorSeq: 0 });
  const totalRef = useRef({ tentativas: 0, acertos: 0 });
  const sessionStart = useRef(Date.now());

  const arenaRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 360 });
  const centrosRef = useRef<Ponto[]>([]);
  const kiteW = Math.max(56, Math.round(Math.min(dims.w, dims.h) * 0.13));
  const kiteH = Math.round(kiteW * 1.5);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const respondidoRef = useRef(false);
  const expoStart = useRef(0);
  const respStart = useRef(0);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);
  useEffect(() => { TODAS_IMAGENS.forEach((src) => { const im = new Image(); im.src = src; }); }, []);

  useLayoutEffect(() => {
    const el = arenaRef.current; if (!el) return;
    const medir = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setDims({ w, h });
      const jitter = (i: number) => ({ dr: (i % 2 ? 0.12 : -0.08), da: (i % 3 - 1) * 6 });
      centrosRef.current = gerarCentros(arranjoRef.current, w, h, jitter);
    };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => ro.disconnect();
  }, [tentativa]);

  useEffect(() => { tempoAcabouRef.current = progressPct >= 100; }, [progressPct]);

  const posToXY = (pos: number): Ponto => centrosRef.current[pos] ?? { x: dims.w / 2, y: dims.h / 2 };

  // Fim de bloco SILENCIOSO (§ princípio dela: nada de tela de "resultado do bloco" no meio):
  // avalia, sobe de nível quando merece e emenda o bloco seguinte. Quem encerra é o TEMPO.
  const proximoBlocoRef = useRef<() => void>(() => {});
  const encerrarRef = useRef<() => void>(() => {});
  const finalizarBloco = useCallback(() => {
    clearTimers();
    if (tempoAcabouRef.current) { encerrarRef.current(); return; }
    const { decisao } = avaliarBloco(bloco.current.acertos);
    if (decisao === "avancar" && nivelRef.current < NIVEIS.length) {
      nivelRef.current++;
      estadoRef.current = estadoInicial(DEGRAU_CONFORTAVEL);
    }
    proximoBlocoRef.current();
  }, []);

  // ── Uma tentativa: fixação → exposição → resposta (SEM reapresentar o alvo) ──
  const iniciarTentativa = useCallback(() => {
    setFb(null); setKites([]); setCursor(null); respondidoRef.current = false;
    setFase("fixacao");
    timers.current.push(setTimeout(() => {
      const idx = tentativaRef.current - 1;
      const alvoPos = posSeqRef.current[idx] ?? 0;
      const arr: Kite[] = POSICOES.map((_, pos) => ({ pos, isAlvo: pos === alvoPos }));
      setKites(arr);
      setFase("exposicao");
      expoStart.current = performance.now();
      const ms = tempoDoDegrau(estadoRef.current.degrau);
      timers.current.push(setTimeout(() => {
        setKites([]); setFase("resposta"); respStart.current = performance.now();
      }, ms));
    }, rnd(600, 900)));
  }, []);

  const registrarEavancar = useCallback((correto: boolean, corretaPos: number, tocadaPos: number, classe: Classificacao) => {
    const b = bloco.current;
    b.historico.push(correto);
    if (correto) { b.acertos++; b.seq++; b.melhorSeq = Math.max(b.melhorSeq, b.seq); b.temposResp.push(performance.now() - respStart.current); }
    else { b.seq = 0; }
    totalRef.current.tentativas++; if (correto) totalRef.current.acertos++;
    estadoRef.current = adaptar(estadoRef.current, correto).estado;

    setFb({ correto, corretaPos, tocadaPos, classe });
    setFase("feedback");
    const dur = correto ? 900 : 2600;  // erro: tempo de OLHAR onde estava a certa
    timers.current.push(setTimeout(() => {
      if (tempoAcabouRef.current) { encerrarRef.current(); return; }
      if (tentativaRef.current >= BLOCO_TENTATIVAS) { finalizarBloco(); return; }
      tentativaRef.current += 1; setTentativa(tentativaRef.current);
      iniciarTentativa();
    }, dur));
  }, [finalizarBloco, iniciarTentativa]);

  const aoTocar = useCallback((e: React.PointerEvent) => {
    if (fase !== "resposta" || respondidoRef.current) return;
    respondidoRef.current = true;
    const el = arenaRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const toque: Ponto = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const corretaPos = posSeqRef.current[tentativaRef.current - 1] ?? 0;
    const r = classificarToque(toque, centrosRef.current, corretaPos, arranjoRef.current, dims.w, dims.h, tolRef.current);
    registrarEavancar(r.correto, corretaPos, r.selecionada, r.classificacao);
  }, [fase, dims, registrarEavancar]);

  const aoMover = useCallback((e: React.PointerEvent) => {
    if (fase !== "resposta") return;
    const el = arenaRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [fase]);

  const iniciarBloco = useCallback(() => {
    blocoNumRef.current++;
    alvoVarRef.current = blocoNumRef.current % 2 === 1 ? "A" : "B";
    posSeqRef.current = gerarSequenciaPosicoes(BLOCO_TENTATIVAS, shuffle);
    bloco.current = { acertos: 0, historico: [], temposResp: [], seq: 0, melhorSeq: 0 };
    const nvv = NIVEIS[nivelRef.current - 1];
    setPar(parById(nvv.pairId));
    arranjoRef.current = nvv.arranjo; setFundoArq(fundoById(nvv.fundo).arquivo);
    tentativaRef.current = 1; setTentativa(1);
    begin();                       // cronômetro da sessão (só conta com o paciente ativo)
    iniciarTentativa();
  }, [iniciarTentativa, begin]);

  useEffect(() => {
    iniciarBloco();
    return () => {
      clearTimers();
      blocoNumRef.current = 0;
    };
  }, [iniciarBloco]);

  useEffect(() => { proximoBlocoRef.current = iniciarBloco; }, [iniciarBloco]);

  const encerrar = useCallback(() => {
    clearTimers();
    finishTimer();
    const t = totalRef.current;
    const acc = t.tentativas ? t.acertos / t.tentativas : 0;
    const tr = bloco.current.temposResp;
    const medResp = tr.length ? tr.slice().sort((a, z) => a - z)[Math.floor(tr.length / 2)] : undefined;
    onComplete({
      exerciseId: "vigilancia", domain: "attention",
      score: calculateExerciseScore("vigilancia", acc, medResp, nivelRef.current),
      accuracy: acc, difficulty: nivelRef.current, duration: Math.round((Date.now() - sessionStart.current) / 1000),
      metadata: {
        blocos: blocoNumRef.current, tentativas: t.tentativas, acertos: t.acertos,
        nivelVisual: nivelRef.current, degrauFinal: estadoRef.current.degrau,
        tempoExposicaoMs: tempoDoDegrau(estadoRef.current.degrau), melhorSequencia: bloco.current.melhorSeq,
        sessaoPorTempo: true, alvoMin: 8,
      },
    });
  }, [onComplete, finishTimer]);

  useEffect(() => { encerrarRef.current = encerrar; }, [encerrar]);
  // o tempo acabou entre tentativas (nenhum timer pendente): encerra assim que a barra enche
  // NÃO encerrar no meio de uma tentativa: o corte acontece sempre DEPOIS do feedback
  // (senão a barra encheria enquanto o paciente ainda está decidindo onde clicar).

  const bg = isG ? "bg-[#061326]" : "bg-slate-100";
  const txt = isG ? "text-white" : "text-slate-800";
  const sub = isG ? "text-white/60" : "text-slate-500";

  // ── BLOCO em andamento ──────────────────────────────────────────────────────
  const alvoImg = imgPipa(par[alvoVarRef.current].arquivo);
  const distImg = imgPipa(par[alvoVarRef.current === "A" ? "B" : "A"].arquivo);
  const cx = dims.w / 2, cy = dims.h / 2;

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Barra superior mínima (§28): nome, nível e a LINHA DE PROGRESSÃO por tempo */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`font-black ${txt}`}>Vigilância</span>
          <span className={`text-xs font-semibold ${sub}`}>Nível {nivelRef.current}</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isG ? "bg-white/10" : "bg-slate-300"}`}>
          <div className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min(100, progressPct)}%`, background: isG ? "#22d3ee" : "#0284c7" }} />
        </div>
      </div>

      <div ref={arenaRef} onPointerDown={aoTocar} onPointerMove={aoMover}
        className="relative flex-1 mx-3 mb-3 rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${imgFundo(fundoArq)})`, backgroundSize: "cover", backgroundPosition: "center", cursor: fase === "resposta" ? "crosshair" : "default", touchAction: "none" }}>

        {/* ponto de fixação */}
        {(fase === "fixacao" || fase === "exposicao") && (
          <div className="absolute rounded-full" style={{ left: cx - 7, top: cy - 7, width: 14, height: 14, background: "#1e293b", border: "2px solid white", zIndex: 5 }} />
        )}

        {/* pipas na exposição (7 iguais + 1 diferente = alvo) */}
        {fase === "exposicao" && kites.map((k) => {
          const c = posToXY(k.pos);
          return <img key={k.pos} src={k.isAlvo ? alvoImg : distImg} alt="" draggable={false}
            style={{ position: "absolute", left: c.x - kiteW / 2, top: c.y - kiteH / 2, width: kiteW, height: kiteH, objectFit: "contain", zIndex: 3 }} />;
        })}

        {/* resposta: prompt + linha-guia do cursor (a "luz") */}
        {fase === "resposta" && (
          <>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold z-10"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>Onde estava a pipa diferente?</div>
            {cursor && (
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 8 }} width={dims.w} height={dims.h}>
                <line x1={cx} y1={cy} x2={cursor.x} y2={cursor.y} stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                <circle cx={cursor.x} cy={cursor.y} r={9} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
              </svg>
            )}
          </>
        )}

        {/* feedback: destaca a região correta e reapresenta a pipa diferente na posição */}
        {fase === "feedback" && fb && (() => {
          const cCorr = posToXY(fb.corretaPos);
          return (
            <>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute rounded-full" style={{
                  left: cCorr.x - kiteW * 0.8, top: cCorr.y - kiteH * 0.6, width: kiteW * 1.6, height: kiteH * 1.2,
                  border: "3px solid #22c55e", background: "rgba(34,197,94,0.12)", zIndex: 6,
                }} />
              <img src={alvoImg} alt="" draggable={false}
                style={{ position: "absolute", left: cCorr.x - kiteW / 2, top: cCorr.y - kiteH / 2, width: kiteW, height: kiteH, objectFit: "contain", zIndex: 7 }} />
              {!fb.correto && fb.tocadaPos !== fb.corretaPos && (() => { const ct = posToXY(fb.tocadaPos); return (
                <>
                  <div className="absolute rounded-full" style={{ left: ct.x - kiteW * 0.6, top: ct.y - kiteH * 0.5, width: kiteW * 1.2, height: kiteH, border: "2px dashed rgba(239,68,68,0.7)", zIndex: 6 }} />
                  {/* liga o que ele escolheu ao lugar certo — mostra a distância do erro */}
                  <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }} width={dims.w} height={dims.h}>
                    <line x1={ct.x} y1={ct.y} x2={cCorr.x} y2={cCorr.y} stroke="rgba(255,255,255,0.75)" strokeWidth={2} strokeDasharray="6 5" />
                  </svg>
                </>
              ); })()}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold z-10"
                style={{ background: fb.correto ? "rgba(22,163,74,0.95)" : "rgba(30,41,59,0.95)", color: "#fff" }}>
                {fb.correto ? "Correto!" : "A pipa diferente estava AQUI 👆"}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
