// Resumo da trilha "Ordem da História" para o relatório do terapeuta.
// Lê as sessões de ordem-historia (e o metadata) e produz % de acerto, tempo,
// dicas, estágio atual, próximo desafio recomendado, tendência e observações automáticas.

type SessLike = {
  exerciseId: string;
  accuracy: number;
  difficulty: number;
  duration: number;
  completedAt: Date | string;
  metadata?: string | null;
};

type Meta = {
  mode?: "ordem" | "intruso" | "falta";
  endedLevel?: number;
  hintsUsed?: number;
  retries?: number;
  timeToFirstMs?: number | null;
  progressionAction?: "increase" | "maintain" | "decrease";
  abandoned?: boolean;
};

export interface TrailModeStat { n: number; acc: number; hints: number; }
export interface TrailSummary {
  totalSessions: number;         // sessões concluídas
  abandoned: number;             // sessões iniciadas e não concluídas
  stage: number;                 // estágio atual (1-12)
  stageLabel: string;
  recentAccuracy: number;        // 0-1 (até as 5 últimas)
  meanTimeS: number;
  meanFirstMs: number | null;
  hintsTotal: number;
  retriesTotal: number;
  byMode: Record<"ordem" | "intruso" | "falta", TrailModeStat>;
  trend: "subiu" | "manteve" | "regrediu";
  nextChallenge: string;
  observations: string[];
}

function parseMeta(m?: string | null): Meta {
  if (!m) return {};
  try { return JSON.parse(m) as Meta; } catch { return {}; }
}

function stageLabelOf(stage: number): string {
  if (stage >= 12) return "🧩 Descubra o que falta";
  if (stage === 11) return "🔍 Encontre o Intruso";
  if (stage >= 9) return "Ordenar — muito difícil (8 cenas)";
  if (stage >= 6) return "Ordenar — difícil (6 cenas)";
  if (stage >= 3) return "Ordenar — média (5 cenas)";
  return "Ordenar — fácil (4 cenas)";
}

function nextChallengeOf(stage: number): string {
  if (stage >= 12) return "Está no último desafio da trilha (Descubra o que falta).";
  if (stage === 11) return "No Encontre o Intruso — acertar ≥80% libera o Descubra o que falta.";
  if (stage === 10) return "No muito difícil — acertar ≥80% libera o Encontre o Intruso.";
  return "Continuar subindo os níveis de ordenar a história.";
}

export function summarizeStoryTrail(sessions: SessLike[]): TrailSummary | null {
  const all = sessions
    .filter((s) => s.exerciseId === "ordem-historia")
    .map((s) => ({ ...s, meta: parseMeta(s.metadata) }))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  const abandoned = all.filter((r) => r.meta.abandoned === true).length;
  const rows = all.filter((r) => r.meta.abandoned !== true);   // só concluídas contam nas estatísticas
  if (!rows.length) return null;

  const latest = rows[0];
  const stage = latest.meta.endedLevel ?? Math.round(latest.difficulty);

  const recent = rows.slice(0, 5);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const recentAccuracy = mean(recent.map((r) => r.accuracy));
  const meanTimeS = Math.round(mean(recent.map((r) => r.duration)));
  const firsts = rows.map((r) => r.meta.timeToFirstMs).filter((x): x is number => typeof x === "number");
  const meanFirstMs = firsts.length ? Math.round(mean(firsts)) : null;
  const hintsTotal = rows.reduce((a, r) => a + (r.meta.hintsUsed ?? 0), 0);
  const retriesTotal = rows.reduce((a, r) => a + (r.meta.retries ?? 0), 0);

  const byMode: Record<"ordem" | "intruso" | "falta", TrailModeStat> = {
    ordem: { n: 0, acc: 0, hints: 0 }, intruso: { n: 0, acc: 0, hints: 0 }, falta: { n: 0, acc: 0, hints: 0 },
  };
  (["ordem", "intruso", "falta"] as const).forEach((m) => {
    const rs = rows.filter((r) => (r.meta.mode ?? "ordem") === m);
    byMode[m] = { n: rs.length, acc: mean(rs.map((r) => r.accuracy)), hints: rs.reduce((a, r) => a + (r.meta.hintsUsed ?? 0), 0) };
  });

  const action = latest.meta.progressionAction;
  const trend = action === "increase" ? "subiu" : action === "decrease" ? "regrediu" : "manteve";

  // ── Observações automáticas ──
  const obs: string[] = [];
  const { ordem, intruso, falta } = byMode;
  if (ordem.n && intruso.n && ordem.acc >= 0.8 && intruso.acc < 0.65)
    obs.push("Bom desempenho em ordenar a história, mas dificuldade em identificar a imagem intrusa.");
  if (falta.n && falta.hints / falta.n >= 1.5)
    obs.push("Precisou de dicas para perceber a cena que estava faltando.");
  if (meanFirstMs !== null && meanFirstMs < 3000 && recentAccuracy < 0.6)
    obs.push("Respondeu rápido, mas cometeu muitos erros — observar impulsividade.");
  if (meanFirstMs !== null && meanFirstMs > 8000 && recentAccuracy >= 0.8)
    obs.push("Demorou mais para responder, mas manteve boa precisão.");
  if (stage < 12 && recentAccuracy >= 0.8)
    obs.push("Pode avançar para o próximo desbloqueio.");
  else if (recentAccuracy >= 0.5 && recentAccuracy < 0.8)
    obs.push("Recomenda-se repetir este tipo de treino antes de avançar.");
  if (trend === "regrediu")
    obs.push("Teve queda de desempenho e voltou um passo na trilha.");
  if (abandoned >= 2)
    obs.push(`Abandonou ${abandoned} atividades antes de concluir — observar engajamento/cansaço.`);
  if (!obs.length)
    obs.push("Desempenho dentro do esperado para o estágio atual.");

  return {
    totalSessions: rows.length, abandoned, stage, stageLabel: stageLabelOf(stage),
    recentAccuracy, meanTimeS, meanFirstMs, hintsTotal, retriesTotal, byMode, trend,
    nextChallenge: nextChallengeOf(stage), observations: obs,
  };
}
