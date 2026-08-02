import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  CATALOGO_PRODUTOS, dimensaoDe, valorNormalizado, produtoPorId, TOTAL_CATALOGO,
  type Categoria,
} from "@/data/informacao-foco-catalogo";

// Categorias em que cada campo FAZ SENTIDO (§7 e §10 da Fase 1).
const PODE_LACTOSE: Categoria[] = ["leites", "iogurtes", "laticinios", "bebidas-vegetais", "congelados", "doces", "frios"];
const PODE_SABOR: Categoria[] = ["iogurtes", "sucos", "doces"];
const SO_VOLUME: Categoria[] = ["leites", "bebidas-vegetais", "sucos"];

describe("Catálogo do Informação em Foco — atributos FIXOS", () => {
  it("tem 73 produtos com id único e imagem em disco", () => {
    expect(TOTAL_CATALOGO).toBe(73);
    const ids = CATALOGO_PRODUTOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of CATALOGO_PRODUTOS) {
      const arq = path.join(process.cwd(), "public", "exercises", "informacao-foco-produtos", `${p.id}.png`);
      expect(fs.existsSync(arq), `sem imagem: ${p.id}`).toBe(true);
      expect(p.img).toBe(`/exercises/informacao-foco-produtos/${p.id}.png`);
    }
  });

  it("líquido nunca é cadastrado em gramas (leite, suco, bebida vegetal)", () => {
    // leite EM PÓ é sólido de propósito — fica fora do filtro de líquidos
    const liquidos = CATALOGO_PRODUTOS.filter((p) => SO_VOLUME.includes(p.categoria) && p.id !== "leite-em-po");
    for (const p of liquidos) {
      expect(dimensaoDe(p.conteudo.unidade), `${p.id} deveria ser volume`).toBe("volume");
    }
    // e os que são volume mesmo fora dessas categorias continuam coerentes
    for (const id of ["azeite", "oleo-soja", "vinagre", "vinagre-maca", "vinagre-balsamico", "shoyu"]) {
      expect(dimensaoDe(produtoPorId(id)!.conteudo.unidade), `${id} deveria ser volume`).toBe("volume");
    }
  });

  it("lactose só é declarada onde é informação funcionalmente relevante", () => {
    for (const p of CATALOGO_PRODUTOS) {
      if (p.lactose === true || p.lactose === false) {
        expect(PODE_LACTOSE.includes(p.categoria), `${p.id} (${p.categoria}) não deveria declarar lactose`).toBe(true);
      }
    }
    // e nunca em chá, sal, açúcar, óleo — o bug que ela viu em produção
    for (const id of ["cha-camomila", "cha-verde", "sal", "acucar-refinado", "oleo-soja", "milho-conserva"]) {
      expect([undefined, null]).toContain(produtoPorId(id)!.lactose);
    }
  });

  it("sabor só existe em produto que realmente tem sabor", () => {
    for (const p of CATALOGO_PRODUTOS) {
      if (p.sabor) {
        expect(PODE_SABOR.includes(p.categoria), `${p.id} (${p.categoria}) não deveria ter sabor`).toBe(true);
      }
    }
    for (const id of ["lasanha", "pao-forma", "arroz", "feijao", "farinha-trigo", "sal", "oleo-soja", "milho-conserva", "biscoito-maria"]) {
      expect(produtoPorId(id)!.sabor ?? null, `${id} não pode ter sabor`).toBeNull();
    }
  });

  it("faixa de preço plausível e coerente entre categorias", () => {
    for (const p of CATALOGO_PRODUTOS) {
      const [min, max] = p.precoFaixa;
      expect(min, `${p.id}`).toBeGreaterThan(0);
      expect(max, `${p.id}`).toBeGreaterThan(min);
      expect(max / min, `${p.id}: faixa larga demais`).toBeLessThanOrEqual(2.2);
    }
    const media = (id: string) => { const f = produtoPorId(id)!.precoFaixa; return (f[0] + f[1]) / 2; };
    expect(media("azeite")).toBeGreaterThan(media("oleo-soja"));      // §12
    expect(media("acucar-mascavo")).toBeGreaterThan(media("acucar-refinado"));
    expect(media("sal-rosa")).toBeGreaterThan(media("sal"));
  });

  it("normalização de unidade compara na mesma escala", () => {
    expect(valorNormalizado({ valor: 1, unidade: "kg" })).toBe(1000);
    expect(valorNormalizado({ valor: 1, unidade: "L" })).toBe(1000);
    expect(valorNormalizado({ valor: 500, unidade: "g" })).toBe(500);
    expect(dimensaoDe("unidades")).toBe("contagem");
    expect(dimensaoDe("saches")).toBe("contagem");
  });

  it("leitura direta da embalagem só onde há frase legível confirmada", () => {
    for (const p of CATALOGO_PRODUTOS) {
      if (p.directPackageReadingEnabled) {
        expect(p.frasesNaEmbalagem?.length, `${p.id} sem frase legível`).toBeGreaterThan(0);
        expect(p.revisar ?? false, `${p.id} está pendente de revisão`).toBe(false);
      }
    }
    // nenhum produto entrou com conteúdo não confirmado
    expect(CATALOGO_PRODUTOS.filter((p) => p.revisar).map((p) => p.id)).toEqual([]);
  });

  it("contagem secundária (sachês/unidades) bate com o produto", () => {
    expect(produtoPorId("cha-camomila")!.saches).toBe(10);
    expect(produtoPorId("cha-verde")!.saches).toBe(10);
    expect(produtoPorId("adocante-stevia")!.saches).toBe(50);
    expect(produtoPorId("ovos")!.unidades).toBe(12);
    expect(produtoPorId("gelatina")!.rendimento).toBe("12 porções");
    expect(produtoPorId("leite-em-po")!.rendimento).toBe("10 copos");
  });

  it("conservação congelada só nos congelados", () => {
    for (const p of CATALOGO_PRODUTOS) {
      if (p.conservacao === "congelado") expect(p.categoria).toBe("congelados");
    }
    expect(CATALOGO_PRODUTOS.filter((p) => p.categoria === "congelados").every((p) => p.conservacao === "congelado")).toBe(true);
  });
});
