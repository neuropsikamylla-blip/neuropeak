import { avaliarEstrutura } from "./estrutura";
import {
  textoDaPistaComposta,
  textoDasExclusoes,
  textoDaRestricao,
  verificarTextoPista,
  type GramaticaTema,
} from "./gramatica";
import { contarSolucoes } from "./solver";
import type {
  Categoria,
  Item,
  Pista,
  Puzzle,
  PuzzleMetadata,
  Restricao,
  Solucao,
  TipoPista,
} from "./tipos";

export interface TemaGrade {
  id: string;
  titulo: string;
  contexto: string;
  rotulosPosicao: readonly string[];
  categorias: readonly Categoria[];
  gramatica: GramaticaTema;
  nivel?: 2 | 3 | 4 | 5;
}

export interface ResultadoGeracao {
  seed: string;
  puzzles: Puzzle[];
  tentativas: Record<string, number>;
  fusoes: Record<string, number>;
}

interface Candidata {
  texto: string;
  restricoes: Restricao[];
  peso: number;
}

type RestricaoSemId<T extends Restricao = Restricao> = T extends unknown
  ? Omit<T, "id">
  : never;

type Aleatorio = () => number;

const gramaticaPessoa = {
  animado: true,
  sujeito: (valor: string) => valor,
  predicado: (valor: string) => `é ${valor}`,
  referencia: (valor: string) => valor,
};

export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
  {
    id: "consultas-manha",
    titulo: "Consultas da manhã",
    contexto: "Quatro pacientes foram atendidos pela manhã. Organize pacientes, especialidades e salas.",
    rotulosPosicao: ["8h", "9h", "10h", "11h"],
    categorias: [
      { id: "paciente", label: "Paciente", valores: ["Alice", "Décio", "Íris", "Rafa"] },
      { id: "especialidade", label: "Especialidade", valores: ["Cardiologia", "Nutrição", "Ortopedia", "Psicologia"] },
      { id: "sala", label: "Sala", valores: ["Âmbar", "Coral", "Jade", "Névoa"] },
    ],
    gramatica: {
      categorias: {
        paciente: gramaticaPessoa,
        especialidade: {
          animado: false,
          sujeito: (valor) => `A pessoa que foi à ${valor}`,
          predicado: (valor) => `foi à ${valor}`,
          referencia: (valor) => `a pessoa que foi à ${valor}`,
        },
        sala: {
          animado: false,
          sujeito: (valor) => `A pessoa que usou a sala ${valor}`,
          predicado: (valor) => `usou a sala ${valor}`,
          referencia: (valor) => `a pessoa que usou a sala ${valor}`,
        },
      },
      ordem: {
        antesDe: "teve consulta antes de",
        imediatamenteAntesDe: "teve consulta imediatamente antes de",
        vizinhas: "tiveram consultas em horários vizinhos",
        entre: "teve consulta entre",
      },
    },
  },
  {
    id: "turnos-cafeteria",
    titulo: "Turnos na cafeteria",
    contexto: "Quatro baristas trabalharam em dias diferentes. Organize baristas, preparos e postos.",
    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta"],
    categorias: [
      { id: "barista", label: "Barista", valores: ["Bruno", "Ester", "Nara", "Tulio"] },
      { id: "preparo", label: "Preparo", valores: ["Espresso", "Filtrado", "Gelado", "Prensa"] },
      { id: "posto", label: "Posto", valores: ["Balcão", "Caixa", "Forno", "Salão"] },
    ],
    gramatica: {
      categorias: {
        barista: gramaticaPessoa,
        preparo: {
          animado: false,
          sujeito: (valor) => `O barista que preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
          predicado: (valor) => `preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
          referencia: (valor) => `o barista que preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
        },
        posto: {
          animado: false,
          sujeito: (valor) => `O barista do posto ${valor}`,
          predicado: (valor) => `ficou no ${valor}`,
          referencia: (valor) => `o barista do posto ${valor}`,
        },
      },
      ordem: {
        antesDe: "trabalhou antes de",
        imediatamenteAntesDe: "trabalhou imediatamente antes de",
        vizinhas: "trabalharam em dias vizinhos",
        entre: "trabalhou entre",
      },
    },
  },
  {
    id: "sessoes-cineclube",
    titulo: "Sessões do cineclube",
    contexto: "Quatro filmes foram exibidos em sessões diferentes. Organize filmes, curadores e gêneros.",
    rotulosPosicao: ["18h", "19h30", "21h", "22h30"],
    categorias: [
      { id: "filme", label: "Filme", valores: ["Correnteza", "Estuário", "Miragem", "Vertigem"] },
      { id: "curador", label: "Curador", valores: ["Ciro", "Lena", "Otto", "Vera"] },
      { id: "genero", label: "Gênero", valores: ["Documentário", "Drama", "Policial", "Suspense"] },
    ],
    gramatica: {
      categorias: {
        filme: {
          animado: false,
          sujeito: (valor) => valor,
          predicado: (valor) => `é ${valor}`,
          referencia: (valor) => valor,
        },
        curador: {
          animado: true,
          // "Quem foi apresentado por Ciro" trataria um FILME como pessoa.
          sujeito: (valor) => `O filme apresentado por ${valor}`,
          predicado: (valor) => `foi apresentado por ${valor}`,
          referencia: (valor) => `o filme apresentado por ${valor}`,
        },
        genero: {
          animado: false,
          sujeito: (valor) => `O ${valor}`,
          predicado: (valor) => `é um ${valor}`,
          referencia: (valor) => `o ${valor}`,
        },
      },
      ordem: {
        antesDe: "foi exibido antes de",
        imediatamenteAntesDe: "foi exibido imediatamente antes de",
        vizinhas: "foram exibidos em horários vizinhos",
        entre: "foi exibido entre",
      },
    },
  },
  {
    id: "oficinas-centro-cultural",
    titulo: "Oficinas no centro cultural",
    contexto: "Quatro oficinas aconteceram em horários diferentes. Organize oficinas, mediadores e espaços.",
    rotulosPosicao: ["14h", "15h", "16h", "17h"],
    categorias: [
      { id: "oficina", label: "Oficina", valores: ["Cerâmica", "Fotografia", "Marcenaria", "Tecelagem"] },
      { id: "mediador", label: "Mediador", valores: ["Alma", "Iuri", "Sol", "Zeca"] },
      { id: "espaco", label: "Espaço", valores: ["Ateliê", "Galpão", "Mezanino", "Pátio"] },
    ],
    gramatica: {
      categorias: {
        oficina: {
          animado: false,
          sujeito: (valor) => `A oficina de ${valor}`,
          predicado: (valor) => `é a oficina de ${valor}`,
          referencia: (valor) => `a oficina de ${valor}`,
        },
        mediador: {
          animado: true,
          // "a oficina de Sol" colidia com "a oficina de Marcenaria": mesma forma para o
          // mediador e para o nome da oficina. O paciente não tem como saber qual é qual.
          sujeito: (valor) => `A oficina mediada por ${valor}`,
          predicado: (valor) => `foi mediada por ${valor}`,
          referencia: (valor) => `a oficina mediada por ${valor}`,
        },
        espaco: {
          animado: false,
          sujeito: (valor) => `A oficina que ocupou o ${valor}`,
          predicado: (valor) => `ocupou o ${valor}`,
          referencia: (valor) => `a oficina que ocupou o ${valor}`,
        },
      },
      ordem: {
        antesDe: "aconteceu antes de",
        imediatamenteAntesDe: "aconteceu imediatamente antes de",
        vizinhas: "aconteceram em horários vizinhos",
        entre: "aconteceu entre",
      },
    },
  },
];

export const TEMAS_NIVEL_3: readonly TemaGrade[] = [
  {
    id: "consultorio-odontologico",
    titulo: "Consultório odontológico",
    contexto: "Quatro consultas odontológicas aconteceram pela manhã. Organize pacientes, procedimentos, convênios e dentistas.",
    nivel: 3,
    rotulosPosicao: ["8h", "9h", "10h", "11h"],
    categorias: [
      { id: "paciente", label: "Paciente", valores: ["Bento", "Célia", "Márcio", "Tereza"] },
      { id: "procedimento", label: "Procedimento", valores: ["Canal", "Clareamento", "Extração", "Limpeza"] },
      { id: "convenio", label: "Convênio", valores: ["Aurora", "Bemviver", "Consalud", "Vitalis"] },
      { id: "dentista", label: "Dentista", valores: ["Dr. Elias", "Dra. Norma", "Dr. Paulo", "Dra. Sônia"] },
    ],
    gramatica: {
      categorias: {
        paciente: {
          animado: true,
          sujeito: (valor) => `A consulta de ${valor}`,
          predicado: (valor) => `foi de ${valor}`,
          referencia: (valor) => `a consulta de ${valor}`,
        },
        procedimento: {
          animado: false,
          sujeito: (valor) => `A consulta com o procedimento ${valor}`,
          predicado: (valor) => `incluiu o procedimento ${valor}`,
          referencia: (valor) => `a consulta com o procedimento ${valor}`,
        },
        convenio: {
          animado: false,
          sujeito: (valor) => `A consulta pelo convênio ${valor}`,
          predicado: (valor) => `usou o convênio ${valor}`,
          referencia: (valor) => `a consulta pelo convênio ${valor}`,
        },
        dentista: {
          animado: true,
          sujeito: (valor) => `A consulta conduzida por ${valor}`,
          predicado: (valor) => `foi conduzida por ${valor}`,
          referencia: (valor) => `a consulta conduzida por ${valor}`,
        },
      },
      ordem: {
        antesDe: "aconteceu antes de",
        imediatamenteAntesDe: "aconteceu imediatamente antes de",
        vizinhas: "aconteceram em horários vizinhos",
        entre: "aconteceu entre",
      },
    },
  },
  {
    id: "estandes-feira-livro",
    titulo: "Estandes da feira do livro",
    contexto: "Quatro editoras ocuparam estandes diferentes. Organize editoras, gêneros, países e cores.",
    nivel: 3,
    rotulosPosicao: ["Estande 1", "Estande 2", "Estande 3", "Estande 4"],
    categorias: [
      { id: "editora", label: "Editora", valores: ["Alaúde", "Bordô", "Chama", "Duna"] },
      { id: "genero", label: "Gênero", valores: ["Ensaio", "Infantil", "Poesia", "Romance"] },
      { id: "pais", label: "País", valores: ["Chile", "Egito", "Irlanda", "Japão"] },
      { id: "cor", label: "Cor", valores: ["Azul", "Ocre", "Rubi", "Verde"] },
    ],
    gramatica: {
      categorias: {
        editora: {
          animado: false,
          sujeito: (valor) => `A editora ${valor}`,
          predicado: (valor) => `é a editora ${valor}`,
          referencia: (valor) => `a editora ${valor}`,
        },
        genero: {
          animado: false,
          sujeito: (valor) => `A editora do gênero ${valor}`,
          predicado: (valor) => `publicou o gênero ${valor}`,
          referencia: (valor) => `a editora do gênero ${valor}`,
        },
        pais: {
          animado: false,
          sujeito: (valor) => `A editora do país ${valor}`,
          predicado: (valor) => `representou o país ${valor}`,
          referencia: (valor) => `a editora do país ${valor}`,
        },
        cor: {
          animado: false,
          sujeito: (valor) => `A editora do estande ${valor}`,
          predicado: (valor) => `ficou no estande ${valor}`,
          referencia: (valor) => `a editora do estande ${valor}`,
        },
      },
      ordem: {
        antesDe: "ficou antes de",
        imediatamenteAntesDe: "ficou imediatamente antes de",
        vizinhas: "ficaram em estandes vizinhos",
        entre: "ficou entre",
      },
    },
  },
  {
    id: "consultas-nutricao",
    titulo: "Consultas de nutrição",
    contexto: "Quatro clientes vieram em dias diferentes. Organize clientes, objetivos, planos e bairros.",
    nivel: 3,
    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta"],
    categorias: [
      { id: "cliente", label: "Cliente", valores: ["Alan", "Diva", "Rute", "Vitor"] },
      { id: "objetivo", label: "Objetivo", valores: ["Desempenho", "Digestão", "Energia", "Sono"] },
      { id: "plano", label: "Plano", valores: ["Bronze", "Prata", "Ouro", "Platina"] },
      { id: "bairro", label: "Bairro", valores: ["Alvorada", "Boa Vista", "Cruzeiro", "Laranjeiras"] },
    ],
    gramatica: {
      categorias: {
        cliente: gramaticaPessoa,
        objetivo: {
          animado: false,
          sujeito: (valor) => `O cliente com objetivo de ${valor}`,
          predicado: (valor) => `buscou ${valor}`,
          referencia: (valor) => `o cliente com objetivo de ${valor}`,
        },
        plano: {
          animado: false,
          sujeito: (valor) => `O cliente do plano ${valor}`,
          predicado: (valor) => `usou o plano ${valor}`,
          referencia: (valor) => `o cliente do plano ${valor}`,
        },
        bairro: {
          animado: false,
          sujeito: (valor) => `O cliente do bairro ${valor}`,
          predicado: (valor) => `veio do bairro ${valor}`,
          referencia: (valor) => `o cliente do bairro ${valor}`,
        },
      },
      ordem: {
        antesDe: "veio antes de",
        imediatamenteAntesDe: "veio imediatamente antes de",
        vizinhas: "vieram em dias vizinhos",
        entre: "veio entre",
      },
    },
  },
  {
    id: "ensaios-orquestra",
    titulo: "Ensaios da orquestra",
    contexto: "Quatro naipes ensaiaram em horários diferentes. Organize naipes, regentes, peças e salas.",
    nivel: 3,
    rotulosPosicao: ["9h", "11h", "14h", "16h"],
    categorias: [
      { id: "naipe", label: "Naipe", valores: ["Cordas", "Madeiras", "Metais", "Percussão"] },
      { id: "regente", label: "Regente", valores: ["Ana Lúcia", "Fábio", "Marta", "Sérgio"] },
      { id: "peca", label: "Peça", valores: ["Alvorada", "Barcarola", "Cortejo", "Devaneio"] },
      { id: "sala", label: "Sala", valores: ["Anexo", "Concha", "Estúdio", "Foyer"] },
    ],
    gramatica: {
      categorias: {
        naipe: {
          animado: false,
          sujeito: (valor) => `O naipe de ${valor}`,
          predicado: (valor) => `é o naipe de ${valor}`,
          referencia: (valor) => `o naipe de ${valor}`,
        },
        regente: {
          animado: true,
          sujeito: (valor) => `O naipe regido por ${valor}`,
          predicado: (valor) => `foi regido por ${valor}`,
          referencia: (valor) => `o naipe regido por ${valor}`,
        },
        peca: {
          animado: false,
          sujeito: (valor) => `O naipe que tocou ${valor}`,
          predicado: (valor) => `tocou ${valor}`,
          referencia: (valor) => `o naipe que tocou ${valor}`,
        },
        sala: {
          animado: false,
          sujeito: (valor) => `O naipe da sala ${valor}`,
          predicado: (valor) => `ensaiou ${["Concha"].includes(valor) ? "na" : "no"} ${valor}`,
          referencia: (valor) => `o naipe da sala ${valor}`,
        },
      },
      ordem: {
        antesDe: "ensaiou antes de",
        imediatamenteAntesDe: "ensaiou imediatamente antes de",
        vizinhas: "ensaiaram em horários vizinhos",
        entre: "ensaiou entre",
      },
    },
  },
];

export const TEMAS_NIVEL_4: readonly TemaGrade[] = [
  {
    id: "atendimentos-fisioterapia",
    titulo: "Atendimentos da fisioterapia",
    contexto: "Cinco atendimentos de fisioterapia aconteceram pela manhã. Organize pacientes, regiões, recursos e fisioterapeutas.",
    nivel: 4,
    rotulosPosicao: ["7h", "8h", "9h", "10h", "11h"],
    categorias: [
      { id: "paciente", label: "Paciente", valores: ["Aline", "Caio", "Elza", "Nuno", "Wilma"] },
      { id: "regiao", label: "Região", valores: ["Coluna", "Joelho", "Ombro", "Punho", "Tornozelo"] },
      { id: "recurso", label: "Recurso", valores: ["Bola", "Elástico", "Esteira", "Halteres", "Prancha"] },
      { id: "fisioterapeuta", label: "Fisioterapeuta", valores: ["Dr. Ivo", "Dra. Lúcia", "Dr. Nei", "Dra. Olga", "Dra. Rita"] },
    ],
    gramatica: {
      categorias: {
        paciente: {
          animado: true,
          sujeito: (valor) => `O atendimento de ${valor}`,
          predicado: (valor) => `foi de ${valor}`,
          referencia: (valor) => `o atendimento de ${valor}`,
        },
        regiao: {
          animado: false,
          sujeito: (valor) => `O atendimento da região ${valor}`,
          predicado: (valor) => `tratou a região ${valor}`,
          referencia: (valor) => `o atendimento da região ${valor}`,
        },
        recurso: {
          animado: false,
          sujeito: (valor) => `O atendimento com ${valor}`,
          predicado: (valor) => `usou ${valor}`,
          referencia: (valor) => `o atendimento com ${valor}`,
        },
        fisioterapeuta: {
          animado: true,
          sujeito: (valor) => `O atendimento conduzido por ${valor}`,
          predicado: (valor) => `foi conduzido por ${valor}`,
          referencia: (valor) => `o atendimento conduzido por ${valor}`,
        },
      },
      ordem: {
        antesDe: "aconteceu antes de",
        imediatamenteAntesDe: "aconteceu imediatamente antes de",
        vizinhas: "aconteceram em horários vizinhos",
        entre: "aconteceu entre",
      },
    },
  },
  {
    id: "turnos-recepcao",
    titulo: "Turnos da recepção",
    contexto: "Cinco recepcionistas trabalharam em dias diferentes. Organize recepcionistas, tarefas, andares e uniformes.",
    nivel: 4,
    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    categorias: [
      { id: "recepcionista", label: "Recepcionista", valores: ["Bia", "Douglas", "Kátia", "Márcio", "Zilda"] },
      { id: "tarefa", label: "Tarefa", valores: ["Agendamentos", "Arquivo", "Cobrança", "Ligações", "Triagem"] },
      { id: "andar", label: "Andar", valores: ["Cobertura", "Mezanino", "Subsolo", "Térreo", "Sobreloja"] },
      { id: "uniforme", label: "Uniforme", valores: ["Areia", "Grafite", "Marinho", "Musgo", "Vinho"] },
    ],
    gramatica: {
      categorias: {
        recepcionista: gramaticaPessoa,
        tarefa: {
          animado: false,
          sujeito: (valor) => `A recepcionista responsável por ${valor}`,
          predicado: (valor) => `cuidou de ${valor}`,
          referencia: (valor) => `a recepcionista responsável por ${valor}`,
        },
        andar: {
          animado: false,
          sujeito: (valor) => `A recepcionista do andar ${valor}`,
          predicado: (valor) => `trabalhou ${["Cobertura", "Sobreloja"].includes(valor) ? "na" : "no"} ${valor}`,
          referencia: (valor) => `a recepcionista do andar ${valor}`,
        },
        uniforme: {
          animado: false,
          sujeito: (valor) => `A recepcionista de uniforme ${valor}`,
          predicado: (valor) => `usou o uniforme ${valor}`,
          referencia: (valor) => `a recepcionista de uniforme ${valor}`,
        },
      },
      ordem: {
        antesDe: "trabalhou antes de",
        imediatamenteAntesDe: "trabalhou imediatamente antes de",
        vizinhas: "trabalharam em dias vizinhos",
        entre: "trabalhou entre",
      },
    },
  },
  {
    id: "palestras-congresso",
    titulo: "Palestras do congresso",
    contexto: "Cinco palestrantes participaram do congresso. Organize palestrantes, temas, formatos e auditórios.",
    nivel: 4,
    rotulosPosicao: ["9h", "10h30", "13h", "14h30", "16h"],
    categorias: [
      { id: "palestrante", label: "Palestrante", valores: ["Aurora", "Ícaro", "Solange", "Teodoro", "Yara"] },
      { id: "tema", label: "Tema", valores: ["Ansiedade", "Linguagem", "Memória", "Sono", "Vínculos"] },
      { id: "formato", label: "Formato", valores: ["Debate", "Mesa", "Oficina", "Painel", "Roda"] },
      { id: "auditorio", label: "Auditório", valores: ["Bosque", "Cristal", "Lagoa", "Pedra", "Vento"] },
    ],
    gramatica: {
      categorias: {
        palestrante: gramaticaPessoa,
        tema: {
          animado: false,
          sujeito: (valor) => `O palestrante do tema ${valor}`,
          predicado: (valor) => `abordou ${valor}`,
          referencia: (valor) => `o palestrante do tema ${valor}`,
        },
        formato: {
          animado: false,
          sujeito: (valor) => `O palestrante do formato ${valor}`,
          predicado: (valor) => `participou ${["Mesa", "Oficina", "Roda"].includes(valor) ? "da" : "do"} ${valor}`,
          referencia: (valor) => `o palestrante do formato ${valor}`,
        },
        auditorio: {
          animado: false,
          sujeito: (valor) => `O palestrante do auditório ${valor}`,
          predicado: (valor) => `usou o auditório ${valor}`,
          referencia: (valor) => `o palestrante do auditório ${valor}`,
        },
      },
      ordem: {
        antesDe: "palestrou antes de",
        imediatamenteAntesDe: "palestrou imediatamente antes de",
        vizinhas: "palestraram em horários vizinhos",
        entre: "palestrou entre",
      },
    },
  },
  {
    id: "colheita-horta-comunitaria",
    titulo: "Colheita da horta comunitária",
    contexto: "Cinco equipes fizeram colheitas em semanas diferentes. Organize hortas, cultivos, responsáveis e destinos.",
    nivel: 4,
    rotulosPosicao: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
    categorias: [
      { id: "horta", label: "Horta", valores: ["Beira-Rio", "Encosta", "Morro", "Pomar", "Várzea"] },
      { id: "cultivo", label: "Cultivo", valores: ["Abóbora", "Alface", "Cenoura", "Quiabo", "Rúcula"] },
      { id: "responsavel", label: "Responsável", valores: ["Efigênia", "Joel", "Nadir", "Sebastião", "Vânia"] },
      { id: "destino", label: "Destino", valores: ["Creche", "Escola", "Feira", "Hospital", "Mercado"] },
    ],
    gramatica: {
      categorias: {
        horta: {
          animado: false,
          sujeito: (valor) => `A equipe da horta ${valor}`,
          predicado: (valor) => `fez a colheita na horta ${valor}`,
          referencia: (valor) => `a equipe da horta ${valor}`,
        },
        cultivo: {
          animado: false,
          sujeito: (valor) => `A equipe do cultivo ${valor}`,
          predicado: (valor) => `colheu ${valor}`,
          referencia: (valor) => `a equipe do cultivo ${valor}`,
        },
        responsavel: {
          animado: true,
          sujeito: (valor) => `A equipe liderada por ${valor}`,
          predicado: (valor) => `foi liderada por ${valor}`,
          referencia: (valor) => `a equipe liderada por ${valor}`,
        },
        destino: {
          animado: false,
          sujeito: (valor) => `A equipe do destino ${valor}`,
          predicado: (valor) => `entregou ao destino ${valor}`,
          referencia: (valor) => `a equipe do destino ${valor}`,
        },
      },
      ordem: {
        antesDe: "colheu antes de",
        imediatamenteAntesDe: "colheu imediatamente antes de",
        vizinhas: "colheram em semanas vizinhas",
        entre: "colheu entre",
      },
    },
  },
];

export const TEMAS_NIVEL_5: readonly TemaGrade[] = [
  {
    id: "plantao-pronto-socorro",
    titulo: "Plantão do pronto-socorro",
    contexto: "Cinco médicos atenderam durante o plantão. Organize médicos, queixas, exames, leitos e encaminhamentos.",
    nivel: 5,
    rotulosPosicao: ["18h", "20h", "22h", "0h", "2h"],
    categorias: [
      { id: "medico", label: "Médico", valores: ["Dr. Aldo", "Dra. Bruna", "Dr. Cássio", "Dra. Dora", "Dr. Elmo"] },
      { id: "queixa", label: "Queixa", valores: ["Cefaleia", "Fratura", "Náusea", "Tontura", "Tosse"] },
      { id: "exame", label: "Exame", valores: ["Ecografia", "Eletro", "Raio-X", "Sangue", "Urina"] },
      { id: "leito", label: "Leito", valores: ["Amarelo", "Branco", "Cinza", "Laranja", "Roxo"] },
      { id: "encaminhamento", label: "Encaminhamento", valores: ["Alta", "Cirurgia", "Internação", "Observação", "Retorno"] },
    ],
    gramatica: {
      categorias: {
        medico: gramaticaPessoa,
        queixa: {
          animado: false,
          sujeito: (valor) => `O médico da queixa ${valor}`,
          predicado: (valor) => `atendeu a queixa ${valor}`,
          referencia: (valor) => `o médico da queixa ${valor}`,
        },
        exame: {
          animado: false,
          sujeito: (valor) => `O médico do exame ${valor}`,
          predicado: (valor) => `solicitou o exame ${valor}`,
          referencia: (valor) => `o médico do exame ${valor}`,
        },
        leito: {
          animado: false,
          sujeito: (valor) => `O médico do leito ${valor}`,
          predicado: (valor) => `usou o leito ${valor}`,
          referencia: (valor) => `o médico do leito ${valor}`,
        },
        encaminhamento: {
          animado: false,
          sujeito: (valor) => `O médico que encaminhou para ${valor}`,
          // Voz ATIVA: quem recebe encaminhamento é o paciente, não o médico.
          predicado: (valor) => `encaminhou para ${valor}`,
          referencia: (valor) => `o médico que encaminhou para ${valor}`,
        },
      },
      ordem: {
        antesDe: "atendeu antes de",
        imediatamenteAntesDe: "atendeu imediatamente antes de",
        vizinhas: "atenderam em horários vizinhos",
        entre: "atendeu entre",
      },
    },
  },
  {
    id: "semana-restaurante",
    titulo: "Semana do restaurante",
    contexto: "Cinco pratos foram servidos em dias diferentes. Organize pratos, chefs, acompanhamentos, sobremesas e salas.",
    nivel: 5,
    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    categorias: [
      { id: "prato", label: "Prato", valores: ["Bobó", "Escondidinho", "Moqueca", "Risoto", "Vatapá"] },
      { id: "chef", label: "Chef", valores: ["Aparecida", "Dionísio", "Genoveva", "Leandro", "Otávio"] },
      { id: "acompanhamento", label: "Acompanhamento", valores: ["Chuchu", "Farofa", "Pirão", "Salada", "Vinagrete"] },
      { id: "sobremesa", label: "Sobremesa", valores: ["Cocada", "Manjar", "Pavê", "Pudim", "Quindim"] },
      { id: "sala", label: "Sala", valores: ["Adega", "Jardim", "Mezanino", "Terraço", "Varanda"] },
    ],
    gramatica: {
      categorias: {
        prato: {
          animado: false,
          sujeito: (valor) => `O prato ${valor}`,
          predicado: (valor) => `foi o prato ${valor}`,
          referencia: (valor) => `o prato ${valor}`,
        },
        chef: {
          animado: true,
          sujeito: (valor) => `O prato preparado por ${valor}`,
          predicado: (valor) => `foi preparado por ${valor}`,
          referencia: (valor) => `o prato preparado por ${valor}`,
        },
        acompanhamento: {
          animado: false,
          sujeito: (valor) => `O prato do acompanhamento ${valor}`,
          predicado: (valor) => `veio com o acompanhamento ${valor}`,
          referencia: (valor) => `o prato do acompanhamento ${valor}`,
        },
        sobremesa: {
          animado: false,
          sujeito: (valor) => `O prato da sobremesa ${valor}`,
          predicado: (valor) => `veio com a sobremesa ${valor}`,
          referencia: (valor) => `o prato da sobremesa ${valor}`,
        },
        sala: {
          animado: false,
          sujeito: (valor) => `O prato da sala ${valor}`,
          predicado: (valor) => `foi servido ${["Adega", "Varanda"].includes(valor) ? "na" : "no"} ${valor}`,
          referencia: (valor) => `o prato da sala ${valor}`,
        },
      },
      ordem: {
        antesDe: "foi servido antes de",
        imediatamenteAntesDe: "foi servido imediatamente antes de",
        vizinhas: "foram servidos em dias vizinhos",
        entre: "foi servido entre",
      },
    },
  },
  {
    id: "trilhas-parque",
    titulo: "Trilhas do parque",
    contexto: "Cinco guias conduziram trilhas diferentes. Organize guias, biomas, durações, atrativos e níveis.",
    nivel: 5,
    rotulosPosicao: ["Trilha 1", "Trilha 2", "Trilha 3", "Trilha 4", "Trilha 5"],
    categorias: [
      { id: "guia", label: "Guia", valores: ["Benedita", "Firmino", "Iolanda", "Ubirajara", "Zulmira"] },
      { id: "bioma", label: "Bioma", valores: ["Campo", "Cerrado", "Mangue", "Mata", "Restinga"] },
      { id: "duracao", label: "Duração", valores: ["Curta", "Média", "Longa", "Extensa", "Integral"] },
      { id: "atrativo", label: "Atrativo", valores: ["Cachoeira", "Gruta", "Lago", "Mirante", "Ruína"] },
      { id: "nivel", label: "Nível", valores: ["Fácil", "Leve", "Moderado", "Difícil", "Severo"] },
    ],
    gramatica: {
      categorias: {
        guia: gramaticaPessoa,
        bioma: {
          animado: false,
          sujeito: (valor) => `O guia do bioma ${valor}`,
          predicado: (valor) => `guiou no bioma ${valor}`,
          referencia: (valor) => `o guia do bioma ${valor}`,
        },
        duracao: {
          animado: false,
          sujeito: (valor) => `O guia da trilha com duração ${valor}`,
          predicado: (valor) => `guiou a trilha com duração ${valor}`,
          referencia: (valor) => `o guia da trilha com duração ${valor}`,
        },
        atrativo: {
          animado: false,
          sujeito: (valor) => `O guia do atrativo ${valor}`,
          predicado: (valor) => `visitou o atrativo ${valor}`,
          referencia: (valor) => `o guia do atrativo ${valor}`,
        },
        nivel: {
          animado: false,
          sujeito: (valor) => `O guia do nível ${valor}`,
          predicado: (valor) => `conduziu a trilha de nível ${valor}`,
          referencia: (valor) => `o guia do nível ${valor}`,
        },
      },
      ordem: {
        antesDe: "guiou antes de",
        imediatamenteAntesDe: "guiou imediatamente antes de",
        vizinhas: "guiaram trilhas vizinhas",
        entre: "guiou entre",
      },
    },
  },
  {
    id: "exposicao-museu",
    titulo: "Exposição do museu",
    contexto: "Cinco obras foram expostas em salas diferentes. Organize obras, artistas, técnicas, décadas e doadores.",
    nivel: 5,
    rotulosPosicao: ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"],
    categorias: [
      { id: "obra", label: "Obra", valores: ["Aurora", "Clepsidra", "Estuário", "Ninho", "Vertigem"] },
      { id: "artista", label: "Artista", valores: ["Anísio", "Gilda", "Hermínia", "Rodolfo", "Wanda"] },
      { id: "tecnica", label: "Técnica", valores: ["Aquarela", "Bronze", "Gravura", "Óleo", "Têxtil"] },
      { id: "decada", label: "Década", valores: ["Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"] },
      { id: "doador", label: "Doador", valores: ["Almeida", "Barroso", "Camargo", "Dutra", "Esteves"] },
    ],
    gramatica: {
      categorias: {
        obra: {
          animado: false,
          sujeito: (valor) => `A obra ${valor}`,
          predicado: (valor) => `é a obra ${valor}`,
          referencia: (valor) => `a obra ${valor}`,
        },
        artista: {
          animado: true,
          sujeito: (valor) => `A obra de ${valor}`,
          predicado: (valor) => `é de ${valor}`,
          referencia: (valor) => `a obra de ${valor}`,
        },
        tecnica: {
          animado: false,
          sujeito: (valor) => `A obra em ${valor}`,
          predicado: (valor) => `foi feita em ${valor}`,
          referencia: (valor) => `a obra em ${valor}`,
        },
        decada: {
          animado: false,
          sujeito: (valor) => `A obra dos anos ${valor}`,
          predicado: (valor) => `é dos anos ${valor}`,
          referencia: (valor) => `a obra dos anos ${valor}`,
        },
        doador: {
          animado: false,
          sujeito: (valor) => `A obra doada por ${valor}`,
          predicado: (valor) => `foi doada por ${valor}`,
          referencia: (valor) => `a obra doada por ${valor}`,
        },
      },
      ordem: {
        antesDe: "foi exposta antes de",
        imediatamenteAntesDe: "foi exposta imediatamente antes de",
        vizinhas: "foram expostas em salas vizinhas",
        entre: "foi exposta entre",
      },
    },
  },
];

export const TODOS_OS_TEMAS: readonly TemaGrade[] = [
  ...TEMAS_NIVEL_2,
  ...TEMAS_NIVEL_3,
  ...TEMAS_NIVEL_4,
  ...TEMAS_NIVEL_5,
];

function moldeDeReferencia(referencia: string, valor: string): string {
  return referencia
    .split(valor)
    .join("{valor}")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

/** Retorna a ambiguidade encontrada ou `null` quando os moldes são distintos. */
export function verificarAmbiguidadeDeReferencia(tema: TemaGrade): string | null {
  const moldesPorCategoria = tema.categorias.map((categoria) => {
    const gramatica = tema.gramatica.categorias[categoria.id];
    if (gramatica === undefined) {
      return { categoria, moldes: new Set<string>() };
    }
    return {
      categoria,
      moldes: new Set(categoria.valores.map((valor) =>
        moldeDeReferencia(gramatica.referencia(valor), valor)
      )),
    };
  });

  for (let a = 0; a < moldesPorCategoria.length; a += 1) {
    for (let b = a + 1; b < moldesPorCategoria.length; b += 1) {
      const primeira = moldesPorCategoria[a];
      const segunda = moldesPorCategoria[b];
      const moldeRepetido = [...primeira.moldes].find((molde) => segunda.moldes.has(molde));
      if (moldeRepetido !== undefined) {
        return `As categorias "${primeira.categoria.id}" e "${segunda.categoria.id}" usam o mesmo molde de referência: ${moldeRepetido}.`;
      }
    }
  }
  return null;
}

/** Retorna o uso indevido de "Quem" ou `null` quando a animação está coerente. */
export function verificarUsoDeQuem(tema: TemaGrade): string | null {
  for (const categoria of tema.categorias) {
    const gramatica = tema.gramatica.categorias[categoria.id];
    if (gramatica === undefined) {
      return `Não há gramática para a categoria "${categoria.id}".`;
    }
    if (gramatica.animado) continue;
    for (const valor of categoria.valores) {
      if (/^quem\b/i.test(gramatica.sujeito(valor).trim())) {
        return `O sujeito da categoria inanimada "${categoria.id}" começa com "Quem".`;
      }
      if (/^quem\b/i.test(gramatica.referencia(valor).trim())) {
        return `A referência da categoria inanimada "${categoria.id}" começa com "Quem".`;
      }
    }
  }
  return null;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let indice = 0; indice < seed.length; indice += 1) {
    hash ^= seed.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function criarAleatorio(seed: string): Aleatorio {
  let estado = hashSeed(seed);
  return () => {
    estado += 0x6d2b79f5;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar<T>(itens: readonly T[], aleatorio: Aleatorio): T[] {
  const resultado = [...itens];
  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const outro = Math.floor(aleatorio() * (indice + 1));
    [resultado[indice], resultado[outro]] = [resultado[outro], resultado[indice]];
  }
  return resultado;
}

function iguais(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((valor, indice) => valor === b[indice]);
}

function montarCategoriasESolucao(
  tema: TemaGrade,
  aleatorio: Aleatorio
): { categorias: Categoria[]; solucao: Solucao } {
  const solucao: Solucao = {};
  const categorias = tema.categorias.map((categoria) => {
    const ordemSolucao = embaralhar(categoria.valores, aleatorio);
    let ordemDeclarada = embaralhar(categoria.valores, aleatorio);
    solucao[categoria.id] = ordemSolucao;
    return { categoria, ordemSolucao, ordemDeclarada };
  });

  let coincidencias = 0;
  for (const entrada of categorias) {
    if (!iguais(entrada.ordemSolucao, entrada.ordemDeclarada)) continue;
    coincidencias += 1;
    if (coincidencias > 1) {
      entrada.ordemDeclarada = [
        ...entrada.ordemDeclarada.slice(1),
        entrada.ordemDeclarada[0],
      ];
    }
  }

  return {
    categorias: categorias.map(({ categoria, ordemDeclarada }) => ({
      ...categoria,
      valores: ordemDeclarada,
    })),
    solucao,
  };
}

function chaveItem(item: Item): string {
  return JSON.stringify([item.categoria, item.valor]);
}

function categoriasDaRestricao(restricao: Restricao): Set<string> {
  const itens: Item[] = [];
  if ("item" in restricao) itens.push(restricao.item);
  if ("itemA" in restricao) itens.push(restricao.itemA);
  if ("itemB" in restricao) itens.push(restricao.itemB);
  if ("itemC" in restricao) itens.push(restricao.itemC);
  if ("itemD" in restricao) itens.push(restricao.itemD);
  return new Set(itens.map((item) => item.categoria));
}

function candidataSimples(
  restricao: Restricao,
  tema: TemaGrade
): Candidata {
  const cross = categoriasDaRestricao(restricao).size > 1;
  return {
    texto: textoDaRestricao(restricao, tema.gramatica, tema.rotulosPosicao),
    restricoes: [restricao],
    peso: cross ? 12 : 1,
  };
}

function criarPool(tema: TemaGrade, puzzle: Puzzle): Candidata[] {
  let proximoId = 1;
  const restricao = (valor: RestricaoSemId): Restricao => ({
    ...valor,
    id: `candidata-${proximoId++}`,
  } as Restricao);
  const candidatas: Candidata[] = [];
  const posicaoPorItem = new Map<string, number>();
  const itens: Item[] = [];

  for (const categoria of puzzle.categorias) {
    for (const valor of categoria.valores) {
      const item = { categoria: categoria.id, valor };
      itens.push(item);
      posicaoPorItem.set(chaveItem(item), puzzle.solucao[categoria.id].indexOf(valor));
    }
  }
  const posicao = (item: Item): number => posicaoPorItem.get(chaveItem(item)) ?? -1;

  for (const item of itens) {
    candidatas.push(candidataSimples(restricao({ tipo: "T3", item, posicao: posicao(item) + 1 }), tema));
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = 0; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (itemA.categoria === itemB.categoria) continue;
      if (posicao(itemA) === posicao(itemB)) {
        candidatas.push(candidataSimples(restricao({ tipo: "T1", itemA, itemB }), tema));
        candidatas.push(candidataSimples(restricao({ tipo: "T8", itemA, itemB }), tema));
      } else {
        candidatas.push(candidataSimples(restricao({ tipo: "T2", itemA, itemB }), tema));
      }
    }
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = 0; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (a === b || posicao(itemA) >= posicao(itemB)) continue;
      candidatas.push(candidataSimples(restricao({ tipo: "T4", itemA, itemB }), tema));
      candidatas.push(candidataSimples(restricao({ tipo: "T11", itemA, itemB }), tema));
      if (posicao(itemB) - posicao(itemA) === 1) {
        candidatas.push(candidataSimples(restricao({ tipo: "T6", itemA, itemB }), tema));
      }
    }
  }

  for (let a = 0; a < itens.length; a += 1) {
    for (let b = a + 1; b < itens.length; b += 1) {
      const itemA = itens[a];
      const itemB = itens[b];
      if (Math.abs(posicao(itemA) - posicao(itemB)) !== 1) continue;
      candidatas.push(candidataSimples(restricao({ tipo: "T5", itemA, itemB }), tema));
    }
  }

  for (const itemA of itens) {
    for (const itemC of itens) {
      for (const itemB of itens) {
        if (
          new Set([chaveItem(itemA), chaveItem(itemC), chaveItem(itemB)]).size < 3
          || !(posicao(itemA) < posicao(itemC) && posicao(itemC) < posicao(itemB))
        ) continue;
        candidatas.push(candidataSimples(restricao({ tipo: "T7", itemA, itemC, itemB }), tema));
      }
    }
  }

  for (const itemA of itens) {
    const alvos = itens.filter((item) =>
      item.categoria !== itemA.categoria && posicao(item) !== posicao(itemA)
    );
    for (let b = 0; b < alvos.length; b += 1) {
      for (let c = b + 1; c < alvos.length; c += 1) {
        const primeira = restricao({ tipo: "T2", itemA, itemB: alvos[b] });
        const segunda = restricao({ tipo: "T2", itemA, itemB: alvos[c] });
        candidatas.push({
          texto: textoDaPistaComposta(primeira, segunda, tema.gramatica),
          restricoes: [primeira, segunda],
          peso: 18,
        });
      }
    }
  }

  return candidatas;
}

function materializarPistas(candidatas: readonly Candidata[], prefixo: string): Pista[] {
  return candidatas.map((candidata, indice) => {
    const id = `${prefixo}-${indice + 1}`;
    return {
      id,
      texto: verificarTextoPista(candidata.texto),
      restricoes: candidata.restricoes.map((restricao, indiceRestricao) => ({
        ...restricao,
        id: `${id}#${indiceRestricao + 1}`,
      })),
    };
  });
}

function chaveSujeitoDeExclusao(pista: Pista): string | null {
  if (pista.restricoes.length === 0 || pista.restricoes.some((restricao) => restricao.tipo !== "T2")) {
    return null;
  }
  const [primeira] = pista.restricoes;
  if (primeira.tipo !== "T2") return null;
  return pista.restricoes.every((restricao) =>
    restricao.tipo === "T2"
    && restricao.itemA.categoria === primeira.itemA.categoria
    && restricao.itemA.valor === primeira.itemA.valor
  ) ? chaveItem(primeira.itemA) : null;
}

/** Funde, sem mudar a lógica, as pistas de exclusão que têm o mesmo sujeito. */
export function fundirExclusoes(
  pistas: readonly Pista[],
  gramatica: GramaticaTema
): Pista[] {
  const grupos = new Map<string, Pista[]>();
  for (const pista of pistas) {
    const chave = chaveSujeitoDeExclusao(pista);
    if (chave === null) continue;
    const grupo = grupos.get(chave) ?? [];
    grupo.push(pista);
    grupos.set(chave, grupo);
  }

  const emitidos = new Set<string>();
  return pistas.flatMap((pista) => {
    const chave = chaveSujeitoDeExclusao(pista);
    if (chave === null) return [pista];
    if (emitidos.has(chave)) return [];
    emitidos.add(chave);
    const grupo = grupos.get(chave) ?? [pista];
    if (grupo.length === 1) return [pista];

    // Só T2 entram aqui, e o tipo estreitado é o que permite ordenar por `itemB.categoria`.
    const unicas = new Map<string, Extract<Restricao, { tipo: "T2" }>>();
    for (const restricao of grupo.flatMap((item) => item.restricoes)) {
      if (restricao.tipo !== "T2") continue;
      unicas.set(chaveItem(restricao.itemB), restricao);
    }
    // Ordenar por CATEGORIA antes de escrever: sem isto as exclusões saem intercaladas e o
    // mesmo verbo reaparece no meio da frase — "não usou o convênio Consalud, nem foi conduzida
    // por Dra. Norma, nem usou o convênio Bemviver". Juntas, a elisão faz o resto do trabalho.
    // A ordem das restrições não altera a lógica: são conjunções.
    const ordemDaCategoria = new Map(
      [...unicas.values()].map((r) => r.itemB.categoria)
        .filter((cat, i, todas) => todas.indexOf(cat) === i)
        .map((cat, i) => [cat, i] as const)
    );
    const restricoes = [...unicas.values()]
      .sort((a, b) =>
        (ordemDaCategoria.get(a.itemB.categoria) ?? 0) - (ordemDaCategoria.get(b.itemB.categoria) ?? 0)
      )
      .map((restricao, indice) => ({
        ...restricao,
        id: `${pista.id}#${indice + 1}`,
      }));
    if (restricoes.length === 1) {
      return [{
        ...pista,
        texto: textoDaRestricao(restricoes[0], gramatica, []),
        restricoes,
      }];
    }
    return [{
      ...pista,
      texto: textoDasExclusoes(restricoes, gramatica),
      restricoes,
    }];
  });
}

function metadataInicial(nivel: Puzzle["nivel"]): PuzzleMetadata {
  return {
    complexity: 2,
    inferenceDepthDistribution: {},
    skillWeights: {},
    dominantOperations: [],
    clueTypeDistribution: {},
    expectedDifficulty: nivel,
    validatedUniqueSolution: true,
  };
}

function completarMetadata(puzzle: Puzzle): PuzzleMetadata {
  const relatorio = avaliarEstrutura(puzzle);
  const distribuicao: Partial<Record<TipoPista, number>> = {};
  for (const pista of puzzle.pistas) {
    for (const restricao of pista.restricoes) {
      distribuicao[restricao.tipo] = (distribuicao[restricao.tipo] ?? 0) + 1;
    }
  }
  const dominantes = (Object.entries(distribuicao) as [TipoPista, number][])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tipo]) => tipo);
  return {
    complexity: puzzle.pistas.length,
    inferenceDepthDistribution: relatorio.profundidadeInferencial.distribuicao,
    skillWeights: {
      exclusion: distribuicao.T2 ?? 0,
      relativeOrder: (distribuicao.T4 ?? 0) + (distribuicao.T7 ?? 0) + (distribuicao.T11 ?? 0),
      adjacency: (distribuicao.T5 ?? 0) + (distribuicao.T6 ?? 0),
      crossCategory: relatorio.restricoesCrossCategory,
      integrationDepth: relatorio.profundidadeInferencial.maxima,
      uncertaintyTolerance: 2,
    },
    dominantOperations: dominantes,
    clueTypeDistribution: distribuicao,
    expectedDifficulty: puzzle.nivel,
    validatedUniqueSolution: true,
  };
}

function gerarTentativa(tema: TemaGrade, seed: string): { puzzle: Puzzle; fusoes: number } {
  const aleatorio = criarAleatorio(seed);
  const { categorias, solucao } = montarCategoriasESolucao(tema, aleatorio);
  const base: Puzzle = {
    id: tema.id,
    titulo: tema.titulo,
    contexto: tema.contexto,
    nivel: tema.nivel ?? 2,
    posicoes: tema.rotulosPosicao.length,
    rotulosPosicao: [...tema.rotulosPosicao],
    categorias,
    pistas: [],
    solucao,
    metadata: metadataInicial(tema.nivel ?? 2),
  };
  const ordenadas = criarPool(tema, base)
    .map((candidata) => ({
      candidata,
      prioridade: -Math.log(Math.max(aleatorio(), Number.EPSILON)) / candidata.peso,
    }))
    .sort((a, b) => a.prioridade - b.prioridade)
    .map(({ candidata }) => candidata);

  let selecionadas: Candidata[] = [];
  for (const candidata of ordenadas) {
    selecionadas.push(candidata);
    base.pistas = materializarPistas(selecionadas, tema.id);
    if (contarSolucoes(base, 2) === 1) break;
  }
  if (contarSolucoes(base, 2) !== 1) {
    throw new Error(`O pool do tema ${tema.id} não produziu solução única.`);
  }

  for (const candidata of embaralhar(selecionadas, aleatorio)) {
    const semCandidata = selecionadas.filter((item) => item !== candidata);
    base.pistas = materializarPistas(semCandidata, tema.id);
    if (contarSolucoes(base, 2) === 1) selecionadas = semCandidata;
  }
  base.pistas = materializarPistas(selecionadas, tema.id);
  const solucoesAntesDaFusao = contarSolucoes(base, 2);
  const quantidadeAntesDaFusao = base.pistas.length;
  base.pistas = fundirExclusoes(base.pistas, tema.gramatica);
  const solucoesDepoisDaFusao = contarSolucoes(base, 2);
  if (solucoesDepoisDaFusao !== solucoesAntesDaFusao) {
    throw new Error(`A fusão de exclusões alterou a lógica do tema ${tema.id}.`);
  }
  for (const pista of base.pistas) verificarTextoPista(pista.texto);
  base.metadata = completarMetadata(base);
  return { puzzle: base, fusoes: quantidadeAntesDaFusao - base.pistas.length };
}

export function gerarPuzzles(
  temas: readonly TemaGrade[],
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  if (!Number.isInteger(limiteTentativas) || limiteTentativas < 1) {
    throw new Error("O limite de tentativas deve ser um inteiro positivo.");
  }
  const seedNormalizada = String(seed);
  const puzzles: Puzzle[] = [];
  const tentativas: Record<string, number> = {};
  const fusoes: Record<string, number> = {};

  for (const tema of temas) {
    const erroQuem = verificarUsoDeQuem(tema);
    if (erroQuem !== null) throw new Error(erroQuem);
    const erroAmbiguidade = verificarAmbiguidadeDeReferencia(tema);
    if (erroAmbiguidade !== null) throw new Error(erroAmbiguidade);
    let ultimoMotivo = "nenhuma tentativa executada";
    let encontrado: Puzzle | null = null;
    let fusoesEncontradas = 0;
    for (let tentativa = 1; tentativa <= limiteTentativas; tentativa += 1) {
      let resultadoTentativa: { puzzle: Puzzle; fusoes: number };
      try {
        resultadoTentativa = gerarTentativa(tema, `${seedNormalizada}:${tema.id}:${tentativa}`);
      } catch (erro) {
        ultimoMotivo = erro instanceof Error ? erro.message : String(erro);
        continue;
      }
      const { puzzle } = resultadoTentativa;
      const relatorio = avaliarEstrutura(puzzle);
      if (relatorio.aprovado) {
        encontrado = puzzle;
        fusoesEncontradas = resultadoTentativa.fusoes;
        tentativas[tema.id] = tentativa;
        break;
      }
      ultimoMotivo = relatorio.motivos.join("; ");
    }
    if (encontrado === null) {
      throw new Error(
        `Falha ao gerar ${tema.id} após ${limiteTentativas} tentativas: ${ultimoMotivo}.`
      );
    }
    puzzles.push(encontrado);
    fusoes[tema.id] = fusoesEncontradas;
  }
  return { seed: seedNormalizada, puzzles, tentativas, fusoes };
}

export function gerarProblemasNivel2(
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  return gerarPuzzles(TEMAS_NIVEL_2, seed, limiteTentativas);
}

export function gerarProblemasNivel3(
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  return gerarPuzzles(TEMAS_NIVEL_3, seed, limiteTentativas);
}

export function gerarProblemasNivel4(
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  return gerarPuzzles(TEMAS_NIVEL_4, seed, limiteTentativas);
}

export function gerarProblemasNivel5(
  seed: string | number,
  limiteTentativas = 2_000
): ResultadoGeracao {
  return gerarPuzzles(TEMAS_NIVEL_5, seed, limiteTentativas);
}

/** Serialização pura: o resultado é dado TypeScript legível e não executa geração em produção. */
export function emitirCodigoTypeScript(
  puzzles: readonly Puzzle[],
  nomeExportacao = "PROBLEMAS_NIVEL_2"
): string {
  return [
    'import type { Puzzle } from "../tipos";',
    "",
    "/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */",
    `export const ${nomeExportacao}: Puzzle[] = ${JSON.stringify(puzzles, null, 2)};`,
    "",
  ].join("\n");
}
