import { describe, expect, it } from "vitest";
import {
  FOCUS_MODES,
  buildFocusCompletionMetadata,
  focusLevelFromStep,
  resolveFocusStartStep,
  STEPS,
  FOCUS_MAX_LEVEL,
} from "@/lib/focus/progression";

describe("progressão do Focus Agentes", () => {
  it.each([0, 6, 12])("restaura fielmente o passo %i", (step) => {
    const savedLevel = focusLevelFromStep(step);

    expect(resolveFocusStartStep(savedLevel, savedLevel)).toBe(step);
  });

  it("usa a conversão antiga de difficulty somente como fallback", () => {
    expect(resolveFocusStartStep(undefined, 13)).toBe(5);
    expect(resolveFocusStartStep(13, 13)).toBe(12);
  });

  it.each(FOCUS_MODES)("emite level numérico e o modo %s", (mode) => {
    const metadata = buildFocusCompletionMetadata({
      trials: 8,
      correct: 7,
      omissions: 1,
      avgRT: 1200,
      step: 6,
      mode,
    });

    expect(metadata.level).toBe(7);
    expect(typeof metadata.level).toBe("number");
    expect(FOCUS_MODES).toContain(metadata.mode);
    expect(metadata.mode).toBe(mode);
    expect(metadata).not.toHaveProperty("nivel");
  });
});

// ── Escada do MODO ÚNICO ─────────────────────────────────────────────────────
describe("STEPS — escada de 13 passos", () => {
  it("tem 13 passos, um por nível persistido", () => {
    expect(STEPS.length).toBe(FOCUS_MAX_LEVEL);
  });

  it("entre dois passos consecutivos muda UMA variável só", () => {
    for (let i = 1; i < STEPS.length; i++) {
      const a = STEPS[i - 1], b = STEPS[i];
      const mudou = [a.etapa !== b.etapa, a.n !== b.n, a.vel !== b.vel, a.semelhantes !== b.semelhantes]
        .filter(Boolean).length;
      expect(mudou, `passo ${i} → ${i + 1} mudou ${mudou} variáveis`).toBe(1);
    }
  });

  it("toda troca de etapa acontece com a cena parada", () => {
    for (let i = 1; i < STEPS.length; i++) {
      const a = STEPS[i - 1], b = STEPS[i];
      if (a.etapa === b.etapa) continue;
      expect({ n: b.n, vel: b.vel, sem: b.semelhantes }, `troca de etapa no passo ${i + 1} mexeu na cena`)
        .toEqual({ n: a.n, vel: a.vel, sem: a.semelhantes });
    }
  });

  it("a dificuldade nunca retrocede ao longo da escada", () => {
    for (let i = 1; i < STEPS.length; i++) {
      expect(STEPS[i].n).toBeGreaterThanOrEqual(STEPS[i - 1].n);
      expect(STEPS[i].vel).toBeGreaterThanOrEqual(STEPS[i - 1].vel);
    }
  });

  it("as 6 etapas aparecem, na ordem de carga cognitiva", () => {
    const ordem = [...new Set(STEPS.map((s) => s.etapa))];
    expect(ordem).toEqual(["cor", "acessorio", "corAcessorio", "doisAlvos", "mudancaRegra", "inibicao"]);
  });
});
