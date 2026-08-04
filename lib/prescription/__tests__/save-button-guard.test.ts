import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sources = [
  "components/plano/PlanBuilderSidebar.tsx",
  "app/(therapist)/pacientes/[id]/plano/page.tsx",
];

interface DisabledExpression {
  file: string;
  expression: string;
}

/**
 * Localiza o elemento cujo conteúdo é "Salvar plano", exige um atributo JSX
 * `disabled={...}` real e devolve a expressão. Isso evita o falso positivo de procurar
 * apenas uma palavra proibida em qualquer lugar do arquivo.
 *
 * A inspeção é deliberadamente conservadora: todos os identificadores da expressão
 * precisam representar razões técnicas permitidas. Ela não acompanha data flow entre
 * arquivos (por exemplo, quem calculou a prop `saving`), limite adequado para um teste
 * estático sem parser de JSX e sem dependências novas.
 */
function saveDisabledExpressions(file: string): DisabledExpression[] {
  const source = readFileSync(resolve(process.cwd(), file), "utf8");
  const expressions: DisabledExpression[] = [];
  const openingTag = /<(button|Button)\b([^>]*)>/g;
  for (const match of source.matchAll(openingTag)) {
    const tag = match[1];
    const attributes = match[2];
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = source.indexOf(`</${tag}>`, bodyStart);
    if (bodyEnd < 0 || !/Salvar plano/.test(source.slice(bodyStart, bodyEnd))) continue;
    const disabled = attributes.match(/\bdisabled\s*=\s*\{([^{}]+)\}/);
    expect(disabled, `${file}: botão Salvar plano deve ter disabled={...}`).not.toBeNull();
    expressions.push({ file, expression: disabled![1].trim() });
  }
  return expressions;
}

describe("proteção consultiva do botão de salvar", () => {
  it("mantém disabled restrito a razões técnicas permitidas", () => {
    const found = sources.flatMap(saveDisabledExpressions);
    expect(found, "deve localizar os dois botões Salvar plano").toHaveLength(2);

    const allowedIdentifiers = new Set([
      "saving", "loading",
      "items", "selectedExercises", "length",
      "patient", "patientId", "hasPatient",
      "requiredData", "missingRequiredData",
    ]);

    for (const { file, expression } of found) {
      const identifiers = expression.match(/[A-Za-z_$][\w$]*/g) ?? [];
      const unexpected = identifiers.filter((identifier) => !allowedIdentifiers.has(identifier));
      expect(
        unexpected,
        `${file}: disabled usa identificador não técnico em {${expression}}`,
      ).toEqual([]);
    }
  });
});
