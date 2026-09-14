import { describe, expect, it } from "vitest";
import { embaralharCenas, minimoDeTrocas } from "./embaralhar";

function lcg(seed: number): () => number {
  let estado = seed >>> 0;
  return () => {
    estado = (Math.imul(1664525, estado) + 1013904223) >>> 0;
    return estado / 0x100000000;
  };
}

describe("minimoDeTrocas", () => {
  it("conta os ciclos da permutação", () => {
    expect(minimoDeTrocas([0, 1, 2, 3])).toBe(0);
    expect(minimoDeTrocas([1, 0, 2, 3])).toBe(1);
    expect(minimoDeTrocas([1, 2, 0, 3])).toBe(2);
    expect(minimoDeTrocas([3, 2, 1, 0])).toBe(2);
    expect(minimoDeTrocas([1, 2, 3, 0])).toBe(3);
  });
});

describe("embaralharCenas", () => {
  it.each([4, 5, 6, 8])("exige pelo menos duas trocas em 5.000 de 5.000 sorteios para n=%i", (n) => {
    const rng = lcg(20260914 + n);
    let aprovadas = 0;

    for (let i = 0; i < 5_000; i++) {
      if (minimoDeTrocas(embaralharCenas(n, undefined, rng)) >= 2) aprovadas++;
    }

    expect(aprovadas).toBe(5_000);
  });

  it.each([4, 5, 6, 8])("sempre devolve uma permutação completa para n=%i", (n) => {
    const rng = lcg(9142026 + n);
    const esperada = Array.from({ length: n }, (_, i) => i);

    for (let i = 0; i < 5_000; i++) {
      expect([...embaralharCenas(n, undefined, rng)].sort((a, b) => a - b)).toEqual(esperada);
    }
  });

  it("não repete a permutação anterior em 500 sorteios", () => {
    const rng = lcg(14092026);
    let anterior = embaralharCenas(4, undefined, rng);

    for (let i = 0; i < 500; i++) {
      const atual = embaralharCenas(4, anterior, rng);
      expect(atual).not.toEqual(anterior);
      anterior = atual;
    }
  });

  it("altera somente a ordem de apresentação, preservando a identidade das cenas", () => {
    const respostaCorreta = [0, 1, 2, 3, 4, 5];
    const apresentacao = embaralharCenas(respostaCorreta.length, undefined, lcg(42));
    const cards = apresentacao.map((indice) => ({ order: respostaCorreta[indice] }));

    expect(cards.map((card) => card.order).sort((a, b) => a - b)).toEqual(respostaCorreta);
    expect(respostaCorreta).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
