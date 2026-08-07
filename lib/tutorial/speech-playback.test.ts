import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { speechGapMs } from "./speech-playback";

const playback = () => readFileSync(
  resolve(process.cwd(), "lib/tutorial/speech-playback.ts"),
  "utf8",
);

describe("cadência da voz sintetizada", () => {
  it.each([
    [0, 850],
    [1, 850],
    [5, 850],
    [6, 1000],
    [10, 1000],
  ])("usa o intervalo esperado para %i itens", (length, expected) => {
    expect(speechGapMs(length)).toBe(expected);
  });
});

describe("sincronismo da voz sintetizada com o visual", () => {
  it("anuncia o item dentro da reprodução, nunca antes de pedir a fala", () => {
    const source = playback();
    const sequence = source.slice(source.indexOf("export async function speakSequence"));
    const speakPosition = sequence.indexOf("await speakItem");
    const startPosition = sequence.indexOf("hooks.onItemStart");

    expect(source).toMatch(/utterance\.onstart = announce;/);
    expect(speakPosition).toBeGreaterThan(-1);
    expect(startPosition).toBeGreaterThan(speakPosition);
  });

  it("usa uma guarda de 1200 ms quando onstart não chega", () => {
    const source = playback();

    expect(source).toMatch(/SPEECH_SILENCE_TIMEOUT_MS = 2500/);
    // O resgate observa o ESTADO da fala, não o relógio.
    expect(source).toMatch(/if \(window\.speechSynthesis\.speaking\) \{\s*\n\s*announce\(\)/);
  });

  it("falha de voz ainda anuncia o estímulo visual antes de encerrar", () => {
    expect(playback()).toMatch(
      /utterance\.onerror = \(\) => \{\s*announce\(\);\s*finish\(\);\s*\};/,
    );
  });

  it("cancela a síntese ao abortar esperas e itens", () => {
    const source = playback();

    expect(source).toMatch(/window\.speechSynthesis\.cancel\(\)/);
    expect(source.match(/hooks\.isCancelled\(\)/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source).toMatch(/if \(!await wait\(gap, hooks\.isCancelled\)\) return/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRA GLOBAL 3 — trava para TODAS as famílias com áudio, presentes e futuras.
// Ela apontou em 07/ago/2026 que liberar o estímulo por tempo decorrido pode fazer o
// visual aparecer ANTES da fala. O critério tem de ser o estado real do áudio.
// ─────────────────────────────────────────────────────────────────────────────
describe("regra 3 — nenhum motor de áudio libera o visual por tempo decorrido", () => {
  const motores = ["lib/tutorial/speech-playback.ts", "lib/tutorial/span-playback.ts"];

  it.each(motores)("%s não anuncia o visual dentro de um setTimeout", (caminho) => {
    const fonte = readFileSync(resolve(process.cwd(), caminho), "utf8");

    // `setTimeout(announce, ...)` e variantes são a forma exata do defeito: o relógio virando
    // evento principal. Um `announce()` só pode nascer de um sinal do próprio áudio.
    expect(fonte).not.toMatch(/setTimeout\(\s*announce/);
    expect(fonte).not.toMatch(/setTimeout\(\s*\(\)\s*=>\s*announce\(\)/);
  });

  it("o resgate do speechSynthesis observa `speaking`, não o relógio", () => {
    const fonte = readFileSync(resolve(process.cwd(), "lib/tutorial/speech-playback.ts"), "utf8");

    expect(fonte).toMatch(/window\.speechSynthesis\.speaking/);
    // E o limite de silêncio só age DEPOIS de constatar que a fala não está acontecendo.
    const resgate = fonte.slice(fonte.indexOf("const inicio = performance.now()"));
    const posSpeaking = resgate.indexOf("window.speechSynthesis.speaking");
    const posLimite = resgate.indexOf("SPEECH_SILENCE_TIMEOUT_MS");
    expect(posSpeaking).toBeGreaterThanOrEqual(0);
    expect(posLimite).toBeGreaterThan(posSpeaking);
  });

  it("o áudio pré-gravado continua anunciando no evento playing", () => {
    const fonte = readFileSync(resolve(process.cwd(), "lib/tutorial/span-playback.ts"), "utf8");

    expect(fonte).toMatch(/audio\.onplaying = announce;/);
  });
});
