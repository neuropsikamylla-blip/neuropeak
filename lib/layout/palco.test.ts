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
      ["Semáforo", "components/exercises/processing/Semaforo.tsx", "compacto"],
      ["Tempo de Reação", "components/exercises/processing/TempoReacao.tsx", "compacto"],
      ["Certo ou Errado", "components/exercises/processing/CertoOuErrado.tsx", "compacto"],
      ["Informação em Foco", "components/exercises/attention/InformacaoEmFoco.tsx", "amplo"],
      ["Compra Multifuncional", "components/exercises/executive/CompraMultifuncional.tsx", "amplo"],
      ["Desafio Cidade", "components/exercises/executive/DesafioCidade.tsx", "amplo"],
      ["Estacionamento Lógico", "components/exercises/executive/EstacionamentoLogico.tsx", "medio"],
      ["Vigilância", "components/exercises/attention/Vigilancia.tsx", "medio"],
      ["Investigadores Sociais", "components/exercises/social/InvestigadoresSociais.tsx", "medio"],
      ["MOT", "components/exercises/attention/MOT.tsx", "amplo"],
      ["Labirinto", "components/exercises/executive/Labirinto.tsx", "amplo"],
    ] as const;

    for (const [name, file, width] of exercises) {
      const exercise = source(file);

      expect(exercise.match(/min-h-screen/g) ?? [], `${name}: min-h-screen não deve reaparecer`).toHaveLength(0);
      expect(exercise.match(/minHeight:\s*["']100vh["']/g) ?? [], `${name}: minHeight 100vh não deve reaparecer`).toHaveLength(0);
      expect(exercise, `${name}: deve usar ExerciseStage`).toContain("ExerciseStage");
      expect(exercise, `${name}: deve usar a largura ${width}`).toContain(`width="${width}"`);
    }
  });

  it("mantém as telas compartilhadas dentro do palco, sem uma viewport extra", () => {
    // O defeito real: tutorial e preparação somavam uma viewport dentro do wrapper. Por isso,
    // toda tela de exercício rolava e mostrava no topo uma faixa do fundo do tema.
    const sharedScreens = [
      ["TutorialBase", "components/exercises/TutorialBase.tsx"],
      ["TutorialRunner", "components/exercises/tutorial/TutorialRunner.tsx"],
      ["PreparationScreen", "components/exercises/PreparationScreen.tsx"],
    ] as const;

    for (const [name, file] of sharedScreens) {
      const screen = source(file);

      expect(screen.match(/min-h-screen/g) ?? [], `${name}: min-h-screen não deve reaparecer`).toHaveLength(0);
      expect(screen, `${name}: deve usar ExerciseStage`).toContain("ExerciseStage");
      expect(screen, `${name}: deve usar a largura compacta`).toContain('width="compacto"');
    }
  });

  it("mantém o flash dinâmico como classe variável no palco", () => {
    // O fundo inteiro é o feedback clínico: uma cor literal em `background` não reage à rodada.
    const dynamicBackgrounds = [
      ["Semáforo", "components/exercises/processing/Semaforo.tsx", "backgroundClassName"],
      ["Tempo de Reação", "components/exercises/processing/TempoReacao.tsx", "bg"],
      ["Certo ou Errado", "components/exercises/processing/CertoOuErrado.tsx", "bg"],
    ] as const;

    for (const [name, file, variable] of dynamicBackgrounds) {
      const exercise = source(file);

      expect(exercise, `${name}: deve passar a classe variável ao palco`)
        .toContain(`backgroundClassName={${variable}}`);
      expect(exercise, `${name}: não pode trocar o flash por uma cor literal`)
        .not.toMatch(/<ExerciseStage[^>]*\bbackground\s*=\s*["']#/);
    }

    const semaforo = source("components/exercises/processing/Semaforo.tsx");
    const tempoReacao = source("components/exercises/processing/TempoReacao.tsx");
    expect(semaforo, "Semáforo: a classe de flash precisa continuar no fundo do palco")
      .toMatch(/const backgroundClassName = `bg-gray-900 transition-colors duration-150 \$\{flashClass\}`/);
    expect(tempoReacao, "Tempo de Reação: o flash de erro precisa continuar compondo o fundo")
      .toMatch(/const bg = `[\s\S]*\$\{missFlash \? "!bg-red-200" : ""\}`/);
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

  it("mede a largura da arena do MOT pelo conteúdo do palco", () => {
    // A janela pode ser mais larga que o palco amplo; usá-la faria a arena transbordar.
    const mot = source("components/exercises/attention/MOT.tsx");
    expect(mot).toContain("contentRef.current?.clientWidth ?? window.innerWidth - PAD_X");
    expect(mot).not.toContain("const availW = Math.min(MAX_W, window.innerWidth - PAD_X)");
  });

  it("mede a largura do Labirinto pelo contêiner do palco", () => {
    // O teto de 600px permanece, mas a largura de partida não pode mais ser a janela.
    const labirinto = source("components/exercises/executive/Labirinto.tsx");
    expect(labirinto).toContain("const mazeWrapRef = useRef<HTMLDivElement>(null)");
    expect(labirinto).toContain("setContainerWidth(container.clientWidth)");
    expect(labirinto).toContain("const containerPx = Math.min(containerWidth - 24, 600)");
    expect(labirinto).not.toContain("window.innerWidth");
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

  it("os fundos decorativos do tutorial cortam o próprio transbordo", () => {
    // O container antigo do TutorialBase tinha overflow-hidden e cortava os blobs que saem da
    // borda (-top-8 -right-8 w-64 h-64). O palco ROLA em vez de cortar, então sem isto a tela
    // de tutorial ganha uma barra de rolagem horizontal por causa de um enfeite.
    const base = source("components/exercises/TutorialBase.tsx");
    for (const nome of ["TechBg", "BeigeBg", "ColorfulBg"]) {
      const inicio = base.indexOf(`function ${nome}()`);
      expect(inicio, `${nome}: o fundo decorativo sumiu do arquivo`).toBeGreaterThan(-1);
      // a PRIMEIRA div depois da assinatura é a raiz do fundo — é ela que tem de cortar
      const raiz = base.slice(inicio).match(/<div className="([^"]*)"/)?.[1] ?? "";
      expect(raiz, `${nome}: a raiz do fundo precisa de overflow-hidden`).toContain("overflow-hidden");
    }
  });

  it("o cubo do Corsi não volta a vazar nem a achatar", () => {
    // Dois defeitos que ela pegou em 28/ago/2026 olhando a tela, com o Cogmed como referência:
    // (1) a face tinha borderRadius, o que abria um vão em cada quina do cubo — e como o cubo é
    // oco, via-se através dele ("quando vira parece que fica transparente");
    // (2) a virada de 80% achatava o cubo numa placa, e o paciente perdia a noção de proporção
    // e de onde a peça estava. A virada de 55% mantém as três faces visíveis.
    const cubo = source("components/exercises/memory/CuboCorsi.tsx");

    // a FACE não pode ter borderRadius (a célula pode, e deve)
    const faceDecl = cubo.slice(cubo.indexOf("const renderFace"), cubo.indexOf("[0,1,2,3].map"));
    expect(faceDecl, "borderRadius voltou à face: as quinas abrem e o cubo vaza")
      .not.toMatch(/borderRadius:\s*Math\.round\(S \* 0\.1\)/);

    // a virada fica em 55% — as três poses juntas
    expect(cubo).toContain('case "top":   return "rotateX(-61deg) rotateY(-17deg)"');
    expect(cubo).toContain('case "left":  return "rotateX(-12deg) rotateY(-17deg)"');
    expect(cubo).toContain('case "right": return "rotateX(-12deg) rotateY(-67deg)"');

    // as três faces têm tons distintos — é o degrau que dá volume ao cubo
    const tons = ["#FFFFFF", "#EDF4FC", "#D8E7F6"];
    for (const tom of tons) {
      expect(cubo, `o tom ${tom} sumiu: sem os três degraus o cubo volta a parecer chapado`)
        .toContain(tom);
    }
  });
});
