import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** Remove comentários antes de verificar texto de interface: o paciente não lê comentários. */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/estimulo-continuo.tsx");
const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");

describe("Regra 11 — três modos oficiais", () => {
  it("mantém modo opcional, com completa como padrão", () => {
    const types = source("lib/tutorial/types.ts");
    expect(types).toMatch(/modo\?:\s*"completa" \| "continua" \| "explicativo"/);
    expect(runner()).toMatch(/const modo = definition\.modo \?\? "completa"/);

    for (const approvedFamily of [
      "span-numerico.tsx",
      "letras-sequencia.tsx",
      "sequencia-itens.tsx",
      "sequencia-espacial.tsx",
      "conjunto-selecao.tsx",
    ]) {
      expect(source(`lib/tutorial/definitions/${approvedFamily}`)).not.toMatch(/\bmodo\s*:/);
    }
  });

  it("no explicativo exibe a explicação e não monta Demonstration", () => {
    const blocoDemo = runner().slice(
      runner().indexOf('{phase === "demo" && ('),
      runner().indexOf('{phase === "handoff" && ('),
    );
    const explanatoryBranch = blocoDemo.slice(blocoDemo.indexOf('modo === "explicativo"'));
    const beforeElse = explanatoryBranch.slice(0, explanatoryBranch.indexOf(") : ("));

    // A explicação é um ARRAY de linhas: a regra costuma ter casos ("quando X, faça"; "quando Y,
    // não faça"), e lê-los separados é justamente o que torna a explicação clara.
    expect(beforeElse).toMatch(/\(definition\.explicacao \?\? \[\]\)\.map/);
    expect(beforeElse).toMatch(/Agora começa o treino\./);
    expect(beforeElse).not.toMatch(/definition\.Demonstration/);
    // Regra 11 revisada: o modo Explicação vai direto ao treino, sem passar pelo handoff.
    expect(beforeElse).toMatch(/onClick=\{onFinish\}/);
    expect(beforeElse).not.toMatch(/setPhase\("handoff"\)/);
  });

  it("o modo Explicação NÃO tem tentativa guiada — regra 11 revisada em 07/ago/2026", () => {
    /*
     * Este teste substitui um que exigia o contrário ("o explicativo conserva handoff, guided e
     * feedback obrigatórios"). Ela revogou aquela exigência: quando a mecânica se compreende só
     * pela explicação, a guiada vira complexidade sem retorno. A troca é de REGRA, não
     * afrouxamento — o teste novo é tão restritivo quanto o antigo, no sentido oposto.
     */
    const blocoDemo = runner().slice(
      runner().indexOf('{phase === "demo" && ('),
      runner().indexOf('{phase === "handoff" && ('),
    );
    const explicativo = blocoDemo.slice(
      blocoDemo.indexOf('modo === "explicativo"'),
      blocoDemo.indexOf(") : ("),
    );
    expect(explicativo).toMatch(/onClick=\{onFinish\}/);
    expect(explicativo).toMatch(/Iniciar treino/);
    expect(semComentarios(explicativo)).not.toMatch(/tentativa guiada/);

    // O modo Demonstração continua com o fluxo completo — a revogação não o alcança.
    expect(runner()).toMatch(/phase === "handoff"[\s\S]*setPhase\("guided"\)/);
    expect(runner()).toMatch(/phase === "guided"[\s\S]*definition\.GuidedAttempt/);
    expect(runner()).toMatch(/setPhase\("feedback"\)/);
  });
});

describe("Família 4 — estímulo contínuo", () => {
  const continuousDemos = [
    "semaforoDemo",
    "tempoReacaoDemo",
    "dualTaskDemo",
  ];

  it.each(continuousDemos)("%s contém alvo e não-alvo", (name) => {
    const start = definition().indexOf(`const ${name}`);
    const block = definition().slice(start, definition().indexOf("];", start) + 2);
    expect(block).toContain("isTarget: true");
    expect(block).toContain("isTarget: false");
  });

  it("a fábrica recusa demonstração contínua incompleta", () => {
    expect(definition()).toMatch(/hasTarget[\s\S]*hasNonTarget/);
    expect(definition()).toMatch(/if \(!hasTarget \|\| !hasNonTarget\)/);
  });

  it("mostra espera deliberada, sem esconder nem deslocar o cursor", () => {
    expect(definition()).toMatch(/const WAIT_LABEL = "agora não"/);
    expect(definition()).toMatch(/data-wait-label/);
    expect(definition()).toMatch(/O seletor não muda:[\s\S]*setWaiting\(true\)/);
    expect(definition()).toMatch(/<DemoPointer/);
  });

  it("não contém emoji", () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
    expect(definition()).not.toMatch(emoji);
  });

  it("reusa o ritmo calibrado e acrescenta somente o tempo de espera", () => {
    expect(definition()).toMatch(/import \{ RITMO_TUTORIAL_APROVADO \}/);
    expect(definition().match(/const [A-Z][A-Z_]*_MS\s*=/g) ?? []).toEqual([
      "const DELIBERATE_WAIT_MS =",
    ]);
  });

  it("a guiada não possui timeout para o alvo", () => {
    const guided = definition().slice(
      definition().indexOf("function criarGuidedAttempt"),
      definition().indexOf("function criarTutorialEstimuloContinuo"),
    );
    expect(guided).toMatch(/if \(!stimulus \|\| stimulus\.isTarget\) return/);
    expect(guided).toMatch(/Um alvo não possui timeout/);
  });

  it("usa os quatro textos que continuam nesta família e não menciona teclado nem toque", () => {
    const instructions = [
      "Clique em avançar somente quando o sinal abrir.",
      "Clique assim que o sinal aparecer.",
      "Responda às duas tarefas conforme elas aparecerem.",
      "Clique em certo ou errado conforme a operação.",
    ];
    for (const instruction of instructions) expect(definition()).toContain(instruction);
    expect(definition()).not.toMatch(/teclado|toque/i);
  });

  it("o modo é escolhido POR EXERCÍCIO, não pela família", () => {
    // Validação dela de 07/ago/2026: o semaforo saiu de contínua para explicativo porque a
    // demonstração animada tornou o entendimento mais artificial. A família deixou de ter um modo
    // único — e é exatamente isso que este teste protege.
    const semaforo = definition().slice(definition().indexOf('exerciseId: "semaforo"'));
    expect(semaforo).toMatch(/modo: "explicativo"/);
    // Corrigido em 09/ago/2026, na validação dela. O texto anterior — "clique" / "não clique" —
    // descrevia uma mecânica que o exercício não tem: existem DOIS botões e sempre se responde em
    // um deles. E omitia o amarelo, que sai em 10% dos sinais e também pede PARAR, de modo que o
    // paciente podia encontrar no treino uma cor que o tutorial nunca lhe apresentou.
    expect(semaforo).toMatch(/Quando o sinal abrir em verde, clique em AVANÇAR\./);
    expect(semaforo).toMatch(/Quando estiver vermelho ou amarelo, clique em PARAR\./);
    // A regra ensinada precisa cobrir as três cores que o sorteio produz.
    const explicacaoDoSemaforo = semaforo.slice(0, semaforo.indexOf("guidedInstruction"));
    for (const cor of ["verde", "vermelho", "amarelo"]) {
      expect(explicacaoDoSemaforo).toContain(cor);
    }


    // Classificação dela de 07/ago/2026 para os exercícios que continuam nesta família.
    const modoDe = (exerciseId: string) => {
      const trecho = definition().slice(definition().indexOf(`exerciseId: "${exerciseId}"`));
      return trecho.slice(0, trecho.indexOf("guidedInstruction")).match(/modo: "(\w+)"/)?.[1];
    };

    expect(modoDe("semaforo")).toBe("explicativo");
    expect(modoDe("tempo-reacao")).toBe("explicativo");
    expect(modoDe("certo-ou-errado")).toBe("explicativo");

    expect(modoDe("dual-task")).toBe("continua");
  });

  it("registra os seis e preserva os 19 convertidos", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const register = page.slice(
      page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
      page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
    );
    const converted = register.match(/(?:"[a-z-]+"|[a-z]+):\s*[a-zA-Z]+Tutorial/g) ?? [];
    expect(converted).toHaveLength(19);
    for (const exerciseId of [
      "semaforo",
      "vigilancia",
      "tempo-reacao",
      "dual-task",
      "mot",
      "certo-ou-errado",
    ]) {
      expect(register).toContain(exerciseId);
    }
  });

  it("remove os tutoriais legados dos seis exercícios convertidos", () => {
    const exercises = [
      "components/exercises/processing/Semaforo.tsx",
      "components/exercises/attention/Vigilancia.tsx",
      "components/exercises/processing/TempoReacao.tsx",
      "components/exercises/attention/DualTask.tsx",
      "components/exercises/attention/MOT.tsx",
      "components/exercises/processing/CertoOuErrado.tsx",
    ];
    for (const exercise of exercises) {
      expect(source(exercise)).not.toMatch(/TutorialBase|showTutorial|function \w*Tutorial/);
    }
  });
});

describe("regra 11 consolidada — na dúvida, Fluxo 1", () => {
  const runner = () =>
    readFileSync(resolve(process.cwd(), "components/exercises/tutorial/TutorialRunner.tsx"), "utf8");

  it("o padrão do framework é DEMONSTRAÇÃO — o desempate está no código", () => {
    /*
     * Ela consolidou em 08/ago/2026: havendo dúvida sobre qual fluxo usar, vence o Fluxo 1. O
     * Fluxo 2 exige SEGURANÇA de que a explicação sozinha basta para quem nunca viu o exercício.
     *
     * Isto não é só documentação: uma definição que não declara `modo` cai em demonstração. Optar
     * pela explicação é um ato deliberado, nunca um descuido.
     */
    expect(runner()).toMatch(/definition\.modo \?\? "completa"/);
  });

  it("nenhuma definição cai em explicação por omissão", () => {
    const definicoes = [
      "lib/tutorial/definitions/span-numerico.tsx",
      "lib/tutorial/definitions/letras-sequencia.tsx",
      "lib/tutorial/definitions/sequencia-itens.tsx",
      "lib/tutorial/definitions/sequencia-espacial.tsx",
      "lib/tutorial/definitions/conjunto-selecao.tsx",
      "lib/tutorial/definitions/estimulo-continuo.tsx",
      "lib/tutorial/definitions/focus-agents.tsx",
      "lib/tutorial/definitions/mot.tsx",
      "lib/tutorial/definitions/vigilancia.tsx",
    ];

    for (const caminho of definicoes) {
      const fonte = readFileSync(resolve(process.cwd(), caminho), "utf8");
      // Onde há "explicativo", há explicação escrita: o fluxo 2 nunca fica pela metade.
      const explicativos = (fonte.match(/modo: "explicativo"/g) ?? []).length;
      const explicacoes = (fonte.match(/explicacao: \[/g) ?? []).length;
      expect(explicacoes).toBe(explicativos);
    }
  });
});
