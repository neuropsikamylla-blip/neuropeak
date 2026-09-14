// Prova adversarial do VP sobre a Fatia A. Não confia na palavra do Codex nem nos
// testes que ele escreveu: ataca exatamente o que a Kamylla vai conferir na tela.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HISTORIAS, painelDaPosicao } from "@/data/historias";
import { embaralharCenas, minimoDeTrocas } from "./embaralhar";

const FONTE = readFileSync(
  resolve(process.cwd(), "components/exercises/executive/OrdemHistoria.tsx"), "utf8");

/** Cartões da história montados como o componente monta, na ordem CORRETA. */
function cartoesCorretos(id: string) {
  const story = HISTORIAS.find((h) => h.id === id);
  if (!story) throw new Error(`história ${id} não existe`);
  return painelDaPosicao(story).map((panel, i) => ({ id: `c${i}`, order: i, panel }));
}

describe("VP — o que o paciente vê na tela quando acerta", () => {
  // O caso que ela relatou: montar ingresso → cinema → pipoca → filme dava erro parcial.
  it("f12 (cinema): a ordem certa mostra os arquivos 1, 4, 2, 3 — não 1, 2, 3, 4", () => {
    expect(cartoesCorretos("f12").map((c) => c.panel)).toEqual([1, 4, 2, 3]);
  });

  it("d20 (herbário): a ordem certa mostra os arquivos 2, 6, 4, 1, 3, 5", () => {
    expect(cartoesCorretos("d20").map((c) => c.panel)).toEqual([2, 6, 4, 1, 3, 5]);
  });

  // CONTROLE NEGATIVO: com o gabarito antigo, a montagem DELA acertaria só 1 de 4.
  // É este número que ela viu na tela, e é ele que tem de virar 4 de 4.
  it("a leitura dela do cinema passa de 1 acerto (gabarito antigo) para 4 (corrigido)", () => {
    const dela = [1, 4, 2, 3];                       // a ordem de arquivos que ela montou
    const antigo = [1, 2, 3, 4];                     // gabarito implícito na numeração
    const agora = cartoesCorretos("f12").map((c) => c.panel);
    expect(dela.filter((p, i) => p === antigo[i]).length).toBe(1);
    expect(dela.filter((p, i) => p === agora[i]).length).toBe(4);
  });

  it("as outras 84 histórias continuam com a numeração natural dos arquivos", () => {
    const comOrd = HISTORIAS.filter((h) => h.ord);
    expect(comOrd.map((h) => h.id)).toEqual(["f12", "d20"]);
    for (const h of HISTORIAS.filter((x) => !x.ord)) {
      expect(painelDaPosicao(h)).toEqual(Array.from({ length: h.n }, (_, i) => i + 1));
    }
  });
});

describe("VP — painelDaPosicao não confia no dado", () => {
  it.each([
    ["comprimento errado", { n: 4, ord: [1, 2, 3] }],
    ["painel repetido", { n: 4, ord: [1, 1, 2, 3] }],
    ["painel fora da faixa", { n: 4, ord: [0, 1, 2, 3] }],
    ["acima do total", { n: 4, ord: [1, 2, 3, 5] }],
    ["não inteiro", { n: 4, ord: [1, 2, 3, 4.5] }],
  ])("cai para a ordem natural quando o ord é inválido (%s)", (_rotulo, story) => {
    expect(painelDaPosicao(story)).toEqual([1, 2, 3, 4]);
  });

  it("não devolve o próprio array do dado (mutar o retorno não corrompe o catálogo)", () => {
    const f12 = HISTORIAS.find((h) => h.id === "f12")!;
    const devolvido = painelDaPosicao(f12);
    devolvido[0] = 99;
    expect(f12.ord).toEqual([1, 4, 2, 3]);
  });
});

describe("VP — d8 fora do sorteio", () => {
  it("d8 é a única história marcada como duplicata, e aponta para d2", () => {
    const dups = HISTORIAS.filter((h) => h.duplicataDe);
    expect(dups.map((h) => `${h.id}->${h.duplicataDe}`)).toEqual(["d8->d2"]);
  });

  it("d8 continua no catálogo (histórico) e com o mesmo nº de cenas de d2", () => {
    const d8 = HISTORIAS.find((h) => h.id === "d8")!;
    const d2 = HISTORIAS.find((h) => h.id === "d2")!;
    expect(d8.n).toBe(d2.n);
  });

  // Prova POR POSIÇÃO, não por presença: o filtro tem de estar dentro de buildOrdem,
  // no pool do modo ordem. Se alguém o mover para fora, este teste cai.
  it("o filtro de duplicata está dentro de buildOrdem", () => {
    const inicio = FONTE.indexOf("function buildOrdem(");
    expect(inicio).toBeGreaterThan(-1);
    const corpo = FONTE.slice(inicio, FONTE.indexOf("\nfunction ", inicio + 10));
    expect(corpo).toContain("HISTORIAS.filter");
    expect(corpo).toContain("!h.duplicataDe");
  });
});

describe("VP — a correção não foi tocada", () => {
  it("continua comparando a cena com a POSIÇÃO no array, e não com o painel", () => {
    expect(FONTE).toContain("cards.filter((c, i) => c.order === i)");
    // o campo da imagem nunca pode entrar numa comparação de acerto
    expect(FONTE).not.toMatch(/panel\s*===\s*i\b/);
    expect(FONTE).not.toMatch(/c\.panel\s*===/);
  });

  it("a imagem do cartão vem de panel, e nunca mais de order + 1", () => {
    expect(FONTE).toContain("histPanelSrc(storyId, card.panel)");
    expect(FONTE).not.toContain("histPanelSrc(storyId, card.order + 1)");
  });
});

describe("VP — o embaralhamento com os tamanhos e o dado REAIS do banco", () => {
  // O teste do Codex usa n solto. Este usa as 85 histórias sorteáveis, uma a uma.
  it("nenhuma história do banco nasce resolvível em menos de 2 trocas", () => {
    const sorteaveis = HISTORIAS.filter((h) => !h.duplicataDe);
    expect(sorteaveis.length).toBe(85);
    let piores = 0;
    for (const h of sorteaveis) {
      for (let i = 0; i < 200; i++) {
        if (minimoDeTrocas(embaralharCenas(h.n)) < 2) piores++;
      }
    }
    expect(piores).toBe(0);
  });

  // Sem a guarda, uma em cada seis partidas de 4 cenas nascia a uma troca do fim.
  // Este é o controle que mostra que o teste acima não passa por acaso.
  it("controle negativo: o embaralhamento CRU produz partidas de 1 troca", () => {
    let umaTroca = 0;
    for (let i = 0; i < 3000; i++) {
      const p = [0, 1, 2, 3];
      for (let k = 3; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [p[k], p[j]] = [p[j], p[k]];
      }
      if (minimoDeTrocas(p) === 1) umaTroca++;
    }
    expect(umaTroca).toBeGreaterThan(0);
  });

  it("a identidade das cenas sobrevive ao embaralhamento (a resposta certa não muda)", () => {
    const cartoes = cartoesCorretos("d20");
    const ordem = embaralharCenas(6);
    const apresentados = ordem.map((i) => cartoes[i]);
    // reordenar por `order` devolve exatamente os painéis do gabarito
    const remontado = [...apresentados].sort((a, b) => a.order - b.order).map((c) => c.panel);
    expect(remontado).toEqual([2, 6, 4, 1, 3, 5]);
  });
});
