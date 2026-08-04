# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 17:19
<task-notification>
<task-id>bt865bz71</task-id>
<tool-use-id>toolu_01HDipVHovNDBdHDExpLuG7J</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bt865bz71.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o novo disparo" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 17:35
<task-notification>
<task-id>bgx1ezfiy</task-id>
<tool-use-id>toolu_018SWi6FT2bFQxprKEN7pQGb</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bgx1ezfiy.output</output-file>
<status>completed</status>
<summary>Background command "Redisparar isolado com a spec corrigida" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 19:42
Antes de publicar, preciso separar claramente o que este lote resolveu do que foi definido posteriormente a partir da análise do Cogmed.

A duração contínua está tecnicamente aprovada: o motor deve respeitar exatamente o valor escolhido pelo terapeuta, sem arredondamento para 20/30/40.

Entretanto, a filosofia clínica extraída da análise do Cogmed ainda não está incorporada e precisa ser registrada formalmente antes de avançarmos.

Não implementar essa nova filosofia agora. Quero primeiro documentá-la e verificar conflitos com a arquitetura atual.

==================================================
DECISÃO ARQUITETÔNICA — PRESCRIÇÃO, EXECUÇÃO E TEMPO REAL
==================================================

1. A duração escolhida pelo terapeuta é uma META ESTIMADA da sessão, não um cronômetro de interrupção.

Exemplo:

- sessão planejada para aproximadamente 30 minutos;
- o paciente pode concluir em 25, 30, 41 ou 45 minutos;
- essa diferença é um dado clínico e operacional;
- não representa automaticamente erro ou inadequação.

2. O paciente deve concluir os exercícios prescritos.

O sistema não deve:

- encerrar automaticamente a sessão ao alcançar o tempo-alvo;
- interromper um exercício;
- retirar exercícios restantes;
- reduzir protocolos durante a execução;
- bloquear a conclusão por ultrapassar a estimativa.

3. Separar três conceitos:

A. Duração-alvo prescrita
- escolhida pelo terapeuta;
- representa a expectativa aproximada da sessão.

B. Duração estimada
- calculada a partir dos exercícios e protocolos prescritos;
- usada consultivamente durante a montagem do plano.

C. Duração real
- tempo efetivamente utilizado pelo paciente para concluir a sessão;
- registrada somente após ou durante a execução;
- pode ser superior ou inferior à estimativa.

4. Tempo acima ou abaixo da estimativa é dado, não erro.

Exemplos:

- alvo de 30 min;
- execução em 25 min;
- execução em 31 min;
- execução em 41 min.

Todos podem representar sessões concluídas corretamente.

A interpretação depende de:

- desempenho;
- número de erros;
- pausas;
- necessidade de repetição;
- velocidade de processamento;
- estratégias utilizadas;
- fadiga relatada;
- evolução longitudinal.

5. Os estados de duração na prescrição continuam consultivos.

`ABAIXO`, `DENTRO`, `ACIMA` e `EXCESSO_IMPORTANTE` podem descrever a composição estimada antes da aplicação.

Eles não podem:

- bloquear salvamento;
- impedir a execução;
- encerrar a sessão;
- classificar automaticamente a sessão realizada como inválida.

Avaliar futuramente se “EXCESSO_IMPORTANTE” é a melhor linguagem visível para o terapeuta ou se deve ser traduzido como “estimativa significativamente acima da meta”.

Não alterar agora.

6. O terapeuta continua soberano.

Ele pode deliberadamente:

- criar sessão focal em planejamento;
- concentrar exercícios do mesmo domínio;
- aceitar estimativa acima da meta;
- aumentar ou reduzir duração;
- escolher protocolos diferentes;
- manter exercícios prioritários;
- adaptar o plano conforme o retorno do paciente.

O sistema informa as consequências, mas não decide pelo terapeuta.

7. Estrutura futura do acompanhamento:

A. Plano atual
- duração-alvo;
- frequência;
- exercícios;
- protocolos;
- ordem;
- estado do plano.

B. Histórico de sessões/blocos
- data;
- duração real;
- exercícios concluídos;
- pausas ou intervalos;
- conclusão parcial ou integral;
- observações relevantes.

C. Evolução por exercício
- nível;
- desempenho;
- métricas específicas daquele exercício;
- tendência longitudinal.

D. Evolução global
- adesão;
- duração média real;
- comparação estimado × realizado;
- tendências por domínio;
- sinais de fadiga ou queda de desempenho.

Não implementar agora.

8. A análise do Cogmed serve como referência de princípio, não como modelo a ser copiado integralmente.

O que queremos preservar:

- sessão/bloco como unidade organizadora;
- exercícios como componentes da sessão;
- conclusão do conjunto prescrito;
- registro do tempo real;
- variação do tempo como dado;
- histórico preservado;
- evolução individual por exercício.

O NeuroPeak acrescentará futuramente:

- carga;
- fadiga;
- interferência;
- composição;
- métricas específicas;
- apoio consultivo ao terapeuta.

==================================================
ENTREGA
==================================================

Antes da publicação, acrescente essa decisão a um novo documento arquitetônico, sem alterar os documentos já aprovados e sem implementar código novo.

Analise e informe:

1. Se o runtime atual possui algum limite de tempo que interrompe sessão ou exercício.
2. Se o tempo atual é usado somente para estimativa ou também para encerramento.
3. Onde a duração real já é registrada, caso seja.
4. Se hoje é possível distinguir duração-alvo, estimativa e duração real.
5. Quais conflitos existem entre essa decisão e a arquitetura atual.
6. Quais documentos precisam receber referência a esse novo princípio.
7. Quais implementações futuras serão necessárias, sem iniciá-las.

Depois disso, apresente a análise e pare.

Não publicar ainda.
Não alterar interface.
Não alterar banco.
Não alterar execução.
Não iniciar histórico, relatório ou tutorial.
