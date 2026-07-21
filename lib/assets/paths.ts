// ─────────────────────────────────────────────────────────────────────────────
// Resolução de CAMINHOS públicos (layout FLAT de produção).
//   character  → /assets/characters/<group>/<code>.png
//   expression → /assets/expressions/<code>_<expr>.png
//   pose       → /assets/poses/<code>_<pose>.png
//   object     → /assets/objects/<slug>.png
//   scene      → /assets/environments/<slug>.png
//   animal     → /assets/animals/<slug>.png
//   vehicle    → /assets/vehicles/<slug>.png
//   icon       → /assets/icons/<slug>.png
//   decor      → /assets/decor/<slug>.png
//
// Tudo determinístico a partir do ID — sem I/O, sem manifesto. É o que permite
// "soltar a imagem no caminho convencional e já renderizar".
// ─────────────────────────────────────────────────────────────────────────────

import { AGE_GROUP_FOLDER, type PrimaryAssetKind } from "./types";
import type { ParsedAssetId } from "./ids";

export const ASSET_ROOT = "/assets";
export const DEFAULT_EXT = "png";

/** Pasta pública de cada tipo primário (kind → folder). */
export const KIND_FOLDER: Record<PrimaryAssetKind, string> = {
  character: "characters", object: "objects", scene: "environments",
  animal: "animals", vehicle: "vehicles", icon: "icons", decor: "decor",
};

/** Código de arquivo a partir do slug do id (child-001 → child_001). */
export function codeFromSlug(slug: string): string {
  return slug.replace(/-/g, "_");
}

/** Junta segmentos numa URL raiz-relativa limpa (preserva a barra inicial). */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((p, i) => (i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+|\/+$/g, "")))
    .filter((p) => p.length > 0)
    .join("/");
}

/** URL determinística de QUALQUER id, por convenção de caminho. */
export function deterministicUrl(p: ParsedAssetId): string {
  const ext = DEFAULT_EXT;
  switch (p.kind) {
    case "character": {
      const code = codeFromSlug(p.slug);
      return joinUrl(ASSET_ROOT, "characters", AGE_GROUP_FOLDER[p.ageGroup!], `${code}.${ext}`);
    }
    case "expression":
      return joinUrl(ASSET_ROOT, "expressions", `${codeFromSlug(p.slug)}_${p.variant}.${ext}`);
    case "pose":
      return joinUrl(ASSET_ROOT, "poses", `${codeFromSlug(p.slug)}_${p.variant}.${ext}`);
    default:
      return joinUrl(ASSET_ROOT, KIND_FOLDER[p.kind as PrimaryAssetKind], `${p.slug}.${ext}`);
  }
}

/** Pasta pública "dona" de um asset (para agrupamentos/inspeção). */
export function assetFolder(p: ParsedAssetId): string {
  if (p.kind === "character") return joinUrl(ASSET_ROOT, "characters", AGE_GROUP_FOLDER[p.ageGroup!]);
  if (p.kind === "expression") return joinUrl(ASSET_ROOT, "expressions");
  if (p.kind === "pose") return joinUrl(ASSET_ROOT, "poses");
  return joinUrl(ASSET_ROOT, KIND_FOLDER[p.kind as PrimaryAssetKind]);
}
