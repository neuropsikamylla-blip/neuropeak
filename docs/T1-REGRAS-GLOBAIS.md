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

> ⚠️ Reconciliado em 07/ago/2026 com a **regra 11**: o **modo 3** não tem demonstração animada, e
> nesse caso esta regra não se aplica — o que a substitui é a explicação clara da regra da
> atividade. O que **nunca** se dispensa é a **tentativa guiada**.

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

"Ver tutorial novamente" executa o tutorial **completo** (demonstração + tentativa guiada) e, ao
terminar, o treino começa normalmente.

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

## 11. Três modos oficiais de tutorial

> Decisão dela, **07/ago/2026**: *"Nem todo exercício precisa obrigatoriamente possuir uma
> demonstração animada. O objetivo da T1 é ensinar a mecânica da atividade, não obrigatoriamente
> mostrar uma animação."*

| modo | o que faz | quando usar |
|---|---|---|
| **1 — Demonstração completa** | o sistema executa toda a atividade antes da guiada | a tarefa se ensina **fazendo**: reproduzir sequência, selecionar conjunto |
| **2 — Demonstração contínua** | o sistema demonstra **quando agir e quando não agir** | tarefas **temporizadas**, em que o *quando* é o que se aprende |
| **3 — Tutorial explicativo** | **sem** demonstração animada — explica a regra com clareza | quando animar **não melhora** o aprendizado |

### O que vale para os três

⛔ **A tentativa guiada continua OBRIGATÓRIA.** Nenhum modo dispensa o paciente de fazer a tarefa
uma vez, com feedback e possibilidade de repetir.

O restante do framework permanece **exatamente igual**: preparação · identidade visual · transições ·
textos · "Tutorial concluído" · botão "Ver tutorial novamente" · isolamento clínico · regra 10.

### O critério de escolha — e o que ele NÃO é

**A pergunta é uma só:** *"A demonstração realmente ajuda o paciente a compreender a mecânica?"*

- **Sim** → demonstração (modo 1 ou 2).
- **Não** → tutorial explicativo (modo 3).

⛔ **A pergunta NÃO é "a regra é fácil de explicar em texto".** Foi o erro que cometi ao classificar
a Família 4: mandei `nback` e `dual-task` para o modo explicativo porque suas regras se enunciam bem
— quando são justamente os casos em que **ver** ensina mais que ler. O `nback` compara uma relação
entre momentos no tempo; o `dual-task` mostra o que "dividir a atenção" significa na prática.

⛔ **Não distribuir os três modos de forma equilibrada.** Eles não são uma cota. Uma família inteira
em demonstração contínua, ou inteira em completa, é **perfeitamente aceitável** — e é o caso da
Família 4, onde o modo 3 não é usado.

> **O modo explicativo é reserva, não meta.** Só entra quando a animação realmente não acrescenta
> compreensão. Forçá-lo para "usar os três modos" é reduzir aprendizado por simetria.

### O modo é POR EXERCÍCIO, nunca por família

Validado por ela em **07/ago/2026**, ao ver o Semáforo: *"a demonstração tornou o entendimento mais
artificial do que necessário"*. Ele saiu de **contínua** para **explicativo**, e a Família 4 deixou
de ter um modo único.

⛔ **Nem sempre "exercício temporizado = demonstração contínua".** Ser temporizado não implica que
animar ensine: a regra do Semáforo — verde clique, vermelho não clique — se enuncia melhor do que se
demonstra. Cada exercício se avalia **individualmente** pela pergunta única, mesmo dentro de uma
família já convertida.

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
