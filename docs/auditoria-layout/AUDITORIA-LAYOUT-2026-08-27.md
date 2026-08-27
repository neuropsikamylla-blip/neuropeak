# Auditoria de layout dos exercícios — 27/ago/2026

> Pedido dela: *"queria que a distribuição deles na tela fosse centralizada e espaçada em
> tamanho para ficar algo elegante e bonito"*. Oito capturas anexadas (MOT, Matriz com
> Rotações, Labirinto, Cubo Corsi, Jogo das Torres, Grade Dedutiva).

## Resumo em uma frase

Não são 33 problemas de estética independentes: são **três defeitos estruturais** que se
repetem, mais **um bug funcional no MOT**. A correção é de arquitetura, não de retoque.

---

## Defeito 1 — `min-h-screen` empilhado (a causa da tela colada no topo)

Duas camadas reivindicam a altura da tela inteira ao mesmo tempo:

| camada | arquivo | classe |
|---|---|---|
| wrapper | `components/exercises/ExerciseWrapper.tsx:174` | `min-h-screen p-4 flex items-center justify-center` |
| exercício | cada componente | `min-h-screen ...` (28 dos 35 arquivos) |

O filho já mede 100vh, então o `items-center` do pai **não tem folga para centralizar** —
ele centraliza um bloco que já ocupa tudo. O `p-4` do pai soma 32px por fora, e é por isso
que **toda tela de exercício rola ~32px** e aparece aquela faixa escura no topo das capturas:
é o fundo do tema vazando por baixo do fundo próprio do exercício.

## Defeito 2 — cada exercício inventa a própria largura

Nenhuma escala compartilhada. Doze valores diferentes em uso:

`max-w-xs`(320) · `max-w-sm`(384) · `max-w-md`(448) · `max-w-lg`(512) · `max-w-xl`(576) ·
`max-w-2xl`(672) · `[300px]` · `[380px]` · `[560px]` · `[600px]` · `[760px]` · `[1120px]` ·
`[1180px]` · `[1480px]` — e ainda `maxWidth: 440/460/500/540` em CSS inline.

Numa tela de 1900px, a **Grade Dedutiva** (`max-w-sm`) usa 20% da largura e o
**Estacionamento** (`max-w-xs`) usa 17%. É exatamente a captura 8: um cartãozinho no alto
de um deserto bege.

## Defeito 3 — três dialetos de layout convivendo

| família | quantos | comportamento | exercícios |
|---|---|---|---|
| **A. cola no topo** | 21 | `flex flex-col items-center` sem `justify-center`, ou `overflow-y-auto` + `mx-auto` | MOT, Torre de Hanói, Labirinto, Grade Dedutiva, Trilha Visual, Jogo da Memória, Matriz Espacial, Busca Rápida, Mudança de Regras, Dupla Tarefa, Informação em Foco, Compra Multifuncional, Desafio Cidade, Desafio Orçamento, Task Switching, Investigadores, Vigilância, Certo ou Errado, Semáforo, Tempo de Reação, Caça Item |
| **B. centraliza, mas estreito** | 8 | `items-center justify-center` ✅ com teto de 320–576px | Estacionamento, Stroop, Letras Sequência, Lista c/ Distração, Padrões com Rotação, Sequência de Itens, Span Numérico, Identificação de Símbolos |
| **C. CSS inline próprio** | 6 | `minHeight:"100vh"` + `maxWidth:440..500` em `style=` | Cubo Corsi, Ordem da História, Sequência Temporal, Restaurante, Supermercado, Focus (este usa `fixed inset-0`, caso à parte) |

## Defeito 4 (funcional, não estético) — MOT: as bolas nascem numa arena que já não existe

`components/exercises/attention/MOT.tsx:175-181`

```
useEffect(() => { ...; startRound(0); }, []);   // gera as bolas na montagem
```

`startRound` usa `arenaRef.current`, que é escrito **durante o render**. O
`useLayoutEffect` que mede a tela chama `setDims(...)` — mas isso só agenda um novo render.
Quando `startRound(0)` roda, `dims` ainda é o valor inicial `{w:320}`, e com
`ARENA_SCALE_MIN = 0.55` a arena de nascimento é de **176×116px**. O quadro desenhado na
tela já é o remedido (~1100px).

Resultado exato das capturas 1 e 2: **todas as bolas amontoadas no canto superior esquerdo**
de uma arena enorme e vazia. Não é escolha de design — é uma corrida entre a medição e o
sorteio. Vale para a primeira rodada de toda sessão.

---

## O que NÃO está quebrado (não mexer sem falar com ela)

- **Fundos próprios** de 20 exercícios (bege da Grade Dedutiva, `#020617` da Matriz,
  `#F3F4F6` do Hanói, aquarelas da Compra). Vários foram aprovados por ela em sessões
  anteriores. Unificar tudo ao tema é decisão dela, não consequência técnica.
- **Focus Agentes** (`fixed inset-0`): tela cheia é intencional e funciona.
- **Labirinto**: o tabuleiro já usa a altura disponível; só falta centrar verticalmente.

## Prova de estado

- Levantamento por `grep` sobre os 35 arquivos em `components/exercises/*/`.
- Contagens desta auditoria conferidas em 27/ago/2026, sobre `main` em `113b41f`, v2.90.0.
- ⚠️ **Ainda não rodei nada em navegador.** As capturas são a evidência visual; a leitura de
  código é a evidência da causa. O bug do MOT ainda não tem teste que o trave.
