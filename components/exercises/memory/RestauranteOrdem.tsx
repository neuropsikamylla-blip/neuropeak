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

interface Item { id: string; n: string; art: string; pl?: string; qOk?: boolean; } // foto: /exercises/restaurante/<id>.png
// Catálogo "bistrô" — itens já vêm pré-montados no prato/copo/tigela (foto realista).
// art = artigo indefinido (um/uma/uns); pl = plural p/ quantidades; qOk = aceita quantidade (>1).
const ITEMS: Item[] = [
  // bebidas
  { id: "agua", n: "água", art: "uma", pl: "águas", qOk: true },
  { id: "agua-coco", n: "água de coco", art: "uma", pl: "águas de coco", qOk: true },
  { id: "refrigerante", n: "refrigerante", art: "um", pl: "refrigerantes", qOk: true },
  { id: "suco-laranja", n: "suco de laranja", art: "um", pl: "sucos de laranja", qOk: true },
  { id: "vitamina", n: "vitamina", art: "uma", pl: "vitaminas", qOk: true },
  // pratos principais
  { id: "arroz-feijao", n: "arroz com feijão", art: "um" },
  { id: "frango-batata", n: "frango com batata", art: "um" },
  { id: "bife-legumes", n: "bife com legumes", art: "um" },
  { id: "macarrao-bolonhesa", n: "macarrão à bolonhesa", art: "um" },
  { id: "lasanha", n: "lasanha", art: "uma", pl: "lasanhas", qOk: true },
  { id: "risoto-cogumelo", n: "risoto de cogumelo", art: "um", pl: "risotos de cogumelo", qOk: true },
  { id: "omelete", n: "omelete", art: "uma", pl: "omeletes", qOk: true },
  { id: "arroz-frutos-mar", n: "arroz com frutos do mar", art: "um" },
  { id: "batata-frita", n: "batata frita", art: "uma", pl: "batatas fritas", qOk: true },
  { id: "salmao", n: "salmão", art: "um" },
  // sobremesas
  { id: "bolo", n: "bolo", art: "um", pl: "bolos", qOk: true },
  { id: "pudim", n: "pudim", art: "um", pl: "pudins", qOk: true },
  { id: "sorvete", n: "sorvete", art: "um", pl: "sorvetes", qOk: true },
  { id: "mousse", n: "mousse", art: "uma", pl: "mousses", qOk: true },
  { id: "torta", n: "torta", art: "uma", pl: "tortas", qOk: true },
  { id: "rosquinha", n: "rosquinha", art: "uma", pl: "rosquinhas", qOk: true },
  { id: "maca", n: "maçã", art: "uma", pl: "maçãs", qOk: true },
  { id: "salada-frutas", n: "salada de frutas", art: "uma", pl: "saladas de frutas", qOk: true },
  { id: "brigadeiro", n: "brigadeiro", art: "um", pl: "brigadeiros", qOk: true },
  { id: "brownie", n: "brownie", art: "um", pl: "brownies", qOk: true },
  // lanches
  { id: "hamburguer", n: "hambúrguer", art: "um", pl: "hambúrgueres", qOk: true },
  { id: "sanduiche-frio", n: "sanduíche frio", art: "um", pl: "sanduíches frios", qOk: true },
  { id: "pizza", n: "pizza", art: "uma", pl: "pizzas", qOk: true },
  { id: "cachorro-quente", n: "cachorro-quente", art: "um", pl: "cachorros-quentes", qOk: true },
  { id: "nuggets", n: "nuggets", art: "uns" },
  { id: "pastel", n: "pastel", art: "um", pl: "pastéis", qOk: true },
  { id: "tapioca", n: "tapioca", art: "uma", pl: "tapiocas", qOk: true },
  { id: "croissant", n: "croissant", art: "um", pl: "croissants", qOk: true },
  { id: "pao-queijo", n: "pão de queijo", art: "um", pl: "pães de queijo", qOk: true },
  // outros pratos
  { id: "bruschetta", n: "bruschetta", art: "uma", pl: "bruschettas", qOk: true },
  { id: "caldo", n: "caldo", art: "um", pl: "caldos", qOk: true },
  { id: "cesta-paes", n: "cesta de pães", art: "uma", pl: "cestas de pães", qOk: true },
  { id: "legumes-grelhados", n: "legumes grelhados", art: "uns" },
  { id: "ovo-frito", n: "ovo frito", art: "um", pl: "ovos fritos", qOk: true },
  { id: "peixe", n: "peixe", art: "um" },
  { id: "salada", n: "salada", art: "uma", pl: "saladas", qOk: true },
  { id: "sopa", n: "sopa", art: "uma", pl: "sopas", qOk: true },
  { id: "tabua-queijos", n: "tábua de queijos", art: "uma", pl: "tábuas de queijos", qOk: true },
];

// versão das fotos — subir quando reprocessar imagens (força recarga / fura cache)
const IMG_V = "?v=2";
const photo = (id: string) => `/exercises/restaurante/${id}.png${IMG_V}`;

// Itens já vêm pré-montados (prato/copo/tigela próprios) — renderiza a foto direto.
function ItemImg({ id, size }: { id: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo(id)} alt="" draggable={false} width={size} height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }} />
  );
}

type Mode = "direta" | "inversa" | "exclusao";
// maxQty = quantidade máxima por item (1 = sem repetição; 2/3 = "dois sucos" etc.)
interface RLevel { count: number; maxQty: number; mode: Mode; audio: boolean; distractors: number; }
const R_LEVELS: Record<number, RLevel> = {
  1:  { count: 2, maxQty: 1, mode: "direta",   audio: false, distractors: 2 },
  2:  { count: 2, maxQty: 1, mode: "direta",   audio: false, distractors: 3 },
  3:  { count: 3, maxQty: 1, mode: "direta",   audio: false, distractors: 3 },
  4:  { count: 3, maxQty: 1, mode: "direta",   audio: true,  distractors: 4 },
  5:  { count: 3, maxQty: 2, mode: "direta",   audio: false, distractors: 4 },  // entram quantidades (em texto)
  6:  { count: 4, maxQty: 2, mode: "direta",   audio: true,  distractors: 5 },  // quantidades no áudio
  7:  { count: 3, maxQty: 1, mode: "inversa",  audio: false, distractors: 4 },  // ordem inversa
  8:  { count: 4, maxQty: 1, mode: "inversa",  audio: true,  distractors: 5 },
  9:  { count: 4, maxQty: 1, mode: "exclusao", audio: true,  distractors: 5 },  // inibição (NÃO X)
  10: { count: 5, maxQty: 2, mode: "direta",   audio: true,  distractors: 6 },  // memória ampla + quantidades
};
const MODE_LABEL: Record<Mode, string> = { direta: "direta", inversa: "inversa", exclusao: "exclusão" };
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 10;

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
// quantidade por extenso (concorda em gênero com o artigo do item)
function qtyWord(it: Item, q: number): string {
  if (q <= 1) return it.art;                       // um / uma / uns
  if (q === 2) return it.art === "uma" ? "duas" : "dois";
  return "três";
}
function lineText(it: Item, q: number): string {
  return `${qtyWord(it, q)} ${q > 1 && it.pl ? it.pl : it.n}`;
}
function joinList(parts: string[]): string {
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
}
// artigo definido (p/ a frase de exclusão soar natural: "não quer o sorvete")
function defArt(it: Item): string {
  return it.art === "uma" ? "a" : it.art === "uns" ? "os" : "o";
}
// frases de garçom/cozinha — imitam um pedido real de restaurante (variadas; mesa numerada)
function orderSentence(list: string, table: number): string {
  switch (Math.floor(Math.random() * 6)) {
    case 0:  return `O cliente da mesa ${table} pediu ${list}.`;
    case 1:  return `Mesa ${table}, anote o pedido: ${list}.`;
    case 2:  return `O garçom levou para a cozinha: ${list}.`;
    case 3:  return `Pedido da mesa ${table}: ${list}.`;
    case 4:  return `Para a mesa ${table}, ${list}, por favor.`;
    default: return `O cliente pediu ${list}.`;
  }
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

// ── Música ambiente sintetizada (Web Audio) — 100% sem direitos autorais ─────────
// Um pad quente grave + notinhas esparsas de uma escala pentatônica, em volume
// baixo. Gerada na hora pelo app (nada de arquivo/música protegida).
let ambCtx: AudioContext | null = null;
let ambMaster: GainNode | null = null;
let ambTimer: ReturnType<typeof setTimeout> | null = null;
let ambStopPad: (() => void) | null = null;
const AMB_LEVEL = 0.17;   // ~2x mais alto que antes (0.08)

function startAmbience() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ambCtx) ambCtx = new Ctx();
    if (ambCtx.state === "suspended") ambCtx.resume();
    if (ambMaster) return; // já tocando
    const ctx = ambCtx;
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(AMB_LEVEL, ctx.currentTime + 1.5);
    ambMaster = master;
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 2000; warm.connect(master);

    // progressão de acordes em clima café/lounge — arpejo dá movimento (mais animado)
    const CHORDS = [
      { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88] }, // Cmaj7
      { bass: 110.00, notes: [261.63, 329.63, 392.00, 440.00] }, // Am7
      { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25] }, // Dm7
      { bass: 196.00, notes: [293.66, 349.23, 392.00, 493.88] }, // G7
    ];
    const note = (freq: number, dur: number, peak: number, type: OscillatorType) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = 0;
      o.connect(g); g.connect(warm);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    };
    let stopped = false, ci = 0, beat = 0;
    const tick = () => {
      if (stopped || !ambMaster) return;
      const ch = CHORDS[ci];
      if (beat === 0) note(ch.bass, 1.8, 0.46, "triangle");                       // baixo no início do acorde
      note(ch.notes[beat % ch.notes.length], 1.3, 0.30, "sine");                   // arpejo
      if (Math.random() < 0.3) note(ch.notes[(beat + 2) % ch.notes.length] * 2, 1.0, 0.12, "sine"); // brilho agudo
      beat++;
      if (beat >= 4) { beat = 0; ci = (ci + 1) % CHORDS.length; }
      ambTimer = setTimeout(tick, 400 + (Math.random() * 40 - 20));                // tempo com leve swing
    };
    tick();
    ambStopPad = () => { stopped = true; };
  } catch { /* sem áudio — segue sem música */ }
}
function stopAmbience() {
  if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
  if (ambStopPad) { ambStopPad(); ambStopPad = null; }
  const m = ambMaster; ambMaster = null;
  if (m && ambCtx) { try { m.gain.linearRampToValueAtTime(0, ambCtx.currentTime + 0.4); } catch { /* */ } }
  setTimeout(() => { if (m) { try { m.disconnect(); } catch { /* */ } } }, 600);
}
function setAmbienceMuted(muted: boolean) {
  if (ambMaster && ambCtx) { try { ambMaster.gain.linearRampToValueAtTime(muted ? 0 : AMB_LEVEL, ambCtx.currentTime + 0.3); } catch { /* */ } }
}

// ── Fundo de restaurante (recriado via CSS) ─────────────────────────────────────
function RestaurantBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#3c2616" }}>
      {/* foto real do restaurante, com leve desfoque p/ não competir com o card */}
      <div style={{ position: "absolute", inset: -14, backgroundImage: "url(/exercises/restaurante/fundo.jpg)",
        backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2.5px)", transform: "scale(1.04)" }} />
      {/* leve escurecimento p/ o card creme destacar */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(28,16,6,0.22)" }} />
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
        <div style={{ minHeight: 124, borderRadius: 15,
          backgroundImage: "repeating-linear-gradient(96deg, rgba(255,220,170,0.045) 0 2px, transparent 2px 8px), linear-gradient(160deg,#62431f,#49321a)",
          boxShadow: "inset 0 5px 16px rgba(18,10,3,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "14px 16px" }}>
          {items.map((it, i) => (
            <motion.div key={i} initial={{ scale: 0.4, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 440, damping: 22 }}
              style={{ flexShrink: 0, filter: "drop-shadow(0 6px 10px rgba(10,6,2,0.55))" }}>
              <ItemImg id={it.id} size={100} />
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
  const [sessionLevel, setSessionLevel] = useState(startLevel); // sobe na sessão (2 acertos = lista maior)
  const spec = R_LEVELS[sessionLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [expected, setExpected] = useState<Item[]>([]);
  const [sentence, setSentence] = useState("");
  const [keys, setKeys] = useState<Item[]>([]);
  const [tray, setTray] = useState<Item[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  const correctRef = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const inputAt = useRef(0);
  const trayRef = useRef<Item[]>([]);
  const startTime = useRef(Date.now());
  const runRef = useRef(0);
  const levelRef = useRef(startLevel);   // nível atual da sessão (fonte da verdade p/ a rodada)
  const streakRef = useRef(0);

  const modeHint = spec.mode === "inversa" ? "Monte começando pelo ÚLTIMO item (ordem inversa)."
    : spec.mode === "exclusao" ? "NÃO coloque o item que o pedido mandou ignorar."
    : spec.maxQty > 1 ? "Monte o pedido na ordem certa — repita o item na quantidade pedida."
    : "Monte o pedido na ordem correta.";

  const startRound = useCallback(async () => {
    runRef.current++; const myRun = runRef.current;
    const sp = R_LEVELS[levelRef.current];   // lê o nível atual (pode ter subido)
    const picks = shuffle(ITEMS).slice(0, sp.count);

    // quantidade por linha do pedido (só itens "contáveis" repetem)
    const qtys = picks.map((it) => {
      if (sp.maxQty <= 1 || !it.qOk) return 1;
      if (Math.random() < 0.5) return 1;
      return sp.maxQty >= 3 && Math.random() < 0.35 ? 3 : 2;
    });
    // garante ao menos UMA quantidade > 1 quando o nível pede
    if (sp.maxQty > 1 && !qtys.some((q) => q > 1)) {
      const idx = picks.findIndex((it) => it.qOk);
      if (idx >= 0) qtys[idx] = 2;
    }
    const lines = picks.map((it, i) => ({ it, q: qtys[i] }));

    // exclusão: remove uma linha inteira do esperado (mas ela aparece na frase p/ inibir)
    let excIdx = -1;
    if (sp.mode === "exclusao") excIdx = 1 + Math.floor(Math.random() * (picks.length - 1));
    const included = lines.filter((_, i) => i !== excIdx);

    // lista achatada esperada (com repetições por quantidade)
    let flat: Item[] = [];
    for (const l of included) for (let k = 0; k < l.q; k++) flat.push(l.it);
    if (sp.mode === "inversa") flat = [...flat].reverse();

    // frase do pedido (garçom anotando)
    const listStr = joinList(lines.map((l) => lineText(l.it, l.q)));
    const table = 2 + Math.floor(Math.random() * 8);
    const exc = excIdx >= 0 ? picks[excIdx] : null;
    const sent = exc
      ? `A mesa ${table} pediu ${listStr} — mas atenção: NÃO quer ${defArt(exc)} ${exc.n}.`
      : orderSentence(listStr, table);

    const distract = shuffle(ITEMS.filter((x) => !picks.some((p) => p.id === x.id))).slice(0, sp.distractors);

    setExpected(flat); setSentence(sent);
    setKeys(shuffle([...picks, ...distract]));
    setTray([]); trayRef.current = [];
    setFeedback(null);
    setPhase("order");

    if (sp.audio) {
      setSpeaking(true);
      await speak(sent);
      if (runRef.current !== myRun) return;
      setSpeaking(false);
    }
  }, []);

  const finish = useCallback(() => {
    const endLevel = levelRef.current;
    const sp = R_LEVELS[endLevel];
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "restaurante-ordem",
      domain: "memory",
      score: calculateExerciseScore("span-numerico", accTotal, meanRT ?? undefined, endLevel),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: endLevel,
      duration,
      metadata: {
        progressionV2: true,
        accTotal: Number(accTotal.toFixed(3)),
        level: endLevel,
        startedLevel: startLevel,
        items: sp.count,
        rule: sp.mode,
        quantities: sp.maxQty > 1,
        presentation: sp.audio ? "auditiva" : "visual",
        distractors: sp.distractors,
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, startLevel]);

  const validate = useCallback((picks: Item[]) => {
    const correct = picks.map((x) => x.n).join("·") === expected.map((x) => x.n).join("·");
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    // progressão na sessão: 2 acertos seguidos sobem 1 nível (lista maior); 2 erros descem
    streakRef.current = correct ? Math.max(streakRef.current, 0) + 1 : Math.min(streakRef.current, 0) - 1;
    if (streakRef.current >= 2)  { levelRef.current = Math.min(levelRef.current + 1, 10); streakRef.current = 0; setSessionLevel(levelRef.current); }
    else if (streakRef.current <= -2) { levelRef.current = Math.max(levelRef.current - 1, 1); streakRef.current = 0; setSessionLevel(levelRef.current); }
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, correct ? 3600 : 5200);
  }, [expected, trial, reportProgress, startRound, finish]);

  function place(it: Item) {
    if (phase !== "input") return;
    if (trayRef.current.length >= expected.length) return; // já tem o nº de itens do pedido (permite repetir item)
    const next = [...trayRef.current, it];
    trayRef.current = next; setTray(next);
    // NÃO envia automático — a pessoa confirma no botão "Pronto" (pode ajustar antes)
  }
  function undo() {
    if (phase !== "input") return;
    const next = trayRef.current.slice(0, -1);
    trayRef.current = next; setTray(next);
  }
  function goInput() { inputAt.current = Date.now(); setPhase("input"); }

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); stopAmbience(); }, []);
  // pré-carrega as fotos (tira o delay de aparecimento)
  useEffect(() => {
    if (typeof window === "undefined") return;
    ITEMS.forEach((i) => { const im = new window.Image(); im.src = photo(i.id); });
  }, []);
  function begin() {
    correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    levelRef.current = startLevel; streakRef.current = 0; setSessionLevel(startLevel);
    startAmbience(); setAmbienceMuted(!musicOn); startRound();
  }
  function toggleMusic() { setMusicOn((m) => { const next = !m; setAmbienceMuted(!next); return next; }); }

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
            style={{ position: "relative", width: "100%", maxWidth: 600, background: "#faf3e6", borderRadius: 28, padding: "22px 22px 16px",
            boxShadow: "0 26px 64px rgba(30,18,8,0.4)" }}>

            {/* botão de música (ambiência) */}
            <button onClick={toggleMusic} title={musicOn ? "Música de fundo: ligada" : "Música de fundo: muda"}
              style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", zIndex: 5,
                border: "1px solid #e7dcc4", background: "#fffdf7", cursor: "pointer", fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(120,90,50,0.12)" }}>
              {musicOn ? "🔊" : "🔇"}
            </button>

            {/* cabeçalho do card */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: "rgba(17,81,79,0.12)",
                border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UtensilsCrossed size={26} color="#11514f" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2a2018", marginBottom: 6 }}>Restaurante</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Chip icon={<BarChart3 size={13} />} text={`Nível ${sessionLevel}`} color="#1d7a6e" />
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
                <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 800, color: "#1d7a6e", textTransform: "uppercase", letterSpacing: 1 }}>
                  <span style={{ color: "#caa86a" }}>✦</span>📋 Pedido do cliente<span style={{ color: "#caa86a" }}>✦</span>
                </span>
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
                <button onClick={goInput} style={{ width: "100%", height: 52, borderRadius: 100, border: "none",
                  background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 6px 18px rgba(13,58,60,0.35)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="14" viewBox="0 0 24 20" fill="none"><path d="M2.5 18 H21.5 M4.5 18 a7.5 7.5 0 0 1 15 0 M12 5.5 V3.2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="2.6" r="1.4" fill="#fff"/></svg>
                  </span>
                  Montar bandeja →
                </button>
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
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(keys.length, 3)}, 1fr)`, gap: 12 }}>
                  {keys.map((it, i) => {
                    const placed = tray.filter((x) => x.n === it.n).length; // quantas vezes já está na bandeja
                    const sel = placed > 0;
                    const full = tray.length >= expected.length;
                    return (
                      <motion.button key={`${it.id}-${i}`} onClick={() => place(it)} disabled={full} whileTap={{ scale: 0.93 }}
                        style={{ borderRadius: 18, cursor: full ? "default" : "pointer", padding: "12px 8px 10px",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                          opacity: full && !sel ? 0.5 : 1,
                          background: sel ? "#eef6f4" : "#fffdf7", border: sel ? "2px solid #2f9e8f" : "1.5px solid #ece0c8",
                          boxShadow: sel ? "0 2px 8px rgba(47,158,143,0.18)" : "0 4px 12px rgba(120,90,50,0.12)",
                          transition: "all .2s" }}>
                        <span style={{ position: "relative", width: "100%", maxWidth: 150, aspectRatio: "1 / 1" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo(it.id)} alt="" draggable={false}
                            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }} />
                          {placed > 0 && <span style={{ position: "absolute", top: -2, right: -2, minWidth: 24, height: 24, padding: "0 6px", borderRadius: 12,
                            background: "#2f9e8f", color: "#fff", fontSize: 13.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(47,158,143,0.4)" }}>{placed > 1 ? `×${placed}` : "✓"}</span>}
                        </span>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: sel ? "#1d7a6e" : "#4a4234", textAlign: "center", lineHeight: 1.15 }}>{it.n}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Pronto — a pessoa confirma quando terminar (e pode ajustar antes) */}
                <button onClick={() => validate(trayRef.current)} disabled={tray.length === 0}
                  style={{ width: "100%", height: 52, borderRadius: 100, border: "none", marginTop: 4,
                    background: tray.length > 0 ? "linear-gradient(135deg,#11514f,#0d3a3c)" : "#e2dcce",
                    color: tray.length > 0 ? "#fff" : "#a89a82", fontWeight: 800, fontSize: 15,
                    cursor: tray.length > 0 ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: tray.length > 0 ? "0 6px 18px rgba(13,58,60,0.35)" : "none", transition: "all .2s" }}>
                  ✓ Pronto {tray.length > 0 ? `(${tray.length}/${expected.length})` : ""}
                </button>
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
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "#9a8f7e", marginBottom: 6 }}>Ordem correta:</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      {expected.map((x, i) => (
                        <span key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#1d7a6e" }}>{i + 1}</span>
                          <ItemImg id={x.id} size={68} />
                        </span>
                      ))}
                    </div>
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
    </div>
  );
}
