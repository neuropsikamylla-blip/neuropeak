// Classificação de cada exercício por TIPO e DIFICULDADE.
// Proposta clínica inicial — pode ser ajustada pela terapeuta. Usada na tela
// de seleção de exercícios (filtros, badges e indicador de dificuldade).

export type ExerciseType = "visual" | "auditiva" | "verbal" | "espacial";
export type Difficulty = "facil" | "medio" | "dificil";

export interface ExerciseMeta {
  type: ExerciseType;
  difficulty: Difficulty;
  /** Habilidades secundárias trabalhadas (além do domínio/subdomínio principal). */
  secondary: string[];
}

export const EXERCISE_META: Record<string, ExerciseMeta> = {
  // Memória
  "span-numerico": { type: "auditiva", difficulty: "facil", secondary: ["Atenção Sustentada"] },
  "span-numerico-inverso": { type: "auditiva", difficulty: "medio", secondary: ["Atenção Sustentada", "Memória de Trabalho"] },
  "matriz-espacial": { type: "espacial", difficulty: "facil", secondary: ["Atenção Visual", "Percepção Espacial"] },
  "matriz-espacial-inversa": { type: "espacial", difficulty: "medio", secondary: ["Atenção Visual", "Memória de Trabalho"] },
  "jogo-memoria": { type: "visual", difficulty: "facil", secondary: ["Atenção Visual", "Discriminação Visual"] },
  "desafio-supermercado": { type: "visual", difficulty: "medio", secondary: ["Atenção Seletiva", "Atividades de Vida Diária"] },
  "desafio-supermercado-auditivo": { type: "auditiva", difficulty: "medio", secondary: ["Atenção Seletiva", "Atividades de Vida Diária"] },
  // Atenção
  "trilha-visual": { type: "visual", difficulty: "facil", secondary: ["Tempo de Reação"] },
  "atencao-seletiva": { type: "visual", difficulty: "medio", secondary: ["Busca Visual Rápida"] },
  "atencao-sustentada": { type: "visual", difficulty: "medio", secondary: ["Controle Inibitório"] },
  "dual-task": { type: "visual", difficulty: "dificil", secondary: ["Flexibilidade Cognitiva"] },
  "mot": { type: "espacial", difficulty: "dificil", secondary: ["Atenção Seletiva"] },
  "focus-agents": { type: "visual", difficulty: "medio", secondary: ["Atenção Seletiva"] },
  "focus-agents-auditivo": { type: "auditiva", difficulty: "medio", secondary: ["Atenção Seletiva"] },
  // Funções Executivas
  "torre-hanoi": { type: "espacial", difficulty: "dificil", secondary: ["Resolução de Problemas"] },
  "labirinto": { type: "espacial", difficulty: "medio", secondary: ["Memória Visuoespacial"] },
  "stroop-task": { type: "visual", difficulty: "medio", secondary: ["Atenção Seletiva"] },
  "mudanca-regras": { type: "visual", difficulty: "medio", secondary: ["Tomada de Decisão"] },
  "task-switching": { type: "visual", difficulty: "dificil", secondary: ["Atenção Alternada"] },
  "deductive-grid": { type: "espacial", difficulty: "dificil", secondary: ["Resolução de Problemas"] },
  "ordem-historia": { type: "verbal", difficulty: "medio", secondary: ["Sequenciamento Temporal"] },
  // Velocidade de Processamento
  "tempo-reacao": { type: "visual", difficulty: "facil", secondary: ["Atenção Sustentada"] },
  "semaforo": { type: "visual", difficulty: "facil", secondary: ["Controle Inibitório"] },
  "certo-ou-errado": { type: "verbal", difficulty: "facil", secondary: ["Controle Inibitório"] },
  "corrida-tempo": { type: "visual", difficulty: "medio", secondary: ["Atenção Seletiva"] },
  // Desenvolvimento Funcional
  "caca-item-barato": { type: "visual", difficulty: "facil", secondary: ["Atenção Seletiva"] },
  "compra-multifuncional": { type: "visual", difficulty: "dificil", secondary: ["Tomada de Decisão", "Memória Operacional"] },
  "desafio-orcamento": { type: "verbal", difficulty: "medio", secondary: ["Raciocínio Lógico"] },
  "antes-depois": { type: "verbal", difficulty: "facil", secondary: ["Memória Episódica"] },
};

export const DEFAULT_META: ExerciseMeta = { type: "visual", difficulty: "medio", secondary: [] };
export const metaOf = (id: string): ExerciseMeta => EXERCISE_META[id] ?? DEFAULT_META;

// ── Apresentação ─────────────────────────────────────────────────────────────
export const TYPE_INFO: Record<ExerciseType, { label: string; text: string; bg: string }> = {
  visual: { label: "Visual", text: "#0369A1", bg: "#E0F2FE" },
  auditiva: { label: "Auditiva", text: "#B45309", bg: "#FEF3C7" },
  verbal: { label: "Verbal", text: "#6D28D9", bg: "#EDE9FE" },
  espacial: { label: "Espacial", text: "#0F766E", bg: "#CCFBF1" },
};

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; dots: number; color: string }> = {
  facil: { label: "Fácil", dots: 1, color: "#059669" },
  medio: { label: "Médio", dots: 2, color: "#D97706" },
  dificil: { label: "Difícil", dots: 3, color: "#DC2626" },
};

// Chips de filtro por tipo (ordem fixa). "todos" é o estado padrão.
export const TYPE_FILTERS: { value: ExerciseType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "visual", label: "Visual" },
  { value: "auditiva", label: "Auditiva" },
  { value: "verbal", label: "Verbal" },
  { value: "espacial", label: "Espacial" },
];
