import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Princípio dela, 23/set: "se eu cliquei já segue" e, sobre a tela de vitória do Restaurante,
// "aqui pode aparecer a mensagem mas não preciso apertar continuar".
//
// A mensagem de resultado PODE existir — é informação. O que não pode é o botão para
// DISPENSÁ-LA: dispensar mensagem não é decisão do paciente, é atrito. E botão que aparece
// só numa fase empurra o conteúdo na tela (foi o tremor do MOT).
//
// A fronteira: resposta que é GESTO ÚNICO ou de QUANTIDADE CONHECIDA confirma sozinha;
// resposta que é CONSTRUÇÃO (montar uma ordem, uma lista, uma conta) mantém o botão.

const DIR = resolve(__dirname, "../components/exercises");
const fontes = () =>
  readdirSync(DIR).filter((sub) => statSync(resolve(DIR, sub)).isDirectory()).flatMap((sub) =>
    readdirSync(resolve(DIR, sub))
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => [`${sub}/${f}`, readFileSync(resolve(DIR, sub, f), "utf-8")] as const));

/** Exercícios cuja resposta é uma CONSTRUÇÃO: o botão de confirmar é legítimo ali. */
const CONSTROEM = [
  "CompraMultifuncional",   // digita uma conta no keypad
  "DesafioOrcamento",       // monta uma lista de compras
  "OrdemHistoria",          // monta a sequência das cenas
  "TorreHanoi",             // move discos até a configuração alvo
  "DesafioSupermercado",    // monta a lista do memorando
  "AntesDepois",            // monta a sequência (e tem "Desfazer")
  "RestauranteOrdem",       // monta a bandeja do pedido
  // Reproduz um padrão espacial aplicando rotação mental. Cabe no "construção" e não no
  // "quantidade conhecida" do MOT: lá a resposta é reconhecimento imediato, aqui ele monta
  // e reorganiza — fechar na última célula marcada frustraria quem ainda está ajustando.
  "PadroesRotacao",
];

describe("o gesto é a confirmação", () => {
  it("nenhum exercício de resposta única tem botão de confirmar", () => {
    const achados: string[] = [];
    for (const [nome, fonte] of fontes()) {
      if (CONSTROEM.some((c) => nome.includes(c))) continue;
      if (/<button[^>]*>\s*\{?\s*["'`]?Confirmar/.test(fonte)) achados.push(`${nome}: botão Confirmar`);
    }
    expect(achados, achados.join("\n")).toEqual([]);
  });

  it("nenhuma tela de resultado tem botão só para dispensar a mensagem", () => {
    // Procura "Continuar" em botão dentro de arquivo de exercício. Sobram só os de
    // navegação de tutorial, que são outra coisa: ali o paciente decide quando começar.
    const achados: string[] = [];
    for (const [nome, fonte] of fontes()) {
      const linhas = fonte.split("\n");
      linhas.forEach((l, i) => {
        if (!/Continuar/.test(l) || !/<button|onClick/.test(l)) return;
        const volta = linhas.slice(Math.max(0, i - 6), i).join(" ");
        if (/tutorial|Tutorial|setStage\("tutorial"\)|instru/.test(volta + l)) return;  // navegação
        achados.push(`${nome}:${i + 1}`);
      });
    }
    expect(achados, `botão de dispensar resultado em:\n${achados.join("\n")}`).toEqual([]);
  });

  it("quem avança sozinho dá tempo de ler", () => {
    // Piso de 2s em toda constante de tempo de leitura: o público inclui pacientes com
    // lentificação, e menos que isso não dá para ler a mensagem.
    for (const [nome, fonte] of fontes()) {
      for (const m of fonte.matchAll(/TEMPO_(?:LEITURA|ACERTO|ERRO)\w*_MS\s*=\s*(\d+)/g)) {
        expect(Number(m[1]), `${nome}: ${m[0]}`).toBeGreaterThanOrEqual(2000);
      }
    }
  });
});
