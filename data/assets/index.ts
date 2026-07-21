// ─────────────────────────────────────────────────────────────────────────────
// Instância PADRÃO da Biblioteca de Assets, ligada ao manifesto do projeto.
//
// Fluxo: metadata.json (nas pastas de public/assets)
//   → scripts/build-asset-manifest.mjs (leitura física, offline)
//   → data/assets/manifest.json (índice agregado, versionado)
//   → recordsFromManifest (validação/normalização)
//   → AssetRegistry → InMemoryAssetRepository → AssetService.
//
// Consuma daqui em componentes/telas: `import { assetService, resolveAssetUrl } from "@/data/assets"`.
// Começa VAZIO de propósito (Etapa 4 não gera imagens nem metadados de conteúdo).
// ─────────────────────────────────────────────────────────────────────────────

import manifestJson from "./manifest.json";
import {
  recordsFromManifest, AssetRegistry, InMemoryAssetRepository, createAssetService,
  type AssetManifest, type AssetService,
} from "@/lib/assets";

export const ASSET_MANIFEST = manifestJson as AssetManifest;

const records = recordsFromManifest(ASSET_MANIFEST);

export const assetRegistry = new AssetRegistry(records);
export const assetRepository = new InMemoryAssetRepository(assetRegistry);
export const assetService: AssetService = createAssetService(assetRepository);

/** Atalho: resolve a URL pública de qualquer asset por ID (null se id malformado). */
export function resolveAssetUrl(id: string): string | null {
  return assetService.resolveUrl(id);
}
