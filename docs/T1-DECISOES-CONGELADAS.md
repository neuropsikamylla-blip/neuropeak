# T1 — decisões congeladas

> Congeladas por ela em **05/ago/2026**, antes da validação visual do Span Direto. Valem para **todas**
> as conversões seguintes do framework de tutorial. Cada uma tem teste correspondente em
> `lib/tutorial/span-reference.test.ts` — desfazer qualquer uma quebra a suíte, de propósito.

## 1. Paciente técnico não se cria por rotina

**Não criar automaticamente pacientes técnicos nas próximas conversões. Sempre utilizar um paciente
de teste já existente, salvo autorização explícita.**

O script `scripts/diagnostics/paciente-teste-t1.mjs` passa a exigir a flag
`--criar-com-autorizacao`. Sem ela, apenas informa o estado e explica a regra. O padrão virou
`--estado`, que só lê.

> **Autorização não se herda.** A autorização dada em 05/ago/2026 valeu para o paciente `COGZD3DRU`,
> da conversão de referência. Uma conversão futura precisa de autorização própria, pedida na hora.

## 2. Sem emoji no framework do tutorial

**Remover qualquer emoji. Utilizar apenas texto ou ícones discretos da própria interface.**

`TutorialRunner` passou a usar `Check` e `RotateCcw` do `lucide-react` — a mesma biblioteca que o
resto da aplicação já usa — com cor própria por tema. A tela de confirmação ficou só com texto.

O teste varre por faixas Unicode de pictogramas, símbolos, dingbats e emoji suplementar em todos os
arquivos do framework.

## 3. A preparação é extremamente objetiva

**Ela explica apenas: o que acontecerá · como responder · como iniciar.**

**Não pertencem à preparação:** estratégias cognitivas, dicas de memorização, orientações
terapêuticas.

Aplicado ao Span: saiu *"evite distrações"* (orientação terapêutica). Permaneceu *"use fones ou
aumente o volume antes de começar"*, que é condição material para uma tarefa auditiva existir — sem
áudio audível não há exercício, e isso é diferente de orientar conduta.

O `ExerciseWrapper` já suprime os blocos "Para que serve no dia a dia" e "Estratégias" quando o
exercício tem tutorial.

## 4. A tentativa guiada deriva da mecânica, nunca de um número fixo

**Ela deve utilizar a menor unidade válida da mecânica clínica de cada exercício. No Span Direto
isso corresponde hoje a 2 dígitos, mas o framework deve permanecer genérico.**

O contrato `TutorialDefinition` (`lib/tutorial/types.ts`) ganhou o campo obrigatório
`smallestValidUnit`, com a definição:

> a carga em que a tarefa ainda existe como tarefa — um degrau abaixo do qual ela deixaria de ser o
> exercício.

No Span, a definição **pergunta à própria escada clínica**:

```ts
const SMALLEST_VALID_UNIT = digitsForLevel(MIN_LEVEL);   // resolve para 2, sem que 2 esteja escrito
```

`MIN_LEVEL` e `digitsForLevel` passaram a ser exportados de `SpanNumerico.tsx`, e `clampLevel` usa
`MIN_LEVEL` em vez do literal `1`. Se a escada clínica mudar, a tentativa guiada acompanha sozinha.

### Como aplicar isto nas próximas conversões

Ao converter um exercício, **não escolha um número**. Encontre na mecânica dele qual é o menor
degrau válido e exporte-o:

| tipo de mecânica | menor unidade válida |
|---|---|
| sequência (span, Corsi, matriz) | o menor comprimento da escada |
| grade / tabuleiro | a menor grade jogável |
| alvos simultâneos (MOT) | o menor número de alvos que ainda exige rastreio |
| planejamento (Hanói, labirinto) | o menor número de passos que ainda exige plano |
| escolha (Stroop, certo/errado) | o menor conjunto de alternativas que ainda gera conflito |

Se a resposta não for óbvia, ela é uma decisão clínica — **pergunte a ela**, não arbitre.

## O que estas decisões não mudam

Não alteram mecânica clínica, progressão, pontuação ou qualquer métrica. Não convertem exercício
nenhum. O Span Inverso continua **não convertido**.
