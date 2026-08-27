# Tarefa: palco padrão dos exercícios + correção do MOT

Projeto NeuroPeak (Next.js 15 App Router, React 18, TypeScript strict, Tailwind 3, Vitest 4).
Interface 100% pt-BR; identificadores em inglês; comentários em português.

**Não commite nada.** Deixe as mudanças no worktree. Quem revisa, aplica e commita é o Claude.

---

## Contexto (leia antes)

`components/exercises/ExerciseWrapper.tsx:174` é o container de toda tela de exercício:

```tsx
<div className={`${s.bg} p-4 flex items-center justify-center relative overflow-hidden`}>
```

onde `s.bg` contém `min-h-screen`. Cada exercício, dentro dele, declara **outro**
`min-h-screen`. Com o filho já medindo 100vh, o `items-center` do pai não tem folga para
centralizar, e o `p-4` do pai soma 32px por fora — daí toda tela rolar um pouco e o fundo do
tema vazar numa faixa nas bordas.

A spec completa do padrão está em `docs/auditoria-layout/PADRAO-PALCO-SPEC.md`. **Leia.**

---

## Tarefa A — criar `components/exercises/ExerciseStage.tsx`

Componente novo, irmão de `ExerciseProgressBar.tsx` (siga o estilo daquele arquivo:
`"use client"`, comentário de cabeçalho explicando a razão de ser, sem dependências novas).

```tsx
export type StageWidth = "compacto" | "medio" | "amplo";

export const LARGURAS_PALCO: Record<StageWidth, number> = {
  compacto: 640,
  medio: 960,
  amplo: 1280,
};

export function ExerciseStage({
  width,
  background,
  children,
}: {
  width: StageWidth;
  background?: string;
  children: React.ReactNode;
}) { ... }
```

Estrutura de saída **exatamente** esta (a spec explica cada escolha; não improvise outra):

```tsx
<div className="absolute inset-0 overflow-auto" style={background ? { background } : undefined}>
  <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
    <div className="w-full" style={{ maxWidth: LARGURAS_PALCO[width] }}>
      {children}
    </div>
  </div>
</div>
```

Sem `min-h-screen` em lugar nenhum do arquivo. Sem `mx-auto`. `background` ausente = fundo
transparente (o exercício herda o tema).

## Tarefa B — corrigir o MOT (`components/exercises/attention/MOT.tsx`)

**Defeito:** na montagem, `useEffect(() => { ...; startRound(0); }, [])` (linha ~175) sorteia
as bolas usando `arenaRef.current`. Esse ref é escrito **durante o render**, e o
`useLayoutEffect` que mede a tela só chama `setDims(...)` — o que apenas agenda um novo
render. Quando `startRound(0)` roda, `dims` ainda é o inicial `{w:320}`; com
`ARENA_SCALE_MIN = 0.55`, a primeira rodada nasce numa arena de ~176×116px, enquanto o quadro
desenhado já é o remedido (~1100px). Resultado: **todas as bolas amontoadas no canto superior
esquerdo** de uma arena grande e vazia, em toda primeira rodada.

**Correção exigida:** o sorteio da primeira rodada só pode acontecer **depois** que a tela foi
medida. Introduza um estado/flag de "já medi" que o `useLayoutEffect` liga junto com o
`setDims`, e faça o effect de montagem esperar por ela antes de chamar `startRound(0)`.

Restrições:
- `begin()` e `startTime.current` continuam onde estão (o cronômetro da sessão não muda).
- A limpeza (`stopRaf`, `stopTimer`) continua garantida.
- Não altere `lib/mot/scene.ts`, nem `ASPECT`, nem `ARENA_SCALE_MIN`, nem a física.
- Não introduza sorteio duplo: a rodada 0 tem de nascer **uma vez só**.

## Tarefa C — os testes (é onde a prova mora)

O Vitest deste projeto roda em `environment: "node"` e só coleta `lib/**/*.test.ts` (ver
`vitest.config.ts`). **Não instale dependências novas** e não tente renderizar React. A prova
é por varredura de arquivo — é o padrão desta casa. Crie `lib/layout/palco.test.ts` com:

1. **`ExerciseStage` não declara `min-h-screen`** — leia o arquivo e conte ocorrências; espere 0.
2. **`ExerciseStage` tem as três larguras** 640/960/1280, importadas de `LARGURAS_PALCO`
   (importe o objeto de verdade, não copie os números no teste).
3. **O palco é `absolute inset-0`** — se alguém trocar por `fixed` ou `relative`, a rolagem de
   32px e a faixa no topo voltam. O teste falha se a string sumir.
4. **MOT: a rodada 0 não nasce num effect de dependência vazia.** Leia
   `components/exercises/attention/MOT.tsx` e prove que **não existe** um `useEffect` com deps
   `[]` que chame `startRound(0)`. Prove pela **ausência**, contando ocorrências — e escreva o
   teste de modo que ele falhe se a linha antiga voltar (verifique injetando mentalmente o
   código antigo; se o teste passaria com ele, o teste está errado).

Comentário em cada teste dizendo **que defeito real ele impede de voltar** — não o que ele faz.

---

## Prova de aceite (rode e cole a saída no relatório)

```
npx tsc --noEmit          # exit 0
npm run test              # tudo verde, incluindo os novos
npm run build             # exit 0
```

## Fora de escopo (não faça)

- **Não migre nenhum exercício** para o palco ainda. Isso vem depois, em lotes, com
  verificação visual. Esta tarefa entrega a peça e a prova, nada mais.
- Não mexa em cor, fundo ou tamanho de peça de exercício nenhum.
- Não altere `ExerciseWrapper.tsx`.
