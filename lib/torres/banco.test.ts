import { describe, expect, it } from "vitest";
import { BANCO } from "./banco";
import { validarConfiguracao, type Estado } from "./estado";
import { menorCaminho } from "./minimo";

const FASES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function hasteComTorreCompleta(estado: Estado, discos: number): number | null {
  const hastesComDiscos = estado.filter((pilha) => pilha.length > 0);
  if (hastesComDiscos.length !== 1 || hastesComDiscos[0].length !== discos) return null;
  return estado.findIndex((pilha) => pilha.length === discos);
}

function distribuido(estado: Estado): boolean {
  return estado.filter((pilha) => pilha.length > 0).length > 1;
}

describe("BANCO pré-validado", () => {
  it.each(BANCO)("$id: valida estados distintos e recalcula exatamente o mínimo", (problema) => {
    expect(validarConfiguracao(problema.inicial, problema.discos)).toBeNull();
    expect(validarConfiguracao(problema.alvo, problema.discos)).toBeNull();
    expect(problema.inicial).not.toEqual(problema.alvo);

    const recalculado = menorCaminho(problema.inicial, problema.alvo, problema.discos);
    expect(recalculado).not.toBeNull();
    expect(problema.minimo).toBe(recalculado?.minimo);
    expect(problema.minimo).toBeGreaterThan(0);
  });

  it("tem IDs únicos e toda fase povoada", () => {
    const ids = BANCO.map((problema) => problema.id);
    expect(new Set(ids).size).toBe(BANCO.length);

    // As fases 1 e 2 têm UM problema cada, de propósito: são a porta de entrada, onde se aprende
    // a regra, e repetir o mesmo problema clássico é o que consolida. Da 3 em diante, variedade.
    const porFase = Object.fromEntries(
      FASES.map((fase) => [fase, BANCO.filter((problema) => problema.fase === fase).length])
    );
    expect(porFase[1]).toBe(1);
    expect(porFase[2]).toBe(1);
    for (const fase of [3, 4, 5, 6, 7, 8] as const) {
      expect(porFase[fase]).toBeGreaterThanOrEqual(4);
    }
  });

  it("mantém as fases 1 e 2 estritamente clássicas", () => {
    for (const problema of BANCO.filter((p) => p.fase === 1 || p.fase === 2)) {
      const hasteInicial = hasteComTorreCompleta(problema.inicial, problema.discos);
      const hasteAlvo = hasteComTorreCompleta(problema.alvo, problema.discos);

      // Uma torre completa ocupa uma única haste; assim qualquer estado espalhado falha aqui.
      expect(hasteInicial).not.toBeNull();
      expect(hasteAlvo).not.toBeNull();
      expect(hasteInicial).not.toBe(hasteAlvo);
    }
  });

  it("segue a estrutura progressiva das fases 3, 4 e 5", () => {
    for (const problema of BANCO.filter((p) => p.fase === 3)) {
      expect(hasteComTorreCompleta(problema.inicial, problema.discos)).not.toBeNull();
      expect(hasteComTorreCompleta(problema.alvo, problema.discos)).not.toBeNull();
    }

    for (const problema of BANCO.filter((p) => p.fase === 4)) {
      expect(distribuido(problema.inicial)).toBe(true);
      expect(hasteComTorreCompleta(problema.alvo, problema.discos)).not.toBeNull();
    }

    for (const problema of BANCO.filter((p) => p.fase === 5)) {
      expect(distribuido(problema.inicial)).toBe(true);
      expect(distribuido(problema.alvo)).toBe(true);
    }
  });

  it("nunca usa mais de 5 discos fora da fase 8, nem 7 ou 8 discos", () => {
    for (const problema of BANCO) {
      expect(problema.discos).toBeGreaterThanOrEqual(3);
      expect([7, 8]).not.toContain(problema.discos);
      expect(problema.discos).toBeLessThanOrEqual(6);
      if (problema.discos > 5) expect(problema.fase).toBe(8);
      expect(problema.id).toMatch(new RegExp(`^${problema.tipo}${problema.discos}-\\d{2}$`));
    }
  });

  it("cobre todas as oito fases e mistura tipos nas fases altas", () => {
    for (const fase of FASES) {
      expect(BANCO.some((problema) => problema.fase === fase)).toBe(true);
    }

    for (const fase of [6, 7, 8] as const) {
      const tipos = new Set(BANCO.filter((problema) => problema.fase === fase).map((problema) => problema.tipo));
      expect(tipos.size).toBeGreaterThan(1);
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
