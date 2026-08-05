# T1 — planejamento da conversão dos 34 tutoriais

> Planejamento pedido por ela em 05/ago/2026. **Nada implementado.**
> Aguarda aprovação do cronograma antes de qualquer código.

## 0. Ponto de partida — o que já existe

⚠️ **A fundação da T1 já está pronta e commitada** (`4999292`), mas **não aplicada ao banco**:

| Peça | Estado |
|---|---|
| `tutorialCompletedAt`, `tutorialVersion`, `tutorialSource` (enum) | no `schema.prisma`, **não no banco** |
| `POST /api/exercise-tutorial` | pronta |
| `lib/tutorial/` — contrato, estado, versões | pronto |
| `PreparationScreen` | criada, **não usada** |
| `backfill-tutorial.sql` | documentado, **não executado** |
| **Backup do banco** | ⛔ **não feito** — Supabase Free, sem backup automático |

⛔ **Nada disso funciona até o banco receber os três campos.** E o banco não se toca sem backup
validado (`docs/operacao/backup-procedimento.md`).

⚠️ **Pendência da Fase 1:** os ajustes finais aprovados estão implementados mas **não publicados** —
produção roda 2.74.0. Fechar antes de começar a T1.

## 1. Os 34 exercícios

| # | Exercício | Modelo | Modalidade | Tutorial hoje |
|---:|---|---|:---:|---|
| 1 | Span Numérico Auditivo Direto | CLOSED_PROTOCOL | — | **nenhum** |
| 2 | Span Numérico Auditivo Inverso | CLOSED_PROTOCOL | — | **nenhum** |
| 3 | Matriz Espacial | CLOSED_PROTOCOL | — | Base (2 et) |
| 4 | Matriz Espacial Inversa | CLOSED_PROTOCOL | — | **nenhum** |
| 5 | Jogo da Memória | CLOSED_PROTOCOL | — | Base (2 et) |
| 6 | Conecta Números | CLOSED_PROTOCOL | — | Base (1 et) |
| 7 | Busca Rápida | CLOSED_PROTOCOL | — | Base (1 et) |
| 8 | Compra Multifuncional | CLOSED_PROTOCOL | **sim** | Base (1 et) |
| 9 | Alternância de Regras | CLOSED_PROTOCOL | — | Base (2 et) |
| 10 | Letras em Sequência | CLOSED_PROTOCOL | — | **nenhum** |
| 11 | Sequência de Itens | CLOSED_PROTOCOL | — | **nenhum** |
| 12 | Padrões com Rotação | CLOSED_PROTOCOL | — | **próprio** |
| 13 | Lista com Distração | CLOSED_PROTOCOL | — | **nenhum** |
| 14 | Restaurante | CLOSED_PROTOCOL | **sim** | **nenhum** |
| 15 | Supermercado | CLOSED_PROTOCOL | **sim** | Base (3 et) |
| 16 | Cubos | CLOSED_PROTOCOL | — | Base (2 et) |
| 17 | Investigadores da Situação Social | CLOSED_PROTOCOL | — | Base (1 et) |
| 18 | Cores e Palavras | CONTINUOUS_TIMED | — | **próprio** |
| 19 | Agentes Focus | CONTINUOUS_TIMED | **sim** | **próprio** |
| 20 | Informação em Foco | CONTINUOUS_TIMED | — | **próprio** |
| 21 | Tempo de Reação | CONTINUOUS_TIMED | — | Base (2 et) |
| 22 | Certo ou Errado | CONTINUOUS_TIMED | — | Base (2 et) |
| 23 | Semáforo | CONTINUOUS_TIMED | — | Base (2 et) |
| 24 | Identificação de Símbolos | CONTINUOUS_TIMED | — | Base (1 et) |
| 25 | Rastreamento de Objetos | FIXED_HIGH_FATIGUE | — | Base (1 et) |
| 26 | Dupla Tarefa | FIXED_HIGH_FATIGUE | — | Base (2 et) |
| 27 | N-Back | FIXED_HIGH_FATIGUE | — | Base (2 et) |
| 28 | Vigilância | FIXED_HIGH_FATIGUE | — | **próprio** |
| 29 | Caminhos para a Meta | PLANNING_WINDOW | **sim** | **nenhum** |
| 30 | Jogo das Torres | PLANNING_WINDOW | — | Base (2 et) |
| 31 | Labirinto | PLANNING_WINDOW | — | Base (2 et) |
| 32 | Ordem da História | PLANNING_WINDOW | — | **nenhum** |
| 33 | Grade Dedutiva | PLANNING_WINDOW | — | Base (1 et) |
| 34 | Estacionamento Lógico | PLANNING_WINDOW | — | **nenhum** |

**Resumo:** 19 usam `TutorialBase` · **10 não têm tutorial** · 5 têm tutorial próprio.

> ⚠️ **Correção de contagem:** a análise anterior falou em "15 sem tutorial". Aquele número contava
> arquivos de `components/exercises/` que **não** são dos 34 canônicos (componentes auxiliares e
> variantes). Entre os 34, são **10**.

## 2. Características que exigem adaptação do framework

### 2.1 Auditivo puro — 2 exercícios

**Spans Direto e Inverso.** O estímulo **é** o áudio.

⚠️ A demonstração **não pode exibir os dígitos escritos** — destruiria o construto. Exige o framework
suportar demonstração sonora, usando `lib/tts.ts` (áudio pré-gerado + fallback Web Speech).

⚠️ Nenhum dos dois tem tutorial hoje: é **criar**, não converter.

### 2.2 Modalidade configurável — 5 exercícios

Compra Multifuncional · Restaurante · Supermercado · Agentes Focus · Caminhos para a Meta.

Podem rodar em visual, visual+áudio ou só áudio. **Decisão pendente:** o tutorial acompanha a
modalidade prescrita, ou é sempre visual?

### 2.3 Sem unidade natural — 11 exercícios

7 `CONTINUOUS_TIMED` + 4 `FIXED_HIGH_FATIGUE`. Rodam por tempo, não por número de unidades — não há
"uma tentativa" natural para a etapa **"Sua vez"**.

Exige **micro-unidade guiada**, já definida por ela: sequência curta com um alvo (Vigilância), uma
questão completa (Informação em Foco), poucos estímulos (Tempo de Reação), rodada curta (MOT),
pequeno bloco (Cores e Palavras).

### 2.4 Tentativa longa — 6 `PLANNING_WINDOW`

A unidade é um desafio inteiro, que pode levar minutos. A micro-unidade tem de ser uma versão
**reduzida** do desafio — não o desafio real.

### 2.5 Tutorial próprio com decisão clínica — 5 exercícios

⚠️ **Vigilância é o mais delicado:** o tutorial mostra o alvo **uma única vez** e *"não se repete no
jogo"*, porque o exercício exige **perceber sozinho** qual destoa. Converter sem entender isso
destrói o construto.

Agentes Focus e Informação em Foco foram reformulados recentemente e nascem em `TUTORIAL_VERSION = 2`.

### 2.6 Múltiplas etapas hoje — 10 exercícios

9 com 2 etapas + Supermercado com 3. O framework tem **uma** sequência: demonstração → sua vez →
validação. As decisões distintas da mecânica cabem **dentro** da demonstração.

## 3. Esforço estimado por grupo

| Grupo | Nº | Esforço unitário | Por quê |
|---|---:|---|---|
| **A — Base 1 etapa** | 7 | **baixo** | já é o formato-alvo; troca o invólucro |
| **B — Base 2–3 etapas** | 12 | **médio** | fundir etapas sem perder conteúdo |
| **C — Sem tutorial, visual** | 8 | **médio-alto** | criar demonstração e micro-unidade do zero |
| **D — Sem tutorial, auditivo** | 2 | **alto** | framework precisa de demonstração sonora |
| **E — Próprio com decisão clínica** | 5 | **alto** | auditoria individual antes de converter |

## 4. Ordem de implementação — do menor risco ao maior

O critério é **provar o framework onde ele é mais barato**, e só então enfrentar o que exige decisão
clínica.

1. **Fundação no banco** — sem isso nada funciona;
2. **Piloto visual** (Conecta Números) — grupo A, já compartilha componentes com o jogo;
3. **Piloto auditivo** (Span Direto) — grupo D, força o caso difícil antes de escalar;
4. **Grupo A restante** — o formato-alvo já validado;
5. **Grupo B** — fusão de etapas;
6. **Grupo C** — criação do zero, mecânica conhecida;
7. **Grupo D restante** (Span Inverso);
8. **Grupo E** — auditoria individual, um a um.

⚠️ **Vigilância por último**, dentro do grupo E: é onde o erro custa mais caro.

## 5. Lotes propostos

| Lote | Conteúdo | Nº | Publicável? |
|---|---|---:|---|
| **T1.0** | backup + banco + backfill + smoke test | — | sim |
| **T1.1** | framework em uso + 2 pilotos (Conecta Números, Span Direto) | 2 | sim |
| **T1.2** | Grupo A restante | 6 | sim |
| **T1.3** | Grupo B — parte 1 (CLOSED_PROTOCOL) | 6 | sim |
| **T1.4** | Grupo B — parte 2 (temporizados e planejamento) | 6 | sim |
| **T1.5** | Grupo C — sem tutorial, visual | 8 | sim |
| **T1.6** | Span Inverso + auditoria dos 5 do grupo E | 1 + análise | sim |
| **T1.7** | Grupo E — conversão, Vigilância por último | 5 | sim |

**Cada lote é publicável sem inconsistência**, porque o framework decide por exercício: quem já foi
convertido usa o fluxo novo; quem não foi mantém o atual. **Não há estado intermediário quebrado.**

⚠️ **Isso exige que o framework conviva com os dois formatos durante a transição** — requisito de
projeto do T1.1, não detalhe de implementação.

## 6. Decisões pendentes antes do T1.1

1. **Tutorial acompanha a modalidade prescrita** (5 exercícios) ou é sempre visual?
2. **Micro-unidade dos `PLANNING_WINDOW`** — desafio reduzido, ou só a primeira jogada?
3. **Pacientes atuais:** confirmado o backfill por `totalAttempts > 0`?
4. **Backup:** procedimento aprovado, mas **não executado**. É o bloqueio do T1.0.

## 7. O que este documento NÃO faz

Não implementa · não toca banco · não altera exercício · não inicia lote nenhum.
