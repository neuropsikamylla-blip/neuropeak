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
  "nback": {
    id: "nback",
    name: "N-Back",
    domain: "memory" as Domain,
    description: "Identifique se o estímulo atual foi apresentado N posições atrás",
    estimatedMinutes: 8,
    icon: "🧠",
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
    domain: "attention" as Domain,
    description: "Siga a regra COR ou PALAVRA para identificar a resposta correta",
    estimatedMinutes: 8,
    icon: "🎨",
  },
  "vigilancia": {
    id: "vigilancia",
    name: "Vigilância",
    domain: "attention" as Domain,
    description: "Detecte estímulos alvo em uma sequência",
    estimatedMinutes: 7,
    icon: "👁️",
  },
  "tempo-reacao": {
    id: "tempo-reacao",
    name: "Tempo de Reação",
    domain: "processing" as Domain,
    description: "Reaja o mais rápido possível ao estímulo",
    estimatedMinutes: 5,
    icon: "⚡",
  },
  "decisao-rapida": {
    id: "decisao-rapida",
    name: "Decisão Rápida",
    domain: "processing" as Domain,
    description: "Classifique categorias rapidamente",
    estimatedMinutes: 7,
    icon: "🧩",
  },
  "identificacao-simbolos": {
    id: "identificacao-simbolos",
    name: "Identificação de Símbolos",
    domain: "processing" as Domain,
    description: "Encontre o símbolo alvo entre distratores",
    estimatedMinutes: 7,
    icon: "🔍",
  },
  "torre-hanoi": {
    id: "torre-hanoi",
    name: "Jogo das Torres",
    domain: "executive" as Domain,
    description: "Mova os discos usando o menor número de movimentos",
    estimatedMinutes: 10,
    icon: "🪅",
  },
  "sequenciamento": {
    id: "sequenciamento",
    name: "Sequenciamento",
    domain: "executive" as Domain,
    description: "Ordene etapas na sequência correta",
    estimatedMinutes: 7,
    icon: "📋",
  },
  "flexibilidade-cognitiva": {
    id: "flexibilidade-cognitiva",
    name: "Flexibilidade Cognitiva",
    domain: "executive" as Domain,
    description: "Mude de regra de classificação",
    estimatedMinutes: 7,
    icon: "🔄",
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
    description: "Encontre a palavra alvo entre distratores similares",
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
  "atencao-dividida": {
    id: "atencao-dividida",
    name: "Atenção Dividida",
    domain: "attention" as Domain,
    description: "Monitore dois fluxos de informação simultaneamente",
    estimatedMinutes: 8,
    icon: "👀",
  },
  "atencao-sustentada": {
    id: "atencao-sustentada",
    name: "Atenção Sustentada",
    domain: "attention" as Domain,
    description: "Mantenha o foco e detecte o estímulo alvo ao longo do tempo",
    estimatedMinutes: 8,
    icon: "🔔",
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
