import type { Domain } from "@/types";

// ── Hierarquia compartilhada: Domínio → Subárea → Exercícios ─────────────────
// Usada na seleção de domínios do plano e no catálogo do Treino Cognitivo.

export interface Subarea {
  subarea: string;
  exercises: string[];
}

export const ALL_DOMAINS: Domain[] = ["memory", "attention", "executive", "processing", "functional"];

export const DOMAIN_SUBAREAS: Record<Domain, Subarea[]> = {
  memory: [
    { subarea: "Memória de trabalho", exercises: ["span-numerico", "span-numerico-inverso"] },
    { subarea: "Memória visuoespacial", exercises: ["matriz-espacial", "matriz-espacial-inversa"] },
    { subarea: "Memória do cotidiano", exercises: ["jogo-memoria"] },
  ],
  attention: [
    { subarea: "Atenção seletiva", exercises: ["trilha-visual", "atencao-seletiva"] },
    { subarea: "Atenção sustentada", exercises: ["atencao-sustentada"] },
    { subarea: "Atenção alternada / dividida", exercises: ["dual-task"] },
    { subarea: "Rastreamento atencional", exercises: ["mot", "focus-agents", "focus-agents-auditivo"] },
  ],
  executive: [
    { subarea: "Planejamento", exercises: ["torre-hanoi", "labirinto"] },
    { subarea: "Controle inibitório", exercises: ["stroop-task"] },
    { subarea: "Flexibilidade cognitiva", exercises: ["mudanca-regras", "task-switching"] },
    { subarea: "Raciocínio lógico", exercises: ["deductive-grid", "ordem-historia"] },
  ],
  processing: [
    { subarea: "Tempo de reação", exercises: ["tempo-reacao", "semaforo"] },
    { subarea: "Decisão rápida", exercises: ["certo-ou-errado", "corrida-tempo"] },
  ],
  // Desenvolvimento Funcional — exercícios do cotidiano (compras, dinheiro, rotina).
  functional: [
    { subarea: "Compras e mercado", exercises: ["desafio-supermercado", "desafio-supermercado-auditivo", "caca-item-barato", "compra-multifuncional"] },
    { subarea: "Dinheiro e orçamento", exercises: ["desafio-orcamento"] },
    { subarea: "Rotina e sequência", exercises: ["antes-depois"] },
  ],
};

export const DOMAIN_EXERCISES: Record<Domain, string[]> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d, DOMAIN_SUBAREAS[d].flatMap((s) => s.exercises)])
) as Record<Domain, string[]>;

// Quantidade real de exercícios por domínio (mostrada nos cards de seleção/catálogo).
export const DOMAIN_COUNTS: Record<Domain, number> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d, DOMAIN_EXERCISES[d].length])
) as Record<Domain, number>;

// Domínio de cada exercício segundo a taxonomia (não o domain de EXERCISE_DEFINITIONS).
export const EXERCISE_DOMAIN: Record<string, Domain> = (() => {
  const map: Record<string, Domain> = {};
  for (const d of ALL_DOMAINS) for (const ex of DOMAIN_EXERCISES[d]) map[ex] = d;
  return map;
})();
