# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 15:45
A causa raiz está validada.

Autorize a correção emergencial imediata em produção.

Prioridade absoluta: restaurar o funcionamento do plano do terapeuta e do treino do paciente.

Implemente somente o hotfix mínimo:

1. Reverter temporariamente do schema.prisma:
   - tutorialCompletedAt;
   - tutorialVersion;
   - tutorialSource;
   - enum TutorialSource.

2. Remover temporariamente app/api/exercise-tutorial/route.ts, pois depende desses campos e ainda não está em uso.

3. Preservar os arquivos de lógica pura da T1 que não dependem do Prisma, para que o trabalho não seja perdido.

4. Substituir os .catch(() => {}) silenciosos:
   - na tela de plano do terapeuta;
   - na tela de treino do paciente.

Quando o carregamento falhar, mostrar estado de erro explícito e opção de tentar novamente.

Nunca transformar erro de API em:
- plano vazio;
- nível 1;
- ausência de bloqueio diário;
- estado inicial aparentemente válido.

5. Não executar db push.
6. Não executar SQL.
7. Não alterar dados existentes.
8. Não iniciar tutorial.
9. Não modificar progressão além do necessário para restaurar o comportamento anterior.

Testes obrigatórios:

- GET /api/patients/[id]?config=true retorna 200;
- plano salvo reaparece após sair e voltar;
- exercícios e settings permanecem;
- nível real do paciente é carregado;
- bloqueio de exercício já realizado no dia funciona;
- POST /api/sessions conclui sem 500;
- ExerciseConfig atualiza novamente:
  - currentDifficulty;
  - lastAttemptAt;
  - totalAttempts;
- Session continua sendo gravada;
- erro de carregamento gera mensagem visível, nunca estado vazio;
- TypeScript;
- suíte completa;
- build.

Depois:

1. fazer bump de versão de hotfix;
2. publicar imediatamente na Vercel;
3. confirmar appVersion, buildId, health e commit;
4. testar o paciente usado na reprodução;
5. confirmar que os exercícios salvos reapareceram;
6. confirmar que os dados do plano nunca foram apagados;
7. registrar o incidente e a causa no PROGRESSO.md.

Também faça uma auditoria dos registros criados desde a v2.73.0 para identificar:

- sessões gravadas antes do erro no upsert;
- ExerciseConfig que não foi atualizado;
- pacientes potencialmente afetados;
- possibilidade de reconstruir totalAttempts, lastAttemptAt e currentDifficulty a partir das Sessions já salvas.

Não faça qualquer correção de dados automaticamente.

Primeiro restaure produção. Depois apresente a auditoria e um plano de reparação separado.

Pode implementar e publicar o hotfix agora, sem nova espera para validação.

## 05/08/2026 15:57
Confirmei o hotfix em produção.

- os exercícios do plano reapareceram;
- o plano não estava apagado;
- a tela voltou a carregar corretamente.

Pode agora preparar a auditoria dos registros afetados desde a v2.73.0.

Quero apenas:

1. identificar quais sessões foram gravadas enquanto o ExerciseConfig falhava;
2. identificar pacientes e exercícios potencialmente afetados;
3. comparar Sessions com:
   - currentDifficulty;
   - lastAttemptAt;
   - totalAttempts;
4. propor uma reconstrução segura desses campos a partir do histórico existente;
5. mostrar exatamente quais dados seriam alterados;
6. não executar nenhuma correção automática;
7. não iniciar ainda a T1 do tutorial.

Apresente primeiro o diagnóstico e o plano de reparação.

## 05/08/2026 16:15
Autorizo executar apenas as três consultas de diagnóstico, em modo estritamente somente leitura, pelo SQL Editor do Supabase.

Objetivo:

- identificar quantas Sessions foram criadas durante a janela do incidente;
- identificar quais pacientes e exercícios foram afetados;
- comparar essas Sessions com os respectivos ExerciseConfig;
- calcular apenas os valores que seriam candidatos à reparação.

Regras obrigatórias:

1. Executar somente comandos SELECT.

2. Não executar:
- UPDATE;
- INSERT;
- DELETE;
- UPSERT;
- ALTER;
- CREATE;
- DROP;
- TRUNCATE;
- DO blocks;
- funções que produzam escrita;
- tabelas temporárias persistentes;
- qualquer correção automática.

3. Antes de executar, mostre as três consultas SQL completas para revisão.

4. Utilizar como janela exata do incidente:
- início: 04/08/2026 às 23:46;
- fim: 05/08/2026 às 15:51;
- confirmar antes qual timezone está armazenado no banco e converter corretamente para UTC, se necessário.

5. A saída deve informar, sem expor dados pessoais desnecessários:
- quantidade total de Sessions na janela;
- quantidade de pacientes afetados;
- quantidade de exercícios afetados;
- patientId e exerciseId apenas quando necessários para o reparo;
- total de sessões por paciente e exercício;
- estado atual do ExerciseConfig;
- totalAttempts atual;
- lastAttemptAt atual;
- currentDifficulty atual;
- valor proposto de totalAttempts;
- valor proposto de lastAttemptAt;
- metadata disponível para reconstrução de currentDifficulty;
- existência ou ausência de ExerciseConfig.

6. Para currentDifficulty:
- não propor inferência genérica;
- usar somente metadata explícito, como meta.nextLevel ou meta.endedLevel, quando houver garantia de qual campo representa o valor que deveria ter sido persistido;
- nos demais exercícios, marcar como “não reconstruir automaticamente”.

7. Não mostrar nomes, e-mails ou outros dados identificáveis na resposta. Use apenas IDs técnicos e contagens.

8. Depois das consultas, apresente:
- os resultados agregados;
- a lista exata de registros potencialmente reparáveis;
- quais campos podem ser reconstruídos com segurança;
- quais devem permanecer intocados;
- o SQL de reparação apenas como proposta, sem executar.

9. A T1 continua parada.

10. Nenhuma escrita poderá ocorrer antes de:
- backup lógico validado;
- restauração de teste;
- minha aprovação explícita do SQL final.

Pode preparar agora as consultas SELECT e apresentá-las antes da execução.
