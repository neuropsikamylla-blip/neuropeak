// Prova adversarial do VP sobre a fatia C1. O controle negativo do Codex reimplementava o
// rodízio de `tipoDaAtividade` (lib) — que era CÓDIGO MORTO: o componente nunca o chamava.
// O rodízio que o paciente realmente vivia era outro, em InformacaoEmFoco.tsx:255:
//     const tipo = tipos[rodizioRef.current++ % tipos.length];
// Uma prova que mira a peça errada não prova o pedido dela. Esta mira a certa.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { sortearTipo, sortearModalidade, tiposDoNivel, type TipoQuestao } from "./informacao-foco-questoes";

const COMPONENTE = readFileSync(
  resolve(process.cwd(), "components/exercises/attention/InformacaoEmFoco.tsx"), "utf8");

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}

/** O rodízio REAL de antes: percorre tiposDoNivel em ordem, ciclicamente. */
function sequenciaDoRodizioReal(nivel: number, inicio: number, n: number): string {
  const tipos = tiposDoNivel(nivel);
  let i = inicio;
  return Array.from({ length: n }, () => tipos[i++ % tipos.length]).join("|");
}

describe("VP — a sequência que o PACIENTE via deixa de ser previsível", () => {
  it("o rodízio real produzia UMA sequência, e ela se repetia a cada ciclo", () => {
    // qualquer que fosse o ponto de partida, a ORDEM relativa era sempre a mesma
    const distintas = new Set<string>();
    for (let inicio = 0; inicio < 10_000; inicio++) {
      distintas.add(sequenciaDoRodizioReal(7, inicio % tiposDoNivel(7).length, 10));
    }
    // no máximo tantas quantas as posições do ciclo — não 10.000
    expect(distintas.size).toBeLessThanOrEqual(tiposDoNivel(7).length);
    // e o ciclo fecha: começar no 0 ou no comprimento do ciclo dá a MESMA sequência
    expect(sequenciaDoRodizioReal(7, 0, 10)).toBe(sequenciaDoRodizioReal(7, tiposDoNivel(7).length, 10));
  });

  it("o sorteio novo produz milhares de sequências distintas", () => {
    const rnd = lcg(20260915);
    const distintas = new Set<string>();
    for (let r = 0; r < 10_000; r++) {
      distintas.add(Array.from({ length: 10 }, () => {
        const m = sortearModalidade(7, rnd);
        return m === "situacao" ? "situacao" : m === "embalagem" ? "leituraEmbalagem" : sortearTipo(7, rnd);
      }).join("|"));
    }
    expect(distintas.size).toBeGreaterThan(5_000);
  });

  it("o paciente não consegue prever o próximo tipo a partir do anterior", () => {
    // No rodízio, saber o tipo atual dava o seguinte com 100% de certeza. Medimos isso:
    // para cada tipo, qual a frequência do sucessor MAIS comum?
    const rnd = lcg(31415);
    const seguintes = new Map<TipoQuestao, Map<TipoQuestao, number>>();
    let anterior: TipoQuestao | null = null;
    for (let i = 0; i < 40_000; i++) {
      const m = sortearModalidade(7, rnd);
      const t: TipoQuestao = m === "situacao" ? "situacao" : m === "embalagem" ? "leituraEmbalagem" : sortearTipo(7, rnd);
      if (anterior) {
        const mapa = seguintes.get(anterior) ?? new Map<TipoQuestao, number>();
        mapa.set(t, (mapa.get(t) ?? 0) + 1);
        seguintes.set(anterior, mapa);
      }
      anterior = t;
    }
    for (const [tipo, mapa] of seguintes) {
      const total = [...mapa.values()].reduce((a, b) => a + b, 0);
      const maior = Math.max(...mapa.values());
      // no rodízio isto seria 1,0 (certeza absoluta). Exigimos bem abaixo disso.
      expect(maior / total, `sucessor de ${tipo}`).toBeLessThan(0.45);
    }
  });

  it("o rodízio do COMPONENTE não existe mais", () => {
    expect(COMPONENTE).not.toContain("rodizioRef");
    expect(COMPONENTE).not.toMatch(/tipos\[[^\]]*%\s*tipos\.length\]/);
    expect(COMPONENTE).toContain("sortearTipo");
    expect(COMPONENTE).toContain("sortearModalidade");
  });

  // Em 15/set ela mandou tirar TAMBÉM o nível e a contagem de atividade: "isso já precisa ser
  // tirado e o problema dos exercícios permanece, nada de avisar quantas atividades foi feita".
  // A prova original exigia "Atividade {qNum}" presente; foi CORRIGIDA para o novo alvo, não
  // afrouxada — o que era presença virou contagem ZERO.
  it("nada de porcentagem, de nível nem de contagem de atividade na tela", () => {
    for (const proibido of ["progressPct)}%", "Tempo da sessão ·", "Nível ${nivelRef.current}", "Atividade {qNum}", "qNum"]) {
      expect(COMPONENTE.split(proibido).length - 1, proibido).toBe(0);
    }
  });

  it("mas a barra TEMPORAL global continua lá — tirar rótulos não pode tirar a barra", () => {
    expect(COMPONENTE).toContain("<ExerciseProgressBar");
    expect(COMPONENTE).toContain("useBlocoDeTreino(\"informacao-em-foco\"");
  });

  it("a dose NÃO foi tocada: 6 minutos, decisão dela", () => {
    const dose = readFileSync(resolve(process.cwd(), "lib/exercise-dosage.ts"), "utf8");
    expect(dose).toContain('"informacao-em-foco": dosagemPorTentativas(360)');
  });
});
