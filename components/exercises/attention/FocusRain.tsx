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

const AGENT_V = "?v=9";   // cache-bust (imagens NORMALIZADAS 360×540) — igual ao FocusAgents

// ── Tamanho / hitbox (idênticos ao Foco da arena) ───────────────────────────────
const CHAR_SIZE = 100;             // boneco na tela = CHAR_SIZE (imagens normalizadas pelo boneco)
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
// DECISÃO da terapeuta (12/jul): tamanho E densidade PADRÃO em todos os níveis;
// a progressão é só VELOCIDADE (fallMs ↓) + COMANDOS mais complexos (nearFrac ↑,
// multi-alvo nos níveis altos).
interface RainCfg { fallMs: number; secondChance: number; nearFrac: number; areaPerAgent: number }
const RAIN_CFG: Record<number, RainCfg> = {
  1: { fallMs: 7200, secondChance: 1.4,  nearFrac: 0.90, areaPerAgent: 42000 },
  2: { fallMs: 6500, secondChance: 1.45, nearFrac: 0.92, areaPerAgent: 42000 },
  3: { fallMs: 5900, secondChance: 1.5,  nearFrac: 0.94, areaPerAgent: 42000 },
  4: { fallMs: 5300, secondChance: 1.55, nearFrac: 0.96, areaPerAgent: 42000 },
  5: { fallMs: 4800, secondChance: 1.6,  nearFrac: 0.98, areaPerAgent: 42000 },
  6: { fallMs: 4300, secondChance: 1.65, nearFrac: 0.99, areaPerAgent: 42000 },
  7: { fallMs: 3900, secondChance: 1.7,  nearFrac: 1.00, areaPerAgent: 42000 },
};
const SPAWN_TICK = 150;    // tick rápido; a densidade real é limitada por targetConcurrent().
const MAX_ON_SCREEN = 24;  // teto. Desktop ~16 (N1) a ~24 (N7); celular ~5. Fluxo ritmado evita rajada.
// Antes de o ALVO poder cair: pelo menos estes distratores + tempo (o alvo NUNCA é o 1º).
const MIN_DISTRACTORS_BEFORE_TARGET = 7;    // cai bastante distrator antes do alvo (vigilância)
const MIN_MS_BEFORE_TARGET = 2600;          // ≥2,6s de busca ativa antes do alvo poder entrar
// Quantos agentes simultâneos p/ a ÁREA atual — adapta ao monitor (menos denso).
function targetConcurrent(level: number, W: number, H: number): number {
  return Math.max(4, Math.min(MAX_ON_SCREEN, Math.round((W * H) / RAIN_CFG[level].areaPerAgent)));
}

// Progressão: sobe +1 nível a cada LEVEL_UP_HITS comandos resolvidos seguidos;
// erro impulsivo OU omissão zera a sequência e MANTÉM o nível (não desce).
const LEVEL_UP_HITS = 3;
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
  // "de skate" = QUALQUER skate (calça OU bermuda) — senão vira ambíguo (os dois têm skate).
  // A distinção fina (bermuda) fica só no comando explícito "de skate de bermuda".
  defs.push({ key: "held:skate", frag: "de skate", match: a => a.held === "skate", pool: [...skatePlain, ...skateBerm] });
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
  if (f.key === "held:skate")     return [...heldObjects, ...plainBase];   // "de skate"=qualquer skate → distrator = outros objetos/base
  if (f.key === "held:skate_bermuda") return [...skatePlain, ...heldObjects]; // bermuda vs calça = discriminação fina (comando explícito)
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
  if (r.key.includes("ball:") && level < 2) return false;         // lado da bola = fino
  if (r.key.includes("held:skate_bermuda") && level < 2) return false;

  // SÓ comandos COMBINADOS (2 pistas: cor + feature). Nada de comando de 1 atributo.
  return r.combined;
}

// Nº de ALVOS por comando (sub-regras distintas): N1-4=1, N5-6=2, N7=3.
export function numTargetsForLevel(level: number): number {
  if (level >= 7) return 3;
  if (level >= 5) return 2;
  return 1;
}

// Um COMANDO = N sub-regras DISTINTAS (cada uma combinada cor+feature), com alvos
// distintos e sem sobreposição (nenhum alvo de uma bate outra; nenhum distrator
// bate qualquer sub-regra). O texto junta os fragmentos das sub-regras com " e o ".
export interface Command {
  subRules: Rule[];
  targetAgents: AgentConfig[];   // 1 agente-alvo escolhido por sub-regra (distintos)
  text: string;                  // "Ache o agente azul de gorro e o vermelho de bermuda"
}

// `frag` de uma regra combinada = "cor + feature" (tira o "Ache o agente " do texto).
function ruleFrag(r: Rule): string {
  return r.text.replace(/^Ache o agente /, "");
}

// Monta um comando com N sub-regras: sorteia regras combinadas permitidas no nível,
// exige que cada alvo escolhido bata SÓ a sua sub-regra (sem overlap) e que as
// sub-regras/fragmentos sejam distintos. `avoid` = agentes que não podem ser alvo
// (ex.: os que já estão caindo — mantém o card limpo). Fallback: 1 sub-regra.
export function buildCommand(
  level: number, allRules: Rule[],
  avoid: (a: AgentConfig) => boolean = () => false,
  ruleOk: (r: Rule) => boolean = () => true,          // ex.: nenhum faller vivo pode bater a regra
): Command {
  const n = numTargetsForLevel(level);
  const allowed0 = allRules.filter(r => ruleAllowed(r, level));
  const allowedOk = allowed0.filter(ruleOk);
  const allowed = allowedOk.length >= n ? allowedOk : allowed0;   // degrada com segurança (cull cobre)
  for (let attempt = 0; attempt < 60; attempt++) {
    const chosen: Rule[] = [];
    const targets: AgentConfig[] = [];
    const usedFrag = new Set<string>();
    for (const r of shuffle(allowed)) {
      if (chosen.length >= n) break;
      const frag = ruleFrag(r);
      if (usedFrag.has(frag)) continue;
      // alvo candidato: bate ESTA regra, não é agente já usado/evitado, e NÃO bate
      // nenhuma sub-regra já escolhida (sem overlap entre sub-regras).
      const cand = shuffle(r.targetPool).find(a =>
        !targets.some(t => t.id === a.id) && !avoid(a) && !chosen.some(cr => cr.matches(a)),
      );
      if (!cand) continue;
      // e nenhum alvo JÁ escolhido pode bater esta nova regra (simetria).
      if (targets.some(t => r.matches(t))) continue;
      chosen.push(r); targets.push(cand); usedFrag.add(frag);
    }
    if (chosen.length === n) {
      const text = "Ache o agente " + chosen.map(ruleFrag).join(" e o ");
      return { subRules: chosen, targetAgents: targets, text };
    }
  }
  // Fallback graciosos: 1 sub-regra (nunca quebra).
  const r = pick(allowed);
  const t = pick(r.targetPool);
  return { subRules: [r], targetAgents: [t], text: r.text };
}

type RainStateT = "falling" | "captured" | "wrong" | "missed";

interface RainAgent {
  uid: string;
  agent: AgentConfig;
  isTarget: boolean;   // é UM dos alvos do comando ATUAL (marcado no spawn)
  subIndex: number;    // qual sub-regra este alvo representa (-1 = distrator)
  x: number;           // posição horizontal ATUAL (baseX + balanço)
  baseX: number;       // âncora horizontal (o balanço oscila ao redor dela)
  y: number;
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
  const [cardNote, setCardNote] = useState<string | null>(null);
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
  const agentsRef    = useRef<RainAgent[]>([]);
  const nodesRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const levelRef     = useRef(Math.max(1, Math.min(MAX_LEVEL, Math.round(level))));
  const startLevelRef = useRef(levelRef.current);
  const reachedRef   = useRef(levelRef.current);
  const uidSeq       = useRef(0);
  const doneRef      = useRef(false);

  // COMANDO atual = N sub-regras. Controle por sub-regra: alvo vivo? resolvida?
  const rulesRef      = useRef<Rule[]>(buildAllRules());
  const cmdRef        = useRef<Command | null>(null);
  const subAliveRef   = useRef<boolean[]>([]);   // sub i tem alvo vivo (não resolvido) na tela?
  const subResolvedRef = useRef<boolean[]>([]);  // sub i já resolvida (capturada OU omitida)?
  const cmdCleanRef   = useRef(true);            // comando sem erro/omissão até agora (p/ subir de nível)
  const cmdStartRef   = useRef(0);        // ts em que a CHUVA do comando começou (RT)
  const phaseRef      = useRef<"card" | "playing">("card");   // espelho de `phase` p/ o loop/timers
  const distractorsThisCmdRef = useRef(0);   // quantos distratores já caíram NESTE comando (alvo nunca 1º)
  const lastSpawnAtRef = useRef(0);          // ritmo do fluxo contínuo (1 spawn a cada fallMs/maxC)

  // Métricas.
  const capturesRef   = useRef(0);
  const falsePosRef   = useRef(0);
  const omissionsRef  = useRef(0);
  const rtSumRef      = useRef(0);
  const rtNRef        = useRef(0);
  const firstMsListRef = useRef<number[]>([]);
  const consecHitsRef = useRef(0);
  const consecErrsRef = useRef(0);   // comandos FALHOS seguidos (2 → desce 1 nível)
  const pointsRef     = useRef(0);
  const eventsRef     = useRef<Array<{ mode: FocusMode; level: number; correct: boolean; endedBy: "correct" | "wrong" | "timeout"; rtMs: number }>>([]);

  const commitRender = useCallback(() => { setRenderAgents(agentsRef.current.map(a => ({ ...a }))); }, []);

  // Abre o CARD do PRÓXIMO comando. A CHUVA NÃO É LIMPA: os agentes em queda ficam
  // congelados atrás do card e continuam como distratores do novo comando (a tela
  // nunca esvazia — sem "vácuo"). Segurança dupla: (a) o novo comando evita regras
  // que algum faller vivo satisfaça; (b) se mesmo assim sobrar um (fallback), ele é
  // removido na hora — garante "alvo só spawnado" e nunca 2 alvos.
  const openCommandCard = useCallback(() => {
    const lv = levelRef.current;
    const falling = agentsRef.current.filter(a => a.state === "falling").map(a => a.agent);
    const cmd = buildCommand(
      lv, rulesRef.current,
      a => falling.some(f => f.id === a.id),
      r => !falling.some(f => r.matches(f)),
    );
    // CULL de segurança: remove qualquer faller que bata alguma sub-regra nova.
    const clash = agentsRef.current.filter(a => a.state === "falling" && cmd.subRules.some(r => r.matches(a.agent)));
    if (clash.length) {
      const ids = new Set(clash.map(a => a.uid));
      agentsRef.current = agentsRef.current.filter(a => !ids.has(a.uid));
      for (const uid of ids) nodesRef.current.delete(uid);
      commitRender();
    }
    cmdRef.current = cmd;
    subAliveRef.current = cmd.subRules.map(() => false);
    subResolvedRef.current = cmd.subRules.map(() => false);
    cmdCleanRef.current = true;
    distractorsThisCmdRef.current = 0;
    setCommand(cmd.text);
    phaseRef.current = "card";
    setPhase("card");
  }, []);

  // "Começar": fecha o card e a chuva do comando começa a cair. RT começa AQUI
  // (busca real). Alvo só entra depois dos distratores (item 4). Fala se áudio.
  const startPlaying = useCallback(() => {
    if (phaseRef.current !== "card" || doneRef.current) return;
    cmdStartRef.current = Date.now();
    // Os fallers preservados já contam como distratores caídos (a tela já está povoada).
    distractorsThisCmdRef.current = agentsRef.current.filter(a => a.state === "falling").length;
    lastSpawnAtRef.current = 0;          // 1º agente entra já; os demais ritmados
    const cmd = cmdRef.current;
    if (cmd) { subAliveRef.current = cmd.subRules.map(() => false); }
    phaseRef.current = "playing";
    setPhase("playing");
    if (presentMode !== "visual" && cmd) speak(cleanForSpeech(cmd.text));
  }, [presentMode, speak]);

  // Cria um RainAgent. ESPALHAMENTO anti-sobreposição: gera ~8 candidatos de X e
  // escolhe o que MAXIMIZA a menor distância aos X dos agentes VIVOS que ainda
  // estão no topo (os "recém-caídos", y < 1.5×CHAR_H) — evita "um em cima do outro".
  const makeFaller = useCallback((agent: AgentConfig, isTarget: boolean, subIndex: number): RainAgent | null => {
    const W = playWRef.current || 360;
    const H = playHRef.current || 600;
    const maxX = Math.max(4, W - CHAR_SIZE - 4);
    // Evita sobrepor: considera quem está na METADE de cima (banda ampla) e escolhe o x
    // mais distante de todos eles (16 candidatos) — reduz "um em cima do outro".
    // Faixa de entrada ESTREITA (só quem acabou de entrar, y < 1.2×CHAR_H): evita
    // nascer sobreposto sem adiar spawns demais (adiar demais = buracos).
    const nearTop = agentsRef.current
      .filter(a => a.state === "falling" && a.y < CHAR_H * 1.2)
      .map(a => a.x);
    let bestX = 4 + Math.random() * maxX;
    let bestGap = -1;
    for (let i = 0; i < 24; i++) {
      const cand = 4 + Math.random() * maxX;
      const gap = nearTop.length ? Math.min(...nearTop.map(px => Math.abs(px - cand))) : Infinity;
      if (gap > bestGap) { bestGap = gap; bestX = cand; }
    }
    // DISTÂNCIA MÍNIMA dura no nascimento: sem vaga a ≥0.8×CHAR_SIZE → adia 150ms.
    if (bestGap < CHAR_SIZE * 0.8) return null;
    return {
      uid: `r${uidSeq.current++}`, agent, isTarget, subIndex,
      x: bestX, baseX: bestX,
      y: -CHAR_H,                                            // entra do topo; o escalonamento vem do RITMO de entrada
      swayAmp: 8 + Math.random() * 10,           // balanço leve (8–18px) — vivo, sem bagunçar
      swayPhase: Math.random() * Math.PI * 2,
      swayFreq: 0.0009 + Math.random() * 0.0008, // rad/ms
      passCount: 0, spawnAt: Date.now(), state: "falling",
    };
  }, []);

  // Spawn de UM agente. Só corre em phase="playing" (o card pausa a chuva).
  //  • Nenhum ALVO pode aparecer antes de ≥MIN_DISTRACTORS_BEFORE_TARGET distratores
  //    E ≥MIN_MS_BEFORE_TARGET desde o "Começar" (o alvo NUNCA é o primeiro a cair).
  //  • Garante 1 alvo VIVO por sub-regra pendente (subAlive/subResolved controlam) —
  //    nunca 2 alvos da mesma sub-regra; distratores nunca batem NENHUMA sub-regra.
  const spawnOne = useCallback(() => {
    if (doneRef.current || phaseRef.current !== "playing") return;
    const cfg = RAIN_CFG[levelRef.current];
    const alive = agentsRef.current.filter(a => a.state === "falling").length;
    const maxC = targetConcurrent(levelRef.current, playWRef.current || 360, playHRef.current || 600);
    if (alive >= maxC) return;
    // FLUXO CONTÍNUO (sem "vácuo"): ritma a entrada — 1 agente a cada fallMs/maxC ms.
    // Com a tela ainda meio vazia (< 60% do alvo), entra mais rápido (fill inicial).
    const baseGap = cfg.fallMs / maxC;
    const minGapMs = alive < maxC * 0.6 ? baseGap * 0.35 : baseGap;
    if (Date.now() - lastSpawnAtRef.current < minGapMs) return;
    const cmd = cmdRef.current;
    if (!cmd) return;
    // (lastSpawnAtRef só é marcado APÓS um spawn bem-sucedido — spawn adiado por
    // distância mínima tenta de novo no próximo tick, sem esperar o gap inteiro.)

    // "Alvo nunca 1º": só libera QUALQUER alvo após ≥N distratores E ≥900ms.
    const targetUnlocked =
      distractorsThisCmdRef.current >= MIN_DISTRACTORS_BEFORE_TARGET &&
      Date.now() - cmdStartRef.current >= MIN_MS_BEFORE_TARGET;

    // Sub-regras que precisam de um alvo: não resolvidas E sem alvo vivo agora.
    const needTarget = cmd.subRules
      .map((_, i) => i)
      .filter(i => !subResolvedRef.current[i] && !subAliveRef.current[i]);

    // Distrator: NÃO bate NENHUMA sub-regra. Near = compartilha 1 atributo com
    // alguma sub-regra (família); Far = variedade que não bate nenhuma.
    const matchesAnySub = (a: AgentConfig) => cmd.subRules.some(r => r.matches(a));
    const spawnDistractor = () => {
      const near = Math.random() < cfg.nearFrac;
      const famUnion = cmd.subRules.flatMap(r => r.family).filter(a => !matchesAnySub(a));
      const poolFar  = ROSTER.filter(a => !matchesAnySub(a));
      const pool = (near && famUnion.length ? famUnion : poolFar);
      return makeFaller(pick(pool.length ? pool : poolFar), false, -1);
    };

    let ra: RainAgent | null;
    let targetSub = -1;
    if (targetUnlocked && needTarget.length > 0) {
      // spawna 1 alvo de UMA sub-regra pendente (1 alvo vivo por sub-regra).
      const i = pick(needTarget);
      const r = cmd.subRules[i];
      const agent = cmd.targetAgents[i];   // alvo canônico da sub-regra (bate só ela)
      ra = makeFaller(agent && r.matches(agent) ? agent : pick(r.targetPool), true, i);
      targetSub = i;
    } else {
      ra = spawnDistractor();
    }
    if (!ra) return;                        // adiado (sem vaga com distância mínima); tenta no próximo tick
    if (targetSub >= 0) subAliveRef.current[targetSub] = true;
    else distractorsThisCmdRef.current++;
    lastSpawnAtRef.current = Date.now();
    agentsRef.current = [...agentsRef.current, ra];
    commitRender();
  }, [makeFaller, commitRender]);

  // Progressão por COMANDO (modelo da terapeuta): acerto → novo comando (3 seguidos
  // = SOBE 1 nível); erro/omissão → novo comando (2 falhos seguidos = DESCE 1 nível,
  // piso 1). O nível novo vale a partir do PRÓXIMO comando.
  const onCommandResolved = useCallback((clean: boolean) => {
    if (clean) {
      consecErrsRef.current = 0;
      consecHitsRef.current++;
      if (consecHitsRef.current >= LEVEL_UP_HITS && levelRef.current < MAX_LEVEL) {
        levelRef.current++;
        consecHitsRef.current = 0;
        reachedRef.current = Math.max(reachedRef.current, levelRef.current);
        setDisplayLevel(levelRef.current);
      }
    } else {
      consecHitsRef.current = 0;
      consecErrsRef.current++;
      if (consecErrsRef.current >= 2 && levelRef.current > 1) {
        levelRef.current--;
        consecErrsRef.current = 0;
        setDisplayLevel(levelRef.current);
      }
    }
  }, []);

  // Comando RESOLVIDO (todas as sub-regras capturadas/omitidas) → progressão +
  // CARD do próximo comando. A CHUVA FICA (congelada atrás do card, sem limpar) —
  // a tela nunca esvazia; os fallers viram distratores do próximo comando.
  const finishCommandAndNextCard = useCallback(() => {
    if (phaseRef.current !== "playing") return;   // já em transição
    phaseRef.current = "card";     // pausa spawns/física imediatamente
    setCardNote(cmdCleanRef.current ? null : "❌ Não foi dessa vez — atenção no próximo!");
    onCommandResolved(cmdCleanRef.current);        // 3 limpos = sobe · 2 falhos = desce
    setTimeout(() => {
      if (doneRef.current) return;
      openCommandCard();           // card do próximo comando (fallers preservados)
    }, 260);
  }, [openCommandCard, onCommandResolved]);

  // Marca a sub-regra i como resolvida (por captura ou omissão) e, se TODAS as
  // sub-regras estiverem resolvidas, encerra o comando → próximo card.
  const resolveSub = useCallback((i: number) => {
    subResolvedRef.current[i] = true;
    subAliveRef.current[i] = false;
    if (subResolvedRef.current.every(Boolean)) finishCommandAndNextCard();
  }, [finishCommandAndNextCard]);

  // ── Toque num agente ──
  const handleTap = useCallback((uid: string) => {
    const a = agentsRef.current.find(x => x.uid === uid);
    if (!a || a.state !== "falling" || doneRef.current) return;
    const cmd = cmdRef.current;
    if (!cmd) return;
    const rt = Date.now() - cmdStartRef.current;   // RT = comando → captura
    // Bate ALGUMA sub-regra ainda NÃO resolvida? (o alvo bate só a sua sub-regra.)
    const subIdx = cmd.subRules.findIndex((r, i) => !subResolvedRef.current[i] && r.matches(a.agent));

    if (subIdx >= 0) {
      // ACERTO de uma sub-regra → captura esse alvo (o comando pode ainda ter outros).
      a.state = "captured";
      capturesRef.current++;
      rtSumRef.current += rt; rtNRef.current++;
      firstMsListRef.current.push(rt);
      pointsRef.current += 10 + (rt < 2000 ? 5 : 0);
      setPoints(pointsRef.current);
      soundCapture(); if (fbLevel !== "leve") vibrate(40);
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: true, endedBy: "correct", rtMs: rt });
      commitRender();
      setTimeout(() => {
        agentsRef.current = agentsRef.current.filter(x => x.uid !== a.uid);
        nodesRef.current.delete(a.uid);
        commitRender();
      }, 220);
      resolveSub(subIdx);   // marca a sub-regra; encerra o comando se foi a última
    } else {
      // ERRO impulsivo (não bate nenhuma sub-regra) — a TAREFA ACABA AQUI:
      // vai imediatamente para o card do PRÓXIMO comando (modelo da terapeuta:
      // acerto→novo comando, erro→novo comando; 2 erros seguidos = desce 1 nível).
      a.state = "wrong";
      falsePosRef.current++;
      cmdCleanRef.current = false;
      pointsRef.current = Math.max(0, pointsRef.current - 5);
      setPoints(pointsRef.current);
      soundWrong(); if (fbLevel !== "leve") vibrate(fbLevel === "intenso" ? [80, 50, 80] : [50, 40, 50]);
      eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "wrong", rtMs: rt });
      commitRender();
      setTimeout(() => {
        agentsRef.current = agentsRef.current.filter(x => x.uid !== a.uid);
        nodesRef.current.delete(a.uid);
        commitRender();
      }, 320);
      finishCommandAndNextCard();    // encerra a tarefa → próximo card (phase="card" bloqueia toques)
    }
  }, [fbLevel, commitRender, resolveSub, finishCommandAndNextCard]);

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
      const omittedSubs: number[] = [];   // sub-regras que sofreram omissão neste frame

      // Velocidade calculada POR QUADRO para TODOS (uniforme sempre — inclusive
      // quando o nível muda, ninguém "ultrapassa" ninguém). Única exceção: alvo
      // na 2ª chance cai secondChance× mais rápido (pedido da terapeuta).
      const baseV = fallSpeed(H, RAIN_CFG[levelRef.current].fallMs);
      for (const a of agentsRef.current) {
        if (a.state !== "falling") continue;
        const v = a.isTarget && a.passCount === 1 ? baseV * RAIN_CFG[levelRef.current].secondChance : baseV;
        a.y += v * dt;
        a.swayPhase += a.swayFreq * dt;
        const swayX = a.swayAmp * Math.sin(a.swayPhase);
        a.x = a.baseX + swayX;                       // posição horizontal viva (balanço)
        const node = nodesRef.current.get(a.uid);
        if (node) {
          node.style.transform = `translate(${swayX}px, ${a.y}px)`;
          // Profundidade: quem está mais EMBAIXO fica na FRENTE (clique previsível na sobreposição).
          node.style.zIndex = String(1000 + Math.round(a.y));
        }
        if (a.y >= bottom) {
          if (a.isTarget && a.passCount === 0) {
            // 2ª CHANCE (por alvo, independente) — velocidade vem do cálculo por quadro.
            a.passCount = 1;
            a.y = -CHAR_H;
            if (node) node.style.transform = `translate(${swayX}px, ${a.y}px)`;
          } else if (a.isTarget) {
            // OMISSÃO desta sub-regra (escapou 2×). O alvo daquela sub-regra não
            // volta; a sub-regra fica resolvida-por-omissão.
            a.state = "missed";
            omissionsRef.current++;
            cmdCleanRef.current = false;
            soundMiss(); if (fbLevel === "intenso") vibrate([30, 20, 30]);
            eventsRef.current.push({ mode: "foco", level: levelRef.current, correct: false, endedBy: "timeout", rtMs: Date.now() - cmdStartRef.current });
            if (a.subIndex >= 0) { subAliveRef.current[a.subIndex] = false; omittedSubs.push(a.subIndex); }
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
        commitRender();
        // Marca as sub-regras omitidas como resolvidas; se foi a última, o comando
        // encerra e vai pro próximo card (resolveSub cuida disso).
        for (const i of omittedSubs) resolveSub(i);
      }

      if (isTimeUp()) { endSession(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", measure);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
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

      {/* Comando — aparece só no CARD (antes de "Começar"). Durante a busca ele SOME:
          o paciente já leu e deve procurar de memória (carga de memória de trabalho). */}
      {phase === "card" && (
        <div className="relative z-20 flex-shrink-0 px-3 pb-1">
          <div className="rounded-2xl px-3 py-2 text-center" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(167,139,250,0.4)" }}>
            <p className="text-white text-base font-bold leading-tight">{command}</p>
          </div>
        </div>
      )}

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

      </div>

      {/* GATE DE COMANDO — card central + botão "Começar". Abre antes de CADA
          comando (inclusive o 1º). Enquanto aberto, a chuva está pausada. */}
      <AnimatePresence>
        {phase === "card" && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center px-6"
            style={{ background: "rgba(4, 10, 30, 0.72)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <motion.div className="max-w-[94vw] rounded-3xl px-8 py-7 text-center"
              style={{ background: "rgba(124,58,237,0.22)", border: "1.5px solid rgba(167,139,250,0.55)", boxShadow: "0 12px 48px rgba(0,0,0,0.55)" }}
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}>
              {cardNote && (
                <p className="text-red-300 text-sm font-bold mb-2">{cardNote}</p>
              )}
              <p className="text-violet-200/80 text-xs font-bold uppercase tracking-widest mb-2">Comando</p>
              {/* uma linha só (sem quebrar o texto) */}
              <p className="text-white text-xl font-black whitespace-nowrap mb-6">{command}</p>
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
