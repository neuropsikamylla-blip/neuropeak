# Agentes Focus — fim do seletor de modo e relatório por FUNÇÃO COGNITIVA (spec de tarefa)

Decisão de produto: `docs/FOCUS-AGENTES-MODO-UNICO.md`. Passo anterior (comandos + escada) já está
em produção (v2.66.0). Esta tarefa é o passo 4 de 5.

## Contexto medido (HEAD d2439a5)

- O modo (`foco | inibicao | alternancia | desafio`) **nunca entrou na geração da rodada** — só era
  lido de `settings.mode`, gravado no metadata e exibido no relatório.
- A etapa de cada rodada já sabe a função cognitiva: `FUNCAO_DA_ETAPA` em `lib/focus/commands.ts`
  (`seletiva | memoriaTrabalho | flexibilidade | inibicao`).
- `STEPS` (13 passos) vive em `lib/focus/progression.ts`; cada passo tem `etapa`.

## O que fazer

### 1. Tirar o seletor do plano — `components/plano/ExerciseCard.tsx`

- Remover o bloco **"Modo do treino"** (a constante `FOCUS_MODES` e as 4 `Pill`s).
- **Manter** o bloco "Nível inicial" e os demais ajustes do Focus (feedback, autoAdvance…).
- Nenhum outro exercício pode ser afetado.

### 2. Parar de ler o modo — `components/exercises/attention/FocusAgents.tsx`

- Remover `const mode = resolveFocusMode(settings?.mode)` e o uso dele.
- **Passar a contar por função cognitiva.** Acumular, por rodada encerrada, em qual função ela caiu
  (`FUNCAO_DA_ETAPA[STEPS[stepRef.current].etapa]`): `{ tentativas, acertos }`.
- Entregar isso ao metadata (item 3). Não mexer em mais nada do componente — **em especial, não
  tocar em nada visual** (cores, fundo, layout): é o passo 5, de outra pessoa.

### 3. Metadata — `lib/focus/progression.ts`

`buildFocusCompletionMetadata` deixa de receber `mode` e passa a receber `porFuncao`:

```ts
export type ContagemFuncao = { tentativas: number; acertos: number };
export type PorFuncao = Partial<Record<FuncaoCognitiva, ContagemFuncao>>;

// entrada: { trials, correct, omissions, avgRT, step, porFuncao }
// saída:   { trials, correct, omissoes, avgRT, level, porFuncao }
```

`resolveFocusMode` e `FOCUS_MODES` **continuam exportados** (sessões antigas no banco têm `mode`, e
o relatório ainda lê esse campo do histórico) — mas ninguém mais os usa para configurar o exercício.

### 4. Relatório — `lib/focus-report.ts`

- `Meta` ganha `porFuncao?: PorFuncao`.
- Sai `byMode: Record<FocusMode, FocusModeStat>` e entra:

```ts
export interface FocusFuncaoStat { tentativas: number; acertos: number; acc: number }
export type FocusPorFuncao = Record<FuncaoCognitiva, FocusFuncaoStat>;
// no FocusSummary: byFuncao: FocusPorFuncao
```

- Agregação: somar `tentativas` e `acertos` de todas as sessões que tenham `porFuncao`;
  `acc = acertos / tentativas` (0 quando `tentativas === 0`).
- **Sessões antigas (sem `porFuncao`) continuam contando no total geral** (precisão, nº de sessões,
  nível) e apenas ficam de fora do recorte por função. Não descartar sessão nenhuma.
- `lastMode`/`focusModeLabel`: manter exportados para o histórico, mas o resumo passa a expor
  também `funcaoLabel(f)` com os rótulos em pt-BR:
  `seletiva → "Atenção seletiva"`, `memoriaTrabalho → "Memória de trabalho"`,
  `flexibilidade → "Flexibilidade"`, `inibicao → "Controle inibitório"`.
- **Observações automáticas:** reescrever a que comparava `foco` × `alternancia` para comparar
  funções — ex.: se `seletiva.acc >= 0.8` e `flexibilidade.acc < 0.6` (com ≥ 10 tentativas em cada),
  observar que o paciente localiza bem, mas perde desempenho quando a regra muda.
  **Linguagem descritiva, nunca diagnóstica** (proibido "déficit", "TDAH", "impulsivo").

### 5. Tela do terapeuta — `app/(therapist)/pacientes/[id]/page.tsx`

Trocar a linha de pills por modo (hoje `focus.byMode[m]`) por uma lista das 4 funções com
`acc` e `tentativas`, ocultando as que ainda não têm dado:

```
Atenção seletiva      88%  (56)
Memória de trabalho   71%  (24)
Flexibilidade         54%  (13)
Controle inibitório   —
```

Manter o resto do cartão como está.

### 6. Tipo das settings — `app/(patient)/treino/[exercicio]/page.tsx:649`

Remover `mode?: ...` do tipo passado ao `FocusAgents`. Não alterar mais nada do arquivo.

## O que NÃO fazer

- Não mexer em `lib/focus/commands.ts`, no visual do componente, na escada ou no teto.
- Não apagar `mode` do banco nem migrar dados: sessões antigas ficam como estão.
- Não introduzir pontuação, ranking ou linguagem diagnóstica.

## Prova de aceite (escrever ANTES)

Em `lib/focus-report.test.ts` (criar se não existir) e `lib/focus/progression.test.ts`:

1. `buildFocusCompletionMetadata` devolve `porFuncao` e **não** devolve `mode`.
2. Duas sessões com `porFuncao` somam certo: tentativas e acertos agregados, `acc` correto.
3. Sessão **antiga** (só `mode`, sem `porFuncao`) **não quebra** o resumo e continua contando na
   precisão geral; a função dela fica zerada.
4. `byFuncao` com `tentativas === 0` devolve `acc === 0` (sem `NaN`).
5. `funcaoLabel` devolve os 4 rótulos em pt-BR.
6. A observação de "seletiva boa × flexibilidade fraca" só aparece com ≥ 10 tentativas em cada.
7. Nenhuma string do resumo contém palavra diagnóstica: teste que varre `observations` procurando
   `/déficit|TDAH|transtorno|impulsiv/i` e espera nenhuma ocorrência.

## Provas a rodar

```
npx tsc --noEmit      # exit 0
npx vitest run        # tudo verde (244 testes hoje + os novos)
```

Não commitar: entregar o diff no worktree.
