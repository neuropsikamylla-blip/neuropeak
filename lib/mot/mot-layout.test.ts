import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 23/set/2026 — ela reprovou: "quando PARA a tela treme (isso nao pode acontecer)".
// Causa: o botão de confirmar e a mensagem de resultado eram blocos CONDICIONAIS soltos na
// coluna. Ao aparecerem, a coluna crescia e empurrava o palco para cima — e num exercício de
// rastreamento isso invalida a tarefa, porque o paciente fixa as posições das bolas na tela.
//
// Conserto, na solução dela: o gesto de resposta é a confirmação ("se eu cliquei já segue"),
// e o rodapé virou uma faixa única de altura fixa.

const FONTE = readFileSync(resolve(__dirname, "../../components/exercises/attention/MOT.tsx"), "utf-8");

describe("MOT — o palco não pode se deslocar", () => {
  it("não existe botão de confirmar", () => {
    expect(FONTE).not.toContain("Confirmar →");
    expect(FONTE).not.toMatch(/Selecione mais \$\{/);
    expect(FONTE, "sobrou um <button> que pode aparecer e empurrar o palco").not.toMatch(/<button[\s\S]{0,200}handleConfirm/);
  });

  it("o rodapé tem altura FIXA reservada", () => {
    expect(FONTE).toContain("const ALTURA_RODAPE");
    expect(FONTE).toMatch(/height:\s*ALTURA_RODAPE/);
  });

  it("nenhum bloco condicional é irmão do palco na coluna", () => {
    // Pega o miolo da coluna, do palco até o fim, e exige que todo `{cond && (` tenha
    // sumido dali — o que resta é o rodapé de altura fixa, com o ternário DENTRO dele.
    const corpo = FONTE.slice(FONTE.indexOf("{/* Ball area"));
    const condicionaisSoltos = corpo.match(/^\s{8}\{[a-zA-Z][\w.!== ]*&& \(/gm) ?? [];
    expect(condicionaisSoltos, `blocos condicionais soltos na coluna:\n${condicionaisSoltos.join("\n")}`).toEqual([]);
  });

  it("o texto não revela quantos alvos são", () => {
    // Dizer "selecione exatamente 3" entrega parte da tarefa: quantos eram é justamente
    // o que o paciente tinha de ter memorizado.
    expect(FONTE).toContain("Selecione as bolas alvo");
    expect(FONTE).not.toMatch(/Selecione exatamente \{k\}/);
  });

  it("o clique na última bola confirma sozinho", () => {
    expect(FONTE).toMatch(/if \(next\.size === k\) confirmarSelecao\(next\)/);
  });
});
