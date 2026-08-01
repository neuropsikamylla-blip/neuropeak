"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Compra Multifuncional — MISSÕES MATEMÁTICAS PROGRESSIVAS
// (COMPRA-MULTIFUNCIONAL-MISSOES-SPEC.md, Kamylla 20/jul/2026).
//
// Uma missão = história contínua com etapas que sobem UM conceito por vez. Dois
// modos de resposta: DIGITAR o resultado (conta pura, via keypad) ou SELECIONAR
// itens respeitando regras. O app NUNCA faz a conta pelo jogador durante a
// tentativa — só verifica e explica DEPOIS de confirmar, com dicas em 3 níveis.
// Toda lógica pura vem de `lib/compra-missoes.ts` (testada).
//
// LAYOUT (Kamylla 31/jul): dois painéis — a HISTÓRIA sobre o fundo temático à
// esquerda e a MISSÃO (enunciado + itens + resposta) à direita, com header no topo.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import {
  buildMissao, verificarNumerica, verificarSelecao, feedbackNumerica, feedbackSelecao,
  regraLabel, OP_FOCO_LABEL, TEMA_LABEL,
  type Missao, type Etapa, type EtapaNumerica, type EtapaSelecao, type Feedback,
  type OperacaoFoco, type TemaConfig, type TemaKey,
} from "@/lib/compra-missoes";
import { type ItemCompra } from "@/data/compra-itens";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_LEVEL = 8;
const START_LEVEL = (d: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round(d * 0.8)));
const money = (v: number) => `R$ ${v}`;

const TEMAS: TemaConfig[] = ["variado", "piquenique", "praia", "frio", "alimentos", "mercado", "objetos"];
const FOCOS: OperacaoFoco[] = ["tudo", "soma", "subtracao", "multiplicacao", "divisao"];

// Fundo temático (arte no canto, área clara p/ o texto). Arquivos em /exercises/compra-fundos.
const FUNDO_TEMA: Record<TemaKey, string> = {
  frio: "frio", praia: "praia", piquenique: "neutro",
  alimentos: "feira", mercado: "vila-fruta", objetos: "shopping",
};
const fundoUrl = (tema: TemaKey) => `/exercises/compra-fundos/${FUNDO_TEMA[tema] ?? "neutro"}.webp`;

// Abertura narrativa da história (painel esquerdo), por tema.
const CONTEXTO_TEMA: Record<TemaKey, string> = {
  frio: "está se preparando para uma viagem para um lugar muito frio",
  praia: "está arrumando as coisas para um dia de praia",
  piquenique: "está preparando um piquenique no parque",
  alimentos: "está organizando o almoço em família",
  mercado: "foi fazer as compras da semana no mercado",
  objetos: "está organizando a mochila para a escola",
};

// 3 opções de resposta (a correta + 2 vizinhas plausíveis) — atalho para o keypad.
function opcoesNumericas(resposta: number): number[] {
  const passo = Math.max(1, Math.round(resposta * 0.12));
  const set = new Set<number>([resposta]);
  let d = passo;
  while (set.size < 3) {
    if (resposta - d > 0) set.add(resposta - d);
    if (set.size < 3) set.add(resposta + d);
    d += passo;
  }
  const arr = [...set];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr.slice(0, 3);
}

// ── Estilos por tema ──────────────────────────────────────────────────────────
function styles(theme: Theme) {
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const rootBg: React.CSSProperties = isG
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isC ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #f3efe6 0%, #ece5d8 55%, #e3dccd 100%)" };
  const cardStyle: React.CSSProperties = isG
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 24, boxShadow: "0 6px 26px rgba(26,39,68,0.09)" };
  const btnStyle: React.CSSProperties = isG
    ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
    : isC ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };
  const pal = {
    title: isG ? "text-white" : "text-[#1a2744]",
    sub: isG ? "text-white/70" : "text-[#8a7a6a]",
    box: (isG ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#f8fafc", border: "1.5px solid rgba(26,39,68,0.08)" }) as React.CSSProperties,
    item: isG ? "border-white/20 bg-white/10 text-white/90" : "border-slate-200 bg-white text-gray-700 shadow-sm",
    itemSel: "border-emerald-500 bg-emerald-50 text-gray-800",
    key: (isG ? { background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)", color: "#fff" } : { background: "#fffdf7", border: "1.5px solid rgba(26,39,68,0.12)", color: "#1a2744" }) as React.CSSProperties,
  };
  return { isG, isC, rootBg, cardStyle, btnStyle, pal };
}

// ── Cartão de um item (parcela) na conta — estilo do mockup ────────────────────
function ItemCard({ emoji, name, sub, theme }: { emoji: string; name: string; sub: string; theme: Theme }) {
  const { isG, pal } = styles(theme);
  return (
    <div className="rounded-2xl px-3 py-2.5 flex flex-col items-center min-w-[92px]"
      style={isG ? { background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" } : { background: "#fffdf7", border: "1.5px solid rgba(26,39,68,0.10)" }}>
      <span className={`text-[11px] font-semibold mb-0.5 ${pal.sub}`}>{name}</span>
      <span style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</span>
      <span className={`text-base font-black mt-1 tabular-nums ${isG ? "text-cyan-300" : "text-emerald-600"}`}>{sub}</span>
    </div>
  );
}

// ── Cena de uma etapa numérica (visual da conta, sem revelar o resultado) ──────
function SceneNumerica({ etapa, theme }: { etapa: EtapaNumerica; theme: Theme }) {
  const { pal, isG } = styles(theme);
  const r = etapa.render;
  const op = (s: string) => <span className={`text-2xl font-black ${pal.sub}`}>{s}</span>;
  const QBox = (
    <div className="rounded-2xl flex items-center justify-center min-w-[72px] min-h-[92px]"
      style={{ border: `2px dashed ${isG ? "rgba(103,232,249,0.5)" : "rgba(37,99,235,0.4)"}`, background: isG ? "rgba(103,232,249,0.06)" : "rgba(37,99,235,0.05)" }}>
      <span className={`text-3xl font-black ${isG ? "text-cyan-300" : "text-blue-500"}`}>?</span>
    </div>
  );

  if (r.tipo === "soma") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {r.parcelas.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && op("+")}
            <ItemCard emoji={p.emoji} name={p.name} sub={r.unidade === "money" ? money(p.valor) : `${p.valor} kg`} theme={theme} />
          </React.Fragment>
        ))}
        {op("=")}
        {QBox}
      </div>
    );
  }
  if (r.tipo === "troco") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ItemCard emoji="👛" name="tinha" sub={money(r.had)} theme={theme} />
        {op("−")}
        <ItemCard emoji="🛍️" name="gastou" sub={money(r.spent)} theme={theme} />
        {op("=")}
        {QBox}
      </div>
    );
  }
  if (r.tipo === "mult") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ItemCard emoji={r.emoji} name={`${r.qtd} × ${r.name}`} sub={`${money(r.unitPrice)} cada`} theme={theme} />
        {op("=")}
        {QBox}
      </div>
    );
  }
  // divisao
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <ItemCard emoji={r.emoji} name={`${r.total} ${r.name}`} sub={`÷ ${r.partes}`} theme={theme} />
      {op("=")}
      {QBox}
    </div>
  );
}

// ── Keypad numérico (tudo por clique — funciona com controle remoto) ───────────
function Keypad({ value, unidade, onChange, theme, disabled }: {
  value: string; unidade: EtapaNumerica["unidade"]; onChange: (v: string) => void; theme: Theme; disabled: boolean;
}) {
  const { pal, isG } = styles(theme);
  const press = (k: string) => {
    if (disabled) return;
    if (k === "del") onChange(value.slice(0, -1));
    else if (value.length < 4) onChange((value + k).replace(/^0+(?=\d)/, ""));
  };
  const prefix = unidade === "money" ? "R$" : unidade === "kg" ? "kg" : "";
  return (
    <div>
      {/* Campo "Digite o total" */}
      <div className="rounded-2xl border flex items-center px-4 py-3 mb-2.5" style={pal.box}>
        <span className={`text-lg font-black tabular-nums flex-1 ${value === "" ? pal.sub : pal.title}`}>
          {value === "" ? "Digite o total" : unidade === "money" ? money(Number(value)) : unidade === "kg" ? `${value} kg` : value}
        </span>
        {prefix && <span className={`text-sm font-bold px-2 py-1 rounded-lg ${isG ? "bg-white/10 text-cyan-200" : "bg-blue-50 text-blue-500"}`}>{prefix}</span>}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((k) => (
          <button key={k} onClick={() => press(k)} disabled={disabled}
            className="h-12 rounded-xl text-xl font-black active:scale-95 transition-transform disabled:opacity-40" style={pal.key}>{k}</button>
        ))}
        <button onClick={() => press("del")} disabled={disabled}
          className="h-12 rounded-xl text-lg font-black active:scale-95 transition-transform disabled:opacity-40 col-span-2" style={pal.key}>⌫</button>
        <button onClick={() => onChange("")} disabled={disabled}
          className="h-12 rounded-xl text-sm font-bold active:scale-95 transition-transform disabled:opacity-40 col-span-3" style={pal.key}>Limpar</button>
      </div>
    </div>
  );
}

// ── Uma etapa jogável (numérica ou seleção) ───────────────────────────────────
// Remonta a cada etapa (key no pai) → estado sempre fresco.
function EtapaView({ etapa, theme, proceedLabel, onProceed, autoProceed }: {
  etapa: Etapa; theme: Theme; proceedLabel: string; onProceed: (firstTry: boolean) => void; autoProceed?: boolean;
}) {
  const { isG, btnStyle, pal } = styles(theme);
  const numeric = etapa.dados.modo === "numeric";

  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);        // nº de confirmações erradas
  const [revealed, setRevealed] = useState<Feedback | null>(null);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);
  const firstTryRef = useRef(true);
  const autoDoneRef = useRef(false);

  // Opções de resposta rápida (só numéricas) — a correta + 2 vizinhas.
  const opcoes = useMemo(
    () => (etapa.dados.modo === "numeric" ? opcoesNumericas(etapa.dados.respostaCorreta) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  // Modo tutorial: ao acertar, conclui sozinho (deixa só o CTA do TutorialBase).
  useEffect(() => {
    if (autoProceed && done && correct && !autoDoneRef.current) {
      autoDoneRef.current = true;
      onProceed(true);
    }
  }, [autoProceed, done, correct, onProceed]);

  // Cronômetro só nas etapas avançadas (spec §Cronômetro).
  const totalSecs = etapa.temCronometro ? (etapa.dados.modo === "select" ? 60 : 45) : 0;
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const stateRef = useRef({ answer, selected, attempts, done });
  useEffect(() => { stateRef.current = { answer, selected, attempts, done }; }, [answer, selected, attempts, done]);

  useEffect(() => {
    if (!etapa.temCronometro) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); onTimeUp(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onTimeUp() {
    if (stateRef.current.done) return;
    // Confirma o que houver e explica o que faltou; sem retry após o tempo.
    firstTryRef.current = false;
    if (etapa.dados.modo === "numeric") {
      const ok = stateRef.current.answer !== "" && verificarNumerica(etapa.dados, Number(stateRef.current.answer));
      setCorrect(ok);
      setRevealed(feedbackNumerica(etapa.dados, ok, 3));
    } else {
      const ids = [...stateRef.current.selected];
      const ok = verificarSelecao(etapa.dados, ids).correto;
      setCorrect(ok);
      setRevealed(feedbackSelecao(etapa.dados, ids, 4));
    }
    setDone(true);
  }

  function toggle(id: string) {
    if (done) return;
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function confirmar() {
    if (done) return;
    if (etapa.dados.modo === "numeric") {
      if (answer === "") return;
      const ok = verificarNumerica(etapa.dados, Number(answer));
      const fb = feedbackNumerica(etapa.dados, ok, ok ? 0 : attempts + 1);
      setRevealed(fb);
      if (ok) { setCorrect(true); setDone(true); }
      else { firstTryRef.current = false; setAttempts((a) => a + 1); }
    } else {
      const ids = [...selected];
      if (ids.length === 0) return;
      const v = verificarSelecao(etapa.dados, ids);
      const fb = feedbackSelecao(etapa.dados, ids, v.correto ? 0 : attempts + 1);
      setRevealed(fb);
      if (v.correto) { setCorrect(true); setDone(true); }
      else { firstTryRef.current = false; setAttempts((a) => a + 1); }
    }
  }

  const timerRatio = totalSecs ? timeLeft / totalSecs : 0;
  const timerColor = timerRatio > 0.5 ? "bg-green-500" : timerRatio > 0.25 ? "bg-amber-400" : "bg-red-500 animate-pulse";

  // Painel de status permitido (nada calculável): contagem + regras da missão.
  const regras = etapa.dados.modo === "select" ? etapa.dados.regras : [];
  const selItems: ItemCompra[] = etapa.dados.modo === "select"
    ? etapa.dados.pool.filter((i) => selected.has(i.id)) : [];
  const unidade = numeric ? (etapa.dados as EtapaNumerica).unidade : "money";
  const optLabel = (v: number) => unidade === "money" ? money(v) : unidade === "kg" ? `${v} kg` : `${v}`;

  return (
    <motion.div key={etapa.index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Enunciado da tarefa (com ícone ?) */}
      <div className="flex items-start gap-2.5 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
          style={{ background: isG ? "linear-gradient(135deg,#0891b2,#0e7490)" : "linear-gradient(135deg,#2a4a8a,#1a2744)" }}>?</span>
        <p className={`text-sm font-semibold leading-snug pt-1 ${pal.title}`}>{etapa.instrucao}</p>
      </div>

      {/* Cronômetro (só etapas avançadas) */}
      {etapa.temCronometro && (
        <div className="mb-3">
          <div className="flex justify-end mb-1">
            <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 8 ? "text-red-500 animate-pulse" : pal.sub}`}>{timeLeft}s</span>
          </div>
          <div className={`h-1.5 rounded-full ${isG ? "bg-white/10" : "bg-gray-200"}`}>
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerRatio * 100}%` }} />
          </div>
        </div>
      )}

      {numeric ? (
        <>
          <div className="rounded-2xl p-4 border mb-3" style={pal.box}>
            <SceneNumerica etapa={etapa.dados as EtapaNumerica} theme={theme} />
          </div>
          <Keypad value={answer} unidade={(etapa.dados as EtapaNumerica).unidade} onChange={setAnswer} theme={theme} disabled={done} />

          {/* Opções de resposta rápida */}
          <div className="flex items-center gap-2 mt-3">
            {opcoes.map((v) => {
              const on = answer === String(v);
              return (
                <button key={v} onClick={() => !done && setAnswer(String(v))} disabled={done}
                  className={`flex-1 h-11 rounded-2xl border-2 font-black text-sm tabular-nums transition-all active:scale-95 disabled:opacity-50 ${
                    on ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                       : isG ? "border-white/20 bg-white/5 text-white/85" : "border-slate-200 bg-white text-[#1a2744]"}`}>
                  {optLabel(v)}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Regras da missão (permitido) */}
          <div className="rounded-xl p-3 border mb-2 space-y-1" style={pal.box}>
            <p className={`text-[11px] font-bold uppercase tracking-wide ${pal.sub}`}>Regras da missão</p>
            {regras.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs font-semibold ${pal.title}`}>
                <span className="text-sm leading-none mt-[1px]">•</span><span className="leading-snug">{regraLabel(r)}</span>
              </div>
            ))}
          </div>

          {/* Itens */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {(etapa.dados as EtapaSelecao).pool.map((item) => {
              const on = selected.has(item.id);
              return (
                <button key={item.id} onClick={() => toggle(item.id)} disabled={done}
                  className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-60 ${on ? pal.itemSel : pal.item}`}>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{item.emoji}</span>
                  <span className="text-xs text-center leading-tight font-medium">{item.name}</span>
                  <span className={`text-xs font-bold tabular-nums ${isG ? "text-cyan-300" : "text-emerald-600"}`}>{money(item.price)}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isG ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-500"}`}>{item.weight} kg</span>
                  {on && <span className="text-xs text-green-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Status permitido: contagem + nomes (NUNCA somas) */}
          <div className="rounded-xl px-3 py-2 border mb-3 text-xs" style={pal.box}>
            <span className={`font-bold ${pal.title}`}>{selected.size}</span>
            <span className={pal.sub}> {selected.size === 1 ? "item selecionado" : "itens selecionados"}</span>
            {selItems.length > 0 && <span className={pal.sub}>: {selItems.map((i) => i.name).join(", ")}</span>}
          </div>
        </>
      )}

      {/* Feedback (só depois de confirmar) */}
      <AnimatePresence>
        {revealed && (
          <motion.div key={`fb-${attempts}-${done}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 border mt-3 mb-3"
            style={{
              background: correct ? (isG ? "rgba(16,185,129,0.12)" : "#ecfdf5") : (isG ? "rgba(250,204,21,0.12)" : "#fffbeb"),
              border: `1.5px solid ${correct ? "rgba(16,185,129,0.4)" : "rgba(250,204,21,0.4)"}`,
            }}>
            <p className={`font-bold text-sm mb-1 ${correct ? "text-emerald-600" : (isG ? "text-amber-300" : "text-amber-700")}`}>
              {correct ? "✅ " : "💡 "}{revealed.titulo}
            </p>
            {revealed.linhas.map((l, i) => (
              <p key={i} className={`text-xs leading-snug ${correct ? "text-emerald-700" : (isG ? "text-amber-100/90" : "text-amber-800")}`}>{l}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ações */}
      {done ? (
        autoProceed ? null : (
          <button onClick={() => onProceed(firstTryRef.current && correct)} className="w-full h-12 font-bold mt-3" style={btnStyle}>{proceedLabel}</button>
        )
      ) : (
        <>
          <button onClick={confirmar}
            disabled={numeric ? answer === "" : selected.size === 0}
            className="w-full h-12 font-bold transition-all disabled:opacity-40 mt-3" style={btnStyle}>
            {numeric ? (answer === "" ? "Digite a resposta" : "Confirmar") : (selected.size === 0 ? "Selecione itens" : "Confirmar compra")}
          </button>
          {!numeric && attempts >= 3 && (
            <button onClick={() => { firstTryRef.current = false; onProceed(false); }}
              className={`w-full mt-2 h-9 rounded-full font-semibold text-xs border-2 ${isG ? "border-white/25 text-white/70" : "border-slate-300 text-slate-500"}`}>
              Avançar assim mesmo
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

// ── Painel esquerdo: a história sobre o fundo temático ────────────────────────
function PainelHistoria({ missao, etapa }: { missao: Missao; etapa: Etapa }) {
  const contexto = CONTEXTO_TEMA[missao.tema] ?? "foi às compras";
  return (
    <div className="relative rounded-3xl overflow-hidden flex-1"
      style={{
        minHeight: 340,
        backgroundImage: `url(${fundoUrl(missao.tema)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1.5px solid rgba(26,39,68,0.08)",
      }}>
      {/* leve véu à esquerda p/ garantir leitura sobre a área clara */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(255,251,242,0.86) 0%, rgba(255,251,242,0.55) 42%, rgba(255,251,242,0) 66%)" }} />
      <div className="relative p-6 max-w-[66%]">
        <span className="inline-flex w-9 h-9 rounded-full items-center justify-center text-lg mb-4"
          style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 2px 8px rgba(26,39,68,0.12)" }}>📖</span>
        <h3 className="text-[#1a2744] font-black text-xl sm:text-2xl leading-tight mb-3">
          {missao.personagem} {contexto}.
        </h3>
        <p className="text-[#3a4a63] text-sm leading-relaxed">{etapa.historia}</p>
        <p className="text-[#3a4a63] text-sm leading-relaxed mt-2">{etapa.objetivo}</p>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
  const { rootBg, cardStyle, btnStyle, pal, isG } = styles(theme);
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();

  const [stage, setStage] = useState<"config" | "tutorial" | "play">("config");
  const [temaCfg, setTemaCfg] = useState<TemaConfig>("variado");
  const [foco, setFoco] = useState<OperacaoFoco>("tudo");

  const [missao, setMissao] = useState<Missao | null>(null);
  const [etapaIdx, setEtapaIdx] = useState(0);
  const [missionSeed, setMissionSeed] = useState(0);

  const levelRef = useRef(START_LEVEL(difficulty));
  const reachedRef = useRef(levelRef.current);
  const sessionResultsRef = useRef<boolean[]>([]);   // acerto de 1ª por etapa (sessão)
  const missionResultsRef = useRef<boolean[]>([]);   // acerto de 1ª por etapa (missão atual)

  // Etapa de exemplo do tutorial (réplica real do jogo: uma soma simples).
  const tutorialEtapa = useMemo(() => buildMissao("piquenique", 1, "soma").etapas[0], []);

  function iniciarMissao() {
    const m = buildMissao(temaCfg, levelRef.current, foco);
    missionResultsRef.current = [];
    setMissao(m);
    setEtapaIdx(0);
    setMissionSeed((s) => s + 1);
  }

  function finishSession() {
    finish();
    const results = sessionResultsRef.current;
    const acertos = results.filter(Boolean).length;
    const accuracy = results.length ? acertos / results.length : 0;
    onComplete({
      exerciseId: "compra-multifuncional",
      domain: "executive",
      score: calculateExerciseScore("compra-multifuncional", accuracy, undefined, reachedRef.current),
      accuracy,
      difficulty: reachedRef.current,
      duration: elapsedSec(),
      metadata: {
        etapas: results.length, acertosPrimeira: acertos, nivelAlcancado: reachedRef.current,
        tema: temaCfg, foco,
      },
    });
  }

  const handleEtapaDone = useCallback((firstTry: boolean) => {
    sessionResultsRef.current = [...sessionResultsRef.current, firstTry];
    missionResultsRef.current = [...missionResultsRef.current, firstTry];
    if (isTimeUp()) { finishSession(); return; }

    const m = missao!;
    if (etapaIdx + 1 < m.etapas.length) { setEtapaIdx((i) => i + 1); return; }

    // Fim da missão → ajusta o nível pelo desempenho e começa a próxima.
    const res = missionResultsRef.current;
    const rate = res.length ? res.filter(Boolean).length / res.length : 0;
    if (rate >= 0.75 && levelRef.current < MAX_LEVEL) levelRef.current += 1;
    else if (rate < 0.4 && levelRef.current > 1) levelRef.current -= 1;
    reachedRef.current = Math.max(reachedRef.current, levelRef.current);
    if (isTimeUp()) { finishSession(); return; }
    iniciarMissao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missao, etapaIdx]);

  // ── Config ──
  if (stage === "config") {
    const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
      <button onClick={onClick}
        className={`px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${on ? "border-emerald-500 bg-emerald-50 text-emerald-700" : isG ? "border-white/20 text-white/75" : "border-slate-200 text-slate-600"}`}>
        {children}
      </button>
    );
    return (
      <div className="min-h-screen overflow-y-auto" style={rootBg}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="p-5" style={cardStyle}>
            <h2 className={`font-bold text-lg ${pal.title}`}>🛒 Compra Multifuncional</h2>
            <p className={`text-sm mb-4 ${pal.sub}`}>Missões de matemática numa situação de compra. Escolha o tema e o foco.</p>

            <p className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${pal.sub}`}>Tema</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TEMAS.map((t) => <Chip key={t} on={temaCfg === t} onClick={() => setTemaCfg(t)}>{TEMA_LABEL[t]}</Chip>)}
            </div>

            <p className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${pal.sub}`}>Foco</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {FOCOS.map((f) => <Chip key={f} on={foco === f} onClick={() => setFoco(f)}>{OP_FOCO_LABEL[f]}</Chip>)}
            </div>

            <button onClick={() => setStage("tutorial")} className="w-full h-12 font-bold" style={btnStyle}>Continuar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tutorial (réplica real: resolve uma soma simples) ──
  if (stage === "tutorial") {
    return (
      <TutorialBase theme={theme} title="Compra Multifuncional"
        steps={[{
          instruction:
            "Cada missão é uma historinha com etapas de matemática. Em algumas você digita o resultado da conta; em outras escolhe os itens respeitando as regras. O app NÃO faz a conta por você — só confere e explica depois que você confirmar. Resolva a soma abaixo para começar.",
          content: (done) => (
            <EtapaView etapa={tutorialEtapa} theme={theme} proceedLabel="Começar" autoProceed onProceed={() => done()} />
          ),
        }]}
        onDone={() => { begin(); iniciarMissao(); setStage("play"); }} />
    );
  }

  // ── Play ──
  if (!missao) return null;
  const etapa = missao.etapas[etapaIdx];
  const proceedLabel = etapaIdx + 1 < missao.etapas.length ? "Continuar" : "Nova missão";
  const totalEtapas = missao.etapas.length;
  const passo = etapaIdx + 1;
  const progresso = passo / totalEtapas;

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-[1180px] mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: isG ? "rgba(255,255,255,0.1)" : "#fff", border: "1.5px solid rgba(26,39,68,0.1)", boxShadow: "0 2px 10px rgba(26,39,68,0.08)" }}>🛒</div>
          <div className="min-w-0">
            <h2 className={`font-black text-lg sm:text-xl leading-tight truncate ${pal.title}`}>{missao.titulo}</h2>
            <p className={`text-xs font-semibold ${pal.sub}`}>
              👤 {missao.personagem} · Etapa {passo}/{totalEtapas} · Nível {missao.nivel}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isG ? "bg-white/10 text-white/80" : "bg-white text-[#1a2744] border border-[#1a2744]/10"}`}>{passo}/{totalEtapas}</span>
            <div className="w-24 sm:w-40 h-2 rounded-full overflow-hidden" style={{ background: isG ? "rgba(255,255,255,0.12)" : "rgba(26,39,68,0.1)" }}>
              <motion.div className="h-full rounded-full" style={{ background: isG ? "#22d3ee" : "#16a34a" }}
                animate={{ width: `${progresso * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        </div>

        {/* Dois painéis: história | missão */}
        <div className="grid md:grid-cols-2 gap-4 items-stretch">
          <AnimatePresence mode="wait">
            <motion.div key={`h-${missionSeed}-${etapaIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex">
              <PainelHistoria missao={missao} etapa={etapa} />
            </motion.div>
          </AnimatePresence>

          <div className="p-5 sm:p-6" style={cardStyle}>
            <AnimatePresence mode="wait">
              <EtapaView key={`${missionSeed}-${etapaIdx}`} etapa={etapa} theme={theme}
                proceedLabel={proceedLabel} onProceed={handleEtapaDone} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
