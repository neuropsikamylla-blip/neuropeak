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

export const ANIMAIS_DOMAIN: FlexDomain = {
  id: "animais",
  name: "Animais",
  collectVerb: "Agrupe",
  categories: [
    { id: "fazenda",   label: "Fazenda",   emoji: "🐄" },
    { id: "selva",     label: "Selva",     emoji: "🦁" },
    { id: "aquatico",  label: "Aquático",  emoji: "🐠" },
    { id: "domestico", label: "Doméstico", emoji: "🐶" },
  ],
  items: [
    { id: "an-vaca",      name: "Vaca",      cat: "fazenda",   price: 8.00 },
    { id: "an-porco",     name: "Porco",     cat: "fazenda",   price: 6.00 },
    { id: "an-galinha",   name: "Galinha",   cat: "fazenda",   price: 5.00 },
    { id: "an-cavalo",    name: "Cavalo",    cat: "fazenda",   price: 12.00 },
    { id: "an-ovelha",    name: "Ovelha",    cat: "fazenda",   price: 7.00 },
    { id: "an-pato",      name: "Pato",      cat: "fazenda",   price: 4.00 },
    { id: "an-leao",      name: "Leão",      cat: "selva",     price: 15.00 },
    { id: "an-elefante",  name: "Elefante",  cat: "selva",     price: 18.00 },
    { id: "an-macaco",    name: "Macaco",    cat: "selva",     price: 9.00 },
    { id: "an-girafa",    name: "Girafa",    cat: "selva",     price: 14.00 },
    { id: "an-zebra",     name: "Zebra",     cat: "selva",     price: 11.00 },
    { id: "an-tigre",     name: "Tigre",     cat: "selva",     price: 16.00 },
    { id: "an-peixe",     name: "Peixe",     cat: "aquatico",  price: 6.00 },
    { id: "an-golfinho",  name: "Golfinho",  cat: "aquatico",  price: 13.00 },
    { id: "an-polvo",     name: "Polvo",     cat: "aquatico",  price: 10.00 },
    { id: "an-tartaruga", name: "Tartaruga", cat: "aquatico",  price: 8.00 },
    { id: "an-tubarao",   name: "Tubarão",   cat: "aquatico",  price: 17.00 },
    { id: "an-caranguejo",name: "Caranguejo",cat: "aquatico",  price: 7.00 },
    { id: "an-cachorro",  name: "Cachorro",  cat: "domestico", price: 9.00 },
    { id: "an-gato",      name: "Gato",      cat: "domestico", price: 7.00 },
    { id: "an-coelho",    name: "Coelho",    cat: "domestico", price: 5.00 },
    { id: "an-papagaio",  name: "Papagaio",  cat: "domestico", price: 11.00 },
    { id: "an-hamster",   name: "Hamster",   cat: "domestico", price: 4.00 },
    { id: "an-calopsita", name: "Calopsita", cat: "domestico", price: 8.00 },
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

export const ALL_DOMAINS: FlexDomain[] = [SUPERMERCADO_DOMAIN, ANIMAIS_DOMAIN, VESTUARIO_DOMAIN];

export function pickRandomDomain(): FlexDomain {
  return ALL_DOMAINS[Math.floor(Math.random() * ALL_DOMAINS.length)];
}

export function fmt(price: number): string {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}
