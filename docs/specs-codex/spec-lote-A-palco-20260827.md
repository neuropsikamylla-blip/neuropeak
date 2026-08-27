# Tarefa: migrar 6 exercícios para o palco (Lote A — cards centralizados)

Projeto NeuroPeak. TypeScript strict, Tailwind 3, Vitest 4. Comentários em português.
**Não commite nada.** Deixe no worktree; quem revisa, aplica e commita é o Claude.

## Leia antes

- `docs/auditoria-layout/PADRAO-PALCO-SPEC.md` — o padrão e o mapa de fundos.
- `components/exercises/ExerciseStage.tsx` — o palco, já existe e está em uso pelo teste.
- `lib/layout/palco.ts` — as larguras canônicas.
- `lib/layout/palco.test.ts` — as provas já existentes; **não quebre nenhuma**.

## Os 6 desta tarefa (todos `width="medio"`)

| exercício | arquivo | fundo que DEVE continuar igual |
|---|---|---|
| Padrões com Rotação | `components/exercises/memory/PadroesRotacao.tsx` | `#020617` |
| Cubo Corsi | `components/exercises/memory/CuboCorsi.tsx` | `#F4F7FB` (hoje em CSS inline) |
| Torre de Hanói | `components/exercises/executive/TorreHanoi.tsx` | `#F3F4F6` |
| Grade Dedutiva | `components/exercises/executive/DeductiveGrid.tsx` | `rootBg` (bege) |
| Jogo da Memória | `components/exercises/memory/JogoMemoria.tsx` | `#ffffff` |
| Matriz Espacial | `components/exercises/memory/MatrizEspacial.tsx` | o que já está lá |

## O que fazer em cada um

1. Trocar o `<div>` raiz (o que tem `min-h-screen`, ou `minHeight: "100vh"` no caso do Cubo
   Corsi) por `<ExerciseStage width="medio" background={...}>`.
2. O fundo que estava no raiz vai para a prop `background`. **A cor não muda.** Se hoje é
   `#F3F4F6`, continua `#F3F4F6`. Se hoje é um objeto (`rootBg`), passe o valor da cor.
3. Remover, do container raiz, o que o palco agora faz: `min-h-screen`, `mx-auto`,
   `flex items-center justify-center`, `overflow-y-auto`, `p-4 pt-6` e o `max-w-*` de
   container. **`max-w-*` de elemento interno fica** (botão, coluna, imagem).
4. **Não mexa em mais nada.** Nem tamanho de peça, nem espaçamento interno, nem lógica.

## Armadilha específica — não caia nela

O `ExerciseStage` é `absolute inset-0`. Quem estiver **dentro** dele e usar
`position: absolute` sem um pai `relative` vai se posicionar em relação ao palco, não à peça.
Antes de terminar cada arquivo, procure `absolute` no componente e confirme que cada um tem
um ancestral `relative` **dentro** do palco. Se não tiver, adicione `relative` no container
apropriado do próprio exercício — nunca no palco.

## Teste (acrescente a `lib/layout/palco.test.ts`, sem apagar os que já existem)

Um teste que varre os **seis** arquivos e prova, para cada um:
- `min-h-screen` aparece **0 vezes** (e `minHeight: "100vh"` também, para o Cubo Corsi);
- o arquivo contém `ExerciseStage` e `width="medio"`.

Escreva-o percorrendo uma lista de caminhos, com o nome do exercício na mensagem de erro —
quem ler a falha precisa saber QUAL exercício regrediu. Comentário dizendo que defeito real
o teste impede de voltar (a tela colada no topo e a faixa de fundo do tema nas bordas).

## Prova de aceite

```
npx tsc --noEmit      # exit 0
npm run test          # verde, incluindo os novos
npm run build         # exit 0
```

Se não houver `node_modules` no clone, **diga isso no relatório** em vez de afirmar que
passou — o Claude roda as provas no repositório real de qualquer forma.

## Fora de escopo

Não toque em MOT, Labirinto, Ordem da História (medem `window.innerWidth`, vão em outro
lote), nem em Semáforo, Tempo de Reação, Certo ou Errado (fundo dinâmico, exigem uma prop
que o palco ainda não tem), nem em `focus-agents` (tela cheia por desenho).
