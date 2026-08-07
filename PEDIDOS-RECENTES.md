# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 06/08/2026 21:03
O desenho está aprovado em princípio.

Antes de publicar, faça uma última revisão do ritmo para garantir que a demonstração pareça humana, não excessivamente lenta.

Quero preservar:

- pausa clara antes da demonstração;
- cursor visível e fácil de localizar;
- deslocamento natural;
- pressionar perceptível;
- soltar perceptível;
- bolinha preenchendo somente depois;
- pausa entre os dígitos;
- transição explícita para “Agora é sua vez”.

Mas não quero que a soma dos tempos deixe a demonstração artificialmente longa.

Use os valores atuais como teto inicial e ajuste, se necessário, para que o fluxo pareça uma pessoa ensinando de forma calma e clara.

Depois:

- rode os gates;
- publique;
- confirme appVersion, buildId e health;
- não converta nenhum outro exercício;
- pare para minha segunda validação visual do Span Direto.

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
