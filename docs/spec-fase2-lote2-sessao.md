# FASE 2 — LOTE 2: composição da sessão e lógica do plano terapêutico

**Só arquitetura e documentação.** Não alterar código, exercícios, níveis, banco, migrations,
interface, catálogo, modalidades ou engine. Não commitar.

⚠️ **NÃO projetar a engine de sugestão automática nem IA.** Decisão dela: primeiro consolidar a
arquitetura da sessão. Esta spec descreve **regras determinísticas de composição e de alerta** —
nada de "o sistema sugere o melhor plano".

## Entrada (já pronta, não rediscutir)

- `docs/prescription-architecture/01-exercise-prescription-parameters.md` +
  `prescription-parameters.json` — os 12 parâmetros dos 34 (lote 1).
- Fase 1 congelada: perfis, macros, matriz fina.
- Estado atual do plano (auditoria): `docs/auditoria-plano-terapeutico/01-estado-atual.md` —
  duração e frequência são campos livres; o total é a soma de um `estimatedMinutes` fixo em 7.

## Documento 1: `docs/prescription-architecture/02-session-composition.md`

### Sessões de 20, 30 e 40 minutos

Para cada duração, definir:

- **duração-alvo** e **margem operacional** (transições entre exercícios + a unidade que o paciente
  termina depois do tempo). Resultado exibido como **faixa**, não número único.
- **limite máximo seguro** de duração real.
- quantos exercícios cabem, por modelo de execução (um `PLANNING_WINDOW` consome quase metade de
  uma sessão de 20).

### Regras determinísticas de composição

Escrever como **regras verificáveis**, não como heurística vaga. Cobrir:

1. **Carga** — teto por sessão, considerando a carga basal dos escolhidos.
2. **Fadiga** — quantos de fadiga alta por sessão; onde podem ficar.
3. **Interferência** — nunca dois de interferência alta em sequência.
4. **Modalidade** — nunca dois exercícios em modo só-áudio seguidos; os dois spans contam como
   auditivos mesmo sem seletor.
5. **Diversidade cognitiva** — usar `mechanicalPrimary` e os macros associados para evitar sessão
   inteira no mesmo processo. Definir o critério de "concentrado demais".
6. **Planejamento** — quantos `PLANNING_WINDOW` cabem por duração de sessão.
7. **Posição** — quem abre, quem fecha, quem não pode abrir nem fechar (usar o parâmetro 11 do
   lote 1).

Para cada regra: **o que dispara, a mensagem ao terapeuta e a severidade** (informativa ou de
atenção). **Nenhuma regra bloqueia o salvamento** — o terapeuta decide.

### Exemplos trabalhados

Três sessões válidas (uma de cada duração) e duas inválidas, com os alertas que cada uma dispara e
o porquê. Usar exercícios reais dos 34, com os nomes oficiais.

## Documento 2: `docs/prescription-architecture/03-therapeutic-plan-logic.md`

### O que o terapeuta escolhe

- **frequência semanal** (1 a 5) · **duração da sessão** (20/30/40) · **exercícios** ·
  parâmetros clínicos de cada um (dentro das faixas do lote 1).

### O que o sistema calcula sozinho

- **tempo real estimado** — faixa mínima–máxima, somando as durações prescritas + margem;
- **carga da sessão** — a partir das basais (a fórmula de carga dinâmica é fase posterior; aqui
  definir só a estrutura do cálculo e o que ele consome);
- **distribuição** — por domínio principal, por modelo de execução, por canal;
- **alertas** — as regras do documento 1;
- **conflitos** — combinação ruim, excesso de fadiga, sessão fora da faixa;
- **balanceamento semanal** — a frequência multiplica a exposição; registrar como isso entra
  (ex.: 5×/semana com dois de fadiga alta por sessão é diferente de 1×/semana).

### Estruturas conceituais (TypeScript, sem implementar)

`SessionPrescription` · `ExercisePrescription` · `SessionComposition` · `PlanWarning` ·
`WeeklyPlan`. Separar claramente: **definição global do exercício** ≠ **prescrição para um
paciente** ≠ **composição calculada** ≠ **alerta**.

Aproveitar o que o documento `docs/auditoria-plano-terapeutico/06-modelo-de-dados.md` já propôs,
sem contradizê-lo: aquilo é a base, isto é o refinamento com os parâmetros reais.

## Documento 3: `docs/prescription-architecture/04-open-decisions.md`

Só o que precisa de decisão clínica dela, por prioridade: **bloqueante · importante · refinamento**.
Não repetir conteúdo dos outros documentos.

## Regras que valem

- Nenhum alerta bloqueia; todos informam.
- Nada de pontuação, gamificação ou ranking.
- Linguagem descritiva, nunca diagnóstica.
- **Caminhos para a Meta** é provisório — não usar como exemplo-modelo.
- Não decidir sobre IA, sugestão automática ou prescrição inteligente.

## Entregável

Os três documentos no worktree. Ao terminar, listar: as regras de composição criadas (uma linha
cada) e o número de decisões pendentes por prioridade. Não commitar.
