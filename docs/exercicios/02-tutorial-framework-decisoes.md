# Framework de tutorial e entrada no exercício — decisões e análise técnica

> **APROVADO por ela em 04/ago/2026.** Decisões consolidadas + a análise técnica exigida antes do
> código.
>
> **Nada implementado.** Nenhum código, banco, migration, API ou interface foi tocado.
> Documento **novo**: `01-tutorial-e-entrada-analise.md` e os documentos de prescrição seguem
> intactos.

## Parte I — Decisões dela

**Memória do tutorial no banco**, por paciente e por exercício. `localStorage` só como apoio técnico,
**nunca** fonte de verdade — o paciente troca de aparelho, treina parte em casa e parte na clínica, e
o terapeuta precisa de estado consistente.

**Primeira utilização:** tutorial automático e **obrigatório** antes do treino real. Ao concluir,
volta à preparação ou oferece "Começar treino".

⚠️ **O tutorial não pode:** contar como tentativa clínica · alterar nível · alterar progressão ·
registrar pontuação · interferir nas métricas · ser contabilizado na dose prescrita.

**Utilizações seguintes:** tela de preparação com **nome do exercício · nível atual (quando
aplicável) · [Começar] · [Como funciona]**. O tutorial **nunca** reaparece sozinho depois de
concluído, salvo redefinição pelo terapeuta (futura), mudança incompatível de mecânica ou nova versão
do tutorial.

**Fluxo único para os 34:** `Demonstração → Sua vez → Validação → Conclusão`. Demonstração com os
**mesmos componentes e regras visuais do exercício**, texto mínimo. "Sua vez" é uma tentativa guiada
simples, que **não representa o nível clínico**. Ao errar: orientação curta, **repete só a tentativa
guiada** — não reinicia o tutorial, não registra desempenho, não reduz nível.

**Padrão de etapas:** uma demonstração contínua, uma tentativa guiada, uma conclusão. Decisões
distintas da mecânica ocorrem **dentro** da mesma demonstração. **Não** reduzir mecanicamente tudo a
"um slide", e **não** manter etapas repetidas só por herança histórica.

**Tela textual atual** deixa de ser etapa obrigatória. O conteúdo migra para "Como funciona".

**Resultado — comunicação sem punição:**

| Situação | Mensagem |
|---|---|
| Subiu de nível | "Você avançou para o nível X." |
| Manteve | "Treino concluído. Você manteve seu nível." |
| Exigiu mais / redução adaptativa | "Treino concluído. Hoje esta atividade exigiu mais esforço." |

⚠️ **Proibido:** "você piorou" · "você regrediu" · "seu desempenho caiu" como mensagem principal ·
qualquer incentivo a competir com sessões anteriores. A informação técnica completa permanece para o
terapeuta.

**Tela de preparação:** só o necessário. **Não** mostrar excesso de métricas, recorde como elemento
principal, carga, fadiga ou protocolo clínico.

**Framework primeiro, exercícios depois.** Cada exercício fornece apenas sua lógica específica.
**Nenhum exercício volta a inventar seu próprio fluxo.**

## Parte II — Análise técnica: as 13 respostas

### 1. Onde e como armazenar

Em **`ExerciseConfig`**, estendida. Ela **já tem exatamente a granularidade pedida**:

```prisma
model ExerciseConfig {
  patientId         String
  exerciseId        String
  currentDifficulty Int  @default(1)
  totalAttempts     Int  @default(0)
  lastAttemptAt     DateTime?
  @@unique([patientId, exerciseId])   // ← paciente × exercício
}
```

Campos a acrescentar:

```prisma
  tutorialCompletedAt DateTime?   // null = nunca concluiu
  tutorialVersion     Int?        // versão do tutorial concluído
```

### 2. Já existe entidade adequada?

**Sim — `ExerciseConfig`, e não é coincidência.** É a única tabela chaveada por
`[patientId, exerciseId]`, é onde já vivem `currentDifficulty`, `totalAttempts` e `lastAttemptAt`, e
o registro **já nasce sozinho** no `upsert` de `POST /api/sessions`. Criar entidade nova duplicaria
essa chave sem ganho.

**Cascade já resolvido:** `patient Patient @relation(onDelete: Cascade)` — apagar o paciente apaga o
estado do tutorial, sem trabalho extra.

### 3. Migration é necessária?

**Sim**, mas do tipo mais barato: **dois campos opcionais**. Nenhuma coluna existente muda, nenhum
dado é convertido, nenhum índice novo.

⚠️ **Toda linha existente terá `tutorialCompletedAt = null`** — ou seja, **todo paciente atual verá o
tutorial uma vez** na próxima entrada de cada exercício. Isso é o comportamento correto (é o que
acontece hoje, em todas as sessões), mas **é decisão dela** se prefere considerar quem já tem
`totalAttempts > 0` como "já viu".

⚠️ O projeto usa `prisma db push`, e as três CHECK de `Session` **não estão no schema** — precisam ser
reaplicadas depois (`RUNBOOK-OPERACIONAL.md`). Vale para esta mudança também.

### 4. APIs que leem e gravam

**Leitura — nenhuma rota nova.** O paciente **já** chama
`GET /api/patients/[id]?config=true` (`treino/[exercicio]/page.tsx:410`) e recebe `exerciseConfigs`.
Basta incluir os dois campos no `select`.

**Escrita — uma rota nova, mínima.** Recomendo **`POST /api/exercise-tutorial`**, que só faz o
`upsert` de `tutorialCompletedAt` e `tutorialVersion`.

**Por que não usar `/api/sessions`:** aquela rota é o caminho quente — grava `Session`, calcula
progressão, faz `upsert` de `ExerciseConfig`, concede achievements e dispara alertas. Passar o
tutorial por ali exigiria um desvio dentro do código que **mexe em progressão**, e é justamente o que
ela proibiu. **Uma rota separada torna a proibição estrutural, não uma promessa.**

### 5. Versionar o tutorial

`tutorialVersion Int?` no banco, contra uma constante por exercício no código
(ex.: `TUTORIAL_VERSION = 1`). O tutorial reaparece quando
`tutorialCompletedAt == null` **ou** `tutorialVersion < TUTORIAL_VERSION` do exercício.

Assim, quando ela reformular a mecânica de um exercício, basta incrementar a constante — e só os
pacientes daquele exercício reveem. Prepara também a **redefinição pelo terapeuta** (item 3 dela):
seria zerar `tutorialCompletedAt`. **Não implementar agora**, mas o campo já permite.

### 6. Garantir que o tutorial não altera progressão nem métricas

Três garantias, em camadas:

1. **Estrutural:** o tutorial nunca chama `POST /api/sessions`. A rota nova não toca
   `currentDifficulty`, `totalAttempts` nem `lastAttemptAt`.
2. **De contrato:** o componente de tutorial **não recebe** `onComplete` — não tem como emitir
   resultado clínico.
3. **De teste:** teste provando que concluir o tutorial não altera `currentDifficulty`,
   `totalAttempts` nem `lastAttemptAt`, e que nenhuma `Session` é criada.

⚠️ **Atenção a `lastAttemptAt`:** a tela de treino usa esse campo para **bloquear o exercício no
mesmo dia** (`blockedToday`, linha ~460). Se o tutorial o tocasse, o paciente ficaria impedido de
treinar depois de ver o tutorial. **A rota separada evita isso por construção.**

### 7. Componentes reutilizáveis

| Componente | Aproveitamento |
|---|---|
| `TutorialBase.tsx` (176 linhas) | **Base do framework** — já tem `steps`, `onDone`, indicadores, e exige acerto para avançar |
| `ExerciseWrapper.tsx` | fases e temas; a fase `instructions` vira "Como funciona" |
| Componentes compartilhados jogo↔tutorial | o padrão a **generalizar** (ex.: `TrilhaVisual.tsx:84`) |
| `useExerciseProgress` / `useTimedProgress` | **não** usar no tutorial — é o que garante o item 6 |

### 8. Tutoriais que **não** são réplica real

**Cinco exercícios têm tutorial próprio, fora do contrato** — cada um inventou seu fluxo, exatamente
o que ela quer impedir:

| Exercício | Como está |
|---|---|
| **Agentes Focus** | `function Tutorial` própria, grade com alvo destacado |
| **Informação em Foco** | `function Tutorial` própria, ensina estratégia PARE→LEIA→PROCURE |
| **Vigilância** | `stage === "tutorial"` próprio, mostra o alvo 1× |
| **Cores e Palavras** | fluxo próprio |
| **Padrões com Rotação** | fluxo próprio |

⚠️ **Vigilância e Informação em Foco são os mais delicados:** ela os redesenhou recentemente, e o
tutorial deles **carrega decisão clínica** — o da Vigilância mostra o alvo uma única vez *"e não se
repete no jogo"*, porque o exercício exige **perceber sozinho** qual destoa. Converter sem entender
isso destruiria o construto.

**Não afirmo que os 22 do `TutorialBase` são réplicas fiéis** — verifiquei o compartilhamento de
componentes em amostra, não nos 22. A auditoria fiel exige ver cada um rodando, e é trabalho da
Fase T3.

### 9. Quantas etapas cada um tem

| Situação | Nº | Quem |
|---|---:|---|
| **Sem tutorial nenhum** | **15** | Spans (Direto e Inverso) · Restaurante · Ordem da História · Estacionamento · Letras em Sequência · Lista com Distração · Matriz Inversa · Caminhos para a Meta · e outros |
| Tutorial próprio (fora do contrato) | 5 | os da tabela acima |
| `TutorialBase` com **1 etapa** | 10 | Conecta Números · MOT · Busca Rápida · Identificação de Símbolos · Investigadores · Compra Multifuncional · Grade Dedutiva · e outros |
| `TutorialBase` com **2 etapas** | 9 | Dupla Tarefa · Matriz Espacial · N-Back · Cubos · Jogo da Memória · Tempo de Reação · Certo ou Errado · Semáforo · Alternância de Regras |
| `TutorialBase` com **3 etapas** | 1 | Supermercado |

⚠️ **O achado maior aqui não é a contagem de etapas — é que 15 exercícios não têm tutorial nenhum.**
O framework não é só padronização: para quase metade do catálogo, é **criar** o que não existe. Isso
muda o tamanho da Fase T3 e precisa entrar no planejamento dela.

### 10. Os dois pilotos recomendados

**Piloto 1 — Conecta Números** (simples e visual).
Já tem **1 etapa**, já **compartilha o componente de célula** entre tutorial e jogo, e o comentário
no código documenta a correção de "2 etapas quase iguais". É o caso mais próximo do alvo: valida o
framework sem lutar contra a mecânica.

**Piloto 2 — Span Numérico Auditivo Direto** (auditivo e sem tutorial).
Escolhido justamente por **não ter tutorial nenhum** e ser **auditivo**: obriga o framework a
resolver o caso mais difícil — como demonstrar um estímulo que não é visual, e como fazer "sua vez"
com áudio. Se funcionar aqui, funciona nos 15 sem tutorial.

> Alternativa a considerar: **Vigilância** como piloto 2, por ter tutorial próprio com decisão
> clínica embutida. É mais arriscado, e por isso eu **não** recomendo para piloto — melhor na T3,
> com o framework já provado.

### 11. Arquivos da Fase T1

| Arquivo | Mudança |
|---|---|
| `prisma/schema.prisma` | dois campos em `ExerciseConfig` |
| `app/api/patients/[id]/route.ts` | incluir os campos no `select` de `?config=true` |
| `app/api/exercise-tutorial/route.ts` | **criar** — rota mínima de escrita |
| `lib/tutorial/` | **criar** — contrato do framework e versões por exercício |
| `components/exercises/PreparationScreen.tsx` | **criar** — tela de preparação |
| testes | contrato, versionamento, não-interferência |

**Nenhum exercício é convertido na T1.**

### 12. Testes necessários

1. concluir o tutorial **não** altera `currentDifficulty`, `totalAttempts` nem `lastAttemptAt`;
2. concluir o tutorial **não** cria `Session`;
3. `tutorialCompletedAt = null` → tutorial obrigatório;
4. concluído na versão atual → vai direto ao treino;
5. `tutorialVersion` menor que a do código → tutorial reaparece;
6. o estado é **por paciente e por exercício** — um não vaza para o outro;
7. paciente só lê e escreve o **próprio** estado (ownership);
8. plano e progressão existentes seguem intactos;
9. a tela de preparação **não** expõe carga, fadiga nem protocolo;
10. "Como funciona" reabre sem marcar nada nem alterar estado.

### 13. Decisões clínicas que ainda dependem dela

1. **Pacientes atuais:** quem já tem `totalAttempts > 0` deve ser considerado "já viu", ou todos veem
   o tutorial uma vez após a migration?
2. **Nível na tela de preparação:** mostrar o número cru ("Nível 7") ou linguagem qualitativa? Ela
   proibiu excesso de métricas, e o número é métrica.
3. **Os 15 sem tutorial:** criar tutorial para todos é decisão de escopo — alguns podem não precisar.
4. **Vigilância e Informação em Foco:** o tutorial deles carrega decisão clínica. Converter exige
   validação dela, exercício por exercício.
5. **"Sua vez" nos exercícios por tempo:** um exercício `CONTINUOUS_TIMED` não tem "uma tentativa"
   natural. Qual é a unidade guiada nesses casos?
6. **Mensagem de redução adaptativa:** a frase aprovada ("hoje esta atividade exigiu mais esforço")
   vale também quando o nível **cai de fato**, ou só quando a sessão foi mais difícil?

## Parte III — Fases

| Fase | Conteúdo | Estado |
|---|---|---|
| **T1** | modelagem do estado · contrato global · tela de preparação · **nenhuma conversão** | aguardando decisões |
| **T2** | framework + **2 pilotos** (Conecta Números e Span Direto) | — |
| **T3** | converter os demais em lotes · auditar os de 2–3 etapas · **criar os 15 que não têm** | — |
| **T4** | tela de resultado e comunicação de evolução | — |

**Nenhuma fase iniciada.**
