// Prova adversarial do VP sobre a C3. Reproduz a medição que revelou o defeito que ELA achou
// jogando: "algumas perguntas estão rotuladas como multi_criteria, porém um único critério já
// basta para descobrir a resposta". Medido antes: 100% (níveis 3-5) e 89-90% (níveis 6-8).
import { describe, expect, it } from "vitest";
import {
  gerarQuestao, paramsDoNivel, criarSnapshot, satisfaz, motivoInvalidez, _resetIds,
  type TipoQuestao, type Questao, type ProdutoNaQuestao, type Condicao,
} from "./informacao-foco-questoes";
import { CATALOGO_PRODUTOS } from "@/data/informacao-foco-catalogo";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

/** Quantos produtos cada condição deixa SOZINHA, e quantos deixam todas juntas. */
function necessidade(q: Questao) {
  const isolados = q.condicoes.map((c) => q.produtos.filter((p) => satisfaz(p, c, q.produtos)).length);
  const juntos = q.produtos.filter((p) => q.condicoes.every((c) => satisfaz(p, c, q.produtos))).length;
  return { isolados, juntos };
}

describe("VP — a regra de necessidade dela, medida em questões reais", () => {
  it.each([3, 4, 5, 6, 7, 8])(
    "nível %i: NENHUMA questão de dois critérios tem critério dispensável", (nivel) => {
    _resetIds();
    const rnd = lcg(31337 + nivel);
    const snap = criarSnapshot(rnd);
    let geradas = 0;
    for (let i = 0; i < 300; i++) {
      const r = gerarQuestao("duasCondicoes", paramsDoNivel(nivel), snap, rnd, [], ["duasCondicoes"]);
      if (!r.questao) continue;
      geradas++;
      const { isolados, juntos } = necessidade(r.questao);
      // a regra dela, literal: cada critério sozinho deixa 2+, os dois juntos deixam 1
      expect(Math.min(...isolados), `"${r.questao.pergunta}" isolados=[${isolados}]`).toBeGreaterThanOrEqual(2);
      expect(juntos, r.questao.pergunta).toBe(1);
    }
    expect(geradas, "a geração não pode ter morrido").toBeGreaterThan(250);
  });

  it("três critérios: nenhum dos três é dispensável", () => {
    _resetIds();
    const rnd = lcg(80808);
    const snap = criarSnapshot(rnd);
    let geradas = 0;
    for (let i = 0; i < 200; i++) {
      const r = gerarQuestao("tresCondicoes", paramsDoNivel(8), snap, rnd, [], ["tresCondicoes"]);
      if (!r.questao) continue;
      geradas++;
      const { isolados, juntos } = necessidade(r.questao);
      expect(isolados).toHaveLength(3);
      expect(Math.min(...isolados)).toBeGreaterThanOrEqual(2);
      expect(juntos).toBe(1);
    }
    expect(geradas).toBeGreaterThan(150);
  });

  // 🔴 CONTROLE NEGATIVO: sem ele, os testes acima poderiam passar só porque o gerador
  // nunca produz o caso ruim. Aqui o caso ruim é CONSTRUÍDO à mão — é a pergunta que ELA
  // viu na tela: um critério que sozinho já identifica a resposta.
  it("controle: a validação REJEITA o caso que ela encontrou", () => {
    const [a, b, c] = CATALOGO_PRODUTOS.filter((p) => p.categoria === "leites").slice(0, 3);
    const produtos: ProdutoNaQuestao[] = [
      { produto: a, preco: 12.90, validade: { mes: 6, ano: 2027 } },
      { produto: b, preco: 18.90, validade: { mes: 6, ano: 2027 } },
      { produto: c, preco: 11.90, validade: { mes: 6, ano: 2027 } },
    ];
    // "custa até R$ 13,50" deixa 2 (a, c) — critério legítimo.
    const preco: Condicao = { campo: "preco", operador: "menorOuIgual", valor: 13.5,
      texto: "custa até R$ 13,50", resumo: "Até R$ 13,50" };
    // "é do tipo <o de A>" deixa só A se os três tipos forem distintos — critério REDUNDANTE.
    const tipo: Condicao = { campo: "tipo", operador: "igual", valor: a.tipo,
      texto: `é do tipo ${a.tipo}`, resumo: String(a.tipo) };
    const soUmAtendeOTipo = produtos.filter((p) => satisfaz(p, tipo, produtos)).length === 1;
    expect(soUmAtendeOTipo, "o cenário do controle precisa ter o critério redundante").toBe(true);

    const q = {
      id: "vp-controle", tipo: "duasCondicoes" as TipoQuestao, modalidade: "quadro" as const,
      produtos, condicoes: [preco, tipo], correta: 0,
      camposVisiveis: ["preco", "tipo", "conteudo"], camposExigidos: ["preco", "tipo"],
      pergunta: "Qual produto custa até R$ 13,50 e é do tipo X?", assinatura: "vp-controle",
      categoria: a.categoria,
    } as unknown as Questao;

    expect(motivoInvalidez(q), "a validação TEM de rejeitar critério redundante")
      .toBe("criterioRedundante");
  });

  it("controle 2: a mesma questão com os dois critérios necessários NÃO é rejeitada por isso", () => {
    const [a, b, c] = CATALOGO_PRODUTOS.filter((p) => p.categoria === "leites").slice(0, 3);
    const produtos: ProdutoNaQuestao[] = [
      { produto: a, preco: 12.90, validade: { mes: 6, ano: 2027 } },
      { produto: b, preco: 18.90, validade: { mes: 6, ano: 2027 } },
      { produto: c, preco: 11.90, validade: { mes: 6, ano: 2027 } },
    ];
    const preco: Condicao = { campo: "preco", operador: "menorOuIgual", valor: 13.5,
      texto: "custa até R$ 13,50", resumo: "Até R$ 13,50" };
    // condição que A e B atendem (e C não): agora os DOIS critérios são necessários
    const caro: Condicao = { campo: "preco", operador: "maiorOuIgual", valor: 12.0,
      texto: "custa ao menos R$ 12,00", resumo: "≥ R$ 12,00" };
    const mA = produtos.filter((p) => satisfaz(p, preco, produtos)).length;
    const mB = produtos.filter((p) => satisfaz(p, caro, produtos)).length;
    const mAB = produtos.filter((p) => satisfaz(p, preco, produtos) && satisfaz(p, caro, produtos)).length;
    expect([mA, mB, mAB]).toEqual([2, 2, 1]);   // exatamente o exemplo que ela deu
  });

  it("cada critério tem um distrator que o atende — o erro do paciente vira informação", () => {
    _resetIds();
    const rnd = lcg(99001);
    const snap = criarSnapshot(rnd);
    for (let i = 0; i < 200; i++) {
      const r = gerarQuestao("duasCondicoes", paramsDoNivel(6), snap, rnd, [], ["duasCondicoes"]);
      if (!r.questao) continue;
      const q = r.questao;
      const correto = q.produtos[q.correta];
      for (const c of q.condicoes) {
        const outrosQueAtendem = q.produtos.filter((p) => p !== correto && satisfaz(p, c, q.produtos));
        expect(outrosQueAtendem.length, `"${c.texto}" precisa de distrator que a atenda`)
          .toBeGreaterThanOrEqual(1);
      }
    }
  });
});
