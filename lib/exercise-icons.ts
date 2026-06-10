// Exercícios que já têm ícone 3D em /public/exercises/icones-exercicios/<id>.png.
// Os demais continuam usando o emoji (fallback) até ganharem o ícone próprio.
export const EXERCISE_ICON_IDS = new Set<string>([
  // memória
  "span-numerico",
  "span-numerico-inverso",
  "matriz-espacial",
  "matriz-espacial-inversa",
  "jogo-memoria",
  "letras-sequencia",
  "padroes-rotacao",
  "sequencia-itens",
  // (lista-distracao, restaurante-ordem: ícones já na pasta,
  //  serão adicionados ao Set quando cada exercício for criado)
  // atenção
  "trilha-visual",
  "caca-item-barato",
  "focus-agents",
  "focus-agents-auditivo",
  "antes-depois",
  "mot",
  "dual-task",
  // processamento
  "tempo-reacao",
  "certo-ou-errado",
  "semaforo",
  "corrida-tempo",
  // executivo
  "stroop-task",
  "torre-hanoi",
  "labirinto",
  "ordem-historia",
  "mudanca-regras",
  "compra-multifuncional",
  "task-switching",
  "deductive-grid",
  // funcional / supermercado
  "desafio-supermercado",
  "desafio-supermercado-auditivo",
]);

// Escala por ícone (1 = padrão). Os ícones desta leva já foram normalizados
// (auto-crop), então usam o tamanho padrão. Manter aqui caso algum precise de ajuste.
export const ICON_SCALE: Record<string, number> = {};
