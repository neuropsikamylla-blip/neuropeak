"use client";

// ── FOCO · CHUVA DE AGENTES (queda vertical, 1 comando → 1 alvo) ────────────────
// Motor EXCLUSIVO do modo Foco (o guard mode==="foco" vive em FocusAgents.tsx).
// Inibição/Alternância/Desafio continuam na "arena flutuante" e NÃO tocam aqui.
//
// FLUXO (corrigido — flexibilidade cognitiva):
//  1. Um COMANDO aparece no topo: "Ache o de chapéu" (regra de 1 feature).
//  2. Vários agentes caem juntos; os distratores são PARECIDOS (mesma família da
//     regra: se a regra é de cabeça, caem chapéu/coroa/gorro/boné/sem; se é bola,
//     caem futebol-esq/dir e basquete; se é expressão, caem alegre/triste/raiva).
//  3. EXATAMENTE 1 alvo (o que bate a regra) existe por vez. Tocar NELE = ACERTO →
//     troca IMEDIATA para um NOVO comando (nova regra), e um novo alvo passa a cair.
//  4. Tocar num DISTRATOR = ERRO impulsivo (feedback vermelho + penalidade). O
//     comando NÃO troca — o alvo certo ainda precisa ser achado.
//  5. Alvo que cai por baixo sem ser tocado: 2ª chance (volta ~1.4x mais rápido);
//     se escapar de novo = OMISSÃO → troca de comando (mantém o fluxo).
//  6. Fluxo CONTÍNUO na sessão cronometrada (~7min). Distratores já em queda
//     continuam caindo quando o comando troca (viram distratores da nova regra).

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { playTTS, cancelTTS } from "@/lib/tts";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { allAgents } from "@/data/agents";
import type { AgentConfig } from "@/data/agents";
import type { ExerciseResult, Theme } from "@/types";
import type { FocusMode } from "@/types/commands";
import type { PresMode } from "@/components/exercises/PresentationConfig";

const AGENT_V = "?v=6";   // cache-bust (imagens transparentes) — igual ao FocusAgents

// ── Tamanho / hitbox (idênticos ao Foco da arena) ───────────────────────────────
const CHAR_SIZE = 80;              // recalibração de elite — menores, clique preciso
const CHAR_H    = CHAR_SIZE * 1.5; // imagens 2:3 (512×768)
// Área CLICÁVEL = só o corpo visível (o resto do PNG é transparente).
const HIT_L = 0.24, HIT_R = 0.76;
const HIT_T = 0.00, HIT_B = 0.96;

// ── Feedback (sons + vibração) — mesma paleta sonora do FocusAgents ─────────────
let _actx: AudioContext | null = null;
function beep(freqs: number[], dur = 0.12, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _actx = _actx ?? new Ctx();
    const ctx = _actx;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      const t = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur);
    });
  } catch { /* áudio indisponível */ }
}
const soundCapture = () => beep([660, 880], 0.1, "sine");
const soundWrong   = () => beep([200, 150], 0.15, "square");
const soundMiss    = () => beep([300, 220], 0.12, "triangle");
function vibrate(ms: number | number[]) { try { navigator.vibrate?.(ms); } catch { /* sem vibração */ } }

function cleanForSpeech(text: string): string {
  return text.replace(/[✅🚫]/g, "").replace(/\n+/g, ". ").trim();
}

// ── Configuração de dificuldade por NÍVEL (ladder 1–7) — CALIBRÁVEL ─────────────
//  • fallMs        — tempo-base p/ o agente cair do topo até embaixo (↓ = mais rápido).
//  • secondChance  — multiplicador de velocidade da 2ª queda de um alvo que escapou.
//  • nearFrac      — fração dos DISTRATORES tirados da família confusável (o resto
//    vira variedade). Sobe com o nível (mais parecidos = mais difícil).
//  • areaPerAgent  — px² de tela por agente (↓ = mais denso). A quantidade na tela
//    ADAPTA ao tamanho do monitor: enche telas grandes, equilibra no celular.
// CALIBRÁVEL após teste clínico. Ajuste pós-feedback da neuro:
//  • fallMs MAIOR (queda mais LENTA) — antes 6200→3200, ficou frenético.
//  • areaPerAgent MAIOR (menos denso, sem sobreposição).
interface RainCfg { fallMs: number; secondChance: number; nearFrac: number; areaPerAgent: number }
const RAIN_CFG: Record<number, RainCfg> = {
  1: { fallMs: 9500, secondChance: 1.4,  nearFrac: 0.75, areaPerAgent: 150000 },
  2: { fallMs: 8600, secondChance: 1.45, nearFrac: 0.78, areaPerAgent: 135000 },
  3: { fallMs: 7800, secondChance: 1.5,  nearFrac: 0.82, areaPerAgent: 120000 },
  4: { fallMs: 7000, secondChance: 1.55, nearFrac: 0.86, areaPerAgent: 105000 },
  5: { fallMs: 6300, secondChance: 1.6,  nearFrac: 0.90, areaPerAgent:  92000 },
  6: { fallMs: 5700, secondChance: 1.65, nearFrac: 0.93, areaPerAgent:  82000 },
  7: { fallMs: 5200, secondChance: 1.7,  nearFrac: 0.95, areaPerAgent:  72000 },
};
const SPAWN_TICK = 150;    // tick rápido; a densidade real é limitada por targetConcurrent().
const MAX_ON_SCREEN = 14;  // teto (menos agentes; sem amontoar). Desktop ~13-14, celular ~5.
// Antes de o ALVO poder cair: pelo menos estes distratores + tempo (o alvo NUNCA é o 1º).
const MIN_DISTRACTORS_BEFORE_TARGET = 3;
const MIN_MS_BEFORE_TARGET = 900;
// Quantos agentes simultâneos p/ a ÁREA atual — adapta ao monitor (menos denso).
function targetConcurrent(level: number, W: number, H: number): number {
  return Math.max(4, Math.min(MAX_ON_SCREEN, Math.round((W * H) / RAIN_CFG[level].areaPerAgent)));
}

// Progressão: sobe +1 nível a cada LEVEL_UP_HITS comandos resolvidos seguidos;
// erro impulsivo OU omissão zera a sequência e MANTÉM o nível (não desce).
const LEVEL_UP_HITS = 4;
const MAX_LEVEL     = 7;

const fallSpeed = (playH: number, fallMs: number) => (playH + CHAR_H) / fallMs;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ── SISTEMA DE REGRAS (1 feature, OU cor+feature combinadas) ────────────────────
// Cada regra é montada do ROSTER real (allAgents). matches(a) diz se `a` é o ALVO;
// family = pool de distratores CONFUSÁVEIS (parecidos, mas NÃO batem a regra).
export interface Rule {
  key: string;                 // identidade da regra (evita repetir a mesma seguidas)
  text: string;                // "Ache o de chapéu" / "Ache o azul de chapéu"
  matches: (a: AgentConfig) => boolean;
  targetPool: AgentConfig[];   // agentes que batem a regra (o alvo é 1 deles)
  family: AgentConfig[];       // distratores confusáveis (mesma família, não batem)
  combined: boolean;           // true = conjunção cor+feature (busca por 2 atributos)
}

const COLOR_LABEL: Record<string, string> = {
  blue: "azul", green: "verde", purple: "roxo", orange: "laranja", red: "vermelho", yellow: "amarelo",
};
const COLOR_NEIGHBORS: Record<string, string[]> = {
  blue: ["purple", "green"], green: ["blue", "yellow"], purple: ["blue", "red"],
  orange: ["red", "yellow"], red: ["orange", "purple"], yellow: ["orange", "green"],
};

// Índices do roster por dimensão (montados 1x).
const ROSTER = allAgents;
const withHead   = (v: string) => ROSTER.filter(a => a.headItem === v);
const anyHead    = ROSTER.filter(a => a.headItem != null);
const withCap    = ROSTER.filter(a => a.accessory === "red-cap");           // boné
const plainBase  = ROSTER.filter(a => a.accessory === "none" && !a.held && !a.headItem && !a.faceExpr && !a.special);
const withSpecial = (v: string) => ROSTER.filter(a => a.special === v);
const anySpecial  = ROSTER.filter(a => a.special != null);
const withExpr    = (v: string) => ROSTER.filter(a => a.faceExpr === v);
const anyExpr     = ROSTER.filter(a => a.faceExpr != null);
const ballAgents  = ROSTER.filter(a => a.held === "futebol" || a.held === "basquete");
const heldObjects = ROSTER.filter(a => a.held === "balao" || a.held === "pipa" || a.held === "guarda_chuva");
const skatePlain  = ROSTER.filter(a => a.held === "skate" && !a.bermuda);
const skateBerm   = ROSTER.filter(a => a.held === "skate" && a.bermuda);
const withColor   = (c: string) => ROSTER.filter(a => a.color === c);

// Uma FEATURE (dimensão além da cor). `frag` é o trecho que vem DEPOIS do artigo
// ("de chapéu", "alegre", "com a bola de futebol à direita") — usado tanto na
// regra simples ("Ache o {frag}") quanto na combinada ("Ache o {cor} {frag}").
interface FeatureDef {
  key: string;                          // ex.: "head:chapeu", "ball:futebol/dir"
  frag: string;                         // trecho pós-artigo
  match: (a: AgentConfig) => boolean;   // bate a feature (ignorando cor)
  pool: AgentConfig[];                  // agentes com essa feature
}

// Todas as features do roster (mesmos textos/pools da versão de 1 atributo).
const FEATURE_DEFS: FeatureDef[] = (() => {
  const HEAD_PT: Record<string, string> = { chapeu: "chapéu", coroa: "coroa", gorro: "gorro" };
  const SPEC_PT: Record<string, string> = { luva: "luva", oculos_escuro: "óculos escuro" };
  const EXPR_PT: Record<string, string> = { alegria: "alegre", tristeza: "triste", raiva: "com raiva" };
  const HELDOBJ_PT: Record<string, string> = { balao: "balão", pipa: "pipa", guarda_chuva: "guarda-chuva" };
  const SIDE_PT: Record<string, string> = { esq: "à esquerda", dir: "à direita" };
  const BALL_PT: Record<string, string> = { futebol: "de futebol", basquete: "de basquete" };
  const defs: FeatureDef[] = [];
  for (const v of ["chapeu", "coroa", "gorro"])
    defs.push({ key: `head:${v}`, frag: `de ${HEAD_PT[v]}`, match: a => a.headItem === v, pool: withHead(v) });
  for (const v of ["luva", "oculos_escuro"])
    defs.push({ key: `special:${v}`, frag: `de ${SPEC_PT[v]}`, match: a => a.special === v, pool: withSpecial(v) });
  for (const v of ["alegria", "tristeza", "raiva"])
    defs.push({ key: `expr:${v}`, frag: EXPR_PT[v], match: a => a.faceExpr === v, pool: withExpr(v) });
  for (const held of ["futebol", "basquete"] as const)
    for (const side of ["esq", "dir"] as const)
      defs.push({ key: `ball:${held}/${side}`, frag: `com a bola ${BALL_PT[held]} ${SIDE_PT[side]}`,
        match: a => a.held === held && a.heldSide === side, pool: ROSTER.filter(a => a.held === held && a.heldSide === side) });
  defs.push({ key: "held:skate", frag: "de skate", match: a => a.held === "skate" && !a.bermuda, pool: skatePlain });
  defs.push({ key: "held:skate_bermuda", frag: "de skate de bermuda", match: a => a.held === "skate" && a.bermuda === true, pool: skateBerm });
  for (const v of ["balao", "pipa", "guarda_chuva"])
    defs.push({ key: `held:${v}`, frag: `que segura ${HELDOBJ_PT[v]}`, match: a => a.held === v, pool: ROSTER.filter(a => a.held === v) });
  return defs;
})();

// Família confusável de uma feature ISOLADA (mesma da versão de 1 atributo).
function featureFamily(f: FeatureDef): AgentConfig[] {
  if (f.key.startsWith("head:"))  return [...anyHead.filter(a => !f.match(a)), ...withCap, ...plainBase];
  if (f.key.startsWith("special:")) return [...anySpecial.filter(a => !f.match(a)), ...plainBase];
  if (f.key.startsWith("expr:"))  return anyExpr.filter(a => !f.match(a));
  if (f.key.startsWith("ball:"))  return ballAgents.filter(a => !f.match(a));
  if (f.key === "held:skate")     return [...skateBerm, ...heldObjects];
  if (f.key === "held:skate_bermuda") return [...skatePlain, ...heldObjects];
  return heldObjects.filter(a => !f.match(a));   // objeto segurado
}

// Constrói TODAS as regras: simples (cor, ou 1 feature) + COMBINADAS (cor+feature).
export function buildAllRules(): Rule[] {
  const rules: Rule[] = [];

  // ── SIMPLES: 1 feature ──
  for (const f of FEATURE_DEFS) {
    rules.push({ key: f.key, text: `Ache o agente ${f.frag}`, matches: f.match, targetPool: f.pool,
      family: featureFamily(f), combined: false });
  }
  // ── SIMPLES: cor (família = cores vizinhas) ──
  for (const c of Object.keys(COLOR_LABEL)) {
    const fam = COLOR_NEIGHBORS[c].flatMap(nc => withColor(nc));
    rules.push({ key: `color:${c}`, text: `Ache o agente ${COLOR_LABEL[c]}`, matches: a => a.color === c,
      targetPool: withColor(c), family: fam, combined: false });
  }
  // ── COMBINADAS: cor + feature (busca por conjunção) ──
  // Distratores confusáveis = compartilham EXATAMENTE UM dos dois atributos:
  //   (a) MESMA COR, feature diferente; (b) MESMA FEATURE, cor diferente.
  for (const c of Object.keys(COLOR_LABEL))
    for (const f of FEATURE_DEFS) {
      const matches = (a: AgentConfig) => a.color === c && f.match(a);
      const targetPool = ROSTER.filter(matches);
      if (targetPool.length < 1) continue;
      const sameColorOtherFeature = ROSTER.filter(a => a.color === c && !f.match(a));   // (a)
      const sameFeatureOtherColor = f.pool.filter(a => a.color !== c);                  // (b)
      const family = [...sameColorOtherFeature, ...sameFeatureOtherColor].filter(a => !matches(a));
      rules.push({ key: `combo:${c}+${f.key}`, text: `Ache o agente ${COLOR_LABEL[c]} ${f.frag}`,
        matches, targetPool, family, combined: true });
    }

  // Só mantém regras com alvo e família suficientes (invariante do jogo).
  return rules.filter(r => r.targetPool.length >= 1 && r.family.length >= 3);
}

// Peso das regras por nível:
//  N1-2 → só 1 atributo (cor OU feature simples).
//  N3-4 → mistura 1 atributo + combinados (cor+feature).
//  N5-7 → predominância de combinados (não gera mais só-cor; feature-simples raro).
// O LADO da bola (sutil) e o skate-bermuda entram a partir de N2/N3.
export function ruleAllowed(r: Rule, level: number): boolean {
  // Sub-features finas só a partir de certo nível (em regra simples OU combinada).
  if (r.key.includes("ball:") && level < 3) return false;         // lado da bola = fino
  if (r.key.includes("held:skate_bermuda") && level < 2) return false;

  if (r.combined) return level >= 3;                              // combinados só N3+
  // Regras SIMPLES:
  if (r.key.startsWith("color:")) return level <= 4;              // só-cor: fácil, até N4
  return level <= 4;                                              // feature-simples: até N4
}

type RainStateT = "falling" | "captured" | "wrong" | "missed";

interface RainAgent {
  uid: string;
  agent: AgentConfig;
  isTarget: boolean;   // é o alvo do comando ATUAL (marcado no spawn)
  x: number;           // posição horizontal ATUAL (baseX + balanço)
  baseX: number;       // âncora horizontal (o balanço oscila ao redor dela)
  y: number;
  vy: number;
  swayAmp: number;     // amplitude do balanço horizontal (px)
  swayPhase: number;   // fase do balanço (avança com o tempo)
  swayFreq: number;    // rad por ms
  passCount: number;
  spawnAt: number;
  state: RainStateT;
}

export interface FocusRainProps {
  level: number;
  theme: Theme;
  presentMode: PresMode;
  fbLevel: "leve" | "normal" | "intenso";
  exerciseId: string;
  settings?: { autoAdvance?: boolean };
  onComplete: (result: ExerciseResult) => void;
}

export function FocusRain({ level, theme, presentMode, fbLevel, exerciseId, settings, onComplete }: FocusRainProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
  const speakOn = presentMode === "visual_audio" || presentMode === "audio_only";
  const speak = useCallback((t: string) => { if (speakOn) playTTS(t); }, [speakOn]);

  const [command, setCommand]   = useState("");
  const [points, setPoints]     = useState(0);
  const [displayLevel, setDisplayLevel] = useState(Math.max(1, Math.min(MAX_LEVEL, Math.round(level))));
  const [flash, setFlash]       = useState<null | { msg: string }>(null);
  const [renderAgents, setRenderAgents] = useState<RainAgent[]>([]);
  // GATE DE COMANDO: "card" = card central + botão Começar (chuva PAUSADA);
  // "playing" = agentes caindo. Todo comando começa em "card".
  const [phase, setPhase]       = useState<"card" | "playing">("card");

  // ── Refs de jogo ──
  const playRef      = useRef<HTMLDivElement>(null);
  const playWRef     = useRef(0);
  const playHRef     = useRef(600);
  const rafRef       = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentsRef    = useRef<RainAgent[]>([]);
  const nodesRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const levelRef     = useRef(Math.max(1, Math.min(MAX_LEVEL, Math.round(level))));
  const startLevelRef = useRef(levelRef.current);
  const reachedRef   = useRef(levelRef.current);
  const uidSeq       = useRef(0);
  const doneRef      = useRef(false);

  // Regra atual + controle de "há alvo vivo para esta regra".
  const rulesRef      = useRef<Rule[]>(buildAllRules());
  const ruleRef       = useRef<Rule | null>(null);
  const targetAliveRef = useRef(false);   // já existe um alvo (não resolvido) da regra atual?
  const cmdStartRef   = useRef(0);        // ts em que a CHUVA do comando começou (RT)
  const phaseRef      = useRef<"card" | "playing">("card");   // espelho de `phase` p/ o loop/timers
  const distractorsThisCmdRef = useRef(0);   // quantos distratores já caíram NESTE comando (alvo nunca 1º)

  // Métricas.
  const capturesRef   = useRef(0);
  const falsePosRef   = useRef(0);
  const omissionsRef  = useRef(0);
  const rtSumRef      = useRef(0);
  const rtNRef        = useRef(0);
  const firstMsListRef = useRef<number[]>([]);
  const consecHitsRef = useRef(0);
  const pointsRef     = useRef(0);
  const eventsRef     = useRef<Array<{ mode: FocusMode; level: number; correct: boolean; endedBy: "correct" | "wrong" | "timeout"; rtMs: number }>>([]);

  const commitRender = useCallback(() => { setRenderAgents(agentsRef.current.map(a => ({ ...a }))); }, []);

  // Abre o CARD do PRÓXIMO comando: escolhe a regra e mostra o card central com o
  // texto + botão "Começar". A chuva fica PAUSADA (phase="card") — nada spawna até
  // o "Começar". A arena já está limpa aqui (a transição de card esvazia os agentes).
  const openCommandCard = useCallback(() => {
    const lv = levelRef.current;
    const allowed = rulesRef.current.filter(r => ruleAllowed(r, lv));
    const prevKey = ruleRef.current?.key;
    const falling = agentsRef.current.filter(a => a.state === "falling").map(a => a.agent);
    // Regra ≠ anterior e não satisfeita por nenhum agente que ainda esteja na tela.
    const safe = shuffle(allowed).filter(r => r.key !== prevKey && !falling.some(a => r.matches(a)));
    const chosen = safe[0] ?? shuffle(allowed).find(r => !falling.some(a => r.matches(a))) ?? pick(allowed);
    ruleRef.current = chosen;
    targetAliveRef.current = false;
    distractorsThisCmdRef.current = 0;
    setCommand(chosen.text);
    phaseRef.current = "card";
    setPhase("card");
  }, []);

  // "Começar": fecha o card e a chuva do comando começa a cair. RT começa AQUI
  // (busca real). Alvo só entra depois dos distratores (item 4). Fala se áudio.
  const startPlaying = useCallback(() => {
    if (phaseRef.current !== "card" || doneRef.current) return;
    cmdStartRef.current = Date.now();
    distractorsThisCmdRef.current = 0;
    targetAliveRef.current = false;
    phaseRef.current = "playing";
    setPhase("playing");
    if (presentMode !== "visual" && ruleRef.current) speak(cleanForSpeech(ruleRef.current.text));
  }, [presentMode, speak]);

  // Cria um RainAgent. ESPALHAMENTO anti-sobreposição: gera ~8 candidatos de X e
  // escolhe o que MAXIMIZA a menor distância aos X dos agentes VIVOS que ainda
  // estão no topo (os "recém-caídos", y < 1.5×CHAR_H) — evita "um em cima do outro".
  const makeFaller = useCallback((agent: AgentConfig, isTarget: boolean): RainAgent => {
    const W = playWRef.current || 360;
    const H = playHRef.current || 600;
    const maxX = Math.max(4, W - CHAR_SIZE - 4);
    // Só considera quem ainda está perto do topo (onde a colisão de spawn ocorre).
    const nearTop = agentsRef.current
      .filter(a => a.state === "falling" && a.y < CHAR_H * 1.5)
      .map(a => a.x);
    let bestX = 4 + Math.random() * maxX;
    let bestGap = -1;
    for (let i = 0; i < 8; i++) {
      const cand = 4 + Math.random() * maxX;
      const gap = nearTop.length ? Math.min(...nearTop.map(px => Math.abs(px - cand))) : Infinity;
      if (gap > bestGap) { bestGap = gap; bestX = cand; }
    }
    return {
      uid: `r${uidSeq.current++}`, agent, isTarget,
      x: bestX, baseX: bestX,
      y: -CHAR_H - Math.random() * CHAR_H,                                        // entrada escalonada (uns mais alto)
      vy: fallSpeed(H, RAIN_CFG[levelRef.current].fallMs) * (0.78 + Math.random() * 0.44), // 0.78–1.22x → mistura vertical
      swayAmp: 14 + Math.random() * 26,          // 14–40px de balanço horizontal
      swayPhase: Math.random() * Math.PI * 2,
      swayFreq: 0.0010 + Math.random() * 0.0011, // rad/ms
      passCount: 0, spawnAt: Date.now(), state: "falling",
    };
  }, []);

  // Spawn de UM agente. Só corre em phase="playing" (o card pausa a chuva).
  //  • O ALVO só pode aparecer depois de ≥MIN_DISTRACTORS_BEFORE_TARGET distratores
  //    E ≥MIN_MS_BEFORE_TARGET desde o "Começar" (o alvo NUNCA é o primeiro a cair).
  //  • Enquanto o alvo não pode/não está vivo → spawna DISTRATOR confusável.
  //  • Nunca há 2 alvos (targetAliveRef controla).
  const spawnOne = useCallback(() => {
    if (doneRef.current || phaseRef.current !== "playing") return;
    const cfg = RAIN_CFG[levelRef.current];
    const alive = agentsRef.current.filter(a => a.state === "falling").length;
    const maxC = targetConcurrent(levelRef.current, playWRef.current || 360, playHRef.current || 600);
    if (alive >= maxC) return;
    const rule = ruleRef.current;
    if (!rule) return;

    const targetUnlocked =
      distractorsThisCmdRef.current >= MIN_DISTRACTORS_BEFORE_TARGET &&
      Date.now() - cmdStartRef.current >= MIN_MS_BEFORE_TARGET;

    let ra: RainAgent;
    if (!targetAliveRef.current && targetUnlocked) {
      // spawna o ÚNICO alvo do comando atual (liberado após os distratores).
      ra = makeFaller(pick(rule.targetPool), true);
      targetAliveRef.current = true;
    } else {
      // distrator: da família (confusável) na maioria; senão variedade do roster.
      const near = Math.random() < cfg.nearFrac;
      const poolNear = rule.family.filter(a => !rule.matches(a));
      const poolFar  = ROSTER.filter(a => !rule.matches(a));
      const pool = (near && poolNear.length ? poolNear : poolFar);
      ra = makeFaller(pick(pool), false);
      distractorsThisCmdRef.current++;
    }
    agentsRef.current = [...agentsRef.current, ra];
    commitRender();
  }, [makeFaller, commitRender]);

  // Progressão de nível.
  const onGoodEvent = useCallback(() => {
    consecHitsRef.current++;
    if (consecHitsRef.current >= LEVEL_UP_HITS && levelRef.current < MAX_LEVEL) {
      levelRef.current++;
      consecHitsRef.current = 0;
      reachedRef.current = Math.max(reachedRef.current, levelRef.current);
      setDisplayLevel(levelRef.current);
    }
  }, []);
  const onBadEvent = useCallback(() => { consecHitsRef.current = 0; }, []);

  const showWrongFlash = useCallback((msg: string) => {
    setFlash({ msg });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 900);
  }, []);

  // Resolve o alvo (ACERTO por toque OU OMISSÃO por escape) → transição para o
  // CARD do próximo comando: pausa a chuva, faz FADE dos agentes restantes, limpa
  // a arena e abre o card. Mantém o fluxo contínuo (só que com um gate por comando).
  const resolveTargetAndSwitch = useCallback(() => {
    phaseRef.current = "card";     // pausa spawns imediatamente
    targetAliveRef.current = false;
    // Fade dos que ainda estão caindo (não pontuam; era pra deixar cair mesmo).
    for (const a of agentsRef.current) if (a.state === "falling") a.state = "captured";
    commitRender();
    setTimeout(() => {
      if (doneRef.current) return;
      agentsRef.current = [];
      nodesRef.current.clear();
      commitRender();
      openCommandCard();           // mostra o card do próximo comando + Começar
    }, 260);
  }, [commitRender, openCommandCard]);

  // ── Toque num agente ──
  const handleTap = useCallback((uid: string) => {
    const a = agentsRef.current.find(x => x.uid === uid);
    if (!a || a.state !== "falling" || doneRef.current) return;
    const rt = Date.now() - cmdStartRef.current;   // RT = comando → acerto
    if (a.isTarget) {
      // ACERTO — comando resolvido; troca IMEDIATA de regra.
      a.state = "captured";
      capturesRef.current++;
      rtSumRef.current += rt; rtNRef.current++;
      firstMsListRef.current.push(rt);
      pointsRef.current += 10 + (rt < 2000 ? 5 : 0);
      setPoints(pointsRef.current);
      soundCapture(); if (fbLevel !== "leve") vibrate(40);
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: true, endedBy: "correct", rtMs: rt });
      onGoodEvent();
      resolveTargetAndSwitch();
    } else {
      // ERRO impulsivo (distrator) — comando NÃO troca; o alvo certo ainda cai.
      a.state = "wrong";
      falsePosRef.current++;
      pointsRef.current = Math.max(0, pointsRef.current - 5);
      setPoints(pointsRef.current);
      soundWrong(); if (fbLevel !== "leve") vibrate(fbLevel === "intenso" ? [80, 50, 80] : [50, 40, 50]);
      showWrongFlash("Esse não é o do comando");
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "wrong", rtMs: rt });
      onBadEvent();
    }
    commitRender();
    setTimeout(() => {
      agentsRef.current = agentsRef.current.filter(x => x.uid !== a.uid);
      nodesRef.current.delete(a.uid);
      commitRender();
    }, a.isTarget ? 220 : 320);
  }, [fbLevel, onGoodEvent, onBadEvent, showWrongFlash, commitRender, resolveTargetAndSwitch]);

  // ── Fim da sessão ──
  const endSession = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
    cancelTTS();
    finish();
    const captures = capturesRef.current, fp = falsePosRef.current, om = omissionsRef.current;
    const resolved = captures + fp + om;
    const accuracy = resolved > 0 ? captures / resolved : 0;
    const avgRt = rtNRef.current > 0 ? Math.round(rtSumRef.current / rtNRef.current) : 0;
    const firsts = firstMsListRef.current;
    const timeToFirstMs = firsts.length ? Math.round(firsts.reduce((s, x) => s + x, 0) / firsts.length) : null;
    onComplete({
      exerciseId, domain: "attention",
      score: calculateExerciseScore("focus-agents", accuracy, avgRt, reachedRef.current),
      accuracy, reactionTime: avgRt, difficulty: reachedRef.current,
      duration: elapsedSec(),
      metadata: {
        mode: "foco", level: reachedRef.current, startedLevel: startLevelRef.current,
        mechanic: "rain",
        autoAdvance: settings?.autoAdvance !== false,
        channel: presentMode !== "visual" ? "auditivo" : "visual",
        rounds: resolved, correct: captures,   // comandos resolvidos por acerto
        falsePositives: fp, omissions: om,
        timeToFirstMs,
        switchRounds: 0, errorsAfterSwitch: 0,
        rounds_detail: eventsRef.current,
      },
    });
  }, [exerciseId, elapsedSec, finish, onComplete, presentMode, settings]);

  // ── Loop de física (queda) ──
  useEffect(() => {
    begin();
    const measure = () => {
      playWRef.current = playRef.current?.clientWidth ?? 360;
      playHRef.current = playRef.current?.clientHeight ?? 600;
    };
    measure();
    window.addEventListener("resize", measure);

    // 1º comando também abre com CARD + "Começar" (o "início" pedido). Nada cai
    // até apertar Começar. O intervalo de spawn é criado no effect [displayLevel].
    openCommandCard();

    let prev: number | null = null;
    const tick = (ts: number) => {
      if (doneRef.current) return;
      // Durante o card a física fica PAUSADA (nada se move), mas o loop segue vivo
      // p/ checar o fim da sessão. dt é descartado enquanto pausado.
      if (phaseRef.current !== "playing") {
        if (isTimeUp()) { endSession(); return; }
        prev = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = prev === null ? 16 : Math.min(ts - prev, 100);
      prev = ts;
      const H = playHRef.current;
      const bottom = H;
      let changed = false;
      let targetOmitted = false;

      for (const a of agentsRef.current) {
        if (a.state !== "falling") continue;
        a.y += a.vy * dt;
        a.swayPhase += a.swayFreq * dt;
        const swayX = a.swayAmp * Math.sin(a.swayPhase);
        a.x = a.baseX + swayX;                       // posição horizontal viva (balanço)
        const node = nodesRef.current.get(a.uid);
        if (node) node.style.transform = `translate(${swayX}px, ${a.y}px)`;
        if (a.y >= bottom) {
          if (a.isTarget && a.passCount === 0) {
            // 2ª CHANCE.
            a.passCount = 1;
            a.y = -CHAR_H;
            a.vy = fallSpeed(H, RAIN_CFG[levelRef.current].fallMs) * RAIN_CFG[levelRef.current].secondChance;
            if (node) node.style.transform = `translate(${swayX}px, ${a.y}px)`;
          } else if (a.isTarget) {
            // OMISSÃO (alvo escapou 2×) → troca de comando (mantém o fluxo).
            a.state = "missed";
            omissionsRef.current++;
            soundMiss(); if (fbLevel === "intenso") vibrate([30, 20, 30]);
            eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "timeout", rtMs: Date.now() - cmdStartRef.current });
            onBadEvent();
            targetOmitted = true;
            changed = true;
          } else {
            // DISTRATOR que cai = correto deixar → some sem penalidade.
            a.state = "captured";
            changed = true;
          }
        }
      }

      if (changed) {
        agentsRef.current = agentsRef.current.filter(a => !(a.state !== "falling" && a.y >= bottom));
        for (const uid of nodesRef.current.keys()) {
          if (!agentsRef.current.some(a => a.uid === uid)) nodesRef.current.delete(uid);
        }
        // OMISSÃO: abre o card do próximo comando (transição limpa a arena).
        if (targetOmitted) resolveTargetAndSwitch();
        commitRender();
      }

      if (isTimeUp()) { endSession(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", measure);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      cancelTTS();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Re)cria o intervalo de spawn quando o nível muda (mais denso nos altos).
  useEffect(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = setInterval(() => spawnOne(), SPAWN_TICK);
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLevel]);

  // ── Render ──
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ zIndex: 40, background: "radial-gradient(ellipse at 50% 20%, #0a1340 0%, #02060f 100%)" }}>
      {/* HUD */}
      <div className="relative z-20 px-3 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 text-white"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
          <span className="text-xs font-bold opacity-70 whitespace-nowrap">🎯 Foco · Chuva</span>
          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-black/20 whitespace-nowrap">Nível {displayLevel}</span>
          <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-lg bg-amber-400/20 whitespace-nowrap" style={{ color: "#fbbf24" }}>⭐ {points}</span>
        </div>
      </div>

      {/* Comando — sempre visível no topo (troca a cada acerto/omissão) */}
      <div className="relative z-20 flex-shrink-0 px-3 pb-1">
        <div className="rounded-2xl px-3 py-2 text-center" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
          <p className="text-white text-base font-bold leading-tight">{command}</p>
        </div>
      </div>

      {/* Arena de queda */}
      <div ref={playRef} className="relative z-10 flex-1 overflow-hidden">
        {renderAgents.map(a => {
          const src = a.agent.images[0].src;
          const glow =
            a.state === "captured" && a.isTarget ? " drop-shadow(0 0 10px rgba(74,222,128,0.95)) drop-shadow(0 0 20px rgba(74,222,128,0.7))" :
            a.state === "wrong"    ? " drop-shadow(0 0 10px rgba(248,113,113,0.95))" : "";
          // Distratores "capturados" na transição de card fazem FADE (some).
          const opacity = a.state === "wrong" ? 0.5 : (a.state === "captured" && !a.isTarget ? 0 : 1);
          return (
            <div key={a.uid}
              ref={node => {
                if (node) {
                  nodesRef.current.set(a.uid, node);
                  const cur = agentsRef.current.find(x => x.uid === a.uid);
                  if (cur) node.style.transform = `translate(${cur.x - cur.baseX}px, ${cur.y}px)`;
                } else { nodesRef.current.delete(a.uid); }
              }}
              style={{ position: "absolute", left: a.baseX, top: 0, width: CHAR_SIZE, willChange: "transform", pointerEvents: "none", zIndex: 3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src + AGENT_V} alt={a.agent.name} decoding="async" loading="eager" draggable={false}
                style={{ width: "100%", height: "auto", display: "block", userSelect: "none",
                  opacity,
                  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" + glow,
                  transition: "filter 200ms, opacity 200ms", pointerEvents: "none" }} />
              <button onClick={() => handleTap(a.uid)} aria-label={a.agent.name}
                className="absolute cursor-pointer"
                style={{ left: `${HIT_L * 100}%`, width: `${(HIT_R - HIT_L) * 100}%`,
                  top: `${HIT_T * 100}%`, height: `${(HIT_B - HIT_T) * 100}%`,
                  background: "transparent", border: "none", padding: 0,
                  pointerEvents: a.state === "falling" ? "auto" : "none", touchAction: "manipulation" }} />
              {a.state === "captured" && a.isTarget && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✓</div>
              )}
              {a.state === "wrong" && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-black shadow-lg pointer-events-none">✕</div>
              )}
            </div>
          );
        })}

        {/* Feedback rápido (erro impulsivo) */}
        <AnimatePresence>
          {flash && (
            <motion.div className="absolute inset-x-0 bottom-6 z-30 flex justify-center pointer-events-none"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
                style={{ background: "rgba(220,38,38,0.92)", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
                ❌ {flash.msg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GATE DE COMANDO — card central + botão "Começar". Abre antes de CADA
          comando (inclusive o 1º). Enquanto aberto, a chuva está pausada. */}
      <AnimatePresence>
        {phase === "card" && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center px-6"
            style={{ background: "rgba(4, 10, 30, 0.72)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <motion.div className="w-full max-w-sm rounded-3xl px-6 py-7 text-center"
              style={{ background: "rgba(124,58,237,0.22)", border: "1.5px solid rgba(167,139,250,0.55)", boxShadow: "0 12px 48px rgba(0,0,0,0.55)" }}
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}>
              <p className="text-violet-200/80 text-xs font-bold uppercase tracking-widest mb-2">Comando</p>
              <p className="text-white text-2xl font-black leading-snug mb-6">{command}</p>
              <button onClick={startPlaying}
                className="w-full h-14 rounded-2xl text-white text-lg font-black active:scale-95"
                style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)", boxShadow: "0 6px 24px rgba(124,58,237,0.5)" }}>
                Começar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
