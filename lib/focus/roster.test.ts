import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FOCUS_CHARS, VARIACOES, CORES } from "./roster";

const DIR = path.join(process.cwd(), "public/exercises/agentes-personagens");

describe("FOCUS roster", () => {
  it("gera 6 cores × variações não-emoção", () => {
    expect(FOCUS_CHARS.length).toBe(CORES.length * Object.keys(VARIACOES).length);
  });

  it("não inclui emoções (alegria/raiva/tristeza)", () => {
    const emo = FOCUS_CHARS.filter((c) => /alegria|raiva|tristeza/.test(c.id));
    expect(emo).toEqual([]);
  });

  it("todo personagem tem arquivo PNG existente", () => {
    for (const c of FOCUS_CHARS) {
      const p = path.join(DIR, `${c.id}.png`);
      expect(fs.existsSync(p), `faltou ${c.id}.png`).toBe(true);
    }
  });

  it("objetos com lado têm ladoObjeto; acessórios/objetos coerentes", () => {
    const bola = FOCUS_CHARS.find((c) => c.id === "amarelo_basquete_dir")!;
    expect(bola.objeto).toBe("bola_basquete");
    expect(bola.ladoObjeto).toBe("direito");
    const combo = FOCUS_CHARS.find((c) => c.id === "azul_oculos_fone")!;
    expect(combo.acessorios.sort()).toEqual(["fone", "oculos"]);
  });
});
