import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 23/set/2026 — a Vercel bateu 100% dos 10 GB de Deployment Storage. A causa eram as
// pastas de MATÉRIA-PRIMA em public/: 731 MB dos 968 MB, nenhuma versionada e nenhuma
// citada no código. Saíram do deploy pelo .vercelignore e continuam no disco.
//
// Este teste é o vigia: se alguém passar a referenciar uma delas no código, a imagem
// vai quebrar em produção (200 local, 404 no ar) e nada mais avisaria.

const RAIZ = resolve(__dirname, "..");
const IGNORADAS = [
  "public/exercises/historias-novas",
  "public/exercises/Personagem restaurante",
  "public/exercises/Restaurante-bistro",
  "public/exercises/icones novos",
  "public/exercises/itens-novos",
];

function fontes(dir: string, out: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    if (nome === "node_modules" || nome === ".next" || nome === ".git") continue;
    const p = resolve(dir, nome);
    if (statSync(p).isDirectory()) fontes(p, out);
    else if (/\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome)) out.push(p);
  }
  return out;
}

describe("peso do deploy — as pastas de matéria-prima", () => {
  it("o .vercelignore existe e lista as cinco", () => {
    const p = resolve(RAIZ, ".vercelignore");
    expect(existsSync(p), ".vercelignore sumiu — o deploy voltaria a levar 731 MB").toBe(true);
    const txt = readFileSync(p, "utf-8");
    for (const pasta of IGNORADAS) {
      expect(txt, `${pasta} saiu do .vercelignore`).toContain(pasta);
    }
  });

  it("nenhum arquivo de código referencia uma pasta que não vai para o deploy", () => {
    const arquivos = ["app", "lib", "components", "data"].flatMap((d) => fontes(resolve(RAIZ, d)));
    const nomes = IGNORADAS.map((p) => p.replace("public/", ""));
    const achados: string[] = [];
    for (const f of arquivos) {
      const txt = readFileSync(f, "utf-8");
      for (const nome of nomes) {
        if (txt.includes(nome)) achados.push(`${f.replace(RAIZ + "/", "")} cita "${nome}"`);
      }
    }
    expect(achados, `Referência a pasta fora do deploy:\n${achados.join("\n")}`).toEqual([]);
  });
});
