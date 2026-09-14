// Prova adversarial do VP sobre a Fatia B. O alvo é um defeito específico, que já
// queimou a Torre (31/ago) e a Grade Dedutiva (03/set): com retentativa, o paciente
// corrige até 100% e a progressão sobe em TODA sessão. A nota tem de ser a da
// PRIMEIRA confirmação, e estes testes existem para provar que continua sendo.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { avaliarOrdem, resumirSessao, type RegistroHistoria } from "./tentativas";

const FONTE = readFileSync(
  resolve(process.cwd(), "components/exercises/executive/OrdemHistoria.tsx"), "utf8");

function registro(p: Partial<RegistroHistoria> = {}): RegistroHistoria {
  return {
    acertoPrimeira: 1, acertoFinal: 1, confirmacoes: 1,
    resolvida: true, resolvidaDePrimeira: true, movimentos: 0, ...p,
  };
}

describe("VP — a nota é a da primeira tentativa, e a progressão não infla", () => {
  // O cenário exato do defeito: sessão inteira terminando 100% certa por correção.
  it("4 histórias TODAS resolvidas por correção não produzem nota 1", () => {
    const sessao = [0.25, 0.5, 0.25, 0.75].map((primeira) =>
      registro({ acertoPrimeira: primeira, acertoFinal: 1, confirmacoes: 3, resolvidaDePrimeira: false }));
    const r = resumirSessao(sessao);
    expect(r.accFinal).toBe(1);              // ele de fato terminou tudo certo
    expect(r.accFirstTry).toBeCloseTo(0.4375, 4);  // e a nota é MUITO menor
    expect(r.accFirstTry).toBeLessThan(0.85);      // abaixo do limiar que faz subir de nível
    expect(r.storiesFirstTryExact).toBe(0);
    expect(r.storiesSolvedAfter).toBe(4);
  });

  // O limiar que importa: calculateStoryTrailProgression sobe de nível com acc >= 0,85.
  it("insistir no Confirmar não leva o paciente ao limiar de subir de nível", () => {
    const teimoso = Array.from({ length: 6 }, () =>
      registro({ acertoPrimeira: 0.5, acertoFinal: 1, confirmacoes: 9, resolvidaDePrimeira: false }));
    expect(resumirSessao(teimoso).accFirstTry).toBeLessThan(0.85);
  });

  it("quem acerta de primeira continua com nota cheia — a regra não pune o bom desempenho", () => {
    const r = resumirSessao([registro(), registro(), registro()]);
    expect(r.accFirstTry).toBe(1);
    expect(r.storiesFirstTryExact).toBe(3);
    expect(r.storiesSolvedAfter).toBe(0);
  });

  it("história interrompida pelo fim do tempo não entra na média, mas é contada", () => {
    const r = resumirSessao([
      registro({ acertoPrimeira: 1 }),
      registro({ acertoPrimeira: 0, acertoFinal: 0.5, resolvida: false, resolvidaDePrimeira: false, confirmacoes: 2 }),
    ]);
    expect(r.accFirstTry).toBe(1);
    expect(r.storiesUnsolved).toBe(1);
    expect(r.confirmationsTotal).toBe(3);
  });

  it("sessão sem nenhuma história concluída não quebra nem inventa nota", () => {
    expect(resumirSessao([]).accFirstTry).toBe(0);
    expect(resumirSessao([registro({ resolvida: false })]).accFirstTry).toBe(0);
  });
});

describe("VP — o componente grava a nota certa (prova por posição)", () => {
  const corpo = (() => {
    const i = FONTE.indexOf("function closeOrderStory(");
    expect(i).toBeGreaterThan(-1);
    return FONTE.slice(i, FONTE.indexOf("\n  function ", i + 10));
  })();

  it("o único push em gradedRef, dentro de closeOrderStory, é acertoPrimeira", () => {
    const pushes = corpo.match(/gradedRef\.current\.push\([^)]*\)/g) ?? [];
    expect(pushes).toEqual(["gradedRef.current.push(acertoPrimeira)"]);
  });

  it("acertoPrimeira vem da PRIMEIRA confirmação, nunca do estado final", () => {
    expect(corpo).toContain("roundFirstAccuracyRef.current ?? accFinal");

    // A nota da 1ª confirmação só pode ser escrita UMA vez por história. Provamos que toda
    // atribuição a roundFirstAccuracyRef vive sob o guard de null (fora startRound, que a zera).
    const atribuicoes = (FONTE.match(/roundFirstAccuracyRef\.current\s*=(?!=)/g) ?? []).length;
    expect(atribuicoes).toBe(2);   // uma no guard, uma zerando em startRound
    expect(FONTE).toContain("if (roundFirstAccuracyRef.current === null) {\n      roundFirstAccuracyRef.current = acc;");
    expect(FONTE).toContain("roundFirstAccuracyRef.current = null;");   // startRound
  });

  it("posições certas/erradas contam uma vez por história, não por confirmação", () => {
    const i = FONTE.indexOf("const avaliacao = avaliarOrdem(cards);");
    const trecho = FONTE.slice(i, FONTE.indexOf("setAcertos(avaliacao.acertos);", i));
    // os dois acumuladores têm de estar DENTRO do guard da primeira confirmação
    const guard = trecho.slice(trecho.indexOf("if (roundFirstAccuracyRef.current === null) {"));
    expect(guard).toContain("posCorrectRef.current +=");
    expect(guard).toContain("posWrongRef.current +=");
  });

  it("accFinal não alimenta a accuracy nem a progressão", () => {
    expect(FONTE).toContain("accuracy: accTotal");
    expect(FONTE).toContain("const accTotal = gradedRef.current.length");
    expect(FONTE).not.toMatch(/accuracy:\s*(resumo|resumoOrdem)?\.?accFinal/);
    expect(FONTE).not.toMatch(/accTotal\s*=\s*[^;]*accFinal/);
  });

  it("não há um segundo push escondido em gradedRef no modo ordem", () => {
    const todos = FONTE.match(/gradedRef\.current\.push\([^)]*\)/g) ?? [];
    // um em closeOrderStory (modo ordem) e um em record() (intruso/falta)
    expect(todos).toHaveLength(2);
  });
});

describe("VP — os cartões corretos NÃO travam na segunda tentativa (decisão dela)", () => {
  it("corrigindo é uma fase movível, e o disabled deriva dela", () => {
    expect(FONTE).toContain('const movable = phase === "playing" || phase === "corrigindo";');
    expect(FONTE).toContain("disabled: !movable");
    expect(FONTE).toContain("{...(movable ? listeners : {})}");
  });

  it("nada trava um cartão por ele estar certo", () => {
    expect(FONTE).not.toMatch(/disabled:\s*[^,\n]*acertos/);
    expect(FONTE).not.toMatch(/acertos\[[^\]]+\][^\n]*disabled/);
    // e o SortableContext continua recebendo TODOS os cartões
    expect(FONTE).toContain("items={cards.map((c) => c.id)}");
  });

  it("a marca verde é derivada da posição ATUAL — some sozinha se o cartão sair dali", () => {
    expect(FONTE).toContain('acertos[card.id] === posNum - 1');
  });

  it("o acerto só é recalculado ao confirmar, nunca durante o arraste", () => {
    const i = FONTE.indexOf("function onDragEnd(");
    const corpoDrag = FONTE.slice(i, FONTE.indexOf("\n  function ", i + 10));
    expect(corpoDrag).not.toContain("avaliarOrdem");
    expect(corpoDrag).not.toContain("setAcertos");
  });
});

describe("VP — avaliarOrdem sob ataque", () => {
  it("conta e mapeia só quem está na posição certa", () => {
    const r = avaliarOrdem([
      { id: "a", order: 0 }, { id: "b", order: 2 }, { id: "c", order: 1 }, { id: "d", order: 3 },
    ]);
    expect(r.corretas).toBe(2);
    expect(r.total).toBe(4);
    expect(r.acertos).toEqual({ a: 0, d: 3 });
  });

  it("ordem totalmente invertida não acerta nenhuma (n par)", () => {
    const cards = [3, 2, 1, 0].map((order, i) => ({ id: `c${i}`, order }));
    expect(avaliarOrdem(cards).corretas).toBe(0);
  });

  it("lista vazia devolve total 0 sem quebrar", () => {
    expect(avaliarOrdem([])).toEqual({ corretas: 0, total: 0, acertos: {} });
  });
});
