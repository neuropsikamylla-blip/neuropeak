import { describe, expect, it } from "vitest";
import {
  aplicarMovimento,
  estadoParaPosicoes,
  movimentosPossiveis,
  posicoesParaEstado,
  validarConfiguracao,
  type Estado,
} from "./estado";

describe("estado das Torres", () => {
  it("valida três pilhas em ordem da base para o topo", () => {
    expect(validarConfiguracao([[4, 2], [3, 1], []], 4)).toBeNull();
    expect(validarConfiguracao([[3, 2, 1], []], 3)).toMatch(/exatamente 3 hastes/);
    expect(validarConfiguracao([[2, 3, 1], [], []], 3)).toMatch(/Ordem inválida/);
    expect(validarConfiguracao([[3, 2, 1], [1], []], 3)).toMatch(/mais de uma vez/);
    expect(validarConfiguracao([[3, 1], [], []], 3)).toMatch(/Discos ausentes: 2/);
    expect(validarConfiguracao([[4, 2, 1], [], []], 3)).toMatch(/Disco inválido/);
    expect(validarConfiguracao([[], [], []], 0)).toMatch(/inteiro positivo/);
  });

  it("converte sem perda entre pilhas do componente e posições da BFS", () => {
    const estado: Estado = [[3], [4, 2], [1]];
    const posicoes = estadoParaPosicoes(estado, 4);

    expect(posicoes).toEqual([2, 1, 0, 1]);
    expect(posicoesParaEstado(posicoes)).toEqual(estado);
  });

  it("lista somente movimentos legais em ordem determinística", () => {
    const estado: Estado = [[3, 2], [], [1]];

    expect(movimentosPossiveis(estado)).toEqual([
      { disco: 2, de: 0, para: 1 },
      { disco: 1, de: 2, para: 0 },
      { disco: 1, de: 2, para: 1 },
    ]);
  });

  it("aplica um movimento sem mutar o estado original", () => {
    const original: Estado = [[3, 2, 1], [], []];
    const copiaAntes = original.map((pilha) => [...pilha]);

    const proximo = aplicarMovimento(original, 0, 2);

    expect(proximo).toEqual([[3, 2], [], [1]]);
    expect(original).toEqual(copiaAntes);
    expect(proximo).not.toBe(original);
    expect(proximo[0]).not.toBe(original[0]);
  });

  it("rejeita movimentos que violam as regras", () => {
    const estado: Estado = [[3, 2], [], [1]];

    expect(() => aplicarMovimento(estado, 0, 2)).toThrow(/não pode ficar sobre/);
    expect(() => aplicarMovimento(estado, 1, 0)).toThrow(/está vazia/);
    expect(() => aplicarMovimento(estado, 0, 0)).toThrow(/devem ser diferentes/);
    expect(() => aplicarMovimento(estado, -1, 2)).toThrow(/origem inválida/);
    expect(() => aplicarMovimento(estado, 0, 3)).toThrow(/destino inválida/);
  });
});
