import { describe, it, expect } from "vitest";
import {
  gerarQuestao, montarQuestao, criarSnapshot, validarQuestao, motivoInvalidez,
  labelCampo, valorCampo, temCampo, satisfaz, explicarErro, registroDe, motivoRepeticao, campoReveladoPor,
  TIPOS_QUESTAO, PARAMS_PADRAO, PESOS_TIPO_POR_NIVEL, sortearModalidade, sortearTipo, tiposDoNivel,
  TIPOS_POR_OPERACAO, operacaoDaQuestao, operacaoDoTipo, operacoesDoNivel, sortearOperacao,
  tipoParaOperacao, paramsDoNivel,
  type ParametrosQuestao, type Questao, type TipoQuestao, type Snapshot, type RegistroHistorico, type Modalidade,
  type Operacao, type Condicao,
} from "./informacao-foco-questoes";
import { dimensaoDe, produtoPorId, CATALOGO_PRODUTOS } from "@/data/informacao-foco-catalogo";

// Gerador determinístico: as falhas se reproduzem.
function rndSeed(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

/** Os 8 níveis de referência (§9 da Fase 3) — aqui só como PARÂMETROS de carga. */
const NIVEIS: ParametrosQuestao[] = [
  { nProdutos: 3, nCampos: 3, nCondicoes: 1, semelhancaDistratores: "baixa", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 3, nCampos: 4, nCondicoes: 1, semelhancaDistratores: "baixa", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 3, nCampos: 4, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: true, ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "alta", valoresProximos: true, ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta", valoresProximos: true, ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta", valoresProximos: true, ordemCamposVariavel: true },
];

/** Uma "sessão" = 10 questões encadeadas, com histórico anti-repetição. */
function simularSessao(params: ParametrosQuestao, rnd: () => number, snap: Snapshot) {
  const historico: RegistroHistorico[] = [];
  const questoes: Questao[] = [];
  let descartadas = 0;
  for (let i = 0; i < 10; i++) {
    const tipo = TIPOS_QUESTAO[i % TIPOS_QUESTAO.length];
    const { questao, descartes } = gerarQuestao(tipo, params, snap, rnd, historico);
    descartadas += descartes.length;
    if (questao) { questoes.push(questao); historico.push(registroDe(questao)); }
  }
  return { questoes, descartadas };
}

/** Mesmo caminho de seleção usado por novaQuestao() no componente. */
function gerarRodadaDoComponente(
  nivel: number, rnd: () => number, snap: Snapshot, historico: RegistroHistorico[], comModalidade = true,
) {
  const anterior = historico[historico.length - 1];
  const modalidade = comModalidade ? sortearModalidade(nivel, rnd) : "quadro";
  const operacao = modalidade === "quadro" ? sortearOperacao(nivel, rnd, anterior?.operacao) : null;
  const tipo = modalidade === "situacao" ? "situacao"
    : modalidade === "embalagem" ? "leituraEmbalagem"
      : tipoParaOperacao(operacao!, nivel, rnd, anterior?.campoPrincipal);
  return gerarQuestao(tipo, paramsDoNivel(nivel), snap, rnd, historico, tiposDoNivel(nivel));
}

describe("Gerador de questões — invariantes em massa", () => {
  it("500 sessões por nível: toda questão gerada é válida e tem UMA resposta correta", () => {
    let total = 0;
    for (let nivel = 0; nivel < NIVEIS.length; nivel++) {
      const rnd = rndSeed(1000 + nivel);
      const snap = criarSnapshot(rnd);
      for (let s = 0; s < 500; s++) {
        const { questoes } = simularSessao(NIVEIS[nivel], rnd, snap);
        expect(questoes.length, `nível ${nivel + 1}: sessão sem questões`).toBeGreaterThan(0);
        for (const q of questoes) {
          total++;
          expect(motivoInvalidez(q), `nível ${nivel + 1} · ${q.tipo} · ${q.pergunta}`).toBeNull();
        }
      }
    }
    expect(total).toBeGreaterThan(20000);
  }, 120_000);

  it("nunca gera os absurdos que ela viu em produção", () => {
    const rnd = rndSeed(7);
    const snap = criarSnapshot(rnd);
    for (let nivel = 0; nivel < NIVEIS.length; nivel++) {
      for (let s = 0; s < 60; s++) {
        for (const q of simularSessao(NIVEIS[nivel], rnd, snap).questoes) {
          for (const pq of q.produtos) {
            const p = pq.produto;
            // chá com lactose / lasanha com sabor / qualquer atributo fora de lugar
            if (q.camposVisiveis.includes("lactose")) expect(p.lactose, `${p.id} sem lactose no catálogo`).not.toBeNull();
            if (q.camposVisiveis.includes("sabor")) expect(p.sabor, `${p.id} sem sabor no catálogo`).toBeTruthy();
            expect(["cha-camomila", "cha-verde"].includes(p.id) && q.camposVisiveis.includes("lactose")).toBe(false);
            expect(p.id === "lasanha" && q.camposVisiveis.includes("sabor")).toBe(false);
            // leite e azeite nunca em gramas
            if (["leite-integral", "leite-desnatado", "leite-sem-lactose", "leite-semidesnatado", "azeite", "oleo-soja"].includes(p.id)) {
              expect(dimensaoDe(p.conteudo.unidade), `${p.id} deveria ser volume`).toBe("volume");
              expect(labelCampo("conteudo", p)).toBe("Volume");
            }
          }
        }
      }
    }
  }, 60_000);

  it("o rótulo do conteúdo acompanha a dimensão (Peso/Volume/Quantidade)", () => {
    expect(labelCampo("conteudo", produtoPorId("arroz"))).toBe("Peso");
    expect(labelCampo("conteudo", produtoPorId("leite-integral"))).toBe("Volume");
    expect(labelCampo("conteudo", produtoPorId("shoyu"))).toBe("Volume");
    expect(labelCampo("conteudo", produtoPorId("ovos"))).toBe("Quantidade");
  });

  it("os valores exibidos vêm do catálogo — nunca inventados", () => {
    const rnd = rndSeed(11);
    const snap = criarSnapshot(rnd);
    for (let i = 0; i < 400; i++) {
      const { questao } = gerarQuestao(TIPOS_QUESTAO[i % TIPOS_QUESTAO.length], NIVEIS[3], snap, rnd);
      if (!questao) continue;
      for (const pq of questao.produtos) {
        const oficial = produtoPorId(pq.produto.id)!;
        expect(pq.produto.conteudo).toEqual(oficial.conteudo);
        expect(pq.preco).toBe(snap[pq.produto.id].preco);
        expect(pq.validade).toEqual(snap[pq.produto.id].validade);
        for (const c of questao.camposVisiveis) expect(temCampo(oficial, c), `${pq.produto.id} sem ${c}`).toBe(true);
      }
    }
  });

  it("o mesmo produto mantém conteúdo e preço a sessão inteira (snapshot)", () => {
    const rnd = rndSeed(23);
    const snap = criarSnapshot(rnd);
    const vistos = new Map<string, { conteudo: string; preco: number }>();
    for (let s = 0; s < 200; s++) {
      for (const q of simularSessao(NIVEIS[5], rnd, snap).questoes) {
        for (const pq of q.produtos) {
          const chave = `${pq.produto.conteudo.valor}${pq.produto.conteudo.unidade}`;
          const antes = vistos.get(pq.produto.id);
          if (antes) {
            expect(antes.conteudo, `${pq.produto.id} mudou de conteúdo`).toBe(chave);
            expect(antes.preco, `${pq.produto.id} mudou de preço`).toBe(pq.preco);
          } else vistos.set(pq.produto.id, { conteudo: chave, preco: pq.preco });
        }
      }
    }
    expect(vistos.size).toBeGreaterThan(20);
  }, 60_000);

  it("produtos de uma questão são sempre comparáveis entre si", () => {
    const rnd = rndSeed(31);
    const snap = criarSnapshot(rnd);
    for (let s = 0; s < 300; s++) {
      for (const q of simularSessao(NIVEIS[4], rnd, snap).questoes) {
        const dims = new Set(q.produtos.map((pq) => dimensaoDe(pq.produto.conteudo.unidade)));
        expect(dims.size, `${q.pergunta}`).toBe(1);
        const ids = q.produtos.map((pq) => pq.produto.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  }, 60_000);

  it("não repete a mesma pergunta nas 3 questões seguintes", () => {
    const rnd = rndSeed(43);
    const snap = criarSnapshot(rnd);
    for (let s = 0; s < 300; s++) {
      const { questoes } = simularSessao(NIVEIS[2], rnd, snap);
      for (let i = 3; i < questoes.length; i++) {
        const janela = questoes.slice(i - 3, i).map((q) => q.assinatura);
        expect(janela).not.toContain(questoes[i].assinatura);
      }
    }
  }, 60_000);

  it("os 9 tipos de questão são realmente gerados", () => {
    const rnd = rndSeed(57);
    const snap = criarSnapshot(rnd);
    const feitos = new Set<TipoQuestao>();
    for (const tipo of TIPOS_QUESTAO) {
      for (let i = 0; i < 200 && !feitos.has(tipo); i++) {
        const q = montarQuestao({ tipo, params: NIVEIS[6], snapshot: snap, rnd });
        if (q?.tipo === tipo) feitos.add(tipo);
      }
    }
    expect([...feitos].sort()).toEqual([...TIPOS_QUESTAO].sort());
  }, 60_000);

  it("distratores atendem PARCIALMENTE quando a semelhança é alta", () => {
    const rnd = rndSeed(67);
    const snap = criarSnapshot(rnd);
    let checados = 0;
    for (let i = 0; i < 600; i++) {
      const q = montarQuestao({ tipo: "duasCondicoes", params: NIVEIS[5], snapshot: snap, rnd });
      if (!q) continue;
      checados++;
      q.produtos.forEach((pq, idx) => {
        const atende = q.condicoes.filter((c) => satisfaz(pq, c, q.produtos)).length;
        if (idx === q.correta) expect(atende).toBe(q.condicoes.length);
        else {
          expect(atende).toBeLessThan(q.condicoes.length);
          expect(atende, "distrator de semelhança alta precisa atender a pelo menos uma").toBeGreaterThanOrEqual(1);
        }
      });
    }
    expect(checados).toBeGreaterThan(50);
  }, 60_000);

  it("situação do cotidiano é curta e corresponde aos produtos", () => {
    const rnd = rndSeed(71);
    const snap = criarSnapshot(rnd);
    let vistas = 0;
    for (let i = 0; i < 500; i++) {
      const q = montarQuestao({ tipo: "situacao", params: NIVEIS[4], snapshot: snap, rnd });
      if (!q) continue;
      vistas++;
      expect(q.contexto!.length).toBeLessThan(90);
      expect(q.condicoes.length).toBeLessThanOrEqual(3);
      expect(q.pedido).toBeTruthy();
      // o pedido descreve o produto correto de verdade
      expect(q.condicoes.every((c) => satisfaz(q.produtos[q.correta], c, q.produtos))).toBe(true);
    }
    expect(vistas).toBeGreaterThan(50);
  }, 60_000);

  it("questão inválida é descartada, nunca devolvida", () => {
    const rnd = rndSeed(83);
    const snap = criarSnapshot(rnd);
    const { questao } = gerarQuestao("localizacao", PARAMS_PADRAO, snap, rnd);
    expect(questao && validarQuestao(questao)).toBe(true);
    // adulterando uma questão válida, a validação tem de reprovar
    const q = { ...questao! , correta: (questao!.correta + 1) % questao!.produtos.length };
    expect(validarQuestao(q)).toBe(false);
    expect(motivoInvalidez(q)).toBe("corretaErrada");
  });

  it("valorCampo nunca devolve vazio para campo visível", () => {
    const rnd = rndSeed(97);
    const snap = criarSnapshot(rnd);
    for (let i = 0; i < 500; i++) {
      const { questao } = gerarQuestao(TIPOS_QUESTAO[i % TIPOS_QUESTAO.length], NIVEIS[6], snap, rnd);
      if (!questao) continue;
      for (const pq of questao.produtos) for (const c of questao.camposVisiveis) {
        const v = valorCampo(pq, c);
        expect(v).not.toBe("");
        expect(v).not.toBe("—");   // campo sem dado não pode chegar ao quadro
      }
    }
  }, 60_000);
});

describe("Necessidade dos critérios (C3)", () => {
  it("300 questões de duas condições por nível exigem cada critério e cobrem os distratores", () => {
    for (let nivel = 3; nivel <= 8; nivel++) {
      const rnd = rndSeed(2026091610 + nivel);
      const snap = criarSnapshot(rnd);
      for (let tentativa = 0; tentativa < 300; tentativa++) {
        const { questao: q } = gerarQuestao(
          "duasCondicoes", paramsDoNivel(nivel), snap, rnd, [], ["duasCondicoes"],
        );
        expect(q, `nível ${nivel}, tentativa ${tentativa + 1}`).not.toBeNull();
        expect(q!.condicoes).toHaveLength(2);
        expect(motivoInvalidez(q!)).toBeNull();

        for (const condicao of q!.condicoes) {
          const atendem = q!.produtos.filter((pq) => satisfaz(pq, condicao, q!.produtos));
          expect(atendem.length, `nível ${nivel}: ${condicao.texto}`).toBeGreaterThanOrEqual(2);
          expect(
            atendem.some((pq) => pq !== q!.produtos[q!.correta]),
            `nível ${nivel}: sem distrator para ${condicao.texto}`,
          ).toBe(true);
        }
        const atendemTodas = q!.produtos.filter((pq) =>
          q!.condicoes.every((condicao) => satisfaz(pq, condicao, q!.produtos)));
        expect(atendemTodas).toEqual([q!.produtos[q!.correta]]);
      }
    }
  }, 120_000);

  it("controle negativo detecta uma questão cujo critério isolado já dá a resposta", () => {
    const rnd = rndSeed(2026091620);
    const snap = criarSnapshot(rnd);
    const original = gerarQuestao(
      "duasCondicoes", paramsDoNivel(5), snap, rnd, [], ["duasCondicoes"],
    ).questao!;
    const produtos = original.produtos.map((pq, indice) => ({
      ...pq,
      preco: indice === original.correta ? 1 : 10 + indice,
    }));
    const criterioRedundante: Condicao = {
      campo: "preco", operador: "igual", valor: 1,
      texto: "custa exatamente R$ 1,00", resumo: "R$ 1,00",
    };
    const adulterada: Questao = {
      ...original,
      produtos,
      condicoes: [criterioRedundante, original.condicoes[0]],
    };

    expect(produtos.filter((pq) => satisfaz(pq, criterioRedundante, produtos))).toHaveLength(1);
    expect(motivoInvalidez(adulterada)).toBe("criterioRedundante");
  });

  it("300 questões de três condições nos níveis 7 e 8 exigem cada critério", () => {
    for (const nivel of [7, 8]) {
      const rnd = rndSeed(2026091630 + nivel);
      const snap = criarSnapshot(rnd);
      for (let tentativa = 0; tentativa < 300; tentativa++) {
        const { questao: q } = gerarQuestao(
          "tresCondicoes", paramsDoNivel(nivel), snap, rnd, [], ["tresCondicoes"],
        );
        expect(q, `nível ${nivel}, tentativa ${tentativa + 1}`).not.toBeNull();
        expect(q!.condicoes).toHaveLength(3);
        expect(motivoInvalidez(q!)).toBeNull();
        for (const condicao of q!.condicoes) {
          expect(q!.produtos.filter((pq) => satisfaz(pq, condicao, q!.produtos)).length,
            `nível ${nivel}: ${condicao.texto}`).toBeGreaterThanOrEqual(2);
        }
        expect(q!.produtos.filter((pq) =>
          q!.condicoes.every((condicao) => satisfaz(pq, condicao, q!.produtos)))).toHaveLength(1);
      }
    }
  }, 120_000);

  it("mantém pelo menos 80% da taxa anterior e menos de 5% de null por nível", () => {
    const anteriores: Record<number, number> = {
      3: 254, 4: 129, 5: 164, 6: 277, 7: 264, 8: 294,
    };
    for (let nivel = 3; nivel <= 8; nivel++) {
      const rndDireto = rndSeed(2026091600 + nivel);
      const snapDireto = criarSnapshot(rndDireto);
      let validas = 0;
      for (let tentativa = 0; tentativa < 300; tentativa++) {
        const q = montarQuestao({
          tipo: "duasCondicoes", params: paramsDoNivel(nivel), snapshot: snapDireto, rnd: rndDireto,
        });
        if (q && motivoInvalidez(q) === null) validas++;
      }
      expect(validas, `taxa direta nível ${nivel}`).toBeGreaterThanOrEqual(Math.ceil(anteriores[nivel] * 0.8));

      const rndPublico = rndSeed(2026091650 + nivel);
      const snapPublico = criarSnapshot(rndPublico);
      let nulas = 0;
      for (let tentativa = 0; tentativa < 500; tentativa++) {
        const { questao } = gerarQuestao(
          "duasCondicoes", paramsDoNivel(nivel), snapPublico, rndPublico, [], ["duasCondicoes"],
        );
        if (!questao) nulas++;
      }
      console.info(`C3 nível ${nivel}: válidas=${validas}/300; null=${nulas}/500`);
      expect(nulas / 500, `null nível ${nivel}`).toBeLessThan(0.05);
    }
  }, 120_000);
});

// Amostra para conferência humana — roda junto com os testes e atualiza o arquivo.
describe("Amostra de questões geradas", () => {
  it("grava exemplos reais em docs/auditoria", () => {
    const fs = require("node:fs") as typeof import("node:fs");
    const rnd = rndSeed(2026);
    const snap = criarSnapshot(rnd);
    const blocos: string[] = [];
    for (const tipo of TIPOS_QUESTAO) {
      for (const nivel of [0, 3, 6]) {
        const { questao: q } = gerarQuestao(tipo, NIVEIS[nivel], snap, rnd);
        if (!q || q.tipo !== tipo) continue;
        const linhas = q.produtos.map((pq, i) => {
          const campos = q.camposVisiveis.map((c) => `${labelCampo(c, pq.produto)}: ${valorCampo(pq, c)}`).join(" · ");
          return `  ${i === q.correta ? "✅" : "  "} **${pq.produto.nome}** (${pq.produto.marca || "sem marca"}) — ${campos}`;
        }).join("\n");
        blocos.push(
          `### ${tipo} · nível ${nivel + 1}\n\n` +
          (q.contexto ? `> **SITUAÇÃO DO COTIDIANO**\n> ${q.contexto}\n> Pedido: ${q.pedido}\n\n` : "") +
          `**${q.pergunta}**\n\n${linhas}\n\n_Explicação:_ ${q.explicacao}\n_Pista:_ ${q.pista}\n`);
        break;
      }
    }
    const doc = `# Informação em Foco — exemplos gerados automaticamente\n\n` +
      `Gerado por \`lib/informacao-foco-questoes.test.ts\` (semente fixa 2026), a partir do catálogo\n` +
      `oficial. ✅ marca a resposta correta. Nenhum valor aqui foi inventado pelo gerador.\n\n` +
      blocos.join("\n---\n\n");
    fs.mkdirSync("docs/auditoria", { recursive: true });
    fs.writeFileSync("docs/auditoria/INFORMACAO-EM-FOCO-EXEMPLOS.md", doc);
    expect(blocos.length).toBeGreaterThanOrEqual(8);
  });
});

describe("Feedback do erro", () => {
  it("diz o que a escolha atende e o que não atende, sem entregar a resposta", () => {
    const rnd = rndSeed(313);
    const snap = criarSnapshot(rnd);
    let checados = 0;
    for (let i = 0; i < 400; i++) {
      const q = montarQuestao({ tipo: "duasCondicoes", params: NIVEIS[5], snapshot: snap, rnd });
      if (!q) continue;
      for (let idx = 0; idx < q.produtos.length; idx++) {
        const txt = explicarErro(q, idx);
        expect(txt.length).toBeGreaterThan(10);
        if (idx !== q.correta) {
          checados++;
          // nunca cita o produto certo no feedback da tentativa errada
          expect(txt.includes(q.produtos[q.correta].produto.nome)).toBe(false);
          expect(txt.startsWith(q.produtos[idx].produto.nome)).toBe(true);
        }
      }
    }
    expect(checados).toBeGreaterThan(100);
  }, 60_000);
});

describe("Regra de não repetição (§13)", () => {
  it("numa sessão real: sem texto repetido, sem mesmos campos, sem produto correto seguido, sem 3 do mesmo tipo", () => {
    const rnd = rndSeed(911);
    const snap = criarSnapshot(rnd);
    for (let s = 0; s < 400; s++) {
      const hist: RegistroHistorico[] = [];
      for (let i = 0; i < 10; i++) {
        const tipo = TIPOS_QUESTAO[(i + s) % TIPOS_QUESTAO.length];
        const { questao } = gerarQuestao(tipo, NIVEIS[4], snap, rnd, hist);
        if (!questao) continue;
        expect(motivoRepeticao(questao, hist), `sessão ${s} · questão ${i}`).toBeNull();
        hist.push(registroDe(questao));
      }
      const assinaturas = hist.map((h) => h.assinatura);
      for (const a of new Set(assinaturas)) {
        expect(assinaturas.filter((x) => x === a).length, "no máximo 2 idênticas por sessão").toBeLessThanOrEqual(2);
      }
    }
  }, 90_000);

  it("cada motivo de recusa é detectado", () => {
    const rnd = rndSeed(1013);
    const snap = criarSnapshot(rnd);
    const { questao: q } = gerarQuestao("localizacao", NIVEIS[3], snap, rnd);
    const r = registroDe(q!);
    expect(motivoRepeticao(q!, [r])).toBe("mesmoTextoNas3");
    expect(motivoRepeticao(q!, [{ ...r, assinatura: "outra", camposChave: "x" }])).toBe("mesmoProdutoCorretoSeguido");
    expect(motivoRepeticao(q!, [
      { ...r, assinatura: "a", camposChave: "x", produtoCorreto: "outro" },
      { ...r, assinatura: "b", camposChave: "y", produtoCorreto: "outro2" },
    ])).toBe("tresDoMesmoTipoSeguidas");
  });
});

describe("Leitura direta da embalagem (Fase 2 §9/§10)", () => {
  it("toda frase do catálogo mapeia para um campo do quadro", () => {
    for (const p of CATALOGO_PRODUTOS) {
      for (const f of p.frasesNaEmbalagem ?? []) {
        expect(campoReveladoPor(f), `frase sem campo: "${f}" (${p.id})`).not.toBeNull();
      }
    }
  });

  it("só usa produto autorizado e o quadro NUNCA entrega a resposta", () => {
    const rnd = rndSeed(1201);
    const snap = criarSnapshot(rnd);
    let vistas = 0;
    for (let i = 0; i < 800; i++) {
      const q = montarQuestao({ tipo: "leituraEmbalagem", params: NIVEIS[6], snapshot: snap, rnd });
      if (!q) continue;
      vistas++;
      const alvo = q.produtos[q.correta].produto;
      expect(alvo.directPackageReadingEnabled, `${alvo.id} não autorizado`).toBe(true);
      expect(alvo.revisar ?? false).toBe(false);
      // a frase é do alvo e de mais ninguém
      const frase = String(q.condicoes[0].valor);
      expect(alvo.frasesNaEmbalagem).toContain(frase);
      for (let i2 = 0; i2 < q.produtos.length; i2++) {
        if (i2 === q.correta) continue;
        expect(q.produtos[i2].produto.frasesNaEmbalagem ?? []).not.toContain(frase);
      }
      // o campo que a frase revelaria não está no quadro
      const revelado = campoReveladoPor(frase);
      expect(q.camposVisiveis).not.toContain(revelado);
      expect(q.camposVisiveis).not.toContain("fraseEmbalagem");
      expect(motivoInvalidez(q)).toBeNull();
    }
    expect(vistas).toBeGreaterThan(100);
  }, 90_000);
});

describe("Sorteio controlado da sessão (C1)", () => {
  it("respeita os tipos liberados em 2.000 sorteios de cada nível", () => {
    for (let nivel = 1; nivel <= 8; nivel++) {
      const rnd = rndSeed(1500 + nivel);
      const permitidos = tiposDoNivel(nivel);
      for (let i = 0; i < 2_000; i++) {
        expect(permitidos, `nível ${nivel}`).toContain(sortearTipo(nivel, rnd));
      }
    }
  });

  it("aproxima os pesos declarados no nível 5", () => {
    const rnd = rndSeed(1511);
    const conta: Partial<Record<TipoQuestao, number>> = {};
    const total = 20_000;
    for (let i = 0; i < total; i++) {
      const tipo = sortearTipo(5, rnd);
      conta[tipo] = (conta[tipo] ?? 0) + 1;
    }
    const pesos = PESOS_TIPO_POR_NIVEL[5];
    const somaDosPesos = Object.values(pesos).reduce((soma, peso) => soma + (peso ?? 0), 0);
    for (const tipo of Object.keys(pesos) as TipoQuestao[]) {
      const frequencia = (conta[tipo] ?? 0) / total;
      expect(Math.abs(frequencia - pesos[tipo]! / somaDosPesos), tipo).toBeLessThan(0.03);
    }
  });

  it("deixa de repetir a mesma sequência de 10 atividades", () => {
    const padraoAntigo: Modalidade[] = [
      "quadro", "quadro", "situacao", "quadro", "quadro",
      "embalagem", "quadro", "situacao", "quadro", "quadro",
    ];
    const tipoDoRodizioAntigo = (indice: number, nivel: number): TipoQuestao => {
      const modalidade = padraoAntigo[indice % padraoAntigo.length];
      if (modalidade === "situacao" && nivel >= 5) return "situacao";
      if (modalidade === "embalagem" && nivel >= 6) return "leituraEmbalagem";
      const doQuadro = tiposDoNivel(nivel).filter((tipo) => tipo !== "situacao" && tipo !== "leituraEmbalagem");
      return doQuadro[indice % doQuadro.length];
    };
    const sequenciaAntiga = Array.from({ length: 10 }, (_, indice) => tipoDoRodizioAntigo(indice, 7)).join("|");
    const sequenciasAntigas = new Set<string>();
    const sequenciasNovas = new Set<string>();
    const rnd = rndSeed(1523);
    for (let rodada = 0; rodada < 10_000; rodada++) {
      sequenciasAntigas.add(sequenciaAntiga);
      const sequenciaNova = Array.from({ length: 10 }, () => {
        const modalidade = sortearModalidade(7, rnd);
        return modalidade === "situacao" ? "situacao"
          : modalidade === "embalagem" ? "leituraEmbalagem"
            : sortearTipo(7, rnd);
      }).join("|");
      sequenciasNovas.add(sequenciaNova);
    }
    expect(sequenciasAntigas.size).toBe(1);
    expect(sequenciasNovas.size).toBeGreaterThan(1_000);
  });

  it("preserva a trava contra três tipos iguais seguidos numa sessão de 40 atividades", () => {
    const rnd = rndSeed(1531);
    const snap = criarSnapshot(rnd);
    let historico: RegistroHistorico[] = [];
    const tiposGerados: TipoQuestao[] = [];
    for (let i = 0; i < 40; i++) {
      const modalidade = sortearModalidade(7, rnd);
      const tipo = modalidade === "situacao" ? "situacao"
        : modalidade === "embalagem" ? "leituraEmbalagem"
          : sortearTipo(7, rnd);
      const { questao } = gerarQuestao(tipo, NIVEIS[6], snap, rnd, historico, tiposDoNivel(7));
      expect(questao, `atividade ${i + 1}`).not.toBeNull();
      expect(motivoRepeticao(questao!, historico), `atividade ${i + 1}`).toBeNull();
      tiposGerados.push(questao!.tipo);
      historico = [...historico, registroDe(questao!)].slice(-8);
    }
    for (let i = 2; i < tiposGerados.length; i++) {
      expect(new Set(tiposGerados.slice(i - 2, i + 1)).size, `atividades ${i - 1}-${i + 1}`).toBeGreaterThan(1);
    }
  }, 60_000);

  it("respeita os pisos de nível das modalidades", () => {
    for (let nivel = 1; nivel <= 8; nivel++) {
      const rnd = rndSeed(1540 + nivel);
      for (let i = 0; i < 5_000; i++) {
        const modalidade = sortearModalidade(nivel, rnd);
        if (nivel < 5) expect(modalidade, `nível ${nivel}`).not.toBe("situacao");
        if (nivel < 6) expect(modalidade, `nível ${nivel}`).not.toBe("embalagem");
      }
    }
  });
});

describe("Operação cognitiva como eixo da seleção (C2)", () => {
  it("operacaoDoTipo é coerente com o número e os operadores das condições reais", () => {
    const rnd = rndSeed(2026091501);
    const snap = criarSnapshot(rnd);
    expect(TIPOS_POR_OPERACAO).toEqual({
      buscaDireta: ["localizacao", "validade", "conservacao", "ingredientes", "alergenicos"],
      comparacao: ["comparacao"],
      doisCriterios: ["duasCondicoes"],
      tresCriterios: ["tresCondicoes"],
    });

    for (const tipo of TIPOS_QUESTAO) {
      let q: Questao | null = null;
      for (let tentativa = 0; tentativa < 400 && !q; tentativa++) {
        q = montarQuestao({ tipo, params: paramsDoNivel(8), snapshot: snap, rnd });
      }
      expect(q, tipo).not.toBeNull();
      const declarada = operacaoDoTipo(tipo);
      const real = operacaoDaQuestao(q!);
      if (tipo === "situacao") expect(declarada).toBeNull();
      else expect(real, tipo).toBe(declarada);

      if (real === "buscaDireta") expect(q!.condicoes).toHaveLength(1);
      if (real === "doisCriterios") expect(q!.condicoes).toHaveLength(2);
      if (real === "tresCriterios") expect(q!.condicoes).toHaveLength(3);
      if (real === "comparacao") {
        expect(q!.condicoes).toHaveLength(1);
        expect(["minimo", "maximo"]).toContain(q!.condicoes[0].operador);
      }
    }
  }, 60_000);

  it("a prova central: 200 sessões reais não têm duas ou três operações seguidas; o seletor antigo reprova", () => {
    const rnd = rndSeed(2026091502);
    const snap = criarSnapshot(rnd);
    let sessoesNovasComDuas = 0;
    let sessoesNovasComTres = 0;

    for (let sessao = 0; sessao < 200; sessao++) {
      const historico: RegistroHistorico[] = [];
      const operacoes: Operacao[] = [];
      for (let rodada = 0; rodada < 12; rodada++) {
        const { questao } = gerarRodadaDoComponente(5, rnd, snap, historico);
        expect(questao, `sessão ${sessao + 1}, rodada ${rodada + 1}`).not.toBeNull();
        const real = operacaoDaQuestao(questao!);
        operacoes.push(real);
        historico.push(registroDe(questao!));
        historico.splice(0, Math.max(0, historico.length - 8));
      }
      if (operacoes.some((op, i) => i >= 1 && op === operacoes[i - 1])) sessoesNovasComDuas++;
      if (operacoes.some((op, i) => i >= 2 && op === operacoes[i - 1] && op === operacoes[i - 2])) sessoesNovasComTres++;
    }
    expect(sessoesNovasComDuas).toBe(0);
    expect(sessoesNovasComTres).toBe(0);

    // Controle negativo: o caminho antigo sorteava nomes diretamente e era cego ao
    // fato de cinco deles realizarem a mesma busca direta.
    const rndAntigo = rndSeed(2026091502);
    let sessoesAntigasComTres = 0;
    for (let sessao = 0; sessao < 200; sessao++) {
      const operacoes: Operacao[] = [];
      for (let rodada = 0; rodada < 12; rodada++) {
        const modalidade = sortearModalidade(5, rndAntigo);
        const tipo = modalidade === "situacao" ? "situacao" : sortearTipo(5, rndAntigo);
        operacoes.push(tipo === "situacao" ? "doisCriterios" : operacaoDoTipo(tipo)!);
      }
      if (operacoes.some((op, i) => i >= 2 && op === operacoes[i - 1] && op === operacoes[i - 2])) {
        sessoesAntigasComTres++;
      }
    }
    expect(sessoesAntigasComTres / 200).toBeGreaterThan(0.30);
  }, 120_000);

  it("o nível 2 apresenta pelo menos três operações e inclui dois critérios", () => {
    const rnd = rndSeed(2026091503);
    const snap = criarSnapshot(rnd);
    const historico: RegistroHistorico[] = [];
    const vistas = new Set<Operacao>();
    for (let rodada = 0; rodada < 20; rodada++) {
      const { questao } = gerarRodadaDoComponente(2, rnd, snap, historico, false);
      expect(questao, `rodada ${rodada + 1}`).not.toBeNull();
      vistas.add(operacaoDaQuestao(questao!));
      historico.push(registroDe(questao!));
      historico.splice(0, Math.max(0, historico.length - 8));
    }
    expect(vistas.size).toBeGreaterThanOrEqual(3);
    expect(vistas).toContain("doisCriterios");
    expect(operacoesDoNivel(2)).toEqual(["buscaDireta", "comparacao", "doisCriterios"]);
  }, 60_000);

  it("50.000 sorteios encadeados batem nos alvos vividos dos níveis 1, 5 e 8", () => {
    const alvos: Record<number, Partial<Record<Operacao, number>>> = {
      1: { buscaDireta: 0.55, comparacao: 0.45 },
      5: { buscaDireta: 0.24, comparacao: 0.32, doisCriterios: 0.44 },
      8: { buscaDireta: 0.14, comparacao: 0.24, doisCriterios: 0.38, tresCriterios: 0.24 },
    };
    for (const nivel of [1, 5, 8]) {
      const rnd = rndSeed(2026091510 + nivel);
      const contagem: Partial<Record<Operacao, number>> = {};
      let anterior: Operacao | undefined;
      for (let i = 0; i < 50_000; i++) {
        const operacao = sortearOperacao(nivel, rnd, anterior);
        contagem[operacao] = (contagem[operacao] ?? 0) + 1;
        anterior = operacao;
      }
      for (const [operacao, alvo] of Object.entries(alvos[nivel]) as [Operacao, number][]) {
        const observada = (contagem[operacao] ?? 0) / 50_000;
        expect(Math.abs(observada - alvo), `nível ${nivel}, ${operacao}: ${observada}`).toBeLessThan(0.03);
      }
    }
  });

  it("duas seguidas são raras com fator 0,15, três aceitas são impossíveis e o controle 1,0 reprova", () => {
    const pesos: Record<number, Partial<Record<Operacao, number>>> = {
      1: { buscaDireta: 67, comparacao: 33 },
      2: { buscaDireta: 31, comparacao: 31, doisCriterios: 38 },
      3: { buscaDireta: 25, comparacao: 30, doisCriterios: 45 },
      4: { buscaDireta: 22, comparacao: 29, doisCriterios: 49 },
      5: { buscaDireta: 19, comparacao: 28, doisCriterios: 53 },
      6: { buscaDireta: 16, comparacao: 26, doisCriterios: 57 },
      7: { buscaDireta: 13, comparacao: 24, doisCriterios: 46, tresCriterios: 17 },
      8: { buscaDireta: 11, comparacao: 22, doisCriterios: 45, tresCriterios: 22 },
    };
    const sortearSemEnfraquecer = (nivel: number, rnd: () => number): Operacao => {
      const permitidas = operacoesDoNivel(nivel);
      const total = permitidas.reduce((soma, op) => soma + pesos[nivel][op]!, 0);
      let limite = rnd() * total;
      for (const op of permitidas) {
        limite -= pesos[nivel][op]!;
        if (limite < 0) return op;
      }
      return permitidas[permitidas.length - 1];
    };

    const rndQuestoes = rndSeed(2026091519);
    const snapQuestoes = criarSnapshot(rndQuestoes);
    const tipoPorOperacao: Record<Operacao, TipoQuestao> = {
      buscaDireta: "localizacao", comparacao: "comparacao",
      doisCriterios: "duasCondicoes", tresCriterios: "tresCondicoes",
    };
    const questaoPorOperacao = {} as Record<Operacao, Questao>;
    for (const operacao of Object.keys(tipoPorOperacao) as Operacao[]) {
      for (let tentativa = 0; tentativa < 400 && !questaoPorOperacao[operacao]; tentativa++) {
        const q = montarQuestao({
          tipo: tipoPorOperacao[operacao], params: paramsDoNivel(8), snapshot: snapQuestoes, rnd: rndQuestoes,
        });
        if (q) questaoPorOperacao[operacao] = q;
      }
      expect(questaoPorOperacao[operacao], operacao).toBeTruthy();
    }

    for (let nivel = 1; nivel <= 8; nivel++) {
      const rnd = rndSeed(2026091520 + nivel);
      let anterior: Operacao | undefined;
      let repeticoes = 0;
      const aceitas: Operacao[] = [];
      let historico: RegistroHistorico[] = [];
      for (let i = 0; i < 50_000; i++) {
        const candidata = sortearOperacao(nivel, rnd, anterior);
        if (candidata === anterior) repeticoes++;

        // Isola as regras de operação das demais travas já existentes; em produção,
        // gerarQuestao faz esse mesmo fallback entre tipos quando a candidata é recusada.
        const histOperacoes = historico.map((h, indice) => ({
          ...h,
          assinatura: `hist-${i}-${indice}`,
          camposChave: `campos-${i}-${indice}`,
          produtoCorreto: `produto-${i}-${indice}`,
          campoPrincipal: "fraseEmbalagem" as const,
          categoria: (["leites", "sucos", "iogurtes", "laticinios"] as const)[indice % 4],
        }));
        const ordem = [candidata, ...operacoesDoNivel(nivel).filter((op) => op !== candidata)];
        const aceita = ordem.find((op) => motivoRepeticao(questaoPorOperacao[op], histOperacoes) === null);
        expect(aceita, `fallback nível ${nivel}, sorteio ${i}`).toBeTruthy();
        aceitas.push(aceita!);
        historico = [...historico, registroDe(questaoPorOperacao[aceita!])].slice(-8);
        anterior = aceita;
      }
      const repeticoesAceitas = aceitas.filter((op, i) => i >= 1 && op === aceitas[i - 1]).length;
      expect(repeticoesAceitas / 49_999, `nível ${nivel}`).toBeLessThan(0.15);
      const triplas = aceitas.filter((op, i) => i >= 2 && op === aceitas[i - 1] && op === aceitas[i - 2]).length;
      expect(triplas, `nível ${nivel}`).toBe(0);

      const rndControle = rndSeed(2026091520 + nivel);
      let anteriorControle: Operacao | undefined;
      let repeticoesControle = 0;
      for (let i = 0; i < 50_000; i++) {
        const operacao = sortearSemEnfraquecer(nivel, rndControle);
        if (operacao === anteriorControle) repeticoesControle++;
        anteriorControle = operacao;
      }
      expect(repeticoesControle / 49_999, `controle nível ${nivel}`).toBeGreaterThan(0.25);
      expect(repeticoes, `fator 0,15 nível ${nivel}`).toBeLessThan(repeticoesControle);
    }
  });

  it("500 questões reais mantêm null abaixo de 2% e descartes por entrega abaixo de 15", () => {
    const rnd = rndSeed(2026091530);
    const snap = criarSnapshot(rnd);
    const historico: RegistroHistorico[] = [];
    let nulas = 0;
    let entregues = 0;
    let descartes = 0;
    for (let rodada = 0; rodada < 500; rodada++) {
      const resultado = gerarRodadaDoComponente(5, rnd, snap, historico);
      descartes += resultado.descartes.length;
      if (!resultado.questao) {
        nulas++;
        continue;
      }
      entregues++;
      historico.push(registroDe(resultado.questao));
      historico.splice(0, Math.max(0, historico.length - 8));
    }
    const taxaNull = nulas / 500;
    const descartesPorEntregue = descartes / entregues;
    console.info(`C2 geração nível 5: null=${nulas}/500 (${(taxaNull * 100).toFixed(2)}%); descartes/entregue=${descartesPorEntregue.toFixed(3)}`);
    expect(taxaNull).toBeLessThan(0.02);
    expect(descartesPorEntregue).toBeLessThan(15);
  }, 120_000);

  it("detecta os três novos motivos sem perder a precedência das regras antigas", () => {
    const rnd = rndSeed(2026091540);
    const snap = criarSnapshot(rnd);
    const q = gerarQuestao("localizacao", paramsDoNivel(5), snap, rnd).questao!;
    const r = registroDe(q);
    const livre = {
      ...r, assinatura: "outra", camposChave: "outros", produtoCorreto: "outro-produto",
      categoria: "sucos" as const, tipo: "validade" as const,
    };
    expect(motivoRepeticao(q, [{ ...livre, campoPrincipal: "preco" }])).toBe("mesmaOperacaoSeguida");
    expect(motivoRepeticao(q, [
      { ...livre, assinatura: "a", campoPrincipal: "preco", tipo: "validade" },
      { ...livre, assinatura: "b", campoPrincipal: "validade", tipo: "conservacao" },
    ])).toBe("tresDaMesmaOperacao");
    expect(motivoRepeticao(q, [{
      ...livre, operacao: "comparacao", campoPrincipal: r.campoPrincipal,
    }])).toBe("mesmoCampoPrincipalSeguido");
  });
});

describe("Quadro funcional (Fase 2 §6)", () => {
  it("não repete no quadro o que o nome do produto já diz", () => {
    const rnd = rndSeed(1409);
    const snap = criarSnapshot(rnd);
    for (let i = 0; i < 600; i++) {
      const { questao: q } = gerarQuestao(TIPOS_QUESTAO[i % TIPOS_QUESTAO.length], NIVEIS[6], snap, rnd);
      if (!q) continue;
      for (const campo of ["tipo", "sabor"] as const) {
        if (!q.camposVisiveis.includes(campo) || q.camposExigidos.includes(campo)) continue;
        const todosRedundantes = q.produtos.every((pq) => {
          const v = campo === "tipo" ? pq.produto.tipo : pq.produto.sabor;
          return !!v && pq.produto.nome.toLowerCase().includes(v.toLowerCase());
        });
        expect(todosRedundantes, `${campo} redundante no quadro: ${q.produtos.map((p) => p.produto.nome).join(", ")}`).toBe(false);
      }
    }
  }, 60_000);
});
