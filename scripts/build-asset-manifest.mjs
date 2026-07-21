#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Gera data/assets/manifest.json varrendo o layout FLAT de public/assets.
//
// Agrega, para o app: cada personagem com a lista de expressões/poses que existem
// em disco, e cada objeto/cenário/animal/veículo/ícone como asset simples. É o
// ÚNICO ponto que lê o filesystem: roda OFFLINE (npm run assets:manifest), não em
// runtime — o app carrega só o índice.  Uso: node scripts/build-asset-manifest.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "public", "assets");
const OUT = path.join(ROOT, "data", "assets", "manifest.json");

const GROUP_TO_AGE = { children: "children", teens: "teenagers", adults: "adults", elders: "olderAdults" };
const SIMPLE = [
  { folder: "objects", kind: "object", transparent: true },
  { folder: "environments", kind: "scene", transparent: false },
  { folder: "animals", kind: "animal", transparent: true },
  { folder: "vehicles", kind: "vehicle", transparent: true },
  { folder: "icons", kind: "icon", transparent: true },
  { folder: "decor", kind: "decor", transparent: true },
];

const humanize = (slug) => slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const slugFromCode = (code) => code.replace(/_/g, "-");
const IMG = /\.(svg|png)$/;
const stripExt = (f) => f.replace(IMG, "");

async function listPng(dir) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((f) => IMG.test(f)).sort();
}

async function main() {
  const assets = [];

  // ── Personagens + expressões/poses (por code) ──────────────────────────────
  const expr = await listPng(path.join(ASSETS, "expressions"));
  const poses = await listPng(path.join(ASSETS, "poses"));
  for (const [folder, ageGroup] of Object.entries(GROUP_TO_AGE)) {
    const files = await listPng(path.join(ASSETS, "characters", folder));
    for (const file of files) {
      const code = file.replace(IMG, "");            // child_001
      const slug = slugFromCode(code);                     // child-001
      const pref = `${code}_`;
      const suffix = (f) => f.replace(IMG, "").slice(pref.length);
      assets.push({
        id: `character:${ageGroup}:${slug}`, kind: "character", title: humanize(slug), ageGroup,
        transparentBackground: true,
        expressions: expr.filter((f) => f.startsWith(pref)).map((f) => ({ id: suffix(f) })),
        poses: poses.filter((f) => f.startsWith(pref)).map((f) => ({ id: suffix(f) })),
      });
    }
  }

  // ── Assets simples ─────────────────────────────────────────────────────────
  for (const { folder, kind, transparent } of SIMPLE) {
    const files = await listPng(path.join(ASSETS, folder));
    for (const file of files) {
      const slug = file.replace(IMG, "");
      assets.push({ id: `${kind}:${slug}`, kind, title: humanize(slug), transparentBackground: transparent });
    }
  }

  assets.sort((a, b) => a.id.localeCompare(b.id));
  const manifest = { version: 1, generatedAt: assets.length ? new Date().toISOString() : null, assets };
  await writeFile(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const byKind = {};
  for (const a of assets) byKind[a.kind] = (byKind[a.kind] ?? 0) + 1;
  console.log(`[assets] manifesto: ${assets.length} asset(s) em ${path.relative(ROOT, OUT)}`);
  console.log(`[assets] por tipo:`, byKind);
}

main().catch((err) => { console.error("[assets] falha:", err); process.exit(1); });
