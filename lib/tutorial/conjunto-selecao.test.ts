import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compararConjunto,
  compararPar,
  compararRespostaDaFamilia,
} from "@/lib/tutorial/comparadores";

/** Baralho mínimo: duas cartas do mesmo símbolo (0 e 1) e uma de outro (2). */
const CARTAS_DO_TESTE = [
  { id: 0, symbol: "lua" },
  { id: 1, symbol: "lua" },
  { id: 2, symbol: "sol" },
] as const;

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

describe("Família 3 — memorizar conjunto e selecionar sem ordem", () => {
  const family = () => source("lib/tutorial/definitions/sequencia-ordenada.tsx");
  const definition = () => source("lib/tutorial/definitions/conjunto-selecao.tsx");

  it("mantém a comparação posicional como padrão opcional da fábrica", () => {
    expect(compararRespostaDaFamilia({}, ["a", "b"], ["a", "b"])).toBe(true);
    expect(compararRespostaDaFamilia({}, ["a", "b"], ["b", "a"])).toBe(false);
    expect(family()).toMatch(/compararResposta\?: \(esperada: T\[\], dada: T\[\]\) => boolean/);
  });

  it("aceita o mesmo conjunto em outra ordem", () => {
    expect(compararConjunto(["pão", "leite", "maçã"], ["maçã", "pão", "leite"])).toBe(true);
  });

  it("recusa conjunto errado mesmo com o mesmo tamanho", () => {
    expect(compararConjunto(["pão", "leite", "maçã"], ["pão", "leite", "flor"])).toBe(false);
  });

  it("valida o par do jogo da memória pelas duas cartas dadas", () => {
    const comparar = compararPar(CARTAS_DO_TESTE, 2);

    // Duas cartas do mesmo símbolo formam par, em qualquer ordem.
    expect(comparar([], [0, 1])).toBe(true);
    expect(comparar([], [1, 0])).toBe(true);
    // Símbolos diferentes, não.
    expect(comparar([], [0, 2])).toBe(false);
  });

  it("o par recusa os casos-limite que passariam despercebidos", () => {
    const comparar = compararPar(CARTAS_DO_TESTE, 2);

    expect(comparar([], [0, 0])).toBe(false);   // a mesma carta clicada duas vezes
    expect(comparar([], [0])).toBe(false);      // uma carta só
    expect(comparar([], [0, 1, 2])).toBe(false); // mais que o par
    expect(comparar([], [0, 99])).toBe(false);  // carta inexistente
  });

  it("usa a fábrica existente nos quatro exercícios, sem criar outra", () => {
    expect(definition().match(/criarTutorialSequenciaOrdenada(?:<[^>]+>)?\(\{/g) ?? []).toHaveLength(4);
    expect(definition()).not.toMatch(/function criarTutorial(?!SequenciaOrdenada)/);
  });

  it("mantém todas as constantes de ritmo somente na fábrica", () => {
    const constants = [
      "POST_LISTENING_PAUSE_MS",
      "POINTER_ENTRY_PULSE_MS",
      "POINTER_MOVE_MS",
      "POINTER_AIM_MS",
      "POINTER_PRESS_MS",
      "POINTER_RELEASE_MS",
      "BETWEEN_DIGITS_MS",
      "FINAL_PAUSE_MS",
      "VISUAL_ITEM_ON_MS",
      "VISUAL_ITEM_GAP_MS",
      "VISUAL_SETTLE_MS",
    ];

    for (const constant of constants) {
      expect(family()).toMatch(new RegExp(`const ${constant} =`));
      expect(definition()).not.toContain(constant);
    }
  });

  it("usa exatamente as instruções guiadas de clique", () => {
    expect(definition()).toContain("Observe os produtos e clique nos que estavam na lista.");
    expect(definition()).toContain("Observe os itens e clique nos que você memorizou.");
    expect(definition()).toContain("Clique em duas cartas para encontrar um par.");
    expect(definition()).toContain("Observe os pedidos e clique nos que foram feitos.");
    expect(definition()).not.toMatch(/teclado|toque/i);
  });

  it("expõe alvos e pressão opcional nas quatro superfícies reais", () => {
    const exercises = [
      source("components/exercises/memory/DesafioSupermercado.tsx"),
      source("components/exercises/memory/ListaDistracao.tsx"),
      source("components/exercises/memory/JogoMemoria.tsx"),
      source("components/exercises/memory/RestauranteOrdem.tsx"),
    ];

    for (const exercise of exercises) {
      expect(exercise).toMatch(/pressedChoice\?:/);
      expect(exercise).toMatch(/data-choice=/);
    }
  });

  it("remove os tutoriais legados dos exercícios convertidos", () => {
    const supermarket = source("components/exercises/memory/DesafioSupermercado.tsx");
    const memoryGame = source("components/exercises/memory/JogoMemoria.tsx");

    expect(`${supermarket}${memoryGame}`).not.toMatch(/TutorialBase|showTutorial/);
  });
});
