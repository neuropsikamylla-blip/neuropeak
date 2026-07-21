#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Runner da geração em lote.
//
//   node scripts/assets-gen/generate.mjs              # DRY-RUN (padrão): só planeja
//   node scripts/assets-gen/generate.mjs --run        # gera de verdade (usa a API)
//   ...  --provider=gemini --only=object --limit=20 --force --concurrency=4
//
// Seguro por padrão: sem --run, NENHUMA API é chamada — apenas escreve os prompts
// e o plano. Retomável: pula arquivos que já existem (não duplica). Ledger em
// .state.json. Gera metadata/metadata.json ao final.
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  PUBLIC_ASSETS, PROMPTS_DIR, STATE_FILE, RESOLUTION, PROVIDER, CONCURRENCY,
  MAX_RETRIES, COST_PER_IMAGE_USD, LAYOUT, outPath,
} from "./config.mjs";
import { buildCatalog, catalogSummary } from "./catalog.mjs";
import { buildPrompt } from "./prompts.mjs";
import { getProvider } from "./providers.mjs";

function parseArgs(argv) {
  const a = { run: false, provider: PROVIDER, only: null, limit: Infinity, force: false, concurrency: CONCURRENCY };
  for (const arg of argv) {
    if (arg === "--run") a.run = true;
    else if (arg === "--force") a.force = true;
    else if (arg.startsWith("--provider=")) a.provider = arg.split("=")[1];
    else if (arg.startsWith("--only=")) a.only = arg.split("=")[1];
    else if (arg.startsWith("--limit=")) a.limit = Number(arg.split("=")[1]);
    else if (arg.startsWith("--concurrency=")) a.concurrency = Number(arg.split("=")[1]);
  }
  return a;
}

async function loadState() {
  try { return JSON.parse(await readFile(STATE_FILE, "utf8")); } catch { return { done: {} }; }
}
async function saveState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

async function ensureDir(file) {
  await mkdir(path.dirname(file), { recursive: true });
}

async function runPool(items, concurrency, worker) {
  const queue = [...items];
  let active = 0;
  return new Promise((resolve) => {
    const results = [];
    const next = () => {
      if (queue.length === 0 && active === 0) return resolve(results);
      while (active < concurrency && queue.length > 0) {
        const item = queue.shift();
        active++;
        Promise.resolve(worker(item))
          .then((r) => results.push(r))
          .catch((e) => results.push({ error: e }))
          .finally(() => { active--; next(); });
      }
    };
    next();
  });
}

async function writeMetadata(cat) {
  const dir = path.join(PUBLIC_ASSETS, LAYOUT.metadataDir());
  await mkdir(dir, { recursive: true });
  const entries = cat.all.map((e) => ({
    id: e.id, kind: e.kind, file: `/assets/${e.relPath}`,
    ...(e.group ? { group: e.group, ageGroup: e.ageGroup, code: e.code } : {}),
    ...(e.expr ? { expression: e.expr } : {}), ...(e.pose ? { pose: e.pose } : {}),
    ...(e.category ? { category: e.category } : {}),
    transparent: e.transparent, exists: existsSync(outPath(e.relPath)),
  }));
  await writeFile(path.join(dir, "metadata.json"),
    JSON.stringify({ version: 1, count: entries.length, assets: entries }, null, 2) + "\n", "utf8");
  return entries.filter((e) => e.exists).length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cat = buildCatalog();
  let items = cat.all;
  if (args.only) items = items.filter((e) => e.kind === args.only);
  if (Number.isFinite(args.limit)) items = items.slice(0, args.limit);

  const summary = catalogSummary(cat);
  console.log("── Catálogo ─────────────────────────────");
  console.table(summary);
  console.log(`Modo: ${args.run ? "GERAÇÃO REAL" : "DRY-RUN (simulação)"} · provider: ${args.provider} · alvo: ${items.length} asset(s)`);
  console.log(`Estimativa de custo p/ o alvo: ~US$ ${(items.length * COST_PER_IMAGE_USD).toFixed(2)} (a US$ ${COST_PER_IMAGE_USD}/imagem)`);

  const state = await loadState();
  let generated = 0, skipped = 0, failed = 0, planned = 0;

  if (!args.run) {
    // DRY-RUN: escreve os prompts num arquivo por asset e um plano agregado.
    await mkdir(PROMPTS_DIR, { recursive: true });
    const plan = [];
    for (const e of items) {
      const { prompt, negative } = buildPrompt(e);
      plan.push({ key: e.key, id: e.id, file: `/assets/${e.relPath}`, prompt, negative });
      planned++;
    }
    await writeFile(path.join(PROMPTS_DIR, "plan.json"), JSON.stringify(plan, null, 2) + "\n", "utf8");
    const existing = await writeMetadata(cat);
    console.log(`\n✔ DRY-RUN: ${planned} prompt(s) escritos em scripts/assets-gen/prompts/plan.json`);
    console.log(`  Nenhuma API chamada, nenhum custo. Imagens já existentes: ${existing}.`);
    console.log(`  Para gerar de verdade: adicione --run e um --provider com chave (gemini|openai).`);
    return;
  }

  // GERAÇÃO REAL
  const provider = getProvider(args.provider);
  if (provider.requiresKey) console.log(`(provedor "${provider.name}" exige chave via variável de ambiente)`);

  await runPool(items, args.concurrency, async (e) => {
    const file = outPath(e.relPath);
    if (!args.force && (existsSync(file) || state.done[e.key])) { skipped++; return; }
    const { prompt, negative } = buildPrompt(e);
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const buf = await provider.generate({ prompt, negative, width: RESOLUTION, height: RESOLUTION });
        await ensureDir(file);
        await writeFile(file, buf);
        state.done[e.key] = { at: new Date().toISOString(), provider: provider.name };
        generated++;
        if (generated % 25 === 0) { await saveState(state); console.log(`  … ${generated} geradas`); }
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) { failed++; console.warn(`  ✗ ${e.key}: ${err.message}`); }
        else await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  });

  await saveState(state);
  const existing = await writeMetadata(cat);
  console.log(`\n✔ Concluído: ${generated} gerada(s), ${skipped} pulada(s) (já existiam), ${failed} falha(s).`);
  console.log(`  metadata atualizado (${existing} assets em disco).`);
}

main().catch((e) => { console.error("[assets-gen] erro fatal:", e); process.exit(1); });
