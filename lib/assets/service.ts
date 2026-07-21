// ─────────────────────────────────────────────────────────────────────────────
// AssetService — fachada de alto nível. No layout flat, TODA URL é determinística
// a partir do ID; o metadata (via repositório) fornece título, atributos e a lista
// de variantes existentes. Funciona mesmo com o índice vazio (resolveUrl por convenção).
// ─────────────────────────────────────────────────────────────────────────────

import {
  AGE_GROUP_TO_FAIXA,
  type AgeGroup, type AssetRecord, type CharacterAsset, type CharacterMetadata,
  type ResolvedVariant, type SimpleAsset, type SimpleAssetMetadata, type SocialFaixa,
} from "./types";
import { buildExpressionId, buildPoseId, parseAssetId } from "./ids";
import { deterministicUrl } from "./paths";
import type { AssetRepository } from "./repository";
import type { AssetFilter } from "./registry";

function urlForId(id: string): string | null {
  const p = parseAssetId(id);
  return p ? deterministicUrl(p) : null;
}

export class AssetService {
  constructor(private readonly repo: AssetRepository) {}

  has(id: string): boolean {
    return this.repo.has(id);
  }

  /** URL de QUALQUER id (personagem, expressão, pose, objeto, cenário…). null se malformado. */
  resolveUrl(id: string): string | null {
    return urlForId(id);
  }

  // ── Personagens ────────────────────────────────────────────────────────────
  getCharacter(id: string): CharacterAsset | null {
    const rec = this.repo.get(id);
    if (!rec || rec.metadata.kind !== "character") return null;
    return this.toCharacterAsset(rec.metadata);
  }

  listCharacters(filter: Omit<AssetFilter, "kind"> = {}): CharacterAsset[] {
    return this.repo.query({ ...filter, kind: "character" })
      .map((r) => this.toCharacterAsset(r.metadata as CharacterMetadata));
  }

  listCharactersByFaixa(faixa: SocialFaixa): CharacterAsset[] {
    const groups = (Object.keys(AGE_GROUP_TO_FAIXA) as AgeGroup[]).filter((g) => AGE_GROUP_TO_FAIXA[g] === faixa);
    return this.listCharacters().filter((c) => groups.includes(c.ageGroup));
  }

  getExpressionUrl(characterId: string, expressionId: string): string | null {
    const p = parseAssetId(characterId);
    if (!p || p.kind !== "character") return null;
    return urlForId(buildExpressionId(p.ageGroup!, p.slug, expressionId));
  }

  getPoseUrl(characterId: string, poseId: string): string | null {
    const p = parseAssetId(characterId);
    if (!p || p.kind !== "character") return null;
    return urlForId(buildPoseId(p.ageGroup!, p.slug, poseId));
  }

  private toCharacterAsset(meta: CharacterMetadata): CharacterAsset {
    const p = parseAssetId(meta.id)!;
    const resolve = (kind: "expression" | "pose", v: { id: string; label?: string }): ResolvedVariant => ({
      id: v.id, label: v.label,
      url: urlForId(kind === "expression" ? buildExpressionId(p.ageGroup!, p.slug, v.id) : buildPoseId(p.ageGroup!, p.slug, v.id))!,
    });
    return {
      id: meta.id,
      name: meta.title,
      ageGroup: meta.ageGroup,
      faixa: AGE_GROUP_TO_FAIXA[meta.ageGroup],
      baseUrl: deterministicUrl(p),
      expressions: meta.expressions.map((v) => resolve("expression", v)),
      poses: meta.poses.map((v) => resolve("pose", v)),
      attributes: meta.attributes,
      tags: meta.tags ?? [],
      transparentBackground: meta.transparentBackground ?? true,
    };
  }

  // ── Assets simples (objeto/cenário/animal/veículo/ícone/decor) ───────────────
  getSimpleAsset(id: string): SimpleAsset | null {
    const rec = this.repo.get(id);
    if (!rec || rec.metadata.kind === "character") return null;
    const meta = rec.metadata as SimpleAssetMetadata;
    const url = urlForId(meta.id)!;
    const variants: ResolvedVariant[] = (meta.variants ?? [{ id: "default" }]).map((v) => ({
      id: v.id, label: v.label, url,
    }));
    return {
      id: meta.id, kind: meta.kind, title: meta.title, category: meta.category,
      url, variants, tags: rec.tags, transparentBackground: rec.transparentBackground,
    };
  }

  getObject(id: string): SimpleAsset | null { return this.pick(id, "object"); }
  getScene(id: string): SimpleAsset | null { return this.pick(id, "scene"); }
  getAnimal(id: string): SimpleAsset | null { return this.pick(id, "animal"); }
  getVehicle(id: string): SimpleAsset | null { return this.pick(id, "vehicle"); }
  getIcon(id: string): SimpleAsset | null { return this.pick(id, "icon"); }

  private pick(id: string, kind: SimpleAsset["kind"]): SimpleAsset | null {
    const a = this.getSimpleAsset(id);
    return a && a.kind === kind ? a : null;
  }

  /** Estatística de cobertura (para dashboards de conteúdo). */
  stats(): { total: number; byKind: Record<string, number> } {
    const byKind: Record<string, number> = {};
    for (const r of this.repo.all()) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
    return { total: this.repo.all().length, byKind };
  }
}

/** Fábrica: monta um Service a partir de um repositório. */
export function createAssetService(repo: AssetRepository): AssetService {
  return new AssetService(repo);
}
