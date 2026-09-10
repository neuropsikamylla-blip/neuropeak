import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcularIndicadores } from "./indicadores";
import type { MetadataSessaoGrade } from "./sessao";

function fonte(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

// Prova do VP. O risco desta fatia é UM só, e é de escopo: um indicador que comece a decidir.
// A fatia foi separada exatamente para que a calibração venha de dados dela, não de palpite meu.
describe("os indicadores MEDEM e não decidem", () => {
  it("lib/adaptive.ts não conhece os indicadores", () => {
    const adaptive = fonte("lib/adaptive.ts");
    expect(adaptive, "o motor passou a importar os indicadores").not.toMatch(/indicadores/i);
    expect(adaptive, "o motor passou a conhecer a Grade por dentro").not.toMatch(/lib\/grade/);
  });

  it("a seleção de problema não consulta indicador nenhum", () => {
    const banco = fonte("lib/grade/banco.ts");
    expect(banco).not.toMatch(/indicadores|calcularIndicadores/);
  });

  it("a cota de verificação não é tocada por indicador", () => {
    const interacao = fonte("lib/grade/interacao.ts");
    expect(interacao).not.toMatch(/indicadores|calcularIndicadores/);
  });

  it("a acurácia continua vindo só das tentativas de concluir", () => {
    // Se um indicador entrar aqui, a fatia deixou de ser "só medir" sem ninguém anunciar.
    const sessao = fonte("lib/grade/sessao.ts");
    const trecho = sessao.slice(sessao.indexOf("acuracia"), sessao.indexOf("acuracia") + 600);
    expect(trecho).not.toMatch(/indicadores\./);
  });
});

describe("nenhum indicador interpreta a pessoa", () => {
  it("não há termo clínico interpretativo no arquivo", () => {
    const src = fonte("lib/grade/indicadores.ts").toLocaleLowerCase("pt-BR");
    for (const proibido of ["impulsiv", "prematur", "insegur", "ansied", "défic", "defic",
                            "dependênc", "dependenc", "precipit", "fraquez", "prejudicad"]) {
      expect(src, `termo interpretativo: ${proibido}`).not.toContain(proibido);
    }
  });
});

describe("as razões nunca devolvem NaN", () => {
  const vazia: MetadataSessaoGrade = {
    problemas: [], problemasResolvidos: 0, tempoTotal: 0,
    atribuicoesAntesDeDeterminacao: 0, dessasMantidas: 0, dessasRevisadas: 0,
    atribuicoesComEstadoJaContraditorio: 0,
  } as MetadataSessaoGrade;

  it("sessão vazia devolve null, nunca NaN — e null é diferente de zero", () => {
    const i = calcularIndicadores(vazia);
    const numeros = JSON.stringify(i);
    expect(numeros, "apareceu NaN nos indicadores").not.toMatch(/NaN|null,null,null/);
    // A distinção que importa clinicamente: "não tem o indicador" ≠ "o indicador vale 0".
    expect(JSON.parse(numeros)).toBeTruthy();
  });

  it("nenhum campo numérico sai como NaN em nenhuma combinação vazia", () => {
    const varrer = (v: unknown, caminho = ""): void => {
      if (typeof v === "number") expect(Number.isNaN(v), `NaN em ${caminho}`).toBe(false);
      else if (v && typeof v === "object") {
        for (const [k, sub] of Object.entries(v)) varrer(sub, `${caminho}.${k}`);
      }
    };
    varrer(calcularIndicadores(vazia));
  });
});
