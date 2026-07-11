// ── Bichinho que cresce ──────────────────────────────────────────────────────
// Prêmio de fim de sessão para os temas infantis (Colorido/Gamificado).
// A criança escolhe um dragão ou um monstrinho; cada treino concluído dá um
// ponto de "carinho" e, a cada SESSIONS_PER_STAGE treinos, o bichinho evolui:
// ovo → filhote → jovem → adulto. Estado no localStorage (cache) + servidor (ARQ-002).

import { pushGamification } from "@/lib/gamification-sync";

export type PetKind = "dragao" | "monstrinho";
export type AccessoryId = "coroa" | "chapeu" | "laco" | "oculos";
export type PetColorId = "turquesa" | "azul" | "verde" | "laranja" | "rosa" | "roxo" | "vinho";

export interface PetState {
  kind: PetKind | null;       // null = ainda não escolhido
  care: number;               // total de pontos de carinho (treinos que alimentaram o bichinho)
  name?: string;              // nome dado pela criança
  accessory?: AccessoryId;    // acessório escolhido (só vale quando adulto)
  color?: PetColorId;         // cor escolhida pela criança
}

// Paletas vibrantes e alegres — servem para meninas e meninos (a criança escolhe).
export interface PetPalette { id: PetColorId; label: string; body: string; dark: string; belly: string; horn: string; cheek: string; }
export const PET_COLORS: PetPalette[] = [
  { id: "turquesa", label: "Turquesa", body: "#22d3ee", dark: "#0891b2", belly: "#cffafe", horn: "#fbbf24", cheek: "#fb7185" },
  { id: "azul",     label: "Azul",     body: "#38bdf8", dark: "#0284c7", belly: "#e0f2fe", horn: "#fbbf24", cheek: "#fb7185" },
  { id: "verde",    label: "Verde",    body: "#4ade80", dark: "#16a34a", belly: "#dcfce7", horn: "#fbbf24", cheek: "#fb7185" },
  { id: "laranja",  label: "Laranja",  body: "#fb923c", dark: "#ea580c", belly: "#ffedd5", horn: "#facc15", cheek: "#f472b6" },
  { id: "rosa",     label: "Rosa",     body: "#f472b6", dark: "#db2777", belly: "#fce7f3", horn: "#fbbf24", cheek: "#fb7185" },
  { id: "roxo",     label: "Roxo",     body: "#a78bfa", dark: "#7c3aed", belly: "#ede9fe", horn: "#fbbf24", cheek: "#fda4af" },
  { id: "vinho",    label: "Vinho",    body: "#9f1239", dark: "#6b1230", belly: "#f5e6c8", horn: "#fbbf24", cheek: "#fb7185" },
];
export const DEFAULT_COLOR: Record<PetKind, PetColorId> = { dragao: "verde", monstrinho: "roxo" };

// O dragão usa ARTE EM IMAGEM (poses) para poder "se mexer" (Tamagotchi).
// Cada cor tem seu conjunto: public/pet/dragao-<cor>-<pose>.png.
export type DragonPose =
  | "idle" | "piscar" | "comer" | "dormir" | "brincar" | "respirando" | "curioso"
  | "bocejando" | "voando" | "planando" | "batendoasas" | "fogo" | "dancando"
  | "rindo" | "acenando" | "travesseiro" | "feliz" | "fumaca" | "gargalhando"
  | "cantando" | "comfome" | "pensando" | "notas";

// Poses do monstrinho (arte em imagem, sem asas/fogo). Inclui quadros de
// animação: comer1..3, piscar1..2, pular1..3.
export type MonsterPose =
  | "idle" | "feliz" | "bocejando" | "fumaca" | "coracao" | "dormir" | "nascendo"
  | "comer1" | "comer2" | "comer3" | "piscar1" | "piscar2" | "pular1" | "pular2" | "pular3";

// Qualquer pose (dragão ou monstro) — usada pelo PetCreature.
export type PetPose = DragonPose | MonsterPose;

// Opções de cor por bichinho. Dragão: verde/vinho (arte pronta). Monstrinho:
// paleta vetorial (até virar imagem também).
export const DRAGON_COLORS: PetColorId[] = ["verde", "vinho"];
export const MONSTER_COLORS: PetColorId[] = ["roxo", "azul"];
export function colorsFor(kind: PetKind): PetColorId[] {
  return kind === "dragao" ? DRAGON_COLORS : MONSTER_COLORS;
}
export function petPalette(s: PetState): PetPalette {
  const id = s.color ?? (s.kind ? DEFAULT_COLOR[s.kind] : "turquesa");
  return PET_COLORS.find((c) => c.id === id) ?? PET_COLORS[0];
}
export function paletteById(id: PetColorId): PetPalette {
  return PET_COLORS.find((c) => c.id === id) ?? PET_COLORS[0];
}

export const SESSIONS_PER_STAGE = 3;            // treinos por evolução
export const MAX_STAGE = 3;                     // 0 ovo · 1 filhote · 2 jovem · 3 adulto
export const STAGE_LABELS = ["Ovo", "Filhote", "Jovem", "Adulto"] as const;
export const PET_NAMES: Record<PetKind, string> = { dragao: "Flama", monstrinho: "Bolinho" };
// Quantos treinos o ovo precisa para chocar (configurável — 1, 2, 3, 5...).
export const HATCH_TARGET = 3;

export const ACCESSORIES: { id: AccessoryId; label: string; emoji: string }[] = [
  { id: "coroa", label: "Coroa", emoji: "👑" },
  { id: "chapeu", label: "Chapéu", emoji: "🎉" },
  { id: "laco", label: "Laço", emoji: "🎀" },
  { id: "oculos", label: "Óculos", emoji: "🤓" },
];

export const SUGGESTED_NAMES: Record<PetKind, string[]> = {
  dragao: ["Flama", "Faísca", "Pipoca", "Brasa"],
  monstrinho: ["Bolinho", "Fofo", "Roxinho", "Tonton"],
};

/** Nome a exibir: o que a criança deu, ou o nome padrão do tipo. */
export function petDisplayName(s: PetState): string {
  const n = s.name?.trim();
  return n || (s.kind ? PET_NAMES[s.kind] : "");
}

/** Fase atual (0..MAX_STAGE) a partir do total de carinho. */
export function petStage(care: number): number {
  return Math.min(MAX_STAGE, Math.floor(care / SESSIONS_PER_STAGE));
}

/** Progresso (0..1) dentro da fase atual. No adulto fica cheio. */
export function careProgress(care: number): number {
  const stage = petStage(care);
  if (stage >= MAX_STAGE) return 1;
  const into = care - stage * SESSIONS_PER_STAGE;
  return into / SESSIONS_PER_STAGE;
}

/** Quantos treinos faltam para a próxima evolução (0 se já é adulto). */
export function sessionsToNextStage(care: number): number {
  const stage = petStage(care);
  if (stage >= MAX_STAGE) return 0;
  const into = care - stage * SESSIONS_PER_STAGE;
  return SESSIONS_PER_STAGE - into;
}

const storageKey = (patientId: string) => `np_pet_${patientId}`;

export function loadPet(patientId: string): PetState {
  if (typeof window === "undefined") return { kind: null, care: 0 };
  try {
    const raw = localStorage.getItem(storageKey(patientId));
    if (raw) {
      const p = JSON.parse(raw) as Partial<PetState>;
      return {
        kind: p.kind ?? null,
        care: typeof p.care === "number" ? p.care : 0,
        name: p.name,
        accessory: p.accessory,
        color: p.color,
      };
    }
  } catch { /* ignore */ }
  return { kind: null, care: 0 };
}

export function savePet(patientId: string, state: PetState): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(storageKey(patientId), JSON.stringify(state)); } catch { /* ignore */ }
  pushGamification({ petState: state }); // persiste também no servidor (ARQ-002)
}

/** Dá +1 de carinho. Retorna o novo estado (não persiste — quem chama persiste). */
export function feedPet(state: PetState): PetState {
  return { ...state, care: state.care + 1 };
}

// ── Interações estilo Tamagotchi (alimentar, brincar, dormir) ────────────────
// Cada treino concluído no dia libera INTERACTIONS_PER_SESSION interações. Assim
// o cuidado com o bichinho é RECOMPENSA por treinar, sem tirar o foco da terapia.
export const INTERACTIONS_PER_SESSION = 2;

export type PetAction = "fogo" | "voar" | "comer" | "piscar" | "dormir" | "alimentar" | "brincar" | "cocegas" | "show";
// Interações da jornada — o paciente clica e o dragão faz a animação.
// Liberadas por treino (recompensa). "Dormir" é tratado à parte (bota pra dormir
// até o próximo treino).
export const PET_ACTIONS: { id: PetAction; label: string; emoji: string }[] = [
  { id: "fogo", label: "Soltar fogo", emoji: "🔥" },
  { id: "voar", label: "Voar", emoji: "🦋" },
  { id: "comer", label: "Comer", emoji: "🍎" },
  { id: "piscar", label: "Piscar", emoji: "😉" },
];
export const FREE_ACTIONS: { id: PetAction; label: string; emoji: string; minStage: number }[] = [];

// ── Sono: o dragão dorme até o próximo treino ────────────────────────────────
const sleepKey = (patientId: string) => `np_pet_sleep_${patientId}`;
export type SleepState = "awake" | "sleeping" | "waking";
/** Estado de sono: dormindo, acordando (treinou de novo) ou acordado. */
export function petSleepState(patientId: string, care: number): SleepState {
  if (typeof window === "undefined") return "awake";
  try {
    const raw = localStorage.getItem(sleepKey(patientId));
    if (!raw) return "awake";
    const d = JSON.parse(raw) as { sleeping?: boolean; atCare?: number };
    if (!d.sleeping) return "awake";
    return care > (d.atCare ?? care) ? "waking" : "sleeping";
  } catch { return "awake"; }
}
export function putPetToSleep(patientId: string, care: number): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(sleepKey(patientId), JSON.stringify({ sleeping: true, atCare: care })); } catch { /* */ }
}
export function clearPetSleep(patientId: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(sleepKey(patientId)); } catch { /* */ }
}
/** Está dormindo? (independente de treinos — acordar é manual, por botão). */
export function isPetSleeping(patientId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(sleepKey(patientId));
    return raw ? !!(JSON.parse(raw) as { sleeping?: boolean }).sleeping : false;
  } catch { return false; }
}

const tokKey = (patientId: string) => `np_pet_tok_${patientId}`;
const todayStr = () => new Date().toLocaleDateString("sv");

/** Interações já usadas hoje (reseta a cada dia). */
export function usedInteractionsToday(patientId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(tokKey(patientId));
    if (raw) { const d = JSON.parse(raw) as { date: string; used: number }; if (d.date === todayStr()) return d.used ?? 0; }
  } catch { /* ignore */ }
  return 0;
}

/** Registra o uso de uma interação hoje. */
export function spendInteraction(patientId: string): void {
  if (typeof window === "undefined") return;
  const used = usedInteractionsToday(patientId) + 1;
  try { localStorage.setItem(tokKey(patientId), JSON.stringify({ date: todayStr(), used })); } catch { /* ignore */ }
}

/** Interações disponíveis hoje = (treinos de hoje × por sessão) − usadas. */
export function interactionsAvailable(patientId: string, sessionsToday: number): number {
  return Math.max(0, sessionsToday * INTERACTIONS_PER_SESSION - usedInteractionsToday(patientId));
}
