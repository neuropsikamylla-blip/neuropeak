# 03 — Proposta de classificação por exercício

> Proposta do VP para discussão. **Nada implementado.** Base: documento 02 (inventário) e leitura
> do código de cada exercício. Durações em minutos.

## As quatro categorias se confirmaram — com um ajuste importante

A hipótese de três modelos **não** cobre o projeto: **15 exercícios pertencem ao modelo D**
(bloco/protocolo), e são justamente os de memória, cuja progressão depende de série fechada. Forçá-los
em "contínuo" quebraria o cálculo de span. A quarta categoria é necessária.

| Modelo | Quantos | O que define |
|---|---|---|
| **A — contínuo** | 12 | rodadas curtas e independentes; pode encerrar entre elas |
| **B — resolução/planejamento** | 10 | um desafio inteiro por vez; interromper no meio perde o trabalho cognitivo |
| **C — fechado/alta fadiga** | 4 | interferência alta por minuto; exposição longa degrada o dado |
| **D — bloco/protocolo** | 15 | a progressão só fecha com a série completa (span, n-back, sequências) |

## Tabela por exercício

| ID | Domínio | Modelo | mín | padrão | máx | Config. do terapeuta | Ao atingir o tempo | Carga basal |
|---|---|---|---|---|---|---|---|---|
| `antes-depois` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 2 |
| `caca-item-barato` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |
| `certo-ou-errado` | Velocidade | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `compra-multifuncional` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 3 |
| `corrida-tempo` | Velocidade | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `cubo-corsi` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `deductive-grid` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 3 |
| `desafio-cidade` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 3 |
| `desafio-orcamento` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 3 |
| `desafio-supermercado` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 3 |
| `desafio-supermercado-auditivo` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 3 |
| `dual-task` | Atenção | C — fechado/alta fadiga | 3 | 4 | 5 | não (fixa) | encerra no tempo fixo | 3 |
| `estacionamento-logico` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 2 |
| `focus-agents` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |
| `focus-agents-auditivo` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |
| `identificacao-simbolos` | Velocidade | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `informacao-em-foco` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |
| `investigadores-sociais` | Funcional | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 3 |
| `jogo-memoria` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 1 |
| `labirinto` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 1 |
| `letras-sequencia` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `lista-distracao` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 3 |
| `matriz-espacial` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `matriz-espacial-inversa` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `mot` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |
| `mudanca-regras` | Executivas | C — fechado/alta fadiga | 3 | 4 | 5 | não (fixa) | encerra no tempo fixo | 3 |
| `nback` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 3 |
| `ordem-historia` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 2 |
| `padroes-rotacao` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `restaurante-ordem` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `restaurante-ordem-auditivo` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 3 |
| `semaforo` | Velocidade | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `sequencia-itens` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `span-numerico` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `span-numerico-inverso` | Memória | D — bloco/protocolo | 5 | 6-7 | 9 | sim (nº de séries) | conclui o bloco/série em curso | 2 |
| `stroop-task` | Executivas | C — fechado/alta fadiga | 3 | 4 | 5 | não (fixa) | encerra no tempo fixo | 3 |
| `task-switching` | Executivas | C — fechado/alta fadiga | 3 | 4 | 5 | não (fixa) | encerra no tempo fixo | 3 |
| `tempo-reacao` | Velocidade | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `torre-hanoi` | Executivas | B — resolução/planejamento | 8 | 10 | 15 | sim (faixa) | não inicia novo desafio; conclui o atual | 2 |
| `trilha-visual` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 1 |
| `vigilancia` | Atenção | A — contínuo | 4 | 5-6 | 8 | sim (faixa) | termina a rodada em curso | 2 |

## Justificativas por modelo

**A — contínuo.** A rodada dura segundos e não depende da anterior. Encerrar entre rodadas não perde
nada. Já é como esses 12 funcionam hoje (`useTimedProgress`). Só falta a duração ser **prescrita**
em vez de fixa em ~7 min.

**B — resolução/planejamento.** Torre de Hanói, Estacionamento, Labirinto, Grade Dedutiva, Ordem da
História, Caminhos, Compra, Investigadores. O paciente analisa, monta estratégia e executa —
interromper no meio destrói justamente o que se quer treinar. Regra: **ao atingir o tempo, não
iniciar novo desafio e deixar concluir o atual**. Métricas mínimas próprias: desafios iniciados ×
concluídos, movimentos, eficiência (movimentos ÷ ótimo), tempo até o primeiro movimento (planejamento)
e tempo de execução, desistências.

**C — fechado/alta fadiga.** Stroop, Task Switching, Dupla Tarefa, Mudança de Regras. Interferência
alta por minuto: passados ~4–5 min o dado piora por fadiga, não por dificuldade. Duração **fixa**,
sem escolha do terapeuta — ele decide incluir ou não.

**D — bloco/protocolo.** Spans (numérico, letras, itens), Corsi, Matriz, N-back, Padrões, Restaurante,
Supermercado, Lista com Distração, Jogo da Memória. A adaptação depende de **série fechada**: subir
o span exige um bloco completo de tentativas naquele comprimento. Configurável em **número de séries**,
não em minutos; a duração vira estimativa ("aprox. 5–7 min").

## Sequenciamento — o que não deve vir junto

- **Nunca dois de modelo C seguidos** (interferência sobre interferência).
- **Nunca dois auditivos seguidos** (`*-auditivo`, span numérico): competem pelo mesmo canal.
- **Evitar dois de modelo B seguidos** numa sessão de 20 min — sozinhos já consomem a sessão.
- **Evitar três exercícios do mesmo domínio em sequência** — a sessão vira treino de um construto só.
- **Depois de um C, preferir um A de carga 1** (velocidade simples) como recuperação.

## Observações clínicas

- `dual-task` e `mudanca-regras` estão em C por carga, mas são também dos poucos que treinam
  alternância — se saírem da sessão por serem "pesados", perde-se o construto. Recomendação: um C
  por sessão, sempre.
- `nback` e `lista-distracao` são D com carga 3: exigem série fechada **e** cansam. Merecem limite de
  séries menor que os demais D.
- Os `*-auditivo` herdam o modelo do irmão visual, com carga +1 quando houver repetição de áudio
  liberada (ver documento 04).
