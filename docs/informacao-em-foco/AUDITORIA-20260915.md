# Informação em Foco — AUDITORIA, antes de tocar em qualquer coisa

> Resposta à **seção 45** da espec dela (`ESPEC-REFORMULACAO-KAMYLLA-20260915.md`), feita em 15/set/2026.
> **Nenhuma linha de código ou de dado foi alterada.** Tudo aqui é medida, e o que é execução está
> marcado como execução.
>
> Arquivos auditados: `components/exercises/attention/InformacaoEmFoco.tsx` (455 linhas),
> `lib/informacao-foco-questoes.ts` (775), `lib/informacao-foco-questoes.test.ts` (407),
> `data/informacao-foco-catalogo.ts` (304), `lib/informacao-foco-catalogo.test.ts` (108),
> `lib/exercise-dosage.ts`, `lib/adaptive.ts`, `components/exercises/ExerciseWrapper.tsx`.

---

## 0. A descoberta que muda a leitura da espec

**A engine já existe, e é muito mais capaz do que a espec supõe.** Ela não precisa ser criada — as
Fases 2 e 3 do plano dela (novo modelo de rodada, tipos de questão, validação) **já estão
implementadas** desde a reforma de ago/2026. O que falta é menor e mais cirúrgico do que o pedido
sugere.

O que **já existe hoje**, medido:

| a espec pede (§) | estado |
|---|---|
| §15 separar conteúdo de mecânica | ✅ **feito** — catálogo em `data/`, motor em `lib/`, zero pergunta escrita no componente |
| §16 validação de resposta única | ✅ **feito** — `motivoInvalidez` rejeita `semResposta` e `respostaDupla` |
| §19 operadores de critério | ✅ **9 dos 12** existem (ver §4 abaixo) |
| §5 dois modos de apresentação | ✅ **três** modalidades: `quadro`, `situacao`, `embalagem` |
| §32 anti-repetição | ✅ **feito** — `motivoRepeticao` sobre histórico da sessão |
| §36 não entregar a resposta antes | ✅ **feito** — a validação tem a trava `quadroEntregaResposta` |
| §17 distratores plausíveis | ✅ **feito** — mesma família semântica e mesma dimensão de unidade, obrigatórias |
| §12 barra global | ⚠️ **parcial** — usa o componente global, **mas mostra porcentagem** |
| §4-D exclusão / negação | ❌ **não existe** |
| §4-E filtro + comparação | ❌ **não existe** — e é mais grave do que parece (ver §5) |
| §7 contextos variados | ❌ **não existe** — 100% mercado |
| §10 sequência não previsível | ❌ **é literalmente um ciclo fixo** |
| §13 tutorial só na 1ª vez | ❌ **aparece sempre** |

---

## 1. Como as rodadas são geradas hoje

`gerarQuestao()` (`lib/informacao-foco-questoes.ts:761`) monta uma questão e a submete a
`validarQuestao`; o que não passa é **descartado e contado** (`RegistroDescarte`), e o gerador tenta
de novo. O componente guarda `questoesDescartadas` no metadata — ou seja, **o projeto já mede a
saúde do próprio gerador**.

A escolha do que gerar:

```ts
modalidadeDaAtividade(indice, nivel)   // PADRAO_MODALIDADES[indice % 10]
tipoDaAtividade(indice, nivel)         // doQuadro[indice % doQuadro.length]
```

🔴 **Isto é exatamente o que a §10 dela proíbe.** `PADRAO_MODALIDADES` é um vetor **fixo de 10**
(`quadro, quadro, situacao, quadro, quadro, embalagem, quadro, situacao, quadro, quadro`) percorrido
por resto de divisão, e o tipo sai de um **rodízio determinístico**. Não há sorteio: a sequência é
100% previsível e se repete a cada 10 atividades. É a causa mecânica do que ela descreveu como
"depois de algumas rodadas o raciocínio permanece praticamente igual".

## 2. Quantos contextos existem

**Um.** Mercado/supermercado. O catálogo tem **73 produtos** em **21 categorias** semânticas (leites,
cereais, farináceos, molhos, congelados…), mas todas são de compra de alimentos. Não existe cardápio,
cinema, viagem, agenda, loja, eventos ou farmácia.

As 73 imagens estão em `public/exercises/informacao-foco-produtos/`, com fundo transparente.

## 3. Quais atributos existem

`CampoKey` — 14 no total, sendo 13 reais e 1 virtual:

`conteudo` · `preco` · `validade` · `saches` · `unidades` · `rendimento` · `tipo` · `sabor` ·
`lactose` · `gluten` · `acucar` · `alergenicos` · `conservacao` · `cacau`
— mais `fraseEmbalagem`, **virtual**: a resposta está impressa na embalagem e nunca no quadro.

**Um detalhe de desenho que vale preservar:** só `preco` e `validade` variam por sessão (via
`criarSnapshot`), e ficam estáveis durante a sessão inteira. Todo o resto é **fixo**, lido nas
embalagens reais em ago/2026. Isso é o que impede o exercício de inventar dados.

## 4. Como a dificuldade é calculada

Em **dois lugares**, e é importante não confundi-los:

**Dentro da sessão** (`InformacaoEmFoco.tsx`): *3 acertos de primeira sobem 1 nível; 2 erros seguidos
descem 1*. Os níveis 1-8 têm parâmetros em `PARAMS_POR_NIVEL`:

| dimensão | faixa |
|---|---|
| `nProdutos` | 3 → 4 |
| `nCampos` (atributos visíveis) | 3 → 6 |
| `nCondicoes` | 1 → 3 |
| `semelhancaDistratores` | baixa → moderada → alta |
| `valoresProximos` | false → true |
| `ordemCamposVariavel` | false → true |

✅ **Isto já responde à §29 dela**: a dificuldade **não** sobe só por número de cards — `nProdutos`
é uma de seis dimensões, e vai apenas de 3 a 4, exatamente como ela quer.

**Entre sessões:** 🔴 o metadata **não** declara `progressionV2`, então o servidor cai no
**`calculateNewDifficulty` LEGADO**, que decide pelas **5 últimas sessões**. É o motor antigo, não o
clínico. Todos os exercícios reformados recentemente usam o caminho novo.

## 5. Como a resposta correta é definida

`atendeTodas(produto, condicoes, todos)` — o produto correto é o único que satisfaz **todas** as
condições. `motivoInvalidez` então rejeita a questão se os que atendem forem **0** (`semResposta`) ou
**2+** (`respostaDupla`). A validação vai além disso e trava ainda: famílias semânticas diferentes,
dimensões de unidade incompatíveis, campo exigido oculto, **quadro entregando a resposta**, leitura
de embalagem não autorizada, atributo inexistente no produto e menos de 3 campos visíveis.

### 🔴 E aqui está o achado técnico central da auditoria

**O TIPO E da espec dela — "filtrar e depois comparar" — não é expressável no motor atual.**

`minimo` e `maximo` comparam contra **todos** os produtos da questão, nunca contra o subconjunto que
passou nas outras condições:

```ts
case "minimo": case "maximo": {
  const outros = todos.map((o) => numeroDe(o, c.campo))...   // TODOS, não os filtrados
  return c.operador === "minimo" ? meu === Math.min(...outros) : ...
}
```

**Provado por execução**, não por leitura. Montei três leites — R$ 9,00 vencendo em 2027, R$ 5,00 em
2026, R$ 7,00 em 2027 — e pedi *"entre os que vencem em 2027, qual é o mais barato?"* como
`validade ≥ 2027` **E** `preco = mínimo`:

```
resposta clinicamente certa: o de R$ 7,00
o motor de hoje devolve:     0 produto(s) — NENHUM
```

Porque o mínimo global é o de R$ 5,00, que está fora do filtro. Na prática a questão seria
**descartada** como `semResposta` e o paciente nunca a veria. **O TIPO E exige mudar a semântica de
`minimo`/`maximo` para operar sobre o conjunto já filtrado** — é a mudança mais delicada de toda a
reformulação, porque mexe no coração da validação que hoje funciona.

**O TIPO D (exclusão/negação) também não existe:** não há operador de desigualdade. `eFalso` só vale
para `lactose`/`gluten`/`acucar`, e `naoContem` só para alergênicos. *"Qual NÃO pesa 500 g?"* não é
expressável — falta um `diferente` genérico.

## 6. Quais métricas já são registradas

No `onComplete`: `questoes`, `acertos`, `acertosPrimeira`, `pistasUsadas`, `nivelFinal`,
`accuracyPrimeira`, `questoesDescartadas`. A `accuracy` enviada é a geral; o `score` usa a
**acurácia de primeira tentativa** — ✅ coerente com a lição que já está congelada na plataforma.

🔴 **Não existe registro POR RODADA.** Tudo é agregado da sessão. Nada do que a §26 pede está lá:
sem `questionType`, sem `context`, sem `responseTime`, sem `zoomUsed`, sem
`ruleChangedFromPreviousRound`. **Sem isso, o relatório por tipo da §27 é impossível** — não é
questão de somar depois, o dado não é gravado.

## 7. Como o tutorial é persistido

**Não é.** A tela de 4 instruções (`PARE → LEIA → PROCURE → CONFIRA → RESPONDA`) vem de um vetor de
strings em `page.tsx:287` e é exibida pelo `ExerciseWrapper`, cuja fase inicial é `"instructions"`
**sempre que `instructions.length > 0`**. Não há gate, não há verificação, não há persistência.

O mecanismo global **existe** (`/api/exercise-tutorial` + `ExerciseConfig.tutorialCompletedAt`), e
`lib/tutorial/versions.ts` **já reserva** `"informacao-em-foco": 2` — mas o exercício **não está** em
`TUTORIAIS_POR_EXERCICIO`, ou seja, nunca foi convertido ao framework T1. ✅ Como ela pediu na §13:
o mecanismo a reutilizar já existe, não se cria nada paralelo.

## 8. Como a barra global está conectada

Usa `useBlocoDeTreino("informacao-em-foco", difficulty)` + `ExerciseProgressBar` — ✅ o componente
global correto, sem barra própria.

🔴 **Mas mostra porcentagem** (`InformacaoEmFoco.tsx:374`):
```tsx
<span>Tempo da sessão · {Math.round(progressPct)}%</span>
```
`grep -rln "progressPct)}%" components/exercises/` retorna **este arquivo e nenhum outro**: é o
**único exercício da plataforma** que ficou para trás na padronização que tirou a porcentagem de
todas as telas.

### ⚠️ A dose é 6 minutos, não 8 — e ela pediu para ser avisada

`lib/exercise-dosage.ts:27`:
```ts
"informacao-em-foco": dosagemPorTentativas(360),   // dose curta deliberada (já era 6 min)
```
A §12 dela diz *"se a auditoria global tiver configurado dose diferente especificamente para
Informação em Foco, me mostrar antes de mudar"*. **É exatamente o caso.** São **360 s = 6 min**, e o
comentário registra que foi deliberado. **Não mudei nada — a decisão é dela.**

## 9. O que pode ser reaproveitado

**Quase tudo.** Em ordem de valor:

1. **Toda a validação** (`motivoInvalidez`) — é o coração da §16 e já é mais rigorosa do que ela pede.
2. **O catálogo de 73 produtos** com dados lidos das embalagens reais, e as 73 imagens.
3. **A arquitetura conteúdo × mecânica** — já é o que a §15 pede.
4. **Os 3 modos de apresentação** (`quadro`/`situacao`/`embalagem`) — a §5 pede 2, já há 3.
5. **`PARAMS_POR_NIVEL`** — as 6 dimensões de carga, que já evitam o "só aumentar cards" da §3.
6. **A anti-repetição** (`motivoRepeticao`) — base pronta para a §32.
7. **A interface** — ela mesma disse que está boa, e não vejo razão para tocá-la além de dois pontos
   pequenos (a porcentagem e a responsividade da §34).
8. **Os 515 testes** já escritos entre os dois arquivos de teste.

## 10. O que precisa ser substituído

| item | por quê |
|---|---|
| `tipoDaAtividade` / `modalidadeDaAtividade` | rodízio fixo por resto de divisão → §10 exige variedade controlada |
| semântica de `minimo`/`maximo` | impede o TIPO E (provado por execução na §5) |
| operadores | falta desigualdade genérica para o TIPO D |
| registro de rodada | não existe; §26 e §27 dependem dele |
| a linha da porcentagem | §12 e o padrão global |
| tela de instruções sempre visível | §13 — converter ao T1 |
| `calculateNewDifficulty` legado | os demais exercícios já usam o motor clínico |

## 11. Mudanças necessárias no banco

**Nenhuma mudança destrutiva.** O catálogo atual continua válido como o contexto "mercado".

O que falta é **extensão**: hoje `ProdutoCatalogo` é um tipo específico de produto de supermercado
(tem `lactose`, `gluten`, `conservacao`…). Para cardápio, cinema, viagem e agenda é preciso uma
abstração de **item com atributos tipados** que o mercado passe a ser um caso particular.

⚠️ **Isto não exige tocar o banco de dados.** Tudo vive em arquivos `.ts` versionados — não há
tabela, coluna ou migração envolvida. **Nenhum backup de banco é necessário para esta reformulação.**

Sobre imagens: cardápio, cinema, viagem e agenda **não precisam de fotos de produto**. São materiais
gráficos (uma tabela de horários, um cartaz de sessão, um cardápio), que podem ser **desenhados em
HTML/CSS** em vez de gerados como imagem — mais legíveis, responsivos e acessíveis, e resolve a §6
(não criar dificuldade por baixa legibilidade) de graça.

## 12. Plano técnico recomendado

O plano dela tem 7 fases. Como as Fases 2 e 3 **já estão feitas**, proponho **6 fatias** numa ordem
diferente, cada uma terminando com prova rodada e commit — e as três primeiras entregam valor
clínico sem tocar em nada estrutural.

| # | fatia | por que nesta ordem | risco |
|---|---|---|---|
| **C1** | **A sequência deixa de ser previsível** + porcentagem fora + dose decidida por ela | É a causa nomeada por ela ("vira algoritmo") e a correção é pequena: trocar rodízio por sorteio com anti-repetição, que já existe | baixo |
| **C2** | **Registro por rodada** (§26) | Tudo depois disso precisa medir; sem isto não há como provar que a variedade aumentou | baixo |
| **C3** | **TIPO D — exclusão/negação** | Operador novo, isolado; a validação existente já cobre o resto | baixo |
| **C4** | **TIPO E — filtro + comparação** | **A fatia delicada.** Muda a semântica de `minimo`/`maximo` dentro da validação que hoje funciona | **alto** |
| **C5** | **Contextos novos** (cardápio, cinema, viagem, agenda) | Depende de C3 e C4: sem os tipos novos, contexto novo seria só troca de nome — o que a §8 proíbe | médio |
| **C6** | **Tutorial no T1** + relatório por tipo (§27) | Fecha o ciclo; o relatório precisa dos dados de C2 | médio |

**Por que C4 é alta e vem isolada:** a regra "exatamente uma resposta correta" é o que hoje impede
questão ambígua de chegar ao paciente. Mudar como `minimo`/`maximo` enxergam o conjunto altera o
cálculo de quem atende, e portanto **altera a própria validação**. Essa fatia vai precisar de prova
por volume — gerar milhares de questões dos dois tipos e provar que **nenhuma** sai com 0 ou 2+
respostas —, mais controle negativo mostrando que o motor antigo reprovaria.

**Fora do escopo, até ela pedir:** a §34 (responsividade) precisa de verificação visual dela no
celular antes de eu mexer; e a decisão sobre a dose de 6 min é dela.
