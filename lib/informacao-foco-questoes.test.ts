import { describe, it, expect } from "vitest";
import {
  gerarQuestao, montarQuestao, criarSnapshot, validarQuestao, motivoInvalidez,
  labelCampo, valorCampo, temCampo, satisfaz, explicarErro, registroDe, motivoRepeticao,
  TIPOS_QUESTAO, PARAMS_PADRAO,
  type ParametrosQuestao, type Questao, type TipoQuestao, type Snapshot, type RegistroHistorico,
} from "./informacao-foco-questoes";
import { dimensaoDe, produtoPorId } from "@/data/informacao-foco-catalogo";

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
