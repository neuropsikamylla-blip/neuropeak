import { describe, expect, it } from "vitest";
import { funcaoLabel, summarizeFocusAgents } from "@/lib/focus-report";

const baseSession = {
  exerciseId: "focus-agents",
  accuracy: 0.75,
  difficulty: 4,
  duration: 90,
  completedAt: "2026-08-01T10:00:00.000Z",
};

describe("relatório do Focus Agentes por função cognitiva", () => {
  it("soma tentativas e acertos das sessões com porFuncao", () => {
    const summary = summarizeFocusAgents([
      { ...baseSession, metadata: JSON.stringify({ porFuncao: { seletiva: { tentativas: 8, acertos: 7 }, flexibilidade: { tentativas: 4, acertos: 2 } } }) },
      { ...baseSession, completedAt: "2026-08-02T10:00:00.000Z", metadata: JSON.stringify({ porFuncao: { seletiva: { tentativas: 2, acertos: 1 }, flexibilidade: { tentativas: 6, acertos: 3 } } }) },
    ]);

    expect(summary?.byFuncao.seletiva).toEqual({ tentativas: 10, acertos: 8, acc: 0.8 });
    expect(summary?.byFuncao.flexibilidade).toEqual({ tentativas: 10, acertos: 5, acc: 0.5 });
  });

  it("mantém sessão antiga no total geral e deixa a função sem dados zerada", () => {
    const summary = summarizeFocusAgents([
      { ...baseSession, accuracy: 0.9, metadata: JSON.stringify({ mode: "foco", level: 3 }) },
    ]);

    expect(summary?.totalSessions).toBe(1);
    expect(summary?.recentAccuracy).toBe(0.9);
    expect(summary?.byFuncao.seletiva).toEqual({ tentativas: 0, acertos: 0, acc: 0 });
  });

  it("não produz NaN quando a função não tem tentativas", () => {
    const summary = summarizeFocusAgents([
      { ...baseSession, metadata: JSON.stringify({ porFuncao: { seletiva: { tentativas: 0, acertos: 0 } } }) },
    ]);

    expect(summary?.byFuncao.seletiva.acc).toBe(0);
  });

  it.each([
    ["seletiva", "Atenção seletiva"],
    ["memoriaTrabalho", "Memória de trabalho"],
    ["flexibilidade", "Flexibilidade"],
    ["inibicao", "Controle inibitório"],
  ] as const)("traduz %s para pt-BR", (funcao, label) => {
    expect(funcaoLabel(funcao)).toBe(label);
  });

  it("só observa seletiva boa e flexibilidade fraca com ao menos 10 tentativas em cada", () => {
    const semAmostraSuficiente = summarizeFocusAgents([
      { ...baseSession, metadata: JSON.stringify({ porFuncao: { seletiva: { tentativas: 9, acertos: 8 }, flexibilidade: { tentativas: 9, acertos: 5 } } }) },
    ]);
    const comAmostraSuficiente = summarizeFocusAgents([
      { ...baseSession, metadata: JSON.stringify({ porFuncao: { seletiva: { tentativas: 10, acertos: 8 }, flexibilidade: { tentativas: 10, acertos: 5 } } }) },
    ]);

    expect(semAmostraSuficiente?.observations).not.toContain("Localiza bem os alvos, mas o desempenho cai quando a regra muda.");
    expect(comAmostraSuficiente?.observations).toContain("Localiza bem os alvos, mas o desempenho cai quando a regra muda.");
  });

  it("mantém as observações livres de linguagem diagnóstica", () => {
    const summary = summarizeFocusAgents([
      { ...baseSession, metadata: JSON.stringify({ falsePositives: 3, omissions: 3, errorsAfterSwitch: 2, switchRounds: 3, errImpulse: 4 }) },
    ]);

    expect(summary?.observations.join(" ")).not.toMatch(/déficit|TDAH|transtorno|impulsiv/i);
  });
});
