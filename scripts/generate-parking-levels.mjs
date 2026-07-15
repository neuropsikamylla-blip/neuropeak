// Gerador do banco de fases do Estacionamento Lógico (épico ESTACIONAMENTO-PROGRESSAO-SPEC.md).
// Gera tabuleiros 6×6 aleatórios, resolve por BFS (regra clássica: mover um carro =
// 1 movimento, qualquer distância), valida e classifica por nível da escada 1–10.
// Uso: node scripts/generate-parking-levels.mjs [tentativas]  (padrão 400000)
// Saída: sobrescreve lib/parking-levels.ts (o teste lib/parking-levels.test.ts revalida tudo).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const GRID = 6;
const EXIT_ROW = 2;
const PER_LEVEL = 40;          // alvo de fases por nível
const MIN_CARS = 5;            // tabuleiro "cheio" (inclui o alvo)

// minMoves → nível da escada (spec: 5,6,7,8,9,10,11-12,13-14,15-16,17+)
function levelForMoves(m) {
  if (m <= 4) return null;
  if (m <= 10) return m - 4;       // 5→1 … 10→6
  if (m <= 12) return 7;
  if (m <= 14) return 8;
  if (m <= 16) return 9;
  return 10;
}

// ── Motor (mesma semântica do componente EstacionamentoLogico) ────────────────
function buildGrid(cars, skipId) {
  const g = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  for (const c of cars) {
    if (c.id === skipId) continue;
    for (let i = 0; i < c.len; i++) {
      const r = c.orientation === "vertical" ? c.row + i : c.row;
      const col = c.orientation === "horizontal" ? c.col + i : c.col;
      if (r >= 0 && r < GRID && col >= 0 && col < GRID) g[r][col] = true;
    }
  }
  return g;
}

function canMove(cars, car, newPos) {
  const g = buildGrid(cars, car.id);
  if (car.orientation === "horizontal") {
    const maxC = car.id === "target" ? GRID - car.len + 1 : GRID - car.len;
    if (newPos < 0 || newPos > maxC) return false;
    if (car.id === "target" && newPos >= GRID - car.len + 1) return true;
    for (let i = 0; i < car.len; i++) {
      const col = newPos + i;
      if (col < GRID && g[car.row][col]) return false;
    }
  } else {
    if (newPos < 0 || newPos > GRID - car.len) return false;
    for (let i = 0; i < car.len; i++) {
      const r = newPos + i;
      if (r < GRID && g[r][car.col]) return false;
    }
  }
  return true;
}

const isWin = (cars) => {
  const t = cars.find((c) => c.id === "target");
  return t.col + t.len >= GRID;
};

// BFS: menor nº de MOVIMENTOS (deslize contínuo = 1). null se insolúvel.
function solveMinMoves(start) {
  const posKey = (cs) => cs.map((c) => (c.orientation === "horizontal" ? c.col : c.row)).join(",");
  if (isWin(start)) return 0;
  const seen = new Set([posKey(start)]);
  let frontier = [start];
  for (let dist = 1; frontier.length; dist++) {
    const next = [];
    for (const state of frontier) {
      for (let i = 0; i < state.length; i++) {
        const car = state[i];
        const pos = car.orientation === "horizontal" ? car.col : car.row;
        for (const dir of [-1, 1]) {
          for (let np = pos + dir; canMove(state, car, np); np += dir) {
            const ns = state.map((c, j) =>
              j !== i ? c : c.orientation === "horizontal" ? { ...c, col: np } : { ...c, row: np }
            );
            if (isWin(ns)) return dist;
            const k = posKey(ns);
            if (!seen.has(k)) { seen.add(k); next.push(ns); }
          }
        }
      }
      if (seen.size > 400000) return null; // segurança
    }
    frontier = next;
  }
  return null;
}

// ── Geração aleatória ─────────────────────────────────────────────────────────
const ri = (n) => Math.floor(Math.random() * n);

function randomBoard() {
  const cars = [{ id: "target", row: EXIT_ROW, col: ri(4), len: 2, orientation: "horizontal" }];
  const occ = buildGrid(cars, "__none__");
  const nExtra = 4 + ri(6); // 4–9 carros além do alvo
  let idc = 65; // "A"
  for (let k = 0; k < nExtra; k++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const orientation = Math.random() < 0.55 ? "vertical" : "horizontal";
      const len = Math.random() < 0.7 ? 2 : 3;
      const row = orientation === "vertical" ? ri(GRID - len + 1) : ri(GRID);
      const col = orientation === "horizontal" ? ri(GRID - len + 1) : ri(GRID);
      if (orientation === "horizontal" && row === EXIT_ROW) continue; // nunca na fileira da saída
      let free = true;
      for (let i = 0; i < len; i++) {
        const r = orientation === "vertical" ? row + i : row;
        const c = orientation === "horizontal" ? col + i : col;
        if (occ[r][c]) { free = false; break; }
      }
      if (!free) continue;
      for (let i = 0; i < len; i++) {
        const r = orientation === "vertical" ? row + i : row;
        const c = orientation === "horizontal" ? col + i : col;
        occ[r][c] = true;
      }
      cars.push({ id: String.fromCharCode(idc++), row, col, len, orientation });
      break;
    }
  }
  return cars;
}

const canonical = (cars) =>
  cars
    .map((c) => `${c.id === "target" ? "T" : "x"}:${c.row},${c.col},${c.len},${c.orientation[0]}`)
    .sort()
    .join("|");

// ── Loop principal ────────────────────────────────────────────────────────────
const ATTEMPTS = Number(process.argv[2] ?? 400000);
const byLevel = new Map(); // nível → Level[]
const seenBoards = new Set();
const histogram = new Map();
let solved = 0;

const t0 = Date.now();
for (let a = 0; a < ATTEMPTS; a++) {
  const full = [...byLevel.values()].filter((v) => v.length >= PER_LEVEL).length;
  if (full === 10) break;
  const cars = randomBoard();
  if (cars.length < MIN_CARS) continue;
  const key = canonical(cars);
  if (seenBoards.has(key)) continue;
  seenBoards.add(key);
  const m = solveMinMoves(cars);
  if (m == null || m < 5) continue;
  solved++;
  histogram.set(m, (histogram.get(m) ?? 0) + 1);
  const lvl = levelForMoves(m);
  if (lvl == null) continue;
  const arr = byLevel.get(lvl) ?? [];
  if (arr.length >= PER_LEVEL) continue;
  arr.push({ idealMoves: m, cars });
  byLevel.set(lvl, arr);
  if (a % 20000 === 0) {
    const counts = Array.from({ length: 10 }, (_, i) => (byLevel.get(i + 1)?.length ?? 0)).join(" ");
    console.log(`tentativa ${a} — por nível: ${counts} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
}

console.log("\nHistograma de mínimos:", [...histogram.entries()].sort((x, y) => x[0] - y[0]));
const counts = Array.from({ length: 10 }, (_, i) => `n${i + 1}=${byLevel.get(i + 1)?.length ?? 0}`);
console.log("Fases por nível:", counts.join("  "));

// ── Escrita de lib/parking-levels.ts ─────────────────────────────────────────
const lines = [];
lines.push("// GERADO por scripts/generate-parking-levels.mjs — NÃO editar à mão.");
lines.push("// Banco de fases do Estacionamento Lógico, classificado pela escada de níveis 1–10");
lines.push("// (ESTACIONAMENTO-PROGRESSAO-SPEC.md). Cada fase foi resolvida e validada por BFS;");
lines.push("// idealMoves = mínimo de MOVIMENTOS (mover um carro = 1, qualquer distância).");
lines.push("// O teste lib/parking-levels.test.ts revalida o banco inteiro com solver independente.");
lines.push('import type { Level } from "@/types/parking";');
lines.push("");
lines.push("export const PARKING_LEVELS: Record<number, Level[]> = {");
for (let lvl = 1; lvl <= 10; lvl++) {
  const arr = byLevel.get(lvl) ?? [];
  lines.push(`  ${lvl}: [`);
  arr.forEach((lev, i) => {
    const id = `n${lvl}-${String(i + 1).padStart(2, "0")}`;
    const cars = lev.cars
      .map((c) => `{id:${JSON.stringify(c.id)},row:${c.row},col:${c.col},len:${c.len},orientation:"${c.orientation}"}`)
      .join(",");
    lines.push(`    {id:"${id}",idealMoves:${lev.idealMoves},cars:[${cars}]},`);
  });
  lines.push("  ],");
}
lines.push("};");
lines.push("");
lines.push("export const PLAY_LEVELS = Object.keys(PARKING_LEVELS).map(Number).filter((l) => PARKING_LEVELS[l].length > 0).sort((a, b) => a - b);");
lines.push("");

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "parking-levels.ts");
writeFileSync(out, lines.join("\n"));
console.log(`\nEscrito ${out} (${solved} fases solucionáveis encontradas, ${seenBoards.size} tabuleiros testados)`);
