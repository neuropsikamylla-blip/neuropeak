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
  type OperacaoFoco, type TemaConfig,
} from "@/lib/compra-missoes";
import { CATEGORIA_LABEL, type ItemCompra } from "@/data/compra-itens";

interface Props { difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void; }

const MAX_LEVEL = 8;
const START_LEVEL = (d: number) => Math.max(1, Math.min(MAX_LEVEL, Math.round(d * 0.8)));
const money = (v: number) => `R$ ${v}`;

const TEMAS: TemaConfig[] = ["variado", "piquenique", "praia", "frio", "alimentos", "mercado", "objetos"];
const FOCOS: OperacaoFoco[] = ["tudo", "soma", "subtracao", "multiplicacao", "divisao"];

// ── Estilos por tema ──────────────────────────────────────────────────────────
function styles(theme: Theme) {
  const isG = theme === "GAMIFIED";
  const isC = theme === "COLORFUL";
  const rootBg: React.CSSProperties = isG
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isC ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };
  const cardStyle: React.CSSProperties = isG
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
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
    key: (isG ? { background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)", color: "#fff" } : { background: "#fff", border: "1.5px solid rgba(26,39,68,0.12)", color: "#1a2744" }) as React.CSSProperties,
  };
  return { isG, isC, rootBg, cardStyle, btnStyle, pal };
}

// ── Cena de uma etapa numérica (visual da conta, sem revelar o resultado) ──────
function SceneNumerica({ etapa, theme }: { etapa: EtapaNumerica; theme: Theme }) {
  const { pal, isG } = styles(theme);
  const r = etapa.render;
  const unit = (v: number) => (etapa.unidade === "money" ? money(v) : etapa.unidade === "kg" ? `${v} kg` : `${v}`);
  const chip = `inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border`;

  if (r.tipo === "soma") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {r.parcelas.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={`text-xl font-black ${pal.sub}`}>+</span>}
            <span className={chip} style={pal.box}>
              <span style={{ fontSize: 26 }}>{p.emoji}</span>
              <span className={`text-sm font-bold ${pal.title}`}>{r.unidade === "money" ? money(p.valor) : `${p.valor} kg`}</span>
            </span>
          </React.Fragment>
        ))}
        <span className={`text-xl font-black ${pal.sub}`}>=</span>
        <span className={`text-xl font-black ${isG ? "text-cyan-300" : "text-emerald-600"}`}>?</span>
      </div>
    );
  }
  if (r.tipo === "troco") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
        <span className={chip} style={pal.box}><span className={pal.sub}>tinha</span> <span className={pal.title}>{unit(r.had)}</span></span>
        <span className={`text-xl font-black ${pal.sub}`}>−</span>
        <span className={chip} style={pal.box}><span className={pal.sub}>usou</span> <span className={pal.title}>{unit(r.spent)}</span></span>
        <span className={`text-xl font-black ${pal.sub}`}>=</span>
        <span className={`text-xl font-black ${isG ? "text-cyan-300" : "text-emerald-600"}`}>?</span>
      </div>
    );
  }
  if (r.tipo === "mult") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={chip} style={pal.box}>
          <span style={{ fontSize: 26 }}>{r.emoji}</span>
          <span className={`text-sm font-bold ${pal.title}`}>{r.qtd} × {money(r.unitPrice)}</span>
        </span>
        <span className={`text-xl font-black ${pal.sub}`}>=</span>
        <span className={`text-xl font-black ${isG ? "text-cyan-300" : "text-emerald-600"}`}>?</span>
      </div>
    );
  }
  // divisao
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className={chip} style={pal.box}>
        <span style={{ fontSize: 26 }}>{r.emoji}</span>
        <span className={`text-sm font-bold ${pal.title}`}>{r.total} ÷ {r.partes}</span>
      </span>
      <span className={`text-xl font-black ${pal.sub}`}>=</span>
      <span className={`text-xl font-black ${isG ? "text-cyan-300" : "text-emerald-600"}`}>?</span>
    </div>
  );
}

// ── Keypad numérico (tudo por clique — funciona com controle remoto) ───────────
function Keypad({ value, unidade, onChange, theme, disabled }: {
  value: string; unidade: EtapaNumerica["unidade"]; onChange: (v: string) => void; theme: Theme; disabled: boolean;
}) {
  const { pal } = styles(theme);
  const press = (k: string) => {
    if (disabled) return;
    if (k === "del") onChange(value.slice(0, -1));
    else if (value.length < 4) onChange((value + k).replace(/^0+(?=\d)/, ""));
  };
  const shown = value === "" ? "—" : unidade === "money" ? money(Number(value)) : unidade === "kg" ? `${value} kg` : value;
  return (
    <div>
      <div className="rounded-xl border py-3 mb-2 text-center text-2xl font-black tabular-nums" style={pal.box}>
        <span className={pal.title}>{shown}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <button key={k} onClick={() => press(k)} disabled={disabled}
            className="h-12 rounded-xl text-xl font-black active:scale-95 transition-transform disabled:opacity-40" style={pal.key}>{k}</button>
        ))}
        <button onClick={() => onChange("")} disabled={disabled}
          className="h-12 rounded-xl text-sm font-bold active:scale-95 transition-transform disabled:opacity-40" style={pal.key}>C</button>
        <button onClick={() => press("0")} disabled={disabled}
          className="h-12 rounded-xl text-xl font-black active:scale-95 transition-transform disabled:opacity-40" style={pal.key}>0</button>
        <button onClick={() => press("del")} disabled={disabled}
          className="h-12 rounded-xl text-xl font-black active:scale-95 transition-transform disabled:opacity-40" style={pal.key}>⌫</button>
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

  return (
    <motion.div key={etapa.index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* História + objetivo */}
      <div className="rounded-xl p-3 border mb-2" style={pal.box}>
        <p className={`text-[11px] font-bold uppercase tracking-wide mb-0.5 ${pal.sub}`}>📖 {etapa.objetivo}</p>
        <p className={`text-sm font-medium leading-snug ${pal.title}`}>{etapa.historia}</p>
      </div>

      {/* Instrução exata */}
      <div className="rounded-xl p-3 border mb-3" style={{ background: isG ? "rgba(8,145,178,0.12)" : "#eef6ff", border: "1.5px solid rgba(8,145,178,0.3)" }}>
        <p className={`text-sm font-semibold leading-snug ${isG ? "text-cyan-200" : "text-[#1a2744]"}`}>{etapa.instrucao}</p>
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
          <div className="rounded-xl p-4 border mb-3" style={pal.box}>
            <SceneNumerica etapa={etapa.dados as EtapaNumerica} theme={theme} />
          </div>
          <Keypad value={answer} unidade={(etapa.dados as EtapaNumerica).unidade} onChange={setAnswer} theme={theme} disabled={done} />
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
            className="rounded-xl p-3 border mt-1 mb-3"
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
          <button onClick={() => onProceed(firstTryRef.current && correct)} className="w-full h-12 font-bold" style={btnStyle}>{proceedLabel}</button>
        )
      ) : (
        <>
          <button onClick={confirmar}
            disabled={numeric ? answer === "" : selected.size === 0}
            className="w-full h-12 font-bold transition-all disabled:opacity-40" style={btnStyle}>
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

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="p-5" style={cardStyle}>
          {/* Cabeçalho: título da missão · progresso · nível */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className={`font-bold text-base leading-none ${pal.title}`}>🛒 {missao.titulo}</h2>
              <p className={`text-xs font-semibold mt-1 ${pal.sub}`}>
                {missao.personagem} · Etapa {etapaIdx + 1}/{missao.etapas.length} · Nível {missao.nivel}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <EtapaView key={`${missionSeed}-${etapaIdx}`} etapa={etapa} theme={theme}
              proceedLabel={proceedLabel} onProceed={handleEtapaDone} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
