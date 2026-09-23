import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 23/set/2026 — mesmo princípio aplicado ao MOT, agora aqui: "se eu cliquei já segue".
// O feedback e o botão Continuar eram condicionais soltos na coluna e, ao aparecerem juntos,
// empurravam os cartões para cima no instante em que ela olhava a resposta.

const FONTE = readFileSync(
  resolve(__dirname, "../components/exercises/attention/InformacaoEmFoco.tsx"), "utf-8");

describe("Informação em Foco — o gesto é a confirmação", () => {
  it("não existe botão de Continuar", () => {
    expect(FONTE).not.toContain('"Continuar"');
    expect(FONTE, "sobrou um botão que chama proxima()").not.toMatch(/<button[^>]*onClick=\{proxima\}/);
  });

  it("a questão resolvida avança sozinha, com tempo de leitura", () => {
    expect(FONTE).toContain("TEMPO_LEITURA_FEEDBACK_MS");
    expect(FONTE).toMatch(/setTimeout\(\(\) => proxima\(\), TEMPO_LEITURA_FEEDBACK_MS\)/);
  });

  it("o tempo de leitura não é apressado", () => {
    // O público inclui pacientes com lentificação: menos de 2s não dá para ler a frase.
    const m = FONTE.match(/TEMPO_LEITURA_FEEDBACK_MS\s*=\s*(\d+)/);
    expect(m, "a constante sumiu").toBeTruthy();
    expect(Number(m![1])).toBeGreaterThanOrEqual(2000);
  });

  it("a faixa de feedback tem altura reservada", () => {
    expect(FONTE).toContain("const ALTURA_FEEDBACK");
    expect(FONTE).toMatch(/minHeight:\s*ALTURA_FEEDBACK/);
  });

  it("errar na 1ª tentativa NÃO avança — a pista existe para ele tentar de novo", () => {
    // O auto-avanço só dispara em `revelou`, que a 1ª errada não liga.
    const corpo = FONTE.slice(FONTE.indexOf("if (tentAtual < 2)"), FONTE.indexOf("// última errada"));
    expect(corpo).toContain("setFb(");
    expect(corpo, "a 1ª errada não pode revelar nem avançar").not.toContain("setRevelou(true)");
  });
});
