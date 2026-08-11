import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { spanGapMs } from "./span-playback";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const forbiddenClinicalTerms =
  /onComplete|score|accuracy|reactionTime|useTimedProgress|useExerciseProgress|(?:@\/)?lib\/adaptive/i;

describe("cadência compartilhada do Span", () => {
  it.each([
    [0, 850],
    [1, 850],
    [5, 850],
    [6, 1000],
    [10, 1000],
  ])("usa o intervalo esperado para %i itens", (length, expected) => {
    expect(spanGapMs(length)).toBe(expected);
  });

  it("é a fonte da cadência e do áudio usados pelo treino", () => {
    const span = source("components/exercises/memory/SpanNumerico.tsx");

    expect(span).toMatch(/from\s+["']@\/lib\/tutorial\/span-playback["']/);
    expect(span).toMatch(/SPAN_AUDIO_SRC/);
    expect(span).toMatch(/SPAN_INITIAL_DELAY_MS/);
    expect(span).toMatch(/spanGapMs/);
    expect(span).not.toMatch(/\b850\b|\b1000\b|\/exercises\/audio\/numeros\//);
  });
});

describe("isolamento do tutorial do Span", () => {
  it("mantém o runner fora dos contratos clínicos", () => {
    expect(source("components/exercises/tutorial/TutorialRunner.tsx"))
      .not.toMatch(forbiddenClinicalTerms);
  });

  it("mantém a definição fora dos contratos clínicos e deriva a guiada da mecânica", () => {
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");
    const family = source("lib/tutorial/definitions/sequencia-ordenada.tsx");

    expect(definition).not.toMatch(forbiddenClinicalTerms);
    expect(family).not.toMatch(forbiddenClinicalTerms);
    expect(family).toMatch(/total=\{config\.smallestValidUnit\}/);
  });

  it("não imprime a sequência na fase de escuta", () => {
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(definition).not.toMatch(/\.join\s*\(/);
    expect(definition).not.toMatch(/<[^>]+>\s*\{(?:digit|sequence|sequenceRef)/);
    expect(definition).toMatch(/<Beads\s/);
    expect(definition).toMatch(/<NumberPad\s/);
  });

  it("repete somente a tentativa guiada com uma chave incremental", () => {
    const runner = source("components/exercises/tutorial/TutorialRunner.tsx");
    const retryStart = runner.indexOf("function retryGuidedAttempt");
    const retry = runner.slice(
      retryStart,
      runner.indexOf("\n  return (", retryStart),
    );

    expect(runner).toMatch(/setGuidedKey\(\(key\)\s*=>\s*key\s*\+\s*1\)/);
    expect(runner).toMatch(/GuidedAttempt key=\{guidedKey\}/);
    expect(retry).not.toMatch(/setPhase\("demo"\)/);
  });
});

describe("ritmo e identidade das etapas do tutorial", () => {
  const runnerSource = () => source("components/exercises/tutorial/TutorialRunner.tsx");
  const definitionSource = () => source("lib/tutorial/definitions/sequencia-ordenada.tsx");
  const pointerSource = () => source("components/exercises/tutorial/DemoPointer.tsx");

  it("declara todos os tempos pedagógicos como constantes nomeadas", () => {
    const definition = definitionSource();

    expect(definition).toMatch(/const POST_LISTENING_PAUSE_MS = 1000;/);
    expect(definition).toMatch(/const POINTER_ENTRY_PULSE_MS = 500;/);
    expect(definition).toMatch(/const POINTER_MOVE_MS = 650;/);
    expect(definition).toMatch(/const POINTER_AIM_MS = 220;/);
    expect(definition).toMatch(/const POINTER_PRESS_MS = 420;/);
    expect(definition).toMatch(/const POINTER_RELEASE_MS = 260;/);
    expect(definition).toMatch(/const BETWEEN_DIGITS_MS = 520;/);
    expect(definition).toMatch(/const FINAL_PAUSE_MS = 800;/);
  });

  it("começa na intro e passa por demo e handoff antes da guiada", () => {
    const runner = runnerSource();
    const intro = runner.indexOf('useState<TutorialPhase>("intro")');
    const demo = runner.indexOf('onClick={() => setPhase("demo")}');
    const handoff = runner.indexOf('onDone={() => setPhase("handoff")}');
    const guided = runner.indexOf('onClick={() => setPhase("guided")}');

    expect(intro).toBeGreaterThanOrEqual(0);
    expect(demo).toBeGreaterThan(intro);
    expect(handoff).toBeGreaterThan(demo);
    expect(guided).toBeGreaterThan(handoff);
  });

  it("só monta GuidedAttempt dentro da fase guided", () => {
    const runner = runnerSource();
    const handoffBlock = runner.slice(
      runner.indexOf('{phase === "handoff"'),
      runner.indexOf('{phase === "guided"'),
    );
    const guidedBlocks = runner.match(/<definition\.GuidedAttempt/g) ?? [];

    expect(handoffBlock).not.toMatch(/GuidedAttempt/);
    expect(guidedBlocks).toHaveLength(1);
    expect(runner).toMatch(
      /phase === "guided"[\s\S]*?<definition\.GuidedAttempt key=\{guidedKey\}/,
    );
  });

  it("declara selo e acento azul ou teal para as três etapas nos três temas", () => {
    const runner = runnerSource();
    const stages = runner.slice(
      runner.indexOf("const stageStyles"),
      runner.indexOf("function StageLabel"),
    );

    // A etapa `explanation` entrou em 09/ago/2026: no Fluxo 2 o paciente lê a regra, e anunciar
    // aquela tela como DEMONSTRAÇÃO descrevia algo que não acontece ali. Ela divide o azul com a
    // demonstração de propósito — é a mesma posição no fluxo, a de aprender antes de fazer —,
    // e por isso o acento #4F8FEA passa a aparecer seis vezes, duas em cada tema.
    expect(runner).toMatch(/type TutorialStage = "demonstration" \| "explanation" \| "guided"/);
    expect(stages.match(/label: "DEMONSTRAÇÃO",/g)).toHaveLength(3);
    expect(stages.match(/label: "EXPLICAÇÃO",/g)).toHaveLength(3);
    expect(stages.match(/label: "SUA VEZ",/g)).toHaveLength(3);
    expect(stages.match(/accentColor: "#4F8FEA"/g)).toHaveLength(6);
    expect(stages).toMatch(/accentColor: "#0D9488"/);
    expect(stages).toMatch(/accentColor: "#2DD4BF"/);
    expect(runner).toMatch(/border-t-4/);
  });

  it("usa cursor de 44 px com preenchimento, contorno, halo e ripple", () => {
    const pointer = pointerSource();

    expect(pointer).toMatch(/const POINTER_SIZE = 44;/);
    expect(pointer).toMatch(/const HALO_SIZE = POINTER_SIZE \* 2;/);
    expect(pointer).toMatch(/fill="#FFFFFF"/);
    expect(pointer).toMatch(/text-\[#1F3D5C\]/);
    expect(pointer).toMatch(/drop-shadow-/);
    expect(pointer).toMatch(/phase === "locating"/);
    expect(pointer).toMatch(/RIPPLE_DURATION_MS = 400/);
  });

  it("mantém o cursor montado e troca somente o seletor entre os dígitos", () => {
    const definition = definitionSource();
    const demonstration = definition.slice(
      definition.indexOf("function Demonstration"),
      definition.indexOf("function criarGuidedAttempt"),
    );

    expect(demonstration.match(/<DemoPointer/g)).toHaveLength(1);
    expect(demonstration).toMatch(/setTargetSelector\(config\.targetSelectorFor\(item\)\)/);
    expect(demonstration).not.toMatch(/setTargetSelector\(null\)/);
  });

  it("preserva a ordem deslocar, mirar, pressionar, soltar, pausar e preencher", () => {
    const definition = definitionSource();

    expect(definition).toMatch(
      /setTargetSelector[\s\S]*?wait\(POINTER_MOVE_MS[\s\S]*?wait\(POINTER_AIM_MS[\s\S]*?setPressedChoice\(item\)[\s\S]*?wait\(POINTER_PRESS_MS[\s\S]*?setPressedChoice\(undefined\)[\s\S]*?wait\(POINTER_RELEASE_MS[\s\S]*?setFilled\(index \+ 1\)[\s\S]*?wait\(BETWEEN_DIGITS_MS/,
    );
  });

  it("realça a bolinha como consequência sem tornar a prop obrigatória no treino", () => {
    const span = source("components/exercises/memory/SpanNumerico.tsx");

    expect(span).toMatch(/highlighted\?: number/);
    expect(span).toMatch(/i === highlighted[\s\S]*?scale: \[1, 1\.35, 1\]/);
    expect(span).toMatch(/<Beads total=\{digits\} filled=\{entered\.length\} active=\{-1\} flipped=\{reverse\} \/>/);
  });
});

describe("integração do tutorial de referência", () => {
  it("usa tutorialRequired no wrapper e dispensa a versão já concluída", async () => {
    const { tutorialRequired } = await import("./state");
    const completed = {
      completedAt: new Date("2026-08-05T12:00:00.000Z"),
      completedVersion: 1,
    };

    expect(tutorialRequired(completed, 1)).toBe(false);
    expect(source("components/exercises/ExerciseWrapper.tsx"))
      .toMatch(/tutorialRequired\(tutorialState, tutorial\.version\)/);
  });

  it("não abre o tutorial quando o estado ainda não foi carregado", () => {
    const wrapper = source("components/exercises/ExerciseWrapper.tsx");

    expect(wrapper).toMatch(/tutorialState\s*!==\s*undefined/);
  });

  it("liga exercício e tutorial por um registro único, não por condicional espalhada", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");

    // Um só ponto de ligação: a cada lote, uma linha no registro. Condicional por exerciseId
    // espalhada pelo arquivo seria insustentável em 34 conversões.
    expect(page).toMatch(/const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>>/);
    expect(page.match(/tutorial:\s*tutorialAtual/g) ?? []).toHaveLength(1);
    expect(page).not.toMatch(/exerciseId\s*===\s*["']span-numerico["']\s*\?/);
  });

  it("mantém a preparação do Span sem rótulo indevido ou estratégia cognitiva", () => {
    const span = source("components/exercises/memory/SpanNumerico.tsx");
    const readyScreen = span.slice(span.indexOf("function ReadyScreen"));

    expect(readyScreen).not.toMatch(/tutorial|agrupe|repita mentalmente|associe/i);
  });
});

describe("a demonstração nunca reinicia sozinha", () => {
  // Se o efeito dependesse de `onDone`, um callback recriado pelo pai remontaria a demonstração e
  // a voz falaria por cima de si mesma. O ref mantém o callback atual sem virar dependência.
  it("o efeito da demonstração não depende do callback do pai", () => {
    const definition = source("lib/tutorial/definitions/sequencia-ordenada.tsx");

    expect(definition).toMatch(/onDoneRef\.current\(\)/);
    expect(definition).not.toMatch(/\}, \[onDone\]\)/);
  });
});

describe("demonstração completa da resposta do Span Direto", () => {
  const numberPadSource = () => source("components/exercises/memory/SpanNumerico.tsx");
  const definitionSource = () => source("lib/tutorial/definitions/sequencia-ordenada.tsx");
  const spanDefinitionSource = () => source("lib/tutorial/definitions/span-numerico.tsx");
  const pointerSource = () => source("components/exercises/tutorial/DemoPointer.tsx");

  it("permite pressionar uma tecla por código e identifica cada dígito", () => {
    const span = numberPadSource();

    expect(span).toMatch(/pressedKey\s*=\s*-1/);
    expect(span).toMatch(/pressedKey\?:\s*number/);
    expect(span).toMatch(/data-digit=\{n\}/);
  });

  it("reproduz exatamente a escala do clique real sem misturar o estado aceso", () => {
    const span = numberPadSource();

    expect(span).toMatch(/active:scale-95/);
    expect(span).toMatch(/pressedKey\s*===\s*n\s*\?\s*["']scale\(0\.95\)["']/);
    expect(span).toMatch(/pressedKey\s*===\s*n[\s\S]*lit\s*\?\s*["']scale\(1\.04\)["']/);
  });

  it("mantém as chamadas do teclado do treino sem a prop de demonstração", () => {
    const span = numberPadSource();

    expect(span).toMatch(
      /<NumberPad interactive=\{false\} flashKey=\{flashKey\} onKey=\{\(\) => \{\}\} \/>/,
    );
    expect(span).toMatch(/<NumberPad interactive flashKey=\{-1\} onKey=\{handleKey\} \/>/);
  });

  it("usa um cursor de interface, decorativo e incapaz de interceptar o toque", () => {
    const pointer = pointerSource();
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

    expect(pointer).not.toMatch(emoji);
    expect(pointer).toMatch(/MousePointer2/);
    expect(pointer).toMatch(/aria-hidden=["']true["']/);
    expect(pointer).toMatch(/pointer-events-none/);
    expect(pointer).toMatch(/pointerEvents:\s*["']none["']/);
    expect(pointer).toMatch(/getBoundingClientRect\(\)/);
    expect(pointer).toMatch(/addEventListener\(["']resize["']/);
  });

  it("percorre todos os dígitos e só então conclui", () => {
    const definition = definitionSource();
    const demonstration = definition.slice(
      definition.indexOf("function Demonstration"),
      definition.indexOf("function criarGuidedAttempt"),
    );
    const loop = demonstration.indexOf(
      "for (let index = 0; index < ordemDaResposta.length; index++)",
    );
    const done = demonstration.indexOf("onDoneRef.current()");

    expect(loop).toBeGreaterThanOrEqual(0);
    expect(done).toBeGreaterThan(loop);
    expect(demonstration).toMatch(/setDemonstrationPhase\(["']done["']\)/);
  });

  it("deriva a quantidade de dígitos da menor unidade válida", () => {
    const definition = spanDefinitionSource();

    expect(definition).toMatch(/SMALLEST_VALID_UNIT\s*=\s*digitsForLevel\(MIN_LEVEL\)/);
    expect(definition).toMatch(/length:\s*SMALLEST_VALID_UNIT/);
    expect(definition).not.toMatch(/SMALLEST_VALID_UNIT\s*=\s*\d/);
  });

  it("preserva o ref de conclusão e o efeito de execução única", () => {
    const definition = definitionSource();
    const demonstration = definition.slice(
      definition.indexOf("function Demonstration"),
      definition.indexOf("function criarGuidedAttempt"),
    );

    expect(demonstration).toMatch(/onDoneRef\.current\(\)/);
    expect(demonstration).toMatch(/\}, \[\]\);/);
  });

  it("bloqueia toda interação real durante a resposta demonstrada", () => {
    const definition = definitionSource();

    expect(definition).toMatch(/demonstrationPhase\s*===\s*["']answering["'][\s\S]*pointer-events-none/);
    expect(definition).toMatch(/interactive=\{false\}/);
  });

  it("solta a tecla antes de preencher a bolinha, em passos separados", () => {
    const definition = definitionSource();

    expect(definition).toMatch(
      /setPressedChoice\(undefined\);[\s\S]*?await wait\(POINTER_RELEASE_MS, \(\) => cancelled\)[\s\S]*?setFilled\(index \+ 1\);/,
    );
  });

  it("não acopla a demonstração a contratos clínicos proibidos", () => {
    expect(definitionSource()).not.toMatch(forbiddenClinicalTerms);
  });
});

describe("o Span Inverso continua na fábrica compartilhada", () => {
  it("o Inverso reusa a fábrica, sem componente de tutorial próprio", () => {
    // Regra 7: o Inverso não ganhou arquivo de tutorial — ele sai da mesma fábrica do Direto,
    // parametrizada só pela ordem da resposta. O componente do exercício segue sem saber de nada.
    const inverso = source("components/exercises/memory/SpanNumericoInverso.tsx");
    const definicao = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(inverso).not.toMatch(/tutorial/i);
    expect(definicao).toMatch(/function criarTutorialSpan\(/);
    expect(definicao).toMatch(/criarTutorialSequenciaOrdenada\(/);
    expect(definicao).toMatch(/export const spanNumericoInversoTutorial = criarTutorialSpan\(/);
    expect(definicao).toMatch(
      /transformarResposta: \(sequencia\) => sequencia\.reverse\(\)/,
    );
  });

  it("a preparação do Inverso preserva a antecipação de nível que sempre teve", () => {
    // A remoção do "você começa no nível N (X dígitos)" vale só para o Direto: converter o Inverso
    // exigiria autorização, e mudar sua tela sem isso seria conversão disfarçada.
    const span = source("components/exercises/memory/SpanNumerico.tsx");
    const readyScreen = span.slice(span.indexOf("function ReadyScreen"));

    expect(readyScreen).toMatch(/\{reverse && \(/);
    expect(readyScreen).toMatch(/digitsForLevel\(level\)/);
  });

  it("o registro cobre exatamente os exercícios já convertidos", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const registro = page.slice(
      page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
      page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
    );
    const convertidos = (registro.match(/"([a-z-]+)":/g) ?? []).map((m) => m.slice(1, -2));

    expect(convertidos.sort()).toEqual([
      "certo-ou-errado",
      "cubo-corsi",
      "desafio-supermercado",
      "dual-task",
      "focus-agents",
      "jogo-memoria",
      "letras-sequencia",
      "lista-distracao",
      "matriz-espacial",
      "matriz-espacial-inversa",
      "mot",
      "nback",
      "padroes-rotacao",
      "restaurante-ordem",
      "semaforo",
      "sequencia-itens",
      "span-numerico",
      "span-numerico-inverso",
      "tempo-reacao",
      "vigilancia",
    ]);
  });
});

describe("Família 1 — letras e itens usam a fábrica aprovada", () => {
  const family = () => source("lib/tutorial/definitions/sequencia-ordenada.tsx");
  const lettersDefinition = () => source("lib/tutorial/definitions/letras-sequencia.tsx");
  const itemsDefinition = () => source("lib/tutorial/definitions/sequencia-itens.tsx");

  it("mantém uma única fábrica, sem componente de tutorial por exercício", () => {
    expect(family()).toMatch(/export function criarTutorialSequenciaOrdenada<T>/);
    for (const definition of [lettersDefinition(), itemsDefinition()]) {
      expect(definition).toMatch(/criarTutorialSequenciaOrdenada\(/);
      expect(definition).not.toMatch(/useEffect|useState|DemoPointer|function Demonstration/);
    }
  });

  it("mantém as oito constantes de ritmo somente na fábrica", () => {
    const constants = [
      "POST_LISTENING_PAUSE_MS",
      "POINTER_ENTRY_PULSE_MS",
      "POINTER_MOVE_MS",
      "POINTER_AIM_MS",
      "POINTER_PRESS_MS",
      "POINTER_RELEASE_MS",
      "BETWEEN_DIGITS_MS",
      "FINAL_PAUSE_MS",
    ];

    for (const constant of constants) {
      expect(family()).toMatch(new RegExp(`const ${constant} =`));
      expect(lettersDefinition()).not.toContain(constant);
      expect(itemsDefinition()).not.toContain(constant);
    }
  });

  it("usa clique nas duas instruções e não menciona teclado nem toque", () => {
    expect(lettersDefinition()).toMatch(
      /guidedInstruction: "Ouça a sequência e clique nas letras na mesma ordem\."/,
    );
    expect(itemsDefinition()).toMatch(
      /guidedInstruction: "Ouça a sequência e clique nos itens na mesma ordem\."/,
    );
    expect(`${lettersDefinition()}${itemsDefinition()}`).not.toMatch(/teclado|toque/i);
  });

  it("deriva as menores unidades das escadas clínicas", () => {
    expect(lettersDefinition()).toMatch(
      /letrasSequenciaItemsForLevel\(LETRAS_SEQUENCIA_MIN_LEVEL\)/,
    );
    expect(itemsDefinition()).toMatch(
      /sequenciaItensForLevel\(SEQUENCIA_ITENS_MIN_LEVEL\)/,
    );
  });

  it("os painéis reais expõem data-choice e pressão opcional", () => {
    const boardContract = family();
    const letters = source("components/exercises/memory/LetrasSequencia.tsx");
    const items = source("components/exercises/memory/SequenciaItens.tsx");

    expect(boardContract).toMatch(/pressedChoice\?: T/);
    expect(letters).toMatch(/export function LetrasSequenciaBoard/);
    expect(letters).toMatch(/data-choice=\{choice\}/);
    expect(letters).toMatch(/pressedChoice === choice[\s\S]*?scale\(0\.95\)/);
    expect(items).toMatch(/export function SequenciaItensBoard/);
    expect(items).toMatch(/data-choice=\{choice\.n\}/);
    expect(items).toMatch(/pressedChoice\?\.e === choice\.e[\s\S]*?scale\(0\.95\)/);
  });

  it("o treino reutiliza os painéis sem fornecer props de tutorial", () => {
    const letters = source("components/exercises/memory/LetrasSequencia.tsx");
    const items = source("components/exercises/memory/SequenciaItens.tsx");
    const lettersCall = letters.slice(letters.lastIndexOf("<LetrasSequenciaBoard"));
    const itemsCall = items.slice(items.lastIndexOf("<SequenciaItensBoard"));

    expect(lettersCall).not.toMatch(/pressedChoice|activeChoice|highlightedIndex/);
    expect(itemsCall).not.toMatch(/pressedChoice|activeChoice|highlightedIndex/);
  });
});

describe("Família 2 — sequência espacial usa uma definição única", () => {
  const family = () => source("lib/tutorial/definitions/sequencia-ordenada.tsx");
  const spatial = () => source("lib/tutorial/definitions/sequencia-espacial.tsx");
  const matrix = () => source("components/exercises/memory/MatrizEspacial.tsx");
  const inverse = () => source("components/exercises/memory/MatrizEspacialInversa.tsx");
  const cube = () => source("components/exercises/memory/CuboCorsi.tsx");
  const rotation = () => source("components/exercises/memory/PadroesRotacao.tsx");

  it("converte os quatro pela mesma fábrica, sem tutorial próprio", () => {
    expect(spatial().match(/criarTutorialSequenciaOrdenada(?:<\w+>)?\(\{/g) ?? []).toHaveLength(4);
    expect(spatial()).not.toMatch(/function criarTutorialSequenciaEspacial/);
    for (const exercise of [matrix(), inverse(), cube(), rotation()]) {
      expect(exercise).not.toMatch(/TutorialBase|function \w*Tutorial|<TutorialDemo/);
    }
  });

  it("mantém todas as constantes de ritmo somente na fábrica compartilhada", () => {
    const constants = [
      "POST_LISTENING_PAUSE_MS",
      "POINTER_ENTRY_PULSE_MS",
      "POINTER_MOVE_MS",
      "POINTER_AIM_MS",
      "POINTER_PRESS_MS",
      "POINTER_RELEASE_MS",
      "BETWEEN_DIGITS_MS",
      "FINAL_PAUSE_MS",
      "VISUAL_ITEM_ON_MS",
      "VISUAL_ITEM_GAP_MS",
      "VISUAL_SETTLE_MS",
    ];

    for (const constant of constants) {
      expect(family()).toMatch(new RegExp(`const ${constant} =`));
      expect(spatial()).not.toContain(constant);
    }
  });

  it("parametriza qualquer transformação da resposta", () => {
    expect(family()).toMatch(
      /transformarResposta\?: \(sequencia: T\[\]\) => T\[\]/,
    );
    expect(spatial()).toMatch(
      /matrizEspacialInversaTutorial[\s\S]*transformarResposta: \(sequencia\) => sequencia\.reverse\(\)/,
    );
    expect(spatial()).toMatch(
      /padroesRotacaoTutorial[\s\S]*transformarResposta: transformarRotacao/,
    );
  });

  it("demonstra os cliques na resposta já transformada", () => {
    const demonstration = family().slice(
      family().indexOf("function criarDemonstration"),
      family().indexOf("function criarGuidedAttempt"),
    );

    expect(demonstration).toMatch(
      /ordemDaResposta = respostaEsperada\([\s\S]*config\.transformarResposta/,
    );
    expect(demonstration).toMatch(
      /for \(let index = 0; index < ordemDaResposta\.length; index\+\+\)[\s\S]*const item = ordemDaResposta\[index\]/,
    );
  });

  it("importa do exercício a mesma rotação usada no treino", () => {
    expect(spatial()).toMatch(
      /from "@\/components\/exercises\/memory\/PadroesRotacao"/,
    );
    expect(spatial()).toMatch(/const \[rotatedRow, rotatedColumn\] = rotatePos\(/);
    expect(rotation()).toMatch(/export function rotatePos\(/);
  });

  it("expõe alvos e pressão opcional nas três superfícies reais", () => {
    for (const exercise of [matrix(), cube(), rotation()]) {
      expect(exercise).toMatch(/pressedCell\?: number/);
      expect(exercise).toMatch(/data-cell=\{/);
    }
    expect(spatial()).toMatch(/targetSelectorFor: \(cell(?:: number)?\) => `\[data-cell=/);
  });

  it("mantém o treino sem fornecer a prop exclusiva da demonstração", () => {
    const matrixTrainingCall = matrix().slice(matrix().lastIndexOf("<MatrizEspacialGrid"));
    const cubeTrainingCall = cube().slice(cube().lastIndexOf("<IsoCube"));
    const rotationTrainingCall = rotation().slice(rotation().lastIndexOf("<PadroesRotacaoGrid"));

    expect(matrixTrainingCall).not.toMatch(/pressedCell/);
    expect(cubeTrainingCall).not.toMatch(/pressedCell/);
    expect(rotationTrainingCall).not.toMatch(/pressedCell/);
  });

  it("usa exatamente as quatro instruções guiadas de clique", () => {
    expect(spatial()).toContain("Observe as posições e clique nelas na mesma ordem.");
    expect(spatial()).toContain("Observe as posições e clique nelas na ordem inversa.");
    expect(spatial()).toContain("Observe os cubos e clique neles na mesma ordem.");
    expect(spatial()).toContain("Observe o padrão e clique nas posições após a rotação.");
    expect(spatial()).not.toMatch(/teclado|toque/i);
  });

  it("deriva as menores unidades das escadas dos exercícios", () => {
    expect(spatial()).toMatch(
      /matrizEspacialSequenceLengthFor\(\s*MATRIZ_ESPACIAL_MIN_DIFFICULTY/,
    );
    expect(spatial()).toMatch(
      /cuboCorsiSequenceLength\(\s*CUBO_CORSI_MIN_DIFFICULTY/,
    );
    expect(spatial()).toMatch(
      /padroesRotacaoPositionsForLevel\(\s*PADROES_ROTACAO_MIN_LEVEL/,
    );
  });

  it("mede cada alvo 3D transformado pela geometria real do navegador", () => {
    const pointer = source("components/exercises/tutorial/DemoPointer.tsx");

    expect(cube()).toMatch(/perspective: size \* 1\.9/);
    expect(cube()).toMatch(/transformStyle: "preserve-3d"/);
    expect(cube()).toMatch(/data-cell=\{idx\}/);
    expect(pointer).toMatch(/target\.getBoundingClientRect\(\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// As quatro decisões congeladas da T1 em 05/ago/2026. Cada uma vira teste para
// que nenhuma conversão futura possa desfazê-la por descuido.
// ─────────────────────────────────────────────────────────────────────────────

describe("T1 congelada — 1. paciente técnico não se cria por rotina", () => {
  it("o script exige autorização explícita para criar", () => {
    const script = source("scripts/diagnostics/paciente-teste-t1.mjs");

    expect(script).toMatch(/--criar-com-autorizacao/);
    expect(script).toMatch(/DECISÃO CONGELADA DA T1/);
    // Sem a flag, o caminho de criação não é alcançado.
    expect(script).toMatch(/modo !== "--criar-com-autorizacao"/);
  });
});

describe("T1 congelada — 2. sem emoji no framework do tutorial", () => {
  const arquivosDoFramework = [
    "components/exercises/tutorial/TutorialRunner.tsx",
    "components/exercises/tutorial/DemoPointer.tsx",
    "lib/tutorial/definitions/letras-sequencia.tsx",
    "lib/tutorial/definitions/sequencia-itens.tsx",
    "lib/tutorial/definitions/sequencia-espacial.tsx",
    "lib/tutorial/definitions/conjunto-selecao.tsx",
    "lib/tutorial/definitions/estimulo-continuo.tsx",
    "lib/tutorial/definitions/focus-agents.tsx",
    "lib/tutorial/definitions/sequencia-ordenada.tsx",
    "lib/tutorial/definitions/span-numerico.tsx",
    "lib/tutorial/speech-playback.ts",
    "lib/tutorial/span-playback.ts",
    "lib/tutorial/types.ts",
    "lib/tutorial/state.ts",
  ];

  // Faixas de pictogramas, símbolos diversos, dingbats e emoji suplementar.
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

  it.each(arquivosDoFramework)("%s não contém emoji", (caminho) => {
    expect(source(caminho)).not.toMatch(emoji);
  });

  it("o feedback usa ícones da própria interface, não figuras decorativas", () => {
    const runner = source("components/exercises/tutorial/TutorialRunner.tsx");

    expect(runner).toMatch(/from "lucide-react"/);
    expect(runner).toMatch(/<Check\s/);
    expect(runner).toMatch(/<RotateCcw\s/);
  });
});

describe("T1 congelada — 3. a preparação é só o essencial", () => {
  it("a preparação do Span não ensina estratégia nem orienta terapeuticamente", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const bloco = page.slice(page.indexOf('"span-numerico": ['));
    const instrucoes = bloco.slice(0, bloco.indexOf("],"));

    // Estratégia cognitiva, dica de memorização e orientação terapêutica ficam de fora.
    expect(instrucoes).not.toMatch(
      /agrup|repita mentalmente|associ|memoriz|visualiz|imagin|relaxe|respire|evite distra|concentre-se/i,
    );
    // E o que deve estar: o que acontece, como responder, como se preparar para ouvir.
    expect(instrucoes).toMatch(/OUVIR/);
    expect(instrucoes).toMatch(/toque os números/);
  });
});

describe("T1 congelada — 4. a guiada deriva da mecânica, não de um número", () => {
  it("a menor unidade é perguntada à escada clínica do exercício", () => {
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(definition).toMatch(/SMALLEST_VALID_UNIT\s*=\s*digitsForLevel\(MIN_LEVEL\)/);
    // Nenhum comprimento de sequência escrito à mão.
    expect(definition).not.toMatch(/SMALLEST_VALID_UNIT\s*=\s*\d/);
  });

  it("o contrato do framework exige que toda definição declare a sua unidade", () => {
    const types = source("lib/tutorial/types.ts");

    expect(types).toMatch(/smallestValidUnit:\s*number/);
    expect(types).toMatch(/menor unidade válida da mecânica clínica/i);
  });

  it("a definição declara a unidade no objeto do tutorial", () => {
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(definition).toMatch(/smallestValidUnit:\s*SMALLEST_VALID_UNIT/);
  });

  it("no Span, a escada faz a menor unidade resolver para dois dígitos", () => {
    // Verificação estática do fonte, não import: o repositório roda Vitest com environment "node"
    // e jsx "preserve", então importar um .tsx aqui derruba a coleta do arquivo inteiro.
    const span = source("components/exercises/memory/SpanNumerico.tsx");

    expect(span).toMatch(/export const MIN_LEVEL = 1;/);
    expect(span).toMatch(/export const digitsForLevel = \(lv: number\) => lv \+ 1;/);
    // MIN_LEVEL 1 + 1 = 2 dígitos. Se a escada mudar, este teste falha e obriga a revisão —
    // que é exatamente o ponto: a unidade acompanha a mecânica, e a mudança não passa calada.
  });
});

describe("credencial do paciente técnico — regressão de 05/ago/2026", () => {
  // A primeira versão do script inventou o formato do código (COG + 6 alfanuméricos) e o paciente
  // ficou impossível de autenticar: o provider só trata como código o que casa /^COG\d{4,6}$/, e
  // qualquer outra coisa vira busca por id — que não acha ninguém e devolve "PIN incorreto" sem
  // sequer comparar o PIN.
  it("o script gera código no formato que o provider reconhece", () => {
    const script = source("scripts/diagnostics/paciente-teste-t1.mjs");

    // Mesmo gerador da aplicação: 5 dígitos por CSPRNG, prefixados com COG.
    expect(script).toMatch(/randomInt\(10000, 100000\)/);
    expect(script).toMatch(/`COG\$\{randomInt\(10000, 100000\)\.toString\(\)\}`/);
    // Nada de alfabeto com letras.
    expect(script).not.toMatch(/ABCDEFGHJKLMNPQRSTUVWXYZ/);
    // E confere o resultado contra o regex do login antes de usar — fail-closed.
    expect(script).toMatch(/REGEX_DO_LOGIN\s*=\s*\/\^COG\\d\{4,6\}\$\//);
    expect(script).toMatch(/não casa o regex do login — geração abortada/);
  });

  it("o regex copiado no script é idêntico ao do provider", () => {
    const auth = source("lib/auth.ts");
    const script = source("scripts/diagnostics/paciente-teste-t1.mjs");
    const extrair = (fonte: string) => fonte.match(/\/\^COG\\d\{4,6\}\$\//)?.[0];

    expect(extrair(auth)).toBeDefined();
    expect(extrair(script)).toBe(extrair(auth));
  });
});

describe("ajustes finos da 2ª validação (06/ago/2026)", () => {
  const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");

  it("nenhum texto menciona teclado ou toque — o paciente responde clicando", () => {
    // O paciente usa mouse hoje e tela no futuro; "teclado" está errado nos dois casos.
    // O runner não traz mais a instrução: pela regra 4 ela vem da definição, com o verbo do
    // gesto real daquele exercício. Aqui verificamos os dois lados.
    const definicao = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(runner()).not.toMatch(/teclado/i);
    expect(runner()).not.toMatch(/\bToque\b/);
    expect(runner()).toMatch(/\{definition\.guidedInstruction\}/);

    expect(definicao).not.toMatch(/teclado/i);
    expect(definicao).toMatch(/clique nos números na mesma ordem/i);
    expect(definicao).toMatch(/clique nos números na ordem inversa/i);
  });

  it("o encerramento é UMA tela só, chamada Tutorial concluído", () => {
    // Antes eram duas em sequência: "Tentativa concluída" com botão "Seguir" e depois
    // "Tutorial concluído" — o paciente clicava para ver a mesma informação de novo.
    expect(runner()).not.toMatch(/Tentativa concluída/);
    expect(runner()).not.toMatch(/"confirm"/);
    const ocorrencias = runner().match(/Tutorial concluído/g) ?? [];
    expect(ocorrencias).toHaveLength(1);
  });

  it("o botão de encerramento leva direto ao treino", () => {
    expect(runner()).toMatch(/onClick=\{onFinish\}[\s\S]{0,120}Iniciar treino/);
  });

  it("há respiro entre o último clique e a troca de tela", () => {
    expect(runner()).toMatch(/const GUIDED_SETTLE_MS = 900;/);
    // A troca de fase acontece DENTRO do timer, não na chamada direta.
    expect(runner()).toMatch(
      /settleTimer\.current = window\.setTimeout\([\s\S]*?setPhase\("feedback"\)[\s\S]*?GUIDED_SETTLE_MS/,
    );
  });

  it("o respiro não deixa timer órfão ao desmontar nem ao repetir", () => {
    expect(runner()).toMatch(/useEffect\(\(\) => \(\) => \{[\s\S]*?clearTimeout\(settleTimer\.current\)/);
    expect(runner()).toMatch(/function retryGuidedAttempt\(\)[\s\S]*?clearTimeout\(settleTimer\.current\)/);
  });

  it("as telas trocam com transição, não instantaneamente", () => {
    expect(runner()).toMatch(/const SCREEN_FADE_S = 0\.32;/);
    expect(runner()).toMatch(/AnimatePresence mode="wait"/);
    expect(runner()).toMatch(/key=\{`\$\{phase\}-\$\{outcome \?\? ""\}`\}/);
  });
});

describe("sincronismo entre voz e estímulo visual", () => {
  const playback = () => source("lib/tutorial/span-playback.ts");

  it("o aviso visual sai no instante em que a voz começa, não antes do play", () => {
    // Defeito real corrigido em 07/ago/2026: onDigitStart era chamado antes de o áudio existir,
    // então a tecla acendia e a voz vinha depois. O sinal certo é `playing` — reprodução audível.
    expect(playback()).toMatch(/audio\.onplaying = announce;/);
    expect(playback()).toMatch(/onAudibleStart/);
    // onDigitStart só pode ser chamado DENTRO da chamada de reprodução, como callback.
    expect(playback()).toMatch(
      /await playDigitAudio\([\s\S]{0,120}?hooks\.onDigitStart\(digit, index\)/,
    );
  });

  it("nenhum onDigitStart acontece antes de tocar o áudio", () => {
    const corpo = playback().slice(playback().indexOf("export async function playDigitSequence"));
    const posDigitStart = corpo.indexOf("hooks.onDigitStart");
    const posPlay = corpo.indexOf("await playDigitAudio");
    // Se onDigitStart aparecesse antes da chamada de reprodução, o defeito teria voltado.
    expect(posPlay).toBeGreaterThan(-1);
    expect(posDigitStart).toBeGreaterThan(posPlay);
  });

  it("o áudio é preparado antes da apresentação, para a fala não sair atrasada", () => {
    expect(playback()).toMatch(/prepareSequenceAudio/);
    expect(playback()).toMatch(/preload = "auto"/);
    expect(playback()).toMatch(/oncanplaythrough/);
  });

  it("falha de áudio ainda produz o estímulo visual", () => {
    // Sem voz, o exercício degrada mas não fica mudo E cego ao mesmo tempo.
    expect(playback()).toMatch(/audio\.onerror = \(\) => \{ announce\(\); finish\(\); \};/);
    expect(playback()).toMatch(/\.catch\(\(\) => \{ announce\(\); finish\(\); \}\)/);
  });

  it("a cadência e a ordem dos passos seguem intactas", () => {
    const corpo = playback().slice(playback().indexOf("export async function playDigitSequence"));
    expect(corpo).toMatch(/wait\(SPAN_INITIAL_DELAY_MS\)/);
    expect(corpo).toMatch(/const gap = spanGapMs\(seq\.length\)/);
    // onDigitEnd depois da reprodução, e o intervalo depois dele.
    expect(corpo).toMatch(/hooks\.onDigitEnd\(digit, index\);[\s\S]{0,60}await wait\(gap\)/);
  });
});

describe("texto da demonstração", () => {
  // A redação "Observe como ouvir a sequência e responder corretamente" foi pedida para o Span e
  // durou algumas horas: no mesmo dia a regra global 1 fixou um texto ÚNICO para os 34, e o texto
  // específico do Span deixou de existir. Quem manda aqui é a regra global.
  it("usa o texto padrão do framework, não uma redação por exercício", () => {
    const runner = source("components/exercises/tutorial/TutorialRunner.tsx");

    expect(runner).toMatch(/Observe como responder/);
    expect(runner).toMatch(/Observe como funciona a atividade\./);
    expect(runner).not.toMatch(/tarefa sendo feita do início ao fim/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOTE 0 — as nove regras globais da T1 (07/ago/2026). Valem para os 34.
// ─────────────────────────────────────────────────────────────────────────────

describe("T1 global — 1 e 5: linguagem padrão", () => {
  const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");

  it("demonstração usa o selo, o título e o texto padrão", () => {
    expect(runner()).toMatch(/DEMONSTRAÇÃO/);
    expect(runner()).toMatch(/Observe como responder/);
    expect(runner()).toMatch(/Observe como funciona a atividade\./);
  });

  it("guiada usa o selo e o título padrão", () => {
    expect(runner()).toMatch(/SUA VEZ/);
    expect(runner()).toMatch(/Agora é sua vez/);
  });

  it("encerramento é sempre Tutorial concluído, com a mensagem padrão", () => {
    expect(runner()).toMatch(/Tutorial concluído/);
    expect(runner()).toMatch(/Agora começa o treino\./);
    expect(runner()).not.toMatch(/Demonstração concluída|Tentativa concluída/);
  });
});

describe("T1 global — 8: tutorial sempre disponível, nunca obrigatório", () => {
  const wrapper = () => source("components/exercises/ExerciseWrapper.tsx");

  it("a preparação oferece rever o tutorial quando ele não roda automaticamente", () => {
    expect(wrapper()).toMatch(/Ver tutorial novamente/);
    expect(wrapper()).toMatch(/tutorial && tutorialState !== undefined && !needsTutorial/);
  });

  it("rever o tutorial NÃO grava nada", () => {
    // A revisão não pode chamar onTutorialDone: é ele que dispara o POST que grava
    // tutorialCompletedAt, tutorialVersion e tutorialSource.
    expect(wrapper()).toMatch(/function reviewTutorial\(\)[\s\S]*?setIsTutorialReview\(true\)/);
    expect(wrapper()).toMatch(/completionRecordFor\(isTutorialReview, tutorial\.version\)/);
  });

  it("onTutorialDone é chamado UMA vez, e sempre sob a condição", () => {
    /*
     * Este teste nasceu de um quase-acidente: bastava acrescentar uma chamada solta
     *
     *     onTutorialDone?.();
     *     if (!isTutorialReview) onTutorialDone?.();
     *
     * para a revisão voltar a gravar e a primeira conclusão disparar o POST duas vezes — e o teste
     * anterior continuaria passando, porque a linha condicional segue lá. Provar que o certo existe
     * não é o mesmo que provar que o errado não existe.
     */
    const chamadas = wrapper().match(/onTutorialDone\?\.\(\)/g) ?? [];
    expect(chamadas).toHaveLength(1);

    // E a única chamada tem de estar sob a guarda do registro, não solta no corpo da função.
    const corpo = wrapper().slice(
      wrapper().indexOf("function finishTutorial"),
      wrapper().indexOf("const themeStyles"),
    );
    expect(corpo).toMatch(/if \(registro !== null\) onTutorialDone\?\.\(\);/);
    expect(corpo).not.toMatch(/^\s*onTutorialDone\?\.\(\);/m);
  });

  it("a primeira conclusão continua gravando", () => {
    expect(wrapper()).toMatch(/function leaveInstructions\(\)[\s\S]*?setIsTutorialReview\(false\)/);
  });

  it("a revisão executa o tutorial completo e devolve ao treino", () => {
    // reviewTutorial vai para a MESMA fase do caminho automático — mesmo runner, mesmo fluxo.
    expect(wrapper()).toMatch(/function reviewTutorial\(\)[\s\S]*?setPhase\("tutorial"\)/);
    expect(wrapper()).toMatch(/function finishTutorial\(\)[\s\S]*?setPhase\("exercise"\)/);
  });
});

describe("T1 global — 7: um só padrão visual para todos", () => {
  it("o runner e o cursor são compartilhados, não copiados por exercício", () => {
    // Se alguém criar um segundo runner ou cursor para um exercício específico, este teste acusa:
    // a regra 7 exige UM padrão visual, e cópias por exercício são justamente como ele se perde.
    const arquivos = readdirSync(resolve(process.cwd(), "components/exercises"), {
      recursive: true,
    }) as string[];

    const runners = arquivos.filter((f) => /Runner.*\.tsx$/.test(String(f)));
    const pointers = arquivos.filter((f) => /Pointer.*\.tsx$/.test(String(f)));

    expect(runners.map(String).sort()).toEqual(["tutorial/TutorialRunner.tsx"]);
    expect(pointers.map(String).sort()).toEqual(["tutorial/DemoPointer.tsx"]);
  });
});

describe("T1 congelada — 4. os títulos das etapas valem para os 34", () => {
  const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");

  it('a tentativa guiada se chama "Agora é sua vez", nunca "Ouça e responda"', () => {
    // Este teste nasce de um defeito real, encontrado por ela em 11/ago/2026 na Vigilância: o
    // título mandava OUVIR uma tarefa puramente visual. O texto era herança do Span Auditivo, o
    // exercício de referência do framework, e vazou para os 20 tutoriais quando os visuais foram
    // convertidos. Não havia teste — por isso ninguém viu.
    expect(runner()).toContain("Agora é sua vez");
    expect(runner()).not.toMatch(/Ouça e responda/);
  });

  it("os títulos das outras etapas seguem a regra 1 e a regra 5", () => {
    expect(runner()).toContain("Veja como funciona");
    expect(runner()).toContain("Tutorial concluído");
    // Regra 5: o que terminou foi o tutorial inteiro, não uma de suas partes.
    expect(runner()).not.toMatch(/Demonstração concluída|Tentativa concluída/);
  });
});
