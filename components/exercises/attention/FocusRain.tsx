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
//  • spawnMs       — intervalo entre spawns (↓ = mais caindo).
//  • maxConcurrent — máximo simultâneo (4 → 8 conforme o nível).
//  • secondChance  — multiplicador de velocidade da 2ª queda de um alvo que escapou.
//  • nearFrac      — fração dos DISTRATORES tirados da família confusável (o resto
//    vira variedade). Sobe com o nível (mais parecidos = mais difícil).
interface RainCfg { fallMs: number; spawnMs: number; maxConcurrent: number; secondChance: number; nearFrac: number }
const RAIN_CFG: Record<number, RainCfg> = {
  1: { fallMs: 6200, spawnMs: 1000, maxConcurrent: 4, secondChance: 1.4,  nearFrac: 0.65 },
  2: { fallMs: 5600, spawnMs:  920, maxConcurrent: 4, secondChance: 1.45, nearFrac: 0.70 },
  3: { fallMs: 5000, spawnMs:  850, maxConcurrent: 5, secondChance: 1.5,  nearFrac: 0.75 },
  4: { fallMs: 4500, spawnMs:  780, maxConcurrent: 6, secondChance: 1.55, nearFrac: 0.80 },
  5: { fallMs: 4000, spawnMs:  710, maxConcurrent: 6, secondChance: 1.6,  nearFrac: 0.85 },
  6: { fallMs: 3600, spawnMs:  640, maxConcurrent: 7, secondChance: 1.65, nearFrac: 0.88 },
  7: { fallMs: 3200, spawnMs:  560, maxConcurrent: 8, secondChance: 1.7,  nearFrac: 0.92 },
};

// Progressão: sobe +1 nível a cada LEVEL_UP_HITS comandos resolvidos seguidos;
// erro impulsivo OU omissão zera a sequência e MANTÉM o nível (não desce).
const LEVEL_UP_HITS = 4;
const MAX_LEVEL     = 7;

const fallSpeed = (playH: number, fallMs: number) => (playH + CHAR_H) / fallMs;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ── SISTEMA DE REGRAS (1 feature por comando) ───────────────────────────────────
// Cada regra é montada do ROSTER real (allAgents). matches(a) diz se `a` é o ALVO;
// family = pool de distratores CONFUSÁVEIS (parecidos, mas NÃO batem a regra).
export interface Rule {
  key: string;                 // identidade da regra (evita repetir a mesma seguidas)
  text: string;                // "Ache o de chapéu"
  matches: (a: AgentConfig) => boolean;
  targetPool: AgentConfig[];   // agentes que batem a regra (o alvo é 1 deles)
  family: AgentConfig[];       // distratores confusáveis (mesma família, não batem)
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

// Constrói a lista de TODAS as regras possíveis (uma por valor de feature + cores).
export function buildAllRules(): Rule[] {
  const rules: Rule[] = [];
  const HEAD_PT: Record<string, string> = { chapeu: "chapéu", coroa: "coroa", gorro: "gorro" };
  const SPEC_PT: Record<string, string> = { luva: "luva", oculos_escuro: "óculos escuro" };
  const EXPR_PT: Record<string, string> = { alegria: "alegre", tristeza: "triste", raiva: "com raiva" };
  const HELDOBJ_PT: Record<string, string> = { balao: "balão", pipa: "pipa", guarda_chuva: "guarda-chuva" };
  const SIDE_PT: Record<string, string> = { esq: "à esquerda", dir: "à direita" };
  const BALL_PT: Record<string, string> = { futebol: "de futebol", basquete: "de basquete" };

  // CABEÇA — chapéu/coroa/gorro. Família: outros itens de cabeça + boné + base sem cabeça.
  for (const v of ["chapeu", "coroa", "gorro"]) {
    const fam = [...anyHead.filter(a => a.headItem !== v), ...withCap, ...plainBase];
    rules.push({ key: `head:${v}`, text: `Ache o de ${HEAD_PT[v]}`, matches: a => a.headItem === v, targetPool: withHead(v), family: fam });
  }
  // ESPECIAL — luva/óculos escuro. Família: o outro especial + base.
  for (const v of ["luva", "oculos_escuro"]) {
    const fam = [...anySpecial.filter(a => a.special !== v), ...plainBase];
    rules.push({ key: `special:${v}`, text: `Ache o de ${SPEC_PT[v]}`, matches: a => a.special === v, targetPool: withSpecial(v), family: fam });
  }
  // EXPRESSÃO — alegre/triste/raiva. Família: as outras expressões.
  for (const v of ["alegria", "tristeza", "raiva"]) {
    const fam = anyExpr.filter(a => a.faceExpr !== v);
    rules.push({ key: `expr:${v}`, text: `Ache o ${EXPR_PT[v]}`, matches: a => a.faceExpr === v, targetPool: withExpr(v), family: fam });
  }
  // BOLA + LADO — futebol/basquete × esq/dir. Família: TODAS as outras bolas
  // (mesma bola lado oposto, outra bola ambos os lados) — o LADO discrimina.
  for (const held of ["futebol", "basquete"] as const)
    for (const side of ["esq", "dir"] as const) {
      const fam = ballAgents.filter(a => !(a.held === held && a.heldSide === side));
      rules.push({
        key: `ball:${held}/${side}`,
        text: `Ache o com a bola ${BALL_PT[held]} ${SIDE_PT[side]}`,
        matches: a => a.held === held && a.heldSide === side,
        targetPool: ROSTER.filter(a => a.held === held && a.heldSide === side),
        family: fam,
      });
    }
  // SKATE — com/sem bermuda. Família: a outra variante de skate + objetos segurados.
  rules.push({ key: "held:skate", text: "Ache o de skate", matches: a => a.held === "skate" && !a.bermuda, targetPool: skatePlain, family: [...skateBerm, ...heldObjects] });
  rules.push({ key: "held:skate_bermuda", text: "Ache o de skate de bermuda", matches: a => a.held === "skate" && a.bermuda === true, targetPool: skateBerm, family: [...skatePlain, ...heldObjects] });
  // OBJETO SEGURADO — balão/pipa/guarda-chuva. Família: os outros objetos segurados.
  for (const v of ["balao", "pipa", "guarda_chuva"]) {
    const fam = heldObjects.filter(a => a.held !== v);
    rules.push({ key: `held:${v}`, text: `Ache o que segura ${HELDOBJ_PT[v]}`, matches: a => a.held === v, targetPool: ROSTER.filter(a => a.held === v), family: fam });
  }
  // COR — família: cores vizinhas (discriminação de cor não trivial).
  for (const c of Object.keys(COLOR_LABEL)) {
    const fam = COLOR_NEIGHBORS[c].flatMap(nc => withColor(nc));
    rules.push({ key: `color:${c}`, text: `Ache o ${COLOR_LABEL[c]}`, matches: a => a.color === c, targetPool: withColor(c), family: fam });
  }
  // Só mantém regras com pool de alvo e de família suficientes.
  return rules.filter(r => r.targetPool.length >= 1 && r.family.length >= 3);
}

// Peso das regras por nível: nos níveis baixos, regras "grossas" (cor, cabeça,
// especial, objeto, skate); o LADO da bola (sutil) entra mais nos níveis altos.
export function ruleAllowed(r: Rule, level: number): boolean {
  if (r.key.startsWith("ball:")) return level >= 3;   // lado da bola = fino, só N3+
  if (r.key.startsWith("held:skate_bermuda")) return level >= 2;
  if (r.key.startsWith("color:")) return level <= 4;  // cor é fácil; evita nos altos
  return true;
}

type RainStateT = "falling" | "captured" | "wrong" | "missed";

interface RainAgent {
  uid: string;
  agent: AgentConfig;
  isTarget: boolean;   // é o alvo do comando ATUAL (marcado no spawn)
  x: number;
  y: number;
  vy: number;
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
  const lastSpawnXRef = useRef(-1);

  // Regra atual + controle de "há alvo vivo para esta regra".
  const rulesRef      = useRef<Rule[]>(buildAllRules());
  const ruleRef       = useRef<Rule | null>(null);
  const targetAliveRef = useRef(false);   // já existe um alvo (não resolvido) da regra atual?
  const cmdStartRef   = useRef(0);        // ts em que o comando atual apareceu (RT)

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

  // Escolhe uma NOVA regra: aleatória, permitida no nível, diferente da anterior e
  // que NÃO seja satisfeita por NENHUM agente já em queda (garante 1 alvo só — o
  // que vamos spawnar). Fallback: qualquer regra permitida.
  const pickNewRule = useCallback(() => {
    const lv = levelRef.current;
    const falling = agentsRef.current.filter(a => a.state === "falling").map(a => a.agent);
    const allowed = rulesRef.current.filter(r => ruleAllowed(r, lv));
    const prevKey = ruleRef.current?.key;
    const safe = shuffle(allowed).filter(r =>
      r.key !== prevKey && !falling.some(a => r.matches(a)),
    );
    const chosen = safe[0]
      ?? shuffle(allowed).find(r => !falling.some(a => r.matches(a)))   // aceita repetir chave se preciso
      ?? pick(allowed);
    ruleRef.current = chosen;
    cmdStartRef.current = Date.now();
    // Invariante "1 alvo por comando": se algum agente JÁ em queda casa com a nova
    // regra (só no fallback raro), promove UM deles a alvo e desmarca os demais —
    // assim nunca há 2 alvos, e o spawn não cria outro (targetAlive=true).
    const matchers = agentsRef.current.filter(a => a.state === "falling" && chosen.matches(a.agent));
    if (matchers.length > 0) {
      matchers.forEach((a, i) => { a.isTarget = i === 0; });
      targetAliveRef.current = true;
      commitRender();
    } else {
      targetAliveRef.current = false;   // o próximo spawn cria o alvo
    }
    setCommand(chosen.text);
    if (presentMode !== "visual") speak(cleanForSpeech(chosen.text));
  }, [presentMode, speak, commitRender]);

  // Cria um RainAgent (posiciona no topo, x espalhado).
  const makeFaller = useCallback((agent: AgentConfig, isTarget: boolean): RainAgent => {
    const W = playWRef.current || 360;
    const H = playHRef.current || 600;
    const maxX = Math.max(4, W - CHAR_SIZE - 4);
    let x = 4 + Math.random() * maxX;
    if (lastSpawnXRef.current >= 0 && Math.abs(x - lastSpawnXRef.current) < CHAR_SIZE) {
      x = (lastSpawnXRef.current + W / 2) % maxX;
    }
    lastSpawnXRef.current = x;
    return {
      uid: `r${uidSeq.current++}`, agent, isTarget,
      x, y: -CHAR_H, vy: fallSpeed(H, RAIN_CFG[levelRef.current].fallMs),
      passCount: 0, spawnAt: Date.now(), state: "falling",
    };
  }, []);

  // Spawn: se NÃO há alvo vivo da regra atual → spawna o ALVO; senão spawna um
  // DISTRATOR confusável (com alguma variedade). NUNCA 2 alvos da mesma regra.
  const spawnOne = useCallback(() => {
    if (doneRef.current) return;
    const cfg = RAIN_CFG[levelRef.current];
    const alive = agentsRef.current.filter(a => a.state === "falling").length;
    if (alive >= cfg.maxConcurrent) return;
    const rule = ruleRef.current;
    if (!rule) return;

    let ra: RainAgent;
    if (!targetAliveRef.current) {
      // spawna o ÚNICO alvo do comando atual.
      const agent = pick(rule.targetPool);
      ra = makeFaller(agent, true);
      targetAliveRef.current = true;
    } else {
      // distrator: da família (confusável) na maioria; senão variedade do roster.
      const near = Math.random() < cfg.nearFrac;
      const poolNear = rule.family.filter(a => !rule.matches(a));
      const poolFar  = ROSTER.filter(a => !rule.matches(a));
      const pool = (near && poolNear.length ? poolNear : poolFar);
      ra = makeFaller(pick(pool), false);
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

  // Resolve o alvo (acerto por toque OU omissão por escape) → troca de comando.
  const resolveTargetAndSwitch = useCallback(() => {
    targetAliveRef.current = false;
    pickNewRule();
  }, [pickNewRule]);

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

    // Primeiro comando + primeiro spawn (o alvo). O intervalo é criado no effect
    // [displayLevel] (também dispara na montagem) → um só intervalo.
    pickNewRule();
    spawnOne();

    let prev: number | null = null;
    const tick = (ts: number) => {
      if (doneRef.current) return;
      const dt = prev === null ? 16 : Math.min(ts - prev, 100);
      prev = ts;
      const H = playHRef.current;
      const bottom = H;
      let changed = false;
      let targetOmitted = false;

      for (const a of agentsRef.current) {
        if (a.state !== "falling") continue;
        a.y += a.vy * dt;
        const node = nodesRef.current.get(a.uid);
        if (node) node.style.transform = `translate(0px, ${a.y}px)`;
        if (a.y >= bottom) {
          if (a.isTarget && a.passCount === 0) {
            // 2ª CHANCE.
            a.passCount = 1;
            a.y = -CHAR_H;
            a.vy = fallSpeed(H, RAIN_CFG[levelRef.current].fallMs) * RAIN_CFG[levelRef.current].secondChance;
            if (node) node.style.transform = `translate(0px, ${a.y}px)`;
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
        // A omissão troca a regra DEPOIS de remover o alvo escapado (para o
        // pickNewRule não "ver" o próprio alvo entre os que estão caindo).
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
    spawnTimerRef.current = setInterval(() => spawnOne(), RAIN_CFG[levelRef.current].spawnMs);
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
          const dim = a.state === "wrong";
          return (
            <div key={a.uid}
              ref={node => {
                if (node) {
                  nodesRef.current.set(a.uid, node);
                  const cur = agentsRef.current.find(x => x.uid === a.uid);
                  if (cur) node.style.transform = `translate(0px, ${cur.y}px)`;
                } else { nodesRef.current.delete(a.uid); }
              }}
              style={{ position: "absolute", left: a.x, top: 0, width: CHAR_SIZE, willChange: "transform", pointerEvents: "none", zIndex: 3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src + AGENT_V} alt={a.agent.name} decoding="async" loading="eager" draggable={false}
                style={{ width: "100%", height: "auto", display: "block", userSelect: "none",
                  opacity: dim ? 0.5 : 1,
                  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" + glow,
                  transition: "filter 150ms, opacity 150ms", pointerEvents: "none" }} />
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
    </div>
  );
}
