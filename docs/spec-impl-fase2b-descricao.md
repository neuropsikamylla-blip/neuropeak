# IMPLEMENTAÇÃO — FASE 2b: descrição curta de volta à linha principal

Ajuste visual pedido por ela depois de aprovar tecnicamente a Fase 2. A Fase 2 está commitada e é a
base: `lib/prescription/presentation.ts`, `components/plano/prescription/*`, `ExerciseCard`,
`ExerciseRow`, `PlanBuilderSidebar`.

Não commitar.

## O problema

A Fase 2 empurrou a **descrição do exercício** para dentro de "Ver detalhes". Ela quer a descrição
de volta na linha principal, curta e truncada — é por ela que o terapeuta reconhece a finalidade da
atividade ao escolher.

## PROIBIÇÕES

**Não alterar:** os 18 alertas do núcleo · `validation.ts` · `interpreter.ts` · `duration.ts` ·
`load.ts` · `catalog.ts` · `types.ts` · APIs · banco · migrations · formato salvo · páginas do
paciente · `lib/adaptive.ts` · **`package.json`** · **`vitest.config.ts`**.

**Não agrupar alertas** — o agrupamento visual é a Fase 3, decisão dela. Nada de fundir, esconder ou
limitar ocorrências agora.

**Não instalar dependências.**

**O botão de salvar não muda:** `disabled={saving || items.length === 0}`.
`lib/prescription/__tests__/save-button-guard.test.ts` precisa continuar passando sem edição.

Os **330 testes atuais não podem quebrar**.

## Arquivos permitidos

- **alterar** `lib/prescription/presentation.ts` + `presentation.test.ts`
- **alterar** `components/plano/prescription/ExercisePrescriptionMeta.tsx`
- **alterar** `components/plano/ExerciseCard.tsx` · `ExerciseRow.tsx` · `PlanBuilderSidebar.tsx`

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. `presentation.ts` — dois campos novos em `PresentedExercise`

Acrescentar (sem remover nem renomear nenhum campo existente):

- **`protocolLabel: string`** — o protocolo PADRÃO do exercício em texto amigável, a partir de
  `definition.protocols.PADRAO` (`unitCount`, `durationMinutes`, `durationText`). Exemplo de forma:
  `"Protocolo padrão: 3 blocos · ~6 min"`. Usar `durationText` quando ele existir, já que preserva o
  texto de origem.
- **`cognitiveProfileLabel: string`** — perfil cognitivo a partir de `definition.mechanicalPrimary` e
  `definition.associatedCognitiveProfiles`. Exemplo de forma:
  `"Atenção sustentada · também recruta: memória de trabalho, velocidade de processamento"`.
  Quando `associatedCognitiveProfiles` estiver vazio, mostrar só o primário.

Os identificadores do catálogo podem vir em caixa alta ou com underscore. **Nenhum código técnico
pode chegar ao terapeuta** — converter para texto legível em português. O teste 11 da Fase 2, que
varre `/[A-Z]{3,}_[A-Z_]+/` nos textos visíveis, precisa continuar passando **incluindo estes dois
campos novos**.

## 2. `ExercisePrescriptionMeta.tsx` — nova hierarquia

Passa a receber também **`description: string`** (a descrição do exercício, que vem de
`EXERCISE_DEFINITIONS`, não do catálogo de prescrição).

**Linha principal**, nesta ordem:

1. nome oficial (já é responsabilidade do componente pai — não mexer);
2. **descrição curta**: `line-clamp-1` (uma linha), texto pequeno e discreto, com `title` completo
   para o terapeuta ler no hover;
3. `modelo · dose · duração` — compacto, como já está;
4. etiquetas de **carga** e **fadiga** — como já está;
5. `Ver detalhes`.

⚠️ A altura do cartão não pode crescer muito: a descrição substitui espaço, não se soma. Uma linha,
truncada, sem quebra.

**Dentro de "Ver detalhes"**, nesta ordem:

- descrição **completa** (sem truncamento);
- **perfil cognitivo** (`cognitiveProfileLabel`);
- modelo de execução;
- **protocolo** (`protocolLabel`);
- carga · fadiga · interferência;
- modalidade, **só quando aplicável**;
- o `details` extra que o componente pai já injeta (subdomínio, chips secundários).

Rotular cada item, para não virar uma sopa de texto solto.

## 3. Componentes

### `ExerciseRow.tsx` (biblioteca)

Hoje a descrição está dentro do `details` que ele injeta. **Tirar de lá** e passar por
`description={exercise.description}`. O `details` injetado passa a conter só os chips secundários.

Manter intactos: as colunas de dificuldade, a coluna de duração, o botão de adicionar/remover e o
bloco `sm:hidden`.

### `ExerciseCard.tsx` (plano em construção)

Hoje **não** recebe descrição. Acrescentar a prop `description: string` e repassá-la. Em
`PlanBuilderSidebar.tsx`, passar `description={ex.description}` (vem de `exDef(id)`, já disponível
em `items`).

Manter intactos: reordenar, ajustes, remover, o diálogo do Caminhos para a Meta e o `SubdomainTag`
que já vai no `details`.

## 4. Testes

Em `presentation.test.ts`, acrescentar:

1. `protocolLabel` presente e legível nos 34 exercícios do catálogo;
2. `cognitiveProfileLabel` presente e legível nos 34;
3. exercício **sem** perfis associados mostra só o primário, sem lixo de pontuação sobrando;
4. a varredura de código técnico existente passa a cobrir também os dois campos novos.

## 5. Provas

```
npx tsc --noEmit     # exit 0
npx vitest run       # 330 atuais + os novos, TODOS passando
npm run build        # exit 0
```

## Entrega

Arquivos alterados · o texto exato gerado por `protocolLabel` e `cognitiveProfileLabel` para **três
exercícios de modelos diferentes** · confirmação de que o guard do botão de salvar passou sem edição ·
nº de testes novos. Não commitar.
