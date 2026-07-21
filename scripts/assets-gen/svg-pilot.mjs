#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Gerador de assets em SVG (desenho por CÓDIGO — grátis, sem API paga).
// Mesmo espírito do bichinho: arte vetorial flat, cores suaves, fundo transparente.
// Escreve nos caminhos convencionais de public/assets → aparecem em /preview/assets.
//   node scripts/assets-gen/svg-pilot.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const A = path.join(ROOT, "public", "assets");

const svg = (inner, vb = "0 0 400 420") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">${inner}</svg>\n`;

// ── Personagem flat parametrizado ─────────────────────────────────────────────
function hair(style, color) {
  switch (style) {
    case "curly":
      return `<path d="M138 160 a62 62 0 0 1 124 0 q8 -56 -62 -56 q-70 0 -62 56z" fill="${color}"/>
        <circle cx="150" cy="120" r="22" fill="${color}"/><circle cx="200" cy="104" r="26" fill="${color}"/><circle cx="250" cy="120" r="22" fill="${color}"/>`;
    case "short":
      return `<path d="M140 150 q0 -58 60 -58 q60 0 60 58 q-10 -26 -60 -26 q-50 0 -60 26z" fill="${color}"/>`;
    case "long":
      return `<path d="M132 168 q-6 -76 68 -76 q74 0 68 76 l-6 92 q-14 8 -22 -2 l-2 -78 q-38 16 -76 0 l-2 78 q-8 10 -22 2z" fill="${color}"/>`;
    case "gray":
      return `<path d="M144 146 q0 -50 56 -50 q56 0 56 50 q-14 -22 -56 -22 q-42 0 -56 22z" fill="${color}"/>`;
    default:
      return "";
  }
}

function character({ skin, hairColor, hairStyle, shirt, pants, shoe, glasses }) {
  return svg(`
    <ellipse cx="200" cy="404" rx="66" ry="11" fill="#0a1628" opacity="0.06"/>
    <rect x="172" y="298" width="26" height="88" rx="13" fill="${pants}"/>
    <rect x="202" y="298" width="26" height="88" rx="13" fill="${pants}"/>
    <path d="M162 384 h32 v6 a16 8 0 0 1 -32 0z" fill="${shoe}"/>
    <path d="M206 384 h32 v6 a16 8 0 0 1 -32 0z" fill="${shoe}"/>
    <rect x="140" y="232" width="24" height="86" rx="12" fill="${shirt}"/>
    <rect x="236" y="232" width="24" height="86" rx="12" fill="${shirt}"/>
    <circle cx="152" cy="322" r="13" fill="${skin}"/>
    <circle cx="248" cy="322" r="13" fill="${skin}"/>
    <path d="M156 236 q44 -26 88 0 l8 74 q-52 20 -104 0z" fill="${shirt}"/>
    <rect x="188" y="206" width="24" height="26" fill="${skin}"/>
    <circle cx="142" cy="166" r="10" fill="${skin}"/>
    <circle cx="258" cy="166" r="10" fill="${skin}"/>
    <circle cx="200" cy="162" r="60" fill="${skin}"/>
    ${hair(hairStyle, hairColor)}
    <circle cx="181" cy="164" r="6" fill="#2b2320"/>
    <circle cx="219" cy="164" r="6" fill="#2b2320"/>
    <circle cx="169" cy="180" r="7" fill="#e8867e" opacity="0.45"/>
    <circle cx="231" cy="180" r="7" fill="#e8867e" opacity="0.45"/>
    <path d="M184 188 q16 15 32 0" stroke="#8a4b38" stroke-width="5" stroke-linecap="round"/>
    ${glasses ? `<g stroke="#3a4a63" stroke-width="4" fill="none"><circle cx="181" cy="164" r="15"/><circle cx="219" cy="164" r="15"/><path d="M196 164 h8"/></g>` : ""}
  `);
}

// ── Ícones e objetos flat ─────────────────────────────────────────────────────
const ICONS = {
  heart: svg(`<path d="M200 330 C60 240 90 110 175 110 c25 0 40 14 25 28 c40 -34 100 -4 100 52 c0 60 -70 108 -100 140z" fill="#ef5b6e"/>`, "0 0 400 400"),
  star: svg(`<path d="M200 70 l40 82 90 13 -65 64 15 90 -80 -42 -80 42 15 -90 -65 -64 90 -13z" fill="#f6b23c"/>`, "0 0 400 400"),
  lightbulb: svg(`<path d="M200 96 a78 78 0 0 1 46 141 q-12 9 -14 28 h-64 q-2 -19 -14 -28 a78 78 0 0 1 46 -141z" fill="#ffd867"/>
    <rect x="172" y="270" width="56" height="16" rx="8" fill="#9aa7bd"/><rect x="180" y="292" width="40" height="12" rx="6" fill="#9aa7bd"/>`, "0 0 400 400"),
  "question-mark": svg(`<circle cx="200" cy="200" r="150" fill="#4aa3e0"/><path d="M160 155 q0 -45 42 -45 q42 0 42 42 q0 30 -34 42 q-12 5 -12 22 v6" stroke="#fff" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="198" cy="290" r="14" fill="#fff"/>`, "0 0 400 400"),
};

const OBJECTS = {
  backpack: svg(`<path d="M120 150 q80 -70 160 0 l6 210 q-86 26 -172 0z" fill="#4f86c6"/>
    <path d="M150 190 h100 v70 q-50 16 -100 0z" fill="#eaf1fb"/>
    <rect x="188" y="205" width="24" height="46" rx="10" fill="#c6d7ee"/>
    <path d="M140 150 q60 -40 120 0" stroke="#37608f" stroke-width="14" fill="none"/>`, "0 0 400 400"),
  book: svg(`<path d="M110 120 q90 -34 180 0 v170 q-90 -30 -180 0z" fill="#7c5cc4"/>
    <path d="M200 108 v182" stroke="#5a3f97" stroke-width="8"/>
    <path d="M126 150 q60 -18 60 -6 M214 144 q60 -12 60 6" stroke="#eadff9" stroke-width="6" fill="none"/>`, "0 0 400 400"),
};

const ANIMALS = {
  dog: svg(`<ellipse cx="200" cy="250" rx="96" ry="70" fill="#c98a4a"/>
    <ellipse cx="200" cy="195" rx="70" ry="62" fill="#dda45f"/>
    <path d="M138 150 q-26 -6 -20 40 q20 8 34 -6z" fill="#a86c33"/>
    <path d="M262 150 q26 -6 20 40 q-20 8 -34 -6z" fill="#a86c33"/>
    <circle cx="180" cy="188" r="8" fill="#2b2320"/><circle cx="220" cy="188" r="8" fill="#2b2320"/>
    <ellipse cx="200" cy="214" rx="12" ry="9" fill="#2b2320"/>
    <path d="M200 223 v14 M186 233 q14 10 28 0" stroke="#7a4a2b" stroke-width="4" fill="none" stroke-linecap="round"/>`, "0 0 400 400"),
};

// ── Definição do piloto ───────────────────────────────────────────────────────
const CHARACTERS = [
  ["characters/children/child_001.svg", { skin: "#d29b6e", hairColor: "#2b2320", hairStyle: "curly", shirt: "#f2a03d", pants: "#4a6fa5", shoe: "#33456b" }],
  ["characters/teens/teen_001.svg", { skin: "#a9744f", hairColor: "#1c1c1c", hairStyle: "short", shirt: "#4fae86", pants: "#33445f", shoe: "#22304a" }],
  ["characters/adults/adult_001.svg", { skin: "#7a4a2b", hairColor: "#241a14", hairStyle: "long", shirt: "#7c5cc4", pants: "#2e2440", shoe: "#1c1730" }],
  ["characters/elders/elder_001.svg", { skin: "#e3c1a0", hairColor: "#b8b8b8", hairStyle: "gray", shirt: "#6b8fb5", pants: "#48566e", shoe: "#333e52", glasses: true }],
];

async function write(rel, content) {
  const full = path.join(A, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content, "utf8");
  return rel;
}

async function main() {
  const done = [];
  for (const [rel, cfg] of CHARACTERS) done.push(await write(rel, character(cfg)));
  for (const [name, s] of Object.entries(ICONS)) done.push(await write(`icons/${name}.svg`, s));
  for (const [name, s] of Object.entries(OBJECTS)) done.push(await write(`objects/${name}.svg`, s));
  for (const [name, s] of Object.entries(ANIMALS)) done.push(await write(`animals/${name}.svg`, s));
  console.log(`[svg-pilot] ${done.length} assets SVG gerados:`);
  for (const d of done) console.log("  •", d);
}

main().catch((e) => { console.error(e); process.exit(1); });
