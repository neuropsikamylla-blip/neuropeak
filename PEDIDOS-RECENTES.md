# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 01/09/2026 11:51
vou mandar a instruçao clara novamente: Quero RECONFIGURAR o Jogo das Torres com uma progressão clara.

IMPORTANTE:
o jogo deve COMEÇAR como uma Torre de Hanói clássica.
As variações entram depois, de forma progressiva.

O objetivo cognitivo é treinar:
- planejamento;
- resolução de problemas;
- monitoramento da estratégia;
- flexibilidade cognitiva;
- correção de estratégia;
- antecipação de consequências;
- controle da impulsividade.

NÃO quero transformar o jogo em:
- perseguição de número mínimo;
- sequência mecânica de movimentos;
- aumento de dificuldade apenas pelo número de discos.

==================================================
1. PRINCÍPIO GERAL
==================================================

A progressão deve ocorrer em duas dimensões:

A) COMPLEXIDADE
- mais discos;
- estados com mais passos;
- maior profundidade de planejamento.

B) NOVIDADE ESTRUTURAL
- destino diferente;
- configuração inicial diferente;
- configuração-alvo diferente;
- alternância entre tipos de problema.

A ideia é:

APRENDER A REGRA
↓
PLANEJAR
↓
RESOLVER
↓
MONITORAR
↓
REORGANIZAR
↓
FLEXIBILIZAR

==================================================
2. FASE 1 — TORRE DE HANÓI CLÁSSICA
==================================================

O início do treino deve ser exatamente como Torre de Hanói.

Exemplo:

Configuração inicial:
todos os discos empilhados corretamente na haste esquerda.

Objetivo:
todos os discos empilhados corretamente na haste direita.

Regras:
- mover apenas um disco por vez;
- nunca colocar um disco maior sobre um menor.

Começar com poucos discos.

Sugestão:

3 discos
↓
4 discos
↓
5 discos

Não precisa chegar rapidamente em 6.

Essa fase é importante para:
- ensinar a lógica;
- treinar planejamento sequencial;
- consolidar regras;
- permitir que o paciente compreenda o funcionamento antes das variações.

==================================================
3. FASE 2 — TORRE COMPLETA COM DESTINO VARIÁVEL
==================================================

Ainda começa com todos os discos corretamente empilhados em uma única haste.

Mas o destino muda.

Exemplos:

esquerda → direita

esquerda → central

direita → esquerda

central → direita

Aqui ainda é estrutura clássica de Torre de Hanói.

A diferença é que o paciente não pode automatizar sempre:

"começo na esquerda e termino na direita."

Rótulos das hastes devem ser SEMPRE:

ESQUERDA
CENTRAL
DIREITA

NÃO usar:

Origem
Auxiliar
Destino

porque esses papéis mudam entre desafios.

==================================================
4. FASE 3 — CONFIGURAÇÃO INICIAL VARIÁVEL + TORRE COMPLETA COMO OBJETIVO
==================================================

Agora os discos podem começar distribuídos entre as hastes.

Exemplo:

Esquerda:
[4,3]

Central:
[1]

Direita:
[2]

Objetivo:

todos os discos corretamente organizados na haste central.

Aqui o paciente precisa analisar o estado atual antes de agir.

Não pode simplesmente repetir o algoritmo clássico desde o início.

Essa fase aumenta:
- resolução de problemas;
- análise de estado;
- planejamento;
- flexibilidade.

==================================================
5. FASE 4 — CONFIGURAÇÃO INICIAL VARIÁVEL + CONFIGURAÇÃO-ALVO VARIÁVEL
==================================================

Agora o objetivo NÃO precisa ser formar uma torre completa em uma única haste.

O problema passa a ser:

ESTADO INICIAL
→
ESTADO-ALVO

Exemplo:

Estado inicial:

Esquerda:
[4,3]

Central:
[1]

Direita:
[2]

Estado-alvo:

Esquerda:
[4]

Central:
[3]

Direita:
[2,1]

desde que ambos os estados sejam válidos segundo as regras.

Isso é importante porque agora o paciente precisa descobrir:

"Como transformo este estado naquele estado?"

e não apenas:

"Como levo tudo para uma haste?"

Essa fase trabalha muito mais:
- resolução de problemas;
- replanejamento;
- flexibilidade;
- transformação de estados;
- adaptação de estratégia.

==================================================
6. FASE 5 — ALTERNÂNCIA ENTRE FORMATOS
==================================================

Nos níveis avançados, NÃO apresentar os tipos em sequência previsível.

Misturar:

- Torre clássica;
- destino variável;
- estado inicial variável;
- estado-alvo variável.

Exemplo:

Desafio 1:
clássico.

Desafio 2:
inicial variável.

Desafio 3:
destino variável.

Desafio 4:
goalState variável.

Desafio 5:
clássico novamente.

O paciente precisa identificar:

"Que tipo de problema é este?"

e adaptar a estratégia.

Isso aumenta a exigência de flexibilidade cognitiva.

==================================================
7. ARQUITETURA DE DADOS
==================================================

O modelo central do exercício NÃO deve depender apenas de:

targetPeg

A representação principal precisa ser:

initialState
+
goalState

Exemplo:

initialState = {
  left: [4,3],
  center: [1],
  right: [2]
}

goalState = {
  left: [],
  center: [4,3,2,1],
  right: []
}

A Torre clássica é apenas um caso particular dessa estrutura.

Assim conseguimos usar a mesma engine para todos os formatos.

==================================================
8. BFS / MENOR CAMINHO
==================================================

O número mínimo de movimentos NÃO deve ser calculado apenas por:

2^n - 1

Essa fórmula só serve para Torre clássica completa entre hastes.

Quero que o sistema calcule a menor distância entre:

initialState
e
goalState

usando busca em largura (BFS).

Com 3 hastes e poucos discos, o espaço de estados é pequeno.

A BFS deve servir para:

- validar o estado;
- provar que existe solução;
- calcular o menor número de movimentos;
- calcular eficiência;
- validar problemas pré-configurados.

Usar o mesmo motor para todos os tipos de desafio.

==================================================
9. O QUE O PACIENTE VÊ ANTES DE COMEÇAR
==================================================

Na tela inicial do desafio:

Título:
Jogo das Torres

Instrução curta:

"Organize os discos conforme o objetivo."

Depois mostrar visualmente:

CONFIGURAÇÃO INICIAL

[desenho das três hastes com os discos]

OBJETIVO

[desenho do goalState]

Botão:

COMEÇAR

Se o objetivo for uma torre completa na haste central, ainda assim prefiro mostrar VISUALMENTE o estado-alvo.

Não depender apenas da frase:

"Todos os discos na haste central."

==================================================
10. DURANTE A EXECUÇÃO
==================================================

Mostrar:

- as três hastes;
- discos;
- botão Reiniciar;
- botão ou área discreta "Ver objetivo".

NÃO mostrar durante a execução:

- mínimo de movimentos;
- contador de movimentos;
- eficiência;
- cronômetro;
- comparação com solução ideal;
- indicador de "perto/longe";
- progresso da solução.

IMPORTANTE:

Se a barra azul atual representa "progresso para resolver a Torre", REMOVER.

Se a barra azul representa apenas progresso global da sessão, pode permanecer.

==================================================
11. "VER OBJETIVO"
==================================================

Durante a execução, o objetivo precisa continuar disponível.

Pode existir:

VER OBJETIVO

Ao tocar:
mostrar uma miniatura do goalState.

Não esconder o objetivo para obrigar memória.

O foco é planejamento e resolução de problemas, não memória visual.

==================================================
12. REINICIAR
==================================================

O botão Reiniciar continua.

Não colocar limite rígido de 2 reinícios.

Se o paciente reiniciar:
- voltar ao initialState;
- continuar o desafio;
- registrar internamente o reinício.

Registrar:
- quantidade de reinícios;
- em qual movimento ocorreu;
- em qual tempo ocorreu.

Não punir visualmente.

Não mostrar:
"Você perdeu X pontos."

==================================================
13. NÃO CRIAR BOTÃO DESFAZER
==================================================

Confirmado:

NÃO construir botão de desfazer.

Se o paciente quiser corrigir o caminho, ele precisa fazer movimentos normais da Torre.

Isso é parte do treino.

O sistema pode registrar internamente reversões.

==================================================
14. MÍNIMO DE MOVIMENTOS
==================================================

O paciente NÃO vê o mínimo durante a execução.

O mínimo é uma métrica interna.

Somente depois de concluir:

"Você resolveu em X movimentos."

"O menor caminho possível era Y movimentos."

==================================================
15. NÃO OBRIGAR A ATINGIR O MÍNIMO
==================================================

Se o mínimo é 15 e o paciente resolve em 17:

isso é SUCESSO.

Não exigir:
"faça exatamente 15 para passar."

A eficiência deve ser calculada internamente:

movimentos realizados / mínimo calculado pela BFS

Exemplo:

mínimo 15
fez 18

eficiência = 1,20

==================================================
16. SEGUNDA TENTATIVA
==================================================

Após concluir:

mostrar:

"Você resolveu em X movimentos."

"O menor caminho possível era Y movimentos."

Pergunta opcional:

"Quer tentar encontrar um caminho mais eficiente?"

Botões:

TENTAR NOVAMENTE
CONTINUAR

IMPORTANTE:

essa segunda tentativa é diferente de Reiniciar.

Reiniciar:
acontece DURANTE a solução.

Segunda tentativa:
acontece DEPOIS que ele já resolveu.

Permitir no máximo UMA segunda tentativa opcional do mesmo problema.

Não deixar repetir indefinidamente.

==================================================
17. OBJETIVO DA SEGUNDA TENTATIVA
==================================================

Primeira tentativa:
resolver o problema.

Segunda tentativa:
replanejar e tentar melhorar a estratégia.

Comparar:

tentativa 1
vs
tentativa 2

Registrar:
- movimentos;
- tempo;
- eficiência;
- melhora;
- piora;
- reinícios.

Não exigir melhora.

==================================================
18. TELA APÓS SEGUNDA TENTATIVA
==================================================

Exemplo:

1ª tentativa: 19 movimentos
2ª tentativa: 16 movimentos

Mensagem:

"Você encontrou um caminho mais eficiente."

Se piorar:

1ª tentativa: 19
2ª tentativa: 23

Mensagem neutra:

"Desafio concluído."

Não punir.

==================================================
19. PROGRESSÃO DE DISCOS
==================================================

Sugestão:

3 discos:
fase introdutória.

4 discos:
base principal.

5 discos:
complexidade maior.

6 discos:
somente avançado.

Não usar 7 ou 8 inicialmente.

Motivo:

7 discos = 127 movimentos mínimos na Torre clássica.

Não quero que a dificuldade seja apenas uma tarefa longa.

Prefiro:

5 discos + problema estruturalmente novo

do que:

7 discos + sequência repetitiva.

==================================================
20. PROGRESSÃO SUGERIDA
==================================================

FASE 1
3 discos
clássico.

FASE 2
4 discos
clássico.

FASE 3
4 discos
destino variável.

FASE 4
4 discos
estado inicial variável
goalState = torre completa.

FASE 5
4 discos
estado inicial variável
goalState variável.

FASE 6
5 discos
mistura de formatos.

FASE 7
5 discos
problemas mais complexos.

FASE 8
6 discos
somente avançado e de forma seletiva.

==================================================
21. NÃO TORNAR A PROGRESSÃO TOTALMENTE LINEAR
==================================================

Depois de consolidada a lógica, não fazer:

clássico
→ destino variável
→ inicial variável
→ goal variável
e nunca mais voltar.

Nos níveis altos, misturar os tipos.

A alternância estrutural é importante para flexibilidade.

==================================================
22. REGISTRO DE PROCESSO
==================================================

Registrar por desafio:

- patient/session id;
- puzzle id;
- número de discos;
- tipo do problema;
- initialState;
- goalState;
- mínimo BFS;
- movimentos válidos;
- movimentos inválidos;
- movimentos totais;
- tempo total;
- latência até primeiro movimento;
- reinícios;
- momento de cada reinício;
- reversões;
- concluiu;
- abandonou;
- número da tentativa;
- eficiência;
- segunda tentativa;
- melhora entre tentativas.

==================================================
23. ABANDONO
==================================================

Se o paciente sair no meio, não perder o dado.

Quero distinguir:

NUNCA INICIOU

de

INICIOU E ABANDONOU.

Se isso exigir mudança no Supabase:
PARAR;
mostrar migration;
fazer backup;
só depois implementar.

==================================================
24. INTERPRETAÇÃO DO REINÍCIO
==================================================

Não tratar automaticamente:

reinício = erro.

Um reinício pode representar:

"percebi que minha estratégia não está funcionando."

Isso pode ser monitoramento e flexibilidade.

Por isso apenas registrar.

Não criar pontuação automática de flexibilidade neste momento.

==================================================
25. CORREÇÃO SEM REINICIAR
==================================================

O paciente pode perceber que o caminho ficou ruim e reorganizar usando movimentos normais.

Exemplo:

faz:
A → B
B → C
C → B

Isso pode representar revisão de estratégia.

Registrar reversões quando possível.

Não mostrar isso ao paciente.

==================================================
26. MOVIMENTO INVÁLIDO
==================================================

Se tentar colocar um disco maior sobre um menor:

não permitir.

Mostrar apenas:

"Esse movimento não é permitido."

Não dizer qual é o movimento correto.

Registrar:
invalidMove +1

==================================================
27. INTERFACE
==================================================

A interface precisa continuar limpa.

Usar:

ESQUERDA
CENTRAL
DIREITA

Não usar:

Origem
Aux
Destino

porque agora qualquer haste pode exercer qualquer função.

Na tela principal:
- título;
- objetivo disponível;
- três hastes;
- discos;
- Reiniciar.

Não colocar excesso de informação.

==================================================
28. PRINCÍPIO COGNITIVO
==================================================

O jogo NÃO deve ensinar:

"faça em 15 movimentos."

O jogo deve treinar:

"analise o estado;
formule uma estratégia;
execute;
observe se está funcionando;
corrija quando necessário;
encontre uma solução."

==================================================
29. O QUE QUERO QUE O PACIENTE APRENDA
==================================================

FASE INICIAL:
"Como funciona a Torre?"

FASE INTERMEDIÁRIA:
"Como planejo uma sequência?"

FASE SEGUINTE:
"Essa estratégia serve para este estado?"

FASE AVANÇADA:
"Preciso abandonar a estratégia anterior e construir outra."

==================================================
30. RESUMO DA ARQUITETURA
==================================================

TIPO 1
TORRE CLÁSSICA

initialState:
torre completa em uma haste

goalState:
torre completa em outra

↓

TIPO 2
DESTINO VARIÁVEL

initialState:
torre completa

goalState:
torre completa em outra haste variável

↓

TIPO 3
INICIAL VARIÁVEL

initialState:
discos distribuídos

goalState:
torre completa

↓

TIPO 4
TRANSFORMAÇÃO DE ESTADOS

initialState:
configuração variável

goalState:
configuração variável

↓

TIPO 5
MISTO

o paciente não sabe qual estrutura vem em seguida.

==================================================
31. TESTES OBRIGATÓRIOS
==================================================

Testar:

1. clássico de 3 discos;
2. clássico de 4;
3. destino central;
4. origem direita;
5. initialState distribuído;
6. goalState distribuído;
7. BFS retorna mínimo correto;
8. BFS retorna 7 para Torre clássica de 3 discos;
9. BFS retorna 15 para Torre clássica de 4;
10. estado inválido é rejeitado;
11. goalState inválido é rejeitado;
12. movimento ilegal é bloqueado;
13. mínimo não aparece durante execução;
14. movimentos não aparecem durante execução;
15. Reiniciar funciona sem limite rígido;
16. reinício é registrado;
17. não existe Desfazer;
18. conclusão aceita solução acima do mínimo;
19. segunda tentativa é opcional;
20. máximo de uma segunda tentativa;
21. objetivo visual funciona;
22. rótulos são Esquerda/Central/Direita;
23. barra de progresso da solução não existe;
24. abandono é registrado quando infraestrutura permitir.

==================================================
32. O QUE QUERO QUE VOCÊ FAÇA AGORA
==================================================

ANTES de continuar alterando a interface:

1. me diga como o jogo está modelado HOJE;
2. confirme se existe apenas targetPeg ou se já existe goalState completo;
3. mostre como initialState é armazenado;
4. mostre como o mínimo está sendo calculado;
5. confirme o significado da barra azul atual;
6. me diga quais partes da implementação atual podem ser reaproveitadas;
7. proponha o plano técnico para migrar para:

initialState + goalState + BFS

sem quebrar o que já funciona.

Não avance para novas telas até esclarecer esses pontos.

## 01/09/2026 11:54
Confirmo o entendimento. O motor está correto e não precisa ser refeito.
Sobre a dúvida do objetivo: o objetivo deve permanecer VISÍVEL durante toda a execução.
Não quero que “Ver objetivo” seja necessário para revelar o alvo, porque isso adicionaria uma exigência de memória visual que não é o foco deste treino.
Portanto:
ANTES DE COMEÇAR
Mostrar lado a lado ou de forma muito clara:
CONFIGURAÇÃO INICIAL
[visual do initialState]
OBJETIVO
[visual do goalState]
DURANTE A EXECUÇÃO
Manter uma miniatura compacta do goalState sempre visível, com o título:
OBJETIVO
A miniatura não deve ocupar muito espaço nem competir com as torres principais.
Se houver necessidade de ampliar, a própria miniatura pode ser clicável ou pode haver:
Ampliar objetivo
Isso abre uma visualização maior temporariamente.
Portanto:
objetivo sempre visível;
botão apenas para AMPLIAR;
nunca esconder o objetivo como parte da dificuldade;
não testar memória visual;
não mostrar caminho, movimentos necessários ou proximidade da solução.
Também confirmar as demais mudanças:
reorganizar o banco para as 8 fases definidas;
manter fase inicial realmente clássica;
usar sempre os rótulos Esquerda / Central / Direita;
mostrar o goalState visualmente em TODOS os problemas, inclusive quando for uma torre completa;
manter removida a barra de progresso da solução;
não alterar BFS, registro, segunda tentativa, abandono ou demais partes do motor que já estão corretas.
A única diferença entre os níveis deve ser a estrutura do problema, não a disponibilidade do objetivo.
E eu acrescentaria uma escolha visual: na tela que você me mostrou, não colocaria o objetivo no meio das três hastes, porque pode parecer uma quarta informação misturada ao tabuleiro. Eu colocaria uma pequena caixa no canto superior direito do card:
OBJETIVO
[miniatura das três hastes]
Assim o paciente olha rapidamente para ela e volta ao tabuleiro principal. É muito mais limpo.

## 01/09/2026 12:13
A implementação está correta. Só quero acrescentar uma regra para as fases 1 e 2:
elas são fases de aquisição/consolidação da regra, e não fases para permanência prolongada.
Como existe apenas um problema possível dentro da estrutura clássica definida para cada uma:
Fase 1 = 3 discos, esquerda → direita;
Fase 2 = 4 discos, esquerda → direita;
não quero que o paciente fique recebendo o mesmo problema indefinidamente entre sessões.
O mesmo problema pode ser repetido quando necessário para aprender/consolidar a regra, mas depois de demonstrar domínio suficiente o sistema deve avançar para a fase seguinte, porque a repetição excessiva transforma a tarefa em reprodução de sequência conhecida em vez de planejamento.
Sugestão de lógica:
Fase 1
primeira exposição: realiza normalmente;
se concluir com compreensão das regras e sem dificuldade importante, pode avançar;
se tiver dificuldade, repetir em outra oportunidade;
não exigir mínimo de movimentos.
Fase 2
mesma lógica com 4 discos;
usar como confirmação de que consegue aplicar a regra com maior demanda de planejamento;
após desempenho funcional, avançar para a Fase 3.
A partir da Fase 3, começa efetivamente a necessidade de adaptação porque o destino passa a variar.
Portanto, não há problema em existir apenas um problema nas fases 1 e 2. O importante é que essas fases sejam tratadas como gates de aprendizagem, não como um banco de treino recorrente.
Não mexer no restante da arquitetura.
