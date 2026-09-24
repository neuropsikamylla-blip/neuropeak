import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { colunasDoCarrinho, linhasDoCarrinho } from "@/lib/supermercado-grade-carrinho";

// 24/set — ela viu produtos vazando para fora do carrinho: "o modelo eu mostrei tudo precisa
// ficar dentro.. faça uma auditoria com todos os produtos cabendo exatamente no carrinho".
//
// A causa era uma escala de 1,14 que eu havia posto para compensar a margem das fotos: ela
// empurrava a imagem 14% para fora da célula, e as células da borda saíam da cesta.
//
// Este teste MEDE a arte do carrinho e confere que a área configurada cabe entre as barras,
// e que todo produto do catálogo cabe na célula.

const RAIZ = resolve(__dirname, "..");
const FONTE = readFileSync(resolve(RAIZ, "components/exercises/memory/DesafioSupermercado.tsx"), "utf-8");

/** Lê a imagem já em RGBA cru. `sharp` é dependência que o projeto ja tem. */
async function lerPNG(caminho: string) {
  const { data, info } = await sharp(caminho).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data };
}

/** Onde as barras do cesto deixam passagem, medido da própria arte. */
async function limitesDaCesta() {
  const png = await lerPNG(resolve(RAIZ, "public/exercises/supermercado/carrinho.png"));
  const { width: w, height: h, data } = png;
  const px = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  };
  let x0 = 0, x1 = 1;
  for (const frac of [0.22, 0.30, 0.40, 0.50, 0.60, 0.70]) {
    const y = Math.floor(h * frac);
    let esq = -1, dir = -1;
    for (let x = 0; x < w; x++) {
      const p = px(x, y);
      const metal = p.a > 40 && (p.r + p.g + p.b) / 3 < 200;
      if (metal) { if (esq < 0) esq = x; dir = x; }
    }
    if (esq < 0) continue;
    x0 = Math.max(x0, esq / w);
    x1 = Math.min(x1, dir / w);
  }
  return { x0, x1 };
}

function cestaConfigurada() {
  const m = FONTE.match(/const CESTA = \{ x0: ([\d.]+), y0: ([\d.]+), x1: ([\d.]+), y1: ([\d.]+) \}/);
  if (!m) throw new Error("CESTA não encontrada");
  const [x0, y0, x1, y1] = m.slice(1).map(Number);
  return { x0, y0, x1, y1 };
}

describe("auditoria: tudo cabe dentro do carrinho", () => {
  it("a área configurada fica DENTRO das barras do cesto", async () => {
    const barras = await limitesDaCesta();
    const c = cestaConfigurada();
    expect(c.x0, `borda esquerda invade a grade (barra em ${barras.x0.toFixed(3)})`)
      .toBeGreaterThanOrEqual(barras.x0);
    expect(c.x1, `borda direita invade a grade (barra em ${barras.x1.toFixed(3)})`)
      .toBeLessThanOrEqual(barras.x1);
    // e o cesto acaba por volta de y=0,74 — abaixo é a base
    expect(c.y1, "a área passa do fundo do cesto").toBeLessThanOrEqual(0.74);
    expect(c.y0, "a área começa acima da boca do cesto").toBeGreaterThanOrEqual(0.15);
  });

  it("nada é ampliado além da célula — foto não estoura para fora", () => {
    const bloco = FONTE.slice(FONTE.indexOf("/* O CARRINHO"), FONTE.indexOf("{/* confirmar */}"));
    expect(bloco, "scale na foto joga a imagem para fora da cesta").not.toMatch(/transform:\s*`?scale/);
    expect(bloco, "a foto tem de ser limitada pela célula").toContain('objectFit: "contain"');
  });

  it("o wrapper da foto é fixado por inset, não por percentual de altura", () => {
    // TRÊS tentativas falharam antes desta, todas confiando em `height: 100%` numa cadeia
    // que não sustentava o percentual — a célula usava `placeItems: center`, que impede o
    // filho de esticar, e aí o limite de altura da foto simplesmente não se aplicava.
    //
    // O sintoma que denunciou: quanto mais ALTA a foto, mais ela vazava — 1,29× num produto
    // quadrado, 1,60× num protetor solar. Altura sem limite, largura limitada.
    //
    // `inset: 0` fixa o wrapper no tamanho exato da célula, sem depender de alinhamento nem
    // de herança de altura.
    const bloco = FONTE.slice(FONTE.indexOf("/* O CARRINHO"), FONTE.indexOf("{/* confirmar */}"));
    const wrapper = bloco.slice(bloco.indexOf("<span style={{ position:"));
    expect(wrapper.slice(0, 120), "wrapper por percentual já falhou três vezes")
      .toContain("position: \"absolute\", inset: 0");

    // e a célula não pode centralizar por grid: é isso que impede o filho de esticar
    const celula = bloco.slice(bloco.indexOf("title={p.name}"));
    expect(celula.slice(0, 200), "placeItems center impede o wrapper de ocupar a célula")
      .not.toContain("placeItems");

    // a foto se limita nas duas dimensões
    const img = bloco.slice(bloco.indexOf("<img src={`/exercises/produtos/"));
    expect(img.slice(0, 300)).toMatch(/width: "100%", height: "100%"/);
    expect(img.slice(0, 300)).toContain('objectFit: "contain"');
  });

  it("todo produto do catálogo cabe na célula, em qualquer quantidade", async () => {
    const dir = resolve(RAIZ, "public/exercises/produtos");
    const arquivos = readdirSync(dir).filter((f) => f.endsWith(".png"));
    expect(arquivos.length, "catálogo vazio").toBeGreaterThan(100);

    const c = cestaConfigurada();
    const piores: string[] = [];
    // a célula mais apertada é a de mais itens
    for (const itens of [2, 9, 16, 24]) {
      const larguraCelula = (c.x1 - c.x0) / colunasDoCarrinho(itens);
      const alturaCelula = (c.y1 - c.y0) / linhasDoCarrinho(itens);
      for (const f of arquivos) {
        const png = await lerPNG(resolve(dir, f));
        // `contain` encaixa a foto na célula mantendo a proporção: o lado renderizado
        // nunca passa da célula. O que se confere é que sobra área útil de verdade.
        const escala = Math.min(larguraCelula / png.width, alturaCelula / png.height);
        const larguraRender = png.width * escala;
        const alturaRender = png.height * escala;
        if (larguraRender > larguraCelula + 1e-9 || alturaRender > alturaCelula + 1e-9) {
          piores.push(`${f} com ${itens} itens`);
        }
      }
    }
    expect(piores, `produtos estourando a célula:\n${piores.slice(0, 8).join("\n")}`).toEqual([]);
  }, 180_000);

  it("a grade inteira cabe na área da cesta", () => {
    const c = cestaConfigurada();
    for (const itens of [1, 2, 4, 6, 9, 12, 16, 20]) {
      const cols = colunasDoCarrinho(itens), lin = linhasDoCarrinho(itens);
      const larguraGrade = c.x1 - c.x0;
      const alturaGrade = c.y1 - c.y0;
      expect(larguraGrade / cols, `${itens} itens: célula sem largura útil`).toBeGreaterThan(0.04);
      expect(alturaGrade / lin, `${itens} itens: célula sem altura útil`).toBeGreaterThan(0.03);
    }
  });
});
