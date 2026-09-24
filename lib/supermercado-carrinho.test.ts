import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { colunasDoCarrinho, linhasDoCarrinho, vaziasAntes } from "@/lib/supermercado-grade-carrinho";

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
    // 2 listas x 4 itens — o máximo que a LISTA pede. O carrinho aceita mais que isso
    // (erro por excesso), e a grade também tem de dar conta.
    expect(colunasDoCarrinho(8) * linhasDoCarrinho(8), "8 itens não cabem").toBeGreaterThanOrEqual(8);
    const niveis = FONTE.slice(FONTE.indexOf("const LEVELS"), FONTE.indexOf("const MAX_LEVEL"));
    const maiores = [...niveis.matchAll(/lists: (\d), count: (\d)/g)]
      .map(([, l, c]) => Number(l) * Number(c));
    expect(Math.max(...maiores), "o teto de itens mudou — a grade precisa acompanhar").toBe(8);
  });
  it("a grade preenche a cesta e assenta no fundo", () => {
    // Ela mandou a referência: produtos GRANDES, ocupando a cesta, sem espaço sobrando dos
    // lados. Antes a grade mantinha proporção fixa e encolhia de largura com muitas linhas —
    // com nove itens as fotos ficavam miúdas no meio.
    const bloco = FONTE.slice(FONTE.indexOf("/* O CARRINHO"), FONTE.indexOf("{/* confirmar */}"));
    expect(bloco).toContain('alignContent: "end"');
    expect(bloco, "a grade tem de ocupar a área toda").toContain('width: "100%", height: "100%"');
    expect(bloco, "proporção fixa fazia a grade encolher").not.toContain("aspectRatio");
  });

  it("duas compras não aparecem gigantes — há piso de faixas na cesta", () => {
    expect(colunasDoCarrinho(2)).toBe(2);
    expect(linhasDoCarrinho(2), "sem piso, dois itens ocupariam a altura inteira")
      .toBeGreaterThanOrEqual(3);
  });

  it("mais itens não achatam a foto: as colunas abrem junto", () => {
    // Travar as colunas faria a cesta ganhar linha atrás de linha, e a célula ficaria uma
    // tira baixa demais para reconhecer o produto. A célula é sempre mais larga que 1/4 e
    // a cesta nunca passa de 5 faixas.
    let anterior = 0;
    for (const n of [2, 4, 6, 9, 12, 16, 20, 24]) {
      const c = colunasDoCarrinho(n), l = linhasDoCarrinho(n);
      expect(c, `${n} itens: as colunas não podem encolher`).toBeGreaterThanOrEqual(anterior);
      expect(c, `${n} itens: coluna demais deixa a foto pequena`).toBeLessThanOrEqual(4);
      expect(l, `${n} itens em ${c} colunas daria ${l} faixas — a célula vira uma tira`)
        .toBeLessThanOrEqual(6);
      anterior = c;
    }
    // e a abertura acontece de fato, não é uma promessa vazia
    expect(colunasDoCarrinho(16), "16 itens ainda em 2 colunas").toBeGreaterThan(colunasDoCarrinho(2));
  });

  it("a grade aguenta MAIS itens do que a lista pedia", () => {
    // O carrinho não tem teto: o paciente pode pegar itens a mais, e é assim que o erro
    // por excesso aparece. Ela mesma chegou a 9 numa lista de 2.
    for (const n of [9, 15, 24]) {
      const celulas = colunasDoCarrinho(n) * linhasDoCarrinho(n);
      expect(celulas, `${n} itens não cabem na grade`).toBeGreaterThanOrEqual(n);
    }
  });

  it("o × se ancora na FOTO, não na célula", () => {
    // Foto estreita (um álcool em gel) numa célula larga deixava o × solto no canto.
    const bloco = FONTE.slice(FONTE.indexOf("/* O CARRINHO"), FONTE.indexOf("{/* confirmar */}"));
    expect(bloco).toContain('display: "inline-block"');
  });

  it("as compras assentam no FUNDO e sobem conforme entram", () => {
    // Ela viu com dois itens no topo: "podemos começar na parte de baixo, e quando aumenta
    // a quantidade sobe e nao ao contrario". `alignContent: end` sozinho não resolvia — as
    // faixas já ocupam a altura toda, então não sobra espaço para alinhar.
    for (const n of [1, 2, 3, 4, 6]) {
      const cols = colunasDoCarrinho(n), lin = linhasDoCarrinho(n);
      const primeiraFaixa = Math.floor(vaziasAntes(n) / cols) + 1;
      const ultimaFaixa = Math.ceil((vaziasAntes(n) + n) / cols);
      expect(ultimaFaixa, `${n} itens não chegam na última faixa`).toBe(lin);
      expect(primeiraFaixa, `${n} itens`).toBeGreaterThanOrEqual(1);
    }
  });

  it("com a cesta cheia não sobra célula vazia", () => {
    for (const n of [6, 9, 12, 16]) {
      const celulas = colunasDoCarrinho(n) * linhasDoCarrinho(n);
      expect(vaziasAntes(n), `${n} itens`).toBe(celulas - n);
      expect(vaziasAntes(n)).toBeGreaterThanOrEqual(0);
    }
  });

  it("as compras preenchem a cesta — a escala compensa a margem das fotos", () => {
    // Referência dela: os produtos QUASE SE TOCAM. As fotos trazem margem própria (medido:
    // o produto ocupa de 79% a 98% do arquivo), então `contain` puro deixa respiro duplo.
    const m = FONTE.match(/const ESCALA_NA_CESTA = ([\d.]+)/);
    expect(m, "a escala sumiu").toBeTruthy();
    const escala = Number(m![1]);
    expect(escala, "sem compensação a cesta parece vazia").toBeGreaterThan(1);
    expect(escala, "escala demais corta a foto na borda da célula").toBeLessThanOrEqual(1.25);
  });

  it("a coluna do carrinho tem largura para a foto ficar conferível", () => {
    const m = FONTE.match(/width: "(\d+)%", maxWidth: (\d+), minWidth: 156/);
    expect(m, "a coluna mudou de forma").toBeTruthy();
    expect(Number(m![2]), "coluna estreita deixa a foto pequena").toBeGreaterThanOrEqual(400);
    // mas não pode engolir a prateleira, que é onde ele procura
    expect(Number(m![1]), "a prateleira precisa de espaço").toBeLessThanOrEqual(45);
  });
});
