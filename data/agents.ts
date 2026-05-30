export type AgentId =
  | "neo"
  | "nexo"
  | "mindra"
  | "fokus"
  | "ignite"
  | "redex"
  | "axon"
  | "lumen"
  | "voxe"
  | "flora"
  | "solax"
  | "ember";

export type AgentColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "gray"
  | "yellow";

export type AgentAccessory =
  | "none"
  | "headphones"
  | "red-cap"
  | "glasses"
  | "hood"
  | "beanie"
  | "robot-helmet";

export type AgentExpression =
  | "neutral"
  | "happy"
  | "focused";

export interface AgentVariant {
  src: string;
  /** Descrição dos itens visíveis — usada nos comandos de variante */
  label: string;
  /** Tags dos itens visíveis — usadas pelo gerador de comandos */
  tags: string[];
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  color: AgentColor;
  accessory: AgentAccessory;
  expression: AgentExpression;
  description: string;
  images: AgentVariant[];
}

export const agents: AgentConfig[] = [
  {
    id: "neo",
    name: "NEO",
    color: "blue",
    accessory: "headphones",
    expression: "happy",
    description: "Agente azul com fone grande",
    images: [
      { src: "/exercises/agents/neo-1.png", label: "com fone de ouvido",                    tags: ["fone"] },
      { src: "/exercises/agents/neo-2.png", label: "sem acessório",                          tags: [] },
      { src: "/exercises/agents/neo-3.png", label: "com fone, óculos escuros e relógio",     tags: ["fone", "oculos-escuros", "relogio"] },
    ],
  },
  {
    id: "nexo",
    name: "NEXO",
    color: "blue",
    accessory: "red-cap",
    expression: "focused",
    description: "Agente azul com boné vermelho",
    images: [
      { src: "/exercises/agents/nexo-1.png", label: "com boné vermelho",                    tags: ["bone"] },
      { src: "/exercises/agents/nexo-2.png", label: "com microfone",                         tags: ["microfone"] },
      { src: "/exercises/agents/nexo-3.png", label: "com boné, mochila e microfone",         tags: ["bone", "mochila", "microfone"] },
    ],
  },
  {
    id: "mindra",
    name: "MINDRA",
    color: "purple",
    accessory: "glasses",
    expression: "focused",
    description: "Agente roxa com óculos",
    images: [
      { src: "/exercises/agents/mindra-1.png", label: "com óculos",                         tags: ["oculos"] },
      { src: "/exercises/agents/mindra-2.png", label: "sem acessório",                       tags: [] },
      { src: "/exercises/agents/mindra-3.png", label: "com óculos, fone e tablet",           tags: ["oculos", "fone", "tablet"] },
    ],
  },
  {
    id: "fokus",
    name: "FOKUS",
    color: "green",
    accessory: "headphones",
    expression: "neutral",
    description: "Agente verde com fone",
    images: [
      { src: "/exercises/agents/fokus-1.png", label: "com fone de ouvido",                  tags: ["fone"] },
      { src: "/exercises/agents/fokus-2.png", label: "com capuz",                            tags: ["capuz"] },
      { src: "/exercises/agents/fokus-3.png", label: "com fone e cesta",                     tags: ["fone", "cesta"] },
    ],
  },
  {
    id: "ignite",
    name: "IGNITE",
    color: "orange",
    accessory: "hood",
    expression: "happy",
    description: "Agente laranja com capuz",
    images: [
      { src: "/exercises/agents/ignite-1.png", label: "com capuz",                          tags: ["capuz"] },
      { src: "/exercises/agents/ignite-2.png", label: "com capuz e mochila",                tags: ["capuz", "mochila"] },
      { src: "/exercises/agents/ignite-3.png", label: "com capuz, gravata e skate",           tags: ["capuz", "gravata", "skate"] },
    ],
  },
  {
    id: "redex",
    name: "REDEX",
    color: "red",
    accessory: "hood",
    expression: "neutral",
    description: "Agente vermelho com capuz",
    images: [
      { src: "/exercises/agents/redex-1.png", label: "com capuz",                           tags: ["capuz"] },
      { src: "/exercises/agents/redex-2.png", label: "com capuz e mochila",                 tags: ["capuz", "mochila"] },
      { src: "/exercises/agents/redex-3.png", label: "com capuz e fone azul",               tags: ["capuz", "fone", "fone-azul"] },
    ],
  },
  {
    id: "axon",
    name: "AXON",
    color: "gray",
    accessory: "robot-helmet",
    expression: "neutral",
    description: "Robô",
    images: [
      { src: "/exercises/agents/axon-1.png", label: "de uniforme cinza",                    tags: ["uniforme-cinza"] },
      { src: "/exercises/agents/axon-2.png", label: "de uniforme rosa",                     tags: ["uniforme-rosa"] },
      { src: "/exercises/agents/axon-3.png", label: "de uniforme laranja",                  tags: ["uniforme-laranja"] },
    ],
  },
  {
    id: "lumen",
    name: "LUMEN",
    color: "yellow",
    accessory: "beanie",
    expression: "happy",
    description: "Agente amarelo com touca",
    images: [
      { src: "/exercises/agents/lumen-1.png", label: "com touca",                           tags: ["touca"] },
      { src: "/exercises/agents/lumen-2.png", label: "sem touca",                            tags: [] },
      { src: "/exercises/agents/lumen-3.png", label: "com touca, fone e óculos escuros",    tags: ["touca", "fone", "oculos-escuros"] },
    ],
  },
  {
    id: "voxe",
    name: "VOXE",
    color: "purple",
    accessory: "none",
    expression: "neutral",
    description: "Agente roxo sem acessório",
    images: [
      { src: "/exercises/agents/voxo-1.png", label: "sem acessório",                        tags: [] },
      { src: "/exercises/agents/voxe-2.png", label: "com mochila",                          tags: ["mochila"] },
      { src: "/exercises/agents/voxe-3.png", label: "com microfone, mochila e gravata",     tags: ["microfone", "mochila", "gravata"] },
    ],
  },
  {
    id: "flora",
    name: "FLORA",
    color: "green",
    accessory: "none",
    expression: "happy",
    description: "Agente verde sem acessório",
    images: [
      { src: "/exercises/agents/flora-1.png", label: "sem acessório",                       tags: [] },
      { src: "/exercises/agents/flora-2.png", label: "com boné",                            tags: ["bone"] },
      { src: "/exercises/agents/flora-3.png", label: "com tablet e raquete",                tags: ["tablet", "raquete"] },
    ],
  },
  {
    id: "solax",
    name: "SOLAX",
    color: "yellow",
    accessory: "glasses",
    expression: "focused",
    description: "Agente amarela com óculos",
    images: [
      { src: "/exercises/agents/solax-1.png", label: "com óculos de grau",                  tags: ["oculos"] },
      { src: "/exercises/agents/solax-2.png", label: "com óculos e fone de ouvido",         tags: ["oculos", "fone"] },
      { src: "/exercises/agents/solax-3.png", label: "com óculos escuros e skate",          tags: ["oculos-escuros", "skate"] },
    ],
  },
  {
    id: "ember",
    name: "EMBER",
    color: "red",
    accessory: "none",
    expression: "happy",
    description: "Agente vermelha com microfone",
    images: [
      { src: "/exercises/agents/ember-1.png", label: "com microfone",                       tags: ["microfone"] },
      { src: "/exercises/agents/ember-2.png", label: "com cesta",                           tags: ["cesta"] },
      { src: "/exercises/agents/ember-3.png", label: "com óculos escuros e microfone",      tags: ["oculos-escuros", "microfone"] },
    ],
  },
];
