# Grade Dedutiva — decisões fechadas da mecânica

Data: 2026-09-03
Origem: parecer do gestor de conteúdo dela sobre a proposta de interface
(artifact `50936232-9e91-430d-ad02-4ba0543df935`), com a concordância dela.
Complementa `ESPEC-GRADE-DEDUTIVA-KAMYLLA-20260902.md`, que continua sendo a fonte da verdade —
onde este documento diverge da espec, **este vence**, porque é posterior e foi acordado.

---

## 1. UMA marcação, não duas — FECHADO

A célula tem um estado só: o valor escolhido. Sai o "Tenho certeza".

Razão dele: *"Em um problema 5×5 ou 5×6, isso vira atrito demais... depois de algumas tarefas,
'confirmar' provavelmente vira comportamento mecânico. Você ganha um dado metacognitivo
teoricamente bonito, mas provavelmente ruidoso."*

## 2. O que o clique SIGNIFICA — e é aqui que a espec muda

O clique **não** é `✓` certeza nem `?` hipótese. É:

> **"Neste momento estou colocando Ana aqui."**

Palavras dele: *"Essa definição resolve a ambiguidade... Se depois novas pistas mostrarem que não
funciona, ele troca. Isso combina perfeitamente com resolução de problemas."*

Consequência: os estados `hipotese` e `confirmado` do modelo (`lib/grade/tipos.ts`) deixam de ser
declarados pelo paciente. `admiteSolucao` e `pistasEmConflito` passam a tratar toda atribuição como
restrição. O estado `hipotese` **permanece no tipo** — o solver precisa saber avaliar marcação que
não restringe, e isso pode voltar a ser usado; o que muda é que a interface não o produz.

## 3. ⚠️ CORREÇÃO CONCEITUAL — não chamar de "confirmação prematura"

**A correção mais importante do parecer**, e ela reverte uma proposta minha.

Com uma marcação só, a interface **não distingue intenção**: não há como saber se o paciente pensou
*"tenho certeza que é Ana"* ou *"vou pôr Ana aqui para testar"*. Chamar isso de "confirmação
prematura" é inferir estado mental a partir de comportamento — e batizar de impulsividade o que
pode ser exploração deliberada.

**O registro passa a ser descritivo, nunca interpretativo:**

```
Atribuições realizadas antes da determinação lógica: 8
   mantidas até a solução:  5
   posteriormente revisadas: 3
```

Palavras dele: *"Isso é muito mais rigoroso do que chamar as 8 de 'impulsividade' ou 'confirmação
prematura'."*

Isto **substitui** a seção 34 da espec dela e alinha com a 41, que já proibia escrever "controle
inibitório prejudicado". A regra geral: **o sistema descreve o que houve; a interpretação clínica é
da profissional.**

## 4. Eventos de pista — registrar tudo

O risco manual das pistas (decisão dela em 02/set) vira instrumentação de primeira classe:

- `clue_opened` · `clue_crossed` · `clue_uncrossed`, cada um com timestamp.

O que isso permite reconstruir, no exemplo dele: *lê a pista 7 → risca a 7 → faz três atribuições →
gera uma contradição → volta à pista 7 → desmarca o risco → modifica a solução.*

> *"Esse é um comportamento muito mais interessante para monitoramento e flexibilidade do que
> simplesmente contar quantas respostas ele errou."*

Dados de estratégia derivados: quais pistas trabalhou primeiro e em que ordem; se volta a pistas
que já dera por resolvidas; se deixa muitas sem trabalhar; se risca cedo demais e precisa voltar.

## 5. O vermelho da duplicidade — DISCRETO

A fronteira do feedback foi aprovada como está:

- **duplicidade do mesmo valor** → o sistema sinaliza (é regra operacional explícita, não dedução);
- **contradição com as pistas** → o sistema fica calado (é o que se treina).

⚠️ Mas o **tratamento visual muda**: *"Eu sinalizaria, mas de forma discreta. Não faria borda
vermelha forte + mensagem 'ERRO!'. Apenas as duas células com uma borda/realce suave e talvez, se
tocar: 'Este item já está sendo usado em outra posição.' Porque o objetivo continua sendo manter a
tarefa silenciosa."*

## 6. "Verificar raciocínio" — disponibilidade por progressão

Risco identificado: *"pode facilmente virar: marco algumas coisas → verificar, marco outras →
verificar... Nesse caso o paciente terceiriza justamente o monitoramento."*

Não se retira. **Varia com o nível**, e isso é arquitetura de dificuldade, não punição:

| nível | verificação |
|---|---|
| iniciais | disponível normalmente |
| intermediários | disponível, uso registrado, feedback bem genérico |
| avançados | limitada, ou ausente em alguns problemas |

*"Não precisa falar ao paciente 'você só tem uma ajuda'."*

## 7. Avaliação cognitiva do formato novo (parecer dele)

Raciocínio lógico-dedutivo **forte** · resolução de problemas **forte** · planejamento **forte** ·
integração/memória operacional **forte** · monitoramento de erro **forte, se o feedback continuar
silencioso** · flexibilidade **moderada a forte, dependendo da variação estrutural dos problemas** ·
controle inibitório **demanda presente, com cautela na interpretação**.

> *"Retirar ×/?/✓ e deixar uma única atribuição provavelmente deixa o exercício mais sofisticado
> cognitivamente e mais simples operacionalmente, que é exatamente o equilíbrio que eu procuraria."*

## 8. O próximo ponto crítico, apontado por ele

> *"O próximo ponto que eu examinaria com bastante cuidado é o motor adaptativo: exatamente quais
> dados deste novo formato vão decidir qual problema vem em seguida, porque a mudança para uma
> marcação altera um pouco os indicadores que tínhamos planejado."*

⚠️ **Isto precisa ser resolvido ANTES da fase 6.** A espec (seções 46–60) desenhou a adaptação
contando com a distinção hipótese × confirmação. Sem ela, os gatilhos mudam: o que sobra são as
atribuições antes de determinação lógica (mantidas × revisadas), os tipos de erro lógico, a
profundidade das conclusões, os eventos de pista e o uso da verificação. **Rever a seção 48 (o que
conta como padrão) com esses indicadores, e submeter a ela antes de implementar.**
