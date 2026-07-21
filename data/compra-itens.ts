// ─────────────────────────────────────────────────────────────────────────────
// Catálogo de itens da Compra Multifuncional — MISSÕES MATEMÁTICAS
// (COMPRA-MULTIFUNCIONAL-MISSOES-SPEC.md, 20/jul/2026).
//
// Cada item tem preço (R$) E peso (kg) — o peso entra nas etapas de peso das
// missões. Números inteiros e pequenos para caber nos níveis iniciais. As
// missões só usam itens que existem AQUI (regra 1 da spec).
// ─────────────────────────────────────────────────────────────────────────────

export type Categoria =
  | "fruta" | "legume" | "alimento" | "bebida" | "higiene"
  | "escolar" | "praia" | "frio" | "objeto";

export const CATEGORIA_LABEL: Record<Categoria, { sing: string; plural: string }> = {
  fruta:    { sing: "fruta", plural: "frutas" },
  legume:   { sing: "legume", plural: "legumes" },
  alimento: { sing: "alimento", plural: "alimentos" },
  bebida:   { sing: "bebida", plural: "bebidas" },
  higiene:  { sing: "produto de higiene", plural: "produtos de higiene" },
  escolar:  { sing: "material escolar", plural: "materiais escolares" },
  praia:    { sing: "item de praia", plural: "itens de praia" },
  frio:     { sing: "roupa de frio", plural: "roupas de frio" },
  objeto:   { sing: "objeto", plural: "objetos" },
};

export interface ItemCompra {
  id: string;
  name: string;
  emoji: string;
  price: number;   // R$ (inteiro)
  weight: number;  // kg (inteiro)
  cat: Categoria;
}

export const ITENS: ItemCompra[] = [
  // ── Frutas ──
  { id: "maca",     name: "maçã",     emoji: "🍎", price: 5,  weight: 1, cat: "fruta" },
  { id: "banana",   name: "banana",   emoji: "🍌", price: 4,  weight: 1, cat: "fruta" },
  { id: "laranja",  name: "laranja",  emoji: "🍊", price: 4,  weight: 1, cat: "fruta" },
  { id: "pera",     name: "pera",     emoji: "🍐", price: 6,  weight: 1, cat: "fruta" },
  { id: "uva",      name: "uva",      emoji: "🍇", price: 8,  weight: 1, cat: "fruta" },
  { id: "melancia", name: "melancia", emoji: "🍉", price: 12, weight: 3, cat: "fruta" },

  // ── Legumes ──
  { id: "tomate",   name: "tomate",   emoji: "🍅", price: 3,  weight: 1, cat: "legume" },
  { id: "cenoura",  name: "cenoura",  emoji: "🥕", price: 3,  weight: 1, cat: "legume" },
  { id: "cebola",   name: "cebola",   emoji: "🧅", price: 2,  weight: 1, cat: "legume" },
  { id: "batata",   name: "batata",   emoji: "🥔", price: 4,  weight: 2, cat: "legume" },
  { id: "milho",    name: "milho",    emoji: "🌽", price: 5,  weight: 1, cat: "legume" },

  // ── Alimentos ──
  { id: "pao",       name: "pão",        emoji: "🍞", price: 8,  weight: 1, cat: "alimento" },
  { id: "queijo",    name: "queijo",     emoji: "🧀", price: 12, weight: 1, cat: "alimento" },
  { id: "sanduiche", name: "sanduíche",  emoji: "🥪", price: 12, weight: 1, cat: "alimento" },
  { id: "biscoito",  name: "biscoito",   emoji: "🍪", price: 9,  weight: 1, cat: "alimento" },
  { id: "bolo",      name: "bolo",       emoji: "🍰", price: 15, weight: 2, cat: "alimento" },
  { id: "ovos",      name: "ovos",       emoji: "🥚", price: 10, weight: 1, cat: "alimento" },
  { id: "arroz",     name: "arroz",      emoji: "🍚", price: 7,  weight: 2, cat: "alimento" },

  // ── Bebidas ──
  { id: "agua",         name: "água",         emoji: "💧", price: 3,  weight: 1, cat: "bebida" },
  { id: "suco",         name: "suco",         emoji: "🧃", price: 7,  weight: 1, cat: "bebida" },
  { id: "refrigerante", name: "refrigerante", emoji: "🥤", price: 8,  weight: 2, cat: "bebida" },
  { id: "leite",        name: "leite",        emoji: "🥛", price: 6,  weight: 1, cat: "bebida" },

  // ── Higiene ──
  { id: "sabonete",  name: "sabonete",       emoji: "🧼", price: 4,  weight: 1, cat: "higiene" },
  { id: "escova",    name: "escova de dente", emoji: "🪥", price: 6,  weight: 1, cat: "higiene" },
  { id: "shampoo",   name: "shampoo",        emoji: "🧴", price: 12, weight: 1, cat: "higiene" },
  { id: "papel",     name: "papel higiênico", emoji: "🧻", price: 8,  weight: 2, cat: "higiene" },

  // ── Escolar ──
  { id: "caderno",  name: "caderno",  emoji: "📓", price: 10, weight: 1, cat: "escolar" },
  { id: "lapis",    name: "lápis",    emoji: "✏️", price: 3,  weight: 1, cat: "escolar" },
  { id: "borracha", name: "borracha", emoji: "🧽", price: 2,  weight: 1, cat: "escolar" },
  { id: "regua",    name: "régua",    emoji: "📏", price: 5,  weight: 1, cat: "escolar" },
  { id: "mochila",  name: "mochila",  emoji: "🎒", price: 25, weight: 2, cat: "escolar" },

  // ── Praia ──
  { id: "protetor",  name: "protetor solar", emoji: "🧴", price: 20, weight: 1, cat: "praia" },
  { id: "oculos",    name: "óculos de sol",  emoji: "🕶️", price: 15, weight: 1, cat: "praia" },
  { id: "chapeu",    name: "chapéu",         emoji: "👒", price: 12, weight: 1, cat: "praia" },
  { id: "toalha",    name: "toalha",         emoji: "🏖️", price: 18, weight: 1, cat: "praia" },
  { id: "chinelo",   name: "chinelo",        emoji: "🩴", price: 10, weight: 1, cat: "praia" },
  { id: "boia",      name: "boia",           emoji: "🛟", price: 22, weight: 2, cat: "praia" },

  // ── Frio / neve ──
  { id: "gorro",   name: "gorro",   emoji: "🧢", price: 15, weight: 1, cat: "frio" },
  { id: "luva",    name: "luva",    emoji: "🧤", price: 12, weight: 1, cat: "frio" },
  { id: "cachecol", name: "cachecol", emoji: "🧣", price: 14, weight: 1, cat: "frio" },
  { id: "casaco",  name: "casaco",  emoji: "🧥", price: 40, weight: 2, cat: "frio" },
  { id: "meia",    name: "par de meias", emoji: "🧦", price: 8,  weight: 1, cat: "frio" },
  { id: "bota",    name: "bota",    emoji: "🥾", price: 35, weight: 2, cat: "frio" },

  // ── Objetos ──
  { id: "bola",       name: "bola",          emoji: "⚽", price: 15, weight: 2, cat: "objeto" },
  { id: "guardasol",  name: "guarda-sol",    emoji: "⛱️", price: 35, weight: 4, cat: "objeto" },
  { id: "copos",      name: "copos",         emoji: "🥤", price: 6,  weight: 1, cat: "objeto" },
  { id: "caixa",      name: "caixa térmica", emoji: "🧊", price: 25, weight: 3, cat: "objeto" },
  { id: "lanterna",   name: "lanterna",      emoji: "🔦", price: 12, weight: 1, cat: "objeto" },
  { id: "cobertor",   name: "cobertor",      emoji: "🛏️", price: 20, weight: 2, cat: "objeto" },
];

export const ITENS_POR_CAT: Record<Categoria, ItemCompra[]> = ITENS.reduce((acc, it) => {
  (acc[it.cat] ??= []).push(it);
  return acc;
}, {} as Record<Categoria, ItemCompra[]>);

export const itemById = (id: string): ItemCompra | undefined => ITENS.find((i) => i.id === id);
