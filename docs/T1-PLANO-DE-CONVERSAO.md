# T1 — plano de conversão dos 34 exercícios

> Autorizado por ela em **07/ago/2026**, com o Span Direto aprovado como exercício de referência.
> Regras que toda conversão deve cumprir: `docs/T1-REGRAS-GLOBAIS.md`.

## Lote 0 — O FRAMEWORK (antes de qualquer exercício)

⚠️ **A regra 8 muda o framework.** Hoje o tutorial só aparece quando `tutorialRequired` é verdadeiro
e a preparação tem um botão só. Converter os 33 antes disso propagaria 33 vezes um framework
incompleto, e todos teriam de ser refeitos.

O que o Lote 0 entrega:

1. **Preparação com duas opções permanentes** — `Iniciar treino` (principal) e
   `Ver tutorial novamente` (secundária). A segunda aparece **sempre**, inclusive antes da primeira
   conclusão? **Não**: na primeira vez o tutorial é automático, então a preparação leva direto a ele.
2. **Caminho de revisão isolado** — rever o tutorial **não** chama `POST /api/exercise-tutorial` e
   **não** toca `tutorialCompletedAt`, `tutorialVersion` nem `tutorialSource`. É a diferença entre
   a primeira conclusão (grava) e a revisão (não grava nada).
3. **Textos padrão das regras 1 e 5** aplicados ao Span de referência.
4. Testes travando cada uma das 9 regras.

**Só depois disto começa a conversão.**

## Agrupamento por interação (medido no código, não suposto)

O gesto real de cada exercício foi levantado por varredura de `onClick`, `draggable`, teclado e
áudio nos componentes.

### Lote 1 — Áudio + teclado numérico *(reuso quase total do Span)*
`span-numerico-inverso`

> Compartilha o componente com o Span Direto. É o menor lote possível e serve de prova de que o
> framework replica sem retrabalho.

### Lote 2 — Áudio + sequência de itens
`letras-sequencia` · `sequencia-itens` · `antes-depois` · `desafio-supermercado`

> Todos têm áudio. A regra 3 (sincronismo) é o ponto crítico deste lote: cada um precisa do mesmo
> tratamento de `playing` que o Span recebeu.

### Lote 3 — Clique em grade ou célula
`matriz-espacial` · `matriz-espacial-inversa` · `cubo-corsi` · `jogo-memoria` · `padroes-rotacao` ·
`nback` · `lista-distracao`

> `DemoPointer` já resolve o cursor; muda o seletor do alvo.

### Lote 4 — Clique em alvo móvel ou temporizado
`mot` · `focus-agents` · `vigilancia` · `trilha-visual` · `tempo-reacao` · `semaforo`

> Cuidado: a demonstração precisa acontecer sem disparar o cronômetro clínico.

### Lote 5 — Escolha entre alternativas
`stroop-task` · `certo-ou-errado` · `identificacao-simbolos` · `task-switching` ·
`deductive-grid` · `informacao-em-foco` · `corrida-tempo`

### Lote 6 — Arrastar e ordenar
`ordem-historia` · `torre-hanoi` · `labirinto` · `estacionamento-logico` · `restaurante-ordem`

> ⚠️ Grupo de maior risco: o `DemoPointer` hoje demonstra **clique**, não **arrasto**. Vai precisar
> de um gesto novo (pressiona → move mantendo pressionado → solta no destino). Se não couber sem
> exceção, registrar em `docs/T1-INCOMPATIBILIDADES.md` **antes** de mudar o padrão global.

### Lote 7 — Entrada numérica e composição
`compra-multifuncional` · `dual-task` · `investigadores-sociais`

## Regras de execução de cada lote

- gates completos ao final de **cada** lote: `prisma validate` · `tsc` · suíte · `build` · `lint`;
- **nada** de melhoria individual nos exercícios — só preparação, demonstração e guiada;
- mecânica clínica, progressão, dificuldade e métricas **intocadas**;
- incompatibilidade se **registra e se pergunta**, nunca se resolve em silêncio;
- cada lote termina com commit descritivo e publicação.

## Contagem

| | |
|---|---|
| exercícios em `TUTORIAL_VERSIONS` | 34 |
| convertido (referência) | 1 — `span-numerico` |
| a converter | 33 |
