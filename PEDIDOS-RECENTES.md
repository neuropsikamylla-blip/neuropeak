# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 03/08/2026 15:17
Pode concluir normalmente a Implementação — Fase 1.

Ao terminar, apresente antes de qualquer nova fase:

1. Arquivos criados e alterados.
2. Diff resumido.
3. Confirmação de que somente `lib/prescription/` e arquivos de teste foram tocados.
4. Resultado de todos os testes novos.
5. Resultado da suíte antiga completa.
6. Cobertura dos testes do núcleo de prescrição.
7. Lista dos 18 alertas implementados.
8. Prova de que todos possuem:
   - `blocksSave: false`;
   - `canSave: true`.
9. Resultados das fronteiras de sessão para 20, 30 e 40 minutos.
10. Três exemplos executados de planos:
   - 20 minutos;
   - 30 minutos;
   - 40 minutos;
   mostrando duração estimada, carga, fadiga, estado e alertas.
11. Confirmação de que não foram alterados:
   - interface;
   - páginas;
   - APIs;
   - banco;
   - migrations;
   - progressão;
   - exercícios;
   - dados de pacientes.
12. Limitações ou decisões ainda não implementadas.

Não iniciar automaticamente a próxima fase.

Pare e aguarde minha validação.
