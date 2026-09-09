import type { Puzzle } from "../tipos";

/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */
export const PROBLEMAS_NIVEL_2: Puzzle[] = [
  {
    "id": "consultas-manha",
    "titulo": "Consultas da manhã",
    "contexto": "Quatro pacientes foram atendidos pela manhã. Organize pacientes, especialidades e salas.",
    "nivel": 2,
    "posicoes": 4,
    "rotulosPosicao": [
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
          "Décio",
          "Rafa",
          "Alice",
          "Íris"
        ]
      },
      {
        "id": "especialidade",
        "label": "Especialidade",
        "valores": [
          "Cardiologia",
          "Nutrição",
          "Ortopedia",
          "Psicologia"
        ]
      },
      {
        "id": "sala",
        "label": "Sala",
        "valores": [
          "Jade",
          "Névoa",
          "Âmbar",
          "Coral"
        ]
      }
    ],
    "pistas": [
      {
        "id": "consultas-manha-1",
        "texto": "Rafa foi atendido imediatamente antes de quem foi à Psicologia.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "paciente",
              "valor": "Rafa"
            },
            "itemB": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "id": "consultas-manha-1#1"
          }
        ]
      },
      {
        "id": "consultas-manha-2",
        "texto": "Quem usou a sala Âmbar não é Alice nem foi à Psicologia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Âmbar"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Alice"
            },
            "id": "consultas-manha-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Âmbar"
            },
            "itemB": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "id": "consultas-manha-2#2"
          }
        ]
      },
      {
        "id": "consultas-manha-3",
        "texto": "Quem foi à Psicologia não é Rafa nem usou a sala Coral.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Rafa"
            },
            "id": "consultas-manha-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Coral"
            },
            "id": "consultas-manha-3#2"
          }
        ]
      },
      {
        "id": "consultas-manha-4",
        "texto": "Quem usou a sala Névoa não é Décio nem Íris.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Décio"
            },
            "id": "consultas-manha-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Íris"
            },
            "id": "consultas-manha-4#2"
          }
        ]
      },
      {
        "id": "consultas-manha-5",
        "texto": "Quem foi à Cardiologia é Rafa.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Cardiologia"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Rafa"
            },
            "id": "consultas-manha-5#1"
          }
        ]
      },
      {
        "id": "consultas-manha-6",
        "texto": "Quem foi à Nutrição foi atendido imediatamente antes de Décio.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Nutrição"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Décio"
            },
            "id": "consultas-manha-6#1"
          }
        ]
      },
      {
        "id": "consultas-manha-7",
        "texto": "Quem usou a sala Névoa não é Décio nem Alice.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Décio"
            },
            "id": "consultas-manha-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Alice"
            },
            "id": "consultas-manha-7#2"
          }
        ]
      },
      {
        "id": "consultas-manha-8",
        "texto": "Alice e quem foi à Psicologia foram atendidos em horários vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "paciente",
              "valor": "Alice"
            },
            "itemB": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "id": "consultas-manha-8#1"
          }
        ]
      }
    ],
    "solucao": {
      "paciente": [
        "Rafa",
        "Íris",
        "Alice",
        "Décio"
      ],
      "especialidade": [
        "Cardiologia",
        "Psicologia",
        "Nutrição",
        "Ortopedia"
      ],
      "sala": [
        "Névoa",
        "Jade",
        "Coral",
        "Âmbar"
      ]
    },
    "metadata": {
      "complexity": 8,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 8,
        "relativeOrder": 0,
        "adjacency": 3,
        "crossCategory": 12,
        "integrationDepth": 8,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T6",
        "T5"
      ],
      "clueTypeDistribution": {
        "T6": 2,
        "T2": 8,
        "T8": 1,
        "T5": 1
      },
      "expectedDifficulty": 2,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "turnos-cafeteria",
    "titulo": "Turnos na cafeteria",
    "contexto": "Quatro baristas trabalharam em dias diferentes. Organize baristas, preparos e postos.",
    "nivel": 2,
    "posicoes": 4,
    "rotulosPosicao": [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta"
    ],
    "categorias": [
      {
        "id": "barista",
        "label": "Barista",
        "valores": [
          "Ester",
          "Bruno",
          "Nara",
          "Tulio"
        ]
      },
      {
        "id": "preparo",
        "label": "Preparo",
        "valores": [
          "Filtrado",
          "Prensa",
          "Gelado",
          "Espresso"
        ]
      },
      {
        "id": "posto",
        "label": "Posto",
        "valores": [
          "Balcão",
          "Caixa",
          "Salão",
          "Forno"
        ]
      }
    ],
    "pistas": [
      {
        "id": "turnos-cafeteria-1",
        "texto": "Bruno não preparou o Gelado nem o Espresso.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "id": "turnos-cafeteria-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "id": "turnos-cafeteria-1#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-2",
        "texto": "Quem preparou o Gelado ficou no Salão.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Salão"
            },
            "id": "turnos-cafeteria-2#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-3",
        "texto": "Quem preparou o Espresso não é Tulio nem ficou no Forno.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "itemB": {
              "categoria": "barista",
              "valor": "Tulio"
            },
            "id": "turnos-cafeteria-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "id": "turnos-cafeteria-3#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-4",
        "texto": "Nara trabalhou antes de quem preparou o Filtrado.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "barista",
              "valor": "Nara"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Filtrado"
            },
            "id": "turnos-cafeteria-4#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-5",
        "texto": "Quem preparou o Gelado não é Tulio nem ficou no Forno.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "itemB": {
              "categoria": "barista",
              "valor": "Tulio"
            },
            "id": "turnos-cafeteria-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "id": "turnos-cafeteria-5#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-6",
        "texto": "Bruno trabalhou antes de quem ficou no Balcão.",
        "restricoes": [
          {
            "tipo": "T4",
            "itemA": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Balcão"
            },
            "id": "turnos-cafeteria-6#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-7",
        "texto": "Quem ficou no Forno trabalhou antes de Bruno.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "itemB": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "id": "turnos-cafeteria-7#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-8",
        "texto": "Quem preparou a Prensa e quem ficou no Caixa trabalharam em dias vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "preparo",
              "valor": "Prensa"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Caixa"
            },
            "id": "turnos-cafeteria-8#1"
          }
        ]
      }
    ],
    "solucao": {
      "barista": [
        "Nara",
        "Tulio",
        "Bruno",
        "Ester"
      ],
      "preparo": [
        "Gelado",
        "Prensa",
        "Filtrado",
        "Espresso"
      ],
      "posto": [
        "Salão",
        "Forno",
        "Caixa",
        "Balcão"
      ]
    },
    "metadata": {
      "complexity": 8,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 6,
        "relativeOrder": 3,
        "adjacency": 1,
        "crossCategory": 11,
        "integrationDepth": 8,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T11",
        "T4"
      ],
      "clueTypeDistribution": {
        "T2": 6,
        "T8": 1,
        "T11": 2,
        "T4": 1,
        "T5": 1
      },
      "expectedDifficulty": 2,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "sessoes-cineclube",
    "titulo": "Sessões do cineclube",
    "contexto": "Quatro filmes foram exibidos em sessões diferentes. Organize filmes, curadores e gêneros.",
    "nivel": 2,
    "posicoes": 4,
    "rotulosPosicao": [
      "18h",
      "19h30",
      "21h",
      "22h30"
    ],
    "categorias": [
      {
        "id": "filme",
        "label": "Filme",
        "valores": [
          "Vertigem",
          "Correnteza",
          "Estuário",
          "Miragem"
        ]
      },
      {
        "id": "curador",
        "label": "Curador",
        "valores": [
          "Otto",
          "Vera",
          "Lena",
          "Ciro"
        ]
      },
      {
        "id": "genero",
        "label": "Gênero",
        "valores": [
          "Suspense",
          "Policial",
          "Documentário",
          "Drama"
        ]
      }
    ],
    "pistas": [
      {
        "id": "sessoes-cineclube-1",
        "texto": "O Drama foi exibido entre o filme apresentado por Otto e o filme apresentado por Vera, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "curador",
              "valor": "Otto"
            },
            "itemC": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "itemB": {
              "categoria": "curador",
              "valor": "Vera"
            },
            "id": "sessoes-cineclube-1#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-2",
        "texto": "Estuário foi exibido entre o filme apresentado por Otto e o filme apresentado por Vera, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "curador",
              "valor": "Otto"
            },
            "itemC": {
              "categoria": "filme",
              "valor": "Estuário"
            },
            "itemB": {
              "categoria": "curador",
              "valor": "Vera"
            },
            "id": "sessoes-cineclube-2#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-3",
        "texto": "O filme apresentado por Lena foi exibido entre o Policial e o filme apresentado por Vera, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "genero",
              "valor": "Policial"
            },
            "itemC": {
              "categoria": "curador",
              "valor": "Lena"
            },
            "itemB": {
              "categoria": "curador",
              "valor": "Vera"
            },
            "id": "sessoes-cineclube-3#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-4",
        "texto": "O filme apresentado por Ciro é um Drama.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "curador",
              "valor": "Ciro"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "id": "sessoes-cineclube-4#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-5",
        "texto": "O Policial foi exibido antes de Miragem.",
        "restricoes": [
          {
            "tipo": "T4",
            "itemA": {
              "categoria": "genero",
              "valor": "Policial"
            },
            "itemB": {
              "categoria": "filme",
              "valor": "Miragem"
            },
            "id": "sessoes-cineclube-5#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-6",
        "texto": "Correnteza foi exibido entre o Drama e o Suspense, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "itemC": {
              "categoria": "filme",
              "valor": "Correnteza"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Suspense"
            },
            "id": "sessoes-cineclube-6#1"
          }
        ]
      }
    ],
    "solucao": {
      "filme": [
        "Vertigem",
        "Estuário",
        "Correnteza",
        "Miragem"
      ],
      "curador": [
        "Otto",
        "Ciro",
        "Lena",
        "Vera"
      ],
      "genero": [
        "Policial",
        "Drama",
        "Documentário",
        "Suspense"
      ]
    },
    "metadata": {
      "complexity": 6,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 4,
        "3": 7,
        "4+": 1
      },
      "skillWeights": {
        "exclusion": 0,
        "relativeOrder": 5,
        "adjacency": 0,
        "crossCategory": 6,
        "integrationDepth": 4,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T7",
        "T1",
        "T4"
      ],
      "clueTypeDistribution": {
        "T7": 4,
        "T1": 1,
        "T4": 1
      },
      "expectedDifficulty": 2,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "oficinas-centro-cultural",
    "titulo": "Oficinas no centro cultural",
    "contexto": "Quatro oficinas aconteceram em horários diferentes. Organize oficinas, mediadores e espaços.",
    "nivel": 2,
    "posicoes": 4,
    "rotulosPosicao": [
      "14h",
      "15h",
      "16h",
      "17h"
    ],
    "categorias": [
      {
        "id": "oficina",
        "label": "Oficina",
        "valores": [
          "Fotografia",
          "Tecelagem",
          "Cerâmica",
          "Marcenaria"
        ]
      },
      {
        "id": "mediador",
        "label": "Mediador",
        "valores": [
          "Sol",
          "Alma",
          "Zeca",
          "Iuri"
        ]
      },
      {
        "id": "espaco",
        "label": "Espaço",
        "valores": [
          "Ateliê",
          "Pátio",
          "Galpão",
          "Mezanino"
        ]
      }
    ],
    "pistas": [
      {
        "id": "oficinas-centro-cultural-1",
        "texto": "A oficina que ocupou o Pátio aconteceu entre a oficina que ocupou o Galpão e a oficina mediada por Sol, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "itemC": {
              "categoria": "espaco",
              "valor": "Pátio"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Sol"
            },
            "id": "oficinas-centro-cultural-1#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-2",
        "texto": "A oficina mediada por Zeca não ocupou o Ateliê nem o Mezanino.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "itemB": {
              "categoria": "espaco",
              "valor": "Ateliê"
            },
            "id": "oficinas-centro-cultural-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "itemB": {
              "categoria": "espaco",
              "valor": "Mezanino"
            },
            "id": "oficinas-centro-cultural-2#2"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-3",
        "texto": "A oficina mediada por Sol é a oficina de Tecelagem.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "mediador",
              "valor": "Sol"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Tecelagem"
            },
            "id": "oficinas-centro-cultural-3#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-4",
        "texto": "A oficina mediada por Iuri aconteceu antes da oficina de Marcenaria.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "mediador",
              "valor": "Iuri"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "id": "oficinas-centro-cultural-4#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-5",
        "texto": "A oficina de Fotografia não foi mediada por Alma.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Fotografia"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Alma"
            },
            "id": "oficinas-centro-cultural-5#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-6",
        "texto": "A oficina que ocupou o Pátio é a oficina de Marcenaria.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "espaco",
              "valor": "Pátio"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "id": "oficinas-centro-cultural-6#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-7",
        "texto": "A oficina de Cerâmica não foi mediada por Sol nem ocupou o Mezanino.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Cerâmica"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Sol"
            },
            "id": "oficinas-centro-cultural-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Cerâmica"
            },
            "itemB": {
              "categoria": "espaco",
              "valor": "Mezanino"
            },
            "id": "oficinas-centro-cultural-7#2"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-8",
        "texto": "A oficina que ocupou o Ateliê não foi mediada por Zeca nem por Iuri.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "espaco",
              "valor": "Ateliê"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "id": "oficinas-centro-cultural-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "espaco",
              "valor": "Ateliê"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Iuri"
            },
            "id": "oficinas-centro-cultural-8#2"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-9",
        "texto": "A oficina que ocupou o Mezanino não foi mediada por Iuri.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "espaco",
              "valor": "Mezanino"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Iuri"
            },
            "id": "oficinas-centro-cultural-9#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-10",
        "texto": "A oficina que ocupou o Galpão aconteceu imediatamente antes da oficina mediada por Alma.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Alma"
            },
            "id": "oficinas-centro-cultural-10#1"
          }
        ]
      }
    ],
    "solucao": {
      "oficina": [
        "Fotografia",
        "Cerâmica",
        "Marcenaria",
        "Tecelagem"
      ],
      "mediador": [
        "Iuri",
        "Alma",
        "Zeca",
        "Sol"
      ],
      "espaco": [
        "Galpão",
        "Ateliê",
        "Pátio",
        "Mezanino"
      ]
    },
    "metadata": {
      "complexity": 10,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 8,
        "relativeOrder": 2,
        "adjacency": 1,
        "crossCategory": 13,
        "integrationDepth": 10,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T1",
        "T11"
      ],
      "clueTypeDistribution": {
        "T7": 1,
        "T2": 8,
        "T8": 1,
        "T11": 1,
        "T1": 1,
        "T6": 1
      },
      "expectedDifficulty": 2,
      "validatedUniqueSolution": true
    }
  }
];
