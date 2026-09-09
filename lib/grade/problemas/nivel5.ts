import type { Puzzle } from "../tipos";

/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */
export const PROBLEMAS_NIVEL_5: Puzzle[] = [
  {
    "id": "plantao-pronto-socorro",
    "titulo": "Plantão do pronto-socorro",
    "contexto": "Cinco médicos atenderam durante o plantão. Organize médicos, queixas, exames, leitos e encaminhamentos.",
    "nivel": 5,
    "posicoes": 5,
    "rotulosPosicao": [
      "18h",
      "20h",
      "22h",
      "0h",
      "2h"
    ],
    "categorias": [
      {
        "id": "medico",
        "label": "Médico",
        "valores": [
          "Dr. Cássio",
          "Dr. Elmo",
          "Dra. Bruna",
          "Dra. Dora",
          "Dr. Aldo"
        ]
      },
      {
        "id": "queixa",
        "label": "Queixa",
        "valores": [
          "Fratura",
          "Tosse",
          "Cefaleia",
          "Náusea",
          "Tontura"
        ]
      },
      {
        "id": "exame",
        "label": "Exame",
        "valores": [
          "Ecografia",
          "Raio-X",
          "Eletro",
          "Sangue",
          "Urina"
        ]
      },
      {
        "id": "leito",
        "label": "Leito",
        "valores": [
          "Cinza",
          "Amarelo",
          "Roxo",
          "Branco",
          "Laranja"
        ]
      },
      {
        "id": "encaminhamento",
        "label": "Encaminhamento",
        "valores": [
          "Alta",
          "Observação",
          "Retorno",
          "Internação",
          "Cirurgia"
        ]
      }
    ],
    "pistas": [
      {
        "id": "plantao-pronto-socorro-1",
        "texto": "Dr. Aldo não solicitou o exame Urina nem usou o leito Cinza.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dr. Aldo"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "id": "plantao-pronto-socorro-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dr. Aldo"
            },
            "itemB": {
              "categoria": "leito",
              "valor": "Cinza"
            },
            "id": "plantao-pronto-socorro-1#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-2",
        "texto": "O médico do leito Laranja atendeu entre o médico do exame Urina e o médico da queixa Fratura, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "itemC": {
              "categoria": "leito",
              "valor": "Laranja"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Fratura"
            },
            "id": "plantao-pronto-socorro-2#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-3",
        "texto": "O médico do leito Laranja não solicitou o exame Ecografia nem Raio-X.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Laranja"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Ecografia"
            },
            "id": "plantao-pronto-socorro-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Laranja"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Raio-X"
            },
            "id": "plantao-pronto-socorro-3#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-4",
        "texto": "O médico que encaminhou para Internação não é Dra. Bruna nem atendeu a queixa Tontura.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Bruna"
            },
            "id": "plantao-pronto-socorro-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "id": "plantao-pronto-socorro-4#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-5",
        "texto": "Dr. Cássio não atendeu a queixa Fratura nem encaminhou para Cirurgia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dr. Cássio"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Fratura"
            },
            "id": "plantao-pronto-socorro-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dr. Cássio"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Cirurgia"
            },
            "id": "plantao-pronto-socorro-5#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-6",
        "texto": "O médico do exame Urina não é Dr. Cássio nem usou o leito Roxo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dr. Cássio"
            },
            "id": "plantao-pronto-socorro-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "itemB": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "id": "plantao-pronto-socorro-6#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-7",
        "texto": "O médico do exame Sangue encaminhou para Internação.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "exame",
              "valor": "Sangue"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "id": "plantao-pronto-socorro-7#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-8",
        "texto": "O médico do leito Roxo não atendeu a queixa Tontura, nem encaminhou para Alta, nem é Dra. Bruna, nem solicitou o exame Raio-X.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "id": "plantao-pronto-socorro-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Alta"
            },
            "id": "plantao-pronto-socorro-8#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Bruna"
            },
            "id": "plantao-pronto-socorro-8#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Raio-X"
            },
            "id": "plantao-pronto-socorro-8#4"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-9",
        "texto": "O médico da queixa Tontura não usou o leito Laranja, nem encaminhou para Cirurgia, nem para Alta, nem é Dra. Bruna.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "itemB": {
              "categoria": "leito",
              "valor": "Laranja"
            },
            "id": "plantao-pronto-socorro-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Cirurgia"
            },
            "id": "plantao-pronto-socorro-9#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Alta"
            },
            "id": "plantao-pronto-socorro-9#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tontura"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Bruna"
            },
            "id": "plantao-pronto-socorro-9#4"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-10",
        "texto": "O médico que encaminhou para Alta não é Dra. Dora, nem Dr. Aldo, nem atendeu a queixa Náusea.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Alta"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Dora"
            },
            "id": "plantao-pronto-socorro-10#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Alta"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dr. Aldo"
            },
            "id": "plantao-pronto-socorro-10#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Alta"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Náusea"
            },
            "id": "plantao-pronto-socorro-10#3"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-11",
        "texto": "O médico que encaminhou para Observação não é Dr. Elmo nem solicitou o exame Urina.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Observação"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dr. Elmo"
            },
            "id": "plantao-pronto-socorro-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "encaminhamento",
              "valor": "Observação"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "id": "plantao-pronto-socorro-11#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-13",
        "texto": "O médico da queixa Náusea atendeu entre o médico da queixa Tosse e o médico que encaminhou para Internação, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tosse"
            },
            "itemC": {
              "categoria": "queixa",
              "valor": "Náusea"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "id": "plantao-pronto-socorro-13#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-14",
        "texto": "O médico do exame Raio-X atendeu antes do médico que encaminhou para Internação.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "exame",
              "valor": "Raio-X"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "id": "plantao-pronto-socorro-14#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-15",
        "texto": "O médico do leito Amarelo não atendeu a queixa Náusea nem encaminhou para Internação.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Amarelo"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Náusea"
            },
            "id": "plantao-pronto-socorro-15#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "leito",
              "valor": "Amarelo"
            },
            "itemB": {
              "categoria": "encaminhamento",
              "valor": "Internação"
            },
            "id": "plantao-pronto-socorro-15#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-16",
        "texto": "O médico da queixa Fratura não é Dr. Cássio nem Dra. Dora.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Fratura"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dr. Cássio"
            },
            "id": "plantao-pronto-socorro-16#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "queixa",
              "valor": "Fratura"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Dora"
            },
            "id": "plantao-pronto-socorro-16#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-17",
        "texto": "O médico do leito Roxo atendeu entre Dr. Elmo e o médico do leito Laranja, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "medico",
              "valor": "Dr. Elmo"
            },
            "itemC": {
              "categoria": "leito",
              "valor": "Roxo"
            },
            "itemB": {
              "categoria": "leito",
              "valor": "Laranja"
            },
            "id": "plantao-pronto-socorro-17#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-18",
        "texto": "O médico da queixa Tosse e o médico do exame Ecografia atenderam em horários vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "queixa",
              "valor": "Tosse"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Ecografia"
            },
            "id": "plantao-pronto-socorro-18#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-19",
        "texto": "O médico do exame Eletro não é Dra. Bruna nem atendeu a queixa Fratura.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "exame",
              "valor": "Eletro"
            },
            "itemB": {
              "categoria": "medico",
              "valor": "Dra. Bruna"
            },
            "id": "plantao-pronto-socorro-19#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "exame",
              "valor": "Eletro"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Fratura"
            },
            "id": "plantao-pronto-socorro-19#2"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-21",
        "texto": "O médico do exame Urina atendeu antes do médico do leito Cinza.",
        "restricoes": [
          {
            "tipo": "T4",
            "itemA": {
              "categoria": "exame",
              "valor": "Urina"
            },
            "itemB": {
              "categoria": "leito",
              "valor": "Cinza"
            },
            "id": "plantao-pronto-socorro-21#1"
          }
        ]
      },
      {
        "id": "plantao-pronto-socorro-22",
        "texto": "Dra. Dora não atendeu a queixa Náusea nem solicitou o exame Ecografia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dra. Dora"
            },
            "itemB": {
              "categoria": "queixa",
              "valor": "Náusea"
            },
            "id": "plantao-pronto-socorro-22#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "medico",
              "valor": "Dra. Dora"
            },
            "itemB": {
              "categoria": "exame",
              "valor": "Ecografia"
            },
            "id": "plantao-pronto-socorro-22#2"
          }
        ]
      }
    ],
    "solucao": {
      "medico": [
        "Dr. Elmo",
        "Dra. Bruna",
        "Dr. Cássio",
        "Dra. Dora",
        "Dr. Aldo"
      ],
      "queixa": [
        "Tontura",
        "Tosse",
        "Náusea",
        "Cefaleia",
        "Fratura"
      ],
      "exame": [
        "Urina",
        "Raio-X",
        "Ecografia",
        "Eletro",
        "Sangue"
      ],
      "leito": [
        "Amarelo",
        "Cinza",
        "Roxo",
        "Laranja",
        "Branco"
      ],
      "encaminhamento": [
        "Retorno",
        "Alta",
        "Observação",
        "Cirurgia",
        "Internação"
      ]
    },
    "metadata": {
      "complexity": 20,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 25
      },
      "skillWeights": {
        "exclusion": 31,
        "relativeOrder": 5,
        "adjacency": 1,
        "crossCategory": 38,
        "integrationDepth": 20,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T1"
      ],
      "clueTypeDistribution": {
        "T2": 31,
        "T7": 3,
        "T1": 1,
        "T11": 1,
        "T5": 1,
        "T4": 1
      },
      "expectedDifficulty": 5,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "semana-restaurante",
    "titulo": "Semana do restaurante",
    "contexto": "Cinco pratos foram servidos em dias diferentes. Organize pratos, chefs, acompanhamentos, sobremesas e salas.",
    "nivel": 5,
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
        "id": "prato",
        "label": "Prato",
        "valores": [
          "Moqueca",
          "Risoto",
          "Escondidinho",
          "Vatapá",
          "Bobó"
        ]
      },
      {
        "id": "chef",
        "label": "Chef",
        "valores": [
          "Leandro",
          "Dionísio",
          "Aparecida",
          "Otávio",
          "Genoveva"
        ]
      },
      {
        "id": "acompanhamento",
        "label": "Acompanhamento",
        "valores": [
          "Farofa",
          "Salada",
          "Vinagrete",
          "Chuchu",
          "Pirão"
        ]
      },
      {
        "id": "sobremesa",
        "label": "Sobremesa",
        "valores": [
          "Pudim",
          "Cocada",
          "Quindim",
          "Manjar",
          "Pavê"
        ]
      },
      {
        "id": "sala",
        "label": "Sala",
        "valores": [
          "Terraço",
          "Varanda",
          "Jardim",
          "Adega",
          "Mezanino"
        ]
      }
    ],
    "pistas": [
      {
        "id": "semana-restaurante-1",
        "texto": "O prato da sobremesa Pavê não foi o prato Risoto nem servido na Adega.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Pavê"
            },
            "itemB": {
              "categoria": "prato",
              "valor": "Risoto"
            },
            "id": "semana-restaurante-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Pavê"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Adega"
            },
            "id": "semana-restaurante-1#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-2",
        "texto": "O prato da sala Terraço foi servido entre o prato preparado por Leandro e o prato do acompanhamento Salada, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "chef",
              "valor": "Leandro"
            },
            "itemC": {
              "categoria": "sala",
              "valor": "Terraço"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Salada"
            },
            "id": "semana-restaurante-2#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-3",
        "texto": "O prato da sobremesa Manjar não foi preparado por Genoveva, nem por Otávio, nem veio com o acompanhamento Pirão, nem Salada, nem foi servido no Jardim.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Genoveva"
            },
            "id": "semana-restaurante-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Otávio"
            },
            "id": "semana-restaurante-3#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Pirão"
            },
            "id": "semana-restaurante-3#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Salada"
            },
            "id": "semana-restaurante-3#4"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Jardim"
            },
            "id": "semana-restaurante-3#5"
          }
        ]
      },
      {
        "id": "semana-restaurante-4",
        "texto": "O prato da sala Terraço foi servido entre o prato da sobremesa Pavê e o prato da sobremesa Cocada, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Pavê"
            },
            "itemC": {
              "categoria": "sala",
              "valor": "Terraço"
            },
            "itemB": {
              "categoria": "sobremesa",
              "valor": "Cocada"
            },
            "id": "semana-restaurante-4#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-5",
        "texto": "O prato da sala Varanda foi servido entre o prato preparado por Leandro e o prato do acompanhamento Chuchu, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "chef",
              "valor": "Leandro"
            },
            "itemC": {
              "categoria": "sala",
              "valor": "Varanda"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Chuchu"
            },
            "id": "semana-restaurante-5#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-6",
        "texto": "O prato preparado por Otávio não veio com o acompanhamento Vinagrete nem foi servido no Jardim.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "chef",
              "valor": "Otávio"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Vinagrete"
            },
            "id": "semana-restaurante-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "chef",
              "valor": "Otávio"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Jardim"
            },
            "id": "semana-restaurante-6#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-7",
        "texto": "O prato Bobó foi servido entre o prato da sala Adega e o prato do acompanhamento Chuchu, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "sala",
              "valor": "Adega"
            },
            "itemC": {
              "categoria": "prato",
              "valor": "Bobó"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Chuchu"
            },
            "id": "semana-restaurante-7#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-8",
        "texto": "O prato preparado por Dionísio não foi servido no Jardim.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "chef",
              "valor": "Dionísio"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Jardim"
            },
            "id": "semana-restaurante-8#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-9",
        "texto": "O prato Bobó não foi preparado por Genoveva nem servido no Terraço.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Bobó"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Genoveva"
            },
            "id": "semana-restaurante-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Bobó"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Terraço"
            },
            "id": "semana-restaurante-9#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-10",
        "texto": "O prato do acompanhamento Pirão foi servido entre o prato da sobremesa Quindim e o prato da sobremesa Cocada, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "sobremesa",
              "valor": "Quindim"
            },
            "itemC": {
              "categoria": "acompanhamento",
              "valor": "Pirão"
            },
            "itemB": {
              "categoria": "sobremesa",
              "valor": "Cocada"
            },
            "id": "semana-restaurante-10#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-11",
        "texto": "O prato Escondidinho não veio com o acompanhamento Pirão nem com a sobremesa Manjar.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Escondidinho"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Pirão"
            },
            "id": "semana-restaurante-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Escondidinho"
            },
            "itemB": {
              "categoria": "sobremesa",
              "valor": "Manjar"
            },
            "id": "semana-restaurante-11#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-12",
        "texto": "O prato da sala Jardim não veio com o acompanhamento Chuchu nem com a sobremesa Cocada.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Jardim"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Chuchu"
            },
            "id": "semana-restaurante-12#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Jardim"
            },
            "itemB": {
              "categoria": "sobremesa",
              "valor": "Cocada"
            },
            "id": "semana-restaurante-12#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-13",
        "texto": "O prato do acompanhamento Chuchu foi servido entre o prato do acompanhamento Vinagrete e o prato Vatapá, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Vinagrete"
            },
            "itemC": {
              "categoria": "acompanhamento",
              "valor": "Chuchu"
            },
            "itemB": {
              "categoria": "prato",
              "valor": "Vatapá"
            },
            "id": "semana-restaurante-13#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-15",
        "texto": "O prato Risoto foi servido entre o prato da sala Adega e o prato do acompanhamento Chuchu, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "sala",
              "valor": "Adega"
            },
            "itemC": {
              "categoria": "prato",
              "valor": "Risoto"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Chuchu"
            },
            "id": "semana-restaurante-15#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-16",
        "texto": "O prato do acompanhamento Farofa não foi preparado por Aparecida, nem servido na Adega, nem na Varanda.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Farofa"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Aparecida"
            },
            "id": "semana-restaurante-16#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Farofa"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Adega"
            },
            "id": "semana-restaurante-16#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Farofa"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Varanda"
            },
            "id": "semana-restaurante-16#3"
          }
        ]
      },
      {
        "id": "semana-restaurante-17",
        "texto": "O prato do acompanhamento Vinagrete não foi preparado por Aparecida nem por Genoveva.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Vinagrete"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Aparecida"
            },
            "id": "semana-restaurante-17#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Vinagrete"
            },
            "itemB": {
              "categoria": "chef",
              "valor": "Genoveva"
            },
            "id": "semana-restaurante-17#2"
          }
        ]
      },
      {
        "id": "semana-restaurante-18",
        "texto": "O prato preparado por Genoveva foi servido entre o prato do acompanhamento Vinagrete e o prato do acompanhamento Salada, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "acompanhamento",
              "valor": "Vinagrete"
            },
            "itemC": {
              "categoria": "chef",
              "valor": "Genoveva"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Salada"
            },
            "id": "semana-restaurante-18#1"
          }
        ]
      },
      {
        "id": "semana-restaurante-20",
        "texto": "O prato Risoto não veio com o acompanhamento Farofa nem Salada.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Risoto"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Farofa"
            },
            "id": "semana-restaurante-20#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "prato",
              "valor": "Risoto"
            },
            "itemB": {
              "categoria": "acompanhamento",
              "valor": "Salada"
            },
            "id": "semana-restaurante-20#2"
          }
        ]
      }
    ],
    "solucao": {
      "prato": [
        "Escondidinho",
        "Bobó",
        "Risoto",
        "Moqueca",
        "Vatapá"
      ],
      "chef": [
        "Dionísio",
        "Leandro",
        "Genoveva",
        "Aparecida",
        "Otávio"
      ],
      "acompanhamento": [
        "Vinagrete",
        "Farofa",
        "Pirão",
        "Chuchu",
        "Salada"
      ],
      "sobremesa": [
        "Quindim",
        "Pavê",
        "Pudim",
        "Manjar",
        "Cocada"
      ],
      "sala": [
        "Adega",
        "Jardim",
        "Varanda",
        "Terraço",
        "Mezanino"
      ]
    },
    "metadata": {
      "complexity": 18,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 25
      },
      "skillWeights": {
        "exclusion": 23,
        "relativeOrder": 8,
        "adjacency": 0,
        "crossCategory": 31,
        "integrationDepth": 18,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7"
      ],
      "clueTypeDistribution": {
        "T2": 23,
        "T7": 8
      },
      "expectedDifficulty": 5,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "trilhas-parque",
    "titulo": "Trilhas do parque",
    "contexto": "Cinco guias conduziram trilhas diferentes. Organize guias, biomas, durações, atrativos e níveis.",
    "nivel": 5,
    "posicoes": 5,
    "rotulosPosicao": [
      "Trilha 1",
      "Trilha 2",
      "Trilha 3",
      "Trilha 4",
      "Trilha 5"
    ],
    "categorias": [
      {
        "id": "guia",
        "label": "Guia",
        "valores": [
          "Ubirajara",
          "Zulmira",
          "Benedita",
          "Iolanda",
          "Firmino"
        ]
      },
      {
        "id": "bioma",
        "label": "Bioma",
        "valores": [
          "Campo",
          "Restinga",
          "Mata",
          "Cerrado",
          "Mangue"
        ]
      },
      {
        "id": "duracao",
        "label": "Duração",
        "valores": [
          "Integral",
          "Longa",
          "Curta",
          "Média",
          "Extensa"
        ]
      },
      {
        "id": "atrativo",
        "label": "Atrativo",
        "valores": [
          "Ruína",
          "Lago",
          "Cachoeira",
          "Gruta",
          "Mirante"
        ]
      },
      {
        "id": "nivel",
        "label": "Nível",
        "valores": [
          "Moderado",
          "Severo",
          "Leve",
          "Fácil",
          "Difícil"
        ]
      }
    ],
    "pistas": [
      {
        "id": "trilhas-parque-1",
        "texto": "Ubirajara não guiou a trilha com duração Média, nem visitou o atrativo Lago, nem guiou no bioma Mata.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Ubirajara"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Média"
            },
            "id": "trilhas-parque-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Ubirajara"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Lago"
            },
            "id": "trilhas-parque-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Ubirajara"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Mata"
            },
            "id": "trilhas-parque-1#3"
          }
        ]
      },
      {
        "id": "trilhas-parque-2",
        "texto": "O guia do bioma Campo e o guia do atrativo Cachoeira guiaram trilhas vizinhas.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "bioma",
              "valor": "Campo"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Cachoeira"
            },
            "id": "trilhas-parque-2#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-3",
        "texto": "O guia do nível Severo guiou a trilha com duração Extensa.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "nivel",
              "valor": "Severo"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Extensa"
            },
            "id": "trilhas-parque-3#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-4",
        "texto": "O guia do bioma Mangue guiou entre Iolanda e o guia do bioma Restinga, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "guia",
              "valor": "Iolanda"
            },
            "itemC": {
              "categoria": "bioma",
              "valor": "Mangue"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "id": "trilhas-parque-4#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-5",
        "texto": "Zulmira guiou entre o guia do atrativo Lago e o guia do nível Severo, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "atrativo",
              "valor": "Lago"
            },
            "itemC": {
              "categoria": "guia",
              "valor": "Zulmira"
            },
            "itemB": {
              "categoria": "nivel",
              "valor": "Severo"
            },
            "id": "trilhas-parque-5#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-6",
        "texto": "O guia do bioma Restinga não é Zulmira nem visitou o atrativo Ruína.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "itemB": {
              "categoria": "guia",
              "valor": "Zulmira"
            },
            "id": "trilhas-parque-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Ruína"
            },
            "id": "trilhas-parque-6#2"
          }
        ]
      },
      {
        "id": "trilhas-parque-7",
        "texto": "O guia do nível Fácil guiou entre o guia da trilha com duração Média e o guia da trilha com duração Curta, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "duracao",
              "valor": "Média"
            },
            "itemC": {
              "categoria": "nivel",
              "valor": "Fácil"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Curta"
            },
            "id": "trilhas-parque-7#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-9",
        "texto": "Iolanda guiou entre o guia do nível Difícil e Zulmira, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "nivel",
              "valor": "Difícil"
            },
            "itemC": {
              "categoria": "guia",
              "valor": "Iolanda"
            },
            "itemB": {
              "categoria": "guia",
              "valor": "Zulmira"
            },
            "id": "trilhas-parque-9#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-10",
        "texto": "O guia do bioma Mata guiou a trilha com duração Longa.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "bioma",
              "valor": "Mata"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Longa"
            },
            "id": "trilhas-parque-10#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-11",
        "texto": "O guia do bioma Mata não visitou o atrativo Lago nem Gruta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bioma",
              "valor": "Mata"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Lago"
            },
            "id": "trilhas-parque-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bioma",
              "valor": "Mata"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Gruta"
            },
            "id": "trilhas-parque-11#2"
          }
        ]
      },
      {
        "id": "trilhas-parque-12",
        "texto": "Zulmira não guiou no bioma Restinga nem conduziu a trilha de nível Moderado.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Zulmira"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "id": "trilhas-parque-12#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Zulmira"
            },
            "itemB": {
              "categoria": "nivel",
              "valor": "Moderado"
            },
            "id": "trilhas-parque-12#2"
          }
        ]
      },
      {
        "id": "trilhas-parque-13",
        "texto": "O guia do atrativo Ruína não guiou a trilha com duração Integral nem Longa.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "atrativo",
              "valor": "Ruína"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Integral"
            },
            "id": "trilhas-parque-13#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "atrativo",
              "valor": "Ruína"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Longa"
            },
            "id": "trilhas-parque-13#2"
          }
        ]
      },
      {
        "id": "trilhas-parque-14",
        "texto": "Iolanda guiou imediatamente antes do guia do bioma Mangue.",
        "restricoes": [
          {
            "tipo": "T6",
            "itemA": {
              "categoria": "guia",
              "valor": "Iolanda"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Mangue"
            },
            "id": "trilhas-parque-14#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-15",
        "texto": "O guia do atrativo Lago não guiou a trilha com duração Média nem conduziu a trilha de nível Leve.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "atrativo",
              "valor": "Lago"
            },
            "itemB": {
              "categoria": "duracao",
              "valor": "Média"
            },
            "id": "trilhas-parque-15#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "atrativo",
              "valor": "Lago"
            },
            "itemB": {
              "categoria": "nivel",
              "valor": "Leve"
            },
            "id": "trilhas-parque-15#2"
          }
        ]
      },
      {
        "id": "trilhas-parque-16",
        "texto": "Firmino guiou no bioma Restinga.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "guia",
              "valor": "Firmino"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "id": "trilhas-parque-16#1"
          }
        ]
      },
      {
        "id": "trilhas-parque-17",
        "texto": "Benedita não guiou no bioma Restinga nem visitou o atrativo Ruína.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Benedita"
            },
            "itemB": {
              "categoria": "bioma",
              "valor": "Restinga"
            },
            "id": "trilhas-parque-17#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "guia",
              "valor": "Benedita"
            },
            "itemB": {
              "categoria": "atrativo",
              "valor": "Ruína"
            },
            "id": "trilhas-parque-17#2"
          }
        ]
      }
    ],
    "solucao": {
      "guia": [
        "Benedita",
        "Iolanda",
        "Ubirajara",
        "Zulmira",
        "Firmino"
      ],
      "bioma": [
        "Cerrado",
        "Campo",
        "Mangue",
        "Mata",
        "Restinga"
      ],
      "duracao": [
        "Média",
        "Integral",
        "Curta",
        "Longa",
        "Extensa"
      ],
      "atrativo": [
        "Cachoeira",
        "Lago",
        "Ruína",
        "Mirante",
        "Gruta"
      ],
      "nivel": [
        "Difícil",
        "Fácil",
        "Moderado",
        "Leve",
        "Severo"
      ]
    },
    "metadata": {
      "complexity": 16,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 25
      },
      "skillWeights": {
        "exclusion": 15,
        "relativeOrder": 4,
        "adjacency": 2,
        "crossCategory": 24,
        "integrationDepth": 16,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T8"
      ],
      "clueTypeDistribution": {
        "T2": 15,
        "T5": 1,
        "T8": 2,
        "T7": 4,
        "T6": 1,
        "T1": 1
      },
      "expectedDifficulty": 5,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "exposicao-museu",
    "titulo": "Exposição do museu",
    "contexto": "Cinco obras foram expostas em salas diferentes. Organize obras, artistas, técnicas, décadas e doadores.",
    "nivel": 5,
    "posicoes": 5,
    "rotulosPosicao": [
      "Sala 1",
      "Sala 2",
      "Sala 3",
      "Sala 4",
      "Sala 5"
    ],
    "categorias": [
      {
        "id": "obra",
        "label": "Obra",
        "valores": [
          "Clepsidra",
          "Estuário",
          "Ninho",
          "Vertigem",
          "Aurora"
        ]
      },
      {
        "id": "artista",
        "label": "Artista",
        "valores": [
          "Rodolfo",
          "Anísio",
          "Wanda",
          "Gilda",
          "Hermínia"
        ]
      },
      {
        "id": "tecnica",
        "label": "Técnica",
        "valores": [
          "Óleo",
          "Têxtil",
          "Bronze",
          "Gravura",
          "Aquarela"
        ]
      },
      {
        "id": "decada",
        "label": "Década",
        "valores": [
          "Oitenta",
          "Setenta",
          "Noventa",
          "Sessenta",
          "Cinquenta"
        ]
      },
      {
        "id": "doador",
        "label": "Doador",
        "valores": [
          "Esteves",
          "Camargo",
          "Barroso",
          "Almeida",
          "Dutra"
        ]
      }
    ],
    "pistas": [
      {
        "id": "exposicao-museu-1",
        "texto": "A obra em Gravura não é a obra Aurora, nem Vertigem, nem de Anísio, nem foi doada por Dutra, nem é dos anos Oitenta, nem Sessenta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "id": "exposicao-museu-1#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Vertigem"
            },
            "id": "exposicao-museu-1#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "artista",
              "valor": "Anísio"
            },
            "id": "exposicao-museu-1#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "doador",
              "valor": "Dutra"
            },
            "id": "exposicao-museu-1#4"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Oitenta"
            },
            "id": "exposicao-museu-1#5"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Sessenta"
            },
            "id": "exposicao-museu-1#6"
          }
        ]
      },
      {
        "id": "exposicao-museu-2",
        "texto": "A obra doada por Esteves foi exposta entre a obra de Wanda e a obra dos anos Noventa, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "artista",
              "valor": "Wanda"
            },
            "itemC": {
              "categoria": "doador",
              "valor": "Esteves"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Noventa"
            },
            "id": "exposicao-museu-2#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-3",
        "texto": "A obra dos anos Setenta foi exposta entre a obra em Gravura e a obra Aurora, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Gravura"
            },
            "itemC": {
              "categoria": "decada",
              "valor": "Setenta"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "id": "exposicao-museu-3#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-4",
        "texto": "A obra doada por Camargo foi exposta entre a obra de Wanda e a obra dos anos Sessenta, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "artista",
              "valor": "Wanda"
            },
            "itemC": {
              "categoria": "doador",
              "valor": "Camargo"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Sessenta"
            },
            "id": "exposicao-museu-4#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-5",
        "texto": "A obra doada por Esteves foi exposta entre a obra Clepsidra e a obra de Anísio, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "obra",
              "valor": "Clepsidra"
            },
            "itemC": {
              "categoria": "doador",
              "valor": "Esteves"
            },
            "itemB": {
              "categoria": "artista",
              "valor": "Anísio"
            },
            "id": "exposicao-museu-5#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-6",
        "texto": "A obra Aurora não foi doada por Camargo, nem por Dutra, nem é de Rodolfo, nem de Anísio.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "itemB": {
              "categoria": "doador",
              "valor": "Camargo"
            },
            "id": "exposicao-museu-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "itemB": {
              "categoria": "doador",
              "valor": "Dutra"
            },
            "id": "exposicao-museu-6#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "itemB": {
              "categoria": "artista",
              "valor": "Rodolfo"
            },
            "id": "exposicao-museu-6#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Aurora"
            },
            "itemB": {
              "categoria": "artista",
              "valor": "Anísio"
            },
            "id": "exposicao-museu-6#4"
          }
        ]
      },
      {
        "id": "exposicao-museu-7",
        "texto": "A obra de Gilda foi exposta antes da obra doada por Camargo.",
        "restricoes": [
          {
            "tipo": "T11",
            "itemA": {
              "categoria": "artista",
              "valor": "Gilda"
            },
            "itemB": {
              "categoria": "doador",
              "valor": "Camargo"
            },
            "id": "exposicao-museu-7#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-8",
        "texto": "A obra em Óleo não é dos anos Oitenta nem foi doada por Esteves.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Óleo"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Oitenta"
            },
            "id": "exposicao-museu-8#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Óleo"
            },
            "itemB": {
              "categoria": "doador",
              "valor": "Esteves"
            },
            "id": "exposicao-museu-8#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-9",
        "texto": "A obra dos anos Noventa não foi feita em Bronze.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "decada",
              "valor": "Noventa"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Bronze"
            },
            "id": "exposicao-museu-9#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-10",
        "texto": "A obra Estuário não foi feita em Têxtil nem em Aquarela.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Estuário"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Têxtil"
            },
            "id": "exposicao-museu-10#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "obra",
              "valor": "Estuário"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Aquarela"
            },
            "id": "exposicao-museu-10#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-11",
        "texto": "A obra de Rodolfo não foi feita em Óleo nem é dos anos Oitenta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "artista",
              "valor": "Rodolfo"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Óleo"
            },
            "id": "exposicao-museu-11#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "artista",
              "valor": "Rodolfo"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Oitenta"
            },
            "id": "exposicao-museu-11#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-12",
        "texto": "A obra de Gilda foi exposta entre a obra em Aquarela e a obra Ninho, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Aquarela"
            },
            "itemC": {
              "categoria": "artista",
              "valor": "Gilda"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Ninho"
            },
            "id": "exposicao-museu-12#1"
          }
        ]
      },
      {
        "id": "exposicao-museu-15",
        "texto": "A obra doada por Camargo não é de Rodolfo nem dos anos Setenta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "doador",
              "valor": "Camargo"
            },
            "itemB": {
              "categoria": "artista",
              "valor": "Rodolfo"
            },
            "id": "exposicao-museu-15#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "doador",
              "valor": "Camargo"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Setenta"
            },
            "id": "exposicao-museu-15#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-16",
        "texto": "A obra em Bronze não é a obra Vertigem nem dos anos Oitenta.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Bronze"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Vertigem"
            },
            "id": "exposicao-museu-16#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "tecnica",
              "valor": "Bronze"
            },
            "itemB": {
              "categoria": "decada",
              "valor": "Oitenta"
            },
            "id": "exposicao-museu-16#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-18",
        "texto": "A obra doada por Esteves não é a obra Estuário nem foi feita em Óleo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "doador",
              "valor": "Esteves"
            },
            "itemB": {
              "categoria": "obra",
              "valor": "Estuário"
            },
            "id": "exposicao-museu-18#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "doador",
              "valor": "Esteves"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Óleo"
            },
            "id": "exposicao-museu-18#2"
          }
        ]
      },
      {
        "id": "exposicao-museu-19",
        "texto": "A obra dos anos Noventa foi exposta entre a obra doada por Almeida e a obra em Óleo, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "doador",
              "valor": "Almeida"
            },
            "itemC": {
              "categoria": "decada",
              "valor": "Noventa"
            },
            "itemB": {
              "categoria": "tecnica",
              "valor": "Óleo"
            },
            "id": "exposicao-museu-19#1"
          }
        ]
      }
    ],
    "solucao": {
      "obra": [
        "Clepsidra",
        "Estuário",
        "Ninho",
        "Vertigem",
        "Aurora"
      ],
      "artista": [
        "Wanda",
        "Gilda",
        "Rodolfo",
        "Anísio",
        "Hermínia"
      ],
      "tecnica": [
        "Aquarela",
        "Gravura",
        "Bronze",
        "Têxtil",
        "Óleo"
      ],
      "decada": [
        "Oitenta",
        "Cinquenta",
        "Setenta",
        "Noventa",
        "Sessenta"
      ],
      "doador": [
        "Dutra",
        "Almeida",
        "Esteves",
        "Camargo",
        "Barroso"
      ]
    },
    "metadata": {
      "complexity": 16,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 25
      },
      "skillWeights": {
        "exclusion": 23,
        "relativeOrder": 7,
        "adjacency": 0,
        "crossCategory": 30,
        "integrationDepth": 16,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T11"
      ],
      "clueTypeDistribution": {
        "T2": 23,
        "T7": 6,
        "T11": 1
      },
      "expectedDifficulty": 5,
      "validatedUniqueSolution": true
    }
  }
];
