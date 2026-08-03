# FASE 2 — LOTE 3: ajustes conceituais dela + consolidação

**Só documentação.** Não alterar código, exercícios, níveis, banco, migrations, interface,
catálogo, modalidades ou engine. Não commitar. **Não projetar engine de sugestão automática nem IA.**

Entrada pronta: `docs/prescription-architecture/01…04` + `prescription-parameters.json`.

## Parte A — três ajustes conceituais (decisão dela, 03/ago)

### A1. O teto de carga basal é HEURÍSTICO, não limite absoluto

Corrigir em `02-session-composition.md` (seção "Carga basal") e onde mais aparecer:

Os tetos **7 / 10 / 13** permanecem como **referência de atenção**, nunca como autorização ou
proibição. Escrever explicitamente que **duas sessões com a mesma carga total podem ter qualidades
clínicas muito diferentes** — a soma não descreve a sessão.

A composição deve ser lida considerando **simultaneamente**: carga basal · fadiga · interferência ·
modelo de execução · modalidade · planejamento. Nenhum desses eixos, isolado, decide se a sessão é
adequada.

Ajustar a redação dos alertas `LOAD_AT_CAP` e `LOAD_OVER_CAP` para linguagem consultiva — eles
informam que a soma passou da referência, não que a sessão está errada.

Acrescentar um exemplo curto: **duas sessões de carga 7 com perfis opostos** (ex.: uma com três
exercícios leves e um de fadiga alta; outra com dois moderados de interferência alta em sequência),
mostrando que o número é igual e a leitura clínica não.

### A2. Margem de fechamento por modelo de execução — **aprovada**

Mantida como está. Registrar no documento que foi validada por ela em 03/ago.

### A3. Novo alerta — `PLANNING_WINDOW_ADJACENT`

Dois exercícios com `executionModel = PLANNING_WINDOW` **não devem ficar consecutivos**.

- **Disparo:** para algum índice `i`, os exercícios `i` e `i+1` são ambos `PLANNING_WINDOW`.
- **Mensagem:** nomear o par e **sugerir inserir entre eles** um `CONTINUOUS_TIMED` ou
  `CLOSED_PROTOCOL`.
- **Severidade:** atenção. **Sugestão, nunca bloqueio.**
- Uma ocorrência por par adjacente, para manter a posição auditável.

Exemplo a citar no documento: Jogo das Torres → Estacionamento Lógico → Caminhos para a Meta é
justamente a sequência a evitar.

Este alerta é **novo e independente** do `PLANNING_WINDOW_COUNT` já existente (que trata da
quantidade por sessão) — os dois convivem.

### A4. Reafirmar: nenhum alerta bloqueia

Conferir todo o conjunto e garantir que **os 22 alertas** (21 + o novo) são consultivos. O
terapeuta sempre pode salvar. Se algum texto sugerir impedimento, corrigir.

## Parte B — consolidação

Criar `docs/prescription-architecture/05-consolidated-report.md` com:

### B1. Tabela única dos 34

Colunas: **Exercício** (nome oficial) · **Modelo de execução** · **Unidade mínima** · **Carga basal** ·
**Duração (mín · padrão · máx)** · **Fadiga** · **Interferência** · **Protocolos (BREVE/PADRÃO/
ESTENDIDO em unidades)** · **Status**.

Ordem do `CANONICAL_EXERCISES.md`.

### B2. Distribuições

Por modelo de execução · por carga basal · por fadiga · por interferência. Números absolutos.

### B3. Lista dos 22 alertas

Código · o que dispara · severidade — em uma linha cada.

### B4. Exercícios que ainda dependem de decisão clínica

Consolidar de `04-open-decisions.md`, por prioridade, indicando **quais exercícios** cada decisão
afeta. Incluir **Caminhos para a Meta** como provisório (será reformulado).

### B5. O que esta fase NÃO decidiu

Explicitar: fórmula de carga dinâmica · engine de sugestão · IA · prescrição automática · qualquer
alteração de código. São fases posteriores.

## Prova de aceite

1. `grep -c "PLANNING_WINDOW_ADJACENT"` em `02-session-composition.md` → ≥ 1.
2. Nenhum texto afirmando que um alerta impede salvar.
3. A tabela do `05` tem **34 linhas**.
4. As distribuições somam 34 em cada eixo.
5. `prescription-parameters.json` **intacto** (nenhum parâmetro dos 34 alterado neste lote).

Entregar no worktree. Não commitar.
