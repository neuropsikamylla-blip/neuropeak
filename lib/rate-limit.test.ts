import { describe, it, expect, beforeEach } from "vitest";
import {
  isAllowed, registerFailure, clearFailures, _resetAll,
  type LimitRule,
} from "./rate-limit";

const RULE: LimitRule = { max: 3, windowMs: 1000, blockMs: 5000 };

describe("rate-limit", () => {
  beforeEach(() => _resetAll());

  it("permite tentativas abaixo do limite", () => {
    const t = 0;
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t);
    expect(isAllowed("k", t)).toBe(true); // 2 falhas < max 3
  });

  it("bloqueia ao atingir o limite de falhas", () => {
    const t = 0;
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t); // 3ª falha = max → bloqueia
    expect(isAllowed("k", t)).toBe(false);
  });

  it("libera após o tempo de bloqueio", () => {
    const t = 0;
    for (let i = 0; i < 3; i++) registerFailure("k", RULE, t);
    expect(isAllowed("k", t)).toBe(false);
    expect(isAllowed("k", t + RULE.blockMs + 1)).toBe(true);
  });

  it("reinicia a contagem quando a janela expira sem bloquear", () => {
    const t = 0;
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t); // 2 falhas
    // janela expira → próxima falha começa nova janela (não acumula)
    registerFailure("k", RULE, t + RULE.windowMs + 1);
    expect(isAllowed("k", t + RULE.windowMs + 1)).toBe(true);
  });

  it("clearFailures zera o contador (login bem-sucedido)", () => {
    const t = 0;
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t);
    clearFailures("k");
    // após limpar, começa do zero: mais 2 falhas ainda não bloqueiam
    registerFailure("k", RULE, t);
    registerFailure("k", RULE, t);
    expect(isAllowed("k", t)).toBe(true);
  });

  it("identificadores diferentes não interferem entre si", () => {
    const t = 0;
    for (let i = 0; i < 3; i++) registerFailure("a", RULE, t);
    expect(isAllowed("a", t)).toBe(false);
    expect(isAllowed("b", t)).toBe(true);
  });
});
