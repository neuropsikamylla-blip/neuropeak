# Tarefa: migrar 13 exercícios para o palco (Lote D1)

Projeto NeuroPeak. TypeScript strict, Tailwind 3, Vitest 4. Comentários em português.
**Não commite nada.** Deixe no worktree; quem revisa, aplica e commita é o Claude.

## Leia antes

- `docs/auditoria-layout/PADRAO-PALCO-SPEC.md` — o padrão, o mapa de fundos e as regras.
- `components/exercises/ExerciseStage.tsx` e `lib/layout/palco.ts` — o palco e as larguras.
- `lib/layout/palco.test.ts` — as provas existentes. **Não quebre nenhuma.**
- **Exemplos já migrados e aprovados** (o lote A): `memory/PadroesRotacao.tsx`,
  `memory/MatrizEspacial.tsx`, `executive/TorreHanoi.tsx`. Siga exatamente esse formato.

## Os 13 desta tarefa

| largura | exercício | arquivo |
|---|---|---|
| `compacto` | Span Numérico | `memory/SpanNumerico.tsx` |
| `compacto` | Letras Sequência | `memory/LetrasSequencia.tsx` |
| `compacto` | Lista c/ Distração | `memory/ListaDistracao.tsx` |
| `compacto` | Sequência de Itens | `memory/SequenciaItens.tsx` |
| `compacto` | Stroop | `executive/StroopTask.tsx` |
| `compacto` | Task Switching | `executive/TaskSwitching.tsx` |
| `compacto` | Desafio Orçamento | `executive/DesafioOrcamento.tsx` |
| `compacto` | Identificação de Símbolos | `processing/IdentificacaoSimbolos.tsx` |
| `medio` | Caça Item | `attention/CacaItemBarato.tsx` |
| `medio` | Dupla Tarefa | `attention/DualTask.tsx` |
| `medio` | Trilha Visual | `attention/TrilhaVisual.tsx` |
| `medio` | Mudança de Regras | `executive/MudancaRegras.tsx` |
| `amplo` | Busca Rápida | `processing/CorridaContraOTempo.tsx` |

(caminhos relativos a `components/exercises/`)

## O que fazer em cada um

1. Trocar o `<div>` raiz por `<ExerciseStage width="..." background={...}>`, com a largura da
   tabela acima.
2. **O fundo não muda.** Se hoje é `pal.bg` (classe Tailwind de tema), veja a regra 4 abaixo.
   Se é uma cor/gradiente em `style`, passe o valor para `background`.
3. Remover do raiz o que o palco faz: `min-h-screen`, `mx-auto`, `overflow-y-auto`,
   `flex items-center justify-center`, o padding de tela e o `max-w-*` **de container**.
   `max-w-*` de elemento interno fica.
4. **⚠️ Fundo que é classe Tailwind, não cor.** Vários usam `${pal.bg}` (ex.:
   `bg-slate-50`). O palco só aceita `background` como string CSS. Nesses casos:
   **acrescente ao `ExerciseStage` uma prop `backgroundClassName?: string`**, aplicada no
   mesmo `div` do `background`:
   ```tsx
   <div className={`absolute inset-0 overflow-auto ${backgroundClassName ?? ""}`} style={...}>
   ```
   e passe `backgroundClassName={pal.bg}` no exercício. Não converta classe em hexadecimal
   "no olho" — a cor tem de continuar sendo a mesma variável de tema.
5. **Arquivos com MAIS DE UM `min-h-screen`** (Span Numérico, Letras, Lista, Sequência de
   Itens, Stroop têm dois): são telas diferentes do mesmo exercício (tutorial interno,
   feedback, fim). **Cada uma ganha seu próprio palco**, com a mesma largura. Nenhum
   `min-h-screen` pode sobrar no arquivo.
6. Não mexa em mais nada: nem tamanho de peça, nem espaçamento interno, nem lógica.

## Armadilha — confira antes de fechar cada arquivo

O palco é `absolute inset-0`. Quem usar `position: absolute` dentro dele precisa de um
ancestral `relative` **dentro do palco**. Procure `absolute` em cada componente e confirme.
Faltando, adicione `relative` no container do próprio exercício — nunca no palco.

## Teste

Estenda o teste `"mantém os exercícios migrados centralizados no palco"` de
`lib/layout/palco.test.ts` para cobrir também estes 13, com o nome do exercício na mensagem
de erro e a largura esperada de cada um. Mantenha os testes que já existem.

## Prova de aceite

```
npx tsc --noEmit      # exit 0
npm run test          # verde
npm run build         # exit 0
```

Sem `node_modules` no clone, **diga isso** em vez de afirmar que passou.

## Fora de escopo

MOT, Labirinto, Ordem da História (medem `window.innerWidth`); Semáforo, Tempo de Reação,
Certo ou Errado (fundo dinâmico que pisca como feedback); `focus-agents` (tela cheia por
desenho); `TutorialBase.tsx`; e os 6 do lote A, já migrados.
