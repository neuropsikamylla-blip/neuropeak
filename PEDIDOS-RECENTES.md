# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 20:52
A análise está aprovada, com as seguintes decisões.

==================================================
1. MODELAGEM E ROTA
==================================================

Aprovo utilizar ExerciseConfig, que já possui a granularidade correta por paciente e exercício.

Adicionar futuramente:

- tutorialCompletedAt;
- tutorialVersion.

Aprovo uma rota específica para conclusão do tutorial.

Não utilizar /api/sessions para registrar tutorial.

A rota do tutorial não poderá tocar:

- Session;
- currentDifficulty;
- lastAttemptAt;
- totalAttempts;
- progressão;
- achievements;
- alertas;
- métricas clínicas;
- dose realizada.

A separação deve ser garantida por arquitetura e testes.

==================================================
2. PACIENTES ATUAIS
==================================================

Pacientes que já possuem histórico real naquele exercício não devem ser obrigados a rever automaticamente o tutorial após a migration.

Na transição inicial:

- se o paciente já tiver totalAttempts > 0 ou evidência equivalente de execução real naquele exercício, considerar o tutorial conhecido;
- se nunca tiver executado o exercício, tutorial obrigatório no primeiro acesso;
- todos continuam podendo acessar “Como funciona” voluntariamente.

Essa inferência pelo histórico será utilizada somente na transição inicial.

Depois da migration, a fonte de verdade passa a ser:

- tutorialCompletedAt;
- tutorialVersion.

Não continuar inferindo indefinidamente pelo número de tentativas.

Documentar claramente como será feito o backfill, sem alterar:

- tentativas;
- níveis;
- progresso;
- datas de treino;
- sessões anteriores.

==================================================
3. VERSIONAMENTO
==================================================

Cada tutorial terá uma versão explícita.

O tutorial será considerado concluído quando:

tutorialVersion concluída pelo paciente
=
versão atual exigida pelo exercício.

Uma alteração apenas visual ou textual não deve obrigar reapresentação.

Somente uma mudança relevante da mecânica, da regra de resposta ou da forma de interação poderá aumentar a versão obrigatória.

Não criar aumento automático de versão por deploy.

A versão deverá ser definida explicitamente no catálogo ou contrato do tutorial.

==================================================
4. EXERCÍCIOS CONTINUOUS_TIMED
==================================================

Para exercícios cronometrados, “Sua vez” não significa executar o protocolo completo.

Utilizar uma micro-unidade guiada representativa da mecânica.

Exemplos:

- Vigilância: sequência curta contendo um alvo;
- Informação em Foco: uma questão completa;
- Tempo de Reação: poucos estímulos;
- Rastreamento de Objetos: uma rodada curta;
- Cores e Palavras: pequeno bloco de respostas.

A unidade guiada deve apenas confirmar que o paciente compreendeu:

- qual estímulo observar;
- qual resposta emitir;
- quando responder;
- quando não responder, quando aplicável.

Ela não deve:

- usar a duração clínica do protocolo;
- consumir a dose prescrita;
- alterar nível;
- contar como tentativa;
- registrar precisão ou tempo de reação;
- entrar no histórico clínico;
- afetar progressão.

Se houver erro, repetir somente essa micro-unidade com uma orientação curta.

Não reiniciar toda a demonstração.

==================================================
5. EXERCÍCIOS SEM TUTORIAL
==================================================

Registrar explicitamente que 15 exercícios ainda não possuem tutorial.

Não criar os 15 de uma vez.

Primeiro implementar e validar o framework e os dois pilotos.

Após validação, converter os exercícios restantes em lotes, respeitando a mecânica específica de cada um.

Não transformar tutorial em animação genérica.

O tutorial deve reproduzir a regra real do exercício.

==================================================
6. TUTORIAIS FORA DO CONTRATO
==================================================

Os cinco tutoriais próprios — Agentes Focus, Informação em Foco, Vigilância, Cores e Palavras e Padrões com Rotação — devem ser auditados individualmente antes da conversão.

Não substituir automaticamente sua lógica pelo framework.

Em especial, preservar as decisões clínicas da Vigilância:

- o alvo é apresentado conforme a regra definida;
- não introduzir pistas durante o treino;
- não repetir informação que descaracterize o construto.

O framework deve controlar o fluxo global, mas permitir que cada exercício forneça sua demonstração real e sua unidade guiada específica.

==================================================
7. PILOTOS
==================================================

Aprovo os dois pilotos:

1. Conecta Números
- caso visual simples;
- já compartilha componentes com o jogo;
- valida o fluxo global com menor risco.

2. Span Numérico Auditivo Direto
- caso auditivo;
- atualmente sem tutorial;
- valida estímulo sonoro, repetição guiada e ausência de apoio visual indevido.

Os pilotos precisam provar:

- primeira utilização obrigatória;
- acesso seguinte direto à tela de preparação;
- botão “Como funciona”;
- persistência entre dispositivos;
- versionamento;
- tutorial sem impacto clínico;
- repetição apenas da tentativa guiada em caso de erro.

==================================================
8. PRÓXIMA ENTREGA
==================================================

Ainda não implementar.

Atualize o documento arquitetônico com estas decisões e apresente:

1. schema exato proposto;
2. estratégia de migration e backfill;
3. contrato TypeScript do framework;
4. formato da versão do tutorial;
5. contrato da micro-unidade guiada;
6. fluxo completo do Conecta Números;
7. fluxo completo do Span Numérico Auditivo Direto;
8. arquivos previstos para a Fase T1;
9. testes obrigatórios da Fase T1;
10. riscos que ainda dependem da minha decisão.

Também liste claramente as outras decisões clínicas pendentes mencionadas no documento que não apareceram no resumo da resposta.

Não implementar.
Não publicar.
Pare após a proposta detalhada da Fase T1.

## 04/08/2026 21:02
A análise está aprovada, com as seguintes decisões.

==================================================
1. MODELAGEM E ROTA
==================================================

Aprovo utilizar ExerciseConfig, que já possui a granularidade correta por paciente e exercício.

Adicionar futuramente:

- tutorialCompletedAt;
- tutorialVersion.

Aprovo uma rota específica para conclusão do tutorial.

Não utilizar /api/sessions para registrar tutorial.

A rota do tutorial não poderá tocar:

- Session;
- currentDifficulty;
- lastAttemptAt;
- totalAttempts;
- progressão;
- achievements;
- alertas;
- métricas clínicas;
- dose realizada.

A separação deve ser garantida por arquitetura e testes.

==================================================
2. PACIENTES ATUAIS
==================================================

Pacientes que já possuem histórico real naquele exercício não devem ser obrigados a rever automaticamente o tutorial após a migration.

Na transição inicial:

- se o paciente já tiver totalAttempts > 0 ou evidência equivalente de execução real naquele exercício, considerar o tutorial conhecido;
- se nunca tiver executado o exercício, tutorial obrigatório no primeiro acesso;
- todos continuam podendo acessar “Como funciona” voluntariamente.

Essa inferência pelo histórico será utilizada somente na transição inicial.

Depois da migration, a fonte de verdade passa a ser:

- tutorialCompletedAt;
- tutorialVersion.

Não continuar inferindo indefinidamente pelo número de tentativas.

Documentar claramente como será feito o backfill, sem alterar:

- tentativas;
- níveis;
- progresso;
- datas de treino;
- sessões anteriores.

==================================================
3. VERSIONAMENTO
==================================================

Cada tutorial terá uma versão explícita.

O tutorial será considerado concluído quando:

tutorialVersion concluída pelo paciente
=
versão atual exigida pelo exercício.

Uma alteração apenas visual ou textual não deve obrigar reapresentação.

Somente uma mudança relevante da mecânica, da regra de resposta ou da forma de interação poderá aumentar a versão obrigatória.

Não criar aumento automático de versão por deploy.

A versão deverá ser definida explicitamente no catálogo ou contrato do tutorial.

==================================================
4. EXERCÍCIOS CONTINUOUS_TIMED
==================================================

Para exercícios cronometrados, “Sua vez” não significa executar o protocolo completo.

Utilizar uma micro-unidade guiada representativa da mecânica.

Exemplos:

- Vigilância: sequência curta contendo um alvo;
- Informação em Foco: uma questão completa;
- Tempo de Reação: poucos estímulos;
- Rastreamento de Objetos: uma rodada curta;
- Cores e Palavras: pequeno bloco de respostas.

A unidade guiada deve apenas confirmar que o paciente compreendeu:

- qual estímulo observar;
- qual resposta emitir;
- quando responder;
- quando não responder, quando aplicável.

Ela não deve:

- usar a duração clínica do protocolo;
- consumir a dose prescrita;
- alterar nível;
- contar como tentativa;
- registrar precisão ou tempo de reação;
- entrar no histórico clínico;
- afetar progressão.

Se houver erro, repetir somente essa micro-unidade com uma orientação curta.

Não reiniciar toda a demonstração.

==================================================
5. EXERCÍCIOS SEM TUTORIAL
==================================================

Registrar explicitamente que 15 exercícios ainda não possuem tutorial.

Não criar os 15 de uma vez.

Primeiro implementar e validar o framework e os dois pilotos.

Após validação, converter os exercícios restantes em lotes, respeitando a mecânica específica de cada um.

Não transformar tutorial em animação genérica.

O tutorial deve reproduzir a regra real do exercício.

==================================================
6. TUTORIAIS FORA DO CONTRATO
==================================================

Os cinco tutoriais próprios — Agentes Focus, Informação em Foco, Vigilância, Cores e Palavras e Padrões com Rotação — devem ser auditados individualmente antes da conversão.

Não substituir automaticamente sua lógica pelo framework.

Em especial, preservar as decisões clínicas da Vigilância:

- o alvo é apresentado conforme a regra definida;
- não introduzir pistas durante o treino;
- não repetir informação que descaracterize o construto.

O framework deve controlar o fluxo global, mas permitir que cada exercício forneça sua demonstração real e sua unidade guiada específica.

==================================================
7. PILOTOS
==================================================

Aprovo os dois pilotos:

1. Conecta Números
- caso visual simples;
- já compartilha componentes com o jogo;
- valida o fluxo global com menor risco.

2. Span Numérico Auditivo Direto
- caso auditivo;
- atualmente sem tutorial;
- valida estímulo sonoro, repetição guiada e ausência de apoio visual indevido.

Os pilotos precisam provar:

- primeira utilização obrigatória;
- acesso seguinte direto à tela de preparação;
- botão “Como funciona”;
- persistência entre dispositivos;
- versionamento;
- tutorial sem impacto clínico;
- repetição apenas da tentativa guiada em caso de erro.

==================================================
8. PRÓXIMA ENTREGA
==================================================

Ainda não implementar.

Atualize o documento arquitetônico com estas decisões e apresente:

1. schema exato proposto;
2. estratégia de migration e backfill;
3. contrato TypeScript do framework;
4. formato da versão do tutorial;
5. contrato da micro-unidade guiada;
6. fluxo completo do Conecta Números;
7. fluxo completo do Span Numérico Auditivo Direto;
8. arquivos previstos para a Fase T1;
9. testes obrigatórios da Fase T1;
10. riscos que ainda dependem da minha decisão.

Também liste claramente as outras decisões clínicas pendentes mencionadas no documento que não apareceram no resumo da resposta.

Não implementar.
Não publicar.
Pare após a proposta detalhada da Fase T1.

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
