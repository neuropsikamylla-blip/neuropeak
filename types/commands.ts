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
