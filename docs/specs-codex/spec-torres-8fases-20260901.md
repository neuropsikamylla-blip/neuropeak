# Spec — Torres: o banco reorganizado nas 8 fases dela

Data: 2026-09-01
Arquivos: `lib/torres/banco.ts`, `lib/torres/selecao.ts`, `lib/torres/banco.test.ts`, `lib/torres/selecao.test.ts`.
**PROIBIDO tocar:** `lib/torres/minimo.ts`, `lib/torres/estado.ts`, `lib/torres/tipos.ts` e
qualquer componente. O motor está correto e ela confirmou que não se mexe nele.

---

## 0. O que muda e por quê

Ela redefiniu a progressão em **8 fases** (antes eram 6, com recorte diferente). A regra que
manda: *"o jogo deve COMEÇAR como uma Torre de Hanói clássica. As variações entram depois, de
forma progressiva."* Hoje a fase 1 tem só 2 problemas e a fase 2 já mistura clássico com destino
variável — cedo demais.

## 1. As 8 fases, na definição dela (seção 20)

| Fase | Discos | Estrutura |
|---|---|---|
| 1 | 3 | **clássico** (torre completa numa haste → torre completa em outra) |
| 2 | 4 | **clássico** |
| 3 | 4 | **destino variável** (inicial ainda é torre completa; o alvo muda de haste) |
| 4 | 4 | **inicial variável**, alvo = **torre completa** |
| 5 | 4 | **inicial variável**, alvo **também variável** |
| 6 | 5 | **mistura de formatos** |
| 7 | 5 | problemas **mais complexos** |
| 8 | 6 | **avançado e seletivo** |

Ajuste o tipo `fase` de `1..6` para `1..8` em `Problema` (e em `Fase`, em `selecao.ts`).

**Fase 1 e 2 são clássicas de verdade:** todos os discos empilhados numa haste, alvo todos
empilhados em OUTRA. A fase 1 pode ter as variações de par de hastes (0→2, 0→1, 1→2, …) — o que
não pode é configuração espalhada nem alvo arbitrário.

**Quantidade:** cada fase precisa de problemas suficientes para não repetir dentro de uma sessão
de 11 min. Estime e justifique; não invente centenas. As fases 1 e 2, por serem a porta de
entrada, precisam de pelo menos 3 e 4 problemas respectivamente.

**Fase 8 é seletiva:** poucos problemas de 6 discos, e **nunca 7 ou 8 discos** em lugar nenhum —
regra dura dela (seção 19: 7 discos = 127 movimentos, "não quero que a dificuldade seja apenas
uma tarefa longa").

## 2. `faseDaDificuldade` em `selecao.ts`

Hoje mapeia a dificuldade 1–10 em 6 fases. Passa a mapear em **8**, e a regra que rege é a dela:
o começo é clássico. Proponha o mapeamento, **documente o raciocínio em comentário** e cubra no
teste que ele é monotônico (nunca desce quando a dificuldade sobe), que cobre 1 a 10 sem buraco e
que **a dificuldade mais baixa cai na fase 1**.

⚠️ Contexto que você precisa saber: em 01/set/2026 ela abriu o exercício e disse *"não entendi
nada"*, porque o mapeamento anterior levava a dificuldade 3 direto à fase das configurações
embaralhadas. **Errar para o lado conservador é o certo aqui.**

## 3. Alternância nas fases altas (seção 21 dela)

> *"Depois de consolidada a lógica, não fazer: clássico → destino variável → inicial variável →
> goal variável e nunca mais voltar. Nos níveis altos, misturar os tipos."*

As fases 6, 7 e 8 devem conter **mais de um tipo** de problema cada. A função `proximoProblema`
já evita servir três do mesmo tipo em sequência — não a reescreva, só garanta que o banco lhe dá
matéria-prima para isso.

## 4. O que NÃO muda

- A estrutura `Problema` (fora o tipo de `fase`), `preValidar`, e o fato de **nenhum mínimo ser
  escrito à mão** — todos saem da BFS ao carregar o módulo.
- `menorCaminho`, `validarConfiguracao`, `movimentosPossiveis`, `aplicarMovimento`.
- A assinatura de `proximoProblema` e suas regras de não-repetição e anti-previsibilidade.

## 5. Prova

Reescreva `banco.test.ts` e `selecao.test.ts` para as 8 fases, provando **por contagem**:
- todo problema tem `inicial` e `alvo` válidos e diferentes entre si;
- `minimo` bate com `menorCaminho` (nenhum número à mão);
- `id` único;
- **fases 1 e 2 contêm SOMENTE problemas clássicos** — inicial e alvo são torres completas, cada
  uma numa única haste. Escreva essa asserção de forma que denuncie qualquer problema espalhado
  que entre ali por engano no futuro;
- **nenhum problema com mais de 5 discos fora da fase 8**, e **nenhum com 7 ou 8 discos**;
- cada fase tem pelo menos um problema, e as fases 6, 7 e 8 têm mais de um tipo;
- percorrer cada fase inteira pelo `proximoProblema` sem repetir.

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # base: 62 arquivos / 844 testes
```
**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

## 6. Relatório

A tabela final de problemas por fase e por tipo; o mapeamento dificuldade → fase e o raciocínio;
e qualquer fase em que a definição dela esbarrou em impossibilidade geométrica.
