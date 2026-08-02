// ─────────────────────────────────────────────────────────────────────────────
// Informação em Foco — CATÁLOGO CENTRAL (fonte única dos dados dos produtos).
//
// FASE 1 da correção estrutural (spec em docs/INFORMACAO-EM-FOCO-FASE1-*.md):
// estes atributos são FIXOS — nunca podem ser sorteados por questão. O conteúdo de
// cada produto foi LIDO na própria embalagem em 02/ago/2026 (leitura visual conferida
// uma a uma, sem OCR). O que varia por sessão é só preço e validade (§4), sempre
// dentro da faixa declarada aqui e estável durante a sessão inteira.
//
// A imagem é representação visual; nenhum dado é extraído dela em tempo de execução.
// ─────────────────────────────────────────────────────────────────────────────

export type Unidade = "g" | "kg" | "mL" | "L" | "unidades" | "saches";
export type Dimensao = "massa" | "volume" | "contagem";
export type Conservacao = "seco" | "refrigerado" | "congelado" | "luz";

/** Categoria SEMÂNTICA: só produtos da mesma família entram na mesma questão. */
export type Categoria =
  | "leites" | "bebidas-vegetais" | "sucos" | "iogurtes" | "laticinios" | "frios"
  | "biscoitos" | "paes" | "cereais" | "graos-e-massas" | "farinaceos"
  | "conservas" | "congelados" | "molhos" | "oleos-e-vinagres" | "cafes-e-chas"
  | "acucares-e-adocantes" | "doces" | "temperos" | "pastas" | "ovos";

export interface Conteudo { valor: number; unidade: Unidade }

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  marca: string;
  categoria: Categoria;
  img: string;
  /** O que está impresso na embalagem. NUNCA sorteado. */
  conteudo: Conteudo;
  /** Contagem secundária impressa (ex.: caixa de 10 g COM 10 sachês). */
  saches?: number;
  unidades?: number;
  rendimento?: string;
  tipo?: string;
  sabor?: string | null;
  lactose?: boolean | null;
  gluten?: boolean | null;
  acucarAdicionado?: boolean | null;
  alergenicos?: string[];
  conservacao?: Conservacao;
  cacauPct?: number | null;
  /** Faixa plausível de preço em R$ (§12): sorteado 1× por sessão, dentro dela. */
  precoFaixa: [number, number];
  /** Frases REALMENTE legíveis na embalagem — habilitam a leitura direta. */
  frasesNaEmbalagem?: string[];
  directPackageReadingEnabled?: boolean;
  /** true = conteúdo não confirmado na imagem; fica fora de perguntas sobre conteúdo. */
  revisar?: boolean;
}

const img = (slug: string) => `/exercises/informacao-foco-produtos/${slug}.png`;

const p = (
  id: string, nome: string, marca: string, categoria: Categoria,
  valor: number, unidade: Unidade, precoFaixa: [number, number],
  extra: Partial<ProdutoCatalogo> = {},
): ProdutoCatalogo => ({ id, nome, marca, categoria, img: img(id), conteudo: { valor, unidade }, precoFaixa, ...extra });

export const CATALOGO_PRODUTOS: ProdutoCatalogo[] = [
  // ── Leites ────────────────────────────────────────────────────────────────
  p("leite-integral", "Leite integral", "Fazenda Boa", "leites", 1, "L", [4.5, 6.5],
    { tipo: "integral", lactose: true, conservacao: "seco", frasesNaEmbalagem: ["3% de gordura"], directPackageReadingEnabled: true }),
  p("leite-semidesnatado", "Leite semidesnatado", "Vida Leve", "leites", 1, "L", [4.5, 6.5],
    { tipo: "semidesnatado", lactose: true, conservacao: "seco", frasesNaEmbalagem: ["1% de gordura"], directPackageReadingEnabled: true }),
  p("leite-desnatado", "Leite desnatado", "Serra Clara", "leites", 1, "L", [4.5, 6.5],
    { tipo: "desnatado", lactose: true, conservacao: "seco" }),
  p("leite-sem-lactose", "Leite sem lactose", "LeveMais", "leites", 1, "L", [6.5, 9.5],
    { tipo: "sem lactose", lactose: false, conservacao: "seco", frasesNaEmbalagem: ["fácil de digerir"], directPackageReadingEnabled: true }),
  p("leite-em-po", "Leite em pó integral", "Vale do Campo", "leites", 400, "g", [16, 24],
    { tipo: "integral", lactose: true, rendimento: "10 copos", conservacao: "seco",
      frasesNaEmbalagem: ["rende até 10 copos", "instantâneo"], directPackageReadingEnabled: true }),

  // ── Bebidas vegetais ──────────────────────────────────────────────────────
  p("bebida-aveia", "Bebida de aveia", "Aveia Viva", "bebidas-vegetais", 1, "L", [8, 13],
    { lactose: false, acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["100% vegetal", "sem lactose", "sem açúcares adicionados"], directPackageReadingEnabled: true }),
  p("bebida-amendoas", "Bebida de amêndoas", "Amêndoa Pura", "bebidas-vegetais", 1, "L", [9, 15],
    { lactose: false, alergenicos: ["amêndoa"], conservacao: "seco",
      frasesNaEmbalagem: ["100% vegetal"], directPackageReadingEnabled: true }),

  // ── Sucos ─────────────────────────────────────────────────────────────────
  p("suco-laranja", "Suco de laranja", "Sol da Laranja", "sucos", 1, "L", [7, 12],
    { sabor: "laranja", acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["100% de suco", "sem adição de açúcares"], directPackageReadingEnabled: true }),
  p("suco-uva", "Suco de uva", "Vale da Uva", "sucos", 1, "L", [9, 15],
    { sabor: "uva", acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["100% suco", "sem adição de açúcares"], directPackageReadingEnabled: true }),

  // ── Iogurtes ──────────────────────────────────────────────────────────────
  p("iogurte-natural", "Iogurte natural", "Campo Vivo", "iogurtes", 170, "g", [3, 5],
    { sabor: "natural", lactose: true, conservacao: "refrigerado" }),
  p("iogurte-sem-lactose", "Iogurte sem lactose", "LeveMais", "iogurtes", 170, "g", [4, 6.5],
    { sabor: "natural", lactose: false, conservacao: "refrigerado",
      frasesNaEmbalagem: ["0% lactose", "fácil digestão"], directPackageReadingEnabled: true }),

  // ── Laticínios ────────────────────────────────────────────────────────────
  p("manteiga", "Manteiga com sal", "Vale Dourado", "laticinios", 200, "g", [11, 18],
    { tipo: "com sal", lactose: true, conservacao: "refrigerado" }),
  p("margarina", "Margarina cremosa", "Bela Mesa", "laticinios", 500, "g", [7, 12],
    { tipo: "cremosa", lactose: false, conservacao: "refrigerado",
      frasesNaEmbalagem: ["60% de lipídios", "com sal"], directPackageReadingEnabled: true }),
  p("requeijao", "Requeijão cremoso", "Vellano", "laticinios", 200, "g", [7, 12],
    { tipo: "tradicional", lactose: true, conservacao: "refrigerado" }),
  p("mucarela", "Queijo muçarela fatiado", "Villaggio", "laticinios", 150, "g", [9, 15],
    { lactose: true, conservacao: "refrigerado" }),
  p("creme-leite", "Creme de leite", "Vale Sereno", "laticinios", 200, "g", [3.5, 6],
    { lactose: true, conservacao: "seco" }),
  p("leite-condensado", "Leite condensado", "Doçura", "doces", 395, "g", [6, 10],
    { lactose: true, gluten: false, acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["sem glúten"], directPackageReadingEnabled: true }),

  // ── Frios e ovos ──────────────────────────────────────────────────────────
  p("presunto", "Presunto cozido fatiado", "Saboratto", "frios", 200, "g", [8, 14],
    { conservacao: "refrigerado" }),
  p("ovos", "Ovos brancos", "Campo Sereno", "ovos", 12, "unidades", [12, 20],
    { unidades: 12, conservacao: "refrigerado", alergenicos: ["ovo"],
      frasesNaEmbalagem: ["12 unidades"], directPackageReadingEnabled: true }),

  // ── Biscoitos e torradas ──────────────────────────────────────────────────
  p("biscoito-maria", "Biscoito Maria", "Casa do Trigo", "biscoitos", 400, "g", [4, 7],
    { tipo: "tradicional", gluten: true, acucarAdicionado: true, conservacao: "seco" }),
  p("biscoito-integral", "Biscoito integral", "Sabor da Vila", "biscoitos", 400, "g", [5, 8],
    { tipo: "integral", gluten: true, acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["rico em fibras"], directPackageReadingEnabled: true }),
  p("biscoito-sem-acucar", "Biscoito sem açúcar", "Leve Sabor", "biscoitos", 350, "g", [6, 10],
    { tipo: "integral", gluten: true, acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["sem açúcar", "integral"], directPackageReadingEnabled: true }),
  p("torrada", "Torrada integral", "Grão Crocante", "biscoitos", 160, "g", [5, 8],
    { tipo: "integral", gluten: true, conservacao: "seco",
      frasesNaEmbalagem: ["leve e crocante", "integral"], directPackageReadingEnabled: true }),

  // ── Pães ──────────────────────────────────────────────────────────────────
  p("pao-forma", "Pão de forma integral", "Pão da Vila", "paes", 500, "g", [7, 12],
    { tipo: "integral", gluten: true, conservacao: "seco",
      frasesNaEmbalagem: ["fonte de fibras", "integral"], directPackageReadingEnabled: true }),

  // ── Cereais e sementes ────────────────────────────────────────────────────
  p("aveia", "Aveia em flocos", "Campo Dourado", "cereais", 450, "g", [7, 12],
    { tipo: "integral", gluten: true, conservacao: "seco",
      frasesNaEmbalagem: ["100% aveia integral"], directPackageReadingEnabled: true }),
  p("granola", "Granola tradicional", "Terra Viva", "cereais", 500, "g", [14, 22],
    { tipo: "tradicional", acucarAdicionado: true, alergenicos: ["castanha"], conservacao: "seco",
      frasesNaEmbalagem: ["com cereais e castanhas"], directPackageReadingEnabled: true }),
  p("granola-sem-acucar", "Granola sem açúcar", "Colheita Boa", "cereais", 400, "g", [16, 24],
    { acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["sem açúcar", "fonte de fibras"], directPackageReadingEnabled: true }),
  p("cereal-matinal", "Cereal matinal", "Bom Grão", "cereais", 300, "g", [9, 15],
    { tipo: "multigrãos", acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["multigrãos"], directPackageReadingEnabled: true }),
  p("chia", "Chia em grãos", "Vida Leve", "cereais", 150, "g", [9, 16],
    { conservacao: "seco", frasesNaEmbalagem: ["fonte de ômega 3", "fibras e proteínas"], directPackageReadingEnabled: true }),
  p("linhaca", "Semente de linhaça", "Natureza Pura", "cereais", 200, "g", [7, 12],
    { tipo: "dourada", conservacao: "seco", frasesNaEmbalagem: ["rica em fibras e ômega 3"], directPackageReadingEnabled: true }),

  // ── Grãos e massas ────────────────────────────────────────────────────────
  p("arroz", "Arroz tipo 1", "Sítio Dourado", "graos-e-massas", 1, "kg", [5, 9],
    { tipo: "tipo 1", gluten: false, conservacao: "seco",
      frasesNaEmbalagem: ["tipo 1", "grãos selecionados"], directPackageReadingEnabled: true }),
  p("feijao", "Feijão carioca", "Feijão da Roça", "graos-e-massas", 1, "kg", [7, 12],
    { tipo: "tipo 1", gluten: false, conservacao: "seco",
      frasesNaEmbalagem: ["tipo 1"], directPackageReadingEnabled: true }),
  p("espaguete", "Espaguete", "Massa Nobre", "graos-e-massas", 500, "g", [4, 8],
    { tipo: "massa de sêmola", gluten: true, conservacao: "seco",
      frasesNaEmbalagem: ["massa de sêmola"], directPackageReadingEnabled: true }),

  // ── Farináceos ────────────────────────────────────────────────────────────
  p("farinha-trigo", "Farinha de trigo", "Bom Campo", "farinaceos", 1, "kg", [4.5, 8],
    { tipo: "tradicional", gluten: true, conservacao: "seco",
      frasesNaEmbalagem: ["enriquecida com ferro e ácido fólico"], directPackageReadingEnabled: true }),
  p("farinha-mandioca", "Farinha de mandioca", "Sabor da Terra", "farinaceos", 500, "g", [6, 10],
    { tipo: "torrada", gluten: false, conservacao: "seco",
      frasesNaEmbalagem: ["naturalmente sem glúten", "torrada"], directPackageReadingEnabled: true }),
  p("fuba", "Fubá", "Campo Novo", "farinaceos", 500, "g", [3.5, 6],
    { tipo: "farinha de milho fina", gluten: false, conservacao: "seco",
      frasesNaEmbalagem: ["100% milho selecionado"], directPackageReadingEnabled: true }),
  p("polvilho-doce", "Polvilho doce", "SolVale", "farinaceos", 500, "g", [6, 10],
    { gluten: false, conservacao: "seco", frasesNaEmbalagem: ["ideal para receitas doces e salgadas"], directPackageReadingEnabled: true }),
  p("goma-tapioca", "Goma de tapioca", "Tapioka Viva", "farinaceos", 500, "g", [5, 9],
    { tipo: "hidratada", gluten: false, conservacao: "seco",
      frasesNaEmbalagem: ["hidratada", "pronta para uso", "100% vegano", "sem glúten"], directPackageReadingEnabled: true }),
  p("fermento", "Fermento químico em pó", "Casa Nobre", "farinaceos", 100, "g", [4, 7],
    { conservacao: "seco" }),
  p("gelatina", "Gelatina incolor", "Doce Flora", "doces", 24, "g", [5, 9],
    { tipo: "incolor", sabor: "sem sabor", rendimento: "12 porções", conservacao: "seco",
      frasesNaEmbalagem: ["incolor sem sabor", "em pó sem sabor", "rende 12 porções"], directPackageReadingEnabled: true }),

  // ── Conservas ─────────────────────────────────────────────────────────────
  p("milho-conserva", "Milho em conserva", "Sabor do Campo", "conservas", 200, "g", [3.5, 6],
    { gluten: false, conservacao: "seco", frasesNaEmbalagem: ["grãos selecionados", "sem glúten"], directPackageReadingEnabled: true }),
  p("ervilha", "Ervilha em conserva", "Verde Vale", "conservas", 200, "g", [3.5, 6],
    { conservacao: "seco", frasesNaEmbalagem: ["selecionadas", "fonte de fibras e proteínas"], directPackageReadingEnabled: true }),
  p("atum", "Atum em lata", "Mar Azul", "conservas", 170, "g", [7, 12],
    { tipo: "em óleo", alergenicos: ["peixe"], conservacao: "seco",
      frasesNaEmbalagem: ["em óleo", "fonte de proteína"], directPackageReadingEnabled: true }),

  // ── Congelados ────────────────────────────────────────────────────────────
  p("lasanha", "Lasanha congelada", "Forno da Serra", "congelados", 600, "g", [18, 28],
    { tipo: "à bolonhesa", lactose: true, gluten: true, conservacao: "congelado",
      frasesNaEmbalagem: ["manter congelado", "pronto para aquecer"], directPackageReadingEnabled: true }),
  p("nuggets", "Nuggets de frango", "Frango Dourado", "congelados", 300, "g", [12, 20],
    { gluten: true, conservacao: "congelado", frasesNaEmbalagem: ["manter congelado", "crocantes"], directPackageReadingEnabled: true }),
  p("hamburguer-vegetal", "Hambúrguer vegetal", "Verde Burger", "congelados", 320, "g", [16, 26],
    { lactose: false, conservacao: "congelado",
      frasesNaEmbalagem: ["manter congelado", "100% vegetal", "à base de plantas", "sem colesterol"], directPackageReadingEnabled: true }),
  p("sopa-legumes", "Sopa congelada de legumes", "Prato Leve", "congelados", 400, "g", [10, 17],
    { conservacao: "congelado", frasesNaEmbalagem: ["manter congelado", "prático e saudável"], directPackageReadingEnabled: true }),

  // ── Molhos ────────────────────────────────────────────────────────────────
  p("molho-tomate", "Molho de tomate", "Casa Toscana", "molhos", 300, "g", [2.5, 5],
    { tipo: "tradicional", conservacao: "seco", frasesNaEmbalagem: ["feito com tomates selecionados"], directPackageReadingEnabled: true }),
  p("ketchup", "Ketchup", "Saborio", "molhos", 400, "g", [7, 12],
    { tipo: "tradicional", acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["feito com tomates selecionados"], directPackageReadingEnabled: true }),
  p("maionese", "Maionese", "Vale Sabor", "molhos", 500, "g", [8, 14],
    { tipo: "tradicional", alergenicos: ["ovo"], conservacao: "seco",
      frasesNaEmbalagem: ["ovos selecionados", "cremosa e equilibrada"], directPackageReadingEnabled: true }),
  p("molho-barbecue", "Molho barbecue", "Churras Sabor", "molhos", 400, "g", [10, 16],
    { tipo: "defumado", acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["sabor defumado"], directPackageReadingEnabled: true }),
  p("shoyu", "Molho shoyu", "Sabor Oriental", "molhos", 150, "mL", [7, 12],
    { tipo: "tradicional", gluten: true, alergenicos: ["soja"], conservacao: "seco",
      frasesNaEmbalagem: ["fermentação natural"], directPackageReadingEnabled: true }),

  // ── Óleos e vinagres ──────────────────────────────────────────────────────
  p("oleo-soja", "Óleo de soja", "VitaNova", "oleos-e-vinagres", 900, "mL", [7, 12],
    { alergenicos: ["soja"], conservacao: "luz" }),
  p("azeite", "Azeite de oliva", "Vale Verde", "oleos-e-vinagres", 500, "mL", [28, 45],
    { tipo: "extra virgem", conservacao: "luz",
      frasesNaEmbalagem: ["extra virgem", "produto de Portugal"], directPackageReadingEnabled: true }),
  p("vinagre", "Vinagre de álcool", "Vitáre", "oleos-e-vinagres", 750, "mL", [3, 6],
    { conservacao: "seco" }),
  p("vinagre-balsamico", "Vinagre balsâmico", "Villa Romana", "oleos-e-vinagres", 250, "mL", [12, 22],
    { tipo: "de Modena", conservacao: "seco", frasesNaEmbalagem: ["de Modena"], directPackageReadingEnabled: true }),
  p("vinagre-maca", "Vinagre de maçã", "Sabor & Vida", "oleos-e-vinagres", 500, "mL", [8, 14],
    { tipo: "não filtrado", conservacao: "seco", frasesNaEmbalagem: ["não filtrado", "com 'mãe'"], directPackageReadingEnabled: true }),

  // ── Cafés e chás ──────────────────────────────────────────────────────────
  p("cafe", "Café solúvel", "Bom Dia", "cafes-e-chas", 200, "g", [14, 24],
    { tipo: "solúvel tradicional", conservacao: "seco",
      frasesNaEmbalagem: ["prático e saboroso", "100% café"], directPackageReadingEnabled: true }),
  p("cafe-torrado", "Café torrado e moído", "Serra Bonita", "cafes-e-chas", 500, "g", [16, 28],
    { tipo: "torrado e moído", conservacao: "seco", frasesNaEmbalagem: ["torrado e moído"], directPackageReadingEnabled: true }),
  p("cha-camomila", "Chá de camomila", "Floravita", "cafes-e-chas", 10, "g", [5, 9],
    { saches: 10, tipo: "camomila", lactose: null, conservacao: "seco",
      frasesNaEmbalagem: ["10 sachês", "100% natural", "sem corantes e conservantes"], directPackageReadingEnabled: true }),
  p("cha-verde", "Chá verde", "Chá Vital", "cafes-e-chas", 13, "g", [6, 10],
    { saches: 10, tipo: "chá verde", conservacao: "seco",
      frasesNaEmbalagem: ["10 sachês", "100% folhas de chá verde", "fonte de antioxidantes"], directPackageReadingEnabled: true }),

  // ── Açúcares e adoçantes ──────────────────────────────────────────────────
  p("acucar-refinado", "Açúcar refinado", "Doce Vida", "acucares-e-adocantes", 1, "kg", [4, 7],
    { tipo: "refinado", acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["dissolve fácil"], directPackageReadingEnabled: true }),
  p("acucar-mascavo", "Açúcar mascavo", "Terra Boa", "acucares-e-adocantes", 1, "kg", [8, 14],
    { tipo: "mascavo", acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["natural", "não refinado", "fonte de minerais"], directPackageReadingEnabled: true }),
  p("adocante-stevia", "Adoçante dietético", "Vida Leve", "acucares-e-adocantes", 40, "g", [12, 20],
    { saches: 50, tipo: "com stevia", acucarAdicionado: false, conservacao: "seco",
      frasesNaEmbalagem: ["contém 50 envelopes", "com stevia", "dietético"], directPackageReadingEnabled: true }),
  p("mel", "Mel", "Apiário Flor do Campo", "acucares-e-adocantes", 500, "g", [22, 35],
    { conservacao: "seco" }),

  // ── Doces e pastas ────────────────────────────────────────────────────────
  p("achocolatado", "Achocolatado em pó", "Chocomax", "doces", 400, "g", [8, 14],
    { acucarAdicionado: true, lactose: false, conservacao: "seco",
      frasesNaEmbalagem: ["fonte de vitaminas"], directPackageReadingEnabled: true }),
  p("chocolate-70", "Chocolate 70% cacau", "Cacau Nobre", "doces", 80, "g", [8, 14],
    { cacauPct: 70, gluten: false, acucarAdicionado: true, conservacao: "seco",
      frasesNaEmbalagem: ["70% cacau", "intenso e equilibrado", "sem glúten"], directPackageReadingEnabled: true }),
  p("geleia-morango", "Geleia de morango", "Sabor da Fazenda", "doces", 250, "g", [10, 17],
    { sabor: "morango", acucarAdicionado: true, conservacao: "refrigerado",
      frasesNaEmbalagem: ["70% de fruta"], directPackageReadingEnabled: true }),
  p("pasta-amendoim", "Pasta de amendoim", "NutriBem", "pastas", 500, "g", [18, 30],
    { tipo: "integral", acucarAdicionado: false, alergenicos: ["amendoim"], conservacao: "seco",
      frasesNaEmbalagem: ["integral", "sem adição de açúcar", "fonte de proteínas"], directPackageReadingEnabled: true }),

  // ── Temperos ──────────────────────────────────────────────────────────────
  p("sal", "Sal refinado", "Costa", "temperos", 1, "kg", [2, 4],
    { tipo: "iodado", conservacao: "seco", frasesNaEmbalagem: ["iodado"], directPackageReadingEnabled: true }),
  p("sal-rosa", "Sal rosa do Himalaia", "Canto de Minas", "temperos", 500, "g", [12, 20],
    { tipo: "fino", conservacao: "seco", frasesNaEmbalagem: ["fino"], directPackageReadingEnabled: true }),
  p("ervas-finas", "Ervas finas", "", "temperos", 20, "g", [7, 12],
    { conservacao: "seco", frasesNaEmbalagem: ["tempero 100% natural"], directPackageReadingEnabled: true }),
  p("mix-pimentas", "Mix de pimentas", "Chef's Selection", "temperos", 50, "g", [12, 20],
    { tipo: "moedor", conservacao: "seco", frasesNaEmbalagem: ["moedor"], directPackageReadingEnabled: true }),
];

// ── Dimensão da unidade: massa × volume × contagem nunca se comparam (§5) ────
export const dimensaoDe = (u: Unidade): Dimensao =>
  u === "g" || u === "kg" ? "massa" : u === "mL" || u === "L" ? "volume" : "contagem";

/** Valor normalizado para comparar dentro da MESMA dimensão (g e mL). */
export function valorNormalizado(c: Conteudo): number {
  if (c.unidade === "kg") return c.valor * 1000;
  if (c.unidade === "L") return c.valor * 1000;
  return c.valor;
}

export const produtoPorId = (id: string) => CATALOGO_PRODUTOS.find((x) => x.id === id);
export const TOTAL_CATALOGO = CATALOGO_PRODUTOS.length;
