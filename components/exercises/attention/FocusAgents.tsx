"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Focus Agentes — REFORMULADO (atenção/busca visual, sem emoções). Ver
// FOCUS-AGENTES-REFORMULACAO-SPEC.md. Fundação em lib/focus/*.
//  • personagens ESPALHADOS pela tela (grade 2D, nunca em linha), com DERIVA LEVE
//    que dá sensação de vida; rebatem na borda (não escapam); mais personagens sobe com a dificuldade
//  • comando é ANUNCIADO antes de cada rodada E fica visível no topo
//  • etapas 1–5 por escada de 1 variável/passo · adaptativo por BLOCO de 8
//  • imagens em proporção 2:3 (não amassam) · tutorial demonstrativo
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { playTTS, cancelTTS } from "@/lib/tts";
import type { ExerciseResult, Theme } from "@/types";
import { gerarRodada, matches, atributoFaltante, FUNCAO_DA_ETAPA, type FocusRound } from "@/lib/focus/commands";
import { STEPS, type Step } from "@/lib/focus/progression";
import { charById, COR_HEX, FOCUS_CHARS, type Acessorio, type Objeto } from "@/lib/focus/roster";
import { focusImagePreloader } from "@/lib/focus/image-loader";
import {
  CHAR_H,
  CHAR_W,
  MARGIN,
  bobOffset,
  montarCenaEspalhada,
  passoDeriva,
  separarPersonagens,
  type LiveChar,
} from "@/lib/focus/scene";
import {
  buildFocusCompletionMetadata,
  resolveFocusStartStep,
  type PorFuncao,
} from "@/lib/focus/progression";

export interface FocusAgentsSettings {
  startLevel?: number;
  freeChoice?: boolean;
  feedback?: "leve" | "normal" | "intenso";
  autoAdvance?: boolean;
}

export interface FocusAgentsProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  exerciseId?: string;
  settings?: FocusAgentsSettings;
}

const IMG_BASE = "/exercises/agentes-personagens";
const IMG_V = "?v=2";   // v2 = 9 artes reescaladas em 02/ago (arquivo mudou, nome igual)                       // PNG já é bem leve (~24KB); o delay some com o PRELOAD abaixo
const imgSrc = (id: string) => `${IMG_BASE}/${id}.png${IMG_V}`;
// imagens são 360×540 (2:3). Mantemos a proporção — largura menor, altura maior.
// Paleta CLARA (02/ago): o agente azul se camuflava no navy — num exercício em que a
// COR é o critério, isso virava viés a favor das outras cores.
const ARENA_BG = "#F3F6F9";
const ARENA_BORDA = "#DDE3EC";
const TXT = "#0f2038";        // texto principal sobre o claro
const TXT_SUAVE = "#5b6b82";

const TOUCH_PAD = 10;                     // área de toque um pouco maior (§11)

const VEL_QUEDA = [1.5, 2.2, 3.0, 3.8];    // px/frame — queda do nível 2+ (sobe com a progressão)

const ACC_EMOJI: Record<Acessorio, string> = {
  bone: "🧢", fone: "🎧", oculos: "👓", oculos_escuro: "🕶️", chapeu: "🎩",
  gorro: "🧶", coroa: "👑", luva: "🧤",
};
const OBJ_EMOJI: Record<Objeto, string> = {
  balao: "🎈", guarda_chuva: "☂️", pipa: "🪁", skate: "🛹",
  bola_basquete: "🏀", bola_futebol: "⚽",
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ── Sprite do personagem (proporção 2:3, deriva leve pela arena) ─────────────
function CharView({ lc, big, dim, onTap, refNode }: {
  lc: LiveChar; big: boolean; dim: boolean; onTap: () => void; refNode: (n: HTMLButtonElement | null) => void;
}) {
  const src = imgSrc(lc.id);
  return (
    <button ref={refNode} onPointerDown={onTap} aria-label="personagem"
      style={{ position: "absolute", left: lc.bx - TOUCH_PAD, top: lc.by - TOUCH_PAD,
        width: CHAR_W + TOUCH_PAD * 2, height: CHAR_H + TOUCH_PAD * 2, padding: TOUCH_PAD,
        background: "transparent", border: "none", cursor: "pointer", touchAction: "manipulation",
        zIndex: big ? 30 : lc.hit ? 20 : 10, opacity: dim ? 0.2 : 1, transition: "opacity .25s",
        boxShadow: lc.hit ? "0 0 0 4px #22c55e" : undefined, borderRadius: lc.hit ? 16 : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} decoding="async"
        style={{ width: CHAR_W, height: CHAR_H, display: "block", userSelect: "none", pointerEvents: "none",
          filter: big
            ? "drop-shadow(0 0 10px rgba(74,222,128,.95)) drop-shadow(0 0 20px rgba(74,222,128,.8))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }} />
    </button>
  );
}

// ── Anúncio do comando ANTES da rodada (com OK; some ao começar — sem dica) ──
function AnuncioComando({ round, onOk }: { round: FocusRound; onOk: () => void }) {
  const partes = round.texto.split("**");
  return (
    <motion.div key={round.alvoId + round.texto} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center z-40 px-6">
      <div className="rounded-3xl px-6 py-6 text-center max-w-sm"
        style={{ background: "#FFFFFF", border: `1.5px solid ${ARENA_BORDA}`, boxShadow: "0 12px 40px rgba(15,32,56,.14)" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: TXT_SUAVE }}>👁 Encontre</p>
        <div className="flex items-center justify-center gap-3 mb-1">
          {round.amostraCor && <span className="w-8 h-8 rounded-full border-2" style={{ background: COR_HEX[round.amostraCor], borderColor: ARENA_BORDA }} />}
          {round.acessorioIcone && <span className="text-2xl">{ACC_EMOJI[round.acessorioIcone]}</span>}
          {round.objetoIcone && <span className="text-2xl">{OBJ_EMOJI[round.objetoIcone]}</span>}
        </div>
        <p className="font-black text-lg leading-snug" style={{ color: TXT }}>
          {partes.map((p, i) => i % 2 === 1 ? <span key={i} className="text-red-400">{p}</span> : <span key={i}>{p}</span>)}
        </p>
        <p className="text-xs mt-3" style={{ color: TXT_SUAVE }}>Guarde bem — depois de começar, o alvo não fica na tela.</p>
        <button onClick={onOk} className="mt-4 h-11 px-10 rounded-full font-black text-white text-base bg-sky-600 active:bg-sky-700 transition-transform active:scale-95">OK</button>
      </div>
    </motion.div>
  );
}

// ── Tutorial demonstrativo (grade com o ALVO destacado — como antes) ─────────
const DEMO = [
  { id: "azul_fone", alvo: true }, { id: "vermelho_base", alvo: false }, { id: "verde_oculos", alvo: false },
  { id: "roxo_bone", alvo: false }, { id: "amarelo_coroa", alvo: false }, { id: "laranja_base", alvo: false },
];
function Tutorial({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
      style={{ background: ARENA_BG }}>
      {/* "Como realizar o exercício", e não "Como jogar": decisão dela em 10/ago/2026. É uma
          atividade clínica, e o nome da tela precisa dizer isso ao paciente. */}
      <h2 className="font-black text-2xl mb-1 text-center" style={{ color: TXT }}>Como realizar o exercício</h2>
      <p className="text-sm mb-4 text-center" style={{ color: TXT_SUAVE }}>Encontre o personagem indicado.</p>

      {/* Comando de exemplo */}
      <div className="w-full max-w-xs rounded-2xl px-3 py-2.5 flex items-center gap-3 mb-4"
        style={{ background: "#FFFFFF", border: `1.5px solid ${ARENA_BORDA}` }}>
        <span className="w-6 h-6 rounded-full border-2" style={{ background: COR_HEX.azul, borderColor: ARENA_BORDA }} />
        <span className="text-xl">🎧</span>
        <p className="font-bold text-sm" style={{ color: TXT }}>Toque no azul com fone</p>
      </div>

      {/* Grade demo — o ALVO fica destacado com ✓ verde */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-5">
        {DEMO.map((d) => (
          <div key={d.id} className="relative flex items-end justify-center" style={{ height: 116 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(d.id)} alt="" draggable={false}
              style={{ width: 68, height: 102, objectFit: "contain",
                filter: d.alvo ? "drop-shadow(0 0 8px rgba(74,222,128,.95)) drop-shadow(0 0 16px rgba(74,222,128,.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,.5))" }} />
            {d.alvo && <div className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>}
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-1.5"
        style={{ background: "#FFFFFF", border: `1px solid ${ARENA_BORDA}` }}>
        {[
          "Leia o comando (cor + acessório) que aparece antes e fica no topo.",
          "No começo eles ficam espalhados; nos níveis seguintes passam a cair de cima.",
          "Toque só no que corresponde — com a evolução, aparecem mais personagens e a queda acelera.",
          "Use o 🔊 para ouvir o comando de novo.",
        ].map((b, i) => (
          <p key={i} className="text-xs leading-relaxed" style={{ color: TXT_SUAVE }}>• {b}</p>
        ))}
      </div>

      <button onClick={onStart}
        className="w-full max-w-xs h-12 rounded-full font-bold text-white text-base active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Começar! 🚀</button>
    </div>
  );
}


// ── Componente principal ─────────────────────────────────────────────────────
export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents", settings }: FocusAgentsProps) {
  const auditivo = exerciseId === "focus-agents-auditivo";
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();

  type Fase = "instrucoes" | "comando" | "jogando" | "feedback";
  const [fase, setFase] = useState<Fase>("instrucoes");
  const [round, setRound] = useState<FocusRound | null>(null);
  const [chars, setChars] = useState<LiveChar[]>([]);
  const [fb, setFb] = useState<{ ok: boolean; msg: string; alvoUid: string | null } | null>(null);

  const stepRef = useRef(resolveFocusStartStep(settings?.startLevel, difficulty));
  const bloco = useRef({ tentativas: 0, acertos: 0, errosSeguidos: 0, maxErros: 0, seq: 0, melhorSeq: 0, tempos: [] as number[] });
  const totais = useRef({ acertos: 0, total: 0, omissoes: 0, tempos: [] as number[] });
  const porFuncao = useRef<PorFuncao>({});
  const tocadosRef = useRef<Set<string>>(new Set());   // alvos já tocados na rodada (comando de 2 alvos)
  const parciaisRef = useRef<{ achados: number; total: number }[]>([]);  // "achou 1 de 2" é dado clínico
  const rodadaAbertaEm = useRef(0);
  const respondidoRef = useRef(false);
  const arenaRef = useRef<HTMLDivElement>(null);
  const dims = useRef({ w: 360, h: 480 });
  const charsRef = useRef<LiveChar[]>([]);
  const roundRef = useRef<FocusRound | null>(null);
  const nodes = useRef<Map<string, HTMLButtonElement>>(new Map());
  const rafRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const omissaoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  const uidSeq = useRef(0);
  const iniciouRef = useRef(false);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const clearOmissao = () => { if (omissaoRef.current) { clearTimeout(omissaoRef.current); omissaoRef.current = null; } };
  const stopRaf = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };

  useEffect(() => () => { stopRaf(); clearTimers(); clearOmissao(); cancelTTS(); }, []);

  // Pré-carrega o roster já na tela de instruções, para cada rodada aparecer sem espera.
  //
  // Antes isto disparava as 144 imagens de uma vez. O navegador abre ~6 conexões por host, então
  // as outras 138 entravam em fila e chegavam em ondas — ela viu personagens surgindo aos poucos,
  // uns visíveis e outros ainda em branco. São 4,6 MB baixados para usar 6 a 10 por rodada.
  // A limpeza ainda fazia `im.src = ""`, que ABORTA download em curso e joga fora o que já veio.
  //
  // Agora a fila mantém no máximo seis em voo e não cancela nada ao desmontar: o cache do
  // navegador guarda o que já baixou, e a próxima entrada no exercício aproveita.
  useEffect(() => {
    focusImagePreloader.requestMany(FOCUS_CHARS.map((c) => imgSrc(c.id)));
  }, []);

  const falar = useCallback((r: FocusRound) => { playTTS(r.texto.replace(/\*\*/g, "")); }, []);

  const encerrar = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true; stopRaf(); clearTimers(); clearOmissao(); finish();
    const t = totais.current;
    const acc = t.total ? t.acertos / t.total : 0;
    const avgRt = t.tempos.length ? (t.tempos.reduce((s, x) => s + x, 0) / t.tempos.length) * 1000 : 1500;
    const score = calculateExerciseScore("focus-agents", acc, avgRt, difficulty);
    onComplete({
      exerciseId: "focus-agents", domain: "attention", score, accuracy: acc,
      reactionTime: avgRt, difficulty: stepRef.current + 1, duration: elapsedSec(),
      metadata: buildFocusCompletionMetadata({
        trials: t.total,
        correct: t.acertos,
        omissions: t.omissoes,
        avgRT: avgRt,
        step: stepRef.current,
        porFuncao: porFuncao.current,
        // comandos de 2 alvos: quantos completos, quantos pela metade
        multiAlvo: parciaisRef.current.length ? {
          rodadas: parciaisRef.current.length,
          completos: parciaisRef.current.filter((p) => p.achados === p.total).length,
          parciais: parciaisRef.current.filter((p) => p.achados > 0 && p.achados < p.total).length,
        } : undefined,
      }),
    });
  }, [difficulty, elapsedSec, finish, onComplete]);

  const modoQuedaRef = useRef(false); // false = espalhados (nível 1); true = caindo (nível 2+)



  // Loop de animação — dois modos:
  //  • ESPALHADO (nível 1): vagam devagar e REBATEM na borda, com "bob" senoidal (vida).
  //  • QUEDA (nível 2+): descem de cima; se o ALVO sai por baixo sem toque = omissão.
  const startRaf = useCallback(() => {
    stopRaf();
    let f = 0;
    const tick = () => {
      f++;
      const W = dims.current.w, H = dims.current.h;
      if (modoQuedaRef.current) {
        let alvoSaiu = false, saiuAlgum = false;
        for (const c of charsRef.current) c.y += c.vy;
        separarPersonagens(charsRef.current, W, H, true);
        for (const c of charsRef.current) {
          const node = nodes.current.get(c.uid);
          if (node) node.style.transform = `translate(${c.x - c.bx}px, ${c.y - c.by}px)`;
          if (c.y > H + 12) { saiuAlgum = true; if (c.isTarget) alvoSaiu = true; }
        }
        if (saiuAlgum) {
          charsRef.current = charsRef.current.filter((c) => c.y <= H + 12);
          setChars([...charsRef.current]);
        }
        if (alvoSaiu && !respondidoRef.current && !doneRef.current) {
          respondidoRef.current = true; stopRaf();
          registra(false, null, true);
          setFb({ ok: false, msg: "Passou! Toque mais rápido.", alvoUid: null });
          setFase("feedback");
          timers.current.push(setTimeout(proximaRef.current, 1250));
          return;
        }
      } else {
        passoDeriva(charsRef.current, W, H);
        for (const c of charsRef.current) {
          const node = nodes.current.get(c.uid);
          if (node) {
            const bob = bobOffset(f, c.ph);
            node.style.transform = `translate(${c.x - c.bx}px, ${c.y - c.by + bob}px)`;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // encadeamento das rodadas via refs (evita ciclos de useCallback)
  const proximaRef = useRef<() => void>(() => {});
  const iniciarRodadaRef = useRef<(r: FocusRound) => void>(() => {});

  const iniciarRodada = useCallback((r: FocusRound) => {
    const step = STEPS[stepRef.current];
    const W = dims.current.w, H = dims.current.h;
    const alvoIds = r.alvoIds?.length ? r.alvoIds : [r.alvoId];
    tocadosRef.current = new Set();
    // SEMPRE espalhado pela tela em 2D (pedido da Kamylla): ativa a busca visual.
    // A queda em linha (concentrada numa faixa) foi removida — a dificuldade sobe
    // por nº de personagens, semelhança dos distratores, velocidade e etapa do comando.
    const cai = false;
    modoQuedaRef.current = cai;
    let live: LiveChar[];

    if (cai) {
      // QUEDA: nascem ACIMA do topo, distribuídos em colunas e escalonados no Y (chuva
      // contínua, não em bloco); descem só de cima. Velocidade sobe com o nível.
      const vq = VEL_QUEDA[step.vel];
      const nCols = Math.max(2, Math.floor(W / (CHAR_W + 14)));
      const colW = W / nCols;
      const colOrder = shuffle(r.personagensIds.map((_, i) => i % nCols));
      const stackByCol: Record<number, number> = {};
      live = r.personagensIds.map((id, i) => {
        const col = colOrder[i];
        const stack = (stackByCol[col] = (stackByCol[col] ?? 0) + 1) - 1;
        const x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, col * colW + rnd(6, Math.max(8, colW - CHAR_W - 6))));
        const y = -CHAR_H - stack * (CHAR_H * 0.85) - rnd(0, 40);
        return { uid: `c${uidSeq.current++}`, id, isTarget: alvoIds.includes(id),
          bx: x, by: y, x, y, vx: 0, vy: vq * rnd(0.92, 1.1), ph: 0 };
      });
    } else {
      // O uid precisa ser único NO TEMPO, não só dentro da rodada: ele é a chave da lista no React
      // e a chave do mapa de nós que a animação usa. `montarCenaEspalhada` numera a partir do zero
      // (é função pura e determinística, e assim precisa ser), então a numeração contínua da sessão
      // é reposta aqui, como sempre foi.
      live = montarCenaEspalhada(r.personagensIds, alvoIds, W, H, step.vel)
        .map((c) => ({ ...c, uid: `c${uidSeq.current++}` }));
    }

    charsRef.current = live;
    setChars(live);
    respondidoRef.current = false;
    rodadaAbertaEm.current = Date.now();
    setFase("jogando");
    startRaf();
    // Omissão: no modo QUEDA é tratada pelo RAF (alvo sai por baixo). No ESPALHADO,
    // por TEMPO — senão a rodada nunca termina se o paciente não tocar.
    clearOmissao();
    if (!cai) {
      // Tempo da rodada (§ ela, 02/ago): "quando temos 2 comandos, acaba o tempo antes
      // de eu conseguir clicar". Duas correções:
      //  • ESCALA COM O Nº DE ALVOS — achar dois personagens custa ~o dobro de achar um;
      //  • começa FOLGADO e só aperta nos passos altos, quando a agilidade já é o alvo
      //    do treino (nos primeiros, o que se treina é a busca, não a pressa).
      const nAlvos = (r.alvoIds?.length ?? 1);
      const porAlvo = Math.max(4600, 9000 - stepRef.current * 420);
      const tempoMs = porAlvo * nAlvos;
      omissaoRef.current = setTimeout(() => {
        if (respondidoRef.current || doneRef.current) return;
        respondidoRef.current = true; stopRaf();
        registra(false, null, true);
        setFb({ ok: false, msg: "Acabou o tempo!", alvoUid: charsRef.current.find((c) => c.id === r.alvoId)?.uid ?? null });
        setFase("feedback");
        timers.current.push(setTimeout(proximaRef.current, 1450));
      }, tempoMs);
    }
  }, [startRaf]);
  iniciarRodadaRef.current = iniciarRodada;

  // registra o resultado de uma tentativa (acerto / erro / omissão)
  // Adaptativo por SEQUÊNCIA (pedido da Kamylla): 3 acertos seguidos → sobe 1 nível;
  // 3 erros seguidos → desce 1 nível (silenciosamente, sem tela de resultado).
  const registra = useCallback((acertou: boolean, rt: number | null, omissao: boolean) => {
    const b = bloco.current, t = totais.current;
    const funcao = FUNCAO_DA_ETAPA[STEPS[stepRef.current].etapa];
    const contagem = porFuncao.current[funcao] ?? { tentativas: 0, acertos: 0 };
    contagem.tentativas++;
    if (acertou) contagem.acertos++;
    porFuncao.current[funcao] = contagem;
    b.tentativas++; t.total++;
    if (omissao) t.omissoes++;
    if (acertou) {
      b.acertos++; t.acertos++; if (rt != null) { b.tempos.push(rt); t.tempos.push(rt); }
      b.errosSeguidos = 0; b.seq++; b.melhorSeq = Math.max(b.melhorSeq, b.seq);
      if (b.seq >= 3 && stepRef.current < STEPS.length - 1) { stepRef.current++; b.seq = 0; }
    } else {
      b.seq = 0; b.errosSeguidos++; b.maxErros = Math.max(b.maxErros, b.errosSeguidos);
      if (b.errosSeguidos >= 3 && stepRef.current > 0) { stepRef.current--; b.errosSeguidos = 0; }
    }
  }, []);

  // ANUNCIA o comando, depois solta a queda (§ "mandar antes" + sempre visível)
  const novaRodada = useCallback(() => {
    if (doneRef.current || isTimeUp()) { encerrar(); return; }
    const step = STEPS[stepRef.current];
    const r = gerarRodada(step.etapa, step.n, roundRef.current?.texto, step.semelhantes); // não repete o comando anterior
    // Os personagens desta rodada furam a fila: são os únicos que precisam estar prontos AGORA.
    focusImagePreloader.requestMany(r.personagensIds.map(imgSrc), true);
    roundRef.current = r;
    setRound(r);
    setChars([]); charsRef.current = [];
    setFb(null);
    setFase("comando");
    if (auditivo) falar(r);
    // NÃO inicia sozinho: o card mostra o comando e espera o paciente clicar OK
    // (confirma que leu). Depois disso, nenhuma dica fica na tela. (pedido da Kamylla)
  }, [auditivo, falar, isTimeUp, encerrar]);

  // Paciente confirmou que leu o comando → começa a rodada (sem o comando visível).
  const confirmarComando = useCallback(() => {
    const r = roundRef.current;
    if (!r || doneRef.current) return;
    iniciarRodadaRef.current(r);
  }, []);

  const proxima = useCallback(() => { novaRodada(); }, [novaRodada]);
  proximaRef.current = proxima;

  const responder = useCallback((tocado: LiveChar) => {
    if (fase !== "jogando" || respondidoRef.current || doneRef.current) return;
    const r = roundRef.current; if (!r) return;
    const alvos = r.alvoIds?.length ? r.alvoIds : [r.alvoId];
    const escolhidoChar = charById(tocado.id)!;

    // ── COMANDO DE 2 ALVOS: o paciente precisa tocar nos DOIS. Tocar em um só não
    // encerra — é justamente segurar os dois critérios que treina memória de trabalho.
    if (alvos.length > 1) {
      const ehAlvo = alvos.includes(tocado.id);
      if (ehAlvo && !tocadosRef.current.has(tocado.id)) {
        tocadosRef.current.add(tocado.id);
        if (tocadosRef.current.size < alvos.length) {
          // marca o que já foi achado e SEGUE na mesma rodada
          charsRef.current = charsRef.current.map((c) => (c.uid === tocado.uid ? { ...c, hit: true } : c));
          setChars([...charsRef.current]);
          return;
        }
      } else if (!ehAlvo) {
        // errou um dos dois: encerra a rodada registrando o acerto PARCIAL
        respondidoRef.current = true; stopRaf(); clearOmissao();
        const achados = tocadosRef.current.size;
        registra(false, null, false);
        parciaisRef.current.push({ achados, total: alvos.length });
        setFb({ ok: false,
          msg: achados ? `Achou ${achados} de ${alvos.length}. ${atributoFaltante(r.criterio, escolhidoChar)}`
                       : atributoFaltante(r.criterio, escolhidoChar),
          alvoUid: charsRef.current.find((c) => c.isTarget && !tocadosRef.current.has(c.id))?.uid ?? null });
        setFase("feedback");
        timers.current.push(setTimeout(proximaRef.current, 1600));
        return;
      } else {
        return;   // tocou de novo no mesmo alvo já marcado: ignora
      }
    }

    respondidoRef.current = true;
    stopRaf(); clearOmissao();
    const rt = (Date.now() - rodadaAbertaEm.current) / 1000;
    const escolhido = escolhidoChar;
    const acertou = alvos.length > 1
      ? tocadosRef.current.size === alvos.length
      : matches(escolhido, r.criterio) && tocado.id === r.alvoId;
    registra(acertou, acertou ? rt : null, false);
    if (acertou && alvos.length > 1) parciaisRef.current.push({ achados: alvos.length, total: alvos.length });
    const msg = acertou
      ? (alvos.length > 1 ? "Achou os dois!"
        : r.criterio.cor && (r.criterio.acessorios || r.criterio.objeto) ? "Acertou a cor e o acessório!" : "Correto!")
      : atributoFaltante(r.criterio, escolhido);
    setFb({ ok: acertou, msg, alvoUid: acertou ? null : charsRef.current.find((c) => c.id === r.alvoId)?.uid ?? null });
    setFase("feedback");
    timers.current.push(setTimeout(proximaRef.current, acertou ? 950 : 1450));
  }, [fase, registra]);

  // mede a arena e inicia a 1ª rodada só DEPOIS de medir
  useLayoutEffect(() => {
    const el = arenaRef.current;
    if (!el) return;
    const measure = () => { dims.current = { w: el.clientWidth, h: el.clientHeight }; };
    measure();
    if ((fase === "comando" || fase === "jogando") && !iniciouRef.current && !doneRef.current) {
      iniciouRef.current = true; novaRodada();
    }
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [fase, novaRodada]);

  // ── render ─────────────────────────────────────────────────────────────────
  if (fase === "instrucoes") {
    return <Tutorial onStart={() => { begin(); setFase("comando"); }} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: ARENA_BG }}>
      {/* Só a barra de progresso no topo — SEM o comando visível durante a busca
          (sem dica após a instrução). O comando aparece só no card "Encontre". */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2" style={{ zIndex: 50 }}>
        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
      </div>

      <div ref={arenaRef} className="relative flex-1 overflow-hidden mx-2 mb-2 rounded-2xl"
        style={{ background: "#FFFFFF", border: `1px solid ${ARENA_BORDA}` }}>
        {chars.map((lc) => (
          <CharView key={lc.uid} lc={lc}
            big={fase === "feedback" && fb?.alvoUid === lc.uid}
            dim={fase === "feedback" && !!fb && !fb.ok && fb.alvoUid !== lc.uid}
            onTap={() => responder(lc)}
            refNode={(n) => { if (n) nodes.current.set(lc.uid, n); else nodes.current.delete(lc.uid); }} />
        ))}

        <AnimatePresence>{fase === "comando" && round && <AnuncioComando round={round} onOk={confirmarComando} />}</AnimatePresence>

        <AnimatePresence>
          {fase === "feedback" && fb && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute left-1/2 bottom-4 -translate-x-1/2 px-4 py-2 rounded-xl font-bold text-sm text-center max-w-[90%]"
              style={{ background: fb.ok ? "rgba(22,163,74,0.94)" : "rgba(220,38,38,0.94)", color: "#fff", zIndex: 45 }}>
              {fb.ok ? "✓ " : "✗ "}{fb.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
