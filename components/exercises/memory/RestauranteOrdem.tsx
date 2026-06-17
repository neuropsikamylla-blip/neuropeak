"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Bell, ArrowLeftRight, Volume2 } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { speakText } from "@/lib/voicePrefs";
import { VoicePicker } from "@/components/exercises/VoicePicker";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { PresentationConfig, type PresMode } from "@/components/exercises/PresentationConfig";
import type { ExerciseResult, Theme } from "@/types";

interface RestauranteOrdemProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Itens (foto: /exercises/restaurante/<id>.png) ─────────────────────────────────
interface Item { id: string; n: string; art: string; }
const ITEMS: Item[] = [
  { id: "agua", n: "Água", art: "uma" }, { id: "agua-coco", n: "Água de coco", art: "uma" },
  { id: "refrigerante", n: "Refrigerante", art: "um" }, { id: "suco-laranja", n: "Suco", art: "um" },
  { id: "vitamina", n: "Vitamina", art: "uma" }, { id: "arroz-feijao", n: "Arroz e feijão", art: "um" },
  { id: "frango-batata", n: "Frango", art: "um" }, { id: "bife-legumes", n: "Bife", art: "um" },
  { id: "macarrao-bolonhesa", n: "Macarrão", art: "um" }, { id: "lasanha", n: "Lasanha", art: "uma" },
  { id: "risoto-cogumelo", n: "Risoto", art: "um" }, { id: "omelete", n: "Omelete", art: "uma" },
  { id: "batata-frita", n: "Batata frita", art: "uma" }, { id: "salmao", n: "Salmão", art: "um" },
  { id: "bolo", n: "Bolo", art: "um" }, { id: "pudim", n: "Pudim", art: "um" },
  { id: "sorvete", n: "Sorvete", art: "um" }, { id: "mousse", n: "Mousse", art: "uma" },
  { id: "torta", n: "Torta", art: "uma" }, { id: "maca", n: "Maçã", art: "uma" },
  { id: "hamburguer", n: "Hambúrguer", art: "um" }, { id: "sanduiche-frio", n: "Sanduíche", art: "um" },
  { id: "pizza", n: "Pizza", art: "uma" }, { id: "nuggets", n: "Nuggets", art: "uns" },
  { id: "tapioca", n: "Tapioca", art: "uma" }, { id: "croissant", n: "Croissant", art: "um" },
  { id: "pao-queijo", n: "Pão de queijo", art: "um" }, { id: "sopa", n: "Sopa", art: "uma" },
  { id: "salada", n: "Salada", art: "uma" }, { id: "peixe", n: "Peixe", art: "um" },
];
const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));
// Itens "claros" usados nos pedidos/distratores (fáceis de distinguir em foto pequena).
const CLEAR_IDS = [
  "agua", "suco-laranja", "salada", "sanduiche-frio", "croissant", "arroz-feijao", "batata-frita",
  "sopa", "lasanha", "risoto-cogumelo", "nuggets", "mousse", "pudim", "bolo", "pizza", "hamburguer",
  "frango-batata", "bife-legumes", "omelete", "sorvete", "tapioca", "pao-queijo",
];
const CLEAR: Item[] = CLEAR_IDS.map((id) => ITEM_MAP.get(id)!).filter(Boolean);

const IMG_V = "?v=3";
const photo = (id: string) => `/exercises/restaurante/${id}.png${IMG_V}`;

function ItemImg({ id, size }: { id: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo(id)} alt="" draggable={false} width={size} height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }} />
  );
}

// ── Cenas (Grupos A/B/C) — fundos base; nomes só na interface ──────────────────────
type Group = "A" | "B" | "C";
type Rel = "casal" | "amigas" | "amigos" | "família";
interface Scene { img: string; names: string[]; rel?: Rel; }
const sceneImg = (file: string) => `/exercises/restaurante/${file}`;
const SCENES: Record<Group, Scene[]> = {
  A: [
    { img: sceneImg("cena-solo-1.jpg"), names: ["Bia"] },
    { img: sceneImg("cena-solo-2.jpg"), names: ["Rafa"] },
    { img: sceneImg("cena-solo-3.jpg"), names: ["Lia"] },
    { img: sceneImg("cena-solo-4.jpg"), names: ["Carol"] },
    { img: sceneImg("cena-solo-5.jpg"), names: ["Tiago"] },
    { img: sceneImg("cena-solo-6.jpg"), names: ["Rosa"] },
    { img: sceneImg("cena-solo-7.jpg"), names: ["Tom"] },
    { img: sceneImg("cena-solo-8.jpg"), names: ["Léo"] },
    { img: sceneImg("cena-solo-9.jpg"), names: ["Ana"] },
    { img: sceneImg("cena-solo-10.jpg"), names: ["Davi"] },
  ],
  B: [
    { img: sceneImg("cena-2p-1.jpg"), names: ["Helena", "Diego"], rel: "casal" },
    { img: sceneImg("cena-2p-2.jpg"), names: ["Sofia", "Marcos"], rel: "casal" },
    { img: sceneImg("cena-2p-3.jpg"), names: ["Cida", "Jorge"], rel: "casal" },
    { img: sceneImg("cena-2p-4.jpg"), names: ["Paula", "Gabriel"], rel: "casal" },
    { img: sceneImg("cena-2p-5.jpg"), names: ["Duda", "Téo"], rel: "casal" },
    { img: sceneImg("cena-2p-6.jpg"), names: ["Lúcia", "Pedro"], rel: "casal" },
    { img: sceneImg("cena-2p-7.jpg"), names: ["Júlia", "Bel"], rel: "amigas" },
    { img: sceneImg("cena-2p-8.jpg"), names: ["Caio", "Edu"], rel: "amigos" },
    { img: sceneImg("cena-2p-9.jpg"), names: ["Mel", "Vitor"], rel: "casal" },
    { img: sceneImg("cena-2p-10.jpg"), names: ["Vera", "Rui"], rel: "casal" },
  ],
  C: [
    { img: sceneImg("cena-3p-1.jpg"), names: ["Carol", "Duda", "Nina"], rel: "amigas" },
    { img: sceneImg("cena-3p-2.jpg"), names: ["Pedro", "Hugo", "Davi"], rel: "amigos" },
    { img: sceneImg("cena-3p-3.jpg"), names: ["Daniel", "Manu", "Letícia"], rel: "família" },
    { img: sceneImg("cena-3p-4.jpg"), names: ["Inês", "Cris", "Yumi"], rel: "amigas" },
    { img: sceneImg("cena-3p-5.jpg"), names: ["Lana", "Téo", "Rui"], rel: "amigos" },
    { img: sceneImg("cena-3p-6.jpg"), names: ["Mel", "Bia", "Rita"], rel: "amigas" },
    { img: sceneImg("cena-3p-7.jpg"), names: ["Eva", "Sara", "Lipe"], rel: "família" },
    { img: sceneImg("cena-3p-8.jpg"), names: ["Otávio", "Glória", "Caio"], rel: "família" },
    { img: sceneImg("cena-3p-9.jpg"), names: ["Fran", "Edu", "Duda"], rel: "amigos" },
    { img: sceneImg("cena-3p-10.jpg"), names: ["Vitor", "Theo", "Dani"], rel: "família" },
  ],
};
const relText = (rel: Rel | undefined, names: string[]): string => {
  if (!rel || names.length < 2) return "";
  if (rel === "casal") return "casal";
  if (rel === "família") return "família";
  if (rel === "amigas") return "amigas — saíram para falar do trabalho";
  return "amigos — saíram para falar de negócios";
};

// ── Progressão (10 níveis) ─────────────────────────────────────────────────────────
// Reutiliza as cenas (A/B/C) e ESCALA por itens-por-pessoa: 2 pessoas podem pedir
// 1 item cada (2) e depois 2 cada (4); 3 pessoas 1 cada (3) → 2 cada (6); + ordem,
// + atualização de pedido, + 2 mesas em sequência.
interface RLevel { group: Group; items: number; order: boolean | "as_vezes"; update: boolean; mesas: number; }
const R_LEVELS: Record<number, RLevel> = {
  1:  { group: "A", items: 2, order: false,      update: false, mesas: 1 }, // 1 pessoa · 2 itens
  2:  { group: "B", items: 2, order: false,      update: false, mesas: 1 }, // 2 pessoas · 1 cada
  3:  { group: "B", items: 3, order: "as_vezes", update: false, mesas: 1 }, // 2 pessoas · 3 itens
  4:  { group: "C", items: 3, order: false,      update: false, mesas: 1 }, // 3 pessoas · 1 cada
  5:  { group: "C", items: 4, order: true,       update: false, mesas: 1 }, // 3 pessoas · ordem
  6:  { group: "B", items: 4, order: true,       update: false, mesas: 1 }, // 2 pessoas · 2 cada
  7:  { group: "C", items: 5, order: true,       update: false, mesas: 1 }, // 3 pessoas · 5 itens
  8:  { group: "C", items: 6, order: true,       update: false, mesas: 1 }, // 3 pessoas · 2 cada
  9:  { group: "C", items: 4, order: true,       update: true,  mesas: 1 }, // 3 pessoas · atualização
  10: { group: "B", items: 3, order: true,       update: false, mesas: 2 }, // 2 mesas em sequência
};
const MAX_LEVEL = 10;
const levelOf = (d: number): number => Math.max(1, Math.min(MAX_LEVEL, Math.round(d) || 1));
const memoSecsFor = (n: number): number => Math.max(7, Math.round(4 + n * 1.5)); // tempo escala com o pedido
const distractorsFor = (n: number): number => Math.min(7, Math.max(3, n + 2));
const TRIALS = 10;

// ── Helpers ────────────────────────────────────────────────────────────────────────
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function joinList(parts: string[]): string {
  return parts.length <= 1 ? (parts[0] ?? "") : parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
}
function uniqById(arr: Item[]): Item[] { const s = new Set<string>(); const o: Item[] = []; for (const x of arr) if (!s.has(x.id)) { s.add(x.id); o.push(x); } return o; }
function defArt(it: Item): string { return it.art === "uma" ? "a" : it.art === "uns" ? "os" : "o"; }
function pelo(it: Item): string { const d = defArt(it); return d === "a" ? "pela" : d === "os" ? "pelos" : "pelo"; }
function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort(), sb = [...b].sort();
  return sa.every((x, i) => x === sb[i]);
}

// ── Geração da rodada ────────────────────────────────────────────────────────────
type UpdKind = "swap" | "add" | "remove";
interface UpdInfo { kind: UpdKind; oldItem?: Item; newItem?: Item; }
interface Mesa { scene: Scene; order: Item[]; finalOrder: Item[]; update?: UpdInfo; }
interface Round { mesas: Mesa[]; called: number; keys: Item[]; orderRequired: boolean; }

function buildRound(level: number): Round {
  const sp = R_LEVELS[level];
  const orderRequired = sp.order === true ? true : sp.order === "as_vezes" ? Math.random() < 0.5 : false;
  const pool = shuffle(CLEAR);
  let pi = 0;
  const take = (k: number) => { const out: Item[] = []; while (out.length < k && pi < pool.length) out.push(pool[pi++]); return out; };

  const mesas: Mesa[] = [];
  for (let m = 0; m < sp.mesas; m++) {
    const arr = SCENES[sp.group];
    const scene = arr[Math.floor(Math.random() * arr.length)];
    const order = take(sp.items);
    mesas.push({ scene, order, finalOrder: [...order] });
  }
  const called = sp.mesas === 1 ? 0 : Math.floor(Math.random() * sp.mesas);

  // Atualização (Nível 5) — na mesa chamada: troca / adiciona / remove um item inteiro.
  if (sp.update) {
    const mesa = mesas[called];
    const order = mesa.order;
    const fresh = () => shuffle(CLEAR.filter((x) => !order.some((o) => o.id === x.id)))[0] ?? CLEAR[0];
    const kinds: UpdKind[] = order.length > 1 ? ["swap", "add", "remove"] : ["swap", "add"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    if (kind === "add") {
      const nw = take(1)[0] ?? fresh();
      mesa.finalOrder = [...order, nw];
      mesa.update = { kind, newItem: nw };
    } else if (kind === "remove") {
      const idx = Math.floor(Math.random() * order.length);
      const removed = order[idx];
      mesa.finalOrder = order.filter((_, i) => i !== idx);
      mesa.update = { kind, oldItem: removed };
    } else {
      const idx = Math.floor(Math.random() * order.length);
      const nw = take(1)[0] ?? fresh();
      const oldItem = order[idx];
      mesa.finalOrder = order.map((it, i) => (i === idx ? nw : it));
      mesa.update = { kind, oldItem, newItem: nw };
    }
  }

  // Opções da bancada: itens da mesa chamada + itens das outras mesas (interferência) + distratores.
  const calledFinal = mesas[called].finalOrder;
  const interference = mesas.filter((_, i) => i !== called).flatMap((mm) => mm.finalOrder);
  const inPlay = uniqById([...calledFinal, ...interference]);
  const distract = shuffle(CLEAR.filter((x) => !inPlay.some((i) => i.id === x.id))).slice(0, distractorsFor(sp.items));
  const keys = shuffle(uniqById([...inPlay, ...distract]));
  return { mesas, called, keys, orderRequired };
}

function updText(mesa: Mesa): string {
  const u = mesa.update; if (!u) return "";
  if (u.kind === "add") return `A mesa adicionou ${defArt(u.newItem!)} ${u.newItem!.n}.`;
  if (u.kind === "remove") return `A mesa removeu ${defArt(u.oldItem!)} ${u.oldItem!.n}.`;
  return `A mesa trocou ${defArt(u.oldItem!)} ${u.oldItem!.n} ${pelo(u.newItem!)} ${u.newItem!.n}.`;
}
function orderSpeech(mesa: Mesa, mesaNum: number): string {
  return `Mesa ${mesaNum}, ${joinList(mesa.scene.names)}: ${joinList(mesa.order.map((i) => i.n))}.`;
}

// ── Validação ──────────────────────────────────────────────────────────────────────
function validate(placed: Item[], mesa: Mesa, orderRequired: boolean): { ok: boolean; msg: string } {
  const exp = mesa.finalOrder.map((i) => i.id);
  const got = placed.map((i) => i.id);
  const expSet = new Set(exp), gotSet = new Set(got);
  if (mesa.update) {
    const oldIds = mesa.order.map((i) => i.id);
    if (sameMultiset(got, oldIds) && !sameMultiset(got, exp)) return { ok: false, msg: "Você usou a versão antiga do pedido." };
  }
  const extra = got.find((id) => !expSet.has(id));
  if (extra) return { ok: false, msg: "Há um item extra na bandeja." };
  if (exp.some((id) => !gotSet.has(id)) || got.length < exp.length) return { ok: false, msg: "Faltou um item." };
  if (orderRequired && got.join("·") !== exp.join("·")) return { ok: false, msg: "Os itens estão certos, mas a ordem está trocada." };
  return { ok: true, msg: "Pedido entregue!" };
}

// ── Áudio ambiente (Web Audio, sem direitos) ─────────────────────────────────────
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
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.02);
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
      beat++; if (beat >= 4) { beat = 0; ci = (ci + 1) % CHORDS.length; }
      ambTimer = setTimeout(tick, 400 + (Math.random() * 40 - 20));
    };
    tick(); ambStopPad = () => { stopped = true; };
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

// ── Plaquinha do pedido (dinâmica, sobre a cena) ──────────────────────────────────
function OrderCard({ mesaNum, scene, items, numbered, hideItems }: {
  mesaNum: number; scene: Scene; items: Item[]; numbered: boolean; hideItems: boolean;
}) {
  const rel = relText(scene.rel, scene.names);
  return (
    <div style={{ minWidth: 200, maxWidth: 290, background: "rgba(20,22,18,0.55)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
      borderRadius: 18, padding: "13px 16px 15px", border: "1.5px solid rgba(235,200,130,0.55)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid rgba(255,225,180,0.2)", paddingBottom: 8, marginBottom: 9 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#ffe7b0" }}>Mesa {mesaNum}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "rgba(255,255,255,0.94)" }}>{joinList(scene.names)}</div>
        {rel && <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,225,180,0.7)", marginTop: 1 }}>{rel}</div>}
      </div>
      {hideItems ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#ffe7b0", fontWeight: 700, fontSize: 13.5, padding: "6px 0" }}>
          <Volume2 size={18} /> Ouça o pedido
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {numbered && <span style={{ width: 18, fontSize: 13, fontWeight: 900, color: "#ffe7b0", flexShrink: 0 }}>{i + 1}.</span>}
              <span style={{ width: 28, height: 28, flexShrink: 0 }}><ItemImg id={it.id} size={28} /></span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>{it.n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bandeja — vagas numeradas (quando exige ordem) ou simples ─────────────────────
function Tray({ items, slots, numbered }: { items: Item[]; slots: number; numbered: boolean }) {
  const n = Math.max(slots, items.length, 1);
  const sz = n >= 4 ? { item: 64, gap: 8 } : n === 3 ? { item: 78, gap: 10 } : { item: 104, gap: 14 };
  const Handle = ({ side }: { side: "left" | "right" }) => (
    <div style={{ position: "absolute", top: "50%", [side]: -15, transform: "translateY(-50%)", width: 30, height: 50, zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "45%", border: "5px solid #c8a24e", boxShadow: "0 2px 6px rgba(50,30,8,0.4), inset 0 1px 2px rgba(255,238,190,0.7)" }} />
    </div>
  );
  return (
    <div style={{ position: "relative", margin: "0 18px" }}>
      <Handle side="left" /><Handle side="right" />
      <div style={{ position: "relative", zIndex: 1, borderRadius: 22, padding: 12,
        background: "linear-gradient(160deg,#7a5230 0%,#5c3d22 55%,#492f18 100%)",
        boxShadow: "0 16px 36px rgba(50,30,10,0.4), inset 0 2px 3px rgba(255,228,185,0.3), inset 0 -3px 7px rgba(30,18,6,0.55)" }}>
        <div style={{ borderRadius: 15, minHeight: sz.item + 24,
          backgroundImage: "repeating-linear-gradient(96deg, rgba(255,220,170,0.045) 0 2px, transparent 2px 8px), linear-gradient(160deg,#62431f,#49321a)",
          boxShadow: "inset 0 5px 16px rgba(18,10,3,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: sz.gap, flexWrap: "nowrap", padding: "10px 14px" }}>
          {Array.from({ length: n }).map((_, i) => {
            const it = items[i];
            return (
              <div key={i} style={{ width: sz.item, aspectRatio: "1 / 1", flexShrink: 1, minWidth: 0, position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {it ? (
                  <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 440, damping: 22 }}
                    style={{ width: "100%", height: "100%", filter: "drop-shadow(0 6px 10px rgba(10,6,2,0.55))" }}>
                    <ItemImg id={it.id} size={sz.item} />
                  </motion.div>
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: 14, border: "2px dashed rgba(255,228,185,0.45)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {numbered ? (
                      <>
                        <div style={{ width: "42%", maxWidth: 40, aspectRatio: "1 / 1", borderRadius: "50%", background: "rgba(255,235,200,0.16)",
                          color: "rgba(255,240,210,0.92)", fontWeight: 900, fontSize: Math.max(12, sz.item * 0.16),
                          display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}º</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,235,205,0.72)" }}>item</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 22, color: "rgba(255,235,205,0.5)" }}>＋</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Phase = "ready" | "salao" | "update" | "bancada" | "feedback";

// ── Componente principal ────────────────────────────────────────────────────────
export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemProps) {
  const [presMode, setPresMode] = useState<PresMode | null>(null);
  const speakOn = presMode === "visual_audio" || presMode === "audio_only";
  const hideText = presMode === "audio_only";
  const reportProgress = useExerciseProgress();
  const startLevel = levelOf(difficulty);
  const [sessionLevel, setSessionLevel] = useState(startLevel);
  const spec = R_LEVELS[sessionLevel];

  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState<Round | null>(null);
  const [memoIdx, setMemoIdx] = useState(0);
  const [memoLeft, setMemoLeft] = useState(0);
  const [tray, setTray] = useState<Item[]>([]);
  const [trial, setTrial] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [showVoice, setShowVoice] = useState(false);

  const correctRef = useRef(0);
  const startTime = useRef(Date.now());
  const inputAt = useRef(0);
  const rtsRef = useRef<number[]>([]);
  const runRef = useRef(0);
  const levelRef = useRef(startLevel);
  const streakRef = useRef(0);
  const roundRef = useRef<Round | null>(null);
  const trayRef = useRef<Item[]>([]);

  const startRound = useCallback(() => {
    runRef.current++;
    const r = buildRound(levelRef.current);
    roundRef.current = r; setRound(r);
    trayRef.current = []; setTray([]);
    setFeedback(null); setMemoIdx(0);
    setMemoLeft(memoSecsFor(r.mesas[0].order.length));
    setPhase("salao");
  }, []);

  const finish = useCallback(() => {
    const endLevel = levelRef.current;
    const accTotal = correctRef.current / TRIALS;
    const meanRT = rtsRef.current.length ? Math.round(rtsRef.current.reduce((a, b) => a + b, 0) / rtsRef.current.length) : null;
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      exerciseId: "restaurante-ordem",
      domain: "memory",
      score: calculateExerciseScore("span-numerico", accTotal, meanRT ?? undefined, endLevel),
      accuracy: accTotal,
      reactionTime: meanRT ?? undefined,
      difficulty: Math.round((endLevel / MAX_LEVEL) * 10),
      duration,
      metadata: {
        progressionV2: true, accTotal: Number(accTotal.toFixed(3)), level: endLevel, startedLevel: startLevel,
        sequencesCorrect: correctRef.current, sequencesIncorrect: TRIALS - correctRef.current,
        meanReactionTimeMs: meanRT, presentationMode: presMode,
      },
    });
  }, [onComplete, startLevel, presMode]);

  // Avança após a fase do Salão (memorização de todas as mesas).
  function afterSalao() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const r = roundRef.current; if (!r) return;
    if (r.mesas[r.called].update) { setPhase("update"); return; }
    goBancada();
  }
  function goBancada() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    inputAt.current = Date.now(); setPhase("bancada");
  }

  const submit = useCallback(() => {
    const r = roundRef.current; if (!r) return;
    const mesa = r.mesas[r.called];
    const res = validate(trayRef.current, mesa, r.orderRequired);
    if (res.ok) correctRef.current++;
    rtsRef.current.push(Date.now() - inputAt.current);
    streakRef.current = res.ok ? Math.max(streakRef.current, 0) + 1 : Math.min(streakRef.current, 0) - 1;
    if (streakRef.current >= 2) { levelRef.current = Math.min(levelRef.current + 1, MAX_LEVEL); streakRef.current = 0; setSessionLevel(levelRef.current); }
    else if (streakRef.current <= -2) { levelRef.current = Math.max(levelRef.current - 1, 1); streakRef.current = 0; setSessionLevel(levelRef.current); }
    setFeedback(res); setPhase("feedback");
    reportProgress(Math.round(((trial + 1) / TRIALS) * 100));
  }, [trial, reportProgress]);

  function advance() {
    const nextTrial = trial + 1;
    if (nextTrial >= TRIALS) finish();
    else { setTrial(nextTrial); startRound(); }
  }

  function placeItem(it: Item) {
    if (phase !== "bancada") return;
    const r = roundRef.current; if (!r) return;
    const cap = r.mesas[r.called].finalOrder.length;
    if (trayRef.current.length >= cap) return;
    const nt = [...trayRef.current, it]; trayRef.current = nt; setTray(nt);
  }
  function clearTray() { if (phase !== "bancada") return; trayRef.current = []; setTray([]); }

  // ── Áudio: narra o pedido (salão) / a atualização ──
  useEffect(() => {
    if (!speakOn || !round) return;
    if (phase === "salao") speakText(orderSpeech(round.mesas[memoIdx], memoIdx + 1), { rate: 0.95 });
    else if (phase === "update") speakText(updText(round.mesas[round.called]), { rate: 0.95 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, memoIdx, round, speakOn]);

  // ── Cronômetro do Salão (memoriza cada mesa; avança sozinho) ──
  useEffect(() => {
    if (phase !== "salao") return;
    const myRun = runRef.current;
    const r0 = roundRef.current;
    const secs = memoSecsFor(r0 ? r0.mesas[memoIdx].order.length : 4);
    setMemoLeft(secs);
    const iv = setInterval(() => setMemoLeft((s) => Math.max(0, s - 1)), 1000);
    const to = setTimeout(() => {
      if (runRef.current !== myRun) return;
      const r = roundRef.current;
      if (r && memoIdx < r.mesas.length - 1) setMemoIdx((m) => m + 1);
      else afterSalao();
    }, Math.max(1, secs) * 1000);
    return () => { clearInterval(iv); clearTimeout(to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, memoIdx]);

  useEffect(() => () => { runRef.current++; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); stopAmbience(); }, []);
  useEffect(() => { if (typeof window === "undefined") return; ITEMS.forEach((i) => { const im = new window.Image(); im.src = photo(i.id); }); }, []);

  function replay() {
    const r = roundRef.current; if (!r) return;
    if (phase === "salao") speakText(orderSpeech(r.mesas[memoIdx], memoIdx + 1), { rate: 0.95 });
    else if (phase === "update") speakText(updText(r.mesas[r.called]), { rate: 0.95 });
  }

  function begin() {
    correctRef.current = 0; rtsRef.current = []; startTime.current = Date.now(); setTrial(0);
    levelRef.current = startLevel; streakRef.current = 0; setSessionLevel(startLevel);
    startAmbience(); setAmbienceMuted(!musicOn); startRound();
  }
  function toggleMusic() { setMusicOn((m) => { const next = !m; setAmbienceMuted(!next); return next; }); }

  // ── CONFIGURAR ATIVIDADE ──
  if (presMode === null) {
    const lbl = spec.mesas > 1 ? `${spec.mesas} mesas` : spec.group === "A" ? "1 pessoa" : spec.group === "B" ? "2 pessoas" : "3 pessoas";
    return (
      <PresentationConfig
        title="Restaurante" icon="🍽️" accent="#11514f"
        subtitle={<>Nível {startLevel} · {lbl} · {spec.items} itens — onde parou.</>}
        onChoose={(m) => { setPresMode(m); begin(); }}
      />
    );
  }

  // ── TELA DO SALÃO (memorizar) — cena cheia + plaquinha ──
  if (phase === "salao" && round) {
    const mesa = round.mesas[memoIdx];
    const n = round.mesas.length;
    const pct = Math.max(0, Math.min(100, (memoLeft / Math.max(1, memoSecsFor(mesa.order.length))) * 100));
    return (
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", backgroundImage: `url(${mesa.scene.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,6,2,0.55) 0%, rgba(10,6,2,0) 22%, rgba(10,6,2,0) 68%, rgba(10,6,2,0.55) 100%)" }} />
        {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "16px 16px 96px", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              {n > 1 && <span style={{ display: "inline-block", padding: "5px 11px", borderRadius: 100, background: "rgba(18,10,3,0.6)", border: "1px solid rgba(255,220,170,0.35)", color: "#ffe7b0", fontWeight: 800, fontSize: 12.5 }}>Mesa {memoIdx + 1} de {n}</span>}
            </div>
            <div style={{ textAlign: "center", flex: "0 0 auto" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>Salão do Restaurante</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,238,215,0.95)", marginTop: 2, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>✦ {n > 1 ? "Memorize os pedidos das mesas" : "Memorize o pedido da mesa"} ✦</div>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 100, background: "rgba(18,10,3,0.62)", border: "1px solid rgba(255,220,170,0.4)", color: "#ffe7b0" }}>
                <Timer size={18} /><span style={{ fontWeight: 900, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{memoLeft}s</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />
          {/* plaquinha — translúcida, centralizada e perto da mesa */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 10 }}>
            <OrderCard mesaNum={memoIdx + 1} scene={mesa.scene} items={mesa.order} numbered={round.orderRequired} hideItems={hideText} />
            {speakOn && (
              <button onClick={replay} style={{ alignSelf: "center", fontSize: 12.5, fontWeight: 700, padding: "9px 14px", borderRadius: 100, cursor: "pointer", background: "rgba(18,10,3,0.6)", border: "1px solid rgba(255,220,170,0.35)", color: "#ffe7b0" }}>🔊 Ouvir</button>
            )}
          </div>
          <div style={{ flex: 0.7 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14, background: "rgba(18,10,3,0.62)", border: "1px solid rgba(255,220,170,0.25)" }}>
            <span style={{ fontSize: 17 }}>💡</span>
            <span style={{ fontSize: 12.5, color: "rgba(255,240,220,0.92)", fontWeight: 600, flexShrink: 0 }}>O pedido some em alguns segundos — guarde na memória.</span>
            <div style={{ flex: 1, height: 8, borderRadius: 6, background: "rgba(255,255,255,0.16)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg,#f0b94a,#d98f2a)", width: `${pct}%`, transition: "width 1s linear" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA DA ATUALIZAÇÃO (Nível 5) ──
  if (phase === "update" && round) {
    const mesa = round.mesas[round.called];
    return (
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", backgroundImage: `url(${mesa.scene.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,6,2,0.55)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 460, background: "rgba(16,20,18,0.92)", borderRadius: 24, padding: "26px 24px", border: "1px solid rgba(255,225,180,0.3)", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#f0b94a", fontWeight: 900, fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              <ArrowLeftRight size={18} /> Mudança no pedido — Mesa {round.called + 1}
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 8 }}>{updText(mesa)}</p>
            <p style={{ fontSize: 13.5, color: "rgba(255,240,220,0.75)", marginBottom: 20 }}>Lembre da versão <strong style={{ color: "#ffe7b0" }}>final</strong> do pedido na hora de montar.</p>
            {speakOn && <button onClick={replay} style={{ fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 100, cursor: "pointer", marginRight: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,220,170,0.3)", color: "#ffe7b0" }}>🔊 Ouvir</button>}
            <button onClick={goBancada} style={{ height: 50, padding: "0 26px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 18px rgba(13,58,60,0.4)" }}>Entendi, montar →</button>
          </div>
        </div>
      </div>
    );
  }

  const r = round;
  const mesa = r ? r.mesas[r.called] : null;
  const cap = mesa ? mesa.finalOrder.length : 0;

  // ── BANCADA DO GARÇOM (balcão de madeira + cabeçalho verde) ──
  if (phase === "bancada" && r && mesa) {
    const full = tray.length >= cap;
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: 80,
        backgroundImage: "repeating-linear-gradient(92deg, rgba(255,225,180,0.04) 0 3px, transparent 3px 16px), linear-gradient(165deg,#6b4a2a 0%,#4a3119 60%,#382410 100%)" }}>
        {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}

        {/* HEADER VERDE — Pedido pronto: Mesa X */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: "linear-gradient(180deg,#175446 0%,#0e3528 100%)", boxShadow: "0 4px 16px rgba(8,30,22,0.5)" }}>
          <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "rgba(255,220,150,0.14)", border: "1px solid rgba(255,220,150,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color="#f0c94a" />
          </motion.div>
          <div style={{ flex: 1, textAlign: "center", lineHeight: 1.1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 1.5 }}>Pedido pronto:</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f0c94a", letterSpacing: 0.5 }}>MESA {r.called + 1}</div>
          </div>
          <button onClick={toggleMusic} title={musicOn ? "Música: ligada" : "Música: muda"}
            style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {musicOn ? "🔊" : "🔇"}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, padding: "14px 16px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "rgba(255,240,220,0.95)" }}>
            Lembre o pedido da {joinList(mesa.scene.names)}{r.orderRequired ? ", na ordem certa," : ""} e monte a bandeja.
          </p>

          <Tray items={tray} slots={cap} numbered={r.orderRequired} />

          <div style={{ fontSize: 12.5, fontWeight: 800, color: "rgba(255,235,205,0.85)", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>Itens disponíveis</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(r.keys.length, 5)}, 1fr)`, gap: 10 }}>
            {r.keys.map((it, i) => {
              const placed = tray.filter((x) => x.id === it.id).length;
              const sel = placed > 0;
              return (
                <motion.button key={`${it.id}-${i}`} onClick={() => placeItem(it)} disabled={full && !sel} whileTap={{ scale: 0.93 }}
                  style={{ borderRadius: 16, cursor: full && !sel ? "default" : "pointer", padding: "12px 8px 10px",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: full && !sel ? 0.5 : 1,
                    background: sel ? "#eef6f4" : "#fffdf7", border: sel ? "2px solid #2f9e8f" : "1.5px solid #ece0c8",
                    boxShadow: sel ? "0 2px 8px rgba(47,158,143,0.22)" : "0 4px 12px rgba(0,0,0,0.25)", transition: "all .2s" }}>
                  <span style={{ position: "relative", width: "100%", maxWidth: 110, aspectRatio: "1 / 1" }}>
                    <ItemImg id={it.id} size={110} />
                    {placed > 0 && <span style={{ position: "absolute", top: -2, right: -2, minWidth: 22, height: 22, padding: "0 5px", borderRadius: 11, background: "#2f9e8f", color: "#fff", fontSize: 12.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: sel ? "#1d7a6e" : "#4a4234", textAlign: "center", lineHeight: 1.12 }}>{it.n}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* barra inferior: Limpar + Entregar */}
        <div style={{ flexShrink: 0, display: "flex", gap: 10, padding: "10px 16px 14px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
          <button onClick={clearTray} disabled={tray.length === 0}
            style={{ flex: "0 0 auto", height: 50, padding: "0 18px", borderRadius: 100, fontWeight: 800, fontSize: 13.5, cursor: tray.length > 0 ? "pointer" : "default",
              background: "#f3ecdc", border: "1.5px solid #d8cbb0", color: tray.length > 0 ? "#6b6052" : "#b3a88f", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            ↻ Limpar bandeja
          </button>
          <button onClick={submit} disabled={tray.length === 0}
            style={{ flex: 1, height: 50, borderRadius: 100, border: "none", background: tray.length > 0 ? "linear-gradient(135deg,#1f9d5c,#147a45)" : "rgba(255,255,255,0.12)",
              color: tray.length > 0 ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 800, fontSize: 15, cursor: tray.length > 0 ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: tray.length > 0 ? "0 6px 18px rgba(20,122,69,0.4)" : "none" }}>
            ✓ Entregar pedido
          </button>
        </div>
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", padding: "0 18px 10px", fontSize: 11.5, fontWeight: 700, color: "rgba(255,235,205,0.6)" }}>
          <span>Pedido {Math.min(trial + 1, TRIALS)}/{TRIALS}</span><span>Acertos: {correctRef.current}</span>
        </div>
      </div>
    );
  }

  // ── FEEDBACK (faixa + check + Continuar) ──
  if (phase === "feedback" && feedback && mesa) {
    const ok = feedback.ok;
    const COLS = ["#f0b94a", "#4ade80", "#60a5fa", "#f87171", "#c084fc", "#fbbf24"];
    return (
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        backgroundImage: `url(${mesa.scene.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: ok ? "rgba(8,30,18,0.72)" : "rgba(30,12,8,0.72)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
        {/* confete */}
        {ok && Array.from({ length: 16 }).map((_, i) => (
          <motion.div key={i} initial={{ y: -30, opacity: 0, rotate: 0 }} animate={{ y: 360, opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: 1.8, delay: (i % 6) * 0.08, ease: "easeIn", repeat: Infinity, repeatDelay: 0.6 }}
            style={{ position: "absolute", left: `${(i * 61) % 100}%`, top: "8%", width: 9, height: 13, borderRadius: 2, background: COLS[i % COLS.length] }} />
        ))}

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {/* faixa */}
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={{ padding: "11px 34px", borderRadius: 10, background: ok ? "linear-gradient(180deg,#22a35e,#157a43)" : "linear-gradient(180deg,#d56a4a,#b24a32)",
              boxShadow: "0 8px 22px rgba(0,0,0,0.4)", clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 0.5, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{ok ? "PEDIDO ENTREGUE!" : "QUASE LÁ"}</span>
          </motion.div>

          {/* círculo */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
            style={{ width: 116, height: 116, borderRadius: "50%", background: ok ? "radial-gradient(circle at 38% 32%,#34d27e,#147a43)" : "radial-gradient(circle at 38% 32%,#ef6b4b,#b23a26)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 64, fontWeight: 900,
              boxShadow: `0 0 40px ${ok ? "rgba(52,210,126,0.6)" : "rgba(239,107,75,0.5)"}, inset 0 -6px 14px rgba(0,0,0,0.25)` }}>
            {ok ? "✓" : "✕"}
          </motion.div>

          <p style={{ textAlign: "center", fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.35, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            {ok ? <>Você serviu a mesa correta.<br />Muito bem!</> : feedback.msg}
          </p>

          {!ok && (
            <div style={{ width: "100%", padding: "12px 10px", borderRadius: 14, background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.14)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,240,220,0.75)", textAlign: "center", marginBottom: 8 }}>Pedido correto da Mesa {r ? r.called + 1 : ""}:</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                {mesa.finalOrder.map((it, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ width: 50, height: 50 }}><ItemImg id={it.id} size={50} /></span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{r?.orderRequired ? `${i + 1}. ` : ""}{it.n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={advance}
            style={{ width: "100%", maxWidth: 300, height: 52, borderRadius: 100, border: "none", background: "linear-gradient(135deg,#1f9d5c,#147a45)",
              color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 6px 20px rgba(20,122,69,0.5)" }}>
            Continuar →
          </button>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Pedido {Math.min(trial + 1, TRIALS)}/{TRIALS} · Acertos: {correctRef.current}</div>
        </div>
      </div>
    );
  }

  return null;
}
