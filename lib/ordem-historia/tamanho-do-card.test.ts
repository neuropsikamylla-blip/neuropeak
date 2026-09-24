import { describe, expect, it } from "vitest";
import { tamanhoDoCard, CARD_MIN, CARD_MAX, ALTURA_FORA_PADRAO, GAP_GRADE, MARGEM_LATERAL }
  from "./tamanho-do-card";

const TELAS = [
  { nome: "MacBook 13", larguraJanela: 1280, alturaJanela: 800 },
  { nome: "MacBook 14", larguraJanela: 1440, alturaJanela: 900 },
  { nome: "notebook 1366", larguraJanela: 1366, alturaJanela: 768 },
  { nome: "monitor", larguraJanela: 1920, alturaJanela: 1080 },
];
const colunasDe = (cenas: number) => (cenas <= 4 ? 2 : cenas <= 6 ? 3 : 4);

describe("tamanho do card de cena", () => {
  it.each(TELAS)("$nome: a grade inteira cabe na largura, em toda quantidade de cenas", (tela) => {
    for (const cenas of [4, 5, 6, 7, 8]) {
      const colunas = colunasDe(cenas);
      const card = tamanhoDoCard({ ...tela, cenas, colunas, proporcao: 1.2 });
      const grade = card * colunas + GAP_GRADE * (colunas - 1);
      expect(grade, `${tela.nome}, ${cenas} cenas: grade ${grade.toFixed(0)}px`)
        .toBeLessThanOrEqual(tela.larguraJanela - MARGEM_LATERAL + GAP_GRADE);
    }
  });

  it.each(TELAS)("$nome: a grade inteira cabe na altura — o botão não sai da tela", (tela) => {
    for (const cenas of [4, 5, 6, 7, 8]) {
      const colunas = colunasDe(cenas);
      const linhas = Math.ceil(cenas / colunas);
      const card = tamanhoDoCard({ ...tela, cenas, colunas, proporcao: 1.2 });
      const alturaGrade = (card / 1.2) * linhas + GAP_GRADE * (linhas - 1);
      const disponivel = tela.alturaJanela - ALTURA_FORA_PADRAO;
      // CARD_MIN pode estourar telas muito baixas de propósito: abaixo dele a cena fica
      // ilegível, e aí é melhor rolar a página do que não enxergar.
      if (card > CARD_MIN) {
        expect(alturaGrade, `${tela.nome}, ${cenas} cenas`).toBeLessThanOrEqual(disponivel + GAP_GRADE);
      }
    }
  });

  it("no computador a cena fica MAIOR que os tamanhos fixos antigos", () => {
    // Era o que ela reprovou: 250px para 5 cenas num notebook.
    const antes = (cenas: number) => (cenas <= 4 ? 300 : cenas <= 6 ? 250 : 210);
    for (const cenas of [5, 6, 8]) {
      const card = tamanhoDoCard({
        larguraJanela: 1440, alturaJanela: 900, cenas, colunas: colunasDe(cenas), proporcao: 1.2,
      });
      expect(card, `${cenas} cenas: ${card.toFixed(0)}px contra ${antes(cenas)}px antes`)
        .toBeGreaterThan(antes(cenas));
    }
  });

  it("respeita o piso e o teto", () => {
    const minuscula = tamanhoDoCard({ larguraJanela: 400, alturaJanela: 300, cenas: 8, colunas: 4, proporcao: 1.2 });
    expect(minuscula).toBe(CARD_MIN);
    const gigante = tamanhoDoCard({ larguraJanela: 5000, alturaJanela: 4000, cenas: 4, colunas: 2, proporcao: 1.2 });
    expect(gigante).toBe(CARD_MAX);
  });

  it("proporção inválida não quebra a conta", () => {
    for (const proporcao of [0, -1, NaN]) {
      const card = tamanhoDoCard({ larguraJanela: 1440, alturaJanela: 900, cenas: 6, colunas: 3, proporcao });
      expect(Number.isFinite(card), `proporção ${proporcao}`).toBe(true);
      expect(card).toBeGreaterThanOrEqual(CARD_MIN);
    }
  });
});

describe("o espaço fora da grade é medido, não chutado", () => {
  it("medir menos espaço reservado devolve cena maior", () => {
    const base = { larguraJanela: 1470, alturaJanela: 830, cenas: 5, colunas: 3, proporcao: 1.2 };
    const comPadrao = tamanhoDoCard(base);
    const comMedida = tamanhoDoCard({ ...base, alturaForaDaGrade: 175 });
    expect(comMedida, "medir o layout real tem de render mais que o padrão folgado")
      .toBeGreaterThan(comPadrao);
  });

  it("o padrão do primeiro render é folgado, nunca apertado", () => {
    // Errar para MENOS faria o botão de confirmar sumir: o contêiner do exercício é
    // `overflow: hidden`, então nada rola — o que não cabe desaparece.
    expect(ALTURA_FORA_PADRAO).toBeGreaterThanOrEqual(240);
  });

  it("mesmo com o layout medido, a grade continua cabendo na tela", () => {
    for (const medida of [150, 175, 200, 260]) {
      for (const cenas of [4, 5, 6, 8]) {
        const colunas = cenas <= 4 ? 2 : cenas <= 6 ? 3 : 4;
        const linhas = Math.ceil(cenas / colunas);
        const card = tamanhoDoCard({
          larguraJanela: 1470, alturaJanela: 830, cenas, colunas, proporcao: 1.2,
          alturaForaDaGrade: medida,
        });
        const alturaGrade = (card / 1.2) * linhas + GAP_GRADE * (linhas - 1);
        if (card > CARD_MIN) {
          expect(alturaGrade, `fora=${medida}, ${cenas} cenas`).toBeLessThanOrEqual(830 - medida + GAP_GRADE);
        }
      }
    }
  });
});
