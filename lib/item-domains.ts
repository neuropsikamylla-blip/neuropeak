export interface FlexItem {
  id: string;
  name: string;
  cat: string;
  price: number;
}

export interface FlexCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface FlexDomain {
  id: string;
  name: string;
  collectVerb: string;
  categories: FlexCategory[];
  items: FlexItem[];
}

export function shuffleFlex<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function itemsByFlexCat(domain: FlexDomain, cat: string): FlexItem[] {
  return domain.items.filter(i => i.cat === cat);
}

export const SUPERMERCADO_DOMAIN: FlexDomain = {
  id: "supermercado",
  name: "Supermercado",
  collectVerb: "Colete",
  categories: [
    { id: "hortifruti", label: "Hortifruti",  emoji: "🥦" },
    { id: "laticinios", label: "Laticínios",  emoji: "🥛" },
    { id: "mercearia",  label: "Mercearia",   emoji: "🌾" },
    { id: "higiene",    label: "Higiene",     emoji: "🧴" },
    { id: "bebidas",    label: "Bebidas",     emoji: "🥤" },
  ],
  items: [
    { id: "banana",     name: "Banana",           cat: "hortifruti", price: 3.90 },
    { id: "maca",       name: "Maçã",             cat: "hortifruti", price: 6.90 },
    { id: "tomate",     name: "Tomate",           cat: "hortifruti", price: 4.50 },
    { id: "alface",     name: "Alface",           cat: "hortifruti", price: 2.90 },
    { id: "batata",     name: "Batata",           cat: "hortifruti", price: 5.90 },
    { id: "cenoura",    name: "Cenoura",          cat: "hortifruti", price: 4.90 },
    { id: "laranja",    name: "Laranja",          cat: "hortifruti", price: 3.50 },
    { id: "uva",        name: "Uva",              cat: "hortifruti", price: 8.90 },
    { id: "leite",      name: "Leite",            cat: "laticinios", price: 5.90 },
    { id: "manteiga",   name: "Manteiga",         cat: "laticinios", price: 9.90 },
    { id: "queijo",     name: "Queijo",           cat: "laticinios", price: 14.90 },
    { id: "iogurte",    name: "Iogurte",          cat: "laticinios", price: 7.90 },
    { id: "ovos",       name: "Ovos",             cat: "laticinios", price: 12.90 },
    { id: "frango",     name: "Frango",           cat: "laticinios", price: 16.90 },
    { id: "arroz",      name: "Arroz",            cat: "mercearia",  price: 7.90 },
    { id: "feijao",     name: "Feijão",           cat: "mercearia",  price: 8.90 },
    { id: "macarrao",   name: "Macarrão",         cat: "mercearia",  price: 4.50 },
    { id: "cafe",       name: "Café",             cat: "mercearia",  price: 11.90 },
    { id: "acucar",     name: "Açúcar",           cat: "mercearia",  price: 4.90 },
    { id: "sal",        name: "Sal",              cat: "mercearia",  price: 2.90 },
    { id: "oleo",       name: "Óleo",             cat: "mercearia",  price: 13.90 },
    { id: "pao",        name: "Pão",              cat: "mercearia",  price: 6.90 },
    { id: "sabao",      name: "Sabão em pó",      cat: "higiene",    price: 18.90 },
    { id: "papel-hig",  name: "Papel higiênico",  cat: "higiene",    price: 14.90 },
    { id: "shampoo",    name: "Shampoo",          cat: "higiene",    price: 16.90 },
    { id: "pasta",      name: "Pasta de dente",   cat: "higiene",    price: 6.90 },
    { id: "sabonete",   name: "Sabonete",         cat: "higiene",    price: 4.90 },
    { id: "detergente", name: "Detergente",       cat: "higiene",    price: 3.90 },
    { id: "agua-min",   name: "Água mineral",     cat: "bebidas",    price: 3.50 },
    { id: "suco-cx",    name: "Suco de caixa",    cat: "bebidas",    price: 5.90 },
    { id: "refri",      name: "Refrigerante",     cat: "bebidas",    price: 8.90 },
    { id: "cha",        name: "Chá gelado",       cat: "bebidas",    price: 6.90 },
  ],
};

export const BRINQUEDOS_DOMAIN: FlexDomain = {
  id: "brinquedos",
  name: "Brinquedos",
  collectVerb: "Separe",
  categories: [
    { id: "pelucias",    label: "Pelúcias",    emoji: "🧸" },
    { id: "veiculos",    label: "Veículos",    emoji: "🚗" },
    { id: "jogos",       label: "Jogos",       emoji: "🎲" },
    { id: "eletronicos", label: "Eletrônicos", emoji: "🎮" },
  ],
  items: [
    { id: "bq-ursinho",  name: "Ursinho",        cat: "pelucias",    price: 29.90 },
    { id: "bq-panda",    name: "Panda",          cat: "pelucias",    price: 34.90 },
    { id: "bq-coelho",   name: "Coelho",         cat: "pelucias",    price: 24.90 },
    { id: "bq-boneca",   name: "Boneca",         cat: "pelucias",    price: 44.90 },
    { id: "bq-carrinho", name: "Carrinho",       cat: "veiculos",    price: 19.90 },
    { id: "bq-aviao",    name: "Aviãozinho",     cat: "veiculos",    price: 24.90 },
    { id: "bq-barco",    name: "Barquinho",      cat: "veiculos",    price: 22.90 },
    { id: "bq-trem",     name: "Trem",           cat: "veiculos",    price: 39.90 },
    { id: "bq-dado",     name: "Dado",           cat: "jogos",       price: 9.90 },
    { id: "bq-cartas",   name: "Baralho",        cat: "jogos",       price: 14.90 },
    { id: "bq-puzzle",   name: "Quebra-cabeça",  cat: "jogos",       price: 34.90 },
    { id: "bq-lego",     name: "Lego",           cat: "jogos",       price: 49.90 },
    { id: "bq-controle", name: "Controle",       cat: "eletronicos", price: 79.90 },
    { id: "bq-robo",     name: "Robozinho",      cat: "eletronicos", price: 89.90 },
    { id: "bq-drone",    name: "Drone",          cat: "eletronicos", price: 129.90 },
    { id: "bq-tablet",   name: "Tablet",         cat: "eletronicos", price: 149.90 },
  ],
};

export const VESTUARIO_DOMAIN: FlexDomain = {
  id: "vestuario",
  name: "Vestuário",
  collectVerb: "Separe",
  categories: [
    { id: "tops",       label: "Parte de cima", emoji: "👕" },
    { id: "calcados",   label: "Calçados",      emoji: "👟" },
    { id: "acessorios", label: "Acessórios",    emoji: "🕶️" },
    { id: "baixo",      label: "Parte de baixo",emoji: "👖" },
  ],
  items: [
    { id: "vs-camiseta",  name: "Camiseta",     cat: "tops",       price: 29.90 },
    { id: "vs-vestido",   name: "Vestido",      cat: "tops",       price: 59.90 },
    { id: "vs-casaco",    name: "Casaco",       cat: "tops",       price: 89.90 },
    { id: "vs-moletom",   name: "Moletom",      cat: "tops",       price: 69.90 },
    { id: "vs-camisa",    name: "Camisa",       cat: "tops",       price: 49.90 },
    { id: "vs-blusa",     name: "Blusa",        cat: "tops",       price: 39.90 },
    { id: "vs-sapato",    name: "Sapato",       cat: "calcados",   price: 99.90 },
    { id: "vs-tenis",     name: "Tênis",        cat: "calcados",   price: 149.90 },
    { id: "vs-sandalia",  name: "Sandália",     cat: "calcados",   price: 79.90 },
    { id: "vs-bota",      name: "Bota",         cat: "calcados",   price: 129.90 },
    { id: "vs-chinelo",   name: "Chinelo",      cat: "calcados",   price: 29.90 },
    { id: "vs-salto",     name: "Scarpin",      cat: "calcados",   price: 119.90 },
    { id: "vs-chapeu",    name: "Chapéu",       cat: "acessorios", price: 39.90 },
    { id: "vs-oculos",    name: "Óculos",       cat: "acessorios", price: 49.90 },
    { id: "vs-bolsa",     name: "Bolsa",        cat: "acessorios", price: 89.90 },
    { id: "vs-relogio",   name: "Relógio",      cat: "acessorios", price: 119.90 },
    { id: "vs-cinto",     name: "Cinto",        cat: "acessorios", price: 29.90 },
    { id: "vs-meia",      name: "Meia",         cat: "acessorios", price: 14.90 },
    { id: "vs-calca",     name: "Calça",        cat: "baixo",      price: 79.90 },
    { id: "vs-saia",      name: "Saia",         cat: "baixo",      price: 59.90 },
    { id: "vs-bermuda",   name: "Bermuda",      cat: "baixo",      price: 49.90 },
    { id: "vs-legging",   name: "Legging",      cat: "baixo",      price: 39.90 },
    { id: "vs-short",     name: "Short",        cat: "baixo",      price: 34.90 },
    { id: "vs-jeans",     name: "Jeans",        cat: "baixo",      price: 89.90 },
  ],
};

export const ALL_DOMAINS: FlexDomain[] = [SUPERMERCADO_DOMAIN, BRINQUEDOS_DOMAIN, VESTUARIO_DOMAIN];

export function pickRandomDomain(): FlexDomain {
  return ALL_DOMAINS[Math.floor(Math.random() * ALL_DOMAINS.length)];
}

export function fmt(price: number): string {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}
