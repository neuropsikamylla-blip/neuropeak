import { describe, expect, it } from "vitest";
import { ALL_DOMAINS, DOMAIN_EXERCISES } from "@/lib/domain-taxonomy";
import { EXERCISE_DEFINITIONS } from "@/types";
import { presentCatalogExercise } from "@/lib/prescription/presentation";

/**
 * A biblioteca da tela de plano passou a montar cada cartão a partir da prescrição
 * (`presentCatalogExercise`), descartando quem não tem entrada no catálogo. Hoje a cobertura é
 * total, mas o descarte é silencioso: um exercício acrescentado à taxonomia sem parâmetros de
 * prescrição sumiria da tela sem erro nenhum. Este teste transforma esse sumiço num teste
 * vermelho.
 */
describe("cobertura de prescrição da biblioteca de exercícios", () => {
  const visibleIds = ALL_DOMAINS
    .flatMap((domain) => DOMAIN_EXERCISES[domain])
    .filter((id) => Boolean(EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS]));

  it("mostra os 34 exercícios canônicos", () => {
    expect(new Set(visibleIds).size).toBe(34);
  });

  it("todo exercício visível tem parâmetros de prescrição", () => {
    const missing = visibleIds.filter((id) => !presentCatalogExercise(id));
    expect(
      missing,
      "sem entrada no catálogo de prescrição, estes exercícios sumiriam da biblioteca",
    ).toEqual([]);
  });
});
