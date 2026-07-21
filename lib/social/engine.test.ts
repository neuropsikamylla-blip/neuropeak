import { describe, it, expect } from "vitest";
import {
  selecionarHistorias, historiaSugerida, isPontuavel, verificarResposta,
  erroTipoDaResposta, feedback, montarResultado,
} from "./engine";
import type { SocialStory, SocialQuestion, PatientAnswer, EixoSocial } from "./types";

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Constrói perguntas/histórias mínimas e válidas para exercitar o motor puro.
// Nenhum conteúdo real de história vive aqui — só o suficiente para os testes.

function q(p: Partial<SocialQuestion> & Pick<SocialQuestion, "id" | "formato">): SocialQuestion {
  return { tipo: "emocao", eixo: "RE", enunciado: "?", ...p } as SocialQuestion;
}

function story(p: Partial<SocialStory> & Pick<SocialStory, "id" | "faixa" | "nivel">): SocialStory {
  return {
    titulo: "T", objetivoClinico: "o", habilidadeTreinada: ["RE"],
    ambiente: { id: "ENV-001", nome: "Sala" }, personagens: [], cenas: [],
    ...p,
  } as SocialStory;
}

function answer(p: Partial<PatientAnswer> & Pick<PatientAnswer, "eixo" | "correta">): PatientAnswer {
  return {
    questionId: "x", tipo: "emocao", formato: "escolhaUnica", value: "a",
    primeira: true, tentativas: 0, tempoMs: 1000, usouDica: false, ...p,
  } as PatientAnswer;
}

// ── Seleção de histórias ────────────────────────────────────────────────────────
describe("selecionarHistorias", () => {
  const pool: SocialStory[] = [
    story({ id: "s1", faixa: "crianca", nivel: 1, habilidadeTreinada: ["RE"] }),
    story({ id: "s2", faixa: "crianca", nivel: 3, habilidadeTreinada: ["TM", "TP"] }),
    story({ id: "s3", faixa: "adolescente", nivel: 3, habilidadeTreinada: ["RE"] }),
  ];

  it("filtra por faixa", () => {
    expect(selecionarHistorias(pool, { faixa: "crianca" }).map((s) => s.id)).toEqual(["s1", "s2"]);
  });
  it("filtra por nível", () => {
    expect(selecionarHistorias(pool, { nivel: 3 }).map((s) => s.id)).toEqual(["s2", "s3"]);
  });
  it("filtra por foco (eixo) e ignora quando foco = 'todos'", () => {
    expect(selecionarHistorias(pool, { foco: "TM" }).map((s) => s.id)).toEqual(["s2"]);
    expect(selecionarHistorias(pool, { foco: "todos" })).toHaveLength(3);
  });
  it("combina filtros", () => {
    expect(selecionarHistorias(pool, { faixa: "crianca", foco: "RE" }).map((s) => s.id)).toEqual(["s1"]);
  });
});

describe("historiaSugerida", () => {
  const pool: SocialStory[] = [
    story({ id: "a", faixa: "crianca", nivel: 1 }),
    story({ id: "b", faixa: "crianca", nivel: 4 }),
    story({ id: "c", faixa: "crianca", nivel: 7 }),
  ];
  it("escolhe a de nível mais próximo do alvo", () => {
    expect(historiaSugerida(pool, "crianca", 5)?.id).toBe("b");
    expect(historiaSugerida(pool, "crianca", 1)?.id).toBe("a");
    expect(historiaSugerida(pool, "crianca", 7)?.id).toBe("c");
  });
  it("devolve null quando não há história na faixa", () => {
    expect(historiaSugerida(pool, "adulto", 3)).toBeNull();
  });
});

// ── Verificação de respostas ─────────────────────────────────────────────────────
describe("isPontuavel / verificarResposta", () => {
  it("item sem gabarito é mediado (não pontua)", () => {
    const aberta = q({ id: "m", formato: "abertaRegistrada" });
    expect(isPontuavel(aberta)).toBe(false);
    expect(verificarResposta(aberta, "qualquer")).toBeNull();
  });

  it("escolhaUnica / escolherExpressao", () => {
    const e = q({ id: "e", formato: "escolhaUnica", gabarito: "a", opcoes: [
      { id: "a", texto: "certa", correta: true }, { id: "b", texto: "errada", erroTipo: "ignorar-contexto" },
    ] });
    expect(verificarResposta(e, "a")).toBe(true);
    expect(verificarResposta(e, "b")).toBe(false);
    const face = q({ id: "f", formato: "escolherExpressao", gabarito: "x", opcoes: [{ id: "x", texto: "😀", correta: true }] });
    expect(verificarResposta(face, "x")).toBe(true);
    expect(verificarResposta(face, "y")).toBe(false);
  });

  it("multiplaSelecao ignora a ordem", () => {
    const m = q({ id: "m", formato: "multiplaSelecao", gabarito: ["a", "b"], opcoes: [
      { id: "a", texto: "a", correta: true }, { id: "b", texto: "b", correta: true }, { id: "c", texto: "c" },
    ] });
    expect(verificarResposta(m, ["b", "a"])).toBe(true);
    expect(verificarResposta(m, ["a"])).toBe(false);
    expect(verificarResposta(m, ["a", "b", "c"])).toBe(false);
  });

  it("ordenar respeita a ordem", () => {
    const o = q({ id: "o", formato: "ordenar", gabarito: ["a", "b", "c"] });
    expect(verificarResposta(o, ["a", "b", "c"])).toBe(true);
    expect(verificarResposta(o, ["a", "c", "b"])).toBe(false);
  });

  it("classificar: cada opção no balde da sua categoria", () => {
    const c = q({ id: "c", formato: "classificar", gabarito: "-", baldes: ["fato", "interpretacao"], opcoes: [
      { id: "o1", texto: "chove", categoria: "fato" },
      { id: "o2", texto: "está triste", categoria: "interpretacao" },
    ] });
    expect(verificarResposta(c, { o1: "fato", o2: "interpretacao" })).toBe(true);
    expect(verificarResposta(c, { o1: "interpretacao", o2: "interpretacao" })).toBe(false);
    expect(verificarResposta(c, { o1: "fato" })).toBe(false); // incompleto
  });

  it("escala aceita o valor do gabarito", () => {
    const s = q({ id: "s", formato: "escala", gabarito: "3", escala: { min: 1, max: 5 } });
    expect(verificarResposta(s, 3)).toBe(true);
    expect(verificarResposta(s, 2)).toBe(false);
  });
});

describe("erroTipoDaResposta", () => {
  const e = q({ id: "e", formato: "escolhaUnica", gabarito: "a", opcoes: [
    { id: "a", texto: "certa", correta: true },
    { id: "b", texto: "distrator", erroTipo: "leitura-emocional" },
  ] });
  it("devolve o erroTipo do distrator escolhido", () => {
    expect(erroTipoDaResposta(e, "b")).toBe("leitura-emocional");
  });
  it("resposta correta não tem erroTipo", () => {
    expect(erroTipoDaResposta(e, "a")).toBeUndefined();
  });
});

// ── Feedback progressivo ─────────────────────────────────────────────────────────
describe("feedback", () => {
  const e = q({ id: "e", formato: "escolhaUnica", gabarito: "a",
    dica1: "olhe o rosto", dica2: "junte as pistas",
    opcoes: [{ id: "a", texto: "está alegre", correta: true }, { id: "b", texto: "está com raiva" }] });

  it("item mediado apenas registra", () => {
    expect(feedback(e, null, 0).titulo).toBe("Resposta registrada");
  });
  it("acerto elogia a observação", () => {
    expect(feedback(e, true, 0).titulo).toBe("Boa observação!");
  });
  it("1º erro mostra a dica 1; 2º erro a dica 2", () => {
    const f1 = feedback(e, false, 1);
    expect(f1.titulo).toBe("Observe de novo");
    expect(f1.linhas.join(" ")).toContain("olhe o rosto");
    const f2 = feedback(e, false, 2);
    expect(f2.titulo).toBe("Quase lá");
    expect(f2.linhas.join(" ")).toContain("junte as pistas");
  });
  it("3º erro revela a leitura apoiada na pista (texto da correta)", () => {
    const f3 = feedback(e, false, 3);
    expect(f3.linhas.join(" ")).toContain("está alegre");
  });
});

// ── Montagem do resultado ────────────────────────────────────────────────────────
describe("montarResultado", () => {
  const st = story({ id: "s1", faixa: "crianca", nivel: 2 });
  const answers: PatientAnswer[] = [
    answer({ eixo: "RE", correta: true }),
    answer({ eixo: "RE", correta: false }),
    answer({ eixo: "TM", correta: true }),
    answer({ eixo: "RP", correta: null, formato: "abertaRegistrada" }), // mediada
  ];
  const r = montarResultado(st, answers, 240);

  it("separa itens abertos dos pontuáveis", () => {
    expect(r.itensAbertos).toHaveLength(1);
    expect(r.itensAbertos[0].eixo).toBe("RP");
  });
  it("acurácia global sobre os pontuáveis (2 de 3)", () => {
    expect(r.acuraciaGlobal).toBeCloseTo(2 / 3, 5);
  });
  it("acurácia por eixo", () => {
    expect(r.acuraciaPorEixo.RE).toBeCloseTo(0.5, 5);
    expect(r.acuraciaPorEixo.TM).toBe(1);
    expect(r.acuraciaPorEixo.RP as EixoSocial | undefined).toBeUndefined(); // mediada não entra
  });
  it("propaga metadados da história e a duração", () => {
    expect(r.storyId).toBe("s1");
    expect(r.faixa).toBe("crianca");
    expect(r.nivel).toBe(2);
    expect(r.duracaoSeg).toBe(240);
  });
});
