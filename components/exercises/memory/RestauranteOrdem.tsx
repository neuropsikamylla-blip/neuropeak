"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, UtensilsCrossed, ChefHat, CheckCircle2, BarChart3, Users, Package, ArrowLeftRight, Ban } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { speakText } from "@/lib/voicePrefs";
import { VoicePicker } from "@/components/exercises/VoicePicker";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import type { ExerciseResult, Theme } from "@/types";

interface RestauranteOrdemProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  auditory?: boolean;
}

interface Item { id: string; n: string; art: string; } // foto: /exercises/restaurante/<id>.png
const ITEMS: Item[] = [
  // bebidas
  { id: "agua", n: "Água", art: "uma" },
  { id: "agua-coco", n: "Água de coco", art: "uma" },
  { id: "refrigerante", n: "Refrigerante", art: "um" },
  { id: "suco-laranja", n: "Suco", art: "um" },
  { id: "vitamina", n: "Vitamina", art: "uma" },
  // pratos principais
  { id: "arroz-feijao", n: "Arroz e feijão", art: "um" },
  { id: "frango-batata", n: "Frango", art: "um" },
  { id: "bife-legumes", n: "Bife", art: "um" },
  { id: "macarrao-bolonhesa", n: "Macarrão", art: "um" },
  { id: "lasanha", n: "Lasanha", art: "uma" },
  { id: "risoto-cogumelo", n: "Risoto", art: "um" },
  { id: "omelete", n: "Omelete", art: "uma" },
  { id: "arroz-frutos-mar", n: "Arroz do mar", art: "um" },
  { id: "batata-frita", n: "Batata frita", art: "uma" },
  { id: "salmao", n: "Salmão", art: "um" },
  // sobremesas
  { id: "bolo", n: "Bolo", art: "um" },
  { id: "pudim", n: "Pudim", art: "um" },
  { id: "sorvete", n: "Sorvete", art: "um" },
  { id: "mousse", n: "Mousse", art: "uma" },
  { id: "torta", n: "Torta", art: "uma" },
  { id: "rosquinha", n: "Rosquinha", art: "uma" },
  { id: "maca", n: "Maçã", art: "uma" },
  { id: "salada-frutas", n: "Salada de frutas", art: "uma" },
  { id: "brigadeiro", n: "Brigadeiro", art: "um" },
  { id: "brownie", n: "Brownie", art: "um" },
  // lanches
  { id: "hamburguer", n: "Hambúrguer", art: "um" },
  { id: "sanduiche-frio", n: "Sanduíche", art: "um" },
  { id: "pizza", n: "Pizza", art: "uma" },
  { id: "cachorro-quente", n: "Cachorro quente", art: "um" },
  { id: "nuggets", n: "Nuggets", art: "uns" },
  { id: "pastel", n: "Pastel", art: "um" },
  { id: "tapioca", n: "Tapioca", art: "uma" },
  { id: "croissant", n: "Croissant", art: "um" },
  { id: "pao-queijo", n: "Pão de queijo", art: "um" },
  // outros pratos
  { id: "bruschetta", n: "Bruschetta", art: "uma" },
  { id: "caldo", n: "Caldo", art: "um" },
  { id: "cesta-paes", n: "Pães", art: "uns" },
  { id: "legumes-grelhados", n: "Legumes", art: "uns" },
  { id: "ovo-frito", n: "Ovos", art: "uns" },
  { id: "peixe", n: "Peixe", art: "um" },
  { id: "salada", n: "Salada", art: "uma" },
  { id: "sopa", n: "Sopa", art: "uma" },
  { id: "tabua-queijos", n: "Queijos", art: "uns" },
];

// versão das fotos — subir quando reprocessar imagens (força recarga / fura cache)
const IMG_V = "?v=3";
const photo = (id: string) => `/exercises/restaurante/${id}.png${IMG_V}`;

// Itens já vêm pré-montados (prato/copo/tigela próprios) — renderiza a foto direto.
function ItemImg({ id, size }: { id: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo(id)} alt="" draggable={false} width={size} height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }} />
  );
}

// ── Níveis (progressão da Kamylla): 1 cliente c/ + itens → 2 clientes → troca → cancelamento → 2 mudanças ──
type ModKind = "swap" | "swapMid" | "cancel";
interface RLevel { clients: 1 | 2; items: number; mods: ModKind[]; }
const R_LEVELS: Record<number, RLevel> = {
  1:  { clients: 1, items: 2, mods: [] },
  2:  { clients: 1, items: 3, mods: [] },
  3:  { clients: 1, items: 4, mods: [] },
  4:  { clients: 1, items: 5, mods: [] },
  5:  { clients: 2, items: 2, mods: [] },
  6:  { clients: 2, items: 3, mods: [] },
  7:  { clients: 2, items: 3, mods: ["swap"] },     // troca simples
  8:  { clients: 2, items: 3, mods: ["cancel"] },   // cancelamento
  9:  { clients: 2, items: 4, mods: ["swapMid"] },  // troca em item do meio
  10: { clients: 2, items: 4, mods: ["swap", "cancel"] }, // duas mudanças
};
const levelOf = (d: number): number => Math.min(10, Math.max(1, Math.round(d)));
const TRIALS = 10;

function modChip(sp: RLevel): { text: string; color: string } | null {
  if (sp.mods.includes("swap") && sp.mods.includes("cancel")) return { text: "Troca + cancelamento", color: "#c2463a" };
  if (sp.mods.includes("cancel")) return { text: "Cancelamento", color: "#c2463a" };
  if (sp.mods.includes("swapMid")) return { text: "Troca (no meio)", color: "#d9772b" };
  if (sp.mods.includes("swap")) return { text: "Troca", color: "#d9772b" };
  return null;
}

function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function joinList(parts: string[]): string {
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
}
function defArt(it: Item): string { return it.art === "uma" ? "a" : it.art === "uns" ? "os" : "o"; }
function pelo(it: Item): string { const d = defArt(it); return d === "a" ? "pela" : d === "os" ? "pelos" : "pelo"; }
function uniqById(arr: Item[]): Item[] { const s = new Set<string>(); const o: Item[] = []; for (const x of arr) if (!s.has(x.id)) { s.add(x.id); o.push(x); } return o; }

// ── Geração da rodada ────────────────────────────────────────────────────────────
interface ModInfo { client: number; kind: "swap" | "cancel"; oldItem: Item; newItem?: Item; }
interface Round { initial: Item[][]; finals: Item[][]; mods: ModInfo[]; keys: Item[]; }

function buildRound(sp: RLevel): Round {
  const pool = shuffle(ITEMS);
  let p = 0;
  const initial: Item[][] = [];
  for (let c = 0; c < sp.clients; c++) { initial.push(pool.slice(p, p + sp.items)); p += sp.items; }
  const finals = initial.map((o) => [...o]);
  const mods: ModInfo[] = [];
  const extras: Item[] = []; // itens trocados/cancelados — viram distratores naturais

  // se há 2 modificações, em clientes diferentes (troca no 1, cancelamento no 2 — ordem aleatória)
  const twoMods = sp.mods.length > 1;
  let swapClient = 0, cancelClient = sp.clients > 1 ? 1 : 0;
  if (twoMods && Math.random() < 0.5) { swapClient = 1; cancelClient = 0; }
  else if (!twoMods && sp.clients === 2) { const c = Math.floor(Math.random() * 2); swapClient = c; cancelClient = c; }

  for (const kind of sp.mods) {
    if (kind === "swap" || kind === "swapMid") {
      const c = swapClient;
      const list = finals[c];
      const pos = kind === "swapMid"
        ? 1 + Math.floor(Math.random() * Math.max(1, list.length - 2))   // posição interior
        : Math.floor(Math.random() * list.length);
      const oldItem = list[pos];
      const newItem = pool[p++];   // item inédito (distinto de todos)
      list[pos] = newItem;
      mods.push({ client: c, kind: "swap", oldItem, newItem });
      extras.push(oldItem);
    } else { // cancel
      const c = cancelClient;
      const list = finals[c];
      const pos = Math.floor(Math.random() * list.length);
      const removed = list.splice(pos, 1)[0];
      mods.push({ client: c, kind: "cancel", oldItem: removed });
      extras.push(removed);
    }
  }

  const inPlay = uniqById([...finals.flat(), ...extras]);
  const distractN = sp.clients === 2 ? 3 : 2;
  const distract = shuffle(ITEMS.filter((x) => !inPlay.some((i) => i.id === x.id))).slice(0, distractN);
  const keys = shuffle([...inPlay, ...distract]);
  return { initial, finals, mods, keys };
}

const whoLabel = (clients: number, c: number) => clients === 1 ? "O cliente" : `O Cliente ${c + 1}`;
function modText(clients: number, m: ModInfo): string {
  const who = whoLabel(clients, m.client);
  return m.kind === "swap"
    ? `${who} trocou ${defArt(m.oldItem)} ${m.oldItem.n} ${pelo(m.newItem!)} ${m.newItem!.n}.`
    : `${who} cancelou ${defArt(m.oldItem)} ${m.oldItem.n}.`;
}
// Texto falado do pedido (modo auditivo) — 1 ou 2 clientes.
function orderSpeechText(round: Round, clients: number): string {
  return round.initial.map((o, c) =>
    `${clients === 1 ? "O cliente pediu" : `Cliente ${c + 1} pediu`}: ${joinList(o.map((i) => i.n))}.`).join(" ");
}
function modSpeechText(round: Round, clients: number): string {
  return round.mods.map((m) => modText(clients, m)).join(" ");
}
type Phase = "ready" | "order" | "mod" | "input" | "feedback";

// ── Música ambiente sintetizada (Web Audio) — 100% sem direitos autorais ─────────
let ambCtx: AudioContext | null = null;
let ambMaster: GainNode | null = null;
let ambTimer: ReturnType<typeof setTimeout> | null = null;
let ambStopPad: (() => void) | null = null;
const AMB_LEVEL = 0.17;

function startAmbience() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ambCtx) ambCtx = new Ctx();
    if (ambCtx.state === "suspended") ambCtx.resume();
    if (ambMaster) return;
    const ctx = ambCtx;
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(AMB_LEVEL, ctx.currentTime + 1.5);
    ambMaster = master;
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 2000; warm.connect(master);
    const CHORDS = [
      { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88] },
      { bass: 110.00, notes: [261.63, 329.63, 392.00, 440.00] },
      { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25] },
      { bass: 196.00, notes: [293.66, 349.23, 392.00, 493.88] },
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
      if (beat === 0) note(ch.bass, 1.8, 0.46, "triangle");
      note(ch.notes[beat % ch.notes.length], 1.3, 0.30, "sine");
      if (Math.random() < 0.3) note(ch.notes[(beat + 2) % ch.notes.length] * 2, 1.0, 0.12, "sine");
      beat++;
      if (beat >= 4) { beat = 0; ci = (ci + 1) % CHORDS.length; }
      ambTimer = setTimeout(tick, 400 + (Math.random() * 40 - 20));
    };
    tick();
    ambStopPad = () => { stopped = true; };
  } catch { /* sem áudio */ }
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

// ── Fundo de restaurante ─────────────────────────────────────────────────────────
function RestaurantBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#3c2616" }}>
      <div style={{ position: "absolute", inset: -14, backgroundImage: "url(/exercises/restaurante/fundo.jpg)",
        backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2.5px)", transform: "scale(1.04)" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(28,16,6,0.22)" }} />
    </div>
  );
}

// ── Chip do cabeçalho ──────────────────────────────────────────────────────────────
function Chip({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 100,
      background: `${color}1a`, border: `1px solid ${color}40`, color, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>
      {icon}{text}
    </span>
  );
}

// ── Bandeja de nogueira — só imagens dos alimentos (sem nomes/vagas) ───────────────
// O tamanho dos alimentos varia pelo nº de pedidos: 1 = grande, 2 = médio, 3 = menor.
function Tray({ items, count }: { items: Item[]; count: number }) {
  const sz = count >= 3 ? { item: 64, gap: 10, minH: 82 }
    : count === 2 ? { item: 86, gap: 14, minH: 102 }
    : { item: 132, gap: 22, minH: 150 };
  const Handle = ({ side }: { side: "left" | "right" }) => (
    <div style={{ position: "absolute", top: "50%", [side]: -15, transform: "translateY(-50%)", width: 30, height: 50, zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "45%", border: "5px solid #c8a24e",
        boxShadow: "0 2px 6px rgba(50,30,8,0.4), inset 0 1px 2px rgba(255,238,190,0.7)" }} />
    </div>
  );
  return (
    <div style={{ position: "relative", margin: "0 18px" }}>
      <Handle side="left" /><Handle side="right" />
      <div style={{ position: "relative", zIndex: 1, borderRadius: 22, padding: 12,
        background: "linear-gradient(160deg,#7a5230 0%,#5c3d22 55%,#492f18 100%)",
        boxShadow: "0 16px 36px rgba(50,30,10,0.4), inset 0 2px 3px rgba(255,228,185,0.3), inset 0 -3px 7px rgba(30,18,6,0.55)" }}>
        <div style={{ borderRadius: 15, minHeight: sz.minH,
          backgroundImage: "repeating-linear-gradient(96deg, rgba(255,220,170,0.045) 0 2px, transparent 2px 8px), linear-gradient(160deg,#62431f,#49321a)",
          boxShadow: "inset 0 5px 16px rgba(18,10,3,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: sz.gap, flexWrap: "nowrap", padding: "10px 14px" }}>
          {items.map((it, i) => (
            <motion.div key={i} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 440, damping: 22 }}
              style={{ width: sz.item, aspectRatio: "1 / 1", flexShrink: 1, minWidth: 0, filter: "drop-shadow(0 6px 10px rgba(10,6,2,0.55))" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo(it.id)} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sequência do pedido em TEXTO (nomes separados por seta) ───────────────────────
function OrderSeqText({ items }: { items: Item[] }) {
  return (
    <p style={{ fontSize: 16, fontWeight: 800, color: "#2a2018", textAlign: "center", lineHeight: 1.4 }}>
      {items.map((it, i) => (
        <span key={i}>{i > 0 && <span style={{ color: "#caa86a", margin: "0 4px" }}>→</span>}{it.n}</span>
      ))}
    </p>
  );
}

export function RestauranteOrdem({ difficulty, onComplete, auditory = false }: RestauranteOrdemProps) {
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const [sessionLevel, setSessionLevel] = useState(startLevel);
  const spec = R_LEVELS[sessionLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState<Round | null>(null);
  const [trays, setTrays] = useState<Item[][]>([]);
  const [active, setActive] = useState(0);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [clientsOk, setClientsOk] = useState<boolean[]>([]);
  const [musicOn, setMusicOn] = useState(true);
  const [showVoice, setShowVoice] = useState(false);

  const correctRef = useRef(0);
  const startTime = useRef(Date.now());
  const inputAt = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const runRef = useRef(0);
  const levelRef = useRef(startLevel);
  const streakRef = useRef(0);
  const traysRef = useRef<Item[][]>([]);
  const activeRef = useRef(0);
  const roundRef = useRef<Round | null>(null);

  const startRound = useCallback(() => {
    runRef.current++;
    const sp = R_LEVELS[levelRef.current];
    const r = buildRound(sp);
    roundRef.current = r;
    setRound(r);
    const empties = r.finals.map(() => [] as Item[]);
    traysRef.current = empties; setTrays(empties);
    activeRef.current = 0; setActive(0);
    setFeedback(null); setClientsOk([]);
    setPhase("order");
  }, []);

  const finish = useCallback(() => {
    const endLevel = levelRef.current;
    const sp = R_LEVELS[endLevel];
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: auditory ? "restaurante-ordem-auditivo" : "restaurante-ordem",
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
        clients: sp.clients,
        itemsPerClient: sp.items,
        modifications: sp.mods.join("+") || "nenhuma",
        sequencesCorrect: correctRef.current,
        sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT,
      },
    });
  }, [onComplete, startLevel, auditory]);

  const validate = useCallback(() => {
    const r = roundRef.current; if (!r) return;
    const ok = r.finals.map((exp, c) => traysRef.current[c].map((x) => x.id).join("·") === exp.map((x) => x.id).join("·"));
    const correct = ok.every(Boolean);
    if (correct) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    streakRef.current = correct ? Math.max(streakRef.current, 0) + 1 : Math.min(streakRef.current, 0) - 1;
    if (streakRef.current >= 2) { levelRef.current = Math.min(levelRef.current + 1, 10); streakRef.current = 0; setSessionLevel(levelRef.current); }
    else if (streakRef.current <= -2) { levelRef.current = Math.max(levelRef.current - 1, 1); streakRef.current = 0; setSessionLevel(levelRef.current); }
    setClientsOk(ok);
    setFeedback(correct ? "correct" : "incorrect");
    setPhase("feedback");
    const nextTrial = trial + 1;
    reportProgress(Math.round((nextTrial / TRIALS) * 100));
    setTimeout(() => { if (nextTrial >= TRIALS) finish(); else { setTrial(nextTrial); startRound(); } }, correct ? 3200 : 5000);
  }, [trial, reportProgress, startRound, finish]);

  function place(it: Item) {
    if (phase !== "input") return;
    const r = roundRef.current; if (!r) return;
    const ac = activeRef.current;
    if (traysRef.current[ac].length >= r.finals[ac].length) return; // bandeja do cliente ativa cheia
    const nt = traysRef.current.map((t, i) => (i === ac ? [...t, it] : t));
    traysRef.current = nt; setTrays(nt);
    // avança sozinho se a bandeja ativa encheu e houver outra incompleta
    if (nt[ac].length >= r.finals[ac].length) {
      const next = nt.findIndex((t, i) => t.length < r.finals[i].length);
      if (next >= 0) { activeRef.current = next; setActive(next); }
    }
  }
  function undo() {
    if (phase !== "input") return;
    const ac = activeRef.current;
    if (!traysRef.current[ac]?.length) return;
    const nt = traysRef.current.map((t, i) => (i === ac ? t.slice(0, -1) : t));
    traysRef.current = nt; setTrays(nt);
  }
  function clearTray() {
    if (phase !== "input") return;
    const nt = traysRef.current.map(() => [] as Item[]);   // limpa todas as bandejas
    traysRef.current = nt; setTrays(nt);
    activeRef.current = 0; setActive(0);                    // volta o foco ao 1º pedido
  }
  function selectClient(c: number) { activeRef.current = c; setActive(c); }
  function goAfterOrder() { if (round && round.mods.length) setPhase("mod"); else goInput(); }
  function goInput() { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); inputAt.current = Date.now(); setPhase("input"); }

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); stopAmbience(); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    ITEMS.forEach((i) => { const im = new window.Image(); im.src = photo(i.id); });
  }, []);
  // modo auditivo: fala o pedido (fase order) / a mudança (fase mod) ao entrar
  useEffect(() => {
    if (!auditory || !round) return;
    if (phase === "order") speakText(orderSpeechText(round, round.initial.length), { rate: 0.95 });
    else if (phase === "mod") speakText(modSpeechText(round, round.initial.length), { rate: 0.95 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, auditory]);

  function replay() {
    if (!round) return;
    if (phase === "order") speakText(orderSpeechText(round, round.initial.length), { rate: 0.95 });
    else if (phase === "mod") speakText(modSpeechText(round, round.initial.length), { rate: 0.95 });
  }

  function begin() {
    correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    levelRef.current = startLevel; streakRef.current = 0; setSessionLevel(startLevel);
    startAmbience(); setAmbienceMuted(!musicOn); startRound();
  }
  function toggleMusic() { setMusicOn((m) => { const next = !m; setAmbienceMuted(!next); return next; }); }

  const shake = phase === "feedback" && feedback === "incorrect";
  const totalPlaced = trays.reduce((s, t) => s + t.length, 0);
  const mc = modChip(spec);

  // ── READY ──
  if (phase === "ready") {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#3c2616" }}>
        <RestaurantBg />
        {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}
        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
          <div style={{ width: "100%", maxWidth: 440, background: "#f6efe0", borderRadius: 26, padding: "26px 22px",
            textAlign: "center", boxShadow: "0 22px 60px rgba(30,18,8,0.45)" }}>
            <div style={{ margin: "0 auto 14px", width: 70, height: 70, borderRadius: "50%",
              background: "rgba(17,81,79,0.12)", border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {auditory ? <Volume2 size={36} color="#11514f" /> : <ChefHat size={36} color="#11514f" />}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2a2018", marginBottom: 6 }}>Restaurante{auditory ? " — Auditivo" : ""}</h2>
            <p style={{ fontSize: 13.5, color: "#6b6052", marginBottom: 6 }}>
              {auditory ? <>Você vai <b>ouvir</b> o pedido (sem ler) e montar cada bandeja na ordem certa.</> : <>Leia o pedido e monte cada bandeja na ordem certa.</>} Nos níveis mais altos o cliente pode <b>trocar</b> ou <b>cancelar</b> um item.
            </p>
            <p style={{ fontSize: 12, color: "#9a8f7e", marginBottom: 18 }}>
              Você começa no nível {startLevel} ({spec.clients === 1 ? "1 cliente" : "2 clientes"} · {spec.items} itens{mc ? ` · ${mc.text.toLowerCase()}` : ""}) — onde parou.
            </p>
            {auditory && (
              <button onClick={() => setShowVoice(true)} style={{ width: "100%", height: 44, marginBottom: 10, borderRadius: 14, cursor: "pointer",
                background: "#fffdf7", border: "1px solid #e2d8c2", color: "#8a7c63", fontWeight: 800, fontSize: 13.5 }}>🎚️ Escolher a voz (feminina/masculina)</button>
            )}
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
      {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 16px" }}>
          <motion.div animate={shake ? { x: [0, -9, 9, -7, 7, 0] } : { x: 0 }} transition={{ duration: 0.45 }}
            style={{ position: "relative", width: "100%", maxWidth: 600, background: "#faf3e6", borderRadius: 28, padding: "22px 22px 16px",
            boxShadow: "0 26px 64px rgba(30,18,8,0.4)" }}>

            {/* botão de música */}
            <button onClick={toggleMusic} title={musicOn ? "Música de fundo: ligada" : "Música de fundo: muda"}
              style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", zIndex: 5,
                border: "1px solid #e7dcc4", background: "#fffdf7", cursor: "pointer", fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(120,90,50,0.12)" }}>
              {musicOn ? "🔊" : "🔇"}
            </button>

            {/* cabeçalho */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: "rgba(17,81,79,0.12)",
                border: "1px solid rgba(17,81,79,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UtensilsCrossed size={26} color="#11514f" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2a2018", marginBottom: 6 }}>Restaurante</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Chip icon={<BarChart3 size={13} />} text={`Nível ${sessionLevel}`} color="#1d7a6e" />
                  <Chip icon={<Users size={13} />} text={spec.clients === 1 ? "1 cliente" : "2 clientes"} color="#2563eb" />
                  <Chip icon={<Package size={13} />} text={`${spec.items} itens`} color="#e0892a" />
                  {mc && <Chip icon={mc.text.includes("ancel") ? <Ban size={13} /> : <ArrowLeftRight size={13} />} text={mc.text} color={mc.color} />}
                </div>
              </div>
            </div>

            {round && (
              <>
                {/* ── ORDER ── */}
                {phase === "order" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 800, color: "#1d7a6e", textTransform: "uppercase", letterSpacing: 1 }}>
                      <span style={{ color: "#caa86a" }}>✦</span>{auditory ? "🎧 Ouça o pedido" : `📋 Pedido${spec.clients > 1 ? "s" : ""} do${spec.clients > 1 ? "s clientes" : " cliente"}`}<span style={{ color: "#caa86a" }}>✦</span>
                    </span>
                    {auditory ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", padding: "8px 0" }}>
                        <motion.div animate={{ scale: [1, 1.09, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
                          style={{ width: 92, height: 92, borderRadius: "50%", background: "rgba(17,81,79,0.1)", border: "1px solid rgba(17,81,79,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Volume2 size={44} color="#11514f" />
                        </motion.div>
                        <p style={{ fontSize: 14, color: "#6b6052", textAlign: "center", maxWidth: 320 }}>
                          Ouça {spec.clients > 1 ? "os pedidos dos clientes" : "o pedido do cliente"} e memorize para montar na ordem certa.
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                          <button onClick={replay} style={{ fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 100, cursor: "pointer",
                            background: "rgba(17,81,79,0.1)", border: "1px solid rgba(17,81,79,0.3)", color: "#11514f" }}>🔊 Ouvir de novo</button>
                          <button onClick={() => setShowVoice(true)} style={{ fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 100, cursor: "pointer",
                            background: "#fffdf7", border: "1px solid #e2d8c2", color: "#8a7c63" }}>🎚️ Trocar voz</button>
                        </div>
                      </div>
                    ) : round.initial.map((o, c) => (
                      <div key={c} style={{ width: "100%", padding: "14px 16px", borderRadius: 16,
                        background: "rgba(17,81,79,0.06)", border: "1px solid rgba(17,81,79,0.16)" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 900, color: "#11514f", marginBottom: 8, textAlign: "center" }}>
                          {spec.clients === 1 ? "O cliente pediu:" : `Cliente ${c + 1} pediu:`}
                        </div>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "#2a2018", textAlign: "center", lineHeight: 1.4 }}>
                          {joinList(o.map((i) => i.n))}.
                        </p>
                      </div>
                    ))}
                    <button onClick={goAfterOrder} style={{ width: "100%", height: 52, borderRadius: 100, border: "none",
                      background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(13,58,60,0.35)" }}>
                      {round.mods.length ? "Continuar →" : "Montar bandeja →"}
                    </button>
                  </div>
                )}

                {/* ── MOD (troca/cancelamento) ── */}
                {phase === "mod" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0 4px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "#c2463a", textTransform: "uppercase", letterSpacing: 1 }}>
                      📣 Mudança no pedido!
                    </span>
                    {auditory ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", padding: "8px 0" }}>
                        <motion.div animate={{ scale: [1, 1.09, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
                          style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(194,70,58,0.1)", border: "1px solid rgba(194,70,58,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Volume2 size={40} color="#c2463a" />
                        </motion.div>
                        <p style={{ fontSize: 14, color: "#6b6052", textAlign: "center", maxWidth: 320 }}>Ouça a mudança no pedido e ajuste o que for montar.</p>
                        <button onClick={replay} style={{ fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 100, cursor: "pointer",
                          background: "rgba(17,81,79,0.1)", border: "1px solid rgba(17,81,79,0.3)", color: "#11514f" }}>🔊 Ouvir de novo</button>
                      </div>
                    ) : round.mods.map((m, i) => (
                      <div key={i} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 16px", borderRadius: 16,
                        background: m.kind === "cancel" ? "rgba(194,70,58,0.08)" : "rgba(217,119,43,0.08)",
                        border: `1px solid ${m.kind === "cancel" ? "rgba(194,70,58,0.3)" : "rgba(217,119,43,0.3)"}` }}>
                        <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          background: m.kind === "cancel" ? "rgba(194,70,58,0.15)" : "rgba(217,119,43,0.15)" }}>
                          {m.kind === "cancel" ? <Ban size={22} color="#c2463a" /> : <ArrowLeftRight size={22} color="#d9772b" />}
                        </div>
                        <p style={{ flex: 1, fontSize: 16, fontWeight: 800, color: "#2a2018" }}>{modText(spec.clients, m)}</p>
                      </div>
                    ))}
                    <button onClick={goInput} style={{ width: "100%", height: 52, borderRadius: 100, border: "none",
                      background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(13,58,60,0.35)" }}>Montar bandeja →</button>
                  </div>
                )}

                {/* ── INPUT ── */}
                {phase === "input" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ textAlign: "center", fontSize: 14.5, fontWeight: 800, color: "#2a2018" }}>
                      {spec.clients === 1 ? "Monte o pedido na ordem certa." : "Monte os pedidos na ordem certa."}
                      {round.mods.length ? " Aplique as mudanças!" : ""}
                    </p>

                    {trays.map((t, c) => {
                      const multi = spec.clients > 1;
                      const isActive = multi && active === c;
                      return (
                        <div key={c} onClick={() => multi && selectClient(c)}
                          style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 16,
                            padding: multi ? "5px 6px" : 0, cursor: multi ? "pointer" : "default",
                            border: multi ? `2px solid ${isActive ? "#2f9e8f" : "transparent"}` : "none",
                            background: multi && isActive ? "rgba(47,158,143,0.10)" : "transparent",
                            boxShadow: isActive ? "0 0 14px rgba(47,158,143,0.22)" : "none", transition: "all .2s" }}>
                          {multi && (
                            <div style={{ flexShrink: 0, width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: isActive ? "#2f9e8f" : "#c4cdc6",
                                color: "#fff", fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: isActive ? "0 2px 8px rgba(47,158,143,0.5)" : "none" }}>{c + 1}</div>
                              <div style={{ fontSize: 10.5, fontWeight: 800, color: isActive ? "#1d7a6e" : "#9a8f7e", textAlign: "center", lineHeight: 1.05 }}>{c + 1}º pedido</div>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Tray items={t} count={spec.clients} />
                          </div>
                        </div>
                      );
                    })}

                    {traysRef.current[active]?.length > 0 && (
                      <button onClick={undo} style={{ alignSelf: "center", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 10,
                        background: "#ece3d1", color: "#6b6052", border: "none", cursor: "pointer" }}>↩ desfazer</button>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(round.keys.length, 4)}, 1fr)`, gap: 10 }}>
                      {round.keys.map((it, i) => {
                        const placed = traysRef.current[active]?.filter((x) => x.id === it.id).length || 0;
                        const sel = trays.some((t) => t.some((x) => x.id === it.id));
                        const full = (roundRef.current && traysRef.current[active]?.length >= roundRef.current.finals[active].length) || false;
                        return (
                          <motion.button key={`${it.id}-${i}`} onClick={() => place(it)} disabled={full} whileTap={{ scale: 0.93 }}
                            style={{ borderRadius: 16, cursor: full ? "default" : "pointer", padding: "6px 5px 6px",
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                              opacity: full && !placed ? 0.5 : 1,
                              background: sel ? "#eef6f4" : "#fffdf7", border: sel ? "2px solid #2f9e8f" : "1.5px solid #ece0c8",
                              boxShadow: sel ? "0 2px 8px rgba(47,158,143,0.18)" : "0 4px 12px rgba(120,90,50,0.12)",
                              transition: "all .2s" }}>
                            <span style={{ position: "relative", width: "100%", maxWidth: 142, aspectRatio: "1 / 1" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo(it.id)} alt="" draggable={false}
                                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }} />
                              {placed > 0 && <span style={{ position: "absolute", top: -2, right: -2, minWidth: 22, height: 22, padding: "0 5px", borderRadius: 11,
                                background: "#2f9e8f", color: "#fff", fontSize: 12.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(47,158,143,0.4)" }}>✓</span>}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: sel ? "#1d7a6e" : "#4a4234", textAlign: "center", lineHeight: 1.12 }}>{it.n}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* limpar bandeja(s) + pronto */}
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button onClick={clearTray} disabled={totalPlaced === 0}
                        style={{ flex: "0 0 auto", height: 50, padding: "0 18px", borderRadius: 100, fontWeight: 800, fontSize: 13.5,
                          background: "#fffdf7", border: "1.5px solid #e1d6bd", color: totalPlaced > 0 ? "#8a7c63" : "#c3b89e",
                          cursor: totalPlaced > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                        🗑 Limpar bandeja{spec.clients > 1 ? "s" : ""}
                      </button>
                      <button onClick={validate} disabled={totalPlaced === 0}
                        style={{ flex: 1, height: 50, borderRadius: 100, border: "none",
                          background: totalPlaced > 0 ? "linear-gradient(135deg,#11514f,#0d3a3c)" : "#e2dcce",
                          color: totalPlaced > 0 ? "#fff" : "#a89a82", fontWeight: 800, fontSize: 15,
                          cursor: totalPlaced > 0 ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                          boxShadow: totalPlaced > 0 ? "0 6px 18px rgba(13,58,60,0.35)" : "none", transition: "all .2s" }}>
                        ✓ Pronto
                      </button>
                    </div>
                  </div>
                )}

                {/* ── FEEDBACK ── */}
                {phase === "feedback" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "12px 0" }}>
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 54 }}>
                      {feedback === "correct" ? "✅" : "❌"}
                    </motion.div>
                    <p style={{ fontSize: 22, fontWeight: 900, color: feedback === "correct" ? "#1d7a6e" : "#c2463a" }}>
                      {feedback === "correct" ? "Pedido certo!" : "Pedido errado"}
                    </p>
                    {feedback === "incorrect" && (
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#9a8f7e", textAlign: "center" }}>Ordem correta:</p>
                        {round.finals.map((exp, c) => (
                          <div key={c} style={{ padding: "10px 8px", borderRadius: 14, background: clientsOk[c] ? "rgba(29,122,110,0.08)" : "rgba(194,70,58,0.07)",
                            border: `1px solid ${clientsOk[c] ? "rgba(29,122,110,0.25)" : "rgba(194,70,58,0.22)"}` }}>
                            {spec.clients > 1 && <div style={{ fontSize: 12.5, fontWeight: 900, color: clientsOk[c] ? "#1d7a6e" : "#c2463a", textAlign: "center", marginBottom: 6 }}>
                              Cliente {c + 1} {clientsOk[c] ? "✓" : "✗"}
                            </div>}
                            <OrderSeqText items={exp} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* rodapé */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12,
              borderTop: "1px solid #e6ddca" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#9a8f7e" }}>
                <UtensilsCrossed size={15} color="#a89a82" />
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
