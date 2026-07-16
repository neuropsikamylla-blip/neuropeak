import type { AdaptiveResult, SessionData } from "@/types";
import { average } from "@/lib/utils";

/**
 * Calculate new difficulty based on recent session performance
 */
export function calculateNewDifficulty(
  currentDifficulty: number,
  recentSessions: SessionData[],
  exerciseId: string
): AdaptiveResult {
  // Use last 5 sessions for this exercise
  const relevant = recentSessions
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  if (relevant.length < 2) {
    return {
      newDifficulty: currentDifficulty,
      action: "maintain",
      reason: "Sessões insuficientes para ajuste (mínimo 2).",
    };
  }

  const avgAccuracy = average(relevant.map((s) => s.accuracy));

  if (avgAccuracy > 0.85 && currentDifficulty < 10) {
    const newDifficulty = Math.min(10, currentDifficulty + 1);
    return {
      newDifficulty,
      action: "increase",
      reason: `Precisão média de ${Math.round(avgAccuracy * 100)}% acima de 85%. Aumentando dificuldade.`,
    };
  }

  if (avgAccuracy < 0.6 && currentDifficulty > 1) {
    const newDifficulty = Math.max(1, currentDifficulty - 1);
    return {
      newDifficulty,
      action: "decrease",
      reason: `Precisão média de ${Math.round(avgAccuracy * 100)}% abaixo de 60%. Reduzindo dificuldade.`,
    };
  }

  return {
    newDifficulty: currentDifficulty,
    action: "maintain",
    reason: `Precisão média de ${Math.round(avgAccuracy * 100)}% na faixa adequada (60-85%).`,
  };
}

// ── Progressão clínica da Dupla Tarefa ───────────────────────────────────────
// Diferente da engine genérica: exige que AS DUAS tarefas estejam boas para subir,
// limita o passo (±1; -2 só se muito ruim) e mantém um "nível consolidado" (o maior
// nível executado com desempenho suficiente), que não é simplesmente o último alcançado.
export interface DualTaskMetrics {
  accTop: number;
  accBottom: number;
  accTotal: number;
  fpTop: number;
  fpBottom: number;
  omTop: number;
  omBottom: number;
}
export interface DualTaskProgression {
  nextLevel: number;          // nível em que a próxima sessão começa (nextStartLevel)
  action: "increase" | "maintain" | "decrease";
  consolidatedLevel: number;  // maior nível executado com desempenho suficiente
  reason: string;
}

// ── Engine de progressão genérica (reutilizável por qualquer exercício novo) ─────
// Implementa a "Regra geral" das specs: sobe ≥0.85, mantém 0.70-0.85, desce <0.65,
// -2 só se <0.45; nível consolidado só com ≥0.80; passo limitado a ±1 (exceto -2);
// se houver dimensões (ex.: item + ordem), não sobe se alguma estiver < 0.80.
export interface ProgressionInput {
  accTotal: number;
  dims?: number[];      // dimensões que precisam estar ≥0.80 para subir (item, ordem, etc.)
  impulsive?: boolean;  // muitos erros por impulsividade/omissão travam a subida
}
export interface ProgressionResult {
  nextLevel: number;
  action: "increase" | "maintain" | "decrease";
  consolidatedLevel: number;
  reason: string;
}

export function calculateProgression(
  currentLevel: number,
  m: ProgressionInput,
  prevConsolidated: number,
  maxLevel: number = 10,
): ProgressionResult {
  const lvl = Math.min(maxLevel, Math.max(1, Math.round(currentLevel)));
  const pct = (v: number) => Math.round(v * 100);
  const dimsOk = !m.dims || m.dims.every((d) => d >= 0.80);

  const consolidatedLevel = (m.accTotal >= 0.80 && dimsOk)
    ? Math.max(prevConsolidated, lvl)
    : prevConsolidated;

  let nextLevel = lvl;
  let action: "increase" | "maintain" | "decrease" = "maintain";
  let reason: string;

  if (m.accTotal < 0.45) {
    nextLevel = Math.max(1, lvl - 2);
    action = "decrease";
    reason = `Desempenho muito baixo (${pct(m.accTotal)}%). Reduz 2 níveis.`;
  } else if (m.accTotal < 0.65) {
    nextLevel = Math.max(1, lvl - 1);
    action = "decrease";
    reason = `Total abaixo de 65% (${pct(m.accTotal)}%). Reduz 1 nível.`;
  } else if (m.accTotal >= 0.85 && dimsOk && !m.impulsive && lvl < maxLevel) {
    nextLevel = Math.min(maxLevel, lvl + 1);
    action = "increase";
    reason = `Desempenho ≥85% e tudo consolidado. Sobe 1 nível.`;
  } else {
    reason = !dimsOk
      ? `Mantém o nível — uma das partes (item ou ordem) ainda não consolidou.`
      : m.impulsive
      ? `Mantém o nível — muitos erros por impulsividade/omissão.`
      : `Mantém o nível (${pct(m.accTotal)}%).`;
  }

  return { nextLevel, action, consolidatedLevel, reason };
}

// ── Focus Agentes: progressão por MODO (níveis 1-5 + desbloqueios 6-9) ──────────
// ≥80% sobe um nível; <55% desce; senão mantém. Do 5 em diante (≥80%) abre os
// desbloqueios (6 exceção · 7 sequência · 8 condicional · 9 ignorar distração).
// ── Focus Agentes: tempo-alvo de DETECÇÃO por nível (calibração VP+atenção, 16/jul) ──
// Régua "padrão" aprovada pela Kamylla: nível 1 = 3,5s → nível 10 = 1,5s, medida
// do momento em que o alvo aparece até o toque. Compartilhada entre a Chuva
// (progressão intra-sessão, no cliente) e a arena (progressão entre sessões, aqui).
const FOCUS_DETECT_TARGET_MS = [3500, 3300, 3050, 2800, 2600, 2400, 2200, 2000, 1750, 1500];
export function focusDetectTargetMs(level: number): number {
  const i = Math.min(10, Math.max(1, Math.round(level))) - 1;
  return FOCUS_DETECT_TARGET_MS[i];
}

export function calculateFocusProgression(
  level: number,
  accuracy: number,
  /** Detecção mediana da sessão (ms, do alvo aparecer ao toque). null/ausente = sem dado (não trava). */
  detectMedianMs?: number | null,
): { nextLevel: number; action: "increase" | "maintain" | "decrease"; reason: string } {
  const lvl = Math.min(9, Math.max(1, Math.round(level)));
  const pct = Math.round(accuracy * 100);
  if (accuracy >= 0.80 && lvl < 9) {
    // CRITÉRIO DUPLO (VP + atenção): precisão sobe de nível só com ritmo dentro
    // do tempo-alvo do nível — preciso porém lento mantém (treina velocidade).
    const target = focusDetectTargetMs(lvl);
    if (typeof detectMedianMs === "number" && detectMedianMs > target) {
      return { nextLevel: lvl, action: "maintain", reason: `${pct}% de acerto, mas detecção mediana de ${(detectMedianMs / 1000).toFixed(1)}s (alvo do nível: ${(target / 1000).toFixed(1)}s) — mantém o nível ${lvl} para ganhar velocidade.` };
    }
    return { nextLevel: lvl + 1, action: "increase", reason: `${pct}% — sobe para o nível ${lvl + 1}${lvl + 1 >= 6 ? " (desbloqueio)" : ""}.` };
  }
  if (accuracy < 0.55 && lvl > 1) return { nextLevel: lvl - 1, action: "decrease", reason: `${pct}% — desce para o nível ${lvl - 1}.` };
  return { nextLevel: lvl, action: "maintain", reason: `Mantém o nível ${lvl} (${pct}%).` };
}

// ── Trilha da "Ordem da História" ────────────────────────────────────────────────
// Estágios (em currentDifficulty): 1-10 = ordenar (fácil→muito difícil);
// 11 = Encontre o Intruso; 12 = Descubra o que falta.
// Regra da Kamylla: libera o próximo desafio com ≥80% de acerto; regride se errar muito.
export function calculateStoryTrailProgression(
  currentLevel: number,
  m: ProgressionInput,
  prevConsolidated: number,
): ProgressionResult {
  const lvl = Math.min(12, Math.max(1, Math.round(currentLevel)));
  const acc = m.accTotal;
  const pct = (v: number) => Math.round(v * 100);
  const consolidatedLevel = acc >= 0.80 ? Math.max(prevConsolidated, lvl) : prevConsolidated;

  let nextLevel = lvl;
  let action: "increase" | "maintain" | "decrease" = "maintain";
  let reason: string;

  if (lvl <= 9) {
    // Ordenar (antes do topo): regra padrão de subir/manter/descer.
    if (acc < 0.45) { nextLevel = Math.max(1, lvl - 2); action = "decrease"; reason = `Desempenho muito baixo (${pct(acc)}%). Reduz 2 níveis.`; }
    else if (acc < 0.65) { nextLevel = Math.max(1, lvl - 1); action = "decrease"; reason = `Abaixo de 65% (${pct(acc)}%). Reduz 1 nível.`; }
    else if (acc >= 0.85) { nextLevel = lvl + 1; action = "increase"; reason = `≥85%. Sobe 1 nível.`; }
    else reason = `Mantém o nível (${pct(acc)}%).`;
  } else if (lvl === 10) {
    // Muito difícil (topo do ordenar) → desbloqueia o Intruso com ≥80%.
    if (acc < 0.45) { nextLevel = 8; action = "decrease"; reason = `Desempenho muito baixo (${pct(acc)}%). Volta para difícil.`; }
    else if (acc < 0.65) { nextLevel = 9; action = "decrease"; reason = `Abaixo de 65% (${pct(acc)}%). Reduz 1 nível.`; }
    else if (acc >= 0.80) { nextLevel = 11; action = "increase"; reason = `≥80% no muito difícil! Desbloqueia o Encontre o Intruso.`; }
    else reason = `Quase lá (${pct(acc)}%). Precisa de 80% para desbloquear o desafio.`;
  } else if (lvl === 11) {
    // Encontre o Intruso → desbloqueia o Descubra com ≥80%; volta a ordenar se errar muito.
    if (acc < 0.45) { nextLevel = 10; action = "decrease"; reason = `Muitos erros no Intruso (${pct(acc)}%). Volta para a ordem da história.`; }
    else if (acc >= 0.80) { nextLevel = 12; action = "increase"; reason = `≥80% no Intruso! Desbloqueia o Descubra o que falta.`; }
    else reason = `Continua no Intruso (${pct(acc)}%). Precisa de 80% para avançar.`;
  } else {
    // lvl === 12: Descubra o que falta (topo). Regride para o Intruso se errar muito.
    if (acc < 0.45) { nextLevel = 11; action = "decrease"; reason = `Muitos erros no Descubra (${pct(acc)}%). Volta para o Intruso.`; }
    else reason = `No último desafio da trilha (${pct(acc)}%).`;
  }

  return { nextLevel, action, consolidatedLevel, reason };
}

export function calculateDualTaskProgression(
  currentLevel: number,
  m: DualTaskMetrics,
  prevConsolidated: number,
): DualTaskProgression {
  const lvl = Math.min(10, Math.max(1, Math.round(currentLevel)));
  const pct = (v: number) => Math.round(v * 100);

  // Nível consolidado: só conta se as duas tarefas E o total ficaram ≥ 80%.
  const consolidatedLevel = (m.accTop >= 0.80 && m.accBottom >= 0.80 && m.accTotal >= 0.80)
    ? Math.max(prevConsolidated, lvl)
    : prevConsolidated;

  // Erros impulsivos (falsos positivos) ou desatentos (omissões) em excesso travam a subida.
  const tooImpulsive = m.fpTop > 5 || m.fpBottom > 5;
  const tooInattentive = m.omTop > 6 || m.omBottom > 6;

  let nextLevel = lvl;
  let action: "increase" | "maintain" | "decrease" = "maintain";
  let reason: string;

  if (m.accTotal < 0.45) {
    nextLevel = Math.max(1, lvl - 2);
    action = "decrease";
    reason = `Desempenho muito baixo (${pct(m.accTotal)}%). Reduz 2 níveis.`;
  } else if (m.accTotal < 0.65) {
    nextLevel = Math.max(1, lvl - 1);
    action = "decrease";
    reason = `Total abaixo de 65% (${pct(m.accTotal)}%). Reduz 1 nível.`;
  } else if (
    m.accTop >= 0.80 && m.accBottom >= 0.80 && m.accTotal >= 0.85 &&
    !tooImpulsive && !tooInattentive && lvl < 10
  ) {
    nextLevel = Math.min(10, lvl + 1);
    action = "increase";
    reason = `As duas tarefas ≥80% e total ≥85% (cima ${pct(m.accTop)}%, baixo ${pct(m.accBottom)}%). Sobe 1 nível.`;
  } else {
    const weak = m.accTop < 0.80 ? "a tarefa visual" : m.accBottom < 0.80 ? "a tarefa numérica"
      : tooImpulsive ? "o controle de impulsos (muitos toques errados)"
      : tooInattentive ? "a atenção (muitas omissões)" : "o total";
    reason = `Mantém o nível — ${weak} ainda não consolidou (cima ${pct(m.accTop)}%, baixo ${pct(m.accBottom)}%).`;
  }

  return { nextLevel, action, consolidatedLevel, reason };
}

/**
 * Check achievements based on session history
 */
export function checkAchievements(
  sessions: SessionData[],
  currentAchievementTypes: string[]
): Array<{ type: string; title: string; description: string; icon: string }> {
  const newAchievements: Array<{ type: string; title: string; description: string; icon: string }> = [];

  const achievements = [
    {
      type: "FIRST_SESSION",
      title: "Primeira Sessão!",
      description: "Completou sua primeira sessão de treinamento",
      icon: "🌟",
      condition: (s: SessionData[]) => s.length >= 1,
    },
    {
      type: "STREAK_3",
      title: "3 Dias Seguidos",
      description: "Treinou 3 dias consecutivos",
      icon: "🔥",
      condition: (s: SessionData[]) => hasConsecutiveDays(s, 3),
    },
    {
      type: "STREAK_7",
      title: "Uma Semana!",
      description: "Treinou 7 dias consecutivos",
      icon: "💫",
      condition: (s: SessionData[]) => hasConsecutiveDays(s, 7),
    },
    {
      type: "SESSIONS_10",
      title: "10 Sessões",
      description: "Completou 10 sessões de treinamento",
      icon: "🏅",
      condition: (s: SessionData[]) => s.length >= 10,
    },
    {
      type: "SESSIONS_50",
      title: "50 Sessões",
      description: "Completou 50 sessões de treinamento",
      icon: "🏆",
      condition: (s: SessionData[]) => s.length >= 50,
    },
    {
      type: "PERFECT_SCORE",
      title: "Pontuação Perfeita",
      description: "Obteve 100% de precisão em uma sessão",
      icon: "⭐",
      condition: (s: SessionData[]) => s.some((session) => session.accuracy >= 1.0),
    },
    {
      type: "HIGH_PERFORMER",
      title: "Alto Desempenho",
      description: "Média acima de 80 pontos em 5 sessões seguidas",
      icon: "🚀",
      condition: (s: SessionData[]) => {
        const last5 = s.slice(-5);
        return last5.length >= 5 && last5.every((session) => session.score >= 80);
      },
    },
  ];

  for (const achievement of achievements) {
    if (
      !currentAchievementTypes.includes(achievement.type) &&
      achievement.condition(sessions)
    ) {
      newAchievements.push({
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
      });
    }
  }

  return newAchievements;
}

function hasConsecutiveDays(sessions: SessionData[], days: number): boolean {
  if (sessions.length === 0) return false;

  // en-CA produz "YYYY-MM-DD": ordenável cronologicamente E parseável por new Date().
  // (O formato pt-BR "DD/MM/YYYY" quebrava o sort lexicográfico e gerava Invalid Date → NaN,
  // fazendo as conquistas de streak nunca desbloquearem.)
  const dayStrings = sessions.map((s) => {
    return new Date(s.completedAt).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  });
  const uniqueDays = Array.from(new Set(dayStrings)).sort();

  let consecutive = 1;
  let maxConsecutive = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 1;
    }
  }

  return maxConsecutive >= days;
}
