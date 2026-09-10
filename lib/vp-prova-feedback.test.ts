import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const EX = "components/exercises";
function codigo(file: string): string {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
}

/**
 * A regra dela de 28/ago: o que sai é a PALAVRA que julga; o que fica é a INFORMAÇÃO.
 * O modelo é o Cubo Corsi — o rótulo nomeia o CONTEÚDO, nunca o resultado.
 */
describe("nenhum exercício julga o paciente por escrito", () => {
  const arquivos = [
    `${EX}/executive/StroopTask.tsx`,
    `${EX}/processing/IdentificacaoSimbolos.tsx`,
    `${EX}/executive/DesafioOrcamento.tsx`,
    `${EX}/processing/Semaforo.tsx`,
    `${EX}/executive/EstacionamentoLogico.tsx`,
  ];

  it.each(arquivos)("%s não escreve julgamento na tela", (arquivo) => {
    const src = codigo(arquivo).toLocaleLowerCase("pt-BR");
    // Fronteira de palavra, não substring: "ops" casa dentro de "props", e um teste que reprova
    // por acidente é tão ruim quanto um que nunca reprova — ninguém confia nele depois.
    for (const p of [/errado!/, /\bincorreto\b/, /quase lá/, /quase perfeito/, /tente de novo/,
                     /perfeito!/, /parabéns/, /muito bem/, /\berrou\b/, /\bops\b/]) {
      expect(src, `julgamento na tela: ${p}`).not.toMatch(p);
    }
  });
});

/**
 * ⚠️ CONTRAPROVA — o teste mais importante deste conjunto.
 *
 * Em Sequência Temporal, "errado" é o ENUNCIADO da tarefa: a atividade pede para identificar o que
 * está errado numa sequência, e uma das alternativas é "Nada está errado". Em Desafio Cidade, é
 * conteúdo de história. Uma varredura por palavra — exatamente o tipo de limpeza que a regra de
 * 28/ago poderia sugerir — DESTRUIRIA os dois exercícios.
 *
 * Se este teste falhar, ninguém "limpou" nada: alguém quebrou uma atividade.
 */
describe("a palavra que é CONTEÚDO não pode ser varrida", () => {
  it("Sequência Temporal mantém o enunciado que pergunta o que está errado", () => {
    const src = readFileSync(`${EX}/attention/AntesDepois.tsx`, "utf8");
    expect(src, "o enunciado da tarefa foi removido por engano").toContain("O que está errado?");
    expect(src, "sumiu a alternativa 'Nada está errado'").toContain("Nada está errado");
  });

  it("Desafio Cidade mantém a história que fala em remédio errado", () => {
    const src = readFileSync(`${EX}/executive/DesafioCidade.tsx`, "utf8");
    expect(src, "conteúdo de história removido por engano").toMatch(/rem[eé]dio errado/i);
  });
});

describe("a informação clínica não foi apagada junto com o julgamento", () => {
  it("Stroop preserva a explicação da regra, que virou o retorno", () => {
    const src = codigo(`${EX}/executive/StroopTask.tsx`);
    expect(src, "sem a explicação da regra, a tela ficou muda").toMatch(/cor da tinta|palavra escrita/i);
  });

  it("Identificação de Símbolos passou a nomear o conteúdo, como o Cubo", () => {
    const src = codigo(`${EX}/processing/IdentificacaoSimbolos.tsx`);
    expect(src, "não nomeia mais qual era o símbolo").toMatch(/era este o s[ií]mbolo/i);
  });

  it("Desafio Orçamento nomeia o fato nos DOIS casos, não só no bom", () => {
    const src = codigo(`${EX}/executive/DesafioOrcamento.tsx`);
    expect(src).toMatch(/or[çc]amento respeitado/i);
    expect(src, "o caso ruim voltou a ser consolo em vez de fato").toMatch(/or[çc]amento excedido|fora do or[çc]amento/i);
  });

  it("Semáforo preserva o retorno imediato — só a palavra saiu", () => {
    // Tarefa de tempo de reação: o retorno imediato faz parte do que se mede. Tirar mudaria o
    // construto, e essa decisão é dela. O glifo e a cor ficam.
    const src = codigo(`${EX}/processing/Semaforo.tsx`);
    expect(src, "o retorno imediato do Semáforo sumiu").toMatch(/"✓"|"✗"/);
    expect(src, "as cores do retorno sumiram").toMatch(/text-green-400|text-red-400/);
  });
});
