# IMPLEMENTAÇÃO — DOSE, LOTE 1: núcleo puro

Fonte da regra: `docs/prescription-architecture/08-dose-parameter-decisions.md` (aprovado por ela).
Diagnóstico de origem: `07-parameter-dose-analysis.md`. **Não reabrir discussão conceitual.**

Não commitar.

## PROIBIÇÕES

**Não alterar nenhum componente.** Este lote é 100% `lib/prescription/` + testes. A interface é o
lote 2.

**Não alterar:** APIs · banco · migrations · páginas · `lib/adaptive.ts` · `lib/exercise-plan.ts` ·
exercícios · progressão adaptativa · **`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.**

**Não implementar:** redefinição de nível · leitura de histórico do paciente · carga dinâmica ·
fadiga dinâmica · dose personalizada para planos novos · reformulação de Caminhos para a Meta ou
Ordem da História.

**Não mudar os valores de protocolo do catálogo** (4/8/12 etc.) — só o consumo deles.

Os **333 testes atuais não podem quebrar.** `save-button-guard.test.ts` e
`library-coverage.test.ts` precisam continuar passando sem edição.

## Arquivos permitidos

- **alterar** `lib/prescription/types.ts` · `legacy.ts` · `duration.ts` · `presentation.ts`
- **alterar/criar** os `*.test.ts` correspondentes em `lib/prescription/`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Categorias formais de parâmetro (`types.ts`)

```ts
export type ParameterCategory =
  | "DOSE_PARAMETER"
  | "DIFFICULTY_PARAMETER"
  | "ASSISTIVE_PARAMETER"
  | "VARIANT_PARAMETER"
  | "ADMINISTRATIVE_PARAMETER";
```

Mapear as chaves que a tela usa hoje para sua categoria, numa constante exportada e exaustiva:

| Chave | Categoria |
|---|---|
| `protocol` | `DOSE_PARAMETER` |
| `trials` | `DOSE_PARAMETER` (só legado) |
| `atividadesSelecionadas` | `DOSE_PARAMETER` (só legado/provisório) |
| `startLevel`, `level` | `DIFFICULTY_PARAMETER` |
| `allowReplay` | `ASSISTIVE_PARAMETER` |
| `presentationMode` | `VARIANT_PARAMETER` |
| `unlockIntruso`, `unlockFalta` | `VARIANT_PARAMETER` |
| `feedback`, `autoAdvance` | `ADMINISTRATIVE_PARAMETER` |

**Um parâmetro pertence a uma só categoria.** Uma função `parameterCategory(key)` devolve a
categoria ou `undefined` para chave desconhecida — **nunca lança**.

## 2. Dose legada (`types.ts` + `legacy.ts`)

Acrescentar à união `PrescribedDose`:

```ts
| { kind: "legacyCustom"; unitCount: number; sourceKey: string }
```

`sourceKey` guarda de onde veio (`"trials"`), para rastreabilidade.

### Regra de leitura

`normalizeDose` hoje só olha `object.dose ?? settings.protocol`. Acrescentar, **como último
recurso** (depois de `dose` e de `protocol`, nunca antes):

- `settings.trials` numérico e > 0 → `{ kind: "legacyCustom", unitCount: trials, sourceKey: "trials" }`.

**Precedência obrigatória:** `dose` explícito > `settings.protocol` > `settings.trials`. Um plano que
já tenha protocolo **nunca** é lido como legado.

⚠️ **Preservar o valor exato.** Não arredondar, não aproximar para o protocolo mais próximo, não
apagar `settings.trials` do `clinicalParameters`. `10`, `15`, `20` e `30` sobrevivem como `10`, `15`,
`20` e `30`.

⚠️ **Ler nunca converte.** `readLegacyPlan` é leitura pura: não escreve, não normaliza para
protocolo, não altera nível, progresso nem histórico.

### Caminhos para a Meta

`atividadesSelecionadas` continua preservado em `clinicalParameters` **sem** virar dose. Marcar o
exercício como configuração **provisória** (ele é `PROVISIONAL_PROFILE`), sinalizando isso no
resultado da leitura para a interface poder exibir "Configuração provisória" no lote 2.

**Não** reinterpretar a lista como protocolo. **Não** alterar a execução.

## 3. Estimativa da dose legada (`duration.ts`)

`doseMinutes` precisa tratar `kind: "legacyCustom"`. A regra é **restritiva de propósito**:

> A dose legada só recebe faixa estimada quando o **minuto por unidade for constante nos três
> protocolos** do exercício (`durationMinutes / unitCount` igual em BREVE, PADRAO e ESTENDIDO,
> dentro de tolerância de ponto flutuante).

Quando constante: `minutos = unitCount × taxa`, e o resultado é marcado como **aproximado**.
Quando não: **não há faixa** — o exercício entra como estimativa indeterminada.

Verificado sobre o catálogo: a taxa é constante em **19 dos 34**, incluindo os dois spans — os
únicos com dose legada real hoje (Span Direto 0,75 min/unidade; Inverso 1,00). Nos outros 15 não há
base, e inventar seria falsa precisão.

Expor um sinal explícito de aproximação (por exemplo `isApproximate` no resultado resolvido, ou
função `legacyDoseMinutes(definition, dose)` devolvendo `{ minutes?, approximate }`) — a forma é sua,
desde que `presentation.ts` consiga distinguir os três casos: **protocolo atual** · **legado
estimado** · **legado sem estimativa**.

⚠️ Quando não houver faixa, a soma da sessão **não pode quebrar nem virar `NaN`**. Decida e
**documente** como o exercício sem faixa entra em `calculateDuration` — a opção segura é contribuir
com zero e a interface avisar que a estimativa está incompleta.

## 4. Apresentação (`presentation.ts`)

Acrescentar, sem remover nada:

### Textos dos protocolos — **exatamente** estes, aprovados por ela

- **Breve:** "Dose reduzida. Pode ser útil para introdução à atividade, menor tolerância à fadiga,
  retorno após pausa ou sessões com maior variedade de exercícios."
- **Padrão:** "Dose habitual recomendada para a maioria dos treinos, equilibrando duração, repetição
  e adaptação."
- **Estendido:** "Dose ampliada para treino focal, maior familiaridade com a tarefa ou sessões com
  menor número de exercícios. Pode aumentar a fadiga."

### Opções de protocolo por exercício

Uma função que, dado um `exerciseId`, devolve as três opções, cada uma com: protocolo · texto
orientativo · **quantidade interna de unidades** com o nome da unidade do catálogo
(`minimumValidUnit`, ex.: "8 séries") · **duração estimada** · observação sobre progressão adaptativa
**quando aplicável**.

Formato-alvo do que a UI vai renderizar:

```
Padrão
8 séries
Estimativa: 6–7 min
```

**Observação de validade adaptativa:** só no protocolo **Breve**, e só quando ele de fato der poucas
unidades. Critério objetivo, para não depender de opinião: `unitCount` de BREVE **≤ 2**. Texto:
"Pode não fornecer unidades suficientes para decisão adaptativa robusta."

### Marcador de dose legada

Distinguir na apresentação:

- **protocolo atual** → faixa normal;
- **legado com estimativa** → faixa + marcação de aproximado;
- **legado sem estimativa** → texto **"Duração aproximada — configuração anterior."**

E o rótulo do valor preservado, ex.: **"15 tentativas"** — usando o plural correto e o nome da
unidade quando fizer sentido.

### Observação qualitativa de exposição

Estendido: "Maior exposição; pode aumentar a fadiga." · Breve: "Menor exposição."

⚠️ **Carga e fadiga NÃO mudam numericamente.** Nada de transformar carga 2 em 3. É só texto.

⚠️ **Nenhum código técnico** nos textos visíveis — a varredura `/[A-Z]{3,}_[A-Z_]+/` já existente
precisa continuar passando e cobrir os textos novos.

## 5. Testes obrigatórios

Em `lib/prescription/*.test.ts`:

1. `trials` **10, 15, 20 e 30** sobrevivem à leitura com o valor exato;
2. plano com `settings.protocol` **não** é lido como legado (precedência);
3. plano com `dose` explícito vence `settings.protocol` (precedência);
4. `readLegacyPlan` **não muda** nível, progresso, histórico nem `clinicalParameters`;
5. Breve, Padrão e Estendido geram **durações diferentes** para o mesmo exercício;
6. dose legada em exercício de taxa constante recebe faixa correta (Span Direto: 15 tentativas →
   11,25 min) e vem marcada como aproximada;
7. dose legada em exercício de taxa **não** constante **não** recebe faixa;
8. sessão com exercício sem faixa **não** produz `NaN`;
9. os três textos de protocolo aparecem literalmente;
10. a observação de validade adaptativa aparece **só** quando BREVE ≤ 2 unidades;
11. modalidade continua recalculando a duração quando há `durationMultiplier`;
12. modalidade **não** altera carga basal;
13. `allowReplay` **não** altera duração, carga nem fadiga;
14. `atividadesSelecionadas` é preservado e **não** vira dose;
15. `parameterCategory` classifica todas as chaves da tabela e devolve `undefined` para desconhecida.

## 6. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 333 atuais + os novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · nº de testes novos · **como você resolveu o exercício sem faixa em
`calculateDuration`** · a faixa calculada para Span Direto com 10, 15, 20 e 30 tentativas ·
confirmação de que nenhum componente foi tocado. Não commitar.
