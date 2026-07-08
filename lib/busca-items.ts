// Catálogo do exercício "Busca Rápida" — 6 categorias com imagens 3D
// consistentes (public/exercises/busca/<id>.png). Categorias vizinhas (`NEAR`)
// geram distratores DIFÍCEIS (semanticamente próximos); as demais, fáceis.

export interface BuscaItem { id: string; name: string; cat: string; }
export interface BuscaCat { id: string; label: string; }

export const BUSCA_CATS: BuscaCat[] = [
  { id: "hortifruti",   label: "Frutas e verduras" },
  { id: "supermercado", label: "Itens de mercado" },
  { id: "higiene",      label: "Itens de higiene" },
  { id: "roupas",       label: "Roupas" },
  { id: "acessorios",   label: "Acessórios" },
  { id: "materiais",    label: "Materiais escolares" },
];

// Categorias semanticamente próximas → distratores difíceis.
export const NEAR: Record<string, string[]> = {
  hortifruti:   ["supermercado"],
  supermercado: ["hortifruti", "higiene"],
  higiene:      ["supermercado", "materiais"],
  roupas:       ["acessorios"],
  acessorios:   ["roupas", "materiais"],
  materiais:    ["acessorios", "higiene"],
};

export const BUSCA_ITEMS: BuscaItem[] = [
  // Hortifruti
  { id: "banana", name: "Banana", cat: "hortifruti" },
  { id: "maca", name: "Maçã", cat: "hortifruti" },
  { id: "cenoura", name: "Cenoura", cat: "hortifruti" },
  { id: "brocolis", name: "Brócolis", cat: "hortifruti" },
  { id: "alface", name: "Alface", cat: "hortifruti" },
  { id: "tomate", name: "Tomate", cat: "hortifruti" },
  { id: "uva", name: "Uva", cat: "hortifruti" },
  { id: "laranja", name: "Laranja", cat: "hortifruti" },
  { id: "pepino", name: "Pepino", cat: "hortifruti" },
  { id: "cebola", name: "Cebola", cat: "hortifruti" },
  { id: "abacate", name: "Abacate", cat: "hortifruti" },
  { id: "morango", name: "Morango", cat: "hortifruti" },
  // Supermercado
  { id: "arroz", name: "Arroz", cat: "supermercado" },
  { id: "feijao", name: "Feijão", cat: "supermercado" },
  { id: "macarrao", name: "Macarrão", cat: "supermercado" },
  { id: "pao", name: "Pão", cat: "supermercado" },
  { id: "leite", name: "Leite", cat: "supermercado" },
  { id: "queijo", name: "Queijo", cat: "supermercado" },
  { id: "cafe", name: "Café", cat: "supermercado" },
  { id: "biscoito", name: "Biscoito", cat: "supermercado" },
  { id: "oleo", name: "Óleo", cat: "supermercado" },
  { id: "cereal", name: "Cereal", cat: "supermercado" },
  { id: "molho-tomate", name: "Molho de tomate", cat: "supermercado" },
  { id: "agua-mineral", name: "Água mineral", cat: "supermercado" },
  // Higiene
  { id: "sabonete", name: "Sabonete", cat: "higiene" },
  { id: "shampoo", name: "Shampoo", cat: "higiene" },
  { id: "condicionador", name: "Condicionador", cat: "higiene" },
  { id: "escova-dente", name: "Escova de dente", cat: "higiene" },
  { id: "pasta-dente", name: "Pasta de dente", cat: "higiene" },
  { id: "fio-dental", name: "Fio dental", cat: "higiene" },
  { id: "desodorante", name: "Desodorante", cat: "higiene" },
  { id: "perfume", name: "Perfume", cat: "higiene" },
  { id: "toalha", name: "Toalha", cat: "higiene" },
  { id: "pente", name: "Pente", cat: "higiene" },
  { id: "escova-cabelo", name: "Escova de cabelo", cat: "higiene" },
  { id: "papel-hig", name: "Papel higiênico", cat: "higiene" },
  // Roupas
  { id: "camiseta", name: "Camiseta", cat: "roupas" },
  { id: "camisa", name: "Camisa", cat: "roupas" },
  { id: "calca", name: "Calça", cat: "roupas" },
  { id: "vestido", name: "Vestido", cat: "roupas" },
  { id: "casaco", name: "Casaco", cat: "roupas" },
  { id: "blusa", name: "Blusa", cat: "roupas" },
  { id: "saia", name: "Saia", cat: "roupas" },
  { id: "shorts", name: "Shorts", cat: "roupas" },
  { id: "meia", name: "Meia", cat: "roupas" },
  { id: "pijama", name: "Pijama", cat: "roupas" },
  { id: "moletom", name: "Moletom", cat: "roupas" },
  { id: "jaqueta", name: "Jaqueta", cat: "roupas" },
  // Acessórios
  { id: "bolsa", name: "Bolsa", cat: "acessorios" },
  { id: "chapeu", name: "Chapéu", cat: "acessorios" },
  { id: "relogio", name: "Relógio", cat: "acessorios" },
  { id: "cinto", name: "Cinto", cat: "acessorios" },
  { id: "oculos", name: "Óculos", cat: "acessorios" },
  { id: "colar", name: "Colar", cat: "acessorios" },
  { id: "pulseira", name: "Pulseira", cat: "acessorios" },
  { id: "anel", name: "Anel", cat: "acessorios" },
  { id: "bone", name: "Boné", cat: "acessorios" },
  { id: "carteira", name: "Carteira", cat: "acessorios" },
  { id: "cachecol", name: "Cachecol", cat: "acessorios" },
  { id: "guarda-chuva", name: "Guarda-chuva", cat: "acessorios" },
  // Materiais escolares
  { id: "caderno", name: "Caderno", cat: "materiais" },
  { id: "lapis", name: "Lápis", cat: "materiais" },
  { id: "caneta", name: "Caneta", cat: "materiais" },
  { id: "borracha", name: "Borracha", cat: "materiais" },
  { id: "tesoura", name: "Tesoura", cat: "materiais" },
  { id: "cola", name: "Cola", cat: "materiais" },
  { id: "regua", name: "Régua", cat: "materiais" },
  { id: "apontador", name: "Apontador", cat: "materiais" },
  { id: "mochila", name: "Mochila", cat: "materiais" },
  { id: "estojo", name: "Estojo", cat: "materiais" },
  { id: "livro", name: "Livro", cat: "materiais" },
  { id: "pincel", name: "Pincel", cat: "materiais" },
];

export function itemsByCat(catId: string): BuscaItem[] {
  return BUSCA_ITEMS.filter(i => i.cat === catId);
}
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
