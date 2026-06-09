import type { Domain } from "@/types";

// ── Hierarquia clínica: Domínio → Subdomínio → Exercícios ────────────────────
// Subdomínios sem exercícios ainda ("a criar") aparecem na navegação como
// espaços prontos para o NeuroPeak crescer.

export interface Subdomain {
  id: string;
  label: string;
  exercises: string[];
}

export const ALL_DOMAINS: Domain[] = ["memory", "attention", "executive", "processing", "functional"];

export const DOMAIN_SUBDOMAINS: Record<Domain, Subdomain[]> = {
  memory: [
    { id: "operacional", label: "Memória Operacional", exercises: ["span-numerico", "span-numerico-inverso", "desafio-supermercado", "desafio-supermercado-auditivo"] },
    { id: "episodica", label: "Memória Episódica", exercises: ["jogo-memoria"] },
    { id: "semantica", label: "Memória Semântica", exercises: [] },
    { id: "visuoespacial", label: "Memória Visuoespacial", exercises: ["matriz-espacial", "matriz-espacial-inversa"] },
  ],
  attention: [
    { id: "seletiva", label: "Atenção Seletiva", exercises: ["trilha-visual", "atencao-seletiva"] },
    { id: "sustentada", label: "Atenção Sustentada", exercises: ["atencao-sustentada", "focus-agents", "focus-agents-auditivo"] },
    { id: "alternada", label: "Atenção Alternada", exercises: [] },
    { id: "dividida", label: "Atenção Dividida", exercises: ["dual-task", "mot"] },
  ],
  executive: [
    { id: "planejamento", label: "Planejamento", exercises: ["torre-hanoi", "labirinto"] },
    { id: "inibitorio", label: "Controle Inibitório", exercises: ["stroop-task"] },
    { id: "flexibilidade", label: "Flexibilidade Cognitiva", exercises: ["mudanca-regras", "task-switching"] },
    { id: "decisao", label: "Tomada de Decisão", exercises: [] },
    { id: "problemas", label: "Resolução de Problemas", exercises: [] },
    { id: "logico", label: "Raciocínio Lógico", exercises: ["deductive-grid", "ordem-historia"] },
  ],
  processing: [
    { id: "reacao", label: "Tempo de Reação", exercises: ["tempo-reacao", "semaforo"] },
    { id: "busca-visual", label: "Busca Visual Rápida", exercises: [] },
    { id: "resposta-rapida", label: "Resposta Rápida", exercises: ["certo-ou-errado", "corrida-tempo"] },
  ],
  functional: [
    { id: "rotina", label: "Rotina", exercises: [] },
    { id: "sequenciamento", label: "Sequenciamento Temporal", exercises: ["antes-depois"] },
    { id: "avd", label: "Atividades de Vida Diária", exercises: ["compra-multifuncional", "caca-item-barato"] },
    { id: "autonomia", label: "Autonomia", exercises: ["desafio-orcamento"] },
  ],
};

export const DOMAIN_EXERCISES: Record<Domain, string[]> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d, DOMAIN_SUBDOMAINS[d].flatMap((s) => s.exercises)])
) as Record<Domain, string[]>;

// Quantidade real de exercícios por domínio (mostrada nos cards de seleção/catálogo).
export const DOMAIN_COUNTS: Record<Domain, number> = Object.fromEntries(
  ALL_DOMAINS.map((d) => [d, DOMAIN_EXERCISES[d].length])
) as Record<Domain, number>;

// Domínio de cada exercício segundo a taxonomia (não o domain de EXERCISE_DEFINITIONS).
export const EXERCISE_DOMAIN: Record<string, Domain> = (() => {
  const map: Record<string, Domain> = {};
  for (const d of ALL_DOMAINS) for (const s of DOMAIN_SUBDOMAINS[d]) for (const ex of s.exercises) map[ex] = d;
  return map;
})();

// Subdomínio (label) de cada exercício.
export const EXERCISE_SUBDOMAIN: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const d of ALL_DOMAINS) for (const s of DOMAIN_SUBDOMAINS[d]) for (const ex of s.exercises) map[ex] = s.label;
  return map;
})();
