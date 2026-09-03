import { describe, expect, it } from "vitest";
import {
  BANCO_GRADE,
  acuraciaDoProblema,
  celulasComValorRepetido,
  chavePosicaoGrade,
  estadoDaAtribuicao,
  mensagemVerificacao,
  paraMarcacaoParcial,
  PROBLEMA_TUTORIAL,
  relacaoJaDeterminada,
  resumirAtribuicoes,
  temSolucaoUnica,
  verificacaoDisponivel,
  type RegistroAtribuicao,
} from "./index";

describe("banco da Grade Dedutiva — Fase 3", () => {
  it("prova com o solver que os três problemas têm solução única", () => {
    expect(BANCO_GRADE).toHaveLength(3);
    expect(BANCO_GRADE.map((puzzle) => [puzzle.id, temSolucaoUnica(puzzle)])).toEqual(
      BANCO_GRADE.map((puzzle) => [puzzle.id, true])
    );
  });
});

describe("regras puras da interface", () => {
  it("detecta as duas células com valor repetido e somente elas", () => {
    const repetidas = celulasComValorRepetido({
      pessoa: ["Ana", "Ana", "Bia", null],
      sala: ["Norte", "Sul", "Leste", "Oeste"],
    });
    expect([...repetidas].sort()).toEqual([
      chavePosicaoGrade("pessoa", 1),
      chavePosicaoGrade("pessoa", 2),
    ].sort());
  });

  it("não inclui categoria, valor nem número de pista na mensagem de verificação", () => {
    const termosProibidos = [
      ...BANCO_GRADE.flatMap((puzzle) => puzzle.categorias.flatMap((categoria) => [categoria.label, ...categoria.valores])),
      ...BANCO_GRADE.flatMap((puzzle) => puzzle.pistas.map((_, indice) => String(indice + 1))),
    ];
    const mensagens = ([1, 2, 3, 4, 5] as const).flatMap((nivel) => [
      mensagemVerificacao(nivel, true),
      mensagemVerificacao(nivel, false),
    ]);
    for (const mensagem of mensagens) {
      for (const termo of termosProibidos) {
        expect(mensagem.toLocaleLowerCase("pt-BR")).not.toContain(termo.toLocaleLowerCase("pt-BR"));
      }
    }
  });

  it("não disponibiliza o botão de verificar nos níveis avançados", () => {
    expect(verificacaoDisponivel(1)).toBe(true);
    expect(verificacaoDisponivel(2)).toBe(true);
    expect(verificacaoDisponivel(3)).toBe(true);
    expect(verificacaoDisponivel(4)).toBe(false);
    expect(verificacaoDisponivel(5)).toBe(false);
  });

  it("consulta o solver para saber se uma relação já foi determinada", () => {
    const semPistas = { ...PROBLEMA_TUTORIAL, pistas: [] };
    const estado = paraMarcacaoParcial({
      apresentador: ["Bruno", "Ana", null],
      projeto: [null, null, null],
      horario: [null, null, null],
    });
    expect(relacaoJaDeterminada(semPistas, estado, "apresentador", "Carla", 3)).toBe(true);
    expect(relacaoJaDeterminada(semPistas, estado, "apresentador", "Carla", 1)).toBe(false);
  });

  it("conta atribuições anteriores à determinação e fecha mantidas mais revisadas", () => {
    const base = (sobrescritas: Partial<RegistroAtribuicao>): RegistroAtribuicao => ({
      categoria: "pessoa",
      valor: "Ana",
      posicao: 1,
      momento: 100,
      valorAnterior: null,
      relacaoJaEstavaLogicamenteDeterminada: false,
      estadoDaAtribuicao: "ainda-em-aberto",
      revisadaDepois: false,
      ...sobrescritas,
    });
    const resumo = resumirAtribuicoes([
      base({ valor: "Ana" }),
      base({ valor: "Bia", posicao: 2, revisadaDepois: true }),
      base({ valor: "Caio", posicao: 3 }),
      base({
        valor: "Davi",
        posicao: 4,
        relacaoJaEstavaLogicamenteDeterminada: true,
        estadoDaAtribuicao: "determinada",
      }),
      base({ valor: "Elis", posicao: 5, estadoDaAtribuicao: "estado-ja-contraditorio" }),
    ]);
    expect(resumo).toEqual({
      atribuicoesAntesDeDeterminacao: 3,
      dessasMantidas: 2,
      dessasRevisadas: 1,
      atribuicoesComEstadoJaContraditorio: 1,
    });
    expect(resumo.dessasMantidas + resumo.dessasRevisadas).toBe(
      resumo.atribuicoesAntesDeDeterminacao
    );
  });
});

describe("consertos do VP sobre a colheita da fase 3", () => {
  it("a atribuição feita sobre um estado já contraditório NÃO conta como 'antes da determinação'", () => {
    // Sem esta separação, quem erra cedo e persiste tem TODAS as atribuições seguintes contadas
    // como exploração, e a fase 6 leria persistência numa contradição como hipótese em aberto.
    const grade = paraMarcacaoParcial({
      apresentador: ["Ana", "Ana", null],
      projeto: [null, null, null],
      horario: [null, null, null],
    });
    expect(estadoDaAtribuicao(PROBLEMA_TUTORIAL, grade, "projeto", "Atlas", 1))
      .toBe("estado-ja-contraditorio");
  });

  it("distingue as três situações da atribuição, não duas", () => {
    const semPistas = { ...PROBLEMA_TUTORIAL, pistas: [] };
    const estado = paraMarcacaoParcial({
      apresentador: ["Bruno", "Ana", null],
      projeto: [null, null, null],
      horario: [null, null, null],
    });
    expect(estadoDaAtribuicao(semPistas, estado, "apresentador", "Carla", 3)).toBe("determinada");
    expect(estadoDaAtribuicao(semPistas, estado, "projeto", "Atlas", 1)).toBe("ainda-em-aberto");
  });

  it("a acurácia não é 1 fixo, e cai com as tentativas de concluir incompatíveis", () => {
    // O defeito que a Torre teve em 31/ago: accuracy alimenta lib/adaptive.ts, e um 1 fixo faria
    // a Grade subir de nível para sempre. Os valores estão calibrados contra os limiares reais:
    // sobe acima de 0,85; desce abaixo de 0,60.
    expect(acuraciaDoProblema(0)).toBe(1);
    expect(acuraciaDoProblema(1)).toBeCloseTo(0.8, 10);
    expect(acuraciaDoProblema(1), "uma tentativa incorreta não pode DESCER de nível")
      .toBeGreaterThan(0.6);
    expect(acuraciaDoProblema(1), "uma tentativa incorreta não pode SUBIR de nível")
      .toBeLessThan(0.85);
    expect(acuraciaDoProblema(3), "três tentativas incorretas descem de nível").toBeLessThan(0.6);
    expect(acuraciaDoProblema(99), "a acurácia nunca fica negativa").toBe(0);
  });
});
