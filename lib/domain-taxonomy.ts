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
    { id: "operacional", label: "Memória Operacional", exercises: ["span-numerico", "span-numerico-inverso", "letras-sequencia", "sequencia-itens", "lista-distracao", "restaurante-ordem", "desafio-supermercado", "nback"] },
    { id: "visuoespacial", label: "Memória Visuoespacial", exercises: ["jogo-memoria", "matriz-espacial", "matriz-espacial-inversa", "padroes-rotacao", "cubo-corsi"] },
    { id: "episodica", label: "Memória Episódica", exercises: [] },
    { id: "semantica", label: "Memória Semântica", exercises: [] },
  ],
  attention: [
    { id: "seletiva", label: "Atenção Seletiva", exercises: ["trilha-visual"] },
    { id: "sustentada", label: "Atenção Sustentada", exercises: ["focus-agents", "vigilancia"] },
    { id: "alternada", label: "Atenção Alternada", exercises: [] },
    { id: "dividida", label: "Atenção Dividida", exercises: ["dual-task", "mot"] },
  ],
  executive: [
    { id: "planejamento", label: "Planejamento", exercises: ["torre-hanoi", "labirinto", "estacionamento-logico"] },
    { id: "inibitorio", label: "Controle Inibitório", exercises: ["stroop-task"] },
    { id: "flexibilidade", label: "Flexibilidade Cognitiva", exercises: ["mudanca-regras", "task-switching"] },
    { id: "decisao", label: "Tomada de Decisão", exercises: [] },
    { id: "problemas", label: "Resolução de Problemas", exercises: [] },
    { id: "logico", label: "Raciocínio Lógico", exercises: ["deductive-grid", "ordem-historia"] },
    { id: "temporal", label: "Planejamento e Flexibilidade", exercises: ["antes-depois"] },
  ],
  processing: [
    { id: "reacao", label: "Tempo de Reação", exercises: ["tempo-reacao", "semaforo"] },
    { id: "busca-visual", label: "Busca Visual Rápida", exercises: ["identificacao-simbolos"] },
    { id: "resposta-rapida", label: "Resposta Rápida", exercises: ["certo-ou-errado", "corrida-tempo"] },
  ],
  functional: [
    { id: "rotina", label: "Rotina", exercises: [] },
    { id: "sequenciamento", label: "Sequenciamento Temporal", exercises: [] },
    { id: "avd", label: "Atividades de Vida Diária", exercises: ["caca-item-barato"] },
    { id: "autonomia", label: "Autonomia", exercises: ["compra-multifuncional"] },
    { id: "cognicao-social", label: "Cognição Social", exercises: ["investigadores-sociais"] },
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

// Subdomínio (id e label) de cada exercício.
export const EXERCISE_SUBDOMAIN: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const d of ALL_DOMAINS) for (const s of DOMAIN_SUBDOMAINS[d]) for (const ex of s.exercises) map[ex] = s.label;
  return map;
})();
export const EXERCISE_SUBDOMAIN_ID: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const d of ALL_DOMAINS) for (const s of DOMAIN_SUBDOMAINS[d]) for (const ex of s.exercises) map[ex] = s.id;
  return map;
})();

// Cor suave de cada subdomínio (tag de categoria). Dentro de um domínio as
// cores são distintas, como numa biblioteca clínica.
const PALETTE: Record<string, { bg: string; text: string }> = {
  azul: { bg: "#EFF6FF", text: "#2563EB" },
  roxo: { bg: "#F5F3FF", text: "#7C3AED" },
  rosa: { bg: "#FDF2F8", text: "#DB2777" },
  verde: { bg: "#F0FDF4", text: "#16A34A" },
  ambar: { bg: "#FFFBEB", text: "#D97706" },
  teal: { bg: "#F0FDFA", text: "#0D9488" },
  indigo: { bg: "#EEF2FF", text: "#4F46E5" },
};
const SUBDOMAIN_PALETTE: Record<string, keyof typeof PALETTE> = {
  // Memória
  operacional: "azul", visuoespacial: "roxo", episodica: "rosa", semantica: "verde",
  // Atenção
  seletiva: "ambar", sustentada: "azul", alternada: "roxo", dividida: "rosa",
  // Funções Executivas
  planejamento: "azul", inibitorio: "ambar", flexibilidade: "roxo", decisao: "rosa", problemas: "teal", logico: "indigo",
  // Velocidade de Processamento
  reacao: "azul", "busca-visual": "ambar", "resposta-rapida": "rosa",
  // Desenvolvimento Funcional
  rotina: "verde", sequenciamento: "azul", avd: "ambar", autonomia: "roxo",
};
const NEUTRAL = { bg: "#F1F5F9", text: "#475569" };
export const subdomainColor = (id: string): { bg: string; text: string } =>
  PALETTE[SUBDOMAIN_PALETTE[id]] ?? NEUTRAL;
