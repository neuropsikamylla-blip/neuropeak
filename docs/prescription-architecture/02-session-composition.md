# Composição determinística da sessão terapêutica

## Escopo

Este documento define como avaliar uma sessão já montada pelo terapeuta. Ele não escolhe exercícios,
não ordena alternativas, não atribui pontuação e não descreve sugestão automática. Toda ocorrência
gera apenas informação para decisão humana; nenhuma impede salvar o plano.

As definições globais vêm de `prescription-parameters.json` e das fichas do lote 1. Para diversidade,
usa-se a camada congelada de `mechanicalPrimary` e `associatedCognitiveProfiles`. A duração fixa de
`estimatedMinutes` do sistema atual não participa deste modelo.

Neste documento, uma faixa `[mín., máx.]` inclui os dois extremos. Comparações usam os valores sem
arredondar; a interface pode exibir uma casa decimal.

## Duração da sessão

### Quatro estados operacionais aprovados

**Decisão aprovada em 03/ago/2026:** a duração estimada ou realizada da sessão é informada em um
dos quatro estados nomeados abaixo. São estimativas operacionais, não limites clínicos. Nenhum
estado bloqueia o salvamento, autoriza ou proíbe uma sessão.

| Sessão | `ABAIXO_DO_ESPERADO` | `DENTRO_DO_ESPERADO` | `ATENÇÃO` | `EXCESSO_IMPORTANTE` |
|---:|---:|---:|---:|---:|
| 20 min | `< 18` | **18–22** | `> 22` até 24 | **`> 24`** |
| 30 min | `< 27` | **27–33** | `> 33` até 36 | **`> 36`** |
| 40 min | `< 36` | **36–44** | `> 44` até 48 | **`> 48`** |

Para uma faixa estimada, a interface mostra a faixa e seu estado conservador pelo extremo superior:
abaixo se `tempoRealMax < piso`; dentro se `tempoRealMin ≥ piso` e `tempoRealMax ≤ teto`; atenção
se `tempoRealMax > teto` e `tempoRealMax ≤ máximo`; excesso importante se `tempoRealMax > máximo`.
Quando a faixa cruza uma fronteira, `SESSION_RANGE_PARTIAL` explicita a incerteza sem criar um quinto
estado. Após execução, a duração realizada usa diretamente a tabela acima.

### Como formar a faixa de tempo real estimado

Para cada exercício, a dose prescrita fornece uma faixa de duração antes da margem. Quando a dose tem
uma estimativa pontual, o mesmo valor ocupa os dois extremos. Os impactos de modalidade descritos no
lote 1 são aplicados antes da margem; por exemplo, 10 min com impacto de `+10–20%` vira 11–12 min.

A margem operacional tem dois componentes somados:

> **Decisão clínica validada em 03/ago:** as margens de fechamento por modelo abaixo foram
> aprovadas por ela e permanecem como estão nesta arquitetura.

| Componente | Mínimo | Máximo | Aplicação |
|---|---:|---:|---|
| Transição | 0,5 min | 1 min | Para cada troca entre dois exercícios; com `n` exercícios, há `n - 1` trocas. |
| Fechamento `CONTINUOUS_TIMED` | 0 min | 0,5 min | Para concluir a tentativa ou rodada em andamento. |
| Fechamento `CLOSED_PROTOCOL` | 0 min | 1 min | Para concluir a série, fase ou bloco em andamento. |
| Fechamento `PLANNING_WINDOW` | 0 min | 3 min | Teto de segurança para concluir o desafio já iniciado. |
| Fechamento `FIXED_HIGH_FATIGUE` | 0 min | 0 min | A exposição é fixa e termina no limite definido. |

Para `n` exercícios, com faixas prescritas `[pMinᵢ, pMaxᵢ]` e máximos de fechamento `fMaxᵢ`:

```text
tempoRealMin = Σ pMinᵢ + 0,5 × max(0, n − 1)
tempoRealMax = Σ pMaxᵢ + 1,0 × max(0, n − 1) + Σ fMaxᵢ
```

Assim, o resultado calculado e exibido é sempre uma faixa. A regra não soma uma margem genérica por
fora dessa fórmula e não usa o `~7 min` atual.

### Encerramento de `PLANNING_WINDOW` sem desafio concluído

Os 3 min de `PLANNING_WINDOW` são teto de segurança, não obrigação de manter o paciente até o fim.
Depois do tempo-base não se inicia novo desafio. Se o desafio em curso não terminar na margem, a
execução deve encerrá-lo de forma segura e registrá-lo como **desafio não concluído**. Preserva
tempo, movimentos, tentativas e todas as demais métricas já produzidas; o fato não conta como erro
automático, não recebe penalização automática e não inicia novo desafio.

Esta é política geral da arquitetura. O progresso adaptativo fica **protegido**: nesta etapa é
proibido inventar regra individual que reduza nível, bloqueie subida ou trate desafio não concluído
como erro. Cada exercício de planejamento poderá definir futuramente seus próprios critérios de
impacto na progressão; até lá, somente o encerramento seguro e as métricas preservadas são
registrados.

### Quantos exercícios cabem por modelo

A capacidade exata é sempre recalculada com a dose escolhida. A tabela abaixo é o envelope de
composição com doses `STANDARD`; os números indicam quantos exercícios daquele modelo podem ocupar
uma sessão mista sem ultrapassar o limite específico do próprio modelo. Exercícios de duração longa
podem reduzir o total, e doses `BRIEF` ou `EXTENDED` mudam a conta.

| Modelo de execução | 20 min | 30 min | 40 min | Regra adicional |
|---|---:|---:|---:|---|
| `CONTINUOUS_TIMED` | 2–3 | 4–5 | 5–6 | O cálculo real de tempo decide dentro do intervalo. |
| `CLOSED_PROTOCOL` | 2–3 | 2–4 | 3–5 | Protocolos longos, como Compra Multifuncional, reduzem a quantidade. |
| `PLANNING_WINDOW` | no máximo 1 | no máximo 2 | no máximo 2 | Uma janela padrão de 9–13 min consome perto de metade de uma sessão de 20 min. |
| `FIXED_HIGH_FATIGUE` | no máximo 1 | no máximo 2 | no máximo 2 | O teto de fadiga prevalece mesmo quando ainda houver tempo. |

Essas quantidades não são uma meta e não autorizam preencher espaço automaticamente.

### Alertas de duração

| Estado | Alerta reutilizado | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|---|
| `ABAIXO_DO_ESPERADO` | `SESSION_BELOW_TARGET` | `tempoRealMax < piso`. | “A sessão está estimada em **X–Y min**, abaixo do esperado de **A–B min**.” | atenção |
| `DENTRO_DO_ESPERADO` | nenhum | `tempoRealMin ≥ piso` e `tempoRealMax ≤ teto`. | “A sessão está estimada em **X–Y min**, dentro do esperado de **A–B min**.” | — |
| `ATENÇÃO` | `SESSION_ABOVE_TARGET` | `tempoRealMax > teto` e `tempoRealMax ≤ máximo`. | “A estimativa de **X–Y min** entra em **atenção** acima de **B min**; o máximo operacional é **L min**.” | atenção |
| `EXCESSO_IMPORTANTE` | `SESSION_SAFE_MAX_EXCEEDED` | `tempoRealMax > máximo`. | “O extremo superior estimado é **Y min**, em **excesso importante** acima do máximo operacional de **L min**.” | atenção |

`SESSION_RANGE_PARTIAL` permanece o alerta informativo para uma faixa que intersecta 18–22, 27–33 ou
36–44 mas tem um extremo fora dela: “A estimativa de **X–Y min** alcança o esperado, mas pode
terminar fora de **A–B min**.” Ele pode coexistir com `SESSION_ABOVE_TARGET` ou
`SESSION_SAFE_MAX_EXCEEDED`; não cria código novo nem bloqueia salvamento.

## Regras determinísticas de composição

### 1. Carga basal

Por enquanto, carga da sessão é somente a soma de `baselineCognitiveLoad.value` dos exercícios
prescritos. Modificadores de carga continuam registrados de forma qualitativa, sem conversão em
pontos; a fórmula dinâmica pertence a uma fase posterior.

Os valores 7, 10 e 13 são **referências heurísticas de atenção**, não limites absolutos, nem
autorização ou proibição de uma composição. A soma basal não descreve a sessão: duas sessões com a
mesma carga total podem ter qualidades clínicas muito diferentes. A leitura clínica considera
simultaneamente **carga basal · fadiga · interferência · sequência · modalidade · modelo de execução
· concentração de tarefas semelhantes · planejamento consecutivo**; nenhum desses eixos,
isoladamente, decide se a sessão é adequada. Duas sessões com a mesma soma podem receber alertas
diferentes.

| Duração | Teto de carga basal |
|---:|---:|
| 20 min | 7 |
| 30 min | 10 |
| 40 min | 13 |

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `LOAD_AT_CAP` | Soma basal igual à referência da duração. | “A carga basal somada é **C**, na referência de atenção **T** para esta duração; revise-a junto dos demais eixos da composição.” | informativa |
| `LOAD_OVER_CAP` | Soma basal maior que a referência da duração. | “A carga basal somada é **C**, acima da referência de atenção **T** para esta duração; revise-a junto dos demais eixos da composição.” | atenção |

Esses alertas informam apenas onde a soma se situa em relação à referência; não classificam a
sessão como certa ou errada e não substituem a leitura clínica.

**Mesmo total, leituras diferentes:** Matriz Espacial (1), Conecta Números (1), Agentes Focus (2) e
Cores e Palavras (3) somam carga 7, mas concentram uma exposição de fadiga alta em Cores e Palavras.
Cores e Palavras (3), Alternância de Regras (3) e Certo ou Errado (1) também somam 7, mas os dois
primeiros concentram interferência alta em sequência. O número é igual, mas os perfis e a decisão
clínica não são.

### 2. Fadiga

| Duração | Máximo de exercícios com `fatigue.level = ALTA` |
|---:|---:|
| 20 min | 1 |
| 30 min | 2 |
| 40 min | 2 |

Um exercício de fadiga alta pode ocupar abertura ou meio, respeitando o parâmetro 11. Recomenda-se
evitar que seja o último, mas, se o terapeuta o mantiver, a execução e o salvamento são permitidos
normalmente. Quando houver dois, sugere-se ao menos um exercício de fadiga baixa ou moderada entre
eles; a regra é consultiva, não absoluta.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `HIGH_FATIGUE_COUNT` | Quantidade de fadiga alta maior que o teto da duração. | “Há **Q** exercícios de fadiga alta; o teto desta sessão é **T**.” | atenção |
| `HIGH_FATIGUE_POSITION` | Um exercício de fadiga alta está no último lugar. | “**{exercício}** fecha a sessão apesar de ter fadiga alta.” | atenção |
| `HIGH_FATIGUE_ADJACENT` | Dois exercícios de fadiga alta são consecutivos. | “**{A}** e **{B}** concentram fadiga alta sem uma atividade intermediária.” | atenção |

### 3. Interferência

Dois exercícios com `interference.level = ALTA` nunca devem ficar em sequência.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `HIGH_INTERFERENCE_ADJACENT` | Para algum índice `i`, os exercícios `i` e `i + 1` têm interferência alta. | “**{A}** e **{B}** têm interferência alta e estão em sequência.” | atenção |

Uma ocorrência é emitida por par adjacente, para que a posição exata permaneça auditável.

### 4. Modalidade e canal auditivo

Para esta regra, `isAuditorySequenceExercise` é verdadeiro quando:

- o exercício foi prescrito em `audioOnly`; ou
- o exercício é Span Numérico Auditivo Direto ou Span Numérico Auditivo Inverso, cujo áudio é
  intrínseco mesmo sem seletor.

O modo `visual+audio` entra na distribuição dos dois canais, mas não é tratado como “somente áudio”
nesta regra de adjacência.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `AUDITORY_ONLY_ADJACENT` | Dois valores consecutivos de `isAuditorySequenceExercise` são verdadeiros. | “**{A}** e **{B}** formam uma sequência auditiva sem intervalo de outro canal.” | atenção |

### 5. Diversidade cognitiva

A assinatura cognitiva de cada exercício é o conjunto formado por `mechanicalPrimary` mais todos os
`associatedCognitiveProfiles`. Tags funcionais e domínio de catálogo não entram nesta conta.

Para sessões com pelo menos três exercícios, “concentrado demais” significa que pelo menos uma das
condições é verdadeira:

1. o mesmo `mechanicalPrimary` aparece em pelo menos `ceil(2 × n / 3)` exercícios; ou
2. existe um processo cognitivo presente na assinatura de todos os `n` exercícios, ainda que seja
   principal em alguns e associado em outros.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `COGNITIVE_CONCENTRATION` | Uma das duas condições de concentração é satisfeita. | “A composição está concentrada em **{processo}**: **{evidência observada}**.” | atenção |

O alerta descreve a distribuição; não afirma inadequação para o paciente e não compara exercícios
por qualidade.

### 6. Planejamento

| Duração | Teto de `PLANNING_WINDOW` |
|---:|---:|
| 20 min | 1 |
| 30 min | 2 |
| 40 min | 2 |

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `PLANNING_WINDOW_COUNT` | Quantidade de `PLANNING_WINDOW` maior que o teto da duração. | “Há **Q** janelas de planejamento; o teto desta sessão é **T**.” | atenção |
| `PLANNING_WINDOW_ADJACENT` | Para algum índice `i`, os exercícios `i` e `i + 1` são ambos `PLANNING_WINDOW`. | “**{A}** e **{B}** são janelas de planejamento consecutivas; considere inserir entre elas um `CONTINUOUS_TIMED` ou `CLOSED_PROTOCOL`.” | atenção |

`PLANNING_WINDOW_ADJACENT` é independente de `PLANNING_WINDOW_COUNT`: o primeiro observa cada par
consecutivo, e o segundo observa a quantidade na sessão. Há uma ocorrência por par adjacente, para
que a posição permaneça auditável. Por exemplo, **Jogo das Torres → Estacionamento Lógico → Caminhos
para a Meta** contém os pares consecutivos que este alerta chama a atenção para intercalar. A
sugestão nunca bloqueia o salvamento.

### 7. Posição

O parâmetro 11 fornece `canOpen`, `canClose` e `bestPosition`. A abertura e o fechamento são as
posições exatas 1 e `n`; as demais são meio. `bestPosition` deve ser normalizado na definição global
como zonas preferidas, sem inferência em tempo de execução a partir do texto livre.

- **Podem abrir:** os 34 exercícios atuais têm `canOpen = true`.
- **Podem fechar:** Span Numérico Auditivo Direto; Agentes Focus; Matriz Espacial; Jogo da Memória;
  Conecta Números; Informação em Foco; Tempo de Reação; Certo ou Errado; Semáforo; Ordem da História;
  Letras em Sequência; Sequência de Itens; Restaurante; Identificação de Símbolos; Investigadores da
  Situação Social.
- **Não podem fechar:** Cores e Palavras; Span Numérico Auditivo Inverso; Matriz Espacial Inversa;
  Caminhos para a Meta; Rastreamento de Objetos; Dupla Tarefa; Busca Rápida; Jogo das Torres;
  Labirinto; Compra Multifuncional; Alternância de Regras; Grade Dedutiva; Matriz com Rotações;
  Lista com Distração; Supermercado; N-Back; Cubos; Vigilância; Estacionamento Lógico.
- **Não podem abrir nem fechar:** nenhum exercício no lote 1 atual. Se uma definição futura tiver os
  dois campos falsos, somente posições de meio serão elegíveis.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `OPEN_POSITION_NOT_ELIGIBLE` | Primeiro exercício com `canOpen = false`. | “**{exercício}** está na abertura, posição não elegível em seu parâmetro de sessão.” | atenção |
| `CLOSE_POSITION_NOT_ELIGIBLE` | Último exercício com `canClose = false`. | “**{exercício}** está no fechamento, posição não elegível em seu parâmetro de sessão.” | atenção |
| `OUTSIDE_BEST_POSITION` | A posição não pertence às zonas normalizadas de `bestPosition`, embora seja elegível. | “**{exercício}** pode ocupar esta posição, mas sua posição preferencial é **{posição}**.” | informativa |

Qualificadores como “no fim apenas em BREVE” são preservados na normalização: uma dose diferente de
`BRIEF` dispara `OUTSIDE_BEST_POSITION`, não altera `canClose` e não bloqueia.

### 8. Combinações ruins já declaradas

`sessionEligibility.badCombinations` do lote 1 é uma lista determinística. Nesta arquitetura, o
alerta ocorre se os dois IDs estiverem na mesma sessão, mesmo não adjacentes; a mensagem usa a razão
registrada na definição global.

| Código | Disparo verificável | Mensagem ao terapeuta | Severidade |
|---|---|---|---|
| `DECLARED_BAD_COMBINATION` | Um par da lista está presente na sessão. | “**{A}** e **{B}** têm combinação a observar: **{razão}**” | atenção |

Pares declarados nos dois sentidos geram uma única ocorrência, com os IDs ordenados de forma estável.

## Ordem de avaliação e ausência de bloqueio

O avaliador calcula primeiro tempo, carga, contagens, canais, assinaturas e posições; depois aplica as
regras acima. Alertas são ordenados pela primeira posição envolvida e, em empate, pelo código. Todos
possuem `blocksSave = false`. O terapeuta pode salvar sem remover qualquer ocorrência.

## Exemplos trabalhados

Os exemplos usam os nomes oficiais e valores do lote 1. “Sem alerta” significa que nenhuma regra
acima dispara; não significa recomendação de plano.

### Válida — 20 minutos

| Ordem | Exercício | Modelo | Dose | Duração prescrita | Carga | Fadiga | Interferência |
|---:|---|---|---|---:|---:|---|---|
| 1 | Tempo de Reação | `CONTINUOUS_TIMED` | `STANDARD` | 5 min | 1 | moderada | moderada |
| 2 | Letras em Sequência | `CLOSED_PROTOCOL` | `STANDARD` | 6 min | 2 | moderada | moderada |
| 3 | Certo ou Errado | `CONTINUOUS_TIMED` | `STANDARD` | 7 min | 1 | baixa | baixa |

- Tempo: prescritos 18 min + transições `[1, 2]` + fechamento `[0, 2]` = **19–22 min**.
- Carga basal: **4**, abaixo do teto 7.
- Posição: Tempo de Reação abre, Certo ou Errado fecha e ambos são elegíveis.
- Resultado: **sem alertas**.

### Válida — 30 minutos

| Ordem | Exercício | Modelo | Dose | Duração prescrita | Carga | Fadiga | Interferência |
|---:|---|---|---|---:|---:|---|---|
| 1 | Grade Dedutiva | `PLANNING_WINDOW` | `STANDARD` | 13 min | 2 | alta | moderada |
| 2 | Matriz Espacial | `CLOSED_PROTOCOL` | `STANDARD` | 6 min | 1 | baixa | baixa |
| 3 | Certo ou Errado | `CONTINUOUS_TIMED` | `STANDARD` | 7 min | 1 | baixa | baixa |

- Tempo: prescritos 26 min + transições `[1, 2]` + fechamento `[0, 4,5]` = **27–32,5 min**.
- Carga basal: **4**, abaixo do teto 10; uma fadiga alta e uma janela de planejamento respeitam os
  respectivos tetos.
- Posição: Grade Dedutiva abre e Certo ou Errado fecha; nenhuma combinação ruim declarada aparece.
- Resultado: **sem alertas**.

### Válida — 40 minutos

| Ordem | Exercício | Modelo | Dose | Duração prescrita | Carga | Fadiga | Interferência |
|---:|---|---|---|---:|---:|---|---|
| 1 | N-Back | `FIXED_HIGH_FATIGUE` | `STANDARD` | 7,5 min | 3 | alta | alta |
| 2 | Semáforo | `CONTINUOUS_TIMED` | `STANDARD` | 6 min | 2 | moderada | moderada |
| 3 | Ordem da História | `PLANNING_WINDOW` | `STANDARD` | 9 min | 2 | moderada | moderada |
| 4 | Identificação de Símbolos | `CONTINUOUS_TIMED` | `STANDARD` | 5 min | 1 | moderada | moderada |
| 5 | Certo ou Errado | `CONTINUOUS_TIMED` | `STANDARD` | 7 min | 1 | baixa | baixa |

- Tempo: prescritos 34,5 min + transições `[2, 4]` + fechamento `[0, 4,5]` = **36,5–43 min**.
- Carga basal: **9**, abaixo do teto 13; N-Back não fecha e não é seguido por outra interferência
  alta.
- A sessão tem cinco `mechanicalPrimary` distintos e nenhuma assinatura comum aos cinco.
- Resultado: **sem alertas**.

### Com alertas — 20 minutos, concentração de carga, fadiga e interferência

| Ordem | Exercício | Modelo | Dose | Duração prescrita | Carga | Fadiga | Interferência |
|---:|---|---|---|---:|---:|---|---|
| 1 | Cores e Palavras | `CONTINUOUS_TIMED` | `STANDARD` | 5 min | 3 | alta | alta |
| 2 | Alternância de Regras | `CLOSED_PROTOCOL` | `STANDARD` | 7 min | 3 | alta | alta |
| 3 | N-Back | `FIXED_HIGH_FATIGUE` | `STANDARD` | 7,5 min | 3 | alta | alta |

Tempo real estimado: **20,5–23 min**. Alertas:

- `SESSION_RANGE_PARTIAL` — o extremo superior passa dos 22 min, embora a faixa ainda intersecte o
  alvo; informativa.
- `LOAD_OVER_CAP` — carga 9 para teto 7; atenção.
- `HIGH_FATIGUE_COUNT` — três exercícios de fadiga alta para teto 1; atenção.
- `HIGH_FATIGUE_ADJACENT` — há dois pares consecutivos de fadiga alta; atenção por par.
- `HIGH_FATIGUE_POSITION` — N-Back, de fadiga alta, fecha; atenção.
- `HIGH_INTERFERENCE_ADJACENT` — os dois pares consecutivos têm interferência alta; atenção por par.
- `COGNITIVE_CONCENTRATION` — Monitoramento Executivo e Manutenção de Meta está na assinatura dos
  três; atenção.
- `CLOSE_POSITION_NOT_ELIGIBLE` — N-Back tem `canClose = false`; atenção.
- `OUTSIDE_BEST_POSITION` — Alternância de Regras e N-Back estão fora da posição preferencial de
  início; informativa.
- `DECLARED_BAD_COMBINATION` — Cores e Palavras + Alternância de Regras acumulam troca e inibição;
  atenção.

Apesar do conjunto de alertas, o salvamento permanece disponível.

### Com alertas — 30 minutos, sequência auditiva e combinação declarada

| Ordem | Exercício | Modalidade | Dose | Duração após modalidade | Carga | Fadiga | Interferência |
|---:|---|---|---|---:|---:|---|---|
| 1 | Span Numérico Auditivo Direto | áudio intrínseco | `STANDARD` | 6 min | 2 | moderada | baixa |
| 2 | Restaurante | `audioOnly` | `STANDARD` | 11–12 min | 2 | moderada | moderada |
| 3 | Supermercado | `audioOnly` | `STANDARD` | 13,2–14,4 min | 2 | alta | alta |

Tempo real estimado: **31,2–37,4 min**. Alertas:

- `SESSION_RANGE_PARTIAL` — a faixa alcança 27–33 min, mas seu extremo superior passa do alvo;
  informativa.
- `SESSION_SAFE_MAX_EXCEEDED` — 37,4 min passa do limite 36 min; atenção.
- `AUDITORY_ONLY_ADJACENT` — Span Numérico Auditivo Direto + Restaurante e Restaurante +
  Supermercado formam dois pares auditivos; atenção por par.
- `HIGH_FATIGUE_POSITION` — Supermercado, de fadiga alta, fecha; atenção.
- `COGNITIVE_CONCENTRATION` — Armazenamento de Curto Prazo está nas três assinaturas, e Memória
  Operacional Verbal é o `mechanicalPrimary` de dois dos três; atenção.
- `CLOSE_POSITION_NOT_ELIGIBLE` — Supermercado tem `canClose = false`; atenção.
- `OUTSIDE_BEST_POSITION` — Supermercado está fora de sua posição preferencial; informativa.
- `DECLARED_BAD_COMBINATION` — Restaurante + Supermercado compartilham listas funcionais com risco
  de interferência de fonte; atenção.

Nenhum alerta seleciona uma substituição ou altera a ordem automaticamente.
