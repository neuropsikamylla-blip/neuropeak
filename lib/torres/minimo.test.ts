import { describe, expect, it } from "vitest";
import {
  aplicarMovimento,
  movimentosPossiveis,
  posicoesParaEstado,
  type Estado,
} from "./estado";
import { menorCaminho } from "./minimo";

function torre(nDiscos: number, haste: 0 | 1 | 2): Estado {
  return posicoesParaEstado(Array<number>(nDiscos).fill(haste));
}

describe("menorCaminho", () => {
  it.each([
    [1, 1],
    [2, 3],
    [3, 7],
    [4, 15],
    [5, 31],
    [6, 63],
  ])("n=%i: BFS devolve %i = 2^n - 1 e um caminho legal", (nDiscos, esperado) => {
    const inicial = torre(nDiscos, 0);
    const alvo = torre(nDiscos, 2);
    const resultado = menorCaminho(inicial, alvo, nDiscos);

    expect(resultado).not.toBeNull();
    if (resultado === null) throw new Error("A torre clássica deveria ser alcançável.");
    expect(resultado.minimo).toBe(esperado);
    expect(resultado.caminho).toHaveLength(resultado.minimo);

    let atual = inicial;
    for (const movimento of resultado.caminho) {
      expect(movimentosPossiveis(atual)).toContainEqual(movimento);
      atual = aplicarMovimento(atual, movimento.de, movimento.para);
    }
    expect(atual).toEqual(alvo);
  });

  it("é determinística também para configurações intermediárias", () => {
    const inicial = posicoesParaEstado([0, 1, 0, 2]);
    const alvo = posicoesParaEstado([2, 0, 1, 2]);

    expect(menorCaminho(inicial, alvo, 4)).toEqual(menorCaminho(inicial, alvo, 4));
  });

  it("devolve caminho vazio quando o estado já é o alvo", () => {
    const estado = torre(3, 1);
    expect(menorCaminho(estado, estado, 3)).toEqual({ minimo: 0, caminho: [] });
  });

  it("falha alto e identifica qual configuração é inválida", () => {
    const valida = torre(3, 2);
    const invalida: Estado = [[3, 1], [], []];

    expect(() => menorCaminho(invalida, valida, 3)).toThrow(/Configuração inicial inválida.*Discos ausentes: 2/);
    expect(() => menorCaminho(valida, invalida, 3)).toThrow(/Configuração alvo inválida.*Discos ausentes: 2/);
  });
});
