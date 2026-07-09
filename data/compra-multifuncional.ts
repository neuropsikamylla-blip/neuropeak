// ─────────────────────────────────────────────────────────────────────────────
// Compra Multifuncional — motor cognitivo
// Cenários + itens, motor de regras variado, gerador de rodadas SEMPRE solúveis
// (validação por força bruta), textos de instrução e pontuação.
// A dificuldade vem de MAIS regras/itens/restrições combinadas — nunca de texto
// ambíguo, categoria escondida ou rodada impossível.
// ─────────────────────────────────────────────────────────────────────────────

export interface Category { id: string; label: string; emoji: string; }
export interface Item {
  id: string; name: string; emoji: string; price: number;
  cat: string;        // id da categoria
  sub?: string;       // subcategoria (para regra "não repetir subcategoria")
}
export interface Scenario {
  id: string; name: string; emoji: string;
  situations: string[];          // frases de contexto (objetivas)
  categories: Category[];
  items: Item[];
  avoid?: string;                // categoria "anti-fit" preferida para regra de proibição
}

// ── Regras (união discriminada) ───────────────────────────────────────────────
export type Rule =
  | { kind: "count"; n: number }
  | { kind: "budgetMax"; max: number }
  | { kind: "budgetMin"; min: number }
  | { kind: "budgetRange"; min: number; max: number }
  | { kind: "catAtLeast"; cat: string; n: number }
  | { kind: "catAtMost"; cat: string; n: number }
  | { kind: "catExactly"; cat: string; n: number }
  | { kind: "catForbidden"; cat: string }
  | { kind: "cheapAtLeast"; n: number; under: number }
  | { kind: "priceCeil"; max: number }
  | { kind: "noRepeatSub" }
  | { kind: "noRepeatCat" };

export interface Round {
  scenario: Scenario;
  items: Item[];             // itens exibidos (subconjunto do cenário)
  rules: Rule[];             // regra [0] é sempre "count"
  level: number;             // 1..5
  timeSecs: number;
  situation: string;         // frase de contexto escolhida
}

export interface RuleStatus {
  state: "ok" | "pending" | "violated";
  label: string;             // descrição estática, ex "Total no máximo R$ 30,00"
  value: string;             // valor ao vivo, ex "0/2" ou "R$ 24,80" ("" se não houver)
}

// ── Utilidades ────────────────────────────────────────────────────────────────
export function fmt(v: number): string {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}
function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function niceUp(v: number): number { return Math.ceil(v / 5) * 5; }
function niceDown(v: number): number { return Math.floor(v / 5) * 5; }

// Combinações de tamanho k (índices) — pool pequeno (≤12), k ≤6.
function* combinations(n: number, k: number): Generator<number[]> {
  const idx = Array.from({ length: k }, (_, i) => i);
  if (k > n) return;
  while (true) {
    yield idx.slice();
    let i = k - 1;
    while (i >= 0 && idx[i] === i + n - k) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

// ── Motor de regras ──────────────────────────────────────────────────────────
function catLabel(cats: Category[], id: string): Category {
  return cats.find(c => c.id === id) ?? { id, label: id, emoji: "•" };
}

/** Uma regra é satisfeita pela seleção? */
export function ruleSatisfied(rule: Rule, sel: Item[]): boolean {
  const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
  const catN = (c: string) => sel.filter(i => i.cat === c).length;
  switch (rule.kind) {
    case "count": return sel.length === rule.n;
    case "budgetMax": return sel.length > 0 && total <= rule.max;
    case "budgetMin": return total >= rule.min;
    case "budgetRange": return total >= rule.min && total <= rule.max;
    case "catAtLeast": return catN(rule.cat) >= rule.n;
    case "catAtMost": return catN(rule.cat) <= rule.n;
    case "catExactly": return catN(rule.cat) === rule.n;
    case "catForbidden": return catN(rule.cat) === 0;
    case "cheapAtLeast": return sel.filter(i => i.price < rule.under).length >= rule.n;
    case "priceCeil": return sel.every(i => i.price <= rule.max);
    case "noRepeatSub": { const s = sel.map(i => i.sub ?? i.id); return new Set(s).size === s.length; }
    case "noRepeatCat": { const s = sel.map(i => i.cat); return new Set(s).size === s.length; }
  }
}

/** Status ao vivo (para o painel). */
export function ruleStatus(rule: Rule, sel: Item[], cats: Category[]): RuleStatus {
  const total = Math.round(sel.reduce((s, i) => s + i.price, 0) * 100) / 100;
  const catN = (c: string) => sel.filter(i => i.cat === c).length;
  const ok = ruleSatisfied(rule, sel);
  const mk = (state: RuleStatus["state"], label: string, value: string): RuleStatus => ({ state, label, value });
  switch (rule.kind) {
    case "count":
      return mk(ok ? "ok" : sel.length > rule.n ? "violated" : "pending",
        `Escolha exatamente ${rule.n} ${rule.n === 1 ? "item" : "itens"}`, `${sel.length}/${rule.n}`);
    case "budgetMax":
      return mk(total > rule.max ? "violated" : ok ? "ok" : "pending",
        `Total no máximo ${fmt(rule.max)}`, fmt(total));
    case "budgetMin":
      return mk(ok ? "ok" : "pending", `Total no mínimo ${fmt(rule.min)}`, fmt(total));
    case "budgetRange":
      return mk(total > rule.max ? "violated" : ok ? "ok" : "pending",
        `Total entre ${fmt(rule.min)} e ${fmt(rule.max)}`, fmt(total));
    case "catAtLeast": {
      const c = catLabel(cats, rule.cat);
      return mk(ok ? "ok" : "pending", `Inclua pelo menos ${rule.n} ${c.emoji} ${c.label}`, `${catN(rule.cat)}/${rule.n}`);
    }
    case "catAtMost": {
      const c = catLabel(cats, rule.cat);
      return mk(ok ? "ok" : "violated", `No máximo ${rule.n} ${c.emoji} ${c.label}`, `${catN(rule.cat)}/${rule.n}`);
    }
    case "catExactly": {
      const c = catLabel(cats, rule.cat);
      return mk(catN(rule.cat) > rule.n ? "violated" : ok ? "ok" : "pending",
        `Inclua exatamente ${rule.n} ${c.emoji} ${c.label}`, `${catN(rule.cat)}/${rule.n}`);
    }
    case "catForbidden": {
      const c = catLabel(cats, rule.cat);
      const n = catN(rule.cat);
      return mk(ok ? "ok" : "violated", `Não inclua ${c.emoji} ${c.label}`, n === 0 ? "0" : `${n} selecionado${n !== 1 ? "s" : ""}`);
    }
    case "cheapAtLeast": {
      const have = sel.filter(i => i.price < rule.under).length;
      return mk(ok ? "ok" : "pending", `Pelo menos ${rule.n} ${rule.n === 1 ? "item" : "itens"} abaixo de ${fmt(rule.under)}`, `${have}/${rule.n}`);
    }
    case "priceCeil": {
      const over = sel.filter(i => i.price > rule.max).length;
      return mk(ok ? "ok" : "violated", `Nenhum item acima de ${fmt(rule.max)}`, over > 0 ? `${over} acima` : "");
    }
    case "noRepeatSub":
      return mk(ok ? "ok" : "violated", `Não repita a mesma subcategoria`, "");
    case "noRepeatCat":
      return mk(ok ? "ok" : "violated", `Não repita a mesma categoria`, "");
  }
}

/** Texto objetivo da regra (para a lista de instruções). */
export function ruleText(rule: Rule, cats: Category[]): string {
  const c = (id: string) => { const x = catLabel(cats, id); return `${x.emoji} ${x.label}`; };
  switch (rule.kind) {
    case "count": return `Escolha exatamente ${rule.n} ${rule.n === 1 ? "item" : "itens"}.`;
    case "budgetMax": return `O total deve ser no máximo ${fmt(rule.max)}.`;
    case "budgetMin": return `O total deve ser no mínimo ${fmt(rule.min)}.`;
    case "budgetRange": return `O total deve ficar entre ${fmt(rule.min)} e ${fmt(rule.max)}.`;
    case "catAtLeast": return `Inclua pelo menos ${rule.n} ${rule.n === 1 ? "item" : "itens"} de ${c(rule.cat)}.`;
    case "catAtMost": return `Inclua no máximo ${rule.n} ${rule.n === 1 ? "item" : "itens"} de ${c(rule.cat)}.`;
    case "catExactly": return `Inclua exatamente ${rule.n} ${rule.n === 1 ? "item" : "itens"} de ${c(rule.cat)}.`;
    case "catForbidden": return `Não inclua itens de ${c(rule.cat)}.`;
    case "cheapAtLeast": return rule.n === 1 ? `Pelo menos 1 item deve custar menos de ${fmt(rule.under)}.` : `Pelo menos ${rule.n} itens devem custar menos de ${fmt(rule.under)}.`;
    case "priceCeil": return `Nenhum item pode custar mais de ${fmt(rule.max)}.`;
    case "noRepeatSub": return `Não escolha dois itens da mesma subcategoria.`;
    case "noRepeatCat": return `Não escolha dois itens da mesma categoria.`;
  }
}

export function checkRound(sel: Item[], round: Round): { perRule: boolean[]; allOk: boolean } {
  const perRule = round.rules.map(r => ruleSatisfied(r, sel));
  return { perRule, allOk: perRule.every(Boolean) };
}

/** Conta soluções válidas (força bruta) — usado para garantir rodada solúvel. */
function countSolutions(items: Item[], n: number, rules: Rule[], stopAt = 9999): number {
  let count = 0;
  for (const combo of combinations(items.length, n)) {
    const sel = combo.map(i => items[i]);
    if (rules.every(r => ruleSatisfied(r, sel))) { count++; if (count >= stopAt) break; }
  }
  return count;
}

// ── Níveis ────────────────────────────────────────────────────────────────────
export interface LevelMeta { level: number; name: string; basePoints: number; timeSecs: number; }
export const LEVELS: LevelMeta[] = [
  { level: 1, name: "Fácil",        basePoints: 100, timeSecs: 60 },
  { level: 2, name: "Médio",        basePoints: 200, timeSecs: 55 },
  { level: 3, name: "Difícil",      basePoints: 350, timeSecs: 50 },
  { level: 4, name: "Avançado",     basePoints: 500, timeSecs: 45 },
  { level: 5, name: "Especialista", basePoints: 700, timeSecs: 40 },
];
export const MAX_LEVEL = 5;
export function levelMeta(level: number): LevelMeta { return LEVELS[Math.max(0, Math.min(4, level - 1))]; }

interface LevelSpec { itemsMin: number; itemsMax: number; count: [number, number]; extraRules: number; }
const LEVEL_SPEC: Record<number, LevelSpec> = {
  1: { itemsMin: 6,  itemsMax: 6,  count: [2, 2], extraRules: 1 },
  2: { itemsMin: 8,  itemsMax: 8,  count: [3, 3], extraRules: 2 },
  3: { itemsMin: 9,  itemsMax: 10, count: [4, 4], extraRules: 3 },
  4: { itemsMin: 10, itemsMax: 12, count: [4, 4], extraRules: 4 },
  5: { itemsMin: 12, itemsMax: 12, count: [5, 5], extraRules: 5 },
};

const STRATEGY: Record<number, string> = {
  1: "Comece pela categoria obrigatória e complete sem passar do orçamento.",
  2: "Garanta primeiro as categorias exigidas; depois veja se ainda cabe no orçamento.",
  3: "Resolva as regras mais difíceis primeiro: categorias, item barato e categoria proibida.",
  4: "Cuidado com as regras de \"exatamente\": um item a mais já invalida a resposta.",
  5: "Resolva por etapas — elimine os proibidos, garanta as categorias e ajuste o total no fim.",
};

// ── Geração de rodada (sempre solúvel por construção + verificação) ─────────────
function chooseSeed(pool: Item[], n: number, wantPair: boolean): Item[] | null {
  // wantPair: tenta incluir 2 itens de uma mesma categoria (habilita regras "2 de X").
  for (let attempt = 0; attempt < 40; attempt++) {
    let seed: Item[] = [];
    if (wantPair) {
      const byCat: Record<string, Item[]> = {};
      for (const it of pool) (byCat[it.cat] ??= []).push(it);
      const pairCats = Object.values(byCat).filter(g => g.length >= 2);
      if (pairCats.length) {
        const g = shuffle(pick(pairCats));
        seed = g.slice(0, 2);
      }
    }
    const rest = shuffle(pool.filter(i => !seed.includes(i)));
    seed = [...seed, ...rest].slice(0, n);
    if (seed.length === n) {
      // evita total degenerado (muito baixo)
      return seed;
    }
  }
  return null;
}

function buildRules(level: number, pool: Item[], seed: Item[], avoid?: string): Rule[] {
  const spec = LEVEL_SPEC[level];
  const n = seed.length;
  const rules: Rule[] = [{ kind: "count", n }];
  const sumSeed = seed.reduce((s, i) => s + i.price, 0);
  const seedCats = seed.map(i => i.cat);
  const catCount = (c: string, arr: Item[]) => arr.filter(i => i.cat === c).length;
  const usedCats = new Set<string>();
  const usedKinds = new Set<string>();
  const poolCats = Array.from(new Set(pool.map(i => i.cat)));
  const seedCatSet = Array.from(new Set(seedCats));

  // Gera candidatos de regra, cada um satisfeito pelo seed:
  const candidates: (() => Rule | null)[] = [];

  // Orçamento (sempre disponível) — varia o tipo por nível.
  candidates.push(() => {
    if (usedKinds.has("budget")) return null;
    usedKinds.add("budget");
    if (level >= 3 && Math.random() < 0.55) {
      const min = Math.max(0, niceDown(sumSeed - 8));
      const max = niceUp(sumSeed + 6);
      if (max - min >= 10) return { kind: "budgetRange", min, max };
    }
    return { kind: "budgetMax", max: niceUp(sumSeed + (level <= 2 ? 4 : 6)) };
  });

  // Categoria obrigatória (pelo menos 1) — categoria presente no seed.
  candidates.push(() => {
    const opts = seedCatSet.filter(c => !usedCats.has(c));
    if (!opts.length) return null;
    const c = pick(opts); usedCats.add(c);
    return { kind: "catAtLeast", cat: c, n: 1 };
  });
  // Segunda categoria obrigatória diferente.
  candidates.push(() => {
    const opts = seedCatSet.filter(c => !usedCats.has(c));
    if (!opts.length) return null;
    const c = pick(opts); usedCats.add(c);
    return { kind: "catAtLeast", cat: c, n: 1 };
  });

  // Pelo menos 2 de uma categoria (se o seed tiver).
  candidates.push(() => {
    const opts = seedCatSet.filter(c => catCount(c, seed) >= 2 && !usedCats.has(c));
    if (!opts.length) return null;
    const c = pick(opts); usedCats.add(c);
    return { kind: "catAtLeast", cat: c, n: 2 };
  });

  // Categoria proibida (presente no pool, ausente no seed).
  // Se o cenário define uma anti-fit (avoid), SÓ proíbe essa categoria — evita
  // proibir categorias essenciais ao tema (ex.: "não inclua Mãos" numa mala de neve).
  candidates.push(() => {
    let opts = poolCats.filter(c => catCount(c, seed) === 0 && pool.some(i => i.cat === c) && !usedCats.has(c));
    if (avoid !== undefined) opts = opts.filter(c => c === avoid);
    if (!opts.length) return null;
    const c = pick(opts); usedCats.add(c);
    return { kind: "catForbidden", cat: c };
  });

  // Exatamente X de uma categoria (nível 4+).
  candidates.push(() => {
    if (level < 4) return null;
    const opts = seedCatSet.filter(c => !usedCats.has(c) && catCount(c, seed) >= 1);
    if (!opts.length) return null;
    const c = pick(opts); usedCats.add(c);
    return { kind: "catExactly", cat: c, n: catCount(c, seed) };
  });

  // Pelo menos 1-2 itens baratos.
  candidates.push(() => {
    if (usedKinds.has("cheap")) return null;
    const need = level >= 5 ? 2 : 1;
    const prices = seed.map(i => i.price).sort((a, b) => a - b);
    if (prices.length < need) return null;
    const under = niceUp(prices[need - 1] + 0.5);
    // só vale se houver distratores acima do limite
    if (!pool.some(i => i.price >= under)) return null;
    usedKinds.add("cheap");
    return { kind: "cheapAtLeast", n: need, under };
  });

  // Teto de preço individual (nível 4+).
  candidates.push(() => {
    if (level < 4 || usedKinds.has("ceil")) return null;
    const maxSeed = Math.max(...seed.map(i => i.price));
    const ceil = niceUp(maxSeed + 1);
    if (!pool.some(i => i.price > ceil)) return null;   // precisa haver distrator acima
    usedKinds.add("ceil");
    return { kind: "priceCeil", max: ceil };
  });

  // Não repetir subcategoria (nível 5, se o seed não repetir).
  candidates.push(() => {
    if (level < 5) return null;
    const subs = seed.map(i => i.sub ?? i.id);
    if (new Set(subs).size !== subs.length) return null;
    if (!pool.every(i => i.sub)) return null;
    return { kind: "noRepeatSub" };
  });

  // Ordem de preferência por nível (mistura para variar), sempre com orçamento cedo.
  const order = shuffle(candidates.slice(1));
  const gens = [candidates[0], ...order];
  for (const g of gens) {
    if (rules.length - 1 >= spec.extraRules) break;
    const r = g();
    if (r) rules.push(r);
  }
  // Completa com orçamento/categoria caso falte (raro).
  while (rules.length - 1 < spec.extraRules) {
    const opts = seedCatSet.filter(c => !usedCats.has(c));
    if (opts.length) { const c = pick(opts); usedCats.add(c); rules.push({ kind: "catAtLeast", cat: c, n: 1 }); }
    else break;
  }
  return rules;
}

export function buildRound(level: number, scenarioForce?: string): Round {
  const spec = LEVEL_SPEC[level] ?? LEVEL_SPEC[1];
  for (let attempt = 0; attempt < 120; attempt++) {
    const scenario = scenarioForce
      ? SCENARIOS.find(s => s.id === scenarioForce) ?? pick(SCENARIOS)
      : pick(SCENARIOS);
    const nItems = spec.itemsMin + Math.floor(Math.random() * (spec.itemsMax - spec.itemsMin + 1));
    if (scenario.items.length < nItems) continue;
    const pool = shuffle(scenario.items).slice(0, nItems);
    const n = spec.count[0] + Math.floor(Math.random() * (spec.count[1] - spec.count[0] + 1));
    if (pool.length < n + 1) continue;
    const seed = chooseSeed(pool, n, level >= 3);
    if (!seed) continue;
    const rules = buildRules(level, pool, seed, scenario.avoid);
    if (rules.length - 1 < Math.min(spec.extraRules, 1)) continue;
    // segurança: precisa haver ≥1 solução (o seed já é uma), e não pode ser trivial demais
    const sols = countSolutions(pool, n, rules, 60);
    const totalCombos = (() => { let c = 1, k = n, m = pool.length; for (let i = 0; i < k; i++) c = c * (m - i) / (i + 1); return Math.round(c); })();
    if (sols < 1) continue;
    if (sols === totalCombos) continue;           // toda combinação vale → fácil demais
    const situation = pick(scenario.situations);
    return { scenario, items: pool, rules, level, timeSecs: levelMeta(level).timeSecs, situation };
  }
  // fallback ultra-seguro
  const scenario = pick(SCENARIOS);
  const pool = shuffle(scenario.items).slice(0, spec.itemsMin);
  const n = spec.count[0];
  const seed = pool.slice(0, n);
  const rules: Rule[] = [{ kind: "count", n }, { kind: "budgetMax", max: niceUp(seed.reduce((s, i) => s + i.price, 0) + 6) }];
  return { scenario, items: pool, rules, level, timeSecs: levelMeta(level).timeSecs, situation: pick(scenario.situations) };
}

// ── Instrução estruturada ──────────────────────────────────────────────────────
export function buildInstruction(round: Round): { situation: string; objective: string; rules: string[]; strategy: string } {
  const n = (round.rules[0] as { kind: "count"; n: number }).n;
  return {
    situation: round.situation,
    objective: `Selecione exatamente ${n} ${n === 1 ? "item" : "itens"} respeitando todas as regras ao mesmo tempo.`,
    rules: round.rules.map(r => ruleText(r, round.scenario.categories)),
    strategy: STRATEGY[round.level] ?? STRATEGY[1],
  };
}

// ── Dica (não entrega a resposta) ──────────────────────────────────────────────
export function buildHint(round: Round, sel: Item[]): string {
  const cats = round.scenario.categories;
  // 1º: alguma regra VIOLADA (mais urgente)
  for (const r of round.rules) {
    const st = ruleStatus(r, sel, cats);
    if (st.state === "violated") {
      if (r.kind === "catForbidden") return "Existe um item selecionado de uma categoria proibida.";
      if (r.kind === "count") return "Você selecionou itens demais — reveja a quantidade.";
      if (r.kind === "budgetMax" || r.kind === "budgetRange") return "O total está fora do intervalo permitido.";
      if (r.kind === "priceCeil") return "Um dos itens ultrapassa o preço máximo permitido por item.";
      if (r.kind === "catExactly" || r.kind === "catAtMost") return "Você excedeu a quantidade permitida de uma categoria.";
      if (r.kind === "noRepeatSub") return "Há dois itens da mesma subcategoria.";
      if (r.kind === "noRepeatCat") return "Há dois itens da mesma categoria.";
    }
  }
  // 2º: alguma regra PENDENTE
  for (const r of round.rules) {
    const st = ruleStatus(r, sel, cats);
    if (st.state === "pending") {
      if (r.kind === "count") return "Verifique primeiro a quantidade de itens.";
      if (r.kind === "catAtLeast" || r.kind === "catExactly") { const c = cats.find(x => x.id === (r as { cat: string }).cat); return `Você ainda precisa incluir uma categoria obrigatória (${c?.label ?? ""}).`; }
      if (r.kind === "cheapAtLeast") return "Falta incluir um item mais barato.";
      if (r.kind === "budgetMin" || r.kind === "budgetRange") return "O total ainda está abaixo do mínimo exigido.";
    }
  }
  return "Confira o painel: leia uma regra por vez e ajuste sua seleção.";
}

// ── Pontuação (display gamificado) ─────────────────────────────────────────────
export interface RoundScore { points: number; base: number; bonuses: string[]; penalties: string[]; }
export function roundScore(opts: {
  level: number; correct: boolean; swaps: number; hintUsed: boolean; seconds: number; reachedStreak3: boolean;
}): RoundScore {
  const base = levelMeta(opts.level).basePoints;
  const bonuses: string[] = []; const penalties: string[] = [];
  if (!opts.correct) {
    penalties.push("Erro: −25");
    return { points: -25, base, bonuses, penalties };
  }
  let pts = base;
  if (opts.swaps > 0) { pts -= 10 * opts.swaps; penalties.push(`${opts.swaps} troca${opts.swaps !== 1 ? "s" : ""}: −${10 * opts.swaps}`); }
  if (opts.hintUsed) { pts -= 30; penalties.push("Dica: −30"); }
  if (opts.swaps === 0) { pts += 50; bonuses.push("Sem trocas: +50"); }
  if (opts.seconds < 20) { pts += 30; bonuses.push("Rápido (<20s): +30"); }
  if (opts.reachedStreak3) { pts += 100; bonuses.push("3 seguidos: +100"); }
  return { points: Math.max(0, pts), base, bonuses, penalties };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cenários (itens coerentes; preços realistas; subcategorias para nível 5)
// ─────────────────────────────────────────────────────────────────────────────
const C = (id: string, label: string, emoji: string): Category => ({ id, label, emoji });

export const SCENARIOS: Scenario[] = [
  {
    id: "supermercado", name: "Supermercado", emoji: "🛒", avoid: "limpeza",
    situations: [
      "Você foi ao mercado comprar poucos itens para casa.",
      "Você está no supermercado e precisa montar uma compra pequena sem estourar o orçamento.",
      "Você precisa repor alguns itens básicos equilibrando alimentação e higiene.",
    ],
    categories: [C("hortifruti","Hortifruti","🥦"),C("alimento","Alimento","🍚"),C("higiene","Higiene","🧼"),C("limpeza","Limpeza","🧽"),C("bebida","Bebida","🥤")],
    items: [
      { id:"banana",name:"Banana",emoji:"🍌",price:3.90,cat:"hortifruti",sub:"fruta" },
      { id:"maca",name:"Maçã",emoji:"🍎",price:6.90,cat:"hortifruti",sub:"fruta" },
      { id:"cenoura",name:"Cenoura",emoji:"🥕",price:4.90,cat:"hortifruti",sub:"legume" },
      { id:"batata",name:"Batata",emoji:"🥔",price:5.90,cat:"hortifruti",sub:"legume" },
      { id:"alface",name:"Alface",emoji:"🥬",price:3.50,cat:"hortifruti",sub:"verdura" },
      { id:"feijao",name:"Feijão",emoji:"🫘",price:8.90,cat:"alimento",sub:"grao" },
      { id:"arroz",name:"Arroz",emoji:"🍚",price:7.90,cat:"alimento",sub:"grao" },
      { id:"oleo",name:"Óleo",emoji:"🛢️",price:13.90,cat:"alimento",sub:"oleo" },
      { id:"macarrao",name:"Macarrão",emoji:"🍝",price:4.90,cat:"alimento",sub:"massa" },
      { id:"pasta-dente",name:"Pasta de dente",emoji:"🪥",price:6.90,cat:"higiene",sub:"bucal" },
      { id:"sabonete",name:"Sabonete",emoji:"🧼",price:3.90,cat:"higiene",sub:"banho" },
      { id:"papel-hig",name:"Papel higiênico",emoji:"🧻",price:14.90,cat:"higiene",sub:"papel" },
      { id:"shampoo",name:"Shampoo",emoji:"🧴",price:12.90,cat:"higiene",sub:"cabelo" },
      { id:"sabao-po",name:"Sabão em pó",emoji:"🧺",price:18.90,cat:"limpeza",sub:"roupa" },
      { id:"detergente",name:"Detergente",emoji:"🧴",price:3.50,cat:"limpeza",sub:"louca" },
      { id:"refrigerante",name:"Refrigerante",emoji:"🥤",price:7.90,cat:"bebida",sub:"gaseificada" },
      { id:"suco",name:"Suco",emoji:"🧃",price:6.90,cat:"bebida",sub:"suco" },
      { id:"agua",name:"Água",emoji:"💧",price:2.90,cat:"bebida",sub:"agua" },
    ],
  },
  {
    id: "farmacia", name: "Farmácia", emoji: "💊", avoid: "cosmetico",
    situations: [
      "Você precisa comprar itens de farmácia para cuidar de sintomas leves e da higiene.",
      "Você vai à farmácia repor alguns itens de saúde e higiene pessoal.",
    ],
    categories: [C("medicamento","Medicamento","💊"),C("higiene","Higiene","🧼"),C("cosmetico","Cosmético","💄"),C("bebida","Bebida","🥤")],
    items: [
      { id:"analgesico",name:"Analgésico",emoji:"💊",price:8.90,cat:"medicamento",sub:"comprimido" },
      { id:"antitermico",name:"Antitérmico",emoji:"🌡️",price:12.90,cat:"medicamento",sub:"comprimido" },
      { id:"xarope",name:"Xarope",emoji:"🧪",price:15.90,cat:"medicamento",sub:"liquido" },
      { id:"pomada",name:"Pomada",emoji:"🧴",price:11.90,cat:"medicamento",sub:"topico" },
      { id:"vitamina-c",name:"Vitamina C",emoji:"🍊",price:9.90,cat:"medicamento",sub:"suplemento" },
      { id:"curativo",name:"Curativo",emoji:"🩹",price:5.90,cat:"medicamento",sub:"curativo" },
      { id:"sabonete",name:"Sabonete",emoji:"🧼",price:4.90,cat:"higiene",sub:"banho" },
      { id:"pasta-dente",name:"Pasta de dente",emoji:"🪥",price:6.90,cat:"higiene",sub:"bucal" },
      { id:"fio-dental",name:"Fio dental",emoji:"🧵",price:5.90,cat:"higiene",sub:"bucal" },
      { id:"desodorante",name:"Desodorante",emoji:"🧴",price:13.90,cat:"higiene",sub:"corpo" },
      { id:"hidratante",name:"Hidratante",emoji:"🧴",price:19.90,cat:"cosmetico",sub:"pele" },
      { id:"batom",name:"Batom",emoji:"💄",price:14.90,cat:"cosmetico",sub:"maquiagem" },
      { id:"perfume",name:"Perfume",emoji:"🌸",price:49.90,cat:"cosmetico",sub:"perfume" },
      { id:"agua",name:"Água",emoji:"💧",price:2.90,cat:"bebida",sub:"agua" },
    ],
  },
  {
    id: "brinquedos", name: "Brinquedos", emoji: "🧸", avoid: "eletronico",
    situations: [
      "Você vai comprar presentes para uma criança respeitando um orçamento.",
      "Você está na loja de brinquedos escolhendo um presente.",
    ],
    categories: [C("veiculo","Veículo","🚗"),C("pelucia","Pelúcia","🧸"),C("jogo","Jogo","🎲"),C("educativo","Educativo","🧩"),C("eletronico","Eletrônico","🎮")],
    items: [
      { id:"carrinho",name:"Carrinho",emoji:"🚗",price:29.90,cat:"veiculo",sub:"carro" },
      { id:"aviao",name:"Aviãozinho",emoji:"✈️",price:34.90,cat:"veiculo",sub:"aviao" },
      { id:"caminhao",name:"Caminhão",emoji:"🚚",price:39.90,cat:"veiculo",sub:"caminhao" },
      { id:"helicoptero",name:"Helicóptero",emoji:"🚁",price:44.90,cat:"veiculo",sub:"helicoptero" },
      { id:"ursinho",name:"Ursinho",emoji:"🧸",price:49.90,cat:"pelucia",sub:"urso" },
      { id:"boneca",name:"Boneca",emoji:"🪆",price:39.90,cat:"pelucia",sub:"boneca" },
      { id:"quebra-cabeca",name:"Quebra-cabeça",emoji:"🧩",price:24.90,cat:"jogo",sub:"puzzle" },
      { id:"boliche",name:"Boliche",emoji:"🎳",price:35.90,cat:"jogo",sub:"boliche" },
      { id:"dardos",name:"Jogo de dardos",emoji:"🎯",price:29.90,cat:"jogo",sub:"dardos" },
      { id:"blocos",name:"Blocos de montar",emoji:"🧱",price:45.90,cat:"educativo",sub:"blocos" },
      { id:"xilofone",name:"Xilofone",emoji:"🎼",price:32.90,cat:"educativo",sub:"musical" },
      { id:"videogame",name:"Videogame",emoji:"🎮",price:199.90,cat:"eletronico",sub:"console" },
      { id:"tablet",name:"Tablet infantil",emoji:"📱",price:299.90,cat:"eletronico",sub:"tablet" },
    ],
  },
  {
    id: "neve", name: "Mala para neve", emoji: "❄️", avoid: "praia",
    situations: [
      "Joana vai viajar para um lugar com neve e -15°C. Ela precisa montar uma mala para o frio intenso.",
      "Você vai para um destino com muito frio e precisa se proteger do frio.",
    ],
    categories: [C("cabeca","Cabeça","🧢"),C("maos","Mãos","🧤"),C("pes","Pés","🥾"),C("corpo","Corpo","🧥"),C("praia","Praia","🏖️")],
    items: [
      { id:"gorro",name:"Gorro",emoji:"🧢",price:25.00,cat:"cabeca",sub:"gorro" },
      { id:"touca",name:"Touca de lã",emoji:"🧶",price:20.00,cat:"cabeca",sub:"touca" },
      { id:"luva",name:"Luva",emoji:"🧤",price:35.00,cat:"maos",sub:"luva" },
      { id:"luva-termica",name:"Luva térmica",emoji:"🧤",price:45.00,cat:"maos",sub:"luva-termica" },
      { id:"meia-termica",name:"Meia térmica",emoji:"🧦",price:20.00,cat:"pes",sub:"meia" },
      { id:"bota",name:"Bota",emoji:"🥾",price:90.00,cat:"pes",sub:"bota" },
      { id:"calca-termica",name:"Calça térmica",emoji:"👖",price:70.00,cat:"corpo",sub:"calca" },
      { id:"casaco",name:"Casaco",emoji:"🧥",price:130.00,cat:"corpo",sub:"casaco" },
      { id:"cachecol",name:"Cachecol",emoji:"🧣",price:30.00,cat:"corpo",sub:"cachecol" },
      { id:"biquini",name:"Biquíni",emoji:"👙",price:50.00,cat:"praia",sub:"biquini" },
      { id:"bermuda",name:"Bermuda",emoji:"🩳",price:40.00,cat:"praia",sub:"bermuda" },
      { id:"chinelo",name:"Chinelo",emoji:"🩴",price:25.00,cat:"praia",sub:"chinelo" },
    ],
  },
  {
    id: "escolar", name: "Material escolar", emoji: "🎒",
    situations: [
      "Você está montando um kit escolar básico para um aluno.",
      "Você precisa comprar materiais para começar as aulas.",
    ],
    categories: [C("escrita","Escrita","✏️"),C("organizacao","Organização","📐"),C("papel","Papel","📓"),C("arte","Arte","🎨")],
    items: [
      { id:"lapis",name:"Lápis",emoji:"✏️",price:3.90,cat:"escrita",sub:"lapis" },
      { id:"caneta",name:"Caneta",emoji:"🖊️",price:4.90,cat:"escrita",sub:"caneta" },
      { id:"borracha",name:"Borracha",emoji:"🧽",price:2.90,cat:"escrita",sub:"borracha" },
      { id:"marca-texto",name:"Marca-texto",emoji:"🖍️",price:6.90,cat:"escrita",sub:"marcador" },
      { id:"estojo",name:"Estojo",emoji:"👝",price:19.90,cat:"organizacao",sub:"estojo" },
      { id:"regua",name:"Régua",emoji:"📏",price:4.90,cat:"organizacao",sub:"regua" },
      { id:"apontador",name:"Apontador",emoji:"🔺",price:3.50,cat:"organizacao",sub:"apontador" },
      { id:"mochila",name:"Mochila",emoji:"🎒",price:79.90,cat:"organizacao",sub:"mochila" },
      { id:"caderno",name:"Caderno",emoji:"📓",price:14.90,cat:"papel",sub:"caderno" },
      { id:"bloco-notas",name:"Bloco de notas",emoji:"🗒️",price:8.90,cat:"papel",sub:"bloco" },
      { id:"cola",name:"Cola",emoji:"🧴",price:5.90,cat:"arte",sub:"cola" },
      { id:"tesoura",name:"Tesoura",emoji:"✂️",price:9.90,cat:"arte",sub:"tesoura" },
      { id:"tinta",name:"Tinta guache",emoji:"🎨",price:12.90,cat:"arte",sub:"tinta" },
    ],
  },
  {
    id: "festa", name: "Festa de aniversário", emoji: "🎉",
    situations: [
      "Você está organizando uma festa de aniversário e precisa comprar o essencial.",
      "Você vai montar a mesa de uma festa infantil dentro do orçamento.",
    ],
    categories: [C("doce","Doce","🍬"),C("salgado","Salgado","🥟"),C("bebida","Bebida","🥤"),C("decoracao","Decoração","🎈"),C("descartavel","Descartável","🍽️")],
    items: [
      { id:"bolo",name:"Bolo",emoji:"🎂",price:45.00,cat:"doce",sub:"bolo" },
      { id:"brigadeiro",name:"Brigadeiro",emoji:"🍫",price:15.00,cat:"doce",sub:"docinho" },
      { id:"pirulito",name:"Pirulito",emoji:"🍭",price:8.00,cat:"doce",sub:"bala" },
      { id:"salgadinho",name:"Salgadinho",emoji:"🍿",price:12.00,cat:"salgado",sub:"pacote" },
      { id:"coxinha",name:"Coxinha",emoji:"🍗",price:18.00,cat:"salgado",sub:"frito" },
      { id:"refrigerante",name:"Refrigerante",emoji:"🥤",price:7.90,cat:"bebida",sub:"gaseificada" },
      { id:"suco",name:"Suco",emoji:"🧃",price:6.90,cat:"bebida",sub:"suco" },
      { id:"balao",name:"Balão",emoji:"🎈",price:9.90,cat:"decoracao",sub:"balao" },
      { id:"vela",name:"Vela",emoji:"🕯️",price:5.90,cat:"decoracao",sub:"vela" },
      { id:"chapeuzinho",name:"Chapeuzinho",emoji:"🎉",price:4.90,cat:"decoracao",sub:"chapeu" },
      { id:"prato-desc",name:"Prato descartável",emoji:"🍽️",price:7.90,cat:"descartavel",sub:"prato" },
      { id:"copo-desc",name:"Copo descartável",emoji:"🥤",price:6.90,cat:"descartavel",sub:"copo" },
    ],
  },
  {
    id: "limpeza", name: "Limpeza da casa", emoji: "🧹",
    situations: [
      "Você vai fazer a faxina da casa e precisa repor os produtos.",
      "Você precisa comprar produtos e utensílios para limpar a casa.",
    ],
    categories: [C("limpeza","Limpeza","🧽"),C("utensilio","Utensílio","🧹"),C("higiene","Higiene","🧼")],
    items: [
      { id:"detergente",name:"Detergente",emoji:"🧴",price:3.50,cat:"limpeza",sub:"louca" },
      { id:"sabao-po",name:"Sabão em pó",emoji:"🧺",price:18.90,cat:"limpeza",sub:"roupa" },
      { id:"desinfetante",name:"Desinfetante",emoji:"🧴",price:9.90,cat:"limpeza",sub:"piso" },
      { id:"agua-sanitaria",name:"Água sanitária",emoji:"🧴",price:6.90,cat:"limpeza",sub:"cloro" },
      { id:"alcool",name:"Álcool",emoji:"🧴",price:8.90,cat:"limpeza",sub:"alcool" },
      { id:"esponja",name:"Esponja",emoji:"🧽",price:3.90,cat:"utensilio",sub:"esponja" },
      { id:"pano",name:"Pano de chão",emoji:"🧻",price:5.90,cat:"utensilio",sub:"pano" },
      { id:"vassoura",name:"Vassoura",emoji:"🧹",price:19.90,cat:"utensilio",sub:"vassoura" },
      { id:"rodo",name:"Rodo",emoji:"🧹",price:17.90,cat:"utensilio",sub:"rodo" },
      { id:"luva",name:"Luva de borracha",emoji:"🧤",price:7.90,cat:"utensilio",sub:"luva" },
      { id:"saco-lixo",name:"Saco de lixo",emoji:"🗑️",price:11.90,cat:"utensilio",sub:"saco" },
      { id:"sabonete",name:"Sabonete",emoji:"🧼",price:3.90,cat:"higiene",sub:"banho" },
      { id:"papel-toalha",name:"Papel toalha",emoji:"🧻",price:9.90,cat:"higiene",sub:"papel" },
    ],
  },
  {
    id: "lanche", name: "Lanche saudável", emoji: "🥗", avoid: "snack",
    situations: [
      "Você está montando um lanche saudável e econômico para levar.",
      "Você quer um lanche nutritivo sem exagerar no orçamento.",
    ],
    categories: [C("hortifruti","Hortifruti","🥦"),C("proteina","Proteína","🍳"),C("bebida","Bebida","🥤"),C("snack","Snack","🍫")],
    items: [
      { id:"banana",name:"Banana",emoji:"🍌",price:3.90,cat:"hortifruti",sub:"fruta" },
      { id:"maca",name:"Maçã",emoji:"🍎",price:6.90,cat:"hortifruti",sub:"fruta" },
      { id:"cenoura",name:"Cenoura baby",emoji:"🥕",price:7.90,cat:"hortifruti",sub:"legume" },
      { id:"iogurte",name:"Iogurte",emoji:"🥛",price:5.90,cat:"proteina",sub:"laticinio" },
      { id:"ovo",name:"Ovo cozido",emoji:"🥚",price:2.90,cat:"proteina",sub:"ovo" },
      { id:"castanha",name:"Castanhas",emoji:"🥜",price:14.90,cat:"proteina",sub:"oleaginosa" },
      { id:"barra-cereal",name:"Barra de cereal",emoji:"🍫",price:4.90,cat:"snack",sub:"barra" },
      { id:"biscoito",name:"Biscoito recheado",emoji:"🍪",price:6.90,cat:"snack",sub:"biscoito" },
      { id:"chocolate",name:"Chocolate",emoji:"🍫",price:9.90,cat:"snack",sub:"chocolate" },
      { id:"suco-natural",name:"Suco natural",emoji:"🧃",price:8.90,cat:"bebida",sub:"suco" },
      { id:"agua",name:"Água",emoji:"💧",price:2.90,cat:"bebida",sub:"agua" },
      { id:"refrigerante",name:"Refrigerante",emoji:"🥤",price:7.90,cat:"bebida",sub:"gaseificada" },
    ],
  },
  {
    id: "praia", name: "Viagem para a praia", emoji: "🏖️",
    situations: [
      "Você vai passar o dia na praia e precisa levar o essencial.",
      "Você está montando a bolsa de praia sem estourar o orçamento.",
    ],
    categories: [C("praia","Praia","🏖️"),C("protecao","Proteção","🧴"),C("roupa","Roupa","👕"),C("bebida","Bebida","🥤")],
    items: [
      { id:"canga",name:"Canga",emoji:"🏖️",price:29.90,cat:"praia",sub:"canga" },
      { id:"toalha-praia",name:"Toalha de praia",emoji:"🏖️",price:34.90,cat:"praia",sub:"toalha" },
      { id:"boia",name:"Boia",emoji:"🛟",price:24.90,cat:"praia",sub:"boia" },
      { id:"protetor-solar",name:"Protetor solar",emoji:"🧴",price:39.90,cat:"protecao",sub:"protetor" },
      { id:"chapeu",name:"Chapéu de sol",emoji:"👒",price:25.90,cat:"protecao",sub:"chapeu" },
      { id:"oculos-sol",name:"Óculos de sol",emoji:"🕶️",price:19.90,cat:"protecao",sub:"oculos" },
      { id:"biquini",name:"Biquíni",emoji:"👙",price:49.90,cat:"roupa",sub:"biquini" },
      { id:"sunga",name:"Sunga",emoji:"🩲",price:29.90,cat:"roupa",sub:"sunga" },
      { id:"chinelo",name:"Chinelo",emoji:"🩴",price:22.90,cat:"roupa",sub:"chinelo" },
      { id:"agua-coco",name:"Água de coco",emoji:"🥥",price:6.90,cat:"bebida",sub:"coco" },
      { id:"agua",name:"Água",emoji:"💧",price:2.90,cat:"bebida",sub:"agua" },
      { id:"suco",name:"Suco",emoji:"🧃",price:6.90,cat:"bebida",sub:"suco" },
    ],
  },
  {
    id: "hospital", name: "Cuidados em casa", emoji: "🏥",
    situations: [
      "Você precisa montar um kit de primeiros cuidados para um doente em casa.",
      "Você vai cuidar de alguém em casa e precisa dos itens certos.",
    ],
    categories: [C("medicamento","Medicamento","💊"),C("curativo","Curativo","🩹"),C("higiene","Higiene","🧼"),C("alimento","Alimento","🍚")],
    items: [
      { id:"analgesico",name:"Analgésico",emoji:"💊",price:8.90,cat:"medicamento",sub:"comprimido" },
      { id:"antitermico",name:"Antitérmico",emoji:"🌡️",price:12.90,cat:"medicamento",sub:"comprimido" },
      { id:"soro",name:"Soro fisiológico",emoji:"🧪",price:7.90,cat:"medicamento",sub:"soro" },
      { id:"termometro",name:"Termômetro",emoji:"🌡️",price:24.90,cat:"medicamento",sub:"equipamento" },
      { id:"gaze",name:"Gaze",emoji:"🩹",price:5.90,cat:"curativo",sub:"gaze" },
      { id:"esparadrapo",name:"Esparadrapo",emoji:"🩹",price:6.90,cat:"curativo",sub:"fita" },
      { id:"algodao",name:"Algodão",emoji:"☁️",price:4.90,cat:"curativo",sub:"algodao" },
      { id:"band-aid",name:"Curativo adesivo",emoji:"🩹",price:9.90,cat:"curativo",sub:"adesivo" },
      { id:"sabonete",name:"Sabonete",emoji:"🧼",price:3.90,cat:"higiene",sub:"banho" },
      { id:"alcool-gel",name:"Álcool em gel",emoji:"🧴",price:8.90,cat:"higiene",sub:"maos" },
      { id:"agua",name:"Água",emoji:"💧",price:2.90,cat:"alimento",sub:"agua" },
      { id:"gelatina",name:"Gelatina",emoji:"🍮",price:4.90,cat:"alimento",sub:"sobremesa" },
      { id:"suco",name:"Suco",emoji:"🧃",price:6.90,cat:"alimento",sub:"suco" },
    ],
  },
];
