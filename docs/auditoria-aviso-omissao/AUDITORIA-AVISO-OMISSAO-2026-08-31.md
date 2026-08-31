# Auditoria — aviso de OMISSÃO nos exercícios

**Data:** 31/ago/2026 · **Tipo:** levantamento (nenhum componente foi alterado) · **Branch:** `main`

---

## 1. A regra

Em 31/ago/2026, vendo a Dupla Tarefa, ela disse:

> *"tirei esse rologio, nao precisa avisar é treino"*

O elemento era o símbolo **⏱** que aparecia no meio da arena quando um alvo passava **sem o paciente
tocar** — um aviso de OMISSÃO. Saiu na v2.98.5 (commit `dee21e1`), junto com a tinta âmbar do fundo.
O ✓ do acerto e o ✕ do toque errado **ficaram**, porque respondem a um gesto dela.

A regra generalizada: **o app não comenta o que o paciente deixou de fazer.**

É a extensão da regra de 28/ago (commit `d4596fa`, "Os 7 de memória"): sai a MENSAGEM de erro, o erro
em si continua visível. Registro em
`~/.claude/projects/-Users-kamyllahonorio-neuropeak/memory/principio-sem-dica-apos-instrucao.md`.

Ponto crítico herdado do commit modelo: **o que sai é o carimbo, nunca a medida.** Na Dupla Tarefa o
aviso saiu, mas `tapped:false` e `omTop` continuaram indo para o metadata da sessão. Por isso cada
achado abaixo diz, explicitamente, se remover o aviso perderia medida.

### Critério de classificação

| Classe | Definição |
|---|---|
| **AVISO PASSIVO** | A tela comenta uma NÃO-ação: o tempo esgotou, o alvo passou, a rodada expirou. O paciente não fez nada e o app carimba. **É o que se procura.** |
| **FEEDBACK DE AÇÃO** | O paciente tocou/arrastou/escolheu e a tela responde àquele gesto. **Fica.** |
| **AMBÍGUO** | Exercícios em que "não responder a tempo" É a resposta errada por desenho (tempo de reação, semáforo). A fronteira é decisão dela, não desta auditoria. |

---

## 2. O que foi varrido

Enumeração (sem partir de nenhuma contagem prévia):

```
find components/exercises -name "*.tsx" | wc -l      → 55
ls -1 lib/tutorial/definitions/*.tsx | wc -l         → 10
```

**65 arquivos `.tsx` varridos**, assim distribuídos:

| Pasta | Arquivos |
|---|---|
| `components/exercises` (raiz: wrapper, stage, barra, tutorial-base, ícones) | 10 |
| `components/exercises/attention` | 9 |
| `components/exercises/executive` | 12 |
| `components/exercises/executive/caminhos-meta` | 1 |
| `components/exercises/memory` | 14 |
| `components/exercises/processing` | 5 |
| `components/exercises/social` | 2 |
| `components/exercises/tutorial` | 2 |
| `lib/tutorial/definitions` | 10 |

Também foram varridos os `.ts` de `components/exercises/executive/caminhos-meta/` (index, persist,
settings, theme, usePlanState, usePointerDrag) e, por grep de strings de aviso, `lib/**` e `data/**`
— sem ocorrência.

**Método:** grep pelas pistas (`timeout`, `timeUp`, `tempo esgotad`, `Tempo!`, `expirou`,
`acabou o tempo`, `miss`, `omiss`, `perdeu`, `passou`, `não respondeu`, `⏱ ⏰ ⌛`, `Clock`, `Timer`,
`AlarmClock`, `expired`, `tooSlow`, `lento demais`, `Muito lento`, `faltou`, `esqueceu`, `omitid`) e,
em seguida, **leitura do trecho** — o grep sozinho mente: 42 arquivos casaram com as pistas e apenas
7 têm achado real. O caminho decisivo em cada caso foi rastrear **quem chama** a função que pinta a
tela: se a única origem é um `setTimeout`/`setInterval` sem gesto do paciente, é aviso passivo.

---

## 3. Achados

Ordenados por classificação: AVISO PASSIVO primeiro.

### AVISO PASSIVO (5)

#### A1 · `components/exercises/attention/FocusAgents.tsx:240`
- **Exercício:** Focus Agentes (`focus-agents`, atenção sustentada)
- **O que aparece:** faixa horizontal vermelha sobre a arena — fundo `rgba(220,38,38,0.94)`, texto
  branco, **"✗ Passou! Toque mais rápido."** — por 1250 ms (render em `FocusAgents.tsx:469-473`).
- **Gatilho:** modo QUEDA. O RAF detecta que o personagem-alvo saiu por baixo da arena
  (`c.y > H + 12`) sem toque. Nenhum gesto do paciente participa.
- **Classificação:** AVISO PASSIVO — o app carimba a não-ação e ainda dá ordem de estratégia
  ("Toque mais rápido"), que é dica depois da instrução.
- **A medida se perde?** **Não.** `registra(false, null, true)` (linha 239) incrementa
  `totais.omissoes`, que vai ao metadata como `omissions` (linha 197). O registro é independente do
  `setFb`.

#### A2 · `components/exercises/attention/FocusAgents.tsx:323`
- **Exercício:** Focus Agentes (`focus-agents`)
- **O que aparece:** mesma faixa vermelha, **"✗ Acabou o tempo!"**, por 1450 ms — **e mais:** o alvo
  que ele não tocou é **ampliado** (`big`) e todos os outros personagens são **escurecidos** (`dim`)
  — `FocusAgents.tsx:460-461`. O app entrega a resposta de graça.
- **Gatilho:** modo ESPALHADO. `omissaoRef` estoura: `max(4600, 9000 − passo×420) ms × nº de alvos`
  (linhas 313-317), sem nenhum toque.
- **Classificação:** AVISO PASSIVO — dupla violação: carimba a omissão **e** revela o alvo.
- **A medida se perde?** **Não.** Mesmo caminho do A1: `registra(false, null, true)` → `omissions`.

#### A3 · `components/exercises/executive/Labirinto.tsx:1013` (e a linha 997)
- **Exercício:** Labirinto (`labirinto`, funções executivas / planejamento)
- **O que aparece:** painel escuro cobrindo a arena (`rgba(8,12,24,0.92)`) com o título
  **"⏰ Tempo!"** em vermelho `#f87171`, a eficiência em %, a tabela de métricas (movimentos, becos,
  retornos, colisões), a pontuação, e a frase de recomendação **"Tente planejar a rota antes de
  andar — observe o caminho inteiro."** (linha 997). Fica até o paciente clicar em "Próximo
  labirinto →".
- **Gatilho:** `finishMaze(false)` — e **essa é a única origem**: a chamada com `false` está em
  `Labirinto.tsx:793`, dentro do efeito `elapsed >= timeLimit`. O caminho por ação
  (`finishMaze(true)`, linha 847) só ocorre ao pisar na saída e produz "🎉 Saída!".
- **Classificação:** AVISO PASSIVO — a variante vermelha da tela é disparada exclusivamente pelo
  relógio. O paciente estava se movendo, mas o que o app comenta é o que ele **não** concluiu.
- **A medida se perde?** **Não.** `solved: false` entra em `mazeMetricsRef`/`mazeResults`
  (linhas 722-724), move a adaptação (740-742) e vira a acurácia da sessão (750-751). O painel é só
  apresentação.

#### A4 · `components/exercises/executive/CompraMultifuncional.tsx:266-281` (render 402-419)
- **Exercício:** Compra Multifuncional (`compra-multifuncional`, desenvolvimento funcional)
- **O que aparece:** painel âmbar (fundo `#fffbeb` / `rgba(250,204,21,0.12)` no tema escuro, borda
  `rgba(250,204,21,0.4)`) com **"💡 Veja a conta"** e a conta resolvida — por exemplo
  *"A conta é 12 + 7 = R$ 19,00."* (`lib/compra-missoes.ts:588-589`). Na etapa de seleção, o texto é
  a lista de regras violadas e a soma dos itens escolhidos (`feedbackSelecao`, tentativa 4).
- **Gatilho:** `onTimeUp()` — o cronômetro da etapa (45 s nas numéricas, 60 s nas de seleção, só onde
  `etapa.temCronometro`) chega a zero sem confirmação. O código **confirma o que houver** e chama
  `feedbackNumerica(..., 3)` / `feedbackSelecao(..., 4)`, isto é, o nível de dica mais alto.
- **Observação clínica:** se o paciente não digitou nada, o app **corrige uma resposta que ele não
  deu** e entrega o resultado da conta.
- **Classificação:** AVISO PASSIVO — nasce do relógio, não de um gesto.
- **A medida se perde?** **Não** — mas note: só se grava `firstTry: boolean` em
  `sessionResultsRef` (linha 531). Omissão por tempo e erro por resposta entram idênticos como
  `false`. Não existe medida separada de omissão hoje, nem antes nem depois de remover o painel.

#### A5 · `components/exercises/processing/CorridaContraOTempo.tsx:398-406`
- **Exercício:** Busca Rápida (`corrida-tempo`, velocidade de processamento)
- **O que aparece:** painel central por 1100 ms — círculo âmbar `#FEF3C7` com o ícone
  `MousePointerClick` em `#B45309`, **"3/8 encontrados"** em negrito e, abaixo,
  **"2 toques impulsivos"** (ou "Sem erros!").
- **Gatilho:** `endRound()` chamado pelo `setInterval` quando `timeLeft` chega a 0 (linha 245) — sem
  gesto nenhum. O círculo fica verde com ✓ quando ele coletou ≥75%.
- **Classificação:** AVISO PASSIVO — nesta variante o painel existe para dizer quantos alvos ele
  **não** encontrou. Meio-termo declarado: o **mesmo** painel também aparece quando ele coleta tudo
  antes do tempo (`endRound` na linha 263), e aí é FEEDBACK DE AÇÃO. Some-se a isso o princípio 4
  dela (adaptativo silencioso, "sem tela de resultado do bloco interrompendo o fluxo").
- **A medida se perde?** **Não.** `omitted` é agregado em `agg.current` (linhas 215/227) e vai ao
  metadata da sessão (linha 429).

### AMBÍGUO (2) — decisão dela, não desta auditoria

#### B1 · `components/exercises/processing/TempoReacao.tsx:233-244` (efeito visual na linha 253)
- **Exercício:** Tempo de Reação (`tempo-reacao`). Na tela o cabeçalho diz "🎯 Reflexos".
- **O que aparece:** **a tela inteira pisca vermelho** — `!bg-red-200` aplicado ao fundo do palco por
  350 ms (`missFlash`).
- **Gatilho:** `handleBalloonExit` — o balão VERDE (alvo) sai da tela sem ser tocado.
- **Por que ambíguo:** é tarefa de tempo de reação; deixar o alvo passar é, por desenho, a resposta
  errada. A fronteira é a que o próprio despacho reconhece como discutível.
- **Ponto que ela deve saber antes de decidir:** o **mesmo** flash vermelho é usado no toque errado
  (linha 227). Na tela, "estourei o balão errado" e "deixei o verde passar" são visualmente
  idênticos — se o flash ficar, ele não distingue ação de não-ação.
- **A medida se perde?** **Não** — e também não existe: `recordResult(false, null)` é chamado do
  mesmo jeito nos dois casos (linhas 229 e 242). O metadata só leva `trials`, `avgRT` e `correct`
  (linha 157). Omissão não é medida em separado hoje.

#### B2 · `components/exercises/processing/Semaforo.tsx:206-211` (feedback em 229, cores em 290-296, texto em 362)
- **Exercício:** Semáforo (`semaforo`, tempo de reação)
- **O que aparece:** o fundo do palco pisca (`!bg-green-900` ou `!bg-red-900`) e surge o rótulo
  **"✓ Certo!"** (verde) ou **"✗ Errado!"** (vermelho) por 500 ms.
- **Gatilho:** `activeTimer` estoura após `onMs` (varia com a dificuldade) sem nenhum toque →
  `handleResponse(false, newRound)`.
- **Por que ambíguo:** tarefa de TR, mesma fronteira do B1.
- **Achado adicional, e este não é de estética:** o parâmetro é `pressedAdvance`, e `false` significa
  literalmente **"apertou PARAR"**. Quando o sinal era vermelho (`shouldAdvance === false`), a
  omissão é avaliada como **acerto**: o app mostra **"✓ Certo!"** e soma um ponto para quem não fez
  nada. Isso **infla a acurácia** e contamina a progressão. Precisa de decisão dela
  independentemente do que se fizer com o aviso.
- **A medida se perde?** **Não determinado como ganho** — pior: hoje a omissão é indistinguível da
  resposta "parar" dentro de `results` (linha 227). Não há campo de omissão para preservar.

---

## 4. Tabela-resumo

| # | Classificação | Arquivo:linha | Exercício | O que aparece | Gatilho | Perde medida? |
|---|---|---|---|---|---|---|
| A1 | AVISO PASSIVO | `components/exercises/attention/FocusAgents.tsx:240` | Focus Agentes | Faixa vermelha "✗ Passou! Toque mais rápido." (1250 ms) | Alvo sai por baixo sem toque (modo queda) | Não (`omissions`) |
| A2 | AVISO PASSIVO | `components/exercises/attention/FocusAgents.tsx:323` | Focus Agentes | Faixa vermelha "✗ Acabou o tempo!" + alvo ampliado e demais escurecidos (1450 ms) | Timer da rodada expira (modo espalhado) | Não (`omissions`) |
| A3 | AVISO PASSIVO | `components/exercises/executive/Labirinto.tsx:1013` | Labirinto | Painel "⏰ Tempo!" em vermelho + "Tente planejar a rota antes de andar" + métricas | Só por `elapsed >= timeLimit` | Não (`solved:false`) |
| A4 | AVISO PASSIVO | `components/exercises/executive/CompraMultifuncional.tsx:266` | Compra Multifuncional | Painel âmbar "💡 Veja a conta" com a conta resolvida | Cronômetro da etapa zera sem confirmar | Não (só há `firstTry`) |
| A5 | AVISO PASSIVO | `components/exercises/processing/CorridaContraOTempo.tsx:398` | Busca Rápida | Painel âmbar "3/8 encontrados" + toques impulsivos (1100 ms) | `timeLeft` chega a 0 | Não (`omitted`) |
| B1 | AMBÍGUO | `components/exercises/processing/TempoReacao.tsx:233` | Tempo de Reação | Tela inteira pisca vermelho (350 ms) | Balão verde sai sem ser tocado | Não (omissão não é medida hoje) |
| B2 | AMBÍGUO | `components/exercises/processing/Semaforo.tsx:206` | Semáforo | Fundo pisca verde/vermelho + "✓ Certo!" / "✗ Errado!" (500 ms) | `activeTimer` expira sem toque | Não (e omissão vira "parar") |

---

## 5. O que NÃO é achado

Esta seção vale tanto quanto a de cima: ela impede que a próxima sessão refaça o trabalho. Todos os
itens abaixo casaram com as pistas do grep e foram **descartados por leitura do código**.

### 5.1 Já resolvido

- **`components/exercises/attention/DualTask.tsx:358`** — `setShapeFeedback("miss")` continua no
  código, mas desde a v2.98.5 nada pinta: `displayState` só reconhece `hit` e `fa` (linha 435-436).
  O estado de omissão sobrevive **de propósito**, para a medida. É o padrão que os achados A1-A5
  deveriam seguir.

### 5.2 Feedback de ação — o gesto veio primeiro

- **Vigilância** (`attention/Vigilancia.tsx`) — a fase `resposta` **não tem timeout**: espera o toque
  indefinidamente (`aoTocar`, linha 146). Todo feedback nasce do gesto.
- **MOT** (`attention/MOT.tsx`) — a fase `identify` só termina em `handleConfirm` (linha 201). Sem
  relógio.
- **Padrões com Rotação** (`memory/PadroesRotacao.tsx`) — "Eram estas as posições" e a contagem
  `omissions` (linha 239) nascem de `submit()`, chamado por `confirmInput()`. `omissions` é **medida
  no metadata**, não texto de tela.
- **Restaurante** (`memory/RestauranteOrdem.tsx:228`) — "Faltou um item." vem de `validate()`, que
  roda ao entregar a bandeja. Ação. Além disso, Restaurante e Supermercado foram **explicitamente
  deixados como estão** por ela em 28/ago (commit `d4596fa`).
- **Ordem da História** (`executive/OrdemHistoria.tsx:371`) — "acabou as tentativas → revela a certa"
  é depois de tentativas gastas, não de silêncio.
- **Certo ou Errado, Identificação de Símbolos, Trilha Visual, Caça Item Barato, Informação em Foco,
  Sequência Temporal (`attention/AntesDepois.tsx`), Task Switching, Mudança de Regras, Deductive
  Grid, Torre de Hanói, Estacionamento Lógico, Caminhos para a Meta, Investigadores Sociais, Desafio
  Orçamento** — nenhum tem timer de resposta. Todos os `setTimeout` encontrados são atrasos de
  transição *após* uma resposta.

### 5.3 O padrão correto já existe — usar como modelo

- **Stroop** (`executive/StroopTask.tsx:530-533`) — o item **tem** prazo, e quando estoura o app
  chama `advanceTrial(false, ...)`, que apenas troca o estímulo **em silêncio**. O
  "✓ Correto / ✗ Quase lá" da linha 367 pertence ao `TutorialStep` (condicionado a `selected`, um
  clique), não ao jogo. É exatamente o comportamento que a regra dela pede.

### 5.4 Cronômetro visível ≠ aviso de omissão

Pressão temporal **durante** a tarefa não comenta uma não-ação; foi descartada:

- `processing/CorridaContraOTempo.tsx:308` — `<Timer>` com os segundos da rodada, ficando vermelho
  em ≤4 s.
- `executive/CompraMultifuncional.tsx:332` — contador `{timeLeft}s` em vermelho pulsante a ≤8 s.
- `executive/StroopTask.tsx:594` — barra que encolhe por item.
- `memory/RestauranteOrdem.tsx:678`, `memory/DesafioSupermercado.tsx:569`,
  `memory/JogoMemoria.tsx:159`, `executive/DesafioCidade.tsx:382/571/758` — contagens da fase de
  **memorização**, antes de qualquer resposta ser possível.

### 5.5 Falsos positivos de grep

- `components/exercises/ExerciseWrapper.tsx:387` — ícone `Clock` com a **duração** na tela de
  resultados.
- `components/exercises/attention/AntesDepois.tsx:63` — o emoji `"⏰"` é o ícone do item de conteúdo
  **"Acordar"**.
- `lib/tutorial/definitions/estimulo-continuo.tsx:40` — `WAIT_LABEL = "agora não"` aparece **na
  demonstração** (o app se mostrando não agindo diante do não-alvo), nunca sobre o paciente. E a
  linha 170 documenta a regra correta: *"Um alvo não possui timeout: permanece disponível e aceita a
  resposta quando ela vier"*.
- Ocorrências de `"missing_step"`, `makeDistractor`, `"lento"` (rótulo de velocidade do nível na
  Dupla Tarefa) e `"acabou"` dentro de histórias de conteúdo — texto, não aviso.

### 5.6 Zona cinzenta declarada, não decidida

- **`processing/CorridaContraOTempo.tsx:420`** — a linha **"Itens omitidos: N"** na tela `summary`.
  Não foi classificada como achado porque é a **tela de resultado final** da sessão, fora do fluxo de
  execução, e é ali que a medida clínica aparece para leitura. Se a regra dela valer também para a
  tela final, este é o único ponto do app que a violaria — decisão dela.

---

## 6. Restrições cumpridas

- Nenhum componente de exercício foi alterado. Este documento é o único arquivo escrito.
- Nada foi commitado.
- `npm run build` **não** foi executado (o dev server dela está no ar na porta 3000).
