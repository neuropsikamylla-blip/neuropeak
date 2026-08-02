import { describe, expect, it } from "vitest";
import {
  FUNCAO_DA_ETAPA, gerarRodada, matches, type Criterio, type Etapa,
} from "./commands";
import { charById, type FocusChar } from "./roster";

const ETAPAS: Etapa[] = [
  "cor", "acessorio", "corAcessorio", "doisAlvos", "mudancaRegra", "inibicao",
];

const personagensDa = (ids: string[]) =>
  ids.map(charById).filter((c): c is FocusChar => !!c);

const criteriosValidos = (criterio: Criterio, criterios?: Criterio[]) =>
  criterios ?? [criterio];

describe("FOCUS gerador de comandos", () => {
  it("mapeia cada etapa para sua função cognitiva", () => {
    expect(FUNCAO_DA_ETAPA).toEqual({
      cor: "seletiva",
      acessorio: "seletiva",
      corAcessorio: "seletiva",
      doisAlvos: "memoriaTrabalho",
      mudancaRegra: "flexibilidade",
      inibicao: "inibicao",
    });
  });

  it("mantém a quantidade de alvos válida em todas as etapas e tamanhos", () => {
    for (const etapa of ETAPAS) {
      for (let n = 7; n <= 12; n++) {
        for (let i = 0; i < 200; i++) {
          const r = gerarRodada(etapa, n);
          const chars = personagensDa(r.personagensIds);
          const validos = chars.filter((c) =>
            criteriosValidos(r.criterio, r.criterios).some((k) => matches(c, k)),
          );

          expect(validos.length, `${etapa}/${n}: ${r.texto}`).toBe(r.alvoIds.length);
          expect(new Set(validos.map((c) => c.id))).toEqual(new Set(r.alvoIds));
          expect(r.alvoId).toBe(r.alvoIds[0]);
          expect(r.personagensIds).toHaveLength(n);
          expect(r.texto.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it("nunca usa personagem de emoção", () => {
    for (const etapa of ETAPAS) {
      for (let i = 0; i < 30; i++) {
        const r = gerarRodada(etapa, 7);
        for (const id of r.personagensIds) {
          expect(/alegria|raiva|tristeza/.test(id)).toBe(false);
        }
      }
    }
  });

  it("inclui distrator semelhante quando solicitado", () => {
    for (let i = 0; i < 40; i++) {
      const r = gerarRodada("corAcessorio", 10, undefined, true);
      const alvo = charById(r.alvoId)!;
      const outros = personagensDa(r.personagensIds.filter((id) => id !== r.alvoId));
      const temSemelhante = outros.some((c) =>
        c.cor === alvo.cor ||
        c.acessorios.some((a) => alvo.acessorios.includes(a)) ||
        (!!alvo.objeto && c.objeto === alvo.objeto),
      );

      expect(temSemelhante).toBe(true);
      expect(r.distratoresSemelhantes).toBe(true);
    }
  });

  it("gera dois alvos distintos e sem sobreposição", () => {
    for (let i = 0; i < 200; i++) {
      const r = gerarRodada("doisAlvos", 10);
      expect(r.alvoIds).toHaveLength(2);
      expect(new Set(r.alvoIds).size).toBe(2);
      expect(r.criterios).toHaveLength(2);

      const [alvoA, alvoB] = personagensDa(r.alvoIds);
      const [criterioA, criterioB] = r.criterios!;
      expect(matches(alvoA, criterioA)).toBe(true);
      expect(matches(alvoB, criterioB)).toBe(true);
      expect(matches(alvoA, criterioB)).toBe(false);
      expect(matches(alvoB, criterioA)).toBe(false);
    }
  });

  it("não deixa distrator satisfazer nenhum critério de dois alvos", () => {
    for (let i = 0; i < 200; i++) {
      const r = gerarRodada("doisAlvos", 10);
      const distratores = personagensDa(
        r.personagensIds.filter((id) => !r.alvoIds.includes(id)),
      );

      for (const personagem of distratores) {
        expect(r.criterios!.some((k) => matches(personagem, k))).toBe(false);
      }
    }
  });

  it("mantém exatamente uma armadilha não alvo na mudança de regra", () => {
    for (let i = 0; i < 200; i++) {
      const r = gerarRodada("mudancaRegra", 10);
      expect(r.criterioAbandonado).toBeDefined();
      const abandonado = r.criterioAbandonado!;
      const mudaCor = abandonado.cor !== undefined;
      expect(r.criterio.cor !== undefined).toBe(mudaCor);
      if (mudaCor) {
        expect(r.criterio.cor).not.toBe(abandonado.cor);
        expect(r.criterio.acessorios).toBeUndefined();
      } else {
        expect(r.criterio.acessorios?.[0]).not.toBe(abandonado.acessorios?.[0]);
        expect(r.criterio.cor).toBeUndefined();
      }
      const abandonados = personagensDa(r.personagensIds).filter((c) =>
        matches(c, abandonado),
      );

      expect(abandonados).toHaveLength(1);
      expect(r.alvoIds).toHaveLength(1);
      expect(abandonados[0].id).not.toBe(r.alvoId);
      expect(r.texto.toLocaleLowerCase("pt-BR")).toContain("não");
    }
  });

  it("mantém a inibição negativa em pelo menos 80% das rodadas", () => {
    let negativos = 0;
    for (let i = 0; i < 200; i++) {
      if (gerarRodada("inibicao", 10).negativo) negativos++;
    }
    expect(negativos).toBeGreaterThanOrEqual(160);
  });
});
