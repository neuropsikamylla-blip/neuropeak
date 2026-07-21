// ─────────────────────────────────────────────────────────────────────────────
// Histórias-semente do Investigadores da Situação Social.
// Conteúdo inicial para o exercício já funcionar. Figuras = emoji por ora (a
// Kamylla troca depois). Ancoradas na Biblioteca Clínica (situações SIT-*, pistas
// convergentes, distratores com erroTipo). Todas passam em validateStory().
// ─────────────────────────────────────────────────────────────────────────────

import type { SocialStory } from "@/lib/social/types";

const recreioColega: SocialStory = {
  id: "crianca-recreio-colega-novo",
  titulo: "Alguém novo no recreio",
  faixa: "crianca",
  nivel: 1,
  objetivoClinico: "Reconhecer tristeza/timidez por pistas convergentes e gerar uma ação social acolhedora.",
  habilidadeTreinada: ["RE", "TP", "RP"],
  ambiente: { id: "ENV-002", nome: "Pátio da escola" },
  personagens: [
    { id: "lara", nome: "Lara", papel: "colega nova", emoji: "👧" },
    { id: "bento", nome: "Bento", papel: "colega de turma", emoji: "🧒" },
  ],
  cenas: [
    {
      id: "c1",
      descricao: "No recreio, todo mundo está brincando. A Lara, que chegou essa semana, está sozinha num canto: de cabeça baixa, ombros caídos, olhando as outras crianças de longe.",
      contexto: "Primeira semana da Lara na escola.",
      personagens: ["lara", "bento"],
      perguntas: [
        {
          id: "c1q1", tipo: "emocao", eixo: "RE",
          enunciado: "Como a Lara parece estar se sentindo?",
          formato: "escolherExpressao",
          opcoes: [
            { id: "triste", texto: "😟 Triste e sozinha", correta: true },
            { id: "alegre", texto: "😀 Muito alegre", erroTipo: "leitura-emocional" },
            { id: "brava", texto: "😡 Brava", erroTipo: "leitura-emocional" },
          ],
          gabarito: "triste",
          dica1: "Olhe o corpo e o rosto dela.",
          dica2: "Cabeça baixa + ombros caídos + ficar de fora costumam vir junto com a tristeza.",
        },
        {
          id: "c1q2", tipo: "contexto", eixo: "CX",
          enunciado: "Quais pistas mostram isso?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "A cabeça baixa e os ombros caídos", correta: true },
            { id: "b", texto: "Ela está pulando e rindo alto", erroTipo: "ignorar-contexto" },
            { id: "c", texto: "Ela está comendo um lanche", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
          dica1: "Pista é o que dá para VER na cena.",
        },
        {
          id: "c1q3", tipo: "perspectiva", eixo: "TP",
          enunciado: "O que a Lara talvez esteja querendo?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Brincar com alguém, mas está tímida para chegar", correta: true },
            { id: "b", texto: "Ficar sozinha porque não gosta de ninguém", erroTipo: "erro-perspectiva" },
            { id: "c", texto: "Ir embora da escola para sempre", erroTipo: "super-interpretacao" },
          ],
          gabarito: "a",
          dica1: "Quem é novo costuma querer se aproximar, mas ter vergonha.",
        },
        {
          id: "c1q4", tipo: "solucao", eixo: "RP",
          enunciado: "O que seria legal o Bento fazer?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Chamar a Lara para brincar junto", correta: true },
            { id: "b", texto: "Continuar brincando e deixar a Lara de lado", erroTipo: "egocentrismo" },
            { id: "c", texto: "Avisar todo mundo que a Lara está sozinha", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
        },
      ],
    },
  ],
  notasProfissional: ["Trabalha reconhecimento de tristeza/timidez e ação pró-social."],
  meta: { versao: 1, contemIronia: false, ordemToM: 0, geradoPorIA: true, revisadoPor: "", aprovadoEm: "" },
};

const lancheDerrubado: SocialStory = {
  id: "crianca-lanche-derrubado",
  titulo: "Sem querer",
  faixa: "crianca",
  nivel: 2,
  objetivoClinico: "Separar fato de intenção (acidente × propósito) e reparar.",
  habilidadeTreinada: ["RE", "IN", "RP"],
  ambiente: { id: "ENV-003", nome: "Refeitório escolar" },
  personagens: [
    { id: "caio", nome: "Caio", papel: "colega", emoji: "🧒" },
    { id: "manu", nome: "Manu", papel: "colega", emoji: "👧" },
  ],
  cenas: [
    {
      id: "c1",
      descricao: "Correndo para a mesa, o Caio esbarra sem querer no braço da Manu e o suco dela cai no chão. A Manu arregala os olhos e franze a testa, olhando para o suco derramado.",
      contexto: "O Caio estava com pressa e não viu a Manu.",
      personagens: ["caio", "manu"],
      perguntas: [
        {
          id: "c1q1", tipo: "emocao", eixo: "RE",
          enunciado: "Como a Manu ficou?",
          formato: "escolherExpressao",
          opcoes: [
            { id: "surpresa", texto: "😲 Surpresa e chateada", correta: true },
            { id: "feliz", texto: "😀 Feliz", erroTipo: "leitura-emocional" },
            { id: "sono", texto: "😴 Com sono", erroTipo: "leitura-emocional" },
          ],
          gabarito: "surpresa",
          dica1: "Olhos arregalados + testa franzida logo depois de um susto.",
        },
        {
          id: "c1q2", tipo: "perspectiva", eixo: "IN",
          enunciado: "O Caio derrubou de propósito?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Não, foi sem querer: ele estava correndo e esbarrou", correta: true },
            { id: "b", texto: "Sim, ele quis derrubar o suco", erroTipo: "super-interpretacao" },
            { id: "c", texto: "A Manu derrubou sozinha", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
          dica1: "Pense no que a cena mostra: ele estava correndo e não viu.",
        },
        {
          id: "c1q3", tipo: "solucao", eixo: "RP",
          enunciado: "O que o Caio deveria fazer agora?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Pedir desculpas e ajudar a limpar", correta: true },
            { id: "b", texto: "Sair correndo e não falar nada", erroTipo: "egocentrismo" },
            { id: "c", texto: "Dizer que a culpa é da Manu", erroTipo: "fato-vs-interpretacao" },
          ],
          gabarito: "a",
        },
      ],
    },
  ],
  notasProfissional: ["Fato × intenção; reparação após um acidente."],
  meta: { versao: 1, contemIronia: false, ordemToM: 0, geradoPorIA: true, revisadoPor: "", aprovadoEm: "" },
};

const levantarMao: SocialStory = {
  id: "crianca-levantar-mao",
  titulo: "Na hora da aula",
  faixa: "crianca",
  nivel: 1,
  objetivoClinico: "Compreender uma regra social da sala e a reação dos colegas.",
  habilidadeTreinada: ["RS", "TP", "RP"],
  ambiente: { id: "ENV-001", nome: "Sala de aula" },
  personagens: [
    { id: "theo", nome: "Théo", papel: "aluno", emoji: "🧒" },
    { id: "profa", nome: "Professora", papel: "professora", emoji: "👩‍🏫" },
  ],
  cenas: [
    {
      id: "c1",
      descricao: "A professora faz uma pergunta para a turma. O Théo sabe a resposta e fica tão animado que grita bem alto, sem levantar a mão. Alguns colegas se viram para ele, assustados.",
      contexto: "Todos estavam em silêncio, esperando a vez de falar.",
      personagens: ["theo", "profa"],
      perguntas: [
        {
          id: "c1q1", tipo: "regras", eixo: "RS",
          enunciado: "O que o Théo esqueceu de fazer?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Levantar a mão e esperar a vez", correta: true },
            { id: "b", texto: "Nada, gritar a resposta está certo", erroTipo: "ignorar-contexto" },
            { id: "c", texto: "Sair da sala", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
          dica1: "Qual é a combinação da sala na hora de responder?",
        },
        {
          id: "c1q2", tipo: "perspectiva", eixo: "TP",
          enunciado: "Por que os colegas se viraram assustados?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Estranharam ele gritar de repente no silêncio", correta: true },
            { id: "b", texto: "Queriam brigar com o Théo", erroTipo: "super-interpretacao" },
            { id: "c", texto: "Porque também adoram gritar", erroTipo: "erro-perspectiva" },
          ],
          gabarito: "a",
        },
        {
          id: "c1q3", tipo: "solucao", eixo: "RP",
          enunciado: "Na próxima vez, o que o Théo pode fazer?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Levantar a mão e esperar a professora chamar", correta: true },
            { id: "b", texto: "Gritar ainda mais alto para responder primeiro", erroTipo: "egocentrismo" },
            { id: "c", texto: "Nunca mais responder nada", erroTipo: "super-interpretacao" },
          ],
          gabarito: "a",
        },
      ],
    },
  ],
  notasProfissional: ["Regra da sala + leitura da reação do grupo."],
  meta: { versao: 1, contemIronia: false, ordemToM: 0, geradoPorIA: true, revisadoPor: "", aprovadoEm: "" },
};

const mensagemSemResposta: SocialStory = {
  id: "adolescente-mensagem-sem-resposta",
  titulo: "Visto às 21h",
  faixa: "adolescente",
  nivel: 4,
  objetivoClinico: "Separar fato de interpretação e gerar hipóteses alternativas em contexto digital.",
  habilidadeTreinada: ["FI", "IN", "RP"],
  ambiente: { id: "ENV-099", nome: "Grupo de mensagens" },
  personagens: [
    { id: "bia", nome: "Bia", papel: "amiga", emoji: "👧" },
    { id: "rael", nome: "Rael", papel: "amigo", emoji: "👦" },
  ],
  cenas: [
    {
      id: "c1",
      descricao: "A Bia mandou uma mensagem convidando o Rael para estudar. Apareceu 'visto', mas passaram duas horas e ele não respondeu. A Bia começa a achar que o Rael está bravo com ela.",
      contexto: "Eles são amigos e nunca brigaram.",
      personagens: ["bia", "rael"],
      perguntas: [
        {
          id: "c1q1", tipo: "contexto", eixo: "FI",
          enunciado: "O que é FATO (dá para ter certeza pela cena)?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "O Rael viu a mensagem e ainda não respondeu", correta: true },
            { id: "b", texto: "O Rael está bravo com a Bia", erroTipo: "fato-vs-interpretacao" },
            { id: "c", texto: "O Rael não quer mais ser amigo dela", erroTipo: "super-interpretacao" },
          ],
          gabarito: "a",
          dica1: "Fato é só o que dá para provar pela cena; o resto é interpretação.",
        },
        {
          id: "c1q2", tipo: "perspectiva", eixo: "IN",
          enunciado: "Que outros motivos explicam ele não ter respondido?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Pode estar ocupado, sem tempo agora ou ter esquecido", correta: true },
            { id: "b", texto: "Só pode ser que ele odeia a Bia", erroTipo: "super-interpretacao" },
            { id: "c", texto: "Ele com certeza nunca viu a mensagem", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
          dica1: "Existem várias explicações além de 'está bravo'.",
        },
        {
          id: "c1q3", tipo: "solucao", eixo: "RP",
          enunciado: "O que a Bia pode fazer em vez de tirar conclusões?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Esperar um pouco ou perguntar com calma se ele viu", correta: true },
            { id: "b", texto: "Mandar 20 mensagens cobrando resposta", erroTipo: "egocentrismo" },
            { id: "c", texto: "Bloquear o Rael na hora", erroTipo: "super-interpretacao" },
          ],
          gabarito: "a",
        },
      ],
    },
  ],
  notasProfissional: ["Fato × interpretação e geração de hipóteses no digital."],
  meta: { versao: 1, contemIronia: false, ordemToM: 1, geradoPorIA: true, revisadoPor: "", aprovadoEm: "" },
};

const colegaCalado: SocialStory = {
  id: "adulto-colega-calado",
  titulo: "Na reunião",
  faixa: "adulto",
  nivel: 3,
  objetivoClinico: "Tomar a perspectiva de alguém novo e escolher uma ação acolhedora no trabalho.",
  habilidadeTreinada: ["RE", "TP", "RP"],
  ambiente: { id: "ENV-073", nome: "Sala de reunião" },
  personagens: [
    { id: "paulo", nome: "Paulo", papel: "colega novo", emoji: "🧑" },
    { id: "renata", nome: "Renata", papel: "gestora", emoji: "👩" },
  ],
  cenas: [
    {
      id: "c1",
      descricao: "Numa reunião, o Paulo, que entrou há poucos dias, fica calado, de braços cruzados e olhando para a mesa enquanto os outros falam.",
      contexto: "É a primeira reunião do Paulo com a equipe.",
      personagens: ["paulo", "renata"],
      perguntas: [
        {
          id: "c1q1", tipo: "emocao", eixo: "RE",
          enunciado: "Como o Paulo provavelmente está se sentindo?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Inseguro e tímido num grupo novo", correta: true },
            { id: "b", texto: "Entediado e sem respeito pela equipe", erroTipo: "leitura-emocional" },
            { id: "c", texto: "Bravo com todo mundo", erroTipo: "leitura-emocional" },
          ],
          gabarito: "a",
          dica1: "Alguém que acabou de chegar costuma ficar retraído.",
        },
        {
          id: "c1q2", tipo: "perspectiva", eixo: "TP",
          enunciado: "Por que uma pessoa nova agiria assim?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Ainda não se sente à vontade para falar", correta: true },
            { id: "b", texto: "Acha todos os colegas incompetentes", erroTipo: "super-interpretacao" },
            { id: "c", texto: "Não quer o emprego", erroTipo: "super-interpretacao" },
          ],
          gabarito: "a",
        },
        {
          id: "c1q3", tipo: "solucao", eixo: "RP",
          enunciado: "O que a Renata poderia fazer?",
          formato: "escolhaUnica",
          opcoes: [
            { id: "a", texto: "Abrir espaço e convidar a opinião dele com gentileza", correta: true },
            { id: "b", texto: "Seguir a reunião ignorando o Paulo", erroTipo: "egocentrismo" },
            { id: "c", texto: "Cobrar a participação dele na frente de todos", erroTipo: "ignorar-contexto" },
          ],
          gabarito: "a",
        },
      ],
    },
  ],
  notasProfissional: ["Tomada de perspectiva e acolhimento no ambiente de trabalho."],
  meta: { versao: 1, contemIronia: false, ordemToM: 1, geradoPorIA: true, revisadoPor: "", aprovadoEm: "" },
};

export const SEED_STORIES: SocialStory[] = [
  recreioColega, lancheDerrubado, levantarMao, mensagemSemResposta, colegaCalado,
];
