# Jogo das Torres — reconfiguração completa

> **Documento da Kamylla**, recebido em 31/ago/2026, transcrito na íntegra e sem edição.
> É a fonte da verdade do épico. Qualquer implementação se justifica citando a seção daqui.
> Análise técnica, riscos e fatiamento ficam em `PLANO-TECNICO-TORRES-20260831.md` (documento
> meu, separado de propósito: a palavra dela não se mistura com a minha).

## 1. Objetivo cognitivo do exercício

Exercício inspirado na Torre de Hanói, com foco principal em: planejamento; resolução de
problemas; flexibilidade cognitiva; monitoramento da própria estratégia; capacidade de corrigir
uma estratégia ineficiente; antecipação de consequências; controle da impulsividade durante a
resolução; manutenção da meta ao longo de uma sequência de ações.

O objetivo NÃO deve ser fazer o paciente simplesmente decorar a sequência da Torre de Hanói ou
atingir obsessivamente o número mínimo de movimentos.

Núcleo: **analisar → planejar → executar → monitorar → perceber inadequações → reorganizar a
estratégia → alcançar a solução.**

## 2. Princípio central da nova versão

A dificuldade NÃO deve aumentar somente pela quantidade de discos. Se a progressão for apenas
3 → 4 → 5 → 6 discos, o paciente aprende a lógica e repete estratégias conhecidas; continua
treinando planejamento, mas diminui progressivamente a exigência de flexibilidade.

Progressão em DUAS dimensões:
- **Dimensão A — complexidade:** aumentar a quantidade de discos.
- **Dimensão B — novidade do problema:** modificar configuração inicial, haste de destino,
  distribuição dos discos, problema apresentado, necessidade de reorganização estratégica.

Assim, mesmo conhecendo a lógica, novos problemas exigem voltar a analisar a situação.

## 3. O que o paciente deve ver durante a execução

NÃO mostrar: número mínimo de movimentos; percentual de eficiência; quantidade "ideal";
mensagem de que ultrapassou o mínimo; indicação de que a estratégia está errada; comparação com
desempenho ideal. Também sugiro NÃO mostrar permanentemente o contador de movimentos.

O paciente deve estar concentrado no problema, e não em um placar.

Tela durante a tarefa: **Sua vez**, as torres, botão **REINICIAR** e opcionalmente **INSTRUÇÕES**.

Não colocar mensagens como "Você ainda consegue fazer em 15 movimentos", "Você ultrapassou o
mínimo", "Tente usar menos movimentos", "Você está fazendo movimentos demais".
**O sistema não deve perceber o erro pelo paciente.**

## 4. Botão Reiniciar

Manter. Permite ao paciente perceber: "minha estratégia não está funcionando, preciso construir
outra" — monitoramento e flexibilidade.

Ao clicar em REINICIAR, **NÃO apagar os dados daquela tentativa**. Registrar internamente: que
houve reinício; em qual momento ocorreu; quantidade de movimentos antes do reinício; tempo
transcorrido antes do reinício. Depois, a torre volta à configuração inicial daquele problema.

Sem punição nem mensagem negativa. Pode aparecer apenas **"Vamos tentar novamente."** ou nada.

## 5. Flexibilidade não é somente reiniciar

O paciente também precisa poder corrigir a estratégia SEM reiniciar: desfazer alguns movimentos,
reorganizar os discos, construir outro caminho a partir do estado atual. Duas formas válidas:
**Estratégia A** — corrigir o caminho atual. **Estratégia B** — reiniciar.

## 6. O que a primeira tentativa treina

A mais espontânea: análise do problema, planejamento inicial, antecipação, organização
sequencial, execução, monitoramento, resolução de problemas. Por isso, antes da primeira
tentativa, NÃO mostrar o mínimo teórico.

## 7. Tela de conclusão

**Muito bem!** · **Você resolveu o desafio em X movimentos.** · **O menor caminho possível era Y
movimentos.** · **Quer tentar encontrar um caminho mais eficiente?** → [TENTAR NOVAMENTE] [CONTINUAR]

## 8. Por que mostrar o mínimo somente depois

Primeira tentativa: "como eu resolvo este problema?". Segunda: "como reorganizar minha estratégia
para encontrar uma solução melhor?" — replanejamento, comparação de estratégias, aprendizagem a
partir da experiência, flexibilidade, eficiência estratégica.

## 9. Não obrigar o paciente a atingir o mínimo

O mínimo é referência matemática e métrica interna, não critério rígido de sucesso. Mínimo 15 e
paciente resolve em 17 NÃO é fracasso: ele compreendeu o problema, construiu estratégia, manteve
a meta e resolveu. A diferença foi de eficiência.

## 10. Índice de eficiência

**Eficiência = movimentos realizados ÷ mínimo teórico.** 15/15 = 1,00 · 18/15 = 1,20 ·
21/15 = 1,40 · 30/15 = 2,00.

## 11. Faixas iniciais de eficiência

Até **1,20** muito boa · **1,21 a 1,40** adequada · acima de **1,40** baixa eficiência
estratégica. IMPORTANTE: parâmetros do programa, **NÃO** norma neuropsicológica; ajustáveis
depois com dados reais.

## 12. Progressão não deve depender apenas do mínimo

NÃO usar "só passa de nível se fizer exatamente o mínimo" — rígido demais e aproxima a tarefa de
otimização matemática. Considerar: resolução correta; eficiência; quantidade de reinícios; tempo;
estabilidade do desempenho; desempenho em diferentes configurações.

## 13. Sugestão de regra de progressão

Observar os últimos desafios do nível.
**Subir:** resolução correta; boa ou adequada eficiência; poucos reinícios; consistência em
configurações diferentes.
**Manter:** resolve, mas muitos movimentos; muitos reinícios; grande oscilação.
**Reduzir:** abandono repetido; incapacidade de concluir; excesso de reinícios; tempo muito
elevado; dificuldade persistente.

## 14. Não usar somente quantidade de discos como nível

Cada nível com diferentes tipos de problema:
1. 3 discos, clássica, esquerda→direita (aprender a lógica)
2. 3 discos, destinos diferentes (impede automatização espacial)
3. 3 discos, configurações iniciais diferentes
4. 4 discos, clássica
5. 4 discos, destino variável
6. 4 discos, configuração inicial variável
7. 4 discos, problemas intermediários mais complexos
8. 5 discos, clássica
9. 5 discos, destino variável
10. 5 discos, configuração inicial variável — e assim sucessivamente.

## 15–19. Variações de problema

- **Tipo A — torre clássica:** todos numa haste. Planejamento, sequenciamento, antecipação.
- **Tipo B — destino variável:** mesma configuração inicial, haste-alvo diferente. Reduz automatização.
- **Tipo C — configuração inicial variável:** discos já distribuídos (ex.: esquerda 4 e 2, centro
  3 e 1; objetivo: todos à direita). Aumenta análise e planejamento a partir do estado atual.
- **Tipo D — configuração-alvo diferente:** nem sempre torre completa numa haste. "Organize os
  discos para ficar igual ao modelo", com a configuração final em miniatura. Problema de
  transformação de estados.
- **Tipo E — novo problema após aprendizagem:** depois de algumas clássicas, uma configuração
  nova. Força "a estratégia que eu usava funciona aqui? preciso de outra?".

## 20. O que não mudar

Regras básicas permanecem: mover um disco por vez; nunca disco maior sobre menor. Não mudar
regras artificialmente só para dizer que se trabalha flexibilidade — ela vem da necessidade de
adaptar a estratégia a diferentes problemas.

## 21. Instrução inicial

> **Jogo das Torres** — Seu objetivo é organizar os discos conforme o modelo indicado. Você pode
> mover apenas um disco por vez. Um disco maior nunca pode ser colocado sobre um disco menor.
> Observe o problema antes de começar e pense na melhor forma de chegar ao objetivo. Se perceber
> que sua estratégia não está funcionando, você pode reorganizar seus movimentos ou reiniciar o
> desafio.

## 22. Evitar instruções que entreguem a estratégia

Não escrever: "planeje três movimentos antes"; "primeiro mova o menor disco"; "use a haste
central como apoio"; "evite movimentar o disco maior".

## 23. Feedback durante a execução

Mínimo. Movimento válido: só executar, sem mensagem. Movimento inválido: **"Esse movimento não é
permitido."** — sem explicar qual movimento deveria fazer.

## 24–27. Feedback após a resolução

Primeira conclusão: **"Muito bem! Você resolveu o desafio em 19 movimentos."** · **"O menor
caminho possível era 15 movimentos."** · **"Quer tentar encontrar um caminho mais eficiente?"**
→ [TENTAR NOVAMENTE] [CONTINUAR]

Segunda tentativa: sem contador mínimo durante a execução; pode aparecer só **"Tente encontrar
uma estratégia mais eficiente."**

Se melhorou: **"Você encontrou um caminho mais eficiente."** + 1ª: 19 · 2ª: 16. Sem "Excelente!",
"Perfeito!", "Você é muito bom!" — a informação de melhora já é o feedback.

Se piorou: sem mensagem negativa. Só 1ª: 19 · 2ª: 23 · **Desafio concluído.**

## 28. Dados que devem ser registrados

Cada tentativa gera dados, **mesmo que não seja concluída**: paciente; exercício; data; horário;
nível; número de discos; tipo de problema; configuração inicial; configuração-alvo; mínimo
teórico; número de movimentos; movimentos válidos; tentativas de movimentos inválidos; tempo
total; latência até o primeiro movimento; quantidade de reinícios; movimento em que cada reinício
aconteceu; tempo de cada reinício; se concluiu; se abandonou; eficiência; número da tentativa
daquele problema; desempenho da tentativa anterior, se houver.

## 29. Abandono precisa ser registrado

Hoje, se a sessão só é gravada ao terminar, "exercício nunca realizado" e "exercício iniciado e
abandonado" ficam iguais. Ao iniciar o desafio, já criar registro. Status: **INICIADO**,
**CONCLUÍDO**, **REINICIADO**, **ABANDONADO**, **INTERROMPIDO**. Assim se sabe se um nível está
fazendo pacientes desistirem.

## 30–31. Reinícios sem apagar a tentativa

Ex.: 9 movimentos → reinicia; 14 → reinicia; resolve em 18. Registrar: reinícios 2; primeiro no
movimento 9; segundo no 14; movimentos da tentativa final 18; movimentos totais 41; tempo total.
Guardar **movimentos da solução final** e **movimentos totais no problema** — separa eficiência
da solução final de esforço total.

## 32–34. Dados de flexibilidade

Não criar "escore de flexibilidade" simplista agora. Registrar componentes comportamentais:
número de reinícios; momento do reinício; movimentos após provável impasse; correções sem
reiniciar; melhoria entre 1ª e 2ª tentativa; desempenho diante de configuração nova; desempenho
quando muda o destino; abandono.

Registrar padrões de reversão (A→B, B→C, C→B) sem classificar automaticamente como "boa
flexibilidade" e sem mostrar ao paciente.

**Latência até o primeiro movimento:** tempo entre aparecer o problema e o primeiro movimento.
Não significa automaticamente melhor planejamento, mas é variável interessante integrada ao resto.

## 35–36. Tempo e movimentos inválidos

Registrar tempo total, mas **sem cronômetro visível** — cronômetro introduz pressão e muda a
natureza do exercício. Movimento inválido: não permitir, registrar internamente, e mostrar apenas
"Esse movimento não é permitido."

## 37–38. Complexidade dos discos

3 → 7 movimentos · 4 → 15 · 5 → 31 · 6 → 63 · 7 → 127.
**NÃO** colocar 7 discos na progressão rotineira: 127 movimentos torna a tarefa longa demais.
6 discos com cautela. Teto inicial pode ficar em 5 ou 6, porque a complexidade cresce pelas
configurações. **Mais discos ≠ melhor treino cognitivo.** Prefiro 5 discos + configuração nova a
7 discos + sequência repetitiva conhecida.

## 39. Estrutura sugerida de fases

1. **Aprender a regra** — 3 discos, clássica, pouca variação.
2. **Planejamento** — 4 discos, clássica, destinos diferentes.
3. **Resolução de problemas** — 4 discos, configurações e objetivos diferentes.
4. **Flexibilidade** — alternar clássica, parcial, destino diferente, modelo-alvo diferente; o
   paciente não sabe qual virá.
5. **Alta complexidade** — 5 discos, estruturas misturadas.
6. **Avançado** — 5 a 6 discos; dificuldade pela estrutura, não pelo número de discos.

## 40–41. Sequência de sessão e previsibilidade

A sessão pode variar a natureza cognitiva do problema (4 clássica → 4 destino diferente → 4
configuração intermediária → 5 clássica → 4 configuração nova), em vez de 4→4→4→5→5.
Evitar padrões previsíveis: nem sempre esquerda→direita, nem sempre a mesma configuração, nem
sempre a mesma sequência de dificuldade.

## 42–43. Banco de problemas

Banco de configurações previamente validadas, cada uma com: ID; número de discos; configuração
inicial; configuração-alvo; mínimo de movimentos conhecido; nível estimado; tipo de problema;
categoria cognitiva predominante (**P** planejamento, **RP** resolução de problemas,
**F** flexibilidade, **M** mista).

NÃO gerar configurações totalmente aleatórias sem validação. Garantir: configuração respeita as
regras; existe solução; o mínimo é calculável; a dificuldade é coerente. Ideal: pré-calcular as
configurações e o caminho mínimo.

## 44–47. Interface

Visual limpo: três hastes, discos, instrução curta, botão reiniciar. Evitar muitos números,
cronômetro, barras, pontuação, estrelas, medalhas, mensagens excessivas. **O raciocínio deve ser
o protagonista.**

Tela inicial de cada problema: "Organize os discos conforme o objetivo", a configuração, o
**Objetivo** em miniatura, e **COMEÇAR**. Depois de começar, retirar o modelo inicial se não for
necessário; manter o objetivo discreto se for configuração-alvo específica (ex.: "Objetivo: haste
direita").

**Não transformar em jogo de memória:** se a configuração-alvo for complexa, manter o modelo
visível. O foco é planejamento e resolução de problemas, não memória visual.

## 48–49. Critério de sucesso e ordem de interpretação

1. **Resolveu o problema?** 2. **Com que eficiência?** 3. **Com que padrão de estratégia?**
Não inverter. Interpretação: conclusão → eficiência → tempo → autorregulação (reinícios,
correções, movimentos inválidos) → adaptação (como se saiu quando o problema mudou).

## 50–53. Flexibilidade, replanejamento e limites

Comparar desempenho entre problema conhecido e problema estruturalmente diferente; queda grande
pode indicar dificuldade de transferir a estratégia — e para TREINO é exatamente o que se quer
estimular: "não repetir mecanicamente; analisar novamente".

Segunda tentativa: registrar melhora absoluta e percentual (não necessariamente mostrar o
percentual). **Máximo de uma segunda tentativa voluntária** do mesmo problema — mais que isso
gera aprendizagem específica daquela configuração e perde-se flexibilidade.

Se não conseguir resolver: não deixar indefinidamente. Limites internos de segurança (tempo
excessivo, quantidade extrema de movimentos, muitos reinícios) e então oferecer **"Quer continuar
tentando ou passar para outro desafio?"**. Evitar "Você não conseguiu".

## 54. Ajuda

Começar **SEM** botão de dica. Dica sobre o movimento correto interfere na resolução de
problemas. Se um dia existir, deve ser estratégica e não entregar a resposta.

## 55–57. Relatório do profissional

Por sessão: desafios iniciados; concluídos; abandonados; reinícios; tempo médio por problema;
eficiência média; movimentos inválidos; segundas tentativas; melhora média na segunda tentativa.

Detalhe por desafio: nº de discos, tipo, mínimo, 1ª tentativa (movimentos, eficiência, tempo,
reinícios, movimentos inválidos, concluído), 2ª tentativa (movimentos, eficiência, melhora).

**NÃO** apresentar conclusões automáticas ("paciente possui baixa flexibilidade", "déficit de
planejamento", "é impulsivo"). O sistema apresenta dados; a interpretação clínica é do
profissional.

## 58. Resumo da lógica cognitiva

planejamento → execução → monitoramento → detecção de problema → flexibilidade → replanejamento
→ resolução → otimização.

## 59. O que é essencial alterar agora (ORDEM DE PRIORIDADE DELA)

1. Retirar o número mínimo durante a execução.
2. Permitir Reiniciar sem apagar os dados anteriores.
3. Registrar tentativas abandonadas.
4. Não obrigar mínimo exato para progressão.
5. Criar configurações diferentes, em vez de subir apenas o número de discos.
6. Mostrar o mínimo somente depois da conclusão.
7. Oferecer uma segunda tentativa opcional para replanejamento.
8. Registrar desempenho completo no banco.

## 60. Conceito final

O Jogo das Torres não deve ensinar "faça 15 movimentos". Deve treinar: **"existe um problema;
analise a situação, construa um plano, execute, observe o resultado e, quando necessário, mude
sua estratégia até encontrar uma solução."**
