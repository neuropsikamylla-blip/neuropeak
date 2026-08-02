# 16 — Lista canônica provisória das atividades clínicas

> **34 atividades clínicas reais.** Provisória: depende das decisões do documento 14
> (nomes) e 15 (modalidades). Nada implementado.

## Regra da lista

Entra quem está no **catálogo** (`lib/domain-taxonomy.ts`) **e** tem execução no `switch`. Ficam de
fora: aliases, modos auditivos e o órfão `desafio-cidade`.

| canonicalExerciseId | Nome oficial | Status | Categoria | Modalidades | Aliases | Rota | Terapeuta | Paciente |
|---|---|---|---|---|---|---|---|---|
| `antes-depois` | Caminhos para a Meta | ACTIVE | Funções Executivas | visual · visual+áudio · só áudio | — | `/treino/antes-depois` | sim | sim |
| `certo-ou-errado` | Certo ou Errado | ACTIVE | Velocidade de Processamento | — só visual | — | `/treino/certo-ou-errado` | sim | sim |
| `compra-multifuncional` | Compra Multifuncional | ACTIVE | Desenvolvimento Funcional | **visual · visual+áudio · só áudio** (aprovado 02/ago, a implementar) | `desafio-orcamento` | `/treino/compra-multifuncional` | sim | sim |
| `corrida-tempo` | Busca Rápida | ACTIVE | Velocidade de Processamento | — só visual | — | `/treino/corrida-tempo` | sim | sim |
| `cubo-corsi` | Cubos | ACTIVE | Memória | — só visual | — | `/treino/cubo-corsi` | sim | sim |
| `deductive-grid` | Grade Dedutiva | ACTIVE | Funções Executivas | — só visual | — | `/treino/deductive-grid` | sim | sim |
| `desafio-supermercado` | Supermercado | ACTIVE | Memória | visual · visual+áudio · só áudio | `desafio-supermercado-auditivo` | `/treino/desafio-supermercado` | sim | sim |
| `dual-task` | Dupla Tarefa | ACTIVE | Atenção | — só visual | — | `/treino/dual-task` | sim | sim |
| `estacionamento-logico` | Estacionamento Lógico | ACTIVE | Funções Executivas | — só visual | — | `/treino/estacionamento-logico` | sim | sim |
| `focus-agents` | Focus Agentes | ACTIVE | Atenção | **visual · visual+áudio · só áudio** (aprovado 02/ago, a implementar) | `focus-agents-auditivo` | `/treino/focus-agents` | sim | sim |
| `identificacao-simbolos` | Identificação de Símbolos | ACTIVE | Velocidade de Processamento | — só visual | — | `/treino/identificacao-simbolos` | sim | sim |
| `informacao-em-foco` | Informação em Foco | ACTIVE | Atenção | — só visual | `caca-item-barato`, `mudanca-regras` | `/treino/informacao-em-foco` | sim | sim |
| `investigadores-sociais` | Investigadores da Situação Social | ACTIVE | Desenvolvimento Funcional | — só visual | — | `/treino/investigadores-sociais` | sim | sim |
| `jogo-memoria` | Jogo da Memória | ACTIVE | Memória | — só visual | — | `/treino/jogo-memoria` | sim | sim |
| `labirinto` | Labirinto | ACTIVE | Funções Executivas | — só visual | — | `/treino/labirinto` | sim | sim |
| `letras-sequencia` | Letras em Sequência | ACTIVE | Memória | — só visual | — | `/treino/letras-sequencia` | sim | sim |
| `lista-distracao` | Lista com Distração | ACTIVE | Memória | — só visual | — | `/treino/lista-distracao` | sim | sim |
| `matriz-espacial` | Matriz Espacial | ACTIVE | Memória | — só visual | — | `/treino/matriz-espacial` | sim | sim |
| `matriz-espacial-inversa` | Matriz Espacial Inversa | ACTIVE | Memória | — só visual | — | `/treino/matriz-espacial-inversa` | sim | sim |
| `mot` | Rastreamento de Objetos | ACTIVE | Atenção | — só visual | — | `/treino/mot` | sim | sim |
| `nback` | N-Back | ACTIVE | Memória | — só visual | — | `/treino/nback` | sim | sim |
| `ordem-historia` | Ordem da História | ACTIVE | Funções Executivas | — só visual | — | `/treino/ordem-historia` | sim | sim |
| `padroes-rotacao` | Matriz com Rotações | ACTIVE | Memória | — só visual | — | `/treino/padroes-rotacao` | sim | sim |
| `restaurante-ordem` | Restaurante | ACTIVE | Memória | visual · visual+áudio · só áudio | `restaurante-ordem-auditivo` | `/treino/restaurante-ordem` | sim | sim |
| `semaforo` | Semáforo | ACTIVE | Velocidade de Processamento | — só visual | — | `/treino/semaforo` | sim | sim |
| `sequencia-itens` | Sequência de Itens | ACTIVE | Memória | — só visual | — | `/treino/sequencia-itens` | sim | sim |
| `span-numerico` | Span Numérico Auditivo Direto | ACTIVE | Memória | **auditiva (intrínseca, sem seletor)** | — | `/treino/span-numerico` | sim | sim |
| `span-numerico-inverso` | Span Numérico Auditivo Inverso | ACTIVE | Memória | **auditiva (intrínseca, sem seletor)** | — | `/treino/span-numerico-inverso` | sim | sim |
| `stroop-task` | Cores e Palavras | ACTIVE | Funções Executivas | — só visual | — | `/treino/stroop-task` | sim | sim |
| `task-switching` | Task Switching | ACTIVE | Funções Executivas | — só visual | — | `/treino/task-switching` | sim | sim |
| `tempo-reacao` | Tempo de Reação | ACTIVE | Velocidade de Processamento | — só visual | — | `/treino/tempo-reacao` | sim | sim |
| `torre-hanoi` | Jogo das Torres | ACTIVE | Funções Executivas | — só visual | — | `/treino/torre-hanoi` | sim | sim |
| `trilha-visual` | Conecta Números | ACTIVE | Atenção | — só visual | — | `/treino/trilha-visual` | sim | sim |
| `vigilancia` | Vigilância | ACTIVE | Atenção | — só visual | — | `/treino/vigilancia` | sim | sim |

## Fora da lista canônica

| ID | Por quê | Pertence a |
|---|---|---|
| `focus-agents-auditivo` | modo, não exercício | `focus-agents` |
| `restaurante-ordem-auditivo` | modo, não exercício | `restaurante-ordem` |
| `desafio-supermercado-auditivo` | modo, não exercício | `desafio-supermercado` |
| `desafio-orcamento` | id antigo redirecionado | `compra-multifuncional` |
| `caca-item-barato` | id antigo redirecionado | `informacao-em-foco` |
| `mudanca-regras` | id antigo redirecionado | `informacao-em-foco` |
| `desafio-cidade` | **órfão**: renderiza, mas foi tirado do catálogo | — |

## Campo que falta no modelo de dados

A lista canônica mostra que `EXERCISE_DEFINITIONS` está fazendo três trabalhos ao mesmo tempo:
catálogo clínico, dicionário de ids históricos e definição de modo. O documento 06 propõe separar —
e o campo que resolve isto é um `status` explícito na definição, em vez de a informação estar
espalhada entre três arquivos.
