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
  | "localizacao" | "comparacao" | "duasCondicoes" | "tresCondicoes"
  | "validade" | "conservacao" | "ingredientes" | "alergenicos" | "situacao"
  | "leituraEmbalagem";

export const TIPOS_QUESTAO: TipoQuestao[] = [
  "localizacao", "comparacao", "duasCondicoes", "tresCondicoes",
  "validade", "conservacao", "ingredientes", "alergenicos", "situacao", "leituraEmbalagem",
];

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

/**
 * Composição da sessão (§16/§17 da Fase 2): a cada 10 atividades, ~7 leem o quadro
 * funcional, ~2 são situação do cotidiano e ~1 é leitura direta da embalagem.
 * Isto é DISTRIBUIÇÃO de modalidade, não peso de dificuldade: dentro da modalidade os
 * tipos entram por rodízio, sem sorteio ponderado.
 */
export type Modalidade = "quadro" | "situacao" | "embalagem";
const PADRAO_MODALIDADES: Modalidade[] = [
  "quadro", "quadro", "situacao", "quadro", "quadro",
  "embalagem", "quadro", "situacao", "quadro", "quadro",
];

/** Modalidade da atividade `indice` (0-based), respeitando o que o nível liberou. */
export function modalidadeDaAtividade(indice: number, nivel: number): Modalidade {
  const m = PADRAO_MODALIDADES[indice % PADRAO_MODALIDADES.length];
  if (m === "situacao" && nivel < 5) return "quadro";
  if (m === "embalagem" && nivel < 6) return "quadro";
  return m;
}

/** Tipo da atividade: modalidade decide o "onde ler"; o rodízio decide o "o quê". */
export function tipoDaAtividade(indice: number, nivel: number): TipoQuestao {
  const m = modalidadeDaAtividade(indice, nivel);
  if (m === "situacao") return "situacao";
  if (m === "embalagem") return "leituraEmbalagem";
  const doQuadro = tiposDoNivel(nivel).filter((t) => t !== "situacao" && t !== "leituraEmbalagem");
  return doQuadro[indice % doQuadro.length];
}

/** Tipos liberados por nível — carga, não peso: nada de sorteio ponderado. */
export function tiposDoNivel(n: number): TipoQuestao[] {
  const base: TipoQuestao[] = ["localizacao", "comparacao"];
  if (n >= 3) base.push("duasCondicoes", "validade", "conservacao", "ingredientes", "alergenicos");
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

function textoPergunta(tipo: TipoQuestao, cs: Condicao[]): string {
  const lista = juntar(cs.map((c) => c.texto));
  if (tipo === "situacao") return "Qual produto atende ao pedido?";
  if (tipo === "leituraEmbalagem") return `Olhe as embalagens: qual produto ${lista}?`;
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

  // ── comparação: a resposta é o extremo, não uma condição sobre valor fixo ──
  if (tipo === "comparacao") {
    const campo = exigidosDoTipo[0];
    const extremo = rnd() < 0.5 ? "minimo" : "maximo";
    const texto = campo === "preco" ? (extremo === "minimo" ? "tem o menor preço" : "tem o maior preço")
      : campo === "validade" ? (extremo === "minimo" ? "vence primeiro" : "tem a validade mais longa")
      : (extremo === "minimo" ? "tem a menor quantidade" : "tem a maior quantidade");
    const escolhidos = escolherProdutos(pool, params, rnd);
    if (!escolhidos) return null;
    const cond: Condicao = { campo, operador: extremo, texto, resumo: texto.charAt(0).toUpperCase() + texto.slice(1) };
    const vencedores = escolhidos.filter((pq) => satisfaz(pq, cond, escolhidos));
    if (vencedores.length !== 1) return null;
    return finalizar(tipo, escolhidos, [cond], escolhidos.indexOf(vencedores[0]), params, rnd);
  }

  // ── demais tipos: condições construídas a partir de um ALVO real ──────────
  const nCond = tipo === "tresCondicoes" ? 3
    : tipo === "duasCondicoes" ? 2
    : tipo === "situacao" ? Math.min(params.nCondicoes, 3)
    : 1;

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
 * Distratores conforme a semelhança pedida (§16 da Fase 2 / dimensão D da Fase 3):
 * baixa = falham em tudo · moderada = um atende a uma condição · alta = todos atendem a ≥1.
 */
function escolherDistratores(
  candidatos: ProdutoNaQuestao[], cs: Condicao[], params: ParametrosQuestao, rnd: Rnd,
): ProdutoNaQuestao[] | null {
  const n = params.nProdutos - 1;
  const comScore = shuffle(candidatos, rnd).map((pq) => ({ pq, k: quantasAtende(pq, cs, candidatos) }));
  const parciais = comScore.filter((x) => x.k >= 1 && x.k < cs.length);
  const zerados = comScore.filter((x) => x.k === 0);

  let escolhidos: ProdutoNaQuestao[];
  if (cs.length === 1) {
    // com uma condição só, todo distrator falha nela — a semelhança vem dos valores
    escolhidos = comScore.filter((x) => x.k === 0).slice(0, n).map((x) => x.pq);
  } else if (params.semelhancaDistratores === "alta") {
    if (parciais.length < n) return null;
    escolhidos = parciais.slice(0, n).map((x) => x.pq);
  } else if (params.semelhancaDistratores === "moderada") {
    if (!parciais.length || zerados.length < n - 1) return null;
    escolhidos = [parciais[0].pq, ...zerados.slice(0, n - 1).map((x) => x.pq)];
  } else {
    if (zerados.length < n) return null;
    escolhidos = zerados.slice(0, n).map((x) => x.pq);
  }
  return escolhidos.length === n ? escolhidos : null;
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
  const ok = q.condicoes.filter((c) => satisfaz(pq, c, q.produtos));
  const falta = q.condicoes.filter((c) => !satisfaz(pq, c, q.produtos));
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

  // exatamente uma resposta correta
  const corretos = q.produtos.filter((pq) => atendeTodas(pq, q.condicoes, q.produtos));
  if (corretos.length !== 1) return corretos.length === 0 ? "semResposta" : "respostaDupla";
  if (q.produtos[q.correta] !== corretos[0]) return "corretaErrada";

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
  camposChave: string;
  produtoCorreto: string;
  categoria: Categoria;
}

export const registroDe = (q: Questao): RegistroHistorico => ({
  assinatura: q.assinatura,
  tipo: q.tipo,
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
