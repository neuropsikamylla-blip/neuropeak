import { describe, expect, it } from "vitest";
import { avaliarOrdem, resumirSessao, type RegistroHistoria } from "./tentativas";

describe("avaliarOrdem", () => {
  it("reconhece a ordem perfeita e guarda cada cartão na posição avaliada", () => {
    expect(avaliarOrdem([
      { id: "c0", order: 0 }, { id: "c1", order: 1 },
      { id: "c2", order: 2 }, { id: "c3", order: 3 },
    ])).toEqual({
      corretas: 4,
      total: 4,
      acertos: { c0: 0, c1: 1, c2: 2, c3: 3 },
    });
  });

  it("não marca nenhuma cena em uma ordem totalmente invertida de tamanho par", () => {
    expect(avaliarOrdem([
      { id: "c3", order: 3 }, { id: "c2", order: 2 },
      { id: "c1", order: 1 }, { id: "c0", order: 0 },
    ])).toEqual({ corretas: 0, total: 4, acertos: {} });
  });

  it("conta somente os cartões realmente certos quando há valores de posição repetidos", () => {
    expect(avaliarOrdem([
      { id: "primeiro", order: 0 },
      { id: "repetido", order: 0 },
      { id: "terceiro", order: 2 },
      { id: "outro-repetido", order: 2 },
    ])).toEqual({
      corretas: 2,
      total: 4,
      acertos: { primeiro: 0, terceiro: 2 },
    });
  });
});

describe("resumirSessao", () => {
  it("mantém a nota da primeira confirmação quando a história só é resolvida na terceira", () => {
    expect(resumirSessao([{
      acertoPrimeira: 0.25,
      acertoFinal: 1,
      confirmacoes: 3,
      resolvida: true,
      resolvidaDePrimeira: false,
      movimentos: 5,
    }])).toEqual({
      storiesFirstTryExact: 0,
      storiesSolvedAfter: 1,
      storiesUnsolved: 0,
      accFirstTry: 0.25,
      accFinal: 1,
      confirmationsTotal: 3,
    });
  });

  it("não infla a nota quando todas as quatro histórias acabam resolvidas", () => {
    const registros: RegistroHistoria[] = [0.25, 0.5, 0.75, 1].map((acertoPrimeira, indice) => ({
      acertoPrimeira,
      acertoFinal: 1,
      confirmacoes: indice === 3 ? 1 : 2,
      resolvida: true,
      resolvidaDePrimeira: acertoPrimeira === 1,
      movimentos: indice + 1,
    }));
    const resumo = resumirSessao(registros);

    expect(resumo.accFinal).toBe(1);
    expect(resumo.accFirstTry).toBe(0.625);
    expect(resumo.accFirstTry).toBeLessThan(1);
  });

  it("conta a história abandonada no fim do tempo sem colocá-la nas médias", () => {
    const resumo = resumirSessao([
      { acertoPrimeira: 0.5, acertoFinal: 1, confirmacoes: 2, resolvida: true, resolvidaDePrimeira: false, movimentos: 3 },
      { acertoPrimeira: 0.75, acertoFinal: 0.25, confirmacoes: 4, resolvida: false, resolvidaDePrimeira: false, movimentos: 7 },
    ]);

    expect(resumo.storiesUnsolved).toBe(1);
    expect(resumo.accFirstTry).toBe(0.5);
    expect(resumo.accFinal).toBe(1);
    expect(resumo.confirmationsTotal).toBe(6);
  });

  it("não divide por zero em uma sessão sem história concluída", () => {
    expect(resumirSessao([{
      acertoPrimeira: 0.5,
      acertoFinal: 0.75,
      confirmacoes: 2,
      resolvida: false,
      resolvidaDePrimeira: false,
      movimentos: 4,
    }])).toEqual({
      storiesFirstTryExact: 0,
      storiesSolvedAfter: 0,
      storiesUnsolved: 1,
      accFirstTry: 0,
      accFinal: 0,
      confirmationsTotal: 2,
    });
  });
});
