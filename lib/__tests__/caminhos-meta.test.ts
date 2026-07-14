import { describe, it, expect } from "vitest";
import {
  validarAtividade,
  corrigirResposta,
  corrigirImprevisto,
  indicadoresDe,
} from "@/lib/caminhos-meta";
import {
  CAMINHOS_ATIVIDADES,
  CAMINHOS_CRIANCAS,
  CAMINHOS_ADOLESCENTES,
  CAMINHOS_ADULTOS_IDOSOS,
} from "@/data/caminhos-meta-atividades";
import type { CaminhosAtividade, CaminhosRegistro } from "@/types/caminhos-meta";

// ── Fábricas de atividades de teste ─────────────────────────────────────────

/** Atividade mínima com correção ordem_exata (3 ações A→B→C). */
function mkOrdemExata(over: Partial<CaminhosAtividade["correcao"]> = {}): CaminhosAtividade {
  return {
    id: "t-ordem",
    titulo: "[EXEMPLO] Teste ordem",
    biblioteca: "criancas",
    categoria: "rotina",
    nivel: 1,
    modo: "ordenar",
    habilidades: ["organização"],
    meta: "Meta de teste.",
    instrucao: "Ordene.",
    contexto: "",
    acoes: [
      { id: "A", texto: "Ação A", tipo: "obrigatoria", ordemPrincipal: 1 },
      { id: "B", texto: "Ação B", tipo: "obrigatoria", ordemPrincipal: 2 },
      { id: "C", texto: "Ação C", tipo: "obrigatoria", ordemPrincipal: 3 },
    ],
    correcao: {
      tipo: "ordem_exata",
      ordemPrincipal: ["A", "B", "C"],
      precedencias: [
        { antes: "A", depois: "B" },
        { antes: "B", depois: "C" },
      ],
      ordensAlternativasAceitas: [],
      acoesObrigatorias: ["A", "B", "C"],
      acoesOpcionais: [],
      acoesDesnecessarias: [],
      pontuacaoMinima: 3,
      ...over,
    },
    dicas: [
      { nivel: 1, texto: "d1" },
      { nivel: 2, texto: "d2" },
      { nivel: 3, texto: "d3" },
    ],
    feedback: { correto: "ok", parcial: "quase", incorreto: "reveja", explicacao: "porque" },
    acessibilidade: {},
    ativo: true,
    duracaoEstimadaMin: 2,
  };
}

/**
 * Atividade com correção por dependências: A→B→C e X é livre (sem precedência),
 * D é intrusa (desnecessária).
 */
function mkDependencias(): CaminhosAtividade {
  return {
    id: "t-dep",
    titulo: "[EXEMPLO] Teste dependências",
    biblioteca: "adolescentes",
    categoria: "escola",
    nivel: 5,
    modo: "ordenar",
    habilidades: ["planejamento"],
    meta: "Meta.",
    instrucao: "Ordene.",
    contexto: "",
    acoes: [
      { id: "A", texto: "A", tipo: "obrigatoria", ordemPrincipal: 1 },
      { id: "B", texto: "B", tipo: "obrigatoria", ordemPrincipal: 2 },
      { id: "C", texto: "C", tipo: "obrigatoria", ordemPrincipal: 3 },
      { id: "X", texto: "X", tipo: "obrigatoria", ordemPrincipal: 4 },
      { id: "D", texto: "D (intrusa)", tipo: "desnecessaria" },
    ],
    correcao: {
      tipo: "dependencias",
      ordemPrincipal: ["A", "B", "C", "X"],
      precedencias: [
        { antes: "A", depois: "B" },
        { antes: "B", depois: "C" },
      ],
      ordensAlternativasAceitas: [],
      acoesObrigatorias: ["A", "B", "C", "X"],
      acoesOpcionais: [],
      acoesDesnecessarias: ["D"],
      pontuacaoMinima: 4,
    },
    dicas: [
      { nivel: 1, texto: "d1" },
      { nivel: 2, texto: "d2" },
      { nivel: 3, texto: "d3" },
    ],
    feedback: { correto: "ok", parcial: "quase", incorreto: "reveja", explicacao: "porque" },
    acessibilidade: {},
    ativo: true,
    duracaoEstimadaMin: 3,
  };
}

// ── ordem_exata ─────────────────────────────────────────────────────────────

describe("corrigirResposta — ordem_exata", () => {
  it("ordem exata correta", () => {
    const r = corrigirResposta(mkOrdemExata(), { ordem: ["A", "B", "C"] });
    expect(r.estado).toBe("correta");
    expect(r.acoesForaDoLugar).toHaveLength(0);
    expect(r.relacoesRespeitadas).toHaveLength(2);
    expect(r.relacoesVioladas).toHaveLength(0);
  });

  it("uma troca (1 fora do lugar) => parcial", () => {
    // A, C, B: B e C trocados => 2 posições divergem = 1 troca.
    const r = corrigirResposta(mkOrdemExata(), { ordem: ["A", "C", "B"] });
    expect(r.estado).toBe("parcial");
  });

  it("ordem totalmente invertida => incorreta", () => {
    const r = corrigirResposta(mkOrdemExata(), { ordem: ["C", "B", "A"] });
    expect(r.estado).toBe("incorreta");
    expect(r.relacoesVioladas.length).toBeGreaterThan(1);
  });

  it("obrigatória faltando => incorreta e listada", () => {
    const r = corrigirResposta(mkOrdemExata(), { ordem: ["A", "B"] });
    expect(r.estado).toBe("incorreta");
    expect(r.obrigatoriasFaltando).toContain("C");
  });

  it("ordem alternativa aceita conta como correta", () => {
    const a = mkOrdemExata({ ordensAlternativasAceitas: [["A", "C", "B"]] });
    const r = corrigirResposta(a, { ordem: ["A", "C", "B"] });
    expect(r.estado).toBe("correta");
  });
});

// ── dependencias ────────────────────────────────────────────────────────────

describe("corrigirResposta — dependencias", () => {
  it("ordem principal exata => correta", () => {
    const r = corrigirResposta(mkDependencias(), { ordem: ["A", "B", "C", "X"] });
    expect(r.estado).toBe("correta");
    expect(r.relacoesVioladas).toHaveLength(0);
  });

  it("ordem alternativa funcionalmente válida (X movido) => CORRETA, nunca erro", () => {
    // X não tem precedência: pode ir para qualquer lugar sem violar A→B→C.
    const r = corrigirResposta(mkDependencias(), { ordem: ["X", "A", "B", "C"] });
    expect(r.estado).toBe("correta");
    expect(r.relacoesVioladas).toHaveLength(0);
  });

  it("outra posição válida de X => CORRETA", () => {
    const r = corrigirResposta(mkDependencias(), { ordem: ["A", "B", "X", "C"] });
    expect(r.estado).toBe("correta");
  });

  it("1 precedência violada com o resto ok => parcial", () => {
    // Troca B e C: viola B→C (1 violação), A→B ok. X presente. Maioria ok.
    const r = corrigirResposta(mkDependencias(), { ordem: ["A", "C", "B", "X"] });
    expect(r.estado).toBe("parcial");
    expect(r.relacoesVioladas).toHaveLength(1);
    expect(r.relacoesRespeitadas).toHaveLength(1);
  });

  it("várias precedências violadas => incorreta", () => {
    // C, B, A, X: viola A→B e B→C.
    const r = corrigirResposta(mkDependencias(), { ordem: ["C", "B", "A", "X"] });
    expect(r.estado).toBe("incorreta");
    expect(r.relacoesVioladas.length).toBeGreaterThanOrEqual(2);
  });

  it("intrusa incluída com resto correto => parcial e listada", () => {
    const r = corrigirResposta(mkDependencias(), { ordem: ["A", "B", "C", "X", "D"] });
    expect(r.estado).toBe("parcial");
    expect(r.intrusasIncluidas).toContain("D");
  });

  it("intrusa descartada => correta e listada em descartadas", () => {
    const r = corrigirResposta(mkDependencias(), {
      ordem: ["A", "B", "C", "X"],
      descartadas: ["D"],
    });
    expect(r.estado).toBe("correta");
    expect(r.intrusasDescartadas).toContain("D");
    expect(r.intrusasIncluidas).toHaveLength(0);
  });

  it("obrigatória faltando => incorreta e listada", () => {
    const r = corrigirResposta(mkDependencias(), { ordem: ["A", "B", "C"] });
    expect(r.estado).toBe("incorreta");
    expect(r.obrigatoriasFaltando).toContain("X");
  });
});

// ── validarAtividade ────────────────────────────────────────────────────────

describe("validarAtividade", () => {
  it("atividade consistente => sem erros", () => {
    expect(validarAtividade(mkOrdemExata())).toHaveLength(0);
    expect(validarAtividade(mkDependencias())).toHaveLength(0);
  });

  it("detecta ciclo de precedência (DFS)", () => {
    const a = mkOrdemExata({
      precedencias: [
        { antes: "A", depois: "B" },
        { antes: "B", depois: "C" },
        { antes: "C", depois: "A" }, // fecha o ciclo
      ],
    });
    const erros = validarAtividade(a);
    expect(erros.some((e) => e.toLowerCase().includes("ciclo"))).toBe(true);
  });

  it("detecta id inexistente na ordemPrincipal", () => {
    const a = mkOrdemExata({ ordemPrincipal: ["A", "B", "Z"] });
    const erros = validarAtividade(a);
    expect(erros.some((e) => e.includes("Z"))).toBe(true);
  });

  it("detecta ids de ações duplicados", () => {
    const a = mkOrdemExata();
    a.acoes[1].id = "A"; // duplica
    const erros = validarAtividade(a);
    expect(erros.some((e) => e.toLowerCase().includes("duplicad"))).toBe(true);
  });

  it("detecta intrusa dentro da ordemPrincipal", () => {
    const a = mkDependencias();
    a.correcao.ordemPrincipal = ["A", "B", "C", "X", "D"]; // D é desnecessária
    const erros = validarAtividade(a);
    expect(erros.some((e) => e.toLowerCase().includes("desnecess"))).toBe(true);
  });
});

// ── corrigirImprevisto ──────────────────────────────────────────────────────

describe("corrigirImprevisto", () => {
  // AD21 "A rua habitual está fechada" — análogo oficial do antigo exemplo.
  const atividade = CAMINHOS_ATIVIDADES.find((a) => a.id === "cm_ad21")!;

  it("solução correta (seguir o desvio) => correta, sem perseveração", () => {
    const r = corrigirImprevisto(atividade, ["a4"]);
    expect(r.estado).toBe("correta");
    expect(r.correto).toBe(true);
    expect(r.perseverou).toBe(false);
  });

  it("insistir no plano inicial (rua habitual) => incorreta, perseverou", () => {
    const r = corrigirImprevisto(atividade, ["a2"]);
    expect(r.estado).toBe("incorreta");
    expect(r.correto).toBe(false);
    expect(r.perseverou).toBe(true);
  });

  it("escolha insegura (atravessar o bloqueio) => incorreta, sem perseveração", () => {
    const r = corrigirImprevisto(atividade, ["a5"]);
    expect(r.estado).toBe("incorreta");
    expect(r.perseverou).toBe(false);
  });

  it("aceita solução alternativa cadastrada", () => {
    // Injeta uma alternativa aceita e verifica.
    const alt: CaminhosAtividade = {
      ...atividade,
      imprevisto: {
        ...atividade.imprevisto!,
        solucoesAlternativasAceitas: [["p1", "p4", "p3"]],
      },
    };
    const r = corrigirImprevisto(alt, ["p1", "p4", "p3"]);
    expect(r.estado).toBe("correta");
    expect(r.correto).toBe(true);
  });

  it("atividade sem imprevisto ativo => incorreta", () => {
    const r = corrigirImprevisto(mkOrdemExata(), ["A"]);
    expect(r.correto).toBe(false);
    expect(r.detalhe.toLowerCase()).toContain("imprevisto");
  });
});

// ── indicadoresDe ───────────────────────────────────────────────────────────

function mkRegistro(over: Partial<CaminhosRegistro> = {}): CaminhosRegistro {
  return {
    atividadeId: "x",
    modo: "ordenar",
    nivel: 1,
    biblioteca: "criancas",
    estado: "correta",
    concluida: true,
    abandonou: false,
    obrigatoriasSelecionadas: 0,
    opcionaisSelecionadas: 0,
    desnecessariasDescartadas: 0,
    desnecessariasIncluidas: 0,
    relacoesRespeitadas: 0,
    relacoesVioladas: 0,
    trocas: 0,
    alteracoes: 0,
    tentativas: 1,
    dicasUsadas: 0,
    nivelDicaMax: 0,
    usouAudio: false,
    tempoTotalSeg: 0,
    acertoInicial: true,
    acertoAposRevisao: false,
    respostaParcial: false,
    mudancaApresentada: false,
    adaptouAposMudanca: false,
    persistiuEstrategiaAnterior: false,
    erroPerseveracao: false,
    problemaResolvido: false,
    acoesRemovidasAposMudanca: 0,
    acoesAdicionadasAposMudanca: 0,
    acoesSubstituidasAposMudanca: 0,
    ...over,
  };
}

describe("indicadoresDe", () => {
  it("adaptacaoAposMudanca = adaptadas ÷ apresentadas", () => {
    const regs = [
      mkRegistro({ mudancaApresentada: true, adaptouAposMudanca: true, problemaResolvido: true }),
      mkRegistro({ mudancaApresentada: true, adaptouAposMudanca: false }),
      mkRegistro({ mudancaApresentada: false }), // não conta no denominador
    ];
    const ind = indicadoresDe(regs);
    expect(ind.adaptacaoAposMudanca).toBeCloseTo(0.5, 5);
  });

  it("persistenciaEstrategiaAnterior é uma CONTAGEM", () => {
    const regs = [
      mkRegistro({ persistiuEstrategiaAnterior: true }),
      mkRegistro({ persistiuEstrategiaAnterior: true }),
      mkRegistro({ persistiuEstrategiaAnterior: false }),
    ];
    expect(indicadoresDe(regs).persistenciaEstrategiaAnterior).toBe(2);
  });

  it("sequenciamento = respeitadas ÷ (respeitadas + violadas)", () => {
    const regs = [
      mkRegistro({ relacoesRespeitadas: 3, relacoesVioladas: 1 }),
      mkRegistro({ relacoesRespeitadas: 2, relacoesVioladas: 0 }),
    ];
    // (3+2) / (3+2 + 1) = 5/6
    expect(indicadoresDe(regs).sequenciamento).toBeCloseTo(5 / 6, 5);
  });

  it("identificacaoIrrelevantes = descartadas ÷ (descartadas + incluídas)", () => {
    const regs = [
      mkRegistro({ desnecessariasDescartadas: 3, desnecessariasIncluidas: 1 }),
    ];
    expect(indicadoresDe(regs).identificacaoIrrelevantes).toBeCloseTo(0.75, 5);
  });

  it("sem registros => tudo 0 e totalRegistros 0", () => {
    const ind = indicadoresDe([]);
    expect(ind.totalRegistros).toBe(0);
    expect(ind.organizacao).toBe(0);
    expect(ind.adaptacaoAposMudanca).toBe(0);
    expect(ind.persistenciaEstrategiaAnterior).toBe(0);
  });
});

// ── catálogo oficial (Etapa 2: as 90 atividades) ─────────────────────────────

describe("catálogo oficial (90 atividades)", () => {
  it("existem exatamente 90: 30 por biblioteca", () => {
    expect(CAMINHOS_ATIVIDADES).toHaveLength(90);
    expect(CAMINHOS_CRIANCAS).toHaveLength(30);
    expect(CAMINHOS_ADOLESCENTES).toHaveLength(30);
    expect(CAMINHOS_ADULTOS_IDOSOS).toHaveLength(30);
  });

  it("ids únicos e nenhum título com [EXEMPLO]", () => {
    const ids = CAMINHOS_ATIVIDADES.map((a) => a.id);
    expect(new Set(ids).size).toBe(90);
    expect(CAMINHOS_ATIVIDADES.some((a) => a.titulo.includes("[EXEMPLO]"))).toBe(false);
  });

  it("cada biblioteca só contém atividades da própria biblioteca", () => {
    expect(CAMINHOS_CRIANCAS.every((a) => a.biblioteca === "criancas")).toBe(true);
    expect(CAMINHOS_ADOLESCENTES.every((a) => a.biblioteca === "adolescentes")).toBe(true);
    expect(CAMINHOS_ADULTOS_IDOSOS.every((a) => a.biblioteca === "adultos_idosos")).toBe(true);
  });

  it("as 90 passam em validarAtividade", () => {
    for (const a of CAMINHOS_ATIVIDADES) {
      expect(validarAtividade(a), a.id).toHaveLength(0);
    }
  });

  it("todas têm 3 dicas, feedback completo e estão ativas", () => {
    for (const a of CAMINHOS_ATIVIDADES) {
      expect(a.dicas, a.id).toHaveLength(3);
      expect(a.feedback.correto.length, a.id).toBeGreaterThan(0);
      expect(a.feedback.parcial.length, a.id).toBeGreaterThan(0);
      expect(a.feedback.incorreto.length, a.id).toBeGreaterThan(0);
      expect(a.feedback.explicacao.length, a.id).toBeGreaterThan(0);
      expect(a.ativo, a.id).toBe(true);
    }
  });

  it("modos com imprevisto trazem o bloco completo (solução + explicação)", () => {
    const comMudanca = CAMINHOS_ATIVIDADES.filter((a) =>
      ["reorganizar", "problema", "plano_alternativo"].includes(a.modo)
    );
    expect(comMudanca).toHaveLength(30);
    for (const a of comMudanca) {
      expect(a.imprevisto?.ativo, a.id).toBe(true);
      expect(a.imprevisto!.solucaoCorreta.length, a.id).toBeGreaterThan(0);
      expect(a.imprevisto!.explicacao.length, a.id).toBeGreaterThan(0);
    }
  });

  it("C01 (ordenar, ordem_exata) corrige a ordem certa como correta", () => {
    const a = CAMINHOS_ATIVIDADES.find((x) => x.id === "cm_c01")!;
    const r = corrigirResposta(a, { ordem: a.correcao.ordemPrincipal });
    expect(r.estado).toBe("correta");
  });

  it("C11 (intruso) aceita a intrusa descartada", () => {
    const a = CAMINHOS_ATIVIDADES.find((x) => x.id === "cm_c11")!;
    const r = corrigirResposta(a, {
      ordem: a.correcao.ordemPrincipal,
      descartadas: a.correcao.acoesDesnecessarias,
    });
    expect(r.estado).toBe("correta");
    expect(r.intrusasIncluidas).toHaveLength(0);
  });

  it("modo prioridade: o conjunto certo é correto em QUALQUER ordem de clique", () => {
    for (const a of CAMINHOS_ATIVIDADES.filter((x) => x.modo === "prioridade")) {
      const inv = [...a.correcao.acoesObrigatorias].reverse();
      const r = corrigirResposta(a, { ordem: inv, selecionadas: inv, descartadas: [] });
      expect(r.estado, a.id).toBe("correta");
    }
  });

  it("C29 (nível 8, duas mudanças) aceita o conjunto completo e recusa metade", () => {
    const a = CAMINHOS_ATIVIDADES.find((x) => x.id === "cm_c29")!;
    expect(a.imprevisto!.solucaoCorreta.length).toBeGreaterThan(1);
    const ok = corrigirImprevisto(a, [...a.imprevisto!.solucaoCorreta]);
    expect(ok.correto).toBe(true);
    const metade = corrigirImprevisto(a, [a.imprevisto!.solucaoCorreta[0]]);
    expect(metade.correto).toBe(false);
  });
});
