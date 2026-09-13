import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DISCO_CONTORNOS,
  DISCO_CORES,
  DISCO_CORES_CLARAS,
  FUNDO_CAIXA_OBJETIVO,
  contornoDoDisco,
  corDoDisco,
  gradienteDoDisco,
  larguraDoDisco,
} from "./discos";

// ---------------------------------------------------------------------------------------------
// Colorimetria de verdade, calculada aqui: os testes abaixo NÃO conferem hexadecimal decorado.
// Se alguém trocar uma cor de disco e não recalibrar o contorno, a conta acusa.
// ---------------------------------------------------------------------------------------------

function canais(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`hexadecimal inválido: ${hex}`);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** sRGB → linear. */
const linear = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);

/** Luminância relativa (WCAG 2.x). */
function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores. */
function contraste(a: string, b: string): number {
  const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** sRGB → CIELAB (D65). */
function lab(hex: string): [number, number, number] {
  const [r, g, b] = canais(hex).map(linear);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Ângulo de matiz em graus, no plano a*b*. */
function matiz(hex: string): number {
  const [, a, b] = lab(hex);
  return (Math.atan2(b, a) * 180) / Math.PI;
}

/** Croma C* = hipotenusa de a*b*. */
function croma(hex: string): number {
  const [, a, b] = lab(hex);
  return Math.hypot(a, b);
}

const DISCOS = [1, 2, 3, 4, 5, 6, 7, 8];

describe("cores dos discos — a fonte única", () => {
  it("as três tabelas cobrem os 8 discos", () => {
    expect(DISCO_CORES).toHaveLength(8);
    expect(DISCO_CORES_CLARAS).toHaveLength(8);
    expect(DISCO_CONTORNOS).toHaveLength(8);
  });

  it("as 8 cores são distintas entre si — é a cor que identifica o disco", () => {
    // O defeito de origem: os oito discos do objetivo saíam na MESMA cor. Uma paleta com repetição
    // reintroduziria o problema em menor escala (dois discos indistinguíveis no alvo).
    expect(new Set(DISCO_CORES).size).toBe(8);
  });

  it("nenhuma cor de disco é o azul único que o objetivo usava", () => {
    // #93C5FD era a cor plana da miniatura. Ele continua existindo como TOM CLARO do disco 6 (azul),
    // o que é legítimo; o que não pode voltar é ele como cor de base de disco.
    expect(DISCO_CORES).not.toContain("#93C5FD");
  });

  it("o tom claro é mais claro que a base em todos os 8 — o gradiente nunca inverte", () => {
    for (const d of DISCOS) {
      const [Lclara] = lab(DISCO_CORES_CLARAS[d - 1]);
      const [Lbase] = lab(DISCO_CORES[d - 1]);
      expect(Lclara, `disco ${d}: o topo do gradiente não é mais claro que a base`).toBeGreaterThan(Lbase);
    }
  });
});

describe("contorno do disco — calibrado, não chutado", () => {
  it("todo contorno alcança 3:1 contra o fundo da caixa do objetivo", () => {
    // 3:1 é o piso de contraste para objeto gráfico. Sem isso o disco amarelo (1,46:1 de
    // preenchimento contra este fundo) desaparece numa miniatura de 4-5 px de altura.
    for (const d of DISCOS) {
      const razao = contraste(contornoDoDisco(d), FUNDO_CAIXA_OBJETIVO);
      expect(razao, `disco ${d}: contorno com apenas ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  });

  it("o matiz do contorno é travado: escurecer é legítimo, virar outra cor não", () => {
    // A restrição clínica da variante E, que ela aprovou na Dupla Tarefa. O matiz é o que nomeia a
    // cor: se ele gira, o disco passa a ter duas cores e o contorno deixa de ser sombra do próprio
    // disco. Meio grau é folga de arredondamento de 8 bits, não licença.
    for (const d of DISCOS) {
      const giro = Math.abs(matiz(contornoDoDisco(d)) - matiz(corDoDisco(d)));
      expect(giro, `disco ${d}: o matiz do contorno girou ${giro.toFixed(2)}°`).toBeLessThan(0.5);
    }
  });

  it("o croma só cede o que o gamut obriga — nunca aumenta, nunca colapsa", () => {
    // Honestidade sobre o limite físico: escurecer um amarelo saturado no sRGB não tem para onde ir
    // sem dessaturar (ΔC* medido de −18,2 no disco 3). O que se proíbe é o contorno ficar MAIS
    // saturado que o disco (seria outra cor, não sombra) ou perder a cor de vez virando cinza.
    for (const d of DISCOS) {
      const razao = croma(contornoDoDisco(d)) / croma(corDoDisco(d));
      expect(razao, `disco ${d}: o contorno ficou mais saturado que o disco`).toBeLessThanOrEqual(1.001);
      expect(razao, `disco ${d}: o contorno perdeu a cor (${(razao * 100).toFixed(0)}% do croma)`).toBeGreaterThan(0.75);
    }
  });

  it("o contorno nunca é mais claro que o preenchimento", () => {
    for (const d of DISCOS) {
      expect(lab(contornoDoDisco(d))[0]).toBeLessThanOrEqual(lab(corDoDisco(d))[0] + 0.001);
    }
  });
});

describe("largura do disco — uma fórmula só", () => {
  it("disco 1 recebe a mínima e o disco N a máxima", () => {
    expect(larguraDoDisco(1, 5, 30, 150)).toBe(30);
    expect(larguraDoDisco(5, 5, 30, 150)).toBe(150);
  });

  it("cresce estritamente com o número do disco — o maior é sempre o mais largo", () => {
    for (const total of [3, 4, 5, 6, 8]) {
      const larguras = Array.from({ length: total }, (_, i) => larguraDoDisco(i + 1, total, 30, 150));
      for (let i = 1; i < larguras.length; i++) {
        expect(larguras[i], `total ${total}, disco ${i + 1}`).toBeGreaterThan(larguras[i - 1]);
      }
    }
  });

  it("com um disco só devolve a máxima, sem dividir por zero", () => {
    expect(larguraDoDisco(1, 1, 30, 150)).toBe(150);
    expect(Number.isFinite(larguraDoDisco(1, 1, 30, 150))).toBe(true);
  });

  it("reproduz exatamente a fórmula que a miniatura usava — largura não mudou nesta entrega", () => {
    // O pedido dela era sobre COR. A geometria do objetivo tem de sair intacta, e isto prova que
    // saiu: a fórmula antiga era `8e + (disco/total) * (W - 10e)`, com W = 34e.
    for (const escala of [0.85, 1, 2.4]) {
      for (const total of [3, 4, 5, 6]) {
        const W = 34 * escala;
        for (let d = 1; d <= total; d++) {
          const antiga = 8 * escala + (d / total) * (W - 10 * escala);
          const nova = larguraDoDisco(d, total, 8 * escala + (W - 10 * escala) / total, W - 2 * escala);
          expect(nova, `escala ${escala}, total ${total}, disco ${d}`).toBeCloseTo(antiga, 9);
        }
      }
    }
  });
});

describe("índice fora da faixa não vira outro disco", () => {
  it("devolve o neutro, nunca uma cor da paleta", () => {
    for (const invalido of [0, -1, 9, 99, 1.5, NaN]) {
      expect(DISCO_CORES).not.toContain(corDoDisco(invalido));
      expect(gradienteDoDisco(invalido)).not.toMatch(/gradient/);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Prova de AUSÊNCIA sobre o fonte: o defeito era exatamente a existência de uma segunda paleta.
// Um teste de presença jamais pegaria isso — o componente "funcionava".
// ---------------------------------------------------------------------------------------------

const ARQUIVO = "components/exercises/executive/TorreHanoi.tsx";

function codigo(): string {
  return readFileSync(resolve(process.cwd(), ARQUIVO), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
}

describe("a Torre não tem paleta de disco própria", () => {
  const src = codigo();

  it("nenhuma das 8 cores aparece escrita no componente", () => {
    // Enquanto a paleta viver em dois lugares, o objetivo pode voltar a divergir do tabuleiro sem
    // ninguém notar. É a causa do defeito de 12/set, não o sintoma.
    for (const cor of DISCO_CORES) {
      expect(src, `a cor ${cor} voltou a ser escrita no componente`).not.toContain(cor);
    }
  });

  it("o azul plano não aparece em lugar nenhum do componente", () => {
    expect(src, "#93C5FD reapareceu no componente").not.toContain("#93C5FD");
  });

  it("a miniatura do objetivo pinta por disco e tem contorno", () => {
    const mini = src.slice(src.indexOf("function MiniaturaAlvo"), src.indexOf("function hasteUnicaDoAlvo"));
    expect(mini, "a miniatura não chama o gradiente por disco").toContain("gradienteDoDisco(disc)");
    expect(mini, "a miniatura ficou sem o contorno que salva o disco claro").toContain("contornoDoDisco(disc)");
    // Restrito ao bloco do DISCO: o cinza da haste e da base da miniatura é fixo de propósito.
    const bloco = mini.slice(mini.indexOf("alvo[haste].map"));
    expect(bloco, "a miniatura voltou a ter cor fixa de fundo de disco").not.toMatch(/background:\s*["'`]#/);
  });

  it("a caixa do objetivo declara o fundo pela constante que calibrou o contorno", () => {
    // Se este fundo clarear, o contorno perde os 3:1 — o nome amarra as duas decisões.
    expect((src.match(/FUNDO_CAIXA_OBJETIVO/g) ?? []).length, "as duas caixas do objetivo deviam usar a constante").toBeGreaterThanOrEqual(3);
  });
});
