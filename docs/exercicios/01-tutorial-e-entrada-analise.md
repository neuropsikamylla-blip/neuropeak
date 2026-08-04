# Tutorial e experiência inicial de execução — análise

> Primeira etapa da revisão exercício por exercício, pedida por ela em 04/ago/2026.
> **Nada implementado.** Nenhum código, interface, banco ou execução foi tocado.
>
> Referência de princípio: as observações sobre o Cogmed registradas em
> `docs/prescription-architecture/10-prescription-execution-real-time.md`.

## 1. O caminho que o paciente percorre hoje

```
/inicio  →  "Treino de hoje"  →  toca no exercício
   ↓
/treino/[exercicio]  →  ExerciseWrapper
   ↓
[1] TELA DE INSTRUÇÕES  (texto: lista numerada + cenário funcional + estratégias)
   ↓  botão "Iniciar"
[2] TUTORIAL INTERATIVO  (quando o exercício tem: 1 a 3 etapas)
   ↓  botão de conclusão
[3] EXERCÍCIO
   ↓
[4] RESULTADO  (ícone + frase + pontuação, precisão, duração)
```

## 2. O achado central: **o paciente refaz tudo, toda vez**

**19 exercícios** declaram `const [showTutorial, setShowTutorial] = useState(true)`. O estado inicial
é literal, não lido de lugar nenhum.

**Não existe, em todo o projeto, qualquer memória de "este paciente já viu este tutorial".** A busca
por `tutorialVisto`, `seenTutorial`, `firstTime` ou leitura de `localStorage` para tutorial não
retorna nada.

E a tela de instruções tem o mesmo comportamento
(`ExerciseWrapper.tsx:45`): `useState(instructions.length === 0 ? "exercise" : "instructions")` — se
o exercício tem instruções, elas aparecem **sempre**.

### O custo, em números

Um paciente que treina **3× por semana durante 6 meses** repete, para **cada** exercício do plano:

| | Repetições |
|---|---:|
| Tela de instruções | **72** |
| Tutorial interativo | **72** |

Com 4 exercícios no plano, são **576 telas** atravessadas antes de jogar, ao longo do tratamento —
todas idênticas à primeira.

**Isto é o oposto do princípio que ela extraiu do Cogmed:** a sessão é a unidade, o paciente entra e
executa. A introdução existe para a primeira vez, não como pedágio permanente.

## 3. Segundo achado: a regra de "1 etapa" não está cumprida

A regra dela, registrada em `[[tutorial-replica-perfeita]]`, é **tutorial idêntico ao jogo, uma
etapa** — nasceu de ela mesma ter reclamado que fazia "o tutorial 2×". O comentário em
`TrilhaVisual.tsx:176` documenta a correção: *"UMA etapa só (antes eram 2 quase iguais)"*.

Mas a correção foi aplicada caso a caso, não como padrão:

| Etapas | Nº | Exercícios |
|---:|---:|---|
| **1** | 10 | Conecta Números · Caça Item · MOT · Busca Rápida · Identificação de Símbolos · Investigadores · Compra Multifuncional · Desafio Orçamento · Grade Dedutiva · Mudança de Regras |
| **2** | 9 | Dupla Tarefa · Matriz Espacial · N-Back · Cubos · Jogo da Memória · Tempo de Reação · Certo ou Errado · Semáforo · Alternância de Regras |
| **3** | 1 | Supermercado |

**Metade dos tutoriais ainda repete a etapa** que ela pediu para eliminar.

## 4. Terceiro achado: dupla explicação antes de jogar

Quem tem tutorial interativo passa por **duas** explicações seguidas: a tela de texto e depois a
demonstração prática do mesmo conteúdo.

A tela de texto traz três blocos: **instruções numeradas**, **"Para que serve no dia a dia"**
(cenário funcional) e **"Estratégias"**. São bons conteúdos clínicos — mas chegam **antes** de o
paciente ter qualquer contato com a tarefa, no momento de menor capacidade de absorvê-los, e
competem com o tutorial que vem logo depois.

## 5. Quarto achado: o resultado não mostra evolução

A tela final exibe: ícone (verde/amarelo/vermelho), uma frase (*"Excelente!"* · *"Bom trabalho!"* ·
*"Continue praticando!"*) e três números — **pontuação · precisão · duração**.

**Não há comparação com nenhuma sessão anterior.** A busca por `anterior`, `previous`, `recorde` ou
`melhorou` em `ExerciseWrapper.tsx` não retorna nada.

Consequências para os objetivos que ela listou:

- **sensação de evolução:** o paciente não vê que melhorou. Uma precisão de 82% é idêntica na tela
  quer a anterior tenha sido 60% ou 95%;
- **motivação ao longo das sessões:** a frase de retorno depende só do resultado do dia;
- **nível:** o exercício sobe e desce de dificuldade sozinho, mas **isso não é comunicado**. O
  paciente pode subir de nível e não saber — perdendo justamente o sinal mais forte de progresso.

## 6. O que já está bom e não deve ser quebrado

- **O tutorial é réplica do jogo.** `TrilhaVisual.tsx:84` compartilha o mesmo componente de célula
  entre tutorial e jogo (*"COMPARTILHADA: jogo e tutorial — réplica exata"*). Esse princípio dela
  está implementado de verdade e é a base para qualquer mudança.
- **`TutorialBase` é um contrato único** (`steps`, `onDone`, indicadores de progresso), então mexer
  no padrão de tutoriais é mudança em um lugar, não em 30.
- **O tutorial exige acerto para avançar** (`handleStepDone`) — o paciente pratica, não só lê.
- **Os três temas** (CLINICAL, COLORFUL, GAMIFIED) já são respeitados em todas as telas.

## 7. Limitações clínicas e de UX — consolidadas

| # | Limitação | Gravidade |
|---:|---|---|
| 1 | Tutorial e instruções repetem em **todas** as sessões, sem memória | **Alta** |
| 2 | Metade dos tutoriais tem 2–3 etapas, contra a regra de 1 | Média |
| 3 | Dupla explicação (texto + tutorial) antes do primeiro contato | Média |
| 4 | Resultado sem comparação com sessão anterior | **Alta** |
| 5 | Mudança de nível não é comunicada ao paciente | **Alta** |
| 6 | Cenário funcional e estratégias chegam antes de fazer sentido | Baixa |
| 7 | Não há como o paciente **rever** o tutorial por vontade própria | Média |

⚠️ As limitações 4 e 5 dependem de **dado histórico do paciente no cliente**. Hoje o resultado é
calculado no próprio exercício e enviado ao servidor; a tela de resultado **não busca** nada. Isso é
mudança de fluxo de dados, não só de interface — e precisa entrar no planejamento como tal.

## 8. Direções propostas — para ela decidir, nada implementado

### 8.1 Memória de "já viu" — a mudança de maior efeito

Registrar por paciente e por exercício que a introdução já foi vista. Nas sessões seguintes, o
paciente entra **direto no exercício**, com um acesso discreto e permanente a **"Rever instruções"**.

**Três decisões dela são necessárias:**

1. **Onde guardar.** `localStorage` é imediato e não toca o banco, mas se perde ao trocar de
   aparelho — e ela já tem a dívida `ARQ-002` exatamente por isso (pet e skill tree só no
   `localStorage`). O banco resolve de verdade, mas exige schema.
2. **O que conta como "já viu".** Ter completado o tutorial uma vez? Ter concluído uma sessão
   inteira do exercício? A segunda opção é mais segura clinicamente.
3. **Quando reapresentar sozinho.** Após retorno de uma pausa longa? Se a mecânica do exercício
   mudar? Depois de quanto tempo?

### 8.2 Uma etapa em todos

Uniformizar os 10 restantes na regra que ela já fixou. É trabalho mecânico, exercício por exercício,
e **cada um precisa de conferência visual dela** — a lição de `[[licao-regressoes-visuais]]` vale
aqui.

### 8.3 Fundir texto e prática

Na primeira vez: uma tela curta com o essencial, e o cenário funcional **depois** do tutorial, quando
o paciente já sabe do que se trata. As estratégias podem migrar para o acesso "Rever instruções".

### 8.4 Resultado que mostra evolução

Comparar com a sessão anterior do mesmo exercício e **comunicar mudança de nível**. É a alavanca mais
direta para "sensação de evolução" e "motivação ao longo das sessões", que ela listou.

**Decisão dela necessária:** o que mostrar quando o desempenho **cai**. Um paciente que piorou não
pode receber a mesma tela de quem melhorou — mas também não pode ser desencorajado. Isso é decisão
clínica, não de interface.

## 9. O que esta análise NÃO resolve

- **Não mediu** quanto tempo o paciente gasta hoje nas telas de introdução — o `Session.duration`
  registra só o exercício, e é tempo ativo.
- **Não avaliou** o conteúdo clínico das instruções de cada exercício, um a um. Esta análise é do
  **fluxo**; a revisão exercício por exercício virá depois.
- **Não propõe** implementação. As direções da seção 8 dependem das decisões listadas.

## 10. Decisões pendentes antes de qualquer código

1. Onde guardar a memória de tutorial visto — `localStorage` ou banco?
2. O que caracteriza "já viu" — tutorial completo ou sessão concluída?
3. Reapresentar automaticamente após pausa longa? Com que critério?
4. O cenário funcional e as estratégias mudam de lugar, ou continuam antes?
5. Como a tela de resultado trata queda de desempenho?
6. A mudança de nível deve ser comunicada ao paciente? Em que linguagem?
7. A uniformização para 1 etapa entra nesta fase ou na revisão exercício por exercício?
