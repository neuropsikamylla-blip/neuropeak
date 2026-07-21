// ─────────────────────────────────────────────────────────────────────────────
// Biblioteca de Assets — MODELOS (Etapa 4). Alinhados ao layout FLAT produzido pelo
// pipeline de geração (scripts/assets-gen):
//   characters/<group>/<code>.png · expressions/<code>_<expr>.png ·
//   poses/<code>_<pose>.png · objects|environments|animals|vehicles|icons/<slug>.png
//
// URLs saem por CONVENÇÃO direto do ID (ver paths.ts) — o metadata só enriquece
// (título, atributos, quais variantes existem). Nada aqui lê disco nem usa React.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tipos de asset (Visão Geral + layout de produção) ─────────────────────────
export type AssetKind =
  | "character" | "expression" | "pose"
  | "object" | "scene" | "animal" | "vehicle" | "icon" | "decor";

export const ASSET_KINDS: AssetKind[] = [
  "character", "expression", "pose", "object", "scene", "animal", "vehicle", "icon", "decor",
];

/** Kinds que são um asset "primário" indexável (têm entrada própria no manifesto). */
export type PrimaryAssetKind = "character" | "object" | "scene" | "animal" | "vehicle" | "icon" | "decor";
export const PRIMARY_ASSET_KINDS: PrimaryAssetKind[] = ["character", "object", "scene", "animal", "vehicle", "icon", "decor"];

/** Expressões e poses são VARIANTES de um personagem, não assets primários. */
export type VariantAssetKind = "expression" | "pose";

// ── Faixas de personagem ──────────────────────────────────────────────────────
export type AgeGroup = "children" | "teenagers" | "adults" | "olderAdults";
export const AGE_GROUPS: AgeGroup[] = ["children", "teenagers", "adults", "olderAdults"];

/** Nome da pasta pública de cada faixa (layout flat de produção). */
export const AGE_GROUP_FOLDER: Record<AgeGroup, string> = {
  children: "children", teenagers: "teens", adults: "adults", olderAdults: "elders",
};
export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  children: "Crianças", teenagers: "Adolescentes", adults: "Adultos", olderAdults: "Idosos",
};

// Ponte com as faixas do módulo social (lib/social) SEM acoplar os módulos.
export type SocialFaixa = "crianca" | "adolescente" | "adulto";
export const AGE_GROUP_TO_FAIXA: Record<AgeGroup, SocialFaixa> = {
  children: "crianca", teenagers: "adolescente", adults: "adulto", olderAdults: "adulto",
};

// ── Variante (uma expressão/pose/variação nomeada) ────────────────────────────
// A URL é derivada do ID por convenção; a variante só carrega id + rótulo.
export interface AssetVariant {
  id: string;        // ex.: "happy", "standing", "default"
  label?: string;    // rótulo pt-BR opcional
}

// ── Rastreabilidade de autoria ────────────────────────────────────────────────
export interface AssetAuthoring {
  generatedByAI?: boolean;
  reviewedBy?: string;
  approvedAt?: string;   // ISO date
  version?: number;
}

// ── Atributos neutros de personagem (diversidade; NUNCA diagnósticos) ─────────
export interface CharacterAttributes {
  skinTone?: string;
  hairColor?: string;
  hairStyle?: string;
  glasses?: boolean;
  genderPresentation?: string;
  wheelchair?: boolean;
  [key: string]: unknown;
}

// ── Metadata (conteúdo do índice de cada asset) ───────────────────────────────
export interface AssetMetadataBase {
  id: string;
  title: string;
  tags?: string[];
  transparentBackground?: boolean;
  authoring?: AssetAuthoring;
}

export interface CharacterMetadata extends AssetMetadataBase {
  kind: "character";
  ageGroup: AgeGroup;
  attributes?: CharacterAttributes;
  expressions: AssetVariant[];   // quais expressões existem
  poses: AssetVariant[];         // quais poses existem
}

export interface SimpleAssetMetadata extends AssetMetadataBase {
  kind: "object" | "scene" | "animal" | "vehicle" | "icon" | "decor";
  category?: string;
  variants?: AssetVariant[];     // opcional (default = arquivo único)
}

export type AssetMetadata = CharacterMetadata | SimpleAssetMetadata;

// ── Manifesto (índice agregado) ───────────────────────────────────────────────
export interface AssetManifest {
  version: number;
  generatedAt?: string | null;
  assets: AssetMetadata[];
}

// ── Record indexado no Registry ───────────────────────────────────────────────
export interface AssetRecord {
  id: string;
  kind: PrimaryAssetKind;
  title: string;
  ageGroup?: AgeGroup;           // só personagens
  tags: string[];
  transparentBackground: boolean;
  metadata: AssetMetadata;
}

// ── Modelos "prontos para uso" devolvidos pelo Service (URLs resolvidas) ──────
export interface ResolvedVariant {
  id: string;
  label?: string;
  url: string;
}

export interface CharacterAsset {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  faixa: SocialFaixa;
  baseUrl: string;
  thumbnailUrl?: string;
  expressions: ResolvedVariant[];
  poses: ResolvedVariant[];
  attributes?: CharacterAttributes;
  tags: string[];
  transparentBackground: boolean;
}

export interface SimpleAsset {
  id: string;
  kind: SimpleAssetMetadata["kind"];
  title: string;
  category?: string;
  url: string;
  variants: ResolvedVariant[];
  tags: string[];
  transparentBackground: boolean;
}
