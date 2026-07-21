import { describe, it, expect } from "vitest";
import { SEED_STORIES } from "@/data/social-stories/seed";
import { validateStory } from "./validate";

describe("histórias-semente do Investigadores Sociais", () => {
  it("todas passam na validação (invariantes §16)", () => {
    for (const s of SEED_STORIES) expect(validateStory(s)).toEqual([]);
  });
  it("cobrem as 3 faixas (o exercício funciona em qualquer uma)", () => {
    const faixas = new Set(SEED_STORIES.map((s) => s.faixa));
    expect(faixas.has("crianca")).toBe(true);
    expect(faixas.has("adolescente")).toBe(true);
    expect(faixas.has("adulto")).toBe(true);
  });
  it("toda pergunta pontuável tem gabarito válido e ≥1 correta", () => {
    for (const s of SEED_STORIES) for (const c of s.cenas) for (const q of c.perguntas) {
      if (q.gabarito === undefined) continue;
      const ids = new Set((q.opcoes ?? []).map((o) => o.id));
      const gab = Array.isArray(q.gabarito) ? q.gabarito : [q.gabarito];
      for (const g of gab) expect(ids.has(g)).toBe(true);
      expect((q.opcoes ?? []).some((o) => o.correta)).toBe(true);
    }
  });
});
