"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface AntesDepoisProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ─── Áudio (Web Speech) — escolhe a voz pt-BR mais natural ───────────────────────
let ptVoice: SpeechSynthesisVoice | null | undefined;
function pickPtVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.filter((v) => /pt[-_]?br/i.test(v.lang) || /portugu/i.test(v.name) || /^pt/i.test(v.lang));
  const prefer = ["luciana", "google português do brasil", "google portugues do brasil",
    "microsoft francisca", "francisca", "microsoft thalita", "thalita", "maria", "fernanda", "felipe",
    "microsoft daniel", "daniel", "natural", "google"];
  for (const name of prefer) { const v = pt.find((vc) => vc.name.toLowerCase().includes(name)); if (v) return v; }
  return pt[0] ?? null;
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { ptVoice = pickPtVoice(); };
}
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    if (ptVoice === undefined) ptVoice = pickPtVoice();
    if (ptVoice) u.voice = ptVoice;
    u.rate = 0.96; u.pitch = 1.02; u.volume = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* sem áudio — segue visual */ }
}
function stopSpeak() { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }

// ─── Conteúdo: sequências ordenadas por categoria ────────────────────────────────
type Direction = "antes" | "depois";
interface Item { e: string; t: string; }
interface Seq { id: string; cat: string; items: Item[]; }

const num = (a: number, b: number): Item[] => Array.from({ length: b - a + 1 }, (_, i) => ({ e: "", t: String(a + i) }));
const txt = (arr: string[], e: string): Item[] => arr.map((t) => ({ e, t }));

const SEQS: Seq[] = [
  // concretas (rotina, crescimento, alimentação, cronológica, higiene)
  { id: "manha", cat: "rotina", items: [{ e: "🛌", t: "Acordar" }, { e: "🪥", t: "Escovar os dentes" }, { e: "☕", t: "Tomar café" }, { e: "💼", t: "Ir trabalhar" }] },
  { id: "noite", cat: "rotina", items: [{ e: "🍽️", t: "Almoçar" }, { e: "🏠", t: "Voltar pra casa" }, { e: "🍲", t: "Jantar" }, { e: "😴", t: "Dormir" }] },
  { id: "vida", cat: "crescimento", items: [{ e: "👶", t: "Bebê" }, { e: "🧒", t: "Criança" }, { e: "🧑", t: "Adulto" }, { e: "👴", t: "Idoso" }] },
  { id: "planta", cat: "crescimento", items: [{ e: "🌰", t: "Semente" }, { e: "🌱", t: "Broto" }, { e: "🌿", t: "Plantinha" }, { e: "🌻", t: "Flor" }] },
  { id: "pao", cat: "alimentacao", items: [{ e: "🌾", t: "Trigo" }, { e: "🍞", t: "Pão" }, { e: "🔥", t: "Torrar" }, { e: "🥪", t: "Torrada" }] },
  { id: "ovo", cat: "alimentacao", items: [{ e: "🥚", t: "Ovo" }, { e: "🐣", t: "Chocando" }, { e: "🐤", t: "Pintinho" }, { e: "🐔", t: "Galinha" }] },
  { id: "partes-dia", cat: "cronologica", items: [{ e: "🌅", t: "Manhã" }, { e: "☀️", t: "Tarde" }, { e: "🌆", t: "Fim de tarde" }, { e: "🌙", t: "Noite" }] },
  { id: "refeicoes", cat: "cronologica", items: [{ e: "🥐", t: "Café da manhã" }, { e: "🍽️", t: "Almoço" }, { e: "🍪", t: "Lanche" }, { e: "🍲", t: "Jantar" }] },
  { id: "maos", cat: "higiene", items: [{ e: "🖐️", t: "Mãos sujas" }, { e: "🚰", t: "Lavar as mãos" }, { e: "✨", t: "Mãos limpas" }] },
  { id: "banho", cat: "higiene", items: [{ e: "😓", t: "Suado" }, { e: "🚿", t: "Tomar banho" }, { e: "🧼", t: "Limpo" }] },
  // abstratas
  { id: "numeros", cat: "numeros", items: num(1, 10) },
  { id: "letras", cat: "letras", items: txt(["A", "B", "C", "D", "E", "F", "G", "H"], "") },
  { id: "dias", cat: "dias", items: txt(["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], "📅") },
  { id: "meses", cat: "meses", items: txt(["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], "🗓️") },
];

const CAT_LABEL: Record<string, string> = {
  rotina: "rotina diária", crescimento: "crescimento", alimentacao: "alimentação", cronologica: "ordem do dia",
  higiene: "higiene", numeros: "números", letras: "letras", dias: "dias da semana", meses: "meses do ano",
};
const SIMPLE_CATS = ["rotina", "crescimento", "alimentacao", "cronologica", "higiene"];
const MID_CATS = ["numeros", "letras"];
const HARD_CATS = ["dias", "meses"];

// ─── Variações de comando (não repetir consecutiva) ──────────────────────────────
const ANTES_CMDS = [
  (x: string) => `O que vem antes de ${x}?`,
  (x: string) => `Qual vem antes de ${x}?`,
  (x: string) => `O que aconteceu antes de ${x}?`,
  (x: string) => `Qual item antecede ${x}?`,
  (x: string) => `Antes de ${x}, vem o quê?`,
];
const DEPOIS_CMDS = [
  (x: string) => `O que vem depois de ${x}?`,
  (x: string) => `Qual é o próximo, depois de ${x}?`,
  (x: string) => `O que acontece em seguida, depois de ${x}?`,
  (x: string) => `Qual item vem logo após ${x}?`,
  (x: string) => `Depois de ${x}, vem o quê?`,
];

// ─── Progressão (10 níveis) ──────────────────────────────────────────────────────
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
function levelSpec(level: number) {
  const options = level <= 2 ? 3 : level <= 8 ? 4 : 5;
  const similar = level >= 4;            // distratores da MESMA sequência (mais plausíveis)
  const cats = level <= 2 ? SIMPLE_CATS
    : level <= 4 ? [...SIMPLE_CATS, ...MID_CATS]
    : level <= 6 ? [...SIMPLE_CATS, ...MID_CATS, ...HARD_CATS]
    : [...MID_CATS, ...HARD_CATS, ...SIMPLE_CATS];
  const lowFeedback = level <= 4;        // revela a resposta certa ao errar
  return { options, similar, cats, lowFeedback };
}
const TOTAL = 8;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

interface Trial { target: Item; dir: Direction; answer: Item; options: Item[]; command: string; cat: string; }
interface Hist { recentTargets: string[]; recentCats: string[]; lastAntes: number; lastDepois: number; dirHist: Direction[]; }

function buildTrial(level: number, h: Hist): Trial {
  const spec = levelSpec(level);
  // direção: evita 3 iguais seguidas
  let dir: Direction;
  const dh = h.dirHist;
  if (dh.length >= 2 && dh[dh.length - 1] === dh[dh.length - 2]) dir = dh[dh.length - 1] === "antes" ? "depois" : "antes";
  else dir = Math.random() < 0.5 ? "antes" : "depois";

  const pool = SEQS.filter((s) => spec.cats.includes(s.cat) && s.items.length >= 2);
  let cand = pool.filter((s) => !h.recentCats.slice(-2).includes(s.cat));
  if (!cand.length) cand = pool;

  let seq = cand[0], target: Item = seq.items[0], tIdx = 0;
  for (let tries = 0; tries < 20; tries++) {
    seq = cand[Math.floor(Math.random() * cand.length)];
    const n = seq.items.length;
    tIdx = dir === "antes" ? 1 + Math.floor(Math.random() * (n - 1)) : Math.floor(Math.random() * (n - 1));
    target = seq.items[tIdx];
    if (!h.recentTargets.includes(target.t)) break;
  }
  const answer = dir === "antes" ? seq.items[tIdx - 1] : seq.items[tIdx + 1];

  // distratores
  let dpool: Item[];
  if (spec.similar) {
    dpool = seq.items.filter((it) => it.t !== target.t && it.t !== answer.t);
    if (dpool.length < spec.options - 1) {
      const extra = SEQS.filter((s) => s.id !== seq.id).flatMap((s) => s.items).filter((it) => it.t !== answer.t && it.t !== target.t);
      dpool = [...dpool, ...shuffle(extra)];
    }
  } else {
    dpool = SEQS.filter((s) => s.cat !== seq.cat).flatMap((s) => s.items).filter((it) => it.t !== answer.t && it.t !== target.t);
  }
  const seen = new Set([answer.t, target.t]);
  const distractors: Item[] = [];
  for (const it of shuffle(dpool)) { if (!seen.has(it.t)) { seen.add(it.t); distractors.push(it); if (distractors.length >= spec.options - 1) break; } }
  const options = shuffle([answer, ...distractors]);

  // comando (variação, não repetir consecutiva)
  const cmds = dir === "antes" ? ANTES_CMDS : DEPOIS_CMDS;
  const last = dir === "antes" ? h.lastAntes : h.lastDepois;
  let ci = Math.floor(Math.random() * cmds.length);
  if (cmds.length > 1 && ci === last) ci = (ci + 1) % cmds.length;
  if (dir === "antes") h.lastAntes = ci; else h.lastDepois = ci;
  const command = cmds[ci](target.t);

  h.recentTargets = [target.t, ...h.recentTargets].slice(0, 3);
  h.recentCats = [...h.recentCats, seq.cat].slice(-4);
  h.dirHist = [...h.dirHist, dir].slice(-4);

  return { target, dir, answer, options, command, cat: seq.cat };
}

// ─── Render de um item (emoji grande, ou texto grande p/ números/letras) ─────────
function ItemView({ item, big }: { item: Item; big?: boolean }) {
  if (item.e) {
    return (
      <>
        <span style={{ fontSize: big ? 80 : 52, lineHeight: 1 }}>{item.e}</span>
        <span style={{ fontSize: big ? 20 : 14, fontWeight: 700, color: "#26324a", textAlign: "center", lineHeight: 1.1 }}>{item.t}</span>
      </>
    );
  }
  return <span style={{ fontSize: big ? 64 : 40, fontWeight: 900, color: "#26324a" }}>{item.t}</span>;
}

export function AntesDepois({ difficulty, onComplete }: AntesDepoisProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = levelSpec(startLevel);

  const histRef = useRef<Hist>({ recentTargets: [], recentCats: [], lastAntes: -1, lastDepois: -1, dirHist: [] });
  const [started, setStarted] = useState(false);
  const [trialNum, setTrialNum] = useState(0);
  const [trial, setTrial] = useState<Trial>(() => buildTrial(startLevel, histRef.current));
  const [picked, setPicked] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);

  const hits = useRef(0);
  const replays = useRef(0);
  const rts = useRef<number[]>([]);
  const cats = useRef<Set<string>>(new Set());
  const trialAt = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => { if (started) { trialAt.current = Date.now(); speak(trial.command); } }, [trial, started]);
  useEffect(() => () => stopSpeak(), []);

  const finish = useCallback(() => {
    const acc = hits.current / TOTAL;
    const meanRT = rts.current.length ? Math.round(rts.current.reduce((a, b) => a + b, 0) / rts.current.length) : null;
    onComplete({
      exerciseId: "antes-depois",
      domain: "attention",
      score: calculateExerciseScore("antes-depois", acc, meanRT ?? undefined, difficulty),
      accuracy: acc,
      reactionTime: meanRT ?? undefined,
      difficulty: startLevel,
      duration: Math.round((Date.now() - startTime.current) / 1000),
      metadata: {
        progressionV2: true,
        accTotal: Number(acc.toFixed(3)),
        level: startLevel,
        startedLevel: startLevel,
        options: spec.options,
        categories: Array.from(cats.current),
        trials: TOTAL,
        hits: hits.current,
        audioReplays: replays.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [difficulty, onComplete, startLevel, spec]);

  function nextTrial() {
    const n = trialNum + 1;
    reportProgress(Math.round((n / TOTAL) * 100));
    if (n >= TOTAL) { finish(); return; }
    setTrialNum(n); setReveal(false); setPicked(null);
    setTrial(buildTrial(startLevel, histRef.current));
  }

  function handlePick(opt: Item) {
    if (picked || reveal) return;
    rts.current.push(Date.now() - trialAt.current);
    cats.current.add(trial.cat);
    setPicked(opt.t);
    speak(opt.t);
    const correct = opt.t === trial.answer.t;
    if (correct) {
      hits.current++;
      setTimeout(nextTrial, 1700);
    } else if (spec.lowFeedback) {
      setTimeout(() => setReveal(true), 600);
      setTimeout(nextTrial, 2600);
    } else {
      setTimeout(nextTrial, 1700);
    }
  }
  function repeatAudio() { replays.current++; speak(trial.command); }

  const pct = Math.round((trialNum / TOTAL) * 100);
  const BG = "linear-gradient(180deg,#eef4fb 0%,#e6edf8 60%,#eef2fa 100%)";
  const isAntes = trial.dir === "antes";
  const dirColor = isAntes ? "#ea8a23" : "#0d9488";
  const dirBg = isAntes ? "#fef0dc" : "#d6f5ef";

  // ─── Tela inicial (curta) ───────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 22 }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 26, padding: "30px 24px", textAlign: "center", boxShadow: "0 20px 56px rgba(40,60,110,0.18)" }}>
          <div style={{ fontSize: 60, marginBottom: 8 }}>⬅️ ➡️</div>
          <h1 style={{ color: "#1e293b", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Antes e Depois</h1>
          <p style={{ color: "#5b6677", fontSize: 15, marginBottom: 22, lineHeight: 1.5 }}>
            Veja a figura ou palavra e escolha o que vem <b style={{ color: "#ea8a23" }}>antes</b> ou <b style={{ color: "#0d9488" }}>depois</b>.
          </p>
          <button onClick={() => { setStarted(true); speak(trial.command); }}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer",
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 6px 18px rgba(37,99,235,0.4)" }}>▶️ Começar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: BG, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "14px 18px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#1e293b" }}>Antes e Depois</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>Nível {startLevel} · {CAT_LABEL[trial.cat] ?? trial.cat}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#2563eb" }}>{Math.min(trialNum + 1, TOTAL)}/{TOTAL}</div>
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "#dbe4f0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#60a5fa)", borderRadius: 4, transition: "width .4s" }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 16px 18px", gap: 14 }}>
        {/* Badge de direção */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 100, background: dirBg, color: dirColor, fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>
          {isAntes ? "⬅️ ANTES" : "DEPOIS ➡️"}
        </div>

        {/* Card central (alvo) */}
        <div style={{ background: "#fff", border: "3px solid #dbe4f0", borderRadius: 26, padding: "18px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 200, boxShadow: "0 8px 26px rgba(40,60,110,0.12)" }}>
          <ItemView item={trial.target} big />
        </div>

        {/* Comando + áudio discreto */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 460 }}>
          <p style={{ color: "#1e293b", fontSize: 18, fontWeight: 800, textAlign: "center", flex: 1, lineHeight: 1.25 }}>{trial.command}</p>
          <button onClick={repeatAudio} title="Ouvir de novo"
            style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", border: "1px solid #cdd9ea", background: "#fff", color: "#2563eb", fontSize: 18, cursor: "pointer", boxShadow: "0 2px 6px rgba(40,60,110,0.1)" }}>🔊</button>
        </div>

        {/* Feedback visual */}
        <div style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnimatePresence mode="wait">
            {picked !== null && (
              <motion.span key={picked} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 16 }} style={{ fontSize: 38 }}>
                {picked === trial.answer.t ? "⭐" : "🔁"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Alternativas */}
        <div style={{ display: "grid", width: "100%", maxWidth: 520, gap: 12,
          gridTemplateColumns: trial.options.length <= 3 ? `repeat(${trial.options.length},1fr)` : trial.options.length === 4 ? "1fr 1fr" : "1fr 1fr 1fr" }}>
          {trial.options.map((opt) => {
            const isAnswer = opt.t === trial.answer.t;
            const isPicked = picked === opt.t;
            const correctPick = isPicked && isAnswer;
            const wrongPick = isPicked && !isAnswer;
            const highlightCorrect = reveal && isAnswer;
            const border = correctPick || highlightCorrect ? "#16a34a" : wrongPick ? "#dc2626" : "#dbe4f0";
            const bg = correctPick || highlightCorrect ? "#dcfce7" : wrongPick ? "#fee2e2" : "#fff";
            return (
              <motion.button key={opt.t} onClick={() => handlePick(opt)} disabled={picked !== null || reveal}
                whileTap={{ scale: 0.95 }} animate={highlightCorrect ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.5, repeat: highlightCorrect ? Infinity : 0 }}
                style={{ background: bg, border: `3px solid ${border}`, borderRadius: 20, padding: "16px 8px", minHeight: 120,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                  cursor: picked !== null || reveal ? "default" : "pointer", boxShadow: "0 4px 12px rgba(40,60,110,0.08)" }}>
                <ItemView item={opt} />
                {(correctPick || highlightCorrect) && <span style={{ fontSize: 20 }}>✅</span>}
                {wrongPick && <span style={{ fontSize: 20 }}>🔁</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
