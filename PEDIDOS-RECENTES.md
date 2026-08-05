# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 22:03
A política operacional de backup está consolidada e aprovada.

Antes de iniciar o pg_dump e a implantação da T1, quero registrar uma nova decisão clínica sobre a prescrição. Não implementar ainda.

==================================================
DECISÃO ARQUITETÔNICA — ORDEM PRESCRITA X ORDEM REAL DE EXECUÇÃO
==================================================

O paciente realizará o treino em casa e poderá escolher por qual exercício começar, de forma semelhante ao Cogmed.

O plano pode apresentar uma ordem sugerida ou uma organização visual definida pelo terapeuta, mas essa ordem não deve ser tratada automaticamente como a ordem real de execução.

Portanto, precisamos distinguir:

1. ORDEM SUGERIDA
- organização proposta pelo terapeuta;
- útil para apresentação e orientação;
- pode ser seguida ou não pelo paciente.

2. ORDEM REAL
- sequência efetivamente escolhida pelo paciente durante a sessão;
- só pode ser conhecida após a execução;
- deverá ser registrada futuramente no histórico da sessão.

==================================================
IMPACTO SOBRE OS ALERTAS ATUAIS
==================================================

Alertas que dependem de consecutividade ou posição não podem ser apresentados como fatos da futura execução quando o paciente possui liberdade de escolha.

Reavaliar especialmente:

- HIGH_FATIGUE_ADJACENT;
- HIGH_INTERFERENCE_ADJACENT;
- PLANNING_WINDOW_ADJACENT;
- HIGH_FATIGUE_POSITION;
- OUTSIDE_BEST_POSITION;
- atividade pouco indicada para o encerramento;
- qualquer regra baseada em “início”, “meio”, “fim”, “sequência” ou “consecutivo”.

Exemplos problemáticos:

- “Fadiga alta em sequência”;
- “Interferência alta em sequência”;
- “Planejamento consecutivo”;
- “Atividade pouco indicada para o encerramento”;
- “Posição preferencial”.

Essas afirmações só são válidas se:

- a ordem for obrigatória e controlada pelo sistema; ou
- forem calculadas posteriormente sobre a ordem realmente executada.

Se a ordem for apenas sugerida, o máximo que pode aparecer na prescrição é algo como:

- “Na ordem sugerida, estes exercícios aparecem consecutivamente”;
- “Caso o paciente siga esta ordem, poderá haver maior concentração de fadiga”;

e mesmo assim precisamos avaliar se isso realmente ajuda ou apenas gera ruído.

==================================================
O QUE CONTINUA VÁLIDO NA PRESCRIÇÃO
==================================================

Análises independentes da ordem continuam potencialmente úteis:

- duração estimada do conjunto;
- quantidade de exercícios com alta fadiga;
- composição por domínio;
- sobreposição de processos cognitivos;
- concentração de treino;
- carga total, quando houver referência clínica validada;
- presença de múltiplos exercícios com características semelhantes.

A observação clínica sobre sobreposição em planejamento permanece útil:

- Estacionamento Lógico;
- Jogo das Torres;
- recrutamento de processos de planejamento semelhantes;
- possibilidade de concentração intencional em plano focal.

==================================================
PRINCÍPIO DE INTERFACE
==================================================

A tela da prescrição não deve expor todas as regras internas do motor.

Ela deve responder apenas:

“Existe algo neste conjunto de exercícios que merece atenção clínica antes de salvar?”

Não mostrar métricas técnicas sem tradução clínica, por exemplo:

- “carga basal 11 / referência 10” como dado principal;
- códigos ou escalas internas;
- repetições da mesma informação;
- afirmações sobre posição que talvez não se concretizem.

O motor pode continuar calculando dados internamente, mas a interface deve apresentar somente informações que:

- sejam verdadeiras;
- sejam clinicamente interpretáveis;
- possam mudar ou qualificar uma decisão do terapeuta;
- não presumam comportamento futuro do paciente.

==================================================
ANÁLISE OBRIGATÓRIA
==================================================

Antes de qualquer código, responder:

1. Hoje o paciente pode escolher livremente o primeiro exercício e os seguintes?
2. A ordem prescrita é tecnicamente obrigatória em algum ponto do runtime?
3. Quais alertas atuais dependem da ordem planejada?
4. Quais deles deixam de ser válidos se a ordem for livre?
5. Quais podem permanecer apenas como análise da “ordem sugerida”?
6. Quais devem sair completamente da prescrição e migrar futuramente para a análise da execução real?
7. Quais informações atuais são apenas métricas internas sem tradução clínica útil?
8. Quais observações realmente ajudam o terapeuta a revisar a composição?
9. Como reduzir o bloco atual para um conjunto pequeno de insights clinicamente relevantes?
10. Quais arquivos e documentos seriam afetados numa futura implementação?

Criar um documento arquitetônico novo.

Não alterar código.
Não alterar interface.
Não tocar no banco.
Não interromper a T1 já aprovada.
Não iniciar implementação.
Pare após apresentar a análise.

## 04/08/2026 22:05
Mais uma decisão arquitetônica.

A revisão do plano não deve ser um relatório do motor de prescrição.

Ela deve funcionar como um assistente clínico para o terapeuta.

O motor pode calcular dezenas ou centenas de regras internamente, mas a interface deve exibir apenas aquelas que realmente possam modificar uma decisão clínica.

Princípios:

1. O objetivo da tela é responder apenas:

"Existe algo neste plano que merece minha atenção antes de salvar?"

2. Informações redundantes ou puramente técnicas não devem aparecer.

Exemplos:

- carga basal 11 / referência 10;
- repetição da estimativa em texto;
- valores internos do algoritmo;
- escalas que não possuem significado clínico direto.

3. O sistema deve evitar produzir muitos avisos.

Quando praticamente todo plano gera uma longa lista de observações, o terapeuta deixa de diferenciá-las por importância.

4. Sempre que possível, vários alertas relacionados devem ser sintetizados em um único insight clínico.

Exemplo:

Em vez de:

- fadiga alta em sequência;
- muitas atividades de fadiga alta;
- carga elevada para a duração;

o sistema pode produzir uma única observação clínica relacionada à intensidade global do plano.

5. As observações devem priorizar:

- composição cognitiva;
- concentração excessiva de um mesmo processo;
- ausência de domínios importantes;
- sobreposição relevante de construtos;
- duração muito distante da meta;
- conflitos realmente capazes de justificar revisão.

6. A interface deve privilegiar qualidade de insight e não quantidade de alertas.

Prefiro receber cinco observações realmente úteis do que vinte regras produzidas pelo algoritmo.

Antes de qualquer implementação, analise:

- quais alertas atuais podem ser fundidos;
- quais são redundantes;
- quais representam apenas cálculo interno;
- quais efetivamente ajudam um terapeuta experiente a revisar um plano;
- proponha uma hierarquia de importância para essas observações.

Não implementar.

Apenas analisar e documentar.

## 04/08/2026 22:11
O NeuroPeak já está pronto, em produção e sendo utilizado com pacientes.

Estas decisões não fazem parte de um projeto futuro nem de uma reconstrução da plataforma. São melhorias do sistema clínico que já está em uso.

Quero encerrar a fase de análise e implementar integralmente as decisões aprovadas, com segurança e sem interromper o uso atual.

Não criar novas análises conceituais.
Não reabrir decisões aprovadas.
Não redesenhar o programa do zero.
Não criar uma nova aplicação paralela.

Implementar no NeuroPeak atual, preservando:

- pacientes;
- planos;
- sessões;
- histórico;
- níveis;
- progressão;
- exercícios;
- doses;
- protocolos;
- modalidades;
- dados clínicos;
- compatibilidade dos planos existentes.

==================================================
OBJETIVO 1 — REVISÃO DO PLANO COMO ASSISTENTE CLÍNICO
==================================================

Implementar primeiro, por não exigir banco.

A tela de revisão do plano deve deixar de funcionar como relatório técnico do motor e passar a mostrar apenas poucos insights clinicamente úteis.

Princípios aprovados:

1. O paciente escolhe livremente a ordem dos exercícios.

A ordem salva no plano é ordem sugerida e ordem de exibição, não ordem obrigatória de execução.

2. Não apresentar como fatos da execução futura alertas dependentes de:

- posição;
- início;
- meio;
- encerramento;
- adjacência;
- consecutividade;
- sequência planejada.

3. Preservar todas as ocorrências no núcleo.

Não apagar os códigos de validation.ts.

A mudança deve ocorrer na camada de apresentação.

4. Alertas de ordem poderão ser utilizados futuramente na análise da ordem real executada.

5. Remover da interface principal métricas técnicas sem tradução clínica útil, especialmente:

- “carga basal”;
- “11 / referência 10”;
- códigos internos;
- posição preferencial;
- explicações do funcionamento do algoritmo;
- repetição textual de números já exibidos.

6. A duração deve ser mostrada de forma simples:

- duração-alvo;
- estimativa atual;
- dentro ou fora da faixa esperada.

Não repetir essa informação em vários cartões.

7. Fundir alertas redundantes em poucos insights.

A apresentação deve priorizar, no máximo:

- duração da sessão;
- demanda global do conjunto, quando houver referência clínica válida;
- concentração cognitiva;
- sobreposição de processos relevantes;
- quantidade elevada de exercícios potencialmente fatigantes;
- planejamento prolongado;
- cobertura cognitiva, quando houver objetivo ou domínio prioritário definido.

8. Não criar alerta genérico de ausência de domínio sem saber qual era o objetivo clínico do plano.

Um plano focal pode excluir outros domínios deliberadamente.

A ausência só poderá ser apontada quando houver objetivo prioritário explicitamente registrado e não contemplado.

9. Um plano bem composto deve mostrar zero ou poucos insights.

Meta de UX:

- normalmente 0–3 insights;
- casos realmente complexos podem mostrar mais;
- não transformar a tela em um relatório longo.

10. Linguagem:

- clínica;
- clara;
- consultiva;
- sem precisão numérica falsa;
- sem afirmar que a escolha do terapeuta está errada.

Exemplo aprovado:

“Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.”

11. Manter o botão Salvar plano sempre consultivo e não bloqueado.

==================================================
OBJETIVO 2 — AJUSTES VISUAIS RELACIONADOS
==================================================

Na mesma implementação:

- retirar o tempo individual da linha principal do exercício;
- manter protocolo, carga e fadiga apenas se forem úteis e compreensíveis;
- duração individual continua em Ver detalhes e Ajustar;
- no topo, priorizar a duração da sessão;
- substituir terminologia técnica destinada ao motor por linguagem compreensível ao terapeuta.

Não mostrar “carga basal”.

Antes de escolher a nova redação, propor dentro da implementação uma tradução simples, por exemplo:

- Demanda da sessão;
- Demanda cognitiva estimada;
- Intensidade prevista.

Não inventar uma escala nova.

Se a métrica não tiver tradução clínica confiável, ocultá-la da interface principal e mantê-la apenas internamente.

==================================================
OBJETIVO 3 — T1 DO FRAMEWORK DE TUTORIAL
==================================================

Após publicar e validar o Objetivo 1, concluir a implantação da T1 já aprovada.

A T1 inclui:

- tutorialCompletedAt;
- tutorialVersion;
- tutorialSource enum BACKFILL/PATIENT;
- rota específica;
- catálogo de versões;
- contrato global;
- PreparationScreen;
- lógica de tutorial obrigatório/concluído/desatualizado;
- backfill aprovado.

Não converter os 34 exercícios de uma vez.

Antes de tocar o banco:

1. instalar as ferramentas PostgreSQL necessárias;
2. gerar pg_dump completo em formato custom;
3. validar o arquivo;
4. restaurar em ambiente de teste porque o backfill é nível 2;
5. conferir contagens;
6. apresentar as provas.

Só depois:

7. mostrar prisma migrate diff --script;
8. parar se houver DROP, ALTER COLUMN ou qualquer alteração inesperada;
9. aplicar schema;
10. reaplicar imediatamente as três CHECK de Session, com difficulty 1–13;
11. confirmar constraints;
12. executar o backfill separadamente;
13. provar que totalAttempts = 0 ficou intacto;
14. provar que currentDifficulty, lastAttemptAt, totalAttempts e Session não mudaram;
15. publicar o código;
16. realizar smoke test.

Não executar qualquer etapa destrutiva sem backup validado.

==================================================
OBJETIVO 4 — PILOTOS DO TUTORIAL
==================================================

Após a T1 implantada e validada, implementar e publicar:

1. Conecta Números;
2. Span Numérico Auditivo Direto.

Validar:

- primeira vez abre tutorial obrigatório;
- acessos seguintes mostram Começar e Como funciona;
- tutorial pode ser revisto;
- tutorial não altera nível, tentativa, pontuação, duração clínica ou progressão;
- persistência funciona entre dispositivos;
- Span não antecipa quantidade de dígitos;
- erro repete apenas a microtentativa guiada.

==================================================
OBJETIVO 5 — TODO O CATÁLOGO
==================================================

Depois dos dois pilotos aprovados visualmente, converter todos os exercícios restantes em lotes até que os 34 estejam no framework padrão.

Não parar após os pilotos como se o trabalho estivesse concluído.

Usar lotes seguros por complexidade:

- simples visuais;
- sequenciais e memória;
- contínuos cronometrados;
- planejamento e funcionais;
- tutoriais próprios e mecânicas reformuladas.

Cada tutorial deve ser réplica real da mecânica.

Não criar tutorial genérico que não corresponda ao exercício.

==================================================
ORDEM DE EXECUÇÃO
==================================================

FASE 1
Assistente clínico e simplificação da revisão do plano.

- implementar;
- testar;
- publicar;
- parar para minha validação visual.

FASE 2
Backup validado e implantação controlada da T1.

- executar passo a passo;
- testar;
- publicar;
- parar para validação.

FASE 3
Dois pilotos do tutorial.

- implementar;
- testar;
- publicar;
- parar para validação.

FASE 4
Converter os demais exercícios em lotes até completar os 34.

Não abrir novas análises arquitetônicas, salvo se surgir uma inconsistência clínica real ou risco concreto de perda de dados.

==================================================
PROVAS OBRIGATÓRIAS
==================================================

Em cada fase:

- revisar o código real;
- declarar arquivos alterados;
- rodar TypeScript;
- rodar suíte completa;
- rodar build;
- provar compatibilidade;
- revisar o diff;
- fazer bump de versão;
- publicar na Vercel;
- confirmar appVersion, buildId, health e commit no deploy;
- registrar no PROGRESSO.md;
- parar para minha validação quando indicado.

Comece agora pela FASE 1.

Antes do código, apenas informe:

- arquivos exatos;
- o que será ocultado;
- o que será fundido;
- quais insights permanecerão;
- testes de aceite.

Depois implemente, publique e pare para minha validação visual.
