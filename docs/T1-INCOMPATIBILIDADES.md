# T1 — incompatibilidades arquiteturais

Casos em que o framework aprovado **não consegue representar a mecânica sem ser alterado**.
Registrados, explicados e propostos — **nunca resolvidos em silêncio**.

---

## 1. Família 4 — estímulo contínuo → responder no momento certo

**Status:** ✅ **RESOLVIDO em 07/ago/2026** pela decisão dos **três modos** (regra global 11).

> Ela criou o **modo 2 — demonstração contínua**, que demonstra *quando agir e quando não agir* em
> tarefas temporizadas, e o **modo 3 — tutorial explicativo**, sem demonstração animada. Isso cobre
> exatamente a lacuna descrita abaixo, e vai além da minha proposta: eu havia proposto animar a
> inibição em todos os casos; ela permitiu **não animar** onde a animação não ensina.
>
> As três dúvidas pedagógicas que eu havia levantado ficam respondidas: **(1)** a inibição É
> demonstrada, no modo 2; **(2)** a demonstração desta família precisa de alvo **e** não-alvo, logo
> não se limita a `smallestValidUnit`; **(3)** a guiada do tutorial **não** tem relógio — "o
> tutorial ensina, não mede" (regra 6).

**Registro histórico da análise, mantido abaixo.**
**Data:** 07/ago/2026 · **Exercícios:** `vigilancia` · `nback` · `tempo-reacao` · `semaforo` ·
`certo-ou-errado` · `mot` · `dual-task`

### O que o framework aprovado faz hoje

`criarTutorialSequenciaOrdenada` tem um roteiro **em duas etapas separadas**:

```
1. APRESENTA tudo   →   present(itens)
2. RESPONDE tudo    →   para cada item: cursor desloca, mira, pressiona, solta, marca preenche
```

A resposta acontece **depois** da apresentação, sem relógio. Foi assim nas três famílias aprovadas:
o paciente ouve/vê a sequência inteira e só então responde.

### Por que a Família 4 não cabe nisso

Medido no código dos sete exercícios, e são **duas** diferenças, não uma:

**(a) A resposta é travada no tempo.** O paciente responde **durante** o estímulo, dentro de uma
janela. Não há "fase de resposta" separada — apresentação e resposta são o mesmo momento. Os sete
exercícios têm de 8 a 29 referências a `Date.now`, `performance.now`, `reactionTime` ou janelas de
tempo, justamente porque *quando* se responde é o que está sendo medido.

**(b) Em vários, a resposta certa é NÃO AGIR.** É o achado que mais pesa:

| exercício | evidência |
|---|---|
| `dual-task` | 10 referências a inibição |
| `nback` | 3 referências a falso alarme |
| `tempo-reacao` | 3 referências a inibição |
| `semaforo` | `handleAdvance` × `handleStop` conforme o sinal — go/no-go clássico |
| `mot` | 1 referência a não-alvo |

**O framework aprovado não tem o conceito de "não responder".** A demonstração percorre
`respostaEsperada` e **clica em todos os itens**. Não existe forma de expressar "aqui o cursor
espera de propósito, e isso é o certo".

### Por que isto é diferente da Família 3

Na Família 3 a diferença era **uma comparação** — a mesma estrutura, outro critério de acerto.
Bastou um parâmetro (`compararResposta`), e o padrão preservou as Famílias 1 e 2 intactas.

Aqui a diferença é o **fluxo de controle**: apresentação e resposta deixam de ser etapas e passam a
ser intercaladas, mais um conceito pedagógico que não existe no framework — a **inibição** como
resposta correta. Não é um parâmetro sobre o roteiro existente; é um segundo roteiro.

### Proposta

**Acrescentar um roteiro `"intercalado"` à mesma fábrica, sem tocar no `"sequencial"` aprovado.**

```
para cada estímulo:
  apresenta o estímulo
  se É alvo   → cursor desloca, mira, pressiona, solta   (dentro da janela)
  se NÃO é    → o cursor permanece visível e PARADO, com um sinal claro de espera deliberada
segue para o próximo
```

Três pontos que precisam da decisão dela, porque são **pedagógicos**, não técnicos:

1. **Como mostrar a inibição.** "Não clicar" é invisível — o paciente pode ler como travamento. Eu
   proporia o cursor recuar levemente e um rótulo curto do tipo **"agora não"** durante o não-alvo.
   ⚠️ Isso **acrescenta um elemento visual** ao framework que ela aprovou, e por isso não faço sem
   autorização.
2. **Quantos estímulos na demonstração.** Para ensinar a inibição é preciso mostrar **ao menos um
   alvo e um não-alvo** — ou seja, a demonstração desta família não pode usar apenas
   `smallestValidUnit`; precisa de um mínimo de dois estímulos de tipos diferentes.
3. **A tentativa guiada tem relógio?** Se tiver, o paciente pode errar por lentidão no tutorial, o
   que contraria "o tutorial ensina, não mede". Eu proporia a guiada **sem limite de tempo**,
   aceitando a resposta quando vier — mas isso a afasta um pouco da mecânica real, e é decisão dela.

### O que NÃO muda na proposta

Identidade visual · ritmo · transições · textos · cursor · encerramento · botão "Ver tutorial
novamente" · isolamento clínico · regra 10. O roteiro `"sequencial"` das Famílias 1, 2 e 3 fica
byte-idêntico, e a suíte delas continua sendo a prova.

### Alternativa considerada e descartada

Tratar a Família 4 como escolha entre alternativas (Família 5) e ignorar o tempo. **Descartado:** a
demonstração ensinaria a tarefa errada — o paciente aprenderia *o que* responder, mas não *quando*,
que é exatamente o que estes exercícios treinam.

### Nota sobre `certo-ou-errado`

Pode pertencer à **Família 5** (escolha entre alternativas), não à 4: a resposta é escolher entre
duas opções, e o tempo age como pressão, não como critério. Sugiro reclassificá-lo — o que reduz a
Família 4 a seis exercícios. Também é decisão dela.

---

## 2. Focus Agentes — regra nova introduzida no meio da progressão

**Status:** ⏸️ **AGUARDA DECISÃO DELA.** Nada implementado.
**Data:** 09/ago/2026 · **Exercício:** `focus-agents` (Família 5)
**Decisão dela nesta data:** o tutorial inicial cobre **apenas a cena parada**; a queda fica aqui
registrada para ser decidida à parte. O tutorial da mecânica inicial pode ser construído.

### O que o framework não representa

O tutorial ensina **uma vez, no começo**. O Focus Agentes muda a regra **no meio da progressão**,
e o paciente descobre a mudança perdendo ponto.

Três estados, não dois (`lib/focus/progression.ts:69` e `FocusAgents.tsx:286`):

| estado | quando | consequência de não agir |
|---|---|---|
| parado (`vel: 0`) | 5 primeiros degraus | nenhuma |
| deriva | degrau 6+ | nenhuma — rebatem nas bordas e **nunca somem** |
| **queda** | nível 2+ | o alvo **sai pela base** e conta **omissão** |

A queda não acrescenta só movimento: acrescenta **uma forma nova de errar**. Até ali, errar era
clicar no personagem errado. A partir dali, *não clicar a tempo* também é erro — e a única
sinalização hoje é o feedback depois do prejuízo: "Passou! Toque mais rápido."

### Por que não dá para resolver no tutorial inicial

Na primeira vez que o paciente abre o exercício a cena está **parada**. Demonstrar queda ali ensina
uma mecânica que ele só encontrará muito depois, e que pode nem alcançar. Ensinar cedo demais é tão
ruim quanto não ensinar: quando a queda chegar, a demonstração já terá sido esquecida.

### As saídas, e o que cada uma custa

1. **Aviso no momento da introdução** — uma tela curta quando o nível 2 começa: "agora eles caem; se
   o alvo sair por baixo, conta como erro". É **capacidade nova do framework** (ensino em dois
   momentos) e vale para todo exercício com progressão, não só este. Merece desenho próprio.
2. **Tutorial inicial cobrindo as duas fases** — ensina tudo cedo. Rejeitada por ela em 09/ago:
   apresenta na primeira vez uma mecânica distante e o paciente chega lá sem lembrar.
3. **Não ensinar** — o que existe hoje. O paciente aprende a regra perdendo ponto.

### Parentesco com a Família 4

É a mesma família de problema: **tempo** e **não agir**. Lá, a resposta certa às vezes é não agir;
aqui, não agir a tempo vira erro. Se a saída 1 for adotada, convém olhar as duas juntas.
