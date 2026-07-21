// ─────────────────────────────────────────────────────────────────────────────
// Biblioteca de Assets — API pública do módulo (Etapa 4).
// Consuma sempre por aqui: `import { AssetService, parseAssetId, ... } from "@/lib/assets"`.
// A instância PADRÃO (ligada ao manifesto do projeto) vive em `@/data/assets`.
//
// Camadas:
//   types            → modelos (AssetKind, AgeGroup, metadata, records, modelos resolvidos)
//   ids / paths      → utilitários (parse/build de id, resolução determinística de URL)
//   art-direction    → Direção de Arte oficial + validação branda
//   metadata-loader  → lê/valida/normaliza metadata.json → AssetRecord[] (Metadata Loader)
//   registry         → índice por ID (Asset Registry)
//   repository       → abstração da fonte de records
//   service          → fachada de alto nível (carregar por ID, resolver URLs)
// ─────────────────────────────────────────────────────────────────────────────

export * from "./types";
export * from "./ids";
export * from "./paths";
export * from "./art-direction";
export * from "./metadata-loader";
export * from "./registry";
export * from "./repository";
export * from "./service";
