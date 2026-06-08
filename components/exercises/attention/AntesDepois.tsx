"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { shuffle } from "@/lib/utils";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface AntesDepoisProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ─── Áudio: voz do próprio aparelho (Web Speech). Frases curtas e diretas. ──────
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.9;   // um pouco mais devagar — facilita a compreensão
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch { /* sem áudio — segue visual */ }
}
function stopSpeak() {
  try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
}

// ─── Conteúdo: ROTINAS concretas do cotidiano (em ordem: primeiro → último) ─────
type Direction = "antes" | "depois";
interface Scene { key: string; emoji: string; label: string; }
interface Routine { id: string; scenes: Scene[]; }

const ROUTINES: Routine[] = [
  { id: "maos",   scenes: [{ key: "maos-sujas", emoji: "🖐️", label: "Mãos sujas" }, { key: "lavar-maos", emoji: "🚰", label: "Lavar as mãos" }, { key: "maos-limpas", emoji: "✨", label: "Mãos limpas" }] },
  { id: "dentes", scenes: [{ key: "dente-sujo", emoji: "🦠", label: "Dentes sujos" }, { key: "escovar", emoji: "🪥", label: "Escovar os dentes" }, { key: "sorriso", emoji: "😁", label: "Boca limpa" }] },
  { id: "ovo",    scenes: [{ key: "ovo", emoji: "🥚", label: "Ovo" }, { key: "choca", emoji: "🐣", label: "Pintinho nascendo" }, { key: "pinto", emoji: "🐤", label: "Pintinho" }] },
  { id: "planta", scenes: [{ key: "semente", emoji: "🌰", label: "Semente" }, { key: "broto", emoji: "🌱", label: "Plantinha" }, { key: "flor", emoji: "🌻", label: "Flor" }] },
  { id: "manha",  scenes: [{ key: "acordar", emoji: "🛌", label: "Acordar" }, { key: "escovar2", emoji: "🪥", label: "Escovar os dentes" }, { key: "cafe", emoji: "☕", label: "Tomar café" }] },
  { id: "pao",    scenes: [{ key: "pao", emoji: "🍞", label: "Pão" }, { key: "torrar", emoji: "🔥", label: "Torrar o pão" }, { key: "torrada", emoji: "🥪", label: "Torrada" }] },
  { id: "banho",  scenes: [{ key: "suado", emoji: "😓", label: "Suado" }, { key: "banho", emoji: "🚿", label: "Tomar banho" }, { key: "cheiroso", emoji: "🧼", label: "Limpo e cheiroso" }] },
];

const DISTRACTORS: Scene[] = [
  { key: "dormir", emoji: "😴", label: "Dormir" },
  { key: "comer", emoji: "🍽️", label: "Comer" },
  { key: "brincar", emoji: "⚽", label: "Brincar" },
  { key: "tv", emoji: "📺", label: "Ver televisão" },
  { key: "passear", emoji: "🚶", label: "Passear" },
  { key: "desenhar", emoji: "🖍️", label: "Desenhar" },
];

const TOTAL = 8;

interface Trial {
  target: Scene;
  direction: Direction;
  answer: Scene;
  options: Scene[];
  command: string;
}

function buildTrial(): Trial {
  const routine = ROUTINES[Math.floor(Math.random() * ROUTINES.length)];
  const n = routine.scenes.length;
  const direction: Direction = Math.random() < 0.5 ? "antes" : "depois";
  const targetIdx = direction === "antes"
    ? 1 + Math.floor(Math.random() * (n - 1))   // 1..n-1 (tem cena anterior)
    : Math.floor(Math.random() * (n - 1));      // 0..n-2 (tem cena posterior)
  const target = routine.scenes[targetIdx];
  const answer = direction === "antes" ? routine.scenes[targetIdx - 1] : routine.scenes[targetIdx + 1];
  const pool = [...DISTRACTORS, ...ROUTINES.filter(r => r.id !== routine.id).flatMap(r => r.scenes)]
    .filter(s => s.key !== answer.key && s.key !== target.key);
  const options = shuffle([answer, ...shuffle(pool).slice(0, 2)]);
  const command = direction === "antes"
    ? `O que vem antes de ${target.label.toLowerCase()}?`
    : `O que vem depois de ${target.label.toLowerCase()}?`;
  return { target, direction, answer, options, command };
}

export function AntesDepois({ difficulty, theme, onComplete }: AntesDepoisProps) {
  const reportProgress = useExerciseProgress();
  const isGamified = theme === "GAMIFIED";

  const [started, setStarted] = useState(false);
  const [trialNum, setTrialNum] = useState(0);
  const [trial, setTrial] = useState<Trial>(() => buildTrial());
  const [picked, setPicked] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false); // mostra a resposta certa em destaque

  const hits = useRef(0);
  const attempts = useRef(0);
  const replays = useRef(0);
  const wrongInTrial = useRef(0);
  const startTime = useRef(Date.now());

  // Narra o comando automaticamente ao entrar em cada pergunta
  useEffect(() => {
    if (started) speak(trial.command);
  }, [trial, started]);

  useEffect(() => () => stopSpeak(), []);

  const finish = useCallback(() => {
    const acc = hits.current / TOTAL;
    onComplete({
      exerciseId: "antes-depois",
      domain: "attention",
      score: calculateExerciseScore("antes-depois", acc, undefined, difficulty),
      accuracy: acc,
      difficulty,
      duration: Math.round((Date.now() - startTime.current) / 1000),
      metadata: { level: 1, trials: TOTAL, hits: hits.current, attempts: attempts.current, audioReplays: replays.current },
    });
  }, [difficulty, onComplete]);

  function nextTrial() {
    const n = trialNum + 1;
    reportProgress(Math.round((n / TOTAL) * 100));
    if (n >= TOTAL) { finish(); return; }
    wrongInTrial.current = 0;
    setTrialNum(n);
    setReveal(false);
    setPicked(null);
    setTrial(buildTrial());
  }

  function handlePick(opt: Scene) {
    if (picked || reveal) return;
    attempts.current++;
    speak(opt.label);
    if (opt.key === trial.answer.key) {
      hits.current++;
      setPicked(opt.key);
      setTimeout(() => speak("Muito bem! Você acertou."), 600);
      setTimeout(nextTrial, 2400);
    } else {
      wrongInTrial.current++;
      setPicked(opt.key);
      setTimeout(() => speak("Vamos tentar de novo."), 600);
      if (wrongInTrial.current >= 2) {
        // mostra a resposta certa com destaque + áudio explicativo
        setTimeout(() => { setReveal(true); speak(`A resposta certa é: ${trial.answer.label}.`); }, 1700);
        setTimeout(nextTrial, 4200);
      } else {
        setTimeout(() => setPicked(null), 1600);
      }
    }
  }

  function repeatAudio() { replays.current++; speak(trial.command); }

  // ─── Cores (alto contraste; teal no tema infantil) ───────────────────────────
  const C = isGamified
    ? { bg: "#0b1220", card: "#16223a", text: "#e8eefc", accent: "#22d3ee", accentText: "#06283d", border: "#2a3a5a" }
    : theme === "COLORFUL"
    ? { bg: "#e8fbf6", card: "#ffffff", text: "#134e4a", accent: "#0d9488", accentText: "#ffffff", border: "#99e9dd" }
    : { bg: "#f1f5f9", card: "#ffffff", text: "#1e293b", accent: "#2563eb", accentText: "#ffffff", border: "#cbd5e1" };

  // ─── Tela inicial (com áudio) ────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 24 }}>
        <div style={{ fontSize: 96 }}>⏳➡️</div>
        <h1 style={{ color: C.text, fontSize: 30, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>Antes e Depois</h1>
        <p style={{ color: C.text, fontSize: 20, textAlign: "center", maxWidth: 360, opacity: 0.85 }}>
          Olhe a figura e escolha o que vem <b>antes</b> ou <b>depois</b>.
        </p>
        <button
          onClick={() => { setStarted(true); speak("Vamos começar! Olhe a figura e escolha a resposta certa."); }}
          style={{ background: C.accent, color: C.accentText, fontSize: 26, fontWeight: 800, border: "none", borderRadius: 22, padding: "20px 48px", minHeight: 76, cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}
        >
          ▶️ Começar
        </button>
      </div>
    );
  }

  const showResult = picked !== null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 28px" }}>
      {/* progresso simples (pontos grandes) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, marginTop: 4 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < trialNum ? C.accent : i === trialNum ? C.accent : C.border, opacity: i <= trialNum ? 1 : 0.5 }} />
        ))}
      </div>

      {/* Cena-alvo grande */}
      <div style={{ background: C.card, border: `3px solid ${C.border}`, borderRadius: 28, padding: "18px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 220, boxShadow: "0 4px 18px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 86, lineHeight: 1 }}>{trial.target.emoji}</div>
        <div style={{ color: C.text, fontSize: 22, fontWeight: 700 }}>{trial.target.label}</div>
      </div>

      {/* Comando + botão repetir áudio */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", maxWidth: 440 }}>
        <p style={{ color: C.text, fontSize: 24, fontWeight: 800, textAlign: "center", flex: 1, lineHeight: 1.2 }}>
          {trial.command}
        </p>
        <button onClick={repeatAudio} aria-label="Repetir o comando" title="Ouvir de novo"
          style={{ flexShrink: 0, background: C.accent, color: C.accentText, border: "none", borderRadius: "50%", width: 60, height: 60, fontSize: 28, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
          🔊
        </button>
      </div>

      {/* Alternativas (imagens grandes + rótulo + áudio ao tocar) */}
      <div style={{ display: "grid", gridTemplateColumns: trial.options.length >= 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 14, width: "100%", maxWidth: 520 }}>
        <AnimatePresence>
          {trial.options.map((opt) => {
            const isAnswer = opt.key === trial.answer.key;
            const isPicked = picked === opt.key;
            const correctPick = isPicked && isAnswer;
            const wrongPick = isPicked && !isAnswer;
            const highlightCorrect = reveal && isAnswer;
            const borderColor = correctPick || highlightCorrect ? "#16a34a" : wrongPick ? "#dc2626" : C.border;
            const bg = correctPick || highlightCorrect ? "#dcfce7" : wrongPick ? "#fee2e2" : C.card;
            return (
              <motion.button
                key={opt.key}
                onClick={() => handlePick(opt)}
                disabled={showResult || reveal}
                animate={highlightCorrect ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 0.5, repeat: highlightCorrect ? Infinity : 0 }}
                style={{
                  background: bg, border: `4px solid ${borderColor}`, borderRadius: 22,
                  padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  cursor: showResult || reveal ? "default" : "pointer", minHeight: 130,
                }}
              >
                <span style={{ fontSize: 60, lineHeight: 1 }}>{opt.emoji}</span>
                <span style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: "center", lineHeight: 1.1 }}>{opt.label}</span>
                {(correctPick || highlightCorrect) && <span style={{ fontSize: 22 }}>✅</span>}
                {wrongPick && <span style={{ fontSize: 22 }}>🔁</span>}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
