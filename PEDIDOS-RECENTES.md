# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 13:36
Vamos encerrar oficialmente a Fase 1.

Aplique apenas os ajustes finais já aprovados e não abra novas frentes de análise sobre esta tela.

==================================================
1. PLANEJAMENTO PROLONGADO
==================================================

Manter o título:

Planejamento prolongado

Alterar a mensagem para que ela complemente o título, sem repetir a mesma expressão.

Usar:

“6 exercícios do plano exigem raciocínio sustentado até a solução.”

O número deve ser dinâmico conforme o plano.

==================================================
2. DEMANDA ELEVADA
==================================================

Evitar repetir a duração duas vezes.

Usar uma única frase:

“12 dos 34 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 40 minutos.”

Os valores devem ser dinâmicos:

- quantidade de exercícios potencialmente fatigantes;
- total de exercícios do plano;
- meta real da sessão.

Não exibir carga numérica, carga basal ou referência interna.

==================================================
3. SOBREPOSIÇÃO DE PROCESSOS
==================================================

Não utilizar títulos artificiais ou categorias que não correspondam claramente a construtos clínicos, por exemplo:

- “Concentração de treino verbal”;
- “Concentração cognitiva” como categoria genérica;
- “Mapeamento cor–resposta semelhante” como se fosse uma classificação clínica formal.

O princípio definitivo é:

Quando vários exercícios recrutarem processos semelhantes, usar a ideia de SOBREPOSIÇÃO DE PROCESSOS.

Quando houver um processo cognitivo principal claramente sustentado pelos exercícios envolvidos, o título pode ser específico.

Exemplos aprovados:

SOBREPOSIÇÃO DE PROCESSOS COGNITIVOS

“Span Numérico Auditivo Direto e Letras em Sequência recrutam processos verbais e de memória operacional semelhantes. Essa concentração pode ser intencional em um plano focal.”

SOBREPOSIÇÃO EM PLANEJAMENTO

“Estacionamento Lógico e Jogo das Torres recrutam processos de planejamento semelhantes. Essa concentração pode ser intencional em um plano focal.”

SOBREPOSIÇÃO EM CONTROLE INIBITÓRIO

“Cores e Palavras e Semáforo recrutam controle inibitório e associações entre estímulo e resposta semelhantes. Essa concentração pode ser intencional em um plano focal.”

Outros títulos específicos só podem ser usados quando houver base clínica clara, por exemplo:

- Sobreposição em memória operacional;
- Sobreposição em atenção seletiva;
- Sobreposição em flexibilidade cognitiva.

Quando não houver um processo principal claramente identificável, utilizar:

Sobreposição de processos cognitivos

A mensagem deve informar:

- quais exercícios estão envolvidos;
- quais processos semelhantes eles recrutam;
- que a concentração pode ser intencional em um plano focal;
- que o terapeuta pode mantê-la conforme o objetivo clínico.

Não inventar novas categorias apenas para produzir um título específico.

==================================================
4. TÍTULOS ANTIGOS ESPECIALIZADOS
==================================================

Não recuperar automaticamente títulos antigos como:

- “Concentração de treino verbal”;
- “Mapeamento cor–resposta semelhante”;
- outras classificações derivadas da lógica interna do motor.

Esses títulos não constituem uma taxonomia clínica aprovada.

A seleção deve seguir somente a regra de sobreposição descrita acima.

==================================================
5. TEXTO MORTO
==================================================

Confirmar se:

“Nada a revisar aqui.”

não é renderizado em nenhum cenário.

Se for código morto, remover.

Manter apenas:

“Nada a revisar neste plano.”

Essa mensagem deve aparecer somente quando realmente não houver nenhum insight clínico.

==================================================
6. PRINCÍPIO DE LINGUAGEM
==================================================

A plataforma deve usar linguagem da Neuropsicologia, não linguagem do software.

Permanecem conceitos clínicos, como:

- memória operacional;
- planejamento;
- atenção seletiva;
- controle inibitório;
- flexibilidade cognitiva;
- fadiga;
- interferência.

Saem termos internos do sistema, como:

- carga basal;
- referência interna;
- janela de planejamento;
- parâmetros;
- heurística;
- regra interna;
- indicador interno.

Não simplificar conceitos clínicos corretos apenas para tornar a linguagem mais popular.

==================================================
7. ENCERRAMENTO DA FASE 1
==================================================

Após aplicar esses ajustes:

- revisar o diff;
- confirmar que validation.ts e o núcleo permanecem intactos;
- rodar TypeScript;
- rodar a suíte completa;
- rodar o build;
- fazer o bump de versão;
- publicar na Vercel;
- confirmar appVersion, buildId, health e commit publicado;
- registrar no PROGRESSO.md.

Depois disso, considerar a Fase 1 oficialmente encerrada e congelada.

Não propor novas melhorias para esta tela.

A próxima etapa será a T1 do framework de tutorial, conforme a arquitetura já aprovada anteriormente.

## 05/08/2026 13:38
<task-notification>
<task-id>b6xeh7fz3</task-id>
<tool-use-id>toolu_01JGcxk7Ww6Jedh16opU6ycZ</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/b6xeh7fz3.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o disparo" completed (exit code 0)</summary>
</task-notification>

## 05/08/2026 13:41
Vamos iniciar oficialmente a T1 do framework de tutorial.

A Fase 1 está encerrada e congelada.

A partir deste ponto, toda a energia do projeto passa para a padronização dos tutoriais.

Objetivo da T1:

- estabelecer um único framework de tutorial para todos os exercícios;
- tutorial exibido apenas na primeira utilização de cada exercício;
- demonstração utilizando exatamente a mesma mecânica do exercício real;
- primeira tentativa guiada;
- nenhuma interferência em nível, progresso, pontuação ou métricas clínicas;
- nenhuma alteração na mecânica dos exercícios nesta etapa.

Todos os exercícios existentes terão seus tutoriais substituídos pelo novo padrão.

Não quero manter ou adaptar os tutoriais atuais. Eles passam a servir apenas como referência de conteúdo quando necessário.

Quero um único padrão de experiência para toda a plataforma.

Como o sistema já está em uso clínico, quero concluir essa padronização antes de voltar a evoluir exercícios individualmente.

Antes de iniciar qualquer implementação, apresente o planejamento completo da T1.

Quero:

1. listar os 34 exercícios;

2. indicar quais possuem características especiais que exigirão adaptações no framework (auditivos, temporizados, contínuos, múltiplas etapas etc.);

3. estimar o esforço de conversão por grupo;

4. propor a ordem de implementação mais segura;

5. dividir a implementação em lotes (T1.1, T1.2, T1.3...), para que cada lote possa ser revisado, testado e publicado sem deixar o sistema inconsistente.

Não quero implementar todos os 34 exercícios em uma única entrega.

Quero um único framework, mas uma implantação incremental.

Após eu aprovar o cronograma, iniciamos imediatamente a implementação da T1.
