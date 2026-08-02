# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 18:42
pronto! agora voltamos para aquele comando que passei depois do focus ne?

## 02/08/2026 18:59
Antes de continuar a auditoria de carga, duração e modelos de execução, precisamos corrigir o inventário real das atividades.

NÃO implemente mudanças ainda.

NÃO altere código, banco, migrations, interface, progressão, duração ou exercícios.

Sua tarefa agora é verificar quais atividades são realmente ativas e disponíveis no aplicativo atualmente, separar aliases e modalidades e corrigir os nomes exibidos.

PROBLEMA IDENTIFICADO

A auditoria anterior encontrou 41 definições em EXERCISE_DEFINITIONS, porém a interface atual do aplicativo mostra 34 atividades clínicas.

Isso indica que as 41 definições podem incluir:

- aliases;
- variantes auditivas;
- IDs técnicos antigos;
- duplicações;
- exercícios inativos;
- exercícios em construção;
- exercícios concluídos, mas não disponíveis;
- nomes técnicos diferentes do nome exibido;
- rotas ou componentes sem entrada real no catálogo.

Antes de analisar carga cognitiva, duração ou protocolo, precisamos estabelecer uma fonte de verdade.

ATIVIDADES QUE APARECEM ATUALMENTE NA INTERFACE

Use esta lista como referência visual inicial, mas confirme tudo no código:

1. Span Numérico Auditivo Direto
2. Cores e Palavras
3. Focus Agents
4. Span Numérico Auditivo Inverso
5. Matriz Espacial
6. Matriz Espacial Inversa
7. Jogo da Memória
8. Conecta Números
9. Caminhos para a Meta
10. Informação em Foco
11. Rastreamento de Objetos
12. Dupla Tarefa
13. Tempo de Reação
14. Certo ou Errado
15. Semáforo
16. Busca Rápida
17. Jogo das Torres
18. Labirinto
19. Ordem da História
20. Compra Multifuncional
21. Task Switching
22. Grade Dedutiva
23. Letras em Sequência
24. Sequência de Itens
25. Matriz com Rotações
26. Lista com Distração
27. Restaurante
28. Supermercado
29. N-Back
30. Cubos
31. Vigilância
32. Identificação de Símbolos
33. Estacionamento Lógico
34. Investigadores da Situação Social

OBJETIVO PRINCIPAL

Descobrir com precisão:

- quais são as atividades clínicas reais;
- quais estão efetivamente ativas;
- quais aparecem para terapeuta;
- quais aparecem para paciente;
- quais são apenas aliases;
- quais são modalidades da mesma atividade;
- quais são componentes antigos;
- quais estão em construção;
- quais estão desativadas;
- quais possuem nomes técnicos diferentes dos nomes exibidos;
- quais definições anteriores não deveriam ter sido contadas como exercícios independentes.

NÃO CONSIDERE ALIAS COMO EXERCÍCIO INDEPENDENTE

Exemplos da auditoria anterior:

- focus-agents-auditivo;
- matriz-espacial-inversa tratada como alias;
- restaurante-ordem-auditivo;
- desafio-supermercado-auditivo;
- informação-em-foco;
- mudança-regras.

Verifique cuidadosamente se cada item é:

1. atividade clínica independente;
2. modalidade de uma atividade;
3. alias de rota;
4. componente reaproveitado;
5. definição antiga;
6. atividade efetivamente separada.

Uma modalidade auditiva ou visual não deve ser automaticamente contabilizada como um exercício novo.

NOMES OFICIAIS

Para cada atividade, identifique:

- ID técnico;
- nome exibido atual;
- nome correto desejado;
- rota;
- componente principal;
- status;
- categoria exibida;
- descrição exibida;
- ícone;
- aliases relacionados.

Não altere os nomes ainda.

Apenas marque divergências como:

- nome técnico diferente, mas aceitável;
- nome exibido incorreto;
- nome antigo;
- duplicação;
- tradução inconsistente;
- nome provisório;
- categoria possivelmente incorreta;
- descrição possivelmente incorreta.

STATUS OBRIGATÓRIOS

Classifique cada definição encontrada como uma destas opções:

- ACTIVE_CLINICAL_EXERCISE
- ACTIVE_EXERCISE_MODE
- ACTIVE_ALIAS
- IN_DEVELOPMENT
- INACTIVE
- LEGACY
- ORPHANED
- UNKNOWN

Definições classificadas como ACTIVE_EXERCISE_MODE ou ACTIVE_ALIAS não entram na contagem de exercícios clínicos.

MODALIDADES VISUAL E AUDITIVA

Precisamos distinguir dois conceitos diferentes.

CONCEITO 1 — MODALIDADE DA ATIVIDADE

A modalidade altera a forma cognitiva de apresentação da tarefa.

Exemplos:

- Visual;
- Visual + áudio;
- Somente áudio.

Atualmente, visualmente confirmamos essa escolha em:

- Restaurante;
- Supermercado.

Também deveria existir, conforme decisão clínica, em:

- Focus Agents;
- Compra Multifuncional.

Audite cada exercício e informe se possui ou deveria possuir:

- somente visual;
- visual + áudio;
- somente áudio;
- nenhuma escolha de modalidade.

Não implemente ainda.

Para cada exercício, explique se mudar a modalidade altera:

- o construto treinado;
- a carga cognitiva;
- a memória operacional;
- a demanda de leitura;
- a demanda auditiva;
- a dificuldade;
- a progressão;
- o registro de desempenho.

Não trate automaticamente “visual + áudio” como mais difícil. Em alguns pacientes, o áudio pode facilitar; em outros, pode aumentar interferência.

CONCEITO 2 — LEITURA ASSISTIVA

Existe um botão de som durante as atividades que pode ler o texto apresentado.

Essa função NÃO é uma modalidade do exercício.

Ela é um recurso de acessibilidade para ler:

- instruções;
- comandos;
- perguntas;
- alternativas;
- textos auxiliares;
- feedback, quando apropriado.

Audite:

- em quais exercícios o botão já existe;
- quais textos ele lê;
- qual mecanismo de voz é usado;
- se utiliza speechSynthesis, áudio gravado ou outro mecanismo;
- se a leitura pode ser repetida;
- se há limitação;
- se o uso é registrado;
- se interfere na progressão;
- se o botão aparece mesmo em exercícios sem texto;
- se a leitura continua quando a tela muda;
- se existe cancelamento da fala;
- se há sobreposição de áudios;
- se o paciente pode clicar várias vezes;
- se o componente é global ou duplicado por exercício.

A leitura assistiva deve ser planejada futuramente para todos os exercícios que contenham texto relevante, sem transformar a atividade em modalidade auditiva.

EXEMPLO DA DIFERENÇA

Supermercado — modo Somente áudio:
- a lista deve ser memorizada auditivamente;
- a modalidade faz parte da tarefa;
- deve afetar classificação, carga e métricas.

Supermercado — botão de leitura assistiva:
- o sistema apenas lê uma instrução ou texto visível;
- é acessibilidade;
- não deve automaticamente transformar o exercício em auditivo.

Essa distinção deve aparecer na arquitetura e no modelo de dados.

AUDITORIA DA LISTA DE 41 DEFINIÇÕES

Para cada uma das 41 definições encontradas anteriormente, mostre:

- ID;
- nome;
- componente;
- rota;
- aparece no catálogo?;
- aparece no plano terapêutico?;
- aparece para o paciente?;
- possui execução funcional?;
- possui histórico?;
- possui progressão?;
- é atividade independente?;
- é alias?;
- é modalidade?;
- status final;
- exercício clínico principal ao qual pertence;
- justificativa.

Depois, apresente a contagem corrigida:

- número de atividades clínicas ativas;
- número de modalidades;
- número de aliases;
- número em desenvolvimento;
- número inativo;
- número legado;
- número órfão;
- número desconhecido.

CONFIRME A LISTA VISUAL DE 34

Compare as 34 atividades fornecidas com o código e responda:

1. Todas as 34 existem e estão ativas?
2. Alguma está apenas visualmente listada, mas sem execução funcional?
3. Alguma atividade ativa não aparece nos prints?
4. Alguma das 41 definições deveria entrar como uma 35ª atividade?
5. Alguma das 34 é apenas modalidade ou alias e não atividade real?
6. Alguma aparece com nome incorreto?
7. Alguma aparece na categoria cognitiva errada?
8. Alguma descrição exibida não corresponde ao exercício real?

ARQUIVOS A CRIAR

Crie:

docs/auditoria-plano-terapeutico/13-inventario-real-atividades.md

Inclua a tabela completa das definições técnicas e seus status.

Crie:

docs/auditoria-plano-terapeutico/14-nomes-oficiais.md

Inclua:

- nome técnico;
- nome atual;
- nome correto recomendado;
- justificativa;
- alteração necessária ou não.

Crie:

docs/auditoria-plano-terapeutico/15-modalidades-e-acessibilidade.md

Inclua:

- modalidades por exercício;
- diferenças entre modalidade e leitura assistiva;
- exercícios com visual;
- exercícios com visual + áudio;
- exercícios com somente áudio;
- exercícios que deveriam receber essas opções;
- presença atual do botão de leitura;
- arquitetura atual;
- proposta futura de componente global de leitura assistiva;
- riscos cognitivos e técnicos;
- decisões clínicas pendentes.

Crie:

docs/auditoria-plano-terapeutico/16-lista-canonica.md

Esse arquivo deve apresentar uma lista canônica provisória das atividades clínicas reais, com:

- canonicalExerciseId;
- nome oficial;
- status;
- categoria;
- modalidades;
- aliases;
- componente;
- rota;
- aparece para terapeuta;
- aparece para paciente.

Não altere ainda EXERCISE_DEFINITIONS.

RELATÓRIO NO TERMINAL

Ao final, mostre:

1. Quantidade corrigida de exercícios clínicos ativos.
2. Lista completa dos nomes oficiais.
3. Quais das 41 definições não são exercícios independentes.
4. Quais exercícios aparecem nos prints, mas possuem problema técnico.
5. Quais exercícios ativos estavam ausentes dos prints.
6. Quais nomes estão incorretos.
7. Quais categorias estão incorretas.
8. Quais descrições estão incorretas.
9. Quais possuem seleção real de modalidade.
10. Quais deveriam possuir seleção de modalidade.
11. Quais possuem leitura assistiva.
12. Quais não possuem, mas contêm texto que deveria poder ser lido.
13. Diferenças entre a contagem anterior de 41 e a contagem clínica real.

REGRAS

- Não implementar.
- Não corrigir nomes.
- Não mudar catálogo.
- Não mudar rotas.
- Não remover aliases.
- Não adicionar áudio.
- Não alterar progressão.
- Não alterar banco.
- Não criar migration.
- Não instalar dependências.
- Não fazer commit.
- Não fazer push.
- Apenas analisar, documentar e relatar.

Ao terminar, pare e aguarde nossa validação.

## 02/08/2026 19:18
salve tudo pois irei trocar de conta para continuarmos desse mesmo lugar
