# IMPLEMENTAÇÃO — DOSE, LOTE 2: interface do ajuste

O lote 1 está **commitado** (`b491e92`) e é a base. `lib/prescription/` já sabe tudo: categorias,
dose legada, estimativa aproximada, textos e opções de protocolo. **Este lote só consome.**

Fonte da regra: `docs/prescription-architecture/08-dose-parameter-decisions.md`.

Não commitar.

## PROIBIÇÕES

**Não alterar:** APIs · banco · migrations · páginas do paciente · `lib/adaptive.ts` · exercícios ·
progressão adaptativa · catálogo · **`package.json`** · **`vitest.config.ts`**.

**Não implementar:** redefinição de nível · leitura de histórico do paciente · reformulação de
Caminhos para a Meta ou Ordem da História · carga dinâmica · fadiga dinâmica · **dose personalizada
para planos novos**.

**Não instalar dependências.** Não adicionar jsdom nem Testing Library — os testes continuam puros.

**O botão de salvar não muda:** `disabled={saving || items.length === 0}`.
`save-button-guard.test.ts` e `library-coverage.test.ts` precisam passar **sem edição**.

Os **367 testes atuais não podem quebrar** — exceto o único que consagra o defeito do
`protocolLabel` com "blocos", que deve ser corrigido junto (ver seção 3).

## Arquivos permitidos

- **alterar** `components/plano/ExerciseCard.tsx` · `PlanBuilderSidebar.tsx` ·
  `app/(therapist)/pacientes/[id]/plano/page.tsx`
- **criar** componentes em `components/plano/prescription/`
- **alterar** `lib/exercise-plan.ts` (gravação do protocolo)
- **alterar/criar** `lib/prescription/presentation.ts` e testes em `lib/prescription/` **apenas se**
  faltar algum dado puro — a lógica nova continua fora do React

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Gravação do protocolo (`lib/exercise-plan.ts` + `page.tsx`)

**Decisão de desenho já tomada — seguir, não reinterpretar:** o protocolo é gravado em
`settings.protocol` com os valores `"BREVE"` · `"PADRAO"` · `"ESTENDIDO"`, porque `normalizeDose`
**já reconhece essa chave**. Nenhum formato novo.

Ao **adicionar** um exercício ao plano, gravar **`PADRAO` explicitamente** — nada de contar com
fallback silencioso. Um plano novo salvo precisa conter `protocol` para cada exercício.

⚠️ **Não** reescrever exercícios já presentes no plano ao abrir a tela. Um plano legado que não tem
`protocol` continua sem `protocol` até o terapeuta agir. **Abrir a tela não pode alterar dado.**

## 2. Janela "Ajustar" — quatro seções

Reorganizar o painel do `ExerciseCard` nesta ordem:

1. **Dose do treino** — o seletor de protocolo (seção 3)
2. **Modalidade e variantes** — `presentationMode` (5 exercícios) · `unlockIntruso`/`unlockFalta`
   (Ordem da História)
3. **Assistência** — `allowReplay` (spans)
4. **Configurações de nível** — o slider de nível
5. **Preferências de execução** — `feedback` · `autoAdvance` (Focus)

Seções vazias **não aparecem**. Cada seção com título discreto, visualmente separada.

⚠️ **Nenhuma seção começa recolhida.** Ela quer ver a janela inteira aberta antes de decidir o que
recolher. Não usar `<details>` fechado nem acordeão nas seções.

## 3. Seletor de protocolo

Usar `protocolOptions(exerciseId)` do lote 1. Para cada uma das três opções, mostrar:

```
Padrão
8 séries
Estimativa: 6–7 min
```

mais o **texto orientativo** de `PROTOCOL_GUIDANCE_TEXTS` e a observação qualitativa de exposição
(`PROTOCOL_EXPOSURE_TEXTS`).

### Aviso de validade adaptativa — CORRIGIR

O lote 1 derivou este aviso de uma regra genérica (`unitCount` de BREVE ≤ 2). **Ela rejeitou.**
Substituir por:

- **Origem:** o campo `clinicalValidity` do protocolo **BRIEF** no catálogo. O aviso existe **apenas**
  quando aquele exercício declara ali a insuficiência para progressão. Hoje os 34 declaram, então
  aparece em todos os Breves — mas a regra passa a ser **por exercício**, não por contagem.
- **Texto exato, aprovado por ela — não reescrever:**

  > "Treino válido em dose reduzida. O desempenho desta sessão pode não ser suficiente, isoladamente,
  > para atualizar o nível adaptativo."

⚠️ **Nunca exibir "insuficiente para progressão" cru.** O terapeuta leria como se o Breve fosse
inadequado. O Breve é opção válida de treino; a limitação é só sobre a robustez da decisão adaptativa
naquela execução.

**Padrão vem selecionado** em exercício sem protocolo gravado.

⚠️ Trocar o protocolo precisa **atualizar a duração da sessão imediatamente** — o resumo no topo da
sidebar reflete a troca sem recarregar.

⚠️ **Não** oferecer campo editável de tentativas, séries, rodadas ou blocos. A quantidade é
**exibição**, nunca entrada.

### Unidade real — CORRIGIR `protocolLabel`

`protocolOptions().unitsLabel` **já usa** a unidade certa do catálogo (séries, rodadas, tentativas,
desafios completos). Mas o **`protocolLabel`** de `presentExercise`, que aparece em "Ver detalhes",
está com **"blocos" fixo para os 34** — "8 blocos" no Span (são séries), "2 blocos" no Jogo das
Torres (são desafios completos). Nasceu de um exemplo da spec da Fase 2b que virou valor fixo.

Corrigir para usar `minimumValidUnit` do catálogo, com plural correto. **Não inventar nem renomear
unidades:** Spans = séries · Restaurante = rodadas · Informação em Foco = tentativas · Supermercado =
rodadas · Jogo das Torres = desafios completos.

O teste da Fase 2b que valida `/\d+ blocos? · .+ min$/` **precisa ser atualizado** — ele consagra o
defeito.

## 4. Dose legada na interface

Quando o exercício tiver dose `kind: "legacyCustom"`, mostrar **no lugar do seletor**:

- título **"Configuração anterior de dose"**;
- o valor preservado, ex.: **"15 tentativas"**;
- a duração conforme o lote 1 — faixa aproximada **ou** "Duração aproximada — configuração
  anterior.";
- quatro ações: **Manter configuração atual** · **Converter para Breve** · **Converter para Padrão**
  · **Converter para Estendido**.

A conversão:

- só ocorre por **ação explícita** do terapeuta;
- **mostra antes o que mudará** (de "15 tentativas" para "8 séries · 6–7 min");
- **exige confirmação**;
- ao confirmar, grava `settings.protocol` e **remove `settings.trials`**;
- **não** altera nível, progresso nem histórico.

⚠️ **Abrir a tela não converte. Salvar outro campo não converte.** Só o botão de confirmação
converte.

## 5. Casos especiais

**Caminhos para a Meta** — `PROVISIONAL_PARAMETERS`. Exibir **"Configuração provisória"** discreto e
**não** apresentar o protocolo como definitivo. Manter o diálogo de atividades como está.

**Ordem da História** — `unlockIntruso`/`unlockFalta` ficam em "Modalidade e variantes", com nota de
que **hoje ainda acrescentam etapas** e que a separação entre dose e variedade virá na reformulação.
**Não fingir** que já são só variantes.

**Nível** — o slider **permanece**, na seção **"Configurações de nível"** (a 4ª), com o rótulo
**"Configuração de nível — revisão futura"**. Não removê-lo: a regra definitiva depende de histórico
do paciente, fora deste escopo. Não alterar seu comportamento.

## 6. Testes (puros, em `lib/prescription/`)

1. plano novo grava `PADRAO` explicitamente para cada exercício adicionado;
2. `buildPlanExercises` preserva `protocol` já existente;
3. abrir/reconstruir um plano legado **não** injeta `protocol` nem remove `trials`;
4. converter grava `protocol` e remove `trials` — **só** quando a conversão é pedida;
5. Breve/Padrão/Estendido no plano geram durações de sessão diferentes;
6. `allowReplay` continua sem alterar duração, carga ou fadiga;
7. modalidade continua recalculando a duração;
8. `level`/`startLevel` sobrevivem intactos a todas as operações acima.

Se a conversão exigir uma função pura (ex.: `convertLegacyDose(settings, protocol)`), criá-la em
`lib/prescription/` e testá-la lá — **nada de lógica dentro do componente**.

## 7. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 367 atuais + os novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos criados e alterados · diff resumido · o que cada seção da janela passou a mostrar · nº de
testes novos · confirmação de que abrir a tela não altera plano salvo · confirmação de que o
`disabled` do botão de salvar não mudou · e a **descrição textual precisa da nova janela "Ajustar"**
para um span novo, um span legado e um exercício comum. Não commitar.
