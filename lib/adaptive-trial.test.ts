import { describe, it, expect } from "vitest";
import { classifyTrial, classifyTapTrial, nextLevelPerTrial } from "./adaptive-trial";

describe("classifyTrial (regra por tentativa — épico Cogmed)", () => {
  it("sequência idêntica é correta", () => {
    expect(classifyTrial([1, 2, 3], [1, 2, 3])).toBe("correta");
    expect(classifyTrial(["a"], ["a"])).toBe("correta");
  });

  it("exatamente 1 item errado é erro leve", () => {
    expect(classifyTrial([1, 2, 3], [1, 9, 3])).toBe("erro-leve");
    expect(classifyTrial([1, 2, 3, 4], [1, 2, 3, 9])).toBe("erro-leve");
  });

  it("troca de dois itens ADJACENTES é erro leve", () => {
    expect(classifyTrial([1, 2, 3, 4], [1, 3, 2, 4])).toBe("erro-leve");
    expect(classifyTrial([5, 6], [6, 5])).toBe("erro-leve");
  });

  it("troca de dois itens NÃO adjacentes é erro grave", () => {
    expect(classifyTrial([1, 2, 3], [3, 2, 1])).toBe("erro-grave");
  });

  it("dois ou mais itens errados (sem ser transposição adjacente) é erro grave", () => {
    expect(classifyTrial([1, 2, 3, 4], [1, 9, 8, 4])).toBe("erro-grave");
    expect(classifyTrial([1, 2, 3], [9, 8, 7])).toBe("erro-grave");
  });

  it("omissão de 1 item no final com o resto certo é erro leve", () => {
    expect(classifyTrial([1, 2, 3], [1, 2])).toBe("erro-leve");
  });

  it("omissão no meio ou de 2+ itens é erro grave", () => {
    expect(classifyTrial([1, 2, 3], [1, 3])).toBe("erro-grave"); // pulou o 2
    expect(classifyTrial([1, 2, 3, 4], [1, 2])).toBe("erro-grave");
    expect(classifyTrial([1, 2], [1, 2, 3])).toBe("erro-grave"); // resposta maior
  });
});

describe("classifyTapTrial (exercícios que cortam no primeiro toque errado)", () => {
  it("acertou tudo é correta", () => expect(classifyTapTrial(4, 4)).toBe("correta"));
  it("errou só o último é erro leve", () => expect(classifyTapTrial(4, 3)).toBe("erro-leve"));
  it("errou antes do último é erro grave", () => {
    expect(classifyTapTrial(4, 2)).toBe("erro-grave");
    expect(classifyTapTrial(4, 0)).toBe("erro-grave");
  });
});

describe("nextLevelPerTrial", () => {
  it("correta sobe 1 (respeitando o teto)", () => {
    expect(nextLevelPerTrial(3, "correta", 1, 9)).toBe(4);
    expect(nextLevelPerTrial(9, "correta", 1, 9)).toBe(9);
  });
  it("erro leve mantém", () => {
    expect(nextLevelPerTrial(3, "erro-leve", 1, 9)).toBe(3);
  });
  it("erro grave desce 1 (respeitando o piso)", () => {
    expect(nextLevelPerTrial(3, "erro-grave", 1, 9)).toBe(2);
    expect(nextLevelPerTrial(1, "erro-grave", 1, 9)).toBe(1);
  });
});
