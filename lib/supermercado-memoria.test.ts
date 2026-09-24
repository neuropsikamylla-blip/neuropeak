import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 23/set — ela testou e reprovou a tela de memorizar: "está muito pequena as figuras",
// apontando a prateleira como referência ("aqui está legal"). A foto era 66px fixo, e numa
// lista de dois itens sobrava card vazio em volta.
//
// Por que não é cosmético: memorizar é a fase em que o paciente CODIFICA o que vai ter de
// reconhecer depois. Foto pequena ali prejudica o exercício inteiro — na prateleira ele já
// pode procurar com calma; na memorização, não.

const FONTE = readFileSync(
  resolve(__dirname, "../components/exercises/memory/DesafioSupermercado.tsx"), "utf-8");

describe("Supermercado — a tela de memorizar", () => {
  it("a foto não tem mais tamanho fixo pequeno", () => {
    expect(FONTE).not.toMatch(/<ProductImg id=\{p\.id\} size=\{66\}/);
    expect(FONTE).toContain("tamanhoDaMemoria");
  });

  it("lista curta mostra a foto grande, e o tamanho só diminui com mais itens", () => {
    const corpo = FONTE.slice(FONTE.indexOf("function tamanhoDaMemoria"));
    const tamanhos = [...corpo.slice(0, 400).matchAll(/return (\d+);/g)].map((m) => Number(m[1]));
    expect(tamanhos.length, "faixas de tamanho").toBeGreaterThanOrEqual(3);
    expect(tamanhos[0], "lista curta precisa de foto grande").toBeGreaterThanOrEqual(120);
    for (let i = 1; i < tamanhos.length; i++) {
      expect(tamanhos[i], "o tamanho não pode crescer com mais itens").toBeLessThan(tamanhos[i - 1]);
    }
  });

  it("o bloco 'Treino de Memória' saiu do cabeçalho", () => {
    // Dizia ao paciente o que ele já sabe, repetia a instrução da fase, e ficava cortado
    // por baixo do botão de tela cheia.
    // Procura o texto RENDERIZADO, não a palavra solta: o comentário que explica a
    // remoção cita o nome, e citar não é mostrar.
    expect(FONTE).not.toMatch(/>\s*Treino de Memória\s*</);
    expect(FONTE).not.toMatch(/["'`]Selecione os itens que estavam na lista\./);
    expect(FONTE).not.toContain("np-hud-right");
  });
});
