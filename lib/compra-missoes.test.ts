import { describe, it, expect } from "vitest";
import {
  buildMissao, verificarSelecao, verificarNumerica, feedbackSelecao, feedbackNumerica,
  type EtapaSelecao, type EtapaNumerica, type OperacaoFoco, type TemaConfig,
} from "./compra-missoes";
import { itemById } from "@/data/compra-itens";

const TEMAS: TemaConfig[] = ["piquenique", "praia", "frio", "alimentos", "mercado", "objetos", "variado"];
const FOCOS: OperacaoFoco[] = ["tudo", "soma", "subtracao", "multiplicacao", "divisao"];

function computeNumeric(e: EtapaNumerica): number {
  const [a, b] = e.operandos;
  if (e.sinal === "+") return e.operandos.reduce((s, x) => s + x, 0);
  if (e.sinal === "-") return a - b;
  if (e.sinal === "×") return a * b;
  return a / b; // ÷
}

describe("buildMissao — estrutura", () => {
  it("foco 'tudo' gera 11 etapas; foco de operação gera 8", () => {
    expect(buildMissao("piquenique", 3, "tudo").etapas.length).toBe(11);
    for (const f of ["soma", "subtracao", "multiplicacao", "divisao"] as const) {
      expect(buildMissao("piquenique", 3, f).etapas.length).toBe(8);
    }
  });
  it("índices das etapas são sequenciais e a missão tem personagem/título", () => {
    const m = buildMissao("alimentos", 4, "tudo");
    expect(m.personagem).toBeTruthy();
    expect(m.titulo).toBeTruthy();
    m.etapas.forEach((e, i) => expect(e.index).toBe(i));
  });
});

describe("etapas NUMÉRICAS — resposta bate com a conta", () => {
  it("operandos + sinal produzem a respostaCorreta em muitas missões", () => {
    for (const tema of TEMAS) for (const foco of FOCOS) {
      for (let r = 0; r < 8; r++) {
        for (const e of buildMissao(tema, ((r % 8) + 1), foco).etapas) {
          if (e.dados.modo !== "numeric") continue;
          const d = e.dados as EtapaNumerica;
          expect(computeNumeric(d)).toBe(d.respostaCorreta);
          expect(d.respostaCorreta).toBeGreaterThan(0);
          expect(Number.isInteger(d.respostaCorreta)).toBe(true);
          expect(verificarNumerica(d, d.respostaCorreta)).toBe(true);
          expect(verificarNumerica(d, d.respostaCorreta + 1)).toBe(false);
        }
      }
    }
  });
});

describe("etapas de SELEÇÃO — sempre solúveis", () => {
  it("a solução semeada cumpre TODAS as regras e está no pool", () => {
    for (const tema of TEMAS) for (const foco of FOCOS) {
      for (let r = 0; r < 10; r++) {
        for (const e of buildMissao(tema, ((r % 8) + 1), foco).etapas) {
          if (e.dados.modo !== "select") continue;
          const d = e.dados as EtapaSelecao;
          expect(d.solucao.length).toBeGreaterThan(0);
          // todos os itens da solução estão no pool exibido
          const poolIds = new Set(d.pool.map((i) => i.id));
          for (const id of d.solucao) expect(poolIds.has(id)).toBe(true);
          // a solução passa na verificação
          expect(verificarSelecao(d, d.solucao).correto).toBe(true);
          // e uma seleção vazia NÃO passa (a etapa não é trivial)
          expect(verificarSelecao(d, []).correto).toBe(false);
        }
      }
    }
  });
});

describe("feedback progressivo", () => {
  it("numérica: acerto mostra a conta; 3º erro revela o resultado", () => {
    const e = buildMissao("piquenique", 2, "multiplicacao").etapas[0].dados as EtapaNumerica;
    expect(feedbackNumerica(e, true, 0).titulo).toBe("Correto!");
    expect(feedbackNumerica(e, false, 1).titulo).toBe("Ainda não");
    expect(feedbackNumerica(e, false, 2).titulo).toBe("Quase lá");
    const t3 = feedbackNumerica(e, false, 3);
    expect(t3.linhas.join(" ")).toContain(String(e.respostaCorreta));
  });
  it("seleção: 1º erro nomeia a regra; 4º erro sugere uma solução", () => {
    const sel = buildMissao("piquenique", 3, "tudo").etapas.find((x) => x.dados.modo === "select")!.dados as EtapaSelecao;
    // seleção deliberadamente errada (vazia)
    const f1 = feedbackSelecao(sel, [], 1);
    expect(f1.titulo).toBe("Ainda não");
    expect(f1.linhas.length).toBeGreaterThan(0);
    const f4 = feedbackSelecao(sel, [], 4);
    const solName = itemById(sel.solucao[0])!.name;
    expect(f4.linhas.join(" ")).toContain(solName);
  });
});
