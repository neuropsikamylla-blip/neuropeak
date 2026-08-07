# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 07/08/2026 16:33
<task-notification>
<task-id>bn5pv57fm</task-id>
<tool-use-id>toolu_011oQxVir92y1To5S2LJPdkG</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bn5pv57fm.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex para a Família 1" completed (exit code 0)</summary>
</task-notification>

## 07/08/2026 16:47
Pode seguir para a Família 2 e usar matriz-espacial como representante para minha validação.
Antes, corrija apenas um ponto global que ficou na Família 1:
o fallback de 1200 ms do speechSynthesis não pode liberar o estímulo visual simplesmente porque o onstart não disparou. Isso pode fazer o visual aparecer antes da fala e violar nossa regra global de sincronismo.
A regra permanece:
o visual nunca pode antecipar o áudio.
Se onstart falhar, trate como falha/degradação de áudio de forma segura, mas não use um timeout que possa transformar o visual no evento principal antes da voz.
Trave isso por teste para que futuras famílias com áudio não repitam o problema.
Feito isso, siga direto para a Família 2:
matriz-espacial;
matriz-espacial-inversa;
cubo-corsi;
padroes-rotacao.
Converta os quatro utilizando uma única fábrica para essa mecânica, sem alterar a mecânica clínica.
Depois publique e pare apenas para eu validar o matriz-espacial como representante da Família 2.
Não preciso validar os outros três se forem realmente a mesma mecânica de tutorial.

## 07/08/2026 17:07
<task-notification>
<task-id>bf08d1pw6</task-id>
<tool-use-id>toolu_011suVkTzCMFCoLUCLEFEAPz</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bf08d1pw6.output</output-file>
<status>completed</status>
<summary>Background command "Disparar o Codex para a Família 2" completed (exit code 0)</summary>
</task-notification>
