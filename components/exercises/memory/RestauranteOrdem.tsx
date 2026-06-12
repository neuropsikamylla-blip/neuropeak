"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, UtensilsCrossed, ChefHat, ClipboardList, CheckCircle2, BarChart3, Package, ArrowRight, MessageSquare } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface RestauranteOrdemProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

interface Item { n: string; e: string; art: "o" | "a"; }
const ITEMS: Item[] = [
  { n: "água", e: "💧", art: "a" }, { n: "suco", e: "🧃", art: "o" },
  { n: "café", e: "☕", art: "o" }, { n: "chá", e: "🍵", art: "o" },
  { n: "sanduíche", e: "🥪", art: "o" }, { n: "salada", e: "🥗", art: "a" },
  { n: "sopa", e: "🍲", art: "a" }, { n: "bolo", e: "🍰", art: "o" },
  { n: "maçã", e: "🍎", art: "a" }, { n: "pão", e: "🍞", art: "o" },
  { n: "queijo", e: "🧀", art: "o" }, { n: "garfo", e: "🍴", art: "o" },
  { n: "colher", e: "🥄", art: "a" }, { n: "prato", e: "🍽️", art: "o" },
  { n: "copo", e: "🥤", art: "o" },
];

type Mode = "direta" | "inversa" | "exclusao";
interface RLevel { count: number; mode: Mode; audio: boolean; distractors: number; }
const R_LEVELS: Record<number, RLevel> = {
  1:  { count: 2, mode: "direta",   audio: false, distractors: 2 },
  2:  { count: 3, mode: "direta",   audio: false, distractors: 2 },
  3:  { count: 4, mode: "direta",   audio: false, distractors: 3 },
  4:  { count: 3, mode: "direta",   audio: true,  distractors: 3 },
  5:  { count: 4, mode: "direta",   audio: true,  distractors: 4 },
  6:  { count: 3, mode: "inversa",  audio: false, distractors: 3 },
  7:  { count: 4, mode: "inversa",  audio: true,  distractors: 4 },
  8:  { count: 4, mode: "exclusao", audio: false, distractors: 4 },
  9:  { count: 5, mode: "exclusao", audio: true,  distractors: 5 },
  10: { count: 5, mode: "inversa",  audio: true,  distractors: 6 },
};
const MODE_LABEL: Record<Mode, string> = { direta: "direta", inversa: "inversa", exclusao: "exclusão" };
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 6;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function listText(items: Item[]): string {
  const p = items.map((it) => `${it.art} ${it.n}`);
  return p.length === 1 ? p[0] : p.slice(0, -1).join(", ") + " e " + p[p.length - 1];
}
function pickPtBrVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const pool = voices.filter(v => /pt[-_]?BR/i.test(v.lang) || /portugu/i.test(v.name) || /^pt/i.test(v.lang));
  if (!pool.length) return null;
  const prefer = ["luciana", "google português do brasil", "google portugues do brasil", "francisca", "maria", "fernanda", "felipe", "daniel"];
  for (const name of prefer) { const v = pool.find(v => v.name.toLowerCase().includes(name)); if (v) return v; }
  return pool[0];
}
function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setTimeout(resolve, 1200); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR"; u.rate = 0.9; u.pitch = 1.0;
      const v = pickPtBrVoice(); if (v) u.voice = v;
      u.onend = () => resolve(); u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
      setTimeout(resolve, Math.max(2500, text.length * 90));
    } catch { setTimeout(resolve, 1200); }
  });
}

type Phase = "ready" | "order" | "input" | "feedback";

// ── Fundo de restaurante (recriado via CSS) ─────────────────────────────────────
function RestaurantBg() {
  const bulb = (left: string, cord: number) => (
    <div style={{ position: "absolute", left, top: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 2, height: cord, background: "rgba(40,28,18,0.6)" }} />
      <div style={{ width: 44, height: 44, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 40%, rgba(255,224,150,0.95), rgba(255,180,80,0.4) 55%, transparent 72%)", filter: "blur(2px)" }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#7a5636 0%,#9a7350 32%,#a9805a 60%,#7c5838 100%)" }} />
      {/* janelas claras à direita */}
      <div style={{ position: "absolute", right: 0, top: 0, width: "34%", height: "100%",
        background: "linear-gradient(180deg, rgba(220,230,238,0.6), rgba(180,196,210,0.3) 70%, transparent)", filter: "blur(22px)" }} />
      {/* plantas à direita */}
      <div style={{ position: "absolute", right: "5%", bottom: "8%", width: 130, height: 160,
        background: "radial-gradient(circle, rgba(90,135,75,0.5), transparent 70%)", filter: "blur(16px)" }} />
      {/* balcão/bar à esquerda */}
      <div style={{ position: "absolute", left: 0, top: "46%", width: "42%", height: "54%",
        background: "linear-gradient(180deg, rgba(70,46,26,0.4), rgba(50,32,16,0.55))", filter: "blur(16px)" }} />
      {/* lâmpadas pendentes */}
      {bulb("12%", 70)}{bulb("21%", 120)}{bulb("30%", 55)}
      {/* bokeh quente */}
      <div style={{ position: "absolute", left: "46%", top: "14%", width: 80, height: 80, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,210,140,0.4), transparent 70%)", filter: "blur(10px)" }} />
      {/* leve profundidade (vinheta suave) */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(40,24,10,0.32))" }} />
    </div>
  );
}

// ── Chip (cápsula do cabeçalho) ──────────────────────────────────────────────────
function Chip({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 100,
      background: `${color}1a`, border: `1px solid ${color}40`, color, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>
      {icon}{text}
    </span>
  );
}

// ── Bandeja de restaurante realista (nogueira + alças de latão) ──────────────────
// Sem slots/pontilhado/texto — bandeja limpa; os itens aparecem em ordem nela.
function Tray({ items }: { items: Item[] }) {
  const Handle = ({ side }: { side: "left" | "right" }) => (
    <div style={{ position: "absolute", top: "50%", [side]: -15, transform: "translateY(-50%)", width: 30, height: 50, zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "45%", border: "5px solid #c8a24e",
        boxShadow: "0 2px 6px rgba(50,30,8,0.4), inset 0 1px 2px rgba(255,238,190,0.7)" }} />
    </div>
  );
  return (
    <div style={{ position: "relative", margin: "0 20px" }}>
      <Handle side="left" /><Handle side="right" />
      {/* rim/moldura de nogueira */}
      <div style={{ position: "relative", zIndex: 1, borderRadius: 22, padding: 13,
        background: "linear-gradient(160deg,#7a5230 0%,#5c3d22 55%,#492f18 100%)",
        boxShadow: "0 16px 36px rgba(50,30,10,0.4), inset 0 2px 3px rgba(255,228,185,0.3), inset 0 -3px 7px rgba(30,18,6,0.55)" }}>
        {/* poço interno (madeira com grão sutil) */}
        <div style={{ minHeight: 104, borderRadius: 15,
          backgroundImage: "repeating-linear-gradient(96deg, rgba(255,220,170,0.045) 0 2px, transparent 2px 8px), linear-gradient(160deg,#62431f,#49321a)",
          boxShadow: "inset 0 5px 16px rgba(18,10,3,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "14px 16px" }}>
          {items.map((it, i) => (
            <motion.div key={i} initial={{ scale: 0.4, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 440, damping: 22 }}
              style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                background: "radial-gradient(circle at 50% 36%, #ffffff, #efe6d2)", boxShadow: "0 5px 12px rgba(15,9,3,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>
              {it.e}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const spec = R_LEVELS[startLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [order, setOrder] = useState<Item[]>([]);
  const [excluded, setExcluded] = useState<Item | null>(null);
  const [expected, setExpected] = useState<Item[]>([]);
  const [sentence, setSentence] = useState("");
  const [keys, setKeys] = useState<Item[]>([]);
  const [tray, setTray] = useState<Item[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const trayRef = useRef<Item[]>([]);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);

  const modeHint = spec.mode === "inversa" ? "Monte começando pelo ÚLTIMO item (ordem inversa)."
    : spec.mode === "exclusao" ? "NÃO coloque o item que o pedido mandou ignorar."
    : "Monte o pedido na ordem correta.";

  const startRound = useCallback(async () => {
    runRef.current++; const myRun = runRef.current;
    const picks = shuffle(ITEMS).slice(0, spec.count);
    let exc: Item | null = null;
    let exp: Item[];
    if (spec.mode === "exclusao") {
      exc = picks[1 + Math.floor(Math.random() * (picks.length - 1))];
      exp = picks.filter((x) => x.n !== exc!.n);
    } else if (spec.mode === "inversa") {
      exp = [...picks].reverse();
    } else exp = picks;
    const sent = spec.mode === "exclusao"
      ? `Pegue ${listText(picks)}, mas NÃO coloque ${exc!.art} ${exc!.n}.`
      : `Pegue ${listText(picks)}.`;
    const distract = shuffle(ITEMS.filter((x) => !picks.some((p) => p.n === x.n))).slice(0, spec.distractors);

    setOrder(picks); setExcluded(exc); setExpected(exp); setSentence(sent);
    setKeys(shuffle([...picks, ...distract]));
    setTray([]); trayRef.current = [];
    setFeedback(null);
    setPhase("order");

    if (spec.audio) {
      setSpeaking(true);
      await speak(sent);
      if (runRef.current !== myRun) return;
      setSpeaking(false);
    }
  }, [spec]);

  const finish = useCallback(() => {
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "restaurante-ordem",
      domain: "memory",
      score: calculateExerciseScore("span-numerico", accTotal, meanRT ?? undefined, difficulty),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: startLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        level: startLevel,
        startedLevel: startLevel,
        items: spec.count,
        rule: spec.mode,
        presentation: spec.audio ? "auditiva" : "visual",
        distractors: spec.distractors,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, difficulty, startLevel, spec]);

  const validate = useCallback((picks: Item[]) => {
    const correct = picks.map((x) => x.n).join("·") === expected.map((x) => x.n).join("·");
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, correct ? 1400 : 2600);
  }, [expected, trial, reportProgress, startRound, finish]);

  function place(it: Item) {
    if (phase !== "input" || trayRef.current.some((x) => x.n === it.n)) return;
    const next = [...trayRef.current, it];
    trayRef.current = next; setTray(next);
    if (next.length >= expected.length) setTimeout(() => validate(next), 250);
  }
  function undo() {
    if (phase !== "input") return;
    const next = trayRef.current.slice(0, -1);
    trayRef.current = next; setTray(next);
  }
  function goInput() { inputAt.current = Date.now(); setPhase("input"); }

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);
  function begin() { correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0); startRound(); }

  const pct = Math.round((trial / TRIALS) * 100);
  const orderPct = expected.length ? Math.round((tray.length / expected.length) * 100) : 0;
  const shake = phase === "feedback" && feedback === "incorrect";

  // ── READY ──
  if (phase === "ready") {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#3c2616" }}>
        <RestaurantBg />
        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div style={{ width: "100%", maxWidth: 440, background: "#f6efe0", borderRadius: 26, padding: "26px 22px",
            textAlign: "center", boxShadow: "0 22px 60px rgba(30,18,8,0.45)" }}>
            <div style={{ margin: "0 auto 14px", width: 70, height: 70, borderRadius: "50%",
              background: "rgba(17,81,79,0.12)", border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat size={36} color="#11514f" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2a2018", marginBottom: 6 }}>Restaurante</h2>
            <p style={{ fontSize: 13.5, color: "#6b6052", marginBottom: 6 }}>
              Leia ou ouça o pedido e monte a bandeja na ordem certa.
            </p>
            <p style={{ fontSize: 12, color: "#9a8f7e", marginBottom: 20 }}>
              Você começa no nível {startLevel} ({spec.count} itens · {MODE_LABEL[spec.mode]}) — onde parou.
            </p>
            <button onClick={begin} style={{ width: "100%", height: 52, borderRadius: 16, border: "none",
              background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 6px 18px rgba(13,58,60,0.4)" }}>Começar →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#3c2616" }}>
      <RestaurantBg />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 16px" }}>
          <motion.div animate={shake ? { x: [0, -9, 9, -7, 7, 0] } : { x: 0 }} transition={{ duration: 0.45 }}
            style={{ width: "100%", maxWidth: 600, background: "#faf3e6", borderRadius: 28, padding: "22px 22px 16px",
            boxShadow: "0 26px 64px rgba(30,18,8,0.4)" }}>

            {/* cabeçalho do card */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: "rgba(17,81,79,0.12)",
                border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UtensilsCrossed size={26} color="#11514f" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2a2018", marginBottom: 6 }}>Restaurante</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Chip icon={<BarChart3 size={13} />} text={`Nível ${startLevel}`} color="#1d7a6e" />
                  <Chip icon={<Package size={13} />} text={`${spec.count} itens`} color="#e0892a" />
                  <Chip icon={<ArrowRight size={13} />} text={`Ordem ${MODE_LABEL[spec.mode]}`} color="#2563eb" />
                  <Chip icon={spec.audio ? <Volume2 size={13} /> : <MessageSquare size={13} />} text={spec.audio ? "Áudio" : "Texto"} color="#7c5cf0" />
                </div>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#ece0c8", overflow: "hidden", marginBottom: 18 }}>
              <div style={{ height: "100%", width: `${orderPct}%`, background: "linear-gradient(90deg,#f0a836,#f5c45e)", borderRadius: 4, transition: "width .4s" }} />
            </div>

            {/* ── ORDER (apresentar pedido) ── */}
            {phase === "order" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1d7a6e", textTransform: "uppercase", letterSpacing: 1 }}>📋 Pedido do cliente</span>
                {spec.audio ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <motion.div animate={{ scale: speaking ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.7, repeat: speaking ? Infinity : 0 }}
                      style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(17,81,79,0.1)", border: "1px solid rgba(17,81,79,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Volume2 size={36} color="#11514f" />
                    </motion.div>
                    <button onClick={() => speak(sentence)} style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 12,
                      background: "rgba(17,81,79,0.1)", border: "1px solid rgba(17,81,79,0.3)", color: "#11514f", cursor: "pointer" }}>🔊 Ouvir de novo</button>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", fontSize: 19, fontWeight: 800, color: "#2a2018", padding: "16px 18px", borderRadius: 16,
                    background: "rgba(17,81,79,0.07)", border: "1px solid rgba(17,81,79,0.18)" }}>{sentence}</p>
                )}
                <p style={{ fontSize: 12.5, color: "#9a8f7e", textAlign: "center" }}>{modeHint}</p>
                <button onClick={goInput} style={{ width: "100%", height: 50, borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(13,58,60,0.35)" }}>Montar bandeja →</button>
              </div>
            )}

            {/* ── INPUT (montar bandeja) ── */}
            {phase === "input" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ textAlign: "center", fontSize: 15.5, fontWeight: 800, color: "#2a2018" }}>{modeHint}</p>
                <Tray items={tray} />
                {tray.length > 0 && (
                  <button onClick={undo} style={{ alignSelf: "center", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 10,
                    background: "#ece3d1", color: "#6b6052", border: "none", cursor: "pointer" }}>↩ desfazer</button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(keys.length, 4)}, 1fr)`, gap: 11 }}>
                  {keys.map((it, i) => {
                    const used = tray.some((x) => x.n === it.n);
                    return (
                      <motion.button key={`${it.n}-${i}`} onClick={() => place(it)} disabled={used} whileTap={{ scale: 0.93 }}
                        style={{ borderRadius: 18, cursor: used ? "default" : "pointer", padding: "12px 6px 10px",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
                          background: used ? "#eef6f4" : "#fffdf7", border: used ? "2px solid #2f9e8f" : "1.5px solid #ece0c8",
                          boxShadow: used ? "0 2px 8px rgba(47,158,143,0.18)" : "0 4px 12px rgba(120,90,50,0.12)",
                          transition: "all .2s" }}>
                        <span style={{ width: 58, height: 58, borderRadius: "50%", position: "relative",
                          background: "radial-gradient(circle at 50% 38%, #ffffff, #f0e7d4)", boxShadow: "inset 0 2px 5px rgba(150,110,60,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
                          {it.e}
                          {used && <span style={{ position: "absolute", top: -3, right: -3, width: 20, height: 20, borderRadius: "50%",
                            background: "#2f9e8f", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: used ? "#1d7a6e" : "#4a4234" }}>{it.n}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FEEDBACK ── */}
            {phase === "feedback" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "18px 0" }}>
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 54 }}>
                  {feedback === "correct" ? "✅" : "❌"}
                </motion.div>
                <p style={{ fontSize: 22, fontWeight: 900, color: feedback === "correct" ? "#1d7a6e" : "#c2463a" }}>
                  {feedback === "correct" ? "Pedido certo!" : "Pedido errado"}
                </p>
                {feedback === "incorrect" && startLevel <= 5 && (
                  <div style={{ textAlign: "center", marginTop: 2 }}>
                    <p style={{ fontSize: 13, color: "#9a8f7e", marginBottom: 4 }}>Ordem correta:</p>
                    <p style={{ fontSize: 30 }}>{expected.map((x) => x.e).join("  ")}</p>
                    <p style={{ fontSize: 15, color: "#9a8f7e", marginTop: 4 }}>Você: {tray.map((x) => x.e).join(" ") || "—"}</p>
                  </div>
                )}
              </div>
            )}

            {/* rodapé */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12,
              borderTop: "1px solid #e6ddca" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#9a8f7e" }}>
                <ClipboardList size={15} color="#a89a82" />
                Pedido <span style={{ color: "#e0892a", fontWeight: 900 }}>{Math.min(trial + 1, TRIALS)}/{TRIALS}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#1d7a6e" }}>
                <CheckCircle2 size={15} color="#1d7a6e" />
                Acertos: {correctRef.current}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* progresso da sessão (flutuante) */}
      <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 3, display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", borderRadius: 14, background: "rgba(246,239,224,0.95)", border: "1px solid rgba(180,150,110,0.4)",
        boxShadow: "0 6px 18px rgba(30,18,8,0.28)" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(17,81,79,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🧠</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9a8f7e", textTransform: "uppercase", letterSpacing: 0.5 }}>Progresso da sessão</div>
          <div style={{ width: 120, height: 6, background: "#e6ddca", borderRadius: 4, marginTop: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f0a836,#f5c45e)", borderRadius: 4, transition: "width .4s" }} />
          </div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 900, color: "#e0892a" }}>{pct}%</span>
      </div>
    </div>
  );
}
