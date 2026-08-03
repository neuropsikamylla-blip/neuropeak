# Perfis cognitivos associados — camada macro

## Escopo e regra de derivação

Esta camada resume a matriz fina de 34 exercícios sem substituí-la. A matriz é descritiva da mecânica real; categoria e subdomínio continuam representando a finalidade clínica escolhida para o catálogo. Uma divergência entre catálogo e mecânica é informativa e não constitui erro.

Um macro associado foi incluído somente quando ao menos um domínio fino correspondente tem intensidade 2 ou 3, a demanda é relevante e recorrente e não é meramente instrumental. O macro equivalente ao principal mecânico foi removido, exceto em Caminhos para a Meta, cuja decisão clínica literal mantém **Organização** como principal e **Organização e Sequenciamento** entre os associados. A ordenação considera intensidade máxima, quantidade de domínios finos no macro, centralidade mecânica e persistência nos níveis. A camada resumida limita-se a quatro associados; quando nenhum macro secundário satisfaz a regra, o array permanece vazio em vez de receber um rótulo forçado. Os valores finos completos permanecem em `cognitive-matrix.json`.

Leitura não foi convertida automaticamente em alvo de linguagem, duração não foi convertida em atenção sustentada, ordem inversa ou sequenciamento não foram convertidos em flexibilidade, e rapidez motora não foi convertida em velocidade de processamento.

## Mapeamento auditável: domínio fino → macro

| Chave na matriz | Domínio fino | Macro cognitivo |
|---|---|---|
| `selectiveAttention` | atenção seletiva | Atenção Seletiva |
| `sustainedAttention` | atenção sustentada | Atenção Sustentada |
| `dividedAttention` | atenção dividida | Atenção Dividida |
| `alternatingAttention` | atenção alternada | Atenção Alternada |
| `visualSearch` | busca visual | Busca e Rastreamento Visual |
| `verbalWorkingMemory` | memória operacional verbal | Memória Operacional Verbal |
| `visuospatialWorkingMemory` | memória operacional visuoespacial | Memória Operacional Visuoespacial |
| `verbalStorage` | armazenamento verbal de curto prazo | Armazenamento de Curto Prazo |
| `visuospatialStorage` | armazenamento visuoespacial de curto prazo | Armazenamento de Curto Prazo |
| `updating` | atualização de informação | Atualização e Manipulação Mental |
| `mentalManipulation` | manipulação mental | Atualização e Manipulação Mental |
| `inhibitoryControl` | controle inibitório | Controle Inibitório |
| `distractionControl` | controle de distração | Controle Inibitório |
| `cognitiveFlexibility` | flexibilidade cognitiva | Flexibilidade Cognitiva |
| `ruleSwitching` | alternância de regra | Flexibilidade Cognitiva |
| `planning` | planejamento | Planejamento |
| `organization` | organização | Organização e Sequenciamento |
| `sequencing` | sequenciamento | Organização e Sequenciamento |
| `temporalOrdering` | ordenação temporal | Organização e Sequenciamento |
| `monitoring` | monitoramento | Monitoramento Executivo e Manutenção de Meta |
| `goalMaintenance` | manutenção de meta | Monitoramento Executivo e Manutenção de Meta |
| `problemSolving` | resolução de problemas | Resolução de Problemas e Tomada de Decisão |
| `processingSpeed` | velocidade de processamento | Velocidade de Processamento |
| `reactionTime` | tempo de reação | Tempo de Reação |
| `perceptualSpeed` | rapidez perceptiva | Percepção e Processamento Visuoespacial |
| `visualDiscrimination` | discriminação visual | Percepção e Processamento Visuoespacial |
| `visuospatialReasoning` | raciocínio visuoespacial | Percepção e Processamento Visuoespacial |
| `mentalRotation` | rotação mental | Percepção e Processamento Visuoespacial |
| `spatialRelations` | relações espaciais | Percepção e Processamento Visuoespacial |
| `verbalComprehension` | compreensão verbal | Linguagem, Leitura e Processamento Auditivo |
| `sequentialAuditoryProcessing` | processamento auditivo sequencial | Linguagem, Leitura e Processamento Auditivo |
| `reading` | leitura | Linguagem, Leitura e Processamento Auditivo |
| `logicalReasoning` | raciocínio lógico | Raciocínio Lógico e Dedutivo |
| `deductiveReasoning` | raciocínio dedutivo | Raciocínio Lógico e Dedutivo |

### Domínios finos sem macro cognitivo correspondente

| Chave na matriz | Domínio fino | Tratamento nesta camada |
|---|---|---|
| `functionalAutonomy` | autonomia funcional | Somente `functionalClinicalTags`: **Autonomia Funcional**, quando aplicável. |
| — | — | — |

`functionalAutonomy` é contexto funcional, não processo, e por isso nunca é usado como
`mechanicalPrimary` nem como `associatedCognitiveProfiles`.

⚠️ **Correção de 02/ago (decisão clínica dela):** `socialCognition` **deixou de ser** um domínio sem
macro. Foi criado o **21º macro — Cognição Social e Inferência Social** — que agrega: reconhecimento
de emoções · interpretação de intenções · teoria da mente · tomada de perspectiva · inferência
social · compreensão de pistas sociais · julgamento social · compreensão de regras sociais · seleção
de resposta social adequada.

**Cognição social existe nos dois níveis, sem duplicação indevida:** como **macro** descreve o
processo mental recrutado; como **tag funcional** ("Cognição Social", "Compreensão de Situações
Sociais", "Habilidades Sociais") descreve a aplicação clínica. São camadas diferentes do mesmo
conceito, não repetição.

## Perfis dos 34 exercícios

| Exercício | catalogDomain | catalogSubdomain | mechanicalPrimary | associados | tags funcionais | profileStatus |
|---|---|---|---|---|---|---|
| `span-numerico` — Span Numérico Auditivo Direto | Memória | Memória Operacional | Armazenamento de Curto Prazo | Memória Operacional Verbal<br>Organização e Sequenciamento<br>Linguagem, Leitura e Processamento Auditivo | — | `FINALIZED_PROFILE` |
| `stroop-task` — Cores e Palavras | Funções Executivas | Controle Inibitório | Controle Inibitório | Atenção Seletiva<br>Flexibilidade Cognitiva<br>Monitoramento Executivo e Manutenção de Meta<br>Tempo de Reação | — | `FINALIZED_PROFILE` |
| `focus-agents` — Agentes Focus | Atenção | Atenção Sustentada | Busca e Rastreamento Visual | Atenção Seletiva<br>Controle Inibitório<br>Monitoramento Executivo e Manutenção de Meta<br>Percepção e Processamento Visuoespacial | — | `FINALIZED_PROFILE` |
| `span-numerico-inverso` — Span Numérico Auditivo Inverso | Memória | Memória Operacional | Atualização e Manipulação Mental | Memória Operacional Verbal<br>Armazenamento de Curto Prazo<br>Organização e Sequenciamento<br>Monitoramento Executivo e Manutenção de Meta | — | `FINALIZED_PROFILE` |
| `matriz-espacial` — Matriz Espacial | Memória | Memória Visuoespacial | Armazenamento de Curto Prazo | Memória Operacional Visuoespacial<br>Organização e Sequenciamento<br>Percepção e Processamento Visuoespacial | — | `FINALIZED_PROFILE` |
| `matriz-espacial-inversa` — Matriz Espacial Inversa | Memória | Memória Visuoespacial | Atualização e Manipulação Mental | Memória Operacional Visuoespacial<br>Armazenamento de Curto Prazo<br>Organização e Sequenciamento<br>Percepção e Processamento Visuoespacial | — | `FINALIZED_PROFILE` |
| `jogo-memoria` — Jogo da Memória | Memória | Memória Visuoespacial | Memória Operacional Visuoespacial | Percepção e Processamento Visuoespacial<br>Armazenamento de Curto Prazo<br>Atualização e Manipulação Mental | — | `FINALIZED_PROFILE` |
| `trilha-visual` — Conecta Números | Atenção | Atenção Seletiva | Busca e Rastreamento Visual | Atenção Seletiva<br>Organização e Sequenciamento<br>Monitoramento Executivo e Manutenção de Meta | — | `FINALIZED_PROFILE` |
| `antes-depois` — Caminhos para a Meta | Funções Executivas | Planejamento e Flexibilidade | Organização | Organização e Sequenciamento<br>Monitoramento Executivo e Manutenção de Meta<br>Memória Operacional Verbal | Autonomia Funcional<br>Atividades Instrumentais da Vida Diária<br>Organização da Rotina | `PROVISIONAL_PROFILE` |
| `informacao-em-foco` — Informação em Foco | Atenção | Atenção Seletiva | Atenção Seletiva | Busca e Rastreamento Visual<br>Monitoramento Executivo e Manutenção de Meta | Atividades Instrumentais da Vida Diária<br>Tomada de Decisão Cotidiana | `FINALIZED_PROFILE` |
| `mot` — Rastreamento de Objetos | Atenção | Atenção Dividida | Busca e Rastreamento Visual | Atenção Dividida<br>Memória Operacional Visuoespacial<br>Atualização e Manipulação Mental<br>Controle Inibitório | — | `FINALIZED_PROFILE` |
| `dual-task` — Dupla Tarefa | Atenção | Atenção Dividida | Atenção Dividida | Memória Operacional Verbal<br>Atualização e Manipulação Mental<br>Controle Inibitório<br>Atenção Seletiva | — | `FINALIZED_PROFILE` |
| `tempo-reacao` — Tempo de Reação | Velocidade de Processamento | Tempo de Reação | Tempo de Reação | Percepção e Processamento Visuoespacial | — | `FINALIZED_PROFILE` |
| `certo-ou-errado` — Certo ou Errado | Velocidade de Processamento | Resposta Rápida | Resolução de Problemas e Tomada de Decisão | Raciocínio Lógico e Dedutivo | Cognição Social<br>Tomada de Decisão Cotidiana<br>Compreensão de Situações Sociais | `FINALIZED_PROFILE` |
| `semaforo` — Semáforo | Velocidade de Processamento | Tempo de Reação | Tempo de Reação | Percepção e Processamento Visuoespacial<br>Atenção Seletiva<br>Velocidade de Processamento<br>Monitoramento Executivo e Manutenção de Meta | — | `FINALIZED_PROFILE` |
| `corrida-tempo` — Busca Rápida | Velocidade de Processamento | Resposta Rápida | Busca e Rastreamento Visual | Atenção Seletiva<br>Controle Inibitório<br>Monitoramento Executivo e Manutenção de Meta<br>Velocidade de Processamento | — | `FINALIZED_PROFILE` |
| `torre-hanoi` — Jogo das Torres | Funções Executivas | Planejamento | Planejamento | Monitoramento Executivo e Manutenção de Meta<br>Percepção e Processamento Visuoespacial<br>Resolução de Problemas e Tomada de Decisão<br>Memória Operacional Visuoespacial | — | `FINALIZED_PROFILE` |
| `labirinto` — Labirinto | Funções Executivas | Planejamento | Planejamento | Monitoramento Executivo e Manutenção de Meta<br>Percepção e Processamento Visuoespacial<br>Resolução de Problemas e Tomada de Decisão<br>Memória Operacional Visuoespacial | — | `FINALIZED_PROFILE` |
| `ordem-historia` — Ordem da História | Funções Executivas | Raciocínio Lógico | Organização e Sequenciamento | Monitoramento Executivo e Manutenção de Meta<br>Resolução de Problemas e Tomada de Decisão<br>Percepção e Processamento Visuoespacial<br>Raciocínio Lógico e Dedutivo | — | `FINALIZED_PROFILE` |
| `compra-multifuncional` — Compra Multifuncional | Desenvolvimento Funcional | Autonomia | Resolução de Problemas e Tomada de Decisão | Monitoramento Executivo e Manutenção de Meta<br>Memória Operacional Verbal<br>Raciocínio Lógico e Dedutivo | Autonomia Funcional<br>Atividades Instrumentais da Vida Diária<br>Tomada de Decisão Cotidiana<br>Uso Funcional de Dinheiro | `FINALIZED_PROFILE` |
| `task-switching` — Alternância de Regras | Funções Executivas | Flexibilidade Cognitiva | Flexibilidade Cognitiva | Controle Inibitório<br>Atenção Seletiva<br>Atualização e Manipulação Mental<br>Monitoramento Executivo e Manutenção de Meta | — | `FINALIZED_PROFILE` |
| `deductive-grid` — Grade Dedutiva | Funções Executivas | Raciocínio Lógico | Raciocínio Lógico e Dedutivo | Monitoramento Executivo e Manutenção de Meta<br>Memória Operacional Verbal<br>Organização e Sequenciamento<br>Resolução de Problemas e Tomada de Decisão | — | `FINALIZED_PROFILE` |
| `letras-sequencia` — Letras em Sequência | Memória | Memória Operacional | Armazenamento de Curto Prazo | Memória Operacional Verbal<br>Organização e Sequenciamento | — | `FINALIZED_PROFILE` |
| `sequencia-itens` — Sequência de Itens | Memória | Memória Operacional | Armazenamento de Curto Prazo | Memória Operacional Visuoespacial<br>Percepção e Processamento Visuoespacial<br>Organização e Sequenciamento | — | `FINALIZED_PROFILE` |
| `padroes-rotacao` — Matriz com Rotações | Memória | Memória Visuoespacial | Percepção e Processamento Visuoespacial | Memória Operacional Visuoespacial<br>Atualização e Manipulação Mental<br>Armazenamento de Curto Prazo | — | `FINALIZED_PROFILE` |
| `lista-distracao` — Lista com Distração | Memória | Memória Operacional | Memória Operacional Verbal | Atenção Alternada<br>Controle Inibitório<br>Armazenamento de Curto Prazo<br>Monitoramento Executivo e Manutenção de Meta | — | `FINALIZED_PROFILE` |
| `restaurante-ordem` — Restaurante | Memória | Memória Operacional | Memória Operacional Verbal | Armazenamento de Curto Prazo<br>Atenção Seletiva<br>Controle Inibitório | Atividades Instrumentais da Vida Diária | `FINALIZED_PROFILE` |
| `desafio-supermercado` — Supermercado | Memória | Memória Operacional | Memória Operacional Verbal | Armazenamento de Curto Prazo<br>Busca e Rastreamento Visual<br>Atenção Seletiva<br>Controle Inibitório | Autonomia Funcional<br>Atividades Instrumentais da Vida Diária | `FINALIZED_PROFILE` |
| `nback` — N-Back | Memória | Memória Operacional | Atualização e Manipulação Mental | Memória Operacional Verbal<br>Atenção Sustentada<br>Monitoramento Executivo e Manutenção de Meta<br>Tempo de Reação | — | `FINALIZED_PROFILE` |
| `cubo-corsi` — Cubos | Memória | Memória Visuoespacial | Memória Operacional Visuoespacial | Percepção e Processamento Visuoespacial<br>Armazenamento de Curto Prazo<br>Atualização e Manipulação Mental<br>Organização e Sequenciamento | — | `FINALIZED_PROFILE` |
| `vigilancia` — Vigilância | Atenção | Atenção Sustentada | Percepção e Processamento Visuoespacial | Armazenamento de Curto Prazo<br>Atenção Seletiva<br>Controle Inibitório | — | `FINALIZED_PROFILE` |
| `identificacao-simbolos` — Identificação de Símbolos | Velocidade de Processamento | Busca Visual Rápida | Busca e Rastreamento Visual | Atenção Seletiva<br>Controle Inibitório<br>Percepção e Processamento Visuoespacial | — | `FINALIZED_PROFILE` |
| `estacionamento-logico` — Estacionamento Lógico | Funções Executivas | Planejamento | Planejamento | Monitoramento Executivo e Manutenção de Meta<br>Percepção e Processamento Visuoespacial<br>Organização e Sequenciamento<br>Resolução de Problemas e Tomada de Decisão | — | `FINALIZED_PROFILE` |
| `investigadores-sociais` — Investigadores da Situação Social | Desenvolvimento Funcional | Cognição Social | **Cognição Social e Inferência Social** | Linguagem, Leitura e Processamento Auditivo<br>Resolução de Problemas e Tomada de Decisão | Cognição Social<br>Compreensão de Situações Sociais<br>Resolução de Situações Sociais<br>Habilidades Sociais | `FINALIZED_PROFILE` |

## Divergências entre catálogo e mecânica

Os casos abaixo são diferenças literais entre `catalogSubdomain` e `mechanicalPrimary`. Elas preservam separadamente a finalidade clínica de apresentação e a operação predominante da mecânica atual; não devem ser corrigidas para coincidir.

| Exercício | catalogSubdomain | mechanicalPrimary |
|---|---|---|
| `span-numerico` — Span Numérico Auditivo Direto | Memória Operacional | Armazenamento de Curto Prazo |
| `focus-agents` — Agentes Focus | Atenção Sustentada | Busca e Rastreamento Visual |
| `span-numerico-inverso` — Span Numérico Auditivo Inverso | Memória Operacional | Atualização e Manipulação Mental |
| `matriz-espacial` — Matriz Espacial | Memória Visuoespacial | Armazenamento de Curto Prazo |
| `matriz-espacial-inversa` — Matriz Espacial Inversa | Memória Visuoespacial | Atualização e Manipulação Mental |
| `jogo-memoria` — Jogo da Memória | Memória Visuoespacial | Memória Operacional Visuoespacial |
| `trilha-visual` — Conecta Números | Atenção Seletiva | Busca e Rastreamento Visual |
| `antes-depois` — Caminhos para a Meta | Planejamento e Flexibilidade | Organização |
| `mot` — Rastreamento de Objetos | Atenção Dividida | Busca e Rastreamento Visual |
| `certo-ou-errado` — Certo ou Errado | Resposta Rápida | Resolução de Problemas e Tomada de Decisão |
| `corrida-tempo` — Busca Rápida | Resposta Rápida | Busca e Rastreamento Visual |
| `ordem-historia` — Ordem da História | Raciocínio Lógico | Organização e Sequenciamento |
| `compra-multifuncional` — Compra Multifuncional | Autonomia | Resolução de Problemas e Tomada de Decisão |
| `deductive-grid` — Grade Dedutiva | Raciocínio Lógico | Raciocínio Lógico e Dedutivo |
| `letras-sequencia` — Letras em Sequência | Memória Operacional | Armazenamento de Curto Prazo |
| `sequencia-itens` — Sequência de Itens | Memória Operacional | Armazenamento de Curto Prazo |
| `padroes-rotacao` — Matriz com Rotações | Memória Visuoespacial | Percepção e Processamento Visuoespacial |
| `lista-distracao` — Lista com Distração | Memória Operacional | Memória Operacional Verbal |
| `restaurante-ordem` — Restaurante | Memória Operacional | Memória Operacional Verbal |
| `desafio-supermercado` — Supermercado | Memória Operacional | Memória Operacional Verbal |
| `nback` — N-Back | Memória Operacional | Atualização e Manipulação Mental |
| `cubo-corsi` — Cubos | Memória Visuoespacial | Memória Operacional Visuoespacial |
| `vigilancia` — Vigilância | Atenção Sustentada | Percepção e Processamento Visuoespacial |
| `identificacao-simbolos` — Identificação de Símbolos | Busca Visual Rápida | Busca e Rastreamento Visual |
| `investigadores-sociais` — Investigadores da Situação Social | Cognição Social | **Cognição Social e Inferência Social** |

## Decisões clínicas específicas

### Caminhos para a Meta

`antes-depois` permanece com `catalogSubdomain` **Planejamento e Flexibilidade**, `mechanicalPrimary` **Organização** e `profileStatus` `PROVISIONAL_PROFILE`. Seus associados atuais são **Organização e Sequenciamento**, **Monitoramento Executivo e Manutenção de Meta** e **Memória Operacional Verbal**, todos sustentados pela matriz fina. **Flexibilidade Cognitiva não foi incluída.** O exercício será reformulado; o perfil atual é provisório e não deve servir de modelo para a engine. Flexibilidade somente poderá entrar quando a mecânica reformulada exigir mudança de estratégia, replanejamento, mais de uma rota ou abandono de estratégia ineficiente.

### Restaurante

`restaurante-ordem` permanece com `mechanicalPrimary` **Memória Operacional Verbal**. Os associados resumem armazenamento verbal/visuoespacial, atenção seletiva e controle de distração encontrados na matriz. **Atenção Sustentada não foi incluída**, pois não decorre da duração em minutos. **Flexibilidade Cognitiva não foi incluída**, pois ordem direta, inversa ou com exclusão aumenta manipulação, atualização, inibição e manutenção de regra, sem alternância ativa entre regras.
