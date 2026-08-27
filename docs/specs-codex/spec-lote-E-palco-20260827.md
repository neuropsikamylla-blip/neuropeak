# Tarefa: palco nas telas compartilhadas + nos 3 de fundo dinâmico (Lote E)

Projeto NeuroPeak. TypeScript strict, Tailwind 3, Vitest 4. Comentários em português.
**Não commite nada.** Quem revisa, aplica e commita é o Claude.

## Leia antes

- `docs/auditoria-layout/PADRAO-PALCO-SPEC.md`
- `components/exercises/ExerciseStage.tsx` — o palco já tem `background` **e**
  `backgroundClassName`.
- **Exemplos já aprovados:** `attention/CacaItemBarato.tsx` (usa `backgroundClassName`),
  `memory/LetrasSequencia.tsx` (duas telas, um palco em cada).
- `lib/layout/palco.test.ts` — **não quebre nenhum teste que já existe.** Se um deles depender
  de sintaxe que você mudou, ajuste o teste para proteger o comportamento, não a sintaxe, e
  diga isso no relatório.

## Parte 1 — as três telas COMPARTILHADAS (as de maior alcance)

Aparecem em muitos exercícios, então carregam o defeito para todos eles. Todas já centralizam
(`flex items-center justify-center`); o que sobra é o `min-h-screen` empilhado dentro do
wrapper e a largura apertada.

| arquivo | largura | o que remover |
|---|---|---|
| `components/exercises/TutorialBase.tsx` (linha ~123) | `compacto` | `min-h-screen`, o `p-4`, o `flex items-center justify-center`, e o `max-w-md` do card |
| `components/exercises/tutorial/TutorialRunner.tsx` (~207) | `compacto` | idem, e o `max-w-xl` do card |
| `components/exercises/PreparationScreen.tsx` (~59) | `compacto` | idem, e o `max-w-md` do card |

Detalhes que importam:

- **`TutorialBase`** tem `relative` no raiz e renderiza `<TechBg/>`/`<ColorfulBg/>`/`<BeigeBg/>`
  como fundo. Esses componentes vão **dentro** do palco, como primeiro filho. **Confirme como
  cada um se posiciona** (`fixed` ou `absolute`): se for `absolute`, precisa de um ancestral
  `relative` dentro do palco para continuar cobrindo o fundo, e não o card. Diga no relatório
  o que encontrou e o que fez.
- `TutorialRunner` e `PreparationScreen` usam `${styles.screen}` no raiz — isso é o fundo do
  tema. Passe em `backgroundClassName`, não o descarte.

## Parte 2 — os três de FUNDO DINÂMICO

Nestes, **o fundo da tela inteira É o feedback do exercício**: pisca a cada resposta. É sinal
clínico, não enfeite. Se o flash sumir, o exercício perde a resposta ao paciente.

| arquivo | largura | como preservar o flash |
|---|---|---|
| `processing/Semaforo.tsx` | `compacto` | o raiz é `min-h-screen flex flex-col bg-gray-900 transition-colors duration-150 ${flashClass}` — leve `bg-gray-900 transition-colors duration-150 ${flashClass}` **inteiro** para `backgroundClassName` |
| `processing/TempoReacao.tsx` | `compacto` | o raiz usa a variável `bg`, que muda com a fase — vai para `backgroundClassName={bg}` |
| `processing/CertoOuErrado.tsx` | `compacto` | idem, variável `bg` → `backgroundClassName={bg}` |

⚠️ **Não converta classe em cor.** O flash depende da classe trocar; um hexadecimal fixo mata
o feedback. E mantenha `transition-colors duration-150` junto — sem ela o flash vira um corte
seco em vez de uma transição.

## Teste

1. Estenda a lista do teste `"mantém os exercícios migrados centralizados no palco"` com
   Semáforo, Tempo de Reação e Certo ou Errado (todos `compacto`).
2. Crie um teste separado para as três telas compartilhadas, provando `min-h-screen` = 0 e
   uso de `ExerciseStage` em cada uma. Comentário dizendo o defeito real que impede de voltar:
   a tela de tutorial e a de preparação somavam uma viewport dentro do wrapper, e é por isso
   que toda tela de exercício rolava e mostrava uma faixa do fundo do tema no topo.
3. **Um teste que prova que o flash sobreviveu:** para os três da Parte 2, prove que o arquivo
   passa uma **classe variável** ao palco (`backgroundClassName={...}` com a variável), e não
   uma string literal de cor. Escreva-o de modo que ele falhe se alguém trocar por
   `background="#..."` — verifique isso mentalmente antes de entregar.

## Prova de aceite

```
npx tsc --noEmit      # exit 0
npm run test          # verde
npm run build         # exit 0
```

Sem `node_modules` no clone, **diga isso** em vez de afirmar que passou. Nunca reporte um
comando como aprovado sem ter visto a saída dele.

## Fora de escopo

MOT, Labirinto, Ordem da História (medem `window.innerWidth` — outro lote); Informação em
Foco, Compra Multifuncional, Desafio Cidade, Estacionamento, Vigilância, Investigadores,
Supermercado, Restaurante, Sequência Temporal (lote seguinte); `focus-agents`;
`ExerciseWrapper.tsx` (é o dono da altura — o `min-h-screen` dele FICA).
