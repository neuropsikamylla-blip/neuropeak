# Spec — Grade Dedutiva, fatia B: a régua estrutural completa

Data: 2026-09-08
Origem: fechamento 3 dela, de 08/set, que **corrige** a proposta do VP.
**Depende da fatia A** (pistas compostas), já aplicada: leia `lib/grade/tipos.ts` e `estrutura.ts`
no estado atual antes de começar.

⛔ **NÃO toque na interface.** ⛔ **NÃO escreva problemas novos** — a autoria só começa depois que
esta régua estiver provada. ⛔ **NÃO conserte os puzzles atuais**: eles vão reprovar, e provar que
reprovam é uma entrega desta fatia.

---

## 1. A correção dela, que é o coração desta fatia

O VP propôs *grafo conectado + grau ≥ 2*. Ela corrigiu:

> *"grafo conectado + grau mínimo ≥ 2 ainda não garante que não exista uma aresta crítica dividindo
> o problema em dois blocos. Portanto quero também: `bridgeCount === 0`."*

Ela está certa, e o contraexemplo é concreto: dois triângulos ligados por **uma** aresta. Todo nó
tem grau ≥ 2, o grafo é conectado, e mesmo assim **uma** aresta separa o problema em dois blocos.
Grau ≥ 2 não pega isso; ausência de pontes pega.

**Implemente a detecção de pontes por remoção**, não por Tarjan: são no máximo 6 categorias e 15
arestas, então remover cada aresta e testar a conectividade é **trivialmente barato e obviamente
correto**. Clareza vence esperteza neste tamanho. Deixe isso comentado.

---

## 2. Os dez critérios, na ordem dela

Todos entram em `avaliarEstrutura` e cada reprovação acrescenta um motivo legível a `motivos`.

1. **solução única** — necessária, **não suficiente**. (Hoje `avaliarEstrutura` já reprova quando
   `derivar` falha; mantenha e explicite.)
2. **grafo de categorias conectado** — já existe.
3. **grau mínimo ≥ 2** em toda categoria — **NOVO**.
4. **`pontes === 0`** — **NOVO**, conforme §1.
5. **predominância cross sobre intra** — **NOVO**. ⚠️ *"Com pistas compostas, calcular cross e intra
   pelas RESTRIÇÕES ATÔMICAS, não apenas pelas frases visuais."* Reprove quando
   `restricoesCross <= restricoesIntra`. Mantenha **também** a contagem por pista, rotulada como
   tal, porque é a que descreve o que a pessoa lê.
6. **nenhuma categoria isomorfa/redundante ao eixo de posições** — **NOVO**. Ver §3.
7. **nenhuma categoria resolvível de forma independente** — **NOVO**. Ver §4.
8. **profundidade inferencial calculada** — já existe via `derivar()`.
9. **redundância medida** — já existe.
10. **cobertura real de todas as categorias** — **NOVO**: toda categoria aparece em pelo menos uma
    pista classificada como **essencial** por `derivar()`. Uma categoria que só aparece em pistas
    redundantes não está sendo treinada.

Mais o que já existe: **no máximo 1 categoria na ordem declarada** (hoje só reprova quando são
**todas** — `LIMIAR_ORDEM_DECLARADA`). **Aperte para no máximo 1**, deixando o valor na constante.

**Tutorial:** continua isento de tudo isto (`ehTutorial`), e continua sendo **medido**.

---

## 3. Categoria isomorfa ao eixo (critério 6)

O caso real, medido em 06/set: `Horário = [14h, 15h, 16h, 17h]`. A pessoa **sabe** que são
crescentes; o motor **não**. Das 120 soluções que o motor aceitava, só 4 tinham o horário em ordem.

Agora que existe `rotulosPosicao`, a regra de autoria é: **sequência conhecida a priori vira rótulo
de coluna, nunca categoria**.

**Detecção — e seja honesto sobre o que ela é.** É uma **heurística lexical**, não uma prova:
reprove a categoria cujos valores, **todos**, casem com um dos padrões reconhecíveis de sequência —
hora (`14h`, `14h30`), número puro, ordinal (`1º`), ou prefixo fixo seguido de número
(`Mesa 3`, `Sala 2`) — **e** cuja solução siga a ordem crescente desses valores.
Deixe os padrões numa constante **nomeada e exportada**, e um comentário dizendo que **pega os casos
conhecidos, não prova a ausência do defeito**. Sem isso, um revisor futuro acha que é garantia.

---

## 4. Categoria resolvível sozinha (critério 7)

É o critério que traduz literalmente a frase dela: *"A maioria das conclusões não deve ser obtida
resolvendo cada linha separadamente."* E é **mais forte** que qualquer medida de grafo.

**Como calcular, com o motor que já existe:** para cada categoria `C`, monte um contexto **apenas**
com as restrições **intracategoria de `C`** (descartando todas as outras), propague, e verifique se
**todas** as células de `C` ficam forçadas. Se ficarem, `C` se resolve sozinha e o puzzle é
**reprovado**, nomeando a categoria.

É exatamente o defeito da biblioteca atual: as quatro categorias passam nesse teste.

Reaproveite `criarContexto`, `dominiosIniciais` e `propagarDominios`. **Não** escreva um solver novo.

---

## 5. O relatório

Estenda `RelatorioEstrutural` com os campos novos — `grauPorCategoria`, `pontes`,
`restricoesIntracategoria`, `restricoesCrossCategory`, `categoriasIsomorfasAoEixo`,
`categoriasResolviveisSozinhas`, `categoriasSemPistaEssencial` — mantendo os que já existem.

Mantenha o comentário que já está lá: **estas medidas descrevem propriedades do PROBLEMA; não são
números clínicos nem autorizam interpretação sobre quem resolve.**

---

## 6. Provas — e esta fatia tem uma exigência especial

```
npx tsc --noEmit          # exit 0
npm run test              # base: 68 arquivos / 917 testes — não pode cair
```
**NÃO rodar `npm run build`.** Você provavelmente não conseguirá rodar nada no lab por falta de
`node_modules`: **declare**, não finja.

Testes obrigatórios — **adversariais, montados à mão**, nunca só o caminho feliz:

- **a ponte:** dois triângulos ligados por uma aresta — conectado ✅, grau ≥ 2 ✅, e ainda assim
  **REPROVADO** por `pontes === 1`. **Este é o teste que prova a correção dela**; sem ele a fatia
  não está entregue;
- um grafo **sem** pontes (ciclo de 4, ou triângulo) é **aprovado** nesse critério;
- **pista composta** com uma restrição intra e uma cross conta **1 intra + 1 cross** nas
  restrições, e **1** pista cross na contagem por frase — as duas contagens divergindo **de
  propósito**;
- categoria `[14h,15h,16h,17h]` com solução em ordem é reprovada pelo critério 6; a mesma categoria
  com solução **fora** de ordem **não** é;
- uma categoria com valores não sequenciais (nomes) **nunca** dispara o critério 6;
- categoria forçada só por restrições intra é reprovada pelo critério 7; a mesma categoria, se
  depender de uma restrição cross para fechar, **não** é;
- **os puzzles reais:** `biblioteca-encontros` e `museu-mostra-noturna` **REPROVAM**, e o teste
  **afirma os motivos exatos** de cada um. O tutorial **passa por isenção**.
  ⚠️ Isto é um teste que **afirma o defeito**, e por isso a suíte fica **verde** enquanto o banco
  está errado. Deixe um comentário dizendo que este teste **cai quando o banco for refeito** — e
  que cair, nesse momento, será o **sinal de sucesso**, não uma quebra.

## 7. Relatório

O contraexemplo dos dois triângulos como você o montou; por que a detecção de pontes por remoção é
suficiente aqui; como separou contagem por restrição de contagem por pista; e a lista, puzzle a
puzzle, dos motivos de reprovação dos três atuais.
