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

## 2. Demonstração sempre completa

A demonstração executa a tarefa **inteira**, do início ao fim. **Nunca** mostra apenas o estímulo:
precisa demonstrar **como responder**, com a resposta sendo executada.

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
