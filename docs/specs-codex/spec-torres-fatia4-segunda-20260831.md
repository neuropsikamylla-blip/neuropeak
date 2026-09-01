# Spec — Torres, fatia 4: a segunda tentativa opcional

Data: 2026-08-31
Arquivo: `components/exercises/executive/TorreHanoi.tsx`.
Fonte: `docs/torres/ESPEC-JOGO-DAS-TORRES-KAMYLLA-20260831.md`, seções **7, 8, 24–27, 51, 52**.
Cobre a **Prioridade 7**. **Leia os commits `9da4544` (fatia 1) e o da fatia 3 antes.**

---

## 1. O que se constrói

Hoje, ao resolver, a conclusão informa e o puzzle seguinte entra sozinho depois de 2500 ms.
Passa a existir uma escolha, exatamente como a seção 7 dela:

> **Muito bem!** / **Você resolveu o desafio em X movimentos.** / **O menor caminho possível era
> Y movimentos.** / **Quer tentar encontrar um caminho mais eficiente?**
> [TENTAR NOVAMENTE] [CONTINUAR]

⚠️ **O `setTimeout` de 2500 ms que avançava sozinho sai NESTE caso** — a tela agora espera a
escolha. Cuidado para não quebrar o caminho de fim de sessão: se o tempo da sessão acabou
(`isTimeUp()`), **não** ofereça segunda tentativa; encerre como hoje.

## 2. A regra do "no máximo uma" (seção 52)

> *"máximo de uma segunda tentativa voluntária do mesmo problema. Depois disso, seguir."*

Portanto: o botão TENTAR NOVAMENTE aparece **somente** se aquele problema ainda não teve segunda
tentativa. Na conclusão da segunda, só **CONTINUAR**.

Ela reforçou a distinção em 31/ago: isto **não** tem relação com os reinícios, que são
**ilimitados** durante a resolução. Reinício acontece **antes** de concluir; segunda tentativa,
**depois**. Não misture os dois contadores.

## 3. Como é a segunda tentativa (seções 25 e 8)

- O **mesmo problema**, do zero: mesmo número de discos, mesma configuração inicial.
- Durante a execução, **nada de mínimo, contador ou eficiência** — a regra da fatia 1 continua
  valendo integralmente.
- Pode aparecer apenas, e discretamente: **"Tente encontrar uma estratégia mais eficiente."**
  Nada além disso.
- Reiniciar continua disponível.

## 4. A conclusão da segunda tentativa (seções 26 e 27)

Comparar as duas, **sem elogio e sem crítica**:

- Se melhorou: **"Você encontrou um caminho mais eficiente."** + `1ª tentativa: 19 movimentos` +
  `2ª tentativa: 16 movimentos`. Ela foi explícita: **nada de "Excelente!", "Perfeito!", "Você é
  muito bom!"** — *"a informação de melhora já funciona como feedback"*.
- Se piorou ou empatou: **sem mensagem negativa**. Só as duas linhas e **"Desafio concluído."**

## 5. O que se registra (seções 28 e 51)

Cada tentativa do problema é uma tentativa própria no registro — a segunda **não** apaga nem
substitui a primeira. Some ao metadata da sessão:

- `segundasTentativas` — quantas foram realizadas;
- `melhoraMediaMovimentos` — média de (movimentos da 1ª − movimentos da 2ª), só sobre os
  problemas que tiveram segunda tentativa; `null` se não houve nenhuma.

Ela pediu também a melhora percentual, **registrada e não necessariamente mostrada**: inclua
`melhoraMediaPercentual`, e **não** exiba ao paciente.

⚠️ Qual tentativa conta para a progressão de discos e para a `accuracy` da sessão? **A PRIMEIRA.**
Ela é a tentativa espontânea (seção 6: *"antes da primeira tentativa, NÃO mostrar o mínimo
teórico"*), e a segunda acontece já sabendo que existe caminho melhor — usá-la para progredir
mediria outra coisa. Registre a segunda, progrida pela primeira, e **deixe isso escrito em
comentário** no código.

## 6. O que NÃO muda

Regras do jogo, `MAX_DISCS = 5`, sessão de 11 min, botão Reiniciar e seu registro, a execução
limpa da fatia 1, `eficiencia`/`faixaEficiencia`/`deveSubirDeNivel`, `calculateExerciseScore`,
e tudo que a fatia 3 instrumentou.

## 7. Prova

```
npx tsc --noEmit          # exit 0, sem pipe
npm run test
```
**NÃO rodar `npm run build`** (dev server dela no ar na 3000).

Cole no relatório: `grep -n "Excelente\|Perfeito\|muito bom" components/exercises/executive/TorreHanoi.tsx`
→ zero; e a confirmação de que o mínimo continua aparecendo **só** na conclusão, nunca durante a
segunda tentativa.
