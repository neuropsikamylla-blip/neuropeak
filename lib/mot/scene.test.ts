import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARENA_SCALE_MIN,
  ASPECT,
  BALL_RADIUS,
  BALL_RADIUS_MIN,
  RAZAO_DISTRATORES_TETO,
  arenaScaleForLevel,
  ballRadius,
  ballSpeed,
  ballTouchRadius,
  bolaNoPonto,
  capacidadeDaArena,
  gridPositions,
  randomBalls,
  razaoDeDistratores,
  separacaoEfetiva,
  speedStepForLevel,
  stepAll,
  targetsForLevel,
  totalBalls,
  totalBallsDesejado,
  trackDuration,
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

function expectInsideArena(balls: Ball[], width: number, height: number, radius: number) {
  for (const ball of balls) {
    expect(ball.x).toBeGreaterThanOrEqual(radius);
    expect(ball.x).toBeLessThanOrEqual(width - radius);
    expect(ball.y).toBeGreaterThanOrEqual(radius);
    expect(ball.y).toBeLessThanOrEqual(height - radius);
  }
}

function expectNoOverlaps(balls: Ball[], radius: number) {
  for (let first = 0; first < balls.length; first++) {
    for (let second = first + 1; second < balls.length; second++) {
      expect(Math.hypot(
        balls[second].x - balls[first].x,
        balls[second].y - balls[first].y,
      )).toBeGreaterThanOrEqual(radius * 2);
    }
  }
}

function legacyPositionsAt320(random: () => number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const radius = 22;
  const separation = Math.max(radius * 3, 78);
  for (let index = 0; index < 20; index++) {
    let x = radius;
    let y = radius;
    let separated = false;
    let tries = 0;
    do {
      x = radius + random() * (320 - 2 * radius);
      y = radius + random() * (211 - 2 * radius);
      separated = positions.every((position) => Math.hypot(position.x - x, position.y - y)
        >= separation);
      tries++;
    } while (!separated && tries < 300);
    positions.push({ x, y });
  }
  return positions;
}

describe("cena do MOT", () => {
  it("mantém o raio do desktop e o reduz proporcionalmente em telas pequenas", () => {
    expect(ballRadius(600)).toBe(22);
    expect(ballRadius(1100)).toBe(22);
    expect(ballRadius(1440)).toBe(22);
    expect(ballRadius(320)).toBe(15);

    for (let width = 320; width <= 1440; width++) {
      expect(ballRadius(width)).toBeGreaterThanOrEqual(BALL_RADIUS_MIN);
      expect(ballRadius(width)).toBeLessThanOrEqual(BALL_RADIUS);
      if (width > 320) expect(ballRadius(width)).toBeGreaterThanOrEqual(ballRadius(width - 1));
    }
  });

  it("resolve o toque pela bola mais próxima, inclusive empates", () => {
    const balls: Ball[] = [
      { id: 7, x: 100, y: 100, vx: 0, vy: 0, isTarget: true },
      { id: 3, x: 120, y: 100, vx: 0, vy: 0, isTarget: false },
    ];

    for (let width = 320; width <= 1440; width++) {
      expect(ballTouchRadius(width)).toBeGreaterThanOrEqual(22);
    }
    expect(bolaNoPonto(balls, 117, 100, 320)).toBe(3);
    expect(bolaNoPonto(balls, 110, 100, 320)).toBe(3);
    expect(bolaNoPonto(balls, 200, 100, 320)).toBeNull();
  });

  it("a densidade de distratores cresce sem endurecer o nível inicial", () => {
    expect(totalBallsDesejado(0)).toBe(8);
    let reachedCeiling = false;
    for (let level = 0; level <= 40; level++) {
      const ratio = razaoDeDistratores(level);
      expect(ratio).toBeLessThanOrEqual(RAZAO_DISTRATORES_TETO);
      if (level > 0) {
        expect(ratio).toBeGreaterThanOrEqual(razaoDeDistratores(level - 1));
        if (!reachedCeiling) expect(ratio).toBeGreaterThan(razaoDeDistratores(level - 1));
      }
      reachedCeiling ||= ratio === RAZAO_DISTRATORES_TETO;
      if (level > 0) expect(totalBallsDesejado(level)).toBeGreaterThanOrEqual(totalBallsDesejado(level - 1));
    }
  });

  it("não nasce sobreposta nas arenas e níveis de aceite", () => {
    for (const width of [320, 393, 600, 768, 1100, 1440]) {
      const height = Math.round(width * 0.66);
      const radius = ballRadius(width);
      for (const level of [0, 3, 5, 7, 10, 14, 16]) {
        for (let round = 0; round < 40; round++) {
          const balls = randomBalls(level, round, width, height, seededRandom(width * 1000 + level * 100 + round));
          expectNoOverlaps(balls, radius);
        }
      }
    }
  });

  it("documenta o defeito anterior: 320 px no nível 7 nascia com sobreposições", () => {
    const oldTotal = targetsForLevel(7) + Math.min(14, targetsForLevel(7) * 2 + 2);
    const oldCapacityAt320 = 15;
    expect(oldTotal).toBe(20);
    expect(oldTotal).toBeGreaterThan(oldCapacityAt320);

    // Medição de produção: cerca de 16,6 pares sobrepostos. Esta reprodução da regra anterior
    // demonstra por que a garantia acima precisa existir: após 300 tentativas, a posição era
    // adicionada mesmo sem separação suficiente.
    const positions = legacyPositionsAt320(seededRandom(320007));
    const overlappingPairs = positions.flatMap((position, first) => positions.slice(first + 1)
      .filter((other) => Math.hypot(other.x - position.x, other.y - position.y) < 44));
    expect(overlappingPairs.length).toBeGreaterThan(0);
  });

  it("respeita a capacidade e sempre preserva ao menos um distrator", () => {
    for (const width of [320, 393, 600, 768, 1100, 1440]) {
      const height = Math.round(width * 0.66);
      for (const level of [0, 3, 5, 7, 10, 14, 16]) {
        const count = totalBalls(level, width, height);
        expect(count).toBeLessThanOrEqual(capacidadeDaArena(width, height, ballRadius(width)));
        expect(count).toBeGreaterThanOrEqual(targetsForLevel(level) + 1);
        expect(randomBalls(level, 0, width, height, seededRandom(width + level))
          .filter((ball) => ball.isTarget)).toHaveLength(targetsForLevel(level));
      }
    }
  });

  it("mantém as regras congeladas em todos os níveis verificados", () => {
    const targets = [2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    const speedSteps = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10];
    const speeds = [1.25, 1.25, 1.53, 1.53, 1.81, 1.81, 2.09, 2.09, 2.37, 2.37, 2.65, 2.65, 2.93, 2.93, 3, 3, 3, 3, 3, 3, 3];
    // 4,5 s → 7,0 s (v3.30.0). Eram 3,5 → 5,3 e ela relatou que dava para DECORAR as
    // posições em vez de rastrear. Teto no mesmo nível 13 de antes: muda a escala, não a forma.
    const durations = [4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6300, 6500, 6700, 6900, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000];
    const scales = [0.75, 0.7916666666666666, 0.8333333333333334, 0.875, 0.9166666666666666, 0.9583333333333334, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    for (let level = 0; level <= 20; level++) {
      expect(targetsForLevel(level)).toBe(targets[level]);
      expect(speedStepForLevel(level)).toBe(speedSteps[level]);
      // toBeCloseTo, e não toBe: ballSpeed(10) é 1,25 + 5 × 0,28 = 2,6500000000000004 em ponto
      // flutuante. A 10 casas a prova do congelamento continua valendo, sem falso negativo.
      expect(ballSpeed(level)).toBeCloseTo(speeds[level], 10);
      expect(trackDuration(level)).toBe(durations[level]);
      expect(arenaScaleForLevel(level)).toBe(scales[level]);
    }
    expect(ARENA_SCALE_MIN).toBe(0.75);
  });

  it("mantém a física dentro das bordas para raios pequeno e pleno", () => {
    for (const [width, height, radius] of [[320, 211, 15], [720, 480, 22]] as const) {
      let balls = randomBalls(4, 0, width, height, seededRandom(width));
      for (let step = 0; step < 600; step++) balls = stepAll(balls, width, height, radius);
      expectInsideArena(balls, width, height, radius);
    }
  });

  it("a malha de salvaguarda separa as bolas mesmo quando é acionada", () => {
    // Ela nunca dispara com a calibração atual (medido: 0 em 8.400 casos), e é justamente por isso
    // que precisa de prova própria: rede de segurança não executada pode sobrepor igual ao defeito
    // que ela existe para evitar. A propriedade exigida é a mesma do caminho aleatório.
    for (const width of [320, 393, 600, 768, 1100, 1440]) {
      const height = Math.round(width * ASPECT);
      const radius = ballRadius(width);
      for (const level of [0, 3, 5, 7, 10, 14, 16]) {
        const count = totalBalls(level, width, height);
        const separation = separacaoEfetiva(level, radius, count, width, height);
        const positions = gridPositions(count, width, height, radius, separation);
        expect(positions).toHaveLength(count);
        for (const position of positions) {
          expect(position.x).toBeGreaterThanOrEqual(radius);
          expect(position.x).toBeLessThanOrEqual(width - radius);
          expect(position.y).toBeGreaterThanOrEqual(radius);
          expect(position.y).toBeLessThanOrEqual(height - radius);
        }
        for (let first = 0; first < positions.length; first++) {
          for (let second = first + 1; second < positions.length; second++) {
            const distance = Math.hypot(
              positions[first].x - positions[second].x,
              positions[first].y - positions[second].y,
            );
            expect(distance, `malha sobreposta em ${width}px nível ${level}`)
              .toBeGreaterThanOrEqual(2 * radius);
          }
        }
      }
    }
  });

  it("mantém as fórmulas no módulo puro e usa dimensões reais no componente", () => {
    const scene = source("lib/mot/scene.ts");
    const exercise = source("components/exercises/attention/MOT.tsx");
    const ball = source("components/exercises/attention/MOTBall.tsx");

    for (const exportedName of [
      "BALL_RADIUS", "ASPECT", "MAX_TARGETS", "targetsForLevel", "speedStepForLevel",
      "ballSpeed", "totalBalls", "trackDuration", "randomBalls", "stepAll",
    ]) {
      expect(scene).toMatch(new RegExp(`export (?:const|function) ${exportedName}\\b`));
    }
    expect(exercise).toMatch(/totalBalls\(level, arena\.w, arena\.h\)/);
    expect(exercise).not.toMatch(/totalBalls\(level\)/);
    expect(ball).not.toMatch(/import\s*\{[^}]*BALL_RADIUS/);
    expect(ball).not.toMatch(/onClick=/);
  });
});

describe("VP — a duração do rastreamento (pedido dela, 15/set/2026)", () => {
  it("nunca começa abaixo de 4,5 s — o piso em que decorar deixa de resolver", () => {
    for (let level = 0; level <= 30; level++) {
      expect(trackDuration(level)).toBeGreaterThanOrEqual(4500);
    }
  });

  it("é monotônica e para exatamente em 7,0 s", () => {
    let anterior = 0;
    for (let level = 0; level <= 30; level++) {
      const atual = trackDuration(level);
      expect(atual).toBeGreaterThanOrEqual(anterior);
      expect(atual).toBeLessThanOrEqual(7000);
      anterior = atual;
    }
    expect(trackDuration(13)).toBe(7000);
    expect(trackDuration(30)).toBe(7000);
  });

  // Controle negativo: prova que o teste acima reprovaria a curva ANTIGA, em vez de
  // passar por qualquer valor. Sem isto, o piso de 4,5 s não estaria realmente provado.
  it("controle negativo: a curva antiga (3,5 s) seria reprovada pelo piso", () => {
    const antiga = (level: number) => 3500 + Math.min(1800, level * 140);
    expect(antiga(0)).toBeLessThan(4500);
    expect(antiga(13)).toBeLessThan(7000);
  });

  it("a rodada continua cabendo na sessão: pior caso bem abaixo do alvo de 8 min", () => {
    // memorizar 2 s + rastrear + responder (~5 s) + intervalo 1,5 s
    const ciclo = (2000 + trackDuration(13) + 5000 + 1500) / 1000;
    expect(ciclo).toBeLessThan(16);          // ~15,5 s por rodada no nível mais alto
    expect(Math.floor(480 / ciclo)).toBeGreaterThanOrEqual(30);   // ≥ 30 rodadas em 8 min
  });
});
