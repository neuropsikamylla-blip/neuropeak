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
          "Rafa",
          "Décio",
          "Íris",
          "Alice"
        ]
      },
      {
        "id": "especialidade",
        "label": "Especialidade",
        "valores": [
          "Psicologia",
          "Cardiologia",
          "Ortopedia",
          "Nutrição"
        ]
      },
      {
        "id": "sala",
        "label": "Sala",
        "valores": [
          "Âmbar",
          "Jade",
          "Coral",
          "Névoa"
        ]
      }
    ],
    "pistas": [
      {
        "id": "consultas-manha-1",
        "texto": "A pessoa que usou a sala Jade teve consulta imediatamente antes da pessoa que usou a sala Coral.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "sala",
              "valor": "Jade"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Coral"
            },
            "id": "consultas-manha-1#1"
          }
        ]
      },
      {
        "id": "consultas-manha-2",
        "texto": "Décio e a pessoa que usou a sala Névoa tiveram consultas em horários vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "paciente",
              "valor": "Décio"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "id": "consultas-manha-2#1"
          }
        ]
      },
      {
        "id": "consultas-manha-3",
        "texto": "Alice não foi à Ortopedia nem usou a sala Coral.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "paciente",
              "valor": "Alice"
            },
            "itemB": {
              "categoria": "especialidade",
              "valor": "Ortopedia"
            },
            "id": "consultas-manha-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "paciente",
              "valor": "Alice"
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
        "texto": "A pessoa que foi à Ortopedia não é Íris nem usou a sala Coral.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Ortopedia"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Íris"
            },
            "id": "consultas-manha-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Ortopedia"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Coral"
            },
            "id": "consultas-manha-4#2"
          }
        ]
      },
      {
        "id": "consultas-manha-5",
        "texto": "Íris teve consulta imediatamente antes de Rafa.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "paciente",
              "valor": "Íris"
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
        "texto": "Décio não usou a sala Âmbar.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "paciente",
              "valor": "Décio"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Âmbar"
            },
            "id": "consultas-manha-6#1"
          }
        ]
      },
      {
        "id": "consultas-manha-7",
        "texto": "Íris teve consulta antes da pessoa que usou a sala Névoa.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "paciente",
              "valor": "Íris"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Névoa"
            },
            "id": "consultas-manha-7#1"
          }
        ]
      },
      {
        "id": "consultas-manha-8",
        "texto": "A pessoa que foi à Psicologia não é Rafa nem Íris.",
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
            "id": "consultas-manha-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Psicologia"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Íris"
            },
            "id": "consultas-manha-8#2"
          }
        ]
      },
      {
        "id": "consultas-manha-9",
        "texto": "A pessoa que foi à Nutrição não usou a sala Âmbar nem Coral.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Nutrição"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Âmbar"
            },
            "id": "consultas-manha-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "especialidade",
              "valor": "Nutrição"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Coral"
            },
            "id": "consultas-manha-9#2"
          }
        ]
      }
    ],
    "solucao": {
      "paciente": [
        "Íris",
        "Rafa",
        "Décio",
        "Alice"
      ],
      "especialidade": [
        "Cardiologia",
        "Ortopedia",
        "Psicologia",
        "Nutrição"
      ],
      "sala": [
        "Âmbar",
        "Jade",
        "Coral",
        "Névoa"
      ]
    },
    "metadata": {
      "complexity": 9,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 9,
        "relativeOrder": 1,
        "adjacency": 3,
        "crossCategory": 11,
        "integrationDepth": 9,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T6",
        "T11"
      ],
      "clueTypeDistribution": {
        "T6": 2,
        "T5": 1,
        "T2": 9,
        "T11": 1
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
          "Bruno",
          "Tulio",
          "Ester",
          "Nara"
        ]
      },
      {
        "id": "preparo",
        "label": "Preparo",
        "valores": [
          "Espresso",
          "Filtrado",
          "Prensa",
          "Gelado"
        ]
      },
      {
        "id": "posto",
        "label": "Posto",
        "valores": [
          "Caixa",
          "Balcão",
          "Forno",
          "Salão"
        ]
      }
    ],
    "pistas": [
      {
        "id": "turnos-cafeteria-1",
        "texto": "O barista que preparou o Filtrado ficou no Forno.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "preparo",
              "valor": "Filtrado"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "id": "turnos-cafeteria-1#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-2",
        "texto": "Ester não preparou o Espresso nem ficou no Balcão.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Ester"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "id": "turnos-cafeteria-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Ester"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Balcão"
            },
            "id": "turnos-cafeteria-2#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-3",
        "texto": "Tulio não preparou o Gelado nem ficou no Balcão.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Tulio"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "id": "turnos-cafeteria-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Tulio"
            },
            "itemB": {
              "categoria": "posto",
              "valor": "Balcão"
            },
            "id": "turnos-cafeteria-3#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-4",
        "texto": "O barista do posto Salão não é Bruno nem preparou o Espresso.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "posto",
              "valor": "Salão"
            },
            "itemB": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "id": "turnos-cafeteria-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "posto",
              "valor": "Salão"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "id": "turnos-cafeteria-4#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-5",
        "texto": "Bruno trabalhou entre o barista do posto Salão e o barista que preparou o Gelado, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "posto",
              "valor": "Salão"
            },
            "itemC": {
              "categoria": "barista",
              "valor": "Bruno"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "id": "turnos-cafeteria-5#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-6",
        "texto": "Nara não preparou o Espresso nem o Gelado.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Nara"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Espresso"
            },
            "id": "turnos-cafeteria-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "barista",
              "valor": "Nara"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Gelado"
            },
            "id": "turnos-cafeteria-6#2"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-7",
        "texto": "O barista do posto Forno não é Tulio.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "itemB": {
              "categoria": "barista",
              "valor": "Tulio"
            },
            "id": "turnos-cafeteria-7#1"
          }
        ]
      },
      {
        "id": "turnos-cafeteria-8",
        "texto": "O barista que preparou a Prensa trabalhou entre o barista do posto Forno e o barista que preparou o Gelado, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "posto",
              "valor": "Forno"
            },
            "itemC": {
              "categoria": "preparo",
              "valor": "Prensa"
            },
            "itemB": {
              "categoria": "preparo",
              "valor": "Gelado"
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
        "Filtrado",
        "Prensa",
        "Espresso",
        "Gelado"
      ],
      "posto": [
        "Forno",
        "Salão",
        "Balcão",
        "Caixa"
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
        "exclusion": 9,
        "relativeOrder": 2,
        "adjacency": 0,
        "crossCategory": 12,
        "integrationDepth": 8,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T8"
      ],
      "clueTypeDistribution": {
        "T8": 1,
        "T2": 9,
        "T7": 2
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
          "Estuário",
          "Correnteza",
          "Miragem",
          "Vertigem"
        ]
      },
      {
        "id": "curador",
        "label": "Curador",
        "valores": [
          "Lena",
          "Vera",
          "Otto",
          "Ciro"
        ]
      },
      {
        "id": "genero",
        "label": "Gênero",
        "valores": [
          "Drama",
          "Suspense",
          "Documentário",
          "Policial"
        ]
      }
    ],
    "pistas": [
      {
        "id": "sessoes-cineclube-1",
        "texto": "O Drama não é Correnteza nem foi apresentado por Otto.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "itemB": {
              "categoria": "filme",
              "valor": "Correnteza"
            },
            "id": "sessoes-cineclube-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "itemB": {
              "categoria": "curador",
              "valor": "Otto"
            },
            "id": "sessoes-cineclube-1#2"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-2",
        "texto": "O Policial foi exibido entre o filme apresentado por Otto e o Documentário, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "curador",
              "valor": "Otto"
            },
            "itemC": {
              "categoria": "genero",
              "valor": "Policial"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Documentário"
            },
            "id": "sessoes-cineclube-2#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-3",
        "texto": "Estuário foi apresentado por Vera.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "filme",
              "valor": "Estuário"
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
        "texto": "O filme apresentado por Vera foi exibido antes de Miragem.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "curador",
              "valor": "Vera"
            },
            "itemB": {
              "categoria": "filme",
              "valor": "Miragem"
            },
            "id": "sessoes-cineclube-4#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-5",
        "texto": "O Suspense foi exibido antes do filme apresentado por Ciro.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "genero",
              "valor": "Suspense"
            },
            "itemB": {
              "categoria": "curador",
              "valor": "Ciro"
            },
            "id": "sessoes-cineclube-5#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-6",
        "texto": "O filme apresentado por Otto e o Drama foram exibidos em horários vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "curador",
              "valor": "Otto"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Drama"
            },
            "id": "sessoes-cineclube-6#1"
          }
        ]
      },
      {
        "id": "sessoes-cineclube-7",
        "texto": "O filme apresentado por Ciro não é um Documentário nem um Policial.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "curador",
              "valor": "Ciro"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Documentário"
            },
            "id": "sessoes-cineclube-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "curador",
              "valor": "Ciro"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Policial"
            },
            "id": "sessoes-cineclube-7#2"
          }
        ]
      }
    ],
    "solucao": {
      "filme": [
        "Correnteza",
        "Vertigem",
        "Estuário",
        "Miragem"
      ],
      "curador": [
        "Otto",
        "Ciro",
        "Vera",
        "Lena"
      ],
      "genero": [
        "Suspense",
        "Drama",
        "Policial",
        "Documentário"
      ]
    },
    "metadata": {
      "complexity": 7,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 1,
        "4+": 11
      },
      "skillWeights": {
        "exclusion": 4,
        "relativeOrder": 3,
        "adjacency": 1,
        "crossCategory": 9,
        "integrationDepth": 7,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T11",
        "T1"
      ],
      "clueTypeDistribution": {
        "T2": 4,
        "T7": 1,
        "T1": 1,
        "T11": 2,
        "T5": 1
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
          "Marcenaria",
          "Tecelagem",
          "Fotografia",
          "Cerâmica"
        ]
      },
      {
        "id": "mediador",
        "label": "Mediador",
        "valores": [
          "Iuri",
          "Alma",
          "Sol",
          "Zeca"
        ]
      },
      {
        "id": "espaco",
        "label": "Espaço",
        "valores": [
          "Galpão",
          "Ateliê",
          "Pátio",
          "Mezanino"
        ]
      }
    ],
    "pistas": [
      {
        "id": "oficinas-centro-cultural-1",
        "texto": "A oficina de Marcenaria não ocupou o Galpão, nem foi mediada por Sol, nem por Zeca.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "itemB": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "id": "oficinas-centro-cultural-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Sol"
            },
            "id": "oficinas-centro-cultural-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "id": "oficinas-centro-cultural-1#3"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-3",
        "texto": "A oficina que ocupou o Ateliê é a oficina de Cerâmica.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "espaco",
              "valor": "Ateliê"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Cerâmica"
            },
            "id": "oficinas-centro-cultural-3#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-4",
        "texto": "A oficina que ocupou o Galpão não foi mediada por Sol nem por Zeca.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Sol"
            },
            "id": "oficinas-centro-cultural-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "id": "oficinas-centro-cultural-4#2"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-5",
        "texto": "A oficina mediada por Alma não é a oficina de Marcenaria.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "mediador",
              "valor": "Alma"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Marcenaria"
            },
            "id": "oficinas-centro-cultural-5#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-6",
        "texto": "A oficina que ocupou o Galpão aconteceu imediatamente antes da oficina de Fotografia.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "espaco",
              "valor": "Galpão"
            },
            "itemB": {
              "categoria": "oficina",
              "valor": "Fotografia"
            },
            "id": "oficinas-centro-cultural-6#1"
          }
        ]
      },
      {
        "id": "oficinas-centro-cultural-7",
        "texto": "A oficina mediada por Zeca aconteceu entre a oficina que ocupou o Mezanino e a oficina mediada por Alma, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "espaco",
              "valor": "Mezanino"
            },
            "itemC": {
              "categoria": "mediador",
              "valor": "Zeca"
            },
            "itemB": {
              "categoria": "mediador",
              "valor": "Alma"
            },
            "id": "oficinas-centro-cultural-7#1"
          }
        ]
      }
    ],
    "solucao": {
      "oficina": [
        "Marcenaria",
        "Cerâmica",
        "Tecelagem",
        "Fotografia"
      ],
      "mediador": [
        "Iuri",
        "Zeca",
        "Alma",
        "Sol"
      ],
      "espaco": [
        "Mezanino",
        "Ateliê",
        "Galpão",
        "Pátio"
      ]
    },
    "metadata": {
      "complexity": 6,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 6,
        "relativeOrder": 1,
        "adjacency": 1,
        "crossCategory": 9,
        "integrationDepth": 6,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T6",
        "T7"
      ],
      "clueTypeDistribution": {
        "T2": 6,
        "T8": 1,
        "T6": 1,
        "T7": 1
      },
      "expectedDifficulty": 2,
      "validatedUniqueSolution": true
    }
  }
];
