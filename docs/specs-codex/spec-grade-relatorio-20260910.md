# Spec — Grade Dedutiva: o relatório de processo do terapeuta (F7)

Data: 2026-09-10
Fecha a **fase 7** da espec dela. Hoje a Grade registra muito e **a terapeuta não vê nada**: o
relatório só lê o campo de abandono do `metadata`.

É o princípio central da espec dela que está sem saída:
> *"O paciente não deve apenas encontrar respostas. Quero que o sistema consiga observar COMO ELE
> CHEGOU À RESPOSTA."*

## O molde a seguir — não invente arquitetura

**`Caminhos para a Meta` já é exatamente isto**, e foi aprovado por ela. Copie a estrutura:
- agregador **puro e testável** em `lib/` — veja `lib/caminhos-report.ts`, função
  `summarizeCaminhosMeta(sessions) → CaminhosSummary | null`;
- uma **seção no PDF** em `app/api/reports/route.ts`, com linhas rótulo/valor e uma lista de
  observações ao final — veja o bloco `caminhosSection`.

**Leia os dois antes de escrever qualquer linha.** Crie `lib/grade-report.ts` com
`summarizeGradeDedutiva(sessions) → GradeSummary | null`, e a seção correspondente.

## ⛔ A regra que rege TODO o texto desta fatia

Decisão dela e do gestor de conteúdo, já registrada em `DECISOES-MECANICA-20260903.md`:
**o sistema DESCREVE; a interpretação é da profissional.**

⛔ **Proibido** em rótulo, valor, observação ou comentário: `impulsividade`, `prematur*`,
`insegurança`, `ansiedade`, `déficit`, `dependência`, `precipitação`, `falha`, `fraqueza`,
`prejudicado`, `pior`, `ruim`. **Escreva um teste que varre a seção inteira e reprova qualquer um.**

⛔ **Proibido linguagem técnica de software** — princípio permanente do projeto: nada de
`metadata`, `indicador interno`, `heurística`, `restrição atômica`, `solver`, `régua`, `puzzle`,
`nível 3` como jargão de código. Fale a língua da neuropsicologia: *problemas resolvidos*,
*organização*, *pistas*, *verificação*, *revisão*.

✅ **Modelo do que é aceitável**, e é o que ela mesma aprovou no formato descritivo:
```
Atribuições realizadas antes da determinação lógica: 8
   mantidas até a solução:  5
   posteriormente revisadas: 3
```
Fato, contagem, sem adjetivo.

## O que a seção mostra

Dos **cinco indicadores** (`lib/grade/indicadores.ts`) e do registro por problema
(`lib/grade/sessao.ts`). Traduzidos para a clínica:

| linha | de onde vem |
|---|---|
| Problemas resolvidos | `problemasResolvidos` de `problemas.length` |
| Organização construída antes de a relação estar determinada | I2, com **mantidas × revisadas** |
| Escolhas mantidas com a organização já incompatível | I3 |
| Verificações usadas · e quantas foram seguidas de correção | I4 |
| Pistas trabalhadas · e quantas foram retomadas depois | I5 |
| Tempo médio por problema | do registro |
| Evolução no próprio histórico | como o Caminhos faz: **subiu/manteve/regrediu**, comparando o paciente **com ele mesmo** |

⚠️ **Toda razão com denominador zero vira `—`**, nunca `0%` e nunca `NaN`. "Não há esse dado" é
diferente de "esse dado vale zero", e a diferença é clínica.

⚠️ **As observações são DESCRITIVAS.** *"Revisou 3 das 8 escolhas feitas antes de a relação estar
determinada"* é observação. *"Apresenta impulsividade"* é diagnóstico, e não sai daqui.

## Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 81 arquivos / 1057 testes — não pode cair
```
**NÃO rodar `npm run build`.** Sem `node_modules` no lab, **declare** em vez de fingir.

Testes obrigatórios:
- o agregador devolve `null` quando **não há** sessão de `deductive-grid` — e o relatório então
  **não mostra a seção**, exatamente como o Caminhos faz;
- agrega **várias sessões** corretamente, e `mantidas + revisadas` continua fechando;
- **denominador zero vira `—`**, nunca `0%` nem `NaN`, em cada linha que é razão;
- a **varredura dos termos proibidos** passa em `lib/grade-report.ts` **e** na seção do PDF;
- nenhuma observação gerada contém adjetivo de julgamento — teste com um caso construído para
  produzir o pior cenário possível (nenhum problema resolvido, muitas contradições) e prove que o
  texto continua **descritivo**;
- a numeração das seções do PDF continua correta com a seção nova (o Caminhos usa `caminhosNo`).

## Relatório

As linhas exatas que a seção mostra, com um exemplo renderizado de cada; como tratou os
denominadores zero; e a confirmação de que o pior cenário possível produz texto descritivo.
