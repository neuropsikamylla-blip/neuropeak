// ─────────────────────────────────────────────────────────────────────────────
// Configuração central do pipeline de geração de assets em lote.
// Estilo (Direção de Arte), caminhos de saída, provedor de imagem e limites.
// TUDO que depende de estrutura de pasta/estilo/custo fica AQUI (mudança = 1 arquivo).
// ─────────────────────────────────────────────────────────────────────────────

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");
export const PUBLIC_ASSETS = path.join(ROOT, "public", "assets");
export const DIST_DIR = path.join(ROOT, "dist", "assets");           // ZIPs de saída
export const STATE_FILE = path.join(__dirname, ".state.json");        // ledger de retomada (gitignored)
export const PROMPTS_DIR = path.join(__dirname, "prompts");           // dump de prompts do dry-run (gitignored)

// Direção de Arte oficial (01_Direcao_de_Arte.md) — cabeçalho comum a TODO prompt.
export const RESOLUTION = 2048;
export const STYLE = [
  "premium 2D cartoon illustration",
  "modern, clean, friendly vector style",
  "soft, harmonious color palette",
  "smooth and consistent linework, uniform outlines",
  "even frontal lighting, no harsh shadows",
  "neutral perspective",
  "professional educational-app / children's-book quality",
].join(", ");

// O que NUNCA deve aparecer (reforça 'sem texto/marca/aparência de IA').
export const NEGATIVE = [
  "text, letters, words, numbers, captions",
  "watermark, signature, logo",
  "photorealistic, 3d render, photograph, realistic skin",
  "AI artifacts, extra limbs, deformed hands, distorted face, asymmetry",
  "harsh shadows, cluttered background",
  "scary, uncanny, unsettling",
].join(", ");

// Provedor de imagem: 'openai' (escolhido) | 'gemini' | 'mock' (placeholder seguro).
// A geração real exige a chave da API na env (OPENAI_API_KEY); dry-run não usa provedor.
export const PROVIDER = process.env.ASSETS_GEN_PROVIDER || "openai";
export const CONCURRENCY = Math.max(1, Number(process.env.ASSETS_GEN_CONCURRENCY || 3));
export const MAX_RETRIES = Math.max(0, Number(process.env.ASSETS_GEN_RETRIES || 2));

// Estimativa de custo por imagem (só para o resumo; ajuste ao preço real da sua API).
export const COST_PER_IMAGE_USD = Number(process.env.ASSETS_GEN_COST || 0.04);

// ── Estrutura de pastas de SAÍDA (spec da produção em lote) ───────────────────
// Alterar aqui muda o layout de todos os arquivos gerados.
export const LAYOUT = {
  characterBase: (group, code) => `characters/${group}/${code}.png`,
  expression: (code, expr) => `expressions/${code}_${expr}.png`,
  pose: (code, pose) => `poses/${code}_${pose}.png`,
  object: (slug) => `objects/${slug}.png`,
  environment: (slug) => `environments/${slug}.png`,
  animal: (slug) => `animals/${slug}.png`,
  vehicle: (slug) => `vehicles/${slug}.png`,
  icon: (slug) => `icons/${slug}.png`,
  metadataDir: () => `metadata`,
};

export function outPath(relPath) {
  return path.join(PUBLIC_ASSETS, relPath);
}
