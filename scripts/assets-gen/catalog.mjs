// ─────────────────────────────────────────────────────────────────────────────
// Catálogo — a FONTE DA VERDADE do que produzir. Enumera cada asset (personagens
// com diversidade, expressões, poses, objetos, cenários, animais, veículos, ícones)
// como entradas { kind, relPath, id, subject, ... }. Nenhuma imagem aqui — só o plano.
// ─────────────────────────────────────────────────────────────────────────────

import { LAYOUT } from "./config.mjs";

// ── Listas fixas (spec) ───────────────────────────────────────────────────────
export const EXPRESSIONS = [
  ["neutral", "neutral, calm"], ["happy", "happy, smiling"], ["very_happy", "very happy, big joyful smile"],
  ["sad", "sad"], ["crying", "crying with tears"], ["angry", "angry, frowning"],
  ["surprised", "surprised"], ["worried", "worried, anxious"], ["afraid", "afraid, scared"],
  ["confused", "confused, puzzled"], ["thinking", "thinking, thoughtful"], ["embarrassed", "embarrassed, blushing"],
  ["proud", "proud, confident"], ["disgusted", "disgusted"], ["tired", "tired, sleepy"],
];

export const POSES = [
  ["standing", "standing"], ["walking", "walking"], ["running", "running"], ["sitting", "sitting on a chair"],
  ["reading", "reading a book"], ["writing", "writing"], ["pointing_left", "pointing to the left"],
  ["pointing_right", "pointing to the right"], ["raising_hand", "raising one hand"], ["crossed_arms", "arms crossed"],
  ["hands_on_hips", "hands on hips"], ["holding_object", "holding an object"], ["talking", "talking"],
  ["listening", "listening attentively"], ["jumping", "jumping"], ["using_phone", "using a smartphone"],
  ["waving", "waving hello"],
];

// group de saída ↔ faixa do app (lib/social) e prefixo de código.
export const CHARACTER_GROUPS = [
  { group: "children", ageGroup: "children", prefix: "child", count: 30, age: "child (6-11 years old)" },
  { group: "teens", ageGroup: "teenagers", prefix: "teen", count: 20, age: "teenager (12-17 years old)" },
  { group: "adults", ageGroup: "adults", prefix: "adult", count: 20, age: "adult (25-45 years old)" },
  { group: "elders", ageGroup: "olderAdults", prefix: "elder", count: 10, age: "older adult (65+ years old)" },
];

// Pools de diversidade (rotacionados por índice → conjunto representativo).
const SEX = ["girl/woman", "boy/man"];
const SKIN = ["light skin", "medium skin", "tan skin", "dark brown skin", "black skin"];
const HAIR = ["short straight hair", "curly hair", "long wavy hair", "braided hair", "afro hair", "bald", "hair in a bun"];
const HAIR_COLOR = ["black", "brown", "blonde", "red", "gray"];
// Traços inclusivos: injetados em índices fixos para GARANTIR representação.
const INCLUSIVE = {
  3: "wearing eyeglasses",
  6: "using a wheelchair",
  9: "wearing a hearing aid",
  12: "with Down syndrome features (respectful, natural)",
  15: "with a white cane (visual impairment)",
  18: "with an arm prosthesis",
  21: "wearing eyeglasses",
  24: "using a wheelchair",
  27: "with a leg prosthesis",
};

function characterSubject(g, idx) {
  const sex = SEX[idx % SEX.length];
  const skin = SKIN[idx % SKIN.length];
  const hair = `${HAIR_COLOR[idx % HAIR_COLOR.length]} ${HAIR[idx % HAIR.length]}`;
  const extra = INCLUSIVE[idx] ? `, ${INCLUSIVE[idx]}` : "";
  return `a ${g.age} ${sex}, ${skin}, ${hair}, casual everyday clothes${extra}`;
}

// ── Objetos (~200) por categoria ──────────────────────────────────────────────
const OBJECTS = {
  Escola: ["backpack", "pencil", "pen", "eraser", "notebook", "textbook", "ruler", "scissors", "glue-stick", "crayons", "paintbrush", "chalkboard", "globe", "lunchbox", "school-bell", "calculator", "sharpener", "colored-pencils", "folder", "school-desk"],
  Casa: ["chair", "table", "bed", "sofa", "lamp", "clock", "door", "window", "mirror", "broom", "trash-can", "key", "towel", "pillow", "blanket", "picture-frame", "plant-pot", "bookshelf", "rug", "curtain"],
  Alimentacao: ["apple", "banana", "bread", "milk-carton", "water-bottle", "sandwich", "pizza-slice", "carrot", "cookie", "juice-box", "plate", "fork", "spoon", "cup", "egg", "cheese", "grapes", "rice-bowl", "chicken-leg", "cereal-box"],
  Tecnologia: ["smartphone", "laptop", "tablet", "headphones", "television", "camera", "keyboard", "computer-mouse", "usb-drive", "router", "smartwatch", "game-controller", "printer", "microphone", "power-plug", "battery", "speaker", "webcam", "remote-control", "charger"],
  Brinquedos: ["teddy-bear", "toy-ball", "building-blocks", "doll", "toy-car", "kite", "spinning-top", "puzzle-piece", "jump-rope", "toy-robot", "yo-yo", "marbles", "board-game", "stuffed-rabbit", "toy-train", "balloon", "bubble-wand", "rocking-horse", "toy-drum", "toy-airplane"],
  Saude: ["stethoscope", "thermometer", "bandage", "medicine-bottle", "syringe", "first-aid-kit", "wheelchair", "crutches", "toothbrush", "toothpaste", "soap", "mask", "pill", "eye-glasses", "hearing-aid", "cast", "blood-pressure-cuff", "hand-sanitizer", "tissue-box", "band-aid"],
  Esportes: ["soccer-ball", "basketball", "tennis-racket", "baseball-bat", "skateboard", "bicycle-helmet", "whistle", "medal", "trophy", "jump-rope", "swimming-goggles", "dumbbell", "volleyball", "ping-pong-paddle", "running-shoes", "stopwatch", "hula-hoop", "frisbee", "boxing-glove", "yoga-mat"],
  Transporte: ["traffic-light", "road-sign", "bus-stop-sign", "steering-wheel", "gas-pump", "map", "suitcase", "ticket", "helmet", "seatbelt", "tire", "compass", "backpack-travel", "boarding-pass", "parking-meter", "life-jacket", "umbrella", "raincoat", "bus-card", "roadblock-cone"],
  Escritorio: ["stapler", "paper-clip", "sticky-notes", "envelope", "folder-file", "briefcase", "desk-lamp", "coffee-mug", "calendar", "clipboard", "hole-punch", "tape-dispenser", "highlighter", "binder", "whiteboard", "marker", "phone-desk", "id-badge", "cash-register", "receipt"],
  Lazer: ["book", "guitar", "paint-palette", "camera-photo", "picnic-basket", "beach-ball", "sunglasses", "playing-cards", "chess-piece", "movie-ticket", "popcorn-box", "headphones-music", "fishing-rod", "tent", "flashlight", "board-puzzle", "ice-cream-cone", "kite-lazer", "sand-bucket", "music-note"],
};

// ── Cenários (~50) — SEM personagens ──────────────────────────────────────────
const ENVIRONMENTS = [
  "classroom", "school-library", "school-hallway", "schoolyard", "playground", "park",
  "house-exterior", "living-room", "bedroom", "kitchen", "bathroom", "dining-room",
  "hospital-room", "clinic-office", "waiting-room", "pharmacy", "dentist-office",
  "supermarket", "shopping-mall", "clothing-store", "restaurant", "bakery", "cafe", "ice-cream-shop",
  "bus-interior", "bus-stop", "street", "town-square", "crosswalk", "subway-station",
  "office", "meeting-room", "reception-desk", "gym", "swimming-pool", "sports-court",
  "beach", "farm", "zoo", "museum", "movie-theater", "birthday-party-room",
  "garden", "backyard", "elevator", "building-lobby", "market-street", "church-interior",
  "campsite", "aquarium",
];

const ANIMALS = ["dog", "cat", "bird", "fish", "rabbit", "hamster", "horse", "cow", "chicken", "duck"];
const VEHICLES = ["car", "bus", "school-bus", "ambulance", "police-car", "fire-truck", "bicycle", "motorcycle", "train", "airplane"];
const ICONS = ["emotions-face", "heart", "star", "lightbulb", "question-mark", "attention-alert", "positive-check", "negative-cross"];

// ── Montagem do catálogo ──────────────────────────────────────────────────────
function slugToTitle(slug) {
  return slug.replace(/-/g, " ");
}

export function buildCatalog() {
  const characters = [];
  const expressions = [];
  const poses = [];

  for (const g of CHARACTER_GROUPS) {
    for (let i = 1; i <= g.count; i++) {
      const idx = i - 1;
      const code = `${g.prefix}_${String(i).padStart(3, "0")}`;   // child_001
      const slug = `${g.prefix}-${String(i).padStart(3, "0")}`;   // child-001 (id do app)
      const subject = characterSubject(g, idx);
      const charId = `character:${g.ageGroup}:${slug}`;

      characters.push({
        kind: "character", group: g.group, ageGroup: g.ageGroup, code, slug, id: charId,
        subject, transparent: true, relPath: LAYOUT.characterBase(g.group, code),
      });
      for (const [expr, exprLabel] of EXPRESSIONS) {
        expressions.push({
          kind: "expression", group: g.group, ageGroup: g.ageGroup, code, slug,
          expr, exprLabel, subject, transparent: true,
          id: `expression:${g.ageGroup}:${slug}:${expr}`, relPath: LAYOUT.expression(code, expr),
        });
      }
      for (const [pose, poseLabel] of POSES) {
        poses.push({
          kind: "pose", group: g.group, ageGroup: g.ageGroup, code, slug,
          pose, poseLabel, subject, transparent: true,
          id: `pose:${g.ageGroup}:${slug}:${pose}`, relPath: LAYOUT.pose(code, pose),
        });
      }
    }
  }

  const objects = [];
  for (const [category, list] of Object.entries(OBJECTS)) {
    for (const slug of list) {
      objects.push({
        kind: "object", category, slug, subject: slugToTitle(slug), transparent: true,
        id: `object:${slug}`, relPath: LAYOUT.object(slug),
      });
    }
  }

  const environments = ENVIRONMENTS.map((slug) => ({
    kind: "environment", slug, subject: slugToTitle(slug), transparent: false,
    id: `scene:${slug}`, relPath: LAYOUT.environment(slug),
  }));
  const animals = ANIMALS.map((slug) => ({
    kind: "animal", slug, subject: slugToTitle(slug), transparent: true,
    id: `animal:${slug}`, relPath: LAYOUT.animal(slug),
  }));
  const vehicles = VEHICLES.map((slug) => ({
    kind: "vehicle", slug, subject: slugToTitle(slug), transparent: true,
    id: `vehicle:${slug}`, relPath: LAYOUT.vehicle(slug),
  }));
  const icons = ICONS.map((slug) => ({
    kind: "icon", slug, subject: slugToTitle(slug), transparent: true,
    id: `icon:${slug}`, relPath: LAYOUT.icon(slug),
  }));

  const all = [...characters, ...expressions, ...poses, ...objects, ...environments, ...animals, ...vehicles, ...icons];
  // key único = caminho relativo sem extensão (usado no ledger de retomada).
  for (const e of all) e.key = e.relPath.replace(/\.png$/, "");
  return { characters, expressions, poses, objects, environments, animals, vehicles, icons, all };
}

export function catalogSummary(cat) {
  return {
    characters: cat.characters.length,
    expressions: cat.expressions.length,
    poses: cat.poses.length,
    objects: cat.objects.length,
    environments: cat.environments.length,
    animals: cat.animals.length,
    vehicles: cat.vehicles.length,
    icons: cat.icons.length,
    total: cat.all.length,
  };
}
