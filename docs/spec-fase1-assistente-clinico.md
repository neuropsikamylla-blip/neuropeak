# FASE 1 — revisão do plano como assistente clínico

Base: v2.72.0, commit `b088c37`. Decisões: `docs/prescription-architecture/11-` e `12-`.

**Sistema em produção, com pacientes reais.** Só apresentação. Não commitar.

## PROIBIÇÕES

⛔ **Não alterar `lib/prescription/validation.ts`** — o núcleo continua emitindo **todas** as 66
ocorrências. Elas são necessárias para o relatório do terapeuta e para a futura análise da ordem
real executada. A mudança é **exclusivamente de apresentação**.

⛔ **Não alterar:** banco · migrations · APIs · exercícios · progressão · nível · doses · protocolos ·
modalidades · formato persistido · `catalog.ts` · `duration.ts` · `load.ts` · `interpreter.ts` ·
`legacy.ts` · `types.ts` · **`package.json`** · **`vitest.config.ts`**.

⛔ **Não tocar em `lib/tutorial/`, `PreparationScreen` nem `exercise-tutorial`** — é a T1, outra fase.

**Não instalar dependências.** Os **471 testes atuais** não podem quebrar, salvo os que afirmem
literalmente textos que esta fase substitui.

**O botão de salvar não muda.** `canSave` segue `true`; nenhum alerta bloqueia.

## Arquivos permitidos

- **alterar** `lib/prescription/presentation.ts`
- **alterar** `components/plano/prescription/PrescriptionSummary.tsx` ·
  `CompactExerciseMeta.tsx`
- **criar** componentes em `components/plano/prescription/`
- **alterar/criar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. O princípio

A tela responde **uma** pergunta: *"Existe algo neste plano que merece minha atenção antes de
salvar?"*

**O paciente escolhe livremente a ordem dos exercícios** (verificado: `inicio/page.tsx:255` envolve
cada exercício num `<Link>`, sem trava de sequência). A ordem salva é **sugerida e de exibição**.

⛔ **Proibido apresentar como fato da execução futura** qualquer coisa que dependa de posição,
início, meio, encerramento, adjacência, consecutividade ou sequência planejada.

## 2. Ocultar da tela — o núcleo mantém

| Código / item | Motivo |
|---|---|
| `OUTSIDE_BEST_POSITION` | depende de ordem; o texto diz que pode ficar onde está |
| `OPEN_POSITION_NOT_ELIGIBLE` | posição escolhida pelo paciente |
| `CLOSE_POSITION_NOT_ELIGIBLE` | idem |
| `HIGH_FATIGUE_POSITION` | afirma que fecha a sessão |
| `HIGH_INTERFERENCE_ADJACENT` | afirma adjacência |
| `HIGH_FATIGUE_ADJACENT` | pressupõe sequência planejada que o paciente pode não seguir |
| `PLANNING_WINDOW_ADJACENT` | idem |
| `SESSION_RANGE_PARTIAL` | descreve a incerteza do cálculo |
| **"Carga basal: N / referência M"** | escala interna sem tradução clínica |
| **duração individual** na linha do exercício | vai para "Ver detalhes" e "Ajustar" |

⚠️ **Ocultar ≠ deixar de calcular.** Continuam em `interpretPlan`.

### 2.1 A carga basal

**Não** renomear o número para "Demanda da sessão" nem equivalente: ela própria definiu que é
heurística e que *"duas sessões com a mesma soma podem receber alertas diferentes"* — o número não
sustenta rótulo nenhum. **Não inventar escala nova.**

**Regra:** o número **sai** da tela. Quando houver referência clínica válida (só 20, 30 e 40 min) e a
carga estiver acima, isso entra **apenas como linguagem qualitativa dentro do insight de
intensidade**. Sem referência válida, **nada** sobre carga aparece.

## 3. Fundir

### 3.1 Intensidade global

Funde `HIGH_FATIGUE_COUNT` · `LOAD_AT_CAP` · `LOAD_OVER_CAP` em **um** insight.

⚠️ `HIGH_FATIGUE_ADJACENT` e `HIGH_FATIGUE_POSITION` **não entram** — pressupõem sequência. Ficam
ocultos (seção 2), emitidos pelo núcleo.

Forma-alvo, sem número de escala interna:

> **Plano de demanda elevada**
> 12 dos 34 exercícios são potencialmente fatigantes para a duração escolhida.

Se **não** houver referência de carga válida, o insight se apoia **só** na contagem de fadiga alta.

### 3.2 Concentração cognitiva

Funde `COGNITIVE_CONCENTRATION` · `DECLARED_BAD_COMBINATION` · `AUDITORY_ONLY_ADJACENT`.

Mantém o agrupamento temático já existente (v2.70.0) e o complemento aprovado:

> **Concentração cognitiva do plano**
> Vários exercícios recrutam processos semelhantes.
> *Essa concentração pode ser intencional em um plano focal. Caso o objetivo seja maior variedade,
> considere intercalar outro tipo de atividade.*

⛔ **A contagem NÃO é a mensagem principal.** Nada de *"9 pares recrutam processos semelhantes"*. O
número de pares pode aparecer **apenas em "Ver detalhes"**, e só se ajudar de fato. Quando o processo
concentrado for identificável, o título pode especializar — *"Concentração de treino verbal"* — mas
**sem contagem no título nem na mensagem**.

Exemplo literal aprovado por ela, a preservar quando o par ocorrer:

> "Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa
> concentração pode ser intencional em um plano focal."

### 3.3 Duração — vai para o cabeçalho, não é cartão

Funde os quatro `SESSION_*`. Aparece **uma vez só**, no topo:

```
Sessão de 40 min
Estimativa: aproximadamente 52 min
Acima da faixa esperada (36–44 min)
```

⛔ **Não repetir** a duração em cartão de alerta. Se estiver **dentro** da faixa, sem cor de alerta.

### 3.4 Planejamento

Usa `PLANNING_WINDOW_COUNT`. ⚠️ `PLANNING_WINDOW_ADJACENT` **não entra** — pressupõe sequência.

> **Planejamento prolongado**
> 6 exercícios exigem janelas de planejamento.

## 4. Cobertura cognitiva — NÃO implementar

⛔ Ela decidiu: **não** criar alerta de ausência de domínio sem objetivo clínico registrado. Um plano
focal exclui domínios de propósito. Como **não existe** campo de objetivo prioritário no modelo, esta
fase **não** implementa cobertura. Registrar no código como pendência, sem implementar.

## 5. Linguagem

Clínica · clara · consultiva · **sem precisão numérica falsa** · **sem afirmar que a escolha do
terapeuta está errada**.

⛔ **Proibido em texto visível:** "combinação desfavorável" · "manter apenas uma" · "contaminação" ·
"comparabilidade" · "carga basal" · qualquer código técnico · e agora também: "sequência" ·
"consecutiv*" · "adjacen*" · "encerramento" · "posição preferencial" · "início/meio/fim" como
afirmação sobre a execução.

## 6. Meta de quantidade

| Plano | Insights de primeiro nível |
|---|---:|
| Bem composto | **0** |
| Típico | 0–3 |
| 34 exercícios | **≤ 5** |

A duração no cabeçalho **não conta** como insight.

## 7. Objetivo 2 — linha do exercício

Em `CompactExerciseMeta`, a linha principal passa a: **nome · protocolo · fadiga**.

- **duração individual sai** — fica em "Ver detalhes" e no "Ajustar";
- **carga sai** — é a escala interna;
- **fadiga fica**, em linguagem clínica ("Fadiga alta"), não numérica;
- **protocolo fica** — é escolha do terapeuta.

## 8. Testes

1. plano bem composto (3 exercícios variados, duração compatível) → **0 insights**;
2. plano com os 34 → **≤ 5** insights de primeiro nível;
3. nenhum texto visível contém "sequência", "consecutiv", "adjacen", "encerramento", "posição
   preferencial", "carga basal" — varredura sobre o plano de 34;
4. nenhum código técnico visível (`/[A-Z]{3,}_[A-Z_]+/`);
5. **o núcleo continua devolvendo 66 ocorrências** no plano de 34 — comparar antes/depois;
6. a duração aparece **uma única vez** na apresentação;
7. plano dentro da faixa **não** gera insight de duração;
8. o insight de intensidade cita fadiga, e **só cita carga** quando há referência válida
   (20/30/40 min);
9. duração sem referência de carga (ex.: 35 min) **não** menciona carga;
10. `canSave` true e nenhum alerta com `blocksSave` verdadeiro;
11. `CompactExerciseMeta` não exibe duração individual nem carga;
12. o par Estacionamento Lógico + Jogo das Torres produz o texto de planejamento semelhante;
13. a mensagem principal de concentração **não** contém dígito de contagem;
14. `HIGH_FATIGUE_ADJACENT`, `PLANNING_WINDOW_ADJACENT` e `HIGH_INTERFERENCE_ADJACENT` **não**
    aparecem na apresentação, mas **continuam** no resultado do núcleo.

## 9. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 471 + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · **o texto exato de cada insight** num plano de 34 e num plano
bem composto · contagem de insights nos dois casos · confirmação de que `validation.ts` não foi
tocado e que o núcleo mantém 66 ocorrências · nº de testes novos. Não commitar.
