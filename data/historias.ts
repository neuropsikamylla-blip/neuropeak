// Catálogo das histórias ilustradas (cenas em /exercises/historias/<id>/<1..n>.png, em ORDEM correta).
// Gerado a partir das pranchas cortadas. Dificuldade pelo nº de cenas: fáceis=4, média=5, difícil=6, muito difícil=8.

export type HistDiff = "faceis" | "media" | "dificil" | "muito-dificil";
export interface HistoriaDef { id: string; diff: HistDiff; n: number; }

export const HISTORIAS: HistoriaDef[] = [
  { id: "f1", diff: "faceis", n: 4 },
  { id: "f2", diff: "faceis", n: 4 },
  { id: "f3", diff: "faceis", n: 4 },
  { id: "f4", diff: "faceis", n: 4 },
  { id: "f5", diff: "faceis", n: 4 },
  { id: "f6", diff: "faceis", n: 4 },
  { id: "f7", diff: "faceis", n: 4 },
  { id: "f8", diff: "faceis", n: 4 },
  { id: "f9", diff: "faceis", n: 4 },
  { id: "f10", diff: "faceis", n: 4 },
  { id: "m1", diff: "media", n: 5 },
  { id: "m2", diff: "media", n: 5 },
  { id: "m3", diff: "media", n: 5 },
  { id: "m4", diff: "media", n: 5 },
  { id: "m5", diff: "media", n: 5 },
  { id: "m6", diff: "media", n: 5 },
  { id: "m7", diff: "media", n: 5 },
  { id: "m8", diff: "media", n: 5 },
  { id: "m9", diff: "media", n: 5 },
  { id: "m10", diff: "media", n: 5 },
  { id: "d1", diff: "dificil", n: 6 },
  { id: "d2", diff: "dificil", n: 6 },
  { id: "d3", diff: "dificil", n: 6 },
  { id: "d4", diff: "dificil", n: 6 },
  { id: "d5", diff: "dificil", n: 6 },
  { id: "d6", diff: "dificil", n: 6 },
  { id: "d7", diff: "dificil", n: 6 },
  { id: "d8", diff: "dificil", n: 6 },
  { id: "d9", diff: "dificil", n: 6 },
  { id: "d10", diff: "dificil", n: 6 },
  { id: "d11", diff: "dificil", n: 6 },
  { id: "d12", diff: "dificil", n: 6 },
  { id: "x1", diff: "muito-dificil", n: 8 },
  { id: "x2", diff: "muito-dificil", n: 8 },
  { id: "x3", diff: "muito-dificil", n: 8 },
  { id: "x4", diff: "muito-dificil", n: 8 },
  { id: "x5", diff: "muito-dificil", n: 8 },
  { id: "x6", diff: "muito-dificil", n: 8 },
  { id: "x7", diff: "muito-dificil", n: 8 },
  { id: "x8", diff: "muito-dificil", n: 8 },
  { id: "x9", diff: "muito-dificil", n: 8 },
  { id: "x10", diff: "muito-dificil", n: 8 },
];

export const HIST_DIFF_PANELS: Record<HistDiff, number> = { faceis: 4, media: 5, dificil: 6, "muito-dificil": 8 };
export const histPanelSrc = (id: string, i: number) => `/exercises/historias/${id}/${i}.png`;
