import type { Domain, DomainScore, SessionData } from "@/types";
import { average } from "@/lib/utils";

// Expected reaction times by exercise and difficulty (ms)
const EXPECTED_REACTION_TIMES: Record<string, number> = {
  "tempo-reacao": 500,
  "decisao-rapida": 800,
  "stroop-task": 1200,
  "identificacao-simbolos": 1000,
  "vigilancia": 600,
};

/**
 * Calculate base score for a single exercise attempt
 */
export function calculateExerciseScore(
  exerciseId: string,
  accuracy: number, // 0-1
  reactionTime?: number, // ms, optional
  difficulty: number = 1
): number {
  const baseScore = 100 * accuracy;

  // Speed bonus
  let speedBonus = 1.0;
  if (reactionTime && EXPECTED_REACTION_TIMES[exerciseId]) {
    const expected = EXPECTED_REACTION_TIMES[exerciseId];
    if (reactionTime < expected * 0.8) {
      speedBonus = 1.2;
    } else if (reactionTime > expected * 1.5) {
      speedBonus = 0.9;
    }
  }

  // Difficulty multiplier
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.05;

  const rawScore = baseScore * speedBonus * difficultyMultiplier;

  // Normalize to 0-100
  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Calculate session score from multiple exercises
 */
export function calculateSessionScore(exercises: { score: number; weight?: number }[]): number {
  if (exercises.length === 0) return 0;

  const totalWeight = exercises.reduce((sum, ex) => sum + (ex.weight ?? 1), 0);
  const weightedSum = exercises.reduce(
    (sum, ex) => sum + ex.score * (ex.weight ?? 1),
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Calculate domain score from sessions
 */
export function calculateDomainScore(sessions: SessionData[]): DomainScore[] {
  const domains: Domain[] = ["memory", "attention", "processing", "executive"];
  const result: DomainScore[] = [];

  for (const domain of domains) {
    const domainSessions = sessions.filter((s) => s.domain === domain);
    if (domainSessions.length === 0) {
      result.push({ domain, score: 0, sessions: 0 });
      continue;
    }

    const score = average(domainSessions.map((s) => s.score));
    result.push({
      domain,
      score: Math.round(score),
      sessions: domainSessions.length,
    });
  }

  return result;
}

/**
 * Calculate adherence percentage
 */
export function calculateAdherence(
  sessions: SessionData[],
  expectedFrequency: number, // sessions per week
  startDate: Date
): number {
  // Guard: frequência inválida (<=0) tornaria expectedSessions=0 → divisão por
  // zero → Infinity → 100% de aderência falso. Sem meta, aderência é indefinida → 0.
  if (expectedFrequency <= 0) return 0;

  const now = new Date();
  const weeksElapsed = Math.max(
    1,
    Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const expectedSessions = weeksElapsed * expectedFrequency;
  const actualSessions = sessions.length;

  return Math.min(100, Math.round((actualSessions / expectedSessions) * 100));
}

/**
 * Determine trend based on recent sessions
 */
export function calculateTrend(sessions: SessionData[]): "up" | "down" | "stable" {
  if (sessions.length < 4) return "stable";

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);

  const firstAvg = average(firstHalf.map((s) => s.score));
  const secondAvg = average(secondHalf.map((s) => s.score));

  const diff = secondAvg - firstAvg;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "stable";
}

/**
 * Generate recommendations based on domain scores
 */
export function generateRecommendations(domainScores: DomainScore[]): string {
  const recommendations: string[] = [];

  for (const ds of domainScores) {
    if (ds.sessions === 0) continue;
    if (ds.score < 50) {
      const domainLabels: Record<Domain, string> = {
        memory: "Memória",
        attention: "Atenção",
        processing: "Velocidade de Processamento",
        executive: "Funções Executivas",
        functional: "Desenvolvimento Funcional",
      };
      recommendations.push(
        `Aumentar frequência de exercícios de ${domainLabels[ds.domain]} (pontuação atual: ${ds.score}/100).`
      );
    }
  }

  if (recommendations.length === 0) {
    return "Paciente apresenta desempenho adequado em todos os domínios. Manter plano de treinamento atual e considerar aumento gradual da dificuldade.";
  }

  return recommendations.join(" ");
}
