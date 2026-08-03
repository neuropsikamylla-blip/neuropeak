# FASE 2 — fechamento: decisões aprovadas + especificação de implementação

**Só documentação.** Não implementar, não alterar banco, migrations, exercícios, interface,
catálogo ou engine. Não commitar.

**Não reabrir a análise dos 34** nem alterar parâmetros individuais já consolidados.

## Parte A — registrar as decisões APROVADAS por ela (03/ago/2026)

Atualizar `04-open-decisions.md` (marcar as 4 bloqueantes como **APROVADAS**, com a data e o teor),
`05-consolidated-report.md` e `02-session-composition.md`.

### A1. Faixas de duração — QUATRO estados, não três

⚠️ **Isto é mudança**: a arquitetura tinha faixa esperada + limite seguro. Ela definiu **quatro
estados nomeados**:

| Sessão | Abaixo | Dentro do esperado | Atenção | Excesso importante |
|---:|---|---|---|---|
| 20 min | < 18 | **18–22** | > 22 até 24 | **> 24** |
| 30 min | < 27 | **27–33** | > 33 até 36 | **> 36** |
| 40 min | < 36 | **36–44** | > 44 até 48 | **> 48** |

São **estimativas operacionais, não limites clínicos**. O sistema informa em qual dos quatro estados
a sessão caiu. **Nenhum bloqueia salvamento.**

Ajustar os alertas de duração para refletir os quatro estados (o `SESSION_SAFE_MAX_EXCEEDED` passa a
corresponder a "excesso importante"; o intervalo de atenção ganha identificação própria). **Não criar
código de alerta novo sem necessidade** — reaproveitar os existentes, renomeando o significado se for
o caso, e registrar o mapeamento estado → alerta.

### A2. Margem de fechamento — aprovada, com regra nova para desafio não concluído

Aprovados: contínuo **0,5 min** · protocolo fechado **1 min** · planejamento **3 min** ·
fixo/alta fadiga **0** (só o fechamento técnico da tela). Em todos: **não iniciar nova unidade**
depois do tempo-base.

⚠️ **Regra nova a registrar** (é comportamento de execução, não só de aviso): para
`PLANNING_WINDOW`, os 3 minutos são **teto de segurança, não obrigação** de manter o paciente até o
fim. Se o desafio **não** for concluído dentro da margem:

- encerrar de forma segura;
- registrar como **desafio não concluído**;
- **preservar movimentos, tempo e progresso**;
- **não** contar como erro automático;
- não iniciar novo desafio;
- **não aplicar penalização automática**;
- **manter o progresso adaptativo PROTEGIDO** até que a regra específica do exercício seja definida.

⚠️ **Cláusula decisiva (confirmada por ela em 03/ago):** esta é **política geral da arquitetura**.
Cada exercício de planejamento **poderá futuramente** definir critérios próprios de impacto na
progressão — mas **nesta etapa é PROIBIDO inventar regra adaptativa individual**. Registrar apenas o
encerramento seguro e a preservação das métricas. Nenhuma linha da especificação pode sugerir que
"desafio não concluído" reduz nível, bloqueia subida ou conta como erro.

As métricas preservadas incluem: **tempo, movimentos, tentativas e demais métricas já produzidas**.

Isso precisa aparecer também na especificação de implementação (Parte B), porque afeta o registro da
sessão e o cálculo de progressão.

### A3. Tetos de carga — aprovados como heurística pura

7 / 10 / 13. Reafirmar que **não** significam sessão válida, inválida, autorização, proibição nem
segurança garantida. A leitura considera conjuntamente: carga basal · fadiga · interferência ·
sequência · modalidade · modelo de execução · concentração de tarefas semelhantes · **planejamento
consecutivo**. Duas sessões com a mesma soma podem receber alertas diferentes.

### A4. Fadiga alta — aprovada como recomendação

Máximo recomendado: **1** em 20 min · **2** em 30 e 40 min. Não recomendar dois consecutivos;
sugerir intercalar com fadiga baixa ou moderada. **Evitar** fadiga alta como último exercício — mas
se o terapeuta mantiver, **permitir normalmente**. A regra de não finalizar com fadiga alta é
**consultiva, não absoluta**.

### A5. `PLANNING_WINDOW_ADJACENT` — mantido

Sugerir inserir `CONTINUOUS_TIMED` ou `CLOSED_PROTOCOL` entre os dois. Sem bloqueio.

### A6. Caminhos para a Meta — segue provisório

`PROVISIONAL_PROFILE`, com duração, carga e modelo provisórios. Será reavaliado após a reformulação
para planejamento. **Não usar como referência para calibrar outros exercícios.**

## Parte B — criar `docs/prescription-architecture/06-implementation-spec.md`

Especificação **objetiva** de implementação (para executar numa fase futura, não agora).

### B1. Arquivos que a implementação precisará alterar

Levantar no código e listar com caminho e papel. Pelo menos:

- `types/index.ts` — `estimatedMinutes` fixo (hoje 7 para quase todos) precisa dar lugar à política
  de duração por exercício;
- `components/plano/PlanBuilderSidebar.tsx` — o total é `reduce` da soma de `estimatedMinutes`;
  duração e frequência são campos numéricos livres;
- `components/plano/ExerciseCard.tsx` — controles por exercício (hoje "Tentativas" só para spans);
- `app/(therapist)/pacientes/[id]/plano/page.tsx` — estado do plano e persistência;
- `components/plano/ExerciseRow.tsx` — exibição do "~7 min";
- onde mais o levantamento encontrar.

Para cada um: **o que muda** e **o que NÃO pode quebrar** (planos salvos, sessões antigas, progresso).

### B2. Estruturas de dados

Consolidar as estruturas conceituais do `03-therapeutic-plan-logic.md` numa forma única e final:
definição global do exercício · prescrição · composição calculada · alerta. Deixar explícito o que é
**derivado** (recalculado) e o que é **persistido**.

### B3. Os 18 alertas como contrato

Tabela final: código · disparo (condição verificável) · severidade · `blocksSave = false` ·
mensagem. É o contrato que a implementação deve cumprir.

### B4. Ordem técnica recomendada, com risco

Propor a sequência de implementação da área do terapeuta em fases, cada uma com: o que entrega ·
risco (baixo/médio/alto) · o que testar antes de seguir · se é reversível. Princípio: começar pelo
que **só lê** (cálculo e exibição) e deixar por último o que **muda o que o paciente vive**.

Incluir explicitamente o cuidado com **compatibilidade**: plano salvo no formato antigo precisa
abrir, rodar e salvar sem perder configuração; nenhum paciente pode ser rebaixado de nível.

### B5. O que a implementação NÃO faz

Carga dinâmica · engine de sugestão · IA · prescrição automática · alteração de exercício ·
alteração de progressão.

## Prova de aceite

1. `04-open-decisions.md` mostra as 4 bloqueantes como **APROVADAS** e **nenhuma bloqueante restante**.
2. Os quatro estados de duração aparecem em `02-session-composition.md` com os números dela.
3. A regra do desafio não concluído (`PLANNING_WINDOW`) está registrada nos dois lugares
   (composição e spec de implementação), **incluindo** a proteção do progresso adaptativo e a
   proibição de inventar regra adaptativa individual nesta etapa.
7. Os quatro estados de duração aparecem **nomeados**, incluindo `EXCESSO_IMPORTANTE`.
4. Os **18 alertas** listados, todos com `blocksSave = false`.
5. `prescription-parameters.json` **intacto** — nenhum dos 34 alterado.
6. `06-implementation-spec.md` existe, com arquivos, estruturas, contrato de alertas e ordem por fases.

Entregar no worktree. Não commitar.
