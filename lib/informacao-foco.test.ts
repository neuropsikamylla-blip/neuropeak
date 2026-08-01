import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  gerarQuestao, gerarSessao, validarQuestao, valorCampo,
  CONFIG_PADRAO, CATALOGO, type Nivel,
} from "./informacao-foco";

// Reexecuta cada nível muitas vezes: geração procedural precisa ser sempre válida.
describe("Informação em Foco — geração", () => {
  for (const nivel of [1, 2, 3, 4] as Nivel[]) {
    it(`nível ${nivel}: gera questões válidas (500x)`, () => {
      for (let i = 0; i < 500; i++) {
        const q = gerarQuestao(nivel);
        expect(validarQuestao(q)).toBe(true);
        expect(q.nivel).toBe(nivel);
        expect(q.produtos.length).toBeGreaterThanOrEqual(2);
        expect(q.produtos.length).toBeLessThanOrEqual(4);
        expect(q.correta).toBeGreaterThanOrEqual(0);
        expect(q.correta).toBeLessThan(q.produtos.length);
        // todo campo relevante aparece nos campos mostrados (informação necessária visível)
        for (const c of q.campoRelevante) expect(q.camposMostrados).toContain(c);
        // pergunta e explicação de acerto não vazias
        expect(q.pergunta.length).toBeGreaterThan(5);
        expect(q.explicacaoAcerto.length).toBeGreaterThan(5);
      }
    });
  }

  it("nível 2 (menor-preço): a correta é realmente o menor preço", () => {
    for (let i = 0; i < 300; i++) {
      const q = gerarQuestao(2);
      if (q.categoria !== "comparacao-preco") continue;
      const precos = q.produtos.map((p) => p.campos.preco!);
      const min = Math.min(...precos);
      expect(precos[q.correta]).toBe(min);
      // só uma opção tem o mínimo (sem empate)
      expect(precos.filter((v) => v === min).length).toBe(1);
    }
  });

  it("nível 3 (duas condições): só a correta atende às DUAS", () => {
    for (let i = 0; i < 300; i++) {
      const q = gerarQuestao(3);
      const atende = q.produtos.map((p) => (p.campos.peso ?? 0) >= 500 && (p.campos.preco ?? 99) < 8);
      expect(atende.filter(Boolean).length).toBe(1);          // exatamente 1 resposta
      expect(atende[q.correta]).toBe(true);                   // e é a marcada como correta
    }
  });

  it("explicarErro nunca vaza a resposta como certa para escolha errada", () => {
    for (let i = 0; i < 200; i++) {
      const q = gerarQuestao(((i % 4) + 1) as Nivel);
      for (let e = 0; e < q.produtos.length; e++) {
        if (e === q.correta) continue;
        expect(typeof q.explicarErro(e)).toBe("string");
      }
    }
  });

  it("valorCampo formata sem quebrar para qualquer campo mostrado", () => {
    for (let i = 0; i < 200; i++) {
      const q = gerarQuestao(((i % 4) + 1) as Nivel);
      for (const p of q.produtos) for (const c of q.camposMostrados) {
        expect(valorCampo(p, c)).not.toBe("");
      }
    }
  });

  it("gerarSessao respeita a quantidade e sobe de nível quando não é fixo", () => {
    const s = gerarSessao({ ...CONFIG_PADRAO, nQuestoes: 12 });
    expect(s.length).toBe(12);
    expect(s[0].nivel).toBe(1);
    expect(s[s.length - 1].nivel).toBeGreaterThanOrEqual(s[0].nivel);
    const fixa = gerarSessao({ nQuestoes: 8, nivelInicial: 2, nivelFixo: true });
    expect(fixa.every((q) => q.nivel === 2)).toBe(true);
  });
});

// ── Integridade do catálogo (77 produtos com embalagem real e fundo transparente) ──
describe("Informação em Foco — catálogo de produtos", () => {
  const dir = path.join(process.cwd(), "public", "exercises", "informacao-foco-produtos");

  it("toda imagem do catálogo existe em disco e é PNG com canal alfa", () => {
    for (const m of CATALOGO) {
      const arq = path.join(dir, path.basename(m.img));
      expect(fs.existsSync(arq), `faltando: ${m.img}`).toBe(true);
      const buf = fs.readFileSync(arq);
      // cabeçalho PNG: bytes 24 (bit depth) e 25 (color type). 6 = RGBA
      expect(buf.subarray(1, 4).toString(), `não é PNG: ${m.img}`).toBe("PNG");
      expect(buf[25], `sem canal alfa: ${m.img}`).toBe(6);
    }
  });

  it("não há imagem repetida nem produto sem marca (exceto embalagem sem marca impressa)", () => {
    const imgs = CATALOGO.map((m) => m.img);
    expect(new Set(imgs).size).toBe(imgs.length);
    const semMarca = CATALOGO.filter((m) => m.marca === "").map((m) => m.nome);
    expect(semMarca).toEqual(["Ervas finas"]);
  });

  it("nomes repetidos só existem com marcas diferentes (pares de marca)", () => {
    const porNome = new Map<string, string[]>();
    for (const m of CATALOGO) porNome.set(m.nome, [...(porNome.get(m.nome) ?? []), m.marca]);
    for (const [nome, marcas] of porNome) {
      expect(new Set(marcas).size, `marcas repetidas em ${nome}`).toBe(marcas.length);
    }
  });

  it("nenhuma questão traz dois cartões com o mesmo nome", () => {
    for (let i = 0; i < 800; i++) {
      const q = gerarQuestao(((i % 4) + 1) as Nivel);
      const nomes = q.produtos.map((p) => p.nome);
      expect(new Set(nomes).size, `nomes repetidos: ${nomes.join(" | ")}`).toBe(nomes.length);
    }
  });

  it("todo cartão carrega a marca do próprio produto", () => {
    const marcaDoNome = new Map(CATALOGO.map((m) => [m.img, m.marca]));
    for (let i = 0; i < 400; i++) {
      const q = gerarQuestao(((i % 4) + 1) as Nivel);
      for (const p of q.produtos) {
        expect(p.marca, `sem marca: ${p.nome}`).toBe(marcaDoNome.get(p.img!));
      }
    }
  });

  it("“Conteúdo” (mL/L) só aparece em líquido; “Peso” (g/kg), só em sólido", () => {
    const estado = new Map(CATALOGO.map((m) => [m.img, m.estado]));
    for (let i = 0; i < 600; i++) {
      const q = gerarQuestao(((i % 4) + 1) as Nivel);
      if (q.categoria === "localizacao-volume" || q.categoria === "comparacao-volume") {
        for (const p of q.produtos) expect(estado.get(p.img!), `${p.nome} não é líquido`).toBe("liquido");
      }
      if (q.categoria === "localizacao-peso" || q.categoria === "duas-condicoes") {
        for (const p of q.produtos) expect(estado.get(p.img!), `${p.nome} não é sólido`).toBe("solido");
      }
    }
  });
});
