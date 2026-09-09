import { describe, expect, it } from "vitest";
import {
  elidirVerboRepetido,
  textoDaPistaComposta,
  textoDaRestricao,
  validarTextoPista,
  verificarTextoPista,
  type GramaticaTema,
} from "./gramatica";
import type { Restricao } from "./tipos";

const gramatica: GramaticaTema = {
  categorias: {
    pessoa: {
      sujeito: (valor) => valor,
      predicado: (valor) => `é ${valor}`,
      referencia: (valor) => valor,
    },
    sala: {
      sujeito: (valor) => `Quem usou a sala ${valor}`,
      predicado: (valor) => `usou a sala ${valor}`,
      referencia: (valor) => `a pessoa da sala ${valor}`,
    },
  },
};

describe("gramática das pistas", () => {
  it.each([
    ["Alice  foi à Cardiologia.", "espaço duplo"],
    ["Alice foi à Cardiologia .", "espaço antes de pontuação"],
    ["Alice foi à Cardiologia", "terminar em ponto"],
  ])("rejeita texto inválido: %s", (texto, motivo) => {
    expect(validarTextoPista(texto)).toContain(motivo);
    expect(() => verificarTextoPista(texto)).toThrow(motivo);
  });

  it("aceita uma frase bem formada", () => {
    expect(validarTextoPista("Alice foi à Cardiologia.")).toBeNull();
  });

  it("usa os moldes gerais, inclusive contração e ordem padrão", () => {
    const restricao: Restricao = {
      id: "ordem#1",
      tipo: "T4",
      itemA: { categoria: "pessoa", valor: "Alice" },
      itemB: { categoria: "sala", valor: "Jade" },
    };
    expect(textoDaRestricao(restricao, gramatica, ["8h", "9h"])).toBe(
      "Alice vem antes da pessoa da sala Jade."
    );
  });

  it("monta a pista composta com duas restrições", () => {
    const primeira: Restricao = {
      id: "composta#1",
      tipo: "T2",
      itemA: { categoria: "pessoa", valor: "Alice" },
      itemB: { categoria: "sala", valor: "Jade" },
    };
    const segunda: Restricao = {
      id: "composta#2",
      tipo: "T2",
      itemA: { categoria: "pessoa", valor: "Alice" },
      itemB: { categoria: "pessoa", valor: "Rafa" },
    };
    expect(textoDaPistaComposta(primeira, segunda, gramatica)).toBe(
      "Alice não usou a sala Jade nem é Rafa."
    );
  });
});

describe("elisão do verbo em pista composta — conserto do VP", () => {
  it("elide o verbo, mas preserva artigo e preposição", () => {
    // A primeira versão do VP comia o artigo junto e produzia "nem Espresso".
    expect(elidirVerboRepetido("preparou o Gelado", "preparou o Espresso")).toBe("o Espresso");
    expect(elidirVerboRepetido("ocupou o Ateliê", "ocupou o Mezanino")).toBe("o Mezanino");
    expect(elidirVerboRepetido("foi mediada por Zeca", "foi mediada por Iuri")).toBe("por Iuri");
  });

  it("elide o verbo sozinho quando não há palavra funcional", () => {
    expect(elidirVerboRepetido("é Décio", "é Íris")).toBe("Íris");
  });

  it("não elide nada quando os verbos são diferentes", () => {
    expect(elidirVerboRepetido("é Alice", "foi à Psicologia")).toBe("foi à Psicologia");
    expect(elidirVerboRepetido("foi mediada por Sol", "ocupou o Mezanino")).toBe("ocupou o Mezanino");
  });
});
