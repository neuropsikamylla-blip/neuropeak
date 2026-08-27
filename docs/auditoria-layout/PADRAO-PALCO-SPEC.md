# Padrão de palco dos exercícios (`ExerciseStage`) — spec

> Decidido por ela em 27/ago/2026, sobre a auditoria `AUDITORIA-LAYOUT-2026-08-27.md`:
> **três larguras por tipo de peça**, e **os fundos próprios ficam como estão** — corrige-se
> apenas o vazamento do fundo do tema nas bordas.

## O componente

`components/exercises/ExerciseStage.tsx` — irmão do `ExerciseProgressBar`, mesma filosofia:
uma peça só, igual em todas as telas.

```tsx
<ExerciseStage width="medio" background="#020617">
  {/* conteúdo do exercício, sem min-h-screen, sem mx-auto, sem max-w-* de container */}
</ExerciseStage>
```

### Contrato

| prop | valores | efeito |
|---|---|---|
| `width` | `"compacto"` \| `"medio"` \| `"amplo"` | teto de largura do conteúdo: **640 / 960 / 1280** px |
| `background` | string CSS, opcional | pinta a tela inteira; **omitido = transparente** (herda o tema, e o cérebro decorativo do wrapper aparece) |

### Estrutura obrigatória

```tsx
<div className="absolute inset-0 overflow-auto" style={{ background }}>
  <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
    <div className="w-full" style={{ maxWidth: LARGURAS[width] }}>
      {children}
    </div>
  </div>
</div>
```

Por que exatamente assim, e não de outro jeito:

- **`absolute inset-0`** — o `ExerciseWrapper` já é `relative min-h-screen ... p-4`. O palco
  absoluto sai do fluxo, então o wrapper mede exatos 100vh: **acaba a rolagem de 32px** que
  existia em toda tela de exercício. E, por cobrir o `p-4` do pai, **acaba a faixa escura no
  topo** que ela viu nas capturas.
- **`min-h-full` no filho** — centraliza quando o conteúdo cabe e **rola quando não cabe**.
  Um `h-full` puro cortaria o conteúdo alto; um `min-h-screen` traria a rolagem de volta.
- **`overflow-auto` no palco, não na página** — a rolagem, quando precisa existir, é interna.

## Classificação dos 33 exercícios

**Compacto (640px)** — peça única, teclado, estímulo central:
`span-numerico` · `span-numerico-inverso` · `letras-sequencia` · `lista-distracao` ·
`sequencia-itens` · `stroop-task` · `semaforo` · `tempo-reacao` · `certo-ou-errado` ·
`identificacao-simbolos` · `task-switching` · `desafio-orcamento` · `antes-depois`

**Médio (960px)** — grades, cartas, tabuleiros pequenos:
`matriz-espacial` · `matriz-espacial-inversa` · `padroes-rotacao` · `jogo-memoria` ·
`cubo-corsi` · `torre-hanoi` · `deductive-grid` · `estacionamento-logico` ·
`mudanca-regras` · `trilha-visual` · `ordem-historia` · `investigadores-sociais` ·
`caca-item-barato` · `vigilancia` · `dual-task` · `restaurante-ordem`

**Amplo (1280px)** — arena, cena, catálogo:
`mot` · `labirinto` · `desafio-supermercado` · `compra-multifuncional` ·
`informacao-em-foco` · `corrida-tempo` · `desafio-cidade`

**Fora do padrão (1):** `focus-agents` usa `fixed inset-0` de propósito — é tela cheia por
desenho e funciona. **Não migrar.**

## Regras da migração

1. O `<div className="min-h-screen ...">` raiz de cada exercício **some**, trocado pelo palco.
   O `background` que estava nele passa para a prop `background`.
2. `mx-auto` e `max-w-*` **de container** somem — quem manda na largura é o palco. `max-w-*`
   de elemento interno (um botão, uma coluna) fica.
3. **Nenhuma cor muda.** Se o exercício pintava `#F3F4F6`, continua `#F3F4F6`.
4. Peça pequena não estica: o palco define o **teto**, não a largura forçada. Quem já era
   estreito por desenho (o teclado do Span) segue estreito, agora centrado.
5. Cada lote termina com **verificação visual** antes do commit — regra dela para mudança em
   coisa já aprovada.

## Prova exigida

- Teste que varre `components/exercises/*/*.tsx` e **prova a ausência** de `min-h-screen` nos
  exercícios migrados (a lição de `licao-teste-prova-ausencia`: contar ocorrências, não só
  procurar presença).
- `npx tsc --noEmit` limpo e `npm run test` verde a cada lote.
