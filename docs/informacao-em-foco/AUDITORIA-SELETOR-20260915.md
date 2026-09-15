# Informação em Foco — AUDITORIA DO SELETOR (2ª rodada, 15/set/2026)

> Ela testou a v3.31.0 em produção e reprovou: *"O exercício ainda está repetitivo. Você mudou o
> conteúdo das perguntas, mas NÃO mudou suficientemente o tipo de raciocínio exigido."*
>
> **Ela está certa, e o erro é de método meu** — ver seção 0. Este documento responde aos 8 itens
> que ela pediu, **todos medidos por execução**, e corrige o plano.

---

## 0. O erro do meu plano, antes de qualquer número

A primeira auditoria listou **10 `TipoQuestao`** e eu os tratei como **10 operações cognitivas**.
Não são. A fatia C1 então embaralhou a **ORDEM** desses tipos — e embaralhar a ordem de coisas que
exigem o mesmo raciocínio não muda raciocínio nenhum.

Ela nomeou a pergunta que eu deveria ter feito e não fiz: *"se algum tipo existe apenas no nome, mas
cognitivamente continua funcionando igual"*. **Existe. Cinco deles.**

É o terceiro erro da mesma família nesta semana: medir uma peça e presumir o que ela significa.
No ⠿ de Ordem da História, li o ícone em vez do código. Na auditoria anterior desta, medi as funções
do `lib` sem conferir quem as chamava. Aqui, contei **nomes** e chamei de **operações**.

---

## 1. Quais `questionTypes` existem hoje

Dez nomes em `TipoQuestao`: `localizacao`, `comparacao`, `duasCondicoes`, `tresCondicoes`,
`validade`, `conservacao`, `ingredientes`, `alergenicos`, `situacao`, `leituraEmbalagem`.

## 2. Qual função escolhe a próxima rodada

`InformacaoEmFoco.tsx`, dentro de `novaQuestao()` — depois da C1:

```ts
const modalidade = sortearModalidade(nivel, Math.random);
const tipo = modalidade === "situacao" ? "situacao"
  : modalidade === "embalagem" ? "leituraEmbalagem"
    : sortearTipo(nivel, Math.random);
gerarQuestao(tipo, paramsDoNivel(nivel), snapshot, Math.random, historico, tiposDoNivel(nivel));
```

🔴 **O seletor escolhe um NOME DE TIPO, nunca uma operação.** É a causa raiz: ele responde
*"qual atributo vou perguntar agora?"* quando ela pediu que respondesse
*"o que o paciente precisa FAZER mentalmente nesta rodada?"*.

## 3. Existe anti-repetição?

Sim — `motivoRepeticao`, e ela **barra** mesmo texto nas 3 últimas, mesmos campos nas 3 últimas,
mesmo produto correto seguido, **três do mesmo tipo seguidas**, mesma categoria em 3 seguidas, e duas
idênticas na sessão.

🔴 **Mas ela está CEGA à operação:** a regra `tresDoMesmoTipoSeguidas` compara `h.tipo`, que é o
**nome**. Como cinco nomes são a mesma operação, a sequência
`localizacao → validade → conservacao` **passa pela anti-repetição** sendo três buscas diretas
seguidas.

**Medido — 200 sessões de 12 rodadas no nível 5, com a anti-repetição ATIVA:**

| medida | resultado |
|---|---|
| sessões com **3+ rodadas seguidas da mesma OPERAÇÃO** | **105 de 200 — 53 %** |
| maior sequência da mesma operação observada | **6 rodadas seguidas** |

É exatamente o que ela viveu: *"depois de várias atividades, eu ainda estou basicamente fazendo:
ler pergunta → olhar a mesma linha nos 3 cards → escolher"*.

## 4. Quantas rodadas são apenas busca direta ou comparação de um atributo

**Medido, gerando sessões reais de 20 rodadas:**

| | nível 2 (o que ela testou) | nível 5 |
|---|---|---|
| nomes de tipo distintos | 2 | **8** |
| **OPERAÇÕES distintas** | **2** | **3** |
| busca direta (1 linha) | 38 % | 55 % |
| comparação (extremo) | 62 % | 15 % |
| dois critérios | 0 % | 30 % |
| **total de operações de UMA LINHA** | **100 %** | **70 %** |
| filtro + comparação | 0 | **0** |

🔴 **No nível 2, `tiposDoNivel(2)` devolve só `["localizacao", "comparacao"]`.** Não existe terceira
operação para sortear — a variação que ela pede no nível 2 é **impossível hoje**, por construção.

## 5. O colapso: 8 nomes → 3 operações

A causa está em `tentarNoGrupo`: o número de condições é decidido **pelo nome**, e vale **1** para
quase todos.

```ts
const nCond = tipo === "tresCondicoes" ? 3
  : tipo === "duasCondicoes" ? 2
  : tipo === "situacao" ? Math.min(params.nCondicoes, 3)
  : 1;          // ← localizacao, validade, conservacao, ingredientes, alergenicos, leituraEmbalagem
```

| nome do tipo | operação real |
|---|---|
| `localizacao`, `validade`, `conservacao`, `ingredientes`, `alergenicos`, `leituraEmbalagem` | **BUSCA DIRETA** — 1 condição sobre 1 campo |
| `comparacao` | **COMPARAÇÃO** — extremo (min/max) |
| `duasCondicoes`, `tresCondicoes`, `situacao` | **N CRITÉRIOS** |

**`validade`, `conservacao`, `ingredientes` e `alergenicos` não são tipos de pergunta — são CAMPOS.**

## 6. Quais dos 9 tipos que ela listou existem de verdade

| # | o que ela pede | estado medido |
|---|---|---|
| 1 | busca direta | ✅ existe — e **domina** |
| 2 | comparação | ✅ existe |
| 3 | dois critérios simultâneos | ✅ existe (`duasCondicoes`) |
| 4 | **filtrar e depois comparar** | ❌ **não existe** — provado por execução: devolve 0 produtos |
| 5 | **exclusão VERDADEIRA** | ❌ **não existe** — ver abaixo |
| 6 | mudança de regra | ⚠️ **falso positivo**: muda o NOME, não a operação (53 % de 3+ seguidas) |
| 7 | **distrator explícito** ("ignore o preço") | ❌ **não existe** |
| 8 | informação no material visual | ⚠️ existe, mas **só do nível 6** para cima |
| 9 | **contextos novos** | ❌ **não existe** — 100 % mercado |

**São 3 de 9.** E o #5 é pior que ausência — é um **falso positivo**, exatamente o que ela antecipou:

```
[BUSCA DIRETA] tipo=ingredientes  "Qual produto não contém lactose?"
```

O card tem a linha `Lactose: não`. É **busca direta com redação negativa** — o "exemplo ruim" que ela
escreveu na própria espec. A exclusão que ela quer exige **avaliar condições e achar quem fica de
fora**, não ler uma linha negada.

## 7. Como garantir variedade dentro da mesma sessão

**A arquitetura tem de inverter.** Hoje: sorteia nome de tipo → gera conteúdo.
Precisa ser: **sorteia OPERAÇÃO → escolhe campo/contexto → gera conteúdo**.

E a anti-repetição precisa passar a olhar, como ela listou:
`operação anterior` · `atributo principal anterior` · `contexto anterior` · `questionType anterior`.

Hoje ela olha o último item dessa lista e **nenhum dos três primeiros**.

## 8. O plano corrigido

A C1 não foi perdida — o sorteio e a remoção da porcentagem ficam. Mas ela era **necessária e
insuficiente**, e a ordem das fatias seguintes muda. Ela foi explícita: *"não quero mais conteúdo
novo antes de corrigir a arquitetura de seleção das rodadas"*.

| # | fatia | por que |
|---|---|---|
| **C2a** | **tirar "Nível 2" e "Atividade 6" da tela** | queixa direta dela, e é a mesma linha técnica que saiu de Ordem da História |
| **C2** | **`Operacao` como conceito de primeira classe** — o seletor sorteia OPERAÇÃO, `nCond` deixa de derivar do nome, e a anti-repetição passa a ver operação + atributo + contexto. **Liberar N CRITÉRIOS já no nível 2.** | é a arquitetura que ela mandou corrigir antes de tudo |
| **C3** | **exclusão VERDADEIRA** — avaliar 2 condições e pedir quem NÃO atende; e uma trava que **proíba** gerar exclusão cuja resposta esteja numa única linha | hoje é falso positivo |
| **C4** | **filtro + comparação** — ⚠️ alto risco: muda `minimo`/`maximo` dentro da validação | é o tipo que ela chamou de "uma das mais interessantes" |
| **C5** | **distrator explícito** ("Ignore o preço. Qual vence primeiro?") | barato depois da C2 |
| **C6** | **contextos novos** (cardápio, cinema, viagem, agenda) | só depois de C3-C5, senão é troca de nome — o que a §8 dela proíbe |
| **C7** | registro por rodada + relatório por operação | fecha |

**A prova que a C2 tem de entregar**, e que a C1 não entregou: a contagem de **3+ rodadas seguidas da
mesma OPERAÇÃO** tem de cair de **53 %** para **0 %**, e o nível 2 tem de apresentar **no mínimo 3
operações distintas** em 20 rodadas. Com controle negativo mostrando que o estado de hoje reprova.
