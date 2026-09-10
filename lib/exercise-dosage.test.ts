import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  avancarTempoAtivo,
  blocoAtingiuTeto,
  blocoEmTolerancia,
  blocoPodeIniciarNovoDesafio,
  comecarBloco,
  criarEstadoBloco,
  criarRegistroBloco,
  progressoTemporalPct,
  registrarAtividadeBloco,
  registrarDesafioInterrompido,
  type EstadoBloco,
} from "@/lib/exercise-block";
import { resolveExerciseDosage, stroopDosage } from "@/lib/exercise-dosage";
import {
  gravarDosePersistida,
  lerDosePersistida,
  limparDosePersistida,
  progressoDaSessao,
  zerarDose,
  type StorageLike,
} from "@/lib/session-storage";

const PADRAO = resolveExerciseDosage("cubo-corsi");

function avancarAtivo(state: EstadoBloco, ateMs: number, maxMs = 600_000): EstadoBloco {
  let next = state;
  for (let now = next.lastTickAt + 10_000; now <= ateMs; now += 10_000) {
    next = registrarAtividadeBloco(next, now);
    next = avancarTempoAtivo(next, now, maxMs);
  }
  return next;
}

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("bloco de treino temporal", () => {
  it("1. começa a dose em zero quando o treino real começa", () => {
    expect(comecarBloco(criarEstadoBloco(), 1_000).activeMs).toBe(0);
  });

  it("2. tutorial sem begin não move a barra", () => {
    const state = avancarTempoAtivo(criarEstadoBloco(), 30_000, 600_000);
    expect(state.activeMs).toBe(0);
    expect(progressoTemporalPct(state.activeMs, 480_000)).toBe(0);
  });

  it("3. a barra progride apenas com o tempo ativo", () => {
    const state = avancarAtivo(comecarBloco(criarEstadoBloco(), 0), 240_000);
    expect(progressoTemporalPct(state.activeMs, 480_000)).toBe(50);
  });

  it("tempo parado por 15 s não consome a dose", () => {
    let state = comecarBloco(criarEstadoBloco(), 0);
    state = registrarAtividadeBloco(state, 0);
    state = avancarTempoAtivo(state, 16_000, 600_000);
    expect(state.activeMs).toBe(0);
  });

  it.each(["acerto", "erro"])("4/5. %s não altera a barra", () => {
    const state = avancarAtivo(comecarBloco(criarEstadoBloco(), 0), 120_000);
    const before = progressoTemporalPct(state.activeMs, 480_000);
    const eventoClinico = { tipo: "resultado", correto: true };
    expect(eventoClinico).toBeDefined();
    expect(progressoTemporalPct(state.activeMs, 480_000)).toBe(before);
  });

  it.each(["reiniciar o desafio", "trocar de problema"])("6/7. %s preserva a dose", () => {
    const state = avancarAtivo(comecarBloco(criarEstadoBloco(), 0), 130_000);
    const mesmaDoseDepoisDoEvento = state;
    expect(mesmaDoseDepoisDoEvento.activeMs).toBe(130_000);
  });

  it("8. no alvo a barra está cheia", () => {
    expect(progressoTemporalPct(480_000, 480_000)).toBe(100);
  });

  it("9. depois do alvo a barra continua cheia", () => {
    expect(progressoTemporalPct(540_000, 480_000)).toBe(100);
    expect(progressoTemporalPct(600_000, 480_000)).toBe(100);
  });

  it("10/11. depois do alvo encerra ao concluir e não inicia outro desafio", () => {
    expect(blocoEmTolerancia(500_000, PADRAO)).toBe(true);
    expect(blocoPodeIniciarNovoDesafio(500_000, PADRAO)).toBe(false);
  });

  it("12. o teto encerra o bloco", () => {
    expect(blocoAtingiuTeto(600_000, PADRAO)).toBe(true);
  });

  it("13. interrupção pelo teto preserva os dados e não cria erro", () => {
    const interrompido = registrarDesafioInterrompido("puzzle-4", { movimentos: [1, 2, 3], estado: [[3], [2], [1]] });
    expect(interrompido).toEqual({
      id: "puzzle-4",
      interrompidoPeloFimDoBloco: true,
      dados: { movimentos: [1, 2, 3], estado: [[3], [2], [1]] },
    });
    expect(interrompido).not.toHaveProperty("erro");
    expect(interrompido).not.toHaveProperty("abandono");
  });

  it("14. exercício curto usa a mesma progressão com alvo menor", () => {
    const curta = resolveExerciseDosage("semaforo");
    expect(curta).toEqual({ targetDurationSec: 300, maxDurationSec: 360 });
    expect(progressoTemporalPct(150_000, curta.targetDurationSec * 1000)).toBe(50);
  });

  it("as exceções fixas mantêm os pares aprovados", () => {
    expect(resolveExerciseDosage("tempo-reacao")).toEqual({ targetDurationSec: 300, maxDurationSec: 360 });
    expect(resolveExerciseDosage("informacao-em-foco")).toEqual({ targetDurationSec: 360, maxDurationSec: 420 });
  });

  it("17. recarregar restaura a dose e concluir zera", () => {
    const storage = new MemoryStorage();
    const date = new Date(2026, 8, 9, 12);
    gravarDosePersistida(storage, "semaforo", 123_400, date);
    expect(lerDosePersistida(storage, "semaforo", date)).toBe(123_400);
    const restored = criarEstadoBloco(lerDosePersistida(storage, "semaforo", date));
    expect(comecarBloco(restored, 200_000).activeMs).toBe(123_400);
    expect(zerarDose({ total: 1, completed: [], doses: { semaforo: { decorridoMs: 123_400 } } }, "semaforo").doses.semaforo.decorridoMs).toBe(0);
    limparDosePersistida(storage, "semaforo", date);
    expect(lerDosePersistida(storage, "semaforo", date)).toBe(0);
  });

  it("21. registro do bloco classifica alvo, tolerância e teto sem julgamento clínico", () => {
    const registro = criarRegistroBloco("cubo-corsi", { activeMs: 600_000, startedAt: 0 }, PADRAO, "rodada-9");
    expect(registro).toMatchObject({ encerradoNoAlvo: false, encerradoNaTolerancia: false, encerradoNoTeto: true, desafioInterrompidoId: "rodada-9" });
    expect(registro).not.toHaveProperty("indicadorClinico");
  });
});

describe("configuração e limites da fatia", () => {
  it("Stroop resolve o par e mantém teto em alvo + 60 s", () => {
    expect([1, 3, 6, 9].map(stroopDosage)).toEqual([
      { targetDurationSec: 240, maxDurationSec: 300 },
      { targetDurationSec: 300, maxDurationSec: 360 },
      { targetDurationSec: 360, maxDurationSec: 420 },
      { targetDurationSec: 420, maxDurationSec: 480 },
    ]);
  });

  it("Torre e Estacionamento resolvem para 480/600", () => {
    expect(resolveExerciseDosage("torre-hanoi")).toEqual({ targetDurationSec: 480, maxDurationSec: 600 });
    expect(resolveExerciseDosage("estacionamento-logico")).toEqual({ targetDurationSec: 480, maxDurationSec: 600 });
  });

  it("18/20. Torre usa só progressPct temporal e não recria progresso da solução", () => {
    const source = readFileSync("components/exercises/executive/TorreHanoi.tsx", "utf8");
    expect(source).toContain('useBlocoDeTreino("torre-hanoi", difficulty)');
    const progressLines = source.split("\n").filter((line) => line.includes("progressPct"));
    expect(progressLines).toHaveLength(3);
    expect(progressLines[0]).toContain("begin, elapsedSec, finish, progressPct");
    expect(progressLines.slice(1).every((line) => line.includes("progressPct={progressPct}"))).toBe(true);
    expect(progressLines.join(" ")).not.toMatch(/disc|move|minim|eficien|restart|peg/i);
  });

  it("19. a Grade ENTROU na dosagem global — o teste anterior caiu, e cair foi acerto", () => {
    // Escrito em 09/set afirmando que a Grade ficava de fora da fatia dos pilotos. Ela migrou em
    // 10/set, com os outros 31, quando ela levantou o portão. O invariante útil agora é o inverso.
    const source = readFileSync("components/exercises/executive/DeductiveGrid.tsx", "utf8");
    expect(source).toContain('useBlocoDeTreino("deductive-grid"');
    expect(source, "a Grade não pode ter ficado com dois relógios").not.toContain("useTimedProgress");
  });

  it("só os três pilotos usam o hook novo", () => {
    const sources = [
      "components/exercises/processing/Semaforo.tsx",
      "components/exercises/memory/CuboCorsi.tsx",
      "components/exercises/executive/TorreHanoi.tsx",
    ].map((path) => readFileSync(path, "utf8"));
    expect(sources.every((source) => source.includes("useBlocoDeTreino"))).toBe(true);
  });

  it("progresso da sessão ignora totalmente a fração do bloco", () => {
    expect(progressoDaSessao(1, 4)).toBe(25);
    expect(progressoDaSessao(1, 4)).toBe(progressoDaSessao(1, 4));
  });

  it("a barra não renderiza porcentagem nem reserva espaço para o texto", () => {
    const source = readFileSync("components/exercises/ExerciseProgressBar.tsx", "utf8");
    expect(source).not.toContain("{progressPct}%");
    expect(source).not.toContain("minWidth: 30");
    expect(source).toContain("Math.max(greatestPct.current");
  });
});
