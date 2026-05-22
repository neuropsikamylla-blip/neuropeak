export interface ExerciseFunctional {
  scenario: string;
  strategies: string[];
  dailyTip: string;
}

export const EXERCISE_FUNCTIONAL: Record<string, ExerciseFunctional> = {
  "span-numerico": {
    scenario: "Lembrar o número do médico, o código da encomenda ou o número do ônibus sem anotar.",
    strategies: [
      "Repita o número em voz alta duas vezes antes de tentar memorizar.",
      "Agrupe os dígitos em pares: 47-32-15 é mais fácil que 473215.",
      "Crie uma imagem mental associada ao número.",
    ],
    dailyTip: "Ao receber um telefone ou senha, peça para repetir e anote sempre que possível — anotar não é sinal de fraqueza, é estratégia.",
  },
  "matriz-espacial": {
    scenario: "Lembrar onde guardou o remédio, as chaves ou o óculos dentro de casa.",
    strategies: [
      "Visualize o cômodo como um mapa e marque mentalmente o 'X' no local.",
      "Diga em voz alta: 'chaves na gaveta da entrada' no momento em que guarda.",
      "Crie locais fixos para objetos importantes — tire a memória da equação.",
    ],
    dailyTip: "Escolha um lugar fixo para cada objeto essencial. Com rotina, a memória espacial trabalha no automático.",
  },
  "jogo-memoria": {
    scenario: "Lembrar onde você viu cada item da lista de compras, qual remédio já tomou hoje, ou onde colocou cada pertence antes de sair de casa.",
    strategies: [
      "Antes de 'virar as cartas', faça uma varredura visual da tela inteira.",
      "Crie uma história curta ligando os pares que encontrar.",
      "Quando errar, pare — não clique rápido. Observe onde o par correto está.",
    ],
    dailyTip: "Ao guardar objetos, olhe para eles e diga o nome em voz alta. Isso ativa memória visual e verbal ao mesmo tempo.",
  },
  "nback": {
    scenario: "Acompanhar uma conversa longa e perceber quando o mesmo assunto já foi mencionado antes, sem perder o fio.",
    strategies: [
      "Repita mentalmente o estímulo atual enquanto aguarda o próximo.",
      "Use um 'ancorinha' — uma imagem ou palavra associada ao estímulo atual.",
      "Não tente antecipar; foque em comparar o atual com o que veio antes.",
    ],
    dailyTip: "Em conversas ou consultas, não hesite em perguntar: 'Você pode repetir?' ou 'Isso foi dito antes?' — manter o contexto é uma habilidade treinável.",
  },
  "trilha-visual": {
    scenario: "Seguir a sequência numerada de uma receita, de um manual de montagem ou das etapas de um procedimento médico.",
    strategies: [
      "Antes de clicar, percorra visualmente toda a trilha para ter o mapa na cabeça.",
      "Use o dedo para acompanhar na tela — o movimento físico ajuda a fixar.",
      "Se perder o fio, volte ao último número que você confirmou.",
    ],
    dailyTip: "Em manuais e receitas, marque cada etapa concluída com um traço. Ver o progresso visual reduz a carga de memória.",
  },
  "vigilancia": {
    scenario: "Ouvir seu nome chamado na sala de espera, identificar o número do ônibus certo, ou perceber o momento de tomar o remédio.",
    strategies: [
      "Defina mentalmente o 'sinal alvo' antes de começar a esperar.",
      "Mantenha o olhar móvel — varredura regular evita o entorpecimento da atenção.",
      "A cada minuto, faça uma verificação intencional: 'Estou prestando atenção no alvo?'",
    ],
    dailyTip: "Use alarmes ou lembretes visuais para tarefas que exigem atenção sustentada — não é dependência, é apoio cognitivo legítimo.",
  },
  "tempo-reacao": {
    scenario: "Reagir a tempo ao sinal do semáforo, ao chamado do próprio nome ou ao toque da campainha.",
    strategies: [
      "Respire fundo e mantenha os músculos relaxados — tensão atrasa a reação.",
      "Foque no estímulo correto antes que ele apareça — atenção preparatória acelera a resposta.",
      "Não tente compensar um erro sendo mais rápido; reinicie com calma.",
    ],
    dailyTip: "Pausas regulares durante atividades que exigem reação rápida ajudam a manter a velocidade. Fadiga é inimiga da reação.",
  },
  "decisao-rapida": {
    scenario: "Decidir na farmácia se é o remédio certo, escolher o ônibus correto em uma parada movimentada ou responder rapidamente quando alguém pergunta algo.",
    strategies: [
      "Confie na primeira impressão — ela geralmente usa o processamento mais rápido do cérebro.",
      "Reduza as opções antes de decidir: elimine o que claramente está errado.",
      "Reconheça quando a dúvida vem do cansaço — em situações de fadiga, peça ajuda.",
    ],
    dailyTip: "Prepare decisões rotineiras com antecedência: separe os remédios do dia antes, planeje a rota antes de sair. Isso reduz o custo cognitivo na hora.",
  },
  "identificacao-simbolos": {
    scenario: "Encontrar seu nome em uma lista, localizar um produto específico no mercado ou identificar a placa do ônibus em meio ao tráfego.",
    strategies: [
      "Faça uma varredura sistemática: da esquerda para a direita, de cima para baixo.",
      "Saiba exatamente o que está procurando antes de começar — tenha o 'alvo' claro na mente.",
      "Use o dedo ou um marcador para não perder a linha enquanto busca.",
    ],
    dailyTip: "Em listas ou etiquetas com letras pequenas, use o dedo como guia. Isso ancora a atenção e evita pular linhas.",
  },
  "torre-hanoi": {
    scenario: "Planejar a mudança de casa (o que sai primeiro, o que vai para cada cômodo), organizar tarefas do dia sem bloquear umas às outras.",
    strategies: [
      "Antes de agir, pense 2 ou 3 movimentos à frente.",
      "Identifique qual é o disco maior que você precisa mover e trabalhe para liberar o caminho.",
      "Se travar, desfaça o último movimento — retroceder é parte da estratégia.",
    ],
    dailyTip: "Para tarefas complexas do dia a dia, anote as etapas em papel antes de começar. Ver a sequência impressa alivia a memória de trabalho.",
  },
  "sequenciamento": {
    scenario: "Executar uma atividade cotidiana na ordem certa — preparar o café, trocar um curativo, organizar a mala — sem pular ou repetir etapas.",
    strategies: [
      "Antes de cada etapa, pergunte: 'O que precisa estar pronto para eu fazer isso?'",
      "Use checklists físicos para atividades com muitas etapas.",
      "Se perder a ordem, volte ao passo mais recente que você confirma ter feito.",
    ],
    dailyTip: "Para rotinas importantes, escreva as etapas em um cartão e deixe visível no local da tarefa. Rotina escrita vira autonomia.",
  },
  "flexibilidade-cognitiva": {
    scenario: "Quando o ônibus muda de rota, o consultório troca de andar ou a receita do médico é diferente da última — adaptar o plano sem travar.",
    strategies: [
      "Ao perceber a mudança, faça uma pausa de 2 segundos antes de agir — 'Qual é a nova regra?'",
      "Releia ou ouça novamente o que mudou antes de continuar.",
      "Normalize o erro de transição — o cérebro precisa de um momento para atualizar.",
    ],
    dailyTip: "Se alguém mudar um plano de última hora, peça para repetir a nova instrução. Confirmar a mudança em voz alta ajuda a gravar a nova rota.",
  },
  "labirinto": {
    scenario: "Navegar em hospital, shopping ou prédio desconhecido sem se perder, mesmo sem celular ou sinalização clara.",
    strategies: [
      "Identifique 3 pontos de referência visuais logo que entrar no local.",
      "Ao se perder, volte ao último ponto de referência que você lembra.",
      "Antes de avançar, olhe para trás — saber como o caminho de volta se parece é tão importante quanto o de ida.",
    ],
    dailyTip: "Em locais novos, tire foto da planta do local ou do mapa. Ter o mapa externo alivia o mapa mental que o cérebro precisa manter.",
  },
};
