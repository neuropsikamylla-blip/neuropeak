# T1 — regras globais do framework de tutorial

> Congeladas por ela em **07/ago/2026**, junto com a aprovação do **Span Numérico Auditivo Direto**
> como exercício de referência. Valem para **os 34 exercícios**, não só para o Span.
>
> Cada regra tem teste. Desfazer qualquer uma quebra a suíte de propósito.

## O objetivo (regra 9)

> Qualquer paciente deve abrir **qualquer** um dos 34 exercícios e sentir que está usando
> **exatamente o mesmo sistema de tutorial**. Ele aprende o funcionamento do framework **uma vez**;
> depois disso, em cada exercício novo, aprende apenas a **mecânica específica** daquela atividade.

Tudo abaixo existe para servir a esta frase.

## 1. Demonstração — linguagem

| elemento | valor |
|---|---|
| selo | `DEMONSTRAÇÃO` |
| título | **Observe como responder** |
| texto padrão | **Observe como funciona a atividade.** |

Um exercício pode adaptar o texto se a mecânica exigir, mas **seguindo exatamente este padrão de
linguagem** — verbo no imperativo, uma frase, sem estratégia cognitiva.

## 2. Quando há demonstração, ela é completa

**Onde existe demonstração animada** (modos 1 e 2 da regra 11), ela executa a tarefa **inteira**, do
início ao fim. **Nunca** mostra apenas o estímulo: precisa demonstrar **como responder**, com a
resposta sendo executada.

> ⚠️ Reconciliado com a **regra 11 revisada** (07/ago/2026): no **modo 2 — Explicação** não há
> demonstração animada **nem tentativa guiada**; o que ensina é a explicação, e o treino começa em
> seguida. Esta regra vale apenas para o **modo 1**.

## 3. Sincronismo entre áudio e visual

Sempre que houver áudio e elemento visual:

- o visual **acompanha** o áudio;
- **nunca** o antecipa;
- os dois são percebidos como **um único evento**.

> Implementação de referência em `lib/tutorial/span-playback.ts`: o áudio é pré-carregado e o aviso
> visual sai no evento `playing` — reprodução audível de fato —, nunca antes do `play()`.

## 4. Tentativa guiada — linguagem

| elemento | valor |
|---|---|
| selo | `SUA VEZ` |
| título | **Agora é sua vez** |
| texto | **específico da mecânica**, com o verbo da ação real |

Verbos conforme o gesto real: **clique · arraste · selecione · digite · responda**.

⛔ **Proibido**: "use o teclado", "toque na tela", ou qualquer fórmula genérica que não corresponda
ao gesto que o paciente de fato executa.

## 5. Encerramento — linguagem

| elemento | valor |
|---|---|
| título | **Tutorial concluído** |
| mensagem | **Agora começa o treino.** (ou "Você já sabe como funciona este exercício. Agora começa o treino.") |

⛔ **Nunca** "Demonstração concluída" nem "Tentativa concluída" — o que terminou foi o tutorial
inteiro.

## 6. Ritmo

O tutorial **nunca** deve parecer acelerado. Entre as etapas há tempo suficiente para o paciente
compreender o que acabou de acontecer.

> **O objetivo do tutorial é ensinar, não economizar tempo.**

## 7. Mesmo padrão visual

Todos os exercícios usam a **mesma** estrutura, identidade visual, transições, comportamento de
botões e padrão de animação. **A única coisa que muda entre exercícios é a mecânica demonstrada.**

Na prática: `TutorialRunner`, `DemoPointer` e os selos de etapa são compartilhados. Um exercício
fornece apenas sua `TutorialDefinition`.

## 8. Tutorial sempre disponível — MUDANÇA NO FRAMEWORK

Depois da primeira conclusão, o tutorial **nunca mais aparece automaticamente**. Mas a tela de
preparação **continua existindo sempre**, com duas opções:

- **Iniciar treino** — ação principal
- **Ver tutorial novamente** — ação secundária

```
PRIMEIRA VEZ                    DEMAIS VEZES
preparação                      preparação
   ↓                               ↓
tutorial (automático)           [Iniciar treino] → treino
   ↓                            [Ver tutorial novamente] → tutorial completo → treino
treino
```

"Ver tutorial novamente" executa **o mesmo fluxo que o exercício tem na primeira vez** e, ao
terminar, o treino começa normalmente.

> 📌 **Atualizado pela regra 11 (08/ago/2026).** Esta linha dizia "o tutorial completo
> (demonstração + tentativa guiada)", o que era verdade quando só existia um fluxo. Hoje o fluxo
> vem de `definition.modo`, e rever respeita esse modo: um exercício em `modo: "explicativo"`
> — o Semáforo, por exemplo — mostra **explicação**, sem demonstração e sem tentativa guiada.
> O `TutorialRunner` lê `definition.modo ?? "completa"` num ponto só, e a revisão não passa por
> caminho diferente. **Não "corrigir" o código para bater com a frase antiga:** o código está
> certo, era a frase que tinha envelhecido.

### O que rever o tutorial NUNCA pode fazer

`Session` · `score` · `accuracy` · `currentDifficulty` · `totalAttempts` · progresso ·
estatísticas clínicas · `achievements` · planos · **`tutorialCompletedAt`** · **`tutorialVersion`** ·
**`tutorialSource`**.

> ⚠️ Os três últimos são a diferença entre a primeira conclusão e uma revisão: a primeira **grava**,
> a revisão **não toca em nada**. O `POST /api/exercise-tutorial` só é chamado no caminho automático.

**O tutorial é um manual interativo: sempre disponível, nunca obrigatório após a primeira conclusão.**

## 10. A gravação do tutorial tem UM caminho só — vale para os 34

A garantia da regra 8 **não é do Span**: é do framework. Em **todos** os 34 exercícios:

- a **primeira conclusão** grava **exatamente uma vez**;
- a **revisão** grava **zero vezes**;
- a revisão **não altera** `tutorialCompletedAt`, `tutorialVersion` nem `tutorialSource`;
- **a revisão é sempre somente leitura.**

### Como isso é garantido, e não apenas prometido

**`completionRecordFor()` (`lib/tutorial/state.ts`) é a regra única do framework.** Ela devolve
`null` na revisão — sem registro não há requisição, e sem requisição não há escrita. O
`ExerciseWrapper` apenas obedece ao que ela devolve.

⛔ **Nenhum exercício pode implementar lógica própria de gravação de tutorial.** Todos os 34 usam o
mesmo caminho do `ExerciseWrapper`.

Quatro arquivos — e só eles — participam da gravação:

| arquivo | papel |
|---|---|
| `app/(patient)/treino/[exercicio]/page.tsx` | dispara o POST, **uma vez**, no caminho automático |
| `app/api/exercise-tutorial/route.ts` | a rota que grava |
| `components/exercises/ExerciseWrapper.tsx` | decide chamar, obedecendo a `completionRecordFor` |
| `lib/tutorial/state.ts` | a regra |

`lib/tutorial/gravacao-unica.test.ts` **falha** se qualquer exercício introduzir chamada própria a
`onTutorialDone`, POST de tutorial, manipulação de `tutorialCompletedAt`/`tutorialSource`, ou uma
decisão paralela de conclusão. Vale para exercícios que **ainda serão convertidos**: um exercício
novo que tente gravar por conta própria falha no lote em que for criado.

> Se este teste falhar, a correção **nunca** é relaxar o teste — é usar o caminho do
> `ExerciseWrapper`, como os outros 33.

**Verificado por injeção:** com um exercício infrator inserido de propósito, dois testes falham;
removido, a suíte volta ao verde.

## 11. DOIS fluxos de tutorial — regra consolidada

> Consolidada por ela em **08/ago/2026**. Vale para **todo o framework da T1**, nos 34 exercícios.
> Substitui a versão de três modos e **revoga** a exigência de tentativa guiada em todos os casos.

### A pergunta única

> **A demonstração realmente ajuda o paciente a compreender melhor a mecânica?**

### Fluxo 1 — Demonstração

Quando **assistir à execução da atividade aumenta significativamente** a compreensão da mecânica.

```
Preparação → Demonstração → Tentativa guiada → Treino
```

### Fluxo 2 — Explicação

Quando a mecânica pode ser compreendida **completamente apenas pela explicação**.

```
Preparação → Explicação → Treino
```

⛔ **Sem demonstração. Sem tentativa guiada.**

### O DESEMPATE — na dúvida, Fluxo 1

> **Havendo qualquer dúvida sobre qual fluxo usar, o Fluxo 1 vence.**
>
> O Fluxo 2 só se usa quando há **segurança** de que a explicação, sozinha, basta para que um
> paciente **que nunca viu o exercício** compreenda completamente a atividade.

Isso está **codificado, não só escrito**: em `TutorialRunner`, `definition.modo ?? "completa"`. Uma
definição que **não declara nada** cai em demonstração. Escolher o Fluxo 2 exige um ato deliberado —
declarar `modo: "explicativo"` e escrever as linhas da regra.

### O critério NUNCA é

⛔ o **tipo** do exercício
⛔ o fato de ser **contínuo** ou não
⛔ a **família** a que pertence
⛔ "a regra é fácil de explicar em texto"

✅ **Sempre** e somente: a demonstração ajuda a compreender melhor?

### Classificação vigente (08/ago/2026)

| Fluxo 2 — Explicação | Fluxo 1 — Demonstração |
|---|---|
| Semáforo · Tempo de Reação · Certo ou Errado | N-Back · Dual Task · MOT · **Vigilância** |

> **Vigilância** fica em demonstração **por enquanto**, podendo ser reavaliada após validação visual.

### Como isso aparece no código

| fluxo | valor de `modo` na definição |
|---|---|
| 1 — Demonstração | `"completa"` (padrão) ou `"continua"` |
| 2 — Explicação | `"explicativo"` + `explicacao: string[]` |

No Fluxo 2 o botão chama **`onFinish` diretamente** — o mesmo do encerramento do Fluxo 1. É isso que
preserva a **regra 10**: a conclusão é registrada **uma única vez**, pelo caminho único, mesmo sem
passar por `handoff`, `guided` e `feedback`.

### O que NÃO muda em nenhum dos dois

Preparação · identidade visual · transições · textos · "Tutorial concluído" · botão "Ver tutorial
novamente" · isolamento clínico · regra 10.

## Conversão dos 34 — o que NÃO se faz

⛔ alterar mecânica clínica · progressão · dificuldade · pontuação ou métricas
⛔ aproveitar para melhorias individuais nos exercícios

✅ adaptar **apenas** o conteúdo da preparação, demonstração e tentativa guiada à mecânica real.

## Incompatibilidade — como proceder

Se a mecânica de um exercício **realmente** não couber no framework sem exceção:

1. **não inventar solução silenciosamente**;
2. registrar o caso em `docs/T1-INCOMPATIBILIDADES.md`;
3. explicar a incompatibilidade;
4. **propor** a adaptação e esperar a decisão dela **antes** de alterar o padrão global.
