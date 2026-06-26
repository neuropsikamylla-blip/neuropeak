"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface NBackProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Parâmetros ────────────────────────────────────────────────────────────────
const LETTERS = ["A", "B", "C", "E", "F", "H", "K", "L", "M", "P", "R", "T"];
const BLOCK_LEN = 14;        // estímulos que pedem resposta, por bloco
const TARGET_RATIO = 0.42;   // ~42% são "iguais" (equilíbrio anti-chute)
const MIN_N = 1;
const MAX_N = 4;
const GOOD_ACC = 0.8;        // bloco "bom" → ≥80% de acertos
const STIM_MS = 2200;        // janela para ver a letra e responder
const PRIME_MS = 1100;       // exibição de cada letra de "memorização" (priming)
const FEEDBACK_MS = 520;
const BLANK_MS = 320;

function initialN(difficulty: number) {
  return Math.min(Math.max(MIN_N, Math.floor(difficulty * 0.3) + 1), 3);
}
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// Gera um bloco: n letras de "memorização" + BLOCK_LEN estímulos ativos.
function genBlock(n: number) {
  const seq: string[] = [];
  for (let i = 0; i < n; i++) seq.push(rand(LETTERS));
  const match: boolean[] = [];
  for (let i = 0; i < BLOCK_LEN; i++) {
    const nBack = seq[seq.length - n];
    let letter: string;
    if (Math.random() < TARGET_RATIO) {
      letter = nBack;
      match.push(true);
    } else {
      do { letter = rand(LETTERS); } while (letter === nBack);
      match.push(false);
    }
    seq.push(letter);
  }
  return { seq, match };
}

// ── Tutorial ──────────────────────────────────────────────────────────────────
// Conteúdo estático: libera o botão "Próximo" do TutorialBase ao montar.
function StepReady({ onReady, children }: { onReady: () => void; children: React.ReactNode }) {
  useEffect(() => { onReady(); }, [onReady]);
  return <>{children}</>;
}

function NBackTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  return (
    <TutorialBase
      theme={theme}
      title="N-Back — Memória Operacional"
      steps={[
        {
          instruction:
            "As letras aparecem uma de cada vez. No 1-back, você compara a letra de AGORA com a IMEDIATAMENTE anterior. No 2-back, com a de 2 atrás, e assim por diante.",
          content: (next) => (
            <StepReady onReady={next}>
              <div className="text-center py-2">
                <div className="flex justify-center items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-slate-100 text-slate-400 border-2 border-slate-200">B</div>
                  <span className="text-slate-400">→</span>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-blue-50 text-blue-700 border-4 border-blue-400">B</div>
                </div>
                <p className="text-sm text-slate-600">No <strong>1-back</strong>: a letra de agora (<strong>B</strong>) é igual à anterior (<strong>B</strong>) → responda <strong className="text-green-600">IGUAL</strong>.</p>
              </div>
            </StepReady>
          ),
        },
        {
          instruction:
            "A CADA letra você precisa responder: IGUAL ou DIFERENTE. Se não responder a tempo, conta como erro. Acertando bem, o nível sobe (2-back, 3-back...).",
          content: (next) => (
            <StepReady onReady={next}>
              <div className="text-center py-2">
                <div className="flex justify-center gap-3 mb-4">
                  <span className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold">IGUAL</span>
                  <span className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold">DIFERENTE</span>
                </div>
                <p className="text-sm text-slate-600">Responda sempre, em todas as letras. É um treino de atenção e memória de trabalho.</p>
              </div>
            </StepReady>
          ),
        },
      ]}
      onDone={onDone}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
type Phase = "tutorial" | "prime" | "stim" | "feedback" | "between";

export function NBack({ difficulty, theme, onComplete }: NBackProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  const [phase, setPhase]   = useState<Phase>("tutorial");
  const [letter, setLetter] = useState("");
  const [nLevel, setNLevel] = useState(initialN(difficulty));
  const [fb, setFb]         = useState<null | "ok" | "no" | "slow">(null);

  // refs de controle assíncrono
  const cancelRef  = useRef(false);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const answerRef  = useRef<((a: "same" | "diff" | null) => void) | null>(null);
  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statRef    = useRef({ hits: 0, misses: 0, fa: 0, cr: 0, omit: 0 });
  const maxNRef     = useRef(initialN(difficulty));

  const sleep = useCallback((ms: number) => new Promise<void>((res, rej) => {
    if (cancelRef.current) { rej("c"); return; }
    const t = setTimeout(() => cancelRef.current ? rej("c") : res(), ms);
    timersRef.current.push(t);
  }), []);

  // espera a resposta do paciente (clique) ou estoura o tempo (omissão).
  // IMPORTANTE: guardar o timer e cancelá-lo ao responder — senão o timeout deste
  // estímulo dispara depois e resolve o PRÓXIMO com null (bug "só o primeiro").
  const waitAnswer = useCallback((ms: number) => new Promise<"same" | "diff" | null>((resolve) => {
    answerRef.current = resolve;
    answerTimerRef.current = setTimeout(() => {
      answerTimerRef.current = null;
      if (answerRef.current) { answerRef.current = null; resolve(null); }
    }, ms);
  }), []);

  const answer = useCallback((a: "same" | "diff") => {
    if (answerRef.current) {
      if (answerTimerRef.current) { clearTimeout(answerTimerRef.current); answerTimerRef.current = null; }
      const r = answerRef.current; answerRef.current = null; r(a);
    }
  }, []);

  const run = useCallback(async () => {
    cancelRef.current = false;
    begin();
    let n = initialN(difficulty);
    let goodStreak = 0;
    const blocks: { acc: number; n: number }[] = [];

    try {
      while (!isTimeUp()) {
        setNLevel(n);
        maxNRef.current = Math.max(maxNRef.current, n);
        const { seq, match } = genBlock(n);

        // priming: mostra as n primeiras letras só para memorizar
        setPhase("between");
        await sleep(500);
        for (let i = 0; i < n; i++) {
          setLetter(seq[i]);
          setFb(null);
          setPhase("prime");
          await sleep(PRIME_MS);
          setPhase("between");
          await sleep(BLANK_MS);
        }

        // estímulos ativos: pede resposta a cada um
        let blockCorrect = 0;
        for (let i = 0; i < BLOCK_LEN; i++) {
          const isMatch = match[i];
          setLetter(seq[n + i]);
          setFb(null);
          setPhase("stim");

          const a = await waitAnswer(STIM_MS);
          const correct = a !== null && (a === "same") === isMatch;
          if (a === null)         { statRef.current.omit++; setFb("slow"); }
          else if (correct)       { if (isMatch) statRef.current.hits++; else statRef.current.cr++; setFb("ok"); }
          else                    { if (isMatch) statRef.current.misses++; else statRef.current.fa++; setFb("no"); }
          if (correct) blockCorrect++;

          setPhase("feedback");
          await sleep(FEEDBACK_MS);
          setPhase("between");
          await sleep(BLANK_MS);
        }

        const acc = blockCorrect / BLOCK_LEN;
        blocks.push({ acc, n });
        if (acc >= GOOD_ACC) {
          goodStreak++;
          if (goodStreak >= 2) { n = Math.min(MAX_N, n + 1); goodStreak = 0; }  // 2 blocos bons → sobe
        } else {
          goodStreak = 0;
          if (acc < 0.5) n = Math.max(MIN_N, n - 1);  // muito mal → alivia
        }
      }

      // fim por tempo
      finish();
      const s = statRef.current;
      const totalAnswered = s.hits + s.misses + s.fa + s.cr + s.omit;
      const correctTotal = s.hits + s.cr;
      const acc = correctTotal / Math.max(1, totalAnswered);
      // sensibilidade (detecção de "iguais") — penaliza chute e omissão
      const hitRate = s.hits / Math.max(1, s.hits + s.misses + s.omit);
      const faRate  = s.fa / Math.max(1, s.fa + s.cr);
      const sensitivity = Math.max(0, hitRate - faRate);
      const score = calculateExerciseScore("nback", Math.max(acc, sensitivity), undefined, maxNRef.current);
      onComplete({
        exerciseId: "nback", domain: "memory",
        score, accuracy: acc, difficulty: maxNRef.current, duration: elapsedSec(),
        metadata: { blocks: blocks.length, maxN: maxNRef.current, hits: s.hits, misses: s.misses, falseAlarms: s.fa, omissions: s.omit, sensitivity: Math.round(sensitivity * 100) / 100 },
      });
    } catch { /* cancelado */ }
  }, [begin, isTimeUp, finish, elapsedSec, difficulty, sleep, waitAnswer, onComplete]);

  useEffect(() => () => { cancelRef.current = true; timersRef.current.forEach(clearTimeout); }, []);

  if (phase === "tutorial") {
    return <NBackTutorial theme={theme} onDone={() => { setPhase("between"); run(); }} />;
  }

  // ── Estilos por tema ─────────────────────────────────────────────
  const isG = theme === "GAMIFIED";
  const bg   = isG ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-indigo-50" : "bg-[#F0F4F8]";
  const card = isG ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg";
  const titleC = isG ? "text-cyan-400" : theme === "COLORFUL" ? "text-violet-700" : "text-slate-800";
  const subC   = isG ? "text-gray-400" : "text-slate-500";

  const fbColor = fb === "ok" ? "#46C66A" : fb === "no" ? "#F2645A" : fb === "slow" ? "#E6A23C" : null;
  const boxBorder = fbColor ?? (isG ? "#22D3EE" : "#60A5FA");
  const boxBg = fb === "ok" ? "#EAF8EF" : fb === "no" ? "#FDECEA" : fb === "slow" ? "#FBF1E0" : (isG ? "#1F2937" : "#EFF6FF");
  const priming = phase === "prime";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
      <div className={`w-full max-w-md rounded-2xl p-6 ${card}`}>
        {/* Barra de progresso (pelo tempo, ~7 min, em saltos de 10%) */}
        <div className="flex items-center gap-2 mb-6" style={{ marginTop: 4 }}>
          <div className={`flex-1 rounded-full overflow-hidden ${isG ? "bg-gray-700" : "bg-gray-200"}`} style={{ height: 6 }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: isG ? "#22D3EE" : "#3B82F6", transition: "width 0.45s linear" }} />
          </div>
          <span className={`text-xs font-bold tabular-nums ${subC}`} style={{ minWidth: 30, textAlign: "right" }}>{progressPct}%</span>
        </div>

        {/* Letra */}
        <div className="flex flex-col items-center">
          <div
            className="flex items-center justify-center font-bold rounded-3xl mb-2"
            style={{
              width: 150, height: 150, fontSize: 64,
              background: boxBg, border: `5px solid ${boxBorder}`,
              color: isG ? "#67E8F9" : "#1D4ED8",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {letter}
          </div>
          <p className="text-sm font-medium mb-4" style={{ minHeight: 22, color: priming ? "#6366F1" : fbColor ?? (isG ? "#94A3B8" : "#64748B") }}>
            {priming ? "Memorize..." :
              fb === "ok" ? "Certo!" : fb === "no" ? "Errou" : fb === "slow" ? "Responda mais rápido!" :
              phase === "stim" ? `É igual à de ${nLevel} atrás?` : ""}
          </p>
        </div>

        {/* Botões — só na fase de resposta */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer("diff")}
            disabled={phase !== "stim"}
            className="py-4 rounded-2xl font-bold text-base text-white transition-opacity disabled:opacity-40"
            style={{ background: "#F2645A" }}
          >
            DIFERENTE
          </button>
          <button
            onClick={() => answer("same")}
            disabled={phase !== "stim"}
            className="py-4 rounded-2xl font-bold text-base text-white transition-opacity disabled:opacity-40"
            style={{ background: "#46C66A" }}
          >
            IGUAL
          </button>
        </div>
      </div>
    </div>
  );
}
