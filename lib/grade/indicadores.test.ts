import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROBLEMA_TUTORIAL } from "./banco";
import {
  autonomiaDeMonitoramento,
  calcularIndicadores,
  exploracaoAntesDaDeterminacao,
  metodoDeLeitura,
  persistenciaEmContradicao,
  resolucao,
} from "./indicadores";
import type { RegistroAtribuicao, RegistroVerificacao } from "./interacao";
import type { MetadataSessaoGrade, RegistroProblemaGrade } from "./sessao";

function atribuicao(
  valores: Partial<RegistroAtribuicao> = {}
): RegistroAtribuicao {
  return {
    categoria: "pessoa",
    valor: "Ana",
    posicao: 1,
    momento: 0,
    valorAnterior: null,
    relacaoJaEstavaLogicamenteDeterminada: false,
    estadoDaAtribuicao: "ainda-em-aberto",
    revisadaDepois: false,
    ...valores,
  };
}

function verificacao(
  valores: Partial<RegistroVerificacao> = {}
): RegistroVerificacao {
  return {
    puzzleId: PROBLEMA_TUTORIAL.id,
    numeroAcao: 0,
    tempoDesdeInicio: 0,
    ordemVerificacao: 1,
    verificacoesRestantes: 2,
    estado: "consistente",
    quantidadeContradicoes: 0,
    corrigidaDepois: false,
    acoesAteCorrecao: null,
    tempoAteCorrecao: null,
    ...valores,
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

function metadata(problemas: readonly RegistroProblemaGrade[]): MetadataSessaoGrade {
  return {
    problemas,
    problemasResolvidos: problemas.filter((item) => item.concluido).length,
    tempoTotal: 0,
    atribuicoesAntesDeDeterminacao: problemas.reduce(
      (total, item) => total + item.atribuicoesAntesDeDeterminacao,
      0
    ),
    dessasMantidas: problemas.reduce((total, item) => total + item.dessasMantidas, 0),
    dessasRevisadas: problemas.reduce((total, item) => total + item.dessasRevisadas, 0),
    atribuicoesComEstadoJaContraditorio: problemas.reduce(
      (total, item) => total + item.atribuicoesComEstadoJaContraditorio,
      0
    ),
  };
}

describe("indicadores da sessão da Grade Dedutiva", () => {
  const casoConferivel = metadata([problema({
    atribuicoes: [
      atribuicao(),
      atribuicao({ valor: "Bia", posicao: 2, revisadaDepois: true }),
      atribuicao({ valor: "Caio", posicao: 3, estadoDaAtribuicao: "estado-ja-contraditorio" }),
      atribuicao({
        valor: "Davi",
        posicao: 4,
        relacaoJaEstavaLogicamenteDeterminada: true,
        estadoDaAtribuicao: "determinada",
      }),
    ],
    atribuicoesAntesDeDeterminacao: 2,
    dessasMantidas: 1,
    dessasRevisadas: 1,
    atribuicoesComEstadoJaContraditorio: 1,
    verificacoes: [
      verificacao({ estado: "inconsistente", corrigidaDepois: true }),
      verificacao({ ordemVerificacao: 2, estado: "inconsistente" }),
    ],
    eventosPista: [
      { type: "clue_crossed", pistaId: "tutorial-1", momento: 10, timestamp: 10 },
      { type: "clue_crossed", pistaId: "tutorial-2", momento: 20, timestamp: 20 },
      { type: "clue_uncrossed", pistaId: "tutorial-1", momento: 30, timestamp: 30 },
    ],
  })]);

  it("calcula os cinco indicadores com dados conferíveis", () => {
    expect(resolucao(casoConferivel)).toBe(1);
    expect(exploracaoAntesDaDeterminacao(casoConferivel)).toEqual({
      atribuicoesAntesDeDeterminacaoPorAtribuicoes: 0.5,
      atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: 0.5,
    });
    expect(persistenciaEmContradicao(casoConferivel)).toBe(0.25);
    expect(autonomiaDeMonitoramento(casoConferivel)).toEqual({
      verificacoesUsadasPorCota: 2 / 3,
      verificacoesInconsistentesCorrigidasDepois: 1,
    });
    expect(metodoDeLeitura(casoConferivel)).toEqual({
      pistasRiscadasPorPistasDoProblema: 0.5,
      pistasDesmarcadasDepois: 1,
      ordemDasPistasTrabalhadas: [
        { puzzleId: PROBLEMA_TUTORIAL.id, pistaId: "tutorial-1", ordem: 1, acao: "clue_crossed" },
        { puzzleId: PROBLEMA_TUTORIAL.id, pistaId: "tutorial-2", ordem: 2, acao: "clue_crossed" },
        { puzzleId: PROBLEMA_TUTORIAL.id, pistaId: "tutorial-1", ordem: 3, acao: "clue_uncrossed" },
      ],
    });
  });

  it("devolve null, nunca NaN, para cada razão sem denominador", () => {
    const semProblemas = metadata([]);
    const indicadores = calcularIndicadores(semProblemas);

    expect(indicadores.resolucao).toBeNull();
    expect(indicadores.exploracaoAntesDaDeterminacao.atribuicoesAntesDeDeterminacaoPorAtribuicoes).toBeNull();
    expect(indicadores.exploracaoAntesDaDeterminacao.atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao).toBeNull();
    expect(indicadores.persistenciaEmContradicao).toBeNull();
    expect(indicadores.autonomiaDeMonitoramento.verificacoesUsadasPorCota).toBeNull();
    expect(indicadores.metodoDeLeitura.pistasRiscadasPorPistasDoProblema).toBeNull();
    expect(JSON.stringify(indicadores)).not.toContain("NaN");
  });

  it("mantém indicadores válidos quando nenhum problema foi concluído", () => {
    const semConclusao = metadata([problema({ concluido: false })]);
    const indicadores = calcularIndicadores(semConclusao);

    expect(indicadores.resolucao).toBe(0);
    expect(indicadores.autonomiaDeMonitoramento.verificacoesUsadasPorCota).toBe(0);
    expect(indicadores.metodoDeLeitura.pistasRiscadasPorPistasDoProblema).toBe(0);
  });

  it("distingue atribuições revisadas e mantidas com o mesmo total", () => {
    const base = problema({
      atribuicoes: [atribuicao(), atribuicao({ valor: "Bia", posicao: 2 })],
      atribuicoesAntesDeDeterminacao: 2,
      dessasMantidas: 1,
      dessasRevisadas: 1,
    });
    const outraDistribuicao = problema({
      atribuicoes: base.atribuicoes,
      atribuicoesAntesDeDeterminacao: 2,
      dessasMantidas: 2,
      dessasRevisadas: 0,
    });

    expect(exploracaoAntesDaDeterminacao(metadata([base])))
      .toMatchObject({ atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: 0.5 });
    expect(exploracaoAntesDaDeterminacao(metadata([outraDistribuicao])))
      .toMatchObject({ atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: 0 });
  });

  it("não inclui atribuição feita sobre estado consistente na persistência em contradição", () => {
    const dados = metadata([problema({
      atribuicoes: [
        atribuicao(),
        atribuicao({ valor: "Bia", posicao: 2, estadoDaAtribuicao: "estado-ja-contraditorio" }),
      ],
      atribuicoesComEstadoJaContraditorio: 1,
    })]);

    expect(persistenciaEmContradicao(dados)).toBe(0.5);
  });

  it("devolve null para a cota zero de um nível", () => {
    const semVerificacaoNoNivel = {
      tutorial: "livre" as const,
      porNivel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    expect(autonomiaDeMonitoramento(metadata([problema()]), semVerificacaoNoNivel)
      .verificacoesUsadasPorCota).toBeNull();
  });
});

describe("limites dos indicadores", () => {
  it("não permite termos interpretativos em indicadores.ts", () => {
    const conteudo = readFileSync(resolve(process.cwd(), "lib/grade/indicadores.ts"), "utf8");

    expect(conteudo).not.toMatch(
      /impulsividade|prematur\w*|inseguranca|ansiedade|deficit|dependencia|precipit\w*|falha|fraqueza|prejudicado/i
    );
  });

  it("não importa indicadores nos arquivos que escolhem dificuldade ou problema", () => {
    for (const arquivo of ["lib/adaptive.ts", "lib/grade/banco.ts"]) {
      const conteudo = readFileSync(resolve(process.cwd(), arquivo), "utf8");
      expect(conteudo, arquivo).not.toMatch(/(?:from|import)[^\n]*indicadores|indicadores[^\n]*(?:from|import)/i);
    }
  });
});
