# Spec — Grade Dedutiva: os cinco indicadores de processo, que MEDEM sem decidir

Data: 2026-09-10
Base: `docs/grade-dedutiva/PROPOSTA-ADAPTATIVO-SECAO48-20260909.md`, seção 7, **fatia 1**.

## O princípio desta fatia, e por que ela existe separada

> *"Implementar os cinco indicadores como funções puras e gravá-los, **sem que decidam nada**.
> Assim, quando ela for calibrar, calibra com dados reais dos pacientes dela em vez de com palpite."*

A razão é concreta e já custou caro: a acurácia da Torre ficou `1` fixo e o exercício **subiu de
nível para sempre**; a Grade quase repetiu o mesmo defeito. Ligar número ao motor antes de saber o
que ele significa é o erro que esta fatia existe para não repetir.

## ⛔ Proibições

- ⛔ **NÃO ligue nada ao motor adaptativo.** Nada em `lib/adaptive.ts`. Nada que mude dificuldade,
  selecione problema ou altere a cota de verificação. Esta fatia **só mede**.
- ⛔ **NÃO mude a mecânica nem a estrutura da tela** — `lib/grade/contrato-tela-aprovada.test.ts`
  tem 8 testes. Reprovou? **PARE e relate.**
- ⛔ **NÃO invente dado novo.** Todos os cinco saem do que `lib/grade/sessao.ts` **já registra**.
  Se algum precisar de dado que não existe, **PARE e relate** em vez de instrumentar por conta.
- ⛔ **NÃO crie coluna nem tabela.** Vai no `metadata`, que é Json e já existe.

## ⚠️ A regra que rege todos os nomes

Decisão dela, e do gestor de conteúdo, já registrada em
`docs/grade-dedutiva/DECISOES-MECANICA-20260903.md`: **o sistema DESCREVE; a interpretação é da
profissional.**

**Proibido** em nome de campo, valor, comentário ou texto: `impulsividade`, `prematur*`,
`inseguranca`, `ansiedade`, `deficit`, `dependencia`, `precipit*`, `falha`, `fraqueza`,
`prejudicado`. Escreva um teste que **varre o arquivo** e reprova qualquer um deles.

Nomeie pelo **fato observado**, não pela hipótese: `atribuicoesAntesDeDeterminacao` é fato;
"confirmação prematura" é inferência.

## Os cinco — `lib/grade/indicadores.ts` (novo)

Funções **puras**, recebendo `MetadataSessaoGrade` (de `lib/grade/sessao.ts`) e devolvendo números.
**Toda razão precisa tratar denominador zero** devolvendo `null`, nunca `NaN` — uma sessão sem
atribuição não tem o indicador, e isso é diferente de tê-lo valendo zero.

| # | nome | cálculo |
|---|---|---|
| **I1** | `resolucao` | `problemasResolvidos ÷ problemas iniciados` |
| **I2** | `exploracaoAntesDaDeterminacao` | `atribuicoesAntesDeDeterminacao ÷ total de atribuições`; **e** `revisadas ÷ (mantidas + revisadas)` num segundo campo |
| **I3** | `persistenciaEmContradicao` | `atribuicoesComEstadoJaContraditorio ÷ total de atribuições` |
| **I4** | `autonomiaDeMonitoramento` | verificações usadas ÷ cota disponível; **e**, das que acusaram incompatibilidade, quantas foram corrigidas depois |
| **I5** | `metodoDeLeitura` | pistas riscadas ÷ pistas do problema; quantas foram **desmarcadas** depois; e a **ordem** em que foram trabalhadas |

⚠️ **I2 é o mais fácil de ler errado, e o comentário no código tem de dizer isso:** explorar antes
de a relação estar determinada **não é defeito** — é como se resolve um problema de restrições. O
que discrimina é o que veio depois: exploração **revisada** é flexibilidade; exploração **mantida**
com contradição já instalada é o I3.

⚠️ **I5 registra a ORDEM, não julga.** Nada de "começou pela pista errada": não existe pista certa
para começar.

## Onde entram

No `metadata` da sessão, num campo `indicadores`, ao lado do que já existe. **Não substitua nada**:
o registro bruto por problema continua inteiro, porque é dele que uma calibração futura sai.

## Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 79 arquivos / 1041 testes — não pode cair
```
**NÃO rodar `npm run build`.** Sem `node_modules` no lab você não roda nada: **declare**.

Testes obrigatórios:
- cada um dos cinco calcula certo num caso montado à mão, com números conferíveis na leitura;
- **denominador zero devolve `null`** em todos, e **nunca `NaN`** — teste um a um;
- sessão **sem nenhum problema concluído** produz indicadores válidos, sem explodir;
- I2 distingue **revisada** de **mantida** com o mesmo total de atribuições;
- I3 **não** conta a atribuição feita sobre estado consistente;
- I4 devolve `null` quando o nível **não oferece** verificação (cota zero);
- **a varredura dos termos proibidos** passa em `indicadores.ts` — e escreva-a de forma que reprove
  se alguém acrescentar um deles depois;
- ⛔ **prova de que NADA foi ligado ao motor:** `lib/adaptive.ts` não muda, e `indicadores.ts` não é
  importado por ele nem por `banco.ts`/`selecionarProblema`. Prove por varredura.

## Relatório

Como tratou cada denominador zero; o que I5 registra exatamente sobre ordem; e a confirmação, item
a item, de que nenhum dos cinco alimenta decisão nenhuma nesta fatia.
