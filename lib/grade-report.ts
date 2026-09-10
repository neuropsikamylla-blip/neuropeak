import { BANCO_GRADE } from "@/lib/grade/banco";
import {
  CONFIGURACAO_VERIFICACOES,
  verificacoesPermitidas,
} from "@/lib/grade/interacao";
import type { MetadataSessaoGrade, RegistroProblemaGrade } from "@/lib/grade/sessao";

type SessLike = {
  exerciseId: string;
  completedAt: Date | string;
  metadata?: string | null;
};

type GradeMeta = MetadataSessaoGrade & { abandoned?: boolean };

export interface GradeSummary {
  totalSessions: number;
  totalProblemas: number;
  problemasResolvidos: number;
  totalAtribuicoes: number;
  atribuicoesAntesDeDeterminacao: number;
  atribuicoesMantidas: number;
  atribuicoesRevisadas: number;
  escolhasComOrganizacaoIncompativel: number;
  verificacoesUsadas: number;
  cotaDeVerificacoes: number | null;
  verificacoesSeguidasDeCorrecao: number;
  pistasTrabalhadas: number;
  totalPistas: number | null;
  pistasRetomadas: number;
  meanTimeS: number | null;
  trend: "subiu" | "manteve" | "regrediu";
  observations: string[];
}

function parseMeta(value?: string | null): GradeMeta | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<GradeMeta>;
    return Array.isArray(parsed.problemas) ? parsed as GradeMeta : null;
  } catch {
    return null;
  }
}

function sum(
  problemas: readonly RegistroProblemaGrade[],
  select: (problema: RegistroProblemaGrade) => number
): number {
  return problemas.reduce((total, problema) => total + select(problema), 0);
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function evolucao(rows: { meta: GradeMeta }[]): GradeSummary["trend"] {
  const taxas = rows
    .filter(({ meta }) => meta.problemas.length > 0)
    .map(({ meta }) => meta.problemasResolvidos / meta.problemas.length);

  if (taxas.length < 2) return "manteve";
  const metade = Math.max(1, Math.floor(taxas.length / 2));
  const delta = mean(taxas.slice(0, metade)) - mean(taxas.slice(metade));
  if (delta > 0.1) return "subiu";
  if (delta < -0.1) return "regrediu";
  return "manteve";
}

function totalDePistas(problemas: readonly RegistroProblemaGrade[]): number | null {
  const porProblema = new Map(BANCO_GRADE.map((problema) => [problema.id, problema.pistas.length]));
  let total = 0;
  for (const problema of problemas) {
    const quantidade = porProblema.get(problema.puzzleId);
    if (quantidade === undefined) return null;
    total += quantidade;
  }
  return total;
}

function cotaDeVerificacoes(problemas: readonly RegistroProblemaGrade[]): number | null {
  let total = 0;
  for (const problema of problemas) {
    const quantidade = verificacoesPermitidas(
      problema.nivel,
      false,
      CONFIGURACAO_VERIFICACOES
    );
    if (quantidade === "livre") return null;
    total += quantidade;
  }
  return total;
}

function plural(quantidade: number, singular: string, pluralForm: string): string {
  return quantidade === 1 ? singular : pluralForm;
}

function observacoesDescritivas(
  summary: Omit<GradeSummary, "observations">
): string[] {
  const observations: string[] = [];
  const movimento = summary.trend === "manteve" ? "manteve-se" : summary.trend;

  if (summary.totalProblemas > 0) {
    observations.push(
      `Resolveu ${summary.problemasResolvidos} de ${summary.totalProblemas} problemas.`
    );
  }
  if (summary.atribuicoesAntesDeDeterminacao > 0) {
    observations.push(
      `Revisou ${summary.atribuicoesRevisadas} das ${summary.atribuicoesAntesDeDeterminacao} escolhas feitas antes de a relação estar determinada.`
    );
  }
  observations.push(
    `Manteve ${summary.escolhasComOrganizacaoIncompativel} ${plural(summary.escolhasComOrganizacaoIncompativel, "escolha", "escolhas")} com a organização já incompatível.`
  );
  observations.push(
    `Usou ${summary.verificacoesUsadas} ${plural(summary.verificacoesUsadas, "verificação", "verificações")}; ${summary.verificacoesSeguidasDeCorrecao} ${plural(summary.verificacoesSeguidasDeCorrecao, "foi seguida", "foram seguidas")} de correção.`
  );
  observations.push(
    `Trabalhou ${summary.pistasTrabalhadas} ${plural(summary.pistasTrabalhadas, "pista", "pistas")}; retomou ${summary.pistasRetomadas} depois.`
  );
  observations.push(
    `A proporção de problemas resolvidos ${movimento} em relação às próprias sessões anteriores.`
  );

  return observations;
}

export function gradeRazaoLabel(numerador: number, denominador: number | null): string {
  return denominador === null || denominador === 0 ? "—" : `${numerador} de ${denominador}`;
}

export function summarizeGradeDedutiva(sessions: SessLike[]): GradeSummary | null {
  const rows = sessions
    .filter((session) => session.exerciseId === "deductive-grid")
    .map((session) => ({ ...session, meta: parseMeta(session.metadata) }))
    .filter(
      (session): session is typeof session & { meta: GradeMeta } => session.meta !== null
    )
    .filter((session) => session.meta.abandoned !== true)
    .sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  if (rows.length === 0) return null;

  const recent = rows.slice(0, 8);
  const problemas = recent.flatMap((session) => session.meta.problemas);
  const verificacoes = problemas.flatMap((problema) => problema.verificacoes);
  const eventosPista = problemas.flatMap((problema) => problema.eventosPista);
  const totalProblemas = problemas.length;
  const totalTempo = sum(problemas, (problema) => problema.tempoTotal);

  const summary: Omit<GradeSummary, "observations"> = {
    totalSessions: rows.length,
    totalProblemas,
    problemasResolvidos: recent.reduce(
      (total, session) => total + session.meta.problemasResolvidos,
      0
    ),
    totalAtribuicoes: sum(problemas, (problema) => problema.atribuicoes.length),
    atribuicoesAntesDeDeterminacao: sum(
      problemas,
      (problema) => problema.atribuicoesAntesDeDeterminacao
    ),
    atribuicoesMantidas: sum(problemas, (problema) => problema.dessasMantidas),
    atribuicoesRevisadas: sum(problemas, (problema) => problema.dessasRevisadas),
    escolhasComOrganizacaoIncompativel: sum(
      problemas,
      (problema) => problema.atribuicoesComEstadoJaContraditorio
    ),
    verificacoesUsadas: verificacoes.length,
    cotaDeVerificacoes: cotaDeVerificacoes(problemas),
    verificacoesSeguidasDeCorrecao: verificacoes.filter(
      (verificacao) => verificacao.estado === "inconsistente" && verificacao.corrigidaDepois
    ).length,
    pistasTrabalhadas: eventosPista.filter((evento) => evento.type === "clue_crossed").length,
    totalPistas: totalDePistas(problemas),
    pistasRetomadas: eventosPista.filter((evento) => evento.type === "clue_uncrossed").length,
    meanTimeS: totalProblemas === 0 ? null : Math.round(totalTempo / totalProblemas / 1000),
    trend: evolucao(recent),
  };

  return { ...summary, observations: observacoesDescritivas(summary) };
}
