import { describe, expect, it } from "vitest";
import {
  BANCO_GRADE,
  CONFIGURACAO_VERIFICACOES,
  MENSAGEM_COM_INCOMPATIBILIDADE,
  MENSAGEM_SEM_INCOMPATIBILIDADE,
  acuraciaDoProblema,
  celulasComValorRepetido,
  chavePosicaoGrade,
  consumirVerificacao,
  estadoDaAtribuicao,
  mensagemVerificacao,
  paraMarcacaoParcial,
  PROBLEMA_TUTORIAL,
  registrarCorrecaoDasVerificacoes,
  relacaoJaDeterminada,
  resumirAtribuicoes,
  temSolucaoUnica,
  verificacaoDisponivel,
  verificacoesPermitidas,
  type RegistroAtribuicao,
  type RegistroVerificacao,
} from "./index";

describe("banco da Grade Dedutiva", () => {
  it("prova com o solver que TODO problema do banco tem solução única", () => {
    // Eram 3 na fase 3; hoje são o tutorial mais os 16 do seed bank. A asserção deixou de fixar
    // um número e passou a exigir o tutorial + quatro problemas por nível, de 2 a 5 — assim ela
    // continua valendo quando o banco crescer, sem virar contagem a corrigir a cada entrega.
    expect(BANCO_GRADE.length).toBeGreaterThanOrEqual(17);
    for (const nivel of [2, 3, 4, 5] as const) {
      expect(BANCO_GRADE.filter((puzzle) => puzzle.nivel === nivel).length, `nível ${nivel}`)
        .toBeGreaterThanOrEqual(4);
    }
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

  it("limita verificações por nível, mantém o tutorial livre e aceita configuração zero", () => {
    expect(verificacoesPermitidas(1, false)).toBe(3);
    expect(verificacoesPermitidas(2, false)).toBe(3);
    expect(verificacoesPermitidas(3, false)).toBe(2);
    expect(verificacoesPermitidas(4, false)).toBe(1);
    expect(verificacoesPermitidas(5, false)).toBe(1);
    expect(verificacoesPermitidas(5, true)).toBe("livre");
    expect(verificacoesPermitidas(5, false, {
      ...CONFIGURACAO_VERIFICACOES,
      porNivel: { ...CONFIGURACAO_VERIFICACOES.porNivel, 5: 0 },
    })).toBe(0);
  });

  it("não deixa a contagem negativa e oculta o recurso quando chega a zero", () => {
    expect(consumirVerificacao(1)).toBe(0);
    expect(consumirVerificacao(0)).toBe(0);
    expect(consumirVerificacao("livre")).toBe("livre");
    expect(verificacaoDisponivel(1)).toBe(true);
    expect(verificacaoDisponivel("livre")).toBe(true);
    expect(verificacaoDisponivel(0)).toBe(false);
  });

  it("usa exatamente as duas mensagens genéricas definidas", () => {
    expect(mensagemVerificacao(1, true)).toBe(MENSAGEM_COM_INCOMPATIBILIDADE);
    expect(mensagemVerificacao(5, true)).toBe(
      "Existe uma incompatibilidade na sua organização. Revise suas escolhas."
    );
    expect(mensagemVerificacao(1, false)).toBe(MENSAGEM_SEM_INCOMPATIBILIDADE);
    expect(mensagemVerificacao(5, false)).toBe(
      "Até aqui, sua organização é compatível com as pistas."
    );
  });

  it("registra factual e objetivamente a correção posterior a uma verificação", () => {
    const verificacao: RegistroVerificacao = {
      puzzleId: "puzzle-1",
      numeroAcao: 4,
      tempoDesdeInicio: 1200,
      ordemVerificacao: 1,
      verificacoesRestantes: 2,
      estado: "inconsistente",
      quantidadeContradicoes: 3,
      corrigidaDepois: false,
      acoesAteCorrecao: null,
      tempoAteCorrecao: null,
    };
    expect(registrarCorrecaoDasVerificacoes([verificacao], "puzzle-1", 7, 2100)).toEqual([{
      ...verificacao,
      corrigidaDepois: true,
      acoesAteCorrecao: 3,
      tempoAteCorrecao: 900,
    }]);
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
