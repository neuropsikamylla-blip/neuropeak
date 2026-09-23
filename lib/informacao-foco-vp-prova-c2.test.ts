// Prova adversarial do VP sobre a C2. Não confia nos testes do Codex: reproduz a MEDIÇÃO
// da auditoria (docs/informacao-em-foco/AUDITORIA-SELETOR-20260915.md) sobre a engine real,
// classificando cada rodada pela OPERAÇÃO que as condições geradas exigem — nunca pelo nome
// do tipo, que foi o erro que criou este problema.
import { describe, expect, it } from "vitest";
import {
  gerarQuestao, paramsDoNivel, criarSnapshot, tiposDoNivel, sortearOperacao, tipoParaOperacao,
  sortearModalidade, registroDe, operacoesDoNivel, _resetIds,
  type RegistroHistorico, type TipoQuestao, type Operacao, type Questao,
} from "./informacao-foco-questoes";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

/** A operação REAL, lida das condições. É esta leitura que a auditoria usou. */
function operacaoReal(q: Questao): string {
  if (q.tipo === "exclusaoParcial") return "EXCLUSAO";
  if (q.condicoes.length >= 2 && q.condicoes.some(
    (c) => c.operador === "minimo" || c.operador === "maximo",
  )) return "FILTRO_COMPARACAO";
  if (q.condicoes.length === 1) {
    const op = q.condicoes[0].operador;
    return op === "minimo" || op === "maximo" ? "COMPARACAO" : "BUSCA_DIRETA";
  }
  return `CRITERIOS_${q.condicoes.length}`;
}

/** Roda sessões como o componente roda, e devolve a operação real de cada rodada. */
function sessoes(nivel: number, nSessoes: number, porSessao: number): string[][] {
  const todas: string[][] = [];
  for (let s = 0; s < nSessoes; s++) {
    _resetIds();
    const rnd = lcg(9000 + s);
    const snap = criarSnapshot(rnd);
    let hist: RegistroHistorico[] = [];
    let opAnt: Operacao | undefined;
    const ops: string[] = [];
    for (let i = 0; i < porSessao; i++) {
      const m = sortearModalidade(nivel, rnd);
      let t: TipoQuestao;
      if (m === "situacao") t = "situacao";
      else if (m === "embalagem") t = "leituraEmbalagem";
      else { const op = sortearOperacao(nivel, rnd, opAnt); t = tipoParaOperacao(op, nivel, rnd); opAnt = op; }
      const r = gerarQuestao(t, paramsDoNivel(nivel), snap, rnd, hist, tiposDoNivel(nivel));
      if (r.questao) { hist = [...hist, registroDe(r.questao)].slice(-8); ops.push(operacaoReal(r.questao)); }
    }
    todas.push(ops);
  }
  return todas;
}

const maiorCorrida = (ops: string[]) => {
  let mx = 1, c = 1;
  for (let i = 1; i < ops.length; i++) { if (ops[i] === ops[i - 1]) { c++; mx = Math.max(mx, c); } else c = 1; }
  return ops.length ? mx : 0;
};

describe("VP — a queixa dela, medida na engine real", () => {
  // Ela jogou a v3.31.0 e disse: "ainda estou basicamente fazendo ler pergunta → olhar a mesma
  // linha nos 3 cards → escolher". A auditoria mediu a causa: 53% das sessões tinham 3+ rodadas
  // seguidas da MESMA operação, com até 6 seguidas.
  it.each([2, 5, 7])("nível %i: NENHUMA sessão repete a operação em rodadas seguidas", (nivel) => {
    const todas = sessoes(nivel, 200, 12);
    const com3 = todas.filter((ops) => maiorCorrida(ops) >= 3).length;
    const com2 = todas.filter((ops) => maiorCorrida(ops) >= 2).length;
    expect(com3, "sessões com 3+ seguidas (eram 53% no nível 5)").toBe(0);
    expect(com2, "sessões com 2+ seguidas").toBe(0);
    expect(Math.max(...todas.map(maiorCorrida)), "maior corrida (era 6)").toBe(1);
  });

  // O nível 2 é onde ela estava testando, e onde só existiam DUAS operações — ambas de uma
  // linha só. Ela pediu: "No nível 2 que estou testando agora, eu já quero VARIAÇÃO."
  it("o nível 2 entrega 3 operações distintas, e dois critérios entre elas", () => {
    const vividas = new Set(sessoes(2, 60, 12).flat());
    expect(vividas.size, [...vividas].join(",")).toBeGreaterThanOrEqual(3);
    expect(vividas.has("CRITERIOS_2"), "dois critérios precisa existir no nível 2").toBe(true);
    expect(operacoesDoNivel(2)).toContain("doisCriterios");
  });

  // CONTROLE NEGATIVO. A primeira versão deste teste reimplementava o rodízio antigo MAS
  // continuava passando o histórico a gerarQuestao — e as regras NOVAS de anti-repetição
  // interceptavam, dando 0 repetições. O controle não isolava nada. Corrigido: o histórico
  // vai VAZIO, o que desliga a anti-repetição e mostra o que o rodízio produz sozinho.
  it("controle: o rodízio antigo, com a anti-repetição desligada, reprova a mesma medida", () => {
    let com3 = 0;
    for (let s = 0; s < 200; s++) {
      _resetIds();
      const rnd = lcg(9000 + s);
      const snap = criarSnapshot(rnd);
      const tipos = tiposDoNivel(5);
      let rodizio = 0;
      const ops: string[] = [];
      for (let i = 0; i < 12; i++) {
        const t = tipos[rodizio++ % tipos.length];        // ← o rodízio que o paciente vivia
        const r = gerarQuestao(t, paramsDoNivel(5), snap, rnd, [], tipos);   // ← histórico VAZIO
        if (r.questao) ops.push(operacaoReal(r.questao));
      }
      if (maiorCorrida(ops) >= 3) com3++;
    }
    expect(com3, "o rodízio antigo TEM de reprovar, senão os zeros acima não provam nada")
      .toBeGreaterThan(40);
  });

  // E o controle do OUTRO mecanismo: com o histórico ligado mas o seletor antigo, quem segura
  // a repetição são as regras novas de operação — prova que elas estão de fato ativas.
  it("as regras novas de anti-repetição por OPERAÇÃO estão ativas, não são decorativas", () => {
    let com3 = 0;
    for (let s = 0; s < 60; s++) {
      _resetIds();
      const rnd = lcg(9000 + s);
      const snap = criarSnapshot(rnd);
      let hist: RegistroHistorico[] = [];
      const tipos = tiposDoNivel(5);
      let rodizio = 0;
      const ops: string[] = [];
      for (let i = 0; i < 12; i++) {
        const t = tipos[rodizio++ % tipos.length];
        const r = gerarQuestao(t, paramsDoNivel(5), snap, rnd, hist, tipos);
        if (r.questao) { hist = [...hist, registroDe(r.questao)].slice(-8); ops.push(operacaoReal(r.questao)); }
      }
      if (maiorCorrida(ops) >= 3) com3++;
    }
    expect(com3, "com histórico, nem o rodízio antigo consegue repetir 3x").toBe(0);
  });

  it("nenhum tipo pode voltar a 'existir só no nome': a operação vem das CONDIÇÕES", () => {
    const rnd = lcg(4242);
    const snap = criarSnapshot(rnd);
    // buscaDireta tem 1 condição SEM extremo; comparacao tem 1 COM extremo; os demais, N condições
    for (const t of ["localizacao", "validade", "conservacao", "ingredientes", "alergenicos"] as TipoQuestao[]) {
      const r = gerarQuestao(t, paramsDoNivel(5), snap, rnd, [], [t]);
      expect(r.questao, t).toBeTruthy();
      expect(operacaoReal(r.questao!), t).toBe("BUSCA_DIRETA");
    }
    const c = gerarQuestao("comparacao", paramsDoNivel(5), snap, rnd, [], ["comparacao"]);
    expect(operacaoReal(c.questao!)).toBe("COMPARACAO");
    const d = gerarQuestao("duasCondicoes", paramsDoNivel(5), snap, rnd, [], ["duasCondicoes"]);
    expect(operacaoReal(d.questao!)).toBe("CRITERIOS_2");
  });

  it("a geração não travou com as regras novas: nada de tela vazia para o paciente", () => {
    const rnd = lcg(5150);
    const snap = criarSnapshot(rnd);
    let hist: RegistroHistorico[] = [];
    let nulos = 0;
    let opAnt: Operacao | undefined;
    for (let i = 0; i < 400; i++) {
      const op = sortearOperacao(5, rnd, opAnt); opAnt = op;
      const r = gerarQuestao(tipoParaOperacao(op, 5, rnd), paramsDoNivel(5), snap, rnd, hist, tiposDoNivel(5));
      if (!r.questao) nulos++;
      else hist = [...hist, registroDe(r.questao)].slice(-8);
    }
    expect(nulos / 400, "taxa de falha do gerador").toBeLessThan(0.02);
  });
});
