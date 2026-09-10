import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { summarizeGradeDedutiva } from "./grade-report";

// Prova do VP. O risco desta fatia não é o número — é a FRASE. Um relatório clínico que escorrega
// de "manteve 40 escolhas incompatíveis" para "apresenta impulsividade" cruza a linha que ela e o
// gestor de conteúdo desenharam: o sistema descreve, a interpretação é da profissional.

const PROIBIDOS = [
  "impulsiv", "prematur", "insegur", "ansied", "défic", "defic", "dependênc", "dependenc",
  "precipit", "fraquez", "prejudicad", "pior", "ruim", "fracasso", "incapaz", "dificuldade de",
  "quase l", "tente de novo", "parabéns", "muito bem", "excelente",
];

function varrer(texto: string, onde: string): void {
  const alvo = texto.toLocaleLowerCase("pt-BR");
  for (const p of PROIBIDOS) {
    expect(alvo, `${onde}: termo de julgamento "${p}"`).not.toContain(p);
  }
}

describe("o relatório descreve, nunca interpreta", () => {
  it("o código do agregador e a seção do PDF não contêm termo de julgamento", () => {
    varrer(readFileSync("lib/grade-report.ts", "utf8"), "lib/grade-report.ts");
    const rota = readFileSync("app/api/reports/route.ts", "utf8");
    const i = rota.indexOf("gradeSection");
    expect(i, "sumiu a seção da Grade").toBeGreaterThan(0);
    varrer(rota.slice(i, i + 3000), "seção da Grade no PDF");
  });

  it("o PIOR cenário possível continua produzindo só fatos", () => {
    // Nada resolvido, tudo contraditório, ajuda toda consumida. É aqui que um gerador de texto
    // escorrega para o diagnóstico — e é por isso que este caso existe.
    const pior = [{
      exerciseId: "deductive-grid",
      completedAt: new Date("2026-09-10"),
      metadata: JSON.stringify({
        problemas: Array.from({ length: 4 }, (_, i) => ({
          puzzleId: `p${i}`, nivel: 5, concluido: false,
          atribuicoes: [], verificacoes: [], eventosPista: [],
          atribuicoesAntesDeDeterminacao: 20, dessasMantidas: 20, dessasRevisadas: 0,
          atribuicoesComEstadoJaContraditorio: 40,
          latenciaPrimeiraAcao: 90000, totalAcoes: 300, tempoTotal: 600000,
          tentativasConcluirIncorretas: 12, usosVerificarRaciocinio: 3,
        })),
        problemasResolvidos: 0, tempoTotal: 2400000,
        atribuicoesAntesDeDeterminacao: 80, dessasMantidas: 80, dessasRevisadas: 0,
        atribuicoesComEstadoJaContraditorio: 160,
      }),
    }];
    const resumo = summarizeGradeDedutiva(pior as never);
    expect(resumo, "o pior cenário não pode devolver null").not.toBeNull();
    varrer(JSON.stringify(resumo), "resumo do pior cenário");
  });

  it("sem sessão da Grade, não existe seção — como o Caminhos faz", () => {
    expect(summarizeGradeDedutiva([] as never)).toBeNull();
    expect(summarizeGradeDedutiva([{ exerciseId: "torre-hanoi", metadata: "{}" }] as never)).toBeNull();
  });

  it("nenhuma razão vira NaN, nem no caso sem dado nenhum", () => {
    const vazio = [{
      exerciseId: "deductive-grid", completedAt: new Date("2026-09-10"),
      metadata: JSON.stringify({
        problemas: [], problemasResolvidos: 0, tempoTotal: 0,
        atribuicoesAntesDeDeterminacao: 0, dessasMantidas: 0, dessasRevisadas: 0,
        atribuicoesComEstadoJaContraditorio: 0,
      }),
    }];
    const texto = JSON.stringify(summarizeGradeDedutiva(vazio as never));
    expect(texto, "apareceu NaN no relatório").not.toMatch(/NaN/);
  });

  it("não usa linguagem técnica de software na tela da profissional", () => {
    // Princípio permanente do projeto: a interface fala neuropsicologia, não software.
    const rota = readFileSync("app/api/reports/route.ts", "utf8");
    const i = rota.indexOf("gradeSection");
    const secao = rota.slice(i, i + 3000).toLocaleLowerCase("pt-BR");
    for (const jargao of ["metadata", "solver", "puzzle", "régua", "restrição atômica", "heurística"]) {
      expect(secao, `jargão de software no relatório: ${jargao}`).not.toContain(jargao);
    }
  });
});
