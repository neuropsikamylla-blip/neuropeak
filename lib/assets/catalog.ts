// ─────────────────────────────────────────────────────────────────────────────
// Visão geral da Biblioteca de Assets para a tela de pré-visualização (/preview/assets).
// Browser-safe (sem node) — resume as categorias, as contagens planejadas e alguns
// IDs de amostra por categoria. Os IDs são reais: renderizam a imagem quando ela
// existir, ou um placeholder até lá. Não duplica o catálogo completo (2.918 itens).
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryOverview {
  key: string;
  label: string;
  planned: number;         // quantos assets essa categoria terá quando completa
  note?: string;
  samples: { id: string; label: string }[];
}

const EXPR = [
  ["neutral", "Neutro"], ["happy", "Feliz"], ["very_happy", "Muito feliz"], ["sad", "Triste"],
  ["crying", "Chorando"], ["angry", "Bravo"], ["surprised", "Surpreso"], ["worried", "Preocupado"],
  ["afraid", "Com medo"], ["confused", "Confuso"], ["thinking", "Pensando"], ["embarrassed", "Envergonhado"],
  ["proud", "Orgulhoso"], ["disgusted", "Enojado"], ["tired", "Cansado"],
] as const;

const POSE = [
  ["standing", "Em pé"], ["walking", "Andando"], ["sitting", "Sentado"], ["reading", "Lendo"],
  ["writing", "Escrevendo"], ["raising_hand", "Mão levantada"], ["talking", "Falando"], ["waving", "Acenando"],
] as const;

export const LIBRARY_OVERVIEW: CategoryOverview[] = [
  {
    key: "characters", label: "Personagens", planned: 80,
    note: "30 crianças no acervo (adolescentes / adultos / idosos a fazer)",
    samples: [
      { id: "character:children:child-001", label: "Lucas O." },
      { id: "character:children:child-002", label: "Sofia" },
      { id: "character:children:child-003", label: "Miguel" },
      { id: "character:children:child-004", label: "Lucas T." },
      { id: "character:children:child-005", label: "Pedro" },
      { id: "character:children:child-006", label: "Ana" },
      { id: "character:children:child-007", label: "Gabriel" },
      { id: "character:children:child-008", label: "Mariana R." },
      { id: "character:children:child-009", label: "João P." },
      { id: "character:children:child-010", label: "Isabela" },
      { id: "character:children:child-011", label: "Rafael" },
      { id: "character:children:child-012", label: "Mariana F." },
      { id: "character:children:child-013", label: "Camille" },
      { id: "character:children:child-014", label: "Matteo" },
      { id: "character:children:child-015", label: "Charlotte" },
    ],
  },
  {
    key: "expressions", label: "Expressões", planned: 1200,
    note: "15 expressões × cada personagem",
    samples: EXPR.map(([e, l]) => ({ id: `expression:children:child-001:${e}`, label: l })),
  },
  {
    key: "poses", label: "Poses", planned: 1360,
    note: "17 poses × cada personagem",
    samples: POSE.map(([p, l]) => ({ id: `pose:children:child-001:${p}`, label: l })),
  },
  {
    key: "objects", label: "Objetos", planned: 200,
    note: "Escola · Casa · Alimentação · Tecnologia · Brinquedos · Saúde · Esportes · Transporte · Escritório · Lazer",
    samples: [
      { id: "object:backpack", label: "Mochila" }, { id: "object:apple", label: "Maçã" },
      { id: "object:smartphone", label: "Celular" }, { id: "object:teddy-bear", label: "Urso" },
      { id: "object:stethoscope", label: "Estetoscópio" }, { id: "object:soccer-ball", label: "Bola" },
      { id: "object:book", label: "Livro" }, { id: "object:stapler", label: "Grampeador" },
    ],
  },
  {
    key: "environments", label: "Cenários", planned: 50,
    note: "Sem personagens",
    samples: [
      { id: "scene:classroom", label: "Sala de aula" }, { id: "scene:park", label: "Parque" },
      { id: "scene:hospital-room", label: "Hospital" }, { id: "scene:supermarket", label: "Supermercado" },
      { id: "scene:restaurant", label: "Restaurante" }, { id: "scene:street", label: "Rua" },
    ],
  },
  {
    key: "animals", label: "Animais", planned: 10,
    samples: [
      { id: "animal:dog", label: "Cachorro" }, { id: "animal:cat", label: "Gato" },
      { id: "animal:bird", label: "Pássaro" }, { id: "animal:rabbit", label: "Coelho" },
    ],
  },
  {
    key: "vehicles", label: "Veículos", planned: 10,
    samples: [
      { id: "vehicle:car", label: "Carro" }, { id: "vehicle:bus", label: "Ônibus" },
      { id: "vehicle:ambulance", label: "Ambulância" }, { id: "vehicle:fire-truck", label: "Bombeiros" },
    ],
  },
  {
    key: "icons", label: "Ícones", planned: 8,
    samples: [
      { id: "icon:heart", label: "Coração" }, { id: "icon:star", label: "Estrela" },
      { id: "icon:lightbulb", label: "Lâmpada" }, { id: "icon:question-mark", label: "Pergunta" },
      { id: "icon:attention-alert", label: "Atenção" }, { id: "icon:positive-check", label: "Positivo" },
      { id: "icon:negative-cross", label: "Negativo" }, { id: "icon:emotions-face", label: "Emoções" },
    ],
  },
];

export const TOTAL_PLANNED = LIBRARY_OVERVIEW.reduce((s, c) => s + c.planned, 0);

export const ART_DIRECTION_SUMMARY = [
  "Cartoon 2D premium, moderno",
  "Cores suaves, contornos uniformes",
  "Iluminação frontal, perspectiva neutra",
  "Diversidade e representatividade",
  "Sem texto e sem marca d'água",
  "Fundo transparente (móveis) · cenários opacos",
];

// Rótulo PT de cada expressão (para a tela de revisão).
export const EXPRESSION_LABELS: Record<string, string> = {
  neutral: "Neutro", happy: "Feliz", very_happy: "Muito feliz", sad: "Triste",
  crying: "Chorando", surprised: "Surpreso", thinking: "Pensativo", worried: "Preocupado",
  excited: "Animado", angry: "Bravo", afraid: "Assustado", embarrassed: "Envergonhado",
  proud: "Orgulhoso", confident: "Confiante", curious: "Curioso", confused: "Confuso",
  disgusted: "Enojado", tired: "Cansado", irritated: "Irritado", grumpy: "Emburrado",
};

// Elenco de personagens já prontos (base + expressões) — fonte da tela de revisão.
export const CHILDREN_ROSTER: { code: string; name: string; emotions: string[] }[] = [
  { code: "child-001", name: "Lucas Oliveira", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-002", name: "Sofia Martins", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-003", name: "Miguel Santos", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-004", name: "Lucas Tanaka", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "tired", "irritated"] },
  { code: "child-005", name: "Pedro Almeida", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-006", name: "Ana Beatriz Souza", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-007", name: "Gabriel Ferreira", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-008", name: "Mariana Ribeiro", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "grumpy"] },
  { code: "child-009", name: "João Pedro Lima", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "tired", "grumpy"] },
  { code: "child-010", name: "Isabela Costa", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "irritated"] },
  { code: "child-011", name: "Rafael Nascimento", emotions: ["very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "disgusted", "tired"] },
  { code: "child-013", name: "Camille Dubois", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "tired", "irritated"] },
  { code: "child-014", name: "Matteo Rossi", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "afraid", "embarrassed", "proud", "confused", "tired", "irritated"] },
  { code: "child-015", name: "Charlotte Bennett", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "angry", "afraid", "embarrassed", "proud", "confused", "tired", "irritated"] },
  { code: "child-016", name: "Henry Collins", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "proud", "tired", "curious"] },
  { code: "child-017", name: "Amara Johnson", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-018", name: "Sofia Rossi", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "proud", "tired", "curious"] },
  { code: "child-019", name: "Mateo Garcia", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-020", name: "Lina Schneider", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-021", name: "Erik Hansen", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-022", name: "Fiona Mackenzie", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-023", name: "Jake Miller", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-024", name: "Maitê Alves", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-025", name: "Théo Costa", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-026", name: "Alice Moreira", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-027", name: "Pedro Souza", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-028", name: "Lucía Ramírez", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
  { code: "child-029", name: "Camila Geller", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "proud", "tired", "curious"] },
  { code: "child-030", name: "Maria Eduarda Silva", emotions: ["neutral", "happy", "very_happy", "sad", "crying", "surprised", "thinking", "worried", "excited", "angry", "afraid", "embarrassed", "confident", "tired", "curious"] },
];
