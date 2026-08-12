export const BALL_RADIUS = 22;
export const ASPECT = 0.66;
export const MAX_TARGETS = 6;

export function targetsForLevel(level: number): number {
  return Math.min(MAX_TARGETS, 2 + Math.ceil(level / 2));
}

export function speedStepForLevel(level: number): number {
  return Math.floor(level / 2);
}

export function ballSpeed(level: number): number {
  return Math.min(3.0, 1.25 + speedStepForLevel(level) * 0.28);
}

export function totalBalls(level: number): number {
  const targets = targetsForLevel(level);
  return targets + Math.min(6, targets + 2);
}

export function trackDuration(level: number): number {
  return 3500 + Math.min(1800, level * 140);
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
}

export function randomBalls(
  level: number,
  round: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): Ball[] {
  const count = totalBalls(level);
  const targetCount = targetsForLevel(level);
  const speed = ballSpeed(level);
  const radius = BALL_RADIUS;
  const balls: Ball[] = [];
  const positions: { x: number; y: number }[] = [];

  for (let index = 0; index < count; index++) {
    let x = radius;
    let y = radius;
    let separated = false;
    let tries = 0;
    do {
      x = radius + random() * (width - 2 * radius);
      y = radius + random() * (height - 2 * radius);
      separated = positions.every((position) => Math.hypot(position.x - x, position.y - y)
        >= Math.max(radius * 3, 78));
      tries++;
    } while (!separated && tries < 300);
    positions.push({ x, y });

    const angle = random() * Math.PI * 2;
    const actualSpeed = (0.8 + random() * 0.4) * speed;
    void round;
    balls.push({
      id: index,
      x,
      y,
      vx: Math.cos(angle) * actualSpeed,
      vy: Math.sin(angle) * actualSpeed,
      isTarget: index < targetCount,
    });
  }
  return balls;
}

export function stepAll(balls: Ball[], width: number, height: number): Ball[] {
  const radius = BALL_RADIUS;
  const next = balls.map((ball) => {
    let x = ball.x + ball.vx;
    let y = ball.y + ball.vy;
    let vx = ball.vx;
    let vy = ball.vy;
    if (x - radius < 0) {
      x = radius;
      vx = Math.abs(vx);
    }
    if (x + radius > width) {
      x = width - radius;
      vx = -Math.abs(vx);
    }
    if (y - radius < 0) {
      y = radius;
      vy = Math.abs(vy);
    }
    if (y + radius > height) {
      y = height - radius;
      vy = -Math.abs(vy);
    }
    return { ...ball, x, y, vx, vy };
  });

  for (let first = 0; first < next.length; first++) {
    for (let second = first + 1; second < next.length; second++) {
      const a = next[first];
      const b = next[second];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.001;
      const minimumDistance = 2 * radius;
      if (distance < minimumDistance) {
        const normalX = dx / distance;
        const normalY = dy / distance;
        const push = (minimumDistance - distance) / 2 + 0.5;
        a.x -= normalX * push;
        a.y -= normalY * push;
        b.x += normalX * push;
        b.y += normalY * push;
        const velocityA = a.vx * normalX + a.vy * normalY;
        const velocityB = b.vx * normalX + b.vy * normalY;
        const velocityDifference = velocityB - velocityA;
        a.vx += velocityDifference * normalX;
        a.vy += velocityDifference * normalY;
        b.vx -= velocityDifference * normalX;
        b.vy -= velocityDifference * normalY;
        a.x = Math.max(radius, Math.min(width - radius, a.x));
        a.y = Math.max(radius, Math.min(height - radius, a.y));
        b.x = Math.max(radius, Math.min(width - radius, b.x));
        b.y = Math.max(radius, Math.min(height - radius, b.y));
      }
    }
  }
  return next;
}

/**
 * Fração da arena disponível que o nível usa.
 *
 * Pedido dela em 12/ago/2026, treinando: *"quando estiver pouca assim, o quadrado o espaço precisa
 * ser menor; com a progressão da dificuldade vai aumentando o espaçamento e as bolas precisam
 * aumentar quantidade e espalhar mais pelo quadrado"*.
 *
 * O motivo é clínico, não estético: poucas bolas numa área enorme ficam distantes umas das outras e
 * o rastreamento perde a dificuldade — o olho acompanha objetos isolados sem esforço. A carga vem
 * de duas coisas ao mesmo tempo, e elas precisam crescer juntas: **quantidade** (já em
 * `totalBalls`) e **área a varrer**. Área grande com poucas bolas é espaço vazio, não é treino.
 *
 * Começa em 55% e chega a 100% — nunca passa disso, porque o teto é o que cabe na tela do paciente.
 */
export const ARENA_SCALE_MIN = 0.55;
const ARENA_SCALE_FULL_LEVEL = 10;

export function arenaScaleForLevel(level: number): number {
  const progresso = Math.max(0, Math.min(1, level / ARENA_SCALE_FULL_LEVEL));
  return ARENA_SCALE_MIN + (1 - ARENA_SCALE_MIN) * progresso;
}
