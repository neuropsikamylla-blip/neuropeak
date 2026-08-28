# Tarefa: tirar a MENSAGEM de erro dos 7 exercícios de memória

Projeto NeuroPeak. TypeScript strict, Vitest 4. Comentários em português.
**Não commite nada.** Quem revisa, aplica e commita é o Claude.

## A regra dela (28/ago/2026), nas palavras dela

> "quando erra, não aparece nenhuma mensagem de erro, só mostra onde era o correto e vai
> para o próximo"

e, esclarecendo depois:

> "eu quis dizer MENSAGEM de ERRO. **é importante mostrar o ERRO**... mas aquela MENSAGEM
> ERRO (igual do cubos) não quero"

**Leia com cuidado:** o que sai é a **palavra**, não a informação. A tela continua mostrando
o que aconteceu — só deixa de anunciar "você errou".

### O modelo já pronto: `components/exercises/memory/CuboCorsi.tsx`

Foi feito e aprovado por ela hoje. **Leia esse arquivo antes de tocar nos outros.** Nele:

- estado `review` = **"era aqui"** — a resposta certa, em azul-petróleo `#2C6B84`;
- estado `wrongTap` = **"você tocou"** — em cinza neutro `#A9B7C6`;
- quando a mesma peça é as duas coisas, **"era aqui" vence**;
- o rótulo, ao errar, diz `"Era esta a sequência"` — **não** "Incorreto", **não** "Veja onde errou";
- não há legenda "certo / errado", não há vermelho, não há som ao errar.

## O que fazer nos 7

| arquivo (em `components/exercises/memory/`) | o que sai |
|---|---|
| `SpanNumerico.tsx` | emoji `❌`/`🟡`, textos `"Incorreto"` e `"Quase!"`, cores `#DC2626`/`#D97706` |
| `LetrasSequencia.tsx` | idem, cores `#f87171`/`#fbbf24` |
| `SequenciaItens.tsx` | idem |
| `ListaDistracao.tsx` | emoji `❌`, texto `"Incorreto"`, cor `#f87171` |
| `MatrizEspacial.tsx` | texto `"Quase lá — observe de novo"` |
| `PadroesRotacao.tsx` | texto `"Quase lá"` |
| `JogoMemoria.tsx` | texto `"Incorreto ❌"` |

Regras, uma a uma:

1. **`"Correto"` e o `✅` FICAM** como estão. Acertar continua sendo comemorado.
2. **Ao errar, o rótulo passa a nomear o conteúdo**, nunca o resultado. Use a formulação que
   couber ao exercício: `"Era esta a sequência"`, `"Eram estas as posições"`, `"Era este o
   par"`. **Nunca** "Incorreto", "Errado", "Quase", "Ops", "Tente de novo".
3. **O `"Quase!"` sai junto** — decisão dela. A distinção entre erro leve e grave **continua
   existindo no código** (`erroLeve`, `classifyTrial`) porque move a dificuldade; ela só
   deixa de ser dita na tela. **Não remova a lógica**, só o texto e o emoji.
4. **A cor do rótulo ao errar** deixa de ser vermelha/âmbar e passa a ser o azul-petróleo
   `#2C6B84`, igual ao cubo.
5. **Mostrar o erro continua sendo obrigatório.** Se o exercício já marca visualmente o que o
   paciente errou (é o caso do `PadroesRotacao.tsx:117`, com vermelho translúcido), **troque
   a cor** para o cinza neutro `#A9B7C6` — não apague a marcação. Se o exercício **não**
   mostra a resposta certa em lugar nenhum, diga isso no relatório em vez de inventar: cada
   um tem um jeito próprio de exibir, e essa decisão é do Claude com ela.
6. **Som ao errar sai** onde existir (`sndWrong` e equivalentes). Não mexa no som de acerto.
7. **NÃO TOQUE** em `DesafioSupermercado.tsx` nem em `RestauranteOrdem.tsx` — ela quer os dois
   como estão, "que é mais lúdico". Nem em nenhum exercício fora da tabela.

## Teste

Acrescente a `lib/layout/palco.test.ts` (sem quebrar nada que já existe) um teste que varra os
**7** arquivos e prove, para cada um, com o nome do exercício na mensagem de erro:

- nenhuma ocorrência de `"Incorreto"`, `"Quase!"`, `"Quase lá"`, `❌`, `🟡`;
- o arquivo continua contendo `"Correto"` (acertar não foi apagado por engano).

⚠️ O arquivo de teste já tem um helper `codigo(file)` que remove COMENTÁRIOS antes de varrer.
**Use `codigo()`, nunca `source()`** — sem isso o teste acusa a própria explicação do conserto
escrita em comentário. Essa armadilha já mordeu este projeto quatro vezes.

## Prova de aceite

```
npx tsc --noEmit  ·  npm run test
```

Sem `node_modules` no clone, **diga isso** em vez de afirmar que passou. **Não rode
`npm run build`**: há um servidor de desenvolvimento no ar na máquina real e o build corrompe
o `.next` compartilhado.
