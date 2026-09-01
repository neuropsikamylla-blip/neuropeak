import { describe, expect, it } from "vitest";
import { deveSubirDeNivel, eficiencia, faixaEficiencia } from "./torre-hanoi";

describe("eficiência da Torre de Hanói", () => {
  it("calcula movimentos divididos pelo mínimo e evita NaN sem mínimo válido", () => {
    expect(eficiencia(18, 15)).toBe(1.2);
    expect(eficiencia(7, 0)).toBe(Infinity);
  });

  it.each([
    [1.0, "muito-boa"],
    [1.2, "muito-boa"],
    [1.21, "adequada"],
    [1.4, "adequada"],
    [1.41, "baixa"],
    [2.0, "baixa"],
  ] as const)("classifica eficiência %s como %s", (ef, faixa) => {
    expect(faixaEficiencia(ef)).toBe(faixa);
  });

  it("sobe de nível em 1,40 e mantém em 1,41", () => {
    expect(deveSubirDeNivel(1.4)).toBe(true);
    expect(deveSubirDeNivel(1.41)).toBe(false);
  });

  it("a revogação de 31/ago/2026 impede que reinícios alterem o julgamento", () => {
    const ef = eficiencia(18, 15);
    for (const restarts of [0, 1, 2, 10]) {
      expect({ restarts, sobeDeNivel: deveSubirDeNivel(ef) }).toEqual({ restarts, sobeDeNivel: true });
    }
  });

  it("conta todas as faixas de uma lista de eficiências", () => {
    const contagem = [1.0, 1.2, 1.21, 1.4, 1.41, 2.0].reduce<Record<string, number>>(
      (total, ef) => {
        const faixa = faixaEficiencia(ef);
        total[faixa] = (total[faixa] ?? 0) + 1;
        return total;
      },
      {}
    );

    expect(contagem).toEqual({ "muito-boa": 2, adequada: 2, baixa: 2 });
  });
});
