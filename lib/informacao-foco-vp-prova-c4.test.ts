import { describe, expect, it } from "vitest";
import {
  _resetIds, avaliarEmEtapas, criarSnapshot, gerarQuestao, montarQuestao, motivoInvalidez, TIPOS_QUESTAO,
  operacaoDaQuestao, operacaoDoTipo, operacoesDoNivel, paramsDoNivel, satisfaz,
  type Condicao, type ProdutoNaQuestao, type Questao, type TipoQuestao,
} from "./informacao-foco-questoes";
import { CATALOGO_PRODUTOS } from "@/data/informacao-foco-catalogo";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

const filtro2027: Condicao = {
  campo: "validade", operador: "maiorOuIgual", valor: 2027 * 12 + 1,
  texto: "vence em 2027", resumo: "Validade em 2027",
};
const menorPreco: Condicao = {
  campo: "preco", operador: "minimo", texto: "tem o menor preço", resumo: "Menor preço",
};

function tresLeites(): ProdutoNaQuestao[] {
  const [a, b, c] = CATALOGO_PRODUTOS.filter((p) => p.categoria === "leites").slice(0, 3);
  return [
    { produto: a, preco: 9, validade: { mes: 6, ano: 2027 } },
    { produto: b, preco: 5, validade: { mes: 6, ano: 2026 } },
    { produto: c, preco: 7, validade: { mes: 6, ano: 2027 } },
  ];
}

const avaliarComoAntes = (produtos: ProdutoNaQuestao[], condicoes: Condicao[]) =>
  produtos.filter((produto) => condicoes.every((condicao) => satisfaz(produto, condicao, produtos)));

describe("C4 — filtrar e depois comparar", () => {
  it("o caso literal encontra o leite de R$ 7,00 entre os dois que vencem em 2027", () => {
    const produtos = tresLeites();
    const { filtrados, atendem } = avaliarEmEtapas(produtos, [filtro2027, menorPreco]);
    expect(filtrados).toHaveLength(2);
    expect(atendem).toEqual([produtos[2]]);
    expect(atendem[0].preco).toBe(7);
  });

  it("controle negativo: a avaliação antiga devolve zero no mesmo cenário", () => {
    expect(avaliarComoAntes(tresLeites(), [filtro2027, menorPreco])).toHaveLength(0);
  });

  it.each([3, 4, 5, 6, 7, 8])(
    "nível %i: 300 questões preservam pelo menos dois filtrados e uma resposta", (nivel) => {
      const rnd = lcg(2026091700 + nivel);
      const snapshot = criarSnapshot(rnd);
      for (let tentativa = 0; tentativa < 300; tentativa++) {
        const { questao } = gerarQuestao(
          "filtroComparacao", paramsDoNivel(nivel), snapshot, rnd, [], ["filtroComparacao"],
        );
        expect(questao, `nível ${nivel}, tentativa ${tentativa + 1}`).not.toBeNull();
        const resultado = avaliarEmEtapas(questao!.produtos, questao!.condicoes);
        expect(resultado.filtrados.length).toBeGreaterThanOrEqual(2);
        expect(resultado.atendem).toEqual([questao!.produtos[questao!.correta]]);
        expect(motivoInvalidez(questao!)).toBeNull();
        expect(questao!.pergunta).toMatch(/^Entre os produtos que .+, qual .+\?$/);
        expect(questao!.pergunta).not.toMatch(/produtos que (?:tem|custa|vence|contém|é do tipo|precisa)\b/);
        expect(operacaoDaQuestao(questao!)).toBe("filtroComparacao");
      }
    }, 120_000,
  );

  it("filtroNaoFiltra rejeita filtro que deixa um único produto", () => {
    const produtos = tresLeites();
    produtos[2] = { ...produtos[2], validade: { mes: 6, ano: 2026 } };
    const q = {
      id: "c4-filtro-unico", tipo: "filtroComparacao", modalidade: "quadro",
      pergunta: "Entre os produtos que vencem em 2027, qual tem o menor preço?",
      produtos, correta: 0, condicoes: [filtro2027, menorPreco],
      camposVisiveis: ["conteudo", "validade", "preco"], camposExigidos: ["validade", "preco"],
      explicacao: "", pista: "", categoria: produtos[0].produto.categoria, assinatura: "c4-filtro-unico",
    } as Questao;
    expect(avaliarEmEtapas(produtos, q.condicoes).filtrados).toHaveLength(1);
    expect(motivoInvalidez(q)).toBe("filtroNaoFiltra");
  });

  it("2.000 questões dos tipos anteriores mantêm exatamente a avaliação antiga", () => {
    const casos: { tipo: TipoQuestao; nivel: number }[] = [
      { tipo: "localizacao", nivel: 5 }, { tipo: "comparacao", nivel: 5 },
      { tipo: "duasCondicoes", nivel: 5 }, { tipo: "tresCondicoes", nivel: 8 },
    ];
    let total = 0;
    for (const [indice, caso] of casos.entries()) {
      const rnd = lcg(2026091750 + indice);
      const snapshot = criarSnapshot(rnd);
      for (let tentativa = 0; tentativa < 500; tentativa++) {
        const { questao } = gerarQuestao(caso.tipo, paramsDoNivel(caso.nivel), snapshot, rnd, [], [caso.tipo]);
        expect(questao, `${caso.tipo}, tentativa ${tentativa + 1}`).not.toBeNull();
        const antiga = avaliarComoAntes(questao!.produtos, questao!.condicoes);
        const nova = avaliarEmEtapas(questao!.produtos, questao!.condicoes).atendem;
        expect(nova.map((p) => p.produto.id)).toEqual(antiga.map((p) => p.produto.id));
        total++;
      }
    }
    expect(total).toBe(2_000);
  }, 120_000);

  it.each([3, 4, 5, 6, 7, 8])("nível %i: geração direta tem menos de 5% de null", (nivel) => {
    const rnd = lcg(2026091780 + nivel);
    const snapshot = criarSnapshot(rnd);
    let nulas = 0;
    for (let tentativa = 0; tentativa < 300; tentativa++) {
      const q = montarQuestao({ tipo: "filtroComparacao", params: paramsDoNivel(nivel), snapshot, rnd });
      if (!q) nulas++;
    }
    console.info(`C4 nível ${nivel}: null=${nulas}/300 (${(nulas / 3).toFixed(1)}%)`);
    expect(nulas / 300).toBeLessThan(0.05);
  }, 120_000);

  it("o tipo e a operação são liberados somente a partir do nível 3", () => {
    expect(operacoesDoNivel(2)).not.toContain("filtroComparacao");
    for (let nivel = 3; nivel <= 8; nivel++) expect(operacoesDoNivel(nivel)).toContain("filtroComparacao");
    expect(operacaoDoTipo("filtroComparacao")).toBe("filtroComparacao");
  });
});

describe("VP — o filtro tem de FILTRAR (conserto do VP sobre a entrega da C4)", () => {
  // A spec do VP copiou a regra dela — "o filtro deixa pelo menos 2" — e esqueceu o limite de
  // CIMA. Medido na entrega: 43% a 59% das questões tinham filtro que não excluía NINGUÉM,
  // ou seja, comparação simples com uma frase decorativa na frente. É o mesmo defeito que ela
  // apontou nos dois critérios, na forma de filtro.
  it.each([3, 4, 5, 6, 7, 8])("nível %i: o filtro sempre exclui ao menos um produto", (nivel) => {
    _resetIds();
    const rnd = lcg(4040 + nivel);
    const snap = criarSnapshot(rnd);
    let geradas = 0;
    for (let i = 0; i < 300; i++) {
      const r = gerarQuestao("filtroComparacao", paramsDoNivel(nivel), snap, rnd, [], ["filtroComparacao"]);
      if (!r.questao) continue;
      geradas++;
      const { filtrados, atendem } = avaliarEmEtapas(r.questao.produtos, r.questao.condicoes);
      expect(filtrados.length, `"${r.questao.pergunta}"`).toBeGreaterThanOrEqual(2);
      expect(filtrados.length, `"${r.questao.pergunta}" — o filtro não excluiu ninguém`)
        .toBeLessThan(r.questao.produtos.length);
      expect(atendem.length).toBe(1);
    }
    expect(geradas, "a trava não pode ter matado a geração").toBeGreaterThan(250);
  });

  it("controle: a validação rejeita filtro que deixa TODOS passarem", () => {
    const [a, b, c] = CATALOGO_PRODUTOS.filter((p) => p.categoria === "leites").slice(0, 3);
    const produtos: ProdutoNaQuestao[] = [
      { produto: a, preco: 5.0, validade: { mes: 6, ano: 2027 } },
      { produto: b, preco: 7.0, validade: { mes: 6, ano: 2027 } },
      { produto: c, preco: 9.0, validade: { mes: 6, ano: 2027 } },
    ];
    // filtro que TODOS atendem: "vence depois de 01/2026" — decorativo
    const filtroInutil: Condicao = { campo: "validade", operador: "maiorOuIgual", valor: 2026 * 12 + 1,
      texto: "vencem depois de 01/2026", resumo: "Depois de 01/2026" };
    const maisCaro: Condicao = { campo: "preco", operador: "maximo",
      texto: "tem o maior preço", resumo: "Maior preço" };
    const q = {
      id: "vp-filtro-inutil", tipo: "filtroComparacao", modalidade: "quadro",
      produtos, condicoes: [filtroInutil, maisCaro], correta: 2,
      camposVisiveis: ["preco", "validade", "conteudo"], camposExigidos: ["preco", "validade"],
      pergunta: "Entre os que vencem depois de 01/2026, qual tem o maior preço?",
      assinatura: "vp-filtro-inutil", categoria: a.categoria,
    } as unknown as Questao;
    const { filtrados } = avaliarEmEtapas(produtos, [filtroInutil, maisCaro]);
    expect(filtrados.length, "o cenário precisa ter filtro que não exclui").toBe(3);
    expect(motivoInvalidez(q)).toBe("filtroNaoFiltra");
  });
});

describe("VP — rótulo que contém outro rótulo (pergunta dela: 'em Informação em Foco tem a ver?')", () => {
  // Ela perguntou se o defeito de Ordem da História — pergunta sem resposta dedutível — existe
  // aqui. A resposta medida: em forma muito mais branda, porque este exercício lê DADO TABULADO
  // e não interpretação de imagem. O único caso achado em 3.000 questões: "qual é do tipo
  // desnatado?" com "semidesnatado" no quadro — o paciente hesita sobre a PALAVRA, não sobre a
  // informação, e isso é a ambiguidade de linguagem que ela proíbe na §18.
  it("nenhuma pergunta de tipo tem outro rótulo que a contenha", () => {
    _resetIds();
    const rnd = lcg(80808);
    const snap = criarSnapshot(rnd);
    let perguntasDeTipo = 0;
    for (let i = 0; i < 3000; i++) {
      const t = TIPOS_QUESTAO[i % TIPOS_QUESTAO.length];
      const r = gerarQuestao(t, paramsDoNivel(6), snap, rnd, [], [t]);
      if (!r.questao) continue;
      for (const c of r.questao.condicoes) {
        if (c.campo !== "tipo" || c.operador !== "igual") continue;
        perguntasDeTipo++;
        const pedido = String(c.valor).toLowerCase();
        const confuso = r.questao.produtos.find((pq) => {
          const t2 = pq.produto.tipo?.toLowerCase();
          return t2 != null && t2 !== pedido && (t2.includes(pedido) || pedido.includes(t2));
        });
        expect(confuso, `"${r.questao.pergunta}" mostra também "${confuso?.produto.tipo}"`).toBeUndefined();
      }
    }
    expect(perguntasDeTipo, "o teste precisa ter visto perguntas de tipo").toBeGreaterThan(100);
  });

  it("controle: a validação rejeita 'desnatado' convivendo com 'semidesnatado'", () => {
    const desnatado = CATALOGO_PRODUTOS.find((p) => p.tipo === "desnatado");
    const semi = CATALOGO_PRODUTOS.find((p) => p.tipo === "semidesnatado");
    const outro = CATALOGO_PRODUTOS.find((p) => p.categoria === "leites" && p.tipo === "integral");
    expect([desnatado, semi, outro].every(Boolean), "o cenário precisa existir no catálogo").toBe(true);
    const produtos: ProdutoNaQuestao[] = [desnatado!, semi!, outro!].map((produto, i) => ({
      produto, preco: 5 + i, validade: { mes: 6, ano: 2027 },
    }));
    const cond: Condicao = { campo: "tipo", operador: "igual", valor: "desnatado",
      texto: "é do tipo desnatado", resumo: "Desnatado" };
    const q = {
      id: "vp-rotulo", tipo: "localizacao", modalidade: "quadro", produtos, condicoes: [cond],
      correta: 0, camposVisiveis: ["tipo", "preco", "conteudo"], camposExigidos: ["tipo"],
      pergunta: "Qual produto é do tipo desnatado?", assinatura: "vp-rotulo",
      categoria: desnatado!.categoria,
    } as unknown as Questao;
    expect(motivoInvalidez(q)).toBe("rotuloAmbiguo");
  });
});
