# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 09/09/2026 18:40
Auditoria aprovada. Fechando as quatro decisões:
1. Torre e Estacionamento
Não manter 11/13.
Ambos entram no padrão:
target = 8 min
max = 10 min
A margem de 8→10 existe justamente para permitir concluir adequadamente um problema de planejamento já iniciado sem transformar o exercício em um bloco longo demais.
Não quero exceção temporal para eles neste momento.
Se os dados reais futuramente mostrarem necessidade de dose maior, recalibramos.
2. Stroop
Pode continuar com duração variável pela dificuldade.
A configuração global deve aceitar:
valor fixo;
OU função baseada na dificuldade.
Mas a função deve resolver o PAR:
targetDuration
maxDuration
Para o Stroop, manter o alvo atual de aproximadamente 4–7 min conforme dificuldade e usar uma tolerância curta, por exemplo:
maxDuration = targetDuration + 1 min
porque é uma tarefa baseada em tentativas curtas e não precisa da mesma janela de 2 minutos dos problemas longos.
Não criar lógica especial de interface para o Stroop. Só muda a configuração.
3. Torre
Confirmado: a barra volta.
A barra removida anteriormente era de PROGRESSO DA SOLUÇÃO e deve continuar inexistente.
A nova barra é temporal:
elapsed do bloco / targetDuration
e não tem nenhuma relação com:
posição dos discos;
proximidade do goalState;
número de movimentos;
mínimo BFS;
eficiência;
reinícios.
Portanto a Torre deve usar o mesmo ExerciseProgressBar global.
4. Padrão geral
Confirmado:
os 22 exercícios atualmente no padrão de 7 minutos passam para:
target = 8 min
max = 10 min
desde que a auditoria não tenha identificado justificativa funcional específica para duração menor.
Exercícios deliberadamente curtos permanecem como exceções configuradas.
Não criar if exercise === ...; tudo via metadata/config.
5. Grade Dedutiva
Aproveitar do trabalho em voo:
sequência de problemas;
agregação de registro;
infraestrutura útil.
NÃO aplicar a constante de 11 minutos.
A Grade entra diretamente no padrão:
8/10.
6. Separação obrigatória dos progressos
Corrigir o defeito atual do ExerciseWrapper:
progresso do bloco do exercício NÃO pode alimentar diretamente o progresso global da sessão.
Manter dois conceitos/estados independentes:
exerciseBlockProgress
e
daily/sessionProgress.
7. Percentual
Remover porcentagem numérica da barra dos 28 exercícios e também do widget do dia, se esse número estiver representando o mesmo tipo de progresso.
Quero barra visual, não %.
8. Persistência após reload
Corrigir obrigatoriamente o reset do tempo ao recarregar.
Recarregar a página não pode reiniciar a dose e permitir treino infinito.
Como a auditoria diz que não é necessária mudança de banco, reutilize a persistência já disponível na arquitetura da sessão. Não criar banco novo sem necessidade.
9. Migração
Aprovo o portão da etapa 4.
Primeiro implementar em três pilotos:
um exercício curto;
um padrão 8/10;
um problema longo, preferencialmente Torre.
Validar:
visual;
target;
grace period;
max;
reload;
troca entre problemas;
separação bloco × sessão.
Só depois migrar os demais.
Não fazer migração em massa antes da aprovação dos pilotos.

## 09/09/2026 18:46
<task-notification>
<task-id>bzts9xqda</task-id>
<tool-use-id>toolu_013NZhhcbXLsG9u6ZX6PjhP5</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/bzts9xqda.output</output-file>
<status>completed</status>
<summary>Background command "Redisparar sessão com o lab.sh corrigido" completed (exit code 0)</summary>
</task-notification>

## 09/09/2026 19:12
<task-notification>
<task-id>b0kjcvu86</task-id>
<tool-use-id>toolu_01Ut43B7qx9u5uq4inQmHUXN</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/af26ae96-821d-4dce-abd1-d20a017fa7f8/tasks/b0kjcvu86.output</output-file>
<status>completed</status>
<summary>Background command "Disparar a dosagem global" completed (exit code 0)</summary>
</task-notification>
