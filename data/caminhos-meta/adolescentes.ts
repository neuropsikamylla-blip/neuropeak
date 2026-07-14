// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — BIBLIOTECA ADOLESCENTES (cm_a01..cm_a30).
//
// 30 atividades definitivas da spec (CAMINHOS-ATIVIDADES-ETAPA2-SPEC.md,
// seção "BIBLIOTECA ADOLESCENTES"), na ordem A01..A30.
//
// Regras seguidas (spec §§ das REGRAS GERAIS):
//   • SEM imagens; cartões só texto + áudio (acessibilidade.audioAcoes true).
//   • Linguagem simples, concreta, sem ironia/metáfora; conteúdo seguro (spec §20).
//   • Toda atividade: 3 dicas (níveis 1/2/3) + 4 feedbacks (correto/parcial/incorreto
//     + explicacao). Correção `ordem_exata` OU `dependencias`; intrusas fora da
//     ordemPrincipal; imprevisto completo nos modos 6-8.
//   • Categoria interna mapeada para a união fechada do type (spec §12).
//
// Convenção de ids de ação: prefixo curto por atividade (ex.: a01_1) — únicos
// dentro da atividade. Encode do jeito que a TELA lê (CaminhosMeta.tsx):
//   - prioridade: ordemPrincipal = ações essenciais; opcionais/irrelevante viram
//     acoesOpcionais/acoesDesnecessarias (o nº a escolher vem das settings, não da
//     atividade — a tela deriva por `limitePrioridade`).
//   - completar/corrigir: ordemPrincipal define o gabarito; a tela cria a lacuna /
//     a troca inicial sozinha (não há campo para posição — a tela deriva).
// ─────────────────────────────────────────────────────────────────────────────

import type { CaminhosAtividade } from "@/types/caminhos-meta";

// A01 · N1 · ordenar · ordem_exata (5 ações)
const a01: CaminhosAtividade = {
  id: "cm_a01",
  titulo: "Organizar os arquivos de um trabalho",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Organizar os arquivos de um trabalho escolar.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você terminou um trabalho no computador e vai organizar os arquivos.",
  acoes: [
    { id: "a01_1", texto: "Localizar os arquivos.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a01_2", texto: "Criar uma pasta com o nome do trabalho.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a01_3", texto: "Mover os arquivos para a pasta.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a01_4", texto: "Conferir se todos os arquivos foram incluídos.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a01_5", texto: "Salvar uma cópia.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a01_1", "a01_2", "a01_3", "a01_4", "a01_5"],
    precedencias: [
      { antes: "a01_1", depois: "a01_2" },
      { antes: "a01_2", depois: "a01_3" },
      { antes: "a01_3", depois: "a01_4" },
      { antes: "a01_4", depois: "a01_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a01_1", "a01_2", "a01_3", "a01_4", "a01_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro para organizar os arquivos." },
    { nivel: 2, texto: "Você só pode mover os arquivos depois de criar a pasta." },
    { nivel: 3, texto: "A primeira ação é localizar os arquivos." },
  ],
  feedback: {
    correto: "Boa organização. Você guardou os arquivos na ordem que mantém tudo reunido e com uma cópia salva.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa existir antes de mover os arquivos.",
    explicacao: "Primeiro você localiza os arquivos, cria a pasta, move tudo para ela, confere se está completo e por fim salva uma cópia.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Localize, crie a pasta, mova, confira e salve uma cópia.",
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// A02 · N1 · ordenar · dependencias (4 ações, precedências parciais)
const a02: CaminhosAtividade = {
  id: "cm_a02",
  titulo: "Preparar o espaço de estudo",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "planejamento"],
  meta: "Preparar um espaço adequado para estudar.",
  instrucao: "Coloque as ações em uma ordem que funcione.",
  contexto: "Você vai estudar e precisa deixar a mesa pronta.",
  acoes: [
    { id: "a02_1", texto: "Retirar objetos que não serão utilizados.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a02_2", texto: "Separar os materiais de estudo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a02_3", texto: "Colocar os materiais sobre a mesa.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a02_4", texto: "Iniciar a atividade.", tipo: "obrigatoria", ordemPrincipal: 4 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a02_1", "a02_2", "a02_3", "a02_4"],
    // retirar→colocar na mesa; separar→iniciar; colocar na mesa→iniciar.
    precedencias: [
      { antes: "a02_1", depois: "a02_3" },
      { antes: "a02_2", depois: "a02_4" },
      { antes: "a02_3", depois: "a02_4" },
    ],
    ordensAlternativasAceitas: [
      ["a02_2", "a02_1", "a02_3", "a02_4"],
    ],
    acoesObrigatorias: ["a02_1", "a02_2", "a02_3", "a02_4"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que deixa a mesa pronta antes de começar." },
    { nivel: 2, texto: "Você só coloca os materiais na mesa depois de retirar o que não vai usar." },
    { nivel: 3, texto: "Iniciar a atividade é a última ação." },
  ],
  feedback: {
    correto: "Boa organização. Você preparou o espaço antes de começar a estudar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa estar pronto antes de iniciar a atividade.",
    explicacao: "Você retira o que não vai usar, separa e coloca os materiais na mesa; só então inicia a atividade.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Retire o que não vai usar, separe, coloque na mesa e comece.",
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// A03 · N1 · ordenar · ordem_exata (5 ações)
const a03: CaminhosAtividade = {
  id: "cm_a03",
  titulo: "Preparar os materiais para um curso",
  biblioteca: "adolescentes",
  categoria: "organizacao",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Preparar os materiais para participar de um curso.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai a um curso e precisa levar os materiais certos.",
  acoes: [
    { id: "a03_1", texto: "Verificar a lista de materiais.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a03_2", texto: "Separar os itens necessários.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a03_3", texto: "Conferir os itens.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a03_4", texto: "Colocar os itens na bolsa.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a03_5", texto: "Fechar a bolsa.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a03_1", "a03_2", "a03_3", "a03_4", "a03_5"],
    precedencias: [
      { antes: "a03_1", depois: "a03_2" },
      { antes: "a03_2", depois: "a03_3" },
      { antes: "a03_3", depois: "a03_4" },
      { antes: "a03_4", depois: "a03_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a03_1", "a03_2", "a03_3", "a03_4", "a03_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de separar os itens." },
    { nivel: 2, texto: "Você confere os itens antes de colocá-los na bolsa." },
    { nivel: 3, texto: "A primeira ação é verificar a lista de materiais." },
  ],
  feedback: {
    correto: "Boa organização. Você conferiu os itens antes de guardar e não corre o risco de esquecer nada.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de fechar a bolsa.",
    explicacao: "Você vê a lista, separa e confere os itens e só então coloca na bolsa e fecha.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Veja a lista, separe, confira, guarde e feche a bolsa.",
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// A04 · N2 · ordenar · dependencias (cadeia; conferir a lista pode variar)
const a04: CaminhosAtividade = {
  id: "cm_a04",
  titulo: "Preparar uma bolsa para atividade esportiva",
  biblioteca: "adolescentes",
  categoria: "organizacao",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "planejamento", "sequenciamento"],
  meta: "Preparar os materiais solicitados para uma atividade esportiva.",
  instrucao: "Coloque as ações em uma ordem que funcione.",
  contexto: "Você tem uma atividade esportiva e precisa levar os itens pedidos.",
  acoes: [
    { id: "a04_1", texto: "Consultar a lista da atividade.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a04_2", texto: "Separar os itens solicitados.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a04_3", texto: "Colocar os itens na bolsa.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a04_4", texto: "Conferir a lista.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a04_5", texto: "Fechar a bolsa.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a04_1", "a04_2", "a04_3", "a04_4", "a04_5"],
    precedencias: [
      { antes: "a04_1", depois: "a04_2" },
      { antes: "a04_2", depois: "a04_3" },
      { antes: "a04_3", depois: "a04_4" },
      { antes: "a04_4", depois: "a04_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a04_1", "a04_2", "a04_3", "a04_4", "a04_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de separar os itens." },
    { nivel: 2, texto: "Você confere a lista depois de guardar os itens na bolsa." },
    { nivel: 3, texto: "A primeira ação é consultar a lista da atividade." },
  ],
  feedback: {
    correto: "Boa organização. Você conferiu a lista antes de fechar a bolsa e garantiu que nada ficou faltando.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de conferir a lista.",
    explicacao: "Você consulta a lista, separa e guarda os itens, confere a lista e por fim fecha a bolsa.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Veja a lista, separe, guarde, confira e feche a bolsa.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A05 · N2 · ordenar · ordem_exata (6 ações)
const a05: CaminhosAtividade = {
  id: "cm_a05",
  titulo: "Entregar um trabalho digital",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento", "atenção"],
  meta: "Finalizar e entregar um trabalho digital.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você terminou um trabalho e vai enviá-lo pelo canal indicado.",
  acoes: [
    { id: "a05_1", texto: "Concluir o trabalho.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a05_2", texto: "Revisar o conteúdo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a05_3", texto: "Conferir o nome do arquivo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a05_4", texto: "Salvar uma cópia.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a05_5", texto: "Enviar pelo canal indicado.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a05_6", texto: "Conferir a confirmação de envio.", tipo: "obrigatoria", ordemPrincipal: 6 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a05_1", "a05_2", "a05_3", "a05_4", "a05_5", "a05_6"],
    precedencias: [
      { antes: "a05_1", depois: "a05_2" },
      { antes: "a05_2", depois: "a05_3" },
      { antes: "a05_3", depois: "a05_4" },
      { antes: "a05_4", depois: "a05_5" },
      { antes: "a05_5", depois: "a05_6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a05_1", "a05_2", "a05_3", "a05_4", "a05_5", "a05_6"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa fazer antes de enviar o trabalho." },
    { nivel: 2, texto: "Você revisa o conteúdo antes de enviar." },
    { nivel: 3, texto: "A primeira ação é concluir o trabalho." },
  ],
  feedback: {
    correto: "Boa organização. Você revisou e salvou uma cópia antes de enviar e ainda conferiu a confirmação.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de enviar.",
    explicacao: "Você conclui, revisa, confere o nome, salva uma cópia, envia e confirma o envio.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Conclua, revise, confira o nome, salve, envie e confirme.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A06 · N2 · ordenar · ordem_exata (6 ações)
const a06: CaminhosAtividade = {
  id: "cm_a06",
  titulo: "Realizar uma pesquisa escolar",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["planejamento", "organização", "sequenciamento"],
  meta: "Realizar uma pesquisa escolar.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você recebeu um tema e vai fazer uma pesquisa.",
  acoes: [
    { id: "a06_1", texto: "Ler o tema.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a06_2", texto: "Definir o que precisa ser pesquisado.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a06_3", texto: "Consultar fontes adequadas.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a06_4", texto: "Registrar as informações.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a06_5", texto: "Organizar o conteúdo.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a06_6", texto: "Revisar.", tipo: "obrigatoria", ordemPrincipal: 6 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a06_1", "a06_2", "a06_3", "a06_4", "a06_5", "a06_6"],
    precedencias: [
      { antes: "a06_1", depois: "a06_2" },
      { antes: "a06_2", depois: "a06_3" },
      { antes: "a06_3", depois: "a06_4" },
      { antes: "a06_4", depois: "a06_5" },
      { antes: "a06_5", depois: "a06_6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a06_1", "a06_2", "a06_3", "a06_4", "a06_5", "a06_6"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa entender antes de procurar as fontes." },
    { nivel: 2, texto: "Você registra as informações depois de consultar as fontes." },
    { nivel: 3, texto: "A primeira ação é ler o tema." },
  ],
  feedback: {
    correto: "Boa organização. Você definiu o foco antes de pesquisar e revisou o conteúdo no fim.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de registrar as informações.",
    explicacao: "Você lê o tema, define o que pesquisar, consulta as fontes, registra, organiza e revisa.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Leia o tema, defina o foco, pesquise, registre, organize e revise.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A07 · N2 · ordenar · dependencias (preparar materiais pode trocar com informar)
const a07: CaminhosAtividade = {
  id: "cm_a07",
  titulo: "Organizar uma reunião de trabalho em grupo",
  biblioteca: "adolescentes",
  categoria: "trabalho",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["planejamento", "organização", "flexibilidade cognitiva"],
  meta: "Organizar uma reunião para realizar um trabalho.",
  instrucao: "Coloque as ações em uma ordem que funcione.",
  contexto: "Você vai combinar uma reunião do grupo para fazer um trabalho.",
  acoes: [
    { id: "a07_1", texto: "Verificar a disponibilidade dos participantes.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a07_2", texto: "Definir o horário.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a07_3", texto: "Informar o horário ao grupo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a07_4", texto: "Preparar os materiais.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a07_5", texto: "Participar da reunião.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a07_1", "a07_2", "a07_3", "a07_4", "a07_5"],
    // disponibilidade→horário→informar→participar; preparar→participar.
    // "preparar materiais" pode trocar com "informar o horário" (trocas livres na spec).
    precedencias: [
      { antes: "a07_1", depois: "a07_2" },
      { antes: "a07_2", depois: "a07_3" },
      { antes: "a07_3", depois: "a07_5" },
      { antes: "a07_2", depois: "a07_4" },
      { antes: "a07_4", depois: "a07_5" },
    ],
    ordensAlternativasAceitas: [
      // preparar materiais (a07_4) antes de informar o horário (a07_3)
      ["a07_1", "a07_2", "a07_4", "a07_3", "a07_5"],
    ],
    acoesObrigatorias: ["a07_1", "a07_2", "a07_3", "a07_4", "a07_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de definir o horário." },
    { nivel: 2, texto: "Você só informa o horário depois de defini-lo." },
    { nivel: 3, texto: "A primeira ação é verificar a disponibilidade dos participantes." },
  ],
  feedback: {
    correto: "Boa organização. Você definiu e comunicou o horário antes da reunião e chegou com os materiais prontos.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de participar da reunião.",
    explicacao: "Você verifica a disponibilidade, define o horário e informa o grupo; preparar os materiais pode vir antes ou depois de informar, desde que antes de participar.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Veja quem pode, defina o horário, avise o grupo, prepare os materiais e participe.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A08 · N2 · ordenar · ordem_exata (6 ações)
const a08: CaminhosAtividade = {
  id: "cm_a08",
  titulo: "Planejar o transporte para um curso",
  biblioteca: "adolescentes",
  categoria: "comunidade",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["planejamento", "autonomia", "sequenciamento"],
  meta: "Planejar o deslocamento para chegar a um curso no horário.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai a um curso em outro lugar e precisa planejar como chegar.",
  acoes: [
    { id: "a08_1", texto: "Verificar o endereço.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a08_2", texto: "Consultar as opções de transporte.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a08_3", texto: "Conferir os horários.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a08_4", texto: "Escolher uma opção adequada.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a08_5", texto: "Sair com antecedência.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a08_6", texto: "Seguir até o local.", tipo: "obrigatoria", ordemPrincipal: 6 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a08_1", "a08_2", "a08_3", "a08_4", "a08_5", "a08_6"],
    precedencias: [
      { antes: "a08_1", depois: "a08_2" },
      { antes: "a08_2", depois: "a08_3" },
      { antes: "a08_3", depois: "a08_4" },
      { antes: "a08_4", depois: "a08_5" },
      { antes: "a08_5", depois: "a08_6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a08_1", "a08_2", "a08_3", "a08_4", "a08_5", "a08_6"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de escolher o transporte." },
    { nivel: 2, texto: "Você escolhe uma opção depois de conferir os horários." },
    { nivel: 3, texto: "A primeira ação é verificar o endereço." },
  ],
  feedback: {
    correto: "Boa organização. Você escolheu o transporte com base nos horários e saiu com antecedência para chegar no tempo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de sair de casa.",
    explicacao: "Você confere o endereço e as opções, vê os horários, escolhe a opção adequada, sai com antecedência e segue até o local.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Veja o endereço e o transporte, confira horários, escolha, saia cedo e vá.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A09 · N2 · ordenar · dependencias (verificar materiais→separar; tudo→chegar)
const a09: CaminhosAtividade = {
  id: "cm_a09",
  titulo: "Preparar uma atividade voluntária",
  biblioteca: "adolescentes",
  categoria: "comunidade",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["planejamento", "organização", "autonomia"],
  meta: "Preparar-se para participar de uma atividade voluntária.",
  instrucao: "Coloque as ações em uma ordem que funcione.",
  contexto: "Você vai participar de uma atividade voluntária combinada.",
  acoes: [
    { id: "a09_1", texto: "Confirmar o horário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a09_2", texto: "Verificar quais materiais serão necessários.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a09_3", texto: "Separar os materiais.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a09_4", texto: "Conferir o endereço.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a09_5", texto: "Chegar ao local combinado.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a09_1", "a09_2", "a09_3", "a09_4", "a09_5"],
    // verificar materiais→separar; tudo→chegar (chegar é a última).
    precedencias: [
      { antes: "a09_2", depois: "a09_3" },
      { antes: "a09_1", depois: "a09_5" },
      { antes: "a09_3", depois: "a09_5" },
      { antes: "a09_4", depois: "a09_5" },
    ],
    ordensAlternativasAceitas: [
      ["a09_2", "a09_3", "a09_1", "a09_4", "a09_5"],
      ["a09_1", "a09_4", "a09_2", "a09_3", "a09_5"],
    ],
    acoesObrigatorias: ["a09_1", "a09_2", "a09_3", "a09_4", "a09_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa estar pronto antes de sair para o local." },
    { nivel: 2, texto: "Você só separa os materiais depois de verificar quais serão necessários." },
    { nivel: 3, texto: "Chegar ao local combinado é a última ação." },
  ],
  feedback: {
    correto: "Boa organização. Você confirmou horário e endereço e levou os materiais certos.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa estar pronto antes de chegar ao local.",
    explicacao: "Você confirma horário e endereço, verifica e separa os materiais, e chega ao local por último.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Confirme horário e endereço, veja e separe os materiais e chegue ao local.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A10 · N2 · ordenar · ordem_exata (5 ações)
const a10: CaminhosAtividade = {
  id: "cm_a10",
  titulo: "Organizar documentos para uma inscrição",
  biblioteca: "adolescentes",
  categoria: "autonomia",
  nivel: 2,
  modo: "ordenar",
  habilidades: ["organização", "autonomia", "atenção"],
  meta: "Preparar documentos para realizar uma inscrição.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você vai fazer uma inscrição e precisa dos documentos pedidos.",
  acoes: [
    { id: "a10_1", texto: "Ler a lista de documentos.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a10_2", texto: "Localizar os documentos.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a10_3", texto: "Conferir a validade e a legibilidade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a10_4", texto: "Organizar os documentos.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a10_5", texto: "Entregar ou enviar pelo canal indicado.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a10_1", "a10_2", "a10_3", "a10_4", "a10_5"],
    precedencias: [
      { antes: "a10_1", depois: "a10_2" },
      { antes: "a10_2", depois: "a10_3" },
      { antes: "a10_3", depois: "a10_4" },
      { antes: "a10_4", depois: "a10_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a10_1", "a10_2", "a10_3", "a10_4", "a10_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de localizar os documentos." },
    { nivel: 2, texto: "Você confere a validade antes de organizar os documentos." },
    { nivel: 3, texto: "A primeira ação é ler a lista de documentos." },
  ],
  feedback: {
    correto: "Boa organização. Você conferiu os documentos antes de organizá-los e enviá-los pelo canal indicado.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de entregar os documentos.",
    explicacao: "Você lê a lista, localiza e confere os documentos, organiza e por fim entrega ou envia.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Leia a lista, localize, confira, organize e envie.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A11 · N3 · intruso · dependencias + intrusa (1 intrusa)
const a11: CaminhosAtividade = {
  id: "cm_a11",
  titulo: "Plano de estudo com uma distração",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "planejamento"],
  meta: "Organizar uma sessão de estudo.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai estudar um conteúdo. Uma das ações não ajuda a estudar.",
  acoes: [
    { id: "a11_1", texto: "Definir o conteúdo.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a11_2", texto: "Separar o material.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a11_3", texto: "Estudar o conteúdo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a11_4", texto: "Fazer uma revisão.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a11_5", texto: "Registrar as dúvidas.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a11_6", texto: "Abrir vídeos sem relação com o conteúdo.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a11_1", "a11_2", "a11_3", "a11_4", "a11_5"],
    precedencias: [
      { antes: "a11_1", depois: "a11_2" },
      { antes: "a11_2", depois: "a11_3" },
      { antes: "a11_3", depois: "a11_4" },
      { antes: "a11_4", depois: "a11_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a11_1", "a11_2", "a11_3", "a11_4", "a11_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a11_6"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que ajuda a estudar e no que só atrapalha." },
    { nivel: 2, texto: "Você só estuda o conteúdo depois de separar o material." },
    { nivel: 3, texto: "Comece definindo o conteúdo. Abrir vídeos sem relação não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você manteve as ações que ajudam a estudar e deixou de fora a distração.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de estudar e no que atrapalha.",
    explicacao: "Você define o conteúdo, separa o material, estuda, revisa e registra as dúvidas. Abrir vídeos sem relação não contribui para o estudo.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Estude na ordem certa e deixe a distração de fora.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A12 · N3 · intruso · ordem_exata + intrusa (1 intrusa)
const a12: CaminhosAtividade = {
  id: "cm_a12",
  titulo: "Preparar uma aula on-line",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "controle inibitório", "sequenciamento"],
  meta: "Preparar-se para uma aula on-line.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai entrar em uma aula on-line. Uma das ações não ajuda.",
  acoes: [
    { id: "a12_1", texto: "Verificar o horário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a12_2", texto: "Carregar o dispositivo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a12_3", texto: "Conferir a conexão.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a12_4", texto: "Abrir o aplicativo.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a12_5", texto: "Entrar na aula.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a12_6", texto: "Abrir um jogo antes da aula.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a12_1", "a12_2", "a12_3", "a12_4", "a12_5"],
    precedencias: [
      { antes: "a12_1", depois: "a12_2" },
      { antes: "a12_2", depois: "a12_3" },
      { antes: "a12_3", depois: "a12_4" },
      { antes: "a12_4", depois: "a12_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a12_1", "a12_2", "a12_3", "a12_4", "a12_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a12_6"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que prepara você para entrar na aula e no que só atrapalha." },
    { nivel: 2, texto: "Você confere a conexão antes de abrir o aplicativo." },
    { nivel: 3, texto: "Comece verificando o horário. Abrir um jogo não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você deixou tudo pronto para entrar na aula e não perdeu tempo com o que não ajudava.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de entrar na aula.",
    explicacao: "Você verifica o horário, carrega o dispositivo, confere a conexão, abre o aplicativo e entra na aula. Abrir um jogo antes atrapalha.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Prepare-se para a aula na ordem certa e deixe o jogo de fora.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A13 · N3 · intruso · ordem_exata + intrusa (1 intrusa)
const a13: CaminhosAtividade = {
  id: "cm_a13",
  titulo: "Preparar uma candidatura para estágio",
  biblioteca: "adolescentes",
  categoria: "trabalho",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "planejamento", "controle inibitório"],
  meta: "Enviar uma candidatura para uma vaga de estágio.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Você vai se candidatar a uma vaga de estágio. Uma das ações não pertence à candidatura.",
  acoes: [
    { id: "a13_1", texto: "Ler os requisitos da vaga.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a13_2", texto: "Preparar o currículo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a13_3", texto: "Revisar o currículo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a13_4", texto: "Preencher as informações solicitadas.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a13_5", texto: "Enviar a candidatura.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a13_6", texto: "Conferir a confirmação.", tipo: "obrigatoria", ordemPrincipal: 6 },
    { id: "a13_7", texto: "Enviar um arquivo sem relação com a candidatura.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a13_1", "a13_2", "a13_3", "a13_4", "a13_5", "a13_6"],
    precedencias: [
      { antes: "a13_1", depois: "a13_2" },
      { antes: "a13_2", depois: "a13_3" },
      { antes: "a13_3", depois: "a13_4" },
      { antes: "a13_4", depois: "a13_5" },
      { antes: "a13_5", depois: "a13_6" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a13_1", "a13_2", "a13_3", "a13_4", "a13_5", "a13_6"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a13_7"],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que faz parte de enviar a candidatura e no que não pertence." },
    { nivel: 2, texto: "Você revisa o currículo antes de preencher as informações e enviar." },
    { nivel: 3, texto: "Comece lendo os requisitos da vaga. Enviar um arquivo sem relação não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você preparou e revisou o currículo, enviou a candidatura e conferiu a confirmação.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de enviar a candidatura.",
    explicacao: "Você lê os requisitos, prepara e revisa o currículo, preenche as informações, envia e confere a confirmação. Enviar um arquivo sem relação não pertence à candidatura.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Prepare a candidatura na ordem certa e deixe de fora o arquivo sem relação.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A14 · N4 · prioridade · essenciais(4) + 2 opcionais + 1 irrelevante
const a14: CaminhosAtividade = {
  id: "cm_a14",
  titulo: "Preparar-se para uma prova",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "planejamento", "controle inibitório"],
  meta: "Escolher as quatro ações mais importantes para preparar-se para uma prova.",
  instrucao: "Escolha as ações mais importantes para se preparar.",
  contexto: "Você tem uma prova em breve e precisa priorizar o que fazer.",
  acoes: [
    { id: "a14_1", texto: "Conferir os conteúdos da prova.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a14_2", texto: "Organizar um horário de estudo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a14_3", texto: "Estudar os conteúdos.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a14_4", texto: "Revisar os pontos de dificuldade.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a14_5", texto: "Trocar a capa do caderno.", tipo: "opcional" },
    { id: "a14_6", texto: "Reorganizar todos os arquivos antigos.", tipo: "opcional" },
    { id: "a14_7", texto: "Assistir a uma série durante o horário de estudo.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a14_1", "a14_2", "a14_3", "a14_4"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a14_1", "a14_2", "a14_3", "a14_4"],
    acoesOpcionais: ["a14_5", "a14_6"],
    acoesDesnecessarias: ["a14_7"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que mais ajuda você a ir bem na prova." },
    { nivel: 2, texto: "Estudar e revisar os pontos difíceis são mais importantes que detalhes do caderno." },
    { nivel: 3, texto: "Conferir os conteúdos da prova é uma das ações essenciais. Assistir a uma série durante o estudo não ajuda." },
  ],
  feedback: {
    correto: "Boa escolha. Você priorizou o que realmente prepara para a prova.",
    parcial: "Você escolheu ações úteis, mas deixou de fora alguma essencial ou incluiu algo que não ajuda. Revise.",
    incorreto: "Essas escolhas não são as mais importantes. Pense no que prepara você para a prova.",
    explicacao: "Conferir o conteúdo, organizar o estudo, estudar e revisar os pontos difíceis são o essencial. Trocar a capa ou reorganizar arquivos antigos são opcionais; assistir a uma série no horário de estudo atrapalha.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Escolha as quatro ações que mais preparam para a prova.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A15 · N4 · prioridade · essenciais(4) + 2 opcionais + 1 irrelevante
const a15: CaminhosAtividade = {
  id: "cm_a15",
  titulo: "Pouco tempo antes de sair",
  biblioteca: "adolescentes",
  categoria: "rotina",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "autonomia", "controle inibitório"],
  meta: "Escolher as ações essenciais antes de sair para um compromisso.",
  instrucao: "Escolha as ações mais importantes antes de sair.",
  contexto: "Você tem pouco tempo antes de sair para um compromisso.",
  acoes: [
    { id: "a15_1", texto: "Conferir o horário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a15_2", texto: "Pegar os documentos necessários.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a15_3", texto: "Pegar as chaves.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a15_4", texto: "Verificar o caminho.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a15_5", texto: "Reorganizar uma gaveta.", tipo: "opcional" },
    { id: "a15_6", texto: "Trocar o papel de parede do celular.", tipo: "opcional" },
    { id: "a15_7", texto: "Começar um filme.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a15_1", "a15_2", "a15_3", "a15_4"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a15_1", "a15_2", "a15_3", "a15_4"],
    acoesOpcionais: ["a15_5", "a15_6"],
    acoesDesnecessarias: ["a15_7"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você não pode esquecer para sair no horário." },
    { nivel: 2, texto: "Documentos e chaves são mais importantes que arrumar uma gaveta agora." },
    { nivel: 3, texto: "Conferir o horário é uma das ações essenciais. Começar um filme atrasa a saída." },
  ],
  feedback: {
    correto: "Boa escolha. Você priorizou o que garante sair no horário e sem esquecer o necessário.",
    parcial: "Você escolheu ações úteis, mas deixou de fora alguma essencial ou incluiu algo que atrasa. Revise.",
    incorreto: "Essas escolhas não são as mais importantes. Pense no que você precisa para sair a tempo.",
    explicacao: "Conferir o horário, pegar documentos e chaves e verificar o caminho garantem a saída. Reorganizar a gaveta ou trocar o papel de parede podem ficar para depois; começar um filme atrasa.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Escolha as quatro ações que garantem sair no horário.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A16 · N4 · prioridade · essenciais(5) + 2 opcionais + 1 irrelevante
const a16: CaminhosAtividade = {
  id: "cm_a16",
  titulo: "Organizar uma feira escolar",
  biblioteca: "adolescentes",
  categoria: "planejamento",
  nivel: 4,
  modo: "prioridade",
  habilidades: ["priorização", "planejamento", "organização"],
  meta: "Escolher as ações essenciais para organizar uma apresentação em uma feira escolar.",
  instrucao: "Escolha as ações mais importantes para organizar a feira.",
  contexto: "Seu grupo vai apresentar em uma feira escolar. Priorize o que importa.",
  acoes: [
    { id: "a16_1", texto: "Definir o tema.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a16_2", texto: "Dividir as tarefas.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a16_3", texto: "Preparar os materiais.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a16_4", texto: "Revisar a apresentação.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a16_5", texto: "Conferir o local e o horário.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a16_6", texto: "Alterar detalhes decorativos.", tipo: "opcional" },
    { id: "a16_7", texto: "Criar um segundo título.", tipo: "opcional" },
    { id: "a16_8", texto: "Assistir a vídeos sem relação com a feira.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a16_1", "a16_2", "a16_3", "a16_4", "a16_5"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a16_1", "a16_2", "a16_3", "a16_4", "a16_5"],
    acoesOpcionais: ["a16_6", "a16_7"],
    acoesDesnecessarias: ["a16_8"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que o grupo precisa para apresentar bem." },
    { nivel: 2, texto: "Definir o tema e dividir as tarefas importam mais que detalhes decorativos." },
    { nivel: 3, texto: "Conferir o local e o horário é essencial. Assistir a vídeos sem relação não ajuda." },
  ],
  feedback: {
    correto: "Boa escolha. Você priorizou o que organiza a apresentação e garante o local e o horário.",
    parcial: "Você escolheu ações úteis, mas deixou de fora alguma essencial ou incluiu algo que não ajuda. Revise.",
    incorreto: "Essas escolhas não são as mais importantes. Pense no que o grupo precisa para apresentar.",
    explicacao: "Definir o tema, dividir as tarefas, preparar os materiais, revisar e conferir o local e o horário são o essencial. Detalhes decorativos e um segundo título são opcionais; vídeos sem relação atrapalham.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Escolha as cinco ações que organizam a apresentação da feira.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A17 · N5 · completar · ordem_exata (lacuna posição 3 = penúltima é derivada pela tela)
const a17: CaminhosAtividade = {
  id: "cm_a17",
  titulo: "Completar a entrega de um projeto",
  biblioteca: "adolescentes",
  categoria: "planejamento",
  nivel: 5,
  modo: "completar",
  // spec A17: a lacuna é a posição 3 — "Salvar uma cópia do arquivo"
  lacunaAcaoId: "a17_3",
  habilidades: ["planejamento", "sequenciamento", "atenção"],
  meta: "Completar o plano de entrega de um projeto.",
  instrucao: "Escolha a ação que falta para completar o plano.",
  contexto: "O plano de entrega está quase pronto. Falta uma ação no meio.",
  acoes: [
    { id: "a17_1", texto: "Finalizar o projeto.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a17_2", texto: "Revisar.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a17_3", texto: "Salvar uma cópia do arquivo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a17_4", texto: "Enviar pelo canal solicitado.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a17_5", texto: "Conferir a confirmação.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a17_6", texto: "Apagar o arquivo original.", tipo: "desnecessaria" },
    { id: "a17_7", texto: "Enviar sem revisar de novo.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a17_1", "a17_2", "a17_3", "a17_4", "a17_5"],
    precedencias: [
      { antes: "a17_1", depois: "a17_2" },
      { antes: "a17_2", depois: "a17_3" },
      { antes: "a17_3", depois: "a17_4" },
      { antes: "a17_4", depois: "a17_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a17_1", "a17_2", "a17_3", "a17_4", "a17_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["a17_6", "a17_7"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que protege seu trabalho antes de enviar." },
    { nivel: 2, texto: "Depois de revisar, você precisa guardar uma versão segura antes de enviar." },
    { nivel: 3, texto: "A ação que falta é salvar uma cópia do arquivo." },
  ],
  feedback: {
    correto: "Boa escolha. Salvar uma cópia protege seu trabalho antes do envio.",
    parcial: "Quase lá. Reveja qual ação realmente completa o plano com segurança.",
    incorreto: "Essa escolha não completa bem o plano. Pense no que garante uma versão segura antes de enviar.",
    explicacao: "Depois de revisar, você salva uma cópia do arquivo; só então envia e confere a confirmação. Apagar o original ou enviar sem revisar colocam o trabalho em risco.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Escolha a ação do meio: salvar uma cópia antes de enviar.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A18 · N5 · corrigir · ordem_exata
const a18: CaminhosAtividade = {
  id: "cm_a18",
  titulo: "Fazer uma cópia de segurança",
  biblioteca: "adolescentes",
  categoria: "organizacao",
  nivel: 5,
  modo: "corrigir",
  // spec A18: apresentar com "Salvar em outro local" (a18_4) ANTES de "Copiar o arquivo" (a18_3)
  ordemInicial: ["a18_1", "a18_2", "a18_4", "a18_3", "a18_5"],
  habilidades: ["sequenciamento", "atenção", "flexibilidade cognitiva"],
  meta: "Corrigir a ordem para fazer uma cópia de segurança.",
  instrucao: "Uma ação está fora de lugar. Corrija a ordem.",
  contexto: "O plano abaixo tem uma troca. Ajuste para que faça sentido.",
  acoes: [
    { id: "a18_1", texto: "Localizar o arquivo.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a18_2", texto: "Conferir se é a versão atual.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a18_3", texto: "Copiar o arquivo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a18_4", texto: "Salvar em outro local seguro.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a18_5", texto: "Abrir a cópia para verificar.", tipo: "obrigatoria", ordemPrincipal: 5 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a18_1", "a18_2", "a18_3", "a18_4", "a18_5"],
    precedencias: [
      { antes: "a18_1", depois: "a18_2" },
      { antes: "a18_2", depois: "a18_3" },
      { antes: "a18_3", depois: "a18_4" },
      { antes: "a18_4", depois: "a18_5" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a18_1", "a18_2", "a18_3", "a18_4", "a18_5"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa existir antes de guardar a cópia." },
    { nivel: 2, texto: "Você só salva em outro local depois de copiar o arquivo." },
    { nivel: 3, texto: "Copiar o arquivo vem antes de salvar em outro local seguro." },
  ],
  feedback: {
    correto: "Boa correção. Agora você copia antes de salvar em outro local, e a cópia existe de verdade.",
    parcial: "Quase lá. Reveja a posição da ação que ainda está fora de lugar.",
    incorreto: "A ordem ainda cria uma dificuldade. Pense no que precisa acontecer antes de salvar em outro local.",
    explicacao: "Você localiza o arquivo, confere se é a versão atual, copia, salva em outro local seguro e abre a cópia para verificar.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Copie o arquivo antes de salvar em outro local.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A19 · N5 · prioridade · essenciais(5) + 2 opcionais + 1 irrelevante
const a19: CaminhosAtividade = {
  id: "cm_a19",
  titulo: "Preparar uma saída de um dia",
  biblioteca: "adolescentes",
  categoria: "autonomia",
  nivel: 5,
  modo: "prioridade",
  habilidades: ["priorização", "autonomia", "planejamento"],
  meta: "Escolher os itens essenciais para uma saída de um dia.",
  instrucao: "Escolha os itens mais importantes para levar.",
  contexto: "Você vai passar o dia fora e precisa escolher o que levar.",
  acoes: [
    { id: "a19_1", texto: "Documento necessário.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a19_2", texto: "Telefone carregado.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a19_3", texto: "Informação do endereço.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a19_4", texto: "Meio de pagamento definido.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a19_5", texto: "Garrafa de água, quando apropriado.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a19_6", texto: "Livro.", tipo: "opcional" },
    { id: "a19_7", texto: "Fones de ouvido.", tipo: "opcional" },
    { id: "a19_8", texto: "Objetos sem relação com a atividade e que dificultam o transporte.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a19_1", "a19_2", "a19_3", "a19_4", "a19_5"],
    precedencias: [],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a19_1", "a19_2", "a19_3", "a19_4", "a19_5"],
    acoesOpcionais: ["a19_6", "a19_7"],
    acoesDesnecessarias: ["a19_8"],
    pontuacaoMinima: 5,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você não pode ficar sem durante o dia fora." },
    { nivel: 2, texto: "Documento, telefone e meio de pagamento importam mais que um livro." },
    { nivel: 3, texto: "A informação do endereço é essencial. Objetos que dificultam o transporte devem ficar." },
  ],
  feedback: {
    correto: "Boa escolha. Você levou o essencial para o dia e não se sobrecarregou.",
    parcial: "Você escolheu itens úteis, mas deixou de fora algum essencial ou incluiu algo que atrapalha. Revise.",
    incorreto: "Essas escolhas não são as mais importantes. Pense no que você precisa para o dia fora.",
    explicacao: "Documento, telefone carregado, endereço, meio de pagamento e água são o essencial. Livro e fones são opcionais; objetos que dificultam o transporte só atrapalham.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Escolha os cinco itens essenciais para a saída de um dia.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// A20 · N5 · ordenar · dependencias (várias precedências; ordem parcialmente livre)
const a20: CaminhosAtividade = {
  id: "cm_a20",
  titulo: "Organizar uma semana de estudos",
  biblioteca: "adolescentes",
  categoria: "planejamento",
  nivel: 5,
  modo: "ordenar",
  habilidades: ["planejamento", "organização", "priorização"],
  meta: "Organizar uma semana de estudos considerando datas de entrega.",
  instrucao: "Coloque as ações em uma ordem que funcione.",
  contexto: "Você tem várias atividades na semana e vai montar um plano de estudos.",
  acoes: [
    { id: "a20_1", texto: "Conferir todas as datas.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a20_2", texto: "Identificar a atividade com prazo mais próximo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a20_3", texto: "Dividir tarefas maiores em partes.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a20_4", texto: "Distribuir as tarefas pelos dias disponíveis.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a20_5", texto: "Reservar um momento para revisão.", tipo: "obrigatoria", ordemPrincipal: 5 },
    { id: "a20_6", texto: "Conferir o plano.", tipo: "obrigatoria", ordemPrincipal: 6 },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a20_1", "a20_2", "a20_3", "a20_4", "a20_5", "a20_6"],
    // datas→identificar→distribuir; dividir→distribuir; distribuir→conferir plano;
    // reservar→conferir plano.
    precedencias: [
      { antes: "a20_1", depois: "a20_2" },
      { antes: "a20_2", depois: "a20_4" },
      { antes: "a20_3", depois: "a20_4" },
      { antes: "a20_4", depois: "a20_6" },
      { antes: "a20_5", depois: "a20_6" },
    ],
    ordensAlternativasAceitas: [
      // dividir (a20_3) pode vir antes de identificar (a20_2); reservar (a20_5) só precisa
      // vir antes de conferir o plano (a20_6).
      ["a20_1", "a20_3", "a20_2", "a20_4", "a20_5", "a20_6"],
      ["a20_1", "a20_2", "a20_3", "a20_5", "a20_4", "a20_6"],
    ],
    acoesObrigatorias: ["a20_1", "a20_2", "a20_3", "a20_4", "a20_5", "a20_6"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 6,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de distribuir as tarefas." },
    { nivel: 2, texto: "Você só distribui as tarefas depois de conferir as datas e dividir as maiores." },
    { nivel: 3, texto: "Conferir o plano é a última ação." },
  ],
  feedback: {
    correto: "Boa organização. Você considerou as datas e dividiu as tarefas antes de distribuí-las pelos dias.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de distribuir as tarefas.",
    explicacao: "Você confere as datas, identifica o prazo mais próximo e divide as tarefas maiores; então distribui pelos dias, reserva um momento de revisão e confere o plano.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Veja as datas, divida as tarefas, distribua pelos dias, reserve revisão e confira o plano.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A21 · N6 · reorganizar · imprevisto ativo (caminho fechado → rota alternativa)
const a21: CaminhosAtividade = {
  id: "cm_a21",
  titulo: "O caminho habitual está fechado",
  biblioteca: "adolescentes",
  categoria: "comunidade",
  nivel: 6,
  modo: "reorganizar",
  habilidades: ["flexibilidade cognitiva", "planejamento", "adaptação a mudanças"],
  meta: "Chegar ao curso no horário.",
  instrucao: "Monte o plano para chegar ao curso e ajuste o que muda com o aviso.",
  contexto: "Você costuma ir pelo caminho habitual até o curso.",
  acoes: [
    { id: "a21_1", texto: "Sair de casa com antecedência.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a21_2", texto: "Utilizar o caminho habitual.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a21_3", texto: "Chegar ao curso.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a21_4", texto: "Utilizar a rota alternativa indicada pelo mapa.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a21_1", "a21_2", "a21_3"],
    precedencias: [
      { antes: "a21_1", depois: "a21_2" },
      { antes: "a21_2", depois: "a21_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a21_1", "a21_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o caminho de sempre não está disponível." },
    { nivel: 2, texto: "Se a rua está fechada, você precisa de outra forma de chegar." },
    { nivel: 3, texto: "O aplicativo mostra uma rota alternativa segura. Trocar o caminho permite chegar ao curso." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite chegar ao curso no horário.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de chegar ao curso.",
    explicacao: "Sair com antecedência e seguir um caminho válido leva ao curso. Se o caminho habitual está fechado, você usa a rota alternativa indicada.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A rua do caminho habitual está fechada.",
    recursosDisponiveis: ["O aplicativo de mapas mostra uma rota alternativa segura."],
    restricoes: ["Não é permitido passar pelo bloqueio."],
    acoesQueDevemMudar: ["a21_2"],
    solucaoCorreta: ["a21_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "O caminho habitual não funcionava mais, então você trocou pela rota alternativa segura indicada pelo mapa para chegar ao curso.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "O caminho de sempre está fechado. Use a rota alternativa segura.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A22 · N7 · problema · imprevisto ativo (bateria fraca → carregar antes de sair)
const a22: CaminhosAtividade = {
  id: "cm_a22",
  titulo: "O telefone está com pouca bateria",
  biblioteca: "adolescentes",
  categoria: "rotina",
  nivel: 7,
  modo: "problema",
  habilidades: ["resolução de problemas", "planejamento", "flexibilidade cognitiva"],
  meta: "Utilizar o telefone durante um compromisso.",
  instrucao: "Monte o plano e escolha o que fazer diante do problema.",
  contexto: "Você vai sair para um compromisso e precisará usar o telefone lá.",
  acoes: [
    { id: "a22_1", texto: "Separar o que vai levar.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a22_2", texto: "Sair para o compromisso.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a22_3", texto: "Usar o telefone durante o compromisso.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a22_4", texto: "Conectar o telefone ao carregador antes de sair.", tipo: "substituta" },
    { id: "a22_5", texto: "Sair com o telefone descarregando.", tipo: "substituta" },
    { id: "a22_6", texto: "Desligar o telefone e não avisar ninguém.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a22_1", "a22_2", "a22_3"],
    precedencias: [
      { antes: "a22_1", depois: "a22_2" },
      { antes: "a22_2", depois: "a22_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a22_1", "a22_2", "a22_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que garante o telefone funcionando no compromisso." },
    { nivel: 2, texto: "Se a bateria está quase acabando, você precisa resolver isso antes de sair." },
    { nivel: 3, texto: "Há tomada e carregador; conectar o telefone antes de sair resolve o problema." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite chegar ao compromisso com o telefone pronto para usar.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de usar o telefone.",
    explicacao: "Você separa o que vai levar, sai e usa o telefone. Como a bateria está fraca, carregar antes de sair garante que ele funcione.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A bateria do telefone está quase acabando.",
    recursosDisponiveis: ["Há uma tomada segura por perto.", "O carregador está disponível.", "Ainda há tempo antes de sair."],
    restricoes: ["O telefone precisa estar funcionando durante o compromisso."],
    acoesQueDevemMudar: [],
    solucaoCorreta: ["a22_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como havia tomada, carregador e tempo, você conectou o telefone ao carregador antes de sair para poder usá-lo no compromisso.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "O telefone está com pouca bateria. Carregue antes de sair.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A23 · N7 · plano_alternativo · imprevisto ativo (internet caiu → dados móveis)
const a23: CaminhosAtividade = {
  id: "cm_a23",
  titulo: "A internet está indisponível",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 7,
  modo: "plano_alternativo",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "adaptação a mudanças"],
  meta: "Entregar um trabalho dentro do prazo.",
  instrucao: "Monte o plano de entrega e escolha o que fazer diante do problema.",
  contexto: "Você tem um trabalho pronto e vai enviá-lo pela internet de casa.",
  acoes: [
    { id: "a23_1", texto: "Abrir o trabalho pronto.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a23_2", texto: "Enviar pela internet de casa.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a23_3", texto: "Conferir a confirmação de envio.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a23_4", texto: "Utilizar os dados móveis para enviar o arquivo.", tipo: "substituta" },
    { id: "a23_5", texto: "Esperar a internet voltar e perder o prazo.", tipo: "substituta" },
    { id: "a23_6", texto: "Desistir da entrega.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a23_1", "a23_2", "a23_3"],
    precedencias: [
      { antes: "a23_1", depois: "a23_2" },
      { antes: "a23_2", depois: "a23_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a23_1", "a23_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a internet de casa não funciona." },
    { nivel: 2, texto: "Se a internet caiu, você precisa de outra forma de enviar dentro do prazo." },
    { nivel: 3, texto: "O telefone tem dados móveis; usá-los permite enviar o arquivo." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite entregar o trabalho dentro do prazo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de confirmar o envio.",
    explicacao: "Você abre o trabalho e envia por um canal válido; se a internet de casa caiu, usar os dados móveis mantém a entrega no prazo.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A internet de casa está indisponível.",
    recursosDisponiveis: ["O telefone tem dados móveis.", "O arquivo já está pronto."],
    restricoes: ["O prazo de entrega não pode ser perdido."],
    acoesQueDevemMudar: ["a23_2"],
    solucaoCorreta: ["a23_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como a internet de casa caiu, você usou os dados móveis do telefone para enviar o arquivo e entregar dentro do prazo.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "A internet de casa caiu. Envie o arquivo pelos dados móveis.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A24 · N7 · plano_alternativo · imprevisto ativo (loja fechada → outra loja)
const a24: CaminhosAtividade = {
  id: "cm_a24",
  titulo: "O local está fechado",
  biblioteca: "adolescentes",
  categoria: "comunidade",
  nivel: 7,
  modo: "plano_alternativo",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "autonomia"],
  meta: "Comprar um material necessário para uma atividade.",
  instrucao: "Monte o plano da compra e escolha o que fazer diante do problema.",
  contexto: "Você planejou comprar o material em uma loja específica.",
  acoes: [
    { id: "a24_1", texto: "Ir até a loja planejada.", tipo: "substituta", ordemPrincipal: 1 },
    { id: "a24_2", texto: "Comprar o material.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a24_3", texto: "Levar o material para a atividade.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a24_4", texto: "Ir à outra loja indicada, que está aberta.", tipo: "substituta" },
    { id: "a24_5", texto: "Voltar para casa sem o material.", tipo: "substituta" },
    { id: "a24_6", texto: "Ficar esperando a loja abrir.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a24_1", "a24_2", "a24_3"],
    precedencias: [
      { antes: "a24_1", depois: "a24_2" },
      { antes: "a24_2", depois: "a24_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a24_2", "a24_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando a loja planejada está fechada." },
    { nivel: 2, texto: "Se a loja está fechada, você precisa de outro lugar para comprar o material." },
    { nivel: 3, texto: "Há outra loja aberta na mesma região com o material; ir até ela resolve o problema." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite comprar o material e levá-lo para a atividade.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de levar o material.",
    explicacao: "Você vai a uma loja aberta, compra o material e o leva para a atividade. Se a loja planejada está fechada, a outra loja indicada resolve.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A loja planejada está fechada.",
    recursosDisponiveis: ["Há outra loja aberta na mesma região com o material."],
    restricoes: ["A loja planejada não pode ser usada hoje.", "A atividade precisa do material."],
    acoesQueDevemMudar: ["a24_1"],
    solucaoCorreta: ["a24_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como a loja planejada estava fechada, você foi até a outra loja indicada, que estava aberta e tinha o material.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "A loja está fechada. Vá à outra loja indicada, que está aberta.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A25 · N7 · reorganizar · imprevisto ativo (integrante faltou → redistribuir)
const a25: CaminhosAtividade = {
  id: "cm_a25",
  titulo: "Um participante do grupo faltou",
  biblioteca: "adolescentes",
  categoria: "trabalho",
  nivel: 7,
  modo: "reorganizar",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "trabalho em grupo"],
  meta: "Concluir uma apresentação em grupo.",
  instrucao: "Monte o plano da apresentação e escolha o que fazer diante da mudança.",
  contexto: "Seu grupo vai apresentar, com uma parte para cada participante.",
  acoes: [
    { id: "a25_1", texto: "Organizar as partes da apresentação.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a25_2", texto: "Apresentar cada parte como estava combinado.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a25_3", texto: "Concluir a apresentação.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a25_4", texto: "Redistribuir a apresentação entre os participantes presentes.", tipo: "substituta" },
    { id: "a25_5", texto: "Cancelar a apresentação.", tipo: "substituta" },
    { id: "a25_6", texto: "Apresentar sem a parte dele.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a25_1", "a25_2", "a25_3"],
    precedencias: [
      { antes: "a25_1", depois: "a25_2" },
      { antes: "a25_2", depois: "a25_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a25_1", "a25_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando alguém do grupo não está presente." },
    { nivel: 2, texto: "Se um participante faltou, a parte dele precisa ser assumida por alguém." },
    { nivel: 3, texto: "O conteúdo dele está disponível e o professor permitiu redistribuir; dividir as partes entre os presentes resolve." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite concluir a apresentação com todos os presentes.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de concluir a apresentação.",
    explicacao: "Você organiza e apresenta as partes até concluir. Como um participante faltou, redistribuir a apresentação entre os presentes mantém tudo coberto.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Um participante do grupo faltou.",
    recursosDisponiveis: ["O conteúdo da parte dele está disponível.", "O professor permitiu redistribuir a apresentação."],
    restricoes: ["A apresentação precisa incluir o conteúdo de todas as partes."],
    acoesQueDevemMudar: ["a25_2"],
    solucaoCorreta: ["a25_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como um participante faltou, você redistribuiu a apresentação entre os presentes, usando o conteúdo disponível, para concluir tudo.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "Um participante faltou. Redistribua a apresentação entre os presentes.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A26 · N7 · reorganizar · imprevisto ativo (prazo antecipado → priorizar obrigatória)
const a26: CaminhosAtividade = {
  id: "cm_a26",
  titulo: "O prazo foi antecipado",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 7,
  modo: "reorganizar",
  habilidades: ["priorização", "flexibilidade cognitiva", "adaptação a mudanças"],
  meta: "Entregar um projeto dentro do novo prazo.",
  instrucao: "Reorganize o plano para entregar dentro do novo prazo.",
  contexto: "Você estava fazendo um projeto e o prazo foi antecipado.",
  acoes: [
    { id: "a26_1", texto: "Priorizar a parte obrigatória.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a26_2", texto: "Revisar os pontos principais.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a26_3", texto: "Enviar dentro do prazo.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a26_4", texto: "Deixar melhorias opcionais para depois.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "a26_5", texto: "Fazer melhorias opcionais agora.", tipo: "opcional" },
    { id: "a26_6", texto: "Alterar elementos decorativos agora.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a26_1", "a26_2", "a26_3", "a26_4"],
    precedencias: [
      { antes: "a26_1", depois: "a26_2" },
      { antes: "a26_2", depois: "a26_3" },
      { antes: "a26_3", depois: "a26_4" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a26_1", "a26_2", "a26_3", "a26_4"],
    acoesOpcionais: ["a26_5"],
    acoesDesnecessarias: ["a26_6"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa estar pronto para entregar dentro do novo prazo." },
    { nivel: 2, texto: "Com menos tempo, a parte obrigatória vem antes das melhorias opcionais." },
    { nivel: 3, texto: "Priorize a parte obrigatória, revise os pontos principais e envie; deixe o que é opcional para depois." },
  ],
  feedback: {
    correto: "Boa reorganização. Você garantiu a parte obrigatória e a entrega no novo prazo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa estar pronto antes de enviar no novo prazo.",
    explicacao: "Com o prazo antecipado, você prioriza a parte obrigatória, revisa os pontos principais e envia dentro do prazo; melhorias opcionais e detalhes decorativos ficam para depois.",
  },
  imprevisto: {
    ativo: true,
    descricao: "O prazo do projeto foi antecipado.",
    recursosDisponiveis: ["A parte obrigatória pode ser concluída a tempo.", "As melhorias opcionais podem ficar para depois."],
    restricoes: ["Não há tempo para fazer as melhorias opcionais e os detalhes decorativos agora."],
    acoesQueDevemMudar: ["a26_5", "a26_6"],
    solucaoCorreta: ["a26_1", "a26_2", "a26_3", "a26_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Com o prazo antecipado, você priorizou a parte obrigatória, revisou os pontos principais e enviou dentro do prazo, deixando as melhorias opcionais e os detalhes decorativos para depois.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "O prazo foi antecipado. Faça o obrigatório, revise e envie; opcionais ficam para depois.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A27 · N7 · problema · imprevisto ativo (arquivo não abre → usar cópia em PDF)
const a27: CaminhosAtividade = {
  id: "cm_a27",
  titulo: "O arquivo principal não abre",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 7,
  modo: "problema",
  habilidades: ["resolução de problemas", "flexibilidade cognitiva", "adaptação a mudanças"],
  meta: "Apresentar um trabalho digital.",
  instrucao: "Monte o plano da apresentação e escolha o que fazer diante do problema.",
  contexto: "Você vai apresentar um trabalho a partir do arquivo principal.",
  acoes: [
    { id: "a27_1", texto: "Preparar o local da apresentação.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a27_2", texto: "Abrir o arquivo principal.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a27_3", texto: "Apresentar o trabalho.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a27_4", texto: "Abrir e utilizar a cópia em PDF.", tipo: "substituta" },
    { id: "a27_5", texto: "Cancelar a apresentação.", tipo: "substituta" },
    { id: "a27_6", texto: "Insistir no arquivo que não abre.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a27_1", "a27_2", "a27_3"],
    precedencias: [
      { antes: "a27_1", depois: "a27_2" },
      { antes: "a27_2", depois: "a27_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a27_1", "a27_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o arquivo principal não abre." },
    { nivel: 2, texto: "Se o arquivo não abre, você precisa de outra forma de mostrar o mesmo conteúdo." },
    { nivel: 3, texto: "Há uma cópia em PDF salva em outro local; abri-la permite apresentar." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite apresentar o trabalho mesmo com o problema no arquivo.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de apresentar.",
    explicacao: "Você prepara o local, abre o conteúdo e apresenta. Como o arquivo principal não abre, a cópia em PDF permite mostrar o mesmo trabalho.",
  },
  imprevisto: {
    ativo: true,
    descricao: "O arquivo principal não abre.",
    recursosDisponiveis: ["Há uma cópia em PDF salva em outro local."],
    restricoes: ["O arquivo que não abre não pode ser usado na apresentação."],
    acoesQueDevemMudar: ["a27_2"],
    solucaoCorreta: ["a27_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como o arquivo principal não abriu, você usou a cópia em PDF salva em outro local para apresentar o mesmo trabalho.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "O arquivo não abre. Use a cópia em PDF para apresentar.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A28 · N7 · reorganizar · imprevisto ativo (reunião mudou de local → biblioteca)
const a28: CaminhosAtividade = {
  id: "cm_a28",
  titulo: "A reunião mudou de local",
  biblioteca: "adolescentes",
  categoria: "trabalho",
  nivel: 7,
  modo: "reorganizar",
  habilidades: ["flexibilidade cognitiva", "planejamento", "adaptação a mudanças"],
  meta: "Participar de uma reunião de projeto.",
  instrucao: "Monte o plano para chegar à reunião e ajuste o que muda com o aviso.",
  contexto: "A reunião do projeto seria na sala de estudos.",
  acoes: [
    { id: "a28_1", texto: "Sair com antecedência.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a28_2", texto: "Ir para a sala de estudos.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a28_3", texto: "Participar da reunião.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a28_4", texto: "Ir para a biblioteca, o novo local da reunião.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a28_1", "a28_2", "a28_3"],
    precedencias: [
      { antes: "a28_1", depois: "a28_2" },
      { antes: "a28_2", depois: "a28_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a28_1", "a28_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o local da reunião é outro." },
    { nivel: 2, texto: "Se a reunião mudou de lugar, você precisa ir ao novo local." },
    { nivel: 3, texto: "A reunião agora é na biblioteca; ir para lá permite participar." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite participar da reunião no local correto.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de participar da reunião.",
    explicacao: "Você sai com antecedência, vai ao local da reunião e participa. Como o local mudou, você segue para a biblioteca.",
  },
  imprevisto: {
    ativo: true,
    descricao: "A reunião não será mais na sala de estudos, e sim na biblioteca.",
    recursosDisponiveis: ["O aviso informa o novo local: a biblioteca."],
    restricoes: ["A reunião não acontecerá mais na sala de estudos."],
    acoesQueDevemMudar: ["a28_2"],
    solucaoCorreta: ["a28_4"],
    solucoesAlternativasAceitas: [],
    explicacao: "Como o local mudou, você trocou a sala de estudos pela biblioteca e seguiu para o novo local da reunião.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "A reunião mudou para a biblioteca. Vá para o novo local.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

// A29 · N8 · plano_alternativo · imprevisto ativo (2 mudanças: horário + caminho)
const a29: CaminhosAtividade = {
  id: "cm_a29",
  titulo: "Mudança de horário e de caminho",
  biblioteca: "adolescentes",
  categoria: "comunidade",
  nivel: 8,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "planejamento", "adaptação a mudanças", "resolução de problemas"],
  meta: "Chegar ao curso.",
  instrucao: "Monte o plano para chegar ao curso e ajuste as duas mudanças.",
  contexto: "Você planejava sair às 14h e ir pela Rua Central até o curso.",
  acoes: [
    { id: "a29_1", texto: "Sair às 14h.", tipo: "substituta", ordemPrincipal: 1 },
    { id: "a29_2", texto: "Utilizar a Rua Central.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a29_3", texto: "Chegar ao curso.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a29_4", texto: "Atualizar o horário de saída para 30 minutos mais cedo.", tipo: "substituta" },
    { id: "a29_5", texto: "Utilizar o desvio sinalizado.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a29_1", "a29_2", "a29_3"],
    precedencias: [
      { antes: "a29_1", depois: "a29_2" },
      { antes: "a29_2", depois: "a29_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a29_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda no horário e no caminho para chegar ao curso." },
    { nivel: 2, texto: "Duas coisas mudaram: o curso começa mais cedo e a Rua Central está fechada." },
    { nivel: 3, texto: "Atualize o horário de saída e use o desvio sinalizado para chegar." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano se ajusta às duas mudanças e leva ao curso.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de chegar ao curso.",
    explicacao: "Como o curso começa mais cedo e a Rua Central está fechada, você atualiza o horário de saída e usa o desvio sinalizado para chegar.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Duas mudanças: o curso começará 30 minutos mais cedo e a Rua Central está fechada.",
    recursosDisponiveis: ["É possível sair 30 minutos mais cedo.", "Existe um desvio sinalizado."],
    restricoes: ["A Rua Central não pode ser utilizada.", "O horário antigo de saída não funciona mais."],
    acoesQueDevemMudar: ["a29_1", "a29_2"],
    solucaoCorreta: ["a29_4", "a29_5"],
    solucoesAlternativasAceitas: [],
    explicacao: "Você atualizou o horário de saída para 30 minutos mais cedo e trocou a Rua Central pelo desvio sinalizado, ajustando-se às duas mudanças.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "O curso é mais cedo e a rua está fechada. Saia antes e use o desvio.",
  },
  ativo: true,
  duracaoEstimadaMin: 5,
};

// A30 · N8 · plano_alternativo · imprevisto ativo (2 mudanças: sala + material)
const a30: CaminhosAtividade = {
  id: "cm_a30",
  titulo: "Projeto com duas mudanças",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 8,
  modo: "plano_alternativo",
  habilidades: ["flexibilidade cognitiva", "planejamento", "adaptação a mudanças", "resolução de problemas"],
  meta: "Concluir uma apresentação de projeto.",
  instrucao: "Monte o plano da apresentação e ajuste as duas mudanças.",
  contexto: "Você planejava apresentar na sala multimídia usando os materiais próprios do grupo.",
  acoes: [
    { id: "a30_1", texto: "Apresentar na sala multimídia.", tipo: "substituta", ordemPrincipal: 1 },
    { id: "a30_2", texto: "Utilizar os materiais próprios do grupo.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "a30_3", texto: "Concluir a apresentação.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "a30_4", texto: "Transferir a apresentação para a sala indicada.", tipo: "substituta" },
    { id: "a30_5", texto: "Utilizar os materiais equivalentes disponíveis.", tipo: "substituta" },
    { id: "a30_6", texto: "Conferir a apresentação antes do início.", tipo: "substituta" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["a30_1", "a30_2", "a30_3"],
    precedencias: [
      { antes: "a30_1", depois: "a30_3" },
      { antes: "a30_2", depois: "a30_3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a30_3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda na sala e no material para concluir a apresentação." },
    { nivel: 2, texto: "Duas coisas mudaram: a sala multimídia está indisponível e parte do material não chegou." },
    { nivel: 3, texto: "Transfira para a sala indicada, use os materiais equivalentes e confira a apresentação antes do início." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano se ajusta às duas mudanças e conclui a apresentação.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de concluir a apresentação.",
    explicacao: "Como a sala multimídia está indisponível e parte do material não chegou, você transfere para a sala indicada, usa os materiais equivalentes e confere a apresentação antes de começar.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Duas mudanças: a sala multimídia está indisponível e parte do material não chegou.",
    recursosDisponiveis: ["A escola indicou uma sala alternativa.", "A escola disponibilizou materiais equivalentes."],
    restricoes: ["A sala multimídia não pode ser usada.", "Parte do material próprio não está disponível."],
    acoesQueDevemMudar: ["a30_1", "a30_2"],
    solucaoCorreta: ["a30_4", "a30_5", "a30_6"],
    solucoesAlternativasAceitas: [],
    explicacao: "Você transferiu a apresentação para a sala indicada, usou os materiais equivalentes disponíveis e conferiu a apresentação antes do início, ajustando-se às duas mudanças.",
  },
  acessibilidade: {
    audioAcoes: {},
    textoSimplificado: "A sala mudou e faltou material. Vá à sala indicada, use os materiais equivalentes e confira antes.",
  },
  ativo: true,
  duracaoEstimadaMin: 5,
};

/** As 30 atividades da biblioteca ADOLESCENTES (cm_a01..cm_a30), na ordem da spec. */
export const CAMINHOS_ADOLESCENTES: CaminhosAtividade[] = [
  a01, a02, a03, a04, a05, a06, a07, a08, a09, a10,
  a11, a12, a13, a14, a15, a16, a17, a18, a19, a20,
  a21, a22, a23, a24, a25, a26, a27, a28, a29, a30,
];
