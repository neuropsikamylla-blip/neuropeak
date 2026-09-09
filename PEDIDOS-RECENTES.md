# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 09/09/2026 18:32
da uma olhadinha nisso aqui antes Quero PADRONIZAR A BARRA DE PROGRESSO E A DOSAGEM DE TEMPO DE TODOS OS EXERCÍCIOS DA PLATAFORMA.

Esta deve ser uma arquitetura GLOBAL e reutilizável.

IMPORTANTE:
não quero implementar uma barra diferente dentro de cada exercício.

Quero um único componente / framework de progresso utilizado por todos os exercícios, com parâmetros configuráveis.

==================================================
1. O QUE ESSA BARRA REPRESENTA
==================================================

A barra representa:

PROGRESSO DO BLOCO DE TREINO DO EXERCÍCIO ATUAL.

Ela NÃO representa:

- quanto falta para resolver o problema atual;
- proximidade da solução;
- número de respostas corretas;
- número de erros;
- eficiência;
- pontuação;
- dificuldade;
- porcentagem de uma Torre resolvida;
- quantidade de células preenchidas;
- desempenho do paciente.

Isso é fundamental.

Exemplo:

Na Torre, a barra NÃO pode aumentar porque discos estão chegando ao goalState.

Na Grade Dedutiva, NÃO pode aumentar porque a grade está sendo preenchida.

Ela representa somente o andamento da DOSE daquele exercício dentro da sessão.

==================================================
2. COMPONENTE GLOBAL
==================================================

Audite como a barra/progresso funciona hoje nos exercícios existentes.

Quero criar ou consolidar UM componente compartilhado, algo conceitualmente como:

ExerciseProgress
ExerciseSessionProgress
TrainingBlockProgress

O nome técnico pode seguir o padrão do projeto.

Todos os exercícios devem consumir o mesmo componente.

Não quero cópias independentes da mesma lógica espalhadas em cada exercício.

==================================================
3. CONFIGURAÇÃO POR EXERCÍCIO
==================================================

Cada exercício deve possuir parâmetros de dosagem.

Conceitualmente:

{
  targetDurationSec,
  maxDurationSec
}

PADRÃO DA PLATAFORMA:

targetDurationSec = 8 minutos
maxDurationSec = 10 minutos

Ou seja:

targetDurationSec = 480
maxDurationSec = 600

Alguns exercícios podem ter duração menor.

Exemplo:

{
  targetDurationSec: 300,
  maxDurationSec: 360
}

para um exercício cuja dose planejada seja aproximadamente 5–6 minutos.

IMPORTANTE:

A ideia e a interface são SEMPRE as mesmas.

O que muda é somente a configuração temporal.

Não criar um tipo diferente de progresso para exercícios curtos.

==================================================
4. TARGET E MAX NÃO SÃO A MESMA COISA
==================================================

Quero distinguir:

TARGET DURATION

tempo planejado de treino.

e

MAX DURATION

limite máximo usado para permitir uma finalização adequada.

No padrão:

TARGET = 8 minutos.

MAX = 10 minutos.

==================================================
5. COMPORTAMENTO ANTES DO TARGET
==================================================

Enquanto:

elapsed < targetDuration

o exercício funciona normalmente.

Pode:

- apresentar novos desafios;
- apresentar novas rodadas;
- continuar progressão;
- adaptar dificuldade;
- selecionar próximo problema.

==================================================
6. QUANDO CHEGA AO TARGET
==================================================

Ao atingir aproximadamente 8 minutos:

NÃO cortar imediatamente o raciocínio do paciente.

Aplicar:

se acabou de concluir o desafio atual:
→ encerrar o bloco daquele exercício.

se está no meio de um desafio:
→ permitir concluir ou continuar até o limite máximo.

IMPORTANTE:

depois de atingir targetDuration, não iniciar indefinidamente novos problemas longos.

==================================================
7. LIMITE MÁXIMO
==================================================

Ao chegar ao maxDuration:

o exercício deve encerrar o bloco de forma limpa.

Para tarefas longas como:

- Torre;
- Grade Dedutiva;
- Estacionamento Lógico;
- outros problemas estruturados;

se o problema ainda estiver aberto:

registrar como:

INTERROMPIDO PELO FIM DO BLOCO

ou status equivalente.

NÃO registrar como:

erro;
fracasso;
abandono voluntário.

Preservar todos os dados já realizados naquele desafio.

==================================================
8. TAREFAS CURTAS / TRIAL-BASED
==================================================

Para exercícios constituídos por tentativas muito curtas:

quando atingir o target:

terminar a tentativa atual e encerrar.

Não iniciar nova sequência desnecessária.

O maxDuration continua funcionando como segurança.

==================================================
9. NÃO MOSTRAR CRONÔMETRO
==================================================

A barra deve existir visualmente.

Mas não quero mostrar:

08:00
07:32 restantes
cronômetro regressivo
segundos
contagem visível.

Isso pode gerar pressão de velocidade e alterar a forma como o paciente executa a tarefa.

Quero apenas uma barra visual discreta.

==================================================
10. NÃO MOSTRAR PORCENTAGEM
==================================================

Não precisa mostrar:

34%
72%
98%

A barra visual é suficiente.

Se hoje algum exercício exibe percentual, avaliar remoção para manter consistência.

==================================================
11. COMO A BARRA PREENCHE
==================================================

A barra deve preencher de acordo com o tempo decorrido do BLOCO.

Sugestão:

progress =
elapsedTime / targetDuration

clamp entre 0 e 1.

Assim:

0 min → vazia

4 min → aproximadamente metade

8 min → cheia

Quando chegar a 100%, ela permanece cheia enquanto o paciente termina o desafio atual dentro da janela de tolerância até maxDuration.

Não quero que ela volte para trás.

Não quero que mude com acertos/erros.

==================================================
12. O QUE ACONTECE ENTRE 8 E 10 MIN
==================================================

Quando a barra já estiver cheia:

não precisa aparecer nenhum aviso alarmante.

O paciente pode continuar normalmente o desafio atual.

A barra permanece cheia.

Ao concluir:
→ encerra o exercício.

Se atingir maxDuration:
→ encerra pelo mecanismo definido para aquela atividade.

==================================================
13. VISUAL PADRÃO
==================================================

Quero a MESMA linguagem visual em todos os exercícios.

Definir:

- mesma altura;
- mesmo raio;
- mesma posição relativa;
- mesma aparência;
- mesma animação;
- mesma lógica responsiva.

Ela deve ser discreta.

Não deve dominar a interface.

A atividade é protagonista.

==================================================
14. POSIÇÃO
==================================================

Audite onde o progresso aparece atualmente nos outros exercícios e proponha UMA posição consistente.

Preferência:

próximo ao cabeçalho do exercício / parte superior da área do treino.

Não colocar em lugares diferentes em cada exercício sem necessidade.

Precisa funcionar:

- desktop;
- tablet;
- celular.

==================================================
15. NÃO CONFUNDIR COM PROGRESSO GLOBAL DA SESSÃO
==================================================

Verifique se a plataforma já possui outro indicador de:

quantos exercícios do dia foram realizados.

Se existir, são conceitos diferentes.

Temos:

A) PROGRESSO DO BLOCO DO EXERCÍCIO
→ esta barra de 8–10 min.

B) PROGRESSO GLOBAL DA SESSÃO
→ quantos exercícios/blocos foram realizados.

Não misturar os dois estados internamente.

Se visualmente a plataforma só precisa de um deles em determinada tela, preservar a arquitetura separada.

==================================================
16. EXERCÍCIOS COM DURAÇÃO DIFERENTE
==================================================

A exceção não deve ser codificada assim:

if exercise === "X" ...

Quero metadata/configuração.

Exemplo conceitual:

exerciseConfig = {
  torre: {
    targetDurationSec: 480,
    maxDurationSec: 600
  },

  gradeDedutiva: {
    targetDurationSec: 480,
    maxDurationSec: 600
  },

  algumExercicioRapido: {
    targetDurationSec: 300,
    maxDurationSec: 360
  }
}

Não usar necessariamente esses nomes.

Seguir arquitetura atual.

==================================================
17. PAUSA / TELA FORA DO EXERCÍCIO
==================================================

Auditar como a plataforma trata:

- aba em background;
- modal;
- tutorial;
- tela de instrução;
- pausa, caso exista;
- carregamento.

O tempo de TREINO deve começar quando o exercício efetivamente começa.

Tutorial/instruções prévias NÃO devem consumir a dose principal do treino.

Se a pessoa sair do exercício ou a sessão for suspensa, seguir o padrão global existente.

Não inventar comportamento sem verificar a arquitetura atual.

==================================================
18. TUTORIAL
==================================================

Tutorial é separado do tempo principal.

Fluxo:

TUTORIAL
↓
concluiu
↓
INICIA BLOCO REAL
↓
inicia contador da dose
↓
barra começa.

Se o paciente já concluiu tutorial anteriormente:

entra diretamente no exercício
↓
contador inicia.

==================================================
19. TROCA DE PROBLEMAS DENTRO DO MESMO EXERCÍCIO
==================================================

A barra NÃO reinicia a cada puzzle.

Exemplo Grade Dedutiva:

Problema 1
↓
Problema 2
↓
Problema focalizado
↓
Transferência

todos fazem parte do MESMO bloco.

A barra continua de onde estava.

Exemplo Torre:

Torre 1
↓
Torre 2
↓
Torre 3

mesma coisa.

Não resetar para zero em cada desafio.

==================================================
20. MOTOR ADAPTATIVO
==================================================

O motor adaptativo continua funcionando durante o bloco.

Exemplo:

0–3 min:
problema misto.

3–5 min:
focalizado.

5–8 min:
transferência.

Ao atingir targetDuration:

não iniciar novo ciclo adaptativo grande.

Usar o tempo restante apenas para finalizar adequadamente o que já está em andamento.

==================================================
21. REGISTRO
==================================================

Registrar por bloco:

- exerciseId;
- sessionId;
- startedAt;
- targetDuration;
- maxDuration;
- actualDuration;
- completedNormally;
- endedAtTarget;
- endedDuringGracePeriod;
- endedAtMaxDuration;
- interruptedChallengeId, se houver.

Não transformar automaticamente duração maior ou menor em indicador clínico.

==================================================
22. RETOMADA / RECARREGAMENTO
==================================================

Auditar o comportamento atual quando:

- página recarrega;
- navegador fecha;
- paciente volta;
- aplicação perde conexão.

Não quero que simplesmente recarregar a página faça a barra voltar para zero e permita sessão infinita.

A duração do bloco precisa ser persistida de forma coerente com a arquitetura existente.

Se isso exigir mudança de banco:
PARAR;
me mostrar;
fazer backup;
depois implementar.

==================================================
23. TORRE
==================================================

Na Torre:

restaurar/integrar esta barra global.

NÃO restaurar a barra antiga de proximidade da solução.

A barra deve continuar independente de:

- discos no lugar certo;
- número de movimentos;
- mínimo BFS;
- eficiência;
- reinícios.

==================================================
24. GRADE DEDUTIVA
==================================================

Na Grade:

usar exatamente a mesma barra.

NÃO calcular progresso por:

- células preenchidas;
- pistas riscadas;
- respostas corretas;
- percentual da solução.

É progresso temporal do bloco.

==================================================
25. EXERCÍCIOS JÁ EXISTENTES
==================================================

Antes de migrar tudo:

AUDITAR todos os exercícios.

Me mostrar uma tabela:

EXERCÍCIO
barra atual?
como calcula hoje?
duração atual?
usa wrapper global?
precisa migrar?
exceção temporal?

Quero descobrir inconsistências antes de substituir em massa.

==================================================
26. MIGRAÇÃO
==================================================

Depois da auditoria:

centralizar progressivamente.

Não quebrar exercícios que já possuem regras específicas.

Se alguma atividade NÃO puder usar a regra 8–10 min por natureza própria:

me explicar.

A exceção deve ser configurada explicitamente.

==================================================
27. TESTES OBRIGATÓRIOS
==================================================

Testar:

1. barra começa em zero quando começa o treino real;

2. tutorial não movimenta a barra;

3. barra progride com tempo;

4. respostas certas não alteram diretamente a barra;

5. respostas erradas não alteram diretamente a barra;

6. reiniciar desafio não zera barra;

7. mudar de puzzle não zera barra;

8. targetDuration enche a barra;

9. após target, barra permanece cheia;

10. ao concluir desafio após target, bloco encerra;

11. não iniciar novo problema longo depois do target;

12. maxDuration encerra bloco;

13. desafio interrompido por maxDuration não vira erro;

14. exercício curto usa a mesma barra com tempos menores;

15. desktop;

16. mobile;

17. recarregar não permite resetar indevidamente a dose;

18. Torre usa progresso temporal;

19. Grade Dedutiva usa progresso temporal;

20. progresso da solução da Torre continua inexistente.

==================================================
28. PRINCÍPIO CENTRAL
==================================================

Quero padronizar a experiência:

ENTRO EM UM EXERCÍCIO
↓
REALIZO UM BLOCO DE TREINO
↓
VEJO UMA BARRA DISCRETA AVANÇANDO
↓
POR VOLTA DA DOSE PLANEJADA O EXERCÍCIO TERMINA
↓
POSSO SEGUIR PARA OUTRO EXERCÍCIO.

Não quero que nenhum exercício possa ficar rodando indefinidamente simplesmente porque não existe um critério claro de encerramento.

==================================================
29. O QUE FAZER AGORA
==================================================

NÃO saia alterando todos os exercícios imediatamente.

Primeiro:

1. audite a implementação atual de progresso/duração;
2. liste todos os exercícios;
3. identifique qual componente já existe;
4. identifique duplicações;
5. identifique exceções;
6. proponha a arquitetura global;
7. mostre quais arquivos precisariam mudar;
8. diga se haverá alteração no banco;
9. proponha plano de migração em etapas.

Depois de eu aprovar essa auditoria, implementamos o componente global e migramos os exercícios.

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
