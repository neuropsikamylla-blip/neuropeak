# FASE 1 — revisão de linguagem clínica e UX

Base: v2.73.1, commit `3f8cff9`. **Sistema em produção, com pacientes reais.**

**Só texto e hierarquia visual.** Não commitar.

## ⛔ PROIBIÇÕES

**Não alterar:** núcleo · `validation.ts` · cálculos · fórmulas · alertas · regras · banco · APIs ·
migrations · exercícios · progressão · nível · doses · protocolos · **`package.json`** ·
**`vitest.config.ts`**.

**Nenhuma funcionalidade nova.** Nenhum insight novo, nenhuma condição nova.

**Não instalar dependências.** Os **484 testes atuais** não podem quebrar, salvo os que afirmem
literalmente um texto que esta revisão substitui.

⚠️ **Linguagem profissional e objetiva.** Ela rejeitou expressamente redações informais e
narrativas. **Proibido:** "é bastante para uma sessão deste tamanho" · "este plano deve levar
entre..." · "planejamento demorado" · qualquer tom coloquial ou explicativo longo.

## Arquivos permitidos

- **alterar** `lib/prescription/presentation.ts` (só textos e campos de exibição)
- **alterar** `components/plano/prescription/PrescriptionSummary.tsx` ·
  `CompactExerciseMeta.tsx` · `ExercisePrescriptionMeta.tsx`
- **alterar** testes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Substituições exatas

| Onde | De | Para |
|---|---|---|
| Detalhes da estimativa | `Faixa calculada: 30–40 min. Faixa esperada para a meta: 36–44 min.` | `Tempo previsto para este plano: 30–40 min. Faixa esperada para esta meta: 36–44 min.` |
| Demanda elevada | `...A carga do plano está acima da referência clínica para esta duração.` | `...A demanda total está acima do previsto para esta duração.` |
| Planejamento | `6 exercícios exigem janelas de planejamento.` | `6 exercícios exigem planejamento prolongado.` |
| Tooltip dos alertas | `Observações consultivas para apoiar a revisão da composição. Não impedem salvar.` | `Pontos para considerar antes de salvar. Não impedem o salvamento.` |
| Marcador legado | `Alguns parâmetros não puderam ser determinados.` | `Este plano usa uma configuração anterior.` |
| Tooltip legado | `O plano foi interpretado sem alterar os dados salvos. Confira os parâmetros indicados.` | `Os dados salvos não foram alterados.` |
| Plano vazio | `Adicione exercícios para consultar a estimativa e a composição do plano.` | `Adicione exercícios para ver o tempo previsto do plano.` |
| Grupo vazio | `Nenhum apontamento neste grupo.` | `Nada a revisar aqui.` |
| Expansão da estimativa | `Ver detalhes da estimativa` | `Ver tempo detalhado` |
| Título do bloco | `Estimativa atual` | `Tempo previsto` |

⚠️ **"Planejamento prolongado" fica** — o conceito é correto. O que sai é **"janela de
planejamento"**, nome interno do modelo de execução.

⛔ **Remover** `estimateTooltip` inteiro — descreve o funcionamento do algoritmo ("a partir da dose,
modalidade e transições entre exercícios") e não ajuda decisão nenhuma. Remover também o `title` que
o usa.

## 2. Remover da interface — escalas internas

Ela decidiu: **qualquer escala interna sem significado clínico direto sai da interface**, inclusive
dos detalhes.

| Item | Onde aparece hoje | Ação |
|---|---|---|
| `loadLabel` — "Carga 2" | detalhes do exercício | **remover da exibição** |
| `interferenceLabel` — "Interferência baixa" | detalhes do exercício | **remover da exibição** |
| `modelLabel` — "Por protocolo" | detalhes do exercício | **remover da exibição** |

⚠️ **Os campos continuam no objeto** `PresentedExercise` — o motor e futuros relatórios usam. **Só
deixam de ser renderizados.**

⚠️ **`fatigueLabel` FICA** — "Fadiga moderada" é qualitativo e clinicamente interpretável.

## 3. Encurtar o perfil cognitivo

Hoje:

> `Armazenamento de curto prazo · também recruta: memória operacional verbal, organização e
> sequenciamento, linguagem, leitura e processamento auditivo`

Passa a mostrar o primário e **no máximo dois** secundários:

> `Armazenamento de curto prazo · também: memória operacional verbal, organização e sequenciamento`

Sem reticências e sem "e mais N".

## 4. Hierarquia do cabeçalho

**Inverter:** o estado vem **antes** da meta. O terapeuta quer saber "está adequado?" antes de "o que
eu pedi?".

```
Tempo previsto
Dentro da faixa esperada          ← primeiro, com a cor do estado

Meta da sessão
40 minutos                        ← contexto, discreto

[Ver tempo detalhado]
```

## 5. Confirmação quando não há insight

Quando **nenhum** grupo tiver insight, exibir uma linha discreta:

> **Nada a revisar neste plano.**

Sem cor de alerta, sem ícone de erro. Serve para o terapeuta saber que o sistema **olhou** e não
achou nada — hoje a ausência de conteúdo pode parecer falha de carregamento.

⚠️ **Não** exibir isso quando houver qualquer insight.

## 6. Redundância de títulos

Hoje existem dois títulos vizinhos: **"Resumo da sessão"** e **"Informações do plano"**. Manter
**apenas um**. Escolher o que fizer mais sentido na estrutura atual e remover o outro — **sem** criar
título novo.

## 7. Campos órfãos

`fatigueText` e `interferenceText` (ex.: "3 baixas · 19 moderadas · 12 altas") são calculados em
`planPresentation` e **não são renderizados em lugar nenhum**. Confirmar e, se confirmado, **manter
no objeto** (o motor pode usar) mas **não** reintroduzir na tela.

## 8. Testes

1. nenhum texto visível contém: "faixa calculada", "referência clínica", "janela de planejamento",
   "parâmetros", "composição", "apontamento", "heurística", "algoritmo";
2. nenhum texto visível contém "Carga " seguido de número, nem "Interferência";
3. `estimateTooltip` não existe mais em `PRESENTATION_TEXTS`;
4. o perfil cognitivo tem **no máximo dois** secundários;
5. plano sem insight nenhum expõe a confirmação "Nada a revisar neste plano.";
6. plano **com** insight **não** expõe essa confirmação;
7. o cabeçalho apresenta o estado antes da meta (ordem no objeto ou verificação estática do fonte);
8. `loadLabel`, `interferenceLabel` e `modelLabel` continuam no objeto `PresentedExercise`;
9. `CompactExerciseMeta` e `ExercisePrescriptionMeta` **não renderizam** esses três campos —
   verificação estática do fonte;
10. os textos aprovados por ela seguem intactos: a frase do plano focal e "Planejamento prolongado".

⚠️ **Testes que importam componente `.tsx` quebram a coleta** — o `tsconfig` usa `jsx: "preserve"` e
a suíte roda em `environment: "node"`. Usar **verificação estática do fonte** (`readFileSync`), como
em `save-button-guard.test.ts`.

## 9. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 484 + novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · diff resumido · **o cabeçalho e os insights renderizados** num plano de 34 e num
plano sem insight · confirmação de que o núcleo não foi tocado · nº de testes novos. Não commitar.
