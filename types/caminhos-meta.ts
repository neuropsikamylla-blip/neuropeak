// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — estrutura de dados (spec seções 6, 7, 11, 18)
//
// Reformulação do exercício "Sequência Temporal" (exerciseId `antes-depois`).
// NESTA ETAPA só a infraestrutura: tipos + motor de correção + 3 exemplos.
// A tela do paciente e o painel do terapeuta são blocos separados.
//
// Convenção: identificadores em inglês/pt-BR conforme a spec; rótulos/textos em pt-BR.
// ─────────────────────────────────────────────────────────────────────────────

/** Biblioteca de conteúdo — organização no painel do terapeuta; NUNCA exibida ao paciente. */
export type CaminhosBiblioteca = "criancas" | "adolescentes" | "adultos_idosos";

/** Categoria temática da atividade (spec §11). */
export type CaminhosCategoria =
  | "rotina"
  | "escola"
  | "comunidade"
  | "trabalho"
  | "organizacao"
  | "planejamento"
  | "autonomia";

/** Nível de dificuldade 1-8 (spec §7) — NÃO depende só da quantidade de ações. */
export type CaminhosNivel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Modo da atividade (spec §6) — 8 modos. */
export type CaminhosModo =
  | "ordenar"
  | "intruso"
  | "prioridade"
  | "completar"
  | "corrigir"
  | "reorganizar"
  | "problema"
  | "plano_alternativo";

/** Tipo de uma ação dentro da atividade (spec §11). */
export type CaminhosAcaoTipo = "obrigatoria" | "opcional" | "desnecessaria" | "substituta";

/** Tipo de correção (spec §8). */
export type CaminhosCorrecaoTipo = "ordem_exata" | "dependencias";

/** Estado de correção de uma resposta (spec §9). */
export type CaminhosEstado = "correta" | "parcial" | "incorreta";

/** Uma ação (cartão) que o paciente pode ordenar/descartar/selecionar. */
export interface CaminhosAcao {
  /** Id único dentro da atividade. */
  id: string;
  /** Texto exibido no cartão (frase curta, concreta, pt-BR). */
  texto: string;
  /** Papel da ação no plano. */
  tipo: CaminhosAcaoTipo;
  /** Áudio pré-gerado do cartão (opcional). */
  audio?: string;
  /**
   * Posição de referência no plano principal (1-based).
   * Ausente/undefined para ações que NÃO pertencem à ordem principal (ex.: intrusas).
   */
  ordemPrincipal?: number;
}

/**
 * Par de precedência: `antes` deve vir antes de `depois` no plano.
 * Modelado como tupla nomeada para clareza (a spec fala em `precedencias[][]`).
 */
export interface CaminhosPrecedencia {
  antes: string;
  depois: string;
}

/** Regras de correção da atividade (spec §8). */
export interface CaminhosCorrecao {
  /** ordem_exata = posição a posição; dependencias = respeita precedências. */
  tipo: CaminhosCorrecaoTipo;
  /** Ordem principal de referência (ids de ações que compõem o plano). */
  ordemPrincipal: string[];
  /** Pares obrigatórios de precedência (usados em `dependencias`). */
  precedencias: CaminhosPrecedencia[];
  /** Ordens completas alternativas explicitamente aceitas como corretas. */
  ordensAlternativasAceitas: string[][];
  /** Ações que precisam estar presentes no plano. */
  acoesObrigatorias: string[];
  /** Ações que podem estar presentes sem penalizar. */
  acoesOpcionais: string[];
  /** Ações que NÃO devem entrar no plano (intrusas). */
  acoesDesnecessarias: string[];
  /** Pares de ações que não podem coexistir no plano (opcional). */
  acoesIncompativeis?: CaminhosPrecedencia[];
  /** Mínimo de ações corretas para considerar a resposta válida (spec §8). */
  pontuacaoMinima: number;
}

/** Uma dica graduada (spec §16). */
export interface CaminhosDica {
  nivel: 1 | 2 | 3;
  texto: string;
}

/** Textos de feedback (spec §17) — nunca só "certo/errado". */
export interface CaminhosFeedback {
  correto: string;
  parcial: string;
  incorreto: string;
  /** Explicação da lógica do plano (por que a ordem funciona). */
  explicacao: string;
}

/**
 * Bloco de imprevisto/problema (spec §10) — obrigatório nos modos
 * `problema`, `plano_alternativo` e nos níveis 6-8 de `reorganizar`.
 */
export interface CaminhosImprevisto {
  /** Se false, a atividade não usa imprevisto. */
  ativo: boolean;
  /** O que mudou / obstáculo (frase completa, sustentada pelo enunciado). */
  descricao: string;
  /** Recursos que o paciente pode usar na nova estratégia. */
  recursosDisponiveis: string[];
  /** Restrições que a nova estratégia deve respeitar. */
  restricoes: string[];
  /**
   * Ações do plano inicial que DEIXAM de funcionar após a mudança.
   * Escolher uma delas caracteriza perseveração (spec §18).
   */
  acoesQueDevemMudar: string[];
  /** Ids da ação/plano corretos após a mudança. */
  solucaoCorreta: string[];
  /** Soluções alternativas seguras também aceitas. */
  solucoesAlternativasAceitas: string[][];
  /** Explicação da adaptação (feedback de imprevisto, spec §17). */
  explicacao: string;
}

/** Recursos de acessibilidade da atividade (spec §11, §15). */
export interface CaminhosAcessibilidade {
  /** Versão simplificada do texto da meta/instrução. */
  textoSimplificado?: string;
  /** Áudio pré-gerado da meta. */
  audioMeta?: string;
  /** Áudio pré-gerado da instrução. */
  audioInstrucao?: string;
  /** Áudios pré-gerados dos cartões, por id de ação. */
  audioAcoes?: Record<string, string>;
}

/** Uma atividade completa de "Caminhos para a Meta" (spec §11). */
export interface CaminhosAtividade {
  id: string;
  titulo: string;
  biblioteca: CaminhosBiblioteca;
  categoria: CaminhosCategoria;
  nivel: CaminhosNivel;
  modo: CaminhosModo;
  /** Habilidades cognitivas estimuladas (rótulos pt-BR). */
  habilidades: string[];
  /** A meta — sempre visível ao paciente. */
  meta: string;
  /** Instrução principal (uma por vez, frase curta). */
  instrucao: string;
  /** Contexto/enunciado adicional (pode ser vazio). */
  contexto: string;
  /** Ações disponíveis (cartões). */
  acoes: CaminhosAcao[];
  correcao: CaminhosCorrecao;
  /** Exatamente 3 níveis de dica (spec §16). */
  dicas: CaminhosDica[];
  feedback: CaminhosFeedback;
  /** Imprevisto/problema; presente em modos problema/plano_alternativo/reorganizar. */
  imprevisto?: CaminhosImprevisto;
  /** Modo `completar`: id da ação que fica como lacuna (fallback: penúltima). */
  lacunaAcaoId?: string;
  /** Modo `corrigir`: ordem inicial ERRADA apresentada ao paciente (fallback: troca do par central). */
  ordemInicial?: string[];
  acessibilidade: CaminhosAcessibilidade;
  /** Se false, não é oferecida ao paciente (desativada pelo terapeuta). */
  ativo: boolean;
  /** Duração estimada em minutos. */
  duracaoEstimadaMin: number;
}

// ── Resposta do paciente e resultado da correção ────────────────────────────

/** Resposta submetida pelo paciente. */
export interface CaminhosResposta {
  /** Ordem escolhida (ids de ações posicionadas no plano). */
  ordem: string[];
  /** Ações que o paciente mandou para "Não faz parte do plano". */
  descartadas?: string[];
  /** No modo prioridade: ações selecionadas como prioritárias. */
  selecionadas?: string[];
}

/** Resultado da correção de uma resposta (spec §8, §9, §18). */
export interface CaminhosResultado {
  estado: CaminhosEstado;
  /** Precedências obrigatórias respeitadas. */
  relacoesRespeitadas: CaminhosPrecedencia[];
  /** Precedências obrigatórias violadas. */
  relacoesVioladas: CaminhosPrecedencia[];
  /** Ações presentes na ordem mas fora da posição esperada (ordem_exata). */
  acoesForaDoLugar: string[];
  /** Intrusas incluídas indevidamente no plano. */
  intrusasIncluidas: string[];
  /** Intrusas corretamente descartadas / deixadas de fora. */
  intrusasDescartadas: string[];
  /** Obrigatórias que faltaram no plano. */
  obrigatoriasFaltando: string[];
  /** Explicação textual do resultado (para o paciente/terapeuta). */
  detalhe: string;
}

/** Resultado da correção de um imprevisto (spec §10, §18). */
export interface CaminhosResultadoImprevisto {
  estado: CaminhosEstado;
  /** true se a escolha corresponde a uma solução correta/alternativa aceita. */
  correto: boolean;
  /**
   * true se a escolha corresponde ao plano inicial que deixou de funcionar
   * (acoesQueDevemMudar) — erro de perseveração (spec §18).
   */
  perseverou: boolean;
  detalhe: string;
}

// ── Registro de desempenho e indicadores (spec §18) ──────────────────────────

/** Registro de desempenho de UMA execução de atividade (spec §18). */
export interface CaminhosRegistro {
  atividadeId: string;
  modo: CaminhosModo;
  nivel: CaminhosNivel;
  biblioteca: CaminhosBiblioteca;
  /** Estado final da resposta. */
  estado: CaminhosEstado;
  /** Concluiu a atividade (não abandonou). */
  concluida: boolean;
  /** Abandonou antes de concluir. */
  abandonou: boolean;
  // Contagens de seleção/descartes
  obrigatoriasSelecionadas: number;
  opcionaisSelecionadas: number;
  desnecessariasDescartadas: number;
  desnecessariasIncluidas: number;
  // Relações
  relacoesRespeitadas: number;
  relacoesVioladas: number;
  // Manipulação
  trocas: number;
  alteracoes: number;
  tentativas: number;
  // Suporte
  dicasUsadas: number;
  /** Maior nível de dica acionado (0 = nenhuma). */
  nivelDicaMax: 0 | 1 | 2 | 3;
  usouAudio: boolean;
  tempoTotalSeg: number;
  // Acerto
  acertoInicial: boolean;
  acertoAposRevisao: boolean;
  /** Resposta terminou parcial. */
  respostaParcial: boolean;
  // Mudança / imprevisto (spec §18)
  /** Esta execução apresentou uma situação de mudança/imprevisto. */
  mudancaApresentada: boolean;
  /** Adaptou corretamente após a mudança. */
  adaptouAposMudanca: boolean;
  /** Insistiu na estratégia anterior após informação clara de que não funcionava. */
  persistiuEstrategiaAnterior: boolean;
  /** Erro de perseveração caracterizado. */
  erroPerseveracao: boolean;
  /** Resolveu corretamente o problema apresentado. */
  problemaResolvido: boolean;
  // Ações removidas/adicionadas/substituídas após mudança
  acoesRemovidasAposMudanca: number;
  acoesAdicionadasAposMudanca: number;
  acoesSubstituidasAposMudanca: number;
}

/** Os 8 indicadores agregados (0-1 cada) + contagens de perseveração (spec §18). */
export interface CaminhosIndicadores {
  /** 1 — Organização. */
  organizacao: number;
  /** 2 — Sequenciamento. */
  sequenciamento: number;
  /** 3 — Priorização. */
  priorizacao: number;
  /** 4 — Identificação de irrelevantes. */
  identificacaoIrrelevantes: number;
  /** 5 — Resolução de problemas. */
  resolucaoProblemas: number;
  /** 6 — Adaptação após mudança = adaptadas ÷ apresentadas. */
  adaptacaoAposMudanca: number;
  /** 7 — Uso de suporte (dicas/áudio). */
  usoSuporte: number;
  /** 8 — Revisão da própria resposta. */
  revisaoResposta: number;
  /** Nº de situações em que persistiu na estratégia anterior (contagem, spec §18). */
  persistenciaEstrategiaAnterior: number;
  /** Nº de registros considerados na agregação. */
  totalRegistros: number;
}

// ── Configuração do terapeuta (spec §7, §12) ─────────────────────────────────

/** Config manual do terapeuta para uma sessão de treino. */
export interface CaminhosSettings {
  /** Ids das atividades selecionadas, na ordem do treino. */
  atividadesSelecionadas: string[];
  /** Nº de rodadas por atividade. */
  rodadas: number;
  /** Dicas habilitadas. */
  dicasHabilitadas: boolean;
  /** Áudio habilitado. */
  audioHabilitado: boolean;
  /** Máximo de tentativas por atividade. */
  maxTentativas: number;
  /** Permite desfazer. */
  permitirDesfazer: boolean;
  /** Feedback imediato (true) ou só ao final (false). */
  feedbackImediato: boolean;
  /** Ordem das atividades: fixa (true) ou aleatória (false). */
  ordemFixa: boolean;
}
