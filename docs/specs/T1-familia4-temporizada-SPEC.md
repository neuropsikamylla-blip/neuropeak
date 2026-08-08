# SPEC — Família 4: estímulo contínuo → responder no momento certo

> Desbloqueada pela **regra global 11** (três modos), decidida por ela em 07/ago/2026.
> Regras: `docs/T1-REGRAS-GLOBAIS.md` (as onze). Histórico: `docs/T1-INCOMPATIBILIDADES.md`.

## 0. Inegociável

⛔ **NÃO** alterar mecânica clínica, progressão, dificuldade, pontuação ou métricas.
⛔ **NÃO** melhorar os exercícios. **NÃO** gravar tutorial fora do caminho único (regra 10).
⛔ **NÃO** criar segundo Runner/Pointer (regra 7). **NÃO** usar emoji.
⛔ **NÃO** liberar estímulo visual por tempo decorrido (regra 3).
⛔ **NÃO** alterar o roteiro das Famílias 1, 2 e 3 — a suíte delas é a prova.

## 1. Os três modos no framework

`TutorialDefinition` ganha:

```ts
/**
 * Regra 11 — como este tutorial ensina.
 *  "completa"    (padrão) o sistema executa a atividade toda antes da guiada
 *  "continua"    demonstra QUANDO agir e QUANDO NÃO agir, em tarefas temporizadas
 *  "explicativo" sem demonstração animada; explica a regra e vai para a guiada
 */
modo?: "completa" | "continua" | "explicativo";

/** Modo "explicativo": a regra da atividade, em uma ou duas frases claras. */
explicacao?: string;
```

**Padrão `"completa"`** — as três famílias aprovadas não declaram nada e não mudam.

### 1.1 `TutorialRunner`

- **modo `"completa"`**: fluxo atual, intocado.
- **modo `"continua"`**: mesma estrutura; a diferença vive na `Demonstration` da definição.
- **modo `"explicativo"`**: a fase `"demo"` **não monta** `Demonstration`. No lugar, exibe a
  `explicacao` no mesmo cartão, com o selo `DEMONSTRAÇÃO`, e um botão que leva ao `handoff`.
  ⚠️ O selo, o título, as transições e o restante do visual **não mudam**.

⛔ **A tentativa guiada é obrigatória nos três modos.** Nenhum caminho pode pular `handoff` →
`guided` → `feedback`.

## 2. Demonstração contínua (modo 2)

Para tarefas temporizadas, o roteiro é **intercalado**, e não presente-tudo-depois-responde:

```
para cada estímulo:
  apresenta o estímulo
  se É alvo    → cursor desloca, mira, pressiona, solta, e a marca de acerto aparece
  se NÃO é alvo→ o cursor permanece visível e PARADO, com um rótulo curto de espera deliberada
  pausa entre estímulos
```

- A demonstração precisa mostrar **ao menos um alvo e um não-alvo** — sem isso não se ensina a
  inibição. Não se limita a `smallestValidUnit`.
- O rótulo de espera é **texto curto e discreto** (ex.: "agora não"), no padrão visual já aprovado.
  ⛔ Sem emoji, sem elemento novo além do rótulo.
- Reusar `DemoPointer` e as constantes de ritmo já calibradas — **não** criar tempos novos além do
  necessário para a espera deliberada.

## 3. A tentativa guiada NÃO tem relógio

Decisão registrada (regra 6: *"o tutorial ensina, não mede"*): no tutorial, a guiada **aceita a
resposta quando ela vier**. O paciente não pode errar por lentidão enquanto aprende.

⚠️ Isso vale **só no tutorial**. A mecânica clínica do treino **não muda**.

## 4. Os sete exercícios — modo por exercício

O critério é **pedagógico**: animar só onde animar ensina.

| exercício | modo | por quê |
|---|---|---|
| `semaforo` | **contínua** | go/no-go clássico: o *quando* é a tarefa |
| `vigilancia` | **contínua** | responder ao alvo entre não-alvos |
| `tempo-reacao` | **contínua** | reagir ao sinal, inibir antes dele |
| `nback` | **explicativo** | a regra ("igual ao de N atrás") se enuncia melhor do que se anima |
| `dual-task` | **explicativo** | duas tarefas simultâneas; animar confunde mais que esclarece |
| `mot` | **contínua** | rastrear alvos entre distratores exige ver o movimento |
| `certo-ou-errado` | **explicativo** | julgar se a operação está certa — a regra é verbal |

> Se ao implementar algum se mostrar melhor noutro modo, **registre a troca e a razão** no commit.

## 5. Textos (regras 1, 4 e 5)

| exercício | `guidedInstruction` |
|---|---|
| `semaforo` | Clique em avançar somente quando o sinal abrir. |
| `vigilancia` | Clique quando a pipa alvo aparecer. |
| `tempo-reacao` | Clique assim que o sinal aparecer. |
| `nback` | Clique quando o item for igual ao de duas posições atrás. |
| `dual-task` | Responda às duas tarefas conforme elas aparecerem. |
| `mot` | Clique nos alvos que você seguiu. |
| `certo-ou-errado` | Clique em certo ou errado conforme a operação. |

Para o modo explicativo, a `explicacao` enuncia a **regra da atividade** em uma ou duas frases, no
padrão de linguagem da regra 1 — imperativo, sem estratégia cognitiva.

## 6. Registro

Acrescentar os sete a `TUTORIAIS_POR_EXERCICIO` (**19 no total**) e ao teste que trava o conteúdo.

## 7. Testes obrigatórios

1. `modo` é opcional e o padrão é `"completa"` — as definições das Famílias 1 a 3 não declaram.
2. Modo `"explicativo"` **não monta** `Demonstration` e **exibe** `explicacao`.
3. Modo `"explicativo"` **ainda passa** por `handoff` → `guided` → `feedback` — a guiada é obrigatória.
4. Modo `"continua"` demonstra **alvo e não-alvo** — a demonstração inclui ao menos um de cada.
5. O rótulo de espera existe e não contém emoji.
6. Nenhuma constante de ritmo nova fora da fábrica.
7. `guidedInstruction` de cada um usa o verbo real e não menciona teclado nem toque.
8. O registro cobre os 19 convertidos.
9. `gravacao-unica.test.ts` verde; regra 3 travada.
10. **Todos os testes das Famílias 1, 2 e 3 continuam verdes.**
11. Suíte inteira verde — **648/648 é o piso**.

## 8. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` ·
`lint` sem warning novo.

## 9. Se algo não couber

Registre em `docs/T1-INCOMPATIBILIDADES.md`, explique e **pare**.
