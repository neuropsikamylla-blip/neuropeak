# Remover o Desafio Cidade do programa

> Decisão dela em 22/set/2026: *"Desafio da cidade eu cancelei ele, inclusive pode retirar ele do
> programa."* Mesmo rito do N-Back (12/ago).
> **Você NÃO commita.** Revisão, prova e commit são do VP.

## Por que a remoção é de baixo risco — já mapeado pelo VP

O exercício **já não chega ao paciente por nenhum caminho normal**:

- **fora do menu/taxonomia**: `grep` em `lib/domain-taxonomy.ts` e `lib/exercise-plan.ts` não retorna nada;
- **filtrado do plano do terapeuta**: `app/(therapist)/pacientes/[id]/plano/page.tsx:68` já faz
  `.filter((id) => id !== "desafio-cidade")`;
- **marcado no catálogo canônico** como `REMOVED_FROM_CURRENT_CATALOG`
  (`docs/architecture/CANONICAL_EXERCISES.md:82`).

Sobra como **código morto** mais uma rota direta. É isso que sai.

## O que remover — os 7 pontos de código vivo, mapeados

| arquivo | o que há |
|---|---|
| `components/exercises/executive/DesafioCidade.tsx` | o componente inteiro (1.147 linhas) |
| `app/(patient)/treino/[exercicio]/page.tsx` | import dinâmico (~102), instruções (~233), `case` do switch (~739), id na lista (~771) |
| `app/(therapist)/pacientes/[id]/plano/page.tsx` | o `.filter` da linha 68 — **some junto**, porque deixa de ter função |
| `app/revisar-layout/page.tsx` | import (~36), entrada do mapa (~78), link de navegação (~120) |
| `types/index.ts` | entrada em `EXERCISE_DEFINITIONS` (~298) |
| `lib/layout/palco.test.ts` | a linha da lista de telas (~67) |
| `lib/vp-prova-feedback.test.ts` | a leitura do arquivo (~53) |

## ⚠️ O que NÃO fazer

- ❌ **Não toque no banco de dados.** Pode haver `Session` e `ExerciseConfig` com
  `exerciseId: "desafio-cidade"` de uso antigo. Esses registros **ficam** — são histórico clínico do
  paciente, e apagá-los seria perder dado. Ficam órfãos e inofensivos.
- ❌ Não remova as menções em documentos históricos (`docs/auditoria/*`, `PROGRESSO.md`,
  `AUDITORIA-*.md`, colheitas) — são registro do que aconteceu, não código.
  **Exceção:** atualize `CLAUDE.md`, `docs/ARCHITECTURE.md` e `BACKLOG.md`, que descrevem o estado
  ATUAL e passariam a mentir.
- ❌ Não mexa em nenhum outro exercício.

## Testes

1. **Prova de ausência**, por contagem zero: `desafio-cidade` e `DesafioCidade` não aparecem em
   nenhum arquivo `.ts`/`.tsx` fora de `docs/` e de arquivos de histórico. Conte ocorrências —
   presença não serve de prova aqui.
2. **A contagem de exercícios cai em 1** onde houver teste que trave contagem. Procure por testes de
   contagem e **atualize o número**, não contorne o teste.
3. Os testes existentes continuam passando — em especial `lib/layout/palco.test.ts` e
   `lib/vp-prova-feedback.test.ts`, que citam o arquivo e vão precisar da linha removida.

## Critério de pronto

1. Os 7 pontos limpos; o componente apagado.
2. `CLAUDE.md`, `ARCHITECTURE.md` e `BACKLOG.md` sem descrever o exercício como existente.
3. Prova de ausência por contagem; suíte verde.
4. `RELATORIO-CODEX.md` dizendo o que removeu, o que deixou de propósito, e qualquer referência que
   tenha encontrado além das mapeadas aqui.
