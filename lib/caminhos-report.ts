// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — resumo para o relatório do terapeuta (spec §18, §19).
//
// Lê as sessões do exerciseId "antes-depois" cujo metadata é do módulo
// "caminhos-meta" (montado no onComplete de CaminhosMeta.tsx: registros +
// indicadores) e produz: corretas/parciais/incorretas, dicas por nível, uso de
// áudio, tempo médio, revisões (acerto após revisão), adaptação após mudança,
// contagem de perseveração, evolução (só contra o próprio histórico) e
// observações FUNCIONAIS automáticas (spec §19 — nada de rótulos genéricos nem
// diagnóstico). Mesmo padrão de integração do lib/focus-report.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CaminhosRegistro,
  CaminhosIndicadores,
  CaminhosModo,
  CaminhosBiblioteca,
} from "@/types/caminhos-meta";

type SessLike = {
  exerciseId: string;
  accuracy: number;
  difficulty: number;
  duration: number;
  completedAt: Date | string;
  metadata?: string | null;
};

/** Shape do metadata gravado pelo CaminhosMeta (onComplete). */
type CaminhosMeta = {
  modulo?: string;
  registros?: CaminhosRegistro[];
  indicadores?: CaminhosIndicadores;
  totalAtividades?: number;
  corretas?: number;
  parciais?: number;
  abandoned?: boolean;
};

const MODO_LABEL: Record<CaminhosModo, string> = {
  ordenar: "Organizar etapas",
  intruso: "Identificar ação desnecessária",
  prioridade: "Escolher prioridades",
  completar: "Completar o plano",
  corrigir: "Corrigir a ordem",
  reorganizar: "Reorganizar após mudança",
  problema: "Resolver imprevisto",
  plano_alternativo: "Plano alternativo",
};
export const caminhosModoLabel = (m: CaminhosModo | null) => (m ? MODO_LABEL[m] : "—");

const BIBLIOTECA_LABEL: Record<CaminhosBiblioteca, string> = {
  criancas: "Crianças",
  adolescentes: "Adolescentes",
  adultos_idosos: "Adultos e idosos",
};
export const caminhosBibliotecaLabel = (b: CaminhosBiblioteca | null) => (b ? BIBLIOTECA_LABEL[b] : "—");

/** Estatística por chave (modo, nível, etc.). */
export interface CaminhosGrupoStat {
  n: number;
  corretas: number;
  parciais: number;
  incorretas: number;
}

export interface CaminhosSummary {
  totalSessions: number;
  /** Atividades executadas (registros) somando todas as sessões recentes. */
  totalAtividades: number;
  // Estados
  corretas: number;
  parciais: number;
  incorretas: number;
  /** Proporção corretas ÷ atividades (0-1). */
  taxaCorretas: number;
  // Suporte
  dicasTotal: number;
  /** Contagem de atividades por maior nível de dica acionado (1, 2, 3). */
  dicasPorNivel: { 1: number; 2: number; 3: number };
  /** Atividades que usaram áudio. */
  usouAudio: number;
  // Tempo
  meanTimeS: number;
  // Revisão / adaptação
  revisoes: number;              // acertos após revisão (spec §18)
  naoAcertaramInicio: number;    // base da revisão
  mudancasApresentadas: number;
  adaptouAposMudanca: number;
  /** Média (0-1) de adaptação após mudança = adaptadas ÷ apresentadas. */
  adaptacaoMedia: number;
  perseveracoes: number;         // contagem (spec §18)
  // Desempenho por modo / biblioteca / nível
  byModo: Partial<Record<CaminhosModo, CaminhosGrupoStat>>;
  byBiblioteca: Partial<Record<CaminhosBiblioteca, CaminhosGrupoStat>>;
  // Indicadores agregados (spec §18)
  indicadores: CaminhosIndicadores;
  // Estado da última sessão
  lastModo: CaminhosModo | null;
  lastNivel: number | null;
  // Evolução (só contra o próprio histórico)
  trend: "subiu" | "regrediu" | "manteve";
  observations: string[];
}

function parseMeta(m?: string | null): CaminhosMeta | null {
  if (!m) return null;
  try {
    return JSON.parse(m) as CaminhosMeta;
  } catch {
    return null;
  }
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function statFromRegistros(regs: CaminhosRegistro[]): CaminhosGrupoStat {
  return {
    n: regs.length,
    corretas: regs.filter((r) => r.estado === "correta").length,
    parciais: regs.filter((r) => r.estado === "parcial").length,
    incorretas: regs.filter((r) => r.estado === "incorreta").length,
  };
}

/**
 * Resume as sessões de Caminhos para a Meta (exerciseId "antes-depois").
 * Considera apenas as sessões cujo metadata é do módulo "caminhos-meta"
 * (as antigas de "Sequência Temporal" não têm `registros` e são ignoradas).
 * Últimas N sessões: agrega os registros de todas elas.
 */
export function summarizeCaminhosMeta(sessions: SessLike[]): CaminhosSummary | null {
  const rows = sessions
    .filter((s) => s.exerciseId === "antes-depois")
    .map((s) => ({ ...s, meta: parseMeta(s.metadata) }))
    .filter(
      (s): s is typeof s & { meta: CaminhosMeta } =>
        s.meta != null && s.meta.modulo === "caminhos-meta" && Array.isArray(s.meta.registros)
    )
    .filter((s) => s.meta.abandoned !== true)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (!rows.length) return null;

  const recent = rows.slice(0, 8);
  // Todos os registros das sessões recentes, do mais recente para o mais antigo.
  const registros: CaminhosRegistro[] = recent.flatMap((r) => r.meta.registros ?? []);
  if (!registros.length) return null;

  const total = registros.length;
  const corretas = registros.filter((r) => r.estado === "correta").length;
  const parciais = registros.filter((r) => r.estado === "parcial").length;
  const incorretas = registros.filter((r) => r.estado === "incorreta").length;

  // Dicas por maior nível acionado (spec §16/§18).
  const dicasPorNivel = { 1: 0, 2: 0, 3: 0 };
  for (const r of registros) {
    if (r.nivelDicaMax >= 1) dicasPorNivel[r.nivelDicaMax as 1 | 2 | 3] += 1;
  }
  const dicasTotal = registros.reduce((s, r) => s + r.dicasUsadas, 0);
  const usouAudio = registros.filter((r) => r.usouAudio).length;

  const meanTimeS = Math.round(mean(registros.map((r) => r.tempoTotalSeg)));

  // Revisão (spec §18): acertos após revisão ÷ execuções que não acertaram de início.
  const naoAcertaramInicio = registros.filter((r) => !r.acertoInicial).length;
  const revisoes = registros.filter((r) => r.acertoAposRevisao).length;

  // Adaptação após mudança (spec §18): adaptadas ÷ apresentadas.
  const mudancasApresentadas = registros.filter((r) => r.mudancaApresentada).length;
  const adaptouAposMudanca = registros.filter(
    (r) => r.mudancaApresentada && r.adaptouAposMudanca
  ).length;
  const adaptacaoMedia = mudancasApresentadas > 0 ? adaptouAposMudanca / mudancasApresentadas : 0;

  const perseveracoes = registros.filter((r) => r.persistiuEstrategiaAnterior).length;

  // Desempenho por modo e por biblioteca.
  const byModo: Partial<Record<CaminhosModo, CaminhosGrupoStat>> = {};
  const modos = Array.from(new Set(registros.map((r) => r.modo)));
  for (const m of modos) byModo[m] = statFromRegistros(registros.filter((r) => r.modo === m));

  const byBiblioteca: Partial<Record<CaminhosBiblioteca, CaminhosGrupoStat>> = {};
  const bibs = Array.from(new Set(registros.map((r) => r.biblioteca)));
  for (const b of bibs) byBiblioteca[b] = statFromRegistros(registros.filter((r) => r.biblioteca === b));

  // Indicadores agregados (reaproveita a mesma agregação da spec §18).
  const indicadores = indicadoresFromRegistros(registros);

  const lastReg = registros[0];
  const lastModo = lastReg?.modo ?? null;
  const lastNivel = lastReg?.nivel ?? null;

  // Evolução: compara só com o próprio histórico (acerto médio recente × anterior).
  const trend = evolucao(recent);

  const taxaCorretas = total > 0 ? corretas / total : 0;

  const summary: Omit<CaminhosSummary, "observations"> = {
    totalSessions: rows.length,
    totalAtividades: total,
    corretas,
    parciais,
    incorretas,
    taxaCorretas,
    dicasTotal,
    dicasPorNivel,
    usouAudio,
    meanTimeS,
    revisoes,
    naoAcertaramInicio,
    mudancasApresentadas,
    adaptouAposMudanca,
    adaptacaoMedia,
    perseveracoes,
    byModo,
    byBiblioteca,
    indicadores,
    lastModo,
    lastNivel,
    trend,
  };

  return { ...summary, observations: observacoesFuncionais(summary) };
}

/**
 * Agrega os 8 indicadores (spec §18) a partir de registros. Duplica a lógica de
 * lib/caminhos-meta#indicadoresDe para evitar acoplar o relatório ao motor de
 * correção (SessLike puro), mantendo o mesmo cálculo.
 */
function indicadoresFromRegistros(registros: CaminhosRegistro[]): CaminhosIndicadores {
  const total = registros.length;
  const div = (num: number, den: number) => (den > 0 ? num / den : 0);

  const concluidas = registros.filter((r) => r.concluida);
  const organizacao = div(concluidas.filter((r) => r.estado === "correta").length, concluidas.length);

  const respeitadas = registros.reduce((s, r) => s + r.relacoesRespeitadas, 0);
  const violadas = registros.reduce((s, r) => s + r.relacoesVioladas, 0);
  const sequenciamento = div(respeitadas, respeitadas + violadas);

  const prioReg = registros.filter((r) => r.modo === "prioridade");
  const baseP = prioReg.length > 0 ? prioReg : registros;
  const obr = baseP.reduce((s, r) => s + r.obrigatoriasSelecionadas, 0);
  const opc = baseP.reduce((s, r) => s + r.opcionaisSelecionadas, 0);
  const priorizacao = div(obr, obr + opc);

  const desc = registros.reduce((s, r) => s + r.desnecessariasDescartadas, 0);
  const incl = registros.reduce((s, r) => s + r.desnecessariasIncluidas, 0);
  const identificacaoIrrelevantes = div(desc, desc + incl);

  const apresentados = registros.filter((r) => r.mudancaApresentada).length;
  const resolvidos = registros.filter((r) => r.problemaResolvido).length;
  const resolucaoProblemas = div(resolvidos, apresentados);

  const adaptadas = registros.filter((r) => r.mudancaApresentada && r.adaptouAposMudanca).length;
  const adaptacaoAposMudanca = div(adaptadas, apresentados);

  const usaramSuporte = registros.filter((r) => r.dicasUsadas > 0 || r.usouAudio).length;
  const usoSuporte = div(usaramSuporte, total);

  const naoAcertaramInicio = registros.filter((r) => !r.acertoInicial);
  const revisouEacertou = naoAcertaramInicio.filter((r) => r.acertoAposRevisao).length;
  const revisaoResposta = div(revisouEacertou, naoAcertaramInicio.length);

  const persistenciaEstrategiaAnterior = registros.filter((r) => r.persistiuEstrategiaAnterior).length;

  return {
    organizacao,
    sequenciamento,
    priorizacao,
    identificacaoIrrelevantes,
    resolucaoProblemas,
    adaptacaoAposMudanca,
    usoSuporte,
    revisaoResposta,
    persistenciaEstrategiaAnterior,
    totalRegistros: total,
  };
}

/** Acerto ponderado de uma sessão (correta=1, parcial=0.5). */
function acertoSessao(regs: CaminhosRegistro[]): number {
  if (!regs.length) return 0;
  const c = regs.filter((r) => r.estado === "correta").length;
  const p = regs.filter((r) => r.estado === "parcial").length;
  return (c + p * 0.5) / regs.length;
}

/** Evolução: metade recente × metade anterior das sessões (só o próprio histórico). */
function evolucao(recent: { meta: CaminhosMeta }[]): "subiu" | "regrediu" | "manteve" {
  const acertos = recent
    .map((r) => acertoSessao(r.meta.registros ?? []))
    .filter((_, i) => (recent[i].meta.registros?.length ?? 0) > 0);
  if (acertos.length < 2) return "manteve";
  const metade = Math.max(1, Math.floor(acertos.length / 2));
  const recentes = acertos.slice(0, metade); // mais novas (ordenadas desc)
  const anteriores = acertos.slice(metade);
  const delta = mean(recentes) - mean(anteriores);
  if (delta > 0.1) return "subiu";
  if (delta < -0.1) return "regrediu";
  return "manteve";
}

/**
 * Observações FUNCIONAIS automáticas (spec §19). Descrições do que a pessoa fez;
 * PROIBIDO fraco/incapaz/ruim/abaixo do normal; nada de diagnóstico.
 */
function observacoesFuncionais(s: Omit<CaminhosSummary, "observations">): string[] {
  const obs: string[] = [];

  // Suporte: realizou com dica geral × dica direta (maior nível predominante).
  const semDica = s.totalAtividades - (s.dicasPorNivel[1] + s.dicasPorNivel[2] + s.dicasPorNivel[3]);
  if (semDica === s.totalAtividades && s.totalAtividades > 0) {
    obs.push("Realizou as atividades sem precisar de dicas.");
  } else if (s.dicasPorNivel[3] >= Math.max(1, Math.ceil(s.totalAtividades / 3))) {
    obs.push("Precisou de apoio direto (dica de nível 3) para identificar a ação inicial em parte das atividades.");
  } else if (s.dicasPorNivel[1] > 0 && s.dicasPorNivel[3] === 0) {
    obs.push("Realizou as atividades com apoio de dica geral, sem necessidade de dica direta.");
  }

  // Revisão da própria resposta (spec §18/§19).
  if (s.naoAcertaramInicio > 0 && s.revisoes >= Math.ceil(s.naoAcertaramInicio / 2)) {
    obs.push("Corrigiu o plano após revisão na maioria das vezes em que não acertou de início.");
  }

  // Adaptação após mudança / perseveração (spec §18/§19).
  if (s.mudancasApresentadas > 0) {
    if (s.adaptacaoMedia >= 0.7) {
      obs.push("Conseguiu adaptar o plano após a mudança de contexto.");
    } else if (s.adaptacaoMedia <= 0.4) {
      obs.push("Encontrou dificuldade em adaptar o plano diante das mudanças apresentadas.");
    }
  }
  if (s.perseveracoes >= 1) {
    obs.push(
      `Manteve a estratégia anterior em ${s.perseveracoes} situaç${s.perseveracoes === 1 ? "ão" : "ões"} após a informação de que ela não funcionava mais.`
    );
  }

  // Sequenciamento (respeito às precedências).
  if (s.indicadores.sequenciamento >= 0.85 && s.totalAtividades >= 2) {
    obs.push("Respeitou a ordem necessária entre as etapas na maior parte das atividades.");
  }

  // Identificação de irrelevantes (intrusas).
  const irr = s.indicadores.identificacaoIrrelevantes;
  const teveIntrusas = Object.values(s.byModo).some((v) => v && v.n > 0) &&
    (irr > 0 || s.byModo.intruso != null);
  if (s.byModo.intruso && s.byModo.intruso.n >= 1) {
    if (irr >= 0.7) obs.push("Identificou e deixou de fora as ações que não faziam parte do plano.");
    else if (irr <= 0.4 && teveIntrusas) obs.push("Incluiu no plano ações desnecessárias em parte das atividades.");
  }

  // Uso de áudio.
  if (s.usouAudio >= Math.ceil(s.totalAtividades / 2) && s.totalAtividades > 0) {
    obs.push("Utilizou o recurso de áudio para acompanhar as instruções e os cartões.");
  }

  // Evolução (só contra o próprio histórico).
  if (s.trend === "subiu") obs.push("Evoluiu em relação às próprias sessões anteriores.");
  else if (s.trend === "regrediu") obs.push("Apresentou desempenho abaixo das próprias sessões anteriores neste período.");

  if (!obs.length) obs.push("Desempenho estável em relação às próprias sessões anteriores.");
  return obs;
}
