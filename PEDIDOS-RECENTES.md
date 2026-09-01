# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 01/09/2026 12:40
[Image #14] Na tela antes de começar, os dois blocos estão grandes demais: Configuração Inicial e Objetivo.
Quero ajustar assim:
1. Antes de começar
manter a Configuração Inicial em destaque principal;
deixar o Objetivo menor do que a Configuração Inicial;
os dois continuam visíveis, mas não no mesmo peso visual;
a ideia é que o paciente entenda: “isso é o estado de partida” e “isso é a referência para onde preciso chegar”.
2. Depois que o jogo começar
aí sim fazer como combinamos:
o Objetivo deve ficar ainda menor;
funcionar apenas como referência visual rápida;
permanecer no canto superior direito;
continuar clicável para ampliar;
não competir visualmente com o tabuleiro principal.
Resumindo:
tela inicial: os dois aparecem, mas o Objetivo já deve ser menor que a Configuração Inicial;
tela durante a execução: o Objetivo fica menor ainda, bem discreto, apenas como apoio visual.
Não quero mudar lógica, só essa hierarquia visual.
