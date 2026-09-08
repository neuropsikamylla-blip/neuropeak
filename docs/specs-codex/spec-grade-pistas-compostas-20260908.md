# Spec — Grade Dedutiva, fatia A: pistas compostas e rótulos de posição

Data: 2026-09-08
Origem: fechamentos 1, 2 e 6 dela, de 08/set.

Fontes, nesta ordem: esta spec · `docs/grade-dedutiva/PROPOSTA-BANCO-F5-20260908.md` ·
`docs/grade-dedutiva/DECISOES-MECANICA-20260903.md` · `lib/grade/`.

**Leia `lib/grade/tipos.ts`, `motor.ts`, `solver.ts`, `derivacao.ts`, `estrutura.ts` e `banco.ts`
antes de escrever qualquer linha.**

⛔ **NÃO toque em `components/exercises/executive/DeductiveGrid.tsx`.** Ela foi explícita:
*"Não mexer na interface nesta etapa."* A interface usa **apenas** `pista.id` e `pista.texto`; se o
refactor estiver certo, ela **compila sem alteração nenhuma**. Se você achar que precisa mudá-la,
**PARE e relate** em vez de mudar.
⛔ **NÃO escreva problemas novos** e **NÃO implemente a régua estrutural** — é a fatia B.
⛔ **NÃO apague nenhum teste existente.** `solver.test.ts` é a prova do motor; ele se **adapta** ao
formato novo, testando as **mesmas** propriedades. A contagem de testes não pode cair.

---

## 1. Pistas compostas — o modelo

Palavras dela: *"Quero suportar uma pista visual contendo múltiplas restrições atômicas. Não criar
um operador específico apenas para frases como 'Nina não participou de História nem esteve na Sala
Pesquisa'."* · *"Para o paciente continua sendo UMA pista. Para o solver podem existir duas ou mais
restrições."*

O esboço dela é `{ id, text, constraints: Constraint[] }`. **Traduza para o português do módulo**,
que é a convenção de `lib/grade/`:

```ts
/** Uma restrição atômica: o que o solver avalia. */
export type Restricao = /* união discriminada por `tipo`, exatamente as formas de hoje, com `id` próprio e SEM `texto` */

/** O que o paciente lê: UMA pista, com uma ou mais restrições. */
export interface Pista {
  id: string;
  texto: string;
  restricoes: readonly Restricao[];   // pelo menos uma
}
```

Ou seja: o que hoje é `PistaT1 … PistaT11` vira `RestricaoT1 … RestricaoT11` (mesmos operandos,
mesmo `tipo`, `id` próprio), e `Pista` passa a ser o invólucro.

**Helper obrigatório** para o caso comum de uma restrição só, que é a maioria:
`export function pistaSimples(id: string, texto: string, restricao: Omit<Restricao, "id">): Pista`
— gera o `id` da restrição de forma determinística a partir do id da pista (ex.: `${id}#1`).

### 1.1 O que muda no motor

- `OPERADORES` continua indexado por `tipo` e passa a ser aplicado **por restrição**.
- `criarContexto` compila **cada restrição** (hoje compila cada pista). `PistaCompilada` vira
  `RestricaoCompilada` e **guarda o id da pista dona** — é isso que permite o registro por
  `clueId` + `constraintId` que ela pediu.
- `itensDaPista(pista)` **continua existindo** e devolve a **união** dos itens de todas as
  restrições; acrescente `itensDaRestricao(restricao)`.
- `validarEstruturaPuzzle` passa a exigir: toda pista tem **≥ 1** restrição; ids de pista **únicos**;
  ids de restrição **únicos dentro do puzzle**; e valida os operandos **de cada restrição** como já
  faz hoje.

### 1.2 O que muda na derivação — e o que NÃO muda

`derivar()` continua trabalhando no nível da **PISTA**, não da restrição. Razão, que deve ficar num
comentário: **a pessoa lê e risca pistas, não restrições** — profundidade inferencial e a
classificação *essencial · útil · redundante* são sobre o que ela manipula. As contagens de
**cross/intra** é que serão por restrição, e isso é da fatia B.

---

## 2. `restricoesViolando` — a precisão que ela pediu

Ela quer registrar *"qual restrição atômica foi violada"*.

Acrescente a `solver.ts`:

```ts
export function restricoesViolando(
  puzzle: Puzzle, parcial: MarcacaoParcial
): { pistaId: string; restricaoId: string }[]
```

**Semântica EXATA, e é isto que a torna diferente de `pistasEmConflito`:** devolve as restrições
cujos operandos estão **todos determinados** pela marcação atual e cuja avaliação `satisfaz` dá
**falso**. Nada de heurística — é verificação direta.

`pistasEmConflito` **permanece como está**, com o comentário que já tem: conjunto **seguro** de
pistas relevantes, **não um MUS**. As duas convivem: a exata para quando dá para ser exata, a segura
para o resto.

⚠️ **REGRA CLÍNICA, e violar isto destrói o exercício:** este dado vai **somente** para o registro de
processo. **NUNCA** para a tela. A verificação continua dizendo apenas que existe uma
incompatibilidade — nunca qual, nunca onde. Deixe isso escrito num comentário sobre a função.

---

## 3. `rotulosPosicao` — o eixo

Fechamento 2 dela, aprovado: *"Se o horário é uma sequência estrutural conhecida... deve ser usado
como rótulo das colunas, e NÃO como categoria a ser descoberta. A engine continua trabalhando
internamente com posições 0..N-1."*

Acrescente ao `Puzzle`:

```ts
/** Rótulos das colunas. Ausente = "Posição 1", "Posição 2"… A engine só conhece 0..N-1. */
rotulosPosicao?: readonly string[];
```

`validarEstruturaPuzzle` rejeita quando presente e com comprimento diferente de `posicoes`, ou com
rótulo vazio/repetido.

⚠️ **NÃO consuma este campo na interface nesta fatia** — ela proibiu mexer na tela agora. O campo
entra no modelo e é validado; a exibição vem junto com o banco novo.

---

## 4. Migração de `banco.ts`

Migre os **três** puzzles atuais para o formato novo, **sem mudar a lógica de nenhum**: mesmas
restrições, mesmos textos, mesma solução. É tradução de forma, não de conteúdo.

⚠️ Eles **continuam reprovando** na triagem estrutural — isso é **esperado e correto**, ela já
confirmou que serão **refeitos**. Não "conserte" nenhum deles.

Acrescente **uma** pista composta de verdade, como prova viva do formato — no **museu**, a frase
dela: *"Nina não participou de História nem esteve na Sala Pesquisa"* não cabe lá; use o equivalente
com os nomes do museu, por exemplo *"Iara não conduziu a obra Duna nem esteve na sala Oeste."*,
**se e somente se** isso **não** alterar a solução única do puzzle (prove com `temSolucaoUnica`).
**Se alterar, não force:** deixe os três como estão e crie a pista composta apenas nos testes.

---

## 5. Provas

```
npx tsc --noEmit          # exit 0, exit code SEM pipe
npm run test              # base: 68 arquivos / 917 testes — NÃO PODE CAIR
```
**NÃO rodar `npm run build`.**
Você provavelmente **não conseguirá rodar nenhum dos dois no lab**, por falta de `node_modules`.
**Declare isso** em vez de fingir; a prova é do VP no repositório real.

Testes obrigatórios (novos, além dos adaptados):
- uma pista com **2 restrições** restringe o solver como **duas** pistas separadas restringiriam —
  compare `contarSolucoes` das duas montagens: têm de dar **o mesmo número**;
- `restricoesViolando` acha **exatamente** a restrição violada de uma pista composta cujas outras
  restrições estão satisfeitas — e **não** devolve as satisfeitas;
- `restricoesViolando` devolve **vazio** quando os operandos ainda **não** estão todos determinados,
  mesmo havendo contradição latente (é o que separa a função exata da heurística);
- `pistaSimples` gera restrição com id determinístico e preserva o texto;
- `validarEstruturaPuzzle` rejeita: pista sem restrição · ids de restrição repetidos ·
  `rotulosPosicao` com comprimento errado · rótulo repetido;
- `derivar()` continua classificando por **pista**, e uma pista composta é **uma** entrada na
  classificação, não duas.

## 6. Relatório

Como ficou a união discriminada; se a interface compilou **sem tocar** (e, se não, PARE e relate);
se a pista composta coube no museu sem alterar a solução; e a confirmação de que nenhum teste foi
apagado e a contagem não caiu.
