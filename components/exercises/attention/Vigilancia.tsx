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
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";
import {
  tempoDoDegrau, gerarCentros, classificarToque, gerarSequenciaPosicoes,
  adaptar, estadoInicial, avaliarBloco, BLOCO_TENTATIVAS, POSICOES,
  type AdaptState, type Arranjo, type Tolerancia, type Ponto, type Classificacao,
} from "@/lib/vigilancia";
import { NIVEIS, parById, fundoById, imgPipa, imgFundo, TODAS_IMAGENS, type Par } from "@/lib/vigilancia-dados";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const nivelDe = (d: number) => Math.max(1, Math.min(NIVEIS.length, Math.round(d)));
const DEGRAU_CONFORTAVEL = 4; // 1100 ms

type Fase = "fixacao" | "exposicao" | "resposta" | "feedback";
interface Kite { pos: number; isAlvo: boolean }

export function Vigilancia({ difficulty, theme, onComplete }: Props) {
  const isG = theme === "GAMIFIED";
  const [stage, setStage] = useState<"tutorial" | "bloco" | "resultado">("tutorial");
  const [fase, setFase] = useState<Fase>("fixacao");
  const [tutStep, setTutStep] = useState(0);

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
  }, [stage, tentativa]);

  const posToXY = (pos: number): Ponto => centrosRef.current[pos] ?? { x: dims.w / 2, y: dims.h / 2 };

  // finaliza bloco (declarado antes de quem o usa)
  const finalizarBloco = useCallback(() => { clearTimers(); setStage("resultado"); }, []);

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
    const dur = correto ? 900 : 1800;
    timers.current.push(setTimeout(() => {
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
    setStage("bloco");
    iniciarTentativa();
  }, [iniciarTentativa]);

  const continuar = useCallback(() => {
    const { decisao } = avaliarBloco(bloco.current.acertos);
    if (decisao === "avancar" && nivelRef.current < NIVEIS.length) {
      nivelRef.current++;
      estadoRef.current = estadoInicial(DEGRAU_CONFORTAVEL);
    }
    iniciarBloco();
  }, [iniciarBloco]);

  const encerrar = useCallback(() => {
    clearTimers();
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
      },
    });
  }, [onComplete]);

  const bg = isG ? "bg-[#061326]" : "bg-slate-100";
  const txt = isG ? "text-white" : "text-slate-800";
  const sub = isG ? "text-white/60" : "text-slate-500";

  // ── Tutorial curto (mostra o alvo 1× · NÃO se repete no jogo) ────────────────
  if (stage === "tutorial") {
    const comum = imgPipa(par.A.arquivo);
    const dif = imgPipa(par.B.arquivo);
    const TELAS = [
      {
        t: "Vigilância",
        d: "Todas as pipas são iguais — menos UMA. Repare como a pipa diferente destoa do grupo.",
        node: (
          <div className="flex items-end justify-center gap-3 my-6">
            <div className="flex flex-col items-center gap-1 opacity-70">
              <img src={comum} alt="" style={{ width: 68, height: 102, objectFit: "contain" }} />
              <span className={`text-[11px] ${sub}`}>iguais</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-2xl p-1" style={{ boxShadow: "0 0 0 3px #22c55e" }}>
                <img src={dif} alt="pipa diferente" style={{ width: 84, height: 126, objectFit: "contain" }} />
              </div>
              <span className="text-[11px] font-bold text-green-600">diferente</span>
            </div>
          </div>
        ),
      },
      {
        t: "Como jogar",
        d: "As pipas aparecem por um instante e somem. Depois, clique na REGIÃO onde estava a pipa diferente — não precisa acertar em cima.",
        node: null,
      },
    ];
    const tela = TELAS[tutStep];
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="max-w-md mx-auto px-6 py-10 text-center">
          <h2 className={`text-2xl font-black ${txt}`}>{tela.t}</h2>
          {tela.node}
          <p className={`text-base mt-3 leading-relaxed ${sub}`}>{tela.d}</p>
          <div className="flex items-center justify-center gap-1.5 my-6">
            {TELAS.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === tutStep ? "w-6 bg-sky-500" : "w-2 " + (isG ? "bg-white/20" : "bg-slate-300")}`} />)}
          </div>
          <button onClick={() => tutStep < TELAS.length - 1 ? setTutStep(tutStep + 1) : iniciarBloco()}
            className="w-full h-12 rounded-full font-black text-white bg-sky-600 active:bg-sky-700">
            {tutStep < TELAS.length - 1 ? "Continuar" : "START"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "resultado") {
    const b = bloco.current;
    const prec = Math.round((b.acertos / BLOCO_TENTATIVAS) * 100);
    const medResp = b.temposResp.length ? Math.round(b.temposResp.slice().sort((a, z) => a - z)[Math.floor(b.temposResp.length / 2)]) : null;
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="max-w-sm mx-auto px-6 py-10 text-center w-full">
          <h2 className={`text-xl font-black ${txt}`}>Bloco concluído</h2>
          <div className={`rounded-2xl p-5 mt-5 space-y-1.5 ${isG ? "bg-white/5" : "bg-white border border-slate-200"}`}>
            <p className={txt}><b className="text-2xl">{b.acertos}</b> / {BLOCO_TENTATIVAS} acertos</p>
            <p className={sub}>Precisão: {prec}%</p>
            <p className={sub}>Nível visual: {nivelRef.current}</p>
            <p className={sub}>Exposição atual: {tempoDoDegrau(estadoRef.current.degrau)} ms</p>
            {medResp && <p className={sub}>Tempo de resposta (mediana): {(medResp / 1000).toFixed(1)} s</p>}
            <p className={sub}>Melhor sequência: {b.melhorSeq}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={encerrar} className={`flex-1 h-12 rounded-full font-bold border-2 ${isG ? "border-white/25 text-white/80" : "border-slate-300 text-slate-600"}`}>Encerrar sessão</button>
            <button onClick={continuar} className="flex-1 h-12 rounded-full font-bold text-white bg-sky-600 active:bg-sky-700">Continuar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── BLOCO em andamento ──────────────────────────────────────────────────────
  const alvoImg = imgPipa(par[alvoVarRef.current].arquivo);
  const distImg = imgPipa(par[alvoVarRef.current === "A" ? "B" : "A"].arquivo);
  const cx = dims.w / 2, cy = dims.h / 2;

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Barra superior mínima (§28): só nome, progresso e nível */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <span className={`font-black ${txt}`}>Vigilância</span>
        <span className={`text-xs font-semibold ${sub}`}>Rodada {tentativa}/{BLOCO_TENTATIVAS} · Nível {nivelRef.current}</span>
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
                <div className="absolute rounded-full" style={{ left: ct.x - kiteW * 0.6, top: ct.y - kiteH * 0.5, width: kiteW * 1.2, height: kiteH, border: "2px dashed rgba(239,68,68,0.7)", zIndex: 6 }} />
              ); })()}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold z-10"
                style={{ background: fb.correto ? "rgba(22,163,74,0.95)" : "rgba(30,41,59,0.95)", color: "#fff" }}>
                {fb.correto ? "Correto!" : "A pipa diferente estava aqui."}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
