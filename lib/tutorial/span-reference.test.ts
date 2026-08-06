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

  it("mantém a definição fora dos contratos clínicos e fixa a guiada em dois itens", () => {
    const definition = source("lib/tutorial/definitions/span-numerico.tsx");

    expect(definition).not.toMatch(forbiddenClinicalTerms);
    expect(definition).toMatch(/GUIDED_SEQUENCE_LENGTH\s*=\s*2/);
    expect(definition).toMatch(/total=\{GUIDED_SEQUENCE_LENGTH\}/);
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
