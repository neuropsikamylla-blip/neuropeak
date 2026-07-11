import { describe, it, expect } from "vitest";
import { DOMAIN_SUBDOMAINS, ALL_DOMAINS } from "@/lib/domain-taxonomy";
import { EXERCISE_META } from "@/lib/exercise-meta";
import { EXERCISE_DEFINITIONS } from "@/types";

// Guarda contra o finding ARQ-001: o catálogo do terapeuta itera a taxonomia e
// busca cada exercício em EXERCISE_DEFINITIONS (nome/domínio) e EXERCISE_META
// (tipo/dificuldade). Se um exercício da taxonomia faltar em qualquer um dos dois,
// ele some do catálogo ou aparece com badge errado (cai no DEFAULT_META). Este
// teste garante que os três catálogos fiquem coerentes.

const taxonomyIds = ALL_DOMAINS.flatMap((d) =>
  DOMAIN_SUBDOMAINS[d].flatMap((s) => s.exercises)
);

describe("catálogo de exercícios (ARQ-001)", () => {
  it("todo exercício da taxonomia existe em EXERCISE_DEFINITIONS", () => {
    const missing = taxonomyIds.filter((id) => !(id in EXERCISE_DEFINITIONS));
    expect(missing, `sem definição: ${missing.join(", ")}`).toEqual([]);
  });

  it("todo exercício da taxonomia tem classificação em EXERCISE_META (badge correto)", () => {
    const missing = taxonomyIds.filter((id) => !(id in EXERCISE_META));
    expect(missing, `sem meta (badge errado): ${missing.join(", ")}`).toEqual([]);
  });

  it("não há ids duplicados na taxonomia", () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const id of taxonomyIds) { if (seen.has(id)) dups.push(id); seen.add(id); }
    expect(dups, `duplicados: ${dups.join(", ")}`).toEqual([]);
  });
});
