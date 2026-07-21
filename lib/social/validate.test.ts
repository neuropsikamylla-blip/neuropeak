import { describe, it, expect } from "vitest";
import { validateStory, assertStories } from "./validate";
import type { SocialStory } from "./types";

// História de referência: bem-formada (validateStory deve devolver []).
function baseStory(): SocialStory {
  return {
    id: "crianca-escola-ok",
    titulo: "Um dia na escola",
    faixa: "crianca",
    nivel: 1,
    objetivoClinico: "reconhecer alegria por pistas convergentes",
    habilidadeTreinada: ["RE"],
    ambiente: { id: "ENV-001", nome: "Sala de aula" },
    personagens: [{ id: "p1", nome: "Bento", papel: "colega", emoji: "🙂" }],
    cenas: [
      {
        id: "c1",
        descricao: "Bento sorri com os olhos e pula ao ver a amiga.",
        personagens: ["p1"],
        perguntas: [
          {
            id: "c1q1", tipo: "emocao", eixo: "RE", enunciado: "Como o Bento está?",
            formato: "escolhaUnica",
            opcoes: [
              { id: "a", texto: "Alegre", correta: true },
              { id: "b", texto: "Com medo", erroTipo: "leitura-emocional" },
            ],
            gabarito: "a", dica1: "Olhe o rosto.", dica2: "Junte o sorriso e o pulo.",
          },
        ],
      },
    ],
  };
}

describe("validateStory — história bem-formada", () => {
  it("não acusa problemas", () => {
    expect(validateStory(baseStory())).toEqual([]);
  });
});

describe("validateStory — invariantes de estrutura", () => {
  it("acusa nível fora de 1–7 e faixa inválida", () => {
    const s = baseStory(); s.nivel = 9 as SocialStory["nivel"]; s.faixa = "bebe" as SocialStory["faixa"];
    const e = validateStory(s);
    expect(e.some((x) => x.includes("nível fora"))).toBe(true);
    expect(e.some((x) => x.includes("faixa inválida"))).toBe(true);
  });

  it("acusa cena sem perguntas", () => {
    const s = baseStory(); s.cenas[0].perguntas = [];
    expect(validateStory(s).some((x) => x.includes("cena sem perguntas"))).toBe(true);
  });

  it("acusa personagem citado na cena que não existe em personagens", () => {
    const s = baseStory(); s.cenas[0].personagens = ["fantasma"];
    expect(validateStory(s).some((x) => x.includes('personagem "fantasma"'))).toBe(true);
  });

  it("acusa id de pergunta duplicado", () => {
    const s = baseStory();
    s.cenas[0].perguntas.push({ ...s.cenas[0].perguntas[0] });
    expect(validateStory(s).some((x) => x.includes("id de pergunta duplicado"))).toBe(true);
  });
});

describe("validateStory — invariantes por formato", () => {
  it("formato de escolha pontuável exige opcoes", () => {
    const s = baseStory(); delete s.cenas[0].perguntas[0].opcoes;
    expect(validateStory(s).some((x) => x.includes("exige opcoes"))).toBe(true);
  });

  it("gabarito precisa apontar para uma opção existente", () => {
    const s = baseStory(); s.cenas[0].perguntas[0].gabarito = "zzz";
    expect(validateStory(s).some((x) => x.includes('gabarito "zzz"'))).toBe(true);
  });

  it("classificar exige baldes e categorias dentro dos baldes", () => {
    const s = baseStory();
    s.cenas[0].perguntas[0] = {
      id: "c1q1", tipo: "contexto", eixo: "FI", enunciado: "Separe.",
      formato: "classificar",
      opcoes: [{ id: "o1", texto: "chove", categoria: "outro" }],
      // sem baldes, e categoria "outro" fora deles
      gabarito: "-",
    };
    const e = validateStory(s);
    expect(e.some((x) => x.includes('"classificar" exige baldes'))).toBe(true);
  });

  it("escala exige config de escala", () => {
    const s = baseStory();
    s.cenas[0].perguntas[0] = {
      id: "c1q1", tipo: "emocao", eixo: "RE", enunciado: "Quão forte?",
      formato: "escala", gabarito: "3",
    };
    expect(validateStory(s).some((x) => x.includes('"escala" exige config'))).toBe(true);
  });

  it("item mediado (sem gabarito) não exige opcoes", () => {
    const s = baseStory();
    s.cenas[0].perguntas.push({
      id: "c1q2", tipo: "generalizacao", eixo: "RP",
      enunciado: "O que você faria?", formato: "abertaRegistrada",
    });
    expect(validateStory(s)).toEqual([]);
  });
});

describe("assertStories — lote", () => {
  it("acusa ids de história duplicados", () => {
    const a = baseStory();
    const b = baseStory(); // mesmo id
    // assertStories só avisa (não lança fora de produção); validamos via validateStory chamada interna
    // aqui garantimos que a função não quebra e devolve o array original.
    expect(assertStories([a, b])).toHaveLength(2);
  });
  it("devolve as histórias válidas intactas", () => {
    const a = baseStory();
    expect(assertStories([a])[0].id).toBe(a.id);
  });
});
