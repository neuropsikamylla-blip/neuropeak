# Constituição dos exercícios

## OBJETIVO

Este documento é a **única fonte oficial** de exercícios do sistema. Todo exercício novo deve ser
registrado aqui.

- **Não usar nomes técnicos na interface.**
- **Não usar Legacy IDs na documentação clínica.**
- Os IDs técnicos existem apenas para compatibilidade com planos, sessões e progresso no banco.
- Qualquer alteração de nome exige aprovação antes da implementação.

## Catálogo atual

| # | ID técnico | Nome oficial | Categoria | Domínio principal | Modalidade configurável | Status |
|---|---|---|---|---|---|---|
| 1 | `span-numerico` | Span Numérico Auditivo Direto | Memória | Memória Operacional | não (auditivo intrínseco) | ACTIVE |
| 2 | `stroop-task` | Cores e Palavras | Funções Executivas | Controle Inibitório | não | ACTIVE |
| 3 | `focus-agents` | Agentes Focus | Atenção | Atenção Sustentada | **sim** | ACTIVE |
| 4 | `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória | Memória Operacional | não (auditivo intrínseco) | ACTIVE |
| 5 | `matriz-espacial` | Matriz Espacial | Memória | Memória Visuoespacial | não | ACTIVE |
| 6 | `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória | Memória Visuoespacial | não | ACTIVE |
| 7 | `jogo-memoria` | Jogo da Memória | Memória | Memória Visuoespacial | não | ACTIVE |
| 8 | `trilha-visual` | Conecta Números | Atenção | Atenção Seletiva | não | ACTIVE |
| 9 | `antes-depois` | Caminhos para a Meta | Funções Executivas | Planejamento e Flexibilidade | **sim** | ACTIVE |
| 10 | `informacao-em-foco` | Informação em Foco | Atenção | Atenção Seletiva | não | ACTIVE |
| 11 | `mot` | Rastreamento de Objetos | Atenção | Atenção Dividida | não | ACTIVE |
| 12 | `dual-task` | Dupla Tarefa | Atenção | Atenção Dividida | não | ACTIVE |
| 13 | `tempo-reacao` | Tempo de Reação | Velocidade de Processamento | Tempo de Reação | não | ACTIVE |
| 14 | `certo-ou-errado` | Certo ou Errado | Velocidade de Processamento | Resposta Rápida | não | ACTIVE |
| 15 | `semaforo` | Semáforo | Velocidade de Processamento | Tempo de Reação | não | ACTIVE |
| 16 | `corrida-tempo` | Busca Rápida | Velocidade de Processamento | Resposta Rápida | não | ACTIVE |
| 17 | `torre-hanoi` | Jogo das Torres | Funções Executivas | Planejamento | não | ACTIVE |
| 18 | `labirinto` | Labirinto | Funções Executivas | Planejamento | não | ACTIVE |
| 19 | `ordem-historia` | Ordem da História | Funções Executivas | Raciocínio Lógico | não | ACTIVE |
| 20 | `compra-multifuncional` | Compra Multifuncional | Desenvolvimento Funcional | Autonomia | **sim** | ACTIVE |
| 21 | `task-switching` | Alternância de Regras | Funções Executivas | Flexibilidade Cognitiva | não | ACTIVE |
| 22 | `deductive-grid` | Grade Dedutiva | Funções Executivas | Raciocínio Lógico | não | ACTIVE |
| 23 | `letras-sequencia` | Letras em Sequência | Memória | Memória Operacional | não | ACTIVE |
| 24 | `sequencia-itens` | Sequência de Itens | Memória | Memória Operacional | não | ACTIVE |
| 25 | `padroes-rotacao` | Matriz com Rotações | Memória | Memória Visuoespacial | não | ACTIVE |
| 26 | `lista-distracao` | Lista com Distração | Memória | Memória Operacional | não | ACTIVE |
| 27 | `restaurante-ordem` | Restaurante | Memória | Memória Operacional | **sim** | ACTIVE |
| 28 | `desafio-supermercado` | Supermercado | Memória | Memória Operacional | **sim** | ACTIVE |
| 29 | `nback` | N-Back | Memória | Memória Operacional | não | ACTIVE |
| 30 | `cubo-corsi` | Cubos | Memória | Memória Visuoespacial | não | ACTIVE |
| 31 | `vigilancia` | Vigilância | Atenção | Atenção Sustentada | não | ACTIVE |
| 32 | `identificacao-simbolos` | Identificação de Símbolos | Velocidade de Processamento | Busca Visual Rápida | não | ACTIVE |
| 33 | `estacionamento-logico` | Estacionamento Lógico | Funções Executivas | Planejamento | não | ACTIVE |
| 34 | `investigadores-sociais` | Investigadores da Situação Social | Desenvolvimento Funcional | Cognição Social | não | ACTIVE |

## Modalidades

Somente Restaurante, Supermercado, Caminhos para a Meta, Agentes Focus e Compra Multifuncional têm
seletor de modalidade. Os modos possíveis são: **Visual · Visual + áudio · Somente áudio**.
Nenhum outro exercício recebe seletor sem nova decisão clínica.

Os dois spans são **auditivos por definição, sem seletor**.

## Leitura assistiva ≠ Modalidade

Leitura assistiva é **acessibilidade**: lê o texto visível. Modalidade **altera a forma cognitiva de
apresentação da tarefa**. A distinção vale para toda a arquitetura.

## Legacy IDs — compatibilidade

Legacy IDs existem apenas para compatibilidade com planos e sessões antigos e **nunca aparecem para
terapeuta nem paciente**.

| ID técnico | Nome oficial | Legacy IDs | Status |
|---|---|---|---|
| `informacao-em-foco` | Informação em Foco | `caca-item-barato`, `mudanca-regras` | ACTIVE |
| `compra-multifuncional` | Compra Multifuncional | `desafio-orcamento` | ACTIVE |
| `focus-agents` | Agentes Focus | `focus-agents-auditivo` | ACTIVE |
| `restaurante-ordem` | Restaurante | `restaurante-ordem-auditivo` | ACTIVE |
| `desafio-supermercado` | Supermercado | `desafio-supermercado-auditivo` | ACTIVE |

Desambiguação: **Mudança de Regras** (`mudanca-regras`) foi exercício **descontinuado**, fundido
em Informação em Foco. **Não** é `task-switching`, cujo nome oficial é **Alternância de Regras**.

## Fora do catálogo atual

`desafio-cidade` — **REMOVED_FROM_CURRENT_CATALOG**. Não pertence ao catálogo, à documentação
clínica, nem às análises de carga, duração, prescrição ou categorias. O código permanece intocado:
`types/index.ts` contém a definição e `app/(patient)/treino/[exercicio]/page.tsx` contém o case do
switch. Será reconstruído futuramente como exercício novo.
