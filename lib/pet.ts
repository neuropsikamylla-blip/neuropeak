// ── Bichinho que cresce ──────────────────────────────────────────────────────
// Prêmio de fim de sessão para os temas infantis (Colorido/Gamificado).
// A criança escolhe um dragão ou um monstrinho; cada treino concluído dá um
// ponto de "carinho" e, a cada SESSIONS_PER_STAGE treinos, o bichinho evolui:
// ovo → filhote → jovem → adulto. Estado guardado no localStorage por paciente.

export type PetKind = "dragao" | "monstrinho";
export type AccessoryId = "coroa" | "chapeu" | "laco" | "oculos";

export interface PetState {
  kind: PetKind | null;       // null = ainda não escolhido
  care: number;               // total de pontos de carinho (treinos que alimentaram o bichinho)
  name?: string;              // nome dado pela criança
  accessory?: AccessoryId;    // acessório escolhido (só vale quando adulto)
}

export const SESSIONS_PER_STAGE = 3;            // treinos por evolução
export const MAX_STAGE = 3;                     // 0 ovo · 1 filhote · 2 jovem · 3 adulto
export const STAGE_LABELS = ["Ovo", "Filhote", "Jovem", "Adulto"] as const;
export const PET_NAMES: Record<PetKind, string> = { dragao: "Dragão", monstrinho: "Monstrinho" };

export const ACCESSORIES: { id: AccessoryId; label: string; emoji: string }[] = [
  { id: "coroa", label: "Coroa", emoji: "👑" },
  { id: "chapeu", label: "Chapéu", emoji: "🎉" },
  { id: "laco", label: "Laço", emoji: "🎀" },
  { id: "oculos", label: "Óculos", emoji: "🤓" },
];

export const SUGGESTED_NAMES: Record<PetKind, string[]> = {
  dragao: ["Faísca", "Flama", "Pipoca", "Brasa"],
  monstrinho: ["Pelúcia", "Fofo", "Roxinho", "Tonton"],
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
      };
    }
  } catch { /* ignore */ }
  return { kind: null, care: 0 };
}

export function savePet(patientId: string, state: PetState): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(storageKey(patientId), JSON.stringify(state)); } catch { /* ignore */ }
}

/** Dá +1 de carinho. Retorna o novo estado (não persiste — quem chama persiste). */
export function feedPet(state: PetState): PetState {
  return { ...state, care: state.care + 1 };
}
