import type { Theme } from "@/types";

export type CommandRuleType =
  | "single"
  | "colorAttribute"
  | "contrast"
  | "multiTarget"
  | "multiAttribute"
  | "sequence"
  | "negative"
  | "advanced";

/** Modo cognitivo escolhido pelo terapeuta no Focus Agentes. */
export type FocusMode = "foco" | "inibicao" | "alternancia" | "desafio";

export type AccessoryKey =
  | "fone"
  | "oculos"
  | "oculos-escuros"
  | "microfone"
  | "capuz"
  | "mochila"
  | "bone"
  | "touca"
  | "tablet"
  | "gravata"
  | "cesta"
  | "skate"
  | "raquete"
  | "viseira";

export type ColorName =
  | "azul"
  | "verde"
  | "roxo"
  | "laranja"
  | "vermelho"
  | "cinza"
  | "amarelo"
  | "rosa";

// ── Features do roster de 102 novos agentes (cor × 1 feature) ──────────────────
/** Item segurado pelo agente (bola/skate/objeto). Ausente = não segura nada. */
export type HeldKind = "futebol" | "basquete" | "skate" | "balao" | "pipa" | "guarda_chuva";
/** Lado em que a bola aparece (só para futebol/basquete). */
export type HeldSide = "esq" | "dir";
/** Item na cabeça. */
export type HeadItem = "chapeu" | "coroa" | "gorro";
/** Expressão facial nova (distinta do AgentExpression legado). */
export type FaceExpr = "alegria" | "tristeza" | "raiva" | "neutro";
/** Feature especial. */
export type SpecialKind = "luva" | "oculos_escuro";

export interface CharacterAttributes {
  id: string;
  agentId: string;
  variantIndex: number;
  name: string;
  imageSrc: string;
  uniformColor: ColorName;
  hairColor?: ColorName;
  isRobot?: boolean;
  accessories: AccessoryKey[];
  accessoryColors?: Partial<Record<AccessoryKey, ColorName>>;
  // ── Features (novos agentes). Ausentes nos 42 base+acessório (default null). ──
  /** Item segurado (bola/skate/balão/pipa/guarda-chuva). */
  held?: HeldKind;
  /** Lado da bola (esq/dir) — só para futebol/basquete. */
  heldSide?: HeldSide;
  /** Skate com bermuda (sub-distinção do skate). */
  bermuda?: boolean;
  /** Item na cabeça (chapéu/coroa/gorro). */
  headItem?: HeadItem;
  /** Expressão facial (alegria/tristeza/raiva). */
  faceExpr?: FaceExpr;
  /** Feature especial (luva/óculos escuro). */
  special?: SpecialKind;
}

export interface CommandRule {
  type: CommandRuleType;
  requiredAttributes?: string[];
  excludedAttributes?: string[];
  sequence?: string[];
}

/** Uma fase de uma rodada com troca de regra (modos Alternância e Desafio). */
export interface CommandPhase {
  text: string;
  targetIds: string[];
  /** Regra condicional (Fase H): cor da barra do topo que indica esta regra. */
  barColor?: ColorName;
}

export interface GeneratedCommand {
  text: string;
  mode: "visual" | "auditory";
  difficulty: number;
  targets: string[];
  distractors: string[];
  forbidden: string[];
  sequenced: boolean;
  requiredTargets: number;
  rule: CommandRule;
  verbIndex?: number;
  /** Fases (troca de regra durante a rodada). Se presente, `targets` = 1ª fase. */
  phases?: CommandPhase[];
  /** Posição (Fase B): id do personagem → zona onde ele fica preso. */
  zones?: Record<string, "top" | "bottom" | "left" | "right">;
  /** Regra condicional (Fase H): a regra ativa é indicada pela cor da barra do topo. */
  conditional?: boolean;
  /** Movimento (Fase H): direção que os ALVOS seguem (andam reto + dão a volta). */
  movement?: "right" | "left" | "up" | "down";
  /** Ladder do Foco: dificuldade interna 1–7 que gerou a rodada (métricas/feedback). */
  ladder?: number;
  /** Memória curta (Foco D7): comando some após alguns segundos (botão "ver comando"). */
  memory?: boolean;
}

export interface CommandGeneratorParams {
  visibleCharacters: CharacterAttributes[];
  mode: "visual" | "auditory";
  difficulty: number;
  previousCommands: GeneratedCommand[];
  theme?: Theme;
}

export interface BuiltRound {
  characters: CharacterAttributes[];
  command: GeneratedCommand;
}

export { Theme };
