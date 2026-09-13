export const BALL_RADIUS = 22;
export const BALL_RADIUS_MIN = 15;
export const ARENA_W_RAIO_PLENO = 600;
export const ARENA_W_RAIO_MIN = 320;
export const RAIO_TOQUE_MIN = 22;
export const ASPECT = 0.66;
export const MAX_TARGETS = 6;
export const RAZAO_DISTRATORES_BASE = 3.0;
export const RAZAO_DISTRATORES_PASSO = 0.15;
export const RAZAO_DISTRATORES_TETO = 4.8;
export const SEP_PISO_EM_RAIOS = 2.1;
export const FATOR_CAPACIDADE = 0.45;
export const SEP_INICIAL_DE = 3.5;
export const SEP_INICIAL_ATE = 2.6;
export const SEP_INICIAL_PLENO_EM = 12;
export const FATOR_OCUPACAO = 0.65;

export function ballRadius(arenaWidth: number): number {
  if (arenaWidth >= ARENA_W_RAIO_PLENO) return BALL_RADIUS;
  const t = Math.max(0, Math.min(1,
    (arenaWidth - ARENA_W_RAIO_MIN) / (ARENA_W_RAIO_PLENO - ARENA_W_RAIO_MIN)));
  return Math.round(BALL_RADIUS_MIN + t * (BALL_RADIUS - BALL_RADIUS_MIN));
}

export function ballTouchRadius(arenaWidth: number): number {
  return Math.max(RAIO_TOQUE_MIN, ballRadius(arenaWidth));
}

export function targetsForLevel(level: number): number {
  return Math.min(MAX_TARGETS, 2 + Math.ceil(level / 2));
}

export function speedStepForLevel(level: number): number {
  return Math.floor(level / 2);
}

export function ballSpeed(level: number): number {
  return Math.min(3.0, 1.25 + speedStepForLevel(level) * 0.28);
}

export function razaoDeDistratores(level: number): number {
  return Math.min(RAZAO_DISTRATORES_TETO,
    RAZAO_DISTRATORES_BASE + RAZAO_DISTRATORES_PASSO * Math.max(0, level));
}

/** Total desejado pelo nível, antes do limite físico da arena. */
export function totalBallsDesejado(level: number): number {
  const targets = targetsForLevel(level);
  // Distratores: eram no máximo 6 e o quadro ficava vazio demais. Ela pediu em 28/ago/2026
  // "o retângulo pode ser maior, ter mais bolas para gerar confusão" — a carga do MOT vem da
  // densidade de distratores, não só do número de alvos. A razão cresce até o teto de 4,8.
  return targets + Math.round(targets * razaoDeDistratores(level));
}

/** Quantas bolas cabem respeitando a separação mínima de nascimento. */
export function capacidadeDaArena(width: number, height: number, raio: number): number {
  const sep = SEP_PISO_EM_RAIOS * raio;
  return Math.max(3, Math.floor(FATOR_CAPACIDADE * (width * height) / (sep * sep)));
}

/** Total efetivo, limitado pela capacidade física quando a arena é informada. */
export function totalBalls(level: number, arenaWidth?: number, arenaHeight?: number): number {
  const desejado = totalBallsDesejado(level);
  if (arenaWidth == null || arenaHeight == null) return desejado;
  const cap = capacidadeDaArena(arenaWidth, arenaHeight, ballRadius(arenaWidth));
  return Math.max(targetsForLevel(level) + 1, Math.min(desejado, cap));
}

/** Separação desejada pelo nível, em pixels. */
export function separacaoDesejada(level: number, raio: number): number {
  const t = Math.max(0, Math.min(1, Math.max(0, level) / SEP_INICIAL_PLENO_EM));
  return (SEP_INICIAL_DE + (SEP_INICIAL_ATE - SEP_INICIAL_DE) * t) * raio;
}

/** Separação usada pelo gerador, sem jamais cair abaixo do piso de segurança. */
export function separacaoEfetiva(
  level: number, raio: number, quantidadeDeBolas: number, width: number, height: number,
): number {
  const porBola = FATOR_OCUPACAO * Math.sqrt((width * height) / Math.max(1, quantidadeDeBolas));
  return Math.max(SEP_PISO_EM_RAIOS * raio, Math.min(separacaoDesejada(level, raio), porBola));
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

/**
 * A malha é uma salvaguarda determinística se as tentativas aleatórias saturarem.
 *
 * Medido em 12/set/2026: com a calibração atual ela **nunca dispara** — 0 em 8.400 casos (6 arenas ×
 * 7 níveis × 200 sementes). Fica porque a alternativa, quando saturar, é a bola nascer sobreposta,
 * que é o defeito que esta entrega corrige. Exportada para ser PROVADA em vez de ficar como rede de
 * segurança não executada: `scene.test.ts` exige separação ≥ 2 × raio nas posições que ela devolve.
 */
export function gridPositions(count: number, width: number, height: number, radius: number, separation: number) {
  const innerWidth = width - 2 * radius;
  const innerHeight = height - 2 * radius;
  const maxColumns = Math.max(1, Math.floor(innerWidth / separation) + 1);
  const maxRows = Math.max(1, Math.floor(innerHeight / separation) + 1);
  const preferredColumns = Math.ceil(Math.sqrt(count * innerWidth / innerHeight));
  const columns = Math.min(maxColumns, Math.max(Math.ceil(count / maxRows), preferredColumns));
  const rows = Math.ceil(count / columns);
  const positions: { x: number; y: number }[] = [];

  for (let index = 0; index < count; index++) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.push({
      x: radius + (columns === 1 ? innerWidth / 2 : column * innerWidth / (columns - 1)),
      y: radius + (rows === 1 ? innerHeight / 2 : row * innerHeight / (rows - 1)),
    });
  }
  return positions;
}

export function randomBalls(
  level: number,
  round: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): Ball[] {
  const radius = ballRadius(width);
  const count = totalBalls(level, width, height);
  const targetCount = targetsForLevel(level);
  const speed = ballSpeed(level);
  const positions: { x: number; y: number }[] = [];
  const separation = separacaoEfetiva(level, radius, count, width, height);

  for (let index = 0; index < count; index++) {
    let x = radius;
    let y = radius;
    let separated = false;
    let tries = 0;
    do {
      x = radius + random() * (width - 2 * radius);
      y = radius + random() * (height - 2 * radius);
      separated = positions.every((position) => Math.hypot(position.x - x, position.y - y)
        >= separation);
      tries++;
    } while (!separated && tries < 300);
    if (!separated) return gridPositions(count, width, height, radius, separation).map((position, id) => {
      const angle = random() * Math.PI * 2;
      const actualSpeed = (0.8 + random() * 0.4) * speed;
      void round;
      return {
        id,
        ...position,
        vx: Math.cos(angle) * actualSpeed,
        vy: Math.sin(angle) * actualSpeed,
        isTarget: id < targetCount,
      };
    });
    positions.push({ x, y });
  }

  return positions.map((position, id) => {
    const angle = random() * Math.PI * 2;
    const actualSpeed = (0.8 + random() * 0.4) * speed;
    void round;
    return {
      id,
      ...position,
      vx: Math.cos(angle) * actualSpeed,
      vy: Math.sin(angle) * actualSpeed,
      isTarget: id < targetCount,
    };
  });
}

export function stepAll(balls: Ball[], width: number, height: number, radius: number): Ball[] {
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

/** Índice da bola tocada; o centro mais próximo vence e o menor id desempata. */
export function bolaNoPonto(
  balls: readonly Ball[], x: number, y: number, arenaWidth: number,
): number | null {
  const touchRadius = ballTouchRadius(arenaWidth);
  let closestId: number | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const ball of balls) {
    const distance = Math.hypot(ball.x - x, ball.y - y);
    if (distance <= touchRadius && (distance < closestDistance
      || (distance === closestDistance && (closestId === null || ball.id < closestId)))) {
      closestId = ball.id;
      closestDistance = distance;
    }
  }
  return closestId;
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
 * Começa em 75% e chega a 100% — nunca passa disso, porque o teto é o que cabe na tela do paciente.
 */
export const ARENA_SCALE_MIN = 0.75;
const ARENA_SCALE_FULL_LEVEL = 6;

export function arenaScaleForLevel(level: number): number {
  const progresso = Math.max(0, Math.min(1, level / ARENA_SCALE_FULL_LEVEL));
  return ARENA_SCALE_MIN + (1 - ARENA_SCALE_MIN) * progresso;
}
