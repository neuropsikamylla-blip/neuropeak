import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STEPS } from "@/lib/focus/progression";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/focus-agents.tsx");
const exercise = () => source("components/exercises/attention/FocusAgents.tsx");
const page = () => source("app/(patient)/treino/[exercicio]/page.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("Focus Agentes — tutorial T1", () => {
  it("usa o Fluxo 1, sem modo explicativo", () => {
    expect(definition()).not.toMatch(/modo:\s*"explicativo"/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão da definição coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*2\b/);
    expect(TUTORIAL_VERSIONS["focus-agents"]).toBe(2);
  });

  it("usa o verbo real do gesto e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definition()).not.toMatch(/teclado/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
  });

  it("deriva a menor unidade do primeiro degrau clínico", () => {
    expect(definition()).toMatch(/smallestValidUnit:\s*STEPS\[0\]\.n/);
    expect(definition()).not.toMatch(
      new RegExp(`smallestValidUnit:\\s*${STEPS[0].n}\\b`),
    );
  });

  it("gera a cena somente depois do início do primeiro componente", () => {
    const fonte = definition();
    const firstFunction = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const firstRoundCall = fonte.indexOf("gerarRodada(");
    const firstSceneCall = fonte.indexOf("montarCenaEspalhada(");

    expect(firstFunction).toBeGreaterThan(-1);
    expect(firstRoundCall).toBeGreaterThan(firstFunction);
    expect(firstSceneCall).toBeGreaterThan(firstFunction);
    expect(fonte).toMatch(/attempt < MAX_SCENE_ATTEMPTS && !hasSimilarDistractor\(round\)/);
  });

  it("demonstra o clique no OK antes de procurar o personagem", () => {
    // Regra 2 da T1: a demonstração executa a tarefa INTEIRA. O OK é o primeiro gesto — sem ele a
    // cena não aparece —, e a preparação aprovada por ela diz ao paciente "toque em OK". Um cartão
    // que some sozinho ensinaria um fluxo que o exercício não tem.
    const fonte = definition();
    expect(fonte).toMatch(/data-tutorial-ok/);

    // Por POSIÇÃO: o cursor mira o OK antes de mirar o personagem. Falha se a ordem for invertida
    // ou se a etapa do OK for removida do roteiro.
    const miraOk = fonte.indexOf('setTargetSelector("[data-tutorial-ok]")');
    const miraPersonagem = fonte.indexOf("setTargetSelector(`[data-focus-character=");
    expect(miraOk).toBeGreaterThan(-1);
    expect(miraPersonagem).toBeGreaterThan(miraOk);

    // E o cartão precisa ficar abaixo do cursor, senão o gesto acontece escondido.
    expect(fonte).not.toMatch(/absolute inset-0 z-30/);
  });

  it("move a cena na demonstração e acompanha o alvo", () => {
    expect(definition()).toMatch(/\bpassoDeriva\b/);
    expect(definition()).toMatch(/\btrackTarget\b/);
  });

  it("sinaliza o acerto com o mesmo brilho do exercício, não com moldura", () => {
    // Validação dela em 11/ago. A moldura retangular verde só aparece no exercício num caso raro
    // (comando de dois alvos); o sinal que o paciente vê de verdade é o personagem acender. O
    // tutorial estava ensinando o sinal errado.
    const brilhoDoExercicio = /drop-shadow\(0 0 10px rgba\(74,222,128,\.95\)\)/;
    expect(definition()).toMatch(brilhoDoExercicio);
    expect(source("components/exercises/attention/FocusAgents.tsx")).toMatch(brilhoDoExercicio);
    expect(definition()).not.toMatch(/boxShadow:.*22c55e/);
  });

  it("encolhe a cena sem criar uma segunda régua de tamanhos", () => {
    // Também de 11/ago: os personagens ocupavam fatia grande demais da caixa do tutorial. A cena é
    // montada numa área ampliada e escalada por CSS — assim a proporção personagem/arena fica igual
    // à do treino. O que NÃO pode acontecer é o tutorial redefinir o tamanho do personagem: aí
    // passariam a existir dois tamanhos e eles divergiriam na primeira mudança.
    const fonte = definition();
    expect(fonte).toMatch(/transform: `scale\(\$\{SCENE_SCALE\}\)`/);
    expect(fonte).toMatch(/clientWidth \/ SCENE_SCALE/);
    expect(fonte).toMatch(/clientHeight \/ SCENE_SCALE/);
    expect(fonte).not.toMatch(/(CHAR_W|CHAR_H)\s*\*/);
    expect(fonte).not.toMatch(/const CHAR_[WH]\s*=/);
  });

  it("monta a cena num lugar só, para as duas telas não divergirem", () => {
    // A demonstração e a tentativa guiada precisam da MESMA cena. Enquanto o bloco estava
    // duplicado, bastava alguém corrigir um lado para o tutorial passar a ensinar outra coisa.
    const fonte = definition();
    expect(fonte.match(/montarCenaDoTutorial\(arena\)/g) ?? []).toHaveLength(2);
    expect(fonte.match(/gerarRodada\(/g) ?? []).toHaveLength(2);
  });

  it("não mede desempenho na tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de gravação", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("usa exatamente os cinco textos aprovados na preparação dos dois modos", () => {
    const textos = [
      "Antes de cada rodada aparece um comando. Leia com calma e toque em OK.",
      "O comando some quando a busca começa — guarde-o na memória.",
      "Encontre o personagem que corresponde e clique nele.",
      "A rodada tem tempo: se ele acabar antes de você achar, ela passa e vem a próxima.",
      "Conforme você acerta, aparecem mais personagens e os parecidos aumentam.",
    ];
    const fonte = page();
    const focusStart = fonte.indexOf('"focus-agents": [');
    const audioStart = fonte.indexOf('"focus-agents-auditivo": [');
    const focusBlock = fonte.slice(focusStart, audioStart);
    const audioBlock = fonte.slice(audioStart, fonte.indexOf("],", audioStart) + 2);

    for (const block of [focusBlock, audioBlock]) {
      for (const texto of textos) expect(block).toContain(texto);
      const bullets = block.match(/^\s+".*",$/gm) ?? [];
      expect(bullets).toHaveLength(5);
    }
    expect(`${focusBlock}\n${audioBlock}\n${exercise()}`).not.toMatch(
      /fica no topo|cair de cima|queda acelera|Use o 🔊/,
    );
  });

  it("remove a tela interna de instruções", () => {
    expect(exercise()).not.toMatch(/"instrucoes"|function Tutorial|const DEMO/);
  });

  it("inicia o cronômetro num efeito de montagem", () => {
    expect(exercise()).toMatch(/useEffect\(\(\) => \{\s*begin\(\);\s*\}, \[begin\]\)/);
    expect(exercise()).not.toMatch(/function Tutorial/);
  });

  it("registra somente o modo visual", () => {
    const fonte = page();
    const start = fonte.indexOf("const TUTORIAIS_POR_EXERCICIO");
    const register = fonte.slice(start, fonte.indexOf("});", start));

    expect(register).toMatch(/"focus-agents":\s*focusAgentsTutorial/);
    expect(register).not.toMatch(/"focus-agents-auditivo"\s*:/);
  });
});
