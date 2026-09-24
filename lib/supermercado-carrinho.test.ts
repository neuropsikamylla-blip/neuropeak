import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 24/set — desenho dela: a arte do carrinho é a MOLDURA, e tudo que muda vai por cima em HTML.
// Antes os itens vinham numa lista vertical com a foto em 34px — pequena demais para o
// paciente CONFERIR de relance o que já pegou, que é a função do carrinho num exercício de
// memória: ele bate a lista que memorizou contra o que está ali.

const RAIZ = resolve(__dirname, "..");
const FONTE = readFileSync(resolve(RAIZ, "components/exercises/memory/DesafioSupermercado.tsx"), "utf-8");

describe("Supermercado — o carrinho", () => {
  it("a arte existe e não pesa demais", () => {
    const img = resolve(RAIZ, "public/exercises/supermercado/carrinho.png");
    expect(existsSync(img), "a arte do carrinho sumiu").toBe(true);
    // Exibida em ~340px; 2x para Retina basta. O original tinha 1,4 MB — e todo peso
    // em public/ viaja em cada deploy (ver lib/deploy-peso.test.ts).
    expect(statSync(img).size, "arte pesada demais para o deploy").toBeLessThan(700 * 1024);
  });

  it("nenhum texto que MUDA está desenhado na arte — vai por cima, em HTML", () => {
    // A contagem muda a cada toque: desenhada na imagem, ficaria mentindo.
    expect(FONTE).toMatch(/\{cartIds\.length\}\/\{itemCount\}/);
    expect(FONTE).toMatch(/Confirmar \(\{cartIds\.length\}\/\{itemCount\}\)/);
  });

  it("a área da cesta é um retângulo inscrito, não a imagem inteira", () => {
    const m = FONTE.match(/const CESTA = \{ x0: ([\d.]+), y0: ([\d.]+), x1: ([\d.]+), y1: ([\d.]+) \}/);
    expect(m, "a constante CESTA sumiu").toBeTruthy();
    const [x0, y0, x1, y1] = m!.slice(1).map(Number);
    expect(x0).toBeGreaterThan(0.15);   // dentro da grade lateral esquerda
    expect(x1).toBeLessThan(0.85);      // e da direita
    expect(y0).toBeGreaterThan(0.1);    // abaixo do cabo
    expect(y1).toBeLessThan(0.8);       // acima da base e das rodas
    expect(x1 - x0).toBeGreaterThan(0.4);  // mas sobra área útil de verdade
    expect(y1 - y0).toBeGreaterThan(0.4);
  });

  it("o produto no carrinho não usa mais o tamanho fixo de 34px", () => {
    expect(FONTE).not.toMatch(/<ProductImg id=\{id\} size=\{34\}/);
    // agora ele preenche a célula da grade
    expect(FONTE).toMatch(/maxWidth: "100%", maxHeight: "100%", objectFit: "contain"/);
  });

  it("dá para REMOVER um item — ele pode ter tocado no produto errado", () => {
    expect(FONTE).toMatch(/onClick=\{\(\) => toggleProduct\(id\)\}/);
    expect(FONTE).toMatch(/aria-label=\{`Remover \$\{p\.name\}`\}/);
  });

  it("a grade comporta o teto de 8 itens do nível 12", () => {
    // 2 listas x 4 itens. Duas colunas dão 4 linhas — cabe sem rolagem.
    expect(FONTE).toMatch(/gridTemplateColumns: "repeat\(2, 1fr\)"/);
    const niveis = FONTE.slice(FONTE.indexOf("const LEVELS"), FONTE.indexOf("const MAX_LEVEL"));
    const maiores = [...niveis.matchAll(/lists: (\d), count: (\d)/g)]
      .map(([, l, c]) => Number(l) * Number(c));
    expect(Math.max(...maiores), "o teto de itens mudou — a grade precisa acompanhar").toBe(8);
  });
  it("as células são quadradas e a grade ocupa só a altura necessária", () => {
    // Ela viu o defeito: "seria possivel manter o X mais perto da imagem correspondente?".
    // A causa era a grade dividir a área INTEIRA entre as linhas — com dois itens a célula
    // ficava altíssima, a foto boiava no meio e o × subia para o topo dela.
    expect(FONTE).toContain("aspectRatio: `2 / ${Math.max(1, Math.ceil(cartIds.length / 2))}`");
    expect(FONTE, "as linhas precisam acompanhar a quantidade de itens")
      .toContain("gridTemplateRows: `repeat(${Math.max(1, Math.ceil(cartIds.length / 2))}, 1fr)`");
  });

  it("as compras assentam no fundo da cesta, como num carrinho de verdade", () => {
    const bloco = FONTE.slice(FONTE.indexOf("/* O CARRINHO"), FONTE.indexOf("{/* confirmar */}"));
    expect(bloco).toContain('justifyContent: "flex-end"');
  });
});
