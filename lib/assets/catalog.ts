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
    note: "15 crianças prontas (adolescentes / adultos / idosos a fazer)",
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
