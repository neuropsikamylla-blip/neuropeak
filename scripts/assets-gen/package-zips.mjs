#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Empacota cada categoria de assets num ZIP (dist/assets/assets_<cat>.zip).
// Usa o `zip` do sistema (macOS/Linux têm por padrão). Só empacota o que existe.
//
//   node scripts/assets-gen/package-zips.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { PUBLIC_ASSETS, DIST_DIR } from "./config.mjs";

// Cada ZIP agrega uma ou mais pastas de public/assets.
const BUNDLES = {
  characters: ["characters", "expressions", "poses"],
  objects: ["objects"],
  environments: ["environments"],
  animals: ["animals"],
  vehicles: ["vehicles"],
  icons: ["icons"],
  metadata: ["metadata"],
};

function zip(outFile, folders) {
  return new Promise((resolve, reject) => {
    const args = ["-r", "-q", outFile, ...folders];
    const child = spawn("zip", args, { cwd: PUBLIC_ASSETS, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`zip saiu com código ${code}`))));
  });
}

async function main() {
  await mkdir(DIST_DIR, { recursive: true });
  let made = 0;
  for (const [name, folders] of Object.entries(BUNDLES)) {
    const present = folders.filter((f) => existsSync(path.join(PUBLIC_ASSETS, f)));
    if (present.length === 0) { console.log(`- ${name}: nada a empacotar (pastas ainda vazias)`); continue; }
    const outFile = path.join(DIST_DIR, `assets_${name}.zip`);
    try {
      await zip(outFile, present);
      console.log(`✔ assets_${name}.zip  (${present.join(", ")})`);
      made++;
    } catch (e) {
      console.warn(`✗ assets_${name}.zip: ${e.message} — o utilitário 'zip' está instalado?`);
    }
  }
  console.log(made ? `\n${made} ZIP(s) em ${path.relative(process.cwd(), DIST_DIR)}` : "\nNada empacotado (gere os assets primeiro).");
}

main().catch((e) => { console.error("[assets-gen] erro ao empacotar:", e); process.exit(1); });
