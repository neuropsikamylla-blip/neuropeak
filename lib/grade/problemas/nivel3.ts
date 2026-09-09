import type { Puzzle } from "../tipos";

/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */
export const PROBLEMAS_NIVEL_3: Puzzle[] = [
  {
    "id": "consultorio-odontologico",
    "titulo": "Consultório odontológico",
    "contexto": "Quatro consultas odontológicas aconteceram pela manhã. Organize pacientes, procedimentos, convênios e dentistas.",
    "nivel": 3,
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
          "Célia",
          "Tereza",
          "Márcio",
          "Bento"
        ]
      },
      {
        "id": "procedimento",
        "label": "Procedimento",
        "valores": [
          "Limpeza",
          "Canal",
          "Extração",
          "Clareamento"
        ]
      },
      {
        "id": "convenio",
        "label": "Convênio",
        "valores": [
          "Consalud",
          "Bemviver",
          "Aurora",
          "Vitalis"
        ]
      },
      {
        "id": "dentista",
        "label": "Dentista",
        "valores": [
          "Dr. Elias",
          "Dra. Sônia",
          "Dr. Paulo",
          "Dra. Norma"
        ]
      }
    ],
    "pistas": [
      {
        "id": "consultorio-odontologico-1",
        "texto": "A consulta de Célia aconteceu entre a consulta conduzida por Dra. Sônia e a consulta pelo convênio Consalud, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "dentista",
              "valor": "Dra. Sônia"
            },
            "itemC": {
              "categoria": "paciente",
              "valor": "Célia"
            },
            "itemB": {
              "categoria": "convenio",
              "valor": "Consalud"
            },
            "id": "consultorio-odontologico-1#1"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-2",
        "texto": "A consulta pelo convênio Vitalis não foi de Célia nem de Márcio.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "convenio",
              "valor": "Vitalis"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Célia"
            },
            "id": "consultorio-odontologico-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "convenio",
              "valor": "Vitalis"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Márcio"
            },
            "id": "consultorio-odontologico-2#2"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-3",
        "texto": "A consulta pelo convênio Vitalis aconteceu entre a consulta de Márcio e a consulta com o procedimento Clareamento, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "paciente",
              "valor": "Márcio"
            },
            "itemC": {
              "categoria": "convenio",
              "valor": "Vitalis"
            },
            "itemB": {
              "categoria": "procedimento",
              "valor": "Clareamento"
            },
            "id": "consultorio-odontologico-3#1"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-4",
        "texto": "A consulta pelo convênio Bemviver não incluiu o procedimento Limpeza nem foi conduzida por Dr. Paulo.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "convenio",
              "valor": "Bemviver"
            },
            "itemB": {
              "categoria": "procedimento",
              "valor": "Limpeza"
            },
            "id": "consultorio-odontologico-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "convenio",
              "valor": "Bemviver"
            },
            "itemB": {
              "categoria": "dentista",
              "valor": "Dr. Paulo"
            },
            "id": "consultorio-odontologico-4#2"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-5",
        "texto": "A consulta com o procedimento Canal não usou o convênio Consalud, nem Bemviver, nem foi conduzida por Dra. Norma, nem por Dra. Sônia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Canal"
            },
            "itemB": {
              "categoria": "convenio",
              "valor": "Consalud"
            },
            "id": "consultorio-odontologico-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Canal"
            },
            "itemB": {
              "categoria": "convenio",
              "valor": "Bemviver"
            },
            "id": "consultorio-odontologico-5#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Canal"
            },
            "itemB": {
              "categoria": "dentista",
              "valor": "Dra. Norma"
            },
            "id": "consultorio-odontologico-5#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Canal"
            },
            "itemB": {
              "categoria": "dentista",
              "valor": "Dra. Sônia"
            },
            "id": "consultorio-odontologico-5#4"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-6",
        "texto": "A consulta de Tereza aconteceu entre a consulta com o procedimento Limpeza e a consulta pelo convênio Bemviver, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Limpeza"
            },
            "itemC": {
              "categoria": "paciente",
              "valor": "Tereza"
            },
            "itemB": {
              "categoria": "convenio",
              "valor": "Bemviver"
            },
            "id": "consultorio-odontologico-6#1"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-7",
        "texto": "A consulta com o procedimento Clareamento não foi de Bento.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "procedimento",
              "valor": "Clareamento"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Bento"
            },
            "id": "consultorio-odontologico-7#1"
          }
        ]
      },
      {
        "id": "consultorio-odontologico-9",
        "texto": "A consulta conduzida por Dra. Norma não foi de Célia nem incluiu o procedimento Canal.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "dentista",
              "valor": "Dra. Norma"
            },
            "itemB": {
              "categoria": "paciente",
              "valor": "Célia"
            },
            "id": "consultorio-odontologico-9#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "dentista",
              "valor": "Dra. Norma"
            },
            "itemB": {
              "categoria": "procedimento",
              "valor": "Canal"
            },
            "id": "consultorio-odontologico-9#2"
          }
        ]
      }
    ],
    "solucao": {
      "paciente": [
        "Márcio",
        "Tereza",
        "Célia",
        "Bento"
      ],
      "procedimento": [
        "Limpeza",
        "Canal",
        "Clareamento",
        "Extração"
      ],
      "convenio": [
        "Aurora",
        "Vitalis",
        "Bemviver",
        "Consalud"
      ],
      "dentista": [
        "Dra. Sônia",
        "Dr. Paulo",
        "Dr. Elias",
        "Dra. Norma"
      ]
    },
    "metadata": {
      "complexity": 8,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 4,
        "4+": 12
      },
      "skillWeights": {
        "exclusion": 11,
        "relativeOrder": 3,
        "adjacency": 0,
        "crossCategory": 14,
        "integrationDepth": 7,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7"
      ],
      "clueTypeDistribution": {
        "T7": 3,
        "T2": 11
      },
      "expectedDifficulty": 3,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "estandes-feira-livro",
    "titulo": "Estandes da feira do livro",
    "contexto": "Quatro editoras ocuparam estandes diferentes. Organize editoras, gêneros, países e cores.",
    "nivel": 3,
    "posicoes": 4,
    "rotulosPosicao": [
      "Estande 1",
      "Estande 2",
      "Estande 3",
      "Estande 4"
    ],
    "categorias": [
      {
        "id": "editora",
        "label": "Editora",
        "valores": [
          "Duna",
          "Alaúde",
          "Bordô",
          "Chama"
        ]
      },
      {
        "id": "genero",
        "label": "Gênero",
        "valores": [
          "Infantil",
          "Romance",
          "Poesia",
          "Ensaio"
        ]
      },
      {
        "id": "pais",
        "label": "País",
        "valores": [
          "Irlanda",
          "Egito",
          "Japão",
          "Chile"
        ]
      },
      {
        "id": "cor",
        "label": "Cor",
        "valores": [
          "Rubi",
          "Azul",
          "Verde",
          "Ocre"
        ]
      }
    ],
    "pistas": [
      {
        "id": "estandes-feira-livro-1",
        "texto": "A editora do país Japão ficou entre a editora do gênero Poesia e a editora do país Egito, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "genero",
              "valor": "Poesia"
            },
            "itemC": {
              "categoria": "pais",
              "valor": "Japão"
            },
            "itemB": {
              "categoria": "pais",
              "valor": "Egito"
            },
            "id": "estandes-feira-livro-1#1"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-2",
        "texto": "A editora Bordô não publicou o gênero Ensaio nem ficou no estande Rubi.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "editora",
              "valor": "Bordô"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Ensaio"
            },
            "id": "estandes-feira-livro-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "editora",
              "valor": "Bordô"
            },
            "itemB": {
              "categoria": "cor",
              "valor": "Rubi"
            },
            "id": "estandes-feira-livro-2#2"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-3",
        "texto": "A editora do país Egito é a editora Chama.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "pais",
              "valor": "Egito"
            },
            "itemB": {
              "categoria": "editora",
              "valor": "Chama"
            },
            "id": "estandes-feira-livro-3#1"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-4",
        "texto": "A editora do estande Rubi não representou o país Irlanda nem Egito.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cor",
              "valor": "Rubi"
            },
            "itemB": {
              "categoria": "pais",
              "valor": "Irlanda"
            },
            "id": "estandes-feira-livro-4#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cor",
              "valor": "Rubi"
            },
            "itemB": {
              "categoria": "pais",
              "valor": "Egito"
            },
            "id": "estandes-feira-livro-4#2"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-5",
        "texto": "A editora do país Japão não é a editora Duna nem publicou o gênero Ensaio.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Japão"
            },
            "itemB": {
              "categoria": "editora",
              "valor": "Duna"
            },
            "id": "estandes-feira-livro-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Japão"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Ensaio"
            },
            "id": "estandes-feira-livro-5#2"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-6",
        "texto": "A editora do gênero Ensaio ficou entre a editora do estande Ocre e a editora do estande Rubi, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "cor",
              "valor": "Ocre"
            },
            "itemC": {
              "categoria": "genero",
              "valor": "Ensaio"
            },
            "itemB": {
              "categoria": "cor",
              "valor": "Rubi"
            },
            "id": "estandes-feira-livro-6#1"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-7",
        "texto": "A editora do país Chile não publicou o gênero Infantil, nem ficou no estande Verde, nem Ocre, nem é a editora Bordô.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Chile"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Infantil"
            },
            "id": "estandes-feira-livro-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Chile"
            },
            "itemB": {
              "categoria": "cor",
              "valor": "Verde"
            },
            "id": "estandes-feira-livro-7#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Chile"
            },
            "itemB": {
              "categoria": "cor",
              "valor": "Ocre"
            },
            "id": "estandes-feira-livro-7#3"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "pais",
              "valor": "Chile"
            },
            "itemB": {
              "categoria": "editora",
              "valor": "Bordô"
            },
            "id": "estandes-feira-livro-7#4"
          }
        ]
      },
      {
        "id": "estandes-feira-livro-8",
        "texto": "A editora do país Egito publicou o gênero Infantil.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "pais",
              "valor": "Egito"
            },
            "itemB": {
              "categoria": "genero",
              "valor": "Infantil"
            },
            "id": "estandes-feira-livro-8#1"
          }
        ]
      }
    ],
    "solucao": {
      "editora": [
        "Bordô",
        "Duna",
        "Alaúde",
        "Chama"
      ],
      "genero": [
        "Poesia",
        "Ensaio",
        "Romance",
        "Infantil"
      ],
      "pais": [
        "Irlanda",
        "Chile",
        "Japão",
        "Egito"
      ],
      "cor": [
        "Ocre",
        "Azul",
        "Rubi",
        "Verde"
      ]
    },
    "metadata": {
      "complexity": 8,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 16
      },
      "skillWeights": {
        "exclusion": 10,
        "relativeOrder": 2,
        "adjacency": 0,
        "crossCategory": 14,
        "integrationDepth": 8,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T1"
      ],
      "clueTypeDistribution": {
        "T7": 2,
        "T2": 10,
        "T1": 1,
        "T8": 1
      },
      "expectedDifficulty": 3,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "consultas-nutricao",
    "titulo": "Consultas de nutrição",
    "contexto": "Quatro clientes vieram em dias diferentes. Organize clientes, objetivos, planos e bairros.",
    "nivel": 3,
    "posicoes": 4,
    "rotulosPosicao": [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta"
    ],
    "categorias": [
      {
        "id": "cliente",
        "label": "Cliente",
        "valores": [
          "Diva",
          "Rute",
          "Vitor",
          "Alan"
        ]
      },
      {
        "id": "objetivo",
        "label": "Objetivo",
        "valores": [
          "Sono",
          "Energia",
          "Digestão",
          "Desempenho"
        ]
      },
      {
        "id": "plano",
        "label": "Plano",
        "valores": [
          "Platina",
          "Prata",
          "Ouro",
          "Bronze"
        ]
      },
      {
        "id": "bairro",
        "label": "Bairro",
        "valores": [
          "Boa Vista",
          "Cruzeiro",
          "Laranjeiras",
          "Alvorada"
        ]
      }
    ],
    "pistas": [
      {
        "id": "consultas-nutricao-1",
        "texto": "O cliente do plano Bronze e o cliente do bairro Alvorada vieram em dias vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "plano",
              "valor": "Bronze"
            },
            "itemB": {
              "categoria": "bairro",
              "valor": "Alvorada"
            },
            "id": "consultas-nutricao-1#1"
          }
        ]
      },
      {
        "id": "consultas-nutricao-2",
        "texto": "O cliente do plano Platina não buscou Sono nem veio do bairro Boa Vista.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "plano",
              "valor": "Platina"
            },
            "itemB": {
              "categoria": "objetivo",
              "valor": "Sono"
            },
            "id": "consultas-nutricao-2#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "plano",
              "valor": "Platina"
            },
            "itemB": {
              "categoria": "bairro",
              "valor": "Boa Vista"
            },
            "id": "consultas-nutricao-2#2"
          }
        ]
      },
      {
        "id": "consultas-nutricao-3",
        "texto": "O cliente do bairro Cruzeiro não usou o plano Bronze, nem Platina, nem é Rute.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bairro",
              "valor": "Cruzeiro"
            },
            "itemB": {
              "categoria": "plano",
              "valor": "Bronze"
            },
            "id": "consultas-nutricao-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bairro",
              "valor": "Cruzeiro"
            },
            "itemB": {
              "categoria": "plano",
              "valor": "Platina"
            },
            "id": "consultas-nutricao-3#2"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bairro",
              "valor": "Cruzeiro"
            },
            "itemB": {
              "categoria": "cliente",
              "valor": "Rute"
            },
            "id": "consultas-nutricao-3#3"
          }
        ]
      },
      {
        "id": "consultas-nutricao-4",
        "texto": "O cliente do bairro Boa Vista não usou o plano Ouro.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "bairro",
              "valor": "Boa Vista"
            },
            "itemB": {
              "categoria": "plano",
              "valor": "Ouro"
            },
            "id": "consultas-nutricao-4#1"
          }
        ]
      },
      {
        "id": "consultas-nutricao-5",
        "texto": "O cliente do bairro Alvorada veio entre o cliente com objetivo de Energia e o cliente do bairro Laranjeiras, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "objetivo",
              "valor": "Energia"
            },
            "itemC": {
              "categoria": "bairro",
              "valor": "Alvorada"
            },
            "itemB": {
              "categoria": "bairro",
              "valor": "Laranjeiras"
            },
            "id": "consultas-nutricao-5#1"
          }
        ]
      },
      {
        "id": "consultas-nutricao-6",
        "texto": "Diva não buscou Digestão nem usou o plano Prata.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cliente",
              "valor": "Diva"
            },
            "itemB": {
              "categoria": "objetivo",
              "valor": "Digestão"
            },
            "id": "consultas-nutricao-6#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "cliente",
              "valor": "Diva"
            },
            "itemB": {
              "categoria": "plano",
              "valor": "Prata"
            },
            "id": "consultas-nutricao-6#2"
          }
        ]
      },
      {
        "id": "consultas-nutricao-7",
        "texto": "O cliente com objetivo de Digestão não é Diva nem Vitor.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "objetivo",
              "valor": "Digestão"
            },
            "itemB": {
              "categoria": "cliente",
              "valor": "Diva"
            },
            "id": "consultas-nutricao-7#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "objetivo",
              "valor": "Digestão"
            },
            "itemB": {
              "categoria": "cliente",
              "valor": "Vitor"
            },
            "id": "consultas-nutricao-7#2"
          }
        ]
      },
      {
        "id": "consultas-nutricao-9",
        "texto": "O cliente do bairro Laranjeiras buscou Sono.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "bairro",
              "valor": "Laranjeiras"
            },
            "itemB": {
              "categoria": "objetivo",
              "valor": "Sono"
            },
            "id": "consultas-nutricao-9#1"
          }
        ]
      },
      {
        "id": "consultas-nutricao-10",
        "texto": "Alan veio entre Rute e o cliente do bairro Boa Vista, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "cliente",
              "valor": "Rute"
            },
            "itemC": {
              "categoria": "cliente",
              "valor": "Alan"
            },
            "itemB": {
              "categoria": "bairro",
              "valor": "Boa Vista"
            },
            "id": "consultas-nutricao-10#1"
          }
        ]
      }
    ],
    "solucao": {
      "cliente": [
        "Diva",
        "Rute",
        "Alan",
        "Vitor"
      ],
      "objetivo": [
        "Energia",
        "Digestão",
        "Sono",
        "Desempenho"
      ],
      "plano": [
        "Ouro",
        "Platina",
        "Bronze",
        "Prata"
      ],
      "bairro": [
        "Cruzeiro",
        "Alvorada",
        "Laranjeiras",
        "Boa Vista"
      ]
    },
    "metadata": {
      "complexity": 9,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 3,
        "3": 4,
        "4+": 9
      },
      "skillWeights": {
        "exclusion": 10,
        "relativeOrder": 2,
        "adjacency": 1,
        "crossCategory": 14,
        "integrationDepth": 9,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T1"
      ],
      "clueTypeDistribution": {
        "T5": 1,
        "T2": 10,
        "T7": 2,
        "T1": 1
      },
      "expectedDifficulty": 3,
      "validatedUniqueSolution": true
    }
  },
  {
    "id": "ensaios-orquestra",
    "titulo": "Ensaios da orquestra",
    "contexto": "Quatro naipes ensaiaram em horários diferentes. Organize naipes, regentes, peças e salas.",
    "nivel": 3,
    "posicoes": 4,
    "rotulosPosicao": [
      "9h",
      "11h",
      "14h",
      "16h"
    ],
    "categorias": [
      {
        "id": "naipe",
        "label": "Naipe",
        "valores": [
          "Metais",
          "Percussão",
          "Madeiras",
          "Cordas"
        ]
      },
      {
        "id": "regente",
        "label": "Regente",
        "valores": [
          "Marta",
          "Fábio",
          "Ana Lúcia",
          "Sérgio"
        ]
      },
      {
        "id": "peca",
        "label": "Peça",
        "valores": [
          "Barcarola",
          "Cortejo",
          "Alvorada",
          "Devaneio"
        ]
      },
      {
        "id": "sala",
        "label": "Sala",
        "valores": [
          "Anexo",
          "Concha",
          "Estúdio",
          "Foyer"
        ]
      }
    ],
    "pistas": [
      {
        "id": "ensaios-orquestra-1",
        "texto": "O naipe da sala Concha é o naipe de Cordas.",
        "restricoes": [
          {
            "tipo": "T8",
            "itemA": {
              "categoria": "sala",
              "valor": "Concha"
            },
            "itemB": {
              "categoria": "naipe",
              "valor": "Cordas"
            },
            "id": "ensaios-orquestra-1#1"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-2",
        "texto": "O naipe regido por Marta e o naipe que tocou Alvorada ensaiaram em horários vizinhos.",
        "restricoes": [
          {
            "tipo": "T5",
            "itemA": {
              "categoria": "regente",
              "valor": "Marta"
            },
            "itemB": {
              "categoria": "peca",
              "valor": "Alvorada"
            },
            "id": "ensaios-orquestra-2#1"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-3",
        "texto": "O naipe da sala Anexo não é o naipe de Percussão nem foi regido por Ana Lúcia.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Anexo"
            },
            "itemB": {
              "categoria": "naipe",
              "valor": "Percussão"
            },
            "id": "ensaios-orquestra-3#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "sala",
              "valor": "Anexo"
            },
            "itemB": {
              "categoria": "regente",
              "valor": "Ana Lúcia"
            },
            "id": "ensaios-orquestra-3#2"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-4",
        "texto": "O naipe regido por Sérgio tocou Devaneio.",
        "restricoes": [
          {
            "tipo": "T1",
            "itemA": {
              "categoria": "regente",
              "valor": "Sérgio"
            },
            "itemB": {
              "categoria": "peca",
              "valor": "Devaneio"
            },
            "id": "ensaios-orquestra-4#1"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-5",
        "texto": "O naipe que tocou Barcarola não ensaiou na Concha nem no Foyer.",
        "restricoes": [
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "peca",
              "valor": "Barcarola"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Concha"
            },
            "id": "ensaios-orquestra-5#1"
          },
          {
            "tipo": "T2",
            "itemA": {
              "categoria": "peca",
              "valor": "Barcarola"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Foyer"
            },
            "id": "ensaios-orquestra-5#2"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-6",
        "texto": "O naipe regido por Ana Lúcia ensaiou entre o naipe da sala Concha e o naipe regido por Marta, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "sala",
              "valor": "Concha"
            },
            "itemC": {
              "categoria": "regente",
              "valor": "Ana Lúcia"
            },
            "itemB": {
              "categoria": "regente",
              "valor": "Marta"
            },
            "id": "ensaios-orquestra-6#1"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-7",
        "texto": "O naipe de Madeiras ensaiou antes do naipe regido por Marta.",
        "restricoes": [
          {
            "tipo": "T4",
            "itemA": {
              "categoria": "naipe",
              "valor": "Madeiras"
            },
            "itemB": {
              "categoria": "regente",
              "valor": "Marta"
            },
            "id": "ensaios-orquestra-7#1"
          }
        ]
      },
      {
        "id": "ensaios-orquestra-8",
        "texto": "O naipe da sala Anexo ensaiou entre o naipe de Percussão e o naipe da sala Foyer, nessa ordem.",
        "restricoes": [
          {
            "tipo": "T7",
            "itemA": {
              "categoria": "naipe",
              "valor": "Percussão"
            },
            "itemC": {
              "categoria": "sala",
              "valor": "Anexo"
            },
            "itemB": {
              "categoria": "sala",
              "valor": "Foyer"
            },
            "id": "ensaios-orquestra-8#1"
          }
        ]
      }
    ],
    "solucao": {
      "naipe": [
        "Cordas",
        "Percussão",
        "Madeiras",
        "Metais"
      ],
      "regente": [
        "Sérgio",
        "Ana Lúcia",
        "Fábio",
        "Marta"
      ],
      "peca": [
        "Devaneio",
        "Barcarola",
        "Alvorada",
        "Cortejo"
      ],
      "sala": [
        "Concha",
        "Estúdio",
        "Anexo",
        "Foyer"
      ]
    },
    "metadata": {
      "complexity": 8,
      "inferenceDepthDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4+": 16
      },
      "skillWeights": {
        "exclusion": 4,
        "relativeOrder": 3,
        "adjacency": 1,
        "crossCategory": 10,
        "integrationDepth": 8,
        "uncertaintyTolerance": 2
      },
      "dominantOperations": [
        "T2",
        "T7",
        "T1"
      ],
      "clueTypeDistribution": {
        "T8": 1,
        "T5": 1,
        "T2": 4,
        "T1": 1,
        "T7": 2,
        "T4": 1
      },
      "expectedDifficulty": 3,
      "validatedUniqueSolution": true
    }
  }
];
