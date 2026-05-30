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
