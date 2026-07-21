// ─────────────────────────────────────────────────────────────────────────────
// Habilidades Sociais — Investigadores da Situação Social
// MODELOS DE DADOS reutilizáveis (Etapa 3).
//
// Estes tipos são a "forma" de toda história. Adicionar centenas de histórias =
// preencher arquivos de dados que satisfaçam `SocialStory` (ver
// data/social-stories/README.md). NENHUMA história, ilustração ou pergunta
// específica vive aqui — só a arquitetura.
//
// Referências: INVESTIGADORES-SOCIAIS-SPEC.md (Etapa 1) e
// INVESTIGADORES-SOCIAIS-BIBLIOTECA-CLINICA.md (Etapa 2).
// ─────────────────────────────────────────────────────────────────────────────

// Domínio provisório enquanto "Habilidades Sociais" não vira um Domain próprio
// (decisão pendente — Etapa 1, Anexo C). Trocar AQUI promove o exercício ao
// novo domínio em todo o app. Deve ser um valor válido de `Domain` em @/types.
export const SOCIAL_PROVISIONAL_DOMAIN = "functional" as const;
export const SOCIAL_EXERCISE_ID = "investigadores-sociais" as const;

// ── Enums controlados (espelham a Biblioteca Clínica) ─────────────────────────
export type FaixaEtaria = "crianca" | "adolescente" | "adulto";
export type NivelSocial = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Eixos sociais (colunas "Eixo" da Biblioteca 6). */
export type EixoSocial = "RE" | "CX" | "TM" | "TP" | "IN" | "JS" | "RS" | "FI" | "RP";

/** Categorias de pergunta (Biblioteca 8). */
export type TipoPergunta =
  | "observacao" | "emocao" | "contexto" | "perspectiva"
  | "regras" | "solucao" | "generalizacao";

/** Formatos de resposta (Etapa 1, §11). */
export type FormatoResposta =
  | "escolhaUnica" | "multiplaSelecao" | "classificar"
  | "ordenar" | "escolherExpressao" | "escala" | "abertaRegistrada";

/** Tipos de erro social para mapear distratores → relatório (Biblioteca 9). */
export type ErroSocialTipo =
  | "egocentrismo" | "super-interpretacao" | "fato-vs-interpretacao"
  | "erro-perspectiva" | "leitura-emocional" | "ignorar-contexto" | "generalizacao";

export const FAIXA_LABEL: Record<FaixaEtaria, string> = {
  crianca: "Crianças", adolescente: "Adolescentes", adulto: "Adultos",
};
export const EIXO_LABEL: Record<EixoSocial, string> = {
  RE: "Reconhecimento emocional", CX: "Leitura de contexto", TM: "Teoria da mente",
  TP: "Tomada de perspectiva", IN: "Inferência", JS: "Julgamento social",
  RS: "Regras sociais", FI: "Fato × interpretação", RP: "Resolução de problema",
};
export const TIPO_LABEL: Record<TipoPergunta, string> = {
  observacao: "Observação", emocao: "Emoções", contexto: "Contexto",
  perspectiva: "Perspectiva", regras: "Regras sociais",
  solucao: "Solução de problemas", generalizacao: "Generalização",
};

// ── Personagem ────────────────────────────────────────────────────────────────
export interface SocialCharacter {
  id: string;           // único na história (referenciado pelas cenas/perguntas)
  nome: string;
  papel?: string;       // papel social (ex.: "colega de turma")
  idade?: number;
  emoji?: string;       // fallback visual enquanto não há ilustração
  imagem?: string;      // ref a asset futuro (não criamos ilustração aqui)
}

// ── Opção de resposta ─────────────────────────────────────────────────────────
export interface SocialOption {
  id: string;
  texto: string;
  correta?: boolean;         // itens pontuáveis marcam a(s) correta(s)
  erroTipo?: ErroSocialTipo; // distratores mapeiam um tipo de erro (Biblioteca 9)
  // Para `classificar`: em qual "balde" a opção deve cair (ex.: "fato" | "interpretacao").
  categoria?: string;
}

// ── Pergunta ──────────────────────────────────────────────────────────────────
// Se `gabarito` estiver AUSENTE, a pergunta é de DISCUSSÃO MEDIADA: registrada
// para o profissional, NUNCA pontuada nem interpretada pelo app.
export interface SocialQuestion {
  id: string;
  tipo: TipoPergunta;
  eixo: EixoSocial;
  enunciado: string;
  formato: FormatoResposta;
  opcoes?: SocialOption[];       // exigido nos formatos de escolha/classificação/ordenação
  gabarito?: string | string[];  // id(s) da(s) opção(ões) correta(s); ausente = mediada
  baldes?: string[];             // rótulos dos grupos no formato "classificar"
  escala?: { min: number; max: number; minLabel?: string; maxLabel?: string };
  dica1?: string;                // andaime nível 1 (qual regra/o que observar)
  dica2?: string;                // andaime nível 2 (qual operação/como pensar)
  notaProfissional?: string;     // orientação de mediação (não exibida ao paciente)
}

// ── Cena ──────────────────────────────────────────────────────────────────────
export interface SocialScene {
  id: string;
  imagem?: string;          // ref a asset ilustrado (placeholder quando ausente)
  descricao: string;        // narração do quadro (texto literal)
  contexto?: string;        // pista de contexto do ambiente/momento
  personagens: string[];    // ids de SocialCharacter presentes na cena
  perguntas: SocialQuestion[];
}

// ── História (unidade de conteúdo) ────────────────────────────────────────────
export interface SocialStory {
  id: string;
  titulo: string;
  faixa: FaixaEtaria;
  nivel: NivelSocial;
  objetivoClinico: string;         // o que a história treina, em linguagem clínica
  habilidadeTreinada: EixoSocial[];// eixos-alvo
  ambiente: { id: string; nome: string }; // ex.: { id: "ENV-001", nome: "Sala de aula" }
  personagens: SocialCharacter[];
  cenas: SocialScene[];
  reflexao?: SocialQuestion[];     // perguntas finais (generalização) — nível "história"
  notasProfissional?: string[];    // notas para o profissional (nível "história")
  meta?: {
    versao: number;
    contemIronia?: boolean;
    ordemToM?: 0 | 1 | 2;
    geradoPorIA?: boolean;
    revisadoPor?: string;
    aprovadoEm?: string;
  };
}

// ── Runtime: respostas do paciente e resultado ────────────────────────────────
// Não fazem parte dos arquivos de dados — são produzidos durante a execução e
// persistidos em Session.metadata.

export interface PatientAnswer {
  questionId: string;
  tipo: TipoPergunta;
  eixo: EixoSocial;
  formato: FormatoResposta;
  value: string | string[] | number | Record<string, string>; // depende do formato
  correta: boolean | null;   // null = item de discussão mediada (não pontua)
  primeira: boolean;         // acertou de primeira (0 tentativas erradas antes)
  tentativas: number;
  tempoMs: number;
  usouDica: boolean;
  erroTipo?: ErroSocialTipo; // quando errou por um distrator mapeado
}

export interface SocialSessionResult {
  storyId: string;
  faixa: FaixaEtaria;
  nivel: NivelSocial;
  answers: PatientAnswer[];
  acuraciaPorEixo: Partial<Record<EixoSocial, number>>;
  acuraciaGlobal: number;    // 0..1 sobre itens pontuáveis
  itensAbertos: PatientAnswer[]; // discussão mediada (registro para o profissional)
  duracaoSeg: number;
}

// Modo de aplicação (config do profissional).
export type ModoAplicacao = "consultorio" | "casa";

export interface SocialSettings {
  faixa?: FaixaEtaria;      // faixa fixada pelo profissional (senão, escolhe na tela)
  modo?: ModoAplicacao;     // consultório = itens de discussão mediada visíveis
  foco?: EixoSocial | "todos";
  cronometro?: boolean;
  tea?: boolean;            // modo com suportes explícitos (pistas nomeadas, sem tempo)
}
