# Spec — migrar os 31 exercícios restantes para a dosagem global

Data: 2026-09-10
Etapa 5 do plano. ⚠️ **Ela LEVANTOU o portão da etapa 4 em 10/set**: quer testar a plataforma
inteira de uma vez, em vez de validar três pilotos antes. Registrado e assumido.

Base: `lib/exercise-dosage.ts`, `useBlocoDeTreino` e os **três pilotos já migrados**
(`Semaforo.tsx`, `CuboCorsi.tsx`, `TorreHanoi.tsx`) — **leia os três antes de começar**: eles são
o padrão a repetir, não um ponto de partida a reinventar.

## ⛔ Proibições

- ⛔ **NÃO mude a mecânica de exercício nenhum.** Esta é uma migração de **relógio e barra**.
  Se um exercício precisar de mudança de mecânica para migrar, **PARE e relate**.
- ⛔ **NÃO invente duração nova.** Quem tem exceção já está em `lib/exercise-dosage.ts`; quem não
  tem recebe o padrão 480/600. Se achar que um exercício precisa de exceção, **relate** em vez de
  criar.
- ⛔ **NÃO mexa na Grade** (`DeductiveGrid.tsx`) — ela migra na fatia dela, junto com o teto.
- ⛔ **NÃO use `if (exerciseId === ...)`** para comportamento. O id serve só para o componente se
  identificar ao hook, como a Torre faz: `useBlocoDeTreino("torre-hanoi", difficulty)`.

## 1. O que fazer em cada um dos 31

1. `useTimedProgress(...)` → `useBlocoDeTreino("<id-do-exercicio>", difficulty)`.
   ⚠️ O id é o **do catálogo** (`deductive-grid`, `cubo-corsi`, `mot`…). Confira em
   `lib/domain-taxonomy.ts` ou no `switch` de `app/(patient)/treino/[exercicio]/page.tsx` — **não
   invente a partir do nome do arquivo**. Um id errado faz o exercício cair no padrão em silêncio,
   e o de exceção perde a dose curta.
2. Onde o exercício hoje consulta `isTimeUp()` **para decidir se inicia rodada/desafio novo**, use
   **`podeIniciarNovoDesafio()`**. Onde ele consulta para **encerrar**, use **`atingiuTeto()`**.
   ⚠️ Essa distinção é a razão de existir a janela de tolerância: sem ela, o exercício corta o
   paciente no alvo, que é exatamente o que ela proibiu.
3. Renderizar `<ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />`
   no **topo da área do exercício**, logo abaixo do cabeçalho — a posição dos 28 que já a têm.
   ⚠️ **Seis não têm barra hoje** e passam a ter: `informacao-em-foco`, `compra-multifuncional`,
   `vigilancia`, `corrida-tempo`, `investigadores-sociais` (a Torre já foi).
4. Onde havia constante local de duração (`SESSION_MS`, `TARGET_MS`, `stroopDurationMin`), **remova
   a constante** — a fonte passa a ser a configuração.

## 2. Casos que exigem atenção, e por quê

- **`SpanNumerico`** não usa `isTimeUp` hoje: migre o relógio e a barra sem inventar encerramento.
- **`MatrizEspacialInversa`** e **`SpanNumericoInverso`** reusam o componente base — garanta que
  cada um passe **o próprio id**, não o do base. Se o base for compartilhado, o id vem por prop.
- **`StroopTask`** já teve `stroopDurationMin` movido para a configuração; só falta trocar o hook.
- **`Vigilancia`** hoje não destrutura `isTimeUp` — confira como encerra antes de mexer.

## 3. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 81 arquivos / 1057 testes — NÃO PODE CAIR
```
**NÃO rodar `npm run build`.** Sem `node_modules` no lab você não roda nada: **declare**.

Testes obrigatórios — os dois primeiros são de **completude**, e são o que prova a migração:

1. **Nenhum componente de exercício usa mais `useTimedProgress`** — varra
   `components/exercises/*/*.tsx` e exija zero ocorrências, **exceto** `DeductiveGrid.tsx`, que
   migra depois. Este teste é o que impede a migração ficar pela metade sem ninguém notar.
2. **Todo exercício renderiza `ExerciseProgressBar`** — varra e exija que cada componente que usa
   `useBlocoDeTreino` também renderize a barra.
3. Cada id usado em `useBlocoDeTreino` **existe no catálogo** — varra os literais e confira contra
   a taxonomia. Pega o erro de id que faria a dose cair no padrão em silêncio.
4. Os exercícios de exceção **continuam com a dose curta**: `tempo-reacao` e `semaforo` em 300/360,
   `informacao-em-foco` em 360/420, `stroop-task` variando 4→7 min.
5. `useTimedProgress` **continua exportado** (a Grade ainda o usa) e **sem alteração de assinatura**.
6. As provas do VP que já existem continuam passando: `lib/vp-prova-dosagem.test.ts`,
   `lib/grade/contrato-tela-aprovada.test.ts`, `lib/layout/palco.test.ts`.

## 4. Relatório

A tabela dos 31 com: id usado · dose resultante · onde a barra foi posta · se `isTimeUp` virou
`podeIniciarNovoDesafio` ou `atingiuTeto`. Mais: quais constantes locais removeu, e qualquer
exercício em que você **parou** por precisar mexer na mecânica.
