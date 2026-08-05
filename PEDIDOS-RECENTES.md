# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 21:09
A proposta da Fase T1 está aprovada. Seguem as decisões finais para os pontos pendentes.

==================================================
1. EXERCÍCIOS COM MECÂNICA REFORMULADA
==================================================

Aprovo a estratégia de versionamento diferenciado.

Para exercícios cuja mecânica foi significativamente reformulada — inicialmente:

- Vigilância;
- Agentes Focus;
- Informação em Foco;

a versão atual do tutorial deverá nascer como versão 2.

No backfill:

- pacientes com histórico recebem tutorialVersion = 1;
- portanto, deverão visualizar uma vez o novo tutorial da versão 2;
- isso é intencional, porque o histórico anterior não comprova conhecimento da mecânica atual.

Não reapresentar tutorial por mera alteração estética ou textual.

Antes de incluir outros exercícios nessa lista, comprovar que houve mudança real em:

- regra de resposta;
- estímulo-alvo;
- interação;
- sequência operacional;
- mecânica central.

==================================================
2. READY SCREEN DO SPAN
==================================================

Remover da tela de preparação qualquer antecipação do comprimento da sequência, incluindo textos como:

“5 dígitos”.

Isso já foi retirado do exercício porque fornece pista indevida sobre a quantidade de elementos.

A tela de preparação do Span pode mostrar:

- nome do exercício;
- nível atual, se necessário;
- Começar;
- Como funciona.

Não mostrar:

- quantidade de dígitos da próxima sequência;
- tamanho previsto;
- qualquer pista sobre a unidade que será apresentada.

No tutorial guiado, utilizar 2 dígitos apenas como micro-unidade didática, sem apresentar isso como nível clínico.

==================================================
3. UPDATEDAT DO EXERCISECONFIG
==================================================

Aceito que `updatedAt` seja alterado quando o tutorial for concluído, desde que seja comprovado que esse campo não é utilizado atualmente para:

- inferir treino recente;
- calcular progressão;
- bloquear exercício;
- produzir histórico clínico;
- ordenar tentativas;
- identificar última execução.

Antes da migration, faça uma busca completa pelos usos de `ExerciseConfig.updatedAt`.

Se alguma lógica clínica depender dele, pare e apresente o conflito antes de implementar.

A fonte para execução recente continua sendo `lastAttemptAt`, que a rota do tutorial não poderá alterar.

==================================================
4. CONFIG CRIADA PELO PLANO, SEM TENTATIVAS
==================================================

Se existir ExerciseConfig porque o terapeuta adicionou o exercício ao plano, mas:

`totalAttempts = 0`

o paciente deverá visualizar o tutorial obrigatório na primeira execução.

A mera existência do ExerciseConfig não significa que o exercício já foi realizado.

A regra é:

- histórico real de execução anterior → tutorial conhecido no backfill;
- configuração sem execução → tutorial obrigatório.

==================================================
5. ESCOPO DOS 15 EXERCÍCIOS SEM TUTORIAL
==================================================

Não criar os 15 tutoriais nesta fase.

Ordem aprovada:

FASE T1
- schema;
- migration;
- backfill;
- rota específica;
- contrato global;
- leitura do estado;
- tela de preparação;
- nenhum exercício convertido.

FASE T2
- pilotos:
  - Conecta Números;
  - Span Numérico Auditivo Direto.

FASE T3
- conversão dos demais em lotes separados por complexidade.

Sugestão de organização futura:

Lote simples visual:
- mecânicas com resposta única e feedback imediato.

Lote sequencial/memória:
- spans, matrizes, sequências e memória operacional.

Lote contínuo:
- exercícios CONTINUOUS_TIMED.

Lote planejamento/funcional:
- Restaurante, Supermercado, Estacionamento, Ordem da História e similares.

Lote especial:
- tutoriais próprios e mecânicas reformuladas.

Não fechar agora a composição exata dos lotes T3.

==================================================
6. VIGILÂNCIA, AGENTES FOCUS E INFORMAÇÃO EM FOCO
==================================================

Esses três exercícios não devem ser convertidos automaticamente depois dos pilotos.

Primeiro:

1. concluir e validar T1;
2. implementar os dois pilotos na T2;
3. validar a experiência real;
4. auditar individualmente esses tutoriais;
5. só então escrever a especificação de conversão.

Preservar integralmente as decisões clínicas de cada mecânica.

Em Vigilância, não introduzir pistas que revelem o alvo durante o treino real.

==================================================
7. COMUNICAÇÃO QUANDO HOUVER REDUÇÃO DE NÍVEL
==================================================

Quando ocorrer redução adaptativa real, a mensagem ao paciente deverá ser neutra:

“Treino concluído. Hoje esta atividade exigiu mais esforço.”

Pode haver uma segunda frase curta:

“Continue praticando no seu ritmo.”

Não informar na mensagem principal:

- que o nível caiu;
- que houve regressão;
- que o paciente piorou;
- comparação negativa com a sessão anterior.

O dado técnico da alteração de nível permanece disponível ao terapeuta.

Não esconder do terapeuta o que ocorreu.

==================================================
8. CENÁRIO FUNCIONAL E ESTRATÉGIAS
==================================================

Esses conteúdos não aparecem automaticamente antes do treino.

Dentro de “Como funciona”, organizar em divulgação progressiva:

1. Tutorial
2. Por que este treino?
3. Estratégias úteis

“Por que este treino?” apresenta o cenário funcional de maneira breve.

“Estratégias úteis” fica recolhido por padrão e deve conter apenas estratégias permitidas.

Não criar texto longo nem transformar “Como funciona” em uma aula obrigatória.

O paciente deve conseguir rever apenas o tutorial sem precisar atravessar todo o conteúdo textual.

==================================================
9. REDEFINIÇÃO DO TUTORIAL PELO TERAPEUTA
==================================================

Não implementar agora.

Registrar como funcionalidade futura na área de:

Evolução/histórico do paciente → exercício específico.

A ação será exclusiva do terapeuta e deverá:

- mostrar a versão concluída;
- mostrar a versão atual;
- permitir “Solicitar tutorial novamente”;
- exigir confirmação;
- não apagar histórico;
- não alterar nível;
- não alterar tentativas;
- não afetar progressão;
- não apagar a data anterior de execução clínica.

Não colocar essa ação dentro da prescrição rotineira.

==================================================
10. FASE T1 AUTORIZADA
==================================================

Pode iniciar exclusivamente a Fase T1.

Escopo:

- adicionar `tutorialCompletedAt DateTime?`;
- adicionar `tutorialVersion Int?`;
- criar migration e backfill aprovados;
- criar catálogo explícito de versões;
- criar contrato TypeScript do framework;
- criar rota específica de conclusão;
- incluir os campos na leitura já existente do paciente;
- criar lógica pura para decidir:
  - tutorial obrigatório;
  - tutorial já concluído;
  - versão desatualizada;
- criar a tela global de preparação, ainda sem converter os exercícios;
- testes correspondentes.

A rota de tutorial não poderá tocar:

- Session;
- currentDifficulty;
- lastAttemptAt;
- totalAttempts;
- progressão;
- achievements;
- alertas;
- métricas;
- histórico clínico;
- dose.

Antes de disparar o código, apresente:

1. arquivos exatos que serão alterados;
2. SQL exato da migration e do backfill;
3. resultado da busca sobre usos de `ExerciseConfig.updatedAt`;
4. testes de aceite;
5. estratégia de rollback.

Depois implemente a T1 em lote isolado.

Ao final:

- revisar o diff;
- rodar migration em ambiente seguro;
- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- provar o backfill;
- provar que a rota não toca campos clínicos;
- provar compatibilidade dos pacientes atuais;
- não converter ainda Conecta Números nem Span;
- não publicar automaticamente;
- parar para minha validação.

## 04/08/2026 21:14
Não execute ainda o db push nem o backfill no banco de produção.

Implemente a Fase T1 com:

- alteração do schema;
- rota específica;
- contratos e lógica pura;
- catálogo de versões;
- PreparationScreen;
- SQL de backfill documentado;
- testes.

Nesta etapa, execute apenas verificações que não alterem produção:

- prisma validate;
- prisma generate;
- TypeScript;
- suíte completa;
- build;
- testes unitários da lógica de backfill com dados simulados;
- revisão do diff.

Não aplique schema no banco.
Não execute SQL no banco.
Não publique.

Quero primeiro validar todo o código da T1.

Depois criaremos uma etapa separada e controlada para aplicação em produção, com:

1. backup confirmado;
2. verificação do estado atual do banco;
3. aplicação apenas dos dois campos opcionais;
4. reaplicação das três CHECK de Session;
5. conferência das constraints;
6. execução separada do backfill;
7. contagem antes e depois;
8. prova de que totalAttempts = 0 ficou intacto;
9. prova de que lastAttemptAt, currentDifficulty, totalAttempts e sessões não mudaram;
10. smoke test da leitura e da rota.

Também revise a estratégia de rollback.

Não considerar como rollback seguro simplesmente remover as colunas via db push.

O SQL:

UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = NULL,
    "tutorialVersion" = NULL
WHERE "tutorialCompletedAt" IS NOT NULL;

não é aceitável como rollback genérico depois que o sistema estiver em uso, porque apagaria também conclusões reais de tutorial feitas após a implantação.

Proponha uma estratégia segura para distinguir:

- registros preenchidos pelo backfill;
- registros concluídos realmente pelo paciente após a publicação.

Pode prosseguir agora somente com a implementação da T1 sem tocar no banco de produção.

## 04/08/2026 21:16
<task-notification>
<task-id>bffbdxmrc</task-id>
<tool-use-id>toolu_01LpbwQikac8rCs2pTYFLFMS</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bffbdxmrc.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o disparo" completed (exit code 0)</summary>
</task-notification>
