export type UserRole = "THERAPIST" | "PATIENT";
export type Theme = "CLINICAL" | "COLORFUL" | "GAMIFIED";
export type AlertType = "MISSED_SESSION" | "PERFORMANCE_DROP" | "GOAL_REACHED";
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
    estimatedMinutes: 5,
    icon: "🔢",
  },
  "matriz-espacial": {
    id: "matriz-espacial",
    name: "Matriz Espacial",
    domain: "memory" as Domain,
    description: "Memorize e reproduza padrões em uma grade",
    estimatedMinutes: 5,
    icon: "🔲",
  },
  "associacao-pares": {
    id: "associacao-pares",
    name: "Associação de Pares",
    domain: "memory" as Domain,
    description: "Associe palavras e imagens",
    estimatedMinutes: 7,
    icon: "🔗",
  },
  "trilha-visual": {
    id: "trilha-visual",
    name: "Trilha Visual",
    domain: "attention" as Domain,
    description: "Conecte números em sequência",
    estimatedMinutes: 5,
    icon: "🗺️",
  },
  "stroop-task": {
    id: "stroop-task",
    name: "Tarefa Stroop",
    domain: "attention" as Domain,
    description: "Identifique a cor da tinta, não a palavra",
    estimatedMinutes: 5,
    icon: "🎨",
  },
  "vigilancia": {
    id: "vigilancia",
    name: "Vigilância",
    domain: "attention" as Domain,
    description: "Detecte estímulos alvo em uma sequência",
    estimatedMinutes: 5,
    icon: "👁️",
  },
  "tempo-reacao": {
    id: "tempo-reacao",
    name: "Tempo de Reação",
    domain: "processing" as Domain,
    description: "Reaja o mais rápido possível ao estímulo",
    estimatedMinutes: 3,
    icon: "⚡",
  },
  "decisao-rapida": {
    id: "decisao-rapida",
    name: "Decisão Rápida",
    domain: "processing" as Domain,
    description: "Classifique categorias rapidamente",
    estimatedMinutes: 5,
    icon: "🧩",
  },
  "identificacao-simbolos": {
    id: "identificacao-simbolos",
    name: "Identificação de Símbolos",
    domain: "processing" as Domain,
    description: "Encontre o símbolo alvo entre distratores",
    estimatedMinutes: 5,
    icon: "🔍",
  },
  "torre-hanoi": {
    id: "torre-hanoi",
    name: "Torre de Hanói",
    domain: "executive" as Domain,
    description: "Resolva o puzzle de discos",
    estimatedMinutes: 10,
    icon: "🗼",
  },
  "sequenciamento": {
    id: "sequenciamento",
    name: "Sequenciamento",
    domain: "executive" as Domain,
    description: "Ordene etapas na sequência correta",
    estimatedMinutes: 5,
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
  "jogo-memoria": {
    id: "jogo-memoria",
    name: "Jogo da Memória",
    domain: "memory" as Domain,
    description: "Encontre os pares de figuras iguais",
    estimatedMinutes: 5,
    icon: "🃏",
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
