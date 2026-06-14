// Catálogo das histórias ilustradas (cenas em /exercises/historias/<id>/<1..n>.png, em ORDEM correta).
// n = nº de cenas; a = formato (largura/altura) das cenas. Dificuldade: fáceis=4, média=5, difícil=6, muito=8.

export type HistDiff = "faceis" | "media" | "dificil" | "muito-dificil";
export interface HistoriaDef { id: string; diff: HistDiff; n: number; a: number; }

export const HISTORIAS: HistoriaDef[] = [
  { id: "f1", diff: "faceis", n: 4, a: 1.57 },
  { id: "f2", diff: "faceis", n: 4, a: 1.52 },
  { id: "f3", diff: "faceis", n: 4, a: 1.46 },
  { id: "f4", diff: "faceis", n: 4, a: 1.44 },
  { id: "f5", diff: "faceis", n: 4, a: 1.52 },
  { id: "f6", diff: "faceis", n: 4, a: 1.48 },
  { id: "f7", diff: "faceis", n: 4, a: 1.51 },
  { id: "f8", diff: "faceis", n: 4, a: 1.48 },
  { id: "f9", diff: "faceis", n: 4, a: 1.53 },
  { id: "f10", diff: "faceis", n: 4, a: 1.52 },
  { id: "m1", diff: "media", n: 5, a: 1.07 },
  { id: "m2", diff: "media", n: 5, a: 1.07 },
  { id: "m3", diff: "media", n: 5, a: 1.06 },
  { id: "m4", diff: "media", n: 5, a: 1.06 },
  { id: "m5", diff: "media", n: 5, a: 1.05 },
  { id: "m6", diff: "media", n: 5, a: 1.07 },
  { id: "m7", diff: "media", n: 5, a: 1.03 },
  { id: "m8", diff: "media", n: 5, a: 1.06 },
  { id: "m9", diff: "media", n: 5, a: 1.06 },
  { id: "m10", diff: "media", n: 5, a: 1.07 },
  { id: "d1", diff: "dificil", n: 6, a: 1.11 },
  { id: "d2", diff: "dificil", n: 6, a: 1.04 },
  { id: "d3", diff: "dificil", n: 6, a: 1.08 },
  { id: "d4", diff: "dificil", n: 6, a: 1.05 },
  { id: "d5", diff: "dificil", n: 6, a: 1.07 },
  { id: "d6", diff: "dificil", n: 6, a: 1.07 },
  { id: "d7", diff: "dificil", n: 6, a: 1.07 },
  { id: "d8", diff: "dificil", n: 6, a: 1.1 },
  { id: "d9", diff: "dificil", n: 6, a: 1.02 },
  { id: "d10", diff: "dificil", n: 6, a: 1.12 },
  { id: "d11", diff: "dificil", n: 6, a: 1.02 },
  { id: "d12", diff: "dificil", n: 6, a: 1.08 },
  { id: "x1", diff: "muito-dificil", n: 8, a: 0.81 },
  { id: "x2", diff: "muito-dificil", n: 8, a: 0.86 },
  { id: "x3", diff: "muito-dificil", n: 8, a: 0.78 },
  { id: "x4", diff: "muito-dificil", n: 8, a: 0.78 },
  { id: "x5", diff: "muito-dificil", n: 8, a: 0.75 },
  { id: "x6", diff: "muito-dificil", n: 8, a: 0.77 },
  { id: "x7", diff: "muito-dificil", n: 8, a: 0.74 },
  { id: "x8", diff: "muito-dificil", n: 8, a: 0.81 },
  { id: "x9", diff: "muito-dificil", n: 8, a: 0.8 },
  { id: "x10", diff: "muito-dificil", n: 8, a: 0.78 },
];

export const HIST_DIFF_PANELS: Record<HistDiff, number> = { faceis: 4, media: 5, dificil: 6, "muito-dificil": 8 };
export const histPanelSrc = (id: string, i: number) => `/exercises/historias/${id}/${i}.png`;
