import { describe, expect, it } from "vitest";
import { CATALOGO_PRODUTOS } from "@/data/informacao-foco-catalogo";
import {
  PESOS_OPERACAO_POR_NIVEL, criarSnapshot, explicarErro, gerarQuestao, montarQuestao,
  motivoInvalidez, operacaoDaQuestao, operacaoDoTipo, operacoesDoNivel, paramsDoNivel,
  satisfaz, sortearOperacao, tiposDoNivel,
  type Condicao, type Operacao, type ProdutoNaQuestao, type Questao,
} from "./informacao-foco-questoes";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

const quantasAtende = (q: Questao, produto: ProdutoNaQuestao) =>
  q.condicoes.filter((condicao) => satisfaz(produto, condicao, q.produtos)).length;

describe("C5 — exclusão verdadeira", () => {
  it.each([4, 5, 6, 7, 8])(
    "nível %i: 300 questões têm XOR único e não são redutíveis", (nivel) => {
      const rnd = lcg(2026092200 + nivel);
      const snapshot = criarSnapshot(rnd);
      for (let tentativa = 0; tentativa < 300; tentativa++) {
        const { questao } = gerarQuestao(
          "exclusaoParcial", paramsDoNivel(nivel), snapshot, rnd, [], ["exclusaoParcial"],
        );
        expect(questao, `nível ${nivel}, tentativa ${tentativa + 1}`).not.toBeNull();
        const q = questao!;
        const alvo = q.produtos[q.correta];
        const xor = q.produtos.filter((produto) => quantasAtende(q, produto) === 1);
        expect(xor).toEqual([alvo]);
        expect(q.produtos.filter((produto) => produto !== alvo).every(
          (produto) => [0, 2].includes(quantasAtende(q, produto)),
        )).toBe(true);

        for (const condicao of q.condicoes) {
          const atendem = q.produtos.filter((produto) => satisfaz(produto, condicao, q.produtos));
          const naoAtendem = q.produtos.filter((produto) => !satisfaz(produto, condicao, q.produtos));
          expect(atendem).not.toEqual([alvo]);
          expect(naoAtendem).not.toEqual([alvo]);
        }
        expect(motivoInvalidez(q)).toBeNull();
        expect(operacaoDaQuestao(q)).toBe("exclusao");
        expect(q.pergunta).toMatch(
          /^Precisamos de um produto que .+ e .+\. Qual destes atende a APENAS UMA dessas exigências\?$/,
        );
        expect(q.pergunta).not.toMatch(/não atende|exceto|fica de fora/i);
      }
    }, 120_000,
  );

  it("controle negativo: exclusão em que A sozinho isola o alvo é rejeitada", () => {
    const produtos: ProdutoNaQuestao[] = CATALOGO_PRODUTOS
      .filter((produto) => produto.categoria === "leites")
      .slice(0, 4)
      .map((produto, indice) => ({
        produto, preco: indice === 0 ? 5 : 15 + indice, validade: { mes: 6, ano: 2027 },
      }));
    const condicoes: [Condicao, Condicao] = [
      { campo: "preco", operador: "menorOuIgual", valor: 10, texto: "custa até R$ 10,00", resumo: "Até R$ 10,00" },
      { campo: "validade", operador: "maior", valor: 2100 * 12, texto: "vence depois de 2100", resumo: "Depois de 2100" },
    ];
    const q = {
      id: "c5-redutivel", tipo: "exclusaoParcial", modalidade: "quadro",
      pergunta: "Precisamos de um produto que custa até R$ 10,00 e vence depois de 2100. Qual destes atende a APENAS UMA dessas exigências?",
      produtos, correta: 0, condicoes, camposVisiveis: ["conteudo", "preco", "validade"],
      camposExigidos: ["preco", "validade"], explicacao: "", pista: "",
      categoria: produtos[0].produto.categoria, assinatura: "c5-redutivel",
    } as Questao;

    expect(produtos.filter((produto) => satisfaz(produto, condicoes[0], produtos))).toEqual([produtos[0]]);
    expect(produtos.filter((produto) => quantasAtende(q, produto) === 1)).toEqual([produtos[0]]);
    expect(motivoInvalidez(q)).toBe("exclusaoRedutivel");
  });

  it("controle da formulação antiga: as 12 configurações com um único fora do E são redutíveis", () => {
    let configuracoes = 0;
    let redutiveis = 0;
    for (let alvo = 0; alvo < 4; alvo++) {
      for (const falhaDoAlvo of [[false, false], [false, true], [true, false]] as const) {
        const valores = Array.from({ length: 4 }, (_, indice) =>
          indice === alvo ? falhaDoAlvo : [true, true] as const);
        expect(valores.filter(([a, b]) => !(a && b))).toHaveLength(1);
        configuracoes++;
        const conjuntos = [
          valores.map(([a]) => a), valores.map(([, b]) => b),
          valores.map(([a]) => !a), valores.map(([, b]) => !b),
        ];
        if (conjuntos.some((conjunto) =>
          conjunto.filter(Boolean).length === 1 && conjunto[alvo])) redutiveis++;
      }
    }
    expect(configuracoes).toBe(12);
    expect(redutiveis).toBe(12);
  });

  it("tipo, operação, níveis e pesos obedecem ao contrato da C5", () => {
    expect(operacaoDoTipo("exclusaoParcial")).toBe("exclusao");
    expect(operacoesDoNivel(3)).not.toContain("exclusao");
    expect(tiposDoNivel(3)).not.toContain("exclusaoParcial");
    for (let nivel = 4; nivel <= 8; nivel++) {
      expect(operacoesDoNivel(nivel)).toContain("exclusao");
      expect(tiposDoNivel(nivel)).toContain("exclusaoParcial");
      const pesos = PESOS_OPERACAO_POR_NIVEL[nivel];
      expect(Object.values(pesos).reduce((soma, peso) => soma + peso, 0)).toBeCloseTo(100, 5);
      expect(pesos.exclusao).toBe(({ 4: 10, 5: 14, 6: 17, 7: 18, 8: 20 } as Record<number, number>)[nivel]);
    }
  });

  it.each([4, 5, 6, 7, 8])("nível %i: geração direta fica abaixo de 5% de null", (nivel) => {
    const rnd = lcg(2026092250 + nivel);
    const snapshot = criarSnapshot(rnd);
    let nulas = 0;
    for (let tentativa = 0; tentativa < 300; tentativa++) {
      if (!montarQuestao({ tipo: "exclusaoParcial", params: paramsDoNivel(nivel), snapshot, rnd })) nulas++;
    }
    console.info(`C5 nível ${nivel}: null=${nulas}/300 (${(nulas / 3).toFixed(1)}%)`);
    expect(nulas / 300).toBeLessThan(0.05);
  }, 120_000);

  it("feedback é curto e a distribuição encadeada por nível é medida", () => {
    const rndQuestao = lcg(2026092280);
    const snapshot = criarSnapshot(rndQuestao);
    const q = gerarQuestao(
      "exclusaoParcial", paramsDoNivel(6), snapshot, rndQuestao, [], ["exclusaoParcial"],
    ).questao!;
    for (const [indice, produto] of q.produtos.entries()) {
      if (indice === q.correta) continue;
      const esperado = quantasAtende(q, produto) === 2
        ? `${produto.produto.nome} cumpre as duas exigências.`
        : `${produto.produto.nome} não cumpre nenhuma das exigências.`;
      expect(explicarErro(q, indice)).toBe(esperado);
    }

    for (let nivel = 4; nivel <= 8; nivel++) {
      const rnd = lcg(2026092290 + nivel);
      const contagem: Partial<Record<Operacao, number>> = {};
      let anterior: Operacao | undefined;
      for (let i = 0; i < 20_000; i++) {
        const operacao = sortearOperacao(nivel, rnd, anterior);
        contagem[operacao] = (contagem[operacao] ?? 0) + 1;
        anterior = operacao;
      }
      const distribuicao = Object.fromEntries(operacoesDoNivel(nivel).map(
        (operacao) => [operacao, `${(((contagem[operacao] ?? 0) / 20_000) * 100).toFixed(1)}%`],
      ));
      console.info(`C5 distribuição vivida nível ${nivel}: ${JSON.stringify(distribuicao)}`);
      expect(contagem.exclusao ?? 0).toBeGreaterThan(0);
    }
  });
});
