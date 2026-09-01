# Spec — Torres, fatia 5b: os problemas variados chegam à tela

Data: 2026-09-01
Arquivo: `components/exercises/executive/TorreHanoi.tsx` (e, se precisar, um seletor novo em `lib/torres/`).
Fonte: `docs/torres/ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md`, seções **2, 14, 39–41, 45–47**.
**Leia antes:** `lib/torres/banco.ts` e os commits `54739df` (motor), `70b5311` (2ª tentativa),
`c76c940` (registro), `9da4544` (placar fora).

---

## 1. O que muda

Hoje o exercício só sabe fazer o Tipo A: `initialPegs(discCount)` e vitória quando a haste 2 tem
todos os discos. Passa a **sortear problemas do `BANCO`**, que já traz `inicial`, `alvo`,
`minimo` (da BFS), `fase`, `tipo` e `categoria`.

### 1.1 Vitória deixa de ser "haste 2 cheia"

Passa a ser **estado atual igual ao `alvo` do problema**. Compare de forma robusta (as pilhas
como estão, não por referência). Esse é o ponto de maior risco da fatia: se a comparação falhar,
o exercício nunca termina.

### 1.2 O mínimo vem do problema

`optimal` deixa de ser `optimalMoves(discCount)` e passa a ser `problema.minimo`.
Se `optimalMoves` ficar sem uso, remova. A eficiência e tudo que a fatia 1 fez continuam iguais —
só a fonte do número muda.

### 1.3 Reiniciar volta ao `inicial` do problema

Não a `initialPegs(discCount)`. Confira todos os pontos que reconstroem o tabuleiro
(`startNewPuzzle`, `restartPuzzle`, `tentarNovamente`).

## 2. Seleção dos problemas (seções 39–41)

Crie em `lib/torres/` uma função **pura e testável** de seleção, por exemplo
`proximoProblema(fase, jaUsados, aleatorio)` — com a fonte de aleatoriedade **injetada**, para o
teste ser determinístico.

Regras, tiradas das seções 40 e 41:
- **não repetir** um problema já usado na sessão enquanto houver outro disponível na fase;
- **evitar padrão previsível**: não servir sempre o mesmo tipo em sequência, nem sempre
  esquerda→direita. Se os últimos dois foram do mesmo tipo, prefira outro tipo quando houver.
- a **fase** vem do nível do paciente. Hoje o nível é `discCount`; passe a derivar a fase a partir
  da dificuldade recebida, e **documente o mapeamento** que escolher. Regra dela para o teto:
  fases 1–5 usam até 5 discos; **6 discos só na fase 6**.
- a progressão (`deveSubirDeNivel`) passa a **subir de fase**, não de disco. O número de discos
  passa a ser propriedade do problema.

## 3. A tela de cada problema (seções 45–47)

Antes de começar cada problema:

> **Organize os discos conforme o objetivo.** · [configuração] · **Objetivo** · [miniatura do
> alvo] · **COMEÇAR**

Depois de COMEÇAR:
- se o alvo é uma torre completa numa haste, basta a linha discreta **"Objetivo: haste direita"**
  (ou esquerda/central, conforme o problema);
- se o alvo é uma **configuração arbitrária** (Tipo D), **a miniatura CONTINUA VISÍVEL**. Ela foi
  explícita na seção 47: *"Não transformar o exercício em jogo de memória... se a configuração-alvo
  for complexa, manter o modelo visível. O foco é planejamento e resolução de problemas, não
  memória visual."*

A miniatura é um desenho pequeno e sóbrio das três hastes com os discos na posição-alvo. Reaproveite
a renderização de disco que já existe, em escala reduzida. **Sem números, sem legendas de tamanho.**

## 4. O que continua proibido na tela

Tudo da fatia 1: **nada** de contador de movimentos, mínimo, eficiência, cronômetro ou barra de
comparação durante a execução. A miniatura do objetivo **não é placar** — é o enunciado do
problema, e por isso pode ficar.

## 5. Registro

`puzzleResults` ganha, por problema: `problemaId`, `tipo`, `fase`. O metadata da sessão ganha
`tiposJogados` (contagem por tipo) e `fasesJogadas`. Tudo o mais que as fatias 3 e 4 gravam
continua idêntico.

## 6. O que NÃO muda

Regras do jogo, a segunda tentativa (fatia 4) — que agora refaz **o mesmo problema do banco** —,
o registro da fatia 3, `eficiencia`/`faixaEficiencia`/`deveSubirDeNivel`, `accuracy`,
`calculateExerciseScore`, a sessão de 11 min, o botão Reiniciar.

## 7. Prova

```
npx tsc --noEmit          # exit 0, sem pipe
npm run test              # base: 61 arquivos / 834 testes
```
**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

Teste da seleção (com aleatoriedade injetada) provando, por contagem:
- percorrendo uma fase inteira, **nenhum problema se repete** antes de esgotar a fase;
- a regra anti-repetição de tipo é respeitada quando há alternativa;
- **nenhum problema de 6 discos sai em fase < 6**.

## 8. Relatório

O mapeamento dificuldade → fase que escolheu e por quê; como compara estado com alvo; como
desenhou a miniatura; e qualquer ponto em que a espec dela esbarrou no que já existia.
