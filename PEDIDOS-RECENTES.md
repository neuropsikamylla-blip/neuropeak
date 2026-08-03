# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 03/08/2026 15:43
Escolho a opção (b).

Pode seguir com a Implementação — Fase 2 usando uma camada pura de apresentação em:

lib/prescription/presentation.ts

A decisão é:

- não instalar dependências;
- não alterar package.json;
- não alterar vitest.config.ts;
- não adicionar jsdom, happy-dom ou Testing Library nesta fase;
- não criar infraestrutura nova de testes de componente.

OBJETIVO DA CAMADA DE APRESENTAÇÃO

Centralizar em funções puras:

- tradução dos 18 códigos de alerta para português;
- título e mensagem de cada alerta;
- sugestão de ajuste;
- agrupamento por gravidade consultiva;
- rótulos amigáveis dos modelos de execução;
- rótulos dos estados da sessão;
- formatação da faixa de duração;
- formatação da carga basal e referência heurística;
- resumo de fadiga;
- resumo de interferência;
- marcador de plano legado ou parâmetro indefinido;
- textos auxiliares e tooltips.

Os componentes React deverão apenas consumir os objetos já preparados.

Não duplicar regras ou textos clínicos nos componentes.

TESTES AUTOMÁTICOS

Criar testes puros para:

1. tradução dos 18 alertas;
2. títulos e mensagens em português;
3. gravidade consultiva;
4. rótulos dos quatro modelos de execução;
5. rótulos dos quatro estados de duração;
6. formatação das faixas;
7. carga e referência heurística;
8. resumo de fadiga e interferência;
9. plano vazio;
10. plano legado;
11. ausência de códigos técnicos no conteúdo apresentado;
12. garantia de que todos os 18 alertas possuem configuração de apresentação;
13. garantia de que nenhum alerta possui comportamento bloqueante.

PROTEÇÃO DO BOTÃO SALVAR

Como não há infraestrutura de renderização, criar um teste estático em Node que:

- leia os componentes alterados;
- falhe caso o botão de salvar seja desabilitado com base em:
  - alertas;
  - carga;
  - fadiga;
  - interferência;
  - estado da sessão;
  - resultado do interpretador.

O botão poderá continuar sendo desabilitado por razões técnicas já existentes, como:

- ausência de paciente;
- operação de salvamento em andamento;
- dados obrigatórios ausentes;

mas nunca por causa da arquitetura consultiva.

O teste deve procurar padrões reais no código e ter justificativa clara. Não criar um teste superficial que sempre passe.

COMPONENTES

Os componentes podem ser alterados para consumir:

- interpretPrescriptionPlan;
- presentation.ts;
- leitura legada.

Mas não devem conter:

- fórmulas;
- limiares;
- regras dos alertas;
- traduções duplicadas;
- lógica de carga;
- lógica de fadiga;
- lógica de margem;
- decisões de bloqueio.

VALIDAÇÃO VISUAL

Como não haverá teste automatizado de renderização nesta fase, fazer validação manual documentada:

- abrir a tela do plano;
- testar plano vazio;
- testar plano dentro do esperado;
- testar plano acima do esperado;
- testar excesso importante;
- testar fadiga alta consecutiva;
- testar planejamento consecutivo;
- testar plano legado;
- confirmar que salvar permanece disponível.

Apresentar evidências por:

- prints;
- descrição precisa do estado exibido;
- logs apenas se necessários;
- lista dos cenários verificados.

LIMITAÇÃO REGISTRADA

Registrar explicitamente que:

- a lógica de apresentação está coberta por testes;
- a integração visual foi validada manualmente;
- testes React poderão ser adicionados futuramente quando o projeto adotar infraestrutura própria para componentes;
- a ausência de Testing Library nesta fase não deve ser escondida.

Pode prosseguir imediatamente com a opção (b).

Mantenha todas as outras restrições da Implementação — Fase 2.

Não iniciar automaticamente a Fase 3.
