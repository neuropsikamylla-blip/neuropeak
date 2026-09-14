import { describe, expect, it } from "vitest";
import { nextLevelPerTrial } from "../adaptive-trial";
import {
  avaliarOrdem,
  resumirSessao,
  tierForLevel,
  vereditoDaHistoria,
  type RegistroHistoria,
} from "./tentativas";

describe("vereditoDaHistoria", () => {
  it.each([
    [{ resolvidaDePrimeira: true, acertoPrimeira: 1 }, "correta"],
    [{ resolvidaDePrimeira: false, acertoPrimeira: 0.5 }, "erro-leve"],
    [{ resolvidaDePrimeira: false, acertoPrimeira: 0.499 }, "erro-grave"],
    [{ resolvidaDePrimeira: false, acertoPrimeira: 1 }, "erro-leve"],
  ] as const)("classifica %o como %s", (registro, esperado) => {
    expect(vereditoDaHistoria(registro)).toBe(esperado);
  });

  it("compõe a escada com a regra adaptativa global", () => {
    const correta = vereditoDaHistoria({ resolvidaDePrimeira: true, acertoPrimeira: 1 });
    const grave = vereditoDaHistoria({ resolvidaDePrimeira: false, acertoPrimeira: 0.25 });
    let level = 1;

    for (let i = 0; i < 3; i++) level = nextLevelPerTrial(level, correta, 1, 10);
    expect(level).toBe(4);
    for (let i = 0; i < 2; i++) level = nextLevelPerTrial(level, grave, 1, 10);
    expect(level).toBe(2);
  });

  it("respeita o teto 10 e o piso 1 mesmo após 30 mudanças", () => {
    let level = 10;
    for (let i = 0; i < 30; i++) level = nextLevelPerTrial(level, "correta", 1, 10);
    expect(level).toBe(10);

    level = 1;
    for (let i = 0; i < 30; i++) level = nextLevelPerTrial(level, "erro-grave", 1, 10);
    expect(level).toBe(1);
  });

  it("sai da faixa fácil após cinco histórias certas partindo do nível 1", () => {
    let level = 1;
    for (let i = 0; i < 5; i++) level = nextLevelPerTrial(level, "correta", 1, 10);

    expect(level).toBe(6);
    expect(tierForLevel(level)).not.toBe("faceis");
  });
});

describe("tierForLevel", () => {
  it.each([
    [1, "faceis"], [2, "faceis"],
    [3, "media"], [5, "media"],
    [6, "dificil"], [8, "dificil"],
    [9, "muito-dificil"], [10, "muito-dificil"],
  ] as const)("mantém o nível %i na faixa %s", (level, tier) => {
    expect(tierForLevel(level)).toBe(tier);
  });
});

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
