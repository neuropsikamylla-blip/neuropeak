import { PARES, PARES_ATIVOS, NIVEIS } from "./vigilancia-dados";
import { describe, it, expect } from "vitest";
import {
  EXPO_STEPS, adaptar, estadoInicial, classificarToque, gerarCentros,
  gerarSequenciaPosicoes, pontoEstavel, avaliarBloco, adjacentes, POSICOES,
} from "./vigilancia";

const idem = <T>(a: T[]) => a; // "embaralhar" determinístico p/ teste de emenda

describe("Vigilância — adaptativo (§18)", () => {
  it("2 acertos consecutivos aceleram (degrau +1) e salvam o estável", () => {
    let st = estadoInicial(5);
    let r = adaptar(st, true); expect(r.tipo).toBe("nenhuma"); expect(r.estado.degrau).toBe(5);
    r = adaptar(r.estado, true); expect(r.tipo).toBe("aceleracao");
    expect(r.estado.degrau).toBe(6);
    expect(r.estado.ultimoDegrauEstavel).toBe(5);
    expect(r.estado.acertosConsec).toBe(0);
  });

  it("um erro isolado não muda o degrau", () => {
    const st = estadoInicial(7);
    const r = adaptar(st, false);
    expect(r.tipo).toBe("nenhuma"); expect(r.estado.degrau).toBe(7); expect(r.estado.errosConsec).toBe(1);
  });

  it("2 erros consecutivos desaceleram (degrau -1), contador fica em 2", () => {
    let st = estadoInicial(7);
    let r = adaptar(st, false); r = adaptar(r.estado, false);
    expect(r.tipo).toBe("desaceleracao"); expect(r.estado.degrau).toBe(6); expect(r.estado.errosConsec).toBe(2);
  });

  it("3 erros consecutivos voltam ao último degrau estável", () => {
    // sobe para consolidar estável=5, degrau=6; depois erra 3x → volta a 5
    let r = adaptar(estadoInicial(5), true); r = adaptar(r.estado, true); // estável=5, degrau=6
    r = adaptar(r.estado, false); r = adaptar(r.estado, false); r = adaptar(r.estado, false);
    expect(r.tipo).toBe("retorno_estavel");
    expect(r.estado.degrau).toBe(5);
    expect(r.estado.errosConsec).toBe(0);
  });

  it("não ultrapassa os limites da escada", () => {
    let r = adaptar(estadoInicial(EXPO_STEPS.length - 1), true);
    for (let i = 0; i < 10; i++) r = adaptar(r.estado, true);
    expect(r.estado.degrau).toBeLessThanOrEqual(EXPO_STEPS.length - 1);
    let r2 = adaptar(estadoInicial(0), false);
    for (let i = 0; i < 10; i++) r2 = adaptar(r2.estado, false);
    expect(r2.estado.degrau).toBeGreaterThanOrEqual(0);
  });
});

describe("Vigilância — resposta espacial (§10-12)", () => {
  const W = 800, H = 600;
  const centros = gerarCentros("compacto", W, H);

  it("toque próximo ao centro da posição correta = correto (exata)", () => {
    const correta = 2; // direita
    const r = classificarToque(centros[correta], centros, correta, "compacto", W, H);
    expect(r.correto).toBe(true); expect(r.classificacao).toBe("exata");
  });

  it("toque deslocado mas dentro da região correta = correto (aproximada)", () => {
    const correta = 0; // superior
    const alvo = centros[correta];
    // desloca ~um pouco em direção ao centro (ainda mais perto da correta que das vizinhas)
    const toque = { x: alvo.x + 18, y: alvo.y + 22 };
    const r = classificarToque(toque, centros, correta, "compacto", W, H);
    expect(r.correto).toBe(true);
    expect(["exata", "correta_aproximada"]).toContain(r.classificacao);
  });

  it("toque no setor vizinho = incorreto (adjacente)", () => {
    const correta = 0;              // superior
    const r = classificarToque(centros[1], centros, correta, "compacto", W, H); // toca na superior_direita
    expect(r.correto).toBe(false); expect(r.classificacao).toBe("adjacente");
  });

  it("toque numa posição oposta = incorreto (distante)", () => {
    const correta = 0;             // superior
    const r = classificarToque(centros[4], centros, correta, "compacto", W, H); // inferior
    expect(r.correto).toBe(false); expect(r.classificacao).toBe("distante");
  });

  it("adjacência é circular no anel de 8", () => {
    expect(adjacentes(0, 1)).toBe(true);
    expect(adjacentes(0, 7)).toBe(true);
    expect(adjacentes(0, 2)).toBe(false);
    expect(adjacentes(0, 4)).toBe(false);
  });
});

describe("Vigilância — contrabalanceamento (§14)", () => {
  it("sequência usa as 8 posições por ciclo e não repete na emenda", () => {
    const seq = gerarSequenciaPosicoes(12, idem);
    expect(seq.length).toBe(12);
    // primeiras 8 = permutação das 8 posições
    expect([...seq.slice(0, 8)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    // nunca repete consecutiva
    for (let i = 1; i < seq.length; i++) expect(seq[i]).not.toBe(seq[i - 1]);
    expect(POSICOES.length).toBe(8);
  });
});

describe("Vigilância — ponto estável e bloco (§19-20)", () => {
  it("ponto estável exige ≥4/5 acertos e sem 2 erros seguidos", () => {
    expect(pontoEstavel([true, true, false, true, true])).toBe(true);
    expect(pontoEstavel([true, false, false, true, true])).toBe(false); // 2 erros seguidos
    expect(pontoEstavel([true, true, false, false, true])).toBe(false);
    expect(pontoEstavel([true, true, true])).toBe(false);               // menos de 5
  });

  it("avaliação do bloco: 10-12 avança, 8-9 mantém, ≤7 reforça", () => {
    expect(avaliarBloco(11).decisao).toBe("avancar");
    expect(avaliarBloco(9).decisao).toBe("manter");
    expect(avaliarBloco(7).decisao).toBe("reforcar");
  });
});

// ── Escada de níveis × pares ativos (02/ago: ela desativou o par ameixa) ──────
describe("Vigilância — pares ativos e escada", () => {
  it("a escada nunca usa um par desativado", () => {
    const ativos = new Set(PARES_ATIVOS.map((p) => p.pairId));
    for (const n of NIVEIS) {
      expect(ativos.has(n.pairId), `nível ${n.nivel} usa par inativo: ${n.pairId}`).toBe(true);
    }
  });

  it("os 10 níveis existem e a dificuldade não retrocede entre níveis de tom", () => {
    expect(NIVEIS.length).toBe(10);
    const tomDe = (id: string) => PARES.find((p) => p.pairId === id)!;
    const tons = NIVEIS.filter((n) => tomDe(n.pairId).categoria === "tom");
    const difs = tons.map((n) => tomDe(n.pairId).dificuldadeVisual);
    for (let i = 1; i < difs.length; i++) expect(difs[i]).toBeGreaterThanOrEqual(difs[i - 1]);
  });
});
