# Spec — Torres, fatia 3: registrar o comportamento, sem mostrar nada a mais

Data: 2026-08-31
Arquivos: `components/exercises/executive/TorreHanoi.tsx` (+ `lib/torres-registro.ts` e teste, novos).
Fonte: `docs/torres/ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md`, seções **28, 30–36**.
Cobre a **Prioridade 2** e parte da **8**. **Leia o commit `9da4544` (fatia 1) antes.**

---

## 0. Regra que não pode ser violada nesta fatia

> *"o paciente precisa resolver o problema, e não jogar contra o placar. O sistema registra tudo
> nos bastidores; a interface durante a execução deve deixar o raciocínio o mais limpo possível."*

**NADA do que se registra aqui pode aparecer na tela durante a execução.** A única mudança visível
permitida é a mensagem do item 4 (movimento inválido). Se você sentir vontade de exibir um
contador, resista: é exatamente o que acabamos de remover.

## 1. Reinício deixa de ser um contador e vira um evento (seções 4 e 30)

Hoje só existe `restartsThisPuzzle` (um número). Passa a existir a lista de eventos do puzzle:

```ts
interface EventoReinicio {
  movimento: number;   // em que movimento do puzzle ele reiniciou
  tempoMs: number;     // ms desde o início do puzzle até o reinício
}
```

Ela pediu isso explicitamente: *"que houve reinício; em qual momento ocorreu; quantidade de
movimentos antes do reinício; tempo transcorrido antes do reinício."*

`puzzleStart.current` já existe e marca o início do puzzle — **não o zere no reinício**, senão o
tempo do problema passa a mentir. O reinício zera o tabuleiro, não o relógio do problema.

## 2. Movimentos totais × movimentos da solução final (seção 31)

Exemplo dela: 9 movimentos → reinicia; 14 → reinicia; resolve em 18.
- **movimentos da solução final = 18** (desde o último reinício)
- **movimentos totais no problema = 41** (tudo que ele fez)

Hoje `moves` zera no reinício, então ele já é o "da solução final". Falta acumular o total:
mantenha um acumulador que soma os movimentos descartados a cada reinício.

⚠️ **A eficiência da fatia 1 continua sendo calculada sobre os movimentos da SOLUÇÃO FINAL**, não
sobre o total — é o que a seção 31 separa. Não troque isso sem ordem.

## 3. Latência até o primeiro movimento (seção 34)

Registrar `latenciaMs`: tempo entre o problema aparecer e o **primeiro** movimento válido daquele
puzzle. Reinício **não** reinicia essa medida — a latência é do problema, e o primeiro contato do
paciente com ele acontece uma vez só. Documente isso no código.

## 4. Movimentos inválidos (seções 23 e 36)

Hoje, ao tentar pôr um disco maior sobre um menor, o código faz `setSelected(null); return;` — em
silêncio. Passa a:
- **contar** a tentativa inválida (`invalidos`);
- **mostrar** a mensagem exata da espec dela: **"Esse movimento não é permitido."**

Sobre a mensagem: discreta, some sozinha (≈1200 ms), **sem** dizer qual movimento deveria fazer
(seção 23), sem som, sem vermelho gritante. É a única exceção à regra 0 desta fatia.

## 5. Reversões (seção 33)

Registrar `reversoes`: quantas vezes o paciente moveu um disco de volta à haste de onde ele tinha
acabado de sair. O padrão que ela descreve é A→B seguido de B→A **para o mesmo disco**, sem outro
movimento daquele disco no meio.

Coloque essa detecção em `lib/torres-registro.ts` como **função pura sobre a lista de movimentos**
(cada movimento `{ disco, de, para }`), e teste. Não classifique como "boa flexibilidade" — ela
foi explícita: *"Não precisa classificar automaticamente isso como 'boa flexibilidade'. Mas pode
registrar padrões de reversão."* E **não mostre ao paciente**.

## 6. O que vai ao metadata

Por sessão, somando os puzzles (mantenha o que já existe: `puzzles`, `maxDiscs`, `correct`,
`resolvidosComBoaEficiencia`, `restarts`, `puzzlesComReinicio`, `eficienciaMedia`):

- `movimentosTotais` — soma dos movimentos totais de todos os puzzles;
- `movimentosSolucao` — soma dos movimentos das soluções finais;
- `invalidos` — total de tentativas de movimento inválido;
- `reversoes` — total de reversões;
- `latenciaMediaMs` — média das latências até o primeiro movimento;
- `reinicios` — a lista de eventos, **por puzzle**, no formato
  `[{ puzzle: number, discos: number, eventos: [{ movimento, tempoMs }] }]`, apenas para os
  puzzles que tiveram reinício (não encha o metadata com listas vazias).

⚠️ `metadata` é uma **String** no Prisma (`schema.prisma:90`) e vira JSON. Não coloque `Infinity`
nem `NaN` em nada — `JSON.stringify` os converte para `null` silenciosamente. Se uma média não
tiver amostra, use `null` explicitamente e documente.

## 7. O que NÃO muda

- A tela durante a execução (fora a mensagem do item 4), a conclusão da fatia 1, o botão
  Reiniciar, as regras do jogo, `MAX_DISCS = 5`, a sessão de 11 min, `accuracy`, `eficiencia`,
  `faixaEficiencia`, `deveSubirDeNivel`, `calculateExerciseScore`.
- Os botões TENTAR NOVAMENTE / CONTINUAR **não são desta fatia** (é a 4). Não construa.

## 8. Prova

```
npx tsc --noEmit          # exit 0, sem pipe
npm run test              # base: 57 arquivos / 772 testes
```
**NÃO rodar `npm run build`** (dev server dela no ar na 3000).

`lib/torres-registro.test.ts` precisa provar a detecção de reversão com **contagem**: uma
sequência com 3 reversões dá exatamente 3; uma sequência sem nenhuma dá 0; e um caso-armadilha em
que o disco volta à origem **depois** de outro movimento do mesmo disco **não** conta.

Cole também: `grep -n "invalidos\|reversoes\|latencia" components/exercises/executive/TorreHanoi.tsx`
e a confirmação de que nenhum desses valores é renderizado durante a execução.
