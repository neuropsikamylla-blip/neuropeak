# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 03/08/2026 15:11
Excelente.

Considero encerrada a Fase 2 da arquitetura clínica.

A partir deste momento, congelamos toda a arquitetura.

Não quero reabrir discussões conceituais durante a implementação.

Toda alteração arquitetural futura deverá ocorrer apenas se surgir necessidade real durante testes clínicos.

==========================================================
INICIAR IMPLEMENTAÇÃO
==========================================================

Vamos iniciar a implementação da arquitetura.

Seguiremos exatamente a ordem de menor risco para maior risco.

Não pule etapas.

Não implemente duas fases simultaneamente.

Cada fase deverá terminar completamente antes da próxima.

==========================================================
FASE 1
NÚCLEO DA PRESCRIÇÃO
==========================================================

Objetivo:

Implementar toda a lógica pura da arquitetura, sem alterar a interface do terapeuta e sem alterar a experiência do paciente.

Nesta fase implementar apenas:

• tipos
• estruturas
• calculadores
• validadores
• interpretadores
• modelos
• enums
• helpers
• testes

Nada visual.

==========================================================
IMPLEMENTAR
==========================================================

Implementar:

1.

Modelos de execução

- CONTINUOUS_TIMED
- CLOSED_PROTOCOL
- PLANNING_WINDOW
- FIXED_HIGH_FATIGUE

2.

Modelos de duração

3.

Protocolos

BREVE

PADRÃO

ESTENDIDO

4.

Carga basal

5.

Fadiga

6.

Interferência

7.

Margens de fechamento

8.

Estados da sessão

- abaixo
- dentro
- acima
- excesso importante

9.

Calculador de duração

Utilizar toda a fórmula definida na Fase 2.

10.

Calculador de carga

11.

Motor de validação

Gerar os 18 alertas definidos.

12.

Interpretador

Receber um plano terapêutico e devolver:

- duração estimada;
- faixa;
- carga;
- fadiga;
- alertas;
- conflitos;
- estado geral.

==========================================================
IMPORTANTE
==========================================================

Nesta fase:

NÃO alterar:

- páginas;
- componentes;
- banco;
- migrations;
- APIs;
- tela do terapeuta;
- tela do paciente;
- comportamento dos exercícios.

Toda implementação deverá ficar isolada em módulos reutilizáveis.

==========================================================
COMPATIBILIDADE
==========================================================

Todos os planos atuais devem continuar funcionando.

Nada poderá quebrar pacientes existentes.

Nenhum exercício poderá deixar de abrir.

Nenhum plano salvo poderá ficar inválido.

==========================================================
TESTES
==========================================================

Criar testes automáticos para validar:

- cálculo de duração;
- cálculo de carga;
- cálculo de fadiga;
- margens de fechamento;
- 18 alertas;
- estados da sessão;
- compatibilidade com planos antigos.

Não aceitar implementação sem testes.

==========================================================
ENTREGA
==========================================================

Ao terminar apresentar:

1.

Arquivos criados.

2.

Arquivos alterados.

3.

Arquitetura implementada.

4.

Cobertura dos testes.

5.

Exemplos reais:

Sessão de 20 minutos

Sessão de 30 minutos

Sessão de 40 minutos

Mostrando exatamente:

- duração;
- carga;
- fadiga;
- alertas;
- estado.

6.

Confirmação de que:

- nenhum exercício foi alterado;
- nenhuma interface foi alterada;
- nenhum paciente perde compatibilidade;
- nenhum progresso foi modificado.

Não iniciar automaticamente a Fase 2 (interface do terapeuta).

Pare e aguarde minha validação.
