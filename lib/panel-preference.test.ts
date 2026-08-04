import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PANEL_PREFERENCE,
  normalizePanelPreference,
  toggleOpenExercise,
  togglePanelPreference,
  type PanelPreference,
} from "./panel-preference";

describe("preferência visual dos painéis do plano", () => {
  it("nunca produz os dois painéis recolhidos a partir dos três estados válidos", () => {
    const transitions: Array<[PanelPreference, "library" | "plan", PanelPreference]> = [
      [{ libraryOpen: true, planOpen: true }, "library", { libraryOpen: false, planOpen: true }],
      [{ libraryOpen: true, planOpen: true }, "plan", { libraryOpen: true, planOpen: false }],
      [{ libraryOpen: false, planOpen: true }, "plan", { libraryOpen: true, planOpen: false }],
      [{ libraryOpen: true, planOpen: false }, "library", { libraryOpen: false, planOpen: true }],
    ];

    for (const [state, panel, expected] of transitions) {
      const next = togglePanelPreference(state, panel);
      expect(next).toEqual(expected);
      expect(next.libraryOpen || next.planOpen).toBe(true);
    }
  });

  it("restaura valor válido e usa o padrão para storage ausente, inválido ou corrompido", () => {
    expect(normalizePanelPreference('{"libraryOpen":false,"planOpen":true}')).toEqual({
      libraryOpen: false,
      planOpen: true,
    });
    expect(normalizePanelPreference(null)).toEqual(DEFAULT_PANEL_PREFERENCE);
    expect(normalizePanelPreference('{"libraryOpen":false,"planOpen":false}')).toEqual(DEFAULT_PANEL_PREFERENCE);
    expect(normalizePanelPreference("{não é json")).toEqual(DEFAULT_PANEL_PREFERENCE);
  });

  it("mantém apenas um ajuste aberto por vez", () => {
    expect(toggleOpenExercise("A", "B")).toBe("B");
    expect(toggleOpenExercise("B", "B")).toBeNull();
  });

  it("não lê localStorage no inicializador de useState", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/plano/usePanelPreference.ts"),
      "utf8",
    );

    // Sem a flag /s, que o target do projeto (anterior a ES2018) rejeita: ela só afetaria o `.`,
    // e este padrão não usa nenhum — `[^;]*` já atravessa quebras de linha por ser classe negada.
    expect(source).not.toMatch(/useState\s*(?:<[^>]+>)?\s*\([^;]*localStorage/);
  });
});
