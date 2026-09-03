import { admiteSolucao } from "./solver";
import type { MarcacaoParcial, Puzzle } from "./tipos";

export type ValorCelula = string | null;
export type EstadoGrade = Readonly<Record<string, readonly ValorCelula[]>>;

/**
 * Regra de conteúdo ajustável: níveis 1–2 são iniciais, 3 é intermediário e
 * 4–5 são avançados, portanto não exibem a verificação.
 */
export const NIVEIS_COM_VERIFICACAO: readonly Puzzle["nivel"][] = [1, 2, 3];

export const MENSAGEM_SEM_INCOMPATIBILIDADE = "Nenhuma incompatibilidade encontrada até aqui.";

export function verificacaoDisponivel(nivel: Puzzle["nivel"]): boolean {
  return NIVEIS_COM_VERIFICACAO.includes(nivel);
}

export function mensagemVerificacao(nivel: Puzzle["nivel"], temIncompatibilidade: boolean): string {
  if (!temIncompatibilidade) return MENSAGEM_SEM_INCOMPATIBILIDADE;
  return nivel <= 2
    ? "Existe uma incompatibilidade no seu raciocínio. Revise suas conclusões."
    : "Existe pelo menos uma incompatibilidade. Revise antes de continuar.";
}

/** Chave sem delimitadores ambíguos para uma célula visual da grade. */
export function chavePosicaoGrade(categoria: string, posicao: number): string {
  return JSON.stringify([categoria, posicao]);
}

export function criarGradeVazia(puzzle: Puzzle): Record<string, ValorCelula[]> {
  return Object.fromEntries(
    puzzle.categorias.map((categoria) => [categoria.id, Array<ValorCelula>(puzzle.posicoes).fill(null)])
  );
}

/** Retorna todas as células envolvidas em duplicidades e nenhuma outra. */
export function celulasComValorRepetido(grade: EstadoGrade): Set<string> {
  const repetidas = new Set<string>();
  for (const [categoria, valores] of Object.entries(grade)) {
    const posicoesPorValor = new Map<string, number[]>();
    valores.forEach((valor, indice) => {
      if (valor === null) return;
      const posicoes = posicoesPorValor.get(valor) ?? [];
      posicoes.push(indice + 1);
      posicoesPorValor.set(valor, posicoes);
    });
    for (const posicoes of posicoesPorValor.values()) {
      if (posicoes.length < 2) continue;
      posicoes.forEach((posicao) => repetidas.add(chavePosicaoGrade(categoria, posicao)));
    }
  }
  return repetidas;
}

export function paraMarcacaoParcial(grade: EstadoGrade): MarcacaoParcial {
  return Object.entries(grade).flatMap(([categoria, valores]) =>
    valores.flatMap((valor, indice) =>
      valor === null ? [] : [{ categoria, valor, posicao: indice + 1, estado: "confirmado" as const }]
    )
  );
}

export function gradeEstaCorreta(puzzle: Puzzle, grade: EstadoGrade): boolean {
  return puzzle.categorias.every((categoria) => {
    const valores = grade[categoria.id];
    return valores?.length === puzzle.posicoes
      && valores.every((valor, indice) => valor === puzzle.solucao[categoria.id][indice]);
  });
}

/**
 * O estado de informação em que a atribuição foi feita. São três situações, não duas, e
 * distingui-las importa: de um estado já contraditório não se deduz nada de útil, então
 * juntar "marcou sem estar determinado" com "marcou enquanto o próprio estado já era
 * impossível" infla o indicador e leva a fase 6 a ler como exploração o que é persistência
 * numa contradição — ou o contrário.
 */
export type EstadoDaAtribuicao = "determinada" | "ainda-em-aberto" | "estado-ja-contraditorio";

/**
 * Consulta o solver no estado imediatamente anterior à atribuição. A relação está determinada
 * quando o estado ainda admite solução e negar exatamente essa relação torna o problema
 * impossível — ou seja, quando não havia escolha a fazer ali.
 */
export function estadoDaAtribuicao(
  puzzle: Puzzle,
  parcial: MarcacaoParcial,
  categoria: string,
  valor: string,
  posicao: number
): EstadoDaAtribuicao {
  const estadoAnterior = parcial.filter(
    (marcacao) => marcacao.categoria !== categoria || marcacao.posicao !== posicao
  );
  if (!admiteSolucao(puzzle, estadoAnterior)) return "estado-ja-contraditorio";
  const forcada = !admiteSolucao(puzzle, [
    ...estadoAnterior,
    { categoria, valor, posicao, estado: "impossivel" },
  ]);
  return forcada ? "determinada" : "ainda-em-aberto";
}

/** Mantida como atalho de leitura: só "determinada" conta como relação já forçada. */
export function relacaoJaDeterminada(
  puzzle: Puzzle,
  parcial: MarcacaoParcial,
  categoria: string,
  valor: string,
  posicao: number
): boolean {
  return estadoDaAtribuicao(puzzle, parcial, categoria, valor, posicao) === "determinada";
}

export interface RegistroAtribuicao {
  categoria: string;
  valor: string;
  posicao: number;
  momento: number;
  valorAnterior: string | null;
  relacaoJaEstavaLogicamenteDeterminada: boolean;
  /** A terceira situação, que o booleano acima não distingue. */
  estadoDaAtribuicao: EstadoDaAtribuicao;
  revisadaDepois: boolean;
}

export interface ResumoAtribuicoes {
  atribuicoesAntesDeDeterminacao: number;
  dessasMantidas: number;
  dessasRevisadas: number;
  /** Contadas à parte, e NÃO somadas às de cima: são um estado de informação diferente. */
  atribuicoesComEstadoJaContraditorio: number;
}

/**
 * Estes dados são deliberadamente descritivos. Uma marcação única não revela
 * se a pessoa tinha certeza ou se estava testando uma possibilidade; interpretar
 * estado mental a partir dela cabe à profissional, não à interface.
 */
export function resumirAtribuicoes(atribuicoes: readonly RegistroAtribuicao[]): ResumoAtribuicoes {
  const antesDaDeterminacao = atribuicoes.filter(
    (atribuicao) => atribuicao.estadoDaAtribuicao === "ainda-em-aberto"
  );
  const dessasRevisadas = antesDaDeterminacao.filter((atribuicao) => atribuicao.revisadaDepois).length;
  return {
    atribuicoesAntesDeDeterminacao: antesDaDeterminacao.length,
    dessasMantidas: antesDaDeterminacao.length - dessasRevisadas,
    dessasRevisadas,
    atribuicoesComEstadoJaContraditorio: atribuicoes.filter(
      (atribuicao) => atribuicao.estadoDaAtribuicao === "estado-ja-contraditorio"
    ).length,
  };
}

/**
 * Quanto uma tentativa de conclusão incorreta pesa na acurácia. Calibrado contra os limiares
 * reais de `calculateNewDifficulty` (sobe acima de 0,85; desce abaixo de 0,60): UMA tentativa
 * incorreta mantém o nível, porque declarar pronto e depois corrigir é autocorreção e não
 * falha; TRÊS fazem descer, porque aí já é dificuldade de monitoramento, não um deslize.
 */
export const PESO_TENTATIVA_INCORRETA = 0.2;

/**
 * ⚠️ PROVISÓRIO, e proposto pelo VP — não é decisão dela nem do gestor de conteúdo.
 *
 * A tela só deixa concluir com a grade correta, então "acertou o problema" é sempre verdadeiro
 * e uma acurácia fixa em 1 faria a Grade subir de nível em toda sessão e disparar sozinha a
 * conquista de 100% — o mesmo defeito que a Torre teve em 31/ago (`accuracy` alimenta
 * `lib/adaptive.ts`). O que varia entre pacientes é o PROCESSO, e o único sinal de processo
 * que se pode usar aqui sem contrariar decisão já tomada é quantas vezes a pessoa declarou
 * "terminei" com a grade ainda incompatível.
 *
 * Deliberadamente FORA da conta, por decisão dela já registrada: revisar uma atribuição
 * (é monitoramento, não erro), o tempo (rápido ≠ melhor) e o uso de "Verificar raciocínio"
 * (o gestor de conteúdo pediu que fosse REGISTRADO, não penalizado).
 *
 * A medida definitiva sai da fase 6, que precisa ser rediscutida com ela antes de virar código.
 */
export function acuraciaDoProblema(tentativasConcluirIncorretas: number): number {
  return Math.max(0, 1 - PESO_TENTATIVA_INCORRETA * Math.max(0, tentativasConcluirIncorretas));
}
