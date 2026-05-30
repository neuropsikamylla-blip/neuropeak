import type { CharacterAttributes } from "@/types/commands";

export const characterAttributes: CharacterAttributes[] = [
  // ── NEO (azul) ────────────────────────────────────────────────────────────────
  {
    id: "neo_v1", agentId: "neo", variantIndex: 0, name: "NEO",
    imageSrc: "/exercises/agents/neo-1.png",
    uniformColor: "azul", hairColor: "azul",
    accessories: ["fone"],
  },
  {
    id: "neo_v2", agentId: "neo", variantIndex: 1, name: "NEO",
    imageSrc: "/exercises/agents/neo-2.png",
    uniformColor: "azul", hairColor: "azul",
    accessories: [],
  },
  {
    id: "neo_v3", agentId: "neo", variantIndex: 2, name: "NEO",
    imageSrc: "/exercises/agents/neo-3.png",
    uniformColor: "azul", hairColor: "azul",
    accessories: ["fone", "oculos-escuros"],
  },
  // ── NEXO (azul) ───────────────────────────────────────────────────────────────
  {
    id: "nexo_v1", agentId: "nexo", variantIndex: 0, name: "NEXO",
    imageSrc: "/exercises/agents/nexo-1.png",
    uniformColor: "azul",
    accessories: ["bone"],
    accessoryColors: { bone: "vermelho" },
  },
  {
    id: "nexo_v2", agentId: "nexo", variantIndex: 1, name: "NEXO",
    imageSrc: "/exercises/agents/nexo-2.png",
    uniformColor: "azul",
    accessories: ["microfone"],
    accessoryColors: { microfone: "verde" },
  },
  {
    id: "nexo_v3", agentId: "nexo", variantIndex: 2, name: "NEXO",
    imageSrc: "/exercises/agents/nexo-3.png",
    uniformColor: "azul",
    accessories: ["bone", "mochila", "microfone"],
    accessoryColors: { bone: "vermelho", mochila: "azul" },
  },
  // ── MINDRA (roxo) ─────────────────────────────────────────────────────────────
  {
    id: "mindra_v1", agentId: "mindra", variantIndex: 0, name: "MINDRA",
    imageSrc: "/exercises/agents/mindra-1.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: ["oculos"],
  },
  {
    id: "mindra_v2", agentId: "mindra", variantIndex: 1, name: "MINDRA",
    imageSrc: "/exercises/agents/mindra-2.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: [],
  },
  {
    id: "mindra_v3", agentId: "mindra", variantIndex: 2, name: "MINDRA",
    imageSrc: "/exercises/agents/mindra-3.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: ["oculos", "fone", "tablet"],
    accessoryColors: { fone: "roxo" },
  },
  // ── FOKUS (verde) ─────────────────────────────────────────────────────────────
  {
    id: "fokus_v1", agentId: "fokus", variantIndex: 0, name: "FOKUS",
    imageSrc: "/exercises/agents/fokus-1.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: ["fone"],
    accessoryColors: { fone: "verde" },
  },
  {
    id: "fokus_v2", agentId: "fokus", variantIndex: 1, name: "FOKUS",
    imageSrc: "/exercises/agents/fokus-2.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: ["capuz"],
  },
  {
    id: "fokus_v3", agentId: "fokus", variantIndex: 2, name: "FOKUS",
    imageSrc: "/exercises/agents/fokus-3.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: ["fone", "cesta"],
    accessoryColors: { fone: "verde" },
  },
  // ── IGNITE (laranja) ──────────────────────────────────────────────────────────
  {
    id: "ignite_v1", agentId: "ignite", variantIndex: 0, name: "IGNITE",
    imageSrc: "/exercises/agents/ignite-1.png",
    uniformColor: "laranja",
    accessories: ["capuz"],
    accessoryColors: { capuz: "laranja" },
  },
  {
    id: "ignite_v2", agentId: "ignite", variantIndex: 1, name: "IGNITE",
    imageSrc: "/exercises/agents/ignite-2.png",
    uniformColor: "laranja",
    accessories: ["capuz", "mochila"],
    accessoryColors: { capuz: "laranja", mochila: "verde" },
  },
  {
    id: "ignite_v3", agentId: "ignite", variantIndex: 2, name: "IGNITE",
    imageSrc: "/exercises/agents/ignite-3.png",
    uniformColor: "laranja",
    accessories: ["capuz", "gravata", "skate"],
    accessoryColors: { capuz: "laranja" },
  },
  // ── REDEX (vermelho) ──────────────────────────────────────────────────────────
  {
    id: "redex_v1", agentId: "redex", variantIndex: 0, name: "REDEX",
    imageSrc: "/exercises/agents/redex-1.png",
    uniformColor: "vermelho",
    accessories: ["capuz"],
    accessoryColors: { capuz: "vermelho" },
  },
  {
    id: "redex_v2", agentId: "redex", variantIndex: 1, name: "REDEX",
    imageSrc: "/exercises/agents/redex-2.png",
    uniformColor: "vermelho",
    accessories: ["capuz", "mochila"],
    accessoryColors: { capuz: "vermelho", mochila: "amarelo" },
  },
  {
    id: "redex_v3", agentId: "redex", variantIndex: 2, name: "REDEX",
    imageSrc: "/exercises/agents/redex-3.png",
    uniformColor: "vermelho",
    accessories: ["capuz", "fone"],
    accessoryColors: { capuz: "vermelho", fone: "azul" },
  },
  // ── AXON (robô) ───────────────────────────────────────────────────────────────
  {
    id: "axon_v1", agentId: "axon", variantIndex: 0, name: "AXON",
    imageSrc: "/exercises/agents/axon-1.png",
    uniformColor: "cinza", isRobot: true,
    accessories: [],
  },
  {
    id: "axon_v2", agentId: "axon", variantIndex: 1, name: "AXON",
    imageSrc: "/exercises/agents/axon-2.png",
    uniformColor: "rosa", isRobot: true,
    accessories: [],
  },
  {
    id: "axon_v3", agentId: "axon", variantIndex: 2, name: "AXON",
    imageSrc: "/exercises/agents/axon-3.png",
    uniformColor: "laranja", isRobot: true,
    accessories: [],
  },
  // ── LUMEN (amarelo) ───────────────────────────────────────────────────────────
  {
    id: "lumen_v1", agentId: "lumen", variantIndex: 0, name: "LUMEN",
    imageSrc: "/exercises/agents/lumen-1.png",
    uniformColor: "amarelo", hairColor: "amarelo",
    accessories: ["touca"],
    accessoryColors: { touca: "amarelo" },
  },
  {
    id: "lumen_v2", agentId: "lumen", variantIndex: 1, name: "LUMEN",
    imageSrc: "/exercises/agents/lumen-2.png",
    uniformColor: "amarelo", hairColor: "amarelo",
    accessories: ["mochila"],
    accessoryColors: { mochila: "laranja" },
  },
  {
    id: "lumen_v3", agentId: "lumen", variantIndex: 2, name: "LUMEN",
    imageSrc: "/exercises/agents/lumen-3.png",
    uniformColor: "amarelo", hairColor: "amarelo",
    accessories: ["touca", "fone", "oculos-escuros"],
    accessoryColors: { touca: "amarelo", fone: "amarelo" },
  },
  // ── VOXE (roxo) ──────────────────────────────────────────────────────────────
  {
    id: "voxe_v1", agentId: "voxe", variantIndex: 0, name: "VOXE",
    imageSrc: "/exercises/agents/voxo-1.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: [],
  },
  {
    id: "voxe_v2", agentId: "voxe", variantIndex: 1, name: "VOXE",
    imageSrc: "/exercises/agents/voxe-2.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: ["mochila"],
    accessoryColors: { mochila: "vermelho" },
  },
  {
    id: "voxe_v3", agentId: "voxe", variantIndex: 2, name: "VOXE",
    imageSrc: "/exercises/agents/voxe-3.png",
    uniformColor: "roxo", hairColor: "roxo",
    accessories: ["microfone", "gravata", "mochila"],
    accessoryColors: { mochila: "vermelho" },
  },
  // ── FLORA (verde) ─────────────────────────────────────────────────────────────
  {
    id: "flora_v1", agentId: "flora", variantIndex: 0, name: "FLORA",
    imageSrc: "/exercises/agents/flora-1.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: [],
  },
  {
    id: "flora_v2", agentId: "flora", variantIndex: 1, name: "FLORA",
    imageSrc: "/exercises/agents/flora-2.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: ["bone"],
    accessoryColors: { bone: "verde" },
  },
  {
    id: "flora_v3", agentId: "flora", variantIndex: 2, name: "FLORA",
    imageSrc: "/exercises/agents/flora-3.png",
    uniformColor: "verde", hairColor: "verde",
    accessories: ["tablet", "raquete"],
  },
  // ── SOLAX (amarelo) ───────────────────────────────────────────────────────────
  {
    id: "solax_v1", agentId: "solax", variantIndex: 0, name: "SOLAX",
    imageSrc: "/exercises/agents/solax-1.png",
    uniformColor: "amarelo",
    accessories: ["oculos"],
  },
  {
    id: "solax_v2", agentId: "solax", variantIndex: 1, name: "SOLAX",
    imageSrc: "/exercises/agents/solax-2.png",
    uniformColor: "amarelo",
    accessories: ["oculos", "fone"],
    accessoryColors: { fone: "amarelo" },
  },
  {
    id: "solax_v3", agentId: "solax", variantIndex: 2, name: "SOLAX",
    imageSrc: "/exercises/agents/solax-3.png",
    uniformColor: "amarelo",
    accessories: ["oculos-escuros", "skate"],
    accessoryColors: { skate: "amarelo" },
  },
  // ── EMBER (vermelho) ──────────────────────────────────────────────────────────
  {
    id: "ember_v1", agentId: "ember", variantIndex: 0, name: "EMBER",
    imageSrc: "/exercises/agents/ember-1.png",
    uniformColor: "vermelho",
    accessories: ["microfone"],
  },
  {
    id: "ember_v2", agentId: "ember", variantIndex: 1, name: "EMBER",
    imageSrc: "/exercises/agents/ember-2.png",
    uniformColor: "vermelho",
    accessories: ["cesta"],
  },
  {
    id: "ember_v3", agentId: "ember", variantIndex: 2, name: "EMBER",
    imageSrc: "/exercises/agents/ember-3.png",
    uniformColor: "vermelho",
    accessories: ["oculos-escuros", "microfone"],
  },
];

/** Retorna todos os CharacterAttributes que possuem determinado acessório */
export function charsWithAcc(acc: string): CharacterAttributes[] {
  return characterAttributes.filter(c => c.accessories.includes(acc as never));
}

/** Retorna CharacterAttributes de um agentId específico */
export function charsOfAgent(agentId: string): CharacterAttributes[] {
  return characterAttributes.filter(c => c.agentId === agentId);
}
