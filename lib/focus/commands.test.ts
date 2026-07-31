import { describe, it, expect } from "vitest";
import { gerarRodada, matches, type Etapa } from "./commands";
import { charById, type FocusChar } from "./roster";

const ETAPAS: Etapa[] = [1, 2, 3, 4, 5];

describe("FOCUS gerador de comandos", () => {
  it("cada rodada tem EXATAMENTE 1 alvo válido (§16)", () => {
    for (const etapa of ETAPAS) {
      for (let i = 0; i < 60; i++) {
        const n = 6;
        const r = gerarRodada(etapa, n);
        const chars = r.personagensIds.map(charById).filter((c): c is FocusChar => !!c);
        const validos = chars.filter((c) => matches(c, r.criterio));
        expect(validos.length, `etapa ${etapa}: ${r.texto}`).toBe(1);
        expect(validos[0].id).toBe(r.alvoId);
        expect(r.personagensIds.length).toBe(n);
        expect(r.texto.length).toBeGreaterThan(5);
      }
    }
  });

  it("nunca usa personagem de emoção", () => {
    for (const etapa of ETAPAS)
      for (let i = 0; i < 30; i++) {
        const r = gerarRodada(etapa, 6);
        for (const id of r.personagensIds)
          expect(/alegria|raiva|tristeza/.test(id)).toBe(false);
      }
  });

  it("etapa 3+ inclui ao menos um distrator SEMELHANTE ao alvo (§3)", () => {
    let comSemelhante = 0;
    for (let i = 0; i < 40; i++) {
      const r = gerarRodada(3, 7);
      const alvo = charById(r.alvoId)!;
      const outros = r.personagensIds.filter((id) => id !== r.alvoId).map(charById).filter((c): c is FocusChar => !!c);
      const temSemelhante = outros.some((c) =>
        c.cor === alvo.cor ||
        c.acessorios.some((a) => alvo.acessorios.includes(a)) ||
        (alvo.objeto && c.objeto === alvo.objeto),
      );
      if (temSemelhante) comSemelhante++;
    }
    expect(comSemelhante).toBeGreaterThan(35); // quase sempre
  });

  it("etapa 4 sempre especifica o lado da imagem", () => {
    for (let i = 0; i < 30; i++) {
      const r = gerarRodada(4, 6);
      expect(r.criterio.lado).toBeDefined();
      expect(r.texto).toMatch(/lado (direito|esquerdo) da imagem/);
    }
  });

  it("comandos negativos são marcados", () => {
    let negativos = 0;
    for (let i = 0; i < 40; i++) if (gerarRodada(5, 6).negativo) negativos++;
    expect(negativos).toBeGreaterThan(0);
  });
});
