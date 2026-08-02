// ─────────────────────────────────────────────────────────────────────────────
// Informação em Foco — GERADOR DE QUESTÕES (FASE 1, §8 da spec).
//
// Regra que este módulo existe para cumprir: NENHUM atributo de produto é sorteado.
// A questão escolhe um campo aplicável, filtra os produtos que realmente têm aquele
// campo (com dimensão compatível) e usa os DADOS DO CATÁLOGO. Preço e validade vêm do
// SNAPSHOT da sessão — sorteados uma vez, estáveis do começo ao fim.
//
// Módulo PURO: sem React, sem acesso a disco. Aleatoriedade injetada (rnd) para os
// testes conseguirem repetir o cenário.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CATALOGO_PRODUTOS, dimensaoDe, valorNormalizado, produtoPorId,
  type ProdutoCatalogo, type Categoria, type Conservacao, type Conteudo,
} from "@/data/informacao-foco-catalogo";

// ── Campos exibíveis no quadro funcional ─────────────────────────────────────
export type CampoKey =
  | "conteudo" | "preco" | "validade" | "saches" | "unidades" | "rendimento"
  | "tipo" | "sabor" | "lactose" | "gluten" | "acucar" | "alergenicos"
  | "conservacao" | "cacau";

export type TipoQuestao =
  | "localizacao" | "comparacao" | "duasCondicoes" | "tresCondicoes"
  | "validadeConservacao" | "ingredientesAlergenicos" | "leituraEmbalagem" | "situacao";

export interface Validade { mes: number; ano: number }

/** Preço e validade da sessão — sorteados 1× e estáveis (§4). */
export interface DadosSessao { preco: number; validade: Validade }
export type Snapshot = Record<string, DadosSessao>;

export interface ProdutoNaQuestao {
  produto: ProdutoCatalogo;
  preco: number;
  validade: Validade;
}

export interface Questao {
  id: string;
  tipo: TipoQuestao;
  modalidade: "quadro" | "embalagem" | "situacao";
  pergunta: string;
  contexto?: string;        // situação do cotidiano
  pedido?: string;          // "1 L · Sem lactose · Até R$ 8,00"
  produtos: ProdutoNaQuestao[];
  correta: number;
  camposVisiveis: CampoKey[];
  camposExigidos: CampoKey[];
  explicacao: string;
  pista: string;
  nCondicoes: number;
  categoriaSemantica: Categoria;
}

// ── Aleatoriedade injetável ──────────────────────────────────────────────────
export type Rnd = () => number;
const pick = <T,>(a: readonly T[], rnd: Rnd): T => a[Math.floor(rnd() * a.length)];
function shuffle<T>(a: readonly T[], rnd: Rnd): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
const arredondaPreco = (v: number) => Math.round(v * 2) / 2 - 0.1; // 6,90 / 7,40 / 7,90…

// ── Snapshot da sessão ───────────────────────────────────────────────────────
const MES_BASE = 8, ANO_BASE = 2026;

export function criarSnapshot(rnd: Rnd = Math.random, anoBase = ANO_BASE): Snapshot {
  const snap: Snapshot = {};
  for (const p of CATALOGO_PRODUTOS) {
    const [min, max] = p.precoFaixa;
    const preco = Math.max(0.5, arredondaPreco(min + rnd() * (max - min)));
    // congelado/refrigerado vencem antes; seco dura mais
    const meses = p.conservacao === "congelado" || p.conservacao === "refrigerado"
      ? 1 + Math.floor(rnd() * 6) : 4 + Math.floor(rnd() * 20);
    const total = MES_BASE + meses;
    snap[p.id] = { preco, validade: { mes: ((total - 1) % 12) + 1, ano: anoBase + Math.floor((total - 1) / 12) } };
  }
  return snap;
}

// ── Formatação ───────────────────────────────────────────────────────────────
export const fmtPreco = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
export const fmtConteudo = (c: Conteudo) => `${String(c.valor).replace(".", ",")} ${c.unidade === "saches" ? "sachês" : c.unidade}`;
export const fmtValidade = (v: Validade) => `${String(v.mes).padStart(2, "0")}/${v.ano}`;
export const fmtConservacao = (c: Conservacao) =>
  c === "refrigerado" ? "Manter refrigerado" : c === "congelado" ? "Manter congelado"
  : c === "luz" ? "Conservar ao abrigo da luz" : "Conservar em local seco";

/** Rótulo do campo — "Peso" só para massa, "Volume" só para volume (§5 da Fase 1). */
export function labelCampo(k: CampoKey, p?: ProdutoCatalogo): string {
  if (k === "conteudo") {
    if (!p) return "Conteúdo";
    const d = dimensaoDe(p.conteudo.unidade);
    return d === "massa" ? "Peso" : d === "volume" ? "Volume" : "Quantidade";
  }
  switch (k) {
    case "preco": return "Preço";
    case "validade": return "Validade";
    case "saches": return "Quantidade";
    case "unidades": return "Quantidade";
    case "rendimento": return "Rendimento";
    case "tipo": return "Tipo";
    case "sabor": return "Sabor";
    case "lactose": return "Lactose";
    case "gluten": return "Glúten";
    case "acucar": return "Açúcar";
    case "alergenicos": return "Alérgenos";
    case "conservacao": return "Conservação";
    case "cacau": return "Cacau";
  }
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
    case "alergenicos": return p.alergenicos?.length ? `Contém ${p.alergenicos.join(", ")}` : "—";
    case "conservacao": return p.conservacao ? fmtConservacao(p.conservacao) : "—";
    case "cacau": return p.cacauPct != null ? `${p.cacauPct}%` : "—";
  }
}

/** O produto TEM esse campo? (campo ausente nunca vira pergunta nem valor inventado) */
export function temCampo(p: ProdutoCatalogo, k: CampoKey): boolean {
  switch (k) {
    case "conteudo": case "preco": case "validade": return !p.revisar || k !== "conteudo";
    case "saches": return p.saches != null;
    case "unidades": return p.unidades != null;
    case "rendimento": return p.rendimento != null;
    case "tipo": return p.tipo != null;
    case "sabor": return p.sabor != null;
    case "lactose": return p.lactose != null;
    case "gluten": return p.gluten != null;
    case "acucar": return p.acucarAdicionado != null;
    case "alergenicos": return (p.alergenicos?.length ?? 0) > 0;
    case "conservacao": return p.conservacao != null;
    case "cacau": return p.cacauPct != null;
  }
}

// ── Perfil de dificuldade (a Fase 3 mexe nele; aqui já é a fonte da geração) ──
export interface PerfilDificuldade {
  nivel: number;
  nProdutos: 3 | 4;
  nCampos: number;          // 3 a 6
  nCondicoes: 1 | 2 | 3;
  semelhancaDistratores: "baixa" | "moderada" | "alta";
  ordemCamposVariavel: boolean;
  situacaoLiberada: boolean;
  leituraEmbalagemLiberada: boolean;
}

export const PERFIS: PerfilDificuldade[] = [
  { nivel: 1, nProdutos: 3, nCampos: 3, nCondicoes: 1, semelhancaDistratores: "baixa",     ordemCamposVariavel: false, situacaoLiberada: false, leituraEmbalagemLiberada: false },
  { nivel: 2, nProdutos: 3, nCampos: 4, nCondicoes: 1, semelhancaDistratores: "baixa",     ordemCamposVariavel: false, situacaoLiberada: false, leituraEmbalagemLiberada: false },
  { nivel: 3, nProdutos: 3, nCampos: 4, nCondicoes: 2, semelhancaDistratores: "moderada",  ordemCamposVariavel: false, situacaoLiberada: false, leituraEmbalagemLiberada: false },
  { nivel: 4, nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada",  ordemCamposVariavel: false, situacaoLiberada: true,  leituraEmbalagemLiberada: false },
  { nivel: 5, nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "moderada",  ordemCamposVariavel: true,  situacaoLiberada: true,  leituraEmbalagemLiberada: false },
  { nivel: 6, nProdutos: 4, nCampos: 5, nCondicoes: 2, semelhancaDistratores: "alta",      ordemCamposVariavel: true,  situacaoLiberada: true,  leituraEmbalagemLiberada: true },
  { nivel: 7, nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta",      ordemCamposVariavel: true,  situacaoLiberada: true,  leituraEmbalagemLiberada: true },
  { nivel: 8, nProdutos: 4, nCampos: 6, nCondicoes: 3, semelhancaDistratores: "alta",      ordemCamposVariavel: true,  situacaoLiberada: true,  leituraEmbalagemLiberada: true },
];
export const perfilDoNivel = (n: number) => PERFIS[Math.min(PERFIS.length, Math.max(1, n)) - 1];

// ── Seleção semântica: só produtos comparáveis entram juntos (§11) ───────────
const FAMILIAS: Categoria[][] = [
  ["leites", "bebidas-vegetais"], ["sucos"], ["iogurtes"], ["laticinios"], ["frios"],
  ["biscoitos"], ["paes"], ["cereais"], ["graos-e-massas"], ["farinaceos"],
  ["conservas"], ["congelados"], ["molhos"], ["oleos-e-vinagres"], ["cafes-e-chas"],
  ["acucares-e-adocantes"], ["doces"], ["temperos"], ["pastas"], ["ovos"],
];

function grupoDe(cat: Categoria): Categoria[] {
  return FAMILIAS.find((f) => f.includes(cat)) ?? [cat];
}

/** Produtos comparáveis: mesma família E mesma dimensão de conteúdo. */
function candidatos(campo: CampoKey, rnd: Rnd): ProdutoCatalogo[][] {
  const grupos: ProdutoCatalogo[][] = [];
  for (const fam of FAMILIAS) {
    const doGrupo = CATALOGO_PRODUTOS.filter((p) => fam.includes(p.categoria) && temCampo(p, campo));
    const porDimensao = new Map<string, ProdutoCatalogo[]>();
    for (const p of doGrupo) {
      const d = dimensaoDe(p.conteudo.unidade);
      porDimensao.set(d, [...(porDimensao.get(d) ?? []), p]);
    }
    for (const lista of porDimensao.values()) if (lista.length >= 3) grupos.push(lista);
  }
  return shuffle(grupos, rnd);
}

let seq = 0;
const uid = () => `q${++seq}`;

const emQuestao = (p: ProdutoCatalogo, snap: Snapshot): ProdutoNaQuestao =>
  ({ produto: p, preco: snap[p.id].preco, validade: snap[p.id].validade });

/** Preenche os campos visíveis: os exigidos + preenchimento plausível do próprio produto. */
function camposVisiveis(exigidos: CampoKey[], grupo: ProdutoCatalogo[], perfil: PerfilDificuldade, rnd: Rnd): CampoKey[] {
  const comuns: CampoKey[] = ["conteudo", "preco", "validade", "tipo", "conservacao", "lactose", "gluten", "acucar", "sabor", "saches", "unidades", "rendimento", "alergenicos", "cacau"];
  const extras = comuns.filter((c) => !exigidos.includes(c) && grupo.every((p) => temCampo(p, c)));
  const ordem = perfil.ordemCamposVariavel ? shuffle(extras, rnd) : extras;
  const fora = ordem.slice(0, Math.max(0, perfil.nCampos - exigidos.length));
  const todos = [...exigidos, ...fora];
  // ordem estável nos níveis baixos: conteúdo → preço → validade → resto
  const prioridade = (c: CampoKey) => ["conteudo", "preco", "validade"].indexOf(c);
  return perfil.ordemCamposVariavel ? todos : [...todos].sort((a, b) => (prioridade(a) + 9) % 12 - (prioridade(b) + 9) % 12);
}
