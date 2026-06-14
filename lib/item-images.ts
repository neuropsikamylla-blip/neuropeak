// Itens com imagem real em /public/exercises/itens/<id>.png.
// Compartilhado por: Sequência de Itens, Decisão Rápida, Associação de Pares.
// Quem não tem imagem ainda cai no emoji (fallback) automaticamente.

export const ITEM_IMAGE_IDS = new Set<string>([
  // animais
  "gato", "cachorro", "peixe", "passaro", "coelho", "sapo", "leao", "elefante", "borboleta", "girafa", "tartaruga",
  // objetos
  "livro", "carro", "sino", "bola", "chave", "copo", "caneta", "oculos", "telefone", "relogio", "mochila", "guarda-chuva",
  "sapato", "mesa", "aviao", "barco", "casa",
  // natureza & comida
  "flor", "maca", "arvore", "sol", "lua", "estrela", "coracao",
  // faltam (emoji por enquanto): cadeira, lapis
]);

// versão das imagens — subir quando reprocessar (fura cache)
export const ITEM_IMG_V = "?v=1";

export function itemImageId(name: string): string {
  return name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // tira acentos
    .replace(/\s+/g, "-");
}

export function hasItemImage(name: string): boolean {
  return ITEM_IMAGE_IDS.has(itemImageId(name));
}

export function itemImageSrc(name: string): string {
  return `/exercises/itens/${itemImageId(name)}.png${ITEM_IMG_V}`;
}
