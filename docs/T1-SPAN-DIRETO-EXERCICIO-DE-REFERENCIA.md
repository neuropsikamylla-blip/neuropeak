# T1 — Span Numérico Auditivo Direto como exercício de referência

> **Especificação da Kamylla, 05/ago/2026.** Muda a estratégia da T1: em vez de converter os 34
> exercícios, construir e validar o **padrão definitivo** em **um** exercício. O Span Numérico
> Auditivo Direto passa a ser o exercício de referência — ele representa **exatamente** como o
> tutorial de todos os demais deverá funcionar.
>
> ⛔ **Nada além do Span Direto deve ser convertido**, nem o Span Inverso, até a validação visual e
> funcional dela.

## 1. O que a validação mostrou

A infraestrutura da T1 está funcionando — banco, rota, versões, backfill e gates estão no ar
(v2.76.0). **Mas nenhum exercício foi convertido.** O Span Direto e o Span Inverso continuam usando
apenas a antiga tela de instruções, e **isso não é o tutorial da T1**.

## 2. O fluxo, nas palavras dela

```
PREPARAÇÃO
  · informações essenciais para iniciar
  · apenas explicar a interação
  · NÃO ensinar estratégias cognitivas
        ↓
TUTORIAL
  · demonstração utilizando exatamente a mecânica real
  · tentativa guiada
  · feedback
  · possibilidade de repetir APENAS a tentativa guiada em caso de erro
  · encerramento do tutorial
        ↓
TREINO
  · início da primeira tentativa clínica
```

### Três determinações que acompanham o fluxo

1. **A preparação deixa de ser chamada de tutorial.**
2. **Preparação e tutorial passam a ser duas etapas diferentes** — não é renomear, é separar.
3. **Toda a arquitetura criada para esse exercício deverá ser reutilizada pelos demais.**

## 3. Isolamento clínico — inegociável

O tutorial não pode ter **qualquer influência** sobre:

`Session` · `currentDifficulty` · `totalAttempts` · `lastAttemptAt` · pontuação · **qualquer métrica
clínica**.

> Já protegido em parte: `app/api/exercise-tutorial/route.ts` grava apenas os três campos de
> tutorial, e há testes em `lib/schema-banco-alinhado.test.ts` e `lib/tutorial/contracts.test.ts`
> que travam essa garantia. **O que falta é a mesma garantia no lado do cliente** — a demonstração e
> a tentativa guiada não podem chamar `onComplete`, acumular score nem alimentar a progressão.

## 4. O que já existe (medido em 05/ago/2026, v2.76.0)

| peça | arquivo | estado |
|---|---|---|
| Contrato do tutorial | `lib/tutorial/types.ts` | ✅ já exige `Demonstration`, `GuidedAttempt`, `retryHint` |
| Decisão de exibir | `lib/tutorial/state.ts` (`tutorialRequired`) | ✅ por versão |
| Registro de versões | `lib/tutorial/versions.ts` | ✅ os 34 exercícios, `span-numerico` = 1 |
| Persistência | `app/api/exercise-tutorial/route.ts` | ✅ no ar, grava `PATIENT` |
| Banco | `ExerciseConfig` + enum `TutorialSource` | ✅ 16 registros em `BACKFILL` |
| Tela de preparação | `components/exercises/PreparationScreen.tsx` | ✅ existe |
| Casca do tutorial | `components/exercises/TutorialBase.tsx` | ✅ existe |
| **Tutorial concreto do Span** | — | ❌ **não existe** |
| **Encadeamento preparação → tutorial → treino** | — | ❌ **não existe** |

**Conclusão:** falta o **conteúdo** e a **ligação**, não a fundação.

## 5. Plano em passos — cada um termina com prova e commit

> Fatiado de propósito: nenhum passo deve ocupar uma janela inteira, e bug aparece no passo em que
> nasce.

### Passo 1 — Ler a mecânica real do Span Direto
Levantar como o exercício apresenta os dígitos (áudio de `lib/tts.ts` / `data/tts-manifest.ts`),
como recebe a resposta e onde hoje termina a tela de instruções.
**Pronto quando:** os pontos de entrada estiverem identificados por arquivo e linha.

### Passo 2 — Separar preparação de tutorial
`PreparationScreen` passa a conter só o essencial para interagir, sem estratégia cognitiva e sem se
chamar tutorial.
**Pronto quando:** teste estático garantir que a preparação não usa a palavra "tutorial" nem termos
de estratégia, somando-se ao guarda que já proíbe `dígitos|recorde|carga|fadiga|protocolo`.

### Passo 3 — `Demonstration` do Span Direto
Demonstração com a **mecânica real**: o mesmo áudio, o mesmo teclado, a mesma cadência do treino.
**Pronto quando:** rodar de ponta a ponta sem tocar em score nem em progressão, com teste que prove
o isolamento.

### Passo 4 — `GuidedAttempt` com feedback e repetição
Tentativa guiada; em caso de erro, repete **apenas a tentativa guiada** — nunca a demonstração
inteira.
**Pronto quando:** teste cobrir os dois caminhos (acerto encerra; erro repete só a guiada).

### Passo 5 — Encadeamento e encerramento
`tutorialRequired` decide a exibição; ao encerrar, `POST /api/exercise-tutorial` grava `PATIENT`; o
treino começa na primeira tentativa clínica.
**Pronto quando:** o registro `BACKFILL` daquele par virar `PATIENT` e nenhuma métrica clínica se
mover (comparar antes/depois).

### Passo 6 — Gates, publicação e validação dela
`prisma validate` · `tsc` · suíte · build · deploy · smoke.
**Pronto quando:** ela validar **visual e funcionalmente**. Só então o Span Direto vira o padrão
oficial da T1.

## 6. Depois da aprovação — e não antes

Conversão dos demais **por grupos de interação** (áudio, clique, arrastar, planejamento etc.),
reutilizando o mesmo framework. O Span Inverso é o primeiro candidato natural do grupo "áudio",
**mas não antes da aprovação**.

## 7. O que este documento não autoriza

Converter qualquer exercício além do Span Direto · alterar mecânica de exercício · tocar no banco ·
publicar parcialmente.
