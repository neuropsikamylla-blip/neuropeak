// Sincronização da gamificação (bichinho + árvore de habilidades) com o servidor.
// O localStorage continua sendo o cache rápido; aqui garantimos que o estado
// também vá para o banco (não se perde ao trocar de aparelho — ARQ-002).
// Sem import RUNTIME de pet.ts/skilltree.ts (só tipos) para evitar ciclos.

import type { PetState } from "@/lib/pet";
import type { SkillLevels } from "@/lib/skilltree";

const BASE = "/api/gamification";

/** Envia o estado ao servidor (fire-and-forget; falha de rede não atrapalha o jogo). */
export function pushGamification(patch: { petState?: unknown; skillState?: unknown }): void {
  if (typeof window === "undefined") return;
  try {
    fetch(BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}

/** Busca o estado salvo no servidor (null em erro/ausência). */
export async function pullGamification(): Promise<{ petState: PetState | null; skillState: SkillLevels | null } | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(BASE);
    if (!res.ok) return null;
    const data = await res.json();
    return { petState: (data?.petState ?? null) as PetState | null, skillState: (data?.skillState ?? null) as SkillLevels | null };
  } catch { return null; }
}

/** Merge "nunca perde progresso": vence o pet com mais carinho; empate mantém o que tem bichinho escolhido. */
export function mergePet(local: PetState, server: PetState | null): PetState {
  if (!server) return local;
  const lc = local.care ?? 0;
  const sc = server.care ?? 0;
  if (sc > lc) return server;
  if (lc > sc) return local;
  return local.kind ? local : (server.kind ? server : local);
}

/** Merge das habilidades: vence quem tem mais pontos investidos no total. */
export function mergeSkills(local: SkillLevels, server: SkillLevels | null): SkillLevels {
  if (!server) return local;
  const sum = (s: SkillLevels) => Object.values(s).reduce((a, b) => a + (b ?? 0), 0);
  return sum(server) > sum(local) ? server : local;
}
