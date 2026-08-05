# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 15:30
Consegui reproduzir novamente e agora há evidência visual.

Fluxo:

1. Adicionei 2 exercícios:
   - Span Numérico Auditivo Direto;
   - Span Numérico Auditivo Inverso.

2. Antes de salvar:
   - os dois aparecem selecionados;
   - o painel mostra Total: 2;
   - a análise do plano é gerada normalmente.

3. Cliquei em Salvar plano.
4. O sistema mostrou: “Plano salvo com sucesso!”
5. Saí da página.
6. Entrei novamente no mesmo paciente e na montagem do plano.

Resultado:

- os exercícios não aparecem selecionados;
- o painel mostra Total: 0;
- aparece “Nenhum exercício ainda”.

Portanto, não é o problema de Total maior que zero com cartões invisíveis.

O estado está chegando vazio quando a tela é reaberta.

Quero que você investigue agora com base nessa reprodução concreta:

1. Capture o payload exato enviado no PATCH ao salvar esses dois exercícios.
2. Capture a resposta do PATCH.
3. Consulte imediatamente o registro persistido após o salvamento.
4. Confirme o valor real do campo exercises no plano salvo.
5. Reabra a tela e capture o GET /api/patients/[id]?config=true.
6. Confirme quantos trainingPlans vêm na resposta.
7. Confirme qual plano foi escolhido pela interface.
8. Confirme o valor de exercises desse plano.
9. Verifique especialmente o `take: 1` sem `orderBy`, porque o sistema pode estar carregando outro plano ativo, antigo ou vazio.
10. Verifique também se o GET falha e o `.catch(() => {})` transforma a falha em estado vazio.

Quero a causa raiz comprovada com o plano real.

Não iniciar T1.
Não tocar no banco.
Não publicar correção por hipótese.
Pare após apresentar a causa e a correção mínima proposta.[Image #63] [Image #64]

## 05/08/2026 15:37
Temos a evidência que faltava.

Ao abrir diretamente:

GET /api/patients/cmpq1brmw000196enmgs7z6d4?config=true

a resposta foi:

{"error":"Erro interno do servidor"}

Portanto, o problema não deve ser tratado como perda de persistência até prova em contrário.

A tela está recebendo erro 500 e provavelmente o `.catch(() => {})` está convertendo a falha em estado vazio, fazendo parecer que os exercícios desapareceram.

Agora investigue prioritariamente a causa do 500.

Quero:

1. localizar o erro real nos logs da Vercel para essa chamada;
2. identificar a exceção original e o stack trace;
3. reproduzir o GET localmente com esse patientId;
4. verificar qual parte do include de `?config=true` falha;
5. confirmar se a falha foi introduzida pela v2.75.0 ou se já existia antes;
6. verificar especialmente incompatibilidade entre:
   - schema Prisma atual;
   - banco ainda sem os campos da T1;
   - `exerciseConfigs: includeConfig`;
   - enum/tutorial fields ainda não aplicados;
   - qualquer select/include que agora espere coluna inexistente.

Não corrija por hipótese.

Depois de localizar a causa:

- proponha a correção mínima;
- preserve os exercícios já salvos;
- remova o `.catch(() => {})` silencioso ou substitua por tratamento visível de erro;
- adicione teste de regressão para GET com `config=true`;
- adicione teste de UX para impedir que erro de API apareça como plano vazio.

Não iniciar T1.
Não executar db push.
Não tocar no banco antes de provar a causa.
Pare para minha validação antes de publicar.

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
