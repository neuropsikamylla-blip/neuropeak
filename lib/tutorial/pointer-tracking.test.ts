import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  centerRelativeToContainer,
  pointerMoveDuration,
  shouldUpdatePointerPosition,
} from "./pointer-tracking";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

function closingBrace(sourceText: string, openingBrace: number): number {
  let depth = 0;
  for (let index = openingBrace; index < sourceText.length; index++) {
    if (sourceText[index] === "{") depth++;
    if (sourceText[index] === "}" && --depth === 0) return index;
  }
  throw new Error("Bloco sem fechamento");
}

describe("pointer tracking", () => {
  it("calcula o centro do alvo nas coordenadas do container", () => {
    expect(centerRelativeToContainer(
      { left: 100, top: 50, width: 400, height: 300 },
      { left: 150, top: 80, width: 40, height: 60 },
    )).toEqual({ x: 70, y: 60 });
  });

  it("usa a duração completa na primeira medição e uma menor ao seguir", () => {
    const moveDurationMs = 500;

    expect(pointerMoveDuration(moveDurationMs, false)).toBe(moveDurationMs);
    expect(pointerMoveDuration(moveDurationMs, true)).toBeLessThan(moveDurationMs);
  });

  it("só atualiza quando a posição do ponteiro mudou", () => {
    expect(shouldUpdatePointerPosition({ x: 70, y: 60 }, { x: 70, y: 60 })).toBe(false);
    expect(shouldUpdatePointerPosition({ x: 70, y: 60 }, { x: 71, y: 60 })).toBe(true);
  });
});

describe("DemoPointer com perseguição opcional", () => {
  it("guarda cada requestAnimationFrame no bloco condicionado a trackTarget", () => {
    const pointer = source("components/exercises/tutorial/DemoPointer.tsx");
    const guard = pointer.indexOf("if (trackTarget) {");
    expect(guard).toBeGreaterThanOrEqual(0);

    const openingBrace = pointer.indexOf("{", guard);
    const endOfGuard = closingBrace(pointer, openingBrace);
    const rafOccurrences = [...pointer.matchAll(/requestAnimationFrame/g)].map((match) => match.index ?? -1);

    expect(rafOccurrences.length).toBeGreaterThan(0);
    expect(rafOccurrences.every((index) => index > guard && index < endOfGuard)).toBe(true);
  });

  it("declara trackTarget como false por padrão", () => {
    expect(source("components/exercises/tutorial/DemoPointer.tsx")).toMatch(/trackTarget\s*=\s*false/);
  });

  it("não habilita perseguição nos tutoriais já aprovados", () => {
    // A lista é EXPLÍCITA de propósito. Uma varredura da pasta inteira proibiria a prop para
    // sempre, inclusive no tutorial do Focus Agentes — que existe justamente para usá-la, porque a
    // cena dele se move. O que precisa ficar travado são os que ela já validou: neles a
    // demonstração continua exatamente como estava.
    const aprovados = [
      "conjunto-selecao.tsx",
      "estimulo-continuo.tsx",
      "letras-sequencia.tsx",
      "sequencia-espacial.tsx",
      "sequencia-itens.tsx",
      "sequencia-ordenada.tsx",
      "span-numerico.tsx",
    ];
    const definitionsDirectory = resolve(process.cwd(), "lib/tutorial/definitions");

    // Falha se algum destes arquivos for renomeado ou sumir — a proteção não pode passar em branco.
    const naPasta = readdirSync(definitionsDirectory).filter((file) => /\.tsx?$/.test(file));
    for (const aprovado of aprovados) expect(naPasta).toContain(aprovado);

    for (const definition of aprovados) {
      expect(readFileSync(resolve(definitionsDirectory, definition), "utf8")).not.toMatch(/trackTarget/);
    }
  });
});
