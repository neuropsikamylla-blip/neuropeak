// ─────────────────────────────────────────────────────────────────────────────
// Informação em Foco — motor de questões (unifica "Caça Informação" +
// "Mudança de Regras"). Treino de ATENÇÃO e LEITURA FUNCIONAL: ler a pergunta,
// localizar/comparar informações de produtos e conferir antes de responder.
//
// Módulo PURO e testável. Cada questão é validada: exatamente UMA resposta
// correta, distratores plausíveis, campos coerentes e visíveis. NÃO é instrumento
// de avaliação/diagnóstico — é treino.
// ─────────────────────────────────────────────────────────────────────────────

export type Nivel = 1 | 2 | 3 | 4;
export type Conservacao = "seco" | "refrigerado" | "luz";

export interface Campos {
  preco?: number;        // R$ (2 casas)
  peso?: number;         // g
  volume?: number;       // mL
  unidades?: number;     // quantidade de unidades
  validade?: { mes: number; ano: number };
  acucar?: boolean;      // contém açúcar
  lactose?: boolean;     // contém lactose
  gluten?: boolean;      // contém glúten (sem glúten = false)
  alergenico?: string;   // ex.: "amendoim" (ou undefined = nenhum destacado)
  conservacao?: Conservacao;
  sabor?: string;
}

export type CampoKey = keyof Campos;

export interface Produto {
  nome: string;
  marca?: string;    // marca FICTÍCIA impressa na embalagem (dado do produto, não do nome)
  emoji: string;
  img?: string;      // imagem real com fundo transparente; cai no emoji se ausente
  categoria: string;
  campos: Campos;
}

export interface Questao {
  id: string;
  nivel: Nivel;
  categoria: string;       // ex.: "localizacao-preco", "comparacao-validade", "duas-condicoes"
  habilidade: string;      // habilidade principal treinada
  pergunta: string;
  instrucao?: string;      // apoio curto (níveis 3-4)
  produtos: Produto[];     // 2 a 4 cartões
  correta: number;         // índice da resposta correta
  camposMostrados: CampoKey[]; // quais campos exibir em cada cartão
  campoRelevante: CampoKey[];  // campos a destacar no feedback
  explicacaoAcerto: string;
  pista: string;
  maxTentativas: number;
  precisaCalculo: boolean;
  // feedback contextual quando o paciente erra (olha a escolha)
  explicarErro: (escolha: number) => string;
}

// ── Formatação (pt-BR) ────────────────────────────────────────────────────────
export const fmtPreco = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
export const fmtPeso = (g: number) => (g >= 1000 && g % 1000 === 0 ? `${g / 1000} kg` : `${g} g`);
export const fmtVolume = (ml: number) => (ml >= 1000 && ml % 1000 === 0 ? `${ml / 1000} L` : `${ml} mL`);
export const fmtValidade = (v: { mes: number; ano: number }) => `${String(v.mes).padStart(2, "0")}/${v.ano}`;
export const fmtConservacao = (c: Conservacao) =>
  c === "refrigerado" ? "Manter refrigerado" : c === "luz" ? "Conservar ao abrigo da luz" : "Conservar em local seco";

// Rótulo curto de um campo (usado no cartão e no destaque)
export function labelCampo(k: CampoKey): string {
  switch (k) {
    case "preco": return "Preço";
    case "peso": return "Peso";
    case "volume": return "Conteúdo";
    case "unidades": return "Unidades";
    case "validade": return "Validade";
    case "acucar": return "Açúcar";
    case "lactose": return "Lactose";
    case "gluten": return "Glúten";
    case "alergenico": return "Alérgenos";
    case "conservacao": return "Conservação";
    case "sabor": return "Sabor";
  }
}

// Valor formatado de um campo num produto
export function valorCampo(p: Produto, k: CampoKey): string {
  const c = p.campos;
  switch (k) {
    case "preco": return c.preco != null ? fmtPreco(c.preco) : "—";
    case "peso": return c.peso != null ? fmtPeso(c.peso) : "—";
    case "volume": return c.volume != null ? fmtVolume(c.volume) : "—";
    case "unidades": return c.unidades != null ? `${c.unidades} unidades` : "—";
    case "validade": return c.validade ? fmtValidade(c.validade) : "—";
    case "acucar": return c.acucar ? "Com açúcar" : "Sem açúcar";
    case "lactose": return c.lactose ? "Contém lactose" : "Não contém lactose";
    case "gluten": return c.gluten ? "Contém glúten" : "Sem glúten";
    case "alergenico": return c.alergenico ? `Contém ${c.alergenico}` : "Sem alérgenos";
    case "conservacao": return c.conservacao ? fmtConservacao(c.conservacao) : "—";
    case "sabor": return c.sabor ? `Sabor ${c.sabor}` : "—";
  }
}

// ── Utilitários ───────────────────────────────────────────────────────────────
const ri = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
// preços "redondos" plausíveis (evita diferenças de 1 centavo — não é teste de acuidade)
const precoAleatorio = () => pick([2.90, 3.50, 3.90, 4.50, 4.90, 5.90, 6.50, 6.90, 7.80, 8.90, 9.90, 10.90, 12.90]);
const pesoAleatorio = () => pick([200, 300, 400, 500, 600, 800, 1000]);
const volumeAleatorio = () => pick([200, 300, 500, 750, 1000, 1500, 2000]);
const unidadesAleatorio = () => pick([2, 4, 6, 8, 10, 12]);
const anoBase = 2026;
const validadeAleatoria = () => ({ mes: ri(1, 12), ano: pick([anoBase, anoBase, anoBase + 1]) });
const validadeAntes = (a: { mes: number; ano: number }, b: { mes: number; ano: number }) => a.ano < b.ano || (a.ano === b.ano && a.mes < b.mes);

// ── Modelos de produto (genéricos, sem marcas reais) ─────────────────────────
export type Estado = "liquido" | "solido";
export interface Modelo { nome: string; marca: string; emoji: string; img: string; categoria: string; estado: Estado; lactose?: boolean; sabor?: string; }
export const imgProduto = (n: string) => `/exercises/busca/${n}.png`;
export const imgProd = (slug: string) => `/exercises/informacao-foco-produtos/${slug}.png`;
const MODELOS: Modelo[] = [
  { nome: "Leite integral", marca: "Fazenda Boa", emoji: "📦", img: imgProd("leite-integral"), categoria: "Laticínio", estado: "liquido", lactose: true },
  { nome: "Leite semidesnatado", marca: "Vida Leve", emoji: "📦", img: imgProd("leite-semidesnatado"), categoria: "Laticínio", estado: "liquido", lactose: true },
  { nome: "Leite desnatado", marca: "Serra Clara", emoji: "📦", img: imgProd("leite-desnatado"), categoria: "Laticínio", estado: "liquido", lactose: true },
  { nome: "Leite sem lactose", marca: "LeveMais", emoji: "📦", img: imgProd("leite-sem-lactose"), categoria: "Laticínio", estado: "liquido", lactose: false },
  { nome: "Bebida de aveia", marca: "Aveia Viva", emoji: "📦", img: imgProd("bebida-aveia"), categoria: "Bebida", estado: "liquido", lactose: false },
  { nome: "Bebida de amêndoas", marca: "Amêndoa Pura", emoji: "📦", img: imgProd("bebida-amendoas"), categoria: "Bebida", estado: "liquido", lactose: false },
  { nome: "Iogurte natural", marca: "Campo Vivo", emoji: "📦", img: imgProd("iogurte-natural"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Iogurte sem lactose", marca: "LeveMais", emoji: "📦", img: imgProd("iogurte-sem-lactose"), categoria: "Laticínio", estado: "solido", lactose: false },
  { nome: "Suco de uva", marca: "Vale da Uva", emoji: "📦", img: imgProd("suco-uva"), categoria: "Bebida", estado: "liquido", sabor: "uva" },
  { nome: "Suco de laranja", marca: "Sol da Laranja", emoji: "📦", img: imgProd("suco-laranja"), categoria: "Bebida", estado: "liquido", sabor: "laranja" },
  { nome: "Biscoito Maria", marca: "Casa do Trigo", emoji: "📦", img: imgProd("biscoito-maria"), categoria: "Mercearia", estado: "solido" },
  { nome: "Biscoito integral", marca: "Sabor da Vila", emoji: "📦", img: imgProd("biscoito-integral"), categoria: "Mercearia", estado: "solido" },
  { nome: "Biscoito sem açúcar", marca: "Leve Sabor", emoji: "📦", img: imgProd("biscoito-sem-acucar"), categoria: "Mercearia", estado: "solido" },
  { nome: "Granola", marca: "Terra Viva", emoji: "📦", img: imgProd("granola"), categoria: "Mercearia", estado: "solido" },
  { nome: "Granola sem açúcar", marca: "Colheita Boa", emoji: "📦", img: imgProd("granola-sem-acucar"), categoria: "Mercearia", estado: "solido" },
  { nome: "Aveia em flocos", marca: "Campo Dourado", emoji: "📦", img: imgProd("aveia"), categoria: "Mercearia", estado: "solido" },
  { nome: "Cereal matinal", marca: "Bom Grão", emoji: "📦", img: imgProd("cereal-matinal"), categoria: "Mercearia", estado: "solido" },
  { nome: "Espaguete", marca: "Massa Nobre", emoji: "📦", img: imgProd("espaguete"), categoria: "Mercearia", estado: "solido" },
  { nome: "Arroz tipo 1", marca: "Sítio Dourado", emoji: "📦", img: imgProd("arroz"), categoria: "Mercearia", estado: "solido" },
  { nome: "Feijão carioca", marca: "Feijão da Roça", emoji: "📦", img: imgProd("feijao"), categoria: "Mercearia", estado: "solido" },
  { nome: "Milho em conserva", marca: "Sabor do Campo", emoji: "📦", img: imgProd("milho-conserva"), categoria: "Mercearia", estado: "solido" },
  { nome: "Torrada integral", marca: "Grão Crocante", emoji: "📦", img: imgProd("torrada"), categoria: "Mercearia", estado: "solido" },
  { nome: "Ervilha em conserva", marca: "Verde Vale", emoji: "📦", img: imgProd("ervilha"), categoria: "Mercearia", estado: "solido" },
  { nome: "Molho de tomate", marca: "Casa Toscana", emoji: "📦", img: imgProd("molho-tomate"), categoria: "Mercearia", estado: "solido" },
  { nome: "Atum em lata", marca: "Mar Azul", emoji: "📦", img: imgProd("atum"), categoria: "Mercearia", estado: "solido" },
  { nome: "Sopa de legumes", marca: "Prato Leve", emoji: "📦", img: imgProd("sopa-legumes"), categoria: "Congelado", estado: "solido" },
  { nome: "Lasanha congelada", marca: "Forno da Serra", emoji: "📦", img: imgProd("lasanha"), categoria: "Congelado", estado: "solido" },
  { nome: "Hambúrguer vegetal", marca: "Verde Burger", emoji: "📦", img: imgProd("hamburguer-vegetal"), categoria: "Congelado", estado: "solido" },
  { nome: "Nuggets de frango", marca: "Frango Dourado", emoji: "📦", img: imgProd("nuggets"), categoria: "Congelado", estado: "solido" },
  { nome: "Pão de forma integral", marca: "Pão da Vila", emoji: "📦", img: imgProd("pao-forma"), categoria: "Mercearia", estado: "solido" },
  { nome: "Manteiga com sal", marca: "Vale Dourado", emoji: "📦", img: imgProd("manteiga"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Margarina", marca: "Bela Mesa", emoji: "📦", img: imgProd("margarina"), categoria: "Mercearia", estado: "solido", lactose: false },
  { nome: "Requeijão", marca: "Vellano", emoji: "📦", img: imgProd("requeijao"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Queijo muçarela", marca: "Villaggio", emoji: "📦", img: imgProd("mucarela"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Presunto cozido", marca: "Saboratto", emoji: "📦", img: imgProd("presunto"), categoria: "Frios", estado: "solido" },
  { nome: "Ovos brancos", marca: "Campo Sereno", emoji: "📦", img: imgProd("ovos"), categoria: "Mercearia", estado: "solido" },
  { nome: "Creme de leite", marca: "Vale Sereno", emoji: "📦", img: imgProd("creme-leite"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Leite condensado", marca: "Doçura", emoji: "📦", img: imgProd("leite-condensado"), categoria: "Laticínio", estado: "solido", lactose: true },
  { nome: "Maionese", marca: "Vale Sabor", emoji: "📦", img: imgProd("maionese"), categoria: "Mercearia", estado: "solido" },
  { nome: "Ketchup", marca: "Saborio", emoji: "📦", img: imgProd("ketchup"), categoria: "Mercearia", estado: "solido" },
  { nome: "Açúcar refinado", marca: "Doce Vida", emoji: "📦", img: imgProd("acucar-refinado"), categoria: "Mercearia", estado: "solido" },
  { nome: "Açúcar mascavo", marca: "Terra Boa", emoji: "📦", img: imgProd("acucar-mascavo"), categoria: "Mercearia", estado: "solido" },
  { nome: "Farinha de trigo", marca: "Bom Campo", emoji: "📦", img: imgProd("farinha-trigo"), categoria: "Mercearia", estado: "solido" },
  { nome: "Fubá", marca: "Campo Novo", emoji: "📦", img: imgProd("fuba"), categoria: "Mercearia", estado: "solido" },
  { nome: "Óleo de soja", marca: "VitaNutri", emoji: "📦", img: imgProd("oleo-soja"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Azeite de oliva", marca: "Vale Verde", emoji: "📦", img: imgProd("azeite"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Vinagre de álcool", marca: "Vitáre", emoji: "📦", img: imgProd("vinagre"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Café solúvel", marca: "Bom Dia", emoji: "📦", img: imgProd("cafe"), categoria: "Mercearia", estado: "solido", lactose: false },
  { nome: "Chá de camomila", marca: "Floravita", emoji: "📦", img: imgProd("cha-camomila"), categoria: "Mercearia", estado: "solido" },
  { nome: "Sal refinado", marca: "Costa", emoji: "📦", img: imgProd("sal"), categoria: "Mercearia", estado: "solido" },
  // ── 27 produtos acrescentados em 01/ago/2026 (embalagens reais dela, fundo transparente) ──
  // Produtos do MESMO tipo com marcas diferentes são propositais (comparação por marca);
  // `modelos()` garante que dois cartões de mesmo nome nunca caiam na mesma questão.
  { nome: "Pasta de amendoim", marca: "NutriBem", emoji: "📦", img: imgProd("pasta-amendoim-nutribem"), categoria: "Mercearia", estado: "solido" },
  { nome: "Pasta de amendoim", marca: "NutriVale", emoji: "📦", img: imgProd("pasta-amendoim-nutrivale"), categoria: "Mercearia", estado: "solido" },
  { nome: "Azeite extra virgem", marca: "Oliva & Vida", emoji: "📦", img: imgProd("azeite-extra-virgem"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Mel", marca: "Apiário Flor do Campo", emoji: "📦", img: imgProd("mel-apiario"), categoria: "Mercearia", estado: "solido" },
  { nome: "Mel", marca: "Melora", emoji: "📦", img: imgProd("mel-melora"), categoria: "Mercearia", estado: "solido" },
  { nome: "Geleia de morango", marca: "Sabor da Fazenda", emoji: "📦", img: imgProd("geleia-morango-fazenda"), categoria: "Mercearia", estado: "solido", sabor: "morango" },
  { nome: "Geleia de morango", marca: "Frutallis", emoji: "📦", img: imgProd("geleia-morango-frutallis"), categoria: "Mercearia", estado: "solido", sabor: "morango" },
  { nome: "Farinha de trigo", marca: "Tradição da Casa", emoji: "📦", img: imgProd("farinha-trigo-tradicao"), categoria: "Mercearia", estado: "solido" },
  { nome: "Açúcar refinado", marca: "Doce Dia", emoji: "📦", img: imgProd("acucar-refinado-doce-dia"), categoria: "Mercearia", estado: "solido" },
  { nome: "Adoçante dietético", marca: "Vida Leve", emoji: "📦", img: imgProd("adocante-stevia"), categoria: "Mercearia", estado: "solido" },
  { nome: "Café torrado e moído", marca: "Serra Bonita", emoji: "📦", img: imgProd("cafe-torrado"), categoria: "Mercearia", estado: "solido" },
  { nome: "Achocolatado em pó", marca: "Chocomax", emoji: "📦", img: imgProd("achocolatado"), categoria: "Mercearia", estado: "solido" },
  { nome: "Aveia em flocos finos", marca: "NutriMais", emoji: "📦", img: imgProd("aveia-flocos-finos"), categoria: "Mercearia", estado: "solido" },
  { nome: "Chia em grãos", marca: "Vida Leve", emoji: "📦", img: imgProd("chia"), categoria: "Mercearia", estado: "solido" },
  { nome: "Semente de linhaça", marca: "Natureza Pura", emoji: "📦", img: imgProd("linhaca"), categoria: "Mercearia", estado: "solido" },
  { nome: "Vinagre balsâmico", marca: "Villa Romana", emoji: "📦", img: imgProd("vinagre-balsamico"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Vinagre de maçã", marca: "Sabor & Vida", emoji: "📦", img: imgProd("vinagre-maca"), categoria: "Mercearia", estado: "liquido" },
  { nome: "Sal rosa do Himalaia", marca: "Canto de Minas", emoji: "📦", img: imgProd("sal-rosa"), categoria: "Mercearia", estado: "solido" },
  { nome: "Mix de pimentas", marca: "Chef's Selection", emoji: "📦", img: imgProd("mix-pimentas"), categoria: "Mercearia", estado: "solido" },
  { nome: "Ervas finas", marca: "", emoji: "📦", img: imgProd("ervas-finas"), categoria: "Mercearia", estado: "solido" },
  { nome: "Farinha de mandioca", marca: "Sabor da Terra", emoji: "📦", img: imgProd("farinha-mandioca"), categoria: "Mercearia", estado: "solido" },
  { nome: "Polvilho doce", marca: "SolVale", emoji: "📦", img: imgProd("polvilho-doce"), categoria: "Mercearia", estado: "solido" },
  { nome: "Goma de tapioca", marca: "Tapioka Viva", emoji: "📦", img: imgProd("goma-tapioca"), categoria: "Mercearia", estado: "solido" },
  { nome: "Chocolate 70% cacau", marca: "Cacau Nobre", emoji: "📦", img: imgProd("chocolate-70"), categoria: "Mercearia", estado: "solido" },
  { nome: "Chá verde", marca: "Chá Vital", emoji: "📦", img: imgProd("cha-verde"), categoria: "Mercearia", estado: "solido" },
  { nome: "Molho barbecue", marca: "Churras Sabor", emoji: "📦", img: imgProd("molho-barbecue"), categoria: "Mercearia", estado: "solido" },
  { nome: "Molho shoyu", marca: "Sabor Oriental", emoji: "📦", img: imgProd("shoyu"), categoria: "Mercearia", estado: "liquido" },
];
export const TOTAL_PRODUTOS = MODELOS.length;
// catálogo exposto (leitura) — usado pelos testes de integridade e por futuros painéis
export const CATALOGO: readonly Modelo[] = MODELOS;
const ALERGENICOS = ["amendoim", "castanha", "soja", "ovo"];

// Marcas FICTÍCIAS (sem marcas reais) — derivadas dos próprios modelos e exibidas
// abaixo do nome no cartão. Quando dois produtos têm o mesmo nome, a marca vem do
// produto (`Produto.marca`); `marcaDe` fica só como retaguarda para nomes soltos.
export const MARCAS: Record<string, string> = MODELOS.reduce<Record<string, string>>(
  (acc, m) => { if (!acc[m.nome]) acc[m.nome] = m.marca; return acc; }, {},
);
export const marcaDe = (nome: string) => MARCAS[nome] ?? "";

// Escolhe N modelos distintos. Dois cartões NUNCA repetem o mesmo nome na mesma
// questão (com 77 produtos há pares de marcas do mesmo item) — nomes iguais lado a
// lado deixariam pergunta e feedback ambíguos. `filtro` restringe o sorteio (ex.: só
// líquidos quando a pergunta fala em "Conteúdo").
function modelos(n: number, filtro?: (m: Modelo) => boolean): Modelo[] {
  const fonte = filtro ? MODELOS.filter(filtro) : MODELOS;
  const out: Modelo[] = [];
  const nomes = new Set<string>();
  for (const m of shuffle(fonte)) {
    if (nomes.has(m.nome)) continue;
    nomes.add(m.nome);
    out.push(m);
    if (out.length === n) break;
  }
  return out;
}
const ehLiquido = (m: Modelo) => m.estado === "liquido";
const ehSolido = (m: Modelo) => m.estado === "solido";
// Modelo pelo nome (usado nas cenas fixas do nível 4, para o cartão sair com a marca certa)
function porNome(nome: string): Modelo {
  const m = MODELOS.find((x) => x.nome === nome);
  if (!m) throw new Error(`produto ausente do catálogo: ${nome}`);
  return m;
}
const produtoDe = (m: Modelo, campos: Campos = {}): Produto =>
  ({ nome: m.nome, marca: m.marca, emoji: m.emoji, img: m.img, categoria: m.categoria, campos });

// ── Balanceamento de posição da resposta correta ─────────────────────────────
// Embaralha os produtos e devolve o novo índice do correto, respeitando um
// histórico para não repetir a mesma posição mais de 3× seguidas.
const posHist: number[] = [];
function colocar(produtos: Produto[], corretaIdx: number): { produtos: Produto[]; correta: number } {
  for (let tent = 0; tent < 12; tent++) {
    const ordem = shuffle(produtos.map((_, i) => i));
    const novos = ordem.map((i) => produtos[i]);
    const novaCorreta = ordem.indexOf(corretaIdx);
    const ult = posHist.slice(-3);
    const repetido = ult.length === 3 && ult.every((p) => p === novaCorreta);
    if (!repetido || tent === 11) {
      posHist.push(novaCorreta);
      return { produtos: novos, correta: novaCorreta };
    }
  }
  return { produtos, correta: corretaIdx };
}

let seq = 0;
const uid = () => `q${seq++}`;

// ── NÍVEL 1 — localizar uma informação ───────────────────────────────────────
type Tipo1 = "preco" | "volume" | "peso" | "validade" | "unidades" | "lactose" | "conservacao" | "acucar" | "sabor";
function gerarNivel1(tipo: Tipo1, nProdutos: number): Questao {
  // "Conteúdo" (mL/L) só faz sentido em líquido; "Peso" (g/kg), em sólido.
  const ms = modelos(nProdutos, tipo === "volume" ? ehLiquido : tipo === "peso" ? ehSolido : undefined);
  let base: Produto[] = ms.map((m) => produtoDe(m));
  let campos: CampoKey[] = [];
  let relev: CampoKey[] = [];
  let pergunta = "", pista = "", explicaOk = "";
  const alvo = 0;

  if (tipo === "preco") {
    const precos = shuffle([precoAleatorio(), precoAleatorio() + 1, precoAleatorio() + 2].filter((v, i, a) => a.indexOf(v) === i));
    const alvoPreco = precos[0] ?? 5.90;
    base.forEach((p, i) => { p.campos.preco = i === alvo ? alvoPreco : (precoAleatorio() === alvoPreco ? alvoPreco + 1 : precoAleatorio()); });
    // garante unicidade do preço-alvo
    base.forEach((p, i) => { if (i !== alvo && p.campos.preco === alvoPreco) p.campos.preco = alvoPreco + 1; });
    campos = ["preco"]; relev = ["preco"];
    pergunta = `Qual produto custa ${fmtPreco(alvoPreco)}?`;
    pista = "Compare apenas o campo “Preço” de cada produto.";
    explicaOk = `Correto. O ${base[alvo].nome} custa ${fmtPreco(alvoPreco)}.`;
  } else if (tipo === "volume") {
    const alvoVol = 1000;
    base.forEach((p, i) => { p.campos.volume = i === alvo ? alvoVol : pick([200, 300, 500, 750]); });
    campos = ["volume"]; relev = ["volume"];
    pergunta = `Qual produto contém 1 litro?`;
    pista = "Procure o campo “Conteúdo” em cada produto.";
    explicaOk = `Correto. O campo “Conteúdo” do ${base[alvo].nome} informa 1 litro.`;
  } else if (tipo === "peso") {
    const alvoPeso = pick([300, 500, 800]);
    base.forEach((p, i) => { p.campos.peso = i === alvo ? alvoPeso : pick([200, 400, 600].filter((w) => w !== alvoPeso)); });
    campos = ["peso"]; relev = ["peso"];
    pergunta = `Qual produto pesa ${fmtPeso(alvoPeso)}?`;
    pista = "Procure o campo “Peso” em cada produto.";
    explicaOk = `Correto. O ${base[alvo].nome} pesa ${fmtPeso(alvoPeso)}.`;
  } else if (tipo === "validade") {
    const alvoV = { mes: pick([3, 6, 9, 12]), ano: anoBase };
    base.forEach((p, i) => { p.campos.validade = i === alvo ? alvoV : { mes: pick([1, 2, 4, 5, 7, 8, 10, 11].filter((mm) => mm !== alvoV.mes)), ano: pick([anoBase, anoBase + 1]) }; });
    campos = ["validade"]; relev = ["validade"];
    pergunta = `Qual produto vence em ${fmtValidade(alvoV)}?`;
    pista = "Procure o campo “Validade” em cada produto.";
    explicaOk = `Correto. A validade do ${base[alvo].nome} é ${fmtValidade(alvoV)}.`;
  } else if (tipo === "unidades") {
    const alvoU = pick([6, 8, 12]);
    base.forEach((p, i) => { p.campos.unidades = i === alvo ? alvoU : pick([2, 4, 10].filter((u) => u !== alvoU)); });
    campos = ["unidades"]; relev = ["unidades"];
    pergunta = `Qual produto possui ${alvoU} unidades?`;
    pista = "Procure o campo “Unidades” em cada produto.";
    explicaOk = `Correto. O ${base[alvo].nome} tem ${alvoU} unidades.`;
  } else if (tipo === "lactose") {
    // o alvo NÃO contém lactose; os demais contêm
    base = base.map((p, i) => ({ ...p, campos: { lactose: i !== alvo } }));
    campos = ["lactose"]; relev = ["lactose"];
    pergunta = `Qual produto não contém lactose?`;
    pista = "Procure a informação sobre “Lactose” em cada produto.";
    explicaOk = `Correto. A embalagem do ${base[alvo].nome} informa que não contém lactose.`;
  } else if (tipo === "conservacao") {
    base.forEach((p, i) => { p.campos.conservacao = i === alvo ? "refrigerado" : pick(["seco", "luz"] as Conservacao[]); });
    campos = ["conservacao"]; relev = ["conservacao"];
    pergunta = `Qual produto precisa ser mantido refrigerado?`;
    pista = "Procure o campo “Conservação” em cada produto.";
    explicaOk = `Correto. No ${base[alvo].nome} está escrito “Manter refrigerado”.`;
  } else if (tipo === "acucar") {
    base = base.map((p, i) => ({ ...p, campos: { acucar: i === alvo } }));
    campos = ["acucar"]; relev = ["acucar"];
    pergunta = `Qual produto contém açúcar?`;
    pista = "Procure a informação sobre “Açúcar” em cada produto.";
    explicaOk = `Correto. A embalagem do ${base[alvo].nome} informa que contém açúcar.`;
  } else {
    // sabor
    const sabores = shuffle(["morango", "uva", "laranja", "chocolate"]);
    base.forEach((p, i) => { p.campos.sabor = sabores[i]; });
    const alvoSabor = base[alvo].campos.sabor!;
    campos = ["sabor"]; relev = ["sabor"];
    pergunta = `Qual produto é sabor ${alvoSabor}?`;
    pista = "Procure o campo “Sabor” em cada produto.";
    explicaOk = `Correto. O ${base[alvo].nome} é sabor ${alvoSabor}.`;
  }

  const { produtos, correta } = colocar(base, alvo);
  return {
    id: uid(), nivel: 1, categoria: `localizacao-${tipo}`, habilidade: "busca visual / atenção seletiva",
    pergunta, produtos, correta, camposMostrados: campos, campoRelevante: relev,
    explicacaoAcerto: explicaOk, pista, maxTentativas: 2, precisaCalculo: false,
    explicarErro: (e) => e === correta ? explicaOk
      : `A pergunta pede o campo “${labelCampo(relev[0])}”. Confira esse campo em cada produto: o ${produtos[correta].nome} é a resposta.`,
  };
}

// ── NÍVEL 2 — comparar uma informação ────────────────────────────────────────
type Tipo2 = "menor-preco" | "maior-quantidade" | "vence-primeiro" | "validade-mais-longa" | "mais-unidades" | "maior-volume";
function gerarNivel2(tipo: Tipo2): Questao {
  const base: Produto[] = modelos(3, tipo === "maior-volume" ? ehLiquido : undefined).map((m) => produtoDe(m));
  let campo: CampoKey, relev: CampoKey[], pergunta: string, pista: string, alvo: number, explicaOk: string;

  if (tipo === "menor-preco") {
    const vals = shuffle([3.90, 5.90, 8.90]);
    base.forEach((p, i) => (p.campos.preco = vals[i]));
    campo = "preco"; alvo = vals.indexOf(Math.min(...vals));
    pergunta = "Qual produto tem o menor preço?";
    pista = "Compare apenas os valores do campo “Preço”.";
    explicaOk = `Correto. O ${base[alvo].nome} custa ${fmtPreco(base[alvo].campos.preco!)}, o menor preço entre as opções.`;
  } else if (tipo === "maior-quantidade" || tipo === "mais-unidades") {
    const vals = shuffle([4, 8, 12]);
    base.forEach((p, i) => (p.campos.unidades = vals[i]));
    campo = "unidades"; alvo = vals.indexOf(Math.max(...vals));
    pergunta = "Qual embalagem contém mais unidades?";
    pista = "Compare apenas o campo “Unidades”.";
    explicaOk = `Correto. O ${base[alvo].nome} tem ${base[alvo].campos.unidades} unidades, a maior quantidade.`;
  } else if (tipo === "maior-volume") {
    const vals = shuffle([300, 750, 1500]);
    base.forEach((p, i) => (p.campos.volume = vals[i]));
    campo = "volume"; alvo = vals.indexOf(Math.max(...vals));
    pergunta = "Qual produto apresenta o maior volume?";
    pista = "Compare apenas o campo “Conteúdo”.";
    explicaOk = `Correto. O ${base[alvo].nome} tem ${fmtVolume(base[alvo].campos.volume!)}, o maior volume.`;
  } else {
    // validade: vence-primeiro (mais cedo) ou validade-mais-longa (mais tarde)
    const datas = shuffle([{ mes: 3, ano: anoBase }, { mes: 9, ano: anoBase }, { mes: 2, ano: anoBase + 1 }]);
    base.forEach((p, i) => (p.campos.validade = datas[i]));
    campo = "validade";
    if (tipo === "vence-primeiro") {
      alvo = datas.reduce((best, d, i) => (validadeAntes(d, datas[best]) ? i : best), 0);
      pergunta = "Qual produto vence primeiro?";
      explicaOk = `Correto. O ${base[alvo].nome} vence em ${fmtValidade(base[alvo].campos.validade!)}, antes das outras opções.`;
    } else {
      alvo = datas.reduce((best, d, i) => (validadeAntes(datas[best], d) ? i : best), 0);
      pergunta = "Qual produto tem a validade mais longa?";
      explicaOk = `Correto. O ${base[alvo].nome} vence em ${fmtValidade(base[alvo].campos.validade!)}, a validade mais longa.`;
    }
    pista = "Compare apenas as datas do campo “Validade”.";
  }
  relev = [campo];
  const { produtos, correta } = colocar(base, alvo);
  return {
    id: uid(), nivel: 2, categoria: `comparacao-${campo}`, habilidade: "comparação / atenção sustentada",
    pergunta, produtos, correta, camposMostrados: [campo], campoRelevante: relev,
    explicacaoAcerto: explicaOk, pista, maxTentativas: 2, precisaCalculo: false,
    explicarErro: (e) => e === correta ? explicaOk
      : `Compare de novo o campo “${labelCampo(campo)}”. O ${produtos[correta].nome} (${valorCampo(produtos[correta], campo)}) é a resposta.`,
  };
}

// ── NÍVEL 3 — combinar duas condições ────────────────────────────────────────
// Distratores: um atende só a A, outro só a B, um a nenhuma; só o alvo atende às duas.
function gerarNivel3(): Questao {
  // pergunta pesa em gramas -> só sólidos
  const base: Produto[] = modelos(4, ehSolido).map((m) => produtoDe(m));
  // Condição A: peso >= 500 g. Condição B: preço < R$ 8.
  const pesoBom = () => pick([500, 600, 800]);
  const pesoRuim = () => pick([300, 400]);
  const precoBom = () => pick([5.90, 6.90, 7.80]);
  const precoRuim = () => pick([9.20, 10.90, 12.90]);
  // ordem fixa antes de embaralhar: [ambas(alvo), só A, só B, nenhuma]
  base[0].campos = { peso: pesoBom(), preco: precoBom() };  // atende às duas
  base[1].campos = { peso: pesoBom(), preco: precoRuim() }; // só peso
  base[2].campos = { peso: pesoRuim(), preco: precoBom() }; // só preço
  base[3].campos = { peso: pesoRuim(), preco: precoRuim() };// nenhuma
  const alvo = 0;
  const { produtos, correta } = colocar(base, alvo);
  const atende = (p: Produto) => (p.campos.peso ?? 0) >= 500 && (p.campos.preco ?? 99) < 8;
  return {
    id: uid(), nivel: 3, categoria: "duas-condicoes", habilidade: "atenção seletiva / memória de trabalho",
    pergunta: "Qual produto contém pelo menos 500 g e custa menos de R$ 8,00?",
    instrucao: "Confira as duas condições antes de responder.",
    produtos, correta, camposMostrados: ["peso", "preco"], campoRelevante: ["peso", "preco"],
    explicacaoAcerto: `Correto. O ${produtos[correta].nome} atende às duas condições: ${fmtPeso(produtos[correta].campos.peso!)} e ${fmtPreco(produtos[correta].campos.preco!)}.`,
    pista: "Primeiro encontre os produtos com 500 g ou mais. Depois, entre eles, veja qual custa menos de R$ 8,00.",
    maxTentativas: 2, precisaCalculo: false,
    explicarErro: (e) => {
      if (e === correta) return "";
      const p = produtos[e];
      const okPeso = (p.campos.peso ?? 0) >= 500, okPreco = (p.campos.preco ?? 99) < 8;
      if (okPeso && !okPreco) return `O ${p.nome} tem 500 g ou mais, mas custa ${fmtPreco(p.campos.preco!)} (acima de R$ 8,00). Procure um que atenda às DUAS condições.`;
      if (!okPeso && okPreco) return `O ${p.nome} custa menos de R$ 8,00, mas tem só ${fmtPeso(p.campos.peso!)} (abaixo de 500 g). Confira as duas condições.`;
      void atende;
      return `O ${p.nome} não atende a nenhuma das condições. Procure um com pelo menos 500 g E menos de R$ 8,00.`;
    },
  };
}

// ── NÍVEL 4 — situações funcionais ───────────────────────────────────────────
type Tipo4 = "leite-sem-lactose" | "evitar-alergenico" | "refrigerar" | "vence-proximo";
function gerarNivel4(tipo: Tipo4): Questao {
  let base: Produto[], pergunta: string, instrucao: string, alvo: number, camposM: CampoKey[], relev: CampoKey[], explicaOk: string, pista: string;
  let explicarErro: (e: number) => string;

  if (tipo === "leite-sem-lactose") {
    // Você precisa de 1 L de leite sem lactose.
    base = [
      produtoDe(porNome("Bebida de aveia"), { volume: 1000, lactose: false }), // alvo
      produtoDe(porNome("Leite integral"), { volume: 1000, lactose: true }),
      produtoDe(porNome("Bebida de amêndoas"), { volume: 500, lactose: false }),
    ];
    alvo = 0; camposM = ["volume", "lactose"]; relev = ["volume", "lactose"];
    pergunta = "Você precisa de 1 litro de leite sem lactose. Qual produto atende ao pedido?";
    instrucao = "Confira o conteúdo E a informação sobre lactose.";
    explicaOk = "Correto. Tem 1 litro e não contém lactose.";
    pista = "Primeiro veja quais não têm lactose. Depois confira qual tem 1 litro.";
    explicarErro = (e) => {
      const p = base[e]; const ok1 = p.campos.volume === 1000, ok2 = p.campos.lactose === false;
      if (ok2 && !ok1) return `Esse não tem lactose, mas contém ${fmtVolume(p.campos.volume!)} (você precisa de 1 litro).`;
      if (!ok2 && ok1) return `Esse tem 1 litro, mas contém lactose. Procure um sem lactose.`;
      return "Confira as duas necessidades: 1 litro e sem lactose.";
    };
  } else if (tipo === "evitar-alergenico") {
    const alg = pick(ALERGENICOS);
    const outros = shuffle(ALERGENICOS.filter((a) => a !== alg));
    base = [
      produtoDe(porNome("Cereal matinal"), { alergenico: alg }), // alvo (deve evitar)
      produtoDe(porNome("Biscoito Maria"), { alergenico: outros[0] }),
      produtoDe(porNome("Granola"), { alergenico: outros[1] ?? undefined }),
    ];
    alvo = 0; camposM = ["alergenico"]; relev = ["alergenico"];
    pergunta = `Uma pessoa não pode consumir ${alg}. Qual produto ela deve evitar?`;
    instrucao = "Procure o campo “Alérgenos” em cada produto.";
    explicaOk = `Correto. A embalagem informa que contém ${alg}.`;
    pista = `Procure qual embalagem informa “Contém ${alg}”.`;
    explicarErro = (e) => `Esse produto informa “${valorCampo(base[e], "alergenico")}”. A pessoa precisa evitar ${alg} — procure a embalagem que contém ${alg}.`;
  } else if (tipo === "refrigerar") {
    base = [
      produtoDe(porNome("Iogurte natural"), { conservacao: "refrigerado" }), // alvo
      produtoDe(porNome("Arroz tipo 1"), { conservacao: "seco" }),
      produtoDe(porNome("Café solúvel"), { conservacao: "luz" }),
    ];
    alvo = 0; camposM = ["conservacao"]; relev = ["conservacao"];
    pergunta = "Qual produto precisa ser guardado na geladeira?";
    instrucao = "Procure o campo “Conservação”.";
    explicaOk = "Correto. A embalagem informa “Manter refrigerado”.";
    pista = "Procure qual embalagem diz “Manter refrigerado”.";
    explicarErro = (e) => `Esse produto informa “${valorCampo(base[e], "conservacao")}”. Procure o que diz “Manter refrigerado”.`;
  } else {
    // vence no próximo mês (mais cedo)
    const datas = shuffle([{ mes: 8, ano: anoBase }, { mes: 11, ano: anoBase }, { mes: 2, ano: anoBase + 1 }]);
    base = modelos(3).map((m, i) => produtoDe(m, { validade: datas[i] }));
    alvo = datas.reduce((best, d, i) => (validadeAntes(d, datas[best]) ? i : best), 0);
    camposM = ["validade"]; relev = ["validade"];
    pergunta = "Qual produto deve ser consumido primeiro por causa da validade?";
    instrucao = "Compare as datas de validade.";
    explicaOk = `Correto. Ele vence em ${fmtValidade(datas[alvo])}, antes dos outros.`;
    pista = "Compare as datas: o que vence primeiro deve ser consumido antes.";
    explicarErro = (e) => `Esse vence em ${fmtValidade(base[e].campos.validade!)}. Procure o que vence PRIMEIRO.`;
  }

  const { produtos, correta } = colocar(base, alvo);
  const explicarErroFinal = (e: number) => {
    // remapeia o índice pós-embaralho para a lógica original
    const orig = produtos[e];
    const idxOrig = base.indexOf(orig);
    return e === correta ? explicaOk : explicarErro(idxOrig >= 0 ? idxOrig : e);
  };
  return {
    id: uid(), nivel: 4, categoria: `funcional-${tipo}`, habilidade: "leitura funcional / tomada de decisão",
    pergunta, instrucao, produtos, correta, camposMostrados: camposM, campoRelevante: relev,
    explicacaoAcerto: explicaOk, pista, maxTentativas: 2, precisaCalculo: false, explicarErro: explicarErroFinal,
  };
}

// ── Dispatcher por nível ──────────────────────────────────────────────────────
const TIPOS1: Tipo1[] = ["preco", "volume", "peso", "validade", "unidades", "lactose", "conservacao", "acucar", "sabor"];
const TIPOS2: Tipo2[] = ["menor-preco", "maior-quantidade", "vence-primeiro", "validade-mais-longa", "maior-volume"];
const TIPOS4: Tipo4[] = ["leite-sem-lactose", "evitar-alergenico", "refrigerar", "vence-proximo"];

export function gerarQuestao(nivel: Nivel): Questao {
  if (nivel === 1) return gerarNivel1(pick(TIPOS1), ri(2, 3));
  if (nivel === 2) return gerarNivel2(pick(TIPOS2));
  if (nivel === 3) return gerarNivel3();
  return gerarNivel4(pick(TIPOS4));
}

// Valida a questão: exatamente 1 resposta, correta no intervalo, campos visíveis.
export function validarQuestao(q: Questao): boolean {
  if (q.produtos.length < 2 || q.produtos.length > 4) return false;
  if (q.correta < 0 || q.correta >= q.produtos.length) return false;
  if (q.camposMostrados.length === 0) return false;
  // todo campo relevante deve estar visível
  if (!q.campoRelevante.every((c) => q.camposMostrados.includes(c))) return false;
  return true;
}

export interface SessaoConfig { nQuestoes: number; nivelInicial: Nivel; nivelFixo: boolean; }
export const CONFIG_PADRAO: SessaoConfig = { nQuestoes: 10, nivelInicial: 1, nivelFixo: false };

// Gera uma sessão: sobe de nível a cada ~nQuestoes/4 quando não é fixo.
export function gerarSessao(cfg: SessaoConfig): Questao[] {
  const out: Questao[] = [];
  const passo = Math.max(1, Math.ceil(cfg.nQuestoes / 4));
  for (let i = 0; i < cfg.nQuestoes; i++) {
    const nivel: Nivel = cfg.nivelFixo
      ? cfg.nivelInicial
      : (Math.min(4, cfg.nivelInicial + Math.floor(i / passo)) as Nivel);
    let q = gerarQuestao(nivel), guard = 0;
    while (!validarQuestao(q) && guard++ < 6) q = gerarQuestao(nivel);
    out.push(q);
  }
  return out;
}
