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

    expect(source).toMatch(/SPEECH_ONSTART_GUARD_MS = 1200/);
    expect(source).toMatch(/setTimeout\(announce, SPEECH_ONSTART_GUARD_MS\)/);
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
