// ─────────────────────────────────────────────────────────────────────────────
// Utilitário de IDs de asset — namespaceados, legíveis e determinísticos.
//
// Convenção (separador ":"):
//   character : <ageGroup> : <slug>                → character:children:bento-01
//   expression: <ageGroup> : <charSlug> : <var>    → expression:children:bento-01:alegria
//   pose      : <ageGroup> : <charSlug> : <var>    → pose:children:bento-01:sentado
//   object    : <slug>                             → object:mochila-azul
//   scene     : <slug>                             → scene:sala-de-aula
//   decor     : <slug>                             → decor:nuvem
//   icon      : <slug>                             → icon:lupa
//
// A partir do ID conseguimos derivar a pasta pública SEM ler disco (ver paths.ts) —
// é isso que torna a biblioteca escalável a milhares de assets.
// ─────────────────────────────────────────────────────────────────────────────

import { AGE_GROUPS, ASSET_KINDS, type AgeGroup, type AssetKind } from "./types";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export interface ParsedAssetId {
  raw: string;
  kind: AssetKind;
  slug: string;              // slug do asset (personagem ou simples)
  ageGroup?: AgeGroup;       // character | expression | pose
  variant?: string;          // expression | pose
  characterId?: string;      // expression | pose → id do personagem dono
}

const AGE_SET = new Set<string>(AGE_GROUPS);
const KIND_SET = new Set<string>(ASSET_KINDS);

function isSlug(s: string): boolean {
  return SLUG_RE.test(s);
}

/** Faz o parse de um ID. Devolve null se malformado. */
export function parseAssetId(raw: string): ParsedAssetId | null {
  if (typeof raw !== "string" || !raw) return null;
  const parts = raw.split(":");
  const kind = parts[0] as AssetKind;
  if (!KIND_SET.has(kind)) return null;

  switch (kind) {
    case "character": {
      const [, ageGroup, slug] = parts;
      if (parts.length !== 3 || !AGE_SET.has(ageGroup) || !isSlug(slug)) return null;
      return { raw, kind, ageGroup: ageGroup as AgeGroup, slug };
    }
    case "expression":
    case "pose": {
      const [, ageGroup, slug, variant] = parts;
      if (parts.length !== 4 || !AGE_SET.has(ageGroup) || !isSlug(slug) || !isSlug(variant)) return null;
      return {
        raw, kind, ageGroup: ageGroup as AgeGroup, slug, variant,
        characterId: `character:${ageGroup}:${slug}`,
      };
    }
    default: {
      // object | scene | decor | icon
      const [, slug] = parts;
      if (parts.length !== 2 || !isSlug(slug)) return null;
      return { raw, kind, slug };
    }
  }
}

export function isAssetId(raw: string): boolean {
  return parseAssetId(raw) !== null;
}

export function assetIdKind(raw: string): AssetKind | null {
  return parseAssetId(raw)?.kind ?? null;
}

// ── Construtores ──────────────────────────────────────────────────────────────
export function buildCharacterId(ageGroup: AgeGroup, slug: string): string {
  return `character:${ageGroup}:${slug}`;
}
export function buildExpressionId(ageGroup: AgeGroup, slug: string, variant: string): string {
  return `expression:${ageGroup}:${slug}:${variant}`;
}
export function buildPoseId(ageGroup: AgeGroup, slug: string, variant: string): string {
  return `pose:${ageGroup}:${slug}:${variant}`;
}
export function buildSimpleId(kind: "object" | "scene" | "animal" | "vehicle" | "icon" | "decor", slug: string): string {
  return `${kind}:${slug}`;
}

/** Deriva o id do personagem dono de uma expressão/pose. */
export function ownerCharacterId(raw: string): string | null {
  const p = parseAssetId(raw);
  return p?.characterId ?? null;
}
