// Rodadas CONTEXTUAIS do "Compra Multifuncional".
// O paciente lê uma situação e infere os itens adequados — a categoria NÃO é dada.
// Classificação interna (essential/acceptable/inappropriate) nunca aparece na UI.

export type CtxKind = "essential" | "acceptable" | "inappropriate";
export interface CtxItem { id: string; name: string; emoji: string; price: number; kind: CtxKind; }
export interface CtxStory { id: string; text: string; pool: CtxItem[]; }

const E = (id: string, name: string, emoji: string, price: number): CtxItem => ({ id, name, emoji, price, kind: "essential" });
const A = (id: string, name: string, emoji: string, price: number): CtxItem => ({ id, name, emoji, price, kind: "acceptable" });
const X = (id: string, name: string, emoji: string, price: number): CtxItem => ({ id, name, emoji, price, kind: "inappropriate" });

export const CTX_STORIES: CtxStory[] = [
  {
    id: "neve",
    text: "Joana vai viajar para um lugar com neve e temperatura de -15°C. Ela precisa montar uma mala adequada.",
    pool: [
      E("casaco", "Casaco", "🧥", 120), E("bota", "Bota", "🥾", 90), E("luva", "Luva", "🧤", 35),
      E("cachecol", "Cachecol", "🧣", 30), E("gorro", "Gorro", "🧶", 25),
      A("calca", "Calça", "👖", 60), A("meia", "Meia", "🧦", 15), A("mochila", "Mochila", "🎒", 70), A("termica", "Camiseta térmica", "👕", 45),
      X("chinelo", "Chinelo", "🩴", 20), X("biquini", "Biquíni", "👙", 50), X("bermuda", "Bermuda", "🩳", 40),
      X("regata", "Regata", "🎽", 25), X("oculos", "Óculos de sol", "🕶️", 30), X("toalha-praia", "Toalha de praia", "🏖️", 35),
    ],
  },
  {
    id: "praia",
    text: "Carlos vai passar o dia em uma praia muito ensolarada. Ele ficará várias horas ao ar livre.",
    pool: [
      E("protetor", "Protetor solar", "🧴", 40), E("bone", "Boné", "🧢", 25), E("toalha", "Toalha", "🏖️", 35),
      E("chinelo", "Chinelo", "🩴", 20), E("garrafa", "Garrafa de água", "💧", 15), E("oculos", "Óculos de sol", "🕶️", 30),
      A("bermuda", "Bermuda", "🩳", 40), A("regata", "Regata", "🎽", 25),
      X("casaco", "Casaco", "🧥", 120), X("luva", "Luva", "🧤", 35), X("bota", "Bota", "🥾", 90), X("cachecol", "Cachecol", "🧣", 30),
    ],
  },
  {
    id: "escola",
    text: "Ana vai para o primeiro dia de aula e precisa levar materiais para estudar.",
    pool: [
      E("mochila", "Mochila", "🎒", 70), E("caderno", "Caderno", "📓", 18), E("lapis", "Lápis", "✏️", 5),
      E("estojo", "Estojo", "🖍️", 22), E("garrafa", "Garrafa de água", "💧", 15),
      A("regua", "Régua", "📏", 12), A("livro", "Livro", "📚", 35),
      X("panela", "Panela", "🍳", 50), X("sabonete", "Sabonete", "🧼", 6), X("travesseiro", "Travesseiro", "🛏️", 60), X("brinquedo", "Brinquedo", "🧸", 40),
    ],
  },
  {
    id: "cafe",
    text: "Pedro vai receber visitas pela manhã e quer preparar um café da manhã simples.",
    pool: [
      E("pao", "Pão", "🍞", 7), E("leite", "Leite", "🥛", 6), E("cafe", "Café", "☕", 12),
      E("frutas", "Frutas", "🍎", 8), E("manteiga", "Manteiga", "🧈", 10), E("queijo", "Queijo", "🧀", 15),
      A("suco", "Suco", "🧃", 7), A("ovos", "Ovos", "🥚", 13),
      X("sabao", "Sabão", "🧼", 19), X("shampoo", "Shampoo", "🧴", 17), X("detergente", "Detergente", "🧽", 8), X("arroz-cru", "Arroz cru", "🍚", 8),
    ],
  },
  {
    id: "acampamento",
    text: "Marina vai acampar em uma área afastada e precisa se preparar para passar a noite fora.",
    pool: [
      E("barraca", "Barraca", "⛺", 150), E("lanterna", "Lanterna", "🔦", 40), E("agua", "Água", "💧", 15),
      E("repelente", "Repelente", "🧴", 25), E("casaco", "Casaco", "🧥", 120), E("mochila", "Mochila", "🎒", 70),
      A("canivete", "Canivete", "🔪", 30), A("mapa", "Mapa", "🗺️", 15),
      X("salto", "Salto alto", "👠", 90), X("perfume", "Perfume", "🌸", 60), X("videogame", "Videogame", "🎮", 200), X("taca", "Taça", "🍷", 25),
    ],
  },
];

export const KIND_POINTS: Record<CtxKind, number> = { essential: 2, acceptable: 1, inappropriate: -2 };
export function scoreCtx(items: CtxItem[]): number {
  return items.reduce((s, i) => s + KIND_POINTS[i.kind], 0);
}

export interface CtxRound {
  storyId: string;
  text: string;
  items: CtxItem[];          // itens exibidos (embaralhados, SEM a classificação visível)
  budget: number;
  quantity: number;          // quantidade exata
  threshold: number;         // pontuação contextual mínima
  hideTotal: boolean;        // esconde o total durante a seleção (difícil)
  collapseStory: boolean;    // história recolhe após alguns segundos (difícil)
  noInappropriate: boolean;  // difícil: qualquer item inadequado reprova
  timeSecs: number;
}

function take<T>(arr: T[], n: number): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r.slice(0, Math.min(n, r.length));
}
function shuffle<T>(a: T[]): T[] { return take(a, a.length); }
const rint = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

// d: 1-10 (dificuldade do exercício). storyIndex opcional (rotação determinística).
export function buildCtxRound(d: number, storyIndex?: number): CtxRound {
  const story = CTX_STORIES[(storyIndex ?? Math.floor(Math.random() * CTX_STORIES.length)) % CTX_STORIES.length];
  const ess = story.pool.filter((i) => i.kind === "essential");
  const acc = story.pool.filter((i) => i.kind === "acceptable");
  const inap = story.pool.filter((i) => i.kind === "inappropriate");

  let quantity: number, threshold: number, nEss: number, nAcc: number, nInap: number, factor: number, timeSecs: number;
  let hideTotal = false, collapseStory = false, noInappropriate = false;
  if (d <= 3) {            // fácil
    quantity = rint(2, 3); threshold = 4; nEss = 3; nAcc = 2; nInap = 2; factor = 1.6; timeSecs = 60;
  } else if (d <= 6) {     // médio
    quantity = rint(3, 4); threshold = 6; nEss = 4; nAcc = 2; nInap = 3; factor = 1.3; timeSecs = 50;
  } else {                 // difícil
    quantity = rint(4, 5); threshold = 8; nEss = 4; nAcc = 2; nInap = 4; factor = 1.12; timeSecs = 45;
    hideTotal = true; collapseStory = true; noInappropriate = true;
  }

  const shownEss = take(ess, nEss);
  const shownAcc = take(acc, nAcc);
  const shownInap = take(inap, nInap);
  const items = shuffle([...shownEss, ...shownAcc, ...shownInap]);

  // Solução de referência (garante que existe combinação válida dentro do orçamento e do threshold):
  // pega os essenciais mais baratos exibidos e completa com aceitáveis até a quantidade.
  const byPrice = (a: CtxItem, b: CtxItem) => a.price - b.price;
  const refEss = [...shownEss].sort(byPrice).slice(0, quantity);
  const ref = refEss.length >= quantity ? refEss
    : [...refEss, ...[...shownAcc].sort(byPrice).slice(0, quantity - refEss.length)];
  const refCost = ref.reduce((s, i) => s + i.price, 0);
  const budget = Math.round(refCost * factor);

  return { storyId: story.id, text: story.text, items, budget, quantity, threshold, hideTotal, collapseStory, noInappropriate, timeSecs };
}

export interface CtxCheck {
  total: number; count: number; ctxScore: number;
  qtyOk: boolean; budgetOk: boolean; scoreOk: boolean; noInapprOk: boolean; allOk: boolean;
  essCount: number; accCount: number; inapCount: number;
}
export function checkCtx(selected: Set<string>, round: CtxRound): CtxCheck {
  const sel = round.items.filter((i) => selected.has(i.id));
  const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
  const ctxScore = scoreCtx(sel);
  const essCount = sel.filter((i) => i.kind === "essential").length;
  const accCount = sel.filter((i) => i.kind === "acceptable").length;
  const inapCount = sel.filter((i) => i.kind === "inappropriate").length;
  const qtyOk = sel.length === round.quantity;
  const budgetOk = total <= round.budget;
  const scoreOk = ctxScore >= round.threshold;
  const noInapprOk = round.noInappropriate ? inapCount === 0 : true;
  return { total, count: sel.length, ctxScore, qtyOk, budgetOk, scoreOk, noInapprOk, essCount, accCount, inapCount,
    allOk: qtyOk && budgetOk && scoreOk && noInapprOk };
}
