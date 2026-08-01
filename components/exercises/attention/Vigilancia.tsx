"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Vigilância — "Encontre onde estava a pipa-alvo".
// 8 pipas (7 distratoras idênticas + 1 alvo), exposição breve e resposta por
// REGIÃO espacial (não precisa tocar em cima). Adaptativo por degraus, blocos de
// 12, EXECUÇÃO CONTÍNUA (sem pausa/reinício). Motor puro em lib/vigilancia.ts.
// Treino de velocidade de processamento e localização — NÃO é avaliação/diagnóstico.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import type { ExerciseResult, Theme } from "@/types";
import {
  EXPO_STEPS, tempoDoDegrau, gerarCentros, classificarToque, gerarSequenciaPosicoes,
  adaptar, estadoInicial, avaliarBloco, BLOCO_TENTATIVAS, POSICOES,
  type AdaptState, type Arranjo, type Tolerancia, type Ponto, type Classificacao,
} from "@/lib/vigilancia";
import { NIVEIS, parById, fundoById, imgPipa, imgFundo, TODAS_IMAGENS, type Par } from "@/lib/vigilancia-dados";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const nivelDe = (d: number) => Math.max(1, Math.min(NIVEIS.length, Math.round(d)));
const DEGRAU_CONFORTAVEL = 4; // 1100 ms

type Fase = "alvo" | "fixacao" | "exposicao" | "resposta" | "feedback";
interface Kite { pos: number; variante: "A" | "B"; isAlvo: boolean }

export function Vigilancia({ difficulty, theme, onComplete }: Props) {
  const isG = theme === "GAMIFIED";
  const [stage, setStage] = useState<"tutorial" | "pronto" | "bloco" | "resultado">("tutorial");
  const [fase, setFase] = useState<Fase>("alvo");
  const [tutStep, setTutStep] = useState(0);

  const nivelRef = useRef(nivelDe(difficulty / 1)); // 1..10
  const estadoRef = useRef<AdaptState>(estadoInicial(DEGRAU_CONFORTAVEL));
  const alvoVarRef = useRef<"A" | "B">("A");         // contrabalanceado por bloco
  const posSeqRef = useRef<number[]>([]);            // 12 posições contrabalanceadas
  const blocoNumRef = useRef(0);

  const nv = NIVEIS[nivelRef.current - 1];
  const parRef = useRef<Par>(parById(nv.pairId));
  const [par, setPar] = useState<Par>(parRef.current);
  const [fundoArq, setFundoArq] = useState(fundoById(nv.fundo).arquivo);
  const arranjoRef = useRef<Arranjo>(nv.arranjo);
  const tolRef = useRef<Tolerancia>("padrao");

  const [tentativa, setTentativa] = useState(1);
  const [kites, setKites] = useState<Kite[]>([]);
  const [fb, setFb] = useState<{ correto: boolean; corretaPos: number; tocadaPos: number; classe: Classificacao } | null>(null);

  // métricas do bloco
  const bloco = useRef({ acertos: 0, historico: [] as boolean[], temposResp: [] as number[], seq: 0, melhorSeq: 0 });
  const totalRef = useRef({ tentativas: 0, acertos: 0 });
  const sessionStart = useRef(Date.now());

  // arena / geometria
  const arenaRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 360 });
  const centrosRef = useRef<Ponto[]>([]);
  const kiteW = Math.max(58, Math.round(Math.min(dims.w, dims.h) * 0.12));
  const kiteH = Math.round(kiteW * 1.5);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const respondidoRef = useRef(false);
  const expoStart = useRef(0);
  const respStart = useRef(0);
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  // pré-carrega TODAS as imagens antes de começar (§35)
  useEffect(() => { TODAS_IMAGENS.forEach((src) => { const im = new Image(); im.src = src; }); }, []);

  // mede a arena e recalcula os centros
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

  // ── Fluxo de uma tentativa ──────────────────────────────────────────────────
  const iniciarTentativa = useCallback(() => {
    setFb(null); setKites([]); respondidoRef.current = false;
    setFase("alvo");
  }, []);

  const aoPronto = useCallback(() => {
    setFase("fixacao");
    timers.current.push(setTimeout(() => {
      // monta as 8 pipas: alvo na posição da sequência; distratoras na outra variante
      const idx = tentativa - 1;
      const alvoPos = posSeqRef.current[idx] ?? 0;
      const alvoVar = alvoVarRef.current;
      const distVar = alvoVar === "A" ? "B" : "A";
      const arr: Kite[] = POSICOES.map((_, pos) => ({ pos, variante: pos === alvoPos ? alvoVar : distVar, isAlvo: pos === alvoPos }));
      setKites(arr);
      setFase("exposicao");
      expoStart.current = performance.now();
      const ms = tempoDoDegrau(estadoRef.current.degrau);
      timers.current.push(setTimeout(() => {
        setKites([]);          // §4 desaparecem SIMULTANEAMENTE
        setFase("resposta");
        respStart.current = performance.now();
      }, ms));
    }, rnd(500, 800)));        // §9 fixação com intervalo variável
  }, [tentativa]);

  const registrarEavancar = useCallback((correto: boolean, corretaPos: number, tocadaPos: number, classe: Classificacao) => {
    const b = bloco.current;
    b.historico.push(correto);
    if (correto) { b.acertos++; b.seq++; b.melhorSeq = Math.max(b.melhorSeq, b.seq); b.temposResp.push(performance.now() - respStart.current); }
    else { b.seq = 0; }
    totalRef.current.tentativas++; if (correto) totalRef.current.acertos++;
    // adapta (motor)
    const { estado } = adaptar(estadoRef.current, correto);
    estadoRef.current = estado;

    setFb({ correto, corretaPos, tocadaPos, classe });
    setFase("feedback");
    const dur = correto ? 900 : 1900; // erro reapresenta o alvo ~1s a mais
    timers.current.push(setTimeout(() => {
      if (tentativa >= BLOCO_TENTATIVAS) { finalizarBloco(); return; }
      setTentativa((t) => t + 1);
      iniciarTentativa();
    }, dur));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa, iniciarTentativa]);

  const aoTocar = useCallback((e: React.PointerEvent) => {
    if (fase !== "resposta" || respondidoRef.current) return;
    respondidoRef.current = true;
    const el = arenaRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const toque: Ponto = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const idx = tentativa - 1;
    const corretaPos = posSeqRef.current[idx] ?? 0;
    const r = classificarToque(toque, centrosRef.current, corretaPos, arranjoRef.current, dims.w, dims.h, tolRef.current);
    registrarEavancar(r.correto, corretaPos, r.selecionada, r.classificacao);
  }, [fase, tentativa, dims, registrarEavancar]);

  // ── Início / fim de bloco ───────────────────────────────────────────────────
  const iniciarBloco = useCallback(() => {
    blocoNumRef.current++;
    alvoVarRef.current = blocoNumRef.current % 2 === 1 ? "A" : "B"; // alterna a variante-alvo (§7)
    posSeqRef.current = gerarSequenciaPosicoes(BLOCO_TENTATIVAS, shuffle);
    bloco.current = { acertos: 0, historico: [], temposResp: [], seq: 0, melhorSeq: 0 };
    const nvv = NIVEIS[nivelRef.current - 1];
    parRef.current = parById(nvv.pairId); setPar(parRef.current);
    arranjoRef.current = nvv.arranjo; setFundoArq(fundoById(nvv.fundo).arquivo);
    setTentativa(1);
    setStage("bloco");
    iniciarTentativa();
  }, [iniciarTentativa]);

  const finalizarBloco = useCallback(() => { clearTimers(); setStage("resultado"); }, []);

  const continuar = useCallback(() => {
    // avança de nível se o bloco foi muito bom (§20/§22), senão mantém
    const { decisao } = avaliarBloco(bloco.current.acertos);
    if (decisao === "avancar" && nivelRef.current < NIVEIS.length) {
      nivelRef.current++;
      estadoRef.current = estadoInicial(DEGRAU_CONFORTAVEL); // condição confortável no novo nível (§22)
    }
    iniciarBloco();
  }, [iniciarBloco]);

  const encerrar = useCallback(() => {
    clearTimers();
    const t = totalRef.current;
    const acc = t.tentativas ? t.acertos / t.tentativas : 0;
    const temposMed = bloco.current.temposResp;
    const medResp = temposMed.length ? temposMed.slice().sort((a, b) => a - b)[Math.floor(temposMed.length / 2)] : undefined;
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

  // ── Estilos ─────────────────────────────────────────────────────────────────
  const bg = isG ? "bg-[#061326]" : "bg-slate-100";
  const txt = isG ? "text-white" : "text-slate-800";
  const sub = isG ? "text-white/60" : "text-slate-500";

  // ── Tutorial (§29) ──────────────────────────────────────────────────────────
  if (stage === "tutorial") {
    const alvoImg = imgPipa(par.A.arquivo);
    const TELAS = [
      { t: "Vigilância", d: "Você verá oito pipas. Uma delas será a pipa-alvo.", img: false },
      { t: "Observe a pipa-alvo", d: "Guarde bem esta pipa — é a que você vai procurar.", img: true },
      { t: "Fique pronto", d: "Toque em “Estou pronto” e mantenha o olhar no centro.", img: false },
      { t: "Atenção!", d: "As pipas aparecem rapidamente e depois desaparecem.", img: false },
      { t: "Onde estava?", d: "Toque na REGIÃO onde estava a pipa-alvo. Você não precisa tocar exatamente em cima dela.", img: false },
    ];
    const tela = TELAS[tutStep];
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="max-w-md mx-auto px-6 py-10 text-center">
          <h2 className={`text-2xl font-black ${txt}`}>{tela.t}</h2>
          {tela.img && <img src={alvoImg} alt="pipa-alvo" className="mx-auto my-5" style={{ width: 120, height: 180, objectFit: "contain" }} />}
          <p className={`text-base mt-3 leading-relaxed ${sub}`}>{tela.d}</p>
          <div className="flex items-center justify-center gap-1.5 my-6">
            {TELAS.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === tutStep ? "w-6 bg-sky-500" : "w-2 " + (isG ? "bg-white/20" : "bg-slate-300")}`} />)}
          </div>
          <button onClick={() => tutStep < TELAS.length - 1 ? setTutStep(tutStep + 1) : setStage("pronto")}
            className="w-full h-12 rounded-full font-bold text-white bg-sky-600 active:bg-sky-700">
            {tutStep < TELAS.length - 1 ? "Continuar" : "Entendi"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "pronto") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="max-w-md mx-auto px-6 text-center">
          <h2 className={`text-xl font-black ${txt}`}>Vigilância</h2>
          <p className={`text-sm mt-1 mb-6 ${sub}`}>Encontre onde estava a pipa-alvo</p>
          <p className={`text-sm mb-8 ${sub}`}>Serão 12 rodadas seguidas. Você controla o início de cada uma.</p>
          <button onClick={iniciarBloco} className="w-full h-12 rounded-full font-bold text-white bg-sky-600 active:bg-sky-700">Iniciar bloco</button>
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

  // ── BLOCO em andamento (execução contínua — SEM controles) ──────────────────
  const alvoImg = imgPipa(par[alvoVarRef.current].arquivo);
  const distImg = imgPipa(par[alvoVarRef.current === "A" ? "B" : "A"].arquivo);

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Barra superior mínima (§28): só nome, progresso e nível */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <span className={`font-black ${txt}`}>Vigilância</span>
        <span className={`text-xs font-semibold ${sub}`}>Rodada {tentativa}/{BLOCO_TENTATIVAS} · Nível {nivelRef.current}</span>
      </div>

      {/* Arena */}
      <div ref={arenaRef} onPointerDown={aoTocar}
        className="relative flex-1 mx-3 mb-3 rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${imgFundo(fundoArq)})`, backgroundSize: "cover", backgroundPosition: "center", cursor: fase === "resposta" ? "pointer" : "default", touchAction: "none" }}>

        {/* ponto de fixação central */}
        {(fase === "fixacao" || fase === "exposicao" || fase === "resposta") && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 14, height: 14, background: fase === "resposta" ? "rgba(255,255,255,0.5)" : "#1e293b", border: "2px solid white", zIndex: 5 }} />
        )}

        {/* pipas na exposição */}
        {fase === "exposicao" && kites.map((k) => {
          const c = posToXY(k.pos);
          return <img key={k.pos} src={k.isAlvo ? alvoImg : distImg} alt="" draggable={false}
            style={{ position: "absolute", left: c.x - kiteW / 2, top: c.y - kiteH / 2, width: kiteW, height: kiteH, objectFit: "contain", zIndex: 3 }} />;
        })}

        {/* alvo ampliado (fase "alvo") + botão Estou pronto */}
        <AnimatePresence>
          {fase === "alvo" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20"
              style={{ background: isG ? "rgba(6,19,38,0.75)" : "rgba(241,245,249,0.82)" }}>
              <p className={`font-bold ${txt}`}>Procure esta pipa</p>
              <img src={alvoImg} alt="pipa-alvo" style={{ width: 96, height: 144, objectFit: "contain" }} draggable={false} />
              <button onClick={aoPronto} className="h-12 px-8 rounded-full font-bold text-white bg-sky-600 active:bg-sky-700">Estou pronto</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* prompt de resposta */}
        {fase === "resposta" && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold z-10"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>Onde estava a pipa-alvo?</div>
        )}

        {/* feedback: destaca a região correta (e a tocada); reapresenta o alvo se errou */}
        {fase === "feedback" && fb && (() => {
          const cCorr = posToXY(fb.corretaPos);
          return (
            <>
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute rounded-full" style={{
                  left: cCorr.x - kiteW * 0.75, top: cCorr.y - kiteH * 0.6, width: kiteW * 1.5, height: kiteH * 1.2,
                  border: "3px solid #22c55e", background: "rgba(34,197,94,0.12)", zIndex: 6,
                }} />
              {!fb.correto && <img src={alvoImg} alt="" draggable={false}
                style={{ position: "absolute", left: cCorr.x - kiteW / 2, top: cCorr.y - kiteH / 2, width: kiteW, height: kiteH, objectFit: "contain", zIndex: 7 }} />}
              {!fb.correto && fb.tocadaPos !== fb.corretaPos && (() => { const ct = posToXY(fb.tocadaPos); return (
                <div className="absolute rounded-full" style={{ left: ct.x - kiteW * 0.6, top: ct.y - kiteH * 0.5, width: kiteW * 1.2, height: kiteH, border: "2px dashed rgba(239,68,68,0.7)", zIndex: 6 }} />
              ); })()}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold z-10"
                style={{ background: fb.correto ? "rgba(22,163,74,0.95)" : "rgba(30,41,59,0.95)", color: "#fff" }}>
                {fb.correto ? "Correto!" : "A pipa-alvo estava aqui."}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
