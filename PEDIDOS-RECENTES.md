# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 03/08/2026 12:55
Excelente.

A arquitetura está seguindo exatamente a direção que eu queria.

Tenho apenas alguns ajustes conceituais antes do lote 3.

1.

O teto de carga basal (7 / 10 / 13) deve permanecer como um alerta heurístico.

Não deve ser tratado como limite absoluto.

A composição da sessão deverá considerar simultaneamente:

- carga basal;
- fadiga;
- interferência;
- modelo de execução;
- modalidade;
- planejamento.

Ou seja, duas sessões com carga total 7 podem ter qualidades muito diferentes.

2.

A margem de fechamento baseada no modelo de execução está aprovada.

Esse conceito permanece.

3.

Adicionar um novo alerta:

PLANNING_WINDOW

Não recomendar dois exercícios classificados como PLANNING_WINDOW consecutivos.

Exemplos:

Jogo das Torres

↓

Estacionamento Lógico

↓

Caminhos para a Meta

O sistema deverá sugerir inserir entre eles um exercício CONTINUOUS_TIMED ou CLOSED_PROTOCOL.

Continua sendo apenas sugestão.

Nunca bloqueio.

4.

Todos os alertas continuam consultivos.

O terapeuta sempre poderá salvar o plano.

Não criar bloqueios.

Com esses ajustes, pode concluir normalmente o lote 3.

## 03/08/2026 14:41
A Fase 2 está validada. Vamos fechar as quatro decisões bloqueantes conforme abaixo.

Não reabrir a análise dos 34 exercícios.

Não alterar os parâmetros individuais já consolidados.

Não implementar ainda nesta etapa. Apenas registrar as decisões finais e preparar a especificação objetiva de implementação.

==================================================
1. FAIXAS DE DURAÇÃO DA SESSÃO
==================================================

Aprovar as seguintes faixas:

Sessão prescrita de 20 minutos:
- faixa esperada: 18–22 min;
- atenção: acima de 22 até 24 min;
- excesso importante: acima de 24 min.

Sessão prescrita de 30 minutos:
- faixa esperada: 27–33 min;
- atenção: acima de 33 até 36 min;
- excesso importante: acima de 36 min.

Sessão prescrita de 40 minutos:
- faixa esperada: 36–44 min;
- atenção: acima de 44 até 48 min;
- excesso importante: acima de 48 min.

Essas faixas são estimativas operacionais, não limites clínicos absolutos.

O terapeuta poderá salvar o plano em qualquer faixa.

O sistema apenas deverá informar:

- abaixo do esperado;
- dentro do esperado;
- acima do esperado;
- excesso importante.

Nenhum desses estados bloqueia salvamento.

==================================================
2. MARGEM DE FECHAMENTO
==================================================

Aprovar:

CONTINUOUS_TIMED:
- até 0,5 minuto para concluir a rodada atual;
- não iniciar nova rodada após atingir o tempo-base.

CLOSED_PROTOCOL:
- até 1 minuto para concluir a série ou unidade atual;
- não iniciar nova série após atingir o limite.

PLANNING_WINDOW:
- até 3 minutos adicionais para concluir o desafio em andamento;
- não iniciar novo desafio após atingir o tempo-base.

FIXED_HIGH_FATIGUE:
- sem margem adicional;
- encerrar no limite definido, respeitando apenas um fechamento técnico mínimo da tela.

Para PLANNING_WINDOW, os 3 minutos são teto de segurança, não obrigação de manter o paciente até o fim.

Caso o desafio não seja concluído dentro da margem:

- encerrar de forma segura;
- registrar como desafio não concluído;
- preservar movimentos, tempo e progresso;
- não considerar como erro automático;
- não iniciar novo desafio.

==================================================
3. TETOS DE CARGA BASAL
==================================================

Aprovar os valores:

- sessão de 20 min: referência 7;
- sessão de 30 min: referência 10;
- sessão de 40 min: referência 13.

Esses valores são exclusivamente heurísticos.

Não significam:

- sessão válida;
- sessão inválida;
- autorização;
- proibição;
- segurança garantida.

A leitura da sessão deverá considerar conjuntamente:

- carga basal;
- fadiga;
- interferência;
- sequência;
- modalidade;
- modelo de execução;
- concentração de tarefas semelhantes;
- presença de planejamento consecutivo.

Duas sessões com a mesma soma de carga podem receber alertas diferentes.

Nenhum teto bloqueia salvamento.

==================================================
4. REGRAS DE FADIGA ALTA
==================================================

Aprovar como recomendação:

Sessão de 20 minutos:
- recomendar no máximo 1 exercício de fadiga alta.

Sessões de 30 e 40 minutos:
- recomendar no máximo 2 exercícios de fadiga alta.

Além disso:

- não recomendar dois exercícios de fadiga alta consecutivos;
- sugerir intercalar com exercício de fadiga baixa ou moderada;
- evitar recomendar exercício de fadiga alta como último da sessão;
- caso o terapeuta mantenha essa posição, permitir normalmente;
- nunca bloquear salvamento.

A regra de “não finalizar com fadiga alta” é consultiva, não absoluta.

==================================================
5. PLANEJAMENTO CONSECUTIVO
==================================================

Manter o alerta PLANNING_WINDOW_ADJACENT.

Não recomendar dois exercícios PLANNING_WINDOW consecutivos.

Sugerir inserir entre eles:

- CONTINUOUS_TIMED;
- ou CLOSED_PROTOCOL.

Nenhum bloqueio.

==================================================
6. CAMINHOS PARA A META
==================================================

Manter:

- PROVISIONAL_PROFILE;
- duração provisória;
- carga provisória;
- modelo provisório.

O exercício será reavaliado depois da reformulação para planejamento.

Não utilizá-lo como referência para calibrar outros exercícios.

==================================================
7. ENCERRAMENTO DA FASE 2
==================================================

Atualize:

- docs/prescription-architecture/04-open-decisions.md;
- docs/prescription-architecture/05-consolidated-report.md;
- documentos de composição da sessão;
- JSON de prescrição, somente quando necessário para registrar essas decisões.

Marque as quatro decisões anteriormente bloqueantes como APROVADAS.

Depois apresente:

1. confirmação de que não restam decisões bloqueantes para iniciar a implementação;
2. decisões importantes que podem ser refinadas depois;
3. lista final dos 18 alertas;
4. confirmação de que todos possuem blocksSave = false;
5. confirmação de que os parâmetros individuais dos 34 exercícios permaneceram intactos;
6. arquivos que a implementação futura precisará alterar;
7. ordem técnica recomendada para implementar a área do terapeuta com segurança.

Não implementar ainda.

Não alterar banco.

Não criar migrations.

Não modificar exercícios.

Não alterar interface.

Apenas concluir a documentação e produzir a especificação de implementação.

Depois pare.

## 03/08/2026 14:54
<task-notification>
<task-id>bxc0di7fc</task-id>
<tool-use-id>toolu_016vk7B42vWpXgd3MByRqRUd</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bxc0di7fc.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o fechamento" completed (exit code 0)</summary>
</task-notification>
