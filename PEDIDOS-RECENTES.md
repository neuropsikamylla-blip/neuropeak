# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 01/09/2026 12:20
A implementação ficou correta, inclusive a persistência das 8 fases. Quero apenas ajustar o gate das fases 1 e 2.
Não quero que reinicios > 1, isoladamente, impeça progressão.
Reiniciar pode representar percepção de uma estratégia ineficiente e autorregulação, portanto não deve ser usado sozinho como evidência de que a regra não foi compreendida.
Também não quero que eficiencia > 2.0, isoladamente, seja suficiente para impedir avanço nas fases 1 e 2. Nessas fases, eficiência baixa pode indicar planejamento ainda imaturo, mas isso é justamente algo que o exercício deverá treinar nas fases seguintes.
O gate inicial deve perguntar principalmente:
“A pessoa compreendeu e consegue aplicar as regras básicas da Torre?”
Sugestão:
AVANÇA nas fases 1 e 2 se:
concluiu o problema;
não apresentou quantidade importante de movimentos inválidos.
REPETE se:
não conseguiu concluir / abandonou;
OU realizou mais de 3 movimentos inválidos;
OU houve combinação de sinais de dificuldade global, por exemplo:
eficiencia > 2.0 E reinicios > 1.
Portanto:
reinicios > 1 sozinho → NÃO bloqueia.
eficiencia > 2.0 sozinha → NÃO bloqueia.
movimentosInvalidos > 3 → pode bloquear sozinho, porque está muito mais diretamente relacionado à compreensão/aplicação das regras básicas.
eficiencia > 2.0 + reinicios > 1 → pode indicar dificuldade suficiente para repetir a fase.
Manter todos esses parâmetros configuráveis e identificados como parâmetros do programa, não normas clínicas.
Da fase 3 em diante, manter o critério de desempenho mais exigente já existente.

## 01/09/2026 12:29
A implementação ficou correta, inclusive a persistência das 8 fases. Quero apenas ajustar o gate das fases 1 e 2.
Não quero que reinicios > 1, isoladamente, impeça progressão.
Reiniciar pode representar percepção de uma estratégia ineficiente e autorregulação, portanto não deve ser usado sozinho como evidência de que a regra não foi compreendida.
Também não quero que eficiencia > 2.0, isoladamente, seja suficiente para impedir avanço nas fases 1 e 2. Nessas fases, eficiência baixa pode indicar planejamento ainda imaturo, mas isso é justamente algo que o exercício deverá treinar nas fases seguintes.
O gate inicial deve perguntar principalmente:
“A pessoa compreendeu e consegue aplicar as regras básicas da Torre?”
Sugestão:
AVANÇA nas fases 1 e 2 se:
concluiu o problema;
não apresentou quantidade importante de movimentos inválidos.
REPETE se:
não conseguiu concluir / abandonou;
OU realizou mais de 3 movimentos inválidos;
OU houve combinação de sinais de dificuldade global, por exemplo:
eficiencia > 2.0 E reinicios > 1.
Portanto:
reinicios > 1 sozinho → NÃO bloqueia.
eficiencia > 2.0 sozinha → NÃO bloqueia.
movimentosInvalidos > 3 → pode bloquear sozinho, porque está muito mais diretamente relacionado à compreensão/aplicação das regras básicas.
eficiencia > 2.0 + reinicios > 1 → pode indicar dificuldade suficiente para repetir a fase.
Manter todos esses parâmetros configuráveis e identificados como parâmetros do programa, não normas clínicas.
Da fase 3 em diante, manter o critério de desempenho mais exigente já existente.
