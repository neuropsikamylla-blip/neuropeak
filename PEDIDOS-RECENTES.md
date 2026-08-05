# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:27
Mantenha o script versionado em scripts/diagnostics/.

Antes de encerrar:

1. Remova qualquer patientId ou dado específico eventualmente embutido no script.
2. Mantenha apenas a janela do incidente e consultas genéricas.
3. Confirme que nenhuma credencial, URL de banco ou conteúdo do .env foi gravado no arquivo ou no commit.
4. Adicione no cabeçalho:
   - finalidade;
   - data do incidente;
   - caráter somente leitura;
   - como executar;
   - que a saída pode conter IDs técnicos e não deve ser compartilhada publicamente.
5. Registre no PROGRESSO.md que:
   - a auditoria encontrou zero sessões afetadas;
   - não há reparação de dados a executar;
   - Sessions e ExerciseConfig estavam sincronizados;
   - a T1 pode ser retomada após o procedimento de backup.

Depois disso, encerre oficialmente o incidente e pare.

Não execute nenhum UPDATE.
Não proponha reparação.
Não iniciar ainda a T1 até eu autorizar o próximo passo.

## 05/08/2026 16:30
Incidente encerrado e validado.

Produção está funcionando na v2.75.1, não houve sessões afetadas e não há reparação de dados a executar.

Pode retomar oficialmente a T1 do framework de tutorial.

Comece pelo T1.0, seguindo o procedimento operacional já aprovado:

1. instalar as ferramentas PostgreSQL necessárias;
2. gerar um pg_dump completo em formato custom;
3. validar a integridade do arquivo;
4. restaurar o backup em ambiente de teste, porque o backfill é alteração de nível 2;
5. conferir as contagens;
6. apresentar as evidências antes de qualquer alteração no banco de produção.

Não executar db push, backfill ou publicação antes de concluir e apresentar a validação do backup.

Depois da minha validação, seguimos para a implantação controlada da fundação da T1.

## 05/08/2026 16:35
Backup validado e aprovado.

Pode seguir para a próxima etapa da T1.0, ainda de forma controlada.

Primeiro execute apenas:

prisma migrate diff --script

Quero ver o SQL exato que será aplicado ao banco antes de qualquer alteração.

O resultado esperado é exclusivamente:

- criação do enum TutorialSource;
- adição de tutorialCompletedAt como coluna opcional;
- adição de tutorialVersion como coluna opcional;
- adição de tutorialSource como coluna opcional.

Pare imediatamente se aparecer qualquer:

- DROP;
- ALTER COLUMN;
- mudança de tipo;
- NOT NULL em coluna existente;
- remoção de constraint;
- alteração em tabela diferente de ExerciseConfig;
- qualquer operação não prevista.

Depois de apresentar o diff, não execute ainda o db push.

Também apresente, antes da aplicação:

1. o SQL exato para reaplicar as três CHECK de Session;
2. confirmação de que difficulty será 1–13;
3. consultas para verificar as constraints antes e depois;
4. ordem exata:
   - aplicar schema;
   - reaplicar CHECK;
   - validar constraints;
   - executar backfill separadamente;
5. plano de interrupção caso alguma etapa falhe.

Não iniciar conversão de exercícios.
Não publicar ainda.
Pare após apresentar o diff e o roteiro final de implantação.
