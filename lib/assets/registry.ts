// ─────────────────────────────────────────────────────────────────────────────
// Asset Registry — índice em memória por ID. O(1) no get; filtros por kind/faixa/tag.
// Estrutura pura (sem I/O). Alimentado por AssetRecord[] (do manifesto ou de um scan).
// ─────────────────────────────────────────────────────────────────────────────

import type { AgeGroup, AssetRecord, PrimaryAssetKind } from "./types";

export interface AssetFilter {
  kind?: PrimaryAssetKind;
  ageGroup?: AgeGroup;
  tag?: string;
}

export class AssetRegistry {
  private byId = new Map<string, AssetRecord>();

  constructor(records: AssetRecord[] = []) {
    for (const r of records) this.register(r);
  }

  /** Registra (ou substitui) um record. Ignora silenciosamente id duplicado já tratado no loader. */
  register(record: AssetRecord): void {
    this.byId.set(record.id, record);
  }

  get(id: string): AssetRecord | undefined {
    return this.byId.get(id);
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  size(): number {
    return this.byId.size;
  }

  all(): AssetRecord[] {
    return [...this.byId.values()];
  }

  list(filter: AssetFilter = {}): AssetRecord[] {
    return this.all().filter((r) => {
      if (filter.kind && r.kind !== filter.kind) return false;
      if (filter.ageGroup && r.ageGroup !== filter.ageGroup) return false;
      if (filter.tag && !r.tags.includes(filter.tag)) return false;
      return true;
    });
  }

  byKind(kind: PrimaryAssetKind): AssetRecord[] {
    return this.list({ kind });
  }

  byAgeGroup(ageGroup: AgeGroup): AssetRecord[] {
    return this.list({ ageGroup });
  }
}
