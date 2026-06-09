// Classificação de cada exercício por TIPO e DIFICULDADE.
// Proposta clínica inicial — pode ser ajustada pela terapeuta. Usada na tela
// de seleção de exercícios (filtros, badges e indicador de dificuldade).

export type ExerciseType = "visual" | "auditiva" | "verbal" | "espacial";
export type Difficulty = "facil" | "medio" | "dificil";

export interface ExerciseMeta {
  type: ExerciseType;
  difficulty: Difficulty;
}

export const EXERCISE_META: Record<string, ExerciseMeta> = {
  // Memória
  "span-numerico": { type: "auditiva", difficulty: "medio" },
  "span-numerico-inverso": { type: "auditiva", difficulty: "dificil" },
  "matriz-espacial": { type: "espacial", difficulty: "facil" },
  "matriz-espacial-inversa": { type: "espacial", difficulty: "medio" },
  "jogo-memoria": { type: "visual", difficulty: "facil" },
  // Atenção
  "trilha-visual": { type: "visual", difficulty: "facil" },
  "atencao-seletiva": { type: "visual", difficulty: "medio" },
  "atencao-sustentada": { type: "visual", difficulty: "medio" },
  "dual-task": { type: "visual", difficulty: "dificil" },
  "mot": { type: "espacial", difficulty: "dificil" },
  "focus-agents": { type: "visual", difficulty: "medio" },
  "focus-agents-auditivo": { type: "auditiva", difficulty: "medio" },
  // Funções Executivas
  "torre-hanoi": { type: "espacial", difficulty: "dificil" },
  "labirinto": { type: "espacial", difficulty: "medio" },
  "stroop-task": { type: "visual", difficulty: "medio" },
  "mudanca-regras": { type: "visual", difficulty: "medio" },
  "task-switching": { type: "visual", difficulty: "dificil" },
  "deductive-grid": { type: "espacial", difficulty: "dificil" },
  "ordem-historia": { type: "verbal", difficulty: "medio" },
  // Velocidade de Processamento
  "tempo-reacao": { type: "visual", difficulty: "facil" },
  "semaforo": { type: "visual", difficulty: "facil" },
  "certo-ou-errado": { type: "verbal", difficulty: "facil" },
  "corrida-tempo": { type: "visual", difficulty: "medio" },
  // Desenvolvimento Funcional
  "desafio-supermercado": { type: "visual", difficulty: "medio" },
  "desafio-supermercado-auditivo": { type: "auditiva", difficulty: "medio" },
  "caca-item-barato": { type: "visual", difficulty: "facil" },
  "compra-multifuncional": { type: "visual", difficulty: "dificil" },
  "desafio-orcamento": { type: "verbal", difficulty: "medio" },
  "antes-depois": { type: "verbal", difficulty: "facil" },
};

export const DEFAULT_META: ExerciseMeta = { type: "visual", difficulty: "medio" };
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
