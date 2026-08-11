import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHAR_H,
  CHAR_W,
  MARGIN,
  montarCenaEspalhada,
  passoDeriva,
  separarPersonagens,
  type LiveChar,
} from "./scene";

function randomSequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const arena = { width: 720, height: 640 };

function expectInsideArena(chars: LiveChar[]) {
  for (const char of chars) {
    expect(char.x).toBeGreaterThanOrEqual(MARGIN);
    expect(char.x).toBeLessThanOrEqual(arena.width - CHAR_W - MARGIN);
    expect(char.y).toBeGreaterThanOrEqual(MARGIN);
    expect(char.y).toBeLessThanOrEqual(arena.height - CHAR_H - MARGIN);
  }
}

describe("cena espalhada do Focus Agentes", () => {
  it("monta todos os personagens dentro da arena e marca somente os alvos", () => {
    const ids = ["azul_fone", "verde_oculos", "roxo_bone", "amarelo_coroa"];
    const targetIds = ["verde_oculos", "amarelo_coroa"];
    const chars = montarCenaEspalhada(ids, targetIds, arena.width, arena.height, 1,
      randomSequence([0.12, 0.84, 0.37, 0.61, 0.25, 0.73]));

    expect(chars).toHaveLength(ids.length);
    expectInsideArena(chars);
    expect(chars.filter((char) => char.isTarget).map((char) => char.id)).toEqual(targetIds);
  });

  it("separa personagens que se cobririam", () => {
    const chars: LiveChar[] = [
      { uid: "c0", id: "azul_fone", isTarget: false, bx: 100, by: 100, x: 100, y: 100, vx: 0, vy: 0, ph: 0 },
      { uid: "c1", id: "verde_oculos", isTarget: true, bx: 110, by: 110, x: 110, y: 110, vx: 0, vy: 0, ph: 0 },
    ];

    separarPersonagens(chars, arena.width, arena.height, false);

    for (let first = 0; first < chars.length; first++) {
      for (let second = first + 1; second < chars.length; second++) {
        const horizontal = Math.abs(chars[second].x - chars[first].x) < CHAR_W * 0.8;
        const vertical = Math.abs(chars[second].y - chars[first].y) < CHAR_H * 0.58;
        expect(horizontal && vertical).toBe(false);
      }
    }
  });

  it("rebate na borda esquerda sem sair da arena", () => {
    const chars: LiveChar[] = [
      { uid: "c0", id: "azul_fone", isTarget: false, bx: MARGIN, by: 100, x: MARGIN, y: 100, vx: -1, vy: 0, ph: 0 },
    ];

    passoDeriva(chars, arena.width, arena.height);

    expect(chars[0].vx).toBeGreaterThan(0);
    expect(chars[0].x).toBeGreaterThanOrEqual(MARGIN);
  });

  it("mantém a cena dentro da arena depois de 300 passos", () => {
    const chars = montarCenaEspalhada(
      ["azul_fone", "verde_oculos", "roxo_bone", "amarelo_coroa", "laranja_base"],
      ["azul_fone"],
      arena.width,
      arena.height,
      3,
      randomSequence([0.08, 0.93, 0.31, 0.68, 0.45, 0.77]),
    );

    for (let step = 0; step < 300; step++) passoDeriva(chars, arena.width, arena.height);

    expectInsideArena(chars);
  });

  it("é determinística com a mesma semente e varia com outra", () => {
    const ids = ["azul_fone", "verde_oculos", "roxo_bone"];
    const targets = ["verde_oculos"];
    const first = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.11, 0.22, 0.33, 0.44, 0.55, 0.66]));
    const second = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.11, 0.22, 0.33, 0.44, 0.55, 0.66]));
    const differentSeed = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.91, 0.82, 0.73, 0.64, 0.55, 0.46]));

    expect(second).toEqual(first);
    expect(differentSeed).not.toEqual(first);
  });

  it("mantém as fórmulas da deriva no módulo da cena", () => {
    const scene = source("lib/focus/scene.ts");
    const exercise = source("components/exercises/attention/FocusAgents.tsx");

    expect(scene).toMatch(/export const VEL_LEVE/);
    expect(scene).toMatch(/Math\.sin\(frame \* 0\.045 \+ fase\) \* 3/);
    expect(exercise).not.toMatch(/\bVEL_LEVE\b/);
    expect(exercise).not.toMatch(/Math\.sin\(f \* 0\.045 \+ c\.ph\) \* 3/);
  });
});
