// Prova adversarial do VP sobre a Fatia C. O alvo é o relato dela em produção:
// "eu acertei umas 5 histórias e ela permaneceu com 4 desenhos".
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { nextLevelPerTrial } from "../adaptive-trial";
import { tierForLevel, vereditoDaHistoria } from "./tentativas";

const FONTE = readFileSync(
  resolve(process.cwd(), "components/exercises/executive/OrdemHistoria.tsx"), "utf8");

/** Roda a escada como o componente roda: um veredito por história. */
function escada(inicio: number, historias: { resolvidaDePrimeira: boolean; acertoPrimeira: number }[]) {
  let nivel = inicio;
  const caminho = [nivel];
  for (const h of historias) {
    nivel = nextLevelPerTrial(nivel, vereditoDaHistoria(h), 1, 10);
    caminho.push(nivel);
  }
  return { nivel, caminho, faixa: tierForLevel(nivel) };
}
const CERTA = { resolvidaDePrimeira: true, acertoPrimeira: 1 };
const CORRIGIDA = { resolvidaDePrimeira: false, acertoPrimeira: 0.75 };
const RUIM = { resolvidaDePrimeira: false, acertoPrimeira: 0.25 };

describe("VP — o relato dela: 5 acertos e continuava em 4 desenhos", () => {
  it("5 histórias certas de primeira TIRAM o paciente das 4 cenas", () => {
    const r = escada(1, Array(5).fill(CERTA));
    expect(r.nivel).toBe(6);
    expect(r.faixa).not.toBe("faceis");
    expect(tierForLevel(1)).toBe("faceis");   // controle: ele começou nas 4 cenas
  });

  it("bastam 2 acertos de primeira para a faixa mudar — antes eram 2 SESSÕES", () => {
    expect(tierForLevel(escada(1, [CERTA]).nivel)).toBe("faceis");      // nível 2, ainda 4 cenas
    expect(tierForLevel(escada(1, [CERTA, CERTA]).nivel)).toBe("media"); // nível 3, 5 cenas
  });

  it("resolver DEPOIS de corrigir mantém o nível — errar e consertar não é fracasso", () => {
    expect(escada(4, [CORRIGIDA, CORRIGIDA, CORRIGIDA]).nivel).toBe(4);
  });

  it("só erro grande de primeira faz descer", () => {
    expect(escada(5, [RUIM]).nivel).toBe(4);
    expect(escada(5, [{ resolvidaDePrimeira: false, acertoPrimeira: 0.5 }]).nivel).toBe(5);
  });

  it("teto 10 e piso 1 seguram a escada", () => {
    expect(escada(1, Array(40).fill(CERTA)).nivel).toBe(10);
    expect(escada(10, Array(40).fill(RUIM)).nivel).toBe(1);
  });

  it("a escada NUNCA chega a 11 ou 12 — os desafios se desbloqueiam entre sessões", () => {
    const r = escada(10, Array(30).fill(CERTA));
    expect(r.caminho.every((n) => n <= 10)).toBe(true);
  });

  // Este teste existe porque a versão anterior dele NÃO pegava o defeito: simulava a escada
  // com o limite escrito aqui, em vez de ler o limite REAL do componente. Trocar 10 por 12
  // lá passava despercebido — e faria o exercício reportar estágio 11/12, desbloqueando o
  // Intruso e o Descubra sem o paciente cumprir a régua de 80% que os libera.
  it("o TETO 10 está no componente, e não só nesta simulação", () => {
    const i = FONTE.indexOf("function closeOrderStory(");
    const corpo = FONTE.slice(i, FONTE.indexOf("function processSubmit()", i));
    // a linha inteira, não uma regex de parênteses: o argumento contém uma chamada aninhada
    const linha = corpo.split("\n").find((l) => l.includes("nextLevelPerTrial("));
    expect(linha).toBeDefined();
    expect(linha).toContain(", 1, 10)");
    expect(linha).not.toMatch(/,\s*1[1-9]\s*\)/);
  });
});

describe("VP — o componente não pode atrasar a subida (prova por posição)", () => {
  it("o tier da rodada vem do nível ATUAL, não de uma const da montagem", () => {
    expect(FONTE).not.toContain("const tier = tierForLevel(startLevel)");
    const i = FONTE.indexOf("function makeRound()");
    const corpo = FONTE.slice(i, FONTE.indexOf("function markFirst()", i));
    expect(corpo).toContain("tierForLevel(curLevelRef.current)");
  });

  it("a rodada pré-carregada é DESCARTADA quando a faixa muda", () => {
    const i = FONTE.indexOf("function closeOrderStory(");
    const corpo = FONTE.slice(i, FONTE.indexOf("function processSubmit()", i));
    expect(corpo).toContain("tierForLevel(previousLevel) !== tierForLevel(nextLevel)");
    expect(corpo).toContain("pendingRef.current = null");
    // e a escada tem de vir ANTES do descarte, ou o descarte compararia nada
    expect(corpo.indexOf("nextLevelPerTrial")).toBeLessThan(corpo.indexOf("pendingRef.current = null"));
  });

  it("a escada só roda no modo ordem; intruso e falta reportam o estágio", () => {
    expect(FONTE).toContain('difficulty: sessionMode === "ordem" ? maxLevelRef.current : reportLevel');
  });

  it("o nível continua INVISÍVEL para o paciente", () => {
    for (const proibido of ["Nível ", " cenas · ", "Começa no nível", "curLevelRef.current}"]) {
      expect(FONTE.split(proibido).length - 1).toBe(0);
    }
  });

  it("nada da escada vaza para lib/adaptive.ts", () => {
    const adaptive = readFileSync(resolve(process.cwd(), "lib/adaptive.ts"), "utf8");
    expect(adaptive).not.toContain("nextLevelPerTrial");
    expect(adaptive).not.toContain("vereditoDaHistoria");
  });
});
