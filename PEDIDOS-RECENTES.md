# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 03/08/2026 09:35
então os exercicios, eu vou verificar depois. agora vou iniciar a fase 2  : FASE 2 — ARQUITETURA DE PRESCRIÇÃO CLÍNICA

A Fase 1 está oficialmente encerrada.

Todos os documentos da arquitetura clínica passam a ser considerados congelados e servirão como base para esta etapa.

NÃO revisar novamente:

- taxonomia;
- perfis cognitivos;
- mechanicalPrimary;
- associatedProfiles;
- categorias;
- catálogo;
- nomenclatura;
- documentação da Fase 1.

Essas informações passam a ser consideradas válidas.

==========================================================
OBJETIVO
==========================================================

Projetar toda a arquitetura de prescrição clínica do NeuroPeak.

O objetivo desta fase NÃO é implementar.

Também NÃO é alterar exercícios.

O objetivo é definir exatamente como cada exercício deverá funcionar dentro de um plano terapêutico.

Ao final desta fase, quero conseguir montar qualquer protocolo clínico apenas utilizando os parâmetros definidos.

==========================================================
NÃO IMPLEMENTAR
==========================================================

Não alterar:

- código;
- exercícios;
- níveis;
- banco;
- migrations;
- interface;
- catálogo;
- modalidades;
- engine.

Apenas analisar, documentar e definir arquitetura.

==========================================================
PARA CADA UM DOS 34 EXERCÍCIOS
==========================================================

Determinar obrigatoriamente:

1.
Modelo de execução

Escolher apenas um:

- CONTINUOUS_TIMED
- CLOSED_PROTOCOL
- PLANNING_WINDOW
- FIXED_HIGH_FATIGUE

Justificar.

----------------------------------------------------------

2.
Unidade mínima válida

Identificar qual é a menor unidade clinicamente válida.

Exemplos:

- tentativa
- rodada
- série
- bloco
- desafio completo
- fase

Justificar.

----------------------------------------------------------

3.
Política de encerramento

Quando o limite for atingido:

- termina imediatamente?
- termina a rodada?
- termina o bloco?
- termina o desafio?
- não inicia outro?

Definir comportamento.

----------------------------------------------------------

4.
Protocolos

Definir:

BREVE

PADRÃO

ESTENDIDO

Cada protocolo deve informar:

- quantidade de unidades
- duração estimada
- validade clínica

----------------------------------------------------------

5.
Carga Cognitiva Basal

Escala:

1
2
3

Apenas carga basal.

Não calcular ainda carga dinâmica.

Justificar.

----------------------------------------------------------

6.
Modificadores de carga

Identificar tudo o que aumenta carga.

Exemplos:

- velocidade
- memória
- quantidade
- interferência
- dupla tarefa
- mudança de regra
- semelhança
- planejamento
- modalidade

Sem calcular ainda.

----------------------------------------------------------

7.
Duração Clínica

Definir:

mínima útil

padrão

máxima recomendada

Nunca usar o mesmo valor para todos.

Justificar.

----------------------------------------------------------

8.
Fadiga

Classificar:

baixa

moderada

alta

Explicar.

----------------------------------------------------------

9.
Interferência

Classificar:

baixa

moderada

alta

----------------------------------------------------------

10.
Retomada

Como o exercício volta após interrupção?

Retoma:

- exatamente de onde parou?
- início do bloco?
- um nível abaixo?
- outra estratégia?

----------------------------------------------------------

11.
Elegibilidade para sessão

Responder:

Pode abrir uma sessão?

Pode finalizar uma sessão?

Melhor no início?

Melhor no meio?

Melhor no final?

Existe combinação ruim?

----------------------------------------------------------

12.
Modalidade

Somente para:

- Restaurante
- Supermercado
- Caminhos para a Meta
- Agentes Focus
- Compra Multifuncional

Analisar impacto na duração e carga.

==========================================================
DEPOIS DOS 34
==========================================================

Projetar a composição automática das sessões.

Exemplo:

Sessão:

20 minutos

30 minutos

40 minutos

O sistema deve conseguir distribuir automaticamente os exercícios respeitando:

- carga
- fadiga
- duração
- modalidade
- planejamento
- diversidade cognitiva

==========================================================
PLANO TERAPÊUTICO
==========================================================

Projetar a lógica que será usada pelo terapeuta.

O terapeuta escolherá:

- frequência semanal
- duração da sessão
- exercícios

O sistema calculará automaticamente:

- tempo real
- carga
- distribuição
- alertas
- conflitos
- balanceamento

==========================================================
NÃO PROJETAR A ENGINE AINDA
==========================================================

Nesta fase não decidir:

- IA
- sugestões automáticas
- prescrição inteligente

Primeiro quero consolidar toda a arquitetura da sessão.

==========================================================
DOCUMENTOS
==========================================================

Criar documentação organizada desta fase.

Separar claramente:

- arquitetura
- decisões
- dúvidas
- pendências

==========================================================
RELATÓRIO FINAL
==========================================================

Ao terminar, apresentar:

1.
Tabela única dos 34 exercícios.

2.
Modelo de execução.

3.
Carga basal.

4.
Duração.

5.
Fadiga.

6.
Interferência.

7.
Protocolos.

8.
Exercícios que ainda dependem de decisão clínica.

Depois parar.

Não implementar absolutamente nada. Antes de executar, lembre que a janela do Claude é mais escassa: use o Codex para toda codificação que caiba numa spec sobre o ⁠ HEAD ⁠ commitado, deixando o Claude direto apenas para ajuste pós-colheita, integração com contexto vivo ou indisponibilidade comprovada do Codex. No Codex, use ⁠ gpt-5.6-sol ⁠ ⁠ xhigh ⁠ para arquitetura, alto risco ou revisão final; ⁠ gpt-5.6-sol ⁠ ⁠ high ⁠ para conflitos ou código acoplado; ⁠ gpt-5.6-terra ⁠ ⁠ high ⁠ para código comum ou testável; e ⁠ gpt-5.6-luna ⁠ ⁠ high ⁠ para trabalho focalizado, repetível e barato de validar. Antes do primeiro comando, anuncie motor, modelo, esforço e motivo e, se for Codex, localize e use o ⁠ lab.sh ⁠ já instalado, sem presumir caminho nem criar outro.

## 03/08/2026 09:58
<task-notification>
<task-id>b2uutqz8h</task-id>
<tool-use-id>toolu_01PNf9Vz4LnnzGkHWXswgbTx</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b2uutqz8h.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar o lote 1" completed (exit code 0)</summary>
</task-notification>

## 03/08/2026 10:10
<task-notification>
<task-id>b6u09qnjr</task-id>
<tool-use-id>toolu_01MxE8tjXZmNKEVKSAeYDb2k</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b6u09qnjr.output</output-file>
<status>completed</status>
<summary>Background command "Aguardar a reconstrução do lote 1" completed (exit code 0)</summary>
</task-notification>
