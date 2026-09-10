import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROBLEMA_TUTORIAL } from "@/lib/grade/banco";
import { gradeRazaoLabel, summarizeGradeDedutiva } from "@/lib/grade-report";
import type { RegistroAtribuicao, RegistroVerificacao } from "@/lib/grade/interacao";
import { agregarSessaoGrade, type RegistroProblemaGrade } from "@/lib/grade/sessao";

const baseSession = {
  exerciseId: "deductive-grid",
  completedAt: "2026-09-10T12:00:00.000Z",
};

function atribuicao(indice: number): RegistroAtribuicao {
  return {
    categoria: "pessoa",
    valor: `Pessoa ${indice}`,
    posicao: indice + 1,
    momento: indice,
    valorAnterior: null,
    relacaoJaEstavaLogicamenteDeterminada: false,
    estadoDaAtribuicao: "ainda-em-aberto",
    revisadaDepois: false,
  };
}

function verificacao(
  indice: number,
  corrigidaDepois = false
): RegistroVerificacao {
  return {
    puzzleId: PROBLEMA_TUTORIAL.id,
    numeroAcao: indice,
    tempoDesdeInicio: indice * 1000,
    ordemVerificacao: indice + 1,
    verificacoesRestantes: 1,
    estado: "inconsistente",
    quantidadeContradicoes: 1,
    corrigidaDepois,
    acoesAteCorrecao: corrigidaDepois ? 1 : null,
    tempoAteCorrecao: corrigidaDepois ? 1000 : null,
  };
}

function problema(
  valores: Partial<RegistroProblemaGrade> = {}
): RegistroProblemaGrade {
  return {
    puzzleId: PROBLEMA_TUTORIAL.id,
    nivel: 1,
    concluido: true,
    atribuicoes: [],
    verificacoes: [],
    eventosPista: [],
    atribuicoesAntesDeDeterminacao: 0,
    dessasMantidas: 0,
    dessasRevisadas: 0,
    atribuicoesComEstadoJaContraditorio: 0,
    latenciaPrimeiraAcao: 0,
    totalAcoes: 0,
    tempoTotal: 0,
    tentativasConcluirIncorretas: 0,
    usosVerificarRaciocinio: 0,
    ...valores,
  };
}

function session(
  problemas: RegistroProblemaGrade[],
  completedAt: string
): typeof baseSession & { metadata: string } {
  return {
    ...baseSession,
    completedAt,
    metadata: JSON.stringify(agregarSessaoGrade(problemas).metadata),
  };
}

describe("resumo da Grade Dedutiva para o relatório", () => {
  it("devolve null sem sessão da Grade e a seção permanece condicional", () => {
    expect(summarizeGradeDedutiva([
      { ...baseSession, exerciseId: "outro-exercicio", metadata: "{}" },
      { ...baseSession, metadata: "conteudo-invalido" },
    ])).toBeNull();

    const route = readFileSync(resolve(process.cwd(), "app/api/reports/route.ts"), "utf8");
    expect(route).toContain("const gradeSection = grade ? [");
    expect(route).toContain("] : [];");
  });

  it("agrega várias sessões e preserva o fechamento entre mantidas e revisadas", () => {
    const antiga = problema({
      concluido: false,
      atribuicoes: [atribuicao(0), atribuicao(1)],
      atribuicoesAntesDeDeterminacao: 1,
      dessasMantidas: 1,
      dessasRevisadas: 0,
      atribuicoesComEstadoJaContraditorio: 1,
      verificacoes: [verificacao(0)],
      eventosPista: [
        { type: "clue_crossed", pistaId: "tutorial-1", momento: 1, timestamp: 1 },
      ],
      tempoTotal: 60_000,
    });
    const recenteA = problema({
      atribuicoes: [atribuicao(0), atribuicao(1), atribuicao(2)],
      atribuicoesAntesDeDeterminacao: 2,
      dessasMantidas: 1,
      dessasRevisadas: 1,
      atribuicoesComEstadoJaContraditorio: 1,
      verificacoes: [verificacao(0, true), verificacao(1)],
      eventosPista: [
        { type: "clue_crossed", pistaId: "tutorial-1", momento: 1, timestamp: 1 },
        { type: "clue_uncrossed", pistaId: "tutorial-1", momento: 2, timestamp: 2 },
      ],
      tempoTotal: 120_000,
    });
    const recenteB = problema({
      atribuicoes: [atribuicao(0), atribuicao(1)],
      atribuicoesAntesDeDeterminacao: 2,
      dessasMantidas: 0,
      dessasRevisadas: 2,
      atribuicoesComEstadoJaContraditorio: 2,
      eventosPista: [
        { type: "clue_crossed", pistaId: "tutorial-2", momento: 1, timestamp: 1 },
        { type: "clue_uncrossed", pistaId: "tutorial-2", momento: 2, timestamp: 2 },
      ],
      tempoTotal: 180_000,
    });

    const summary = summarizeGradeDedutiva([
      session([antiga], "2026-09-01T12:00:00.000Z"),
      session([recenteA, recenteB], "2026-09-10T12:00:00.000Z"),
    ]);

    expect(summary).toMatchObject({
      totalSessions: 2,
      totalProblemas: 3,
      problemasResolvidos: 2,
      totalAtribuicoes: 7,
      atribuicoesAntesDeDeterminacao: 5,
      atribuicoesMantidas: 2,
      atribuicoesRevisadas: 3,
      escolhasComOrganizacaoIncompativel: 4,
      verificacoesUsadas: 3,
      cotaDeVerificacoes: 9,
      verificacoesSeguidasDeCorrecao: 1,
      pistasTrabalhadas: 3,
      totalPistas: 12,
      pistasRetomadas: 2,
      meanTimeS: 120,
      trend: "subiu",
    });
    expect(summary!.atribuicoesMantidas + summary!.atribuicoesRevisadas)
      .toBe(summary!.atribuicoesAntesDeDeterminacao);
  });

  it("mostra travessão em cada razão sem denominador", () => {
    const summary = summarizeGradeDedutiva([session([], baseSession.completedAt)])!;
    const razoes = [
      gradeRazaoLabel(summary.problemasResolvidos, summary.totalProblemas),
      gradeRazaoLabel(summary.atribuicoesAntesDeDeterminacao, summary.totalAtribuicoes),
      gradeRazaoLabel(summary.escolhasComOrganizacaoIncompativel, summary.totalAtribuicoes),
      gradeRazaoLabel(summary.verificacoesUsadas, summary.cotaDeVerificacoes),
      gradeRazaoLabel(summary.pistasTrabalhadas, summary.totalPistas),
    ];

    expect(razoes).toEqual(["—", "—", "—", "—", "—"]);
    expect(JSON.stringify({ razoes, summary })).not.toMatch(/0%|NaN/);
    expect(summary.meanTimeS).toBeNull();
  });

  it("mantém as observações factuais quando nenhum problema é resolvido", () => {
    const atribuicoes = Array.from({ length: 20 }, (_, index) => atribuicao(index));
    const caso = problema({
      concluido: false,
      atribuicoes,
      atribuicoesAntesDeDeterminacao: 20,
      dessasMantidas: 5,
      dessasRevisadas: 15,
      atribuicoesComEstadoJaContraditorio: 20,
      verificacoes: Array.from({ length: 10 }, (_, index) => verificacao(index)),
      eventosPista: Array.from({ length: 8 }, (_, index) => ({
        type: index < 4 ? "clue_crossed" as const : "clue_uncrossed" as const,
        pistaId: `tutorial-${(index % 4) + 1}`,
        momento: index,
        timestamp: index,
      })),
    });
    const summary = summarizeGradeDedutiva([session([caso, caso], baseSession.completedAt)])!;

    expect(summary.observations).toEqual([
      "Resolveu 0 de 2 problemas.",
      "Revisou 30 das 40 escolhas feitas antes de a relação estar determinada.",
      "Manteve 40 escolhas com a organização já incompatível.",
      "Usou 20 verificações; 0 foram seguidas de correção.",
      "Trabalhou 8 pistas; retomou 8 depois.",
      "A proporção de problemas resolvidos manteve-se em relação às próprias sessões anteriores.",
    ]);
  });

  it("não usa os termos vedados no agregador nem na seção do PDF", () => {
    const agregador = readFileSync(resolve(process.cwd(), "lib/grade-report.ts"), "utf8");
    const route = readFileSync(resolve(process.cwd(), "app/api/reports/route.ts"), "utf8");
    const secao = route.slice(route.indexOf("const gradeSection"), route.indexOf("const doc"));
    const termosVedados = new RegExp([
      "impulsividade", "prematur\\w*", "inseguran[cç]a", "ansiedade", "d[eé]ficit",
      "depend[eê]ncia", "precipita[cç][aã]o", "falha", "fraqueza", "prejudicado",
      "pior", "ruim",
    ].join("|"), "i");

    expect(agregador).not.toMatch(termosVedados);
    expect(secao).not.toMatch(termosVedados);
  });

  it("mantém a numeração da nova seção antes das recomendações", () => {
    const route = readFileSync(resolve(process.cwd(), "app/api/reports/route.ts"), "utf8");
    const numeros = route.slice(route.indexOf("let _sec = 5"), route.indexOf("const stagePlain"));
    const conteudo = route.slice(route.indexOf("...trailSection"), route.indexOf("const pdfBuffer"));

    expect(numeros).toMatch(
      /trailNo = trail \? _sec\+\+[\s\S]*focusNo = focus \? _sec\+\+[\s\S]*caminhosNo = caminhos \? _sec\+\+[\s\S]*gradeNo = grade \? _sec\+\+[\s\S]*recNo = _sec/
    );
    expect(conteudo).toMatch(
      /\.\.\.trailSection[\s\S]*\.\.\.focusSection[\s\S]*\.\.\.caminhosSection[\s\S]*\.\.\.gradeSection[\s\S]*\$\{recNo\}\. Recomendações/
    );
  });
});
