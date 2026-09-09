import type { Puzzle } from "../tipos";

/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */
export const PROBLEMAS_NIVEL_4: Puzzle[] = [
  {
    "id": "atendimentos-fisioterapia",
    "titulo": "Atendimentos da fisioterapia",
    "contexto": "Cinco atendimentos de fisioterapia aconteceram pela manhã. Organize pacientes, regiões, recursos e fisioterapeutas.",
    "nivel": 4,
    "posicoes": 5,
    "rotulosPosicao": [
      "7h",
      "8h",
      "9h",
      "10h",
      "11h"
    ],
    "categorias": [
      {
        "id": "paciente",
        "label": "Paciente",
        "valores": [
          "Elza",
          "Caio",
          "Nuno",
          "Wilma",
          "Aline"
        ]
      },
      {
        "id": "regiao",
        "label": "Região",
        "valores": [
          "Punho",
          "Tornozelo",
          "Coluna",
          "Ombro",
          "Joelho"
        ]
      },
      {
        "id": "recurso",
        "label": "Recurso",
        "valores": [
          "Esteira",
          "Halteres",
          "Prancha",
          "Bola",
          "Elástico"
        ]
      },
      {
        "id": "fisioterapeuta",
        "label": "Fisioterapeuta",
        "valores": [
          "Dra. Lúcia",
          "Dra. Olga",
          "Dr. Nei",
          "Dr. Ivo",
          "Dra. Rita"
        ]
      }
    ],
    "pistas": [
      {
        "id": "atendimentos-fisioterapia-1",
        "texto": "O atendimento com Bola aconteceu entre o atendimento conduzido por Dr. Ivo e o atendimento conduzido por Dra. Olga, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "fisioterapeuta",
              "valor": "Dr. Ivo"
            },
            "itemC": {
              "categoria": "recurso",
              "valor": "Bola"
            },
            "itemB": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Olga"
            },
            "id": "atendimentos-fisioterapia-1#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-2",
        "texto": "O atendimento com Halteres não foi de Aline nem tratou a região Joelho.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recurso",
              "valor": "Halteres"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Aline"
            },
            "id": "atendimentos-fisioterapia-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recurso",
              "valor": "Halteres"
            },
            "itemB": {
              "categoria": "regiao",
              "valor": "Joelho"
            },
            "id": "atendimentos-fisioterapia-2#2"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-3",
        "texto": "O atendimento da região Tornozelo não foi conduzido por Dra. Olga.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "regiao",
              "valor": "Tornozelo"
            },
            "itemB": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Olga"
            },
            "id": "atendimentos-fisioterapia-3#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-4",
        "texto": "O atendimento com Halteres aconteceu entre o atendimento de Wilma e o atendimento da região Joelho, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "paciente",
              "valor": "Wilma"
            },
            "itemC": {
              "categoria": "recurso",
              "valor": "Halteres"
            },
            "itemB": {
              "categoria": "regiao",
              "valor": "Joelho"
            },
            "id": "atendimentos-fisioterapia-4#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-5",
        "texto": "O atendimento conduzido por Dra. Lúcia aconteceu entre o atendimento de Wilma e o atendimento de Elza, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "paciente",
              "valor": "Wilma"
            },
            "itemC": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Lúcia"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Elza"
            },
            "id": "atendimentos-fisioterapia-5#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-6",
        "texto": "O atendimento conduzido por Dra. Rita não foi de Elza.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Rita"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Elza"
            },
            "id": "atendimentos-fisioterapia-6#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-7",
        "texto": "O atendimento com Esteira não foi de Elza nem conduzido por Dr. Ivo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recurso",
              "valor": "Esteira"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Elza"
            },
            "id": "atendimentos-fisioterapia-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recurso",
              "valor": "Esteira"
            },
            "itemB": {
              "categoria": "fisioterapeuta",
              "valor": "Dr. Ivo"
            },
            "id": "atendimentos-fisioterapia-7#2"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-8",
        "texto": "O atendimento de Nuno não tratou a região Ombro nem usou Esteira.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "paciente",
              "valor": "Nuno"
            },
            "itemB": {
              "categoria": "regiao",
              "valor": "Ombro"
            },
            "id": "atendimentos-fisioterapia-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "paciente",
              "valor": "Nuno"
            },
            "itemB": {
              "categoria": "recurso",
              "valor": "Esteira"
            },
            "id": "atendimentos-fisioterapia-8#2"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-9",
        "texto": "O atendimento com Bola aconteceu entre o atendimento conduzido por Dr. Ivo e o atendimento com Esteira, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "fisioterapeuta",
              "valor": "Dr. Ivo"
            },
            "itemC": {
              "categoria": "recurso",
              "valor": "Bola"
            },
            "itemB": {
              "categoria": "recurso",
              "valor": "Esteira"
            },
            "id": "atendimentos-fisioterapia-9#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-10",
        "texto": "O atendimento da região Coluna aconteceu entre o atendimento da região Ombro e o atendimento com Bola, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "regiao",
              "valor": "Ombro"
            },
            "itemC": {
              "categoria": "regiao",
              "valor": "Coluna"
            },
            "itemB": {
              "categoria": "recurso",
              "valor": "Bola"
            },
            "id": "atendimentos-fisioterapia-10#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-11",
        "texto": "O atendimento conduzido por Dr. Ivo aconteceu entre o atendimento com Elástico e o atendimento com Bola, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "recurso",
              "valor": "Elástico"
            },
            "itemC": {
              "categoria": "fisioterapeuta",
              "valor": "Dr. Ivo"
            },
            "itemB": {
              "categoria": "recurso",
              "valor": "Bola"
            },
            "id": "atendimentos-fisioterapia-11#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-12",
        "texto": "O atendimento da região Coluna foi de Aline.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "regiao",
              "valor": "Coluna"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Aline"
            },
            "id": "atendimentos-fisioterapia-12#1"
          }
        ]
      },
      {
        "id": "atendimentos-fisioterapia-13",
        "texto": "O atendimento conduzido por Dra. Lúcia aconteceu entre o atendimento da região Punho e o atendimento conduzido por Dra. Olga, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "regiao",
              "valor": "Punho"
            },
            "itemC": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Lúcia"
            },
            "itemB": {
              "categoria": "fisioterapeuta",
              "valor": "Dra. Olga"
            },
            "id": "atendimentos-fisioterapia-13#1"
          }
        ]
      }
    ],
    "solucao": {
      "paciente": [
        "Wilma",
        "Nuno",
        "Aline",
        "Elza",
        "Caio"
      ],
      "regiao": [
        "Ombro",
        "Punho",
        "Coluna",
        "Tornozelo",
        "Joelho"
      ],
      "recurso": [
        "Elástico",
        "Halteres",
        "Prancha",
        "Bola",
        "Esteira"
      ],
      "fisioterapeuta": [
        "Dra. Rita",
        "Dr. Ivo",
        "Dra. Lúcia",
        "Dr. Nei",
        "Dra. Olga"
      ]
    },
    "metadata": {
      "complexity": 13,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 20
      },
      "skillWeights": {
        "exclusion": 8,
        "relativeOrder": 7,
        "adjacency": 0,
        "crossCategory": 16,
        "integrationDepth": 13,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T1"
      ],
      "clueTypeDistribution": {
        "T7": 7,
        "T2": 8,
        "T1": 1
      },
      "expectedDifficulty": 4,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "turnos-recepcao",
    "titulo": "Turnos da recepção",
    "contexto": "Cinco recepcionistas trabalharam em dias diferentes. Organize recepcionistas, tarefas, andares e uniformes.",
    "nivel": 4,
    "posicoes": 5,
    "rotulosPosicao": [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta"
    ],
    "categorias": [
      {
        "id": "recepcionista",
        "label": "Recepcionista",
        "valores": [
          "Zilda",
          "Márcio",
          "Douglas",
          "Kátia",
          "Bia"
        ]
      },
      {
        "id": "tarefa",
        "label": "Tarefa",
        "valores": [
          "Ligações",
          "Arquivo",
          "Agendamentos",
          "Triagem",
          "Cobrança"
        ]
      },
      {
        "id": "andar",
        "label": "Andar",
        "valores": [
          "Mezanino",
          "Sobreloja",
          "Térreo",
          "Subsolo",
          "Cobertura"
        ]
      },
      {
        "id": "uniforme",
        "label": "Uniforme",
        "valores": [
          "Musgo",
          "Grafite",
          "Areia",
          "Vinho",
          "Marinho"
        ]
      }
    ],
    "pistas": [
      {
        "id": "turnos-recepcao-1",
        "texto": "A recepcionista responsável por Agendamentos não é Márcio, nem Bia, nem usou o uniforme Areia, nem trabalhou no Subsolo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Agendamentos"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Márcio"
            },
            "id": "turnos-recepcao-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Agendamentos"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Bia"
            },
            "id": "turnos-recepcao-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Agendamentos"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Areia"
            },
            "id": "turnos-recepcao-1#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Agendamentos"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Subsolo"
            },
            "id": "turnos-recepcao-1#4"
          }
        ]
      },
      {
        "id": "turnos-recepcao-2",
        "texto": "Douglas não trabalhou no Subsolo nem na Cobertura.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Douglas"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Subsolo"
            },
            "id": "turnos-recepcao-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Douglas"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Cobertura"
            },
            "id": "turnos-recepcao-2#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-3",
        "texto": "A recepcionista responsável por Agendamentos trabalhou entre a recepcionista do andar Térreo e a recepcionista do andar Sobreloja, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "andar",
              "valor": "Térreo"
            },
            "itemC": {
              "categoria": "tarefa",
              "valor": "Agendamentos"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Sobreloja"
            },
            "id": "turnos-recepcao-3#1"
          }
        ]
      },
      {
        "id": "turnos-recepcao-4",
        "texto": "Kátia não trabalhou na Sobreloja, nem na Cobertura, nem cuidou de Triagem, nem usou o uniforme Musgo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Sobreloja"
            },
            "id": "turnos-recepcao-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Cobertura"
            },
            "id": "turnos-recepcao-4#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "itemB": {
              "categoria": "tarefa",
              "valor": "Triagem"
            },
            "id": "turnos-recepcao-4#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Musgo"
            },
            "id": "turnos-recepcao-4#4"
          }
        ]
      },
      {
        "id": "turnos-recepcao-5",
        "texto": "A recepcionista responsável por Cobrança trabalhou antes de Zilda.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Cobrança"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Zilda"
            },
            "id": "turnos-recepcao-5#1"
          }
        ]
      },
      {
        "id": "turnos-recepcao-6",
        "texto": "Kátia trabalhou antes da recepcionista de uniforme Grafite.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Grafite"
            },
            "id": "turnos-recepcao-6#1"
          }
        ]
      },
      {
        "id": "turnos-recepcao-8",
        "texto": "Zilda não cuidou de Ligações nem usou o uniforme Marinho.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Zilda"
            },
            "itemB": {
              "categoria": "tarefa",
              "valor": "Ligações"
            },
            "id": "turnos-recepcao-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Zilda"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Marinho"
            },
            "id": "turnos-recepcao-8#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-9",
        "texto": "A recepcionista responsável por Triagem não trabalhou na Sobreloja nem usou o uniforme Marinho.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Triagem"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Sobreloja"
            },
            "id": "turnos-recepcao-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Triagem"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Marinho"
            },
            "id": "turnos-recepcao-9#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-10",
        "texto": "Bia não trabalhou no Mezanino nem usou o uniforme Areia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Bia"
            },
            "itemB": {
              "categoria": "andar",
              "valor": "Mezanino"
            },
            "id": "turnos-recepcao-10#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Bia"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Areia"
            },
            "id": "turnos-recepcao-10#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-12",
        "texto": "A recepcionista responsável por Cobrança e a recepcionista de uniforme Areia trabalharam em dias vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "tarefa",
              "valor": "Cobrança"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Areia"
            },
            "id": "turnos-recepcao-12#1"
          }
        ]
      },
      {
        "id": "turnos-recepcao-13",
        "texto": "A recepcionista do andar Térreo não é Douglas, nem cuidou de Ligações, nem usou o uniforme Grafite, nem Vinho.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Térreo"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Douglas"
            },
            "id": "turnos-recepcao-13#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Térreo"
            },
            "itemB": {
              "categoria": "tarefa",
              "valor": "Ligações"
            },
            "id": "turnos-recepcao-13#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Térreo"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Grafite"
            },
            "id": "turnos-recepcao-13#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Térreo"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Vinho"
            },
            "id": "turnos-recepcao-13#4"
          }
        ]
      },
      {
        "id": "turnos-recepcao-14",
        "texto": "A recepcionista do andar Subsolo não é Márcio nem Kátia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Subsolo"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Márcio"
            },
            "id": "turnos-recepcao-14#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Subsolo"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Kátia"
            },
            "id": "turnos-recepcao-14#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-15",
        "texto": "A recepcionista responsável por Ligações trabalhou entre Bia e Douglas, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Bia"
            },
            "itemC": {
              "categoria": "tarefa",
              "valor": "Ligações"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Douglas"
            },
            "id": "turnos-recepcao-15#1"
          }
        ]
      },
      {
        "id": "turnos-recepcao-16",
        "texto": "A recepcionista do andar Cobertura não é Zilda nem cuidou de Arquivo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Cobertura"
            },
            "itemB": {
              "categoria": "recepcionista",
              "valor": "Zilda"
            },
            "id": "turnos-recepcao-16#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "andar",
              "valor": "Cobertura"
            },
            "itemB": {
              "categoria": "tarefa",
              "valor": "Arquivo"
            },
            "id": "turnos-recepcao-16#2"
          }
        ]
      },
      {
        "id": "turnos-recepcao-18",
        "texto": "Bia trabalhou imediatamente antes da recepcionista de uniforme Musgo.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "recepcionista",
              "valor": "Bia"
            },
            "itemB": {
              "categoria": "uniforme",
              "valor": "Musgo"
            },
            "id": "turnos-recepcao-18#1"
          }
        ]
      }
    ],
    "solucao": {
      "recepcionista": [
        "Bia",
        "Márcio",
        "Kátia",
        "Douglas",
        "Zilda"
      ],
      "tarefa": [
        "Arquivo",
        "Ligações",
        "Agendamentos",
        "Cobrança",
        "Triagem"
      ],
      "andar": [
        "Térreo",
        "Cobertura",
        "Mezanino",
        "Sobreloja",
        "Subsolo"
      ],
      "uniforme": [
        "Marinho",
        "Musgo",
        "Vinho",
        "Grafite",
        "Areia"
      ]
    },
    "metadata": {
      "complexity": 15,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 20
      },
      "skillWeights": {
        "exclusion": 24,
        "relativeOrder": 4,
        "adjacency": 2,
        "crossCategory": 30,
        "integrationDepth": 15,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T11",
        "T7"
      ],
      "clueTypeDistribution": {
        "T2": 24,
        "T7": 2,
        "T11": 2,
        "T5": 1,
        "T6": 1
      },
      "expectedDifficulty": 4,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "palestras-congresso",
    "titulo": "Palestras do congresso",
    "contexto": "Cinco palestrantes participaram do congresso. Organize palestrantes, temas, formatos e auditórios.",
    "nivel": 4,
    "posicoes": 5,
    "rotulosPosicao": [
      "9h",
      "10h30",
      "13h",
      "14h30",
      "16h"
    ],
    "categorias": [
      {
        "id": "palestrante",
        "label": "Palestrante",
        "valores": [
          "Ícaro",
          "Teodoro",
          "Yara",
          "Solange",
          "Aurora"
        ]
      },
      {
        "id": "tema",
        "label": "Tema",
        "valores": [
          "Memória",
          "Ansiedade",
          "Sono",
          "Vínculos",
          "Linguagem"
        ]
      },
      {
        "id": "formato",
        "label": "Formato",
        "valores": [
          "Roda",
          "Painel",
          "Debate",
          "Mesa",
          "Oficina"
        ]
      },
      {
        "id": "auditorio",
        "label": "Auditório",
        "valores": [
          "Bosque",
          "Lagoa",
          "Cristal",
          "Vento",
          "Pedra"
        ]
      }
    ],
    "pistas": [
      {
        "id": "palestras-congresso-1",
        "texto": "Teodoro não usou o auditório Cristal, nem participou da Roda, nem da Oficina.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Teodoro"
            },
            "itemB": {
              "categoria": "auditorio",
              "valor": "Cristal"
            },
            "id": "palestras-congresso-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Teodoro"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Roda"
            },
            "id": "palestras-congresso-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Teodoro"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Oficina"
            },
            "id": "palestras-congresso-1#3"
          }
        ]
      },
      {
        "id": "palestras-congresso-2",
        "texto": "Aurora palestrou entre o palestrante do formato Roda e o palestrante do tema Sono, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "formato",
              "valor": "Roda"
            },
            "itemC": {
              "categoria": "palestrante",
              "valor": "Aurora"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Sono"
            },
            "id": "palestras-congresso-2#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-3",
        "texto": "O palestrante do auditório Bosque palestrou entre o palestrante do auditório Lagoa e o palestrante do formato Mesa, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "auditorio",
              "valor": "Lagoa"
            },
            "itemC": {
              "categoria": "auditorio",
              "valor": "Bosque"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Mesa"
            },
            "id": "palestras-congresso-3#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-4",
        "texto": "O palestrante do formato Debate palestrou antes do palestrante do tema Ansiedade.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "formato",
              "valor": "Debate"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Ansiedade"
            },
            "id": "palestras-congresso-4#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-5",
        "texto": "Ícaro não abordou Sono nem usou o auditório Bosque.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Ícaro"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Sono"
            },
            "id": "palestras-congresso-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Ícaro"
            },
            "itemB": {
              "categoria": "auditorio",
              "valor": "Bosque"
            },
            "id": "palestras-congresso-5#2"
          }
        ]
      },
      {
        "id": "palestras-congresso-6",
        "texto": "O palestrante do tema Vínculos não participou do Painel nem usou o auditório Lagoa.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tema",
              "valor": "Vínculos"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Painel"
            },
            "id": "palestras-congresso-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tema",
              "valor": "Vínculos"
            },
            "itemB": {
              "categoria": "auditorio",
              "valor": "Lagoa"
            },
            "id": "palestras-congresso-6#2"
          }
        ]
      },
      {
        "id": "palestras-congresso-8",
        "texto": "O palestrante do formato Painel palestrou entre o palestrante do formato Oficina e o palestrante do auditório Pedra, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "formato",
              "valor": "Oficina"
            },
            "itemC": {
              "categoria": "formato",
              "valor": "Painel"
            },
            "itemB": {
              "categoria": "auditorio",
              "valor": "Pedra"
            },
            "id": "palestras-congresso-8#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-9",
        "texto": "O palestrante do tema Memória palestrou entre o palestrante do auditório Bosque e o palestrante do formato Painel, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "auditorio",
              "valor": "Bosque"
            },
            "itemC": {
              "categoria": "tema",
              "valor": "Memória"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Painel"
            },
            "id": "palestras-congresso-9#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-10",
        "texto": "O palestrante do tema Memória palestrou entre o palestrante do formato Oficina e o palestrante do tema Sono, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "formato",
              "valor": "Oficina"
            },
            "itemC": {
              "categoria": "tema",
              "valor": "Memória"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Sono"
            },
            "id": "palestras-congresso-10#1"
          }
        ]
      },
      {
        "id": "palestras-congresso-11",
        "texto": "Solange não participou da Roda nem usou o auditório Vento.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Solange"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Roda"
            },
            "id": "palestras-congresso-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Solange"
            },
            "itemB": {
              "categoria": "auditorio",
              "valor": "Vento"
            },
            "id": "palestras-congresso-11#2"
          }
        ]
      },
      {
        "id": "palestras-congresso-12",
        "texto": "O palestrante do tema Ansiedade não é Aurora nem participou do Painel.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tema",
              "valor": "Ansiedade"
            },
            "itemB": {
              "categoria": "palestrante",
              "valor": "Aurora"
            },
            "id": "palestras-congresso-12#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tema",
              "valor": "Ansiedade"
            },
            "itemB": {
              "categoria": "formato",
              "valor": "Painel"
            },
            "id": "palestras-congresso-12#2"
          }
        ]
      },
      {
        "id": "palestras-congresso-13",
        "texto": "Yara não abordou Memória nem Linguagem.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Yara"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Memória"
            },
            "id": "palestras-congresso-13#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "palestrante",
              "valor": "Yara"
            },
            "itemB": {
              "categoria": "tema",
              "valor": "Linguagem"
            },
            "id": "palestras-congresso-13#2"
          }
        ]
      },
      {
        "id": "palestras-congresso-14",
        "texto": "O palestrante do auditório Vento palestrou entre o palestrante do formato Roda e Ícaro, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "formato",
              "valor": "Roda"
            },
            "itemC": {
              "categoria": "auditorio",
              "valor": "Vento"
            },
            "itemB": {
              "categoria": "palestrante",
              "valor": "Ícaro"
            },
            "id": "palestras-congresso-14#1"
          }
        ]
      }
    ],
    "solucao": {
      "palestrante": [
        "Solange",
        "Yara",
        "Aurora",
        "Teodoro",
        "Ícaro"
      ],
      "tema": [
        "Linguagem",
        "Vínculos",
        "Memória",
        "Sono",
        "Ansiedade"
      ],
      "formato": [
        "Oficina",
        "Roda",
        "Debate",
        "Painel",
        "Mesa"
      ],
      "auditorio": [
        "Lagoa",
        "Bosque",
        "Cristal",
        "Vento",
        "Pedra"
      ]
    },
    "metadata": {
      "complexity": 13,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 6,
        "4+": 14
      },
      "skillWeights": {
        "exclusion": 13,
        "relativeOrder": 7,
        "adjacency": 0,
        "crossCategory": 20,
        "integrationDepth": 13,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T11"
      ],
      "clueTypeDistribution": {
        "T2": 13,
        "T7": 6,
        "T11": 1
      },
      "expectedDifficulty": 4,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "colheita-horta-comunitaria",
    "titulo": "Colheita da horta comunitária",
    "contexto": "Cinco equipes fizeram colheitas em semanas diferentes. Organize hortas, cultivos, responsáveis e destinos.",
    "nivel": 4,
    "posicoes": 5,
    "rotulosPosicao": [
      "Semana 1",
      "Semana 2",
      "Semana 3",
      "Semana 4",
      "Semana 5"
    ],
    "categorias": [
      {
        "id": "horta",
        "label": "Horta",
        "valores": [
          "Várzea",
          "Encosta",
          "Morro",
          "Pomar",
          "Beira-Rio"
        ]
      },
      {
        "id": "cultivo",
        "label": "Cultivo",
        "valores": [
          "Quiabo",
          "Abóbora",
          "Rúcula",
          "Cenoura",
          "Alface"
        ]
      },
      {
        "id": "responsavel",
        "label": "Responsável",
        "valores": [
          "Nadir",
          "Sebastião",
          "Efigênia",
          "Joel",
          "Vânia"
        ]
      },
      {
        "id": "destino",
        "label": "Destino",
        "valores": [
          "Creche",
          "Hospital",
          "Mercado",
          "Feira",
          "Escola"
        ]
      }
    ],
    "pistas": [
      {
        "id": "colheita-horta-comunitaria-1",
        "texto": "A equipe do destino Creche não fez a colheita na horta Encosta, nem Várzea, nem foi liderada por Vânia, nem colheu Abóbora.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Creche"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Encosta"
            },
            "id": "colheita-horta-comunitaria-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Creche"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Várzea"
            },
            "id": "colheita-horta-comunitaria-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Creche"
            },
            "itemB": {
              "categoria": "responsavel",
              "valor": "Vânia"
            },
            "id": "colheita-horta-comunitaria-1#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Creche"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Abóbora"
            },
            "id": "colheita-horta-comunitaria-1#4"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-2",
        "texto": "A equipe do destino Feira não fez a colheita na horta Morro nem foi liderada por Nadir.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Feira"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Morro"
            },
            "id": "colheita-horta-comunitaria-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Feira"
            },
            "itemB": {
              "categoria": "responsavel",
              "valor": "Nadir"
            },
            "id": "colheita-horta-comunitaria-2#2"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-3",
        "texto": "A equipe liderada por Sebastião colheu Alface.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Sebastião"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Alface"
            },
            "id": "colheita-horta-comunitaria-3#1"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-4",
        "texto": "A equipe do destino Escola não fez a colheita na horta Várzea nem colheu Rúcula.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Escola"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Várzea"
            },
            "id": "colheita-horta-comunitaria-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "destino",
              "valor": "Escola"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Rúcula"
            },
            "id": "colheita-horta-comunitaria-4#2"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-5",
        "texto": "A equipe do cultivo Quiabo não foi liderada por Nadir nem entregou ao destino Escola.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cultivo",
              "valor": "Quiabo"
            },
            "itemB": {
              "categoria": "responsavel",
              "valor": "Nadir"
            },
            "id": "colheita-horta-comunitaria-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cultivo",
              "valor": "Quiabo"
            },
            "itemB": {
              "categoria": "destino",
              "valor": "Escola"
            },
            "id": "colheita-horta-comunitaria-5#2"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-6",
        "texto": "A equipe liderada por Efigênia colheu entre a equipe liderada por Joel e a equipe da horta Várzea, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemC": {
              "categoria": "responsavel",
              "valor": "Efigênia"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Várzea"
            },
            "id": "colheita-horta-comunitaria-6#1"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-7",
        "texto": "A equipe liderada por Sebastião colheu entre a equipe liderada por Efigênia e a equipe da horta Pomar, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Efigênia"
            },
            "itemC": {
              "categoria": "responsavel",
              "valor": "Sebastião"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Pomar"
            },
            "id": "colheita-horta-comunitaria-7#1"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-8",
        "texto": "A equipe do cultivo Rúcula colheu entre a equipe liderada por Joel e a equipe do destino Creche, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemC": {
              "categoria": "cultivo",
              "valor": "Rúcula"
            },
            "itemB": {
              "categoria": "destino",
              "valor": "Creche"
            },
            "id": "colheita-horta-comunitaria-8#1"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-9",
        "texto": "A equipe do cultivo Abóbora não fez a colheita na horta Várzea nem entregou ao destino Escola.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cultivo",
              "valor": "Abóbora"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Várzea"
            },
            "id": "colheita-horta-comunitaria-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cultivo",
              "valor": "Abóbora"
            },
            "itemB": {
              "categoria": "destino",
              "valor": "Escola"
            },
            "id": "colheita-horta-comunitaria-9#2"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-10",
        "texto": "A equipe da horta Várzea colheu entre a equipe da horta Encosta e a equipe do destino Mercado, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "horta",
              "valor": "Encosta"
            },
            "itemC": {
              "categoria": "horta",
              "valor": "Várzea"
            },
            "itemB": {
              "categoria": "destino",
              "valor": "Mercado"
            },
            "id": "colheita-horta-comunitaria-10#1"
          }
        ]
      },
      {
        "id": "colheita-horta-comunitaria-11",
        "texto": "A equipe liderada por Joel não colheu Quiabo, nem Alface, nem Cenoura, nem fez a colheita na horta Encosta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Quiabo"
            },
            "id": "colheita-horta-comunitaria-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Alface"
            },
            "id": "colheita-horta-comunitaria-11#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemB": {
              "categoria": "cultivo",
              "valor": "Cenoura"
            },
            "id": "colheita-horta-comunitaria-11#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "responsavel",
              "valor": "Joel"
            },
            "itemB": {
              "categoria": "horta",
              "valor": "Encosta"
            },
            "id": "colheita-horta-comunitaria-11#4"
          }
        ]
      }
    ],
    "solucao": {
      "horta": [
        "Beira-Rio",
        "Encosta",
        "Várzea",
        "Morro",
        "Pomar"
      ],
      "cultivo": [
        "Abóbora",
        "Cenoura",
        "Rúcula",
        "Alface",
        "Quiabo"
      ],
      "responsavel": [
        "Joel",
        "Efigênia",
        "Nadir",
        "Sebastião",
        "Vânia"
      ],
      "destino": [
        "Feira",
        "Escola",
        "Hospital",
        "Creche",
        "Mercado"
      ]
    },
    "metadata": {
      "complexity": 11,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 20
      },
      "skillWeights": {
        "exclusion": 16,
        "relativeOrder": 4,
        "adjacency": 0,
        "crossCategory": 21,
        "integrationDepth": 11,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T8"
      ],
      "clueTypeDistribution": {
        "T2": 16,
        "T8": 1,
        "T7": 4
      },
      "expectedDifficulty": 4,
      "validatedUniqueSolution": true
    }
  }
];
