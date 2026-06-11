"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, UtensilsCrossed, ChefHat, Star, ClipboardList, CheckCircle2 } from "lucide-react";
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
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#3f2818 0%,#5e3c24 32%,#6f4a2e 60%,#3c2616 100%)" }} />
      {/* janelas claras à direita */}
      <div style={{ position: "absolute", right: 0, top: 0, width: "36%", height: "100%",
        background: "linear-gradient(180deg, rgba(205,218,228,0.55), rgba(150,168,182,0.22) 70%, transparent)", filter: "blur(20px)" }} />
      {/* plantas à direita */}
      <div style={{ position: "absolute", right: "6%", bottom: "8%", width: 120, height: 150,
        background: "radial-gradient(circle, rgba(70,110,60,0.5), transparent 70%)", filter: "blur(16px)" }} />
      {/* balcão/bar escuro à esquerda */}
      <div style={{ position: "absolute", left: 0, top: "44%", width: "44%", height: "56%",
        background: "linear-gradient(180deg, rgba(36,22,12,0.55), rgba(22,13,7,0.72))", filter: "blur(16px)" }} />
      {/* lâmpadas pendentes */}
      {bulb("12%", 70)}{bulb("21%", 120)}{bulb("30%", 55)}
      {/* bokeh quente */}
      <div style={{ position: "absolute", left: "46%", top: "16%", width: 70, height: 70, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,200,120,0.35), transparent 70%)", filter: "blur(10px)" }} />
      {/* vinheta */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, transparent 32%, rgba(18,10,4,0.5))" }} />
    </div>
  );
}

// ── HUD verde-petróleo ───────────────────────────────────────────────────────────
function Hud({ level, pct }: { level: number; pct: number }) {
  return (
    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 14, padding: "9px 16px",
      background: "linear-gradient(90deg,#0d3a3c,#11514f)", borderBottom: "1px solid rgba(120,180,175,0.18)",
      boxShadow: "0 2px 14px rgba(5,25,24,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(120,200,190,0.16)",
          border: "1px solid rgba(140,215,205,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChefHat size={21} color="#bff0e6" />
        </div>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: 0.5 }}>RESTAURANTE</span>
        <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.18)" }} />
        <span style={{ padding: "3px 12px", borderRadius: 100, background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", color: "#cfeee8", fontWeight: 800, fontSize: 12 }}>NÍVEL {level}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, justifyContent: "flex-end", minWidth: 0 }}>
        <Star size={18} color="#f5b740" fill="#f5b740" />
        <div style={{ flex: "0 1 220px", height: 8, borderRadius: 5, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f0a836,#f5c45e)", borderRadius: 5, transition: "width .4s" }} />
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, minWidth: 38, textAlign: "right" }}>{pct}%</span>
      </div>
    </div>
  );
}

// ── Bandeja de madeira ───────────────────────────────────────────────────────────
function Tray({ items }: { items: Item[] }) {
  return (
    <div style={{ borderRadius: 22, padding: 9, background: "linear-gradient(135deg,#7a5230,#5c3c20)",
      boxShadow: "0 10px 26px rgba(50,30,12,0.4), inset 0 2px 3px rgba(255,220,170,0.3)" }}>
      <div style={{ minHeight: 86, borderRadius: 15, background: "linear-gradient(180deg,#3a2415,#2a1a0e)",
        boxShadow: "inset 0 3px 10px rgba(0,0,0,0.55)", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 10, flexWrap: "wrap", padding: "10px 12px" }}>
        {items.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.5 }}>
            <UtensilsCrossed size={26} color="#d9b88f" />
            <span style={{ color: "#d9b88f", fontSize: 11, fontWeight: 800, letterSpacing: 3 }}>BANDEJA</span>
          </div>
        ) : items.map((it, i) => (
          <motion.div key={i} initial={{ scale: 0.5, y: -16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: 56, height: 62, borderRadius: 13, background: "rgba(255,238,210,0.95)", boxShadow: "0 4px 10px rgba(0,0,0,0.35)" }}>
            <span style={{ position: "absolute", top: -7, left: -7, width: 20, height: 20, borderRadius: "50%",
              background: "#11514f", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ fontSize: 30, lineHeight: 1 }}>{it.e}</span>
          </motion.div>
        ))}
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
    : "Monte na ordem do pedido.";

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
  const subtitle = `Nível ${startLevel} · ${spec.count} itens · ${MODE_LABEL[spec.mode]} · ${spec.audio ? "áudio" : "texto"}`;

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
        <Hud level={startLevel} pct={pct} />

        <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "18px 16px" }}>
          <div style={{ width: "100%", maxWidth: 560, background: "#f6efe0", borderRadius: 26, padding: "20px 20px 16px",
            boxShadow: "0 22px 60px rgba(30,18,8,0.45)" }}>

            {/* cabeçalho do card */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "rgba(17,81,79,0.12)",
                border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UtensilsCrossed size={24} color="#11514f" />
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 19, fontWeight: 900, color: "#2a2018" }}>Restaurante</div>
                <div style={{ fontSize: 12.5, color: "#9a8f7e" }}>{subtitle}</div>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: "#e6ddca", overflow: "hidden", marginBottom: 18 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f0a836,#f5c45e)", borderRadius: 4, transition: "width .4s" }} />
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
                <p style={{ textAlign: "center", fontSize: 15, fontWeight: 800, color: "#2a2018" }}>{modeHint}</p>
                <Tray items={tray} />
                {tray.length > 0 && (
                  <button onClick={undo} style={{ alignSelf: "center", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 10,
                    background: "#ece3d1", color: "#6b6052", border: "none", cursor: "pointer" }}>↩ desfazer</button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {keys.map((it, i) => {
                    const used = tray.some((x) => x.n === it.n);
                    return (
                      <motion.button key={`${it.n}-${i}`} onClick={() => place(it)} disabled={used} whileTap={{ scale: 0.92 }}
                        style={{ height: 78, borderRadius: 16, cursor: used ? "default" : "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                          background: "#fffdf7", border: "1px solid #e6ddca", boxShadow: used ? "none" : "0 3px 8px rgba(120,90,50,0.12)",
                          opacity: used ? 0.32 : 1, transition: "opacity .2s" }}>
                        <span style={{ fontSize: 30, lineHeight: 1 }}>{it.e}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#5c5345" }}>{it.n}</span>
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
                {correctRef.current} certos
              </span>
            </div>
          </div>
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
