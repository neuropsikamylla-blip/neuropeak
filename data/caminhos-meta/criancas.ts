// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — BIBLIOTECA CRIANÇAS (cm_c01..cm_c30).
//
// 30 atividades definitivas (spec CAMINHOS-ATIVIDADES-ETAPA2, seção "BIBLIOTECA
// CRIANÇAS"). Conteúdo é a fonte da verdade; a tela (CaminhosMeta.tsx) apenas
// consome estes dados. Frases curtas, concretas, pt-BR, sem imagens (spec §14),
// conteúdo seguro (spec §20). Todas passam em validarAtividade (lib/caminhos-meta).
//
// Mapeamento de modos (spec): organizar→ordenar · ação desnecessária→intruso ·
// escolher prioridades→prioridade · completar→completar · corrigir ordem→corrigir ·
// reorganizar→reorganizar · resolver imprevisto→problema · plano alternativo→
// plano_alternativo. Categoria textual → união fechada mais próxima do type.
//
// Nota de encode:
//  - Modos com imprevisto (problema/plano_alternativo/reorganizar nos níveis 6-8):
//    a fase 2 monta as opções a partir de solucaoCorreta + acoesQueDevemMudar +
//    ações do acervo com tipo "substituta". Por isso as opções incorretas do
//    imprevisto são cadastradas como ações tipo "substituta" (fora da ordemPrincipal).
//  - Modo prioridade não usa ordem: as ações NÃO recebem ordemPrincipal; o limite
//    de seleção é derivado das settings (limitePrioridade, default 3). As essenciais
//    ficam em acoesObrigatorias, as opcionais em acoesOpcionais e a irrelevante em
//    acoesDesnecessarias. correcao.ordemPrincipal lista as essenciais (consistência).
// ─────────────────────────────────────────────────────────────────────────────

import type { CaminhosAtividade } from "@/types/caminhos-meta";

// ── C01 · N1 · ordenar · ordem_exata ─────────────────────────────────────────
const c01: CaminhosAtividade = {
  id: "cm_c01",
  titulo: "Guardar os materiais de escrita",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Guardar os materiais de escrita depois de uma atividade.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você terminou uma atividade e vai guardar os materiais.",
  acoes: [
    { id: "a1", texto: "Juntar os lápis e as canetas.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Colocar os materiais no estojo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Fechar o estojo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Guardar o estojo no lugar.", tipo: "obrigatoria", ordemPrincipal: 4 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para guardar tudo." },
    { nivel: 2, texto: "Você só pode fechar o estojo depois de colocar os materiais dentro." },
    { nivel: 3, texto: "Comece juntando os lápis e as canetas." },
  ],
  feedback: {
    correto: "Boa organização. Você juntou, guardou no estojo, fechou e só então guardou no lugar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fechar o estojo.",
    explicacao: "Primeiro você junta os materiais, depois coloca no estojo, fecha e por fim guarda no lugar.",
  },
  acessibilidade: {
    textoSimplificado: "Junte, coloque no estojo, feche e guarde no lugar.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// ── C02 · N1 · ordenar · ordem_exata ─────────────────────────────────────────
const c02: CaminhosAtividade = {
  id: "cm_c02",
  titulo: "Guardar um jogo de tabuleiro",
  biblioteca: "criancas",
  categoria: "organizacao",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Guardar corretamente um jogo depois de brincar.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você terminou de brincar e vai guardar o jogo.",
  acoes: [
    { id: "a1", texto: "Juntar todas as peças.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Conferir se nenhuma peça ficou na mesa.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar as peças dentro da caixa.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Fechar a caixa.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar a caixa no lugar.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para guardar o jogo." },
    { nivel: 2, texto: "Só dá para fechar a caixa depois de colocar as peças dentro." },
    { nivel: 3, texto: "Comece juntando todas as peças." },
  ],
  feedback: {
    correto: "Boa organização. Você conferiu as peças antes de guardar e não deixou nada para trás.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fechar a caixa.",
    explicacao: "Você junta as peças, confere a mesa, guarda na caixa, fecha e por fim guarda no lugar.",
  },
  acessibilidade: {
    textoSimplificado: "Junte as peças, confira a mesa, guarde na caixa, feche e guarde.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// ── C03 · N1 · ordenar · ordem_exata ─────────────────────────────────────────
const c03: CaminhosAtividade = {
  id: "cm_c03",
  titulo: "Organizar os livros usados",
  biblioteca: "criancas",
  categoria: "organizacao",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Guardar os livros utilizados durante uma atividade.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você usou alguns livros e vai guardá-los.",
  acoes: [
    { id: "a1", texto: "Juntar os livros usados.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Fechar os livros.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Levar os livros até a estante.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Colocar os livros no lugar indicado.", tipo: "obrigatoria", ordemPrincipal: 4 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para guardar os livros." },
    { nivel: 2, texto: "Você leva os livros até a estante antes de colocá-los no lugar." },
    { nivel: 3, texto: "Comece juntando os livros usados." },
  ],
  feedback: {
    correto: "Boa organização. Você juntou, fechou, levou e guardou os livros no lugar certo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de guardar na estante.",
    explicacao: "Você junta os livros, fecha, leva até a estante e coloca no lugar indicado.",
  },
  acessibilidade: {
    textoSimplificado: "Junte, feche, leve à estante e guarde os livros.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// ── C04 · N1 · ordenar · dependencias ────────────────────────────────────────
const c04: CaminhosAtividade = {
  id: "cm_c04",
  titulo: "Preparar o material de desenho",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "planejamento"],
  meta: "Preparar os materiais para fazer um desenho.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai desenhar e precisa preparar os materiais primeiro.",
  acoes: [
    { id: "a1", texto: "Escolher a folha de papel.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Pegar os lápis de cor.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar os materiais sobre a mesa.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Começar o desenho.", tipo: "obrigatoria", ordemPrincipal: 4 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a4" },
      { antes: "a2", depois: "a4" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [
      ["a2", "a1", "a3", "a4"],
      ["a1", "a3", "a2", "a4"],
      ["a2", "a3", "a1", "a4"],
      ["a3", "a1", "a2", "a4"],
    ],
    acoesObrigatorias: ["a1", "a2", "a3", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa estar pronto antes de desenhar." },
    { nivel: 2, texto: "Você só começa o desenho depois de reunir a folha e os lápis." },
    { nivel: 3, texto: "Deixe a ação de começar o desenho por último." },
  ],
  feedback: {
    correto: "Boa organização. Você reuniu tudo antes de começar o desenho.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Comece a desenhar só depois de reunir os materiais.",
    explicacao: "Escolher a folha, pegar os lápis e deixar tudo na mesa vêm antes de começar o desenho.",
  },
  acessibilidade: {
    textoSimplificado: "Reúna folha e lápis na mesa e só então comece a desenhar.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// ── C05 · N1 · ordenar · ordem_exata ─────────────────────────────────────────
const c05: CaminhosAtividade = {
  id: "cm_c05",
  titulo: "Regar uma planta",
  biblioteca: "criancas",
  categoria: "rotina",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Regar uma planta e guardar os materiais.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai cuidar de uma planta.",
  acoes: [
    { id: "a1", texto: "Pegar o regador.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Colocar água no regador.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Levar o regador até a planta.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Regar a planta.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar o regador.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para regar a planta." },
    { nivel: 2, texto: "Você precisa de água no regador antes de levá-lo até a planta." },
    { nivel: 3, texto: "Comece pegando o regador." },
  ],
  feedback: {
    correto: "Boa organização. Você encheu o regador antes de regar e guardou tudo no fim.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de regar.",
    explicacao: "Você pega o regador, coloca água, leva até a planta, rega e por fim guarda o regador.",
  },
  acessibilidade: {
    textoSimplificado: "Pegue o regador, coloque água, regue a planta e guarde.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// ── C06 · N2 · ordenar · ordem_exata ─────────────────────────────────────────
const c06: CaminhosAtividade = {
  id: "cm_c06",
  titulo: "Lavar as mãos",
  biblioteca: "criancas",
  categoria: "rotina",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento", "autocuidado"],
  meta: "Lavar e secar as mãos.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai lavar as mãos antes de uma atividade.",
  acoes: [
    { id: "a1", texto: "Abrir a torneira.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Molhar as mãos.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar sabonete.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Esfregar as mãos.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Enxaguar as mãos.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Fechar a torneira.", tipo: "obrigatoria", ordemPrincipal: 6 },
    { id: "a7", texto: "Secar as mãos.", tipo: "obrigatoria", ordemPrincipal: 7 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5", "a6", "a7"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
      { antes: "a5", depois: "a6" },
      { antes: "a6", depois: "a7" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5", "a6", "a7"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 7,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para lavar as mãos." },
    { nivel: 2, texto: "Você coloca sabonete depois de molhar as mãos." },
    { nivel: 3, texto: "Comece abrindo a torneira." },
  ],
  feedback: {
    correto: "Boa organização. Você seguiu a ordem certa e fechou a torneira antes de secar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de esfregar as mãos.",
    explicacao: "Você abre a torneira, molha, ensaboa, esfrega, enxágua, fecha a torneira e seca.",
  },
  acessibilidade: {
    textoSimplificado: "Abra a torneira, molhe, ensaboe, enxágue, feche e seque.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C07 · N2 · ordenar · ordem_exata ─────────────────────────────────────────
const c07: CaminhosAtividade = {
  id: "cm_c07",
  titulo: "Preparar a mochila",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "planejamento"],
  meta: "Preparar a mochila para o próximo dia de aula.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Amanhã tem aula e você vai deixar a mochila pronta hoje.",
  acoes: [
    { id: "a1", texto: "Verificar quais atividades haverá.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar os materiais necessários.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar os materiais na mochila.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Conferir se está faltando alguma coisa.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Fechar a mochila.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa saber antes de escolher os materiais." },
    { nivel: 2, texto: "Você separa os materiais depois de ver quais atividades terá." },
    { nivel: 3, texto: "Comece verificando quais atividades haverá." },
  ],
  feedback: {
    correto: "Boa organização. Você separou o que precisava e conferiu antes de fechar a mochila.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fechar a mochila.",
    explicacao: "Você verifica as atividades, separa os materiais, guarda na mochila, confere e fecha.",
  },
  acessibilidade: {
    textoSimplificado: "Veja as atividades, separe, guarde, confira e feche a mochila.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C08 · N2 · ordenar · ordem_exata ─────────────────────────────────────────
const c08: CaminhosAtividade = {
  id: "cm_c08",
  titulo: "Fazer uma tarefa escolar",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "planejamento", "autonomia"],
  meta: "Realizar e guardar uma tarefa escolar.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você recebeu uma tarefa da escola.",
  acoes: [
    { id: "a1", texto: "Ler a instrução da tarefa.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar os materiais necessários.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Fazer a atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Revisar as respostas.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar a tarefa no local indicado.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para fazer a tarefa." },
    { nivel: 2, texto: "Você lê a instrução antes de separar os materiais." },
    { nivel: 3, texto: "Comece lendo a instrução da tarefa." },
  ],
  feedback: {
    correto: "Boa organização. Você entendeu a tarefa, fez, revisou e guardou no lugar certo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fazer a atividade.",
    explicacao: "Você lê a instrução, separa os materiais, faz, revisa e guarda a tarefa.",
  },
  acessibilidade: {
    textoSimplificado: "Leia, separe, faça, revise e guarde a tarefa.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C09 · N2 · ordenar · ordem_exata ─────────────────────────────────────────
const c09: CaminhosAtividade = {
  id: "cm_c09",
  titulo: "Preparar um lanche frio",
  biblioteca: "criancas",
  categoria: "rotina",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "autonomia", "sequenciamento"],
  meta: "Preparar um lanche que não precisa de fogão ou forno.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai preparar um lanche frio, sem usar fogão nem forno.",
  acoes: [
    { id: "a1", texto: "Lavar as mãos.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar o prato e os ingredientes.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Montar o lanche.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Colocar o lanche no prato.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar os ingredientes restantes.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para preparar o lanche." },
    { nivel: 2, texto: "Você separa o prato e os ingredientes antes de montar o lanche." },
    { nivel: 3, texto: "Comece lavando as mãos." },
  ],
  feedback: {
    correto: "Boa organização. Você lavou as mãos, montou o lanche e guardou o que sobrou.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de montar o lanche.",
    explicacao: "Você lava as mãos, separa prato e ingredientes, monta, coloca no prato e guarda o resto.",
  },
  acessibilidade: {
    textoSimplificado: "Lave as mãos, separe, monte, sirva e guarde o que sobrou.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C10 · N2 · ordenar · ordem_exata ─────────────────────────────────────────
const c10: CaminhosAtividade = {
  id: "cm_c10",
  titulo: "Entrar em uma aula on-line",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "planejamento", "autonomia"],
  meta: "Entrar em uma aula on-line no horário correto.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você tem uma aula on-line hoje.",
  acoes: [
    { id: "a1", texto: "Verificar o horário da aula.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Ligar o dispositivo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Abrir o aplicativo indicado.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Selecionar a atividade.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Entrar na aula.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para entrar na aula." },
    { nivel: 2, texto: "Você abre o aplicativo depois de ligar o dispositivo." },
    { nivel: 3, texto: "Comece verificando o horário da aula." },
  ],
  feedback: {
    correto: "Boa organização. Você conferiu o horário e abriu o aplicativo antes de entrar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de entrar na aula.",
    explicacao: "Você verifica o horário, liga o dispositivo, abre o aplicativo, seleciona a atividade e entra.",
  },
  acessibilidade: {
    textoSimplificado: "Veja o horário, ligue, abra o aplicativo, selecione e entre.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C11 · N3 · intruso · dependencias + intrusa ──────────────────────────────
const c11: CaminhosAtividade = {
  id: "cm_c11",
  titulo: "Guardar os brinquedos",
  biblioteca: "criancas",
  categoria: "organizacao",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "sequenciamento"],
  meta: "Guardar os brinquedos depois de brincar.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você terminou de brincar e vai guardar os brinquedos.",
  acoes: [
    { id: "a1", texto: "Juntar os brinquedos.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar os brinquedos por tipo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar os brinquedos nas caixas.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Guardar as caixas no lugar.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Começar a assistir a um vídeo.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a5"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que ajuda a guardar os brinquedos e no que atrapalha." },
    { nivel: 2, texto: "Você separa por tipo antes de colocar nas caixas." },
    { nivel: 3, texto: "Comece juntando os brinquedos. Assistir a um vídeo não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você separou os brinquedos e deixou de fora a ação que não ajudava.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação ou o que deixou de fora.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de guardar as caixas.",
    explicacao: "Você junta, separa por tipo, coloca nas caixas e guarda. Assistir a um vídeo não guarda os brinquedos.",
  },
  acessibilidade: {
    textoSimplificado: "Junte, separe por tipo e guarde. Assistir a vídeo fica de fora.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C12 · N3 · intruso · dependencias + intrusa ──────────────────────────────
const c12: CaminhosAtividade = {
  id: "cm_c12",
  titulo: "Preparar uma atividade de leitura",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "sequenciamento"],
  meta: "Preparar-se para ler um livro.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai ler um livro.",
  acoes: [
    { id: "a1", texto: "Escolher o livro.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Sentar-se em um local adequado.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Abrir o livro.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Começar a leitura.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Abrir um jogo no celular.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a5"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que ajuda a começar a leitura e no que atrapalha." },
    { nivel: 2, texto: "Você abre o livro depois de se sentar em um local adequado." },
    { nivel: 3, texto: "Comece escolhendo o livro. Abrir um jogo no celular não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você se preparou para ler e deixou de fora a ação que distraía.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação ou o que deixou de fora.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de começar a leitura.",
    explicacao: "Você escolhe o livro, senta, abre e começa a ler. Abrir um jogo no celular atrapalha a leitura.",
  },
  acessibilidade: {
    textoSimplificado: "Escolha o livro, sente, abra e leia. O jogo no celular fica de fora.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C13 · N3 · intruso · ordem_exata + intrusa ───────────────────────────────
const c13: CaminhosAtividade = {
  id: "cm_c13",
  titulo: "Preparar o material para uma aula",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "planejamento"],
  meta: "Separar os materiais pedidos pelo professor.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "O professor pediu alguns materiais para a próxima aula.",
  acoes: [
    { id: "a1", texto: "Ler a lista de materiais.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Procurar os materiais.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar os materiais sobre a mesa.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Conferir a lista.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar os materiais na mochila.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Colocar um brinquedo que não foi pedido.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a6"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que o professor pediu e no que não faz parte da lista." },
    { nivel: 2, texto: "Você confere a lista antes de guardar na mochila." },
    { nivel: 3, texto: "Comece lendo a lista de materiais. O brinquedo que não foi pedido fica de fora." },
  ],
  feedback: {
    correto: "Boa organização. Você separou só o que foi pedido e deixou o brinquedo de fora.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação ou o que deixou de fora.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de guardar na mochila.",
    explicacao: "Você lê a lista, procura, deixa na mesa, confere e guarda. O brinquedo não pedido não faz parte.",
  },
  acessibilidade: {
    textoSimplificado: "Leia a lista, separe, confira e guarde. O brinquedo fica de fora.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C14 · N3 · intruso · dependencias + intrusa ──────────────────────────────
const c14: CaminhosAtividade = {
  id: "cm_c14",
  titulo: "Montar um quebra-cabeça",
  biblioteca: "criancas",
  categoria: "organizacao",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "planejamento"],
  meta: "Organizar o espaço e montar um quebra-cabeça.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai montar um quebra-cabeça.",
  acoes: [
    { id: "a1", texto: "Abrir a caixa.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar as peças.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Procurar peças que combinam.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Montar o quebra-cabeça.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Guardar as peças depois da atividade.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Esconder algumas peças.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a6"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que ajuda a montar o quebra-cabeça e no que atrapalha." },
    { nivel: 2, texto: "Você procura as peças que combinam antes de montar." },
    { nivel: 3, texto: "Comece abrindo a caixa. Esconder peças não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você preparou as peças, montou e guardou. Esconder peças ficou de fora.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação ou o que deixou de fora.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de montar.",
    explicacao: "Você abre a caixa, separa, procura peças que combinam, monta e guarda. Esconder peças atrapalha.",
  },
  acessibilidade: {
    textoSimplificado: "Abra, separe, encaixe, monte e guarde. Esconder peças fica de fora.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C15 · N3 · intruso · dependencias + intrusa ──────────────────────────────
const c15: CaminhosAtividade = {
  id: "cm_c15",
  titulo: "Preparar a mochila sem distrações",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "planejamento"],
  meta: "Preparar a mochila somente com itens relacionados à aula.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai preparar a mochila para a aula de amanhã.",
  acoes: [
    { id: "a1", texto: "Conferir o horário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar os cadernos.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar o estojo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Colocar a garrafa de água.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Fechar a mochila.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Colocar um prato usado dentro da mochila.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a5" },
      { antes: "a3", depois: "a5" },
      { antes: "a4", depois: "a5" },
    ],
    ordensAlternativasAceitas: [
      ["a1", "a2", "a4", "a3", "a5"],
      ["a1", "a3", "a2", "a4", "a5"],
      ["a1", "a4", "a2", "a3", "a5"],
    ],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a6"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que pertence à aula e no que não deve entrar na mochila." },
    { nivel: 2, texto: "Fechar a mochila é sempre a última ação." },
    { nivel: 3, texto: "Comece conferindo o horário. O prato usado não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você guardou só o que era da aula e fechou por último.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação ou o que deixou de fora.",
    incorreto: "Essa ordem cria uma dificuldade. Lembre-se de fechar a mochila só no fim.",
    explicacao: "Você confere o horário, guarda cadernos, estojo e garrafa, e fecha por último. O prato usado não é da aula.",
  },
  acessibilidade: {
    textoSimplificado: "Guarde só o que é da aula e feche por último. O prato fica de fora.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C16 · N4 · prioridade ────────────────────────────────────────────────────
const c16: CaminhosAtividade = {
  id: "cm_c16",
  titulo: "Cinco minutos para sair para a escola",
  biblioteca: "criancas",
  categoria: "rotina",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "planejamento", "controle inibitório"],
  meta: "Escolher as três ações mais importantes antes de sair para a escola.",
  instrucao: "Escolha as três ações que devem ser feitas primeiro.",
  contexto: "Faltam cinco minutos para sair para a escola.",
  acoes: [
    { id: "e1", texto: "Colocar os materiais na mochila.", tipo: "obrigatoria" },
    { id: "e2", texto: "Pegar o estojo.", tipo: "obrigatoria" },
    { id: "e3", texto: "Pegar a garrafa de água.", tipo: "obrigatoria" },
    { id: "o1", texto: "Escolher um adesivo para o caderno.", tipo: "opcional" },
    { id: "o2", texto: "Organizar novamente todos os livros da estante.", tipo: "opcional" },
    { id: "d1", texto: "Começar a assistir a um filme.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["e1", "e2", "e3"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["e1", "e2", "e3"],
    acoesOpcionais: ["o1", "o2"],
    acoesDesnecessarias: ["d1"],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você não pode deixar de levar para a escola." },
    { nivel: 2, texto: "Escolher um adesivo ou reorganizar a estante pode esperar." },
    { nivel: 3, texto: "Levar os materiais na mochila é uma das ações essenciais." },
  ],
  feedback: {
    correto: "Boa escolha. Você priorizou o que precisa levar e deixou o resto para depois.",
    parcial: "Você escolheu quase certo. Reveja se falta uma ação essencial ou se entrou uma que pode esperar.",
    incorreto: "Reconsidere. Escolha o que você realmente precisa levar antes de sair.",
    explicacao: "Levar materiais, estojo e garrafa é o essencial para a aula. Adesivo, estante e filme podem esperar.",
  },
  acessibilidade: {
    textoSimplificado: "Escolha as 3 ações mais importantes antes de sair.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C17 · N4 · prioridade ────────────────────────────────────────────────────
const c17: CaminhosAtividade = {
  id: "cm_c17",
  titulo: "Começar a tarefa de casa",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "planejamento", "controle inibitório"],
  meta: "Escolher as ações mais importantes para começar a tarefa.",
  instrucao: "Escolha as três ações que devem ser feitas primeiro.",
  contexto: "Você vai começar a tarefa de casa.",
  acoes: [
    { id: "e1", texto: "Ler a atividade.", tipo: "obrigatoria" },
    { id: "e2", texto: "Separar os materiais.", tipo: "obrigatoria" },
    { id: "e3", texto: "Colocar o dispositivo em modo silencioso.", tipo: "obrigatoria" },
    { id: "o1", texto: "Escolher a cor da caneta.", tipo: "opcional" },
    { id: "o2", texto: "Organizar todos os objetos do quarto.", tipo: "opcional" },
    { id: "d1", texto: "Abrir um jogo antes de começar.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["e1", "e2", "e3"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["e1", "e2", "e3"],
    acoesOpcionais: ["o1", "o2"],
    acoesDesnecessarias: ["d1"],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que ajuda você a começar a tarefa com atenção." },
    { nivel: 2, texto: "Escolher a cor da caneta ou arrumar o quarto pode esperar." },
    { nivel: 3, texto: "Ler a atividade é uma das ações essenciais." },
  ],
  feedback: {
    correto: "Boa escolha. Você preparou o que ajuda a começar e deixou de fora o que distrai.",
    parcial: "Você escolheu quase certo. Reveja se falta uma ação essencial ou se entrou uma que pode esperar.",
    incorreto: "Reconsidere. Escolha o que realmente ajuda a começar a tarefa.",
    explicacao: "Ler, separar materiais e silenciar o dispositivo ajudam a começar. Cor da caneta, quarto e jogo podem esperar.",
  },
  acessibilidade: {
    textoSimplificado: "Escolha as 3 ações mais importantes para começar a tarefa.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// ── C18 · N4 · prioridade (4 essenciais) ─────────────────────────────────────
const c18: CaminhosAtividade = {
  id: "cm_c18",
  titulo: "Preparar uma apresentação",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "planejamento", "controle inibitório"],
  meta: "Escolher as quatro ações mais importantes antes de uma apresentação escolar.",
  instrucao: "Escolha as quatro ações que devem ser feitas primeiro.",
  contexto: "Você tem uma apresentação escolar em breve.",
  acoes: [
    { id: "e1", texto: "Revisar o conteúdo.", tipo: "obrigatoria" },
    { id: "e2", texto: "Conferir se o arquivo abre.", tipo: "obrigatoria" },
    { id: "e3", texto: "Praticar a apresentação.", tipo: "obrigatoria" },
    { id: "e4", texto: "Guardar uma cópia do arquivo.", tipo: "obrigatoria" },
    { id: "o1", texto: "Trocar novamente a cor do título.", tipo: "opcional" },
    { id: "o2", texto: "Escolher um desenho decorativo.", tipo: "opcional" },
    { id: "d1", texto: "Assistir a vídeos sem relação com o trabalho.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["e1", "e2", "e3", "e4"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["e1", "e2", "e3", "e4"],
    acoesOpcionais: ["o1", "o2"],
    acoesDesnecessarias: ["d1"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que garante que a apresentação vá bem." },
    { nivel: 2, texto: "Trocar a cor do título ou escolher um desenho pode esperar." },
    { nivel: 3, texto: "Revisar o conteúdo é uma das ações essenciais." },
  ],
  feedback: {
    correto: "Boa escolha. Você priorizou o que faz a apresentação funcionar.",
    parcial: "Você escolheu quase certo. Reveja se falta uma ação essencial ou se entrou uma que pode esperar.",
    incorreto: "Reconsidere. Escolha o que realmente prepara a apresentação.",
    explicacao: "Revisar, testar o arquivo, praticar e guardar uma cópia garantem a apresentação. Detalhes e vídeos podem esperar.",
  },
  acessibilidade: {
    textoSimplificado: "Escolha as 4 ações mais importantes antes de apresentar.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C19 · N5 · completar · ordem_exata (lacuna) ──────────────────────────────
// A tela deriva a lacuna sozinha (penúltima posição) a partir da ordemPrincipal.
// Não há campo para fixar QUAL é a lacuna nem para listar as opções incorretas do
// completar; por isso as opções incorretas da spec ficam como acoesDesnecessarias
// (opções que não pertencem ao plano) — ver limitação no relatório.
const c19: CaminhosAtividade = {
  id: "cm_c19",
  titulo: "Visitar a biblioteca",
  biblioteca: "criancas",
  categoria: "comunidade",
  nivel: 5,
  modo: "completar",
  // spec C19: a lacuna é a posição 4 — "Procurar o livro desejado"
  lacunaAcaoId: "a4",
  habilidades: ["planejamento", "sequenciamento", "autonomia"],
  meta: "Organizar uma visita à biblioteca para retirar um livro.",
  instrucao: "Complete o plano escolhendo a ação que falta no espaço vazio.",
  contexto: "Você quer ir à biblioteca retirar um livro.",
  acoes: [
    { id: "a1", texto: "Verificar o horário da biblioteca.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Separar o cartão da biblioteca.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Ir até a biblioteca.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Procurar o livro desejado.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Registrar a retirada do livro.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Levar o livro.", tipo: "obrigatoria", ordemPrincipal: 6 },
    { id: "d1", texto: "Guardar o cartão antes de chegar.", tipo: "desnecessaria" },
    { id: "d2", texto: "Voltar para casa sem procurar o livro.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5", "a6"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
      { antes: "a5", depois: "a6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5", "a6"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["d1", "d2"],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você faz na biblioteca antes de registrar a retirada." },
    { nivel: 2, texto: "Você precisa encontrar o livro antes de registrar a retirada." },
    { nivel: 3, texto: "A ação que falta é procurar o livro desejado." },
  ],
  feedback: {
    correto: "Boa organização. Você completou o plano encontrando o livro antes de registrá-lo.",
    parcial: "Seu plano está quase completo. Revise a ação que colocou no espaço vazio.",
    incorreto: "Essa escolha cria uma dificuldade. Pense no que precisa acontecer antes de registrar a retirada.",
    explicacao: "Depois de chegar à biblioteca, você procura o livro desejado; só então registra a retirada e leva o livro.",
  },
  acessibilidade: {
    textoSimplificado: "Complete o plano: procure o livro antes de registrar a retirada.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C20 · N5 · corrigir · ordem_exata ────────────────────────────────────────
const c20: CaminhosAtividade = {
  id: "cm_c20",
  titulo: "Fazer um trabalho escolar",
  biblioteca: "criancas",
  categoria: "planejamento",
  nivel: 5,
  modo: "corrigir",
  // spec C20: apresentar com "Fazer o trabalho" (a4) e "Procurar informações" (a2) invertidas
  ordemInicial: ["a1", "a4", "a3", "a2", "a5", "a6"],
  habilidades: ["planejamento", "sequenciamento", "revisão"],
  meta: "Corrigir a organização de um trabalho escolar.",
  instrucao: "O plano tem duas ações trocadas de lugar. Corrija a ordem.",
  contexto: "Alguém montou este plano de trabalho, mas duas ações ficaram fora do lugar.",
  acoes: [
    { id: "a1", texto: "Ler o tema.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Procurar informações.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Organizar as informações.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Fazer o trabalho.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Revisar o trabalho.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a6", texto: "Entregar o trabalho.", tipo: "obrigatoria", ordemPrincipal: 6 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3", "a4", "a5", "a6"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
      { antes: "a4", depois: "a5" },
      { antes: "a5", depois: "a6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3", "a4", "a5", "a6"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para fazer o trabalho." },
    { nivel: 2, texto: "Você procura e organiza as informações antes de fazer o trabalho." },
    { nivel: 3, texto: "Procurar informações vem antes de fazer o trabalho. Troque essas duas ações." },
  ],
  feedback: {
    correto: "Boa correção. Agora você reúne as informações antes de fazer o trabalho.",
    parcial: "Você está quase lá. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fazer o trabalho.",
    explicacao: "É preciso ler o tema, procurar e organizar as informações antes de fazer o trabalho, revisar e entregar.",
  },
  acessibilidade: {
    textoSimplificado: "Corrija a ordem: procure informações antes de fazer o trabalho.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C21 · N6 · reorganizar · imprevisto ──────────────────────────────────────
const c21: CaminhosAtividade = {
  id: "cm_c21",
  titulo: "A sala da atividade mudou",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 6,
  modo: "reorganizar",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "planejamento"],
  meta: "Chegar à sala correta para participar da atividade.",
  instrucao: "Monte o plano para chegar à sala e escolha o que fazer diante do aviso.",
  contexto: "Você combinou de participar de uma atividade na sala 2.",
  acoes: [
    { id: "a1", texto: "Verificar o horário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Ir até a sala 2.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Entrar na atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Ir até a sala 5.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o aviso indica outra sala." },
    { nivel: 2, texto: "Se a atividade mudou de sala, você precisa ir para a sala nova." },
    { nivel: 3, texto: "O aviso diz sala 5. Troque a ação de ir à sala 2 por ir à sala 5." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano leva você até a atividade.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de entrar na atividade.",
    explicacao: "Você verifica o horário, vai até a sala e entra. Diante do aviso, o caminho certo é a sala indicada.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Um aviso informa que a atividade agora será na sala 5.",
    recursosDisponiveis: ["A sala 5 está aberta e sinalizada."],
    restricoes: ["A atividade não acontecerá mais na sala 2."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "A sala mudou, então você deixou de ir à sala 2 e foi para a sala 5, como o aviso indicou.",
  },
  acessibilidade: {
    textoSimplificado: "A atividade mudou para a sala 5. Vá para a sala 5.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C22 · N7 · problema · imprevisto ─────────────────────────────────────────
const c22: CaminhosAtividade = {
  id: "cm_c22",
  titulo: "O lápis quebrou",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "problema",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "planejamento"],
  meta: "Continuar uma atividade de escrita.",
  instrucao: "Monte o plano para escrever e escolha o que fazer diante do imprevisto.",
  contexto: "Você está usando o lápis para completar uma atividade de escrita.",
  acoes: [
    { id: "a1", texto: "Abrir a atividade de escrita.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Usar o lápis para escrever.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Completar a atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Pegar o outro lápis e continuar a atividade.", tipo: "substituta" },
    { id: "a5", texto: "Parar toda a atividade.", tipo: "substituta" },
    { id: "a6", texto: "Tentar escrever com o lápis quebrado sem procurar outro.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o lápis quebra no meio da atividade." },
    { nivel: 2, texto: "Se o lápis quebrou, você precisa de outra forma de escrever." },
    { nivel: 3, texto: "Há outro lápis apontado no estojo. Pegue o outro lápis e continue." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite completar a atividade de escrita.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de completar a atividade.",
    explicacao: "Você abre a atividade, escreve e completa. Diante do lápis quebrado, usar o outro lápis mantém você na meta.",
  },
  imprevisto: {
    ativo: true,
    descricao: "O lápis quebrou no meio da atividade de escrita.",
    recursosDisponiveis: ["Existe outro lápis apontado dentro do estojo."],
    restricoes: ["Escrever com o lápis quebrado não permite continuar bem a atividade."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "O lápis quebrou, então você pegou o outro lápis apontado e continuou a atividade.",
  },
  acessibilidade: {
    textoSimplificado: "O lápis quebrou. Pegue o outro lápis e continue.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C23 · N7 · problema · imprevisto ─────────────────────────────────────────
const c23: CaminhosAtividade = {
  id: "cm_c23",
  titulo: "A folha da atividade não está na pasta",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "problema",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "planejamento"],
  meta: "Realizar a atividade enviada pelo professor.",
  instrucao: "Monte o plano para fazer a atividade e escolha o que fazer diante do imprevisto.",
  contexto: "O professor enviou uma atividade que você guardaria na pasta.",
  acoes: [
    { id: "a1", texto: "Separar os materiais.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Pegar a folha impressa na pasta.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Realizar a atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Abrir a atividade no aplicativo.", tipo: "substituta" },
    { id: "a5", texto: "Desistir da atividade.", tipo: "substituta" },
    { id: "a6", texto: "Esperar sem avisar ninguém.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a folha impressa não é encontrada." },
    { nivel: 2, texto: "Se a folha não está na pasta, você precisa de outra forma de acessar a atividade." },
    { nivel: 3, texto: "A mesma atividade está no aplicativo da escola. Abra a atividade no aplicativo." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite realizar a atividade enviada.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de realizar a atividade.",
    explicacao: "Você separa os materiais, acessa a atividade e a realiza. Sem a folha impressa, o aplicativo resolve o problema.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A folha impressa da atividade não está na pasta.",
    recursosDisponiveis: ["O professor disponibilizou a mesma atividade no aplicativo da escola."],
    restricoes: ["Sem a folha, você precisa de outra forma de acessar a mesma atividade."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "A folha sumiu, então você abriu a mesma atividade no aplicativo da escola e continuou.",
  },
  acessibilidade: {
    textoSimplificado: "A folha não está na pasta. Abra a atividade no aplicativo.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C24 · N7 · plano_alternativo · imprevisto ────────────────────────────────
const c24: CaminhosAtividade = {
  id: "cm_c24",
  titulo: "Começou a chover",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "resolução de problemas"],
  meta: "Participar de uma atividade recreativa.",
  instrucao: "Monte o plano para a atividade e escolha o que fazer diante da mudança.",
  contexto: "A atividade recreativa aconteceria no pátio.",
  acoes: [
    { id: "a1", texto: "Verificar o horário da atividade.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Fazer a atividade no pátio.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Participar da atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Realizar a atividade na sala coberta.", tipo: "substituta" },
    { id: "a5", texto: "Ficar no pátio na chuva.", tipo: "substituta" },
    { id: "a6", texto: "Cancelar a atividade.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando começa a chover no pátio." },
    { nivel: 2, texto: "Se está chovendo, você precisa de um lugar coberto para a atividade." },
    { nivel: 3, texto: "A escola preparou uma sala coberta. Realize a atividade na sala coberta." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite participar da atividade recreativa.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de participar.",
    explicacao: "Você confere o horário e participa. Como começou a chover, a sala coberta permite continuar com segurança.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Começou a chover e a atividade não pode acontecer no pátio.",
    recursosDisponiveis: ["A escola preparou uma sala coberta para a mesma atividade."],
    restricoes: ["Ficar no pátio na chuva não é seguro."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como começou a chover, você trocou o pátio pela sala coberta e participou da atividade.",
  },
  acessibilidade: {
    textoSimplificado: "Começou a chover. Faça a atividade na sala coberta.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C25 · N7 · plano_alternativo · imprevisto ────────────────────────────────
const c25: CaminhosAtividade = {
  id: "cm_c25",
  titulo: "O livro não está disponível",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "resolução de problemas"],
  meta: "Ler o livro indicado para a atividade.",
  instrucao: "Monte o plano para ler o livro e escolha o que fazer diante da mudança.",
  contexto: "A atividade pede a leitura de um livro que ficaria na estante.",
  acoes: [
    { id: "a1", texto: "Verificar qual livro é indicado.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Pegar o exemplar na estante.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Ler o livro indicado.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Solicitar acesso à cópia digital.", tipo: "substituta" },
    { id: "a5", texto: "Desistir da leitura.", tipo: "substituta" },
    { id: "a6", texto: "Levar outro livro qualquer sem avisar.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o exemplar não está na estante." },
    { nivel: 2, texto: "Se o livro não está disponível, você precisa de outra forma de lê-lo." },
    { nivel: 3, texto: "A biblioteca tem uma cópia digital autorizada. Solicite acesso à cópia digital." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite ler o livro indicado.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de ler o livro.",
    explicacao: "Você verifica qual livro é, obtém o livro e lê. Sem o exemplar, a cópia digital permite ler o mesmo livro.",
  },
  imprevisto: {
    ativo: true,
    descricao: "O exemplar do livro não está na estante.",
    recursosDisponiveis: ["A biblioteca possui uma cópia digital autorizada do mesmo livro."],
    restricoes: ["Não vale trocar por outro livro sem avisar."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Sem o exemplar na estante, você solicitou a cópia digital autorizada e leu o mesmo livro.",
  },
  acessibilidade: {
    textoSimplificado: "O livro não está na estante. Peça a cópia digital autorizada.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C26 · N7 · plano_alternativo · imprevisto ────────────────────────────────
const c26: CaminhosAtividade = {
  id: "cm_c26",
  titulo: "A internet parou de funcionar",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "resolução de problemas"],
  meta: "Continuar uma atividade de estudo.",
  instrucao: "Monte o plano de estudo e escolha o que fazer diante da mudança.",
  contexto: "Você está fazendo uma atividade de estudo pela internet.",
  acoes: [
    { id: "a1", texto: "Abrir a atividade de estudo.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Usar o conteúdo pela internet.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Continuar a atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Usar o conteúdo impresso para continuar a atividade.", tipo: "substituta" },
    { id: "a5", texto: "Parar de estudar.", tipo: "substituta" },
    { id: "a6", texto: "Ficar esperando a internet voltar sem fazer nada.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a internet para no meio do estudo." },
    { nivel: 2, texto: "Se a internet parou, você precisa de outra forma de acessar o conteúdo." },
    { nivel: 3, texto: "O conteúdo já está impresso. Use o conteúdo impresso para continuar." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite continuar a atividade de estudo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de continuar a atividade.",
    explicacao: "Você abre a atividade e a continua. Sem internet, o conteúdo impresso permite seguir estudando.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A internet parou de funcionar durante o estudo.",
    recursosDisponiveis: ["O conteúdo necessário já está impresso."],
    restricoes: ["Ficar esperando a internet voltar sem fazer nada não ajuda a continuar."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Sem internet, você passou a usar o conteúdo impresso e continuou a atividade de estudo.",
  },
  acessibilidade: {
    textoSimplificado: "A internet parou. Use o conteúdo impresso para continuar.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C27 · N7 · problema · imprevisto (SEGURANÇA §20) ─────────────────────────
// Atravessar a entrada fechada é INCORRETA (nunca correta). A opção de perseveração
// e a de "atravessar o bloqueio" são encodadas como incorretas; a solução é a
// entrada lateral indicada por funcionário.
const c27: CaminhosAtividade = {
  id: "cm_c27",
  titulo: "A entrada habitual está fechada",
  biblioteca: "criancas",
  categoria: "comunidade",
  nivel: 7,
  modo: "problema",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "segurança"],
  meta: "Entrar no local da atividade com segurança.",
  instrucao: "Monte o plano para entrar no local e escolha o que fazer diante do imprevisto.",
  contexto: "Você costuma entrar no local pela entrada habitual.",
  acoes: [
    { id: "a1", texto: "Chegar ao local da atividade.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Entrar pela entrada habitual.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Participar da atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Usar a entrada lateral indicada.", tipo: "substituta" },
    { id: "a5", texto: "Tentar atravessar a entrada fechada.", tipo: "substituta" },
    { id: "a6", texto: "Voltar para casa sem avisar ninguém.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a entrada habitual está fechada." },
    { nivel: 2, texto: "Se a entrada de sempre está fechada, procure uma entrada segura e aberta." },
    { nivel: 3, texto: "Um funcionário indicou a entrada lateral aberta. Use a entrada lateral indicada." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite entrar no local com segurança.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de participar da atividade.",
    explicacao: "Você chega, entra por um acesso seguro e participa. Com a entrada fechada, a entrada lateral indicada é o caminho seguro.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A entrada habitual do local está fechada.",
    recursosDisponiveis: ["Um funcionário informa que a entrada lateral está aberta e sinalizada."],
    restricoes: ["Nunca tente atravessar a entrada fechada.", "Não volte para casa sem avisar ninguém."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Com a entrada habitual fechada, você usou a entrada lateral indicada por um funcionário, de forma segura.",
  },
  acessibilidade: {
    textoSimplificado: "A entrada de sempre está fechada. Use a entrada lateral indicada.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C28 · N7 · reorganizar · imprevisto ──────────────────────────────────────
const c28: CaminhosAtividade = {
  id: "cm_c28",
  titulo: "Um integrante do grupo faltou",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 7,
  modo: "reorganizar",
  habilidades: ["flexibilidade cognitiva", "resolução de problemas", "trabalho em grupo"],
  meta: "Concluir uma atividade em grupo.",
  instrucao: "Monte o plano do grupo e escolha o que fazer diante da mudança.",
  contexto: "O grupo dividiu as tarefas de uma atividade entre os integrantes.",
  acoes: [
    { id: "a1", texto: "Conferir as tarefas da atividade.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Fazer as tarefas com todos os integrantes.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Concluir a atividade em grupo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a4", texto: "Redistribuir as tarefas entre os integrantes presentes.", tipo: "substituta" },
    { id: "a5", texto: "Cancelar a atividade.", tipo: "substituta" },
    { id: "a6", texto: "Deixar as tarefas dele sem fazer.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando um integrante do grupo falta." },
    { nivel: 2, texto: "Se falta um integrante, as tarefas dele precisam de outra solução." },
    { nivel: 3, texto: "O professor orientou dividir as tarefas. Redistribua entre os integrantes presentes." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite concluir a atividade em grupo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de concluir a atividade.",
    explicacao: "O grupo confere as tarefas, realiza e conclui. Com a falta, redistribuir as tarefas mantém a atividade em andamento.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Um integrante do grupo faltou e não fará as tarefas dele.",
    recursosDisponiveis: ["O professor orientou dividir as tarefas desse integrante entre os presentes."],
    restricoes: ["Deixar as tarefas dele sem fazer impede concluir a atividade."],
    acoesQueDevemMudar: ["a2"],
    solucaoCorreta: ["a4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Com a falta do integrante, você redistribuiu as tarefas dele entre os presentes e o grupo concluiu a atividade.",
  },
  acessibilidade: {
    textoSimplificado: "Um integrante faltou. Divida as tarefas dele entre os presentes.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// ── C29 · N8 · plano_alternativo · imprevisto de duas mudanças ───────────────
// Duas mudanças, solução de 2 ações. A tela permite escolher UMA opção por vez na
// fase de imprevisto; solucaoCorreta com 2 ids é avaliada como conjunto pelo motor
// (mesmoConjunto). Ver limitação sobre seleção múltipla no relatório.
const c29: CaminhosAtividade = {
  id: "cm_c29",
  titulo: "Mudança de sala e de material",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 8,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "resolução de problemas"],
  meta: "Participar de uma atividade escolar.",
  instrucao: "Monte o plano da atividade e escolha o que fazer diante das mudanças.",
  contexto: "A atividade aconteceria na sala 3, usando folhas azuis.",
  acoes: [
    { id: "a1", texto: "Conferir a atividade.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Ir à sala 3.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Usar folhas azuis.", tipo: "substituta", ordemPrincipal: 3 },
    { id: "a4", texto: "Participar da atividade.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Ir para a sala 6.", tipo: "substituta" },
    { id: "a6", texto: "Utilizar as folhas brancas.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a4" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [
      ["a1", "a3", "a2", "a4"],
    ],
    acoesObrigatorias: ["a1", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a sala e o material são trocados." },
    { nivel: 2, texto: "A atividade foi para a sala 6 e as folhas azuis acabaram." },
    { nivel: 3, texto: "Vá para a sala 6 e utilize as folhas brancas liberadas pelo professor." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite participar da atividade escolar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de participar.",
    explicacao: "Você confere a atividade e participa. Com as duas mudanças, a sala 6 e as folhas brancas mantêm você na meta.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A atividade foi transferida para a sala 6 e as folhas azuis acabaram.",
    recursosDisponiveis: ["A sala 6 está disponível.", "O professor liberou folhas brancas."],
    restricoes: ["A sala 3 e as folhas azuis não estão mais disponíveis."],
    acoesQueDevemMudar: ["a2", "a3"],
    solucaoCorreta: ["a5", "a6"],
    solucoesAlternativasAceitas: [],
    explicacao: "Com as duas mudanças, você foi para a sala 6 e passou a usar as folhas brancas liberadas.",
  },
  acessibilidade: {
    textoSimplificado: "A sala mudou para a 6 e as folhas ficaram brancas. Ajuste as duas coisas.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 5,
};

// ── C30 · N8 · plano_alternativo · imprevisto de duas mudanças ───────────────
// Solução de 3 ações (spec). solucaoCorreta com 3 ids é avaliada como conjunto.
const c30: CaminhosAtividade = {
  id: "cm_c30",
  titulo: "Preparar o estande da feira",
  biblioteca: "criancas",
  categoria: "escola",
  nivel: 8,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "adaptação a mudanças", "planejamento"],
  meta: "Preparar um estande para uma feira escolar.",
  instrucao: "Monte o plano do estande e escolha o que fazer diante das mudanças.",
  contexto: "O estande seria montado no espaço 4, com o cartaz impresso.",
  acoes: [
    { id: "a1", texto: "Conferir os materiais do estande.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Levar o cartaz impresso.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a3", texto: "Organizar o estande no espaço 4.", tipo: "substituta", ordemPrincipal: 3 },
    { id: "a4", texto: "Apresentar o estande.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a5", texto: "Ir para o espaço 7.", tipo: "substituta" },
    { id: "a6", texto: "Solicitar a impressão de uma nova cópia do cartaz.", tipo: "substituta" },
    { id: "a7", texto: "Organizar o estande no novo espaço.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a1", "a2", "a3", "a4"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
      { antes: "a3", depois: "a4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o espaço e o cartaz não estão como o planejado." },
    { nivel: 2, texto: "O estande foi para o espaço 7 e o cartaz foi danificado." },
    { nivel: 3, texto: "Vá para o espaço 7, peça uma nova cópia do cartaz e organize o estande no novo espaço." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite preparar o estande da feira.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de apresentar o estande.",
    explicacao: "Você confere os materiais e apresenta. Com as mudanças, o espaço 7, a nova cópia do cartaz e a nova organização resolvem tudo.",
  },
  imprevisto: {
    ativo: true,
    descricao: "O estande foi transferido para o espaço 7 e o cartaz foi danificado.",
    recursosDisponiveis: [
      "O espaço 7 está disponível.",
      "O arquivo do cartaz está salvo.",
      "Há uma impressora disponível com supervisão do responsável.",
    ],
    restricoes: ["O espaço 4 e o cartaz danificado não podem mais ser usados."],
    acoesQueDevemMudar: ["a2", "a3"],
    solucaoCorreta: ["a5", "a6", "a7"],
    solucoesAlternativasAceitas: [],
    explicacao: "Com as mudanças, você foi para o espaço 7, pediu uma nova cópia do cartaz e organizou o estande no novo espaço.",
  },
  acessibilidade: {
    textoSimplificado: "O espaço mudou para o 7 e o cartaz estragou. Ajuste as três coisas.",
    audioAcoes: {},
  },
  ativo: true,
  duracaoEstimadaMin: 5,
};

/** As 30 atividades da biblioteca CRIANÇAS (cm_c01..cm_c30), na ordem da spec. */
export const CAMINHOS_CRIANCAS: CaminhosAtividade[] = [
  c01, c02, c03, c04, c05, c06, c07, c08, c09, c10,
  c11, c12, c13, c14, c15, c16, c17, c18, c19, c20,
  c21, c22, c23, c24, c25, c26, c27, c28, c29, c30,
];
