# Grade Dedutiva — auditoria e propostas: dosagem, tutorial e custo do solver

Data: 2026-09-03 · Autor: VP (Claude Opus 5) · Estado: **PROPOSTA, nada implementado**

Escrito a pedido dela, depois da aprovação técnica da Fase 3: *"Antes de alterar, audite como os
demais exercícios encerram por tempo/progresso e proponha como integrar a Grade ao mesmo
framework"* · *"Audite como a plataforma registra tutorial já realizado e proponha a integração
antes de mudar"* · *"não otimizar ainda por suposição... Quero tempos reais antes de decidir"*.

**Nada aqui foi aplicado ao código.** A mecânica segue intocada, como ela determinou.

---

## 1. Dosagem — como os outros exercícios encerram

### O que existe (auditado no código, não presumido)

`useTimedProgress` (`components/exercises/useExerciseEngine.ts:25`) é o framework temporal da
plataforma, usado hoje por **37 componentes de exercício**. O que ele faz:

- alvo padrão de **7 minutos** (`DEFAULT_TARGET_MS`), sobrescritível por exercício;
- conta **tempo ATIVO**, não relógio de parede: se o paciente passa **15 s** sem tocar ou teclar
  (`IDLE_MS`), o cronômetro **pausa**. Quem se distrai ou se levanta não é penalizado;
- expõe `begin()`, `isTimeUp()`, `elapsedSec()`, `finish()` e `progressPct`.

### O precedente exato: a Torre

`TorreHanoi.tsx` já faz **exatamente** a sequência de problemas dentro de uma sessão que ela quer
aqui, e o modelo pode ser copiado quase linha a linha:

- `useTimedProgress(11 * 60 * 1000)` — 11 minutos, valor que **ela própria pediu** para tarefa de
  planejamento; a Grade é da mesma família e provavelmente quer algo parecido, não os 7 padrão;
- ao concluir cada problema, consulta `isTimeUp()`: **não acabou o tempo** → seleciona o próximo
  problema e continua na mesma sessão; **acabou** → `finish()` e um único `onComplete` com os
  resultados **acumulados**;
- a seleção do próximo vem de uma função pura (`proximoProblema(fase, usados, tipos)`) que recebe
  o que já foi usado — é aí que entra a sequência **misto → focalizado → transferência**.

### Onde a Grade está hoje

`DeductiveGrid.tsx` **não usa `useTimedProgress`**. Faz tutorial 3×3 → um desafio → `onComplete`.
Uma sessão é um problema.

### Proposta

1. Adotar `useTimedProgress` com alvo próprio (**sugestão: 11 min**, como a Torre — a decidir com
   ela; raciocínio dedutivo não cabe em 7).
2. Ao concluir um problema: se `isTimeUp()` for falso, **carregar o próximo** e manter o registro
   de processo **por problema** numa lista, como a Torre faz; se verdadeiro, `finish()` e um só
   `onComplete` com o acumulado.
3. Criar `lib/grade/selecao.ts` — função **pura e testável**, espelhando `lib/torres/selecao.ts` —
   que recebe *(nível, problemas já usados, e futuramente o alvo de focalização)* e devolve o
   próximo. **É este o ponto de entrada da sequência misto → focalizado → transferência**: por
   ora devolve só "próximo não usado do nível"; na F6 ganha o alvo, **sem que a tela mude**.
4. ⚠️ Consequência que precisa de decisão dela: com vários problemas por sessão, a **acurácia
   provisória** passa a ser uma **média por sessão**, não um número por problema. Isso já é assim
   na Torre. Não muda a fórmula, muda o que ela agrega.

⚠️ **Bloqueio real:** hoje o banco tem **3 problemas** (1 tutorial + 2 desafios). Uma sessão de
11 minutos os esgota. **Esta mudança só faz sentido junto com a F5**, ou logo depois dela.

---

## 2. Tutorial — como a plataforma registra o que já foi feito

### O que existe (a infra está pronta, e é boa)

- **Persistido no banco**, não em `localStorage`: `ExerciseConfig.tutorialCompletedAt`,
  `tutorialVersion`, `tutorialSource`. Sobrevive a troca de aparelho.
- `lib/tutorial/state.ts` → `tutorialRequired(state, versaoExigida)`: exige o tutorial quando
  **nunca foi feito** ou quando a **versão registrada é menor que a exigida**. É assim que uma
  mecânica reformulada faz o tutorial reaparecer para quem já o tinha visto — **exatamente o
  nosso caso**.
- `lib/tutorial/versions.ts` → `TUTORIAL_VERSIONS`, hoje com `"deductive-grid": 1`.
- `POST /api/exercise-tutorial` grava a conclusão; `completionRecordFor(isReview, versao)` garante
  que **rever é consulta, não conclusão** — a revisão nunca regrava.
- `ExerciseWrapper` só mostra o tutorial quando recebe uma `TutorialDefinition` **e**
  `tutorialRequired` diz que sim; e trata `tutorialState === undefined` como "ainda carregando",
  preferindo **pular** a repetir para quem já concluiu.
- A ligação acontece em `TUTORIAIS_POR_EXERCICIO[exerciseId]`
  (`app/(patient)/treino/[exercicio]/page.tsx:462`).

### Onde a Grade está hoje

A Grade **tem** entrada em `TUTORIAL_VERSIONS` mas **não tem `TutorialDefinition`** registrada —
nunca foi convertida ao framework T1. Por isso o tutorial dela sempre viveu dentro do componente,
e sempre rodou em toda sessão (o código antigo também fazia isso: `useState(true)`).

### Proposta

1. Escrever uma `TutorialDefinition` para `deductive-grid` **usando o 3×3 que já existe**
   (`PROBLEMA_TUTORIAL`) e as peças reais da tela — a regra dela de 12/ago é que o tutorial **É**
   o exercício rodando, e a Fase 3 já entregou isso; falta só **plugá-lo no framework**.
2. Registrar em `TUTORIAIS_POR_EXERCICIO` e subir `TUTORIAL_VERSIONS["deductive-grid"]` de
   **1 → 2**. O bump é o que faz o tutorial **reaparecer uma vez** para quem aprendeu a mecânica
   velha dos `✓`/`✗` — e só uma vez.
3. Remover do componente o 3×3 obrigatório: quem já concluiu entra **direto no treino real**.
4. Manter "rever tutorial" disponível, que o framework já oferece sem regravar.

---

## 3. Solver — medição, não suposição

`estadoDaAtribuicao` roda **duas buscas CSP por clique**. Ela pediu números antes de decidir.

**Medido** em `lib/grade/bench-5x6.test.ts`, no repositório real, no tamanho máximo planejado —
**5 posições × 6 categorias**, o puzzle com **solução única provada** pelo solver:

| cenário | custo por clique |
|---|---|
| grade vazia (primeiro clique, domínios todos abertos) | **0,12 ms** |
| meio da resolução | **0,08 ms** |
| estado já contraditório | **0,02 ms** |
| **teto** — mesmo 5×6 com só 10 pistas, busca muito maior | **0,36 ms** |

O teto foi medido de propósito abandonando a unicidade: menos pistas = domínios mais abertos =
mais busca. É o custo computacional máximo do formato, não um caso jogável.

### Conclusão

**Nenhuma otimização se justifica.** O pior caso medido é **0,36 ms**, cerca de **45 vezes** abaixo
do orçamento de um quadro de 60 fps (16,7 ms) e muito além do limiar de percepção humana. Cache,
resolução incremental ou mover para worker seriam complexidade paga sem contrapartida.

⚠️ **O que revalidar na F5**, quando os problemas reais existirem: os números acima usam pistas
`T1`/`T3`, que são fortes. Problemas com predomínio de `T7` (entre) e `T4` (ordem relativa) abrem
mais o espaço de busca. O benchmark ficou **no repositório e reprodutível** — é só rodar
`npx vitest run lib/grade/bench-5x6.test.ts --reporter=verbose` sobre o banco novo.

---

## 4. O que NÃO mudou, por decisão dela

- A **mecânica**, intocada até a revisão visual.
- A **fórmula de acurácia**, que permanece **explicitamente provisória**. A F6 vai reconstruir a
  decisão adaptativa com **múltiplos indicadores de processo**, não só tentativas de conclusão.
- A **separação de três estados** da atribuição — *determinada*, *ainda em aberto*, *estado já
  contraditório*. **Não voltam a se misturar.**
