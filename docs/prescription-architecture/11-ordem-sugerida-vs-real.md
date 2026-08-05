# Ordem sugerida × ordem real de execução

> Decisão arquitetônica dela, 04/ago/2026. **Nada implementado.** Nenhum código, interface ou banco
> tocado. A **Fase T1 não é interrompida** — segue aprovada e independente disto.
>
> Documento **novo**: `01`–`10` seguem intactos.

## 1. A decisão

O paciente treina em casa e **escolhe por qual exercício começar**. O plano pode ter uma ordem
sugerida pelo terapeuta, mas ela **não é a ordem real de execução**.

| | O que é | Quando se conhece |
|---|---|---|
| **Ordem sugerida** | organização proposta pelo terapeuta; orientação | na prescrição |
| **Ordem real** | sequência que o paciente de fato escolheu | **só após a execução** |

**Consequência direta:** afirmações sobre sequência e posição só são verdadeiras se a ordem for
imposta pelo sistema **ou** se forem calculadas depois, sobre o que aconteceu.

## 2. As 10 respostas — verificadas no código

### 2.1 O paciente pode escolher livremente?

**Sim. Já hoje, sem nenhuma restrição de sequência.**

`app/(patient)/inicio/page.tsx:204-255` renderiza a lista e envolve **cada** exercício num
`<Link href={/treino/${exId}}>`. A única condição é `doneToday`:

```tsx
return doneToday ? (
  <div key={exId}>{cardContent}</div>        // já feito hoje → não é link
) : (
  <Link key={exId} href={`/treino/${exId}`}>{cardContent}</Link>   // qualquer um, a qualquer hora
);
```

Não há "próximo exercício", nem exercício desabilitado por não ser a vez, nem trava de sequência.

### 2.2 A ordem é obrigatória em algum ponto do runtime?

**Não, em nenhum.** Busca por trava de ordem em `treino/[exercicio]/page.tsx` retorna apenas
instruções **internas** dos exercícios ("toque na mesma ordem em que ouviu", "arraste os cartões para
a ordem da história") — nada sobre sequência entre exercícios.

A única trava existente é `blockedToday`, que impede **repetir o mesmo exercício no dia** — e é
baseada em `lastAttemptAt`, não em posição.

**A ordem do plano é, hoje, apenas a ordem de exibição da lista.**

### 2.3 Quais alertas dependem da ordem planejada?

**Oito dos dezoito:**

| Código | Depende de |
|---|---|
| `HIGH_FATIGUE_ADJACENT` | adjacência |
| `HIGH_INTERFERENCE_ADJACENT` | adjacência |
| `PLANNING_WINDOW_ADJACENT` | adjacência |
| `AUDITORY_ONLY_ADJACENT` | adjacência |
| `HIGH_FATIGUE_POSITION` | posição de fechamento |
| `OPEN_POSITION_NOT_ELIGIBLE` | posição de abertura |
| `CLOSE_POSITION_NOT_ELIGIBLE` | posição de fechamento |
| `OUTSIDE_BEST_POSITION` | posição preferencial |

**Medido num plano com os 34 exercícios:** de **66 ocorrências**, **21 dependem de ordem** e **45
não**. A distribuição:

```
DEPENDEM DE ORDEM (21)          INDEPENDENTES (45)
  13x OUTSIDE_BEST_POSITION       41x DECLARED_BAD_COMBINATION
   4x HIGH_FATIGUE_ADJACENT        1x LOAD_OVER_CAP
   2x HIGH_INTERFERENCE_ADJACENT   1x SESSION_SAFE_MAX_EXCEEDED
   2x PLANNING_WINDOW_ADJACENT     1x HIGH_FATIGUE_COUNT
                                   1x PLANNING_WINDOW_COUNT
```

⚠️ **`DECLARED_BAD_COMBINATION` não depende de ordem** — dispara por **presença no plano**, em
qualquer posição (`validation.ts:82`). Já foi movido para observação clínica na v2.70.0.

### 2.4 Quais deixam de ser válidos com ordem livre?

**Todos os oito** — como **afirmação sobre o que vai acontecer**.

"Fadiga alta em sequência" afirma que dois exercícios serão executados um após o outro. Com escolha
livre, isso é **uma entre muitas possibilidades**. Num plano de 5 exercícios há **120 ordens
possíveis**; o alerta descreve exatamente uma.

Pior: alguns viram **quase sempre falsos**. `HIGH_FATIGUE_POSITION` ("fecha apesar de fadiga alta")
depende de o paciente deixar aquele exercício por último — com 5 exercícios, há **20% de chance**.

### 2.5 Quais podem permanecer como análise da ordem sugerida?

**Tecnicamente, todos** — desde que a linguagem mude de fato para hipótese: *"na ordem sugerida,
estes exercícios aparecem consecutivamente"*.

⚠️ **Mas ela mesma levantou a dúvida certa:** isso ajuda ou é ruído? Minha leitura, e é opinião:

- **`OUTSIDE_BEST_POSITION` — sai.** São **13 das 21** ocorrências, e a informação é fraca: o próprio
  texto já diz que o exercício "pode permanecer nessa posição". É a definição de ruído.
- **`OPEN_POSITION_NOT_ELIGIBLE` / `CLOSE_POSITION_NOT_ELIGIBLE` — saem.** Descrevem elegibilidade
  para posições que o paciente escolhe.
- **`HIGH_FATIGUE_ADJACENT` / `HIGH_INTERFERENCE_ADJACENT` / `PLANNING_WINDOW_ADJACENT` — merecem
  discussão.** O par continua existindo no plano independente da ordem; o que a ordem muda é **se
  serão consecutivos**. Podem sobreviver reformulados como **composição**, não sequência: *"o plano
  tem 2 pares de fadiga alta que podem cair em sequência"*.
- **`HIGH_FATIGUE_POSITION` — sai.** Só faz sentido sobre execução real.

### 2.6 Quais devem migrar para a análise da execução real?

**Todos os oito**, quando existir histórico de ordem executada — hoje não existe.

⚠️ **E aí eles ficam melhores do que são hoje:** deixam de prever e passam a **descrever**. *"Nas
últimas 4 sessões, o paciente fez Vigilância logo após N-Back em 3 delas"* é observação clínica de
verdade, verificável.

Isso depende da fase **"Execução e histórico das sessões"**, já registrada como futura — que precisa
guardar a **sequência** dentro da sessão, algo que hoje não existe: `Session` é por exercício, sem
agrupamento por sentada.

### 2.7 Quais informações são métrica interna sem tradução clínica?

| Hoje aparece | Problema |
|---|---|
| **"Carga basal: 11 / referência 10"** | escala interna, sem unidade clínica. O terapeuta não sabe o que é "11" |
| **"12 atividades"**, **"6 janelas"** como dado principal | contagem sem consequência declarada |
| **"Estimativa atravessa a faixa esperada"** | descreve o cálculo, não a clínica |
| Repetição do mesmo par em códigos diferentes | o mesmo par pode gerar sobreposição **e** adjacência |

⚠️ A carga basal é o caso mais claro. Ela mesma definiu que é **heurística consultiva** e que *"duas
sessões com a mesma soma podem receber alertas diferentes"*. Exibi-la como número de destaque
contradiz a própria definição.

### 2.8 O que realmente ajuda o terapeuta?

Análises **independentes de ordem**, que continuam verdadeiras aconteça o que acontecer:

1. **duração estimada do conjunto** — a mais concreta e acionável;
2. **quantidade de exercícios de fadiga alta** — composição, não sequência;
3. **composição por domínio** e **concentração de treino**;
4. **sobreposição de processos cognitivos** — incluindo planejamento (Estacionamento Lógico + Jogo das
   Torres), que ela destacou como útil;
5. **carga total**, **quando houver referência clínica validada** — hoje só existe para 20, 30 e 40 min.

### 2.9 Como reduzir a um conjunto pequeno de insights

A pergunta que a tela deve responder, nas palavras dela:

> *"Existe algo neste conjunto de exercícios que merece atenção clínica antes de salvar?"*

Proposta de redução, do plano com 34 exercícios:

| | Hoje | Proposto |
|---|---:|---:|
| Ocorrências no núcleo | 66 | 66 *(inalterado)* |
| Cartões de primeiro nível | 8 | **3 a 4** |
| Dependentes de ordem | 21 | **0** |

Os três a quatro insights sobreviventes seriam: **duração fora da faixa** · **concentração de fadiga
alta** · **concentração cognitiva / sobreposição** · **carga acima da referência**, quando houver
referência.

⚠️ **O núcleo continua calculando tudo.** A redução é de **apresentação** — os oito códigos de ordem
permanecem no motor, disponíveis para a futura análise da execução real.

### 2.10 Arquivos e documentos afetados

| Arquivo | Natureza da mudança |
|---|---|
| `lib/prescription/presentation.ts` | reclassificar os 8 códigos; reescrever linguagem para hipótese ou remover da tela |
| `components/plano/prescription/PrescriptionSummary.tsx` | reduzir o que aparece |
| `lib/prescription/validation.ts` | **só se** ela decidir parar de emitir algum — recomendo **não** mexer |
| `docs/prescription-architecture/02-session-composition.md` | registrar que ordem é sugestão |
| `docs/prescription-architecture/06-implementation-spec.md` | idem |
| testes | asserções que afirmam alerta de posição |

⚠️ **Recomendo não tocar em `validation.ts`.** Se o núcleo parar de emitir, o dado some para a futura
análise de execução real. A mudança certa é **de apresentação**.

## 3. Riscos e decisões pendentes

1. **Os três alertas de adjacência** (fadiga, interferência, planejamento) — somem, ou viram
   composição (*"há 2 pares que podem cair em sequência"*)?
2. **A carga basal deve continuar visível?** Ela é heurística sem unidade clínica, e ela mesma
   determinou que não define validade.
3. **A ordem sugerida continua editável** pelo terapeuta na tela? Se sim, para quê — apresentação?
4. **Quando o histórico existir**, os alertas de ordem voltam como análise retrospectiva. Isso é parte
   da fase de execução, não desta.
5. **A ordem chega ao paciente hoje?** Só como ordem de exibição da lista. Convém sinalizar a
   sugestão na tela dele, ou deixar neutro?

## 4. O que esta análise NÃO faz

Não altera código, interface, banco ou testes · não interrompe a T1 · não inicia implementação.
