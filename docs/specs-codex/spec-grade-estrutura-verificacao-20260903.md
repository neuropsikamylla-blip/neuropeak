# Spec — Grade Dedutiva: validação estrutural dos puzzles e verificação limitada

Data: 2026-09-03
Origem: duas determinações dela, depois de aprovar a interface como direção.

Fontes, nesta ordem de precedência:
1. Esta spec.
2. `docs/grade-dedutiva/DECISOES-MECANICA-20260903.md`
3. `docs/grade-dedutiva/ESPEC-GRADE-DEDUTIVA-KAMYLLA-20260902.md`
4. `lib/grade/` — o motor e a interface já construídos.

**Leia `lib/grade/tipos.ts`, `motor.ts`, `solver.ts`, `interacao.ts` e `banco.ts` antes de escrever
qualquer linha.**

⛔ **NÃO reconstrua a interface. Ela está aprovada como direção.** As únicas mudanças permitidas em
`DeductiveGrid.tsx` são as da PARTE B.
⛔ **NÃO crie problemas novos para o banco.** Ela mandou parar antes disso. A PARTE A entrega a
FERRAMENTA que vai julgá-los, não os problemas.

---

# PARTE A — validação estrutural do problema (`lib/grade/estrutura.ts`, arquivo NOVO)

## A1. O defeito que motivou isto

Palavras dela: *"O desafio 'Encontros na biblioteca' está sendo resolvido como quatro
mini-problemas independentes: pistas 1–2 resolvem Visitante; 3–4 resolvem Sala; 5–6 resolvem Tema;
7–8 resolvem Horário. Isso NÃO atende à arquitetura cognitiva definida."*

E o critério: *"solução única é necessária, mas NÃO é critério suficiente para considerar um puzzle
bom... O banco deve rejeitar puzzles em que as categorias possam ser resolvidas praticamente de
forma independente."*

## A2. O grafo

Modele exatamente como ela definiu:

- **cada categoria = nó**;
- **cada pista cruzada = aresta** entre as categorias que ela toca. Uma pista cujos itens são todos
  da MESMA categoria (`T7` entre três visitantes, `T4` ordem entre dois visitantes) é
  **intracategoria** e **não gera aresta**. Uma pista que toca 3 categorias gera as arestas de
  todos os pares.
- Use `itensDaPista` de `./motor`, que já devolve os itens de qualquer tipo de pista — assim um
  tipo novo entra sem tocar aqui.

⚠️ **`T3` (posição absoluta) toca uma categoria só e é intracategoria**, mas é uma **âncora**, não
uma restrição interna comum. Conte-a à parte no relatório, sem gerar aresta.

**Critério de rejeição:** o grafo tem de ser **conectado** — um único componente. Mais de um
componente significa sub-problemas independentes, e o puzzle é **rejeitado**.

## A3. As seis medidas que ela pediu

> *"Não quero transformar isso em números clínicos; são propriedades do problema."*

Deixe isso explícito num comentário. As medidas:

1. `pistasIntracategoria` — quantas.
2. `pistasCrossCategory` — quantas.
3. `profundidadeInferencial` — **reaproveite `derivar()` de `./derivacao`**, que já calcula
   profundidade por célula e a distribuição. Não reimplemente.
4. `categoriasNasConclusoes` — quantas categorias distintas aparecem nas pistas que `derivar()`
   classificou como **essenciais**.
5. `redundancia` — quantas pistas `derivar()` classifica como `redundante`.
6. `conectividade` — `arestas / paresPossiveis`, com `paresPossiveis = n*(n-1)/2`; mais
   `componentes` e a lista das arestas.

Devolva tudo num só `RelatorioEstrutural`, com `aprovado: boolean` e `motivos: string[]` quando
reprovado. Nomes em português, como o resto de `lib/grade/`.

## A4. ⚠️ Segundo defeito, achado pelo VP na auditoria — INCLUA como reprovação

Nos **três** puzzles do banco atual, a solução de **todas** as categorias é exatamente a **ordem em
que os valores foram declarados** em `categoria.valores`. Como o menu da célula lista os valores
nessa mesma ordem, *"colocar cada um na ordem em que aparece na lista"* resolve os três problemas
**sem ler uma única pista**.

Acrescente ao relatório `categoriasNaOrdemDeclarada` e **reprove** quando **todas** as categorias
estiverem na ordem declarada. Deixe o limiar numa constante nomeada.

## A5. Fronteira do tutorial

Ela foi explícita: *"Para o tutorial 3×3, a simplicidade atual pode permanecer. Para o treino real,
não."* Então a função de aprovação recebe um parâmetro que isenta o tutorial das exigências
estruturais — **as medidas continuam sendo calculadas para ele**, só não reprovam.

## A6. O que NÃO fazer

**NÃO** ligue esta validação ao banco atual num teste que rode na suíte: **2 dos 3 puzzles
reprovariam** e a suíte ficaria vermelha. A ferramenta entra agora; o banco corrigido é a fase 5.
Teste `estrutura.ts` com puzzles **sintéticos montados no próprio teste** — um conectado, um em dois
componentes, um todo na ordem declarada.

---

# PARTE B — "Verificar raciocínio" vira recurso LIMITADO

Razão dela: *"Se o paciente puder conferir a grade a cada ação, ele pode começar a terceirizar esse
monitoramento para o sistema."* Princípio: *"quanto maior o domínio do exercício, menos suporte
externo para detectar inconsistências."*

## B1. Os limites — em CONFIGURAÇÃO, não espalhados

> *"Esses valores devem ficar em constantes/configuração, não hardcoded espalhado pela interface,
> porque poderão ser recalibrados depois."*

Uma constante só, exportada e documentada, em `lib/grade/interacao.ts`:

| nível | verificações por problema |
|---|---|
| tutorial | **livre** (aprender a mecânica é o objetivo) |
| 1–2 (iniciais) | **3** |
| 3 (intermediário) | **2** |
| 4–5 (avançados) | **1**, e a configuração precisa permitir **0** |

Substitui `NIVEIS_COM_VERIFICACAO`. Função pura `verificacoesPermitidas(nivel, ehTutorial)`.

## B2. As mensagens — exatamente estas

- com incompatibilidade: **"Existe uma incompatibilidade na sua organização. Revise suas escolhas."**
- sem incompatibilidade: **"Até aqui, sua organização é compatível com as pistas."**

**NUNCA** informar qual célula, qual pista, qual categoria, nem qual resposta deveria estar lá.
O teste que já existe varre o texto produzido — mantenha-o passando.

## B3. A interface

Mostrar a contagem **discretamente**, sem linguagem de punição: `Verificar raciocínio · 3`, depois
`· 2`. Quando acabarem, o botão fica **indisponível e discreto**.
⛔ **NUNCA** escrever *"Você perdeu suas chances"* ou equivalente. Nenhum texto de punição.
Quando o nível permite **0** verificações, o botão **não aparece**.

## B4. O registro de cada verificação

Cada solicitação grava: `puzzleId`, número da ação, tempo desde o início, qual verificação foi
(1ª, 2ª...), **quantas restavam**, se o estado estava **consistente ou inconsistente**, quantas
contradições havia naquele momento, se houve **correção depois**, **quantas ações** até a correção e
**quanto tempo** até a correção.

⚠️ Para "quantas contradições havia": use o que o motor já oferece (`pistasEmConflito`), e **deixe
comentado que é um conjunto seguro de pistas relevantes, não um MUS** — não invente um contador que
o solver não sustenta.

⚠️ **PROIBIDO interpretar.** Palavras dela: pedir verificação com o estado já correto *"também deve
ser registrado como comportamento de processo, mas NÃO interpretado automaticamente como
insegurança, ansiedade ou qualquer déficit"*. Nada de `inseguranca`, `ansiedade`, `dependencia`,
`impulsividade` ou similar em nome de campo, valor ou comentário. Registre o fato, nada mais.

## B5. O texto que descreve o exercício

Onde houver descrição do recurso para a profissional, o texto passa a ser:

> *"Existe um recurso limitado de 'Verificar raciocínio'. Nos níveis iniciais o paciente possui até
> três verificações por problema, e essa ajuda é progressivamente reduzida conforme a dificuldade
> aumenta. A verificação informa apenas se a organização atual contém incompatibilidades, sem
> indicar onde elas estão."*

---

# Provas

```
npx tsc --noEmit          # exit 0, exit code SEM pipe
npm run test              # base: 67 arquivos / 909 testes
```
**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.
Você provavelmente **não conseguirá rodar nenhum dos dois** no lab, por falta de `node_modules`.
**Declare isso** em vez de fingir; a prova é do VP no repositório real.

Testes obrigatórios (funções puras, sem JSX):
- grafo com 2 componentes é **reprovado**; grafo conectado é **aprovado**;
- pista intracategoria **não** gera aresta; pista de 3 categorias gera as **3** arestas;
- puzzle com todas as categorias na ordem declarada é **reprovado**;
- o tutorial é **isento**, mas as medidas continuam sendo calculadas;
- `verificacoesPermitidas` devolve 3/2/1 pelos níveis e **livre** no tutorial, e suporta **0**;
- a contagem de verificações **não fica negativa** e o botão some ao zerar;
- as duas mensagens **não contêm** nome de categoria, valor nem número de pista.

# Relatório

O que ficou em `estrutura.ts` e por quê; como tratou `T3`; como resolveu a contagem de contradições
sem inventar o que o solver não dá; e a confirmação de que **nenhum** campo, valor ou comentário
interpreta o uso da verificação.
