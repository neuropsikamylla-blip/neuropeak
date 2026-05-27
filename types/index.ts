export type UserRole = "THERAPIST" | "PATIENT";
export type Theme = "CLINICAL" | "COLORFUL" | "GAMIFIED";
export type AlertType = "MISSED_SESSION" | "PERFORMANCE_DROP" | "GOAL_REACHED" | "CYCLE_COMPLETE";
export type Domain = "memory" | "attention" | "processing" | "executive";

export interface ExerciseResult {
  exerciseId: string;
  domain: Domain;
  score: number;
  accuracy: number;
  reactionTime?: number;
  difficulty: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface NormativeBenchmark {
  ageGroup: string;
  minAge: number;
  maxAge: number;
  memory: { mean: number; sd: number };
  attention: { mean: number; sd: number };
  processing: { mean: number; sd: number };
  executive: { mean: number; sd: number };
}

export interface DomainScore {
  domain: Domain;
  score: number;
  percentile?: number;
  sessions: number;
}

export interface PatientSummary {
  id: string;
  name: string;
  lastSession: Date | null;
  adherence: number;
  trend: "up" | "down" | "stable";
  alertCount: number;
  domainScores: DomainScore[];
  theme: Theme;
}

export interface AdaptiveResult {
  newDifficulty: number;
  action: "increase" | "decrease" | "maintain";
  reason: string;
}

export interface ExerciseConfig {
  exerciseId: string;
  currentDifficulty: number;
  totalAttempts: number;
  lastAttemptAt: Date | null;
}

export interface AchievementDefinition {
  type: string;
  title: string;
  description: string;
  icon: string;
  condition: (sessions: SessionData[]) => boolean;
}

export interface SessionData {
  exerciseId: string;
  domain: string;
  score: number;
  accuracy: number;
  reactionTime?: number | null;
  difficulty: number;
  duration: number;
  completedAt: Date;
}

export interface TrainingPlanData {
  domains: string[];
  sessionDuration: number;
  frequency: number;
  exercises: string[];
  isActive: boolean;
}

export interface ReportData {
  patient: {
    id: string;
    name: string;
    birthDate: Date;
    diagnosis: string | null;
    cid: string | null;
    education: string | null;
  };
  therapist: {
    name: string;
    clinicName: string | null;
  };
  period: {
    start: Date;
    end: Date;
  };
  totalSessions: number;
  domainScores: DomainScore[];
  sessionHistory: SessionData[];
  achievements: {
    type: string;
    title: string;
    unlockedAt: Date;
  }[];
  recommendations: string;
}

export const EXERCISE_DEFINITIONS = {
  "span-numerico": {
    id: "span-numerico",
    name: "Span Numérico",
    domain: "memory" as Domain,
    description: "Memorize e repita sequências de números",
    estimatedMinutes: 7,
    icon: "🔢",
  },
  "matriz-espacial": {
    id: "matriz-espacial",
    name: "Matriz Espacial",
    domain: "memory" as Domain,
    description: "Memorize e reproduza padrões em uma grade",
    estimatedMinutes: 7,
    icon: "🔲",
  },
  "jogo-memoria": {
    id: "jogo-memoria",
    name: "Jogo da Memória",
    domain: "memory" as Domain,
    description: "Encontre os pares de figuras iguais",
    estimatedMinutes: 7,
    icon: "🃏",
  },
  "span-numerico-inverso": {
    id: "span-numerico-inverso",
    name: "Span Numérico Inverso",
    domain: "memory" as Domain,
    description: "Repita sequências de números em ordem contrária",
    estimatedMinutes: 7,
    icon: "🔁",
  },
  "matriz-espacial-inversa": {
    id: "matriz-espacial-inversa",
    name: "Matriz Espacial Inversa",
    domain: "memory" as Domain,
    description: "Clique nas células na ordem inversa à apresentada",
    estimatedMinutes: 7,
    icon: "↩️",
  },
  "trilha-visual": {
    id: "trilha-visual",
    name: "Conecta Números",
    domain: "attention" as Domain,
    description: "Toque os números em ordem crescente, do menor ao maior",
    estimatedMinutes: 7,
    icon: "🔢",
  },
  "stroop-task": {
    id: "stroop-task",
    name: "Cores e Palavras",
    domain: "executive" as Domain,
    description: "Siga a regra COR ou PALAVRA para identificar a resposta correta",
    estimatedMinutes: 8,
    icon: "🎨",
  },
  "tempo-reacao": {
    id: "tempo-reacao",
    name: "Tempo de Reação",
    domain: "processing" as Domain,
    description: "Reaja o mais rápido possível ao estímulo",
    estimatedMinutes: 5,
    icon: "⚡",
  },
  "torre-hanoi": {
    id: "torre-hanoi",
    name: "Jogo das Torres",
    domain: "executive" as Domain,
    description: "Mova os discos usando o menor número de movimentos",
    estimatedMinutes: 10,
    icon: "🪅",
  },
  "labirinto": {
    id: "labirinto",
    name: "Labirinto",
    domain: "executive" as Domain,
    description: "Navegue pelo labirinto até a saída",
    estimatedMinutes: 8,
    icon: "🌀",
  },
  "ordem-historia": {
    id: "ordem-historia",
    name: "Ordem da História",
    domain: "executive" as Domain,
    description: "Coloque os painéis de uma história cotidiana na ordem correta",
    estimatedMinutes: 8,
    icon: "📖",
  },
  "certo-ou-errado": {
    id: "certo-ou-errado",
    name: "Certo ou Errado",
    domain: "processing" as Domain,
    description: "Decida se uma situação do dia a dia está correta ou errada",
    estimatedMinutes: 7,
    icon: "✅",
  },
  "semaforo": {
    id: "semaforo",
    name: "Semáforo",
    domain: "processing" as Domain,
    description: "Reaja ao sinal certo: avance no verde, pare no vermelho",
    estimatedMinutes: 6,
    icon: "🚦",
  },
  "antes-depois": {
    id: "antes-depois",
    name: "Antes e Depois",
    domain: "attention" as Domain,
    description: "O que vem antes ou depois: dias, meses, números e rotinas",
    estimatedMinutes: 7,
    icon: "📅",
  },
  "atencao-seletiva": {
    id: "atencao-seletiva",
    name: "Atenção Seletiva",
    domain: "attention" as Domain,
    description: "Responda ao estímulo alvo e iniba respostas aos distratores",
    estimatedMinutes: 7,
    icon: "🎯",
  },
  "atencao-alternada": {
    id: "atencao-alternada",
    name: "Atenção Alternada",
    domain: "attention" as Domain,
    description: "Alterne entre duas regras de classificação",
    estimatedMinutes: 7,
    icon: "🔀",
  },
  "atencao-sustentada": {
    id: "atencao-sustentada",
    name: "Atenção Sustentada",
    domain: "attention" as Domain,
    description: "Responda apenas ao padrão X após A — resistência mental e vigilância",
    estimatedMinutes: 8,
    icon: "🔔",
  },
  "desafio-supermercado": {
    id: "desafio-supermercado",
    name: "Desafio do Supermercado",
    domain: "memory" as Domain,
    description: "Memorize a lista de compras e encontre os itens na prateleira",
    estimatedMinutes: 8,
    icon: "🛒",
  },
  "desafio-cidade": {
    id: "desafio-cidade",
    name: "Desafio da Cidade",
    domain: "executive" as Domain,
    description: "Resolva missões em ambientes da cidade: mercado, cinema e mais",
    estimatedMinutes: 10,
    icon: "🏙️",
  },
  "corrida-tempo": {
    id: "corrida-tempo",
    name: "Corrida contra o Tempo",
    domain: "processing" as Domain,
    description: "Colete todos os itens da categoria antes que o tempo acabe",
    estimatedMinutes: 6,
    icon: "⏱️",
  },
  "desafio-orcamento": {
    id: "desafio-orcamento",
    name: "Desafio do Orçamento",
    domain: "executive" as Domain,
    description: "Monte uma cesta de compras respeitando o orçamento e a meta",
    estimatedMinutes: 8,
    icon: "💰",
  },
  "caca-item-barato": {
    id: "caca-item-barato",
    name: "Caça ao Item Mais Barato",
    domain: "attention" as Domain,
    description: "Compare embalagens e encontre a que tem o menor preço por unidade",
    estimatedMinutes: 7,
    icon: "🏷️",
  },
  "mudanca-regras": {
    id: "mudanca-regras",
    name: "Mudança de Regras",
    domain: "executive" as Domain,
    description: "Selecione produtos seguindo a regra atual — ela pode mudar a qualquer momento",
    estimatedMinutes: 8,
    icon: "🔀",
  },
  "compra-multifuncional": {
    id: "compra-multifuncional",
    name: "Compra Multifuncional",
    domain: "executive" as Domain,
    description: "Respeite orçamento, categoria e quantidade ao mesmo tempo dentro do limite de tempo",
    estimatedMinutes: 9,
    icon: "🛒",
  },
  "task-switching": {
    id: "task-switching",
    name: "Task Switching",
    domain: "executive" as Domain,
    description: "Classifique cartões conforme a regra que muda — cor, número ou forma",
    estimatedMinutes: 8,
    icon: "🔄",
  },
  "mot": {
    id: "mot",
    name: "Rastreamento de Objetos",
    domain: "attention" as Domain,
    description: "Acompanhe os objetos-alvo enquanto todos se movem",
    estimatedMinutes: 8,
    icon: "👁️",
  },
  "dual-task": {
    id: "dual-task",
    name: "Dupla Tarefa",
    domain: "attention" as Domain,
    description: "Faça duas tarefas ao mesmo tempo: visual e de monitoramento",
    estimatedMinutes: 8,
    icon: "🧠",
  },
  "deductive-grid": {
    id: "deductive-grid",
    name: "Grade Dedutiva",
    domain: "executive" as Domain,
    description: "Deduza quem faz o quê usando pistas lógicas — raciocínio por eliminação",
    estimatedMinutes: 10,
    icon: "🔍",
  },
} as const;

export type ExerciseId = keyof typeof EXERCISE_DEFINITIONS;

export const DOMAIN_LABELS: Record<Domain, string> = {
  memory: "Memória",
  attention: "Atenção",
  processing: "Velocidade de Processamento",
  executive: "Funções Executivas",
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  memory: "#2563EB",
  attention: "#7C3AED",
  processing: "#EA580C",
  executive: "#0D9488",
};
