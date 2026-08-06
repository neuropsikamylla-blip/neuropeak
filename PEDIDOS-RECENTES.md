# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 23:17
A validação visual revelou um defeito importante na demonstração do Span Direto.

Hoje a demonstração apenas reproduz os números por áudio e logo avança. Isso demonstra o estímulo, mas não demonstra como o paciente deve responder.

A demonstração precisa reproduzir a tarefa inteira, como no Cogmed:

Exemplo:

1. o sistema fala 2;
2. o sistema fala 3;
3. o teclado fica disponível;
4. uma seta/cursor visual se desloca até o número 2 e simula o clique;
5. depois se desloca até o número 3 e simula o clique;
6. somente após os dois cliques a demonstração termina;
7. aparece “Agora é sua vez”;
8. inicia a tentativa guiada com uma nova sequência.

Regras:

- usar o mesmo teclado do exercício real;
- a seta deve ser discreta, clara e animada;
- o número clicado deve receber exatamente o mesmo feedback visual do treino real;
- não exibir a sequência escrita durante a escuta;
- os números só ficam visíveis porque fazem parte do teclado real;
- a demonstração deve executar a resposta automaticamente;
- a tentativa guiada continua sendo respondida pelo paciente;
- não criar Session;
- não alterar nenhuma métrica clínica;
- não converter o Span Inverso;
- não alterar a progressão clínica.

Antes de publicar, apresente o fluxo visual implementado e pare para nova validação.

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
