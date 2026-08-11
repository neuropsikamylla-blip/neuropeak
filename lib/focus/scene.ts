export const CHAR_W = 112;
export const CHAR_H = Math.round(CHAR_W / 0.667);
export const MARGIN = 6;
export const VEL_LEVE = [0.4, 0.8, 1.3, 1.9];

export interface LiveChar {
  uid: string;
  id: string;
  isTarget: boolean;
  hit?: boolean;
  bx: number;
  by: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
}

type Random = () => number;

const rnd = (random: Random, minimum: number, maximum: number) =>
  minimum + random() * (maximum - minimum);

const shuffle = <T,>(items: T[], random: Random): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export function separarPersonagens(lista: LiveChar[], W: number, H: number, cai: boolean) {
  const MIN_DX = CHAR_W * 0.80;
  const MIN_DY = CHAR_H * 0.58;
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i];
      const b = lista[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const penX = MIN_DX - Math.abs(dx);
      const penY = MIN_DY - Math.abs(dy);
      if (penX <= 0 || penY <= 0) continue;
      if (cai || penX / MIN_DX <= penY / MIN_DY) {
        const s = ((dx >= 0 ? 1 : -1) * Math.max(penX, 1)) / 2;
        a.x -= s;
        b.x += s;
      } else {
        const s = ((dy >= 0 ? 1 : -1) * penY) / 2;
        a.y -= s;
        b.y += s;
      }
      a.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, a.x));
      b.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, b.x));
      if (!cai) {
        a.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, a.y));
        b.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, b.y));
      }
    }
  }
}

export function montarCenaEspalhada(
  characterIds: string[],
  targetIds: string[],
  W: number,
  H: number,
  velocityIndex: number,
  random: Random = Math.random,
): LiveChar[] {
  const characterCount = characterIds.length;
  const velocityBase = VEL_LEVE[velocityIndex];
  const columns = Math.max(2, Math.round(Math.sqrt(characterCount * (W / Math.max(1, H)) / 1.4)));
  const rows = Math.max(2, Math.ceil(characterCount / columns));
  const cells = shuffle(Array.from({ length: columns * rows }, (_, index) => index), random)
    .slice(0, characterCount);
  const cellWidth = W / columns;
  const cellHeight = H / rows;

  return characterIds.map((id, index) => {
    const cell = cells[index];
    const cellX = (cell % columns) * cellWidth;
    const cellY = Math.floor(cell / columns) * cellHeight;
    const x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN,
      cellX + rnd(random, 4, Math.max(6, cellWidth - CHAR_W - 4))));
    const y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN,
      cellY + rnd(random, 4, Math.max(6, cellHeight - CHAR_H - 4))));
    const angle = rnd(random, 0, Math.PI * 2);
    const speed = velocityBase * rnd(random, 0.7, 1.2);

    return {
      uid: `c${index}`,
      id,
      isTarget: targetIds.includes(id),
      bx: x,
      by: y,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ph: rnd(random, 0, Math.PI * 2),
    };
  });
}

export function passoDeriva(lista: LiveChar[], W: number, H: number): LiveChar[] {
  const maxX = W - CHAR_W - MARGIN;
  const maxY = H - CHAR_H - MARGIN;
  for (const character of lista) {
    character.x += character.vx;
    character.y += character.vy;
    if (character.x < MARGIN) {
      character.x = MARGIN;
      character.vx = Math.abs(character.vx);
    } else if (character.x > maxX) {
      character.x = maxX;
      character.vx = -Math.abs(character.vx);
    }
    if (character.y < MARGIN) {
      character.y = MARGIN;
      character.vy = Math.abs(character.vy);
    } else if (character.y > maxY) {
      character.y = maxY;
      character.vy = -Math.abs(character.vy);
    }
  }
  separarPersonagens(lista, W, H, false);
  return lista;
}

export function bobOffset(frame: number, fase: number): number {
  return Math.sin(frame * 0.045 + fase) * 3;
}
