import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BALL_RADIUS,
  randomBalls,
  stepAll,
  targetsForLevel,
  totalBalls,
  type Ball,
} from "./scene";

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const arena = { width: 720, height: 480 };
const minimumLevel = 0;

function expectInsideArena(balls: Ball[]) {
  for (const ball of balls) {
    expect(ball.x).toBeGreaterThanOrEqual(BALL_RADIUS);
    expect(ball.x).toBeLessThanOrEqual(arena.width - BALL_RADIUS);
    expect(ball.y).toBeGreaterThanOrEqual(BALL_RADIUS);
    expect(ball.y).toBeLessThanOrEqual(arena.height - BALL_RADIUS);
  }
}

describe("cena do MOT", () => {
  it("gera o total e os alvos do nível dentro da arena", () => {
    const balls = randomBalls(
      minimumLevel,
      0,
      arena.width,
      arena.height,
      seededRandom(21),
    );

    expect(balls).toHaveLength(totalBalls(minimumLevel));
    expect(balls.filter((ball) => ball.isTarget)).toHaveLength(
      targetsForLevel(minimumLevel),
    );
    expectInsideArena(balls);
  });

  it("gera todas as bolas separadas pela distância mínima", () => {
    const balls = randomBalls(
      minimumLevel,
      0,
      arena.width,
      arena.height,
      seededRandom(37),
    );
    const minimumDistance = Math.max(BALL_RADIUS * 3, 78);

    for (let first = 0; first < balls.length; first++) {
      for (let second = first + 1; second < balls.length; second++) {
        expect(Math.hypot(
          balls[second].x - balls[first].x,
          balls[second].y - balls[first].y,
        )).toBeGreaterThanOrEqual(minimumDistance);
      }
    }
  });

  it("rebate na parede e mantém a bola dentro do quadro", () => {
    const balls: Ball[] = [
      {
        id: 0,
        x: BALL_RADIUS,
        y: 120,
        vx: -2,
        vy: 0,
        isTarget: true,
      },
    ];

    const next = stepAll(balls, arena.width, arena.height);

    expect(next[0].vx).toBeGreaterThan(0);
    expectInsideArena(next);
  });

  it("separa duas bolas sobrepostas", () => {
    const balls: Ball[] = [
      { id: 0, x: 200, y: 200, vx: 0, vy: 0, isTarget: true },
      { id: 1, x: 210, y: 200, vx: 0, vy: 0, isTarget: false },
    ];

    const next = stepAll(balls, arena.width, arena.height);

    expect(Math.hypot(next[1].x - next[0].x, next[1].y - next[0].y))
      .toBeGreaterThanOrEqual(BALL_RADIUS * 2);
  });

  it("não deixa nenhuma bola vazar após 300 passos", () => {
    let balls = randomBalls(4, 0, arena.width, arena.height, seededRandom(83));

    for (let step = 0; step < 300; step++) {
      balls = stepAll(balls, arena.width, arena.height);
    }

    expectInsideArena(balls);
  });

  it("é determinística para a mesma semente e varia para sementes diferentes", () => {
    const first = randomBalls(2, 1, arena.width, arena.height, seededRandom(5));
    const second = randomBalls(2, 1, arena.width, arena.height, seededRandom(5));
    const different = randomBalls(2, 1, arena.width, arena.height, seededRandom(6));

    expect(second).toEqual(first);
    expect(different).not.toEqual(first);
  });

  it("mantém as fórmulas no módulo puro, sem cópia no componente", () => {
    const scene = source("lib/mot/scene.ts");
    const exercise = source("components/exercises/attention/MOT.tsx");

    for (const exportedName of [
      "BALL_RADIUS",
      "ASPECT",
      "MAX_TARGETS",
      "targetsForLevel",
      "speedStepForLevel",
      "ballSpeed",
      "totalBalls",
      "trackDuration",
      "randomBalls",
      "stepAll",
    ]) {
      expect(scene).toMatch(new RegExp(`export (?:const|function) ${exportedName}\\b`));
    }
    expect(exercise).not.toMatch(/function targetsForLevel|function speedStepForLevel/);
    expect(exercise).not.toMatch(/function randomBalls|function stepAll/);
    expect(exercise).not.toMatch(/const BALL_RADIUS|const ASPECT|const MAX_TARGETS/);
  });
});
