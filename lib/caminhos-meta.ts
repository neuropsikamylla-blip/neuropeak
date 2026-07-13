// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — MOTOR DE CORREÇÃO (puro, sem React)
//
// Implementa as regras de correção da spec (seções 8, 9, 10, 18):
//   - validarAtividade: guarda de consistência para o cadastro das 90 atividades.
//   - corrigirResposta: correção por ordem exata OU por dependências (precedências).
//   - corrigirImprevisto: correção de problema/plano_alternativo/reorganizar + perseveração.
//   - indicadoresDe: agrega os 8 indicadores da seção 18 a partir de registros.
//
// Princípio central (spec §8): NÃO marcar como erro uma ordem funcionalmente válida
// só por diferir da principal. Em `dependencias`, o que importa são as precedências.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CaminhosAtividade,
  CaminhosResposta,
  CaminhosResultado,
  CaminhosResultadoImprevisto,
  CaminhosPrecedencia,
  CaminhosRegistro,
  CaminhosIndicadores,
} from "@/types/caminhos-meta";

// ── Utilidades internas ──────────────────────────────────────────────────────

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Duas ordens (arrays de ids) iguais posição a posição. */
function ordemIgual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}

/** Dois conjuntos com os mesmos elementos (ignora ordem/duplicatas). */
function mesmoConjunto(a: string[], b: string[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
}

// ── validarAtividade ─────────────────────────────────────────────────────────

/**
 * Valida a consistência de uma atividade. Retorna a lista de erros (vazia = ok).
 * Usada como guarda ao cadastrar as atividades definitivas.
 */
export function validarAtividade(a: CaminhosAtividade): string[] {
  const erros: string[] = [];

  // ids das ações únicos e não vazios
  const ids = a.acoes.map((x) => x.id);
  if (ids.some((id) => !id)) erros.push("Existe ação com id vazio.");
  if (unique(ids).length !== ids.length) {
    erros.push("Ids de ações duplicados.");
  }
  const idSet = new Set(ids);

  // dicas: exatamente os 3 níveis (spec §16)
  const niveisDica = a.dicas.map((d) => d.nivel).sort();
  if (!ordemIgual(niveisDica.map(String), ["1", "2", "3"])) {
    erros.push("As dicas devem cobrir exatamente os níveis 1, 2 e 3.");
  }

  const c = a.correcao;

  // ordemPrincipal referencia ações existentes e sem duplicatas
  for (const id of c.ordemPrincipal) {
    if (!idSet.has(id)) erros.push(`ordemPrincipal referencia ação inexistente: ${id}.`);
  }
  if (unique(c.ordemPrincipal).length !== c.ordemPrincipal.length) {
    erros.push("ordemPrincipal contém ids repetidos.");
  }

  // ações com ordemPrincipal definida devem aparecer na ordemPrincipal da correção
  for (const acao of a.acoes) {
    if (acao.ordemPrincipal != null && !c.ordemPrincipal.includes(acao.id)) {
      erros.push(`Ação ${acao.id} tem ordemPrincipal mas não está na correcao.ordemPrincipal.`);
    }
  }

  // intrusas (desnecessárias) NÃO podem estar na ordemPrincipal (spec §8/§11)
  for (const id of c.acoesDesnecessarias) {
    if (!idSet.has(id)) erros.push(`acoesDesnecessarias referencia ação inexistente: ${id}.`);
    if (c.ordemPrincipal.includes(id)) {
      erros.push(`Ação desnecessária ${id} não pode estar na ordemPrincipal.`);
    }
  }

  // obrigatórias/opcionais referenciam ações existentes
  for (const id of c.acoesObrigatorias) {
    if (!idSet.has(id)) erros.push(`acoesObrigatorias referencia ação inexistente: ${id}.`);
  }
  for (const id of c.acoesOpcionais) {
    if (!idSet.has(id)) erros.push(`acoesOpcionais referencia ação inexistente: ${id}.`);
  }

  // precedências referenciam ações existentes e não podem ser reflexivas
  for (const p of c.precedencias) {
    if (!idSet.has(p.antes)) erros.push(`Precedência com ação inexistente: ${p.antes}.`);
    if (!idSet.has(p.depois)) erros.push(`Precedência com ação inexistente: ${p.depois}.`);
    if (p.antes === p.depois) erros.push(`Precedência reflexiva não permitida: ${p.antes}.`);
  }

  // detectar ciclo nas precedências (DFS)
  if (temCicloPrecedencias(c.precedencias)) {
    erros.push("As precedências contêm um ciclo.");
  }

  // ordens alternativas devem conter o mesmo conjunto de ações da principal
  for (const alt of c.ordensAlternativasAceitas) {
    for (const id of alt) {
      if (!idSet.has(id)) erros.push(`Ordem alternativa referencia ação inexistente: ${id}.`);
    }
    if (!mesmoConjunto(alt, c.ordemPrincipal)) {
      erros.push("Ordem alternativa deve conter o mesmo conjunto de ações da ordemPrincipal.");
    }
  }

  // pontuacaoMinima coerente
  if (c.pontuacaoMinima < 0 || c.pontuacaoMinima > c.ordemPrincipal.length) {
    erros.push("pontuacaoMinima fora do intervalo [0, tamanho da ordemPrincipal].");
  }

  // imprevisto: quando ativo, ids referenciam ações existentes
  if (a.imprevisto?.ativo) {
    const imp = a.imprevisto;
    for (const id of imp.acoesQueDevemMudar) {
      if (!idSet.has(id)) erros.push(`imprevisto.acoesQueDevemMudar ação inexistente: ${id}.`);
    }
    for (const id of imp.solucaoCorreta) {
      if (!idSet.has(id)) erros.push(`imprevisto.solucaoCorreta ação inexistente: ${id}.`);
    }
    if (imp.solucaoCorreta.length === 0) {
      erros.push("imprevisto ativo exige ao menos uma ação em solucaoCorreta.");
    }
    for (const alt of imp.solucoesAlternativasAceitas) {
      for (const id of alt) {
        if (!idSet.has(id)) erros.push(`imprevisto.solucoesAlternativasAceitas ação inexistente: ${id}.`);
      }
    }
  }

  return erros;
}

/** Detecta ciclo num grafo de precedências (antes → depois) via DFS. */
function temCicloPrecedencias(precedencias: CaminhosPrecedencia[]): boolean {
  const adj = new Map<string, string[]>();
  for (const p of precedencias) {
    if (!adj.has(p.antes)) adj.set(p.antes, []);
    adj.get(p.antes)!.push(p.depois);
  }
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const cor = new Map<string, number>();
  for (const p of precedencias) {
    if (!cor.has(p.antes)) cor.set(p.antes, WHITE);
    if (!cor.has(p.depois)) cor.set(p.depois, WHITE);
  }

  function dfs(no: string): boolean {
    cor.set(no, GRAY);
    for (const viz of adj.get(no) ?? []) {
      const cv = cor.get(viz) ?? WHITE;
      if (cv === GRAY) return true; // aresta de retorno → ciclo
      if (cv === WHITE && dfs(viz)) return true;
    }
    cor.set(no, BLACK);
    return false;
  }

  for (const no of cor.keys()) {
    if (cor.get(no) === WHITE && dfs(no)) return true;
  }
  return false;
}

// ── corrigirResposta ─────────────────────────────────────────────────────────

/**
 * Corrige a resposta do paciente contra a atividade.
 * Respeita os dois tipos de correção (spec §8) e os 3 estados (spec §9).
 */
export function corrigirResposta(
  atividade: CaminhosAtividade,
  resposta: CaminhosResposta
): CaminhosResultado {
  const c = atividade.correcao;
  const ordem = resposta.ordem ?? [];
  const descartadas = resposta.descartadas ?? [];

  // Intrusas: incluídas no plano (erro) vs. descartadas/deixadas de fora (acerto).
  const desnecessarias = new Set(c.acoesDesnecessarias);
  const intrusasIncluidas = ordem.filter((id) => desnecessarias.has(id));
  const intrusasDescartadas = c.acoesDesnecessarias.filter(
    (id) => !ordem.includes(id) // não entrou no plano (foi descartada ou nunca posicionada)
  );

  // Obrigatórias faltando (não aparecem na ordem).
  const obrigatoriasFaltando = c.acoesObrigatorias.filter((id) => !ordem.includes(id));

  // Precedências respeitadas x violadas (posição de `antes` < posição de `depois`).
  const pos = new Map<string, number>();
  ordem.forEach((id, i) => pos.set(id, i));
  const relacoesRespeitadas: CaminhosPrecedencia[] = [];
  const relacoesVioladas: CaminhosPrecedencia[] = [];
  for (const p of c.precedencias) {
    const ia = pos.get(p.antes);
    const ib = pos.get(p.depois);
    // Só avalia precedências cujas duas ações estão presentes.
    if (ia == null || ib == null) continue;
    if (ia < ib) relacoesRespeitadas.push(p);
    else relacoesVioladas.push(p);
  }

  // Ações fora do lugar (comparação posicional com a ordem principal).
  const acoesForaDoLugar: string[] = [];
  const planoSemIntrusas = ordem.filter((id) => !desnecessarias.has(id));
  c.ordemPrincipal.forEach((id, i) => {
    if (planoSemIntrusas[i] !== id) acoesForaDoLugar.push(id);
  });

  const base = {
    relacoesRespeitadas,
    relacoesVioladas,
    acoesForaDoLugar,
    intrusasIncluidas,
    intrusasDescartadas,
    obrigatoriasFaltando,
  };

  // Falta obrigatória ou inclui intrusa antes de mais nada é forte sinal de erro,
  // mas o estado final depende do tipo de correção e das regras de parcial.
  if (c.tipo === "ordem_exata") {
    return corrigirOrdemExata(atividade, ordem, base);
  }
  return corrigirDependencias(atividade, ordem, base);
}

type ResultadoBase = Omit<CaminhosResultado, "estado" | "detalhe">;

/** Correção posição a posição (spec §8 TIPO A). */
function corrigirOrdemExata(
  atividade: CaminhosAtividade,
  ordem: string[],
  base: ResultadoBase
): CaminhosResultado {
  const c = atividade.correcao;
  const planoSemIntrusas = ordem.filter((id) => !c.acoesDesnecessarias.includes(id));

  const correspondeExata =
    ordemIgual(planoSemIntrusas, c.ordemPrincipal) &&
    base.intrusasIncluidas.length === 0 &&
    base.obrigatoriasFaltando.length === 0;

  const correspondeAlt = c.ordensAlternativasAceitas.some(
    (alt) => ordemIgual(planoSemIntrusas, alt) && base.intrusasIncluidas.length === 0
  );

  if (correspondeExata || correspondeAlt) {
    return {
      estado: "correta",
      ...base,
      detalhe: "Ordem correta.",
    };
  }

  // PARCIAL (spec §9): todas as necessárias presentes com exatamente 1 troca inadequada
  // e sem intrusas incluídas; OU intrusa única com o resto correto.
  // "1 troca inadequada" = 2 posições divergem E no máximo 1 precedência violada
  // (uma inversão adjacente; um reverso completo viola 2+ precedências → incorreta).
  const todasPresentes = base.obrigatoriasFaltando.length === 0 && !faltaAlgumaDaPrincipal(c, ordem);
  const umaTrocaAdjacente =
    base.acoesForaDoLugar.length === 2 && base.relacoesVioladas.length <= 1;
  const semIntrusa = base.intrusasIncluidas.length === 0;
  const intrusaUnicaComRestoOk =
    base.intrusasIncluidas.length === 1 &&
    base.acoesForaDoLugar.length === 0 &&
    base.obrigatoriasFaltando.length === 0;

  if ((todasPresentes && umaTrocaAdjacente && semIntrusa) || intrusaUnicaComRestoOk) {
    return {
      estado: "parcial",
      ...base,
      detalhe: "Quase lá — revise a posição de uma ação.",
    };
  }

  return {
    estado: "incorreta",
    ...base,
    detalhe: "A ordem cria uma dificuldade para alcançar a meta.",
  };
}

/** Correção por precedências (spec §8 TIPO B). */
function corrigirDependencias(
  atividade: CaminhosAtividade,
  ordem: string[],
  base: ResultadoBase
): CaminhosResultado {
  const c = atividade.correcao;
  const planoSemIntrusas = ordem.filter((id) => !c.acoesDesnecessarias.includes(id));

  const totalPrec = c.precedencias.length;
  const violadas = base.relacoesVioladas.length;
  const respeitadas = base.relacoesRespeitadas.length;

  // Correta: bate com uma ordem alternativa explícita (sem intrusas), OU
  // todas as precedências respeitadas + todas as obrigatórias presentes + sem intrusa.
  const correspondeAlt = c.ordensAlternativasAceitas.some(
    (alt) => ordemIgual(planoSemIntrusas, alt) && base.intrusasIncluidas.length === 0
  );
  const igualPrincipalSemIntrusa =
    ordemIgual(planoSemIntrusas, c.ordemPrincipal) && base.intrusasIncluidas.length === 0;

  const todasPrecOk = violadas === 0;
  const todasObrigatorias = base.obrigatoriasFaltando.length === 0;
  const semIntrusa = base.intrusasIncluidas.length === 0;

  // NÃO marcar erro em ordem funcionalmente válida (spec §8): se todas as precedências
  // estão ok, as obrigatórias presentes e não há intrusa, é CORRETA mesmo diferindo da principal.
  if (correspondeAlt || igualPrincipalSemIntrusa || (todasPrecOk && todasObrigatorias && semIntrusa)) {
    return {
      estado: "correta",
      ...base,
      detalhe: "Plano possível: respeita todas as etapas necessárias.",
    };
  }

  // PARCIAL (spec §9): "maioria das relações obrigatórias ok; só 1 troca inadequada".
  // Com só 1 violação, ao menos metade das precedências respeitadas conta como maioria
  // (ex.: 1 de 2 respeitada + 1 violada = uma troca isolada → parcial, não incorreta).
  // OU uma única intrusa incluída com o resto respeitando as precedências.
  const maioriaOk = totalPrec > 0 && respeitadas >= totalPrec / 2;
  const umaViolacao = violadas === 1;
  const intrusaUnicaRestoOk =
    base.intrusasIncluidas.length === 1 && todasPrecOk && todasObrigatorias;

  if ((maioriaOk && umaViolacao && semIntrusa && todasObrigatorias) || intrusaUnicaRestoOk) {
    return {
      estado: "parcial",
      ...base,
      detalhe: "Seu plano está quase completo — revise a posição de uma ação.",
    };
  }

  return {
    estado: "incorreta",
    ...base,
    detalhe: "Pense no que precisa acontecer antes de cada etapa.",
  };
}

/** true se falta alguma ação da ordem principal na resposta. */
function faltaAlgumaDaPrincipal(
  c: CaminhosAtividade["correcao"],
  ordem: string[]
): boolean {
  return c.ordemPrincipal.some((id) => !ordem.includes(id));
}

// ── corrigirImprevisto ───────────────────────────────────────────────────────

/**
 * Corrige a escolha do paciente diante de um imprevisto
 * (modos problema / plano_alternativo / reorganizar). Spec §10, §18.
 */
export function corrigirImprevisto(
  atividade: CaminhosAtividade,
  escolha: string[]
): CaminhosResultadoImprevisto {
  const imp = atividade.imprevisto;
  if (!imp || !imp.ativo) {
    return {
      estado: "incorreta",
      correto: false,
      perseverou: false,
      detalhe: "Esta atividade não possui imprevisto ativo.",
    };
  }

  const escolhaSet = escolha;

  const acertouPrincipal = mesmoConjunto(escolhaSet, imp.solucaoCorreta);
  const acertouAlternativa = imp.solucoesAlternativasAceitas.some((alt) =>
    mesmoConjunto(escolhaSet, alt)
  );
  const correto = acertouPrincipal || acertouAlternativa;

  // Perseveração: escolheu uma ação do plano inicial que deixou de funcionar.
  const mudar = new Set(imp.acoesQueDevemMudar);
  const perseverou = escolhaSet.some((id) => mudar.has(id));

  if (correto) {
    return {
      estado: "correta",
      correto: true,
      perseverou,
      detalhe: "Boa adaptação: você encontrou uma forma segura de continuar até a meta.",
    };
  }

  if (perseverou) {
    return {
      estado: "incorreta",
      correto: false,
      perseverou: true,
      detalhe: "Essa opção já não funciona depois da mudança. Procure outro caminho.",
    };
  }

  return {
    estado: "incorreta",
    correto: false,
    perseverou: false,
    detalhe: "Essa escolha não resolve o imprevisto. Reveja os recursos disponíveis.",
  };
}

// ── indicadoresDe ────────────────────────────────────────────────────────────

/** Média segura: 0 quando não há observações. */
function media(numerador: number, denominador: number): number {
  if (denominador <= 0) return 0;
  return numerador / denominador;
}

/**
 * Agrega os 8 indicadores da seção 18 (0-1 cada) a partir dos registros,
 * incluindo "adaptacaoAposMudanca" e a contagem de "persistenciaEstrategiaAnterior".
 */
export function indicadoresDe(registros: CaminhosRegistro[]): CaminhosIndicadores {
  const total = registros.length;

  // 1 Organização: concluídas corretas ÷ concluídas.
  const concluidas = registros.filter((r) => r.concluida);
  const organizacao = media(
    concluidas.filter((r) => r.estado === "correta").length,
    concluidas.length
  );

  // 2 Sequenciamento: relações respeitadas ÷ (respeitadas + violadas).
  const respeitadas = registros.reduce((s, r) => s + r.relacoesRespeitadas, 0);
  const violadas = registros.reduce((s, r) => s + r.relacoesVioladas, 0);
  const sequenciamento = media(respeitadas, respeitadas + violadas);

  // 3 Priorização: obrigatórias selecionadas ÷ (obrigatórias + opcionais selecionadas),
  // limitado a registros de modo prioridade quando houver; senão, geral.
  const prioReg = registros.filter((r) => r.modo === "prioridade");
  const baseP = prioReg.length > 0 ? prioReg : registros;
  const obr = baseP.reduce((s, r) => s + r.obrigatoriasSelecionadas, 0);
  const opc = baseP.reduce((s, r) => s + r.opcionaisSelecionadas, 0);
  const priorizacao = media(obr, obr + opc);

  // 4 Identificação de irrelevantes: descartadas ÷ (descartadas + incluídas).
  const desc = registros.reduce((s, r) => s + r.desnecessariasDescartadas, 0);
  const incl = registros.reduce((s, r) => s + r.desnecessariasIncluidas, 0);
  const identificacaoIrrelevantes = media(desc, desc + incl);

  // 5 Resolução de problemas: resolvidos ÷ apresentados.
  const problemasApresentados = registros.filter((r) => r.mudancaApresentada).length;
  const problemasResolvidos = registros.filter((r) => r.problemaResolvido).length;
  const resolucaoProblemas = media(problemasResolvidos, problemasApresentados);

  // 6 Adaptação após mudança = adaptadas ÷ apresentadas (spec §18).
  const adaptadas = registros.filter((r) => r.mudancaApresentada && r.adaptouAposMudanca).length;
  const adaptacaoAposMudanca = media(adaptadas, problemasApresentados);

  // 7 Uso de suporte: proporção de execuções que usaram alguma dica ou áudio.
  const usaramSuporte = registros.filter((r) => r.dicasUsadas > 0 || r.usouAudio).length;
  const usoSuporte = media(usaramSuporte, total);

  // 8 Revisão da própria resposta: acertos após revisão ÷ execuções que não acertaram de início.
  const naoAcertaramInicio = registros.filter((r) => !r.acertoInicial);
  const revisouEacertou = naoAcertaramInicio.filter((r) => r.acertoAposRevisao).length;
  const revisaoResposta = media(revisouEacertou, naoAcertaramInicio.length);

  // Persistência na estratégia anterior: CONTAGEM (spec §18).
  const persistenciaEstrategiaAnterior = registros.filter(
    (r) => r.persistiuEstrategiaAnterior
  ).length;

  return {
    organizacao,
    sequenciamento,
    priorizacao,
    identificacaoIrrelevantes,
    resolucaoProblemas,
    adaptacaoAposMudanca,
    usoSuporte,
    revisaoResposta,
    persistenciaEstrategiaAnterior,
    totalRegistros: total,
  };
}
