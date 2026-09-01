import { describe, expect, it } from "vitest";
import { deveAvancarDeFase, deveSubirDeNivel, eficiencia, faixaEficiencia } from "./torre-hanoi";

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

describe("deveAvancarDeFase — as fases 1 e 2 são gate de aquisição", () => {
  const limpo = { eficiencia: 1.8, reinicios: 0, invalidos: 0 };

  it("nas fases 1 e 2, eficiência ruim mas não péssima AVANÇA (ela: 'não exigir mínimo')", () => {
    // 1,8 é quase o dobro do mínimo — reprovaria no critério das fases altas, e é exatamente o
    // caso que a instrução dela manda deixar passar na aquisição.
    for (const fase of [1, 2]) expect(deveAvancarDeFase(fase, limpo)).toBe(true);
    expect(deveSubirDeNivel(1.8)).toBe(false); // o critério apertado continua existindo
  });

  it("cada sinal de dificuldade importante, SOZINHO, segura o avanço", () => {
    const sinais = [
      { ...limpo, eficiencia: 2.5 },
      { ...limpo, reinicios: 2 },
      { ...limpo, invalidos: 4 },
    ];
    for (const fase of [1, 2]) {
      for (const d of sinais) expect(deveAvancarDeFase(fase, d)).toBe(false);
    }
    expect(sinais.filter((d) => deveAvancarDeFase(1, d))).toHaveLength(0);
  });

  it("da fase 3 em diante o critério apertado volta a valer", () => {
    for (const fase of [3, 4, 5, 6, 7, 8]) {
      expect(deveAvancarDeFase(fase, limpo)).toBe(false);              // 1,8 não passa
      expect(deveAvancarDeFase(fase, { ...limpo, eficiencia: 1.2 })).toBe(true);
    }
  });

  it("conta quantas fases avançam com o mesmo desempenho mediano", () => {
    // Denuncia quem afrouxar o critério das fases altas por engano: só as duas de aquisição
    // podem passar com 1,8.
    const passam = [1, 2, 3, 4, 5, 6, 7, 8].filter((f) => deveAvancarDeFase(f, limpo));
    expect(passam).toEqual([1, 2]);
  });
});
