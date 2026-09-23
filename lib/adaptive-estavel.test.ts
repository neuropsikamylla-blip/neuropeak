import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateNewDifficulty, calculateProgression } from "@/lib/adaptive";
import {
  calculateStableProgression,
  getPreviousAccuracies,
  PROGRESSAO_ESTAVEL,
} from "@/lib/adaptive-estavel";
import { EXERCISE_DEFINITIONS, type SessionData } from "@/types";

function sessions(accs: number[]): SessionData[] {
  return accs.map((accuracy, index) => ({
    exerciseId: "auditoria",
    domain: "memory",
    score: Math.round(accuracy * 100),
    accuracy,
    reactionTime: null,
    difficulty: 1,
    duration: 60,
    completedAt: new Date(Date.UTC(2026, 8, 23, 12, 0, accs.length - index)),
  }));
}

function stable(level: number, accs: number[], consolidado = 1): number {
  return calculateStableProgression(level, {
    accAtual: accs[0],
    accsAnteriores: accs.slice(1),
    consolidado,
  }).nextLevel;
}

describe("calculateStableProgression", () => {
  it("documenta os oito casos da auditoria na tabela legado x clínico x estável", () => {
    const casos = [
      { caso: "melhora consistente", accs: [0.90, 0.88, 0.86], nivel: 4, legado: 5, clinico: 5, estavel: 5 },
      { caso: "um dia ruim isolado", accs: [0.35, 0.92, 0.90], nivel: 6, legado: 6, clinico: 4, estavel: 6 },
      // Divergência da tabela da spec: 0,45 não é "muito ruim" pelo limiar estrito < 0,45.
      { caso: "piora consistente", accs: [0.40, 0.45, 0.50], nivel: 6, legado: 5, clinico: 4, estavel: 5 },
      { caso: "oscilante", accs: [0.95, 0.40, 0.95], nivel: 5, legado: 5, clinico: 6, estavel: 5 },
      { caso: "estável na faixa boa", accs: [0.75, 0.78, 0.72], nivel: 5, legado: 5, clinico: 5, estavel: 5 },
      { caso: "primeira sessão ótima", accs: [0.95], nivel: 3, legado: 3, clinico: 4, estavel: 3 },
      { caso: "duas ótimas", accs: [0.95, 0.93], nivel: 3, legado: 4, clinico: 4, estavel: 4 },
      { caso: "desabou hoje, histórico bom", accs: [0.20, 0.90, 0.88], nivel: 7, legado: 7, clinico: 5, estavel: 7 },
    ];

    for (const { caso, accs, nivel, legado, clinico, estavel } of casos) {
      const medido = {
        legado: calculateNewDifficulty(nivel, sessions(accs), "auditoria").newDifficulty,
        clinico: calculateProgression(nivel, { accTotal: accs[0] }, 1).nextLevel,
        estavel: stable(nivel, accs),
      };
      expect(medido, caso).toEqual({ legado, clinico, estavel });
    }
  });

  it("protege o consolidado com duas ruins e só cruza a proteção com três ruins", () => {
    const duasRuins = calculateStableProgression(7, {
      accAtual: 0.30,
      accsAnteriores: [0.40],
      consolidado: 6,
    });
    const tresRuins = calculateStableProgression(7, {
      accAtual: 0.30,
      accsAnteriores: [0.40, 0.60],
      consolidado: 6,
    });

    expect(duasRuins.nextLevel).toBe(6);
    expect(tresRuins.nextLevel).toBe(5);

    // Depois de uma queda autorizada, a proteção nunca aumenta o nível numa sessão ruim.
    expect(calculateStableProgression(5, {
      accAtual: 0.30,
      accsAnteriores: [0.40, 0.70],
      consolidado: 6,
    }).nextLevel).toBe(5);
  });

  it("não ultrapassa o teto nem o piso em 50 iterações de cada extremo", () => {
    let alto = 10;
    let baixo = 1;
    for (let i = 0; i < 50; i += 1) {
      alto = stable(alto, [0.95, 0.95, 0.95]);
      baixo = stable(baixo, [0.20, 0.20, 0.20]);
      expect(alto).toBe(10);
      expect(baixo).toBe(1);
    }
  });

  // ⚠️ REGRA CORRIGIDA em 23/set. A spec original exigia monotonia ABSOLUTA do consolidado e, ao
  // mesmo tempo, permitia descer abaixo dele com três sessões ruins — duas regras contraditórias.
  // O resultado foi o travamento medido: seis sessões ruins paravam o paciente um nível abaixo do
  // melhor que já fez, para sempre. A regra correta: o consolidado só cede quando TRÊS sessões
  // ruins consecutivas confirmam a perda. Protege contra ruído, não contra piora real.
  it("o consolidado só desce quando três sessões ruins consecutivas confirmam a perda", () => {
    const valores = [0.20, 0.50, 0.75, 0.90];
    const sequencias: number[][] = [[]];
    for (let tamanho = 0; tamanho < 5; tamanho += 1) {
      for (const prefixo of sequencias.filter((seq) => seq.length === tamanho)) {
        for (const valor of valores) sequencias.push([...prefixo, valor]);
      }
    }

    for (const sequencia of sequencias.filter((seq) => seq.length === 5)) {
      let nivel = 3;
      let consolidado = 2;
      const historico: number[] = [];
      for (const accAtual of sequencia) {
        const resultado = calculateStableProgression(nivel, {
          accAtual,
          accsAnteriores: historico.slice(0, 3),
          consolidado,
        });
        const tresRuins = accAtual < 0.65
          && (historico[0] ?? 1) < 0.65
          && (historico[1] ?? 1) < 0.65;
        if (tresRuins) {
          // pode descer — mas nunca abaixo de 1, e nunca mais que o necessário
          expect(resultado.consolidatedLevel).toBeGreaterThanOrEqual(1);
          expect(resultado.consolidatedLevel).toBeLessThanOrEqual(consolidado);
        } else {
          // sem confirmação em três sessões, o consolidado NÃO pode cair
          expect(resultado.consolidatedLevel, `seq ${sequencia.join(",")}`).toBeGreaterThanOrEqual(consolidado);
        }
        nivel = resultado.nextLevel;
        consolidado = resultado.consolidatedLevel;
        historico.unshift(accAtual);
      }
    }
  });

  it("é simétrica: boas chegam ao teto, ruins ao piso e alternadas não movem", () => {
    const simular = (inicio: number, accs: number[], consolidadoInicial: number) => {
      let nivel = inicio;
      let consolidado = consolidadoInicial;
      const historico: number[] = [];
      for (const accAtual of accs) {
        const resultado = calculateStableProgression(nivel, {
          accAtual,
          accsAnteriores: historico.slice(0, 3),
          consolidado,
        });
        nivel = resultado.nextLevel;
        consolidado = resultado.consolidatedLevel;
        historico.unshift(accAtual);
      }
      return nivel;
    };

    expect(simular(1, Array(20).fill(0.95), 1)).toBe(10);
    expect(simular(10, Array(20).fill(0.20), 1)).toBe(1);
    expect(simular(5, Array.from({ length: 20 }, (_, i) => i % 2 === 0 ? 0.95 : 0.40), 1)).toBe(5);
  });

  it("é ligada somente pela rota de sessões", () => {
    const appDir = path.resolve(process.cwd(), "app");
    const fontes: string[] = [];
    const visitar = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) visitar(fullPath);
        else if (/\.(ts|tsx)$/.test(entry.name)) fontes.push(fullPath);
      }
    };
    visitar(appDir);

    const usos = fontes.filter((arquivo) =>
      fs.readFileSync(arquivo, "utf8").includes("calculateStableProgression"),
    );
    expect(usos).toEqual([path.resolve(process.cwd(), "app/api/sessions/route.ts")]);
  });
});

describe("opt-in da progressão estável", () => {
  it("mantém a lista explícita, pequena e restrita a ids existentes no catálogo", () => {
    const ids = [...PROGRESSAO_ESTAVEL];

    expect(ids).toEqual([
      "mot",
      "informacao-em-foco",
      "estacionamento-logico",
      "cubo-corsi",
    ]);
    expect(ids).toHaveLength(4);
    for (const id of ids) expect(id in EXERCISE_DEFINITIONS, id).toBe(true);
  });

  it("deixa exercícios fora da lista no fallback legado, comprovado pela posição na rota", () => {
    const route = fs.readFileSync(
      path.resolve(process.cwd(), "app/api/sessions/route.ts"),
      "utf8",
    );
    const decisionStart = route.indexOf("const adaptiveResult = dualProg");
    const decisionEnd = route.indexOf("await prisma.exerciseConfig.upsert", decisionStart);
    const decision = route.slice(decisionStart, decisionEnd);
    const genericPosition = decision.indexOf(": genericProg");
    const stablePosition = decision.indexOf(": PROGRESSAO_ESTAVEL.has(data.exerciseId)");
    const legacyPosition = decision.indexOf(": calculateNewDifficulty(");

    expect(decisionStart).toBeGreaterThan(-1);
    expect(genericPosition).toBeGreaterThan(-1);
    expect(stablePosition).toBeGreaterThan(genericPosition);
    expect(legacyPosition).toBeGreaterThan(stablePosition);
    for (const id of ["torre-hanoi", "semaforo", "stroop-task"]) {
      expect(PROGRESSAO_ESTAVEL.has(id), id).toBe(false);
    }
  });

  it("antecipa a única busca e recompõe a janela existente depois de criar a sessão", () => {
    const route = fs.readFileSync(
      path.resolve(process.cwd(), "app/api/sessions/route.ts"),
      "utf8",
    );
    const historyPosition = route.indexOf("const recentSessionsBeforeCreate = await prisma.session.findMany");
    const stablePosition = route.indexOf("stableProg = calculateStableProgression");
    const createPosition = route.indexOf("const newSession = await prisma.session.create");
    const rebuildPosition = route.indexOf(
      "const recentSessions = [newSession, ...recentSessionsBeforeCreate].slice(0, 20)",
    );

    expect((route.match(/prisma\.session\.findMany/g) ?? [])).toHaveLength(1);
    expect(historyPosition).toBeGreaterThan(-1);
    expect(stablePosition).toBeGreaterThan(historyPosition);
    expect(createPosition).toBeGreaterThan(stablePosition);
    expect(rebuildPosition).toBeGreaterThan(createPosition);
  });

  it("filtra o exercício certo, ordena da mais recente e limita a três acurácias", () => {
    const recentSessions = [
      { exerciseId: "mot", accuracy: 0.60, completedAt: "2026-09-20T12:00:00Z" },
      { exerciseId: "semaforo", accuracy: 0.10, completedAt: "2026-09-23T12:00:00Z" },
      { exerciseId: "mot", accuracy: 0.90, completedAt: "2026-09-23T10:00:00Z" },
      { exerciseId: "mot", accuracy: 0.70, completedAt: "2026-09-21T12:00:00Z" },
      { exerciseId: "semaforo", accuracy: 0.20, completedAt: "2026-09-24T12:00:00Z" },
      { exerciseId: "mot", accuracy: 0.80, completedAt: "2026-09-22T12:00:00Z" },
    ];

    expect(getPreviousAccuracies(recentSessions, "mot")).toEqual([0.90, 0.80, 0.70]);
  });

  it("mantém o nível na primeira sessão, quando o histórico do exercício está vazio", () => {
    const accsAnteriores = getPreviousAccuracies([
      { exerciseId: "semaforo", accuracy: 0.95, completedAt: "2026-09-23T12:00:00Z" },
    ], "mot");
    const result = calculateStableProgression(4, {
      accAtual: 0.95,
      accsAnteriores,
      consolidado: 4,
    });

    expect(accsAnteriores).toEqual([]);
    expect(result).toMatchObject({ nextLevel: 4, action: "maintain" });
  });

  it("mantém assinaturas e corpos dos quatro motores antigos intactos", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "lib/adaptive.ts"), "utf8");
    const expectedHashes: Record<string, string> = {
      calculateNewDifficulty: "d679241a9ddfa4450a083aabdc36b22cd12eadb67e1b7e9cb7313f46eaa6d9b3",
      calculateProgression: "9409f2e55c601b6a37690996d9c43aa9a4a0e4b6eef649549c4994c5c4265a50",
      calculateStoryTrailProgression: "59532b5175227059476ecd9bfc2c06aeed2108f7242d504932f7b0f8a9523297",
      calculateDualTaskProgression: "e9b81b082e4684afb9330132e7148784553102f27cda0171ae685c41c96ccd5f",
    };

    const extractFunction = (name: string): string => {
      const start = source.indexOf(`export function ${name}(`);
      expect(start, name).toBeGreaterThan(-1);
      const openingBrace = source.indexOf("{", start);
      let depth = 0;
      for (let index = openingBrace; index < source.length; index += 1) {
        if (source[index] === "{") depth += 1;
        if (source[index] === "}") {
          depth -= 1;
          if (depth === 0) return source.slice(start, index + 1);
        }
      }
      throw new Error(`Corpo de ${name} não encontrado`);
    };

    for (const [name, expectedHash] of Object.entries(expectedHashes)) {
      const actualHash = crypto.createHash("sha256").update(extractFunction(name)).digest("hex");
      expect(actualHash, name).toBe(expectedHash);
    }
  });
});

describe("VP — a vida do paciente, sessão a sessão", () => {
  /** Roda a regra como o servidor rodaria: uma sessão por vez, carregando o histórico. */
  function vida(nivelInicial: number, seq: number[]) {
    let nivel = nivelInicial;
    let consolidado = nivelInicial;
    const hist: number[] = [];
    const caminho = [nivel];
    for (const acc of seq) {
      const r = calculateStableProgression(nivel, {
        accAtual: acc,
        accsAnteriores: hist.slice().reverse().slice(0, 3),
        consolidado,
      });
      nivel = r.nextLevel;
      consolidado = r.consolidatedLevel;
      hist.push(acc);
      caminho.push(nivel);
    }
    return { nivel, consolidado, caminho };
  }

  // O caso clínico que motivou a regra inteira: quem alterna bom e ruim NÃO pode subir.
  it("o paciente oscilante não se move em 20 sessões", () => {
    const r = vida(5, Array.from({ length: 20 }, (_, i) => (i % 2 ? 0.40 : 0.95)));
    expect(new Set(r.caminho)).toEqual(new Set([5]));
  });

  it("um dia ruim isolado NÃO derruba — só pausa a subida", () => {
    const r = vida(5, [0.90, 0.90, 0.30, 0.90, 0.90, 0.90]);
    expect(Math.min(...r.caminho), "nunca desceu abaixo do inicial").toBe(5);
    expect(r.nivel, "e continuou subindo depois").toBeGreaterThan(5);
  });

  it("DOIS dias ruins seguidos derrubam, e a recuperação volta a subir", () => {
    const r = vida(5, [0.90, 0.90, 0.30, 0.35, 0.90, 0.90, 0.90]);
    expect(Math.min(...r.caminho)).toBeLessThan(6);   // desceu quando confirmou
    expect(r.nivel).toBeGreaterThan(Math.min(...r.caminho));  // e recuperou
  });

  // 🔴 CONSERTO DO VP: a proteção do consolidado TRAVAVA a descida. Com o consolidado fixo, seis
  // sessões ruins seguidas paravam o paciente um nível abaixo do melhor que já fez, para sempre.
  // A proteção existe contra RUÍDO, não contra piora real.
  it("piora real e sustentada continua descendo — o consolidado cede", () => {
    const r = vida(8, Array(8).fill(0.50));
    expect(r.nivel, "8 sessões ruins têm de levar bem abaixo do início").toBeLessThanOrEqual(3);
    expect(r.consolidado, "o consolidado desce junto").toBeLessThan(8);
  });

  it("controle: sem o conserto, a descida travaria no consolidado − 1", () => {
    // reimplementa o comportamento ANTIGO para mostrar a diferença
    let nivel = 8;
    const consolidadoFixo = 8;
    for (let i = 0; i < 8; i++) {
      const r = calculateStableProgression(nivel, {
        accAtual: 0.50, accsAnteriores: [0.50, 0.50, 0.50], consolidado: consolidadoFixo,
      });
      nivel = r.nextLevel;
    }
    expect(nivel, "com o consolidado travado em 8, para em 7").toBe(7);
  });

  it("melhora sustentada sobe até o teto e não passa dele", () => {
    const r = vida(1, Array(30).fill(0.95));
    expect(r.nivel).toBe(10);
  });
});
