# Spec — Grade Dedutiva: gerador de problemas + os 4 problemas de nível 2

Data: 2026-09-08
Origem: fechamentos 4 e 6 dela. A régua (v3.14.0) está pronta e provada; a autoria está liberada.

Fontes: esta spec · `docs/grade-dedutiva/PROPOSTA-BANCO-F5-20260908.md` · `lib/grade/` (leia
`tipos.ts`, `estrutura.ts`, `solver.ts` e `banco.ts` antes de escrever qualquer linha).

⛔ **NÃO toque na interface.** ⛔ **NÃO altere `selecionarProblema`** — a troca do banco antigo pelo
novo é a fatia final, quando os 16 existirem. ⛔ **NÃO apague nem conserte os puzzles atuais**: o
teste que afirma que eles reprovam tem de continuar passando.

---

## 1. Por que um gerador, e não 16 puzzles escritos à mão

Cada problema precisa satisfazer **onze** condições ao mesmo tempo (solução única + os dez critérios
da régua). À mão isso é inviável e frágil.

**O gerador roda na AUTORIA, nunca em produção.** Ele emite um arquivo `.ts` com os puzzles já
validados, que é **commitado como dado**. É o precedente do `lib/torres/`: banco pré-validado,
solução provada por busca, **nada de geração aleatória em tempo de execução**.

---

## 2. A gramática das pistas (`lib/grade/gramatica.ts`, NOVO)

O texto tem de sair em **português natural**, não em telegrama lógico. Cada categoria declara **três**
formas curtas:

```ts
export interface GramaticaCategoria {
  /** Como o valor vira SUJEITO da frase. Ex.: "Lia" · "Quem esteve na Sala Acervo" */
  sujeito: (valor: string) => string;
  /** PREDICADO, e tem de COMEÇAR COM VERBO — é o que faz a negação ser só prefixar "não ".
   *  Ex.: "participou do encontro sobre Ciência" · "é Lia" */
  predicado: (valor: string) => string;
  /** Sintagma nominal para as pistas de ORDEM. Ex.: "a pessoa da Sala Acervo" */
  referencia: (valor: string) => string;
}
```

Com isso os moldes ficam **gerais**, e não um por tema:

| tipo | molde |
|---|---|
| T1/T8 | `{sujeito(A)} {predicado(B)}.` |
| T2 | `{sujeito(A)} não {predicado(B)}.` |
| T4/T11 | `{referencia(A)} vem antes de {referencia(B)}.` |
| T6 | `{referencia(A)} vem imediatamente antes de {referencia(B)}.` |
| T5 | `{referencia(A)} e {referencia(B)} ocupam posições vizinhas.` |
| T7 | `{referencia(C)} está entre {referencia(A)} e {referencia(B)}, nessa ordem.` |
| T3 | `{sujeito(A)} está em {rotuloPosicao}.` |
| **composta** | `{sujeito(A)} não {predicado(B)} nem {predicado(C)}.` |

⚠️ Os verbos de ordem ("vem antes de", "ocupam posições vizinhas") são **do tema**, não fixos: numa
clínica é *"foi atendido antes de"*, num cineclube é *"foi exibido antes de"*. Ponha os verbos de
ordem no tema, com **padrão** para quem não os declarar.

**Obrigatório:** toda pista gerada passa por um verificador que rejeita texto com espaço duplo,
espaço antes de pontuação, ou frase que não termine em ponto. Teste isso.

---

## 3. O gerador (`lib/grade/gerador.ts`, NOVO)

**Determinístico por semente.** Nada de `Math.random`: o mesmo `seed` produz o mesmo banco, senão o
resultado não é reproduzível e a revisão dela não vale para a próxima execução.

Algoritmo:

1. **Solução:** permutação aleatória dos valores de cada categoria.
   ⚠️ A ordem **declarada** em `categoria.valores` é embaralhada **em separado** da solução — é o
   que impede o defeito de "pôr cada um na ordem da lista", já que o menu da célula usa a ordem
   declarada. Garanta **no máximo 1** categoria coincidindo (`LIMIAR_ORDEM_DECLARADA`).
2. **Pool de pistas VERDADEIRAS:** todas as instâncias de cada tipo que a solução satisfaz.
   **Pondere fortemente as cross-category** — o critério 5 exige `cross > intra`.
3. **Seleção:** embaralhe o pool e vá acrescentando até `contarSolucoes(puzzle, 2) === 1`.
4. **Minimização OBRIGATÓRIA:** tente remover cada pista; se a solução continuar única, ela sai.
   Sem isso o puzzle fica cheio de redundância e o critério 10 (cobertura) vira ruído.
5. **Régua:** rode `avaliarEstrutura`. Reprovou, descarta e tenta outra semente.
6. Repita até achar `N` puzzles aprovados. **Limite de tentativas** por puzzle, e se estourar,
   **falhe alto** com a razão — nunca devolva puzzle não validado.

**Emissão:** uma função pura que recebe os puzzles e devolve o **código-fonte TypeScript** do
arquivo, para o teste de geração escrever em disco. Nada de template frágil: o código emitido tem de
compilar e ser legível por humano (é ela quem vai revisar o texto das pistas).

**Como rodar** — sem dependência nova, por teste guardado por variável de ambiente:
`GERAR_BANCO=1 npx vitest run lib/grade/gerar-banco.test.ts`
Sem a variável, o teste **não escreve nada** e apenas confere que o arquivo já emitido continua
aprovado. Isso é o que mantém a suíte normal pura.

---

## 4. Os 4 temas de nível 2 — 4 posições × 3 categorias

**Regra de autoria que vale para todos, e é fácil errar:** as categorias têm de ser
**semanticamente independentes**. Se uma oficina de *Cerâmica* usasse *Argila*, o conhecimento de
mundo substituiria a dedução e o puzzle deixaria de treinar raciocínio. Nenhum par abaixo tem essa
ligação — **mantenha assim**.

Eixo = ordem/tempo, e cada tema traz `rotulosPosicao`.

**A. Consultas da manhã** — `rotulosPosicao: ["8h", "9h", "10h", "11h"]` · verbo de ordem: "foi atendido"
- `paciente`: Alice · Décio · Íris · Rafa — sujeito `"{v}"` · predicado `"é {v}"` · referência `"{v}"`
- `especialidade`: Cardiologia · Nutrição · Ortopedia · Psicologia — sujeito `"Quem foi à {v}"` · predicado `"foi à {v}"` · referência `"quem foi à {v}"`
- `sala`: Âmbar · Coral · Jade · Névoa — sujeito `"Quem usou a sala {v}"` · predicado `"usou a sala {v}"` · referência `"quem usou a sala {v}"`

**B. Turnos na cafeteria** — `rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta"]` · verbo: "trabalhou"
- `barista`: Bruno · Ester · Nara · Tulio — como `paciente` acima
- `preparo`: Espresso · Filtrado · Gelado · Prensa — sujeito `"Quem preparou o {v}"` · predicado `"preparou o {v}"` · referência `"quem preparou o {v}"`
- `posto`: Balcão · Caixa · Forno · Salão — sujeito `"Quem ficou no {v}"` · predicado `"ficou no {v}"` · referência `"quem ficou no {v}"`

**C. Sessões do cineclube** — `rotulosPosicao: ["18h", "19h30", "21h", "22h30"]` · verbo: "foi exibido"
- `filme`: Correnteza · Estuário · Miragem · Vertigem — sujeito `"{v}"` · predicado `"é {v}"` · referência `"{v}"`
- `curador`: Ciro · Lena · Otto · Vera — sujeito `"Quem foi apresentado por {v}"` · predicado `"foi apresentado por {v}"` · referência `"o filme de {v}"`
- `genero`: Documentário · Drama · Policial · Suspense — sujeito `"O {v}"` · predicado `"é um {v}"` · referência `"o {v}"`

**D. Oficinas no centro cultural** — `rotulosPosicao: ["14h", "15h", "16h", "17h"]` · verbo: "aconteceu"
- `oficina`: Cerâmica · Fotografia · Marcenaria · Tecelagem — sujeito `"A oficina de {v}"` · predicado `"é a oficina de {v}"` · referência `"a oficina de {v}"`
- `mediador`: Alma · Iuri · Sol · Zeca — sujeito `"A oficina de {v}"` … use `"Quem foi mediado por {v}"` · predicado `"foi mediada por {v}"` · referência `"a oficina de {v}"`
- `espaco`: Ateliê · Galpão · Mezanino · Pátio — sujeito `"Quem ocupou o {v}"` · predicado `"ocupou o {v}"` · referência `"quem ocupou o {v}"`

⚠️ Se alguma concordância ficar torta ao montar as frases (gênero, contração), **ajuste a gramática
do tema** e diga no relatório o que mudou. Português correto **com acentuação** é requisito, não
enfeite.

**Pelo menos um** dos quatro tem de conter **uma pista composta** (`{sujeito} não {pred} nem
{pred}.`), para exercitar o formato da fatia A em problema real.

---

## 5. Onde os problemas ficam

`lib/grade/problemas/nivel2.ts` — emitido pelo gerador, exportando `PROBLEMAS_NIVEL_2: Puzzle[]`.
`banco.ts` passa a **importar e reexportar** esse arranjo, **sem** mexer em `selecionarProblema`.

---

## 6. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 69 arquivos / 945 testes — não pode cair
```
**NÃO rodar `npm run build`.** Você provavelmente não roda nada no lab por falta de `node_modules`:
**declare**, não finja.

Testes obrigatórios:
- **cada um dos 4 problemas** tem solução única (`temSolucaoUnica`) e `validarPuzzle` nulo;
- **cada um dos 4 passa na régua inteira** — `avaliarEstrutura(p).aprovado === true`, e o teste
  imprime os motivos quando falhar, para o conserto ser possível;
- o gerador é **determinístico**: a mesma semente devolve puzzles idênticos, comparados por
  `JSON.stringify`;
- **sem a variável de ambiente, o teste de geração não escreve em disco** — prove por `mtime` ou
  por espiã na escrita;
- o verificador de texto rejeita espaço duplo, espaço antes de pontuação e frase sem ponto final;
- pelo menos um problema tem pista com **2 ou mais restrições**;
- os puzzles ANTIGOS continuam reprovando (o teste que já existe **não pode** ser tocado).

## 7. Relatório

A semente usada; quantas tentativas cada problema exigiu; a contagem final de pistas e restrições de
cada um; qualquer ajuste de concordância que você fez na gramática; e o texto **completo** das
pistas dos 4 problemas, para eu revisar sem abrir arquivo.
