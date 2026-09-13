# Spec — Rastreamento com Objetos: densidade que cresce, e a bola que cabe na tela

> Origem: pedido dela em 12/set/2026 — *"rastreamento com objetos esta excelente... mas acho que a
> partir de 3 - 4 bolas podemos deixar mais dificil, aumentando a quantidade de distratores"*.
> Duas decisões dela nesta data: **(1)** densidade crescente é o eixo escolhido; **(2)** a bola
> **encolhe junto com a arena, com teto de 22 px**, para que o desktop que ela aprovou fique idêntico
> e o celular deixe de nascer quebrado.
>
> Medição que fundamenta tudo: `docs/mot/AUDITORIA-PROGRESSAO-MOT-20260912.md`.

## 0. O que NÃO muda (congelado)

Fora do escopo. Tocar em qualquer um destes itens reprova a entrega.

1. **Número de alvos por nível** — `targetsForLevel` fica como está (3 no nível 1 … teto 6).
2. **Velocidade** — `ballSpeed` e `speedStepForLevel` intactos. A velocidade é px/frame e hoje não
   acompanha o tamanho da arena; isso é pendência **medida e registrada**, não desta fatia, porque
   mexer nela alteraria o desktop que ela aprovou sem verificação visual.
3. **Duração do rastreio** (`trackDuration`) e **escala da arena** (`arenaScaleForLevel`).
4. **Progressão de nível** — 3 rodadas perfeitas seguidas sobem 1; erro zera a série.
5. **Dosagem** — `useBlocoDeTreino("mot", difficulty)`, barra por tempo, sem porcentagem.
6. **Aparência da bola** no desktop: cor, borda, o ✓ da seleção, o pulso do alvo na memorização.
7. **O fluxo de fases** memorize → track → identify e o botão de confirmar.

## 1. Raio proporcional à arena

Hoje `BALL_RADIUS = 22` é constante em qualquer tela. Numa arena de 320 px isso é **13,8% da
largura**; numa de 1440, **3%**. A bola é proporcionalmente 4,5× maior no celular — e é por isso que
as bolas não cabem lá.

```ts
export const BALL_RADIUS = 22;              // teto — o raio do desktop, que ela aprovou
export const BALL_RADIUS_MIN = 15;
export const ARENA_W_RAIO_PLENO = 600;      // daqui para cima, raio pleno
export const ARENA_W_RAIO_MIN = 320;        // largura mínima da arena no componente

export function ballRadius(arenaWidth: number): number {
  if (arenaWidth >= ARENA_W_RAIO_PLENO) return BALL_RADIUS;
  const t = Math.max(0, Math.min(1,
    (arenaWidth - ARENA_W_RAIO_MIN) / (ARENA_W_RAIO_PLENO - ARENA_W_RAIO_MIN)));
  return Math.round(BALL_RADIUS_MIN + t * (BALL_RADIUS - BALL_RADIUS_MIN));
}
```

**Consequência exigida:** em arena ≥ 600 px o raio é **exatamente 22** — nada muda no desktop nem no
tablet. Abaixo disso encolhe até 15.

⚠️ **O raio deixa de ser constante e passa a ser dado de entrada.** `randomBalls` e `stepAll` usam
hoje a constante `BALL_RADIUS` internamente para nascer dentro da borda, para o clamp e para a
colisão. As duas passam a **receber o raio**. Um `stepAll` que continue usando 22 com bola de 15
deixa vão na borda e colide no ar.

## 2. Área de toque nunca encolhe

Com raio 15 a bola desenhada tem 30 px — abaixo do alvo de toque confortável. Hoje o toque é
`onClick` no próprio `<div>` da bola, então a área tocável **é** o círculo.

Isto é problema clínico, não de conforto: **erro de dedo entraria na acurácia**, e a acurácia
alimenta a engine adaptativa.

```ts
export const RAIO_TOQUE_MIN = 22;           // 44 px de diâmetro

export function ballTouchRadius(arenaWidth: number): number {
  return Math.max(RAIO_TOQUE_MIN, ballRadius(arenaWidth));
}

/** Bola cujo CENTRO está mais próximo do ponto, dentro do raio de toque. `null` se nenhuma —
 *  toque no vazio continua não selecionando nada. */
export function bolaNoPonto(
  balls: readonly Ball[], x: number, y: number, arenaWidth: number,
): number | null;
```

O componente passa a tratar o toque **na arena** (um handler no container, coordenadas relativas ao
retângulo da arena) e resolver por `bolaNoPonto`. A bola em si deixa de ter `onClick`.

**Regra de desempate obrigatória:** o centro mais próximo vence. Empate exato (distância idêntica)
resolve pelo **menor id**, para ser determinístico e testável.

## 3. Densidade de distratores que cresce

Hoje: `distratores = min(14, alvos × 2 + 2)` — a razão distrator/alvo **cai** de 3,00 (nível 0) para
2,33 (nível 7 em diante), e a ocupação da arena fica em 2,7%–3,8% em todos os níveis.

```ts
export const RAZAO_DISTRATORES_BASE = 3.0;
export const RAZAO_DISTRATORES_PASSO = 0.15;
export const RAZAO_DISTRATORES_TETO = 4.8;

export function razaoDeDistratores(level: number): number {
  return Math.min(RAZAO_DISTRATORES_TETO,
    RAZAO_DISTRATORES_BASE + RAZAO_DISTRATORES_PASSO * Math.max(0, level));
}

/** Total desejado pelo nível, ANTES do limite da arena. */
export function totalBallsDesejado(level: number): number {
  const alvos = targetsForLevel(level);
  return alvos + Math.round(alvos * razaoDeDistratores(level));
}

/** Total efetivo: o desejado, limitado pelo que caibe na arena. */
export function totalBalls(level: number, arenaWidth?: number, arenaHeight?: number): number {
  const desejado = totalBallsDesejado(level);
  if (arenaWidth == null || arenaHeight == null) return desejado;
  const cap = capacidadeDaArena(arenaWidth, arenaHeight, ballRadius(arenaWidth));
  return Math.max(targetsForLevel(level) + 1, Math.min(desejado, cap));
}
```

O piso `alvos + 1` existe para que nunca haja rodada sem nenhum distrator, por absurda que seja a
tela. Curva resultante na arena grande, **medida por simulação** (200 rodadas por nível):

| nível | distratores hoje → novo | encontros alvo-distrator hoje → novo | ocupação |
|---|---|---|---|
| 0 | 6 → **6** (idêntico) | 1,1 → 1,1 | 2,7% |
| 3 | 10 → **14** | 3,4 → 4,8 | 4,5% |
| 7 | 14 → **24** | 8,4 → **14,5** | 5,7% |
| 10 | 14 → **27** | 11,7 → **22,5** | 6,3% |
| 14 | 14 → **29** | 14,2 → **31,3** | 6,7% |

**O nível 0 sai idêntico de propósito:** o início não endurece, só a progressão.

## 4. Capacidade da arena — o travessão contra bola nascendo sobre bola

**O defeito que isto corrige já existe em produção hoje**, e não foi ela quem pediu: na arena de
320×211 o nível 7 pede 20 bolas onde cabem 15, as 300 tentativas de separação esgotam e nascem em
média **16,6 pares sobrepostos** — o primeiro frame os empurra numa explosão. Em 393 px são 7,9.

```ts
export const SEP_PISO_EM_RAIOS = 2.1;       // acima da tangência (2,0): nunca nasce sobreposto
export const FATOR_CAPACIDADE = 0.45;

/** Quantas bolas caibem respeitando o piso de separação. */
export function capacidadeDaArena(width: number, height: number, raio: number): number {
  const sep = SEP_PISO_EM_RAIOS * raio;
  return Math.max(3, Math.floor(FATOR_CAPACIDADE * (width * height) / (sep * sep)));
}
```

**`FATOR_CAPACIDADE = 0,45` é medido, não estimado.** A colocação por rejeição satura bem antes do
empacotamento hexagonal teórico. Medindo o maior `n` que o algoritmo coloca com 100% de sucesso em 40
sementes, o fator observado ficou entre **0,466** (768 px) e **0,516** (1100 px); 0,45 fica abaixo de
todos, com margem. *(Uma medição de 1440 px devolveu 0,343 — é artefato do limite de busca de 220
bolas, não valor real. Não usar.)*

## 5. Separação inicial que aperta com o nível

Hoje `Math.max(radius * 3, 78)` — **fixo em todos os níveis**. As bolas nascem tão espalhadas no
nível 16 quanto no 0.

```ts
export const SEP_INICIAL_DE = 3.5;          // em raios, no nível 0
export const SEP_INICIAL_ATE = 2.6;         // em raios, no nível pleno
export const SEP_INICIAL_PLENO_EM = 12;
export const FATOR_OCUPACAO = 0.65;

/** Separação desejada pelo nível, em px. */
export function separacaoDesejada(level: number, raio: number): number {
  const t = Math.max(0, Math.min(1, Math.max(0, level) / SEP_INICIAL_PLENO_EM));
  return (SEP_INICIAL_DE + (SEP_INICIAL_ATE - SEP_INICIAL_DE) * t) * raio;
}

/** Separação que o gerador usa: a desejada, reduzida ao que a arena permite, nunca abaixo do piso. */
export function separacaoEfetiva(
  level: number, raio: number, quantidadeDeBolas: number, width: number, height: number,
): number {
  const porBola = FATOR_OCUPACAO * Math.sqrt((width * height) / Math.max(1, quantidadeDeBolas));
  return Math.max(SEP_PISO_EM_RAIOS * raio, Math.min(separacaoDesejada(level, raio), porBola));
}
```

`FATOR_OCUPACAO = 0,65` é a inversa da capacidade (`sqrt(0,45) ≈ 0,67`), com margem: é a separação
máxima que ainda permite colocar `n` bolas naquela área.

## 6. Assinaturas que mudam

```ts
randomBalls(level, round, width, height, random?)
  → randomBalls(level, round, width, height, random?)      // mesma assinatura pública
```
Internamente `randomBalls` passa a: calcular `raio = ballRadius(width)`, `n = totalBalls(level, width,
height)`, `sep = separacaoEfetiva(level, raio, n, width, height)`, e usar **`raio`** (não a constante)
para nascer dentro da borda.

```ts
stepAll(balls, width, height)  →  stepAll(balls, width, height, raio)
```
O `raio` é obrigatório. Sem ele o clamp de borda e a colisão ficariam calibrados para 22 px enquanto a
bola tem 15.

No componente: `MOTBall` recebe `raio: number` por prop e deixa de importar `BALL_RADIUS`.

## 7. Prova de aceite — o que o teste tem de exigir

Escrita ANTES da implementação. Provar **ausência** onde o defeito morava, não só presença.

1. **Raio**: `ballRadius(600) === 22`, `ballRadius(1100) === 22`, `ballRadius(1440) === 22`
   (o desktop não muda); `ballRadius(320) === 15`; monotônico não-decrescente em toda a faixa
   320…1440; nunca acima de 22 nem abaixo de 15.
2. **Toque**: `ballTouchRadius(w) >= 22` para todo `w`; `bolaNoPonto` devolve a bola de centro mais
   próximo, `null` fora do raio de toque, e o **menor id** no empate exato.
3. **Densidade cresce**: `razaoDeDistratores` é estritamente crescente até o teto e nunca o passa;
   `totalBallsDesejado(0)` é **igual ao total de hoje no nível 0** (8 bolas: 2 alvos + 6) — o início
   não endurece; `totalBallsDesejado` não-decrescente em `level`.
4. **Nunca nasce sobreposto — a prova que interessa.** Para cada arena de {320, 393, 600, 768, 1100,
   1440} × níveis {0, 3, 5, 7, 10, 14, 16}, gerar **40 rodadas** com semente fixa e exigir **zero**
   pares de bolas a menos de `2 × raio` de distância. Este teste **falha contra o código de hoje**
   (320 px, nível 7 → ~16,6 pares): incluir um caso que documente isso.
5. **Capacidade respeitada**: `totalBalls(level, w, h) <= capacidadeDaArena(w, h, ballRadius(w))` para
   toda combinação; e `>= targetsForLevel(level) + 1`.
6. **Alvos preservados**: `targetsForLevel` dá exatamente os mesmos valores de hoje para 0…20, e o
   número de bolas com `isTarget` é sempre `targetsForLevel(level)`.
7. **Congelado**: `ballSpeed`, `speedStepForLevel`, `trackDuration` e `arenaScaleForLevel` devolvem
   para 0…20 exatamente os mesmos valores de hoje (tabela fixa no teste, não recalculada da função).
8. **Física coerente com o raio**: após 600 passos de `stepAll` com raio 15, nenhuma bola fica com
   centro a menos de `raio` da borda nem a mais de `width - raio`; idem com raio 22.
9. **Prova de ausência no fonte**: `MOTBall.tsx` não importa `BALL_RADIUS`; `MOT.tsx` chama
   `totalBalls` **com** as dimensões da arena (um `totalBalls(level)` sem arena no componente é
   reprovação, porque perde o travessão).

## 8. Arquivos

- `lib/mot/scene.ts` — todas as funções acima.
- `lib/mot/scene.test.ts` — ampliar com a prova de aceite da seção 7.
- `components/exercises/attention/MOT.tsx` — raio da arena, toque por proximidade, `stepAll` com raio.
- `components/exercises/attention/MOTBall.tsx` — raio por prop.

## 9. Dívida a corrigir de passagem

Dois comentários do `scene.ts` contradizem o código: `totalBalls` diz *"Teto em 10"* (o código tem
`min(14, …)`) e `arenaScaleForLevel` diz *"Começa em 55%"* (a constante é **0,75**). Atualizar os dois
para o que o código passa a fazer.

## 10. Fora desta fatia, registrado

1. **Velocidade proporcional à arena.** Hoje px/frame fixo: no celular as bolas cruzam a arena ~4,5×
   mais rápido em tempo relativo que no desktop. Mexer nisso muda o que ela aprovou e precisa da
   verificação visual dela.
2. **Encontros como parâmetro em vez de sorte.** No nível 7 a mesma configuração produz de 2 a 16
   encontros alvo-distrator. A densidade nova melhora a separação entre níveis vizinhos (o p10 do
   nível 7 sai de 5 para 10, contra p90 de 8 no nível 3), mas **não fecha** a sobreposição. Ela não
   escolheu este eixo agora.
3. **Teto de nível.** Do nível 14 em diante o exercício ainda satura, e o componente continua sem teto
   (`levelRef.current + 1`). Não escolhido agora.
