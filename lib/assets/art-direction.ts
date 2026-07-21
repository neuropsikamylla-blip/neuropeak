// ─────────────────────────────────────────────────────────────────────────────
// Direção de Arte Oficial (etapa_04_assets/01_Direcao_de_Arte.md).
// Constantes + verificação leve de conformidade dos metadados. Não valida a
// imagem (não lemos pixels) — só o que os metadados declaram.
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICIAL_ART_DIRECTION = {
  style: "vector-semi-flat",   // ilustração digital vetorial semi-flat
  outlines: "uniform",         // contornos uniformes
  palette: "soft",             // paleta suave
  lighting: "frontal",         // iluminação frontal
  perspective: "neutral",      // perspectiva neutra
  diversity: true,             // diversidade
  movableTransparent: true,    // fundo transparente para assets móveis
} as const;

export type ArtDirection = typeof OFFICIAL_ART_DIRECTION;

/** Kinds considerados "móveis" (devem ter fundo transparente). Cenários NÃO. */
export const MOVABLE_KINDS = new Set(["character", "expression", "pose", "object", "animal", "vehicle", "decor", "icon"]);

export const DEFAULT_TRANSPARENT: Record<string, boolean> = {
  character: true, object: true, animal: true, vehicle: true, decor: true, icon: true,
  scene: false,   // cenário é fundo → opaco por padrão
};

/**
 * Conformidade de fundo: assets móveis devem ser transparentes.
 * Devolve aviso (string) ou null. Usado pelo loader como validação branda.
 */
export function checkTransparency(kind: string, transparent: boolean | undefined): string | null {
  if (MOVABLE_KINDS.has(kind) && transparent === false) {
    return `asset móvel "${kind}" deveria ter fundo transparente (Direção de Arte)`;
  }
  return null;
}
