// Prova adversarial do VP sobre a Fatia A. Não confia na palavra do Codex nem nos
// testes que ele escreveu: ataca exatamente o que a Kamylla vai conferir na tela.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HISTORIAS, painelDaPosicao } from "@/data/historias";
import { embaralharCenas, minimoDeTrocas } from "./embaralhar";

const FONTE = readFileSync(
  resolve(process.cwd(), "components/exercises/executive/OrdemHistoria.tsx"), "utf8");
const MOTOR = readFileSync(resolve(process.cwd(), "lib/ordem-historia/tentativas.ts"), "utf8");

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

  // Achada por ELA na 1ª sessão de teste, em 14/set — e a auditoria de 13/set tinha
  // declarado esta história coerente. A prova é a ROUPA: ela escova os dentes de camiseta
  // de bolinhas (2.png) e só depois abotoa o pijama de corações (1.png), que usa para ler
  // (3.png) e dormir (4.png). Na ordem numerada, teria trocado de roupa duas vezes.
  it("f5 (rotina de dormir): escovar os dentes vem ANTES de vestir o pijama", () => {
    expect(cartoesCorretos("f5").map((c) => c.panel)).toEqual([2, 1, 3, 4]);
  });

  // Achada na revarredura por CONTINUIDADE de 14/set. A cena 3 é o ensaio no estúdio
  // (collant de aula, barra, cartaz "DISCIPLINA FOCO DEDICAÇÃO") e estava numerada entre o
  // camarim (2, já de tutu) e o palco (4, de tutu): a menina teria trocado de roupa duas
  // vezes. O ensaio é outro dia e abre a história. A ordem de 1 e 2 fica como estava —
  // para ela não há prova, só leitura.
  it("d13 (balé): o ensaio no estúdio vem ANTES do dia da apresentação", () => {
    expect(cartoesCorretos("d13").map((c) => c.panel)).toEqual([3, 1, 2, 4, 5, 6]);
  });

  // As três achadas ao FIM da revarredura por continuidade, em 15/set.
  it("d15 (o dente): o dente cai na maçã ANTES de estar na mão do pai", () => {
    // na cena 2 o dente já está fora da boca, na mão do pai; na 3 ele está SAINDO
    // na mordida da maçã (o ícone do dente voando). Objeto não chega à mão antes de sair.
    expect(cartoesCorretos("d15").map((c) => c.panel)).toEqual([1, 3, 2, 4, 5, 6]);
  });

  it("d19 (coral): provar o vestido vem ANTES de esperar nos bastidores vestida", () => {
    // cena 3 = provando o vestido (arara com outro, sapatos no chão); cena 2 = bastidores,
    // já pronta. Ninguém está pronto antes de provar. O ensaio (4) já é com o figurino.
    expect(cartoesCorretos("d19").map((c) => c.panel)).toEqual([1, 3, 4, 2, 5, 6]);
  });

  it("d22 (capoeira): chegar de mochila é a PRIMEIRA cena", () => {
    // cena 2 = chega com a mochila nas costas e cumprimenta o mestre na porta; nas demais
    // ele já treina, sem mochila. Ninguém chega depois de já estar treinando.
    expect(cartoesCorretos("d22").map((c) => c.panel)[0]).toBe(2);
  });

  // ELA achou em 21/set, jogando, com a MESMA prova da f5: a roupa. No arquivo 1 ele VESTE o
  // avental (telas ainda em branco); no arquivo 2 ele desenha SEM avental; do 3 em diante pinta
  // COM avental. Na numeração original ele vestiria, tiraria para desenhar, e vestiria de novo.
  // ⚠️ A varredura do VP passou por esta história e a declarou coerente. Não passou.
  it("m16 (pintura): desenhar vem ANTES de vestir o avental", () => {
    expect(cartoesCorretos("m16").map((c) => c.panel)).toEqual([2, 1, 3, 4, 5]);
  });

  it("as outras 77 histórias continuam com a numeração natural dos arquivos", () => {
    const comOrd = HISTORIAS.filter((h) => h.ord);
    expect(comOrd.map((h) => h.id)).toEqual(["f5", "f12", "m16", "d13", "d15", "d19", "d20", "d22"]);
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

describe("VP — histórias com ordem NÃO DEDUTÍVEL ficam fora do sorteio", () => {
  // Decisão dela em 21/set, depois de encontrar três jogando: uma história cuja ordem não se
  // deduz faz o paciente acertar por sorte — é pior que gabarito errado, porque não há o que
  // corrigir. Ficam no catálogo por histórico, com o motivo escrito no dado.
  it("m1, m6 e m21 estão marcadas com o MOTIVO, não só excluídas", () => {
    for (const id of ["m1", "m6", "m21"]) {
      const h = HISTORIAS.find((x) => x.id === id);
      expect(h, id).toBeDefined();
      expect(h!.foraDoSorteio, `${id} precisa do motivo escrito`).toBeTruthy();
      expect(h!.foraDoSorteio!.length, `${id}: o motivo não pode ser vago`).toBeGreaterThan(30);
    }
  });

  it("o sorteio exclui tanto duplicata quanto ordem não dedutível", () => {
    const fonte = FONTE.slice(FONTE.indexOf("function buildOrdem("));
    expect(fonte).toContain("!h.duplicataDe");
    expect(fonte).toContain("!h.foraDoSorteio");
  });

  it("sobram histórias suficientes em cada faixa", () => {
    for (const diff of ["faceis", "media", "dificil", "muito-dificil"] as const) {
      const sorteaveis = HISTORIAS.filter((h) => h.diff === diff && !h.duplicataDe && !h.foraDoSorteio);
      // ⚠️ TEMPORÁRIO: era 15. As 8 gêmeas de enredo foram apagadas do nível difícil (13 restantes)
      // e a reposição são as 16 pranchas difíceis novas dela, ainda por cortar. Ao importá-las,
      // este piso volta para 15. O veto do sorteio usa metade do pool, então com 13 ainda sobram
      // 7 para sortear de verdade — apertado, mas funcionando.
      expect(sorteaveis.length, diff).toBeGreaterThanOrEqual(13);
    }
  });
});


describe("VP — a correção não foi tocada", () => {
  // A Fatia B moveu a comparação do componente para avaliarOrdem. A prova segue
  // o alvo em vez de afrouxar: a regra tem de continuar sendo cena × POSIÇÃO.
  it("avaliarOrdem compara a cena com a POSIÇÃO no array, e não com o painel", () => {
    expect(MOTOR).toContain("card.order === indice");
    expect(MOTOR).not.toMatch(/panel/);
    // o componente não pode ter uma segunda regra de acerto por fora do motor
    expect(FONTE).toContain("avaliarOrdem(cards)");
    expect(FONTE).not.toMatch(/cards\.filter\(\(c, i\) => c\.order === i\)/);
  });

  it("o campo da imagem nunca entra numa comparação de acerto", () => {
    for (const fonte of [FONTE, MOTOR]) {
      expect(fonte).not.toMatch(/panel\s*===\s*i\b/);
      expect(fonte).not.toMatch(/\.panel\s*===/);
      expect(fonte).not.toMatch(/===\s*\w*\.panel/);
    }
  });

  it("o Intruso mantém a própria regra, sobre a sequência sem a cena intrusa", () => {
    expect(FONTE).toContain("seq.filter((c, i) => c.order === i)");
  });

  it("a imagem do cartão vem de panel, e nunca mais de order + 1", () => {
    expect(FONTE).toContain("histPanelSrc(storyId, card.panel)");
    expect(FONTE).not.toContain("histPanelSrc(storyId, card.order + 1)");
  });
});

describe("VP — o embaralhamento com os tamanhos e o dado REAIS do banco", () => {
  // O teste do Codex usa n solto. Este usa as 95 histórias de ordenar, uma a uma.
  it("nenhuma história do banco nasce resolvível em menos de 2 trocas", () => {
    const sorteaveis = HISTORIAS.filter((h) => !h.duplicataDe);
    expect(sorteaveis.length).toBe(95);
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

describe("VP — as gêmeas de enredo foram APAGADAS do banco", () => {
  // 23/set: dez histórias saíram de vez (pastas e entradas). Oito eram o mesmo ENREDO de uma
  // irmã em outro nível — e a escada sobe DENTRO da sessão (nível 8 = difícil, 9 = muito-difícil),
  // então as duas podiam cair com minutos de distância, e a segunda virava reconhecimento.
  // As outras duas (d8, x20) eram cópia literal de d2 e x11.
  // Backup: ~/APPs/backups-neuropeak/historias-apagadas-20260923.tar.gz (62 cenas).
  const APAGADAS = ["d1", "d2", "d3", "d5", "d6", "d7", "d8", "d9", "d11", "x20"];
  const SOBREVIVENTES = ["f1", "x9", "x2", "x3", "x4", "x8", "x1", "x7", "x11"];

  it("nenhuma das dez apagadas continua no catálogo", () => {
    for (const id of APAGADAS) {
      expect(HISTORIAS.find((h) => h.id === id), `${id} ainda está no catálogo`).toBeUndefined();
    }
  });

  it("o enredo de cada apagada sobreviveu na irmã", () => {
    // O risco de errar era apagar as DUAS e o enredo sumir do banco inteiro.
    for (const id of SOBREVIVENTES) {
      const h = HISTORIAS.find((x) => x.id === id);
      expect(h, `${id} sumiu junto com a gêmea`).toBeTruthy();
      expect(h!.duplicataDe, `${id} sobreviveu mas está marcada como duplicata`).toBeUndefined();
      expect(h!.foraDoSorteio, `${id} sobreviveu mas está fora do sorteio`).toBeUndefined();
    }
  });

  it("não sobrou nenhuma marca de duplicata apontando para história inexistente", () => {
    for (const h of HISTORIAS) {
      if (!h.duplicataDe) continue;
      expect(
        HISTORIAS.some((o) => o.id === h.duplicataDe),
        `${h.id} aponta para ${h.duplicataDe}, que não existe mais`,
      ).toBe(true);
    }
  });

  it("o catálogo tem 96 histórias de ordenar e 92 sorteáveis", () => {
    // 23/set, lote 2: entraram 20 (6 fáceis, 11 difíceis, 3 muito-difíceis) e f3 saiu,
    // substituída por f25 ("arrumar o quarto"), que cobre o mesmo cenário com mais etapas.
    expect(HISTORIAS.length).toBe(96);
    const ordenar = HISTORIAS.filter((h) => ["faceis", "media", "dificil", "muito-dificil"].includes(h.diff));
    expect(ordenar.filter((h) => !h.duplicataDe && !h.foraDoSorteio).length).toBe(92);
    expect(ordenar.filter((h) => h.diff === "dificil").length).toBe(24);
  });

  it("toda história do catálogo tem a pasta de imagens no disco, com o nº de cenas declarado", () => {
    // Prova direta contra o defeito que a remoção poderia ter criado: entrada sem imagem.
    const base = resolve(__dirname, "../../public/exercises/historias");
    for (const h of HISTORIAS) {
      const dir = resolve(base, h.id);
      expect(existsSync(dir), `${h.id}: pasta ${dir} não existe`).toBe(true);
      const cenas = readdirSync(dir).filter((f) => f.endsWith(".png"));
      expect(cenas.length, `${h.id}: declarou ${h.n} cenas, achou ${cenas.length}`).toBe(h.n);
    }
  });
});

describe("VP — o lote 2 (23/set): as 20 histórias novas", () => {
  const NOVAS = [
    ["f21", 4], ["f22", 4], ["f23", 4], ["f24", 4], ["f25", 4], ["f26", 4],
    ["d23", 6], ["d24", 6], ["d25", 6], ["d26", 6], ["d27", 6], ["d28", 6],
    ["d29", 6], ["d30", 6], ["d31", 6], ["d32", 6], ["d33", 6],
    ["x23", 8], ["x24", 8], ["x25", 8],
  ] as const;

  it("as 20 estão no catálogo, sorteáveis, com o nº de cenas da sua faixa", () => {
    for (const [id, cenas] of NOVAS) {
      const h = HISTORIAS.find((x) => x.id === id);
      expect(h, `${id} não foi cadastrada`).toBeTruthy();
      expect(h!.n, `${id}: esperava ${cenas} cenas`).toBe(cenas);
      expect(h!.duplicataDe, `${id} nasceu marcada como duplicata`).toBeUndefined();
      expect(h!.foraDoSorteio, `${id} nasceu fora do sorteio`).toBeUndefined();
    }
  });

  it("nenhum id novo reaproveita id de história apagada", () => {
    // As sessões já gravadas referenciam storyId no metadata: reusar um id apagado
    // faria o histórico do paciente apontar para outra história.
    const APAGADAS = ["d1", "d2", "d3", "d5", "d6", "d7", "d8", "d9", "d11", "x20"];
    for (const [id] of NOVAS) expect(APAGADAS, `${id} reusa id apagado`).not.toContain(id);
  });

  it("as 20 não trazem ord: a ordem de leitura da prancha já é a correta", () => {
    // Conferidas uma a uma na prancha. O formato novo (sem enunciado, sem número no
    // quadro) entregou a grade já na ordem da história.
    for (const [id] of NOVAS) {
      expect(HISTORIAS.find((x) => x.id === id)!.ord, `${id} não deveria precisar de ord`).toBeUndefined();
    }
  });

  it("f3 saiu apontando para f25, que está no sorteio", () => {
    const f3 = HISTORIAS.find((h) => h.id === "f3")!;
    expect(f3.duplicataDe).toBe("f25");
    const f25 = HISTORIAS.find((h) => h.id === "f25")!;
    expect(f25.duplicataDe).toBeUndefined();
    expect(f25.foraDoSorteio).toBeUndefined();
  });
});
