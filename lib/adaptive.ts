import type { AdaptiveResult, SessionData } from "@/types";
import { average } from "@/lib/utils";

// Difficulty level definitions per exercise
export const DIFFICULTY_DEFINITIONS: Record<string, Record<number, string>> = {
  "span-numerico": {
    1: "3 dígitos",
    2: "4 dígitos",
    3: "5 dígitos",
    4: "6 dígitos",
    5: "7 dígitos",
    6: "8 dígitos",
    7: "9 dígitos",
    8: "9 dígitos invertidos",
    9: "10 dígitos",
    10: "10 dígitos invertidos",
  },
  "matriz-espacial": {
    1: "Grade 4x4, 3 células",
    2: "Grade 4x4, 4 células",
    3: "Grade 4x4, 5 células",
    4: "Grade 4x4, 6 células",
    5: "Grade 4x4, 7 células",
    6: "Grade 5x5, 5 células",
    7: "Grade 5x5, 6 células",
    8: "Grade 5x5, 7 células",
    9: "Grade 5x5, 8 células",
    10: "Grade 5x5, 9 células",
  },
  "associacao-pares": {
    1: "3 pares",
    2: "4 pares",
    3: "5 pares",
    4: "6 pares",
    5: "7 pares",
    6: "8 pares",
    7: "9 pares",
    8: "10 pares",
    9: "12 pares",
    10: "15 pares",
  },
  "trilha-visual": {
    1: "Números 1-10",
    2: "Números 1-15",
    3: "Números 1-20",
    4: "Números 1-25",
    5: "Números 1-25 com tempo limite",
    6: "Letras A-J",
    7: "Letras A-O",
    8: "Letras A-T",
    9: "Alternado números-letras 1-10",
    10: "Alternado números-letras 1-15",
  },
  "stroop-task": {
    1: "Palavras congruentes, sem limite",
    2: "Palavras incongruentes, sem limite",
    3: "10 itens, 30s",
    4: "15 itens, 30s",
    5: "20 itens, 30s",
    6: "20 itens, 25s",
    7: "25 itens, 25s",
    8: "25 itens, 20s",
    9: "30 itens, 20s",
    10: "30 itens, 15s",
  },
  "vigilancia": {
    1: "1 alvo, ritmo lento",
    2: "1 alvo, ritmo médio",
    3: "1 alvo, ritmo rápido",
    4: "2 alvos, ritmo lento",
    5: "2 alvos, ritmo médio",
    6: "2 alvos, ritmo rápido",
    7: "3 alvos, ritmo médio",
    8: "3 alvos, ritmo rápido",
    9: "Múltiplos alvos, distrações",
    10: "Tarefa dual, múltiplos alvos",
  },
  "tempo-reacao": {
    1: "Estímulo único, previsível",
    2: "Estímulo único, aleatório",
    3: "Estímulo único, com distrações",
    4: "Dois estímulos, escolha",
    5: "Quatro estímulos, escolha",
    6: "Go/No-go básico",
    7: "Go/No-go com distrações",
    8: "Tarefa de compatibilidade S-R",
    9: "RT de escolha complexo",
    10: "Tarefa dual com RT",
  },
  "decisao-rapida": {
    1: "2 categorias, 10 itens",
    2: "2 categorias, 15 itens",
    3: "2 categorias, 20 itens velocidade",
    4: "3 categorias, 15 itens",
    5: "3 categorias, 20 itens",
    6: "4 categorias, 20 itens",
    7: "4 categorias, rápido",
    8: "Categorias ambíguas",
    9: "Múltiplas categorias",
    10: "Categorias com exceções",
  },
  "identificacao-simbolos": {
    1: "3 distratores",
    2: "5 distratores",
    3: "8 distratores",
    4: "10 distratores",
    5: "12 distratores semelhantes",
    6: "15 distratores",
    7: "15 distratores semelhantes",
    8: "20 distratores",
    9: "20 distratores muito semelhantes",
    10: "25 distratores muito semelhantes",
  },
  "torre-hanoi": {
    1: "2 discos",
    2: "3 discos",
    3: "3 discos com limite de tempo",
    4: "4 discos",
    5: "4 discos com limite de tempo",
    6: "5 discos",
    7: "5 discos com limite de tempo",
    8: "6 discos",
    9: "6 discos rápido",
    10: "7 discos",
  },
  "corrida-tempo": {
    1: "12 itens, 25s, 4 alvos",
    2: "12 itens, 23s, 4 alvos",
    3: "12 itens, 20s, 4 alvos",
    4: "12 itens, 20s, 5 alvos",
    5: "16 itens, 20s, 5 alvos",
    6: "16 itens, 18s, 5 alvos",
    7: "16 itens, 15s, 6 alvos",
    8: "16 itens, 14s, 6 alvos",
    9: "16 itens, 13s, 6 alvos",
    10: "16 itens, 12s, 6 alvos",
  },
  "desafio-orcamento": {
    1: "8 produtos, meta: máximo do orçamento",
    2: "8 produtos, meta: máximo",
    3: "8 produtos, meta: máximo",
    4: "10 produtos, meta: faixa de valor",
    5: "10 produtos, meta: faixa de valor",
    6: "10 produtos, meta: faixa estreita",
    7: "12 produtos, meta: valor exato ±R$2",
    8: "12 produtos, meta: valor exato ±R$2",
    9: "12 produtos, meta: valor exato ±R$1",
    10: "12 produtos, meta: valor exato ±R$1",
  },
  "caca-item-barato": {
    1: "3 embalagens, preço/unidade visível",
    2: "3 embalagens, preço/unidade visível",
    3: "3 embalagens, preço/unidade visível",
    4: "4 embalagens, preço/unidade visível",
    5: "4 embalagens, preço/unidade visível",
    6: "4 embalagens, preço/unidade visível",
    7: "4 embalagens, preço oculto — calcule",
    8: "4 embalagens, preço oculto",
    9: "4 embalagens, preço oculto, valores próximos",
    10: "4 embalagens, preço oculto, valores muito próximos",
  },
  "mudanca-regras": {
    1: "8 itens, apenas regra de categoria",
    2: "8 itens, apenas regra de categoria",
    3: "8 itens, apenas regra de categoria",
    4: "10 itens, categoria ou preço",
    5: "10 itens, categoria ou preço",
    6: "10 itens, categoria ou preço",
    7: "12 itens, inclui regra de exclusão",
    8: "12 itens, inclui regra de exclusão",
    9: "12 itens, todas as regras possíveis",
    10: "12 itens, todas as regras, mudança frequente",
  },
  "compra-multifuncional": {
    1: "8 itens, 35s, só orçamento",
    2: "8 itens, 35s, só orçamento",
    3: "8 itens, 35s, só orçamento",
    4: "10 itens, 28s, orçamento + categoria",
    5: "10 itens, 28s, orçamento + categoria",
    6: "10 itens, 28s, orçamento + categoria + mínimo",
    7: "12 itens, 20s, 3 restrições",
    8: "12 itens, 20s, 3 restrições",
    9: "12 itens, 20s, 4 restrições",
    10: "12 itens, 18s, 4 restrições, valores difíceis",
  },
};

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
 * Get difficulty parameters for an exercise at a given level
 */
export function getDifficultyParams(
  exerciseId: string,
  difficulty: number
): Record<string, number | boolean | string> {
  const params: Record<string, Record<number, Record<string, number | boolean | string>>> = {
    "span-numerico": {
      1: { spanLength: 3, reverse: false },
      2: { spanLength: 4, reverse: false },
      3: { spanLength: 5, reverse: false },
      4: { spanLength: 6, reverse: false },
      5: { spanLength: 7, reverse: false },
      6: { spanLength: 8, reverse: false },
      7: { spanLength: 9, reverse: false },
      8: { spanLength: 9, reverse: true },
      9: { spanLength: 10, reverse: false },
      10: { spanLength: 10, reverse: true },
    },
    "matriz-espacial": {
      1: { gridSize: 4, sequenceLength: 3 },
      2: { gridSize: 4, sequenceLength: 4 },
      3: { gridSize: 4, sequenceLength: 5 },
      4: { gridSize: 4, sequenceLength: 6 },
      5: { gridSize: 4, sequenceLength: 7 },
      6: { gridSize: 5, sequenceLength: 5 },
      7: { gridSize: 5, sequenceLength: 6 },
      8: { gridSize: 5, sequenceLength: 7 },
      9: { gridSize: 5, sequenceLength: 8 },
      10: { gridSize: 5, sequenceLength: 9 },
    },
    "stroop-task": {
      1: { count: 10, timeLimit: 0, incongruent: false },
      2: { count: 10, timeLimit: 0, incongruent: true },
      3: { count: 10, timeLimit: 30, incongruent: true },
      4: { count: 15, timeLimit: 30, incongruent: true },
      5: { count: 20, timeLimit: 30, incongruent: true },
      6: { count: 20, timeLimit: 25, incongruent: true },
      7: { count: 25, timeLimit: 25, incongruent: true },
      8: { count: 25, timeLimit: 20, incongruent: true },
      9: { count: 30, timeLimit: 20, incongruent: true },
      10: { count: 30, timeLimit: 15, incongruent: true },
    },
    "torre-hanoi": {
      1: { discs: 2, timeLimit: 0 },
      2: { discs: 3, timeLimit: 0 },
      3: { discs: 3, timeLimit: 120 },
      4: { discs: 4, timeLimit: 0 },
      5: { discs: 4, timeLimit: 180 },
      6: { discs: 5, timeLimit: 0 },
      7: { discs: 5, timeLimit: 300 },
      8: { discs: 6, timeLimit: 0 },
      9: { discs: 6, timeLimit: 420 },
      10: { discs: 7, timeLimit: 0 },
    },
  };

  const exerciseParams = params[exerciseId];
  if (!exerciseParams) {
    return { difficulty };
  }

  return exerciseParams[difficulty] ?? exerciseParams[1];
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

  const dayStrings = sessions.map((s) => {
    return new Date(s.completedAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
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
