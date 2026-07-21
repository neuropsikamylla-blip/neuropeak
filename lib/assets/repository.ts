// ─────────────────────────────────────────────────────────────────────────────
// Asset Repository — abstrai a FONTE dos records. Hoje: em memória (manifesto
// empacotado). Amanhã, sem mudar quem consome: um repo remoto (fetch de um índice
// em CDN), um repo por scan de filesystem no build, etc. — basta implementar a
// interface. O Service depende da interface, não da fonte.
// ─────────────────────────────────────────────────────────────────────────────

import type { AssetRecord } from "./types";
import { AssetRegistry, type AssetFilter } from "./registry";

export interface AssetRepository {
  all(): AssetRecord[];
  get(id: string): AssetRecord | undefined;
  query(filter: AssetFilter): AssetRecord[];
  has(id: string): boolean;
}

/** Implementação padrão: envelopa um AssetRegistry em memória. */
export class InMemoryAssetRepository implements AssetRepository {
  constructor(private readonly registry: AssetRegistry) {}

  all(): AssetRecord[] {
    return this.registry.all();
  }
  get(id: string): AssetRecord | undefined {
    return this.registry.get(id);
  }
  query(filter: AssetFilter): AssetRecord[] {
    return this.registry.list(filter);
  }
  has(id: string): boolean {
    return this.registry.has(id);
  }

  /** Acesso ao registry subjacente (ex.: para inspeção/estatística). */
  get index(): AssetRegistry {
    return this.registry;
  }
}

/** Fábrica: cria um repositório em memória a partir de records. */
export function createInMemoryRepository(records: AssetRecord[]): InMemoryAssetRepository {
  return new InMemoryAssetRepository(new AssetRegistry(records));
}
