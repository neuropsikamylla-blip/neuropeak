# Auditoria — barra de progresso e dosagem de tempo dos exercícios

Data: 2026-09-09 · Autor: VP · Estado: **AUDITORIA. Nada foi alterado.**
Responde ao pedido dela de 09/set, seção 29: *"NÃO saia alterando todos os exercícios
imediatamente. Primeiro: audite..."*

Tudo abaixo foi **medido** no código, não estimado.

---

## 1. A boa notícia: o componente global já existe

`components/exercises/ExerciseProgressBar.tsx` já é *"uma só, igual em todas as telas"* — é o que o
próprio comentário do arquivo diz. **28 exercícios** a renderizam, e **34** usam o relógio comum
`useTimedProgress` (`components/exercises/useExerciseEngine.ts`).

**Não há lógica de barra duplicada por exercício.** O que existe de errado é outra coisa: a
**configuração** está espalhada, faltam conceitos, e há um vazamento entre dois estados que ela
mandou não misturar.

---

## 2. Os cinco defeitos, em ordem de gravidade

### 2.1 🔴 O progresso do BLOCO vaza para o progresso da SESSÃO

Ela foi explícita (item 15): *"Não misturar os dois estados internamente."* **Estão misturados hoje**,
em `ExerciseWrapper.tsx:88-92`:

```
sessionProgress = (sessionCompleted + innerPct / 100) / sessionTotal
```

`innerPct` é o progresso **do bloco** (o tempo do exercício atual) e entra direto na barra **do dia**.
São dois conceitos com um só cálculo. Consertar isso é arquitetura, não cosmética.

### 2.2 🔴 Não existe `maxDuration` em lugar nenhum

Medido: **zero** ocorrências de limite máximo, período de tolerância ou equivalente em todo o
projeto. Só existe **um** alvo por exercício. Portanto **nada do que ela descreve nos itens 4, 6, 7,
12 e 21 existe hoje** — nem o encerramento limpo no teto, nem o status *"interrompido pelo fim do
bloco"*, nem a distinção entre acabar no alvo e acabar na tolerância.

Hoje, ao atingir o alvo, cada exercício decide sozinho o que fazer no seu próprio `isTimeUp()`.

### 2.3 🟠 A barra mostra PORCENTAGEM — em dois lugares

Ela não quer (item 10). Hoje aparece:
- `ExerciseProgressBar.tsx:24` → `{progressPct}%` ao lado da barra, em **28 exercícios**;
- `ExerciseWrapper.tsx:363` → `{sessionProgress}%` no widget do dia.

### 2.4 🟠 Recarregar a página zera a dose

`useTimedProgress` guarda o tempo em `useRef` na memória — **zero** uso de `localStorage` ou
`sessionStorage`. Recarregar devolve a barra a zero e permite **sessão infinita**, que é exatamente
o que ela quer impedir (item 22).

### 2.5 🟡 A dosagem está espalhada em literais, não em configuração

Item 16 dela: *"Quero metadata/configuração"*. Hoje o número mora dentro de cada componente, em
cinco formas diferentes: o padrão do hook, um literal na chamada, uma constante local, ou uma
**função da dificuldade**.

---

## 3. A tabela — 34 exercícios com relógio

Legenda: **barra?** = renderiza `ExerciseProgressBar` · **alvo** = medido no código.

| Exercício | barra? | como calcula hoje | alvo | wrapper global? | migrar? | exceção |
|---|---|---|---|---|---|---|
| AntesDepois (Caminhos p/ Meta) | sim | `useTimedProgress()` | 7 min | sim | sim | — |
| FocusAgents | sim | idem | 7 min | sim | sim | — |
| CacaItemBarato | sim | idem | 7 min | sim | sim | — |
| DualTask | sim | idem | 7 min | sim | sim | — |
| TrilhaVisual | sim | idem | 7 min | sim | sim | — |
| MOT | sim | idem | 7 min | sim | sim | — |
| DesafioOrcamento | sim | idem | 7 min | sim | sim | — |
| Labirinto | sim | idem | 7 min | sim | sim | — |
| TaskSwitching | sim | idem | 7 min | sim | sim | — |
| DesafioCidade | sim | idem | 7 min | sim | sim | — |
| OrdemHistoria | sim | idem | 7 min | sim | sim | — |
| JogoMemoria | sim | idem | 7 min | sim | sim | — |
| MudancaRegras | sim | idem | 7 min | sim | sim | — |
| RestauranteOrdem | sim | idem | 7 min | sim | sim | — |
| DesafioSupermercado | sim | idem | 7 min | sim | sim | — |
| ListaDistracao | sim | idem | 7 min | sim | sim | — |
| LetrasSequencia | sim | idem | 7 min | sim | sim | — |
| CertoOuErrado | sim | idem | 7 min | sim | sim | — |
| PadroesRotacao | sim | idem | 7 min | sim | sim | — |
| MatrizEspacial | sim | idem | 7 min | sim | sim | — |
| SequenciaItens | sim | idem | 7 min | sim | sim | — |
| IdentificacaoSimbolos | sim | idem | 7 min | sim | sim | — |
| CuboCorsi | sim | `TARGET_MS` local | 7 min | sim | sim | constante local |
| **Vigilancia** | **não** | `useTimedProgress(8min)` | **8 min** | sim | sim | 🟡 tem alvo, sem barra |
| **InformacaoEmFoco** | **não** | `useTimedProgress(6min)` | **6 min** | sim | sim | 🟡 tem alvo, sem barra |
| **TempoReacao** | sim | `SESSION_MS` local | **5 min** | sim | sim | ✅ curto, legítimo |
| **Semaforo** | sim | `SESSION_MS` local | **5 min** | sim | sim | ✅ curto, legítimo |
| **StroopTask** | sim | **função da dificuldade** | **4→7 min** | sim | ⚠️ decisão | 🔴 alvo variável |
| **TorreHanoi** | **não** | `useTimedProgress(11min)` | **11 min** | sim | sim | 🟠 pedido dela |
| **EstacionamentoLogico** | **não** | `useTimedProgress(11min)` | **11 min** | sim | sim | 🟠 pedido dela |
| **CompraMultifuncional** | **não** | `useTimedProgress()` | 7 min | sim | sim | 🟡 sem barra |
| **CorridaContraOTempo** | **não** | `useTimedProgress()` | 7 min | sim | sim | 🟡 sem barra |
| **InvestigadoresSociais** | **não** | `useTimedProgress()` | 7 min | sim | sim | 🟡 sem barra |
| **SpanNumerico** | sim | `useTimedProgress()` | 7 min | sim | sim | não usa `isTimeUp` |

### Fora do relógio

| Exercício | situação |
|---|---|
| **DeductiveGrid** (Grade) | 🔴 **não usa relógio nenhum** — hoje é 1 problema e acaba |
| **MatrizEspacialInversa**, **SpanNumericoInverso** | reusam o componente base; herdam o alvo dele |
| **CaminhosMeta** | peça interna do AntesDepois, não é exercício próprio |

### O que a tabela revela

1. **Nenhum exercício usa 8 minutos**, que é o padrão que ela quer. O padrão de fato hoje é **7**.
2. **Seis exercícios têm relógio e não mostram barra** — inconsistência pura, exceto a Torre, onde a
   barra foi **removida por decisão dela** em julho por estar funcionando como placar.
3. **O Stroop é o único caso realmente difícil**: o alvo **cresce com a dificuldade** (4→7 min),
   deliberadamente. Isso não cabe em `{target, max}` fixo por exercício. Ver seção 5.
4. Torre e Estacionamento em 11 min são **pedido dela**, e 11 > 10 do padrão novo. Ver seção 5.

---

## 4. Tutorial e início do relógio (item 17-18)

O relógio **já** começa certo: `begin()` é chamado pelo exercício quando a atividade começa, e o
tutorial roda **antes**, no `ExerciseWrapper` (fase `tutorial` → fase `exercise`). O tempo ativo
**pausa após 15 s sem interação** (`IDLE_MS`), então instrução parada não consome dose.

⚠️ **Exceção conhecida:** na Grade, o tutorial roda **dentro** do componente e **em toda sessão** —
já registrado como pendência, e é a fatia seguinte.

---

## 5. As três exceções, e o que proponho para cada

**Stroop (alvo 4→7 min por dificuldade).** É desenho clínico: a dose cresce com a evolução do
paciente. **Proposta:** a configuração aceita `targetDurationSec` como número **ou** função da
dificuldade. A interface e o comportamento continuam idênticos — muda só de onde vem o número.

**Torre e Estacionamento (11 min).** Acima do teto novo de 10. Foram **pedido explícito dela** para
tarefas de planejamento. **Proposta:** ficam como exceção declarada — `{ target: 660, max: 780 }` —
mantendo a proporção do padrão. ⚠️ **Isto precisa da confirmação dela**: se o teto de 10 minutos for
para valer sem exceção, essas duas caem para 480/600 e a dose de planejamento diminui.

**Vigilância (8 min).** Já é exatamente o alvo novo. Só falta a barra.

---

## 6. A arquitetura proposta

**Nenhum arquivo novo de barra.** `ExerciseProgressBar` já é o componente único; ele **perde a
porcentagem** e ganha o estado "cheia em tolerância".

1. **`lib/exercise-dosage.ts` (novo)** — a configuração num só lugar:
   `{ targetDurationSec: 480, maxDurationSec: 600 }` como padrão da plataforma, mais o mapa de
   exceções por `exerciseId`. Nada de `if (exercise === "X")`.
2. **`useTimedProgress` vira `useBlocoDeTreino`** (ou mantém o nome, ganhando o contrato novo):
   passa a receber o `exerciseId`, ler a dosagem da configuração, e expor
   `progressPct` · `atingiuAlvo()` · `atingiuTeto()` · `podeIniciarNovoDesafio()` · `finish()`.
   `podeIniciarNovoDesafio()` é o que implementa os itens 6, 8 e 20: depois do alvo, **não** começa
   problema novo.
3. **Persistência da dose** por `sessionStorage`, chaveada por exercício e por dia, para recarregar
   não zerar. **Sem mudança de banco** — ver seção 7.
4. **Separação dos dois estados** no `ExerciseWrapper`: o progresso do bloco deixa de alimentar o
   progresso do dia. A barra do dia passa a contar **exercícios concluídos**, só isso.
5. **Registro do bloco** (item 21) no `metadata` do `ExerciseResult` — nenhum campo novo de tabela.

### Posição visual (item 14)

Medido: hoje a barra fica **no topo da área do exercício**, logo abaixo do cabeçalho, na maioria dos
28. **Proposta:** consolidar exatamente aí, e mover os poucos que divergem.

---

## 7. Banco de dados: NÃO precisa mudar

O registro do bloco cabe no `metadata` (Json) de `Session`, que já existe, e a tabela
`ExerciseAttempt` já cobre início/abandono. A dose em andamento é estado efêmero e vive em
`sessionStorage`.

⚠️ **Se durante a implementação aparecer necessidade de coluna nova, eu PARO e te mostro antes**,
com backup — conforme o rito.

---

## 8. Plano de migração em etapas

| etapa | o que entra | risco |
|---|---|---|
| **1** | `lib/exercise-dosage.ts` + a barra perde a porcentagem + separação bloco × sessão no wrapper | baixo — nenhuma mecânica muda |
| **2** | O hook ganha alvo/teto/tolerância e `podeIniciarNovoDesafio`, **sem** exercício consumir ainda | baixo — aditivo |
| **3** | Migrar **3 exercícios-piloto** de perfis diferentes: um curto (Semáforo), um médio (Cubo Corsi), um longo (Torre) | médio — é aqui que a regra encosta na mecânica |
| **4** | ⏸️ **Você usa os três e aprova** antes de seguir | — |
| **5** | Migrar os 31 restantes em lotes por domínio | médio |
| **6** | Grade Dedutiva entra já no padrão novo | — |
| **7** | Os 6 exercícios sem barra passam a mostrá-la (Torre inclusive, agora temporal) | baixo |

⚠️ **A etapa 4 é um portão, não uma formalidade.** É a regra dela: mudança em coisa aprovada exige
verificação visual.

---

## 9. Conflito ativo, que precisa de decisão agora

Há um disparo **em voo** implementando a sessão da Grade com **11 minutos** e **sem** a distinção
alvo/teto — escrito antes deste pedido. Vou colher e revisar, mas **não** aplicar a constante: a
Grade entra direto no padrão novo (etapa 6). O resto do trabalho dele (sequência de problemas,
agregação do registro) continua válido.

---

## 10. O que eu preciso que você decida

1. **Torre e Estacionamento**: ficam em 11 min como exceção declarada, ou caem para o padrão 8/10?
2. **Stroop**: o alvo pode continuar variando com a dificuldade?
3. **A barra na Torre**: ela foi removida por sua decisão em julho por virar placar. A barra nova é
   **temporal** e não reflete solução — pode voltar?
4. **O padrão sobe de 7 para 8 minutos** em 22 exercícios. Confirma?
