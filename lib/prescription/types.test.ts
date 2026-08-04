import { describe, expect, it } from "vitest";
import { PARAMETER_CATEGORIES, parameterCategory } from "./types";

describe("categorias formais de parâmetros", () => {
  it.each([
    ["protocol", "DOSE_PARAMETER"],
    ["trials", "DOSE_PARAMETER"],
    ["atividadesSelecionadas", "DOSE_PARAMETER"],
    ["startLevel", "DIFFICULTY_PARAMETER"],
    ["level", "DIFFICULTY_PARAMETER"],
    ["allowReplay", "ASSISTIVE_PARAMETER"],
    ["presentationMode", "VARIANT_PARAMETER"],
    ["unlockIntruso", "VARIANT_PARAMETER"],
    ["unlockFalta", "VARIANT_PARAMETER"],
    ["feedback", "ADMINISTRATIVE_PARAMETER"],
    ["autoAdvance", "ADMINISTRATIVE_PARAMETER"],
  ] as const)("classifica %s em uma única categoria", (key, category) => {
    expect(parameterCategory(key)).toBe(category);
    expect(PARAMETER_CATEGORIES[key]).toBe(category);
  });

  it("devolve undefined para chave desconhecida sem lançar", () => {
    expect(() => parameterCategory("naoExiste")).not.toThrow();
    expect(parameterCategory("naoExiste")).toBeUndefined();
  });
});
