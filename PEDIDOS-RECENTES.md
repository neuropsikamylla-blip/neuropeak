# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 15:27
Coletei as evidências:

1. Contador da tela:
- Total: [VALOR]
- Os cartões aparecem? [SIM/NÃO]

2. Console:
- Há erro vermelho? [SIM/NÃO]
- Mensagem: [TRECHO, SE HOUVER]

3. GET /api/patients/[id]?config=true:
- Status: [VALOR]
- Quantidade de trainingPlans: [VALOR]
- Campo exercises do primeiro plano: [LISTA / [] / AUSENTE]

Não corrigi nem salvei novamente o plano.
Pode localizar a causa raiz e propor a correção mínima.
Não iniciar T1 ainda.

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
