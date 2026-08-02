# 03 — Proposta de classificação (REFEITA sobre os 34 canônicos)

> ⚠️ **Esta versão substitui a anterior**, que classificava Legacy IDs e modos auditivos como se fossem
> exercícios independentes. Base correta: os **34 canônicos** de
> [`docs/architecture/CANONICAL_EXERCISES.md`](../architecture/CANONICAL_EXERCISES.md).
> Incorpora a **decisão de modalidade de 02/ago** (documento 15 §0). Nada implementado.

## Contagem por modelo

| Modelo | Nº | O que define |
|---|---|---|
| **A — contínuo** | 10 | rodadas curtas independentes; pode encerrar entre elas |
| **B — resolução/planejamento** | 8 | um desafio inteiro por vez; interromper destrói o trabalho |
| **C — fechado/alta fadiga** | 3 | interferência alta por minuto; exposição longa degrada o dado |
| **D — bloco/protocolo** | 13 | a progressão só fecha com a série completa |

A quarta categoria continua necessária: **13 exercícios** dependem de série fechada para
calcular span/progressão.

## Tabela dos 34

| ID | Nome | Domínio | Modelo | mín | padrão | máx | Config. terapeuta | Carga | Modalidade |
|---|---|---|---|---|---|---|---|---|---|
| `antes-depois` | Caminhos para a Meta | Executivas | **B** | 8 | 10 | 15 | janela máxima | 2 | seletor (3 modos) |
| `certo-ou-errado` | Certo ou Errado | Velocidade | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `compra-multifuncional` | Compra Multifuncional | Funcional | **B** | 8 | 10 | 15 | janela máxima | 3 | seletor (3 modos) |
| `corrida-tempo` | Busca Rápida | Velocidade | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `cubo-corsi` | Cubos | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `deductive-grid` | Grade Dedutiva | Executivas | **B** | 8 | 10 | 15 | janela máxima | 3 | visual |
| `desafio-supermercado` | Supermercado | Memória | **D** | 5 | 6 | 9 | nº de séries | 3 | seletor (3 modos) |
| `dual-task` | Dupla Tarefa | Atenção | **C** | 3 | 4 | 5 | **não** (fixa) | 3 | visual |
| `estacionamento-logico` | Estacionamento Lógico | Executivas | **B** | 8 | 10 | 15 | janela máxima | 2 | visual |
| `focus-agents` | Agentes Focus | Atenção | **A** | 4 | 5 | 8 | faixa de minutos | 2 | seletor (3 modos) |
| `identificacao-simbolos` | Identificação de Símbolos | Velocidade | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `informacao-em-foco` | Informação em Foco | Atenção | **A** | 4 | 5 | 8 | faixa de minutos | 2 | visual |
| `investigadores-sociais` | Investigadores da Situação Social | Funcional | **B** | 8 | 10 | 15 | janela máxima | 3 | visual |
| `jogo-memoria` | Jogo da Memória | Memória | **D** | 5 | 6 | 9 | nº de séries | 1 | visual |
| `labirinto` | Labirinto | Executivas | **B** | 8 | 10 | 15 | janela máxima | 1 | visual |
| `letras-sequencia` | Letras em Sequência | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `lista-distracao` | Lista com Distração | Memória | **D** | 5 | 6 | 9 | nº de séries | 3 | visual |
| `matriz-espacial` | Matriz Espacial | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `mot` | Rastreamento de Objetos | Atenção | **A** | 4 | 5 | 8 | faixa de minutos | 2 | visual |
| `nback` | N-Back | Memória | **D** | 5 | 6 | 9 | nº de séries | 3 | visual |
| `ordem-historia` | Ordem da História | Executivas | **B** | 8 | 10 | 15 | janela máxima | 2 | visual |
| `padroes-rotacao` | Matriz com Rotações | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `restaurante-ordem` | Restaurante | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | seletor (3 modos) |
| `semaforo` | Semáforo | Velocidade | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `sequencia-itens` | Sequência de Itens | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | visual |
| `span-numerico` | Span Numérico Auditivo Direto | Memória | **D** | 5 | 6 | 9 | nº de séries | 2 | **auditiva intrínseca** |
| `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória | **D** | 5 | 6 | 9 | nº de séries | 3 | **auditiva intrínseca** |
| `stroop-task` | Cores e Palavras | Executivas | **C** | 3 | 4 | 5 | **não** (fixa) | 3 | visual |
| `task-switching` | Alternância de Regras | Executivas | **C** | 3 | 4 | 5 | **não** (fixa) | 3 | visual |
| `tempo-reacao` | Tempo de Reação | Velocidade | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `torre-hanoi` | Jogo das Torres | Executivas | **B** | 8 | 10 | 15 | janela máxima | 2 | visual |
| `trilha-visual` | Conecta Números | Atenção | **A** | 4 | 5 | 8 | faixa de minutos | 1 | visual |
| `vigilancia` | Vigilância | Atenção | **A** | 4 | 5 | 8 | faixa de minutos | 2 | visual |

## Comportamento ao atingir o tempo

| Modelo | Regra |
|---|---|
| A | termina a rodada em curso |
| B | não inicia novo desafio; conclui o atual |
| C | encerra no tempo fixo |
| D | conclui a série em curso |

## O que mudou em relação à versão anterior

1. **Sete registros técnicos ficaram fora da classificação** — não são exercícios clínicos.
2. A classificação agora considera somente os 34 exercícios ACTIVE da lista canônica.
3. **Coluna de modalidade** passou a refletir a regra fechada: 5 com seletor, 2 auditivos
   intrínsecos (spans), 27 visuais.
4. **Span inverso subiu para carga 3** (era 2): além da retenção auditiva, exige reordenação mental —
   é manipulação, não só armazenamento.

## Sequenciamento — o que não deve vir junto

- **Nunca dois de modelo C seguidos** (dual-task, stroop-task, task-switching).
- **Nunca dois auditivos seguidos**: os dois spans entre si, e qualquer um deles com um dos cinco do
  seletor quando prescrito em `visual+áudio` ou `só áudio`.
- **Evitar dois de modelo B seguidos** numa sessão de 20 min — sozinhos já a consomem.
- **Evitar três do mesmo domínio em sequência.**
- **Depois de um C, preferir um A de carga 1.**

## Observações clínicas

- Os cinco com seletor mudam de carga conforme o modo prescrito (**+1 no só-áudio**) — a carga do
  plano precisa ler o modo, não só o exercício.
- `span-numerico-inverso` e `nback` são os dois D de carga 3: série fechada **e** manipulação ativa.
  Merecem limite de séries menor que os demais D.
- `labirinto` é modelo B de carga 1 — o único planejamento leve; serve de "B de entrada" para
  paciente que ainda não sustenta Torre ou Estacionamento.
