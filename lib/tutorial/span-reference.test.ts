import { readFileSync } from "node:fs";
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

    expect(definition).not.toMatch(forbiddenClinicalTerms);
    expect(definition).toMatch(/total=\{SMALLEST_VALID_UNIT\}/);
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

    expect(runner).toMatch(/setGuidedKey\(\(key\)\s*=>\s*key\s*\+\s*1\)/);
    expect(runner).toMatch(/GuidedAttempt key=\{guidedKey\}/);
    expect(runner).not.toMatch(/setPhase\("demo"\)/);
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

  it("passa a definição apenas para o Span Direto", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const tutorialProps = page.match(/tutorial:\s*spanNumericoTutorial/g) ?? [];

    expect(tutorialProps).toHaveLength(1);
    expect(page).toMatch(
      /exerciseId\s*===\s*["']span-numerico["']\s*\?\s*\{\s*tutorial:\s*spanNumericoTutorial/,
    );
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
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(definition).toMatch(/onDoneRef\.current\(\)/);
    expect(definition).not.toMatch(/\}, \[onDone\]\)/);
  });
});

describe("o Span Inverso e os demais exercícios seguem intocados", () => {
  it("o Inverso não conhece tutorial nem foi convertido", () => {
    const inverso = source("components/exercises/memory/SpanNumericoInverso.tsx");

    expect(inverso).not.toMatch(/tutorial/i);
  });

  it("a preparação do Inverso preserva a antecipação de nível que sempre teve", () => {
    // A remoção do "você começa no nível N (X dígitos)" vale só para o Direto: converter o Inverso
    // exigiria autorização, e mudar sua tela sem isso seria conversão disfarçada.
    const span = source("components/exercises/memory/SpanNumerico.tsx");
    const readyScreen = span.slice(span.indexOf("function ReadyScreen"));

    expect(readyScreen).toMatch(/\{reverse && \(/);
    expect(readyScreen).toMatch(/digitsForLevel\(level\)/);
  });

  it("nenhum outro exercício recebe tutorial nesta etapa", () => {
    const page = source("app/(patient)/treino/[exercicio]/page.tsx");
    const definicoesImportadas = page.match(/from "@\/lib\/tutorial\/definitions\/[^"]+"/g) ?? [];

    expect(definicoesImportadas).toEqual(['from "@/lib/tutorial/definitions/span-numerico"']);
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
    "lib/tutorial/definitions/span-numerico.tsx",
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
