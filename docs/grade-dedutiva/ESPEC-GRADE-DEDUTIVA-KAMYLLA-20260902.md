# Grade Dedutiva — reformulação completa

> **Documento da Kamylla**, recebido em 02/set/2026, 103 seções. Fonte da verdade do épico.
> Transcrito sem edição de conteúdo; só a formatação foi compactada.
> Auditoria técnica em `AUDITORIA-GRADE-DEDUTIVA-2026-09-02.md`; plano em documento separado.

## Regras de trabalho que ela impôs (1–10 do preâmbulo)

Não acrescentar pistas ao exercício atual: **mudar a arquitetura cognitiva**. Antes de alterar
qualquer coisa: ler toda a implementação; identificar arquivos, componentes, estados, banco de
problemas, lógica de dificuldade, progressão, persistência, relatórios, eventos, Supabase e
tutorial; mostrar o que se reaproveita. Não mexer em outros exercícios. **Não fazer migration sem
mostrar antes.** Se precisar de Supabase: separar a etapa, backup antes, procedimento de segurança
já usado no projeto. Implementar em etapas pequenas, cada uma terminando em teste + evidência +
commit próprio. **Não simplificar silenciosamente nenhuma regra.** Se algo for inviável ou
desproporcional, explicar antes de substituir.

## 1. Objetivo cognitivo

Treino de: raciocínio lógico-dedutivo, resolução de problemas, planejamento, memória operacional,
controle inibitório, monitoramento de erros, flexibilidade cognitiva.

Memória operacional trabalhada por **manter relações simultaneamente, integrar informações,
acompanhar hipóteses, sustentar consequências lógicas, combinar pistas** — e **não** por esconder
pistas. Não é memória episódica nem decorar frases.

## 2. O problema do exercício atual

Está cognitivamente simples demais: associação direta, eliminação simples, pouca integração.
Isso pode continuar **só no tutorial**, que serve para ensinar a interface e **não é exercício
real de treino**.

## 3–5. Conceito novo

Problemas na lógica dos *logic grid puzzles*, com conteúdo e identidade próprios, sem copiar de
terceiros. Cada desafio: N posições, múltiplas categorias, N elementos por categoria, várias
pistas, **exatamente uma solução**.

Núcleo do raciocínio: analisar pistas → identificar possibilidades → eliminar o impossível →
integrar relações → formular hipóteses → testar consequências → identificar contradições →
revisar → replanejar → deduzir.

**A maior parte das conclusões NÃO pode sair de uma única pista.** Conclusão direta pode existir
ocasionalmente; a maioria deve exigir integração.

## 6. Tutorial

3×3, poucas pistas, ensina marcar/excluir/hipótese/confirmar. **Não entra na análise, não entra na
progressão clínica, não influencia o motor adaptativo, não gera interpretação de desempenho.**

## 7–8. Quatro estados, e por que existe "hipótese"

`vazio` · `×` impossível · `?` hipótese · `✓` confirmado.

`?` = "considero essa possibilidade". `✓` = "concluí que é verdadeiro". **Hipótese falsa não é a
mesma coisa que conclusão falsa** e precisa ser registrada em separado.

## 9. Interação

Simples em computador, tablet e celular. Pode ser clique sucessivo (vazio → × → ? → ✓ → vazio) ou
menu contextual. **Testar qual fica mais natural no mobile antes de fechar.** Não complicar a
interface só porque há quatro estados.

## 10–13. Interface

Visual adulto, limpo, elegante, pouco gamificado, cognitivamente organizado. **Sem** estrelas,
moedas, medalhas, personagens infantis, excesso de cores, aparência escolar ou de planilha crua.

Estrutura: DESAFIO X · título/contexto · PISTAS numeradas · área de raciocínio/grade · legenda
(× impossível, ? hipótese, ✓ confirmado) · [VERIFICAR RACIOCÍNIO] · [CONCLUIR].

**Desktop:** pistas e grade lado a lado quando houver largura. Não deixar conteúdo perdido num
card minúsculo numa tela enorme.

**Mobile:** reorganizar verticalmente; pistas recolhíveis se necessário; grade legível; cabeçalhos
identificáveis; sem obrigar zoom; sem células minúsculas; área de toque adequada; scroll
horizontal local da grade só se realmente necessário.

**As pistas permanecem visíveis o tempo todo.** Recolher no celular é questão de espaço, nunca
obrigação de memorizar.

## 14–17. Erro, verificação e conclusão

**Não corrigir cada erro imediatamente.** Nada de "ERRADO", piscar vermelho, revelar a célula ou
corrigir pelo paciente. *"Se o sistema denuncia imediatamente toda inconsistência, o monitoramento
de erro passa a ser feito pelo software."* O paciente precisa da oportunidade de continuar,
perceber a contradição, revisar e autocorrigir.

**VERIFICAR RACIOCÍNIO** não entrega a solução. Níveis iniciais: "Existe uma incompatibilidade no
seu raciocínio. Revise suas conclusões." Eventualmente pode indicar a família ("relacionada às
posições"), **nunca a célula**. Níveis avançados: reduzir a ajuda, e eventualmente retirá-la.

Registrar de cada verificação: número, momento, tempo, estado lógico, se havia contradição, se
corrigiu depois, quantas ações levou para corrigir.

**CONCLUIR:** correto → "Desafio concluído." + [PRÓXIMO]. Incorreto → "Sua organização ainda
contém incompatibilidades. Revise antes de concluir." **Nunca revelar a solução.**

## 18–19. Tipos de pista

Cada pista existe como (A) texto para o paciente e (B) regra computável.

T1 associação direta · T2 exclusão · T3 posição absoluta · T4 ordem relativa · T5 adjacência ·
T6 direção + adjacência · T7 entre · T8 associação cruzada · T9 condicional · T10 alternativa
exclusiva · T11 relação composta. A arquitetura deve permitir novos operadores depois.

Metadados por pista: `{ id, text, type, operands, constraint, skillTags, difficulty,
restrictivePower }`.

## 20–22. Profundidade inferencial

Dificuldade não é quantidade de pistas. Classificar a profundidade necessária: **1** (uma relação
basta), **2** (integra duas), **3** (três), **4+** (encadeada).

Comparar desempenho por profundidade é a forma mais interessante de observar a demanda de
integração. Relatar como *"queda de precisão nas situações que exigiam integração de maior número
de relações"* — **nunca** "déficit de memória operacional".

## 23–25. Solver

Motor central de restrições (CSP) capaz de: validar o problema; encontrar soluções; **contar**
soluções; provar que existe exatamente uma; testar se uma configuração parcial do paciente ainda
admite solução; identificar quando uma marcação torna o problema impossível; identificar quais
pistas estão na contradição.

**Solução única é obrigatória:** `solutions.length === 1`. Zero → inconsistente; dois ou mais →
ambíguo. Não liberar.

Puzzle: `{ id, title, context, level, positions, categories, clues, solution, metadata }`.
Metadata: `{ complexity, inferenceDepthDistribution, skillWeights, dominantOperations,
clueTypeDistribution, expectedDifficulty, validatedUniqueSolution }`.

## 26–33. Identificar ONDE o paciente errou

Não apenas "errou" — a **operação lógica** envolvida, sempre que determinável objetivamente:

- **A** `direct_constraint_violation` — confirma o que uma pista nega.
- **B** `direction_reversal` — inverte esquerda/direita, antes/depois. *Não chamar de problema de
  atenção nem de função clínica.*
- **C** `adjacency_violation`.
- **D** posição relativa — registrar separadamente antes, depois, esquerda, direita, exatamente à
  esquerda, exatamente à direita, entre.
- **E** `one_to_one_violation` — dois valores na mesma posição.
- **F** `multi_constraint_integration_error` — a conclusão não contradiz nenhuma pista isolada,
  mas é impossível ao combinar (ex.) pistas 2 + 5 + 9. Registrar **quantas relações** eram
  necessárias para demonstrar. *"Essa é uma das partes mais importantes."*

**Conjunto mínimo de contradição:** se viável, identificar o menor conjunto de pistas que torna a
conclusão impossível (MUS ou equivalente), gravando `conflictingClues` e `inferenceDepth`. Se o
MUS completo for desproporcional na primeira versão: implementar detecção segura de inconsistência
+ conjunto de pistas relevantes, e deixar a minimização exata para a segunda etapa. **Não inventar
relações.**

## 34–35. Confirmação prematura e hipótese

`premature_confirmation` = marcar `✓` numa relação ainda não determinada (naquele estado ainda há
múltiplas soluções em que ela varia). **Não significa automaticamente falha de inibição** — é
comportamento observável.

Hipótese `?` depois rejeitada **não é erro equivalente a confirmação falsa**. Registrar
`hypothesis_tested` / `hypothesis_rejected`. Faz parte da resolução de problemas.

## 36–39. Monitoramento e autocorreção

Contradição criada → registrar **nos bastidores**, sem alertar. Guardar
`contradictionCreatedAt`, `contradictionResolvedAt`, `actionsUntilCorrection` e o tempo até a
autocorreção.

Diferenciar: (A) percebeu e corrigiu sozinho; (B) pediu VERIFICAR e então corrigiu; (C) tentou
concluir e só aí soube.

`repeated_invalid_hypothesis` — voltar à mesma hipótese incompatível. Interessante para observar
perseveração; **não transformar em diagnóstico de baixa flexibilidade**.

## 40–43. Indicadores, não escores

**Sem** número arbitrário tipo "Flexibilidade = 72%". Registrar indicadores comportamentais:
revisão e abandono de hipótese, reintrodução, mudança de linha de raciocínio, mudança entre
categorias, adaptação quando a estrutura muda, desempenho após treino focalizado, transferência.

Controle inibitório: **não escrever "prejudicado"**. Registrar confirmações prematuras, proporção
de confirmações revertidas, tempo até as primeiras confirmações, número de confirmações antes de
eliminações, recorrência. Relatar como dado: *"Realizou 8 confirmações definitivas posteriormente
revistas."*

Planejamento: latência até a primeira ação, primeira pista/categoria explorada, sequência inicial,
marcações dispersas, confirmações precoces, uso de pistas de maior poder restritivo. **Não assumir
que demorar mais é planejar melhor.**

Poder restritivo: quantas soluções cada pista elimina no estado inicial (muito/moderadamente/pouco
informativa). Útil para ver por onde ele começa. **Não mostrar ao paciente.**

## 44–45. Registro de cada ação

Reconstruir o caminho do raciocínio. Por ação: `sessionId, puzzleId, actionIndex, timestamp,
elapsedFromStart, elapsedFromPreviousAction, category, value, position, previousState, newState,
logicalStatusAtTime, contradictionCreated, contradictionResolved, conflictingClues,
inferenceDepth, wasHypothesis, wasConfirmation, laterReverted, selfCorrected, verificationUsed`.
*"Os nomes podem mudar. A informação não."*

Separar **tags lógicas** (direct_association, exclusion, absolute_position, relative_order,
adjacency, directed_adjacency, between, cross_category, conditional, exclusive_or,
multi_constraint_integration) de **tags comportamentais** (premature_confirmation,
contradiction_creation, self_correction, contradiction_persistence, repeated_invalid_hypothesis,
verification_request, hypothesis_revision, strategy_shift).

## 46–53. Motor adaptativo — *"esta parte é central"*

A adaptação é **totalmente invisível** ao paciente. Ele nunca lê "você apresentou dificuldade em
ordem relativa" nem "agora vamos treinar sua memória operacional". Para ele: desafio → concluído →
próximo.

**Não adaptar por erro isolado** (pode ser distração, clique errado, acaso). Considerar padrão
quando: (A) 2+ erros do mesmo tipo no mesmo problema; OU (B) desempenho claramente inferior naquele
domínio com pelo menos 3 oportunidades; OU (C) o mesmo padrão em dois problemas consecutivos; OU
(D) reintrodução da mesma hipótese incompatível. **Thresholds são parâmetros do programa, não
normas clínicas.**

**Dificuldade específica × sobrecarga global.** Se vai bem em exclusão/associação/adjacência e erra
repetidamente ordem relativa → padrão específico → focalizar. Se aparecem ao mesmo tempo erros de
vários tipos, tempo elevado, muitas reversões, muitas verificações e dificuldade de concluir →
**não** eleger uma fraqueza: a complexidade global ficou excessiva → **reduzir carga**.

**Reduzir carga não é infantilizar:** 5 posições → 4, 5 categorias → 4, profundidade 4 → 2–3 —
mantendo problema lógico verdadeiro. Nunca voltar para "Bruno = Verde".

Ciclo: problema misto → analisar → (sem padrão: progressão normal | específico: focalizado |
sobrecarga: reduzir carga) → depois de focalizado, **problema misto de transferência** → melhorou:
progredir; não melhorou: mais um focalizado ajustado.

## 54–60. Focalizado, integração, incerteza, monitoramento, flexibilidade, transferência

**Focalizado não é tarefa simples:** continua puzzle completo, com maior proporção de pistas do
tipo-alvo e possivelmente menos carga em outra dimensão (ex.: de 5×5 com 15 pistas para 4×4 com 9,
sendo 5–6 fortemente relacionadas ao alvo).

Integração: menos categorias, mais conclusões exigindo 2 → 3 relações.

Confirmação prematura: problema com várias possibilidades plausíveis e poucas respostas
imediatamente determinadas — ele precisa usar `?` antes de `✓`. **Não dizer que se está "treinando
inibição".**

Monitoramento: manter contradições detectáveis pelo próprio paciente, sem feedback imediato.

Flexibilidade: **não basta trocar o tema.** Cachorros → carros com a mesma estrutura lógica não
adianta. Variar a **arquitetura das relações**: um problema com predominância de ordem espacial,
outro de exclusões e condicionais, outro de integração cruzada.

Transferência: depois do focalizado, apresentar misto em que a operação-alvo reaparece junto de
outras — para saber se melhora só no treino focalizado ou se usa a habilidade no problema complexo.

**Não focalizar indefinidamente:** máximo de 1 ou 2 focalizados consecutivos, depois misto.

## 61–63. Vetor de habilidades e progressão

Por puzzle: `{ exclusion, relativeOrder, adjacency, crossCategory, integrationDepth,
uncertaintyTolerance }` em escala 0–3, mais `{ positions, categories, clues, maxInferenceDepth,
overallComplexity }`.

Progressão: **tutorial** 3×3, 3–5 pistas (fora da análise) · **nível 1** 4 pos × 3 cat, 6–8 pistas,
profundidade 1–2 · **nível 2** 4×4, 8–10, até 2–3 · **nível 3** 4 pos × 5 cat, 10–13, mais
integração e poucas conclusões diretas · **nível 4** 5×5, 13–17, com entre/condicionais/compostas e
integração 3+ · **nível 5** 5 pos × 5–6 cat, 16–22, profundidade 3–4+.

**Dificuldade não é tamanho:** um 4×4 pode ser mais difícil que um 5×5 se tiver mais ambiguidade
inicial, relações mais profundas, maior branching e mais integração.

## 64. Temas adultos

Feira de ciências · viagem · restaurante · cinema · biblioteca · corrida · hotel · congresso ·
museu — cada um com suas categorias.

## 65–68. Banco de problemas

**Nunca gerar aleatório direto para o paciente sem validação.** Banco previamente validado, cada
problema com solução única, dificuldade, tipos de pista, distribuição de profundidade, vetor de
habilidades, contexto, solução e metadata.

Primeira implementação: **12 a 20 problemas muito bem construídos e matematicamente validados** —
*"não quero 100 problemas ruins"* — distribuídos entre níveis, estruturas, operações e temas.

Gerador **apenas para desenvolvimento**: gerar solução → gerar restrições → solver → validar
unicidade → identificar redundantes → remover redundância excessiva → estimar dificuldade →
atribuir metadados → adicionar ao banco. **Nunca confiar em IA generativa em tempo real para
garantir solução lógica.**

Redundância: alguma é aceitável por equilíbrio, mas não 20 pistas com 8 desnecessárias. Se
possível, classificar cada pista em essencial / útil / redundante.

## 69–71. Progresso, feedback e ajuda

Progresso **não** por células preenchidas (incentiva "encher a grade"). Usar "Desafio 2 de 5" ou o
progresso global da sessão. **Nunca "42% resolvido".**

Feedback durante a tarefa: mínimo. Sem número de erros, sem pontuação, sem eficiência, sem elogiar
cada clique. *"O raciocínio deve ser protagonista."*

Ajuda: primeira versão **sem botão de dica**. Se existir um dia, deve ser **metacognitiva**
("procure uma pista que elimine várias possibilidades"), nunca "Ana está na posição 3". Registrar
toda ajuda usada.

## 72–79. Relatório do profissional

Relatório **de processo**, não só acerto. Problemas realizados/concluídos, tempo médio.

**Precisão por operação** (exclusão, ordem relativa, adjacência, associação cruzada, integração).
**Profundidade inferencial** (1, 2, 3, 4+ relações). **Monitoramento** (contradições produzidas,
autocorrigidas sem ajuda, % de autocorreção espontânea, tempo mediano até autocorreção,
persistência média após contradição, correções após verificação, não corrigidas).
**Estratégia** (hipóteses criadas e rejeitadas, confirmações revertidas, reintroduções,
verificações). **Adaptação** (dificuldade inicial, treino focalizado, desempenho no focalizado,
desempenho no misto posterior).

Texto aceitável: *"Apresentou inicialmente maior frequência de erros nas relações de ordem
relativa. Após um desafio com maior concentração desse tipo de relação, houve melhora no
desempenho. No problema misto subsequente, parte desse ganho foi mantida."*

**Nunca escrever:** "baixa flexibilidade cognitiva", "déficit de memória operacional", "controle
inibitório prejudicado", "paciente impulsivo", "déficit executivo", "indica TDAH", "indica
transtorno". O jogo é TREINO e fornece indicadores comportamentais.

## 80–83. Experiência e exemplos de adaptação

Para o paciente: desafio → resolve → concluído → próximo. Ele não sabe qual habilidade está sendo
enfatizada, que houve adaptação, que o problema foi focalizado, nem qual padrão foi identificado.

Sessão: misto → análise invisível → focalizado se necessário → misto de transferência → novo
ajuste → misto final se houver tempo. Sem número fixo, se a plataforma já controla a duração.

## 85–89. Abandono, métricas e interpretação

Distinguir **nunca iniciado** de **iniciado e abandonado**. Se exigir Supabase: **PARAR**, mostrar
migration, fazer backup, executar separadamente.

Por problema: iniciado, concluído, abandonado, tempo, latência até a primeira ação, total de ações,
exclusões, hipóteses, confirmações, reversões, contradições, autocorreções, verificações,
tentativas de concluir incorretas, desempenho por operação, desempenho por profundidade, sequência
de categorias manipuladas.

**Não superinterpretar o tempo** (rápido ≠ melhor; latência maior pode ser planejamento ou
dificuldade). **Não superinterpretar revisão** (pode ser monitoramento e flexibilidade) — mas
diferenciar hipótese revisada de confirmação precipitada repetidamente revertida.

Mudança estratégica: registrar categorias manipuladas ao longo do tempo, mudança de foco, retornos,
sequência de exploração. **Sem escore automático agora** — guardar o processo.

## 90–93. Design da grade

A grade não pode ficar apertada, minúscula, parecendo Excel, nem com dezenas de selects visíveis —
*"não quero um mar de dropdowns"*. Testar solução mais moderna, por exemplo cada posição como uma
coluna, com as categorias em linhas e as marcações × / ? / ✓. Matriz dedutiva auxiliar pode existir
se necessária.

Avaliar separar (A) área de dedução/possibilidades de (B) solução final — ou manter tudo numa
estrutura só, se for mais simples. **Mostrar propostas antes de fechar o UX.**

**Mostrar proposta desktop e mobile antes de escolher a estrutura definitiva** — *"não quero chegar
ao final e descobrir que a lógica ficou boa mas a grade está impraticável"*.

Fundo discreto (geométrico minimalista, azul-neblina, papel técnico contemporâneo), sem decoração
atravessando a grade.

## 94. Ordem de implementação

**F1 auditoria** (ler, mapear, identificar reaproveitamento — sem alterar) · **F2 modelo lógico**
(estrutura, categorias, restrições, tipos de pista, solver, unicidade, testes unitários) ·
**F3 protótipo de interface** (desktop, mobile, os quatro estados, pistas, conclusão, verificar) —
*mostrar antes de avançar* · **F4 instrumentação** (ações, contradições, autocorreção, reversões,
confirmação prematura, profundidade, tipo de erro) — *se precisar de Supabase, PARAR* ·
**F5 banco inicial** (12–20 validados) · **F6 motor adaptativo** · **F7 relatório**.

## 95–98. Testes obrigatórios

**Solver (1–17):** 0 soluções rejeitado; 2+ rejeitado; única aceita; associação direta; exclusão;
posição absoluta; ordem relativa; esquerda/direita; adjacência; adjacência nas pontas; exatamente à
esquerda/direita; entre; entre com ordem; associação cruzada; condicional; alternativa exclusiva;
exclusividade 1:1.

**Processo (18–27):** hipótese falsa ≠ confirmação falsa; confirmação impossível gera evento;
contradição não aparece automaticamente; autocorreção espontânea registrada; correção após
VERIFICAR diferente de autocorreção; ações após contradição contadas; tempo até correção
registrado; reintrodução registrada; conclusão incorreta não entrega solução; conclusão correta
encerra.

**Adaptativo (28–36):** erro isolado NÃO dispara focalização; padrão repetido pode; dificuldade de
ordem seleciona problema com maior peso em ordem; dificuldade de integração idem; sobrecarga global
NÃO focaliza habilidade isolada; sobrecarga reduz carga geral; após focalizado, transferência;
máximo de dois focalizados consecutivos; sem padrão, progressão normal.

**Interface (37–44):** desktop utilizável; mobile utilizável; pistas legíveis; grade sem zoom;
estados distinguíveis; área de toque adequada; **sem feedback imediato entregando erro**; progresso
não depende de células preenchidas.

## 99–103. Princípios finais

**Da adaptação:** não é "errou → dar algo mais fácil". É "qual foi o padrão?" → específico: treinar
aquela operação; global: reduzir carga; dominou: aumentar complexidade; depois de focalizar: testar
transferência.

**Do exercício:** *"O paciente não deve apenas encontrar respostas. Quero que o sistema consiga
observar COMO ELE CHEGOU À RESPOSTA."*

Arquitetura cognitiva: analisar → planejar → selecionar informações → eliminar possibilidades →
integrar relações → formular hipóteses → testar consequências → monitorar → identificar
contradições → revisar → flexibilizar → replanejar → resolver → transferir.

**Resultado final:** deixar de ser *"leia uma pista e marque a resposta"* e passar a ser *"analise
um sistema de relações, elimine possibilidades, formule hipóteses, integre pistas, monitore
inconsistências e construa uma solução lógica"* — com o sistema capaz de diferenciar erro direto,
inversão de direção, falha de adjacência, dificuldade de integração, confirmação prematura,
persistência após contradição, autocorreção, correção após ajuda, repetição de hipótese
incompatível, melhora após treino focalizado e transferência.
