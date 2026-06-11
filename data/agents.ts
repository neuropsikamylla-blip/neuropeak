export type AgentId = string;

export type AgentColor = "blue" | "green" | "purple" | "orange" | "red" | "gray" | "yellow";
export type AgentAccessory = "none" | "headphones" | "red-cap" | "glasses" | "hood" | "beanie" | "robot-helmet";
export type AgentExpression = "neutral" | "happy" | "focused";

export interface AgentVariant { src: string; label: string; tags: string[]; }

export interface AgentConfig {
  id: AgentId; name: string; color: AgentColor; accessory: AgentAccessory;
  expression: AgentExpression; description: string; images: AgentVariant[];
}

// 36 agentes padronizados (cor + com/sem acessório). 1 estado fixo por agente.
// Gerado a partir de /public/exercises/agentes-personagens.
export const agents: AgentConfig[] = [
  { id: "ag01", name: "Agente 01", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul com fone de ouvido",
    images: [{ src: "/exercises/agentes-personagens/01_agente_azul_com_fone.png", label: "com fone de ouvido", tags: ["fone"] }] },
  { id: "ag02", name: "Agente 02", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul sem acessório",
    images: [{ src: "/exercises/agentes-personagens/02_agente_azul_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag03", name: "Agente 03", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja com skate",
    images: [{ src: "/exercises/agentes-personagens/03_agente_laranja_com_skate.png", label: "com skate", tags: ["skate"] }] },
  { id: "ag04", name: "Agente 04", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho sem acessório",
    images: [{ src: "/exercises/agentes-personagens/04_agente_vermelho_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag05", name: "Agente 05", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho com boné",
    images: [{ src: "/exercises/agentes-personagens/05_agente_vermelho_com_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "ag06", name: "Agente 06", color: "green", accessory: "none", expression: "neutral", description: "Agente verde sem acessório",
    images: [{ src: "/exercises/agentes-personagens/06_agente_verde_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag07", name: "Agente 07", color: "green", accessory: "none", expression: "neutral", description: "Agente verde com óculos",
    images: [{ src: "/exercises/agentes-personagens/07_agente_verde_com_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag08", name: "Agente 08", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo com óculos",
    images: [{ src: "/exercises/agentes-personagens/08_agente_roxo_com_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag09", name: "Agente 09", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo com raquete",
    images: [{ src: "/exercises/agentes-personagens/09_agente_roxo_com_raquete.png", label: "com raquete", tags: ["raquete"] }] },
  { id: "ag10", name: "Agente 10", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja sem acessório",
    images: [{ src: "/exercises/agentes-personagens/10_agente_laranja_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag11", name: "Agente 11", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo com mochila",
    images: [{ src: "/exercises/agentes-personagens/11_agente_amarelo_com_mochila.png", label: "com mochila", tags: ["mochila"] }] },
  { id: "ag12", name: "Agente 12", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo com fone de ouvido",
    images: [{ src: "/exercises/agentes-personagens/12_agente_amarelo_com_fone.png", label: "com fone de ouvido", tags: ["fone"] }] },
  { id: "ag13", name: "Agente 13", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul com boné",
    images: [{ src: "/exercises/agentes-personagens/13_agente_azul_com_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "ag14", name: "Agente 14", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul sem acessório",
    images: [{ src: "/exercises/agentes-personagens/14_agente_azul_basico_2.png", label: "sem acessório", tags: [] }] },
  { id: "ag15", name: "Agente 15", color: "green", accessory: "none", expression: "neutral", description: "Agente verde com raquete",
    images: [{ src: "/exercises/agentes-personagens/15_agente_verde_com_raquete.png", label: "com raquete", tags: ["raquete"] }] },
  { id: "ag16", name: "Agente 16", color: "green", accessory: "none", expression: "neutral", description: "Agente verde sem acessório",
    images: [{ src: "/exercises/agentes-personagens/16_agente_verde_basico_2.png", label: "sem acessório", tags: [] }] },
  { id: "ag17", name: "Agente 17", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo com fone de ouvido",
    images: [{ src: "/exercises/agentes-personagens/17_agente_roxo_com_fone.png", label: "com fone de ouvido", tags: ["fone"] }] },
  { id: "ag18", name: "Agente 18", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/18_agente_roxo_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag19", name: "Agente 19", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho com óculos",
    images: [{ src: "/exercises/agentes-personagens/19_agente_vermelho_com_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag20", name: "Agente 20", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho sem acessório",
    images: [{ src: "/exercises/agentes-personagens/20_agente_vermelho_basico_2.png", label: "sem acessório", tags: [] }] },
  { id: "ag21", name: "Agente 21", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/21_agente_amarelo_basico.png", label: "sem acessório", tags: [] }] },
  { id: "ag22", name: "Agente 22", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo com mochila",
    images: [{ src: "/exercises/agentes-personagens/22_agente_roxo_com_mochila.png", label: "com mochila", tags: ["mochila"] }] },
  { id: "ag23", name: "Agente 23", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja com óculos",
    images: [{ src: "/exercises/agentes-personagens/23_agente_laranja_com_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag24", name: "Agente 24", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja sem acessório",
    images: [{ src: "/exercises/agentes-personagens/24_agente_laranja_basico_2.png", label: "sem acessório", tags: [] }] },
  { id: "ag25", name: "Agente 25", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul com mochila",
    images: [{ src: "/exercises/agentes-personagens/25_agente_azul_com_mochila.png", label: "com mochila", tags: ["mochila"] }] },
  { id: "ag26", name: "Agente 26", color: "blue", accessory: "none", expression: "neutral", description: "Agente azul sem acessório",
    images: [{ src: "/exercises/agentes-personagens/26_agente_azul_basico_3.png", label: "sem acessório", tags: [] }] },
  { id: "ag27", name: "Agente 27", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho com raquete",
    images: [{ src: "/exercises/agentes-personagens/27_agente_vermelho_com_raquete.png", label: "com raquete", tags: ["raquete"] }] },
  { id: "ag28", name: "Agente 28", color: "red", accessory: "none", expression: "neutral", description: "Agente vermelho sem acessório",
    images: [{ src: "/exercises/agentes-personagens/28_agente_vermelho_basico_3.png", label: "sem acessório", tags: [] }] },
  { id: "ag29", name: "Agente 29", color: "green", accessory: "none", expression: "neutral", description: "Agente verde com boné",
    images: [{ src: "/exercises/agentes-personagens/29_agente_verde_com_bone.png", label: "com boné", tags: ["bone"] }] },
  { id: "ag30", name: "Agente 30", color: "green", accessory: "none", expression: "neutral", description: "Agente verde sem acessório",
    images: [{ src: "/exercises/agentes-personagens/30_agente_verde_basico_3.png", label: "sem acessório", tags: [] }] },
  { id: "ag31", name: "Agente 31", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo com óculos",
    images: [{ src: "/exercises/agentes-personagens/31_agente_roxo_com_oculos_2.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag32", name: "Agente 32", color: "purple", accessory: "none", expression: "neutral", description: "Agente roxo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/32_agente_roxo_basico_2.png", label: "sem acessório", tags: [] }] },
  { id: "ag33", name: "Agente 33", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja com fone de ouvido",
    images: [{ src: "/exercises/agentes-personagens/33_agente_laranja_com_fone.png", label: "com fone de ouvido", tags: ["fone"] }] },
  { id: "ag34", name: "Agente 34", color: "orange", accessory: "none", expression: "neutral", description: "Agente laranja sem acessório",
    images: [{ src: "/exercises/agentes-personagens/34_agente_laranja_basico_3.png", label: "sem acessório", tags: [] }] },
  { id: "ag35", name: "Agente 35", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo com óculos",
    images: [{ src: "/exercises/agentes-personagens/35_agente_amarelo_com_oculos.png", label: "com óculos", tags: ["oculos"] }] },
  { id: "ag36", name: "Agente 36", color: "yellow", accessory: "none", expression: "neutral", description: "Agente amarelo sem acessório",
    images: [{ src: "/exercises/agentes-personagens/36_agente_amarelo_basico_2.png", label: "sem acessório", tags: [] }] },
];
