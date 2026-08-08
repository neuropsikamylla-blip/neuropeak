import type { ComponentType } from "react";

export type GuidedOutcome = "correct" | "incorrect";

export interface GuidedAttemptProps {
  onOutcome: (outcome: GuidedOutcome) => void;
}

export interface TutorialDefinition {
  exerciseId: string;
  version: number;

  /**
   * Regra 11 — como este tutorial ensina.
   *  "completa"    (padrão) o sistema executa a atividade toda antes da guiada
   *  "continua"    demonstra QUANDO agir e QUANDO NÃO agir, em tarefas temporizadas
   *  "explicativo" sem demonstração animada; explica a regra e vai para a guiada
   */
  modo?: "completa" | "continua" | "explicativo";

  /**
   * Modo "explicativo": a regra da atividade, uma frase por linha.
   *
   * São LINHAS, não um parágrafo: a regra costuma ter casos ("quando X, faça"; "quando Y, não
   * faça"), e lê-los separados é justamente o que torna a explicação clara. O framework acrescenta
   * sozinho a abertura e o aviso da etapa seguinte — a definição fornece só as regras.
   */
  explicacao?: string[];

  Demonstration: ComponentType<{ onDone: () => void }>;
  GuidedAttempt: ComponentType<GuidedAttemptProps>;
  retryHint: string;
  /**
   * Regra 4 da T1: o texto da tentativa guiada, com o VERBO do gesto real deste exercício
   * (clique · arraste · selecione · digite · responda).
   *
   * É obrigatório e vive na definição, não no runner: o gesto muda de exercício para exercício, e
   * um texto genérico no runner seria exatamente a fórmula proibida ("use o teclado", "toque na
   * tela"). O runner mantém o selo e o título — só a instrução é de quem conhece a mecânica.
   */
  guidedInstruction: string;

  /**
   * Regra 1 da T1: texto da demonstração. Omitir usa o padrão do framework
   * ("Observe como funciona a atividade."). Só preencha quando a mecânica realmente exigir, e
   * seguindo o mesmo padrão de linguagem — imperativo, uma frase, sem estratégia cognitiva.
   */
  demonstrationHint?: string;

  /**
   * A menor unidade válida da mecânica clínica DESTE exercício — a carga em que a tarefa ainda
   * existe como tarefa, um degrau abaixo do qual ela deixaria de ser o exercício.
   *
   * Deve ser **derivada da própria mecânica**, nunca escrita como número solto: no Span é
   * `digitsForLevel(MIN_LEVEL)`; noutro exercício será a menor grade, o menor conjunto de alvos,
   * o menor número de passos. Assim, se a escada clínica mudar, a tentativa guiada acompanha
   * sozinha — e nenhuma conversão futura precisa escolher um valor à mão.
   */
  smallestValidUnit: number;
}
