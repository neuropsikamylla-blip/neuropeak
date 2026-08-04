# Decisões de dose e classificação de parâmetros

> **APROVADO por ela em 04/ago/2026.** Este documento é a fonte da regra de dose. Substitui como
> autoridade a recomendação da análise [`07-parameter-dose-analysis.md`](07-parameter-dose-analysis.md),
> que fica como diagnóstico de origem.
>
> **Nada implementado.** Nenhum código, banco, migration, interface ou exercício foi alterado.

## 1. Regra central da dose

Em **novos planos**, o terapeuta escolhe **apenas o protocolo**: **Breve · Padrão · Estendido**.

Ele **não escolhe** número de tentativas, séries, rodadas ou blocos. Cada protocolo define
internamente a quantidade de unidades, conforme o catálogo de prescrição de cada exercício.

**A duração exibida deve sempre corresponder ao protocolo escolhido.**

**Não existe dose personalizada para novos planos nesta etapa.**

Isso preserva: previsibilidade de duração · coerência da sessão · consistência entre interface e
motor · validade mínima da progressão · simplicidade para o terapeuta.

> Nota de escopo: a recomendação original do documento 07 previa uma opção "personalizado: N
> unidades". Ela foi **rejeitada** para esta etapa. A dose personalizada existe apenas como leitura
> de planos antigos (seção 4).

## 2. Indicação clínica dos protocolos

Textos **orientativos**, não diagnósticos, que não substituem o julgamento do terapeuta.

### Breve

Indicado para: primeiro contato com o exercício · baixa tolerância à fadiga · introdução gradual ·
sessões curtas · composição com maior número de exercícios · pacientes com dificuldade de
permanência · retorno após interrupção prolongada.

**Aviso — texto exato aprovado por ela em 04/ago/2026:**

> "Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente,
> para atualizar o nível adaptativo."

**Origem da regra:** o aviso sai do campo `clinicalValidity` do protocolo BRIEF no catálogo de
prescrição — **nunca** de uma regra genérica derivada da quantidade de unidades. Hoje os **34**
exercícios declaram lá a insuficiência para progressão, então o aviso aparece em todos os Breves.
Se um exercício deixar de declarar, o aviso some para ele.

⚠️ **A interface não pode exibir "insuficiente para progressão" cru.** O terapeuta leria como se o
Breve fosse inadequado ou como se o treino se perdesse. O texto acima deixa explícito que:

- o Breve **continua sendo opção válida de treino**;
- é indicado para introdução, menor tolerância, retorno após pausa ou maior variedade na sessão;
- a limitação é **apenas** sobre a robustez da decisão adaptativa **naquela execução**;
- **não** é erro, contraindicação nem perda do treino realizado.

### Padrão

Indicado para: uso habitual · maioria das prescrições · dose suficiente para adaptação · equilíbrio
entre intensidade, duração e variedade · acompanhamento regular.

**É a opção selecionada por padrão em novos planos.**

### Estendido

Indicado para: treino focal de um domínio · paciente já familiarizado com o exercício · boa
tolerância à tarefa · sessão mais longa · menor quantidade de exercícios na sessão · necessidade
clínica de maior repetição ou consolidação.

**Aviso:** pode aumentar fadiga · deve ser considerado junto à composição total da sessão · **não
significa automaticamente maior eficácia**.

## 3. Spans — fim da inconsistência

O painel atual oferece **10/15/20/30 tentativas**; a arquitetura define **4/8/12 séries**. Nenhum
valor coincide.

Em novos planos valem **exclusivamente os valores do catálogo**. O terapeuta vê Breve · Padrão ·
Estendido e **não vê nem altera o número de tentativas**.

A quantidade interna pode aparecer em "Ver detalhes": *Breve — 4 séries · Padrão — 8 séries ·
Estendido — 12 séries*.

### Unidade exibida — sempre a do catálogo

A quantidade usa a **unidade real registrada em `minimumValidUnit`**, nunca uma palavra genérica.
**Não inventar nem renomear unidades nesta etapa.**

| Exercício | Unidade do catálogo |
|---|---|
| Spans | séries |
| Restaurante | rodadas |
| Informação em Foco | tentativas |
| Supermercado | rodadas |
| Jogo das Torres | desafios completos |

> Defeito corrigido em 04/ago: o `protocolLabel` exibia **"blocos" para os 34** — "8 blocos" no Span
> (que são séries) e "2 blocos" no Jogo das Torres (que são desafios completos). Nasceu de um exemplo
> da spec da Fase 2b que virou valor fixo.

**Esses valores não mudam nesta etapa sem nova validação clínica.**

## 4. Planos antigos — `LEGACY_CUSTOM_DOSE`

Planos salvos com 10, 15, 20 ou 30 tentativas: **não migrar, não arredondar, não substituir.**
Preservar exatamente o valor salvo, classificado internamente como **`LEGACY_CUSTOM_DOSE`**.

Comportamento obrigatório:

- o plano antigo continua abrindo;
- continua executando com a quantidade original;
- a duração é estimada conforme a dose legada **quando houver regra segura**;
- não apagar o valor;
- **não converter silenciosamente** para Breve, Padrão ou Estendido;
- não alterar progressão nem histórico.

Ao editar um exercício legado, aviso discreto:

> "Este exercício utiliza uma configuração anterior de dose."

Com duas ações: **Manter configuração atual** · **Converter para Breve, Padrão ou Estendido**.
A conversão é **explícita e nunca automática**.

Sem fórmula segura para a dose legada, exibir:

> "Duração aproximada — configuração anterior."

**Não inventar precisão.**

## 5. Nível inicial

O nível inicial **não é dose**. Mas deixa de ser controle livre em toda edição do plano.

**Paciente sem histórico no exercício:** permitir definir o nível inicial, com **recomendação
automática** preferencial; o terapeuta pode ajustar manualmente quando necessário.

**Paciente com histórico:** mostrar o nível atual alcançado · informar que haverá **retomada
automática** · **não** mostrar o slider rotineiro · **não** sobrescrever progresso ao salvar.

Para alterar o nível de quem tem histórico: ação separada **"Redefinir nível"**, que mostra nível
atual e novo, explica o impacto, exige confirmação, preserva o histórico anterior e **nunca rebaixa
silenciosamente**.

**Limitação registrada:** o nível pode alterar a dificuldade e o tempo por unidade, mas **não
modifica a duração estimada** enquanto não houver dados empíricos suficientes para uma fórmula
confiável. O efeito indireto nos 17 `CLOSED_PROTOCOL` é inferência de mecânica, **não medição**.

## 6. Repetição de áudio — `ASSISTIVE_PARAMETER`

`allowReplay` **não é dose**. A repetição:

- não altera a quantidade prescrita;
- não altera automaticamente a duração estimada;
- não altera automaticamente a carga basal;
- **deve ser registrada**;
- pode alterar a **comparabilidade** e a demanda de memória.

Distinguir três coisas que hoje se confundem:

| Natureza | O que é | Efeito clínico |
|---|---|---|
| Áudio intrínseco da tarefa | O estímulo **é** auditivo (spans) | Define o construto |
| Leitura assistiva de instrução | Acessibilidade sobre o comando | Neutro para o construto |
| Repetição de conteúdo a memorizar | Reapresenta o que deveria ser retido | **Altera o construto** |

**Não criar fórmula de carga para repetição nesta etapa.** Manter o parâmetro separado e registrar
seu uso.

## 7. Caminhos para a Meta

Permanece **`PROVISIONAL_PROFILE`** e será reformulado.

`atividadesSelecionadas` **deixa de ser quantidade livre de dose**. Na arquitetura futura:

- o **protocolo** define quantas unidades serão apresentadas;
- o terapeuta escolhe **quais categorias ou tipos** de atividade são elegíveis;
- escolher categorias **não altera o número total de unidades** do protocolo;
- o motor seleciona as unidades dentro das categorias permitidas.

Conceitualmente: Breve = poucas unidades · Padrão = quantidade habitual · Estendido = maior número.
**Os valores exatos serão reavaliados após a reformulação. Não implementar agora.**

## 8. Ordem da História — `VARIANT_ELIGIBILITY`

`unlockIntruso` e `unlockFalta` **não controlam a duração total**. Passam a ser
**`VARIANT_ELIGIBILITY`**:

- definem **quais tipos de desafio podem aparecer**;
- **não aumentam** o número total de unidades;
- o protocolo continua definindo a quantidade da sessão;
- quando ativados, os desafios entram na **amostragem** das unidades prescritas.

Ou seja: **Breve/Padrão/Estendido controlam a dose; Intruso e Falta controlam a variedade.**

### Alteração de mecânica necessária (documentada, não implementada)

A mecânica atual **não permite** essa separação. Hoje a trilha é sequencial e por desempenho:
ordenar → Intruso → Descubra, liberando com ≥80% de acerto, e os `unlock*` são atalhos que **somam**
etapas. Para virar elegibilidade, seria preciso:

1. o exercício receber do plano um **número de unidades** (do protocolo) em vez de percorrer a trilha
   inteira;
2. o sorteio de cada unidade respeitar um **conjunto de tipos elegíveis** (ordenar sempre; Intruso e
   Falta só se marcados);
3. a liberação por desempenho (≥80%) continuar existindo como **progressão entre sessões**, sem
   acrescentar unidades **dentro** da sessão.

Isso é mudança de runtime do exercício, não de prescrição — precisa de decisão e etapa próprias.

## 9. Outros parâmetros administrativos

`feedback`, `autoAdvance` e demais preferências de apresentação ou fluxo são
**`ADMINISTRATIVE_PARAMETERS`**. Não alteram dose prescrita, duração estimada, carga basal nem
fadiga no cálculo atual.

**Limitação registrada:** `feedback: intenso` provavelmente consome mais tempo por unidade que
`leve`, por exibir animação/retorno mais longo. O efeito **não foi medido** e **nenhuma fórmula será
inventada** — fica como limitação declarada.

## 10. Modelo conceitual — cinco categorias

Um parâmetro pertence a **uma só** categoria, salvo justificativa explícita.

| Categoria | Parâmetros |
|---|---|
| **`DOSE_PARAMETERS`** | `protocol` · `legacyCustomDose` (só compatibilidade) |
| **`DIFFICULTY_PARAMETERS`** | `startLevel` (só primeira prescrição ou redefinição explícita) · nível adaptativo atual · parâmetros internos de dificuldade |
| **`ASSISTIVE_PARAMETERS`** | `allowReplay` · leitura assistiva · outras ajudas |
| **`VARIANT_PARAMETERS`** | categorias elegíveis · tipos de desafio · **modalidade** (5 exercícios) |
| **`ADMINISTRATIVE_PARAMETERS`** | `feedback` · `autoAdvance` · preferências de fluxo |

> Ponto de atenção: **modalidade** foi classificada como `VARIANT_PARAMETER` por decisão dela, mas
> tem efeito **numérico real** sobre a duração — `doseMinutes` já aplica `durationMultiplier` por
> modalidade (`duration.ts:27`). É a única variante que move número hoje. Não é contradição, mas
> precisa ficar explícito: variante **pode** ter efeito temporal quando o catálogo o define.

## 11. Interface futura do ajuste

O botão "Ajustar" mostra **prioritariamente o protocolo** — Breve · Padrão · Estendido — e, para
cada opção: indicação clínica resumida · quantidade interna de unidades · duração estimada ·
observação sobre validade adaptativa quando necessária.

Depois, **só o que for realmente aplicável**:

- modalidade (5 exercícios);
- repetição de áudio (quando aplicável);
- variantes clínicas (quando aplicável);
- nível inicial **só se não houver histórico**;
- nível atual e retomada automática **quando houver histórico**.

**Removidos da prescrição nova:** tentativas livres · séries livres · slider de nível
indiscriminado.

## 12. Carga e fadiga nesta etapa

- o **protocolo** altera duração e quantidade de unidades;
- a **carga basal** continua sendo propriedade da mecânica padrão;
- a **fadiga** continua sendo a classificação basal definida;
- **não** recalcular numericamente carga e fadiga por protocolo ainda.

Exibir como **modificador qualitativo**: o Estendido aumenta exposição e pode aumentar fadiga; o
Breve reduz exposição. **Sem falsa precisão** — nada de mudar carga 2 para 3 automaticamente sem
modelo aprovado.

## 13. Tabela dos 34 exercícios

Gerada de `prescription-parameters.json`; a classificação aplica as decisões acima.

| Exercício | Breve | Padrão | Estendido | Unidade interna | Dose antiga (hoje) | Permanece visível | Sai da prescrição nova | Dose legada? |
|---|---:|---:|---:|---|---|---|---|---|
| Agentes Focus | 4 | 8 | 12 | rodada | `startLevel` 1–5 · `feedback` · `autoAdvance` | Protocolo · modalidade · nível só sem histórico · feedback e avanço (administrativos) | `startLevel` indiscriminado | Não |
| Alternância de Regras | 2 | 4 | 6 | bloco | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Busca Rápida | 2 | 5 | 8 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Caminhos para a Meta | 1 | 2 | 3 | desafio completo | `atividadesSelecionadas` (lista livre) | Protocolo · modalidade · categorias elegíveis | seleção livre como dose | Sim — após reformulação |
| Certo ou Errado | 3 | 7 | 12 | tentativa | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Compra Multifuncional | 2 | 7 | 10 | fase | nível 1–10 | Protocolo · modalidade · nível só sem histórico | slider de nível indiscriminado | Não |
| Conecta Números | 1 | 3 | 5 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Cores e Palavras | 12 | 30 | 48 | tentativa | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Cubos | 3 | 6 | 9 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Dupla Tarefa | 1 | 1 | 1 | bloco | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Estacionamento Lógico | 1 | 2 | 3 | desafio completo | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Grade Dedutiva | 1 | 2 | 3 | desafio completo | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Identificação de Símbolos | 8 | 20 | 32 | tentativa | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Informação em Foco | 2 | 5 | 8 | tentativa | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Investigadores da Situação Social | 1 | 2 | 3 | desafio completo | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Jogo da Memória | 1 | 2 | 3 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Jogo das Torres | 1 | 2 | 3 | desafio completo | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Labirinto | 1 | 3 | 4 | desafio completo | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Letras em Sequência | 4 | 8 | 12 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Lista com Distração | 3 | 6 | 8 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Matriz Espacial | 4 | 8 | 12 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Matriz Espacial Inversa | 4 | 8 | 10 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Matriz com Rotações | 3 | 6 | 9 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| N-Back | 1 | 3 | 4 | bloco | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Ordem da História | 1 | 2 | 3 | desafio completo | `unlockIntruso` · `unlockFalta` · nível 1–10 | Protocolo · variantes (Intruso/Falta) · nível só sem histórico | slider de nível indiscriminado | Não — variantes viram elegibilidade |
| Rastreamento de Objetos | 4 | 8 | 12 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Restaurante | 2 | 5 | 8 | rodada | nível 1–10 | Protocolo · modalidade · nível só sem histórico | slider de nível indiscriminado | Não |
| Semáforo | 8 | 24 | 36 | tentativa | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Sequência de Itens | 4 | 8 | 12 | série | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Span Numérico Auditivo Direto | 4 | 8 | 12 | série | `trials` 10/15/20/30 · `allowReplay` | Protocolo · `allowReplay` (assistivo) | `trials` (lista livre) | **Sim** — dose legada possível |
| Span Numérico Auditivo Inverso | 4 | 8 | 12 | série | `trials` 10/15/20/30 · `allowReplay` | Protocolo · `allowReplay` (assistivo) | `trials` (lista livre) | **Sim** — dose legada possível |
| Supermercado | 2 | 5 | 7 | rodada | nível 1–10 | Protocolo · modalidade · nível só sem histórico | slider de nível indiscriminado | Não |
| Tempo de Reação | 6 | 18 | 30 | rodada | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |
| Vigilância | 1 | 2 | 3 | bloco | nível 1–10 | Protocolo · nível só sem histórico | slider de nível indiscriminado | Não |

## 14. Limitações declaradas

1. Efeito do nível sobre o tempo por unidade nos 17 `CLOSED_PROTOCOL`: **não medido**.
2. Efeito de `feedback: intenso` sobre a duração: **não medido**.
3. Efeito de `allowReplay` sobre a duração e sobre a comparabilidade entre sessões: **reconhecido,
   não quantificado**.
4. Fórmula de duração para dose legada (`trials` 10/15/20/30): **não existe**. Enquanto não existir,
   vale o texto "Duração aproximada — configuração anterior".
5. Caminhos para a Meta e Ordem da História dependem de **reformulação de runtime** antes que suas
   regras finais valham.
