# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 02/08/2026 17:30
Analise integralmente este projeto antes de modificar qualquer arquivo.

Estamos reorganizando o sistema de criação de planos de treinamento cognitivo da área do terapeuta. Neste primeiro momento, NÃO implemente mudanças, NÃO altere componentes, NÃO faça refatorações e NÃO apague nenhuma lógica existente.

Sua tarefa agora é realizar uma auditoria técnica e funcional completa do sistema atual e produzir uma proposta estruturada para análise conjunta.

CONTEXTO CLÍNICO E FUNCIONAL

O aplicativo possui uma área do terapeuta na qual o profissional cria um plano de treinamento para cada paciente.

O terapeuta define:

1. A duração total prevista de cada sessão:
   - 20 minutos;
   - 30 minutos;
   - 40 minutos.

2. A frequência semanal:
   - 1 vez por semana;
   - 2 vezes por semana;
   - 3 vezes por semana;
   - 4 vezes por semana;
   - 5 vezes por semana.

3. Os exercícios que farão parte do plano.

4. Quando clinicamente necessário, alguns parâmetros específicos de determinados exercícios.

O paciente posteriormente define, junto ao terapeuta, os dias da semana em que realizará o treino. Exemplo:

- duração da sessão: 30 minutos;
- frequência: 3 vezes por semana;
- dias: segunda-feira, quarta-feira e sexta-feira.

O nível dos exercícios é adaptativo. O paciente deve sempre retomar do ponto em que parou ou, quando a regra adaptativa indicar, de um nível imediatamente anterior. Não deve existir para o paciente a escolha entre “continuar” e “recomeçar”.

PROBLEMA ATUAL

Atualmente, alguns exercícios possuem configuração por quantidade de tentativas, como:

- 10 tentativas;
- 15 tentativas;
- 20 tentativas;
- 30 tentativas.

Essa lógica não parece adequada para todos os exercícios.

O número de tentativas não representa uma dose cognitiva equivalente entre pacientes, pois:

- um paciente pode completar 10 tentativas rapidamente;
- outro pode levar muito mais tempo para completar as mesmas 10 tentativas;
- exercícios de planejamento exigem tempo para análise, elaboração de estratégia e execução;
- exercícios rápidos e repetitivos podem gerar muitas tentativas em poucos minutos;
- exercícios intensos, como tarefas semelhantes ao Stroop, podem gerar fadiga se permanecerem ativos por muito tempo.

Precisamos substituir a lógica genérica de “tentativas” por uma arquitetura que considere a natureza de cada exercício.

HIPÓTESE DE NOVA ARQUITETURA

Inicialmente, considere três modelos principais de execução.

MODELO A — EXERCÍCIOS CONTÍNUOS

São exercícios compostos por várias rodadas curtas e que podem ser encerrados entre uma rodada e outra sem prejudicar a atividade.

Possíveis exemplos:

- atenção seletiva;
- atenção sustentada;
- velocidade de processamento;
- memória visual;
- memória operacional;
- vigilância;
- tarefas de busca visual;
- tarefas de comparação rápida;
- spans auditivos, caso a análise técnica e clínica indique que pertencem a esta categoria.

Controle sugerido:

- duração por tempo;
- valores configuráveis dentro de uma faixa segura;
- o exercício não deve encerrar no meio de uma rodada;
- ao atingir o tempo, deve concluir a rodada atual e então finalizar.

MODELO B — EXERCÍCIOS DE RESOLUÇÃO OU PLANEJAMENTO

São exercícios em que o paciente precisa analisar um problema e concluir um desafio completo.

Possíveis exemplos:

- Torre de Hanói;
- Estacionamento Lógico;
- labirintos;
- quebra-cabeças;
- exercícios de planejamento de atividades;
- outros exercícios que não devem ser interrompidos no meio de uma solução.

Controle sugerido:

- janela de execução por tempo, por exemplo 8, 10, 12 ou 15 minutos;
- quando o tempo for atingido, não iniciar um novo desafio;
- permitir que o paciente finalize o desafio em andamento;
- registrar separadamente:
  - tempo total;
  - número de desafios iniciados;
  - número de desafios concluídos;
  - número de movimentos;
  - eficiência;
  - erros;
  - desistências;
  - tempo de planejamento;
  - tempo de execução, quando tecnicamente possível.

MODELO C — EXERCÍCIOS FECHADOS OU DE ALTA FADIGA

São exercícios que devem possuir uma dose fixa ou uma faixa bastante restrita, pois uma duração longa pode gerar fadiga, automatização excessiva ou perda de qualidade.

Possíveis exemplos:

- Cores e Palavras, semelhante ao Stroop;
- exercícios com alternância intensa de regra;
- tarefas de forte interferência;
- outros exercícios com carga elevada por minuto.

Controle sugerido:

- duração fixa definida pelo próprio exercício;
- ou pequena faixa configurável;
- o terapeuta apenas inclui ou não inclui o exercício;
- evitar exposição excessiva.

IMPORTANTE

Essas categorias ainda são hipóteses. Você deve analisar cada exercício existente no código e determinar se essa classificação é adequada.

Não force todos os exercícios em apenas três categorias caso o projeto demonstre a necessidade de uma quarta categoria.

Uma possível quarta categoria seria:

MODELO D — EXERCÍCIOS POR BLOCO OU PROTOCOLO

Exercícios que só fazem sentido quando executados como um conjunto fechado de blocos, listas, sequências ou etapas.

Exemplos possíveis:

- determinados spans;
- tarefas com número mínimo de séries necessário para adaptação;
- exercícios cujo algoritmo depende de um bloco fechado para calcular progressão.

Caso identifique essa necessidade, explique claramente quais exercícios pertencem a essa categoria e por quê.

CARGA COGNITIVA

Também precisamos criar um sistema de classificação da carga cognitiva de cada exercício.

Não use uma classificação arbitrária baseada apenas na aparência do exercício.

Analise, para cada treino:

- domínio cognitivo principal;
- domínios cognitivos secundários;
- intensidade cognitiva por minuto;
- quantidade de interferência;
- demanda de memória operacional;
- demanda atencional;
- velocidade exigida;
- necessidade de planejamento;
- necessidade de inibição;
- necessidade de alternância de regra;
- fadiga provável;
- carga visual;
- carga auditiva;
- carga motora;
- complexidade das instruções;
- possibilidade de frustração;
- tempo esperado para adaptação;
- adequação para uso consecutivo com outros exercícios.

Proponha uma escala de carga simples, compreensível para o sistema e para o terapeuta.

Preferência inicial:

- carga 1: baixa;
- carga 2: moderada;
- carga 3: alta.

Entretanto, analise se uma escala de 1 a 5 seria tecnicamente mais útil. Não escolha cinco níveis apenas para parecer mais detalhado. Escolha a escala que realmente apresentar melhor utilidade clínica e computacional.

A classificação de carga deve poder ajudar o sistema a evitar sessões como:

- três exercícios de alta interferência seguidos;
- dois exercícios auditivos intensos consecutivos;
- excesso de tarefas de velocidade;
- excesso de tarefas longas de planejamento;
- sessão inteira concentrada no mesmo domínio;
- duração total incompatível com a prescrição.

A carga não deve impedir o terapeuta de montar o plano. Ela deve inicialmente:

- informar;
- alertar;
- sugerir redistribuições;
- indicar possíveis excessos;
- nunca substituir automaticamente a decisão clínica sem autorização.

DURAÇÃO DOS EXERCÍCIOS

Analise o “~7 min” atualmente mostrado nos cards dos exercícios.

Não remova automaticamente essa informação.

Determine de onde esse valor é obtido atualmente:

- valor fixo;
- estimativa estática;
- parâmetro do exercício;
- cálculo baseado em tentativas;
- texto hardcoded;
- configuração do terapeuta;
- outro mecanismo.

A proposta futura deverá distinguir:

1. Exercício ainda não configurado:
   - mostrar uma faixa recomendada real, por exemplo “3–6 min”;
   - ou “duração fixa: 4 min”;
   - ou “até 12 min”.

2. Exercício configurado:
   - mostrar a duração efetivamente prescrita, por exemplo “5 min”.

3. Exercício de planejamento:
   - mostrar “até 12 min”;
   - o exercício encerra após a conclusão do desafio em andamento.

4. Exercício fechado:
   - mostrar “duração fixa: 4 min”.

5. Exercício por bloco:
   - mostrar uma estimativa, como “aprox. 5–7 min”, caso o tempo dependa do desempenho.

O tempo total estimado do plano deve ser calculado com base nas configurações reais e não por uma estimativa genérica de 7 minutos para todos os exercícios.

SESSÃO DE 20, 30 OU 40 MINUTOS

Analise como o sistema atualmente lida com o total da sessão.

Precisamos evitar dois problemas:

1. O terapeuta selecionar exercícios cuja soma ultrapasse excessivamente a duração da sessão.

2. O terapeuta selecionar poucos exercícios, deixando uma sessão muito abaixo da duração prescrita.

A proposta deve considerar:

- duração-alvo da sessão;
- tolerância aceitável de diferença;
- exercícios que podem ultrapassar alguns minutos porque o paciente precisa concluir a rodada ou desafio;
- exercícios com tempo fixo;
- exercícios com tempo estimado;
- intervalos ou transições entre exercícios;
- possibilidade de o paciente ser muito rápido ou muito lento;
- limite máximo seguro de duração real.

Avalie se devemos trabalhar com:

- duração-alvo;
- duração mínima estimada;
- duração máxima estimada;
- margem operacional;
- tempo de transição.

Exemplo conceitual:

- sessão prescrita: 30 minutos;
- duração-base dos exercícios: 28 minutos;
- margem operacional: 2 a 4 minutos;
- limite esperado: aproximadamente 30 a 34 minutos.

Não adote esses números sem analisar. Eles são apenas um exemplo.

NÍVEL INICIAL E ADAPTAÇÃO

Na interface atual existe um controle “Nível inicial”, aparentemente de 1 a 10.

Analise:

- como o nível inicial é salvo;
- como o nível atual do paciente é salvo;
- como ocorre subida e descida;
- quais exercícios usam escala de 1 a 10;
- quais possuem outra estrutura;
- se há inconsistências;
- se o terapeuta realmente precisa escolher numericamente o nível;
- se a seleção do nível inicial interfere na retomada posterior.

Princípios que devem ser preservados:

- o paciente não deve escolher reiniciar;
- o paciente retoma automaticamente de onde parou;
- quando a regra adaptativa determinar, pode retomar um nível abaixo;
- o terapeuta pode precisar definir o ponto inicial apenas na primeira prescrição ou após uma reavaliação;
- qualquer redefinição de nível precisa ser uma ação explícita do terapeuta;
- não apagar o histórico do paciente sem confirmação.

Não implemente ainda a sugestão de “muito fácil, fácil, médio, difícil e muito difícil”. Apenas avalie se isso seria melhor do que números e explique as vantagens e limitações.

REPETIÇÃO DE ÁUDIO

Nos exercícios auditivos existe uma opção “Repetir áudio: Sim/Não”.

Analise:

- em quais exercícios essa opção existe;
- como funciona;
- se repetir o áudio altera substancialmente a carga cognitiva;
- se a repetição deve ser uma configuração clínica;
- se deveria existir limite de repetição;
- se a repetição deveria contar como ajuda;
- se deveria interferir na progressão;
- se deveria ser liberada apenas em determinados perfis ou fases;
- se o exercício deixa de medir/treinar o mesmo construto quando há repetição livre.

Não altere essa função ainda. Apresente uma recomendação fundamentada na lógica do treino.

ENTREGÁVEIS OBRIGATÓRIOS

Crie uma pasta de documentação, caso ainda não exista:

docs/auditoria-plano-terapeutico/

Dentro dela, crie os seguintes arquivos, sem alterar o funcionamento do aplicativo:

1. docs/auditoria-plano-terapeutico/01-estado-atual.md

Deve conter:

- localização dos arquivos responsáveis pela tela;
- componentes envolvidos;
- stores, contexts, hooks, services, banco ou estado persistente;
- funcionamento atual da seleção de duração;
- funcionamento atual da frequência semanal;
- funcionamento atual das tentativas;
- funcionamento atual dos níveis;
- funcionamento atual do tempo estimado;
- funcionamento atual do cálculo do total;
- funcionamento atual da progressão e retomada;
- inconsistências encontradas;
- trechos ou referências de código relevantes, sempre com caminho e função.

2. docs/auditoria-plano-terapeutico/02-inventario-exercicios.md

Crie uma tabela completa com TODOS os exercícios encontrados no projeto, contendo no mínimo:

- ID interno;
- nome exibido;
- arquivo principal;
- domínio cognitivo principal;
- domínios secundários;
- duração atualmente exibida;
- como termina atualmente;
- possui tentativas?;
- possui tempo?;
- possui blocos?;
- possui configuração própria?;
- possui progressão adaptativa?;
- possui retomada?;
- possui áudio?;
- permite repetir áudio?;
- métricas registradas atualmente;
- problemas encontrados.

Não omita exercícios.

3. docs/auditoria-plano-terapeutico/03-proposta-classificacao.md

Para cada exercício, proponha:

- modelo de execução:
  - contínuo;
  - resolução/planejamento;
  - fechado/alta fadiga;
  - bloco/protocolo;
  - outro, se necessário;

- justificativa;
- duração mínima recomendada;
- duração padrão recomendada;
- duração máxima recomendada;
- possibilidade de configuração pelo terapeuta;
- comportamento ao atingir o tempo;
- métricas mínimas;
- carga cognitiva sugerida;
- fatores que aumentam ou reduzem a carga;
- exercícios que não deveriam vir imediatamente antes ou depois;
- observações clínicas e técnicas.

4. docs/auditoria-plano-terapeutico/04-proposta-carga-cognitiva.md

Deve conter:

- escala recomendada;
- critérios objetivos;
- fórmula ou sistema de pontuação, se fizer sentido;
- diferença entre carga basal do exercício e carga dinâmica do nível;
- como considerar dificuldade, velocidade e interferência;
- como calcular carga estimada da sessão;
- como gerar alertas sem bloquear a autonomia do terapeuta;
- exemplos de sessões equilibradas;
- exemplos de sessões excessivas;
- limitações da classificação;
- quais decisões ainda exigem validação clínica humana.

Considere que um mesmo exercício pode mudar de carga conforme:

- nível;
- velocidade;
- quantidade de estímulos;
- semelhança entre alvo e distratores;
- tamanho da sequência;
- quantidade de regras;
- presença de dupla tarefa;
- tempo de exposição;
- repetição de áudio;
- limite de resposta.

Portanto, diferencie:

- carga basal do exercício;
- modificadores de carga;
- carga estimada na configuração atual.

5. docs/auditoria-plano-terapeutico/05-proposta-interface.md

Descreva, sem implementar:

- como deveria ficar cada card;
- quais controles devem permanecer;
- quais devem ser removidos;
- quais devem mudar;
- como mostrar duração;
- como mostrar carga;
- como mostrar nível;
- como mostrar retomada automática;
- como mostrar exercícios fixos;
- como mostrar exercícios configuráveis;
- como mostrar exercícios de planejamento;
- como calcular e exibir o total da sessão;
- alertas de sessão curta;
- alertas de sessão excessiva;
- alertas de carga;
- comportamento do botão “Ajustar”;
- como evitar excesso de informações visuais;
- proposta para desktop e responsividade.

A interface deve continuar clínica, discreta e profissional. Não transformar em interface gamificada.

6. docs/auditoria-plano-terapeutico/06-modelo-de-dados.md

Proponha uma estrutura futura de dados, sem implementá-la ainda.

Inclua uma interface TypeScript conceitual para algo semelhante a:

- ExerciseDefinition;
- ExercisePrescription;
- ExerciseExecutionModel;
- ExerciseDurationPolicy;
- CognitiveLoadProfile;
- SessionPrescription;
- PatientExerciseProgress;
- ExerciseCompletionPolicy.

A estrutura deve separar claramente:

- definição global do exercício;
- prescrição feita pelo terapeuta;
- progresso individual do paciente;
- estado da sessão;
- métricas de execução;
- histórico.

Não misture duração padrão do exercício com duração prescrita para um paciente.

7. docs/auditoria-plano-terapeutico/07-riscos-e-migracao.md

Identifique:

- risco de quebrar planos já salvos;
- risco de perder progresso;
- risco de incompatibilidade com dados antigos;
- risco de duração incorreta;
- risco de exercícios não encerrarem;
- risco de loops;
- risco de interromper uma atividade no meio;
- risco de alterações no cálculo de progressão;
- necessidade de migração de dados;
- necessidade de fallback;
- necessidade de feature flag;
- testes necessários;
- ordem segura de implementação.

8. docs/auditoria-plano-terapeutico/08-decisoes-pendentes.md

Liste todas as decisões que precisam ser validadas comigo antes da implementação.

Organize por prioridade:

- bloqueante;
- importante;
- refinamento posterior.

Não tome decisões clínicas silenciosamente.

RELATÓRIO NO TERMINAL

Ao terminar a análise, mostre no terminal um resumo claro contendo:

1. Quantos exercícios foram encontrados.
2. Quantos foram classificados em cada modelo.
3. Quais exercícios ainda ficaram ambíguos.
4. Quais usam tentativas atualmente.
5. Quais usam tempo.
6. Quais possuem duração hardcoded.
7. Quais não possuem encerramento seguro.
8. Quais apresentam risco para retomada automática.
9. Qual escala de carga você recomenda.
10. Quais são as 10 decisões mais importantes que precisamos revisar juntos.

Também mostre uma tabela resumida com as colunas:

- exercício;
- modelo atual;
- modelo recomendado;
- duração recomendada;
- carga basal;
- configuração pelo terapeuta;
- principal problema.

REGRAS DE SEGURANÇA DESTA ETAPA

- Não modificar a aplicação.
- Não alterar banco de dados.
- Não alterar migrations.
- Não remover configurações atuais.
- Não substituir “tentativas” ainda.
- Não alterar os exercícios.
- Não mudar algoritmos adaptativos.
- Não mudar progressão.
- Não mudar retomada.
- Não instalar dependências.
- Não executar comandos destrutivos.
- Não criar commit.
- Não fazer push.
- Apenas analisar e criar os documentos solicitados.

Caso seja necessário executar o projeto para compreender o funcionamento, pode executar apenas comandos não destrutivos.

Se encontrar testes existentes, pode executá-los, mas não corrija nada nesta etapa.

CRITÉRIO DE QUALIDADE

Não faça uma análise superficial baseada apenas nos nomes dos arquivos.

Inspecione:

- componentes;
- rotas;
- configurações;
- definições dos exercícios;
- engines;
- hooks;
- estados;
- persistência;
- banco;
- APIs;
- callbacks de conclusão;
- temporizadores;
- controle de rodadas;
- progressão adaptativa;
- retomada;
- cálculo de duração;
- cálculo do plano.

Ao final, pare e aguarde nossa validação.

Não implemente a proposta até receber uma autorização explícita.

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
