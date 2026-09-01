import { describe, expect, it } from "vitest";
import { BANCO } from "./banco";
import { validarConfiguracao, type Estado } from "./estado";
import { menorCaminho } from "./minimo";

const LIMITE_CLINICO_POR_FASE = {
  1: 7,
  2: 15,
  3: 15,
  4: 15,
  5: 31,
  6: 45,
} as const;

function hasteComTorreCompleta(estado: Estado, discos: number): number | null {
  const haste = estado.findIndex((pilha) => pilha.length === discos);
  return haste < 0 ? null : haste;
}

function distribuido(estado: Estado): boolean {
  return estado.filter((pilha) => pilha.length > 0).length > 1;
}

describe("BANCO pré-validado", () => {
  it.each(BANCO)("$id: valida estados e recalcula exatamente o mínimo", (problema) => {
    expect(validarConfiguracao(problema.inicial, problema.discos)).toBeNull();
    expect(validarConfiguracao(problema.alvo, problema.discos)).toBeNull();
    expect(problema.inicial).not.toEqual(problema.alvo);

    const recalculado = menorCaminho(problema.inicial, problema.alvo, problema.discos);
    expect(recalculado).not.toBeNull();
    expect(problema.minimo).toBe(recalculado?.minimo);
    expect(problema.minimo).toBeGreaterThan(0);
    expect(problema.minimo).toBeLessThanOrEqual(LIMITE_CLINICO_POR_FASE[problema.fase]);
  });

  it("tem 40 pares distintos, IDs únicos e a distribuição planejada por fase", () => {
    const ids = BANCO.map((problema) => problema.id);
    const pares = BANCO.map((problema) => JSON.stringify([problema.inicial, problema.alvo]));

    expect(new Set(ids).size).toBe(BANCO.length);
    expect(new Set(pares).size).toBe(BANCO.length);
    expect(BANCO).toHaveLength(40);
    expect(Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((fase) => [fase, BANCO.filter((problema) => problema.fase === fase).length])
    )).toEqual({ 1: 1, 2: 6, 3: 8, 4: 8, 5: 9, 6: 8 });
  });

  it("respeita o teto de discos e cobre todas as fases", () => {
    for (const problema of BANCO) {
      expect(problema.discos).toBeGreaterThanOrEqual(3);
      expect(problema.discos).toBeLessThanOrEqual(6);
      if (problema.discos > 5) expect(problema.fase).toBe(6);
      expect(problema.id).toMatch(new RegExp(`^${problema.tipo}${problema.discos}-\\d{2}$`));
    }

    for (const fase of [1, 2, 3, 4, 5, 6] as const) {
      expect(BANCO.some((problema) => problema.fase === fase)).toBe(true);
    }
  });

  it("mantém mais de um tipo em todas as fases descritas como variadas", () => {
    for (const fase of [2, 3, 4, 5, 6] as const) {
      const tipos = new Set(BANCO.filter((problema) => problema.fase === fase).map((problema) => problema.tipo));
      expect(tipos.size).toBeGreaterThan(1);
    }
  });

  it("preserva a geometria declarada dos tipos A a D", () => {
    for (const problema of BANCO) {
      const hasteInicial = hasteComTorreCompleta(problema.inicial, problema.discos);
      const hasteAlvo = hasteComTorreCompleta(problema.alvo, problema.discos);

      if (problema.tipo === "A") {
        expect([hasteInicial, hasteAlvo]).toEqual([0, 2]);
      } else if (problema.tipo === "B") {
        expect(hasteInicial).not.toBeNull();
        expect(hasteAlvo).not.toBeNull();
        expect(hasteInicial).not.toBe(hasteAlvo);
        expect([hasteInicial, hasteAlvo]).not.toEqual([0, 2]);
      } else if (problema.tipo === "C") {
        expect(distribuido(problema.inicial)).toBe(true);
        expect(hasteAlvo).not.toBeNull();
      } else if (problema.tipo === "D") {
        expect(distribuido(problema.alvo)).toBe(true);
      }
    }
  });

  it("usa E somente como papel sequencial sobre uma geometria C ou D", () => {
    const marcados = BANCO.filter((problema) => problema.tipo === "E");
    expect(marcados.length).toBeGreaterThan(0);

    for (const problema of marcados) {
      const geometriaC = distribuido(problema.inicial)
        && hasteComTorreCompleta(problema.alvo, problema.discos) !== null;
      const geometriaD = distribuido(problema.alvo);
      expect(geometriaC || geometriaD).toBe(true);
    }
  });
});
