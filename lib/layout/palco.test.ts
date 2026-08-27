import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LARGURAS_PALCO } from "@/lib/layout/palco";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

describe("palco padrão dos exercícios", () => {
  const stage = source("components/exercises/ExerciseStage.tsx");

  it("não volta a somar uma viewport inteira dentro do wrapper", () => {
    // Impede a rolagem extra de 32px e a faixa do fundo do tema nas bordas, causadas por
    // um filho com altura de viewport dentro do wrapper que já mede uma viewport.
    expect(stage.match(/min-h-screen/g) ?? []).toHaveLength(0);
  });

  it("mantém os tetos de largura definidos para cada tipo de peça", () => {
    // Impede que uma arena, grade ou peça compacta herde um teto incorreto e mude de escala.
    expect(LARGURAS_PALCO).toEqual({ compacto: 640, medio: 960, amplo: 1280 });
  });

  it("cobre o wrapper com um palco absoluto rolável", () => {
    // Impede que trocar o palco por fluxo normal devolva a rolagem de 32px e a faixa no topo.
    // Sem aspas na comparação: o palco ganhou `backgroundClassName` no lote D1 e o className
    // virou template string. O que precisa ser protegido é o posicionamento, não a sintaxe.
    expect(stage).toContain("absolute inset-0 overflow-auto");
    expect(stage, "o palco não pode virar fixed nem relative").not.toMatch(/className=\{?[`"]fixed inset-0/);
  });

  it("mantém os exercícios migrados centralizados no palco", () => {
    // Impede que a tela volte a ficar colada no topo e que a faixa de fundo do tema reapareça nas bordas.
    const exercises = [
      ["Padrões com Rotação", "components/exercises/memory/PadroesRotacao.tsx", "medio"],
      ["Cubo Corsi", "components/exercises/memory/CuboCorsi.tsx", "medio"],
      ["Torre de Hanói", "components/exercises/executive/TorreHanoi.tsx", "medio"],
      ["Grade Dedutiva", "components/exercises/executive/DeductiveGrid.tsx", "medio"],
      ["Jogo da Memória", "components/exercises/memory/JogoMemoria.tsx", "medio"],
      ["Matriz Espacial", "components/exercises/memory/MatrizEspacial.tsx", "medio"],
      ["Span Numérico", "components/exercises/memory/SpanNumerico.tsx", "compacto"],
      ["Letras Sequência", "components/exercises/memory/LetrasSequencia.tsx", "compacto"],
      ["Lista c/ Distração", "components/exercises/memory/ListaDistracao.tsx", "compacto"],
      ["Sequência de Itens", "components/exercises/memory/SequenciaItens.tsx", "compacto"],
      ["Stroop", "components/exercises/executive/StroopTask.tsx", "compacto"],
      ["Task Switching", "components/exercises/executive/TaskSwitching.tsx", "compacto"],
      ["Desafio Orçamento", "components/exercises/executive/DesafioOrcamento.tsx", "compacto"],
      ["Identificação de Símbolos", "components/exercises/processing/IdentificacaoSimbolos.tsx", "compacto"],
      ["Caça Item", "components/exercises/attention/CacaItemBarato.tsx", "medio"],
      ["Dupla Tarefa", "components/exercises/attention/DualTask.tsx", "medio"],
      ["Trilha Visual", "components/exercises/attention/TrilhaVisual.tsx", "medio"],
      ["Mudança de Regras", "components/exercises/executive/MudancaRegras.tsx", "medio"],
      ["Busca Rápida", "components/exercises/processing/CorridaContraOTempo.tsx", "amplo"],
    ] as const;

    for (const [name, file, width] of exercises) {
      const exercise = source(file);

      expect(exercise.match(/min-h-screen/g) ?? [], `${name}: min-h-screen não deve reaparecer`).toHaveLength(0);
      expect(exercise.match(/minHeight:\s*["']100vh["']/g) ?? [], `${name}: minHeight 100vh não deve reaparecer`).toHaveLength(0);
      expect(exercise, `${name}: deve usar ExerciseStage`).toContain("ExerciseStage");
      expect(exercise, `${name}: deve usar a largura ${width}`).toContain(`width="${width}"`);
    }
  });

  it("não inicia a rodada zero antes da medição da arena", () => {
    // Impede as bolas da primeira rodada de nascerem amontoadas no canto superior esquerdo
    // ao sortear com as dimensões iniciais de 320px antes de a tela ser medida.
    const mot = source("components/exercises/attention/MOT.tsx");
    const initialRoundInEmptyEffect =
      /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\bstartRound\s*\(\s*0\s*\)[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/g;

    expect(mot.match(initialRoundInEmptyEffect) ?? []).toHaveLength(0);
  });

  it("só libera a rodada zero na medição assentada, não na primeira passada", () => {
    // Impede uma variante mais sutil do mesmo defeito: se o sinal de "já medi" for dado na
    // primeira medição, a arena ainda pode mudar depois (fontes assentando a altura do
    // cabeçalho) e as bolas ficam de novo fora do quadro desenhado — só que discretamente.
    const mot = source("components/exercises/attention/MOT.tsx");
    expect(mot).toContain("setTimeout(() => { compute(); setHasMeasured(true); }, 120)");
    // E o sinal existe UMA vez só: dois pontos de liberação trazem o sorteio adiantado de volta.
    expect(mot.match(/setHasMeasured\(true\)/g) ?? []).toHaveLength(1);
  });

  it("os exercícios com fundo por tema não trocam o gradiente por uma cor fixa", () => {
    // Regressão real, pega na revisão do lote A (27/ago/2026): a migração ao palco apagou o
    // rootBg do Jogo da Memória — três gradientes, um por tema do paciente — e passou um
    // "#ffffff" fixo. O exercício perdia o tema. Vale para todo arquivo que define rootBg.
    const comTema = [
      ["Jogo da Memória", "components/exercises/memory/JogoMemoria.tsx"],
      ["Matriz Espacial", "components/exercises/memory/MatrizEspacial.tsx"],
      ["Grade Dedutiva", "components/exercises/executive/DeductiveGrid.tsx"],
    ] as const;

    for (const [nome, file] of comTema) {
      const src = source(file);
      expect(src, `${nome}: rootBg sumiu do arquivo`).toMatch(/const rootBg/);
      expect(src, `${nome}: o palco tem de receber o rootBg, não uma cor literal`)
        .toContain("background={rootBg.background as string}");
    }
  });
});
