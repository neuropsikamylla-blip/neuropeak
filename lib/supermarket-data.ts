export type Category = "hortifruti" | "laticinios" | "mercearia" | "higiene" | "bebidas";

export const CAT_LABELS: Record<Category, string> = {
  hortifruti: "Hortifruti",
  laticinios: "Laticínios",
  mercearia: "Mercearia",
  higiene: "Higiene",
  bebidas: "Bebidas",
};

export const CAT_EMOJIS: Record<Category, string> = {
  hortifruti: "🥦",
  laticinios: "🥛",
  mercearia: "🌾",
  higiene: "🧴",
  bebidas: "🥤",
};

export interface SuperItem {
  id: string;
  name: string;
  emoji: string;
  cat: Category;
  price: number;
}

export const SUPER_ITEMS: SuperItem[] = [
  { id: "banana",    name: "Banana",          emoji: "🍌", cat: "hortifruti", price: 3.90 },
  { id: "maca",      name: "Maçã",            emoji: "🍎", cat: "hortifruti", price: 6.90 },
  { id: "tomate",    name: "Tomate",          emoji: "🍅", cat: "hortifruti", price: 4.50 },
  { id: "alface",    name: "Alface",          emoji: "🥬", cat: "hortifruti", price: 2.90 },
  { id: "batata",    name: "Batata",          emoji: "🥔", cat: "hortifruti", price: 5.90 },
  { id: "cenoura",   name: "Cenoura",         emoji: "🥕", cat: "hortifruti", price: 4.90 },
  { id: "laranja",   name: "Laranja",         emoji: "🍊", cat: "hortifruti", price: 3.50 },
  { id: "uva",       name: "Uva",             emoji: "🍇", cat: "hortifruti", price: 8.90 },
  { id: "leite",     name: "Leite",           emoji: "🥛", cat: "laticinios", price: 5.90 },
  { id: "manteiga",  name: "Manteiga",        emoji: "🧈", cat: "laticinios", price: 9.90 },
  { id: "queijo",    name: "Queijo",          emoji: "🧀", cat: "laticinios", price: 14.90 },
  { id: "iogurte",   name: "Iogurte",         emoji: "🍶", cat: "laticinios", price: 7.90 },
  { id: "ovos",      name: "Ovos",            emoji: "🥚", cat: "laticinios", price: 12.90 },
  { id: "frango",    name: "Frango",          emoji: "🍗", cat: "laticinios", price: 16.90 },
  { id: "arroz",     name: "Arroz",           emoji: "🌾", cat: "mercearia",  price: 7.90 },
  { id: "feijao",    name: "Feijão",          emoji: "🫘", cat: "mercearia",  price: 8.90 },
  { id: "macarrao",  name: "Macarrão",        emoji: "🍝", cat: "mercearia",  price: 4.50 },
  { id: "cafe",      name: "Café",            emoji: "☕", cat: "mercearia",  price: 11.90 },
  { id: "acucar",    name: "Açúcar",          emoji: "🍬", cat: "mercearia",  price: 4.90 },
  { id: "sal",       name: "Sal",             emoji: "🧂", cat: "mercearia",  price: 2.90 },
  { id: "oleo",      name: "Óleo",            emoji: "🫙", cat: "mercearia",  price: 13.90 },
  { id: "pao",       name: "Pão",             emoji: "🍞", cat: "mercearia",  price: 6.90 },
  { id: "sabao",     name: "Sabão em pó",     emoji: "🧴", cat: "higiene",    price: 18.90 },
  { id: "papel-hig", name: "Papel higiênico", emoji: "🧻", cat: "higiene",    price: 14.90 },
  { id: "shampoo",   name: "Shampoo",         emoji: "🚿", cat: "higiene",    price: 16.90 },
  { id: "pasta",     name: "Pasta de dente",  emoji: "🦷", cat: "higiene",    price: 6.90 },
  { id: "sabonete",  name: "Sabonete",        emoji: "🫧", cat: "higiene",    price: 4.90 },
  { id: "detergente",name: "Detergente",      emoji: "🧽", cat: "higiene",    price: 3.90 },
  { id: "agua-min",  name: "Água mineral",    emoji: "💧", cat: "bebidas",    price: 3.50 },
  { id: "suco-cx",   name: "Suco de caixa",   emoji: "🧃", cat: "bebidas",    price: 5.90 },
  { id: "refri",     name: "Refrigerante",    emoji: "🥤", cat: "bebidas",    price: 8.90 },
  { id: "cha",       name: "Chá gelado",      emoji: "🍵", cat: "bebidas",    price: 6.90 },
];

export const ALL_CATEGORIES: Category[] = ["hortifruti", "laticinios", "mercearia", "higiene", "bebidas"];

export function shuffleSM<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function itemsByCategory(cat: Category): SuperItem[] {
  return SUPER_ITEMS.filter(i => i.cat === cat);
}

export function fmt(price: number): string {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}
