# SPEC — Tutoriais da Vigilância e do MOT: usar o exercício real

**Data:** 11/ago/2026 · **Executor previsto:** Codex · **Repositório:** clone descartável
**Não commitar.** Quem revisa o diff, aplica, prova e commita é o Claude.

Duas tarefas independentes. **Não misture num único bloco de mudança.**

---

## ⚠️ O lab não tem `node_modules`

Você **não conseguirá** rodar `npm test`, `tsc` nem `build`. Escreva os testes assim mesmo, e
**não afirme que rodou nada**. As provas rodam no repositório real, por quem revisa. Na rodada
anterior um erro de tipo passou justamente por isso — declare o que não pôde verificar.

## Como o projeto prova coisas

Não existe `testing-library` nem `jsdom`; **o Vitest roda em `environment: node` e não importa
JSX**. Nenhum teste renderiza componente, e `.tsx` não pode ser importado por teste. O padrão da
casa: **funções puras** testadas direto, e **leitura do fonte** (`readFileSync` + regex/posição)
para o que vive dentro de componente. Veja `lib/tutorial/focus-agents.test.ts` — é o exemplo mais
recente e o modelo a seguir.

---

## O defeito, e por que ele é o mesmo nos dois

Ela foi treinar em 11/ago e travou. Os tutoriais destes dois exercícios **não mostram o exercício**:
foram desenhados à mão dentro de `lib/tutorial/definitions/estimulo-continuo.tsx`, com formas em CSS
que imitam de longe a tarefa real.

| exercício | o que o tutorial mostra hoje | o que o exercício é de verdade |
|---|---|---|
| `vigilancia` | 3 caixas brancas com um losango desenhado em CSS (`function Pipa`) | **8 pipas** (7 idênticas + 1 diferente), **imagens reais** sobre um **fundo real**, e a resposta é **clicar na região** onde estava a diferente |
| `mot` | 4 círculos, 2 com contorno laranja | bolas que **piscam como alvo**, depois **todas se movem** com física de colisão, e por fim o paciente **seleciona os alvos** |

Na Vigilância o descasamento é tão grande que **ela não consegue completar o tutorial nem entrar no
exercício**.

**A regra violada é dela, de julho/2026, e vale para os 34:** *"o tutorial precisa ser uma réplica
perfeita dos exercícios"*. Reimplementar a tarefa em CSS não é réplica — é uma segunda versão que
diverge no primeiro dia.

> **O modelo a seguir é `lib/tutorial/definitions/focus-agents.tsx`**, aprovado por ela em 11/ago.
> Ele usa as peças reais do exercício (gerador de rodada, montagem de cena, passo de animação) e
> gera tudo **dentro** dos componentes.

---

# TAREFA A — tutorial da Vigilância

## O que você já tem pronto

**Não precisa extrair nada.** O motor puro já existe e é importável:

- `lib/vigilancia.ts` — `gerarCentros`, `classificarToque`, `gerarSequenciaPosicoes`,
  `tempoDoDegrau`, `POSICOES`, e os tipos `Arranjo`, `Ponto`, `Classificacao`, `Tolerancia`.
- `lib/vigilancia-dados.ts` — `NIVEIS`, `parById`, `fundoById`, `imgPipa`, `imgFundo`. **As pipas e
  os fundos são imagens de verdade**, e é isso que o tutorial precisa mostrar.
- `components/exercises/attention/Vigilancia.tsx` — leia para reproduzir o fluxo fielmente.

## O que construir

`lib/tutorial/definitions/vigilancia.tsx`, exportando `vigilanciaTutorial`.

- `exerciseId: "vigilancia"`, `version: 2` (precisa casar com `TUTORIAL_VERSIONS`).
- **Fluxo 1 — demonstração + tentativa guiada.** `modo`: **não declare** (o default `"completa"` é o
  correto), **a menos que** a mecânica exija o modo `"continua"` já existente; se achar que exige,
  **pare e relate** em vez de decidir. ⛔ Nunca `"explicativo"`.
- **`Demonstration`** — o fluxo real, na ordem do exercício: ponto de fixação → as **8 pipas**
  aparecem juntas sobre o fundo, pelo tempo do degrau mais confortável → somem → o `DemoPointer`
  vai até **a região onde estava a diferente** e pressiona → o acerto é sinalizado como o exercício
  sinaliza.
  - Use `gerarCentros` para as posições e as imagens reais via `imgPipa`/`imgFundo`.
  - Use o degrau **mais confortável** disponível (o exercício tem uma constante para isso) — o
    tutorial ensina, não pressiona.
  - **O tutorial é o único lugar que pode mostrar qual é a pipa diferente**, e o próprio cabeçalho
    do exercício diz isso ("Só o tutorial mostra o alvo 1×"). Destaque-a **uma vez**, na
    demonstração.
- **`GuidedAttempt`** — mesma cena; o paciente clica. Use **`classificarToque`** para decidir se
  acertou: é a mesma função que o exercício usa, então tutorial e treino não podem discordar sobre
  o que é acerto. Acertou → `correct`; errou → `incorrect`.
- `guidedInstruction` — verbo real: **clique**. ⛔ "toque" e "teclado" são proibidos e há teste.
- `retryHint` — uma frase, imperativa.
- `smallestValidUnit` — **derive da mecânica** (o exercício responde uma posição por tentativa),
  nunca um número solto.

## ⛔ Regra 6 — o tutorial ensina, não mede

**Sem relógio de resposta, sem pontuação, sem omissão.** Se o paciente demorar, não acontece nada.
O tempo de EXPOSIÇÃO das pipas existe (faz parte da mecânica); o tempo de RESPOSTA, não.

---

# TAREFA B — tutorial do MOT

## Primeiro, extrair (o exercício guarda tudo dentro do componente)

Mover de `components/exercises/attention/MOT.tsx` para **`lib/mot/scene.ts`**, sem alterar
comportamento:

- `BALL_RADIUS`, `ASPECT`, `MAX_TARGETS`;
- `targetsForLevel`, `speedStepForLevel`, `ballSpeed`, `totalBalls`, `trackDuration`;
- `randomBalls` e `stepAll` (a física: rebate nas paredes e colide entre si);
- o tipo `Ball`.

O componente passa a **importar** daqui, sem manter cópia.

**`randomBalls` recebe aleatoriedade injetável** (`random: () => number`, default `Math.random`) —
sem isso não há teste determinístico, e é o mesmo desenho já aprovado em `lib/focus/scene.ts`.

### Prova de aceite da extração (escreva ANTES)

Em `lib/mot/scene.test.ts`, com aleatoriedade determinística:
1. `randomBalls` devolve o total esperado para o nível, com a quantidade certa de alvos, todas
   dentro da arena (respeitando o raio).
2. As bolas nascem **separadas**: nenhuma dupla mais próxima que a distância mínima do gerador.
3. `stepAll` **rebate**: bola encostando na parede inverte a velocidade e não sai do quadro.
4. `stepAll` **separa colisões**: duas bolas sobrepostas deixam de estar sobrepostas.
5. **Não vaza:** 300 passos seguidos e todas continuam dentro da arena.
6. Determinismo: mesma semente → mesmas bolas; sementes diferentes → bolas diferentes.
7. Por leitura do fonte: as fórmulas moram em `lib/mot/scene.ts` e **não** em `MOT.tsx`.

## Depois, o tutorial

`lib/tutorial/definitions/mot.tsx`, exportando `motTutorial`.

- `exerciseId: "mot"`, `version: 1` (case com `TUTORIAL_VERSIONS`).
- **Fluxo 1**, `modo` não declarado.
- **`Demonstration`** — as **três fases reais**, na ordem: os alvos piscam destacados → **todas as
  bolas se movem de verdade**, usando `stepAll` em `requestAnimationFrame` → param → o `DemoPointer`
  clica **em cada alvo** e confirma.
  - Use `trackDuration` do nível mais baixo para a fase de movimento, e o menor número de alvos.
  - Como o alvo se move, o ponteiro precisa de **`trackTarget`** (prop do `DemoPointer`; existe
    exatamente para isso e só o tutorial do Focus a usa hoje).
- **`GuidedAttempt`** — mesmas três fases; quem seleciona é o paciente. Selecionou exatamente os
  alvos → `correct`; qualquer não-alvo → `incorrect`.
- `guidedInstruction` com **clique**; `retryHint` de uma frase.
- `smallestValidUnit` — derive de `targetsForLevel` no nível mínimo.

---

# Comum às duas tarefas

## Onde a cena NÃO pode ser gerada

⛔ **Nunca no topo do módulo, nem no corpo do render.** Os geradores usam aleatoriedade, e no Next o
módulo é avaliado no servidor **e** no cliente: cenas diferentes, hidratação quebrada. **Gere num
efeito de montagem**, guardando em estado. Foi um dos defeitos que reprovaram uma entrega anterior.

## O que remover, com cuidado

De `lib/tutorial/definitions/estimulo-continuo.tsx`: as definições antigas `vigilanciaTutorial` e
`motTutorial`, e os painéis desenhados à mão que só elas usam (`VigilanciaBoard`, `Pipa`, e o board
do MOT). **Não toque nos outros cinco** exercícios daquele arquivo — eles continuam como estão.

Em `app/(patient)/treino/[exercicio]/page.tsx`, os imports passam a vir dos arquivos novos. **O
número de exercícios registrados no mapa não muda** — continuam 20.

Os testes existentes que citam esses dois na fábrica antiga (`lib/tutorial/estimulo-continuo.test.ts`
e o que mais apontar) precisam acompanhar. **Não relaxe asserção para fazer passar**: se um teste
protege uma regra, mantenha a regra e ajuste o alvo.

## O que NÃO tocar

⛔ Mecânica clínica dos exercícios: progressão, dificuldade, tempo de exposição, pontuação,
metadata, adaptação. **Esta spec não muda nenhum exercício** — só extrai (MOT) e cria tutoriais.
⛔ `TutorialRunner`, `ExerciseWrapper`, `versions.ts`, `lib/tutorial/state.ts`.
⛔ `DemoPointer` — a prop `trackTarget` já existe; use, não altere.
⛔ Emoji em qualquer arquivo do framework de tutorial: há teste varrendo faixas Unicode. Use ícones
do `lucide-react`, como as outras definições.

## Prova de aceite dos tutoriais (escreva ANTES)

Um arquivo por exercício, no estilo de `lib/tutorial/focus-agents.test.ts`:

1. Fluxo 1: não contém `modo: "explicativo"` nem `explicacao:`.
2. Versão coerente com `TUTORIAL_VERSIONS`, e o teste falha se um dos dois mudar sozinho.
3. `guidedInstruction` usa "clique"; o arquivo não casa `/teclado/i`.
4. `smallestValidUnit` é derivado, e o literal correspondente **não** aparece escrito à mão.
5. A cena não nasce no módulo — prove **por posição**, não por presença de palavra.
6. **Usa as peças reais:** o tutorial da Vigilância importa de `lib/vigilancia` e
   `lib/vigilancia-dados` (incluindo `imgPipa`/`imgFundo`); o do MOT importa de `lib/mot/scene`.
7. **Não sobrou desenho à mão:** nenhum dos dois arquivos redefine a forma do estímulo em CSS —
   e `estimulo-continuo.tsx` não contém mais `function Pipa`.
8. Regra 6: nenhum dos dois contém `Date.now`, `performance.now`, `reactionTime`, `score`,
   `accuracy` nem `omiss`.
9. Regra 10: nenhum contém `onTutorialDone`, `fetch(` nem `tutorialCompletedAt`.
10. O do MOT usa `trackTarget` e `stepAll`; o da Vigilância usa `classificarToque`.

---

## Regras da casa

- **Não commite.** Não altere `PROGRESSO.md`, `CLAUDE.md` nem documento de estado.
- Comentário explica **por quê**, nunca o que a linha já diz.
- Interface em pt-BR com acentuação correta.
- Encontrou contradição entre esta spec e o código? **Pare e relate.** Não decida em silêncio — na
  rodada de 09/ago, três decisões tomadas em silêncio reprovaram a entrega inteira.
- Ao terminar, relate: o que fez, quais arquivos criou, e **o que não conseguiu verificar**.
