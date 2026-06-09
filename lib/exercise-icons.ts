// Exercícios que já têm ícone 3D em /public/exercises/icones-exercicios/<id>.png.
// Os demais continuam usando o emoji (fallback) até ganharem o ícone próprio.
export const EXERCISE_ICON_IDS = new Set<string>([
  "semaforo",
  "span-numerico",
  "matriz-espacial",
  "matriz-espacial-inversa",
  "jogo-memoria",
  "mot",
  "span-numerico-inverso",
  "dual-task",
]);

// Escala por ícone (1 = padrão). Alguns têm composição "espalhada" e ficam
// melhores um pouco maiores para parecerem do mesmo tamanho dos demais.
export const ICON_SCALE: Record<string, number> = {
  mot: 1.4,
};
