// ─────────────────────────────────────────────────────────────────────────────
// Informação em Foco — GERADOR DE QUESTÕES (FASE 1 · F1.3)
//
// Princípio: NENHUM atributo de produto é sorteado. A questão escolhe um campo,
// filtra os produtos que realmente têm aquele campo (mesma família semântica e mesma
// dimensão de unidade) e usa os DADOS DO CATÁLOGO. Preço e validade vêm do SNAPSHOT
// da sessão — sorteados uma vez, estáveis do começo ao fim.
//
// É UM gerador parametrizado, não um gerador por nível: `montarQuestao(tipo, params)`.
// A carga cognitiva vem dos PARÂMETROS (nº de produtos, campos visíveis, nº de
// condições, semelhança dos distratores, proximidade dos valores) — nunca de
// pontuação, peso de tipo ou sorteio de atributo.
//
// Módulo PURO: sem React, sem disco. Aleatoriedade injetada (rnd) para os testes.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CATALOGO_PRODUTOS, dimensaoDe, valorNormalizado,
  type ProdutoCatalogo, type Categoria, type Conservacao, type Conteudo, type Unidade,
} from "@/data/informacao-foco-catalogo";

// ── Campos do quadro funcional ───────────────────────────────────────────────
export type CampoKey =
  | "conteudo" | "preco" | "validade" | "saches" | "unidades" | "rendimento"
  | "tipo" | "sabor" | "lactose" | "gluten" | "acucar" | "alergenicos"
  | "conservacao" | "cacau"
  /** virtual: a resposta está IMPRESSA na embalagem, nunca no quadro funcional. */
  | "fraseEmbalagem";

export type TipoQuestao =
  | "localizacao" | "comparacao" | "filtroComparacao" | "duasCondicoes" | "tresCondicoes"
  | "validade" | "conservacao" | "ingredientes" | "alergenicos" | "situacao"
  | "leituraEmbalagem";

/** O que o paciente precisa FAZER mentalmente. É isto que o seletor sorteia. */
export type Operacao = "buscaDireta" | "comparacao" | "filtroComparacao" | "doisCriterios" | "tresCriterios";

export const TIPOS_QUESTAO: TipoQuestao[] = [
  "localizacao", "comparacao", "filtroComparacao", "duasCondicoes", "tresCondicoes",
  "validade", "conservacao", "ingredientes", "alergenicos", "situacao", "leituraEmbalagem",
];

/** Tipos de conteúdo escolhidos somente depois da operação. Modalidades ficam fora. */
export const TIPOS_POR_OPERACAO: Record<Operacao, TipoQuestao[]> = {
  buscaDireta: ["localizacao", "validade", "conservacao", "ingredientes", "alergenicos"],
  comparacao: ["comparacao"],
  filtroComparacao: ["filtroComparacao"],
  doisCriterios: ["duasCondicoes"],
  tresCriterios: ["tresCondicoes"],
};

export interface Validade { mes: number; ano: number }
export interface DadosSessao { preco: number; validade: Validade }
export type Snapshot = Record<string, DadosSessao>;

export interface ProdutoNaQuestao {
  produto: ProdutoCatalogo;
  preco: number;
  validade: Validade;
}

export type Operador =
  | "igual" | "maiorOuIgual" | "menorOuIgual" | "menor" | "maior"
  | "eVerdadeiro" | "eFalso" | "contem" | "naoContem" | "minimo" | "maximo" | "temFrase";

export interface Condicao {
  campo: CampoKey;
  operador: Operador;
  valor?: number | string;
  unidade?: Unidade;
  /** Frase que entra na pergunta: "custa até R$ 8,00". */
  texto: string;
  /** Forma curta para o "Pedido" da situação: "Até R$ 8,00". */
  resumo: string;
}

export interface Questao {
  id: string;
  tipo: TipoQuestao;
  modalidade: "quadro" | "situacao";
  pergunta: string;
  contexto?: string;
  pedido?: string;
  produtos: ProdutoNaQuestao[];
  correta: number;
  condicoes: Condicao[];
  camposVisiveis: CampoKey[];
  camposExigidos: CampoKey[];
  explicacao: string;
  pista: string;
  categoria: Categoria;
  /** assinatura para a regra de não repetição (§13 da Fase 1) */
  assinatura: string;
}

/**
 * A operação de uma questão pronta vem das condições reais, nunca do nome do tipo.
 * Comparação filtrada combina duas ou mais condições e pelo menos um extremo.
 */
export function operacaoDaQuestao(q: Questao): Operacao {
  if (q.condicoes.length >= 2 && q.condicoes.some((c) => c.operador === "minimo" || c.operador === "maximo")) {
    return "filtroComparacao";
  }
  if (q.condicoes.length === 1 && (q.condicoes[0].operador === "minimo" || q.condicoes[0].operador === "maximo")) {
    return "comparacao";
  }
  if (q.condicoes.length === 2) return "doisCriterios";
  if (q.condicoes.length >= 3) return "tresCriterios";
  return "buscaDireta";
}

/** Operação determinada pelo tipo; situação depende dos parâmetros da questão. */
export function operacaoDoTipo(tipo: TipoQuestao): Operacao | null {
  if (tipo === "situacao") return null;
  if (tipo === "comparacao") return "comparacao";
  if (tipo === "filtroComparacao") return "filtroComparacao";
  if (tipo === "duasCondicoes") return "doisCriterios";
  if (tipo === "tresCondicoes") return "tresCriterios";
  return "buscaDireta";
}

export type Rnd = () => number;
const pick = <T,>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length)];
function shuffle<T>(a: readonly T[], rnd: Rnd): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

// ── Snapshot da sessão (§4: preço e validade estáveis) ───────────────────────
const MES_BASE = 8, ANO_BASE = 2026;
const arredondaPreco = (v: number) => Math.max(0.9, Math.round(v * 2) / 2 - 0.1);

export function criarSnapshot(rnd: Rnd = Math.random, anoBase = ANO_BASE): Snapshot {
  const snap: Snapshot = {};
  for (const p of CATALOGO_PRODUTOS) {
    const [min, max] = p.precoFaixa;
    const meses = p.conservacao === "congelado" || p.conservacao === "refrigerado"
      ? 1 + Math.floor(rnd() * 6) : 4 + Math.floor(rnd() * 20);
    const total = MES_BASE + meses;
    snap[p.id] = {
      preco: arredondaPreco(min + rnd() * (max - min)),
      validade: { mes: ((total - 1) % 12) + 1, ano: anoBase + Math.floor((total - 1) / 12) },
    };
  }
  return snap;
}

// ── Formatação e rótulos ─────────────────────────────────────────────────────
export const fmtPreco = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
export const fmtConteudo = (c: Conteudo) =>
  `${String(c.valor).replace(".", ",")} ${c.unidade === "saches" ? "sachês" : c.unidade}`;
export const fmtValidade = (v: Validade) => `${String(v.mes).padStart(2, "0")}/${v.ano}`;
export const fmtConservacao = (c: Conservacao) =>
  c === "refrigerado" ? "Manter refrigerado" : c === "congelado" ? "Manter congelado"
  : c === "luz" ? "Conservar ao abrigo da luz" : "Conservar em local seco";

/** "Peso" só para massa, "Volume" só para volume, "Quantidade" para contagem (§5). */
export function labelCampo(k: CampoKey, p?: ProdutoCatalogo): string {
  if (k === "conteudo") {
    if (!p) return "Conteúdo";
    const d = dimensaoDe(p.conteudo.unidade);
    return d === "massa" ? "Peso" : d === "volume" ? "Volume" : "Quantidade";
  }
  const m: Record<Exclude<CampoKey, "conteudo">, string> = {
    preco: "Preço", validade: "Validade", saches: "Quantidade", unidades: "Quantidade",
    rendimento: "Rendimento", tipo: "Tipo", sabor: "Sabor", lactose: "Lactose",
    gluten: "Glúten", acucar: "Açúcar", alergenicos: "Alérgenos",
    conservacao: "Conservação", cacau: "Cacau", fraseEmbalagem: "Na embalagem",
  };
  return m[k as Exclude<CampoKey, "conteudo">];
}

export function valorCampo(pq: ProdutoNaQuestao, k: CampoKey): string {
  const p = pq.produto;
  switch (k) {
    case "conteudo": return fmtConteudo(p.conteudo);
    case "preco": return fmtPreco(pq.preco);
    case "validade": return fmtValidade(pq.validade);
    case "saches": return p.saches != null ? `${p.saches} sachês` : "—";
    case "unidades": return p.unidades != null ? `${p.unidades} unidades` : "—";
    case "rendimento": return p.rendimento ?? "—";
    case "tipo": return p.tipo ?? "—";
    case "sabor": return p.sabor ?? "—";
    case "lactose": return p.lactose == null ? "—" : p.lactose ? "Contém lactose" : "Não contém lactose";
    case "gluten": return p.gluten == null ? "—" : p.gluten ? "Contém glúten" : "Não contém glúten";
    case "acucar": return p.acucarAdicionado == null ? "—" : p.acucarAdicionado ? "Com açúcar" : "Sem açúcar adicionado";
    case "alergenicos": return p.alergenicos?.length ? `Contém ${p.alergenicos.join(", ")}` : "Sem alérgenos declarados";
    case "conservacao": return p.conservacao ? fmtConservacao(p.conservacao) : "—";
    case "cacau": return p.cacauPct != null ? `${p.cacauPct}%` : "—";
    case "fraseEmbalagem": return "";   // nunca aparece no quadro
  }
}

/** O produto TEM esse campo? Campo ausente nunca vira pergunta nem valor inventado. */
export function temCampo(p: ProdutoCatalogo, k: CampoKey): boolean {
  switch (k) {
    case "conteudo": return !p.revisar;
    case "preco": case "validade": return true;
    case "saches": return p.saches != null;
    case "unidades": return p.unidades != null;
    case "rendimento": return p.rendimento != null;
    case "tipo": return p.tipo != null;
    case "sabor": return p.sabor != null;
    case "lactose": return p.lactose != null;
    case "gluten": return p.gluten != null;
    case "acucar": return p.acucarAdicionado != null;
    // "Sem alérgenos declarados" também é informação de rótulo: o campo existe sempre.
    // Quem precisa TER alérgeno é o alvo da pergunta (a fábrica da condição filtra isso).
    case "alergenicos": return true;
    case "conservacao": return p.conservacao != null;
    case "cacau": return p.cacauPct != null;
    case "fraseEmbalagem": return (p.frasesNaEmbalagem?.length ?? 0) > 0 && p.directPackageReadingEnabled === true;
  }
}

/**
 * Qual campo do quadro a frase impressa revelaria. Se a frase fala em "10 sachês",
 * o campo "saches" NÃO pode aparecer no quadro — senão a resposta está dada (§9 da Fase 2).
 */
export function campoReveladoPor(frase: string): CampoKey | null {
  const f = frase.toLowerCase();
  if (/\bsach[êe]s?\b|envelopes?/.test(f)) return "saches";
  if (/\bunidades?\b/.test(f)) return "unidades";
  if (/rende|por[çc][õo]es|copos/.test(f)) return "rendimento";
  if (/cacau/.test(f)) return "cacau";
  if (/lactose/.test(f)) return "lactose";
  if (/gl[úu]ten/.test(f)) return "gluten";
  if (/a[çc][úu]car/.test(f)) return "acucar";
  if (/congelado|refrigerado|abrigo da luz|local seco/.test(f)) return "conservacao";
  if (/\bg\b|\bkg\b|\bml\b|\bl\b/.test(f)) return "conteudo";
  return "tipo";      // "extra virgem", "integral", "tipo 1", "de Modena"…
}

// ── Avaliação de condição (pura, sem texto) ──────────────────────────────────
function numeroDe(pq: ProdutoNaQuestao, campo: CampoKey): number | null {
  const p = pq.produto;
  switch (campo) {
    case "conteudo": return valorNormalizado(p.conteudo);
    case "preco": return pq.preco;
    case "validade": return pq.validade.ano * 12 + pq.validade.mes;
    case "saches": return p.saches ?? null;
    case "unidades": return p.unidades ?? null;
    case "cacau": return p.cacauPct ?? null;
    default: return null;
  }
}

export function satisfaz(pq: ProdutoNaQuestao, c: Condicao, todos?: ProdutoNaQuestao[]): boolean {
  const p = pq.produto;
  switch (c.operador) {
    case "igual": {
      const n = numeroDe(pq, c.campo);
      if (n != null && typeof c.valor === "number") return n === c.valor;
      if (c.campo === "tipo") return p.tipo === c.valor;
      if (c.campo === "sabor") return p.sabor === c.valor;
      if (c.campo === "conservacao") return p.conservacao === c.valor;
      if (c.campo === "rendimento") return p.rendimento === c.valor;
      return false;
    }
    case "maiorOuIgual": { const n = numeroDe(pq, c.campo); return n != null && n >= (c.valor as number); }
    case "menorOuIgual": { const n = numeroDe(pq, c.campo); return n != null && n <= (c.valor as number); }
    case "menor": { const n = numeroDe(pq, c.campo); return n != null && n < (c.valor as number); }
    case "maior": { const n = numeroDe(pq, c.campo); return n != null && n > (c.valor as number); }
    case "eVerdadeiro":
      return c.campo === "lactose" ? p.lactose === true
        : c.campo === "gluten" ? p.gluten === true
        : c.campo === "acucar" ? p.acucarAdicionado === true : false;
    case "eFalso":
      return c.campo === "lactose" ? p.lactose === false
        : c.campo === "gluten" ? p.gluten === false
        : c.campo === "acucar" ? p.acucarAdicionado === false : false;
    case "temFrase": return (p.frasesNaEmbalagem ?? []).some((f) => f.toLowerCase() === String(c.valor).toLowerCase());
    case "contem": return (p.alergenicos ?? []).includes(c.valor as string);
    case "naoContem": return !(p.alergenicos ?? []).includes(c.valor as string);
    case "minimo": case "maximo": {
      if (!todos) return false;
      const meu = numeroDe(pq, c.campo);
      if (meu == null) return false;
      const outros = todos.map((o) => numeroDe(o, c.campo)).filter((v): v is number => v != null);
      return c.operador === "minimo" ? meu === Math.min(...outros) : meu === Math.max(...outros);
    }
  }
}

const ehExtremo = (c: Condicao) => c.operador === "minimo" || c.operador === "maximo";

/** Avalia condições em duas etapas: primeiro os FILTROS, depois os EXTREMOS sobre o que sobrou.
 *  É isto que torna "entre os que X, qual o menor Y" expressável. */
export function avaliarEmEtapas(
  produtos: ProdutoNaQuestao[], condicoes: Condicao[],
): { filtrados: ProdutoNaQuestao[]; atendem: ProdutoNaQuestao[] } {
  const filtros = condicoes.filter((c) => !ehExtremo(c));
  const extremos = condicoes.filter(ehExtremo);
  const filtrados = produtos.filter((pq) => filtros.every((c) => satisfaz(pq, c, produtos)));
  const atendem = extremos.length === 0
    ? filtrados
    : filtrados.filter((pq) => extremos.every((c) => satisfaz(pq, c, filtrados)));
  return { filtrados, atendem };
}

const atendeTodas = (pq: ProdutoNaQuestao, cs: Condicao[], todos: ProdutoNaQuestao[]) =>
  cs.every((c) => satisfaz(pq, c, todos));
const quantasAtende = (pq: ProdutoNaQuestao, cs: Condicao[], todos: ProdutoNaQuestao[]) =>
  cs.filter((c) => satisfaz(pq, c, todos)).length;

// ── Famílias semânticas: só produtos comparáveis entram juntos (§11) ─────────
const FAMILIAS: Categoria[][] = [
  ["leites", "bebidas-vegetais"], ["sucos"], ["iogurtes"], ["laticinios"], ["frios"],
  ["biscoitos", "paes"], ["cereais"], ["graos-e-massas"], ["farinaceos"],
  ["conservas"], ["congelados"], ["molhos"], ["oleos-e-vinagres"], ["cafes-e-chas"],
  ["acucares-e-adocantes"], ["doces"], ["temperos"], ["pastas"], ["ovos"],
];

/** Grupos comparáveis: mesma família E mesma dimensão de unidade, com N+ produtos. */
function gruposComparaveis(minimo: number, exigir: CampoKey[], rnd: Rnd): ProdutoNaQuestaoGrupo[] {
  const out: ProdutoNaQuestaoGrupo[] = [];
  for (const fam of FAMILIAS) {
    const daFamilia = CATALOGO_PRODUTOS.filter(
      (p) => fam.includes(p.categoria) && exigir.every((c) => temCampo(p, c)),
    );
    const porDimensao = new Map<string, ProdutoCatalogo[]>();
    for (const p of daFamilia) {
      const d = dimensaoDe(p.conteudo.unidade);
      porDimensao.set(d, [...(porDimensao.get(d) ?? []), p]);
    }
    for (const lista of porDimensao.values()) if (lista.length >= minimo) out.push(lista);
  }
  return shuffle(out, rnd);
}
type ProdutoNaQuestaoGrupo = ProdutoCatalogo[];

// ── Parâmetros da geração (a dificuldade mora aqui, não no gerador) ─────────
export interface ParametrosQuestao {
  nProdutos: 3 | 4;
  nCampos: number;                 // 3 a 6
  nCondicoes: 1 | 2 | 3;
  semelhancaDistratores: "baixa" | "moderada" | "alta";
  valoresProximos: boolean;
  ordemCamposVariavel: boolean;
}

/**
 * Parâmetros dos 8 níveis de referência (§9). Aqui são apenas CARGA COGNITIVA:
 * a Fase 3 vai mexer nestas dimensões uma de cada vez, conforme o desempenho.
 */
export const PARAMS_POR_NIVEL: ParametrosQuestao[] = [
  { nProdutos: 3, nCampos: 3, nCondicoes: 1, semelhancaDistratores: "baixa",    valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 3, nCampos: 4, nCondicoes: 1, semelhancaDistratores: "baixa",    valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 3, nCampos: 4, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: false, ordemCamposVariavel: false },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada", valoresProximos: true,  ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "alta",     valoresProximos: true,  ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta",     valoresProximos: true,  ordemCamposVariavel: true },
  { nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta",     valoresProximos: true,  ordemCamposVariavel: true },
];
export const paramsDoNivel = (n: number) => PARAMS_POR_NIVEL[Math.min(8, Math.max(1, Math.round(n))) - 1];

/** Peso de cada tipo no sorteio, por nível. */
export const PESOS_TIPO_POR_NIVEL: Record<number, Partial<Record<TipoQuestao, number>>> = {
  1: { localizacao: 55, comparacao: 45 },
  2: { localizacao: 45, comparacao: 55 },
  3: { localizacao: 22, comparacao: 25, duasCondicoes: 20, validade: 13, conservacao: 7, ingredientes: 7, alergenicos: 6 },
  4: { localizacao: 18, comparacao: 24, duasCondicoes: 24, validade: 14, conservacao: 7, ingredientes: 7, alergenicos: 6 },
  5: { localizacao: 15, comparacao: 22, duasCondicoes: 26, validade: 14, conservacao: 8, ingredientes: 8, alergenicos: 7 },
  6: { localizacao: 13, comparacao: 20, duasCondicoes: 27, validade: 15, conservacao: 8, ingredientes: 9, alergenicos: 8 },
  7: { localizacao: 10, comparacao: 18, duasCondicoes: 24, validade: 14, conservacao: 8, ingredientes: 8, alergenicos: 8, tresCondicoes: 10 },
  8: { localizacao: 9, comparacao: 16, duasCondicoes: 24, validade: 14, conservacao: 8, ingredientes: 8, alergenicos: 8, tresCondicoes: 13 },
};

const PESOS_OPERACAO_POR_NIVEL: Record<number, Record<Operacao, number>> = {
  1: { buscaDireta: 67, comparacao: 33, filtroComparacao: 0, doisCriterios: 0, tresCriterios: 0 },
  2: { buscaDireta: 31, comparacao: 31, filtroComparacao: 0, doisCriterios: 38, tresCriterios: 0 },
  3: { buscaDireta: 21.25, comparacao: 25.5, filtroComparacao: 15, doisCriterios: 38.25, tresCriterios: 0 },
  4: { buscaDireta: 18.7, comparacao: 24.65, filtroComparacao: 15, doisCriterios: 41.65, tresCriterios: 0 },
  5: { buscaDireta: 16.15, comparacao: 23.8, filtroComparacao: 15, doisCriterios: 45.05, tresCriterios: 0 },
  6: { buscaDireta: 13.5758, comparacao: 22.0606, filtroComparacao: 15, doisCriterios: 48.3636, tresCriterios: 0 },
  7: { buscaDireta: 10.4, comparacao: 19.2, filtroComparacao: 20, doisCriterios: 36.8, tresCriterios: 13.6 },
  8: { buscaDireta: 8.8, comparacao: 17.6, filtroComparacao: 20, doisCriterios: 36, tresCriterios: 17.6 },
};

export type Modalidade = "quadro" | "situacao" | "embalagem";

function sortearComPesos<T>(opcoes: readonly T[], pesoDe: (opcao: T) => number, rnd: Rnd): T {
  const total = opcoes.reduce((soma, opcao) => soma + pesoDe(opcao), 0);
  if (total <= 0) return pick(opcoes, rnd);
  let limite = rnd() * total;
  for (const opcao of opcoes) {
    limite -= pesoDe(opcao);
    if (limite < 0) return opcao;
  }
  return opcoes[opcoes.length - 1];
}

/** Sorteia o tipo de uma atividade de quadro, respeitando o que o nível liberou. */
export function sortearTipo(nivel: number, rnd: Rnd): TipoQuestao {
  const permitidos = tiposDoNivel(nivel).filter((tipo) => tipo !== "situacao" && tipo !== "leituraEmbalagem");
  const pesos = PESOS_TIPO_POR_NIVEL[Math.min(8, Math.max(1, Math.round(nivel)))];
  return sortearComPesos(permitidos, (tipo) => pesos[tipo] ?? 0, rnd);
}

/** Operações cognitivas liberadas em cada nível. */
export function operacoesDoNivel(nivel: number): Operacao[] {
  const n = Math.min(8, Math.max(1, Math.round(nivel)));
  const operacoes: Operacao[] = ["buscaDireta", "comparacao"];
  if (n >= 2) operacoes.push("doisCriterios");
  if (n >= 3) operacoes.push("filtroComparacao");
  if (n >= 7) operacoes.push("tresCriterios");
  return operacoes;
}

/**
 * Sorteia primeiro a operação. A anterior continua possível, mas com 15% do peso,
 * evitando tanto a repetição frequente quanto uma alternância determinística.
 */
export function sortearOperacao(nivel: number, rnd: Rnd, anterior?: Operacao): Operacao {
  const n = Math.min(8, Math.max(1, Math.round(nivel)));
  const permitidas = operacoesDoNivel(n);
  const pesos = PESOS_OPERACAO_POR_NIVEL[n];
  return sortearComPesos(
    permitidas,
    (operacao) => pesos[operacao] * (operacao === anterior ? 0.15 : 1),
    rnd,
  );
}

const TIPO_DO_CAMPO: Partial<Record<CampoKey, TipoQuestao>> = {
  conteudo: "localizacao", saches: "localizacao", unidades: "localizacao", cacau: "localizacao", tipo: "localizacao",
  validade: "validade", conservacao: "conservacao",
  lactose: "ingredientes", gluten: "ingredientes", acucar: "ingredientes",
  alergenicos: "alergenicos",
};

/** Escolhe o tipo/campo somente depois que a operação cognitiva foi definida. */
export function tipoParaOperacao(
  operacao: Operacao, nivel: number, rnd: Rnd, campoAnterior?: CampoKey,
): TipoQuestao {
  const liberados = tiposDoNivel(nivel);
  const candidatos = TIPOS_POR_OPERACAO[operacao].filter((tipo) => liberados.includes(tipo));
  const disponiveis = candidatos.length ? candidatos : TIPOS_POR_OPERACAO[operacao];
  const tipoAnterior = campoAnterior ? TIPO_DO_CAMPO[campoAnterior] : undefined;
  const semCampoAnterior = disponiveis.filter((tipo) => tipo !== tipoAnterior);
  const elegiveis = semCampoAnterior.length ? semCampoAnterior : disponiveis;
  const pesos = PESOS_TIPO_POR_NIVEL[Math.min(8, Math.max(1, Math.round(nivel)))];
  return sortearComPesos(elegiveis, (tipo) => pesos[tipo] ?? 0, rnd);
}

/** Sorteia a modalidade, mantendo os pisos de nível para situação e embalagem. */
export function sortearModalidade(nivel: number, rnd: Rnd): Modalidade {
  const pesos: Record<Modalidade, number> = nivel < 5
    ? { quadro: 100, situacao: 0, embalagem: 0 }
    : nivel < 6
      ? { quadro: 80, situacao: 20, embalagem: 0 }
      : nivel < 7
        ? { quadro: 70, situacao: 18, embalagem: 12 }
        : { quadro: 65, situacao: 20, embalagem: 15 };
  const permitidas = (Object.keys(pesos) as Modalidade[]).filter((modalidade) => pesos[modalidade] > 0);
  return sortearComPesos(permitidas, (modalidade) => pesos[modalidade], rnd);
}

/** Tipos liberados por nível — carga, não peso: nada de sorteio ponderado. */
export function tiposDoNivel(n: number): TipoQuestao[] {
  const base: TipoQuestao[] = ["localizacao", "comparacao"];
  if (n >= 2) base.push("duasCondicoes");
  if (n >= 3) base.push("filtroComparacao", "validade", "conservacao", "ingredientes", "alergenicos");
  if (n >= 5) base.push("situacao");
  if (n >= 6) base.push("leituraEmbalagem");
  if (n >= 7) base.push("tresCondicoes");
  return base;
}

export const PARAMS_PADRAO: ParametrosQuestao = {
  nProdutos: 3, nCampos: 3, nCondicoes: 1,
  semelhancaDistratores: "baixa", valoresProximos: false, ordemCamposVariavel: false,
};

let seq = 0;
export const _resetIds = () => { seq = 0; };
const uid = () => `q${++seq}`;

const emQuestao = (p: ProdutoCatalogo, snap: Snapshot): ProdutoNaQuestao =>
  ({ produto: p, preco: snap[p.id].preco, validade: snap[p.id].validade });

// ── Construção das condições a partir de um produto REAL (o alvo) ───────────
type FabricaCondicao = (alvo: ProdutoNaQuestao, rnd: Rnd) => Condicao | null;

const condConteudoExato: FabricaCondicao = (a) => ({
  campo: "conteudo", operador: "igual", valor: valorNormalizado(a.produto.conteudo),
  texto: `tem ${fmtConteudo(a.produto.conteudo)}`, resumo: fmtConteudo(a.produto.conteudo),
});
const condConteudoMinimo: FabricaCondicao = (a) => {
  const v = valorNormalizado(a.produto.conteudo);
  const alvo = v >= 1000 ? 500 : v >= 500 ? 400 : v >= 200 ? 150 : 20;
  if (v < alvo) return null;
  const d = dimensaoDe(a.produto.conteudo.unidade);
  if (d === "contagem") return null;
  const un = d === "massa" ? "g" : "mL";
  return { campo: "conteudo", operador: "maiorOuIgual", valor: alvo,
    texto: `tem pelo menos ${alvo} ${un}`, resumo: `A partir de ${alvo} ${un}` };
};
const condPrecoMaximo: FabricaCondicao = (a) => {
  const teto = Math.ceil(a.preco) + 0.5;
  return { campo: "preco", operador: "menorOuIgual", valor: teto,
    texto: `custa até ${fmtPreco(teto)}`, resumo: `Até ${fmtPreco(teto)}` };
};
const condSemLactose: FabricaCondicao = (a) =>
  a.produto.lactose === false ? { campo: "lactose", operador: "eFalso", texto: "não contém lactose", resumo: "Sem lactose" } : null;
const condComLactose: FabricaCondicao = (a) =>
  a.produto.lactose === true ? { campo: "lactose", operador: "eVerdadeiro", texto: "contém lactose", resumo: "Com lactose" } : null;
const condSemGluten: FabricaCondicao = (a) =>
  a.produto.gluten === false ? { campo: "gluten", operador: "eFalso", texto: "não contém glúten", resumo: "Sem glúten" } : null;
const condSemAcucar: FabricaCondicao = (a) =>
  a.produto.acucarAdicionado === false ? { campo: "acucar", operador: "eFalso", texto: "não tem açúcar adicionado", resumo: "Sem açúcar adicionado" } : null;
const condTipo: FabricaCondicao = (a) =>
  a.produto.tipo ? { campo: "tipo", operador: "igual", valor: a.produto.tipo,
    texto: `é do tipo ${a.produto.tipo}`, resumo: a.produto.tipo.charAt(0).toUpperCase() + a.produto.tipo.slice(1) } : null;
const condSaches: FabricaCondicao = (a) =>
  a.produto.saches != null ? { campo: "saches", operador: "igual", valor: a.produto.saches,
    texto: `tem ${a.produto.saches} sachês`, resumo: `${a.produto.saches} sachês` } : null;
const condUnidades: FabricaCondicao = (a) =>
  a.produto.unidades != null ? { campo: "unidades", operador: "igual", valor: a.produto.unidades,
    texto: `tem ${a.produto.unidades} unidades`, resumo: `${a.produto.unidades} unidades` } : null;
const condCacau: FabricaCondicao = (a) =>
  a.produto.cacauPct != null ? { campo: "cacau", operador: "igual", valor: a.produto.cacauPct,
    texto: `tem ${a.produto.cacauPct}% de cacau`, resumo: `${a.produto.cacauPct}% cacau` } : null;
const condConservacao: FabricaCondicao = (a) =>
  a.produto.conservacao ? { campo: "conservacao", operador: "igual", valor: a.produto.conservacao,
    texto: `precisa ${fmtConservacao(a.produto.conservacao).toLowerCase().replace("manter", "ser mantido").replace("conservar", "ser conservado")}`,
    resumo: fmtConservacao(a.produto.conservacao) } : null;
const condAlergenico: FabricaCondicao = (a, rnd) => {
  const al = a.produto.alergenicos ?? [];
  if (!al.length) return null;
  const escolhido = pick(al, rnd);
  return { campo: "alergenicos", operador: "contem", valor: escolhido,
    texto: `contém ${escolhido}`, resumo: `Contém ${escolhido}` };
};
const condValidadeApos: FabricaCondicao = (a) => {
  const antes = a.validade.ano * 12 + a.validade.mes - 1;
  const ref = fmtValidade({ mes: ((antes - 1) % 12) + 1, ano: Math.floor((antes - 1) / 12) });
  return { campo: "validade", operador: "maior", valor: antes,
    texto: `vence depois de ${ref}`, resumo: `Validade após ${ref}` };
};

const condFraseEmbalagem: FabricaCondicao = (a, rnd) => {
  const p = a.produto;
  if (!p.directPackageReadingEnabled || !p.frasesNaEmbalagem?.length) return null;
  const frase = pick(p.frasesNaEmbalagem, rnd);
  return { campo: "fraseEmbalagem", operador: "temFrase", valor: frase,
    texto: `informa “${frase}” na embalagem`, resumo: `“${frase}” na embalagem` };
};

const FABRICAS_POR_TIPO: Record<TipoQuestao, FabricaCondicao[]> = {
  localizacao: [condConteudoExato, condSaches, condUnidades, condCacau, condTipo],
  comparacao: [],                                   // usa mínimo/máximo, montado à parte
  filtroComparacao: [],                             // enumera filtro + extremo no grupo
  duasCondicoes: [condConteudoMinimo, condPrecoMaximo, condSemLactose, condSemAcucar, condSemGluten, condTipo, condSaches],
  tresCondicoes: [condConteudoMinimo, condPrecoMaximo, condSemLactose, condSemAcucar, condSemGluten, condTipo, condCacau],
  validade: [condValidadeApos],
  conservacao: [condConservacao],
  ingredientes: [condSemLactose, condComLactose, condSemGluten, condSemAcucar],
  alergenicos: [condAlergenico],
  leituraEmbalagem: [condFraseEmbalagem],
  situacao: [condConteudoExato, condConteudoMinimo, condPrecoMaximo, condSemLactose, condSemAcucar, condTipo, condCacau, condSaches],
};

/** Campos que a condição obriga a mostrar no quadro. */
const campoDaCondicao = (c: Condicao): CampoKey => c.campo;

// ── Perguntas por tipo (texto) ───────────────────────────────────────────────
/** "a, b e c" — leitura natural, sem "e ... e ...". */
function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? "";
  return `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;
}

function textoFiltroPlural(texto: string): string {
  return texto
    .replace(/^precisa ser mantido refrigerado\b/, "precisam ser mantidos refrigerados")
    .replace(/^precisa ser mantido congelado\b/, "precisam ser mantidos congelados")
    .replace(/^precisa ser conservado\b/, "precisam ser conservados")
    .replace(/^não contém\b/, "não contêm")
    .replace(/^não tem\b/, "não têm")
    .replace(/^contém\b/, "contêm")
    .replace(/^tem\b/, "têm")
    .replace(/^custa\b/, "custam")
    .replace(/^vence\b/, "vencem")
    .replace(/^é do tipo\b/, "são do tipo");
}

function textoPergunta(tipo: TipoQuestao, cs: Condicao[]): string {
  const lista = juntar(cs.map((c) => c.texto));
  if (tipo === "situacao") return "Qual produto atende ao pedido?";
  if (tipo === "leituraEmbalagem") return `Olhe as embalagens: qual produto ${lista}?`;
  if (tipo === "filtroComparacao") {
    const filtros = cs.filter((c) => !ehExtremo(c));
    const extremos = cs.filter(ehExtremo);
    return `Entre os produtos que ${juntar(filtros.map((c) => textoFiltroPlural(c.texto)))}, qual ${juntar(extremos.map((c) => c.texto))}?`;
  }
  return `Qual produto ${lista}?`;
}

// Contextos de situação por família (texto de apoio; os DADOS continuam vindo do catálogo)
const NOMES = ["Marina", "Carlos", "Ana", "Júlia", "Pedro", "Fernanda", "Roberto", "Helena"];
const CENAS: Partial<Record<Categoria, string>> = {
  leites: "vai preparar o café da manhã", "bebidas-vegetais": "vai preparar o café da manhã",
  sucos: "quer uma bebida para o almoço", iogurtes: "quer um lanche da tarde",
  laticinios: "vai preparar um lanche", frios: "vai montar um sanduíche",
  biscoitos: "quer um acompanhamento para o café", paes: "vai preparar o café da manhã",
  cereais: "quer um café da manhã reforçado", "graos-e-massas": "vai preparar o almoço",
  farinaceos: "vai preparar um bolo", conservas: "vai preparar uma salada",
  congelados: "quer um jantar prático", molhos: "vai temperar o jantar",
  "oleos-e-vinagres": "vai temperar a salada", "cafes-e-chas": "quer uma bebida quente",
  "acucares-e-adocantes": "vai adoçar o café", doces: "vai preparar uma sobremesa",
  temperos: "vai temperar a comida", pastas: "procura algo para o pão", ovos: "vai preparar o café da manhã",
};

// ── GERADOR ÚNICO ────────────────────────────────────────────────────────────
export interface EntradaGeracao {
  tipo: TipoQuestao;
  params: ParametrosQuestao;
  snapshot: Snapshot;
  rnd?: Rnd;
  /** histórico da sessão — evita repetição (§13). */
  historico?: RegistroHistorico[];
}

export function montarQuestao(e: EntradaGeracao): Questao | null {
  const rnd = e.rnd ?? Math.random;
  const { tipo, params, snapshot } = e;

  // 1. campos que o tipo exige de TODOS os produtos do grupo
  const exigidosDoTipo: CampoKey[] =
    tipo === "comparacao" ? [pick(["preco", "conteudo", "validade"] as CampoKey[], rnd)]
    : tipo === "validade" ? ["validade"]
    : tipo === "conservacao" ? ["conservacao"]
    : tipo === "ingredientes" ? [pick(["lactose", "gluten", "acucar"] as CampoKey[], rnd)]
    : [];

  const grupos = gruposComparaveis(params.nProdutos, exigidosDoTipo, rnd);
  if (!grupos.length) return null;

  for (const grupo of grupos.slice(0, 6)) {
    const questao = tentarNoGrupo(grupo, tipo, params, snapshot, rnd, exigidosDoTipo);
    if (questao && !motivoRepeticao(questao, e.historico ?? [])) return questao;
  }
  return null;
}

function tentarNoGrupo(
  grupo: ProdutoCatalogo[], tipo: TipoQuestao, params: ParametrosQuestao,
  snap: Snapshot, rnd: Rnd, exigidosDoTipo: CampoKey[],
): Questao | null {
  const pool = grupo.map((p) => emQuestao(p, snap));

  const condicaoExtremo = (campo: CampoKey, operador: "minimo" | "maximo"): Condicao => {
    const texto = campo === "preco" ? (operador === "minimo" ? "tem o menor preço" : "tem o maior preço")
      : campo === "validade" ? (operador === "minimo" ? "vence primeiro" : "tem a validade mais longa")
      : campo === "cacau" ? (operador === "minimo" ? "tem o menor percentual de cacau" : "tem o maior percentual de cacau")
      : (operador === "minimo" ? "tem a menor quantidade" : "tem a maior quantidade");
    return { campo, operador, texto, resumo: texto.charAt(0).toUpperCase() + texto.slice(1) };
  };

  // ── comparação: a resposta é o extremo, não uma condição sobre valor fixo ──
  if (tipo === "comparacao") {
    const campo = exigidosDoTipo[0];
    const extremo = rnd() < 0.5 ? "minimo" : "maximo";
    const escolhidos = escolherProdutos(pool, params, rnd);
    if (!escolhidos) return null;
    const cond = condicaoExtremo(campo, extremo);
    const vencedores = escolhidos.filter((pq) => satisfaz(pq, cond, escolhidos));
    if (vencedores.length !== 1) return null;
    return finalizar(tipo, escolhidos, [cond], escolhidos.indexOf(vencedores[0]), params, rnd);
  }

  // ── filtro + comparação: primeiro enumera filtros no grupo, depois extremos no subconjunto ──
  if (tipo === "filtroComparacao") {
    const escolhidos = escolherProdutos(pool, params, rnd);
    if (!escolhidos) return null;
    const fabricasFiltro: FabricaCondicao[] = [
      condConteudoMinimo, condPrecoMaximo, condValidadeApos, condSemLactose, condComLactose,
      condSemAcucar, condSemGluten, condTipo, condSaches, condUnidades, condCacau,
      condConservacao, condAlergenico,
    ];
    const porAssinatura = new Map<string, Condicao>();
    for (const pq of escolhidos) {
      for (const fabrica of fabricasFiltro) {
        const filtro = fabrica(pq, rnd);
        if (!filtro || ehExtremo(filtro)) continue;
        if (!escolhidos.every((produto) => temCampo(produto.produto, filtro.campo))) continue;
        const filtrados = escolhidos.filter((produto) => satisfaz(produto, filtro, escolhidos));
        if (filtrados.length < 2 || filtrados.length >= escolhidos.length) continue;
        const assinatura = `${filtro.campo}|${filtro.operador}|${JSON.stringify(filtro.valor)}`;
        if (!porAssinatura.has(assinatura)) porAssinatura.set(assinatura, filtro);
      }
    }

    const camposNumericos: CampoKey[] = ["preco", "conteudo", "validade", "saches", "unidades", "cacau"];
    const viaveis: { condicoes: Condicao[]; alvo: ProdutoNaQuestao }[] = [];
    for (const filtro of shuffle([...porAssinatura.values()], rnd)) {
      const filtrados = escolhidos.filter((produto) => satisfaz(produto, filtro, escolhidos));
      for (const campo of shuffle(camposNumericos.filter(
        (c) => escolhidos.every((produto) => temCampo(produto.produto, c)),
      ), rnd)) {
        for (const operador of shuffle(["minimo", "maximo"] as const, rnd)) {
          const extremo = condicaoExtremo(campo, operador);
          const { atendem } = avaliarEmEtapas(escolhidos, [filtro, extremo]);
          if (atendem.length === 1) viaveis.push({ condicoes: [filtro, extremo], alvo: atendem[0] });
          if (viaveis.length >= 24) break;
        }
        if (viaveis.length >= 24) break;
      }
      if (viaveis.length >= 24) break;
    }
    if (!viaveis.length) return null;
    const escolhida = pick(viaveis, rnd);
    return finalizar(
      tipo, escolhidos, escolhida.condicoes, escolhidos.indexOf(escolhida.alvo), params, rnd,
    );
  }

  // ── demais tipos: condições construídas a partir de um ALVO real ──────────
  const nCond = tipo === "tresCondicoes" ? 3
    : tipo === "duasCondicoes" ? 2
    : tipo === "situacao" ? Math.min(params.nCondicoes, 3)
    : 1;

  // Com múltiplos critérios, a construção parte dos produtos apresentados. Assim
  // cada condição pode ser necessária por construção, em vez de depender de
  // distratores encontrados depois para condições fabricadas a partir de um alvo.
  if (nCond >= 2) {
    if (pool.length < params.nProdutos) return null;
    const escolhidos = shuffle(pool, rnd).slice(0, params.nProdutos);

    const porAssinatura = new Map<string, Condicao>();
    for (const pq of escolhidos) {
      for (const fabrica of FABRICAS_POR_TIPO[tipo]) {
        const condicao = fabrica(pq, rnd);
        if (!condicao || !satisfaz(pq, condicao, escolhidos)) continue;
        if (!escolhidos.every((produto) => temCampo(produto.produto, condicao.campo))) continue;
        const assinatura = `${condicao.campo}|${condicao.operador}|${JSON.stringify(condicao.valor)}`;
        if (!porAssinatura.has(assinatura)) porAssinatura.set(assinatura, condicao);
      }
    }

    // O limite mantém a enumeração de trios em O(24³), como pede a especificação.
    const candidatas = shuffle([...porAssinatura.values()], rnd).slice(0, 24);
    const viaveis: { condicoes: Condicao[]; alvo: ProdutoNaQuestao }[] = [];

    function enumerar(inicio: number, atuais: Condicao[]): void {
      if (viaveis.length >= 12) return;
      if (atuais.length === nCond) {
        if (new Set(atuais.map((c) => c.campo)).size !== atuais.length) return;
        if (!atuais.every((c) => escolhidos.filter((pq) => satisfaz(pq, c, escolhidos)).length >= 2)) return;
        const corretos = escolhidos.filter((pq) => atendeTodas(pq, atuais, escolhidos));
        if (corretos.length !== 1) return;
        if (nCond === 2 && params.semelhancaDistratores === "alta") {
          const distratoresCobertos = escolhidos
            .filter((pq) => pq !== corretos[0])
            .every((pq) => quantasAtende(pq, atuais, escolhidos) >= 1);
          if (!distratoresCobertos) return;
        }
        viaveis.push({ condicoes: [...atuais], alvo: corretos[0] });
        return;
      }
      for (let i = inicio; i <= candidatas.length - (nCond - atuais.length); i++) {
        enumerar(i + 1, [...atuais, candidatas[i]]);
        if (viaveis.length >= 12) return;
      }
    }

    enumerar(0, []);
    if (!viaveis.length) return null;
    const escolhida = pick(viaveis, rnd);
    const distratores = escolherDistratores(
      escolhidos.filter((pq) => pq !== escolhida.alvo), escolhida.condicoes, params, rnd,
    );
    if (!distratores) return null;
    const todos = shuffle([escolhida.alvo, ...distratores], rnd);
    return finalizar(tipo, todos, escolhida.condicoes, todos.indexOf(escolhida.alvo), params, rnd);
  }

  // Uma condição conserva o caminho anterior e sua seleção de distratores.
  for (const alvo of shuffle(pool, rnd).slice(0, 8)) {
    const fabricas = shuffle(FABRICAS_POR_TIPO[tipo], rnd);
    const cs: Condicao[] = [];
    for (const f of fabricas) {
      if (cs.length >= nCond) break;
      const c = f(alvo, rnd);
      if (c && !cs.some((x) => x.campo === c.campo) && satisfaz(alvo, c, pool)) cs.push(c);
    }
    if (cs.length !== nCond) continue;

    // só o alvo pode atender a TODAS
    const rivais = pool.filter((pq) => pq !== alvo && atendeTodas(pq, cs, pool));
    if (rivais.length) continue;

    const distratores = escolherDistratores(pool.filter((pq) => pq !== alvo), cs, params, rnd);
    if (!distratores) continue;

    const todos = shuffle([alvo, ...distratores], rnd);
    return finalizar(tipo, todos, cs, todos.indexOf(alvo), params, rnd);
  }
  return null;
}

/** Escolhe N produtos do grupo, aproximando valores quando o parâmetro pedir. */
function escolherProdutos(pool: ProdutoNaQuestao[], params: ParametrosQuestao, rnd: Rnd): ProdutoNaQuestao[] | null {
  if (pool.length < params.nProdutos) return null;
  if (!params.valoresProximos) return shuffle(pool, rnd).slice(0, params.nProdutos);
  const base = pick(pool, rnd);
  const ref = valorNormalizado(base.produto.conteudo);
  const perto = [...pool].sort((a, b) =>
    Math.abs(valorNormalizado(a.produto.conteudo) - ref) - Math.abs(valorNormalizado(b.produto.conteudo) - ref));
  return perto.slice(0, params.nProdutos);
}

/**
 * Para uma condição, conserva a seleção anterior. Para múltiplas condições,
 * garante que nenhum distrator seja resposta e que cada critério tenha cobertura.
 */
function escolherDistratores(
  candidatos: ProdutoNaQuestao[], cs: Condicao[], params: ParametrosQuestao, rnd: Rnd,
): ProdutoNaQuestao[] | null {
  const n = params.nProdutos - 1;
  const comScore = shuffle(candidatos, rnd).map((pq) => ({ pq, k: quantasAtende(pq, cs, candidatos) }));
  if (cs.length === 1) {
    // com uma condição só, todo distrator falha nela — a semelhança vem dos valores
    const escolhidos = comScore.filter((x) => x.k === 0).slice(0, n).map((x) => x.pq);
    return escolhidos.length === n ? escolhidos : null;
  }

  const elegiveis = comScore.filter((x) => x.k < cs.length);
  let resultado: ProdutoNaQuestao[] | null = null;
  function buscar(inicio: number, atuais: ProdutoNaQuestao[]): void {
    if (resultado) return;
    if (atuais.length === n) {
      const cobreTudo = cs.every((c) => atuais.some((pq) => satisfaz(pq, c, candidatos)));
      const altaEmPares = cs.length !== 2 || params.semelhancaDistratores !== "alta"
        || atuais.every((pq) => quantasAtende(pq, cs, candidatos) >= 1);
      if (cobreTudo && altaEmPares) resultado = atuais;
      return;
    }
    for (let i = inicio; i <= elegiveis.length - (n - atuais.length); i++) {
      buscar(i + 1, [...atuais, elegiveis[i].pq]);
      if (resultado) return;
    }
  }
  buscar(0, []);
  return resultado;
}

function camposDoQuadro(
  produtos: ProdutoNaQuestao[], exigidos: CampoKey[], params: ParametrosQuestao, rnd: Rnd,
  proibidos: CampoKey[] = [],
): CampoKey[] {
  const ordemBase: CampoKey[] = ["conteudo", "preco", "validade", "tipo", "conservacao",
    "lactose", "gluten", "acucar", "sabor", "saches", "unidades", "rendimento", "alergenicos", "cacau"];
  // §6: não repetir no quadro o que o TÍTULO já diz ("Gelatina incolor" não precisa de
  // Tipo: incolor). Vale só para campo extra — se a pergunta exige o campo, ele aparece.
  const redundante = (c: CampoKey) => (c === "tipo" || c === "sabor") && produtos.every((pq) => {
    const v = c === "tipo" ? pq.produto.tipo : pq.produto.sabor;
    return !!v && pq.produto.nome.toLowerCase().includes(v.toLowerCase());
  });
  const disponiveis = ordemBase.filter(
    (c) => !exigidos.includes(c) && !proibidos.includes(c) && !redundante(c)
      && produtos.every((pq) => temCampo(pq.produto, c)));
  const extras = (params.ordemCamposVariavel ? shuffle(disponiveis, rnd) : disponiveis)
    .slice(0, Math.max(0, params.nCampos - exigidos.length));
  const todos = [...exigidos.filter((c) => c !== "fraseEmbalagem"), ...extras];
  if (params.ordemCamposVariavel) return shuffle(todos, rnd);
  return ordemBase.filter((c) => todos.includes(c));   // posição previsível nos níveis baixos
}

function finalizar(
  tipo: TipoQuestao, produtos: ProdutoNaQuestao[], cs: Condicao[], correta: number,
  params: ParametrosQuestao, rnd: Rnd,
): Questao | null {
  const exigidos = [...new Set(cs.map(campoDaCondicao))];
  // leitura direta: o campo que a frase revelaria fica FORA do quadro (§9 da Fase 2)
  const proibidos = cs
    .filter((c) => c.campo === "fraseEmbalagem")
    .map((c) => campoReveladoPor(String(c.valor)))
    .filter((c): c is CampoKey => c !== null);
  const camposVisiveis = camposDoQuadro(produtos, exigidos, params, rnd, proibidos);
  const alvo = produtos[correta];
  const pedido = cs.map((c) => c.resumo).join(" · ");
  const ehSituacao = tipo === "situacao";
  const nome = pick(NOMES, rnd);
  const cena = CENAS[alvo.produto.categoria] ?? "está fazendo compras";

  const q: Questao = {
    id: uid(),
    tipo,
    modalidade: ehSituacao ? "situacao" : "quadro",
    pergunta: ehSituacao
      ? (cs.length > 1 ? "Qual produto atende a todas as condições?" : "Qual produto atende ao pedido?")
      : textoPergunta(tipo, cs),
    contexto: ehSituacao ? `${nome} ${cena}.` : undefined,
    pedido: ehSituacao ? pedido : undefined,
    produtos,
    correta,
    condicoes: cs,
    camposVisiveis,
    camposExigidos: exigidos,
    explicacao: `Correto. ${alvo.produto.nome} (${alvo.produto.marca || "sem marca"}) atende: ${
      cs.map((c) => `${labelCampo(c.campo, alvo.produto)} — ${valorCampo(alvo, c.campo)}`).join(" · ")}.`,
    pista: cs.length === 1
      ? `Confira o campo “${labelCampo(cs[0].campo, alvo.produto)}” em cada produto.`
      : `Confira ${juntar(cs.map((c) => `“${labelCampo(c.campo, alvo.produto)}”`))} antes de responder.`,
    categoria: alvo.produto.categoria,
    assinatura: `${tipo}|${cs.map((c) => `${c.campo}:${c.operador}:${c.valor ?? ""}`).join(",")}`,
  };
  return validarQuestao(q) ? q : null;
}

/**
 * Feedback do erro: diz o que a escolha ATENDE e o que NÃO atende, sem entregar a
 * resposta na primeira tentativa (§21/§22). Trabalha sobre as condições reais.
 */
export function explicarErro(q: Questao, escolha: number): string {
  const pq = q.produtos[escolha];
  if (escolha === q.correta) return q.explicacao;
  const nome = pq.produto.nome;
  const { filtrados } = avaliarEmEtapas(q.produtos, q.condicoes);
  const atendeCondicao = (c: Condicao) => satisfaz(pq, c, ehExtremo(c) ? filtrados : q.produtos);
  const ok = q.condicoes.filter(atendeCondicao);
  const falta = q.condicoes.filter((c) => !atendeCondicao(c));
  if (!falta.length) return q.explicacao;
  if (ok.length) {
    return `${nome} ${juntar(ok.map((c) => c.texto))}, mas ${juntar(falta.map((c) => `não ${c.texto}`))}.`;
  }
  const campos = juntar([...new Set(q.condicoes.map((c) => `“${labelCampo(c.campo, pq.produto)}”`))]);
  return `${nome} não atende ao que a pergunta pede. Confira ${campos} em cada produto.`;
}

// ── VALIDAÇÃO OBRIGATÓRIA (§14 da Fase 1) ────────────────────────────────────
export interface FalhaValidacao { motivo: string }

export function motivoInvalidez(q: Questao): string | null {
  if (q.produtos.length < 3 || q.produtos.length > 4) return "nProdutos";
  const ids = q.produtos.map((p) => p.produto.id);
  if (new Set(ids).size !== ids.length) return "produtoRepetido";

  // mesma família semântica e mesma dimensão de unidade
  const fam = FAMILIAS.find((f) => f.includes(q.produtos[0].produto.categoria));
  if (!fam || !q.produtos.every((p) => fam.includes(p.produto.categoria))) return "familiasDiferentes";
  const dims = new Set(q.produtos.map((p) => dimensaoDe(p.produto.conteudo.unidade)));
  if (dims.size !== 1) return "dimensoesIncompativeis";

  // exatamente uma resposta correta, com extremos avaliados só após os filtros
  const { filtrados, atendem: corretos } = avaliarEmEtapas(q.produtos, q.condicoes);
  const temExtremo = q.condicoes.some(ehExtremo);
  const temFiltro = q.condicoes.some((c) => !ehExtremo(c));
  // O filtro precisa FILTRAR: deixar 2+ (senão a comparação não tem o que comparar) e excluir
  // ao menos um (senão é comparação simples com uma frase decorativa na frente — o mesmo defeito
  // que ela apontou nos dois critérios, na forma de filtro). Medido antes desta trava: 43% a 59%
  // das questões tinham filtro que não excluía ninguém.
  if (temExtremo && temFiltro
    && (filtrados.length < 2 || filtrados.length >= q.produtos.length)) return "filtroNaoFiltra";
  if (corretos.length !== 1) return corretos.length === 0 ? "semResposta" : "respostaDupla";
  if (q.produtos[q.correta] !== corretos[0]) return "corretaErrada";

  // Em questões multi-critério, nenhum filtro pode identificar sozinho a resposta.
  // Extremos são excluídos: por definição eles podem deixar um único produto.
  if (q.condicoes.length >= 2 && q.condicoes.filter((c) => !ehExtremo(c)).some(
    (c) => q.produtos.filter((pq) => satisfaz(pq, c, q.produtos)).length < 2,
  )) return "criterioRedundante";

  // campos exigidos visíveis e presentes em todos os produtos
  const exigidosReais = q.camposExigidos.filter((c) => c !== "fraseEmbalagem");
  if (!exigidosReais.every((c) => q.camposVisiveis.includes(c))) return "campoExigidoOculto";
  if (q.camposVisiveis.includes("fraseEmbalagem")) return "fraseNoQuadro";
  for (const c of q.condicoes) {
    if (c.campo !== "fraseEmbalagem") continue;
    const revelado = campoReveladoPor(String(c.valor));
    if (revelado && q.camposVisiveis.includes(revelado)) return "quadroEntregaResposta";
    // só produto autorizado entra nesta modalidade
    if (!q.produtos[q.correta].produto.directPackageReadingEnabled) return "leituraNaoAutorizada";
  }
  if (!q.camposVisiveis.every((c) => q.produtos.every((pq) => temCampo(pq.produto, c)))) return "campoAusenteEmProduto";
  if (q.camposVisiveis.length < 3) return "poucosCampos";

  // nenhum atributo incompatível chegou ao quadro (o catálogo já garante, isto é a rede)
  for (const pq of q.produtos) {
    if (q.camposVisiveis.includes("lactose") && pq.produto.lactose == null) return "lactoseInexistente";
    if (q.camposVisiveis.includes("sabor") && pq.produto.sabor == null) return "saborInexistente";
  }

  // situação do cotidiano tem de descrever os produtos apresentados
  if (q.modalidade === "situacao" && (!q.contexto || !q.pedido)) return "situacaoIncompleta";
  return null;
}

export const validarQuestao = (q: Questao) => motivoInvalidez(q) === null;

// ── Histórico da sessão: regra de NÃO REPETIÇÃO (§13 da Fase 1) ─────────────
export interface RegistroHistorico {
  assinatura: string;
  tipo: TipoQuestao;
  operacao: Operacao;
  campoPrincipal: CampoKey;
  camposChave: string;
  produtoCorreto: string;
  categoria: Categoria;
}

export const registroDe = (q: Questao): RegistroHistorico => ({
  assinatura: q.assinatura,
  tipo: q.tipo,
  operacao: operacaoDaQuestao(q),
  campoPrincipal: q.condicoes[0].campo,
  camposChave: [...q.camposExigidos].sort().join("+"),
  produtoCorreto: q.produtos[q.correta].produto.id,
  categoria: q.categoria,
});

/** Devolve o motivo da recusa, ou null se a questão pode entrar agora. */
export function motivoRepeticao(q: Questao, hist: RegistroHistorico[]): string | null {
  const r = registroDe(q);
  const u3 = hist.slice(-3);
  if (u3.some((h) => h.assinatura === r.assinatura)) return "mesmoTextoNas3";
  if (u3.some((h) => h.camposChave === r.camposChave)) return "mesmosCamposNas3";
  if (hist[hist.length - 1]?.produtoCorreto === r.produtoCorreto) return "mesmoProdutoCorretoSeguido";
  if (hist.length >= 2 && hist.slice(-2).every((h) => h.tipo === r.tipo)) return "tresDoMesmoTipoSeguidas";
  if (hist.length >= 2 && hist.slice(-2).every((h) => h.operacao === r.operacao)) return "tresDaMesmaOperacao";
  if (hist[hist.length - 1]?.operacao === r.operacao) return "mesmaOperacaoSeguida";
  if (hist[hist.length - 1]?.campoPrincipal === r.campoPrincipal) return "mesmoCampoPrincipalSeguido";
  if (hist.length >= 3 && hist.slice(-3).every((h) => h.categoria === r.categoria)) return "categoriaDemais";
  if (hist.filter((h) => h.assinatura === r.assinatura).length >= 2) return "duasIdenticasNaSessao";
  return null;
}

// ── Sessão: gera questões válidas, descartando e regerando o que falhar ─────
export interface RegistroDescarte { tipo: TipoQuestao; motivo: string }

export interface ResultadoGeracao {
  questao: Questao | null;
  descartes: RegistroDescarte[];
}

/**
 * Gera UMA questão do tipo pedido, tentando outros tipos permitidos se o catálogo
 * não sustentar aquele. Devolve também o que foi descartado (para o relatório).
 */
export function gerarQuestao(
  tipoPreferido: TipoQuestao, params: ParametrosQuestao, snapshot: Snapshot,
  rnd: Rnd = Math.random, historico: RegistroHistorico[] = [], tiposPermitidos: TipoQuestao[] = TIPOS_QUESTAO,
): ResultadoGeracao {
  const descartes: RegistroDescarte[] = [];
  const ordem = [tipoPreferido, ...shuffle(tiposPermitidos.filter((t) => t !== tipoPreferido), rnd)];
  for (const tipo of ordem) {
    for (let tentativa = 0; tentativa < 12; tentativa++) {
      const q = montarQuestao({ tipo, params, snapshot, rnd, historico });
      if (q) return { questao: q, descartes };
      descartes.push({ tipo, motivo: "semCombinacaoValida" });
    }
  }
  return { questao: null, descartes };
}
