import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROBLEMA_TUTORIAL } from "./banco";
import { verificacoesPermitidas, CONFIGURACAO_VERIFICACOES } from "./interacao";

const ARQUIVO = "components/exercises/executive/DeductiveGrid.tsx";

function codigo(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
}

/**
 * CONTRATO DA TELA, aprovado por ela em 09/set/2026 depois de usar o tutorial:
 * "Tutorial aprovado visual e funcionalmente. Não mexer mais na estrutura desta tela."
 *
 * Cada teste aqui é um item da lista que ela mandou MANTER. Não são preferências de
 * implementação: são a tela que ela validou com as mãos. Se um destes cair, a mudança está
 * fora do que foi aprovado e precisa voltar a ela — não ser "consertada" no teste.
 */
describe("contrato da tela aprovada por ela", () => {
  const src = codigo(ARQUIVO);

  it("1. as pistas ficam sempre visíveis — não há como ocultá-las", () => {
    expect(src, "sumiu a lista de pistas").toContain("puzzle.pistas.map");
    // Nenhum estado de mostrar/ocultar: recolher no celular é questão de espaço (seção 12 dela),
    // nunca um botão que esconde a informação e obriga a memorizar.
    expect(src, "apareceu um estado que oculta as pistas")
      .not.toMatch(/(?:ocultarPistas|mostrarPistas|pistasVisiveis|colapsarPistas)/i);
  });

  it("2. o paciente risca E restaura pistas — o sistema nunca risca sozinho", () => {
    expect(src).toContain("clue_crossed");
    expect(src, "sem clue_uncrossed não há como restaurar").toContain("clue_uncrossed");
    expect(src, "o risco tem de ser um gesto do paciente").toMatch(/onClick=\{\(\) => alternarPista/);
  });

  it("3 e 4. uma escolha por célula, e sempre trocável", () => {
    // Um valor por célula: o estado é ValorCelula (string | null), nunca uma lista.
    expect(src).toMatch(/Record<string, ValorCelula\[\]>/);
    expect(src, "não pode existir trava que impeça mudar de ideia")
      .not.toMatch(/n[ãa]o pode (?:mais )?(?:trocar|alterar)|bloqueia(?:r)?Troca/i);
    expect(src, "sumiu o Limpar da célula").toContain("Limpar");
  });

  it("5. a grade é por POSIÇÃO — uma coluna por posição do problema", () => {
    expect(src).toMatch(/length: puzzle\.posicoes/);
  });

  it("6. no TUTORIAL a verificação é livre", () => {
    // Prova funcional, não varredura: é a regra que vale, não a linha que a escreve.
    expect(verificacoesPermitidas(PROBLEMA_TUTORIAL.nivel, true)).toBe("livre");
    expect(src, "a tela precisa pedir a cota do tutorial como tutorial")
      .toMatch(/verificacoesPermitidas\(PROBLEMA_TUTORIAL\.nivel,\s*true\)/);
  });

  it("7. Concluir NUNCA revela a solução", () => {
    // A tela não pode nem tocar no gabarito: a conferência é feita por gradeEstaCorreta,
    // dentro de lib/grade. Se `.solucao` aparecer aqui, alguém tem o gabarito em mãos na tela.
    expect(src, "o componente passou a acessar o gabarito diretamente").not.toMatch(/\.solucao\b/);
    expect(src).toContain("gradeEstaCorreta");
  });
});

describe("nos problemas reais, a verificação é progressivamente limitada", () => {
  it("3 nos iniciais, 2 no intermediário, 1 nos avançados", () => {
    expect(verificacoesPermitidas(1, false)).toBe(3);
    expect(verificacoesPermitidas(2, false)).toBe(3);
    expect(verificacoesPermitidas(3, false)).toBe(2);
    expect(verificacoesPermitidas(4, false)).toBe(1);
    expect(verificacoesPermitidas(5, false)).toBe(1);
  });

  it("nenhum problema real herda o 'livre' do tutorial", () => {
    // O defeito silencioso a evitar: um nível novo entrar na configuração sem cota e cair
    // no caso livre, devolvendo ao paciente a ajuda ilimitada que ela retirou de propósito.
    for (const nivel of [1, 2, 3, 4, 5] as const) {
      expect(verificacoesPermitidas(nivel, false), `nível ${nivel}`).not.toBe("livre");
    }
    expect(Object.keys(CONFIGURACAO_VERIFICACOES.porNivel).sort()).toEqual(["1", "2", "3", "4", "5"]);
  });
});
