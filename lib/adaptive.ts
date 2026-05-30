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
