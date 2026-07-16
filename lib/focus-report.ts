// Resumo do Focus Agentes para o relatório do terapeuta (Fase F).
// Lê as sessões de focus-agents (visual) + focus-agents-auditivo e o metadata
// (Fase D) e produz precisão, falsos+, omissões, erro após troca, desempenho
// por modo e por canal, e observações automáticas.

type SessLike = {
  exerciseId: string;
  accuracy: number;
  difficulty: number;
  duration: number;
  completedAt: Date | string;
  metadata?: string | null;
};

type FocusMode = "foco" | "inibicao" | "alternancia" | "desafio";

type Meta = {
  mode?: FocusMode;
  level?: number;
  channel?: "visual" | "auditivo";
  falsePositives?: number;
  omissions?: number;
  timeToFirstMs?: number | null;
  errorsAfterSwitch?: number;
  switchRounds?: number;
  // Tipos de erro agregados (arena, v2.36.0)
  errDetail?: number;
  errImpulse?: number;
  errOmission?: number;
  // Chuva de Agentes: comando com correção + "rever comando" (v2.36.0)
  corrections?: number;
  persevAfterCorrection?: number;
  commandReviews?: number;
};

export interface FocusModeStat { n: number; acc: number; }
export interface FocusSummary {
  totalSessions: number;
  recentAccuracy: number;
  meanTimeS: number;
  meanFirstMs: number | null;
  falsePositives: number;
  omissions: number;
  errorsAfterSwitch: number;
  switchRounds: number;
  /** Erros por tipo: detalhe (confundiu 1 critério) · impulsividade · omissão. */
  errDetail: number;
  errImpulse: number;
  errOmission: number;
  /** Chuva: comandos com correção e perseverações na 1ª instrução. */
  corrections: number;
  persevAfterCorrection: number;
  /** Chuva: quantas vezes usou "rever comando" (dependência da dica). */
  commandReviews: number;
  byMode: Record<FocusMode, FocusModeStat>;
  byChannel: { visual: FocusModeStat; auditivo: FocusModeStat };
  lastMode: FocusMode | null;
  lastLevel: number | null;
  recommendation: string;
  observations: string[];
}

const MODE_LABEL: Record<FocusMode, string> = {
  foco: "Foco", inibicao: "Inibição", alternancia: "Alternância", desafio: "Desafio Executivo",
};
export const focusModeLabel = (m: FocusMode | null) => (m ? MODE_LABEL[m] : "—");

function parseMeta(m?: string | null): Meta {
  if (!m) return {};
  try { return JSON.parse(m) as Meta; } catch { return {}; }
}

export function summarizeFocusAgents(sessions: SessLike[]): FocusSummary | null {
  const rows = sessions
    .filter((s) => s.exerciseId === "focus-agents" || s.exerciseId === "focus-agents-auditivo")
    .map((s) => ({ ...s, meta: parseMeta(s.metadata) }))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  if (!rows.length) return null;

  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const recent = rows.slice(0, 8);
  const recentAccuracy = mean(recent.map((r) => r.accuracy));
  const meanTimeS = Math.round(mean(recent.map((r) => r.duration)));
  const firsts = rows.map((r) => r.meta.timeToFirstMs).filter((x): x is number => typeof x === "number");
  const meanFirstMs = firsts.length ? Math.round(mean(firsts)) : null;
  const falsePositives = rows.reduce((a, r) => a + (r.meta.falsePositives ?? 0), 0);
  const omissions = rows.reduce((a, r) => a + (r.meta.omissions ?? 0), 0);
  const errorsAfterSwitch = rows.reduce((a, r) => a + (r.meta.errorsAfterSwitch ?? 0), 0);
  const switchRounds = rows.reduce((a, r) => a + (r.meta.switchRounds ?? 0), 0);
  const errDetail = rows.reduce((a, r) => a + (r.meta.errDetail ?? 0), 0);
  const errImpulse = rows.reduce((a, r) => a + (r.meta.errImpulse ?? 0), 0);
  const errOmission = rows.reduce((a, r) => a + (r.meta.errOmission ?? 0), 0);
  const corrections = rows.reduce((a, r) => a + (r.meta.corrections ?? 0), 0);
  const persevAfterCorrection = rows.reduce((a, r) => a + (r.meta.persevAfterCorrection ?? 0), 0);
  const commandReviews = rows.reduce((a, r) => a + (r.meta.commandReviews ?? 0), 0);

  const byMode = {} as Record<FocusMode, FocusModeStat>;
  (["foco", "inibicao", "alternancia", "desafio"] as const).forEach((m) => {
    const rs = rows.filter((r) => r.meta.mode === m);
    byMode[m] = { n: rs.length, acc: mean(rs.map((r) => r.accuracy)) };
  });
  const channelOf = (r: typeof rows[number]) => r.meta.channel ?? (r.exerciseId === "focus-agents-auditivo" ? "auditivo" : "visual");
  const vis = rows.filter((r) => channelOf(r) === "visual");
  const aud = rows.filter((r) => channelOf(r) === "auditivo");
  const byChannel = {
    visual: { n: vis.length, acc: mean(vis.map((r) => r.accuracy)) },
    auditivo: { n: aud.length, acc: mean(aud.map((r) => r.accuracy)) },
  };

  const lastMode = rows[0].meta.mode ?? null;
  const lastLevel = rows[0].meta.level ?? Math.round(rows[0].difficulty);

  // ── Observações automáticas ──
  const obs: string[] = [];
  const perSession = (n: number) => n / rows.length;
  if (perSession(falsePositives) >= 2) obs.push("Muitos falsos positivos — sugere resposta impulsiva (tocar antes de conferir a regra).");
  if (perSession(omissions) >= 2.5) obs.push("Muitas omissões — sugere dificuldade de varredura visual ou lentidão.");
  if (meanFirstMs !== null && meanFirstMs > 3500 && recentAccuracy >= 0.75) obs.push("Preciso, mas demorou para iniciar a resposta.");
  if (switchRounds >= 3 && errorsAfterSwitch / Math.max(1, switchRounds) >= 0.4) obs.push("Errou bastante após a troca de regra — possível perseveração (continuou na regra antiga).");
  if (byChannel.visual.n >= 2 && byChannel.auditivo.n >= 2 && byChannel.auditivo.acc + 0.1 < byChannel.visual.acc)
    obs.push("Pior desempenho no canal auditivo do que no visual.");
  if (byMode.foco.n >= 2 && byMode.alternancia.n >= 2 && byMode.foco.acc >= 0.8 && byMode.alternancia.acc < 0.6)
    obs.push("Vai bem em regras estáveis, mas cai quando a regra muda (flexibilidade).");
  // Tipos de erro (quando medidos): aponta o padrão dominante.
  const errTotal = errDetail + errImpulse + errOmission;
  if (errTotal >= 4) {
    if (errDetail / errTotal >= 0.6) obs.push("Erros predominantemente por DETALHE (confundiu por um critério) — vale reforçar a conferência de todos os critérios antes de responder.");
    else if (errImpulse / errTotal >= 0.6) obs.push("Erros predominantemente por IMPULSIVIDADE (resposta sem relação com a regra).");
    else if (errOmission / errTotal >= 0.6) obs.push("Erros predominantemente por OMISSÃO (deixou o alvo passar).");
  }
  if (perSession(commandReviews) >= 2) obs.push("Reviu o comando com frequência durante a busca — apoio de memória ainda necessário.");
  if (corrections >= 3 && persevAfterCorrection / corrections >= 0.4)
    obs.push("Nos comandos com correção, tocou no alvo da PRIMEIRA instrução — dificuldade de descartar a informação antiga.");
  if (!obs.length) obs.push("Desempenho dentro do esperado para o nível atual.");

  // ── Recomendação ──
  let recommendation: string;
  if (recentAccuracy >= 0.8 && perSession(falsePositives) < 1.5) recommendation = "Pode avançar de nível ou de modo.";
  else if (recentAccuracy < 0.55 || perSession(falsePositives) >= 2.5) recommendation = "Recomenda-se reduzir o nível/velocidade antes de aumentar a complexidade.";
  else recommendation = "Recomenda-se manter o treino neste nível antes de avançar.";

  return {
    totalSessions: rows.length, recentAccuracy, meanTimeS, meanFirstMs,
    falsePositives, omissions, errorsAfterSwitch, switchRounds,
    errDetail, errImpulse, errOmission,
    corrections, persevAfterCorrection, commandReviews,
    byMode, byChannel, lastMode, lastLevel, recommendation, observations: obs,
  };
}
