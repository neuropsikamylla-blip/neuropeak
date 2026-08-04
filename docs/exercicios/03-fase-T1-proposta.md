# Fase T1 — proposta detalhada

> Decisões dela de 04/ago/2026 incorporadas. **Nada implementado.** Nenhum schema, migration, rota,
> componente ou exercício foi tocado.
>
> Complementa `02-tutorial-framework-decisoes.md`, que segue válido.

## 1. Schema exato proposto

```prisma
model ExerciseConfig {
  id                String    @id @default(cuid())
  patientId         String
  patient           Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  exerciseId        String
  currentDifficulty Int       @default(1)
  totalAttempts     Int       @default(0)
  lastAttemptAt     DateTime?

  // ── Tutorial (Fase T1) ──────────────────────────────────────────────────────
  /// Quando o paciente concluiu o tutorial deste exercício. `null` = nunca concluiu.
  tutorialCompletedAt DateTime?
  /// Versão do tutorial concluída. Comparada com TUTORIAL_VERSIONS[exerciseId].
  tutorialVersion     Int?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([patientId, exerciseId])
}
```

**Só isso.** Dois campos opcionais, nenhuma coluna alterada, nenhum índice novo, nenhuma tabela nova.

⚠️ `updatedAt` é `@updatedAt` — gravar o tutorial **mexe nesse carimbo**. Não é dado clínico, mas
convém saber: `updatedAt` deixa de significar "última mudança de progressão".

## 2. Migration e backfill

### 2.1 Migration

O projeto usa `prisma db push` (`package.json`), não migrations versionadas. Campos opcionais são
aditivos — nenhuma linha existente quebra.

⚠️ **Após o `db push`, reaplicar as três CHECK de `Session`** (score 0-100, accuracy 0-1,
difficulty 1-10), que foram criadas por SQL direto e **não estão no schema**
(`RUNBOOK-OPERACIONAL.md`).

### 2.2 Backfill — regra aprovada por ela

> Quem já executou o exercício de verdade **não** revê o tutorial.

```sql
UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion"     = 1
WHERE "totalAttempts" > 0
  AND "tutorialCompletedAt" IS NULL;
```

**Decisões embutidas, para ela conferir:**

- **critério:** `totalAttempts > 0` — evidência de execução real;
- **data gravada:** `lastAttemptAt` (a data real do treino) e não `now()`, para o registro não mentir
  sobre quando aconteceu. `createAt` como reserva;
- **versão gravada: `1`** — ver o alerta abaixo;
- **`WHERE ... IS NULL`** torna o script **idempotente**: rodar duas vezes não muda nada.

**Não toca:** `totalAttempts` · `currentDifficulty` · `lastAttemptAt` · `Session` · `TrainingPlan` ·
nada além das duas colunas novas.

### 2.3 ⚠️ O problema dos exercícios já reformulados

Três exercícios **mudaram de mecânica recentemente**: **Vigilância** (era CPT de letras → virou 8
pipas com resposta por região), **Agentes Focus** (reformulado, modo único) e **Informação em Foco**
(unificou dois exercícios antigos).

Um paciente com `totalAttempts > 0` nesses três **executou uma mecânica que não existe mais**. O
backfill acima o marcaria como "já viu o tutorial" — e ele nunca veria a explicação da mecânica
atual.

**Recomendação:** esses três nascem em `TUTORIAL_VERSION = 2`, e o backfill grava `1`. Assim eles
**veem o tutorial novo uma vez**, e os demais 31 não. É uma linha de exceção no backfill, e resolve
o caso pelo mecanismo de versão que ela já aprovou — sem regra especial nova.

**Isso é decisão dela** e está na lista final.

## 3. Contrato TypeScript do framework

```ts
// lib/tutorial/types.ts

/** Resultado da micro-unidade guiada. Deliberadamente sem score, tempo ou acurácia:
 *  o tutorial não produz dado clínico. */
export type GuidedOutcome = "correct" | "incorrect";

export interface GuidedAttemptProps {
  /** Chamado quando o paciente conclui a micro-unidade. */
  onOutcome: (outcome: GuidedOutcome) => void;
}

export interface TutorialDefinition {
  exerciseId: string;
  /** Versão exigida. Só sobe por mudança de mecânica, regra de resposta ou interação. */
  version: number;
  /** Demonstração executada pelo sistema, com os componentes reais do exercício. */
  Demonstration: React.ComponentType<{ onDone: () => void }>;
  /** Micro-unidade guiada. Recebe onOutcome; NÃO recebe onComplete. */
  GuidedAttempt: React.ComponentType<GuidedAttemptProps>;
  /** Orientação curta exibida ao errar, antes de repetir só a micro-unidade. */
  retryHint: string;
}
```

⚠️ **A garantia estrutural está no que o contrato NÃO tem:** nenhum componente de tutorial recebe
`onComplete`, e `GuidedOutcome` não carrega score, tempo nem acurácia. **Não há como emitir resultado
clínico a partir daqui** — não por disciplina, por tipo.

```ts
// lib/tutorial/state.ts — lógica pura, testável sem DOM

export interface TutorialState {
  completedAt: Date | null;
  completedVersion: number | null;
}

/** Única função que decide se o tutorial é obrigatório. */
export function tutorialRequired(state: TutorialState, requiredVersion: number): boolean {
  if (state.completedAt === null) return true;
  return (state.completedVersion ?? 0) < requiredVersion;
}
```

## 4. Formato da versão

```ts
// lib/tutorial/versions.ts
export const TUTORIAL_VERSIONS: Readonly<Record<string, number>> = {
  "trilha-visual": 1,
  "span-numerico": 1,
  // ...
  "vigilancia": 2,        // mecânica reescrita — ver 2.3
  "focus-agents": 2,      // reformulado
  "informacao-em-foco": 2 // unificação
};
```

**Inteiro, explícito, no código, um por exercício.** Regras que ela fixou:

- **não** sobe por deploy;
- **não** sobe por mudança visual ou textual;
- sobe **só** por mudança de mecânica, de regra de resposta ou de forma de interação;
- a constante fica junto do catálogo do tutorial, versionada em git — então **toda subida aparece no
  diff** e é revisável.

## 5. Contrato da micro-unidade guiada

Para `CONTINUOUS_TIMED`, "sua vez" **não** executa o protocolo. Conforme ela definiu:

| Exercício | Micro-unidade |
|---|---|
| Vigilância | sequência curta contendo um alvo |
| Informação em Foco | uma questão completa |
| Tempo de Reação | poucos estímulos |
| Rastreamento de Objetos | uma rodada curta |
| Cores e Palavras | pequeno bloco de respostas |

**Deve confirmar:** qual estímulo observar · qual resposta emitir · quando responder · quando **não**
responder, se aplicável.

**Não pode:** usar a duração clínica do protocolo · consumir dose · alterar nível · contar como
tentativa · registrar precisão ou tempo de reação · entrar no histórico · afetar progressão.

**Ao errar:** `retryHint` curto e repete **só** a micro-unidade. Não reinicia a demonstração.

Isso é garantido porque `GuidedAttempt` **não recebe** `difficulty` nem `onComplete`, e **não usa**
`useTimedProgress` — não tem acesso ao que mexeria em progressão.

## 6. Fluxo completo — Conecta Números (piloto visual)

**Primeira vez** (`tutorialCompletedAt === null`):

```
Preparação:  "Conecta Números"  ·  [Começar]  ·  [Como funciona]
   ↓ (Começar → tutorial obrigatório, porque nunca concluiu)
Demonstração: grade de 4 células; o sistema toca 1→2→3→4 sozinho.
              Componente TrilhaCell — o MESMO do jogo.
   ↓
Sua vez:      mesma grade de 4 células, o paciente toca em ordem.
   ↓ acertou → "Você entendeu como funciona."  [Começar treino]
   ↓ errou   → "Toque em ordem crescente, do menor para o maior." → repete SÓ esta etapa
   ↓
POST /api/exercise-tutorial  { exerciseId: "trilha-visual", version: 1 }
   ↓
TREINO REAL
```

**Vezes seguintes:** Preparação → **[Começar] entra direto no treino.** "Como funciona" reabre o
tutorial **sem gravar nada**.

**Por que este piloto é barato:** `TrilhaCell` já é compartilhado entre tutorial e jogo
(`TrilhaVisual.tsx:84`, *"COMPARTILHADA: jogo e tutorial — réplica exata"*), e o tutorial já tem
**uma etapa**. A conversão testa o **fluxo**, não a mecânica.

## 7. Fluxo completo — Span Numérico Auditivo Direto (piloto auditivo)

Hoje **não tem tutorial**. Mas **já tem uma tela de preparação** — `ReadyScreen`
(`SpanNumerico.tsx:423`), com nome, regra, nível e "Começar →". É o embrião do que ela quer
padronizar.

**Primeira vez:**

```
Preparação:  "Span Numérico Auditivo Direto"
             "Ouça os números e toque na MESMA ordem."
             Nível atual  ·  [Começar]  ·  [Como funciona]
   ↓
Demonstração: o sistema toca 2 dígitos em áudio e mostra o teclado sendo
              acionado na ordem ouvida. Sem texto longo.
   ↓
Sua vez:      2 dígitos (abaixo do nível clínico do paciente).
              Se allowReplay estiver ativo, o botão de repetir aparece —
              porque faz parte da mecânica real.
   ↓ acertou → [Começar treino]
   ↓ errou   → "Toque os números na mesma ordem em que você ouviu." → repete SÓ esta etapa
```

**O que este piloto força o framework a resolver:**

1. **estímulo sem apoio visual** — a demonstração não pode exibir os dígitos escritos, ou destrói o
   construto auditivo;
2. **áudio na demonstração** — `lib/tts.ts` com áudio pré-gerado e fallback Web Speech;
3. **"sua vez" abaixo do nível clínico** — 2 dígitos, independente do nível real;
4. **`allowReplay`** — parâmetro assistivo que muda o que o paciente pode fazer no tutorial.

⚠️ **Ponto a decidir:** a `ReadyScreen` atual mostra *"nível 5 (5 dígitos)"*. Mas ela decidiu em
16/jul **remover "N dígitos" do jogo**, porque *"antecipa o tamanho da sequência"*. A tela de
preparação padronizada mantém os dígitos, mostra só o nível, ou nenhum dos dois?

## 8. Arquivos previstos na Fase T1

| Arquivo | Ação |
|---|---|
| `prisma/schema.prisma` | **alterar** — dois campos |
| `app/api/patients/[id]/route.ts` | **alterar** — incluir os campos no `select` de `?config=true` |
| `app/api/exercise-tutorial/route.ts` | **criar** — rota mínima de escrita |
| `lib/tutorial/types.ts` | **criar** — contrato |
| `lib/tutorial/state.ts` | **criar** — `tutorialRequired`, lógica pura |
| `lib/tutorial/versions.ts` | **criar** — catálogo de versões |
| `components/exercises/PreparationScreen.tsx` | **criar** — tela de preparação |
| `lib/tutorial/*.test.ts` | **criar** — testes |
| `docs/scripts/backfill-tutorial.sql` | **criar** — o script da seção 2.2, versionado |

⚠️ **Nenhum exercício é convertido na T1.** `PreparationScreen` é criada mas **ainda não usada** —
entra em uso na T2, com os pilotos.

## 9. Testes obrigatórios da Fase T1

**Puros** (`lib/tutorial/`, sem jsdom, como o resto da suíte):

1. `tutorialRequired` com `completedAt === null` → **true**;
2. concluído na versão atual → **false**;
3. `completedVersion` menor que a exigida → **true**;
4. `completedVersion` null mas `completedAt` preenchido → **true** (dado inconsistente é conservador);
5. versão exigida menor que a concluída (rollback) → **false** — não força tutorial à toa;
6. `TUTORIAL_VERSIONS` cobre os 34 ids canônicos, e nenhum id fora deles;
7. toda versão é inteiro ≥ 1.

**De contrato** (estáticos, no estilo do `save-button-guard`):

8. nenhum componente de tutorial recebe `onComplete` — varredura no fonte;
9. `lib/tutorial/` **não** importa `useTimedProgress` nem `useExerciseProgress`;
10. a rota `exercise-tutorial` **não** menciona `session`, `currentDifficulty`, `lastAttemptAt`,
    `totalAttempts`, `achievement` nem `alert`.

**De rota:**

11. escrita atualiza só `tutorialCompletedAt` e `tutorialVersion`;
12. paciente só grava o **próprio** estado (ownership);
13. exercício desconhecido é rejeitado sem criar linha;
14. gravar duas vezes é idempotente.

**Do backfill:**

15. o SQL marca quem tem `totalAttempts > 0` e **não** marca quem tem 0;
16. rodar duas vezes não altera nada;
17. nenhuma outra coluna muda — comparação antes/depois.

## 10. Riscos que dependem da decisão dela

1. **Os três exercícios reformulados** (seção 2.3) — nascem em versão 2 e o backfill grava 1, ou
   todos entram como versão 1?
2. **A tela de preparação mostra o quê** (seção 7) — nível? dígitos? nada? A decisão de 16/jul
   proibiu "N dígitos" no jogo, e a preparação é outro contexto.
3. **`updatedAt` de `ExerciseConfig`** passa a mudar por tutorial. Aceitável?
4. **Quem nunca executou mas tem config criada** (`totalAttempts === 0`, criado por edição de plano
   pelo terapeuta) verá o tutorial. Correto?

## 11. Outras decisões clínicas pendentes — do documento anterior, não repetidas no resumo

Estas apareceram em `02-tutorial-framework-decisoes.md` e **continuam abertas**:

1. **Os 15 exercícios sem tutorial** — criar para todos é decisão de escopo. Alguns podem não
   precisar, e a senhora aprovou "não criar os 15 de uma vez", mas não se todos entram.
2. **Vigilância e Informação em Foco** — a senhora determinou auditoria individual antes de converter.
   Falta definir **quando** essa auditoria acontece: dentro da T3, ou como etapa própria?
3. **Mensagem de redução adaptativa** — a frase aprovada *"hoje esta atividade exigiu mais esforço"*
   vale quando o nível **cai de fato**, ou só quando a sessão foi mais difícil sem queda? São
   situações clínicas diferentes.
4. **Cenário funcional e estratégias** — a senhora aprovou que migrem para "Como funciona". Falta
   definir se aparecem **junto** com a demonstração ou em aba separada dentro dela.
5. **Redefinição pelo terapeuta** — arquitetura preparada (basta zerar `tutorialCompletedAt`), mas
   falta decidir **onde** essa ação viveria na área do terapeuta, quando for implementada.

## 12. O que esta proposta NÃO faz

Não implementa nada · não altera schema, banco, rota, componente ou exercício · não publica · não
inicia T2, T3 ou T4.
