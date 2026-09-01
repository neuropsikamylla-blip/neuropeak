import { describe, expect, it } from "vitest";
import { contarReversoes, type MovimentoTorre } from "./torres-registro";

describe("registro comportamental da Torre de Hanói", () => {
  it("conta exatamente três reversões, mesmo com movimentos de outros discos no intervalo", () => {
    const movimentos: MovimentoTorre[] = [
      { disco: 1, de: 0, para: 1 },
      { disco: 2, de: 0, para: 2 },
      { disco: 1, de: 1, para: 0 },
      { disco: 1, de: 0, para: 2 },
      { disco: 1, de: 2, para: 0 },
      { disco: 2, de: 2, para: 0 },
    ];

    expect(contarReversoes(movimentos)).toBe(3);
  });

  it("não conta reversão quando não há retorno à haste anterior", () => {
    const movimentos: MovimentoTorre[] = [
      { disco: 1, de: 0, para: 2 },
      { disco: 2, de: 0, para: 1 },
      { disco: 1, de: 2, para: 1 },
      { disco: 3, de: 0, para: 2 },
    ];

    expect(contarReversoes(movimentos)).toBe(0);
  });

  it("não conta volta à origem após outro movimento do mesmo disco", () => {
    const movimentos: MovimentoTorre[] = [
      { disco: 1, de: 0, para: 1 },
      { disco: 1, de: 1, para: 2 },
      { disco: 1, de: 2, para: 0 },
    ];

    expect(contarReversoes(movimentos)).toBe(0);
  });
});
