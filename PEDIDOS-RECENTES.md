# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 03/08/2026 15:39
IMPLEMENTAÇÃO — FASE 2
EXIBIÇÃO CONSULTIVA NA ÁREA DO TERAPEUTA

A Implementação — Fase 1 está aprovada.

O núcleo puro em `lib/prescription/` está congelado e deve ser utilizado como fonte para esta etapa.

Objetivo:

Integrar a leitura do núcleo de prescrição à tela atual do plano terapêutico, exibindo informações consultivas ao terapeuta.

Nesta fase:

- ler o formato atual dos planos;
- interpretar o plano usando `lib/prescription/`;
- mostrar duração, carga, fadiga, estado e alertas;
- não alterar ainda o formato salvo;
- não criar migration;
- não modificar a experiência do paciente;
- não alterar o comportamento dos exercícios;
- não implementar ainda os novos controles de dose.

==================================================
PRINCÍPIO DE COMPATIBILIDADE
==================================================

A tela atual deve continuar funcionando com todos os planos existentes.

O sistema deve:

- ler planos antigos;
- calcular a interpretação por meio da camada legada;
- mostrar informações consultivas;
- permitir que o terapeuta continue salvando no formato atual;
- não converter nem reescrever automaticamente os dados antigos;
- não apagar campos existentes;
- não alterar níveis ou progresso.

Nesta fase, a integração é somente de leitura e apresentação.

==================================================
ARQUIVOS PREVISTOS
==================================================

Priorizar alterações apenas em:

- `app/(therapist)/pacientes/[id]/plano/page.tsx`
- `components/plano/PlanBuilderSidebar.tsx`
- `components/plano/ExerciseCard.tsx`
- `components/plano/ExerciseRow.tsx`

Pode criar componentes auxiliares dentro de:

- `components/plano/prescription/`

Não alterar nesta fase:

- APIs;
- banco;
- migrations;
- páginas do paciente;
- `lib/adaptive.ts`;
- comportamento dos exercícios;
- `ExerciseWrapper.tsx`;
- rotas de sessão.

Caso seja tecnicamente necessário tocar em outro arquivo, pare e explique antes.

==================================================
INTEGRAÇÃO COM O NÚCLEO
==================================================

Utilizar:

- catálogo de prescrição;
- interpretador;
- leitor legado;
- calculador de duração;
- resumos de carga, fadiga e interferência;
- validadores dos 18 alertas.

Não duplicar regras nos componentes.

A interface deve apenas consumir o resultado do interpretador.

Nenhum componente deve recalcular manualmente:

- duração;
- carga;
- margens;
- estados;
- alertas.

==================================================
RESUMO DA SESSÃO
==================================================

Na área lateral do plano, substituir a estimativa genérica baseada em “~7 min” por um resumo real.

Exibir:

1. Duração prescrita:
   - 20 min;
   - 30 min;
   - 40 min;
   - ou valor atual do plano, quando legado/personalizado.

2. Faixa estimada real:
   - mínimo;
   - máximo.

Exemplo:

`Estimativa: 27–33 min`

3. Estado da sessão:
   - ABAIXO_DO_ESPERADO;
   - DENTRO_DO_ESPERADO;
   - ACIMA_DO_ESPERADO;
   - EXCESSO_IMPORTANTE.

Usar textos amigáveis na interface:

- Abaixo do esperado;
- Dentro do esperado;
- Acima do esperado;
- Excesso importante.

4. Carga basal total:
   - valor atual;
   - referência heurística para aquela duração.

Exemplo:

`Carga basal: 8 / referência 10`

Não apresentar como pontuação de aprovação.

Adicionar texto curto ou tooltip:

`Referência consultiva; não determina se o plano é válido.`

5. Fadiga:
   - quantidade baixa;
   - moderada;
   - alta.

6. Interferência:
   - quantidade baixa;
   - moderada;
   - alta.

7. Confirmação visível de que o plano pode ser salvo:
   - não usar linguagem de “aprovado”;
   - não usar selo verde de “plano válido”;
   - não ocultar o botão de salvar;
   - não desabilitar salvamento por causa dos alertas.

==================================================
ALERTAS
==================================================

Exibir os alertas retornados pelo núcleo.

Organizar por gravidade visual consultiva:

- informativo;
- atenção;
- revisão recomendada.

A gravidade visual não altera `blocksSave`.

Cada alerta deve apresentar:

- título;
- mensagem;
- exercícios envolvidos, quando houver;
- sugestão de ajuste, quando houver.

Exemplos:

- sessão acima do esperado;
- carga no teto heurístico;
- fadiga alta consecutiva;
- interferência alta consecutiva;
- dois exercícios auditivos seguidos;
- dois PLANNING_WINDOW consecutivos;
- posição de abertura ou encerramento pouco recomendada;
- combinação declarada como ruim.

Não exibir códigos técnicos como:

`HIGH_FATIGUE_ADJACENT`

O código pode existir internamente, mas o terapeuta vê texto em português.

==================================================
CARDS DOS EXERCÍCIOS
==================================================

Nos cards e linhas dos exercícios selecionados, exibir apenas informações consultivas já disponíveis no núcleo:

- modelo de execução em texto amigável;
- duração estimada ou protocolo atual;
- carga basal;
- fadiga;
- modalidade atual, apenas quando aplicável.

Textos amigáveis para modelo:

- CONTINUOUS_TIMED → Por tempo;
- CLOSED_PROTOCOL → Por protocolo;
- PLANNING_WINDOW → Janela de planejamento;
- FIXED_HIGH_FATIGUE → Duração fixa.

Não adicionar ainda controles de alteração desses parâmetros.

Nesta fase o terapeuta apenas visualiza.

==================================================
DESIGN
==================================================

Manter a interface:

- clínica;
- discreta;
- limpa;
- sem gamificação;
- sem excesso de cores;
- sem gráficos decorativos;
- sem transformar carga em “nota”.

Usar destaque visual moderado:

- neutro para dentro do esperado;
- atenção discreta para acima;
- destaque mais evidente, mas não alarmista, para excesso importante;
- alertas agrupados, não espalhados por toda a tela.

Não sobrecarregar cada card com todos os dados.

Prioridade visual:

1. nome do exercício;
2. duração/protocolo;
3. carga e fadiga de forma compacta;
4. detalhes adicionais no botão ou área “Ver detalhes”.

==================================================
ESTADO VAZIO E PLANOS LEGADOS
==================================================

Quando nenhum exercício estiver selecionado:

- mostrar duração estimada 0;
- estado abaixo do esperado;
- não gerar alertas confusos além do necessário;
- orientar que exercícios sejam adicionados.

Para planos antigos:

- interpretar de forma tolerante;
- mostrar um marcador discreto apenas se algum parâmetro não puder ser determinado;
- não mostrar erro técnico ao terapeuta;
- usar fallback documentado;
- não modificar os dados ao abrir a tela.

==================================================
TESTES
==================================================

Criar testes para:

1. Renderização do resumo de sessão.
2. Estado abaixo/dentro/acima/excesso.
3. Exibição de alertas em português.
4. Garantia de que alertas não desabilitam o botão de salvar.
5. Plano legado sendo interpretado.
6. Plano vazio.
7. Cards exibindo modelo, carga e fadiga.
8. Nenhuma regra duplicada fora de `lib/prescription/`.
9. Nenhuma chamada de escrita ou migração.
10. Todos os testes antigos continuando a passar.

==================================================
PROVA DE ESCOPO
==================================================

Ao final, provar que não foram alterados:

- banco;
- migrations;
- APIs;
- páginas do paciente;
- progressão;
- exercícios;
- formato persistido dos planos;
- comportamento de salvamento.

==================================================
ENTREGA
==================================================

Ao terminar apresentar:

1. Arquivos criados.
2. Arquivos alterados.
3. Diff resumido.
4. Prints ou descrição precisa da nova interface.
5. Exemplo visual de:
   - sessão dentro do esperado;
   - sessão acima do esperado;
   - sessão com fadiga alta consecutiva;
   - sessão com planejamento consecutivo.
6. Resultado dos testes novos.
7. Resultado da suíte completa.
8. Confirmação de que o botão de salvar nunca foi bloqueado pelos alertas.
9. Confirmação de que o formato salvo continua sendo o antigo.
10. Limitações desta fase.

Não iniciar automaticamente a Implementação — Fase 3.

Pare e aguarde minha validação.
