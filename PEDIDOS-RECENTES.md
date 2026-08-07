# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 06/08/2026 21:13
<task-notification>
<task-id>bsm4ghaja</task-id>
<tool-use-id>toolu_01DWgbK6oPq7h8jZxxUNAWfz</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bsm4ghaja.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex com a spec de ritmo" completed (exit code 0)</summary>
</task-notification>

## 06/08/2026 21:42
A segunda validação visual ficou muito melhor.
O fluxo agora está natural e muito mais próximo do que eu esperava.
Encontrei apenas alguns ajustes finos antes de aprovar o Span Direto como exercício de referência da T1.
1. Texto da tentativa guiada
Hoje aparece:
SUA VEZ
Agora é sua vez
Ouça a sequência e responda no teclado.
Esse texto não está correto.
O paciente não responde no teclado.
Ele responde clicando com o mouse (ou tocando na tela, futuramente).
Quero substituir por algo neutro, por exemplo:
Ouça a sequência e clique nos números na mesma ordem.
Ou outra redação equivalente, mas sem mencionar teclado.
2. Encerramento da tentativa guiada
Hoje, logo após clicar no último número, a tela muda imediatamente para:
Tentativa concluída
A transição ficou rápida demais.
Quero um pequeno respiro.
Após o último clique:
manter a confirmação visual por um instante;
depois mostrar a tela seguinte.
Além disso, prefiro mudar o texto.
Em vez de:
Tentativa concluída
usar:
Tutorial concluído
Porque o paciente ainda não estava treinando.
Ele acabou de concluir o tutorial.
3. Espaçamento
Ainda sinto que algumas telas mudam rapidamente uma para outra.
Não é um problema de lógica.
É um problema de ritmo visual.
Quero aumentar levemente o espaçamento temporal entre:
último clique;
confirmação;
tela "Tutorial concluído";
início do treino real.
Não quero aumentar muito.
É apenas para que cada etapa tenha começo, meio e fim, sem parecer que uma tela atropela a outra.

## 07/08/2026 10:12
Estamos praticamente aprovando o Span Direto como exercício de referência.
Restaram apenas dois ajustes antes de replicarmos o framework para os demais exercícios.
1. Texto da demonstração
Hoje:
“Você vai ver a tarefa sendo feita do início ao fim.”
Substitua por:
“Observe como ouvir a sequência e responder corretamente.”
Manter:
DEMONSTRAÇÃO
Observe como responder
2. Sincronismo entre áudio e estímulo visual
Há um defeito perceptível: a indicação visual da tecla/número acontece antes da voz terminar de falar o dígito.
Isso precisa ser corrigido.
Durante a fase de escuta, para cada dígito, a ordem deve ser:
iniciar o áudio do número;
o feedback visual correspondente deve acompanhar o momento da fala, nunca antecipá-la;
concluir o áudio;
respeitar a pausa da cadência;
somente então avançar para o próximo dígito.
Quero que áudio e feedback visual sejam percebidos como um único evento sincronizado.
Não quero a tecla acendendo antes da voz.
Os demais textos ficam aprovados:
SUA VEZ
Agora é sua vez
“Ouça a sequência e clique nos números na mesma ordem.”
E no encerramento:
Tutorial concluído
“Você respondeu na ordem correta. Agora começa o treino.”
Depois desses dois ajustes:
rode os gates;
publique;
pare para uma última validação do Span Direto.
Se estiver correto, considero o Span Direto oficialmente aprovado como padrão da T1 e autorizo imediatamente a conversão dos outros 33 exercícios para o mesmo framework, adaptando apenas a mecânica específica de cada exercício.
Não iniciar a conversão dos demais antes dessa última validação.
