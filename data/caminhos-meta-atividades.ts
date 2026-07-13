// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — atividades de EXEMPLO (provisórias, removíveis).
//
// Exatamente 3 atividades técnicas (1 por biblioteca), marcadas com "[EXEMPLO]".
// Servem para exercitar o motor de correção; NÃO são as 90 definitivas (spec §24).
// Escolha de modos/níveis: cobrir ordem_exata, dependencias+intrusa e problema+imprevisto.
// Textos em pt-BR, frases curtas, sem imagens (spec §14), conteúdo seguro (spec §20).
// ─────────────────────────────────────────────────────────────────────────────

import type { CaminhosAtividade } from "@/types/caminhos-meta";

// (a) CRIANÇAS · nível 1 · modo ordenar · correção ordem_exata · 3 ações.
const guardarMateriais: CaminhosAtividade = {
  id: "cm-ex-criancas-guardar-materiais",
  titulo: "[EXEMPLO] Guardar os materiais",
  biblioteca: "criancas",
  categoria: "rotina",
  nivel: 1,
  modo: "ordenar",
  habilidades: ["organização", "sequenciamento"],
  meta: "Deixar a mesa organizada depois de estudar.",
  instrucao: "Coloque as ações na melhor ordem.",
  contexto: "Você terminou a lição e vai arrumar a mesa.",
  acoes: [
    { id: "a1", texto: "Juntar os lápis e as canetas.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "a2", texto: "Guardar tudo no estojo.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "a3", texto: "Colocar o estojo na mochila.", tipo: "obrigatoria", ordemPrincipal: 3 },
  ],
  correcao: {
    tipo: "ordem_exata",
    ordemPrincipal: ["a1", "a2", "a3"],
    precedencias: [
      { antes: "a1", depois: "a2" },
      { antes: "a2", depois: "a3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["a1", "a2", "a3"],
    acoesOpcionais: [],
    acoesDesnecessarias: [],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que precisa acontecer primeiro." },
    { nivel: 2, texto: "Antes de guardar no estojo, junte os lápis." },
    { nivel: 3, texto: "A primeira ação é juntar os lápis e as canetas." },
  ],
  feedback: {
    correto: "Boa organização. Você deixou a mesa arrumada na ordem certa.",
    parcial: "Seu plano está quase completo. Revise a posição desta ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes desta etapa.",
    explicacao: "Primeiro você junta os materiais, depois guarda no estojo e por fim coloca na mochila.",
  },
  acessibilidade: {
    textoSimplificado: "Arrume a mesa: junte, guarde e coloque na mochila.",
  },
  ativo: true,
  duracaoEstimadaMin: 2,
};

// (b) ADOLESCENTES · nível 3 · modo intruso · correção dependencias · 1 intrusa.
const prepararMochila: CaminhosAtividade = {
  id: "cm-ex-adolescentes-preparar-mochila",
  titulo: "[EXEMPLO] Preparar a mochila para a aula",
  biblioteca: "adolescentes",
  categoria: "escola",
  nivel: 3,
  modo: "intruso",
  habilidades: ["organização", "planejamento", "controle inibitório"],
  meta: "Sair de casa com a mochila pronta para a aula.",
  instrucao: "Organize as ações necessárias e deixe de fora a que não faz parte do plano.",
  contexto: "Amanhã tem aula. Prepare a mochila hoje à noite.",
  acoes: [
    { id: "m1", texto: "Conferir o horário das aulas de amanhã.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "m2", texto: "Separar os cadernos das matérias do dia.", tipo: "obrigatoria", ordemPrincipal: 2 },
    { id: "m3", texto: "Guardar os cadernos na mochila.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "m4", texto: "Colocar o estojo e a garrafa de água.", tipo: "obrigatoria", ordemPrincipal: 4 },
    { id: "m5", texto: "Ligar a televisão.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["m1", "m2", "m3", "m4"],
    precedencias: [
      { antes: "m1", depois: "m2" },
      { antes: "m2", depois: "m3" },
    ],
    // "Colocar o estojo e a garrafa" (m4) pode entrar em qualquer ponto: aceita ordem alternativa.
    ordensAlternativasAceitas: [
      ["m4", "m1", "m2", "m3"],
      ["m1", "m2", "m4", "m3"],
    ],
    acoesObrigatorias: ["m1", "m2", "m3", "m4"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["m5"],
    pontuacaoMinima: 4,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que você precisa saber antes de escolher os cadernos." },
    { nivel: 2, texto: "Antes de guardar os cadernos, separe as matérias do dia." },
    { nivel: 3, texto: "Comece conferindo o horário das aulas de amanhã. Ligar a TV não faz parte do plano." },
  ],
  feedback: {
    correto: "Boa organização. Você separou o que era necessário e deixou de fora o que não ajudava na meta.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de guardar os cadernos.",
    explicacao: "Você precisa conferir o horário, separar as matérias do dia e só então guardar. Ligar a televisão não contribui para preparar a mochila.",
  },
  acessibilidade: {
    textoSimplificado: "Prepare a mochila. Uma das ações não faz parte: deixe-a de fora.",
  },
  ativo: true,
  duracaoEstimadaMin: 3,
};

// (c) ADULTOS E IDOSOS · nível 7 · modo problema · imprevisto ativo (rua fechada).
const chegarCompromisso: CaminhosAtividade = {
  id: "cm-ex-adultos-idosos-rua-fechada",
  titulo: "[EXEMPLO] Chegar ao compromisso com a rua fechada",
  biblioteca: "adultos_idosos",
  categoria: "comunidade",
  nivel: 7,
  modo: "problema",
  habilidades: ["planejamento", "resolução de problemas", "flexibilidade cognitiva", "adaptação a mudanças"],
  meta: "Chegar ao compromisso no horário combinado.",
  instrucao: "Monte o plano para chegar ao compromisso e escolha o que fazer diante do imprevisto.",
  contexto: "Você costuma ir pela rua principal, que é o caminho mais curto.",
  acoes: [
    { id: "p1", texto: "Sair de casa com antecedência.", tipo: "obrigatoria", ordemPrincipal: 1 },
    { id: "p2", texto: "Seguir pela rua principal, como de costume.", tipo: "substituta", ordemPrincipal: 2 },
    { id: "p3", texto: "Chegar ao local do compromisso.", tipo: "obrigatoria", ordemPrincipal: 3 },
    { id: "p4", texto: "Seguir o desvio indicado pela placa.", tipo: "substituta" },
    { id: "p5", texto: "Passar por cima do bloqueio da rua.", tipo: "desnecessaria" },
  ],
  correcao: {
    tipo: "dependencias",
    ordemPrincipal: ["p1", "p2", "p3"],
    precedencias: [
      { antes: "p1", depois: "p2" },
      { antes: "p2", depois: "p3" },
    ],
    ordensAlternativasAceitas: [],
    acoesObrigatorias: ["p1", "p3"],
    acoesOpcionais: [],
    acoesDesnecessarias: ["p5"],
    pontuacaoMinima: 3,
  },
  dicas: [
    { nivel: 1, texto: "Pense no que muda quando o caminho de costume não está disponível." },
    { nivel: 2, texto: "Se a rua principal está fechada, você precisa de outra forma de continuar." },
    { nivel: 3, texto: "A placa indica um desvio seguro. Seguir o desvio permite continuar até a meta." },
  ],
  feedback: {
    correto: "Boa organização. Seu plano permite chegar ao compromisso no horário.",
    parcial: "Seu plano está quase completo. Revise a posição de uma ação.",
    incorreto: "Essa ordem cria uma dificuldade. Pense no que precisa acontecer antes de chegar ao local.",
    explicacao: "Sair com antecedência e seguir um caminho válido leva ao compromisso. Diante do bloqueio, o caminho seguro é o desvio indicado.",
  },
  imprevisto: {
    ativo: true,
    descricao: "Ao chegar na rua principal, você encontra uma placa: a rua está fechada.",
    recursosDisponiveis: ["Uma placa indica um desvio seguro para a mesma direção."],
    restricoes: ["Não é permitido passar pelo bloqueio."],
    acoesQueDevemMudar: ["p2"],
    solucaoCorreta: ["p4"],
    solucoesAlternativasAceitas: [],
    explicacao: "O plano inicial não funcionava mais, então você escolheu o desvio seguro indicado pela placa para continuar até a meta.",
  },
  acessibilidade: {
    textoSimplificado: "A rua está fechada. Escolha o caminho seguro para continuar.",
  },
  ativo: true,
  duracaoEstimadaMin: 4,
};

/** As 3 atividades de exemplo (removíveis na Etapa 2). */
export const CAMINHOS_ATIVIDADES_EXEMPLO: CaminhosAtividade[] = [
  guardarMateriais,
  prepararMochila,
  chegarCompromisso,
];
