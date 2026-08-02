import { describe, expect, it } from "vitest";
import {
  FOCUS_MODES,
  buildFocusCompletionMetadata,
  focusLevelFromStep,
  resolveFocusStartStep,
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
