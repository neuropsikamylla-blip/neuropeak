# Ordem da História — FATIA B: a segunda tentativa, o toque e a conclusão

> Spec para o Codex. Depende da Fatia A já aplicada (`SPEC-FATIA-A-20260914.md`).
> Leia antes: `docs/ordem-historia/AUDITORIA-20260913.md`, inclusive a **correção de 14/set** no fim
> dele, e a espec dela `ESPEC-REVISAO-KAMYLLA-20260913.md` (seções 7 e 9 a 20).
> **Você NÃO commita.** Deixe o trabalho no diff. Revisão, prova e commit são do VP.

## A decisão mais importante desta fatia — leia antes de qualquer código

Vamos construir a **segunda tentativa**: hoje o paciente confirma uma vez, vê o feedback e a história
troca. Isso cria um risco que já queimou este projeto duas vezes (a Torre em 31/ago e a Grade
Dedutiva em 03/set, ambos registrados no `PROGRESSO.md`): **se a acurácia gravada for a da tentativa
final, todo paciente termina em 100%**, porque ele corrige até acertar — e `calculateStoryTrailProgression`
sobe de nível acima de 85%. A progressão subiria em toda sessão, para todo mundo, e o terapeuta veria
um paciente evoluindo que não evoluiu.

**Regra fechada, e ela não se negocia dentro desta fatia:**

> **A acurácia que sai em `onComplete` é a da PRIMEIRA tentativa de cada história.**
> As tentativas seguintes são treino e correção: entram no `metadata`, **nunca** na `accuracy`.

Isso é exatamente o que ela pediu na seção 10 (*"a primeira resposta deve ser a principal medida de
desempenho"*) e resolve sozinho a seção 12 (*"não quero que o paciente fique clicando em Confirmar
até descobrir a resposta por eliminação"*) **sem limite rígido de tentativas** — insistir não melhora
o que fica registrado. Ela pediu para ser avisada antes de qualquer limite rígido; com esta regra,
não é preciso criar nenhum.

---

## 1. O fluxo da segunda tentativa (seções 9, 10, 11 e 12 dela)

Só no modo **ordem**. Os modos "Encontre o Intruso" e "Descubra o que falta" ficam como estão.

### 1.1 Estados

A `Phase` atual é `"ready" | "playing" | "feedback"`. Acrescente **`"corrigindo"`**:

- **`playing`** — primeira montagem, sem marcação nenhuma.
- confirma → **100% certo?**
  - **sim** → `"feedback"` (conclusão curta, item 4) → próxima história.
  - **não** → **`"corrigindo"`**.
- **`corrigindo`** — o paciente continua na MESMA história, com os cartões **todos movíveis**, e
  confirma de novo quantas vezes quiser. Cada confirmação 100% certa leva ao `"feedback"`.

**Nunca revele a ordem correta.** Nada de mostrar o número certo de cada cena, nada de auto-resolver,
nada de "a resposta era…". O paciente vê **só** quais posições estavam certas na última confirmação.

### 1.2 Os cartões NÃO travam — decisão dela, 14/set

Ela decidiu **não travar** os cartões já corretos: travar transformaria a segunda tentativa num
problema menor resolvido por eliminação, e o alvo do exercício é planejamento e raciocínio causal.

Portanto, em `corrigindo`: **nenhum** `disabled`, nenhum `draggable={false}`, nenhuma exclusão do
`SortableContext`. Todos os cartões continuam arrastáveis, inclusive os verdes.

### 1.3 Como a marcação verde sobrevive ao rearranjo — ponto delicado, leia com atenção

Ela pediu (seção 11): *"manter essas posições claramente verdes enquanto ele reorganiza as demais"*.

Há uma armadilha real: `arrayMove` **desloca vários cartões de uma vez**. Mover um cartão laranja
muda a posição de outros — inclusive de cartões que estavam verdes. Uma marca verde que fica na tela
depois que o cartão saiu da posição certa **é uma mentira para o paciente**.

**Desenho fechado pelo VP, que cumpre o pedido dela sem mentir:**

Ao confirmar, guarde a fotografia do que estava certo — **qual cartão** estava em **qual posição**:

```ts
// cardId -> índice (0-based) em que aquele cartão foi avaliado como CORRETO
const [acertos, setAcertos] = useState<Record<string, number>>({});
```

Um cartão é desenhado em **verde com ✓** quando, e somente quando,
`acertos[card.id] === índiceAtualDele`. Se ele sair dessa posição — movido direto ou empurrado por
outro —, a marca **desaparece sozinha**, porque a condição deixou de ser verdadeira. Nenhum código
extra de limpeza: a marca é derivada da posição atual, não um estado paralelo que envelhece.

Os demais cartões, em `corrigindo`, aparecem em **laranja** (a cor que já existe), com o número da
posição. Não acrescente nova cor nem novo símbolo.

⚠️ Enquanto ele arrasta, **não recalcule acerto nenhum**. `acertos` só muda quando ele confirma. Se o
verde acompanhasse o arraste em tempo real, o exercício viraria um detector de posição certa e ele
resolveria por tentativa e erro contínuo — o oposto do que ela pediu.

### 1.4 O que é medido, e o que é só registrado

Por história, guarde:

| campo | o que é |
|---|---|
| `acertoPrimeira` | cenas na posição certa **na 1ª confirmação** ÷ nº de cenas — **esta é a nota** |
| `acertoFinal` | o mesmo, na última confirmação da história |
| `confirmacoes` | quantas vezes confirmou nesta história |
| `resolvida` | terminou 100% certa? (em qualquer tentativa) |
| `resolvidaDePrimeira` | terminou 100% certa **na 1ª confirmação**? |
| `movimentos` | arrastes nesta história (o `swaps` que já existe, por história) |

`gradedRef` — o array que vira a `accuracy` da sessão — recebe **`acertoPrimeira`**, e só ele.

No `metadata` do `onComplete`, acrescente (mantendo **todos** os campos que já existem hoje):

```ts
storiesFirstTryExact: number,   // histórias resolvidas 100% já na 1ª confirmação
storiesSolvedAfter: number,     // resolvidas depois, após o feedback parcial
storiesUnsolved: number,        // não resolvidas (o tempo do bloco acabou antes)
accFirstTry: number,            // média de acertoPrimeira — igual à accuracy da sessão
accFinal: number,               // média de acertoFinal (informativo, NUNCA alimenta progressão)
confirmationsTotal: number,     // total de confirmações na sessão
```

⚠️ **`accFinal` não pode chegar a `lib/adaptive.ts`.** A progressão lê `accTotal`. Não troque,
não misture, não faça média dos dois. Se você sentir vontade de usar `accFinal` na progressão,
**pare e relate** — é o defeito que esta spec existe para evitar.

### 1.5 Teste obrigatório — o motor sai do componente

A lógica acima não pode viver dentro do JSX, ou não há como prová-la. Extraia para
`lib/ordem-historia/tentativas.ts` funções puras:

```ts
export interface RegistroHistoria {
  acertoPrimeira: number; acertoFinal: number; confirmacoes: number;
  resolvida: boolean; resolvidaDePrimeira: boolean; movimentos: number;
}
/** Cenas na posição certa: quantas, e o mapa cardId -> índice, para a marcação verde. */
export function avaliarOrdem(cards: { id: string; order: number }[]):
  { corretas: number; total: number; acertos: Record<string, number> };
/** Agrega as histórias da sessão no metadata. */
export function resumirSessao(registros: RegistroHistoria[]): { /* os 6 campos acima */ };
```

Em `lib/ordem-historia/tentativas.test.ts`, prove no mínimo:

1. `avaliarOrdem` conta certo em ordem perfeita, em ordem totalmente invertida e com cenas repetidas
   de posição; e o mapa `acertos` só contém os cartões realmente na posição certa.
2. **A prova que importa** — uma história resolvida só na 3ª confirmação entra com a acurácia da
   **primeira** (ex.: 1ª = 0,25 → `accFirstTry` = 0,25, mesmo com `acertoFinal` = 1). Monte também
   uma sessão inteira de 4 histórias em que **todas** terminam 100% e afirme que `accFirstTry` é
   **menor que 1**. Este teste é o que impede a progressão inflada voltar.
3. `storiesUnsolved` conta a história abandonada pelo fim do tempo, e ela **não** entra na média.
4. Sessão sem nenhuma história concluída não quebra (divisão por zero).

---

## 2. O retorno visual do arraste (seção 7 dela)

⚠️ **A auditoria de 13/set errou neste ponto e o VP corrigiu o documento em 14/set.** Não repita o
erro: o **cartão inteiro já arrasta** — `OrdemHistoria.tsx:127` aplica os `listeners` do dnd-kit ao
container, e o `⠿` da linha 165 é um `<span aria-hidden>` **sem listener nenhum**, puro desenho.

Então o pedido dela (*"não depender exclusivamente daquele pequeno ícone de pontinhos"*) **já está
atendido na mecânica**. O que falta é **comunicação e acabamento**:

1. **O ícone `⠿` engana** — comunica "arraste só aqui" quando o cartão todo arrasta. Troque-o por um
   sinal que não sugira alça exclusiva: uma borda/realce sutil no cartão sob o cursor, ou nada.
   Se optar por remover, remova de verdade; não deixe o elemento invisível.
2. **Segurar levanta o cartão** — hoje já há `scale(1.04)` e sombra. Refine: transição suave, sem
   salto brusco.
3. **O destino fica evidente** — o espaço onde o cartão vai cair precisa se anunciar (a posição de
   destino realçada, ou o cartão deslocado abrindo o vão). Use o que o `@dnd-kit/sortable` já dá,
   sem biblioteca nova.
4. **Encaixe ao soltar** — uma animação curta de assentamento. Curta: nada além de ~180 ms.
5. **Os demais cartões se reorganizam suavemente** — é a `transition` do `useSortable`; confira que
   não está sendo anulada pelo estilo inline.
6. **Área de toque confortável no celular** — confira o `TouchSensor` (hoje `delay: 160, tolerance: 8`).
   Se o arraste no celular exigir precisão demais, ajuste **a tolerância**, não o delay: reduzir o
   delay faz o gesto de rolar a página virar arraste por engano.

**Sem confete, sem quique, sem elástico.** A paleta e a linguagem visual do exercício ficam como estão.

**Teste obrigatório** (`lib/ordem-historia/interface.test.ts`, o mesmo arquivo da Fatia A): prove
**por posição, não por presença**, que os `listeners` continuam no container do cartão — localize o
elemento que recebe `setNodeRef` e exija que o spread de `listeners` esteja nele. O teste precisa
falhar se alguém mover os listeners para dentro de um ícone no futuro.

---

## 3. Sem limite de tentativas, e por quê (seção 12 dela)

Ela escreveu: *"Não adicionar limite rígido de tentativas sem antes me informar."*

**Não crie limite nenhum.** O contorno já existe e é duplo:
- a nota é a da 1ª tentativa (item 1), então insistir não melhora o registro;
- a sessão é governada pelo relógio do bloco (`useBlocoDeTreino`), que encerra sozinho.

`MAX_ATTEMPTS = 3` **continua valendo só para o "Descubra o que falta"**, como hoje. Não estenda.

---

## 4. A conclusão de uma história (seção 13 dela)

Quando a sequência fica 100% correta, em qualquer tentativa:

- **todas** as bordas passam a verde;
- um **✓ discreto** — o que já existe no número do canto basta, não invente selo grande;
- a frase curta **"Sequência correta."** (exatamente assim, com ponto final);
- transição curta e a próxima história entra.

**Proibido:** confete, estrelas, emoji animado, som de vitória, tela de parabéns, contagem de pontos.
Ela escreveu isso com todas as letras.

**Tempo:** hoje são 1,9 s no acerto e 3,2 s no erro. Com a segunda tentativa, o "erro" deixa de
avançar história — vira `corrigindo`, **imediato**, sem espera nenhuma (fazer o paciente esperar 3,2 s
para poder corrigir é fricção sem função). Mantenha os ~1,9 s só na conclusão correta; se ajustar,
declare o valor e o motivo.

---

## 5. Layout e o botão (seções 17 e 18 dela)

**Layout.** Hierarquia: instrução curta → cartões → Confirmar. Em tela grande, o botão hoje cai no
extremo inferior com espaço vazio no meio; **aproxime-o dos cartões** para o conjunto ler como uma
unidade — sem apertar a interface. No celular, mantenha o comportamento atual (o botão acessível no
rodapé). O conteúdo continua centralizado.

**Botão.** Estados visuais distinguíveis, **sem mudança brusca ou ambígua de cor**:
`padrão` · `hover` (desktop) · `pressionado` · `desabilitado` · `processando` · `feedback`.
Em `corrigindo`, o rótulo muda para **"Confirmar de novo"** — o paciente precisa saber que está numa
nova tentativa, não repetindo a mesma.

**Instrução (seção 19).** A do modo ordem já é curta e fica: *"Arraste as cenas para a ordem certa —
do começo ao fim."* Em `corrigindo`, troque por uma frase curta que **não entregue nada**:
**"As cenas em verde estão no lugar certo. Reveja as outras."**

---

## 6. Tutorial só na primeira utilização (seção 20 dela)

**Estado real, medido pelo VP — leia antes de escolher o caminho:** o projeto controla "tutorial
visto" no **banco** (`ExerciseConfig.tutorialCompletedAt`, via `/api/exercise-tutorial`), mas isso só
funciona para os **20 exercícios já convertidos ao framework T1**, listados em
`TUTORIAIS_POR_EXERCICIO` (`app/(patient)/treino/[exercicio]/page.tsx:58`). **Ordem da História não
está entre eles** — a tela de abertura dele é do próprio componente (`phase === "ready"`), e por isso
reaparece em toda sessão.

Converter o exercício ao T1 é um épico próprio e **não é esta fatia**.

**Faça o mínimo honesto:** a abertura completa (as 4 linhas de instrução) aparece na **primeira**
utilização; da segunda em diante, uma abertura **enxuta** — o título, a instrução de uma linha e o
botão "Começar". **Não entre direto no exercício sem gesto do paciente**: o relógio do bloco começa
no `begin()`, e iniciar sozinho faria o cronômetro correr antes de ele estar olhando.

Persistência: `localStorage`, chave **`np-ordem-historia-visto`**, no padrão que o Estacionamento já
usa com `np-parking-recent`. Envolva leitura e escrita em `try/catch` — navegador com armazenamento
bloqueado não pode derrubar a sessão; se falhar, caia para "mostrar a abertura completa".

📌 **Declare no relatório** que isto é por aparelho, não por paciente, e que o caminho definitivo é a
conversão ao T1. O VP vai relatar isso a ela.

---

## 7. Não repetir histórias recentes (seção 16 dela)

Existe hoje (`recentRef`, 60 ids), mas vive num `useRef`: **perde tudo ao recarregar a página ou ao
abrir a próxima sessão**. Persista na mesma chave-padrão do projeto: `localStorage`,
**`np-ordem-historia-recentes`**, guardando os últimos **30** ids, com `try/catch` nas duas pontas.
Ao montar, carregue; a cada história sorteada, grave.

Isso vale para os três modos (ordem, intruso, falta), que já compartilham o `recentRef`.

---

## Fronteiras — o que esta fatia NÃO faz

- ❌ classificar as 86 histórias por demanda cognitiva ou por tipo de raciocínio (seções 4 e 14) —
  **é trabalho clínico dela**, não de código, e ela ainda não entregou a classificação;
- ❌ converter o exercício ao framework T1 de tutorial;
- ❌ mexer em `lib/adaptive.ts`, nos limiares de progressão ou na barra de progresso;
- ❌ mexer nos modos "Encontre o Intruso" e "Descubra o que falta", fora do que o item 7 exige;
- ❌ criar, recortar, mover ou renomear **qualquer imagem**;
- ❌ mexer em `data/historias.ts` (a Fatia A já fez o que havia a fazer lá);
- ❌ acrescentar som, vibração, pontuação visível ou qualquer gamificação.

## Regras da casa

- **Você não commita.** Nem `git add`.
- **Não instale nada.** Este clone não tem `node_modules`: `tsc`, `vitest` e `npm` **não rodam aqui**.
  **Não finja ter rodado teste.** Prove com `node` puro o que der, cole a saída literal, e escreva
  "não consegui provar no lab" no resto. As provas são do VP, no repositório real.
- Interface 100% pt-BR com acentuação correta. **Linguagem clínica, nunca linguagem de software** —
  nada de "nível", "score", "tentativa 2/3", "dificuldade" na tela do paciente.
- Se qualquer coisa aqui divergir do código que você encontrar, **PARE e relate**. Relatar divergência
  é entrega bem-sucedida; adivinhar não.

## Critério de pronto

1. `lib/ordem-historia/tentativas.ts` + `tentativas.test.ts`, **com o teste que prova que uma sessão
   toda resolvida termina com `accFirstTry < 1`**.
2. `OrdemHistoria.tsx` com a fase `corrigindo`, os cartões **não travados**, a marca verde derivada da
   posição atual, e o rótulo "Confirmar de novo".
3. `metadata` com os 6 campos novos, sem perder nenhum dos atuais, e `accuracy` = 1ª tentativa.
4. O `⠿` resolvido, o arraste com retorno visual, e o teste **por posição** dos listeners.
5. Conclusão "Sequência correta.", sem confete.
6. `np-ordem-historia-visto` e `np-ordem-historia-recentes` no `localStorage`, ambos com `try/catch`.
7. `RELATORIO-CODEX.md` na raiz do clone: o que fez, o que decidiu, o que **não** conseguiu provar,
   as divergências encontradas, e a nota sobre o tutorial ser por aparelho.
