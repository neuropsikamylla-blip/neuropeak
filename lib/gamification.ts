// Reconciliação da gamificação com o servidor. Chamar no mount das telas que
// mostram o bichinho / a árvore de habilidades: restaura o progresso num aparelho
// novo (ou após limpar o navegador) e mantém o servidor atualizado (ARQ-002).

import { loadPet, savePet, type PetState } from "@/lib/pet";
import { loadSkills, saveSkills, type SkillLevels } from "@/lib/skilltree";
import { pullGamification, mergePet, mergeSkills } from "@/lib/gamification-sync";

/** Reconcilia o pet local com o servidor (merge nunca-perde-progresso) e persiste o vencedor. */
export async function reconcilePet(patientId: string, onMerged?: (p: PetState) => void): Promise<void> {
  const local = loadPet(patientId);
  const g = await pullGamification();
  if (!g) return;
  const merged = mergePet(local, g.petState);
  savePet(patientId, merged); // grava no localStorage e sobe pro servidor
  onMerged?.(merged);
}

/** Reconcilia a árvore de habilidades local com o servidor e persiste o vencedor. */
export async function reconcileSkills(patientId: string, onMerged?: (s: SkillLevels) => void): Promise<void> {
  const local = loadSkills(patientId);
  const g = await pullGamification();
  if (!g) return;
  const merged = mergeSkills(local, g.skillState);
  saveSkills(patientId, merged);
  onMerged?.(merged);
}
