import type { Domain, NormativeBenchmark, DomainScore, SessionData } from "@/types";
import { average } from "@/lib/utils";

// Normative benchmarks by age group (0-100 normalized scale)
export const NORMATIVE_BENCHMARKS: NormativeBenchmark[] = [
  {
    ageGroup: "4-11",
    minAge: 4,
    maxAge: 11,
    memory: { mean: 55, sd: 12 },
    attention: { mean: 52, sd: 13 },
    processing: { mean: 48, sd: 14 },
    executive: { mean: 45, sd: 13 },
  },
  {
    ageGroup: "12-17",
    minAge: 12,
    maxAge: 17,
    memory: { mean: 68, sd: 11 },
    attention: { mean: 70, sd: 10 },
    processing: { mean: 65, sd: 12 },
    executive: { mean: 66, sd: 11 },
  },
  {
    ageGroup: "18-59",
    minAge: 18,
    maxAge: 59,
    memory: { mean: 72, sd: 10 },
    attention: { mean: 74, sd: 9 },
    processing: { mean: 71, sd: 11 },
    executive: { mean: 73, sd: 10 },
  },
  {
    ageGroup: "60+",
    minAge: 60,
    maxAge: 120,
    memory: { mean: 58, sd: 13 },
    attention: { mean: 60, sd: 12 },
    processing: { mean: 54, sd: 14 },
    executive: { mean: 57, sd: 13 },
  },
];

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
 * Calculate percentile given a score and normative data
 */
export function calculatePercentile(
  score: number,
  domain: Domain,
  age: number
): number {
  const benchmark = NORMATIVE_BENCHMARKS.find(
    (b) => age >= b.minAge && age <= b.maxAge
  );
  if (!benchmark) return 50;

  const { mean, sd } = benchmark[domain];
  const zScore = (score - mean) / sd;

  // Approximate normal CDF
  return Math.round(normalCDF(zScore) * 100);
}

function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate adherence percentage
 */
export function calculateAdherence(
  sessions: SessionData[],
  expectedFrequency: number, // sessions per week
  startDate: Date
): number {
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
