import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveExerciseDosage } from "./exercise-dosage";

function codigo(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n");
}

// Prova do VP. O risco desta fatia não é a barra — é o que ela PASSA A SIGNIFICAR. Uma barra
// temporal que volte a depender do desempenho é a regressão que ela removeu da Torre em julho,
// e nenhum teste de tempo pega isso.
describe("as decisões dela de 09/set viraram configuração, não literal", () => {
  it("Torre e Estacionamento caíram de 11 min para o padrão 8/10", () => {
    for (const id of ["torre-hanoi", "estacionamento-logico"]) {
      const d = resolveExerciseDosage(id, 5);
      expect(d.targetDurationSec, id).toBe(480);
      expect(d.maxDurationSec, id).toBe(600);
    }
  });

  it("os exercícios curtos continuam curtos, e com tolerância de 1 minuto", () => {
    for (const id of ["tempo-reacao", "semaforo"]) {
      const d = resolveExerciseDosage(id, 5);
      expect(d.targetDurationSec, id).toBe(300);
      expect(d.maxDurationSec - d.targetDurationSec, `${id}: tolerância`).toBe(60);
    }
  });

  it("o Stroop resolve o PAR e cresce com a dificuldade", () => {
    const facil = resolveExerciseDosage("stroop-task", 1);
    const dificil = resolveExerciseDosage("stroop-task", 12);
    expect(facil.targetDurationSec).toBe(4 * 60);
    expect(dificil.targetDurationSec).toBe(7 * 60);
    expect(dificil.targetDurationSec).toBeGreaterThan(facil.targetDurationSec);
    for (const d of [facil, dificil]) {
      expect(d.maxDurationSec - d.targetDurationSec, "tarefa por tentativas: tolerância curta").toBe(60);
    }
  });

  it("quem não está no mapa recebe o padrão da plataforma", () => {
    const d = resolveExerciseDosage("um-exercicio-que-nao-existe", 5);
    expect(d).toEqual({ targetDurationSec: 480, maxDurationSec: 600 });
  });

  it("o teto é SEMPRE maior que o alvo, em todo exercício e toda dificuldade", () => {
    // Um teto menor que o alvo encerraria o bloco antes de a barra encher — defeito que só
    // apareceria em produção, num exercício específico, numa dificuldade específica.
    const ids = ["torre-hanoi", "estacionamento-logico", "tempo-reacao", "semaforo",
                 "informacao-em-foco", "stroop-task", "deductive-grid", "cubo-corsi", "vigilancia"];
    for (const id of ids) {
      for (let dif = 1; dif <= 13; dif += 1) {
        const d = resolveExerciseDosage(id, dif);
        expect(d.maxDurationSec, `${id} d${dif}`).toBeGreaterThan(d.targetDurationSec);
        expect(d.targetDurationSec, `${id} d${dif}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("a barra da Torre não sabe nada sobre a solução", () => {
  const torre = codigo("components/exercises/executive/TorreHanoi.tsx");

  it("o progressPct é DESTRUCTURADO do hook, nunca calculado na tela", () => {
    // Precisão importa aqui: `progressPct={progressPct}` é passagem de prop, não cálculo.
    // O que se proíbe é a Torre PRODUZIR o valor — por atribuição própria ou por estado.
    const destructure = torre.slice(torre.indexOf("} = useBlocoDeTreino") - 400, torre.indexOf("} = useBlocoDeTreino"));
    expect(destructure, "progressPct deixou de vir do hook").toContain("progressPct");
    expect(torre, "a Torre voltou a calcular a própria barra").not.toMatch(/const\s+progressPct\s*=/);
    expect(torre, "a barra virou estado da tela").not.toMatch(/setProgressPct|useState[^;]*progressPct/);
  });

  it("a barra recebe SÓ tempo e tema — nada do estado do jogo", () => {
    // O invariante real não é o texto ao redor (o título fala em discos, e deve mesmo):
    // é o que a barra RECEBE. Se algum dia entrar aí uma prop derivada do jogo, isto reprova.
    const usos = torre.match(/<ExerciseProgressBar[^>]*>/g) ?? [];
    expect(usos.length, "sumiu a barra da Torre").toBeGreaterThan(0);
    for (const uso of usos) {
      const props = (uso.match(/(\w+)=/g) ?? []).map((p) => p.slice(0, -1));
      expect(props.sort(), `props da barra: ${uso}`).toEqual(["emTolerancia", "progressPct", "theme"]);
    }
  });
});

describe("o progresso do bloco não vaza para o do dia", () => {
  const wrapper = codigo("components/exercises/ExerciseWrapper.tsx");

  it("a barra do dia conta exercícios concluídos, e não a fração do atual", () => {
    // O defeito original: (sessionCompleted + innerPct / 100) / sessionTotal.
    expect(wrapper, "o progresso do bloco voltou a entrar na conta do dia")
      .not.toMatch(/sessionCompleted\s*\+\s*innerPct/);
  });

  it("nem a barra do exercício nem a do dia mostram porcentagem escrita", () => {
    // O `%` que sobra é largura CSS dentro de `style`, e deve mesmo ficar. O que se proíbe é
    // porcentagem como TEXTO — que na versão antiga vivia num <span> ao lado da barra.
    const barra = codigo("components/exercises/ExerciseProgressBar.tsx");
    expect(barra, "voltou o rótulo de porcentagem ao lado da barra").not.toMatch(/<span/);
    const forasDeStyle = barra.split("\n").filter((l) => l.includes("%") && !l.includes("style="));
    expect(forasDeStyle, `porcentagem fora de style: ${forasDeStyle.join(" | ")}`).toHaveLength(0);
    // O lookbehind separa TEXTO de largura CSS: dentro de um template literal,
    // "${sessionProgress}%" contem "{sessionProgress}%" e casaria sem essa guarda.
    expect(wrapper, "o widget do dia voltou a escrever a porcentagem")
      .not.toMatch(/(?<!\$)\{sessionProgress\}%/);
  });
});

describe("os 31 exercícios não migrados continuam intactos", () => {
  it("useTimedProgress segue existindo e exportado", () => {
    const engine = codigo("components/exercises/useExerciseEngine.ts");
    expect(engine, "quebrar useTimedProgress derrubaria 31 exercícios").toMatch(/export function useTimedProgress/);
    expect(engine).toMatch(/export function useBlocoDeTreino/);
  });
});
