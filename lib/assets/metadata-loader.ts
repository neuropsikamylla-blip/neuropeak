// ─────────────────────────────────────────────────────────────────────────────
// Metadata Loader — valida/normaliza o JSON de metadata (já parseado) em modelos
// tipados e agrega o manifesto em AssetRecord[]. PURO (sem fs, sem React).
//
// No layout flat, a URL sai por convenção do ID; o metadata declara apenas título,
// atributos e QUAIS variantes (expressões/poses) existem. A leitura física dos
// arquivos fica no build (scripts/build-asset-manifest.mjs).
// ─────────────────────────────────────────────────────────────────────────────

import {
  AGE_GROUPS, PRIMARY_ASSET_KINDS,
  type AgeGroup, type AssetManifest, type AssetMetadata, type AssetRecord,
  type AssetVariant, type CharacterMetadata, type SimpleAssetMetadata,
} from "./types";
import { parseAssetId } from "./ids";
import { checkTransparency, DEFAULT_TRANSPARENT } from "./art-direction";

const AGE_SET = new Set<string>(AGE_GROUPS);

function isRecordObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseVariants(raw: unknown, field: string, errors: string[]): AssetVariant[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) { errors.push(`${field}: esperado array de variantes`); return []; }
  const out: AssetVariant[] = [];
  raw.forEach((v, i) => {
    if (typeof v === "string") { out.push({ id: v }); return; }
    if (!isRecordObject(v) || typeof v.id !== "string") {
      errors.push(`${field}[${i}]: variante precisa de { id } (ou string)`);
      return;
    }
    out.push({ id: v.id, label: typeof v.label === "string" ? v.label : undefined });
  });
  return out;
}

/** Valida e normaliza UM objeto de metadata. */
export function parseAssetMetadata(raw: unknown): { metadata?: AssetMetadata; errors: string[] } {
  const errors: string[] = [];
  if (!isRecordObject(raw)) return { errors: ["metadata não é um objeto"] };

  const id = raw.id;
  const kind = raw.kind;
  const title = raw.title;
  if (typeof id !== "string" || !id) errors.push("metadata sem id");
  if (typeof kind !== "string" || !PRIMARY_ASSET_KINDS.includes(kind as never))
    errors.push(`kind inválido: ${String(kind)}`);
  if (typeof title !== "string" || !title) errors.push(`(${String(id)}): title vazio`);

  if (typeof id === "string") {
    const p = parseAssetId(id);
    if (!p) errors.push(`(${id}): id malformado`);
    else if (p.kind !== kind) errors.push(`(${id}): id não corresponde ao kind "${String(kind)}"`);
  }

  const tags = Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : undefined;
  const transparentBackground = typeof raw.transparentBackground === "boolean" ? raw.transparentBackground : undefined;
  const authoring = isRecordObject(raw.authoring) ? (raw.authoring as AssetMetadata["authoring"]) : undefined;
  const warn = checkTransparency(String(kind), transparentBackground);
  if (warn) errors.push(`(${String(id)}): ${warn}`);

  if (kind === "character") {
    const ageGroup = raw.ageGroup;
    if (typeof ageGroup !== "string" || !AGE_SET.has(ageGroup)) errors.push(`(${String(id)}): ageGroup inválido`);
    const expressions = parseVariants(raw.expressions, `(${String(id)}) expressions`, errors);
    const poses = parseVariants(raw.poses, `(${String(id)}) poses`, errors);
    if (errors.length) return { errors };
    const metadata: CharacterMetadata = {
      kind: "character", id: id as string, title: title as string, ageGroup: ageGroup as AgeGroup,
      expressions, poses,
      attributes: isRecordObject(raw.attributes) ? (raw.attributes as CharacterMetadata["attributes"]) : undefined,
      tags, transparentBackground, authoring,
    };
    return { metadata, errors };
  }

  // object | scene | animal | vehicle | icon | decor
  const variants = raw.variants !== undefined ? parseVariants(raw.variants, `(${String(id)}) variants`, errors) : undefined;
  if (errors.length) return { errors };
  const metadata: SimpleAssetMetadata = {
    kind: kind as SimpleAssetMetadata["kind"], id: id as string, title: title as string,
    category: typeof raw.category === "string" ? raw.category : undefined,
    variants, tags, transparentBackground, authoring,
  };
  return { metadata, errors };
}

/** Converte metadata validada em AssetRecord (entrada do Registry). */
export function metadataToRecord(meta: AssetMetadata): AssetRecord {
  const transparent = meta.transparentBackground ?? DEFAULT_TRANSPARENT[meta.kind] ?? true;
  return {
    id: meta.id,
    kind: meta.kind,
    title: meta.title,
    ageGroup: meta.kind === "character" ? meta.ageGroup : undefined,
    tags: meta.tags ?? [],
    transparentBackground: transparent,
    metadata: meta,
  };
}

/** Ingere um manifesto → AssetRecord[]; ignora inválidos e loga em dev. */
export function recordsFromManifest(manifest: AssetManifest): AssetRecord[] {
  const records: AssetRecord[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const raw of manifest.assets ?? []) {
    const { metadata, errors } = parseAssetMetadata(raw);
    if (errors.length || !metadata) { problems.push(...errors); continue; }
    if (seen.has(metadata.id)) { problems.push(`id de asset duplicado: ${metadata.id}`); continue; }
    seen.add(metadata.id);
    records.push(metadataToRecord(metadata));
  }

  if (problems.length && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[assets] ${problems.length} problema(s) no manifesto:\n` + problems.join("\n"));
  }
  return records;
}
