import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ARQUIVO = "components/exercises/executive/DeductiveGrid.tsx";

/** O arquivo SEM comentários e SEM os textos de comentário JSX: um teste que varre o texto cru
 *  acusa a própria explicação do conserto. O que precisa ser provado é o código que roda. */
function codigo(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
}

// Prova de aceite do VP, escrita ANTES de ver a entrega do Codex e independente da suíte dele.
// Todos os itens abaixo são regra clínica fechada, não preferência: a decisão da mecânica
// (docs/grade-dedutiva/DECISOES-MECANICA-20260903.md) e as seções 10-17 da espec dela.
// O que estes testes protegem é AUSÊNCIA — o que a tela NÃO pode fazer —, que é justamente
// o que uma suíte de presença nunca pega.
describe("Grade Dedutiva — a tela cala o que tem de calar", () => {
  const src = codigo(ARQUIVO);

  it("não existe estado de marcação × / ? / ✓ na interface", () => {
    // Decisão 1 e 2: UMA marcação, sem segundo passo de confirmação. A célula tem valor ou está
    // vazia. Os glifos dos quatro estados antigos não podem reaparecer como conteúdo de célula.
    expect(src, "o ✓ de 'confirmado' voltou à tela").not.toMatch(/["'`]\s*✓\s*["'`]/);
    expect(src, "o ✗/× de 'impossível' voltou à tela").not.toMatch(/["'`]\s*[✗×✘]\s*["'`]/);
    expect(src, "o ? de 'hipótese' voltou à tela como marcação").not.toMatch(/["'`]\s*\?\s*["'`]/);
  });

  it("não chama atribuição não determinada de confirmação prematura nem de impulsividade", () => {
    // A correção conceitual do gestor de conteúdo (decisão 3), e a mais fácil de violar sem querer:
    // com uma marcação só, a interface NÃO distingue "tenho certeza" de "vou testar". Classificar
    // seria inferir estado mental a partir de comportamento. O sistema descreve; quem interpreta
    // é a profissional. Vale para o código E para o metadata que chega ao relatório dela.
    for (const proibido of [/prematur/i, /impulsiv/i, /premature/i, /precipit/i]) {
      expect(src, `o termo interpretativo ${proibido} entrou no código`).not.toMatch(proibido);
    }
  });

  it("nenhum vermelho de alarme: a duplicidade sinaliza em âmbar, discreta", () => {
    // Decisão 5. Vermelho é a linguagem do erro, e a duplicidade não é erro de dedução — é regra
    // operacional do jogo. Contradição com as pistas não sinaliza de forma nenhuma.
    expect(src, "classe de vermelho do Tailwind na tela da grade").not.toMatch(/\b(?:bg|text|border|ring)-red-\d/);
    expect(src, "vermelho literal na tela da grade").not.toMatch(/#(?:[eEfF][0-9a-fA-F]{2}[0-3][0-9a-fA-F]{2}[0-3][0-9a-fA-F]{2})\b/);
  });

  it("a tela nunca escreve a palavra erro, nem avalia o paciente", () => {
    // Seções 14-17: nada de "ERRADO", nada de julgamento. "Sua organização ainda contém
    // incompatibilidades" é o limite superior do que a tela pode dizer.
    for (const proibido of [
      /["'`>][^"'`<]*\bERRAD/i, /\bquase l[áa]\b/i, /\bcuidado\b/i,
      /\bparab[ée]ns\b/i, /\bmuito bem\b/i, /\bexcelente\b/i,
    ]) {
      expect(src, `texto avaliativo na tela: ${proibido}`).not.toMatch(proibido);
    }
    // Ícone de alerta é a mesma denúncia por outro meio. O estado antigo trazia
    // "⚠️ Algumas células estão erradas — reveja as pistas!", que é exatamente o que a
    // seção 14 proíbe: o software fazendo o monitoramento de erro no lugar do paciente.
    expect(src, "ícone de alerta na tela do exercício").not.toMatch(/[⚠❌🚫❗]/);
  });

  it("não há placar, cronômetro visível nem contagem de erros", () => {
    // Seção 11 e o princípio da Torre: "o paciente precisa resolver o problema, e não jogar
    // contra o placar". Pontuação existe no metadata, nunca na tela.
    expect(src, "contador de erros na tela").not.toMatch(/\berros?\s*:\s*\{/i);
    expect(src, "placar de pontos na tela").not.toMatch(/\b(?:pontos|pontua[çc][ãa]o|score)\s*:\s*\{/i);
  });

  it("a mensagem de verificação não nomeia categoria, valor nem número de pista", () => {
    // Seção 15: "VERIFICAR RACIOCÍNIO não entrega a solução... nunca a célula". A prova é sobre o
    // texto que a tela produz: nenhuma interpolação pode entrar numa string de verificação.
    const mensagens = src.match(/["'`][^"'`\n]*incompatibilidade[^"'`\n]*["'`]/gi) ?? [];
    expect(mensagens.length, "sumiu a mensagem de verificação").toBeGreaterThan(0);
    for (const m of mensagens) {
      expect(m, `a mensagem de verificação interpola um dado do puzzle: ${m}`).not.toMatch(/\$\{/);
      expect(m, `a mensagem de verificação cita uma pista específica: ${m}`).not.toMatch(/\bpista\s*\d/i);
    }
  });
});

describe("Grade Dedutiva — o que a tela precisa manter", () => {
  const src = codigo(ARQUIVO);

  it("o palco continua recebendo o rootBg, e não uma cor literal", () => {
    // Regressão real de 27/ago/2026, que já custou o tema do Jogo da Memória numa migração:
    // a reescrita não pode trocar os três gradientes por um "#ffffff". lib/layout/palco.test.ts
    // trava o mesmo contrato; aqui fica junto do resto da prova da Grade.
    expect(src, "rootBg sumiu na reescrita").toMatch(/const rootBg/);
    expect(src, "o palco tem de receber o rootBg").toContain("background={rootBg.background as string}");
  });

  it("as pistas são riscadas pelo paciente, e o sistema nunca risca sozinho", () => {
    // Decisão 4: clue_crossed / clue_uncrossed são eventos do PACIENTE. É o dado de estratégia
    // que ela pediu — em que ordem trabalhou as pistas, se volta a uma que já dera por resolvida.
    expect(src, "os eventos de pista não estão sendo registrados").toMatch(/clue_crossed/);
    expect(src, "não há como desmarcar o risco de uma pista").toMatch(/clue_uncrossed/);
  });

  it("a grade consulta o motor de verdade, não um solver improvisado na tela", () => {
    expect(src, "a tela não está usando lib/grade").toMatch(/from\s+["']@\/lib\/grade/);
  });
});

describe("Grade Dedutiva — a tela de instruções ensina a mecânica que existe", () => {
  // Achado da revisão da colheita: a reescrita trocou a mecânica dentro do exercício, mas a
  // tela de instruções — a PRIMEIRA coisa que o paciente lê — continuava ensinando
  // "1x = SIM ✓, 2x = NÃO ✗" e "Confirme quando tiver certeza", que contradiz frontalmente a
  // decisão de que o clique não é declaração de certeza.
  const rota = codigo("app/(patient)/treino/[exercicio]/page.tsx");
  const bloco = rota.slice(rota.indexOf('"deductive-grid": ['));
  const instrucoes = bloco.slice(0, bloco.indexOf("],") + 2);

  it("as instruções não ensinam os estados que deixaram de existir", () => {
    expect(instrucoes, "as instruções ainda falam em ✓/✗").not.toMatch(/[✓✗×]/);
    expect(instrucoes, "as instruções ainda pedem certeza antes de marcar").not.toMatch(/certeza/i);
  });

  it("as instruções contam o que a tela realmente faz", () => {
    expect(instrucoes, "não explicam que a escolha pode ser trocada").toMatch(/trocar/i);
    expect(instrucoes, "não explicam que a pista se risca").toMatch(/ris[cq]/i);
  });
});
