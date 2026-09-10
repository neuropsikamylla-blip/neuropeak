import { describe, expect, it } from "vitest";
import { PROBLEMAS_GRADE, selecionarProblema } from "./banco";
import { acuraciaDoProblema } from "./interacao";
import {
  DURACAO_SESSAO_GRADE_MS,
  agregarSessaoGrade,
  type RegistroProblemaGrade,
} from "./sessao";

function registro(
  puzzleId: string,
  valores: Partial<RegistroProblemaGrade> = {}
): RegistroProblemaGrade {
  return {
    puzzleId,
    nivel: 2,
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

describe("agregado da sessão da Grade Dedutiva", () => {
  const casos: Array<[
    string,
    RegistroProblemaGrade[],
    { tempo: number; antes: number; mantidas: number; revisadas: number; contraditorio: number },
  ]> = [
    [
      "1 problema",
      [registro("a", {
        tempoTotal: 100,
        atribuicoesAntesDeDeterminacao: 3,
        dessasMantidas: 2,
        dessasRevisadas: 1,
        atribuicoesComEstadoJaContraditorio: 1,
      })],
      { tempo: 100, antes: 3, mantidas: 2, revisadas: 1, contraditorio: 1 },
    ],
    [
      "2 problemas",
      [
        registro("a", { tempoTotal: 100, atribuicoesAntesDeDeterminacao: 3, dessasMantidas: 2, dessasRevisadas: 1 }),
        registro("b", { tempoTotal: 250, atribuicoesAntesDeDeterminacao: 2, dessasMantidas: 1, dessasRevisadas: 1, atribuicoesComEstadoJaContraditorio: 2 }),
      ],
      { tempo: 350, antes: 5, mantidas: 3, revisadas: 2, contraditorio: 2 },
    ],
    [
      "3 problemas",
      [
        registro("a", { tempoTotal: 100, atribuicoesAntesDeDeterminacao: 3, dessasMantidas: 2, dessasRevisadas: 1 }),
        registro("b", { tempoTotal: 250, atribuicoesAntesDeDeterminacao: 2, dessasMantidas: 1, dessasRevisadas: 1, atribuicoesComEstadoJaContraditorio: 2 }),
        registro("c", { tempoTotal: 400, atribuicoesAntesDeDeterminacao: 4, dessasMantidas: 4, dessasRevisadas: 0, atribuicoesComEstadoJaContraditorio: 1 }),
      ],
      { tempo: 750, antes: 9, mantidas: 7, revisadas: 2, contraditorio: 3 },
    ],
  ];

  it.each(casos)("soma corretamente com %s", (_nome, problemas, esperado) => {
    const { metadata } = agregarSessaoGrade(problemas);

    expect(metadata.problemasResolvidos).toBe(problemas.length);
    expect(metadata.tempoTotal).toBe(esperado.tempo);
    expect(metadata.atribuicoesAntesDeDeterminacao).toBe(esperado.antes);
    expect(metadata.dessasMantidas).toBe(esperado.mantidas);
    expect(metadata.dessasRevisadas).toBe(esperado.revisadas);
    expect(metadata.atribuicoesComEstadoJaContraditorio).toBe(esperado.contraditorio);
    expect(metadata.dessasMantidas + metadata.dessasRevisadas)
      .toBe(metadata.atribuicoesAntesDeDeterminacao);
  });

  it("usa a média da acurácia dos problemas concluídos", () => {
    const problemas = [
      registro("a", { tentativasConcluirIncorretas: 0 }),
      registro("b", { tentativasConcluirIncorretas: 1 }),
      registro("c", { tentativasConcluirIncorretas: 3 }),
    ];
    const esperado = (
      acuraciaDoProblema(0) + acuraciaDoProblema(1) + acuraciaDoProblema(3)
    ) / 3;

    expect(agregarSessaoGrade(problemas).acuracia).toBeCloseTo(esperado, 10);
  });

  it("mantém o problema não concluído no registro sem incluí-lo na média", () => {
    const concluido = registro("a", { tentativasConcluirIncorretas: 1 });
    const emAndamento = registro("b", {
      concluido: false,
      tentativasConcluirIncorretas: 99,
    });
    const resultado = agregarSessaoGrade([concluido, emAndamento]);

    expect(resultado.metadata.problemas).toEqual([concluido, emAndamento]);
    expect(resultado.metadata.problemasResolvidos).toBe(1);
    expect(resultado.acuracia).toBe(acuraciaDoProblema(1));
  });

  it("sem problema concluído devolve acurácia zero, nunca NaN ou negativa", () => {
    const resultado = agregarSessaoGrade([
      registro("a", { concluido: false, tentativasConcluirIncorretas: 99 }),
    ]);

    expect(resultado.metadata.problemasResolvidos).toBe(0);
    expect(resultado.acuracia).toBe(0);
    expect(Number.isNaN(resultado.acuracia)).toBe(false);
    expect(resultado.acuracia).toBeGreaterThanOrEqual(0);
  });

  it("grava os indicadores no metadata sem substituir os registros brutos", () => {
    const original = registro("tutorial-feira-cientifica", { concluido: false });
    const resultado = agregarSessaoGrade([original]);

    expect(resultado.metadata.problemas).toEqual([original]);
    expect(resultado.metadata.indicadores).toEqual({
      resolucao: 0,
      exploracaoAntesDaDeterminacao: {
        atribuicoesAntesDeDeterminacaoPorAtribuicoes: null,
        atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: null,
      },
      persistenciaEmContradicao: null,
      autonomiaDeMonitoramento: {
        verificacoesUsadasPorCota: 0,
        verificacoesInconsistentesCorrigidasDepois: 0,
      },
      metodoDeLeitura: {
        pistasRiscadasPorPistasDoProblema: 0,
        pistasDesmarcadasDepois: 0,
        ordemDasPistasTrabalhadas: [],
      },
    });
  });
});

describe("dosagem e sequência da Grade Dedutiva", () => {
  it("exporta a proposta recalibrável de 11 minutos", () => {
    // Padrão da plataforma fechado por ela em 09/set: alvo de 8 min, sem exceção para a Grade.
    expect(DURACAO_SESSAO_GRADE_MS).toBe(8 * 60 * 1000);
  });

  it("seleciona sempre um problema novo enquanto houver um não usado no nível", () => {
    const quantidadeNoNivel = PROBLEMAS_GRADE.filter((problema) => problema.nivel === 2).length;
    const usados: string[] = [];

    for (let indice = 0; indice < quantidadeNoNivel; indice += 1) {
      const proximo = selecionarProblema(1, usados);
      expect(usados).not.toContain(proximo.id);
      usados.push(proximo.id);
    }

    expect(new Set(usados).size).toBe(quantidadeNoNivel);
  });
});
