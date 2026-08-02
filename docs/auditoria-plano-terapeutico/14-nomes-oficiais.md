# 14 — Nomes oficiais (auditoria)

> **Nenhum nome foi alterado.** Levantamento das divergências entre id técnico, nome no código e o
> nome que aparece para ela na interface.

## Regra que orientou a análise

**Id técnico ≠ nome exibido, e isso é correto.** Vários ids são históricos (`antes-depois`,
`corrida-tempo`, `caca-item-barato`) e **não devem mudar**: eles são a chave de planos salvos,
sessões e progresso no banco. Renomear id é migração de dados, não ajuste de texto.

O que importa auditar é o **nome exibido**.

| ID técnico | Nome no código | Nome recomendado | Tipo de divergência | Observação | Alterar? |
|---|---|---|---|---|---|
| `antes-depois` | Caminhos para a Meta | Caminhos para a Meta | nome técnico diferente, aceitável | id `antes-depois` mas nome exibido "Caminhos para a Meta". O id é histórico e não deve mudar (quebraria planos e sessões); a divergência é aceitável e já está documentada. | não (id histórico) |
| `certo-ou-errado` | Certo ou Errado | Certo ou Errado | sem divergência | — | não |
| `compra-multifuncional` | Compra Multifuncional | Compra Multifuncional | sem divergência | — | não |
| `corrida-tempo` | Busca Rápida | Busca Rápida | nome técnico diferente, aceitável | id `corrida-tempo` (ex-"Corrida contra o Tempo"), exibido "Busca Rápida". Mesma situação: id histórico preservado de propósito. | não (id histórico) |
| `cubo-corsi` | Cubos | Cubos | nome exibido encurtado | id `cubo-corsi`, ela vê "Cubos" — "Corsi" é nome de teste e não deveria aparecer para o paciente; encurtar está correto. | não (id histórico) |
| `deductive-grid` | Grade Dedutiva | Grade Dedutiva | nome técnico em inglês | id em inglês, exibido "Grade Dedutiva" (pt-BR correto). | não (id histórico) |
| `desafio-supermercado` | Supermercado | Supermercado | nome exibido encurtado | Definição diz "Desafio do Supermercado"; a lista dela diz "Supermercado". Conferir qual aparece no card. | não (id histórico) |
| `dual-task` | Dupla Tarefa | Dupla Tarefa | sem divergência | — | não |
| `estacionamento-logico` | Estacionamento Lógico | Estacionamento Lógico | sem divergência | — | não |
| `focus-agents` | Focus Agentes | Focus Agents | nome exibido divergente | A tela mostra "Focus Agentes"; ela chamou de "Focus Agents". Misto de inglês e português no mesmo nome. Recomendo **"Focus Agentes"** (como está) ou traduzir de vez para "Agentes em Foco" — decisão dela. | decisão dela |
| `identificacao-simbolos` | Identificação de Símbolos | Identificação de Símbolos | sem divergência | — | não |
| `informacao-em-foco` | Informação em Foco | Informação em Foco | sem divergência | — | não |
| `investigadores-sociais` | Investigadores da Situação Social | Investigadores da Situação Social | sem divergência | — | não |
| `jogo-memoria` | Jogo da Memória | Jogo da Memória | sem divergência | — | não |
| `labirinto` | Labirinto | Labirinto | sem divergência | — | não |
| `letras-sequencia` | Letras em Sequência | Letras em Sequência | sem divergência | — | não |
| `lista-distracao` | Lista com Distração | Lista com Distração | sem divergência | — | não |
| `matriz-espacial` | Matriz Espacial | Matriz Espacial | sem divergência | — | não |
| `matriz-espacial-inversa` | Matriz Espacial Inversa | Matriz Espacial Inversa | sem divergência | — | não |
| `mot` | Rastreamento de Objetos | Rastreamento de Objetos | sigla técnica | id `mot` (Multiple Object Tracking), exibido "Rastreamento de Objetos" — correto. | não (id histórico) |
| `nback` | N-Back | N-Back | nome exibido em inglês | Exibido "N-Back" — termo técnico consagrado; aceitável para o terapeuta, discutível para o paciente. | decisão dela |
| `ordem-historia` | Ordem da História | Ordem da História | sem divergência | — | não |
| `padroes-rotacao` | Matriz com Rotações | Matriz com Rotações | sem divergência | — | não |
| `restaurante-ordem` | Restaurante | Restaurante | nome exibido encurtado | Definição longa ("Restaurante — Ordem de Instruções"); ela vê "Restaurante". | não (id histórico) |
| `semaforo` | Semáforo | Semáforo | sem divergência | — | não |
| `sequencia-itens` | Sequência de Itens | Sequência de Itens | sem divergência | — | não |
| `span-numerico` | Span Numérico Auditivo Direto | Span Numérico Auditivo Direto | sem divergência | — | não |
| `span-numerico-inverso` | Span Numérico Auditivo Inverso | Span Numérico Auditivo Inverso | sem divergência | — | não |
| `stroop-task` | Cores e Palavras | Cores e Palavras | nome técnico em inglês | id e nome interno em inglês; exibido "Cores e Palavras" (correto em pt-BR, e a marca Stroop não deve aparecer para o paciente). | não (id histórico) |
| `task-switching` | Task Switching | Task Switching | nome exibido em inglês | Exibido "Task Switching" — único nome do catálogo em inglês na interface do paciente. Sugestão: "Alternância de Tarefas". | decisão dela |
| `tempo-reacao` | Tempo de Reação | Tempo de Reação | sem divergência | — | não |
| `torre-hanoi` | Jogo das Torres | Jogo das Torres | sem divergência | — | não |
| `trilha-visual` | Conecta Números | Conecta Números | sem divergência | — | não |
| `vigilancia` | Vigilância | Vigilância | sem divergência | — | não |

## Divergências que pedem decisão clínica

1. **`focus-agents` — "Focus Agentes"** é meio inglês, meio português. As opções: manter,
   ou traduzir de vez ("Agentes em Foco"). Ela escreveu "Focus Agents" na lista, o que sugere que o
   nome inglês já entrou no vocabulário dela.
2. **`task-switching` — "Task Switching"** é o único nome inteiramente em inglês exibido ao
   paciente. A interface é 100% pt-BR por convenção do projeto. Sugestão: "Alternância de Tarefas".
3. **`nback` — "N-Back"**: termo consagrado na literatura, mas opaco para o paciente. Aceitável se o
   público-alvo da tela for o terapeuta.

## O que NÃO é divergência

- `cubo-corsi` exibido como "Cubos", `stroop-task` como "Cores e Palavras": **correto** — nome de
  teste padronizado (Corsi, Stroop) não deve aparecer para o paciente, porque isto é treino, não
  avaliação, e o nome do teste carrega expectativa de medida.
- `antes-depois` exibido como "Caminhos para a Meta" e `corrida-tempo` como "Busca Rápida": ids
  históricos preservados de propósito.
