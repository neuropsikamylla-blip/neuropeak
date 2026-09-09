import { describe, expect, it } from "vitest";
import {
  elidirVerboRepetido,
  textoDaPistaComposta,
  textoDasExclusoes,
  textoDaRestricao,
  validarTextoPista,
  verificarTextoPista,
  type GramaticaTema,
} from "./gramatica";
import type { Restricao } from "./tipos";

const gramatica: GramaticaTema = {
  categorias: {
    pessoa: {
      animado: true,
      sujeito: (valor) => valor,
      predicado: (valor) => `é ${valor}`,
      referencia: (valor) => valor,
    },
    sala: {
      animado: false,
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

  it("monta uma fusão de três exclusões com as vírgulas corretas", () => {
    const restricoes: Restricao[] = ["Jade", "Coral", "Âmbar"].map((valor, indice) => ({
      id: `tripla#${indice + 1}`,
      tipo: "T2" as const,
      itemA: { categoria: "pessoa", valor: "Alice" },
      itemB: { categoria: "sala", valor },
    }));
    expect(textoDasExclusoes(restricoes, gramatica)).toBe(
      "Alice não usou a sala Jade, nem Coral, nem Âmbar."
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

describe("elisão: artigo fica, substantivo já dito cai — regra conferida pelo VP", () => {
  it("devolve o ARTIGO, que faz parte do nome do item", () => {
    expect(elidirVerboRepetido("preparou o Gelado", "preparou o Espresso")).toBe("o Espresso");
    expect(elidirVerboRepetido("ocupou o Ateliê", "ocupou o Mezanino")).toBe("o Mezanino");
  });

  it("devolve a PREPOSIÇÃO, que rege o nome", () => {
    expect(elidirVerboRepetido("foi mediada por Zeca", "foi mediada por Iuri")).toBe("por Iuri");
  });

  it("mas deixa cair o SUBSTANTIVO já dito na primeira parte", () => {
    // "não usou a sala Jade, nem Coral" — repetir "a sala" em cada item emperra a leitura.
    expect(elidirVerboRepetido("usou a sala Jade", "usou a sala Coral")).toBe("Coral");
    expect(elidirVerboRepetido("representou o país Irlanda", "representou o país Egito")).toBe("Egito");
  });

  it("e elide só o verbo quando não há mais nada em comum", () => {
    expect(elidirVerboRepetido("é Décio", "é Íris")).toBe("Íris");
    expect(elidirVerboRepetido("é Alice", "foi à Psicologia")).toBe("foi à Psicologia");
  });
});

describe("a elisão nunca entra no VALOR — defeito pego pela prova adversarial do VP", () => {
  it("não come o tratamento que faz parte do nome", () => {
    // Sem a fronteira do valor, "foi conduzida por Dra. Norma" + "…por Dra. Sônia" produzia
    // "nem Sônia": um nome que NÃO existe na grade, onde o item se chama "Dra. Sônia".
    expect(elidirVerboRepetido("foi conduzida por Dra. Norma", "foi conduzida por Dra. Sônia", "Dra. Sônia"))
      .toBe("por Dra. Sônia");
  });

  it("e segue elidindo o que não é valor", () => {
    expect(elidirVerboRepetido("usou a sala Jade", "usou a sala Coral", "Coral")).toBe("Coral");
    expect(elidirVerboRepetido("preparou o Gelado", "preparou o Espresso", "Espresso")).toBe("o Espresso");
  });
});
