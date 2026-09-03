# Spec — Grade Dedutiva, Fase 3: a interface

Data: 2026-09-03
Arquivo principal: `components/exercises/executive/DeductiveGrid.tsx` — **reescrita completa**.
Pode criar arquivos novos em `lib/grade/`. **Não toque em nenhum outro exercício.**

Fontes, nesta ordem de precedência:
1. `docs/grade-dedutiva/DECISOES-MECANICA-20260903.md` — **manda em tudo**; é posterior e acordado.
2. `docs/grade-dedutiva/ESPEC-GRADE-DEDUTIVA-KAMYLLA-20260902.md` — as 103 seções dela.
3. `lib/grade/` — o motor já construído (leia `tipos.ts`, `solver.ts`, `index.ts`).

**Leia os três antes de escrever qualquer linha.**

---

## 1. A mecânica, exata

A célula tem **um estado só**: vazia ou com um valor. **Não existe `×`, `?` nem `✓`**, e não existe
segundo passo de confirmação.

**O clique abre uma lista** com os valores daquela categoria. Na lista:
- os valores já usados em **outra posição da mesma categoria** aparecem **riscados**, e continuam
  clicáveis (ele pode mudar de ideia). É o que deixa o paciente ver quem resta sem varrer a grade;
- o valor atual da célula aparece destacado;
- há um **"Limpar"** quando a célula tem valor.

**O que o clique significa** (decisão registrada): *"neste momento estou colocando Ana aqui"* — nem
certeza, nem hipótese. Trocar depois faz parte de resolver.

## 2. O que a tela sinaliza — e o que ela CALA

Esta é a regra mais importante do exercício. Errar aqui destrói o treino.

**Sinaliza:** o mesmo valor em duas posições da mesma categoria. As duas células ganham **realce
discreto** — borda e fundo âmbar suave, jamais vermelho de alarme, jamais a palavra "erro". Um
`title` diz "Este item já está sendo usado em outra posição." É regra operacional do jogo, não
dedução.

**CALA:** qualquer contradição com as pistas, inclusive as que só aparecem cruzando várias. Nada de
piscar, destacar célula, mensagem, som. *"Se o sistema denuncia imediatamente toda inconsistência, o
monitoramento de erro passa a ser feito pelo software."*

⚠️ **Proibido em qualquer estado da grade:** vermelho de erro, ícone de alerta, contagem de erros,
pontuação, eficiência, cronômetro visível, barra de progresso da solução, e qualquer texto que
avalie ("quase lá", "atenção", "cuidado").

## 3. Layout

Colunas = posições. Linhas = categorias. Rótulo da categoria à esquerda.

**Pistas sempre visíveis**, numeradas, e **riscáveis por clique do paciente** — o sistema **nunca**
risca sozinho. No desktop, pistas e grade lado a lado ou pistas abaixo, o que couber melhor; no
celular, empilhado.

⚠️ **Celular:** no nível 5 (5 posições × 6 categorias) a grade não cabe em 360 px. Use **rolagem
horizontal LOCAL da grade** (a seção 12 dela autoriza), com a coluna de rótulos fixa. O `body`
nunca rola de lado.

Duas colunas de pistas no desktop devem usar `columns` (fluxo), **não** `grid` — numa grade, uma
pista que quebra em duas linhas estica a linha e desalinha a vizinha.

Use o `ExerciseStage` do projeto, largura `medio` ou `amplo` (decida e justifique). Visual adulto,
limpo, sem gamificação, sem emoji.

## 4. Botões

**"Verificar raciocínio"** — chama `pistasEmConflito`/`admiteSolucao` do motor e diz apenas que
existe uma incompatibilidade. **NUNCA diz qual célula nem qual pista.** Texto por nível:
- níveis 1–2: "Existe uma incompatibilidade no seu raciocínio. Revise suas conclusões."
- níveis 3+: "Existe pelo menos uma incompatibilidade. Revise antes de continuar."
- se não houver: "Nenhuma incompatibilidade encontrada até aqui." — e **isto não é elogio**, é fato.

⚠️ A disponibilidade varia com o nível (decisão do gestor de conteúdo): níveis iniciais normal;
intermediários normal com uso registrado; **níveis avançados sem o botão**. Deixe isso numa
constante nomeada e documentada, para ser ajustável.

**"Concluir"** — se a solução está correta: "Desafio concluído." e segue. Se não: "Sua organização
ainda contém incompatibilidades. Revise antes de concluir." **NUNCA revela a solução.**

## 5. Registro do processo

Grave em memória, por problema, e mande no `metadata` do `onComplete`:

**Por atribuição:** categoria, valor, posição, momento (ms desde o início), valor anterior, e —
consultando o motor — **se aquela relação já estava logicamente determinada naquele instante**.

**Agregados que vão ao metadata**, com estes nomes:
- `atribuicoesAntesDeDeterminacao` — quantas foram feitas quando a relação ainda não estava forçada;
- `dessasMantidas` / `dessasRevisadas` — quantas sobreviveram até o fim e quantas mudaram depois.

⚠️ **NUNCA nomeie isso de "confirmação prematura", "impulsividade" ou equivalente.** Com uma
marcação só, a interface não distingue "tenho certeza" de "vou testar" — classificar seria inferir
estado mental a partir de comportamento. **O sistema descreve; a interpretação é da profissional.**
Deixe um comentário no código dizendo isso.

**Eventos de pista**, com timestamp: `clue_crossed` e `clue_uncrossed`. Permitem reconstruir
"riscou a 7, fez três atribuições, voltou à 7, desmarcou, mudou a solução".

**Também:** latência até a primeira ação, total de ações, tempo total, tentativas de concluir
incorretas, e quantas vezes usou "Verificar raciocínio".

## 6. Problemas para esta fase

O banco completo (12–20 validados) é a **fase 5**. Aqui, crie **3 problemas** em
`lib/grade/banco.ts` — um de 3×3 para o tutorial e dois de 4×4 — e **valide os três com
`temSolucaoUnica` num teste**. Nenhum problema entra sem essa prova.

## 7. Fora do escopo, de propósito

Motor adaptativo (fase 6), relatório do terapeuta (fase 7), banco completo (fase 5), MUS, botão de
dica. **Não antecipe nada disso.**

## 8. Prova

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # base: 64 arquivos / 888 testes
```
**NÃO rodar `npm run build`** — o dev server dela pode estar no ar na porta 3000.

Testes obrigatórios (o que der para testar sem JSX — extraia a lógica para funções puras em
`lib/grade/` e teste lá):
- os 3 problemas do banco têm **solução única**, provado pelo solver;
- a detecção de valor repetido acha as duas células e **só** elas;
- a mensagem de "Verificar" **nunca** contém nome de categoria, valor ou número de pista — teste
  por varredura do texto produzido;
- o botão de verificar **não existe** nos níveis avançados;
- `atribuicoesAntesDeDeterminacao` conta certo num caso montado à mão, e `mantidas + revisadas`
  fecha com o total.

## 9. Relatório

O que extraiu para `lib/` e por quê; como resolveu a rolagem no celular; onde a espec dela esbarrou
no que já existe; e a confirmação, item a item, de que nada da lista do §2 aparece na tela.
