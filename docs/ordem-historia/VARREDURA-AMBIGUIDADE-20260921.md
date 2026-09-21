# Ordem da História — varredura por AMBIGUIDADE (21/set/2026)

> Terceira varredura do banco, pedida por ela depois de achar quatro problemas jogando em 21/set.
> As duas anteriores procuraram **gabarito invertido**. Esta procura **ordem não dedutível**, que é
> um defeito diferente — e que eu não tinha procurado.

## Por que esta varredura existe

Em 14/set declarei as 85 histórias conferidas, com só `f5` e `d13` erradas. Em 21/set ela achou,
**jogando**, quatro problemas numa única sessão:

| história | o que era | como eu tinha classificado |
|---|---|---|
| `m16` pintura | **gabarito errado** — veste o avental antes de desenhar sem avental | "coerente" ❌ |
| `m1` chuva | **ordem não dedutível** — cenas 3 e 4 são as duas "andando na chuva" | notei e **registrei sem tratar** ❌ |
| `m6` reciclagem | **ordem não dedutível** — separar e fazer o cartaz são independentes | "coerente" ❌ |
| `m21` maçãs | **ordem não dedutível** — lavar antes ou depois de chegar em casa | sinalizada ✅ |

**A lição:** eu procurei um defeito (gabarito invertido) e não o outro (ordem arbitrária). São
diferentes, e o segundo é pior — não há o que corrigir, porque a história **não sustenta** uma
sequência única. O paciente acerta por sorte.

## O método novo: medir antes de olhar

Olhar 85 histórias no olho já falhou duas vezes. Esta varredura **mede** primeiro:

Para cada história, calcula-se uma assinatura visual de cada cena (média de cor em blocos 8×8, que
capta cenário e layout) e a distância entre **todos os pares**. Histórias cujo par mais próximo é
muito pequeno são candidatas a "mesma cena duas vezes" — que é exatamente o caso da `m1`.

A inspeção visual passa a ser **dirigida pela medida**, sobre os pares suspeitos, em resolução alta —
em vez de varrer tudo em miniatura, que foi o que deixou o avental da `m16` passar.

## Resultado — as 13 suspeitas mais fortes

| história | par | veredito |
|---|---|---|
| `x17` patins 6-7 | patina solta × desvia dos cones | ✅ progressão de habilidade |
| `x8` porta-retrato 4-5 | moldura sem foto × com foto | ✅ |
| `x22` terrário 3-4 | pondo terra × pondo plantas | ✅ |
| `x21` pipa 3-4 | varetas amarradas × pipa colorida | ✅ |
| `f4` dentes 3-4 | escovando × resultado | ✅ |
| `m17` xadrez 4-5 | jogando × aperto de mão | ✅ |
| `x5` horta 3-5 | terra nua × plantas regadas | ✅ |
| `x15` mágica 6-8 | apresentando × confete final | ✅ |
| `x6` biblioteca 2-6 | balcão **EMPRÉSTIMO** × **DEVOLUÇÃO** | ✅ e é bom desenho |
| `f11` pulseira 1-3 | miçangas soltas × pulseira montada | ✅ |
| `f14` cerâmica 1-3 | barro informe × vaso pintado | ✅ |
| `d7` porta-retrato 3-4 | decorando × pronta com foto | ✅ |
| **`m9` aquário 2-4** | tanque de peixes × tartarugas | ⚠️ **SUSPEITA** |

**12 de 13 são coerentes** — e isso corrige uma hipótese minha: cenas parecidas indicam **mesmo
cenário**, o que é natural numa história. Ambiguidade é o mesmo **estado** repetido, não o mesmo
lugar.

### ⚠️ `m9` (aquário) — a suspeita

A visita tem três atrativos: peixes (2), tanque de contato (3), tartarugas (4). **A ordem entre eles
é arbitrária** — não há pista de percurso. É a mesma estrutura da `m6`: blocos independentes dentro
de uma atividade. Não alterada; decisão dela.

## ⚠️ O limite deste método, declarado

A medida visual pega **um** tipo de ambiguidade: a mesma cena repetida (`m1`). **Não pega o outro:
blocos semanticamente independentes** (`m6`, `m9`), porque esses blocos são visualmente *diferentes*
— separar latas não se parece com fazer um cartaz.

Detectar o segundo tipo exige julgamento semântico história a história, que nenhuma medida automática
faz. **Portanto: este documento não declara o banco limpo.** Declara que as candidatas do primeiro
tipo foram inspecionadas, e que o segundo tipo continua aberto — com `m9` como a primeira achada.

**O que funcionou de verdade até agora foi ela usando o app.** Três dos oito gabaritos corrigidos
vieram daí, e três das quatro ambiguidades também.
