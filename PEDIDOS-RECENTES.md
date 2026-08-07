# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 23:21
O desenho está aprovado.

Acrescente apenas duas regras antes da implementação final:

1. Durante a resposta demonstrada, o teclado não pode aceitar cliques reais do paciente.
A interação deve permanecer bloqueada até o início da tentativa guiada.

2. O cursor deve indicar claramente o pressionar e o soltar:
- desloca até a tecla;
- pressiona;
- a tecla recebe o mesmo feedback visual do treino;
- solta;
- só então a bolinha correspondente é preenchida.

Não quero que o cursor apenas passe por cima da tecla ou que a bolinha preencha antes do clique visual terminar.

Depois conclua a implementação, rode os gates e pare para minha validação visual sem publicar.

## 05/08/2026 23:34
<task-notification>
<task-id>bp49hut7h</task-id>
<tool-use-id>toolu_01Q3Bub3PRuKGxoHsYCEPKrg</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bp49hut7h.output</output-file>
<status>completed</status>
<summary>Background command "Redisparar o Codex com a spec completa" completed (exit code 0)</summary>
</task-notification>

## 06/08/2026 20:59
A primeira validação visual do Span Numérico Auditivo Direto mostrou que a arquitetura da T1 está funcionando, porém a experiência ainda não está pronta para servir como padrão dos 34 exercícios.
Não quero converter nenhum outro exercício neste momento.
O problema agora não é técnico, é de UX e pedagogia.
1. A transição preparação → demonstração está brusca
Hoje a demonstração começa praticamente instantaneamente.
O paciente não percebe que entrou em uma etapa diferente.
Quero uma transição clara.
Exemplo:
"Observe como responder."
Só depois iniciar a demonstração.
2. O cursor praticamente não existe
Na prática eu não consegui perceber o cursor.
Ele precisa ensinar visualmente como responder.
Revisar:
tamanho;
contraste;
animação;
velocidade;
permanência durante toda a demonstração.
O cursor precisa ser facilmente percebido, sem roubar a atenção da tarefa.
3. O clique não transmite sensação de clique real
Eu esperava visualizar exatamente alguém respondendo.
Hoje isso não acontece.
Quero que o gesto seja claramente dividido em etapas:
desloca;
pressiona;
permanece pressionado por um instante;
solta;
somente depois a bolinha preenche.
O preenchimento deve ser claramente percebido como consequência do clique.
4. A demonstração está rápida demais
O paciente praticamente não consegue acompanhar.
Não quero simplesmente aumentar todos os tempos.
Quero calibrar a animação para parecer uma pessoa ensinando.
Principalmente revisar:
pausa antes do primeiro clique;
velocidade do cursor;
tempo pressionado;
tempo após soltar;
intervalo entre um número e outro;
pausa antes da tentativa guiada.
5. "Agora é sua vez"
Na validação essa transição praticamente não apareceu.
Ela precisa existir claramente.
O paciente precisa perceber que:
a demonstração terminou;
agora quem responde é ele.
6. A tentativa guiada não ficou evidente
Na prática parece que o exercício simplesmente começou.
Quero uma separação visual muito clara entre:
demonstração;
tentativa guiada;
treino real.
Cada etapa precisa ter identidade própria.
7. Ainda não aprovo o Span Direto como exercício de referência
O framework ainda não está pronto para ser replicado.
Primeiro quero que essa experiência fique realmente natural.
Depois faço uma segunda validação visual.
Somente quando eu aprovar o Span Direto ele passa a ser o padrão definitivo da T1.
