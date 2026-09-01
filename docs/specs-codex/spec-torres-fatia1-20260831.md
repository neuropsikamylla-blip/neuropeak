# Spec — Torres, fatia 1: o placar sai da execução e o mínimo deixa de ser obrigatório

Data: 2026-08-31
Arquivos: `components/exercises/executive/TorreHanoi.tsx`, `lib/torre-hanoi.ts`,
`lib/torre-hanoi.test.ts`.
Fonte da verdade: `docs/torres/ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md` (dela) e
`docs/torres/PLANO-TECNICO-TORRES-20260831.md` (meu). **Leia os dois antes de começar.**
Cobre as **Prioridades 1, 6 e 4** da seção 59 dela, mais as revogações que ela fechou.

---

## 0. O princípio que rege tudo nesta fatia

Palavras dela, 31/ago/2026:

> *"o paciente precisa resolver o problema, e não jogar contra o placar. O sistema registra tudo
> nos bastidores; a interface durante a execução deve deixar o raciocínio o mais limpo possível."*

## 1. O placar sai da execução (Prioridade 1)

Hoje o cabeçalho mostra, o tempo todo, dois indicadores lado a lado (render ~365):
`<Indicator label="Movimentos" value={moves} />` e `<Indicator label="Mínimo" value={optimal} />`.

**Os DOIS saem.** Decisão dela, confirmada: *"O paciente não vê movimentos realizados, mínimo,
eficiência nem cronômetro enquanto resolve. Tudo continua sendo contado internamente."*

- O estado `moves` **continua existindo e contando** — só não aparece.
- Se o componente `Indicator` ficar sem nenhum uso, remova-o; se ainda for usado, deixe.
- O bloco do cabeçalho (título "Jogo das Torres" + "Nível: N discos") fica. Cuide para o
  `flex justify-between` não deixar um buraco à direita agora que o lado direito esvaziou.
- **NÃO mexa** na barra de progresso da sessão (`gameProgress`): é a peça padrão da casa, e
  mudá-la é decisão dela, fora desta fatia.

## 2. A conclusão passa a informar, não a cobrar (Prioridade 6)

Hoje, ao resolver (render ~435):
- título `lastWasOptimal ? "Movimentos mínimos!" : "Resolvido!"`;
- `{moves} movimento(s) · mínimo: {optimal}`;
- e, quando não foi ótimo: **"Você pode fazer em {optimal} movimentos — tente de novo!"**

Passa a ser, seguindo a seção 7 da espec dela:

- **"Muito bem!"**
- **"Você resolveu o desafio em {moves} movimentos."**
- **"O menor caminho possível era {optimal} movimentos."**

**A frase "Você pode fazer em X movimentos — tente de novo!" SAI.** É cobrança, e cai na regra
dela: mostra-se o resultado, nunca o sermão.

Sobre o ícone/cor do bloco: hoje alterna troféu verde × check âmbar conforme `lastWasOptimal`.
Como resolver **já é sucesso** (seção 48: primeiro "resolveu o problema?"), use **um só
tratamento de sucesso** para os dois casos — sóbrio, sem medalha nem estrela (seção 44). Não
invente celebração extra.

⚠️ **Fora do escopo desta fatia:** os botões [TENTAR NOVAMENTE] / [CONTINUAR] da seção 7 dela.
Isso é a segunda tentativa (Prioridade 7), fatia própria. **NÃO construa aqui.**

## 3. O mínimo deixa de ser obrigatório (Prioridade 4 + revogações)

### 3.1 O que ela revogou explicitamente

> *"revogar especificamente a regra de que 'reinício custa o mínimo' ou de que é obrigatório
> atingir o mínimo para sucesso/progressão"*

e

> *"retire o limite rígido de 2 reinícios... Não deve aparecer 'você só pode reiniciar X vezes'
> nem impedir um novo reinício."*

### 3.2 `lib/torre-hanoi.ts` é reescrito

Sai `julgarPuzzle` (a regra `moves <= optimal && restarts === 0`). Entram funções puras para o
modelo novo:

```ts
export function eficiencia(moves: number, optimal: number): number;
// movimentos ÷ mínimo (seção 10). Guarde contra optimal <= 0 devolvendo... decida e DOCUMENTE
// no código o que faz nesse caso; não deixe NaN escapar.

export type FaixaEficiencia = "muito-boa" | "adequada" | "baixa";
export function faixaEficiencia(ef: number): FaixaEficiencia;
// seção 11 dela: até 1,20 muito boa · 1,21 a 1,40 adequada · acima de 1,40 baixa.
// ATENÇÃO ÀS BORDAS: 1,20 é "muito-boa"; 1,40 é "adequada". Teste exatamente 1.20 e 1.40.

export function deveSubirDeNivel(ef: number): boolean;
// Seção 13, na parte aplicável hoje: sobe quem resolve com eficiência BOA OU ADEQUADA,
// isto é ef <= 1.40. Acima disso, mantém o nível.
```

**Comentário obrigatório no arquivo**, para quem ler daqui a seis meses: o mínimo é **referência
e métrica interna**, nunca critério rígido de sucesso — resolver em 17 quando o mínimo era 15
**não é fracasso** (seção 9 dela).

### 3.3 O componente passa a usar isso

- `isOptimal`/`lastWasOptimal` deixam de governar sucesso. **Resolver o puzzle é o sucesso.**
- O que sobe o número de discos passa a ser `deveSubirDeNivel(eficiencia(moves, optimal))`.
  Mantenha o teto **em 5** — decisão dela: *"teto rotineiro em 5 discos... Não quero 7 ou 8"*.
  Troque `MAX_DISCS` de 8 para 5 e **deixe um comentário** dizendo que 6 volta só nas fases
  avançadas, quando existirem (fatia 5). Confira se algum cálculo de layout depende de
  `MAX_DISCS` (há um `towerH` que dimensiona a torre) e ajuste com cuidado para a torre não
  encolher demais nem sobrar espaço vazio — **relate o que fez**.
- `puzzleResults` passa a guardar também a eficiência da tentativa.
- O **limite de reinícios sai**: `MAX_RESTARTS_PER_PUZZLE` some, o botão nunca fica desabilitado
  por contagem e **o rótulo deixa de mostrar o número restante** — vira só **"Reiniciar"**.
  ⚠️ **Mantenha** a trava de `moves === 0` (não há o que reiniciar num tabuleiro intacto) e a de
  `won`. `restartsThisPuzzle` **continua contando** e continua indo ao metadata.
- **`accuracy`:** hoje é `puzzles ótimos ÷ total`. Como "ótimo" deixou de ser o critério, passe a
  usar **resolvidos ÷ total** (seção 48: primeiro "resolveu?"). Como todo puzzle registrado hoje
  foi resolvido, isso tende a 1 — então **registre no metadata a eficiência média da sessão**
  (`eficienciaMedia`), que é o dado clinicamente informativo. Mantenha `correct` no metadata,
  agora significando "resolvidos". **Não mexa em `calculateExerciseScore`.**

## 4. O que NÃO pode mudar

- Regras do jogo (um disco por vez, maior nunca sobre menor), `initialPegs`, `optimalMoves`
  (segue valendo para o Tipo A, que é o único que existe), a sessão de 11 min, o `setTimeout` de
  2500 ms entre puzzles, a barra de progresso.
- O formato do `onComplete` (só entram chaves novas no metadata).
- O botão Reiniciar em si e o registro de `restarts`/`puzzlesComReinicio`.

## 5. Prova de aceite

`lib/torre-hanoi.test.ts` é reescrito para o modelo novo. Precisa provar:
- a tabela de faixas **com as bordas exatas** (1.00, 1.20, 1.21, 1.40, 1.41, 2.00);
- que `deveSubirDeNivel` é verdadeiro em 1.40 e falso em 1.41;
- que **reinícios não influenciam mais** o julgamento — um teste nomeado de forma que denuncie a
  volta da regra antiga (ela foi revogada por decisão dela em 31/ago/2026, cite isso no nome ou
  num comentário);
- contagem, não caso único: percorra uma lista de eficiências e conte quantas caem em cada faixa.

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # todos passam (base: 57 arquivos / 769 testes)
```

**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

Cole no relatório:
- `grep -n "Mínimo\|mínimo" components/exercises/executive/TorreHanoi.tsx` → o mínimo só pode
  aparecer no bloco da CONCLUSÃO, em nenhum ponto da execução;
- `grep -n "tente de novo\|MAX_RESTARTS" components/exercises/executive/TorreHanoi.tsx` → zero;
- `grep -n "julgarPuzzle" components lib` → zero (a função foi revogada).

## 6. Relatório

O que mudou por arquivo; como resolveu o cabeçalho sem os indicadores; o que fez com `towerH` ao
baixar `MAX_DISCS`; e qualquer ponto em que a regra nova ameaçou mexer em algo fora do escopo.
