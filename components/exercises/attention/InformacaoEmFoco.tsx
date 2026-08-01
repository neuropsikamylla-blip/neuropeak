"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Informação em Foco — "Leia, confira e escolha".
// Unifica Caça Informação + Mudança de Regras: uma única mecânica (tocar no
// cartão), 4 níveis (localizar → comparar → duas condições → situações
// funcionais), feedback que ENSINA onde achar a informação, pistas e 2 tentativas.
// Treino de atenção e leitura funcional — NÃO é avaliação/diagnóstico.
// Motor puro e testado em lib/informacao-foco.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Lightbulb, Check, X, Volume2 } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { playTTS, cancelTTS } from "@/lib/tts";
import type { ExerciseResult, Theme } from "@/types";
import {
  gerarQuestao, valorCampo, labelCampo, marcaDe,
  type Questao, type Nivel, type Produto, type CampoKey,
} from "@/lib/informacao-foco";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const NIVEL_LABEL: Record<Nivel, string> = { 1: "Localizar", 2: "Comparar", 3: "Duas condições", 4: "Situação real" };
const nivelInicialDe = (d: number): Nivel => Math.max(1, Math.min(4, Math.round(d / 2.5))) as Nivel;

function styles(theme: Theme) {
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  return {
    isG,
    bg: isG ? "bg-[#061326]" : isC ? "bg-gradient-to-br from-violet-50 to-sky-50" : "bg-slate-50",
    title: isG ? "text-white" : "text-slate-900",
    sub: isG ? "text-white/60" : "text-slate-500",
    card: isG ? "bg-[#0D2547] border-white/10" : "bg-white border-slate-200",
    cardTxt: isG ? "text-white" : "text-slate-800",
    prompt: isG ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800",
    btn: isG ? "bg-cyan-600 active:bg-cyan-500 text-white" : "bg-blue-600 active:bg-blue-700 text-white",
    ghost: isG ? "border-white/20 text-white/70" : "border-slate-300 text-slate-600",
  };
}

// ── Glifo do produto: imagem real (card branco) com fallback para o emoji ────
function ProdGlifo({ img, emoji, size }: { img?: string; emoji: string; size: number }) {
  const [erro, setErro] = useState(false);
  if (img && !erro) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt="" draggable={false} loading="lazy" onError={() => setErro(true)}
      style={{ width: size, height: size, objectFit: "contain", objectPosition: "center", display: "block" }} />;
  }
  return <span style={{ fontSize: Math.round(size * 0.8), lineHeight: 1 }}>{emoji}</span>;
}

// ── Cartão de produto (clicável inteiro) ─────────────────────────────────────
function ProductCard({ p, campos, destaque, estado, onTap, disabled, theme }: {
  p: Produto; campos: CampoKey[]; destaque: CampoKey[];
  estado: "idle" | "selerr" | "correta"; onTap: () => void; disabled: boolean; theme: Theme;
}) {
  const s = styles(theme);
  const isG = s.isG;
  const marca = marcaDe(p.nome);
  const ring = estado === "correta" ? "border-green-500 ring-2 ring-green-400"
    : estado === "selerr" ? "border-red-500 ring-2 ring-red-400" : s.card;
  const linha = isG ? "border-white/10" : "border-slate-100";
  return (
    <button onClick={onTap} disabled={disabled} aria-label={`${p.nome}${marca ? " " + marca : ""}. ${campos.map((c) => `${labelCampo(c)}: ${valorCampo(p, c)}`).join(". ")}`}
      className={`relative text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.98] disabled:cursor-default ${ring} ${s.cardTxt}`}>
      {/* imagem + nome + marca */}
      <div className="flex flex-col items-center gap-0.5 mb-3">
        <div className="h-[92px] flex items-end justify-center"><ProdGlifo img={p.img} emoji={p.emoji} size={88} /></div>
        <span className="font-bold text-[15px] text-center leading-tight mt-1.5">{p.nome}</span>
        {marca && <span className={`text-xs ${s.sub}`}>{marca}</span>}
      </div>
      {/* campos em linhas com divisória — valores NEUTROS (a cor não entrega a resposta) */}
      <div>
        {campos.map((c) => {
          const on = destaque.includes(c); // só destaca DEPOIS de revelar (feedback), nunca antes
          return (
            <div key={c} className={`flex items-baseline justify-between gap-2 py-2 border-t ${linha} ${on ? (isG ? "bg-green-400/10" : "bg-green-50") : ""} ${on ? "-mx-1 px-1 rounded" : ""}`}>
              <span className={`text-xs ${s.sub}`}>{labelCampo(c)}</span>
              <span className={`text-[13px] font-bold tabular-nums text-right ${on ? (isG ? "text-green-300" : "text-green-700") : ""}`}>
                {valorCampo(p, c)}
              </span>
            </div>
          );
        })}
      </div>
      {estado === "correta" && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center"><Check size={18} strokeWidth={3} /></span>}
      {estado === "selerr" && <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={18} strokeWidth={3} /></span>}
    </button>
  );
}

// ── Tutorial: estratégia PARE → LEIA → PROCURE → CONFIRA → RESPONDA ───────────
const PASSOS = [
  { k: "PARE", d: "Não responda com pressa." },
  { k: "LEIA", d: "Leia toda a pergunta." },
  { k: "PROCURE", d: "Encontre a informação pedida." },
  { k: "CONFIRA", d: "Veja se o produto atende ao pedido." },
  { k: "RESPONDA", d: "Toque no produto correto." },
];
function Tutorial({ theme, onStart }: { theme: Theme; onStart: () => void }) {
  const s = styles(theme);
  return (
    <div className={`min-h-screen overflow-y-auto ${s.bg}`}>
      <div className="max-w-[760px] mx-auto px-4 py-8">
        <h2 className={`text-2xl font-black text-center ${s.title}`}>Como jogar: Informação em Foco</h2>
        <p className={`text-center text-sm mt-1 mb-5 ${s.sub}`}>Leia, confira e escolha.</p>
        <div className={`rounded-2xl border p-4 mb-5 ${s.card}`}>
          <p className={`text-sm leading-relaxed ${s.cardTxt}`}>
            Em cada rodada, leia a pergunta e observe as informações dos produtos — preço, quantidade,
            validade, ingredientes ou conservação. <b>Confira antes de escolher.</b>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
          {PASSOS.map((p, i) => (
            <div key={p.k} className={`rounded-xl border p-3 text-center ${s.card}`}>
              <div className={`text-[11px] font-black ${s.sub}`}>{i + 1}</div>
              <div className={`font-black text-sm ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-600"}`}>{p.k}</div>
              <div className={`text-[11px] mt-1 ${s.sub}`}>{p.d}</div>
            </div>
          ))}
        </div>
        <p className={`text-sm font-semibold mb-2 ${s.title}`}>Exemplo — Qual produto tem o menor preço?</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[["🍌", "Banana", "R$ 3,90", true], ["🍎", "Maçã", "R$ 6,90", false], ["🍇", "Uva", "R$ 8,90", false]].map(([e, n, pr, ok]) => (
            <div key={n as string} className={`rounded-xl border-2 p-3 text-center ${ok ? "border-green-500 ring-2 ring-green-400" : s.card} ${s.cardTxt}`}>
              <div style={{ fontSize: 34 }}>{e as string}</div>
              <div className="text-xs font-bold">{n as string}</div>
              <div className="text-sm font-black mt-1">{pr as string}</div>
              {ok && <div className="text-[11px] text-green-600 font-bold mt-1">✓ menor preço</div>}
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3 mb-6" style={{ background: theme === "GAMIFIED" ? "rgba(16,185,129,.12)" : "#ecfdf5", border: "1.5px solid rgba(16,185,129,.4)" }}>
          <p className="text-sm text-emerald-700 font-medium">Correto. A banana custa R$ 3,90, o menor preço entre as opções.</p>
        </div>
        <button onClick={onStart} className={`w-full h-12 rounded-full font-bold ${s.btn}`}>Começar exercício</button>
      </div>
    </div>
  );
}

export function InformacaoEmFoco({ difficulty, theme, onComplete }: Props) {
  const s = styles(theme);
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(6 * 60 * 1000); // sessão por TEMPO (~6 min)

  const [fase, setFase] = useState<"tutorial" | "play" | "fim">("tutorial");
  const nivelRef = useRef<Nivel>(nivelInicialDe(difficulty));
  const [qNum, setQNum] = useState(1);
  const [questao, setQuestao] = useState<Questao | null>(null);
  const [tentativas, setTentativas] = useState(0);
  const [selecao, setSelecao] = useState<number | null>(null);   // último cartão tocado
  const [revelou, setRevelou] = useState(false);                 // mostra a correta
  const [fb, setFb] = useState<{ ok: boolean; texto: string; pista?: boolean } | null>(null);
  const [ajuda, setAjuda] = useState(false);

  const resultados = useRef<{ acertou: boolean; primeira: boolean; usouPista: boolean }[]>([]);
  const acertosSeguidos = useRef(0);
  const errosSeguidos = useRef(0);
  const qAbertaEm = useRef(0);
  const usouPistaRef = useRef(false);

  const novaQuestao = useCallback((primeira = false) => {
    const q = gerarQuestao(nivelRef.current);
    setQuestao(q);
    setTentativas(0); setSelecao(null); setRevelou(false); setFb(null); setAjuda(false);
    usouPistaRef.current = false;
    qAbertaEm.current = Date.now();
    if (!primeira) setQNum((n) => n + 1);
  }, []);

  const iniciar = () => { begin(); novaQuestao(true); setFase("play"); };

  const encerrar = useCallback(() => {
    finish();
    const rs = resultados.current;
    const acertos = rs.filter((r) => r.acertou).length;
    const primeira = rs.filter((r) => r.primeira).length;
    const pistas = rs.filter((r) => r.usouPista).length;
    const acc = rs.length ? acertos / rs.length : 0;
    const accPrimeira = rs.length ? primeira / rs.length : 0;
    setFase("fim");
    onComplete({
      exerciseId: "informacao-em-foco", domain: "attention",
      score: calculateExerciseScore("informacao-em-foco", accPrimeira, undefined, nivelRef.current),
      accuracy: acc, difficulty: nivelRef.current, duration: elapsedSec(),
      metadata: {
        questoes: rs.length, acertos, acertosPrimeira: primeira, pistasUsadas: pistas,
        nivelFinal: nivelRef.current, accuracyPrimeira: Number(accPrimeira.toFixed(3)),
      },
    });
  }, [finish, elapsedSec, onComplete]);

  const proxima = useCallback(() => {
    if (isTimeUp()) { encerrar(); return; }
    // adaptativo: 3 acertos de 1ª sobe; 2 erros seguidos desce (spec §21)
    if (acertosSeguidos.current >= 3 && nivelRef.current < 4) { nivelRef.current = (nivelRef.current + 1) as Nivel; acertosSeguidos.current = 0; }
    else if (errosSeguidos.current >= 2 && nivelRef.current > 1) { nivelRef.current = (nivelRef.current - 1) as Nivel; errosSeguidos.current = 0; }
    novaQuestao();
  }, [isTimeUp, encerrar, novaQuestao]);

  const responder = useCallback((idx: number) => {
    if (!questao || revelou || fb?.ok) return;
    setSelecao(idx);
    const acertou = idx === questao.correta;
    const tentAtual = tentativas + 1;

    if (acertou) {
      resultados.current.push({ acertou: true, primeira: tentAtual === 1, usouPista: usouPistaRef.current });
      acertosSeguidos.current = tentAtual === 1 ? acertosSeguidos.current + 1 : 0;
      errosSeguidos.current = 0;
      setRevelou(true);
      setFb({ ok: true, texto: questao.explicacaoAcerto });
      return;
    }

    // errou
    if (tentAtual < questao.maxTentativas) {
      // 1ª errada → pista, deixa observar de novo (não revela)
      usouPistaRef.current = true;
      setTentativas(tentAtual);
      setSelecao(null);  // libera para tocar de novo
      setFb({ ok: false, pista: true, texto: `${questao.explicarErro(idx)} 💡 ${questao.pista}` });
    } else {
      // última errada → revela a correta e explica
      resultados.current.push({ acertou: false, primeira: false, usouPista: usouPistaRef.current });
      acertosSeguidos.current = 0;
      errosSeguidos.current += 1;
      setTentativas(tentAtual);
      setRevelou(true);
      setFb({ ok: false, texto: questao.explicarErro(idx) });
    }
  }, [questao, revelou, fb, tentativas]);

  useEffect(() => () => cancelTTS(), []); // limpa TTS ao desmontar

  if (fase === "tutorial") return <Tutorial theme={theme} onStart={iniciar} />;

  if (fase === "fim") {
    const rs = resultados.current;
    const acertos = rs.filter((r) => r.acertou).length;
    const primeira = rs.filter((r) => r.primeira).length;
    const pistas = rs.filter((r) => r.usouPista).length;
    return (
      <div className={`min-h-screen overflow-y-auto ${s.bg}`}>
        <div className="max-w-[560px] mx-auto px-4 py-10 text-center">
          <h2 className={`text-2xl font-black ${s.title}`}>Atividade concluída</h2>
          <div className={`rounded-2xl border p-6 mt-5 space-y-2 ${s.card} ${s.cardTxt}`}>
            <p className="text-lg">Você concluiu <b>{rs.length}</b> questões.</p>
            <p>Acertou <b>{acertos}</b> — sendo <b>{primeira}</b> na primeira tentativa.</p>
            {pistas > 0 && <p className={s.sub}>Usou pistas em {pistas} {pistas === 1 ? "questão" : "questões"}.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (!questao) return null;

  return (
    <div className={`min-h-screen overflow-y-auto ${s.bg}`}>
      <div className="max-w-[1120px] mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-baseline">
            <div>
              <h2 className={`font-black text-lg ${s.title}`}>Informação em Foco</h2>
              <p className={`text-xs ${s.sub}`}>Leia, confira e escolha</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.isG ? "bg-white/10 text-white/80" : "bg-white text-slate-700 border border-slate-200"}`}>
              {NIVEL_LABEL[questao.nivel]}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 mb-1">
            <span className={`text-xs font-semibold ${s.sub}`}>Questão {qNum}</span>
            <span className={`text-xs ${s.sub}`}>{Math.round(progressPct)}%</span>
          </div>
          {/* progresso por TEMPO (sessão de ~6 min), não por nº de questões */}
          <div className={`h-2 rounded-full overflow-hidden ${s.isG ? "bg-white/10" : "bg-slate-200"}`}>
            <motion.div className="h-full rounded-full" style={{ background: s.isG ? "#22d3ee" : "#2563eb" }}
              animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Pergunta + ajuda + áudio */}
        <div className={`rounded-2xl border p-4 ${s.prompt}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-bold text-base sm:text-lg leading-snug flex-1">{questao.pergunta}</p>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => playTTS(questao.pergunta)} aria-label="Ouvir a pergunta"
                className={`w-9 h-9 rounded-full flex items-center justify-center ${s.isG ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}><Volume2 size={17} /></button>
              <button onClick={() => setAjuda((a) => !a)} aria-label="Ajuda"
                className={`w-9 h-9 rounded-full flex items-center justify-center ${s.isG ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}><HelpCircle size={17} /></button>
            </div>
          </div>
          {questao.instrucao && <p className={`text-sm mt-1.5 ${s.sub}`}>{questao.instrucao}</p>}
          <AnimatePresence>
            {ajuda && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className={`mt-3 text-xs rounded-lg p-3 overflow-hidden ${s.isG ? "bg-white/5 text-white/80" : "bg-slate-100 text-slate-600"}`}>
                <b>PARE → LEIA → PROCURE → CONFIRA → RESPONDA.</b> Leia toda a pergunta, encontre a informação pedida e confira antes de tocar.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cartões */}
        <div className={`grid gap-3 ${questao.produtos.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : questao.produtos.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          {questao.produtos.map((p, i) => {
            const estado: "idle" | "selerr" | "correta" =
              revelou && i === questao.correta ? "correta"
              : (selecao === i && (!fb?.ok)) ? "selerr" : "idle";
            return (
              <ProductCard key={i} p={p} campos={questao.camposMostrados}
                destaque={revelou ? questao.campoRelevante : []}
                estado={estado} onTap={() => responder(i)} disabled={revelou || fb?.ok === true} theme={theme} />
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {fb && (
            <motion.div key={fb.texto} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: fb.ok ? (s.isG ? "rgba(16,185,129,.12)" : "#ecfdf5") : fb.pista ? (s.isG ? "rgba(37,99,235,.12)" : "#eff6ff") : (s.isG ? "rgba(245,158,11,.12)" : "#fffbeb"),
                border: `1.5px solid ${fb.ok ? "rgba(16,185,129,.45)" : fb.pista ? "rgba(37,99,235,.4)" : "rgba(245,158,11,.45)"}`,
              }}>
              <span className="flex-shrink-0 mt-0.5">
                {fb.ok ? <Check className="text-emerald-500" size={20} /> : fb.pista ? <Lightbulb className="text-blue-500" size={20} /> : <X className="text-amber-600" size={20} />}
              </span>
              <p className={`text-sm leading-snug font-medium ${fb.ok ? "text-emerald-700" : fb.pista ? (s.isG ? "text-blue-200" : "text-blue-800") : (s.isG ? "text-amber-200" : "text-amber-800")}`}>
                {fb.texto}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continuar — só depois de resolver (sem auto-avanço) */}
        {revelou && (
          <button onClick={proxima} className={`w-full h-12 rounded-full font-bold ${s.btn}`}>
            {isTimeUp() ? "Ver resultado" : "Continuar"}
          </button>
        )}
      </div>
    </div>
  );
}
