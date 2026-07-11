export type AgentId = string;

export type AgentColor = "blue" | "green" | "purple" | "orange" | "red" | "yellow";
export type AgentAccessory = "none" | "headphones" | "red-cap" | "glasses" | "hood" | "beanie" | "robot-helmet";
export type AgentExpression = "neutral" | "happy" | "focused";
export type AgentObject = "none" | "bola" | "skate" | "basquete";

export interface AgentVariant { src: string; label: string; tags: string[]; }

export interface AgentConfig {
  id: AgentId; name: string; color: AgentColor; accessory: AgentAccessory;
  expression: AgentExpression; description: string; images: AgentVariant[];
  object?: AgentObject;
}

// 42 agentes padronizados — 6 cores x 7 variações (base + fone/óculos/boné + combos).
// Gerado a partir de /public/exercises/agentes-personagens.
export const agents: AgentConfig[] = [
  { id: "amarelo_base", name: "Amarelo", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/amarelo_base.png", label: "sem acessório", tags: [] }] },
  { id: "amarelo_fone", name: "Amarelo com fone", color: "yellow", accessory: "headphones", expression: "neutral", description: "Agente amarelo com fone",
    images: [{ src: "/exercises/agentes-personagens/amarelo_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "amarelo_oculos", name: "Amarelo com óculos", color: "yellow", accessory: "glasses", expression: "neutral", description: "Agente amarelo com óculos",
    images: [{ src: "/exercises/agentes-personagens/amarelo_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "amarelo_bone", name: "Amarelo com boné", color: "yellow", accessory: "red-cap", expression: "neutral", description: "Agente amarelo com boné",
    images: [{ src: "/exercises/agentes-personagens/amarelo_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "amarelo_fone_bone", name: "Amarelo com fone e boné", color: "yellow", accessory: "headphones", expression: "neutral", description: "Agente amarelo com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/amarelo_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "amarelo_oculos_bone", name: "Amarelo com óculos e boné", color: "yellow", accessory: "glasses", expression: "neutral", description: "Agente amarelo com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/amarelo_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "amarelo_oculos_fone", name: "Amarelo com óculos e fone", color: "yellow", accessory: "glasses", expression: "neutral", description: "Agente amarelo com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/amarelo_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
  { id: "azul_base", name: "Azul", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul sem acessório",
    images: [{ src: "/exercises/agentes-personagens/azul_base.png", label: "sem acessório", tags: [] }] },
  { id: "azul_fone", name: "Azul com fone", color: "blue", accessory: "headphones", expression: "neutral", description: "Agente azul com fone",
    images: [{ src: "/exercises/agentes-personagens/azul_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "azul_oculos", name: "Azul com óculos", color: "blue", accessory: "glasses", expression: "neutral", description: "Agente azul com óculos",
    images: [{ src: "/exercises/agentes-personagens/azul_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "azul_bone", name: "Azul com boné", color: "blue", accessory: "red-cap", expression: "neutral", description: "Agente azul com boné",
    images: [{ src: "/exercises/agentes-personagens/azul_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "azul_fone_bone", name: "Azul com fone e boné", color: "blue", accessory: "headphones", expression: "neutral", description: "Agente azul com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/azul_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "azul_oculos_bone", name: "Azul com óculos e boné", color: "blue", accessory: "glasses", expression: "neutral", description: "Agente azul com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/azul_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "azul_oculos_fone", name: "Azul com óculos e fone", color: "blue", accessory: "glasses", expression: "neutral", description: "Agente azul com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/azul_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
  { id: "laranja_base", name: "Laranja", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja sem acessório",
    images: [{ src: "/exercises/agentes-personagens/laranja_base.png", label: "sem acessório", tags: [] }] },
  { id: "laranja_fone", name: "Laranja com fone", color: "orange", accessory: "headphones", expression: "neutral", description: "Agente laranja com fone",
    images: [{ src: "/exercises/agentes-personagens/laranja_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "laranja_oculos", name: "Laranja com óculos", color: "orange", accessory: "glasses", expression: "neutral", description: "Agente laranja com óculos",
    images: [{ src: "/exercises/agentes-personagens/laranja_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "laranja_bone", name: "Laranja com boné", color: "orange", accessory: "red-cap", expression: "neutral", description: "Agente laranja com boné",
    images: [{ src: "/exercises/agentes-personagens/laranja_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "laranja_fone_bone", name: "Laranja com fone e boné", color: "orange", accessory: "headphones", expression: "neutral", description: "Agente laranja com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/laranja_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "laranja_oculos_bone", name: "Laranja com óculos e boné", color: "orange", accessory: "glasses", expression: "neutral", description: "Agente laranja com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/laranja_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "laranja_oculos_fone", name: "Laranja com óculos e fone", color: "orange", accessory: "glasses", expression: "neutral", description: "Agente laranja com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/laranja_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
  { id: "roxo_base", name: "Roxo", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/roxo_base.png", label: "sem acessório", tags: [] }] },
  { id: "roxo_fone", name: "Roxo com fone", color: "purple", accessory: "headphones", expression: "neutral", description: "Agente roxo com fone",
    images: [{ src: "/exercises/agentes-personagens/roxo_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "roxo_oculos", name: "Roxo com óculos", color: "purple", accessory: "glasses", expression: "neutral", description: "Agente roxo com óculos",
    images: [{ src: "/exercises/agentes-personagens/roxo_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "roxo_bone", name: "Roxo com boné", color: "purple", accessory: "red-cap", expression: "neutral", description: "Agente roxo com boné",
    images: [{ src: "/exercises/agentes-personagens/roxo_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "roxo_fone_bone", name: "Roxo com fone e boné", color: "purple", accessory: "headphones", expression: "neutral", description: "Agente roxo com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/roxo_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "roxo_oculos_bone", name: "Roxo com óculos e boné", color: "purple", accessory: "glasses", expression: "neutral", description: "Agente roxo com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/roxo_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "roxo_oculos_fone", name: "Roxo com óculos e fone", color: "purple", accessory: "glasses", expression: "neutral", description: "Agente roxo com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/roxo_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
  { id: "verde_base", name: "Verde", color: "green", accessory: "none", expression: "neutral", description: "Agente verde sem acessório",
    images: [{ src: "/exercises/agentes-personagens/verde_base.png", label: "sem acessório", tags: [] }] },
  { id: "verde_fone", name: "Verde com fone", color: "green", accessory: "headphones", expression: "neutral", description: "Agente verde com fone",
    images: [{ src: "/exercises/agentes-personagens/verde_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "verde_oculos", name: "Verde com óculos", color: "green", accessory: "glasses", expression: "neutral", description: "Agente verde com óculos",
    images: [{ src: "/exercises/agentes-personagens/verde_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "verde_bone", name: "Verde com boné", color: "green", accessory: "red-cap", expression: "neutral", description: "Agente verde com boné",
    images: [{ src: "/exercises/agentes-personagens/verde_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "verde_fone_bone", name: "Verde com fone e boné", color: "green", accessory: "headphones", expression: "neutral", description: "Agente verde com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/verde_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "verde_oculos_bone", name: "Verde com óculos e boné", color: "green", accessory: "glasses", expression: "neutral", description: "Agente verde com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/verde_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "verde_oculos_fone", name: "Verde com óculos e fone", color: "green", accessory: "glasses", expression: "neutral", description: "Agente verde com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/verde_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
  { id: "vermelho_base", name: "Vermelho", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho sem acessório",
    images: [{ src: "/exercises/agentes-personagens/vermelho_base.png", label: "sem acessório", tags: [] }] },
  { id: "vermelho_fone", name: "Vermelho com fone", color: "red", accessory: "headphones", expression: "neutral", description: "Agente vermelho com fone",
    images: [{ src: "/exercises/agentes-personagens/vermelho_fone.png", label: "com fone", tags: ["fone"] }] },
  { id: "vermelho_oculos", name: "Vermelho com óculos", color: "red", accessory: "glasses", expression: "neutral", description: "Agente vermelho com óculos",
    images: [{ src: "/exercises/agentes-personagens/vermelho_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "vermelho_bone", name: "Vermelho com boné", color: "red", accessory: "red-cap", expression: "neutral", description: "Agente vermelho com boné",
    images: [{ src: "/exercises/agentes-personagens/vermelho_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "vermelho_fone_bone", name: "Vermelho com fone e boné", color: "red", accessory: "headphones", expression: "neutral", description: "Agente vermelho com fone e boné",
    images: [{ src: "/exercises/agentes-personagens/vermelho_fone_bone.png", label: "com fone e boné", tags: ["fone", "bone"] }] },
  { id: "vermelho_oculos_bone", name: "Vermelho com óculos e boné", color: "red", accessory: "glasses", expression: "neutral", description: "Agente vermelho com óculos e boné",
    images: [{ src: "/exercises/agentes-personagens/vermelho_oculos_bone.png", label: "com óculos e boné", tags: ["oculos", "bone"] }] },
  { id: "vermelho_oculos_fone", name: "Vermelho com óculos e fone", color: "red", accessory: "glasses", expression: "neutral", description: "Agente vermelho com óculos e fone",
    images: [{ src: "/exercises/agentes-personagens/vermelho_oculos_fone.png", label: "com óculos e fone", tags: ["oculos", "fone"] }] },
];

// ── Agentes com OBJETO (bola/skate/basquete) ──────────────────────────────────
// 15 com objeto. Os 168 agentes de SÍMBOLO (estrela/círculo/triângulo/raio) foram
// removidos do roster em 2026-07 (imagens e regras eliminadas — ilegíveis pequenos).
// Objeto segue como dimensão de discriminação do Focus Agentes.
export const symbolObjectAgents: AgentConfig[] = [
  { id: "amarelo_basquete", name: "Amarelo com bola de basquete", color: "yellow", accessory: "red-cap", expression: "neutral", description: "Agente amarelo com bola de basquete", object: "basquete",
    images: [{ src: "/exercises/agentes-personagens/amarelo_basquete.png", label: "bola de basquete", tags: ["bone", "basquete"] }] },
  { id: "amarelo_bola", name: "Amarelo com bola", color: "yellow", accessory: "red-cap", expression: "neutral", description: "Agente amarelo com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/amarelo_bola.png", label: "bola", tags: ["bone", "bola"] }] },
  { id: "amarelo_skate", name: "Amarelo com skate", color: "yellow", accessory: "red-cap", expression: "neutral", description: "Agente amarelo com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/amarelo_skate.png", label: "skate", tags: ["bone", "skate"] }] },
  { id: "azul_bola", name: "Azul com bola", color: "blue", accessory: "red-cap", expression: "neutral", description: "Agente azul com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/azul_bola.png", label: "bola", tags: ["bone", "bola"] }] },
  { id: "azul_skate", name: "Azul com skate", color: "blue", accessory: "red-cap", expression: "neutral", description: "Agente azul com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/azul_skate.png", label: "skate", tags: ["bone", "skate"] }] },
  { id: "laranja_bola", name: "Laranja com bola", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/laranja_bola.png", label: "bola", tags: ["bola"] }] },
  { id: "laranja_skate", name: "Laranja com skate", color: "orange", accessory: "red-cap", expression: "neutral", description: "Agente laranja com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/laranja_skate.png", label: "skate", tags: ["bone", "skate"] }] },
  { id: "roxo_bola", name: "Roxo com bola", color: "purple", accessory: "red-cap", expression: "neutral", description: "Agente roxo com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/roxo_bola.png", label: "bola", tags: ["bone", "bola"] }] },
  { id: "roxo_skate", name: "Roxo com skate", color: "purple", accessory: "red-cap", expression: "neutral", description: "Agente roxo com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/roxo_skate.png", label: "skate", tags: ["bone", "skate"] }] },
  { id: "verde_basquete", name: "Verde com bola de basquete", color: "green", accessory: "red-cap", expression: "neutral", description: "Agente verde com bola de basquete", object: "basquete",
    images: [{ src: "/exercises/agentes-personagens/verde_basquete.png", label: "bola de basquete", tags: ["bone", "basquete"] }] },
  { id: "verde_bola", name: "Verde com bola", color: "green", accessory: "red-cap", expression: "neutral", description: "Agente verde com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/verde_bola.png", label: "bola", tags: ["bone", "bola"] }] },
  { id: "verde_skate", name: "Verde com skate", color: "green", accessory: "red-cap", expression: "neutral", description: "Agente verde com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/verde_skate.png", label: "skate", tags: ["bone", "skate"] }] },
  { id: "vermelho_basquete", name: "Vermelho com bola de basquete", color: "red", accessory: "red-cap", expression: "neutral", description: "Agente vermelho com bola de basquete", object: "basquete",
    images: [{ src: "/exercises/agentes-personagens/vermelho_basquete.png", label: "bola de basquete", tags: ["bone", "basquete"] }] },
  { id: "vermelho_bola", name: "Vermelho com bola", color: "red", accessory: "red-cap", expression: "neutral", description: "Agente vermelho com bola", object: "bola",
    images: [{ src: "/exercises/agentes-personagens/vermelho_bola.png", label: "bola", tags: ["bone", "bola"] }] },
  { id: "vermelho_skate", name: "Vermelho com skate", color: "red", accessory: "red-cap", expression: "neutral", description: "Agente vermelho com skate", object: "skate",
    images: [{ src: "/exercises/agentes-personagens/vermelho_skate.png", label: "skate", tags: ["bone", "skate"] }] },
];

/** Catálogo completo: 42 base + 168 símbolo + 15 objeto = 225 agentes. */
export const allAgents: AgentConfig[] = [...agents, ...symbolObjectAgents];
