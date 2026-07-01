// ── Mentor da Jornada ───────────────────────────────────────────────────────
// Sempre que uma habilidade é evoluída, o Mentor mostra uma orientação prática:
// o que significa, por que importa, uma dica e um mini desafio para aplicar no
// dia a dia. Conteúdo curado por habilidade (base). No futuro, a IA personaliza
// isto por idade, nível, histórico e objetivos do usuário — ver `personalizeHook`.

import type { SkillId } from "@/lib/skilltree";

export interface MentorContent {
  significa: string;
  importa: string;
  dica: string;
  desafio: string;
}

export const MENTOR: Record<SkillId, MentorContent> = {
  foco: {
    significa: "Você está desenvolvendo a capacidade de manter a atenção nas tarefas e reduzir distrações por mais tempo.",
    importa: "Mais foco significa estudar e trabalhar em menos tempo, com menos cansaço mental e menos ansiedade.",
    dica: "Antes de começar uma atividade, desligue as notificações do celular por 25 minutos e concentre-se em apenas uma tarefa.",
    desafio: "Complete uma sessão de estudo ou trabalho sem interrupções e registre como foi a sua experiência.",
  },
  organizacao: {
    significa: "Organizar suas tarefas e materiais ajuda a reduzir a ansiedade e aumenta a sua produtividade.",
    importa: "Quando tudo tem um lugar, você perde menos tempo procurando e toma decisões com a mente mais leve.",
    dica: "Liste as três tarefas mais importantes do dia antes de começar suas atividades.",
    desafio: "Planeje seu dia durante cinco dias consecutivos e veja como sua semana fica mais fluida.",
  },
  criatividade: {
    significa: "A criatividade é a capacidade de encontrar novas soluções e conexões para os problemas.",
    importa: "Ela te deixa mais flexível diante de imprevistos e abre caminhos que ninguém tinha pensado.",
    dica: "Reserve 10 minutos para um brainstorming livre, anotando ideias sem julgar nenhuma delas.",
    desafio: "Encontre uma nova forma de resolver um problema que você enfrenta na escola, faculdade ou trabalho.",
  },
  planejamento: {
    significa: "Planejar é antecipar os passos e prazos que te levam até um objetivo, sem correria.",
    importa: "Um bom plano transforma metas grandes em ações possíveis e reduz a sensação de estar sempre atrasado.",
    dica: "No domingo, escolha os três objetivos da semana e quebre cada um em uma primeira ação simples.",
    desafio: "Monte um plano de 3 passos para uma meta sua e complete o primeiro passo ainda hoje.",
  },
  disciplina: {
    significa: "Disciplina é manter a rotina mesmo quando a motivação está baixa. Constância vence intensidade.",
    importa: "São os pequenos hábitos repetidos que constroem grandes resultados ao longo do tempo.",
    dica: "Combine um novo hábito com algo que você já faz todo dia (ex.: revisar a matéria logo após o café).",
    desafio: "Escolha um hábito e cumpra-o por 3 dias seguidos, no mesmo horário.",
  },
  inovacao: {
    significa: "Inovar é transformar boas ideias em soluções que você realmente coloca em prática.",
    importa: "Ideias só mudam a sua vida quando saem do papel — inovar é dar esse passo.",
    dica: "Pegue uma ideia que você teve e defina o menor teste possível para experimentá-la esta semana.",
    desafio: "Aplique uma melhoria em algo que você já faz e observe o resultado.",
  },
  gestao: {
    significa: "Gestão do tempo é distribuir seu dia entre o que é urgente e o que é importante.",
    importa: "Quem cuida do próprio tempo trabalha com mais calma e sobra espaço para o que gosta.",
    dica: "Reserve um bloco fixo no dia só para a sua tarefa mais importante — e proteja esse horário.",
    desafio: "Planeje seu dia em blocos de tempo e siga-o por um dia inteiro.",
  },
  persistencia: {
    significa: "Persistência é continuar diante de obstáculos e recomeçar depois de uma frustração.",
    importa: "Quase todo objetivo que vale a pena passa por momentos difíceis — persistir é o que separa quem chega.",
    dica: "Quando bater vontade de desistir, faça só os próximos 5 minutos. Muitas vezes, isso reacende o ritmo.",
    desafio: "Retome uma tarefa que você havia abandonado e dê a ela mais uma tentativa.",
  },
  resolucao: {
    significa: "Resolver problemas é quebrar algo complexo em passos possíveis até chegar à solução.",
    importa: "Essa é uma das habilidades mais valorizadas na escola, no trabalho e na vida.",
    dica: "Diante de um problema, escreva-o em uma frase e liste 3 caminhos possíveis antes de escolher um.",
    desafio: "Pegue um problema real e resolva-o descrevendo os passos que você seguiu.",
  },
  mestre: {
    significa: "Você levou os três pilares — Organização, Foco e Criatividade — ao máximo.",
    importa: "Isso mostra domínio sobre a sua própria mente e sobre a forma como você aprende e age.",
    dica: "Compartilhe uma estratégia que funcionou para você com alguém que está começando.",
    desafio: "Escolha um novo objetivo desafiador e aplique tudo o que desenvolveu na jornada.",
  },
};

export function mentorFor(id: SkillId): MentorContent {
  return MENTOR[id];
}

/**
 * Ponto de extensão para a IA-mentora. No futuro, receberá idade, nível,
 * histórico e objetivos do usuário para gerar uma orientação personalizada.
 * Por ora retorna o conteúdo curado base.
 */
export function personalizeHook(id: SkillId): MentorContent {
  return mentorFor(id);
}
