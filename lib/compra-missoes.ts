// ─────────────────────────────────────────────────────────────────────────────
// Compra Multifuncional — MISSÕES MATEMÁTICAS PROGRESSIVAS (motor puro)
// (COMPRA-MULTIFUNCIONAL-MISSOES-SPEC.md, Kamylla 20/jul/2026).
//
// Uma missão = história contínua (personagem + tema) com etapas que aumentam a
// dificuldade UM conceito por vez. Dois modos de resposta: DIGITAR o resultado
// (conta pura) ou SELECIONAR itens respeitando regras. O app NUNCA faz a conta
// pelo jogador durante a tentativa — só verifica e explica DEPOIS de confirmar,
// com dicas em 3 níveis. Toda etapa de seleção tem solução garantida (semeada).
//
// Módulo PURO e testável (sem React). Usa o catálogo real `data/compra-itens.ts`.
// ─────────────────────────────────────────────────────────────────────────────

import { ITENS_POR_CAT, CATEGORIA_LABEL, itemById, type ItemCompra, type Categoria } from "@/data/compra-itens";

export type Operacao = "soma" | "subtracao" | "multiplicacao" | "divisao";
export type OperacaoFoco = Operacao | "tudo";
export type TemaKey = "piquenique" | "praia" | "frio" | "alimentos" | "mercado" | "objetos";
export type TemaConfig = TemaKey | "variado";

export const OP_FOCO_LABEL: Record<OperacaoFoco, string> = {
  tudo: "Missão completa (treina tudo)",
  soma: "Soma", subtracao: "Subtração", multiplicacao: "Multiplicação", divisao: "Divisão",
};
export const TEMA_LABEL: Record<TemaConfig, string> = {
  variado: "Variado", piquenique: "Piquenique", praia: "Praia", frio: "Frio / neve",
  alimentos: "Refeição em família", mercado: "Mercado", objetos: "Organizar objetos",
};

// ── Regras (etapas de SELEÇÃO) ────────────────────────────────────────────────
export type Regra =
  | { kind: "qtdExata"; n: number }
  | { kind: "catMin"; cat: Categoria; n: number }
  | { kind: "itemObrigatorio"; id: string }
  | { kind: "orcamentoMax"; max: number }
  | { kind: "pesoMax"; max: number };

export type Unidade = "money" | "count" | "kg";

// Como desenhar a cena de uma etapa NUMÉRICA (o componente decide o visual).
export type NumRender =
  | { tipo: "soma"; parcelas: { emoji: string; name: string; valor: number }[]; unidade: "money" | "kg" }
  | { tipo: "troco"; had: number; spent: number }
  | { tipo: "mult"; emoji: string; name: string; qtd: number; unitPrice: number }
  | { tipo: "divisao"; emoji: string; name: string; total: number; partes: number };

export interface EtapaNumerica {
  modo: "numeric";
  unidade: Unidade;
  respostaCorreta: number;
  render: NumRender;
  sinal: "+" | "-" | "×" | "÷";
  operandos: number[];      // números da conta (p/ a dica do 3º erro)
}

export interface EtapaSelecao {
  modo: "select";
  pool: ItemCompra[];
  regras: Regra[];
  solucao: string[];        // ids de UMA solução válida (interno; nunca exibido na tentativa)
}

export interface Etapa {
  index: number;
  conceito: string;
  operacao: Operacao;
  historia: string;
  objetivo: string;
  instrucao: string;
  dados: EtapaNumerica | EtapaSelecao;
  temCronometro: boolean;
}

export interface Missao {
  tema: TemaKey;
  personagem: string;
  titulo: string;
  nivel: number;
  etapas: Etapa[];
}

// ── Utilitários ───────────────────────────────────────────────────────────────
const ri = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
const money = (v: number) => `R$ ${v}`;
const somaPreco = (its: ItemCompra[]) => its.reduce((s, i) => s + i.price, 0);
const somaPeso = (its: ItemCompra[]) => its.reduce((s, i) => s + i.weight, 0);

// combinações de tamanho n de um array (arrays pequenos: pool ≤ ~10)
function combinacoes<T>(arr: T[], n: number): T[][] {
  if (n === 0) return [[]];
  if (n > arr.length) return [];
  const [head, ...rest] = arr;
  const com = combinacoes(rest, n - 1).map((c) => [head, ...c]);
  const sem = combinacoes(rest, n);
  return [...com, ...sem];
}

// ── Temas: personagem + categorias usadas ─────────────────────────────────────
interface TemaDef { personagem: string; titulo: string; cats: Categoria[]; objetos: Categoria; }
const TEMAS: Record<TemaKey, TemaDef> = {
  piquenique: { personagem: "Lia", titulo: "Piquenique no parque", cats: ["alimento", "fruta", "bebida"], objetos: "objeto" },
  praia:      { personagem: "Beto", titulo: "Viagem para a praia", cats: ["praia", "bebida"], objetos: "objeto" },
  frio:       { personagem: "Nina", titulo: "Viagem para o frio", cats: ["frio", "bebida"], objetos: "objeto" },
  alimentos:  { personagem: "Dona Rosa", titulo: "Almoço em família", cats: ["alimento", "legume", "fruta"], objetos: "objeto" },
  mercado:    { personagem: "Téo", titulo: "Compras no mercado", cats: ["alimento", "fruta", "bebida", "higiene"], objetos: "objeto" },
  objetos:    { personagem: "Caco", titulo: "Organizando a mochila", cats: ["escolar", "objeto"], objetos: "objeto" },
};

const TEMAS_KEYS = Object.keys(TEMAS) as TemaKey[];

function poolDe(cats: Categoria[]): ItemCompra[] {
  return cats.flatMap((c) => ITENS_POR_CAT[c] ?? []);
}

// ── Geradores de etapa ────────────────────────────────────────────────────────
// magnitude cresce com o nível: números maiores, menos folga, mais distratores.

function etSomaN(nome: string, personagem: string, pool: ItemCompra[], n: number, idx: number): Etapa {
  const its = shuffle(pool).slice(0, n);
  const resposta = somaPreco(its);
  const lista = its.map((i) => `${i.name} (${money(i.price)})`).join(", ");
  return {
    index: idx, conceito: "soma", operacao: "soma",
    historia: `${personagem} começou as compras.`,
    objetivo: `Somar ${n} preços.`,
    instrucao: `${personagem} vai comprar: ${lista}. Quanto vai gastar no total?`,
    dados: {
      modo: "numeric", unidade: "money", respostaCorreta: resposta,
      render: { tipo: "soma", parcelas: its.map((i) => ({ emoji: i.emoji, name: i.name, valor: i.price })), unidade: "money" },
      sinal: "+", operandos: its.map((i) => i.price),
    },
    temCronometro: false,
  };
}

function etTroco(personagem: string, pool: ItemCompra[], nivel: number, idx: number): Etapa {
  const notas = nivel <= 2 ? [20, 30] : nivel <= 4 ? [50, 100] : [100, 200];
  const had = pick(notas);
  const spent = ri(Math.max(3, Math.round(had * 0.3)), had - 2);
  const resposta = had - spent;
  return {
    index: idx, conceito: "troco", operacao: "subtracao",
    historia: `${personagem} pagou as compras.`,
    objetivo: "Calcular o troco (subtração).",
    instrucao: `${personagem} tinha ${money(had)} e gastou ${money(spent)}. Quanto sobrou de troco?`,
    dados: {
      modo: "numeric", unidade: "money", respostaCorreta: resposta,
      render: { tipo: "troco", had, spent },
      sinal: "-", operandos: [had, spent],
    },
    temCronometro: false,
  };
}

function etMultiplicacao(personagem: string, pool: ItemCompra[], nivel: number, idx: number): Etapa {
  const barato = shuffle(pool).sort((a, b) => a.price - b.price)[0] ?? pick(pool);
  const it = barato.price <= 8 ? barato : pick(pool);
  const qtd = nivel <= 2 ? ri(2, 5) : nivel <= 4 ? ri(3, 8) : ri(4, 10);
  const resposta = qtd * it.price;
  return {
    index: idx, conceito: "multiplicacao", operacao: "multiplicacao",
    historia: `${personagem} precisa de vários iguais.`,
    objetivo: "Multiplicação (tabuada).",
    instrucao: `${personagem} vai levar ${qtd} ${plural(it)} de ${money(it.price)} cada. Quanto vai pagar no total?`,
    dados: {
      modo: "numeric", unidade: "money", respostaCorreta: resposta,
      render: { tipo: "mult", emoji: it.emoji, name: it.name, qtd, unitPrice: it.price },
      sinal: "×", operandos: [qtd, it.price],
    },
    temCronometro: false,
  };
}

function etDivisao(personagem: string, pool: ItemCompra[], nivel: number, idx: number): Etapa {
  const fruta = ITENS_POR_CAT.fruta[0];
  const partes = nivel <= 2 ? ri(2, 3) : nivel <= 4 ? ri(2, 5) : ri(3, 6);
  const cada = nivel <= 2 ? ri(2, 5) : ri(2, 8);
  const total = partes * cada;
  const it = pool.find((i) => i.cat === "fruta") ?? fruta;
  return {
    index: idx, conceito: "divisao", operacao: "divisao",
    historia: `${personagem} vai repartir igualmente.`,
    objetivo: "Divisão exata.",
    instrucao: `${personagem} tem ${total} ${plural(it)} para dividir igualmente entre ${partes} pessoas. Quantas cada pessoa recebe?`,
    dados: {
      modo: "numeric", unidade: "count", respostaCorreta: cada,
      render: { tipo: "divisao", emoji: it.emoji, name: it.name, total, partes },
      sinal: "÷", operandos: [total, partes],
    },
    temCronometro: false,
  };
}

function etPesoSoma(personagem: string, pool: ItemCompra[], idx: number): Etapa {
  const its = shuffle(pool).slice(0, 3);
  const resposta = somaPeso(its);
  const lista = its.map((i) => `${i.name} (${i.weight} kg)`).join(", ");
  return {
    index: idx, conceito: "peso-soma", operacao: "soma",
    historia: `${personagem} está pesando a cesta.`,
    objetivo: "Somar pesos.",
    instrucao: `${personagem} colocou na cesta: ${lista}. Quanto pesa tudo junto?`,
    dados: {
      modo: "numeric", unidade: "kg", respostaCorreta: resposta,
      render: { tipo: "soma", parcelas: its.map((i) => ({ emoji: i.emoji, name: i.name, valor: i.weight })), unidade: "kg" },
      sinal: "+", operandos: its.map((i) => i.weight),
    },
    temCronometro: false,
  };
}

function etPesoRestante(personagem: string, nivel: number, idx: number): Etapa {
  const limite = nivel <= 3 ? ri(6, 10) : ri(10, 20);
  const usado = ri(2, limite - 2);
  const resposta = limite - usado;
  return {
    index: idx, conceito: "peso-restante", operacao: "subtracao",
    historia: `${personagem} confere o espaço da cesta.`,
    objetivo: "Subtração com peso.",
    instrucao: `A cesta suporta ${limite} kg e já tem ${usado} kg. Quantos kg ainda cabem?`,
    dados: {
      modo: "numeric", unidade: "kg", respostaCorreta: resposta,
      render: { tipo: "troco", had: limite, spent: usado },
      sinal: "-", operandos: [limite, usado],
    },
    temCronometro: false,
  };
}

// ── Etapas de SELEÇÃO (solução semeada → sempre solúvel) ──────────────────────

/** Semeia `n` itens do pool respeitando categorias obrigatórias e devolve os ids. */
function semearSolucao(pool: ItemCompra[], n: number, obrig: { cat: Categoria; n: number }[]): ItemCompra[] | null {
  const chosen: ItemCompra[] = [];
  const usados = new Set<string>();
  for (const req of obrig) {
    const cands = shuffle(pool.filter((i) => i.cat === req.cat && !usados.has(i.id)));
    if (cands.length < req.n) return null;
    for (let k = 0; k < req.n; k++) { chosen.push(cands[k]); usados.add(cands[k].id); }
  }
  const resto = shuffle(pool.filter((i) => !usados.has(i.id)));
  while (chosen.length < n && resto.length) { const it = resto.shift()!; chosen.push(it); usados.add(it.id); }
  return chosen.length === n ? chosen : null;
}

function montarPoolComDistratores(solucao: ItemCompra[], base: ItemCompra[], total: number): ItemCompra[] {
  const ids = new Set(solucao.map((i) => i.id));
  const distratores = shuffle(base.filter((i) => !ids.has(i.id)));
  const pool = [...solucao, ...distratores.slice(0, Math.max(0, total - solucao.length))];
  return shuffle(pool);
}

function etOrcamento(personagem: string, base: ItemCompra[], nivel: number, idx: number): Etapa {
  const n = 3;
  // Categoria obrigatória só se existir no tema (praia/frio/objetos não têm fruta).
  const catObrig: Categoria | null = base.some((i) => i.cat === "fruta") ? "fruta"
    : base.some((i) => i.cat === "bebida") ? "bebida" : null;
  const obrig = catObrig ? [{ cat: catObrig, n: 1 }] : [];
  const solItens = semearSolucao(base, n, obrig) ?? shuffle(base).slice(0, n);
  const slack = nivel <= 3 ? ri(4, 8) : ri(1, 4);
  const orcamento = somaPreco(solItens) + slack;
  const pool = montarPoolComDistratores(solItens, base, Math.min(base.length, nivel <= 3 ? 5 : 6));
  const regras: Regra[] = [{ kind: "qtdExata", n }];
  if (catObrig) regras.push({ kind: "catMin", cat: catObrig, n: 1 });
  regras.push({ kind: "orcamentoMax", max: orcamento });
  const extra = catObrig ? `, inclua pelo menos 1 ${CATEGORIA_LABEL[catObrig].sing},` : "";
  return {
    index: idx, conceito: "orcamento", operacao: "soma",
    historia: `${personagem} tem um limite de dinheiro.`,
    objetivo: "Somar e comparar com o orçamento.",
    instrucao: `Escolha exatamente ${n} itens${extra} e não passe de ${money(orcamento)}.`,
    dados: { modo: "select", pool, regras, solucao: solItens.map((i) => i.id) },
    temCronometro: false,
  };
}

function etPesoEscolha(personagem: string, objPool: ItemCompra[], nivel: number, idx: number): Etapa {
  const n = 2;
  const solItens = shuffle(objPool).slice(0, n);
  const slack = nivel <= 3 ? ri(1, 2) : 0;
  const limite = somaPeso(solItens) + slack;
  const pool = montarPoolComDistratores(solItens, objPool, Math.min(objPool.length, 5));
  return {
    index: idx, conceito: "peso-escolha", operacao: "soma",
    historia: `${personagem} controla o peso da cesta.`,
    objetivo: "Somar pesos e comparar com o limite.",
    instrucao: `Escolha exatamente ${n} objetos com peso total de no máximo ${limite} kg.`,
    dados: {
      modo: "select", pool,
      regras: [{ kind: "qtdExata", n }, { kind: "pesoMax", max: limite }],
      solucao: solItens.map((i) => i.id),
    },
    temCronometro: false,
  };
}

function etPrecoEPeso(personagem: string, base: ItemCompra[], nivel: number, idx: number, cronometro: boolean): Etapa {
  const n = 2;
  const solItens = shuffle(base).slice(0, n);
  const orcamento = somaPreco(solItens) + (nivel <= 4 ? ri(3, 6) : ri(0, 3));
  const limitePeso = somaPeso(solItens) + (nivel <= 4 ? ri(1, 2) : 0);
  const pool = montarPoolComDistratores(solItens, base, Math.min(base.length, 6));
  return {
    index: idx, conceito: "preco-e-peso", operacao: "soma",
    historia: `${personagem} precisa controlar dinheiro E peso.`,
    objetivo: "Duas restrições ao mesmo tempo.",
    instrucao: `Escolha exatamente ${n} itens: no máximo ${money(orcamento)} e no máximo ${limitePeso} kg.`,
    dados: {
      modo: "select", pool,
      regras: [{ kind: "qtdExata", n }, { kind: "orcamentoMax", max: orcamento }, { kind: "pesoMax", max: limitePeso }],
      solucao: solItens.map((i) => i.id),
    },
    temCronometro: cronometro,
  };
}

function etMultifuncional(personagem: string, base: ItemCompra[], nivel: number, idx: number, cronometro: boolean): Etapa {
  const n = 4;
  const obrig: { cat: Categoria; n: number }[] = [];
  if (base.some((i) => i.cat === "fruta")) obrig.push({ cat: "fruta", n: 1 });
  if (base.some((i) => i.cat === "bebida")) obrig.push({ cat: "bebida", n: 1 });
  const sol = semearSolucao(base, n, obrig) ?? semearSolucao(base, n, []);
  const solItens = sol ?? shuffle(base).slice(0, n);
  const orcamento = somaPreco(solItens) + (nivel <= 5 ? ri(4, 8) : ri(1, 4));
  const limitePeso = somaPeso(solItens) + (nivel <= 5 ? ri(1, 3) : ri(0, 1));
  const pool = montarPoolComDistratores(solItens, base, Math.min(base.length, 7));
  const regras: Regra[] = [{ kind: "qtdExata", n }];
  for (const o of obrig) regras.push({ kind: "catMin", cat: o.cat, n: o.n });
  regras.push({ kind: "orcamentoMax", max: orcamento }, { kind: "pesoMax", max: limitePeso });
  const extras = obrig.map((o) => `1 ${CATEGORIA_LABEL[o.cat].sing}`).join(", ");
  return {
    index: idx, conceito: "multifuncional", operacao: "soma",
    historia: `${personagem} vai finalizar respeitando tudo.`,
    objetivo: "Várias restrições juntas.",
    instrucao: `Escolha exatamente ${n} itens${extras ? ` (inclua ${extras})` : ""}, no máximo ${money(orcamento)} e no máximo ${limitePeso} kg.`,
    dados: {
      modo: "select", pool, regras,
      solucao: solItens.map((i) => i.id),
    },
    temCronometro: cronometro,
  };
}

function plural(it: ItemCompra): string {
  // nome do item no plural simples (bom o bastante para "3 maçãs", "5 águas")
  return it.name.endsWith("s") ? it.name : `${it.name}s`;
}

// ── Montagem da missão ────────────────────────────────────────────────────────

export function resolverTema(cfg: TemaConfig): TemaKey {
  return cfg === "variado" ? pick(TEMAS_KEYS) : cfg;
}

/** Constrói uma missão completa (história contínua) para o tema/nível/foco. */
export function buildMissao(temaCfg: TemaConfig, nivel: number, foco: OperacaoFoco): Missao {
  const tema = resolverTema(temaCfg);
  const def = TEMAS[tema];
  const p = def.personagem;
  const base = poolDe(def.cats);
  const objPool = poolDe([def.objetos]).length >= 4 ? poolDe([def.objetos]) : poolDe(["objeto"]);
  const lv = Math.max(1, Math.min(8, Math.round(nivel)));
  const cronometro = lv >= 6;

  let etapas: Etapa[] = [];
  if (foco === "tudo") {
    // Escada completa (spec §Etapa 1..11), escalada pelo nível.
    etapas = [
      etSomaN("soma2", p, base, 2, 0),
      etSomaN("soma3", p, base, 3, 1),
      etTroco(p, base, lv, 2),
      etOrcamento(p, base, lv, 3),
      etMultiplicacao(p, base, lv, 4),
      etDivisao(p, base, lv, 5),
      etPesoSoma(p, base, 6),
      etPesoRestante(p, lv, 7),
      etPesoEscolha(p, objPool, lv, 8),
      etPrecoEPeso(p, base, lv, 9, cronometro),
      etMultifuncional(p, base, lv, 10, cronometro),
    ];
  } else {
    // Foco numa operação: várias etapas dessa operação, crescendo.
    const g: () => Etapa = () => {
      const i = etapas.length;
      if (foco === "soma") return i % 2 === 0 ? etSomaN("soma", p, base, Math.min(2 + Math.floor(i / 2), 4), i) : etOrcamento(p, base, lv, i);
      if (foco === "subtracao") return i % 2 === 0 ? etTroco(p, base, lv, i) : etPesoRestante(p, lv, i);
      if (foco === "multiplicacao") return etMultiplicacao(p, base, lv + Math.floor(i / 3), i);
      return etDivisao(p, base, lv + Math.floor(i / 3), i); // divisao
    };
    etapas = Array.from({ length: 8 }, g).map((e, i) => ({ ...e, index: i }));
  }
  return { tema, personagem: p, titulo: def.titulo, nivel: lv, etapas };
}

// ── Verificação (SÓ depois de confirmar) ──────────────────────────────────────

export function regraLabel(r: Regra): string {
  switch (r.kind) {
    case "qtdExata": return `Escolha exatamente ${r.n} ${r.n === 1 ? "item" : "itens"}`;
    case "catMin": return `Inclua pelo menos ${r.n} ${r.n === 1 ? CATEGORIA_LABEL[r.cat].sing : CATEGORIA_LABEL[r.cat].plural}`;
    case "itemObrigatorio": return `Inclua ${itemById(r.id)?.name ?? r.id}`;
    case "orcamentoMax": return `Não passe de ${money(r.max)}`;
    case "pesoMax": return `Peso total de no máximo ${r.max} kg`;
  }
}

export function regraOk(r: Regra, sel: ItemCompra[]): boolean {
  switch (r.kind) {
    case "qtdExata": return sel.length === r.n;
    case "catMin": return sel.filter((i) => i.cat === r.cat).length >= r.n;
    case "itemObrigatorio": return sel.some((i) => i.id === r.id);
    case "orcamentoMax": return somaPreco(sel) <= r.max;
    case "pesoMax": return somaPeso(sel) <= r.max;
  }
}

export type ErroTipo = "quantidade" | "categoria" | "orcamento" | "peso" | "valor" | null;

export interface VerificacaoSelecao {
  correto: boolean;
  regras: { regra: Regra; ok: boolean; label: string }[];
  erroTipo: ErroTipo;
}

export function verificarSelecao(etapa: EtapaSelecao, selectedIds: string[]): VerificacaoSelecao {
  const sel = selectedIds.map(itemById).filter((x): x is ItemCompra => !!x);
  const regras = etapa.regras.map((r) => ({ regra: r, ok: regraOk(r, sel), label: regraLabel(r) }));
  const correto = regras.every((r) => r.ok);
  let erroTipo: ErroTipo = null;
  const falha = regras.find((r) => !r.ok);
  if (falha) {
    erroTipo = falha.regra.kind === "qtdExata" ? "quantidade"
      : falha.regra.kind === "orcamentoMax" ? "orcamento"
      : falha.regra.kind === "pesoMax" ? "peso" : "categoria";
  }
  return { correto, regras, erroTipo };
}

export function verificarNumerica(etapa: EtapaNumerica, resposta: number): boolean {
  return resposta === etapa.respostaCorreta;
}

// ── Feedback progressivo (dicas em 3 níveis) ──────────────────────────────────

const OP_VERBO: Record<Etapa["operacao"], string> = {
  soma: "some os valores", subtracao: "subtraia um valor do outro",
  multiplicacao: "multiplique a quantidade pelo preço de uma unidade", divisao: "divida o total pelo número de partes",
};

export interface Feedback { titulo: string; linhas: string[]; }

function fmtUnidade(v: number, u: Unidade): string {
  return u === "money" ? money(v) : u === "kg" ? `${v} kg` : `${v}`;
}

/** Feedback da etapa NUMÉRICA. tentativa = nº de erros já cometidos nesta etapa (1,2,3+). */
export function feedbackNumerica(etapa: EtapaNumerica, correto: boolean, tentativa: number): Feedback {
  if (correto) {
    const conta = etapa.operandos.join(` ${etapa.sinal} `);
    return { titulo: "Correto!", linhas: [`${conta} = ${fmtUnidade(etapa.respostaCorreta, etapa.unidade)}.`] };
  }
  if (tentativa <= 1) return { titulo: "Ainda não", linhas: ["O valor informado não está correto. Refaça a conta com calma."] };
  if (tentativa === 2) {
    const dica = etapa.sinal === "+" ? "Some todos os valores."
      : etapa.sinal === "-" ? "Subtraia o segundo valor do primeiro."
      : etapa.sinal === "×" ? "Multiplique a quantidade pelo preço de uma unidade."
      : "Divida o total pelo número de partes.";
    return { titulo: "Quase lá", linhas: [dica] };
  }
  const conta = etapa.operandos.join(` ${etapa.sinal} `);
  return { titulo: "Veja a conta", linhas: [`A conta é ${conta} = ${fmtUnidade(etapa.respostaCorreta, etapa.unidade)}.`] };
}

/** Feedback da etapa de SELEÇÃO. */
export function feedbackSelecao(etapa: EtapaSelecao, selectedIds: string[], tentativa: number): Feedback {
  const v = verificarSelecao(etapa, selectedIds);
  const sel = selectedIds.map(itemById).filter((x): x is ItemCompra => !!x);
  if (v.correto) {
    const preco = somaPreco(sel), peso = somaPeso(sel);
    const partes: string[] = [`Você escolheu ${sel.length} ${sel.length === 1 ? "item" : "itens"}.`];
    if (etapa.regras.some((r) => r.kind === "orcamentoMax")) partes.push(`Total ${money(preco)}.`);
    if (etapa.regras.some((r) => r.kind === "pesoMax")) partes.push(`Peso ${peso} kg.`);
    return { titulo: "Compra válida!", linhas: [partes.join(" "), "Todas as regras foram cumpridas."] };
  }
  const faltou = v.regras.filter((r) => !r.ok);
  if (tentativa <= 1) {
    // 1º erro: só QUAIS regras falharam (sem revelar a conta).
    return { titulo: "Ainda não", linhas: faltou.map((r) => `✗ ${r.label}.`) };
  }
  if (tentativa === 2) {
    // 2º erro: QUAL operação fazer.
    const linhas: string[] = [];
    if (faltou.some((r) => r.regra.kind === "orcamentoMax")) linhas.push("Some os preços dos itens escolhidos e compare com o orçamento.");
    if (faltou.some((r) => r.regra.kind === "pesoMax")) linhas.push("Some os pesos dos itens escolhidos e compare com o limite.");
    if (faltou.some((r) => r.regra.kind === "qtdExata")) linhas.push("Confira quantos itens você selecionou.");
    if (faltou.some((r) => r.regra.kind === "catMin")) linhas.push("Confira se incluiu as categorias pedidas.");
    return { titulo: "Quase lá", linhas };
  }
  // 3º erro: a conta feita com a seleção atual.
  const linhas: string[] = [];
  const orc = etapa.regras.find((r): r is Extract<Regra, { kind: "orcamentoMax" }> => r.kind === "orcamentoMax");
  const pmax = etapa.regras.find((r): r is Extract<Regra, { kind: "pesoMax" }> => r.kind === "pesoMax");
  if (orc && somaPreco(sel) > orc.max) {
    linhas.push(`Seus itens somam ${sel.map((i) => money(i.price)).join(" + ")} = ${money(somaPreco(sel))}, acima de ${money(orc.max)}.`);
  }
  if (pmax && somaPeso(sel) > pmax.max) {
    linhas.push(`Seus itens pesam ${sel.map((i) => `${i.weight}`).join(" + ")} = ${somaPeso(sel)} kg, acima de ${pmax.max} kg.`);
  }
  if (!linhas.length) linhas.push(...faltou.map((r) => `✗ ${r.label}.`));
  if (tentativa >= 4) {
    const solNames = etapa.solucao.map((id) => itemById(id)?.name ?? id).join(", ");
    linhas.push(`Uma combinação que funciona: ${solNames}.`);
  }
  return { titulo: "Veja a conta", linhas };
}
