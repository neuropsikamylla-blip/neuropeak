"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Investigadores da Situação Social — componente jogável.
// Fluxo: config (faixa) → tutorial-réplica → rodadas de casos (cena + perguntas em
// camadas, uma por vez, feedback só APÓS confirmar) → onComplete (grava sessão).
// Lógica pura vem de lib/social/engine (verificação/erro) + conteúdo de data/social-stories.
// Figuras: emoji por ora (ou AssetImage quando a história trouxer `imagem`).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";
import { AssetImage } from "@/components/assets/AssetImage";
import { socialStyles } from "./socialTheme";
import { StoryHeader } from "./StoryHeader";
import { storiesByFaixa } from "@/data/social-stories";
import { verificarResposta, erroTipoDaResposta } from "@/lib/social/engine";
import {
  FAIXA_LABEL, EIXO_LABEL, SOCIAL_EXERCISE_ID, SOCIAL_PROVISIONAL_DOMAIN,
  type FaixaEtaria, type SocialStory, type SocialScene, type SocialQuestion,
  type SocialCharacter, type PatientAnswer, type EixoSocial,
} from "@/lib/social/types";

interface Props { difficulty: number; theme: Theme; onComplete: (r: ExerciseResult) => void; }

const FAIXAS: FaixaEtaria[] = ["crianca", "adolescente", "adulto"];
const SUPPORTED = new Set(["escolhaUnica", "escolherExpressao"]);
const targetLevel = (d: number) => Math.max(1, Math.min(7, Math.round(d * 0.7)));

function poolFor(faixa: FaixaEtaria, target: number): SocialStory[] {
  return [...storiesByFaixa(faixa)].sort((a, b) => Math.abs(a.nivel - target) - Math.abs(b.nivel - target));
}

function scoredItems(story: SocialStory): { scene: SocialScene; q: SocialQuestion }[] {
  return story.cenas.flatMap((scene) =>
    scene.perguntas.filter((q) => q.gabarito !== undefined && SUPPORTED.has(q.formato)).map((q) => ({ scene, q })),
  );
}

function correctText(q: SocialQuestion): string {
  const gab = Array.isArray(q.gabarito) ? q.gabarito : [q.gabarito];
  return (q.opcoes ?? []).filter((o) => gab.includes(o.id)).map((o) => o.texto).join(", ");
}

// ── Cena (personagens + narração) ─────────────────────────────────────────────
function SceneBlock({ story, scene, theme }: { story: SocialStory; scene: SocialScene; theme: Theme }) {
  const { box, pal } = socialStyles(theme);
  const chars = scene.personagens
    .map((id) => story.personagens.find((c) => c.id === id))
    .filter((c): c is SocialCharacter => !!c);
  return (
    <div className="rounded-2xl p-4 mb-3" style={box}>
      <div className="flex justify-center gap-5 mb-3">
        {chars.map((c) => (
          <div key={c.id} className="flex flex-col items-center">
            {c.imagem
              ? <AssetImage id={c.imagem} alt={c.nome} width={64} height={64} />
              : <span style={{ fontSize: 52, lineHeight: 1 }}>{c.emoji ?? "🙂"}</span>}
            <span className={`text-xs font-bold mt-1 ${pal.title}`}>{c.nome}</span>
          </div>
        ))}
      </div>
      <p className={`text-sm leading-snug ${pal.title}`}>{scene.descricao}</p>
      {scene.contexto && <p className={`text-xs mt-1.5 ${pal.sub}`}>💡 {scene.contexto}</p>}
    </div>
  );
}

// ── Uma pergunta (selecionar → confirmar → feedback → continuar) ───────────────
function QuestionView({ story, scene, q, theme, index, total, onAnswered }: {
  story: SocialStory; scene: SocialScene; q: SocialQuestion; theme: Theme;
  index: number; total: number; onAnswered: (a: PatientAnswer) => void;
}) {
  const { isG, btn, box, pal } = socialStyles(theme);
  const [sel, setSel] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startRef = useRef<number>(Date.now());
  const ansRef = useRef<PatientAnswer | null>(null);

  function confirmar() {
    if (committed || !sel) return;
    const ok = verificarResposta(q, sel) === true;
    setCorrect(ok);
    setCommitted(true);
    ansRef.current = {
      questionId: q.id, tipo: q.tipo, eixo: q.eixo, formato: q.formato, value: sel,
      correta: ok, primeira: ok, tentativas: 1, tempoMs: Date.now() - startRef.current,
      usouDica: false, erroTipo: ok ? undefined : erroTipoDaResposta(q, sel),
    };
  }

  const fbLines = correct
    ? ["Sua resposta se apoia nas pistas da cena."]
    : [q.dica1, `Uma leitura apoiada nas pistas: ${correctText(q)}.`].filter(Boolean) as string[];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SceneBlock story={story} scene={scene} theme={theme} />

      <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${pal.sub}`}>
        Pergunta {index + 1} de {total} · {EIXO_LABEL[q.eixo]}
      </p>
      <p className={`text-base font-bold leading-snug mb-3 ${pal.title}`}>{q.enunciado}</p>

      <div className="space-y-2 mb-3">
        {(q.opcoes ?? []).map((o) => {
          const chosen = sel === o.id;
          const isRight = committed && o.id === (Array.isArray(q.gabarito) ? q.gabarito[0] : q.gabarito);
          const isWrongChosen = committed && chosen && !isRight;
          const border = isRight ? "border-emerald-500 bg-emerald-50" : isWrongChosen ? "border-red-400 bg-red-50"
            : chosen ? "border-emerald-500 bg-emerald-50" : isG ? "border-white/20" : "border-slate-200";
          return (
            <button key={o.id} disabled={committed} onClick={() => setSel(o.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.99] disabled:cursor-default ${border} ${chosen || isRight || isWrongChosen ? "text-gray-800" : pal.title}`}
              style={!(chosen || isRight || isWrongChosen) ? box : undefined}>
              {o.texto}
              {isRight && <span className="float-right text-emerald-600">✓</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {committed && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 mb-3"
            style={{
              background: correct ? (isG ? "rgba(16,185,129,0.12)" : "#ecfdf5") : (isG ? "rgba(250,204,21,0.12)" : "#fffbeb"),
              border: `1.5px solid ${correct ? "rgba(16,185,129,0.4)" : "rgba(250,204,21,0.4)"}`,
            }}>
            <p className={`font-bold text-sm mb-1 ${correct ? "text-emerald-600" : (isG ? "text-amber-300" : "text-amber-700")}`}>
              {correct ? "✅ Boa observação!" : "💡 Vamos olhar de novo"}
            </p>
            {fbLines.map((l, i) => (
              <p key={i} className={`text-xs leading-snug ${correct ? "text-emerald-700" : (isG ? "text-amber-100/90" : "text-amber-800")}`}>{l}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {committed ? (
        <button onClick={() => ansRef.current && onAnswered(ansRef.current)} className="w-full h-12 font-bold" style={btn}>Continuar</button>
      ) : (
        <button onClick={confirmar} disabled={!sel} className="w-full h-12 font-bold transition-all disabled:opacity-40" style={btn}>
          {sel ? "Confirmar" : "Escolha uma resposta"}
        </button>
      )}
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function InvestigadoresSociais({ difficulty, theme, onComplete }: Props) {
  const { rootBg, card, btn, pal, isG } = socialStyles(theme);
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();

  const faixasDisp = useMemo(() => FAIXAS.filter((f) => storiesByFaixa(f).length > 0), []);
  const [faixa, setFaixa] = useState<FaixaEtaria>(faixasDisp[0] ?? "crianca");
  const [stage, setStage] = useState<"config" | "tutorial" | "play">("config");

  const target = targetLevel(difficulty);
  const poolRef = useRef<SocialStory[]>([]);
  const [storyIdx, setStoryIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const answersRef = useRef<PatientAnswer[]>([]);
  const maxNivelRef = useRef(1);

  const story = poolRef.current[storyIdx];
  const items = useMemo(() => (story ? scoredItems(story) : []), [story]);

  function iniciar() {
    poolRef.current = poolFor(faixa, target);
    answersRef.current = [];
    maxNivelRef.current = poolRef.current[0]?.nivel ?? 1;
    setStoryIdx(0); setItemIdx(0);
  }

  function finishSession() {
    finish();
    const ans = answersRef.current;
    const pont = ans.filter((a) => a.correta !== null);
    const acertos = pont.filter((a) => a.correta).length;
    const accuracy = pont.length ? acertos / pont.length : 0;

    const grupos = new Map<EixoSocial, { ok: number; total: number }>();
    for (const a of pont) {
      const g = grupos.get(a.eixo) ?? { ok: 0, total: 0 };
      g.total += 1; if (a.correta) g.ok += 1; grupos.set(a.eixo, g);
    }
    const acuraciaPorEixo: Partial<Record<EixoSocial, number>> = {};
    for (const [e, g] of grupos) acuraciaPorEixo[e] = g.total ? g.ok / g.total : 0;
    const errosPorTipo: Record<string, number> = {};
    for (const a of pont) if (!a.correta && a.erroTipo) errosPorTipo[a.erroTipo] = (errosPorTipo[a.erroTipo] ?? 0) + 1;

    onComplete({
      exerciseId: SOCIAL_EXERCISE_ID,
      domain: SOCIAL_PROVISIONAL_DOMAIN,
      score: calculateExerciseScore(SOCIAL_EXERCISE_ID, accuracy, undefined, maxNivelRef.current),
      accuracy,
      difficulty: maxNivelRef.current,
      duration: elapsedSec(),
      metadata: { faixa, itens: pont.length, acertos, acuraciaPorEixo, errosPorTipo },
    });
  }

  const handleAnswered = useCallback((a: PatientAnswer) => {
    answersRef.current = [...answersRef.current, a];
    const cur = poolRef.current[storyIdx];
    const curItems = cur ? scoredItems(cur) : [];
    if (itemIdx + 1 < curItems.length) { setItemIdx((i) => i + 1); return; }
    // fim do caso
    if (isTimeUp() || storyIdx + 1 >= poolRef.current.length) { finishSession(); return; }
    const next = poolRef.current[storyIdx + 1];
    if (next) maxNivelRef.current = Math.max(maxNivelRef.current, next.nivel);
    setStoryIdx((s) => s + 1); setItemIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIdx, itemIdx]);

  // ── Config ──
  if (stage === "config") {
    return (
      <div className="min-h-screen overflow-y-auto" style={rootBg}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="p-5" style={card}>
            <h2 className={`font-bold text-lg ${pal.title}`}>🕵️ Investigadores da Situação Social</h2>
            <p className={`text-sm mb-4 ${pal.sub}`}>Observe a cena, leia as pistas sociais e responda como um investigador. O feedback aparece depois que você confirma.</p>
            <p className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${pal.sub}`}>Faixa</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {faixasDisp.map((f) => (
                <button key={f} onClick={() => setFaixa(f)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${faixa === f ? "border-emerald-500 bg-emerald-50 text-emerald-700" : isG ? "border-white/20 text-white/75" : "border-slate-200 text-slate-600"}`}>
                  {FAIXA_LABEL[f]}
                </button>
              ))}
            </div>
            <button onClick={() => setStage("tutorial")} className="w-full h-12 font-bold" style={btn}>Continuar</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tutorial (réplica: uma cena + uma pergunta real) ──
  if (stage === "tutorial") {
    const tutStory = poolFor(faixa, target)[0] ?? storiesByFaixa(faixasDisp[0] ?? "crianca")[0];
    const tutItem = tutStory ? scoredItems(tutStory)[0] : null;
    return (
      <TutorialBase theme={theme} title="Investigadores da Situação Social"
        steps={[{
          instruction: "Você vira um investigador de situações sociais. Olhe a cena e as pistas (rosto, corpo, contexto), escolha a resposta e confirme. O app só mostra se acertou DEPOIS que você confirma. Faça esta para começar.",
          content: (done) => tutItem
            ? <QuestionView story={tutStory} scene={tutItem.scene} q={tutItem.q} theme={theme} index={0} total={1} onAnswered={() => done()} />
            : <p className="text-center text-sm text-white/70">Sem casos disponíveis.</p>,
        }]}
        onDone={() => { begin(); iniciar(); setStage("play"); }} />
    );
  }

  // ── Play ──
  if (!story) return null;
  const item = items[itemIdx];
  if (!item) return null;

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="p-5" style={card}>
          <StoryHeader story={story} theme={theme}
            right={<span className={`text-xs font-semibold ${pal.sub}`}>Caso {storyIdx + 1}/{poolRef.current.length}</span>} />
          <AnimatePresence mode="wait">
            <QuestionView key={`${story.id}-${item.q.id}`} story={story} scene={item.scene} q={item.q}
              theme={theme} index={itemIdx} total={items.length} onAnswered={handleAnswered} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
